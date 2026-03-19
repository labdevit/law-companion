import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const DIRECT_REQUEST_MAX_CHARS = 20000;
const FILE_DIRECT_REQUEST_MAX_CHARS = 12000;
const DIRECT_MODEL_MAX_CHARS = 45000;
const CHUNK_TARGET_CHARS = 18000;
const CHUNK_HARD_MAX_CHARS = 24000;
const FINAL_CONTEXT_MAX_CHARS = 90000;

function getDirectRequestLimit(fileName?: string, forceAsync?: boolean) {
  if (forceAsync) return 0;
  return fileName ? FILE_DIRECT_REQUEST_MAX_CHARS : DIRECT_REQUEST_MAX_CHARS;
}

function getSupabase() {
  return createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );
}

function normalizeTextContent(text: string) {
  return text
    .replace(/\u0000/g, "")
    .replace(/\r\n/g, "\n")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{4,}/g, "\n\n\n")
    .trim();
}

function truncateMiddle(text: string, maxChars: number) {
  if (text.length <= maxChars) return text;
  const head = text.slice(0, Math.floor(maxChars * 0.55));
  const tail = text.slice(-Math.floor(maxChars * 0.35));
  return `${head}\n\n[... contenu intermédiaire condensé ...]\n\n${tail}`;
}

function splitOversizedBlock(block: string, maxChars: number) {
  if (block.length <= maxChars) return [block];

  const sentences = block
    .split(/(?<=[.!?])\s+(?=[A-ZÀ-ÿ0-9])/)
    .map((sentence) => sentence.trim())
    .filter(Boolean);

  if (sentences.length <= 1) {
    const slices: string[] = [];
    for (let index = 0; index < block.length; index += maxChars) {
      slices.push(block.slice(index, index + maxChars));
    }
    return slices;
  }

  const parts: string[] = [];
  let current = "";

  for (const sentence of sentences) {
    const candidate = current ? `${current} ${sentence}` : sentence;
    if (candidate.length > maxChars && current) {
      parts.push(current.trim());
      current = sentence;
      continue;
    }

    if (candidate.length > maxChars) {
      for (let index = 0; index < sentence.length; index += maxChars) {
        parts.push(sentence.slice(index, index + maxChars));
      }
      current = "";
      continue;
    }

    current = candidate;
  }

  if (current.trim()) parts.push(current.trim());
  return parts;
}

function splitTextIntoChunks(text: string) {
  const normalized = normalizeTextContent(text);
  const blocks = normalized
    .split(/\n{2,}|(?=Page\s+\d+\b)|(?=Chapitre\s+\d+\b)|(?=Section\s+\d+\b)/i)
    .map((block) => block.trim())
    .filter(Boolean)
    .flatMap((block) => splitOversizedBlock(block, CHUNK_HARD_MAX_CHARS));

  if (!blocks.length) return [truncateMiddle(normalized, DIRECT_MODEL_MAX_CHARS)];

  const chunks: string[] = [];
  let current = "";

  for (const block of blocks) {
    const candidate = current ? `${current}\n\n${block}` : block;
    if (candidate.length > CHUNK_TARGET_CHARS && current) {
      chunks.push(current.trim());
      current = block;
      continue;
    }
    current = candidate;
  }

  if (current.trim()) chunks.push(current.trim());
  return chunks.filter(Boolean);
}

function groupItems<T>(items: T[], size: number) {
  const groups: T[][] = [];
  for (let index = 0; index < items.length; index += size) {
    groups.push(items.slice(index, index + size));
  }
  return groups;
}

function extractJsonFromText(text: string): any {
  try {
    let cleaned = text.replace(/```json\s*/gi, "").replace(/```\s*/g, "").trim();
    const jsonStart = cleaned.search(/[\{\[]/);
    if (jsonStart === -1) return null;
    const endChar = cleaned[jsonStart] === "[" ? "]" : "}";
    const jsonEnd = cleaned.lastIndexOf(endChar);
    if (jsonEnd === -1) return null;
    cleaned = cleaned.substring(jsonStart, jsonEnd + 1);
    try {
      return JSON.parse(cleaned);
    } catch {
      cleaned = cleaned
        .replace(/,\s*}/g, "}")
        .replace(/,\s*]/g, "]")
        .replace(/[\x00-\x1F\x7F]/g, "");
      return JSON.parse(cleaned);
    }
  } catch {
    return null;
  }
}

function extractMessageText(content: unknown) {
  if (typeof content === "string") return content.trim();
  if (Array.isArray(content)) {
    return content
      .map((part) => {
        if (typeof part === "string") return part;
        if (part && typeof part === "object" && "text" in part && typeof part.text === "string") {
          return part.text;
        }
        return "";
      })
      .join("\n")
      .trim();
  }
  return "";
}

function buildToolSchema() {
  return {
    type: "function",
    function: {
      name: "create_structured_course",
      description: "Crée un cours structuré avec chapitres, sections, contenu HTML et quiz",
      parameters: {
        type: "object",
        properties: {
          title: { type: "string", description: "Titre du cours" },
          chapters: {
            type: "array",
            items: {
              type: "object",
              properties: {
                title: { type: "string" },
                sections: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      title: { type: "string" },
                      content: {
                        type: "string",
                        description: "Contenu HTML riche avec surlignage sémantique"
                      },
                      quiz: {
                        type: "array",
                        items: {
                          type: "object",
                          properties: {
                            type: { type: "string", enum: ["mcq", "tf", "short"] },
                            question: { type: "string" },
                            choices: {
                              type: "array",
                              items: { type: "string" },
                              description: "4 choix pour mcq uniquement"
                            },
                            correctAnswer: {
                              description: "index pour mcq, boolean pour tf, array de strings pour short"
                            },
                            explanation: { type: "string" }
                          },
                          required: ["type", "question", "correctAnswer", "explanation"]
                        }
                      }
                    },
                    required: ["title", "content", "quiz"]
                  }
                }
              },
              required: ["title", "sections"]
            }
          }
        },
        required: ["title", "chapters"]
      }
    }
  };
}

const systemPrompt = `Tu es un assistant pédagogique expert. Tu reçois du contenu (texte brut ou document) et tu dois le transformer en un cours structuré au format JSON.

INSTRUCTIONS STRICTES:
1. Analyse le contenu et identifie les thèmes principaux pour créer des chapitres
2. Dans chaque chapitre, crée des sections thématiques cohérentes
3. Pour chaque section, génère du contenu HTML riche avec:
   - Des balises <p> pour les paragraphes
   - Des <ul><li> pour les listes
   - Des <h4> pour les sous-titres
   - Des <span class="hl"> pour les termes juridiques/techniques importants (SURLIGNAGE JAUNE)
   - Des <span class="hlg"> pour les définitions et concepts clés (SURLIGNAGE VERT)
   - Des <span class="hlo"> pour les exceptions et mises en garde (SURLIGNAGE ORANGE)
   - Des <div class="callout"> pour les exemples et remarques importantes
4. Pour chaque section, génère 3-5 questions de quiz variées:
   - "mcq": QCM avec 4 choix, correctAnswer = index (0-3)
   - "tf": Vrai/Faux, correctAnswer = true/false
   - "short": Réponse courte, correctAnswer = tableau de mots-clés attendus
   Chaque question doit avoir une "explanation" détaillée

IMPORTANT: Le contenu HTML doit être RICHE et DÉTAILLÉ, pas juste une copie du texte. Reformule, structure, et enrichis le contenu pédagogiquement.`;

const jsonFallbackPrompt = `Réponds UNIQUEMENT avec un objet JSON valide, sans markdown ni commentaires, avec cette structure exacte:
{
  "title": "string",
  "chapters": [
    {
      "title": "string",
      "sections": [
        {
          "title": "string",
          "content": "string HTML",
          "quiz": [
            {
              "type": "mcq|tf|short",
              "question": "string",
              "choices": ["string", "string", "string", "string"],
              "correctAnswer": 0,
              "explanation": "string"
            }
          ]
        }
      ]
    }
  ]
}`;

async function fetchGateway(apiKey: string, payload: Record<string, unknown>) {
  const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    if (response.status === 429) throw new Error("Trop de requêtes vers l'IA, réessayez dans un instant");
    if (response.status === 402) throw new Error("Crédits IA indisponibles pour le moment");
    const text = await response.text();
    console.error("AI gateway error:", response.status, text);
    throw new Error(`AI gateway error: ${response.status}`);
  }

  return response.json();
}

function extractCourseFromResponse(data: any) {
  let course: any = null;

  const toolCall = data?.choices?.[0]?.message?.tool_calls?.[0];
  if (toolCall?.function?.arguments) {
    course = typeof toolCall.function.arguments === "string"
      ? JSON.parse(toolCall.function.arguments)
      : toolCall.function.arguments;
  }

  if (course?.title && Array.isArray(course?.chapters)) return course;

  const content = extractMessageText(data?.choices?.[0]?.message?.content);
  const extracted = extractJsonFromText(content);
  if (extracted?.title && Array.isArray(extracted?.chapters)) return extracted;

  return null;
}

async function buildStructuredCourse(apiKey: string, userContent: string) {
  const toolResponse = await fetchGateway(apiKey, {
    model: "google/gemini-2.5-pro",
    temperature: 0.2,
    messages: [
      { role: "system", content: `${systemPrompt}\n\nRéponds UNIQUEMENT avec l'appel de fonction, sans texte supplémentaire.` },
      { role: "user", content: userContent },
    ],
    tools: [buildToolSchema()],
    tool_choice: { type: "function", function: { name: "create_structured_course" } },
  });

  const fromTools = extractCourseFromResponse(toolResponse);
  if (fromTools) return fromTools;

  const fallbackResponse = await fetchGateway(apiKey, {
    model: "google/gemini-2.5-pro",
    temperature: 0.2,
    messages: [
      { role: "system", content: `${systemPrompt}\n\n${jsonFallbackPrompt}` },
      { role: "user", content: userContent },
    ],
  });

  return extractCourseFromResponse(fallbackResponse);
}

async function summarizeChunk(apiKey: string, chunk: string, index: number, total: number, fileName?: string) {
  const data = await fetchGateway(apiKey, {
    model: "google/gemini-2.5-flash",
    temperature: 0.2,
    messages: [
      {
        role: "system",
        content: `Tu produis une synthèse intermédiaire fidèle d'un document pédagogique. Réponds en markdown compact avec ces sections: Titre, Idées clés, Définitions/termes, Exemples, Points de vigilance. Ne crée aucune information absente du texte. Garde les détails utiles pour reconstruire un cours.`
      },
      {
        role: "user",
        content: `Bloc ${index + 1}/${total}${fileName ? ` du document "${fileName}"` : ""} :\n\n${chunk}`
      },
    ],
  });

  const summary = extractMessageText(data?.choices?.[0]?.message?.content);
  if (!summary) throw new Error(`Résumé intermédiaire vide pour le bloc ${index + 1}`);
  return `## Bloc ${index + 1}/${total}\n${summary}`;
}

async function mergeSummaryGroup(apiKey: string, summaries: string[], level: number, groupIndex: number, fileName?: string) {
  const data = await fetchGateway(apiKey, {
    model: "google/gemini-2.5-flash",
    temperature: 0.2,
    messages: [
      {
        role: "system",
        content: `Fusionne plusieurs synthèses partielles en une synthèse plus compacte sans perdre la structure, les définitions importantes, les exemples et les points de vigilance. Réponds en markdown clair et dense.`
      },
      {
        role: "user",
        content: `Niveau ${level}, groupe ${groupIndex + 1}${fileName ? ` pour "${fileName}"` : ""} :\n\n${summaries.join("\n\n")}`
      },
    ],
  });

  const merged = extractMessageText(data?.choices?.[0]?.message?.content);
  if (!merged) throw new Error("Impossible de condenser les synthèses intermédiaires");
  return `# Synthèse fusionnée ${level}.${groupIndex + 1}\n${merged}`;
}

async function compressSummaries(
  apiKey: string,
  summaries: string[],
  fileName?: string,
  onProgress?: (progress: number) => Promise<void>
) {
  let current = summaries;
  let level = 1;

  while (current.join("\n\n").length > FINAL_CONTEXT_MAX_CHARS && current.length > 1) {
    const groups = groupItems(current, 4);
    const next: string[] = [];

    for (let groupIndex = 0; groupIndex < groups.length; groupIndex += 1) {
      const merged = await mergeSummaryGroup(apiKey, groups[groupIndex], level, groupIndex, fileName);
      next.push(merged);
      if (onProgress) {
        const progress = 65 + Math.round(((groupIndex + 1) / groups.length) * 15);
        await onProgress(Math.min(progress, 80));
      }
    }

    current = next;
    level += 1;
  }

  return truncateMiddle(current.join("\n\n"), FINAL_CONTEXT_MAX_CHARS);
}

async function processLargeTextContent(
  apiKey: string,
  content: string,
  fileName?: string,
  onProgress?: (progress: number) => Promise<void>
) {
  const chunks = splitTextIntoChunks(content);
  const summaries: string[] = [];

  if (onProgress) await onProgress(10);

  for (let index = 0; index < chunks.length; index += 1) {
    const summary = await summarizeChunk(apiKey, chunks[index], index, chunks.length, fileName);
    summaries.push(summary);
    if (onProgress) {
      const progress = 10 + Math.round(((index + 1) / chunks.length) * 50);
      await onProgress(Math.min(progress, 60));
    }
  }

  if (onProgress) await onProgress(65);
  const compressedSummary = await compressSummaries(apiKey, summaries, fileName, onProgress);

  if (onProgress) await onProgress(85);
  return buildStructuredCourse(
    apiKey,
    `Voici la synthèse hiérarchique d'un document volumineux${fileName ? ` ("${fileName}")` : ""}. Construis le cours complet en t'appuyant uniquement sur cette synthèse fidèle :\n\n${compressedSummary}`
  );
}

async function processTextContent(
  apiKey: string,
  content: string,
  fileName?: string,
  onProgress?: (progress: number) => Promise<void>
) {
  const trimmedContent = normalizeTextContent(content);
  if (!trimmedContent) throw new Error("Le contenu du document est vide");

  if (trimmedContent.length <= DIRECT_MODEL_MAX_CHARS) {
    return buildStructuredCourse(
      apiKey,
      `Voici le contenu${fileName ? ` du document "${fileName}"` : " du cours"} à structurer :\n\n${trimmedContent}`
    );
  }

  return processLargeTextContent(apiKey, trimmedContent, fileName, onProgress);
}

async function updateJob(
  supabase: ReturnType<typeof getSupabase>,
  jobId: string,
  patch: Record<string, unknown>
) {
  await supabase.from("processing_jobs").update(patch).eq("id", jobId);
}

async function processInBackground(jobId: string, body: any) {
  const supabase = getSupabase();
  const lovableApiKey = Deno.env.get("LOVABLE_API_KEY")!;

  try {
    let course: any = null;
    await updateJob(supabase, jobId, { status: "processing", progress: 5, error: null });

    if (body.storagePath) {
      console.log("Processing file from storage:", body.storagePath);

      const { data: fileData, error: dlError } = await supabase.storage
        .from("course-files")
        .download(body.storagePath);

      if (dlError) throw new Error("Impossible de télécharger le fichier");

      const arrayBuffer = await fileData.arrayBuffer();
      const bytes = new Uint8Array(arrayBuffer);
      const fileSizeMB = bytes.length / (1024 * 1024);
      console.log(`File size: ${fileSizeMB.toFixed(2)} MB`);

      const limitedBytes = fileSizeMB > 15 ? bytes.slice(0, 10 * 1024 * 1024) : bytes;
      let binary = "";
      const chunkSize = 8192;
      for (let index = 0; index < limitedBytes.length; index += chunkSize) {
        const chunk = limitedBytes.subarray(index, Math.min(index + chunkSize, limitedBytes.length));
        for (let inner = 0; inner < chunk.length; inner += 1) {
          binary += String.fromCharCode(chunk[inner]);
        }
      }

      await updateJob(supabase, jobId, { progress: 35 });
      const base64 = btoa(binary);
      const mimeType = body.fileType || "application/pdf";
      course = await buildStructuredCourse(
        lovableApiKey,
        `Analyse ce document ${body.fileName ? `"${body.fileName}"` : ""}. ${fileSizeMB > 15 ? "Le document a été tronqué à sa partie initiale pour respecter les limites techniques. " : ""}Appuie-toi sur le contenu fourni pour construire un cours structuré.\n\n[data:${mimeType};base64,${base64}]`
      );

      await supabase.storage.from("course-files").remove([body.storagePath]);
    } else if (body.file?.base64) {
      await updateJob(supabase, jobId, { progress: 35 });
      const mimeType = body.file.type || "application/pdf";
      course = await buildStructuredCourse(
        lovableApiKey,
        `Analyse ce document "${body.file.name}" et transforme-le en cours structuré.\n\n[data:${mimeType};base64,${body.file.base64}]`
      );
    } else if (body.content) {
      course = await processTextContent(lovableApiKey, body.content, body.fileName, async (progress) => {
        await updateJob(supabase, jobId, { progress });
      });
    }

    if (!course) throw new Error("L'IA n'a pas renvoyé de structure exploitable");

    await updateJob(supabase, jobId, { status: "complete", progress: 100, result: course, error: null });
    console.log("Job completed:", jobId);
  } catch (error) {
    console.error("Background processing error:", error);
    const message = error instanceof Error ? error.message : "Erreur inconnue";
    await updateJob(supabase, jobId, { status: "failed", error: message });
  }
}

async function selfInvokeForBackground(jobId: string, body: any) {
  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY");
  const supabase = getSupabase();

  if (!supabaseUrl || !anonKey) {
    await updateJob(supabase, jobId, {
      status: "failed",
      error: "Configuration serveur manquante",
    });
    return;
  }

  try {
    // Fire a second invocation that will await the heavy work with full wall-clock budget
    fetch(`${supabaseUrl}/functions/v1/process-course`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${anonKey}`,
        apikey: anonKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ _background: true, _jobId: jobId, content: body.content, fileName: body.fileName }),
    }).catch((err) => {
      console.error("Self-invoke fetch error (may be expected):", err);
    });

    // Small delay to ensure the request is dispatched
    await new Promise((r) => setTimeout(r, 300));
  } catch (error) {
    console.error("Self-invoke error:", error);
  }
}

async function createProcessingJob(body: any) {
  const supabase = getSupabase();
  const { data: job, error } = await supabase
    .from("processing_jobs")
    .insert({ status: "queued", progress: 0, error: null })
    .select()
    .single();

  if (error || !job) throw new Error("Failed to create processing job");

  // @ts-ignore - EdgeRuntime is available in Supabase Edge Functions
  EdgeRuntime.waitUntil(selfInvokeForBackground(job.id, body));
  return job.id;
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const body = await req.json();

    const lovableApiKey = Deno.env.get("LOVABLE_API_KEY");
    if (!lovableApiKey) throw new Error("LOVABLE_API_KEY is not configured");

    // ── BACKGROUND WORKER PATH ──
    // Second invocation: awaits the heavy processing with full wall-clock time
    if (body._background && body._jobId) {
      console.log("Background worker started for job:", body._jobId);
      await processInBackground(body._jobId, body);
      console.log("Background worker finished for job:", body._jobId);
      return new Response(JSON.stringify({ done: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ── NORMAL REQUEST PATH ──
    const { content, file, storagePath, fileName, forceAsync } = body;

    if ((!content || typeof content !== "string") && !file && !storagePath) {
      return new Response(JSON.stringify({ error: "Le champ 'content', 'file' ou 'storagePath' est requis" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (content && typeof content === "string" && !file && !storagePath) {
      const normalizedContent = normalizeTextContent(content);
      const directRequestLimit = getDirectRequestLimit(fileName, forceAsync);

      // Small text → synchronous
      if (normalizedContent.length <= directRequestLimit) {
        const course = await processTextContent(lovableApiKey, normalizedContent, fileName);
        if (!course) throw new Error("L'IA n'a pas renvoyé de structure exploitable");

        return new Response(JSON.stringify({ result: course }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Large text → async job
      const newJobId = await createProcessingJob({ content: normalizedContent, fileName });
      return new Response(JSON.stringify({ job_id: newJobId }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const newJobId = await createProcessingJob(body);
    return new Response(JSON.stringify({ job_id: newJobId }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("process-course error:", error);
    const message = error instanceof Error ? error.message : "Erreur inconnue";
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

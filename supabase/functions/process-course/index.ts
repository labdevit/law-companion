import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

function getSupabase() {
  return createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );
}

function extractJsonFromText(text: string): any {
  try {
    let cleaned = text.replace(/```json\s*/gi, "").replace(/```\s*/g, "").trim();
    const jsonStart = cleaned.search(/[\{\[]/);
    if (jsonStart === -1) return null;
    const endChar = cleaned[jsonStart] === '[' ? ']' : '}';
    const jsonEnd = cleaned.lastIndexOf(endChar);
    if (jsonEnd === -1) return null;
    cleaned = cleaned.substring(jsonStart, jsonEnd + 1);
    try { return JSON.parse(cleaned); } catch {
      cleaned = cleaned.replace(/,\s*}/g, "}").replace(/,\s*]/g, "]").replace(/[\x00-\x1F\x7F]/g, "");
      return JSON.parse(cleaned);
    }
  } catch { return null; }
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
                      content: { type: "string", description: "Contenu HTML riche avec surlignage sémantique" },
                      quiz: {
                        type: "array",
                        items: {
                          type: "object",
                          properties: {
                            type: { type: "string", enum: ["mcq", "tf", "short"] },
                            question: { type: "string" },
                            choices: { type: "array", items: { type: "string" }, description: "4 choix pour mcq uniquement" },
                            correctAnswer: { description: "index pour mcq, boolean pour tf, array de strings pour short" },
                            explanation: { type: "string" },
                          },
                          required: ["type", "question", "correctAnswer", "explanation"],
                        },
                      },
                    },
                    required: ["title", "content", "quiz"],
                  },
                },
              },
              required: ["title", "sections"],
            },
          },
        },
        required: ["title", "chapters"],
      },
    },
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

IMPORTANT: Le contenu HTML doit être RICHE et DÉTAILLÉ, pas juste une copie du texte. Reformule, structure, et enrichis le contenu pédagogiquement.

Réponds UNIQUEMENT avec l'appel de fonction, sans texte supplémentaire.`;

async function callAI(apiKey: string, userContent: any) {
  const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "google/gemini-2.5-flash",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userContent },
      ],
      tools: [buildToolSchema()],
      tool_choice: { type: "function", function: { name: "create_structured_course" } },
    }),
  });

  if (!response.ok) {
    if (response.status === 429) throw new Error("RATE_LIMIT");
    if (response.status === 402) throw new Error("NO_CREDITS");
    const t = await response.text();
    console.error("AI gateway error:", response.status, t);
    throw new Error(`AI gateway error: ${response.status}`);
  }

  const data = await response.json();
  let course: any = null;

  const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
  if (toolCall?.function?.arguments) {
    course = typeof toolCall.function.arguments === "string"
      ? JSON.parse(toolCall.function.arguments)
      : toolCall.function.arguments;
  }

  if (!course) {
    const content = data.choices?.[0]?.message?.content || "";
    const extracted = extractJsonFromText(content);
    if (extracted?.title && extracted?.chapters) course = extracted;
  }

  return course;
}

// Background processing function
async function processInBackground(jobId: string, body: any) {
  const supabase = getSupabase();
  const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY")!;

  try {
    let course: any = null;

    if (body.storagePath) {
      console.log("Processing file from storage:", body.storagePath);

      // Download file as stream to reduce memory
      const { data: fileData, error: dlError } = await supabase.storage
        .from("course-files")
        .download(body.storagePath);

      if (dlError) throw new Error("Impossible de télécharger le fichier");

      // Convert to base64 in chunks to reduce peak memory
      const arrayBuffer = await fileData.arrayBuffer();
      const bytes = new Uint8Array(arrayBuffer);
      
      // Check size - if too large for base64 in memory, extract text summary
      const fileSizeMB = bytes.length / (1024 * 1024);
      console.log(`File size: ${fileSizeMB.toFixed(2)} MB`);

      if (fileSizeMB > 15) {
        // For very large files, send only first ~10MB to AI
        const maxBytes = 10 * 1024 * 1024;
        const truncatedBytes = bytes.slice(0, maxBytes);
        const chunkSize = 8192;
        let binary = "";
        for (let i = 0; i < truncatedBytes.length; i += chunkSize) {
          const chunk = truncatedBytes.subarray(i, Math.min(i + chunkSize, truncatedBytes.length));
          for (let j = 0; j < chunk.length; j++) {
            binary += String.fromCharCode(chunk[j]);
          }
        }
        const base64 = btoa(binary);
        const mimeType = body.fileType || "application/pdf";

        course = await callAI(LOVABLE_API_KEY, [
          {
            type: "text",
            text: `Voici un document volumineux "${body.fileName}" (${fileSizeMB.toFixed(0)} MB, tronqué aux premiers ${(maxBytes/1024/1024).toFixed(0)} MB). Structure-le en un cours complet.`,
          },
          {
            type: "image_url",
            image_url: { url: `data:${mimeType};base64,${base64}` },
          },
        ]);
      } else {
        // Normal size - send full file
        const chunkSize = 8192;
        let binary = "";
        for (let i = 0; i < bytes.length; i += chunkSize) {
          const chunk = bytes.subarray(i, Math.min(i + chunkSize, bytes.length));
          for (let j = 0; j < chunk.length; j++) {
            binary += String.fromCharCode(chunk[j]);
          }
        }
        const base64 = btoa(binary);
        const mimeType = body.fileType || "application/pdf";

        course = await callAI(LOVABLE_API_KEY, [
          {
            type: "text",
            text: `Voici un document "${body.fileName}" à transformer en cours structuré. Analyse TOUT le contenu du document.`,
          },
          {
            type: "image_url",
            image_url: { url: `data:${mimeType};base64,${base64}` },
          },
        ]);
      }

      // Clean up storage
      await supabase.storage.from("course-files").remove([body.storagePath]);

    } else if (body.file?.base64) {
      const mimeType = body.file.type || "application/pdf";
      course = await callAI(LOVABLE_API_KEY, [
        {
          type: "text",
          text: `Voici un document "${body.file.name}" à transformer en cours structuré.`,
        },
        {
          type: "image_url",
          image_url: { url: `data:${mimeType};base64,${body.file.base64}` },
        },
      ]);
    } else if (body.content) {
      const content = body.content;
      const CHUNK_SIZE = 60000;
      if (content.length <= CHUNK_SIZE) {
        course = await callAI(LOVABLE_API_KEY, `Voici le contenu du cours à structurer:\n\n${content}`);
      } else {
        const condensed = content.length > 80000
          ? content.substring(0, 60000) + "\n\n[... section intermédiaire omise ...]\n\n" + content.substring(content.length - 20000)
          : content;
        course = await callAI(LOVABLE_API_KEY, `Voici un document volumineux (${content.length} caractères). Structure-le en un cours complet.\n\nCONTENU:\n${condensed}`);
      }
    }

    if (!course) throw new Error("No structured output from AI");

    // Save result
    await supabase
      .from("processing_jobs")
      .update({ status: "complete", progress: 100, result: course })
      .eq("id", jobId);

    console.log("Job completed:", jobId);
  } catch (error) {
    console.error("Background processing error:", error);
    const msg = error instanceof Error ? error.message : "Erreur inconnue";
    await supabase
      .from("processing_jobs")
      .update({ status: "failed", error: msg })
      .eq("id", jobId);
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const body = await req.json();
    const { content, file, storagePath } = body;

    if ((!content || typeof content !== "string") && !file && !storagePath) {
      return new Response(JSON.stringify({ error: "Le champ 'content', 'file' ou 'storagePath' est requis" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!Deno.env.get("LOVABLE_API_KEY")) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const supabase = getSupabase();

    // Create a job record
    const { data: job, error: jobError } = await supabase
      .from("processing_jobs")
      .insert({ status: "processing", progress: 0 })
      .select()
      .single();

    if (jobError || !job) throw new Error("Failed to create processing job");

    // Start background processing (non-blocking)
    // @ts-ignore - EdgeRuntime is available in Supabase Edge Functions
    EdgeRuntime.waitUntil(processInBackground(job.id, body));

    // Return immediately with job ID
    return new Response(JSON.stringify({ job_id: job.id }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (e) {
    console.error("process-course error:", e);
    const msg = e instanceof Error ? e.message : "Erreur inconnue";
    return new Response(
      JSON.stringify({ error: msg }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

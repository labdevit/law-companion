import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

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
      model: "google/gemini-2.5-pro",
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
    console.log("No tool_call, trying content fallback. Content length:", content.length);
    const extracted = extractJsonFromText(content);
    if (extracted?.title && extracted?.chapters) course = extracted;
  }

  return course;
}

async function processChunkedText(apiKey: string, content: string) {
  const CHUNK_SIZE = 60000;

  // If content fits in one request, just send it
  if (content.length <= CHUNK_SIZE) {
    return await callAI(apiKey, `Voici le contenu du cours à structurer:\n\n${content}`);
  }

  // Split into chunks and process each as a "part"
  const chunks: string[] = [];
  for (let i = 0; i < content.length; i += CHUNK_SIZE) {
    chunks.push(content.substring(i, i + CHUNK_SIZE));
  }

  console.log(`Processing ${chunks.length} chunks of ~${CHUNK_SIZE} chars each`);

  // Process all chunks together by sending a summary request
  // We'll send the first 60k + last 20k to capture beginning and end
  const condensed = content.length > 80000
    ? content.substring(0, 60000) + "\n\n[... section intermédiaire omise ...]\n\n" + content.substring(content.length - 20000)
    : content;

  const course = await callAI(apiKey, `Voici un document volumineux (${content.length} caractères au total). Structure-le en un cours complet avec chapitres, sections, contenu HTML riche et quiz.\n\nCONTENU:\n${condensed}`);

  return course;
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

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    let course: any = null;

    // Case 1: File uploaded to storage
    if (storagePath) {
      console.log("Processing file from storage:", storagePath);
      
      const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
      const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
      const supabase = createClient(supabaseUrl, supabaseKey);

      const { data: fileData, error: dlError } = await supabase.storage
        .from("course-files")
        .download(storagePath);

      if (dlError) {
        console.error("Storage download error:", dlError);
        throw new Error("Impossible de télécharger le fichier");
      }

      // Convert blob to base64
      const arrayBuffer = await fileData.arrayBuffer();
      const bytes = new Uint8Array(arrayBuffer);
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
      const fileName = body.fileName || "document";

      console.log(`File downloaded: ${(arrayBuffer.byteLength / 1024 / 1024).toFixed(2)} MB, sending to AI as ${mimeType}`);

      course = await callAI(LOVABLE_API_KEY, [
        {
          type: "text",
          text: `Voici un document "${fileName}" à transformer en cours structuré. Analyse TOUT le contenu du document et structure-le en chapitres, sections avec contenu HTML riche et quiz.`,
        },
        {
          type: "image_url",
          image_url: { url: `data:${mimeType};base64,${base64}` },
        },
      ]);

      // Clean up storage file after processing
      await supabase.storage.from("course-files").remove([storagePath]);
    }
    // Case 2: Base64 file sent directly (small files, backward compat)
    else if (file && file.base64) {
      const mimeType = file.type || "application/pdf";
      course = await callAI(LOVABLE_API_KEY, [
        {
          type: "text",
          text: `Voici un document "${file.name}" à transformer en cours structuré. Analyse tout le contenu du document et structure-le en chapitres, sections avec contenu HTML riche et quiz.`,
        },
        {
          type: "image_url",
          image_url: { url: `data:${mimeType};base64,${file.base64}` },
        },
      ]);
    }
    // Case 3: Text content (with chunking for large text)
    else if (content) {
      course = await processChunkedText(LOVABLE_API_KEY, content);
    }

    if (!course) {
      throw new Error("No structured output from AI");
    }

    return new Response(JSON.stringify({ course }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("process-course error:", e);
    const msg = e instanceof Error ? e.message : "Erreur inconnue";
    if (msg === "RATE_LIMIT") {
      return new Response(JSON.stringify({ error: "Trop de requêtes. Réessayez dans quelques instants." }), {
        status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (msg === "NO_CREDITS") {
      return new Response(JSON.stringify({ error: "Crédits IA insuffisants." }), {
        status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    return new Response(
      JSON.stringify({ error: msg }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

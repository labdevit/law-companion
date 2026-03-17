import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { content } = await req.json();
    if (!content || typeof content !== "string") {
      return new Response(JSON.stringify({ error: "Le champ 'content' est requis" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    // Truncate content if too long (keep first ~15000 chars)
    const truncated = content.length > 15000 ? content.substring(0, 15000) + "\n[... contenu tronqué]" : content;

    const systemPrompt = `Tu es un assistant pédagogique expert. Tu reçois du texte brut (cours, notes, résumés) et tu dois le transformer en un cours structuré au format JSON.

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

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: `Voici le contenu du cours à structurer:\n\n${truncated}` },
        ],
        tools: [
          {
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
          },
        ],
        tool_choice: { type: "function", function: { name: "create_structured_course" } },
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Trop de requêtes. Réessayez dans quelques instants." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Crédits IA insuffisants." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];

    if (!toolCall?.function?.arguments) {
      throw new Error("No structured output from AI");
    }

    const course = typeof toolCall.function.arguments === "string"
      ? JSON.parse(toolCall.function.arguments)
      : toolCall.function.arguments;

    return new Response(JSON.stringify({ course }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("process-course error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Erreur inconnue" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { question, courseContent, courseTitle, history, file } = await req.json();

    if (!question && !file) {
      return new Response(JSON.stringify({ error: "Un message ou un fichier est requis" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    // Truncate course content
    const truncatedContent = courseContent && courseContent.length > 12000
      ? courseContent.substring(0, 12000) + "\n[... contenu tronqué]"
      : courseContent || "";

    const systemPrompt = `Tu es un prof particulier direct et efficace. Ton étudiant te pose des questions sur son cours.

COURS: "${courseTitle || "Cours"}"
CONTENU:
${truncatedContent}

RÈGLES STRICTES:
1. Va DROIT AU BUT. Pas de "Excellente question !", pas de "C'est un sujet fascinant", pas de flatteries.
2. Réponds en 2-5 phrases MAX sauf si l'étudiant demande explicitement plus de détails.
3. Structure : donne la réponse clé d'abord, puis un exemple court si utile.
4. Utilise le gras **uniquement** pour les termes techniques importants.
5. Si c'est une définition → 1 phrase claire + 1 exemple.
6. Si c'est une explication → le concept en 2-3 phrases simples.
7. Si c'est un résumé → liste à puces des points essentiels, rien d'autre.
8. Ne répète JAMAIS la question de l'étudiant dans ta réponse.
9. Parle comme un vrai prof : naturel, direct, parfois un "en gros" ou "concrètement" mais jamais de bavardage inutile.
10. Base-toi sur le contenu du cours fourni ET sur les documents joints par l'étudiant.
11. Si un document est joint, analyse-le et intègre son contenu dans tes réponses.`;

    const messages: Array<{ role: string; content: any }> = [
      { role: "system", content: systemPrompt },
    ];

    // Add conversation history (last 10 messages max)
    if (history && Array.isArray(history)) {
      const recentHistory = history.slice(-10);
      for (const msg of recentHistory) {
        messages.push({ role: msg.role, content: msg.content });
      }
    }

    // Build user message - multimodal if file attached
    if (file && file.base64) {
      const mimeType = file.type || "application/pdf";
      const userContent: any[] = [];

      if (question) {
        userContent.push({ type: "text", text: question });
      } else {
        userContent.push({ type: "text", text: `Analyse ce document : ${file.name || "document"}` });
      }

      userContent.push({
        type: "image_url",
        image_url: {
          url: `data:${mimeType};base64,${file.base64}`,
        },
      });

      messages.push({ role: "user", content: userContent });
    } else {
      messages.push({ role: "user", content: question });
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages,
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Trop de requêtes, réessayez dans quelques instants." }), {
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

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("course-qa error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Erreur inconnue" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

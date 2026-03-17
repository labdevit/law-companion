import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { question, courseContent, courseTitle, history } = await req.json();

    if (!question || !courseContent) {
      return new Response(JSON.stringify({ error: "Les champs 'question' et 'courseContent' sont requis" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    // Truncate course content
    const truncatedContent = courseContent.length > 12000
      ? courseContent.substring(0, 12000) + "\n[... contenu tronqué]"
      : courseContent;

    const systemPrompt = `Tu es un tuteur pédagogique intelligent et bienveillant. Tu aides les étudiants à comprendre leur cours.

CONTEXTE DU COURS:
Titre: ${courseTitle || "Cours"}
Contenu:
${truncatedContent}

INSTRUCTIONS:
- Réponds aux questions en te basant UNIQUEMENT sur le contenu du cours fourni
- Sois clair, pédagogique et structuré dans tes réponses
- Utilise des exemples concrets quand c'est possible
- Si la question n'est pas liée au cours, dis-le poliment et redirige vers le contenu du cours
- Utilise le markdown pour formatter tes réponses (gras, listes, etc.)
- Sois concis mais complet
- Si l'étudiant semble avoir du mal, encourage-le`;

    const messages: Array<{ role: string; content: string }> = [
      { role: "system", content: systemPrompt },
    ];

    // Add conversation history (last 10 messages max)
    if (history && Array.isArray(history)) {
      const recentHistory = history.slice(-10);
      for (const msg of recentHistory) {
        messages.push({ role: msg.role, content: msg.content });
      }
    }

    messages.push({ role: "user", content: question });

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
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

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

    if (!question) {
      return new Response(JSON.stringify({ error: "Une question est requise" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const truncatedContent = courseContent && courseContent.length > 15000
      ? courseContent.substring(0, 15000) + "\n[... contenu tronqué]"
      : courseContent || "";

    const contextBlock = truncatedContent
      ? `\nCONTEXTE DU COURS "${courseTitle || "Cours"}":\n${truncatedContent}\n`
      : "";

    const systemPrompt = `Tu es un professeur expert qui explique sur un TABLEAU BLANC interactif. Tu décomposes chaque sujet visuellement, étape par étape, comme un vrai prof au tableau.

${contextBlock}

STRUCTURE OBLIGATOIRE de ta réponse (utilise UNIQUEMENT les sections pertinentes) :

## 📐 Concept
Explication claire du concept théorique. Utilise des analogies simples et concrètes.

## 🔢 Formule / Règle
Les formules mathématiques, règles juridiques ou principes clés. Présente-les clairement.

## 💡 Exemple Concret
Un exemple DÉTAILLÉ et RÉALISTE, étape par étape, avec des vrais chiffres si applicable.
Pour la comptabilité/finance : utilise des tableaux markdown.

## ✍️ Exercice
Un exercice pratique que l'étudiant peut résoudre. Donne les données clairement.

## ✅ Solution
La solution COMPLÈTE de l'exercice, avec CHAQUE étape détaillée et expliquée.

RÈGLES STRICTES:
1. Montre CHAQUE étape de calcul, ne saute jamais une étape
2. Utilise des tableaux markdown pour les données financières, comptables, bilans
3. Mets en **gras** les termes importants et les résultats
4. Utilise des analogies du quotidien pour les concepts abstraits
5. Pour les exercices, utilise des montants et noms réalistes (entreprises africaines, contexte OHADA, etc.)
6. Si la question porte sur un concept simple, n'inclus que Concept + Exemple
7. Si c'est un exercice, inclus toutes les sections pertinentes
8. Parle de manière directe, professionnelle mais accessible
9. N'utilise PAS de flatteries ("Excellente question" etc.)
10. Pour les formules, écris-les en texte clair (pas de LaTeX)
11. Si l'étudiant pose une question de suivi sur un sujet déjà abordé, approfondis ou clarifie sans tout répéter. Fais référence à ce qui a déjà été expliqué.
12. Pour les questions de suivi courtes (clarification, "et si...", "pourquoi..."), adapte le format : pas besoin de toutes les sections, réponds de manière ciblée.`;

    // Build messages array with conversation history
    const messages: Array<{ role: string; content: string }> = [
      { role: "system", content: systemPrompt },
    ];

    // Add conversation history (limit to last 10 exchanges to manage token usage)
    if (history && Array.isArray(history)) {
      const recentHistory = history.slice(-10);
      for (const entry of recentHistory) {
        messages.push({ role: "user", content: entry.question });
        if (entry.response) {
          messages.push({ role: "assistant", content: entry.response });
        }
      }
    }

    // Add current question
    messages.push({ role: "user", content: question });

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
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Crédits IA insuffisants." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
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
    console.error("ai-tutor error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Erreur inconnue" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

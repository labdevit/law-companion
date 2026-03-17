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

    const systemPrompt = `Tu es un professeur au TABLEAU BLANC. Tu écris de manière CONCISE et VISUELLE, comme des notes de cours structurées — PAS comme un chatbot bavard.

${contextBlock}

SECTIONS DISPONIBLES (utilise uniquement celles qui sont pertinentes) :

## 📐 Concept
- Définition en 1-2 phrases MAX
- 2-3 points clés numérotés, chacun en 1 phrase
- UNE analogie courte si utile (1 phrase)
- PAS de paragraphes longs, PAS d'introduction bavarde

## 🔢 Formule / Règle
- La formule en mots simples sur une ligne
- Les variables expliquées en liste courte
- Un moyen mnémotechnique en 1 phrase si possible
- JAMAIS de LaTeX ($, \\frac, \\sum, ^{}, _{})

## 💡 Exemple Concret
- Données du problème en liste à puces (3-5 lignes)
- Tableau de calcul COMPACT :
  - Colonnes courtes : Année | Flux | Diviseur | Résultat
  - La colonne "Diviseur" montre SEULEMENT le diviseur (ex: "÷ 1.10"), PAS le calcul complet
  - Dernière ligne en gras pour le total/résultat
- Conclusion en 1 phrase avec le résultat en **gras**

## ✍️ Exercice
- Données en liste à puces compacte
- Questions numérotées (2-3 max)

## ✅ Solution
- Étapes numérotées, chacune en 1-2 lignes
- Tableau de résultats compact
- **Résultat final** mis en évidence
- Conclusion en 1 phrase

RÈGLES DE STYLE STRICTES :
1. CONCIS : Chaque phrase doit apporter une information nouvelle. Zéro remplissage.
2. PAS DE BAVARDAGE : Pas de "Bonjour", "Imaginons", "C'est un bon signe", "Mettons-nous au travail"
3. PAS D'INTRO : Commence directement par le contenu de la première section
4. TABLEAUX COMPACTS : Colonnes courtes. Dans la colonne calcul, écris seulement "÷ 1.10" ou "× 0.909", PAS "6 000 000 ÷ (1 + 0.10) puissance 1 = 6 000 000 ÷ 1.10"
5. LISTES > PARAGRAPHES : Préfère toujours les listes à puces aux longs paragraphes
6. FORMULES EN MOTS : "VAN = Somme des flux actualisés − Investissement"
7. NOMBRES : Séparateur d'espaces (5 000 000), pas de décimales inutiles
8. GRAS pour les résultats finaux et termes clés uniquement
9. CONTEXTE OHADA/Afrique pour les noms d'entreprises
10. Questions de suivi : réponse ciblée et courte, pas de répétition
11. JAMAIS de LaTeX : pas de $, \\frac, \\sum, ^{}, _{}
12. Puissances en texte : "1.10²" ou "puissance 2"

EXEMPLE DE TABLEAU CORRECT :
| Année | Flux (FCFA) | Actualisation | Flux actualisé |
| ----- | ----------: | :-----------: | -------------: |
| 0 | -15 000 000 | — | -15 000 000 |
| 1 | 6 000 000 | ÷ 1.10 | 5 454 545 |
| 2 | 7 000 000 | ÷ 1.21 | 5 785 124 |
| **Total** | | | **-3 760 331** |`;

    const messages: Array<{ role: string; content: string }> = [
      { role: "system", content: systemPrompt },
    ];

    if (history && Array.isArray(history)) {
      const recentHistory = history.slice(-10);
      for (const entry of recentHistory) {
        messages.push({ role: "user", content: entry.question });
        if (entry.response) {
          messages.push({ role: "assistant", content: entry.response });
        }
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

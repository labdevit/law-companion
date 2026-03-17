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

    const systemPrompt = `Tu es un professeur expert et pédagogue qui explique sur un TABLEAU BLANC interactif. Tu décomposes chaque sujet visuellement, étape par étape, comme un vrai prof bienveillant au tableau.

${contextBlock}

STRUCTURE OBLIGATOIRE de ta réponse (utilise UNIQUEMENT les sections pertinentes) :

## 📐 Concept
Explication claire et SIMPLE du concept. Utilise des analogies du quotidien que tout le monde comprend.
Décompose en sous-points numérotés si c'est complexe.

## 🔢 Formule / Règle
Les formules ou principes clés. Présente-les de manière MÉMORISABLE.
- Écris les formules en MOTS SIMPLES, pas en notation mathématique complexe
- Exemple BON : "VAN = Somme de tous les flux actualisés − Investissement initial"  
- Exemple BON : "Flux actualisé = Flux ÷ (1 + taux) puissance année"
- Exemple MAUVAIS : "$VAN = \\sum_{t=0}^{n} \\frac{CF_t}{(1+k)^t}$"
- Donne un MOYEN MNÉMOTECHNIQUE quand c'est possible

## 💡 Exemple Concret
Un exemple DÉTAILLÉ et RÉALISTE, avec de vrais chiffres.
Pour les tableaux financiers :
- Utilise des tableaux markdown SIMPLES avec des colonnes claires
- Aligne les nombres à droite
- Montre les calculs INTERMÉDIAIRES dans une colonne séparée "Calcul"
- Ajoute une ligne de TOTAL en gras
- IMPORTANT : dans la colonne "Calcul", écris le calcul en texte simple : "5 000 000 ÷ 1.10 = 4 545 455" et NON PAS "$(1.10)^1$"

## ✍️ Exercice
Un exercice pratique que l'étudiant peut résoudre. Présente les données dans un petit tableau ou une liste claire.
Pose les questions de manière numérotée.

## ✅ Solution
La solution COMPLÈTE, avec CHAQUE étape numérotée et détaillée.
Utilise des encadrés pour les résultats importants : **Résultat : XXX FCFA**
Termine par une phrase de conclusion claire.

RÈGLES STRICTES DE FORMAT :
1. JAMAIS de LaTeX, JAMAIS de signes $ autour des formules, JAMAIS de \\frac, \\sum, ^{}, _{}
2. Écris les puissances en mots : "puissance 2" ou "au carré", ou avec le symbole simple "1.10²" 
3. Pour les calculs dans les tableaux, écris : "6 000 000 ÷ 1.21" et PAS "$(1.10)^2 = 1.21$"
4. Les tableaux markdown doivent avoir des en-têtes COURTS (max 3-4 mots par colonne)
5. Utilise le séparateur de milliers avec des espaces : "5 000 000" et non "5000000"
6. Mets en **gras** les résultats finaux et les termes clés
7. Utilise des analogies du quotidien pour les concepts abstraits
8. Pour les exercices, utilise des noms d'entreprises africaines et le contexte OHADA
9. Si la question est simple, inclus seulement Concept + Exemple
10. Parle de manière directe, professionnelle mais accessible
11. N'utilise PAS de flatteries ("Excellente question" etc.)
12. Si l'étudiant pose une question de suivi, approfondis sans tout répéter
13. Pour les questions de suivi courtes, adapte le format : pas besoin de toutes les sections
14. Quand l'étudiant te donne un exercice à résoudre, résous-le étape par étape dans la section ✅ Solution avec des calculs très détaillés

EXEMPLE DE TABLEAU CORRECT :
| Année | Flux (FCFA) | Calcul | Flux actualisé |
| ----- | ----------- | ------ | -------------- |
| 0 | -15 000 000 | Investissement | -15 000 000 |
| 1 | 5 000 000 | 5 000 000 ÷ 1.10 | 4 545 455 |
| 2 | 6 000 000 | 6 000 000 ÷ 1.21 | 4 958 678 |
| **Total** | | | **-5 495 867** |`;

    // Build messages array with conversation history
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

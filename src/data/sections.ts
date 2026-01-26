export interface QuizQuestion {
  type: "mcq" | "tf" | "short";
  q: string;
  choices?: string[];
  answer?: number;
  answerTF?: boolean;
  answerText?: string[];
  explain: string;
}

export interface Section {
  id: string;
  subject: string;
  group: string;
  title: string;
  desc: string;
  tags: string[];
  content: string;
  quiz: QuizQuestion[];
}

export const SECTIONS: Section[] = [
  // =========================
  // 📚 DROIT PÉNAL DES AFFAIRES
  // =========================
  {
    id: "dp_affaires_intro",
    subject: "Droit pénal des affaires",
    group: "Droit pénal des affaires",
    title: "Intro + éléments de l'infraction",
    desc: "Élément légal, matériel, moral + tentative.",
    tags: ["cours", "quiz"],
    content: `
      <p>
        Le <span class="hl">droit pénal des affaires</span> vise les infractions qui touchent la <span class="hlg">vie économique</span>
        (entreprises, sociétés, banques). Il protège la <span class="hlg">confiance</span> et la sécurité des échanges.
      </p>
      <p>
        Pour qu'il y ait infraction punissable, il faut réunir :
        <span class="hl">l'élément légal</span> (pas d'infraction sans texte),
        <span class="hl">l'élément matériel</span> (fait extérieur) et
        <span class="hl">l'élément moral</span> (intention ou faute).
      </p>
      <div class="callout"><b>Réflexe examen :</b> commence toujours par vérifier <span class="hl">le texte</span> puis les <span class="hlg">3 éléments</span>.</div>
      <h4>La tentative</h4>
      <p>
        La <span class="hl">tentative</span> suppose un <span class="hlg">commencement d'exécution</span> et l'absence de
        <span class="hlg">désistement volontaire</span>. L'acte préparatoire est souvent <span class="hlo">équivoque</span>.
      </p>
    `,
    quiz: [
      {
        type: "mcq",
        q: "Quels sont les 3 éléments de l'infraction ?",
        choices: ["Légal, matériel, moral", "Civil, commercial, fiscal", "Auteur, victime, juge", "Texte, dommage, contrat"],
        answer: 0,
        explain: "Toujours : élément légal + matériel + moral."
      },
      {
        type: "tf",
        q: "Vrai ou Faux : un acte préparatoire est toujours punissable.",
        answerTF: false,
        explain: "Faux. L'acte préparatoire est en principe non punissable car équivoque."
      },
      {
        type: "short",
        q: "Donne les 2 conditions de la tentative punissable.",
        answerText: ["commencement d'exécution", "absence de désistement volontaire"],
        explain: "Commencement d'exécution + absence de désistement volontaire."
      }
    ]
  },

  {
    id: "dp_affaires_abus_confiance",
    subject: "Droit pénal des affaires",
    group: "Droit pénal des affaires",
    title: "Abus de confiance (Art. 383-384 CP)",
    desc: "Remise honnête au départ → détournement ensuite.",
    tags: ["cours", "quiz"],
    content: `
      <p>
        L'<span class="hl">abus de confiance</span> est le <span class="hlg">détournement</span> d'une chose remise
        <span class="hlo">volontairement</span> dans le cadre d'un contrat (dépôt, mandat, travail, louage…).
      </p>
      <h4>Conditions préalables (4)</h4>
      <p>
        <span class="hl">Contrat</span> • <span class="hl">Remise</span> à titre précaire • <span class="hl">Chose</span> •
        <span class="hlg">Mise en demeure</span> (indispensable au Sénégal).
      </p>
      <h4>Éléments constitutifs</h4>
      <p>
        <span class="hl">Non-exécution</span> (détournement/dissipation) + <span class="hlg">intention frauduleuse</span>.
      </p>
      <div class="callout"><b>Clé :</b> remise <span class="hlg">légitime au début</span> → fraude <span class="hl">après</span>.</div>
    `,
    quiz: [
      {
        type: "mcq",
        q: "L'abus de confiance se caractérise par :",
        choices: ["Fraude au moment de la remise", "Détournement après une remise légitime", "Crime uniquement", "Absence d'intention"],
        answer: 1,
        explain: "Remise honnête puis détournement."
      },
      {
        type: "tf",
        q: "Vrai ou Faux : la mise en demeure est indispensable avant poursuite pour abus de confiance (Sénégal).",
        answerTF: true,
        explain: "Vrai. C'est un préalable indispensable."
      },
      {
        type: "short",
        q: "Cite 2 contrats pouvant fonder l'abus de confiance.",
        answerText: ["dépôt", "mandat", "contrat de travail", "louage", "nantissement", "gage"],
        explain: "Ex : dépôt, mandat, contrat de travail, louage, nantissement/gage…"
      }
    ]
  },

  {
    id: "dp_affaires_escroquerie",
    subject: "Droit pénal des affaires",
    group: "Droit pénal des affaires",
    title: "Escroquerie (Art. 379 CP)",
    desc: "Fraude au départ → remise → préjudice.",
    tags: ["cours", "quiz"],
    content: `
      <p>
        L'<span class="hl">escroquerie</span> consiste à obtenir une <span class="hlg">remise</span> grâce à des
        <span class="hl">moyens frauduleux</span> (faux nom, fausse qualité, manœuvres).
      </p>
      <h4>4 éléments</h4>
      <p>
        <span class="hl">Moyens frauduleux</span> • <span class="hlg">Remise</span> • <span class="hlo">Préjudice</span> • <span class="hlg">Intention</span>.
      </p>
      <div class="callout"><b>Clé :</b> ici la fraude est <span class="hlg">au début</span>.</div>
    `,
    quiz: [
      {
        type: "mcq",
        q: "Quel élément est central dans l'escroquerie ?",
        choices: ["Une remise initiale honnête", "Des moyens frauduleux", "Une mise en demeure", "Un contrat de dépôt"],
        answer: 1,
        explain: "Escroquerie = moyens frauduleux qui provoquent la remise."
      },
      {
        type: "tf",
        q: "Vrai ou Faux : dans l'escroquerie, la remise est le résultat des manœuvres frauduleuses.",
        answerTF: true,
        explain: "Vrai. La victime remet la chose parce qu'elle est trompée."
      },
      {
        type: "short",
        q: "Donne 2 exemples de moyens frauduleux.",
        answerText: ["faux nom", "fausse qualité", "manœuvres frauduleuses", "faux document"],
        explain: "Ex : faux nom, fausse qualité, manœuvres, faux documents."
      }
    ]
  },

  // =========================
  // ⚖️ DROIT DES OBLIGATIONS
  // =========================
  {
    id: "obligations_intro",
    subject: "Droit des obligations",
    group: "Droit des obligations",
    title: "Définition + caractères",
    desc: "Obligation = lien de droit créancier/débiteur.",
    tags: ["cours", "quiz"],
    content: `
      <p>
        Une <span class="hl">obligation</span> est un <span class="hlg">lien de droit</span> par lequel un <span class="hl">créancier</span>
        peut exiger d'un <span class="hl">débiteur</span> une <span class="hlg">prestation</span> (faire ou ne pas faire).
      </p>
      <h4>Caractères</h4>
      <p>
        L'obligation est <span class="hl">personnelle</span> (au moins 2 personnes), <span class="hl">juridique</span>
        (force publique) et <span class="hl">patrimoniale</span> (évaluable en argent).
      </p>
    `,
    quiz: [
      {
        type: "mcq",
        q: "Une obligation est :",
        choices: ["Un lien de droit", "Une règle morale", "Un jugement", "Une peine"],
        answer: 0,
        explain: "Obligation = lien de droit entre créancier et débiteur."
      },
      {
        type: "tf",
        q: "Vrai ou Faux : l'obligation est toujours patrimoniale.",
        answerTF: true,
        explain: "Vrai dans le cours : elle est évaluable en argent."
      },
      {
        type: "short",
        q: "Cite les 3 caractères de l'obligation.",
        answerText: ["personnel", "juridique", "patrimonial"],
        explain: "Personnel + juridique + patrimonial."
      }
    ]
  },

  {
    id: "obligations_types",
    subject: "Droit des obligations",
    group: "Droit des obligations",
    title: "Types : faire / ne pas faire / donner",
    desc: "Classification selon le mode d'exécution.",
    tags: ["cours", "quiz"],
    content: `
      <p>
        Selon le mode d'exécution, on distingue :
        <span class="hl">obligation de faire</span> (acte positif),
        <span class="hl">obligation de ne pas faire</span> (abstention),
        et <span class="hl">obligation de donner</span> (transfert de propriété).
      </p>
      <div class="callout"><b>Exemple :</b> non-concurrence = <span class="hlg">ne pas faire</span>.</div>
    `,
    quiz: [
      {
        type: "mcq",
        q: "L'obligation de donner consiste à :",
        choices: ["Rendre un service", "S'abstenir", "Transférer la propriété", "Payer une amende"],
        answer: 2,
        explain: "Donner = transfert de propriété."
      },
      {
        type: "tf",
        q: "Vrai ou Faux : l'obligation de faire porte souvent sur les services.",
        answerTF: true,
        explain: "Vrai. Faire = prestation impliquant la personne du débiteur."
      },
      {
        type: "short",
        q: "Donne un exemple d'obligation de ne pas faire.",
        answerText: ["non concurrence", "ne pas exercer", "abstention"],
        explain: "Ex : clause de non-concurrence."
      }
    ]
  },

  // =========================
  // 🛡️ DROIT DES SÛRETÉS (OHADA)
  // =========================
  {
    id: "suretes_intro",
    subject: "Droit des sûretés (OHADA)",
    group: "Droit des sûretés (OHADA)",
    title: "Définition + classification",
    desc: "Sûretés personnelles vs réelles.",
    tags: ["cours", "quiz"],
    content: `
      <p>
        Une <span class="hl">sûreté</span> est l'<span class="hlg">affectation</span> d'un bien ou d'un patrimoine
        au bénéfice d'un créancier pour garantir une obligation.
      </p>
      <h4>Deux grandes catégories</h4>
      <p>
        <span class="hl">Sûretés personnelles</span> (engagement d'une personne : cautionnement, garantie autonome)
        et <span class="hl">sûretés réelles</span> (affectation d'un bien : gage, hypothèque).
      </p>
    `,
    quiz: [
      {
        type: "mcq",
        q: "Une sûreté réelle consiste à :",
        choices: ["Engager une personne", "Affecter un bien", "Créer un délit", "Annuler un contrat"],
        answer: 1,
        explain: "Sûreté réelle = affectation d'un bien."
      },
      {
        type: "tf",
        q: "Vrai ou Faux : l'Acte uniforme OHADA prime sur le droit national.",
        answerTF: true,
        explain: "Vrai (sur les matières qu'il traite)."
      },
      {
        type: "short",
        q: "Cite 1 sûreté personnelle et 1 sûreté réelle.",
        answerText: ["cautionnement", "garantie autonome", "gage", "hypothèque"],
        explain: "Ex : cautionnement (personnelle) et hypothèque (réelle)."
      }
    ]
  },

  {
    id: "suretes_cautionnement",
    subject: "Droit des sûretés (OHADA)",
    group: "Droit des sûretés (OHADA)",
    title: "Cautionnement (essentiel)",
    desc: "Contrat accessoire : payer si le débiteur est défaillant.",
    tags: ["cours", "quiz"],
    content: `
      <p>
        Le <span class="hl">cautionnement</span> est un contrat par lequel la <span class="hl">caution</span>
        s'engage envers le <span class="hl">créancier</span> à payer si le débiteur ne paie pas.
      </p>
      <p>
        Il est <span class="hlg">accessoire</span> : il dépend de la dette principale.
      </p>
      <div class="callout"><b>OHADA :</b> la <span class="hlg">solidarité</span> est <span class="hl">présumée</span>.</div>
    `,
    quiz: [
      {
        type: "mcq",
        q: "Le cautionnement est une :",
        choices: ["Sûreté réelle", "Sûreté personnelle", "Peine", "Procédure"],
        answer: 1,
        explain: "Cautionnement = sûreté personnelle."
      },
      {
        type: "tf",
        q: "Vrai ou Faux : en OHADA, la solidarité de la caution est présumée.",
        answerTF: true,
        explain: "Vrai. Le cautionnement solidaire est le droit commun."
      },
      {
        type: "short",
        q: "Explique en 1 phrase le caractère accessoire du cautionnement.",
        answerText: ["dépend", "dette principale", "si la dette est nulle"],
        explain: "Il dépend de l'existence/validité de la dette principale."
      }
    ]
  },

  // =========================
  // 🧾 PROCÉDURE CIVILE
  // =========================
  {
    id: "procedure_action",
    subject: "Procédure civile",
    group: "Procédure civile",
    title: "Action en justice (conditions)",
    desc: "Intérêt, qualité, capacité, délai.",
    tags: ["cours", "quiz"],
    content: `
      <p>
        L'<span class="hl">action en justice</span> est le pouvoir de saisir le juge.
        Pour agir, il faut : <span class="hlg">intérêt</span>, <span class="hlg">qualité</span>, <span class="hlg">capacité</span>, <span class="hlg">délai</span>.
      </p>
      <div class="callout"><b>À retenir :</b> l'intérêt doit être <span class="hlg">né et actuel</span>, <span class="hlg">légitime</span> et <span class="hlg">personnel</span>.</div>
    `,
    quiz: [
      {
        type: "mcq",
        q: "Les conditions d'existence de l'action sont :",
        choices: ["Intérêt, qualité, capacité, délai", "Dommage, faute, lien", "Offre, acceptation, cause", "Juge, avocat, greffier"],
        answer: 0,
        explain: "Toujours : intérêt + qualité + capacité + délai."
      },
      {
        type: "tf",
        q: "Vrai ou Faux : nul ne plaide par procureur (intérêt personnel).",
        answerTF: true,
        explain: "Vrai. L'intérêt doit être personnel."
      },
      {
        type: "short",
        q: "Cite 2 moyens de défense du défendeur.",
        answerText: ["défense au fond", "exception de procédure", "fin de non-recevoir"],
        explain: "Défense au fond / exception de procédure / fin de non-recevoir."
      }
    ]
  }
];

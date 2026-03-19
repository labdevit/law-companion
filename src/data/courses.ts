export interface QuizQuestion {
  type: "mcq" | "tf" | "short";
  question: string;
  choices?: string[];
  correctAnswer: number | boolean | string[];
  explanation: string;
}

export interface Section {
  id: string;
  title: string;
  content: string;
  quiz: QuizQuestion[];
}

export interface Chapter {
  id: string;
  title: string;
  sections: Section[];
}

export interface Course {
  id: string;
  title: string;
  icon: string;
  color: string;
  chapters: Chapter[];
}

export const COURSES: Course[] = [
  // ═══════════════════════════════════════════════════════════════════
  // DROIT DES OBLIGATIONS
  // ═══════════════════════════════════════════════════════════════════
  {
    id: "obligations",
    title: "Droit des Obligations",
    icon: "⚖️",
    color: "from-blue-500 to-indigo-600",
    chapters: [
      {
        id: "obligations_ch1",
        title: "Définition et Caractères de l'Obligation",
        sections: [
          {
            id: "obligations_ch1_s1",
            title: "Définition de l'obligation",
            content: `
              <p>Au sens du droit privé, l'<span class="hl">obligation</span> est définie comme étant un <span class="hlg">lien de droit</span> en vertu duquel une personne, le <span class="hl">créancier</span>, peut exiger d'une autre, le <span class="hl">débiteur</span>, l'exécution d'une certaine <span class="hlg">prestation</span> qui peut être une abstention.</p>
              <p>Il y a par conséquent, dans toute obligation :</p>
              <ul>
                <li>Un <span class="hl">sujet actif</span> (le créancier)</li>
                <li>Un <span class="hl">sujet passif</span> (le débiteur)</li>
                <li>Ce à quoi ce débiteur est tenu (la <span class="hlg">prestation</span>)</li>
              </ul>
            `,
            quiz: [
              {
                type: "mcq",
                question: "Qu'est-ce qu'une obligation en droit privé ?",
                choices: [
                  "Un lien de droit entre créancier et débiteur",
                  "Un contrat de vente",
                  "Une décision de justice",
                  "Un acte notarié"
                ],
                correctAnswer: 0,
                explanation: "L'obligation est un lien de droit en vertu duquel le créancier peut exiger du débiteur l'exécution d'une prestation."
              },
              {
                type: "tf",
                question: "Le créancier est le sujet passif de l'obligation.",
                correctAnswer: false,
                explanation: "Faux. Le créancier est le sujet ACTIF (il peut exiger), le débiteur est le sujet passif."
              },
              {
                type: "short",
                question: "Quels sont les 3 éléments constitutifs de toute obligation ?",
                correctAnswer: ["créancier", "débiteur", "prestation"],
                explanation: "Toute obligation comprend : un sujet actif (créancier), un sujet passif (débiteur), et une prestation."
              }
            ]
          },
          {
            id: "obligations_ch1_s2",
            title: "Caractères de l'obligation",
            content: `
              <p>L'obligation présente <span class="hl">3 caractères</span> essentiels :</p>
              <h4>1. Caractère personnel</h4>
              <p>C'est un <span class="hlg">lien personnel</span> parce qu'il met nécessairement en face <span class="hlo">au moins 2 personnes</span>, l'une pouvant exiger de l'autre une certaine prestation.</p>
              <h4>2. Caractère juridique</h4>
              <p>C'est un <span class="hlg">lien juridique</span> en ce que son application peut être assurée par la <span class="hl">force publique</span>. Il y a un élément de <span class="hlo">contrainte</span> dans toute obligation, ce qui permet de la distinguer des autres obligations qui n'ont pas un tel caractère, comme l'<span class="hl">obligation naturelle</span>.</p>
              <h4>3. Caractère patrimonial</h4>
              <p>L'obligation a un caractère <span class="hlg">patrimonial</span> car il s'agit d'un droit susceptible d'être <span class="hl">évalué en argent</span> : c'est un droit pécuniaire. Le droit des obligations porte donc sur le "nerf de la guerre" (l'argent).</p>
            `,
            quiz: [
              {
                type: "mcq",
                question: "Combien de caractères présente l'obligation ?",
                choices: ["2 caractères", "3 caractères", "4 caractères", "5 caractères"],
                correctAnswer: 1,
                explanation: "L'obligation présente 3 caractères : personnel, juridique et patrimonial."
              },
              {
                type: "tf",
                question: "L'obligation naturelle peut être exécutée par la force publique.",
                correctAnswer: false,
                explanation: "Faux. Seule l'obligation juridique comporte un élément de contrainte. L'obligation naturelle ne peut pas être exécutée par la force."
              },
              {
                type: "mcq",
                question: "Le caractère patrimonial de l'obligation signifie que :",
                choices: [
                  "Elle concerne uniquement les biens immobiliers",
                  "Elle est susceptible d'être évaluée en argent",
                  "Elle est héréditaire",
                  "Elle est transmissible aux héritiers"
                ],
                correctAnswer: 1,
                explanation: "Le caractère patrimonial signifie que l'obligation est un droit pécuniaire, évaluable en argent."
              }
            ]
          }
        ]
      },
      {
        id: "obligations_ch2",
        title: "Classification des Obligations",
        sections: [
          {
            id: "obligations_ch2_s1",
            title: "Classification selon le mode d'exécution",
            content: `
              <p>Les obligations peuvent être classées selon leur <span class="hl">mode d'exécution</span>. On distingue :</p>
              <h4>L'obligation de faire</h4>
              <p>Le débiteur est astreint à l'exécution d'une certaine prestation, d'un <span class="hlg">acte positif</span>. Elle porte sur les <span class="hl">services</span>, c'est-à-dire une prestation impliquant la personne même du débiteur.</p>
              <div class="callout"><b>Exemple :</b> L'entrepreneur est tenu de réaliser l'ouvrage commandité par son client.</div>
              <h4>L'obligation de ne pas faire</h4>
              <p>Le débiteur s'astreint de <span class="hlg">ne pas agir</span>, il est tenu d'une <span class="hl">abstention</span>.</p>
              <div class="callout"><b>Exemple :</b> L'obligation de non-concurrence du salarié vis-à-vis de son employeur.</div>
              <h4>L'obligation de donner</h4>
              <p>C'est celle qui consiste à <span class="hlg">transférer la propriété</span> d'une chose. Elle se rencontre dans tous les contrats qui opèrent un transfert de propriété : <span class="hl">vente</span>, <span class="hl">donation</span>, <span class="hl">échange</span>.</p>
            `,
            quiz: [
              {
                type: "mcq",
                question: "L'obligation de donner consiste à :",
                choices: [
                  "Offrir un cadeau",
                  "Transférer la propriété d'une chose",
                  "Prêter de l'argent",
                  "Rendre un service"
                ],
                correctAnswer: 1,
                explanation: "L'obligation de donner consiste à transférer la propriété d'une chose (vente, donation, échange)."
              },
              {
                type: "tf",
                question: "L'obligation de non-concurrence est une obligation de ne pas faire.",
                correctAnswer: true,
                explanation: "Vrai. C'est une abstention : le salarié s'abstient d'exercer une activité concurrente."
              },
              {
                type: "short",
                question: "Citez les 3 types d'obligations selon le mode d'exécution.",
                correctAnswer: ["faire", "ne pas faire", "donner"],
                explanation: "Les 3 types sont : obligation de faire, obligation de ne pas faire, obligation de donner."
              }
            ]
          },
          {
            id: "obligations_ch2_s2",
            title: "Obligation de moyen vs obligation de résultat",
            content: `
              <h4>L'obligation de résultat</h4>
              <p>Le débiteur <span class="hl">promet au créancier d'accomplir de façon certaine</span> une prestation à son profit. Si le résultat promis n'a pas été atteint, on <span class="hlo">engage sa responsabilité</span>.</p>
              <p>Il suffit pour le créancier de <span class="hlg">constater que le résultat n'a pas été atteint</span> pour prouver que le débiteur a commis une faute.</p>
              <h4>L'obligation de moyen</h4>
              <p>Le débiteur promet seulement au créancier de <span class="hl">mettre en œuvre tous les moyens</span> dont il dispose pour parvenir au résultat envisagé <span class="hlo">sans promettre son obtention</span>.</p>
              <p>Le débiteur ne promet pas un résultat, il s'engage à se comporter en <span class="hlg">bon père de famille</span> (homme prudent, diligent et avisé).</p>
              <div class="callout"><b>Exemple classique :</b> Le médecin ne peut garantir la guérison du malade mais il promet de mobiliser toutes ses capacités pour y parvenir. Le créancier doit <span class="hl">prouver la faute</span> pour engager sa responsabilité.</div>
            `,
            quiz: [
              {
                type: "mcq",
                question: "Dans l'obligation de résultat, pour engager la responsabilité du débiteur :",
                choices: [
                  "Le créancier doit prouver une faute",
                  "Il suffit de constater que le résultat n'a pas été atteint",
                  "Il faut une décision de justice préalable",
                  "Le débiteur doit reconnaître sa faute"
                ],
                correctAnswer: 1,
                explanation: "Dans l'obligation de résultat, il suffit de constater que le résultat promis n'a pas été atteint pour prouver la faute."
              },
              {
                type: "tf",
                question: "Le médecin est tenu d'une obligation de résultat envers son patient.",
                correctAnswer: false,
                explanation: "Faux. Le médecin est tenu d'une obligation de MOYEN : il s'engage à mettre en œuvre tous les moyens pour guérir, sans garantir le résultat."
              },
              {
                type: "mcq",
                question: "Se comporter en 'bon père de famille' signifie :",
                choices: [
                  "Être un bon parent",
                  "Agir de manière prudente, diligente et avisée",
                  "Avoir une famille nombreuse",
                  "Être propriétaire d'un bien"
                ],
                correctAnswer: 1,
                explanation: "Le 'bon père de famille' est une notion juridique désignant une personne prudente, diligente et avisée."
              }
            ]
          },
          {
            id: "obligations_ch2_s3",
            title: "Transfert de propriété",
            content: `
              <h4>En droit français</h4>
              <p>Le transfert de propriété s'opère <span class="hl">solo consensus</span>, c'est-à-dire dès le <span class="hlg">seul échange du consentement</span>.</p>
              <h4>En droit sénégalais</h4>
              <p>Le transfert s'opère différemment selon la nature du bien :</p>
              <ul>
                <li><span class="hl">Immeuble</span> : le transfert s'opère à partir de l'<span class="hlg">inscription au registre foncier</span></li>
                <li><span class="hl">Meuble</span> : le transfert s'opère à partir de la <span class="hlg">remise de la chose</span></li>
              </ul>
              <div class="callout"><b>Important :</b> Cette distinction est fondamentale pour déterminer le moment du transfert des risques.</div>
            `,
            quiz: [
              {
                type: "mcq",
                question: "En droit français, le transfert de propriété s'opère :",
                choices: [
                  "À la remise de la chose",
                  "À l'inscription au registre foncier",
                  "Dès le seul échange du consentement (solo consensus)",
                  "Au paiement du prix"
                ],
                correctAnswer: 2,
                explanation: "En droit français, le transfert s'opère 'solo consensus', dès l'échange des consentements."
              },
              {
                type: "tf",
                question: "En droit sénégalais, le transfert d'un immeuble nécessite l'inscription au registre foncier.",
                correctAnswer: true,
                explanation: "Vrai. En droit sénégalais, le transfert d'un immeuble s'opère à partir de l'inscription au registre foncier."
              }
            ]
          }
        ]
      },
      {
        id: "obligations_ch3",
        title: "Sources et Formation des Obligations",
        sections: [
          {
            id: "obligations_ch3_s1",
            title: "Classification selon la source",
            content: `
              <p>L'obligation peut avoir deux sources principales :</p>
              <h4>Origine légale</h4>
              <p>L'obligation résulte de la <span class="hl">loi</span>, comme en matière de <span class="hlg">responsabilité civile</span>.</p>
              <h4>Origine contractuelle</h4>
              <p>L'obligation a pour source le <span class="hl">contrat</span>.</p>
              <h4>Distinction contrat/convention</h4>
              <ul>
                <li><span class="hl">Contrat</span> : accord de volonté <span class="hlg">créateur d'obligations</span></li>
                <li><span class="hl">Convention</span> : accord de volonté qui peut <span class="hlg">créer, modifier, transférer ou éteindre</span> des droits</li>
              </ul>
              <div class="callout"><b>À retenir :</b> La convention est plus large que le contrat. <span class="hl">Tout contrat est une convention mais toute convention n'est pas un contrat.</span></div>
            `,
            quiz: [
              {
                type: "mcq",
                question: "Quelle affirmation est correcte ?",
                choices: [
                  "Tout contrat est une convention et toute convention est un contrat",
                  "Tout contrat est une convention mais toute convention n'est pas un contrat",
                  "La convention et le contrat sont synonymes",
                  "Le contrat est plus large que la convention"
                ],
                correctAnswer: 1,
                explanation: "La convention est plus large : elle peut créer, modifier, transférer ou éteindre des droits. Le contrat crée uniquement des obligations."
              },
              {
                type: "tf",
                question: "La responsabilité civile est une source légale d'obligation.",
                correctAnswer: true,
                explanation: "Vrai. La responsabilité civile est une obligation qui résulte de la loi (origine légale)."
              }
            ]
          },
          {
            id: "obligations_ch3_s2",
            title: "Contrat synallagmatique vs unilatéral",
            content: `
              <h4>Le contrat synallagmatique (bilatéral)</h4>
              <p>Les <span class="hlg">obligations des parties sont interdépendantes, réciproques</span>. Chaque partie a le droit de <span class="hl">refuser de s'exécuter</span> si son cocontractant ne s'exécute pas.</p>
              <div class="callout"><b>Exception d'inexécution :</b> C'est le droit de refuser d'exécuter tant que l'autre partie n'exécute pas.</div>
              <h4>Le contrat unilatéral</h4>
              <p>Une <span class="hlg">seule partie est tenue d'une obligation</span>.</p>
              <div class="callout"><b>Exemple :</b> Le contrat de dépôt (seul le dépositaire a l'obligation de restituer).</div>
              <h4>Intérêt de la distinction (formalisme)</h4>
              <ul>
                <li><span class="hl">Synallagmatique</span> : formalité du <span class="hlg">double</span> (autant d'exemplaires que de parties)</li>
                <li><span class="hl">Unilatéral</span> : formalité du <span class="hlg">"bon pour"</span> (rédigé par la seule partie qui s'engage)</li>
              </ul>
            `,
            quiz: [
              {
                type: "mcq",
                question: "L'exception d'inexécution s'applique dans quel type de contrat ?",
                choices: [
                  "Contrat unilatéral",
                  "Contrat synallagmatique",
                  "Contrat de dépôt",
                  "Tous les contrats"
                ],
                correctAnswer: 1,
                explanation: "L'exception d'inexécution ne s'applique que dans les contrats synallagmatiques, où les obligations sont réciproques."
              },
              {
                type: "tf",
                question: "Le contrat de dépôt est un contrat synallagmatique.",
                correctAnswer: false,
                explanation: "Faux. Le contrat de dépôt est un contrat unilatéral : seul le dépositaire est tenu d'une obligation (restituer)."
              },
              {
                type: "short",
                question: "Quelle formalité s'applique au contrat synallagmatique ?",
                correctAnswer: ["double", "formalité du double", "autant d'exemplaires"],
                explanation: "La formalité du double : il doit y avoir autant d'exemplaires qu'il y a de parties."
              }
            ]
          },
          {
            id: "obligations_ch3_s3",
            title: "L'autonomie de la volonté et le consentement",
            content: `
              <h4>Le principe de l'autonomie de la volonté</h4>
              <p>C'est la <span class="hl">volonté des parties</span> qui gouverne en matière contractuelle. Les parties bénéficient d'une <span class="hlg">liberté quasi absolue</span> :</p>
              <ul>
                <li>Liberté de contracter ou non</li>
                <li>Liberté de négocier les clauses et modalités</li>
                <li>Contrat valablement formé dès le <span class="hl">seul échange de volonté</span> : c'est le <span class="hlg">consensualisme</span></li>
              </ul>
              <div class="callout"><b>Adage :</b> "Qui dit juste dit contractuel" - les parties recherchent le "juste" car elles sont en situation égalitaire.</div>
              <h4>Manifestation du consentement</h4>
              <p>Le consentement doit être <span class="hl">extériorisé</span>. La volonté interne ne suffit pas : il faut une <span class="hlg">volonté déclarée</span>.</p>
              <div class="callout"><b>Règle :</b> "Silence ne vaut pas acceptation" <span class="hlo">SAUF</span> :
              <ul>
                <li>S'il existe une <span class="hlg">relation d'affaires antérieure</span> entre les parties</li>
                <li>Si la prestation a été faite dans le <span class="hlg">seul intérêt du destinataire</span></li>
              </ul></div>
            `,
            quiz: [
              {
                type: "mcq",
                question: "Selon le principe du consensualisme, le contrat est formé :",
                choices: [
                  "Par un acte notarié",
                  "Par écrit obligatoirement",
                  "Dès le seul échange des volontés",
                  "Par un juge"
                ],
                correctAnswer: 2,
                explanation: "Le consensualisme signifie que le contrat est valablement formé dès le seul échange de volonté."
              },
              {
                type: "tf",
                question: "En principe, le silence vaut acceptation en droit des contrats.",
                correctAnswer: false,
                explanation: "Faux. 'Silence ne vaut pas acceptation', sauf exceptions (relation d'affaires antérieure ou prestation dans l'intérêt du destinataire)."
              },
              {
                type: "mcq",
                question: "Dans quel cas le silence peut-il valoir acceptation ?",
                choices: [
                  "Jamais",
                  "S'il existe une relation d'affaires antérieure",
                  "Si l'offre est faite par lettre recommandée",
                  "Si l'offre est publique"
                ],
                correctAnswer: 1,
                explanation: "Exception : le silence peut valoir acceptation s'il existe une relation d'affaires antérieure entre les parties."
              }
            ]
          }
        ]
      },
      {
        id: "obligations_ch4",
        title: "Notions Complémentaires",
        sections: [
          {
            id: "obligations_ch4_s1",
            title: "Usufruitier, possesseur et détenteur",
            content: `
              <p>Il est important de distinguer ces trois notions :</p>
              <h4>L'usufruitier</h4>
              <p>Il dispose de :</p>
              <ul>
                <li><span class="hl">L'usus</span> : le droit d'<span class="hlg">user de la chose</span></li>
                <li><span class="hl">Le fructus</span> : le droit de <span class="hlg">percevoir les fruits</span> de la chose</li>
              </ul>
              <h4>Le possesseur</h4>
              <p>Il dispose de :</p>
              <ul>
                <li><span class="hl">Le corpus</span> : la détention matérielle</li>
                <li><span class="hl">L'animus</span> : l'<span class="hlg">intention de se comporter comme propriétaire</span></li>
              </ul>
              <h4>Le dépositaire/détenteur précaire</h4>
              <p>Il a seulement le <span class="hl">corpus</span> : la <span class="hlg">détention de la chose</span>, sans intention d'en être propriétaire.</p>
            `,
            quiz: [
              {
                type: "mcq",
                question: "Que possède l'usufruitier ?",
                choices: [
                  "L'usus et l'abusus",
                  "L'usus et le fructus",
                  "Le corpus et l'animus",
                  "Seulement le corpus"
                ],
                correctAnswer: 1,
                explanation: "L'usufruitier a l'usus (droit d'user) et le fructus (droit aux fruits). Il n'a pas l'abusus (droit de disposer)."
              },
              {
                type: "tf",
                question: "Le possesseur a l'intention de se comporter comme propriétaire (animus).",
                correctAnswer: true,
                explanation: "Vrai. Le possesseur se distingue du détenteur par l'animus, l'intention de se comporter comme propriétaire."
              },
              {
                type: "short",
                question: "Qu'est-ce qui différencie le possesseur du détenteur précaire ?",
                correctAnswer: ["animus", "intention", "comportement comme propriétaire"],
                explanation: "Le possesseur a l'animus (intention de se comporter comme propriétaire), le détenteur précaire n'a que le corpus."
              }
            ]
          },
          {
            id: "obligations_ch4_s2",
            title: "Fruits et produits",
            content: `
              <h4>Les fruits</h4>
              <ul>
                <li><span class="hl">Fruits naturels</span> : ce qui vient naturellement de la terre</li>
                <li><span class="hl">Fruits civils</span> : ce que l'on tire des <span class="hlg">locations</span> (loyers)</li>
              </ul>
              <h4>Les produits</h4>
              <p>Ce sont les revenus issus d'un <span class="hl">investissement</span>. À la différence des fruits, les produits <span class="hlo">altèrent la substance</span> de la chose.</p>
              <div class="callout"><b>Distinction importante :</b> Les fruits se renouvellent périodiquement sans altérer la substance du bien. Les produits diminuent la substance.</div>
            `,
            quiz: [
              {
                type: "mcq",
                question: "Les loyers perçus d'une location sont des :",
                choices: [
                  "Fruits naturels",
                  "Fruits civils",
                  "Produits",
                  "Revenus exceptionnels"
                ],
                correctAnswer: 1,
                explanation: "Les loyers sont des fruits civils : ce que l'on tire des locations."
              },
              {
                type: "tf",
                question: "Les produits, contrairement aux fruits, altèrent la substance de la chose.",
                correctAnswer: true,
                explanation: "Vrai. Les produits diminuent la substance du bien, alors que les fruits se renouvellent périodiquement."
              }
            ]
          }
        ]
      }
    ]
  },

  // ═══════════════════════════════════════════════════════════════════
  // DROIT PÉNAL DES AFFAIRES
  // ═══════════════════════════════════════════════════════════════════
  {
    id: "penal",
    title: "Droit Pénal des Affaires",
    icon: "⚔️",
    color: "from-red-500 to-orange-600",
    chapters: [
      {
        id: "penal_ch1",
        title: "Les Fondamentaux de l'Infraction",
        sections: [
          {
            id: "penal_ch1_s1",
            title: "Les trois éléments de l'infraction",
            content: `
              <p>Pour qu'il y ait <span class="hl">sanction pénale</span>, trois éléments doivent <span class="hlo">obligatoirement</span> être réunis :</p>
              <h4>1. L'élément légal</h4>
              <p><span class="hlg">"Pas d'infraction sans texte"</span>. Un acte n'est punissable que s'il est prévu par la loi.</p>
              <h4>2. L'élément matériel</h4>
              <p>Le <span class="hl">fait extérieur visible</span> :</p>
              <ul>
                <li><span class="hlg">Commission</span> : un acte positif (ex: voler)</li>
                <li><span class="hlg">Omission</span> : une abstention (ex: le commissaire aux comptes qui ne révèle pas des faits délictueux)</li>
              </ul>
              <h4>3. L'élément moral (intention)</h4>
              <p>La <span class="hl">faute imputable</span> à l'auteur. Pour les délits d'affaires (abus de confiance, escroquerie), l'<span class="hlg">intention coupable</span> (conscience de mal agir) est requise.</p>
              <div class="callout"><b>Causes de non-imputabilité :</b> La démence, la contrainte (force qui abolit la volonté) ou l'erreur de fait peuvent exonérer l'auteur.</div>
            `,
            quiz: [
              {
                type: "mcq",
                question: "Quels sont les 3 éléments constitutifs de l'infraction ?",
                choices: [
                  "Légal, matériel, moral",
                  "Civil, commercial, pénal",
                  "Auteur, victime, juge",
                  "Texte, dommage, contrat"
                ],
                correctAnswer: 0,
                explanation: "Toute infraction requiert : élément légal + matériel + moral (intention)."
              },
              {
                type: "tf",
                question: "Un acte peut être puni pénalement même s'il n'est pas prévu par un texte de loi.",
                correctAnswer: false,
                explanation: "Faux. Le principe de légalité impose : 'Pas d'infraction sans texte'."
              },
              {
                type: "short",
                question: "Quelles sont les causes de non-imputabilité ?",
                correctAnswer: ["démence", "contrainte", "erreur de fait"],
                explanation: "Les 3 causes sont : la démence, la contrainte et l'erreur de fait."
              }
            ]
          },
          {
            id: "penal_ch1_s2",
            title: "La tentative",
            content: `
              <h4>Définition</h4>
              <p>La <span class="hl">tentative</span> est punissable sous deux conditions cumulatives :</p>
              <ul>
                <li>Un <span class="hlg">commencement d'exécution</span> (acte univoque)</li>
                <li>L'<span class="hlg">absence de désistement volontaire</span></li>
              </ul>
              <h4>Distinction avec l'acte préparatoire</h4>
              <p>L'<span class="hlo">acte préparatoire</span> (ex: acheter une arme) est <span class="hl">équivoque</span> et <span class="hlg">non punissable</span>.</p>
              <div class="callout"><b>Attention examen :</b> 
              <ul>
                <li>La <span class="hlo">tentative d'abus de confiance</span> n'est <span class="hl">PAS punissable</span> (car c'est un délit qui suppose une remise préalable)</li>
                <li>La <span class="hlg">tentative d'escroquerie</span> est <span class="hl">punissable</span></li>
              </ul></div>
            `,
            quiz: [
              {
                type: "mcq",
                question: "La tentative est punissable si :",
                choices: [
                  "Il y a un acte préparatoire",
                  "Il y a commencement d'exécution et absence de désistement volontaire",
                  "L'auteur a eu l'intention de commettre l'infraction",
                  "La victime a subi un préjudice"
                ],
                correctAnswer: 1,
                explanation: "La tentative requiert : commencement d'exécution + absence de désistement volontaire."
              },
              {
                type: "tf",
                question: "L'acte préparatoire est punissable au même titre que la tentative.",
                correctAnswer: false,
                explanation: "Faux. L'acte préparatoire est équivoque et non punissable, contrairement à la tentative."
              },
              {
                type: "tf",
                question: "La tentative d'abus de confiance est punissable.",
                correctAnswer: false,
                explanation: "Faux. La tentative d'abus de confiance n'est PAS punissable car ce délit suppose une remise préalable."
              }
            ]
          }
        ]
      },
      {
        id: "penal_ch2",
        title: "Les Participants à l'Infraction",
        sections: [
          {
            id: "penal_ch2_s1",
            title: "Auteur, co-auteur et complice",
            content: `
              <h4>L'auteur et le co-auteur</h4>
              <ul>
                <li>L'<span class="hl">auteur</span> : celui qui commet l'acte</li>
                <li>Le <span class="hl">co-auteur</span> : celui qui participe directement à l'exécution de l'infraction</li>
              </ul>
              <h4>La complicité (attention pour les comptables !)</h4>
              <p>Le <span class="hlo">complice encourt les mêmes peines</span> que l'auteur principal.</p>
              <p><span class="hl">Conditions de la complicité :</span></p>
              <ul>
                <li>Un <span class="hlg">fait principal punissable</span> (crime ou délit)</li>
                <li>Un <span class="hlg">acte matériel</span> de complicité : instructions données, fourniture de moyens, aide et assistance</li>
                <li>Une <span class="hlg">intention</span> : agir en connaissance de cause</li>
              </ul>
              <div class="callout"><b>Application comptable :</b> Les experts-comptables ou commissaires aux comptes qui participent <span class="hlo">sciemment</span> à la confection de faux bilans sont <span class="hl">complices</span>.</div>
            `,
            quiz: [
              {
                type: "mcq",
                question: "Le complice encourt :",
                choices: [
                  "Une peine réduite de moitié",
                  "Les mêmes peines que l'auteur principal",
                  "Une amende uniquement",
                  "Aucune peine s'il se dénonce"
                ],
                correctAnswer: 1,
                explanation: "Le complice encourt les mêmes peines que l'auteur principal de l'infraction."
              },
              {
                type: "tf",
                question: "Un comptable qui participe sciemment à la confection de faux bilans peut être poursuivi comme complice.",
                correctAnswer: true,
                explanation: "Vrai. Les professionnels du chiffre qui participent sciemment à une infraction sont complices."
              },
              {
                type: "short",
                question: "Citez les 3 conditions de la complicité.",
                correctAnswer: ["fait principal punissable", "acte matériel", "intention"],
                explanation: "Les 3 conditions : fait principal punissable, acte matériel de complicité, intention (connaissance de cause)."
              }
            ]
          },
          {
            id: "penal_ch2_s2",
            title: "Responsabilité du chef d'entreprise",
            content: `
              <h4>Principe : responsabilité personnelle</h4>
              <p>Le principe est la <span class="hl">responsabilité personnelle</span> du chef d'entreprise.</p>
              <h4>Responsabilité du fait d'autrui</h4>
              <p>Le chef d'entreprise peut être <span class="hlo">responsable du fait de ses préposés</span> si :</p>
              <ul>
                <li>Il y a <span class="hlg">infraction</span> (même non intentionnelle)</li>
                <li>Il y a <span class="hlg">faute de surveillance</span> du patron</li>
              </ul>
              <h4>Exonération : la délégation de pouvoir</h4>
              <p>Le chef d'entreprise peut s'exonérer par une <span class="hl">délégation de pouvoir</span> à condition que le préposé ait la <span class="hlg">compétence requise</span>.</p>
            `,
            quiz: [
              {
                type: "mcq",
                question: "Le chef d'entreprise peut s'exonérer de sa responsabilité pénale par :",
                choices: [
                  "Le paiement d'une amende",
                  "Une délégation de pouvoir à un préposé compétent",
                  "La fermeture de l'entreprise",
                  "Un recours au tribunal"
                ],
                correctAnswer: 1,
                explanation: "La délégation de pouvoir à un préposé compétent permet l'exonération du chef d'entreprise."
              },
              {
                type: "tf",
                question: "Le chef d'entreprise ne peut jamais être responsable des infractions commises par ses salariés.",
                correctAnswer: false,
                explanation: "Faux. Il peut être responsable du fait d'autrui en cas de faute de surveillance."
              }
            ]
          }
        ]
      },
      {
        id: "penal_ch3",
        title: "Les Infractions Majeures",
        sections: [
          {
            id: "penal_ch3_s1",
            title: "L'abus de confiance (Art. 383 CP)",
            content: `
              <p>C'est le <span class="hl">détournement d'une chose remise légalement</span> au départ.</p>
              <h4>1. Conditions préalables (4 conditions)</h4>
              <ul>
                <li>Un <span class="hlg">contrat spécifique</span> violé : dépôt, mandat, prêt à usage, contrat de travail, nantissement ou louage</li>
                <li>Une <span class="hlg">remise volontaire</span> mais à titre <span class="hl">précaire</span> (à charge de rendre ou d'en faire un usage déterminé)</li>
                <li>Une <span class="hlg">chose</span> remise</li>
                <li>Une <span class="hlg">mise en demeure</span> : <span class="hlo">indispensable en droit sénégalais</span> avant toute poursuite</li>
              </ul>
              <h4>2. Éléments constitutifs</h4>
              <ul>
                <li><span class="hl">Détournement/Dissipation</span> : ne pas rendre la chose ou l'utiliser à d'autres fins (ex: caissier qui prend l'argent de la caisse)</li>
                <li><span class="hl">Intention frauduleuse</span> : conscience de la précarité de la détention</li>
              </ul>
              <h4>3. Faits justificatifs (défense)</h4>
              <p>Force majeure, fait du tiers, ou autorisation du propriétaire.</p>
              <div class="callout"><b>CLÉ :</b> La remise est <span class="hlg">honnête au début</span> → le détournement vient <span class="hlo">après</span>.</div>
            `,
            quiz: [
              {
                type: "mcq",
                question: "L'abus de confiance se caractérise par :",
                choices: [
                  "Une fraude dès le départ",
                  "Un détournement après une remise légitime",
                  "Un vol avec violence",
                  "Une escroquerie"
                ],
                correctAnswer: 1,
                explanation: "Dans l'abus de confiance, la remise est honnête au début, le détournement vient ensuite."
              },
              {
                type: "tf",
                question: "En droit sénégalais, la mise en demeure est indispensable avant de poursuivre pour abus de confiance.",
                correctAnswer: true,
                explanation: "Vrai. C'est un préalable obligatoire en droit sénégalais."
              },
              {
                type: "short",
                question: "Citez 2 contrats pouvant fonder l'abus de confiance.",
                correctAnswer: ["dépôt", "mandat", "prêt", "travail", "nantissement", "louage"],
                explanation: "Ex: dépôt, mandat, prêt à usage, contrat de travail, nantissement, louage."
              },
              {
                type: "mcq",
                question: "L'élément matériel de l'abus de confiance est :",
                choices: [
                  "La mise en scène frauduleuse",
                  "Le détournement ou la dissipation",
                  "L'usage de faux nom",
                  "La violence physique"
                ],
                correctAnswer: 1,
                explanation: "L'élément matériel est le détournement ou la dissipation de la chose remise."
              }
            ]
          },
          {
            id: "penal_ch3_s2",
            title: "L'escroquerie (Art. 379 CP)",
            content: `
              <p>Contrairement à l'abus de confiance, ici la <span class="hlo">remise est obtenue par la ruse dès le départ</span>.</p>
              <h4>1. Moyens frauduleux (le piège)</h4>
              <ul>
                <li>Usage de <span class="hlg">faux nom</span> ou <span class="hlg">fausse qualité</span></li>
                <li><span class="hl">Manœuvres frauduleuses</span> : mise en scène, intervention d'un tiers, production de faux documents</li>
              </ul>
              <div class="callout"><b>Note examen :</b> La simple <span class="hlo">publicité mensongère</span> ou la publication de <span class="hlo">faux bilans</span> pour attirer des capitaux sont des manœuvres frauduleuses.</div>
              <h4>2. Résultat</h4>
              <p>La <span class="hl">remise de la chose</span> (fonds, biens, décharge).</p>
              <h4>3. Préjudice</h4>
              <p>La victime a donné son bien contre sa <span class="hlg">volonté réelle</span> (tromperie).</p>
              <div class="callout"><b>CLÉ :</b> La <span class="hlo">fraude est AU DÉBUT</span> → la remise est le <span class="hlg">résultat</span> de la fraude.</div>
              <h4>Tableau comparatif</h4>
              <ul>
                <li><span class="hl">Abus de confiance</span> : remise honnête au début → détournement après</li>
                <li><span class="hl">Escroquerie</span> : fraude au début → remise comme résultat</li>
              </ul>
            `,
            quiz: [
              {
                type: "mcq",
                question: "Ce qui distingue l'escroquerie de l'abus de confiance :",
                choices: [
                  "La nature du préjudice",
                  "Le moment de la fraude (au début pour l'escroquerie)",
                  "Le montant en jeu",
                  "La qualité de la victime"
                ],
                correctAnswer: 1,
                explanation: "Escroquerie = fraude au début. Abus de confiance = remise honnête puis détournement."
              },
              {
                type: "tf",
                question: "La publication de faux bilans pour attirer des capitaux constitue une manœuvre frauduleuse d'escroquerie.",
                correctAnswer: true,
                explanation: "Vrai. C'est une manœuvre frauduleuse punissable."
              },
              {
                type: "short",
                question: "Citez 2 moyens frauduleux caractérisant l'escroquerie.",
                correctAnswer: ["faux nom", "fausse qualité", "manœuvres", "faux documents"],
                explanation: "Ex: faux nom, fausse qualité, manœuvres frauduleuses, faux documents."
              },
              {
                type: "tf",
                question: "La tentative d'escroquerie est punissable.",
                correctAnswer: true,
                explanation: "Vrai. Contrairement à l'abus de confiance, la tentative d'escroquerie EST punissable."
              }
            ]
          }
        ]
      },
      {
        id: "penal_ch4",
        title: "Droit Pénal des Sociétés (OHADA)",
        sections: [
          {
            id: "penal_ch4_s1",
            title: "Infractions liées aux sociétés",
            content: `
              <h4>Constitution de société</h4>
              <p>L'<span class="hl">infraction d'émission irrégulière d'actions</span> punit l'émission d'actions :</p>
              <ul>
                <li>Avant l'<span class="hlg">immatriculation au RCCM</span></li>
                <li>Si la constitution est <span class="hlo">frauduleuse</span></li>
              </ul>
              <div class="callout"><b>Important :</b> L'élément moral est <span class="hl">strict</span> : le délit existe même sans mauvaise foi, par <span class="hlo">simple négligence de vérification</span>.</div>
            `,
            quiz: [
              {
                type: "mcq",
                question: "L'émission d'actions avant l'immatriculation au RCCM est :",
                choices: [
                  "Légale si le capital est libéré",
                  "Une infraction punissable",
                  "Autorisée avec accord des associés",
                  "Possible sous conditions"
                ],
                correctAnswer: 1,
                explanation: "C'est une infraction d'émission irrégulière d'actions."
              },
              {
                type: "tf",
                question: "L'infraction d'émission irrégulière d'actions nécessite une intention de nuire.",
                correctAnswer: false,
                explanation: "Faux. Le délit existe même par simple négligence de vérification, sans mauvaise foi."
              }
            ]
          }
        ]
      },
      {
        id: "penal_ch5",
        title: "Organisation Judiciaire",
        sections: [
          {
            id: "penal_ch5_s1",
            title: "La hiérarchie des juridictions (Sénégal)",
            content: `
              <h4>1. Tribunal d'Instance (TI)</h4>
              <p>Juge les <span class="hlg">contraventions</span> et <span class="hlg">petits délits</span>.</p>
              <h4>2. Tribunal de Grande Instance (TGI)</h4>
              <ul>
                <li>S'appelle <span class="hl">"Tribunal Correctionnel"</span> au pénal</li>
                <li>Juge les <span class="hlg">délits classiques</span> (abus de confiance, escroquerie)</li>
                <li>Comprend une <span class="hl">Chambre Criminelle</span> pour les crimes</li>
              </ul>
              <h4>3. Cour d'Appel</h4>
              <p>Rejuge les affaires en <span class="hlg">fait et en droit</span>.</p>
              <h4>4. Cour Suprême</h4>
              <p>Juge du <span class="hl">droit uniquement</span> (cassation). Ne rejuge <span class="hlo">pas les faits</span>.</p>
              <div class="callout"><b>Vocabulaire :</b> Utilisez <span class="hlg">"Prévenu"</span> (correctionnel) et non "Accusé" (criminel) sauf si c'est devant la chambre criminelle.</div>
            `,
            quiz: [
              {
                type: "mcq",
                question: "Le Tribunal Correctionnel juge :",
                choices: [
                  "Les contraventions",
                  "Les crimes",
                  "Les délits comme l'abus de confiance",
                  "Uniquement les affaires commerciales"
                ],
                correctAnswer: 2,
                explanation: "Le Tribunal Correctionnel (TGI au pénal) juge les délits classiques."
              },
              {
                type: "tf",
                question: "La Cour Suprême rejuge les faits et le droit.",
                correctAnswer: false,
                explanation: "Faux. La Cour Suprême ne juge que le droit (cassation), elle ne rejuge pas les faits."
              },
              {
                type: "mcq",
                question: "Devant le tribunal correctionnel, on parle de :",
                choices: [
                  "Accusé",
                  "Prévenu",
                  "Inculpé",
                  "Condamné"
                ],
                correctAnswer: 1,
                explanation: "'Prévenu' est le terme correct au correctionnel. 'Accusé' s'utilise au criminel."
              }
            ]
          }
        ]
      }
    ]
  },

  // ═══════════════════════════════════════════════════════════════════
  // DROIT DES SÛRETÉS (OHADA)
  // ═══════════════════════════════════════════════════════════════════
  {
    id: "suretes",
    title: "Droit des Sûretés (OHADA)",
    icon: "🛡️",
    color: "from-emerald-500 to-teal-600",
    chapters: [
      {
        id: "suretes_ch1",
        title: "Introduction aux Sûretés",
        sections: [
          {
            id: "suretes_ch1_s1",
            title: "Définition et classification",
            content: `
              <h4>Définition de la sûreté</h4>
              <p>Une <span class="hl">sûreté</span> est l'<span class="hlg">affectation</span> au bénéfice d'un créancier d'un bien, d'un ensemble de biens ou d'un patrimoine pour <span class="hlg">garantir l'exécution d'une obligation</span> (présente, future, déterminée ou déterminable).</p>
              <h4>Articulation des normes</h4>
              <p>L'<span class="hl">Acte Uniforme (AU)</span> prime, mais le droit national subsiste pour les questions non traitées (conditions de validité de la créance, droit des biens, régimes fonciers).</p>
              <h4>Classification des sûretés</h4>
              <ul>
                <li><span class="hlg">Sûretés personnelles</span> : engagement d'une <span class="hl">personne</span> (cautionnement, garantie autonome)</li>
                <li><span class="hlg">Sûretés réelles</span> : affectation d'un <span class="hl">bien</span>
                  <ul>
                    <li>Mobilières : gage, nantissement</li>
                    <li>Immobilières : hypothèque</li>
                  </ul>
                </li>
              </ul>
            `,
            quiz: [
              {
                type: "mcq",
                question: "Une sûreté réelle consiste à :",
                choices: [
                  "Engager une personne à payer",
                  "Affecter un bien en garantie",
                  "Créer un délit pénal",
                  "Annuler un contrat"
                ],
                correctAnswer: 1,
                explanation: "Sûreté réelle = affectation d'un bien. Sûreté personnelle = engagement d'une personne."
              },
              {
                type: "tf",
                question: "L'Acte Uniforme OHADA prime sur le droit national en matière de sûretés.",
                correctAnswer: true,
                explanation: "Vrai. L'AU prime pour les matières qu'il traite."
              },
              {
                type: "short",
                question: "Citez une sûreté personnelle et une sûreté réelle.",
                correctAnswer: ["cautionnement", "garantie autonome", "gage", "hypothèque", "nantissement"],
                explanation: "Personnelles : cautionnement, garantie autonome. Réelles : gage, hypothèque, nantissement."
              }
            ]
          }
        ]
      },
      {
        id: "suretes_ch2",
        title: "Le Cautionnement",
        sections: [
          {
            id: "suretes_ch2_s1",
            title: "Formation du contrat de cautionnement",
            content: `
              <p>Le <span class="hl">cautionnement</span> est un contrat par lequel la <span class="hlg">caution</span> s'engage envers le créancier à <span class="hlg">payer la dette du débiteur</span> si celui-ci est défaillant.</p>
              <h4>1. Conditions de fond</h4>
              <ul>
                <li><span class="hl">Parties</span> : Caution et Créancier. Le débiteur <span class="hlo">n'est pas partie</span>, mais le cautionnement à son insu est interdit (obligation d'information)</li>
                <li><span class="hl">Caractère accessoire</span> : la validité dépend de la dette principale. Si l'obligation principale est nulle, le cautionnement tombe</li>
                <li><span class="hlo">Exception</span> : celui qui cautionne un incapable en connaissance de cause reste tenu</li>
              </ul>
              <h4>2. Formalisme (Preuve et validité)</h4>
              <ul>
                <li>L'<span class="hlg">écrit</span> est requis pour la <span class="hl">preuve</span></li>
                <li><span class="hl">Mention manuscrite obligatoire</span> de la somme maximale garantie, <span class="hlg">en toutes lettres ET en chiffres</span>, par la main de la caution</li>
              </ul>
              <div class="callout"><b>Attention :</b> L'écrit est requis <span class="hl">ad probationem</span> (pour la preuve), pas pour la validité. Mais en pratique, sans écrit = pas de preuve possible en cas de litige.</div>
              <h4>3. Aménagements</h4>
              <ul>
                <li><span class="hlg">Cautionnement général</span> : possible pour des dettes futures, mais doit fixer une somme maximale</li>
                <li><span class="hlg">Cautionnement réel</span> : la caution limite son engagement à la valeur d'un bien précis (cumul sûreté personnelle/réelle)</li>
              </ul>
            `,
            quiz: [
              {
                type: "mcq",
                question: "Concernant le formalisme du cautionnement, quelle affirmation est exacte ?",
                choices: [
                  "L'écrit est une condition de validité absolue",
                  "La mention manuscrite ne concerne que la somme en chiffres",
                  "L'écrit est requis ad probationem avec mention de la somme en lettres ET en chiffres",
                  "Aucun écrit n'est nécessaire"
                ],
                correctAnswer: 2,
                explanation: "L'écrit est requis pour la preuve, avec mention manuscrite en lettres ET en chiffres."
              },
              {
                type: "tf",
                question: "Le débiteur principal est partie au contrat de cautionnement.",
                correctAnswer: false,
                explanation: "Faux. Seules la caution et le créancier sont parties. Le débiteur n'est pas partie."
              },
              {
                type: "mcq",
                question: "Le caractère accessoire du cautionnement signifie :",
                choices: [
                  "La caution n'a qu'un rôle secondaire",
                  "La validité du cautionnement dépend de la dette principale",
                  "Le cautionnement est un contrat optionnel",
                  "La caution peut se rétracter à tout moment"
                ],
                correctAnswer: 1,
                explanation: "Accessoire = le cautionnement suit le sort de l'obligation principale."
              }
            ]
          },
          {
            id: "suretes_ch2_s2",
            title: "Mise en œuvre du cautionnement",
            content: `
              <h4>1. L'appel à la caution</h4>
              <ul>
                <li>Possible seulement si la dette est <span class="hlg">exigible</span> et après <span class="hl">mise en demeure infructueuse</span> du débiteur</li>
                <li>La prorogation ou déchéance du terme ne sont <span class="hlo">pas opposables</span> à la caution pour aggraver son sort</li>
              </ul>
              <h4>2. Cautionnement solidaire vs simple</h4>
              <p><span class="hl">Cautionnement Solidaire</span> (règle de principe OHADA) :</p>
              <ul>
                <li>La <span class="hlg">solidarité est présumée</span></li>
                <li>La caution ne peut invoquer <span class="hlo">ni le bénéfice de discussion, ni celui de division</span></li>
              </ul>
              <p><span class="hl">Cautionnement Simple</span> (si stipulé expressément) :</p>
              <ul>
                <li><span class="hlg">Bénéfice de discussion</span> : saisir les biens du débiteur d'abord</li>
                <li><span class="hlg">Bénéfice de division</span> : diviser la poursuite entre les co-cautions</li>
              </ul>
              <h4>3. Recours après paiement</h4>
              <ul>
                <li><span class="hl">Recours personnel</span> : contre le débiteur pour principal, intérêts et dommages</li>
                <li><span class="hl">Recours subrogatoire</span> : la caution prend la place du créancier avec ses sûretés</li>
                <li><span class="hl">Recours contre les cofidéjusseurs</span> : contribution entre cautions</li>
              </ul>
              <div class="callout"><b>Condition importante :</b> La caution doit <span class="hlo">avertir le débiteur avant de payer</span>. Sinon, elle risque de perdre son recours si le débiteur avait déjà payé.</div>
            `,
            quiz: [
              {
                type: "mcq",
                question: "En droit OHADA, dans un cautionnement solidaire, la caution peut-elle invoquer le bénéfice de discussion ?",
                choices: [
                  "Oui, toujours",
                  "Non, jamais",
                  "Oui, si elle prouve que le débiteur est solvable",
                  "Seulement avec l'accord du créancier"
                ],
                correctAnswer: 1,
                explanation: "La solidarité (présumée en OHADA) prive la caution du bénéfice de discussion."
              },
              {
                type: "tf",
                question: "En droit OHADA, la solidarité de la caution est présumée.",
                correctAnswer: true,
                explanation: "Vrai. Le cautionnement solidaire est le régime de droit commun en OHADA."
              },
              {
                type: "mcq",
                question: "La caution qui a payé sans avertir le débiteur :",
                choices: [
                  "Conserve tous ses recours",
                  "Perd son recours si le débiteur avait déjà payé",
                  "Ne perd que le recours subrogatoire",
                  "Peut demander le double au débiteur"
                ],
                correctAnswer: 1,
                explanation: "Si elle n'avertit pas, elle paie à ses risques et périls (risque de paiement non 'utile')."
              }
            ]
          },
          {
            id: "suretes_ch2_s3",
            title: "Moyens de défense de la caution",
            content: `
              <h4>Exceptions opposables</h4>
              <p>La caution peut opposer <span class="hlg">toutes les exceptions inhérentes à la dette</span> :</p>
              <ul>
                <li><span class="hl">Paiement</span> de la dette par le débiteur</li>
                <li><span class="hl">Compensation</span></li>
                <li><span class="hl">Prescription</span></li>
                <li><span class="hl">Nullité</span> du contrat principal</li>
              </ul>
            `,
            quiz: [
              {
                type: "mcq",
                question: "La caution peut opposer au créancier :",
                choices: [
                  "Uniquement ses propres exceptions",
                  "Toutes les exceptions inhérentes à la dette",
                  "Seulement le paiement",
                  "Aucune exception"
                ],
                correctAnswer: 1,
                explanation: "La caution peut opposer paiement, compensation, prescription, nullité du contrat principal."
              },
              {
                type: "tf",
                question: "Si le contrat principal est nul, le cautionnement subsiste.",
                correctAnswer: false,
                explanation: "Faux. En raison du caractère accessoire, le cautionnement tombe si la dette principale est nulle."
              }
            ]
          }
        ]
      },
      {
        id: "suretes_ch3",
        title: "La Garantie Autonome",
        sections: [
          {
            id: "suretes_ch3_s1",
            title: "Constitution de la garantie autonome",
            content: `
              <p>La <span class="hl">garantie autonome</span> est un engagement de payer une somme déterminée <span class="hlg">à première demande</span> ou selon modalités, sur instruction du donneur d'ordre. C'est un engagement <span class="hlo">indépendant du contrat de base</span>.</p>
              <h4>1. Interdiction majeure</h4>
              <div class="callout"><b>IMPORTANT :</b> Les <span class="hlo">personnes physiques</span> ne peuvent <span class="hl">PAS</span> souscrire de garantie autonome (protection contre la dangerosité de l'acte). C'est une <span class="hlg">nullité d'ordre public</span>.</div>
              <h4>2. Formalisme strict</h4>
              <ul>
                <li>L'<span class="hlg">écrit est une condition de validité</span> (peine de nullité)</li>
                <li>Mentions obligatoires : dénomination, montant, durée, impossibilité d'opposer des exceptions</li>
              </ul>
              <h4>3. Formes usuelles</h4>
              <p>Garantie de bonne fin, de découvert local, de soumission, de restitution d'acompte, de douane.</p>
            `,
            quiz: [
              {
                type: "mcq",
                question: "Une personne physique peut-elle valablement souscrire une garantie autonome ?",
                choices: [
                  "Oui, si l'acte est notarié",
                  "Non, l'article 40 de l'AU l'interdit (nullité d'ordre public)",
                  "Oui, sans restriction",
                  "Oui, avec accord du juge"
                ],
                correctAnswer: 1,
                explanation: "L'interdiction aux personnes physiques est une nullité d'ordre public."
              },
              {
                type: "tf",
                question: "La garantie autonome est indépendante du contrat de base.",
                correctAnswer: true,
                explanation: "Vrai. C'est ce qui la distingue du cautionnement (qui est accessoire)."
              },
              {
                type: "mcq",
                question: "Pour la garantie autonome, l'écrit est :",
                choices: [
                  "Facultatif",
                  "Requis uniquement pour la preuve",
                  "Une condition de validité (nullité sinon)",
                  "Nécessaire seulement au-delà d'un certain montant"
                ],
                correctAnswer: 2,
                explanation: "L'écrit est une condition de validité pour la garantie autonome, sous peine de nullité."
              }
            ]
          },
          {
            id: "suretes_ch3_s2",
            title: "Efficacité de la garantie autonome",
            content: `
              <h4>1. Appel de la garantie</h4>
              <ul>
                <li>Notification écrite de la survenance du fait générateur</li>
                <li>L'appel doit être <span class="hlg">justifié</span> (mention du fait) et parfois documenté</li>
              </ul>
              <h4>2. Paiement et blocage</h4>
              <ul>
                <li>Le garant a <span class="hl">5 jours</span> pour examiner la demande</li>
                <li>Il doit transmettre la demande au donneur d'ordre</li>
              </ul>
              <h4>3. Défense de payer</h4>
              <p>Le donneur d'ordre ne peut bloquer le paiement qu'en cas de :</p>
              <ul>
                <li><span class="hlg">Fraude manifeste</span></li>
                <li><span class="hlg">Demande abusive</span> (ex: absence totale de documents requis)</li>
              </ul>
              <div class="callout"><b>Important :</b> <span class="hlo">Aucune exception tirée du contrat de base</span> (ex: travaux mal faits) n'est recevable. C'est l'<span class="hl">indépendance des signatures</span>.</div>
            `,
            quiz: [
              {
                type: "mcq",
                question: "Le donneur d'ordre peut faire défense de payer au garant si :",
                choices: [
                  "Le contrat de base n'a pas été exécuté correctement",
                  "La demande de paiement est manifestement frauduleuse ou abusive",
                  "Le débiteur est en faillite",
                  "Le délai de garantie est expiré"
                ],
                correctAnswer: 1,
                explanation: "Seule la fraude manifeste ou l'abus permet de bloquer. L'inexécution du contrat de base ne suffit pas."
              },
              {
                type: "tf",
                question: "Si les travaux sont mal faits, le donneur d'ordre peut bloquer le paiement de la garantie autonome.",
                correctAnswer: false,
                explanation: "Faux. Les exceptions tirées du contrat de base ne sont pas recevables (indépendance des signatures)."
              }
            ]
          }
        ]
      },
      {
        id: "suretes_ch4",
        title: "L'Hypothèque",
        sections: [
          {
            id: "suretes_ch4_s1",
            title: "Constitution de l'hypothèque",
            content: `
              <p>L'<span class="hl">hypothèque</span> est l'affectation d'un <span class="hlg">immeuble</span> déterminé ou déterminable garantissant une créance.</p>
              <h4>1. Types d'hypothèque</h4>
              <ul>
                <li><span class="hl">Conventionnelle</span> : par acte notarié (authentique) ou sous seing privé agréé</li>
                <li><span class="hl">Légale</span> : accordée par la loi (masse des créanciers, vendeur d'immeuble, architectes/entrepreneurs)</li>
                <li><span class="hl">Judiciaire</span> : autorisée par le juge à titre conservatoire si la créance est en péril</li>
              </ul>
              <h4>2. L'assiette (l'objet)</h4>
              <ul>
                <li>Uniquement sur des <span class="hlg">immeubles immatriculés</span> (bâtis ou non)</li>
                <li>Sur des droits réels immobiliers (usufruit, bail emphytéotique, droit de superficie)</li>
                <li><span class="hlo">Exclusion</span> : les meubles par nature</li>
                <li><span class="hlg">Extension</span> : l'AU permet l'hypothèque sur des <span class="hl">biens futurs</span> (à condition qu'ils soient déterminables)</li>
              </ul>
              <h4>3. Publicité</h4>
              <ul>
                <li>Inscription au <span class="hl">Livre Foncier</span> obligatoire</li>
                <li><span class="hlo">Sanction du défaut</span> : inopposabilité aux tiers (le créancier perd son droit de suite et de préférence vis-à-vis des tiers)</li>
              </ul>
              <div class="callout"><b>À retenir :</b> Le défaut de publicité sanctionne l'<span class="hl">opposabilité</span>, pas la validité entre les parties.</div>
            `,
            quiz: [
              {
                type: "mcq",
                question: "Quelle hypothèque nécessite une autorisation du juge ?",
                choices: [
                  "L'hypothèque légale de la masse",
                  "L'hypothèque judiciaire conservatoire",
                  "L'hypothèque conventionnelle",
                  "Toutes les hypothèques"
                ],
                correctAnswer: 1,
                explanation: "L'hypothèque judiciaire conservatoire suppose une créance en péril et une autorisation du juge."
              },
              {
                type: "tf",
                question: "Si l'hypothèque n'est pas inscrite au Livre Foncier, elle est nulle entre les parties.",
                correctAnswer: false,
                explanation: "Faux. Elle est valable entre les parties mais INOPPOSABLE aux tiers."
              },
              {
                type: "mcq",
                question: "L'hypothèque peut-elle porter sur un immeuble à construire (futur) ?",
                choices: [
                  "Non, jamais",
                  "Oui, le nouvel AU permet l'hypothèque sur des biens futurs",
                  "Uniquement si les fondations existent",
                  "Seulement pour les immeubles commerciaux"
                ],
                correctAnswer: 1,
                explanation: "L'AU a étendu l'assiette aux biens futurs, à condition qu'ils soient déterminables."
              }
            ]
          },
          {
            id: "suretes_ch4_s2",
            title: "Efficacité de l'hypothèque",
            content: `
              <h4>Prérogatives du créancier hypothécaire</h4>
              <ul>
                <li><span class="hl">Droit de suite</span> : saisir l'immeuble même s'il change de main</li>
                <li><span class="hl">Droit de préférence</span> : être payé en priorité sur le prix de vente</li>
              </ul>
              <h4>Extinction</h4>
              <ul>
                <li><span class="hlg">Voie accessoire</span> : si la dette est payée</li>
                <li><span class="hlg">Purge</span> : vente forcée sur adjudication transférant la propriété libre de charges</li>
              </ul>
            `,
            quiz: [
              {
                type: "mcq",
                question: "Le droit de suite permet au créancier hypothécaire de :",
                choices: [
                  "Suivre le débiteur en justice",
                  "Saisir l'immeuble même s'il a été vendu à un tiers",
                  "Obtenir des dommages-intérêts",
                  "Annuler la vente de l'immeuble"
                ],
                correctAnswer: 1,
                explanation: "Le droit de suite permet de saisir l'immeuble même s'il a changé de propriétaire."
              },
              {
                type: "tf",
                question: "L'hypothèque s'éteint automatiquement quand la dette principale est payée.",
                correctAnswer: true,
                explanation: "Vrai. C'est l'extinction par voie accessoire (caractère accessoire de l'hypothèque)."
              }
            ]
          }
        ]
      },
      {
        id: "suretes_ch5",
        title: "Le Gage",
        sections: [
          {
            id: "suretes_ch5_s1",
            title: "Le nouveau régime du gage",
            content: `
              <p>Le <span class="hl">gage</span> est un contrat accordant un <span class="hlg">droit de préférence</span> sur un bien meuble corporel.</p>
              <h4>Innovations majeures (Nouveau Droit)</h4>
              <ul>
                <li><span class="hl">Définition</span> : le gage n'est plus défini par la dépossession. Il peut être <span class="hlg">avec ou sans dépossession</span></li>
                <li><span class="hl">Objet</span> : biens meubles corporels, <span class="hlg">présents ou futurs</span> (s'ils sont déterminables)</li>
                <li><span class="hl">Formalisme</span> : contrat solennel par écrit (validité), contenant la dette garantie, la quantité et l'espèce des biens</li>
              </ul>
            `,
            quiz: [
              {
                type: "mcq",
                question: "Le gage peut-il être constitué sans dépossession ?",
                choices: [
                  "Non, la dépossession est obligatoire",
                  "Oui, le nouveau droit permet le gage sans dépossession",
                  "Seulement pour les véhicules",
                  "Uniquement avec autorisation du juge"
                ],
                correctAnswer: 1,
                explanation: "Le nouveau droit permet le gage avec OU sans dépossession."
              },
              {
                type: "tf",
                question: "Le gage peut porter sur des biens meubles futurs.",
                correctAnswer: true,
                explanation: "Vrai. Le nouveau droit permet le gage sur des biens présents ou futurs (s'ils sont déterminables)."
              }
            ]
          },
          {
            id: "suretes_ch5_s2",
            title: "Efficacité et réalisation du gage",
            content: `
              <h4>1. Droit de rétention</h4>
              <p>Uniquement si le gage est <span class="hl">avec dépossession</span>.</p>
              <h4>2. Le pacte commissoire</h4>
              <p>Clause permettant au créancier de <span class="hlg">s'approprier le bien sans aller au tribunal</span>.</p>
              <div class="callout"><b>Restriction :</b> Le pacte commissoire est <span class="hlo">interdit</span> si le débiteur est un <span class="hl">particulier</span>, sauf si le bien est une somme d'argent ou coté en bourse. C'est une <span class="hlg">protection du consommateur</span>.</div>
              <h4>3. Opposabilité</h4>
              <p>Deux modes alternatifs :</p>
              <ul>
                <li>Par la <span class="hlg">dépossession</span></li>
                <li>Par l'<span class="hlg">inscription au RCCM</span> (Registre du Commerce et du Crédit Mobilier)</li>
              </ul>
            `,
            quiz: [
              {
                type: "mcq",
                question: "Le pacte commissoire est interdit :",
                choices: [
                  "Si le bien est une somme d'argent",
                  "Si le débiteur est une société",
                  "Si le débiteur est un particulier et que le bien n'est pas coté",
                  "Dans tous les cas"
                ],
                correctAnswer: 2,
                explanation: "Protection du particulier : pacte interdit sauf si le bien est de l'argent ou coté en bourse."
              },
              {
                type: "mcq",
                question: "Pour un gage sans dépossession, l'opposabilité est obtenue par :",
                choices: [
                  "Un simple accord verbal",
                  "Un écrit et une inscription au RCCM",
                  "Le stockage chez un tiers",
                  "Une décision de justice"
                ],
                correctAnswer: 1,
                explanation: "L'inscription au RCCM remplace la publicité par la dépossession."
              },
              {
                type: "tf",
                question: "Le droit de rétention existe même si le gage est sans dépossession.",
                correctAnswer: false,
                explanation: "Faux. Le droit de rétention n'existe que si le gage est AVEC dépossession."
              }
            ]
          }
        ]
      }
    ]
  },

  // ═══════════════════════════════════════════════════════════════════
  // PROCÉDURE CIVILE
  // ═══════════════════════════════════════════════════════════════════
  {
    id: "procedure",
    title: "Procédure Civile",
    icon: "📋",
    color: "from-purple-500 to-pink-600",
    chapters: [
      {
        id: "procedure_ch1",
        title: "L'Action en Justice",
        sections: [
          {
            id: "procedure_ch1_s1",
            title: "Le droit d'agir",
            content: `
              <p>L'<span class="hl">action</span> est le pouvoir de saisir le juge, tandis que la <span class="hlg">demande</span> est l'acte de procédure qui matérialise ce droit (assignation, requête).</p>
              <h4>Conditions d'existence de l'action (4 conditions)</h4>
              <ul>
                <li><span class="hl">L'intérêt à agir</span> : l'avantage espéré. Il doit être :
                  <ul>
                    <li><span class="hlg">Né et actuel</span> (pas hypothétique ni éventuel)</li>
                    <li><span class="hlg">Légitime</span> (protégé par la loi)</li>
                    <li><span class="hlg">Personnel</span> ("nul ne plaide par procureur")</li>
                  </ul>
                </li>
                <li><span class="hl">La qualité</span> : le titre juridique donnant droit d'agir (ex: seul un époux peut demander le divorce)</li>
                <li><span class="hl">La capacité</span> : capacité d'exercice requise (sinon représentation obligatoire)</li>
                <li><span class="hl">Le délai</span> : agir dans le délai prescrit (délai d'action)</li>
              </ul>
            `,
            quiz: [
              {
                type: "mcq",
                question: "Laquelle de ces conditions N'EST PAS requise pour l'intérêt à agir ?",
                choices: [
                  "L'intérêt doit être né et actuel",
                  "L'intérêt doit être légitime",
                  "L'intérêt doit être éventuel",
                  "L'intérêt doit être personnel"
                ],
                correctAnswer: 2,
                explanation: "L'intérêt ne doit être ni hypothétique ni éventuel. Il doit être né et actuel."
              },
              {
                type: "short",
                question: "Quelles sont les 4 conditions d'existence de l'action en justice ?",
                correctAnswer: ["intérêt", "qualité", "capacité", "délai"],
                explanation: "Les 4 conditions : intérêt, qualité, capacité, délai."
              },
              {
                type: "tf",
                question: "'Nul ne plaide par procureur' signifie que l'intérêt doit être personnel.",
                correctAnswer: true,
                explanation: "Vrai. Cet adage exprime l'exigence d'un intérêt personnel à agir."
              }
            ]
          },
          {
            id: "procedure_ch1_s2",
            title: "Les moyens de défense",
            content: `
              <p>Le défendeur dispose de <span class="hl">trois armes procédurales</span> :</p>
              <h4>1. Défense au fond</h4>
              <p>Conteste le <span class="hlg">droit lui-même</span>.</p>
              <div class="callout"><b>Exemple :</b> "Je ne dois pas cet argent car j'ai déjà payé".</div>
              <h4>2. Exception de procédure</h4>
              <p>Conteste la <span class="hlg">régularité de la forme</span> ou de la procédure pour la suspendre ou l'annuler.</p>
              <div class="callout"><b>Exemples :</b> Incompétence du tribunal, nullité de l'assignation, litispendance.</div>
              <p><span class="hlo">Important :</span> Les exceptions de procédure doivent être soulevées <span class="hl">"in limine litis"</span> (au tout début du procès).</p>
              <h4>3. Fin de non-recevoir</h4>
              <p>Fait déclarer la demande <span class="hlg">irrecevable sans examen au fond</span>.</p>
              <div class="callout"><b>Exemples :</b> Prescription, défaut de qualité, autorité de la chose jugée.</div>
            `,
            quiz: [
              {
                type: "mcq",
                question: "Quel moyen de défense doit être soulevé 'in limine litis' ?",
                choices: [
                  "La défense au fond",
                  "La fin de non-recevoir",
                  "L'exception de procédure",
                  "Le recours en cassation"
                ],
                correctAnswer: 2,
                explanation: "Les exceptions de procédure (nullité, incompétence) doivent être soulevées au début du procès."
              },
              {
                type: "mcq",
                question: "La prescription est :",
                choices: [
                  "Une défense au fond",
                  "Une exception de procédure",
                  "Une fin de non-recevoir",
                  "Un recours extraordinaire"
                ],
                correctAnswer: 2,
                explanation: "La prescription est une fin de non-recevoir (irrecevabilité sans examen du fond)."
              },
              {
                type: "short",
                question: "Citez les 3 moyens de défense du défendeur.",
                correctAnswer: ["défense au fond", "exception de procédure", "fin de non-recevoir"],
                explanation: "Défense au fond, exception de procédure, fin de non-recevoir."
              }
            ]
          },
          {
            id: "procedure_ch1_s3",
            title: "Classification des actions",
            content: `
              <h4>Réelle vs Personnelle</h4>
              <ul>
                <li><span class="hl">Action réelle</span> : revendiquer une <span class="hlg">propriété</span></li>
                <li><span class="hl">Action personnelle</span> : réclamer une <span class="hlg">créance</span></li>
              </ul>
              <h4>Mobilière vs Immobilière</h4>
              <p>Détermine souvent la <span class="hlg">compétence territoriale</span>.</p>
              <h4>Pétitoire vs Possessoire</h4>
              <ul>
                <li><span class="hl">Pétitoire</span> : protège le <span class="hlg">fond du droit de propriété</span> (revendication)</li>
                <li><span class="hl">Possessoire</span> : protège la <span class="hlg">possession de fait</span>
                  <ul>
                    <li>La <span class="hlg">complainte</span> : trouble actuel</li>
                    <li>La <span class="hlg">dénonciation de nouvelle œuvre</span> : trouble futur</li>
                    <li>La <span class="hlg">réintégrande</span> : acte de violence ou voie de fait</li>
                  </ul>
                </li>
              </ul>
            `,
            quiz: [
              {
                type: "mcq",
                question: "L'action 'réintégrande' sert à :",
                choices: [
                  "Revendiquer la propriété d'un immeuble",
                  "Faire cesser un trouble actuel de possession",
                  "Faire cesser un acte de violence ou une voie de fait",
                  "Obtenir des dommages-intérêts"
                ],
                correctAnswer: 2,
                explanation: "La réintégrande est une action possessoire contre la violence."
              },
              {
                type: "tf",
                question: "L'action pétitoire protège la possession de fait.",
                correctAnswer: false,
                explanation: "Faux. Le pétitoire protège le fond du droit de propriété. Le possessoire protège la possession de fait."
              }
            ]
          }
        ]
      },
      {
        id: "procedure_ch2",
        title: "Instance et Compétence",
        sections: [
          {
            id: "procedure_ch2_s1",
            title: "Principes directeurs du procès",
            content: `
              <h4>Principe du dispositif</h4>
              <p>Les <span class="hlg">parties sont maîtresses du procès</span> : elles introduisent, conduisent et terminent l'instance.</p>
              <h4>Principe du contradictoire</h4>
              <p><span class="hl">Nul ne peut être jugé sans avoir été entendu ou appelé</span>. La communication des pièces est obligatoire.</p>
              <h4>Immutabilité du litige</h4>
              <p>Une fois fixé, l'objet du litige ne change pas. Le juge ne peut statuer <span class="hlo">ultra petita</span> (au-delà de la demande).</p>
              <div class="callout"><b>Vocabulaire :</b>
              <ul>
                <li><span class="hl">Ultra petita</span> : le juge accorde plus que demandé</li>
                <li><span class="hl">Infra petita</span> : le juge accorde moins que demandé</li>
                <li><span class="hl">Extra petita</span> : le juge statue sur des choses non demandées</li>
              </ul></div>
            `,
            quiz: [
              {
                type: "mcq",
                question: "Si un juge accorde plus que ce qui a été demandé, il statue :",
                choices: [
                  "Infra petita",
                  "Ultra petita",
                  "Extra petita",
                  "Intra petita"
                ],
                correctAnswer: 1,
                explanation: "Ultra petita = le juge adjuge plus qu'il n'a été demandé."
              },
              {
                type: "tf",
                question: "Le principe du contradictoire impose la communication des pièces.",
                correctAnswer: true,
                explanation: "Vrai. Nul ne peut être jugé sans avoir été entendu ou avoir pu prendre connaissance des pièces."
              }
            ]
          },
          {
            id: "procedure_ch2_s2",
            title: "Compétence des tribunaux",
            content: `
              <h4>Tribunal Départemental</h4>
              <ul>
                <li><span class="hlg">Compétence générale</span> :
                  <ul>
                    <li>Dernier ressort (pas d'appel) : jusqu'à <span class="hl">200.000 F</span></li>
                    <li>Premier ressort (appel possible) : jusqu'à <span class="hl">1.000.000 F</span></li>
                  </ul>
                </li>
                <li><span class="hlg">Loyers</span> :
                  <ul>
                    <li>Dernier ressort si ≤ 25.000 F</li>
                    <li>Premier ressort si > 25.000 F et ≤ 50.000 F</li>
                  </ul>
                </li>
                <li><span class="hlg">Compétence exclusive</span> : état civil, successions, saisie sur récolte</li>
              </ul>
              <h4>Tribunal Régional</h4>
              <ul>
                <li>Juge d'appel des décisions du tribunal départemental</li>
                <li>Compétent en premier ressort pour les litiges <span class="hl">> 1.000.000 F</span></li>
              </ul>
            `,
            quiz: [
              {
                type: "mcq",
                question: "Quelle est la compétence du Tribunal Départemental en dernier ressort pour une action personnelle ?",
                choices: [
                  "Jusqu'à 1.000.000 F",
                  "Jusqu'à 200.000 F",
                  "Jusqu'à 500.000 F",
                  "Jusqu'à 100.000 F"
                ],
                correctAnswer: 1,
                explanation: "Dernier ressort jusqu'à 200.000 F. Au-delà et jusqu'à 1.000.000 F, c'est à charge d'appel."
              },
              {
                type: "tf",
                question: "Le Tribunal Régional est compétent en premier ressort pour les litiges supérieurs à 1.000.000 F.",
                correctAnswer: true,
                explanation: "Vrai. Le Tribunal Régional juge en premier ressort les litiges > 1.000.000 F."
              }
            ]
          },
          {
            id: "procedure_ch2_s3",
            title: "Le référé",
            content: `
              <p>Le <span class="hl">référé</span> est une procédure rapide pour obtenir une <span class="hlg">décision provisoire</span> en cas d'urgence.</p>
              <h4>Types de référé</h4>
              <ul>
                <li><span class="hl">Référé urgence</span> : quand il n'y a <span class="hlg">pas de contestation sérieuse</span></li>
                <li><span class="hl">Référé conservatoire</span> : pour <span class="hlg">prévenir un dommage imminent</span></li>
                <li><span class="hl">Référé provision</span> : pour <span class="hlg">demander une avance</span> quand l'obligation n'est pas sérieusement contestable</li>
              </ul>
            `,
            quiz: [
              {
                type: "mcq",
                question: "Le 'référé provision' est utilisé quand :",
                choices: [
                  "L'obligation du défendeur n'est pas sérieusement contestable",
                  "Il faut prévenir un dommage imminent",
                  "Il y a une difficulté d'exécution",
                  "Le tribunal est incompétent"
                ],
                correctAnswer: 0,
                explanation: "Le référé provision permet d'obtenir une avance quand l'obligation n'est pas sérieusement contestable."
              },
              {
                type: "tf",
                question: "Le référé rend une décision définitive.",
                correctAnswer: false,
                explanation: "Faux. Le référé rend une décision PROVISOIRE."
              }
            ]
          }
        ]
      },
      {
        id: "procedure_ch3",
        title: "Les Voies de Recours",
        sections: [
          {
            id: "procedure_ch3_s1",
            title: "Voies ordinaires",
            content: `
              <h4>L'Appel</h4>
              <ul>
                <li>Devant la <span class="hl">Cour d'appel</span> (ou Tribunal Régional pour les petites affaires)</li>
                <li>Délai : <span class="hlg">2 mois</span></li>
                <li>Effet <span class="hlg">suspensif</span></li>
              </ul>
              <h4>L'Opposition</h4>
              <ul>
                <li>Voie de <span class="hl">rétractation</span> contre un <span class="hlg">jugement rendu par défaut</span></li>
                <li>Délai : <span class="hlg">15 jours</span></li>
              </ul>
            `,
            quiz: [
              {
                type: "mcq",
                question: "Quel est le délai de principe pour interjeter appel ?",
                choices: [
                  "15 jours",
                  "1 mois",
                  "2 mois",
                  "6 mois"
                ],
                correctAnswer: 2,
                explanation: "Le délai d'appel est de 2 mois (sauf prise en compte de la distance)."
              },
              {
                type: "tf",
                question: "L'opposition est une voie de recours contre les jugements rendus par défaut.",
                correctAnswer: true,
                explanation: "Vrai. L'opposition permet à celui qui a été jugé par défaut de faire rejuger l'affaire."
              }
            ]
          },
          {
            id: "procedure_ch3_s2",
            title: "Voies extraordinaires",
            content: `
              <h4>Pourvoi en Cassation</h4>
              <ul>
                <li>Devant la <span class="hl">Cour Suprême</span> (ou <span class="hlg">CCJA</span> pour le droit OHADA)</li>
                <li><span class="hlo">Ne rejuge pas les faits</span>, mais la bonne application de la loi</li>
              </ul>
              <h4>Tierce Opposition</h4>
              <p>Un <span class="hl">tiers</span> attaque un jugement qui nuit à ses droits.</p>
              <h4>Requête civile</h4>
              <p>Pour <span class="hlg">rétracter</span> une décision (ex: le juge a statué sur des choses non demandées).</p>
              <p>Délai : <span class="hl">6 mois</span>.</p>
            `,
            quiz: [
              {
                type: "mcq",
                question: "Laquelle de ces voies de recours est 'extraordinaire' ?",
                choices: [
                  "L'opposition",
                  "L'appel",
                  "La tierce opposition",
                  "Le référé"
                ],
                correctAnswer: 2,
                explanation: "La tierce opposition est une voie extraordinaire. L'appel et l'opposition sont des voies ordinaires."
              },
              {
                type: "mcq",
                question: "Qui est compétent pour le pourvoi en cassation concernant l'application d'un Acte Uniforme OHADA ?",
                choices: [
                  "La Cour Suprême du Sénégal",
                  "La Cour d'Appel de Dakar",
                  "La CCJA (Cour Commune de Justice et d'Arbitrage)",
                  "Le Tribunal Régional"
                ],
                correctAnswer: 2,
                explanation: "La CCJA (basée à Abidjan) est compétente pour le droit OHADA."
              },
              {
                type: "tf",
                question: "La Cour de cassation rejuge les faits et le droit.",
                correctAnswer: false,
                explanation: "Faux. La Cour de cassation ne juge que le droit, elle ne rejuge pas les faits."
              }
            ]
          },
          {
            id: "procedure_ch3_s3",
            title: "Nullité des actes de procédure",
            content: `
              <h4>Conditions de la nullité pour vice de forme</h4>
              <p>Deux conditions cumulatives :</p>
              <ul>
                <li>Un <span class="hl">texte</span> qui prévoit la nullité</li>
                <li>La preuve d'un <span class="hlg">grief</span> (préjudice)</li>
              </ul>
              <div class="callout"><b>Adage :</b> <span class="hl">"Pas de nullité sans texte, pas de nullité sans grief"</span>.</div>
            `,
            quiz: [
              {
                type: "mcq",
                question: "La nullité d'un acte de procédure pour vice de forme nécessite :",
                choices: [
                  "Uniquement un texte",
                  "Un texte et la preuve d'un grief (préjudice)",
                  "Aucune condition",
                  "Uniquement un grief"
                ],
                correctAnswer: 1,
                explanation: "'Pas de nullité sans texte, pas de nullité sans grief' : les deux conditions sont requises."
              },
              {
                type: "tf",
                question: "Un acte de procédure peut être annulé même si aucun texte ne le prévoit.",
                correctAnswer: false,
                explanation: "Faux. 'Pas de nullité sans texte' : il faut un texte qui prévoit la nullité."
              }
            ]
          }
        ]
      }
    ]
  },
  // ═══════════════════════════════════════════════════════════════════
  // DROIT DU TRAVAIL
  // ═══════════════════════════════════════════════════════════════════
  {
    id: "travail",
    title: "Droit du Travail",
    icon: "👷",
    color: "from-amber-500 to-orange-600",
    chapters: [
      {
        id: "travail_ch1",
        title: "Le Contrat de Travail",
        sections: [
          {
            id: "travail_ch1_s1",
            title: "Types et durée des contrats",
            content: `
              <p>Le droit du travail distingue plusieurs types de contrats :</p>
              <h4>Contrat à Durée Déterminée (CDD)</h4>
              <p>Le <span class="hl">CDD</span> et le <span class="hl">contrat de travail temporaire</span> ont une durée en principe de <span class="hlg">deux ans</span> maximum.</p>
              <h4>Contrat à Durée Indéterminée (CDI)</h4>
              <p>Le <span class="hl">CDI</span> peut toujours cesser par la <span class="hlg">volonté de l'une des parties</span> ou par l'accord des deux parties.</p>
              <h4>Contrat d'engagement à l'essai</h4>
              <p>Le contrat d'engagement à l'essai peut, à tout moment, cesser <span class="hlo">sans préavis et sans indemnité</span> par la volonté de l'une des parties, sauf dispositions particulières expressément prévues au contrat.</p>
              <h4>Formalités du CDD de deux ans</h4>
              <p>L'<span class="hl">écrit</span> contenant certaines mentions (nature, durée) est obligatoire pour la validité de tous les contrats particuliers et des contrats nécessitant l'installation du salarié hors de sa résidence habituelle.</p>
            `,
            quiz: [
              {
                type: "mcq",
                question: "Quelle est la durée maximum du CDD et du contrat de travail temporaire ?",
                choices: [
                  "1 an",
                  "2 ans",
                  "3 ans",
                  "6 mois"
                ],
                correctAnswer: 1,
                explanation: "Le CDD et le contrat de travail temporaire ont une durée en principe de deux ans maximum."
              },
              {
                type: "tf",
                question: "Le contrat d'engagement à l'essai nécessite un préavis pour être rompu.",
                correctAnswer: false,
                explanation: "Faux. Le contrat d'engagement à l'essai peut cesser sans préavis et sans indemnité."
              },
              {
                type: "short",
                question: "Quels contrats ont une durée maximum de deux ans ?",
                correctAnswer: ["CDD", "contrat durée déterminée", "travail temporaire", "intérim"],
                explanation: "Le CDD et le contrat de travail temporaire ont une durée de deux ans maximum."
              }
            ]
          },
          {
            id: "travail_ch1_s2",
            title: "Modification du contrat de travail",
            content: `
              <p>Le contrat de travail peut subir différentes modifications :</p>
              <h4>Modification dans la situation juridique</h4>
              <p>Elle consiste à <span class="hl">transférer l'activité et les moyens matériels</span> de l'entreprise (ex: rachat d'entreprise).</p>
              <h4>Modification substantielle</h4>
              <p>Elle porte sur les <span class="hlg">éléments essentiels</span> du contrat (salaire, fonction, lieu de travail). Elle nécessite l'<span class="hlo">accord du salarié</span>.</p>
              <h4>Modification non substantielle</h4>
              <p>Elle porte sur les <span class="hlg">éléments non essentiels</span> du contrat et peut être imposée par l'employeur.</p>
            `,
            quiz: [
              {
                type: "mcq",
                question: "La modification substantielle porte sur :",
                choices: [
                  "Les éléments non essentiels",
                  "Les éléments essentiels",
                  "Le transfert d'entreprise",
                  "Le règlement intérieur"
                ],
                correctAnswer: 1,
                explanation: "La modification substantielle porte sur les éléments essentiels du contrat."
              },
              {
                type: "tf",
                question: "Le transfert d'activité et de moyens matériels est une modification dans la situation juridique.",
                correctAnswer: true,
                explanation: "Vrai. C'est la définition de la modification dans la situation juridique."
              },
              {
                type: "short",
                question: "Quel type de modification porte sur les éléments essentiels du contrat ?",
                correctAnswer: ["modification substantielle", "substantielle"],
                explanation: "La modification substantielle porte sur les éléments essentiels (salaire, fonction, lieu)."
              }
            ]
          }
        ]
      },
      {
        id: "travail_ch2",
        title: "Obligations des Parties",
        sections: [
          {
            id: "travail_ch2_s1",
            title: "Obligations du travailleur",
            content: `
              <h4>Obligation principale</h4>
              <p>L'obligation principale du travailleur est l'<span class="hl">exécution personnelle, consciencieuse et loyale</span> du travail prévu au contrat.</p>
              <h4>Horaires de travail</h4>
              <ul>
                <li><span class="hlg">Travail de jour</span> : entre 5h et 22h</li>
                <li><span class="hlg">Travail de nuit</span> : entre 22h et 5h</li>
              </ul>
              <h4>Obligations facultatives (clauses)</h4>
              <p>Le contrat peut imposer des clauses particulières :</p>
              <ul>
                <li><span class="hl">Clause de non-concurrence</span> : ne pas concurrencer l'employeur après la rupture</li>
                <li><span class="hl">Clause de dédit-formation</span> : ne pas quitter après une formation aux frais de l'entreprise</li>
                <li><span class="hl">Clause de mobilité</span> : accepter d'être déplacé ou muté</li>
              </ul>
            `,
            quiz: [
              {
                type: "mcq",
                question: "Le travail de nuit s'effectue entre :",
                choices: [
                  "20h et 6h",
                  "22h et 5h",
                  "21h et 6h",
                  "23h et 5h"
                ],
                correctAnswer: 1,
                explanation: "Le travail de nuit s'effectue entre 22 heures et 5 heures."
              },
              {
                type: "tf",
                question: "La clause de non-concurrence interdit de concurrencer l'employeur après la rupture du contrat.",
                correctAnswer: true,
                explanation: "Vrai. La clause de non-concurrence empêche le salarié de concurrencer son ancien employeur."
              },
              {
                type: "short",
                question: "Quelle est l'obligation principale du travailleur ?",
                correctAnswer: ["exécution", "travail", "personnelle", "consciencieuse", "loyale"],
                explanation: "L'obligation principale est l'exécution personnelle, consciencieuse et loyale du travail."
              }
            ]
          },
          {
            id: "travail_ch2_s2",
            title: "Obligations de l'employeur",
            content: `
              <h4>Obligation principale</h4>
              <p>L'obligation principale de l'employeur est le <span class="hl">paiement de la rémunération</span> prévue au contrat conformément à la loi.</p>
              <h4>Composantes de la rémunération</h4>
              <p>La rémunération comprend :</p>
              <ul>
                <li>Le <span class="hlg">salaire de base</span></li>
                <li>Les <span class="hlg">compléments</span> et <span class="hlg">indemnités inhérentes</span> au travail (indemnité de responsabilité, de fonction)</li>
              </ul>
              <p><span class="hlo">Ne sont pas inclus</span> : les remboursements de frais (transport, panier, déplacement) et les sommes insaisissables (prélèvements obligatoires, prestations sociales).</p>
              <h4>Rémunération brute vs nette</h4>
              <ul>
                <li><span class="hl">Brute</span> : avant prélèvement des cotisations et impôts</li>
                <li><span class="hl">Nette</span> : après prélèvement des cotisations et impôts</li>
              </ul>
            `,
            quiz: [
              {
                type: "mcq",
                question: "L'obligation principale de l'employeur est :",
                choices: [
                  "Former le salarié",
                  "Le paiement de la rémunération",
                  "Fournir un logement",
                  "Assurer la sécurité"
                ],
                correctAnswer: 1,
                explanation: "L'obligation principale de l'employeur est le paiement de la rémunération."
              },
              {
                type: "tf",
                question: "L'indemnité de transport fait partie de la rémunération cessible et saisissable.",
                correctAnswer: false,
                explanation: "Faux. L'indemnité de transport est un remboursement de frais, non inclus dans la rémunération cessible."
              },
              {
                type: "short",
                question: "Quelle est la différence entre rémunération brute et nette ?",
                correctAnswer: ["cotisations", "impôts", "prélèvements", "avant", "après"],
                explanation: "Brute = avant prélèvements, Nette = après prélèvements des cotisations et impôts."
              }
            ]
          }
        ]
      },
      {
        id: "travail_ch3",
        title: "Durée du Travail et Repos",
        sections: [
          {
            id: "travail_ch3_s1",
            title: "Durée légale du travail",
            content: `
              <h4>Durée maximum</h4>
              <p>Le temps de travail ne peut en principe excéder :</p>
              <ul>
                <li><span class="hl">40 heures par semaine</span> (35h en France)</li>
                <li><span class="hl">173 heures 33 par mois</span></li>
                <li><span class="hl">2352 heures par an</span> dans les établissements agricoles</li>
              </ul>
            `,
            quiz: [
              {
                type: "mcq",
                question: "La durée maximum du travail par semaine est de :",
                choices: [
                  "35 heures",
                  "40 heures",
                  "45 heures",
                  "48 heures"
                ],
                correctAnswer: 1,
                explanation: "Le temps de travail ne peut excéder 40 heures par semaine au Sénégal."
              },
              {
                type: "tf",
                question: "La durée maximum mensuelle du travail est de 173 heures 33.",
                correctAnswer: true,
                explanation: "Vrai. C'est l'équivalent mensuel des 40 heures hebdomadaires."
              }
            ]
          },
          {
            id: "travail_ch3_s2",
            title: "Congés payés",
            content: `
              <h4>Période de référence</h4>
              <p>Le congé payé est le repos que le travailleur peut prendre après une période minimale de <span class="hl">12 mois de service effectif</span> (période de référence).</p>
              <h4>Durée minimum</h4>
              <p>Le congé a une durée minimum de <span class="hlg">2 jours ouvrables par mois</span>, soit <span class="hl">24 jours ouvrables par an</span>.</p>
              <p>Pour les travailleurs recrutés à l'étranger : <span class="hlo">5 jours ouvrables par mois</span>.</p>
              <h4>Majorations</h4>
              <p>Le congé peut être majoré pour :</p>
              <ul>
                <li>Ancienneté</li>
                <li>Enfant à charge (femme salariée)</li>
                <li>Minorité</li>
                <li>Logement à proximité (concierge)</li>
              </ul>
              <h4>Report du congé</h4>
              <p>Le congé peut être reporté d'un commun accord <span class="hl">sans excéder 3 ans</span>, avec un minimum de 6 jours ouvrables par an.</p>
            `,
            quiz: [
              {
                type: "mcq",
                question: "La durée minimum du congé payé annuel est de :",
                choices: [
                  "12 jours ouvrables",
                  "24 jours ouvrables",
                  "30 jours ouvrables",
                  "2 semaines"
                ],
                correctAnswer: 1,
                explanation: "La durée minimum est de 2 jours par mois soit 24 jours ouvrables par an."
              },
              {
                type: "tf",
                question: "Le congé payé peut être reporté jusqu'à 5 ans.",
                correctAnswer: false,
                explanation: "Faux. Le report ne peut excéder 3 ans."
              },
              {
                type: "short",
                question: "Quelle est la période de référence pour avoir droit au congé payé ?",
                correctAnswer: ["12 mois", "un an", "1 an", "douze mois"],
                explanation: "Le congé est acquis après 12 mois de service effectif (période de référence)."
              }
            ]
          },
          {
            id: "travail_ch3_s3",
            title: "Types de repos et suspensions",
            content: `
              <h4>Types de repos</h4>
              <ul>
                <li><span class="hl">Repos journalier/quotidien</span> : après une journée de travail</li>
                <li><span class="hl">Repos hebdomadaire</span> : obligatoire, après une semaine de travail</li>
              </ul>
              <h4>Suspensions du contrat</h4>
              <ul>
                <li><span class="hlg">Congé de maternité</span> : après l'accouchement</li>
                <li><span class="hlg">Suspension occasionnelle</span> : en cas de maladie ou d'accident</li>
              </ul>
              <h4>Jours fériés</h4>
              <p><span class="hl">Jours chômés et payés</span> : Tabaski, Pâques, 1er Mai, Tamxarit</p>
              <p><span class="hlo">Jours simplement chômés</span> : 1er janvier, 15 août</p>
            `,
            quiz: [
              {
                type: "mcq",
                question: "Le 1er Mai est un jour :",
                choices: [
                  "Travaillé normalement",
                  "Chômé uniquement",
                  "Chômé et payé",
                  "Non férié"
                ],
                correctAnswer: 2,
                explanation: "Le 1er Mai est un jour chômé ET payé."
              },
              {
                type: "tf",
                question: "Le 1er janvier est un jour chômé et payé.",
                correctAnswer: false,
                explanation: "Faux. Le 1er janvier est simplement chômé, pas payé."
              },
              {
                type: "short",
                question: "Quel type de suspension intervient en cas de maladie ou accident ?",
                correctAnswer: ["suspension occasionnelle", "occasionnelle", "maladie", "accident"],
                explanation: "En cas de maladie ou accident, c'est une suspension occasionnelle du contrat."
              }
            ]
          }
        ]
      },
      {
        id: "travail_ch4",
        title: "Rupture du Contrat de Travail",
        sections: [
          {
            id: "travail_ch4_s1",
            title: "Modes de rupture du CDI",
            content: `
              <h4>Démission</h4>
              <p>Rupture du CDI décidée par le <span class="hl">travailleur</span> de manière libre, claire et unilatérale.</p>
              <h4>Licenciement</h4>
              <p>Rupture à l'initiative de l'<span class="hl">employeur</span>. Peut être pour faute ou pour motif économique.</p>
              <h4>Retraite</h4>
              <p>Rupture du contrat du travailleur âgé en principe de <span class="hlg">60 ans</span>.</p>
              <h4>Indemnités de rupture</h4>
              <ul>
                <li><span class="hl">Indemnité compensatrice de préavis</span> : due normalement par l'employeur</li>
                <li><span class="hl">Indemnité de licenciement</span> : après 12 mois d'ancienneté minimum</li>
                <li><span class="hl">Indemnité de retraite</span> : à 60 ans</li>
                <li><span class="hl">Indemnité spéciale</span> : pour motif économique</li>
              </ul>
            `,
            quiz: [
              {
                type: "mcq",
                question: "La démission est une rupture du contrat à l'initiative :",
                choices: [
                  "De l'employeur",
                  "Du travailleur",
                  "Du juge",
                  "De l'inspecteur du travail"
                ],
                correctAnswer: 1,
                explanation: "La démission est la rupture décidée par le travailleur."
              },
              {
                type: "tf",
                question: "L'indemnité de licenciement est due après 6 mois d'ancienneté.",
                correctAnswer: false,
                explanation: "Faux. L'indemnité de licenciement est due après 12 mois d'ancienneté."
              },
              {
                type: "short",
                question: "À quel âge intervient en principe la retraite ?",
                correctAnswer: ["60 ans", "soixante", "60"],
                explanation: "La retraite intervient en principe à 60 ans."
              }
            ]
          },
          {
            id: "travail_ch4_s2",
            title: "Protection de la femme enceinte",
            content: `
              <h4>Droits de la femme enceinte</h4>
              <ul>
                <li>Elle peut <span class="hl">démissionner sans préavis</span> et sans indemnité durant la grossesse et le repos d'allaitement</li>
                <li>Elle <span class="hlg">ne peut pas être licenciée</span> pendant le congé de maternité</li>
                <li>Elle a droit à des <span class="hl">indemnités</span></li>
              </ul>
              <div class="callout"><b>Important :</b> La protection contre le licenciement s'applique pendant la période de suspension légale (congé de maternité). Le licenciement n'est possible qu'<span class="hlo">après cette période</span>.</div>
            `,
            quiz: [
              {
                type: "mcq",
                question: "La femme enceinte peut-elle démissionner sans préavis ?",
                choices: [
                  "Non, jamais",
                  "Oui, pendant la grossesse et le repos d'allaitement",
                  "Oui, mais avec indemnité",
                  "Uniquement après l'accouchement"
                ],
                correctAnswer: 1,
                explanation: "La femme enceinte peut démissionner sans préavis pendant la grossesse et le repos d'allaitement."
              },
              {
                type: "tf",
                question: "La femme enceinte peut être licenciée pendant son congé de maternité.",
                correctAnswer: false,
                explanation: "Faux. Elle ne peut pas être licenciée pendant le congé de maternité."
              }
            ]
          }
        ]
      },
      {
        id: "travail_ch5",
        title: "Représentation du Personnel",
        sections: [
          {
            id: "travail_ch5_s1",
            title: "Délégué du personnel",
            content: `
              <h4>Élection obligatoire</h4>
              <p>L'élection du délégué du personnel est obligatoire dans les entreprises de <span class="hl">plus de 10 travailleurs</span>.</p>
              <h4>Rôles du délégué</h4>
              <ul>
                <li><span class="hlg">Présenter les réclamations</span> des travailleurs</li>
                <li><span class="hlg">Contrôler l'application</span> du droit du travail</li>
                <li><span class="hlg">Émettre des avis consultatifs</span></li>
              </ul>
              <h4>Protection du délégué</h4>
              <p>Le délégué licencié <span class="hlo">sans autorisation de l'inspecteur du travail</span> peut demander réparation auprès du <span class="hl">Ministre du travail</span> ou de la <span class="hl">Cour suprême</span>.</p>
            `,
            quiz: [
              {
                type: "mcq",
                question: "L'élection du délégué du personnel est obligatoire à partir de :",
                choices: [
                  "5 travailleurs",
                  "10 travailleurs",
                  "Plus de 10 travailleurs",
                  "20 travailleurs"
                ],
                correctAnswer: 2,
                explanation: "L'élection est obligatoire dans les entreprises de plus de 10 travailleurs."
              },
              {
                type: "tf",
                question: "Le délégué du personnel présente les revendications des travailleurs.",
                correctAnswer: false,
                explanation: "Faux. Le délégué présente les RÉCLAMATIONS. Les REVENDICATIONS sont présentées par le syndicat."
              },
              {
                type: "short",
                question: "Qui peut présenter les réclamations des travailleurs ?",
                correctAnswer: ["délégué", "délégué du personnel"],
                explanation: "C'est le délégué du personnel qui présente les réclamations."
              }
            ]
          },
          {
            id: "travail_ch5_s2",
            title: "Syndicat et chef d'entreprise",
            content: `
              <h4>Rôles du syndicat</h4>
              <ul>
                <li><span class="hlg">Présenter les revendications</span> des travailleurs</li>
                <li><span class="hlg">Défendre les travailleurs</span> devant les juridictions</li>
              </ul>
              <p>Le syndicat peut être constitué <span class="hl">librement et sans autorisation</span> par les travailleurs.</p>
              <h4>Rôles du chef d'entreprise</h4>
              <ul>
                <li><span class="hlg">Prendre des décisions</span> sur le matériel et les personnels</li>
                <li><span class="hlg">Élaborer des règles</span> générales et obligatoires (règlement intérieur)</li>
              </ul>
            `,
            quiz: [
              {
                type: "mcq",
                question: "Qui défend les travailleurs devant les juridictions ?",
                choices: [
                  "Le délégué du personnel",
                  "Le syndicat",
                  "Le chef d'entreprise",
                  "L'inspecteur du travail"
                ],
                correctAnswer: 1,
                explanation: "Le syndicat défend les travailleurs devant les juridictions."
              },
              {
                type: "tf",
                question: "La constitution d'un syndicat nécessite une autorisation préalable.",
                correctAnswer: false,
                explanation: "Faux. Le syndicat peut être constitué librement et sans autorisation."
              },
              {
                type: "short",
                question: "Quelle est la différence entre réclamation et revendication ?",
                correctAnswer: ["délégué", "syndicat", "réclamation", "revendication"],
                explanation: "Réclamations = délégué du personnel. Revendications = syndicat."
              }
            ]
          }
        ]
      },
      {
        id: "travail_ch6",
        title: "Contentieux du Travail",
        sections: [
          {
            id: "travail_ch6_s1",
            title: "Tribunal du travail",
            content: `
              <h4>Compétence</h4>
              <p>Les <span class="hl">tribunaux du travail</span> sont exclusivement compétents pour connaître en première instance des différends individuels de travail.</p>
              <h4>Compétence territoriale</h4>
              <p>Le tribunal territorialement compétent est en principe celui du <span class="hlg">lieu d'exécution du travail</span>.</p>
              <div class="callout"><b>Exemple :</b> Un travailleur habitué à Thiès, employeur à Tambacounda, contrat conclu à Dakar et exécuté à Saint-Louis → Tribunal de <span class="hl">Saint-Louis</span> (lieu d'exécution).</div>
            `,
            quiz: [
              {
                type: "mcq",
                question: "Le tribunal du travail compétent est celui du lieu :",
                choices: [
                  "Du domicile du travailleur",
                  "Du siège de l'employeur",
                  "D'exécution du travail",
                  "De conclusion du contrat"
                ],
                correctAnswer: 2,
                explanation: "Le tribunal compétent est celui du lieu d'exécution du travail."
              },
              {
                type: "tf",
                question: "Les litiges individuels du travail relèvent des tribunaux de grande instance.",
                correctAnswer: false,
                explanation: "Faux. Ils relèvent exclusivement des tribunaux du travail."
              }
            ]
          }
        ]
      }
    ]
  },
  // ═══════════════════════════════════════════════════════════════════
  // GOUVERNANCE ET FRAUDE
  // ═══════════════════════════════════════════════════════════════════
  {
    id: "gouvernance",
    title: "Gouvernance & Fraude",
    icon: "🏛️",
    color: "from-emerald-500 to-teal-600",
    chapters: [
      {
        id: "gouvernance_ch1",
        title: "Les origines de la gouvernance",
        sections: [
          {
            id: "gouvernance_ch1_s1",
            title: "Origine et évolution du terme",
            content: `
              <p>Le terme <span class="hl">gouvernance</span> dérive du grec <span class="hlg">"kubernan"</span> signifiant piloter un navire, évoluant en latin vers <span class="hlg">"gubernare"</span> pour désigner le gouvernement des hommes.</p>
              <p>Utilisation en français au <span class="hl">XIIIe siècle</span>, puis abandon au profit de "gouvernement" jusqu'aux années 1980.</p>
              <h4>Les étapes de la gouvernance</h4>
              <ul>
                <li><span class="hl">L'économie fermée</span> : auto-suffisance locale, gestion directe sans besoin de gouvernance.</li>
                <li><span class="hl">L'économie artisanale</span> : développement urbain sans gouvernance formalisée.</li>
                <li><span class="hl">L'économie de marché</span> : expansion du commerce nécessite des règles et institutions, amorçant la gouvernance.</li>
              </ul>
            `,
            quiz: [
              {
                type: "mcq",
                question: "De quel mot grec dérive le terme 'gouvernance' ?",
                choices: ["Kubernan", "Demokratia", "Politeia", "Archein"],
                correctAnswer: 0,
                explanation: "Le terme gouvernance dérive du grec 'kubernan' signifiant piloter un navire."
              },
              {
                type: "tf",
                question: "Le terme 'gouvernance' a été utilisé sans interruption en français depuis le XIIIe siècle.",
                correctAnswer: false,
                explanation: "Le terme a été abandonné au profit de 'gouvernement' jusqu'aux années 1980."
              },
              {
                type: "short",
                question: "Citez les trois étapes historiques de la gouvernance.",
                correctAnswer: ["économie fermée", "économie artisanale", "économie de marché"],
                explanation: "Les trois étapes sont : l'économie fermée, l'économie artisanale et l'économie de marché."
              }
            ]
          },
          {
            id: "gouvernance_ch1_s2",
            title: "L'économie industrielle et la théorie de l'agence",
            content: `
              <h4>Le pouvoir des managers</h4>
              <p>Les <span class="hl">révolutions technologiques</span> transforment le capitalisme avec un rôle croissant des <span class="hl">managers</span>. Les dérives du pouvoir managérial dans les années 1980 entraînent des réformes de gouvernance.</p>
              <h4>Restauration du pouvoir des actionnaires</h4>
              <p>Les réactions aux scandales comme <span class="hlg">Enron</span> et <span class="hlg">WorldCom</span> renforcent la gouvernance. Implication des <span class="hl">actionnaires</span> pour contrôler les décisions stratégiques et les rémunérations.</p>
              <h4>La théorie de l'agence</h4>
              <p>La <span class="hl">théorie de l'agence</span> souligne les <span class="hlg">conflits d'intérêts</span> entre actionnaires et dirigeants, justifiant la gouvernance comme mécanisme de contrôle.</p>
              <h4>Extension de la gouvernance</h4>
              <p>Initialement axée sur le contrôle financier, elle intègre maintenant des aspects comme le <span class="hl">développement durable</span> et l'<span class="hl">éthique</span>.</p>
            `,
            quiz: [
              {
                type: "mcq",
                question: "Quels scandales ont renforcé la gouvernance d'entreprise ?",
                choices: ["Enron et WorldCom", "Lehman Brothers et AIG", "Madoff et Theranos", "Parmalat et Vivendi"],
                correctAnswer: 0,
                explanation: "Les scandales Enron et WorldCom ont conduit à des réformes majeures de gouvernance."
              },
              {
                type: "tf",
                question: "La théorie de l'agence met en évidence les conflits d'intérêts entre actionnaires et dirigeants.",
                correctAnswer: true,
                explanation: "La théorie de l'agence souligne ces conflits et justifie la gouvernance comme mécanisme de contrôle."
              },
              {
                type: "short",
                question: "Quels aspects la gouvernance intègre-t-elle au-delà du contrôle financier ?",
                correctAnswer: ["développement durable", "éthique"],
                explanation: "La gouvernance s'étend au développement durable et à l'éthique."
              }
            ]
          }
        ]
      },
      {
        id: "gouvernance_ch2",
        title: "La définition de la gouvernance",
        sections: [
          {
            id: "gouvernance_ch2_s1",
            title: "Objectifs et approches",
            content: `
              <p>La <span class="hl">gouvernance d'entreprise</span> vise à encadrer les relations entre <span class="hl">dirigeants</span> et <span class="hl">actionnaires</span>.</p>
              <p>Ses objectifs évoluent : initialement axée sur la limitation des risques et le contrôle du management, elle inclut désormais la <span class="hlg">création de valeur</span> pour toutes les parties prenantes.</p>
              <h4>Deux approches principales</h4>
              <ul>
                <li><span class="hl">Valeur actionnariale</span> : maximisation du cours boursier.</li>
                <li><span class="hl">Valeur partenariale</span> : création de richesse pour toutes les parties prenantes.</li>
              </ul>
            `,
            quiz: [
              {
                type: "mcq",
                question: "Quelle approche vise la maximisation du cours boursier ?",
                choices: ["La valeur actionnariale", "La valeur partenariale", "La valeur sociale", "La valeur intrinsèque"],
                correctAnswer: 0,
                explanation: "La valeur actionnariale se concentre sur la maximisation du cours boursier."
              },
              {
                type: "tf",
                question: "La valeur partenariale vise uniquement les intérêts des actionnaires.",
                correctAnswer: false,
                explanation: "La valeur partenariale crée de la richesse pour toutes les parties prenantes, pas seulement les actionnaires."
              }
            ]
          },
          {
            id: "gouvernance_ch2_s2",
            title: "Loi Sarbanes-Oxley et Rapport Breeden",
            content: `
              <h4>Loi Sarbanes-Oxley</h4>
              <p>Instaurée après les scandales financiers de 2001-2002 (<span class="hlg">Enron</span>, <span class="hlg">WorldCom</span>), cette loi vise à restaurer la confiance des investisseurs en renforçant la <span class="hl">fiabilité des informations financières</span>, en encadrant le rôle des auditeurs et des conseils, et en imposant des règles strictes de gouvernance.</p>
              <p>Elle prévoit des <span class="hl">sanctions sévères</span> en cas de fraude.</p>
              <h4>Propositions du Rapport Breeden</h4>
              <ul>
                <li>Interdiction du cumul des fonctions de <span class="hl">CEO et Président du Conseil</span>.</li>
                <li>Exigences de compétences spécifiques pour les administrateurs.</li>
                <li>Limites sur le nombre de mandats d'administrateurs.</li>
                <li>Obligations de réunions et de visites des installations.</li>
              </ul>
            `,
            quiz: [
              {
                type: "mcq",
                question: "Quand la loi Sarbanes-Oxley a-t-elle été instaurée ?",
                choices: ["Après les scandales de 2001-2002", "Après la crise de 2008", "En 1990", "En 2010"],
                correctAnswer: 0,
                explanation: "La loi a été instaurée après les scandales Enron et WorldCom de 2001-2002."
              },
              {
                type: "tf",
                question: "Le rapport Breeden recommande le cumul des fonctions de CEO et Président du Conseil.",
                correctAnswer: false,
                explanation: "Le rapport Breeden propose au contraire l'interdiction de ce cumul."
              },
              {
                type: "short",
                question: "Quel est l'objectif principal de la loi Sarbanes-Oxley ?",
                correctAnswer: ["restaurer la confiance", "fiabilité", "informations financières"],
                explanation: "La loi vise à restaurer la confiance des investisseurs en renforçant la fiabilité des informations financières."
              }
            ]
          }
        ]
      },
      {
        id: "gouvernance_ch3",
        title: "Les différentes formes de gouvernance",
        sections: [
          {
            id: "gouvernance_ch3_s1",
            title: "Forme juridique et taille de l'entreprise",
            content: `
              <h4>Forme juridique</h4>
              <p>Le choix de la <span class="hl">forme juridique</span> (<span class="hlg">SA</span>, <span class="hlg">SAS</span>, <span class="hlg">SARL</span>, société en commandite par actions) influence fortement la gouvernance, dictant les règles et obligations spécifiques.</p>
              <h4>Taille de l'entreprise</h4>
              <p>Les entreprises sont catégorisées en :</p>
              <ul>
                <li><span class="hl">Micro-entreprises</span></li>
                <li><span class="hl">PME</span></li>
                <li><span class="hl">ETI</span> (Entreprises de Taille Intermédiaire)</li>
                <li><span class="hl">Grandes entreprises</span></li>
              </ul>
              <p>Chacune a des besoins spécifiques en matière de gouvernance, en fonction de sa taille, complexité et capacité à produire des informations de qualité.</p>
              <h4>Composition de l'actionnariat</h4>
              <p>La nature de l'<span class="hl">actionnariat</span> (coté en bourse, familial, institutionnel) influence la gouvernance en déterminant les intérêts en jeu et les mécanismes de contrôle.</p>
            `,
            quiz: [
              {
                type: "mcq",
                question: "Quelle forme juridique n'est PAS mentionnée dans le cours ?",
                choices: ["SCI", "SA", "SAS", "SARL"],
                correctAnswer: 0,
                explanation: "Les formes mentionnées sont SA, SAS, SARL et la société en commandite par actions."
              },
              {
                type: "short",
                question: "Quelles sont les catégories d'entreprises par taille ?",
                correctAnswer: ["micro-entreprises", "PME", "ETI", "grandes entreprises"],
                explanation: "Les entreprises se catégorisent en micro-entreprises, PME, ETI et grandes entreprises."
              }
            ]
          },
          {
            id: "gouvernance_ch3_s2",
            title: "Gouvernance par type d'organisation",
            content: `
              <h4>Start-ups</h4>
              <p>Les <span class="hl">start-ups</span> nécessitent une gouvernance adaptée à leur stade précoce. Des <span class="hlg">comités stratégiques</span> ou <span class="hlg">advisory boards</span> peuvent être préférés aux structures formelles.</p>
              <h4>PME</h4>
              <p>La gouvernance peut apporter des bénéfices significatifs aux <span class="hl">PME</span> : conseil d'administration efficace, expertise technique, renforcement de la crédibilité.</p>
              <h4>ETI</h4>
              <p>Les <span class="hl">ETI</span> sont bien placées pour bénéficier d'une gouvernance structurée : professionnalisation, expansion du réseau, préparation d'opérations financières complexes.</p>
              <h4>Grands groupes et sociétés cotées</h4>
              <p>La gouvernance des <span class="hl">sociétés cotées</span> est soumise à des règles strictes et des recommandations de codes de gouvernance pour assurer <span class="hlg">transparence</span>, <span class="hlg">responsabilité</span> et conformité.</p>
              <h4>Adaptabilité</h4>
              <p>Une approche <span class="hl">progressive et flexible</span> est préférable, favorisant les comités stratégiques avant de formaliser un conseil d'administration complet.</p>
            `,
            quiz: [
              {
                type: "mcq",
                question: "Quel organe est recommandé pour les start-ups plutôt qu'un conseil d'administration ?",
                choices: ["Un advisory board", "Un comité d'audit", "Un tribunal arbitral", "Un syndicat"],
                correctAnswer: 0,
                explanation: "Les comités stratégiques ou advisory boards sont préférés pour les start-ups."
              },
              {
                type: "tf",
                question: "La gouvernance des sociétés cotées est soumise à des règles strictes.",
                correctAnswer: true,
                explanation: "Les sociétés cotées sont réglementées de manière stricte pour assurer transparence et conformité."
              }
            ]
          }
        ]
      },
      {
        id: "gouvernance_ch4",
        title: "Les missions prioritaires de la gouvernance",
        sections: [
          {
            id: "gouvernance_ch4_s1",
            title: "Stratégie et arrêté des comptes",
            content: `
              <h4>Définition et suivi de la stratégie</h4>
              <ul>
                <li><span class="hl">Objectifs</span> : Assurer que le conseil d'administration guide et surveille la stratégie pour créer de la valeur.</li>
                <li><span class="hl">Points clés</span> : Clarté des attentes des actionnaires, définition des objectifs stratégiques, analyse des marchés et concurrents, évaluation du risque.</li>
                <li><span class="hl">Signaux d'alerte</span> : Absence de débat, intuition prédominante, manque ou excès d'information, inadéquation des ressources.</li>
              </ul>
              <h4>L'arrêté des comptes</h4>
              <ul>
                <li><span class="hl">Objectifs</span> : Garantir l'exactitude et la transparence des comptes sous la supervision du conseil.</li>
                <li><span class="hl">Points clés</span> : Fiabilité des chiffres, indicateurs financiers critiques, relation résultats/rémunération des dirigeants.</li>
                <li><span class="hl">Signaux d'alerte</span> : Insuffisance de temps sur les aspects financiers, relation tendue avec les commissaires aux comptes.</li>
              </ul>
            `,
            quiz: [
              {
                type: "mcq",
                question: "Quel est un signal d'alerte dans le suivi de la stratégie ?",
                choices: ["L'absence de débat au conseil", "Un excès de réunions", "Trop d'administrateurs", "Des dividendes élevés"],
                correctAnswer: 0,
                explanation: "L'absence de débat est un signal d'alerte majeur dans le suivi stratégique."
              },
              {
                type: "tf",
                question: "L'arrêté des comptes est une mission secondaire de la gouvernance.",
                correctAnswer: false,
                explanation: "L'arrêté des comptes est une mission prioritaire de la gouvernance."
              }
            ]
          },
          {
            id: "gouvernance_ch4_s2",
            title: "Gestion des dirigeants et des risques",
            content: `
              <h4>La gestion des dirigeants</h4>
              <ul>
                <li><span class="hl">Objectifs</span> : Nommer, évaluer et rémunérer les dirigeants en alignement avec les intérêts de l'entreprise.</li>
                <li><span class="hl">Points clés</span> : Sélection rigoureuse, évaluation sur critères objectifs, transparence de la rémunération.</li>
                <li><span class="hl">Signaux d'alerte</span> : Processus d'évaluation peu clair, rémunération liée au court terme, manque de transparence.</li>
              </ul>
              <h4>La gestion des risques</h4>
              <ul>
                <li><span class="hl">Objectifs</span> : Approche proactive pour identifier, évaluer et gérer les <span class="hlg">risques majeurs</span>.</li>
                <li><span class="hl">Points clés</span> : Niveau de risque acceptable, responsabilités claires, processus formalisé, contrôle interne.</li>
                <li><span class="hl">Signaux d'alerte</span> : Absence d'évaluation des risques, faiblesse du contrôle interne, délégation excessive.</li>
                <li><span class="hl">Recommandations</span> : Intégrer la gestion des risques dans la stratégie, <span class="hlg">cartographier les risques</span>, maintenir la conformité.</li>
              </ul>
            `,
            quiz: [
              {
                type: "mcq",
                question: "Quelle recommandation est faite pour la gestion des risques ?",
                choices: ["Cartographier les risques", "Ignorer les risques mineurs", "Externaliser tout le contrôle", "Réduire le conseil d'administration"],
                correctAnswer: 0,
                explanation: "La cartographie des risques est une recommandation clé pour la gestion des risques."
              },
              {
                type: "short",
                question: "Quels sont les objectifs de la gestion des dirigeants ?",
                correctAnswer: ["nommer", "évaluer", "rémunérer"],
                explanation: "Les objectifs sont : nommer, évaluer et rémunérer les dirigeants."
              }
            ]
          }
        ]
      },
      {
        id: "gouvernance_ch5",
        title: "Les missions complémentaires",
        sections: [
          {
            id: "gouvernance_ch5_s1",
            title: "Performance économique et actif humain",
            content: `
              <h4>Analyse de la performance économique</h4>
              <ul>
                <li>Utilisation d'<span class="hl">indicateurs financiers</span> et d'un <span class="hlg">tableau de bord</span> adapté.</li>
                <li>Intégration de la dimension financière dans les décisions stratégiques.</li>
                <li><span class="hl">Signaux d'alerte</span> : Absence de documents synthétiques, indicateurs clés flous.</li>
              </ul>
              <h4>Gestion de l'actif humain</h4>
              <ul>
                <li>Importance des <span class="hl">ressources humaines</span> dans la performance.</li>
                <li>Projet d'entreprise clair, équipe de direction compétente, gestion de la <span class="hlg">succession</span> et fidélisation des talents.</li>
                <li><span class="hl">Signaux d'alerte</span> : Absence de fonction RH, indicateurs sociaux négatifs, système de rémunération inadapté.</li>
              </ul>
            `,
            quiz: [
              {
                type: "tf",
                question: "Un tableau de bord adapté est recommandé pour l'analyse de la performance économique.",
                correctAnswer: true,
                explanation: "Le tableau de bord est un outil clé pour le suivi de la performance."
              },
              {
                type: "mcq",
                question: "Quel est un signal d'alerte dans la gestion de l'actif humain ?",
                choices: ["L'absence de fonction RH", "Un excès de formation", "Trop de recrutements", "Des salaires trop élevés"],
                correctAnswer: 0,
                explanation: "L'absence de fonction RH est un signal d'alerte majeur."
              }
            ]
          },
          {
            id: "gouvernance_ch5_s2",
            title: "RSE, communication et appui aux dirigeants",
            content: `
              <h4>Responsabilité sociétale des entreprises (RSE)</h4>
              <ul>
                <li>Intégrer des pratiques responsables : dimension <span class="hl">économique</span>, <span class="hl">sociale</span> et <span class="hl">environnementale</span>.</li>
                <li>Mise en place d'un <span class="hlg">reporting intégré</span>.</li>
                <li>La RSE comme source de <span class="hlg">création de valeur</span>.</li>
              </ul>
              <h4>Communication avec les parties prenantes</h4>
              <ul>
                <li>Assurer une communication <span class="hl">transparente</span> et constructive.</li>
                <li>Qualité de l'information transmise, consultation préalable sur les communications stratégiques.</li>
              </ul>
              <h4>Appui aux dirigeants</h4>
              <ul>
                <li>Fournir un soutien au dirigeant pour rompre avec sa <span class="hlg">solitude décisionnelle</span>.</li>
                <li>Instaurer un climat de confiance, développer l'anticipation.</li>
                <li>Pratiquer le <span class="hl">benchmarking</span> pour élargir les perspectives.</li>
              </ul>
            `,
            quiz: [
              {
                type: "mcq",
                question: "Quelles sont les trois dimensions de la RSE ?",
                choices: ["Économique, sociale et environnementale", "Financière, juridique et commerciale", "Technique, humaine et logistique", "Locale, nationale et internationale"],
                correctAnswer: 0,
                explanation: "La RSE couvre les dimensions économique, sociale et environnementale."
              },
              {
                type: "tf",
                question: "Le benchmarking est recommandé pour l'appui aux dirigeants.",
                correctAnswer: true,
                explanation: "Le benchmarking permet d'élargir les perspectives du dirigeant."
              }
            ]
          }
        ]
      },
      {
        id: "gouvernance_ch6",
        title: "Les situations particulières",
        sections: [
          {
            id: "gouvernance_ch6_s1",
            title: "L'entreprise familiale et la succession",
            content: `
              <h4>L'entreprise familiale</h4>
              <p>Les <span class="hl">entreprises familiales</span> représentent une part significative de l'économie, caractérisées par la détention majoritaire du capital par des membres de la même famille.</p>
              <p>Elles se distinguent des <span class="hlg">entreprises personnelles</span> (contrôlées par leurs fondateurs) et des <span class="hlg">entreprises patrimoniales</span> (sans lien familial entre dirigeants).</p>
              <h4>Transmission et succession</h4>
              <p>La <span class="hl">transmission</span> concerne l'évolution de la structure de l'actionnariat, tandis que la <span class="hl">succession</span> se réfère à la relève des dirigeants.</p>
              <p>Le choix d'un nouveau dirigeant est <span class="hlg">crucial</span> pour l'avenir de l'entreprise.</p>
            `,
            quiz: [
              {
                type: "mcq",
                question: "Quelle est la différence entre transmission et succession ?",
                choices: [
                  "La transmission concerne l'actionnariat, la succession les dirigeants",
                  "Ce sont des synonymes",
                  "La transmission est juridique, la succession économique",
                  "La succession précède toujours la transmission"
                ],
                correctAnswer: 0,
                explanation: "La transmission concerne la structure de l'actionnariat, la succession la relève des dirigeants."
              },
              {
                type: "tf",
                question: "Les entreprises familiales sont nécessairement de petite taille.",
                correctAnswer: false,
                explanation: "Bien que beaucoup soient petites, les entreprises familiales ne sont pas nécessairement de petite taille."
              }
            ]
          },
          {
            id: "gouvernance_ch6_s2",
            title: "Gestion de crise et opérations financières",
            content: `
              <h4>La gestion de crise</h4>
              <p>La gouvernance est mise à l'épreuve lors de <span class="hl">crises</span> menaçant la réputation ou la pérennité de l'entreprise. Elle doit reconnaître les <span class="hlg">signaux d'alarme</span> et réagir efficacement.</p>
              <h4>Les opérations financières stratégiques</h4>
              <p>Les <span class="hl">fusions et acquisitions</span> nécessitent une gouvernance robuste pour assurer :</p>
              <ul>
                <li>L'<span class="hl">alignement stratégique</span></li>
                <li>Le <span class="hl">contrôle diligent</span> (due diligence)</li>
                <li>La <span class="hl">gestion post-transaction</span></li>
              </ul>
            `,
            quiz: [
              {
                type: "mcq",
                question: "Que nécessitent les fusions et acquisitions en matière de gouvernance ?",
                choices: ["Une gouvernance robuste", "Moins de contrôle", "L'absence du conseil", "Un audit externe uniquement"],
                correctAnswer: 0,
                explanation: "Les fusions et acquisitions nécessitent une gouvernance robuste pour l'alignement stratégique et le contrôle diligent."
              },
              {
                type: "short",
                question: "Quels aspects couvre la gouvernance lors de fusions-acquisitions ?",
                correctAnswer: ["alignement stratégique", "contrôle diligent", "gestion post-transaction"],
                explanation: "La gouvernance couvre l'alignement stratégique, le contrôle diligent et la gestion post-transaction."
              }
            ]
          }
        ]
      },
      {
        id: "gouvernance_ch7",
        title: "Petit mémento juridique",
        sections: [
          {
            id: "gouvernance_ch7_s1",
            title: "L'administrateur : fonction, capacité et droits",
            content: `
              <h4>La fonction d'administrateur</h4>
              <p>L'<span class="hl">administrateur</span> est souvent choisi pour ses <span class="hlg">compétences</span> plutôt que pour ses diplômes. Des interdictions légales existent pour certains crimes et délits.</p>
              <h4>Capacité et critères</h4>
              <p>Les critères de compétence sont flexibles, basés sur l'<span class="hl">expérience</span> et les qualités personnelles. Des formations spécifiques ne sont pas obligatoires.</p>
              <h4>Droits des administrateurs</h4>
              <p>Les administrateurs ont des responsabilités importantes dans la gouvernance d'une <span class="hl">société anonyme (SA)</span>. Ils sont nommés par l'<span class="hlg">assemblée générale</span>.</p>
              <h4>Mandat</h4>
              <p>Le mandat est <span class="hl">limité dans le temps</span> et peut être renouvelé. Les administrateurs peuvent être <span class="hlg">révoqués à tout moment</span> par l'assemblée générale.</p>
            `,
            quiz: [
              {
                type: "mcq",
                question: "Sur quoi repose principalement le choix d'un administrateur ?",
                choices: ["Ses compétences et son expérience", "Ses diplômes", "Son ancienneté", "Sa nationalité"],
                correctAnswer: 0,
                explanation: "L'administrateur est choisi pour ses compétences plutôt que pour ses diplômes."
              },
              {
                type: "tf",
                question: "Un administrateur peut être révoqué à tout moment par l'assemblée générale.",
                correctAnswer: true,
                explanation: "Les administrateurs sont révocables à tout moment par l'assemblée générale."
              }
            ]
          },
          {
            id: "gouvernance_ch7_s2",
            title: "Présidence, direction et rémunération",
            content: `
              <h4>Le président du conseil d'administration</h4>
              <p>Le <span class="hl">président</span> est nommé parmi les administrateurs. Il a un rôle clé dans la gestion du conseil et peut cumuler avec d'autres fonctions.</p>
              <h4>La direction générale</h4>
              <p>Le <span class="hl">directeur général</span> est nommé par le conseil d'administration et représente légalement la société. Il détient le <span class="hlg">pouvoir exécutif</span> et est révocable à tout moment.</p>
              <h4>Rémunération des administrateurs</h4>
              <p>Les administrateurs reçoivent des <span class="hl">jetons de présence</span> fixés par l'assemblée générale. Ces revenus sont imposables et ne bénéficient pas de la protection sociale.</p>
              <h4>Responsabilité</h4>
              <p>Les administrateurs sont responsables <span class="hl">civilement</span>, <span class="hl">pénalement</span> et <span class="hl">financièrement</span> en cas de mauvaise gestion ou de violations des lois.</p>
            `,
            quiz: [
              {
                type: "mcq",
                question: "Comment s'appelle la rémunération des administrateurs ?",
                choices: ["Les jetons de présence", "Les dividendes", "Les honoraires", "Le salaire fixe"],
                correctAnswer: 0,
                explanation: "Les administrateurs reçoivent des jetons de présence fixés par l'assemblée générale."
              },
              {
                type: "short",
                question: "Sur quels plans un administrateur est-il responsable ?",
                correctAnswer: ["civilement", "pénalement", "financièrement"],
                explanation: "Les administrateurs sont responsables civilement, pénalement et financièrement."
              }
            ]
          }
        ]
      },
      {
        id: "gouvernance_ch8",
        title: "Notions de fraude dans la gouvernance",
        sections: [
          {
            id: "gouvernance_ch8_s1",
            title: "Définitions et prise en compte de la fraude",
            content: `
              <h4>Définitions de la fraude</h4>
              <p>Les auditeurs définissent la <span class="hl">fraude</span> de manière variée, souvent liée à des <span class="hlg">falsifications intentionnelles</span> de rapports financiers ou à des <span class="hlg">détournements de fonds</span>.</p>
              <p>Les critères incluent toute représentation intentionnellement fausse ou la non-divulgation d'informations, causant ou risquant de causer un préjudice.</p>
              <h4>Prise en compte du risque de fraude</h4>
              <p>Les organisations doivent instaurer une <span class="hl">gouvernance solide</span>, conforme aux lois et bonnes pratiques, incluant :</p>
              <ul>
                <li>Un <span class="hl">contrôle interne</span> efficace</li>
                <li>La <span class="hl">gestion des risques</span></li>
                <li>L'<span class="hl">audit de gouvernance</span> pour identifier les dysfonctionnements</li>
              </ul>
              <h4>Loi Sarbanes-Oxley et fraude</h4>
              <p>Cette loi américaine de 2002 impose :</p>
              <ul>
                <li>La <span class="hl">certification personnelle</span> des dirigeants sur l'exactitude des comptes.</li>
                <li>L'<span class="hl">évaluation du contrôle interne</span>.</li>
                <li>La <span class="hl">protection des informateurs</span> (whistleblowers).</li>
              </ul>
            `,
            quiz: [
              {
                type: "mcq",
                question: "Que prévoit la loi Sarbanes-Oxley pour les dirigeants ?",
                choices: [
                  "La certification personnelle sur l'exactitude des comptes",
                  "L'immunité en cas de fraude",
                  "La suppression de l'audit externe",
                  "L'auto-évaluation sans contrôle"
                ],
                correctAnswer: 0,
                explanation: "La loi impose la certification personnelle des dirigeants sur l'exactitude des comptes."
              },
              {
                type: "tf",
                question: "La loi Sarbanes-Oxley protège les informateurs (whistleblowers).",
                correctAnswer: true,
                explanation: "La protection des informateurs est l'une des mesures clés de cette loi."
              },
              {
                type: "short",
                question: "Quels mécanismes permettent de prévenir la fraude dans la gouvernance ?",
                correctAnswer: ["contrôle interne", "gestion des risques", "audit"],
                explanation: "Le contrôle interne, la gestion des risques et l'audit de gouvernance sont les principaux mécanismes."
              }
            ]
          }
        ]
      }
    ]
  },
];

// Fonction utilitaire pour compter les questions
export function countQuestions(course: Course): number {
  return course.chapters.reduce((total, chapter) => {
    return total + chapter.sections.reduce((sectionTotal, section) => {
      return sectionTotal + section.quiz.length;
    }, 0);
  }, 0);
}

// Fonction utilitaire pour obtenir toutes les sections d'un cours
export function getAllSections(course: Course): Section[] {
  return course.chapters.flatMap(chapter => chapter.sections);
}

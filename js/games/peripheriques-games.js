/* =========================================================
   Jeux en direct du chapitre « Périphériques » (3 séances)
   ========================================================= */
(function (AN) {
  "use strict";
  const G = AN.games.register;
  const big = h => `<div class="lp-scene" style="font-size:1.4em;text-align:center">${h}</div>`;

  /* =================== SÉANCE 1 =================== */
  const DEV = ["🖱️ La souris", "⌨️ Le clavier", "🖨️ L'imprimante", "💾 La clé USB"];
  G({ id: "per_quel", title: "Quel périphérique ?", icon: "🔌",
    intro: "Une situation s'affiche : quel <b>périphérique</b> faut-il utiliser ?",
    rounds: [
      ["Je veux emporter mon CV pour l'imprimer à la médiathèque.", 3, "La clé USB transporte des fichiers d'un ordinateur à l'autre."],
      ["Je veux écrire l'adresse e-mail de ma fille.", 1, "Le clavier, pour taper du texte."],
      ["Je veux avoir mon attestation sur papier.", 2, "L'imprimante met le document sur papier."],
      ["Je veux ouvrir un dossier sur le bureau (double-clic).", 0, "La souris pointe et clique."],
      ["Je veux corriger une faute de frappe avec la touche Effacer.", 1, "La touche ⌫ Effacer est sur le clavier."]
    ].map(([p, ok, why]) => ({ kind: "choice", layout: "files", prompt: `<div class="lp-scene">${p}</div>`, choices: DEV, ok, why, short: p.slice(0, 45), limit: 15 })) });

  const GE = ["👆 Un clic", "✌️ Un double-clic", "👉 Un clic droit", "✊ Glisser-déposer"];
  G({ id: "per_geste", title: "Quel geste de la souris ?", icon: "🖱️",
    intro: "Pour chaque action, quel <b>geste de la souris</b> faut-il faire ?",
    rounds: [
      ["Ouvrir le dossier « Photos » sur le bureau", 1, "Sur l'ordinateur, on ouvre un dossier avec un double-clic."],
      ["Suivre un lien sur un site Internet", 0, "Sur Internet, un seul clic suffit (un double-clic peut ouvrir deux fois la page !)."],
      ["Voir le menu pour « Renommer » un fichier", 2, "Le clic droit ouvre un menu avec les actions possibles."],
      ["Ranger une photo dans un dossier", 3, "On attrape la photo (bouton enfoncé), on la lâche sur le dossier."],
      ["Appuyer sur le bouton « Valider » d'un formulaire", 0, "Un bouton se presse d'un seul clic."]
    ].map(([p, ok, why]) => ({ kind: "choice", layout: "files", prompt: `<div class="lp-scene">${p}</div>`, choices: GE, ok, why, short: p.slice(0, 45), limit: 15 })) });

  G({ id: "per_arobase", title: "Tape l'adresse e-mail", icon: "⌨️",
    intro: "Tapez l'adresse exactement. Rappel : l'arobase <b>@</b> = <kbd>Alt Gr</kbd> + <kbd>à 0</kbd> · le point = <kbd>⇧ Maj</kbd> + <kbd>; .</kbd>",
    rounds: [
      { kind: "type", target: "marie.dupont@exemple.fr", prompt: "Recopiez cette adresse e-mail :", hint: "Alt Gr + à pour le @. Tout en minuscules.", why: "Une adresse e-mail : pas d'espace, pas d'accent, une seule arobase @.", limit: 60 },
      { kind: "type", target: "Valbourg 26000", prompt: "Et maintenant, une ville et un code postal :", hint: "Majuscule avec ⇧ Maj. Les chiffres du haut aussi : avec ⇧ Maj !", why: "Sur un clavier français, les chiffres du haut demandent ⇧ Maj (ou le pavé numérique).", limit: 50 }
    ] });

  /* =================== SÉANCE 2 =================== */
  const REG = ["📄 Pages : Personnalisées", "⚫ Couleur : Noir et blanc", "💾 Destination : Enregistrer en PDF", "🔁 Copies : 2"];
  G({ id: "per_reglage", title: "Quel réglage ?", icon: "🖨️",
    intro: "Dans la fenêtre d'impression, quel <b>réglage</b> faut-il changer ?",
    rounds: [
      ["J'ai un document de 5 pages, mais seule la page 1 m'intéresse.", 0, "Pages › Personnalisées › 1."],
      ["Je veux garder ma confirmation de rendez-vous, sans papier.", 2, "« Enregistrer au format PDF » crée un fichier."],
      ["J'imprime un formulaire : pas besoin de couleur.", 1, "Noir et blanc : moins cher, et suffisant."],
      ["Il me faut un exemplaire pour moi et un pour mon mari.", 3, "Copies : 2."]
    ].map(([p, ok, why]) => ({ kind: "choice", layout: "files", prompt: `<div class="lp-scene">${p}</div>`, choices: REG, ok, why, short: p.slice(0, 45), limit: 18 })) });

  G({ id: "per_ordre_impr", title: "Imprimer, dans l'ordre", icon: "🧩",
    intro: "Les étapes pour imprimer seulement la page 1 sont mélangées : remettez-les <b>dans l'ordre</b> !",
    rounds: [{ kind: "order", limit: 60, prompt: "Imprimer seulement la page 1 de l'attestation :", answer: ["Ouvrir le document", "Appuyer sur Ctrl + P", "Choisir l'imprimante", "Pages : Personnalisées, taper 1", "Cliquer sur « Imprimer »"],
      why: "Ctrl + P marche dans le navigateur, dans un PDF, dans Word… presque partout !" }] });

  const DG = ["▤ Remettre du papier", "⏻ Allumer l'imprimante", "🔧 Retirer la feuille coincée", "✕ Annuler le document bloqué"];
  G({ id: "per_diag", title: "Que dit l'imprimante ?", icon: "🛠️",
    intro: "Un message s'affiche. Quelle est la <b>bonne solution</b> ?",
    rounds: [
      [`<code>⚠ Bac vide : chargez du papier</code>`, 0, "Le bac est vide : on remet du papier, et l'impression repart."],
      [`File d'attente : <code>Erreur - Hors connexion</code>`, 1, "Hors connexion : l'imprimante est éteinte, ou débranchée."],
      [`<code>⚠ Bourrage papier</code>`, 2, "Une feuille est coincée : on ouvre le capot, et on la retire doucement."],
      [`File d'attente : <code>Erreur - Impression</code>, l'imprimante est allumée et a du papier`, 3, "Le document est bloqué : on l'annule dans la file d'attente, puis on relance."]
    ].map(([p, ok, why]) => ({ kind: "choice", layout: "files", prompt: big(p), choices: DG, ok, why, short: p.replace(/<[^>]+>/g, "").slice(0, 45), limit: 18 })) });

  /* =================== SÉANCE 3 =================== */
  const VF = ["✅ Vrai", "❌ Faux"];
  G({ id: "per_usb_vf", title: "Clé USB : vrai ou faux ?", icon: "💾",
    intro: "Vrai ou faux ? Des idées reçues sur la clé USB…",
    rounds: [
      ["Avant de retirer la clé, je l'<b>éjecte</b>.", 0, "Vrai : clic droit › Éjecter. Sinon, un fichier en cours de copie peut être abîmé."],
      ["J'ai trouvé une clé par terre : je la branche pour trouver son propriétaire.", 1, "Faux : une clé inconnue peut contenir un virus. On la rapporte à l'accueil."],
      ["Copier un fichier sur la clé l'efface de l'ordinateur.", 1, "Faux : copier laisse le fichier à sa place. C'est « couper » qui le déplace."],
      ["Un fichier supprimé sur une clé USB va souvent… nulle part : il est effacé pour de bon.", 0, "Vrai : sur une clé, pas toujours de Corbeille. Windows demande confirmation."],
      ["La clé USB apparaît dans l'Explorateur, sous « Ce PC ».", 0, "Vrai : par exemple « Clé USB (E:) »."]
    ].map(([p, ok, why]) => ({ kind: "choice", prompt: `<div class="lp-scene">${p}</div>`, choices: VF, ok, why, short: p.replace(/<[^>]+>/g, "").slice(0, 50), limit: 15 })) });

  const RC = ["Ctrl + C", "Ctrl + V", "Ctrl + Z", "Ctrl + P", "Ctrl + +", "Ctrl + 0"];
  G({ id: "per_raccourci", title: "Quel raccourci ?", icon: "✨",
    intro: "Quel <b>raccourci clavier</b> pour chaque action ?",
    rounds: [
      ["Je veux <b>copier</b> le numéro de dossier.", ["Ctrl + C", "Ctrl + V", "Ctrl + Z", "Ctrl + P"], 0, "C comme « copier »."],
      ["J'ai effacé un texte par erreur : je veux <b>annuler</b>.", ["Ctrl + C", "Ctrl + V", "Ctrl + Z", "Ctrl + P"], 2, "Ctrl + Z annule la dernière action."],
      ["Je veux <b>imprimer</b> la page.", ["Ctrl + C", "Ctrl + I", "Ctrl + Z", "Ctrl + P"], 3, "P comme « print » (imprimer)."],
      ["Le texte du site est trop petit : je veux <b>agrandir</b>.", ["Ctrl + +", "Ctrl + 0", "Ctrl + -", "Ctrl + A"], 0, "Ctrl + + agrandit ; Ctrl + 0 revient à 100 %."],
      ["Je veux <b>coller</b> l'adresse que j'ai copiée.", ["Ctrl + C", "Ctrl + V", "Ctrl + X", "Ctrl + P"], 1, "Ctrl + V colle là où clignote le curseur."]
    ].map(([p, c, ok, why]) => ({ kind: "choice", prompt: `<div class="lp-scene">${p}</div>`, choices: c, ok, why, short: p.replace(/<[^>]+>/g, "").slice(0, 45), limit: 15 })) });

  const QF = (p, c, ok, why, short) => ({ kind: "choice", layout: "files", prompt: p, choices: c, ok, why, short, limit: 25 });
  G({ id: "per_que_faire", title: "Que faites-vous ?", icon: "🆘", noRank: true,
    intro: "Des petits soucis de tous les jours avec la souris, le clavier, l'imprimante… et les bons gestes, <b>calmement</b>. Pas de classement : on en parle ensemble.",
    rounds: [
      QF("Tout ce que je tape s'écrit EN MAJUSCULES.", ["J'appuie une fois sur Verr. Maj", "Je redémarre l'ordinateur", "Je change de clavier"], 0, "Le Verr. Maj est allumé : un appui l'éteint.", "Tout en majuscules"),
      QF("La souris ne bouge plus à l'écran.", ["Je vérifie le câble (ou les piles, si elle est sans fil)", "Je la secoue très fort", "J'appelle un technicien tout de suite"], 0, "Souris sans fil : souvent les piles. Avec fil : la prise USB.", "Souris bloquée"),
      QF("J'ai cliqué 5 fois sur « Imprimer » et rien ne sort.", ["Je reclique encore", "Je regarde l'imprimante et la file d'attente, et j'annule les documents en trop", "Je débranche l'ordinateur"], 1, "Sinon, l'imprimante sortira 5 exemplaires une fois réparée.", "5 clics sur Imprimer"),
      QF("Je ne trouve plus le @ sur le clavier.", ["Il n'existe pas", "Alt Gr + la touche à 0", "Ctrl + @"], 1, "Alt Gr (à droite de la barre d'espace), puis la touche à 0.", "Arobase introuvable"),
      QF("Le texte d'un site est minuscule.", ["Ctrl + + pour agrandir", "Je me rapproche à 10 cm de l'écran", "Je ferme le site"], 0, "Le zoom du navigateur, puis Ctrl + 0 pour revenir.", "Texte trop petit")
    ] });
})(window.AN);

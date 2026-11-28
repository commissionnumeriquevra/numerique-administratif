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
    intro: "Une situation s'affiche : quel <b>périphérique</b> (un appareil branché à l'ordinateur) faut-il utiliser ?",
    rounds: [
      ["Mon CV est sur l'ordinateur de la maison. Je veux <b>l'emporter</b> à la médiathèque, dans ma poche.", 3, "La clé USB transporte des fichiers d'un ordinateur à l'autre."],
      ["Je veux écrire l'adresse e-mail de ma fille.", 1, "Le clavier, pour taper du texte."],
      ["Je veux avoir mon attestation <b>sur papier</b>.", 2, "L'imprimante met le document sur papier."],
      ["Je veux ouvrir un dossier sur le Bureau, avec un double-clic.", 0, "La souris pointe et clique."],
      ["Je veux corriger une faute de frappe avec la touche Effacer.", 1, "La touche ⌫ Effacer est sur le clavier."]
    ].map(([p, ok, why]) => ({ kind: "choice", layout: "files", prompt: `<div class="lp-scene">${p}<br><b>Quel appareil faut-il utiliser ?</b></div>`, choices: DEV, ok, why, short: p.slice(0, 45), limit: 15 })) });

  const GE = ["👆 Un clic", "✌️ Un double-clic", "👉 Un clic droit", "✊ Glisser-déposer"];
  G({ id: "per_geste", title: "Quel geste de la souris ?", icon: "🖱️",
    intro: "Pour chaque action, quel <b>geste de la souris</b> faut-il faire ?",
    rounds: [
      ["Je veux ouvrir le dossier « Photos », sur le Bureau de l'ordinateur.", 1, "Sur l'ordinateur, on ouvre un dossier avec un double-clic."],
      ["Je veux suivre un lien sur un site Internet.", 0, "Sur Internet, un seul clic suffit (un double-clic peut ouvrir deux fois la page !)."],
      ["Je veux ouvrir le menu qui permet de « Renommer » un fichier.", 2, "Le clic droit ouvre un menu avec les actions possibles."],
      ["Je veux déplacer une photo pour la ranger dans un dossier.", 3, "On attrape la photo (bouton enfoncé), puis on la lâche sur le dossier."],
      ["Je veux appuyer sur le bouton « Valider » d'un formulaire.", 0, "Un bouton se presse d'un seul clic."]
    ].map(([p, ok, why]) => ({ kind: "choice", layout: "files", prompt: `<div class="lp-scene">${p}<br><b>Quel geste faites-vous avec la souris ?</b></div>`, choices: GE, ok, why, short: p.slice(0, 45), limit: 15 })) });

  G({ id: "per_arobase", title: "Tapez l'adresse e-mail", icon: "⌨️",
    intro: "Tapez l'adresse exactement. Rappel : l'arobase <b>@</b> = <kbd>Alt Gr</kbd> + <kbd>à 0</kbd> · le point = <kbd>⇧ Maj</kbd> + <kbd>; .</kbd>",
    rounds: [
      { kind: "type", target: "marie.dupont@exemple.fr", prompt: "Recopiez cette adresse e-mail :", hint: "Pour le @ : Alt Gr enfoncée + la touche à 0. Le point : ⇧ Maj + ; . Tout en minuscules.", why: "Une adresse e-mail : pas d'espace, pas d'accent, une seule arobase @.", limit: 60 },
      { kind: "type", target: "Valbourg 26000", prompt: "Recopiez ce nom de ville et ce code postal :", hint: "Pour la majuscule : ⇧ Maj. Pour les chiffres de la ligne du haut : ⇧ Maj aussi (ou le pavé de chiffres, à droite) !", why: "Sur un clavier français, les chiffres du haut demandent ⇧ Maj (ou le pavé numérique).", limit: 50 }
    ] });

  /* =================== SÉANCE 2 =================== */
  const REG = ["📄 Pages : Personnalisées", "⚫ Couleur : Noir et blanc", "💾 Destination : Enregistrer au format PDF", "🔁 Copies : 2"];
  G({ id: "per_reglage", title: "Quel réglage ?", icon: "🖨️",
    intro: "Dans la fenêtre d'impression, quel <b>réglage</b> faut-il changer ?",
    rounds: [
      ["J'ai un document de 5 pages, mais je veux imprimer <b>seulement la page 1</b>.", 0, "Pages › Personnalisées, puis on tape 1."],
      ["Je veux garder ma confirmation de rendez-vous <b>dans un fichier</b> sur l'ordinateur, sans papier.", 2, "« Enregistrer au format PDF » crée un fichier, au lieu d'imprimer."],
      ["J'imprime un formulaire : la <b>couleur</b> ne sert à rien.", 1, "Noir et blanc : moins cher, et suffisant."],
      ["Il me faut <b>un exemplaire pour moi et un pour mon mari</b>.", 3, "Copies : 2."]
    ].map(([p, ok, why]) => ({ kind: "choice", layout: "files", prompt: `<div class="lp-scene">${p}<br><b>Quel réglage changez-vous ?</b></div>`, choices: REG, ok, why, short: p.slice(0, 45), limit: 18 })) });

  G({ id: "per_ordre_impr", title: "Imprimer, dans l'ordre", icon: "🧩",
    intro: "Les étapes pour imprimer seulement la page 1 sont mélangées : remettez-les <b>dans l'ordre</b> !",
    rounds: [{ kind: "order", limit: 60, prompt: "Remettez les étapes dans l'ordre, pour imprimer <b>seulement la page 1</b> de l'attestation :", answer: ["Ouvrir le document", "Appuyer sur Ctrl + P", "Choisir l'imprimante", "Pages : Personnalisées, taper 1", "Cliquer sur « Imprimer »"],
      why: "Ctrl + P marche dans le navigateur, dans un PDF, dans Word… presque partout !" }] });

  const DG = ["▤ Remettre du papier", "⏻ Allumer l'imprimante", "🔧 Retirer la feuille coincée", "✕ Annuler le document bloqué"];
  G({ id: "per_diag", title: "Que dit l'imprimante ?", icon: "🛠️",
    intro: "Un message d'erreur de l'imprimante s'affiche. Quelle est la <b>bonne solution</b> ?",
    rounds: [
      [`<code>⚠ Bac vide : chargez du papier</code>`, 0, "Le bac est vide : on remet du papier, et l'impression repart."],
      [`File d'attente : <code>Erreur - Hors connexion</code>`, 1, "Hors connexion : l'imprimante est éteinte, ou débranchée. On l'allume, et on vérifie son câble."],
      [`<code>⚠ Bourrage papier</code>`, 2, "Une feuille est coincée : on ouvre le capot, et on la retire doucement."],
      [`File d'attente : <code>Erreur - Impression</code> (l'imprimante est allumée et a du papier)`, 3, "Le document est bloqué : on l'annule dans la file d'attente, puis on relance."]
    ].map(([p, ok, why]) => ({ kind: "choice", layout: "files", prompt: big(`L'ordinateur affiche ce message :<br>${p}<br><b>Que faites-vous ?</b>`), choices: DG, ok, why, short: p.replace(/<[^>]+>/g, "").slice(0, 45), limit: 18 })) });

  /* =================== SÉANCE 3 =================== */
  const VF = ["✅ Vrai", "❌ Faux"];
  G({ id: "per_usb_vf", title: "Clé USB : vrai ou faux ?", icon: "💾",
    intro: "Vrai ou faux ? Des idées reçues sur la clé USB…",
    rounds: [
      ["Avant de retirer la clé de l'ordinateur, il vaut mieux l'<b>éjecter</b>.", 0, "Vrai : clic droit › Éjecter. Sinon, un fichier en cours de copie peut être abîmé."],
      ["Une clé trouvée par terre, je peux la brancher <b>sans risque</b> pour trouver son propriétaire.", 1, "Faux : une clé inconnue peut contenir un virus. On la rapporte à l'accueil."],
      ["<b>Copier</b> un fichier sur la clé l'efface de l'ordinateur.", 1, "Faux : copier laisse le fichier à sa place. C'est « couper » qui le déplace."],
      ["Sur une clé USB, un fichier supprimé est souvent effacé pour de bon.", 0, "Vrai : sur une clé, il n'y a souvent pas de Corbeille. Windows demande donc confirmation."],
      ["Une fois branchée, la clé USB apparaît dans l'Explorateur, sous « Ce PC ».", 0, "Vrai : par exemple « Clé USB (E:) »."]
    ].map(([p, ok, why]) => ({ kind: "choice", prompt: `<div class="lp-scene">${p}<br><b>Vrai ou faux ?</b></div>`, choices: VF, ok, why, short: p.replace(/<[^>]+>/g, "").slice(0, 50), limit: 15 })) });

  const RC = ["Ctrl + C", "Ctrl + V", "Ctrl + Z", "Ctrl + P", "Ctrl + +", "Ctrl + 0"];
  G({ id: "per_raccourci", title: "Quel raccourci ?", icon: "✨",
    intro: "Quel <b>raccourci clavier</b> pour chaque action ?",
    rounds: [
      ["Je veux <b>copier</b> le numéro de dossier.", ["Ctrl + C", "Ctrl + V", "Ctrl + Z", "Ctrl + P"], 0, "C comme « copier »."],
      ["J'ai effacé un texte par erreur : je veux <b>annuler</b>.", ["Ctrl + C", "Ctrl + V", "Ctrl + Z", "Ctrl + P"], 2, "Ctrl + Z annule la dernière action."],
      ["Je veux <b>imprimer</b> la page.", ["Ctrl + C", "Ctrl + I", "Ctrl + Z", "Ctrl + P"], 3, "P comme « print » (imprimer)."],
      ["Le texte du site est trop petit : je veux l'<b>agrandir</b>.", ["Ctrl + +", "Ctrl + 0", "Ctrl + -", "Ctrl + A"], 0, "Ctrl + + agrandit ; Ctrl + 0 revient à 100 %."],
      ["Je veux <b>coller</b> l'adresse que j'ai copiée.", ["Ctrl + C", "Ctrl + V", "Ctrl + X", "Ctrl + P"], 1, "Ctrl + V colle là où clignote le curseur."]
    ].map(([p, c, ok, why]) => ({ kind: "choice", prompt: `<div class="lp-scene">${p}<br><b>Quel raccourci faut-il utiliser ?</b></div>`, choices: c, ok, why, short: p.replace(/<[^>]+>/g, "").slice(0, 45), limit: 15 })) });

  const QF = (p, c, ok, why, short) => ({ kind: "choice", layout: "files", prompt: `<div class="lp-scene">${p}<br><b>Que dois-je faire ?</b></div>`, choices: c, ok, why, short, limit: 25 });
  G({ id: "per_que_faire", title: "Que faites-vous ?", icon: "🆘", noRank: true,
    intro: "Des petits soucis de tous les jours avec la souris, le clavier, l'imprimante… et les bons gestes, <b>calmement</b>. Pas de classement : on en parle ensemble.",
    rounds: [
      QF("Tout ce que je tape s'écrit EN MAJUSCULES.", ["J'appuie une fois sur Verr. Maj", "Je redémarre l'ordinateur", "Je change de clavier"], 0, "Le Verr. Maj est allumé : un appui l'éteint.", "Tout en majuscules"),
      QF("Je bouge la souris, mais la flèche ne bouge plus à l'écran.", ["Je vérifie le câble (ou les piles, si elle est sans fil)", "Je la secoue très fort", "J'appelle un technicien tout de suite"], 0, "Souris sans fil : souvent les piles. Avec fil : la prise USB.", "Souris bloquée"),
      QF("J'ai cliqué 5 fois sur « Imprimer » et rien ne sort.", ["Je reclique encore", "Je regarde l'imprimante et la file d'attente (la liste des impressions), et j'annule les documents en trop", "Je débranche l'ordinateur"], 1, "Si on n'annule pas, l'imprimante sortira 5 exemplaires une fois réparée.", "5 clics sur Imprimer"),
      QF("Je ne trouve plus le @ sur le clavier.", ["Rien : le @ n'existe pas sur ce clavier", "J'appuie sur Alt Gr + la touche à 0", "J'appuie sur Ctrl + @"], 1, "On garde Alt Gr appuyée (à droite de la barre d'espace) et on appuie sur la touche à 0.", "Arobase introuvable"),
      QF("Le texte d'un site est tout petit : je n'arrive pas à le lire.", ["J'appuie sur Ctrl et + pour agrandir", "Je me rapproche à 10 cm de l'écran", "Je ferme le site"], 0, "Ctrl + + agrandit la page. Ctrl + 0 la remet à 100 %.", "Texte trop petit")
    ] });
})(window.AN);

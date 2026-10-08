/* =========================================================
   Jeux en direct du chapitre « Souris et clavier »
   Nouvelles mécaniques : « bubbles » (le réveil des bulles),
   « gesture » (faire le bon geste de souris), « key » (lire avant d'agir).
   ========================================================= */
(function (AN) {
  "use strict";
  const G = AN.games.register;
  const scene = h => `<div class="lp-scene" style="font-size:1.3em;text-align:center">${h}</div>`;

  /* =================== SÉANCE 1 : la souris =================== */
  G({ id: "sc_g_bulles", title: "Le réveil des bulles", icon: "🫧",
    intro: "Les bulles dorment 😴 ! Pendant <b>30 secondes</b>, cliquez sur chaque bulle qui apparaît. Elles rapetissent… Visez bien : chaque clic à côté compte !",
    rounds: [{ kind: "bubbles", limit: 30, goal: 10, count: 24, short: "Le réveil des bulles",
      prompt: "🫧 Cliquez sur chaque bulle, le plus vite possible… mais en visant bien !",
      why: "Le bon geste : je <b>vise</b> d'abord (la flèche sur la bulle), puis je <b>clique</b> sans bouger la souris. La vitesse viendra toute seule !" }] });

  const CL = ["👆 Clic gauche : j'agis", "👉 Clic droit : j'explore les options"];
  G({ id: "sc_g_agir", title: "Agir ou explorer ?", icon: "🤔",
    intro: "Avant chaque clic, une seconde : est-ce que je veux <b>agir</b>, ou <b>voir les options</b> ? Choisissez le bon bouton de la souris !",
    rounds: [
      ["Je veux appuyer sur le bouton « Valider ».", 0, "Valider, c'est agir : un clic gauche."],
      ["Je veux voir ce qu'on peut faire avec une photo (l'imprimer ? la tourner ?).", 1, "Le clic droit montre le menu des actions possibles."],
      ["Je veux suivre un lien sur un site Internet.", 0, "Un clic gauche suffit sur un lien."],
      ["Je cherche l'option « Renommer » pour un fichier.", 1, "Renommer se trouve dans le menu du clic droit."],
      ["Je veux cocher la case « J'accepte ».", 0, "Cocher une case, c'est agir : clic gauche."]
    ].map(([p, ok, why]) => ({ kind: "choice", prompt: scene(p), choices: CL, ok, why, short: p.slice(0, 50), limit: 15 })) });

  /* =================== SÉANCE 2 : double-clic et glisser =================== */
  G({ id: "sc_g_geste", title: "Faites le bon geste !", icon: "🖱️",
    intro: "Lisez la consigne, puis faites <b>le bon geste</b> directement sur l'objet, avec la souris : clic, double-clic, clic droit… ou glisser-déposer !",
    rounds: [
      { prompt: "Sur le bureau de l'ordinateur, <b>ouvrez</b> le dossier Photos.", object: `<span class="ico">📁</span>Photos`, ok: "dbl", why: "Sur l'ordinateur, on ouvre un dossier avec un <b>double-clic</b> : toc-toc !" },
      { prompt: "Affichez le <b>menu des options</b> de la photo.", object: `<span class="ico">🖼️</span>mamie.jpg`, ok: "right", why: "Le <b>clic droit</b> affiche le menu des options : ouvrir, pivoter, imprimer…" },
      { prompt: "Sur un site Internet, ouvrez la page « Horaires ».", object: `<span class="ico">🔗</span><u style="color:#1d5fb8">Horaires</u>`, ok: "click", why: "Sur Internet, <b>un seul clic</b> suffit. Un double-clic peut ouvrir deux fois la page !" },
      { prompt: "<b>Rangez</b> la lettre dans le dossier Courrier.", object: `<span class="ico">✉️</span>lettre.pdf`, target: `<span class="ico">📁</span>Courrier`, ok: "drag", hint: "Attrapez la lettre (bouton gauche enfoncé), amenez-la sur le dossier, puis lâchez.", why: "On <b>glisse-dépose</b> : bouton enfoncé pendant tout le trajet, on lâche sur le dossier." },
      { prompt: "Dans un formulaire, cochez la case « J'accepte ».", object: `<span class="ico">☐</span>J'accepte`, ok: "click", why: "Une case se coche d'un <b>simple clic</b>." }
    ].map(r => ({ kind: "gesture", limit: 20, short: r.prompt.replace(/<[^>]+>/g, "").slice(0, 50), ...r })) });

  G({ id: "sc_g_glisser", title: "Glisser-déposer, dans l'ordre", icon: "🧩",
    intro: "Les étapes du glisser-déposer sont mélangées : remettez-les <b>dans l'ordre</b> !",
    rounds: [{ kind: "order", limit: 60, prompt: "Ranger une photo dans un dossier :", answer: ["Je pose la flèche sur la photo", "J'appuie sur le bouton gauche… et je le garde enfoncé", "Je déplace la souris jusqu'au dossier", "Je lâche le bouton"],
      why: "Le secret : <b>garder le bouton enfoncé</b> pendant tout le trajet. Erreur ? Ctrl + Z annule." }] });

  const VF = ["✅ Vrai", "❌ Faux"];
  G({ id: "sc_g_vf", title: "La souris : vrai ou faux ?", icon: "🖱️",
    intro: "Vrai ou faux ? Des idées reçues sur la souris…",
    rounds: [
      ["Au bord du tapis, je soulève la souris et je la repose plus loin.", 0, "Vrai : en l'air, la souris ne bouge pas la flèche."],
      ["Pour réussir un double-clic, il faut appuyer très fort.", 1, "Faux : c'est une question de <b>rythme</b> (toc-toc), pas de force."],
      ["Le clic droit peut effacer un fichier tout seul.", 1, "Faux : il ouvre seulement un menu. C'est l'action qu'on choisit ensuite qui compte."],
      ["La molette sert à faire défiler une page.", 0, "Vrai : la petite roue fait monter ou descendre la page."],
      ["Un menu ouvert par erreur se ferme avec la touche Échap.", 0, "Vrai : Échap, ou un clic à côté. Rien n'est changé."]
    ].map(([p, ok, why]) => ({ kind: "choice", prompt: scene(p), choices: VF, ok, why, short: p.slice(0, 50), limit: 15 })) });

  /* =================== SÉANCE 3 : le clavier =================== */
  // Un clavier dessiné dont certaines touches sont « à trouver »
  const ROWS = [
    [["", "²"], ["", "& 1"], ["", "é 2"], ["", "\" 3"], ["", "' 4"], ["", "( 5"], ["", "- 6"], ["", "è 7"], ["", "_ 8"], ["", "ç 9"], ["at", "à 0 @"], ["", ") °"], ["", "= +"], ["bs", "⌫ Effacer", 2]],
    [["", "↹", 1.5], ...["A", "Z", "E", "R", "T", "Y", "U", "I", "O", "P"].map(l => ["", l]), ["circ", "^ ¨"], ["", "$ £"], ["enter", "↵ Entrée", 1.5]],
    [["caps", "⇩ Verr. Maj", 1.8], ...["Q", "S", "D", "F", "G", "H", "J", "K", "L", "M"].map(l => ["", l]), ["", "ù %"], ["", "* µ"], ["enter", "", 1.2]],
    [["maj", "⇧ Maj", 1.3], ["", "< >"], ...["W", "X", "C", "V", "B", "N"].map(l => ["", l]), ["", ", ?"], ["", "; ."], ["", ": /"], ["", "! §"], ["maj", "⇧ Maj", 2.7]],
    [["", "Ctrl", 1.5], ["", "⊞", 1.2], ["", "Alt", 1.2], ["space", "Espace", 6.3], ["altgr", "Alt Gr", 1.4], ["", "Ctrl", 1.5], ["", "←"], ["", "→"]]
  ];
  const kbHTML = zones => `<div class="pk-kb lh-kb-spot" style="max-width:820px">${ROWS.map(r => `<div class="pk-row">${r.map(([z, l, w = 1]) => `<span class="pk-key ${l.length > 3 ? "word" : "letter"}" style="--w:${w}" ${z && zones[z] ? `data-z="${z}"` : ""}><b>${l}</b></span>`).join("")}</div>`).join("")}</div>`;
  const KZ = { maj: "⇧ Maj : pour UNE majuscule (on la garde enfoncée)", caps: "⇩ Verr. Maj : TOUT en majuscules (on la rallume pour l'éteindre)", altgr: "Alt Gr : pour l'arobase @ (avec à 0)", at: "à 0 : la touche de l'arobase (avec Alt Gr)", enter: "↵ Entrée : valider, ou aller à la ligne", bs: "⌫ Effacer : efface la lettre à gauche du curseur", space: "Espace : entre deux mots", circ: "^ : le chapeau (^ puis e = ê)" };
  G({ id: "sc_g_touches", title: "Les touches magiques", icon: "⌨️", noRank: false,
    intro: "Sur le clavier dessiné, trouvez les <b>8 touches magiques</b> : Maj, Verr. Maj, Alt Gr, la touche de l'@, Entrée, Effacer, Espace et le chapeau ^. Cliquez dessus !",
    rounds: [{ kind: "spot", limit: 120, short: "Les touches magiques", prompt: "Cliquez sur les 8 touches magiques du clavier 🔍", zones: KZ, content: kbHTML(KZ),
      why: "Ces 8 touches suffisent pour presque tout : majuscules, @, accents, corrections." }] });

  G({ id: "sc_g_lire", title: "Lire avant d'agir", icon: "👀",
    intro: "Appuyez sur <b>une seule touche</b>… mais lisez <b>toute</b> la consigne avant : il y a des pièges ! 😉",
    rounds: [
      { prompt: "Tapez la lettre <b>m</b>.", ok: "m", why: "Sur le clavier français, le M est à droite, au bout de la ligne du milieu (pas à côté du N !)." },
      { prompt: "Tapez la lettre <b>a</b>… <br><b>⚠️ Attention :</b> ne tapez <b>PAS</b> la lettre a. Tapez la lettre <b>e</b>.", ok: "e", why: "Le piège ! On lit la consigne <b>jusqu'au bout</b> avant d'appuyer." },
      { prompt: "<b>Si le rond est ROUGE</b>, tapez <b>e</b>.<br><b>Si le rond est BLEU</b>, tapez <b>a</b>.", scene: `<span class="sc-dot blue"></span>`, ok: "a", why: "Le rond était <b>bleu</b> : donc la lettre <b>a</b>." },
      { prompt: "Tapez la <b>première lettre</b> du mot <b>pomme</b>.", ok: "p", why: "Pomme commence par <b>p</b>." },
      { prompt: "Faites une majuscule : <b>A</b>", ok: "A", why: "⇧ Maj enfoncée + la lettre a : <b>A</b>. (Sur un clavier français, le A est en haut à gauche.)" },
      { prompt: "Appuyez sur la touche qui <b>valide</b>.", ok: "Enter", why: "La touche <b>↵ Entrée</b> valide (ou va à la ligne dans un texte)." }
    ].map(r => ({ kind: "key", limit: 15, short: r.prompt.replace(/<[^>]+>/g, "").slice(0, 50), ...r })) });

  G({ id: "sc_g_accents", title: "La dictée des accents", icon: "✍️",
    intro: "Recopiez <b>exactement</b>, avec les accents ! Rappel : é = 2 · è = 7 · à = 0 · ç = 9 · ê = ^ puis e · @ = Alt Gr + à",
    rounds: [
      { kind: "type", target: "café", prompt: "Recopiez ce mot :", hint: "é : la touche 2, sans Maj.", why: "Le <b>é</b> a sa propre touche : le 2 (sans Maj).", limit: 40 },
      { kind: "type", target: "La clé est à côté du café.", prompt: "Recopiez la phrase :", hint: "à : la touche 0 · ô : ^ puis o · Le point : ⇧ Maj + ; .", why: "Majuscule au début, accents, point final : on <b>relit</b> avant de valider.", limit: 70 },
      { kind: "type", target: "Il a reçu un colis.", prompt: "Recopiez la phrase :", hint: "ç : la touche 9, sans Maj.", why: "Le <b>ç</b> est sur la touche 9.", limit: 60 },
      { kind: "type", target: "marie.dupont@exemple.fr", prompt: "Et une adresse e-mail :", hint: "@ : Alt Gr + à. Tout en minuscules, sans espace.", why: "L'arobase <b>@</b> : Alt Gr enfoncée, puis la touche à 0.", limit: 60 }
    ].map(r => ({ short: r.target, ...r })) });
})(window.AN);

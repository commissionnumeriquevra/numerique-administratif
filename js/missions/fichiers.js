/* =========================================================
   Chapitre « Fichiers et dossiers » : 8 niveaux progressifs.
   Tout se passe dans un Explorateur Windows simulé (AN.files) :
   rien n'est écrit sur le vrai ordinateur, sauf au niveau 8
   (mission réelle, guidée, sans rien supprimer).
   On peut toujours continuer après une erreur ; note /20 à la fin.
   ========================================================= */
(function (AN) {
  "use strict";
  const { esc } = AN.util;
  const R = AN.missions.register;
  const KIT = () => AN.missionKit;
  const F = () => AN.files;
  const grader = L => AN.mail.grader(L.grade ||= {});
  const frame = (ctx, o) => KIT().frame(ctx, { chapter: "Fichiers", noClient: false, ...o });
  const tasksHTML = t => KIT().tasksHTML(t);
  const quiz = (el, o) => KIT().inlineQuiz(el, o);
  const alive = ctx => ctx.box.isConnected && ctx.box.__an?.ctx === ctx;
  const finish = (ctx, G, o) => { if (alive(ctx)) return KIT().finish(ctx, G, o); };
  const later = (ctx, fn, ms) => { const t = setTimeout(() => { if (alive(ctx)) fn(); }, ms); ctx.onCleanup(() => clearTimeout(t)); };
  const norm = s => String(s || "").normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
  const plain = h => String(h || "").replace(/<[^>]+>/g, "");
  const Y = new Date().getFullYear();
  const MOIS = ["janvier", "février", "mars", "avril", "mai", "juin", "juillet", "août", "septembre", "octobre", "novembre", "décembre"];
  const monthBack = n => { const d = new Date(); d.setDate(1); d.setMonth(d.getMonth() - n); return d; };
  const ym = d => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
  const moisLabel = d => `${MOIS[d.getMonth()]} ${d.getFullYear()}`;

  /** Monte l'Explorateur dans la zone de l'exercice (détruit proprement à la sortie). */
  function mountX(ctx, host, opts) {
    ctx.local.x?.destroy();
    const x = F().explorer(host, { big: ctx.demo, ...opts });
    ctx.local.x = x;
    if (!ctx.local.xHook) { ctx.local.xHook = true; ctx.onCleanup(() => ctx.local.x?.destroy()); }
    return x;
  }

  /** Liste de tâches + zone de retour + emplacement pour les questions de fin. */
  function tasker(panel, tasks, { head = "" } = {}) {
    let note = "";
    const draw = () => {
      const cur = tasks.find(t => !t.done);
      panel.innerHTML = head + tasksHTML(tasks.map(t => ({ done: t.done, label: t === cur ? `<b>👉</b> ${t.label}` : t.label }))) + `<div class="mk-fb">${note}</div><div class="mk-q-slot"></div>`;
    };
    draw();
    return {
      tasks, draw,
      done(k) { const t = tasks.find(t => t.k === k); if (!t || t.done) return false; t.done = true; note = ""; draw(); return true; },
      is: k => !!tasks.find(t => t.k === k)?.done,
      get all() { return tasks.every(t => t.done); },
      get next() { return tasks.find(t => !t.done); },
      note(h) { note = h; const e = panel.querySelector(".mk-fb"); if (e) e.innerHTML = h; },
      slot: () => panel.querySelector(".mk-q-slot")
    };
  }

  /* ---------- documents fictifs (aperçus) ---------- */
  const doc = (title, lines, from = "") => `${from ? `<p style="color:#555;font-size:.9em">${from}</p>` : ""}<h3>${title}</h3>${lines.map(l => `<p>${l}</p>`).join("")}`;
  const D = {
    ordonnance: doc("Ordonnance", ["Mme Marie DUPONT", "Paracétamol 1 g : 1 comprimé matin et soir pendant 5 jours.", "Dr Martin, médecin généraliste"], "Cabinet du Dr Martin · Valbourg"),
    mutuelle: doc(`Attestation de mutuelle ${Y}`, ["Mme Marie DUPONT est bien couverte du 1er janvier au 31 décembre " + Y + "."], "Mutuelle des Collines"),
    caf: doc("Attestation de paiement", [`Paiement du mois de ${moisLabel(monthBack(0))} : versé le 5.`, "Mme Marie DUPONT"], "Caisse des aides (simulation)"),
    edf: d => doc(`Facture d'électricité · ${moisLabel(d)}`, ["Mme Marie DUPONT", "12 rue des Lilas, 26000 Valbourg", "Montant : 64,20 €"], "Électricité de Valbourg"),
    impot: y => doc(`Avis d'impôt ${y} sur les revenus ${y - 1}`, ["Mme Marie DUPONT", "Ce document sert souvent de justificatif."], "Impôts (simulation)"),
    loyer: d => doc(`Quittance de loyer · ${moisLabel(d)}`, ["Mme Marie DUPONT · 12 rue des Lilas", "Loyer et charges payés."], "Agence du Centre"),
    recette: doc("Gâteau au yaourt", ["1 pot de yaourt, 2 pots de sucre, 3 pots de farine…"]),
    mairie: doc("Lettre à la mairie", ["Madame, Monsieur,", "Je souhaite m'inscrire sur les listes électorales…"])
  };

  /* =========================================================
     NIVEAU 1 — Se repérer dans l'Explorateur
     ========================================================= */
  R("fic_explore", {
    steps: 1,
    render(ctx) {
      const L = ctx.local, G = grader(L);
      if ((ctx.m.step || 0) > 0) return ctx.finalScreen({ theme: null });
      const f = frame(ctx, { level: 1, title: "Se repérer dans l'Explorateur", step: 0,
        consigne: "Voici l'<b>Explorateur de fichiers</b> de Marie : c'est là que l'ordinateur range tout ce qu'elle garde. Suivez les tâches dans l'ordre.",
        help: "Pour ouvrir un dossier ou un fichier : un <b>double-clic</b> (deux clics rapides) dessus. La colonne de gauche mène directement aux grands dossiers." });
      const { pc, file, folder } = F();
      const fs = pc({
        bureau: [file("Corbeille.lnk", { size: 1 }), file("Atelier numérique.lnk", { size: 1 })],
        telechargements: [file("recette_gateau_yaourt.pdf", { ago: 12, content: D.recette })],
        documents: [
          folder("Santé", [file("ordonnance_dr_martin.pdf", { tag: "ord", ago: 6, content: D.ordonnance }), file(`attestation_mutuelle_${Y}.pdf`, { ago: 40, content: D.mutuelle })], { tag: "sante" }),
          folder("Maison", [file(`facture_edf_${ym(monthBack(1))}.pdf`, { content: D.edf(monthBack(1)) })]),
          file("lettre_mairie.docx", { ago: 20, content: D.mairie, size: 24 })
        ],
        images: [
          file("anniversaire_lucas.jpg", { tag: "photo", ago: 3, size: 2300, emoji: "🎂", bg: "#ffe3ec", caption: "Les 8 ans de Lucas" }),
          file("jardin_printemps.jpg", { ago: 160, size: 1900, emoji: "🌷", bg: "#e4f6e0", caption: "Le jardin au printemps" })
        ]
      });
      const T = tasker(f.panel, [
        { k: "images", label: "Ouvrez le dossier <b>Images</b> (dans la colonne de gauche)." },
        { k: "photo", label: "Ouvrez la photo <b>anniversaire_lucas</b> avec un double-clic. Puis fermez-la avec <b>✕ Fermer</b>." },
        { k: "sante", label: "Allez dans <b>Documents</b>, puis ouvrez le dossier <b>Santé</b>." },
        { k: "ord", label: "Ouvrez l'<b>ordonnance</b> du Dr Martin, puis fermez-la." },
        { k: "back", label: "Revenez au dossier précédent avec la flèche <b>←</b>, en haut à gauche." },
        { k: "crumb", label: "Dans la barre du <b>chemin</b>, en haut, cliquez sur <b>Ce PC</b> pour remonter tout en haut." }
      ]);
      const beginner = ctx.isBeginner();
      const hint = () => {
        if (!beginner || !L.x) return;
        const k = T.next?.k, x = L.x;
        const map = { images: [x.byTag("images").id], photo: [x.find(n => n.tag === "photo").id], sante: [x.current === x.byTag("documents") ? x.byTag("sante").id : x.byTag("documents").id], ord: [x.find(n => n.tag === "ord").id], back: [null, "back"], crumb: [null, "crumb"] };
        const [id, tool] = map[k] || [];
        x.hint(id, tool);
      };
      const done = (k, label) => {
        if (!T.done(k)) return;
        G.ok(k, label);
        if (T.all) {
          L.x.hint(null);
          T.note(`<div class="alert good">✅ Bravo ! Vous savez circuler dans l'Explorateur : les dossiers, le chemin, les flèches.</div>`);
          quiz(T.slot(), { G, key: "q1", questions: [
            { q: "Un <b>dossier</b>, c'est…", choices: ["Un document à lire", "Une boîte qui sert à ranger des fichiers (et d'autres dossiers)", "Un programme"], ok: 1, why: "Comme une chemise cartonnée dans un tiroir : elle contient des feuilles (les fichiers), et même d'autres chemises." },
            { q: "Le chemin <code>Ce PC › Documents › Santé</code> veut dire…", choices: ["Le dossier Santé est rangé dans Documents", "Documents est rangé dans Santé", "Ce sont trois dossiers séparés"], ok: 0, why: "On lit de gauche à droite, comme une adresse : l'ordinateur, puis le tiroir Documents, puis la chemise Santé." },
            { q: "Je me suis perdu(e) dans les dossiers. Que faire ?", choices: ["J'éteins l'ordinateur", "La flèche ← pour revenir, ou un grand dossier dans la colonne de gauche", "J'appelle un technicien"], ok: 1, why: "On ne peut rien casser en se promenant : la flèche ← revient en arrière, la colonne de gauche ramène aux grands dossiers." }
          ], onDone: () => finish(ctx, G, { key: "fic_explore", label: "Je sais me repérer dans l'Explorateur", intro: "Vous savez ouvrir un dossier et un fichier, lire le chemin, revenir en arrière et remonter." }) });
        } else hint();
      };
      mountX(ctx, f.host, { fs, start: "bureau", features: { newFolder: false, cut: false, rename: false, del: false, trash: false, drag: false }, onEvent: (type, d, x) => {
        const k = T.next?.k;
        if (type === "navigate") {
          if (k === "images" && d.folder?.tag === "images") done("images", "Ouvrir un grand dossier");
          else if (k === "sante" && d.folder?.tag === "sante") done("sante", "Ouvrir un dossier dans un autre dossier");
          else if (k === "back" && d.via === "back") done("back", "Revenir en arrière avec la flèche ←");
          else if (k === "back" && d.via !== "back") T.note(`<div class="alert">Presque : cette fois, utilisez la <b>flèche ←</b> en haut à gauche. C'est le bouton « retour ».</div>`);
          else if (k === "crumb" && d.via === "crumb" && d.folder?.tag === "pc") done("crumb", "Remonter avec la barre du chemin");
          else if (k === "crumb" && d.folder?.tag === "pc") T.note(`<div class="alert">Vous êtes bien remonté(e) ! Essayez aussi en cliquant sur <b>Ce PC</b> dans le chemin, en haut.</div>`);
          hint();
        }
        if (type === "open") {
          const t = d.file.tag;
          if (k === "photo" && t === "photo") done("photo", "Ouvrir un fichier avec un double-clic");
          else if (k === "ord" && t === "ord") done("ord", "Trouver un document rangé dans un dossier");
          else if (k === "photo" || k === "ord") x.flash("Ce n'est pas le fichier demandé, mais vous l'avez bien ouvert ! Fermez-le avec ✕ et cherchez encore.", "info");
        }
      } });
      hint();
    }
  });

  /* =========================================================
     NIVEAU 2 — La famille d'un fichier : l'extension
     ========================================================= */
  R("fic_ext", {
    steps: 1,
    render(ctx) {
      const L = ctx.local, G = grader(L);
      if ((ctx.m.step || 0) > 0) return ctx.finalScreen({ theme: null });
      const f = frame(ctx, { level: 2, title: "La famille d'un fichier : l'extension", step: 0,
        consigne: "La fin du nom d'un fichier (<b>.pdf</b>, <b>.jpg</b>, <b>.docx</b>…) s'appelle l'<b>extension</b> : elle dit quelle est sa <b>famille</b>. Windows la cache souvent… on va l'afficher !",
        help: "Afficher les extensions : bouton <b>👁️ Afficher</b>, puis <b>Extensions de noms de fichiers</b>." });
      const { pc, file } = F();
      const fs = pc({ telechargements: [
        file(`facture_edf_${ym(monthBack(1))}.pdf`, { tag: "pdf", ago: 4, content: D.edf(monthBack(1)) }),
        file("photo_mairie.jpg", { tag: "jpg", ago: 9, size: 1800, emoji: "🏛️", bg: "#e7eefb", caption: "La mairie de Valbourg" }),
        file("lettre_caf.docx", { tag: "docx", ago: 15, size: 26, content: doc("Lettre à la CAF", ["Madame, Monsieur,", "Veuillez trouver ci-joint…"]) }),
        file("photos_vacances.zip", { tag: "zip", ago: 30, size: 15400, content: "<p>Contient : plage.jpg, glaces.jpg, coucher_soleil.jpg</p>" }),
        file("facture_colis.pdf.exe", { tag: "trap", ago: 0, size: 812, publisher: "Inconnu" }),
        file("Lecteur_PDF_GRATUIT.exe", { tag: "exe", ago: 60, size: 3400, publisher: "Inconnu" })
      ] });
      const T = tasker(f.panel, [
        { k: "ext", label: "Faites apparaître les <b>extensions</b> : <b>👁️ Afficher</b> › <b>Extensions de noms de fichiers</b>." },
        { k: "find_pdf", label: "Cliquez une fois sur le <b>document PDF</b> (la facture)." },
        { k: "find_jpg", label: "Cliquez une fois sur la <b>photo</b>." },
        { k: "find_docx", label: "Cliquez une fois sur le <b>document Word</b> (un courrier qu'on peut modifier)." },
        { k: "trap", label: "Un fichier « facture_colis » vient d'arriver. Est-ce vraiment une facture ? <b>Regardez sa vraie extension</b>, et <b>supprimez-le</b> s'il est dangereux." }
      ], { head: `<div class="fk-ext"><span>📕 .pdf</span><span>🖼️ .jpg</span><span>📘 .docx</span><span>🗜️ .zip</span><span>⚙️ .exe</span></div>` });
      const want = { find_pdf: "pdf", find_jpg: "jpg", find_docx: "docx" };
      const WHY = { pdf: "« .pdf » = un document à lire ou imprimer, souvent envoyé par les administrations.", jpg: "« .jpg » = une photo ou une image.", docx: "« .docx » = un document Word, qu'on peut modifier.", zip: "« .zip » = un dossier compressé : plusieurs fichiers emballés dans un seul.", exe: "« .exe » = un programme : il s'installe ou agit sur l'ordinateur.", trap: "Attention : son vrai nom finit par « .exe » : c'est un programme déguisé en facture !" };
      let wrong = {};
      const endIfDone = () => {
        if (!T.all || L.ended) return; L.ended = true;
        T.note(`<div class="alert good">✅ Vous savez lire la famille d'un fichier… et repérer un programme déguisé. C'est un réflexe qui protège !</div>`);
        quiz(T.slot(), { G, key: "q2", questions: [
          { q: "Je reçois « <code>attestation.pdf.exe</code> ». C'est…", choices: ["Une attestation en PDF", "Un programme déguisé : je ne l'ouvre pas", "Une photo"], ok: 1, why: "Seule la <b>dernière</b> extension compte : « .exe », c'est un programme. Les escrocs ajoutent « .pdf » au milieu pour tromper." },
          { q: "Un site demande « un fichier PDF ». Lequel convient ?", choices: ["avis_impot.pdf", "avis_impot.jpg", "avis_impot.docx"], ok: 0, why: "L'extension doit être <b>.pdf</b>. Une photo (.jpg) n'est pas un PDF, même si elle montre le même document." },
          { q: "Je n'arrive pas à ouvrir « vacances.zip ». C'est normal ?", choices: ["Oui : c'est un dossier compressé, il faut d'abord l'extraire", "Non, il est cassé"], ok: 0, why: "Un .zip est un « colis » : clic droit → <b>Extraire tout</b>, et les fichiers apparaissent." }
        ], onDone: () => finish(ctx, G, { key: "fic_ext", label: "Je reconnais la famille d'un fichier", intro: "Vous savez afficher les extensions et reconnaître un PDF, une photo, un document Word, un fichier compressé… et un programme déguisé." }) });
      };
      const hint = () => { if (ctx.isBeginner() && L.x) { const k = T.next?.k; L.x.hint(null, k === "ext" ? "view" : null); } };
      mountX(ctx, f.host, { fs, start: "telechargements", features: { newFolder: false, cut: false, rename: false, drag: false }, onEvent: (type, d, x) => {
        const k = T.next?.k;
        if (type === "showExt" && d.on && T.done("ext")) { G.ok("ext", "Afficher les extensions des fichiers"); x.flash("👀 Les extensions apparaissent à la fin des noms : <b>.pdf</b>, <b>.jpg</b>, <b>.exe</b>…", "good"); hint(); }
        if (type === "showExt" && !d.on && T.is("ext")) x.flash("Vous avez caché les extensions. Pour la suite, mieux vaut les afficher : 👁️ Afficher › Extensions.", "warn", 6000);
        if (type === "select" && want[k] && d.file) {
          const ext = F().extOf(d.file.name), tag = d.file.tag;
          if (ext === want[k] && tag !== "trap") { if (T.done(k)) { G.ok(k, `Reconnaître un fichier .${want[k]}`); x.flash(`✅ ${WHY[want[k]]}`, "good"); } }
          else if (!wrong[k]) { wrong[k] = true; G.ko(k, `Reconnaître un fichier .${want[k]}`, WHY[tag === "trap" ? "trap" : ext] || ""); x.flash(`Pas celui-là : ${WHY[tag === "trap" ? "trap" : ext] || "regardez la fin de son nom."}`, "warn", 6000); }
          else x.flash(`Regardez la fin du nom, ou la colonne <b>Type</b>.`, "info");
        }
        if (type === "exe") {
          if (d.file.tag === "trap") L.openedTrap = true;
          T.note(`<div class="alert">🛑 Windows demande la permission de lancer un <b>programme</b>. Un fichier « facture » qui est un programme, c'est un piège : on clique sur <b>Non</b>.</div>`);
        }
        if (type === "exeRun") {
          G.ko("noexe", "Ne jamais lancer un programme inconnu", "Une facture n'est jamais un programme (.exe). Dans le doute, on clique « Non ».");
          T.note(`<div class="alert bad">😬 Dans la vraie vie, ce programme aurait pu installer un virus. Ici, rien ne se passe : c'est un exercice. Retenez : un programme inconnu, on dit <b>Non</b>.</div>`);
        }
        if (type === "exeRefused") { G.ok("noexe", "Ne jamais lancer un programme inconnu"); T.note(`<div class="alert good">👍 Bon réflexe : <b>Non</b>. Maintenant, supprimez ce faux fichier.</div>`); }
        if (type === "delete") {
          if (d.file.tag === "trap") { if (!G.has("noexe")) G.ok("noexe", "Ne jamais lancer un programme inconnu"); if (T.done("trap")) G.ok("trap", "Repérer un programme déguisé en facture"); x.flash("🗑️ Bien joué : le faux fichier « facture_colis.pdf.exe » est à la Corbeille.", "good", 6000); }
          else if (d.file.tag === "exe") x.flash("Ce programme est d'origine inconnue : le supprimer est prudent. Mais le fichier piégé, c'est « facture_colis ».", "info", 6000);
          else { x.flash(`Vous avez supprimé « ${esc(d.file.name)} », qui n'était pas dangereux. On le remet !`, "warn", 5000); x.restore(d.file); }
        }
        if (k === "trap" && type === "select" && d.file?.tag === "trap" && !x.state.showExt) x.flash("Regardez la colonne <b>Type</b> : « Application ». Et affichez les extensions pour voir son vrai nom.", "info", 6000);
        endIfDone();
      } });
      hint();
    }
  });

  /* =========================================================
     NIVEAU 3 — Bien nommer (renommer) ses fichiers
     ========================================================= */
  R("fic_rename", {
    steps: 1,
    render(ctx) {
      const L = ctx.local, G = grader(L);
      if ((ctx.m.step || 0) > 0) return ctx.finalScreen({ theme: null });
      const prev = monthBack(1);
      const showExt = !ctx.isBeginner();
      const f = frame(ctx, { level: 3, title: "Bien nommer ses fichiers", step: 0,
        consigne: "Dans les Téléchargements, les fichiers ont des noms qui ne veulent rien dire. Ouvrez chacun pour voir ce que c'est, puis <b>renommez-le</b> avec un nom clair.",
        help: "Renommer : cliquez <b>une fois</b> sur le fichier, puis sur <b>✏️ Renommer</b> (ou touche F2). Tapez le nom, puis <b>Entrée</b>." });
      const { pc, file } = F();
      const fs = pc({ telechargements: [
        file("document (1).pdf", { tag: "caf", ago: 0, content: D.caf }),
        file("document (2).pdf", { tag: "edf", ago: 2, content: D.edf(prev) }),
        file("scan0001.pdf", { tag: "mut", ago: 6, content: D.mutuelle, size: 340 })
      ] });
      const goals = {
        caf: { words: [["attestation", "attest"], ["caf", "aides"]], model: `attestation_caf_${ym(new Date())}.pdf`, label: "l'attestation de paiement de la CAF" },
        edf: { words: [["facture"], ["edf", "electricite", "elec"]], model: `facture_edf_${ym(prev)}.pdf`, label: "la facture d'électricité" },
        mut: { words: [["mutuelle"]], model: `attestation_mutuelle_${Y}.pdf`, label: "l'attestation de mutuelle" }
      };
      const okName = (tag, n) => goals[tag].words.every(alts => alts.some(w => norm(n).includes(w)));
      const T = tasker(f.panel, [
        { k: "caf", label: `Renommez <code>document (1)</code> : c'est ${goals.caf.label}.` },
        { k: "edf", label: `Renommez <code>document (2)</code> : c'est ${goals.edf.label}.` },
        { k: "mut", label: `Renommez <code>scan0001</code> : c'est ${goals.mut.label}.` }
      ], { head: `<div class="alert">📝 <b>Un bon nom</b> = <b>ce que c'est</b> + <b>de qui</b> + <b>la date</b>, sans espace : <code>facture_edf_${ym(prev)}</code><br>
        <small>Les tirets bas « _ » remplacent les espaces. ${showExt ? "<b>Gardez la fin « .pdf »</b> : c'est l'extension." : "La fin « .pdf » est cachée : Windows la garde tout seul."}</small></div>` });
      const tries = {};
      const end = () => {
        if (!T.all || L.ended) return; L.ended = true;
        if (!G.has("ext")) G.ok("ext", "Garder l'extension en renommant");
        T.note(`<div class="alert good">✅ Vos fichiers ont maintenant des noms clairs : vous les retrouverez du premier coup, même dans un an.</div>`);
        quiz(T.slot(), { G, key: "q3", questions: [
          { q: "Pourquoi mettre la <b>date</b> dans le nom ?", choices: ["Pour faire joli", "Pour distinguer les factures de chaque mois, et retrouver la plus récente", "C'est obligatoire"], ok: 1, why: "Avec l'année et le mois au début ou à la fin, les factures se rangent toutes seules dans l'ordre." },
          { q: "« document (1).pdf », « document (2).pdf »… Que veulent dire les numéros ?", choices: ["Que le fichier est abîmé", "Que l'ordinateur avait déjà un fichier du même nom", "Que c'est la page 1 et la page 2"], ok: 1, why: "Quand un nom existe déjà, Windows ajoute (1), (2)… C'est le signe qu'il faut renommer !" },
          { q: "Je renomme « facture.pdf » en « facture ». Que risque-t-il de se passer ?", choices: ["Rien", "L'ordinateur ne saura plus avec quoi l'ouvrir", "Le fichier sera plus léger"], ok: 1, why: "Sans l'extension .pdf, Windows ne sait plus que c'est un PDF. On la garde toujours." }
        ], onDone: () => finish(ctx, G, { key: "fic_rename", label: "Je sais renommer un fichier clairement", intro: "Vous savez ouvrir un fichier pour vérifier ce que c'est, puis lui donner un nom clair, sans abîmer son extension." }) });
      };
      mountX(ctx, f.host, { fs, start: "telechargements", showExt, features: { newFolder: false, cut: false, del: false, drag: false, trash: false }, onEvent: (type, d, x) => {
        if (type === "open") { const g = goals[d.file.tag]; if (g) T.note(`<div class="alert">👀 C'est ${g.label}. Fermez l'aperçu, puis renommez-le. Exemple : <code>${showExt ? g.model : F().baseOf(g.model)}</code></div>`); }
        if (type === "renameRefused" && d.reason === "chars") G.ko("chars", "Éviter les caractères interdits", "Windows refuse \\ / : * ? \" < > | dans un nom. Pour la date, on écrit 2026-10 plutôt que 10/2026.");
        if (type === "renameRefused" && d.reason === "ext-warning") T.note(`<div class="alert">⚠️ Windows vous prévient : vous alliez changer ou effacer la fin <b>.pdf</b>. Répondez <b>Non</b>, puis recommencez en gardant « .pdf ».</div>`);
        if (type === "extChanged") {
          G.ko("ext", "Garder l'extension en renommant", "En effaçant « .pdf », le fichier ne s'ouvre plus. Il faut la remettre.");
          T.note(`<div class="alert bad">😬 Le fichier n'a plus son extension .pdf : l'ordinateur ne sait plus l'ouvrir. Renommez-le encore en remettant <b>.pdf</b> à la fin.</div>`);
        }
        if (type === "rename") {
          const tag = d.file.tag, g = goals[tag]; if (!g) return;
          if (F().extOf(d.to) !== "pdf") return; // l'extension a été cassée : on attend la correction
          if (/\.pdf\.pdf$/i.test(d.to)) x.flash("Windows cache la fin « .pdf » et l'ajoute tout seul : le fichier s'appelle maintenant « …<b>.pdf.pdf</b> ». Renommez-le sans taper « .pdf ».", "info", 8000);
          const good = okName(tag, d.to);
          tries[tag] = (tries[tag] || 0) + 1;
          if (good) {
            if (T.done(tag)) { if (tries[tag] === 1) G.ok("n_" + tag, `Nommer clairement ${g.label}`); x.flash(`✅ « ${esc(d.to)} » : on sait tout de suite ce que c'est !`, "good"); }
            if (!/\d{4}/.test(d.to) && !L.dateTip) { L.dateTip = true; x.flash("👍 Bon nom ! Astuce : ajoutez aussi la date (ex. 2026-10), pour les documents qui reviennent chaque mois.", "info", 7000); }
          } else {
            if (tries[tag] === 1) G.ko("n_" + tag, `Nommer clairement ${g.label}`, `Il fallait dire ce que c'est, par exemple : ${g.model}`);
            T.note(`<div class="alert">Ce nom ne dit pas assez ce que c'est. Exemple : <code>${showExt ? g.model : F().baseOf(g.model)}</code>. Renommez-le encore.</div>`);
          }
        }
        end();
      } });
    }
  });

  /* =========================================================
     NIVEAU 4 — Ranger : créer des dossiers et déplacer
     ========================================================= */
  R("fic_folders", {
    steps: 1,
    render(ctx) {
      const L = ctx.local, G = grader(L);
      if ((ctx.m.step || 0) > 0) return ctx.finalScreen({ theme: null });
      const expert = ctx.level === "expert";
      const f = frame(ctx, { level: 4, title: "Ranger : créer des dossiers", step: 0,
        consigne: "Dans <b>Documents</b>, tout est en vrac ! Créez des dossiers et rangez chaque document dans le bon.",
        help: "Nouveau dossier : <b>＋ Nouveau</b> › <b>Dossier</b>, tapez son nom, Entrée. Pour déplacer un fichier : <b>glissez-le</b> sur le dossier, ou bien <b>✂️ Couper</b>, ouvrez le dossier, <b>📋 Coller</b>." });
      const { pc, file, folder } = F();
      const prev = monthBack(1), prev2 = monthBack(2);
      const fs = pc({ documents: [
        file("ordonnance_dr_martin.pdf", { tag: "sante", ago: 6, content: D.ordonnance }),
        file(`attestation_mutuelle_${Y}.pdf`, { tag: "sante", ago: 40, content: D.mutuelle }),
        file(`avis_impot_${Y}.pdf`, { tag: "impots", ago: 60, content: D.impot(Y) }),
        file(`avis_impot_${Y - 1}.pdf`, { tag: "impots", ago: 420, content: D.impot(Y - 1) }),
        ...(expert ? [file(`facture_edf_${ym(prev)}.pdf`, { tag: "maison", ago: 25, content: D.edf(prev) }), file(`quittance_loyer_${ym(prev2)}.pdf`, { tag: "maison", ago: 55, content: D.loyer(prev2) })] : []),
        folder("Photos de famille", [], { tag: "keep" })
      ] });
      const want = [["sante", "Santé"], ["impots", "Impôts"], ...(expert ? [["maison", "Maison"]] : [])];
      const T = tasker(f.panel, [
        ...want.map(([t, n]) => ({ k: "mk_" + t, label: `Dans <b>Documents</b>, créez un dossier <b>${n}</b>.` })),
        ...want.map(([t, n]) => ({ k: "mv_" + t, label: `Rangez dans <b>${n}</b> ${t === "sante" ? "l'ordonnance et l'attestation de mutuelle" : t === "impots" ? "les deux avis d'impôt" : "la facture d'électricité et la quittance de loyer"}.` }))
      ]);
      const dirOf = (x, t) => { const n = want.find(w => w[0] === t)[1]; return x.find(z => z.kind === "folder" && norm(z.name) === norm(n) && x.parentOf(z)?.tag === "documents"); };
      const wrongMove = {};
      const check = x => {
        want.forEach(([t, n]) => {
          const d = dirOf(x, t);
          if (d && T.done("mk_" + t)) G.ok("mk_" + t, `Créer le dossier « ${n} »`);
          if (d) {
            const files = []; F().walk(x.root, z => { if (z.tag === t && z.kind === "file") files.push(z); });
            if (files.every(z => x.parentOf(z) === d) && T.done("mv_" + t)) G.ok("mv_" + t, `Ranger les documents dans « ${n} »`);
          }
        });
        if (T.all && !L.ended) {
          L.ended = true;
          T.note(`<div class="alert good">✅ Tout est rangé ! Ouvrez un dossier pour vérifier : chaque document est à sa place.</div>`);
          quiz(T.slot(), { G, key: "q4", questions: [
            { q: "Je glisse un fichier sur un dossier. Que se passe-t-il ?", choices: ["Le fichier est supprimé", "Le fichier est rangé dans ce dossier", "Le fichier est copié en deux exemplaires"], ok: 1, why: "Glisser-déposer <b>déplace</b> le fichier : il quitte son ancien dossier et va dans le nouveau." },
            { q: "« Couper » un fichier, c'est dangereux ?", choices: ["Oui, il disparaît", "Non : il reste là tant qu'on n'a pas cliqué sur « Coller » ailleurs"], ok: 1, why: "Couper prépare le déplacement (le fichier devient pâle). Il ne bouge vraiment qu'au moment de « Coller »." },
            { q: "Combien de dossiers faut-il créer ?", choices: ["Le plus possible", "Quelques-uns, avec des noms simples (Santé, Impôts, Maison…)", "Aucun"], ok: 1, why: "Quelques grands thèmes suffisent. Trop de dossiers, et on ne sait plus où chercher." }
          ], onDone: () => finish(ctx, G, { key: "fic_folders", label: "Je sais ranger mes fichiers dans des dossiers", intro: "Vous savez créer un dossier, lui donner un nom, et y ranger des documents (glisser, ou couper-coller)." }) });
        }
      };
      mountX(ctx, f.host, { fs, start: "documents", showExt: !ctx.isBeginner(), onEvent: (type, d, x) => {
        if (type === "newFolder") T.note(`<div class="alert">📁 Un nouveau dossier est apparu : tapez tout de suite son nom, puis <b>Entrée</b>.</div>`);
        if (type === "rename" && d.file.kind === "folder" && /^nouveau dossier/i.test(d.from) && !want.some(([, n]) => norm(n) === norm(d.to))) T.note(`<div class="alert">Le dossier s'appelle « ${esc(d.to)} ». Ce n'est pas un nom demandé : vous pouvez le renommer (✏️ Renommer).</div>`);
        if (type === "move" && d.file.kind === "file") {
          const t = d.file.tag, destTag = want.find(([, n]) => norm(n) === norm(d.to.name))?.[0];
          if (destTag && destTag !== t && !wrongMove[t]) { wrongMove[t] = true; G.ko("mv_" + t, `Ranger les documents dans le bon dossier`, `« ${d.file.name} » n'allait pas dans « ${d.to.name} ».`); x.flash(`Oups : « ${esc(d.file.name)} » ne va pas dans <b>${esc(d.to.name)}</b>. Pas grave : déplacez-le encore.`, "warn", 6000); }
          else if (destTag === t) x.flash(`✅ Rangé dans <b>${esc(d.to.name)}</b>.`, "good", 2500);
        }
        if (type === "delete") { x.flash("Pas besoin de supprimer ici : on range seulement. On le remet !", "warn"); x.restore(d.file); }
        if (["newFolder", "rename", "move", "restore"].includes(type)) check(x);
      } });
    }
  });

  /* =========================================================
     NIVEAU 5 — Supprimer… et récupérer (la Corbeille)
     ========================================================= */
  R("fic_trash", {
    steps: 1,
    render(ctx) {
      const L = ctx.local, G = grader(L);
      if ((ctx.m.step || 0) > 0) return ctx.finalScreen({ theme: null });
      const f = frame(ctx, { level: 5, title: "Supprimer… et récupérer", step: 0,
        consigne: "Marie a téléchargé trois fois la même attestation. Faites le ménage… puis rattrapez une erreur grâce à la <b>Corbeille</b>.",
        help: "Supprimer : cliquez une fois sur le fichier, puis <b>🗑️ Supprimer</b> (ou touche Suppr). Le fichier va dans la <b>Corbeille</b>, en bas à gauche." });
      const { pc, file } = F();
      const att = doc("Attestation de paiement", [`Paiement du mois de ${moisLabel(monthBack(0))}.`], "Caisse des aides (simulation)");
      const wedding = file("mariage_1975.jpg", { tag: "wedding", ago: 1, size: 3100, emoji: "💒", bg: "#fff3d6", caption: "Le mariage de Josiane et Robert, 1975" });
      const fs = pc({
        telechargements: [
          file("attestation_caf.pdf", { tag: "orig", ago: 3, content: att }),
          file("attestation_caf (1).pdf", { tag: "dup", ago: 3, h: 10, min: 16, content: att }),
          file("attestation_caf (2).pdf", { tag: "dup", ago: 3, h: 10, min: 17, content: att }),
          file("recette_gateau_yaourt.pdf", { ago: 12, content: D.recette })
        ],
        images: [file("jardin_printemps.jpg", { ago: 160, size: 1900, emoji: "🌷", bg: "#e4f6e0" })]
      });
      const T = tasker(f.panel, [
        { k: "dups", label: "Dans <b>Téléchargements</b>, supprimez les <b>deux copies</b> en trop : <code>(1)</code> et <code>(2)</code>. Gardez l'original." },
        { k: "restore", label: "😱 Josiane a supprimé hier, par erreur, la photo de son <b>mariage</b> ! Ouvrez la <b>Corbeille</b> et <b>restaurez</b>-la." },
        { k: "check", label: "Vérifiez : retournez dans <b>Images</b> et ouvrez la photo du mariage." }
      ]);
      let x;
      const hint = () => { if (!ctx.isBeginner() || !x) return; const k = T.next?.k; if (k === "restore") x.hint(x.inTrash(wedding) && !x.state.trashView ? "__trash" : null, x.state.trashView ? "restore" : null); else if (k === "check") x.hint(x.byTag("images").id); else x.hint(null); };
      const end = () => {
        if (!T.all || L.ended) return; L.ended = true; x.hint(null);
        if (!G.has("keep")) G.ok("keep", "Ne pas vider la Corbeille sans regarder");
        T.note(`<div class="alert good">✅ Photo sauvée ! Retenez : un fichier supprimé n'est pas perdu tout de suite, il attend dans la Corbeille.</div>`);
        quiz(T.slot(), { G, key: "q5", questions: [
          { q: "J'ai supprimé un fichier par erreur. Il est perdu ?", choices: ["Oui, pour toujours", "Non : il est dans la Corbeille, je peux le restaurer"], ok: 1, why: "La Corbeille garde les fichiers supprimés. Clic sur le fichier, puis <b>Restaurer</b> : il revient à sa place." },
          { q: "« Vider la Corbeille », c'est…", choices: ["Supprimer définitivement ce qu'elle contient", "Ranger les fichiers"], ok: 0, why: "Après « Vider », on ne peut plus récupérer. On regarde d'abord ce qu'il y a dedans !" },
          { q: "Une clé USB : je supprime un fichier dessus. Il va dans la Corbeille ?", choices: ["Oui, toujours", "Non, souvent il est supprimé tout de suite"], ok: 1, why: "Sur une clé USB, Windows supprime souvent <b>définitivement</b> : il demande d'ailleurs « Voulez-vous vraiment… ? ». Prudence !" }
        ], onDone: () => finish(ctx, G, { key: "fic_trash", label: "Je sais supprimer et récupérer un fichier", intro: "Vous savez supprimer un fichier en trop, et le récupérer dans la Corbeille en cas d'erreur." }) });
      };
      x = mountX(ctx, f.host, { fs, start: "telechargements", features: { newFolder: false, cut: false, rename: false, drag: false }, onEvent: (type, d) => {
        if (type === "delete") {
          const t = d.file.tag;
          if (t === "orig") { G.ko("orig", "Garder l'original", "On supprime les copies (1) et (2), pas le fichier d'origine."); x.flash("Oups : c'est l'<b>original</b> ! Pas de panique : allez dans la <b>Corbeille</b> et restaurez-le.", "warn", 7000); }
          else if (t === "dup") {
            const left = []; F().walk(x.root, z => { if (z.tag === "dup") left.push(z); });
            if (!left.length && T.done("dups")) {
              G.ok("dups", "Supprimer les copies en trop");
              x.root.trash.push({ node: wedding, from: x.byTag("images") }); x.render(); // l'erreur de Josiane, d'hier
              x.flash("🧹 Les copies sont parties. Mais… regardez la <b>Corbeille</b> : il y a la photo de Josiane !", "good", 6000);
            }
          } else if (t !== "wedding") { x.flash(`On ne supprime que les copies. On remet « ${esc(d.file.name)} ».`, "info"); x.restore(d.file); }
        }
        if (type === "restore") {
          if (d.file.tag === "orig") { if (!G.has("orig")) G.ok("orig", "Garder l'original"); x.flash("↩️ L'original est revenu dans les Téléchargements. Ouf !", "good"); }
          if (d.file.tag === "dup") x.flash("Ce fichier était une copie en trop : vous pouvez le resupprimer.", "info");
          if (d.file.tag === "wedding" && T.done("restore")) G.ok("restore", "Restaurer un fichier depuis la Corbeille");
        }
        if (type === "emptyTrash" && (d.file === wedding || (d.count && !x.inTrash(wedding) && !T.is("restore") && T.is("dups")))) {
          G.ko("keep", "Ne pas vider la Corbeille sans regarder", "Vider la Corbeille supprime pour de bon : on regarde d'abord ce qu'il y a dedans.");
          x.root.trash.push({ node: wedding, from: x.byTag("images") }); x.render();
          x.flash("😬 Dans la vraie vie, la photo serait perdue pour toujours ! Ici, on vous la redonne : restaurez-la.", "bad", 8000);
        }
        if (type === "open" && d.file.tag === "wedding" && T.is("restore") && T.done("check")) G.ok("check", "Vérifier qu'un fichier est bien revenu");
        if (type === "navigate" || type === "delete" || type === "restore") hint();
        end();
      } });
      hint();
    }
  });

  /* =========================================================
     NIVEAU 6 — Retrouver un fichier (trier, rechercher)
     ========================================================= */
  R("fic_find", {
    steps: 2,
    render(ctx) {
      const step = ctx.m.step || 0, L = ctx.local, G = grader(L);
      const { pc, file, folder } = F();
      if (step === 0) {
        const f = frame(ctx, { level: 6, title: "Retrouver le fichier qu'on vient de télécharger", step: 0,
          consigne: "Marie vient de télécharger son <b>attestation de paiement</b> sur le site de la CAF… mais le fichier s'appelle n'importe comment, au milieu de plein d'autres. Retrouvez-la !",
          help: "Le fichier qu'on vient de télécharger est le <b>plus récent</b>. <b>⇅ Trier</b> › <b>Date de modification</b> › <b>Décroissant</b> : il passe en haut de la liste." });
        const noise = [["recette_gateau_yaourt.pdf", 12, D.recette], ["horaires_piscine.pdf", 45], ["photo_mairie.jpg", 9], ["document.pdf", 70, D.mairie], ["document (1).pdf", 31, D.loyer(monthBack(1))], ["IMG_4821.jpg", 5], ["formulaire_inscription.pdf", 90], ["plan_bus_valbourg.pdf", 150], ["menu_cantine.pdf", 20], ["document (2).pdf", 3, D.edf(monthBack(1))]];
        const fs = pc({ telechargements: [...noise.map(([n, a, c]) => file(n, { ago: a, content: c, emoji: "📷", size: n.endsWith("jpg") ? 1700 : 110 })), file("document (3).pdf", { tag: "goal", ago: 0, h: new Date().getHours(), min: Math.max(0, new Date().getMinutes() - 2), content: D.caf })] });
        const T = tasker(f.panel, [
          { k: "dl", label: "Ouvrez le dossier <b>Téléchargements</b>." },
          { k: "sort", label: "Triez par <b>date</b> : le plus récent en premier." },
          { k: "goal", label: "Ouvrez le fichier le plus récent et vérifiez que c'est bien l'<b>attestation de paiement</b>." }
        ]);
        let wrongOpen = 0;
        const x = mountX(ctx, f.host, { fs, start: "bureau", features: { newFolder: false, cut: false, rename: false, del: false, drag: false, trash: false }, onEvent: (type, d) => {
          if (type === "navigate" && d.folder?.tag === "telechargements" && T.done("dl")) { G.ok("dl", "Penser au dossier Téléchargements"); if (ctx.isBeginner()) x.hint(null, "sort"); }
          if (type === "sort" && d.key === "date") {
            if (d.dir === -1) { if (T.done("sort")) { G.ok("sort", "Trier par date pour voir le plus récent"); x.hint(null); x.flash("⇅ Le plus récent est maintenant <b>tout en haut</b>.", "good"); } }
            else x.flash("Trié par date… mais le plus ancien est en haut. Cliquez encore sur « Modifié le », ou choisissez <b>Décroissant</b>.", "info", 6000);
          }
          if (type === "open") {
            if (d.file.tag === "goal") {
              if (!T.is("sort")) { T.done("sort"); G.ko("sort", "Trier par date pour voir le plus récent", "Trier par date (décroissant) met le dernier téléchargement en haut : bien plus rapide !"); }
              if (!T.is("dl")) T.done("dl");
              if (T.done("goal")) { (wrongOpen ? G.ko : G.ok)("goal", "Trouver le dernier fichier téléchargé", "Après le tri par date, c'est le premier de la liste."); T.note(`<div class="alert good">✅ C'est bien l'attestation de paiement ! On passe à la suite…</div>`); later(ctx, () => ctx.go(1), 2200); }
            } else { wrongOpen++; x.flash(`Ce n'est pas l'attestation. ${T.is("sort") ? "Le plus récent est <b>en haut</b> de la liste." : "Astuce : triez par date !"}`, "warn", 5000); }
          }
        } });
        if (ctx.isBeginner()) x.hint(x.byTag("telechargements").id);
        return;
      }
      if (step === 1) {
        const f = frame(ctx, { level: 6, title: "La recherche 🔍", step: 1,
          consigne: "L'an dernier, Marie a scanné son <b>permis de conduire</b>. Elle ne sait plus du tout où elle l'a rangé ! Utilisez la <b>recherche</b>.",
          help: "Placez-vous dans <b>Ce PC</b> (tout en haut), puis tapez un mot dans la case <b>🔍 Rechercher</b>, en haut à droite. Un seul mot suffit : « permis »." });
        const fs = pc({
          documents: [folder("Santé", [file("ordonnance_dr_martin.pdf", { content: D.ordonnance })]), folder("Divers", [folder("Vieux papiers", [file("permis_conduire_scan.jpg", { tag: "goal", ago: 380, size: 900, emoji: "🪪", bg: "#fde7ef", caption: "Permis de conduire (fictif)" }), file("garantie_frigo.pdf", { ago: 700 })])]), file("lettre_mairie.docx", { content: D.mairie })],
          images: [file("jardin_printemps.jpg", { ago: 160, emoji: "🌷", bg: "#e4f6e0" }), folder("Vacances 2023", [file("plage.jpg", { ago: 800, emoji: "🏖️", bg: "#dff3fb" })])],
          telechargements: [file("formulaire_permis_peche.pdf", { ago: 50, tag: "decoy", content: doc("Permis de pêche", ["Formulaire de demande (fictif)"]) })]
        });
        const T = tasker(f.panel, [
          { k: "search", label: "Lancez une <b>recherche</b> avec le mot « permis » (case 🔍 en haut à droite)." },
          { k: "goal", label: "Ouvrez le scan du <b>permis de conduire</b>." },
          { k: "where", label: "Regardez sous son nom : dans quel dossier était-il caché ? (Répondez ci-dessous.)" }
        ]);
        let searched = false;
        const x = mountX(ctx, f.host, { fs, start: "documents", features: { newFolder: false, cut: false, rename: false, del: false, drag: false, trash: false }, onEvent: (type, d) => {
          if (type === "search" && norm(d.q).includes("permis")) {
            searched = true;
            const goal = d.results.find(n => n.tag === "goal");
            if (goal && T.done("search")) { G.ok("search", "Utiliser la recherche"); x.flash(`🔍 ${d.results.length} résultat(s). Sous chaque nom, on voit <b>où</b> il est rangé.`, "good", 6000); }
            else if (!goal) x.flash("Aucun permis de conduire ici… La recherche ne regarde que <b>dans le dossier où vous êtes</b>. Remontez dans <b>Ce PC</b> et recommencez.", "warn", 7000);
          }
          if (type === "open" && d.file.tag === "decoy") x.flash("C'est un permis de <b>pêche</b> 🎣 ! Cherchez le permis de conduire.", "info");
          if (type === "open" && d.file.tag === "goal" && !T.is("goal")) {
            if (!T.is("search")) { T.done("search"); G.ko("search", "Utiliser la recherche", "La loupe 🔍 trouve un fichier en quelques secondes, même rangé très loin."); }
            T.done("goal"); G.ok("goal", "Retrouver un vieux fichier");
            T.note(`<div class="alert good">✅ Trouvé !</div>`);
            quiz(T.slot(), { G, key: "q6where", questions: [
              { q: "Où était rangé le permis de conduire ?", choices: ["Documents › Santé", "Documents › Divers › Vieux papiers", "Téléchargements"], ok: 1, why: "Il était caché bien loin ! La recherche l'a trouvé quand même." },
              { q: "Je cherche « permis » mais je suis dans « Images ». Que se passe-t-il ?", choices: ["Windows cherche partout", "Windows cherche seulement dans Images (et ses sous-dossiers)"], ok: 1, why: "La recherche regarde dans le dossier ouvert. Pour chercher partout : se placer dans <b>Ce PC</b>." },
              { q: "Je ne me souviens plus du nom exact. Que tape-t-on ?", choices: ["Le nom complet, sans faute", "Un seul mot important, par exemple « permis »"], ok: 1, why: "Un seul mot suffit : la recherche trouve tous les fichiers qui le contiennent." }
            ], onDone: () => { T.done("where"); finish(ctx, G, { key: "fic_find", label: "Je sais retrouver un fichier", intro: "Vous savez retrouver le dernier téléchargement (tri par date) et un vieux fichier (recherche 🔍)." }); } });
          }
        } });
        if (ctx.isBeginner()) x.hint(x.root.id, "search");
        return;
      }
      ctx.finalScreen({ theme: null });
    }
  });

  /* =========================================================
     NIVEAU 7 — Joindre un document à une démarche en ligne
     ========================================================= */
  R("fic_send", {
    steps: 2,
    render(ctx) {
      const step = ctx.m.step || 0, L = ctx.local, G = grader(L);
      const { pc, file, folder } = F();
      const now = monthBack(0), prev = monthBack(1), old = monthBack(7);
      L.fs ||= pc({
        documents: [
          folder("Maison", [
            file(`facture_edf_${ym(prev)}.pdf`, { tag: "ok", ago: 25, size: 180, content: D.edf(prev) }),
            file(`facture_edf_${ym(old)}.pdf`, { tag: "old", ago: 215, size: 176, content: D.edf(old) }),
            file("contrat_assurance_habitation.pdf", { tag: "wrong", ago: 400, size: 1200, content: doc("Contrat d'assurance habitation", ["Conditions générales…"]) })
          ]),
          folder("Papiers", [
            file("carte_identite_recto.jpg", { tag: "id", ago: 300, size: 850, emoji: "🪪", bg: "#e3edfb", caption: "Carte d'identité, recto (fictive)" }),
            file("carte_identite_verso.jpg", { tag: "idv", ago: 300, size: 830, emoji: "🪪", bg: "#e8e3fb", caption: "Carte d'identité, verso (fictive)" }),
            file("carte_vitale.jpg", { tag: "vitale", ago: 300, size: 640, emoji: "💳", bg: "#e4f6e0", caption: "Carte Vitale (fictive)" })
          ]),
          folder("Santé", [file("ordonnance_dr_martin.pdf", { content: D.ordonnance })])
        ],
        images: [file("photo_facture_edf.jpg", { tag: "big", ago: 24, size: 6400, emoji: "🧾", bg: "#fff6dc", caption: "Photo de la facture (très lourde)" }), file("jardin_printemps.jpg", { ago: 160, emoji: "🌷", bg: "#e4f6e0", size: 1900 })],
        telechargements: [file("recette_gateau_yaourt.pdf", { ago: 12, content: D.recette })]
      });
      const req = [
        { k: "dom", title: "Justificatif de domicile", rule: "de <b>moins de 3 mois</b> (facture d'électricité, de gaz, quittance de loyer…)", accept: ["pdf", "jpg", "jpeg", "png"], max: 5120,
          check: n => n.tag === "ok" ? null : n.tag === "old" ? `Cette facture date de ${moisLabel(old)} : elle a <b>plus de 3 mois</b>. Prenez la plus récente.` : n.tag === "big" ? null : n.tag === "wrong" ? "Un contrat d'assurance n'est pas un justificatif de domicile. Il faut une <b>facture</b> récente." : "Ce document ne prouve pas votre adresse. Cherchez une <b>facture</b> récente, dans Documents › Maison." },
        { k: "id", title: "Pièce d'identité (recto)", rule: "le <b>recto</b> (le côté avec la photo) de votre carte d'identité", accept: ["pdf", "jpg", "jpeg", "png"], max: 5120,
          check: n => n.tag === "id" ? null : n.tag === "idv" ? "C'est le <b>verso</b> (le dos). On demande le <b>recto</b> : le côté avec la photo." : n.tag === "vitale" ? "La carte Vitale n'est pas une pièce d'identité." : "Ce n'est pas une pièce d'identité. Regardez dans Documents › Papiers." }
      ];
      const r = req[step]; if (!r) return ctx.finalScreen({ theme: null });
      const f = frame(ctx, { level: 7, title: step === 0 ? "Envoyer un justificatif de domicile" : "Envoyer sa pièce d'identité", step, noClient: true,
        consigne: `Le site de la Caisse des aides demande une pièce pour compléter le dossier de Marie : ${r.rule}. Cliquez sur <b>Parcourir…</b> et choisissez le bon fichier sur l'ordinateur.`,
        help: "Dans la fenêtre « Ouvrir », allez dans le bon dossier (colonne de gauche), cliquez une fois sur le fichier, puis sur <b>Ouvrir</b>." });
      const tries = L["tries" + step] ||= { n: 0 };
      const draw = (picked, err) => {
        f.panel.innerHTML = `<div class="fk-site"><div class="fk-site-head" style="background:#0b5d8a">👪 Caisse des aides · Mon dossier <small style="margin-left:auto;font-weight:600">SIMULATION</small></div>
          <div class="fk-site-body"><h3 style="margin:0">📎 Pièce ${step + 1} / 2 : ${r.title}</h3>
            <ul class="fk-rules"><li>Document demandé : ${r.rule}</li><li>Formats acceptés : <b>PDF, JPG, PNG</b></li><li>Taille maximale : <b>5 Mo</b></li></ul>
            <div class="fk-drop ${picked && !err ? "ok" : ""}">${picked ? `<div>${F().typeOf(picked).icon} <b>${esc(picked.name)}</b> · ${F().fmtSize(picked.size)}</div>` : "<div>Aucun fichier choisi</div>"}
              <button type="button" class="secondary" data-browse>📂 Parcourir…</button></div>
            ${err ? `<div class="alert bad" role="alert">⚠️ ${err}</div>` : ""}
            ${picked && !err ? `<button type="button" class="primary" data-send>Envoyer la pièce ✔</button>` : ""}
          </div></div><div class="mk-fb"></div><div class="mk-q-slot"></div>`;
        f.panel.querySelector("[data-browse]").addEventListener("click", browse);
        f.panel.querySelector("[data-send]")?.addEventListener("click", () => send(picked));
      };
      const browse = () => {
        const m = document.createElement("div"); m.className = "fk-modal"; m.innerHTML = `<div></div>`;
        (ctx.box.closest(".lesson-overlay") || document.body).appendChild(m);
        const close = () => { x.destroy(); m.remove(); };
        ctx.onCleanup(() => m.isConnected && close());
        const x = F().explorer(m.firstChild, { fs: L.fs, start: L.lastDir || "documents", picker: { title: "Ouvrir", accept: r.accept, button: "Ouvrir" }, big: ctx.demo,
          features: { newFolder: false, cut: false, rename: false, del: false, drag: false, trash: false, view: true },
          onEvent: (type, d) => {
            if (type === "navigate" && d.folder) L.lastDir = d.folder;
            if (type === "cancel") close();
            if (type === "pick" && !d.refused) { close(); choose(d.file); }
          } });
        if (ctx.isBeginner()) x.hint(x.find(n => n.name === (step === 0 ? "Maison" : "Papiers"))?.id);
      };
      const choose = n => {
        tries.n++;
        let err = r.check(n);
        if (!err && n.size > r.max) err = `Le fichier est <b>trop lourd</b> (${F().fmtSize(n.size)}, maximum 5 Mo). Une photo prise au téléphone est souvent très lourde : choisissez plutôt le <b>PDF</b> de la facture.`;
        if (tries.n === 1) (err ? G.ko : G.ok)("pick_" + r.k, `Choisir la bonne pièce : ${r.title}`, plain(err || ""));
        draw(n, err);
      };
      const send = async n => {
        await ctx.autoMessage?.(`Pièce reçue : ${r.title}`, `Nous avons bien reçu « ${n.name} ». Merci !`);
        if (step === 0) { f.panel.querySelector(".mk-fb").innerHTML = `<div class="alert good">✅ Justificatif envoyé ! Le site demande maintenant une deuxième pièce…</div>`; later(ctx, () => ctx.go(1), 1800); return; }
        f.panel.querySelector(".fk-site-body").innerHTML = `<h3 style="margin:0">✅ Dossier complet</h3><p>Vos deux pièces ont bien été reçues. Un message de confirmation vous attend.</p>`;
        quiz(f.panel.querySelector(".mk-q-slot"), { G, key: "q7", questions: [
          { q: "Je clique sur « Parcourir… » mais je ne trouve pas le fichier que je viens de télécharger. Où regarder ?", choices: ["Dans Téléchargements", "Dans la Corbeille", "Sur le Bureau, forcément"], ok: 0, why: "Ce qu'on télécharge arrive presque toujours dans <b>Téléchargements</b>. Le tri par date aide à le repérer." },
          { q: "Le site refuse mon fichier : « format non accepté ». Pourquoi ?", choices: ["Le site est en panne", "L'extension n'est pas dans la liste acceptée (PDF, JPG…)"], ok: 1, why: "Chaque site dit quels formats il accepte. Regardez l'extension de votre fichier." },
          { q: "« Fichier trop lourd » : qu'est-ce que ça veut dire ?", choices: ["Il prend trop de place : il dépasse la taille maximale", "Il contient trop de pages"], ok: 0, why: "La taille se lit en Ko ou en Mo. Les photos de téléphone sont souvent lourdes : un PDF ou un scan est plus léger." }
        ], onDone: () => finish(ctx, G, { key: "fic_send", label: "Je sais joindre un document à une démarche", intro: "Vous savez trouver le bon fichier sur l'ordinateur et l'envoyer à un site, en vérifiant la date, le format et la taille." }) });
      };
      draw(null, "");
    }
  });

  /* =========================================================
     NIVEAU 8 — Mission réelle : sur le vrai ordinateur
     ========================================================= */
  R("fic_real", {
    steps: 2,
    render(ctx) {
      const step = ctx.m.step || 0, L = ctx.local, G = grader(L);
      if (step === 0) {
        const f = frame(ctx, { level: 8, title: "Mission réelle : sur le vrai ordinateur", step: 0, noClient: true,
          consigne: "Cette fois, on utilise le <b>vrai</b> Explorateur de fichiers de l'ordinateur. Lisez toute la mission, puis faites les étapes. Gardez cette fenêtre ouverte !" });
        f.panel.innerHTML = `<ol class="nv-steps">
            <li>Ouvrez l'Explorateur : touches <kbd>⊞ Windows</kbd> + <kbd>E</kbd> en même temps (ou l'icône 📁 jaune en bas de l'écran).</li>
            <li>Ouvrez <b>Téléchargements</b>, puis <b>triez par date</b> (cliquez sur « Modifié le »). Regardez le fichier le plus récent : quel <b>type</b> est-il ?</li>
            <li>Affichez les <b>extensions</b> : menu <b>Afficher</b> › <b>Afficher</b> › <b>Extensions de noms de fichiers</b>.</li>
            <li>Ouvrez <b>Documents</b> et créez un dossier nommé <b>Atelier numérique</b> (<b>＋ Nouveau</b> › <b>Dossier</b>).</li>
            <li>Revenez ici : cliquez sur la fenêtre du navigateur (en bas de l'écran), ou <kbd>Alt</kbd> + <kbd>Tab</kbd>.</li></ol>
          <div class="alert">🔒 On ne <b>supprime</b> rien et on ne recopie <b>aucun nom de fichier personnel</b> : on observe seulement.<br>🖥️ À la médiathèque, certains dossiers peuvent être bloqués ou vides : c'est normal, notez-le simplement. Sur un Mac, l'Explorateur s'appelle le <b>Finder</b>.</div>
          <div class="final-actions"><button type="button" class="primary" data-go>J'ai fait la mission : je réponds →</button></div>`;
        f.panel.querySelector("[data-go]").addEventListener("click", () => ctx.go(1));
        return;
      }
      if (step === 1) {
        const f = frame(ctx, { level: 8, title: "Mes observations", step: 1, noClient: true, consigne: "Répondez à partir de ce que vous avez vu sur le vrai ordinateur." });
        f.panel.innerHTML = `<div class="nv-real">
          <fieldset class="nv-check"><legend><b>⌨️ Comment avez-vous ouvert l'Explorateur ?</b></legend>${["Avec ⊞ Windows + E", "Avec l'icône 📁 jaune", "Je n'ai pas réussi"].map(v => `<label><input type="radio" name="open" value="${v}"> ${v}</label>`).join("")}</fieldset>
          <fieldset class="nv-check"><legend><b>⬇️ Combien de fichiers environ dans Téléchargements ?</b></legend>${["Aucun", "Moins de 10", "Entre 10 et 50", "Plus de 50"].map(v => `<label><input type="radio" name="count" value="${v}"> ${v}</label>`).join("")}</fieldset>
          <fieldset class="nv-check"><legend><b>🆕 Le fichier le plus récent est…</b></legend>${["Un PDF", "Une image (jpg, png…)", "Un programme (.exe)", "Autre chose", "Je ne sais pas"].map(v => `<label><input type="radio" name="type" value="${v}"> ${v}</label>`).join("")}</fieldset>
          <fieldset class="nv-check"><legend><b>✅ J'ai réussi à…</b> (cochez seulement ce qui est vrai)</legend>
            <label><input type="checkbox" data-c="sort"> trier les Téléchargements par date</label>
            <label><input type="checkbox" data-c="ext"> afficher les extensions</label>
            <label><input type="checkbox" data-c="folder"> créer le dossier « Atelier numérique » dans Documents</label>
            <label><input type="checkbox" data-c="nothing"> ne rien supprimer</label></fieldset>
          <label>💬 Une difficulté, une question ? (facultatif)<input type="text" data-f="note" maxlength="300" autocomplete="off"></label>
          <div class="mk-fb"></div>
          <div class="final-actions"><button type="button" class="secondary" data-back>← Revoir la mission</button><button type="button" class="primary" data-send>📤 Envoyer au formateur</button></div></div>`;
        const $f = s => f.panel.querySelector(s);
        $f("[data-back]").addEventListener("click", () => ctx.go(0));
        $f("[data-send]").addEventListener("click", async () => {
          const val = n => f.panel.querySelector(`[name="${n}"]:checked`)?.value || "";
          const open = val("open"), count = val("count"), type = val("type"), note = $f('[data-f="note"]').value.trim();
          if (!open || !count || !type) { $f(".mk-fb").innerHTML = `<div class="alert bad">Répondez aux 3 questions 🙂</div>`; return; }
          const c = k => $f(`[data-c="${k}"]`).checked;
          $f("[data-send]").disabled = true;
          (open !== "Je n'ai pas réussi" ? G.ok : G.ko)("open", "Ouvrir l'Explorateur", "Touches ⊞ Windows + E, ou l'icône dossier jaune. On réessaie ensemble !");
          (c("sort") ? G.ok : G.ko)("sort", "Trier par date", "Clic sur la colonne « Modifié le ».");
          (c("ext") ? G.ok : G.ko)("ext", "Afficher les extensions", "Menu Afficher › Afficher › Extensions de noms de fichiers.");
          (c("folder") ? G.ok : G.ko)("folder", "Créer un dossier", "＋ Nouveau › Dossier, puis taper le nom et Entrée.");
          (c("nothing") ? G.ok : G.ko)("nothing", "Ne rien supprimer pendant une observation", "Pendant cette mission, on regarde seulement.");
          if (type === "Un programme (.exe)") $f(".mk-fb").innerHTML = `<div class="alert">⚙️ Un programme dans les Téléchargements : demandez au formateur ce que c'est avant de l'ouvrir.</div>`;
          const text = `🗂️ Mission réelle Fichiers\n⌨️ Ouverture : ${open}\n⬇️ Téléchargements : ${count}\n🆕 Plus récent : ${type}\n${c("sort") ? "✅" : "⬜"} tri par date · ${c("ext") ? "✅" : "⬜"} extensions · ${c("folder") ? "✅" : "⬜"} dossier créé · ${c("nothing") ? "✅" : "⬜"} rien supprimé${note ? `\n💬 ${note}` : ""}`;
          try { await ctx.api.sendToTeacher?.("🗂️ Mission réelle : fichiers", text.slice(0, 1900)); }
          catch (e) { $f(".mk-fb").innerHTML = `<div class="alert bad">La réponse n'a pas pu partir : ${esc(e.message)}. Réessayez.</div>`; $f("[data-send]").disabled = false; return; }
          finish(ctx, G, { key: "fic_real", label: "J'ai utilisé le vrai Explorateur de fichiers", intro: `${ctx.demo ? "En projection, la réponse n'est pas envoyée." : "📤 Vos observations sont parties chez le formateur : il vous répondra dans votre <b>messagerie</b>."}<br>Ouverture : <b>${esc(open)}</b> · Téléchargements : <b>${esc(count)}</b> · Fichier le plus récent : <b>${esc(type)}</b>` });
        });
        return;
      }
      ctx.finalScreen({ theme: null });
    }
  });
})(window.AN);

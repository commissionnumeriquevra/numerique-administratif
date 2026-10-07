/* =========================================================
   Chapitre « Fichiers et dossiers » : 3 séances de 30 minutes.
   Cours court projeté, jeux en direct, puis les exercices (8 niveaux,
   le dernier sur le vrai ordinateur).
   ========================================================= */
(function (AN) {
  "use strict";
  const Y = new Date().getFullYear();
  const flip = (front, back, ok) => `<button type="button" class="l-flip ${ok === true ? "is-ok" : ok === false ? "is-ko" : ""}" data-flip><span class="l-front">${front}</span><span class="l-back">${back}</span></button>`;
  const key = ms => `<div class="l-meta">${ms.map(([i, t, s, eq], k) => `<div data-reveal="${k + 1}"><span>${i}</span><b>${t}</b><small>${s}</small>${eq ? `<span class="eq">${eq}</span>` : ""}</div>`).join("")}</div>`;
  const notes = items => `<ol class="mm-notes">${items.map(([g, t, x, ok]) => `<li ${g ? `data-reveal="${g}"` : ""} class="${ok ? "ok" : ""}"><i class="pin ${ok ? "ok" : ""}">${g || "•"}</i><div><b>${t}</b>${x ? `<small>${x}</small>` : ""}</div></li>`).join("")}</ol>`;

  /* ---------- illustration : l'armoire ---------- */
  const SVG_CAB = `<svg viewBox="0 0 420 210" class="l-svg tall" aria-hidden="true">
    <rect x="20" y="20" width="150" height="180" rx="8" fill="#e9dcc9" stroke="#8a6a45" stroke-width="4"/>
    ${[0, 1, 2, 3].map(i => `<rect x="32" y="${32 + i * 42}" width="126" height="34" rx="4" fill="#f6efe4" stroke="#8a6a45" stroke-width="2"/><rect x="82" y="${45 + i * 42}" width="26" height="6" rx="3" fill="#8a6a45"/><text x="95" y="${62 + i * 42}" text-anchor="middle" font-size="10" font-weight="700" fill="#6b5034">${["Bureau", "Téléchargements", "Documents", "Images"][i]}</text>`).join("")}
    <text x="95" y="14" text-anchor="middle" font-size="13" font-weight="800" fill="#7050bf">l'armoire</text>
    <path d="M200 70 h70 l10 12 h60 v90 h-140z" fill="#ffd25e" stroke="#c99a12" stroke-width="3"/>
    <text x="270" y="60" text-anchor="middle" font-size="13" font-weight="800" fill="#7050bf">la chemise</text>
    <rect x="232" y="98" width="46" height="60" rx="3" fill="#fff" stroke="#9aa6b5" stroke-width="2" transform="rotate(-6 255 128)"/>
    <rect x="272" y="96" width="46" height="60" rx="3" fill="#fff" stroke="#9aa6b5" stroke-width="2" transform="rotate(5 295 126)"/>
    ${[0, 1, 2, 3].map(i => `<rect x="${280}" y="${108 + i * 9}" width="${30 - (i % 2) * 8}" height="3" fill="#c4ccd6" transform="rotate(5 295 126)"/>`).join("")}
    <rect x="360" y="90" width="48" height="64" rx="3" fill="#fff" stroke="#9aa6b5" stroke-width="2"/>
    ${[0, 1, 2, 3, 4].map(i => `<rect x="368" y="${102 + i * 9}" width="${32 - (i % 2) * 10}" height="3" fill="#c4ccd6"/>`).join("")}
    <text x="384" y="80" text-anchor="middle" font-size="13" font-weight="800" fill="#7050bf">la feuille</text></svg>`;

  /* ---------- un Explorateur en direct dans la diapositive ---------- */
  function liveFs() {
    const { pc, file, folder } = AN.files;
    return pc({
      bureau: [file("Atelier numérique.lnk", { size: 1 })],
      telechargements: [file("document (3).pdf", { ago: 0, content: "<h3>Attestation de paiement</h3><p>Caisse des aides (simulation)</p>" }), file("recette_gateau_yaourt.pdf", { ago: 12 }), file("photo_mairie.jpg", { ago: 9, emoji: "🏛️", bg: "#e7eefb" })],
      documents: [folder("Santé", [file("ordonnance_dr_martin.pdf", { ago: 6, content: "<h3>Ordonnance</h3><p>Dr Martin</p>" })]), folder("Impôts", [file(`avis_impot_${Y}.pdf`, { ago: 60 })]), file("lettre_mairie.docx", { ago: 20 })],
      images: [file("anniversaire_lucas.jpg", { ago: 3, emoji: "🎂", bg: "#ffe3ec", caption: "Les 8 ans de Lucas" }), file("jardin_printemps.jpg", { ago: 160, emoji: "🌷", bg: "#e4f6e0" })]
    });
  }
  const mountLive = (opts = {}) => el => {
    const host = el.querySelector(".fi-live"); if (!host || !AN.files) return null;
    const x = AN.files.explorer(host, { fs: liveFs(), start: opts.start || "documents", big: true, showExt: !!opts.showExt });
    return () => x.destroy();
  };

  /* =================== SÉANCE 1 =================== */
  const s1 = () => [
    { title: "L'ordinateur, c'est une grande armoire 🗄️", theme: "dense", html: `
      <div class="l-center">${SVG_CAB.replace('class="l-svg tall"', 'class="l-svg" style="max-height:170px"')}</div>
      ${key([["🗄️", "L'armoire", "tout ce que l'ordinateur garde", "= « Ce PC »"], ["📁", "La chemise", "elle range des feuilles… et même d'autres chemises", "= un DOSSIER"], ["📄", "La feuille", "une lettre, une photo, une facture", "= un FICHIER"]])}
      <div class="l-callout" data-reveal="4">🏠 Exactement comme à la maison : on range les <b>feuilles</b> (fichiers) dans des <b>chemises</b> (dossiers), dans les <b>tiroirs</b> de l'armoire.</div>` },

    { title: "L'Explorateur de fichiers 📁", theme: "dense", mount: mountLive(), html: `
      <div class="l-grid-wide" style="display:grid;grid-template-columns:minmax(0,2.2fr) minmax(0,1fr);gap:16px;align-items:start">
        <div class="fi-live"></div>
        <div>${notes([[0, "Pour l'ouvrir", "L'icône 📁 jaune en bas de l'écran, ou les touches <kbd>⊞ Windows</kbd> + <kbd>E</kbd>."], [0, "À gauche : les grands tiroirs", "Un clic pour y aller directement."], [0, "En haut : le chemin", "Il dit où je suis : Ce PC › Documents."], [0, "Double-clic = ouvrir", "Un dossier, ou un fichier."], [0, "← : revenir en arrière", "On ne peut rien casser en se promenant !", true]])}</div>
      </div>` },

    { title: "Les 4 grands tiroirs", html: `
      <div class="l-grid2">
        <div class="l-card big" data-reveal="1"><h3>⬇️ Téléchargements</h3><p>Tout ce qui vient d'<b>Internet</b> arrive ici : documents, pièces jointes enregistrées…</p><small>👉 Le premier endroit où chercher !</small></div>
        <div class="l-card big" data-reveal="2"><h3>📄 Documents</h3><p>Mes <b>papiers</b>, rangés pour les garder : santé, impôts, maison…</p></div>
        <div class="l-card big" data-reveal="3"><h3>🖼️ Images</h3><p>Mes <b>photos</b>.</p></div>
        <div class="l-card big" data-reveal="4"><h3>🖥️ Bureau</h3><p>L'écran d'accueil. Pratique… mais on évite d'y <b>entasser</b> ses fichiers.</p></div>
      </div>` },

    { title: "La famille d'un fichier : l'extension 🏷️", theme: "dense", html: `
      <p class="l-lead">La fin du nom, après le point, dit <b>quel genre</b> de fichier c'est.</p>
      <div class="l-center" data-reveal="1"><span class="fi-ext-big"><span class="b">facture_edf</span><span class="d">.</span><span class="e">pdf</span></span></div>
      <div class="l-grid3" style="margin-top:14px">
        <div class="l-card" data-reveal="2"><h3>📕 .pdf</h3><small>un document à lire, à imprimer</small></div>
        <div class="l-card" data-reveal="2"><h3>🖼️ .jpg · .png</h3><small>une photo, une image</small></div>
        <div class="l-card" data-reveal="2"><h3>📘 .docx</h3><small>un document Word, modifiable</small></div>
        <div class="l-card" data-reveal="3"><h3>🗜️ .zip</h3><small>un « colis » : plusieurs fichiers emballés</small></div>
        <div class="l-card" data-reveal="3"><h3>⚙️ .exe</h3><small>un <b>programme</b> : prudence !</small></div>
        <div class="l-card" data-reveal="3"><h3>👀 Les voir</h3><small>Afficher › Extensions</small></div>
      </div>
      <div class="l-callout" data-reveal="4">🎭 <b>Le déguisement</b> : <code>facture_colis.pdf.exe</code>. Seule la <b>dernière</b> extension compte : c'est un <b>programme</b> déguisé en facture. On ne l'ouvre pas !</div>` }
  ];

  /* =================== SÉANCE 2 =================== */
  const s2 = () => [
    { title: "Un bon nom de fichier 🏷️", html: `
      <div class="l-grid2">
        <div class="fi-names" data-reveal="1"><div class="ko">😕 document (3).pdf</div><div class="ko">😕 scan0001.pdf</div><div class="ko">😕 IMG_4821.jpg</div></div>
        <div class="fi-names" data-reveal="2"><div class="ok">✅ facture_edf_${Y}-09.pdf</div><div class="ok">✅ attestation_mutuelle_${Y}.pdf</div><div class="ok">✅ photo_anniversaire_lucas.jpg</div></div>
      </div>
      <div class="l-meta">${[["❓", "Ce que c'est", "facture, attestation, ordonnance…"], ["👤", "De qui", "EDF, CAF, Dr Martin…"], ["📅", "La date", `${Y}-09 : l'année, puis le mois`]].map(([i, t, s]) => `<div data-reveal="3"><span>${i}</span><b>${t}</b><small>${s}</small></div>`).join("")}</div>
      <div class="l-callout" data-reveal="4">🚫 Interdits dans un nom : <b>\\ / : * ? " &lt; &gt; |</b>. Pour une date, on écrit <b>${Y}-09</b>, pas 09/${Y}.</div>` },

    { title: "Renommer… sans casser 🔧", html: `
      <ol class="l-gestures">
        <li data-reveal="1"><span>👆</span><div><b>Un clic sur le fichier</b><small>Il devient bleu : il est sélectionné.</small></div></li>
        <li data-reveal="2"><span>✏️</span><div><b>« Renommer »</b><small>Dans la barre du haut, ou clic droit › Renommer, ou la touche <kbd>F2</kbd>.</small></div></li>
        <li data-reveal="3"><span>⌨️</span><div><b>Je tape le nouveau nom, puis Entrée</b><small>Et je garde la fin : « .pdf », « .jpg »…</small></div></li>
      </ol>
      <div class="l-flips" data-reveal="4">
        ${flip("<code>facture.pdf</code> → <code>facture_edf.pdf</code>", "✅ Parfait : l'extension est gardée", true)}
        ${flip("<code>facture.pdf</code> → <code>facture</code>", "⚠️ Windows prévient : le fichier risque de ne plus <b>s'ouvrir</b>. On répond « Non ».", false)}
      </div>` },

    { title: "Ranger : créer un dossier, déplacer 🗂️", html: `
      <div class="l-grid2">
        <div class="l-card big" data-reveal="1"><h3>📁 Créer un dossier</h3><p>Dans <b>Documents</b> : <b>＋ Nouveau</b> › <b>Dossier</b>.</p><p>Je tape tout de suite son nom (« Santé »), puis <kbd>Entrée</kbd>.</p></div>
        <div class="l-card big" data-reveal="2"><h3>👉 Y ranger un fichier</h3><p><b>Je le glisse</b> sur le dossier, en gardant le clic appuyé.</p><p>Ou bien : <b>✂️ Couper</b>, j'ouvre le dossier, <b>📋 Coller</b>.</p></div>
      </div>
      <div class="l-callout" data-reveal="3">🗄️ Quelques dossiers simples suffisent : <b>Santé · Impôts · Maison · Banque · Papiers · Photos</b>. Trop de dossiers, et on ne sait plus où chercher !</div>` },

    { title: "La Corbeille, mon filet de sécurité 🗑️", html: `
      <div class="l-grid3">
        <div class="l-card" data-reveal="1"><h3>🗑️ Supprimer</h3><p>Clic sur le fichier, puis <b>Supprimer</b> (ou la touche <kbd>Suppr</kbd>).</p><small>Il part dans la Corbeille.</small></div>
        <div class="l-safe" data-reveal="2"><h3>↩️ Restaurer</h3><p>Une erreur ? J'ouvre la <b>Corbeille</b>, clic sur le fichier, <b>Restaurer</b>.</p><small>Il revient à sa place !</small></div>
        <div class="l-risk" data-reveal="3"><h3>🧹 Vider</h3><p>« Vider la Corbeille » supprime <b>pour de bon</b>.</p><small>Je regarde avant de vider.</small></div>
      </div>
      <div class="l-callout" data-reveal="4">🔑 Sur une <b>clé USB</b>, attention : la suppression est souvent <b>définitive</b>. Windows demande « Voulez-vous vraiment… ? » : je lis avant de dire oui.</div>` }
  ];

  /* =================== SÉANCE 3 =================== */
  const s3 = () => [
    { title: "Où est passé mon téléchargement ? ⬇️", html: `
      <ol class="l-gestures">
        <li data-reveal="1"><span>⬇️</span><div><b>J'ouvre « Téléchargements »</b><small>Tout ce qui vient d'Internet y arrive, même si le nom ne veut rien dire (« document (3).pdf »).</small></div></li>
        <li data-reveal="2"><span>⇅</span><div><b>Je trie par date : « Modifié le »</b><small>Un clic sur le titre de la colonne : le plus récent passe en haut.</small></div></li>
        <li data-reveal="3"><span>👀</span><div><b>J'ouvre le premier pour vérifier</b><small>Puis je le renomme et je le range.</small></div></li>
      </ol>
      <div class="l-callout" data-reveal="4">💡 Dans le navigateur, la petite flèche <b>⬇</b> en haut à droite montre aussi les derniers téléchargements.</div>` },

    { title: "La loupe 🔍 : retrouver un vieux fichier", mount: mountLive({ start: "pc" }), theme: "dense", html: `
      <div style="display:grid;grid-template-columns:minmax(0,2.2fr) minmax(0,1fr);gap:16px;align-items:start">
        <div class="fi-live"></div>
        <div>${notes([[0, "Je me place dans « Ce PC »", "Tout en haut : la recherche regarde dans le dossier ouvert… et tout ce qu'il contient."], [0, "Je tape UN mot", "« ordonnance », « impot », « permis »… Pas besoin du nom exact."], [0, "Sous chaque résultat : où il est rangé", "Double-clic pour l'ouvrir.", true]])}</div>
      </div>` },

    { title: "Joindre un document à une démarche 📎", html: `
      <div class="l-grid2">
        <ol class="l-gestures">
          <li data-reveal="1"><span>📂</span><div><b>« Parcourir… »</b><small>ou « Choisir un fichier », « Ajouter une pièce »</small></div></li>
          <li data-reveal="2"><span>🗄️</span><div><b>Je vais dans le bon dossier</b><small>Téléchargements, Documents › Maison…</small></div></li>
          <li data-reveal="3"><span>👆</span><div><b>Un clic sur le fichier, puis « Ouvrir »</b><small>Son nom apparaît sur le site.</small></div></li>
        </ol>
        <div class="l-card big" data-reveal="4"><h3>✅ Avant d'envoyer, je vérifie</h3><p>📄 le <b>bon document</b> (et le recto !)</p><p>📅 la <b>date</b> : « moins de 3 mois » ?</p><p>🏷️ le <b>format</b> : PDF, JPG ?</p><p>⚖️ la <b>taille</b> : 5 Mo maximum ? (1 Mo = 1 000 Ko)</p></div>
      </div>` },

    { title: "Pas de panique 🫶", html: `
      <div class="l-grid2">
        <div class="l-safe" data-reveal="1"><h3>🚶 Se promener ne casse rien</h3><p>Ouvrir des dossiers, regarder, trier : aucun risque. La flèche ← ramène en arrière.</p></div>
        <div class="l-safe" data-reveal="2"><h3>🗑️ Une erreur se rattrape</h3><p>Fichier supprimé ? La Corbeille. Mal renommé ? On renomme encore.</p></div>
      </div>
      <div class="l-never" data-reveal="3"><h3>⚠️ La seule vraie prudence</h3><p>Un <b>programme</b> (.exe) qu'on n'attendait pas, ou une fenêtre « Voulez-vous autoriser cette application… ? » : je réponds <b>Non</b>, et je demande.</p></div>` }
  ];

  /* =================== ASSEMBLAGE =================== */
  const cover = (n, title, goals) => ({ theme: "cover", title: `<small class="l-seance">Séance ${n} / 3</small>${title}`, html: `<div class="l-goals">${goals.map(g => `<div data-reveal>${g}</div>`).join("")}</div>` });
  const game = (id, title) => ({ title: `🎮 ${title}`, game: id });
  const end = (levels, demoType, extra = "") => ({ theme: "cover", title: "À vous ! 💻", html: `
      <p class="l-lead">Dans <b>« Mes missions »</b>, faites ${levels}. Chacun à son rythme : je passe vous voir.</p>${extra}
      <div class="l-actions">
        ${demoType ? `<button type="button" class="l-btn" data-lesson-act="demo" data-type="${demoType}">👥 Faire le premier ensemble</button>` : ""}
        <button type="button" class="l-btn alt" data-lesson-act="assign">🚀 Donner le chapitre au groupe</button>
      </div>` });
  const pick = (arr, start) => { const s = arr.find(x => x.title && x.title.startsWith(start)); if (!s) console.warn("Diapositive introuvable :", start); return s; };

  const lessons = () => {
    const A = s1(), B = s2(), C = s3();
    return [
      { id: "s1", title: "Séance 1 : mon armoire numérique", icon: "🗄️", badge: "Séance 1 · Mon armoire numérique", slides: () => [
        cover(1, "Mon armoire numérique", ["🗄️ Fichier ou dossier ?", "📁 L'Explorateur de fichiers", "⬇️ Les grands tiroirs", "🏷️ La famille d'un fichier"]),
        pick(A, "L'ordinateur"), game("fic_ou", "Fichier ou dossier ?"),
        pick(A, "L'Explorateur"), pick(A, "Les 4 grands"), game("fic_tiroir", "Dans quel grand dossier ?"),
        pick(A, "La famille"), game("fic_famille", "Quelle famille ?"),
        end("les <b>niveaux 1 et 2</b> : se repérer dans l'Explorateur, reconnaître les extensions", "fic_explore")] },
      { id: "s2", title: "Séance 2 : nommer et ranger", icon: "🗂️", badge: "Séance 2 · Nommer et ranger", slides: () => [
        cover(2, "Nommer et ranger", ["🏷️ Un bon nom de fichier", "✏️ Renommer sans casser", "📁 Créer un dossier, déplacer", "🗑️ La Corbeille"]),
        pick(B, "Un bon nom"), game("fic_nom", "Bon nom, ou à renommer ?"),
        pick(B, "Renommer"), pick(B, "Ranger"), game("fic_ranger", "Ranger, pas à pas"),
        pick(B, "La Corbeille"), game("fic_corbeille", "La Corbeille : vrai ou faux ?"),
        end("les <b>niveaux 3, 4 et 5</b> : bien nommer, ranger, la Corbeille", "fic_folders")] },
      { id: "s3", title: "Séance 3 : retrouver et envoyer", icon: "🔍", badge: "Séance 3 · Retrouver et envoyer", slides: () => [
        cover(3, "Retrouver et envoyer", ["⬇️ Le dernier téléchargement", "🔍 La recherche", "📎 Joindre à une démarche", "🫶 Pas de panique"]),
        pick(C, "Où est passé"), pick(C, "La loupe"), game("fic_piege", "Les pièges du dossier Téléchargements"),
        pick(C, "Joindre"), game("fic_envoi", "Quel fichier j'envoie ?"),
        pick(C, "Pas de panique"), game("fic_que_faire", "Que faites-vous ?"),
        end("les <b>niveaux 6, 7 et 8</b> : retrouver, joindre un document… puis la <b>mission réelle</b> sur le vrai ordinateur", "fic_send",
          `<div class="l-callout">💻 Le niveau 8 se fait dans le <b>vrai Explorateur</b> de l'ordinateur : on observe, on crée un dossier « Atelier numérique », et <b>on ne supprime rien</b>.</div>`)] }
    ];
  };

  AN.chapters.register({
    id: "fichiers", title: "Fichiers et dossiers", icon: "🗂️", color: "#c27c0e",
    summary: "3 séances de 30 minutes : un cours court, des jeux en direct, puis les exercices dans un Explorateur simulé… jusqu'à une mission sur le vrai ordinateur.",
    duration: "3 séances", parcours: "p_fichiers", demo: "fic_explore",
    demos: [{ type: "fic_explore", label: "Niveau 1 ensemble" }, { type: "fic_folders", label: "Ranger ensemble (niveau 4)" }, { type: "fic_send", label: "Joindre un document (niveau 7)" }],
    get lessons() { return lessons(); }
  });

  /* Rangé juste après « Comptes », avant les chapitres à venir. */
  (function () {
    const all = AN.chapters.all, i = all.findIndex(c => c.id === "fichiers"), j = all.findIndex(c => c.soon);
    if (j >= 0 && i > j) all.splice(j, 0, all.splice(i, 1)[0]);
  })();
})(window.AN);

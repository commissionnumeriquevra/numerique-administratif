/* =========================================================
   Chapitre « Wi-Fi et réseaux » : 3 séances de 30 minutes.
   Cours court projeté, jeux en direct, puis les exercices
   (8 niveaux, le dernier sur le vrai téléphone).
   ========================================================= */
(function (AN) {
  "use strict";
  const key = ms => `<div class="l-meta">${ms.map(([i, t, s, eq, g], k) => `<div data-reveal="${g || k + 1}"><span>${i}</span><b>${t}</b><small>${s}</small>${eq ? `<span class="eq">${eq}</span>` : ""}</div>`).join("")}</div>`;
  const flip = (front, back, ok) => `<button type="button" class="l-flip ${ok === true ? "is-ok" : ok === false ? "is-ko" : ""}" data-flip><span class="l-front">${front}</span><span class="l-back">${back}</span></button>`;
  const S = () => AN.net.signal, G = () => AN.net.globe;
  const ico = (html, t, s, g) => `<div class="l-card" data-reveal="${g}" style="text-align:center"><div style="font-size:2.2em;line-height:1.2;color:#1f2330">${html}</div><h3 style="margin:.2em 0">${t}</h3><small>${s}</small></div>`;

  /* ---------- illustration : la maison, la box, l'antenne ---------- */
  const SVG_HOUSE = `<svg viewBox="0 -12 460 228" class="l-svg tall" aria-hidden="true">
    <path d="M20 190 V95 L120 30 L220 95 V190 Z" fill="#fff" stroke="#7050bf" stroke-width="4" stroke-linejoin="round"/>
    <rect x="58" y="140" width="56" height="26" rx="6" fill="#e9e9e9" stroke="#555" stroke-width="2"/><circle cx="72" cy="153" r="3" fill="#22c55e"/><circle cx="84" cy="153" r="3" fill="#22c55e"/><circle cx="96" cy="153" r="3" fill="#22c55e"/>
    <text x="86" y="182" text-anchor="middle" font-size="12" font-weight="800" fill="#555">la box</text>
    ${[18, 32, 46].map((r, i) => `<path d="M${86 - r} ${136 - r * 0.2} a${r} ${r} 0 0 1 ${2 * r} 0" fill="none" stroke="#0067c0" stroke-width="3" opacity="${1 - i * 0.25}"/>`).join("")}
    <text x="150" y="112" font-size="12" font-weight="800" fill="#0067c0">Wi-Fi</text>
    <path d="M10 190 H230" stroke="#8a6a45" stroke-width="3"/><path d="M58 166 V196 H10" stroke="#555" stroke-width="2" fill="none" stroke-dasharray="4 3"/>
    <text x="16" y="208" font-size="10" fill="#555">ligne (fibre, ADSL)</text>
    <path d="M360 190 L380 60 L400 190 M367 140 H393 M372 105 H388" stroke="#555" stroke-width="4" fill="none"/>
    ${[16, 30, 44].map((r, i) => `<path d="M${380 - r} ${50 - r * 0.2} a${r} ${r} 0 0 1 ${2 * r} 0" fill="none" stroke="#c27c0e" stroke-width="3" opacity="${1 - i * 0.25}"/>`).join("")}
    <text x="380" y="20" text-anchor="middle" font-size="12" font-weight="800" fill="#c27c0e">antenne 4G / 5G</text>
    <rect x="290" y="120" width="34" height="60" rx="7" fill="#1f2330"/><rect x="294" y="128" width="26" height="42" rx="3" fill="#bde0fe"/>
    <text x="307" y="198" text-anchor="middle" font-size="11" font-weight="700" fill="#555">téléphone</text></svg>`;

  /* ---------- diapositive « en direct » : la box et l'ordinateur ---------- */
  const mountConnect = el => {
    const a = el.querySelector(".wi-box"), b = el.querySelector(".wi-pc"); if (!a || !b || !AN.net) return null;
    const bx = AN.net.box(a, { ssid: "Livebox-7A3F", key: "Kp7mVx2e" });
    const pc = AN.net.pc(b, { big: true, nets: [AN.net.net("Livebox-7A3F", { key: "Kp7mVx2e", bars: 4 }), AN.net.net("Livebox-7A3E", { key: "zz", bars: 2 }), AN.net.net("SFR_9C21", { key: "zz", bars: 1 })] });
    return () => { bx.destroy(); pc.destroy(); };
  };

  /* =================== SÉANCE 1 =================== */
  const s1 = () => [
    { title: "Comment Internet arrive jusqu'à moi ?", theme: "dense", html: `
      <div class="l-center">${SVG_HOUSE}</div>
      ${key([["📦", "La box", "Elle reçoit Internet par la ligne (fibre ou ADSL)", "à la maison"], ["📶", "Le Wi-Fi", "Les ondes, sans fil, autour de la box (quelques pièces)", "gratuit, illimité"], ["🗼", "La 4G / 5G", "L'antenne du quartier, partout dehors", "le FORFAIT du téléphone"]])}` },

    { title: "Lire les icônes 👀", theme: "dense", html: `
      <div class="l-grid3">
        ${ico(S()(4), "Wi-Fi : tout va bien", "Plus il y a de traits, meilleur est le signal.", 1)}
        ${ico(S()(4, { warn: true }), "Wi-Fi sans Internet", "Relié à la box… mais la box ne marche pas.", 2)}
        ${ico(G()(true), "Pas connecté", "Relié à rien : on ouvre le menu Wi-Fi.", 2)}
        ${ico("✈", "Mode avion", "Tout est coupé : Wi-Fi, 4G, appels.", 3)}
        ${ico(`${AN.net.cellBars(3)} <b style="font-size:.6em">4G</b>`, "Données mobiles", "Le téléphone utilise le forfait.", 3)}
        ${ico(S()(1), "Signal faible", "Je me rapproche de la box.", 3)}
      </div>
      <p class="l-note" data-reveal="4">💻 Sur l'ordinateur : <b>en bas à droite</b>, près de l'heure. 📱 Sur le téléphone : <b>tout en haut</b>.</p>` },

    { title: "Connecter un appareil à la box 📡", theme: "dense", mount: mountConnect, html: `
      <div style="display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1.7fr);gap:16px;align-items:start">
        <div><div class="wi-box"></div>
          <ol class="mm-notes" style="margin-top:10px"><li><i class="pin">1</i><div><b>Je lis l'étiquette de la box</b><small>Le nom du réseau et la clé (le mot de passe du Wi-Fi).</small></div></li>
          <li><i class="pin">2</i><div><b>Menu Wi-Fi › le nom EXACT de la box</b><small>Les autres sont ceux des voisins.</small></div></li>
          <li class="ok"><i class="pin ok">3</i><div><b>Je tape la clé, majuscules comprises</b><small>L'œil 👁 montre ce que je tape. Chez moi : « Se connecter automatiquement ».</small></div></li></ol></div>
        <div class="wi-pc"></div></div>` },

    { title: "Wi-Fi ou 4G ? Mon forfait 📱", html: `
      <div class="l-grid2">
        <div class="l-safe" data-reveal="1"><h3>🏠 À la maison : le Wi-Fi</h3><p>Le téléphone se connecte <b>tout seul</b> à la box.</p><p>Le forfait n'est <b>pas</b> utilisé : vidéos, visio… sans compter.</p></div>
        <div class="l-card big" data-reveal="2"><h3>🚶 Dehors : la 4G / 5G</h3><p>Le téléphone passe <b>tout seul</b> sur l'antenne.</p><p>Il consomme les <b>Go</b> du forfait (ex. : 5 Go par mois).</p></div>
      </div>
      <div class="l-flips" data-reveal="3">
        ${flip("💬 Un SMS, un e-mail", "Presque rien", true)}${flip("🌐 Une page Internet", "Un tout petit peu", true)}${flip("🎬 Une heure de vidéo", "1 à 3 Go : beaucoup !", false)}
      </div>` }
  ];

  /* =================== SÉANCE 2 =================== */
  const s2 = () => [
    { title: "Le Wi-Fi public ☕", html: `
      <div class="l-grid2">
        <div class="l-safe" data-reveal="1"><h3>✅ Pratique</h3><p>Médiathèque, gare, hôpital, café… Gratuit, et ça économise le forfait.</p><p>On choisit le nom indiqué sur l'<b>affiche</b>, puis on <b>accepte les conditions</b>.</p></div>
        <div class="l-risk" data-reveal="2"><h3>⚠️ Prudence</h3><p>N'importe qui peut créer un Wi-Fi au nom attirant :</p><p><code>Mediatheque-Valbourg</code> ✅<br><code>Mediatheque-Valbourg-Gratuit-HD</code> 🚩</p></div>
      </div>
      <div class="l-never" data-reveal="3"><h3>🚫 Un Wi-Fi ne demande jamais…</h3><p>…de mot de passe de messagerie, ni de carte bancaire. Et pour la banque, je préfère la <b>4G</b> ou la maison.</p></div>` },

    { title: "« Pas d'Internet » : la méthode en 3 étapes 🛠️", theme: "dense", html: `
      <ol class="l-gestures">
        <li data-reveal="1"><span>👀</span><div><b>1. Je regarde l'icône</b><small>✈ → je coupe le mode avion · globe barré → j'ouvre le menu Wi-Fi · point d'exclamation → c'est la box.</small></div></li>
        <li data-reveal="2"><span>📶</span><div><b>2. Je vérifie le menu Wi-Fi</b><small>Le Wi-Fi est-il activé ? Suis-je connecté(e) au bon réseau (celui de MA box) ?</small></div></li>
        <li data-reveal="3"><span>📦</span><div><b>3. Je regarde les voyants de la box</b><small>Rouge ou clignotant : je la débranche, j'attends 10 secondes, je la rebranche… et j'attends 2 à 5 minutes.</small></div></li>
      </ol>
      <div class="l-callout" data-reveal="4">📞 Toujours rouge ? J'appelle le numéro de mon <b>opérateur</b> (sur la facture). Jamais un numéro affiché dans une fenêtre surprise !</div>` }
  ];

  /* =================== SÉANCE 3 =================== */
  const s3 = () => [
    { title: "Box et forfait : les arnaques 🚩", html: `
      <div class="l-grid2">
        <div class="l-alert-mini" data-reveal="1"><b>💬 SERVICE-BOX</b><p>« Votre box sera suspendue sous 24 h suite à un impayé. Régularisez : box-regularisation.com »</p></div>
        <div class="l-alert-mini" data-reveal="2"><b>📞 « Technicien de votre opérateur »</b><p>« Votre box est piratée ! Installez l'application que je vous dicte, je prends la main. »</p></div>
      </div>
      <ul class="l-list" data-reveal="3"><li>⏰ L'<b>urgence</b> (« sous 24 h ») et un <b>lien</b> à cliquer : arnaque.</li><li>🖥️ Personne ne prend la main sur votre ordinateur après un appel imprévu : je <b>raccroche</b>.</li></ul>
      <div class="l-callout" data-reveal="4">📲 Je signale le SMS en le transférant au <b>33700</b> (gratuit), puis je le supprime. Un doute ? J'appelle le numéro de ma facture.</div>` },

    { title: "Le partage de connexion 🔗", html: `
      <div class="l-grid2">
        <div class="l-card big" data-reveal="1"><h3>🆘 La box est en panne ?</h3><p>Le téléphone peut devenir une <b>box de secours</b> pour l'ordinateur.</p><p>Réglages › <b>Partage de connexion</b> : il crée un Wi-Fi, avec un nom et un mot de passe.</p></div>
        <div class="l-card big" data-reveal="2"><h3>💻 Sur l'ordinateur</h3><p>Menu Wi-Fi › le nom du téléphone › son mot de passe. Comme pour une box !</p></div>
      </div>
      <div class="l-callout" data-reveal="3">📊 Ça consomme le <b>forfait</b> : on s'en sert pour un formulaire, un e-mail… et on <b>coupe le partage</b> à la fin.</div>` },

    { title: "Les bons réflexes 🫶", html: `
      <div class="l-grid3">
        <div class="l-safe" data-reveal="1"><h3>🔑 La clé Wi-Fi</h3><p>Je peux la donner à mes proches, chez moi. Elle est sur l'étiquette.</p></div>
        <div class="l-safe" data-reveal="2"><h3>📊 Mon forfait</h3><p>Je regarde ma consommation dans les Réglages. Les vidéos, en Wi-Fi !</p></div>
        <div class="l-safe" data-reveal="3"><h3>✈ Le mode avion</h3><p>Internet ne marche plus ? Je vérifie d'abord qu'il n'est pas activé.</p></div>
      </div>` }
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
      { id: "s1", title: "Séance 1 : Internet arrive chez moi", icon: "📡", badge: "Séance 1 · Internet chez moi", slides: () => [
        cover(1, "Internet arrive chez moi", ["📦 La box, le Wi-Fi, la 4G", "👀 Lire les icônes", "📡 Se connecter à la box", "📱 Wi-Fi ou forfait ?"]),
        pick(A, "Comment Internet"), game("wifi_ou4g", "Wi-Fi ou 4G ?"),
        pick(A, "Lire les icônes"), game("wifi_icones", "Que veut dire cette icône ?"),
        pick(A, "Connecter un appareil"), game("wifi_cle", "Tape la clé du Wi-Fi"),
        pick(A, "Wi-Fi ou 4G ? Mon"),
        end("les <b>niveaux 1, 2 et 3</b> : les icônes, l'ordinateur et la box, le téléphone", "wifi_box")] },
      { id: "s2", title: "Séance 2 : dehors… et en panne", icon: "🛠️", badge: "Séance 2 · Dehors et en panne", slides: () => [
        cover(2, "Dehors… et en panne", ["☕ Le Wi-Fi public", "🎭 Les faux réseaux", "🛠️ « Pas d'Internet » : la méthode", "📦 Redémarrer la box"]),
        pick(B, "Le Wi-Fi public"), game("wifi_public_ok", "Sur un Wi-Fi public, je peux… ?"),
        pick(B, "« Pas d'Internet »"), game("wifi_diag", "Quelle est la panne ?"), game("wifi_redemarrer", "Redémarrer la box, dans l'ordre"),
        end("les <b>niveaux 4 et 5</b> : le Wi-Fi public, et le dépannage", "wifi_panne")] },
      { id: "s3", title: "Séance 3 : arnaques et solutions de secours", icon: "🔗", badge: "Séance 3 · Arnaques et secours", slides: () => [
        cover(3, "Arnaques et solutions de secours", ["🚩 Les arnaques box et forfait", "🔗 Le partage de connexion", "🫶 Les bons réflexes"]),
        pick(C, "Box et forfait"), game("wifi_buzz", "Arnaque ou pas ? Buzzez !"),
        pick(C, "Le partage"), game("wifi_conso", "Du moins gourmand au plus gourmand"),
        pick(C, "Les bons réflexes"), game("wifi_que_faire", "Que faites-vous ?"),
        end("les <b>niveaux 6, 7 et 8</b> : les arnaques, le partage de connexion… puis la <b>mission réelle</b> sur votre téléphone", "wifi_share",
          `<div class="l-callout">📱 Le niveau 8 se fait sur votre <b>vrai téléphone</b> : on observe les icônes, le mode avion, la consommation… <b>sans rien changer</b>.</div>`)] }
    ];
  };

  AN.chapters.register({
    id: "wifi", title: "Wi-Fi et réseaux", icon: "📶", color: "#0b72b9",
    summary: "3 séances de 30 minutes : la box, le Wi-Fi, la 4G et le forfait, le Wi-Fi public, les pannes et les arnaques… jusqu'à une mission sur son vrai téléphone.",
    duration: "3 séances", parcours: "p_wifi", demo: "wifi_box",
    demos: [{ type: "wifi_box", label: "Connecter la box (niveau 2)" }, { type: "wifi_panne", label: "Dépanner ensemble (niveau 5)" }, { type: "wifi_share", label: "Partage de connexion (niveau 7)" }],
    get lessons() { return lessons(); }
  });

  /* Rangé juste après « Fichiers », avant les chapitres à venir. */
  (function () {
    const all = AN.chapters.all, i = all.findIndex(c => c.id === "wifi"), j = all.findIndex(c => c.soon);
    if (j >= 0 && i > j) all.splice(j, 0, all.splice(i, 1)[0]);
  })();
})(window.AN);

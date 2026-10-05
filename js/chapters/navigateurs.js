/* =========================================================
   Chapitre « Navigateurs et recherche » : 3 séances de 30 minutes.
   Chaque séance : un cours court projeté, des jeux en direct sur les PC,
   puis les exercices (7 niveaux, le dernier sur le vrai Internet).
   ========================================================= */
(function (AN) {
  "use strict";
  const N = () => AN.navKit, BR = () => AN.browser;
  const pin = (g, ok) => `<i class="pin ${ok ? "ok" : ""}" data-reveal="${g}">${g}</i>`;
  const hl = (g, html, ok) => `<span class="hl ${ok ? "ok" : ""}" data-reveal="${g}">${html}</span>`;
  const notes = items => `<ol class="mm-notes">${items.map(([g, t, x, ok]) => `<li data-reveal="${g}" class="${ok ? "ok" : ""}"><i class="pin ${ok ? "ok" : ""}">${g}</i><div><b>${t}</b>${x ? `<small>${x}</small>` : ""}</div></li>`).join("")}</ol>`;
  const url = parts => `<div class="l-url">${parts.map(([t, cls, lab]) => `<span class="u ${cls}"><b>${t}</b>${lab ? `<small>${lab}</small>` : ""}</span>`).join("")}</div>`;
  const flip = (front, back, ok) => `<button type="button" class="l-flip ${ok === true ? "is-ok" : ok === false ? "is-ko" : ""}" data-flip><span class="l-front">${front}</span><span class="l-back">${back}</span></button>`;
  const page = (u, extra = {}) => { const p = N().WORLD[BR().normalize(u)]; return typeof p.html === "function" ? p.html({ url: u, q: "", reloads: 0, flags: {}, ...extra }) : p.html; };

  /** Un navigateur dessiné (rien n'est cliquable). P = repères numérotés : { tabs, nav, reload, addr, star, favs, page } */
  function bmock({ tabs = [["🔎", "Cherchetout"]], url: u, secure = true, body = "", status, favs, P = {}, addrHTML, lockHTML }) {
    return `<div class="bk bk-static" aria-hidden="true">
      <div class="bk-tabs">${tabs.map(([i, t], k) => `<div class="bk-tab ${k === 0 ? "on" : ""}"><span class="bk-tab-main"><span>${i}</span><span class="bk-tab-t">${t}</span></span><span class="bk-tab-x">✕</span></div>`).join("")}<span class="bk-tab-new">＋</span>${P.tabs || ""}</div>
      <div class="bk-bar"><span class="bk-nav">←</span><span class="bk-nav">→</span>${P.nav || ""}<span class="bk-nav">⟳</span>${P.reload || ""}<span class="bk-nav">🏠</span>
        <div class="bk-addr ${secure ? "" : "insecure"}"><span class="bk-lock">${lockHTML || (secure ? "🔒" : "⚠️ <span>Non sécurisé</span>")}</span><span class="bk-addr-view">${addrHTML || BR().prettyUrl(u, secure)}</span>${P.addr || ""}<span class="bk-star">☆</span>${P.star || ""}</div></div>
      ${favs ? `<div class="bk-favs">${favs.map(f => `<span>${f}</span>`).join("")}${P.favs || ""}</div>` : ""}
      <div class="bk-view">${P.page ? `<div style="position:absolute;right:10px;top:8px;z-index:2">${P.page}</div>` : ""}${body}</div>
      ${status !== undefined ? `<div class="bk-status">${status || "&nbsp;"}</div>` : ""}</div>`;
  }
  /** Un résultat de recherche dessiné ; d = décorations { spon, site, title } (repères, surlignages). */
  function rcard(u, d = {}) {
    const e = N().INDEX.find(x => x.url === u);
    return `<div class="ct-res ${e.sponsored ? "ad" : ""}">${e.sponsored ? `<div class="ct-spon">${d.spon || "Sponsorisé"}</div>` : ""}
      <div class="ct-site"><span class="ct-fav">${e.icon || "🌐"}</span><span><b>${d.site || e.site || BR().realName(e.url)}</b><small>https://${BR().normalize(e.url).replace(/\//g, " › ")}</small></span></div>
      <span class="ct-title">${d.title || e.title}</span><p>${e.desc}</p></div>`;
  }
  const resultsMock = (q, cards, P = {}) => `<div class="ct-top">${BR().LOGO}<div class="ct-form"><input value="${q}" readonly tabindex="-1">${P.q || ""}</div></div><div class="ct-results">${cards.join("")}</div>`;

  /* ---------- illustrations ---------- */
  const SVG_LIB = `<svg viewBox="0 0 360 170" class="l-svg tall" aria-hidden="true">
      <rect x="10" y="30" width="70" height="130" rx="6" fill="#b07a4a" stroke="#7a5230" stroke-width="4"/><circle cx="66" cy="98" r="5" fill="#ffd76a"/>
      <text x="45" y="22" text-anchor="middle" font-size="13" font-weight="700" fill="#7050bf">la porte</text>
      <circle cx="170" cy="70" r="20" fill="#7050bf"/><rect x="142" y="94" width="56" height="62" rx="14" fill="#5b3fa6"/>
      <text x="170" y="22" text-anchor="middle" font-size="13" font-weight="700" fill="#7050bf">le bibliothécaire</text>
      <g>${[0, 1, 2, 3, 4].map(i => `<rect x="${250 + i * 20}" y="${60 - (i % 2) * 8}" width="16" height="${80 + (i % 2) * 8}" rx="3" fill="${["#d95f56", "#3979b7", "#2f9d68", "#e0a100", "#7050bf"][i]}"/>`).join("")}</g>
      <rect x="244" y="140" width="106" height="8" fill="#7a5230"/>
      <text x="297" y="22" text-anchor="middle" font-size="13" font-weight="700" fill="#7050bf">les livres</text></svg>`;

  /* =========================================================
     SÉANCE 1 — Le navigateur, ma porte d'entrée sur Internet
     ========================================================= */
  const s1Slides = () => [
    { title: "Internet, c'est une immense bibliothèque 📚", html: `
      <div class="l-meta">
        <div data-reveal="1"><span>🚪</span><b>La porte d'entrée</b><small>pour entrer dans la bibliothèque</small><span class="eq">= le NAVIGATEUR</span></div>
        <div data-reveal="2"><span>🙋</span><b>Le bibliothécaire</b><small>à qui on demande « je cherche… »</small><span class="eq">= le MOTEUR DE RECHERCHE</span></div>
        <div data-reveal="3"><span>📕</span><b>Les livres</b><small>ce qu'on vient lire</small><span class="eq">= les SITES</span></div>
      </div>
      <div class="l-callout" data-reveal="4">🧭 J'ouvre la <b>porte</b> (le navigateur), je demande au <b>bibliothécaire</b> (le moteur), il m'indique le bon <b>livre</b> (le site).</div>` },

    { title: "Qui est qui ?", theme: "dense", html: `
      <div class="l-grid3">
        <div class="l-card big" data-reveal="1"><h3>🚪 Les navigateurs</h3><p>Le programme qu'on ouvre pour aller sur Internet.</p><p><b>Chrome · Edge · Firefox · Safari</b></p><small>Sur l'ordinateur : une icône ronde sur le bureau ou en bas de l'écran.</small></div>
        <div class="l-card big" data-reveal="2"><h3>🙋 Les moteurs de recherche</h3><p>Un site qui cherche les autres sites pour moi.</p><p><b>Google · Bing · Qwant · Ecosia</b></p><small>Ici, à l'atelier, on s'entraîne avec « Cherchetout ».</small></div>
        <div class="l-card big" data-reveal="3"><h3>📕 Les sites</h3><p>Les pages qu'on vient lire, avec leur adresse.</p><p><b>service-public.fr · ameli.fr · le site de ma mairie</b></p></div>
      </div>
      <div class="l-callout" data-reveal="4">😮 Le piège classique : <b>Google n'est pas Internet</b>, et <b>Chrome n'est pas Google</b> ! Chrome est la porte, Google est le bibliothécaire. On peut changer l'un sans l'autre.</div>` },

    { title: "Les boutons du navigateur", theme: "dense", html: `
      ${bmock({ tabs: [["📚", "Médiathèque de Valbourg"], ["🏛️", "Mairie de Valbourg"]], url: N().MED, favs: ["🏛️ Mairie", "🌦️ Météo"], body: `<div class="ws" style="--c:#7050bf"><header class="ws-head"><span class="ws-logo">📚 Médiathèque de Valbourg</span><nav class="ws-nav"><a class="on">Accueil</a><a>Horaires</a><a>Agenda</a><a>Liens utiles</a></nav></header><main class="ws-main"><h2>Bienvenue à la médiathèque !</h2><p>Livres, films, musique, ateliers numériques : tout est gratuit.</p></main></div>`,
        P: { tabs: pin(1), nav: pin(2), reload: pin(3), addr: pin(4), star: pin(5), favs: pin(6) } })}
      ${notes([[1, "Les onglets", "Plusieurs sites ouverts, comme des intercalaires. ＋ pour en ouvrir un, ✕ pour en fermer un."], [2, "← et →", "Page précédente, page suivante."], [3, "⟳ Actualiser", "Recharger la page : quand elle bloque ou n'est pas à jour."], [4, "La barre d'adresse", "Elle dit où je suis… et c'est là que je tape une adresse."], [5, "☆ L'étoile", "Garder ce site dans mes favoris."], [6, "La barre de favoris", "Mes sites préférés, en un clic."]])}` },

    { title: "Taper une adresse", html: `
      ${url([["www.", "dim", "souvent au début"], ["mairie-valbourg", "ok", "le nom du site"], [".fr", "ok", "l'extension"], ["/horaires", "dim", "la page"]])}
      <div class="l-grid2">
        <div class="l-card" data-reveal="1"><h3>⌨️ Comment faire</h3><p>1. Je clique <b>dans la barre d'adresse</b>, tout en haut.</p><p>2. Je tape l'adresse.</p><p>3. J'appuie sur <kbd>Entrée</kbd>.</p></div>
        <div class="l-card" data-reveal="2"><h3>✍️ Les règles</h3><p>❌ jamais d'espace · ❌ jamais d'accent</p><p>➖ le tiret : touche <kbd>6</kbd> · le point : <kbd>Maj</kbd> + <kbd>; .</kbd></p><p>🔤 en minuscules</p></div>
      </div>
      <div class="l-callout" data-reveal="3">🦖 Une seule lettre fausse, et le site est <b>introuvable</b>. Pas de panique : on vérifie lettre par lettre.</div>` },

    { title: "Adresse… ou recherche ?", html: `
      <p class="l-lead">La barre d'adresse sait faire les deux ! Cliquez pour voir ce qui se passe.</p>
      <div class="l-flips">
        ${flip("<code>www.ameli.fr</code>", "➡️ Va <b>directement</b> sur le site", true)}
        ${flip("<code>horaires piscine valbourg</code>", "🔎 Lance une <b>recherche</b>", true)}
        ${flip("<code>ameli</code>", "🔎 Lance une <b>recherche</b> (pas de point = pas une adresse)", true)}
        ${flip("<code>www.ameli fr</code>", "🔎 Une recherche… à cause de l'<b>espace</b>", false)}
      </div>
      <p class="l-note" data-reveal>Une adresse = des mots collés avec des points. Des mots séparés par des espaces = une recherche.</p>` },

    { title: "Onglets et favoris", html: `
      <div class="l-grid2">
        <div class="l-card big" data-reveal="1"><h3>🗂️ Les onglets</h3><p>Comme les <b>intercalaires</b> d'un classeur : plusieurs sites ouverts, on passe de l'un à l'autre en cliquant dessus.</p>
          <p>＋ ou <kbd>Ctrl</kbd> + <kbd>T</kbd> : un nouvel onglet</p><p>✕ sur l'onglet : je ferme <b>cet onglet seulement</b>.</p></div>
        <div class="l-card big" data-reveal="2"><h3>⭐ Les favoris</h3><p>Comme un <b>marque-page</b> : je retrouve un site sans retaper son adresse.</p>
          <p>☆ au bout de la barre d'adresse : j'ajoute le site.</p><p>Il apparaît dans la barre de favoris, juste en dessous.</p></div>
      </div>
      <div class="l-callout" data-reveal="3">👀 Avant de cliquer sur une croix ✕, je lis le <b>nom de l'onglet</b>. Et la croix tout en haut à droite de l'écran ferme <b>tout le navigateur</b>.</div>` }
  ];

  /* =========================================================
     SÉANCE 2 — Bien chercher sur Internet
     ========================================================= */
  const s2Slides = () => [
    { title: "Parler au moteur de recherche : des mots-clés 🔑", theme: "dense", html: `
      <div class="l-grid2">
        <div class="l-risk" data-reveal="1"><h3>😅 Trop long</h3><p>« Bonjour, je voudrais savoir à quelle heure ouvre la piscine de Valbourg le dimanche s'il vous plaît »</p><small>Ça marche souvent… mais les mots inutiles brouillent la recherche.</small></div>
        <div class="l-safe" data-reveal="2"><h3>✅ Des mots-clés</h3><p style="font-size:1.4em"><b>horaires piscine Valbourg dimanche</b></p></div>
      </div>
      <div class="l-meta">
        <div data-reveal="3"><span>❓</span><b>QUOI ?</b><small>horaires, recette, pharmacie…</small></div>
        <div data-reveal="3"><span>📍</span><b>OÙ ?</b><small>la ville, le quartier</small></div>
        <div data-reveal="3"><span>📅</span><b>QUAND ?</b><small>dimanche, 2026… (si utile)</small></div>
      </div>
      <p class="l-note" data-reveal="4">💡 Accents, majuscules, petites fautes : pas grave dans une recherche, le moteur comprend. (Mais pas dans une adresse !)</p>` },

    { title: "Lire une page de résultats", theme: "dense", html: `
      ${bmock({ url: "www.cherchetout.fr/recherche?q=pharmacie garde valbourg", body: resultsMock("pharmacie garde valbourg", [rcard("www.pharma-promo-valbourg.com", { spon: hl(2, "Sponsorisé") + pin(2) }), rcard(N().MAIRIE + "/pharmacies-de-garde", { site: hl(3, "mairie-valbourg.fr", true) + pin(3, true), title: hl(4, "Pharmacies de garde à Valbourg - Mairie", true) + pin(4, true) })], { q: pin(1) }) })}
      ${notes([[1, "Ma recherche", "Je peux la corriger ici et relancer."], [2, "« Sponsorisé » = une publicité", "Une entreprise a payé pour être en haut. Ce n'est pas forcément la bonne réponse."], [3, "Le nom du site, AVANT le titre", "Je le lis en premier : ici, le site de la mairie.", true], [4, "Le titre bleu : on clique dessus", "Et la petite phrase dessous résume la page."]])}` },

    { title: "« Sponsorisé » : attention aux intermédiaires payants 💶", html: `
      <div class="l-grid2">
        <div class="l-risk" data-reveal="1"><h3>📢 L'annonce, en haut</h3><p><b>passeport-express-valbourg.com</b></p><p>« Votre passeport en 5 minutes »</p><p><b>49 € de « frais de service »</b></p><small>Ils remplissent le même formulaire que vous… et vous le font payer.</small></div>
        <div class="l-safe" data-reveal="2"><h3>🇫🇷 Le site officiel, plus bas</h3><p><b>ants.gouv.fr</b></p><p>La même pré-demande</p><p><b>Gratuite</b></p><small>Le site de l'État, en .gouv.fr</small></div>
      </div>
      <div class="l-callout" data-reveal="3">🧭 Pour une démarche : je cherche le <b>site officiel</b>. Dans le doute, je passe par <b>service-public.fr</b>, qui donne toujours le bon lien.</div>` },

    { title: "Les sites officiels à connaître 🇫🇷", html: `
      <div class="l-grid3">
        <div class="l-card" data-reveal="1"><h3>📘 service-public.fr</h3><small>Toutes les démarches expliquées, et les bons liens</small></div>
        <div class="l-card" data-reveal="1"><h3>🪪 ants.gouv.fr</h3><small>Carte d'identité, passeport, permis, carte grise</small></div>
        <div class="l-card" data-reveal="1"><h3>💶 impots.gouv.fr</h3><small>Les impôts</small></div>
        <div class="l-card" data-reveal="2"><h3>💙 ameli.fr</h3><small>L'Assurance Maladie</small></div>
        <div class="l-card" data-reveal="2"><h3>👪 caf.fr</h3><small>Les allocations familiales, les aides au logement</small></div>
        <div class="l-card" data-reveal="2"><h3>🧓 info-retraite.fr</h3><small>Toutes les retraites</small></div>
      </div>
      <div class="l-callout" data-reveal="3">✅ La fin <b>.gouv.fr</b> est réservée à l'État. Mais tous les sites officiels ne la portent pas (ameli.fr, caf.fr…) : d'où l'intérêt de connaître cette liste… ou de passer par service-public.fr.</div>` },

    { title: "Je ne trouve pas ? 🤔", html: `
      <ol class="l-gestures">
        <li data-reveal><span>✏️</span><div><b>Je change mes mots-clés</b><small>Moins de mots, ou des mots plus simples : « carte grise » plutôt que « certificat d'immatriculation ».</small></div></li>
        <li data-reveal><span>📍</span><div><b>J'ajoute la ville</b><small>Pour la mairie, la pharmacie, la piscine : sinon, on me donne celles de toute la France.</small></div></li>
        <li data-reveal><span>📄</span><div><b>Je regarde la page 2… ou je reformule</b><small>Les bons résultats sont presque toujours sur la première page.</small></div></li>
        <li data-reveal><span>🙋</span><div><b>Je demande</b><small>À la médiathèque, au médiateur numérique, à France Services : c'est fait pour ça.</small></div></li>
      </ol>` }
  ];

  /* =========================================================
     SÉANCE 3 — Naviguer sans crainte
     ========================================================= */
  const FAKE_BODY = `<div class="ws" style="--c:#000091"><header class="ws-head"><span class="ws-logo">${hl(3, "🇫🇷 RÉPUBLIQUE FRANÇOISE · Impot")}${pin(3)}</span></header>
      <main class="ws-main"><h2>Remboursement d'impôt</h2><p>${hl(4, "Vous ête éligible a un remboursement")}${pin(4)} de 312,50 €.</p><p>${hl(5, "⏳ Votre dossier expire dans <b class='ws-timer'>14:59</b> minutes !")}${pin(5)}</p>
      ${hl(6, `<div class="ws-form"><span>Numéro de carte bancaire</span><span>Cryptogramme (3 chiffres au dos)</span></div>`)}${pin(6)}</main></div>`;
  const s3Slides = () => [
    { title: "Où suis-je ? Le vrai nom du site 🔍", theme: "dense", html: `
      <p class="l-lead">Le vrai nom d'un site est <b>juste avant le premier « / »</b>. Tout ce qui est avant peut être un déguisement.</p>
      ${url([["https://", "dim"], ["www.", "dim"], ["impots.gouv.fr", "ok", "le vrai nom ✅"], ["/mon-espace", "dim", "la page"]])}
      <div data-reveal="1">${url([["https://", "dim"], ["impots.gouv.fr.", "mask", "un déguisement"], ["remboursement-dossier.com", "ko", "le vrai nom ❌"], ["/connexion", "dim"]])}</div>
      <div data-reveal="2">${url([["https://", "dim"], ["www.", "dim"], ["impots-gouv.fr", "ko", "un tiret à la place du point ❌"]])}</div>
      <div class="l-callout" data-reveal="3">👓 Dans la barre d'adresse, le navigateur écrit le vrai nom <b>plus foncé</b>, le reste en gris. C'est lui que je lis !</div>` },

    { title: "Le cadenas 🔒 : ce qu'il dit… et ce qu'il ne dit pas", html: `
      <div class="l-grid2">
        <div class="l-safe" data-reveal="1"><h3>🔒 Cadenas = connexion chiffrée</h3><p>Ce que je tape voyage <b>sous enveloppe fermée</b> : personne ne peut le lire en chemin.</p></div>
        <div class="l-risk" data-reveal="2"><h3>⚠️ « Non sécurisé »</h3><p>Ce que je tape voyage <b>en carte postale</b> : lisible en chemin. Je peux lire la page, mais je ne tape <b>rien</b> de personnel.</p></div>
      </div>
      <div class="l-never" data-reveal="3"><h3>🚨 Le cadenas ne dit PAS que le site est honnête</h3><p>Les escrocs aussi ont des cadenas ! Un faux site peut avoir une enveloppe fermée… qui part directement chez l'escroc. Je lis toujours <b>le vrai nom du site</b>.</p></div>` },

    { title: "Un faux site : les indices 🕵️", theme: "dense", html: `
      <div class="l-grid2 l-mid" style="grid-template-columns:1.6fr 1fr"><div>${bmock({ url: "www.impots-gouv-remboursement.com/dossier", secure: false, body: FAKE_BODY, tabs: [["🇫🇷", "Impots - Remboursement"]],
        addrHTML: hl(1, BR().prettyUrl("www.impots-gouv-remboursement.com/dossier", false)), lockHTML: hl(2, "⚠️ <span>Non sécurisé</span>"), P: { addr: pin(1) } })}</div>
      <div>${notes([[1, "Le vrai nom : impots-gouv-remboursement.com", "Le vrai site : impots.gouv.fr"], [2, "« Non sécurisé »", "Aucun site officiel n'est comme ça."], [3, "Un faux logo", "« République Françoise » !"], [4, "Des fautes", "« Vous ête éligible a »"], [5, "Un compte à rebours", "Pour vous presser."], [6, "On demande la carte bancaire", "Pour un remboursement ? Jamais."]])}</div></div>` },

    { title: "La fausse alerte virus 🚨", theme: "dense", html: `
      <div class="l-grid2 l-mid">
        <div class="l-alert-mini" data-reveal="1"><p>⚠ <b>ALERTE ! VOTRE ORDINATEUR EST BLOQUÉ</b></p><p>Virus détecté. Vos comptes bancaires sont en danger. N'éteignez pas l'ordinateur.</p><p>📞 <b>Appelez le support : 09 00 00 00 00</b></p><small>🔊 + une sirène, tout l'écran pris…</small></div>
        <div class="l-safe" data-reveal="2"><h3>🫶 Votre ordinateur n'a RIEN</h3><p>C'est une simple <b>page web</b>, faite pour faire peur. Au bout du fil : un escroc qui veut prendre la main sur l'ordinateur ou faire payer un faux dépannage.</p></div>
      </div>
      <ol class="l-gestures">
        <li data-reveal="3"><span>⌨️</span><div><b>1. La touche Échap</b><small>La touche tout en haut à gauche : on sort du plein écran.</small></div></li>
        <li data-reveal="3"><span>✕</span><div><b>2. Je ferme l'onglet</b><small>Sa petite croix. Sans cliquer dans la page.</small></div></li>
        <li data-reveal="4"><span>⏻</span><div><b>3. Ça bloque encore ? Je ferme le navigateur, ou j'éteins</b><small>Appui long sur le bouton marche. Au redémarrage, tout a disparu.</small></div></li>
      </ol>` },

    { title: "Vraie ou fausse alerte ?", html: `
      <div class="l-grid2">
        <div class="l-safe" data-reveal="1"><h3>✅ Une vraie alerte</h3><div class="l-toast-win"><b>🛡️ Sécurité Windows</b>Menace bloquée. Aucune action n'est requise.</div><ul><li>une petite fenêtre, dans un coin de l'écran</li><li><b>jamais</b> de numéro à appeler</li><li>jamais d'urgence ni de paiement</li></ul></div>
        <div class="l-risk" data-reveal="2"><h3>🚩 Une fausse alerte</h3><ul><li>dans le <b>navigateur</b>, souvent en plein écran</li><li>un <b>numéro à appeler</b></li><li>sirène, compte à rebours, « n'éteignez pas »</li><li>« téléchargez cet antivirus »</li></ul></div>
      </div>
      <div class="l-callout" data-reveal="3">☎️ Microsoft, Apple, votre banque ou la police ne vous demandent <b>jamais</b> de les appeler depuis une page Internet.</div>` },

    { title: "J'ai appelé… que faire ? 🆘", html: `
      <ol class="l-gestures">
        <li data-reveal><span>📵</span><div><b>Je raccroche</b><small>Même si la personne est polie, insistante, ou dit être de Microsoft.</small></div></li>
        <li data-reveal><span>🔌</span><div><b>On a pris la main sur mon ordinateur ? Je l'éteins</b><small>Ou je débranche Internet. Puis je le fais vérifier.</small></div></li>
        <li data-reveal><span>🏦</span><div><b>J'ai payé ou donné ma carte ? J'appelle ma banque</b><small>Le numéro est au dos de la carte. Plus c'est rapide, mieux c'est.</small></div></li>
        <li data-reveal><span>🔑</span><div><b>Je change mes mots de passe</b><small>Depuis un autre appareil.</small></div></li>
      </ol>
      <div class="l-callout" data-reveal>🫶 Aucune honte : ces arnaques sont faites par des professionnels. Aide gratuite : <b>cybermalveillance.gouv.fr</b>… et votre médiateur numérique !</div>` },

    { title: "Cookies et fenêtres pièges 🍪", html: `
      <div class="l-grid2">
        <div class="l-card big" data-reveal="1"><h3>🍪 Les cookies</h3><p>De petits fichiers qui permettent au site de <b>se souvenir</b> de moi (mes réglages, mes visites, la publicité).</p><p>✅ J'ai le droit de cliquer sur <b>« Tout refuser »</b> : le site marche pareil.</p><small>Accepter n'est pas dangereux : c'est surtout de la publicité ciblée.</small></div>
        <div class="l-card big" data-reveal="2"><h3>🎁 « Vous avez gagné ! »</h3><p>Personne ne gagne un smartphone en visitant un site. C'est un piège à coordonnées.</p><p>✅ Je ferme avec la petite croix <b>✕</b>, sans cliquer sur le gros bouton.</p><small>Et jamais de téléchargement proposé par une fenêtre surgissante.</small></div>
      </div>` }
  ];

  /* =========================================================
     LES 3 SÉANCES
     ========================================================= */
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
    const A = s1Slides(), B = s2Slides(), C = s3Slides();
    return [
      { id: "s1", title: "Séance 1 : le navigateur, ma porte d'entrée", icon: "🚪", badge: "Séance 1 · Le navigateur", slides: () => [
        cover(1, "Le navigateur, ma porte d'entrée sur Internet", ["🚪 Navigateur, moteur, site : qui est qui ?", "🧭 Les boutons du navigateur", "⌨️ Taper une adresse", "🗂️ Onglets et favoris"]),
        { title: "Internet, c'est une immense bibliothèque", theme: "dense", html: `<div class="l-center" style="max-height:210px">${SVG_LIB.replace('class="l-svg tall"', 'class="l-svg" style="max-height:210px;width:auto"')}</div>${pick(A, "Internet").html}` },
        pick(A, "Qui est qui"),
        game("nav_qui", "Navigateur, moteur ou site ?"),
        pick(A, "Les boutons du navigateur"),
        game("nav_bouton", "Le bon bouton"),
        pick(A, "Taper une adresse"), pick(A, "Adresse… ou recherche"),
        game("nav_dictee", "Dictée d'adresses web"),
        pick(A, "Onglets et favoris"),
        end("les <b>niveaux 1 et 2</b> : ouvrir un site, les boutons et les onglets", "nav_open")] },
      { id: "s2", title: "Séance 2 : bien chercher sur Internet", icon: "🔎", badge: "Séance 2 · Bien chercher", slides: () => [
        cover(2, "Bien chercher sur Internet", ["🔑 Les mots-clés", "📄 Lire une page de résultats", "📢 Repérer les annonces", "🇫🇷 Trouver le site officiel"]),
        pick(B, "Parler au moteur"),
        game("nav_recherche", "La meilleure recherche"),
        pick(B, "Lire une page de résultats"), pick(B, "« Sponsorisé »"),
        game("nav_annonce", "Annonce ou vrai résultat ?"),
        pick(B, "Les sites officiels"),
        game("nav_officiel", "Trouve le site officiel"),
        pick(B, "Je ne trouve pas"),
        end("les <b>niveaux 3 et 4</b> : faire une recherche, choisir le bon résultat", "nav_search")] },
      { id: "s3", title: "Séance 3 : naviguer sans crainte", icon: "🛡️", badge: "Séance 3 · Naviguer sans crainte", slides: () => [
        cover(3, "Naviguer sans crainte", ["🔍 Lire le vrai nom d'un site", "🔒 Ce que dit le cadenas", "🕵️ Repérer un faux site", "🚨 Les fausses alertes virus", "🍪 Cookies et fenêtres pièges"]),
        pick(C, "Où suis-je"), pick(C, "Le cadenas"),
        game("nav_piege", "Officiel ou piège ?"),
        pick(C, "Un faux site"),
        game("nav_faux_site", "Trouve les indices"),
        pick(C, "La fausse alerte virus"), pick(C, "Vraie ou fausse alerte"),
        game("nav_alerte", "Vraie ou fausse alerte ?"),
        pick(C, "J'ai appelé"), pick(C, "Cookies et fenêtres pièges"),
        game("nav_que_faire", "Que faites-vous ?"),
        end("les <b>niveaux 5, 6 et 7</b> : faux sites, fausses alertes… puis la <b>mission réelle</b> sur le vrai Internet !", "nav_fakesite",
          `<div class="l-callout">🌍 Le niveau 7 se fait sur le <b>vrai navigateur</b> : chacun choisit une mission, cherche, puis m'envoie sa réponse.</div>`)] }
    ];
  };

  AN.navLessonKit = { bmock, resultsMock, rcard, page, pin, hl };

  AN.chapters.register({
    id: "navigateurs", title: "Navigateurs et recherche", icon: "🧭", color: "#2f9d68",
    summary: "3 séances de 30 minutes : un cours court, des jeux en direct, puis les exercices… jusqu'à une mission sur le vrai Internet.",
    duration: "3 séances", parcours: "p_nav", demo: "nav_open",
    demos: [{ type: "nav_open", label: "Niveau 1 ensemble" }, { type: "nav_results", label: "Niveau 4 ensemble (annonces)" }, { type: "nav_alert", label: "Niveau 6 ensemble (fausse alerte)" }],
    get lessons() { return lessons(); }
  });
})(window.AN);
/* Le chapitre se range juste après « E-mail », avant les chapitres à venir. */
(function (AN) {
  const all = AN.chapters.all, i = all.findIndex(c => c.id === "navigateurs"), j = all.findIndex(c => c.soon);
  if (j >= 0 && i > j) all.splice(j, 0, all.splice(i, 1)[0]);
})(window.AN);

/* =========================================================
   Chapitre « Navigateurs et recherche » : 7 niveaux progressifs.
   Même principe que le chapitre E-mail : on peut toujours continuer
   après une erreur, chaque erreur est expliquée, note /20 à la fin.
   Le niveau 7 est une « mission réelle » sur le vrai navigateur :
   la réponse part chez le formateur, qui la valide dans la messagerie.
   ========================================================= */
(function (AN) {
  "use strict";
  const { esc } = AN.util;
  const R = AN.missions.register;
  const KIT = () => AN.missionKit;
  const B = () => AN.browser;
  const grader = L => AN.mail.grader(L.grade ||= {});
  const frame = (ctx, o) => KIT().frame(ctx, { chapter: "Navigateur", ...o });
  const tasksHTML = t => KIT().tasksHTML(t);
  const quiz = (el, o) => KIT().inlineQuiz(el, o);
  const host = u => B().hostOf(u);

  /* =========================================================
     L'UNIVERS FICTIF : les sites de Valbourg (et quelques pièges)
     ========================================================= */
  const MED = "www.mediatheque-valbourg.fr", MAIRIE = "www.mairie-valbourg.fr";
  const ws = (o, body) => info => `<div class="ws" style="--c:${o.color}">
      <header class="ws-head"><span class="ws-logo">${o.logo}</span>${o.nav ? `<nav class="ws-nav">${o.nav.map(([l, u]) => `<a href="#" data-href="${u}" class="${B().normalize(u) === B().normalize(info.url) ? "on" : ""}">${l}</a>`).join("")}</nav>` : ""}</header>
      <main class="ws-main">${typeof body === "function" ? body(info) : body}</main>
      ${o.foot ? `<footer class="ws-foot">${o.foot}</footer>` : ""}</div>`;
  const SITE_MED = { color: "#7050bf", logo: "📚 Médiathèque de Valbourg", foot: "Médiathèque de Valbourg · 12 rue des Lilas · 04 00 12 34 56",
    nav: [["Accueil", MED], ["Horaires", MED + "/horaires"], ["Agenda", MED + "/agenda"], ["Liens utiles", MED + "/liens"]] };
  const SITE_MAIRIE = { color: "#1d5fa8", logo: "🏛️ Mairie de Valbourg", foot: "Mairie de Valbourg · Place de la République · 04 00 98 76 54",
    nav: [["Accueil", MAIRIE], ["Horaires", MAIRIE + "/horaires"], ["Démarches", MAIRIE + "/demarches"], ["Pharmacies de garde", MAIRIE + "/pharmacies-de-garde"], ["Déchetterie", MAIRIE + "/dechetterie"]] };
  const table = rows => `<table class="ws-table"><tbody>${rows.map(([a, b]) => `<tr><td><b>${a}</b></td><td>${b}</td></tr>`).join("")}</tbody></table>`;
  const FAKE_ALERT = "www.alerte-securite-windows.support-pc24.com";

  const WORLD = {
    /* --- la médiathèque --- */
    [MED]: { title: "Médiathèque de Valbourg", short: "Médiathèque", icon: "📚", html: ws(SITE_MED, `
      <h2>Bienvenue à la médiathèque !</h2><p>Livres, films, musique, ateliers numériques : tout est gratuit avec la carte de lecteur.</p>
      <div class="ws-news">📣 <b>Nouveau :</b> les ateliers numériques reprennent chaque jeudi à 14 h.</div>
      <div class="ws-cards"><div class="ws-card"><b>🕒 Horaires</b><a href="#" data-href="${MED}/horaires">Voir les horaires d'ouverture</a></div>
        <div class="ws-card"><b>📅 Agenda</b><a href="#" data-href="${MED}/agenda">Les animations du mois</a></div>
        <div class="ws-card"><b>🔗 Liens utiles</b><a href="#" data-href="${MED}/liens">Mairie, services…</a></div></div>`) },
    [MED + "/horaires"]: { title: "Horaires - Médiathèque", short: "Médiathèque", icon: "📚", html: ws(SITE_MED, `
      <h2>🕒 Horaires d'ouverture</h2>${table([["Lundi", "Fermé"], ["Mardi", "10 h – 18 h"], ["Mercredi", "10 h – 18 h"], ["Jeudi", "14 h – 18 h"], ["Vendredi", "14 h – 19 h"], ["Samedi", "10 h – 17 h"], ["Dimanche", "Fermé"]])}
      <p>📞 Une question ? 04 00 12 34 56</p>`) },
    [MED + "/agenda"]: { title: "Agenda - Médiathèque", short: "Médiathèque", icon: "📚", html: ws(SITE_MED, info => `
      <h2>📅 Agenda du mois</h2>
      ${info.reloads ? `<div class="ws-news">🆕 <b>Ajouté à l'instant : atelier « Ma tablette » vendredi à 15 h</b></div>` : ""}
      <ul><li><b>Mardi 18 h</b> : club de lecture</li><li><b>Mercredi 10 h</b> : heure du conte</li><li><b>Jeudi 14 h</b> : atelier numérique « Bien chercher sur Internet »</li><li><b>Samedi 10 h</b> : bourse aux livres</li></ul>
      ${info.reloads ? "" : `<p class="ws-ad">ℹ️ Cette page est mise à jour régulièrement.</p>`}`) },
    [MED + "/liens"]: { title: "Liens utiles - Médiathèque", short: "Médiathèque", icon: "📚", html: ws(SITE_MED, `
      <h2>🔗 Liens utiles</h2><ul>
      <li><a href="#" data-href="${MAIRIE}">Le site de la mairie de Valbourg</a> : démarches, horaires, pharmacies de garde</li>
      <li><a href="#" data-href="www.meteo-valbourg.fr">La météo de Valbourg</a></li>
      <li><a href="#" data-href="www.cherchetout.fr">Le moteur de recherche Cherchetout</a></li></ul>`) },

    /* --- la mairie --- */
    [MAIRIE]: { title: "Mairie de Valbourg", short: "Mairie", icon: "🏛️", html: ws(SITE_MAIRIE, `
      <h2>Bienvenue sur le site de la mairie</h2><p>Retrouvez vos démarches, les horaires des services et les informations pratiques.</p>
      <div class="ws-cards"><div class="ws-card"><b>🪪 Carte d'identité, passeport</b><a href="#" data-href="${MAIRIE}/demarches">Sur rendez-vous</a></div>
        <div class="ws-card"><b>💊 Pharmacies de garde</b><a href="#" data-href="${MAIRIE}/pharmacies-de-garde">Le planning</a></div>
        <div class="ws-card"><b>♻️ Déchetterie</b><a href="#" data-href="${MAIRIE}/dechetterie">Horaires et consignes</a></div></div>`) },
    [MAIRIE + "/horaires"]: { title: "Horaires - Mairie", short: "Mairie", icon: "🏛️", html: ws(SITE_MAIRIE, `
      <h2>🕒 Horaires de l'accueil</h2>${table([["Lundi au vendredi", "8 h 30 – 12 h et 13 h 30 – 17 h"], ["Samedi", "9 h – 12 h"], ["Dimanche", "Fermé"]])}`) },
    [MAIRIE + "/demarches"]: { title: "Démarches - Mairie", short: "Mairie", icon: "🏛️", html: ws(SITE_MAIRIE, `
      <h2>🪪 Carte d'identité et passeport</h2>
      <ol><li>Faites votre <b>pré-demande gratuite</b> sur le site officiel <b>ants.gouv.fr</b>.</li><li>Prenez <b>rendez-vous</b> à la mairie.</li><li>Venez avec vos justificatifs.</li></ol>
      <p><a class="ws-btn" href="#" data-href="${MAIRIE}/rendez-vous">📅 Prendre rendez-vous</a></p>
      <p>⚠️ La mairie ne fait <b>jamais payer</b> la prise de rendez-vous.</p>`) },
    [MAIRIE + "/rendez-vous"]: { title: "Rendez-vous - Mairie", short: "Mairie", icon: "🏛️", html: ws(SITE_MAIRIE, info => info.flags.slot
      ? `<h2>✅ Rendez-vous confirmé</h2><p>Votre rendez-vous pour une carte d'identité : <b>${esc(info.flags.slot)}</b>, à l'accueil de la mairie.</p><p>Gratuit. Une confirmation vous sera envoyée.</p>`
      : `<h2>📅 Rendez-vous carte d'identité / passeport</h2><p>Choisissez un créneau (gratuit) :</p>
        <div class="ws-cards">${["Mardi 9 h 30", "Mercredi 14 h", "Jeudi 10 h 15", "Vendredi 16 h"].map(s => `<button type="button" class="ws-btn" data-bk-act="slot" data-slot="${s}">${s}</button>`).join("")}</div>`) },
    [MAIRIE + "/pharmacies-de-garde"]: { title: "Pharmacies de garde - Mairie", short: "Mairie", icon: "🏛️", html: ws(SITE_MAIRIE, `
      <h2>💊 Pharmacies de garde</h2><p>Le dimanche et les jours fériés, une pharmacie reste ouverte :</p>
      ${table([["Ce dimanche", "<b>Pharmacie des Tilleuls</b> · 8 place du Marché · 04 00 22 33 44"], ["Dimanche prochain", "Pharmacie du Centre · 3 rue de la Gare"]])}
      <p>🌙 La nuit, appelez le <b>3237</b> pour connaître la pharmacie de garde.</p>`) },
    [MAIRIE + "/dechetterie"]: { title: "Déchetterie - Mairie", short: "Mairie", icon: "🏛️", html: ws(SITE_MAIRIE, `
      <h2>♻️ Déchetterie de Valbourg</h2>${table([["Lundi", "Fermé"], ["Mardi au vendredi", "14 h – 18 h"], ["Samedi", "9 h – 12 h et 14 h – 18 h"], ["Dimanche", "9 h – 12 h"]])}
      <p>Gratuite pour les habitants, sur présentation d'un justificatif de domicile.</p>`) },

    /* --- sites officiels --- */
    "www.service-public.fr/passeport": { title: "Passeport | Service Public", short: "Service Public", icon: "🇫🇷", html: ws({ color: "#000091", logo: "🇫🇷 Service-Public.fr", foot: "Le site officiel de l'administration française" }, `
      <h2>Passeport : comment faire ?</h2><p>La <b>pré-demande en ligne est gratuite</b>. Elle se fait sur le site officiel de l'ANTS.</p>
      <p><a class="ws-btn" href="#" data-href="passeport.ants.gouv.fr">Faire ma pré-demande sur ants.gouv.fr</a></p>
      <p>⚠️ Attention aux sites qui vous font payer cette démarche : ils ne sont pas officiels.</p>`) },
    "passeport.ants.gouv.fr": { title: "ANTS - Pré-demande passeport", short: "ANTS", icon: "🇫🇷", html: ws({ color: "#000091", logo: "🇫🇷 ANTS · Agence Nationale des Titres Sécurisés", foot: "ants.gouv.fr · site officiel" }, `
      <h2>Pré-demande de passeport</h2><p>Remplissez votre pré-demande en ligne : c'est <b>gratuit</b>. Vous obtiendrez un numéro à présenter à la mairie.</p>
      <p><span class="ws-btn">Commencer ma pré-demande</span></p>`) },
    "www.ameli.fr": { title: "ameli, le site de l'Assurance Maladie", short: "ameli", icon: "💙", html: ws({ color: "#0c419a", logo: "💙 l'Assurance Maladie", foot: "ameli.fr" }, `
      <h2>Bienvenue sur ameli.fr</h2><div class="ws-cards"><div class="ws-card"><b>👤 Compte ameli</b>Suivre mes remboursements</div><div class="ws-card"><b>💳 Carte Vitale</b>La commander, la mettre à jour</div><div class="ws-card"><b>🩺 Trouver un médecin</b>Annuaire santé</div></div>`) },
    "www.impots.gouv.fr": { title: "impots.gouv.fr", short: "Impôts", icon: "🇫🇷", html: ws({ color: "#000091", logo: "🇫🇷 impots.gouv.fr", foot: "Site officiel de l'administration fiscale" }, `<h2>Espace particulier</h2><p>Déclarer mes revenus, consulter mes avis d'impôt.</p>`) },

    /* --- intermédiaires payants (annonces) --- */
    "www.passeport-express-valbourg.com": { title: "Passeport Express", icon: "💶", html: ws({ color: "#d35400", logo: "⚡ Passeport Express" }, `
      <h2>Votre passeport en 5 minutes !</h2><p>Nous remplissons votre demande à votre place.</p><p><b>Frais de service : 49 €</b></p>
      <p><span class="ws-btn">Payer et commencer</span></p><p class="ws-ad">Service privé, non affilié à l'administration.</p>`) },
    "www.mes-papiers-facile-valbourg.fr": { title: "Mes papiers facile", icon: "💶", html: ws({ color: "#16a085", logo: "📄 Mes Papiers Facile" }, `
      <h2>On s'occupe de tout !</h2><p>Carte d'identité, passeport, carte grise…</p><p><b>39,90 € par démarche</b></p><p class="ws-ad">Service privé, non affilié à l'administration.</p>`) },
    "www.forum-entraide-valbourg.net/passeport": { title: "Forum - Passeport ?", icon: "💬", html: ws({ color: "#7f8c8d", logo: "💬 Forum Entraide" }, `
      <h2>« Comment refaire mon passeport ??? »</h2><p><b>Josette62 :</b> moi j'ai payé un site 50 €, c'était rapide</p><p><b>Bernard :</b> non c'est gratuit sur le site officiel !!</p>`) },
    "www.rdv-mairie-rapide-valbourg.com": { title: "RDV Mairie Rapide", icon: "💶", html: ws({ color: "#c0392b", logo: "⏱️ RDV Mairie Rapide" }, `
      <h2>Un rendez-vous garanti en mairie</h2><p>Plus besoin d'attendre : nous réservons pour vous.</p><p><b>Frais de réservation : 29 €</b></p><p class="ws-ad">Service privé, non affilié aux mairies.</p>`) },
    "www.pharma-promo-valbourg.com": { title: "Pharma Promo", icon: "💶", html: ws({ color: "#27ae60", logo: "💊 Pharma Promo" }, `
      <h2>-30 % sur vos produits de beauté !</h2><p>Livraison en 24 h.</p><p class="ws-ad">Boutique en ligne. Ce n'est pas la liste des pharmacies de garde.</p>`) },

    /* --- sites du quotidien --- */
    "www.recettes-de-mamie.fr": { title: "Les recettes de Mamie", short: "Recettes", icon: "🥧", html: ws({ color: "#b0603a", logo: "🥧 Les recettes de Mamie", foot: "Recettes faciles depuis 2009" }, `
      <h2>Les recettes de saison</h2><div class="ws-ad">PUBLICITÉ — Gagnez des kilos de chocolat !</div>
      <div class="ws-cards"><div class="ws-card"><b>🍎 Tarte aux pommes</b><a href="#" data-href="${FAKE_ALERT}" data-newtab>Voir la recette de la tarte aux pommes</a></div>
        <div class="ws-card"><b>🍲 Soupe de potiron</b>Bientôt en ligne</div></div>`) },
    [FAKE_ALERT]: { title: "⚠ ALERTE SÉCURITÉ", icon: "⚠️", secure: false, fullscreen: true, html: () => `<div class="fa">
      <h2>⚠ Support Windows · Alerte de sécurité</h2><p class="fa-blink">🔊 ALERTE ! VOTRE ORDINATEUR EST BLOQUÉ</p>
      <div class="fa-box"><h3>🛑 Virus détecté : Trojan.Spyware.X42</h3>
        <p>Vos photos, mots de passe et comptes bancaires sont en danger. <b>N'éteignez pas votre ordinateur.</b></p>
        <p>Appelez immédiatement un technicien certifié :</p><p class="fa-phone">📞 09 00 00 00 00</p>
        <div class="fa-btns"><button type="button" data-bk-act="call">📞 Appeler le support</button><button type="button" data-bk-act="scan">Analyser maintenant</button><button type="button" data-bk-act="ok">OK</button></div></div></div>` },
    "www.meteo-valbourg.fr": { title: "Météo Valbourg", short: "Météo", icon: "🌦️", cookies: true,
      popup: `<div style="font-size:3em">🎁</div><h3>Félicitations !!!</h3><p>Vous êtes notre <b>1 000 000<sup>e</sup> visiteur</b> ! Vous avez gagné un smartphone.</p><p><button type="button" class="ws-btn" data-bk-act="gift" style="--c:#e67e22;background:#e67e22">Récupérer mon cadeau</button></p>`,
      html: ws({ color: "#2980b9", logo: "🌦️ Météo Valbourg" }, `<h2>La météo à Valbourg</h2>
        <div class="ws-cards"><div class="ws-card"><b>Aujourd'hui</b>🌧️ Pluie · 14 °C</div><div class="ws-card"><b>Demain</b>☀️ Ensoleillé · 21 °C</div><div class="ws-card"><b>Après-demain</b>⛅ Nuageux · 18 °C</div></div>`) },

    /* --- faux sites --- */
    "www.ameli-remboursement.info": { title: "Assurance Maladie - Remboursement", icon: "💙", html: ws({ color: "#0c419a", logo: "💙 l'Assurance Maladie" }, `
      <h2>Remboursement en attente : 87,40 €</h2><p>Pour recevoir votre remboursement, saisissez votre carte bancaire.</p>
      <div class="ws-form"><span>Numéro de carte</span><span>Date d'expiration</span><span>Code au dos (CVV)</span></div>`) },
    "www.colis-suivi-valbourg.top": { title: "Suivi de colis", icon: "📦", secure: false, html: ws({ color: "#f1c40f", logo: "📦 Suivi Colis Express" }, `
      <h2>Votre colis est bloqué</h2><p>Des frais de réexpédition de <b>1,99 €</b> sont à régler sous 24 h.</p><div class="ws-form"><span>Numéro de carte</span><span>Code reçu par SMS</span></div>`) },
    "www.impots-gouv-remboursement.com/dossier": { title: "Impots - Remboursement", icon: "🇫🇷", secure: false, html: () => `<div class="ws bk-clues" style="--c:#000091">
      <header class="ws-head"><span class="ws-logo" data-clue="logo">🇫🇷 RÉPUBLIQUE FRANÇOISE · Impot</span></header>
      <main class="ws-main"><h2>Remboursement d'impôt</h2>
        <p data-clue="faute">Vous ête éligible a un remboursement de 312,50 € suite a un trop-perçu.</p>
        <p data-clue="urgence">⏳ Votre dossier expire dans <span class="ws-timer">14:59</span> minutes !</p>
        <div class="ws-form" data-clue="carte"><span>Numéro de carte bancaire</span><span>Date d'expiration</span><span>Cryptogramme (3 chiffres au dos)</span></div>
        <p><span class="ws-btn">Recevoir mon remboursement</span></p></main></div>` }
  };

  /* Ce que le moteur Cherchetout peut trouver. */
  const INDEX = [
    { url: MED, title: "Médiathèque de Valbourg - Accueil", desc: "Livres, films, ateliers numériques. Horaires, agenda et animations de la médiathèque.", keywords: "mediatheque bibliotheque valbourg livres", icon: "📚" },
    { url: MED + "/horaires", title: "Horaires d'ouverture - Médiathèque de Valbourg", desc: "Mardi au samedi. Fermée le lundi et le dimanche.", keywords: "mediatheque bibliotheque horaires ouverture valbourg", icon: "📚" },
    { url: MAIRIE, title: "Mairie de Valbourg - Site officiel", desc: "Démarches, horaires, pharmacies de garde, déchetterie.", keywords: "mairie valbourg ville commune", icon: "🏛️" },
    { url: MAIRIE + "/pharmacies-de-garde", title: "Pharmacies de garde à Valbourg - Mairie", desc: "Le planning des pharmacies de garde le dimanche et les jours fériés.", keywords: "pharmacie pharmacies garde dimanche valbourg ouverte", icon: "🏛️", rank: 1 },
    { url: "www.pharma-promo-valbourg.com", title: "Pharmacie en ligne -30 % | Livraison 24 h", desc: "Tous vos produits de pharmacie à prix réduits.", keywords: "pharmacie pharmacies garde valbourg", icon: "💊", sponsored: true },
    { url: MAIRIE + "/dechetterie", title: "Déchetterie de Valbourg : horaires et consignes", desc: "Horaires d'ouverture de la déchetterie, déchets acceptés.", keywords: "dechetterie decheterie dechets dechet encombrants horaires valbourg", icon: "🏛️" },
    { url: MAIRIE + "/horaires", title: "Horaires de la mairie de Valbourg", desc: "Accueil du lundi au samedi matin.", keywords: "mairie horaires ouverture accueil valbourg", icon: "🏛️" },
    { url: MAIRIE + "/rendez-vous", title: "Rendez-vous carte d'identité et passeport - Mairie de Valbourg", desc: "Prenez rendez-vous gratuitement en ligne.", keywords: "rendez-vous rendez vous rdv carte identite passeport mairie valbourg", icon: "🏛️", rank: 1 },
    { url: "www.rdv-mairie-rapide-valbourg.com", title: "RDV mairie garanti sous 48 h - Réservez maintenant", desc: "Carte d'identité, passeport : un rendez-vous garanti sans attendre.", keywords: "rendez-vous rendez vous rdv carte identite passeport mairie valbourg", icon: "⏱️", sponsored: true },
    { url: "www.passeport-express-valbourg.com", title: "Passeport en ligne - Démarche rapide en 5 min", desc: "Nous faisons votre demande de passeport à votre place. Simple et rapide.", keywords: "passeport renouveler renouvellement demande refaire", icon: "⚡", sponsored: true },
    { url: "www.mes-papiers-facile-valbourg.fr", title: "Carte d'identité, passeport : on s'occupe de tout !", desc: "Toutes vos démarches administratives faites pour vous.", keywords: "passeport renouveler renouvellement demande carte identite refaire", icon: "📄", sponsored: true },
    { url: "passeport.ants.gouv.fr", title: "Pré-demande de passeport - ANTS", desc: "Site officiel. Faites votre pré-demande de passeport en ligne, gratuitement.", keywords: "passeport renouveler renouvellement demande ants refaire", icon: "🇫🇷", site: "ants.gouv.fr", rank: 1 },
    { url: "www.service-public.fr/passeport", title: "Passeport : comment faire la demande ? | Service Public", desc: "Le site officiel de l'administration française vous explique les démarches.", keywords: "passeport renouveler renouvellement demande refaire", icon: "🇫🇷", site: "service-public.fr", rank: 2 },
    { url: "www.forum-entraide-valbourg.net/passeport", title: "Comment refaire mon passeport ??? - Forum Entraide", desc: "12 réponses · « moi j'ai payé un site 50 €… »", keywords: "passeport renouveler refaire", icon: "💬", rank: 5 },
    { url: "www.recettes-de-mamie.fr", title: "Tarte aux pommes facile - Les recettes de Mamie", desc: "La recette de la tarte aux pommes de Mamie, prête en 45 minutes.", keywords: "tarte pommes recette dessert", icon: "🥧" },
    { url: "www.meteo-valbourg.fr", title: "Météo Valbourg - Prévisions à 3 jours", desc: "Le temps qu'il fera aujourd'hui et demain à Valbourg.", keywords: "meteo temps valbourg demain previsions", icon: "🌦️" },
    { url: "www.ameli.fr", title: "ameli, le site de l'Assurance Maladie en ligne", desc: "Compte ameli, remboursements, carte Vitale.", keywords: "ameli assurance maladie securite sociale remboursement vitale", icon: "💙", site: "ameli.fr" },
    { url: "www.impots.gouv.fr", title: "impots.gouv.fr | Le site officiel", desc: "Votre espace particulier.", keywords: "impots impot declaration revenus", icon: "🇫🇷", site: "impots.gouv.fr" }
  ];

  /** Monte le navigateur simulé dans la zone de la mission. */
  function mount(ctx, el, extra = {}) {
    const L = ctx.local;
    L.client?.destroy();
    L.client = B().client(el, { pages: WORLD, index: INDEX, weakWords: ["valbourg", "fr"], big: ctx.demo, ...extra });
    if (!L.cleanHooked) { L.cleanHooked = true; ctx.onCleanup(() => L.client?.destroy()); }
    return L.client;
  }
  const finish = (ctx, G, o) => { if (ctx.box.isConnected && ctx.box.__an?.ctx === ctx) return KIT().finish(ctx, G, o); };
  const later = (ctx, fn, ms) => { const t = setTimeout(() => { if (ctx.box.isConnected && ctx.box.__an?.ctx === ctx) fn(); }, ms); ctx.onCleanup(() => clearTimeout(t)); };
  const is = (url, target) => B().normalize(url || "") === B().normalize(target);
  const onHost = (url, h) => host(url || "") === h;

  /** Aide pour une adresse mal tapée. */
  function urlHint(target, typed) {
    const t = String(typed || "").trim().toLowerCase().replace(/^https?:\/\//, "");
    if (/\s/.test(t)) return "Il y a un <b>espace</b> : une adresse de site n'en contient jamais.";
    if (/[àâäéèêëîïôöùûüç]/.test(t)) return "Il y a un <b>accent</b> : les adresses s'écrivent sans accent (mediatheque, pas médiathèque).";
    if ((t.match(/\./g) || []).length < 2 && target.startsWith("www.")) return "Vérifiez les <b>points</b> : www<b>.</b>mediatheque-valbourg<b>.</b>fr";
    if (target.includes("-") && !t.includes("-")) return "Il manque le <b>tiret</b> - entre les mots (touche <kbd>6</kbd>).";
    if (!t.endsWith(target.split(".").pop())) return `Vérifiez la fin de l'adresse : <b>.${target.split(".").pop()}</b>`;
    return "Comparez lettre par lettre avec le modèle : une seule lettre différente et le site est introuvable.";
  }

  /* =========================================================
     NIVEAU 1 — Ouvrir un site   (exercice collectif projetable)
     ========================================================= */
  R("nav_open", {
    steps: 3,
    render(ctx) {
      const step = ctx.m.step || 0, L = ctx.local, G = grader(L);

      if (step === 0) {
        const f = frame(ctx, { level: 1, title: "Taper l'adresse d'un site", step: 0,
          consigne: `Voici un navigateur. Allez sur le site de la médiathèque en tapant son adresse : <code class="mono">${MED}</code>`,
          help: "Cliquez dans la grande barre en haut (la barre d'adresse), tapez l'adresse, puis appuyez sur la touche Entrée." });
        const tasks = [{ label: "Cliquez dans la <b>barre d'adresse</b>, tout en haut." }, { label: `Tapez <code class="mono">${MED}</code> puis appuyez sur <kbd>Entrée</kbd>.` }];
        const draw = () => { f.panel.innerHTML = tasksHTML(tasks); };
        draw();
        mount(ctx, f.host, { onEvent: (type, d, c) => {
          if (type === "addressEdit") { tasks[0].done = true; draw(); }
          if (type === "navigate" && d.from === "address" && !d.found) {
            G.ko("type_addr", "Taper l'adresse exacte du site", "Une seule lettre fausse, et le site est introuvable.");
            c.flash(`🦖 Site introuvable. ${urlHint(MED, d.url)}`, "warn", 9000);
          }
          if (type === "search" && d.from === "engine" && !G.has("type_addr")) {
            c.flash("Vous avez écrit dans la case de recherche du <b>site</b> Cherchetout. La <b>barre d'adresse</b>, c'est la longue barre <b>tout en haut</b> du navigateur, à côté des flèches.", "info", 9000);
          }
          if (type === "search" && d.from === "address" && !G.has("type_addr")) {
            c.flash("🔎 Vous avez tapé des <b>mots</b> : le navigateur a lancé une <b>recherche</b>. Ça marche aussi ! Mais ici, entraînons-nous à taper <b>l'adresse exacte</b>. Cliquez à nouveau dans la barre d'adresse.", "info", 9000);
          }
          if (type === "navigate" && onHost(d.url, MED)) {
            if (d.from === "address") G.ok("type_addr", "Taper l'adresse exacte du site");
            else G.ko("type_addr", "Taper l'adresse exacte du site", "On peut passer par une recherche, mais connaître la barre d'adresse permet d'aller directement sur le bon site.");
            tasks[0].done = tasks[1].done = true; draw();
            c.flash("✅ Vous êtes sur le site de la médiathèque !", "good", 2500);
            later(ctx, () => ctx.go(1), 1200);
          }
        } });
        return;
      }

      if (step === 1) {
        const f = frame(ctx, { level: 1, title: "Trouver une information sur un site", step: 1,
          consigne: "Sur le site de la médiathèque, trouvez les <b>horaires d'ouverture</b>.",
          help: "Regardez le menu en haut du site (la bande violette) : chaque mot est un lien." });
        f.panel.innerHTML = tasksHTML([{ label: "Cliquez sur <b>Horaires</b> dans le menu du site." }]);
        let asked = false;
        mount(ctx, f.host, { start: MED, onEvent: (type, d) => {
          if (type === "navigate" && is(d.url, MED + "/horaires") && !asked) {
            asked = true;
            G.ok("menu", "Utiliser le menu d'un site");
            f.panel.innerHTML = tasksHTML([{ label: "Cliquez sur <b>Horaires</b> dans le menu du site.", done: true }]) + `<div class="mk-q-slot"></div>`;
            quiz(f.panel.querySelector(".mk-q-slot"), { G, key: "hours", questions: [
              { q: "Le <b>samedi</b>, la médiathèque est ouverte…", choices: ["de 10 h à 17 h", "de 14 h à 19 h", "elle est fermée"], ok: 0, why: "Le tableau indique : Samedi, 10 h – 17 h." },
              { q: "Quels jours est-elle <b>fermée</b> ?", choices: ["Le mercredi et le jeudi", "Le lundi et le dimanche", "Seulement le dimanche"], ok: 1, why: "Le tableau indique « Fermé » le lundi et le dimanche." }
            ], onDone: () => ctx.go(2) });
          }
        } });
        return;
      }

      if (step === 2) {
        const f = frame(ctx, { level: 1, title: "Passer d'un site à l'autre", step: 2,
          consigne: "Depuis le site de la médiathèque, allez sur le site de la <b>mairie</b> en cliquant sur un lien.",
          help: "Un lien est souvent souligné ou en couleur. Quand la souris passe dessus, l'adresse s'affiche en bas du navigateur." });
        const tasks = [{ label: "Ouvrez la page <b>Liens utiles</b> de la médiathèque." }, { label: "Cliquez sur le lien vers le <b>site de la mairie</b>." }];
        f.panel.innerHTML = tasksHTML(tasks);
        let asked = false;
        mount(ctx, f.host, { start: MED, onEvent: (type, d) => {
          if (type === "navigate" && is(d.url, MED + "/liens")) { tasks[0].done = true; f.panel.innerHTML = tasksHTML(tasks); }
          if (type === "navigate" && onHost(d.url, MAIRIE) && !asked) {
            asked = true; tasks[0].done = tasks[1].done = true;
            (d.from === "link" ? G.ok : G.ko)("link", "Suivre un lien vers un autre site", "Ici, il fallait cliquer sur le lien de la page « Liens utiles ».");
            f.panel.innerHTML = tasksHTML(tasks) + `<div class="mk-q-slot"></div>`;
            quiz(f.panel.querySelector(".mk-q-slot"), { G, key: "where", questions: [
              { q: "Regardez la barre d'adresse : sur quel site êtes-vous maintenant ?", choices: ["mediatheque-valbourg.fr", "mairie-valbourg.fr", "cherchetout.fr"], ok: 1, why: "La barre d'adresse affiche en gras le vrai nom du site : <b>mairie-valbourg.fr</b>. Elle dit toujours où l'on est." }
            ], onDone: () => finish(ctx, G, { key: "nav_open", label: "Je sais ouvrir un site et suivre un lien", intro: "Vous savez taper une adresse, utiliser le menu d'un site et passer d'un site à l'autre." }) });
          }
        } });
        return;
      }
      ctx.finalScreen({ theme: null });
    }
  });

  /* =========================================================
     NIVEAU 2 — Les boutons du navigateur
     ========================================================= */
  R("nav_buttons", {
    steps: 3,
    render(ctx) {
      const step = ctx.m.step || 0, L = ctx.local, G = grader(L);

      if (step === 0) {
        const f = frame(ctx, { level: 2, title: "Précédent, suivant, actualiser", step: 0,
          consigne: "Les flèches en haut à gauche permettent de <b>revenir en arrière</b> ou d'<b>aller en avant</b>, comme les pages d'un livre.",
          help: "← = page précédente · → = page suivante · ⟳ = actualiser (recharger la page)." });
        const tasks = [
          { id: "agenda", label: "Cliquez sur <b>Agenda</b> dans le menu du site." },
          { id: "back", label: "Revenez à la page d'avant avec la flèche <b>←</b> (en haut à gauche)." },
          { id: "forward", label: "Retournez sur l'agenda avec la flèche <b>→</b>." },
          { id: "reload", label: "L'agenda vient d'être mis à jour : <b>actualisez</b> la page avec <b>⟳</b>." }
        ];
        const T = id => tasks.find(t => t.id === id);
        const draw = (extra = "") => { f.panel.innerHTML = tasksHTML(tasks) + extra; };
        draw();
        let asked = false;
        mount(ctx, f.host, { start: MED, onEvent: (type, d, c) => {
          if (type === "navigate" && is(d.url, MED + "/agenda")) { T("agenda").done = true; draw(); }
          if (type === "navigate" && is(d.url, MED) && T("agenda").done && !T("back").done && d.from === "link") c.flash("Ça marche aussi en cliquant sur « Accueil » ! Mais essayez la flèche <b>←</b> : elle fonctionne sur <b>tous</b> les sites.", "info", 6000);
          if (type === "back" && T("agenda").done) { T("back").done = true; G.ok("back", "Revenir en arrière avec ←"); draw(); }
          if (type === "forward" && T("back").done) { T("forward").done = true; G.ok("forward", "Aller en avant avec →"); draw(); }
          if (type === "reload") {
            if (!is(d.url, MED + "/agenda")) { c.flash("Allez d'abord sur la page <b>Agenda</b>, puis actualisez.", "info", 4000); return; }
            T("reload").done = true; T("agenda").done = true; G.ok("reload", "Actualiser une page avec ⟳");
            if (!T("back").done) G.ko("back", "Revenir en arrière avec ←", "La flèche ← ramène à la page précédente.");
            if (!T("forward").done) G.ko("forward", "Aller en avant avec →", "La flèche → refait le chemin dans l'autre sens.");
            T("back").done = T("forward").done = true;
            if (asked) return; asked = true;
            draw(`<div class="mk-q-slot"></div>`);
            quiz(f.panel.querySelector(".mk-q-slot"), { G, key: "new", questions: [
              { q: "Quelle nouveauté est apparue en actualisant ?", choices: ["Un club de lecture", "Un atelier « Ma tablette » vendredi à 15 h", "Rien n'a changé"], ok: 1, why: "Actualiser recharge la page : on voit la toute dernière version. Ici : l'atelier « Ma tablette » vendredi à 15 h." }
            ], onDone: () => ctx.go(1) });
          }
        } });
        return;
      }

      if (step === 1) {
        const f = frame(ctx, { level: 2, title: "Les onglets", step: 1,
          consigne: "Un <b>onglet</b>, c'est comme un intercalaire dans un classeur : plusieurs sites ouverts en même temps, dans la même fenêtre.",
          help: "Le bouton ＋ est à droite des onglets. Pour fermer un onglet : la petite croix ✕ sur l'onglet." });
        const tasks = [
          { id: "new", label: "Ouvrez un <b>nouvel onglet</b> avec le bouton <b>＋</b>." },
          { id: "mairie", label: `Dans ce nouvel onglet, tapez l'adresse <code class="mono">${MAIRIE}</code> et appuyez sur <kbd>Entrée</kbd>.` },
          { id: "switch", label: "Revenez sur l'onglet de la <b>médiathèque</b> en cliquant dessus." },
          { id: "close", label: "Fermez l'onglet de la <b>mairie</b> avec sa croix <b>✕</b>." }
        ];
        const T = id => tasks.find(t => t.id === id);
        const draw = () => { f.panel.innerHTML = tasksHTML(tasks); };
        draw();
        mount(ctx, f.host, { start: MED, onEvent: (type, d, c) => {
          if (type === "tabNew" && !T("new").done) { T("new").done = true; G.ok("tab_new", "Ouvrir un nouvel onglet"); draw(); }
          if (type === "navigate" && onHost(d.url, MAIRIE)) {
            if (c.st.active === 0 && !T("new").done) { c.flash("Vous êtes allé sur la mairie <b>dans le même onglet</b> : la médiathèque a disparu. Cliquez sur <b>←</b> pour revenir, puis ouvrez un <b>nouvel onglet ＋</b>.", "warn", 8000); G.ko("tab_new", "Ouvrir un nouvel onglet", "Sans nouvel onglet, le nouveau site remplace l'ancien."); return; }
            T("mairie").done = true; draw();
          }
          if (type === "navigate" && d.from === "address" && !d.found) c.flash(`🦖 Site introuvable. ${urlHint(MAIRIE, d.url)}`, "warn", 8000);
          if (type === "tabSwitch" && onHost(d.url, MED) && T("mairie").done) { T("switch").done = true; G.ok("tab_switch", "Passer d'un onglet à l'autre"); draw(); }
          if (type === "tabClose") {
            if (onHost(d.url, MAIRIE) && T("mairie").done) {
              T("close").done = true; G.ok("tab_close", "Fermer un onglet");
              if (!T("switch").done) G.ko("tab_switch", "Passer d'un onglet à l'autre", "On clique simplement sur l'onglet pour l'afficher.");
              T("switch").done = true; draw();
              c.flash("✅ Bravo ! La médiathèque est restée ouverte.", "good", 2500);
              later(ctx, () => ctx.go(2), 1400);
            } else if (onHost(d.url, MED)) {
              G.ko("tab_close", "Fermer un onglet", "Chaque onglet a sa propre croix : on regarde bien le nom de l'onglet avant de fermer.");
              if (d.last) c.press("reopen");
              c.newTab(MED, "reopen");
              c.flash("Oups, c'était l'onglet de la <b>médiathèque</b> ! Pas grave : je l'ai rouvert. Regardez bien le <b>nom sur l'onglet</b> avant de cliquer sur sa croix.", "warn", 8000);
            }
          }
        } });
        return;
      }

      if (step === 2) {
        const f = frame(ctx, { level: 2, title: "Les favoris", step: 2,
          consigne: "Les <b>favoris</b> gardent l'adresse d'un site qu'on aime : un clic, et on y retourne, sans rien taper.",
          help: "L'étoile ☆ est au bout de la barre d'adresse. Les favoris s'affichent juste en dessous." });
        const tasks = [
          { id: "star", label: "Ajoutez la médiathèque à vos favoris en cliquant sur l'étoile <b>☆</b>." },
          { id: "leave", label: `Allez sur le site de la mairie : <code class="mono">${MAIRIE}</code>` },
          { id: "fav", label: "Revenez à la médiathèque en un clic, grâce à votre <b>favori</b>." }
        ];
        const T = id => tasks.find(t => t.id === id);
        const draw = (x = "") => { f.panel.innerHTML = tasksHTML(tasks) + x; };
        draw();
        mount(ctx, f.host, { start: MED, onEvent: (type, d, c) => {
          if (type === "favAdd" && onHost(d.url, MED)) { T("star").done = true; G.ok("fav_add", "Ajouter un site aux favoris"); draw(); }
          if (type === "navigate" && onHost(d.url, MAIRIE) && T("star").done) { T("leave").done = true; draw(); }
          if (type === "navigate" && d.from === "address" && !d.found) c.flash(`🦖 Site introuvable. ${urlHint(MAIRIE, d.url)}`, "warn", 8000);
          if (type === "favOpen" && onHost(d.url, MED) && T("leave").done && !T("fav").done) {
            T("fav").done = true; G.ok("fav_open", "Ouvrir un favori"); draw(`<div class="mk-q-slot"></div>`);
            quiz(f.panel.querySelector(".mk-q-slot"), { G, key: "recap", questions: [
              { q: "Pour revenir à la <b>page d'avant</b>, je clique sur…", choices: ["← la flèche", "✕ la croix", "⟳ actualiser"], ok: 0, why: "La flèche ← revient à la page précédente. La croix ✕, elle, ferme l'onglet !" },
              { q: "Je veux ouvrir un <b>deuxième site</b> sans fermer le premier :", choices: ["Je tape la nouvelle adresse par-dessus", "J'ouvre un nouvel onglet ＋", "J'éteins et je rallume"], ok: 1, why: "Un nouvel onglet ＋ garde le premier site ouvert à côté." },
              { q: "La page ne s'affiche pas bien, ou elle n'est pas à jour :", choices: ["⟳ J'actualise la page", "J'ajoute la page aux favoris", "Je ferme le navigateur"], ok: 0, why: "Actualiser ⟳ recharge la page. C'est le premier réflexe quand une page « bloque »." }
            ], onDone: () => finish(ctx, G, { key: "nav_buttons", label: "Je maîtrise les boutons du navigateur", intro: "Vous savez utiliser les flèches, actualiser, ouvrir et fermer des onglets, et garder un site en favori." }) });
          }
        } });
        return;
      }
      ctx.finalScreen({ theme: null });
    }
  });

  /* =========================================================
     NIVEAU 3 — Faire une recherche
     ========================================================= */
  const words = q => String(q || "").normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
  R("nav_search", {
    steps: 3,
    render(ctx) {
      const step = ctx.m.step || 0, L = ctx.local, G = grader(L);

      if (step === 0) {
        const f = frame(ctx, { level: 3, title: "Choisir ses mots-clés", step: 0, noClient: true,
          consigne: "Un moteur de recherche fonctionne avec des <b>mots-clés</b> : quelques mots importants, pas besoin de faire une phrase." });
        quiz(f.panel, { G, key: "kw", title: `<div class="alert good">💡 La recette : <b>quoi</b> + <b>où</b> (+ <b>quand</b>). Exemple : <b>horaires piscine Valbourg</b></div>`, questions: [
          { q: "Vous cherchez les horaires de la <b>piscine de Valbourg</b>. Quelle est la meilleure recherche ?", choices: ["Bonjour, je voudrais savoir à quelle heure ouvre la piscine s'il vous plaît", "horaires piscine Valbourg", "piscine"], ok: 1, why: "Les mots importants suffisent : <b>horaires</b> (quoi), <b>piscine</b>, <b>Valbourg</b> (où). « piscine » tout seul donnerait des piscines du monde entier." },
          { q: "Vous voulez une <b>recette de soupe de potiron</b>. Quelle recherche ?", choices: ["recette soupe potiron", "soupe", "comment on fait à manger"], ok: 0, why: "<b>recette soupe potiron</b> : trois mots précis, et le moteur trouve exactement ce qu'il faut." },
          { q: "Faut-il mettre les accents et les majuscules ?", choices: ["Oui, sinon ça ne marche pas", "Ce n'est pas obligatoire : le moteur comprend quand même", "Il faut tout écrire en MAJUSCULES"], ok: 1, why: "Le moteur de recherche est tolérant : « dechetterie » ou « Déchetterie » donnent les mêmes résultats. (Ce n'est pas le cas des <b>adresses</b> de sites, qui doivent être exactes !)" }
        ], onDone: () => ctx.go(1) });
        return;
      }

      const searchStep = ({ title, consigne, need, target, ad, qs, next, key }) => {
        const f = frame(ctx, { level: 3, title, step, consigne,
          help: "Tapez vos mots-clés dans la case de Cherchetout, puis appuyez sur Entrée. Lisez ensuite les résultats avant de cliquer." });
        const tasks = [{ label: "Faites une <b>recherche</b> avec quelques mots-clés." }, { label: "Ouvrez le résultat qui <b>répond à la question</b>." }];
        const draw = (x = "") => { f.panel.innerHTML = tasksHTML(tasks) + x; };
        draw();
        let asked = false;
        mount(ctx, f.host, { onEvent: (type, d, c) => {
          if (type === "search") {
            const q = words(d.q), ok = need.every(w => q.includes(w));
            tasks[0].done = true; draw();
            if (ok) { G.ok(key + "_q", "Choisir de bons mots-clés"); if (q.split(/\s+/).length > 6) c.flash("✅ Ça marche ! Astuce : pas besoin de phrase, <b>3 ou 4 mots</b> suffisent.", "info", 5000); }
            else { G.ko(key + "_q", "Choisir de bons mots-clés", `Il fallait les mots importants, par exemple : « ${need.join(" ")} Valbourg ».`); c.flash(`Hmm, pensez aux mots importants : <b>${need.join(" ")}</b>… et la ville !`, "warn", 6000); }
          }
          if (type === "navigate" && ad && onHost(d.url, host(ad))) {
            G.ko(key + "_res", "Ouvrir le bon résultat", "Le premier résultat était une annonce « Sponsorisé » : une publicité, pas la réponse à la question.");
            c.flash("💶 C'est une <b>publicité</b> (regardez : « Sponsorisé » au-dessus du résultat). Revenez en arrière avec <b>←</b> et choisissez un autre résultat.", "warn", 9000);
          }
          if (type === "navigate" && is(d.url, target) && !asked) {
            asked = true; tasks[1].done = true;
            G.ok(key + "_res", "Ouvrir le bon résultat");
            draw(`<div class="mk-q-slot"></div>`);
            quiz(f.panel.querySelector(".mk-q-slot"), { G, key, questions: qs, onDone: next });
          }
        } });
      };

      if (step === 1) return searchStep({ key: "pharma", title: "Trouver la pharmacie de garde", consigne: "Nous sommes dimanche. Cherchez quelle <b>pharmacie de garde</b> est ouverte à Valbourg.",
        need: ["pharmacie", "garde"], target: MAIRIE + "/pharmacies-de-garde", ad: "www.pharma-promo-valbourg.com",
        qs: [{ q: "Quelle pharmacie est de garde <b>ce dimanche</b> ?", choices: ["Pharmacie du Centre", "Pharmacie des Tilleuls", "Pharma Promo"], ok: 1, why: "La page de la mairie indique : ce dimanche, <b>Pharmacie des Tilleuls</b>, 8 place du Marché." },
             { q: "Et la nuit, quel numéro appeler ?", choices: ["Le 3237", "Le 17", "Le numéro de la mairie"], ok: 0, why: "Le <b>3237</b> donne la pharmacie de garde la plus proche." }],
        next: () => ctx.go(2) });
      if (step === 2) return searchStep({ key: "dech", title: "Les horaires de la déchetterie", consigne: "Vous voulez apporter un vieux meuble samedi. Cherchez les <b>horaires de la déchetterie</b> de Valbourg.",
        need: ["dech"], target: MAIRIE + "/dechetterie",
        qs: [{ q: "Le <b>samedi</b>, la déchetterie est ouverte…", choices: ["de 14 h à 18 h seulement", "de 9 h à 12 h et de 14 h à 18 h", "elle est fermée"], ok: 1, why: "Samedi : 9 h – 12 h et 14 h – 18 h." }],
        next: () => finish(ctx, G, { key: "nav_search", label: "Je sais faire une recherche sur Internet", intro: "Vous savez choisir vos mots-clés, lancer une recherche et ouvrir le résultat qui répond à votre question." }) });
      ctx.finalScreen({ theme: null });
    }
  });

  /* =========================================================
     NIVEAU 4 — Choisir le bon résultat (annonces, intermédiaires payants)
     ========================================================= */
  const AD_WHY = "Les résultats marqués « Sponsorisé » sont des publicités : des entreprises paient pour être en haut. Pour une démarche administrative, ce sont souvent des intermédiaires payants.";
  R("nav_results", {
    steps: 3,
    render(ctx) {
      const step = ctx.m.step || 0, L = ctx.local, G = grader(L);

      if (step === 0) {
        const f = frame(ctx, { level: 4, title: "Trouver le site officiel", step: 0,
          consigne: "Vous devez renouveler votre <b>passeport</b>. La recherche est faite : ouvrez le <b>site officiel</b> pour faire la pré-demande (elle est <b>gratuite</b>).",
          help: "Lisez au-dessus de chaque résultat : le mot « Sponsorisé » et le nom du site. Les sites de l'État finissent par .gouv.fr" });
        f.panel.innerHTML = tasksHTML([{ label: "Ouvrez le site officiel de la pré-demande de passeport." }]);
        mount(ctx, f.host, { start: `${B().RESULTS}?q=renouveler passeport`, onEvent: (type, d, c) => {
          if (type !== "navigate") return;
          const u = d.url;
          if (onHost(u, "www.passeport-express-valbourg.com") || onHost(u, "www.mes-papiers-facile-valbourg.fr")) {
            G.ko("official", "Ouvrir le site officiel", AD_WHY);
            c.flash(`💶 Ce site fait <b>payer</b> une démarche gratuite ! C'était une annonce <b>« Sponsorisé »</b>. Revenez avec <b>←</b>.`, "bad", 9000);
          } else if (onHost(u, "www.forum-entraide-valbourg.net")) {
            G.ko("official", "Ouvrir le site officiel", "Un forum, ce sont des avis de particuliers : utile parfois, mais pas pour faire une démarche.");
            c.flash("💬 Un <b>forum</b> : des avis de particuliers, pas le site officiel. Revenez avec <b>←</b>.", "warn", 8000);
          } else if (onHost(u, "www.service-public.fr")) {
            c.flash("✅ <b>service-public.fr</b> est un site officiel de l'administration. Il vous explique tout… et vous envoie sur <b>ants.gouv.fr</b> : cliquez sur le bouton !", "good", 9000);
          } else if (onHost(u, "passeport.ants.gouv.fr")) {
            G.ok("official", "Ouvrir le site officiel");
            f.panel.innerHTML = tasksHTML([{ label: "Ouvrez le site officiel de la pré-demande de passeport.", done: true }]);
            c.flash("✅ Le vrai site : <b>ants.gouv.fr</b>. La pré-demande y est gratuite.", "good", 3000);
            later(ctx, () => ctx.go(1), 1600);
          }
        } });
        return;
      }

      if (step === 1) {
        const f = frame(ctx, { level: 4, title: "Annonce ou site officiel ?", step: 1, noClient: true,
          consigne: "Pour chaque résultat, dites ce que c'est. Regardez bien : le mot « Sponsorisé » et le <b>nom du site</b>." });
        const card = url => { const e = INDEX.find(x => x.url === url); return `<div class="ct-results">${B().resultHTML(e)}</div>`; };
        const C = ["📢 Une annonce (publicité)", "🇫🇷 Le site officiel", "💬 L'avis de particuliers"];
        quiz(f.panel, { G, key: "kind", questions: [
          { q: `Ce résultat, c'est… ${card("www.mes-papiers-facile-valbourg.fr")}`, choices: C, ok: 0, why: "« Sponsorisé » : une entreprise a payé pour être là. Ici, 39,90 € pour une démarche gratuite !" },
          { q: `Et celui-ci ? ${card("passeport.ants.gouv.fr")}`, choices: C, ok: 1, why: "<b>ants.gouv.fr</b> : la fin <b>.gouv.fr</b> est réservée à l'État." },
          { q: `Et celui-ci ? ${card("www.forum-entraide-valbourg.net/passeport")}`, choices: C, ok: 2, why: "Un forum : des particuliers donnent leur avis. Parfois utile, jamais pour une démarche." },
          { q: `Et celui-ci ? ${card("www.rdv-mairie-rapide-valbourg.com")}`, choices: C, ok: 0, why: "« Sponsorisé » et 29 € : la mairie, elle, ne fait jamais payer un rendez-vous." }
        ], onDone: () => ctx.go(2) });
        return;
      }

      if (step === 2) {
        const f = frame(ctx, { level: 4, title: "À vous de chercher", step: 2,
          consigne: "Prenez <b>rendez-vous à la mairie de Valbourg</b> pour une carte d'identité : faites la recherche, choisissez le bon site, puis un créneau.",
          help: "Mots-clés possibles : rendez-vous carte identité Valbourg. Puis évitez les annonces « Sponsorisé »." });
        const tasks = [{ label: "Faites la recherche." }, { label: "Ouvrez le site <b>officiel</b> de la mairie." }, { label: "Choisissez un créneau." }];
        const draw = () => { f.panel.innerHTML = tasksHTML(tasks); };
        draw();
        mount(ctx, f.host, { onEvent: (type, d, c) => {
          if (type === "search") { tasks[0].done = true; draw(); }
          if (type === "navigate" && onHost(d.url, "www.rdv-mairie-rapide-valbourg.com")) {
            G.ko("rdv_site", "Choisir le site officiel de la mairie", AD_WHY);
            c.flash("💶 29 € pour un rendez-vous gratuit ! C'était une annonce « Sponsorisé ». Revenez avec <b>←</b>.", "bad", 9000);
          }
          if (type === "navigate" && onHost(d.url, MAIRIE)) {
            if (!tasks[1].done) G.ok("rdv_site", "Choisir le site officiel de la mairie");
            tasks[0].done = tasks[1].done = true; draw();
            if (!is(d.url, MAIRIE + "/rendez-vous")) c.flash("Vous êtes sur le site de la mairie ✅. Trouvez maintenant la page des <b>rendez-vous</b> (rubrique Démarches).", "info", 6000);
          }
          if (type === "action" && d.name === "slot") {
            c.tab.flags.slot = d.el.dataset.slot; c.render();
            tasks[2].done = true; draw(); G.ok("rdv_slot", "Prendre rendez-vous en ligne");
            later(ctx, () => finish(ctx, G, { key: "nav_results", label: "Je sais choisir le bon résultat et éviter les annonces", intro: "Vous savez repérer les annonces « Sponsorisé », reconnaître un site officiel et éviter les intermédiaires payants." }), 1800);
          }
        } });
        return;
      }
      ctx.finalScreen({ theme: null });
    }
  });

  /* =========================================================
     NIVEAU 5 — Vrai ou faux site ?
     ========================================================= */
  const CLUES = {
    adresse: { label: "L'adresse : impots-gouv-remboursement.com", why: "Le vrai site des impôts est <b>impots.gouv.fr</b>. Ici, le vrai nom (en gras) est impots-gouv-remboursement<b>.com</b>." },
    nonsecure: { label: "« Non sécurisé » devant l'adresse", why: "Le navigateur prévient : ce que vous tapez n'est pas protégé. Aucun site officiel n'est comme ça." },
    logo: { label: "« République Françoise » : un faux logo", why: "Une faute dans le nom même de la République : un site officiel ne ferait jamais ça." },
    faute: { label: "Des fautes d'orthographe", why: "« Vous ête éligible a… » : les faux sites sont souvent mal écrits." },
    urgence: { label: "Un compte à rebours pour vous presser", why: "« Expire dans 14:59 » : l'urgence sert à vous empêcher de réfléchir." },
    carte: { label: "On demande la carte bancaire et le code au dos", why: "Pour un remboursement, on ne vous demande jamais votre carte bancaire." }
  };
  const VOTES = [
    { url: "www.ameli.fr", real: true, why: "Le vrai nom est <b>ameli.fr</b> : c'est bien le site de l'Assurance Maladie. Et il ne demande rien d'urgent." },
    { url: "www.ameli-remboursement.info", real: false, why: "Il y a un cadenas 🔒… mais le vrai nom est <b>ameli-remboursement.info</b>, pas ameli.fr. Et on demande la carte bancaire : c'est un faux." },
    { url: MED, real: true, why: "<b>mediatheque-valbourg.fr</b> : le site de la médiathèque, que vous connaissez. Rien n'est demandé." },
    { url: "www.colis-suivi-valbourg.top", real: false, why: "« Non sécurisé », une adresse en <b>.top</b>, des frais et un code SMS : c'est une arnaque au colis." }
  ];
  R("nav_fakesite", {
    steps: 3,
    render(ctx) {
      const step = ctx.m.step || 0, L = ctx.local, G = grader(L);

      if (step === 0) {
        const ids = Object.keys(CLUES);
        L.found ||= new Set();
        const f = frame(ctx, { level: 5, title: "L'enquête : trouvez les 6 indices", step: 0,
          consigne: "Ce site prétend être celui des impôts. Cliquez sur tout ce qui vous paraît <b>suspect</b> : dans la page, mais aussi <b>en haut, dans la barre d'adresse</b>.",
          help: "Regardez : le nom du site (en gras dans la barre d'adresse), ce qui est écrit juste devant, le logo, l'orthographe, ce qu'on vous presse de faire, ce qu'on vous demande." });
        const draw = (last) => {
          f.panel.innerHTML = `<div class="mk-spot-count"><b>${L.found.size}</b> / ${ids.length} indices trouvés · <button type="button" class="secondary" data-done>J'ai fini ✔</button></div>
            ${last ? `<div class="alert good">🔍 Bien vu : <b>${CLUES[last].label}</b>. ${CLUES[last].why}</div>` : ""}`;
          f.panel.querySelector("[data-done]").addEventListener("click", end);
        };
        const found = id => {
          if (L.found.has(id)) return;
          L.found.add(id); draw(id); mark();
          if (L.found.size === ids.length) later(ctx, end, 1500);
        };
        const end = () => {
          if (L.ended) return; L.ended = true;
          ids.forEach(id => (L.found.has(id) ? G.ok : G.ko)("clue_" + id, CLUES[id].label, CLUES[id].why.replace(/<[^>]+>/g, "")));
          ctx.go(1);
        };
        draw();
        // les indices trouvés restent entourés, même quand le navigateur se redessine
        const mark = () => L.found.forEach(id => f.host.querySelector(`[data-clue="${id}"]`)?.classList.add("found"));
        mount(ctx, f.host, { start: "www.impots-gouv-remboursement.com/dossier", features: { tabs: false, favorites: false }, onEvent: (type, d, cl) => {
          if (type === "addressEdit") { found("adresse"); setTimeout(() => { cl.st.editing = false; cl.render(); mark(); }, 50); }
          if (type === "lock") found(d.secure ? "adresse" : "nonsecure");
          setTimeout(mark, 0);
        } });
        mark();
        f.host.addEventListener("click", e => {
          const z = e.target.closest("[data-clue]");
          if (z) found(z.dataset.clue);
          setTimeout(mark, 0);
        });
        return;
      }

      if (step === 1) {
        L.vi ||= 0;
        const v = VOTES[L.vi];
        const f = frame(ctx, { level: 5, title: "Vrai ou faux site ?", step: 1,
          consigne: `Site ${L.vi + 1} sur ${VOTES.length} : regardez la barre d'adresse et la page. Vrai site ou faux site ?`,
          help: "Lisez le vrai nom du site, en gras dans la barre d'adresse. Le cadenas 🔒 ne suffit pas !" });
        f.panel.innerHTML = `<div class="choice-stack mk-quiz inline"><button type="button" class="secondary" data-v="1">✅ Vrai site</button><button type="button" class="secondary" data-v="0">🚩 Faux site</button></div><div class="mk-fb"></div>`;
        f.panel.querySelectorAll("[data-v]").forEach(b => b.addEventListener("click", () => {
          const good = (b.dataset.v === "1") === v.real;
          (good ? G.ok : G.ko)("vote_" + L.vi, `${B().realName(v.url)} : ${v.real ? "vrai site" : "faux site"}`, v.why.replace(/<[^>]+>/g, ""));
          f.panel.querySelectorAll("[data-v]").forEach(x => { x.disabled = true; if ((x.dataset.v === "1") === v.real) x.classList.add("right"); else if (x === b) x.classList.add("wrong"); });
          f.panel.querySelector(".mk-fb").innerHTML = `<div class="alert ${good ? "good" : "bad"}">${good ? "✅ Exact ! " : "❌ Pas tout à fait. "}${v.why}</div><button type="button" class="primary" data-next>${L.vi + 1 < VOTES.length ? "Site suivant →" : "Continuer →"}</button>`;
          f.panel.querySelector("[data-next]").addEventListener("click", () => { L.vi++; if (L.vi < VOTES.length) ctx.render(); else ctx.go(2); });
        }));
        mount(ctx, f.host, { start: v.url, features: { tabs: false, favorites: false } });
        return;
      }

      if (step === 2) {
        const f = frame(ctx, { level: 5, title: "Le cadenas 🔒", step: 2, noClient: true,
          consigne: "Le cadenas veut dire « connexion <b>chiffrée</b> » : ce que vous tapez voyage sous enveloppe fermée. Mais il ne dit <b>pas</b> si le site est honnête." });
        quiz(f.panel, { G, key: "lock", questions: [
          { q: "Un site a un cadenas 🔒. Cela veut dire…", choices: ["Que le site est officiel et sans danger", "Que la connexion est chiffrée, rien de plus", "Que la police a vérifié le site"], ok: 1, why: "Le cadenas protège le <b>trajet</b> des informations. Les escrocs peuvent en avoir un aussi : il faut toujours lire le vrai nom du site." },
          { q: "Devant l'adresse, il est écrit « ⚠️ Non sécurisé ». Je peux…", choices: ["Taper ma carte bancaire, si le site est joli", "Lire la page, mais ne rien taper de personnel", "Rien du tout, mon ordinateur est infecté"], ok: 1, why: "Lire n'est pas dangereux. Mais on n'y tape <b>jamais</b> de mot de passe ni de carte bancaire." },
          { q: "Le meilleur indice pour savoir où je suis, c'est…", choices: ["Le logo et les couleurs du site", "Le vrai nom du site, juste avant le premier « / »", "Le nombre de publicités"], ok: 1, why: "Un logo se copie en deux secondes. Le <b>vrai nom</b> du site, lui, ne ment pas : impots<b>.gouv.fr</b> ✅ — impots-gouv-remboursement<b>.com</b> ❌." }
        ], onDone: () => finish(ctx, G, { key: "nav_fakesite", label: "Je sais reconnaître un faux site", intro: "Vous savez lire le vrai nom d'un site, interpréter le cadenas et repérer les indices d'un faux site." }) });
        return;
      }
      ctx.finalScreen({ theme: null });
    }
  });

  /* =========================================================
     NIVEAU 6 — Fausse alerte, cookies et fenêtres surgissantes
     ========================================================= */
  R("nav_alert", {
    steps: 3,
    render(ctx) {
      const step = ctx.m.step || 0, L = ctx.local, G = grader(L);

      if (step === 0) {
        const f = frame(ctx, { level: 6, title: "La fausse alerte virus", step: 0,
          consigne: "Vous cherchez une recette de tarte aux pommes… Cliquez sur <b>« Voir la recette »</b>. Et s'il se passe quelque chose d'inquiétant : <b>pas de panique</b>, on va voir ensemble quoi faire.",
          help: "La touche Échap (Esc) est tout en haut à gauche du clavier." });
        const tasks = [{ id: "open", label: "Cliquez sur « Voir la recette de la tarte aux pommes »." }];
        const T = id => tasks.find(t => t.id === id);
        const draw = (x = "") => { f.panel.innerHTML = tasksHTML(tasks) + x; };
        draw();
        let helpTimer = null;
        ctx.onCleanup(() => clearTimeout(helpTimer));
        mount(ctx, f.host, { start: "www.recettes-de-mamie.fr", onEvent: (type, d, c) => {
          if (type === "tabNew" && onHost(d.url, host(FAKE_ALERT)) && !T("esc")) {
            T("open").done = true;
            tasks.push({ id: "esc", label: "😮‍💨 Respirez : c'est une <b>fausse alerte</b>, une simple page web. Appuyez sur la touche <kbd>Échap</kbd> pour quitter le plein écran." },
              { id: "close", label: "Fermez cet onglet avec sa croix <b>✕</b>." });
            draw(`<div class="alert good">🫶 Votre ordinateur n'a <b>rien</b>. C'est une page qui fait peur pour que vous appeliez de faux techniciens. <b>Ne cliquez pas dedans, n'appelez pas.</b></div>`);
            helpTimer = setTimeout(() => { if (!T("esc").done) c.flash("💡 La touche <kbd>Échap</kbd> (parfois écrite <kbd>Esc</kbd>) est <b>tout en haut à gauche</b> du clavier.", "info", 9000); }, 20000);
          }
          if (type === "action" && ["call", "scan", "ok"].includes(d.name)) {
            G.ko("no_click", "Ne pas cliquer dans la fausse alerte", "Les boutons de la fausse alerte peuvent ouvrir d'autres pages ou lancer un téléchargement. On ne touche à rien : Échap, puis on ferme l'onglet.");
            c.flash({ call: "📞 <b>N'appelez jamais</b> ce numéro : au bout du fil, un escroc veut prendre le contrôle de votre ordinateur, ou vous faire payer un faux dépannage.", scan: "🙅 Ce bouton ne fait aucune analyse : il peut vous faire télécharger un vrai programme dangereux. On ne clique pas.", ok: "🙅 Même « OK » : on ne clique sur rien dans la page. Appuyez plutôt sur <kbd>Échap</kbd>." }[d.name], "bad", 9000);
          }
          if (type === "escape" && T("esc")) { T("esc").done = true; G.ok("esc", "Quitter le plein écran avec Échap"); draw(); c.flash("✅ La barre du navigateur est revenue. Fermez maintenant l'onglet de l'alerte avec sa <b>✕</b>.", "good", 6000); }
          if (type === "tabClose" && onHost(d.url, host(FAKE_ALERT))) {
            if (!T("esc").done) { T("esc").done = true; G.ko("esc", "Quitter le plein écran avec Échap", "Échap fait sortir du plein écran : la barre du navigateur et la croix de l'onglet réapparaissent."); }
            T("close").done = true; G.ok("no_click", "Ne pas cliquer dans la fausse alerte"); G.ok("close", "Fermer l'onglet de la fausse alerte"); draw();
            c.flash("✅ Envolée ! Votre ordinateur n'a jamais rien eu.", "good", 3000);
            later(ctx, () => ctx.go(1), 1600);
          }
          if (type === "allClosed") { G.ok("close", "Fermer l'onglet de la fausse alerte"); later(ctx, () => ctx.go(1), 1200); }
        } });
        return;
      }

      if (step === 1) {
        const f = frame(ctx, { level: 6, title: "Cookies et fenêtres surgissantes", step: 1,
          consigne: "Sur beaucoup de sites, des fenêtres s'ouvrent par-dessus la page. Débarrassez-vous-en calmement, puis trouvez <b>la météo de demain</b>.",
          help: "La croix ✕ en haut à droite d'une fenêtre la ferme. Pour les cookies, on a le droit de « Tout refuser » : le site marche pareil." });
        const tasks = [{ id: "popup", label: "Fermez la fenêtre « Félicitations » avec sa croix <b>✕</b>." }, { id: "cookie", label: "Répondez au bandeau des <b>cookies</b>, en bas." }];
        const T = id => tasks.find(t => t.id === id);
        let asked = false;
        const draw = (x = "") => { f.panel.innerHTML = tasksHTML(tasks) + x; };
        const maybeAsk = () => {
          if (asked || !T("popup").done || !T("cookie").done) return; asked = true;
          draw(`<div class="mk-q-slot"></div>`);
          quiz(f.panel.querySelector(".mk-q-slot"), { G, key: "meteo", questions: [
            { q: "Quel temps fera-t-il <b>demain</b> à Valbourg ?", choices: ["🌧️ Pluie, 14 °C", "☀️ Ensoleillé, 21 °C", "⛅ Nuageux, 18 °C"], ok: 1, why: "Demain : ensoleillé, 21 °C. Une fois les fenêtres fermées, la page se lit tranquillement." }
          ], onDone: () => ctx.go(2) });
        };
        draw();
        mount(ctx, f.host, { start: "www.meteo-valbourg.fr", onEvent: (type, d, c) => {
          if (type === "action" && d.name === "gift") {
            G.ko("popup", "Fermer une fenêtre « Vous avez gagné »", "Personne ne gagne un smartphone en visitant un site : c'est un piège pour récupérer vos coordonnées ou votre carte.");
            c.flash("🎁 Personne ne gagne un smartphone en visitant un site ! C'est un piège à coordonnées. Fermez la fenêtre avec la <b>✕</b>.", "bad", 8000);
          }
          if (type === "popupClose") { T("popup").done = true; G.ok("popup", "Fermer une fenêtre « Vous avez gagné »"); draw(); maybeAsk(); }
          if (type === "cookie") {
            T("cookie").done = true;
            if (d.choice === "accept") { G.ko("cookie", "Refuser les cookies publicitaires", "Accepter n'est pas dangereux, mais on a le droit de refuser : le site fonctionne pareil, avec moins de publicités ciblées."); c.flash("C'est accepté : ce n'est pas dangereux. Mais vous aviez le droit de <b>tout refuser</b>, et le site marche pareil !", "info", 7000); }
            else { G.ok("cookie", "Refuser les cookies publicitaires"); c.flash("✅ Refusé : le site marche pareil, avec moins de publicités qui vous suivent.", "good", 4000); }
            draw(); maybeAsk();
          }
        } });
        return;
      }

      if (step === 2) {
        const f = frame(ctx, { level: 6, title: "Et si… ?", step: 2, noClient: true,
          consigne: "Des situations qui font peur, et les bons réflexes. Il n'y a jamais de honte : ces pièges sont faits par des professionnels de l'arnaque." });
        quiz(f.panel, { G, key: "whatif", questions: [
          { q: "La fausse alerte bloque tout, même avec Échap. Que faire ?", choices: ["J'appelle le numéro affiché", "Je ferme le navigateur ; si besoin, j'éteins l'ordinateur en restant appuyé sur le bouton marche", "Je paie pour débloquer"], ok: 1, why: "Fermer le navigateur, ou même éteindre l'ordinateur, fait disparaître la page. Au redémarrage, il n'y a plus rien." },
          { q: "Vous avez appelé, et la personne veut « prendre la main » sur votre ordinateur.", choices: ["Je raccroche tout de suite", "Je la laisse faire, c'est un technicien", "Je lui donne ma carte pour payer l'intervention"], ok: 0, why: "Microsoft, votre banque ou votre fournisseur ne vous demandent <b>jamais</b> de les appeler depuis une alerte. On raccroche." },
          { q: "Vous lui avez déjà laissé prendre la main…", choices: ["Ce n'est pas grave, j'oublie", "J'éteins l'ordinateur, je préviens ma banque et je fais vérifier l'ordinateur", "Je rappelle pour demander de l'aide"], ok: 1, why: "On coupe (éteindre, ou débrancher Internet), on prévient sa banque, on fait vérifier l'ordinateur et on change ses mots de passe depuis un autre appareil. Aide : <b>cybermalveillance.gouv.fr</b>." },
          { q: "Un vrai antivirus vous prévient…", choices: ["Dans une page web, avec une sirène et un numéro à appeler", "Dans une petite fenêtre de l'ordinateur, sans jamais demander d'appeler"], ok: 1, why: "Une vraie alerte ne s'affiche pas dans le navigateur et ne donne <b>jamais</b> de numéro à appeler." }
        ], onDone: () => finish(ctx, G, { key: "nav_alert", label: "Je sais réagir à une fausse alerte", intro: "Vous savez quitter une fausse alerte (Échap, fermer l'onglet), refuser les cookies et fermer les fenêtres pièges, calmement." }) });
        return;
      }
      ctx.finalScreen({ theme: null });
    }
  });

  /* =========================================================
     NIVEAU 7 — Mission réelle (sur le vrai navigateur)
     ========================================================= */
  const REAL = [
    { id: "media", icon: "📚", title: "Les horaires de votre médiathèque", task: "Trouvez à quelle heure ouvre la médiathèque (ou la bibliothèque) de votre ville <b>le samedi</b>.", tip: "Mots-clés : médiathèque + le nom de votre ville." },
    { id: "passeport", icon: "🛂", title: "Le prix d'un passeport", task: "Sur le site officiel <b>service-public.fr</b>, trouvez combien coûte le <b>timbre fiscal</b> pour le passeport d'un adulte.", tip: "Mots-clés : prix passeport service public. Vérifiez le vrai nom du site !", official: ["service-public.fr", ".gouv.fr"] },
    { id: "meteo", icon: "🌦️", title: "La météo de demain", task: "Trouvez la <b>température maximale de demain</b> dans votre ville.", tip: "Mots-clés : météo + le nom de votre ville." },
    { id: "mairie", icon: "🏛️", title: "Le numéro de votre mairie", task: "Trouvez le <b>numéro de téléphone</b> de votre mairie, sur son site officiel.", tip: "Mots-clés : mairie + le nom de votre ville. Évitez les annuaires « Sponsorisé »." },
    { id: "garde", icon: "💊", title: "La pharmacie de garde", task: "Trouvez le <b>numéro de téléphone national</b> qui donne la pharmacie de garde la plus proche, la nuit.", tip: "Mots-clés : pharmacie de garde numéro." }
  ];
  R("nav_real", {
    steps: 3,
    render(ctx) {
      let step = ctx.m.step || 0;
      const L = ctx.local, G = grader(L);
      if (step > 0 && !L.pick) step = 0; // mission rouverte : on rechoisit

      if (step === 0) {
        const f = frame(ctx, { level: 7, title: "Mission réelle : choisissez votre mission", step: 0, noClient: true,
          consigne: "Cette fois, vous allez utiliser le <b>vrai navigateur</b> de l'ordinateur, sur le vrai Internet. Choisissez une mission :" });
        f.panel.innerHTML = `<div class="nv-pick">${REAL.map(r => `<button type="button" data-pick="${r.id}"><b>${r.icon} ${r.title}</b><span>${r.task}</span></button>`).join("")}</div>`;
        f.panel.querySelectorAll("[data-pick]").forEach(b => b.addEventListener("click", () => { L.pick = REAL.find(r => r.id === b.dataset.pick); ctx.go(1); }));
        return;
      }

      const r = L.pick;
      if (step === 1) {
        const f = frame(ctx, { level: 7, title: `${r.icon} ${r.title}`, step: 1, noClient: true,
          consigne: "Voici votre mission. Lisez-la en entier, puis suivez les étapes." });
        f.panel.innerHTML = `<div class="nv-mission"><h3>🎯 ${r.task}</h3><p>💡 ${r.tip}</p></div>
          <ol class="nv-steps">
            <li>Ouvrez un <b>nouvel onglet</b> : le bouton <b>＋</b> en haut, ou les touches <kbd>Ctrl</kbd> + <kbd>T</kbd>. <b>Ne fermez pas</b> l'onglet de l'atelier !</li>
            <li>Tapez vos <b>mots-clés</b> et appuyez sur <kbd>Entrée</kbd>.</li>
            <li>Lisez les résultats : <b>évitez les « Sponsorisé »</b>, regardez le <b>vrai nom</b> du site.</li>
            <li>Trouvez la réponse, et notez <b>l'adresse du site</b> où vous l'avez trouvée.</li>
            <li>Revenez ici en cliquant sur l'onglet <b>« Atelier numérique »</b>.</li>
          </ol>
          <div class="alert bad">🛑 Pendant la mission : on ne remplit <b>rien</b> de personnel, on ne crée pas de compte, on ne paie rien. Une fenêtre bizarre ? <kbd>Échap</kbd>, on ferme l'onglet, et on lève la main ✋.</div>
          <div class="final-actions"><button type="button" class="secondary" data-change>← Choisir une autre mission</button><button type="button" class="primary" data-found>J'ai trouvé : je réponds →</button></div>`;
        f.panel.querySelector("[data-found]").addEventListener("click", () => ctx.go(2));
        f.panel.querySelector("[data-change]").addEventListener("click", () => { L.pick = null; ctx.go(0); });
        return;
      }

      if (step === 2) {
        const f = frame(ctx, { level: 7, title: `${r.icon} Ma réponse`, step: 2, noClient: true,
          consigne: `Rappel de la mission : ${r.task}` });
        f.panel.innerHTML = `<div class="nv-real">
          <label>✍️ Ce que j'ai trouvé<textarea rows="3" data-f="answer" placeholder="Écrivez votre réponse ici…"></textarea></label>
          <label>🌐 L'adresse du site où je l'ai trouvée<input type="text" data-f="site" placeholder="exemple : www.mairie-valbourg.fr" autocomplete="off" spellcheck="false"></label>
          <fieldset class="nv-check"><legend><b>✅ Je vérifie</b> (cochez seulement ce qui est vrai)</legend>
            <label><input type="checkbox" data-c="name"> J'ai regardé le <b>vrai nom</b> du site dans la barre d'adresse</label>
            <label><input type="checkbox" data-c="ads"> J'ai évité les résultats <b>« Sponsorisé »</b></label>
            <label><input type="checkbox" data-c="nothing"> Je n'ai <b>rien rempli</b> de personnel, ni rien payé</label></fieldset>
          <div class="mk-fb"></div>
          <div class="final-actions"><button type="button" class="secondary" data-back>← Revoir la mission</button><button type="button" class="primary" data-send>📤 Envoyer ma réponse au formateur</button></div></div>`;
        const $f = s => f.panel.querySelector(s);
        $f("[data-back]").addEventListener("click", () => ctx.go(1));
        $f("[data-send]").addEventListener("click", async () => {
          const answer = $f('[data-f="answer"]').value.trim(), siteRaw = $f('[data-f="site"]').value.trim();
          const site = siteRaw.replace(/^https?:\/\//i, "").split(/[/?#\s]/)[0].toLowerCase();
          const fb = $f(".mk-fb");
          if (!answer) { fb.innerHTML = `<div class="alert bad">Écrivez d'abord ce que vous avez trouvé 🙂</div>`; return; }
          if (!site) { fb.innerHTML = `<div class="alert bad">Notez aussi l'adresse du site : vous la lisez dans la barre d'adresse, tout en haut du navigateur.</div>`; return; }
          const validAddr = B().looksLikeAddress(site);
          const checks = { name: $f('[data-c="name"]').checked, ads: $f('[data-c="ads"]').checked, nothing: $f('[data-c="nothing"]').checked };
          $f("[data-send]").disabled = true;
          G.ok("answer", "Trouver une réponse sur Internet");
          (validAddr ? G.ok : G.ko)("addr", "Noter l'adresse du site", "Une adresse ressemble à www.nom-du-site.fr : on la recopie depuis la barre d'adresse.");
          if (r.official) { const off = r.official.some(o => site.endsWith(o.replace(/^\./, "")) || site.includes(o)); (off ? G.ok : G.ko)("official", "Utiliser le site officiel", `Pour cette mission, le site officiel était ${r.official[0]}.`); }
          (checks.name ? G.ok : G.ko)("chk_name", "Vérifier le vrai nom du site", "Le vrai nom est en gras dans la barre d'adresse, juste avant le premier « / ».");
          (checks.ads ? G.ok : G.ko)("chk_ads", "Éviter les annonces « Sponsorisé »", "Les premiers résultats sont souvent des publicités.");
          (checks.nothing ? G.ok : G.ko)("chk_nothing", "Ne rien remplir de personnel", "Pour chercher une information, on n'a jamais besoin de donner ses coordonnées.");
          const text = `🎯 Mission : ${r.title}\n✍️ Ma réponse : ${answer}\n🌐 Trouvé sur : ${siteRaw}\n${checks.name ? "✅" : "⬜"} vrai nom du site vérifié · ${checks.ads ? "✅" : "⬜"} annonces évitées · ${checks.nothing ? "✅" : "⬜"} rien rempli`;
          try { await ctx.api.sendToTeacher?.(`🧭 Mission réelle : ${r.title}`, text.slice(0, 1900)); }
          catch (e) { fb.innerHTML = `<div class="alert bad">La réponse n'a pas pu partir : ${esc(e.message)}. Réessayez.</div>`; $f("[data-send]").disabled = false; return; }
          finish(ctx, G, { key: "nav_real", label: "J'ai réussi une mission sur le vrai Internet", intro: `${ctx.demo ? "En projection, la réponse n'est pas envoyée." : "📤 Votre réponse est partie chez le formateur : il vous répondra dans votre <b>messagerie</b>."}<br>Mission : <b>${esc(r.title)}</b> — votre réponse : « ${esc(answer)} » (sur ${esc(site)}).` });
        });
        return;
      }
      ctx.finalScreen({ theme: null });
    }
  });

  AN.navKit = { WORLD, INDEX, MED, MAIRIE, FAKE_ALERT, REAL };
})(window.AN);

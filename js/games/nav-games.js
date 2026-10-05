/* =========================================================
   Jeux en direct du chapitre « Navigateurs et recherche » (3 séances)
   ========================================================= */
(function (AN) {
  "use strict";
  const G = AN.games.register;
  const B = () => AN.browser, K = () => AN.navLessonKit;
  /** Une barre d'adresse dessinée, avec le vrai nom en gras. */
  const bar = (u, secure = true) => `<div class="lp-addr">${secure ? "🔒" : `<span class="ins">⚠️ Non sécurisé</span>`} <span>${B().prettyUrl(u, secure)}</span></div>`;
  /** Un résultat de recherche (tel qu'affiché par Cherchetout). */
  const result = u => `<div class="lp-ct ct-results">${B().resultHTML(AN.navKit.INDEX.find(e => e.url === u))}</div>`;

  /* =================== SÉANCE 1 =================== */
  const QUI = ["🚪 Un navigateur", "🙋 Un moteur de recherche", "📕 Un site"];
  const qui = (name, ok, why, small = "") => ({ kind: "choice", layout: "n3", prompt: `<div class="nv-who">${name}${small ? `<small>${small}</small>` : ""}</div>`, choices: QUI, ok, why, short: name, limit: 15 });
  G({ id: "nav_qui", title: "Navigateur, moteur ou site ?", icon: "🚪",
    intro: "Un nom s'affiche : est-ce la <b>porte</b> (un navigateur), le <b>bibliothécaire</b> (un moteur de recherche) ou un <b>livre</b> (un site) ?",
    rounds: [
      qui("Chrome", 0, "<b>Chrome</b> est un navigateur : le programme qu'on ouvre pour aller sur Internet."),
      qui("Google", 1, "<b>Google</b> est un moteur de recherche : il cherche les sites pour vous. Ce n'est pas Chrome !"),
      qui("ameli.fr", 2, "<b>ameli.fr</b> est un site : celui de l'Assurance Maladie."),
      qui("Firefox", 0, "<b>Firefox</b> (le renard) est un navigateur, comme Chrome ou Edge."),
      qui("Qwant", 1, "<b>Qwant</b> est un moteur de recherche français."),
      qui("mairie-valbourg.fr", 2, "C'est l'adresse d'un <b>site</b> : celui de la mairie."),
      qui("Edge", 0, "<b>Edge</b> est le navigateur installé avec Windows."),
      qui("Bing", 1, "<b>Bing</b> est un moteur de recherche (celui de Microsoft).")
    ] });

  const BTN = ["← Précédent", "→ Suivant", "⟳ Actualiser", "＋ Nouvel onglet", "☆ Favori", "✕ Fermer l'onglet"];
  const btn = (prompt, ok, why, short) => ({ kind: "choice", layout: "btns", prompt, choices: BTN, ok, why, short, limit: 20 });
  G({ id: "nav_bouton", title: "Le bon bouton", icon: "🧭",
    intro: "Une situation s'affiche : sur quel <b>bouton du navigateur</b> faut-il cliquer ?",
    rounds: [
      btn("Je veux revenir à la <b>page d'avant</b>.", 0, "La flèche <b>←</b> ramène à la page précédente, comme tourner la page d'un livre en arrière.", "Revenir à la page d'avant"),
      btn("La page reste blanche, ou elle n'est <b>pas à jour</b>.", 2, "<b>⟳ Actualiser</b> recharge la page. C'est le premier réflexe quand ça bloque.", "La page bloque"),
      btn("Je veux ouvrir la météo <b>sans fermer</b> le site de la mairie.", 3, "Un <b>nouvel onglet ＋</b> : les deux sites restent ouverts, côte à côte.", "Deux sites à la fois"),
      btn("J'aime ce site : je veux le <b>retrouver facilement</b> la prochaine fois.", 4, "L'étoile <b>☆</b> l'ajoute aux favoris : un clic pour y revenir.", "Retrouver un site"),
      btn("J'ai fini avec cet onglet, mais je garde <b>les autres</b> ouverts.", 5, "La petite croix <b>✕</b> sur l'onglet ne ferme que celui-là. (La croix tout en haut à droite ferme tout !)", "Fermer un seul onglet"),
      btn("J'ai cliqué sur ← trop vite : je veux <b>retourner</b> où j'étais.", 1, "La flèche <b>→</b> refait le chemin dans l'autre sens.", "Annuler le retour en arrière")
    ] });

  G({ id: "nav_dictee", title: "Dictée d'adresses web", icon: "⌨️",
    intro: "Une adresse de site s'affiche : recopiez-la <b>exactement</b>, le plus vite possible. Une seule lettre fausse, et le site est introuvable !",
    rounds: [
      { kind: "type", prompt: "Recopiez cette adresse :", target: "www.mairie-valbourg.fr", hint: "Le tiret - : touche <kbd>6</kbd> · le point : <kbd>Maj</kbd> + <kbd>; .</kbd>", why: "Des points entre les morceaux, un tiret entre les mots, pas d'espace, pas d'accent." },
      { kind: "type", prompt: "Recopiez cette adresse :", target: "www.service-public.fr", hint: "Pas d'espace : on met un tiret -", why: "« service public » s'écrit avec un tiret : <b>service-public</b>. Jamais d'espace dans une adresse." },
      { kind: "type", prompt: "Recopiez cette adresse :", target: "www.mediatheque-valbourg.fr", hint: "Sans accent : mediatheque", why: "Les adresses s'écrivent <b>sans accent</b> : mediatheque, pas médiathèque." }
    ] });

  /* =================== SÉANCE 2 =================== */
  const rech = (need, choices, ok, why) => ({ kind: "choice", layout: "files", prompt: `Vous voulez : <b>${need}</b>. Quelle est la meilleure recherche ?`, choices, ok, why, short: need, limit: 20 });
  G({ id: "nav_recherche", title: "La meilleure recherche", icon: "🔑",
    intro: "Un besoin s'affiche : choisissez la recherche avec les <b>meilleurs mots-clés</b>. QUOI + OÙ (+ QUAND) !",
    rounds: [
      rech("les horaires de la piscine de Valbourg", ["piscine", "horaires piscine Valbourg", "Bonjour, quand est-ce que la piscine est ouverte s'il vous plaît ?"], 1, "<b>horaires piscine Valbourg</b> : quoi + où. « piscine » seul donne les piscines du monde entier."),
      rech("une recette de crêpes", ["recette crêpes", "crêpes", "comment on fait"], 0, "<b>recette crêpes</b> : deux mots suffisent. « crêpes » seul pourrait donner des crêperies ou des poêles !"),
      rech("la pharmacie de garde ce dimanche à Valbourg", ["pharmacie", "pharmacie de garde Valbourg dimanche", "médicaments dimanche"], 1, "Quoi (pharmacie de garde), où (Valbourg), quand (dimanche) : le trio gagnant."),
      rech("refaire votre carte d'identité", ["carte", "refaire carte identité", "carte identité gratuite rapide pas cher"], 1, "<b>refaire carte identité</b>. Attention aux mots « rapide », « pas cher » : ils attirent les sites payants !")
    ] });

  const AR = ["📢 Une annonce", "🔎 Un vrai résultat"];
  const ann = (u, ok, why) => ({ kind: "choice", prompt: `Ce résultat, c'est… ${result(u)}`, choices: AR, ok, why, short: AN.navKit.INDEX.find(e => e.url === u).title, limit: 20 });
  G({ id: "nav_annonce", title: "Annonce ou vrai résultat ?", icon: "📢",
    intro: "Un résultat de recherche s'affiche : <b>annonce</b> (publicité) ou <b>vrai résultat</b> ? Cherchez le petit mot « Sponsorisé »…",
    rounds: [
      ann("www.passeport-express-valbourg.com", 0, "« Sponsorisé » : c'est une publicité. Ce site fait payer 49 € une démarche gratuite."),
      ann("passeport.ants.gouv.fr", 1, "Pas de « Sponsorisé », et le nom <b>ants.gouv.fr</b> : le site officiel."),
      ann("www.rdv-mairie-rapide-valbourg.com", 0, "« Sponsorisé » : 29 € pour un rendez-vous que la mairie donne gratuitement."),
      ann(AN.navKit.MAIRIE + "/rendez-vous", 1, "Un vrai résultat : le site de la mairie, <b>mairie-valbourg.fr</b>."),
      ann("www.pharma-promo-valbourg.com", 0, "« Sponsorisé » : une boutique qui vend des produits, pas la liste des pharmacies de garde."),
      ann("www.service-public.fr/passeport", 1, "Un vrai résultat, et un site officiel : <b>service-public.fr</b>.")
    ] });

  const off = (need, choices, ok, why) => ({ kind: "choice", layout: "urls", prompt: `Pour <b>${need}</b>, quel est le site officiel ?`, choices, ok, why, short: need, limit: 20 });
  G({ id: "nav_officiel", title: "Trouve le site officiel", icon: "🇫🇷",
    intro: "Une démarche s'affiche : retrouvez le <b>site officiel</b> parmi les imitations !",
    rounds: [
      off("déclarer vos impôts", ["impots-declaration-aide.com", "impots.gouv.fr", "impots-gouv.fr"], 1, "<b>impots.gouv.fr</b>, avec un point avant gouv. « impots-gouv.fr » (avec un tiret) est une imitation."),
      off("refaire votre carte grise", ["carte-grise-express-valbourg.fr", "ants.gouv.fr", "cartegrise-officiel.com"], 1, "Carte grise, permis, passeport, carte d'identité : <b>ants.gouv.fr</b>. Le mot « officiel » dans un nom ne prouve rien !"),
      off("votre compte Assurance Maladie", ["ameli.fr", "ameli-remboursement.info", "assurance-maladie-aide.fr"], 0, "<b>ameli.fr</b> : le site de l'Assurance Maladie. Il n'a pas de .gouv.fr, et pourtant c'est le bon."),
      off("payer une amende", ["antai-paiement-amende.com", "amende-paiement-rapide.fr", "antai.gouv.fr"], 2, "Le seul site officiel des amendes : <b>antai.gouv.fr</b>."),
      off("toutes vos retraites", ["info-retraite.fr", "ma-retraite-facile.com", "retraite-aide-gouv.com"], 0, "<b>info-retraite.fr</b> : le site officiel commun à toutes les caisses de retraite.")
    ] });

  /* =================== SÉANCE 3 =================== */
  const OP = ["✅ Officiel", "🚩 Piège"];
  const lien = (u, secure, ok, why) => ({ kind: "choice", prompt: `Regardez la barre d'adresse. Site officiel ou piège ?${bar(u, secure)}`, choices: OP, ok, why, short: B().normalize(u), limit: 15 });
  G({ id: "nav_piege", title: "Officiel ou piège ?", icon: "🔍",
    intro: "Une barre d'adresse s'affiche : <b>site officiel</b> ou <b>piège</b> ? Lisez le vrai nom, en gras, juste avant le premier « / ».",
    rounds: [
      lien("www.service-public.fr/particuliers", true, 0, "Le vrai nom est <b>service-public.fr</b> : le site officiel de l'administration."),
      lien("ants.gouv.fr.passeport-rapide.com/demande", true, 1, "Le début « ants.gouv.fr. » est un déguisement : le vrai nom est <b>passeport-rapide.com</b>. Et il y a un cadenas : il ne prouve rien !"),
      lien("www.caf.fr/allocataires", true, 0, "<b>caf.fr</b> : le site des allocations familiales."),
      lien("www.ameli-fr.com/connexion", false, 1, "Le vrai nom est <b>ameli-fr.com</b>, pas ameli.fr. Et en plus : « Non sécurisé »."),
      lien("www.impots.gouv.fr/accueil", true, 0, "<b>impots.gouv.fr</b> : le vrai site des impôts."),
      lien("www.amende-antai.fr/payer", true, 1, "Le vrai nom est <b>amende-antai.fr</b>. Le site officiel des amendes est antai.gouv.fr. Le cadenas est là… mais c'est un faux.")
    ] });

  const z = (id, html) => `<span class="z" data-z="${id}">${html}</span>`;
  G({ id: "nav_faux_site", title: "Trouve les indices", icon: "🕵️",
    intro: "Ce faux site de livraison cache <b>6 indices</b>. Trouvez-les tous, sans oublier la barre d'adresse !",
    rounds: [{ kind: "spot", limit: 150, prompt: "Cliquez sur les <b>6 indices</b> qui montrent que ce site est un faux.", why: "Le vrai nom du site d'abord, puis : pression, paiement, informations secrètes, fautes.",
      zones: { adresse: "Le vrai nom : colis-suivi-valbourg.top, inconnu", nonsecure: "« Non sécurisé » : rien de personnel ici !", faute: "« a été bloquer » : une faute", urgence: "« sous 24 h » : la pression", frais: "Des frais à payer pour un colis qu'on n'attend pas", sms: "Le code reçu par SMS : jamais, à personne" },
      content: K().bmock({ tabs: [["📦", "Suivi de colis"]], secure: false, url: "www.colis-suivi-valbourg.top/paiement",
        addrHTML: z("adresse", B().prettyUrl("www.colis-suivi-valbourg.top/paiement", false)), lockHTML: z("nonsecure", "⚠️ <span>Non sécurisé</span>"),
        body: `<div class="ws" style="--c:#f1c40f"><header class="ws-head" style="color:#26303d"><span class="ws-logo">📦 Suivi Colis Express</span></header><main class="ws-main">
          <h2>Votre colis ${z("faute", "a été bloquer")}</h2><p>Votre colis n° FR8812645 n'a pas pu être livré. Réglez ${z("frais", "les frais de réexpédition de 1,99 €")} ${z("urgence", "sous 24 h")}, sinon il sera retourné.</p>
          <div class="ws-form"><span>Numéro de carte</span><span>Date d'expiration</span>${z("sms", "<span>Code reçu par SMS</span>")}</div><p><span class="ws-btn" style="background:#e67e22">Payer 1,99 €</span></p></main></div>` }) }] });

  const VF = ["✅ Vraie alerte", "🚩 Fausse alerte"];
  const al = (scene, ok, why, short) => ({ kind: "choice", prompt: `<div class="lp-scene">${scene}</div>`, choices: VF, ok, why, short, limit: 20 });
  G({ id: "nav_alerte", title: "Vraie ou fausse alerte ?", icon: "🚨",
    intro: "Un message apparaît sur l'écran : <b>vraie</b> alerte ou <b>fausse</b> alerte ? Pensez aux indices : où ça s'affiche, et ce qu'on vous demande.",
    rounds: [
      al(`<div class="l-alert-mini">⚠ <b>VIRUS DÉTECTÉ !</b> Votre ordinateur est bloqué. Appelez le support technique : <b>09 00 00 00 00</b></div><small>…en plein écran dans le navigateur, avec une sirène.</small>`, 1, "Un <b>numéro à appeler</b> dans une page web : c'est toujours une fausse alerte. Échap, puis on ferme l'onglet.", "Virus détecté, appelez le support"),
      al(`<div class="l-toast-win"><b>🛡️ Sécurité Windows</b>Menace bloquée. Aucune action n'est requise.</div><small>…une petite fenêtre en bas à droite de l'écran.</small>`, 0, "Une petite fenêtre de l'ordinateur, qui ne demande <b>rien</b> : c'est l'antivirus de Windows qui fait son travail.", "Sécurité Windows : menace bloquée"),
      al(`<div class="l-toast-win"><b>⚠ Votre navigateur est obsolète !</b>Téléchargez immédiatement la mise à jour : <u>maj-navigateur.exe</u></div><small>…une fenêtre surgie sur un site de recettes.</small>`, 1, "Un site ne vous fait jamais télécharger une « mise à jour ». Le navigateur se met à jour <b>tout seul</b>.", "Téléchargez la mise à jour"),
      al(`<div class="l-toast-win"><b>🔄 Windows Update</b>Des mises à jour sont prêtes. Redémarrez pour les installer.</div><small>…dans le coin de l'écran, quand vous allumez l'ordinateur.</small>`, 0, "Les vraies mises à jour de Windows se proposent comme ça, sans urgence, sans numéro, sans paiement.", "Windows Update"),
      al(`<div class="l-alert-mini">🍎 <b>Votre iPhone a 13 virus !</b> Nettoyez-le maintenant en installant notre application.</div><small>…sur l'écran de votre ordinateur Windows.</small>`, 1, "Un iPhone… sur un ordinateur ? La page dit n'importe quoi pour faire peur. On ferme.", "Votre iPhone a 13 virus"),
      al(`<div class="l-alert-mini">👮 <b>Police nationale</b> : votre ordinateur est bloqué pour activité illégale. Payez une amende de 200 € pour le débloquer.</div>`, 1, "La police ne bloque jamais un ordinateur par une page web, et ne fait jamais payer d'amende comme ça. On ferme, et on n'a <b>rien</b> à se reprocher.", "Fausse page de la police")
    ] });

  const QF = (prompt, choices, ok, why, short) => ({ kind: "choice", layout: "files", prompt, choices, ok, why, short, limit: 25 });
  G({ id: "nav_que_faire", title: "Que faites-vous ?", icon: "🆘", noRank: true,
    intro: "Des situations qui font peur… et ce qu'il faut faire, <b>calmement</b>. Pas de classement : on en parle ensemble.",
    rounds: [
      QF("Une fausse alerte virus prend tout l'écran, avec une sirène.", ["J'appelle le numéro pour qu'on m'aide", "Échap, puis je ferme l'onglet", "Je clique sur « Analyser »"], 1, "Échap fait sortir du plein écran, puis on ferme l'onglet. Si ça bloque : on ferme le navigateur, ou on éteint.", "La fausse alerte"),
      QF("Vous avez appelé : la personne veut installer un programme pour « prendre la main ».", ["Je la laisse faire", "Je raccroche tout de suite", "Je lui donne ma carte pour payer"], 1, "On raccroche. Aucun vrai service ne vous appelle depuis une alerte Internet.", "On veut prendre la main"),
      QF("Un bandeau vous demande d'accepter les cookies.", ["« Tout refuser » : j'en ai le droit", "Je ferme l'ordinateur, c'est dangereux", "J'appelle la médiathèque"], 0, "On peut refuser : le site marche pareil. Accepter n'est pas dangereux non plus : c'est surtout de la publicité.", "Les cookies"),
      QF("Une fenêtre annonce : « Vous avez gagné un smartphone ! »", ["Je clique sur « Récupérer mon cadeau »", "Je ferme avec la petite croix ✕", "Je donne mon adresse pour la livraison"], 1, "Personne ne gagne en visitant un site. On ferme avec la croix, sans toucher au gros bouton.", "Vous avez gagné"),
      QF("Vous avez payé 49 € sur un site « Passeport express » au lieu du site officiel.", ["Tant pis, c'est perdu", "J'appelle ma banque, et je garde les preuves (e-mails, reçu)", "Je paie une deuxième fois sur le bon site pour comparer"], 1, "Votre banque peut parfois contester le paiement. Gardez tout. Et vous pouvez demander de l'aide à la médiathèque.", "J'ai payé un intermédiaire")
    ] });
})(window.AN);

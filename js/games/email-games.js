/* =========================================================
   Jeux en direct du chapitre E-mail (5 séances)
   ========================================================= */
(function (AN) {
  "use strict";
  const G = AN.games.register;
  const K = AN.emailKit;
  const now = new Date(), Y = now.getFullYear();
  const MOIS = ["janvier", "fevrier", "mars", "avril", "mai", "juin", "juillet", "aout", "septembre", "octobre", "novembre", "decembre"];
  const monthAgo = n => { const d = new Date(Y, now.getMonth() - n, 1); return `${MOIS[d.getMonth()]}_${d.getFullYear()}`; };
  const file = (icon, name, info) => `<span class="lp-file"><span>${icon}</span><b>${name}</b>${info ? `<small>${info}</small>` : ""}</span>`;

  /* =================== SÉANCE 1 =================== */
  G({ id: "dictee_adresse", title: "Dictée d'adresses", icon: "⌨️",
    intro: "Une adresse s'affiche : recopiez-la <b>exactement</b>, le plus vite possible. Une seule lettre fausse, et le message n'arrive pas !",
    rounds: [
      { kind: "type", prompt: "Recopiez cette adresse :", target: "jeanne.morel@orange.fr", hint: "@ : maintenez <kbd>AltGr</kbd> et appuyez sur <kbd>à 0</kbd>", why: "Le point se tape avec <kbd>Maj</kbd> + <kbd>; .</kbd> et l'arobase avec <kbd>AltGr</kbd> + <kbd>à</kbd>." },
      { kind: "type", prompt: "Recopiez cette adresse :", target: "contact@mairie-valbourg.fr", hint: "Le tiret - : touche <kbd>6</kbd>", why: "Le tiret - est sur la touche 6, sans Maj. Une adresse s'écrit toujours en minuscules." },
      { kind: "type", prompt: "Recopiez cette adresse :", target: "j.martin_durand@free.fr", hint: "Le tiret bas _ : touche <kbd>8</kbd>", why: "Le tiret bas _ est sur la touche 8. Il ne faut pas le confondre avec le tiret - (touche 6)." }
    ] });

  G({ id: "construis_adresse", title: "Construis l'adresse", icon: "🧩",
    intro: "Les morceaux d'une adresse sont mélangés : remettez-les <b>dans le bon ordre</b> en cliquant dessus.",
    rounds: [
      { kind: "order", inline: true, prompt: "Cliquez sur les morceaux dans l'ordre pour écrire l'adresse de <b>Marie Dupont</b>, chez <b>La Poste</b>.", answer: ["marie.dupont", "@", "laposte", ".net"], why: "Toujours dans cet ordre : <b>identifiant</b> @ <b>fournisseur</b> <b>.extension</b>." },
      { kind: "order", inline: true, prompt: "Cliquez sur les morceaux dans l'ordre pour écrire l'adresse <b>contact</b> de la <b>mairie de Valbourg</b>.", answer: ["contact", "@", "mairie-valbourg", ".fr"], why: "Avant le @ : qui. Après le @ : chez qui. À la fin : l'extension (.fr)." },
      { kind: "order", inline: true, prompt: "Cliquez sur les morceaux dans l'ordre pour écrire l'adresse de <b>Paul Roux</b>, chez <b>Orange</b>.", answer: ["paul.roux", "@", "orange", ".fr"], why: "Le @ se lit « chez » : paul.roux <b>chez</b> orange.fr." }
    ] });

  const FOLDERS = ["📥 Réception", "📤 Envoyés", "📝 Brouillons", "🚫 Indésirables", "🗑️ Corbeille"];
  const folder = (prompt, ok, why, short, q = "Dans quel dossier le trouvez-vous ?") => ({ kind: "choice", layout: "folders", prompt: `${prompt}<br><b>${q}</b>`, choices: FOLDERS, ok, why, short, limit: 20 });
  G({ id: "quel_dossier", title: "Dans quel dossier ?", icon: "🗂️",
    intro: "Une situation s'affiche : dans quel <b>dossier</b> de la messagerie se trouve le message ?",
    rounds: [
      folder("Votre petite-fille vient de vous écrire. Vous n'avez <b>pas encore lu</b> son message.", 0, "Les messages reçus arrivent dans la <b>Réception</b>. Un message en gras n'est pas encore lu.", "Message reçu non lu"),
      folder("Ce matin, vous avez <b>envoyé</b> un message à la mairie. Vous voulez le relire.", 1, "Tout ce que vous envoyez est gardé dans <b>Envoyés</b> : vous pouvez relire ce que vous avez écrit.", "Message envoyé"),
      folder("Hier, vous avez <b>commencé</b> un message. Vous ne l'avez <b>pas encore envoyé</b>.", 2, "Les messages commencés sont dans <b>Brouillons</b> : on peut les reprendre plus tard.", "Message commencé"),
      folder("Un message dit : « Félicitations ! Vous avez gagné un smartphone, cliquez vite ! ». Votre messagerie l'a reconnu comme une <b>arnaque</b>.", 3, "La messagerie range les publicités et les arnaques dans <b>Indésirables</b> (ou « Spam »).", "Faux gain"),
      folder("Vous avez <b>supprimé par erreur</b> un message important.", 4, "Un message supprimé reste un moment dans la <b>Corbeille</b> : on peut le restaurer.", "Supprimé par erreur"),
      folder("La médiathèque vous a écrit, mais le message <b>n'est pas dans la Réception</b>. Vous ne l'avez pas supprimé.", 3, "Parfois, un vrai message arrive par erreur dans les <b>Indésirables</b> : on y jette un œil.", "Message introuvable", "Dans quel dossier regardez-vous ?")
    ] });

  /* =================== SÉANCE 2 =================== */
  const BTN = ["↩️ Répondre", "↩️↩️ Répondre à tous", "↪️ Transférer"];
  const which = (prompt, ok, why, short) => ({ kind: "choice", prompt: `${prompt}<br><b>Sur quel bouton cliquez-vous ?</b>`, choices: BTN, ok, why, short, limit: 20 });
  G({ id: "quel_bouton", title: "Quel bouton ?", icon: "↩️",
    intro: "Vous avez reçu un e-mail. Sur quel bouton cliquez-vous : <b>Répondre</b>, <b>Répondre à tous</b> ou <b>Transférer</b> ?",
    rounds: [
      which("La médiathèque vous écrit, à vous seul(e), pour savoir si vous venez <b>jeudi</b>. Vous lui répondez.", 0, "Seule la médiathèque a besoin de votre réponse : <b>Répondre</b>.", "La médiathèque demande si je viens"),
      which("Le plombier vous a envoyé sa <b>facture</b> par e-mail. Vous voulez l'envoyer à <b>votre fille</b>, qui gère vos papiers.", 2, "Votre fille n'a pas reçu ce message : vous le lui <b>transférez</b>, avec la facture.", "Envoyer une facture à ma fille"),
      which("Un e-mail invite <b>toute la famille</b> au repas de dimanche. Vous voulez dire à <b>tout le monde</b> que vous apportez le dessert.", 1, "Tout le monde doit lire la réponse : <b>Répondre à tous</b>.", "Le dessert pour toute la famille"),
      which("L'organisatrice de la fête de l'école écrit à <b>30 parents</b>. Vous voulez demander, <b>à elle seule</b>, si vous pouvez aider.", 0, "Inutile d'écrire aux 30 personnes : <b>Répondre</b> à l'organisatrice suffit.", "Aider à la fête de l'école"),
      which("Le club de marche vous a envoyé ses horaires par e-mail. <b>Votre voisin</b>, qui n'a pas reçu ce message, vous les demande.", 2, "Vous <b>transférez</b> le message du club à votre voisin.", "Les horaires du club pour le voisin"),
      which("Le médecin vous écrit pour changer l'heure du rendez-vous. Votre conjoint est <b>en copie</b>. Vous voulez répondre <b>au médecin et à votre conjoint</b>.", 1, "Le médecin et votre conjoint doivent lire la réponse : <b>Répondre à tous</b>.", "Confirmer au médecin et au conjoint")
    ] });

  G({ id: "ordre_mail", title: "Remets le mail dans l'ordre", icon: "🧩",
    intro: "Les morceaux d'un e-mail sont mélangés : remettez-les dans le bon ordre, du <b>haut</b> vers le <b>bas</b>.",
    rounds: [
      { kind: "order", limit: 75, prompt: "Cliquez sur les morceaux dans l'ordre, du haut vers le bas : un e-mail pour s'inscrire à l'atelier.", answer: ["Objet : Inscription atelier jeudi", "Bonjour,", "Je souhaite m'inscrire à l'atelier de jeudi à 14 h.", "Cordialement,", "Marie Dupont"], why: "Objet → salutation (Bonjour) → le message → formule de politesse (Cordialement) → signature." },
      { kind: "order", limit: 75, prompt: "Cliquez sur les morceaux dans l'ordre, du haut vers le bas : un e-mail à la mairie.", answer: ["Objet : Demande de rendez-vous", "Madame, Monsieur,", "Je souhaiterais prendre rendez-vous pour renouveler ma carte d'identité.", "Je vous remercie par avance.", "Bien cordialement,", "Paul Roux"], why: "Pour une administration : « Madame, Monsieur » au début, « Bien cordialement » à la fin." }
    ] });

  G({ id: "corrige_mail", title: "Corrige le mail", icon: "🖍️",
    intro: "Ce message pour la médiathèque contient <b>7 erreurs</b>. Cliquez sur chaque erreur que vous trouvez.",
    rounds: [{ kind: "spot", limit: 150, prompt: "Ce message va partir à la médiathèque. Cliquez sur ses <b>7 erreurs</b>.", why: "Avant d'envoyer, on relit : destinataires, objet, politesse, pièces jointes.",
      zones: { dest: "Claire est dans « À » : elle devrait être en copie (Cc)", objet: "L'objet est vide", salut: "« Salut » : trop familier pour la médiathèque", caps: "Tout en MAJUSCULES : cela donne l'impression de crier", faute: "« ateleir » : une faute de frappe, il faut relire", fin: "Pas de formule de politesse avant la signature", pj: "Une pièce jointe sans rapport avec la demande" },
      content: `<div class="mm"><div class="mm-bar"><span>✏️ Nouveau message</span><i></i><i></i><i></i></div>
        <div class="lp-field"><b>À</b> mediatheque@valbourg.fr ; <span class="z" data-z="dest">claire.dupont@gmail.com</span></div>
        <div class="lp-field"><b>Cc</b> <span class="lp-empty">(vide)</span></div>
        <div class="lp-field"><b>Objet</b> <span class="z" data-z="objet">(vide)</span></div>
        <div class="mm-body"><p><span class="z" data-z="salut">Salut,</span></p><p><span class="z" data-z="caps">JE VEUX M'INSCRIRE</span> à l'<span class="z" data-z="faute">ateleir</span> de jeudi avec ma fille Claire.</p><p><span class="z" data-z="fin">Marie</span></p>
        <p><span class="z" data-z="pj">${file("📎", "photo_vacances.jpg", "2,1 Mo")}</span></p></div></div>` }] });

  /* =================== SÉANCE 3 =================== */
  const pickFile = (prompt, choices, ok, why, short) => ({ kind: "choice", layout: "files", prompt: `${prompt}<br><b>Quel fichier joignez-vous ?</b>`, choices, ok, why, short, limit: 25 });
  G({ id: "bon_fichier", title: "Trouve le bon fichier", icon: "🔎",
    intro: "On vous demande un document : quel <b>fichier</b> joignez-vous à votre e-mail ?",
    rounds: [
      pickFile(`La mairie demande un <b>justificatif de domicile de moins de 3 mois</b>. Nous sommes en <b>${now.toLocaleDateString("fr-FR", { month: "long", year: "numeric" })}</b>.`,
        [file("📕", `facture_electricite_${monthAgo(8)}.pdf`), file("📕", `facture_electricite_${monthAgo(1)}.pdf`), file("🖼️", "photo_identite.jpg"), file("📕", "mode_emploi_four.pdf")], 1,
        "Une facture d'électricité est un justificatif de domicile… à condition d'avoir <b>moins de 3 mois</b> : regardez la date dans le nom.", "Justificatif de moins de 3 mois"),
      pickFile("Pour votre carte d'identité, la mairie demande une <b>photo d'identité récente</b>.",
        [file("🖼️", "photo_plage.jpg"), file("📕", "scan_carte_vitale.pdf"), file("🖼️", `photo_identite_${Y}.jpg`), file("⚙️", "photo_identite.exe")], 2,
        "Le nom et la date disent tout : <b>photo_identite_" + Y + ".jpg</b>. Et un <b>.exe</b> n'est jamais une photo !", "Photo d'identité"),
      pickFile("Une démarche vous demande votre <b>dernier avis d'impôt</b>.",
        [file("📕", `avis_impot_${Y - 6}.pdf`), file("📕", `avis_impot_${Y}.pdf`), file("📘", "declaration_brouillon.docx"), file("⚙️", "impots_installer.exe")], 1,
        `Le dernier, c'est le plus récent : <b>avis_impot_${Y}.pdf</b>. Les anciens avis ne servent plus.`, "Dernier avis d'impôt"),
      pickFile("Votre fille vous demande la <b>photo du repas de dimanche</b>.",
        [file("⚙️", "repas_dimanche.exe"), file("📕", "recette_tarte.pdf"), file("🖼️", "repas_dimanche.jpg"), file("🎬", "video_anniversaire.mp4", "2 Go")], 2,
        "Une photo, c'est un <b>.jpg</b>. Le .exe est un programme : jamais ! Et la vidéo de 2 Go est trop lourde pour un e-mail.", "Photo du repas")
    ] });

  const OD = ["✅ Oui, je l'ouvre", "⛔ Non, je ne l'ouvre pas"];
  const doc = (name, from, ok, why, short) => ({ kind: "choice", prompt: `<div class="lp-docq">${name}<small>${from}</small></div><br><b>Ouvrez-vous cette pièce jointe ?</b>`, choices: OD, ok, why, short, limit: 15 });
  G({ id: "document_danger", title: "Document ou danger ?", icon: "⛔",
    intro: "Une pièce jointe arrive par e-mail. Regardez <b>qui l'envoie</b> et la <b>fin du nom</b>. Vous l'ouvrez, oui ou non ?",
    rounds: [
      doc(file("📕", "facture_septembre.pdf"), "Envoyée par votre fournisseur d'électricité. Vous l'attendiez.", 0, "Un <b>.pdf</b> attendu, d'un expéditeur connu : on peut l'ouvrir.", "facture_septembre.pdf (attendue)"),
      doc(file("⚙️", "facture.pdf.exe"), "Envoyée par une personne que vous ne connaissez pas.", 1, "Le piège du double nom : la fin est <b>.exe</b>. C'est un programme déguisé en facture.", "facture.pdf.exe"),
      doc(file("🖼️", "photo_mariage.jpg"), "Envoyée par votre cousine, qui vous l'avait promise.", 0, "Une photo (.jpg) attendue, d'une personne connue : pas de souci.", "photo_mariage.jpg"),
      doc(file("🗜️", "suivi_colis.zip"), "Envoyée par un « service de livraison » inconnu. Vous n'attendez aucun colis.", 1, "Un <b>.zip</b> d'un inconnu, pour un colis que vous n'attendez pas : on ne l'ouvre pas.", "suivi_colis.zip"),
      doc(file("📘", "recette_gateau.docx"), "Envoyée par votre amie Josiane, qui vous l'avait promise.", 0, "Un texte (.docx) attendu, d'une amie : on peut l'ouvrir.", "recette_gateau.docx"),
      doc(file("⚙️", "mise_a_jour_securite.exe"), "Envoyée « par votre banque ». Vous n'avez rien demandé.", 1, "Une banque n'envoie jamais de programme (.exe) à installer par e-mail.", "mise_a_jour_securite.exe")
    ] });

  /* =================== SÉANCE 4 =================== */
  G({ id: "sept_erreurs", title: "Trouve les 7 erreurs", icon: "🕵️",
    intro: "Ce faux message cache <b>7 indices</b> d'arnaque. Trouvez-les tous, le plus vite possible !",
    rounds: [{ kind: "spot", limit: 180, prompt: "Cliquez sur les <b>7 indices</b> qui montrent que ce message est une arnaque.", why: "Avec la méthode des 5 questions, chaque indice saute aux yeux : qui ? attendu ? pression ? demande ? lien ?",
      zones: { adresse: "L'adresse finit par ameli-securite.info, pas par ameli.fr", objet: "« URGENT » et des points d'exclamation : la pression", cher: "« Cher assuré » : un vrai organisme vous appelle par votre nom", delai: "« Avant minuit » : l'urgence pour vous empêcher de réfléchir", carte: "On demande la carte bancaire : jamais par e-mail", code: "On demande le code reçu par SMS : jamais, à personne", lien: "Le lien mène vers ameli-remboursement.info : un faux site" },
      content: `<div class="mm"><div class="mm-bar"><span>✉️ Ma messagerie</span><i></i><i></i><i></i></div>
        <div class="mm-subject"><span class="z" data-z="objet">⚠ URGENT : remboursement en attente !!!</span></div>
        <div class="mm-head"><span class="mm-av">AM</span><div class="mm-who"><b>Assurance Maladie</b> <span class="mm-addr">&lt;remboursement@<span class="z" data-z="adresse">ameli-securite.info</span>&gt;</span><div class="mm-to">À : moi</div></div><span class="mm-date">Aujourd'hui 07:12</span></div>
        <div class="mm-body"><p><span class="z" data-z="cher">Cher assuré,</span></p>
          <p>Un remboursement de <b>87,40 €</b> est en attente sur votre compte. <span class="z" data-z="delai">Sans action de votre part avant ce soir minuit</span>, il sera annulé.</p>
          <p>Pour le recevoir, saisissez <span class="z" data-z="carte">les informations de votre carte bancaire</span> puis <span class="z" data-z="code">le code que vous recevrez par SMS</span>.</p>
          <p><span class="z" data-z="lien"><span class="mm-btn">Recevoir mon remboursement</span></span></p></div>
        <div class="mm-status">http://ameli-remboursement.info/carte</div></div>` }] });

  const lines = (...l) => l;
  G({ id: "detecteur", title: "Le détecteur", icon: "🚨",
    intro: "Un message s'affiche <b>ligne par ligne</b>. Dès que vous êtes sûr(e) que c'est une arnaque, appuyez sur 🚩. Plus vous êtes rapide, plus vous gagnez ! Si tout est normal, attendez la fin.",
    rounds: [
      { kind: "buzz", fake: true, interval: 3, lines: lines("<b>De :</b> Suivi Colis &lt;notification@suivi-colis-express.top&gt;", "<b>Objet :</b> Votre colis est en attente", "Bonjour,", "Votre colis n'a pas pu être livré.", "Des frais de <b>1,99 €</b> sont à régler sous 24 h.", "Cliquez ici pour payer : suivi-colis-express.top/paiement"),
        why: "Dès la 1re ligne, l'adresse <b>suivi-colis-express.top</b> n'est celle d'aucun transporteur. Puis l'urgence et le paiement." },
      { kind: "buzz", fake: false, interval: 3, lines: lines("<b>De :</b> Médiathèque de Valbourg &lt;mediatheque@valbourg.fr&gt;", "<b>Objet :</b> Rappel : vos livres sont à rendre samedi", "Bonjour Madame Martin,", "Vos 3 livres sont à rendre avant samedi.", "Vous pouvez aussi les prolonger à l'accueil.", "Bonne lecture ! L'équipe de la médiathèque"),
        why: "Tout est rassurant : l'adresse habituelle, votre nom, aucune urgence, rien de secret demandé. Un <b>vrai message</b>." },
      { kind: "buzz", fake: true, interval: 3, lines: lines("<b>De :</b> Banque du Valbourg &lt;securite@banque-valbourg-alerte.com&gt;", "<b>Objet :</b> Activité inhabituelle sur votre compte", "Cher(e) client(e),", "Par sécurité, votre compte sera suspendu aujourd'hui.", "Pour l'éviter, confirmez votre mot de passe et le code reçu par SMS.", "Confirmer mon identité : banque-valbourg-alerte.com/verification"),
        why: "L'adresse <b>banque-valbourg-alerte.com</b> n'est pas celle de la banque, puis « Cher(e) client(e) », l'urgence… et le <b>code SMS</b> : jamais !" }
    ] });

  /* =================== SÉANCE 5 =================== */
  const OP = ["✅ Vrai site", "🚩 Piège"];
  const link = (u, ok, why, ctx) => ({ kind: "choice", prompt: `${ctx ? `${ctx}<br>` : ""}<div class="lp-url">${u}</div><br><b>Vrai site ou piège ?</b>`, choices: OP, ok, why, short: u, limit: 15 });
  G({ id: "officiel_piege", title: "Officiel ou piège ?", icon: "🔗",
    intro: "Un lien s'affiche : <b>vrai site</b> ou <b>piège</b> ? Regardez le vrai nom du site : il est juste avant le premier « / » qui suit https://.",
    rounds: [
      link("https://www.impots.gouv.fr/accueil", 0, "Le vrai nom est <b>impots.gouv.fr</b> : le site officiel."),
      link("https://impots.gouv.fr.remboursement-dossier.com/accueil", 1, "Le début est un déguisement : le vrai nom est <b>remboursement-dossier.com</b>."),
      link("https://www.ameli.fr/assure", 0, "Le vrai nom est <b>ameli.fr</b> : le site de l'Assurance Maladie."),
      link("http://ameli-carte-vitale.info/renouvellement", 1, "Le vrai nom est <b>ameli-carte-vitale.info</b>, pas ameli.fr."),
      link("https://antai-paiement-amende.com/payer", 1, "Le seul site officiel des amendes est <b>antai.gouv.fr</b>."),
      link("https://www.antai.gouv.fr", 0, "<b>antai.gouv.fr</b> : le site officiel des amendes."),
      link("https://www.impots-gouv.fr/connexion", 1, "Un tiret remplace le point : <b>impots-gouv.fr</b> n'est pas impots.gouv.fr."),
      link("https://www.librairieduparc.fr/mes-commandes", 0, "Le vrai nom est <b>librairieduparc.fr</b> : c'est bien le site où vous avez commandé.", "Hier, vous avez commandé un livre sur le site <b>librairieduparc.fr</b>.")
    ] });

  const VA = ["✅ Vrai message", "🚩 Arnaque"];
  G({ id: "vrai_arnaque", title: "Vrai ou arnaque ?", icon: "🙋",
    intro: "Des messages vrais et faux, mélangés. Lisez bien : l'adresse du lien est écrite en bas du message. Puis votez : vrai message ou arnaque ?",
    rounds: K.VOTE_MSGS().map(m => {
      const ctx = m.context ? `<div class="l-ctx">📌 ${m.context}</div>` : "";
      const subject = (m.mockHTML.match(/class="mm-subject">([\s\S]*?)<\/div>/) || [, ""])[1].replace(/<[^>]+>/g, "").trim();
      return { kind: "choice", limit: 30, prompt: `<div class="show-status">${ctx}${m.mockHTML}</div><br><b>Vrai message ou arnaque ?</b>`, choices: VA, ok: m.fake ? 1 : 0, short: subject,
        revealHTML: `<div class="all-shown">${ctx}${m.mockHTML}</div>`,
        why: K.notes(m.items.map(i => [...i, !m.fake])).replace(/data-reveal="\d+"/g, "") };
    }) });

  const QF = (prompt, choices, ok, why, short) => ({ kind: "choice", prompt: `${prompt}<br><b>Que faites-vous ?</b>`, choices, ok, why, short, limit: 25 });
  G({ id: "que_faire", title: "Que faites-vous ?", icon: "🆘", noRank: true,
    intro: "Des situations qui font peur… et ce qu'il faut faire, <b>calmement</b>. Pas de classement : on en parle ensemble.",
    rounds: [
      QF("Vous avez cliqué sur le lien d'un faux message. Vous n'avez <b>rien rempli</b> sur la page.", ["Je ferme la page et je supprime le message", "J'éteins l'ordinateur et je ne m'en sers plus", "Je remplis quand même, pour voir"], 0, "En général, il ne s'est rien passé : le danger, c'est de remplir. On ferme la page et on garde son ordinateur à jour.", "J'ai cliqué sans rien remplir"),
      QF("Vous avez donné votre <b>numéro de carte bancaire</b> sur un faux site.", ["J'attends de voir mon relevé", "J'appelle ma banque tout de suite pour bloquer la carte", "Je réponds à l'e-mail pour annuler"], 1, "Le numéro de la banque est au dos de la carte. Plus on bloque vite, moins l'escroc peut s'en servir.", "J'ai donné ma carte"),
      QF("Vous avez tapé votre <b>mot de passe</b> sur un faux site.", ["Je le change tout de suite, sur le vrai site", "Ce n'est pas grave", "J'attends un e-mail de confirmation"], 0, "On le change sur le vrai site, et partout où on utilisait le même.", "J'ai donné mon mot de passe"),
      QF("Vous recevez ce message : « On vous a filmé avec votre webcam. Payez 500 €, sinon on publie la vidéo. »", ["Je paie pour être tranquille", "C'est un mensonge envoyé en masse : je supprime", "Je réponds pour négocier"], 1, "Ce chantage est envoyé au hasard à des milliers de personnes : il n'y a pas de vidéo. On ne paie jamais.", "Le chantage à la webcam"),
      QF("Vous recevez un message. Vous ne savez <b>pas s'il est vrai</b>.", ["Je clique pour vérifier", "Je vais moi-même sur le site, ou j'appelle le numéro que je connais", "Je le transfère à tous mes contacts"], 1, "Vérifier par soi-même : la règle d'or. Et on peut toujours demander au médiateur numérique !", "Dans le doute")
    ] });
})(window.AN);

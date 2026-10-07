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
      { kind: "order", inline: true, prompt: "L'adresse de <b>Marie Dupont</b>, chez <b>La Poste</b> :", answer: ["marie.dupont", "@", "laposte", ".net"], why: "Toujours dans cet ordre : <b>identifiant</b> @ <b>fournisseur</b> <b>.extension</b>." },
      { kind: "order", inline: true, prompt: "L'adresse de <b>contact</b> de la <b>mairie de Valbourg</b> :", answer: ["contact", "@", "mairie-valbourg", ".fr"], why: "Avant le @ : qui. Après le @ : chez qui. À la fin : l'extension (.fr)." },
      { kind: "order", inline: true, prompt: "L'adresse de <b>Paul Roux</b>, chez <b>Orange</b> :", answer: ["paul.roux", "@", "orange", ".fr"], why: "Le @ se lit « chez » : paul.roux <b>chez</b> orange.fr." }
    ] });

  const FOLDERS = ["📥 Réception", "📤 Envoyés", "📝 Brouillons", "🚫 Indésirables", "🗑️ Corbeille"];
  const folder = (prompt, ok, why, short) => ({ kind: "choice", layout: "folders", prompt, choices: FOLDERS, ok, why, short, limit: 20 });
  G({ id: "quel_dossier", title: "Dans quel dossier ?", icon: "🗂️",
    intro: "Pour chaque message, choisissez <b>le bon dossier</b> de la messagerie.",
    rounds: [
      folder("Un nouveau message de votre petite-fille, <b>pas encore lu</b>.", 0, "Les messages reçus arrivent dans la <b>boîte de réception</b>. En gras : pas encore lu.", "Message reçu non lu"),
      folder("La <b>copie</b> du message que vous avez <b>envoyé</b> à la mairie ce matin.", 1, "Tout ce que j'envoie est gardé dans <b>Envoyés</b> : je peux vérifier ce que j'ai écrit.", "Message envoyé"),
      folder("Un message que vous avez <b>commencé</b> hier, mais <b>pas encore envoyé</b>.", 2, "Les messages commencés sont dans <b>Brouillons</b> : on peut les reprendre plus tard.", "Message commencé"),
      folder("« Félicitations ! Vous avez gagné un smartphone, cliquez vite ! »", 3, "Publicités et arnaques vont dans <b>Indésirables</b> (ou « Spam »).", "Faux gain"),
      folder("Vous avez <b>supprimé par erreur</b> un message important. Où le récupérer ?", 4, "Un message supprimé reste un moment dans la <b>Corbeille</b> : on peut le restaurer.", "Supprimé par erreur"),
      folder("Le message de la médiathèque est <b>introuvable</b> dans la réception ! Où regarder ?", 3, "Parfois, un vrai message arrive par erreur dans les <b>Indésirables</b> : on y jette un œil.", "Message introuvable")
    ] });

  /* =================== SÉANCE 2 =================== */
  const BTN = ["↩️ Répondre", "↩️↩️ Répondre à tous", "↪️ Transférer"];
  const which = (prompt, ok, why, short) => ({ kind: "choice", prompt, choices: BTN, ok, why, short, limit: 20 });
  G({ id: "quel_bouton", title: "Quel bouton ?", icon: "↩️",
    intro: "Une situation s'affiche : <b>Répondre</b>, <b>Répondre à tous</b> ou <b>Transférer</b> ?",
    rounds: [
      which("La médiathèque vous demande si vous serez <b>présent(e) jeudi</b>.", 0, "Seule la médiathèque a besoin de votre réponse : <b>Répondre</b>.", "La médiathèque demande si je viens"),
      which("Vous voulez envoyer la <b>facture du plombier</b> à votre fille, qui gère vos papiers.", 2, "Votre fille n'a pas reçu ce message : on le lui <b>transfère</b>, avec la facture.", "Envoyer une facture à ma fille"),
      which("Toute la famille est en copie du repas de dimanche. Vous dites à <b>tout le monde</b> que vous apportez le dessert.", 1, "Tout le monde doit lire la réponse : <b>Répondre à tous</b>.", "Le dessert pour toute la famille"),
      which("Un message envoyé à <b>30 parents</b> annonce la fête de l'école. Vous voulez juste demander à l'organisatrice si vous pouvez aider.", 0, "Inutile d'écrire aux 30 personnes : <b>Répondre</b> à l'organisatrice suffit.", "Aider à la fête de l'école"),
      which("Votre voisin vous demande les horaires du club de marche : vous les avez reçus par e-mail.", 2, "On <b>transfère</b> le message du club à votre voisin.", "Les horaires du club pour le voisin"),
      which("Le médecin écrit à vous <b>et</b> à votre conjoint (en copie) pour changer l'heure. Vous confirmez pour les deux.", 1, "Le médecin et votre conjoint doivent lire la réponse : <b>Répondre à tous</b>.", "Confirmer au médecin et au conjoint")
    ] });

  G({ id: "ordre_mail", title: "Remets le mail dans l'ordre", icon: "🧩",
    intro: "Les morceaux d'un e-mail sont mélangés : remettez-les dans le bon ordre, du <b>haut</b> vers le <b>bas</b>.",
    rounds: [
      { kind: "order", limit: 75, prompt: "Un e-mail pour s'inscrire à l'atelier :", answer: ["Objet : Inscription atelier jeudi", "Bonjour,", "Je souhaite m'inscrire à l'atelier de jeudi à 14 h.", "Cordialement,", "Marie Dupont"], why: "Objet → formule de politesse → le message → formule de fin → signature." },
      { kind: "order", limit: 75, prompt: "Un e-mail à la mairie :", answer: ["Objet : Demande de rendez-vous", "Madame, Monsieur,", "Je souhaiterais prendre rendez-vous pour renouveler ma carte d'identité.", "Je vous remercie par avance.", "Bien cordialement,", "Paul Roux"], why: "Pour une administration : « Madame, Monsieur » au début, « Bien cordialement » à la fin." }
    ] });

  G({ id: "corrige_mail", title: "Corrige le mail", icon: "🖍️",
    intro: "Ce message pour la médiathèque contient <b>7 erreurs</b>. Cliquez dessus pour les trouver !",
    rounds: [{ kind: "spot", limit: 150, prompt: "Trouvez les <b>7 erreurs</b> de ce message envoyé à la médiathèque.", why: "Avant d'envoyer, on relit : destinataires, objet, politesse, pièces jointes.",
      zones: { dest: "Claire est dans « À » : elle devait être en copie (Cc)", objet: "L'objet est vide", salut: "« Salut » : trop familier pour la médiathèque", caps: "Tout en MAJUSCULES : cela donne l'impression de crier", faute: "« ateleir » : une faute de frappe, il faut relire", fin: "Pas de formule de politesse avant la signature", pj: "Une pièce jointe sans rapport avec la demande" },
      content: `<div class="mm"><div class="mm-bar"><span>✏️ Nouveau message</span><i></i><i></i><i></i></div>
        <div class="lp-field"><b>À</b> mediatheque@valbourg.fr ; <span class="z" data-z="dest">claire.dupont@gmail.com</span></div>
        <div class="lp-field"><b>Cc</b> <span class="lp-empty">(vide)</span></div>
        <div class="lp-field"><b>Objet</b> <span class="z" data-z="objet">(vide)</span></div>
        <div class="mm-body"><p><span class="z" data-z="salut">Salut,</span></p><p><span class="z" data-z="caps">JE VEUX M'INSCRIRE</span> à l'<span class="z" data-z="faute">ateleir</span> de jeudi avec ma fille Claire.</p><p><span class="z" data-z="fin">Marie</span></p>
        <p><span class="z" data-z="pj">${file("📎", "photo_vacances.jpg", "2,1 Mo")}</span></p></div></div>` }] });

  /* =================== SÉANCE 3 =================== */
  const pickFile = (prompt, choices, ok, why, short) => ({ kind: "choice", layout: "files", prompt, choices, ok, why, short, limit: 25 });
  G({ id: "bon_fichier", title: "Trouve le bon fichier", icon: "🔎",
    intro: "On vous demande un document : choisissez <b>le bon fichier</b> à joindre.",
    rounds: [
      pickFile(`La mairie demande un <b>justificatif de domicile de moins de 3 mois</b>. (Nous sommes en ${now.toLocaleDateString("fr-FR", { month: "long", year: "numeric" })}.)`,
        [file("📕", `facture_electricite_${monthAgo(8)}.pdf`), file("📕", `facture_electricite_${monthAgo(1)}.pdf`), file("🖼️", "photo_identite.jpg"), file("📕", `avis_impot_${Y}.pdf`)], 1,
        "Une facture d'électricité est un justificatif de domicile… à condition d'avoir <b>moins de 3 mois</b> : regardez la date dans le nom.", "Justificatif de moins de 3 mois"),
      pickFile("Pour votre carte d'identité, on vous demande une <b>photo d'identité récente</b>.",
        [file("🖼️", "photo_plage.jpg"), file("📕", "scan_carte_vitale.pdf"), file("🖼️", `photo_identite_${Y}.jpg`), file("⚙️", "photo_identite.exe")], 2,
        "Le nom et la date disent tout : <b>photo_identite_" + Y + ".jpg</b>. Et un <b>.exe</b> n'est jamais une photo !", "Photo d'identité"),
      pickFile("On vous demande votre <b>dernier avis d'impôt</b>.",
        [file("📕", `avis_impot_${Y - 6}.pdf`), file("📕", `avis_impot_${Y}.pdf`), file("📘", "declaration_brouillon.docx"), file("⚙️", "impots_installer.exe")], 1,
        `Le plus récent : <b>avis_impot_${Y}.pdf</b>. Les anciens avis ne servent plus pour les démarches de cette année.`, "Dernier avis d'impôt"),
      pickFile("Votre fille vous demande la <b>photo du repas de dimanche</b>.",
        [file("⚙️", "repas_dimanche.exe"), file("📕", "recette_tarte.pdf"), file("🖼️", "repas_dimanche.jpg"), file("🎬", "video_anniversaire.mp4", "2 Go")], 2,
        "Une photo, c'est un <b>.jpg</b>. Le .exe est un programme : jamais ! Et la vidéo de 2 Go est trop lourde pour un e-mail.", "Photo du repas")
    ] });

  const OD = ["✅ Je peux l'ouvrir", "⛔ Je ne l'ouvre pas"];
  const doc = (name, from, ok, why, short) => ({ kind: "choice", prompt: `<div class="lp-docq">${name}<small>${from}</small></div>`, choices: OD, ok, why, short, limit: 15 });
  G({ id: "document_danger", title: "Document ou danger ?", icon: "⛔",
    intro: "Une pièce jointe arrive : vous l'<b>ouvrez</b>, ou vous <b>ne l'ouvrez pas</b> ?",
    rounds: [
      doc(file("📕", "facture_septembre.pdf"), "de votre fournisseur d'électricité, que vous attendiez", 0, "Un <b>.pdf</b> attendu, d'un expéditeur connu : on peut l'ouvrir.", "facture_septembre.pdf (attendue)"),
      doc(file("⚙️", "facture.pdf.exe"), "d'un expéditeur inconnu", 1, "Le piège du double nom : la fin est <b>.exe</b>. C'est un programme déguisé en facture.", "facture.pdf.exe"),
      doc(file("🖼️", "photo_mariage.jpg"), "de votre cousine, qui vous l'avait promise", 0, "Une photo (.jpg) attendue, d'une personne connue : pas de souci.", "photo_mariage.jpg"),
      doc(file("🗜️", "suivi_colis.zip"), "d'un « service de livraison » inconnu", 1, "Un <b>.zip</b> d'un inconnu, pour un colis que vous n'attendez pas : on n'ouvre pas.", "suivi_colis.zip"),
      doc(file("📘", "recette_gateau.docx"), "de votre amie Josiane, qui vous l'avait proposée", 0, "Un texte (.docx) attendu, d'une amie : on peut l'ouvrir.", "recette_gateau.docx"),
      doc(file("⚙️", "mise_a_jour_securite.exe"), "« de votre banque », sans que vous l'ayez demandé", 1, "Une banque n'envoie jamais de programme (.exe) à installer par e-mail.", "mise_a_jour_securite.exe")
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
    intro: "Un message apparaît <b>ligne par ligne</b>. Dès que vous êtes sûr que c'est une arnaque, appuyez sur 🚩. Plus vous êtes rapide, plus vous gagnez ! Si tout est normal, attendez la fin.",
    rounds: [
      { kind: "buzz", fake: true, interval: 3, lines: lines("<b>De :</b> Suivi Colis &lt;notification@suivi-colis-express.top&gt;", "<b>Objet :</b> Votre colis est en attente", "Bonjour,", "Votre colis n'a pas pu être livré.", "Des frais de <b>1,99 €</b> sont à régler sous 24 h.", "Cliquez ici pour payer : suivi-colis-express.top/paiement"),
        why: "Dès la 1re ligne, l'adresse <b>suivi-colis-express.top</b> n'est celle d'aucun transporteur. Puis l'urgence et le paiement." },
      { kind: "buzz", fake: false, interval: 3, lines: lines("<b>De :</b> Médiathèque de Valbourg &lt;mediatheque@valbourg.fr&gt;", "<b>Objet :</b> Rappel : vos livres sont à rendre samedi", "Bonjour Madame Martin,", "Vos 3 livres sont à rendre avant samedi.", "Vous pouvez aussi les prolonger à l'accueil.", "Bonne lecture ! L'équipe de la médiathèque"),
        why: "Tout est rassurant : l'adresse habituelle, votre nom, aucune urgence, rien de secret demandé. Un <b>vrai message</b>." },
      { kind: "buzz", fake: true, interval: 3, lines: lines("<b>De :</b> Banque du Valbourg &lt;securite@banque-valbourg-alerte.com&gt;", "<b>Objet :</b> Activité inhabituelle sur votre compte", "Cher(e) client(e),", "Par sécurité, votre compte sera suspendu aujourd'hui.", "Pour l'éviter, confirmez votre mot de passe et le code reçu par SMS.", "Confirmer mon identité : banque-valbourg-alerte.com/verification"),
        why: "L'adresse <b>banque-valbourg-alerte.com</b> n'est pas celle de la banque, puis « Cher(e) client(e) », l'urgence… et le <b>code SMS</b> : jamais !" }
    ] });

  /* =================== SÉANCE 5 =================== */
  const OP = ["✅ Officiel", "🚩 Piège"];
  const link = (u, ok, why) => ({ kind: "choice", prompt: `<div class="lp-url">${u}</div>`, choices: OP, ok, why, short: u, limit: 15 });
  G({ id: "officiel_piege", title: "Officiel ou piège ?", icon: "🔗",
    intro: "Un lien s'affiche : <b>site officiel</b> ou <b>piège</b> ? Regardez le vrai nom, juste avant le premier « / ».",
    rounds: [
      link("https://www.impots.gouv.fr/accueil", 0, "Le vrai nom est <b>impots.gouv.fr</b> : le site officiel."),
      link("https://impots.gouv.fr.remboursement-dossier.com/accueil", 1, "Le début est un déguisement : le vrai nom est <b>remboursement-dossier.com</b>."),
      link("https://www.ameli.fr/assure", 0, "Le vrai nom est <b>ameli.fr</b> : le site de l'Assurance Maladie."),
      link("http://ameli-carte-vitale.info/renouvellement", 1, "Le vrai nom est <b>ameli-carte-vitale.info</b>, pas ameli.fr."),
      link("https://antai-paiement-amende.com/payer", 1, "Le seul site officiel des amendes est <b>antai.gouv.fr</b>."),
      link("https://www.antai.gouv.fr", 0, "<b>antai.gouv.fr</b> : le site officiel des amendes."),
      link("https://www.impots-gouv.fr/connexion", 1, "Un tiret remplace le point : <b>impots-gouv.fr</b> n'est pas impots.gouv.fr."),
      link("https://www.librairieduparc.fr/mes-commandes", 0, "Si c'est bien le site où vous avez commandé, c'est le bon : <b>librairieduparc.fr</b>.")
    ] });

  const VA = ["✅ Vrai message", "🚩 Arnaque"];
  G({ id: "vrai_arnaque", title: "Vrai ou arnaque ?", icon: "🙋",
    intro: "Des messages complets, vrais et faux mélangés. Lisez bien (l'adresse du lien est en bas du message), puis votez !",
    rounds: K.VOTE_MSGS().map(m => {
      const ctx = m.context ? `<div class="l-ctx">📌 ${m.context}</div>` : "";
      const subject = (m.mockHTML.match(/class="mm-subject">([\s\S]*?)<\/div>/) || [, ""])[1].replace(/<[^>]+>/g, "").trim();
      return { kind: "choice", limit: 30, prompt: `<div class="show-status">${ctx}${m.mockHTML}</div>`, choices: VA, ok: m.fake ? 1 : 0, short: subject,
        revealHTML: `<div class="all-shown">${ctx}${m.mockHTML}</div>`,
        why: K.notes(m.items.map(i => [...i, !m.fake])).replace(/data-reveal="\d+"/g, "") };
    }) });

  const QF = (prompt, choices, ok, why, short) => ({ kind: "choice", prompt, choices, ok, why, short, limit: 25 });
  G({ id: "que_faire", title: "Que faites-vous ?", icon: "🆘", noRank: true,
    intro: "Des situations qui font peur… et ce qu'il faut faire, <b>calmement</b>. Pas de classement : on en parle ensemble.",
    rounds: [
      QF("Vous avez cliqué sur le lien d'un faux message, mais vous n'avez <b>rien rempli</b>.", ["Je ferme la page et je supprime le message", "J'éteins l'ordinateur et je ne m'en sers plus", "Je remplis quand même, pour voir"], 0, "En général, il ne s'est rien passé : le danger, c'est de remplir. On ferme la page, on garde son ordinateur à jour.", "J'ai cliqué sans rien remplir"),
      QF("Vous avez donné votre <b>numéro de carte bancaire</b> sur un faux site.", ["J'attends de voir mon relevé", "J'appelle ma banque tout de suite pour bloquer la carte", "Je réponds à l'e-mail pour annuler"], 1, "Le numéro de la banque est au dos de la carte. Plus on bloque vite, moins l'escroc peut s'en servir.", "J'ai donné ma carte"),
      QF("Vous avez tapé votre <b>mot de passe</b> sur un faux site.", ["Je le change tout de suite, sur le vrai site", "Ce n'est pas grave", "J'attends un e-mail de confirmation"], 0, "On le change sur le vrai site, et partout où on utilisait le même.", "J'ai donné mon mot de passe"),
      QF("« On vous a filmé avec votre webcam. Payez 500 €, sinon on publie la vidéo. »", ["Je paie pour être tranquille", "C'est un mensonge envoyé en masse : je supprime", "Je réponds pour négocier"], 1, "Ce chantage est envoyé au hasard à des milliers de personnes : il n'y a pas de vidéo. On ne paie jamais.", "Le chantage à la webcam"),
      QF("Vous n'êtes <b>pas sûr</b> qu'un message soit vrai.", ["Je clique pour vérifier", "Je vais moi-même sur le site, ou j'appelle le numéro que je connais", "Je le transfère à tous mes contacts"], 1, "Vérifier par soi-même : la règle d'or. Et on peut toujours demander au médiateur numérique !", "Dans le doute")
    ] });
})(window.AN);

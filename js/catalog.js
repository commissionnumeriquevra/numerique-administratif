/* =========================================================
   Catalogue : missions, parcours et fiches-mémo
   Ajouter une mission = l'ajouter ici + écrire son fichier
   dans js/missions/ (AN.missions.register).
   ========================================================= */
(function (AN) {
  "use strict";

  const missions = {
    mouse_nav:       { label: "Explorer des sites administratifs à la souris", short: "Navigation souris", icon: "🖱️", family: "Bases" },
    keyboard_skills: { label: "Maîtriser les touches essentielles du clavier", short: "Touches du clavier", icon: "⌨️", family: "Bases" },
    fill_form:       { label: "Remplir un formulaire avec la touche Tab", short: "Formulaire au clavier", icon: "📝", family: "Bases" },
    download_doc:    { label: "Télécharger un document", short: "Télécharger", icon: "📥", family: "Documents" },
    find_file:       { label: "Retrouver un fichier téléchargé", short: "Retrouver un fichier", icon: "🗂️", family: "Documents" },
    missing_piece:   { label: "Pièce manquante au dossier", short: "Pièce manquante", icon: "📎", family: "Documents" },
    appointment:     { label: "Prendre un rendez-vous en ligne", short: "Rendez-vous en ligne", icon: "📅", family: "Démarches" },
    password_reset:  { label: "Mot de passe oublié", short: "Mot de passe oublié", icon: "🔑", family: "Démarches" },
    mail_read:       { label: "E-mail niv. 1 — Lire ses e-mails", short: "Lire ses e-mails", icon: "📬", family: "E-mail" },
    mail_address:    { label: "E-mail niv. 2 — L'adresse e-mail", short: "Adresse e-mail", icon: "＠", family: "E-mail" },
    mail_reply:      { label: "E-mail niv. 3 — Répondre et transférer", short: "Répondre / transférer", icon: "↩️", family: "E-mail" },
    mail_compose:    { label: "E-mail niv. 4 — Écrire un e-mail complet", short: "Écrire un e-mail", icon: "✏️", family: "E-mail" },
    mail_attach:     { label: "E-mail niv. 5 — Les pièces jointes", short: "Pièces jointes", icon: "📎", family: "E-mail" },
    suspicious_mail: { label: "Reconnaître un e-mail suspect", short: "E-mail suspect", icon: "🎣", family: "Sécurité" },
    mail_challenge:  { label: "E-mail niv. 7 — Le défi de la boîte mail", short: "Défi boîte mail", icon: "🏆", family: "E-mail" },
    sms_scam:        { label: "Repérer un SMS frauduleux", short: "SMS frauduleux", icon: "📱", family: "Sécurité" },
    secure_payment:  { label: "Payer en ligne en sécurité", short: "Paiement en ligne", icon: "💳", family: "Sécurité" },
    custom:          { label: "Mission personnalisée", short: "Personnalisée", icon: "✏️", family: "Personnalisées" }
  };

  /* Un parcours = plusieurs missions débloquées dans l'ordre. */
  const parcours = {
    p_bases:    { label: "Parcours « Premiers pas » (souris, clavier, formulaire)", icon: "🌱", steps: ["mouse_nav", "keyboard_skills", "fill_form"] },
    p_dossier:  { label: "Parcours administratif complet (document → dossier)", icon: "🧭", steps: ["download_doc", "find_file", "missing_piece", "appointment"] },
    p_email:    { label: "📧 Chapitre E-mail (7 niveaux)", icon: "📧", steps: ["mail_read", "mail_address", "mail_reply", "mail_compose", "mail_attach", "suspicious_mail", "mail_challenge"] },
    p_securite: { label: "Parcours « Se protéger des arnaques »", icon: "🛡️", steps: ["suspicious_mail", "sms_scam", "password_reset", "secure_payment"] }
  };

  /* Fiches-mémo imprimables : ce que le participant emporte chez lui. */
  const memos = {
    mouse_nav: ["Lire les noms des rubriques avant de cliquer.", "Un seul clic gauche suffit sur un site web.", "L'onglet actif est souligné ou coloré : il indique où je suis.", "Perdu ? Je reviens à « Accueil »."],
    keyboard_skills: ["⌫ Retour arrière efface la lettre avant le curseur.", "Maj ⇧ + lettre = une majuscule.", "Tab ↹ avance, Maj + Tab recule.", "Espace coche une case, Entrée valide un bouton."],
    fill_form: ["Une étoile * signale un champ obligatoire.", "Tab ↹ pour passer au champ suivant sans souris.", "Les flèches changent le choix dans une liste.", "Je relis tout avant de cliquer sur « Valider »."],
    download_doc: ["La flèche vers le bas ⬇ signifie « Télécharger ».", "Le fichier arrive dans le dossier « Téléchargements ».", "Je vérifie le nom du fichier (attestation, avis…).", "Un .pdf est un document ; un .exe est un programme : prudence."],
    find_file: ["Explorateur de fichiers → dossier « Téléchargements ».", "Trier par date pour voir le plus récent en premier.", "Renommer un fichier : nom clair + année (ex : avis_impot_2025).", "Ranger mes papiers dans un dossier « Mes démarches »."],
    missing_piece: ["Je lis le nom EXACT de la pièce demandée.", "Je vérifie la date du document (moins de 3 mois ?).", "« Joindre » = ajouter un fichier, puis je vérifie son nom.", "J'attends le message de confirmation."],
    appointment: ["Je choisis d'abord le bon motif.", "Les jours grisés ne sont pas disponibles.", "Je note la référence du rendez-vous.", "Un message de confirmation arrive dans ma messagerie."],
    password_reset: ["Lien « Mot de passe oublié ? » sous le formulaire de connexion.", "Le lien de réinitialisation arrive par e-mail (vérifier les spams).", "Un bon mot de passe : 12 caractères ou plus, mélangés, ou une phrase.", "Un mot de passe différent pour chaque site, jamais communiqué."],
    suspicious_mail: ["Urgence + menace = signal d'alerte.", "Je regarde l'adresse réelle de l'expéditeur.", "Je ne clique pas : j'ouvre moi-même le site officiel.", "Aucun service ne demande mon mot de passe ou ma carte par e-mail."],
    sms_scam: ["Colis, amende, CPF, Vitale : arnaques fréquentes par SMS.", "Un lien court ou bizarre = méfiance.", "Je ne rappelle pas un numéro inconnu surtaxé.", "Je signale les SMS frauduleux au 33700."],
    secure_payment: ["Adresse du site en https:// et nom de domaine exact.", "Je vérifie le montant et le commerçant avant de valider.", "Le code de confirmation reçu par SMS ne se donne à personne.", "Montant ou commerçant inconnu ? J'annule."],
    mail_read: ["Un message en gras = un message non lu.", "Je clique une fois sur un message pour l'ouvrir.", "En haut : l'expéditeur (« De »), l'objet et la date.", "Le trombone 📎 signale une pièce jointe : je clique dessus pour l'ouvrir."],
    mail_address: ["Une adresse = identifiant @ fournisseur . extension", "@ (arobase) : touche AltGr + à", "Jamais d'espace, jamais d'accent, une seule @.", "Une seule lettre fausse et le message n'arrive pas : je vérifie."],
    mail_reply: ["↩️ Répondre : seulement à la personne qui m'a écrit.", "↩️↩️ Répondre à tous : à elle et aux personnes en copie.", "↪️ Transférer : envoyer le message à quelqu'un d'autre (avec ses pièces jointes).", "« RE : » = une réponse, « TR : » = un transfert."],
    mail_compose: ["À : la personne à qui j'écris.", "Cc : une copie, visible par tous. Cci : une copie cachée.", "Objet : quelques mots qui résument mon message.", "Bonjour… Cordialement : la politesse au début et à la fin. Pas de MAJUSCULES."],
    mail_attach: ["Joindre 📎 = ajouter un fichier à mon message.", "Télécharger ⬇️ = garder sur mon ordinateur un fichier reçu (dossier Téléchargements).", "Avant d'envoyer, je vérifie que la pièce jointe est bien là.", "Un .pdf est un document ; un .exe est un programme : prudence."],
    mail_challenge: ["Arnaque ? Je ne clique pas : 🚫 Indésirable.", "Publicité inutile : 🗑️ Supprimer.", "Message important supprimé par erreur : Corbeille → Restaurer.", "🔍 La recherche retrouve un message en tapant un nom ou un mot."],
    custom: ["Je lis la consigne en entier avant de commencer.", "Je prends mon temps.", "Je n'hésite pas à demander de l'aide."]
  };

  AN.catalog = {
    missions, parcours, memos,
    label: t => missions[t]?.label || t,
    icon: t => missions[t]?.icon || "✦",
    families() {
      const out = {};
      Object.entries(missions).forEach(([k, v]) => { if (k !== "custom") (out[v.family] ||= []).push(k); });
      return out;
    }
  };
})(window.AN);

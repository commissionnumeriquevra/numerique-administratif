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
    mail_fraud:      { label: "E-mail niv. 6 — Repérer un e-mail frauduleux", short: "E-mail frauduleux", icon: "🕵️", family: "E-mail" },
    suspicious_mail: { label: "Reconnaître un e-mail suspect", short: "E-mail suspect", icon: "🎣", family: "Sécurité" },
    mail_challenge:  { label: "E-mail niv. 7 — Le défi de la boîte mail", short: "Défi boîte mail", icon: "🏆", family: "E-mail" },
    nav_open:        { label: "Navigateur niv. 1 — Ouvrir un site", short: "Ouvrir un site", icon: "🧭", family: "Navigateur" },
    nav_buttons:     { label: "Navigateur niv. 2 — Les boutons, les onglets, les favoris", short: "Boutons et onglets", icon: "🗂️", family: "Navigateur" },
    nav_search:      { label: "Navigateur niv. 3 — Faire une recherche", short: "Faire une recherche", icon: "🔎", family: "Navigateur" },
    nav_results:     { label: "Navigateur niv. 4 — Choisir le bon résultat", short: "Le bon résultat", icon: "🎯", family: "Navigateur" },
    nav_fakesite:    { label: "Navigateur niv. 5 — Vrai ou faux site ?", short: "Vrai ou faux site", icon: "🕵️", family: "Navigateur" },
    nav_alert:       { label: "Navigateur niv. 6 — Fausses alertes et fenêtres pièges", short: "Fausses alertes", icon: "🚨", family: "Navigateur" },
    nav_real:        { label: "Navigateur niv. 7 — Mission réelle sur Internet", short: "Mission réelle", icon: "🌍", family: "Navigateur" },
    acc_login:       { label: "Comptes niv. 1 — Se connecter, se déconnecter", short: "Se connecter", icon: "👤", family: "Comptes" },
    acc_signup:      { label: "Comptes niv. 2 — Créer un compte", short: "Créer un compte", icon: "🆕", family: "Comptes" },
    acc_pirate:      { label: "Comptes niv. 3 — Dans la peau du pirate", short: "Dans la peau du pirate", icon: "🕵️", family: "Comptes" },
    acc_phrase:      { label: "Comptes niv. 4 — Fabriquer une phrase de passe", short: "Phrase de passe", icon: "🧩", family: "Comptes" },
    acc_vault:       { label: "Comptes niv. 5 — Le coffre-fort à mots de passe", short: "Coffre-fort", icon: "🔐", family: "Comptes" },
    acc_sms:         { label: "Comptes niv. 6 — Le code par SMS et le faux conseiller", short: "Code par SMS", icon: "📱", family: "Comptes" },
    acc_reset:       { label: "Comptes niv. 7 — Mot de passe oublié, compte piraté", short: "Mot de passe oublié", icon: "🔑", family: "Comptes" },
    acc_real:        { label: "Comptes niv. 8 — Mission réelle : observer une page de connexion", short: "Mission réelle", icon: "🌍", family: "Comptes" },
    fic_explore:     { label: "Fichiers niv. 1 — Se repérer dans l'Explorateur", short: "Se repérer", icon: "📁", family: "Fichiers" },
    fic_ext:         { label: "Fichiers niv. 2 — La famille d'un fichier : l'extension", short: "Les extensions", icon: "🏷️", family: "Fichiers" },
    fic_rename:      { label: "Fichiers niv. 3 — Bien nommer ses fichiers", short: "Bien nommer", icon: "✏️", family: "Fichiers" },
    fic_folders:     { label: "Fichiers niv. 4 — Ranger : créer des dossiers", short: "Ranger", icon: "🗂️", family: "Fichiers" },
    fic_trash:       { label: "Fichiers niv. 5 — Supprimer et récupérer (la Corbeille)", short: "La Corbeille", icon: "🗑️", family: "Fichiers" },
    fic_find:        { label: "Fichiers niv. 6 — Retrouver un fichier", short: "Retrouver", icon: "🔍", family: "Fichiers" },
    fic_send:        { label: "Fichiers niv. 7 — Joindre un document à une démarche", short: "Joindre un document", icon: "📎", family: "Fichiers" },
    fic_real:        { label: "Fichiers niv. 8 — Mission réelle sur le vrai ordinateur", short: "Mission réelle", icon: "🌍", family: "Fichiers" },
    sms_scam:        { label: "Repérer un SMS frauduleux", short: "SMS frauduleux", icon: "📱", family: "Sécurité" },
    secure_payment:  { label: "Payer en ligne en sécurité", short: "Paiement en ligne", icon: "💳", family: "Sécurité" },
    custom:          { label: "Mission personnalisée", short: "Personnalisée", icon: "✏️", family: "Personnalisées" }
  };

  /* Un parcours = plusieurs missions débloquées dans l'ordre. */
  const parcours = {
    p_bases:    { label: "Parcours « Premiers pas » (souris, clavier, formulaire)", icon: "🌱", steps: ["mouse_nav", "keyboard_skills", "fill_form"] },
    p_dossier:  { label: "Parcours administratif complet (document → dossier)", icon: "🧭", steps: ["download_doc", "find_file", "missing_piece", "appointment"] },
    p_email:    { label: "📧 Chapitre E-mail (7 niveaux)", icon: "📧", steps: ["mail_read", "mail_address", "mail_reply", "mail_compose", "mail_attach", "mail_fraud", "mail_challenge"] },
    p_nav:      { label: "🧭 Chapitre Navigateurs et recherche (7 niveaux)", icon: "🧭", steps: ["nav_open", "nav_buttons", "nav_search", "nav_results", "nav_fakesite", "nav_alert", "nav_real"] },
    p_comptes:  { label: "🔑 Chapitre Comptes et mots de passe (8 niveaux)", icon: "🔑", steps: ["acc_login", "acc_signup", "acc_pirate", "acc_phrase", "acc_vault", "acc_sms", "acc_reset", "acc_real"] },
    p_fichiers: { label: "🗂️ Chapitre Fichiers et dossiers (8 niveaux)", icon: "🗂️", steps: ["fic_explore", "fic_ext", "fic_rename", "fic_folders", "fic_trash", "fic_find", "fic_send", "fic_real"] },
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
    mail_fraud: ["🫶 Lire un message est sans danger. Le danger : cliquer, ouvrir une pièce jointe inattendue, donner des informations.", "Les 5 questions : 🔍 Qui m'écrit vraiment ? 🤔 Est-ce que je l'attendais ? ⏰ Me met-on la pression ? 🔑 Que me demande-t-on ? 🔗 Où mène le lien ?", "Je clique sur le nom de l'expéditeur pour voir l'adresse : je regarde la fin, après le @. « .gouv.fr » = l'État ; Gmail, Hotmail = jamais une administration.", "Jamais par e-mail : mot de passe, code reçu par SMS, numéro de carte bancaire.", "Le vrai nom d'un site est juste avant le premier « / » : impots.gouv.fr ✅ — impots.gouv.fr.rembourse.com ❌. Le cadenas 🔒 ne prouve rien.", "Dans le doute : je ne clique pas, je vais moi-même sur le site ou j'appelle le numéro que je connais.", "J'ai donné ma carte ? J'appelle ma banque tout de suite (numéro au dos de la carte). Aide : cybermalveillance.gouv.fr — Signaler : signal-spam.fr, 33700 (SMS)."],
    mail_challenge: ["Arnaque ? Je ne clique pas : 🚫 Indésirable.", "Publicité inutile : 🗑️ Supprimer.", "Message important supprimé par erreur : Corbeille → Restaurer.", "🔍 La recherche retrouve un message en tapant un nom ou un mot."],
    nav_open: ["Le navigateur (Chrome, Edge, Firefox…) est la porte d'entrée d'Internet.", "La barre d'adresse est tout en haut : je clique dedans, je tape l'adresse exacte, puis Entrée.", "Une adresse : sans espace, sans accent, avec des points (www.mairie-valbourg.fr).", "Le menu d'un site m'emmène vers ses rubriques ; un lien m'emmène vers une autre page."],
    nav_buttons: ["← revient à la page d'avant, → refait le chemin.", "⟳ actualise : la page est rechargée (premier réflexe si elle bloque).", "＋ ouvre un nouvel onglet ; ✕ ferme un onglet (je lis son nom avant !).", "☆ garde un site en favori : un clic pour y revenir."],
    nav_search: ["Un moteur de recherche (Google, Bing, Qwant…) trouve des sites pour moi.", "Des mots-clés, pas une phrase : QUOI + OÙ (+ QUAND). Ex. : horaires déchetterie Valbourg.", "Les accents et majuscules ne sont pas obligatoires dans une recherche.", "Je lis les résultats avant de cliquer."],
    nav_results: ["« Sponsorisé » = une publicité payée, souvent tout en haut.", "Pour une démarche, je cherche le site officiel : .gouv.fr, service-public.fr, le site de ma mairie.", "Un site qui fait payer une démarche gratuite est un intermédiaire : je reviens en arrière.", "Les forums donnent des avis, pas des démarches."],
    nav_fakesite: ["Le vrai nom du site est juste avant le premier « / » : impots.gouv.fr ✅ — impots-gouv-remboursement.com ❌.", "Le cadenas 🔒 = connexion chiffrée. Il ne prouve PAS que le site est honnête.", "« Non sécurisé » : je ne tape jamais de mot de passe ni de carte.", "Fautes, urgence, compte à rebours, carte bancaire demandée = faux site."],
    nav_alert: ["Une alerte virus dans le navigateur, avec un numéro à appeler, est TOUJOURS fausse.", "Je n'appelle pas, je ne clique pas dedans : Échap, puis je ferme l'onglet ✕.", "Si ça bloque : je ferme le navigateur, ou j'éteins l'ordinateur.", "J'ai appelé ? Je raccroche. On a pris la main ? J'éteins, j'appelle ma banque, cybermalveillance.gouv.fr.", "Cookies : j'ai le droit de « Tout refuser ». « Vous avez gagné » : je ferme avec ✕."],
    nav_real: ["Nouvel onglet : ＋ ou Ctrl + T. Je garde l'onglet de départ ouvert.", "Mots-clés → je lis les résultats → j'évite les « Sponsorisé » → je vérifie le vrai nom du site.", "Pour chercher une information, je n'ai jamais besoin de donner mes coordonnées.", "Une fenêtre bizarre : Échap, je ferme l'onglet, je demande de l'aide."],
    acc_login: ["Un compte = un identifiant (souvent l'adresse e-mail) + un mot de passe.", "Le bouton 👁 affiche ce que je tape : pratique pour vérifier.", "Majuscules et minuscules comptent. Attention à la touche Verr. Maj !", "Sur un ordinateur partagé : jamais « Se souvenir de moi », et toujours « Se déconnecter »."],
    acc_signup: ["Les champs avec * sont obligatoires.", "Confirmer le mot de passe = le retaper à l'identique.", "Après l'inscription : je clique sur le lien de l'e-mail de confirmation.", "Pas dans la réception ? Je regarde dans les Indésirables."],
    acc_pirate: ["Les pirates : 1) essaient les mots de passe volés sur d'autres sites, 2) les mots de passe courants, 3) les infos que je publie.", "Prénoms, animaux, dates de naissance : les premiers essayés.", "Ajouter un « ! » ou une majuscule ne suffit pas.", "Le pirate cherche la proie facile : si ça résiste, il passe à quelqu'un d'autre."],
    acc_phrase: ["La recette : 4 mots ou plus, sans rapport avec ma vie (ex. : Trois tomates dansent sous la pluie !).", "Pour la retenir, j'imagine la scène.", "Un mot de passe différent par site.", "Ma messagerie mérite le plus solide : c'est la clé de toutes les clés."],
    acc_vault: ["Le coffre-fort invente, enregistre et remplit mes mots de passe.", "Ordinateur : « Utiliser le mot de passe suggéré », puis « Enregistrer ».", "iPhone : l'app « Mots de passe », déverrouillée avec Face ID ou le code.", "Je n'ai plus qu'un mot de passe à retenir : celui de mon compte Google ou Apple. Il doit être très solide."],
    acc_sms: ["Le code reçu par SMS est une deuxième clé : je le tape moi-même sur le site.", "Je ne le donne JAMAIS : ni à un conseiller, ni à un technicien, ni à la police.", "Un doute au téléphone ? Je raccroche et j'appelle le numéro au dos de ma carte.", "Un code reçu sans rien faire ? Je change mon mot de passe."],
    acc_reset: ["« Mot de passe oublié ? » : un lien arrive par e-mail (valable peu de temps).", "Je ne devine pas au hasard : le compte peut se bloquer.", "Compte piraté ? Je change le mot de passe en allant moi-même sur le site, et je préviens mes contacts.", "Aide : cybermalveillance.gouv.fr"],
    acc_real: ["FranceConnect : une seule clé (celle d'ameli, des impôts…) pour les sites de l'État.", "Le lien « mot de passe oublié » est toujours près du bouton de connexion.", "J'observe sans rien taper quand on me demande juste de regarder.", "Je vérifie toujours le vrai nom du site."],
    fic_explore: ["L'Explorateur de fichiers (📁 jaune, ou ⊞ Windows + E) montre tout ce que l'ordinateur range.", "Double-clic = ouvrir un dossier ou un fichier.", "Le chemin (Ce PC › Documents › Santé) dit où je suis.", "Perdu(e) ? La flèche ← revient en arrière ; la colonne de gauche ramène aux grands dossiers."],
    fic_ext: ["L'extension, c'est la fin du nom : .pdf (document), .jpg (photo), .docx (Word), .zip (compressé), .exe (programme).", "Pour la voir : Afficher › Extensions de noms de fichiers.", "Seule la DERNIÈRE extension compte : « facture.pdf.exe » est un programme déguisé.", "Un programme inconnu demande la permission ? Je clique « Non »."],
    fic_rename: ["Un bon nom = ce que c'est + de qui + la date : facture_edf_2026-09.pdf", "Renommer : clic sur le fichier, puis ✏️ Renommer (ou F2), puis Entrée.", "Je garde toujours la fin « .pdf », « .jpg »…", "« document (1) », « (2) » : le signe qu'il faut renommer."],
    fic_folders: ["Nouveau dossier : ＋ Nouveau › Dossier, je tape le nom, Entrée.", "Ranger : je glisse le fichier sur le dossier, ou ✂️ Couper puis 📋 Coller.", "Quelques dossiers simples suffisent : Santé, Impôts, Maison, Papiers…", "Couper ne supprime rien : le fichier bouge seulement au moment de Coller."],
    fic_trash: ["Supprimer = le fichier va dans la Corbeille. Il n'est pas perdu tout de suite.", "Erreur ? Corbeille › clic sur le fichier › Restaurer : il revient à sa place.", "« Vider la Corbeille » supprime pour de bon : je regarde avant.", "Sur une clé USB, la suppression est souvent définitive."],
    fic_find: ["Ce que je télécharge va dans Téléchargements.", "Trier par date (Modifié le, décroissant) : le plus récent est en haut.", "La loupe 🔍 cherche dans le dossier ouvert : pour chercher partout, je me place dans Ce PC.", "Un seul mot suffit : « permis », « facture »…"],
    fic_send: ["« Parcourir… » ouvre une fenêtre pour choisir un fichier sur l'ordinateur.", "Je vérifie : le bon document, la bonne date (moins de 3 mois ?), le bon côté (recto).", "Je vérifie le format (PDF, JPG…) et la taille (5 Mo maximum ?).", "Une photo de téléphone est lourde : un PDF est souvent plus léger."],
    fic_real: ["⊞ Windows + E ouvre l'Explorateur.", "Téléchargements trié par date : je retrouve vite le dernier fichier.", "J'affiche les extensions une fois pour toutes.", "Je me crée un dossier « Atelier numérique » pour ranger ce que je fais en atelier."],
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

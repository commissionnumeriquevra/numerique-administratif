/* =========================================================
   Réponses rapides : bibliothèque par défaut, classée par catégorie.
   Variables remplacées au moment de l'insertion dans la messagerie :
     {date}      date du jour            {date+15}  date dans 15 jours
     {num}       numéro de dossier       {code}     code à 6 chiffres
   ========================================================= */
(function (AN) {
  "use strict";

  // subject = objet du message reçu par le participant
  const categories = [
    { id: "suivi", label: "📥 Réception et suivi", subject: "Suivi de votre dossier" },
    { id: "docs", label: "📄 Problèmes de documents", subject: "Pièces justificatives" },
    { id: "decision", label: "✅ Décisions", subject: "Décision concernant votre demande" },
    { id: "rdv", label: "📅 Rendez-vous et démarches", subject: "Votre rendez-vous" },
    { id: "compte", label: "🔐 Compte et sécurité", subject: "Sécurité de votre compte" },
    { id: "relance", label: "⏰ Rappels et relances", subject: "Rappel important" },
    { id: "paiement", label: "💶 Paiements et montants", subject: "Vos paiements" },
    { id: "arnaque", label: "⚠️ Pièges à reconnaître", subject: "URGENT – Action requise" },
    { id: "formateur", label: "🧑‍🏫 Messages du formateur", subject: "Message du formateur" },
    { id: "perso", label: "⭐ Mes réponses", subject: "Message du formateur" }
  ];

  const r = (cat, title, text) => ({ cat, title, text });

  const defaults = [
    /* ----- Réception et suivi ----- */
    r("suivi", "Demande bien reçue", "Nous avons bien reçu votre demande n° {num} le {date}. Elle sera traitée dans un délai de 15 jours. Conservez ce numéro : il vous sera demandé pour tout échange."),
    r("suivi", "En cours d'examen", "Votre dossier n° {num} est en cours d'examen. Vous serez informé(e) par e-mail de la décision. Inutile de renvoyer votre demande."),
    r("suivi", "Délai prolongé", "En raison d'un nombre important de demandes, le traitement de votre dossier prendra plus de temps que prévu. Nous vous remercions de votre patience."),
    r("suivi", "Documents ajoutés", "Les documents que vous avez envoyés ont bien été ajoutés à votre dossier. Ils seront vérifiés dans les prochains jours."),
    r("suivi", "Dossier complet", "Merci. Votre dossier est maintenant complet. Il va être examiné."),
    r("suivi", "Transmis à un autre service", "Votre demande a été transmise au service compétent. Il reviendra vers vous directement."),
    r("suivi", "Changement de situation", "Votre changement de situation (adresse, famille ou ressources) a bien été pris en compte. Vos droits vont être recalculés."),
    r("suivi", "Nouveau document dans l'espace", "Un nouveau document est disponible dans votre espace personnel. Connectez-vous pour le consulter. Pour votre sécurité, il n'est pas joint à ce message."),

    /* ----- Problèmes de documents ----- */
    r("docs", "Pièce manquante", "Il manque un ou plusieurs documents à votre demande. Relisez la liste des pièces demandées et transmettez les bons documents."),
    r("docs", "Mauvais document", "Le document transmis ne correspond pas à la pièce demandée. Vérifiez le nom du document et renvoyez le bon fichier."),
    r("docs", "Document illisible", "Le document reçu n'est pas assez lisible. Merci de transmettre une copie plus nette."),
    r("docs", "Document expiré", "Le justificatif transmis n'est plus valide. Merci d'envoyer un document de moins de 3 mois."),
    r("docs", "Recto seulement", "Seul le recto de votre pièce d'identité a été reçu. Merci d'envoyer aussi le verso."),
    r("docs", "Mauvais format / trop lourd", "Votre fichier n'a pas pu être enregistré. Il doit être au format PDF, JPG ou PNG et ne pas dépasser 5 Mo."),
    r("docs", "Une seule page reçue", "Votre document comporte plusieurs pages mais une seule a été reçue. Merci de regrouper toutes les pages dans un seul fichier PDF."),
    r("docs", "Document coupé", "Une partie du document est coupée. Merci de photographier ou de scanner la page entière, bords compris."),
    r("docs", "Nom différent", "Le nom figurant sur le justificatif ne correspond pas à celui du demandeur. Merci de fournir une attestation d'hébergement accompagnée de la pièce d'identité de l'hébergeant."),
    r("docs", "Signature manquante", "Le formulaire n'est pas signé. Merci de l'imprimer, de le signer et de le renvoyer."),
    r("docs", "Photo non conforme", "La photo d'identité transmise n'est pas conforme : fond trop sombre, visage pas assez visible ou photo trop ancienne. Merci d'en fournir une nouvelle de moins de 6 mois."),
    r("docs", "Mauvaise année", "L'avis d'imposition transmis ne correspond pas à la bonne année. Merci d'envoyer le dernier avis d'imposition que vous avez reçu."),
    r("docs", "RIB pas à votre nom", "Le RIB transmis n'est pas à votre nom. Merci de fournir un RIB à votre nom pour recevoir les versements."),

    /* ----- Décisions ----- */
    r("decision", "Demande acceptée", "Votre demande a été acceptée. Vous recevrez votre premier versement le {date+30}."),
    r("decision", "Acceptée en partie", "Votre demande est acceptée pour une partie seulement. Le détail du calcul est disponible dans votre espace personnel."),
    r("decision", "Demande refusée", "Après examen, votre demande ne peut pas aboutir car vos ressources dépassent le plafond autorisé. Vous pouvez contester cette décision dans un délai de 2 mois, en ligne ou par courrier."),
    r("decision", "Classée sans suite", "Votre demande a été classée sans suite car les pièces demandées n'ont pas été reçues dans les délais. Vous pouvez déposer une nouvelle demande."),
    r("decision", "Recours enregistré", "Votre recours a bien été enregistré. Une nouvelle décision vous sera envoyée dans un délai de 2 mois."),
    r("decision", "Document disponible en mairie", "Votre titre est disponible. Vous pouvez le retirer en mairie sur rendez-vous, dans un délai de 3 mois, muni(e) de votre récépissé."),
    r("decision", "Envoyé par courrier", "Votre attestation a été envoyée par courrier à l'adresse indiquée. Délai de réception : environ 5 jours ouvrés."),

    /* ----- Rendez-vous et démarches ----- */
    r("rdv", "Rendez-vous à prendre", "Pour finaliser votre démarche, vous devez prendre rendez-vous en ligne ou au guichet, muni(e) des documents originaux."),
    r("rdv", "Rendez-vous confirmé", "Votre rendez-vous est confirmé le {date+7} à 10 h 30. Présentez-vous 10 minutes en avance avec votre convocation et une pièce d'identité."),
    r("rdv", "Rappel de rendez-vous", "Rappel : vous avez rendez-vous demain à 14 h. En cas d'empêchement, annulez-le depuis votre espace pour libérer le créneau."),
    r("rdv", "Rendez-vous annulé", "Votre rendez-vous du {date+7} a été annulé. Vous pouvez en reprendre un nouveau depuis votre espace."),
    r("rdv", "Convocation", "Vous êtes convoqué(e) à un entretien le {date+10} à 9 h. Votre présence est obligatoire. En cas d'absence non justifiée, vos droits peuvent être suspendus."),
    r("rdv", "Original par courrier", "Merci d'envoyer l'original du formulaire signé par courrier à l'adresse indiquée dans votre espace. Les copies ne sont pas acceptées pour ce document."),
    r("rdv", "Formulaire à compléter", "Pour poursuivre, merci de compléter le formulaire en ligne disponible dans votre espace, rubrique « Mes démarches »."),

    /* ----- Compte et sécurité ----- */
    r("compte", "Confirmer son e-mail", "Bienvenue ! Cliquez sur le lien reçu par e-mail pour activer votre compte. Ce lien est valable 24 heures."),
    r("compte", "Code de vérification", "Votre code de connexion est {code}. Il est valable 10 minutes. Ne le communiquez à personne, même à un conseiller."),
    r("compte", "Nouvelle connexion", "Une connexion à votre compte a eu lieu depuis un nouvel appareil le {date}. Si ce n'était pas vous, changez votre mot de passe."),
    r("compte", "Session expirée", "Pour votre sécurité, vous avez été déconnecté(e) après 15 minutes d'inactivité. Reconnectez-vous pour continuer."),
    r("compte", "Mot de passe modifié", "Votre mot de passe a bien été modifié. Si vous n'êtes pas à l'origine de ce changement, contactez-nous immédiatement."),
    r("compte", "Mot de passe oublié", "Vous avez demandé à réinitialiser votre mot de passe. Cliquez sur le lien reçu par e-mail. Si vous n'avez rien demandé, ignorez ce message."),
    r("compte", "Compte bloqué", "Votre compte est temporairement bloqué après plusieurs erreurs de mot de passe. Réessayez dans 30 minutes ou réinitialisez votre mot de passe."),
    r("compte", "E-mail modifié", "Votre adresse e-mail a été modifiée. Les prochains messages seront envoyés à cette nouvelle adresse."),

    /* ----- Rappels et relances ----- */
    r("relance", "Dossier en attente", "Votre dossier est en attente : une action est nécessaire de votre part. Connectez-vous à votre espace pour voir ce qui manque."),
    r("relance", "Relance avant clôture", "Votre dossier est incomplet depuis 30 jours. Sans réponse de votre part sous 15 jours, il sera clôturé."),
    r("relance", "Dernier rappel", "Dernier rappel : votre dossier sera clôturé le {date+5} si les pièces manquantes ne sont pas transmises."),
    r("relance", "Déclaration à faire", "Pensez à faire votre déclaration trimestrielle avant le {date+10} pour continuer à percevoir vos droits."),
    r("relance", "Situation annuelle", "Comme chaque année, merci de confirmer votre situation (adresse, ressources, composition du foyer) avant le {date+20}."),
    r("relance", "Attestation à renouveler", "Votre attestation arrive à expiration le {date+30}. Pensez à la renouveler pour éviter toute interruption."),

    /* ----- Paiements et montants ----- */
    r("paiement", "Versement effectué", "Un versement de 245,80 € a été effectué sur votre compte le {date}. Il apparaîtra sous 2 à 3 jours selon votre banque."),
    r("paiement", "Montant modifié", "Le montant de votre aide change à partir du mois prochain, suite à la mise à jour de vos ressources. Le détail est dans votre espace."),
    r("paiement", "Versements suspendus", "Vos versements sont suspendus car votre déclaration n'a pas été reçue. Ils reprendront dès que la déclaration sera faite."),
    r("paiement", "Trop-perçu", "Vous avez reçu 120 € de trop. Cette somme sera retenue sur vos prochains versements. Si vous n'êtes pas d'accord, vous pouvez contester dans un délai de 2 mois."),
    r("paiement", "Avis de paiement", "Un avis de paiement de 87 € est disponible dans votre espace. À régler avant le {date+30}, en ligne ou par prélèvement."),
    r("paiement", "Paiement en plusieurs fois", "Votre demande de paiement en plusieurs fois est acceptée : 3 mensualités de 60 €, prélevées le 5 de chaque mois."),

    /* ----- Pièges à reconnaître ----- */
    r("arnaque", "Faux remboursement", "Vous avez droit à un remboursement de 148,20 €. Cliquez ici pour le recevoir sous 24 h : http://remboursement-dossier-securise.info"),
    r("arnaque", "Fausse urgence", "Votre compte sera suspendu aujourd'hui. Mettez à jour vos informations immédiatement : http://maj-compte-usager.com"),
    r("arnaque", "Faux colis", "Votre colis n'a pas pu être livré. Des frais de 1,99 € sont à régler pour une nouvelle livraison : http://suivi-colis-livraison.net"),
    r("arnaque", "Fausse amende", "Avis de contravention impayée : réglez 35 € sous 48 h pour éviter une majoration à 135 €. Paiement ici : http://amendes-paiement-rapide.com"),
    r("arnaque", "Fausse carte Vitale", "Votre carte Vitale arrive à expiration. Commandez gratuitement la nouvelle en confirmant vos coordonnées bancaires ici : http://carte-renouvellement.info"),
    r("arnaque", "Faux conseiller", "Bonjour, je suis votre conseiller. Pour débloquer votre dossier, communiquez-moi le code que vous venez de recevoir par SMS."),
    r("arnaque", "Faux compte formation", "Il vous reste 1 200 € sur votre compte formation. Ils seront perdus demain : appelez vite le 09 74 00 00 00."),
    r("arnaque", "Faux gain", "Félicitations ! Vous avez été tiré(e) au sort pour gagner un smartphone. Payez seulement 2,90 € de frais d'envoi."),

    /* ----- Messages du formateur ----- */
    r("formateur", "J'arrive", "J'ai bien vu votre message, je viens vous voir dans un instant."),
    r("formateur", "Encouragement", "Prenez votre temps et relisez l'étape affichée à l'écran. Vous êtes sur la bonne voie !"),
    r("formateur", "Bravo", "Bravo, c'est exactement ça ! Vous pouvez passer à l'étape suivante."),
    r("formateur", "Relisez la consigne", "Relisez tranquillement la consigne en haut de l'écran : la réponse s'y trouve."),
    r("formateur", "Demandez de l'aide", "Si vous êtes bloqué(e), cliquez sur le bouton « Demander de l'aide » : je viendrai vous voir."),
    r("formateur", "C'était un piège", "Ce message était un piège ! Regardez l'adresse du lien : ce n'est pas un site officiel. Dans ce cas, on ne clique jamais."),
    r("formateur", "Piège évité", "Bien joué, vous n'êtes pas tombé(e) dans le piège ! Un organisme officiel ne vous demande jamais vos codes ni votre carte bancaire par message."),
    r("formateur", "Mission réelle réussie", "Bravo, mission réussie ! Vous avez trouvé la bonne information, sur le bon site. Vous pouvez être fier(e) de vous : vous savez maintenant chercher seul(e) sur Internet."),
    r("formateur", "Mission : vérifier le site", "Bonne réponse ! Mais regardez le site où vous l'avez trouvée : ce n'est pas le site officiel. Relisez le vrai nom dans la barre d'adresse, juste avant le premier « / », puis répondez-moi ici avec le bon site."),
    r("formateur", "Mission : presque", "Presque ! L'information n'est pas tout à fait la bonne. Vérifiez la date ou le jour demandé, puis répondez-moi directement ici. Je passe vous voir si besoin."),
    r("formateur", "Pause", "On fait une petite pause de 10 minutes. Vous pourrez reprendre exactement où vous en étiez."),
    r("formateur", "Fin de séance", "La séance se termine dans 5 minutes. Terminez l'étape en cours : votre progression est enregistrée.")
  ];

  /** Remplace {date}, {date+N}, {num} et {code} par des valeurs réalistes. */
  function fill(text) {
    const fmt = d => d.toLocaleDateString("fr-FR");
    const digits = n => Array.from({ length: n }, () => Math.floor(Math.random() * 10)).join("");
    return String(text)
      .replace(/\{date(?:\+(\d+))?\}/g, (_, n) => fmt(new Date(Date.now() + (Number(n) || 0) * 86400000)))
      .replace(/\{num\}/g, () => `${new Date().getFullYear()}-${digits(6)}`)
      .replace(/\{code\}/g, () => digits(6));
  }

  const oldDefaultTitles = ["Pièce manquante", "Mauvais document", "Document illisible", "Dossier complet", "Encouragement", "J'arrive"];

  /** Liste effective : réponses enregistrées par le formateur, ou bibliothèque par défaut.
      Une ancienne liste (sans catégories) est fusionnée avec la nouvelle bibliothèque. */
  const ADDED = ["Mission réelle réussie", "Mission : vérifier le site", "Mission : presque"];
  function resolve(saved) {
    if (!saved || !saved.length) return defaults;
    if (saved.some(x => x.cat)) {
      const list = saved.map(x => ({ ...x, cat: categories.some(c => c.id === x.cat) ? x.cat : "perso" }));
      // réponses ajoutées avec le chapitre Navigateurs : proposées même si la liste a déjà été personnalisée
      const added = defaults.filter(d => ADDED.includes(d.title) && !list.some(x => x.title === d.title));
      return [...list, ...added];
    }
    const custom = saved.filter(x => !oldDefaultTitles.includes(x.title)).map(x => ({ ...x, cat: "perso" }));
    return [...defaults, ...custom];
  }

  AN.quickReplies = { categories, defaults, fill, resolve, category: id => categories.find(c => c.id === id) || categories[categories.length - 1] };
  AN.model.defaultQuickReplies = defaults;
})(window.AN);

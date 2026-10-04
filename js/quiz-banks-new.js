/* Banques de questions des nouvelles missions (V8). */
Object.assign(window.AN.quizBanks, {
  files: {
    beginner: [
      { id: "fl_b1", q: "Où arrive en général un fichier que je viens de télécharger ?", choices: ["Dans le dossier Téléchargements", "Dans la Corbeille", "Sur le Bureau, toujours"], ok: 0, explain: "Par défaut, les navigateurs enregistrent les fichiers dans « Téléchargements »." },
      { id: "fl_b2", q: "Quel programme permet de voir les dossiers de l'ordinateur ?", choices: ["L'Explorateur de fichiers", "La calculatrice", "Le lecteur de musique"], ok: 0, explain: "L'Explorateur de fichiers (icône de dossier jaune) affiche dossiers et fichiers." },
      { id: "fl_b3", q: "Comment ouvrir un fichier dans l'Explorateur ?", choices: ["Double-cliquer dessus", "Le faire glisser dans la Corbeille", "Cliquer une fois avec le bouton droit"], ok: 0, explain: "Le double-clic ouvre le fichier avec le bon programme." },
      { id: "fl_b4", q: "Pourquoi donner un nom clair à un fichier ?", choices: ["Pour le retrouver facilement", "Pour qu'il prenne moins de place", "Ça ne sert à rien"], ok: 0, explain: "« avis_impot_2025 » se retrouve bien plus vite que « document(3) »." }
    ],
    intermediate: [
      { id: "fl_i1", q: "Plusieurs fichiers se ressemblent. Comment voir le plus récent en premier ?", choices: ["Trier par date de modification", "Trier par taille", "Fermer et rouvrir l'Explorateur"], ok: 0, explain: "Le tri par date place le dernier téléchargement en haut." },
      { id: "fl_i2", q: "Quelle touche permet de renommer un fichier sélectionné sous Windows ?", choices: ["F2", "Échap", "F5"], ok: 0, explain: "F2 (ou clic droit → Renommer) permet de changer le nom." },
      { id: "fl_i3", q: "En renommant « document.pdf », que ne faut-il pas effacer ?", choices: ["L'extension .pdf", "Les lettres majuscules", "Rien, tout peut être changé"], ok: 0, explain: "L'extension indique le type de fichier : sans elle, il peut ne plus s'ouvrir." },
      { id: "fl_i4", q: "Où ranger durablement une attestation téléchargée ?", choices: ["Dans un dossier « Mes démarches » dans Documents", "Laisser tout dans Téléchargements", "Dans la Corbeille pour plus tard"], ok: 0, explain: "Un dossier dédié évite de perdre ses papiers parmi tous les téléchargements." }
    ],
    expert: [
      { id: "fl_e1", q: "Un fichier est introuvable. Quelle méthode est la plus rapide ?", choices: ["Taper une partie de son nom dans la recherche de l'Explorateur", "Ouvrir chaque dossier un par un", "Le retélécharger plusieurs fois"], ok: 0, explain: "La barre de recherche parcourt tous les sous-dossiers." },
      { id: "fl_e2", q: "Quelle convention de nom est la plus utile ?", choices: ["type_organisme_année (ex : avis_impot_2025)", "doc1, doc2, doc3", "Le nom proposé par le site, sans le changer"], ok: 0, explain: "Type + organisme + année : on sait ce que c'est sans l'ouvrir." },
      { id: "fl_e3", q: "Sur un ordinateur public, que faire de vos documents après la démarche ?", choices: ["Les supprimer (et vider la Corbeille)", "Les laisser pour la prochaine fois", "Les copier sur le Bureau"], ok: 0, explain: "Sur un poste partagé, d'autres personnes pourraient les ouvrir." },
      { id: "fl_e4", q: "Déplacer ou copier un fichier : quelle différence ?", choices: ["Déplacer le retire de l'ancien dossier, copier en crée un double", "Aucune différence", "Copier supprime l'original"], ok: 0, explain: "Après un déplacement, le fichier n'existe plus qu'au nouvel endroit." }
    ]
  },

  sms: {
    beginner: [
      { id: "sm_b1", q: "Un SMS dit : « Votre colis est bloqué, payez 1,99 € ici ». Que faire ?", choices: ["Ne pas cliquer et supprimer le SMS", "Payer, c'est peu cher", "Répondre pour demander des précisions"], ok: 0, explain: "C'est une arnaque très répandue : le petit montant sert à voler la carte bancaire." },
      { id: "sm_b2", q: "Quel numéro permet de signaler un SMS frauduleux en France ?", choices: ["33700", "112", "3615"], ok: 0, explain: "On transfère gratuitement le SMS au 33700." },
      { id: "sm_b3", q: "Un SMS de votre médecin confirme un rendez-vous déjà pris, sans lien. Est-ce inquiétant ?", choices: ["Non, c'est un rappel normal", "Oui, il faut appeler la police", "Oui, il faut changer de numéro"], ok: 0, explain: "Un rappel sans lien ni demande d'argent ou de code est en général normal." },
      { id: "sm_b4", q: "Le code reçu par SMS pour se connecter, à qui peut-on le donner ?", choices: ["À personne", "Au conseiller qui appelle", "À un ami de confiance"], ok: 0, explain: "Personne de légitime ne vous demandera jamais ce code." }
    ],
    intermediate: [
      { id: "sm_i1", q: "« Votre carte Vitale expire, renouvelez-la ici : vitale-renouv.info ». Indice ?", choices: ["L'adresse n'est pas celle d'Ameli", "Le mot « Vitale »", "La présence d'un lien, toujours normale"], ok: 0, explain: "La carte Vitale n'expire pas et Ameli n'envoie pas ce type de lien." },
      { id: "sm_i2", q: "« Vos droits CPF de 1 200 € expirent demain » : que penser ?", choices: ["Arnaque classique jouant sur l'urgence", "Message officiel à traiter vite", "Promotion d'une banque"], ok: 0, explain: "Le compte formation se consulte uniquement sur le site officiel, sans urgence." },
      { id: "sm_i3", q: "Un SMS d'un numéro inconnu : « Maman, j'ai changé de numéro, écris-moi sur WhatsApp ». Réflexe ?", choices: ["Appeler l'ancien numéro de son enfant pour vérifier", "Envoyer de l'argent tout de suite", "Répondre avec son code bancaire"], ok: 0, explain: "L'arnaque « au proche » est fréquente : on vérifie toujours par un autre moyen." },
      { id: "sm_i4", q: "Vous avez cliqué sur un lien d'un SMS douteux mais rien saisi. Que faire ?", choices: ["Fermer la page et ne rien saisir", "Remplir pour voir", "Rallumer le téléphone dix fois"], ok: 0, explain: "Tant qu'aucune information n'est saisie, le risque reste limité." }
    ],
    expert: [
      { id: "sm_e1", q: "Un SMS « ANTAI » réclame une amende avec un lien antai-paiement-amende.com. Conclusion ?", choices: ["Faux : le site officiel est antai.gouv.fr", "Vrai : le mot ANTAI est présent", "Vrai : il y a un montant précis"], ok: 0, explain: "Les vrais sites de l'État finissent par .gouv.fr ; l'expéditeur affiché peut être falsifié." },
      { id: "sm_e2", q: "Un SMS frauduleux peut-il apparaître dans le même fil que les vrais SMS de votre banque ?", choices: ["Oui, le nom d'expéditeur peut être usurpé", "Non, c'est impossible", "Seulement sur iPhone"], ok: 0, explain: "L'usurpation du nom d'expéditeur (spoofing) existe : le fil ne prouve rien." },
      { id: "sm_e3", q: "Votre banque vous appelle juste après un SMS suspect et demande de valider une opération « pour l'annuler ». Que faire ?", choices: ["Raccrocher et rappeler le numéro au dos de la carte", "Valider puisqu'elle appelle", "Donner le code pour aller plus vite"], ok: 0, explain: "Valider une opération ne l'annule jamais : c'est la fraude au faux conseiller." },
      { id: "sm_e4", q: "Vous avez saisi votre carte bancaire sur un faux site. Première action ?", choices: ["Faire opposition auprès de la banque", "Attendre le relevé du mois", "Supprimer le SMS et oublier"], ok: 0, explain: "L'opposition rapide limite les débits frauduleux." }
    ]
  },

  password: {
    beginner: [
      { id: "pw_b1", q: "Où se trouve en général le lien « Mot de passe oublié ? »", choices: ["Sous le formulaire de connexion", "Dans les mentions légales", "Dans la Corbeille"], ok: 0, explain: "Il est presque toujours juste sous les champs identifiant / mot de passe." },
      { id: "pw_b2", q: "Après avoir demandé un nouveau mot de passe, où regarder ?", choices: ["Dans sa boîte e-mail", "Dans le dossier Téléchargements", "Dans les paramètres de l'écran"], ok: 0, explain: "Le lien de réinitialisation arrive par e-mail (pensez aux indésirables)." },
      { id: "pw_b3", q: "Quel mot de passe est le plus sûr ?", choices: ["Mon-chat-aime-les-croquettes-7", "123456", "marie1956"], ok: 0, explain: "Long et sans lien évident avec vous : c'est la clé." },
      { id: "pw_b4", q: "Peut-on donner son mot de passe au formateur pour qu'il aide ?", choices: ["Non, on le tape soi-même", "Oui, s'il le demande", "Oui, par écrit sur un papier"], ok: 0, explain: "Le mot de passe est personnel. Le formateur guide sans le connaître." }
    ],
    intermediate: [
      { id: "pw_i1", q: "Que recommande la CNIL pour un mot de passe classique ?", choices: ["Au moins 12 caractères mélangés", "4 chiffres suffisent", "Son prénom + son année de naissance"], ok: 0, explain: "Majuscules, minuscules, chiffres et caractères spéciaux, sur 12 caractères ou plus." },
      { id: "pw_i2", q: "Pourquoi éviter le même mot de passe partout ?", choices: ["Une fuite sur un site ouvrirait tous les autres", "C'est interdit par la loi", "Ça ralentit Internet"], ok: 0, explain: "Un mot de passe unique par site limite les dégâts en cas de fuite." },
      { id: "pw_i3", q: "Le lien de réinitialisation ne fonctionne plus. Pourquoi ?", choices: ["Il a souvent une durée de validité limitée", "Internet est en panne partout", "Le compte est supprimé"], ok: 0, explain: "On redemande simplement un nouveau lien." },
      { id: "pw_i4", q: "Le navigateur propose d'enregistrer le mot de passe sur un ordinateur public. Réponse ?", choices: ["Jamais", "Toujours", "Seulement le soir"], ok: 0, explain: "Sur un poste partagé, la personne suivante pourrait se connecter à votre place." }
    ],
    expert: [
      { id: "pw_e1", q: "Qu'est-ce qu'une phrase de passe ?", choices: ["Plusieurs mots aléatoires formant un long mot de passe facile à retenir", "Une question secrète", "Le code PIN de la carte"], ok: 0, explain: "Ex : « Velo-Orange-Nuage-42 » : long, donc solide, et mémorisable." },
      { id: "pw_e2", q: "À quoi sert un gestionnaire de mots de passe ?", choices: ["Retenir des mots de passe uniques et forts pour vous", "Partager ses mots de passe sur les réseaux", "Supprimer ses comptes"], ok: 0, explain: "Un seul mot de passe maître à retenir, le reste est généré et stocké." },
      { id: "pw_e3", q: "Vous recevez un e-mail de réinitialisation que vous n'avez pas demandé. Que faire ?", choices: ["Ne pas cliquer et vérifier son compte depuis le site officiel", "Cliquer pour voir", "Répondre à l'expéditeur"], ok: 0, explain: "Quelqu'un tente peut-être d'accéder au compte, ou c'est un hameçonnage." },
      { id: "pw_e4", q: "Qu'apporte la double authentification ?", choices: ["Un second contrôle (code, appli) en plus du mot de passe", "Deux mots de passe identiques", "Une connexion plus rapide"], ok: 0, explain: "Même si le mot de passe fuit, le pirate est bloqué sans le second facteur." }
    ]
  },

  appointment: {
    beginner: [
      { id: "ap_b1", q: "Sur un calendrier de rendez-vous, que signifie un jour grisé ?", choices: ["Il n'est pas disponible", "Il est déjà réservé pour moi", "C'est un jour férié payé"], ok: 0, explain: "Les jours grisés ou barrés ne peuvent pas être choisis." },
      { id: "ap_b2", q: "Que faut-il choisir en premier en général ?", choices: ["Le motif du rendez-vous", "L'heure", "La couleur du site"], ok: 0, explain: "Le motif détermine les créneaux et la durée proposés." },
      { id: "ap_b3", q: "Après la réservation, que garder ?", choices: ["La référence ou le message de confirmation", "Rien", "Une capture du calendrier vide"], ok: 0, explain: "La référence sert à modifier ou annuler le rendez-vous." },
      { id: "ap_b4", q: "Un empêchement : que faire ?", choices: ["Annuler en ligne pour libérer le créneau", "Ne pas venir sans prévenir", "Réserver un deuxième créneau"], ok: 0, explain: "Annuler permet à quelqu'un d'autre de prendre la place." }
    ],
    intermediate: [
      { id: "ap_i1", q: "Aucun créneau cette semaine. Bon réflexe ?", choices: ["Passer à la semaine suivante avec la flèche", "Abandonner", "Appeler le 112"], ok: 0, explain: "Les calendriers ont des flèches pour changer de semaine ou de mois." },
      { id: "ap_i2", q: "« 14 h 30 » : est-ce le matin ou l'après-midi ?", choices: ["L'après-midi", "Le matin", "La nuit"], ok: 0, explain: "14 h 30 = 2 h 30 de l'après-midi." },
      { id: "ap_i3", q: "Le site demande les pièces à apporter. Quand les préparer ?", choices: ["Avant le rendez-vous, en suivant la liste", "Sur place, à la dernière minute", "Jamais"], ok: 0, explain: "Un dossier incomplet peut obliger à reprendre rendez-vous." },
      { id: "ap_i4", q: "Où retrouver la confirmation si on a fermé la page ?", choices: ["Dans sa messagerie e-mail", "Dans la Corbeille", "Dans l'historique des appels"], ok: 0, explain: "Un e-mail ou SMS de confirmation est presque toujours envoyé." }
    ],
    expert: [
      { id: "ap_e1", q: "Un site non officiel facture la prise de rendez-vous en préfecture. Que penser ?", choices: ["Méfiance : la prise de RDV officielle est gratuite", "C'est normal, c'est un service", "C'est obligatoire"], ok: 0, explain: "Des sites intermédiaires font payer ce qui est gratuit sur le site officiel." },
      { id: "ap_e2", q: "Le créneau proposé est « jeu. 14/11 ». Comment le vérifier ?", choices: ["Comparer avec un calendrier : jour ET date", "Faire confiance à la date seule", "Ignorer le jour"], ok: 0, explain: "Vérifier jour + date évite les erreurs de semaine." },
      { id: "ap_e3", q: "Pourquoi ajouter le rendez-vous à son agenda ?", choices: ["Pour recevoir un rappel et ne pas l'oublier", "Pour le confirmer auprès du service", "Ça l'annule automatiquement"], ok: 0, explain: "L'agenda du téléphone peut envoyer une alerte la veille." },
      { id: "ap_e4", q: "On vous demande un numéro de réservation au guichet. Où le trouver ?", choices: ["Sur la page de confirmation ou dans l'e-mail reçu", "Sur la carte Vitale", "Sur le ticket de caisse"], ok: 0, explain: "La référence figure sur la confirmation : notez-la." }
    ]
  },

  payment: {
    beginner: [
      { id: "py_b1", q: "Quel début d'adresse indique une connexion chiffrée ?", choices: ["https://", "http://", "www."], ok: 0, explain: "Le « s » de https signifie que les échanges sont chiffrés." },
      { id: "py_b2", q: "Le code reçu par SMS pendant un paiement sert à…", choices: ["Confirmer que c'est bien moi qui paie", "Gagner un cadeau", "Rien d'important"], ok: 0, explain: "C'est la validation du paiement (3-D Secure) : il ne se communique jamais." },
      { id: "py_b3", q: "Avant de valider, que vérifier ?", choices: ["Le montant et le nom du commerçant", "La couleur du bouton", "L'heure"], ok: 0, explain: "Le montant et le commerçant doivent correspondre à votre achat." },
      { id: "py_b4", q: "Peut-on payer en ligne sur un ordinateur public ?", choices: ["Mieux vaut l'éviter", "Oui, sans précaution", "Oui, en enregistrant sa carte"], ok: 0, explain: "Sur un poste partagé, on évite de saisir ou d'enregistrer sa carte." }
    ],
    intermediate: [
      { id: "py_i1", q: "Le cadenas 🔒 garantit-il que le site est honnête ?", choices: ["Non, seulement que la connexion est chiffrée", "Oui, toujours", "Oui, s'il est vert"], ok: 0, explain: "Un faux site peut aussi avoir un cadenas : vérifiez l'adresse exacte." },
      { id: "py_i2", q: "La notification de la banque indique 89 € alors que l'achat est de 12 €. Que faire ?", choices: ["Refuser / annuler le paiement", "Valider quand même", "Payer deux fois"], ok: 0, explain: "Un montant différent = opération suspecte." },
      { id: "py_i3", q: "Le site vous propose d'« enregistrer la carte pour plus tard ». Prudence ?", choices: ["Refuser si l'on n'est pas sûr du site ou de l'appareil", "Toujours accepter", "Accepter et partager"], ok: 0, explain: "Moins la carte est enregistrée, moins elle est exposée." },
      { id: "py_i4", q: "Le cryptogramme visuel, c'est…", choices: ["Les 3 chiffres au dos de la carte", "Le code PIN", "Le numéro de compte"], ok: 0, explain: "Le code PIN, lui, ne se tape jamais sur Internet." }
    ],
    expert: [
      { id: "py_e1", q: "Le timbre fiscal officiel s'achète sur…", choices: ["timbres.impots.gouv.fr", "timbre-fiscal-rapide.com", "n'importe quel site qui en vend"], ok: 0, explain: "Des sites intermédiaires revendent plus cher, voire ne livrent rien." },
      { id: "py_e2", q: "Différence entre carte « à autorisation » et e-carte ?", choices: ["L'e-carte génère un numéro à usage unique", "Aucune", "L'e-carte se tape sans cryptogramme"], ok: 0, explain: "Le numéro virtuel ne sert qu'une fois : inutile s'il est volé." },
      { id: "py_e3", q: "On vous appelle pour « sécuriser » votre compte en validant une opération dans l'appli. Que faire ?", choices: ["Raccrocher : on ne valide jamais une opération qu'on n'a pas faite", "Valider pour bloquer le fraudeur", "Donner le code"], ok: 0, explain: "Valider = accepter le paiement. C'est la fraude au faux conseiller." },
      { id: "py_e4", q: "Après un paiement sur un site douteux, quelle surveillance ?", choices: ["Consulter ses opérations et faire opposition si besoin", "Rien", "Changer de navigateur"], ok: 0, explain: "Un contrôle rapide des opérations permet de réagir vite." }
    ]
  }
});

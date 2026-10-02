/* Banques de questions — reprises de la V7 (thèmes download, mouse_nav, keyboard, form, missing_piece, security). Dans chaque question, la bonne réponse est "ok" ; l’ordre des choix est mélangé à l’affichage. */
window.AN.quizBanks = {
  download: {
    beginner: [
      {id:"db1",q:"Que veut dire « Télécharger » ?",choices:["Récupérer un fichier sur l'ordinateur","Supprimer le fichier","Envoyer un mot de passe"],ok:0,explain:"Télécharger signifie récupérer une copie du fichier sur votre appareil."},
      {id:"db2",q:"Dans quel dossier Windows regarde-t-on d'abord après un téléchargement ?",choices:["Téléchargements","Corbeille","Musique"],ok:0,explain:"Le dossier Téléchargements est le premier endroit à vérifier."},
      {id:"db3",q:"Quel symbole représente souvent le téléchargement ?",choices:["Une flèche vers le bas","Une poubelle","Un cadenas"],ok:0,explain:"La flèche vers le bas est souvent utilisée pour le bouton Télécharger."},
      {id:"db4",q:"Vous venez de télécharger « attestation.pdf ». Que devez-vous chercher ?",choices:["Un fichier nommé attestation.pdf","Une application","Un mot de passe"],ok:0,explain:"Le nom du fichier permet de le reconnaître dans le dossier Téléchargements."},
      {id:"db5",q:"Que signifie l'extension « .pdf » ?",choices:["C'est un type de document","C'est un mot de passe","C'est une adresse e-mail"],ok:0,explain:"PDF est un format de document très utilisé pour les démarches."},
      {id:"db6",q:"Après avoir trouvé le bon fichier, comment l'ouvrir généralement ?",choices:["Double-cliquer dessus","Le supprimer","Éteindre l'ordinateur"],ok:0,explain:"Un double-clic ouvre généralement le document."}
    ],
    intermediate: [
      {id:"di1",q:"Vous avez téléchargé deux attestations. Comment reconnaître la plus récente ?",choices:["Regarder le nom et la date du fichier","Ouvrir la Corbeille","Changer de navigateur"],ok:0,explain:"Le nom et la date permettent de différencier les versions."},
      {id:"di2",q:"Un fichier se nomme « attestation_droits (2).pdf ». Que signifie souvent « (2) » ?",choices:["Une autre copie a déjà été téléchargée","Le fichier est dangereux","Le fichier contient deux pages"],ok:0,explain:"Le navigateur ajoute souvent un numéro lorsqu'un fichier du même nom existe déjà."},
      {id:"di3",q:"Vous ne voyez pas votre PDF dans Téléchargements. Quel bon réflexe ?",choices:["Trier les fichiers par date ou utiliser la recherche","Recommencer toute la démarche","Créer un nouveau compte"],ok:0,explain:"Le tri ou la recherche permettent de retrouver rapidement le fichier."},
      {id:"di4",q:"Pourquoi renommer « document123.pdf » en « attestation_ameli.pdf » ?",choices:["Pour le retrouver plus facilement plus tard","Pour le rendre officiel","Pour l'envoyer automatiquement"],ok:0,explain:"Un nom clair aide à organiser ses documents."},
      {id:"di5",q:"Vous voulez garder un document administratif. Où le ranger ?",choices:["Dans un dossier personnel clairement nommé","Dans la Corbeille","Uniquement dans le navigateur"],ok:0,explain:"Un dossier comme « Mes démarches » facilite le classement."},
      {id:"di6",q:"Le navigateur affiche « Ouvrir » et « Enregistrer ». Pour conserver le fichier sur le PC, quel choix est le plus clair ?",choices:["Enregistrer","Fermer","Actualiser"],ok:0,explain:"Enregistrer permet de conserver le fichier sur l'ordinateur."}
    ],
    expert: [
      {id:"de1",q:"Un PDF s'ouvre directement dans un nouvel onglet. Comment le conserver ?",choices:["Utiliser le bouton Télécharger/Enregistrer du lecteur PDF","Fermer l'onglet en pensant qu'il est enregistré","Copier seulement l'adresse web"],ok:0,explain:"L'ouverture dans le navigateur ne garantit pas que le fichier est enregistré localement."},
      {id:"de2",q:"Vous devez joindre « avis_impot_2026.pdf », mais vous avez aussi « avis_impot_2025.pdf ». Quelle vérification est essentielle ?",choices:["L'année dans le nom ou le contenu","La taille de l'icône","La couleur du dossier"],ok:0,explain:"Il faut vérifier le bon millésime."},
      {id:"de3",q:"Votre fichier est téléchargé mais introuvable. Quelle méthode est la plus efficace ?",choices:["Rechercher une partie du nom dans l'Explorateur Windows","Télécharger cinq copies","Créer un nouveau compte"],ok:0,explain:"La recherche Windows évite de multiplier les copies."},
      {id:"de4",q:"Vous avez trois fichiers presque identiques. Quelle organisation réduit le risque d'envoyer le mauvais ?",choices:["Les renommer avec type de document et date","Les laisser tous sous « document.pdf »","Les mettre dans la Corbeille"],ok:0,explain:"Des noms explicites permettent de distinguer les versions."},
      {id:"de5",q:"Un PDF administratif contient des données personnelles. Quel bon réflexe sur un ordinateur partagé ?",choices:["Le ranger dans un espace personnel puis se déconnecter","Le laisser ouvert","Le partager avec tout le groupe"],ok:0,explain:"Sur un ordinateur partagé, il faut limiter l'accès aux données personnelles."},
      {id:"de6",q:"Un fichier s'appelle « attestation.pdf.exe ». Pourquoi faut-il être prudent ?",choices:["L'extension finale .exe indique un programme","Tous les PDF sont dangereux","Le nom est trop long"],ok:0,explain:"C'est l'extension finale qui compte : .exe est un programme."}
    ]
  },

  mouse_nav: {
    beginner: [
      {id:"nb1",q:"Pour ouvrir une rubrique sur un site, que fait-on le plus souvent ?",choices:["Un clic gauche","Un clic droit partout","On ferme le navigateur"],ok:0,explain:"Un clic gauche ouvre généralement un bouton ou une rubrique."},
      {id:"nb2",q:"Un onglet devient souligné ou change de couleur après un clic. Cela signifie souvent…",choices:["Qu'il est ouvert","Que l'ordinateur est en panne","Que le fichier est supprimé"],ok:0,explain:"Les sites indiquent visuellement quelle rubrique est active."},
      {id:"nb3",q:"Vous cherchez un espace professionnel. Que faut-il faire ?",choices:["Cliquer sur la rubrique Professionnel","Cliquer sur la Corbeille","Appuyer sur Échap"],ok:0,explain:"Les grandes rubriques servent à accéder au contenu correspondant."},
      {id:"nb4",q:"Si vous cliquez sur le mauvais onglet, que faire ?",choices:["Cliquer simplement sur le bon onglet","Recommencer l'ordinateur","Créer un nouveau compte"],ok:0,explain:"Une erreur de clic se corrige facilement."},
      {id:"nb5",q:"Pourquoi prendre le temps de lire les noms des onglets ?",choices:["Pour choisir la bonne rubrique","Pour ralentir Internet","Pour changer le clavier"],ok:0,explain:"Lire les intitulés aide à naviguer sans cliquer au hasard."},
      {id:"nb6",q:"Quel geste convient pour choisir un bouton visible ?",choices:["Pointer puis cliquer une fois","Secouer la souris","Faire dix doubles-clics"],ok:0,explain:"Un simple clic suffit généralement."}
    ],
    intermediate: [
      {id:"ni1",q:"Vous êtes sur la page Particulier mais cherchez des informations pour une entreprise. Que faire ?",choices:["Cliquer sur Professionnel/Entreprise","Actualiser plusieurs fois","Fermer Windows"],ok:0,explain:"Il faut changer de rubrique selon le profil recherché."},
      {id:"ni2",q:"Une rubrique contient plusieurs cartes. Quel bon réflexe avant de cliquer ?",choices:["Lire le titre et le petit texte","Cliquer au hasard","Utiliser uniquement le clic droit"],ok:0,explain:"Lire le contenu évite les erreurs de navigation."},
      {id:"ni3",q:"Vous ne trouvez pas immédiatement une information. Quelle stratégie est raisonnable ?",choices:["Explorer les rubriques proches puis revenir","Créer un nouveau compte","Fermer toutes les fenêtres"],ok:0,explain:"La navigation par catégories permet de se repérer."},
      {id:"ni4",q:"Une barre de navigation reste visible en haut. À quoi sert-elle ?",choices:["À changer rapidement de rubrique","À supprimer les documents","À modifier Windows"],ok:0,explain:"La barre de navigation donne accès aux grandes sections du site."},
      {id:"ni5",q:"Après plusieurs clics, comment savoir où vous êtes ?",choices:["Regarder l'onglet actif et le titre de la page","Regarder l'heure","Changer la taille de la souris"],ok:0,explain:"L'onglet actif et le titre donnent le contexte courant."},
      {id:"ni6",q:"Quel comportement évite les doubles actions involontaires ?",choices:["Faire un seul clic et attendre la réaction","Cliquer très vite cinq fois","Maintenir tous les boutons"],ok:0,explain:"Un clic suffit sur la plupart des boutons web."}
    ],
    expert: [
      {id:"ne1",q:"Un site propose Particulier, Professionnel et Collectivité. Quelle logique suivre ?",choices:["Choisir selon la situation de la personne ou de l'organisme","Toujours choisir Professionnel","Cliquer sur tous les onglets"],ok:0,explain:"Le bon espace dépend du profil concerné."},
      {id:"ne2",q:"Deux rubriques semblent proches. Quel indice aide le plus ?",choices:["Le titre, la description et le contenu de la page","La couleur de la souris","La taille de l'écran"],ok:0,explain:"Il faut interpréter les libellés plutôt que cliquer au hasard."},
      {id:"ne3",q:"Vous êtes perdu dans une navigation complexe. Quel réflexe est utile ?",choices:["Revenir à l'accueil ou à une rubrique principale","Créer un nouveau navigateur","Cliquer sur tous les liens"],ok:0,explain:"Revenir à un point de repère est une bonne stratégie."},
      {id:"ne4",q:"Pourquoi éviter les doubles-clics sur les boutons web ?",choices:["Ils peuvent déclencher deux fois une action ou être inutiles","Ils effacent toujours les données","Ils ferment automatiquement la page"],ok:0,explain:"Sur le web, un simple clic est généralement attendu."},
      {id:"ne5",q:"Sur une page riche, quelle méthode réduit les erreurs ?",choices:["Repérer d'abord les grandes zones puis cliquer avec intention","Cliquer dès qu'un élément bouge","Changer constamment d'onglet"],ok:0,explain:"Une lecture rapide de la structure aide à mieux naviguer."},
      {id:"ne6",q:"Un site fictif de formation ressemble à un vrai service. Quel élément doit rappeler qu'il s'agit d'un exercice ?",choices:["Une bannière claire « Simulation pédagogique »","Un vrai mot de passe","Une vraie adresse officielle"],ok:0,explain:"Une simulation doit rester clairement identifiable comme exercice."}
    ]
  },

  keyboard: {
    beginner: [
      {id:"kb1",q:"À quoi sert la touche Retour arrière ?",choices:["Effacer le caractère placé avant le curseur","Fermer la page","Créer un nouveau dossier"],ok:0,explain:"Retour arrière efface le caractère situé juste avant le curseur."},
      {id:"kb2",q:"Quelle touche permet souvent de valider une action ?",choices:["Entrée","Verr. Maj","Impr. écran"],ok:0,explain:"Entrée permet souvent de valider ou d'activer un bouton."},
      {id:"kb3",q:"Quelle touche permet de passer au champ suivant ?",choices:["Tab","Échap","F1"],ok:0,explain:"Tab déplace le focus vers le champ ou bouton suivant."},
      {id:"kb4",q:"Comment écrire une majuscule ponctuelle ?",choices:["Maintenir Maj pendant qu'on tape la lettre","Appuyer sur Suppr","Utiliser uniquement la souris"],ok:0,explain:"La touche Maj permet d'écrire une majuscule ponctuelle."},
      {id:"kb5",q:"La barre Espace sert principalement à…",choices:["Créer un espace entre les mots","Fermer Windows","Ouvrir les téléchargements"],ok:0,explain:"Espace sépare les mots et peut aussi activer certaines cases ou boutons."},
      {id:"kb6",q:"Pour écrire une adresse e-mail, quel caractère est indispensable ?",choices:["@","€","# uniquement"],ok:0,explain:"Le caractère @ sépare le nom de la boîte e-mail et le domaine."}
    ],
    intermediate: [
      {id:"ki1",q:"Vous avez dépassé un champ avec Tab. Comment revenir au précédent ?",choices:["Maj + Tab","Ctrl + Z","Alt + F4"],ok:0,explain:"Maj + Tab revient à l'élément précédent."},
      {id:"ki2",q:"Sur une liste déroulante sélectionnée, quelles touches permettent souvent de changer d'option ?",choices:["Les flèches","Retour arrière uniquement","Verr. Num"],ok:0,explain:"Les flèches permettent de parcourir les options."},
      {id:"ki3",q:"Une case à cocher a le focus. Comment la cocher sans souris ?",choices:["Espace","F5","Ctrl + P"],ok:0,explain:"La barre Espace active généralement une case à cocher."},
      {id:"ki4",q:"Vous êtes sur un bouton avec le clavier. Comment l'activer ?",choices:["Entrée ou Espace","Maj uniquement","Flèche gauche uniquement"],ok:0,explain:"Entrée ou Espace activent généralement le bouton sélectionné."},
      {id:"ki5",q:"Pourquoi apprendre Tab et Maj+Tab ?",choices:["Pour naviguer dans un formulaire sans reprendre la souris","Pour augmenter le volume","Pour imprimer automatiquement"],ok:0,explain:"Ces touches permettent d'avancer et de reculer entre les éléments."},
      {id:"ki6",q:"Vous avez tapé « bonjouur ». Quelle touche est la plus utile pour corriger le dernier caractère ?",choices:["Retour arrière","Tab","Échap"],ok:0,explain:"Retour arrière efface le caractère précédent."}
    ],
    expert: [
      {id:"ke1",q:"Vous voulez remplir un formulaire sans souris. Quelle combinaison vous permet d'avancer et de reculer ?",choices:["Tab et Maj + Tab","Ctrl + C et Ctrl + V uniquement","F1 et F2"],ok:0,explain:"Tab avance dans l'ordre de navigation, Maj + Tab recule."},
      {id:"ke2",q:"Le focus est sur une case à cocher mais elle n'est pas cochée. Quelle touche convient ?",choices:["Espace","Retour arrière","Alt"],ok:0,explain:"Espace active ou désactive généralement une case à cocher."},
      {id:"ke3",q:"Le focus est sur un menu déroulant. Quelle méthode clavier est adaptée ?",choices:["Flèches pour choisir puis Tab pour continuer","Suppr puis Échap","Ctrl + Alt + Suppr"],ok:0,explain:"Les flèches modifient le choix, Tab passe ensuite au contrôle suivant."},
      {id:"ke4",q:"Dans une interface accessible, pourquoi le focus visible est-il important ?",choices:["Il montre quel élément recevra la prochaine action clavier","Il change la connexion Internet","Il indique la batterie"],ok:0,explain:"Le focus visible aide à savoir où l'on se trouve sans souris."},
      {id:"ke5",q:"Vous êtes sur un bouton « Envoyer » et souhaitez revenir vérifier un champ. Que faire ?",choices:["Maj + Tab autant de fois que nécessaire","Recharger la page","Fermer l'onglet"],ok:0,explain:"Maj + Tab permet de remonter dans l'ordre de navigation."},
      {id:"ke6",q:"Pourquoi privilégier parfois le clavier dans une longue saisie ?",choices:["Pour limiter les allers-retours souris/clavier et gagner en fluidité","Pour rendre le texte officiel","Pour éviter toute vérification"],ok:0,explain:"Une bonne navigation clavier rend la saisie plus fluide et confortable."}
    ]
  },

  form: {
    beginner: [
      {id:"fb1",q:"À quoi sert la touche Tab dans un formulaire ?",choices:["Passer au champ suivant","Effacer le formulaire","Fermer la page"],ok:0,explain:"Tab permet de déplacer le curseur vers le champ suivant."},
      {id:"fb2",q:"Vous venez de finir d'écrire votre prénom. Que pouvez-vous faire pour aller au champ suivant ?",choices:["Appuyer sur Tab","Éteindre l'écran","Double-cliquer partout"],ok:0,explain:"La touche Tab évite de reprendre la souris."},
      {id:"fb3",q:"Le curseur est déjà dans une case. Que devez-vous faire ?",choices:["Taper le texte demandé","Cliquer dix fois","Fermer la page"],ok:0,explain:"Quand le curseur est dans la case, vous pouvez directement écrire."},
      {id:"fb4",q:"Vous avez fait une faute dans un champ. Quel bon réflexe ?",choices:["Corriger puis continuer avec Tab","Recommencer tout l'ordinateur","Créer un nouveau compte"],ok:0,explain:"Une faute de frappe se corrige simplement."},
      {id:"fb5",q:"Dans un formulaire, une étoile * signifie souvent…",choices:["Champ obligatoire","Champ décoratif","Champ interdit"],ok:0,explain:"L'étoile indique généralement un champ obligatoire."},
      {id:"fb6",q:"Quand vous arrivez sur un bouton avec Tab, comment l'activer au clavier ?",choices:["Avec Entrée ou Espace","Avec Échap uniquement","En éteignant la souris"],ok:0,explain:"Entrée ou Espace activent généralement le bouton sélectionné."}
    ],
    intermediate: [
      {id:"fi1",q:"Vous avez fini de remplir un champ et voulez passer au suivant sans souris. Que faire ?",choices:["Appuyer sur Tab","Appuyer sur Suppr","Cliquer sur le bureau"],ok:0,explain:"Tab déplace le focus vers l'élément suivant."},
      {id:"fi2",q:"Vous avez dépassé un champ avec Tab. Comment revenir en arrière ?",choices:["Maj + Tab","Ctrl + P","Alt + F4"],ok:0,explain:"Maj + Tab permet de revenir à l'élément précédent."},
      {id:"fi3",q:"Le focus arrive sur une liste déroulante. Que pouvez-vous faire ?",choices:["Utiliser les flèches puis Tab","Fermer la page","Taper un mot de passe"],ok:0,explain:"Les flèches permettent de changer l'option sélectionnée."},
      {id:"fi4",q:"Le focus arrive sur une case à cocher. Quelle touche peut la cocher ?",choices:["Espace","F5","Ctrl"],ok:0,explain:"La barre Espace coche ou décoche généralement une case."},
      {id:"fi5",q:"Pourquoi utiliser Tab peut-il être utile ?",choices:["Pour remplir plus vite sans déplacer la souris","Pour supprimer le formulaire","Pour imprimer automatiquement"],ok:0,explain:"Tab facilite la navigation au clavier entre les champs."},
      {id:"fi6",q:"Vous arrivez sur le bouton Envoyer avec Tab. Quel réflexe avant de l'activer ?",choices:["Relire le formulaire","Appuyer immédiatement sans vérifier","Fermer l'onglet"],ok:0,explain:"Il est utile de relire les informations avant l'envoi."}
    ],
    expert: [
      {id:"fe1",q:"Vous utilisez uniquement le clavier. Comment revenir au champ précédent ?",choices:["Maj + Tab","Ctrl + Alt + Suppr","F11"],ok:0,explain:"Maj + Tab déplace le focus vers l'élément précédent."},
      {id:"fe2",q:"Sur un bouton radio, quelles touches permettent souvent de changer de choix ?",choices:["Les flèches","Retour arrière uniquement","Échap"],ok:0,explain:"Les touches fléchées permettent souvent de parcourir les options radio."},
      {id:"fe3",q:"Vous êtes sur une case à cocher sans utiliser la souris. Comment la modifier ?",choices:["Appuyer sur Espace","Appuyer sur F1","Appuyer sur Ctrl + S"],ok:0,explain:"La barre Espace active généralement une case à cocher."},
      {id:"fe4",q:"Un formulaire contient un lien entre deux champs. La touche Tab va…",choices:["Suivre l'ordre de navigation prévu par la page","Toujours ignorer les liens","Fermer le formulaire"],ok:0,explain:"Tab suit l'ordre de focus défini dans la page."},
      {id:"fe5",q:"Pourquoi l'ordre de tabulation est-il important pour l'accessibilité ?",choices:["Il permet de suivre le formulaire logiquement sans souris","Il change la couleur du site","Il augmente la vitesse Internet"],ok:0,explain:"Un ordre logique rend le formulaire utilisable au clavier."},
      {id:"fe6",q:"Vous êtes sur le bouton Envoyer et voulez vérifier un champ précédent sans souris. Que faire ?",choices:["Utiliser Maj + Tab autant de fois que nécessaire","Actualiser la page","Fermer le navigateur"],ok:0,explain:"Maj + Tab permet de remonter dans l'ordre de navigation."}
    ]
  },

  missing_piece: {
    beginner: [
      {id:"mb1",q:"Le message dit qu'il manque un justificatif de domicile. Que devez-vous envoyer ?",choices:["Le justificatif de domicile demandé","N'importe quel PDF","Votre mot de passe"],ok:0,explain:"Il faut envoyer exactement la pièce demandée."},
      {id:"mb2",q:"Que veut dire « joindre un fichier » ?",choices:["Ajouter un document à la démarche","Créer un compte","Supprimer le dossier"],ok:0,explain:"Joindre signifie ajouter un document."},
      {id:"mb3",q:"Vous avez sélectionné le mauvais fichier. Que faire ?",choices:["Choisir un autre fichier","Envoyer quand même","Abandonner"],ok:0,explain:"Une erreur de sélection se corrige simplement."},
      {id:"mb4",q:"Après avoir choisi un fichier, que devez-vous regarder ?",choices:["Le nom du fichier affiché","La couleur de la souris","L'heure"],ok:0,explain:"Le nom affiché permet de vérifier la pièce sélectionnée."},
      {id:"mb5",q:"Le service demande un PDF. Quel fichier choisissez-vous ?",choices:["Un fichier qui se termine par .pdf","Un fichier .mp3","Un raccourci"],ok:0,explain:"Le format demandé doit être respecté."},
      {id:"mb6",q:"Après avoir envoyé la bonne pièce, que peut indiquer le service ?",choices:["Dossier complet","Ordinateur bloqué","Compte supprimé"],ok:0,explain:"Une fois la pièce reçue, le dossier peut devenir complet."}
    ],
    intermediate: [
      {id:"mi1",q:"Le message demande « justificatif de domicile de moins de 3 mois ». Quelle facture choisir ?",choices:["La plus récente et conforme","La plus ancienne","N'importe laquelle"],ok:0,explain:"Il faut aussi respecter la période demandée."},
      {id:"mi2",q:"Vous avez joint le bon type de document mais le mauvais mois. Quel réflexe ?",choices:["Remplacer le fichier avant l'envoi","Envoyer puis espérer","Créer un nouveau dossier"],ok:0,explain:"Relisez les critères et remplacez la pièce."},
      {id:"mi3",q:"Le service demande un PDF et votre document est une photo JPG. Que faire ?",choices:["Fournir une vraie version PDF ou convertir correctement","Renommer seulement .jpg en .pdf","Envoyer autre chose"],ok:0,explain:"Changer seulement l'extension ne convertit pas le fichier."},
      {id:"mi4",q:"Après l'envoi d'une pièce, quel élément peut servir de preuve ?",choices:["Un message de confirmation ou un récépissé","La couleur du bouton","Le fond d'écran"],ok:0,explain:"Une confirmation permet de savoir que l'envoi a été pris en compte."},
      {id:"mi5",q:"Le fichier est trop volumineux. Quelle solution est logique ?",choices:["Réduire sa taille ou suivre les indications du site","Envoyer son mot de passe","Créer plusieurs comptes"],ok:0,explain:"Les sites imposent parfois une taille maximale."},
      {id:"mi6",q:"Le service demande deux pièces différentes. Que faire ?",choices:["Joindre chacune dans le bon emplacement","Joindre deux fois le même fichier","Ignorer la deuxième"],ok:0,explain:"Chaque emplacement doit recevoir la pièce correspondante."}
    ],
    expert: [
      {id:"me1",q:"Le dossier demande un avis d'imposition N-1. Quel réflexe ?",choices:["Vérifier précisément l'année demandée","Prendre le premier avis trouvé","Envoyer un relevé bancaire"],ok:0,explain:"Les demandes administratives utilisent souvent des références d'année précises."},
      {id:"me2",q:"Le site affiche « format non pris en charge ». Que faut-il faire ?",choices:["Vérifier les formats autorisés et fournir un fichier réellement conforme","Changer seulement l'extension","Actualiser sans lire"],ok:0,explain:"Le format réel du fichier doit être compatible."},
      {id:"me3",q:"Le service demande recto et verso dans un seul PDF. Vous avez deux images. Que faire ?",choices:["Créer un document regroupant les deux faces","Envoyer seulement le recto","Renommer une image en .pdf"],ok:0,explain:"La demande précise qu'un seul document doit contenir les deux faces."},
      {id:"me4",q:"Après l'envoi, le statut reste « pièce attendue ». Quel premier réflexe ?",choices:["Vérifier la confirmation et patienter un peu","Envoyer dix fois le fichier","Créer un nouveau compte"],ok:0,explain:"Certains statuts ne se mettent pas à jour instantanément."},
      {id:"me5",q:"Vous doutez de l'authenticité d'une demande de pièce. Que faire ?",choices:["Vérifier la demande dans l'espace officiel","Répondre avec vos codes","Cliquer sur tous les liens"],ok:0,explain:"La messagerie interne du service officiel est un bon point de vérification."},
      {id:"me6",q:"Vous devez envoyer un document contenant des données sensibles. Quel principe appliquer ?",choices:["Utiliser uniquement l'espace officiel prévu","Le publier dans un cloud public","Le transmettre au groupe"],ok:0,explain:"Les pièces administratives doivent passer par un canal approprié."}
    ]
  },

  security: {
    beginner: [
      {id:"sb1",q:"Un e-mail vous demande votre mot de passe. Que faites-vous ?",choices:["Je ne le donne pas","Je l'envoie","Je le publie"],ok:0,explain:"Un mot de passe doit rester secret."},
      {id:"sb2",q:"Un message dit « URGENT, cliquez maintenant ». Quel bon réflexe ?",choices:["Prendre le temps de vérifier","Cliquer immédiatement","Donner son code SMS"],ok:0,explain:"L'urgence peut être utilisée pour vous faire agir trop vite."},
      {id:"sb3",q:"En cas de doute sur un e-mail administratif, que faire ?",choices:["Ouvrir soi-même le site officiel","Cliquer sur le lien reçu","Répondre avec ses codes"],ok:0,explain:"Accédez directement au site officiel."},
      {id:"sb4",q:"Un code reçu par SMS est-il personnel ?",choices:["Oui","Non"],ok:0,explain:"Les codes de connexion reçus par SMS doivent rester privés."},
      {id:"sb5",q:"Le formateur peut-il vous aider sans connaître votre mot de passe ?",choices:["Oui","Non"],ok:0,explain:"On peut expliquer les gestes sans demander vos secrets."},
      {id:"sb6",q:"Quel geste est prudent avant de cliquer ?",choices:["Lire le message","Fermer les yeux","Cliquer plusieurs fois"],ok:0,explain:"Lire avant d'agir permet d'éviter de nombreux pièges."}
    ],
    intermediate: [
      {id:"si1",q:"Un e-mail reprend le logo Ameli mais l'adresse de l'expéditeur est étrange. Que faire ?",choices:["Vérifier depuis le site officiel","Faire confiance au logo","Répondre avec sa carte bancaire"],ok:0,explain:"Un logo peut être copié."},
      {id:"si2",q:"Vous recevez un lien pour un remboursement inattendu. Quel bon réflexe ?",choices:["Ouvrir directement votre espace officiel","Cliquer sur le lien","Envoyer une photo de votre carte"],ok:0,explain:"Vérifiez l'information depuis votre compte officiel."},
      {id:"si3",q:"Une page de connexion s'ouvre après un lien reçu. Que vérifier ?",choices:["L'adresse du site avant de saisir quoi que ce soit","Taper le mot de passe immédiatement","Désactiver l'antivirus"],ok:0,explain:"L'adresse du site permet de détecter de nombreuses fausses pages."},
      {id:"si4",q:"Quelqu'un au téléphone demande le code SMS que vous venez de recevoir. Que faire ?",choices:["Ne pas le communiquer","Le dicter","Le publier"],ok:0,explain:"Un code d'authentification ne doit pas être communiqué."},
      {id:"si5",q:"Un message contient des fautes et menace de fermer votre compte. Cela peut être…",choices:["Un signe de phishing","Une preuve qu'il est officiel","Une mise à jour Windows"],ok:0,explain:"Menaces, fautes et urgence sont des indices possibles."},
      {id:"si6",q:"Vous avez cliqué sur un lien douteux sans rien saisir. Quel réflexe ?",choices:["Fermer la page et ouvrir le site officiel","Continuer pour voir","Entrer de faux codes"],ok:0,explain:"Il vaut mieux repartir d'une source de confiance."}
    ],
    expert: [
      {id:"se1",q:"Une page ressemble à impots.gouv.fr mais l'adresse est « impots-gouv-securite.example ». Conclusion ?",choices:["L'adresse n'est pas le domaine officiel","Le logo suffit à prouver que c'est officiel","Le cadenas suffit"],ok:0,explain:"Un site frauduleux peut copier l'apparence."},
      {id:"se2",q:"Le cadenas HTTPS garantit-il qu'un site est légitime ?",choices:["Non, pas à lui seul","Oui, toujours","Seulement sur mobile"],ok:0,explain:"Un site frauduleux peut aussi utiliser HTTPS."},
      {id:"se3",q:"Vous recevez une demande d'authentification que vous n'avez pas déclenchée. Que faire ?",choices:["La refuser et vérifier le compte","L'accepter pour la faire disparaître","La partager"],ok:0,explain:"Une demande non initiée peut signaler une tentative de connexion."},
      {id:"se4",q:"Un message demande d'installer un logiciel pour consulter un document administratif. Quel réflexe ?",choices:["Vérifier sur le site officiel avant toute installation","Installer immédiatement","Désactiver les protections"],ok:0,explain:"Les installations inattendues sont un risque."},
      {id:"se5",q:"Pourquoi éviter le même mot de passe partout ?",choices:["Une fuite sur un service pourrait exposer les autres comptes","Parce que Windows l'interdit","Pour télécharger plus vite"],ok:0,explain:"Des mots de passe distincts limitent les conséquences d'une fuite."},
      {id:"se6",q:"Vous avez saisi votre mot de passe sur un faux site. Quelle priorité ?",choices:["Changer rapidement le mot de passe sur le vrai service","Attendre quelques semaines","Supprimer seulement l'e-mail"],ok:0,explain:"Il faut agir rapidement pour protéger le compte."}
    ]
  }
};

# Atelier numérique — V8

Application d'entraînement aux démarches administratives en ligne, pour les ateliers de médiation numérique.
Un **formateur** crée un groupe, distribue des codes, attribue des missions et suit la salle **en direct**.
Les **participants** entrent avec deux codes et un prénom ou pseudo : aucun e-mail, aucune donnée personnelle.

---

## Chapitres du programme

Chaque séance dure 30 minutes au plus : un cours court projeté, des jeux en direct sur les PC (façon Kahoot), puis les exercices de chacun.

- **📧 E-mail** : 5 séances, 13 jeux, 7 niveaux notés sur 20.
- **🧭 Navigateurs et recherche** : 3 séances, 10 jeux, 7 niveaux notés sur 20.
  - Séance 1 : navigateur, moteur ou site ; les boutons ; taper une adresse ; onglets et favoris.
  - Séance 2 : les mots-clés ; lire une page de résultats ; les annonces « Sponsorisé » ; les sites officiels.
  - Séance 3 : le vrai nom d'un site ; le cadenas ; les faux sites ; les fausses alertes virus ; cookies et fenêtres pièges.
  - Les exercices se font dans un **navigateur simulé** (onglets, flèches, favoris, cadenas, moteur « Cherchetout »).
  - Le **niveau 7 est une mission réelle** : le participant choisit une mission, cherche sur le vrai Internet, puis répond dans l'application. Sa réponse arrive dans la **messagerie du formateur**, qui la valide avec les réponses rapides « Mission réelle… ».
- **🔑 Comptes et mots de passe** : 3 séances, 9 jeux, 8 niveaux notés sur 20.
  - Séance 1 : identifiant et mot de passe ; créer un compte ; le bouton 👁 ; se déconnecter.
  - Séance 2 : comment font les pirates ; la phrase de passe ; le coffre-fort (Chrome et iPhone).
  - Séance 3 : le code par SMS ; FranceConnect ; le faux conseiller ; oubli et piratage.
  - Le **niveau 3 « Dans la peau du pirate »** montre un mot de passe faible tomber en quelques secondes, et une phrase de passe résister.
  - Le **niveau 8 est une mission réelle** : observer une vraie page de connexion (ameli, impots.gouv, CAF…) **sans se connecter**.
  - 🛡️ Partout : « N'utilisez jamais un vrai mot de passe ici ». Rien n'est enregistré.
- **🗂️ Fichiers et dossiers** : 3 séances, 9 jeux, 8 niveaux notés sur 20.
  - Séance 1 : l'armoire (fichier, dossier) ; l'Explorateur ; les grands dossiers ; les extensions (.pdf, .jpg, .exe…).
  - Séance 2 : bien nommer ; renommer sans casser l'extension ; créer un dossier et ranger ; la Corbeille.
  - Séance 3 : retrouver un téléchargement (tri par date) ; la recherche ; joindre un document à une démarche (date, format, taille).
  - Les exercices se font dans un **Explorateur Windows simulé** : dossiers, clic droit, glisser-déposer, couper/coller, renommer (avec l'avertissement sur l'extension), Corbeille, recherche, fenêtre « Ouvrir ».
  - Le **niveau 8 est une mission réelle** sur le vrai ordinateur : ouvrir l'Explorateur, trier, afficher les extensions, créer un dossier « Atelier numérique », **sans rien supprimer**. Les observations arrivent dans la messagerie du formateur.
- **📶 Wi-Fi et réseaux** : 3 séances, 9 jeux, 8 niveaux notés sur 20.
  - Séance 1 : la box, le Wi-Fi et la 4G ; lire les icônes ; se connecter à la box ; Wi-Fi ou forfait.
  - Séance 2 : le Wi-Fi public et les faux réseaux ; « Pas d'Internet » : la méthode en 3 étapes ; redémarrer la box.
  - Séance 3 : les arnaques box et forfait (33700) ; le partage de connexion ; les bons réflexes.
  - Trois simulateurs : un **ordinateur Windows 11** (menu Wi-Fi, clé de sécurité, mode avion, page de connexion des Wi-Fi publics), un **smartphone** (Réglages, Wi-Fi, données mobiles, partage de connexion, consommation) et une **box** (étiquette, voyants, redémarrage).
  - Le **niveau 8 est une mission réelle** sur son propre téléphone : icônes, mode avion, consommation, Wi-Fi de la médiathèque, **sans rien changer**. Les observations arrivent dans la messagerie du formateur.

## Nouveautés de la V8

### Pour le formateur
- **Vue « En direct »** : qui est connecté, sur quelle mission, à quelle étape, qui est inactif depuis plus de 3 minutes.
- **Bouton « J'ai besoin d'aide »** côté participant : la carte s'allume, un petit son retentit, l'onglet affiche ✋. Le bouton « J'arrive ✓ » prévient le participant.
- **Attribution groupée** : une mission ou un parcours entier à tout le groupe en un clic, au niveau de chacun ou à un niveau commun.
- **Parcours** : des missions qui se débloquent l'une après l'autre (Premiers pas, Parcours administratif complet, Se protéger des arnaques).
- **Missions personnalisées sans code** : consigne, lien, message automatique et quiz (jusqu'à 6 questions).
- **Imprimer les codes** : une carte par participant (adresse, code atelier, code personnel), à découper.
- **Projeter le code** de l'atelier en grand sur l'écran de la salle.
- **Messagerie** : envoi à tout le groupe, réponses rapides modifiables, brouillon conservé.
- **Statistiques** : progression, réussite aux quiz par mission (pour repérer les notions à revoir) et **export CSV** (Excel) pour les bilans d'activité.
- Favoris, archivage, ordre des groupes et réponses rapides **enregistrés dans Firebase** : on les retrouve sur tous les postes.
- Ajout d'une place dans un groupe existant (jusqu'à 12) ; suppression complète d'un groupe et de toutes ses données.

### Pour le participant
- **5 nouvelles missions** : retrouver un fichier téléchargé (faux Explorateur Windows : trier, ouvrir, renommer, ranger), repérer un SMS frauduleux, mot de passe oublié, prendre un rendez-vous en ligne, payer en ligne en sécurité.
- Missions existantes enrichies :
  - « Télécharger » produit un **vrai PDF** d'exercice et demande de le retrouver ;
  - « Pièce manquante » fait télécharger plusieurs documents et choisir **le bon dans le vrai sélecteur de fichiers** de l'ordinateur ;
  - « E-mail suspect » devient une enquête : cliquer sur les indices, survoler le lien.
- **Confort de lecture** : A− / A+, contraste renforcé, **lecture à voix haute** (bouton 🔊 sur chaque consigne).
- **Fiche-mémo imprimable** à la fin de chaque mission (« Ce que j'ai appris »), et pour toutes les missions réussies.
- Un participant qui appuie sur F5 retrouve son espace. Avec ses codes, il retrouve aussi son carnet **d'une séance à l'autre, sur n'importe quel poste**.
- Quiz : **l'ordre des réponses est mélangé**. En V7, la bonne réponse était toujours la première affichée.

### Sécurité (corrigée par rapport à la V7)
La V7 permettait à tout participant anonyme de lire **tous les messages de tous les ateliers**, d'écrire en se faisant passer pour le formateur, de modifier n'importe quelle mission et de lire tous les codes participants.
Les nouvelles règles (`firestore.rules`) garantissent que :
- un participant ne lit et ne modifie **que sa propre place** (missions, messages, réussites) ;
- pour prendre une place, il doit **prouver qu'il connaît les deux codes** ;
- un participant ne peut ni se faire passer pour le formateur, ni modifier autre chose que l'avancement de ses missions ;
- un formateur ne voit **que ses groupes**.

---

## Essayer tout de suite (sans Firebase)

1. Double-cliquez sur `index.html` (Chrome, Edge ou Firefox).
2. **Je suis le formateur** → **Entrer en mode démonstration** → **Groupes** → créez un groupe.
3. Ouvrez un **deuxième onglet** sur la même page → **Je participe à l'atelier** → tapez le code de l'atelier et un code de place.
4. Dans l'onglet formateur, attribuez une mission : elle apparaît **instantanément** chez le participant.

En mode démonstration, tout reste dans le navigateur (localStorage).

---

## Mise en ligne avec Firebase

> Si vous aviez la V7 en ligne : la structure des données a changé (pour la sécurité). Les anciens groupes ne seront pas repris : recréez vos groupes après la mise à jour.

### 1. Console Firebase
- **Authentication → Méthodes de connexion** : activez **E-mail/mot de passe** et **Anonyme**.
- **Firestore Database** : créez la base (région `eur3` ou `europe-west`).
- **Paramètres du projet → Vos applications** : copiez la configuration web dans `firebase-config.js` (déjà fait pour `numerique-administratif`).

### 2. Créer le premier formateur
1. **Authentication → Ajouter un utilisateur** (e-mail + mot de passe).
2. Copiez son **UID**.
3. **Firestore → Démarrer une collection** `users` → document dont l'ID est cet UID → champ `role` (chaîne) = `teacher`.

Le rôle n'est jamais créé depuis le navigateur : un participant ne peut pas devenir formateur.
Pour ajouter un collègue du réseau, répétez ces trois étapes.

### 3. Déployer les règles, les index et le site
```bash
npm install -g firebase-tools
firebase login
firebase use numerique-administratif
firebase deploy --only firestore:rules,firestore:indexes
firebase deploy --only hosting
```
Les index (`firestore.indexes.json`) sont **indispensables** : ils permettent au tableau de bord de suivre tous vos groupes en direct. Leur création peut prendre quelques minutes après le déploiement.

### 4. Déploiement automatique depuis GitHub (facultatif)
Le fichier `.github/workflows/firebase-hosting.yml` déploie à chaque push sur `main`.
Remplacez `VOTRE_PROJET_FIREBASE`, puis ajoutez le secret `FIREBASE_SERVICE_ACCOUNT` dans GitHub.

---

## Organisation du code

Le code est en HTML/CSS/JavaScript classique, sans outil de compilation : il suffit d'ouvrir `index.html`.

```
index.html                 structure des écrans
firebase-config.js         configuration du projet Firebase
css/app.css                styles communs + espace participant (thème chaleureux)
css/missions.css           styles des simulations (explorateur, téléphone, carte…)
css/teacher.css            espace formateur (thème graphite / cyan / vert / ambre)
js/core.js                 utilitaires, écrans, boîtes de dialogue, PDF d'exercice
js/store-demo.js           données en mode démo (localStorage + synchro entre onglets)
js/store-firebase.js       données Firebase (même interface, temps réel)
js/catalog.js              liste des missions, des parcours et des fiches-mémo
js/quiz-banks*.js          questions des quiz (par thème et par niveau)
js/quiz.js                 moteur de quiz (sans répétition, réponses mélangées)
js/a11y.js                 taille du texte, contraste, lecture à voix haute
js/missions/runtime.js     moteur commun des missions
js/missions/*.js           une famille de missions par fichier (files-kit.js : l'Explorateur simulé ; net-kit.js : PC, téléphone et box)
js/student.js              espace participant
js/teacher.js              espace formateur
js/app.js                  démarrage
```

### Ajouter une mission
1. Déclarez-la dans `js/catalog.js` (`missions` + `memos`).
2. Créez son code avec `AN.missions.register("ma_mission", { steps, theme, render(ctx) { … } })`.
   Le `ctx` fournit : `ctx.level`, `ctx.byLevel({beginner, intermediate, expert})`, `ctx.help()`, `ctx.go(étape)`, `ctx.autoMessage()`, `ctx.complete()`…
3. Ajoutez ses questions dans `js/quiz-banks-new.js` (au moins 3 par niveau).

Pour des exercices simples, la **mission personnalisée** de l'espace formateur suffit souvent.

---

## Données et confidentialité
- Les participants n'ont ni e-mail ni mot de passe. Un identifiant anonyme Firebase est créé en arrière-plan.
- Aucun fichier n'est envoyé sur Internet : seul le **nom** du fichier choisi est vérifié dans le navigateur.
- Les mots de passe inventés dans la mission « Mot de passe oublié » et la carte d'exercice ne sont **jamais enregistrés**.
- En fin de cycle, **supprimez le groupe** (Groupes → Supprimer) : places, missions, messages et réussites sont effacés.
- Rappelez aux participants de ne jamais saisir de vraies informations dans les simulations.

## Limites connues
- Les règles de sécurité ont été relues avec soin, mais elles n'ont pas pu être exécutées dans l'émulateur Firebase pendant le développement. Après le déploiement, faites un essai avec un poste formateur et deux postes participants.
- Le code personnel a 4 chiffres pour rester simple. Quelqu'un qui connaît le code de l'atelier pourrait, en théorie, essayer les 10 000 combinaisons. Le risque est faible pour un atelier en salle. Supprimez les groupes terminés.
- La lecture à voix haute dépend des voix installées sur l'ordinateur. Windows 10/11 et Chrome proposent des voix françaises.

# Atelier numérique — Maître / Participants

Cette application est un prototype complet pour des ateliers d'initiation aux démarches administratives.

## Ce qui est déjà inclus

- Espace **Maître**
- Jusqu'à **10 places neutres** par atelier
- Code d'atelier à 6 chiffres
- Code participant à 4 chiffres
- Le participant choisit lui-même son **prénom ou pseudo**
- Missions individuelles
- Niveaux **Débutant / Intermédiaire / Expert**
- Messagerie Maître ↔ participant
- Réponses pré-enregistrées
- Messages automatiques liés aux scénarios
- Mission « pièce manquante »
- Vérification du nom du fichier choisi
- Mission « e-mail suspect »
- Téléchargement de fichiers d'exercice
- Mini-quiz
- Carnet de réussites
- Mode démonstration local sans Firebase
- Mode Firebase multi-ordinateur

## Important sur les fichiers

Dans ce prototype, les pièces jointes pédagogiques **ne sont pas envoyées sur Internet**.
Le navigateur lit seulement le nom du fichier choisi pour vérifier si l'apprenant a sélectionné la bonne pièce.

C'est volontaire : cela évite de stocker des documents personnels pendant une formation.

## Essayer immédiatement sans Firebase

1. Double-cliquez sur `index.html` pour l'ouvrir dans Chrome, Edge ou Firefox.
2. Cliquez sur **Je suis le maître**.
3. Cliquez sur **Entrer en mode démonstration**.
4. Créez un atelier de 4 à 10 personnes.
5. Notez le code d'atelier et le code d'un participant.
6. Ouvrez l'application dans un autre onglet.
7. Choisissez **Je participe à l'atelier**.
8. Entrez les deux codes.
9. Choisissez un prénom ou un pseudo.

En mode démonstration, tout est stocké dans `localStorage`.  
Pour tester avec plusieurs ordinateurs, configurez Firebase.

---

# Configuration Firebase

## 1. Créer un projet Firebase

Dans la console Firebase :

- créez un projet ;
- ajoutez une **application Web** ;
- copiez la configuration fournie ;
- collez-la dans `firebase-config.js`.

## 2. Authentication

Activez :

- **E-mail / mot de passe** pour le maître ;
- **Anonyme** pour les participants.

Le maître a un vrai compte.  
Les participants n'ont pas besoin d'e-mail : Firebase leur attribue un UID anonyme en arrière-plan.

## 3. Firestore

Créez une base Firestore.

Déployez les règles fournies :

```bash
firebase deploy --only firestore:rules
```

## 4. Créer le premier maître

Créez le compte du formateur dans Authentication.

Ensuite, dans Firestore, créez manuellement :

```text
users
  └── UID_DU_FORMATEUR
      └── role: "teacher"
```

Le rôle n'est jamais créé depuis le navigateur, afin qu'un participant ne puisse pas devenir maître.

## 5. Hébergement

Installez Firebase CLI :

```bash
npm install -g firebase-tools
firebase login
firebase init hosting
firebase deploy
```

Le fichier `firebase.json` est déjà fourni.

---

# GitHub

Vous pouvez déposer tout le dossier dans un dépôt GitHub.

Le fichier :

`.github/workflows/firebase-hosting.yml`

est fourni comme base de déploiement automatique.

Il faut :

1. remplacer `VOTRE_PROJET_FIREBASE` ;
2. ajouter le secret `FIREBASE_SERVICE_ACCOUNT` dans GitHub.

---

# Structure Firestore proposée

```text
users/{uid}
  role: teacher

workshops/{workshopId}
  code
  name
  teacherUid
  createdAt

workshops/{workshopId}/seats/{seatId}
  seatCode
  displayName
  claimed
  studentUid
  level

missions/{missionId}
  workshopId
  seatId
  type
  level
  status
  step

messages/{messageId}
  workshopId
  seatId
  from
  to
  subject
  text
  auto
  read
  createdAt

workshops/{workshopId}/seats/{seatId}/achievements/{achievementId}
  label
  done
  updatedAt
```

---

# Logique d'une mission « pièce manquante »

1. Le maître attribue la mission.
2. L'apprenant commence.
3. L'application envoie automatiquement :
   « Votre dossier est incomplet. Merci de transmettre le justificatif_domicile. »
4. L'apprenant ouvre le message.
5. Il sélectionne un fichier.
6. Si le nom ne contient pas `justificatif_domicile`, l'application refuse et explique.
7. S'il choisit le bon fichier :
   - la pièce est considérée comme reçue ;
   - un message automatique confirme que le dossier est complet ;
   - la mission passe à `done`.
8. Aucun clic du maître n'est nécessaire.

---

# Conseils avant mise en production

Ce prototype privilégie la pédagogie. Avant un vrai déploiement public :

- affinez les règles Firestore ;
- ajoutez des limites de taille et de fréquence ;
- ajoutez un système d'archivage/suppression des ateliers ;
- prévoyez une politique de confidentialité ;
- n'utilisez jamais de vraies données administratives ou mots de passe dans les simulations ;
- faites tester l'interface par quelques participants avant un atelier complet.


## Quiz par niveau et sans répétition immédiate

Les quiz sont séparés par **thème** et par **niveau** :

- Débutant : questions simples de reconnaissance ;
- Intermédiaire : petites mises en situation ;
- Expert : cas plus réalistes et subtils.

Pour chaque participant, l'application mémorise les questions déjà posées dans chaque thème et niveau. Une question n'est pas reposée tant que toutes les autres questions de la même banque n'ont pas été utilisées.


## Nouvelle mission : formulaire au clavier

Le maître peut attribuer **Remplir un formulaire avec la touche Tab**.

L'exercice demande au participant de remplir plusieurs champs fictifs :

- prénom ;
- nom ;
- adresse e-mail ;
- téléphone ;
- date ;
- situation ;
- code postal ;
- ville ;
- message ;
- case à cocher.

Après le premier champ, l'objectif est d'utiliser **Tab** pour avancer dans le formulaire.

Le nombre minimal de tabulations dépend du niveau :

- Débutant : au moins 5 passages avec Tab ;
- Intermédiaire : au moins 7 ;
- Expert : au moins 9.

Le niveau Intermédiaire demande davantage d'autonomie.  
Le niveau Expert encourage aussi l'utilisation de **Maj + Tab**, **Espace** et des flèches.

Le quiz de fin possède lui aussi des questions différentes selon le niveau.


## Nouvelle mission : Maîtrise du clavier

Le maître peut maintenant attribuer **Maîtriser les touches essentielles du clavier**.

La mission vérifie réellement l'utilisation de :

- Retour arrière ;
- Majuscule ;
- caractère `@` ;
- Tab ;
- Maj + Tab ;
- flèches ;
- Espace ;
- Entrée.

Le parcours est adapté au niveau :

### Débutant
Consignes très guidées. L'objectif est surtout de découvrir les touches et de réussir les gestes de base.

### Intermédiaire
Le participant doit enchaîner les gestes plus librement et utiliser aussi `Maj + Tab`.

### Expert
Le parcours encourage une navigation presque entièrement au clavier, avec davantage de passages via `Tab`.

Un quiz spécifique au clavier est inclus et possède des questions différentes selon le niveau.


## Nouvelle mission : navigation à la souris sur des sites fictifs

Le maître peut attribuer **Explorer des sites administratifs à la souris**.

Trois simulations sont incluses :

### Impôts
- Accueil
- Particulier
- Professionnel
- Mes documents
- Contact

### Ameli
- Accueil
- Assuré
- Professionnel de santé
- Entreprise
- Annuaire santé

### MSA
- Accueil
- Particulier
- Exploitant
- Employeur
- Contact

Chaque onglet ouvre une page fictive différente avec des cartes et boutons cliquables.

Les aides varient selon le niveau :

- Débutant : les rubriques à cliquer sont indiquées explicitement ;
- Intermédiaire : plusieurs rubriques doivent être retrouvées avec moins d'aide ;
- Expert : l'apprenant doit explorer toutes les grandes rubriques.

Une bannière permanente indique clairement **SIMULATION PÉDAGOGIQUE** afin d'éviter toute confusion avec les vrais services administratifs.

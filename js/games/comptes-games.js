/* =========================================================
   Jeux en direct du chapitre « Comptes et mots de passe » (3 séances)
   ========================================================= */
(function (AN) {
  "use strict";
  const G = AN.games.register;

  /* =================== SÉANCE 1 =================== */
  const MS = ["🗣️ Je peux la donner", "🤐 Je la garde secrète"];
  const ms = (what, ok, why) => ({ kind: "choice", prompt: `<div class="nv-who">${what}</div><br><b>Cette information : je peux la donner, ou je la garde secrète ?</b>`, choices: MS, ok, why, short: what.replace(/<[^>]+>/g, ""), limit: 15 });
  G({ id: "acc_montrer", title: "Je le donne ou je le garde ?", icon: "🤐",
    intro: "Une information s'affiche. Est-ce que je peux la <b>donner</b> (à un site, à une personne), ou est-ce que je la <b>garde secrète</b> ?",
    rounds: [
      ms("📧 Mon adresse e-mail", 0, "L'adresse e-mail sert souvent d'<b>identifiant</b> : on peut la donner, comme une adresse postale. Ce n'est pas un secret."),
      ms("🔑 Mon mot de passe", 1, "Le mot de passe, c'est la <b>clé</b> : il ne se donne à personne. On le tape soi-même, sur le vrai site."),
      ms("📱 Le code reçu par SMS", 1, "Le code par SMS est une deuxième clé : il ne se donne <b>jamais</b>, même à un « conseiller »."),
      ms("👤 Mon nom d'utilisateur (mon identifiant)", 0, "L'identifiant dit « qui je suis » : ce n'est pas un secret. C'est le mot de passe qui est secret."),
      ms("💳 Le code de ma carte bancaire", 1, "Le code de la carte ne se donne jamais : ni par téléphone, ni par e-mail, ni sur un site."),
      ms("❓ La réponse à ma « question secrète » (ex. : le nom de mon premier animal)", 1, "Elle sert à récupérer un compte : c'est presque un mot de passe ! On ne la donne pas, et on ne la publie pas.")
    ] });

  G({ id: "acc_inscription", title: "Remets l'inscription dans l'ordre", icon: "🧩",
    intro: "Les étapes pour créer un compte sont mélangées : remettez-les <b>dans l'ordre</b> !",
    rounds: [{ kind: "order", limit: 75, prompt: "Je crée mon compte lecteur sur le site de la médiathèque. <b>Remettez les étapes dans l'ordre.</b>", answer: ["Cliquer sur « Créer un compte »", "Remplir nom, prénom, e-mail", "Choisir un mot de passe et le confirmer", "Cocher « J'accepte les conditions »", "Cliquer sur « Créer mon compte »", "Cliquer sur le lien de l'e-mail de confirmation"],
      why: "Le lien de l'e-mail arrive en dernier : il confirme le compte. S'il n'arrive pas, on regarde dans les <b>Indésirables</b> (spams)." }] });

  const DC = ["🚪 Oui, je me déconnecte", "🏠 Non, pas besoin"];
  const dc = (where, ok, why, short) => ({ kind: "choice", prompt: `${where}<br><b>J'ai fini. Est-ce que je me déconnecte ?</b>`, choices: DC, ok, why, short, limit: 15 });
  G({ id: "acc_deconnecte", title: "Je me déconnecte ou pas ?", icon: "🚪",
    intro: "J'ai fini d'utiliser mon compte. Selon l'appareil : est-ce que je me <b>déconnecte</b>, ou est-ce que ce n'est <b>pas nécessaire</b> ?",
    rounds: [
      dc("💻 Je suis sur un ordinateur de la <b>médiathèque</b>.", 0, "Ordinateur partagé : <b>toujours</b> se déconnecter. Sinon, la personne suivante entre dans votre compte.", "Ordinateur de la médiathèque"),
      dc("📱 Je suis sur <b>mon</b> téléphone, protégé par un code.", 1, "Votre téléphone, protégé par votre code : on peut rester connecté(e), c'est fait pour ça.", "Mon téléphone avec un code"),
      dc("🏠 Je suis chez une <b>amie</b>, sur <b>son</b> ordinateur.", 0, "Ce n'est pas votre appareil : on se déconnecte, par prudence.", "Chez une amie"),
      dc("🖥️ Je suis sur <b>mon</b> ordinateur, chez moi. Je vis seul(e).", 1, "Chez soi, sur son propre ordinateur : rester connecté(e) est pratique et sans danger.", "Mon ordinateur à la maison"),
      dc("🏨 Je suis sur l'ordinateur de l'<b>hôtel</b>, pendant les vacances.", 0, "Ordinateur public : on se déconnecte, et on ne coche jamais « Se souvenir de moi ».", "Ordinateur de l'hôtel")
    ] });

  /* =================== SÉANCE 2 =================== */
  const SF = ["🔓 Il est fragile", "🔒 Il est solide"];
  const t = AN.pw ? AN.pw.strength : null;
  const sf = (pw, solid, why) => ({ kind: "choice", prompt: `<div class="lp-model" style="font-size:1.5em">${pw}</div><br><b>Ce mot de passe est-il solide ou fragile ?</b>`, choices: SF, ok: solid ? 1 : 0,
    why: `${why} Un logiciel le trouverait <b>${t && t(pw).time === "instantanément" ? "instantanément" : t ? "en " + t(pw).time : "très vite"}</b>.`, short: pw, limit: 18 });
  G({ id: "acc_solide", title: "Solide ou fragile ?", icon: "💪",
    intro: "Un mot de passe s'affiche : <b>solide</b> ou <b>fragile</b> ? Pensez : est-il long ? Contient-il un mot courant, une date, un prénom ?",
    rounds: [
      sf("azerty123", false, "Les touches du clavier dans l'ordre, puis 123 : dans toutes les listes des pirates."),
      sf("Minou2014", false, "Un prénom (ou un animal) + une année : le schéma le plus deviné."),
      sf("La vieille horloge tousse le matin", true, "Une phrase de 6 mots, sans rapport avec ma vie : longue, et facile à retenir."),
      sf("P@ssw0rd!", false, "C'est « Password » (mot de passe en anglais), avec un @ à la place du a et un 0 à la place du o. Les logiciels connaissent l'astuce."),
      sf("Marseille13", false, "Une ville + son numéro de département : une combinaison classique, vite essayée."),
      sf("Quatre hiboux jardinent en pyjama", true, "Une image rigolote de 5 mots : très solide, et amusante à retenir.")
    ] });

  G({ id: "acc_qui", title: "Qui peut me demander mon mot de passe ?", icon: "🙅",
    intro: "On vous demande votre mot de passe (ou votre code reçu par SMS). Est-ce <b>normal</b> ? Ou bien est-ce que je <b>ne le donne pas</b> ?",
    rounds: [
      ...[["📞 Un « conseiller de la banque » qui vous appelle et demande votre code reçu par SMS.", 1, "Jamais. Une vraie banque ne demande jamais le code par téléphone : c'est un escroc."],
        ["🌐 <b>Vous</b> allez sur le vrai site de la médiathèque, pour vous connecter. Le site demande votre mot de passe.", 0, "Oui : c'est vous qui tapez votre mot de passe sur le vrai site, pour entrer. C'est le seul cas normal."],
        ["📧 Un e-mail dit « Vérifiez votre compte » et demande votre mot de passe.", 1, "Piège (hameçonnage). Aucun site sérieux ne demande le mot de passe par e-mail."],
        ["👨‍💻 Un « technicien Microsoft » vous appelle pour dépanner votre ordinateur. Il demande votre mot de passe.", 1, "Piège. Microsoft ne vous appelle pas, et n'a pas besoin de votre mot de passe. On raccroche."],
        ["👧 Votre petite-fille veut vous aider pour une démarche. Elle vous demande de lui <b>dire</b> votre mot de passe.", 1, "Même à une personne de confiance, on ne le dit pas : on le tape soi-même, à côté d'elle. Si on l'a dit, on le change après. Un mot de passe partagé n'est plus secret."],
        ["🏦 Un SMS « de votre banque » dit : « Répondez avec votre code secret pour débloquer votre compte. »", 1, "Piège. On ne répond jamais à un SMS avec un code ou un mot de passe."]
      ].map(([p, ok, why]) => ({ kind: "choice", prompt: `${p}<br><b>Est-ce normal qu'on vous le demande ?</b>`, choices: ["✅ Oui, c'est normal", "🚩 Non : je ne le donne pas"], ok, why, short: p.replace(/<[^>]+>/g, "").slice(0, 60), limit: 18 }))
    ] });

  G({ id: "acc_fabrique", title: "Fabrique ta phrase de passe", icon: "🧩",
    intro: "À vous de jouer ! Inventez une <b>phrase de passe</b> : plusieurs mots qui font une image rigolote (ex. : « Trois tomates dansent sous la pluie ! »). Plus elle est solide, plus vous gagnez. 🛡️ C'est un entraînement : n'écrivez pas une phrase que vous utilisez vraiment.",
    rounds: [
      { kind: "make", limit: 90, prompt: "<b>Écrivez une phrase de passe d'entraînement</b>, avec <b>au moins 4 mots</b>. Pas une phrase que vous utilisez vraiment !", example: "Le chat du voisin ronfle très fort", hint: "Imaginez une scène dans votre tête : elle sera facile à retenir.", why: "Une bonne phrase de passe : longue, plusieurs mots, et sans rapport avec votre vraie vie (pas votre ville, pas vos animaux, pas vos dates)." }
    ] });

  /* =================== SÉANCE 3 =================== */
  G({ id: "acc_code", title: "Je donne le code, ou pas ?", icon: "📱",
    intro: "Un <b>code arrive par SMS</b>. Selon la situation : est-ce que je le <b>tape moi-même sur le site</b>, ou est-ce que je <b>ne le donne pas</b> ?",
    rounds: [
      ...[["Je me connecte <b>moi-même</b> au site de ma banque. Un code arrive par SMS.", 0, "C'est moi qui me connecte : je tape le code sur le site de la banque."],
        ["Au téléphone, un « conseiller » me demande de lui lire le code.", 1, "Jamais. Je raccroche, et j'appelle le numéro au dos de ma carte si besoin."],
        ["Je paie <b>moi-même</b> un achat en ligne. Un code arrive par SMS pour confirmer le paiement.", 0, "Normal : c'est moi qui valide mon propre achat, sur le site."],
        ["Un code arrive, alors que je <b>ne fais rien du tout</b>.", 1, "Quelqu'un essaie peut-être d'entrer dans mon compte : je ne donne rien, et je change mon mot de passe."],
        ["Un SMS dit : « <b>Répondez</b> avec votre code pour annuler un paiement. »", 1, "Piège. On ne répond jamais à un SMS avec un code."]
      ].map(([p, ok, why]) => ({ kind: "choice", prompt: `<div class="lp-scene">${p}</div><b>Que dois-je faire du code ?</b>`, choices: ["⌨️ Je le tape moi-même sur le site", "🤐 Je ne le donne pas"], ok, why, short: p.replace(/<[^>]+>/g, "").slice(0, 55), limit: 18 }))
    ] });

  const VF = ["✅ Un vrai service", "🚩 Un escroc"];
  const vc = p => `<div class="lp-scene">${p}</div><b>Est-ce un vrai service, ou un escroc ?</b>`;
  G({ id: "acc_conseiller", title: "Vrai ou faux conseiller ?", icon: "🕵️",
    intro: "Un appel ou un message arrive : est-ce un <b>vrai</b> service, ou un <b>escroc</b> ? Repérez l'urgence, et ce qu'on vous demande.",
    rounds: [
      { kind: "choice", prompt: vc(`📞 Au téléphone : « Bonjour, service fraude de votre banque. Un paiement suspect de 849 € est en cours. <b>Lisez-moi le code reçu par SMS</b> pour l'annuler, vite ! »`), choices: VF, ok: 1, why: "L'urgence + demander le code = escroc. On raccroche et on rappelle le numéro au dos de la carte.", short: "Lisez-moi le code", limit: 20 },
      { kind: "choice", prompt: vc(`💬 SMS : « Votre colis est en attente. Payez 1,99 € de frais : lien-colis.top/payer »`), choices: VF, ok: 1, why: "Petit montant + lien bizarre (.top) = arnaque. On ne clique pas, on ne paie pas.", short: "Colis 1,99 €", limit: 20 },
      { kind: "choice", prompt: vc(`📞 Au téléphone : « Bonjour, c'est la médiathèque. Vos livres sont à rendre samedi. Voulez-vous les garder plus longtemps ? »`), choices: VF, ok: 0, why: "Pas d'urgence, et on ne vous demande rien de secret : c'est un vrai appel, banal.", short: "Livres à rendre", limit: 20 },
      { kind: "choice", prompt: vc(`💬 Message : « CPF : vos droits à la formation vont expirer ! Communiquez votre numéro de sécurité sociale et votre mot de passe. »`), choices: VF, ok: 1, why: "L'urgence + la demande du mot de passe et du numéro de sécurité sociale = arnaque bien connue au CPF.", short: "CPF expire", limit: 20 },
      { kind: "choice", prompt: vc(`📞 Au téléphone, un numéro inconnu : « C'est moi, ton petit-fils, j'ai changé de numéro ! J'ai un problème, peux-tu m'envoyer de l'argent, vite ? »`), choices: VF, ok: 1, why: "Nouveau numéro + urgence + argent : arnaque au faux proche. J'appelle mon petit-fils sur son numéro habituel pour vérifier.", short: "Faux petit-fils", limit: 20 }
    ] });

  const QF = (p, c, ok, why, short) => ({ kind: "choice", layout: "files", prompt: `${p}<br><b>Que faites-vous ?</b>`, choices: c, ok, why, short, limit: 25 });
  G({ id: "acc_que_faire", title: "Que faites-vous ?", icon: "🆘", noRank: true,
    intro: "Des situations autour des comptes et des mots de passe… et les bons gestes, <b>calmement</b>. Pas de classement : on en parle ensemble.",
    rounds: [
      QF("Vous recevez un e-mail : « Nouvelle connexion à votre compte depuis un appareil inconnu ». Mais ce n'était <b>pas vous</b>.", ["Je ne fais rien", "Je change mon mot de passe en allant moi-même sur le site", "Je clique sur le lien de l'e-mail"], 1, "On va soi-même sur le site (pas par le lien) et on change le mot de passe. On active le code par SMS si possible.", "Connexion inconnue"),
      QF("Vous vous rendez compte que vous avez tapé votre mot de passe sur un <b>faux site</b>.", ["Ce n'est pas grave", "Je le change tout de suite, sur le vrai site, et partout où je l'utilisais", "J'attends de voir"], 1, "On le change sur le vrai site, et sur tous les sites où on utilisait le même.", "Mot de passe sur faux site"),
      QF("Vos amis reçoivent des messages bizarres, envoyés en votre nom. Vous n'avez rien envoyé.", ["Mon compte est peut-être piraté : je change le mot de passe et je préviens mes contacts", "Je ne fais rien", "Je supprime mes amis"], 0, "Signe classique de piratage. On change le mot de passe, et on prévient ses contacts de ne pas cliquer.", "Messages bizarres"),
      QF("Vous avez trop de mots de passe à retenir.", ["J'utilise le même partout", "J'utilise le coffre-fort du navigateur ou du téléphone, ou un carnet rangé à la maison", "Je note tout sur un post-it collé à l'écran"], 1, "Le coffre-fort invente et retient tout. Un carnet rangé à la maison marche aussi. Jamais de post-it sur l'écran !", "Trop de mots de passe"),
      QF("Un site vous propose la « double authentification » (un code par SMS en plus du mot de passe).", ["Je refuse, c'est compliqué", "J'accepte : c'est une deuxième clé très efficace", "Ça ne sert à rien"], 1, "C'est l'une des meilleures protections : même s'il a votre mot de passe, un pirate n'a pas votre téléphone.", "Double authentification")
    ] });
})(window.AN);

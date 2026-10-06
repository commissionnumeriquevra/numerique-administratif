/* =========================================================
   Jeux en direct du chapitre « Comptes et mots de passe » (3 séances)
   ========================================================= */
(function (AN) {
  "use strict";
  const G = AN.games.register;

  /* =================== SÉANCE 1 =================== */
  const MS = ["🗣️ Je peux le donner", "🤐 Je le garde secret"];
  const ms = (what, ok, why) => ({ kind: "choice", prompt: `<div class="nv-who">${what}</div>`, choices: MS, ok, why, short: what.replace(/<[^>]+>/g, ""), limit: 15 });
  G({ id: "acc_montrer", title: "Je le donne ou je le garde ?", icon: "🤐",
    intro: "Une information s'affiche : je peux la <b>donner</b> (à un site, à une personne), ou je la <b>garde secrète</b> ?",
    rounds: [
      ms("📧 Mon adresse e-mail", 0, "L'adresse e-mail sert souvent d'<b>identifiant</b> : on peut la donner, comme une adresse postale."),
      ms("🔑 Mon mot de passe", 1, "Le mot de passe, c'est la <b>clé</b> : il ne se donne à personne. On le tape soi-même, sur le vrai site."),
      ms("📱 Le code reçu par SMS", 1, "Le code par SMS est une deuxième clé : <b>jamais</b> à personne, même à un « conseiller »."),
      ms("👤 Mon nom d'utilisateur", 0, "Le nom d'utilisateur (l'identifiant) dit « qui » : ce n'est pas un secret."),
      ms("💳 Le code de ma carte bancaire", 1, "Le code de la carte ne se donne jamais : ni par téléphone, ni par e-mail, ni sur un site."),
      ms("❓ La réponse à ma « question secrète » (le nom de mon premier animal…)", 1, "Elle sert à récupérer un compte : c'est presque un mot de passe ! On ne la publie pas, et on ne la donne pas.")
    ] });

  G({ id: "acc_inscription", title: "Remets l'inscription dans l'ordre", icon: "🧩",
    intro: "Les étapes pour créer un compte sont mélangées : remettez-les <b>dans l'ordre</b> !",
    rounds: [{ kind: "order", limit: 75, prompt: "Créer son compte lecteur à la médiathèque :", answer: ["Cliquer sur « Créer un compte »", "Remplir nom, prénom, e-mail", "Choisir un mot de passe et le confirmer", "Cocher « J'accepte les conditions »", "Cliquer sur « Créer mon compte »", "Cliquer sur le lien de l'e-mail de confirmation"],
      why: "Et si l'e-mail de confirmation n'arrive pas : on regarde dans les <b>Indésirables</b> !" }] });

  const DC = ["🚪 Je me déconnecte", "🏠 Pas besoin"];
  const dc = (where, ok, why, short) => ({ kind: "choice", prompt: where, choices: DC, ok, why, short, limit: 15 });
  G({ id: "acc_deconnecte", title: "Je me déconnecte ou pas ?", icon: "🚪",
    intro: "J'ai fini sur mon compte. Selon l'appareil : je me <b>déconnecte</b>, ou ce n'est <b>pas nécessaire</b> ?",
    rounds: [
      dc("💻 Sur un ordinateur de la <b>médiathèque</b>.", 0, "Ordinateur partagé : <b>toujours</b> se déconnecter. Sinon, la personne suivante entre dans votre compte.", "Ordinateur de la médiathèque"),
      dc("📱 Sur <b>mon</b> téléphone, protégé par un code.", 1, "Votre téléphone, protégé par votre code : on peut rester connecté, c'est fait pour ça.", "Mon téléphone avec un code"),
      dc("🏠 Chez une <b>amie</b>, sur son ordinateur.", 0, "Ce n'est pas votre appareil : on se déconnecte, par politesse et par prudence.", "Chez une amie"),
      dc("🖥️ Sur <b>mon</b> ordinateur, à la maison, où je suis seul(e).", 1, "Chez soi, sur son ordinateur : rester connecté est pratique et sans danger.", "Mon ordinateur à la maison"),
      dc("🏨 Sur l'ordinateur de l'<b>hôtel</b>, pendant les vacances.", 0, "Ordinateur public : on se déconnecte, et on ne coche jamais « Se souvenir de moi ».", "Ordinateur de l'hôtel")
    ] });

  /* =================== SÉANCE 2 =================== */
  const SF = ["🔓 Fragile", "🔒 Solide"];
  const t = AN.pw ? AN.pw.strength : null;
  const sf = (pw, solid, why) => ({ kind: "choice", prompt: `<div class="lp-model" style="font-size:1.5em">${pw}</div>`, choices: SF, ok: solid ? 1 : 0,
    why: `${why} Un logiciel le trouverait <b>${t && t(pw).time === "instantanément" ? "instantanément" : t ? "en " + t(pw).time : "très vite"}</b>.`, short: pw, limit: 18 });
  G({ id: "acc_solide", title: "Solide ou fragile ?", icon: "💪",
    intro: "Un mot de passe s'affiche : <b>solide</b> ou <b>fragile</b> ? Pensez : est-il long ? Contient-il un mot courant, une date, un prénom ?",
    rounds: [
      sf("azerty123", false, "Les touches du clavier dans l'ordre, puis 123 : dans toutes les listes des pirates."),
      sf("Minou2014", false, "Un prénom (ou un animal) + une année : le schéma le plus deviné."),
      sf("La vieille horloge tousse le matin", true, "Une phrase de 6 mots, sans rapport avec ma vie : longue et facile à retenir."),
      sf("P@ssw0rd!", false, "« Password » déguisé avec des @ et des 0 : les logiciels connaissent l'astuce."),
      sf("Marseille13", false, "Une ville + son numéro de département : une combinaison classique, vite essayée."),
      sf("Quatre hiboux jardinent en pyjama", true, "Une image farfelue de 5 mots : très solide, et amusante à retenir.")
    ] });

  G({ id: "acc_qui", title: "Qui peut me demander mon mot de passe ?", icon: "🙅",
    intro: "Quelqu'un vous demande votre mot de passe (ou votre code reçu par SMS). Est-ce <b>normal</b>, ou est-ce un <b>piège</b> ?",
    rounds: [
      ...[["📞 Un « conseiller de la banque » qui vous appelle et demande votre code reçu par SMS.", 1, "Jamais. Une vraie banque ne demande jamais le code par téléphone : c'est un escroc."],
        ["🌐 Le vrai site de la médiathèque, quand <b>vous</b> vous connectez.", 0, "Oui : c'est vous qui tapez votre mot de passe sur le vrai site, pour entrer. C'est le seul cas normal."],
        ["📧 Un e-mail « vérifiez votre compte » avec un lien, qui demande votre mot de passe.", 1, "Piège (hameçonnage). Aucun site sérieux ne demande le mot de passe par e-mail."],
        ["👨‍💻 Un « technicien Microsoft » qui veut dépanner votre ordinateur.", 1, "Piège. Microsoft ne vous appelle pas et n'a pas besoin de votre mot de passe."],
        ["👧 Votre petite-fille, pour vous aider à faire une démarche.", 1, "Même une personne de confiance : on le tape soi-même, ou on le change après. Un mot de passe partagé n'est plus secret."],
        ["🏦 Votre banque, par SMS, « répondez avec votre code secret pour débloquer ».", 1, "Piège. On ne répond jamais à un SMS avec un code ou un mot de passe."]
      ].map(([p, ok, why]) => ({ kind: "choice", prompt: p, choices: ["✅ Normal", "🚩 Piège"], ok, why, short: p.replace(/<[^>]+>/g, "").slice(0, 60), limit: 18 }))
    ] });

  G({ id: "acc_fabrique", title: "Fabrique ta phrase de passe", icon: "🧩",
    intro: "À vous de jouer ! Inventez une <b>phrase de passe</b> : plusieurs mots qui font une image rigolote (ex. : « Trois tomates dansent sous la pluie ! »). Plus elle est solide, plus vous gagnez. 🛡️ C'est un entraînement : gardez vos vraies phrases pour vous.",
    rounds: [
      { kind: "make", limit: 90, prompt: "Inventez une phrase de passe d'entraînement, avec <b>au moins 4 mots</b>.", example: "Le chat du voisin ronfle très fort", hint: "Imaginez une scène dans votre tête : elle sera facile à retenir.", why: "Une bonne phrase de passe : longue, plusieurs mots, et sans rapport avec votre vraie vie (pas votre ville, pas vos animaux, pas vos dates)." }
    ] });

  /* =================== SÉANCE 3 =================== */
  G({ id: "acc_code", title: "Je donne le code, ou pas ?", icon: "📱",
    intro: "Un <b>code reçu par SMS</b> est en jeu. Selon la situation : je le <b>tape sur le site</b>, ou je <b>ne le donne à personne</b> ?",
    rounds: [
      ...[["Je me connecte à ma banque. Un code arrive par SMS.", 0, "C'est moi qui me connecte : je tape le code sur le site de la banque."],
        ["Au téléphone, un « conseiller » me demande de lui lire le code.", 1, "Jamais. Je raccroche, et j'appelle le numéro au dos de ma carte si besoin."],
        ["Je paie en ligne, un code confirme le paiement : je le tape sur la page de paiement.", 0, "Normal : c'est moi qui valide mon propre achat, sur le site."],
        ["Un code arrive alors que je ne fais rien du tout.", 1, "Quelqu'un essaie d'entrer dans mon compte : je ne donne rien, et je change mon mot de passe."],
        ["Un SMS dit « répondez OUI avec votre code pour annuler un paiement ».", 1, "Piège. On ne répond jamais à un SMS avec un code."]
      ].map(([p, ok, why]) => ({ kind: "choice", prompt: `<div class="lp-scene">${p}</div>`, choices: ["⌨️ Je le tape sur le site", "🤐 Je ne le donne pas"], ok, why, short: p.slice(0, 55), limit: 18 }))
    ] });

  const VF = ["✅ Vrai", "🚩 Faux (escroc)"];
  G({ id: "acc_conseiller", title: "Vrai ou faux conseiller ?", icon: "🕵️",
    intro: "Au téléphone ou par message : est-ce un <b>vrai</b> service, ou un <b>escroc</b> ? Repérez l'urgence, et ce qu'on vous demande.",
    rounds: [
      { kind: "choice", prompt: `<div class="lp-scene">📞 « Bonjour, service fraude de votre banque. Un paiement suspect de 849 € est en cours. <b>Lisez-moi le code reçu par SMS</b> pour l'annuler, vite ! »</div>`, choices: VF, ok: 1, why: "L'urgence + demander le code = escroc. On raccroche et on rappelle le numéro au dos de la carte.", short: "Lisez-moi le code", limit: 20 },
      { kind: "choice", prompt: `<div class="lp-scene">💬 SMS : « Votre colis est en attente. Payez 1,99 € de frais : lien-colis.top/payer »</div>`, choices: VF, ok: 1, why: "Petit montant + lien bizarre (.top) = arnaque. On ne clique pas, on ne paie pas.", short: "Colis 1,99 €", limit: 20 },
      { kind: "choice", prompt: `<div class="lp-scene">📞 « Bonjour, c'est la médiathèque. Vos livres sont à rendre samedi. Souhaitez-vous les prolonger ? »</div>`, choices: VF, ok: 0, why: "Aucune urgence, rien de secret demandé : un vrai appel, banal.", short: "Livres à rendre", limit: 20 },
      { kind: "choice", prompt: `<div class="lp-scene">💬 « CPF : vos droits à la formation vont expirer ! Communiquez votre numéro de sécurité sociale et votre mot de passe. »</div>`, choices: VF, ok: 1, why: "L'urgence + demander mot de passe et numéro = arnaque bien connue (le CPF n'expire pas comme ça).", short: "CPF expire", limit: 20 },
      { kind: "choice", prompt: `<div class="lp-scene">📞 « Je suis votre petit-fils, j'ai changé de numéro ! J'ai un problème, peux-tu m'envoyer de l'argent vite ? »</div>`, choices: VF, ok: 1, why: "Nouveau numéro + urgence + argent : arnaque au faux proche. J'appelle mon petit-fils sur son ancien numéro pour vérifier.", short: "Faux petit-fils", limit: 20 }
    ] });

  const QF = (p, c, ok, why, short) => ({ kind: "choice", layout: "files", prompt: p, choices: c, ok, why, short, limit: 25 });
  G({ id: "acc_que_faire", title: "Que faites-vous ?", icon: "🆘", noRank: true,
    intro: "Des situations autour des comptes et des mots de passe… et les bons gestes, <b>calmement</b>. Pas de classement : on en parle ensemble.",
    rounds: [
      QF("Vous recevez « Nouvelle connexion à votre compte depuis un appareil inconnu », et ce n'est pas vous.", ["Je ne fais rien", "Je change mon mot de passe en allant moi-même sur le site", "Je clique sur le lien de l'e-mail"], 1, "On va soi-même sur le site (pas par le lien) et on change le mot de passe. On active le code par SMS si possible.", "Connexion inconnue"),
      QF("Vous avez tapé votre mot de passe sur un faux site.", ["Ce n'est pas grave", "Je le change tout de suite, sur le vrai site, et partout où je l'utilisais", "J'attends de voir"], 1, "On le change sur le vrai site, et sur tous les sites où on utilisait le même.", "Mot de passe sur faux site"),
      QF("Vos amis reçoivent des messages bizarres soi-disant de vous.", ["Mon compte est peut-être piraté : je change le mot de passe et je préviens mes contacts", "Je ne fais rien", "Je supprime mes amis"], 0, "Signe classique de piratage. On change le mot de passe, et on prévient ses contacts de ne pas cliquer.", "Messages bizarres"),
      QF("Vous n'arrivez plus à choisir un mot de passe assez solide et à le retenir.", ["J'utilise le même partout", "J'utilise le coffre-fort du navigateur ou du téléphone, et un carnet à la maison", "Je note tout sur un post-it à l'écran"], 1, "Le coffre-fort invente et retient tout. Un carnet rangé à la maison marche aussi. Jamais de post-it sur l'écran !", "Trop de mots de passe"),
      QF("Un site vous propose la « double authentification » (un code par SMS en plus du mot de passe).", ["Je refuse, c'est compliqué", "J'accepte : c'est une deuxième clé très efficace", "Ça ne sert à rien"], 1, "C'est l'une des meilleures protections : même avec votre mot de passe, un pirate n'a pas votre téléphone.", "Double authentification")
    ] });
})(window.AN);

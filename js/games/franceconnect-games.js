/* =========================================================
   Jeux en direct du chapitre « FranceConnect » (3 séances)
   ========================================================= */
(function (AN) {
  "use strict";
  const G = AN.games.register;
  const VF = ["✅ Vrai", "❌ Faux"];
  const scene = p => `<div class="lp-scene">${p}</div>`;
  const short = p => p.replace(/<[^>]+>/g, "").slice(0, 50);

  /* =================== SÉANCE 1 =================== */
  G({ id: "fc_vf", title: "FranceConnect : vrai ou faux ?", icon: "🔑",
    intro: "Vrai ou faux ? Des idées reçues sur FranceConnect…",
    rounds: [
      ["Avec FranceConnect, j'utilise un compte que j'ai <b>déjà</b> (impots, ameli…).", 0, "Vrai : c'est tout l'intérêt, pas de nouveau compte."],
      ["Il faut créer un « compte FranceConnect » avec un nouveau mot de passe.", 1, "Faux : il n'y a pas de compte FranceConnect. C'est une passerelle vers vos comptes existants."],
      ["FranceConnect est un service de l'État, gratuit.", 0, "Vrai : jamais rien à payer."],
      ["FranceConnect connaît tous mes mots de passe.", 1, "Faux : chaque mot de passe se tape sur le site du compte choisi. FranceConnect ne le voit pas."],
      ["Un agent FranceConnect peut m'appeler pour finaliser mon inscription.", 1, "Faux : c'est une arnaque connue. On raccroche."]
    ].map(([p, ok, why]) => ({ kind: "choice", prompt: scene(p), choices: VF, ok, why, short: short(p), limit: 15 })) });

  G({ id: "fc_adresse", title: "La vraie adresse", icon: "🌐",
    intro: "Après un clic sur le bouton FranceConnect, une page s'ouvre. Quelle adresse est celle du <b>vrai</b> FranceConnect ?",
    rounds: [
      { kind: "choice", layout: "files", prompt: scene("Quelle est la vraie adresse ?"), choices: ["franceconnect-verification.com", "app.franceconnect.gouv.fr", "france-connect.info", "franceconnect.gouv.fr.connexion-securisee.com"], ok: 1, why: "Le vrai nom, juste avant le premier « / » : franceconnect.gouv.fr. Le dernier piège se termine en réalité par « connexion-securisee.com » !", short: "La vraie adresse", limit: 20 },
      { kind: "choice", layout: "files", prompt: scene("Et pour le compte des impôts ?"), choices: ["impots-gouv.fr-service.net", "cfspart.impots.gouv.fr", "impots.gouv.info", "mon-impots-remboursement.com"], ok: 1, why: "« impots.gouv.fr » est bien le vrai nom (la partie « cfspart. » devant est normale).", short: "Les impôts", limit: 20 }
    ] });

  G({ id: "fc_quel_compte", title: "Quel compte pour qui ?", icon: "👤",
    intro: "Chaque personne choisit un compte qu'elle a <b>déjà</b>. Lequel ?",
    rounds: [
      ["Paulette déclare ses impôts en ligne chaque année.", ["💶 impots.gouv.fr", "🌾 MSA", "🪪 France Identité"], 0, "Elle a un compte des impôts : elle l'utilise."],
      ["René n'a jamais déclaré en ligne, mais il suit ses remboursements de santé sur Internet.", ["💶 impots.gouv.fr", "💙 ameli", "📮 La Poste"], 1, "Son compte ameli suffit."],
      ["Lucien était agriculteur ; il a un compte pour sa retraite agricole.", ["💙 ameli", "🌾 MSA", "💶 impots.gouv.fr"], 1, "La MSA est la sécurité sociale agricole."],
      ["Fatima doit utiliser FranceConnect+ pour sa formation.", ["💶 impots.gouv.fr", "💙 ameli", "📮 L'Identité Numérique La Poste"], 2, "FranceConnect+ demande une identité renforcée : La Poste ou France Identité."]
    ].map(([p, c, ok, why]) => ({ kind: "choice", layout: "files", prompt: scene(p), choices: c, ok, why, short: short(p), limit: 18 })) });

  /* =================== SÉANCE 2 =================== */
  G({ id: "fc_ordre", title: "Remets les étapes dans l'ordre", icon: "🧩",
    intro: "Les étapes d'une connexion avec FranceConnect sont mélangées : remettez-les <b>dans l'ordre</b> !",
    rounds: [{ kind: "order", limit: 70, prompt: "Se connecter à la mairie avec FranceConnect :", answer: ["Cliquer sur « S'identifier avec FranceConnect »", "Choisir son compte (ex. impots.gouv.fr)", "Taper ses identifiants sur le site de ce compte", "Vérifier les informations, puis « Continuer »", "Revenir, identifié(e), sur le site de la mairie"],
      why: "Et juste après : un e-mail de FranceConnect confirme la connexion. C'est normal." }] });

  const P2 = ["🚪 Oui, je me déconnecte de FranceConnect", "🏠 Pas besoin"];
  G({ id: "fc_portes", title: "Je me déconnecte de FranceConnect ?", icon: "🚪",
    intro: "J'ai fini ma démarche, et FranceConnect demande : « Voulez-vous aussi vous déconnecter ? » Selon l'endroit…",
    rounds: [
      ["💻 Sur un ordinateur de la <b>médiathèque</b>", 0, "Ordinateur partagé : on ferme les deux portes. Sinon, la personne suivante entre sans mot de passe."],
      ["🏠 Sur <b>mon</b> ordinateur, chez moi", 1, "Chez soi, rester connecté n'est pas grave."],
      ["🏨 Sur l'ordinateur de l'<b>hôtel</b>", 0, "Ordinateur public : on se déconnecte partout."],
      ["👩‍👦 Sur l'ordinateur de mon <b>fils</b>, chez lui", 0, "Ce n'est pas mon appareil : on se déconnecte, par prudence."]
    ].map(([p, ok, why]) => ({ kind: "choice", prompt: scene(p), choices: P2, ok, why, short: short(p), limit: 15 })) });

  const OU = ["Sur la page du compte choisi (impots, ameli…)", "Sur franceconnect.gouv.fr", "En appelant un « agent FranceConnect »"];
  G({ id: "fc_ou", title: "Où est la solution ?", icon: "🛠️",
    intro: "Ça bloque ! Où trouver la solution ?",
    rounds: [
      ["J'ai oublié le mot de passe de mon compte impots.gouv.fr.", OU, 0, "« Mot de passe oublié ? » sur la page de connexion d'impots.gouv.fr. FranceConnect ne connaît pas les mots de passe."],
      ["Je veux choisir un autre compte que celui d'habitude.", OU, 1, "La page FranceConnect affiche la liste des comptes : je clique sur un autre."],
      ["Mon nom est mal écrit dans mon compte ameli.", ["Je fais corriger mon compte ameli (et j'utilise un autre compte en attendant)", "J'invente un autre nom", "J'appelle le numéro d'un SMS"], 0, "Le compte doit avoir l'état civil exact. On fait corriger auprès de l'organisme."]
    ].map(([p, c, ok, why]) => ({ kind: "choice", layout: "files", prompt: scene(p), choices: c, ok, why, short: short(p), limit: 20 })) });

  /* =================== SÉANCE 3 =================== */
  const V = ["✅ Je valide", "🚫 Je refuse"];
  G({ id: "fc_valider", title: "Je valide ou je refuse ?", icon: "📱",
    intro: "Une demande de validation arrive sur le téléphone (L'Identité Numérique La Poste). Selon la situation : je <b>valide</b>, ou je <b>refuse</b> ?",
    rounds: [
      ["Je viens de cliquer sur FranceConnect+ sur le site de ma formation. La demande vient de « Mon espace formation ».", 0, "C'est moi, le nom du service correspond : je valide avec mon code."],
      ["Je regarde la télévision. Une demande arrive : « Service des impôts souhaite vérifier votre identité ».", 1, "Je n'ai rien demandé : je refuse. Quelqu'un essaie peut-être d'utiliser mon identité."],
      ["Au téléphone, un « conseiller » me dit : « Validez la demande qui arrive, c'est pour sécuriser votre compte ».", 1, "Piège : on ne valide jamais à la demande de quelqu'un au téléphone. On raccroche."],
      ["Je me connecte à ma mairie, mais la demande indique « Mon compte formation ».", 1, "Le nom ne correspond pas à ce que je fais : je refuse, et je recommence calmement."]
    ].map(([p, ok, why]) => ({ kind: "choice", prompt: scene(p), choices: V, ok, why, short: short(p), limit: 20 })) });

  G({ id: "fc_buzz", title: "Arnaque ou pas ? Buzzez !", icon: "🚩",
    intro: "Des messages apparaissent ligne par ligne. Dès que vous êtes sûr(e) que c'est une <b>arnaque</b> : buzzez !",
    rounds: [
      { kind: "buzz", fake: true, interval: 3, head: `<div class="lp-buzz-head">📧 <b>France Connect</b> &lt;securite@franceconnect-verification.com&gt;</div>`, lines: ["Bonjour,", "suite à une mise à jour de sécurité,", "votre compte FranceConnect sera suspendu sous 24 h.", "Confirmez vos informations :", "franceconnect-verification.com"],
        why: "L'adresse n'est pas franceconnect.gouv.fr, il y a une urgence, et il n'existe pas de compte FranceConnect à suspendre." },
      { kind: "buzz", fake: false, interval: 3, head: `<div class="lp-buzz-head">📧 <b>FranceConnect</b></div>`, lines: ["Bonjour Marie,", "vous vous êtes connectée à Mairie de Valbourg via FranceConnect,", "avec votre compte impots.gouv.fr,", "aujourd'hui à 10 h 32."],
        why: "Normal, si c'est bien vous qui venez de vous connecter. Il informe, il ne demande rien." },
      { kind: "buzz", fake: true, interval: 3, head: `<div class="lp-buzz-head">📞 <b>Appel</b> · numéro masqué</div>`, lines: ["« Bonjour, ici le service FranceConnect.", "Nous finalisons votre inscription.", "Je vous donne les trois premiers chiffres de votre numéro de sécurité sociale :", "pouvez-vous me donner la suite ? »"],
        why: "Arnaque : FranceConnect ne vous appelle jamais. On raccroche, sans rien donner." }
    ] });

  const QF = (p, c, ok, why, s) => ({ kind: "choice", layout: "files", prompt: p, choices: c, ok, why, short: s, limit: 25 });
  G({ id: "fc_que_faire", title: "Que faites-vous ?", icon: "🆘", noRank: true,
    intro: "Des situations avec FranceConnect… et les bons gestes, <b>calmement</b>. Pas de classement : on en parle ensemble.",
    rounds: [
      QF("Je reçois « Vous vous êtes connecté(e) aux impôts via FranceConnect »… mais je n'ai rien fait.", ["Je ne fais rien", "Je change le mot de passe du compte utilisé, et je le signale", "Je réponds à l'e-mail avec mes codes"], 1, "Quelqu'un a peut-être mes identifiants : je change le mot de passe (impots, ameli…), et je signale.", "Connexion inconnue"),
      QF("Je n'ai aucun compte impots ou ameli, et je veux utiliser FranceConnect.", ["Impossible pour moi", "Je crée d'abord un compte (ameli, impots…), éventuellement avec l'aide du médiateur numérique", "J'utilise le compte de ma voisine"], 1, "On crée d'abord un compte à son nom. Le médiateur numérique peut aider !", "Aucun compte"),
      QF("Un site me demande FranceConnect+, et mon compte impots est refusé.", ["J'abandonne", "J'utilise L'Identité Numérique La Poste ou France Identité (ou la vérification manuelle proposée par le site)", "Je crée un faux compte"], 1, "FranceConnect+ demande une identité renforcée. Sinon, certains sites proposent une vérification manuelle, plus lente.", "FranceConnect+ exigé"),
      QF("J'ai cliqué sur un lien d'e-mail et tapé mes identifiants sur un faux FranceConnect.", ["Ce n'est pas grave", "Je change tout de suite mon mot de passe, j'appelle ma banque si j'ai donné ma carte, et je regarde cybermalveillance.gouv.fr", "J'attends de voir"], 1, "On agit vite, sans honte. Et la prochaine fois : jamais par un lien, toujours par le bouton du vrai site.", "Identifiants sur un faux site")
    ] });
})(window.AN);

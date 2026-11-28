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
    intro: "Une phrase sur FranceConnect s'affiche : est-elle <b>vraie</b> ou <b>fausse</b> ?",
    rounds: [
      ["Avec FranceConnect, j'utilise un compte que j'ai <b>déjà</b> (impots.gouv.fr, ameli…).", 0, "Vrai : c'est tout l'intérêt. Pas besoin de créer un nouveau compte."],
      ["Il faut créer un « compte FranceConnect », avec un <b>nouveau</b> mot de passe.", 1, "Faux : il n'y a pas de compte FranceConnect. C'est un passage vers les comptes que vous avez déjà."],
      ["FranceConnect est un service de l'État, <b>gratuit</b>.", 0, "Vrai : il n'y a jamais rien à payer."],
      ["FranceConnect <b>connaît</b> tous mes mots de passe.", 1, "Faux : je tape mon mot de passe sur le site du compte choisi (impots, ameli…). FranceConnect ne le voit pas."],
      ["Un agent FranceConnect peut m'<b>appeler</b> pour finir mon inscription.", 1, "Faux : il n'y a pas d'inscription à FranceConnect. Cet appel est une arnaque connue : on raccroche."]
    ].map(([p, ok, why]) => ({ kind: "choice", prompt: `${scene(p)}<b>Cette phrase est-elle vraie ou fausse ?</b>`, choices: VF, ok, why, short: short(p), limit: 15 })) });

  G({ id: "fc_adresse", title: "La vraie adresse", icon: "🌐",
    intro: "Après un clic sur le bouton FranceConnect, une page s'ouvre. Quelle adresse est celle du <b>vrai</b> FranceConnect ?",
    rounds: [
      { kind: "choice", layout: "files", prompt: scene("J'ai cliqué sur le bouton FranceConnect. <b>Quelle est la vraie adresse de FranceConnect ?</b>"), choices: ["franceconnect-verification.com", "app.franceconnect.gouv.fr", "france-connect.info", "franceconnect.gouv.fr.connexion-securisee.com"], ok: 1, why: "On regarde la <b>fin</b> du nom : la vraie se termine par <b>franceconnect.gouv.fr</b>. Attention à la dernière : elle commence pareil, mais se termine par « connexion-securisee.com » !", short: "La vraie adresse", limit: 20 },
      { kind: "choice", layout: "files", prompt: scene("<b>Quelle est la vraie adresse du site des impôts ?</b>"), choices: ["impots-gouv.fr-service.net", "cfspart.impots.gouv.fr", "impots.gouv.info", "mon-impots-remboursement.com"], ok: 1, why: "La vraie adresse se termine par <b>impots.gouv.fr</b>. Le petit mot « cfspart. » au début est normal.", short: "Les impôts", limit: 20 }
    ] });

  G({ id: "fc_quel_compte", title: "Quel compte pour qui ?", icon: "👤",
    intro: "Chaque personne se connecte avec FranceConnect. Elle choisit un compte qu'elle a <b>déjà</b>. Lequel ?",
    rounds: [
      ["Paulette déclare ses <b>impôts</b> en ligne chaque année. C'est son seul compte. Quel compte choisit-elle ?", ["💶 impots.gouv.fr", "🌾 MSA", "🪪 France Identité"], 0, "Elle a un compte des impôts : elle l'utilise."],
      ["René n'a pas de compte des impôts. Il suit ses <b>remboursements de santé</b> sur Internet. C'est son seul compte. Quel compte choisit-il ?", ["💶 impots.gouv.fr", "💙 ameli", "📮 La Poste"], 1, "Les remboursements de santé, c'est ameli : son compte ameli suffit."],
      ["Lucien était <b>agriculteur</b>. Son seul compte est celui de sa retraite agricole. Quel compte choisit-il ?", ["💙 ameli", "🌾 MSA", "💶 impots.gouv.fr"], 1, "La MSA est la sécurité sociale des agriculteurs : c'est elle qui gère sa retraite agricole."],
      ["Fatima a 3 comptes : impots.gouv.fr, ameli et L'Identité Numérique La Poste. Le site de sa formation demande <b>FranceConnect+</b>. Quel compte choisit-elle ?", ["💶 impots.gouv.fr", "💙 ameli", "📮 L'Identité Numérique La Poste"], 2, "FranceConnect+ (avec un « + ») demande une identité renforcée : La Poste ou France Identité. Les impôts et ameli ne suffisent pas."]
    ].map(([p, c, ok, why]) => ({ kind: "choice", layout: "files", prompt: scene(p), choices: c, ok, why, short: short(p), limit: 18 })) });

  /* =================== SÉANCE 2 =================== */
  G({ id: "fc_ordre", title: "Remets les étapes dans l'ordre", icon: "🧩",
    intro: "Les étapes d'une connexion avec FranceConnect sont mélangées : remettez-les <b>dans l'ordre</b> !",
    rounds: [{ kind: "order", limit: 70, prompt: "Je me connecte au site de la mairie avec FranceConnect. <b>Remettez les étapes dans l'ordre.</b>", answer: ["Cliquer sur « S'identifier avec FranceConnect »", "Choisir son compte (ex. impots.gouv.fr)", "Taper ses identifiants sur le site de ce compte", "Vérifier les informations, puis « Continuer »", "Revenir, identifié(e), sur le site de la mairie"],
      why: "Et juste après : un e-mail de FranceConnect confirme la connexion. C'est normal." }] });

  const P2 = ["🚪 Oui, je me déconnecte aussi de FranceConnect", "🏠 Non, pas besoin"];
  G({ id: "fc_portes", title: "Je me déconnecte de FranceConnect ?", icon: "🚪",
    intro: "J'ai fini ma démarche sur un site. Est-ce que je me déconnecte <b>aussi</b> de FranceConnect ? Ça dépend de l'ordinateur utilisé.",
    rounds: [
      ["💻 Je suis sur un ordinateur de la <b>médiathèque</b>.", 0, "Ordinateur partagé : je me déconnecte du site <b>et</b> de FranceConnect. Sinon, la personne suivante entre sans mot de passe."],
      ["🏠 Je suis sur <b>mon</b> ordinateur, chez moi.", 1, "Chez soi, sur son propre ordinateur : rester connecté(e) n'est pas grave."],
      ["🏨 Je suis sur l'ordinateur de l'<b>hôtel</b>.", 0, "Ordinateur public : on se déconnecte partout, du site et de FranceConnect."],
      ["👩‍👦 Je suis chez mon fils, sur <b>son</b> ordinateur.", 0, "Ce n'est pas mon appareil : on se déconnecte, par prudence."]
    ].map(([p, ok, why]) => ({ kind: "choice", prompt: `${scene(p)}<b>J'ai fini ma démarche. Je me déconnecte aussi de FranceConnect ?</b>`, choices: P2, ok, why, short: short(p), limit: 15 })) });

  const OU = ["Sur le site du compte choisi (impots, ameli…)", "Sur la page FranceConnect, qui s'ouvre après le bouton", "En appelant un « agent FranceConnect »"];
  G({ id: "fc_ou", title: "Où est la solution ?", icon: "🛠️",
    intro: "Ça bloque ! Où trouver la solution : sur le site du compte, sur la page FranceConnect, ou au téléphone ?",
    rounds: [
      ["J'ai oublié le <b>mot de passe</b> de mon compte impots.gouv.fr.", OU, 0, "« Mot de passe oublié ? » sur la page de connexion d'impots.gouv.fr. FranceConnect ne connaît pas les mots de passe."],
      ["Avec FranceConnect, je veux utiliser un <b>autre compte</b> que d'habitude.", OU, 1, "La page FranceConnect affiche la liste des comptes : je clique sur un autre."],
      ["Mon nom est <b>mal écrit</b> dans mon compte ameli.", ["Auprès d'ameli, qui corrige mon compte", "Sur la page FranceConnect, où je change mon nom", "En appelant un « agent FranceConnect »"], 0, "FranceConnect reprend le nom écrit dans le compte. C'est donc ameli qui corrige. En attendant, je peux utiliser un autre compte."]
    ].map(([p, c, ok, why]) => ({ kind: "choice", layout: "files", prompt: `${scene(p)}<b>Où est la solution ?</b>`, choices: c, ok, why, short: short(p), limit: 20 })) });

  /* =================== SÉANCE 3 =================== */
  const V = ["✅ Je valide", "🚫 Je refuse"];
  G({ id: "fc_valider", title: "Je valide ou je refuse ?", icon: "📱",
    intro: "Une demande de validation arrive sur le téléphone (L'Identité Numérique La Poste). Je regarde ce que je fais, et le <b>nom du service</b> affiché. Je <b>valide</b>, ou je <b>refuse</b> ?",
    rounds: [
      ["Je me connecte au site de ma <b>formation</b>. Le téléphone affiche : « <b>Mon espace formation</b> ».", 0, "Je suis sur le site de ma formation, la demande parle de formation : ça correspond. Je valide avec mon code."],
      ["Je regarde la télévision. Je ne fais <b>aucune démarche</b>. Le téléphone affiche : « Service des impôts souhaite vérifier votre identité ».", 1, "Je n'ai rien demandé : je refuse. Quelqu'un essaie peut-être d'utiliser mon identité."],
      ["Au téléphone, un « conseiller » me dit : « <b>Validez</b> la demande qui arrive, c'est pour sécuriser votre compte ».", 1, "Piège : on ne valide jamais à la demande de quelqu'un au téléphone. On raccroche."],
      ["Je me connecte au site de ma <b>mairie</b>. Le téléphone affiche : « <b>Mon compte formation</b> ».", 1, "Mairie ≠ formation : le nom ne correspond pas à ce que je fais. Je refuse, et je recommence calmement."]
    ].map(([p, ok, why]) => ({ kind: "choice", prompt: `${scene(p)}<b>Je valide, ou je refuse ?</b>`, choices: V, ok, why, short: short(p), limit: 20 })) });

  G({ id: "fc_buzz", title: "Arnaque ou pas ? Buzzez !", icon: "🚩",
    intro: "Des messages apparaissent ligne par ligne. Dès que vous êtes sûr(e) que c'est une <b>arnaque</b> : buzzez !",
    rounds: [
      { kind: "buzz", fake: true, interval: 3, head: `<div class="lp-buzz-head">📧 <b>France Connect</b> &lt;securite@franceconnect-verification.com&gt;</div>`, lines: ["Bonjour,", "suite à une mise à jour de sécurité,", "votre compte FranceConnect sera suspendu sous 24 h.", "Confirmez vos informations :", "franceconnect-verification.com"],
        why: "L'adresse n'est pas franceconnect.gouv.fr, il y a une urgence, et il n'existe pas de compte FranceConnect à suspendre." },
      { kind: "buzz", fake: false, interval: 3, head: `<div class="lp-buzz-head">📧 <b>FranceConnect</b></div>`, lines: ["Bonjour Marie,", "vous vous êtes connectée à Mairie de Valbourg via FranceConnect,", "avec votre compte impots.gouv.fr,", "aujourd'hui à 10 h 32."],
        why: "Normal, si c'est bien vous qui venez de vous connecter. Cet e-mail informe, il ne demande rien." },
      { kind: "buzz", fake: true, interval: 3, head: `<div class="lp-buzz-head">📞 <b>Appel</b> · numéro masqué</div>`, lines: ["« Bonjour, ici le service FranceConnect.", "Nous finalisons votre inscription.", "Je vous donne les trois premiers chiffres de votre numéro de sécurité sociale :", "pouvez-vous me donner la suite ? »"],
        why: "Arnaque : FranceConnect ne vous appelle jamais. On raccroche, sans rien donner." }
    ] });

  const QF = (p, c, ok, why, s) => ({ kind: "choice", layout: "files", prompt: `${p}<br><b>Que dois-je faire ?</b>`, choices: c, ok, why, short: s, limit: 25 });
  G({ id: "fc_que_faire", title: "Que faites-vous ?", icon: "🆘", noRank: true,
    intro: "Des situations avec FranceConnect… et les bons gestes, <b>calmement</b>. Pas de classement : on en parle ensemble.",
    rounds: [
      QF("Je reçois un e-mail : « Vous vous êtes connecté(e) aux impôts via FranceConnect ». Mais je n'ai <b>rien fait</b>.", ["Je ne fais rien", "Je change le mot de passe du compte utilisé, et je le signale", "Je réponds à l'e-mail avec mes codes"], 1, "Quelqu'un a peut-être mes identifiants : je change le mot de passe (impots, ameli…), et je le signale.", "Connexion inconnue"),
      QF("Je veux utiliser FranceConnect, mais je n'ai <b>aucun compte</b> (ni impots, ni ameli…).", ["Impossible pour moi", "Je crée d'abord un compte (ameli, impots…), éventuellement avec l'aide du médiateur numérique", "J'utilise le compte de ma voisine"], 1, "On crée d'abord un compte à son nom. Le médiateur numérique peut aider !", "Aucun compte"),
      QF("Un site me demande <b>FranceConnect+</b>. Mon compte impots est refusé.", ["J'abandonne", "J'utilise L'Identité Numérique La Poste ou France Identité (ou la vérification manuelle proposée par le site)", "Je crée un faux compte"], 1, "FranceConnect+ demande une identité renforcée (La Poste ou France Identité). Sinon, certains sites proposent une vérification manuelle, plus lente.", "FranceConnect+ exigé"),
      QF("J'ai cliqué sur un lien dans un e-mail. J'ai tapé mes identifiants sur un <b>faux</b> FranceConnect.", ["Ce n'est pas grave", "Je change tout de suite mon mot de passe, j'appelle ma banque si j'ai donné ma carte, et je regarde cybermalveillance.gouv.fr", "J'attends de voir"], 1, "On agit vite, sans honte. La prochaine fois : jamais par un lien d'e-mail, toujours par le bouton FranceConnect du vrai site.", "Identifiants sur un faux site")
    ] });
})(window.AN);

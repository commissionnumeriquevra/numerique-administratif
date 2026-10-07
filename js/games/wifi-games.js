/* =========================================================
   Jeux en direct du chapitre « Wi-Fi et réseaux » (3 séances)
   ========================================================= */
(function (AN) {
  "use strict";
  const G = AN.games.register;
  const S = (b, o) => AN.net ? AN.net.signal(b, { size: "2.4em", ...o }) : "📶";
  const big = h => `<div class="lp-scene" style="font-size:1.6em;text-align:center">${h}</div>`;

  /* =================== SÉANCE 1 =================== */
  const W4 = ["📶 Le Wi-Fi", "🗼 La 4G / 5G (le forfait)"];
  G({ id: "wifi_ou4g", title: "Wi-Fi ou 4G ?", icon: "📶",
    intro: "Le téléphone de Marie va sur Internet. Selon l'endroit : il passe par le <b>Wi-Fi</b>, ou par la <b>4G</b> (son forfait) ?",
    rounds: [
      ["🏠 À la maison, à côté de sa box", 0, "Chez soi, le téléphone se connecte tout seul au Wi-Fi de la box : le forfait n'est pas utilisé."],
      ["🚌 Dans le bus", 1, "Pas de box dans le bus : le téléphone passe par l'antenne 4G/5G, avec le forfait."],
      ["📚 À la médiathèque, connectée au Wi-Fi gratuit", 0, "Elle s'est connectée au Wi-Fi public : le forfait n'est pas utilisé."],
      ["🥾 En randonnée dans les collines", 1, "Dehors, c'est la 4G (si le réseau passe !)."],
      ["🏠 À la maison… mais le Wi-Fi du téléphone est coupé", 1, "Wi-Fi coupé = le téléphone utilise le forfait, même à la maison !"]
    ].map(([p, ok, why]) => ({ kind: "choice", prompt: `<div class="lp-scene">${p}</div>`, choices: W4, ok, why, short: p.slice(3, 45), limit: 15 })) });

  const MEAN = ["✅ Internet marche", "📦 Problème de box", "🔌 Connecté à rien", "✈ Mode avion"];
  G({ id: "wifi_icones", title: "Que veut dire cette icône ?", icon: "👀",
    intro: "Une icône de la barre des tâches s'affiche. Que veut-elle dire ?",
    rounds: [
      [S(4), 0, "L'éventail plein : connecté au Wi-Fi, Internet fonctionne.", "Wi-Fi plein"],
      [S(4, { warn: true }), 1, "Le point d'exclamation : relié à la box, mais la box n'a pas Internet. On regarde ses voyants.", "Point d'exclamation"],
      [AN.net ? AN.net.globe(true).replace('width="1.2em" height="1.2em"', 'width="2.4em" height="2.4em"') : "🌐", 2, "Le globe barré : l'ordinateur n'est connecté à aucun réseau. On ouvre le menu Wi-Fi.", "Globe barré"],
      ["<span style='font-size:2.2em'>✈</span>", 3, "L'avion : mode avion activé, tout est coupé. Un clic pour le désactiver.", "Avion"]
    ].map(([h, ok, why, short]) => ({ kind: "choice", layout: "files", prompt: big(h), choices: MEAN, ok, why, short, limit: 15 })) });

  G({ id: "wifi_cle", title: "Tape la clé du Wi-Fi", icon: "🔑",
    intro: "Voici la clé de sécurité écrite sur l'étiquette de la box. Tapez-la <b>exactement</b> : majuscules, minuscules et chiffres comptent !",
    rounds: [
      { kind: "type", target: "Kp7mVx2e", prompt: "Recopiez cette clé de Wi-Fi :", hint: "K majuscule, V majuscule… et pas d'espace.", why: "Une clé Wi-Fi est un mot de passe : une seule majuscule oubliée, et la connexion est refusée.", limit: 45 },
      { kind: "type", target: "4F7K-29XB-ME3T", prompt: "Et celle-ci, avec des tirets :", hint: "Les tirets font partie de la clé.", why: "Les tirets comptent aussi. On recopie tout, et on vérifie avec l'œil 👁.", limit: 50 }
    ] });

  /* =================== SÉANCE 2 =================== */
  const OK = ["👍 Oui, sans souci", "✋ Plutôt pas"];
  G({ id: "wifi_public_ok", title: "Sur un Wi-Fi public, je peux… ?", icon: "☕",
    intro: "Je suis connecté(e) au Wi-Fi gratuit de la gare. Est-ce une bonne idée de…",
    rounds: [
      ["📰 Lire les actualités", 0, "Aucun souci : rien de personnel."],
      ["🏦 Consulter mon compte bancaire et faire un virement", 1, "Pour la banque et les démarches sensibles, on préfère la 4G ou le Wi-Fi de la maison."],
      ["🚆 Regarder les horaires de train", 0, "C'est fait pour ça !"],
      ["🔑 Taper le mot de passe de ma messagerie sur la page de connexion du Wi-Fi", 1, "Un vrai Wi-Fi public ne demande jamais ce mot de passe : c'est un faux réseau qui veut le voler."],
      ["🎬 Regarder une vidéo pour économiser mon forfait", 0, "Oui : c'est un bon usage du Wi-Fi public (s'il est assez rapide)."]
    ].map(([p, ok, why]) => ({ kind: "choice", prompt: `<div class="lp-scene">${p}</div>`, choices: OK, ok, why, short: p.slice(3, 45), limit: 15 })) });

  const FIX = ["✈ Couper le mode avion", "📶 Rallumer le Wi-Fi", "📡 Choisir le réseau de ma box", "🔌 Redémarrer la box"];
  G({ id: "wifi_diag", title: "Quelle est la panne ?", icon: "🛠️",
    intro: "Internet ne marche plus. D'après les indices, quelle est la <b>bonne solution</b> ?",
    rounds: [
      ["En bas à droite, je vois un petit avion ✈.", 0, "Le mode avion coupe tout : on le désactive."],
      ["Le menu Wi-Fi indique « Wi-Fi désactivé ». Les voyants de la box sont verts.", 1, "La box va bien : il suffit de rallumer le Wi-Fi de l'ordinateur."],
      ["Je suis connecté(e) à « Wifi_Gratuit_Valbourg », marqué « Aucun Internet ».", 2, "L'ordinateur s'est connecté au mauvais réseau : on choisit celui de sa box."],
      ["Point d'exclamation sur le Wi-Fi, et le voyant @ de la box est rouge.", 3, "La box n'a plus Internet : on la débranche, on attend, on la rebranche… et on patiente."]
    ].map(([p, ok, why]) => ({ kind: "choice", layout: "files", prompt: `<div class="lp-scene">${p}</div>`, choices: FIX, ok, why, short: p.slice(0, 45), limit: 20 })) });

  G({ id: "wifi_redemarrer", title: "Redémarrer la box, dans l'ordre", icon: "🔌",
    intro: "Les étapes pour redémarrer la box sont mélangées : remettez-les <b>dans l'ordre</b> !",
    rounds: [{ kind: "order", limit: 60, prompt: "Redémarrer sa box :", answer: ["Débrancher la prise de la box", "Attendre une dizaine de secondes", "Rebrancher la prise", "Attendre 2 à 5 minutes que les voyants redeviennent verts", "Vérifier : actualiser la page ⟳"],
      why: "Et si les voyants restent rouges : on appelle le numéro de son opérateur, inscrit sur la facture." }] });

  /* =================== SÉANCE 3 =================== */
  G({ id: "wifi_buzz", title: "Arnaque ou pas ? Buzzez !", icon: "🚩",
    intro: "Des SMS apparaissent ligne par ligne. Dès que vous êtes sûr(e) que c'est une <b>arnaque</b> : buzzez ! Plus vous êtes rapide, plus vous gagnez de points.",
    rounds: [
      { kind: "buzz", fake: true, interval: 3, head: `<div class="lp-buzz-head">💬 <b>SERVICE-BOX</b> · +33 6 44 09 81 22</div>`, lines: ["Bonjour,", "suite à un impayé, votre box sera suspendue", "sous 24 h.", "Régularisez maintenant (2,49 €) :", "box-regularisation.com"],
        why: "Numéro inconnu, urgence (24 h), petit montant, lien bizarre : arnaque. On transfère au 33700 et on supprime." },
      { kind: "buzz", fake: false, interval: 3, head: `<div class="lp-buzz-head">💬 <b>Mon opérateur</b></div>`, lines: ["Bonjour,", "vous avez consommé 80 % de votre forfait internet ce mois-ci.", "Il se renouvelle le 1er du mois.", "Détail dans votre application."],
        why: "Une information, sans lien ni demande de paiement : c'est normal." },
      { kind: "buzz", fake: true, interval: 3, head: `<div class="lp-buzz-head">💬 <b>Info-Forfait</b> · +33 7 56 12 98 40</div>`, lines: ["Félicitations !", "Vous avez gagné 50 Go offerts", "sur votre forfait mobile.", "Pour les activer, confirmez votre carte bancaire :", "go-offert-forfait.info"],
        why: "Un cadeau qui demande la carte bancaire : arnaque classique." }
    ] });

  G({ id: "wifi_conso", title: "Du moins gourmand au plus gourmand", icon: "📊",
    intro: "Ces usages consomment les <b>Go</b> du forfait. Rangez-les du <b>moins</b> gourmand au <b>plus</b> gourmand !",
    rounds: [{ kind: "order", limit: 70, prompt: "Du moins gourmand (en haut) au plus gourmand (en bas) :", answer: ["💬 Envoyer un SMS", "📧 Lire un e-mail", "🌐 Regarder une page Internet", "🎵 Écouter de la musique 1 heure", "🎬 Regarder une vidéo 1 heure"],
      why: "Les SMS ne comptent pas dans les Go. Une heure de vidéo peut consommer 1 à 3 Go : à garder pour le Wi-Fi !" }] });

  const QF = (p, c, ok, why, short) => ({ kind: "choice", layout: "files", prompt: p, choices: c, ok, why, short, limit: 25 });
  G({ id: "wifi_que_faire", title: "Que faites-vous ?", icon: "🆘", noRank: true,
    intro: "Des situations de tous les jours avec la box, le Wi-Fi et le forfait… et les bons gestes, <b>calmement</b>. Pas de classement : on en parle ensemble.",
    rounds: [
      QF("La box est en panne et je dois envoyer un formulaire aujourd'hui.", ["J'attends demain", "J'utilise le partage de connexion de mon téléphone", "J'utilise le Wi-Fi du voisin sans lui demander"], 1, "Le partage de connexion transforme le téléphone en box de secours (avec le forfait).", "Box en panne, formulaire urgent"),
      QF("Mon forfait est presque épuisé, et on est le 20 du mois.", ["Je regarde les vidéos en Wi-Fi jusqu'au 1er du mois", "Je change de téléphone", "Je clique sur le SMS « 50 Go offerts »"], 0, "Les vidéos en Wi-Fi, et le compteur repart à zéro au début du mois.", "Forfait presque épuisé"),
      QF("Un « technicien » m'appelle : ma box serait piratée, il veut prendre la main sur mon ordinateur.", ["Je le laisse faire", "Je raccroche, et je rappelle mon opérateur au numéro de la facture si j'ai un doute", "Je lui donne mon mot de passe"], 1, "Un vrai technicien ne prend jamais la main suite à un appel imprévu.", "Faux technicien"),
      QF("Ma petite-fille me demande le code du Wi-Fi.", ["Je lui donne : il est sur l'étiquette de la box", "Je refuse, c'est trop dangereux", "Je lui donne aussi mon mot de passe de messagerie"], 0, "La clé Wi-Fi se partage avec ses proches. Les mots de passe de comptes, jamais.", "Code du Wi-Fi"),
      QF("Le téléphone n'a plus Internet, et je vois ✈ en haut.", ["Je redémarre la box", "Je désactive le mode avion", "J'appelle mon opérateur"], 1, "Le mode avion coupe tout : on le désactive dans les Réglages.", "Mode avion")
    ] });
})(window.AN);

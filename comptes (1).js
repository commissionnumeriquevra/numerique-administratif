/* =========================================================
   Chapitre « Comptes et mots de passe » : 3 séances de 30 minutes.
   Cours court projeté, jeux en direct, puis les exercices (8 niveaux).
   ========================================================= */
(function (AN) {
  "use strict";
  const flip = (front, back, ok) => `<button type="button" class="l-flip ${ok === true ? "is-ok" : ok === false ? "is-ko" : ""}" data-flip><span class="l-front">${front}</span><span class="l-back">${back}</span></button>`;
  const key = ms => `<div class="l-meta">${ms.map(([i, t, s, eq], k) => `<div data-reveal="${k + 1}"><span>${i}</span><b>${t}</b><small>${s}</small>${eq ? `<span class="eq">${eq}</span>` : ""}</div>`).join("")}</div>`;

  /* illustration : maison (compte) avec clé */
  const SVG_HOUSE = `<svg viewBox="0 0 260 180" class="l-svg" aria-hidden="true">
    <rect x="50" y="80" width="140" height="90" rx="4" fill="#fff" stroke="#7050bf" stroke-width="4"/>
    <path d="M40 84 L120 30 L200 84" fill="none" stroke="#7050bf" stroke-width="5" stroke-linejoin="round"/>
    <rect x="104" y="112" width="32" height="58" rx="3" fill="#c9b6ef"/><circle cx="128" cy="142" r="3" fill="#7050bf"/>
    <rect x="150" y="104" width="26" height="26" rx="3" fill="#dfe9f7" stroke="#7050bf" stroke-width="2"/>
    <text x="120" y="66" text-anchor="middle" font-size="13" font-weight="800" fill="#7050bf">mon compte</text>
    <g><circle cx="214" cy="150" r="13" fill="none" stroke="#e0a100" stroke-width="5"/><rect x="214" y="146" width="34" height="8" fill="#e0a100"/><rect x="242" y="146" width="5" height="14" fill="#e0a100"/><rect x="234" y="146" width="5" height="11" fill="#e0a100"/></g></svg>`;

  /* =================== SÉANCE 1 =================== */
  const s1 = () => [
    { title: "Un compte, c'est comme une maison 🏠", html: `
      <div class="l-grid2 l-mid"><div class="l-center">${SVG_HOUSE}</div>
        <div>${key([["📧", "L'identifiant", "C'est l'adresse : il dit QUELLE maison. Souvent, c'est votre adresse e-mail.", "On peut le donner"],
          ["🔑", "Le mot de passe", "C'est la clé : il prouve que la maison est bien à vous.", "Il reste secret"]])}</div></div>
      <div class="l-callout" data-reveal="3">👉 On <b>donne</b> son identifiant comme une adresse, mais on <b>garde</b> son mot de passe comme une clé. Jamais les deux à n'importe qui !</div>` },

    { title: "Créer un compte, pas à pas", theme: "dense", html: `
      <ol class="l-gestures">
        <li data-reveal="1"><span>📝</span><div><b>Je remplis le formulaire</b><small>Nom, prénom, adresse e-mail. Les cases avec une étoile * sont obligatoires.</small></div></li>
        <li data-reveal="2"><span>🔑</span><div><b>Je choisis un mot de passe, et je le confirme</b><small>Le retaper sert à vérifier qu'il n'y a pas de faute de frappe. Le bouton 👁 affiche ce que je tape.</small></div></li>
        <li data-reveal="3"><span>☑️</span><div><b>J'accepte les conditions d'utilisation</b><small>Et je laisse décochée la pub si je n'en veux pas.</small></div></li>
        <li data-reveal="4"><span>📩</span><div><b>Je clique sur le lien de l'e-mail de confirmation</b><small>Il arrive dans ma messagerie… parfois dans les Indésirables !</small></div></li>
      </ol>` },

    { title: "Je me connecte, je me déconnecte", html: `
      <div class="l-grid2">
        <div class="l-card big" data-reveal="1"><h3>👁 Vérifier son mot de passe</h3><p>Le petit œil affiche ce que vous tapez : pratique pour corriger.</p><p>⚠️ Attention à la touche <kbd>Verr. Maj</kbd> : « Lilas » et « LILAS », ce n'est pas pareil !</p></div>
        <div class="l-risk" data-reveal="2"><h3>🚪 Sur un ordinateur partagé</h3><p>À la médiathèque, chez un ami, à l'hôtel : <b>toujours se déconnecter</b> en partant.</p><p>Et <b>jamais</b> cocher « Se souvenir de moi ».</p></div>
      </div>
      <div class="l-callout" data-reveal="3">🏠 Sur <b>votre</b> ordinateur ou <b>votre</b> téléphone (protégé par un code), vous pouvez rester connecté : c'est fait pour ça.</div>` }
  ];

  /* =================== SÉANCE 2 =================== */
  const s2 = () => [
    { title: "Comment les pirates devinent un mot de passe", theme: "dense", html: `
      <div class="l-grid3">
        <div class="l-risk" data-reveal="1"><h3>1️⃣ Les fuites</h3><p>Un site se fait voler ses mots de passe. Les pirates les essaient <b>automatiquement</b> ailleurs.</p><small>👉 D'où : un mot de passe <b>différent par site</b>.</small></div>
        <div class="l-risk" data-reveal="2"><h3>2️⃣ Les plus courants</h3><p>Un logiciel essaie d'abord <b>123456, azerty, soleil, motdepasse…</b></p><small>👉 En quelques secondes.</small></div>
        <div class="l-risk" data-reveal="3"><h3>3️⃣ Vos infos</h3><p>Le pirate fouille ce que vous <b>publiez</b> : prénom d'un proche, animal, date de naissance, ville.</p><small>👉 Puis il teste les combinaisons.</small></div>
      </div>
      <div class="l-callout" data-reveal="4">⚡ Un logiciel teste des <b>milliards</b> d'essais par seconde. « Rex1952 » tombe instantanément. Mais il cherche la proie facile : si ça résiste, <b>il passe à quelqu'un d'autre</b>.</div>` },

    { title: "La parade : la phrase de passe 🛡️", html: `
      <p class="l-lead">Oubliez le mot compliqué impossible à retenir. La force, c'est la <b>longueur</b> : plusieurs mots qui font une image.</p>
      <div class="l-flips">
        ${flip("<code>Minou2014</code>", "🔓 Trouvé <b>instantanément</b><br>(un animal + une année)", false)}
        ${flip("<code>P@ssw0rd!</code>", "🔓 Trouvé tout de suite<br>(un mot connu déguisé)", false)}
        ${flip("<code>Trois tomates dansent sous la pluie !</code>", "🔒 Des <b>siècles</b> !<br>Longue, et facile à retenir", true)}
      </div>
      <div class="l-callout" data-reveal>🧠 Pour la retenir : <b>imaginez la scène</b> dans votre tête. Et choisissez des mots sans rapport avec votre vraie vie.</div>` },

    { title: "Le coffre-fort à mots de passe 🔐", html: `
      <p class="l-lead">Un mot de passe différent par site… impossible à retenir ? C'est le travail du <b>coffre-fort</b> !</p>
      <div class="l-grid3">
        <div class="l-card" data-reveal="1"><h3>🔒 Il invente</h3><p>Des mots de passe très solides, au hasard.</p></div>
        <div class="l-card" data-reveal="2"><h3>💾 Il enregistre</h3><p>Dans votre compte Google ou Apple. Retrouvés sur tous vos appareils.</p></div>
        <div class="l-card" data-reveal="3"><h3>✍️ Il remplit</h3><p>Tout seul, à la connexion suivante. Vous ne tapez plus rien.</p></div>
      </div>
      <div class="l-callout" data-reveal="4">🔑 Vous n'avez plus qu'<b>une seule</b> clé à retenir : celle de votre compte Google ou Apple (et le code de l'appareil). Elle, elle doit être <b>très solide</b> : une phrase de passe !</div>` }
  ];

  /* =================== SÉANCE 3 =================== */
  const s3 = () => [
    { title: "La double sécurité : le code par SMS 📱", html: `
      <div class="l-grid2 l-mid">
        <div>${key([["1️⃣", "Le mot de passe", "La première clé : ce que je sais."], ["2️⃣", "Le code reçu par SMS", "La deuxième clé : ce que j'ai (mon téléphone)."]])}</div>
        <div class="l-safe" data-reveal="3"><h3>🛡️ Pourquoi c'est fort</h3><p>Même si un pirate vole mon mot de passe, il n'a <b>pas mon téléphone</b> : il ne reçoit pas le code. Il est bloqué.</p><p>Quand un site le propose, je dis <b>oui</b> !</p></div>
      </div>
      <div class="l-never" data-reveal="4"><h3>🚨 Le code par SMS ne se donne JAMAIS</h3><p>Je le tape <b>moi-même</b>, sur le site. Aucun conseiller, aucun technicien, aucune banque ne me le demandera jamais par téléphone.</p></div>` },

    { title: "FranceConnect : une seule clé pour l'État 🇫🇷", html: `
      <p class="l-lead">Pour les sites publics, plus besoin d'un mot de passe par site : <b>FranceConnect</b> réutilise un compte que vous avez déjà.</p>
      <div class="l-grid2">
        <div class="l-card big" data-reveal="1"><h3>Comment ça marche</h3><p>Sur impots.gouv.fr, ameli, la CAF… je clique sur <b>« S'identifier avec FranceConnect »</b>, puis je choisis un compte que j'ai déjà (ameli, les impôts…).</p></div>
        <div class="l-card big" data-reveal="2"><h3>L'avantage</h3><p>Une <b>seule</b> clé à retenir pour tous les services publics. Et c'est l'État qui gère la sécurité.</p></div>
      </div>
      <div class="l-callout" data-reveal="3">👀 Le vrai bouton est bleu, avec le nom « FranceConnect ». Comme toujours : je vérifie le <b>vrai nom du site</b> avant.</div>` },

    { title: "Le faux conseiller ☎️", html: `
      <div class="l-grid2 l-mid">
        <div class="l-alert-mini" data-reveal="1"><b>📞 « Service fraude de votre banque »</b><p>« Un paiement suspect de 849 € est en cours. Lisez-moi vite le code reçu par SMS pour l'annuler ! »</p></div>
        <ul class="l-list" data-reveal="2"><li>⏰ Il crée l'<b>urgence</b> pour vous empêcher de réfléchir.</li><li>📱 Il demande le <b>code reçu par SMS</b> : en le donnant, vous validez vous-même le vol.</li><li>🧐 Il connaît votre nom, votre adresse ? Ces infos se volent : <b>ça ne prouve rien</b>.</li></ul>
      </div>
      <div class="l-callout" data-reveal="3">✅ Le réflexe : <b>je raccroche</b>, et si j'ai un doute, <b>j'appelle le numéro au dos de ma carte</b>. La vraie banque confirmera que tout va bien.</div>` },

    { title: "Oubli et piratage : pas de panique 🆘", html: `
      <div class="l-grid2">
        <div class="l-card big" data-reveal="1"><h3>🔑 Mot de passe oublié</h3><p>Sous le bouton « Se connecter », le lien <b>« Mot de passe oublié ? »</b>. Un e-mail arrive avec un lien (valable peu de temps) pour en choisir un nouveau.</p><p>👉 Je ne devine pas au hasard : le compte pourrait se bloquer.</p></div>
        <div class="l-card big" data-reveal="2"><h3>🚨 Compte piraté ?</h3><p>Des messages bizarres envoyés en votre nom, une connexion inconnue, un mot de passe qui ne marche plus…</p><p>👉 Je change le mot de passe (en allant <b>moi-même</b> sur le site), je préviens mes contacts, j'active le code par SMS.</p></div>
      </div>
      <div class="l-callout" data-reveal="3">🫶 Aucune honte, et de l'aide gratuite : <b>cybermalveillance.gouv.fr</b>… et votre médiateur numérique !</div>` }
  ];

  /* =================== ASSEMBLAGE =================== */
  const cover = (n, title, goals) => ({ theme: "cover", title: `<small class="l-seance">Séance ${n} / 3</small>${title}`, html: `<div class="l-goals">${goals.map(g => `<div data-reveal>${g}</div>`).join("")}</div>` });
  const game = (id, title) => ({ title: `🎮 ${title}`, game: id });
  const end = (levels, demoType, extra = "") => ({ theme: "cover", title: "À vous ! 💻", html: `
      <p class="l-lead">Dans <b>« Mes missions »</b>, faites ${levels}. Chacun à son rythme : je passe vous voir.</p>${extra}
      <div class="l-actions">
        ${demoType ? `<button type="button" class="l-btn" data-lesson-act="demo" data-type="${demoType}">👥 Faire le premier ensemble</button>` : ""}
        <button type="button" class="l-btn alt" data-lesson-act="assign">🚀 Donner le chapitre au groupe</button>
      </div>` });
  const pick = (arr, start) => { const s = arr.find(x => x.title && x.title.startsWith(start)); if (!s) console.warn("Diapositive introuvable :", start); return s; };

  const lessons = () => {
    const A = s1(), B = s2(), C = s3();
    return [
      { id: "s1", title: "Séance 1 : mon compte, c'est ma clé", icon: "🔑", badge: "Séance 1 · Mon compte", slides: () => [
        cover(1, "Mon compte, c'est ma clé", ["🏠 Identifiant et mot de passe", "🆕 Créer un compte", "👁 Vérifier ce que je tape", "🚪 Se déconnecter"]),
        pick(A, "Un compte"),
        game("acc_montrer", "Je le donne ou je le garde ?"),
        pick(A, "Créer un compte"),
        game("acc_inscription", "Remets l'inscription dans l'ordre"),
        pick(A, "Je me connecte"),
        game("acc_deconnecte", "Je me déconnecte ou pas ?"),
        end("les <b>niveaux 1 et 2</b> : se connecter, créer un compte", "acc_login")] },
      { id: "s2", title: "Séance 2 : un mot de passe solide", icon: "💪", badge: "Séance 2 · Un mot de passe solide", slides: () => [
        cover(2, "Un mot de passe solide", ["🕵️ Comment font les pirates", "🛡️ La phrase de passe", "🔐 Le coffre-fort", "✅ Les bonnes habitudes"]),
        pick(B, "Comment les pirates"),
        game("acc_solide", "Solide ou fragile ?"),
        pick(B, "La parade"),
        game("acc_fabrique", "Fabrique ta phrase de passe"),
        game("acc_qui", "Qui peut me demander mon mot de passe ?"),
        pick(B, "Le coffre-fort"),
        end("les <b>niveaux 3, 4 et 5</b> : le simulateur du pirate, la phrase de passe, le coffre-fort", "acc_pirate",
          `<div class="l-callout">🕵️ « Faire le premier ensemble » lance le <b>simulateur du pirate</b> : on voit, en vrai, un mot de passe faible tomber en quelques secondes… et une phrase de passe résister.</div>`)] },
      { id: "s3", title: "Séance 3 : codes, oublis et pirates", icon: "📱", badge: "Séance 3 · Codes et sécurité", slides: () => [
        cover(3, "Le code par SMS, les oublis, les pirates", ["📱 La double sécurité", "🇫🇷 FranceConnect", "☎️ Le faux conseiller", "🆘 Oubli et piratage"]),
        pick(C, "La double sécurité"),
        game("acc_code", "Je donne le code, ou pas ?"),
        pick(C, "FranceConnect"), pick(C, "Le faux conseiller"),
        game("acc_conseiller", "Vrai ou faux conseiller ?"),
        pick(C, "Oubli et piratage"),
        game("acc_que_faire", "Que faites-vous ?"),
        end("les <b>niveaux 6, 7 et 8</b> : le code par SMS, le mot de passe oublié… puis la <b>mission réelle</b> sur un vrai site !", "acc_sms",
          `<div class="l-callout">🌍 Le niveau 8 se fait sur le <b>vrai Internet</b> : on observe une vraie page de connexion (FranceConnect, « mot de passe oublié »), <b>sans jamais se connecter</b>.</div>`)] }
    ];
  };

  AN.chapters.register({
    id: "comptes", title: "Comptes et mots de passe", icon: "🔑", color: "#7050bf",
    summary: "3 séances de 30 minutes : un cours court, des jeux en direct, puis les exercices… jusqu'à une mission sur le vrai Internet.",
    duration: "3 séances", parcours: "p_comptes", demo: "acc_login",
    demos: [{ type: "acc_login", label: "Niveau 1 ensemble" }, { type: "acc_pirate", label: "Le simulateur du pirate" }, { type: "acc_sms", label: "Le code par SMS ensemble" }],
    get lessons() { return lessons(); }
  });

  /* Rangé juste après « Navigateurs », avant les chapitres à venir. */
  (function () {
    const all = AN.chapters.all, i = all.findIndex(c => c.id === "comptes"), j = all.findIndex(c => c.soon);
    if (j >= 0 && i > j) all.splice(j, 0, all.splice(i, 1)[0]);
  })();
})(window.AN);

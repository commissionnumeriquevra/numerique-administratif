/* =========================================================
   Chapitre « FranceConnect » : 3 séances de 30 minutes.
   Le dernier chapitre du programme : on réutilise tout ce qui a
   été appris (adresse, mot de passe, code, arnaques) pour entrer
   sur les sites de l'État.
   ========================================================= */
(function (AN) {
  "use strict";
  const flip = (front, back, ok) => `<button type="button" class="l-flip ${ok === true ? "is-ok" : ok === false ? "is-ko" : ""}" data-flip><span class="l-front">${front}</span><span class="l-back">${back}</span></button>`;
  const K = () => AN.fcKit;
  const fcButton = plus => `<span class="fc-btn ${plus ? "plus" : ""}" style="cursor:default"><span class="fc-logo">FC</span><span>S'identifier avec<br><b>FranceConnect${plus ? "+" : ""}</b></span></span>`;
  const door = (ic, t) => `<div class="fc-door"><span>${ic}</span>${t}</div>`;

  /* =================== SÉANCE 1 =================== */
  const s1 = () => [
    { title: "Une seule clé pour l'État 🔑", html: `
      <p class="l-lead">Avant : un compte et un mot de passe <b>par site</b>. Avec FranceConnect : <b>un compte que j'ai déjà</b> ouvre de nombreux sites publics.</p>
      <div class="fc-keyring" data-reveal="1"><div class="fc-door" style="background:#000091;color:#fff"><span>🔑</span>Mon compte impots<br>(ou ameli…)</div><span style="font-size:2em">➜</span>
        ${door("🏛️", "Ma mairie")}${door("👪", "La CAF")}${door("🧓", "Ma retraite")}${door("🪪", "L'ANTS")}${door("🎓", "Ma formation")}</div>
      <div class="l-callout" data-reveal="2">🇫🇷 FranceConnect est un service <b>de l'État</b>, gratuit. Il n'y a <b>pas de « compte FranceConnect »</b> à créer : on utilise un compte qu'on a déjà.</div>` },

    { title: "Le bouton FranceConnect 🔵", html: `
      <div class="l-grid2 l-mid">
        <div class="l-center" data-reveal="1">${fcButton(false)}<p style="margin-top:12px">${fcButton(true)}</p></div>
        <ol class="mm-notes">
          <li data-reveal="2"><i class="pin">1</i><div><b>Où ?</b><small>Sur la page de connexion des sites publics : mairie, CAF, ANTS, retraite…</small></div></li>
          <li data-reveal="3"><i class="pin">2</i><div><b>Après le clic</b><small>L'adresse devient <b>franceconnect.gouv.fr</b> : je vérifie ce nom !</small></div></li>
          <li data-reveal="4" class="ok"><i class="pin ok">3</i><div><b>FranceConnect+</b><small>La version renforcée, pour les démarches sensibles.</small></div></li>
        </ol></div>` },

    { title: "Quel compte choisir ?", theme: "dense", html: `
      <div class="fc-idps" data-reveal="1">${(K()?.IDP || []).map(i => `<div class="fc-idp" style="cursor:default"><span class="ic">${i.ic}</span>${i.label}<small>${i.sub}</small></div>`).join("")}</div>
      <div class="l-grid2">
        <div class="l-safe" data-reveal="2"><h3>✅ Celui que j'ai déjà</h3><p>Je déclare mes impôts en ligne ? <b>impots.gouv.fr</b>. J'ai un compte ameli ? <b>ameli</b>.</p></div>
        <div class="l-card" data-reveal="3"><h3>🆕 Aucun compte ?</h3><p>J'en crée un d'abord (ameli, impots…). Il doit être à mon nom, avec mon <b>état civil exact</b>.</p></div>
      </div>
      <p class="l-note" data-reveal="4">ℹ️ Le service « YRIS » n'existe plus depuis juillet 2026 : ceux qui l'utilisaient choisissent un autre compte.</p>` }
  ];

  /* =================== SÉANCE 2 =================== */
  const s2 = () => [
    { title: "Se connecter, en 5 étapes", theme: "dense", html: `
      <ol class="l-gestures">
        <li data-reveal="1"><span>🔵</span><div><b>1. Le bouton FranceConnect</b><small>sur le site où je fais ma démarche</small></div></li>
        <li data-reveal="2"><span>🔑</span><div><b>2. Je choisis mon compte</b><small>sur la page franceconnect.gouv.fr</small></div></li>
        <li data-reveal="3"><span>⌨️</span><div><b>3. Mes identifiants</b><small>sur le site de ce compte (impots.gouv.fr…) : jamais ailleurs</small></div></li>
        <li data-reveal="4"><span>👀</span><div><b>4. Je vérifie les informations transmises</b><small>nom, prénoms, date et lieu de naissance… puis « Continuer »</small></div></li>
        <li data-reveal="5"><span>🏁</span><div><b>5. Retour sur le site</b><small>je suis identifié(e), mes informations sont remplies</small></div></li>
      </ol>
      <div class="l-callout" data-reveal="6">📧 Juste après, un e-mail de FranceConnect me dit « Vous vous êtes connecté(e) à… » : c'est <b>normal</b>.</div>` },

    { title: "Deux portes à fermer 🚪🚪", html: `
      <div class="l-grid2">
        <div class="l-card big" data-reveal="1"><h3>🚪 1. Le site</h3><p>Je clique sur <b>Se déconnecter</b>.</p></div>
        <div class="l-card big" data-reveal="2"><h3>🚪 2. FranceConnect</h3><p>FranceConnect demande : « Voulez-vous aussi vous déconnecter ? » Sur un ordinateur <b>partagé</b> : <b>Oui</b>.</p></div>
      </div>
      <div class="l-callout" data-reveal="3">🏠 Chez moi, sur mon ordinateur, rester connecté à FranceConnect n'est pas grave. À la médiathèque, à l'hôtel, chez un ami : je ferme les deux portes, puis l'onglet.</div>` },

    { title: "Ça bloque ? 🛠️", html: `
      <div class="l-flips">
        ${flip("🔑 J'ai oublié mon mot de passe", "Je le récupère sur la page du <b>compte choisi</b> (impots, ameli…) : « Mot de passe oublié ? »", true)}
        ${flip("⚠️ « Identité non reconnue »", "Mon compte n'a pas mon <b>état civil exact</b> : j'en choisis un autre, et je fais corriger.", true)}
        ${flip("🔒 « FranceConnect+ » demandé", "Il faut <b>L'Identité Numérique La Poste</b> ou <b>France Identité</b>.", true)}
      </div>
      <p class="l-note" data-reveal>FranceConnect ne connaît pas mes mots de passe : chaque compte garde le sien.</p>` }
  ];

  /* =================== SÉANCE 3 =================== */
  const s3 = () => [
    { title: "FranceConnect+ : l'identité renforcée 🪪", html: `
      <div class="l-grid2">
        <div class="l-card big" data-reveal="1"><h3>📮 L'Identité Numérique La Poste</h3><p>Une application sur le téléphone. Mon identité est vérifiée une fois (au bureau de poste, par exemple).</p><p>Pour me connecter : je <b>valide sur le téléphone</b>, avec mon code secret.</p></div>
        <div class="l-card big" data-reveal="2"><h3>🪪 France Identité</h3><p>L'application de l'État, avec la <b>carte d'identité au format carte bancaire</b> : le téléphone lit sa puce.</p></div>
      </div>
      <div class="l-callout" data-reveal="3">🎓 FranceConnect+ est demandé pour les démarches sensibles : Mon Compte Formation, MaPrimeRénov', la création d'entreprise…</div>` },

    { title: "Valider sur le téléphone : seulement si c'est moi 📱", html: `
      <div class="l-grid2 l-mid">
        <div class="fc-notif" data-reveal="1" style="max-width:320px;margin:0 auto"><b>📮 L'Identité Numérique · maintenant</b><div><b>Service des impôts</b> souhaite vérifier votre identité.</div><div>Est-ce bien vous ?</div><div class="row"><button type="button" class="no">Refuser</button><button type="button" class="yes">C'est moi, valider</button></div></div>
        <div><div class="l-safe" data-reveal="2"><h3>✅ Je viens de cliquer sur FranceConnect+</h3><p>Le nom du service correspond : je valide, et je tape mon code.</p></div>
          <div class="l-never" data-reveal="3" style="margin-top:10px"><h3>🚫 Je n'ai rien demandé</h3><p>Je <b>refuse</b>. Quelqu'un essaie peut-être d'utiliser mon identité.</p></div></div>
      </div>` },

    { title: "Les faux FranceConnect 🎣", theme: "dense", html: `
      <div class="l-grid3">
        <div class="l-alert-mini" data-reveal="1"><b>📞 « Agent FranceConnect »</b><p>« Je finalise votre inscription. Votre numéro de sécurité sociale ? »</p></div>
        <div class="l-alert-mini" data-reveal="2"><b>📧 « Compte suspendu sous 24 h »</b><p>« Confirmez vos informations : franceconnect-verification.com »</p></div>
        <div class="l-alert-mini" data-reveal="3"><b>💬 « Remboursement en attente »</b><p>« Connectez-vous via FranceConnect : ameli-rembourse.info »</p></div>
      </div>
      <ul class="l-list" data-reveal="4"><li>☎️ Personne de FranceConnect ne m'appelle : je <b>raccroche</b>.</li><li>🔗 Je ne passe <b>jamais par un lien</b> reçu : je vais moi-même sur le site, et je clique sur le bouton.</li><li>🌐 Le vrai nom : <b>franceconnect.gouv.fr</b>.</li><li>📧 Un e-mail « vous vous êtes connecté(e) » alors que je n'ai rien fait ? Je change le mot de passe du compte utilisé.</li></ul>` },

    { title: "Bravo : le tour est fait ! 🎓", theme: "cover", html: `
      <p class="l-lead">E-mail, navigateur, mots de passe, fichiers, Wi-Fi, périphériques… et maintenant FranceConnect : vous avez toutes les clés pour vos démarches en ligne.</p>
      <div class="l-goals"><div data-reveal>🧭 Je vérifie le vrai nom des sites</div><div data-reveal>🔑 Je garde mes mots de passe et mes codes pour moi</div><div data-reveal>🚩 Je repère les arnaques</div><div data-reveal>🫶 Et si je doute : je demande !</div></div>` }
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
      { id: "s1", title: "Séance 1 : une seule clé pour l'État", icon: "🔑", badge: "Séance 1 · Une seule clé", slides: () => [
        cover(1, "Une seule clé pour l'État", ["🔑 FranceConnect, c'est quoi ?", "🔵 Reconnaître le bouton", "🌐 Vérifier franceconnect.gouv.fr", "👤 Quel compte choisir ?"]),
        pick(A, "Une seule clé"), game("fc_vf", "FranceConnect : vrai ou faux ?"),
        pick(A, "Le bouton"), game("fc_adresse", "La vraie adresse"),
        pick(A, "Quel compte"), game("fc_quel_compte", "Quel compte pour qui ?"),
        end("les <b>niveaux 1 et 2</b> : reconnaître FranceConnect, choisir son compte", "fc_reconnaitre")] },
      { id: "s2", title: "Séance 2 : se connecter pas à pas", icon: "🚪", badge: "Séance 2 · Pas à pas", slides: () => [
        cover(2, "Se connecter pas à pas", ["🧭 Le parcours en 5 étapes", "👀 Les informations transmises", "🚪 Se déconnecter", "🛠️ Quand ça bloque"]),
        pick(B, "Se connecter, en 5"), game("fc_ordre", "Remets les étapes dans l'ordre"),
        pick(B, "Deux portes"), game("fc_portes", "Je me déconnecte de FranceConnect ?"),
        pick(B, "Ça bloque"), game("fc_ou", "Où est la solution ?"),
        end("les <b>niveaux 3, 4 et 5</b> : se connecter, se déconnecter, et réagir quand ça bloque", "fc_connexion")] },
      { id: "s3", title: "Séance 3 : FranceConnect+ et les pièges", icon: "🛡️", badge: "Séance 3 · FranceConnect+ et pièges", slides: () => [
        cover(3, "FranceConnect+ et les pièges", ["🪪 L'identité renforcée", "📱 Valider sur le téléphone", "🎣 Les faux FranceConnect"]),
        pick(C, "FranceConnect+"), pick(C, "Valider"), game("fc_valider", "Je valide ou je refuse ?"),
        pick(C, "Les faux"), game("fc_buzz", "Arnaque ou pas ? Buzzez !"), game("fc_que_faire", "Que faites-vous ?"),
        end("les <b>niveaux 6, 7 et 8</b> : FranceConnect+, les faux FranceConnect… puis la <b>mission réelle</b> sur un vrai site public", "fc_plus",
          `<div class="l-callout">🌍 Le niveau 8 se fait sur le <b>vrai Internet</b> : on trouve le bouton FranceConnect d'un vrai site, on regarde… et on <b>ne se connecte pas</b>.</div>`),
        pick(C, "Bravo")] }
    ];
  };

  AN.chapters.register({
    id: "franceconnect", title: "FranceConnect", icon: "🇫🇷", color: "#000091",
    summary: "Le chapitre final : 3 séances pour se connecter aux sites de l'État avec un compte qu'on a déjà, FranceConnect+, et les pièges à éviter… jusqu'à une mission sur un vrai site public.",
    duration: "3 séances", parcours: "p_franceconnect", demo: "fc_connexion",
    demos: [{ type: "fc_connexion", label: "Se connecter ensemble (niveau 3)" }, { type: "fc_plus", label: "FranceConnect+ (niveau 6)" }, { type: "fc_arnaques", label: "Les faux FranceConnect (niveau 7)" }],
    get lessons() { return lessons(); }
  });
})(window.AN);

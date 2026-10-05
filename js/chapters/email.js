/* =========================================================
   Chapitre E-mail : leçon projetée + parcours de 7 niveaux.
   ========================================================= */
(function (AN) {
  "use strict";

  const flip = (front, back, ok) => `<button type="button" class="l-flip ${ok === true ? "is-ok" : ok === false ? "is-ko" : ""}" data-flip><span class="l-front">${front}</span><span class="l-back">${back}</span></button>`;

  /* Petite illustration : enveloppe et boîte aux lettres */
  const SVG_POST = `<svg viewBox="0 0 220 150" class="l-svg" aria-hidden="true">
    <rect x="12" y="34" width="120" height="80" rx="8" fill="#fff" stroke="#7050bf" stroke-width="4"/>
    <path d="M12 42 L72 86 L132 42" fill="none" stroke="#7050bf" stroke-width="4"/>
    <rect x="104" y="44" width="20" height="24" fill="#ffd76a" stroke="#c99a1f" stroke-width="2"/>
    <rect x="172" y="100" width="10" height="44" fill="#6c7280"/>
    <path d="M148 102 V70 a29 29 0 0 1 58 0 V102 Z" fill="#ffd76a" stroke="#c99a1f" stroke-width="3"/>
    <rect x="160" y="68" width="34" height="6" rx="3" fill="#7a5a10"/>
    <rect x="204" y="52" width="5" height="34" fill="#6c7280"/><rect x="204" y="52" width="20" height="13" fill="#d95f56"/></svg>`;
  const SVG_MAIL = `<svg viewBox="0 0 220 150" class="l-svg" aria-hidden="true">
    <rect x="20" y="20" width="180" height="110" rx="12" fill="#fff" stroke="#3979b7" stroke-width="4"/>
    <rect x="20" y="20" width="180" height="22" rx="12" fill="#3979b7"/>
    <rect x="34" y="56" width="60" height="8" rx="4" fill="#3979b7"/><rect x="34" y="72" width="120" height="6" rx="3" fill="#c9d6e6"/>
    <rect x="34" y="86" width="140" height="6" rx="3" fill="#c9d6e6"/><rect x="34" y="100" width="90" height="6" rx="3" fill="#c9d6e6"/>
    <text x="168" y="118" font-size="30">⚡</text></svg>`;
  /* Schéma des trois boutons */
  const person = (x, y, label, c) => `<g><circle cx="${x}" cy="${y}" r="14" fill="${c}"/><rect x="${x - 16}" y="${y + 16}" width="32" height="20" rx="9" fill="${c}"/><text x="${x}" y="${y + 52}" text-anchor="middle" font-size="14" fill="#2f3342">${label}</text></g>`;
  const arrow = (x1, y1, x2, y2, c = "#2f9d68") => `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${c}" stroke-width="4" marker-end="url(#ah)"/>`;
  const defs = `<defs><marker id="ah" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0 0 L10 5 L0 10z" fill="#2f9d68"/></marker></defs>`;
  const SVG_REPLY = `<svg viewBox="0 0 260 160" class="l-svg" aria-hidden="true">${defs}${person(45, 60, "Moi", "#7050bf")}${person(210, 60, "Expéditeur", "#3979b7")}${arrow(72, 72, 180, 72)}</svg>`;
  const SVG_REPLYALL = `<svg viewBox="0 0 260 160" class="l-svg" aria-hidden="true">${defs}${person(45, 60, "Moi", "#7050bf")}<g>${person(170, 18, "", "#3979b7")}<text x="196" y="40" font-size="14" fill="#2f3342">Expéditeur</text></g><g>${person(170, 100, "", "#8fb3d9")}<text x="196" y="122" font-size="14" fill="#2f3342">En copie</text></g>${arrow(72, 66, 142, 40)}${arrow(72, 80, 142, 112)}</svg>`;
  const SVG_FORWARD = `<svg viewBox="0 0 260 160" class="l-svg" aria-hidden="true">${defs}${person(45, 60, "Moi", "#7050bf")}${person(190, 60, "Quelqu'un d'autre", "#2f9d68")}${arrow(72, 72, 160, 72)}<text x="116" y="58" text-anchor="middle" font-size="22">📎</text></svg>`;

  const slides = () => [
    { theme: "cover", title: "L'e-mail", html: `
      <p class="l-lead">Envoyer et recevoir des messages par Internet, en quelques secondes.</p>
      <div class="l-goals">
        <div data-reveal>📬 Lire ses messages</div><div data-reveal>＠ Comprendre une adresse</div><div data-reveal>↩️ Répondre et transférer</div>
        <div data-reveal>✏️ Écrire un message complet</div><div data-reveal>📎 Les pièces jointes</div><div data-reveal>🎣 Repérer les arnaques</div>
      </div>` },

    { title: "Comme une lettre… mais en 3 secondes", html: `
      <div class="l-grid2 l-center"><div>${SVG_POST}<p class="l-cap">Le courrier postal</p></div><div>${SVG_MAIL}<p class="l-cap">Le courrier électronique</p></div></div>
      <table class="l-table"><tbody>
        <tr data-reveal><td>✉️ L'adresse postale</td><td>→</td><td><b>L'adresse e-mail</b></td></tr>
        <tr data-reveal><td>📮 La boîte aux lettres</td><td>→</td><td><b>La boîte de réception</b></td></tr>
        <tr data-reveal><td>🚲 Le facteur (1 à 3 jours)</td><td>→</td><td><b>Internet (quelques secondes)</b></td></tr>
        <tr data-reveal><td>📮 Le timbre</td><td>→</td><td><b>Gratuit</b></td></tr>
      </tbody></table>` },

    { title: "Lire une adresse e-mail", html: `
      <div class="l-addr">
        <div class="seg s1"><b>marie.dupont</b><span data-reveal>l'<u>identifiant</u><br><small>le nom choisi</small></span></div>
        <div class="seg s2"><b>@</b><span data-reveal>l'<u>arobase</u><br><small>se lit « chez »</small></span></div>
        <div class="seg s3"><b>laposte</b><span data-reveal>le <u>fournisseur</u><br><small>gmail, orange, free…</small></span></div>
        <div class="seg s4"><b>.net</b><span data-reveal>l'<u>extension</u><br><small>.fr, .com, .net…</small></span></div>
      </div>
      <div class="l-callout" data-reveal>⌨️ Pour taper <b>@</b> : maintenez <kbd>AltGr</kbd> et appuyez sur <kbd>à 0</kbd></div>
      <ul class="l-rules" data-reveal><li>❌ jamais d'espace</li><li>❌ jamais d'accent</li><li>☝️ une seule @</li><li>🔤 en minuscules</li></ul>` },

    { title: "Correcte ou pas ?", html: `
      <p class="l-lead">Cliquez sur chaque adresse pour révéler la réponse.</p>
      <div class="l-flips">
        ${flip("jean.martin@orange.fr", "✅ Correcte", true)}
        ${flip("marie dupont@gmail.com", "❌ Il y a un espace", false)}
        ${flip("paul.roux.gmail.com", "❌ Il manque l'arobase @", false)}
        ${flip("élodie@free.fr", "❌ Pas d'accent dans une adresse", false)}
      </div>` },

    { title: "La boîte de réception", html: `
      <div class="l-mock">
        <div class="lm-side"><div class="lm-new">✏️ Nouveau message <i class="lm-n">1</i></div><div class="on">📥 Réception <i class="lm-n">2</i></div><div>📤 Envoyés</div><div>🚫 Indésirables</div><div>🗑️ Corbeille</div></div>
        <div class="lm-list"><div class="unread"><b>Médiathèque</b> Votre inscription…</div><div class="unread"><b>Claire</b> Photos du week-end <i class="lm-n">3</i></div><div>Mairie · Programme 📎</div><div>Pharmacie · Commande prête</div></div>
        <div class="lm-read"><b>Votre inscription à l'atelier</b><small>De : Médiathèque · Aujourd'hui 9 h 12</small><p>Bonjour, nous vous confirmons…</p><i class="lm-n">4</i></div>
      </div>
      <ol class="l-legend">
        <li data-reveal><i class="lm-n">1</i> <b>Nouveau message</b> : pour écrire</li>
        <li data-reveal><i class="lm-n">2</i> Les <b>dossiers</b> : où sont rangés les messages</li>
        <li data-reveal><i class="lm-n">3</i> La <b>liste</b> : <b>en gras = pas encore lu</b></li>
        <li data-reveal><i class="lm-n">4</i> La <b>lecture</b> : le message ouvert</li>
      </ol>` },

    { title: "Les dossiers", html: `
      <div class="l-folders">
        <div data-reveal><span>📥</span><b>Réception</b><small>les messages que je reçois</small></div>
        <div data-reveal><span>📤</span><b>Envoyés</b><small>une copie de ce que j'ai envoyé</small></div>
        <div data-reveal><span>📝</span><b>Brouillons</b><small>les messages commencés, pas encore envoyés</small></div>
        <div data-reveal><span>🚫</span><b>Indésirables</b><small>(ou « Spam ») : publicités et arnaques</small></div>
        <div data-reveal><span>🗑️</span><b>Corbeille</b><small>les messages supprimés… on peut encore les récupérer</small></div>
      </div>
      <div class="l-callout" data-reveal>💡 Un message important n'arrive pas ? Regardez dans les <b>Indésirables</b> !</div>` },

    { title: "Écrire un message", html: `
      <div class="l-compose">
        <div class="lc-row" data-reveal><span>À</span><code>mediatheque@valbourg.fr</code><em>la personne à qui j'écris</em></div>
        <div class="lc-row" data-reveal><span>Cc</span><code>claire.dupont@gmail.com</code><em>une <b>copie</b>, visible par tous</em></div>
        <div class="lc-row" data-reveal><span>Cci</span><code>paul.roux@orange.fr</code><em>une copie <b>cachée</b> : les autres ne la voient pas</em></div>
        <div class="lc-row" data-reveal><span>Objet</span><code>Inscription atelier jeudi</code><em>le résumé en quelques mots</em></div>
        <div class="lc-body" data-reveal>Bonjour,<br>Je souhaite m'inscrire à l'atelier de jeudi.<br>Cordialement,<br>Marie<em>le message, poli et clair</em></div>
        <div class="lc-actions" data-reveal><b>📤 Envoyer</b> <span>📎 Joindre un fichier</span></div>
      </div>` },

    { title: "Répondre, répondre à tous, transférer", html: `
      <div class="l-grid3">
        <div class="l-card" data-reveal>${SVG_REPLY}<h3>↩️ Répondre</h3><p>Seulement à la personne qui m'a écrit.</p><small>L'objet devient « RE : … »</small></div>
        <div class="l-card" data-reveal>${SVG_REPLYALL}<h3>↩️↩️ Répondre à tous</h3><p>À l'expéditeur <b>et</b> aux personnes en copie.</p><small>À utiliser avec prudence</small></div>
        <div class="l-card" data-reveal>${SVG_FORWARD}<h3>↪️ Transférer</h3><p>Envoyer le message à <b>quelqu'un d'autre</b>, avec ses pièces jointes.</p><small>L'objet devient « TR : … »</small></div>
      </div>` },

    { title: "Quel bouton choisir ?", html: `
      <div class="l-flips wide">
        ${flip("La médiathèque me demande si je viens jeudi.", "↩️ <b>Répondre</b>")}
        ${flip("Je veux envoyer la facture du plombier à ma fille.", "↪️ <b>Transférer</b>")}
        ${flip("Toute la famille est en copie : je dis à tous que j'apporte le dessert.", "↩️↩️ <b>Répondre à tous</b>")}
      </div>` },

    { title: "Les pièces jointes 📎", html: `
      <div class="l-grid2">
        <div class="l-card big" data-reveal><h3>📎 Joindre</h3><p>J'<b>ajoute</b> un fichier à un message que j'<b>envoie</b>.</p><small>Bouton « Joindre un fichier », puis je choisis le document.</small></div>
        <div class="l-card big" data-reveal><h3>⬇️ Télécharger</h3><p>Je <b>garde</b> sur mon ordinateur un fichier que j'ai <b>reçu</b>.</p><small>Il arrive dans le dossier « Téléchargements ».</small></div>
      </div>
      <ul class="l-list">
        <li data-reveal>✅ Avant d'envoyer, je vérifie que le 📎 est bien là : l'oubli est l'erreur la plus fréquente !</li>
        <li data-reveal>📕 <b>.pdf</b> = un document &nbsp;·&nbsp; ⚙️ <b>.exe</b> = un programme : je ne l'ouvre jamais s'il vient d'un inconnu.</li>
        <li data-reveal>🐘 Les pièces jointes sont souvent limitées à <b>20 ou 25 Mo</b>. Pour une grosse vidéo : un lien de partage.</li>
      </ul>` },

    { title: "Un message bien écrit", html: `
      <div class="l-grid2">
        <div class="l-mail good" data-reveal><div class="lm-h">Objet : Inscription atelier jeudi</div><p>Bonjour,</p><p>Je souhaite m'inscrire à l'atelier de jeudi 14 h.</p><p>Cordialement,<br>Marie Dupont</p><span class="l-tag ok">✅ Clair et poli</span></div>
        <div class="l-mail bad" data-reveal><div class="lm-h">Objet : (vide)</div><p>JE VEUX VENIR JEUDI</p><span class="l-tag ko">❌ Pas d'objet, en MAJUSCULES</span></div>
      </div>
      <ul class="l-rules" data-reveal><li>📝 un objet clair</li><li>👋 Bonjour… Cordialement</li><li>🔇 pas de MAJUSCULES (= crier)</li><li>👀 je relis avant d'envoyer</li></ul>` },

    { title: "Et les faux messages ? 🎣", html: `
      <p class="l-lead">Vous recevrez peut-être un jour un faux message, qui imite une administration ou une banque.</p>
      <div class="l-callout" data-reveal>🫶 <b>Pas d'inquiétude :</b> lire un message est sans danger. Nous consacrons une séance entière à ce sujet, avec une méthode simple en 5 questions.</div>` },

    { title: "Quiz express", html: `
      <div class="l-flips wide">
        ${flip("Un message en gras dans la liste, c'est…", "…un message <b>pas encore lu</b>")}
        ${flip("Pour taper @ sur le clavier…", "<kbd>AltGr</kbd> + <kbd>à</kbd>")}
        ${flip("Je veux écrire à 20 voisins sans montrer leurs adresses…", "Je les mets en <b>Cci</b>")}
        ${flip("Un faux message de remboursement…", "Je ne clique pas : <b>🚫 Indésirable</b>")}
      </div>` },

    { theme: "cover", title: "À vous de jouer !", html: `
      <ol class="l-levels">
        <li>📬 Lire ses e-mails</li><li>＠ L'adresse e-mail</li><li>↩️ Répondre et transférer</li><li>✏️ Écrire un e-mail complet</li>
        <li>📎 Les pièces jointes</li><li>🎣 Repérer un e-mail suspect</li><li>🏆 Le défi de la boîte mail</li>
      </ol>
      <div class="l-actions">
        <button type="button" class="l-btn" data-lesson-act="demo">👥 Faire le niveau 1 ensemble</button>
        <button type="button" class="l-btn alt" data-lesson-act="assign">🚀 Donner le chapitre au groupe</button>
      </div>` }
  ];


  /* =========================================================
     LEÇON 2 — Déjouer les e-mails frauduleux
     Public souvent inquiet : on rassure d'abord, puis une méthode
     unique (5 questions), des exemples concrets, et un plan
     d'action calme si l'on s'est fait piéger.
     ========================================================= */
  const url = (parts) => `<div class="l-url">${parts.map(([t, cls, lab]) => `<span class="u ${cls}"><b>${t}</b>${lab ? `<small>${lab}</small>` : ""}</span>`).join("")}</div>`;
  const fraudSlides = () => [
    { theme: "cover", title: "Déjouer les e-mails frauduleux", html: `
      <p class="l-lead">Ne plus avoir peur de sa boîte mail : reconnaître un faux message, calmement.</p>
      <div class="l-goals">
        <div data-reveal>🫶 Ce qui est dangereux… et ce qui ne l'est pas</div><div data-reveal>🧭 Une méthode en 5 questions</div><div data-reveal>🔍 Lire une adresse et un lien</div>
        <div data-reveal>🎣 Les arnaques les plus fréquentes</div><div data-reveal>🛟 Les 3 gestes dans le doute</div><div data-reveal>🆘 Que faire si j'ai cliqué</div>
      </div>` },

    { title: "D'abord, rassurez-vous", html: `
      <div class="l-grid2">
        <div class="l-safe" data-reveal><h3>✅ Sans danger</h3><ul><li>Recevoir un faux message</li><li>L'<b>ouvrir</b> et le <b>lire</b></li><li>Le supprimer</li><li>Le mettre dans les indésirables</li></ul></div>
        <div class="l-risk" data-reveal><h3>⚠️ Le danger vient de ce qu'on vous <u>demande</u></h3><ul><li>Cliquer sur le lien</li><li>Ouvrir une pièce jointe inattendue</li><li>Donner un code, un mot de passe, sa carte</li><li>Appeler le numéro indiqué</li><li>Payer</li></ul></div>
      </div>
      <div class="l-callout" data-reveal>💌 Recevoir un faux message ne veut pas dire que vous avez fait une erreur : les escrocs l'envoient <b>au hasard, à des milliers d'adresses</b>.</div>` },

    { title: "Le faux agent à la porte 🚪", html: `
      <div class="l-door">
        <div class="l-bubble">🔔 « Bonjour, je viens de la compagnie d'électricité. Il faut vérifier votre compteur <b>tout de suite</b>, sinon on vous coupe le courant <b>ce soir</b> ! »</div>
        <div class="l-card" data-reveal><h3>Que faites-vous ?</h3><p>Je <b>n'ouvre pas</b>. J'appelle <b>moi-même</b> la compagnie, au numéro que je connais.</p></div>
        <div class="l-card big" data-reveal><h3>Un faux e-mail, c'est pareil</h3><p>Un <b>costume</b> (un nom connu), de l'<b>urgence</b>, et une <b>demande</b>.<br>Même réflexe : je ne clique pas, je vérifie par moi-même.</p></div>
      </div>
      <div class="l-callout" data-reveal>🫶 <b>Vous avez toujours le droit de ne rien faire.</b> Un vrai organisme ne vous en voudra jamais d'avoir vérifié.</div>` },

    { title: "La méthode des 5 questions", html: `
      <ol class="l-five">
        <li data-reveal><span>🔍</span><b>Qui m'écrit vraiment ?</b><small>Je regarde l'adresse, pas seulement le nom.</small></li>
        <li data-reveal><span>🤔</span><b>Est-ce que je l'attendais ?</b><small>Un colis, un remboursement… que je n'ai pas demandé ?</small></li>
        <li data-reveal><span>⏰</span><b>Me met-on la pression ?</b><small>Urgence, menace, cadeau trop beau.</small></li>
        <li data-reveal><span>🔑</span><b>Que me demande-t-on ?</b><small>Un code, une carte, un mot de passe, un paiement ?</small></li>
        <li data-reveal><span>🔗</span><b>Où mène le lien ?</b><small>Je survole sans cliquer, je lis le vrai nom du site.</small></li>
      </ol>
      <div class="l-callout" data-reveal>🚩 Si <b>une seule</b> réponse vous inquiète : ne cliquez pas, vérifiez par vous-même.</div>` },

    { title: "1 · Qui m'écrit vraiment ? 🔍", theme: "dense", html: `
      <div class="l-grid2">
        <div class="l-card" data-reveal><h3>🎭 Le nom affiché = un costume</h3><p>N'importe qui peut écrire « Assurance Maladie » ou « Impôts » comme nom d'expéditeur.</p>
          <div class="l-from">De : <b>Assurance Maladie</b> ▾</div></div>
        <div class="l-card big" data-reveal><h3>🪪 L'adresse = la carte d'identité</h3><p>Je clique sur le nom (ou je passe la souris dessus) pour voir l'adresse complète.</p>
          <div class="l-from">&lt;remboursement@<mark>ameli-securite.info</mark>&gt;</div></div>
      </div>
      <p class="l-lead" data-reveal>Je regarde <b>ce qui suit le @</b> :</p>
      <div class="l-flips">
        ${flip("…@impots.gouv.fr", "✅ « .gouv.fr » est réservé à l'État français", true)}
        ${flip("…@impots-gouv.info", "❌ Un tiret et « .info » : ce n'est pas l'État", false)}
        ${flip("impots.service@gmail.com", "❌ Une administration n'écrit jamais depuis Gmail, Hotmail ou Orange", false)}
        ${flip("…@ameli-securite.info", "❌ Le vrai site de l'Assurance Maladie est ameli.fr", false)}
      </div>
      <p class="l-note" data-reveal>Une adresse correcte ne suffit pas toujours : on se pose aussi les 4 autres questions.</p>` },

    { title: "2 · Je l'attendais ? 3 · Me presse-t-on ?", html: `
      <div class="l-card" data-reveal><h3>🤔 Est-ce que je m'attendais à ce message ?</h3>
        <p>Un <b>colis</b>… alors que je n'ai rien commandé ? Un <b>remboursement</b>… que je n'ai pas demandé ? Un <b>gain</b>… à un jeu auquel je n'ai pas joué ?</p></div>
      <div class="l-levers">
        <div data-reveal><span>😨</span><b>La peur</b><small>amende, compte bloqué, plainte, coupure</small></div>
        <div data-reveal><span>⏰</span><b>L'urgence</b><small>« sous 24 h », « dernier avis », « avant minuit »</small></div>
        <div data-reveal><span>🎁</span><b>L'appât</b><small>remboursement, cadeau, gain inattendu</small></div>
        <div data-reveal><span>💔</span><b>L'émotion</b><small>un proche en difficulté qui a besoin d'argent</small></div>
      </div>
      <div class="l-callout" data-reveal>🧠 La pression sert à vous <b>empêcher de réfléchir</b>. Un vrai organisme vous laisse toujours le temps.</div>` },

    { title: "4 · Que me demande-t-on ? 🔑", theme: "never", html: `
      <div class="l-never">
        <h3>Par e-mail, un vrai organisme ne vous demande <u>JAMAIS</u> :</h3>
        <ul>
          <li data-reveal>🔑 votre <b>mot de passe</b></li>
          <li data-reveal>📱 le <b>code reçu par SMS</b></li>
          <li data-reveal>💳 votre <b>numéro de carte bancaire</b> (ni les 3 chiffres au dos)</li>
          <li data-reveal>💶 de <b>payer</b> pour recevoir ou débloquer quelque chose</li>
          <li data-reveal>🖥️ d'<b>installer un programme</b></li>
        </ul>
        <p data-reveal>Ni votre banque, ni les impôts, ni l'Assurance Maladie, ni La Poste, ni la police.</p>
      </div>` },

    { title: "5 · Où mène le lien ? 🔗", html: `
      <div class="l-card" data-reveal><h3>① Je survole, sans cliquer</h3><p>Je pose la souris sur le lien : sa <b>vraie adresse</b> s'affiche en bas de l'écran.</p></div>
      <div class="l-card" data-reveal><h3>② Je lis le vrai nom du site : juste avant le premier « / »</h3>
        ${url([["https://", "dim", ""], ["www.", "dim", ""], ["impots.gouv.fr", "ok", "le vrai nom ✅"], ["/accueil", "dim", "la page"]])}
        ${url([["https://", "dim", ""], ["impots.gouv.fr.", "mask", "un déguisement !"], ["remboursement-dossier.com", "ko", "le vrai nom ❌"], ["/accueil", "dim", ""]])}</div>
      <div class="l-callout" data-reveal>👉 Ce qui compte, c'est <b>la fin du nom</b>, juste avant le premier « / ». Le début peut être un déguisement.</div>` },

    { title: "Lien officiel ou piège ?", theme: "dense", html: `
      <div class="l-flips">
        ${flip("https://www.ameli.fr/assure", "✅ Le vrai nom est ameli.fr", true)}
        ${flip("http://ameli-carte-vitale.info/renouveler", "❌ Le vrai nom est ameli-carte-vitale.info", false)}
        ${flip("https://www.antai.gouv.fr", "✅ Site officiel des amendes (.gouv.fr)", true)}
        ${flip("https://antai-paiement-amende.com", "❌ Faux : le vrai est antai.gouv.fr", false)}
        ${flip("https://impots.gouv.fr.remboursement-rapide.com", "❌ Le vrai nom est remboursement-rapide.com", false)}
        ${flip("https://www.impots-gouv.fr/connexion", "❌ Un tiret à la place du point : ce n'est pas impots.gouv.fr", false)}
      </div>` },

    { title: "Le cadenas 🔒 ne suffit pas", html: `
      <div class="l-grid2">
        <div class="l-card" data-reveal><h3>🔒 https / cadenas, cela veut dire…</h3><p>La connexion est <b>chiffrée</b> : personne ne peut espionner ce que vous tapez sur le chemin.</p></div>
        <div class="l-card big" data-reveal><h3>…mais PAS que le site est honnête</h3><p>Les sites d'arnaque ont <b>aussi</b> un cadenas. Un escroc peut chiffrer la connexion vers <b>son</b> faux site.</p></div>
      </div>
      <div class="l-callout" data-reveal>✅ Je vérifie toujours <b>le nom du site</b> (question 5).</div>` },

    { title: "Vrai ou faux ?", html: `
      <div class="l-grid2">
        <div class="l-mail good"><div class="lm-h">De : Impôts &lt;ne-pas-repondre@impots.gouv.fr&gt;<br>Objet : Votre avis d'impôt est disponible</div>
          <p>Bonjour Madame Martin,</p><p>Votre avis d'impôt est disponible dans votre espace particulier. Connectez-vous sur impots.gouv.fr pour le consulter.</p>
          <div class="l-badges"><span data-reveal class="l-tag ok">✅ adresse en .gouv.fr</span><span data-reveal class="l-tag ok">✅ m'appelle par mon nom</span><span data-reveal class="l-tag ok">✅ aucune urgence</span><span data-reveal class="l-tag ok">✅ ne demande rien de secret</span></div></div>
        <div class="l-mail bad"><div class="lm-h">De : Impots.gouv &lt;remboursement@impots-gouv-fr.info&gt;<br>Objet : Remboursement de 248,60 € – DERNIER DÉLAI</div>
          <p>Cher contribuable,</p><p>Vous avez droit à un remboursement. Saisissez votre carte bancaire <b>sous 48 h</b>, sinon il sera annulé.</p><p><u>Recevoir mon remboursement</u></p>
          <div class="l-badges"><span data-reveal class="l-tag ko">🚩 adresse en .info</span><span data-reveal class="l-tag ko">🚩 « Cher contribuable »</span><span data-reveal class="l-tag ko">🚩 urgence 48 h</span><span data-reveal class="l-tag ko">🚩 demande la carte bancaire</span></div></div>
      </div>
      <p class="l-note" data-reveal>Même devant un vrai message, on peut toujours préférer aller soi-même sur le site plutôt que cliquer.</p>` },

    { title: "Les arnaques les plus fréquentes", html: `
      <div class="l-scams">
        <div data-reveal><span>📦</span><b>Le faux colis</b><small>« Frais de 1,99 € à régler »</small><em>→ Je suis mon colis sur le site du transporteur, avec le numéro de ma commande.</em></div>
        <div data-reveal><span>💳</span><b>La fausse carte Vitale</b><small>« Votre carte expire, commandez-la »</small><em>→ Je vais moi-même sur ameli.fr ou dans l'application.</em></div>
        <div data-reveal><span>💶</span><b>Le faux remboursement</b><small>impôts, énergie, Assurance Maladie</small><em>→ Je vérifie dans mon espace personnel, sur le site officiel.</em></div>
        <div data-reveal><span>🚓</span><b>La fausse amende</b><small>« Majoration sous 24 h »</small><em>→ Le seul site officiel : antai.gouv.fr</em></div>
        <div data-reveal><span>🏦</span><b>Le faux « compte bloqué »</b><small>« Confirmez votre identité »</small><em>→ J'appelle mon conseiller, au numéro que je connais.</em></div>
        <div data-reveal><span>🎓</span><b>Le faux compte formation</b><small>« Vos droits expirent demain »</small><em>→ Le vrai site : moncompteformation.gouv.fr. Aucune urgence.</em></div>
        <div data-reveal><span>📹</span><b>Le chantage</b><small>« On vous a filmé, payez »</small><em>→ C'est un mensonge envoyé à des milliers de personnes. Je ne paie pas, je ne réponds pas, je supprime.</em></div>
      </div>` },

    { title: "Dans le doute : 3 gestes 🛟", html: `
      <ol class="l-gestures">
        <li data-reveal><span>✋</span><div><b>Je ne clique pas.</b><small>Ni sur le lien, ni sur la pièce jointe, ni sur « répondre ».</small></div></li>
        <li data-reveal><span>🔎</span><div><b>Je vérifie par moi-même.</b><small>Je tape moi-même l'adresse du site officiel, j'ouvre l'application, ou j'appelle le numéro que je connais (au dos de ma carte, sur un courrier reçu).</small></div></li>
        <li data-reveal><span>🚫</span><div><b>Je range.</b><small>« Indésirable » : les suivants iront directement au bon endroit. Je peux aussi le signaler sur signal-spam.fr</small></div></li>
      </ol>
      <div class="l-callout" data-reveal>🤝 Et je peux toujours <b>demander</b> à un proche ou au médiateur numérique de la médiathèque.</div>` },

    { title: "Et si j'ai cliqué ? 🆘", html: `
      <p class="l-lead">Pas de panique. Se faire avoir n'est pas une honte : ces escrocs sont des professionnels. On agit calmement, et vite.</p>
      <table class="l-plan"><tbody>
        <tr data-reveal><td>J'ai cliqué, mais je n'ai <b>rien rempli</b></td><td>Je ferme la page. En général, ce n'est pas grave. Je garde mon ordinateur à jour.</td></tr>
        <tr data-reveal><td>J'ai tapé mon <b>mot de passe</b></td><td>Je le change tout de suite, sur le vrai site (et partout où j'utilise le même).</td></tr>
        <tr data-reveal><td>J'ai donné ma <b>carte bancaire</b> ou un <b>code reçu par SMS</b></td><td>J'appelle ma banque <b>immédiatement</b> pour bloquer la carte (numéro au dos de la carte).</td></tr>
        <tr data-reveal><td>J'ai <b>perdu de l'argent</b></td><td>Je préviens ma banque et je porte plainte (commissariat ou gendarmerie).</td></tr>
      </tbody></table>
      <div class="l-callout" data-reveal>🆘 Aide gratuite et conseils : <b>cybermalveillance.gouv.fr</b> · Signaler un e-mail : <b>signal-spam.fr</b> · Un SMS : le <b>33700</b></div>` },

    { title: "Quiz express", html: `
      <div class="l-flips wide">
        ${flip("Ouvrir et lire un faux message, c'est dangereux ?", "Non. Le danger, c'est cliquer, ouvrir une pièce jointe inattendue ou donner des informations.")}
        ${flip("Ma banque m'écrit pour me demander le code reçu par SMS…", "C'est une arnaque : ce code ne se donne <b>jamais</b>, à personne.")}
        ${flip("Le lien est https://impots.gouv.fr.aide-rapide.net : c'est le site des impôts ?", "Non : le vrai nom, juste avant le « / », est <b>aide-rapide.net</b>.")}
        ${flip("J'ai donné ma carte bancaire sur un faux site…", "J'appelle ma banque <b>tout de suite</b> pour bloquer la carte.")}
      </div>` },

    { theme: "cover", title: "À vous de jouer !", html: `
      <ol class="l-five small"><li><span>🔍</span><b>Qui m'écrit vraiment ?</b></li><li><span>🤔</span><b>Est-ce que je l'attendais ?</b></li><li><span>⏰</span><b>Me met-on la pression ?</b></li><li><span>🔑</span><b>Que me demande-t-on ?</b></li><li><span>🔗</span><b>Où mène le lien ?</b></li></ol>
      <div class="l-actions">
        <button type="button" class="l-btn" data-lesson-act="demo" data-type="mail_fraud">👥 Faire l'enquête ensemble</button>
        <button type="button" class="l-btn alt" data-lesson-act="assign">🚀 Donner le chapitre au groupe</button>
      </div>` }
  ];

  AN.chapters.register({
    id: "email", title: "E-mail", icon: "📧", color: "#3979b7",
    summary: "Lire, écrire, répondre, transférer, joindre un fichier et déjouer les arnaques.",
    duration: "≈ 5 séances", parcours: "p_email", demo: "mail_read", slides,
    lessons: [
      { id: "base", title: "Leçon 1 : la messagerie", icon: "📽", slides },
      { id: "fraude", title: "Leçon 2 : déjouer les arnaques", icon: "🛡️", badge: "Déjouer les arnaques", slides: fraudSlides }
    ]
  });

  /* Chapitres du programme annuel, à venir (affichés grisés côté formateur). */
  [
    { id: "navigateurs", title: "Navigateurs et recherche", icon: "🧭", summary: "Navigateur ou moteur de recherche, barre d'adresse, onglets, lire une adresse web." },
    { id: "wifi", title: "Wi-Fi et réseaux", icon: "🛜", summary: "🛜 Wi-Fi ou 📶 4G/5G, se connecter, Wi-Fi public, petites pannes." },
    { id: "comptes", title: "Comptes et mots de passe", icon: "🔑", summary: "Créer un compte, un mot de passe solide, la double authentification." },
    { id: "fichiers", title: "Fichiers et dossiers", icon: "🗂️", summary: "Extensions, bien nommer, ranger, retrouver un téléchargement." },
    { id: "peripheriques", title: "Périphériques", icon: "🖨️", summary: "Souris, clavier, imprimante, clé USB, écran." }
  ].forEach(c => AN.chapters.register({ ...c, soon: true }));
})(window.AN);

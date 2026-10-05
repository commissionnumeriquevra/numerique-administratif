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
  /* ---------- outils d'illustration pour la projection ---------- */
  const pin = (g, ok) => `<i class="pin ${ok ? "ok" : ""}" data-reveal="${g}">${g}</i>`;
  const hl = (g, html, ok) => `<span class="hl ${ok ? "ok" : ""}" data-reveal="${g}">${html}</span>`;
  const notes = items => `<ol class="mm-notes">${items.map(([g, t, x, ok]) => `<li data-reveal="${g}" class="${ok ? "ok" : ""}"><i class="pin ${ok ? "ok" : ""}">${g}</i><div><b>${t}</b>${x ? `<small>${x}</small>` : ""}</div></li>`).join("")}</ol>`;
  const mock = ({ av, from, subject, date = "Aujourd'hui 08:14", body, status }) => `<div class="mm">
      <div class="mm-bar"><span>✉️ Ma messagerie</span><i></i><i></i><i></i></div>
      <div class="mm-subject">${subject}</div>
      <div class="mm-head"><span class="mm-av">${av}</span><div class="mm-who">${from}<div class="mm-to">À : moi</div></div><span class="mm-date">${date}</span></div>
      <div class="mm-body">${body}</div>
      ${status !== undefined ? `<div class="mm-status">${status || "&nbsp;"}</div>` : ""}</div>`;
  const btn = t => `<span class="mm-btn">${t}</span>`;
  const addr = (name, email) => `<b>${name}</b> <span class="mm-addr">&lt;${email}&gt;</span>`;
  const VOTES = 9;
  /** Un message pour le jeu « Vrai ou arnaque ? » (données, pas une diapositive). */
  const V = (context, mockHTML, fake, items, ctxPin) => ({ context, mockHTML, fake, items, ctxPin });

  const SVG_HOOK = `<svg viewBox="0 0 360 210" class="l-svg tall" aria-hidden="true">
      <rect x="0" y="118" width="360" height="92" fill="#d6ebfa"/>
      <path d="M0 118 Q30 110 60 118 T120 118 T180 118 T240 118 T300 118 T360 118" fill="none" stroke="#3979b7" stroke-width="3"/>
      <line x1="180" y1="0" x2="180" y2="122" stroke="#6c7280" stroke-width="2"/>
      <path d="M180 122 v26 a11 11 0 0 1 -22 0 v-6" fill="none" stroke="#6c7280" stroke-width="4" stroke-linecap="round"/>
      <rect x="150" y="150" width="40" height="27" rx="4" fill="#fff" stroke="#d95f56" stroke-width="3"/><path d="M150 152 L170 166 L190 152" fill="none" stroke="#d95f56" stroke-width="3"/>
      <text x="22" y="170" font-size="30">🐟</text><text x="80" y="198" font-size="30">🐟</text><text x="250" y="168" font-size="30">🐟</text><text x="300" y="200" font-size="30">🐟</text><text x="205" y="204" font-size="30">🐟</text></svg>`;
  const SVG_DOOR = `<svg viewBox="0 0 260 200" class="l-svg tall" aria-hidden="true">
      <rect x="20" y="20" width="110" height="175" rx="6" fill="#b07a4a" stroke="#7a5230" stroke-width="4"/><circle cx="112" cy="110" r="6" fill="#ffd76a"/>
      <rect x="40" y="40" width="70" height="55" rx="4" fill="#c99366"/><rect x="40" y="110" width="70" height="70" rx="4" fill="#c99366"/>
      <circle cx="200" cy="70" r="20" fill="#6c7280"/><rect x="172" y="94" width="56" height="90" rx="14" fill="#3b4654"/>
      <rect x="178" y="108" width="44" height="20" rx="3" fill="#fff" stroke="#d95f56" stroke-width="2"/><text x="200" y="122" font-size="10" font-weight="700" text-anchor="middle" fill="#d95f56">BADGE</text>
      <text x="236" y="50" font-size="22">⏰</text></svg>`;

  const fraudSlides = () => [
    { theme: "cover", title: "Déjouer les e-mails frauduleux", html: `
      <p class="l-lead">Ne plus avoir peur de sa boîte mail : reconnaître un faux message, calmement, ensemble.</p>
      <div class="l-goals">
        <div data-reveal>🫶 Ce qui est dangereux… et ce qui ne l'est pas</div><div data-reveal>🧭 Une méthode en 5 questions</div><div data-reveal>🕵️ Une enquête ensemble</div>
        <div data-reveal>🙋 Un jeu : vrai ou arnaque ?</div><div data-reveal>🛟 Les 3 gestes dans le doute</div><div data-reveal>🆘 Que faire si j'ai cliqué</div>
      </div>` },

    { title: "L'hameçonnage, c'est quoi ? 🎣", html: `
      <div class="l-grid2 l-mid"><div>${SVG_HOOK}</div>
        <ul class="l-list">
          <li data-reveal>🎣 L'escroc lance un <b>appât</b> (un faux message)… <b>à des milliers de personnes</b>, au hasard.</li>
          <li data-reveal>🐟 Il espère qu'<b>une seule</b> morde à l'hameçon.</li>
          <li data-reveal>🎯 Vous n'êtes <b>pas visé personnellement</b> : votre adresse est dans une liste, comme celle de tout le monde.</li>
          <li data-reveal>🧲 Son but : vous faire <b>cliquer</b>, <b>payer</b> ou <b>donner un code</b>.</li>
        </ul></div>
      <p class="l-note" data-reveal>En anglais, on dit « phishing » (de « fishing », la pêche).</p>` },

    { title: "D'abord, rassurez-vous", html: `
      <div class="l-grid2">
        <div class="l-safe" data-reveal><h3>✅ Sans danger</h3><ul><li>Recevoir un faux message</li><li>L'<b>ouvrir</b> et le <b>lire</b></li><li>Le supprimer</li><li>Le mettre dans les indésirables</li></ul></div>
        <div class="l-risk" data-reveal><h3>⚠️ Le danger vient de ce qu'on vous <u>demande</u></h3><ul><li>Cliquer sur le lien</li><li>Ouvrir une pièce jointe inattendue</li><li>Donner un code, un mot de passe, sa carte</li><li>Appeler le numéro indiqué</li><li>Payer</li></ul></div>
      </div>
      <div class="l-callout" data-reveal>💌 Recevoir un faux message ne veut pas dire que vous avez fait une erreur. Tout le monde en reçoit, même les informaticiens.</div>` },

    { title: "Le faux agent à la porte 🚪", html: `
      <div class="l-grid2 l-mid"><div>${SVG_DOOR}</div>
        <div class="l-door">
          <div class="l-bubble">🔔 « Bonjour, je viens de la compagnie d'électricité. Il faut vérifier votre compteur <b>tout de suite</b>, sinon on coupe le courant <b>ce soir</b> ! »</div>
          <div class="l-card" data-reveal><h3>Que faites-vous ?</h3><p>Je <b>n'ouvre pas</b>. J'appelle <b>moi-même</b> la compagnie, au numéro que je connais.</p></div>
        </div></div>
      <div class="l-callout" data-reveal>📧 Un faux e-mail, c'est pareil : un <b>costume</b> (un nom connu), de l'<b>urgence</b>, une <b>demande</b>. Même réflexe : je ne clique pas, je vérifie par moi-même. <b>J'ai toujours le droit de ne rien faire.</b></div>` },

    { title: "La méthode des 5 questions", html: `
      <ol class="l-five">
        <li data-reveal><span>🔍</span><b>Qui m'écrit vraiment ?</b><small>Je regarde l'adresse, pas seulement le nom.</small></li>
        <li data-reveal><span>🤔</span><b>Est-ce que je l'attendais ?</b><small>Un colis, un remboursement… que je n'ai pas demandé ?</small></li>
        <li data-reveal><span>⏰</span><b>Me met-on la pression ?</b><small>Urgence, menace, cadeau trop beau.</small></li>
        <li data-reveal><span>🔑</span><b>Que me demande-t-on ?</b><small>Un code, une carte, un mot de passe, un paiement ?</small></li>
        <li data-reveal><span>🔗</span><b>Où mène le lien ?</b><small>Je survole sans cliquer, je lis le vrai nom du site.</small></li>
      </ol>
      <div class="l-callout" data-reveal>🚩 Si <b>une seule</b> réponse vous inquiète : ne cliquez pas, vérifiez par vous-même.</div>` },

    { title: "1 · Qui m'écrit vraiment ? 🔍", html: `
      <div class="l-grid2 l-top">
        <div>${mock({ av: "AM", subject: "Remboursement en attente", from: `<b>Assurance Maladie</b> <span class="mm-cursor">👆</span> <span class="mm-addr reveal-addr" data-reveal="1">&lt;remboursement@<mark>ameli-securite.info</mark>&gt;</span>`, body: "<p>Cher assuré, un remboursement de 87,40 € est en attente…</p>" })}
          <p class="l-cap">Sur l'ordinateur : je clique sur le nom de l'expéditeur.</p></div>
        <div class="l-phone-wrap">
          <div class="l-phone"><div class="l-phone-notch"></div><div class="lp-head">‹ Boîte de réception</div><div class="lp-from"><span class="mm-av">AM</span><div><b>Assurance Maladie</b> <span class="lp-tap">👆</span><small>à moi</small></div></div>
            <div class="lp-pop" data-reveal="2"><b>Assurance Maladie</b><br>remboursement@<mark>ameli-securite.info</mark></div><div class="lp-lines"><i></i><i></i><i></i></div></div>
          <p class="l-cap">Sur le téléphone : je touche le nom.</p></div>
      </div>
      ${notes([[1, "Le nom affiché est un costume", "N'importe qui peut écrire « Assurance Maladie »."], [2, "L'adresse est la carte d'identité", "Elle apparaît quand on clique, ou qu'on touche le nom."], [3, "Je lis la fin, après le @", "ameli-securite.info n'est pas ameli.fr : c'est un faux."]])}` },

    { title: "Une vraie adresse… ou un costume ?", theme: "dense", html: `
      <p class="l-lead">Cliquez sur chaque adresse pour révéler la réponse.</p>
      <div class="l-flips">
        ${flip("…@impots.gouv.fr", "✅ « .gouv.fr » est réservé à l'État français", true)}
        ${flip("…@impots-gouv.info", "❌ Un tiret et « .info » : ce n'est pas l'État", false)}
        ${flip("impots.service@gmail.com", "❌ Une administration n'écrit jamais depuis Gmail, Hotmail ou Orange", false)}
        ${flip("…@ameli-securite.info", "❌ Le vrai site de l'Assurance Maladie est ameli.fr", false)}
        ${flip("…@banque-valbourg.fr (comme sur mes courriers)", "✅ C'est l'adresse habituelle de ma banque", true)}
        ${flip("…@banque-valbourg.fr.securite-client.com", "❌ Ce qui compte, c'est la FIN : securite-client.com", false)}
      </div>` },

    { title: "2 · Est-ce que je l'attendais ? 🤔", html: `
      <div class="l-thinks">
        <div data-reveal><div class="l-think-mail">📦 « Votre colis est bloqué »</div><div class="l-think">🤔 Un colis ?<br><b>Je n'ai rien commandé.</b></div></div>
        <div data-reveal><div class="l-think-mail">💶 « Vous avez droit à un remboursement »</div><div class="l-think">🤔 Un remboursement ?<br><b>Je n'ai rien demandé.</b></div></div>
        <div data-reveal><div class="l-think-mail">🎁 « Vous avez gagné un téléphone »</div><div class="l-think">🤔 Gagné ?<br><b>Je n'ai joué à aucun jeu.</b></div></div>
      </div>
      <div class="l-callout" data-reveal>👉 Un message que je <b>n'attendais pas</b>, qui m'annonce un problème ou une bonne surprise : je ralentis et je regarde de plus près.</div>` },

    { title: "3 · Me met-on la pression ? ⏰", theme: "dense", html: `
      <div class="mm mm-list">
        <div class="mm-bar"><span>📥 Boîte de réception</span><i></i><i></i><i></i></div>
        <div class="mm-row"><b>Centre des amendes</b><span>${hl(1, "⚠ DERNIER AVIS")} avant ${hl(1, "majoration")}</span></div>
        <div class="mm-row"><b>Sécurité bancaire</b><span>Votre compte sera ${hl(2, "bloqué dans 24 h")}</span></div>
        <div class="mm-row"><b>Service Clients</b><span>${hl(3, "Félicitations ! Vous avez gagné")} un smartphone</span></div>
        <div class="mm-row"><b>Paul</b><span>${hl(4, "C'est urgent, j'ai besoin d'aide")}, réponds vite</span></div>
        <div class="mm-row calm"><b>Médiathèque</b><span>Vos livres sont à rendre samedi</span></div>
      </div>
      <div class="l-levers">
        <div data-reveal="1"><span>😨</span><b>La peur</b><small>amende, plainte, coupure</small></div>
        <div data-reveal="2"><span>⏰</span><b>L'urgence</b><small>« sous 24 h », « dernier avis »</small></div>
        <div data-reveal="3"><span>🎁</span><b>L'appât</b><small>gain, cadeau, remboursement</small></div>
        <div data-reveal="4"><span>💔</span><b>L'émotion</b><small>un proche en difficulté</small></div>
      </div>
      <div class="l-callout" data-reveal="5">🧠 La pression sert à vous <b>empêcher de réfléchir</b>. Un vrai organisme vous laisse toujours le temps.</div>` },

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

    { title: "À quoi ressemble la page piège ?", html: `
      <div class="l-grid-wide">
        <div class="bw">
          <div class="bw-bar"><span class="bw-dots"><i></i><i></i><i></i></span><span class="bw-url">${hl(2, "🔒")} https://${hl(1, "ameli-remboursement-securise.info")}/carte</span></div>
          <div class="bw-page">
            <div class="bw-logo">${hl(3, "Assurance Maladie")}</div>
            <p>Pour recevoir votre remboursement de <b>87,40 €</b>, renseignez votre carte bancaire.</p>
            ${hl(4, `<span class="bw-form"><span>Numéro de carte</span><span>Date d'expiration</span><span>Les 3 chiffres au dos</span><span>Code reçu par SMS</span></span>`)}
            <div class="bw-timer">${hl(5, "⏳ Il vous reste 09:59")}</div>
            <span class="mm-btn">Valider</span>
          </div>
        </div>
        ${notes([[1, "Le nom du site est faux", "ameli-remboursement-securise.info n'est pas ameli.fr."], [2, "Le cadenas 🔒 ne prouve rien", "Il veut dire « connexion chiffrée », pas « site honnête »."], [3, "Le logo et les couleurs sont copiés", "Copier une image, c'est très facile."], [4, "On demande la carte ET le code SMS", "Avec les deux, l'escroc paie à votre place."], [5, "Un compte à rebours", "Pour vous presser."]])}
      </div>` },

    { title: "5 · Où mène le lien ? 🔗", theme: "dense", html: `
      <div class="l-grid2 l-top">
        <div>${mock({ av: "SC", subject: "Votre colis est en attente", from: addr("Suivi Colis", "notification@suivi-colis-express.top"), body: `<p>Réglez les frais de 1,99 € pour recevoir votre colis.</p><p class="mm-btn-wrap">${btn("Payer 1,99 €")}<span class="mm-cursor big">🖱️</span></p>`, status: `<span data-reveal="1" class="mm-status-url">https://<mark>suivi-colis-express.top</mark>/paiement</span> <span class="mm-arrow" data-reveal="1">👈 ici, en bas à gauche</span>` })}
          <p class="l-cap">Sur l'ordinateur : je pose la souris sur le bouton, <b>sans cliquer</b>.</p></div>
        <div class="l-phone-wrap">
          <div class="l-phone"><div class="l-phone-notch"></div><div class="lp-head">‹ Suivi Colis</div><div class="lp-lines"><i></i><i></i></div><div class="lp-btn">Payer 1,99 € <span class="lp-tap">👆</span></div>
            <div class="lp-pop" data-reveal="2">https://<mark>suivi-colis-express.top</mark>/paiement<div class="lp-pop-actions"><span>Ouvrir</span><span>Copier le lien</span></div></div></div>
          <p class="l-cap">Sur le téléphone : j'appuie <b>longtemps</b> sur le lien, sans lâcher.</p></div>
      </div>
      ${notes([[1, "La vraie adresse s'affiche en bas", "Sur l'ordinateur, en bas à gauche de la fenêtre."], [2, "Sur téléphone : un appui long", "Un aperçu montre l'adresse. Je n'appuie pas sur « Ouvrir »."], [3, "Je lis le vrai nom du site", "Ici : suivi-colis-express.top. Ce n'est le site d'aucun transporteur."]])}` },

    { title: "Lire le vrai nom d'un site", html: `
      <div class="l-card"><h3>Le vrai nom est <u>juste avant le premier « / »</u></h3>
        ${url([["https://", "dim", ""], ["www.", "dim", ""], ["impots.gouv.fr", "ok", "le vrai nom ✅"], ["/accueil", "dim", "la page"]])}
        <div data-reveal>${url([["https://", "dim", ""], ["impots.gouv.fr.", "mask", "un déguisement !"], ["remboursement-dossier.com", "ko", "le vrai nom ❌"], ["/accueil", "dim", ""]])}</div>
        <div data-reveal>${url([["https://", "dim", ""], ["www.", "dim", ""], ["impots-gouv.fr", "ko", "un tiret au lieu du point ❌"], ["/connexion", "dim", ""]])}</div></div>
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

    { theme: "cover", title: "🕵️ Enquête collective", html: `
      <p class="l-lead">On examine un message <b>tous ensemble</b>, question par question.</p>
      <div class="l-callout" data-reveal>💬 Interrompez-moi : toutes les questions sont bonnes à poser !</div>` },

    { title: "L'enquête : ce message de ma banque", theme: "vote dense", html: `
      <div class="l-vote"><div class="l-vote-main"><div class="l-ctx">📌 Ma banque est la Banque du Valbourg. Ses messages viennent d'une adresse qui finit par <b>@banque-valbourg.fr</b>.</div>
        ${mock({ av: "BV", date: "Lun. 06:12", subject: `${hl(3, "⚠ Activité inhabituelle : votre compte sera suspendu")}`, from: `<b>Banque du Valbourg</b> ${pin(1)} <span class="mm-addr">&lt;securite@${hl(1, "banque-valbourg-alerte.com")}&gt;</span>`,
          body: `<p>Cher(e) client(e), ${pin(2)}</p><p>Nous avons détecté une activité inhabituelle sur votre compte. Par sécurité, il sera ${hl(3, "suspendu aujourd'hui")}.</p><p>Pour l'éviter, confirmez votre identité : ${hl(4, "identifiant, mot de passe et le code que vous allez recevoir par SMS")}.</p><p>${btn("Confirmer mon identité")} ${pin(5)}</p>`,
          status: `<span data-reveal="5">http://<mark>banque-valbourg-alerte.com</mark>/verification</span>` })}</div>
        <div class="l-vote-side">${notes([[1, "🔍 Qui m'écrit ?", "banque-valbourg-alerte.com, et non banque-valbourg.fr : ce n'est pas ma banque."], [2, "🤔 Je l'attendais ?", "Je n'ai rien fait d'inhabituel. Et « Cher(e) client(e) » : ma banque connaît mon nom."], [3, "⏰ La pression ?", "« Suspendu aujourd'hui » : la peur et l'urgence."], [4, "🔑 Que demande-t-on ?", "Mot de passe ET code SMS : ce qu'une banque ne demande JAMAIS. Avec ce code, l'escroc valide un paiement."], [5, "🔗 Où mène le lien ?", "En survolant : banque-valbourg-alerte.com. Un faux site."]])}
          <div class="l-verdict ko" data-reveal="6">🚩 ARNAQUE <small>5 signaux sur 5</small></div>
          <div class="l-do" data-reveal="7">👉 Je ne clique pas. J'appelle ma banque au numéro que je connais. Je range le message en 🚫 Indésirable.</div></div></div>` },

    { theme: "cover", title: "🙋 À vous de voter !", html: `
      <p class="l-lead">${VOTES} messages, vrais et faux mélangés. Pour chacun : <b>levez la main</b> si vous pensez que c'est une arnaque.</p>
      <div class="l-callout" data-reveal>🫶 Se tromper ici, c'est apprendre sans risque. Ce sont des messages d'entraînement.</div>` },

    { title: "Les arnaques les plus fréquentes", html: `
      <div class="l-scams">
        <div data-reveal><span>📦</span><b>Le faux colis</b><small>« Frais de 1,99 € à régler »</small><em>→ Je suis mon colis sur le site du transporteur, avec le numéro de ma commande.</em></div>
        <div data-reveal><span>💳</span><b>La fausse carte Vitale</b><small>« Votre carte expire, commandez-la »</small><em>→ Je vais moi-même sur ameli.fr ou dans l'application.</em></div>
        <div data-reveal><span>💶</span><b>Le faux remboursement</b><small>impôts, énergie, Assurance Maladie</small><em>→ Je vérifie dans mon espace personnel, sur le site officiel.</em></div>
        <div data-reveal><span>🚓</span><b>La fausse amende</b><small>« Majoration sous 24 h »</small><em>→ Le seul site officiel : antai.gouv.fr</em></div>
        <div data-reveal><span>🏦</span><b>Le faux « compte bloqué »</b><small>« Confirmez votre identité »</small><em>→ J'appelle mon conseiller, au numéro que je connais.</em></div>
        <div data-reveal><span>👨‍👩‍👧</span><b>Le faux proche</b><small>« Envoie-moi de l'argent, ne m'appelle pas »</small><em>→ J'appelle la personne sur son numéro habituel.</em></div>
        <div data-reveal><span>📮</span><b>La « boîte pleine »</b><small>« Reconnectez-vous »</small><em>→ J'ouvre ma messagerie moi-même, comme d'habitude.</em></div>
        <div data-reveal><span>📹</span><b>Le chantage</b><small>« On vous a filmé, payez »</small><em>→ Un mensonge envoyé en masse. Je ne paie pas, je supprime.</em></div>
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
        <button type="button" class="l-btn" data-lesson-act="demo" data-type="mail_fraud">👥 Faire l'exercice ensemble</button>
        <button type="button" class="l-btn alt" data-lesson-act="assign">🚀 Donner le chapitre au groupe</button>
      </div>` }
  ];


  const VOTE_MSGS = () => [
    V("Vous n'attendez aucun colis.", mock({ av: "SC", subject: `Votre colis n° FR8812645 est ${hl(4, "en attente")}`, from: `<b>Suivi Colis</b> ${pin(2)} <span class="mm-addr">&lt;notification@${hl(2, "suivi-colis-express.top")}&gt;</span>`,
      body: `<p>Bonjour,</p><p>Votre colis n'a pas pu être livré : les frais de réexpédition n'ont pas été réglés. ${hl(4, "Sans paiement sous 24 h")}, il sera retourné à l'expéditeur.</p><p>${btn(`Payer ${hl(5, "1,99 €")}`)}</p>`, status: `<span data-reveal="5">https://<mark>suivi-colis-express.top</mark>/paiement</span>` }),
      true, [[2, "Adresse inconnue", "suivi-colis-express.top n'est le site d'aucun transporteur."], [3, "Je n'attends aucun colis", ""], [4, "Urgence : « sous 24 h »", ""], [5, "On me fait payer", "1,99 € : un petit montant, pour récupérer ma carte bancaire."]], 3),

    V("Vous avez déclaré vos revenus au printemps.", mock({ av: "I", date: "Hier 10:02", subject: "Votre avis d'impôt est disponible", from: `<b>Impôts</b> ${pin(2, true)} <span class="mm-addr">&lt;ne-pas-repondre@${hl(2, "impots.gouv.fr", true)}&gt;</span>`,
      body: `<p>${hl(3, "Bonjour Madame Martin,", true)}</p><p>Votre avis d'impôt sur le revenu est disponible dans votre espace particulier.</p><p>${hl(5, "Pour le consulter, connectez-vous sur impots.gouv.fr", true)}, rubrique « Documents ».</p><p>Ceci est un message automatique, merci de ne pas y répondre.</p>` }),
      false, [[2, "Adresse en .gouv.fr", "Réservée à l'État."], [3, "Il m'appelle par mon nom", ""], [4, "Aucune urgence, aucune demande", "Ni code, ni carte, ni paiement."], [5, "Pas de bouton", "On m'invite à aller moi-même sur le site : c'est le bon réflexe."]]),

    V("", mock({ av: "AM", subject: `Votre carte Vitale ${hl(3, "arrive à expiration")}`, from: `<b>Assurance Maladie</b> ${pin(2)} <span class="mm-addr">&lt;info@${hl(2, "ameli-carte-vitale.info")}&gt;</span>`,
      body: `<p>${hl(3, "Cher assuré,")}</p><p>Votre carte Vitale arrive à expiration. ${hl(3, "Pour continuer à être remboursé")}, commandez dès maintenant votre nouvelle carte.</p><p>${hl(4, "Des frais d'envoi de 2,99 € vous seront demandés.")}</p><p>${btn("Commander ma carte")}</p>`, status: `<span data-reveal="5">http://<mark>ameli-carte-vitale.info</mark>/commande</span>` }),
      true, [[2, "Ce n'est pas ameli.fr", "ameli-carte-vitale.info : les mots connus servent à rassurer."], [3, "La peur de ne plus être remboursé", "« Cher assuré » au lieu de mon nom."], [4, "On me fait payer", "La carte Vitale est gratuite, et ne se commande pas par un lien reçu par e-mail."], [5, "Le lien mène vers un faux site", "ameli-carte-vitale.info"]]),

    V("Vous avez pris rendez-vous chez le Dr Martin la semaine dernière.", mock({ av: "DM", date: "Ven. 17:20", subject: "Rappel de votre rendez-vous", from: `<b>Cabinet du Dr Martin</b> ${pin(2, true)} <span class="mm-addr">&lt;secretariat@${hl(2, "cabinet-drmartin.fr", true)}&gt;</span>`,
      body: `<p>Bonjour Madame Martin,</p><p>Nous vous rappelons votre rendez-vous ${hl(3, "jeudi à 10 h 20", true)}.</p><p>En cas d'empêchement, merci de prévenir le cabinet au ${hl(5, "04 75 00 00 00", true)}.</p><p>Le secrétariat</p>` }),
      false, [[2, "L'adresse du cabinet que je connais", ""], [3, "J'attendais ce rendez-vous", "La date correspond à ce que j'ai pris."], [4, "Aucune pression, aucune demande", ""], [5, "Un numéro de téléphone ? Normal ici", "C'est celui du cabinet, que je connais déjà (sur ma carte de rendez-vous)."]]),

    V("Paul est votre neveu. D'habitude, il vous écrit depuis paul.martin@orange.fr", mock({ av: "PM", subject: `${hl(3, "Besoin d'aide urgent 😟")}`, from: `<b>Paul Martin</b> ${pin(2)} <span class="mm-addr">&lt;${hl(2, "paul.martin.depannage@gmail.com")}&gt;</span>`,
      body: `<p>Coucou,</p><p>Je suis bloqué à l'étranger, on m'a volé mon portefeuille. ${hl(4, "Peux-tu m'envoyer 300 € par virement aujourd'hui ?")} Je te rembourse dès mon retour.</p><p>${hl(5, "Ne m'appelle pas, mon téléphone est cassé.")}</p><p>Paul</p>` }),
      true, [[2, "Ce n'est pas son adresse habituelle", "N'importe qui peut créer une adresse au nom de Paul."], [3, "L'émotion et l'urgence", "Un proche en difficulté : on veut aider vite."], [4, "On demande de l'argent", ""], [5, "« Ne m'appelle pas »", "Pour vous empêcher de vérifier. 👉 J'appelle Paul sur son numéro habituel, ou un autre proche."]]),

    V("Hier, vous avez commandé un livre sur le site de la Librairie du Parc.", mock({ av: "LP", date: "Aujourd'hui 09:30", subject: "Votre commande n° 4521 a été expédiée", from: `<b>Librairie du Parc</b> ${pin(2, true)} <span class="mm-addr">&lt;commandes@${hl(2, "librairieduparc.fr", true)}&gt;</span>`,
      body: `<p>Bonjour Madame Martin,</p><p>Bonne nouvelle : ${hl(3, "votre livre « Le Petit Prince »", true)} a été expédié. Vous pouvez suivre votre colis depuis votre compte.</p><p>${btn("Suivre ma commande")}</p>`, status: `<span data-reveal="5">https://www.<mark class="ok">librairieduparc.fr</mark>/mon-compte/commandes</span>` }),
      false, [[2, "L'adresse du site où j'ai commandé", ""], [3, "J'attendais ce message", "C'est bien le livre que j'ai commandé."], [4, "Aucune pression, rien de secret demandé", ""], [5, "Un vrai message peut contenir un lien", "En survolant : librairieduparc.fr, le site où j'ai commandé. Dans le doute, je passe par le site moi-même."]]),

    V("Vous n'avez reçu aucune amende par courrier.", mock({ av: "A", date: "Sam. 19:44", subject: `Avis de contravention impayée`, from: `<b>ANTAI</b> ${pin(2)} <span class="mm-addr">&lt;avis@${hl(2, "antai-paiement-amende.com")}&gt;</span>`,
      body: `<p>Madame, Monsieur,</p><p>Sauf erreur de notre part, votre amende de 35 € reste impayée. ${hl(4, "Sans règlement sous 24 h, elle sera majorée à 135 €.")}</p><p>${btn("Payer mon amende")}</p>`, status: `<span data-reveal="5">https://<mark>antai-paiement-amende.com</mark>/payer</span>` }),
      true, [[2, "Ce n'est pas antai.gouv.fr", "Le seul site officiel des amendes est antai.gouv.fr."], [3, "Aucune amende reçue par courrier", ""], [4, "La peur de payer plus", "« Sous 24 h », « majorée »."], [5, "Payer par un lien reçu", "Le lien mène vers antai-paiement-amende.com."]], 3),

    V("", mock({ av: "SM", subject: `${hl(3, "⚠ Votre boîte mail est pleine : vos messages vont être supprimés")}`, from: `<b>Service Messagerie</b> ${pin(2)} <span class="mm-addr">&lt;support@${hl(2, "webmail-verification.net")}&gt;</span>`,
      body: `<p>Votre espace de stockage est saturé. Vos anciens messages seront ${hl(3, "supprimés sous 48 h")}.</p><p>${hl(4, "Reconnectez-vous")} pour augmenter gratuitement votre espace.</p><p>${btn("Me reconnecter")}</p>`, status: `<span data-reveal="5">https://<mark>webmail-verification.net</mark>/login</span>` }),
      true, [[2, "Une adresse générique inconnue", "Ce n'est pas l'adresse de votre fournisseur de messagerie."], [3, "La peur de perdre ses messages", "Et un délai : 48 h."], [4, "« Reconnectez-vous »", "= taper votre mot de passe sur LEUR page. Ils pourront ensuite lire vos messages."], [5, "Un faux site de connexion", "Pour vérifier, j'ouvre ma messagerie moi-même, comme d'habitude."]]),

    V("Le message semble venir de… votre propre adresse !", mock({ av: "?", subject: `${hl(3, "Je sais tout sur vous")}`, from: `<b>marie.martin@exemple.fr</b> ${pin(2)} <span class="mm-addr">(${hl(2, "votre propre adresse")})</span>`,
      body: `<p>J'ai piraté votre ordinateur et je vous ai filmé avec votre webcam.</p><p>${hl(4, "Si vous ne payez pas 500 € sous 48 h")}, j'enverrai la vidéo à tous vos contacts.</p>` }),
      true, [[2, "Écrire « depuis » votre adresse est un faux, très facile", "Cela ne prouve pas qu'on a piraté votre ordinateur."], [3, "La peur et la honte", "Pour vous faire payer vite, sans en parler à personne."], [4, "Envoyé à des milliers de personnes", "Il n'y a aucune vidéo. Je ne paie jamais, je ne réponds pas, je supprime."], [5, "Et si cela m'inquiète ?", "J'en parle à une personne de confiance, ou je consulte cybermalveillance.gouv.fr."]])
  ];

  /* =========================================================
     LES 5 SÉANCES (≈ 15-20 min de cours + jeux en direct)
     ========================================================= */
  const pick = (arr, start) => { const s = arr.find(x => x.title && x.title.startsWith(start)); if (!s) console.warn("Diapositive introuvable :", start); return s; };
  const cover = (n, title, goals) => ({ theme: "cover", title: `<small class="l-seance">Séance ${n} / 5</small>${title}`, html: `<div class="l-goals">${goals.map(g => `<div data-reveal>${g}</div>`).join("")}</div>` });
  const game = (id, title) => ({ title: `🎮 ${title}`, game: id });
  const end = (levels, demoType, extra = "") => ({ theme: "cover", title: "À vous ! 💻", html: `
      <p class="l-lead">Dans <b>« Mes missions »</b>, faites ${levels}. Chacun à son rythme : je passe vous voir.</p>${extra}
      <div class="l-actions">
        ${demoType ? `<button type="button" class="l-btn" data-lesson-act="demo" data-type="${demoType}">👥 Faire le premier ensemble</button>` : ""}
        <button type="button" class="l-btn alt" data-lesson-act="assign">🚀 Donner le chapitre au groupe</button>
      </div>` });
  const sextra = (html) => `<div class="l-callout">${html}</div>`;

  const lessons = () => {
    const A = slides(), F = fraudSlides();
    return [
      { id: "s1", title: "Séance 1 : découvrir sa messagerie", icon: "📬", badge: "Séance 1 · Découvrir sa messagerie", slides: () => [
        cover(1, "Découvrir sa messagerie", ["✉️ L'e-mail, comme une lettre", "＠ Lire et écrire une adresse", "📥 La boîte de réception", "🗂️ Les dossiers"]),
        pick(A, "Comme une lettre"), pick(A, "Lire une adresse e-mail"), pick(A, "Correcte ou pas"),
        game("dictee_adresse", "Dictée d'adresses"), game("construis_adresse", "Construis l'adresse"),
        pick(A, "La boîte de réception"), pick(A, "Les dossiers"),
        game("quel_dossier", "Dans quel dossier ?"),
        end("les <b>niveaux 1 et 2</b> : lire ses e-mails, l'adresse e-mail", "mail_read")] },
      { id: "s2", title: "Séance 2 : écrire et répondre", icon: "✏️", badge: "Séance 2 · Écrire et répondre", slides: () => [
        cover(2, "Écrire et répondre", ["✏️ Les champs d'un message : À, Cc, Cci, Objet", "👋 Un message poli et clair", "↩️ Répondre, répondre à tous, transférer"]),
        pick(A, "Écrire un message"), pick(A, "Un message bien écrit"),
        game("ordre_mail", "Remets le mail dans l'ordre"), game("corrige_mail", "Corrige le mail"),
        pick(A, "Répondre, répondre à tous"),
        game("quel_bouton", "Quel bouton ?"),
        end("les <b>niveaux 3 et 4</b> : répondre et transférer, écrire un e-mail complet", "mail_reply")] },
      { id: "s3", title: "Séance 3 : les pièces jointes", icon: "📎", badge: "Séance 3 · Les pièces jointes", slides: () => [
        cover(3, "Les pièces jointes", ["📎 Joindre ou télécharger ?", "🔎 Choisir le bon fichier", "⛔ Les fichiers dangereux", "🐘 Les fichiers trop lourds"]),
        pick(A, "Les pièces jointes"), ...piecesSlides(),
        game("bon_fichier", "Trouve le bon fichier"), game("document_danger", "Document ou danger ?"),
        end("le <b>niveau 5</b> : les pièces jointes", "mail_attach")] },
      { id: "s4", title: "Séance 4 : les arnaques, comprendre", icon: "🎣", badge: "Séance 4 · Les arnaques : comprendre", slides: () => [
        cover(4, "Les arnaques : comprendre", ["🎣 L'hameçonnage", "🫶 Ce qui est dangereux… et ce qui ne l'est pas", "🧭 La méthode des 5 questions"]),
        pick(F, "L'hameçonnage"), pick(F, "D'abord, rassurez-vous"), pick(F, "Le faux agent"), pick(F, "La méthode des 5 questions"),
        pick(F, "1 · Qui m'écrit"), pick(F, "2 · Est-ce que je l'attendais"), pick(F, "3 · Me met-on la pression"), pick(F, "4 · Que me demande-t-on"),
        game("sept_erreurs", "Trouve les 7 erreurs"), game("detecteur", "Le détecteur"),
        end("le <b>niveau 6</b> : repérer un e-mail frauduleux", "mail_fraud")] },
      { id: "s5", title: "Séance 5 : les arnaques, vérifier et réagir", icon: "🛡️", badge: "Séance 5 · Les arnaques : vérifier et réagir", slides: () => [
        cover(5, "Les arnaques : vérifier et réagir", ["🔗 Où mène le lien ?", "🔒 Le cadenas ne suffit pas", "🙋 Vrai ou arnaque ?", "🆘 Et si j'ai cliqué ?"]),
        pick(F, "5 · Où mène le lien"), pick(F, "Lire le vrai nom d'un site"), pick(F, "À quoi ressemble la page piège"),
        game("officiel_piege", "Officiel ou piège ?"), game("vrai_arnaque", "Vrai ou arnaque ?"),
        pick(F, "Les arnaques les plus fréquentes"), pick(F, "Dans le doute"), pick(F, "Et si j'ai cliqué"),
        game("que_faire", "Que faites-vous ?"),
        end("le <b>niveau 7</b> : le défi de la boîte mail", "mail_challenge", sextra("🏆 Et pour fêter la fin du chapitre : <b>le grand Kahoot</b> !"))] }
    ];
  };

  /* Diapositives nouvelles de la séance 3 */
  const piecesSlides = () => [
    { title: "Joindre un fichier, pas à pas", html: `
      <ol class="l-gestures">
        <li data-reveal><span>📎</span><div><b>1. Je clique sur « Joindre un fichier »</b><small>(le trombone), dans la fenêtre du message que j'écris.</small></div></li>
        <li data-reveal><span>📂</span><div><b>2. Une fenêtre s'ouvre : je choisis le dossier</b><small>Le plus souvent : « Téléchargements » ou « Documents ».</small></div></li>
        <li data-reveal><span>👆</span><div><b>3. Je clique une fois sur le fichier, puis sur « Ouvrir »</b><small>(ou un double-clic sur le fichier).</small></div></li>
        <li data-reveal><span>👀</span><div><b>4. Je vérifie : le fichier apparaît sous le message</b><small>Avec son nom et sa taille. Sinon, je recommence.</small></div></li>
      </ol>` },
    { title: "Le bon fichier : je lis son nom", html: `
      ${url([["facture_electricite", "ok", "de quoi il s'agit"], ["_septembre_2026", "ok", "la date"], [".pdf", "dim", "le type (l'extension)"]])}
      <div class="l-grid2">
        <div class="l-card" data-reveal><h3>📅 La date compte</h3><p>« Justificatif de <b>moins de 3 mois</b> » : je regarde le mois et l'année dans le nom, ou dans la colonne « Modifié le ».</p></div>
        <div class="l-card" data-reveal><h3>✏️ Bien nommer, c'est retrouver</h3><p>Un nom clair (<b>avis_impot_2026</b>) plutôt que <b>scan001</b> : on retrouve tout de suite le bon document.</p></div>
      </div>` },
    { title: "Les fichiers dangereux ⛔", html: `
      <div class="l-grid2">
        <div class="l-safe" data-reveal><h3>✅ Des documents</h3><ul><li><b>.pdf</b> : un document, une facture</li><li><b>.jpg</b> / <b>.png</b> : une photo</li><li><b>.docx</b> / <b>.odt</b> : un texte</li></ul></div>
        <div class="l-risk" data-reveal><h3>⛔ Des programmes : prudence</h3><ul><li><b>.exe</b> : un programme qui s'installe</li><li><b>.zip</b> : un paquet de fichiers fermé</li><li>reçus d'un inconnu ou sans les attendre : <b>je n'ouvre pas</b></li></ul></div>
      </div>
      <div class="l-callout" data-reveal>🎭 Le piège du double nom : <b>facture.pdf.exe</b>. Ce qui compte, c'est <b>la fin</b> : c'est un <b>.exe</b>, un programme déguisé en facture.</div>
      <p class="l-note" data-reveal>🐘 Et les fichiers trop lourds (une longue vidéo) ne passent pas : les pièces jointes sont souvent limitées à 20 ou 25 Mo.</p>` }
  ];

  AN.emailKit = { mock, addr, btn, hl, pin, notes, VOTE_MSGS };

  AN.chapters.register({
    id: "email", title: "E-mail", icon: "📧", color: "#3979b7",
    summary: "5 séances de 30 minutes : un cours court, des jeux en direct sur les PC, puis les exercices.",
    duration: "5 séances", parcours: "p_email", demo: "mail_read", slides,
    demos: [{ type: "mail_read", label: "Niveau 1 ensemble" }, { type: "mail_fraud", label: "Niveau 6 ensemble (arnaques)" }],
    get lessons() { return lessons(); }
  });

  /* Chapitres du programme annuel, à venir (affichés grisés côté formateur). */
  [
    { id: "wifi", title: "Wi-Fi et réseaux", icon: "🛜", summary: "🛜 Wi-Fi ou 📶 4G/5G, se connecter, Wi-Fi public, petites pannes." },
    { id: "comptes", title: "Comptes et mots de passe", icon: "🔑", summary: "Créer un compte, un mot de passe solide, la double authentification." },
    { id: "fichiers", title: "Fichiers et dossiers", icon: "🗂️", summary: "Extensions, bien nommer, ranger, retrouver un téléchargement." },
    { id: "peripheriques", title: "Périphériques", icon: "🖨️", summary: "Souris, clavier, imprimante, clé USB, écran." }
  ].forEach(c => AN.chapters.register({ ...c, soon: true }));
})(window.AN);

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

    { title: "Attention aux faux messages 🎣", html: `
      <div class="l-scam">
        <div class="ls-mail">
          <div><small>De :</small> Assurance Maladie &lt;<mark data-reveal>remboursement@ameIi-securite.info</mark>&gt;</div>
          <div><small>Objet :</small> <mark data-reveal>⚠ URGENT : remboursement en attente !!!</mark></div>
          <p><mark data-reveal>Cher client,</mark> un remboursement de 87,40 € vous attend. <mark data-reveal>Sans réponse avant minuit, il sera annulé.</mark></p>
          <p><mark data-reveal>Saisissez votre carte bancaire</mark> : <u>Recevoir mon remboursement</u></p>
        </div>
        <ul class="l-list small">
          <li data-reveal>🔍 Une adresse d'expéditeur bizarre</li><li data-reveal>⏰ L'urgence et la menace</li>
          <li data-reveal>🙈 « Cher client » au lieu de mon nom</li><li data-reveal>💳 On me demande ma carte ou mes codes</li>
        </ul>
      </div>
      <div class="l-callout" data-reveal>🖱️ Je <b>survole</b> le lien sans cliquer : sa vraie adresse s'affiche en bas. Le cadenas 🔒 veut dire « connexion chiffrée », <b>pas</b> « site fiable » : je vérifie toujours le nom du site.</div>` },

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

  AN.chapters.register({
    id: "email", title: "E-mail", icon: "📧", color: "#3979b7",
    summary: "Lire, écrire, répondre, transférer, joindre un fichier et déjouer les arnaques.",
    duration: "≈ 5 séances", parcours: "p_email", demo: "mail_read", slides
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

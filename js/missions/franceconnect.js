/* =========================================================
   Chapitre « FranceConnect » : 8 niveaux progressifs.
   Tout se passe dans le navigateur simulé (AN.browser) : des services
   fictifs de Valbourg, la page FranceConnect, des comptes d'exercice.
   🛡️ Les identifiants sont fictifs, rien n'est envoyé. Note /20 à la fin.
   ========================================================= */
(function (AN) {
  "use strict";
  const { esc } = AN.util;
  const R = AN.missions.register;
  const KIT = () => AN.missionKit;
  const B = () => AN.browser;
  const grader = L => AN.mail.grader(L.grade ||= {});
  const frame = (ctx, o) => KIT().frame(ctx, { chapter: "FranceConnect", ...o });
  const tasksHTML = t => KIT().tasksHTML(t);
  const quiz = (el, o) => KIT().inlineQuiz(el, o);
  const alive = ctx => ctx.box.isConnected && ctx.box.__an?.ctx === ctx;
  const finish = (ctx, G, o) => { if (alive(ctx)) return KIT().finish(ctx, G, o); };
  const later = (ctx, fn, ms) => { const t = setTimeout(() => { if (alive(ctx)) fn(); }, ms); ctx.onCleanup(() => clearTimeout(t)); };
  const digits = s => String(s || "").replace(/\s+/g, "");
  const SAFE = `<div class="acc-safe">🛡️ Exercice : identifiants fictifs. N'utilisez <u>jamais</u> vos vrais identifiants ici. Rien n'est envoyé.</div>`;

  function tasker(panel, tasks, { head = "" } = {}) {
    let note = "";
    const draw = () => {
      const cur = tasks.find(t => !t.done);
      panel.innerHTML = head + tasksHTML(tasks.map(t => ({ done: t.done, label: t === cur ? `<b>👉</b> ${t.label}` : t.label }))) + `<div class="mk-fb">${note}</div><div class="mk-q-slot"></div>`;
    };
    draw();
    return {
      tasks, draw,
      done(k) { const t = tasks.find(t => t.k === k); if (!t || t.done) return false; t.done = true; note = ""; draw(); return true; },
      is: k => !!tasks.find(t => t.k === k)?.done,
      get all() { return tasks.every(t => t.done); },
      get next() { return tasks.find(t => !t.done); },
      note(h) { note = h; const e = panel.querySelector(".mk-fb"); if (e) e.innerHTML = h; },
      slot: () => panel.querySelector(".mk-q-slot")
    };
  }

  /* =========================================================
     L'UNIVERS : Marie Dupont et ses comptes d'exercice
     ========================================================= */
  const ME = { first: "Marie Hélène", last: "DUPONT", birth: "12/03/1956", place: "Valbourg (26)", email: "marie.dupont@exemple.fr",
    fiscal: "3012456789012", impotsPw: "Lilas-Bleu-42", nss: "2560326123456", ameliPw: "Rose-Verte-17", pin: "2580" };
  const card = (extra = "") => `<div class="fc-card">📒 <b>Le carnet de Marie</b> (exercice)<br>Numéro fiscal : <b class="mono">${ME.fiscal}</b><br>Mot de passe impots.gouv : <b class="mono">${ME.impotsPw}</b>${extra}</div>`;
  const FC = "app.franceconnect.gouv.fr";
  const SVC = {
    mairie: { name: "Mairie de Valbourg", host: "www.mairie-valbourg.fr", color: "#7050bf", logo: "🏛️", title: "Inscription sur les listes électorales" },
    caf: { name: "Caisse des aides", host: "www.caisse-aides-valbourg.fr", color: "#0b5d8a", logo: "👪", title: "Mon espace allocataire" },
    form: { name: "Mon espace formation", host: "www.formation-valbourg.fr", color: "#2f6f4f", logo: "🎓", title: "Mes droits à la formation", plus: true }
  };
  const IDP = [
    { id: "impots", label: "impots.gouv.fr", ic: "💶", sub: "le compte des impôts", url: "cfspart.impots.gouv.fr/connexion", color: "#1f3c88", plus: false },
    { id: "ameli", label: "ameli", ic: "💙", sub: "l'Assurance Maladie", url: "assure.ameli.fr/connexion", color: "#0c419a", plus: false },
    { id: "msa", label: "MSA", ic: "🌾", sub: "la sécurité sociale agricole", url: "monespaceprive.msa.fr/connexion", color: "#2e7d32", plus: false },
    { id: "laposte", label: "L'Identité Numérique La Poste", ic: "📮", sub: "validation sur le téléphone", url: "lidentitenumerique.laposte.fr/connexion", color: "#d9a400", plus: true },
    { id: "franceid", label: "France Identité", ic: "🪪", sub: "l'appli + la carte d'identité", url: "france-identite.gouv.fr/connexion", color: "#000091", plus: true },
    { id: "trustme", label: "TrustMe", ic: "🔐", sub: "une autre identité numérique", url: "trustme.example/connexion", color: "#5b3fa6", plus: false }
  ];
  const idpOf = id => IDP.find(i => i.id === id);
  const fcBtn = (plus) => `<button type="button" class="fc-btn ${plus ? "plus" : ""}" data-bk-act="fc"><span class="fc-logo">FC</span><span>S'identifier avec<br><b>FranceConnect${plus ? "+" : ""}</b></span></button><a href="#" class="fc-what" data-bk-act="whatfc">Qu'est-ce que FranceConnect${plus ? "+" : ""} ?</a>`;

  /** Les pages du monde : W = état partagé (service en cours, identité, erreurs…) */
  function world(W) {
    const P = {};
    const field = (label, name, v = "", type = "text") => `<label>${label}<input type="${type}" name="${name}" value="${esc(v)}" autocomplete="off" spellcheck="false" autocapitalize="off"></label>`;
    const pw = (label, name) => `<label>${label}<span class="pwbox"><input type="password" name="${name}" autocomplete="new-password" spellcheck="false"><button type="button" class="eye" data-eye aria-label="Afficher le mot de passe">👁</button></span></label>`;
    const errs = info => info.flags.err ? `<div class="err" role="alert">⚠️ ${info.flags.err}</div>` : "";
    Object.entries(SVC).forEach(([k, s]) => {
      const head = `<header class="ws-head"><span class="ws-logo">${s.logo} ${s.name}</span><span style="margin-left:auto;font-size:.75em;opacity:.85">SIMULATION</span></header>`;
      P[s.host + "/connexion"] = { title: `${s.title} - ${s.name}`, short: s.name, icon: s.logo, html: () => `<div class="ws" style="--c:${s.color}">${head}<main class="ws-main">
        <h2>${s.title}</h2><p>Pour continuer, identifiez-vous.</p>
        ${fcBtn(s.plus)}
        ${s.plus ? `<p class="fc-note" style="max-width:460px">🔒 Ce service demande <b>FranceConnect+</b>, la version renforcée : seules certaines identités numériques sont acceptées.</p>` : ""}
        <div class="fc-or">ou</div><div class="af"><label>Adresse e-mail<input name="mail" autocomplete="off"></label><label>Mot de passe<input type="password" name="mpw" autocomplete="off"></label><button type="button" class="ws-btn" data-bk-act="classic">Se connecter</button>
        <div class="links"><a href="#" data-bk-act="create">Créer un compte</a></div></div></main></div>` };
      P[s.host + "/mon-espace"] = { title: `Mon espace - ${s.name}`, short: s.name, icon: s.logo, html: info => `<div class="ws" style="--c:${s.color}">${head.replace('<span style="margin-left:auto', `<button type="button" class="ws-btn" data-bk-act="logout" style="background:#fff;color:${s.color}!important;margin-left:auto">🚪 Se déconnecter</button><span style="margin-left:8px`)}<main class="ws-main">
        <h2>Bonjour ${W.who || `${ME.first} ${ME.last}`} 👋</h2><p class="fc-note">✅ Vous êtes identifié(e) grâce à <b>FranceConnect</b>. Vos informations ont été remplies automatiquement.</p>
        ${k === "mairie" ? `<div class="af"><label>Nom<input value="${ME.last}" readonly></label><label>Prénoms<input value="${ME.first}" readonly></label><label>Né(e) le<input value="${ME.birth}" readonly></label><label>Adresse<input name="adr" value="12 rue des Lilas, Valbourg"></label><button type="button" class="ws-btn" data-bk-act="validate">Valider mon inscription</button></div>${info.flags.ok ? `<div class="fc-note">🗳️ Inscription enregistrée ! Vous recevrez votre carte électorale par courrier.</div>` : ""}`
          : k === "form" ? `<p>🎓 Vos droits à la formation : <b>1 240 €</b> (fictif).</p>` : `<p>📄 Vos attestations et vos paiements sont ici.</p>`}</main></div>` };
      P[s.host + "/deconnecte"] = { title: s.name, short: s.name, icon: s.logo, html: () => `<div class="ws" style="--c:${s.color}">${head}<main class="ws-main"><h2>🚪 Vous êtes déconnecté(e)</h2><p>À bientôt.</p></main></div>` };
      P[s.host + "/erreur"] = { title: s.name, short: s.name, icon: s.logo, html: () => `<div class="ws" style="--c:${s.color}">${head}<main class="ws-main"><h2>⚠️ Identité non reconnue</h2><p>Les informations transmises ne correspondent pas à votre dossier : <b>votre nom ne correspond pas</b>.</p><p>Vérifiez que le compte utilisé est enregistré avec votre <b>état civil exact</b> (nom, prénoms, date et lieu de naissance).</p><a href="#" data-href="${s.host}/connexion">↩ Revenir à la connexion</a></main></div>` };
    });
    const fcTop = (plus) => `<div class="fc-top"><b>FranceConnect${plus ? "+" : ""}</b><small>· le service de l'État pour vous identifier</small><span class="idp-sim">SIMULATION</span></div>`;
    P[FC + "/choix"] = { title: "FranceConnect - Choisir un compte", short: "FranceConnect", icon: "🇫🇷", html: () => {
      const s = SVC[W.svc] || SVC.mairie, plus = !!s.plus;
      return `<div class="fc-page">${fcTop(plus)}<main class="fc-main">
        <h2>Je choisis un compte pour me connecter sur<br><b>${s.name}</b></h2>
        ${plus ? `<div class="fc-note">🔒 <b>FranceConnect+</b> : pour ce service, seules les identités numériques renforcées sont possibles.</div>` : ""}
        <div class="fc-idps">${IDP.map(i => { const off = plus && !i.plus; return `<button type="button" class="fc-idp ${off ? "off" : ""}" data-bk-act="idp" data-idp="${i.id}" ${off ? "aria-disabled=\"true\"" : ""}><span class="ic">${i.ic}</span>${i.label}<small>${off ? "non accepté ici" : i.sub}</small></button>`; }).join("")}</div>
        <p style="font-size:.85em;color:#555">Vous n'avez aucun de ces comptes ? Il faut en créer un d'abord, sur le site correspondant.</p>
        <a href="#" data-bk-act="back">‹ Revenir sur ${s.name}</a></main></div>`;
    } };
    P[FC + "/consentement"] = { title: "FranceConnect - Informations transmises", short: "FranceConnect", icon: "🇫🇷", html: () => {
      const s = SVC[W.svc] || SVC.mairie, last = W.wrongName ? "DUPOND" : ME.last;
      return `<div class="fc-page">${fcTop(s.plus)}<main class="fc-main">
        <h2>Vous allez être connecté(e) à <b>${s.name}</b></h2>
        <p>Avec votre compte <b>${idpOf(W.idp)?.label || ""}</b>. Les informations suivantes vont être transmises :</p>
        <div class="fc-data"><div><span>Nom de naissance</span><b>${last}</b></div><div><span>Prénoms</span><b>${ME.first}</b></div><div><span>Date de naissance</span><b>${ME.birth}</b></div><div><span>Lieu de naissance</span><b>${ME.place}</b></div><div><span>Adresse e-mail</span><b>${ME.email}</b></div></div>
        <div class="fc-actions"><button type="button" class="fc-b1" data-bk-act="consent">Continuer sur ${s.name}</button><button type="button" class="fc-b2" data-bk-act="other">Choisir un autre compte</button></div></main></div>`;
    } };
    P[FC + "/deconnexion"] = { title: "FranceConnect - Déconnexion", short: "FranceConnect", icon: "🇫🇷", html: () => {
      const s = SVC[W.svc] || SVC.mairie;
      return `<div class="fc-page">${fcTop(false)}<main class="fc-main"><h2>Vous êtes déconnecté(e) de <b>${s.name}</b></h2>
        <p>Voulez-vous aussi vous déconnecter de <b>FranceConnect</b> ?</p><p style="font-size:.9em;color:#555">Sinon, la personne qui utilisera cet ordinateur après vous pourra entrer sur d'autres sites avec FranceConnect, sans mot de passe.</p>
        <div class="fc-actions"><button type="button" class="fc-b1" data-bk-act="fcout">Oui, me déconnecter de FranceConnect</button><button type="button" class="fc-b2" data-bk-act="fcstay">Non, rester connecté(e)</button></div></main></div>`;
    } };
    P[FC + "/deconnecte"] = { title: "FranceConnect", short: "FranceConnect", icon: "🇫🇷", html: () => `<div class="fc-page">${fcTop(false)}<main class="fc-main"><h2>✅ Vous êtes déconnecté(e) de FranceConnect</h2><p>Vous pouvez fermer cet onglet.</p></main></div>` };
    P[FC + "/aide"] = { title: "Qu'est-ce que FranceConnect ?", short: "FranceConnect", icon: "🇫🇷", html: () => `<div class="fc-page">${fcTop(false)}<main class="fc-main"><h2>Qu'est-ce que FranceConnect ?</h2><p>FranceConnect est la solution proposée par l'État pour vous connecter à des services en ligne <b>avec un compte que vous avez déjà</b> (impots.gouv.fr, ameli, MSA, L'Identité Numérique La Poste, France Identité…).</p><p>Pas de nouveau mot de passe à retenir !</p><a href="#" data-bk-act="back">‹ Revenir</a></main></div>` };
    /* les comptes (fournisseurs d'identité) */
    const idpHead = i => `<div class="idp-head" style="background:${i.color}">${i.ic} ${i.label}<span class="idp-sim">SIMULATION</span></div>`;
    P[idpOf("impots").url] = { title: "impots.gouv.fr - Connexion", short: "impots.gouv.fr", icon: "💶", html: info => `<div class="idp-page">${idpHead(idpOf("impots"))}<div class="idp-body"><h3 style="margin:0">Connexion à votre espace particulier</h3><div class="af">${errs(info)}
      ${field("Numéro fiscal (13 chiffres)", "fid", info.flags.fid || "")}${pw("Mot de passe", "pw")}
      <button type="button" class="ws-btn" style="--c:#1f3c88;background:#1f3c88" data-bk-act="idpLogin">Connexion</button>
      <div class="links"><a href="#" data-bk-act="forgot">Mot de passe oublié ?</a></div></div></div></div>` };
    P["cfspart.impots.gouv.fr/oubli"] = { title: "impots.gouv.fr - Mot de passe oublié", short: "impots.gouv.fr", icon: "💶", html: () => `<div class="idp-page">${idpHead(idpOf("impots"))}<div class="idp-body"><h3 style="margin:0">🔑 Mot de passe oublié</h3><p>Indiquez votre numéro fiscal : un lien pour choisir un nouveau mot de passe sera envoyé à l'adresse e-mail de votre espace.</p><div class="af">${field("Numéro fiscal", "fid2")}<button type="button" class="ws-btn" style="background:#1f3c88" data-bk-act="sendReset">Continuer</button></div></div></div>` };
    P[idpOf("ameli").url] = { title: "ameli - Connexion", short: "ameli", icon: "💙", html: info => `<div class="idp-page">${idpHead(idpOf("ameli"))}<div class="idp-body"><h3 style="margin:0">Connexion à mon compte ameli</h3><div class="af">${errs(info)}
      ${field("Numéro de sécurité sociale (13 chiffres)", "nss", W.ameliFill ? ME.nss : "")}<label>Mot de passe<span class="pwbox"><input type="password" name="pw" value="${W.ameliFill ? "••••••••••" : ""}" autocomplete="new-password"><button type="button" class="eye" data-eye aria-label="Afficher">👁</button></span></label>
      <button type="button" class="ws-btn" style="background:#0c419a" data-bk-act="idpLogin">Je me connecte</button><div class="links"><a href="#" data-bk-act="forgot">Mot de passe oublié ?</a></div></div></div></div>` };
    P[idpOf("laposte").url] = { title: "L'Identité Numérique La Poste", short: "Identité Numérique", icon: "📮", html: info => `<div class="idp-page">${idpHead(idpOf("laposte"))}<div class="idp-body">
      ${info.flags.wait ? `<h3 style="margin:0">📱 Validez sur votre téléphone</h3><p>Une demande de connexion a été envoyée à l'application <b>L'Identité Numérique La Poste</b> de votre téléphone.</p><p>Ouvrez-la, vérifiez la demande, puis tapez votre <b>code secret</b>.</p><p class="fc-note">⏳ En attente de validation…</p>`
        : `<h3 style="margin:0">Connexion avec L'Identité Numérique</h3><div class="af">${errs(info)}${field("Adresse e-mail", "lpmail", info.flags.lpmail || "")}<button type="button" class="ws-btn" style="background:#b88b00" data-bk-act="lpNext">Suivant</button></div>`}</div></div>` };
    P[idpOf("franceid").url] = { title: "France Identité", short: "France Identité", icon: "🪪", html: () => `<div class="idp-page">${idpHead(idpOf("franceid"))}<div class="idp-body"><h3 style="margin:0">Connexion avec France Identité</h3><p>Il faut l'application <b>France Identité</b> sur votre téléphone et une <b>carte d'identité au format carte bancaire</b> (avec puce).</p><p>Dans l'application : approchez la carte du téléphone, puis tapez votre code.</p><p class="fc-note">Dans cet exercice, Marie n'a pas encore installé France Identité.</p><a href="#" data-bk-act="back">‹ Choisir un autre compte</a></div></div>` };
    ["msa", "trustme"].forEach(k => { const i = idpOf(k); P[i.url] = { title: i.label, short: i.label, icon: i.ic, html: () => `<div class="idp-page">${idpHead(i)}<div class="idp-body"><h3 style="margin:0">Connexion</h3><p>Marie n'a <b>pas de compte</b> ${k === "msa" ? "MSA (elle n'est pas agricultrice)" : "TrustMe"}.</p><a href="#" data-bk-act="back">‹ Choisir un autre compte</a></div></div>` }; });
    /* le faux site */
    const clue = (c, h) => `<span class="fc-clue" data-bk-act="clue" data-c="${c}">${h}</span>`;
    P["franceconnect-verification.com/connexion"] = { title: "FranceConnect - Vérification", short: "FranceConnect", icon: "🇫🇷", html: () => `<div class="fc-page"><div class="fc-top"><b>France Connect</b><small>· Service de vérification</small></div><main class="fc-main">
      <h2>⚠️ ${clue("urgence", "Votre compte sera suspendu dans 24 h")}</h2>
      <p>Suite à une mise à jour de sécurité, vous devez ${clue("faute", "confirmé vos informations")} pour continuer à utiliser vos services.</p>
      <div class="af"><label>Numéro de sécurité sociale<input autocomplete="off"></label>${clue("carte", `<label>Numéro de carte bancaire (pour vérifier votre identité)<input autocomplete="off"></label>`)}<button type="button" class="ws-btn" style="background:#000091" data-bk-act="fakeSend">Valider</button></div></main></div>` };
    return P;
  }

  /** Monte le navigateur avec le monde FranceConnect. */
  function mountFC(ctx, el, W, extra = {}) {
    const L = ctx.local;
    L.client?.destroy();
    L.client = B().client(el, { pages: world(W), big: ctx.demo, features: { favorites: false }, ...extra });
    if (!L.hooked) { L.hooked = true; ctx.onCleanup(() => L.client?.destroy()); }
    if (!el.dataset.fcEye) {
      el.dataset.fcEye = "1";
      el.addEventListener("click", e => { const eye = e.target.closest("[data-eye]"); if (!eye) return; e.preventDefault(); const i = eye.parentElement.querySelector("input"); i.type = i.type === "password" ? "text" : "password"; });
      el.addEventListener("keydown", e => { if (e.key !== "Enter" || !e.target.closest?.(".af input")) return; e.preventDefault(); e.target.closest(".af").querySelector("button[data-bk-act]")?.click(); });
    }
    return L.client;
  }
  const goPage = (c, url, flags = {}) => { c.go(url, "form"); Object.assign(c.tab.flags, flags); c.render(); };
  const showErr = (c, err, keep = {}) => { c.tab.flags.err = err; Object.assign(c.tab.flags, keep); c.render(); };
  const isHost = (url, h) => B().hostOf(url) === h;

  /** Le parcours de connexion standard (réutilisé par plusieurs niveaux). onStep(étape, data) prévient la mission. */
  function flow(c, W, d, onStep) {
    const s = SVC[W.svc];
    const a = d.name;
    if (a === "fc") { goPage(c, FC + "/choix"); onStep("fc"); return true; }
    if (a === "whatfc") { goPage(c, FC + "/aide"); onStep("what"); return true; }
    if (a === "back") { c.press("back"); return true; }
    if (a === "create") { c.flash("Pas besoin de créer un compte : avec <b>FranceConnect</b>, on utilise un compte qu'on a déjà (impots, ameli…).", "info", 6000); onStep("create"); return true; }
    if (a === "classic") { c.flash("Marie n'a pas de compte sur ce site. Utilisez plutôt le bouton <b>FranceConnect</b>.", "info", 5000); onStep("classic"); return true; }
    if (a === "idp") {
      const i = idpOf(d.el.dataset.idp);
      if (s.plus && !i.plus) { c.flash(`🔒 <b>${i.label}</b> n'est pas accepté pour ce service : il demande FranceConnect+ (une identité renforcée).`, "warn", 6000); onStep("idpRefused", i); return true; }
      W.idp = i.id; goPage(c, i.url); onStep("idp", i); return true;
    }
    if (a === "idpLogin") {
      const f = c.fields();
      if (W.idp === "impots") {
        const okId = digits(f.fid) === ME.fiscal, okPw = f.pw === ME.impotsPw;
        if (!okId || !okPw) { showErr(c, "Numéro fiscal ou mot de passe incorrect.", { fid: f.fid }); onStep("badLogin", { okId, okPw, caps: f.pw && f.pw.toLowerCase() === ME.impotsPw.toLowerCase() && f.pw !== ME.impotsPw }); return true; }
      } else if (W.idp === "ameli" && !W.ameliFill) {
        if (digits(f.nss) !== ME.nss || f.pw !== ME.ameliPw) { showErr(c, "Identifiants incorrects."); onStep("badLogin", {}); return true; }
      }
      goPage(c, FC + "/consentement"); onStep("login"); return true;
    }
    if (a === "lpNext") { const f = c.fields(); if (f.lpmail.trim().toLowerCase() !== ME.email) { showErr(c, "Adresse e-mail inconnue.", { lpmail: f.lpmail }); onStep("badLogin", {}); return true; } goPage(c, idpOf("laposte").url, { wait: true }); onStep("lpWait"); return true; }
    if (a === "other") { goPage(c, FC + "/choix"); onStep("other"); return true; }
    if (a === "consent") { if (W.wrongName) { goPage(c, s.host + "/erreur"); onStep("refused"); return true; } goPage(c, s.host + "/mon-espace"); onStep("connected"); return true; }
    if (a === "logout") { goPage(c, FC + "/deconnexion"); onStep("logout"); return true; }
    if (a === "fcout") { goPage(c, FC + "/deconnecte"); onStep("fcout"); return true; }
    if (a === "fcstay") { goPage(c, s.host + "/deconnecte"); onStep("fcstay"); return true; }
    if (a === "forgot") { if (W.idp === "impots") { goPage(c, "cfspart.impots.gouv.fr/oubli"); } onStep("forgot"); return true; }
    if (a === "sendReset") { c.flash("📩 Un e-mail vient de partir avec un lien pour choisir un nouveau mot de passe (valable peu de temps).", "good", 6000); onStep("reset"); return true; }
    if (a === "validate") { c.tab.flags.ok = true; c.render(); onStep("validate"); return true; }
    return false;
  }

  /* =========================================================
     NIVEAU 1 — Reconnaître FranceConnect
     ========================================================= */
  R("fc_reconnaitre", {
    steps: 1,
    render(ctx) {
      const L = ctx.local, G = grader(L);
      if ((ctx.m.step || 0) > 0) return ctx.finalScreen({ theme: null });
      const W = L.W ||= { svc: "mairie" };
      const f = frame(ctx, { level: 1, title: "Reconnaître FranceConnect", step: 0,
        consigne: "Marie veut s'inscrire sur les listes électorales sur le site de sa mairie. Le site propose <b>FranceConnect</b> : découvrons ce bouton.",
        help: "Le bouton FranceConnect est bleu foncé, avec « S'identifier avec FranceConnect »." });
      const T = tasker(f.panel, [
        { k: "what", label: "Cliquez sur le petit lien <b>« Qu'est-ce que FranceConnect ? »</b> et lisez." },
        { k: "back", label: "Revenez sur le site de la mairie (‹ Revenir, ou la flèche ← du navigateur)." },
        { k: "fc", label: "Cliquez sur le bouton <b>S'identifier avec FranceConnect</b>." },
        { k: "addr", label: "Regardez la <b>barre d'adresse</b> : sur quel site êtes-vous maintenant ? (Répondez ci-dessous.)" }
      ]);
      let wrong = 0;
      mountFC(ctx, f.host, W, { start: SVC.mairie.host + "/connexion", onEvent: (type, d, c) => {
        if ((type === "navigate" || type === "back") && d.url && isHost(d.url, SVC.mairie.host) && T.is("what") && T.done("back")) G.ok("back", "Revenir en arrière");
        if (type !== "action") return;
        flow(c, W, d, (st) => {
          if (st === "what" && T.done("what")) G.ok("what", "S'informer sur FranceConnect");
          if ((st === "create" || st === "classic") && !T.is("fc")) wrong++;
          if (st === "fc" && T.is("back") && T.done("fc")) {
            (wrong ? G.ko : G.ok)("fc", "Trouver le bouton FranceConnect", "Le bouton bleu « S'identifier avec FranceConnect » : pas besoin de créer un compte.");
            quiz(T.slot(), { G, key: "addr", questions: [
              { q: "Regardez la barre d'adresse. Vous êtes sur…", choices: ["Le site de la mairie", "Le site de FranceConnect : franceconnect.gouv.fr", "Un site de publicité"], ok: 1, why: "En cliquant sur le bouton, on part sur <b>franceconnect.gouv.fr</b>, le site de l'État. On vérifie toujours ce nom !" },
              { q: "FranceConnect, c'est…", choices: ["Un nouveau compte avec un nouveau mot de passe", "Une façon d'entrer avec un compte que j'ai déjà (impots, ameli…)", "Un site de paiement"], ok: 1, why: "C'est comme une <b>clé passe-partout</b> : un compte que vous avez déjà ouvre de nombreux sites publics." },
              { q: "Le bouton FranceConnect se trouve…", choices: ["Sur les sites des services publics, à la page de connexion", "Dans les e-mails reçus"], ok: 0, why: "On le trouve sur la page de connexion des sites (mairie, CAF, retraite, ANTS…). Jamais dans un e-mail à cliquer." }
            ], onDone: () => { T.done("addr"); finish(ctx, G, { key: "fc_reconnaitre", label: "Je reconnais le bouton FranceConnect", intro: "Vous savez trouver le bouton FranceConnect, et vous savez qu'il mène au site de l'État, franceconnect.gouv.fr." }); } });
          } else if (st === "fc" && !T.is("back")) T.note(`<div class="alert">Suivez l'ordre : d'abord <b>« Qu'est-ce que FranceConnect ? »</b>, puis revenez.</div>`);
        });
      } });
    }
  });

  /* =========================================================
     NIVEAU 2 — Quel compte choisir ?
     ========================================================= */
  const WHO = [
    { k: "marie", name: "Marie", text: "<b>Marie</b> déclare ses impôts en ligne chaque printemps, sur impots.gouv.fr.", ok: ["impots"], why: "Elle a déjà un compte des impôts : elle l'utilise." },
    { k: "gerard", name: "Gérard", text: "<b>Gérard</b> n'a jamais déclaré ses impôts en ligne, mais il consulte ses remboursements sur son compte ameli.", ok: ["ameli"], why: "Son compte ameli suffit." },
    { k: "josiane", name: "Josiane", text: "<b>Josiane</b>, ancienne agricultrice, a un compte sur le site de la MSA pour sa retraite.", ok: ["msa"], why: "La MSA, c'est la sécurité sociale agricole : son compte marche avec FranceConnect." },
    { k: "ahmed", name: "Ahmed", text: "<b>Ahmed</b> a installé l'application <b>L'Identité Numérique La Poste</b> sur son téléphone (il a fait vérifier son identité au bureau de poste).", ok: ["laposte"], why: "L'Identité Numérique La Poste fonctionne avec FranceConnect… et FranceConnect+." }
  ];
  R("fc_choisir", {
    steps: 1,
    render(ctx) {
      const L = ctx.local, G = grader(L);
      if ((ctx.m.step || 0) > 0) return ctx.finalScreen({ theme: null });
      const W = L.W ||= { svc: "caf" };
      L.i ||= 0;
      const f = frame(ctx, { level: 2, title: "Quel compte choisir ?", step: 0,
        consigne: "Sur la page FranceConnect, on choisit <b>un compte qu'on a déjà</b>. Pour chaque personne, cliquez sur le bon compte.",
        help: "Pas de bon ou mauvais compte en général : le bon, c'est celui que la personne possède déjà." });
      const draw = () => {
        const w = WHO[L.i];
        f.panel.innerHTML = w ? `<div class="alert" style="font-size:1.05em">🧑 Personne ${L.i + 1} / ${WHO.length} : ${w.text}<br><b>Quel compte choisit-elle ?</b></div><div class="mk-fb"></div>` : `<div class="mk-q-slot"></div>`;
      };
      draw();
      const tried = {};
      const c = mountFC(ctx, f.host, W, { start: FC + "/choix", onEvent: (type, d, cl) => {
        if (type !== "action" || d.name !== "idp") return;
        const w = WHO[L.i]; if (!w) return;
        const id = d.el.dataset.idp, i = idpOf(id);
        if (w.ok.includes(id)) {
          if (!tried[w.k]) G.ok("who_" + w.k, `Choisir le compte de ${w.name}`);
          cl.flash(`✅ ${w.why}`, "good", 3500); L.i++; draw();
          if (L.i >= WHO.length) end();
        } else {
          if (!tried[w.k]) { tried[w.k] = true; G.ko("who_" + w.k, `Choisir le compte de ${w.name}`, w.why); }
          f.panel.querySelector(".mk-fb").innerHTML = `<div class="alert bad">Pas celui-là : ${esc(i.label)} n'est pas un compte que cette personne possède. Relisez bien.</div>`;
        }
        return;
      } });
      function end() {
        quiz(f.panel.querySelector(".mk-q-slot"), { G, key: "q2", questions: [
          { q: "Je n'ai <b>aucun</b> de ces comptes. Que faire ?", choices: ["FranceConnect ne marche pas pour moi, tant pis", "Créer d'abord un compte : ameli ou impots.gouv.fr par exemple (ou L'Identité Numérique La Poste)", "Utiliser le compte de ma voisine"], ok: 1, why: "Il faut d'abord avoir un compte chez l'un d'eux. Le compte ameli ou impots se crée sur leur site." },
          { q: "Un compte FranceConnect se crée…", choices: ["Sur franceconnect.gouv.fr, avec un nouveau mot de passe", "On ne crée pas de compte FranceConnect : on utilise un compte existant"], ok: 1, why: "Il n'y a pas de « compte FranceConnect » à créer : c'est une passerelle vers vos comptes existants." },
          { q: "Le compte choisi doit être à mon nom, avec mon état civil exact. Pourquoi ?", choices: ["Pour que le site reconnaisse bien la bonne personne", "Ça n'a aucune importance"], ok: 0, why: "Le site reçoit votre nom, vos prénoms, votre date et lieu de naissance : ils doivent être exacts, comme sur l'acte de naissance." }
        ], onDone: () => finish(ctx, G, { key: "fc_choisir", label: "Je sais quel compte choisir", intro: "Vous savez choisir, sur la page FranceConnect, un compte que l'on possède déjà." }) });
      }
      void c;
    }
  });

  /* =========================================================
     NIVEAU 3 — Se connecter, pas à pas
     ========================================================= */
  R("fc_connexion", {
    steps: 1,
    render(ctx) {
      const L = ctx.local, G = grader(L);
      if ((ctx.m.step || 0) > 0) return ctx.finalScreen({ theme: null });
      const W = L.W ||= { svc: "mairie" };
      const f = frame(ctx, { level: 3, title: "Se connecter avec FranceConnect, pas à pas", step: 0,
        consigne: "Marie s'inscrit sur les listes électorales. Elle se connecte avec son <b>compte des impôts</b>, grâce à FranceConnect. Son carnet d'exercice est ci-dessous.",
        help: "Le chemin : bouton FranceConnect › impots.gouv.fr › numéro fiscal et mot de passe › « Continuer » › on revient sur le site de la mairie." });
      const T = tasker(f.panel, [
        { k: "fc", label: "Sur le site de la mairie, cliquez sur <b>S'identifier avec FranceConnect</b>." },
        { k: "idp", label: "Choisissez le compte de Marie : <b>impots.gouv.fr</b>." },
        { k: "login", label: "Tapez le <b>numéro fiscal</b> et le <b>mot de passe</b> du carnet." },
        { k: "consent", label: "Vérifiez les informations transmises, puis <b>Continuer</b>." },
        { k: "validate", label: "De retour sur le site de la mairie : <b>Valider mon inscription</b>." }
      ], { head: SAFE + card() });
      let bad = 0, wrongIdp = 0;
      mountFC(ctx, f.host, W, { start: SVC.mairie.host + "/connexion", onEvent: (type, d, c) => {
        if (type !== "action") return;
        flow(c, W, d, (st, x) => {
          if (st === "fc" && T.done("fc")) G.ok("fc", "Cliquer sur le bouton FranceConnect");
          if (st === "idp") { if (x.id === "impots") { if (T.done("idp")) (wrongIdp ? G.ko : G.ok)("idp", "Choisir son compte (impots.gouv.fr)", "Marie a un compte des impôts : c'est celui-là qu'elle choisit."); } else { wrongIdp++; c.flash("Ce n'est pas le compte de Marie : revenez en arrière et choisissez <b>impots.gouv.fr</b>.", "warn", 5000); } }
          if (st === "badLogin") { bad++; T.note(`<div class="alert">${x.caps ? "🔠 Attention aux majuscules du mot de passe !" : !x.okId ? "🔢 Vérifiez le numéro fiscal : 13 chiffres, sans faute." : "🔑 Le mot de passe ne correspond pas : regardez le carnet, et utilisez l'œil 👁 pour vérifier."}</div>`); }
          if (st === "login" && T.done("login")) (bad ? G.ko : G.ok)("login", "Taper ses identifiants sans erreur", "On recopie lentement, en vérifiant avec l'œil 👁.");
          if (st === "connected" && T.done("consent")) { G.ok("consent", "Vérifier les informations transmises"); c.flash("✅ Retour sur le site de la mairie : Marie est identifiée, ses informations sont déjà remplies !", "good", 5000); }
          if (st === "validate" && T.is("consent") && T.done("validate")) {
            G.ok("validate", "Terminer sa démarche");
            T.note(`<div class="wk-sms" style="max-width:none"><b>📧 Nouveau message · FranceConnect</b><p>Bonjour Marie, vous vous êtes connecté(e) à <b>Mairie de Valbourg</b> via FranceConnect, avec votre compte impots.gouv.fr, aujourd'hui à ${new Date().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}.</p></div>`);
            quiz(T.slot(), { G, key: "q3", questions: [
              { q: "Marie reçoit cet e-mail juste après sa connexion. C'est…", choices: ["Normal : FranceConnect prévient après chaque connexion", "Forcément une arnaque"], ok: 0, why: "FranceConnect envoie un e-mail après chaque connexion. Si vous en recevez un alors que vous n'avez rien fait : prudence, quelqu'un utilise peut-être vos identifiants." },
              { q: "Le mot de passe, Marie l'a tapé sur…", choices: ["Le site de la mairie", "Le site de son compte (impots.gouv.fr), qui s'est ouvert via FranceConnect"], ok: 1, why: "On tape son mot de passe uniquement sur le site du compte choisi. La mairie ne le voit jamais." },
              { q: "Avant de taper le mot de passe, je vérifie…", choices: ["Le vrai nom du site dans la barre d'adresse", "La couleur de la page"], ok: 0, why: "impots.gouv.fr, ameli.fr, franceconnect.gouv.fr… le vrai nom, toujours." }
            ], onDone: () => finish(ctx, G, { key: "fc_connexion", label: "Je sais me connecter avec FranceConnect", intro: "Vous savez faire tout le chemin : bouton FranceConnect, choix du compte, identifiants, vérification des informations, retour sur le site." }) });
          }
        });
      } });
    }
  });

  /* =========================================================
     NIVEAU 4 — Se déconnecter (sur un ordinateur partagé)
     ========================================================= */
  R("fc_deconnexion", {
    steps: 1,
    render(ctx) {
      const L = ctx.local, G = grader(L);
      if ((ctx.m.step || 0) > 0) return ctx.finalScreen({ theme: null });
      const W = L.W ||= { svc: "caf" };
      const f = frame(ctx, { level: 4, title: "Se déconnecter, sur un ordinateur partagé", step: 0,
        consigne: "Marie a consulté ses paiements sur l'<b>ordinateur de la médiathèque</b>, en passant par FranceConnect. Elle a fini : elle doit fermer <b>toutes les portes</b> derrière elle.",
        help: "Avec FranceConnect, il y a deux portes : celle du site (la Caisse des aides), et celle de FranceConnect." });
      const T = tasker(f.panel, [
        { k: "logout", label: "Cliquez sur <b>Se déconnecter</b>, en haut du site." },
        { k: "fcout", label: "FranceConnect pose une question : répondez comme il faut sur un ordinateur <b>partagé</b>." },
        { k: "close", label: "Fermez l'onglet (le ✕ sur l'onglet)." }
      ]);
      mountFC(ctx, f.host, W, { start: SVC.caf.host + "/mon-espace", onEvent: (type, d, c) => {
        if ((type === "tabClose" || type === "allClosed") && T.is("fcout") && T.done("close")) { G.ok("close", "Fermer l'onglet"); end(); }
        if (type !== "action") return;
        flow(c, W, d, st => {
          if (st === "logout" && T.done("logout")) G.ok("logout", "Se déconnecter du site");
          if (st === "fcout" && T.done("fcout")) { G.ok("fcout", "Se déconnecter aussi de FranceConnect"); c.flash("✅ Les deux portes sont fermées. Fermez l'onglet.", "good", 4000); }
          if (st === "fcstay") { if (!G.has("fcout")) G.ko("fcout", "Se déconnecter aussi de FranceConnect", "Sur un ordinateur partagé, on se déconnecte AUSSI de FranceConnect : sinon, la personne suivante entre sans mot de passe."); T.note(`<div class="alert bad">😬 Sur un ordinateur partagé, la personne suivante pourrait entrer sur d'autres sites avec <b>votre</b> FranceConnect ! Revenez en arrière (←) et choisissez « Oui ».</div>`); }
        });
      } });
      function end() {
        if (L.ended) return; L.ended = true;
        quiz(T.slot(), { G, key: "q4", questions: [
          { q: "Chez moi, sur mon ordinateur, je réponds « Non, rester connecté(e) » à FranceConnect. Est-ce grave ?", choices: ["Non : c'est mon ordinateur, personne d'autre ne l'utilise", "Oui, c'est très dangereux"], ok: 0, why: "Chez soi, ce n'est pas grave. Sur un ordinateur partagé (médiathèque, hôtel, ami), on se déconnecte partout." },
          { q: "Fermer l'onglet sans cliquer sur « Se déconnecter », ça suffit ?", choices: ["Oui, toujours", "Pas toujours : on clique d'abord sur « Se déconnecter »"], ok: 1, why: "La session peut rester ouverte un moment. Le bon réflexe : Se déconnecter, puis fermer." }
        ], onDone: () => finish(ctx, G, { key: "fc_deconnexion", label: "Je sais me déconnecter de FranceConnect", intro: "Vous savez fermer les deux portes : le site, puis FranceConnect, surtout sur un ordinateur partagé." }) });
      }
    }
  });

  /* =========================================================
     NIVEAU 5 — Quand ça ne marche pas
     ========================================================= */
  R("fc_problemes", {
    steps: 3,
    render(ctx) {
      const step = ctx.m.step || 0, L = ctx.local, G = grader(L);
      if (step > 2) return ctx.finalScreen({ theme: null });
      const next = () => step < 2 ? ctx.go(step + 1) : null;
      if (step === 0) {
        const W = { svc: "mairie" };
        const f = frame(ctx, { level: 5, title: "Problème 1 / 3 : le mot de passe oublié", step: 0,
          consigne: "Marie ne se souvient plus de son mot de passe des impôts. Elle est sur la page FranceConnect. Où cliquer ?",
          help: "Le mot de passe appartient au compte choisi (impots.gouv.fr) : c'est sur SA page qu'on le récupère." });
        const T = tasker(f.panel, [{ k: "go", label: "Allez sur la page de connexion du compte de Marie (impots.gouv.fr)." }, { k: "forgot", label: "Trouvez le lien pour <b>récupérer le mot de passe</b>, et lancez la demande (numéro fiscal du carnet)." }], { head: card("") });
        let tries = 0;
        mountFC(ctx, f.host, W, { start: FC + "/choix", onEvent: (type, d, c) => {
          if (type !== "action") return;
          flow(c, W, d, (st, x) => {
            if (st === "idp" && x.id === "impots") T.done("go");
            if (st === "idp" && x.id !== "impots") tries++;
            if (st === "badLogin") tries++;
            if (st === "forgot") { if (T.done("forgot")) {} }
            if (st === "reset") { (tries ? G.ko : G.ok)("forgot", "Récupérer un mot de passe oublié", "« Mot de passe oublié ? » se trouve sur la page du compte choisi (impots.gouv.fr), pas sur FranceConnect. On évite de deviner au hasard : le compte peut se bloquer."); T.note(`<div class="alert good">✅ C'est bien sur le site du compte (impots.gouv.fr) qu'on récupère son mot de passe. FranceConnect, lui, ne connaît pas vos mots de passe.</div>`); T.slot().innerHTML = `<button type="button" class="primary" data-n>Problème suivant →</button>`; T.slot().querySelector("[data-n]").addEventListener("click", next); }
          });
        } });
        return;
      }
      if (step === 1) {
        const W = { svc: "caf", ameliFill: true, wrongName: true };
        const f = frame(ctx, { level: 5, title: "Problème 2 / 3 : « Identité non reconnue »", step: 1,
          consigne: "Marie a créé son compte ameli il y a longtemps… avec une <b>faute dans son nom</b>. Elle essaie de se connecter à la Caisse des aides avec ce compte (déjà rempli). Regardez bien les informations transmises.",
          help: "Sur la page « Informations transmises », lisez le nom : est-ce exactement celui de Marie (DUPONT) ?" });
        const T = tasker(f.panel, [{ k: "ameli", label: "Choisissez <b>ameli</b> et connectez-vous (les identifiants sont déjà remplis)." }, { k: "check", label: "Lisez les informations transmises… et réagissez." }], { head: card("") });
        let continued = false;
        mountFC(ctx, f.host, W, { start: FC + "/choix", onEvent: (type, d, c) => {
          if (type !== "action") return;
          flow(c, W, d, (st, x) => {
            if (st === "idp" && x.id === "ameli") T.done("ameli");
            if (st === "idp" && x.id === "impots") W.wrongName = false;
            if (st === "refused") { continued = true; T.note(`<div class="alert bad">⚠️ Le site refuse : le nom transmis (DUPOND) ne correspond pas. Revenez à la connexion et choisissez un compte dont l'état civil est <b>exact</b> : celui des impôts.</div>`); }
            if (st === "other" || (st === "idp" && x.id === "impots")) { if (!T.is("check")) { T.note(`<div class="alert">👀 Bien vu ? Le nom « DUPOND » est faux. Utilisez le compte des impôts, où le nom est juste.</div>`); } }
            if (st === "connected" && W.idp === "impots") {
              T.done("check"); (continued ? G.ko : G.ok)("name", "Repérer une erreur dans l'état civil transmis", "Le nom transmis (DUPOND) n'était pas exact : on choisit un autre compte, puis on fera corriger le compte ameli.");
              T.note(`<div class="alert good">✅ Avec le compte des impôts, le nom est exact : Marie est reconnue. (Elle pourra faire corriger son nom auprès de l'Assurance Maladie.)</div>`);
              T.slot().innerHTML = `<button type="button" class="primary" data-n>Problème suivant →</button>`; T.slot().querySelector("[data-n]").addEventListener("click", next);
            }
          });
        } });
        return;
      }
      const W = { svc: "form" };
      const f = frame(ctx, { level: 5, title: "Problème 3 / 3 : « FranceConnect+ »", step: 2,
        consigne: "Marie veut consulter ses droits à la formation. Ce service demande <b>FranceConnect+</b>. Elle essaie avec son compte des impôts…",
        help: "FranceConnect+ n'accepte que les identités numériques renforcées." });
      const T = tasker(f.panel, [{ k: "fc", label: "Cliquez sur le bouton FranceConnect+." }, { k: "try", label: "Essayez avec <b>impots.gouv.fr</b>. Que se passe-t-il ?" }]);
      mountFC(ctx, f.host, W, { start: SVC.form.host + "/connexion", onEvent: (type, d, c) => {
        if (type !== "action") return;
        flow(c, W, d, (st, x) => {
          if (st === "fc") T.done("fc");
          if ((st === "idpRefused" || st === "idp") && T.is("fc") && T.done("try")) {
            quiz(T.slot(), { G, key: "q5", questions: [
              { q: "Pourquoi le compte des impôts est-il refusé ici ?", choices: ["Le site est en panne", "Ce service demande FranceConnect+ : une identité numérique renforcée", "Le mot de passe est faux"], ok: 1, why: "Pour les démarches sensibles (formation, aides à la rénovation, création d'entreprise…), il faut FranceConnect+." },
              { q: "Pour FranceConnect+, Marie peut utiliser…", choices: ["L'Identité Numérique La Poste ou France Identité", "Son compte Facebook"], ok: 0, why: "Ces identités renforcées vérifient vraiment qui vous êtes (au bureau de poste, ou avec la puce de la carte d'identité)." },
              { q: "Le mot de passe des impôts est oublié. Où le récupérer ?", choices: ["Sur la page de connexion d'impots.gouv.fr (« Mot de passe oublié ? »)", "En appelant FranceConnect"], ok: 0, why: "Chaque compte gère son propre mot de passe. FranceConnect ne connaît pas vos mots de passe." }
            ], onDone: () => finish(ctx, G, { key: "fc_problemes", label: "Je sais réagir quand FranceConnect bloque", intro: "Mot de passe oublié, état civil inexact, FranceConnect+ exigé : vous savez où chercher la solution." }) });
          }
        });
      } });
    }
  });

  /* =========================================================
     NIVEAU 6 — FranceConnect+ et la validation sur le téléphone
     ========================================================= */
  R("fc_plus", {
    steps: 1,
    render(ctx) {
      const L = ctx.local, G = grader(L);
      if ((ctx.m.step || 0) > 0) return ctx.finalScreen({ theme: null });
      const W = L.W ||= { svc: "form" };
      const f = frame(ctx, { level: 6, title: "FranceConnect+ : valider sur son téléphone", step: 0,
        consigne: "Marie a créé son <b>Identité Numérique La Poste</b>. Elle se connecte à son espace formation avec FranceConnect+, et <b>valide sur son téléphone</b>.",
        help: "Sur le téléphone, on vérifie le NOM du service qui demande, puis on valide avec le code secret." });
      f.host.innerHTML = `<div class="fc-duo"><div class="fc-br"></div><div><div class="fc-phone"><div class="fc-phone-scr"></div></div></div></div>`;
      const T = tasker(f.panel, [
        { k: "fc", label: "Cliquez sur <b>S'identifier avec FranceConnect+</b>." },
        { k: "idp", label: "Choisissez <b>L'Identité Numérique La Poste</b>, puis tapez l'adresse e-mail de Marie." },
        { k: "phone", label: "Sur le <b>téléphone</b>, lisez la demande, validez, et tapez le code secret." },
        { k: "consent", label: "Vérifiez les informations, puis <b>Continuer</b>." },
        { k: "twist", label: "Une nouvelle demande arrive sur le téléphone… lisez-la bien !" }
      ], { head: SAFE + `<div class="fc-card">📒 Le carnet de Marie (exercice)<br>E-mail : <b class="mono">${ME.email}</b><br>Code secret de l'application : <b class="mono">${ME.pin}</b></div>` });
      const scr = f.host.querySelector(".fc-phone-scr");
      const clock = () => new Date().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
      let pin = "", mode = "idle", c;
      const phone = () => {
        const top = `<div class="fc-phone-top"><span>${clock()}</span><span>📶 🔋</span></div>`;
        if (mode === "ask") scr.innerHTML = `${top}<div class="fc-notif"><b>📮 L'Identité Numérique · maintenant</b><div><b style="color:#111">Mon espace formation</b> souhaite vérifier votre identité, via FranceConnect+.</div><div>Est-ce bien vous qui venez de le demander ?</div><div class="row"><button type="button" class="no" data-ph="no">Refuser</button><button type="button" class="yes" data-ph="yes">C'est moi, valider</button></div></div>`;
        else if (mode === "pin") scr.innerHTML = `${top}<div style="text-align:center;font-weight:800">Code secret</div><div class="fc-dots">${[0, 1, 2, 3].map(i => `<i class="${i < pin.length ? "on" : ""}"></i>`).join("")}</div><div class="fc-pin">${[1, 2, 3, 4, 5, 6, 7, 8, 9, "", 0, "⌫"].map(k => k === "" ? "<span></span>" : `<button type="button" data-pin="${k}">${k}</button>`).join("")}</div>`;
        else if (mode === "twist") scr.innerHTML = `${top}<div class="fc-notif"><b>📮 L'Identité Numérique · maintenant</b><div><b style="color:#111">Service des impôts</b> souhaite vérifier votre identité, via FranceConnect+.</div><div>Est-ce bien vous qui venez de le demander ?</div><div class="row"><button type="button" class="no" data-ph="tno">Refuser</button><button type="button" class="yes" data-ph="tyes">C'est moi, valider</button></div></div>`;
        else scr.innerHTML = `${top}<div class="fc-phone-msg">${mode === "done" ? "✅ Identité vérifiée" : "📱 Aucune notification"}</div>`;
      };
      phone();
      scr.addEventListener("click", e => {
        const b = e.target.closest("[data-ph],[data-pin]"); if (!b) return;
        if (b.dataset.ph === "no") { mode = "idle"; phone(); T.note(`<div class="alert">Vous avez refusé… mais c'était bien Marie qui se connectait ! Recommencez la connexion sur l'ordinateur.</div>`); goPage(c, idpOf("laposte").url); return; }
        if (b.dataset.ph === "yes") { mode = "pin"; pin = ""; phone(); return; }
        if (b.dataset.pin != null) {
          const k = b.dataset.pin; if (k === "⌫") pin = pin.slice(0, -1); else if (pin.length < 4) pin += k; phone();
          if (pin.length === 4) {
            if (pin !== ME.pin) { pin = ""; phone(); if (!G.has("phone")) G.ko("phone", "Valider sur le téléphone avec son code", "Le code secret se tape sans se tromper : il est personnel, on ne le donne à personne."); T.note(`<div class="alert">🔢 Code incorrect. Regardez le carnet.</div>`); return; }
            mode = "done"; phone(); if (T.done("phone") && !G.has("phone")) G.ok("phone", "Valider sur le téléphone avec son code");
            goPage(c, FC + "/consentement");
          }
          return;
        }
        if (b.dataset.ph === "tno") { mode = "idle"; phone(); if (T.done("twist")) G.ok("twist", "Refuser une demande qu'on n'a pas faite"); T.note(`<div class="alert good">👍 Bravo ! Marie n'avait rien demandé : quelqu'un essaie peut-être d'utiliser son identité. On refuse, et on change le mot de passe de sa messagerie.</div>`); end(); }
        if (b.dataset.ph === "tyes") { mode = "idle"; phone(); if (T.done("twist")) G.ko("twist", "Refuser une demande qu'on n'a pas faite", "On ne valide QUE les demandes qu'on vient de faire soi-même. Une demande surprise = on refuse."); T.note(`<div class="alert bad">😱 Marie n'avait rien demandé ! En validant, elle a peut-être ouvert la porte à un escroc. Une demande surprise : on <b>refuse</b>, toujours.</div>`); end(); }
      });
      c = mountFC(ctx, f.host.querySelector(".fc-br"), W, { start: SVC.form.host + "/connexion", onEvent: (type, d, cl) => {
        if (type !== "action") return;
        flow(cl, W, d, (st, x) => {
          if (st === "fc" && T.done("fc")) G.ok("fc", "Utiliser FranceConnect+");
          if (st === "idpRefused") T.note(`<div class="alert">Ce compte n'est pas accepté ici : choisissez <b>L'Identité Numérique La Poste</b>.</div>`);
          if (st === "lpWait") { if (T.done("idp")) G.ok("idp", "Choisir L'Identité Numérique La Poste"); later(ctx, () => { mode = "ask"; phone(); }, 900); }
          if (st === "connected" && T.done("consent")) { G.ok("consent", "Terminer la connexion"); later(ctx, () => { mode = "twist"; phone(); T.note(`<div class="alert">📱 Tiens ? Une nouvelle notification sur le téléphone de Marie… alors qu'elle n'a rien fait.</div>`); }, 2200); }
        });
      } });
      function end() {
        if (L.ended) return; L.ended = true;
        quiz(T.slot(), { G, key: "q6", questions: [
          { q: "Une demande de validation arrive sur mon téléphone alors que je n'ai rien fait :", choices: ["Je valide pour voir", "Je refuse", "Je donne mon code à la personne qui m'appelle"], ok: 1, why: "On ne valide que ce qu'on vient de demander soi-même." },
          { q: "Mon code secret de l'application, je le donne…", choices: ["À personne, jamais", "Au conseiller qui m'appelle"], ok: 0, why: "Comme le code de la carte bancaire : il ne se donne à personne." },
          { q: "France Identité, c'est…", choices: ["L'application de l'État, avec la carte d'identité au format carte bancaire", "Un site de rencontres"], ok: 0, why: "France Identité utilise la puce de la nouvelle carte d'identité, lue par le téléphone." }
        ], onDone: () => finish(ctx, G, { key: "fc_plus", label: "Je sais valider (ou refuser) sur mon téléphone", intro: "Vous savez vous connecter avec FranceConnect+, valider sur le téléphone avec votre code… et refuser une demande surprise." }) });
      }
    }
  });

  /* =========================================================
     NIVEAU 7 — Les faux FranceConnect
     ========================================================= */
  R("fc_arnaques", {
    steps: 2,
    render(ctx) {
      const step = ctx.m.step || 0, L = ctx.local, G = grader(L);
      if (step === 0) {
        const f = frame(ctx, { level: 7, title: "Les faux FranceConnect", step: 0, noClient: true,
          consigne: "Les escrocs se font passer pour FranceConnect, par e-mail, SMS ou téléphone. Pour chaque message : <b>arnaque</b> ou <b>normal</b> ?" });
        const box = (who, body) => `<div class="wk-sms" style="max-width:none"><b>${who}</b>${body}</div>`;
        const A = ["🚩 Arnaque", "✅ Normal"];
        quiz(f.panel, { G, key: "scam", questions: [
          { label: "E-mail « compte suspendu sous 24 h » : arnaque", q: box("📧 France Connect &lt;securite@franceconnect-verification.com&gt;", "<p>Votre compte FranceConnect sera <b>suspendu sous 24 h</b>. Confirmez vos informations : <u>franceconnect-verification.com</u></p>"), choices: A, ok: 0, why: "Faux : l'adresse n'est pas franceconnect.gouv.fr, il y a une urgence, et un lien. Il n'y a d'ailleurs pas de « compte FranceConnect » à suspendre." },
          { label: "E-mail de connexion juste après s'être connecté : normal", q: box("📧 FranceConnect", "<p>Marie vient de se connecter à la mairie. Elle reçoit : « Vous vous êtes connecté(e) à Mairie de Valbourg via FranceConnect. »</p>"), choices: A, ok: 1, why: "Normal : FranceConnect prévient après chaque connexion. Il ne demande rien, il informe." },
          { label: "Appel d'un « agent FranceConnect » : arnaque", q: box("📞 Appel", "<p>« Bonjour, je suis agent FranceConnect, je finalise votre inscription. Pouvez-vous me donner votre numéro de sécurité sociale ? Je vous donne les trois premiers chiffres… »</p>"), choices: A, ok: 0, why: "Arnaque connue : personne de FranceConnect ne vous appelle pour demander votre numéro de sécurité sociale. On raccroche." },
          { label: "SMS « remboursement, connectez-vous via FranceConnect » : arnaque", q: box("💬 SMS", "<p>Assurance Maladie : un remboursement de 87 € vous attend. Connectez-vous via FranceConnect : <u>ameli-rembourse.info</u></p>"), choices: A, ok: 0, why: "Lien inconnu, argent promis : arnaque. On passe soi-même par le vrai site (ameli.fr) ou l'application." },
          { label: "E-mail de connexion alors qu'on n'a rien fait : se méfier", q: box("📧 FranceConnect", "<p>« Vous vous êtes connecté(e) à <b>Service des impôts</b> via FranceConnect. » Mais Marie n'a rien fait depuis une semaine…</p>"), choices: ["🚩 Quelqu'un utilise peut-être mes identifiants", "✅ Rien à faire"], ok: 0, why: "Si vous n'êtes pas à l'origine de la connexion : changez le mot de passe du compte utilisé (impots, ameli…), et signalez-le à FranceConnect." }
        ], onDone: () => ctx.go(1) });
        return;
      }
      if (step === 1) {
        const f = frame(ctx, { level: 7, title: "Enquête sur un faux site", step: 1,
          consigne: "Marie a cliqué sur un lien reçu par e-mail. La page ressemble à FranceConnect… Trouvez <b>les 4 indices</b> qui prouvent que c'est un faux, en cliquant dessus. Puis quittez le site.",
          help: "Commencez par la barre d'adresse : cliquez sur le petit cadenas ou sur l'adresse." });
        const T = tasker(f.panel, [{ k: "clues", label: "Trouvez les 4 indices (cliquez dessus) : <b><span class=\"fc-n\">0</span> / 4</b>" }, { k: "leave", label: "Ne remplissez rien : fermez l'onglet (✕)." }]);
        const found = new Set(), WHY = { addr: "L'adresse : franceconnect-verification.com, et non franceconnect.gouv.fr", urgence: "L'urgence : « suspendu dans 24 h »", faute: "Une faute : « vous devez confirmé »", carte: "On demande la carte bancaire : FranceConnect ne la demande jamais" };
        const upd = c => { T.tasks[0].label = `Trouvez les 4 indices (cliquez dessus) : <b>${found.size} / 4</b>`; T.draw(); c.container?.querySelectorAll?.(".fc-clue").forEach(e => e.classList.toggle("found", found.has(e.dataset.c))); };
        const mark = () => f.host.querySelectorAll(".fc-clue").forEach(e => e.classList.toggle("found", found.has(e.dataset.c)));
        const add = (k, c) => { if (found.has(k)) return; found.add(k); c.flash(`🔍 ${WHY[k]}`, "good", 4000); upd(c); mark(); if (found.size === 4 && T.done("clues")) G.ok("clues", "Trouver les indices d'un faux site"); };
        mountFC(ctx, f.host, {}, { start: "franceconnect-verification.com/connexion", onEvent: (type, d, c) => {
          if (type === "lock" || type === "addressEdit") add("addr", c);
          if (type === "action" && d.name === "clue") add(d.el.dataset.c, c);
          if (type === "action" && d.name === "fakeSend") { if (!G.has("nofill")) G.ko("nofill", "Ne rien remplir sur un faux site", "Sur un faux site, on ne tape rien : on ferme."); c.flash("🛑 Dans la vraie vie, vos informations seraient parties chez les escrocs ! Ne remplissez jamais un formulaire arrivé par un lien.", "bad", 7000); }
          if (type === "action" && d.name !== "clue") mark();
          if ((type === "tabClose" || type === "allClosed") && T.done("leave")) {
            if (!found.size) T.done("clues");
            if (!G.has("nofill")) G.ok("nofill", "Ne rien remplir sur un faux site");
            G.ok("leave", "Quitter le faux site");
            quiz(T.slot(), { G, key: "q7", questions: [
              { q: "La vraie adresse de FranceConnect se termine par…", choices: ["franceconnect.gouv.fr", "franceconnect-verification.com", "france-connect.info"], ok: 0, why: "« .gouv.fr » : réservé à l'État." },
              { q: "Le cadenas 🔒 est affiché. Le site est donc vrai ?", choices: ["Oui", "Non : le cadenas protège la connexion, il ne prouve pas que le site est honnête"], ok: 1, why: "Les faux sites ont souvent un cadenas. Ce qui compte : le vrai nom du site." },
              { q: "J'ai tapé mes informations sur un faux site. Je…", choices: ["N'en parle à personne", "Change mes mots de passe, appelle ma banque si j'ai donné ma carte, et regarde cybermalveillance.gouv.fr"], ok: 1, why: "On agit vite, sans honte : changer les mots de passe, faire opposition si besoin, signaler." }
            ], onDone: () => finish(ctx, G, { key: "fc_arnaques", label: "Je repère les faux FranceConnect", intro: "Faux e-mails, faux appels, faux sites : vous savez repérer les pièges qui utilisent le nom de FranceConnect." }) });
          }
        } });
        later(ctx, mark, 300);
        return;
      }
      ctx.finalScreen({ theme: null });
    }
  });

  /* =========================================================
     NIVEAU 8 — Mission réelle (sans se connecter)
     ========================================================= */
  const REAL = [
    { id: "ants", icon: "🪪", title: "L'ANTS (carte d'identité, passeport, permis)", site: "ants.gouv.fr" },
    { id: "sp", icon: "📘", title: "Service-public.fr (mon espace)", site: "service-public.fr" },
    { id: "mds", icon: "🤝", title: "Mes droits sociaux", site: "mesdroitssociaux.gouv.fr" },
    { id: "impots", icon: "💶", title: "impots.gouv.fr (espace particulier)", site: "impots.gouv.fr" }
  ];
  R("fc_real", {
    steps: 3,
    render(ctx) {
      let step = ctx.m.step || 0;
      const L = ctx.local, G = grader(L);
      if (step > 0 && !L.pick) step = 0;
      if (step === 0) {
        const f = frame(ctx, { level: 8, title: "Mission réelle : choisissez un site", step: 0, noClient: true,
          consigne: "Sur le <b>vrai Internet</b>, on va observer le bouton FranceConnect d'un vrai site public. On regarde, <b>on ne se connecte pas</b>." });
        f.panel.innerHTML = `<div class="nv-pick">${REAL.map(r => `<button type="button" data-pick="${r.id}"><b>${r.icon} ${r.title}</b><span>${r.site}</span></button>`).join("")}</div>`;
        f.panel.querySelectorAll("[data-pick]").forEach(b => b.addEventListener("click", () => { L.pick = REAL.find(r => r.id === b.dataset.pick); ctx.go(1); }));
        return;
      }
      const r = L.pick;
      if (step === 1) {
        const f = frame(ctx, { level: 8, title: `${r.icon} ${r.title}`, step: 1, noClient: true, consigne: "Lisez toute la mission, puis suivez les étapes." });
        f.panel.innerHTML = `<ol class="nv-steps"><li>Ouvrez un <b>nouvel onglet</b> : <kbd>Ctrl</kbd> + <kbd>T</kbd>. Ne fermez pas l'atelier !</li><li>Allez sur <b>${r.site}</b> (tapez l'adresse, ou cherchez-la). Vérifiez le vrai nom du site.</li><li>Cherchez le bouton pour <b>se connecter</b>, puis le bouton <b>FranceConnect</b>.</li><li>Cliquez dessus, et regardez : l'<b>adresse</b> de la page qui s'ouvre, et les <b>comptes</b> proposés.</li><li><b>Ne choisissez aucun compte</b> : revenez en arrière, et revenez ici par l'onglet « Atelier numérique ».</li></ol>
          <div class="alert bad">🛑 On ne tape <b>aucun</b> identifiant, <b>aucun</b> mot de passe. Un doute ? On lève la main ✋.</div>
          <div class="final-actions"><button type="button" class="secondary" data-change>← Choisir un autre site</button><button type="button" class="primary" data-found>J'ai observé : je réponds →</button></div>`;
        f.panel.querySelector("[data-found]").addEventListener("click", () => ctx.go(2));
        f.panel.querySelector("[data-change]").addEventListener("click", () => { L.pick = null; ctx.go(0); });
        return;
      }
      if (step === 2) {
        const f = frame(ctx, { level: 8, title: `${r.icon} Mes observations`, step: 2, noClient: true, consigne: `Site observé : <b>${r.site}</b>` });
        f.panel.innerHTML = `<div class="nv-real">
          <fieldset class="nv-check"><legend><b>🔵 J'ai trouvé le bouton FranceConnect</b></legend>${["Oui", "Non, je ne l'ai pas trouvé"].map(x => `<label><input type="radio" name="btn" value="${x}"> ${x}</label>`).join("")}</fieldset>
          <fieldset class="nv-check"><legend><b>🌐 Après le clic, l'adresse de la page contenait…</b></legend>${["franceconnect.gouv.fr", "autre chose", "je n'ai pas regardé"].map(x => `<label><input type="radio" name="addr" value="${x}"> ${x}</label>`).join("")}</fieldset>
          <fieldset class="nv-check"><legend><b>🔑 Les comptes proposés</b> (cochez ceux que vous avez vus)</legend>${IDP.map(i => `<label><input type="checkbox" data-idp value="${i.label}"> ${i.ic} ${i.label}</label>`).join("")}</fieldset>
          <fieldset class="nv-check"><legend><b>✅ Je vérifie</b></legend><label><input type="checkbox" data-c="nothing"> Je n'ai choisi aucun compte et tapé aucun identifiant</label><label><input type="checkbox" data-c="mine"> J'ai repéré quel compte <b>moi</b>, j'aurais pu utiliser</label></fieldset>
          <label>💬 Une question ? (facultatif)<input type="text" data-f="note" maxlength="300" autocomplete="off"></label>
          <div class="mk-fb"></div>
          <div class="final-actions"><button type="button" class="secondary" data-back>← Revoir la mission</button><button type="button" class="primary" data-send>📤 Envoyer au formateur</button></div></div>`;
        const $f = s => f.panel.querySelector(s);
        $f("[data-back]").addEventListener("click", () => ctx.go(1));
        $f("[data-send]").addEventListener("click", async () => {
          const btn = f.panel.querySelector('[name="btn"]:checked')?.value || "", addr = f.panel.querySelector('[name="addr"]:checked')?.value || "";
          const idps = [...f.panel.querySelectorAll("[data-idp]:checked")].map(i => i.value), note = $f('[data-f="note"]').value.trim();
          if (!btn || !addr) { $f(".mk-fb").innerHTML = `<div class="alert bad">Répondez aux deux premières questions 🙂</div>`; return; }
          const c = k => $f(`[data-c="${k}"]`).checked;
          $f("[data-send]").disabled = true;
          (btn === "Oui" ? G.ok : G.ko)("btn", "Trouver le bouton FranceConnect sur un vrai site", "Il est sur la page de connexion. On cherchera ensemble !");
          (addr === "franceconnect.gouv.fr" ? G.ok : G.ko)("addr", "Vérifier l'adresse franceconnect.gouv.fr", "Après le clic, l'adresse doit contenir franceconnect.gouv.fr.");
          (idps.length ? G.ok : G.ko)("idps", "Repérer les comptes proposés", "Sur la page FranceConnect, la liste des comptes possibles.");
          (c("nothing") ? G.ok : G.ko)("nothing", "Ne rien taper pendant l'observation", "Pour cette mission, on observe seulement.");
          (c("mine") ? G.ok : G.ko)("mine", "Savoir quel compte j'utiliserais", "Réfléchissons ensemble : impots, ameli, La Poste… lequel avez-vous déjà ?");
          const text = `🇫🇷 Mission réelle FranceConnect\n🌐 Site : ${r.site}\n🔵 Bouton trouvé : ${btn}\n🔗 Adresse après clic : ${addr}\n🔑 Comptes vus : ${idps.join(", ") || "(aucun coché)"}\n${c("nothing") ? "✅" : "⬜"} rien tapé · ${c("mine") ? "✅" : "⬜"} je sais quel compte j'utiliserais${note ? `\n💬 ${note}` : ""}`;
          try { await ctx.api.sendToTeacher?.(`🇫🇷 Mission réelle : FranceConnect`, text.slice(0, 1900)); }
          catch (e) { $f(".mk-fb").innerHTML = `<div class="alert bad">La réponse n'a pas pu partir : ${esc(e.message)}. Réessayez.</div>`; $f("[data-send]").disabled = false; return; }
          finish(ctx, G, { key: "fc_real", label: "J'ai observé FranceConnect sur un vrai site", intro: `${ctx.demo ? "En projection, la réponse n'est pas envoyée." : "📤 Vos observations sont parties chez le formateur : il vous répondra dans votre <b>messagerie</b>."}<br>Site : <b>${esc(r.site)}</b> · Bouton : <b>${esc(btn)}</b> · Adresse : <b>${esc(addr)}</b>` });
        });
        return;
      }
      ctx.finalScreen({ theme: null });
    }
  });

  AN.fcKit = { IDP, SVC, ME, world, fcBtn };
})(window.AN);

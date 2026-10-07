/* =========================================================
   Chapitre « Comptes et mots de passe » : 8 niveaux progressifs.
   On peut toujours continuer après une erreur, chaque erreur est
   expliquée, note /20 à la fin.
   🛡️ Rien de ce qui est tapé n'est enregistré ni envoyé, et on rappelle
   partout de ne jamais utiliser un vrai mot de passe.
   ========================================================= */
(function (AN) {
  "use strict";
  const { esc } = AN.util;
  const R = AN.missions.register;
  const KIT = () => AN.missionKit;
  const B = () => AN.browser;
  const grader = L => AN.mail.grader(L.grade ||= {});
  const SAFE = `<div class="acc-safe">🛡️ Exercice : n'utilisez <u>jamais</u> un vrai mot de passe ici. Rien n'est enregistré.</div>`;
  const PHRASE_J = "Trois tomates dansent sous la pluie !"; // phrase d'exemple, reprise dans les diapositives
  const frame = (ctx, o) => KIT().frame(ctx, { chapter: "Comptes", ...o });
  const tasksHTML = t => KIT().tasksHTML(t);
  const quiz = (el, o) => KIT().inlineQuiz(el, o);
  const alive = ctx => ctx.box.isConnected && ctx.box.__an?.ctx === ctx;
  const finish = (ctx, G, o) => { if (alive(ctx)) return KIT().finish(ctx, G, o); };
  const later = (ctx, fn, ms) => { const t = setTimeout(() => { if (alive(ctx)) fn(); }, ms); ctx.onCleanup(() => clearTimeout(t)); };
  const is = (u, t) => B().normalize(u || "") === B().normalize(t);

  /* =========================================================
     L'UNIVERS : le compte lecteur de la médiathèque, la piscine, la banque
     ========================================================= */
  const MED = "www.mediatheque-valbourg.fr", ACC = MED + "/mon-compte";
  const ME = { first: "Marie", last: "Dupont", email: "marie.dupont@exemple.fr", pw: "Lilas-Bleu-42" };
  const ws = (o, body) => info => `<div class="ws" style="--c:${o.color}">
      <header class="ws-head"><span class="ws-logo">${o.logo}</span>${o.nav ? `<nav class="ws-nav">${o.nav.map(([l, u]) => `<a href="#" data-href="${u}">${l}</a>`).join("")}</nav>` : ""}${o.right ? `<span style="margin-left:auto">${typeof o.right === "function" ? o.right(info) : o.right}</span>` : ""}</header>
      <main class="ws-main">${typeof body === "function" ? body(info) : body}</main>${o.foot ? `<footer class="ws-foot">${o.foot}</footer>` : ""}</div>`;
  const SM = { color: "#7050bf", logo: "📚 Médiathèque de Valbourg", foot: "Médiathèque de Valbourg · 04 00 12 34 56",
    nav: [["Accueil", MED], ["Horaires", MED + "/horaires"], ["Agenda", MED + "/agenda"]],
    right: `<a href="#" data-href="${ACC}/connexion" class="ws-btn" style="background:#fff;color:#7050bf!important">👤 Se connecter</a>` };
  const SMIN = { ...SM, right: info => `<button type="button" class="ws-btn" data-bk-act="logout" style="background:#fff;color:#7050bf">🚪 Se déconnecter</button>` };

  /* Petits morceaux de formulaire (les valeurs restent dans la page, jamais envoyées) */
  const v = (info, k) => esc(info.flags.v?.[k] ?? "");
  const field = (label, name, info, { type = "text", ph = "", hint = "" } = {}) => `<label>${label}<input type="${type}" name="${name}" value="${v(info, name)}" placeholder="${ph}" autocomplete="off" spellcheck="false" autocapitalize="off">${hint ? `<span class="hint">${hint}</span>` : ""}</label>`;
  const pwField = (label, name, { gauge, hint } = {}) => `<label>${label}<span class="pwbox"><input type="password" name="${name}" data-pw ${gauge ? "data-gauge" : ""} autocomplete="new-password" spellcheck="false"><button type="button" class="eye" data-eye aria-label="Afficher le mot de passe" title="Afficher le mot de passe">👁</button></span>
      <span class="caps" hidden>⚠️ La touche <b>Verr. Maj</b> est activée : vous tapez en MAJUSCULES.</span>${gauge ? `<span class="gauge-slot"></span>` : ""}${hint ? `<span class="hint">${hint}</span>` : ""}</label>`;
  const errs = info => info.flags.err ? `<div class="err" role="alert">${[].concat(info.flags.err).map(e => `⚠️ ${e}`).join("<br>")}</div>` : "";

  const PAGES = {
    [MED]: { title: "Médiathèque de Valbourg", short: "Médiathèque", icon: "📚", html: ws(SM, `
      <h2>Bienvenue à la médiathèque !</h2><p>Avec votre <b>compte lecteur</b>, réservez des livres, prolongez vos emprunts et inscrivez-vous aux ateliers.</p>
      <div class="ws-cards"><div class="ws-card"><b>👤 Mon compte lecteur</b><a href="#" data-href="${ACC}/connexion">Se connecter</a></div>
        <div class="ws-card"><b>🆕 Pas encore de compte ?</b><a href="#" data-href="${ACC}/inscription">Créer un compte</a></div></div>`) },
    [ACC + "/connexion"]: { title: "Connexion - Médiathèque", short: "Médiathèque", icon: "📚", html: ws(SM, info => `
      <h2>👤 Connexion à mon compte lecteur</h2>
      <div class="af">${errs(info)}
        ${field("Identifiant (votre adresse e-mail)", "id", info, { ph: "exemple@mail.fr" })}
        ${pwField("Mot de passe", "pw")}
        <label class="check"><input type="checkbox" name="remember"> Se souvenir de moi</label>
        <button type="button" class="ws-btn" data-bk-act="login">Se connecter</button>
        <div class="links"><a href="#" data-href="${ACC}/oubli">Mot de passe oublié ?</a><a href="#" data-href="${ACC}/inscription">Créer un compte</a></div></div>`) },
    [ACC]: { title: "Mon compte - Médiathèque", short: "Mon compte", icon: "📚", html: ws(SMIN, info => {
      const g = info.flags.who === "Gérard";
      return `<h2>Bonjour ${g ? "Gérard Petit" : "Marie Dupont"} 👋</h2>
        <h3>📚 Mes emprunts</h3><table class="ws-table"><tbody>${(g ? [["La cuisine du Sud", "à rendre le 18"], ["Les oiseaux de France", "à rendre le 18"]] : [["Le Petit Prince", "à rendre le 12"], ["Guide de la Drôme", "à rendre le 20"], ["Le monde de Charlie (DVD)", "à rendre le 20"]]).map(([a, b]) => `<tr><td><b>${a}</b></td><td>${b}</td></tr>`).join("")}</tbody></table>
        <p>📍 Adresse : ${g ? "4 rue des Peupliers, Valbourg" : "12 rue des Lilas, Valbourg"} · ☎️ ${g ? "06 12 •• •• 87" : "06 •• •• •• 42"}</p>`;
    }) },
    [ACC + "/deconnecte"]: { title: "Déconnecté - Médiathèque", short: "Médiathèque", icon: "📚", html: ws(SM, `<h2>🚪 Vous êtes déconnecté(e)</h2><p>À bientôt à la médiathèque ! Le compte n'est plus accessible sur cet ordinateur.</p>`) },
    [ACC + "/inscription"]: { title: "Créer un compte - Médiathèque", short: "Médiathèque", icon: "📚", html: ws(SM, info => `
      <h2>🆕 Créer mon compte lecteur</h2><div class="af">${errs(info)}
        ${field("Prénom *", "first", info)}${field("Nom *", "last", info)}${field("Adresse e-mail *", "email", info, { hint: "Elle servira d'identifiant." })}
        ${pwField("Mot de passe *", "pw", { gauge: true, hint: "Au moins 12 caractères. Une phrase, c'est encore mieux !" })}
        ${pwField("Confirmez le mot de passe *", "pw2")}
        <label class="check"><input type="checkbox" name="cgu" ${info.flags.v?.cgu ? "checked" : ""}> J'accepte les <a href="#" data-bk-act="cgu">conditions d'utilisation</a> *</label>
        <label class="check"><input type="checkbox" name="news" ${info.flags.v?.news ? "checked" : ""}> Je veux recevoir la lettre d'information (facultatif)</label>
        <button type="button" class="ws-btn" data-bk-act="signup">Créer mon compte</button><span class="hint">* champ obligatoire</span></div>`) },
    [ACC + "/inscription-envoyee"]: { title: "Presque fini - Médiathèque", short: "Médiathèque", icon: "📚", html: ws(SM, `<h2>📩 Presque fini !</h2><p>Un e-mail de confirmation vient d'être envoyé à <b>${ME.email}</b>.</p><p>Ouvrez-le et <b>cliquez sur le lien</b> pour activer votre compte. (Pensez à regarder dans les « Indésirables ».)</p>`) },
    [ACC + "/oubli"]: { title: "Mot de passe oublié - Médiathèque", short: "Médiathèque", icon: "📚", html: ws(SM, info => `
      <h2>🔑 Mot de passe oublié</h2><p>Indiquez l'adresse e-mail de votre compte : nous vous enverrons un lien pour choisir un nouveau mot de passe.</p>
      <div class="af">${errs(info)}${field("Adresse e-mail", "email", info)}<button type="button" class="ws-btn" data-bk-act="forgot">Envoyer le lien</button></div>`) },
    [ACC + "/oubli-envoye"]: { title: "E-mail envoyé - Médiathèque", short: "Médiathèque", icon: "📚", html: ws(SM, `<h2>📩 E-mail envoyé</h2><p>Si un compte existe avec cette adresse, vous allez recevoir un e-mail avec un lien. <b>Ce lien est valable 30 minutes.</b></p>`) },
    [ACC + "/nouveau-mot-de-passe"]: { title: "Nouveau mot de passe - Médiathèque", short: "Médiathèque", icon: "📚", html: ws(SM, info => `
      <h2>🔑 Choisissez un nouveau mot de passe</h2><div class="af">${errs(info)}
        ${pwField("Nouveau mot de passe", "pw", { gauge: true, hint: "Au moins 12 caractères. Une phrase, c'est encore mieux !" })}${pwField("Confirmez", "pw2")}
        <button type="button" class="ws-btn" data-bk-act="newpw">Enregistrer</button></div>`) },
    [ACC + "/mot-de-passe-change"]: { title: "Mot de passe modifié", short: "Médiathèque", icon: "📚", html: ws(SM, `<h2>✅ Mot de passe modifié</h2><p>Vous pouvez maintenant vous connecter avec votre nouveau mot de passe. Un e-mail de confirmation vous a été envoyé.</p>`) },

    /* --- la piscine (coffre-fort) --- */
    "www.piscine-valbourg.fr/inscription": { title: "Piscine de Valbourg - Inscription", short: "Piscine", icon: "🏊", html: ws({ color: "#0a8fbf", logo: "🏊 Piscine de Valbourg" }, info => `
      <h2>Créer mon compte pour réserver un créneau</h2><div class="af">${errs(info)}
        <label>Adresse e-mail<input name="email" value="${ME.email}" autocomplete="off"></label>
        <label>Mot de passe<span class="pwbox"><input type="password" name="pw" data-pw data-suggest autocomplete="new-password" placeholder="Cliquez ici"><button type="button" class="eye" data-eye aria-label="Afficher le mot de passe">👁</button></span></label>
        <button type="button" class="ws-btn" data-bk-act="poolsignup">Créer mon compte</button></div>`) },
    "www.piscine-valbourg.fr/connexion": { title: "Piscine de Valbourg - Connexion", short: "Piscine", icon: "🏊", html: ws({ color: "#0a8fbf", logo: "🏊 Piscine de Valbourg" }, info => `
      <h2>Connexion</h2><div class="af">${errs(info)}
        <label>Adresse e-mail<input name="email" data-fill autocomplete="off" placeholder="Cliquez ici"></label>
        <label>Mot de passe<span class="pwbox"><input type="password" name="pw" data-pw autocomplete="new-password"><button type="button" class="eye" data-eye aria-label="Afficher le mot de passe">👁</button></span></label>
        <button type="button" class="ws-btn" data-bk-act="poollogin">Se connecter</button></div>`) },
    "www.piscine-valbourg.fr/espace": { title: "Piscine - Mon espace", short: "Piscine", icon: "🏊", html: ws({ color: "#0a8fbf", logo: "🏊 Piscine de Valbourg" }, `<h2>Bonjour Marie 👋</h2><p>🏊 Prochaine séance réservée : <b>mardi 18 h, bassin sportif</b>.</p>`) },

    /* --- la banque (code par SMS) --- */
    "www.banque-valbourg.fr/connexion": { title: "Banque de Valbourg - Connexion", short: "Banque", icon: "🏦", html: ws({ color: "#0b5d4a", logo: "🏦 Banque de Valbourg" }, info => `
      <h2>Accès à mes comptes</h2><div class="af">${errs(info)}
        <label>Identifiant client<input name="id" value="00492217" autocomplete="off"></label>
        <label>Mot de passe<span class="pwbox"><input type="password" name="pw" value="Banque-Exercice-26" autocomplete="new-password"><button type="button" class="eye" data-eye aria-label="Afficher le mot de passe">👁</button></span></label>
        <button type="button" class="ws-btn" data-bk-act="banklogin">Se connecter</button></div>`) },
    "www.banque-valbourg.fr/verification": { title: "Banque de Valbourg - Vérification", short: "Banque", icon: "🏦", html: ws({ color: "#0b5d4a", logo: "🏦 Banque de Valbourg" }, info => `
      <h2>🔐 Vérification de sécurité</h2><p>Pour vous protéger, un <b>code à 6 chiffres</b> vient d'être envoyé par SMS au <b>06 •• •• •• 42</b>.</p>
      <div class="af">${errs(info)}<label>Code reçu par SMS<input name="code" inputmode="numeric" maxlength="6" autocomplete="off" placeholder="______"></label>
        <button type="button" class="ws-btn" data-bk-act="bankcode">Valider</button></div>`) },
    "www.banque-valbourg.fr/comptes": { title: "Banque de Valbourg - Mes comptes", short: "Banque", icon: "🏦", html: ws({ color: "#0b5d4a", logo: "🏦 Banque de Valbourg" }, `<h2>Bonjour Marie 👋</h2><table class="ws-table"><tbody><tr><td><b>Compte courant</b></td><td>1 248,30 €</td></tr><tr><td><b>Livret A</b></td><td>3 500,00 €</td></tr></tbody></table><p class="ws-ad">Compte fictif d'exercice.</p>`) }
  };

  /** Monte le navigateur, avec l'œil 👁, l'alerte Verr. Maj, la jauge et la touche Entrée. */
  function mountB(ctx, el, extra = {}) {
    const L = ctx.local;
    L.client?.destroy();
    L.client = B().client(el, { pages: { ...(AN.navKit?.WORLD || {}), ...PAGES }, index: AN.navKit?.INDEX || [], weakWords: ["valbourg", "fr"], big: ctx.demo, ...extra });
    if (!L.hooked) { L.hooked = true; ctx.onCleanup(() => { L.client?.destroy(); L.phone?.destroy(); L.pir?.destroy(); }); }
    if (!el.dataset.accEnh) {
      el.dataset.accEnh = "1";
      el.addEventListener("click", e => {
        const eye = e.target.closest("[data-eye]"); if (!eye) return;
        e.preventDefault();
        const inp = eye.parentElement.querySelector("input"); const show = inp.type === "password";
        inp.type = show ? "text" : "password"; eye.textContent = show ? "🙈" : "👁"; eye.title = show ? "Masquer" : "Afficher le mot de passe";
        extra.onEye?.(show);
      });
      const caps = e => { const i = e.target.closest?.("[data-pw]"); if (!i || !e.getModifierState) return; const c = i.closest("label")?.querySelector(".caps"); if (c) c.hidden = !e.getModifierState("CapsLock"); };
      el.addEventListener("keydown", caps); el.addEventListener("keyup", caps);
      el.addEventListener("input", e => { const i = e.target.closest?.("[data-gauge]"); if (i) { const s = i.closest("label").querySelector(".gauge-slot"); if (s) s.innerHTML = AN.pw.gauge(i.value, [ME.first, ME.last, "Valbourg", "medi"]); } });
      el.addEventListener("keydown", e => { if (e.key !== "Enter" || !e.target.closest?.(".af input")) return; e.preventDefault(); e.target.closest(".af").querySelector("button.ws-btn[data-bk-act]")?.click(); });
    }
    return L.client;
  }
  /** Relit le formulaire et réaffiche la page avec un message d'erreur (le mot de passe est effacé, comme sur un vrai site). */
  const showErr = (c, err, keep) => { const f = c.fields(); const t = c.tab; t.flags.v = { ...f, pw: "", pw2: "", ...(keep || {}) }; t.flags.err = err; c.render(); };
  const goPage = (c, url, flags = {}) => { c.go(url, "form"); Object.assign(c.tab.flags, flags); c.render(); };

  /* =========================================================
     NIVEAU 1 — Se connecter, se déconnecter   (collectif projetable)
     ========================================================= */
  R("acc_login", {
    steps: 3,
    render(ctx) {
      const step = ctx.m.step || 0, L = ctx.local, G = grader(L);
      if (step === 0) {
        const f = frame(ctx, { level: 1, title: "Se connecter à son compte", step: 0,
          consigne: "Un compte, c'est comme une maison : l'<b>identifiant</b> dit quelle porte, le <b>mot de passe</b> est la clé. Connectez-vous au compte lecteur de Marie.",
          help: "Cliquez sur « Se connecter » en haut du site. Le bouton 👁 permet de vérifier ce que vous avez tapé dans le mot de passe." });
        const tasks = [{ label: "Ouvrez la page de connexion (« 👤 Se connecter »)." }, { label: "Tapez l'identifiant et le mot de passe, puis cliquez sur « Se connecter »." }];
        const draw = (x = "") => { f.panel.innerHTML = `${SAFE}<div class="acc-card" style="margin:8px 0">🗂️ <b>Le carnet de Marie</b><span>Identifiant : <code>${ME.email}</code></span><span>Mot de passe : <code>${ME.pw}</code></span></div>${tasksHTML(tasks)}${x}`; };
        draw();
        let tries = 0, eye = false;
        mountB(ctx, f.host, { start: MED, onEye: s => { if (s) eye = true; }, onEvent: (type, d, c) => {
          if (type === "navigate" && is(d.url, ACC + "/connexion")) { tasks[0].done = true; draw(); }
          if (type === "action" && d.name === "login") {
            const { id, pw } = c.fields();
            const idOk = String(id).trim().toLowerCase() === ME.email, pwOk = pw === ME.pw;
            if (idOk && pwOk) {
              (tries ? G.ko : G.ok)("login", "Se connecter du premier coup", "Identifiant et mot de passe doivent être tapés exactement : majuscules, tirets et chiffres compris.");
              tasks[1].done = true; draw(); goPage(c, ACC);
              c.flash("✅ Vous êtes connecté(e) au compte de Marie !", "good", 2500);
              later(ctx, () => ctx.go(1), 1500); return;
            }
            tries++;
            let why = "Comparez lettre par lettre avec le carnet. Cliquez sur 👁 pour voir ce que vous avez tapé.";
            if (!String(id).trim() || !pw) why = "Il faut remplir les deux cases : l'identifiant ET le mot de passe.";
            else if (!idOk) why = "L'<b>identifiant</b> ne correspond pas : vérifiez l'adresse e-mail (le point, l'arobase @, pas d'espace).";
            else if (pw.toLowerCase() === ME.pw.toLowerCase()) why = "Presque ! Les <b>majuscules</b> comptent dans un mot de passe : « Lilas » et « lilas », ce n'est pas pareil. Vérifiez aussi la touche <kbd>Verr. Maj</kbd>.";
            else if (pw.replace(/\s/g, "") !== pw) why = "Il y a un <b>espace</b> en trop dans le mot de passe.";
            showErr(c, "Identifiant ou mot de passe incorrect.", { id });
            c.flash(`🔐 Les sites disent juste « incorrect », sans dire où est l'erreur. Ici, on vous aide : ${why}${!eye ? "<br>💡 Astuce : le bouton 👁 affiche le mot de passe tapé." : ""}`, "warn", 11000);
            if (tries === 3) c.flash("😮‍💨 Pas de panique. Sur un vrai site, après plusieurs erreurs, le compte peut se bloquer quelques minutes : dans ce cas, on utilise « Mot de passe oublié ? ». Ici, réessayez tranquillement, avec 👁.", "info", 11000);
          }
        } });
        return;
      }
      if (step === 1) {
        const f = frame(ctx, { level: 1, title: "Mon compte, puis je me déconnecte", step: 1,
          consigne: "Vous êtes dans le compte de Marie. Lisez la page, répondez aux questions, puis <b>déconnectez-vous</b>." });
        mountB(ctx, f.host, { start: ACC, onEvent: (type, d, c) => {
          if (type === "action" && d.name === "logout" && L.q1) {
            G.ok("logout", "Se déconnecter"); goPage(c, ACC + "/deconnecte");
            f.panel.innerHTML = tasksHTML([{ label: "Cliquez sur <b>« 🚪 Se déconnecter »</b>, en haut à droite.", done: true }]);
            later(ctx, () => ctx.go(2), 1500);
          } else if (type === "action" && d.name === "logout") c.flash("Répondez d'abord aux questions 🙂", "info", 3000);
        } });
        quiz(f.panel, { G, key: "acc", questions: [
          { q: "Combien de documents Marie a-t-elle empruntés ?", choices: ["2", "3", "5"], ok: 1, why: "Le tableau « Mes emprunts » en compte 3 : deux livres et un DVD." },
          { q: "Quand faut-il rendre <b>Le Petit Prince</b> ?", choices: ["Le 12", "Le 18", "Le 20"], ok: 0, why: "Le tableau indique : à rendre le 12." }
        ], onDone: () => { L.q1 = true; f.panel.innerHTML = tasksHTML([{ label: "Cliquez sur <b>« 🚪 Se déconnecter »</b>, en haut à droite." }]); } });
        return;
      }
      if (step === 2) {
        const f = frame(ctx, { level: 1, title: "L'ordinateur partagé", step: 2,
          consigne: "Vous vous installez à un ordinateur de la médiathèque. Surprise : <b>la personne d'avant ne s'est pas déconnectée</b> ! Que faites-vous ?",
          help: "Ses informations sont privées. Le bon geste rend service à la personne." });
        let done = false;
        f.panel.innerHTML = tasksHTML([{ label: "Faites ce qu'il faut pour protéger le compte de Gérard." }]);
        mountB(ctx, f.host, { start: ACC, onEvent: (type, d, c) => {
          if (type === "action" && d.name === "logout" && !done) {
            done = true; G.ok("gerard", "Déconnecter un compte oublié sur un ordinateur partagé"); goPage(c, ACC + "/deconnecte");
            f.panel.innerHTML = `<div class="alert good">✅ Bravo : en le déconnectant, vous protégez Gérard. Sinon, la personne suivante pourrait voir son adresse, ou réserver à sa place.</div><div class="mk-q-slot"></div>`;
            quiz(f.panel.querySelector(".mk-q-slot"), { G, key: "pub", questions: [
              { q: "Sur l'ordinateur de la médiathèque, je coche « Se souvenir de moi » ?", choices: ["Oui, c'est plus pratique", "Non, jamais sur un ordinateur partagé"], ok: 1, why: "« Se souvenir de moi » garde le compte ouvert pour la personne suivante. Seulement sur <b>son</b> ordinateur ou <b>son</b> téléphone." },
              { q: "J'ai fini. Fermer la fenêtre suffit ?", choices: ["Oui, tout s'efface", "Non : je clique d'abord sur « Se déconnecter »"], ok: 1, why: "Fermer la fenêtre ne déconnecte pas toujours. Le bon réflexe : <b>Se déconnecter</b>, puis fermer." }
            ], onDone: () => finish(ctx, G, { key: "acc_login", label: "Je sais me connecter et me déconnecter", intro: "Vous savez vous connecter à un compte, vérifier votre mot de passe avec 👁, et vous déconnecter, surtout sur un ordinateur partagé." }) });
          }
        } });
        L.client.tab.flags.who = "Gérard"; L.client.render();
        return;
      }
      ctx.finalScreen({ theme: null });
    }
  });

  /* =========================================================
     NIVEAU 2 — Créer un compte
     ========================================================= */
  R("acc_signup", {
    steps: 2,
    render(ctx) {
      const step = ctx.m.step || 0, L = ctx.local, G = grader(L);
      if (step === 0) {
        const f = frame(ctx, { level: 2, title: "Créer un compte", step: 0,
          consigne: "Créez le compte lecteur de Marie sur le site de la médiathèque.",
          help: "Prenez votre temps : chaque case a son rôle. Les champs avec * sont obligatoires." });
        const tasks = [{ label: "Trouvez la page « Créer un compte »." }, { label: `Remplissez le formulaire : <b>Marie</b> · <b>Dupont</b> · <code>${ME.email}</code>` }, { label: "Inventez un <b>mot de passe d'exercice</b> solide, et confirmez-le." }, { label: "Acceptez les conditions, puis cliquez sur « Créer mon compte »." }];
        f.panel.innerHTML = SAFE + tasksHTML(tasks);
        let first = true;
        mountB(ctx, f.host, { start: MED, onEvent: (type, d, c) => {
          if (type === "navigate" && is(d.url, ACC + "/inscription")) { tasks[0].done = true; f.panel.innerHTML = SAFE + tasksHTML(tasks); }
          if (type === "action" && d.name === "cgu") c.flash("📜 Les conditions d'utilisation expliquent les règles du site et ce qu'il fait de vos données. Pour une médiathèque, rien d'inquiétant. Sur un site inconnu, on peut les parcourir.", "info", 8000);
          if (type !== "action" || d.name !== "signup") return;
          const x = c.fields(), E = [], W = [];
          if (!x.first.trim() || !x.last.trim()) { E.push("Le prénom et le nom sont obligatoires."); W.push("Une case obligatoire (*) était vide."); }
          if (!AN.mail.isEmail(x.email)) { E.push("L'adresse e-mail n'est pas valide."); W.push("L'adresse e-mail doit être exacte : c'est là qu'arrive l'e-mail de confirmation."); }
          else if (x.email.trim().toLowerCase() !== ME.email) W.push(`Attention : l'adresse n'est pas celle de Marie (${ME.email}) : l'e-mail de confirmation partirait ailleurs !`);
          const s = AN.pw.strength(x.pw, [ME.first, ME.last, "Valbourg"]);
          if (x.pw.length < 12) { E.push("Le mot de passe doit contenir au moins 12 caractères."); W.push("Le mot de passe était trop court."); }
          else if (s.score < 3) { E.push("Ce mot de passe est trop facile à deviner."); W.push("Le mot de passe était trop facile à deviner : " + (s.reasons[0] || "")); }
          if (x.pw !== x.pw2) { E.push("Les deux mots de passe ne sont pas identiques."); W.push("La confirmation sert à vérifier qu'on n'a pas fait de faute de frappe : les deux doivent être identiques."); }
          if (!x.cgu) { E.push("Vous devez accepter les conditions d'utilisation."); W.push("La case « J'accepte les conditions » est obligatoire."); }
          if (first) {
            first = false;
            (E.length ? G.ko : G.ok)("form", "Remplir le formulaire sans oubli", W.join(" ").replace(/<[^>]+>/g, ""));
            (x.pw.length >= 12 && s.score >= 3 ? G.ok : G.ko)("pw", "Choisir un mot de passe solide", "Au moins 12 caractères, et rien de personnel. Une phrase, c'est l'idéal.");
          }
          if (E.length || x.email.trim().toLowerCase() !== ME.email) {
            showErr(c, E.length ? E : ["Vérifiez l'adresse e-mail."], { cgu: x.cgu, news: x.news });
            c.flash(`📝 ${W.join("<br>")}`, "warn", 11000); return;
          }
          if (x.news) c.flash("📰 Vous avez coché la lettre d'information : c'était facultatif. Pas grave, on peut se désinscrire à tout moment.", "info", 6000);
          tasks.forEach(t => { t.done = true; }); f.panel.innerHTML = SAFE + tasksHTML(tasks);
          goPage(c, ACC + "/inscription-envoyee");
          later(ctx, () => ctx.go(1), 2500);
        } });
        return;
      }
      if (step === 1) {
        const f = frame(ctx, { level: 2, title: "L'e-mail de confirmation", step: 1,
          consigne: "Dernière étape : ouvrez l'e-mail de la médiathèque et <b>cliquez sur le lien</b> pour activer le compte." });
        const tasks = [{ label: "Trouvez l'e-mail de confirmation de la médiathèque." }, { label: "Ouvrez-le et cliquez sur « Activer mon compte »." }];
        f.panel.innerHTML = tasksHTML(tasks);
        const mails = [
          { id: "c_news", from: { name: "Lettre d'info du marché", email: "info@marche-valbourg.fr" }, subject: "Les produits de saison sont arrivés", date: "08:02", body: "<p>Retrouvez nos producteurs locaux tous les samedis matin.</p>" },
          { id: "c_conf", folder: "spam", unread: true, from: { name: "Médiathèque de Valbourg", email: "ne-pas-repondre@mediatheque-valbourg.fr" }, subject: "Confirmez votre adresse e-mail", date: "À l'instant",
            body: `<p>Bonjour Marie,</p><p>Merci pour votre inscription ! Pour activer votre compte lecteur, cliquez sur le lien ci-dessous :</p><p><a href="#" class="mk-link" data-url="https://www.mediatheque-valbourg.fr/mon-compte/activer?c=8F3K2">👉 Activer mon compte</a></p><p>Vous n'êtes pas à l'origine de cette inscription ? Ignorez ce message.</p>` }
        ];
        let hint = setTimeout(() => { if (alive(ctx) && !tasks[0].done) L.client?.flash("💡 Pas dans la boîte de réception ? Les e-mails automatiques arrivent parfois dans les <b>Indésirables</b>. Regardez à gauche !", "info", 9000); }, 20000);
        ctx.onCleanup(() => clearTimeout(hint));
        L.client?.destroy();
        L.client = AN.mail.client(f.host, { mails, me: { name: "Marie Dupont", email: ME.email }, big: ctx.demo, features: { compose: false, reply: false, replyAll: false, forward: false, search: false }, onEvent: (type, d, c) => {
          if (type === "folder" && d === "spam" && !tasks[0].done) { G.ok("spam", "Penser à regarder dans les Indésirables"); c.flash("👀 Bien vu : l'e-mail était dans les <b>Indésirables</b>. Ça arrive souvent avec les e-mails automatiques.", "good", 6000); }
          if (type === "open" && d.mail.id === "c_conf") { tasks[0].done = true; f.panel.innerHTML = tasksHTML(tasks); if (!G.has("spam")) G.ok("spam", "Penser à regarder dans les Indésirables"); }
          if (type === "link" && d.mail?.id === "c_conf" && !tasks[1].done) {
            tasks[1].done = true; G.ok("activate", "Activer son compte avec le lien de confirmation");
            c.flash("✅ Compte activé ! Marie peut maintenant se connecter.", "good", 4000);
            f.panel.innerHTML = tasksHTML(tasks) + `<div class="mk-q-slot"></div>`;
            quiz(f.panel.querySelector(".mk-q-slot"), { G, key: "why", questions: [
              { q: "À quoi sert cet e-mail de confirmation ?", choices: ["À vérifier que l'adresse e-mail est bien la vôtre", "À vous vendre quelque chose", "À rien, on peut l'ignorer"], ok: 0, why: "Le site vérifie que l'adresse existe et vous appartient. Sans clic sur le lien, le compte reste souvent inactif." },
              { q: "Vous recevez un e-mail de confirmation pour un site où vous ne vous êtes <b>jamais</b> inscrit(e)…", choices: ["Je clique pour voir", "Je ne clique pas, je l'ignore ou je le supprime"], ok: 1, why: "Quelqu'un s'est peut-être trompé d'adresse, ou c'est un piège. On ne clique pas." }
            ], onDone: () => finish(ctx, G, { key: "acc_signup", label: "Je sais créer un compte", intro: "Vous savez remplir un formulaire d'inscription, choisir un mot de passe solide et activer votre compte grâce à l'e-mail de confirmation." }) });
          }
        } });
        if (!L.hooked) { L.hooked = true; ctx.onCleanup(() => L.client?.destroy()); }
        return;
      }
      ctx.finalScreen({ theme: null });
    }
  });

  /* =========================================================
     NIVEAU 3 — Le simulateur : pourquoi un mot de passe tient (ou pas)
     ========================================================= */
  const SNOOP = { // ce qu'un profil public peut révéler, et ce qu'un mot de passe en fait
    rex: "Rex (son chien)", y1952: "1952 (son année de naissance)", lucas: "Lucas (son petit-fils)", valbourg: "Valbourg (sa ville)"
  };
  const TRY = [
    { pw: "soleil", kind: "courant", why: "C'est l'un des mots de passe les plus utilisés en France : il est dans la liste que les logiciels essaient en premier." },
    { pw: "Rex1952", kind: "perso", why: "Le nom de son chien + son année de naissance. Deux informations qu'elle publie sur les réseaux : un logiciel les combine en premier." },
    { pw: "Lucas2015!", kind: "perso", why: "Le prénom de son petit-fils + l'année de sa naissance + un « ! ». Le point d'exclamation ne change presque rien : les logiciels essaient ces variantes automatiquement." },
    { pw: "Valbourg26", kind: "perso", why: "Sa ville + son département. Des mots qu'on devine en regardant son profil." }
  ];
  R("acc_pirate", {
    steps: 3,
    render(ctx) {
      const step = ctx.m.step || 0, L = ctx.local, G = grader(L);
      if (step === 0) {
        const f = frame(ctx, { level: 3, title: "Le simulateur : pourquoi un mot de passe tient", step: 0, noClient: true,
          consigne: "Un outil mesure la solidité d'un mot de passe : il affiche le <b>temps qu'un logiciel de pirate</b> mettrait à le trouver. Testons les mots de passe que les gens choisissent <u>le plus souvent</u>.",
          help: "On ne tape jamais de vrai mot de passe : ici, on observe des exemples." });
        L.i ||= 0;
        const draw = () => {
          const t = TRY[L.i];
          const sg = AN.pw.strength(t.pw, Object.values(SNOOP).map(x => x.split(" ")[0]));
          f.panel.innerHTML = `${SAFE}<div class="acc-card" style="display:block;margin:8px 0;width:100%;box-sizing:border-box">
              <div>Exemple ${L.i + 1} / ${TRY.length} — un mot de passe « ${t.kind === "courant" ? "très courant" : "fait avec ses infos personnelles"} » :</div>
              <code style="font-size:1.4em;display:inline-block;margin:6px 0">${esc(t.pw)}</code>${AN.pw.gauge(t.pw, Object.values(SNOOP).map(x => x.split(" ")[0]))}</div>
            <div class="alert ${sg.score >= 3 ? "good" : "bad"}">${sg.score >= 3 ? "🛡️ " : "🔓 "}Trouvé <b>${sg.time === "instantanément" ? "instantanément" : "en " + sg.time}</b>. ${t.why}</div>
            <button type="button" class="primary" data-next>${L.i + 1 < TRY.length ? "Exemple suivant →" : "Comment font-ils ? →"}</button>`;
          f.panel.querySelector("[data-next]").addEventListener("click", () => { if (L.i + 1 < TRY.length) { L.i++; draw(); } else ctx.go(1); });
        };
        draw();
        return;
      }
      if (step === 1) {
        const f = frame(ctx, { level: 3, title: "Les 3 méthodes des pirates", step: 1, noClient: true,
          consigne: "Les pirates ont trois grandes méthodes. Les connaître, c'est déjà se protéger." });
        quiz(f.panel, { G, key: "meth", title: `<div class="acc-split" style="margin-bottom:10px"><div>${AN.social.profile(AN.social.JOSIANE, { static: true })}</div><div class="alert">👆 Josiane publie son chien <b>Rex</b>, son année de naissance <b>1952</b>, son petit-fils <b>Lucas</b>… Tout ça peut servir à deviner son mot de passe.</div></div>`, questions: [
          { q: "Un site marchand se fait voler ses mots de passe. Pourquoi est-ce grave si j'utilise <b>le même mot de passe partout</b> ?", choices: ["Ce n'est pas grave", "Les pirates l'essaient automatiquement sur ma messagerie, ma banque…", "Le site me rembourse"], ok: 1, why: "C'est la méthode la plus fréquente : les mots de passe volés sont essayés sur des milliers d'autres sites. Un mot de passe <b>différent par site</b> limite les dégâts." },
          { q: "Quels mots de passe un logiciel essaie-t-il en tout premier ?", choices: ["Les plus courants : 123456, azerty, soleil…", "Les plus longs", "Ceux avec des accents"], ok: 0, why: "Des listes de millions de mots de passe courants circulent. Ils sont testés en quelques secondes." },
          { q: "Josiane utilise « Rex1952 ». Comment un pirate peut-il le deviner ?", choices: ["Par hasard", "En lisant son profil public : son chien et son année de naissance", "C'est impossible"], ok: 1, why: "Tout ce qu'on publie (prénoms, animaux, dates) peut servir. C'est pour ça qu'un mot de passe ne doit rien avoir à voir avec sa vie." }
        ], onDone: () => ctx.go(2) });
        return;
      }
      if (step === 2) {
        const f = frame(ctx, { level: 3, title: "Et le mien ?", step: 2, noClient: true,
          consigne: "Petit bilan personnel, <b>sans jamais taper votre vrai mot de passe</b> : cochez seulement ce qui est vrai pour vous." });
        const items = [["perso", "Il contient le nom d'un proche ou d'un animal"], ["date", "Il contient une date (naissance, mariage…)"], ["same", "Je l'utilise sur plusieurs sites"], ["short", "Il fait moins de 12 caractères"], ["word", "C'est un seul mot, avec parfois un chiffre au bout"]];
        f.panel.innerHTML = `${SAFE}<div class="acc-checklist">${items.map(([k, t]) => `<label><input type="checkbox" data-k="${k}"> ${t}</label>`).join("")}</div><div class="mk-fb"></div><button type="button" class="primary" data-end>Voir mon bilan →</button>`;
        f.panel.querySelector("[data-end]").addEventListener("click", () => {
          const n = f.panel.querySelectorAll("[data-k]:checked").length;
          G.ok("bilan", "Faire le point sur ses propres habitudes");
          const fb = n ? `🛠️ <b>${n} point${n > 1 ? "s" : ""} à améliorer</b>, et c'est normal : presque tout le monde commence comme ça. Le niveau 4 apprend à fabriquer une phrase de passe, et le niveau 5 à ne plus rien retenir grâce au coffre-fort.` : "🛡️ Rien de coché : bravo ! Vérifiez quand même que vous n'avez pas le même mot de passe sur votre messagerie et ailleurs.";
          finish(ctx, G, { key: "acc_pirate", label: "Je comprends ce qui rend un mot de passe fragile", intro: `${fb}<br>Vous avez vu les 3 méthodes des pirates : les fuites (le même mot de passe partout), les mots de passe courants, et les infos personnelles publiées.` });
        });
        return;
      }
      ctx.finalScreen({ theme: null });
    }
  });

  /* =========================================================
     NIVEAU 4 — Fabriquer une phrase de passe
     ========================================================= */
  const WORDS = [["Un nombre", ["Trois", "Sept", "Douze", "Mille"]], ["Des choses ou des animaux", ["tomates", "girafes", "parapluies", "casseroles", "escargots"]], ["Une action", ["dansent", "chantent", "dorment", "rêvent", "jonglent"]], ["Un endroit", ["sous la pluie", "dans la lune", "sur le toit", "au marché", "dans un sac"]], ["Pour finir", ["!", "?", "…"]]];
  const TESTS = [
    ["azerty123", false, "Les touches du clavier dans l'ordre, puis 123 : dans toutes les listes des pirates."],
    ["Rex1952", false, "Un prénom (ou un animal) + une année : le schéma le plus deviné."],
    ["P@ssw0rd", false, "« Password » déguisé : les logiciels connaissent l'astuce des @ et des 0."],
    ["Le café du matin chante !", true, "Une phrase de 5 mots, sans rapport avec ma vie : longue et facile à retenir."],
    ["kT9#q", false, "Compliqué à retenir… mais trop court : 5 caractères seulement."],
    ["Sept girafes rêvent sur le toit", true, "Une image farfelue de 6 mots : très solide."]
  ];
  R("acc_phrase", {
    steps: 3,
    render(ctx) {
      const step = ctx.m.step || 0, L = ctx.local, G = grader(L);
      if (step === 0) {
        const f = frame(ctx, { level: 4, title: "Fabriquer une phrase de passe", step: 0, noClient: true,
          consigne: "La recette : <b>4 mots ou plus, qui n'ont rien à voir avec votre vie</b>, pour faire une petite image farfelue. Exemple : « Trois tomates dansent sous la pluie ! »" });
        f.panel.innerHTML = `${SAFE}<p>Cliquez sur des mots pour composer, ou écrivez votre propre phrase :</p>
          ${WORDS.map(([t, ws]) => `<div style="margin:6px 0"><small><b>${t}</b></small><div class="acc-words">${ws.map(w => `<button type="button" data-w="${esc(w)}">${esc(w)}</button>`).join("")}</div></div>`).join("")}
          <p><input class="acc-phrase" data-phrase placeholder="Votre phrase de passe d'exercice…" autocomplete="off" spellcheck="false"></p>
          <div class="gauge-slot">${AN.pw.gauge("")}</div>
          <div class="final-actions"><button type="button" class="secondary" data-clear>Effacer</button><button type="button" class="primary" data-ok>Valider ma phrase ✔</button></div><div class="mk-fb"></div>`;
        const inp = f.panel.querySelector("[data-phrase]"), slot = f.panel.querySelector(".gauge-slot");
        const upd = () => { slot.innerHTML = AN.pw.gauge(inp.value, [ME.first, ME.last, "Valbourg"]); };
        inp.addEventListener("input", upd);
        f.panel.querySelectorAll("[data-w]").forEach(b => b.addEventListener("click", () => { const w = b.dataset.w; inp.value = (inp.value + ((/^[!?…]$/.test(w) || !inp.value) ? (/^[!?…]$/.test(w) ? " " : "") : " ") + w).trim(); upd(); }));
        f.panel.querySelector("[data-clear]").addEventListener("click", () => { inp.value = ""; upd(); });
        let first = true;
        f.panel.querySelector("[data-ok]").addEventListener("click", () => {
          const p = inp.value.trim(), s = AN.pw.strength(p, [ME.first, ME.last, "Valbourg"]), n = p.split(/\s+/).filter(w => w.length > 1).length;
          const fb = f.panel.querySelector(".mk-fb");
          if (n < 4 || s.score < 3) {
            if (first) { first = false; G.ko("phrase", "Fabriquer une phrase de passe solide", "Il faut au moins 4 mots, sans information personnelle."); }
            fb.innerHTML = `<div class="alert bad">${n < 4 ? `Votre phrase a <b>${n} mot${n > 1 ? "s" : ""}</b> : visez-en au moins 4.` : "Pas encore assez solide : regardez les conseils sous la jauge."}</div>`; return;
          }
          if (first) G.ok("phrase", "Fabriquer une phrase de passe solide");
          fb.innerHTML = `<div class="alert good">🛡️ Bravo : « <b>${esc(p)}</b> » serait trouvé en <b>${s.time}</b>. Pour la retenir, <b>imaginez la scène</b> dans votre tête.<br>⚠️ C'était un entraînement : chez vous, inventez-en une <b>nouvelle</b> pour vos vrais comptes.</div><button type="button" class="primary" data-next>Continuer →</button>`;
          fb.querySelector("[data-next]").addEventListener("click", () => ctx.go(1));
        });
        return;
      }
      if (step === 1) {
        const f = frame(ctx, { level: 4, title: "Solide ou fragile ?", step: 1, noClient: true, consigne: "Pour chaque mot de passe, votre avis : solide ou fragile ?" });
        quiz(f.panel, { G, key: "sf", questions: TESTS.map(([p, ok, why]) => ({ q: `<code class="mono" style="font-size:1.3em">${esc(p)}</code>`, choices: ["🔓 Fragile", "🔒 Solide"], ok: ok ? 1 : 0, why: `${why} Un logiciel de pirate le trouve <b>${AN.pw.strength(p).time === "instantanément" ? "instantanément" : "en " + AN.pw.strength(p).time}</b>.` })), onDone: () => ctx.go(2) });
        return;
      }
      if (step === 2) {
        const f = frame(ctx, { level: 4, title: "Les bonnes habitudes", step: 2, noClient: true, consigne: "Un bon mot de passe, c'est bien. Bien s'en servir, c'est mieux !" });
        quiz(f.panel, { G, key: "hab", questions: [
          { q: "J'ai une super phrase de passe. Je l'utilise…", choices: ["Partout, comme ça je ne l'oublie pas", "Pour un seul compte : un mot de passe différent par site"], ok: 1, why: "Si un site se fait voler ses mots de passe, les pirates essaieront la même partout. Le niveau 5 montre comment tout retenir sans effort : le coffre-fort." },
          { q: "Où noter mes mots de passe ?", choices: ["Sur un post-it collé à l'écran", "Dans un carnet rangé chez moi, ou dans le coffre-fort du navigateur ou du téléphone", "Dans un e-mail envoyé à moi-même"], ok: 1, why: "Un carnet à la maison, c'est très bien (pas dans le sac avec le téléphone !). Le coffre-fort numérique, c'est encore plus pratique." },
          { q: "Quel compte protéger avec le mot de passe le plus solide ?", choices: ["Ma messagerie", "Le site de recettes"], ok: 0, why: "Avec votre messagerie, un pirate peut cliquer sur « Mot de passe oublié » sur TOUS vos autres sites. C'est la clé de toutes les clés." }
        ], onDone: () => finish(ctx, G, { key: "acc_phrase", label: "Je sais fabriquer une phrase de passe", intro: "Vous savez fabriquer une phrase de passe solide et facile à retenir, et vous connaissez les bonnes habitudes : un mot de passe par site, et la messagerie bien protégée." }) });
        return;
      }
      ctx.finalScreen({ theme: null });
    }
  });

  /* =========================================================
     NIVEAU 5 — Le coffre-fort à mots de passe (ordinateur ou iPhone)
     ========================================================= */
  const SUGG = "Vk7p-Rt9w-mBq2-Lx4c";
  const POOL = "www.piscine-valbourg.fr";
  R("acc_vault", {
    steps: 4,
    render(ctx) {
      let step = ctx.m.step || 0;
      const L = ctx.local, G = grader(L);
      if (step > 0 && step < 3 && !L.plat) step = 0;
      if (step === 0) {
        const f = frame(ctx, { level: 5, title: "Le coffre-fort à mots de passe", step: 0, noClient: true,
          consigne: "Un <b>coffre-fort à mots de passe</b> retient tout à votre place : il <b>invente</b> des mots de passe solides, les <b>enregistre</b> et les <b>remplit</b> tout seul. Vous n'avez plus qu'une seule clé à connaître : celle de votre compte Google ou Apple, ou le code de votre téléphone." });
        f.panel.innerHTML = `<p><b>Sur quel appareil voulez-vous vous entraîner ?</b></p><div class="acc-choice">
          <button type="button" data-p="pc"><span>💻</span><b>Sur ordinateur</b><small>Comme avec Chrome (le gestionnaire de mots de passe Google)</small></button>
          <button type="button" data-p="ios"><span>📱</span><b>Sur iPhone</b><small>Comme avec l'app « Mots de passe » d'Apple</small></button></div>
          <p class="hint">Simulation : les écrans ressemblent aux vrais, sans être identiques.</p>`;
        f.panel.querySelectorAll("[data-p]").forEach(b => b.addEventListener("click", () => { L.plat = b.dataset.p; ctx.go(1); }));
        return;
      }
      const pc = L.plat === "pc";
      /* ---------- Ordinateur ---------- */
      if (pc && step === 1) {
        const f = frame(ctx, { level: 5, title: "💻 Le mot de passe suggéré", step: 1,
          consigne: "Marie s'inscrit à la piscine. Laissez le navigateur <b>inventer</b> le mot de passe, puis <b>enregistrez-le</b> dans le coffre-fort.",
          help: "Cliquez dans la case « Mot de passe » : une petite fenêtre apparaît sous la barre d'adresse." });
        const tasks = [{ label: "Cliquez dans la case <b>Mot de passe</b>." }, { label: "Choisissez <b>« Utiliser le mot de passe suggéré »</b>." }, { label: "Cliquez sur <b>« Créer mon compte »</b>, puis <b>enregistrez</b> le mot de passe." }];
        const draw = () => { f.panel.innerHTML = tasksHTML(tasks); };
        draw();
        let used = false;
        const c = mountB(ctx, f.host, { start: POOL + "/inscription", onEvent: (type, d, cl) => {
          if (type === "bubble" && d.name === "use") {
            const i = f.host.querySelector('[name="pw"]'); i.value = SUGG; used = true; cl.bubble(null);
            tasks[0].done = tasks[1].done = true; draw(); G.ok("suggest", "Utiliser le mot de passe suggéré");
            cl.flash("🔒 Le navigateur a inventé un mot de passe très solide. Pas besoin de le retenir : il va le garder pour vous.", "good", 6000);
          }
          if (type === "bubble" && d.name === "own") { cl.bubble(null); cl.flash("On peut aussi taper le sien. Mais ici, essayez la suggestion : elle est plus solide, et vous n'avez rien à retenir !", "info", 6000); }
          if (type === "action" && d.name === "poolsignup") {
            if (!used) { G.ko("suggest", "Utiliser le mot de passe suggéré", "Le mot de passe suggéré est inventé au hasard, très solide, et retenu par le coffre-fort."); cl.flash("Cliquez dans la case « Mot de passe » et choisissez la suggestion 🙂", "info", 5000); return; }
            cl.bubble(`<h4>🔑 Enregistrer le mot de passe ?</h4><p>Pour <b>piscine-valbourg.fr</b></p><p class="tag">Nom d'utilisateur : ${ME.email}<br>Mot de passe : ••••••••••••••</p>
              <div class="row"><button type="button" data-bk-bubble="never">Jamais</button><button type="button" class="main" data-bk-bubble="save">Enregistrer</button></div>`);
          }
          if (type === "bubble" && d.name === "never") { G.ko("save", "Enregistrer le mot de passe dans le coffre-fort", "« Jamais » : le navigateur ne retiendra rien pour ce site, et vous devrez retenir ce mot de passe compliqué !"); cl.bubble(null); cl.flash("Avec « Jamais », il faudrait retenir ce mot de passe compliqué… Cliquez à nouveau sur « Créer mon compte » et choisissez « Enregistrer ».", "warn", 8000); }
          if (type === "bubble" && d.name === "save") {
            G.ok("save", "Enregistrer le mot de passe dans le coffre-fort"); L.saved = true; cl.bubble(null);
            tasks[2].done = true; draw(); goPage(cl, POOL + "/espace");
            cl.flash("✅ Mot de passe enregistré dans le coffre-fort !", "good", 3000);
            later(ctx, () => ctx.go(2), 2200);
          }
        } });
        f.host.addEventListener("focusin", e => {
          if (e.target.matches?.("[data-suggest]") && !used) c.bubble(`<h4>🔑 Mot de passe suggéré</h4><p>Le navigateur propose un mot de passe très solide, et le retiendra pour vous :</p><p><code>${SUGG}</code></p>
            <div class="row"><button type="button" data-bk-bubble="own">Choisir le mien</button><button type="button" class="main" data-bk-bubble="use">Utiliser le mot de passe suggéré</button></div>`);
        });
        return;
      }
      if (pc && step === 2) {
        const f = frame(ctx, { level: 5, title: "💻 Reconnexion et coffre-fort", step: 2,
          consigne: "Une semaine plus tard, Marie revient sur le site de la piscine. Elle ne se souvient pas du mot de passe… mais le coffre-fort, si !",
          help: "Cliquez dans la case « Adresse e-mail » : le navigateur propose le compte enregistré. Pour voir un mot de passe enregistré : la clé 🔑 en haut à droite." });
        const tasks = [{ label: "Cliquez dans la case <b>Adresse e-mail</b> et choisissez le compte proposé." }, { label: "Cliquez sur <b>« Se connecter »</b>." }, { label: "Ouvrez le coffre-fort (la clé <b>🔑</b> en haut) et affichez le mot de passe de la piscine." }];
        const draw = (x = "") => { f.panel.innerHTML = `<div class="acc-card">💻 Code de l'ordinateur d'exercice : <code>2580</code></div>${tasksHTML(tasks)}${x}`; };
        draw();
        let filled = false;
        const vaultList = () => `<h4>🔑 Gestionnaire de mots de passe</h4><p class="tag">3 mots de passe enregistrés</p>
          <button type="button" class="pick" data-bk-bubble="entry">🏊 <span><b>piscine-valbourg.fr</b><br><span class="tag">${ME.email}</span></span></button>
          <button type="button" class="pick" disabled>📚 <span><b>mediatheque-valbourg.fr</b><br><span class="tag">${ME.email}</span></span></button>
          <button type="button" class="pick" disabled>🛒 <span><b>marche-valbourg.fr</b><br><span class="tag">${ME.email}</span></span></button>
          <div class="row"><button type="button" data-bk-bubble="close">Fermer</button></div>`;
        const c = mountB(ctx, f.host, { start: POOL + "/connexion", tools: [{ id: "vault", icon: "🔑", label: "Mots de passe enregistrés" }], onEvent: (type, d, cl) => {
          if (type === "bubble" && d.name === "fill") {
            f.host.querySelector('[name="email"]').value = ME.email; f.host.querySelector('[name="pw"]').value = SUGG; filled = true; cl.bubble(null);
            tasks[0].done = true; draw(); G.ok("fill", "Laisser le coffre-fort remplir le formulaire");
          }
          if (type === "action" && d.name === "poollogin") {
            if (!filled) { cl.flash("Cliquez d'abord dans la case « Adresse e-mail » : le navigateur va proposer le compte enregistré.", "info", 5000); return; }
            tasks[1].done = true; draw(); goPage(cl, POOL + "/espace"); cl.flash("✅ Connectée, sans rien taper !", "good", 3000);
          }
          if (type === "tool" && d.id === "vault") cl.bubble(vaultList());
          if (type === "bubble" && d.name === "close") cl.bubble(null);
          if (type === "bubble" && d.name === "entry") cl.bubble(`<h4>🏊 piscine-valbourg.fr</h4><p class="tag">Nom d'utilisateur : ${ME.email}</p><p>Mot de passe : •••••••••••••• </p>
            <p>🔐 Pour afficher le mot de passe, tapez le <b>code de l'ordinateur</b> :</p><input data-pin inputmode="numeric" maxlength="6" style="font:inherit;border:1px solid #c9d1db;border-radius:8px;padding:6px 8px">
            <div class="row"><button type="button" data-bk-bubble="close">Fermer</button><button type="button" class="main" data-bk-bubble="pin">Afficher</button></div>`);
          if (type === "bubble" && d.name === "pin") {
            const pin = f.host.querySelector("[data-pin]")?.value.trim();
            if (pin !== "2580") { cl.flash("Ce n'est pas le bon code. Le code de l'ordinateur d'exercice est écrit au-dessus : 2580.", "warn", 5000); G.ko("pin", "Afficher un mot de passe enregistré", "Le coffre-fort demande le code de l'ordinateur (ou du téléphone) : c'est ce qui le protège."); return; }
            G.ok("pin", "Afficher un mot de passe enregistré");
            cl.bubble(`<h4>🏊 piscine-valbourg.fr</h4><p class="tag">Nom d'utilisateur : ${ME.email}</p><p>Mot de passe : <code>${SUGG}</code></p><div class="row"><button type="button" class="main" data-bk-bubble="close">Fermer</button></div>`);
            tasks[2].done = true; draw(`<div class="alert good">👀 Le coffre-fort est protégé par le code de l'ordinateur : quelqu'un qui passe derrière vous ne peut pas voir vos mots de passe.</div>`);
            later(ctx, () => ctx.go(3), 3500);
          }
        } });
        f.host.addEventListener("focusin", e => {
          if (e.target.matches?.("[data-fill]") && !filled) c.bubble(`<h4>🔑 Mot de passe enregistré</h4><button type="button" class="pick" data-bk-bubble="fill">👤 <span><b>${ME.email}</b><br><span class="tag">••••••••••••••</span></span></button><p class="tag">Gérer les mots de passe…</p>`);
        });
        return;
      }
      /* ---------- iPhone ---------- */
      if (!pc && (step === 1 || step === 2)) {
        const f = frame(ctx, step === 1 ? { level: 5, title: "📱 Le mot de passe fort", step: 1,
          consigne: "Sur son iPhone, Marie s'inscrit dans l'appli de la piscine. Laissez le téléphone <b>inventer</b> le mot de passe : il l'enregistre tout seul.",
          help: "Touchez la case « Mot de passe » sur l'écran du téléphone." } : { level: 5, title: "📱 L'app « Mots de passe »", step: 2,
          consigne: "Marie veut retrouver le mot de passe de la piscine. Ouvrez l'app <b>« Mots de passe »</b> du téléphone.",
          help: "Revenez à l'écran d'accueil du téléphone (la barre en bas), puis touchez l'icône 🔑." });
        const tasks = step === 1 ? [{ label: "Touchez la case <b>Mot de passe</b> dans l'appli." }, { label: "Choisissez <b>« Utiliser le mot de passe fort »</b>." }, { label: "Touchez <b>« S'inscrire »</b>." }]
          : [{ label: "Ouvrez l'app <b>🔑 Mots de passe</b>." }, { label: "Déverrouillez avec <b>Face ID</b> (votre visage)." }, { label: "Ouvrez <b>piscine-valbourg.fr</b> et affichez le mot de passe." }];
        const draw = (x = "") => { f.panel.innerHTML = tasksHTML(tasks) + x; };
        draw();
        f.host.innerHTML = `<div style="padding:10px 0"></div>`;
        L.phone?.destroy();
        const form = (pwShown, sugg) => `<div class="pv-form"><b>🏊 Piscine de Valbourg</b><small>Créer mon compte</small>
          <input value="${ME.email}" readonly><button type="button" class="pv-row" data-ph-act="pwfield" style="text-align:left;border:1px solid #c9d1db;background:#fff;font:inherit">${pwShown ? "••••••••••••••••" : "<small>Mot de passe</small>"}</button>
          ${sugg ? `<div class="pv-suggest"><b>🔑 Mot de passe fort</b><code>${SUGG}</code><small>Ce mot de passe sera enregistré dans l'app Mots de passe.</small><button type="button" class="pv-btn" data-ph-act="usestrong">Utiliser le mot de passe fort</button><button type="button" data-ph-act="mine" style="border:0;background:transparent;color:#1a73e8;font:inherit">Choisir mon mot de passe</button></div>` : ""}
          <button type="button" class="pv-btn" data-ph-act="register">S'inscrire</button></div>`;
        let st = { used: false };
        L.phone = AN.phone.create(f.host.firstChild, { big: ctx.demo, apps: ["messages", "phone", "passwords", "settings"], onEvent: (type, d, ph) => {
          if (step === 1 && type === "act") {
            if (d.name === "pwfield" && !st.used) { tasks[0].done = true; draw(); ph.setAppHTML(form(false, true)); }
            if (d.name === "mine") { ph.setAppHTML(form(false, false)); ph.notify("Astuce", "Ici, essayez plutôt le mot de passe fort : touchez la case Mot de passe.", "💡"); }
            if (d.name === "usestrong") { st.used = true; tasks[1].done = true; draw(); G.ok("suggest", "Utiliser le mot de passe fort proposé"); ph.setAppHTML(form(true, false)); }
            if (d.name === "register") {
              if (!st.used) { G.ko("suggest", "Utiliser le mot de passe fort proposé", "Le mot de passe fort est inventé au hasard et enregistré tout seul."); ph.notify("Astuce", "Touchez d'abord la case Mot de passe 🙂", "💡"); return; }
              tasks[2].done = true; draw(); G.ok("save", "Enregistrer le mot de passe dans le coffre-fort");
              ph.app("pool", "Piscine", `<div class="pv-face"><span>🏊</span><b>Bienvenue Marie !</b><small>Compte créé.</small></div>`);
              ph.notify("Mots de passe", "Mot de passe enregistré pour piscine-valbourg.fr", "🔑");
              later(ctx, () => ctx.go(2), 3000);
            }
          }
          if (step === 2) {
            if (type === "open" && d.app === "passwords") { tasks[0].done = true; draw(); ph.setAppHTML(`<div class="pv-face"><span>🔒</span><b>Mots de passe est verrouillé</b><small>Vos mots de passe sont protégés par votre visage ou le code du téléphone.</small><button type="button" class="pv-btn" data-ph-act="faceid">🙂 Utiliser Face ID</button></div>`); }
            if (type === "act" && d.name === "faceid") {
              ph.setAppHTML(`<div class="pv-face"><span>🙂</span><b>Face ID…</b></div>`);
              setTimeout(() => { if (!alive(ctx)) return; tasks[1].done = true; draw(); G.ok("face", "Déverrouiller le coffre-fort"); ph.setAppHTML(`<p><b>Tous les mots de passe</b></p>${[["🏊", "piscine-valbourg.fr", "entry"], ["📚", "mediatheque-valbourg.fr", ""], ["🛒", "marche-valbourg.fr", ""]].map(([i, s, a]) => `<button type="button" class="pv-item" ${a ? `data-ph-act="${a}"` : "disabled"}>${i} <span><b>${s}</b><small>${ME.email}</small></span></button>`).join("")}`); }, 1200);
            }
            if (type === "act" && d.name === "entry") ph.setAppHTML(`<p><b>🏊 piscine-valbourg.fr</b></p><div class="pv-row"><small>Nom d'utilisateur</small>${ME.email}</div><button type="button" class="pv-row" data-ph-act="show" style="width:100%;text-align:left;border:0;font:inherit"><small>Mot de passe (touchez pour afficher)</small>••••••••••••••</button>`);
            if (type === "act" && d.name === "show") {
              ph.setAppHTML(`<p><b>🏊 piscine-valbourg.fr</b></p><div class="pv-row"><small>Nom d'utilisateur</small>${ME.email}</div><div class="pv-row"><small>Mot de passe</small><b>${SUGG}</b></div><button type="button" class="pv-btn" data-ph-act="copy">Copier le mot de passe</button>`);
              tasks[2].done = true; G.ok("show", "Retrouver un mot de passe enregistré"); draw();
            }
            if (type === "act" && d.name === "copy") { ph.notify("Copié", "Le mot de passe est copié : on peut le coller dans le site.", "📋"); later(ctx, () => ctx.go(3), 2500); }
          }
        } });
        if (!L.hooked) { L.hooked = true; ctx.onCleanup(() => L.phone?.destroy()); }
        if (step === 1) L.phone.app("pool", "Piscine", form(false, false));
        return;
      }
      if (step === 3) {
        const f = frame(ctx, { level: 5, title: "Le coffre-fort : les questions qu'on se pose", step: 3, noClient: true, consigne: "Les questions que tout le monde se pose sur le coffre-fort." });
        quiz(f.panel, { G, key: "vq", questions: [
          { q: "Avec un coffre-fort, combien de mots de passe dois-je retenir ?", choices: ["Tous", "Un seul : celui du compte Google ou Apple (et le code du téléphone ou de l'ordinateur)", "Aucun"], ok: 1, why: "Le coffre-fort retient tout le reste. Ce seul mot de passe doit donc être <b>très solide</b> : une phrase de passe !" },
          { q: "Je perds mon téléphone. Mes mots de passe sont perdus ?", choices: ["Oui, tout est perdu", "Non : ils sont sauvegardés dans mon compte Google ou Apple, et je les retrouve sur un nouvel appareil"], ok: 1, why: "Ils sont synchronisés avec votre compte. Sur un nouveau téléphone, on se connecte à son compte et tout revient." },
          { q: "Le coffre-fort remplit le mot de passe tout seul… sur un <b>faux site</b> ?", choices: ["Oui, il le remplit partout", "Non : il ne propose le mot de passe que sur le vrai site enregistré"], ok: 1, why: "Un bonus de sécurité : sur un faux site (ameli-remboursement.info), le coffre-fort ne propose rien. Si rien ne s'affiche… méfiance !" }
        ], onDone: () => finish(ctx, G, { key: "acc_vault", label: "Je sais utiliser un coffre-fort à mots de passe", intro: "Vous savez laisser le coffre-fort inventer, enregistrer et remplir vos mots de passe, et retrouver un mot de passe enregistré." }) });
        return;
      }
      ctx.finalScreen({ theme: null });
    }
  });

  /* =========================================================
     NIVEAU 6 — Le code reçu par SMS et le faux conseiller
     ========================================================= */
  const BANK = "www.banque-valbourg.fr";
  R("acc_sms", {
    steps: 3,
    render(ctx) {
      const step = ctx.m.step || 0, L = ctx.local, G = grader(L);
      const split = f => { f.host.innerHTML = `<div class="acc-split"><div class="acc-b"></div><div class="acc-p"></div></div>`; return [f.host.querySelector(".acc-b"), f.host.querySelector(".acc-p")]; };
      const mkPhone = (el, onEvent) => { L.phone?.destroy(); L.phone = AN.phone.create(el, { onEvent }); if (!L.hookedP) { L.hookedP = true; ctx.onCleanup(() => L.phone?.destroy()); } return L.phone; };
      if (step === 0) {
        const f = frame(ctx, { level: 6, title: "La double sécurité : le code par SMS", step: 0,
          consigne: "Marie se connecte à sa banque. Après le mot de passe, la banque envoie un <b>code par SMS</b> : c'est une <b>deuxième clé</b>. Même si un pirate avait le mot de passe, il n'aurait pas le téléphone !",
          help: "Le SMS arrive sur le téléphone, à droite. Touchez la notification pour le lire." });
        const tasks = [{ label: "Cliquez sur <b>« Se connecter »</b> (les identifiants d'exercice sont déjà remplis)." }, { label: "Lisez le <b>code</b> reçu par SMS sur le téléphone." }, { label: "Tapez ce code sur le site de la banque." }];
        const draw = () => { f.panel.innerHTML = tasksHTML(tasks); };
        draw();
        const [bEl, pEl] = split(f);
        const code = String(482913);
        const ph = mkPhone(pEl, (type) => { if (type === "open") { tasks[1].done = true; draw(); } });
        mountB(ctx, bEl, { start: BANK + "/connexion", features: { favorites: false }, onEvent: (type, d, c) => {
          if (type === "action" && d.name === "banklogin") {
            tasks[0].done = true; draw(); goPage(c, BANK + "/verification");
            setTimeout(() => alive(ctx) && ph.sms({ from: "BanqueValbourg", text: `Votre code de connexion : <b>${code}</b>. Ne le communiquez JAMAIS, même à un conseiller de la banque.` }), 1500);
          }
          if (type === "action" && d.name === "bankcode") {
            const v = (c.fields().code || "").replace(/\D/g, "");
            if (v !== code) { L.wrong = true; showErr(c, "Code incorrect. Vérifiez le SMS."); c.flash("Regardez bien le SMS sur le téléphone, à droite : 6 chiffres.", "warn", 5000); return; }
            (L.wrong ? G.ko : G.ok)("code", "Utiliser le code reçu par SMS", "Le code doit être recopié exactement ; il ne sert que quelques minutes.");
            tasks[1].done = tasks[2].done = true; draw(); goPage(c, BANK + "/comptes");
            c.flash("✅ Connectée ! Le code par SMS prouve que c'est bien vous, avec votre téléphone.", "good", 4000);
            later(ctx, () => ctx.go(1), 2600);
          }
        } });
        return;
      }
      if (step === 1) {
        const f = frame(ctx, { level: 6, title: "Le faux conseiller", step: 1,
          consigne: "Le lendemain, le téléphone de Marie sonne. Le numéro affiché ressemble à celui de sa banque… Décrochez et écoutez bien.",
          help: "Lisez bien les SMS qui arrivent pendant l'appel : ils disent à quoi sert le code." });
        f.panel.innerHTML = tasksHTML([{ label: "Décrochez, écoutez… et décidez." }]);
        const [, pEl] = split(f);
        f.host.querySelector(".acc-split").style.gridTemplateColumns = "1fr";
        let decided = false;
        const end = good => { decided = true; later(ctx, () => ctx.go(2), 6500); f.panel.insertAdjacentHTML("beforeend", `<div class="alert ${good ? "good" : "bad"}" style="margin-top:8px">${good ? "✅ Le bon réflexe ! " : "❌ "}${good ? "En cas de doute, on raccroche et on appelle soi-même le numéro au dos de sa carte bancaire. La vraie banque confirmera." : "Ce code servait à <b>valider un paiement de 849 €</b> : le SMS le disait. Le « conseiller » est un escroc. Une banque ne demande <b>jamais</b> ce code."}</div>`); };
        const ph = mkPhone(pEl, (type, d, p) => {
          if (type === "callScriptEnd" && !p.st.call.choices) p.choices([{ id: "read", label: "📖 Je lui lis le code" }, { id: "hang", label: "📵 Je raccroche et j'appelle le numéro au dos de ma carte" }, { id: "prove", label: "🤔 Je lui demande de prouver qu'il est de la banque" }]);
          if (type === "callLine" && d.index === 2) setTimeout(() => alive(ctx) && p.sms({ from: "BanqueValbourg", text: "Code de <b>validation du paiement</b> de <b>849,00 €</b> chez ELECTROMAX : <b>771204</b>. Ne le communiquez à personne." }), 800);
          if (type === "callChoice" && !decided) {
            if (d.id === "read") { G.ko("call", "Ne jamais donner le code reçu par SMS", "Le SMS disait « validation du paiement de 849 € » : en lisant le code, on valide soi-même le vol."); p.say("me", "Le code, c'est 771204…"); p.say("them", "Parfait madame, l'opération est… annulée. Bonne journée !"); p.endCall(); end(false); }
            if (d.id === "prove") { p.say("me", "Comment je peux être sûre que vous êtes de la banque ?"); p.say("them", "Mais madame, j'ai votre nom, votre adresse au 12 rue des Lilas, et votre numéro de carte qui finit par 4217 ! Vite, le paiement va partir !"); p.choices([{ id: "read", label: "📖 Bon… je lui lis le code" }, { id: "hang", label: "📵 Je raccroche et j'appelle le numéro au dos de ma carte" }]); f.panel.insertAdjacentHTML("beforeend", `<div class="alert" style="margin-top:8px">🧐 Il connaît votre nom, votre adresse… Ces infos ont pu être volées ailleurs : <b>ça ne prouve rien</b>. Et il vous presse : c'est un signal d'alarme.</div>`); }
            if (d.id === "hang") { G.ok("call", "Ne jamais donner le code reçu par SMS"); p.endCall(); end(true); }
          }
          if (type === "callHang" && !decided) { G.ok("call", "Ne jamais donner le code reçu par SMS"); end(true); }
          if (type === "callDecline" && !decided) { G.ok("call", "Ne jamais donner le code reçu par SMS"); decided = true; f.panel.insertAdjacentHTML("beforeend", `<div class="alert good">✅ Ne pas décrocher, c'est permis ! Si c'est important, la banque laissera un message, et vous rappellerez le numéro officiel, au dos de votre carte.</div>`); later(ctx, () => ctx.go(2), 6000); }
        });
        setTimeout(() => alive(ctx) && ph.call({ name: "Banque de Valbourg", number: "01 23 45 67 89", short: "« Julien, service fraude »", icon: "🏦", speed: 3200, script: [
          { who: "them", text: "Bonjour Madame Dupont, Julien, du service fraude de la Banque de Valbourg." },
          { who: "them", text: "Nous avons repéré un paiement suspect de 849 € chez ElectroMax avec votre carte. C'est bien vous ?" },
          { who: "them", text: "Pas d'inquiétude, je l'annule tout de suite. Vous allez recevoir un code par SMS…" },
          { who: "them", text: "Pouvez-vous me lire le code que vous venez de recevoir ? C'est pour bloquer l'opération. Vite, s'il vous plaît !" }
        ] }), 1200);
        return;
      }
      if (step === 2) {
        const f = frame(ctx, { level: 6, title: "Ce SMS, j'en fais quoi ?", step: 2, noClient: true, consigne: "Un code arrive par SMS. Selon la situation, le bon geste change." });
        quiz(f.panel, { G, key: "smsq", questions: [
          { q: "« Votre code de connexion : 482913 ». Vous êtes en train de vous connecter à votre banque.", choices: ["Je le tape sur le site de la banque", "Je le transfère à ma fille", "Je l'ignore"], ok: 0, why: "C'est vous qui vous connectez : le code se tape sur le site, et nulle part ailleurs." },
          { q: "Le même SMS arrive… alors que vous ne faites <b>rien</b>.", choices: ["Je le tape quelque part pour voir", "Quelqu'un essaie d'entrer dans mon compte : je change mon mot de passe", "Je réponds au SMS"], ok: 1, why: "Le pirate a sans doute votre mot de passe, mais pas votre téléphone : le code l'a bloqué. Changez vite ce mot de passe." },
          { q: "Qui peut vous demander le code reçu par SMS ?", choices: ["Le conseiller de la banque, au téléphone", "Un technicien Microsoft", "Personne, jamais"], ok: 2, why: "Le code se tape <b>vous-même</b>, sur le site. Toute personne qui le demande est un escroc." }
        ], onDone: () => finish(ctx, G, { key: "acc_sms", label: "Je protège le code reçu par SMS", intro: "Vous savez utiliser la double sécurité (le code reçu par SMS) et vous ne donnerez jamais ce code, même à un « conseiller » pressant." }) });
        return;
      }
      ctx.finalScreen({ theme: null });
    }
  });

  /* =========================================================
     NIVEAU 7 — Mot de passe oublié, compte piraté
     ========================================================= */
  R("acc_reset", {
    steps: 4,
    render(ctx) {
      const step = ctx.m.step || 0, L = ctx.local, G = grader(L);
      if (step === 0) {
        const f = frame(ctx, { level: 7, title: "Mot de passe oublié : pas de panique", step: 0,
          consigne: "Marie a oublié son mot de passe de la médiathèque. Pas besoin de deviner : il y a un lien prévu pour ça.",
          help: "Sous le bouton « Se connecter », cherchez le petit lien." });
        const tasks = [{ label: "Cliquez sur <b>« Mot de passe oublié ? »</b>." }, { label: `Tapez l'adresse e-mail de Marie (<code>${ME.email}</code>) et envoyez.` }];
        const draw = () => { f.panel.innerHTML = tasksHTML(tasks); };
        draw();
        let guesses = 0;
        mountB(ctx, f.host, { start: ACC + "/connexion", onEvent: (type, d, c) => {
          if (type === "action" && d.name === "login") {
            guesses++; G.ko("noguess", "Utiliser « Mot de passe oublié » plutôt que deviner", "Deviner au hasard peut bloquer le compte. Le lien « Mot de passe oublié ? » est fait pour ça.");
            showErr(c, guesses >= 3 ? "Trop d'essais : compte bloqué 15 minutes." : "Identifiant ou mot de passe incorrect.", { id: c.fields().id });
            c.flash(guesses >= 3 ? "🔒 Après plusieurs essais, le compte se bloque : c'est une protection contre les pirates. Utilisez plutôt « Mot de passe oublié ? »." : "Inutile de deviner : cliquez sur « Mot de passe oublié ? », juste en dessous.", "warn", 8000);
          }
          if (type === "navigate" && is(d.url, ACC + "/oubli")) { tasks[0].done = true; draw(); G.ok("noguess", "Utiliser « Mot de passe oublié » plutôt que deviner"); }
          if (type === "action" && d.name === "forgot") {
            const e = (c.fields().email || "").trim().toLowerCase();
            if (e !== ME.email) { G.ko("mail", "Indiquer la bonne adresse e-mail", "Le lien est envoyé à l'adresse du compte : elle doit être exacte."); showErr(c, "Vérifiez l'adresse e-mail."); c.flash(`L'adresse doit être exactement <code>${ME.email}</code>.`, "warn", 6000); return; }
            G.ok("mail", "Indiquer la bonne adresse e-mail"); tasks[1].done = true; draw(); goPage(c, ACC + "/oubli-envoye");
            later(ctx, () => ctx.go(1), 2500);
          }
        } });
        return;
      }
      if (step === 1) {
        const f = frame(ctx, { level: 7, title: "L'e-mail de réinitialisation", step: 1, consigne: "Ouvrez l'e-mail de la médiathèque et cliquez sur le lien. (Il n'est valable que 30 minutes !)" });
        f.panel.innerHTML = tasksHTML([{ label: "Ouvrez l'e-mail et cliquez sur <b>« Choisir un nouveau mot de passe »</b>." }]);
        L.client?.destroy();
        L.client = AN.mail.client(f.host, { me: { name: "Marie Dupont", email: ME.email }, big: ctx.demo, features: { compose: false, reply: false, replyAll: false, forward: false, search: false }, mails: [
          { id: "r_reset", unread: true, from: { name: "Médiathèque de Valbourg", email: "ne-pas-repondre@mediatheque-valbourg.fr" }, subject: "Réinitialisation de votre mot de passe", date: "À l'instant",
            body: `<p>Bonjour Marie,</p><p>Vous avez demandé à changer votre mot de passe. Cliquez sur le lien ci-dessous (valable 30 minutes) :</p><p><a href="#" class="mk-link" data-url="https://www.mediatheque-valbourg.fr/mon-compte/nouveau-mot-de-passe?t=K29XQ">🔑 Choisir un nouveau mot de passe</a></p><p>Vous n'avez rien demandé ? Ignorez ce message : votre mot de passe ne change pas.</p>` },
          { id: "r_news", from: { name: "Lettre d'info du marché", email: "info@marche-valbourg.fr" }, subject: "Les produits de saison sont arrivés", date: "08:02", body: "<p>Retrouvez nos producteurs locaux.</p>" }
        ], onEvent: (type, d, c) => {
          if (type === "link" && d.mail?.id === "r_reset") { G.ok("link", "Suivre le lien de réinitialisation"); c.flash("✅ Le lien s'ouvre…", "good", 2000); later(ctx, () => ctx.go(2), 1200); }
        } });
        if (!L.hookedM) { L.hookedM = true; ctx.onCleanup(() => L.client?.destroy()); }
        return;
      }
      if (step === 2) {
        const f = frame(ctx, { level: 7, title: "Un nouveau mot de passe", step: 2, consigne: "Choisissez un nouveau mot de passe d'exercice, solide, et confirmez-le.", help: "Une phrase de 4 mots ou plus, comme au niveau 4 !" });
        f.panel.innerHTML = SAFE;
        let first = true;
        mountB(ctx, f.host, { start: ACC + "/nouveau-mot-de-passe", onEvent: (type, d, c) => {
          if (type !== "action" || d.name !== "newpw") return;
          const x = c.fields(), s = AN.pw.strength(x.pw, [ME.first, ME.last, "Valbourg"]), E = [];
          if (x.pw.length < 12 || s.score < 3) E.push("Ce mot de passe n'est pas assez solide.");
          if (x.pw !== x.pw2) E.push("Les deux mots de passe ne sont pas identiques.");
          if (first) { first = false; (E.length ? G.ko : G.ok)("newpw", "Choisir un nouveau mot de passe solide", "Au moins 12 caractères, sans info personnelle, et la même chose dans les deux cases."); }
          if (E.length) { showErr(c, E); c.flash("Regardez la jauge sous le mot de passe : visez « Solide » ou « Très solide ». Le bouton 👁 aide à vérifier les deux cases.", "warn", 8000); return; }
          goPage(c, ACC + "/mot-de-passe-change"); c.flash("✅ Mot de passe changé !", "good", 2500);
          later(ctx, () => ctx.go(3), 2200);
        } });
        return;
      }
      if (step === 3) {
        const f = frame(ctx, { level: 7, title: "Mon compte est-il piraté ?", step: 3, noClient: true, consigne: "Les signes qui doivent alerter… et les bons gestes, calmement." });
        quiz(f.panel, { G, key: "hack", questions: [
          { q: "Vous recevez « Nouvelle connexion depuis un appareil inconnu » alors que ce n'est pas vous. Que faire ?", choices: ["Rien, c'est sûrement une erreur", "Je change tout de suite mon mot de passe, en allant moi-même sur le site", "Je clique sur le lien de l'e-mail"], ok: 1, why: "On va soi-même sur le site (pas par le lien de l'e-mail, qui pourrait être un piège) et on change le mot de passe." },
          { q: "Vos amis reçoivent de votre part des messages bizarres que vous n'avez pas écrits.", choices: ["Mon compte est sans doute piraté : je change le mot de passe et je préviens mes contacts", "Ce n'est pas grave"], ok: 0, why: "C'est un signe classique. Changez le mot de passe, activez le code par SMS, et prévenez vos contacts de ne pas cliquer." },
          { q: "Votre mot de passe ne marche plus, alors que vous ne l'avez pas changé.", choices: ["J'utilise « Mot de passe oublié ? » ; si ça ne marche pas, je contacte le service", "J'abandonne ce compte"], ok: 0, why: "Le pirate a peut-être changé le mot de passe. « Mot de passe oublié » permet souvent de reprendre la main. Sinon, on contacte le service (et cybermalveillance.gouv.fr)." },
          { q: "Pour éviter tout ça, le meilleur bouclier ?", choices: ["Une phrase de passe différente par site + le code par SMS activé", "Ne plus utiliser Internet"], ok: 0, why: "Un mot de passe solide et unique, plus la double sécurité : le pirate passe son chemin." }
        ], onDone: () => finish(ctx, G, { key: "acc_reset", label: "Je sais récupérer un compte", intro: "Vous savez utiliser « Mot de passe oublié ? », choisir un nouveau mot de passe, et reconnaître les signes d'un compte piraté." }) });
        return;
      }
      ctx.finalScreen({ theme: null });
    }
  });

  /* =========================================================
     NIVEAU 8 — Mission réelle (sans jamais se connecter)
     ========================================================= */
  const REAL = [
    { id: "ameli", icon: "💙", title: "Le compte ameli", site: "ameli.fr", task: "Sur <b>ameli.fr</b>, trouvez le bouton pour accéder à son compte." },
    { id: "impots", icon: "🇫🇷", title: "L'espace des impôts", site: "impots.gouv.fr", task: "Sur <b>impots.gouv.fr</b>, trouvez le bouton pour accéder à son espace particulier." },
    { id: "caf", icon: "👪", title: "Le compte CAF", site: "caf.fr", task: "Sur <b>caf.fr</b>, trouvez le bouton pour accéder à son compte." },
    { id: "media", icon: "📚", title: "Le compte lecteur de votre médiathèque", site: "", task: "Sur le site des <b>médiathèques de votre ville</b>, trouvez où se connecter à son compte lecteur." }
  ];
  R("acc_real", {
    steps: 3,
    render(ctx) {
      let step = ctx.m.step || 0;
      const L = ctx.local, G = grader(L);
      if (step > 0 && !L.pick) step = 0;
      if (step === 0) {
        const f = frame(ctx, { level: 8, title: "Mission réelle : choisissez votre mission", step: 0, noClient: true,
          consigne: "Cette fois, sur le <b>vrai Internet</b>, avec le vrai navigateur. Mission d'observation : on regarde, <b>on ne se connecte pas</b>." });
        f.panel.innerHTML = `<div class="nv-pick">${REAL.map(r => `<button type="button" data-pick="${r.id}"><b>${r.icon} ${r.title}</b><span>${r.task}</span></button>`).join("")}</div>`;
        f.panel.querySelectorAll("[data-pick]").forEach(b => b.addEventListener("click", () => { L.pick = REAL.find(r => r.id === b.dataset.pick); ctx.go(1); }));
        return;
      }
      const r = L.pick;
      if (step === 1) {
        const f = frame(ctx, { level: 8, title: `${r.icon} ${r.title}`, step: 1, noClient: true, consigne: "Lisez la mission en entier, puis suivez les étapes." });
        f.panel.innerHTML = `<div class="nv-mission"><h3>🎯 ${r.task}</h3><p>Puis, <b>sans vous connecter</b>, observez la page de connexion :</p>
            <ol><li>Peut-on se connecter avec <b>FranceConnect</b> ? (un bouton bleu « S'identifier avec FranceConnect »)</li><li>Quel est le <b>texte exact</b> du lien quand on a oublié son mot de passe ?</li><li>Quelle est l'<b>adresse</b> de la page (dans la barre d'adresse) ?</li></ol></div>
          <ol class="nv-steps"><li>Ouvrez un <b>nouvel onglet</b> : <kbd>Ctrl</kbd> + <kbd>T</kbd>. Ne fermez pas l'atelier !</li><li>Tapez l'adresse${r.site ? ` <b>${r.site}</b>` : ""}, ou cherchez-la. Vérifiez le <b>vrai nom</b> du site.</li><li>Cliquez sur le bouton de connexion, et <b>observez seulement</b>.</li><li>Revenez ici par l'onglet <b>« Atelier numérique »</b>.</li></ol>
          <div class="alert bad">🛑 On ne tape <b>aucun</b> identifiant, <b>aucun</b> mot de passe, on ne crée pas de compte. Si le navigateur propose d'enregistrer quelque chose : « Jamais ». Un doute ? On lève la main ✋.</div>
          <div class="final-actions"><button type="button" class="secondary" data-change>← Choisir une autre mission</button><button type="button" class="primary" data-found>J'ai trouvé : je réponds →</button></div>`;
        f.panel.querySelector("[data-found]").addEventListener("click", () => ctx.go(2));
        f.panel.querySelector("[data-change]").addEventListener("click", () => { L.pick = null; ctx.go(0); });
        return;
      }
      if (step === 2) {
        const f = frame(ctx, { level: 8, title: `${r.icon} Mes observations`, step: 2, noClient: true, consigne: `Rappel : ${r.task}` });
        f.panel.innerHTML = `<div class="nv-real">
          <fieldset class="nv-check"><legend><b>🔵 FranceConnect est-il proposé ?</b></legend>${["Oui", "Non", "Je n'ai pas trouvé"].map(x => `<label><input type="radio" name="fc" value="${x}"> ${x}</label>`).join("")}</fieldset>
          <label>🔑 Le texte exact du lien « mot de passe oublié »<input type="text" data-f="forgot" placeholder="exemple : Mot de passe oublié ?" autocomplete="off"></label>
          <label>🌐 L'adresse de la page de connexion<input type="text" data-f="site" placeholder="exemple : www.site.fr/connexion" autocomplete="off" spellcheck="false"></label>
          <fieldset class="nv-check"><legend><b>✅ Je vérifie</b> (cochez seulement ce qui est vrai)</legend>
            <label><input type="checkbox" data-c="name"> J'ai vérifié le <b>vrai nom</b> du site</label>
            <label><input type="checkbox" data-c="nothing"> Je n'ai tapé <b>aucun</b> identifiant ni mot de passe</label></fieldset>
          <div class="mk-fb"></div>
          <div class="final-actions"><button type="button" class="secondary" data-back>← Revoir la mission</button><button type="button" class="primary" data-send>📤 Envoyer au formateur</button></div></div>`;
        const $f = s => f.panel.querySelector(s);
        $f("[data-back]").addEventListener("click", () => ctx.go(1));
        $f("[data-send]").addEventListener("click", async () => {
          const fc = f.panel.querySelector('[name="fc"]:checked')?.value || "", forgot = $f('[data-f="forgot"]').value.trim(), siteRaw = $f('[data-f="site"]').value.trim();
          const site = siteRaw.replace(/^https?:\/\//i, "").split(/[/?#\s]/)[0].toLowerCase();
          const fb = $f(".mk-fb");
          if (!fc || !forgot || !site) { fb.innerHTML = `<div class="alert bad">Répondez aux 3 questions 🙂</div>`; return; }
          const checks = { name: $f('[data-c="name"]').checked, nothing: $f('[data-c="nothing"]').checked };
          $f("[data-send]").disabled = true;
          G.ok("fc", "Repérer FranceConnect"); G.ok("forgot", "Repérer le lien « mot de passe oublié »");
          (B().looksLikeAddress(site) ? G.ok : G.ko)("addr", "Noter l'adresse du site", "On recopie l'adresse depuis la barre d'adresse : www.nom-du-site.fr");
          if (r.site) (site.endsWith(r.site) ? G.ok : G.ko)("official", "Être sur le site officiel", `Le site officiel était ${r.site}.`);
          (checks.name ? G.ok : G.ko)("chk_name", "Vérifier le vrai nom du site", "Le vrai nom est en gras dans la barre d'adresse.");
          (checks.nothing ? G.ok : G.ko)("chk_nothing", "Ne rien taper de personnel", "Pour cette mission, on observe seulement.");
          const text = `🎯 Mission : ${r.title}\n🔵 FranceConnect : ${fc}\n🔑 Lien mot de passe oublié : « ${forgot} »\n🌐 Page : ${siteRaw}\n${checks.name ? "✅" : "⬜"} vrai nom vérifié · ${checks.nothing ? "✅" : "⬜"} rien tapé`;
          try { await ctx.api.sendToTeacher?.(`🧭 Mission réelle : ${r.title}`, text.slice(0, 1900)); }
          catch (e) { fb.innerHTML = `<div class="alert bad">La réponse n'a pas pu partir : ${esc(e.message)}. Réessayez.</div>`; $f("[data-send]").disabled = false; return; }
          finish(ctx, G, { key: "acc_real", label: "J'ai observé une vraie page de connexion", intro: `${ctx.demo ? "En projection, la réponse n'est pas envoyée." : "📤 Vos observations sont parties chez le formateur : il vous répondra dans votre <b>messagerie</b>."}<br>Mission : <b>${esc(r.title)}</b> · FranceConnect : ${esc(fc)} · « ${esc(forgot)} »` });
        });
        return;
      }
      ctx.finalScreen({ theme: null });
    }
  });

  AN.accKit = { PAGES, ME, PHRASE_J, TESTS };
})(window.AN);

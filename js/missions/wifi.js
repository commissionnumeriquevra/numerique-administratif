/* =========================================================
   Chapitre « Wi-Fi et réseaux » : 8 niveaux progressifs.
   Simulateurs : AN.net.pc (Windows 11), AN.net.phone, AN.net.box.
   Rien ne touche au vrai réseau. Note /20 à la fin de chaque niveau.
   ========================================================= */
(function (AN) {
  "use strict";
  const { esc } = AN.util;
  const R = AN.missions.register;
  const KIT = () => AN.missionKit;
  const N = () => AN.net;
  const grader = L => AN.mail.grader(L.grade ||= {});
  const frame = (ctx, o) => KIT().frame(ctx, { chapter: "Wi-Fi", ...o });
  const tasksHTML = t => KIT().tasksHTML(t);
  const quiz = (el, o) => KIT().inlineQuiz(el, o);
  const alive = ctx => ctx.box.isConnected && ctx.box.__an?.ctx === ctx;
  const finish = (ctx, G, o) => { if (alive(ctx)) return KIT().finish(ctx, G, o); };
  const later = (ctx, fn, ms) => { const t = setTimeout(() => { if (alive(ctx)) fn(); }, ms); ctx.onCleanup(() => clearTimeout(t)); };
  const plain = h => String(h || "").replace(/<[^>]+>/g, "");

  /** Liste de tâches + zone de retour + emplacement pour les questions (comme au chapitre Fichiers). */
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
  /** Zone d'exercice : un ou plusieurs simulateurs côte à côte, détruits proprement à la sortie. */
  function stage(ctx, host, layout = "") {
    host.innerHTML = `<div class="wk-duo ${layout}"><div class="wk-a"></div><div class="wk-b"></div></div>`;
    ctx.local.sims?.forEach(s => s.destroy()); ctx.local.sims = [];
    if (!ctx.local.simHook) { ctx.local.simHook = true; ctx.onCleanup(() => ctx.local.sims?.forEach(s => s.destroy())); }
    const keep = s => { ctx.local.sims.push(s); return s; };
    return { a: host.querySelector(".wk-a"), b: host.querySelector(".wk-b"), keep };
  }

  const KEY = { beginner: "Kp7mVx2e", intermediate: "Kp7mVx2eRt9q", expert: "Kp7mVx2eRt9q" };
  const HOME = "Livebox-7A3F";
  const homeNets = (key, extra = {}) => [
    N().net(HOME, { key, bars: 4, kind: "box", home: true, ...extra }),
    N().net("Livebox-7A3E", { key: "zzzzzzzzzzzz", bars: 2, kind: "box", neighbor: true, internet: true }),
    N().net("SFR_9C21", { key: "zzzzzzzzzzzz", bars: 1, kind: "box", neighbor: true }),
    N().net("Wifi_Gratuit_Valbourg", { secure: false, bars: 2, kind: "public", internet: false })
  ];

  /* =========================================================
     NIVEAU 1 — Lire les icônes du réseau
     ========================================================= */
  const tray = (inner, label) => `<div class="wk-status" aria-label="${label}">${inner}</div>`;
  R("wifi_icons", {
    steps: 2,
    render(ctx) {
      const step = ctx.m.step || 0, L = ctx.local, G = grader(L);
      if (step === 0) {
        const f = frame(ctx, { level: 1, title: "Lire les icônes du réseau", step: 0, noClient: true,
          consigne: "En bas à droite de l'ordinateur, en haut du téléphone : de petites icônes disent <b>comment</b> l'appareil est relié à Internet. Apprenons à les lire !" });
        const S = N().signal;
        quiz(f.panel, { G, key: "ico", questions: [
          { label: "Reconnaître l'icône du Wi-Fi qui marche", q: `Sur l'ordinateur, je vois cette icône. Cela veut dire…${tray(S(4, { color: "#fff" }), "Wi-Fi")}`, choices: ["Je suis connecté(e) au Wi-Fi, Internet marche", "Il n'y a pas de Wi-Fi", "Le son est coupé"], ok: 0, why: "L'éventail plein : connecté au Wi-Fi, avec un bon signal." },
          { label: "Reconnaître le globe barré (pas connecté)", q: `Et celle-ci ?${tray(`<span style="color:#fff">${N().globe(true)}</span>`, "globe barré")}`, choices: ["Je suis connecté(e)", "Je ne suis connecté(e) à aucun réseau : pas d'Internet", "Il y a une mise à jour"], ok: 1, why: "Le petit globe barré : l'ordinateur n'est relié à <b>rien</b>. On ouvre le menu Wi-Fi pour se connecter." },
          { label: "Reconnaître le Wi-Fi sans Internet (point d'exclamation)", q: `Le Wi-Fi avec un petit point d'exclamation :${tray(S(4, { color: "#fff", warn: true }), "Wi-Fi avec point d'exclamation")}`, choices: ["Tout va bien", "Je suis relié(e) à la box… mais la box n'a pas Internet", "Le Wi-Fi est trop fort"], ok: 1, why: "Le Wi-Fi marche entre l'ordinateur et la box, mais la box elle-même n'arrive pas à joindre Internet. Souvent : on redémarre la box." },
          { label: "Reconnaître le mode avion", q: `Un petit avion ✈ :${tray(`<span style="color:#fff;font-size:1.3em">✈</span>`, "avion")}`, choices: ["Le mode avion est activé : tout est coupé", "Un voyage est prévu"], ok: 0, why: "Le mode avion coupe le Wi-Fi, la 4G et les appels. Pratique en avion… et piège classique quand il est activé par erreur !" },
          { label: "Reconnaître la 4G (le forfait)", q: `Sur le téléphone : ${tray(`<span style="color:#fff">${N().cellBars(4)} <b>4G</b></span>`, "4G")} Internet passe par…`, choices: ["Le Wi-Fi de la maison", "Les données mobiles (le forfait du téléphone)"], ok: 1, why: "« 4G » ou « 5G » : le téléphone utilise votre <b>forfait</b>. Les barres montrent la force du signal de l'antenne." },
          { label: "Comprendre un signal faible", q: `Le Wi-Fi avec une seule barre : ${tray(S(1, { color: "#fff" }), "une barre")}`, choices: ["Le signal est faible : je me rapproche de la box", "Le Wi-Fi est en panne"], ok: 0, why: "Une seule barre : le Wi-Fi est loin ou gêné par des murs. Internet risque d'être lent." }
        ], onDone: () => ctx.go(1) });
        return;
      }
      if (step === 1) {
        const f = frame(ctx, { level: 1, title: "À vous de jouer, sur le téléphone", step: 1,
          consigne: "Regardez bien la <b>barre d'état</b> du téléphone (tout en haut) à chaque action.",
          help: "Tout se règle dans l'application <b>⚙️ Réglages</b>." });
        const st = stage(ctx, f.host, "wk-tel");
        const T = tasker(st.a, [
          { k: "settings", label: "Ouvrez l'application <b>⚙️ Réglages</b>." },
          { k: "air_on", label: "Activez le <b>mode avion</b>. Regardez : un ✈ apparaît, la 4G disparaît." },
          { k: "air_off", label: "Désactivez le mode avion." },
          { k: "wifi_off", label: "Dans <b>Wi-Fi</b>, coupez le Wi-Fi. Regardez : l'icône « 4G » apparaît en haut." },
          { k: "wifi_on", label: "Rallumez le Wi-Fi : le téléphone se reconnecte tout seul à la box." }
        ]);
        const net = N().net(HOME, { key: "x", bars: 4, known: true });
        const ph = st.keep(N().phone(st.b, { big: ctx.demo, fast: true, nets: [net], connected: HOME, onEvent: (t, d) => {
          if (t === "screen" && d.screen === "settings" && T.done("settings")) G.ok("settings", "Ouvrir les Réglages");
          if (t === "airplane" && d.on && T.is("settings") && T.done("air_on")) G.ok("air_on", "Activer le mode avion");
          if (t === "airplane" && !d.on && T.is("air_on") && T.done("air_off")) G.ok("air_off", "Désactiver le mode avion");
          if (t === "wifi" && !d.on && T.is("air_off") && T.done("wifi_off")) { G.ok("wifi_off", "Couper le Wi-Fi et voir la 4G prendre le relais"); ph.msg("📶 Sans Wi-Fi, le téléphone passe par la <b>4G</b> : il utilise le forfait.", "info"); }
          if (t === "wifi" && d.on && T.is("wifi_off") && T.done("wifi_on")) G.ok("wifi_on", "Rallumer le Wi-Fi");
          if (T.all && !L.ended) {
            L.ended = true;
            T.note(`<div class="alert good">✅ Vous savez lire la barre d'état et utiliser les réglages essentiels.</div>`);
            quiz(T.slot(), { G, key: "q1b", questions: [
              { q: "Internet ne marche plus sur le téléphone, et je vois ✈ en haut. Que faire ?", choices: ["Redémarrer la box", "Désactiver le mode avion", "Acheter un nouveau téléphone"], ok: 1, why: "Le mode avion coupe tout. Le désactiver suffit." },
              { q: "Chez moi, le téléphone affiche le Wi-Fi. Il utilise mon forfait ?", choices: ["Oui", "Non : il passe par la box"], ok: 1, why: "En Wi-Fi, c'est la box qui fournit Internet : le forfait du téléphone n'est pas utilisé." }
            ], onDone: () => finish(ctx, G, { key: "wifi_icons", label: "Je sais lire les icônes du réseau", intro: "Vous reconnaissez le Wi-Fi, la 4G, le mode avion, le signal faible et le « pas d'Internet »." }) });
          }
        } }));
        return;
      }
      ctx.finalScreen({ theme: null });
    }
  });

  /* =========================================================
     NIVEAU 2 — Connecter l'ordinateur à la box
     ========================================================= */
  R("wifi_box", {
    steps: 1,
    render(ctx) {
      const L = ctx.local, G = grader(L);
      if ((ctx.m.step || 0) > 0) return ctx.finalScreen({ theme: null });
      const key = ctx.byLevel(KEY);
      const f = frame(ctx, { level: 2, title: "Connecter l'ordinateur à la box", step: 0,
        consigne: `Marie a une nouvelle box. Son ordinateur n'est pas encore connecté. Les informations sont sur l'<b>étiquette</b>, sous la box.`,
        help: "Le menu Wi-Fi s'ouvre en cliquant sur les icônes en bas à droite (🌐 🔊 🔋), puis sur la petite flèche <b>›</b> à côté du Wi-Fi." });
      const st = stage(ctx, f.host);
      st.a.innerHTML = `<div class="wk-tasks"></div><div class="wk-boxslot" style="margin-top:12px"></div>`;
      const T = tasker(st.a.querySelector(".wk-tasks"), [
        { k: "label", label: "Retournez la box pour lire son <b>étiquette</b> : le nom du réseau et la clé." },
        { k: "menu", label: "Sur l'ordinateur, ouvrez le <b>menu Wi-Fi</b> (en bas à droite), puis la liste des réseaux (<b>›</b>)." },
        { k: "net", label: `Choisissez <b>le réseau de la box</b> (le nom de l'étiquette).` },
        { k: "key", label: "Tapez la <b>clé de sécurité</b>, exactement comme sur l'étiquette." },
        { k: "check", label: "Vérifiez : cliquez sur <b>⟳</b> dans le navigateur. La page doit s'afficher." }
      ]);
      const bx = st.keep(N().box(st.a.querySelector(".wk-boxslot"), { ssid: HOME, key, big: ctx.demo, onEvent: (t, d) => { if (t === "flip" && d.under && T.done("label")) { G.ok("label", "Trouver le nom et la clé sur l'étiquette de la box"); if (ctx.isBeginner()) pc.hint("tray"); } } }));
      let wrongNet = false, keyTries = 0;
      const pc = st.keep(N().pc(st.b, { big: ctx.demo, nets: homeNets(key), wifiOn: true, connected: null, onEvent: (t, d, x) => {
        if (t === "tray" && d.open && ctx.isBeginner()) x.hint(null, "list");
        if (t === "list") { if (T.done("menu")) G.ok("menu", "Ouvrir le menu Wi-Fi"); if (ctx.isBeginner()) x.hint(HOME); }
        if (t === "askKey" || (t === "connect" && !d.net.secure)) {
          if (d.net.id !== HOME && !wrongNet) { wrongNet = true; G.ko("net", "Choisir le réseau de sa box", `Le nom exact est sur l'étiquette : ${HOME}. Les autres réseaux sont ceux des voisins (ou un Wi-Fi ouvert, sans mot de passe).`); x.msg(`Ce n'est pas le réseau de Marie : regardez bien l'étiquette, le nom exact est <b>${HOME}</b>. Cliquez sur « Annuler ».`, "warn", 7000); }
          else if (d.net.id === HOME && T.done("net")) G.ok("net", "Choisir le réseau de sa box");
          if (!T.is("menu")) T.done("menu");
        }
        if (t === "connect" && d.net.id !== HOME) { x.msg("Connecté… mais au mauvais réseau ! Ouvrez le menu Wi-Fi, cliquez sur ce réseau, puis « Se déconnecter ».", "warn", 7000); }
        if (t === "wrongKey") {
          keyTries++;
          if (keyTries === 1) G.ko("key", "Taper la clé sans erreur du premier coup", "Majuscules, minuscules et chiffres comptent : on recopie lettre par lettre, et on vérifie avec l'œil 👁.");
          T.note(`<div class="alert">${d.caseOnly ? "🔠 Presque ! Attention aux <b>majuscules</b> : « K » et « k », ce n'est pas pareil." : "🔎 Comparez lettre par lettre avec l'étiquette. Astuce : cliquez sur l'<b>œil 👁</b> pour voir ce que vous tapez."}</div>`);
        }
        if (t === "connect" && d.net.id === HOME) {
          if (T.done("key") && keyTries === 0) G.ok("key", "Taper la clé sans erreur du premier coup");
          (d.auto ? G.ok : G.ko)("auto", "Cocher « Se connecter automatiquement » chez soi", "Chez soi, on coche cette case : l'ordinateur se reconnectera tout seul les jours suivants.");
          if (!d.auto) T.note(`<div class="alert">💡 Chez soi, on coche « <b>Se connecter automatiquement</b> » : plus besoin de recommencer demain.</div>`);
          if (ctx.isBeginner()) x.hint(null, "refresh");
        }
        if (t === "refresh" && d.online && T.is("key") && T.done("check")) {
          G.ok("check", "Vérifier que la connexion fonctionne"); x.hint(null);
          if (!L.ended) {
            L.ended = true;
            T.note(`<div class="alert good">✅ L'ordinateur de Marie est connecté à sa box !</div>`);
            quiz(T.slot(), { G, key: "q2", questions: [
              { q: "Où trouve-t-on le nom du Wi-Fi et sa clé ?", choices: ["Sur l'étiquette de la box (dessous ou derrière)", "Sur la facture d'électricité", "On l'invente"], ok: 0, why: "L'étiquette donne le nom du réseau (SSID) et la clé de sécurité. On peut aussi les trouver dans l'espace client de l'opérateur." },
              { q: "La clé « Kp7mVx2e » : je peux taper « kp7mvx2e » ?", choices: ["Oui, c'est pareil", "Non : les majuscules comptent"], ok: 1, why: "Une clé Wi-Fi est un mot de passe : chaque majuscule compte." },
              { q: "Plusieurs réseaux s'affichent : « Livebox-7A3E », « SFR_9C21 »… Ce sont…", choices: ["Les réseaux des voisins", "Des virus", "Des réseaux à moi"], ok: 0, why: "On voit les box des voisins : c'est normal. On choisit seulement le <b>nom exact</b> de sa box." }
            ], onDone: () => finish(ctx, G, { key: "wifi_box", label: "Je sais connecter un ordinateur à ma box", intro: "Vous savez lire l'étiquette de la box, choisir le bon réseau et taper la clé de sécurité." }) });
          }
        }
        if (t === "refresh" && !d.online && T.is("key")) x.msg("Toujours pas d'Internet : vérifiez que vous êtes connecté(e) au réseau <b>" + HOME + "</b>.", "warn");
      } }));
      if (ctx.isBeginner()) bx.render();
    }
  });

  /* =========================================================
     NIVEAU 3 — Le téléphone : Wi-Fi ou 4G ?
     ========================================================= */
  R("wifi_phone", {
    steps: 1,
    render(ctx) {
      const L = ctx.local, G = grader(L);
      if ((ctx.m.step || 0) > 0) return ctx.finalScreen({ theme: null });
      const key = ctx.byLevel(KEY);
      const f = frame(ctx, { level: 3, title: "Le téléphone : Wi-Fi ou 4G ?", step: 0,
        consigne: "Connectez le téléphone de Marie au Wi-Fi de sa box, puis découvrez quand il utilise son <b>forfait</b>.",
        help: "⚙️ Réglages › Wi-Fi › le nom de la box › mot de passe. Le mot de passe est sur l'étiquette, ci-dessous." });
      const st = stage(ctx, f.host, "wk-tel");
      const T = tasker(st.a, [
        { k: "join", label: `Connectez le téléphone au Wi-Fi <b>${HOME}</b> (clé : <code>${key}</code>).` },
        { k: "usage", label: "Ouvrez <b>Réglages › Consommation des données</b> : combien Marie a-t-elle utilisé ce mois-ci ?" },
        { k: "out", label: "Marie sort de chez elle. Cliquez sur le bouton ci-dessous, puis regardez la barre d'état." }
      ], { head: `<div class="nk-label" style="max-width:280px;margin-bottom:8px">Étiquette de la box :<br>Réseau <b class="mono">${HOME}</b><br>Clé <b class="mono big">${key}</b></div>` });
      const home = N().net(HOME, { key, bars: 4, hidden: () => !!L.out });
      const ph = st.keep(N().phone(st.b, { big: ctx.demo, nets: [home, N().net("Livebox-7A3E", { key: "zzz", bars: 2 }), N().net("Wifi_Gratuit_Valbourg", { secure: false, bars: 1, internet: false })], connected: null, wifiOn: true, data: true,
        usage: { used: 3.2, total: 5, apps: [["▶️ Vidéos", 2.1], ["🌐 Internet", 0.6], ["🗺️ Plans", 0.3], ["💬 Messages", 0.2]] }, onEvent: (t, d) => {
          if (t === "wrongKey" && !G.has("join")) G.ko("join", "Se connecter au Wi-Fi du premier coup", "Le mot de passe se recopie exactement, majuscules comprises. L'œil 👁 aide à vérifier.");
          if (t === "connect" && d.net.id === HOME && T.done("join")) { G.ok("join", "Se connecter au Wi-Fi du premier coup"); ph.msg("✅ Connecté ! L'éventail Wi-Fi apparaît en haut : le forfait n'est plus utilisé.", "good"); }
          if (t === "connect" && d.net.id !== HOME) ph.msg("Ce n'est pas la box de Marie… Choisissez « " + HOME + " ».", "warn");
          if (t === "screen" && d.screen === "usage" && T.is("join") && T.done("usage")) {
            quiz(T.slot(), { G, key: "q3u", questions: [
              { q: "D'après l'écran, combien Marie a-t-elle utilisé de son forfait ce mois-ci ?", choices: ["3,2 Go sur 5 Go", "5 Go sur 3,2 Go", "Rien du tout"], ok: 0, why: "3,2 Go utilisés sur les 5 Go du forfait. Il reste 1,8 Go jusqu'au 1er du mois." },
              { q: "Quelle application a le plus consommé ?", choices: ["Les messages", "Les vidéos", "Les plans"], ok: 1, why: "Les vidéos consomment énormément. Mieux vaut les regarder en Wi-Fi !" }
            ], onDone: () => { T.slot().innerHTML = `<button type="button" class="primary" data-out>🚶 Marie sort de chez elle</button>`; T.slot().querySelector("[data-out]").addEventListener("click", goOut); } });
          }
        } }));
      function goOut() {
        L.out = true; ph.state.connected = null; ph.go("home");
        later(ctx, () => {
          T.done("out"); G.ok("out", "Voir le téléphone passer tout seul en 4G");
          T.note(`<div class="alert">📶 Loin de la box, le téléphone a perdu le Wi-Fi : il est passé <b>tout seul</b> en <b>4G</b> (regardez en haut). Internet marche toujours… avec le forfait.</div>`);
          quiz(T.slot(), { G, key: "q3", questions: [
            { q: "Dehors, Marie veut regarder une vidéo d'une heure. Que se passe-t-il ?", choices: ["Rien de spécial", "Elle consomme beaucoup de son forfait (1 à 3 Go)", "C'est impossible"], ok: 1, why: "Une heure de vidéo peut consommer plus d'1 Go. Avec 1,8 Go restant, elle risque d'épuiser son forfait." },
            { q: "Forfait épuisé : que se passe-t-il le plus souvent ?", choices: ["Internet devient très lent jusqu'au mois suivant", "Le téléphone s'éteint", "On est forcément facturé 100 €"], ok: 0, why: "La plupart des forfaits ralentissent fortement (ou proposent une recharge). Le compteur repart à zéro au début du mois." },
            { q: "Faut-il couper le Wi-Fi en sortant de chez soi ?", choices: ["Oui, sinon ça coûte cher", "Non : le téléphone passe tout seul de l'un à l'autre"], ok: 1, why: "Pas besoin : le téléphone choisit seul le Wi-Fi quand il est là, la 4G sinon." }
          ], onDone: () => finish(ctx, G, { key: "wifi_phone", label: "Je comprends Wi-Fi et données mobiles", intro: "Vous savez connecter le téléphone au Wi-Fi et vous comprenez quand il utilise le forfait (4G)." }) });
        }, 900);
      }
    }
  });

  /* =========================================================
     NIVEAU 4 — Le Wi-Fi public (médiathèque, gare…)
     ========================================================= */
  R("wifi_public", {
    steps: 1,
    render(ctx) {
      const L = ctx.local, G = grader(L);
      if ((ctx.m.step || 0) > 0) return ctx.finalScreen({ theme: null });
      const f = frame(ctx, { level: 4, title: "Le Wi-Fi public", step: 0,
        consigne: "Marie est à la médiathèque avec son ordinateur portable. Une affiche indique le Wi-Fi gratuit. Connectez-vous au <b>bon</b> réseau.",
        help: "Comparez le nom avec l'<b>affiche</b>, lettre par lettre. Un faux réseau peut ressembler au vrai !" });
      const st = stage(ctx, f.host);
      const T = tasker(st.a, [
        { k: "net", label: "Connectez-vous au Wi-Fi <b>officiel</b> de la médiathèque (celui de l'affiche)." },
        { k: "portal", label: "Une page de connexion s'ouvre : lisez-la et acceptez les conditions." },
        { k: "check", label: "Vérifiez avec <b>⟳</b> que la page s'affiche." }
      ], { head: `<div class="nk-card" style="margin:0 0 10px;border:2px dashed #c27c0e;background:#fffaf0;max-width:320px"><b>📶 Wi-Fi gratuit</b><div>Réseau : <b class="mono">Mediatheque-Valbourg</b></div><small>Pas de mot de passe. Acceptez les conditions sur la page qui s'ouvre.</small></div>` });
      const off = N().net("Mediatheque-Valbourg", { secure: false, captive: true, bars: 4, kind: "public", portalTitle: "📚 Médiathèque de Valbourg · Wi-Fi gratuit", portalText: "Bienvenue à la médiathèque ! Ce Wi-Fi est gratuit et réservé aux usagers. Session de 3 heures." });
      const fake = N().net("Mediatheque-Valbourg-Gratuit-HD", { secure: false, captive: true, bars: 4, kind: "public", fake: true, portalTitle: "🎁 WIFI GRATUIT ULTRA RAPIDE",
        portalText: "Pour profiter du Wi-Fi HD gratuit, identifiez-vous avec votre compte de messagerie.", portalAsk: `<label>Adresse e-mail<input data-portal-f="email" autocomplete="off"></label><label>Mot de passe de la messagerie<input type="password" data-portal-f="pw" autocomplete="off"></label>` });
      let fakeTried = false;
      const pc = st.keep(N().pc(st.b, { big: ctx.demo, nets: [fake, off, N().net("Livebox-22B1", { key: "zzz", bars: 2 }), N().net("Imprimante-HP-Accueil", { secure: true, key: "zzz", bars: 3, internet: false })], url: "www.service-public.fr", pageTitle: "Navigateur",
        page: `<h3>📘 Service-public.fr</h3><p>La page s'affiche : Internet fonctionne ✅</p>`, onEvent: (t, d, x) => {
          if (t === "connect") {
            if (d.net.fake) {
              if (!fakeTried) { fakeTried = true; G.ko("net", "Choisir le réseau officiel (celui de l'affiche)", "« Mediatheque-Valbourg-Gratuit-HD » imite le vrai nom : n'importe qui peut créer un réseau Wi-Fi avec un nom attirant."); }
              T.note(`<div class="alert bad">🎣 Attention : ce n'est pas le nom de l'affiche ! N'importe qui peut créer un Wi-Fi au nom attirant (« Gratuit », « HD »…). Ouvrez le menu Wi-Fi et <b>déconnectez-vous</b>.</div>`);
            } else if (d.net.id === off.id) {
              if (T.done("net")) G.ok("net", "Choisir le réseau officiel (celui de l'affiche)");
              (d.auto ? G.ko : G.ok)("auto", "Ne pas cocher « Se connecter automatiquement » dans un lieu public", "Dans un lieu public, on ne coche pas cette case : l'ordinateur pourrait se connecter tout seul à un réseau du même nom, ailleurs.");
              if (d.auto) x.msg("💡 Dans un lieu public, mieux vaut <b>ne pas</b> cocher « Se connecter automatiquement ».", "info", 6000);
            } else x.msg("Ce réseau n'est pas celui de la médiathèque.", "warn");
          }
          if (t === "portalAccepted") {
            if (d.net.fake) {
              const gave = (d.fields.pw || "").length > 0;
              G.ko("portal", "Ne jamais donner son mot de passe pour un Wi-Fi", "Un Wi-Fi public ne demande jamais le mot de passe de votre messagerie. C'est un piège pour le voler.");
              x.state.connected = null; x.state.portalOk = {}; x.render();
              T.note(`<div class="alert bad">🛑 ${gave ? "Vous avez tapé un mot de passe : dans la vraie vie, il faudrait le <b>changer tout de suite</b>." : "Ce faux Wi-Fi demandait le mot de passe de votre messagerie !"} Un vrai Wi-Fi public demande au plus d'accepter les conditions. On vous a déconnecté(e) : choisissez le réseau de l'affiche.</div>`);
            } else {
              if (T.done("portal")) G.ok("portal", "Accepter les conditions sur la page de connexion");
              if (ctx.isBeginner()) x.hint(null, "refresh");
            }
          }
          if (t === "portalOpen" && d.net?.fake && !fakeTried) fakeTried = true;
          if (t === "refresh" && d.online && T.is("portal") && T.done("check")) {
            G.ok("check", "Vérifier la connexion"); x.hint(null);
            if (!L.ended) { L.ended = true; T.note(`<div class="alert good">✅ Connecté(e) au Wi-Fi de la médiathèque !</div>`);
              quiz(T.slot(), { G, key: "q4", questions: [
                { q: "Sur un Wi-Fi public, je peux…", choices: ["Lire les actualités, chercher un horaire", "Faire mes virements bancaires sans réfléchir"], ok: 0, why: "Pour la banque ou les démarches sensibles, on préfère la <b>4G</b> ou le Wi-Fi de la maison." },
                { q: "Un Wi-Fi public vous demande votre numéro de carte bancaire « pour vérifier votre âge ». ", choices: ["Je le donne", "C'est une arnaque : je me déconnecte"], ok: 1, why: "Un Wi-Fi gratuit ne demande jamais de carte bancaire ni de mot de passe." },
                { q: "Comment savoir quel est le vrai Wi-Fi d'un lieu ?", choices: ["Je prends celui qui a le meilleur signal", "Je lis l'affiche ou je demande à l'accueil"], ok: 1, why: "Un faux réseau peut avoir un très bon signal. Le bon nom est affiché, ou donné à l'accueil." }
              ], onDone: () => finish(ctx, G, { key: "wifi_public", label: "Je sais utiliser un Wi-Fi public prudemment", intro: "Vous savez reconnaître le vrai Wi-Fi d'un lieu public, accepter ses conditions… et repérer un faux réseau." }) }); }
          }
        } }));
    }
  });

  /* =========================================================
     NIVEAU 5 — « Pas d'Internet » : je dépanne
     ========================================================= */
  const PANNES = [
    { id: "avion", title: "Panne n° 1", start: { airplane: true }, fix: s => s === "ok", cause: "Le <b>mode avion</b> était activé. Un clic de trop, et tout est coupé !", boxOk: true },
    { id: "wifioff", title: "Panne n° 2", start: { wifiOn: false }, fix: s => s === "ok", cause: "Le <b>Wi-Fi</b> était désactivé.", boxOk: true },
    { id: "voisin", title: "Panne n° 3", start: { connected: "Wifi_Gratuit_Valbourg" }, fix: s => s === "ok", cause: "L'ordinateur s'était connecté à un <b>autre réseau</b> (sans Internet) au lieu de la box.", boxOk: true },
    { id: "box", title: "Panne n° 4", start: { connected: HOME }, fix: s => s === "ok", cause: "C'était la <b>box</b> : le voyant @ était rouge. La redémarrer a suffi.", boxOk: false }
  ];
  R("wifi_panne", {
    steps: 4,
    render(ctx) {
      const step = ctx.m.step || 0, L = ctx.local, G = grader(L);
      const P = PANNES[step]; if (!P) return ctx.finalScreen({ theme: null });
      const key = "Kp7mVx2eRt9q";
      const f = frame(ctx, { level: 5, title: `« Pas d'Internet » : ${P.title} / 4`, step,
        consigne: "Le navigateur affiche « Aucune connexion Internet ». Menez l'enquête : regardez <b>l'icône en bas à droite</b>, et les <b>voyants de la box</b>. Réparez, puis vérifiez avec <b>⟳</b>.",
        help: "Ordre conseillé : 1) l'icône en bas à droite (✈ ? globe barré ? point d'exclamation ?) 2) le menu Wi-Fi 3) les voyants de la box." });
      const st = stage(ctx, f.host);
      st.a.innerHTML = `<div class="wk-tasks"></div><div class="wk-boxslot" style="margin-top:12px"></div>`;
      const T = tasker(st.a.querySelector(".wk-tasks"), [{ k: "fix", label: "Trouvez la cause et réparez." }, { k: "check", label: "Vérifiez avec <b>⟳</b> dans le navigateur." }]);
      let uselessRestart = false;
      const bx = st.keep(N().box(st.a.querySelector(".wk-boxslot"), { ssid: HOME, key, state: P.boxOk ? "ok" : "fail", canRestart: true, wait: ctx.demo ? 5 : 6, big: ctx.demo, onEvent: (t) => {
        if (t === "restart" && P.boxOk && !uselessRestart) { uselessRestart = true; G.ko("diag_" + P.id, "Regarder l'icône avant de redémarrer la box", "Les voyants étaient tous verts : la box allait bien. Le problème venait de l'ordinateur."); T.note(`<div class="alert">🤔 Les voyants de la box étaient <b>verts</b> : elle allait bien. Regardez plutôt l'icône en bas à droite de l'ordinateur.</div>`); }
        if (t === "restart" && !P.boxOk) T.note(`<div class="alert">⏳ On attend que la box redémarre (les voyants clignotent)… puis ⟳ dans le navigateur.</div>`);
        if (t === "restarted") { pc.render(); if (P.fix(pc.status()) && T.done("fix") && !G.has("diag_" + P.id)) G.ok("diag_" + P.id, `Panne ${step + 1} : trouver la cause`); }
      } }));
      const nets = homeNets(key);
      const pc = st.keep(N().pc(st.b, { big: ctx.demo, nets, known: [HOME, "Wifi_Gratuit_Valbourg"], auto: { [HOME]: P.id !== "voisin" }, boxDown: () => bx.down, ...P.start, onEvent: (t, d, x) => {
        const s = x.status();
        if (["airplane", "wifi", "connect", "disconnect"].includes(t) || t === "refresh") {
          if (P.fix(s) && T.done("fix")) { if (!G.has("diag_" + P.id)) G.ok("diag_" + P.id, `Panne ${step + 1} : trouver la cause`); }
        }
        if (t === "restarted" || t === "refresh") { if (P.fix(s) && !T.is("fix")) { T.done("fix"); if (!G.has("diag_" + P.id)) G.ok("diag_" + P.id, `Panne ${step + 1} : trouver la cause`); } }
        if (t === "refresh" && d.online && T.is("fix") && T.done("check")) {
          G.ok("check_" + P.id, `Panne ${step + 1} : vérifier que ça remarche`);
          T.note(`<div class="alert good">✅ Réparé ! ${P.cause}</div>`);
          if (step < PANNES.length - 1) { T.slot().innerHTML = `<button type="button" class="primary" data-n>Panne suivante →</button>`; T.slot().querySelector("[data-n]").addEventListener("click", () => ctx.go(step + 1)); }
          else quiz(T.slot(), { G, key: "q5", questions: [
            { q: "Internet ne marche plus. Que regarde-t-on en premier ?", choices: ["On rappelle l'opérateur tout de suite", "L'icône réseau, en bas à droite (ou en haut du téléphone)", "On réinstalle l'ordinateur"], ok: 1, why: "L'icône dit presque tout : ✈ mode avion, globe barré (pas connecté), point d'exclamation (problème de box)." },
            { q: "Pour redémarrer la box :", choices: ["Je la débranche, j'attends quelques secondes, je la rebranche, puis j'attends 2 à 5 minutes", "J'appuie sur tous les boutons", "Je la secoue"], ok: 0, why: "Débrancher, attendre, rebrancher… et patienter : la box met quelques minutes à redémarrer." },
            { q: "Les voyants de la box restent rouges, même après un redémarrage. Que faire ?", choices: ["Appeler le service client de l'opérateur (numéro sur la facture ou le site officiel)", "Appeler le numéro qui s'affiche dans une fenêtre sur l'écran"], ok: 0, why: "On appelle le vrai numéro de l'opérateur (facture, contrat). Jamais un numéro affiché par une fenêtre surprise : c'est une arnaque." }
          ], onDone: () => finish(ctx, G, { key: "wifi_panne", label: "Je sais dépanner « pas d'Internet »", intro: "Vous savez lire l'icône réseau, désactiver le mode avion, rallumer le Wi-Fi, choisir le bon réseau et redémarrer la box." }) });
        }
        if (t === "refresh" && !d.online) x.msg(`Toujours rien. Regardez l'<b>icône en bas à droite</b>${P.boxOk ? "" : " et les <b>voyants de la box</b>"}.`, "info");
      } }));
      if (ctx.isBeginner()) pc.hint("tray");
    }
  });

  /* =========================================================
     NIVEAU 6 — Les arnaques autour de la box et du forfait
     ========================================================= */
  const sms = (from, text, extra = "") => `<div class="wk-sms"><b>💬 ${from}</b>${text}${extra}</div>`;
  R("wifi_scams", {
    steps: 1,
    render(ctx) {
      const L = ctx.local, G = grader(L);
      if ((ctx.m.step || 0) > 0) return ctx.finalScreen({ theme: null });
      const f = frame(ctx, { level: 6, title: "Les arnaques autour de la box et du forfait", step: 0, noClient: true,
        consigne: "Messages, appels, Wi-Fi gratuits… Pour chaque situation : <b>arnaque</b> ou <b>normal</b> ? Les escrocs aiment parler de box et de forfait, parce que tout le monde en a un." });
      const A = ["🚩 Arnaque", "✅ Normal"];
      quiz(f.panel, { G, key: "scam", questions: [
        { label: "SMS « forfait épuisé, rechargez 1,99 € » : arnaque", q: `${sms("+33 7 56 12 98 40", "<p>Votre forfait mobile est épuisé. Rechargez 1,99 € pour éviter la coupure : <u>recharge-forfait-fr.info</u></p>")}`, choices: A, ok: 0, why: "Numéro inconnu, petit montant, lien bizarre, urgence : arnaque. Votre opérateur ne vous envoie pas de lien de paiement comme ça." },
        { label: "SMS d'information de l'opérateur, sans lien : normal", q: `${sms("Mon opérateur", "<p>Vous avez consommé 80 % de votre forfait internet. Consultez le détail dans votre espace client.</p>")}`, choices: A, ok: 1, why: "Une simple information, sans lien ni demande : c'est normal. Pour vérifier, on passe soi-même par l'application ou l'espace client." },
        { label: "Faux technicien qui veut prendre la main : arnaque", q: `<div class="wk-sms"><b>📞 Appel</b><p>« Bonjour, technicien de votre opérateur. Votre box est piratée ! Installez l'application que je vais vous dicter pour que je prenne la main sur votre ordinateur. »</p></div>`, choices: A, ok: 0, why: "Arnaque classique : un vrai technicien ne prend jamais la main sur votre ordinateur suite à un appel imprévu. On raccroche." },
        { label: "Wi-Fi qui demande une carte bancaire : arnaque", q: `<div class="wk-sms"><b>📶 Wi-Fi « Free_WiFi_Aeroport »</b><p>Pour vérifier votre âge, saisissez votre numéro de carte bancaire. Aucun débit ne sera effectué.</p></div>`, choices: A, ok: 0, why: "Un Wi-Fi gratuit ne demande jamais de carte bancaire." },
        { label: "Partager la clé Wi-Fi avec un proche : possible", q: `<div class="wk-sms"><b>📞 Votre petite-fille, en visite</b><p>« Mamie, c'est quoi le code du Wi-Fi ? »</p></div>`, choices: ["🚩 Je refuse toujours", "✅ Je peux le donner à quelqu'un de confiance (il est sur l'étiquette)"], ok: 1, why: "La clé Wi-Fi peut se partager avec ses proches, chez soi. Ce qu'on ne donne jamais : ses mots de passe de comptes, ses codes bancaires." },
        { label: "SMS « box suspendue sous 24 h » : arnaque", q: `${sms("SERVICE-BOX", "<p>Votre box sera suspendue sous 24 h suite à un impayé. Régularisez : <u>box-regularisation.com</u></p>")}`, choices: A, ok: 0, why: "Pression (24 h), impayé inventé, lien inconnu : arnaque. En cas de doute, on appelle le numéro inscrit sur sa facture." }
      ], onDone: () => {
        f.panel.innerHTML = `<div class="alert good">Bravo ! Et si vous recevez un SMS d'arnaque ?</div><div class="mk-q-slot"></div>`;
        quiz(f.panel.querySelector(".mk-q-slot"), { G, key: "scam2", questions: [
          { q: "Je reçois un SMS d'arnaque. Je peux le signaler gratuitement en le transférant au…", choices: ["33700", "17", "3615"], ok: 0, why: "Le <b>33700</b> est le numéro officiel pour signaler les SMS et appels indésirables. Puis on supprime le message." },
          { q: "J'ai cliqué sur un lien et payé 1,99 €. Que faire ?", choices: ["Rien, c'est peu", "J'appelle ma banque pour faire opposition, et je regarde cybermalveillance.gouv.fr"], ok: 1, why: "Les escrocs gardent votre numéro de carte : ils feront d'autres prélèvements. On fait opposition au plus vite." }
        ], onDone: () => finish(ctx, G, { key: "wifi_scams", label: "Je repère les arnaques autour de la box et du forfait", intro: "Vous repérez les faux SMS de forfait, les faux techniciens et les faux Wi-Fi, et vous savez signaler au 33700." }) });
      } });
    }
  });

  /* =========================================================
     NIVEAU 7 — Partage de connexion (quand la box est en panne)
     ========================================================= */
  R("wifi_share", {
    steps: 1,
    render(ctx) {
      const L = ctx.local, G = grader(L);
      if ((ctx.m.step || 0) > 0) return ctx.finalScreen({ theme: null });
      const f = frame(ctx, { level: 7, title: "Le partage de connexion", step: 0,
        consigne: "La box de Marie est en panne, et le technicien ne vient que demain. Or elle doit envoyer un formulaire <b>aujourd'hui</b>. Son téléphone peut servir de « box de secours » !",
        help: "Sur le téléphone : ⚙️ Réglages › Données mobiles, puis Partage de connexion. Sur l'ordinateur : le menu Wi-Fi, comme pour une box." });
      f.host.innerHTML = `<div class="wk-tasks"></div><div class="wk-duo wk-tel" style="margin-top:10px"><div class="wk-pc"></div><div class="wk-ph"></div></div>`;
      ctx.local.sims?.forEach(s => s.destroy()); ctx.local.sims = [];
      if (!L.simHook) { L.simHook = true; ctx.onCleanup(() => L.sims?.forEach(s => s.destroy())); }
      const T = tasker(f.host.querySelector(".wk-tasks"), [
        { k: "data", label: "Sur le <b>téléphone</b>, activez les <b>données mobiles</b> (elles sont coupées)." },
        { k: "hs", label: "Activez le <b>partage de connexion</b>. Notez son nom et son mot de passe." },
        { k: "pc", label: "Sur l'<b>ordinateur</b>, connectez-vous au Wi-Fi du téléphone avec ce mot de passe." },
        { k: "check", label: "Vérifiez avec <b>⟳</b> dans le navigateur." },
        { k: "off", label: "Le formulaire est envoyé : <b>coupez le partage</b> pour économiser le forfait." }
      ]);
      const hsName = "Téléphone de Marie", hsKey = ctx.byLevel({ beginner: "tomate42", intermediate: "tomate-pluie-42", expert: "tomate-pluie-42" });
      let ph;
      const hsNet = N().net(hsName, { key: hsKey, bars: 4, kind: "hotspot", hidden: () => !ph?.state.hotspot, dead: () => !ph?.online() });
      const pc = N().pc(f.host.querySelector(".wk-pc"), { big: ctx.demo, nets: [N().net(HOME, { key: "Kp7mVx2eRt9q", bars: 4, internet: false }), N().net("Livebox-7A3E", { key: "zzz", bars: 2 })], connected: HOME, known: [HOME],
        url: "www.caf.fr", page: `<h3>👪 Formulaire envoyé (simulation)</h3><p>La page s'affiche grâce au partage de connexion ✅</p>`, onEvent: (t, d, x) => {
          if (t === "wrongKey") { if (!G.has("pc")) G.ko("pc", "Taper le mot de passe du partage", "Il est affiché dans Réglages › Partage de connexion, sur le téléphone."); T.note(`<div class="alert">Le mot de passe est écrit sur le téléphone, dans <b>Partage de connexion</b>.</div>`); }
          if (t === "connect" && d.net.id === hsName && T.done("pc")) { if (!G.has("pc")) G.ok("pc", "Taper le mot de passe du partage"); if (ctx.isBeginner()) x.hint(null, "refresh"); }
          if (t === "refresh" && d.online && x.current?.id === hsName && T.done("check")) { G.ok("check", "Vérifier que ça marche"); x.hint(null); T.note(`<div class="alert good">✅ L'ordinateur passe par le téléphone ! Pensez à couper le partage une fois fini.</div>`); }
          if (t === "refresh" && !d.online) x.msg(x.current?.id === HOME ? "Toujours connecté(e) à la box, qui est en panne. Choisissez le réseau du <b>téléphone</b> dans le menu Wi-Fi." : "Pas d'Internet. Le partage est-il bien activé sur le téléphone ?", "info", 6000);
        } });
      ph = N().phone(f.host.querySelector(".wk-ph"), { big: false, nets: [N().net(HOME, { key: "Kp7mVx2eRt9q", bars: 4, internet: false })], connected: null, wifiOn: false, data: false, hsName, hsKey, onEvent: (t, d) => {
        if (t === "data" && d.on && T.done("data")) G.ok("data", "Activer les données mobiles");
        if (t === "hotspotRefused") T.note(`<div class="alert">Il faut d'abord activer les <b>données mobiles</b> : c'est elles que le téléphone va partager.</div>`);
        if (t === "hotspot") {
          if (d.on && T.done("hs")) { G.ok("hs", "Activer le partage de connexion"); if (ctx.isBeginner()) pc.hint("tray"); }
          if (!d.on) { if (pc.current?.id === hsName) { pc.state.connected = null; } pc.render(); if (T.is("check") && T.done("off")) { G.ok("off", "Couper le partage à la fin"); end(); } }
          else pc.render();
        }
        if (t === "data" && !d.on) pc.render();
      } });
      L.sims.push(pc, ph);
      pc.addNet(hsNet);
      function end() {
        if (L.ended) return; L.ended = true;
        quiz(T.slot(), { G, key: "q7", questions: [
          { q: "Avec le partage de connexion, l'ordinateur utilise…", choices: ["Le forfait du téléphone", "La box du voisin", "Rien, c'est gratuit"], ok: 0, why: "L'ordinateur passe par les données mobiles du téléphone : il consomme le forfait. Pas de vidéos en partage !" },
          { q: "Le partage de connexion, c'est utile quand…", choices: ["La box est en panne, ou en déplacement sans Wi-Fi", "Je veux aller plus vite chez moi"], ok: 0, why: "C'est une solution de secours : pour une démarche urgente, un mail, un formulaire." },
          { q: "Pourquoi le partage a-t-il un mot de passe ?", choices: ["Pour que les voisins ne profitent pas de mon forfait", "Ça ne sert à rien"], ok: 0, why: "Sans mot de passe, n'importe qui à côté pourrait utiliser votre forfait." }
        ], onDone: () => finish(ctx, G, { key: "wifi_share", label: "Je sais utiliser le partage de connexion", intro: "Vous savez transformer votre téléphone en « box de secours » pour l'ordinateur… et couper le partage ensuite." }) });
      }
    }
  });

  /* =========================================================
     NIVEAU 8 — Mission réelle
     ========================================================= */
  R("wifi_real", {
    steps: 2,
    render(ctx) {
      const step = ctx.m.step || 0, L = ctx.local, G = grader(L);
      if (step === 0) {
        const f = frame(ctx, { level: 8, title: "Mission réelle : mon téléphone et la médiathèque", step: 0, noClient: true,
          consigne: "Cette fois, sur votre <b>vrai téléphone</b> (ou une tablette), et dans la médiathèque. On observe et on note, sans rien changer d'important." });
        f.panel.innerHTML = `<ol class="nv-steps">
            <li>Regardez la <b>barre d'état</b> de votre téléphone (tout en haut) : quelles icônes voyez-vous ?</li>
            <li>Ouvrez <b>Réglages</b> (ou Paramètres) et trouvez le <b>mode avion</b>. <b>Ne l'activez pas</b> : trouvez-le seulement.</li>
            <li>Trouvez la <b>consommation des données</b> du mois (Réglages › Données cellulaires, ou Connexions › Utilisation des données).</li>
            <li>Ouvrez la liste des <b>réseaux Wi-Fi</b> : trouvez le Wi-Fi de la médiathèque (le nom est affiché à l'accueil). Vous pouvez vous y connecter si vous le souhaitez.</li></ol>
          <div class="alert">🔒 On ne recopie <b>aucun mot de passe</b>. Si une page demande autre chose que d'accepter les conditions (mot de passe, carte bancaire…), on ferme et on prévient le formateur ✋.<br>📱 Pas de smartphone ? Faites la mission avec l'ordinateur de la médiathèque (icône en bas à droite).</div>
          <div class="final-actions"><button type="button" class="primary" data-go>J'ai fait la mission : je réponds →</button></div>`;
        f.panel.querySelector("[data-go]").addEventListener("click", () => ctx.go(1));
        return;
      }
      if (step === 1) {
        const f = frame(ctx, { level: 8, title: "Mes observations", step: 1, noClient: true, consigne: "Répondez à partir de ce que vous avez vu." });
        const chk = (name, vals) => vals.map(v => `<label><input type="radio" name="${name}" value="${v}"> ${v}</label>`).join("");
        f.panel.innerHTML = `<div class="nv-real">
          <fieldset class="nv-check"><legend><b>📱 Mon appareil</b></legend>${chk("dev", ["Mon téléphone", "Une tablette", "L'ordinateur de la médiathèque"])}</fieldset>
          <fieldset class="nv-check"><legend><b>📶 En haut de l'écran, je vois…</b> (cochez tout ce que vous voyez)</legend>${["Wi-Fi (l'éventail)", "4G ou 5G", "Le mode avion ✈", "Les barres de réseau"].map(v => `<label><input type="checkbox" data-ico value="${v}"> ${v}</label>`).join("")}</fieldset>
          <fieldset class="nv-check"><legend><b>📊 Ma consommation ce mois-ci</b></legend>${chk("use", ["Moins de 1 Go", "Entre 1 et 5 Go", "Plus de 5 Go", "Je n'ai pas trouvé"])}</fieldset>
          <label>🏛️ Le nom du Wi-Fi de la médiathèque (tel qu'affiché)<input type="text" data-f="ssid" autocomplete="off" spellcheck="false" maxlength="60"></label>
          <fieldset class="nv-check"><legend><b>✅ J'ai réussi à…</b> (cochez seulement ce qui est vrai)</legend>
            <label><input type="checkbox" data-c="air"> trouver le mode avion (sans l'activer)</label>
            <label><input type="checkbox" data-c="list"> afficher la liste des réseaux Wi-Fi</label>
            <label><input type="checkbox" data-c="nothing"> ne donner aucun mot de passe ni code</label></fieldset>
          <label>💬 Une question, une difficulté ? (facultatif)<input type="text" data-f="note" maxlength="300" autocomplete="off"></label>
          <div class="mk-fb"></div>
          <div class="final-actions"><button type="button" class="secondary" data-back>← Revoir la mission</button><button type="button" class="primary" data-send>📤 Envoyer au formateur</button></div></div>`;
        const $f = s => f.panel.querySelector(s);
        $f("[data-back]").addEventListener("click", () => ctx.go(0));
        $f("[data-send]").addEventListener("click", async () => {
          const val = n => f.panel.querySelector(`[name="${n}"]:checked`)?.value || "";
          const dev = val("dev"), use = val("use"), ssid = $f('[data-f="ssid"]').value.trim(), note = $f('[data-f="note"]').value.trim();
          const icons = [...f.panel.querySelectorAll("[data-ico]:checked")].map(i => i.value);
          if (!dev || !use || !icons.length) { $f(".mk-fb").innerHTML = `<div class="alert bad">Répondez aux questions sur l'appareil, les icônes et la consommation 🙂</div>`; return; }
          const c = k => $f(`[data-c="${k}"]`).checked;
          $f("[data-send]").disabled = true;
          G.ok("icons", "Lire les icônes de son appareil");
          (use !== "Je n'ai pas trouvé" ? G.ok : G.ko)("use", "Trouver sa consommation de données", "Réglages › Données cellulaires (iPhone) ou Connexions › Utilisation des données (Android). On cherche ensemble !");
          (ssid ? G.ok : G.ko)("ssid", "Trouver le nom du Wi-Fi de la médiathèque", "Il est affiché à l'accueil, ou on le demande.");
          (c("air") ? G.ok : G.ko)("air", "Trouver le mode avion", "Réglages, tout en haut ; ou en glissant le doigt depuis le haut de l'écran.");
          (c("list") ? G.ok : G.ko)("list", "Afficher la liste des réseaux Wi-Fi", "Réglages › Wi-Fi.");
          (c("nothing") ? G.ok : G.ko)("nothing", "Ne donner aucun mot de passe ni code", "Pour cette mission, on n'avait rien à donner.");
          if (icons.includes("Le mode avion ✈")) $f(".mk-fb").innerHTML = `<div class="alert">✈ Le mode avion est activé sur votre appareil ? Pensez à le désactiver si vous voulez Internet !</div>`;
          const text = `📶 Mission réelle Wi-Fi\n📱 Appareil : ${dev}\n🔎 Icônes : ${icons.join(", ")}\n📊 Consommation : ${use}\n🏛️ Wi-Fi médiathèque : ${ssid || "(non trouvé)"}\n${c("air") ? "✅" : "⬜"} mode avion trouvé · ${c("list") ? "✅" : "⬜"} liste Wi-Fi · ${c("nothing") ? "✅" : "⬜"} rien donné${note ? `\n💬 ${note}` : ""}`;
          try { await ctx.api.sendToTeacher?.("📶 Mission réelle : Wi-Fi", text.slice(0, 1900)); }
          catch (e) { $f(".mk-fb").innerHTML = `<div class="alert bad">La réponse n'a pas pu partir : ${esc(e.message)}. Réessayez.</div>`; $f("[data-send]").disabled = false; return; }
          finish(ctx, G, { key: "wifi_real", label: "J'ai observé le réseau de mon vrai appareil", intro: `${ctx.demo ? "En projection, la réponse n'est pas envoyée." : "📤 Vos observations sont parties chez le formateur : il vous répondra dans votre <b>messagerie</b>."}<br>Appareil : <b>${esc(dev)}</b> · Icônes : <b>${esc(icons.join(", "))}</b> · Consommation : <b>${esc(use)}</b>` });
        });
        return;
      }
      ctx.finalScreen({ theme: null });
    }
  });
})(window.AN);

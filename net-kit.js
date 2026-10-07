/* =========================================================
   Kit « Réseaux » : simulateurs pour le chapitre Wi-Fi
   - AN.net.pc(el, opts)    : bureau Windows 11, barre des tâches,
                              menu Wi-Fi (réseaux, clé, mode avion),
                              navigateur qui marche… ou pas.
   - AN.net.phone(el, opts) : smartphone : barre d'état, Réglages
                              (mode avion, Wi-Fi, données mobiles,
                              partage de connexion, consommation).
   - AN.net.box(el, opts)   : la box : voyants, étiquette, redémarrage.
   - AN.net.signal(bars, o) : l'icône Wi-Fi dessinée (SVG).
   Tout est simulé : rien ne touche au vrai réseau.
   ========================================================= */
(function (AN) {
  "use strict";
  const { esc } = AN.util;

  /* ---------- icônes ---------- */
  /** Éventail Wi-Fi : bars = 0 à 4. o.cross (barré), o.warn (pas d'Internet), o.off (grisé) */
  function signal(bars = 4, o = {}) {
    const on = i => i < bars && !o.off;
    const c = o.color || "currentColor", dim = o.dim || "rgba(127,127,127,.35)";
    return `<svg viewBox="0 0 24 24" class="nk-sig ${o.cls || ""}" aria-hidden="true" width="${o.size || "1.2em"}" height="${o.size || "1.2em"}">
      <path d="M2 9.5a15 15 0 0 1 20 0" fill="none" stroke="${on(3) ? c : dim}" stroke-width="2.2" stroke-linecap="round"/>
      <path d="M5.2 12.8a10.5 10.5 0 0 1 13.6 0" fill="none" stroke="${on(2) ? c : dim}" stroke-width="2.2" stroke-linecap="round"/>
      <path d="M8.4 16.1a6 6 0 0 1 7.2 0" fill="none" stroke="${on(1) ? c : dim}" stroke-width="2.2" stroke-linecap="round"/>
      <circle cx="12" cy="19.4" r="1.6" fill="${on(0) ? c : dim}"/>
      ${o.cross ? `<path d="M4 4 L20 20" stroke="#d13438" stroke-width="2.4" stroke-linecap="round"/>` : ""}
      ${o.warn ? `<circle cx="19" cy="18" r="4.6" fill="#f7c948" stroke="#fff" stroke-width="1"/><text x="19" y="20.6" text-anchor="middle" font-size="7" font-weight="900" fill="#3b2a00">!</text>` : ""}</svg>`;
  }
  const globe = (cross = true) => `<svg viewBox="0 0 24 24" class="nk-sig" width="1.2em" height="1.2em" aria-hidden="true"><circle cx="12" cy="12" r="8.5" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="M3.5 12h17M12 3.5c3 3.2 3 13.8 0 17M12 3.5c-3 3.2-3 13.8 0 17" fill="none" stroke="currentColor" stroke-width="1.5"/>${cross ? `<circle cx="18.5" cy="18.5" r="5" fill="#fff"/><path d="M15.8 15.8l5.4 5.4" stroke="#d13438" stroke-width="2.2" stroke-linecap="round"/><circle cx="18.5" cy="18.5" r="3.8" fill="none" stroke="#d13438" stroke-width="1.6"/>` : ""}</svg>`;
  const plane = `<span class="nk-plane" aria-hidden="true">✈</span>`;
  const lock = `<span class="nk-lock" aria-hidden="true">🔒</span>`;
  const cellBars = n => `<span class="nk-cell" aria-hidden="true">${[0, 1, 2, 3].map(i => `<i style="height:${30 + i * 22}%" class="${i < n ? "on" : ""}"></i>`).join("")}</span>`;

  /** Réseau : { id, name, bars, secure, key, internet, captive, home, kind:"box"|"public"|"hotspot" } */
  const net = (name, o = {}) => ({ id: o.id || name, name, bars: o.bars ?? 3, secure: o.secure ?? true, key: o.key || "", internet: o.internet ?? true, captive: !!o.captive, kind: o.kind || "box", ...o });

  /* =========================================================
     LE PC (Windows 11)
     ========================================================= */
  function pc(el, opts = {}) {
    const S = {
      wifiOn: opts.wifiOn ?? true, airplane: !!opts.airplane, cable: !!opts.cable, connected: opts.connected || null,
      nets: opts.nets || [], auto: { ...(opts.auto || {}) }, known: Object.fromEntries((opts.known || []).map(k => [k, true])), portalOk: {}, panel: null /* "quick" | "list" */, expanded: null, asking: null, err: "", checking: false,
      page: opts.page || null, refreshing: false, captiveOpen: false, boxDown: () => !!opts.boxDown?.(), msg: null
    };
    const emit = (t, d) => { try { opts.onEvent?.(t, d, ctl); } catch (e) { console.error(e); } };
    let destroyed = false, timers = [];
    const later = (fn, ms) => { const t = setTimeout(() => { if (!destroyed) fn(); }, ms); timers.push(t); };
    const cur = () => S.nets.find(n => n.id === S.connected) || null;
    /** état de la connexion : "ok" · "nointernet" · "captive" · "none" · "airplane" · "off" · "cable" */
    function status() {
      if (S.cable && !S.airplane) return opts.boxDown?.() ? "nointernet" : "cable";
      if (S.airplane) return "airplane";
      if (!S.wifiOn) return "off";
      const n = cur(); if (!n) return "none";
      if (n.captive && !S.portalOk[n.id]) return "captive";
      if (!n.internet || (n.kind === "box" && opts.boxDown?.()) || (n.kind === "hotspot" && n.dead?.())) return "nointernet";
      return "ok";
    }
    const online = () => ["ok", "cable"].includes(status());
    function trayIcon() {
      const st = status(), n = cur();
      if (st === "airplane") return plane;
      if (st === "cable") return `<span aria-hidden="true">🖧</span>`;
      if (st === "off" || st === "none") return globe(true);
      if (st === "nointernet" || st === "captive") return signal(n.bars, { warn: true });
      return signal(n.bars);
    }
    const stText = n => {
      if (n.id !== S.connected) return n.secure ? "Sécurisé" : "Ouvert";
      const st = status();
      return st === "captive" ? "Action requise" : st === "nointernet" ? `Aucun Internet${n.secure ? ", sécurisé" : ", ouvert"}` : `Connecté${n.secure ? ", sécurisé" : ""}`;
    };
    const clock = () => { const d = new Date(); return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}<br>${d.toLocaleDateString("fr-FR")}`; };

    function listHTML() {
      if (!S.wifiOn || S.airplane) return `<div class="nk-empty">${S.airplane ? "✈️ Le mode avion est activé : le Wi-Fi est coupé." : "Le Wi-Fi est désactivé."}</div>`;
      const ns = [...S.nets].filter(n => !n.hidden?.()).sort((a, b) => (b.id === S.connected) - (a.id === S.connected) || b.bars - a.bars);
      return ns.map(n => {
        const ex = S.expanded === n.id, con = n.id === S.connected;
        return `<div class="nk-net ${ex ? "ex" : ""} ${con ? "con" : ""} ${S.hint === n.id ? "nk-hint" : ""}" data-nk="net" data-id="${esc(n.id)}" role="button" tabindex="0">
          <div class="nk-net-row">${signal(n.bars)}${n.secure ? lock : ""}<div class="nk-net-t"><b>${esc(n.name)}</b><small>${stText(n)}</small></div></div>
          ${ex ? (S.asking === n.id ? `<div class="nk-key"><label>Entrer la clé de sécurité réseau<span class="nk-pw"><input type="password" data-nk-in="key" autocomplete="off" spellcheck="false" autocapitalize="off"><button type="button" data-nk="eye" aria-label="Afficher la clé" title="Afficher">👁</button></span></label>
                ${S.err ? `<div class="nk-err" role="alert">${S.err}</div>` : ""}${S.checking ? `<div class="nk-wait">Vérification de la configuration requise…</div>` : `<div class="nk-btns"><button type="button" class="pri" data-nk="next">Suivant</button><button type="button" data-nk="cancel">Annuler</button></div>`}</div>`
            : con ? `<div class="nk-btns">${status() === "captive" ? `<button type="button" class="pri" data-nk="portal">Ouvrir le navigateur</button>` : ""}<button type="button" data-nk="disconnect">Se déconnecter</button></div>`
            : `${!n.secure ? `<p class="nk-open-warn">⚠️ Les autres personnes sur ce réseau peuvent voir les informations que vous envoyez.</p>` : ""}<label class="nk-auto"><input type="checkbox" data-nk="auto" ${S.auto[n.id] ? "checked" : ""}> Se connecter automatiquement</label><div class="nk-btns"><button type="button" class="pri ${S.hintTool === "connect" ? "nk-hint" : ""}" data-nk="connect">Se connecter</button></div>`) : ""}
        </div>`;
      }).join("") || `<div class="nk-empty">Aucun réseau Wi-Fi trouvé.</div>`;
    }
    function panelHTML() {
      if (!S.panel) return "";
      if (S.panel === "list") return `<div class="nk-flyout list" role="dialog" aria-label="Wi-Fi"><div class="nk-fly-head"><button type="button" data-nk="backq" aria-label="Retour">‹</button><b>Wi-Fi</b><button type="button" class="nk-toggle ${S.wifiOn && !S.airplane ? "on" : ""}" data-nk="wifi" aria-label="Wi-Fi">${S.wifiOn && !S.airplane ? "Activé" : "Désactivé"}</button></div><div class="nk-nets">${listHTML()}</div><div class="nk-fly-foot">Plus de paramètres Wi-Fi</div></div>`;
      const n = cur();
      return `<div class="nk-flyout" role="dialog" aria-label="Paramètres rapides"><div class="nk-tiles">
          <div class="nk-tile2 ${S.wifiOn && !S.airplane ? "on" : ""} ${S.hintTool === "wifi" ? "nk-hint" : ""}"><button type="button" data-nk="wifi" aria-label="Activer ou désactiver le Wi-Fi">${S.wifiOn && !S.airplane ? signal(n ? n.bars : 4) : signal(4, { off: true })}</button><button type="button" data-nk="list" class="${S.hintTool === "list" ? "nk-hint" : ""}" aria-label="Voir les réseaux Wi-Fi">›</button></div>
          <button type="button" class="nk-tile ${S.airplane ? "on" : ""} ${S.hintTool === "airplane" ? "nk-hint" : ""}" data-nk="airplane">✈️<span>Mode avion</span></button>
          <button type="button" class="nk-tile" data-nk="deco">🔵<span>Bluetooth</span></button>
          <button type="button" class="nk-tile" data-nk="deco">🔋<span>Économiseur</span></button>
          <div class="nk-tile-lab">${S.airplane ? "Mode avion" : !S.wifiOn ? "Wi-Fi désactivé" : n ? esc(n.name) : "Non connecté"}</div>
        </div><div class="nk-quick-foot">🔋 76 %</div></div>`;
    }
    function pageHTML() {
      const st = status();
      if (S.refreshing) return `<div class="nk-page wait">⟳ Chargement…</div>`;
      if (st === "captive") return S.captiveOpen ? portalHTML(cur()) : `<div class="nk-page off"><div class="nk-dino">🔐</div><h3>Connexion requise</h3><p>Ce réseau demande d'accepter ses conditions avant d'accéder à Internet.</p><button type="button" data-nk="portal" class="pri">Ouvrir la page de connexion</button></div>`;
      if (!online()) {
        const tip = st === "airplane" ? "Désactivez le mode avion." : st === "off" ? "Activez le Wi-Fi." : st === "none" ? "Connectez-vous à un réseau Wi-Fi." : "Vérifiez la box ou le réseau.";
        return `<div class="nk-page off"><div class="nk-dino">🦖</div><h3>Aucune connexion Internet</h3><p>Essayez de :</p><ul><li>Vérifier les câbles du modem et du routeur</li><li>Vous reconnecter au Wi-Fi</li></ul><p class="nk-tip">💡 ${tip}</p><small>ERR_INTERNET_DISCONNECTED</small></div>`;
      }
      return `<div class="nk-page">${S.page ? (typeof S.page === "function" ? S.page() : S.page) : `<h3>📚 Médiathèque de Valbourg</h3><p>Bienvenue ! Le site s'affiche : Internet fonctionne. ✅</p>`}</div>`;
    }
    function portalHTML(n) {
      return `<div class="nk-page portal"><div class="nk-portal-head">${esc(n.portalTitle || "Wi-Fi gratuit")}</div>
        <p>${n.portalText || "Bienvenue ! Pour utiliser le Wi-Fi gratuit, acceptez les conditions d'utilisation."}</p>
        <label class="nk-auto"><input type="checkbox" data-nk="cgu"> J'accepte les conditions d'utilisation</label>
        ${n.portalAsk ? `<div class="nk-portal-ask">${n.portalAsk}</div>` : ""}
        <button type="button" class="pri" data-nk="portalOk">Se connecter</button><div class="nk-err" data-portal-err></div></div>`;
    }
    function render() {
      if (destroyed) return;
      const st = status();
      el.innerHTML = `<div class="nk-pc ${opts.big ? "big" : ""}">
        <div class="nk-desk">
          <div class="nk-win"><div class="nk-win-bar"><span>🌐 ${esc(opts.pageTitle || "Navigateur")}</span><button type="button" data-nk="refresh" title="Actualiser" class="${S.hintTool === "refresh" ? "nk-hint" : ""}">⟳</button><span class="nk-url">${online() || st === "captive" ? esc(opts.url || "www.mediatheque-valbourg.fr") : ""}</span></div>${pageHTML()}</div>
          ${S.msg ? `<div class="nk-msg ${S.msg.kind}" role="status">${S.msg.html}</div>` : ""}
          ${panelHTML()}
        </div>
        <div class="nk-bar"><span class="nk-start">⊞</span><span class="nk-apps">🔍 📁 🌐</span>
          <button type="button" class="nk-tray ${S.hint === "tray" ? "nk-hint" : ""}" data-nk="tray" aria-label="Réseau et son : ${esc(stLabel(st))}" title="${esc(stLabel(st))}">${trayIcon()}<span aria-hidden="true">🔊</span><span aria-hidden="true">🔋</span></button>
          <span class="nk-clock">${clock()}</span></div>
      </div>`;
      const k = el.querySelector('[data-nk-in="key"]');
      if (k) { k.focus(); k.addEventListener("keydown", e => { e.stopPropagation(); if (e.key === "Enter") submitKey(); if (e.key === "Escape") { S.asking = null; S.err = ""; render(); } }); }
    }
    const stLabel = st => ({ ok: `Connecté à ${cur()?.name}, accès Internet`, cable: "Réseau câblé, accès Internet", nointernet: "Aucun accès Internet", captive: "Action requise", none: "Non connecté", off: "Wi-Fi désactivé", airplane: "Mode avion" })[st];
    function msg(html, kind = "info", ms = 4500) { S.msg = { html, kind }; render(); if (ms) later(() => { S.msg = null; render(); }, ms); }

    function connect(n, key) {
      S.checking = true; S.err = ""; render();
      later(() => {
        S.checking = false;
        if (n.secure && key !== n.key) {
          S.err = "La clé de sécurité réseau n'est pas correcte. Veuillez réessayer.";
          render(); emit("wrongKey", { net: n, key, caseOnly: key.toLowerCase() === n.key.toLowerCase(), spaces: key.trim() !== key || key.replace(/\s/g, "") === n.key.replace(/\s/g, "") });
          return;
        }
        S.connected = n.id; S.known[n.id] = true; S.asking = null; S.expanded = null; S.err = "";
        render(); emit("connect", { net: n, auto: !!S.auto[n.id], status: status() });
        if (n.captive && !S.portalOk[n.id]) later(() => msg("🔐 <b>Action requise</b> : ce réseau demande d'ouvrir une page dans le navigateur.", "warn", 6000), 400);
      }, opts.fast ? 150 : 900);
    }
    function submitKey() { const n = S.nets.find(x => x.id === S.asking); const v = el.querySelector('[data-nk-in="key"]')?.value || ""; if (!v) { S.err = "Tapez la clé de sécurité (le mot de passe du Wi-Fi)."; render(); return; } connect(n, v); }

    function onClick(e) {
      const b = e.target.closest("[data-nk]"); if (!b || !el.contains(b)) { if (S.panel && !e.target.closest(".nk-flyout")) { S.panel = null; render(); } return; }
      const a = b.dataset.nk;
      switch (a) {
        case "tray": S.panel = S.panel ? null : "quick"; render(); emit("tray", { open: !!S.panel }); return;
        case "list": S.panel = "list"; render(); emit("list", {}); return;
        case "backq": S.panel = "quick"; render(); return;
        case "wifi": if (S.airplane) { S.airplane = false; S.wifiOn = true; } else S.wifiOn = !S.wifiOn; if (!S.wifiOn) S.connected = null; else autoJoin(); render(); emit("wifi", { on: S.wifiOn && !S.airplane, status: status() }); return;
        case "airplane": S.airplane = !S.airplane; if (S.airplane) { S.prevConn = S.connected; S.connected = null; } else { S.wifiOn = true; autoJoin(); } render(); emit("airplane", { on: S.airplane, status: status() }); return;
        case "deco": return;
        case "net": { const id = b.dataset.id; if (e.target.closest("input,button,label")) return; S.expanded = S.expanded === id ? null : id; S.asking = null; S.err = ""; render(); emit("pick", { net: S.nets.find(n => n.id === id) }); return; }
        case "auto": { const id = b.closest("[data-id]").dataset.id; S.auto[id] = b.checked; emit("autoCheck", { id, on: b.checked }); return; }
        case "connect": { const n = S.nets.find(x => x.id === b.closest("[data-id]").dataset.id); if (n.secure && !S.known[n.id]) { S.asking = n.id; S.err = ""; render(); emit("askKey", { net: n }); } else connect(n, n.secure ? n.key : ""); return; }
        case "eye": { const i = el.querySelector('[data-nk-in="key"]'); if (i) { i.type = i.type === "password" ? "text" : "password"; i.focus(); emit("eye", {}); } return; }
        case "next": submitKey(); return;
        case "cancel": S.asking = null; S.err = ""; render(); return;
        case "disconnect": { const n = cur(); S.connected = null; S.expanded = null; render(); emit("disconnect", { net: n }); return; }
        case "refresh": S.refreshing = true; render(); later(() => { S.refreshing = false; render(); emit("refresh", { online: online(), status: status() }); }, 500); return;
        case "portal": S.captiveOpen = true; S.panel = null; render(); emit("portalOpen", { net: cur() }); return;
        case "portalOk": {
          const n = cur(); const cgu = el.querySelector('[data-nk="cgu"]')?.checked;
          const errEl = el.querySelector("[data-portal-err]");
          if (!cgu) { if (errEl) errEl.textContent = "Cochez d'abord « J'accepte les conditions »."; emit("portalNoCgu", {}); return; }
          const fields = {}; el.querySelectorAll("[data-portal-f]").forEach(i => { fields[i.dataset.portalF] = i.value; });
          S.portalOk[n.id] = true; S.captiveOpen = false; render(); emit("portalAccepted", { net: n, fields }); msg("✅ Vous êtes connecté(e) au Wi-Fi : Internet fonctionne.", "good"); return;
        }
        case "cgu": return;
      }
    }
    function autoJoin() { const n = S.nets.find(x => S.auto[x.id] && !x.hidden?.()) || S.nets.find(x => x.id === S.prevConn); if (n && !S.connected) S.connected = n.id; }
    el.addEventListener("click", onClick);

    const ctl = {
      state: S, render, status, online, msg,
      get current() { return cur(); },
      hint(id, tool) { S.hint = id || null; S.hintTool = tool || null; render(); },
      addNet(n) { if (!S.nets.some(x => x.id === n.id)) S.nets.push(n); render(); },
      removeNet(id) { S.nets = S.nets.filter(n => n.id !== id); if (S.connected === id) S.connected = null; render(); },
      setPage(p) { S.page = p; render(); },
      destroy() { destroyed = true; timers.forEach(clearTimeout); el.removeEventListener("click", onClick); el.innerHTML = ""; }
    };
    render();
    return ctl;
  }

  /* =========================================================
     LE SMARTPHONE
     ========================================================= */
  function phone(el, opts = {}) {
    const S = {
      screen: opts.screen || "home", airplane: !!opts.airplane, wifiOn: opts.wifiOn ?? true, data: opts.data ?? true, cell: opts.cell ?? 3,
      connected: opts.connected || null, nets: opts.nets || [], ask: null, err: "", hotspot: false, hsName: opts.hsName || "Téléphone de Marie", hsKey: opts.hsKey || "tomate-pluie-42",
      usage: opts.usage || { used: 3.2, total: 5 }, page: opts.page || null, msg: null, gen: opts.gen || "4G"
    };
    const emit = (t, d) => { try { opts.onEvent?.(t, d, ctl); } catch (e) { console.error(e); } };
    let destroyed = false, timers = [];
    const later = (fn, ms) => { const t = setTimeout(() => { if (!destroyed) fn(); }, ms); timers.push(t); };
    const cur = () => S.nets.find(n => n.id === S.connected) || null;
    function status() {
      if (S.airplane && !(S.wifiOn && S.connected)) return "airplane";
      const n = S.wifiOn ? cur() : null;
      if (n) { if (!n.internet || (n.kind === "box" && opts.boxDown?.())) return S.data && !S.airplane && S.cell ? "data" : "nointernet"; return "wifi"; }
      if (S.data && !S.airplane && S.cell) return S.usage.used >= S.usage.total ? "slow" : "data";
      return "none";
    }
    const online = () => ["wifi", "data", "slow"].includes(status());
    function bar() {
      const n = S.wifiOn ? cur() : null, st = status();
      return `<div class="nk-sb"><span>${new Date().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}</span><span class="nk-sb-r">
        ${S.airplane ? plane : `${cellBars(S.cell)}${S.data && S.cell && st !== "wifi" ? `<b class="nk-gen">${S.gen}</b>` : ""}`}
        ${n && S.wifiOn ? signal(n.bars, { size: "1em" }) : ""}${S.hotspot ? `<span class="nk-hs" title="Partage de connexion">🔗</span>` : ""}<span class="nk-batt">72 %</span></span></div>`;
    }
    const row = (ico, lab, right, act, extra = "") => `<button type="button" class="nk-row ${S.hint === act ? "nk-hint" : ""}" data-np="${act}" ${extra}><span class="nk-row-i">${ico}</span><span class="nk-row-l">${lab}</span><span class="nk-row-r">${right}</span></button>`;
    const sw = on => `<span class="nk-sw ${on ? "on" : ""}" aria-hidden="true"><i></i></span>`;
    function screen() {
      const n = cur();
      switch (S.screen) {
        case "home": return `<div class="nk-home">${[["⚙️", "Réglages", "settings"], ["🌐", "Internet", "browser"], ["💬", "Messages", "sms"], ["📷", "Photos", "x"], ["🗺️", "Plans", "x"], ["▶️", "Vidéos", "video"]].map(([i, l, a]) => `<button type="button" class="nk-app ${S.hint === a ? "nk-hint" : ""}" data-np="app-${a}"><span>${i}</span><small>${l}</small></button>`).join("")}</div>`;
        case "settings": return `<div class="nk-scr"><div class="nk-h">Réglages</div>
          ${row("✈️", "Mode avion", sw(S.airplane), "airplane")}
          ${row(signal(3, { size: "1.1em" }), "Wi-Fi", `${S.wifiOn ? (n ? esc(n.name) : "Activé") : "Désactivé"} ›`, "wifi")}
          ${row("📶", "Données mobiles", sw(S.data), "data")}
          ${row("🔗", "Partage de connexion", `${S.hotspot ? "Activé" : "Non"} ›`, "hotspot")}
          ${row("📊", "Consommation des données", "›", "usage")}
          ${row("🔋", "Batterie", "72 %", "x")}</div>`;
        case "wifi": return `<div class="nk-scr"><div class="nk-h"><button type="button" data-np="back" aria-label="Retour">‹</button> Wi-Fi</div>
          ${row("", "<b>Wi-Fi</b>", sw(S.wifiOn), "wifiToggle")}
          ${S.wifiOn ? `<div class="nk-sub">${n ? "CONNECTÉ" : "RÉSEAUX DISPONIBLES"}</div>
            ${S.nets.filter(x => !x.hidden?.()).sort((a, b) => (b.id === S.connected) - (a.id === S.connected) || b.bars - a.bars).map(x => `<button type="button" class="nk-row ${x.id === S.connected ? "con" : ""} ${S.hint === x.id ? "nk-hint" : ""}" data-np="net" data-id="${esc(x.id)}"><span class="nk-row-i">${x.id === S.connected ? "✓" : ""}</span><span class="nk-row-l">${esc(x.name)}${x.id === S.connected && status() !== "wifi" && !x.internet ? `<small>Aucune connexion Internet</small>` : ""}</span><span class="nk-row-r">${x.secure ? "🔒" : ""}${signal(x.bars, { size: "1.1em" })}</span></button>`).join("") || `<div class="nk-empty">Recherche…</div>`}` : `<div class="nk-empty">Le Wi-Fi est désactivé.</div>`}</div>`;
        case "pw": { const x = S.nets.find(z => z.id === S.ask); return `<div class="nk-scr"><div class="nk-h"><button type="button" data-np="back" aria-label="Retour">‹</button> Mot de passe</div>
          <p class="nk-p">Saisissez le mot de passe de « <b>${esc(x.name)}</b> »</p>
          <div class="nk-pw ph"><input type="password" data-np-in="pw" autocomplete="off" spellcheck="false" autocapitalize="off" placeholder="Mot de passe"><button type="button" data-np="eye" aria-label="Afficher">👁</button></div>
          ${S.err ? `<div class="nk-err" role="alert">${S.err}</div>` : ""}${S.joining ? `<div class="nk-wait">Connexion…</div>` : `<button type="button" class="nk-big" data-np="join">Se connecter</button>`}</div>`; }
        case "hotspot": return `<div class="nk-scr"><div class="nk-h"><button type="button" data-np="back" aria-label="Retour">‹</button> Partage de connexion</div>
          ${row("", "<b>Partager la connexion</b>", sw(S.hotspot), "hsToggle")}
          <div class="nk-card"><div>Nom du réseau : <b>${esc(S.hsName)}</b></div><div>Mot de passe : <b class="mono">${esc(S.hsKey)}</b></div></div>
          <p class="nk-p small">Les autres appareils (votre ordinateur…) se connectent à ce réseau Wi-Fi. Ils utilisent alors <b>vos données mobiles</b>.</p></div>`;
        case "usage": { const p = Math.min(100, Math.round(100 * S.usage.used / S.usage.total)); return `<div class="nk-scr"><div class="nk-h"><button type="button" data-np="back" aria-label="Retour">‹</button> Consommation</div>
          <div class="nk-card"><div>Ce mois-ci : <b>${String(S.usage.used).replace(".", ",")} Go</b> sur ${S.usage.total} Go</div><div class="nk-gauge"><i style="width:${p}%;background:${p > 85 ? "#d13438" : p > 60 ? "#e0a100" : "#2f9d68"}"></i></div><small>Le compteur repart à zéro le 1er du mois.</small></div>
          <div class="nk-sub">PAR APPLICATION</div>${(S.usage.apps || [["▶️ Vidéos", 2.1], ["🗺️ Plans", 0.4], ["💬 Messages", 0.2], ["🌐 Internet", 0.5]]).map(([a, g]) => `<div class="nk-row static"><span class="nk-row-l">${a}</span><span class="nk-row-r">${String(g).replace(".", ",")} Go</span></div>`).join("")}</div>`; }
        case "browser": return `<div class="nk-scr br"><div class="nk-addr">${online() ? "🔒 " + esc(opts.url || "www.mediatheque-valbourg.fr") : ""}</div>${online() ? `<div class="nk-page sm">${S.page ? (typeof S.page === "function" ? S.page() : S.page) : "<h3>📚 Médiathèque</h3><p>La page s'affiche ✅</p>"}${status() === "slow" ? `<p class="nk-tip">🐢 Forfait épuisé : Internet est très lent.</p>` : ""}</div>` : `<div class="nk-page off sm"><div class="nk-dino">📵</div><h3>Pas de connexion Internet</h3><p class="nk-tip">${S.airplane ? "Le mode avion est activé." : !S.data && !cur() ? "Ni Wi-Fi, ni données mobiles." : "Vérifiez le Wi-Fi ou les données mobiles."}</p></div>`}<button type="button" class="nk-home-btn" data-np="home">⌂</button></div>`;
        case "sms": return `<div class="nk-scr"><div class="nk-h"><button type="button" data-np="home" aria-label="Retour">‹</button> Messages</div>${(opts.sms || []).map(m => `<div class="nk-sms"><b>${esc(m.from)}</b><p>${m.text}</p></div>`).join("") || `<div class="nk-empty">Aucun message.</div>`}</div>`;
        case "video": return `<div class="nk-scr br"><div class="nk-page sm">${online() ? `<div class="nk-dino">🎬</div><p>Une vidéo d'une heure en bonne qualité : environ <b>1 à 3 Go</b> de données.</p>` : `<div class="nk-dino">📵</div><p>Pas de connexion.</p>`}</div><button type="button" class="nk-home-btn" data-np="home">⌂</button></div>`;
      }
      return "";
    }
    function render() {
      if (destroyed) return;
      el.innerHTML = `<div class="nk-phone ${opts.big ? "big" : ""}"><div class="nk-notch"></div>${bar()}<div class="nk-screen">${screen()}</div>
        ${S.msg ? `<div class="nk-pmsg ${S.msg.kind}" role="status">${S.msg.html}</div>` : ""}
        ${S.screen !== "home" && S.screen !== "browser" && S.screen !== "video" ? `<button type="button" class="nk-home-btn" data-np="home" aria-label="Accueil">⌂</button>` : ""}</div>`;
      const i = el.querySelector('[data-np-in="pw"]');
      if (i) { i.focus(); i.addEventListener("keydown", e => { e.stopPropagation(); if (e.key === "Enter") join(); }); }
    }
    function msg(html, kind = "info", ms = 4000) { S.msg = { html, kind }; render(); if (ms) later(() => { S.msg = null; render(); }, ms); }
    function go(s) { S.prev = S.screen; S.screen = s; S.err = ""; render(); emit("screen", { screen: s }); }
    function join() {
      const x = S.nets.find(z => z.id === S.ask); const v = el.querySelector('[data-np-in="pw"]')?.value || "";
      if (!v) { S.err = "Tapez le mot de passe du Wi-Fi."; render(); return; }
      S.joining = true; render();
      later(() => {
        S.joining = false;
        if (v !== x.key) { S.err = "Mot de passe incorrect."; render(); emit("wrongKey", { net: x, key: v, caseOnly: v.toLowerCase() === x.key.toLowerCase() }); return; }
        S.connected = x.id; S.ask = null; S.screen = "wifi"; render(); emit("connect", { net: x, status: status() });
      }, opts.fast ? 150 : 800);
    }
    function onClick(e) {
      const b = e.target.closest("[data-np]"); if (!b || !el.contains(b)) return;
      const a = b.dataset.np;
      if (a.startsWith("app-")) { const s = a.slice(4); if (s === "x") return; go(s); return; }
      switch (a) {
        case "home": go("home"); return;
        case "back": go(S.screen === "pw" ? "wifi" : "settings"); return;
        case "airplane": S.airplane = !S.airplane; if (S.airplane) { S.wasWifi = S.wifiOn; S.wifiOn = false; S.connected = null; S.hotspot = false; } else { S.wifiOn = S.wasWifi ?? true; autoJoin(); } render(); emit("airplane", { on: S.airplane, status: status() }); return;
        case "wifi": go("wifi"); return;
        case "wifiToggle": S.wifiOn = !S.wifiOn; if (!S.wifiOn) S.connected = null; else autoJoin(); render(); emit("wifi", { on: S.wifiOn, status: status() }); return;
        case "data": S.data = !S.data; if (!S.data) S.hotspot = false; render(); emit("data", { on: S.data, status: status() }); return;
        case "hotspot": go("hotspot"); return;
        case "usage": go("usage"); return;
        case "hsToggle":
          if (!S.hotspot && (!S.data || S.airplane)) { msg("Pour partager la connexion, activez d'abord les <b>données mobiles</b> (et coupez le mode avion).", "warn"); emit("hotspotRefused", {}); return; }
          S.hotspot = !S.hotspot; render(); emit("hotspot", { on: S.hotspot, name: S.hsName, key: S.hsKey }); return;
        case "net": { const x = S.nets.find(z => z.id === b.dataset.id); if (x.id === S.connected) { msg(`Connecté à « ${esc(x.name)} ».`, "info", 2500); return; } if (x.secure) { S.ask = x.id; go("pw"); emit("askKey", { net: x }); } else { S.connected = x.id; render(); emit("connect", { net: x, status: status() }); } return; }
        case "eye": { const i = el.querySelector('[data-np-in="pw"]'); if (i) { i.type = i.type === "password" ? "text" : "password"; emit("eye", {}); } return; }
        case "join": join(); return;
      }
    }
    function autoJoin() { const x = S.nets.find(z => z.known); if (x && !S.connected) S.connected = x.id; }
    el.addEventListener("click", onClick);
    const ctl = {
      state: S, render, status, online, msg, go,
      get current() { return cur(); },
      hint(id) { S.hint = id || null; render(); },
      destroy() { destroyed = true; timers.forEach(clearTimeout); el.removeEventListener("click", onClick); el.innerHTML = ""; }
    };
    render();
    return ctl;
  }

  /* =========================================================
     LA BOX
     ========================================================= */
  function box(el, opts = {}) {
    const S = { state: opts.state || "ok" /* ok | fail | restarting | off */, flipped: !!opts.flipped, ssid: opts.ssid || "Livebox-7A3F", key: opts.key || "Kp7mVx2eRt9q", brand: opts.brand || "Ma box", wait: opts.wait ?? 6 };
    const emit = (t, d) => { try { opts.onEvent?.(t, d, ctl); } catch (e) { console.error(e); } };
    let destroyed = false, timers = [];
    const lights = () => {
      const s = S.state;
      const L = (lab, c, blink) => `<div class="nk-led"><i class="${c} ${blink ? "blink" : ""}"></i><small>${lab}</small></div>`;
      if (s === "off") return L("⏻", "", false) + L("@", "", false) + L("Wi-Fi", "", false);
      if (s === "restarting") return L("⏻", "orange", true) + L("@", "orange", true) + L("Wi-Fi", "", false);
      if (s === "fail") return L("⏻", "green") + L("@", "red", true) + L("Wi-Fi", "green");
      return L("⏻", "green") + L("@", "green") + L("Wi-Fi", "green");
    };
    function render() {
      if (destroyed) return;
      el.innerHTML = `<div class="nk-boxw ${opts.big ? "big" : ""}">
        ${S.flipped
          ? `<div class="nk-box under"><div class="nk-label"><div class="nk-label-h">${esc(S.brand)} · étiquette</div>
              <div>Nom du réseau Wi-Fi (SSID) :<br><b class="mono ${opts.hint === "ssid" ? "nk-hint" : ""}">${esc(S.ssid)}</b></div>
              <div>Clé de sécurité (mot de passe Wi-Fi) :<br><b class="mono big ${opts.hint === "key" ? "nk-hint" : ""}">${esc(S.key)}</b></div>
              <div class="nk-qr" aria-hidden="true">${Array.from({ length: 49 }, (_, i) => `<i class="${(i * 7 + (i % 5) * 3) % 3 ? "" : "b"}"></i>`).join("")}</div><small>N° de série : ABX-2207-55031</small></div></div>`
          : `<div class="nk-box"><div class="nk-box-brand">${esc(S.brand)}</div><div class="nk-leds">${lights()}</div>${S.state === "restarting" ? `<div class="nk-box-wait">Redémarrage… <b>${S.left}</b> s</div>` : ""}</div>`}
        <div class="nk-box-btns">
          <button type="button" data-nb="flip">${S.flipped ? "↩ Voir l'avant de la box" : "🔄 Retourner la box (étiquette)"}</button>
          ${opts.canRestart && !S.flipped ? `<button type="button" data-nb="restart" ${S.state === "restarting" ? "disabled" : ""}>🔌 Débrancher, attendre, rebrancher</button>` : ""}
        </div></div>`;
    }
    function restart() {
      S.state = "restarting"; S.left = S.wait; render(); emit("restart", {});
      const tick = () => { if (destroyed) return; S.left--; if (S.left <= 0) { S.state = opts.fixOnRestart === false ? "fail" : "ok"; render(); emit("restarted", { state: S.state }); return; } render(); timers.push(setTimeout(tick, 1000)); };
      timers.push(setTimeout(tick, 1000));
    }
    function onClick(e) {
      const b = e.target.closest("[data-nb]"); if (!b || !el.contains(b)) return;
      if (b.dataset.nb === "flip") { S.flipped = !S.flipped; render(); emit("flip", { under: S.flipped }); }
      if (b.dataset.nb === "restart") restart();
    }
    el.addEventListener("click", onClick);
    const ctl = { state: S, render, restart, get down() { return S.state !== "ok"; }, set(state) { S.state = state; render(); }, destroy() { destroyed = true; timers.forEach(clearTimeout); el.removeEventListener("click", onClick); el.innerHTML = ""; } };
    render();
    return ctl;
  }

  AN.net = { pc, phone, box, signal, globe, cellBars, net };
})(window.AN);

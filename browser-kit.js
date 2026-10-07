/* =========================================================
   Navigateur simulé, réutilisé par les missions du chapitre « Navigateurs ».
   AN.browser.client(container, options) -> contrôleur

   options :
     pages     : { "www.site.fr/chemin": { title, icon, secure, html | html(info, ctl),
                   fullscreen, cookies, popup } }
     index     : résultats possibles du moteur Cherchetout
                 [{ url, title, desc, keywords, sponsored, site, icon }]
     start     : adresse(s) ouvertes au départ (chaîne ou tableau = un onglet chacune)
     favorites : [{ url, label }]
     features  : { tabs, favorites, newTab } (tout activé par défaut)
     onEvent(type, data, ctl) : prévient la mission (navigate, search, back,
                 forward, reload, home, tabNew, tabSwitch, tabClose, allClosed,
                 favAdd, favOpen, link, action, escape, cookie, popupClose,
                 lock, hover, addressEdit). Renvoyer false sur « link » annule.

   Dans le HTML d'une page :
     <a data-href="www.site.fr/page">…</a>          lien (survol = adresse en bas)
     <button data-bk-act="nom">…</button>            action prévenue à la mission
     <form data-bk-search><input name="q">…</form>   recherche Cherchetout
   ========================================================= */
(function (AN) {
  "use strict";
  const { esc } = AN.util;

  const ENGINE = "www.cherchetout.fr";
  const RESULTS = ENGINE + "/recherche";
  const fold = s => String(s || "").normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();

  /** "https://WWW.Site.fr/a/" -> "www.site.fr/a" (on garde la casse de la recherche). */
  function normalize(u) {
    let t = String(u || "").trim().replace(/^https?:\/\//i, "").replace(/\/+$/, "");
    const i = t.indexOf("/");
    const host = (i < 0 ? t : t.slice(0, i)).toLowerCase();
    return host + (i < 0 ? "" : t.slice(i));
  }
  const hostOf = u => normalize(u).split(/[/?#]/)[0];
  /** Le « vrai nom » d'un site : ce qui est juste avant le premier « / ». */
  function realName(u) {
    const parts = hostOf(u).split(".");
    const n = /\.gouv\.fr$|\.co\.uk$/.test(hostOf(u)) ? 3 : 2;
    return parts.slice(-n).join(".");
  }
  const looksLikeAddress = t => !/\s/.test(t) && /^[^.\s]+(\.[^.\s/]+)*\.[a-z]{2,}(\/.*)?$/i.test(t.replace(/^https?:\/\//i, ""));
  const queryOf = url => { const m = /[?&]q=([^&]*)/.exec(url); return m ? decodeURIComponent(m[1].replace(/\+/g, " ")) : ""; };

  /** Adresse affichée avec le vrai nom du site en gras. */
  function prettyUrl(url, secure) {
    const n = normalize(url), host = hostOf(n), rest = n.slice(host.length), real = realName(n);
    const before = host.slice(0, host.length - real.length);
    return `<span class="bk-scheme">${secure ? "https://" : "http://"}</span>${esc(before)}<b class="bk-real">${esc(real)}</b><span class="bk-path">${esc(rest)}</span>`;
  }

  /* ---------------- moteur de recherche « Cherchetout » ---------------- */
  const LOGO = `<span class="ct-logo"><b style="color:#3979b7">Cher</b><b style="color:#d95f56">che</b><b style="color:#2f9d68">tout</b></span>`;
  const STOP = ["les", "des", "une", "pour", "est", "que", "qui", "dans", "sur", "avec", "comment", "faire", "quel", "quelle", "quels", "quelles", "mon", "mes", "son", "ses", "par", "pas", "www"];
  /** Nombre de mots de la recherche présents dans le résultat ; « strong » ignore les mots trop vagues (la ville…). */
  function score(entry, q, weak = []) {
    const words = fold(q).split(/[^a-z0-9]+/).filter(w => (w.length > 2 || /\d/.test(w)) && !STOP.includes(w));
    const hay = fold(`${entry.keywords || ""} ${entry.title} ${entry.desc || ""} ${entry.url}`);
    const hits = words.filter(w => hay.includes(w));
    return { s: hits.length, strong: hits.filter(w => !weak.includes(w)).length };
  }
  function results(index, q, weak) {
    const scored = (index || []).map(e => ({ e, ...score(e, q, weak) })).filter(x => x.s > 0);
    const ads = scored.filter(x => x.e.sponsored && x.strong > 0).sort((a, b) => b.s - a.s).slice(0, 2).map(x => x.e);
    const org = scored.filter(x => !x.e.sponsored).sort((a, b) => b.s - a.s || (a.e.rank || 9) - (b.e.rank || 9)).map(x => x.e);
    return { ads, org };
  }
  const resultHTML = r => `<div class="ct-res ${r.sponsored ? "ad" : ""}">
      ${r.sponsored ? `<div class="ct-spon">Sponsorisé</div>` : ""}
      <div class="ct-site"><span class="ct-fav" aria-hidden="true">${r.icon || "🌐"}</span><span><b>${esc(r.site || realName(r.url))}</b><small>${r.secure === false ? "http://" : "https://"}${esc(normalize(r.url).replace(/\//g, " › "))}</small></span></div>
      <a href="#" class="ct-title" data-href="${esc(r.url)}">${r.title}</a>
      <p>${r.desc || ""}</p></div>`;
  function enginePages(opts) {
    return {
      [ENGINE]: { title: "Cherchetout", icon: "🔎", html: () => `<div class="ct-home">${LOGO}
        <form data-bk-search class="ct-form big"><input name="q" aria-label="Rechercher sur Cherchetout" placeholder="Que cherchez-vous ?" autocomplete="off"><button type="submit">🔍 Rechercher</button></form>
        <p class="ct-tip">Tapez quelques <b>mots-clés</b>, puis appuyez sur <kbd>Entrée</kbd>.</p></div>` },
      [RESULTS]: { title: "Résultats", icon: "🔎", html: info => {
        const q = info.q, { ads, org } = results(opts.index, q, opts.weakWords || []);
        const n = ads.length + org.length;
        return `<div class="ct-top">${LOGO}<form data-bk-search class="ct-form"><input name="q" value="${esc(q)}" aria-label="Rechercher" autocomplete="off"><button type="submit">🔍</button></form></div>
          <div class="ct-results">${n ? `<p class="ct-count">Environ ${(n * 137000).toLocaleString("fr-FR")} résultats</p>${ads.map(resultHTML).join("")}${org.map(resultHTML).join("")}`
            : `<div class="ct-none"><p>Aucun résultat pour « <b>${esc(q)}</b> ».</p><ul><li>Vérifiez l'orthographe des mots.</li><li>Essayez avec <b>moins de mots</b>, ou des mots plus simples.</li></ul></div>`}</div>`;
      } }
    };
  }
  const notFound = url => `<div class="bk-error"><div class="bk-error-icon" aria-hidden="true">🦖</div><h2>Ce site est inaccessible</h2>
      <p>Impossible de trouver l'adresse <b>${esc(normalize(url))}</b>.</p>
      <ul><li>Vérifiez l'orthographe : une seule lettre fausse, et le site est introuvable.</li><li>Ou faites une recherche :</li></ul>
      <p><a href="#" data-href="${esc(RESULTS + "?q=" + encodeURIComponent(normalize(url)))}">🔎 Rechercher « ${esc(normalize(url))} » sur Cherchetout</a></p></div>`;

  /* ======================================================== */
  function client(container, opts = {}) {
    const F = Object.assign({ tabs: true, favorites: true, newTab: true }, opts.features || {});
    const pages = Object.assign(enginePages(opts), {});
    Object.entries(opts.pages || {}).forEach(([k, v]) => { pages[normalize(k)] = v; });
    let tid = 0;
    const mkTab = url => ({ id: "t" + (++tid), hist: [normalize(url || ENGINE)], pos: 0, flags: {}, reloads: 0 });
    const st = {
      tabs: [].concat(opts.start || ENGINE).map(mkTab), active: 0,
      favorites: (opts.favorites || []).map(f => ({ ...f, url: normalize(f.url) })),
      editing: false, lock: false, flash: null, hover: "", closed: false
    };
    const emit = (type, data) => { try { return opts.onEvent?.(type, data, ctl); } catch (e) { console.error(e); } };
    const tab = () => st.tabs[st.active];
    const urlOf = t => t.hist[t.pos];
    function pageFor(url) {
      const n = normalize(url);
      if (pages[n]) return pages[n];
      const base = n.split("?")[0];
      if (pages[base]) return pages[base];
      return null;
    }
    const isSecure = url => { const p = pageFor(url); return p ? p.secure !== false : true; };
    const info = t => ({ url: urlOf(t), q: queryOf(urlOf(t)), reloads: t.reloads, flags: t.flags, ctl });
    const titleOf = t => { const p = pageFor(urlOf(t)); if (!p) return "Site inaccessible"; return normalize(urlOf(t)).startsWith(RESULTS) ? `${queryOf(urlOf(t))} - Cherchetout` : p.title; };

    /* ---------------- affichage ---------------- */
    function tabsHTML() {
      if (!F.tabs) return "";
      return `<div class="bk-tabs" role="tablist">${st.tabs.map((t, i) => { const p = pageFor(urlOf(t)); return `<div class="bk-tab ${i === st.active ? "on" : ""}" role="tab" aria-selected="${i === st.active}">
          <button type="button" class="bk-tab-main" data-bk="tab" data-i="${i}" title="${esc(titleOf(t))}"><span aria-hidden="true">${p?.icon || "⚠️"}</span><span class="bk-tab-t">${esc(titleOf(t))}</span></button>
          <button type="button" class="bk-tab-x" data-bk="close" data-i="${i}" aria-label="Fermer l'onglet ${esc(titleOf(t))}" title="Fermer l'onglet">✕</button></div>`; }).join("")}
        ${F.newTab ? `<button type="button" class="bk-tab-new" data-bk="newTab" aria-label="Nouvel onglet" title="Nouvel onglet">＋</button>` : ""}</div>`;
    }
    function barHTML() {
      const t = tab(), url = urlOf(t), sec = isSecure(url);
      const fav = st.favorites.some(f => f.url === normalize(url));
      const addr = st.editing
        ? `<input class="bk-addr-input" data-bkf="addr" value="${esc(st.editing === true ? (sec ? "https://" : "http://") + normalize(url) : "")}" aria-label="Barre d'adresse" autocomplete="off" spellcheck="false">`
        : `<button type="button" class="bk-addr-view" data-bk="edit" aria-label="Barre d'adresse : ${esc(normalize(url))}. Cliquez pour taper une adresse.">${prettyUrl(url, sec)}</button>`;
      return `<div class="bk-bar">
        <button type="button" class="bk-nav" data-bk="back" ${t.pos > 0 ? "" : "disabled"} aria-label="Page précédente" title="Page précédente">←</button>
        <button type="button" class="bk-nav" data-bk="forward" ${t.pos < t.hist.length - 1 ? "" : "disabled"} aria-label="Page suivante" title="Page suivante">→</button>
        <button type="button" class="bk-nav" data-bk="reload" aria-label="Actualiser la page" title="Actualiser">⟳</button>
        <button type="button" class="bk-nav" data-bk="home" aria-label="Page d'accueil" title="Accueil">🏠</button>
        <div class="bk-addr ${sec ? "" : "insecure"}">
          <button type="button" class="bk-lock" data-bk="lock" aria-label="${sec ? "Connexion sécurisée" : "Non sécurisé"}">${sec ? "🔒" : "⚠️ <span>Non sécurisé</span>"}</button>
          ${addr}
          ${(opts.tools || []).map(t => `<button type="button" class="bk-star bk-tool" data-bk-tool="${t.id}" title="${esc(t.label)}" aria-label="${esc(t.label)}">${t.icon}</button>`).join("")}
          ${F.favorites ? `<button type="button" class="bk-star ${fav ? "on" : ""}" data-bk="star" aria-label="${fav ? "Retirer des favoris" : "Ajouter aux favoris"}" title="${fav ? "Dans vos favoris" : "Ajouter aux favoris"}">${fav ? "★" : "☆"}</button>` : ""}
        </div></div>
        ${st.lock ? `<div class="bk-lockinfo" role="dialog">${sec
          ? `<b>🔒 Connexion chiffrée</b><p>Ce que vous tapez voyage <b>sous enveloppe fermée</b> jusqu'au site.</p><p class="warn">⚠ Le cadenas ne dit <b>pas</b> si le site est honnête ! Vérifiez son vrai nom : <b>${esc(realName(url))}</b></p>`
          : `<b>⚠️ Connexion non sécurisée</b><p>Ce que vous tapez voyage <b>en carte postale</b> : lisible en chemin.</p><p class="warn">Ne tapez jamais ici de mot de passe ni de numéro de carte bancaire.</p>`}
          <button type="button" data-bk="lock">Fermer</button></div>` : ""}
        ${F.favorites ? `<div class="bk-favs" aria-label="Barre de favoris">${st.favorites.length ? st.favorites.map(f => `<button type="button" data-bk="fav" data-url="${esc(f.url)}">${pageFor(f.url)?.icon || "⭐"} ${esc(f.label || pageFor(f.url)?.title || f.url)}</button>`).join("") : `<span class="bk-favs-empty">Barre de favoris : cliquez sur ☆ pour y garder un site.</span>`}</div>` : ""}`;
    }
    function viewHTML() {
      const t = tab(), url = urlOf(t), p = pageFor(url);
      if (!p) return `<div class="bk-page">${notFound(url)}</div>`;
      const body = typeof p.html === "function" ? p.html(info(t), ctl) : p.html || "";
      const cookie = p.cookies && !t.flags.cookie ? (t.flags.cookieCustom
        ? `<div class="bk-cookies custom" role="dialog" aria-label="Réglages des cookies"><b>⚙️ Personnaliser</b>
            <label><input type="checkbox" checked disabled> Cookies nécessaires (toujours actifs)</label>
            <label><input type="checkbox" data-bkf="ck1"> Mesure d'audience</label><label><input type="checkbox" data-bkf="ck2"> Publicité personnalisée</label>
            <div><button type="button" data-bk="cookie" data-v="custom">Enregistrer mes choix</button></div></div>`
        : `<div class="bk-cookies" role="dialog" aria-label="Cookies"><p>🍪 <b>Ce site utilise des cookies.</b> Ils servent à mesurer l'audience et à vous montrer des publicités adaptées.</p>
            <div><button type="button" data-bk="cookie" data-v="accept">Tout accepter</button><button type="button" data-bk="cookie" data-v="refuse">Tout refuser</button><button type="button" class="link" data-bk="cookieCustom">Personnaliser</button></div></div>`) : "";
      const popup = p.popup && !t.flags.popup ? `<div class="bk-popup-back"><div class="bk-popup" role="dialog"><button type="button" class="bk-popup-x" data-bk="popupClose" aria-label="Fermer">✕</button>${typeof p.popup === "function" ? p.popup(info(t)) : p.popup}</div></div>` : "";
      return `<div class="bk-page ${p.cls || ""}">${body}</div>${popup}${cookie}`;
    }
    function render() {
      if (st.closed) {
        container.innerHTML = `<div class="bk bk-closed ${opts.big ? "bk-big" : ""}"><div class="bk-closed-in"><div aria-hidden="true">🧭</div><p>Le navigateur est fermé.</p><button type="button" data-bk="reopen">Rouvrir le navigateur</button></div>${flashHTML()}</div>`;
        return;
      }
      const p = pageFor(urlOf(tab()));
      const fs = p?.fullscreen && !tab().flags.fsExit;
      container.innerHTML = `<div class="bk ${opts.big ? "bk-big" : ""} ${fs ? "bk-fs" : ""}" tabindex="-1">
        ${fs ? `<div class="bk-fs-tip">Appuyez sur <kbd>Échap</kbd> pour quitter le mode plein écran</div>` : `${tabsHTML()}${barHTML()}`}
        <div class="bk-view">${viewHTML()}</div>
        ${fs ? "" : `<div class="bk-status" aria-live="polite">${st.hover ? esc(st.hover) : "&nbsp;"}</div>`}
        ${flashHTML()}${bubbleHTML()}</div>`;
      if (fs) container.querySelector(".bk")?.focus({ preventScroll: true });
      if (st.editing) { const i = container.querySelector(".bk-addr-input"); if (i) { i.focus(); i.select(); } }
      bindHover();
    }
    /* bulle sous la barre d'adresse (enregistrer un mot de passe, remplissage automatique…) */
    const bubbleHTML = () => st.bubble ? `<div class="bk-bubble" role="dialog">${st.bubble}</div>` : "";
    function bubble(html) {
      st.bubble = html || null;
      container.querySelector(".bk-bubble")?.remove();
      if (html) container.querySelector(".bk")?.insertAdjacentHTML("beforeend", bubbleHTML());
    }
    const flashHTML = () => st.flash ? `<div class="mk-flash bk-flash ${st.flash.kind}" role="status">${st.flash.html}</div>` : "";
    function bindHover() {
      container.querySelectorAll(".bk-view [data-href]").forEach(a => {
        const show = () => { const u = a.dataset.href; st.hover = (isSecure(u) ? "https://" : "http://") + normalize(u); const sb = container.querySelector(".bk-status"); if (sb) sb.textContent = st.hover; emit("hover", { url: normalize(u), el: a }); };
        const hide = () => { st.hover = ""; const sb = container.querySelector(".bk-status"); if (sb) sb.innerHTML = "&nbsp;"; };
        a.addEventListener("mouseenter", show); a.addEventListener("focus", show);
        a.addEventListener("mouseleave", hide); a.addEventListener("blur", hide);
      });
    }

    /* ---------------- navigation ---------------- */
    function go(url, from = "link") {
      const t = tab(), n = normalize(url);
      t.hist = t.hist.slice(0, t.pos + 1); t.hist.push(n); t.pos = t.hist.length - 1;
      t.flags = {}; t.reloads = 0; st.editing = false; st.lock = false; st.hover = ""; st.bubble = null;
      render();
      emit("navigate", { url: n, from, found: !!pageFor(n), page: pageFor(n), q: queryOf(n) });
      if (n.startsWith(RESULTS)) emit("search", { q: queryOf(n), from });
    }
    function search(q, from) { go(`${RESULTS}?q=${encodeURIComponent(q.trim())}`, from); }
    function fromAddress(raw) {
      const t = String(raw || "").trim();
      if (!t) { st.editing = false; render(); return; }
      emit("typed", { text: t });
      if (looksLikeAddress(t)) go(t, "address"); else search(t, "address");
    }
    function newTab(url = ENGINE, from = "newTab") {
      st.tabs.push(mkTab(url)); st.active = st.tabs.length - 1; st.editing = !opts.noAutoEdit && url === ENGINE ? "blank" : false; st.lock = false;
      render(); emit("tabNew", { url: normalize(url), from });
    }

    const handlers = {
      back: () => { const t = tab(); if (t.pos > 0) { t.pos--; t.flags = {}; render(); emit("back", { url: urlOf(t) }); } },
      forward: () => { const t = tab(); if (t.pos < t.hist.length - 1) { t.pos++; t.flags = {}; render(); emit("forward", { url: urlOf(t) }); } },
      reload: () => {
        const t = tab(); t.reloads++; t.flags = {}; render();
        container.querySelector(".bk-view")?.classList.add("bk-reloading");
        emit("reload", { url: urlOf(t), reloads: t.reloads });
      },
      home: () => { go(opts.home || ENGINE, "home"); emit("home"); },
      edit: () => { st.editing = true; st.lock = false; render(); emit("addressEdit", { url: urlOf(tab()) }); },
      lock: () => { st.lock = !st.lock; st.editing = false; render(); if (st.lock) emit("lock", { url: urlOf(tab()), secure: isSecure(urlOf(tab())) }); },
      star: () => {
        const n = normalize(urlOf(tab())), i = st.favorites.findIndex(f => f.url === n);
        if (i >= 0) { st.favorites.splice(i, 1); render(); emit("favRemove", { url: n }); }
        else { st.favorites.push({ url: n, label: pageFor(n)?.short || pageFor(n)?.title || n }); render(); flash("⭐ Ajouté à la barre de favoris.", "good", 2500); emit("favAdd", { url: n }); }
      },
      fav: el => { emit("favOpen", { url: el.dataset.url }); go(el.dataset.url, "favorite"); },
      tab: el => { const i = Number(el.dataset.i); if (i === st.active) return; st.active = i; st.editing = false; st.lock = false; render(); emit("tabSwitch", { url: urlOf(tab()), index: i }); },
      close: el => {
        const i = Number(el.dataset.i), [t] = st.tabs.splice(i, 1);
        st.editing = false; st.lock = false;
        if (!st.tabs.length) { st.closed = true; render(); emit("tabClose", { url: urlOf(t), last: true }); emit("allClosed"); return; }
        if (i < st.active) st.active--;
        else if (i === st.active) st.active = Math.min(i, st.tabs.length - 1);
        render(); emit("tabClose", { url: urlOf(t), last: false });
      },
      newTab: () => newTab(),
      reopen: () => { st.closed = false; st.tabs = [mkTab(opts.home || ENGINE)]; st.active = 0; render(); emit("reopen"); },
      cookie: el => {
        const t = tab(), v = el.dataset.v;
        const extra = v === "custom" ? { ck1: !!container.querySelector('[data-bkf="ck1"]')?.checked, ck2: !!container.querySelector('[data-bkf="ck2"]')?.checked } : {};
        t.flags.cookie = v; render(); emit("cookie", { choice: v, ...extra });
      },
      cookieCustom: () => { tab().flags.cookieCustom = true; render(); emit("cookieCustom"); },
      popupClose: () => { tab().flags.popup = true; render(); emit("popupClose", { url: urlOf(tab()) }); }
    };

    let flashTimer = null;
    function flash(html, kind = "info", ms = 7000) {
      st.flash = { html, kind }; clearTimeout(flashTimer);
      let el = container.querySelector(".bk-flash");
      if (!el) { el = document.createElement("div"); el.setAttribute("role", "status"); container.querySelector(".bk")?.appendChild(el); }
      el.className = `mk-flash bk-flash ${kind}`; el.innerHTML = html;
      if (ms) flashTimer = setTimeout(() => { st.flash = null; container.querySelector(".bk-flash")?.remove(); }, ms);
    }

    const onClick = e => {
      const bb = e.target.closest("[data-bk-bubble]");
      if (bb && container.contains(bb)) { e.preventDefault(); emit("bubble", { name: bb.dataset.bkBubble, el: bb }); return; }
      const link = e.target.closest(".bk-view [data-href]");
      if (link && container.contains(link)) {
        e.preventDefault();
        const url = link.dataset.href;
        if (emit("link", { url: normalize(url), el: link }) === false) return;
        if (link.hasAttribute("data-newtab")) newTab(url, "link"); else go(url, "link");
        return;
      }
      const act = e.target.closest(".bk-view [data-bk-act]");
      if (act && container.contains(act)) { e.preventDefault(); emit("action", { name: act.dataset.bkAct, el: act, url: urlOf(tab()) }); return; }
      const tl = e.target.closest("[data-bk-tool]");
      if (tl && container.contains(tl)) { emit("tool", { id: tl.dataset.bkTool, el: tl }); return; }
      const b = e.target.closest("[data-bk]");
      if (b && container.contains(b)) { handlers[b.dataset.bk]?.(b, e); return; }
      if (st.lock && !e.target.closest(".bk-lockinfo")) { st.lock = false; render(); }
    };
    const onSubmit = e => {
      const f = e.target.closest("form[data-bk-search]");
      if (!f) return;
      e.preventDefault();
      const q = f.querySelector('[name="q"]')?.value || "";
      if (q.trim()) search(q, "engine");
    };
    const onKey = e => {
      if (e.target.dataset?.bkf === "addr") {
        if (e.key === "Enter") { e.preventDefault(); fromAddress(e.target.value); }
        else if (e.key === "Escape") { st.editing = false; render(); }
      }
    };
    const onFocusOut = e => {
      if (e.target.dataset?.bkf !== "addr") return;
      setTimeout(() => { if (st.editing && !container.contains(document.activeElement)) { st.editing = false; render(); } }, 150);
    };
    // Échap : écouté sur tout le document (le plein écran capte tout l'écran)
    const onDocKey = e => {
      if (e.key !== "Escape" || !container.isConnected || st.closed) return;
      const p = pageFor(urlOf(tab()));
      if (p?.fullscreen && !tab().flags.fsExit) { e.preventDefault(); tab().flags.fsExit = true; render(); emit("escape", { fullscreen: true }); }
    };
    container.addEventListener("click", onClick);
    container.addEventListener("submit", onSubmit);
    container.addEventListener("keydown", onKey);
    container.addEventListener("focusout", onFocusOut);
    document.addEventListener("keydown", onDocKey);

    const ctl = {
      st, render, flash, go, search, newTab, fromAddress,
      get tab() { return tab(); },
      get url() { return st.closed ? null : urlOf(tab()); },
      get page() { return st.closed ? null : pageFor(urlOf(tab())); },
      get tabs() { return st.tabs.map(urlOf); },
      pageFor, isSecure,
      addPages(more) { Object.entries(more || {}).forEach(([k, v]) => { pages[normalize(k)] = v; }); },
      exitFullscreen() { tab().flags.fsExit = true; render(); },
      bubble,
      /** Relit les champs d'une page (les valeurs tapées ne sont jamais envoyées nulle part). */
      fields() { const o = {}; container.querySelectorAll(".bk-view [name]").forEach(i => { o[i.name] = i.type === "checkbox" ? i.checked : i.value; }); return o; },
      press(name) { handlers[name]?.(container.querySelector(`[data-bk="${name}"]`) || { dataset: {} }); },
      destroy() {
        container.removeEventListener("click", onClick); container.removeEventListener("submit", onSubmit);
        container.removeEventListener("keydown", onKey); container.removeEventListener("focusout", onFocusOut);
        document.removeEventListener("keydown", onDocKey); clearTimeout(flashTimer);
      }
    };
    render();
    return ctl;
  }

  AN.browser = { client, normalize, realName, hostOf, prettyUrl, looksLikeAddress, ENGINE, RESULTS, LOGO, resultHTML };
})(window.AN);

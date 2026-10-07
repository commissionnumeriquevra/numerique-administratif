/* =========================================================
   Kit « Périphériques »
   - AN.per.keyboard(el, opts)  : clavier AZERTY dessiné ; les touches
                                  s'allument quand on appuie sur le vrai clavier.
   - AN.per.printDialog(el, o)  : fenêtre « Imprimer » (comme Chrome / Edge).
   - AN.per.printer(el, o)      : l'imprimante (voyants, papier, bourrage)
                                  + la file d'attente de Windows.
   - AN.per.display(el, o)      : Paramètres › Affichage (luminosité, taille).
   Rien n'est imprimé ni modifié sur le vrai ordinateur.
   ========================================================= */
(function (AN) {
  "use strict";
  const { esc } = AN.util;

  /* =========================================================
     LE CLAVIER AZERTY
     [code, normal, maj, altgr, largeur]
     ========================================================= */
  const ROWS = [
    [["Backquote", "²"], ["Digit1", "&", "1"], ["Digit2", "é", "2", "~"], ["Digit3", "\"", "3", "#"], ["Digit4", "'", "4", "{"], ["Digit5", "(", "5", "["], ["Digit6", "-", "6", "|"], ["Digit7", "è", "7", "`"], ["Digit8", "_", "8", "\\"], ["Digit9", "ç", "9", "^"], ["Digit0", "à", "0", "@"], ["Minus", ")", "°", "]"], ["Equal", "=", "+", "}"], ["Backspace", "⌫ Effacer", "", "", 2]],
    [["Tab", "↹", "", "", 1.5], ["KeyQ", "a", "A"], ["KeyW", "z", "Z"], ["KeyE", "e", "E", "€"], ["KeyR", "r", "R"], ["KeyT", "t", "T"], ["KeyY", "y", "Y"], ["KeyU", "u", "U"], ["KeyI", "i", "I"], ["KeyO", "o", "O"], ["KeyP", "p", "P"], ["BracketLeft", "^", "¨"], ["BracketRight", "$", "£", "¤"], ["Enter", "↵ Entrée", "", "", 1.5]],
    [["CapsLock", "⇩ Verr. Maj", "", "", 1.8], ["KeyA", "q", "Q"], ["KeyS", "s", "S"], ["KeyD", "d", "D"], ["KeyF", "f", "F"], ["KeyG", "g", "G"], ["KeyH", "h", "H"], ["KeyJ", "j", "J"], ["KeyK", "k", "K"], ["KeyL", "l", "L"], ["Semicolon", "m", "M"], ["Quote", "ù", "%"], ["Backslash", "*", "µ"], ["Enter2", "", "", "", 1.2]],
    [["ShiftLeft", "⇧ Maj", "", "", 1.3], ["IntlBackslash", "<", ">"], ["KeyZ", "w", "W"], ["KeyX", "x", "X"], ["KeyC", "c", "C"], ["KeyV", "v", "V"], ["KeyB", "b", "B"], ["KeyN", "n", "N"], ["KeyM", ",", "?"], ["Comma", ";", "."], ["Period", ":", "/"], ["Slash", "!", "§"], ["ShiftRight", "⇧ Maj", "", "", 2.7]],
    [["ControlLeft", "Ctrl", "", "", 1.5], ["MetaLeft", "⊞", "", "", 1.2], ["AltLeft", "Alt", "", "", 1.2], ["Space", "Espace", "", "", 6.3], ["AltRight", "Alt Gr", "", "", 1.4], ["ControlRight", "Ctrl", "", "", 1.5], ["ArrowLeft", "←"], ["ArrowRight", "→"]]
  ];
  const isLetter = n => /^[a-z]$/.test(n);
  function keyboard(el, opts = {}) {
    const S = { down: new Set(), caps: false, hint: new Set(opts.hint || []) };
    const keyHTML = ([code, n, m = "", ag = "", w = 1]) => {
      const cls = [S.down.has(code) || (code === "Enter2" && S.down.has("Enter")) ? "down" : "", S.hint.has(code) || (code === "Enter2" && S.hint.has("Enter")) ? "hint" : "", code === "CapsLock" && S.caps ? "lock" : "", isLetter(n) ? "letter" : "", n.length > 2 ? "word" : ""].join(" ");
      const inner = isLetter(n) ? `<b>${m}</b>${ag ? `<i>${ag}</i>` : ""}` : n.length > 2 ? `<b>${n}</b>` : `<s>${esc(m)}</s><b>${esc(n)}</b>${ag ? `<i>${esc(ag)}</i>` : ""}`;
      return `<span class="pk-key ${cls}" style="--w:${w}" data-code="${code}">${code === "Enter2" ? "" : inner}</span>`;
    };
    function render() { el.innerHTML = `<div class="pk-kb ${opts.big ? "big" : ""}" aria-hidden="true">${ROWS.map(r => `<div class="pk-row">${r.map(keyHTML).join("")}</div>`).join("")}</div>`; }
    const kd = e => { S.down.add(e.code); S.caps = e.getModifierState?.("CapsLock") || false; render(); opts.onKey?.(e, S); };
    const ku = e => { S.down.delete(e.code); S.caps = e.getModifierState?.("CapsLock") || false; render(); };
    const blur = () => { S.down.clear(); render(); };
    const tgt = opts.target || document;
    tgt.addEventListener("keydown", kd, true); tgt.addEventListener("keyup", ku, true); window.addEventListener("blur", blur);
    render();
    return { state: S, render, hint(codes) { S.hint = new Set(codes || []); render(); }, destroy() { tgt.removeEventListener("keydown", kd, true); tgt.removeEventListener("keyup", ku, true); window.removeEventListener("blur", blur); el.innerHTML = ""; } };
  }

  /* =========================================================
     LA FENÊTRE « IMPRIMER »
     ========================================================= */
  function printDialog(el, opts = {}) {
    const doc = opts.doc || { title: "Attestation", pages: 3, color: true };
    const printers = opts.printers || ["HP LaserJet - Accueil médiathèque", "Enregistrer au format PDF", "Microsoft Print to PDF"];
    const S = { dest: opts.dest ?? printers[0], pages: "all", range: "", copies: 1, color: "color", duplex: false, more: false, err: "" };
    const emit = (t, d) => { try { opts.onEvent?.(t, d, ctl); } catch (e) { console.error(e); } };
    const isPdf = () => /PDF/i.test(S.dest);
    function parseRange(r, max) {
      const set = new Set(); if (!r.trim()) return null;
      for (const part of r.split(",")) {
        const m = part.trim().match(/^(\d+)(?:\s*-\s*(\d+))?$/); if (!m) return null;
        const a = +m[1], b = m[2] ? +m[2] : a; if (a < 1 || b > max || a > b) return null;
        for (let i = a; i <= b; i++) set.add(i);
      }
      return [...set].sort((x, y) => x - y);
    }
    const chosen = () => S.pages === "all" ? Array.from({ length: doc.pages }, (_, i) => i + 1) : (parseRange(S.range, doc.pages) || []);
    const sheets = () => { const n = chosen().length; return (S.duplex && !isPdf() ? Math.ceil(n / 2) : n) * (isPdf() ? 1 : S.copies); };
    let drawing = false;
    function render() {
      if (drawing) return; drawing = true;
      try { draw(); } finally { drawing = false; }
    }
    function draw() {
      const pg = chosen();
      el.innerHTML = `<div class="pp ${opts.big ? "big" : ""}" role="dialog" aria-label="Imprimer">
        <div class="pp-prev ${S.color === "bw" && !isPdf() ? "bw" : ""}">${Array.from({ length: doc.pages }, (_, i) => `<div class="pp-page ${pg.includes(i + 1) ? "" : "off"}"><div class="pp-ph">${doc.pageHTML ? doc.pageHTML(i + 1) : `<b>${esc(doc.title)}</b><span>page ${i + 1}</span>`}</div><small>${i + 1}</small></div>`).join("")}</div>
        <div class="pp-side"><div class="pp-h"><b>Imprimer</b><span>${isPdf() ? `${pg.length} page${pg.length > 1 ? "s" : ""}` : `${sheets()} feuille${sheets() > 1 ? "s" : ""} de papier`}</span></div>
          <label class="pp-f ${opts.hint === "dest" ? "pp-hint" : ""}">Destination<select data-pp="dest">${printers.map(p => `<option ${p === S.dest ? "selected" : ""}>${esc(p)}</option>`).join("")}</select></label>
          <div class="pp-f ${opts.hint === "pages" ? "pp-hint" : ""}">Pages<div class="pp-radios"><label><input type="radio" name="pp-pages" value="all" ${S.pages === "all" ? "checked" : ""}> Toutes</label><label><input type="radio" name="pp-pages" value="custom" ${S.pages === "custom" ? "checked" : ""}> Personnalisées</label></div>
            ${S.pages === "custom" ? `<input type="text" data-pp="range" value="${esc(S.range)}" placeholder="ex. 1-5, 8, 11-13" autocomplete="off">` : ""}</div>
          ${isPdf() ? "" : `<label class="pp-f">Copies<input type="number" min="1" max="99" data-pp="copies" value="${S.copies}"></label>
          <label class="pp-f ${opts.hint === "color" ? "pp-hint" : ""}">Couleur<select data-pp="color"><option value="color" ${S.color === "color" ? "selected" : ""}>Couleur</option><option value="bw" ${S.color === "bw" ? "selected" : ""}>Noir et blanc</option></select></label>
          <button type="button" class="pp-more" data-pp="more">${S.more ? "▾" : "▸"} Plus de paramètres</button>
          ${S.more ? `<label class="pp-chk"><input type="checkbox" data-pp="duplex" ${S.duplex ? "checked" : ""}> Imprimer en recto verso</label>` : ""}`}
          ${S.err ? `<div class="pp-err" role="alert">${S.err}</div>` : ""}
          <div class="pp-btns"><button type="button" class="pri" data-pp="go">${isPdf() ? "Enregistrer" : "Imprimer"}</button><button type="button" data-pp="cancel">Annuler</button></div></div></div>`;
    }
    function onInput(e) {
      const t = e.target, k = t.dataset.pp;
      if (t.name === "pp-pages") { S.pages = t.value; S.err = ""; render(); if (S.pages === "custom") el.querySelector('[data-pp="range"]')?.focus(); emit("change", { ...S }); return; }
      if (k === "dest") { S.dest = t.value; render(); emit("change", { ...S }); }
      if (k === "copies") { S.copies = Math.max(1, Math.min(99, +t.value || 1)); render(); emit("change", { ...S }); }
      if (k === "color") { S.color = t.value; render(); emit("change", { ...S }); }
      if (k === "duplex") { S.duplex = t.checked; render(); emit("change", { ...S }); }
      if (k === "range") { S.range = t.value; if (e.type === "change") { S.err = parseRange(S.range, doc.pages) ? "" : `Pages invalides : utilisez par exemple « 1 » ou « 1-2 » (le document a ${doc.pages} pages).`; render(); emit("change", { ...S }); } }
    }
    function onClick(e) {
      const b = e.target.closest("[data-pp]"); if (!b || !el.contains(b) || b.tagName !== "BUTTON") return;
      if (b.dataset.pp === "more") { S.more = !S.more; render(); return; }
      if (b.dataset.pp === "cancel") { emit("cancel", {}); return; }
      if (b.dataset.pp === "go") {
        if (S.pages === "custom") { const r = el.querySelector('[data-pp="range"]'); if (r) S.range = r.value; if (!parseRange(S.range, doc.pages)) { S.err = `Pages invalides : utilisez par exemple « 1 » ou « 1-2 » (le document a ${doc.pages} pages).`; render(); return; } }
        emit("print", { dest: S.dest, pdf: isPdf(), pages: chosen(), copies: isPdf() ? 1 : S.copies, color: isPdf() ? "color" : S.color, duplex: !isPdf() && S.duplex, sheets: sheets() });
      }
    }
    el.addEventListener("change", onInput); el.addEventListener("input", e => { if (e.target.dataset.pp === "range") S.range = e.target.value; });
    el.addEventListener("click", onClick);
    const ctl = { state: S, render, destroy() { el.removeEventListener("change", onInput); el.removeEventListener("click", onClick); el.innerHTML = ""; } };
    render();
    return ctl;
  }

  /* =========================================================
     L'IMPRIMANTE ET LA FILE D'ATTENTE
     ========================================================= */
  function printer(el, opts = {}) {
    const S = { state: opts.state || "ok" /* ok | nopaper | off | jam */, jobs: opts.jobs || [], out: 0, name: opts.name || "HP LaserJet - Accueil", busy: false, view: "printer" };
    const emit = (t, d) => { try { opts.onEvent?.(t, d, ctl); } catch (e) { console.error(e); } };
    let destroyed = false, timers = [];
    const later = (fn, ms) => { const t = setTimeout(() => { if (!destroyed) fn(); }, ms); timers.push(t); };
    const screen = () => ({ ok: S.busy ? "Impression…" : "Prête", nopaper: "⚠ Bac vide : chargez du papier", off: "", jam: "⚠ Bourrage papier : ouvrez le capot" })[S.state];
    const jobStatus = j => j.status === "error" ? (S.state === "off" ? "Erreur - Hors connexion" : S.state === "nopaper" ? "Erreur - Plus de papier" : S.state === "jam" ? "Erreur - Bourrage" : "Erreur - Impression") : j.status === "printing" ? "Impression en cours" : j.status === "blocked" ? "Erreur - Impression (bloqué)" : "En attente";
    function render() {
      if (destroyed) return;
      el.innerHTML = `<div class="pq ${opts.big ? "big" : ""}">
        <div class="pq-dev">
          <div class="pq-body ${S.state === "off" ? "off" : ""}">
            <div class="pq-top"></div>
            <div class="pq-screen">${esc(screen())}</div>
            <div class="pq-leds"><span class="${S.state === "off" ? "" : "on"}" title="Marche">⏻</span><span class="${["nopaper", "jam"].includes(S.state) ? "warn" : ""}" title="Alerte">⚠</span></div>
            <div class="pq-tray ${S.state === "nopaper" ? "empty" : ""}">${S.state === "nopaper" ? "bac vide" : "▤ papier"}</div>
            <div class="pq-out">${Array.from({ length: Math.min(S.out, 6) }, (_, i) => `<i style="--i:${i}"></i>`).join("")}</div>
          </div>
          <div class="pq-act">
            <button type="button" data-pq="power" class="${opts.hint === "power" ? "pq-hint" : ""}">⏻ ${S.state === "off" ? "Allumer" : "Éteindre"}</button>
            <button type="button" data-pq="paper" class="${opts.hint === "paper" ? "pq-hint" : ""}">▤ Ajouter du papier</button>
            <button type="button" data-pq="jam" class="${opts.hint === "jam" ? "pq-hint" : ""}">🔧 Ouvrir le capot</button>
          </div>
        </div>
        <div class="pq-queue"><div class="pq-qh">🖨️ File d'attente · ${esc(S.name)}${S.state === "off" ? " <small>(hors connexion)</small>" : ""}</div>
          ${S.jobs.length ? `<table><thead><tr><th>Document</th><th>État</th><th></th></tr></thead><tbody>${S.jobs.map(j => `<tr class="${j.status === "error" || j.status === "blocked" ? "err" : ""}"><td>${esc(j.name)}</td><td>${jobStatus(j)}</td><td><button type="button" data-pq="restart" data-id="${j.id}" class="${opts.hint === "restart" ? "pq-hint" : ""}">↻ Redémarrer</button><button type="button" data-pq="cancel" data-id="${j.id}" class="${opts.hint === "cancel" ? "pq-hint" : ""}">✕ Annuler</button></td></tr>`).join("")}</tbody></table>` : `<div class="pq-empty">Aucun document en attente.</div>`}
        </div></div>`;
    }
    function tryPrint() {
      const j = S.jobs[0]; if (!j || S.busy) return;
      if (S.state !== "ok" || j.status === "blocked") { j.status = j.status === "blocked" ? "blocked" : "error"; render(); return; }
      S.busy = true; j.status = "printing"; render();
      later(() => { S.busy = false; S.out += j.pages || 1; S.jobs = S.jobs.filter(x => x !== j); render(); emit("printed", { job: j }); tryPrint(); }, opts.fast ? 300 : 1800);
    }
    function onClick(e) {
      const b = e.target.closest("[data-pq]"); if (!b || !el.contains(b)) return;
      const a = b.dataset.pq, j = S.jobs.find(x => x.id === b.dataset.id);
      if (a === "power") { S.state = S.state === "off" ? (S.wasState || "ok") : (S.wasState = S.state === "off" ? "ok" : S.state, "off"); render(); emit("power", { on: S.state !== "off" }); if (S.state === "ok") later(tryPrint, 600); return; }
      if (a === "paper") { if (S.state === "off") { emit("hint", { msg: "L'imprimante est éteinte." }); return; } const was = S.state; if (S.state === "nopaper") S.state = "ok"; render(); emit("paper", { fixed: was === "nopaper" }); if (S.state === "ok") later(tryPrint, 400); return; }
      if (a === "jam") { if (S.state === "off") { emit("hint", { msg: "L'imprimante est éteinte." }); return; } const was = S.state; if (S.state === "jam") S.state = "ok"; render(); emit("jam", { fixed: was === "jam" }); if (S.state === "ok") later(tryPrint, 400); return; }
      if (a === "cancel" && j) { S.jobs = S.jobs.filter(x => x !== j); render(); emit("cancelJob", { job: j }); later(tryPrint, 300); return; }
      if (a === "restart" && j) { if (j.status === "blocked") { emit("restartBlocked", { job: j }); return; } j.status = "waiting"; render(); emit("restartJob", { job: j }); later(tryPrint, 300); return; }
    }
    el.addEventListener("click", onClick);
    const ctl = {
      state: S, render,
      add(job) { S.jobs.push({ id: "j" + Math.random().toString(36).slice(2, 7), status: "waiting", pages: 1, ...job }); render(); later(tryPrint, 500); },
      set(state) { S.state = state; render(); },
      destroy() { destroyed = true; timers.forEach(clearTimeout); el.removeEventListener("click", onClick); el.innerHTML = ""; }
    };
    render();
    return ctl;
  }

  /* =========================================================
     PARAMÈTRES › AFFICHAGE
     ========================================================= */
  function display(el, opts = {}) {
    const S = { bright: opts.bright ?? 100, scale: opts.scale ?? 100, text: opts.text ?? 100, night: !!opts.night, zoom: 100 };
    const emit = (t, d) => { try { opts.onEvent?.(t, d, ctl); } catch (e) { console.error(e); } };
    function render() {
      el.innerHTML = `<div class="pd ${opts.big ? "big" : ""}">
        <div class="pd-set"><div class="pd-h">⚙️ Paramètres › Système › <b>Affichage</b></div>
          <label class="pd-f">☀️ Luminosité <span data-pv="bright"></span><input type="range" min="10" max="100" step="5" value="${S.bright}" data-pd="bright"></label>
          <label class="pd-f pd-row"><span>🌙 Éclairage nocturne <small>(moins de lumière bleue le soir)</small></span><input type="checkbox" data-pd="night" ${S.night ? "checked" : ""}></label>
          <label class="pd-f">🔍 Mise à l'échelle (tout agrandir)<select data-pd="scale">${[100, 125, 150, 175].map(v => `<option value="${v}" ${v === S.scale ? "selected" : ""}>${v} %${v === 125 ? " (recommandé)" : ""}</option>`).join("")}</select></label>
          <label class="pd-f">🔤 Taille du texte <span data-pv="text"></span><input type="range" min="100" max="225" step="25" value="${S.text}" data-pd="text"></label>
        </div>
        <div class="pd-screen"><div class="pd-mini"><div class="pd-mini-bar">📚 Médiathèque de Valbourg</div><p><b>Horaires</b></p><p>Mardi au samedi : 10 h – 18 h</p><p>Atelier numérique : jeudi 14 h</p></div>
          <small>Aperçu de l'écran</small></div></div>`;
      update();
    }
    function update() {
      const f = (S.scale / 100) * (S.text / 100);
      el.querySelector('[data-pv="bright"]').textContent = S.bright + " %";
      el.querySelector('[data-pv="text"]').textContent = S.text + " %";
      const sc = el.querySelector(".pd-screen"); sc.style.filter = `brightness(${0.35 + 0.65 * S.bright / 100})${S.night ? " sepia(.35) saturate(1.2)" : ""}`;
      el.querySelector(".pd-mini").style.fontSize = Math.round(13 * f) + "px";
    }
    function onInput(e) {
      const k = e.target.dataset.pd; if (!k) return;
      if (k === "night") S.night = e.target.checked; else S[k] = +e.target.value;
      update(); if (e.type === "change") emit("change", { key: k, ...S });
    }
    el.addEventListener("input", onInput); el.addEventListener("change", onInput);
    const ctl = { state: S, render, destroy() { el.removeEventListener("input", onInput); el.removeEventListener("change", onInput); el.innerHTML = ""; } };
    render();
    return ctl;
  }

  AN.per = { keyboard, printDialog, printer, display, ROWS };
})(window.AN);

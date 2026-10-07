/* =========================================================
   Espace formateur (« Master hub »)
   Tout est mis à jour en direct : aucune actualisation manuelle.
   ========================================================= */
(function (AN) {
  "use strict";
  const { $, $$, esc, uid, levelName, pct, timeAgo, toast, show, confirmBox, promptBox } = AN.util;
  const C = AN.catalog;

  const T = {
    store: null, teacher: null, unsub: null, tick: null,
    data: { workshops: [], missions: [], messages: [], templates: [], prefs: {} },
    activeWid: null, view: "dashboard", thread: null, helpSeen: new Set(), editingTemplate: null, firstLoad: true
  };

  const ONLINE_MS = 100000, IDLE_MS = 3 * 60000;
  const seatName = s => s.displayName || `Place ${s.index + 1}`;
  const isOnline = s => s.claimed && s.studentUid && Date.now() - (s.lastSeen || 0) < ONLINE_MS;
  const groups = () => T.data.workshops;
  const active = () => groups().find(w => w.id === T.activeWid) || null;
  const missionsOf = sid => T.data.missions.filter(m => m.seatId === sid);
  const messagesOf = sid => T.data.messages.filter(m => m.seatId === sid).sort((a, b) => a.createdAt - b.createdAt);
  const unreadOf = sid => T.data.messages.filter(m => m.seatId === sid && m.from === "student" && !m.readByTeacher).length;
  const missionLabel = m => m.type === "custom" ? (m.custom?.title || "Mission personnalisée") : C.label(m.type);
  const quickReplies = () => AN.quickReplies.resolve(T.data.prefs.quickReplies);
  /** Sélecteur de catégorie + boutons des réponses de cette catégorie (messagerie). */
  function qrPicker() {
    const list = quickReplies();
    const cats = AN.quickReplies.categories.filter(c => list.some(r => r.cat === c.id));
    if (!cats.some(c => c.id === T.qrCat)) T.qrCat = cats[0]?.id;
    const opts = cats.map(c => `<option value="${c.id}" ${c.id === T.qrCat ? "selected" : ""}>${esc(c.label)} (${list.filter(r => r.cat === c.id).length})</option>`).join("");
    const chips = list.map((r, i) => r.cat === T.qrCat ? `<button type="button" data-qr="${i}" title="${esc(r.text)}">${esc(r.title)}</button>` : "").join("");
    return `<div class="qr-picker"><label class="sr-only" for="qrCat">Catégorie de réponses rapides</label><select id="qrCat" class="cyber-select">${opts}</select></div><div class="qr-chips">${chips}</div>`;
  }
  function sortedGroups(list = groups()) {
    return [...list].sort((a, b) => (b.favorite === true) - (a.favorite === true) || (a.archived === true) - (b.archived === true) || (a.order || 0) - (b.order || 0));
  }
  function seatProgress(sid) {
    const ms = missionsOf(sid);
    return { total: ms.length, done: ms.filter(m => m.status === "done").length, p: pct(ms.filter(m => m.status === "done").length, ms.length) };
  }
  function seatStatus(s) {
    if (!s.claimed && !s.displayName) return { cls: "free", label: "Place libre" };
    if (s.help?.requested) return { cls: "help", label: "✋ Aide demandée" };
    if (!isOnline(s)) return { cls: "off", label: "Hors ligne" };
    if (s.activity && Date.now() - (s.activity.at || 0) > IDLE_MS) return { cls: "idle", label: "Inactif depuis " + timeAgo(s.activity.at).replace("il y a ", "") };
    return { cls: "on", label: "En ligne" };
  }

  /* ======================= CONNEXION ======================= */
  async function start(store, teacher) {
    T.store = store; T.teacher = teacher; T.firstLoad = true; T.helpSeen = new Set();
    document.body.classList.add("teacher-on");
    $("#teacherHello").textContent = "Bonjour 👋";
    $("#teacherSub").textContent = teacher.demo ? "Mode démonstration — les données restent dans ce navigateur." : `Connecté : ${teacher.email}. Tout est synchronisé en temps réel.`;
    const foot = $("#syncStatus");
    foot.innerHTML = store.mode === "demo" ? `<span class="status-dot amber"></span><span>Mode démo (ce navigateur)</span>` : `<span class="status-dot"></span><span>Firebase synchronisé</span>`;
    show("teacherDashboard");
    switchView("dashboard");
    T.unsub = store.watchTeacher(teacher.uid, d => onData(d));
    T.tick = setInterval(() => { if (["live", "dashboard"].includes(T.view)) render(); }, 20000);
  }
  async function stop() {
    T.unsub && T.unsub(); clearInterval(T.tick);
    await T.store?.signOut();
    Object.assign(T, { store: null, teacher: null, unsub: null, activeWid: null, thread: null });
    document.body.classList.remove("teacher-on");
    show("landing");
  }

  function onData(d) {
    T.data = d;
    // groupe actif par défaut
    if (!active()) T.activeWid = (sortedGroups().find(w => !w.archived) || sortedGroups()[0])?.id || null;
    // nouvelles demandes d'aide
    const helpSeats = [];
    groups().forEach(w => w.seats.forEach(s => { if (s.help?.requested) helpSeats.push({ w, s }); }));
    helpSeats.forEach(({ s }) => {
      const key = s.id + ":" + s.help.at;
      if (!T.helpSeen.has(key)) {
        T.helpSeen.add(key);
        if (!T.firstLoad) { toast(`✋ ${seatName(s)} demande de l'aide (${s.help.where || ""})`, "help", 9000); beep(); }
      }
    });
    T.firstLoad = false;
    render();
  }
  function beep() {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const o = ctx.createOscillator(), g = ctx.createGain();
      o.connect(g); g.connect(ctx.destination); o.frequency.value = 880; g.gain.value = 0.06;
      o.start(); setTimeout(() => { o.frequency.value = 1175; }, 140); setTimeout(() => { o.stop(); ctx.close(); }, 300);
    } catch (e) {}
  }

  /* ======================= NAVIGATION ======================= */
  function switchView(name) {
    T.view = name;
    $$(".teacher-view").forEach(v => v.classList.toggle("active", v.id === "tv-" + name));
    $$(".teacher-nav-btn").forEach(b => { const on = b.dataset.view === name; b.classList.toggle("active", on); b.setAttribute("aria-current", on ? "page" : "false"); });
    render();
  }
  function render() {
    if (!T.teacher) return;
    renderBadges();
    renderGroupPicker();
    ({ dashboard: renderDashboard, live: renderLive, groups: renderGroups, participants: renderParticipants, missions: renderMissions, chapters: renderChapters, messages: renderMessages, stats: renderStats, analytics: renderAnalytics, quick: renderQuick })[T.view]?.();
  }
  function renderBadges() {
    const unread = T.data.messages.filter(m => m.from === "student" && !m.readByTeacher).length;
    const help = groups().reduce((n, w) => n + w.seats.filter(s => s.help?.requested).length, 0);
    const set = (v, n, cls = "") => { const b = $(`.teacher-nav-btn[data-view="${v}"] .nav-badge`); if (b) { b.textContent = n || ""; b.className = "nav-badge " + (n ? "on " + cls : ""); } };
    set("messages", unread);
    set("live", help, "help");
    document.title = (help ? `✋ ${help} — ` : unread ? `(${unread}) ` : "") + "Atelier numérique — Formateur";
  }
  function renderGroupPicker() {
    const sel = $("#activeGroupSelect");
    const list = sortedGroups().filter(w => !w.archived || w.id === T.activeWid);
    sel.innerHTML = list.length ? list.map(w => `<option value="${w.id}" ${w.id === T.activeWid ? "selected" : ""}>${w.favorite ? "★ " : ""}${esc(w.name)} — code ${esc(w.code)}</option>`).join("") : `<option value="">Aucun groupe — créez-en un</option>`;
    sel.disabled = !list.length;
    $$("[data-needs-group]").forEach(el => el.classList.toggle("hidden", !active()));
  }

  /* ======================= TABLEAU DE BORD ======================= */
  function renderDashboard() {
    const all = groups();
    const seats = all.flatMap(w => w.seats);
    const set = (id, v) => { const el = $("#" + id); if (el) el.textContent = String(v); };
    set("metricGroups", all.filter(w => !w.archived).length);
    set("metricOnline", seats.filter(isOnline).length);
    set("metricMissions", T.data.missions.filter(m => m.status !== "done").length);
    set("metricMessages", T.data.messages.filter(m => m.from === "student" && !m.readByTeacher).length);
    set("metricHelp", seats.filter(s => s.help?.requested).length);
    const q = ($("#teacherGlobalSearch").value || "").toLowerCase().trim();
    const f = $("#groupFilterStatus").value;
    const list = sortedGroups().filter(w => {
      if (q && !w.name.toLowerCase().includes(q) && !w.seats.some(s => (s.displayName || "").toLowerCase().includes(q)) && !w.code.includes(q)) return false;
      if (f === "active" && w.archived) return false;
      if (f === "favorite" && !w.favorite) return false;
      if (f === "archived" && !w.archived) return false;
      return true;
    });
    $("#groupCards").innerHTML = list.length ? list.slice(0, 8).map(w => {
      const online = w.seats.filter(isOnline).length, claimed = w.seats.filter(s => s.displayName).length;
      const help = w.seats.filter(s => s.help?.requested).length;
      return `<article class="geek-group-card ${w.favorite ? "favorite" : ""} ${w.archived ? "archived" : ""} ${w.id === T.activeWid ? "current" : ""}">
        <div class="group-card-top"><div><div class="group-card-title">${esc(w.name)}</div><div class="group-card-meta">Code <b class="mono">${esc(w.code)}</b> · ${claimed}/${w.seats.length} inscrits · ${online} en ligne</div></div><span>${help ? `<span class="help-chip">✋ ${help}</span>` : w.favorite ? "★" : w.archived ? "ARCH" : "●"}</span></div>
        <div class="group-card-actions"><button class="icon-btn" data-g="open" data-id="${w.id}">▶ Suivre en direct</button><button class="icon-btn" data-g="rename" data-id="${w.id}">✎ Renommer</button><button class="icon-btn" data-g="fav" data-id="${w.id}">${w.favorite ? "Retirer ★" : "Favori ★"}</button><button class="icon-btn" data-g="archive" data-id="${w.id}">${w.archived ? "Réactiver" : "Archiver"}</button></div>
      </article>`;
    }).join("") : `<div class="empty-state">${all.length ? "Aucun groupe ne correspond." : "Bienvenue ! Commencez par créer un groupe dans « Groupes »."}</div>`;

    // fil d'activité réel
    const seatById = {}; all.forEach(w => w.seats.forEach(s => { seatById[s.id] = { s, w }; }));
    const ev = [];
    T.data.missions.forEach(m => {
      const x = seatById[m.seatId]; if (!x) return;
      if (m.status === "done" && m.completedAt) ev.push({ t: m.completedAt, html: `<strong>${esc(seatName(x.s))}</strong> a terminé « ${esc(missionLabel(m))} »${m.score?.total ? ` · quiz ${m.score.score}/${m.score.total}` : ""}`, cls: "good" });
      else if (m.startedAt) ev.push({ t: m.startedAt, html: `<strong>${esc(seatName(x.s))}</strong> a commencé « ${esc(missionLabel(m))} »`, cls: "" });
    });
    T.data.messages.filter(m => m.from === "student").forEach(m => { const x = seatById[m.seatId]; if (x) ev.push({ t: m.createdAt, html: `<strong>${esc(seatName(x.s))}</strong> a écrit : « ${esc(m.text.slice(0, 60))}${m.text.length > 60 ? "…" : ""} »`, cls: "msg" }); });
    Object.values(seatById).forEach(({ s }) => { if (s.help?.requested) ev.push({ t: s.help.at, html: `<strong>${esc(seatName(s))}</strong> demande de l'aide (${esc(s.help.where || "")})`, cls: "help" }); });
    ev.sort((a, b) => b.t - a.t);
    $("#activityFeed").innerHTML = ev.length ? ev.slice(0, 10).map(e => `<div class="activity-item ${e.cls}">${e.html}<br><small>${timeAgo(e.t)}</small></div>`).join("") : '<div class="empty-state">Aucune activité pour le moment.</div>';
  }

  /* ======================= EN DIRECT ======================= */
  function renderLive() {
    const w = active();
    const box = $("#liveGrid");
    // ne pas redessiner pendant que le formateur manipule une carte (menu ouvert, liste de niveau)
    if (box.querySelector("details[open]") || (box.contains(document.activeElement) && document.activeElement.tagName === "SELECT")) { T.pendingLive = true; return; }
    T.pendingLive = false;
    if (!w) { box.innerHTML = `<div class="empty-state">Créez un groupe pour suivre la séance en direct.</div>`; $("#liveSummary").textContent = ""; return; }
    const seats = w.seats;
    const help = seats.filter(s => s.help?.requested).length;
    $("#liveSummary").innerHTML = `<b>${seats.filter(isOnline).length}</b> en ligne · <b>${seats.filter(s => s.displayName).length}</b>/${seats.length} inscrits${help ? ` · <span class="help-chip">✋ ${help} demande${help > 1 ? "s" : ""} d'aide</span>` : ""}`;
    const order = s => (s.help?.requested ? 0 : isOnline(s) ? 1 : s.displayName ? 2 : 3);
    box.innerHTML = [...seats].sort((a, b) => order(a) - order(b) || a.index - b.index).map(s => {
      const st = seatStatus(s);
      const pr = seatProgress(s.id);
      const act = s.activity && isOnline(s) ? s.activity : null;
      const unread = unreadOf(s.id);
      return `<article class="live-card ${st.cls}">
        <header><div><h3>${esc(seatName(s))}</h3><span class="seat-code mono" title="Code participant">${esc(s.seatCode)}</span></div><span class="live-status ${st.cls}">${esc(st.label)}</span></header>
        ${s.help?.requested ? `<div class="help-banner">✋ Besoin d'aide · ${esc(s.help.where || "")} · ${timeAgo(s.help.at)}<button class="cyber-btn primary small" data-s="resolve" data-id="${s.id}">J'arrive ✓</button></div>` : ""}
        <div class="live-activity">${act ? `${C.icon(act.type)} <b>${esc(act.label)}</b><div class="step-dots">${Array.from({ length: act.total || 1 }, (_, i) => `<i class="${i < act.step ? "done" : i === act.step ? "cur" : ""}"></i>`).join("")}</div><small>étape ${Math.min(act.step + 1, act.total)} / ${act.total} · ${timeAgo(act.at)}</small>` : `<span class="muted">${s.displayName ? (isOnline(s) ? "Sur son espace" : "Vu " + timeAgo(s.lastSeen)) : "En attente de connexion"}</span>`}</div>
        <div class="participant-progress-line"><span>Missions ${pr.done}/${pr.total}</span><strong>${pr.p}%</strong></div>
        <div class="progress-track"><span style="width:${pr.p}%"></span></div>
        <div class="live-actions">
          <select class="cyber-select small" data-s-change="level" data-id="${s.id}" aria-label="Niveau de ${esc(seatName(s))}">${Object.entries(AN.util.LEVELS).map(([k, v]) => `<option value="${k}" ${s.level === k ? "selected" : ""}>${v}</option>`).join("")}</select>
          <button class="icon-btn" data-s="assign" data-id="${s.id}">+ Mission</button>
          <button class="icon-btn ${unread ? "unread" : ""}" data-s="msg" data-id="${s.id}">✉ ${unread ? unread : ""}</button>
          <details class="more"><summary class="icon-btn" aria-label="Plus d'actions">⋯</summary><div class="more-menu">
            <button class="icon-btn warning-action" data-s="disconnect" data-id="${s.id}">Déconnecter</button>
            <button class="icon-btn" data-s="reset" data-id="${s.id}">Réinitialiser la progression</button>
            <button class="icon-btn danger-action" data-s="delete" data-id="${s.id}">Libérer la place (nouveau code)</button></div></details>
        </div>
      </article>`;
    }).join("");
  }

  /* ======================= GROUPES ======================= */
  function renderGroups() {
    const list = sortedGroups();
    $("#groupsManager").innerHTML = list.length ? list.map((w, i) => `
      <div class="group-manager-row ${w.archived ? "archived" : ""}">
        <div><div class="group-manager-name">${w.favorite ? "★ " : ""}${esc(w.name)}</div><div class="group-manager-meta">Code <b class="mono">${esc(w.code)}</b> · ${w.seats.length} place(s) · créé le ${new Date(w.createdAt).toLocaleDateString("fr-FR")}</div></div>
        <div class="group-card-actions">
          <button class="icon-btn" data-g="up" data-id="${w.id}" ${i === 0 ? "disabled" : ""} aria-label="Monter">↑</button><button class="icon-btn" data-g="down" data-id="${w.id}" ${i === list.length - 1 ? "disabled" : ""} aria-label="Descendre">↓</button>
          <button class="icon-btn" data-g="open" data-id="${w.id}">▶ Direct</button>
          <button class="icon-btn" data-g="print" data-id="${w.id}">🖨 Codes</button>
          <button class="icon-btn" data-g="project" data-id="${w.id}">📽 Projeter</button>
          <button class="icon-btn" data-g="seat" data-id="${w.id}">+ Place</button>
          <button class="icon-btn" data-g="rename" data-id="${w.id}">✎</button>
          <button class="icon-btn" data-g="fav" data-id="${w.id}">${w.favorite ? "★" : "☆"}</button>
          <button class="icon-btn" data-g="archive" data-id="${w.id}">${w.archived ? "Réactiver" : "Archiver"}</button>
          <button class="icon-btn danger-action" data-g="delete" data-id="${w.id}">Supprimer</button>
        </div>
      </div>`).join("") : '<div class="empty-state">Aucun groupe pour le moment.</div>';
  }

  async function groupAction(action, id) {
    const w = groups().find(x => x.id === id); if (!w) return;
    const S = T.store;
    try {
      if (action === "open") { T.activeWid = id; switchView("live"); }
      else if (action === "rename") { const n = await promptBox({ title: "Renommer le groupe", label: "Nouveau nom", value: w.name }); if (n) await S.updateWorkshop(id, { name: n.slice(0, 60) }); }
      else if (action === "fav") await S.updateWorkshop(id, { favorite: !w.favorite });
      else if (action === "archive") await S.updateWorkshop(id, { archived: !w.archived });
      else if (action === "up" || action === "down") {
        const list = sortedGroups(); const i = list.findIndex(x => x.id === id); const j = action === "up" ? i - 1 : i + 1;
        if (j < 0 || j >= list.length) return;
        const reordered = [...list]; [reordered[i], reordered[j]] = [reordered[j], reordered[i]];
        await Promise.all(reordered.map((g, k) => g.order !== k ? S.updateWorkshop(g.id, { order: k }) : null));
      }
      else if (action === "seat") { await S.addSeat(id); toast("Place ajoutée.", "good"); }
      else if (action === "print") printCodes(w);
      else if (action === "project") project(w);
      else if (action === "delete") {
        if (!(await confirmBox({ title: `Supprimer « ${w.name} » ?`, text: "Le groupe, ses places, missions, messages et réussites seront définitivement effacés. Les codes ne fonctionneront plus.", ok: "Supprimer définitivement", danger: true }))) return;
        await S.deleteWorkshop(id);
        if (T.activeWid === id) T.activeWid = null;
        toast("Groupe supprimé.", "good");
      }
    } catch (e) { console.error(e); toast(e.message, "bad", 7000); }
  }

  function appUrl() { return location.protocol.startsWith("http") ? location.origin + location.pathname.replace(/index\.html$/, "") : "(adresse de l'application)"; }
  function printCodes(w) {
    AN.util.printHTML(`<div class="codes-sheet">${w.seats.map(s => `
      <div class="code-card"><div class="code-card-title">Atelier numérique — ${esc(w.name)}</div>
        <ol><li>Ouvrez : <b>${esc(appUrl())}</b></li><li>Cliquez sur « Je participe à l'atelier »</li><li>Tapez vos deux codes :</li></ol>
        <div class="code-pair"><div><small>Code de l'atelier</small><b>${esc(w.code)}</b></div><div><small>Mon code personnel</small><b>${esc(s.seatCode)}</b></div></div>
        <div class="code-card-foot">Place n°${s.index + 1} · Gardez ce papier pour la prochaine séance</div></div>`).join("")}</div>`);
  }
  function project(w) {
    const o = $("#projector");
    o.innerHTML = `<div class="projector-inner"><p>Allez sur</p><div class="proj-url">${esc(appUrl())}</div><p>puis « Je participe à l'atelier »</p><p>Code de l'atelier</p><div class="proj-code">${esc(w.code.slice(0, 3))} ${esc(w.code.slice(3))}</div><p class="proj-small">Votre code personnel (4 chiffres) est sur votre papier.</p><button class="cyber-btn secondary" id="closeProjector">Fermer (Échap)</button></div>`;
    o.classList.remove("hidden");
    const close = () => { o.classList.add("hidden"); document.removeEventListener("keydown", esc_); };
    const esc_ = e => { if (e.key === "Escape") close(); };
    document.addEventListener("keydown", esc_);
    $("#closeProjector").addEventListener("click", close);
    $("#closeProjector").focus();
  }

  /* ======================= ACTIONS SUR UNE PLACE ======================= */
  async function seatAction(action, sid, value) {
    const w = groups().find(g => g.seats.some(s => s.id === sid)); if (!w) return;
    const s = w.seats.find(x => x.id === sid);
    const S = T.store, name = seatName(s);
    try {
      if (action === "resolve") { await S.updateSeat(w.id, sid, { help: null }); toast(`${name} sait que vous arrivez.`, "good"); }
      else if (action === "level") { await S.updateSeat(w.id, sid, { level: value }); toast(`Niveau de ${name} : ${levelName(value)}`, "good"); }
      else if (action === "assign") { T.activeWid = w.id; switchView("missions"); $$("#assignSeats input").forEach(i => { i.checked = i.value === sid; }); updateAssignAll(); $("#missionTemplate").focus(); }
      else if (action === "msg") { T.activeWid = w.id; T.thread = sid; switchView("messages"); }
      else if (action === "disconnect") {
        if (!(await confirmBox({ title: `Déconnecter ${name} ?`, text: "Son travail reste enregistré. Il pourra se reconnecter avec ses codes.", ok: "Déconnecter" }))) return;
        await S.updateSeat(w.id, sid, { claimed: false, studentUid: "", lastSeen: 0, activity: null, help: null });
      }
      else if (action === "reset") {
        if (!(await confirmBox({ title: `Réinitialiser ${name} ?`, text: "Ses missions, réussites et son historique de quiz seront effacés. Son nom, son code et ses messages sont conservés.", ok: "Réinitialiser", danger: true }))) return;
        await S.clearSeatData(w.id, sid, { messages: false });
      }
      else if (action === "delete") {
        if (!(await confirmBox({ title: `Libérer la place de ${name} ?`, text: "Progression et messages supprimés, ancien code désactivé. La place reçoit un nouveau code.", ok: "Libérer la place", danger: true }))) return;
        await S.regenerateSeat(w.id, sid);
        if (T.thread === sid) T.thread = null;
        toast("Place libérée avec un nouveau code.", "good");
      }
    } catch (e) { console.error(e); toast(e.message, "bad", 7000); }
  }

  /* ======================= PARTICIPANTS ======================= */
  function renderParticipants() {
    const q = ($("#participantSearch").value || "").toLowerCase().trim();
    const cards = [];
    sortedGroups().forEach(w => w.seats.filter(s => s.displayName).forEach(s => {
      if (q && !s.displayName.toLowerCase().includes(q) && !w.name.toLowerCase().includes(q)) return;
      const pr = seatProgress(s.id), st = seatStatus(s);
      const done = missionsOf(s.id).filter(m => m.status === "done");
      cards.push(`<article class="participant-profile-card">
        <div class="pp-head"><h3>${esc(s.displayName)}</h3><span class="live-status ${st.cls}">${esc(st.label)}</span></div>
        <div class="meta">${esc(w.name)} · ${levelName(s.level)} · code <span class="mono">${esc(s.seatCode)}</span></div>
        <div class="participant-progress-line"><span>Progression</span><strong>${pr.p}%</strong></div>
        <div class="progress-track"><span style="width:${pr.p}%"></span></div>
        <div class="pp-done">${done.length ? done.map(m => `<span class="chip" title="${esc(missionLabel(m))}">${C.icon(m.type)}${m.score?.total ? ` ${m.score.score}/${m.score.total}` : ""}</span>`).join("") : "<small>Aucune mission terminée</small>"}</div>
        <div class="participant-actions"><button class="icon-btn" data-s="assign" data-id="${s.id}">+ Mission</button><button class="icon-btn" data-s="msg" data-id="${s.id}">✉ Message</button><button class="icon-btn warning-action" data-s="disconnect" data-id="${s.id}">Déconnecter</button><button class="icon-btn" data-s="reset" data-id="${s.id}">Réinitialiser</button><button class="icon-btn danger-action" data-s="delete" data-id="${s.id}">Libérer</button></div>
      </article>`);
    }));
    $("#participantsDirectory").innerHTML = cards.length ? cards.join("") : '<div class="empty-state">Aucun participant inscrit pour le moment.</div>';
  }

  /* ======================= MISSIONS ======================= */
  function renderMissions() {
    const w = active();
    // sélecteur de mission (une seule fois par changement de modèles)
    const sel = $("#missionTemplate");
    const prev = sel.value;
    const fam = C.families();
    sel.innerHTML = Object.entries(fam).map(([f, types]) => `<optgroup label="${esc(f)}">${types.map(t => `<option value="m:${t}">${C.icon(t)} ${esc(C.label(t))}</option>`).join("")}</optgroup>`).join("")
      + `<optgroup label="Parcours (missions enchaînées)">${Object.entries(C.parcours).map(([k, p]) => `<option value="p:${k}">${p.icon} ${esc(p.label)}</option>`).join("")}</optgroup>`
      + (T.data.templates.length ? `<optgroup label="Mes missions personnalisées">${T.data.templates.map(t => `<option value="t:${t.id}">✏️ ${esc(t.title)}</option>`).join("")}</optgroup>` : "");
    if (prev && [...sel.options].some(o => o.value === prev)) sel.value = prev;
    describeChoice();

    const seatsBox = $("#assignSeats");
    const checked = new Set($$("#assignSeats input:checked").map(i => i.value));
    seatsBox.innerHTML = w ? w.seats.map(s => `<label class="seat-check ${s.displayName ? "" : "free"}"><input type="checkbox" value="${s.id}" ${checked.has(s.id) ? "checked" : ""}><span>${esc(seatName(s))}${s.displayName ? ` <small>${levelName(s.level)}</small>` : " <small>(libre)</small>"}</span></label>`).join("") : '<div class="empty-state">Choisissez ou créez un groupe.</div>';
    updateAssignAll();

    // missions en cours du groupe
    $("#assignedList").innerHTML = w ? w.seats.filter(s => missionsOf(s.id).length).map(s => `
      <div class="assigned-row"><strong>${esc(seatName(s))}</strong><div class="assigned-chips">${missionsOf(s.id).sort((a, b) => a.createdAt - b.createdAt).map(m => `<span class="chip ${m.status}">${C.icon(m.type)} ${esc(m.type === "custom" ? missionLabel(m) : C.missions[m.type]?.short || m.type)} · ${m.status === "done" ? "✓" : m.status === "in_progress" ? "en cours" : "à faire"}<button class="chip-x" data-del-mission="${m.id}" data-seat="${s.id}" aria-label="Retirer la mission">✕</button></span>`).join("")}</div></div>`).join("") || '<div class="empty-state">Aucune mission attribuée dans ce groupe.</div>' : "";

    renderTemplates();
  }
  function describeChoice() {
    const v = $("#missionTemplate").value || "";
    const [k, id] = v.split(":");
    let html = "";
    if (k === "p") html = `Parcours : ${C.parcours[id].steps.map(t => `${C.icon(t)} ${esc(C.missions[t].short)}`).join(" → ")}. Chaque mission se débloque quand la précédente est terminée.`;
    else if (k === "t") { const t = T.data.templates.find(x => x.id === id); html = t ? `${esc((t.instructions || "").slice(0, 140))}${t.questions?.length ? ` · ${t.questions.length} question(s)` : ""}` : ""; }
    else if (k === "m") html = `Fiche-mémo : ${esc((C.memos[id] || [])[0] || "")}`;
    $("#missionDescription").innerHTML = html;
  }
  function updateAssignAll() {
    const boxes = $$("#assignSeats input");
    const all = $("#assignAll");
    if (!all) return;
    all.checked = boxes.length > 0 && boxes.every(b => b.checked);
    all.indeterminate = boxes.some(b => b.checked) && !all.checked;
  }
  async function assign() {
    const w = active(); if (!w) return toast("Choisissez d'abord un groupe.", "bad");
    const seatIds = $$("#assignSeats input:checked").map(i => i.value);
    if (!seatIds.length) return toast("Cochez au moins un participant.", "bad");
    const [k, id] = $("#missionTemplate").value.split(":");
    const levelMode = $("#missionLevel").value;
    const list = [];
    seatIds.forEach(sid => {
      const s = w.seats.find(x => x.id === sid);
      const level = levelMode === "seat" ? (s.level || "beginner") : levelMode;
      const base = { workshopId: w.id, seatId: sid, teacherUid: w.teacherUid, level };
      if (k === "m") list.push(AN.model.newMission({ ...base, type: id }));
      else if (k === "p") { const p = C.parcours[id]; const pid = uid().slice(0, 12); p.steps.forEach((t, i) => list.push(AN.model.newMission({ ...base, type: t, parcoursId: pid, parcoursLabel: p.label, order: i }))); }
      else if (k === "t") {
        const t = T.data.templates.find(x => x.id === id); if (!t) return;
        list.push(AN.model.newMission({ ...base, type: "custom", custom: { templateId: t.id, title: t.title, instructions: t.instructions, link: t.link || "", message: t.message || null, questions: t.questions || [] } }));
      }
    });
    try {
      await T.store.assignMissions(list);
      const label = k === "p" ? C.parcours[id].label : k === "t" ? T.data.templates.find(x => x.id === id)?.title : C.label(id);
      await Promise.all(seatIds.map(sid => T.store.sendMessage(w.id, sid, AN.model.newMessage({ workshopId: w.id, seatId: sid, teacherUid: w.teacherUid, from: "system", subject: "Nouvelle mission", text: `Une nouvelle mission vous attend : ${label}. Ouvrez « Mes missions ».` }))));
      toast(`Mission attribuée à ${seatIds.length} participant${seatIds.length > 1 ? "s" : ""}.`, "good");
    } catch (e) { console.error(e); toast(e.message, "bad", 7000); }
  }

  /* ======================= CHAPITRES ======================= */
  function chapterStats(ch) {
    const w = active(); if (!w || !ch.parcours) return null;
    const p = C.parcours[ch.parcours];
    const seats = w.seats.filter(s => s.displayName);
    const per = seats.map(s => { const ms = missionsOf(s.id).filter(m => m.parcoursLabel === p.label); return { s, total: ms.length, done: ms.filter(m => m.status === "done").length }; }).filter(x => x.total);
    return { seats: seats.length, started: per.length, finished: per.filter(x => x.done === x.total).length, per };
  }
  function renderChapters() {
    $("#chapterList").innerHTML = AN.chapters.all.map(ch => {
      if (ch.soon) return `<article class="chapter-card soon"><div class="chapter-icon" aria-hidden="true">${ch.icon}</div><div><h3>${esc(ch.title)}</h3><p>${esc(ch.summary)}</p><span class="chip">Bientôt</span></div></article>`;
      const p = C.parcours[ch.parcours], st = chapterStats(ch);
      return `<article class="chapter-card" style="--ch:${ch.color}">
        <div class="chapter-icon" aria-hidden="true">${ch.icon}</div>
        <div class="chapter-main"><h3>${esc(ch.title)} <small>${esc(ch.duration || "")}</small></h3><p>${esc(ch.summary)}</p>
          <ol class="chapter-levels">${p.steps.map(t => `<li>${C.icon(t)} ${esc(C.missions[t].short)}</li>`).join("")}</ol>
          ${st ? `<div class="chapter-progress">${st.started ? `▸ ${st.started} / ${st.seats} participant(s) ont ce chapitre · ${st.finished} l'ont terminé${st.per.length ? `<div class="chapter-people">${st.per.map(x => `<span class="chip ${x.done === x.total ? "done" : ""}">${esc(seatName(x.s))} ${x.done}/${x.total}</span>`).join("")}</div>` : ""}` : "Pas encore donné à ce groupe."}</div>` : ""}
          <div class="chapter-actions">
            ${(ch.lessons || [{ id: "", title: "Projeter la leçon", icon: "📽" }]).map((l, k) => `<button class="cyber-btn ${k ? "secondary" : "primary"}" data-ch="lesson" data-id="${ch.id}" data-lesson="${l.id}" type="button">${l.icon || "📽"} ${esc(l.title)}</button>`).join("")}
            ${(ch.demos || [{ type: ch.demo, label: "Niveau 1 ensemble" }]).map(d => `<button class="cyber-btn secondary" data-ch="demo" data-id="${ch.id}" data-type="${d.type}" type="button">👥 ${esc(d.label)}</button>`).join("")}
            <button class="cyber-btn secondary" data-ch="assign" data-id="${ch.id}" type="button">🚀 Donner au groupe</button>
          </div></div></article>`;
    }).join("");
  }
  async function assignChapter(id) {
    const ch = AN.chapters.get(id), w = active();
    if (!w) return toast("Choisissez d'abord un groupe.", "bad");
    const p = C.parcours[ch.parcours];
    const seats = w.seats.filter(s => s.displayName);
    if (!seats.length) return toast("Aucun participant n'est encore connecté dans ce groupe.", "bad");
    const already = new Set(seats.filter(s => missionsOf(s.id).some(m => m.parcoursLabel === p.label)).map(s => s.id));
    const targets = seats.filter(s => !already.has(s.id));
    if (!targets.length) return toast("Tous les participants ont déjà ce chapitre.", "info");
    if (!(await confirmBox({ title: `Donner le chapitre « ${ch.title} » ?`, text: `${targets.length} participant(s) recevront les ${p.steps.length} niveaux, au niveau de difficulté de chacun. Chaque niveau se débloque quand le précédent est terminé.${already.size ? ` (${already.size} participant(s) l'ont déjà.)` : ""}`, ok: "Donner le chapitre" }))) return;
    const list = [];
    targets.forEach(s => {
      const pid = uid().slice(0, 12);
      p.steps.forEach((t, i) => list.push(AN.model.newMission({ workshopId: w.id, seatId: s.id, teacherUid: w.teacherUid, level: s.level || "beginner", type: t, parcoursId: pid, parcoursLabel: p.label, order: i })));
    });
    try {
      await T.store.assignMissions(list);
      await Promise.all(targets.map(s => T.store.sendMessage(w.id, s.id, AN.model.newMessage({ workshopId: w.id, seatId: s.id, teacherUid: w.teacherUid, from: "system", subject: "Nouveau chapitre", text: `Le chapitre « ${ch.title} » vous attend : ${p.steps.length} niveaux. Ouvrez « Mes missions » et commencez par le niveau 1.` }))));
      toast(`Chapitre donné à ${targets.length} participant(s).`, "good");
      AN.lesson.close();
    } catch (e) { console.error(e); toast(e.message, "bad", 7000); }
  }
  /** Lance un jeu en direct dans la diapositive projetée (groupe actif). */
  function launchGame(gameId, el, done) {
    const w = active();
    if (!w) { toast("Choisissez d'abord le groupe actif (en haut de l'espace formateur).", "bad", 6000); return null; }
    if (!w.seats.some(s => s.displayName)) toast("Aucun participant connecté pour l'instant : ils pourront rejoindre en cours de jeu.", "info", 6000);
    return AN.live.host(gameId, el, { store: T.store, workshop: w, onEnd: done, players: () => (active()?.seats || []).filter(s => s.displayName && isOnline(s)).length });
  }
  function chapterAction(action, id, lesson, type) {
    if (action === "lesson") AN.lesson.open(id, { lesson, onDemo: (cid, t) => chapterAction("demo", cid, null, t), onAssign: assignChapter, onGame: launchGame });
    else if (action === "demo") AN.lesson.demo(id, { type, onAssign: assignChapter });
    else if (action === "assign") assignChapter(id);
  }

  /* ----- éditeur de missions personnalisées ----- */
  function renderTemplates() {
    $("#templateList").innerHTML = T.data.templates.length ? T.data.templates.sort((a, b) => b.createdAt - a.createdAt).map(t => `
      <div class="template-row"><div><strong>✏️ ${esc(t.title)}</strong><br><small>${esc((t.instructions || "").slice(0, 90))}${t.questions?.length ? ` · ${t.questions.length} question(s)` : ""}${t.message?.text ? " · message auto" : ""}</small></div>
      <div class="group-card-actions"><button class="icon-btn" data-tpl="edit" data-id="${t.id}">✎ Modifier</button><button class="icon-btn danger-action" data-tpl="delete" data-id="${t.id}">Supprimer</button></div></div>`).join("") : '<div class="empty-state">Aucune mission personnalisée. Créez la vôtre avec le bouton « + Nouvelle mission ».</div>';
  }
  function questionEditor(q = {}, i = 0) {
    const ch = q.choices || ["", "", ""];
    return `<fieldset class="q-edit"><legend>Question ${i + 1}</legend>
      <label>Question</label><input data-q="q" value="${esc(q.q || "")}" maxlength="200">
      ${[0, 1, 2].map(j => `<div class="q-choice"><input type="radio" name="ok${i}" value="${j}" ${(q.ok ?? 0) === j ? "checked" : ""} aria-label="Bonne réponse ${j + 1}"><input data-q="c${j}" value="${esc(ch[j] || "")}" placeholder="Réponse ${j + 1}${j === 0 ? " (cochez la bonne réponse à gauche)" : ""}" maxlength="140"></div>`).join("")}
      <label>Explication (affichée après la réponse)</label><input data-q="explain" value="${esc(q.explain || "")}" maxlength="240">
      <button type="button" class="icon-btn danger-action" data-q-remove>Retirer cette question</button></fieldset>`;
  }
  function openEditor(t = null) {
    T.editingTemplate = t ? t.id : null;
    $("#tplTitle").value = t?.title || "";
    $("#tplInstructions").value = t?.instructions || "";
    $("#tplLink").value = t?.link || "";
    $("#tplMsgSubject").value = t?.message?.subject || "";
    $("#tplMsgText").value = t?.message?.text || "";
    $("#tplQuestions").innerHTML = (t?.questions || []).map(questionEditor).join("");
    $("#tplEditor").classList.remove("hidden");
    $("#tplEditorTitle").textContent = t ? "Modifier la mission personnalisée" : "Nouvelle mission personnalisée";
    $("#tplTitle").focus();
  }
  async function saveTemplate() {
    const title = $("#tplTitle").value.trim(), instructions = $("#tplInstructions").value.trim();
    if (!title || !instructions) return toast("Un titre et une consigne sont nécessaires.", "bad");
    const link = $("#tplLink").value.trim();
    if (link && !/^https?:\/\//i.test(link)) return toast("Le lien doit commencer par https://", "bad");
    const questions = $$("#tplQuestions .q-edit").map((fs, i) => {
      const g = k => fs.querySelector(`[data-q="${k}"]`).value.trim();
      return { id: "c" + i + "_" + uid().slice(0, 6), q: g("q"), choices: [g("c0"), g("c1"), g("c2")].filter(Boolean), ok: Number(fs.querySelector(`input[type=radio]:checked`)?.value || 0), explain: g("explain") };
    }).filter(q => q.q && q.choices.length >= 2);
    questions.forEach(q => { if (q.ok >= q.choices.length) q.ok = 0; });
    const subject = $("#tplMsgSubject").value.trim(), text = $("#tplMsgText").value.trim();
    const t = { id: T.editingTemplate || uid(), teacherUid: T.teacher.uid, title: title.slice(0, 80), instructions: instructions.slice(0, 2000), link, message: text ? { subject: subject || "Message", text: text.slice(0, 2000) } : null, questions, createdAt: T.data.templates.find(x => x.id === T.editingTemplate)?.createdAt || Date.now() };
    try { await T.store.saveTemplate(t); toast("Mission personnalisée enregistrée.", "good"); $("#tplEditor").classList.add("hidden"); T.editingTemplate = null; }
    catch (e) { toast(e.message, "bad"); }
  }

  /* ======================= MESSAGERIE ======================= */
  function renderMessages() {
    const w = active();
    const list = $("#teacherConversations");
    if (!w) { list.innerHTML = ""; $("#teacherThread").innerHTML = '<div class="empty-state">Choisissez un groupe.</div>'; return; }
    const seats = w.seats.filter(s => s.displayName || messagesOf(s.id).length);
    if (T.thread && !w.seats.some(s => s.id === T.thread)) T.thread = null;
    list.innerHTML = `<button class="conversation-item ${T.thread === "__all" ? "active" : ""}" data-thread="__all"><strong>📣 Tout le groupe</strong><br><small>Message à tous les inscrits</small></button>`
      + (seats.length ? seats.map(s => { const u = unreadOf(s.id); const last = messagesOf(s.id).slice(-1)[0]; return `<button class="conversation-item ${T.thread === s.id ? "active" : ""}" data-thread="${s.id}"><strong>${esc(seatName(s))}</strong>${u ? `<span class="nav-badge on">${u}</span>` : ""}<br><small>${last ? esc(last.text.slice(0, 40)) : "Code " + esc(s.seatCode)}</small></button>`; }).join("") : '<div class="empty-state small">Aucun participant inscrit.</div>');
    const th = $("#teacherThread");
    if (!T.thread) { th.innerHTML = '<div class="empty-state">Choisissez une conversation.</div>'; th.dataset.thread = ""; return; }
    const ms = T.thread === "__all" ? [] : messagesOf(T.thread);
    const who = m => m.from === "teacher" ? "Vous" : m.from === "system" ? "Simulateur" : esc(seatName(w.seats.find(s => s.id === T.thread) || {}));
    const msgsHTML = T.thread === "__all" ? '<div class="empty-state small">Le message sera envoyé à chaque participant inscrit du groupe.</div>' : ms.length ? ms.map(m => `<div class="bubble ${m.from === "teacher" ? "me" : "them"} ${m.from === "system" ? "auto" : ""}"><div class="bubble-meta">${who(m)} · ${timeAgo(m.createdAt)}</div><strong>${esc(m.subject || "Message")}</strong><br>${esc(m.text).replace(/\n/g, "<br>")}</div>`).join("") : '<div class="empty-state small">Aucun message.</div>';
    const unread = ms.filter(m => m.from === "student" && !m.readByTeacher).map(m => m.id);
    if (unread.length) T.store.markRead(w.id, T.thread, unread, "teacher").catch(() => {});
    if (th.dataset.thread === T.thread && th.querySelector(".thread-compose")) {
      // même conversation : on ne touche pas à la zone de saisie (brouillon et curseur conservés)
      const tm = th.querySelector(".thread-messages"); tm.innerHTML = msgsHTML; tm.scrollTop = tm.scrollHeight;
      if (!th.querySelector(".quick-replies").contains(document.activeElement)) th.querySelector(".quick-replies").innerHTML = qrPicker();
      return;
    }
    th.dataset.thread = T.thread;
    th.innerHTML = `<div class="thread-messages">${msgsHTML}</div>
      <div class="thread-compose"><div class="quick-replies">${qrPicker()}</div>
      <label class="sr-only" for="teacherReplyText">Votre message</label><textarea id="teacherReplyText" rows="3" placeholder="Écrire une réponse… (Ctrl + Entrée pour envoyer)"></textarea>
      <button class="cyber-btn primary" id="sendTeacherReply">Envoyer</button></div>`;
    const tm = th.querySelector(".thread-messages"); tm.scrollTop = tm.scrollHeight;
  }
  async function sendReply() {
    const w = active(); const ta = $("#teacherReplyText"); const text = ta.value.trim();
    if (!w || !text || !T.thread) return;
    const targets = T.thread === "__all" ? w.seats.filter(s => s.displayName).map(s => s.id) : [T.thread];
    if (!targets.length) return toast("Aucun participant inscrit dans ce groupe.", "bad");
    const cat = T.qrPicked ? AN.quickReplies.category(T.qrPicked) : null;
    const subject = cat && !["formateur", "perso"].includes(cat.id) ? cat.subject : (T.thread === "__all" ? "Message du formateur (à tout le groupe)" : "Message du formateur");
    ta.value = ""; T.qrPicked = null;
    try {
      await Promise.all(targets.map(sid => T.store.sendMessage(w.id, sid, AN.model.newMessage({ workshopId: w.id, seatId: sid, teacherUid: w.teacherUid, from: "teacher", subject, text }))));
      if (T.thread === "__all") toast(`Message envoyé à ${targets.length} participant(s).`, "good");
    } catch (e) { ta.value = text; toast(e.message, "bad"); }
  }

  /* ======================= STATISTIQUES ======================= */
  function renderStats() {
    const w = active();
    const scope = $("#statsScope").value;
    const ws = scope === "all" ? groups() : w ? [w] : [];
    const seats = ws.flatMap(g => g.seats.filter(s => s.displayName).map(s => ({ ...s, wname: g.name })));
    const ids = new Set(seats.map(s => s.id));
    const ms = T.data.missions.filter(m => ids.has(m.seatId));
    const done = ms.filter(m => m.status === "done");
    const scored = done.filter(m => m.score?.total);
    const avgQuiz = scored.length ? Math.round(scored.reduce((a, m) => a + m.score.score / m.score.total, 0) / scored.length * 100) : 0;
    const progress = seats.map(s => seatProgress(s.id));
    const set = (id, v) => { $("#" + id).textContent = v; };
    set("statProgress", (progress.length ? Math.round(progress.reduce((a, p) => a + p.p, 0) / progress.length) : 0) + "%");
    set("statCompleted", pct(done.length, ms.length) + "%");
    set("statQuiz", avgQuiz + "%");
    set("statAttention", progress.filter(p => p.total && p.p < 50).length);

    $("#statsParticipants").innerHTML = seats.length ? seats.map(s => { const p = seatProgress(s.id); return `<div class="stats-participant-row"><div class="who"><strong>${esc(s.displayName)}</strong><small>${esc(s.wname)} · ${p.done}/${p.total} missions</small></div><div class="progress-track"><span style="width:${p.p}%"></span></div><div class="stats-percent">${p.p}%</div></div>`; }).join("") : '<div class="stats-empty">Aucune statistique pour le moment.</div>';

    const byType = {};
    ms.forEach(m => { const b = (byType[m.type] ||= { n: 0, done: 0, sc: 0, st: 0 }); b.n++; if (m.status === "done") b.done++; if (m.score?.total) { b.sc += m.score.score; b.st += m.score.total; } });
    const rows = Object.entries(byType).sort((a, b) => b[1].n - a[1].n);
    $("#statsMissions").innerHTML = rows.length ? `<table class="cyber-table"><thead><tr><th>Mission</th><th>Attribuées</th><th>Terminées</th><th>Réussite quiz</th></tr></thead><tbody>${rows.map(([t, b]) => `<tr><td>${C.icon(t)} ${esc(C.missions[t]?.short || t)}</td><td>${b.n}</td><td>${pct(b.done, b.n)}%</td><td>${b.st ? pct(b.sc, b.st) + "%" : "—"}</td></tr>`).join("")}</tbody></table>` : '<div class="stats-empty">Aucune mission attribuée.</div>';
  }
  function exportCsv() {
    const rows = [["Groupe", "Code groupe", "Participant (pseudo)", "Niveau", "Mission", "Niveau mission", "Statut", "Score quiz", "Terminée le"]];
    groups().forEach(w => w.seats.filter(s => s.displayName).forEach(s => {
      const ms = missionsOf(s.id);
      if (!ms.length) rows.push([w.name, w.code, s.displayName, levelName(s.level), "", "", "", "", ""]);
      ms.forEach(m => rows.push([w.name, w.code, s.displayName, levelName(s.level), missionLabel(m), levelName(m.level), m.status === "done" ? "terminée" : m.status === "in_progress" ? "en cours" : "à faire", m.score?.total ? `${m.score.score}/${m.score.total}` : "", m.completedAt ? new Date(m.completedAt).toLocaleDateString("fr-FR") : ""]));
    }));
    const csv = "﻿" + rows.map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(";")).join("\r\n");
    AN.util.downloadBlob(`bilan_atelier_${new Date().toISOString().slice(0, 10)}.csv`, new Blob([csv], { type: "text/csv;charset=utf-8" }));
  }

  /* ======================= ANALYTICS — Points forts/faibles ======================= */
  function renderAnalytics() {
    const participants = [];
    groups().forEach(w => w.seats.filter(s => s.displayName).forEach(s => {
      participants.push({ id: s.id, name: s.displayName, wid: w.id, group: w.name });
    }));

    const sel = $("#analyticsParticipant");
    const selected = sel.value;
    sel.innerHTML = participants.length
      ? `<option value="">Sélectionnez un participant…</option>` + participants.map(p => `<option value="${p.id}">${esc(p.name)} (${esc(p.group)})</option>`).join("")
      : `<option value="">Aucun participant</option>`;
    if (selected && participants.some(p => p.id === selected)) sel.value = selected;

    if (!selected) {
      $("#analyticsContent").classList.add("hidden");
      $("#analyticsNotAvailable").classList.remove("hidden");
      return;
    }

    const p = participants.find(x => x.id === selected);
    if (!p) return;

    const missions = missionsOf(p.id);
    if (!missions.length) {
      $("#analyticsContent").classList.add("hidden");
      $("#analyticsNotAvailable").textContent = "Aucune mission attribuée à ce participant.";
      return;
    }

    // Analyser toutes les missions terminées
    const completed = missions.filter(m => m.status === "done");
    if (!completed.length) {
      $("#analyticsContent").classList.add("hidden");
      $("#analyticsNotAvailable").textContent = "Aucune mission terminée. Les analyses apparaîtront après completion.";
      return;
    }

    const avgTime = Math.round(completed.reduce((s, m) => s + (m.completedAt - m.startedAt), 0) / completed.length / 1000 / 60);
    const quizzes = completed.filter(m => m.score?.total);
    const avgQuizScore = quizzes.length ? Math.round(quizzes.reduce((s, m) => s + (m.score.score / m.score.total) * 100, 0) / quizzes.length) : 0;
    const helpUsed = missions.filter(m => m.hints > 0).length;
    const avgHints = missions.filter(m => m.hints > 0).reduce((s, m) => s + m.hints, 0) / Math.max(1, missions.filter(m => m.hints > 0).length);

    // Génération des recommandations
    const strengths = [];
    const weaknesses = [];

    if (avgTime < 5) strengths.push("💨 Exécution très rapide");
    else if (avgTime > 15) weaknesses.push("⏱ Travail ralenti, considérer du soutien");

    if (avgQuizScore > 80) strengths.push("✨ Excellente compréhension");
    else if (avgQuizScore < 50) weaknesses.push("❓ Difficultés persistantes");
    else strengths.push("📚 Bonne progression");

    if (helpUsed === 0) strengths.push("🎯 Très autonome");
    else if (helpUsed > missions.length * 0.5) weaknesses.push("⚠️ Recours fréquent aux indices");

    const difficultMissions = missions.filter(m => m.score && m.score.score / m.score.total < 0.5);
    const strongMissions = missions.filter(m => m.score && m.score.score / m.score.total >= 0.8);

    // Affichage
    $("#analyticsContent").classList.remove("hidden");
    $("#analyticsNotAvailable").classList.add("hidden");

    const fmt = (s) => String(s).padStart(2, "0");
    const timeStr = avgTime > 60 ? `${fmt(Math.floor(avgTime/60))}:${fmt(avgTime%60)}` : `${avgTime}min`;

    $("#analyticTime").textContent = timeStr;
    $("#analyticAuto").textContent = helpUsed === 0 ? "100%" : Math.round((1 - helpUsed / missions.length) * 100) + "%";
    $("#analyticHesitation").textContent = missions.filter(m => (m.lastActivityAt - m.startedAt) / 1000 > 60).length + " pauses";
    $("#analyticErrors").textContent = difficultMissions.length > 0 ? (difficultMissions.length + " mission(s)") : "0%";

    $("#analyticsStrengths").innerHTML = strengths.length
      ? strengths.map(s => `<div class="analytics-item"><strong>${s}</strong></div>`).join("")
      : `<div class="analytics-item">Aucun point fort relevé pour le moment.</div>`;

    $("#analyticsWeaknesses").innerHTML = weaknesses.length
      ? weaknesses.map(w => `<div class="analytics-item weakness"><strong>${w}</strong></div>`).join("")
      : `<div class="analytics-item">Pas de domaine de progression identifié.</div>`;

    $("#analyticsDifficultSteps").innerHTML = difficultMissions.length
      ? difficultMissions.map(m => {
          const missionName = missionLabel(m);
          const score = m.score ? m.score.score + "/" + m.score.total : "—";
          const slowness = m.completedAt - m.startedAt > 600000 ? "1.5x+" : "1x";
          return `<div class="analytics-row"><span class="step-name">${esc(missionName)}</span><span>Niveau ${levelName(m.level)}</span><span class="slowness">${score}</span></div>`;
        }).join("")
      : `<div class="analytics-item">Très bonne maîtrise générale !</div>`;

    const recommendation = avgQuizScore > 75 && p.level === "beginner"
      ? `✅ Peut progresser vers <b>Intermédiaire</b>`
      : avgQuizScore < 50
      ? `📖 Reprendre les notions : ${difficultMissions.slice(0, 2).map(m => missionLabel(m)).join(", ")}`
      : difficultMissions.length > 0
      ? `📌 Focus sur : ${difficultMissions.map(m => missionLabel(m)).join(", ")}`
      : `👍 Progression normale. Continuer.`;

    $("#analyticsRecommendation").innerHTML = recommendation;
  }
  function exportAnalyticsCsv() {
    const participants = [];
    groups().forEach(w => w.seats.filter(s => s.displayName).forEach(s => {
      participants.push({ id: s.id, name: s.displayName, wid: w.id, group: w.name });
    }));
    const selected = $("#analyticsParticipant").value;
    if (!selected) return toast("Sélectionnez d'abord un participant.", "bad");
    const p = participants.find(x => x.id === selected);
    if (!p) return;
    const missions = missionsOf(p.id);
    if (!missions.length) return toast("Aucune mission pour ce participant.", "bad");

    const rows = [["Mission", "Niveau", "Statut", "Temps (min)", "Score quiz", "Indices utilisés", "Terminée le"]];
    missions.forEach(m => {
      const duration = m.completedAt && m.startedAt ? Math.round((m.completedAt - m.startedAt) / 1000 / 60) : "—";
      rows.push([
        missionLabel(m),
        levelName(m.level),
        m.status === "done" ? "terminée" : m.status === "in_progress" ? "en cours" : "à faire",
        duration,
        m.score?.total ? `${m.score.score}/${m.score.total}` : "—",
        m.hints || 0,
        m.completedAt ? new Date(m.completedAt).toLocaleDateString("fr-FR") : ""
      ]);
    });
    const csv = "﻿" + rows.map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(";")).join("\r\n");
    AN.util.downloadBlob(`analytics_${p.name}_${new Date().toISOString().slice(0, 10)}.csv`, new Blob([csv], { type: "text/csv;charset=utf-8" }));
  }

  /* ======================= RÉPONSES RAPIDES ======================= */
  function renderQuick() {
    const list = quickReplies();
    $("#quickReplyManager").innerHTML = AN.quickReplies.categories.map(c => {
      const items = list.map((r, i) => ({ r, i })).filter(x => x.r.cat === c.id);
      if (!items.length && c.id !== "perso") return "";
      return `<details class="qr-category" ${T.qrOpen?.has(c.id) ? "open" : ""} data-qr-cat="${c.id}">
        <summary><span>${esc(c.label)}</span><small>${items.length} réponse(s)</small></summary>
        <div class="qr-category-body">
          ${items.map(({ r, i }) => `<article><div class="qr-head"><strong>${esc(r.title)}</strong><span><button class="icon-btn" data-qr-edit="${i}" aria-label="Modifier ${esc(r.title)}">✎</button><button class="icon-btn danger-action" data-qr-del="${i}" aria-label="Supprimer ${esc(r.title)}">✕</button></span></div><p>${esc(r.text)}</p></article>`).join("") || '<div class="empty-state small">Aucune réponse personnelle pour l\'instant.</div>'}
          <button class="cyber-btn secondary qr-add" data-qr-add="${c.id}" type="button">+ Ajouter dans cette catégorie</button>
        </div></details>`;
    }).join("");
  }
  async function editQuick(i, cat = "perso") {
    const list = [...quickReplies()];
    const r = i == null ? { title: "", text: "", cat } : list[i];
    const title = await promptBox({ title: i == null ? "Nouvelle réponse rapide" : "Modifier la réponse", label: "Titre (court)", value: r.title });
    if (!title) return;
    const text = await promptBox({ title: "Texte du message", label: "Texte envoyé au participant ({date}, {date+15}, {num} et {code} sont remplis automatiquement)", value: r.text });
    if (!text) return;
    if (i == null) list.push({ cat, title, text }); else list[i] = { ...r, title, text };
    (T.qrOpen ||= new Set()).add(r.cat);
    await T.store.savePrefs(T.teacher.uid, { quickReplies: list }).catch(e => toast(e.message, "bad"));
  }

  /* ======================= LIAISON ======================= */
  function bind() {
    $$(".teacher-nav-btn").forEach(b => b.addEventListener("click", () => switchView(b.dataset.view)));
    $$("[data-jump]").forEach(b => b.addEventListener("click", () => switchView(b.dataset.jump)));
    $("#teacherLogoutBtn").addEventListener("click", stop);
    $("#newGroupBtn").addEventListener("click", () => { switchView("groups"); $("#workshopName").focus(); });
    $("#activeGroupSelect").addEventListener("change", e => { T.activeWid = e.target.value; T.thread = null; $("#teacherThread").dataset.thread = ""; render(); });
    $("#teacherGlobalSearch").addEventListener("input", renderDashboard);
    $("#groupFilterStatus").addEventListener("change", renderDashboard);
    $("#participantSearch").addEventListener("input", renderParticipants);
    $("#statsScope").addEventListener("change", renderStats);
    $("#exportCsvBtn").addEventListener("click", exportCsv);
    $("#analyticsParticipant").addEventListener("change", renderAnalytics);
    $("#exportAnalyticsBtn").addEventListener("click", exportAnalyticsCsv);
    $("#livePrint").addEventListener("click", () => active() && printCodes(active()));
    $("#liveProject").addEventListener("click", () => active() && project(active()));

    $("#createWorkshopBtn").addEventListener("click", async () => {
      const name = ($("#workshopName").value.trim() || "Groupe du " + new Date().toLocaleDateString("fr-FR")).slice(0, 60);
      const count = Number($("#seatCount").value);
      const btn = $("#createWorkshopBtn"); btn.disabled = true;
      try {
        const w = await T.store.createWorkshop(T.teacher.uid, { name, count });
        T.activeWid = w.id;
        $("#workshopInfo").innerHTML = `<strong>Groupe créé : ${esc(w.name)}</strong> — code atelier <b class="mono">${esc(w.code)}</b>. Imprimez les codes ou projetez le code de l'atelier.`;
        $("#workshopInfo").classList.remove("hidden");
        toast("Groupe créé.", "good");
      } catch (e) { toast(e.message, "bad", 8000); }
      finally { btn.disabled = false; }
    });

    // délégation : actions de groupes et de places (toutes vues confondues)
    $("#teacherDashboard").addEventListener("click", e => {
      const g = e.target.closest("[data-g]"); if (g) return groupAction(g.dataset.g, g.dataset.id);
      const chb = e.target.closest("[data-ch]"); if (chb) return chapterAction(chb.dataset.ch, chb.dataset.id, chb.dataset.lesson || null, chb.dataset.type || null);
      const s = e.target.closest("[data-s]"); if (s) { s.closest("details")?.removeAttribute("open"); return seatAction(s.dataset.s, s.dataset.id); }
      const t = e.target.closest(".conversation-item[data-thread]"); if (t) { T.thread = t.dataset.thread; return renderMessages(); }
      const qr = e.target.closest("[data-qr]"); if (qr) { const r = quickReplies()[qr.dataset.qr]; const ta = $("#teacherReplyText"); ta.value = AN.quickReplies.fill(r.text); T.qrPicked = r.cat; ta.focus(); return; }
      if (e.target.closest("#sendTeacherReply")) return sendReply();
      const dm = e.target.closest("[data-del-mission]");
      if (dm) {
        const w = active();
        return confirmBox({ title: "Retirer cette mission ?", text: "Elle disparaîtra de l'espace du participant.", ok: "Retirer", danger: true }).then(ok => ok && T.store.deleteMission(w.id, dm.dataset.seat, dm.dataset.delMission).catch(er => toast(er.message, "bad")));
      }
      const tp = e.target.closest("[data-tpl]");
      if (tp) {
        const t = T.data.templates.find(x => x.id === tp.dataset.id);
        if (tp.dataset.tpl === "edit") return openEditor(t);
        return confirmBox({ title: `Supprimer « ${t.title} » ?`, text: "Les missions déjà attribuées restent visibles chez les participants.", ok: "Supprimer", danger: true }).then(ok => ok && T.store.deleteTemplate(t.id));
      }
      const qe = e.target.closest("[data-qr-edit]"); if (qe) return editQuick(Number(qe.dataset.qrEdit));
      const qa = e.target.closest("[data-qr-add]"); if (qa) return editQuick(null, qa.dataset.qrAdd);
      const qd = e.target.closest("[data-qr-del]");
      if (qd) {
        const r = quickReplies()[Number(qd.dataset.qrDel)];
        return confirmBox({ title: `Supprimer « ${r.title} » ?`, ok: "Supprimer", danger: true }).then(ok => {
          if (!ok) return;
          (T.qrOpen ||= new Set()).add(r.cat);
          const list = quickReplies().filter((_, i) => i !== Number(qd.dataset.qrDel));
          return T.store.savePrefs(T.teacher.uid, { quickReplies: list }).catch(er => toast(er.message, "bad"));
        });
      }
    });
    $("#teacherDashboard").addEventListener("change", e => {
      const s = e.target.closest("[data-s-change]"); if (s) return seatAction(s.dataset.sChange, s.dataset.id, s.value);
      if (e.target.id === "assignAll") { $$("#assignSeats input").forEach(i => { i.checked = e.target.checked; }); return; }
      if (e.target.closest("#assignSeats")) return updateAssignAll();
      if (e.target.id === "missionTemplate") return describeChoice();
      if (e.target.id === "qrCat") { T.qrCat = e.target.value; e.target.closest(".quick-replies").innerHTML = qrPicker(); return $("#qrCat")?.focus(); }
    });
    $("#teacherDashboard").addEventListener("keydown", e => { if (e.target.id === "teacherReplyText" && e.key === "Enter" && (e.ctrlKey || e.metaKey)) { e.preventDefault(); sendReply(); } });
    $("#liveGrid").addEventListener("focusout", () => setTimeout(() => { if (T.pendingLive && T.view === "live") renderLive(); }, 50));
    $("#liveGrid").addEventListener("toggle", e => { if (!e.target.open && T.pendingLive) setTimeout(renderLive, 50); }, true);
    $("#assignMissionBtn").addEventListener("click", assign);
    $("#newTemplateBtn").addEventListener("click", () => openEditor());
    $("#tplAddQuestion").addEventListener("click", () => {
      const n = $$("#tplQuestions .q-edit").length;
      if (n >= 6) return toast("6 questions maximum.", "info");
      $("#tplQuestions").insertAdjacentHTML("beforeend", questionEditor({}, n));
    });
    $("#tplQuestions").addEventListener("click", e => { if (e.target.closest("[data-q-remove]")) e.target.closest(".q-edit").remove(); });
    $("#tplSave").addEventListener("click", saveTemplate);
    $("#tplCancel").addEventListener("click", () => { $("#tplEditor").classList.add("hidden"); T.editingTemplate = null; });
    $("#addQuickReply").addEventListener("click", () => editQuick(null, "perso"));
    $("#quickReplyManager").addEventListener("toggle", e => { const d = e.target.closest("[data-qr-cat]"); if (!d) return; T.qrOpen ||= new Set(); d.open ? T.qrOpen.add(d.dataset.qrCat) : T.qrOpen.delete(d.dataset.qrCat); }, true);
    $("#resetQuickReplies").addEventListener("click", async () => { if (await confirmBox({ title: "Rétablir les réponses par défaut ?", ok: "Rétablir" })) T.store.savePrefs(T.teacher.uid, { quickReplies: [] }); });
  }

  /* Index Firestore manquant : on affiche le lien de création en un clic */
  const indexLinks = new Set();
  AN.on("index-needed", url => {
    indexLinks.add(url);
    const box = $("#setupAlerts");
    box.innerHTML = `<strong>⚙ Réglage Firebase à terminer (une seule fois)</strong>
      <p>Firebase a besoin de ${indexLinks.size > 1 ? indexLinks.size + " index" : "un index"} pour suivre vos groupes en direct. Cliquez sur ${indexLinks.size > 1 ? "chaque lien" : "le lien"}, puis sur <b>Enregistrer</b> dans la console Firebase. Patientez quelques minutes, puis rechargez cette page.</p>
      <ol>${[...indexLinks].map((u, i) => `<li><a href="${esc(u)}" target="_blank" rel="noopener">Créer l'index n°${i + 1} ↗</a></li>`).join("")}</ol>`;
    box.classList.remove("hidden");
  });

  AN.teacher = { bind, start, stop, state: T };
})(window.AN);

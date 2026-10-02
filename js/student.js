/* =========================================================
   Espace participant
   ========================================================= */
(function (AN) {
  "use strict";
  const { $, esc, levelName, toast, show, timeAgo } = AN.util;
  const C = AN.catalog;
  const SESSION = "an_student_session";

  const state = {
    store: null, uid: null, workshop: null, seat: null,
    missions: [], messages: [], achievements: [],
    unsubs: [], heartbeat: null, knownMsg: null, returnToMission: false, currentMissionId: null
  };

  /* ---------- connexion ---------- */
  async function join(workshopCode, seatCode, { silent = false } = {}) {
    const key = AN.model.joinKey(workshopCode, seatCode);
    let store;
    if (AN.DemoStore.hasJoinKey(key)) store = AN.DemoStore;
    else if (AN.FirebaseStore.isConfigured()) store = AN.FirebaseStore;
    else throw new Error("Codes non reconnus. Vérifiez les chiffres.");
    const r = await store.claimSeat(workshopCode, seatCode);
    Object.assign(state, { store, uid: r.uid, workshop: r.workshop, seat: r.seat, knownMsg: null });
    try { sessionStorage.setItem(SESSION, JSON.stringify({ workshopCode, seatCode })); } catch (e) {}
    startWatchers();
    document.body.classList.add("student-on");
    if (state.seat.displayName) { show("studentDashboard"); renderDashboard(); if (!silent) toast(`Bon retour, ${state.seat.displayName} !`, "good"); }
    else show("studentName");
  }

  function startWatchers() {
    stopWatchers();
    const { store, workshop, seat } = state;
    state.unsubs.push(store.watchSeat(workshop.id, seat.id, s => {
      const helpResolved = state.seat?.help?.requested && !s.help?.requested;
      state.seat = s;
      if (helpResolved) toast("Le formateur a vu votre demande d'aide 👋", "good", 6000);
      renderHelpButton();
    }, () => kicked()));
    state.unsubs.push(store.watchStudent(workshop.id, seat.id, d => {
      if (d.workshop) state.workshop = d.workshop;
      state.missions = d.missions;
      state.achievements = d.achievements;
      const incoming = d.messages.filter(m => m.from !== "student");
      if (state.knownMsg) {
        incoming.filter(m => !state.knownMsg.has(m.id)).forEach(m => toast(`📬 Nouveau message : ${m.subject}`, "info", 6000));
      }
      state.knownMsg = new Set(incoming.map(m => m.id));
      state.messages = d.messages.sort((a, b) => a.createdAt - b.createdAt);
      refreshVisible();
    }));
    const beat = () => store.updateMySeat(workshop.id, seat.id, { lastSeen: Date.now() }).catch(() => {});
    state.heartbeat = setInterval(beat, 40000);
  }
  function stopWatchers() {
    state.unsubs.forEach(u => { try { u(); } catch (e) {} });
    state.unsubs = [];
    clearInterval(state.heartbeat);
  }
  function reset() {
    stopWatchers();
    AN.missions.close();
    Object.assign(state, { store: null, uid: null, workshop: null, seat: null, missions: [], messages: [], achievements: [], knownMsg: null, currentMissionId: null });
    try { sessionStorage.removeItem(SESSION); } catch (e) {}
    document.body.classList.remove("student-on");
    renderHelpButton();
  }
  function kicked() {
    if (!state.seat) return;
    reset();
    show("studentJoin");
    const m = $("#studentJoinMsg");
    m.className = "msg bad";
    m.textContent = "Votre session a été fermée (par le formateur, ou parce que votre code a été utilisé sur un autre poste). Vous pouvez vous reconnecter avec vos codes.";
  }
  async function leave() {
    if (state.store && state.seat) await state.store.updateMySeat(state.workshop.id, state.seat.id, { lastSeen: 0, activity: null }).catch(() => {});
    await state.store?.leave();
    reset();
    show("landing");
  }
  async function resume() {
    let s = null;
    try { s = JSON.parse(sessionStorage.getItem(SESSION)); } catch (e) {}
    if (!s) return false;
    try { await join(s.workshopCode, s.seatCode, { silent: true }); return true; } catch (e) { try { sessionStorage.removeItem(SESSION); } catch (er) {} return false; }
  }

  /* ---------- API utilisée par les missions ---------- */
  const W = () => [state.workshop.id, state.seat.id];
  async function updateMission(mid, patch) {
    const m = state.missions.find(x => x.id === mid); if (m) Object.assign(m, patch);
    await state.store.updateMission(...W(), mid, patch);
  }
  async function addAchievement(key, label) { await state.store.addAchievement(...W(), key, label); }
  async function sendSystemMessage(subject, text) {
    const msg = AN.model.newMessage({ workshopId: state.workshop.id, seatId: state.seat.id, teacherUid: state.workshop.teacherUid, from: "system", subject, text });
    await state.store.sendMessage(...W(), msg);
  }
  function reportActivity(m, step, total) {
    if (!state.seat) return;
    state.store.updateMySeat(...W(), { lastSeen: Date.now(), activity: { missionId: m.id, type: m.type, label: m.type === "custom" ? (m.custom?.title || C.label("custom")) : C.missions[m.type]?.short || m.type, step, total, at: Date.now() } }).catch(() => {});
  }
  async function saveQuizHistory(h) {
    if (!state.seat) return;
    state.seat.quizHistory = h;
    await state.store.updateMySeat(...W(), { quizHistory: h }).catch(() => {});
  }

  /* ---------- demande d'aide ---------- */
  function renderHelpButton() {
    const b = $("#helpBtn"); if (!b) return;
    const on = !!state.seat && !!state.seat.displayName;
    b.classList.toggle("hidden", !on);
    const req = !!state.seat?.help?.requested;
    b.classList.toggle("waiting", req);
    b.innerHTML = req ? "⏳ Le formateur arrive…<small>Toucher pour annuler</small>" : "✋ J'ai besoin d'aide";
    b.setAttribute("aria-pressed", req ? "true" : "false");
  }
  async function toggleHelp() {
    if (!state.seat) return;
    const req = !state.seat.help?.requested;
    const act = state.seat.activity;
    const help = req ? { requested: true, at: Date.now(), where: act?.label || "Mon espace" } : null;
    state.seat.help = help;
    renderHelpButton();
    await state.store.updateMySeat(...W(), { help, lastSeen: Date.now() }).catch(e => toast(e.message, "bad"));
    toast(req ? "Demande envoyée au formateur. Il arrive !" : "Demande d'aide annulée.", req ? "good" : "info");
  }

  /* ---------- tableau de bord ---------- */
  function orderedMissions() {
    const ms = [...state.missions];
    const groups = {};
    ms.filter(m => m.parcoursId).forEach(m => (groups[m.parcoursId] ||= []).push(m));
    Object.values(groups).forEach(g => g.sort((a, b) => a.order - b.order));
    const locked = new Set();
    Object.values(groups).forEach(g => g.forEach((m, i) => { if (g.slice(0, i).some(x => x.status !== "done")) locked.add(m.id); }));
    const solo = ms.filter(m => !m.parcoursId).sort((a, b) => (a.status === "done") - (b.status === "done") || b.createdAt - a.createdAt);
    return { groups, solo, locked };
  }
  function missionCard(m, locked, prevLabel) {
    const label = m.type === "custom" ? (m.custom?.title || C.label("custom")) : C.label(m.type);
    const status = m.status === "done" ? `<span class="status-tag done">✓ Terminée</span>` : m.status === "in_progress" ? `<span class="status-tag doing">En cours</span>` : `<span class="status-tag">À commencer</span>`;
    return `<article class="mission-card ${m.status !== "done" && !locked ? "active" : ""} ${locked ? "locked" : ""}">
      <div class="mission-card-icon" aria-hidden="true">${locked ? "🔒" : C.icon(m.type)}</div>
      <div class="mission-card-main"><strong>${esc(label)}</strong>
        <div><span class="level-tag">${esc(levelName(m.level))}</span> ${status}${m.score?.total ? ` <span class="status-tag">Quiz ${m.score.score}/${m.score.total}</span>` : ""}</div>
        ${locked ? `<small>Se débloque après : ${esc(prevLabel)}</small>` : ""}
      </div>
      ${locked ? "" : `<button type="button" class="${m.status === "done" ? "secondary" : "primary"}" data-open-mission="${m.id}">${m.status === "done" ? "Revoir" : m.status === "in_progress" ? "Continuer" : "Commencer"}</button>`}
    </article>`;
  }
  function renderDashboard() {
    if (!state.seat) return;
    document.querySelectorAll("[data-student-name]").forEach(e => e.textContent = state.seat.displayName || "");
    $("#studentWorkshopLabel").textContent = `${state.workshop?.name || "Atelier"} · niveau ${levelName(state.seat.level || "beginner")}`;
    const { groups, solo, locked } = orderedMissions();
    const parts = [];
    Object.values(groups).forEach(g => {
      const done = g.filter(m => m.status === "done").length;
      parts.push(`<div class="parcours-block"><div class="parcours-head"><strong>${esc(g[0].parcoursLabel || "Parcours")}</strong><span>${done} / ${g.length}</span></div>
        <div class="progress-track light"><span style="width:${(done / g.length) * 100}%"></span></div>
        ${g.map((m, i) => missionCard(m, locked.has(m.id), i ? (m.type === "custom" ? "" : C.missions[g[i - 1].type]?.short) : "")).join("")}</div>`);
    });
    solo.forEach(m => parts.push(missionCard(m, false)));
    $("#studentMissions").innerHTML = parts.length ? parts.join("") : `<div class="empty-mission"><div class="big">☕</div><p>Aucune mission pour le moment.<br>Le formateur va vous en attribuer une : elle apparaîtra ici automatiquement.</p></div>`;

    const unread = state.messages.filter(m => m.from !== "student" && !m.readByStudent).length;
    $("#studentUnread").textContent = unread ? `${unread} nouveau${unread > 1 ? "x" : ""}` : "à jour";
    $("#studentUnread").classList.toggle("alert-pill", unread > 0);
    const last = state.messages.slice(-3).reverse();
    $("#studentMessagesPreview").innerHTML = last.length ? last.map(m => `<div class="message-box ${m.from !== "student" && !m.readByStudent ? "unread" : ""}"><strong>${esc(m.subject || "Message")}</strong><br><small>${esc(m.text.slice(0, 100))}${m.text.length > 100 ? "…" : ""}</small></div>`).join("") : "<p class='muted'>Aucun message.</p>";

    const a = state.achievements;
    $("#studentAchievements").innerHTML = a.length
      ? a.sort((x, y) => (x.at || 0) - (y.at || 0)).map(x => `<div class="achievement done"><b>✓ ${esc(x.label)}</b><span>${x.at ? new Date(x.at).toLocaleDateString("fr-FR") : "Réussi"}</span></div>`).join("")
      : '<div class="achievement"><b>Votre carnet est vide</b><span>Vos réussites apparaîtront ici.</span></div>';
    $("#printCarnetBtn").classList.toggle("hidden", !state.missions.some(m => m.status === "done"));
  }

  function refreshVisible() {
    const screen = document.body.dataset.screen;
    if (screen === "studentDashboard") renderDashboard();
    if (screen === "studentMessages") renderMessages();
  }

  /* ---------- mission ---------- */
  function openMission(id) {
    const m = state.missions.find(x => x.id === id);
    if (!m) return;
    state.currentMissionId = id;
    show("missionScreen");
    AN.missions.open(m);
  }
  function backToDashboard() {
    AN.missions.close();
    state.currentMissionId = null;
    state.store?.updateMySeat(...W(), { activity: null, lastSeen: Date.now() }).catch(() => {});
    show("studentDashboard");
    renderDashboard();
  }

  /* ---------- messagerie ---------- */
  function openMessages(fromMission = false) {
    state.returnToMission = fromMission && !!state.currentMissionId;
    $("#messagesBack").textContent = state.returnToMission ? "← Revenir à ma mission" : "← Mon espace";
    show("studentMessages");
    renderMessages();
  }
  function renderMessages() {
    const who = m => m.from === "teacher" ? "Formateur" : m.from === "system" ? "Service (simulation)" : "Moi";
    $("#studentThread").innerHTML = state.messages.length
      ? state.messages.map(m => `<div class="bubble ${m.from === "student" ? "me" : "them"} ${m.from === "system" ? "auto" : ""}"><div class="bubble-meta">${who(m)} · ${timeAgo(m.createdAt)}</div><strong>${esc(m.subject || "Message")}</strong><br>${esc(m.text).replace(/\n/g, "<br>")}</div>`).join("")
      : '<div class="empty-state">Aucun message pour le moment.</div>';
    const th = $("#studentThread"); th.scrollTop = th.scrollHeight;
    const unread = state.messages.filter(m => m.from !== "student" && !m.readByStudent).map(m => m.id);
    if (unread.length) state.store.markRead(...W(), unread, "student").catch(() => {});
  }
  async function sendStudentMessage() {
    const ta = $("#studentReplyText");
    const t = ta.value.trim(); if (!t) return;
    const msg = AN.model.newMessage({ workshopId: state.workshop.id, seatId: state.seat.id, teacherUid: state.workshop.teacherUid, from: "student", subject: "Message de " + state.seat.displayName, text: t });
    ta.value = "";
    await state.store.sendMessage(...W(), msg).catch(e => toast(e.message, "bad"));
  }

  /* ---------- fiche-mémo ---------- */
  function printMemo(missions) {
    const blocks = missions.map(m => {
      const label = m.type === "custom" ? (m.custom?.title || "Mission personnalisée") : C.label(m.type);
      const pts = C.memos[m.type] || [];
      return `<section class="memo-block"><h2>${C.icon(m.type)} ${esc(label)}</h2><ul>${pts.map(p => `<li>${esc(p)}</li>`).join("")}</ul></section>`;
    }).join("");
    AN.util.printHTML(`<div class="memo-sheet"><header><h1>Ce que j'ai appris</h1><p>${esc(state.seat?.displayName || "")} — ${esc(state.workshop?.name || "Atelier numérique")} — ${new Date().toLocaleDateString("fr-FR")}</p></header>${blocks}<footer>Atelier numérique · Médiathèque — À garder près de l'ordinateur ✂</footer></div>`);
  }

  /* ---------- liaison de l'interface ---------- */
  function bind() {
    const doJoin = async () => {
      const msg = $("#studentJoinMsg"); msg.className = "msg"; msg.textContent = "";
      const wc = $("#joinWorkshopCode").value.replace(/\D/g, ""), sc = $("#joinSeatCode").value.replace(/\D/g, "");
      if (wc.length !== 6 || sc.length !== 4) { msg.className = "msg bad"; msg.textContent = "Le code de l'atelier a 6 chiffres et votre code participant en a 4."; return; }
      const btn = $("#joinStudentBtn"); btn.disabled = true; btn.textContent = "Connexion…";
      try { await join(wc, sc); } catch (e) { msg.className = "msg bad"; msg.textContent = e.message; }
      finally { btn.disabled = false; btn.textContent = "Continuer"; }
    };
    $("#joinStudentBtn").addEventListener("click", doJoin);
    ["#joinWorkshopCode", "#joinSeatCode"].forEach(s => $(s).addEventListener("keydown", e => { if (e.key === "Enter") doJoin(); }));
    $("#joinWorkshopCode").addEventListener("input", e => { e.target.value = e.target.value.replace(/\D/g, "").slice(0, 6); if (e.target.value.length === 6) $("#joinSeatCode").focus(); });
    $("#joinSeatCode").addEventListener("input", e => { e.target.value = e.target.value.replace(/\D/g, "").slice(0, 4); });

    const saveName = async () => {
      const name = $("#studentDisplayName").value.trim().replace(/\s+/g, " ").slice(0, 30);
      const msg = $("#studentNameMsg");
      if (!name) { msg.className = "msg bad"; msg.textContent = "Écrivez un prénom ou un pseudo."; return; }
      state.seat.displayName = name;
      try { await state.store.updateMySeat(...W(), { displayName: name, lastSeen: Date.now() }); }
      catch (e) { msg.className = "msg bad"; msg.textContent = e.message; return; }
      show("studentDashboard"); renderDashboard(); renderHelpButton();
    };
    $("#saveStudentNameBtn").addEventListener("click", saveName);
    $("#studentDisplayName").addEventListener("keydown", e => { if (e.key === "Enter") saveName(); });

    $("#studentLogoutBtn").addEventListener("click", leave);
    $("#studentMissions").addEventListener("click", e => { const b = e.target.closest("[data-open-mission]"); if (b) openMission(b.dataset.openMission); });
    $("#openMessagesBtn").addEventListener("click", () => openMessages(false));
    $("#backStudentDash").addEventListener("click", backToDashboard);
    $("#missionRestart").addEventListener("click", async () => { if (await AN.util.confirmBox({ title: "Recommencer la mission ?", text: "Vous repartirez de la première étape.", ok: "Recommencer" })) AN.missions.restart(); });
    $("#missionInbox").addEventListener("click", () => openMessages(true));
    $("#messagesBack").addEventListener("click", () => {
      if (state.returnToMission && state.currentMissionId) { show("missionScreen"); const m = state.missions.find(x => x.id === state.currentMissionId); if (m) AN.missions.open(m); }
      else backToDashboard();
    });
    $("#sendStudentReply").addEventListener("click", sendStudentMessage);
    $("#studentReplyText").addEventListener("keydown", e => { if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) sendStudentMessage(); });
    $("#helpBtn").addEventListener("click", toggleHelp);
    $("#printCarnetBtn").addEventListener("click", () => printMemo(state.missions.filter(m => m.status === "done")));
    document.addEventListener("visibilitychange", () => { if (!document.hidden && state.seat) state.store.updateMySeat(...W(), { lastSeen: Date.now() }).catch(() => {}); });
  }

  AN.student = { state, bind, resume, reset, join, updateMission, addAchievement, sendSystemMessage, reportActivity, saveQuizHistory, backToDashboard, openMessages, printMemo, renderDashboard };
})(window.AN);

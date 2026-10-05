/* =========================================================
   Modèle commun + magasin de données "démonstration"
   Tout est stocké dans le localStorage du navigateur.
   Les autres onglets sont prévenus en direct (événement storage),
   ce qui permet de tester formateur + participants sur un seul PC.
   ========================================================= */
(function (AN) {
  "use strict";
  const { uid, randomDigits } = AN.util;

  /* ---------- modèle partagé par les deux magasins ---------- */
  AN.model = {
    MAX_SEATS: 12,
    joinKey: (workshopCode, seatCode) => `${workshopCode}-${seatCode}`,
    newSeat(workshop, index, usedCodes) {
      let seatCode = randomDigits(4);
      while (usedCodes.has(seatCode)) seatCode = randomDigits(4);
      usedCodes.add(seatCode);
      return {
        id: uid(), workshopId: workshop.id, teacherUid: workshop.teacherUid, index,
        seatCode, joinKey: AN.model.joinKey(workshop.code, seatCode),
        displayName: "", claimed: false, studentUid: "", level: "beginner",
        lastSeen: 0, activity: null, help: null, quizHistory: {}, createdAt: Date.now()
      };
    },
    newMission({ workshopId, seatId, teacherUid, type, level, parcoursId = "", parcoursLabel = "", order = 0, custom = null }) {
      const now = Date.now();
      return {
        id: uid(), workshopId, seatId, teacherUid, type, level,
        status: "assigned", step: 0, createdAt: now + order, updatedAt: now,
        parcoursId, parcoursLabel, order, custom, score: null
      };
    },
    newMessage({ workshopId, seatId, teacherUid, from, subject, text }) {
      return {
        id: uid(), workshopId, seatId, teacherUid, from,
        subject: String(subject || "Message").slice(0, 120),
        text: String(text || "").slice(0, 2000),
        createdAt: Date.now(),
        readByStudent: from === "student",
        readByTeacher: from !== "student"
      };
    }
  };

  /* ---------- stockage local ---------- */
  const KEY = "atelierNumeriqueV8";
  const empty = () => ({ workshops: {}, seats: {}, missions: {}, messages: {}, achievements: {}, templates: {}, prefs: {}, joinKeys: {}, games: {}, gameAnswers: {} });
  function load() {
    try {
      const d = JSON.parse(localStorage.getItem(KEY));
      if (d && d.workshops) return Object.assign(empty(), d);
    } catch (e) { /* données illisibles : on repart de zéro */ }
    return empty();
  }
  let db = load();
  const subs = new Set();
  const clone = o => (o == null ? o : JSON.parse(JSON.stringify(o)));
  function notify() { subs.forEach(fn => { try { fn(); } catch (e) { console.error(e); } }); }
  function commit() {
    try { localStorage.setItem(KEY, JSON.stringify(db)); } catch (e) { console.warn("Stockage local impossible", e); }
    notify();
  }
  window.addEventListener("storage", e => { if (e.key === KEY) { db = load(); notify(); } });
  function watch(compute, cb) {
    let last = "";
    const run = () => {
      const v = compute();
      const s = JSON.stringify(v);
      if (s !== last) { last = s; cb(clone(v)); }
    };
    subs.add(run);
    setTimeout(run, 0);
    return () => subs.delete(run);
  }
  const values = o => Object.values(o || {});
  const achKey = (wid, sid) => `${wid}/${sid}`;

  function studentUid() {
    let id = null;
    try { id = sessionStorage.getItem("an_demo_uid"); } catch (e) {}
    if (!id) { id = "demo-student-" + uid().slice(0, 8); try { sessionStorage.setItem("an_demo_uid", id); } catch (e) {} }
    return id;
  }

  const S = {
    mode: "demo",
    label: "Mode démonstration",
    async init() {},
    currentUid: null,

    /* ===== Formateur ===== */
    async teacherSignIn() { S.currentUid = "demo-teacher"; return { uid: "demo-teacher", email: "demo@atelier.local", demo: true }; },
    async signOut() { S.currentUid = null; },

    watchTeacher(teacherUid, cb) {
      return watch(() => {
        const workshops = values(db.workshops).filter(w => w.teacherUid === teacherUid).map(w => ({
          ...w, seats: values(db.seats).filter(s => s.workshopId === w.id).sort((a, b) => a.index - b.index)
        }));
        const ids = new Set(workshops.map(w => w.id));
        return {
          workshops,
          missions: values(db.missions).filter(m => ids.has(m.workshopId)),
          messages: values(db.messages).filter(m => ids.has(m.workshopId)),
          templates: values(db.templates).filter(t => t.teacherUid === teacherUid),
          prefs: db.prefs[teacherUid] || {}
        };
      }, cb);
    },

    async createWorkshop(teacherUid, { name, count }) {
      let code = randomDigits(6);
      while (values(db.workshops).some(w => w.code === code)) code = randomDigits(6);
      const w = { id: uid(), code, name, teacherUid, createdAt: Date.now(), favorite: false, archived: false, order: Date.now() };
      db.workshops[w.id] = w;
      const used = new Set();
      for (let i = 0; i < count; i++) {
        const s = AN.model.newSeat(w, i, used);
        db.seats[s.id] = s;
        db.joinKeys[s.joinKey] = { workshopId: w.id, seatId: s.id, teacherUid };
      }
      commit();
      return clone(w);
    },
    async updateWorkshop(wid, patch) { if (db.workshops[wid]) { Object.assign(db.workshops[wid], patch); commit(); } },
    async deleteWorkshop(wid) {
      values(db.seats).filter(s => s.workshopId === wid).forEach(s => { delete db.joinKeys[s.joinKey]; delete db.seats[s.id]; delete db.achievements[achKey(wid, s.id)]; });
      Object.keys(db.missions).forEach(id => { if (db.missions[id].workshopId === wid) delete db.missions[id]; });
      Object.keys(db.messages).forEach(id => { if (db.messages[id].workshopId === wid) delete db.messages[id]; });
      delete db.workshops[wid];
      commit();
    },
    async addSeat(wid) {
      const w = db.workshops[wid]; if (!w) return;
      const seats = values(db.seats).filter(s => s.workshopId === wid);
      if (seats.length >= AN.model.MAX_SEATS) throw new Error(`Un groupe compte au maximum ${AN.model.MAX_SEATS} places.`);
      const s = AN.model.newSeat(w, Math.max(-1, ...seats.map(x => x.index)) + 1, new Set(seats.map(x => x.seatCode)));
      db.seats[s.id] = s;
      db.joinKeys[s.joinKey] = { workshopId: wid, seatId: s.id, teacherUid: w.teacherUid };
      commit();
    },
    async updateSeat(wid, sid, patch) { if (db.seats[sid]) { Object.assign(db.seats[sid], patch); commit(); } },
    async clearSeatData(wid, sid, { messages = false } = {}) {
      Object.keys(db.missions).forEach(id => { const m = db.missions[id]; if (m.seatId === sid) delete db.missions[id]; });
      if (messages) Object.keys(db.messages).forEach(id => { if (db.messages[id].seatId === sid) delete db.messages[id]; });
      delete db.achievements[achKey(wid, sid)];
      if (db.seats[sid]) Object.assign(db.seats[sid], { quizHistory: {}, activity: null, help: null });
      commit();
    },
    async regenerateSeat(wid, sid) {
      const w = db.workshops[wid], s = db.seats[sid]; if (!w || !s) return;
      await S.clearSeatData(wid, sid, { messages: true });
      const used = new Set(values(db.seats).filter(x => x.workshopId === wid).map(x => x.seatCode));
      let code = randomDigits(4); while (used.has(code)) code = randomDigits(4);
      delete db.joinKeys[s.joinKey];
      Object.assign(s, { seatCode: code, joinKey: AN.model.joinKey(w.code, code), displayName: "", claimed: false, studentUid: "", level: "beginner", lastSeen: 0 });
      db.joinKeys[s.joinKey] = { workshopId: wid, seatId: sid, teacherUid: w.teacherUid };
      commit();
    },
    async assignMissions(list) { list.forEach(m => { db.missions[m.id] = m; }); commit(); },
    async deleteMission(wid, sid, mid) { delete db.missions[mid]; commit(); },
    async sendMessage(wid, sid, msg) { db.messages[msg.id] = msg; commit(); },
    async markRead(wid, sid, ids, who) {
      const field = who === "teacher" ? "readByTeacher" : "readByStudent";
      ids.forEach(id => { if (db.messages[id]) db.messages[id][field] = true; });
      commit();
    },
    async saveTemplate(t) { db.templates[t.id] = t; commit(); },
    async deleteTemplate(id) { delete db.templates[id]; commit(); },
    /* ===== Jeux en direct ===== */
    // rechargement juste avant d'écrire : plusieurs onglets peuvent répondre en même temps
    async setGame(wid, game) { db = load(); db.games ||= {}; if (game) db.games[wid] = game; else delete db.games[wid]; commit(); },
    watchGame(wid, cb) { return watch(() => (db.games || {})[wid] || null, cb); },
    async submitGameAnswer(wid, sid, data) { db = load(); db.gameAnswers ||= {}; (db.gameAnswers[wid] ||= {})[sid] = data; commit(); },
    watchGameAnswers(wid, cb) { return watch(() => values((db.gameAnswers || {})[wid]), cb); },
    async clearGameAnswers(wid) { if (db.gameAnswers) delete db.gameAnswers[wid]; commit(); },
    async savePrefs(teacherUid, prefs) { db.prefs[teacherUid] = { ...(db.prefs[teacherUid] || {}), ...prefs }; commit(); },

    /* ===== Participant ===== */
    hasJoinKey(key) { return !!db.joinKeys[key]; },
    async claimSeat(workshopCode, seatCode) {
      const ref = db.joinKeys[AN.model.joinKey(workshopCode, seatCode)];
      if (!ref) throw new Error("Codes non reconnus. Vérifiez les chiffres.");
      const s = db.seats[ref.seatId], w = db.workshops[ref.workshopId];
      if (!s || !w) throw new Error("Cet atelier n'existe plus.");
      const me = studentUid();
      Object.assign(s, { studentUid: me, claimed: true, lastSeen: Date.now() });
      S.currentUid = me;
      commit();
      return { workshop: clone(w), seat: clone(s), uid: me };
    },
    watchSeat(wid, sid, cb, onLost) {
      return watch(() => db.seats[sid] || null, s => {
        if (!s || s.studentUid !== S.currentUid) onLost && onLost();
        else cb(s);
      });
    },
    watchStudent(wid, sid, cb) {
      return watch(() => ({
        workshop: db.workshops[wid] || null,
        missions: values(db.missions).filter(m => m.seatId === sid),
        messages: values(db.messages).filter(m => m.seatId === sid),
        achievements: values(db.achievements[achKey(wid, sid)] || {})
      }), cb);
    },
    async updateMySeat(wid, sid, patch) { const s = db.seats[sid]; if (s && s.studentUid === S.currentUid) { Object.assign(s, patch); commit(); } },
    async updateMission(wid, sid, mid, patch) { if (db.missions[mid]) { Object.assign(db.missions[mid], patch, { updatedAt: Date.now() }); commit(); } },
    async addAchievement(wid, sid, key, label) {
      const k = achKey(wid, sid);
      db.achievements[k] ||= {};
      db.achievements[k][key] = { key, label, at: Date.now() };
      commit();
    },
    async leave() { S.currentUid = null; }
  };

  AN.DemoStore = S;
})(window.AN);

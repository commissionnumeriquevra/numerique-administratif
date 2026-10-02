/* =========================================================
   Magasin de données Firebase (multi-ordinateurs, temps réel)
   Même interface que AN.DemoStore.

   Arborescence Firestore :
     users/{uid}                         role: "teacher" (créé à la main)
     teacherPrefs/{uid}                  réponses rapides du formateur
     templates/{id}                      missions personnalisées
     codes/{workshopCode}                garantit l'unicité du code atelier
     joinKeys/{codeAtelier-codePlace}    -> {workshopId, seatId}
     workshops/{wid}
       seats/{sid}
         missions/{mid}
         messages/{mid}
         achievements/{key}
   ========================================================= */
(function (AN) {
  "use strict";
  const { randomDigits } = AN.util;
  const SDK = "https://www.gstatic.com/firebasejs/12.4.0/";

  let fb = null; // { auth, db, ...fonctions du SDK }

  function isConfigured() {
    const c = window.firebaseConfig;
    return !!(c && c.apiKey && !String(c.apiKey).startsWith("VOTRE_"));
  }

  const P = {
    w: wid => fb.doc(fb.db, "workshops", wid),
    s: (wid, sid) => fb.doc(fb.db, "workshops", wid, "seats", sid),
    sub: (wid, sid, name) => fb.collection(fb.db, "workshops", wid, "seats", sid, name),
    subDoc: (wid, sid, name, id) => fb.doc(fb.db, "workshops", wid, "seats", sid, name, id)
  };
  const data = snap => snap.docs.map(d => ({ id: d.id, ...d.data() }));

  function friendlyError(e) {
    const code = e && e.code ? e.code : "";
    if (code.includes("invalid-credential") || code.includes("wrong-password") || code.includes("user-not-found")) return new Error("E-mail ou mot de passe incorrect.");
    if (code.includes("too-many-requests")) return new Error("Trop de tentatives. Patientez quelques minutes.");
    if (code.includes("network")) return new Error("Connexion Internet indisponible.");
    if (code.includes("permission-denied")) return new Error("Action refusée par les règles de sécurité.");
    if (code.includes("admin-restricted-operation") || code.includes("operation-not-allowed")) return new Error("La connexion anonyme n'est pas activée dans Firebase Authentication.");
    return e instanceof Error ? e : new Error(String(e));
  }

  async function batchDelete(refs) {
    for (let i = 0; i < refs.length; i += 400) {
      const b = fb.writeBatch(fb.db);
      refs.slice(i, i + 400).forEach(r => b.delete(r));
      await b.commit();
    }
  }

  const S = {
    mode: "firebase",
    label: "Firebase — synchronisé",
    isConfigured,
    currentUid: null,

    async init() {
      if (fb) return;
      if (!isConfigured()) throw new Error("Firebase n'est pas configuré (firebase-config.js).");
      const [appMod, authMod, fsMod] = await Promise.all([
        import(SDK + "firebase-app.js"), import(SDK + "firebase-auth.js"), import(SDK + "firebase-firestore.js")
      ]);
      const app = appMod.initializeApp(window.firebaseConfig);
      fb = { ...authMod, ...fsMod, auth: authMod.getAuth(app), db: fsMod.getFirestore(app) };
      await fb.setPersistence(fb.auth, fb.browserLocalPersistence).catch(() => {});
    },

    /* ===== Formateur ===== */
    async teacherSignIn(email, password) {
      await S.init();
      try {
        const cred = await fb.signInWithEmailAndPassword(fb.auth, email, password);
        const role = await fb.getDoc(fb.doc(fb.db, "users", cred.user.uid));
        if (!role.exists() || role.data().role !== "teacher") {
          await fb.signOut(fb.auth);
          throw new Error("Ce compte n'est pas encore autorisé comme formateur (voir README, étape « Créer le premier formateur »).");
        }
        S.currentUid = cred.user.uid;
        return { uid: cred.user.uid, email: cred.user.email };
      } catch (e) { throw friendlyError(e); }
    },
    async signOut() { if (fb) await fb.signOut(fb.auth).catch(() => {}); S.currentUid = null; },

    watchTeacher(teacherUid, cb) {
      const st = { workshops: [], seats: [], missions: [], messages: [], templates: [], prefs: {} };
      const ready = new Set();
      const emit = AN.util.debounce(() => {
        if (ready.size < 6) return;
        const workshops = st.workshops.map(w => ({ ...w, seats: st.seats.filter(s => s.workshopId === w.id).sort((a, b) => a.index - b.index) }));
        cb({ workshops, missions: st.missions, messages: st.messages, templates: st.templates, prefs: st.prefs });
      }, 80);
      const by = (col, group) => fb.query(group ? fb.collectionGroup(fb.db, col) : fb.collection(fb.db, col), fb.where("teacherUid", "==", teacherUid));
      const onErr = e => {
        console.error(e);
        // Index manquant : Firebase fournit un lien qui le crée en un clic
        const link = String(e && e.message || "").match(/https:\/\/console\.firebase\.google\.com\S+/);
        if (link) { AN.emit("index-needed", link[0].replace(/[).,]+$/, "")); return; }
        AN.util.toast("Synchronisation interrompue : " + friendlyError(e).message, "bad", 8000);
      };
      const unsubs = [
        fb.onSnapshot(by("workshops"), s => { st.workshops = data(s); ready.add("w"); emit(); }, onErr),
        fb.onSnapshot(by("seats", true), s => { st.seats = data(s); ready.add("s"); emit(); }, onErr),
        fb.onSnapshot(by("missions", true), s => { st.missions = data(s); ready.add("m"); emit(); }, onErr),
        fb.onSnapshot(by("messages", true), s => { st.messages = data(s); ready.add("g"); emit(); }, onErr),
        fb.onSnapshot(by("templates"), s => { st.templates = data(s); ready.add("t"); emit(); }, onErr),
        fb.onSnapshot(fb.doc(fb.db, "teacherPrefs", teacherUid), s => { st.prefs = s.exists() ? s.data() : {}; ready.add("p"); emit(); }, e => { ready.add("p"); emit(); onErr(e); })
      ];
      return () => unsubs.forEach(u => u());
    },

    async createWorkshop(teacherUid, { name, count }) {
      // 1. réserver un code atelier unique
      const wref = fb.doc(fb.collection(fb.db, "workshops"));
      let code = "";
      for (let tries = 0; tries < 8 && !code; tries++) {
        const c = randomDigits(6);
        const ref = fb.doc(fb.db, "codes", c);
        const snap = await fb.getDoc(ref);
        if (snap.exists()) continue;
        try { await fb.setDoc(ref, { teacherUid, workshopId: wref.id, createdAt: Date.now() }); code = c; } catch (e) { /* collision : on réessaie */ }
      }
      if (!code) throw new Error("Impossible de générer un code d'atelier. Réessayez.");
      const w = { id: wref.id, code, name, teacherUid, createdAt: Date.now(), favorite: false, archived: false, order: Date.now() };
      await fb.setDoc(wref, { code, name, teacherUid, createdAt: w.createdAt, favorite: false, archived: false, order: w.order });
      // 2. créer les places et leurs clés d'accès
      const b = fb.writeBatch(fb.db);
      const used = new Set();
      for (let i = 0; i < count; i++) {
        const s = AN.model.newSeat(w, i, used);
        const { id, ...rest } = s;
        b.set(P.s(w.id, id), rest);
        b.set(fb.doc(fb.db, "joinKeys", s.joinKey), { workshopId: w.id, seatId: id, teacherUid });
      }
      await b.commit();
      return w;
    },
    async updateWorkshop(wid, patch) { await fb.updateDoc(P.w(wid), patch); },
    async deleteWorkshop(wid) {
      const w = await fb.getDoc(P.w(wid));
      const seats = data(await fb.getDocs(fb.collection(fb.db, "workshops", wid, "seats")));
      for (const s of seats) {
        const refs = [];
        for (const sub of ["missions", "messages", "achievements"]) {
          (await fb.getDocs(P.sub(wid, s.id, sub))).docs.forEach(d => refs.push(d.ref));
        }
        refs.push(fb.doc(fb.db, "joinKeys", s.joinKey));
        refs.push(P.s(wid, s.id));
        await batchDelete(refs);
      }
      if (w.exists()) await fb.deleteDoc(fb.doc(fb.db, "codes", w.data().code)).catch(() => {});
      await fb.deleteDoc(P.w(wid)); // en dernier : les règles s'appuient sur ce document
    },
    async addSeat(wid) {
      const wsnap = await fb.getDoc(P.w(wid));
      const w = { id: wid, ...wsnap.data() };
      const seats = data(await fb.getDocs(fb.collection(fb.db, "workshops", wid, "seats")));
      if (seats.length >= AN.model.MAX_SEATS) throw new Error(`Un groupe compte au maximum ${AN.model.MAX_SEATS} places.`);
      const s = AN.model.newSeat(w, Math.max(-1, ...seats.map(x => x.index)) + 1, new Set(seats.map(x => x.seatCode)));
      const { id, ...rest } = s;
      const b = fb.writeBatch(fb.db);
      b.set(P.s(wid, id), rest);
      b.set(fb.doc(fb.db, "joinKeys", s.joinKey), { workshopId: wid, seatId: id, teacherUid: w.teacherUid });
      await b.commit();
    },
    async updateSeat(wid, sid, patch) { await fb.updateDoc(P.s(wid, sid), patch); },
    async clearSeatData(wid, sid, { messages = false } = {}) {
      const refs = [];
      const subs = messages ? ["missions", "achievements", "messages"] : ["missions", "achievements"];
      for (const sub of subs) (await fb.getDocs(P.sub(wid, sid, sub))).docs.forEach(d => refs.push(d.ref));
      await batchDelete(refs);
      await fb.updateDoc(P.s(wid, sid), { quizHistory: {}, activity: null, help: null });
    },
    async regenerateSeat(wid, sid) {
      const w = (await fb.getDoc(P.w(wid))).data();
      const seats = data(await fb.getDocs(fb.collection(fb.db, "workshops", wid, "seats")));
      const s = seats.find(x => x.id === sid); if (!s) return;
      await S.clearSeatData(wid, sid, { messages: true });
      const used = new Set(seats.map(x => x.seatCode));
      let code = randomDigits(4); while (used.has(code)) code = randomDigits(4);
      const joinKey = AN.model.joinKey(w.code, code);
      const b = fb.writeBatch(fb.db);
      b.delete(fb.doc(fb.db, "joinKeys", s.joinKey));
      b.set(fb.doc(fb.db, "joinKeys", joinKey), { workshopId: wid, seatId: sid, teacherUid: w.teacherUid });
      b.update(P.s(wid, sid), { seatCode: code, joinKey, displayName: "", claimed: false, studentUid: "", level: "beginner", lastSeen: 0 });
      await b.commit();
    },
    async assignMissions(list) {
      // un lot par participant : reste largement sous les limites des règles de sécurité
      const bySeat = {};
      list.forEach(m => (bySeat[m.seatId] ||= []).push(m));
      await Promise.all(Object.values(bySeat).map(ms => {
        const b = fb.writeBatch(fb.db);
        ms.forEach(m => { const { id, ...rest } = m; b.set(P.subDoc(m.workshopId, m.seatId, "missions", id), rest); });
        return b.commit();
      }));
    },
    async deleteMission(wid, sid, mid) { await fb.deleteDoc(P.subDoc(wid, sid, "missions", mid)); },
    async sendMessage(wid, sid, msg) { const { id, ...rest } = msg; await fb.setDoc(P.subDoc(wid, sid, "messages", id), rest); },
    async markRead(wid, sid, ids, who) {
      if (!ids.length) return;
      const field = who === "teacher" ? "readByTeacher" : "readByStudent";
      const b = fb.writeBatch(fb.db);
      ids.forEach(id => b.update(P.subDoc(wid, sid, "messages", id), { [field]: true }));
      await b.commit();
    },
    async saveTemplate(t) { const { id, ...rest } = t; await fb.setDoc(fb.doc(fb.db, "templates", id), rest); },
    async deleteTemplate(id) { await fb.deleteDoc(fb.doc(fb.db, "templates", id)); },
    async savePrefs(teacherUid, prefs) { await fb.setDoc(fb.doc(fb.db, "teacherPrefs", teacherUid), prefs, { merge: true }); },

    /* ===== Participant ===== */
    async claimSeat(workshopCode, seatCode) {
      await S.init();
      try {
        let user = fb.auth.currentUser;
        if (user && !user.isAnonymous) { await fb.signOut(fb.auth); user = null; }
        if (!user) user = (await fb.signInAnonymously(fb.auth)).user;
        const key = AN.model.joinKey(workshopCode, seatCode);
        const jk = await fb.getDoc(fb.doc(fb.db, "joinKeys", key));
        if (!jk.exists()) throw new Error("Codes non reconnus. Vérifiez les chiffres.");
        const { workshopId, seatId } = jk.data();
        await fb.updateDoc(P.s(workshopId, seatId), { studentUid: user.uid, claimed: true, joinKey: key, lastSeen: Date.now() });
        const [w, s] = await Promise.all([fb.getDoc(P.w(workshopId)), fb.getDoc(P.s(workshopId, seatId))]);
        S.currentUid = user.uid;
        return { workshop: { id: w.id, ...w.data() }, seat: { id: s.id, ...s.data() }, uid: user.uid };
      } catch (e) { throw friendlyError(e); }
    },
    watchSeat(wid, sid, cb, onLost) {
      return fb.onSnapshot(P.s(wid, sid), snap => {
        const s = snap.exists() ? { id: snap.id, ...snap.data() } : null;
        if (!s || s.studentUid !== S.currentUid) onLost && onLost(); else cb(s);
      }, () => onLost && onLost());
    },
    watchStudent(wid, sid, cb) {
      const st = { workshop: null, missions: [], messages: [], achievements: [] };
      const ready = new Set();
      const emit = AN.util.debounce(() => { if (ready.size >= 3) cb({ ...st }); }, 60);
      const unsubs = [
        fb.onSnapshot(P.sub(wid, sid, "missions"), s => { st.missions = data(s); ready.add(1); emit(); }, () => {}),
        fb.onSnapshot(P.sub(wid, sid, "messages"), s => { st.messages = data(s); ready.add(2); emit(); }, () => {}),
        fb.onSnapshot(P.sub(wid, sid, "achievements"), s => { st.achievements = data(s); ready.add(3); emit(); }, () => {})
      ];
      fb.getDoc(P.w(wid)).then(w => { st.workshop = w.exists() ? { id: w.id, ...w.data() } : null; emit(); }).catch(() => {});
      return () => unsubs.forEach(u => u());
    },
    async updateMySeat(wid, sid, patch) { await fb.updateDoc(P.s(wid, sid), patch); },
    async updateMission(wid, sid, mid, patch) { await fb.updateDoc(P.subDoc(wid, sid, "missions", mid), { ...patch, updatedAt: Date.now() }); },
    async addAchievement(wid, sid, key, label) { await fb.setDoc(P.subDoc(wid, sid, "achievements", key), { label, at: Date.now() }); },
    async leave() { if (fb && fb.auth.currentUser?.isAnonymous) await fb.signOut(fb.auth).catch(() => {}); S.currentUid = null; }
  };

  AN.FirebaseStore = S;
})(window.AN);

/* =========================================================
   Outils du chapitre « Comptes et mots de passe »
   - AN.pw.strength(motDePasse, infosPerso)  : jauge pédagogique
   - AN.phone.create(el, options)            : téléphone simulé (SMS, appels, applis)
   - AN.social.profile(p)                    : faux profil de réseau social
                                                (repérer ce qu'il vaut mieux ne pas publier)
   Rien de ce qui est tapé n'est enregistré ni envoyé.
   ========================================================= */
(function (AN) {
  "use strict";
  const { esc } = AN.util;
  const fold = s => String(s || "").normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();

  /* =========================================================
     1. Jauge de solidité (pédagogique, volontairement simple)
     ========================================================= */
  const COMMON = ["123456", "1234567", "12345678", "123456789", "1234567890", "azerty", "azertyuiop", "azerty123", "motdepasse", "motdepasse1", "password", "password1", "qwerty", "soleil", "doudou", "loulou", "chouchou", "marseille", "bonjour", "000000", "111111", "iloveyou", "jetaime", "nicolas", "princesse", "football", "admin", "coucou", "doudou123", "soleil123"];
  const LABELS = ["Très fragile", "Fragile", "Moyen", "Solide", "Très solide"];
  const COLORS = ["#d95f56", "#e8833a", "#e0a100", "#5aa469", "#2f9d68"];
  function duration(secs) {
    if (secs < 1) return "instantanément";
    const u = [["seconde", 60], ["minute", 60], ["heure", 24], ["jour", 365], ["an", 1e9]];
    let v = secs;
    for (const [name, k] of u) {
      if (v < k || name === "an") {
        if (name === "an" && v >= 1e6) return "plus d'un million d'années";
        const n = Math.round(v);
        return `${n.toLocaleString("fr-FR")} ${name}${n > 1 && name !== "an" ? "s" : n > 1 ? "s" : ""}`;
      }
      v /= k;
    }
  }
  /** -> { score 0..4, label, color, time, reasons[] } — time = temps pour un logiciel qui teste 10 milliards d'essais/s */
  function strength(pw, personal = []) {
    const p = String(pw || "");
    if (!p) return { score: 0, label: "—", color: "#c9d1db", time: "", reasons: [], pct: 0 };
    const f = fold(p), flat = f.replace(/[^a-z0-9]/g, "");
    const reasons = [];
    let weak = false;
    if (COMMON.includes(flat)) { reasons.push("C'est un mot de passe très courant : les pirates l'essaient en tout premier."); weak = true; }
    const leet = f.replace(/@/g, "a").replace(/0/g, "o").replace(/3/g, "e").replace(/1/g, "i").replace(/\$/g, "s").replace(/[^a-z]/g, "");
    if (!weak && COMMON.includes(leet)) { reasons.push("Remplacer des lettres par des signes (@ pour a, 0 pour o) : les logiciels connaissent l'astuce."); weak = true; }
    const pers = personal.filter(x => { const k = fold(x).replace(/[^a-z0-9]/g, ""); return k.length > 1 && flat.includes(k); });
    if (pers.length) { reasons.push(`Il contient des informations personnelles faciles à trouver : ${pers.join(", ")}.`); weak = true; }
    let cs = 0;
    if (/[a-z]/.test(p)) cs += 26; if (/[A-Z]/.test(p)) cs += 26; if (/\d/.test(p)) cs += 10; if (/[^a-zA-Z0-9]/.test(p)) cs += 33;
    let bits = p.length * Math.log2(Math.max(cs, 10));
    if (/(.)\1\1/.test(p)) bits -= 10;
    if (/(0123|1234|2345|3456|4567|5678|6789|abcd|azer|qwer)/i.test(p)) { bits -= 15; reasons.push("Une suite de touches (1234, azer…) : trop facile à deviner."); }
    if (/(19|20)\d\d/.test(p)) reasons.push("Une année (souvent une date de naissance) : les pirates l'essaient systématiquement.");
    if (/^[a-zà-ÿ]+[^a-zà-ÿ\s]{0,6}$/i.test(p)) { bits = Math.min(bits, 30); reasons.push("Un seul mot, avec quelques chiffres ou un signe au bout : c'est le schéma le plus deviné."); }
    if (p.length < 12) reasons.push(`Trop court : ${p.length} caractère${p.length > 1 ? "s" : ""}. Visez au moins 12… ou mieux, une phrase.`);
    const words = p.trim().split(/\s+/).filter(w => w.length > 1).length;
    if (words >= 4 && p.length >= 20 && !weak) reasons.unshift("Une phrase de plusieurs mots : longue, et facile à retenir. 👍");
    if (weak) bits = Math.min(bits, 12);
    const secs = Math.pow(2, Math.max(0, bits - 1)) / 1e10;
    const score = secs < 1 ? 0 : secs < 86400 ? 1 : secs < 86400 * 365 * 10 ? 2 : secs < 86400 * 365 * 1e4 ? 3 : 4;
    return { score, label: LABELS[score], color: COLORS[score], time: duration(secs), secs, reasons, pct: [8, 28, 52, 78, 100][score] };
  }
  /** Jauge HTML. */
  const gauge = (pw, personal) => {
    const s = strength(pw, personal);
    return `<div class="pw-gauge" aria-live="polite"><div class="pw-bar"><span style="width:${s.pct}%;background:${s.color}"></span></div>
      <div class="pw-label"><b style="color:${s.color}">${s.label}</b>${s.time ? ` · trouvé ${s.time === "instantanément" ? "<b>instantanément</b>" : `en <b>${s.time}</b>`} par un logiciel de pirate` : ""}</div>
      ${s.reasons.length ? `<ul class="pw-reasons">${s.reasons.map(r => `<li>${r}</li>`).join("")}</ul>` : ""}</div>`;
  };
  AN.pw = { strength, gauge, duration, LABELS, COLORS };

  /* =========================================================
     2. Téléphone simulé
     ========================================================= */
  function phone(el, opts = {}) {
    const st = { sms: [], screen: "home", app: null, call: null, banner: null, apps: opts.apps || ["messages"] };
    const emit = (t, d) => { try { return opts.onEvent?.(t, d, ctl); } catch (e) { console.error(e); } };
    const clock = () => new Date().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
    const APPS = { messages: ["💬", "Messages"], phone: ["📞", "Téléphone"], passwords: ["🔑", "Mots de passe"], settings: ["⚙️", "Réglages"], safari: ["🧭", "Navigateur"] };
    let timers = [];
    const later = (fn, ms) => { const t = setTimeout(fn, ms); timers.push(t); };

    function screenHTML() {
      if (st.call) {
        const c = st.call;
        if (c.state === "ringing") return `<div class="ph-call"><div class="ph-call-who"><div class="ph-av">${c.icon || "📞"}</div><b>${esc(c.name)}</b><small>${esc(c.number || "")}</small><small>Appel entrant…</small></div>
          <div class="ph-call-btns"><button type="button" class="no" data-ph="decline">✕<small>Refuser</small></button><button type="button" class="yes" data-ph="answer">📞<small>Répondre</small></button></div></div>`;
        return `<div class="ph-call live"><div class="ph-call-top"><b>${esc(c.name)}</b><small>${c.state === "ended" ? "Appel terminé" : "En ligne · " + (c.secs || 0) + " s"}</small></div>
          <div class="ph-talk">${c.shown.map(l => `<div class="ph-line ${l.who}">${l.who === "them" ? `<i>${esc(c.short || "Correspondant")}</i>` : ""}${l.text}</div>`).join("")}</div>
          ${c.choices && c.state === "talk" ? `<div class="ph-choices">${c.choices.map(x => `<button type="button" data-ph="choice" data-id="${x.id}">${x.label}</button>`).join("")}</div>` : ""}
          ${c.state !== "ended" ? `<button type="button" class="ph-hang" data-ph="hang">📵 Raccrocher</button>` : ""}</div>`;
      }
      if (st.screen === "messages") {
        const threads = [...new Set(st.sms.map(m => m.from))];
        return `<div class="ph-app"><div class="ph-app-top"><button type="button" data-ph="home">‹ Accueil</button><b>Messages</b></div>
          <div class="ph-sms-list">${st.sms.length ? threads.map(from => `<div class="ph-thread"><div class="ph-thread-who">${esc(from)}</div>${st.sms.filter(m => m.from === from).map(m => `<div class="ph-bubble">${m.text}<small>${m.at}</small></div>`).join("")}</div>`).join("") : `<p class="ph-empty">Aucun message.</p>`}</div></div>`;
      }
      if (st.screen === "app" && st.app) return `<div class="ph-app"><div class="ph-app-top"><button type="button" data-ph="home">‹ Accueil</button><b>${esc(st.app.title)}</b></div><div class="ph-app-body">${st.app.html}</div></div>`;
      const unread = st.sms.filter(m => !m.read).length;
      return `<div class="ph-home"><div class="ph-clock">${clock()}</div><div class="ph-apps">${st.apps.map(a => `<button type="button" data-ph="open" data-app="${a}"><span>${APPS[a]?.[0] || "📱"}${a === "messages" && unread ? `<i>${unread}</i>` : ""}</span>${APPS[a]?.[1] || a}</button>`).join("")}</div></div>`;
    }
    function render() {
      el.innerHTML = `<div class="ph ${opts.big ? "ph-big" : ""}"><div class="ph-notch"></div><div class="ph-status"><span>${clock()}</span><span>📶 🔋</span></div>
        <div class="ph-screen">${screenHTML()}</div>
        ${st.banner ? `<button type="button" class="ph-banner" data-ph="banner"><b>${st.banner.icon || "💬"} ${esc(st.banner.title)}</b><span>${st.banner.text}</span></button>` : ""}
        <div class="ph-homebar" data-ph="home"></div></div>`;
      const talk = el.querySelector(".ph-talk"); if (talk) talk.scrollTop = talk.scrollHeight;
    }
    function sms({ from, text }) {
      const m = { from, text, at: clock(), read: st.screen === "messages" };
      st.sms.push(m);
      st.banner = st.screen === "messages" ? null : { title: from, text, icon: "💬" };
      render(); emit("sms", m);
      if (st.banner) later(() => { st.banner = null; render(); }, 9000);
    }
    function nextLine() {
      const c = st.call; if (!c || c.state !== "talk") return;
      if (c.i >= c.script.length) { emit("callScriptEnd", c); return; }
      const l = c.script[c.i++];
      c.shown.push(l); render(); emit("callLine", { line: l, index: c.i - 1 });
      later(nextLine, l.pause || c.speed);
    }
    const handlers = {
      open: b => { const a = b.dataset.app; if (a === "messages") { st.screen = "messages"; st.sms.forEach(m => { m.read = true; }); } else { st.screen = "app"; st.app = { id: a, title: APPS[a]?.[1] || a, html: "" }; } render(); emit("open", { app: a }); },
      home: () => { if (st.call && st.call.state !== "ended") return; st.call = null; st.screen = "home"; st.app = null; render(); emit("home"); },
      banner: () => { st.banner = null; st.screen = "messages"; st.sms.forEach(m => { m.read = true; }); render(); emit("open", { app: "messages" }); },
      answer: () => { const c = st.call; c.state = "talk"; c.secs = 0; c.tick = setInterval(() => { c.secs++; const s = el.querySelector(".ph-call-top small"); if (s && c.state !== "ended") s.textContent = "En ligne · " + c.secs + " s"; }, 1000); render(); emit("callAnswer", c); later(nextLine, 600); },
      decline: () => { const c = st.call; st.call = null; render(); emit("callDecline", c); },
      hang: () => { const c = st.call; c.state = "ended"; clearInterval(c.tick); render(); emit("callHang", c); },
      choice: b => { const c = st.call; emit("callChoice", { id: b.dataset.id, call: c }); },
      act: b => emit("act", { name: b.dataset.name, el: b })
    };
    const onClick = e => {
      const a = e.target.closest("[data-ph-act]");
      if (a && el.contains(a)) { emit("act", { name: a.dataset.phAct, el: a }); return; }
      const b = e.target.closest("[data-ph]"); if (b && el.contains(b)) handlers[b.dataset.ph]?.(b, e);
    };
    el.addEventListener("click", onClick);
    const ctl = {
      st, render, sms,
      call({ name, number, short, icon, script, speed = 2600 }) { st.call = { name, number, short, icon, script, speed, shown: [], i: 0, state: "ringing" }; st.banner = null; render(); emit("callRing", st.call); },
      /** Ajoute une réplique (la mienne ou la leur) à l'appel en cours. */
      say(who, text) { const c = st.call; if (!c) return; c.shown.push({ who, text }); render(); },
      choices(list) { if (st.call) { st.call.choices = list; render(); } },
      endCall() { const c = st.call; if (!c) return; c.state = "ended"; clearInterval(c.tick); c.choices = null; render(); },
      app(id, title, html) { st.screen = "app"; st.app = { id, title, html }; st.call = null; render(); },
      setAppHTML(html) { if (st.app) { st.app.html = html; render(); } },
      notify(title, text, icon = "🔔") { st.banner = { title, text, icon }; render(); later(() => { st.banner = null; render(); }, 7000); },
      destroy() { el.removeEventListener("click", onClick); timers.forEach(clearTimeout); clearInterval(st.call?.tick); }
    };
    render();
    return ctl;
  }
  AN.phone = { create: phone };

  /* =========================================================
     3. Faux réseau social
     ========================================================= */
  /** p = { name, avatar, city, about:[[icône, html]], posts:[{ when, html, pic }] } — les infos cliquables : <span class="pi" data-info="clé">…</span> */
  const profile = (p, { static: stat } = {}) => `<div class="sn ${stat ? "sn-static" : ""}">
      <div class="sn-top"><b>👥 MonRéseau</b><span>Un réseau social, comme Facebook</span></div>
      <div class="sn-cover"></div>
      <div class="sn-head"><div class="sn-av">${p.avatar}</div><div><b>${esc(p.name)}</b><small>${p.friends || 248} amis</small></div></div>
      <div class="sn-body"><aside class="sn-about"><h4>À propos</h4>${p.about.map(([i, h]) => `<p><span>${i}</span> ${h}</p>`).join("")}</aside>
        <div class="sn-posts">${p.posts.map(x => `<article class="sn-post"><div class="sn-post-head"><span class="sn-av mini">${p.avatar}</span><div><b>${esc(p.name)}</b><small>${x.when}</small></div></div><p>${x.html}</p>${x.pic ? `<div class="sn-pic">${x.pic}</div>` : ""}<div class="sn-react">👍 ❤️ ${x.likes || 12} · ${x.comments || 3} commentaires</div></article>`).join("")}</div></div></div>`;
  const pi = (key, html) => `<span class="pi" data-info="${key}">${html}</span>`;

  const JOSIANE = {
    name: "Josiane Martin", avatar: "👵", friends: 312,
    infos: { rex: "Rex", y1952: "1952", lucas: "Lucas", y2015: "2015", belote: "belote", biarritz: "Biarritz", valbourg: "Valbourg", d14: "14", mars: "mars" },
    about: [["🏠", `Habite à ${pi("valbourg", "Valbourg")}`], ["🎂", `Née le ${pi("d14", "14")} ${pi("mars", "mars")} ${pi("y1952", "1952")}`], ["💼", "Ancienne employée de La Poste"], ["❤️", "Mariée"]],
    posts: [
      { when: "Hier · 🌍", html: `Joyeux anniversaire à mon fidèle ${pi("rex", "Rex")} ! 8 ans déjà 🐶🎂`, pic: "🐕", likes: 54, comments: 12 },
      { when: "12 juin · 🌍", html: `Tellement fière de mon petit-fils ${pi("lucas", "Lucas")}, né en ${pi("y2015", "2015")} : premier prix de dessin ! 🏆`, likes: 87, comments: 21 },
      { when: "3 mai · 🌍", html: `Concours de ${pi("belote", "belote")} au club samedi, venez nombreux ! ♣️♥️` },
      { when: "Août · 🌍", html: `Vive les vacances à ${pi("biarritz", "Biarritz")}, comme chaque année 🌊☀️`, pic: "🏖️" }
    ]
  };

  AN.social = { profile, JOSIANE, pi };
})(window.AN);

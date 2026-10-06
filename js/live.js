/* =========================================================
   Jeux en direct pendant la projection (façon Kahoot)
   - Le formateur lance un jeu depuis une diapositive : l'écran projeté
     montre la question, le chrono et le nombre de réponses.
   - Chaque participant joue sur son PC (fenêtre qui s'ouvre toute seule).
   - Révélation en direct, statistiques du groupe, podium bienveillant.

   Un jeu = { id, title, icon, intro, noRank?, rounds: [ { kind, ... } ] }
   Mécaniques (kind) : choice · spot · order · type · buzz
   ========================================================= */
(function (AN) {
  "use strict";
  const { esc, uid, toast } = AN.util;

  /* ---------------- catalogue de jeux ---------------- */
  const defs = {};
  AN.games = {
    register(def) { defs[def.id] = def; },
    get: id => defs[id],
    /** Carte d'introduction affichée sur la diapositive, avant le lancement. */
    slide(id) {
      const g = defs[id];
      if (!g) return `<div class="alert bad">Jeu introuvable : ${esc(id)}</div>`;
      const kinds = [...new Set(g.rounds.map(r => r.kind))];
      return `<div class="lg-intro"><div class="lg-intro-icon" aria-hidden="true">${g.icon || "🎮"}</div>
        <div><p class="l-lead">${g.intro}</p>
          <ul class="lg-how"><li>💻 Chacun joue sur <b>son ordinateur</b> : le jeu s'ouvre tout seul.</li>
            <li>${g.rounds.length > 1 ? `🔢 ${g.rounds.length} manches` : "🎯 Une seule manche"} · ${kinds.includes("buzz") ? "⚡ plus vous êtes rapide, plus vous gagnez de points" : "⏱️ les bonnes réponses rapides rapportent plus"}</li>
            <li>${g.noRank ? "🤝 Pas de classement : on regarde juste les réponses du groupe." : "🏆 Podium à la fin… mais l'important, c'est de participer !"}</li></ul>
          <button type="button" class="l-btn lg-launch" data-game-launch="${esc(id)}">▶ Lancer le jeu</button></div></div>`;
    }
  };

  /* ---------------- outils communs ---------------- */
  const speed = (ms, limit) => Math.max(0, 1 - ms / (limit * 1000));
  const pct = (n, d) => (d ? Math.round((100 * n) / d) : 0);
  const shuffleSeed = (arr, seed) => { // mélange identique pour un même joueur (rechargement)
    const a = [...arr]; let x = 0; for (const c of String(seed)) x = (x * 31 + c.charCodeAt(0)) >>> 0;
    for (let i = a.length - 1; i > 0; i--) { x = (x * 1103515245 + 12345) >>> 0; const j = x % (i + 1); [a[i], a[j]] = [a[j], a[i]]; }
    return a;
  };
  const bars = (labels, counts, okIndex) => {
    const total = counts.reduce((a, b) => a + b, 0);
    return `<div class="lg-bars">${labels.map((l, i) => `<div class="lg-bar ${okIndex === i || (Array.isArray(okIndex) && okIndex.includes(i)) ? "ok" : ""}">
      <div class="lg-bar-label">${okIndex === i ? "✅ " : ""}${l}</div><div class="lg-bar-track"><span style="width:${pct(counts[i], total)}%"></span></div><b>${counts[i]}</b></div>`).join("")}</div>`;
  };

  /* =========================================================
     LES 5 MÉCANIQUES
     play(ctx)            : écran du participant (ctx.submit(payload, final))
     score(r, payload,ms) : { points, good, max }
     myReveal(r, ans)     : ce que le participant voit à la révélation
     hostPrompt(r)        : la question à l'écran projeté
     hostLive(r, list)    : statistiques en direct pendant le jeu
     hostReveal(r, list)  : la révélation projetée
     ========================================================= */
  const K = {
    /* ---------- 1. Choix chronométré ---------- */
    choice: {
      limit: r => r.limit || 20,
      play(ctx) {
        const r = ctx.round;
        ctx.el.innerHTML = `<div class="lp-prompt">${r.prompt}</div>
          <div class="lp-choices ${r.layout || ""} n${r.choices.length}">${r.choices.map((c, i) => `<button type="button" class="lp-choice c${i}" data-c="${i}">${c}</button>`).join("")}</div>`;
        ctx.el.querySelectorAll("[data-c]").forEach(b => b.addEventListener("click", () => ctx.submit({ choice: Number(b.dataset.c) }, true)));
      },
      score: (r, p, ms) => { const good = p && p.choice === r.ok; return { points: good ? 500 + Math.round(500 * speed(ms, K.choice.limit(r))) : 0, good: good ? 1 : 0, max: 1 }; },
      myReveal: (r, a) => `<div class="lp-answer">La bonne réponse : <b>${r.choices[r.ok]}</b></div>${a?.payload?.choice != null ? `<div class="lp-yours">Vous avez répondu : ${r.choices[a.payload.choice]}</div>` : ""}<div class="lp-why">${r.why || ""}</div>`,
      hostPrompt: r => `<div class="lh-prompt">${r.prompt}</div><div class="lh-choices ${r.layout || ""}">${r.choices.map((c, i) => `<div class="lh-choice c${i}">${c}</div>`).join("")}</div>`,
      hostLive: () => "",
      hostReveal(r, list) {
        const counts = r.choices.map((_, i) => list.filter(a => a.payload?.choice === i).length);
        return `${r.revealHTML ? `<div class="lh-reveal-visual">${r.revealHTML}</div>` : `<div class="lh-prompt small">${r.prompt}</div>`}
          <div class="lh-reveal-side">${bars(r.choices, counts, r.ok)}<div class="lh-why">${r.why || ""}</div></div>`;
      }
    },

    /* ---------- 2. Zones à trouver (les 7 erreurs) ---------- */
    spot: {
      limit: r => r.limit || 150,
      play(ctx) {
        const r = ctx.round, ids = Object.keys(r.zones);
        const found = new Set(ctx.saved?.payload?.found || []);
        ctx.el.innerHTML = `<div class="lp-prompt">${r.prompt}</div>
          <div class="lp-spot-count"><b>${found.size}</b> / ${ids.length} trouvé(s) <button type="button" class="lp-done">J'ai fini ✔</button></div>
          <div class="lp-spot">${r.content}</div><div class="lp-spot-fb" aria-live="polite"></div>`;
        const box = ctx.el.querySelector(".lp-spot");
        const mark = () => { box.querySelectorAll("[data-z]").forEach(z => z.classList.toggle("found", found.has(z.dataset.z))); ctx.el.querySelector(".lp-spot-count b").textContent = found.size; };
        mark();
        box.addEventListener("click", e => {
          e.preventDefault();
          const z = e.target.closest("[data-z]");
          const fb = ctx.el.querySelector(".lp-spot-fb");
          if (z && !found.has(z.dataset.z)) {
            found.add(z.dataset.z); mark();
            fb.innerHTML = `<span class="ok">🔍 Bien vu : ${r.zones[z.dataset.z]}</span>`;
            const done = found.size === ids.length;
            ctx.submit({ found: [...found] }, done);
          } else if (!z) fb.innerHTML = `<span>Pas d'indice ici… cherchez encore !</span>`;
        });
        ctx.el.querySelector(".lp-done").addEventListener("click", () => ctx.submit({ found: [...found] }, true));
      },
      score(r, p, ms) {
        const n = Object.keys(r.zones).length, f = (p?.found || []).length;
        return { points: f * 100 + (f === n ? Math.round(300 * speed(ms, K.spot.limit(r))) : 0), good: f, max: n };
      },
      myReveal: (r, a) => `<div class="lp-answer">Vous avez trouvé <b>${(a?.payload?.found || []).length} indice(s) sur ${Object.keys(r.zones).length}</b>.</div><div class="lp-spot reveal">${r.content}</div>`,
      hostPrompt: r => `<div class="lh-prompt small">${r.prompt}</div><div class="lh-spot">${r.content}</div>`,
      hostLive(r, list) {
        const n = Object.keys(r.zones).length;
        const avg = list.length ? (list.reduce((s, a) => s + (a.payload?.found || []).length, 0) / list.length).toFixed(1) : 0;
        return `🔍 En moyenne <b>${avg} / ${n}</b> indices trouvés`;
      },
      hostReveal(r, list) {
        const ids = Object.keys(r.zones);
        const rate = id => pct(list.filter(a => (a.payload?.found || []).includes(id)).length, list.length);
        const sorted = [...ids].sort((a, b) => rate(a) - rate(b));
        return `<div class="lh-reveal-visual lh-spot reveal">${r.content.replace(/data-z="([^"]+)"/g, (m, id) => `${m} data-rate="${rate(id)}%"`)}</div>
          <div class="lh-reveal-side"><h3>Les indices, du moins vu au plus vu</h3><ol class="lh-zones">${sorted.map(id => `<li class="${rate(id) < 50 ? "low" : ""}"><b>${rate(id)} %</b> ${r.zones[id]}</li>`).join("")}</ol>
          ${r.why ? `<div class="lh-why">${r.why}</div>` : ""}</div>`;
      }
    },

    /* ---------- 3. Remettre dans l'ordre ---------- */
    order: {
      limit: r => r.limit || 60,
      play(ctx) {
        const r = ctx.round;
        const pool = shuffleSeed(r.answer.map((t, i) => ({ t, i })), ctx.seed);
        const chosen = [];
        const draw = () => {
          ctx.el.innerHTML = `<div class="lp-prompt">${r.prompt}</div>
            <div class="lp-slots ${r.inline ? "inline" : ""}">${r.answer.map((_, k) => `<button type="button" class="lp-slot ${chosen[k] ? "filled" : ""}" data-slot="${k}">${chosen[k] ? chosen[k].t : `<span>${k + 1}</span>`}</button>`).join("")}</div>
            <p class="lp-hint">👆 Cliquez sur les étiquettes dans le bon ordre. Cliquez sur une case remplie pour la vider.</p>
            <div class="lp-pieces">${pool.map(p => `<button type="button" class="lp-piece" data-p="${p.i}" ${chosen.includes(p) ? "disabled" : ""}>${p.t}</button>`).join("")}</div>
            <button type="button" class="lp-validate" ${chosen.filter(Boolean).length === r.answer.length ? "" : "disabled"}>Valider ✔</button>`;
          ctx.el.querySelectorAll("[data-p]").forEach(b => b.addEventListener("click", () => {
            const p = pool.find(x => x.i === Number(b.dataset.p)); const k = [...Array(r.answer.length).keys()].find(k => !chosen[k]);
            if (k != null) { chosen[k] = p; draw(); }
          }));
          ctx.el.querySelectorAll("[data-slot]").forEach(b => b.addEventListener("click", () => { chosen[Number(b.dataset.slot)] = undefined; draw(); }));
          ctx.el.querySelector(".lp-validate").addEventListener("click", () => ctx.submit({ order: chosen.map(p => p.i) }, true));
        };
        draw();
      },
      score(r, p, ms) {
        const o = p?.order || [], n = r.answer.length, ok = o.filter((v, k) => v === k).length;
        return { points: Math.round((400 * ok) / n) + (ok === n ? Math.round(600 * speed(ms, K.order.limit(r))) : 0), good: ok === n ? 1 : 0, max: 1 };
      },
      myReveal: (r, a) => `<div class="lp-answer">Le bon ordre :</div><div class="lp-slots ${r.inline ? "inline" : ""} reveal">${r.answer.map(t => `<span class="lp-slot filled">${t}</span>`).join("")}</div><div class="lp-why">${r.why || ""}</div>`,
      hostPrompt: r => `<div class="lh-prompt">${r.prompt}</div><div class="lp-pieces host">${shuffleSeed(r.answer, "host").map(t => `<span class="lp-piece">${t}</span>`).join("")}</div>`,
      hostLive: () => "",
      hostReveal(r, list) {
        const full = list.filter(a => (a.payload?.order || []).every((v, k) => v === k) && (a.payload?.order || []).length === r.answer.length).length;
        const wrong = {};
        list.forEach(a => { const o = a.payload?.order || []; if (!o.every((v, k) => v === k)) { const key = o.map(i => r.answer[i]).join(" "); wrong[key] = (wrong[key] || 0) + 1; } });
        const top = Object.entries(wrong).sort((a, b) => b[1] - a[1]).slice(0, 2);
        return `<div class="lh-reveal-visual"><div class="lp-slots ${r.inline ? "inline" : ""} reveal big">${r.answer.map(t => `<span class="lp-slot filled">${t}</span>`).join("")}</div></div>
          <div class="lh-reveal-side"><div class="lh-big-stat"><b>${pct(full, list.length)} %</b> ont trouvé le bon ordre</div>
          ${top.length ? `<h3>Erreurs fréquentes</h3>${top.map(([k, n]) => `<div class="lh-wrong"><code>${k}</code> <small>(${n})</small></div>`).join("")}` : ""}
          <div class="lh-why">${r.why || ""}</div></div>`;
      }
    },

    /* ---------- 4. Saisie au clavier (dictée) ---------- */
    type: {
      limit: r => r.limit || 60,
      play(ctx) {
        const r = ctx.round;
        ctx.el.innerHTML = `<div class="lp-prompt">${r.prompt}</div><div class="lp-model">${esc(r.target)}</div>
          ${r.hint ? `<div class="lp-hint">${r.hint}</div>` : ""}
          <input class="lp-input" autocomplete="off" spellcheck="false" autocapitalize="off" aria-label="Votre réponse">
          <button type="button" class="lp-validate">Valider ✔</button>`;
        const inp = ctx.el.querySelector(".lp-input"); inp.focus();
        const go = () => { if (inp.value.trim()) ctx.submit({ text: inp.value.trim() }, true); };
        ctx.el.querySelector(".lp-validate").addEventListener("click", go);
        inp.addEventListener("keydown", e => { if (e.key === "Enter") go(); });
      },
      score: (r, p, ms) => { const good = p?.text === r.target; return { points: good ? 500 + Math.round(500 * speed(ms, K.type.limit(r))) : 0, good: good ? 1 : 0, max: 1 }; },
      classify(target, t) {
        if (!t) return "Pas de réponse";
        if (t === target) return "Exact";
        if (/\s/.test(t)) return "Un espace en trop";
        if (!target.includes("@")) { // adresse de site web
          if (t.toLowerCase() === target) return "Des majuscules";
          if (/[àâäéèêëîïôöùûüç]/i.test(t)) return "Un accent";
          if (target.startsWith("www.") && !t.startsWith("www.")) return "Le « www. » oublié";
          if (target.includes("-") && !t.includes("-")) return "Le tiret - oublié";
          if (t.replace(/\./g, "") === target.replace(/\./g, "")) return "Un point oublié ou en trop";
          if (t.split(".").pop() !== target.split(".").pop()) return "La fin (.fr) différente";
          return "Une lettre différente";
        }
        if (!t.includes("@")) return "L'arobase @ oubliée";
        if (t.toLowerCase() === target) return "Des majuscules";
        if (/[àâäéèêëîïôöùûüç]/i.test(t) && !/[àâäéèêëîïôöùûüç]/i.test(target)) return "Un accent";
        if (target.includes("-") && !t.includes("-")) return "Le tiret - oublié";
        if (target.includes("_") && !t.includes("_")) return "Le tiret bas _ oublié";
        if (t.replace(/\./g, "") === target.replace(/\./g, "")) return "Un point oublié ou en trop";
        return "Une lettre différente";
      },
      myReveal: (r, a) => `<div class="lp-answer">La bonne réponse : <b class="mono">${esc(r.target)}</b></div>${a?.payload?.text ? `<div class="lp-yours">Vous avez écrit : <span class="mono">${esc(a.payload.text)}</span> → ${K.type.classify(r.target, a.payload.text)}</div>` : ""}<div class="lp-why">${r.why || ""}</div>`,
      hostPrompt: r => `<div class="lh-prompt">${r.prompt}</div><div class="lp-model big">${esc(r.target)}</div>`,
      hostLive: () => "",
      hostReveal(r, list) {
        const cats = {};
        list.forEach(a => { const c = K.type.classify(r.target, a.payload?.text); cats[c] = (cats[c] || 0) + 1; });
        const keys = Object.keys(cats).sort((a, b) => (a === "Exact" ? -1 : b === "Exact" ? 1 : cats[b] - cats[a]));
        const wrongs = [...new Set(list.map(a => a.payload?.text).filter(t => t && t !== r.target))].slice(0, 5);
        return `<div class="lh-reveal-visual"><div class="lp-model big">${esc(r.target)}</div>${wrongs.length ? `<h3>Quelques réponses du groupe (anonymes)</h3>${wrongs.map(w => `<div class="lh-wrong"><code>${esc(w)}</code></div>`).join("")}` : ""}</div>
          <div class="lh-reveal-side">${bars(keys, keys.map(k => cats[k]), keys.indexOf("Exact"))}<div class="lh-why">${r.why || ""}</div></div>`;
      }
    },

    /* ---------- 5. Le buzzer (le message se dévoile ligne par ligne) ---------- */
    buzz: {
      interval: r => (r.interval || 3) * 1000,
      limit: r => Math.ceil((r.lines.length * K.buzz.interval(r)) / 1000) + 12,
      shown: (r, ms) => Math.min(r.lines.length, 1 + Math.floor(ms / K.buzz.interval(r))),
      play(ctx) {
        const r = ctx.round;
        ctx.el.innerHTML = `<div class="lp-prompt">${r.prompt || "Le message apparaît ligne par ligne. Dès que vous êtes sûr que c'est une arnaque : appuyez !"}</div>
          <div class="lp-buzz-mail">${r.head || ""}<div class="lp-buzz-lines"></div></div>
          <div class="lp-buzz-btns"><button type="button" class="lp-buzz">🚩 C'est une arnaque !</button><button type="button" class="lp-normal" disabled>✅ Ça me semble normal</button></div>`;
        const lines = ctx.el.querySelector(".lp-buzz-lines");
        const tick = () => {
          const n = K.buzz.shown(r, ctx.elapsed());
          lines.innerHTML = r.lines.slice(0, n).map(l => `<p>${l}</p>`).join("");
          if (n >= r.lines.length) ctx.el.querySelector(".lp-normal").disabled = false;
        };
        tick(); const t = setInterval(tick, 400); ctx.onStop(() => clearInterval(t));
        ctx.el.querySelector(".lp-buzz").addEventListener("click", () => ctx.submit({ buzz: K.buzz.shown(r, ctx.elapsed()) }, true));
        ctx.el.querySelector(".lp-normal").addEventListener("click", () => ctx.submit({ buzz: 0 }, true));
      },
      score(r, p) {
        const b = p?.buzz ?? -1;
        if (r.fake) return b > 0 ? { points: 300 + Math.round((700 * (r.lines.length - b + 1)) / r.lines.length), good: 1, max: 1 } : { points: 0, good: 0, max: 1 };
        return b === 0 ? { points: 600, good: 1, max: 1 } : { points: 0, good: 0, max: 1 };
      },
      myReveal: (r, a) => {
        const b = a?.payload?.buzz;
        const mine = b > 0 ? `Vous avez appuyé à la ligne ${b}.` : b === 0 ? "Vous avez dit « normal »." : "Pas de réponse.";
        return `<div class="lp-answer">${r.fake ? "🚩 C'était une <b>arnaque</b>." : "✅ C'était un <b>vrai message</b>."} ${mine}</div><div class="lp-why">${r.why || ""}</div>`;
      },
      hostPrompt: r => `<div class="lh-prompt small">${r.prompt || "Le message apparaît ligne par ligne…"}</div><div class="lp-buzz-mail host">${r.head || ""}<div class="lh-buzz-lines"></div></div>`,
      hostLive(r, list, ms) {
        const n = K.buzz.shown(r, ms);
        const el = document.querySelector(".lh-buzz-lines");
        if (el) el.innerHTML = r.lines.slice(0, n).map(l => `<p>${l}</p>`).join("");
        return `🚩 <b>${list.filter(a => a.payload?.buzz > 0).length}</b> ont déjà buzzé`;
      },
      hostReveal(r, list) {
        const at = k => list.filter(a => a.payload?.buzz === k + 1).length;
        const normal = list.filter(a => a.payload?.buzz === 0).length;
        return `<div class="lh-reveal-visual"><div class="lp-buzz-mail host">${r.head || ""}${r.lines.map((l, k) => `<div class="lh-buzz-row"><p>${l}</p><span class="lh-buzz-n ${at(k) ? "on" : ""}">${at(k) ? `🚩 ${at(k)}` : ""}</span></div>`).join("")}</div></div>
          <div class="lh-reveal-side"><div class="l-verdict ${r.fake ? "ko" : "ok"}">${r.fake ? "🚩 ARNAQUE" : "✅ VRAI MESSAGE"}</div>
          <div class="lh-big-stat"><b>${list.length - normal}</b> ont buzzé · <b>${normal}</b> ont dit « normal »</div><div class="lh-why">${r.why || ""}</div></div>`;
      }
    },

    /* ---------- 6. Fabriquer (une phrase de passe solide) ---------- */
    make: {
      limit: r => r.limit || 90,
      play(ctx) {
        const r = ctx.round;
        ctx.el.innerHTML = `<div class="lp-prompt">${r.prompt}</div>
          <input class="lp-input lp-make" autocomplete="off" spellcheck="false" autocapitalize="off" aria-label="Votre phrase de passe" placeholder="${r.placeholder || "Votre phrase de passe d'entraînement…"}">
          <div class="lp-make-gauge"></div>
          ${r.hint ? `<div class="lp-hint">💡 ${r.hint}</div>` : ""}
          <button type="button" class="lp-validate" disabled>Valider ✔</button>`;
        const inp = ctx.el.querySelector(".lp-make"), slot = ctx.el.querySelector(".lp-make-gauge"), btn = ctx.el.querySelector(".lp-validate");
        inp.focus();
        const upd = () => { const s = AN.pw.strength(inp.value); slot.innerHTML = AN.pw.gauge(inp.value); btn.disabled = !inp.value.trim(); };
        upd();
        inp.addEventListener("input", upd);
        const go = () => { if (inp.value.trim()) ctx.submit({ text: inp.value.trim() }, true); };
        btn.addEventListener("click", go);
        inp.addEventListener("keydown", e => { if (e.key === "Enter") go(); });
      },
      score(r, p, ms) {
        if (!p?.text) return { points: 0, good: 0, max: 1 };
        const s = AN.pw.strength(p.text);
        const good = s.score >= 3 ? 1 : 0;
        return { points: s.score * 250 + (good ? Math.round(250 * speed(ms, K.make.limit(r))) : 0), good, max: 1 };
      },
      myReveal: (r, a) => {
        if (!a?.payload?.text) return `<div class="lp-answer">Pas de réponse cette fois-ci.</div><div class="lp-why">${r.why || ""}</div>`;
        const s = AN.pw.strength(a.payload.text);
        return `<div class="lp-answer">Votre phrase : <b class="mono">${esc(a.payload.text)}</b></div><div class="lp-yours"><b style="color:${s.color}">${s.label}</b> · un logiciel la trouverait ${s.time === "instantanément" ? "<b>instantanément</b>" : `en <b>${s.time}</b>`}</div><div class="lp-why">${r.why || ""}</div>`;
      },
      hostPrompt: r => `<div class="lh-prompt">${r.prompt}</div>${r.example ? `<div class="lh-make-ex">Exemple : <b>${r.example}</b></div>` : ""}`,
      hostLive: (r, list) => { const solid = list.filter(a => AN.pw.strength(a.payload?.text).score >= 3).length; return `🛡️ <b>${solid}</b> phrase(s) solide(s) sur ${list.length}`; },
      hostReveal(r, list) {
        const scored = list.map(a => ({ s: AN.pw.strength(a.payload?.text || "") })).filter(x => x.s.score != null);
        const buckets = [0, 0, 0, 0, 0]; scored.forEach(x => buckets[x.s.score]++);
        const solid = scored.filter(x => x.s.score >= 3).length;
        return `<div class="lh-reveal-visual"><div class="lh-big-stat"><b>${solid} / ${list.length}</b> phrases solides 🛡️</div>
            <p class="lh-make-tip">Les phrases du groupe restent secrètes : on regarde seulement leur solidité.</p></div>
          <div class="lh-reveal-side">${bars(AN.pw.LABELS, buckets, [3, 4])}<div class="lh-why">${r.why || ""}</div></div>`;
      }
    }
  };

  /* ---------------- calculs sur les réponses ---------------- */
  const forRun = (answers, gid) => answers.filter(a => a.gid === gid);
  const roundList = (answers, idx) => answers.map(a => a.rounds?.[idx]).filter(Boolean);
  function ranking(answers) {
    return answers.map(a => {
      const rs = Object.values(a.rounds || {});
      return { name: a.name, points: rs.reduce((s, r) => s + (r.points || 0), 0), good: rs.reduce((s, r) => s + (r.good || 0), 0), max: rs.reduce((s, r) => s + (r.max || 0), 0), ms: rs.reduce((s, r) => s + (r.ms || 0), 0) };
    }).sort((a, b) => b.points - a.points || a.ms - b.ms);
  }
  const cheer = (good, max) => {
    const r = max ? good / max : 0;
    return r >= 0.8 ? "Bravo, excellent ! 🎉" : r >= 0.5 ? "Très bien, vous progressez ! 👏" : "Merci d'avoir joué ! On revoit tout ensemble, c'est comme ça qu'on apprend. 🫶";
  };

  /* =========================================================
     ÉCRAN DU FORMATEUR (dans la diapositive projetée)
     ========================================================= */
  function host(gameId, el, { store, workshop, onEnd, players: playersFn }) {
    const g = defs[gameId];
    if (!g || !workshop) { toast("Choisissez d'abord un groupe actif pour lancer un jeu.", "bad", 6000); return null; }
    const wid = workshop.id;
    const state = { gid: uid().slice(0, 10), idx: 0, phase: "play", roundStart: Date.now(), answers: [] };
    let timer = null, unsub = null;
    const players = () => (playersFn ? playersFn() : (workshop.seats || []).filter(s => s.displayName).length);
    const publish = () => store.setGame(wid, { gid: state.gid, gameId, idx: state.idx, phase: state.phase, at: Date.now(), teacherUid: workshop.teacherUid }).catch(e => toast(e.message, "bad"));
    const round = () => g.rounds[state.idx];
    const list = () => roundList(forRun(state.answers, state.gid), state.idx);

    function draw() {
      const r = round(), k = K[r.kind];
      const head = `<div class="lh-head"><span class="lh-title">${g.icon || "🎮"} ${esc(g.title)}</span>${g.rounds.length > 1 ? `<span class="lh-round">Manche ${state.idx + 1} / ${g.rounds.length}</span>` : ""}
        <button type="button" class="lh-stop" data-lh="stop" title="Arrêter le jeu">✕ Arrêter</button></div>`;
      if (state.phase === "play") {
        el.innerHTML = `${head}<div class="lh-body">${k.hostPrompt(r)}</div>
          <div class="lh-foot"><div class="lh-timer"><span></span><b></b></div><div class="lh-count"></div><div class="lh-live"></div>
          <button type="button" class="l-btn" data-lh="reveal">👀 Révéler</button></div>`;
        tick();
      } else if (state.phase === "reveal") {
        const last = state.idx === g.rounds.length - 1;
        el.innerHTML = `${head}<div class="lh-body lh-reveal">${k.hostReveal(r, list())}</div>
          <div class="lh-foot"><div class="lh-count">${list().length} réponse(s)</div>
          <button type="button" class="l-btn" data-lh="${last ? (g.noRank ? "summary" : "podium") : "next"}">${last ? (g.noRank ? "📋 Le bilan du groupe" : "🏆 Le classement") : "Manche suivante →"}</button></div>`;
      } else if (state.phase === "podium") {
        const rk = ranking(forRun(state.answers, state.gid));
        const top = rk.filter(x => x.points > 0).slice(0, 3), medals = ["🥇", "🥈", "🥉"], order = [1, 0, 2];
        const totalGood = rk.reduce((s, x) => s + x.good, 0);
        el.innerHTML = `${head}<div class="lh-body"><div class="lh-podium">${order.filter(i => top[i]).map(i => `<div class="lh-step s${i}"><div class="lh-medal">${medals[i]}</div><b>${esc(top[i].name)}</b><small>${top[i].points} pts</small><div class="lh-block"></div></div>`).join("")}</div>
          <p class="lh-all">👏 Bravo à tous les <b>${rk.length}</b> participants : <b>${totalGood}</b> bonnes réponses ensemble !</p></div>
          <div class="lh-foot"><button type="button" class="l-btn" data-lh="end">Terminer le jeu et continuer →</button></div>`;
      } else if (state.phase === "summary") {
        const all = forRun(state.answers, state.gid);
        el.innerHTML = `${head}<div class="lh-body"><h3>Les réponses du groupe</h3><ol class="lh-summary">${g.rounds.map((r, i) => { const l = roundList(all, i); const ok = l.filter(a => a.good).length; return `<li><span>${r.short || r.prompt.replace(/<[^>]+>/g, "").slice(0, 80)}</span><b>${pct(ok, l.length)} % de bonnes réponses</b></li>`; }).join("")}</ol>
          <p class="lh-all">🫶 Merci à tous ! L'important : savoir quoi faire, calmement.</p></div>
          <div class="lh-foot"><button type="button" class="l-btn" data-lh="end">Terminer le jeu et continuer →</button></div>`;
      }
    }
    function tick() {
      clearInterval(timer);
      const r = round(), k = K[r.kind], lim = k.limit(r) * 1000;
      const upd = () => {
        const ms = Date.now() - state.roundStart, left = Math.max(0, Math.ceil((lim - ms) / 1000));
        const t = el.querySelector(".lh-timer"); if (!t) return;
        t.querySelector("span").style.width = `${Math.max(0, 100 - (100 * ms) / lim)}%`;
        t.querySelector("b").textContent = left ? `${left} s` : "Temps écoulé";
        const l = list(), done = l.filter(a => a.done).length, n = Math.max(players(), forRun(state.answers, state.gid).length);
        el.querySelector(".lh-count").innerHTML = `💻 <b>${done}</b> / ${n} ont répondu`;
        el.querySelector(".lh-live").innerHTML = k.hostLive(r, l, ms) || "";
        const btn = el.querySelector('[data-lh="reveal"]');
        if (btn) btn.classList.toggle("pulse", !left || (n > 0 && done >= n));
      };
      upd(); timer = setInterval(upd, 500);
    }
    el.addEventListener("click", e => {
      const b = e.target.closest("[data-lh]"); if (!b) return;
      const a = b.dataset.lh;
      if (a === "reveal") { clearInterval(timer); state.phase = "reveal"; publish(); draw(); }
      else if (a === "next") { state.idx++; state.phase = "play"; state.roundStart = Date.now(); publish(); draw(); }
      else if (a === "podium" || a === "summary") { state.phase = a; publish(); draw(); }
      else if (a === "end" || a === "stop") stop(true);
    });
    function stop(fromUser) {
      clearInterval(timer); unsub?.();
      store.setGame(wid, null).catch(() => {});
      ctl.running = false;
      if (fromUser) onEnd?.();
    }
    const ctl = { running: true, stop: () => stop(false) };
    (async () => {
      await store.clearGameAnswers(wid).catch(() => {});
      unsub = store.watchGameAnswers(wid, a => { state.answers = a || []; if (state.phase === "play") return; if (state.phase === "reveal") { /* réponses tardives */ } });
      state.roundStart = Date.now();
      await publish();
      draw();
    })();
    return ctl;
  }

  /* =========================================================
     ÉCRAN DU PARTICIPANT (fenêtre qui s'ouvre toute seule)
     ========================================================= */
  const P = { ctx: null, game: null, answer: null, el: null, stops: [], key: "" };
  function playerInit(ctx) { P.ctx = ctx; P.answer = null; P.key = ""; }
  function overlay() {
    if (P.el) return P.el;
    P.el = document.createElement("div");
    P.el.className = "lg-overlay hidden"; P.el.setAttribute("role", "dialog"); P.el.setAttribute("aria-label", "Jeu en direct");
    document.body.appendChild(P.el);
    return P.el;
  }
  const stopAll = () => { P.stops.forEach(f => { try { f(); } catch (e) {} }); P.stops = []; };
  function closePlayer() { stopAll(); if (P.el) { P.el.classList.add("hidden"); P.el.innerHTML = ""; } document.documentElement.classList.remove("in-game"); P.key = ""; }

  function onGame(game) {
    if (!P.ctx) return;
    if (!game || !defs[game.gameId]) { closePlayer(); P.game = null; return; }
    if (!P.answer || P.answer.gid !== game.gid) P.answer = { gid: game.gid, seatId: P.ctx.sid, name: P.ctx.name().slice(0, 30), rounds: {}, updatedAt: Date.now() };
    P.game = game;
    const key = `${game.gid}|${game.idx}|${game.phase}`;
    if (key === P.key) return; // rien de nouveau
    P.key = key;
    renderPlayer();
  }
  function save() { P.answer.updatedAt = Date.now(); return P.ctx.store.submitGameAnswer(P.ctx.wid, P.ctx.sid, JSON.parse(JSON.stringify(P.answer))).catch(e => toast("Réponse non envoyée : " + e.message, "bad")); }

  function renderPlayer() {
    stopAll();
    const game = P.game, g = defs[game.gameId], r = g.rounds[game.idx], k = K[r.kind];
    const el = overlay(); el.classList.remove("hidden"); document.documentElement.classList.add("in-game");
    const head = `<div class="lg-head"><span>${g.icon || "🎮"} ${esc(g.title)}</span>${g.rounds.length > 1 ? `<span class="lg-round">Manche ${game.idx + 1} / ${g.rounds.length}</span>` : ""}<span class="lg-me">👤 ${esc(P.answer.name)}</span></div>`;
    const mine = P.answer.rounds[game.idx];

    if (game.phase === "play") {
      if (mine?.done) { el.innerHTML = `${head}<div class="lg-wait"><div class="lg-big">✅</div><h2>Réponse enregistrée !</h2><p>Regardez l'écran projeté : la réponse arrive bientôt.</p></div>`; return; }
      const start = Date.now() - (mine?.ms || 0), lim = k.limit(r) * 1000;
      el.innerHTML = `${head}<div class="lg-timer"><span></span></div><div class="lg-body"></div>`;
      const body = el.querySelector(".lg-body");
      const bar = el.querySelector(".lg-timer span");
      let finished = false;
      const ctx = {
        el: body, round: r, saved: mine, seed: P.ctx.sid + game.gid + game.idx,
        elapsed: () => Date.now() - start,
        onStop: f => P.stops.push(f),
        submit(payload, final) {
          if (finished) return;
          const ms = Date.now() - start;
          const sc = k.score(r, payload, ms);
          P.answer.rounds[game.idx] = { payload, ms, ...sc, done: !!final };
          save();
          if (final) { finished = true; stopAll(); el.innerHTML = `${head}<div class="lg-wait"><div class="lg-big">✅</div><h2>Réponse enregistrée !</h2><p>Regardez l'écran projeté : la réponse arrive bientôt.</p></div>`; }
        }
      };
      k.play(ctx);
      const t = setInterval(() => {
        const ms = ctx.elapsed();
        bar.style.width = `${Math.max(0, 100 - (100 * ms) / lim)}%`;
        if (ms >= lim && !finished) {
          // temps écoulé : on enregistre ce qui a été fait (sans pénalité)
          const cur = P.answer.rounds[game.idx];
          ctx.submit(cur?.payload || (r.kind === "buzz" ? { buzz: -1 } : {}), true);
        }
      }, 300);
      P.stops.push(() => clearInterval(t));
    } else if (game.phase === "reveal") {
      const a = P.answer.rounds[game.idx];
      const verdict = !a ? `<div class="lg-verdict none">⏱️ Pas de réponse cette fois-ci</div>`
        : r.kind === "spot" ? `<div class="lg-verdict ${a.good >= a.max ? "ok" : "mid"}">🔍 ${a.good} / ${a.max} indices · +${a.points} pts</div>`
        : `<div class="lg-verdict ${a.good ? "ok" : "ko"}">${a.good ? `✅ Bonne réponse ! +${a.points} pts` : "❌ Pas cette fois… regardez l'explication 👇"}</div>`;
      el.innerHTML = `${head}<div class="lg-body lg-reveal">${verdict}${k.myReveal(r, a)}<p class="lg-look">👀 Le formateur explique à l'écran.</p></div>`;
    } else if (game.phase === "podium" || game.phase === "summary") {
      const rs = Object.values(P.answer.rounds), good = rs.reduce((s, x) => s + (x.good || 0), 0), max = g.rounds.reduce((s, r, i) => s + (P.answer.rounds[i]?.max || K[r.kind].score(r, null, 0).max), 0), pts = rs.reduce((s, x) => s + (x.points || 0), 0);
      el.innerHTML = `${head}<div class="lg-wait"><div class="lg-big">${good / (max || 1) >= 0.8 ? "🏆" : "🌟"}</div><h2>${cheer(good, max)}</h2>
        ${good > 0 ? `<p class="lg-score">Vous avez <b>${good}</b> bonne(s) réponse(s) sur <b>${max}</b>${g.noRank ? "" : ` · <b>${pts}</b> points`}.</p>` : `<p class="lg-score">Chaque partie vous fait progresser : la prochaine sera la bonne !</p>`}
        <p>${g.noRank ? "Regardez l'écran : on fait le bilan ensemble." : "Regardez l'écran projeté pour le podium !"}</p></div>`;
    }
  }

  AN.live = { host, playerInit, onGame, closePlayer, engines: K };
})(window.AN);

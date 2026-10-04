/* =========================================================
   Moteur des missions
   Chaque mission s'enregistre avec :
     AN.missions.register("type", { steps: n, theme: "quiz", render(ctx) { ... } })
   ctx fournit tout ce qu'il faut : étape, aide par niveau,
   messages automatiques, réussites, écran final + quiz + fiche-mémo.
   Les clics sont délégués : <button data-act="nom"> -> ctx.act("nom", fn)
   ========================================================= */
(function (AN) {
  "use strict";
  const { $, esc } = AN.util;
  const registry = {};
  let current = null; // { ctx, def }

  function register(type, def) { registry[type] = def; }

  const box = () => $("#missionContent");

  // Délégation d'événements unique par zone de mission (élève ou projection formateur)
  function installDelegation(el) {
    if (!el || el.dataset.delegated) return;
    el.dataset.delegated = "1";
    const route = (attr, store) => e => {
      const cur = el.__an;
      if (!cur) return;
      const t = e.target.closest(`[${attr}]`);
      if (!t || !el.contains(t)) return;
      const fn = cur.ctx[store][t.getAttribute(attr)];
      if (fn) fn(t, e);
    };
    el.addEventListener("click", route("data-act", "_acts"));
    el.addEventListener("dblclick", route("data-dbl", "_dbls"));
    el.addEventListener("change", route("data-change", "_changes"));
    el.addEventListener("input", route("data-input", "_inputs"));
    el.addEventListener("keydown", e => {
      // Entrée sur un élément non-bouton marqué data-act / data-dbl (ex : fichier dans l'explorateur)
      const cur = el.__an;
      if (e.key !== "Enter" || !cur) return;
      const t = e.target.closest("[data-dbl],[data-act]");
      if (!t || t.tagName === "BUTTON" || t.tagName === "INPUT" || t.tagName === "TEXTAREA") return;
      e.preventDefault();
      const name = t.getAttribute("data-dbl") || t.getAttribute("data-act");
      const fn = (t.hasAttribute("data-dbl") ? cur.ctx._dbls : cur.ctx._acts)[name];
      if (fn) fn(t, e);
    });
  }

  /** API « factice » pour jouer une mission en projection : rien n'est enregistré. */
  function demoApi(onBack) {
    const noop = async () => {};
    return {
      state: { seat: { displayName: "le groupe", quizHistory: {} }, messages: [] },
      reportActivity() {}, updateMission: noop, sendSystemMessage: noop, addAchievement: noop, saveQuizHistory: noop,
      printMemo: m => AN.student.printMemo(m), backToDashboard: onBack || (() => {}), openMessages() { AN.util.toast("En projection, la messagerie n'est pas disponible.", "info"); }
    };
  }

  function makeCtx(mission, def, opts = {}) {
    const S = opts.api || AN.student;
    const demo = !!opts.demo;
    const ctx = {
      m: mission,
      def,
      demo,
      api: S,
      level: mission.level || "beginner",
      name: S.state.seat?.displayName || "Participant",
      box: opts.box || box(),
      local: {},
      _acts: {}, _dbls: {}, _changes: {}, _inputs: {}, _cleanups: [],

      act(name, fn) { ctx._acts[name] = fn; },
      dbl(name, fn) { ctx._dbls[name] = fn; },
      change(name, fn) { ctx._changes[name] = fn; },
      input(name, fn) { ctx._inputs[name] = fn; },
      onCleanup(fn) { ctx._cleanups.push(fn); },

      byLevel(o) { return o[ctx.level] ?? o.beginner; },
      isBeginner() { return ctx.level === "beginner"; },

      progress(step, total = def.steps || 3) {
        return `<div class="mission-progress" role="progressbar" aria-valuemin="0" aria-valuemax="${total}" aria-valuenow="${step}" aria-label="Étape ${Math.min(step + 1, total)} sur ${total}">${Array.from({ length: total }, (_, i) => `<i class="${i < step ? "done" : i === step ? "current" : ""}"></i>`).join("")}</div>`;
      },
      /** Aide affichée seulement au niveau Débutant (ou aux niveaux listés). */
      help(text, levels = ["beginner"]) {
        return levels.includes(ctx.level) ? `<div class="alert good help-tip" data-speak>💡 ${text}</div>` : "";
      },
      header(eyebrow, title, step) {
        return `<p class="eyebrow">${esc(eyebrow)}</p><h1>${esc(title)}</h1>${step != null ? ctx.progress(step) : ""}`;
      },

      html(markup) {
        ctx._acts = {}; ctx._dbls = {}; ctx._changes = {}; ctx._inputs = {};
        ctx.box.innerHTML = markup;
        AN.a11y?.decorate(ctx.box);
      },
      render() { def.render(ctx); },
      async go(step) {
        ctx.m.step = step;
        if (ctx.m.status !== "done") ctx.m.status = "in_progress";
        const patch = { step, status: ctx.m.status };
        if (!ctx.m.startedAt) { ctx.m.startedAt = Date.now(); patch.startedAt = ctx.m.startedAt; }
        S.reportActivity(ctx.m, step, def.steps || 3);
        if (!demo) AN.Analytics.recordStep(`step_${step}`, "enter");
        await S.updateMission(ctx.m.id, patch).catch(e => console.warn(e));
        def.render(ctx);
      },
      async autoMessage(subject, text) { await S.sendSystemMessage(subject, text).catch(e => console.warn(e)); },
      async achievement(key, label) { await S.addAchievement(key, label).catch(e => console.warn(e)); },

      /** Marque la mission terminée et affiche l'écran final (bravo + quiz + fiche-mémo). */
      async complete({ key, label, text, theme }) {
        if (key) await ctx.achievement(key, label);
        const total = def.steps || 3;
        ctx.m.step = total; ctx.m.status = "done"; ctx.m.completedAt = Date.now();
        S.reportActivity(ctx.m, total, total);
        await S.updateMission(ctx.m.id, { step: total, status: "done", completedAt: ctx.m.completedAt }).catch(e => console.warn(e));
        if (!demo) AN.Analytics.endMission(ctx.m);
        ctx.finalScreen({ text, theme: theme === null ? null : (theme || def.theme) });
      },
      /** Note sur 20 : enregistrée comme score de la mission (visible formateur et analytics). */
      async saveGrade(points, max) {
        const score = max ? Math.round((20 * points) / max) : 20;
        ctx.m.score = { score, total: 20 };
        await S.updateMission(ctx.m.id, { score: { score, total: 20 } }).catch(() => {});
        if (!demo) AN.Analytics.recordQuizAttempt(`grade_${ctx.m.id}`, score, 20, score >= 14, Date.now());
        return score;
      },
      finalScreen({ text, theme, questions }) {
        const total = def.steps || 3;
        ctx.html(`
          <p class="eyebrow">${demo ? "Exercice collectif terminé" : "Mission terminée"}</p>
          <h1>Bravo ${esc(ctx.name)} 🎉</h1>
          ${ctx.progress(total, total)}
          <div class="alert good" data-speak>${text || "Vous avez terminé cette mission."}</div>
          <section class="quiz" id="missionQuiz" aria-live="polite"></section>
          <div class="final-actions">
            ${demo ? "" : `<button type="button" class="secondary" data-act="memo">🖨 Imprimer ma fiche-mémo</button>`}
            <button type="button" class="primary" data-act="back">${demo ? "Terminer la projection" : "Retour à mon espace →"}</button>
          </div>`);
        ctx.act("memo", () => S.printMemo([ctx.m]));
        ctx.act("back", () => S.backToDashboard());
        const qs = questions || (ctx.m.type === "custom" ? ctx.m.custom?.questions : null);
        if (theme || (qs && qs.length)) {
          AN.quiz.mount($("#missionQuiz"), {
            theme, level: ctx.level, questions: qs || undefined,
            history: S.state.seat?.quizHistory || {},
            onHistory: h => S.saveQuizHistory(h),
            onDone: (score, total) => {
              if (total) {
                S.updateMission(ctx.m.id, { score: { score, total } }).catch(() => {});
                if (!demo) AN.Analytics.recordQuizAttempt(`quiz_${ctx.m.id}`, score, total, score >= (total * 0.7), Date.now());
              }
            }
          });
        } else {
          $("#missionQuiz").remove();
        }
      }
    };
    return ctx;
  }

  function open(mission) {
    close();
    const el = box();
    installDelegation(el);
    const def = registry[mission.type];
    if (!def) {
      el.innerHTML = `<div class="alert bad">Cette mission n'est pas disponible dans cette version.</div>`;
      return;
    }
    const ctx = makeCtx({ ...mission }, def);
    current = { ctx, def };
    el.__an = current;
    AN.student.reportActivity(ctx.m, ctx.m.step || 0, def.steps || 3);
    if (mission.status === "done") ctx.finalScreen({ text: "Vous avez déjà réussi cette mission. Vous pouvez la recommencer avec le bouton « ↺ Recommencer », ou imprimer votre fiche-mémo.", theme: def.theme });
    else def.render(ctx);
  }

  function close() {
    if (current) current.ctx._cleanups.forEach(fn => { try { fn(); } catch (e) {} });
    if (current?.ctx.box) current.ctx.box.__an = null;
    current = null;
  }

  /** Joue une mission dans un conteneur quelconque, sans rien enregistrer (projection collective). */
  function openDemo(type, el, { level = "beginner", onBack } = {}) {
    installDelegation(el);
    const def = registry[type];
    if (!def) { el.innerHTML = `<div class="alert bad">Exercice indisponible.</div>`; return () => {}; }
    const ctx = makeCtx({ id: "demo_" + type, type, level, step: 0, status: "assigned" }, def, { box: el, demo: true, api: demoApi(onBack) });
    el.__an = { ctx, def };
    def.render(ctx);
    return () => { ctx._cleanups.forEach(fn => { try { fn(); } catch (e) {} }); el.__an = null; };
  }

  /** Relance la mission depuis le début (bouton « Recommencer »). */
  function restart() {
    if (!current) return;
    const m = { ...current.ctx.m, step: 0, status: "in_progress" };
    AN.student.updateMission(m.id, { step: 0, status: "in_progress" }).catch(() => {});
    open(m);
  }

  AN.missions = { register, open, openDemo, close, restart, has: t => !!registry[t], get: t => registry[t], get current() { return current; } };
})(window.AN);

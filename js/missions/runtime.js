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

  // Délégation d'événements unique sur la zone de mission
  function installDelegation() {
    const el = box();
    if (!el || el.dataset.delegated) return;
    el.dataset.delegated = "1";
    const route = (attr, store) => e => {
      if (!current) return;
      const t = e.target.closest(`[${attr}]`);
      if (!t || !el.contains(t)) return;
      const fn = current.ctx[store][t.getAttribute(attr)];
      if (fn) fn(t, e);
    };
    el.addEventListener("click", route("data-act", "_acts"));
    el.addEventListener("dblclick", route("data-dbl", "_dbls"));
    el.addEventListener("change", route("data-change", "_changes"));
    el.addEventListener("input", route("data-input", "_inputs"));
    el.addEventListener("keydown", e => {
      // Entrée sur un élément non-bouton marqué data-act / data-dbl (ex : fichier dans l'explorateur)
      if (e.key !== "Enter" || !current) return;
      const t = e.target.closest("[data-dbl],[data-act]");
      if (!t || t.tagName === "BUTTON" || t.tagName === "INPUT") return;
      e.preventDefault();
      const name = t.getAttribute("data-dbl") || t.getAttribute("data-act");
      const fn = (t.hasAttribute("data-dbl") ? current.ctx._dbls : current.ctx._acts)[name];
      if (fn) fn(t, e);
    });
  }

  function makeCtx(mission, def) {
    const S = AN.student;
    const ctx = {
      m: mission,
      def,
      level: mission.level || "beginner",
      name: S.state.seat?.displayName || "Participant",
      box: box(),
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
        // Track step progression in analytics
        AN.Analytics.recordStep(`step_${step}`, "enter");
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
        // Track mission completion in analytics
        AN.Analytics.endMission(ctx.m);
        ctx.finalScreen({ text, theme: theme || def.theme });
      },
      finalScreen({ text, theme, questions }) {
        const total = def.steps || 3;
        ctx.html(`
          <p class="eyebrow">Mission terminée</p>
          <h1>Bravo ${esc(ctx.name)} 🎉</h1>
          ${ctx.progress(total, total)}
          <div class="alert good" data-speak>${text || "Vous avez terminé cette mission."}</div>
          <section class="quiz" id="missionQuiz" aria-live="polite"></section>
          <div class="final-actions">
            <button type="button" class="secondary" data-act="memo">🖨 Imprimer ma fiche-mémo</button>
            <button type="button" class="primary" data-act="back">Retour à mon espace →</button>
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
                // Track quiz completion in analytics
                AN.Analytics.recordQuizAttempt(`quiz_${ctx.m.id}`, score, total, score >= (total * 0.7), Date.now());
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
    installDelegation();
    const def = registry[mission.type];
    if (!def) {
      box().innerHTML = `<div class="alert bad">Cette mission n'est pas disponible dans cette version.</div>`;
      return;
    }
    const ctx = makeCtx({ ...mission }, def);
    current = { ctx, def };
    AN.student.reportActivity(ctx.m, ctx.m.step || 0, def.steps || 3);
    if (mission.status === "done") ctx.finalScreen({ text: "Vous avez déjà réussi cette mission. Vous pouvez refaire le quiz ou imprimer votre fiche-mémo.", theme: def.theme });
    else def.render(ctx);
  }

  function close() {
    if (current) current.ctx._cleanups.forEach(fn => { try { fn(); } catch (e) {} });
    current = null;
  }

  /** Relance la mission depuis le début (bouton « Recommencer »). */
  function restart() {
    if (!current) return;
    const m = { ...current.ctx.m, step: 0, status: "in_progress" };
    AN.student.updateMission(m.id, { step: 0, status: "in_progress" }).catch(() => {});
    open(m);
  }

  AN.missions = { register, open, close, restart, has: t => !!registry[t], get current() { return current; } };
})(window.AN);

/* =========================================================
   Moteur de quiz
   - questions tirées par thème et par niveau, sans répétition
     tant que la banque n'est pas épuisée (historique enregistré
     sur la place du participant : suit la personne d'un poste à l'autre)
   - l'ordre des réponses est mélangé (en V7, la bonne réponse
     était toujours la première affichée)
   ========================================================= */
(function (AN) {
  "use strict";
  const { esc, shuffle, levelName } = AN.util;

  function pick(theme, level, history, count = 3) {
    const bank = AN.quizBanks[theme]?.[level] || AN.quizBanks[theme]?.beginner || [];
    const key = `${theme}_${level}`;
    let seen = Array.isArray(history[key]) ? history[key] : [];
    let available = bank.filter(q => !seen.includes(q.id));
    if (available.length < Math.min(count, bank.length)) { seen = []; available = [...bank]; }
    const chosen = shuffle(available).slice(0, Math.min(count, available.length));
    return { questions: chosen, history: { ...history, [key]: [...seen, ...chosen.map(q => q.id)] } };
  }

  /**
   * mount(el, { theme, level, questions?, history?, onHistory?, onDone? })
   */
  function mount(el, opts) {
    let questions = opts.questions;
    if (!questions) {
      const r = pick(opts.theme, opts.level, opts.history || {});
      questions = r.questions;
      opts.onHistory && opts.onHistory(r.history);
    }
    const prepared = questions.map(q => {
      const order = shuffle(q.choices.map((c, i) => i));
      return { ...q, order };
    });
    const st = { i: 0, score: 0, answered: false };

    function render() {
      if (!prepared.length) {
        el.innerHTML = `<div class="alert good">Bravo, mission terminée !</div>`;
        opts.onDone && opts.onDone(0, 0);
        return;
      }
      const q = prepared[st.i];
      el.innerHTML = `
        <div class="level-tag">Quiz ${esc(levelName(opts.level))}</div>
        <h2>Petit quiz de confiance</h2>
        <p class="quiz-count"><strong>Question ${st.i + 1} / ${prepared.length}</strong></p>
        <p class="quiz-q" data-speak>${esc(q.q)}</p>
        <div class="quiz-choices" role="group" aria-label="Réponses">
          ${q.order.map(ci => `<button type="button" data-choice="${ci}">${esc(q.choices[ci])}</button>`).join("")}
        </div>
        <div class="quiz-feedback" aria-live="polite"></div>`;
      AN.a11y?.decorate(el);
    }

    el.addEventListener("click", e => {
      const btn = e.target.closest("[data-choice]");
      if (btn && !st.answered) {
        st.answered = true;
        const q = prepared[st.i];
        const choice = Number(btn.dataset.choice);
        const ok = choice === q.ok;
        if (ok) st.score++;
        el.querySelectorAll("[data-choice]").forEach(b => {
          b.disabled = true;
          if (Number(b.dataset.choice) === q.ok) b.classList.add("correct");
        });
        if (!ok) btn.classList.add("wrong");
        const last = st.i >= prepared.length - 1;
        el.querySelector(".quiz-feedback").innerHTML = `
          <div class="alert ${ok ? "good" : "warn"}"><strong>${ok ? "Bravo !" : "Pas grave."}</strong> ${esc(q.explain || "")}</div>
          <button type="button" class="primary" data-quiz-next>${last ? "Voir mon résultat →" : "Question suivante →"}</button>`;
        el.querySelector("[data-quiz-next]").focus();
        return;
      }
      if (e.target.closest("[data-quiz-next]")) {
        if (st.i < prepared.length - 1) { st.i++; st.answered = false; render(); el.querySelector("[data-choice]")?.focus(); return; }
        const total = prepared.length, score = st.score;
        let icon = "🌱", title = "Vous progressez !", text = "Chaque essai vous aide à prendre confiance.";
        if (score === total) { icon = "🏆"; title = "Excellent !"; text = "Toutes les réponses sont justes."; }
        else if (score >= Math.ceil(total / 2)) { icon = "🌟"; title = "Très bien !"; text = "Vous avez compris l'essentiel."; }
        el.innerHTML = `<div class="quiz-result"><div class="quiz-icon">${icon}</div><div class="level-tag">Niveau ${esc(levelName(opts.level))}</div>
          <h2>${title}</h2><p>Score : <strong>${score} / ${total}</strong></p><p>${text}</p></div>`;
        opts.onDone && opts.onDone(score, total);
      }
    });
    render();
  }

  AN.quiz = { mount, pick };
})(window.AN);

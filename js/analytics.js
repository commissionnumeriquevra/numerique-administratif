/* =========================================================
   SYSTÈME DE TÉLÉMÉTRIE — Learning Analytics
   Tracking : temps/mission, mouvements souris, hésitations,
   erreurs, points forts/faibles pour personnaliser l'apprentissage
   ========================================================= */
(function (AN) {
  "use strict";
  const { $ } = AN.util;

  const A = {
    enabled: true,
    workshopId: null, seatId: null, uid: null,
    missionData: null,
    mouseEvents: [],
    keyboardEvents: [],
    focusChanges: [],
    errors: [],
    timings: {},
    hesitations: [],  // moments d'inactivité > 3s
    quizAttempts: [],
    store: null
  };

  /* ======================= INITIALISATION ======================= */
  function init(store, workshopId, seatId, uid) {
    A.store = store;
    A.workshopId = workshopId;
    A.seatId = seatId;
    A.uid = uid;
    startTracking();
  }

  function startTracking() {
    if (!A.enabled) return;
    document.addEventListener("mousemove", trackMouse);
    document.addEventListener("keydown", trackKeyboard);
    document.addEventListener("focus", trackFocus, true);
    document.addEventListener("blur", trackBlur, true);
    document.addEventListener("error", trackError, true);
  }

  function stopTracking() {
    document.removeEventListener("mousemove", trackMouse);
    document.removeEventListener("keydown", trackKeyboard);
    document.removeEventListener("focus", trackFocus, true);
    document.removeEventListener("blur", trackBlur, true);
    document.removeEventListener("error", trackError, true);
  }

  /* ======================= MISSION TRACKING ======================= */
  function startMission(mission) {
    A.missionData = {
      id: mission.id,
      type: mission.type,
      level: mission.level,
      startedAt: Date.now(),
      endedAt: null,
      completedAt: null,
      score: null,
      attempts: 0,
      stepsVisited: new Set(),
      lastActivityAt: Date.now(),
      idleTime: 0,
      mouseClicks: 0,
      keystrokes: 0,
      mistakesCount: 0,
      hints: 0,
      timePerStep: {}
    };
    A.mouseEvents = [];
    A.keyboardEvents = [];
    A.focusChanges = [];
    A.errors = [];
    A.hesitations = [];
    A.quizAttempts = [];
    A.timings = { stepsStart: {} };
  }

  function endMission(mission, score = null) {
    if (!A.missionData || A.missionData.id !== mission.id) return;
    A.missionData.endedAt = Date.now();
    A.missionData.score = score;
    A.missionData.completedAt = score ? Date.now() : null;
    saveMissionAnalytics();
  }

  function recordStep(stepKey, action = "enter") {
    if (!A.missionData) return;
    const now = Date.now();
    if (action === "enter") {
      A.missionData.stepsVisited.add(stepKey);
      A.timings.stepsStart[stepKey] = now;
    } else if (action === "exit") {
      const duration = now - (A.timings.stepsStart[stepKey] || now);
      A.missionData.timePerStep[stepKey] = duration;
    }
  }

  /* ======================= MOUSE TRACKING ======================= */
  let lastMousePos = { x: 0, y: 0 };
  let mouseInactive = false;
  let mouseInactiveTimer = null;

  function trackMouse(e) {
    if (!A.missionData) return;
    A.missionData.lastActivityAt = Date.now();
    A.missionData.mouseClicks++;
    lastMousePos = { x: e.clientX, y: e.clientY };

    // Heatmap simplifié : zones cliquées
    const target = e.target;
    const rect = target.getBoundingClientRect();
    A.mouseEvents.push({
      t: Date.now(),
      x: e.clientX,
      y: e.clientY,
      rel: target.className,
      tag: target.tagName,
      clicked: e.type === "click"
    });

    // Réinitialiser timer d'inactivité
    clearTimeout(mouseInactiveTimer);
    mouseInactive = false;
    mouseInactiveTimer = setTimeout(() => {
      mouseInactive = true;
      if (A.missionData) A.hesitations.push({ t: Date.now(), duration: 0 });
    }, 3000);
  }

  /* ======================= KEYBOARD TRACKING ======================= */
  function trackKeyboard(e) {
    if (!A.missionData) return;
    A.missionData.lastActivityAt = Date.now();
    A.missionData.keystrokes++;
    const target = e.target;
    const isInput = ["INPUT", "TEXTAREA"].includes(target.tagName);
    A.keyboardEvents.push({
      t: Date.now(),
      key: e.key,
      isInput,
      target: target.className,
      code: e.code
    });
  }

  /* ======================= FOCUS/BLUR TRACKING ======================= */
  function trackFocus(e) {
    if (!A.missionData) return;
    const target = e.target;
    if (["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName)) {
      A.focusChanges.push({
        t: Date.now(),
        action: "focus",
        field: target.name || target.className,
        type: target.type
      });
    }
  }

  function trackBlur(e) {
    if (!A.missionData) return;
    const target = e.target;
    if (["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName)) {
      A.focusChanges.push({
        t: Date.now(),
        action: "blur",
        field: target.name || target.className,
        type: target.type
      });
    }
  }

  /* ======================= ERROR TRACKING ======================= */
  function trackError(e) {
    if (!A.missionData) return;
    A.missionData.mistakesCount++;
    A.errors.push({
      t: Date.now(),
      message: e.message || String(e),
      type: e.type,
      target: e.target?.className || ""
    });
  }

  /* ======================= QUIZ TRACKING ======================= */
  function recordQuizAttempt(questionId, chosenAnswer, correctAnswer, isCorrect, timeSpent) {
    if (!A.missionData) return;
    A.quizAttempts.push({
      t: Date.now(),
      questionId,
      chosen: chosenAnswer,
      correct: correctAnswer,
      isCorrect,
      timeSpent
    });
    if (!isCorrect) A.missionData.mistakesCount++;
  }

  function recordHint(hintId, step) {
    if (!A.missionData) return;
    A.missionData.hints++;
  }

  /* ======================= ANALYSE & SAUVEGARDE ======================= */
  function analyzePerformance() {
    if (!A.missionData) return null;

    const analysis = {
      missionId: A.missionData.id,
      type: A.missionData.type,
      level: A.missionData.level,
      duration: A.missionData.endedAt - A.missionData.startedAt,
      completed: !!A.missionData.completedAt,
      score: A.missionData.score,

      // Vitesse et rythme
      mouseActivityCount: A.missionData.mouseClicks,
      keyboardActivityCount: A.missionData.keystrokes,
      focusChanges: A.focusChanges.length,
      hesitationCount: A.hesitations.length,
      hesitationDuration: A.hesitations.reduce((sum, h) => sum + h.duration, 0),

      // Erreurs
      errorCount: A.missionData.mistakesCount,
      quizAttempts: A.quizAttempts.length,
      quizCorrect: A.quizAttempts.filter(q => q.isCorrect).length,
      hintsUsed: A.missionData.hints,

      // Difficultés repérées
      difficultSteps: identifyDifficultSteps(),
      strugglingFields: identifyStrugglingFields(),
      timePerStep: A.missionData.timePerStep,

      // Métadonnées
      stepsVisited: Array.from(A.missionData.stepsVisited),
      mouseMovements: A.mouseEvents.length,
      focusPattern: analyzeFocusPattern(),
      clickPattern: analyzeClickPattern()
    };

    return analysis;
  }

  function identifyDifficultSteps() {
    const steps = A.missionData.timePerStep;
    const avg = Object.values(steps).reduce((s, t) => s + t, 0) / Object.keys(steps).length || 0;
    return Object.entries(steps)
      .filter(([_, duration]) => duration > avg * 1.5)
      .map(([step, duration]) => ({ step, duration, relativeSlowness: (duration / avg).toFixed(2) }));
  }

  function identifyStrugglingFields() {
    const fields = {};
    A.focusChanges.forEach(fc => {
      const field = fc.field;
      fields[field] = (fields[field] || 0) + 1;
    });
    // Champs avec beaucoup de focus/blur = hésitation
    return Object.entries(fields)
      .filter(([_, count]) => count > 3)
      .map(([field, count]) => ({ field, focusCount: count }));
  }

  function analyzeFocusPattern() {
    const pattern = [];
    for (let i = 0; i < A.focusChanges.length - 1; i++) {
      const duration = A.focusChanges[i + 1].t - A.focusChanges[i].t;
      if (duration > 5000) pattern.push({ field: A.focusChanges[i].field, duration });
    }
    return pattern;
  }

  function analyzeClickPattern() {
    const targets = {};
    A.mouseEvents.forEach(me => {
      const key = me.tag + ":" + me.rel;
      targets[key] = (targets[key] || 0) + 1;
    });
    return targets;
  }

  function saveMissionAnalytics() {
    if (!A.store || !A.missionData) return;
    const analysis = analyzePerformance();
    if (!analysis) return;

    // Sauvegarder dans Firestore / DemoStore
    const analyticsData = {
      id: `${A.missionData.id}_${Date.now()}`,
      workshopId: A.workshopId,
      seatId: A.seatId,
      uid: A.uid,
      createdAt: Date.now(),
      analysis
    };

    // Étendre le seat avec les analytics
    A.store.updateMySeat(A.workshopId, A.seatId, {
      analytics: analyticsData
    }).catch(e => console.error("Analytics save failed:", e));
  }

  /* ======================= EXPORT ANALYTICS ======================= */
  function exportAnalytics(format = "json") {
    const data = {
      mission: A.missionData,
      mouseEvents: A.mouseEvents,
      keyboardEvents: A.keyboardEvents,
      focusChanges: A.focusChanges,
      errors: A.errors,
      hesitations: A.hesitations,
      quizAttempts: A.quizAttempts,
      analysis: analyzePerformance()
    };

    if (format === "json") return JSON.stringify(data, null, 2);
    if (format === "csv") return convertAnalyticsToCSV(data);
    return data;
  }

  function convertAnalyticsToCSV(data) {
    const lines = [];
    lines.push("Type,Timestamp,Details");
    data.mouseEvents.forEach(e => {
      lines.push(`Mouse,${new Date(e.t).toISOString()},"X:${e.x} Y:${e.y} Target:${e.rel}"`);
    });
    data.keyboardEvents.forEach(e => {
      lines.push(`Keyboard,${new Date(e.t).toISOString()},"Key:${e.key} Input:${e.isInput}"`);
    });
    data.errors.forEach(e => {
      lines.push(`Error,${new Date(e.t).toISOString()},"${e.message}"`);
    });
    return lines.join("\n");
  }

  /* ======================= RÉSUMÉ DE PERFORMANCE ======================= */
  function generatePerformanceSummary() {
    const analysis = analyzePerformance();
    if (!analysis) return null;

    const strengths = [];
    const weaknesses = [];

    // Vitesse
    if (analysis.duration < 120000) strengths.push("Rapide et efficace");
    if (analysis.hesitationCount > 5) weaknesses.push("Nombreuses pauses et hésitations");

    // Précision
    if (analysis.quizCorrect / Math.max(1, analysis.quizAttempts) > 0.8) {
      strengths.push("Bonne compréhension du contenu");
    } else if (analysis.quizCorrect / Math.max(1, analysis.quizAttempts) < 0.5) {
      weaknesses.push("Difficultés à répondre aux quiz");
    }

    // Erreurs
    if (analysis.errorCount === 0) strengths.push("Pas d'erreurs");
    if (analysis.errorCount > 3) weaknesses.push("Plusieurs erreurs détectées");

    // Aide
    if (analysis.hintsUsed === 0) strengths.push("Autonome");
    if (analysis.hintsUsed > 3) weaknesses.push("Recours fréquent aux indices");

    return {
      strengths,
      weaknesses,
      confidence: analysis.completed ? "high" : "medium",
      recommendation: generateRecommendation(analysis)
    };
  }

  function generateRecommendation(analysis) {
    if (!analysis.completed) return "Mission non complétée. À reprendre.";

    const quizRate = analysis.quizAttempts > 0 ? analysis.quizCorrect / analysis.quizAttempts : 1;
    if (analysis.level === "beginner" && quizRate > 0.7) return "Peut passer à Intermédiaire";
    if (analysis.level === "intermediate" && quizRate > 0.7) return "Peut passer à Expert";
    if (quizRate < 0.5) return "Reprendre avec du soutien ou une mission plus simple";
    if (analysis.difficultSteps.length > 0) return `Besoin de révision sur : ${analysis.difficultSteps.map(s => s.step).join(", ")}`;

    return "Progression normale. Continuer.";
  }

  /* ======================= API PUBLIQUE ======================= */
  AN.Analytics = {
    init,
    startMission,
    endMission,
    recordStep,
    recordQuizAttempt,
    recordHint,
    trackError: trackError,
    exportAnalytics,
    generatePerformanceSummary,
    getAnalysis: () => analyzePerformance(),
    stopTracking
  };
})(window.AN);

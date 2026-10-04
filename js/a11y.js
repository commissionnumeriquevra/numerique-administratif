/* =========================================================
   Confort de lecture : taille du texte, contraste renforcé,
   lecture à voix haute (synthèse vocale du navigateur, gratuite,
   rien n'est envoyé sur Internet par l'application).
   ========================================================= */
(function (AN) {
  "use strict";
  const { $ } = AN.util;
  const KEY = "an_a11y";
  const SCALES = [0.9, 1, 1.15, 1.3, 1.5];
  let prefs = { scale: 1, contrast: false };
  try { prefs = { ...prefs, ...JSON.parse(localStorage.getItem(KEY) || "{}") }; } catch (e) {}
  const save = () => { try { localStorage.setItem(KEY, JSON.stringify(prefs)); } catch (e) {} };

  function apply() {
    document.documentElement.style.setProperty("--scale", prefs.scale);
    document.body.classList.toggle("hc", !!prefs.contrast);
    $("#a11yContrast")?.setAttribute("aria-pressed", prefs.contrast ? "true" : "false");
  }
  function size(delta) {
    let i = SCALES.indexOf(prefs.scale); if (i < 0) i = 1;
    i = Math.max(0, Math.min(SCALES.length - 1, i + delta));
    prefs.scale = SCALES[i]; save(); apply();
    AN.util.toast(`Taille du texte : ${Math.round(prefs.scale * 100)} %`, "info", 1600);
  }

  /* ----- voix ----- */
  const synth = window.speechSynthesis;
  let voice = null;
  function pickVoice() {
    if (!synth) return;
    const v = synth.getVoices();
    voice = v.find(x => /fr[-_]FR/i.test(x.lang) && /google|natural|online|amelie|thomas/i.test(x.name)) || v.find(x => /^fr/i.test(x.lang)) || null;
  }
  if (synth) { pickVoice(); synth.onvoiceschanged = pickVoice; }
  function textOf(el) {
    const clone = el.cloneNode(true);
    clone.querySelectorAll(".speak-btn,script,style,[aria-hidden=true]").forEach(n => n.remove());
    return clone.textContent.replace(/\s+/g, " ").replace(/[⚠✓✅⚠️💡📬🔍]/g, "").trim();
  }
  function speak(text) {
    if (!synth) { AN.util.toast("La lecture à voix haute n'est pas disponible sur ce navigateur.", "bad"); return; }
    synth.cancel();
    if (!text) return;
    const u = new SpeechSynthesisUtterance(text);
    u.lang = "fr-FR"; u.rate = 0.92; if (voice) u.voice = voice;
    u.onend = u.onerror = () => document.body.classList.remove("speaking");
    document.body.classList.add("speaking");
    synth.speak(u);
  }
  function readPage() {
    if (synth && synth.speaking) { synth.cancel(); document.body.classList.remove("speaking"); return; }
    const screen = document.querySelector(".screen.active");
    if (!screen) return;
    const parts = [...screen.querySelectorAll("h1, h2, h3, p, li, label, .message-box, .alert, .consigne, button.primary")]
      .filter(e => e.offsetParent !== null && !e.closest(".teacher-screen"))
      .map(textOf).filter(Boolean);
    speak([...new Set(parts)].join(". ").slice(0, 3500));
  }
  /** Ajoute un petit bouton 🔊 aux consignes marquées data-speak. */
  function decorate(root) {
    if (!synth || !root) return;
    root.querySelectorAll("[data-speak]").forEach(el => {
      if (el.querySelector(":scope > .speak-btn")) return;
      const b = document.createElement("button");
      b.type = "button"; b.className = "speak-btn"; b.textContent = "🔊";
      b.setAttribute("aria-label", "Écouter ce texte");
      b.addEventListener("click", e => { e.stopPropagation(); speak(textOf(el)); });
      el.appendChild(b);
    });
  }

  function bind() {
    $("#a11yMinus").addEventListener("click", () => size(-1));
    $("#a11yPlus").addEventListener("click", () => size(1));
    $("#a11yContrast").addEventListener("click", () => { prefs.contrast = !prefs.contrast; save(); apply(); });
    $("#a11yRead").addEventListener("click", readPage);
    if (!synth) $("#a11yRead").classList.add("hidden");
    AN.on("screen", () => { if (synth) synth.cancel(); decorate(document.querySelector(".screen.active")); });
    apply();
  }

  AN.a11y = { bind, decorate, speak };
})(window.AN);

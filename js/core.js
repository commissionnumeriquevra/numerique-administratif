/* =========================================================
   Atelier numérique — noyau commun
   Utilitaires, écrans, événements, boîtes de dialogue, toasts.
   Scripts classiques (pas de modules) : l'application reste
   utilisable en double-cliquant sur index.html (mode démo).
   ========================================================= */
window.AN = window.AN || {};
(function (AN) {
  "use strict";

  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];

  function esc(s) {
    return String(s ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  }
  function uid() {
    if (crypto.randomUUID) return crypto.randomUUID();
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 10);
  }
  function randomDigits(n) {
    const a = new Uint32Array(n);
    crypto.getRandomValues(a);
    return [...a].map(x => x % 10).join("");
  }
  function shuffle(arr) {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }
  const LEVELS = { beginner: "Débutant", intermediate: "Intermédiaire", expert: "Expert" };
  const levelName = l => LEVELS[l] || l || "";
  const pct = (n, d) => (d > 0 ? Math.round((n / d) * 100) : 0);
  function timeAgo(ts) {
    if (!ts) return "jamais";
    const s = Math.max(0, Math.round((Date.now() - ts) / 1000));
    if (s < 45) return "à l'instant";
    const m = Math.round(s / 60);
    if (m < 60) return `il y a ${m} min`;
    const h = Math.round(m / 60);
    if (h < 24) return `il y a ${h} h`;
    return new Date(ts).toLocaleDateString("fr-FR");
  }
  function debounce(fn, ms = 60) {
    let t;
    return (...a) => { clearTimeout(t); t = setTimeout(() => fn(...a), ms); };
  }
  function safeName(s) {
    return String(s || "participant").normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]+/gi, "_").replace(/^_|_$/g, "").toLowerCase() || "participant";
  }
  function downloadText(filename, text) {
    const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = filename;
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1500);
  }

  /* ---------- vrai petit PDF d'exercice (s'ouvre dans tout lecteur PDF) ---------- */
  function makePdf(title, lines) {
    const latin = s => String(s).replace(/[’‘]/g, "'").replace(/[“”«»]/g, '"').replace(/[—–]/g, "-").replace(/…/g, "...").replace(/[^\x00-\xff]/g, "?");
    const pdfStr = s => "(" + latin(s).replace(/[\\()]/g, m => "\\" + m) + ")";
    let y = 730;
    let content = "1 0.93 0.75 rg 40 772 515 40 re f\n0.45 0.3 0 rg BT /F1 13 Tf 60 787 Td " + pdfStr("DOCUMENT FICTIF - EXERCICE DE FORMATION - SANS VALEUR") + " Tj ET\n";
    content += "0.1 0.15 0.3 rg BT /F1 20 Tf 60 " + y + " Td " + pdfStr(title) + " Tj ET\n";
    y -= 40;
    content += "0 0 0 rg\n";
    lines.forEach(l => { content += "BT /F1 12 Tf 60 " + y + " Td " + pdfStr(l) + " Tj ET\n"; y -= 22; });
    const objs = [
      "<< /Type /Catalog /Pages 2 0 R >>",
      "<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
      "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>",
      "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>",
      "<< /Length " + content.length + " >>\nstream\n" + content + "endstream"
    ];
    let out = "%PDF-1.4\n";
    const offsets = [];
    objs.forEach((o, i) => { offsets.push(out.length); out += (i + 1) + " 0 obj\n" + o + "\nendobj\n"; });
    const xref = out.length;
    out += "xref\n0 " + (objs.length + 1) + "\n0000000000 65535 f \n" + offsets.map(o => String(o).padStart(10, "0") + " 00000 n \n").join("");
    out += "trailer\n<< /Size " + (objs.length + 1) + " /Root 1 0 R >>\nstartxref\n" + xref + "\n%%EOF";
    const bytes = new Uint8Array(out.length);
    for (let i = 0; i < out.length; i++) bytes[i] = out.charCodeAt(i) & 0xff;
    return new Blob([bytes], { type: "application/pdf" });
  }
  function downloadBlob(filename, blob) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = filename;
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1500);
  }
  const MONTHS = ["janvier", "fevrier", "mars", "avril", "mai", "juin", "juillet", "aout", "septembre", "octobre", "novembre", "decembre"];
  const MONTHS_FR = ["janvier", "février", "mars", "avril", "mai", "juin", "juillet", "août", "septembre", "octobre", "novembre", "décembre"];

  /* ---------- petit bus d'événements ---------- */
  const handlers = {};
  AN.on = (evt, fn) => { (handlers[evt] ||= []).push(fn); };
  AN.emit = (evt, ...args) => (handlers[evt] || []).forEach(fn => { try { fn(...args); } catch (e) { console.error(e); } });

  /* ---------- écrans ---------- */
  function show(id) {
    $$(".screen").forEach(s => s.classList.toggle("active", s.id === id));
    document.body.dataset.screen = id;
    $("#homeBtn")?.classList.toggle("hidden", id === "landing");
    window.scrollTo({ top: 0, behavior: "instant" });
    const h = $(`#${id} h1`);
    if (h) { h.setAttribute("tabindex", "-1"); h.focus({ preventScroll: true }); }
    AN.emit("screen", id);
  }

  /* ---------- toasts (annoncés aux lecteurs d'écran) ---------- */
  function toast(text, kind = "info", ms = 4500) {
    const box = $("#toasts");
    if (!box) return;
    const el = document.createElement("div");
    el.className = "toast " + kind;
    el.textContent = text;
    box.appendChild(el);
    setTimeout(() => { el.classList.add("out"); setTimeout(() => el.remove(), 400); }, ms);
  }

  /* ---------- boîtes de dialogue (remplacent confirm/prompt) ---------- */
  function confirmBox({ title = "Confirmer", text = "", ok = "Confirmer", danger = false } = {}) {
    const d = $("#confirmDialog");
    $("#confirmTitle").textContent = title;
    $("#confirmText").textContent = text;
    const okBtn = $("#confirmOk");
    okBtn.textContent = ok;
    okBtn.classList.toggle("danger", danger);
    d.returnValue = "";
    d.showModal();
    return new Promise(res => d.addEventListener("close", () => res(d.returnValue === "ok"), { once: true }));
  }
  function promptBox({ title = "", label = "", value = "", ok = "Valider" } = {}) {
    const d = $("#promptDialog");
    $("#promptTitle").textContent = title;
    $("#promptLabel").textContent = label;
    const input = $("#promptInput");
    input.value = value;
    $("#promptOk").textContent = ok;
    d.returnValue = "";
    d.showModal();
    setTimeout(() => input.select(), 30);
    return new Promise(res => d.addEventListener("close", () => res(d.returnValue === "ok" ? input.value.trim() : null), { once: true }));
  }

  /* ---------- impression (fiche-mémo, codes) ---------- */
  function printHTML(html) {
    const area = $("#printArea");
    area.innerHTML = html;
    document.body.classList.add("printing");
    const done = () => { document.body.classList.remove("printing"); area.innerHTML = ""; window.removeEventListener("afterprint", done); };
    window.addEventListener("afterprint", done);
    setTimeout(() => window.print(), 50);
  }

  AN.util = { $, $$, esc, uid, randomDigits, shuffle, levelName, LEVELS, pct, timeAgo, debounce, safeName, downloadText, makePdf, downloadBlob, MONTHS, MONTHS_FR, show, toast, confirmBox, promptBox, printHTML };
})(window.AN);

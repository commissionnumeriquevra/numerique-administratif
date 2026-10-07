/* =========================================================
   Boîte mail simulée, réutilisée par toutes les missions du chapitre E-mail.
   AN.mail.client(container, options) -> contrôleur
   Le client gère lui-même son affichage (dossiers, lecture, rédaction,
   fenêtre de fichiers) et prévient la mission via options.onEvent(type, data).
   ========================================================= */
(function (AN) {
  "use strict";
  const { esc } = AN.util;

  const FOLDERS = [
    { id: "inbox", label: "Boîte de réception", icon: "📥" },
    { id: "sent", label: "Envoyés", icon: "📤" },
    { id: "drafts", label: "Brouillons", icon: "📝" },
    { id: "spam", label: "Indésirables", icon: "🚫" },
    { id: "trash", label: "Corbeille", icon: "🗑️" }
  ];
  const FILE_ICONS = { pdf: "📕", jpg: "🖼️", jpeg: "🖼️", png: "🖼️", docx: "📘", odt: "📘", xlsx: "📗", exe: "⚙️", zip: "🗜️", mp3: "🎵", txt: "📄" };
  const ext = name => (String(name).split(".").pop() || "").toLowerCase();
  const fileIcon = name => FILE_ICONS[ext(name)] || "📄";
  const initials = n => String(n || "?").split(/\s+/).map(x => x[0]).join("").slice(0, 2).toUpperCase();
  const isEmail = v => /^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i.test(String(v).trim());

  /** Transforme les messages reçus dans la messagerie (formateur, simulation) en e-mails. */
  function fromMessages(messages) {
    const cats = AN.quickReplies?.categories || [];
    const scamSubject = cats.find(c => c.id === "arnaque")?.subject;
    const adminSubjects = cats.filter(c => !["arnaque", "formateur", "perso"].includes(c.id)).map(c => c.subject);
    return (messages || []).filter(m => m.from !== "student").map(m => {
      let from = { name: "Votre formateur", email: "formateur@mediatheque-valbourg.fr" };
      let scam = false;
      if (m.subject === scamSubject) { from = { name: "Service Clients", email: "alerte@verif-compte-usager.info" }; scam = true; }
      else if (adminSubjects.includes(m.subject) || m.from === "system") from = { name: "Service des démarches", email: "ne-pas-repondre@demarches-valbourg.fr" };
      return {
        id: "msg_" + m.id, from, subject: m.subject || "Message", date: new Date(m.createdAt).toLocaleString("fr-FR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" }),
        body: esc(m.text).replace(/\n/g, "<br>").replace(/(https?:\/\/[^\s<]+)/g, '<a href="#" class="mk-link" data-url="$1">$1</a>'),
        unread: !m.readByStudent, folder: "inbox", scam, live: true
      };
    });
  }

  function client(container, opts) {
    const me = opts.me || { name: "Moi", email: "moi@exemple.fr" };
    const F = Object.assign({ compose: true, reply: true, replyAll: true, forward: true, delete: true, spam: true, search: true, attach: true, folders: true }, opts.features || {});
    const st = {
      mails: opts.mails.map(m => ({ folder: "inbox", unread: false, attachments: [], ...m })),
      folder: "inbox", sel: null, compose: null, picker: null, preview: null, query: "", flash: null, hover: ""
    };
    const emit = (type, data) => { try { return opts.onEvent?.(type, data, ctl); } catch (e) { console.error(e); } };
    const byId = id => st.mails.find(m => m.id === id);
    const visible = () => st.mails.filter(m => m.folder === st.folder && (!st.query || (m.subject + " " + m.from.name + " " + m.from.email + " " + String(m.body).replace(/<[^>]+>/g, " ")).toLowerCase().includes(st.query.toLowerCase())));

    function listHTML() {
      const list = visible();
      if (!list.length) return `<div class="mk-empty">${st.query ? "Aucun message ne correspond à votre recherche." : "Ce dossier est vide."}</div>`;
      return list.map(m => `<button type="button" class="mk-item ${m.unread ? "unread" : ""} ${st.sel === m.id ? "sel" : ""}" data-mk="open" data-id="${m.id}">
        <span class="mk-avatar" aria-hidden="true">${esc(initials(st.folder === "sent" ? (m.toName || m.to) : m.from.name))}</span>
        <span class="mk-item-main"><span class="mk-item-top"><b>${esc(st.folder === "sent" ? "À : " + (m.to || "") : m.from.name)}</b><small>${esc(m.date || "")}</small></span>
        <span class="mk-item-subject">${m.attachments?.length ? "📎 " : ""}${esc(m.subject)}</span>
        <span class="mk-item-snippet">${esc(String(m.body).replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").slice(0, 70))}</span></span>
        ${m.unread ? '<span class="mk-dot" aria-label="non lu"></span>' : ""}</button>`).join("");
    }

    function readHTML() {
      const m = byId(st.sel);
      if (!m) return `<div class="mk-placeholder"><div aria-hidden="true">✉️</div><p>Cliquez sur un message de la liste pour le lire.</p></div>`;
      const inSpam = m.folder === "spam", inTrash = m.folder === "trash";
      const tools = [
        F.reply && m.folder !== "sent" ? `<button type="button" data-mk="reply">↩️ Répondre</button>` : "",
        F.replyAll && m.cc && m.folder !== "sent" ? `<button type="button" data-mk="replyAll">↩️↩️ Répondre à tous</button>` : "",
        F.forward ? `<button type="button" data-mk="forward">↪️ Transférer</button>` : "",
        F.spam && !inSpam && m.folder === "inbox" ? `<button type="button" data-mk="spam">🚫 Indésirable</button>` : "",
        F.spam && inSpam ? `<button type="button" data-mk="notspam">✅ Ce n'est pas un indésirable</button>` : "",
        F.delete && !inTrash ? `<button type="button" data-mk="delete" class="mk-danger">🗑️ Supprimer</button>` : "",
        inTrash ? `<button type="button" data-mk="restore">↩ Restaurer</button>` : ""
      ].join("");
      return `<div class="mk-read-tools">${tools}</div>
        <h3 class="mk-read-subject">${esc(m.subject)}</h3>
        <div class="mk-read-head"><span class="mk-avatar big" aria-hidden="true">${esc(initials(m.from.name))}</span>
          <div><div><b>${esc(m.from.name)}</b> ${opts.hideAddr && !m.addrShown ? `<button type="button" class="mk-addr-btn" data-mk="showAddr">▾ voir l'adresse</button>` : `<span class="mk-addr ${opts.hideAddr ? "revealed" : ""}">&lt;${esc(m.from.email)}&gt;</span>`}</div>
          <div class="mk-muted">À : ${esc(m.to || me.email)}${m.cc ? ` · Cc : ${esc(m.cc)}` : ""}</div>
          <div class="mk-muted">${esc(m.date || "")}</div></div></div>
        ${inSpam ? `<div class="mk-banner">🚫 Ce message est dans les indésirables. Ne cliquez sur aucun lien.</div>` : ""}
        <div class="mk-body">${m.body}</div>
        ${m.attachments?.length ? `<div class="mk-atts"><div class="mk-muted">${m.attachments.length} pièce(s) jointe(s)</div>${m.attachments.map((a, i) => `<button type="button" class="mk-att" data-mk="att" data-i="${i}"><span aria-hidden="true">${fileIcon(a.name)}</span><span><b>${esc(a.name)}</b><small>${esc(a.size || "")}</small></span></button>`).join("")}</div>` : ""}`;
    }

    function composeHTML() {
      const c = st.compose;
      const title = { new: "Nouveau message", reply: "Répondre", replyAll: "Répondre à tous", forward: "Transférer" }[c.mode];
      return `<div class="mk-compose" role="region" aria-label="${title}">
        <div class="mk-compose-head"><b>${title}</b><button type="button" data-mk="discard" aria-label="Fermer sans envoyer">✕</button></div>
        <label class="mk-field"><span>À</span><input data-mkf="to" value="${esc(c.to)}" autocomplete="off" spellcheck="false" placeholder="adresse@exemple.fr"></label>
        ${c.showCc ? `<label class="mk-field"><span>Cc</span><input data-mkf="cc" value="${esc(c.cc)}" autocomplete="off" spellcheck="false" placeholder="copie visible par tous"></label>
        <label class="mk-field"><span>Cci</span><input data-mkf="bcc" value="${esc(c.bcc)}" autocomplete="off" spellcheck="false" placeholder="copie cachée"></label>` : `<button type="button" class="mk-cc-toggle" data-mk="showCc">+ Cc / Cci</button>`}
        <label class="mk-field"><span>Objet</span><input data-mkf="subject" value="${esc(c.subject)}" autocomplete="off"></label>
        <textarea data-mkf="body" rows="7" aria-label="Texte du message" placeholder="Écrivez votre message ici…">${esc(c.body)}</textarea>
        ${c.attachments.length ? `<div class="mk-atts">${c.attachments.map((a, i) => `<span class="mk-att static"><span aria-hidden="true">${fileIcon(a.name)}</span><span><b>${esc(a.name)}</b><small>${esc(a.size || "")}</small></span><button type="button" data-mk="unattach" data-i="${i}" aria-label="Retirer ${esc(a.name)}">✕</button></span>`).join("")}</div>` : ""}
        <div class="mk-compose-actions"><button type="button" class="mk-send" data-mk="send">📤 Envoyer</button>${F.attach ? `<button type="button" data-mk="pick">📎 Joindre un fichier</button>` : ""}</div></div>`;
    }

    function pickerHTML() {
      const p = st.picker, files = (opts.files || {})[p.folder] || [];
      return `<div class="mk-modal" role="dialog" aria-label="Ouvrir un fichier"><div class="mk-win">
        <div class="mk-win-title">📂 Ouvrir <button type="button" data-mk="pickClose" aria-label="Fermer">✕</button></div>
        <div class="mk-win-path">Ce PC › ${esc(p.folder)}</div>
        <div class="mk-win-main"><nav class="mk-win-nav">${Object.keys(opts.files || {}).map(f => `<button type="button" class="${f === p.folder ? "on" : ""}" data-mk="pickFolder" data-f="${esc(f)}">${{ "Téléchargements": "⬇️", "Documents": "📄", "Images": "🖼️", "Bureau": "🖥️" }[f] || "📁"} ${esc(f)}</button>`).join("")}</nav>
          <div class="mk-win-files">${files.length ? files.map((f, i) => `<button type="button" class="mk-file ${p.sel === i ? "sel" : ""}" data-mk="pickSel" data-i="${i}"><span aria-hidden="true">${fileIcon(f.name)}</span><b>${esc(f.name)}</b><small>${esc(f.date || "")}${f.size ? " · " + esc(f.size) : ""}</small></button>`).join("") : '<div class="mk-empty">Ce dossier est vide.</div>'}</div></div>
        <div class="mk-win-foot"><label>Nom du fichier : <input readonly value="${p.sel != null && files[p.sel] ? esc(files[p.sel].name) : ""}"></label>
          <button type="button" class="mk-send" data-mk="pickOk" ${p.sel == null ? "disabled" : ""}>Ouvrir</button><button type="button" data-mk="pickClose">Annuler</button></div>
      </div></div>`;
    }

    function previewHTML() {
      const { mail, att } = st.preview;
      return `<div class="mk-modal" role="dialog" aria-label="Aperçu de ${esc(att.name)}"><div class="mk-win mk-preview">
        <div class="mk-win-title">${fileIcon(att.name)} ${esc(att.name)} <button type="button" data-mk="prevClose" aria-label="Fermer">✕</button></div>
        <div class="mk-paper">${att.preview || `<h4>${esc(att.name)}</h4><p>Aperçu du document.</p>`}</div>
        <div class="mk-win-foot"><button type="button" class="mk-send" data-mk="download">⬇️ Télécharger</button><button type="button" data-mk="prevClose">Fermer</button></div>
      </div></div>`;
      void mail;
    }

    function render() {
      const counts = id => st.mails.filter(m => m.folder === id && (id !== "inbox" || m.unread)).length;
      container.innerHTML = `<div class="mk ${opts.big ? "mk-big" : ""}">
        <div class="mk-top"><div class="mk-brand">✉️ <b>Ma messagerie</b><span class="training-pill">EXERCICE</span></div>
          ${F.search ? `<label class="mk-search"><span class="sr-only">Rechercher dans mes messages</span><input data-mkf="query" value="${esc(st.query)}" placeholder="🔍 Rechercher dans mes messages"></label>` : ""}
          <div class="mk-me">${esc(me.email)}</div></div>
        <div class="mk-grid ${st.compose ? "composing" : ""}">
          <aside class="mk-side">${F.compose ? `<button type="button" class="mk-new" data-mk="new">✏️ Nouveau message</button>` : ""}
            ${F.folders ? FOLDERS.map(f => `<button type="button" class="mk-folder ${st.folder === f.id ? "on" : ""}" data-mk="folder" data-f="${f.id}"><span aria-hidden="true">${f.icon}</span> ${f.label}${counts(f.id) && (f.id === "inbox" || f.id === "spam") ? `<b>${counts(f.id)}</b>` : ""}</button>`).join("") : ""}
          </aside>
          <section class="mk-list" aria-label="${FOLDERS.find(f => f.id === st.folder).label}">${listHTML()}</section>
          <section class="mk-read" aria-live="polite">${st.compose ? composeHTML() : readHTML()}</section>
        </div>
        <div class="mk-status" aria-live="polite">${st.hover ? esc(st.hover) : "&nbsp;"}</div>
        ${st.flash ? `<div class="mk-flash ${st.flash.kind}" role="status">${st.flash.html}</div>` : ""}
        ${st.picker ? pickerHTML() : ""}${st.preview ? previewHTML() : ""}
      </div>`;
      bindLinks();
    }

    function bindLinks() {
      container.querySelectorAll(".mk-link").forEach(a => {
        const show = () => { st.hover = a.dataset.url || ""; const sb = container.querySelector(".mk-status"); if (sb) sb.textContent = st.hover; emit("hover", { mail: byId(st.sel), url: st.hover }); };
        const hide = () => { const sb = container.querySelector(".mk-status"); if (sb) sb.innerHTML = "&nbsp;"; st.hover = ""; };
        a.addEventListener("mouseenter", show); a.addEventListener("focus", show);
        a.addEventListener("mouseleave", hide); a.addEventListener("blur", hide);
      });
    }

    function startCompose(mode, m) {
      const quote = m ? `\n\n\n--- Message de ${m.from.name} (${m.date || ""}) ---\n${String(m.body).replace(/<br\s*\/?>/gi, "\n").replace(/<[^>]+>/g, "").replace(/\n{3,}/g, "\n\n").trim()}` : "";
      const pre = { reply: "RE : ", replyAll: "RE : ", forward: "TR : " }[mode] || "";
      st.compose = {
        mode, original: m ? m.id : null,
        to: mode === "reply" || mode === "replyAll" ? m.from.email : "",
        cc: mode === "replyAll" ? (m.cc || "") : "", bcc: "", showCc: mode === "replyAll",
        subject: m ? pre + m.subject.replace(/^(RE|TR)\s*:\s*/i, "") : "",
        body: mode === "forward" ? quote : (m ? quote : ""),
        attachments: mode === "forward" ? [...(m.attachments || [])] : []
      };
      render();
      const f = container.querySelector(mode === "reply" || mode === "replyAll" ? '[data-mkf="body"]' : '[data-mkf="to"]');
      if (f) { f.focus(); if (f.tagName === "TEXTAREA") f.setSelectionRange(0, 0); }
    }

    const handlers = {
      folder: el => { st.folder = el.dataset.f; st.sel = null; st.compose = null; render(); emit("folder", st.folder); },
      open: el => { const m = byId(el.dataset.id); st.sel = m.id; st.compose = null; const wasUnread = m.unread; m.unread = false; render(); emit("open", { mail: m, wasUnread }); },
      new: () => { startCompose("new"); emit("new"); },
      reply: () => { const m = byId(st.sel); startCompose("reply", m); emit("reply", m); },
      replyAll: () => { const m = byId(st.sel); startCompose("replyAll", m); emit("replyAll", m); },
      forward: () => { const m = byId(st.sel); startCompose("forward", m); emit("forward", m); },
      delete: () => { const m = byId(st.sel); m.folder = "trash"; st.sel = null; render(); emit("delete", m); },
      restore: () => { const m = byId(st.sel); m.folder = "inbox"; st.sel = null; render(); emit("restore", m); },
      spam: () => { const m = byId(st.sel); m.folder = "spam"; st.sel = null; render(); emit("spam", m); },
      notspam: () => { const m = byId(st.sel); m.folder = "inbox"; st.sel = null; render(); emit("notspam", m); },
      showAddr: () => { const m = byId(st.sel); m.addrShown = true; render(); emit("showAddr", m); },
      showCc: () => { readDraft(); st.compose.showCc = true; render(); container.querySelector('[data-mkf="cc"]')?.focus(); },
      discard: () => { st.compose = null; render(); emit("discard"); },
      send: () => {
        readDraft();
        const d = { ...st.compose, attachments: [...st.compose.attachments] };
        const problems = [];
        if (!d.to.trim()) problems.push("Le champ « À » est vide : à qui envoyez-vous ce message ?");
        else if (!d.to.split(/[,;]/).every(isEmail)) problems.push(`L'adresse « ${d.to} » n'est pas valide. Vérifiez l'arobase @ et le point.`);
        if (d.cc.trim() && !d.cc.split(/[,;]/).every(isEmail)) problems.push(`L'adresse en copie « ${d.cc} » n'est pas valide.`);
        if (problems.length) { flash(problems.join("<br>"), "bad"); return; }
        if (!d.subject.trim() && !st.confirmNoSubject) { st.confirmNoSubject = true; flash("Votre message n'a pas d'objet. Ajoutez-en un, ou cliquez à nouveau sur « Envoyer » pour l'envoyer quand même.", "warn"); return; }
        st.confirmNoSubject = false;
        const sent = { id: "sent_" + Date.now(), from: me, to: d.to, toName: d.to, cc: d.cc, subject: d.subject || "(sans objet)", body: esc(d.body).replace(/\n/g, "<br>"), attachments: d.attachments, folder: "sent", date: "À l'instant" };
        st.mails.push(sent);
        st.compose = null;
        render();
        const r = emit("send", d);
        if (r !== false) flash("📤 Message envoyé.", "good", 2500);
      },
      pick: () => { readDraft(); st.picker = { folder: Object.keys(opts.files || {})[0], sel: null }; render(); emit("pickOpen"); },
      pickFolder: el => { st.picker.folder = el.dataset.f; st.picker.sel = null; render(); },
      pickSel: el => {
        // pas de re-rendu complet : sinon le double-clic ne serait jamais détecté
        st.picker.sel = Number(el.dataset.i);
        container.querySelectorAll(".mk-file").forEach(f => f.classList.toggle("sel", f === el));
        const f = (opts.files[st.picker.folder] || [])[st.picker.sel];
        const name = container.querySelector(".mk-win-foot input"); if (name) name.value = f ? f.name : "";
        const ok = container.querySelector('[data-mk="pickOk"]'); if (ok) ok.disabled = !f;
      },
      pickOk: () => {
        const f = (opts.files[st.picker.folder] || [])[st.picker.sel]; if (!f) return;
        st.compose.attachments.push(f); st.picker = null; render(); emit("attach", f);
      },
      pickClose: () => { st.picker = null; render(); },
      unattach: el => { readDraft(); const [f] = st.compose.attachments.splice(Number(el.dataset.i), 1); render(); emit("unattach", f); },
      att: el => { const m = byId(st.sel); const att = m.attachments[Number(el.dataset.i)]; st.preview = { mail: m, att }; render(); emit("attOpen", { mail: m, att }); },
      prevClose: () => { st.preview = null; render(); },
      download: () => { const { mail, att } = st.preview; st.preview = null; render(); flash(`⬇️ « ${esc(att.name)} » a été téléchargé dans le dossier <b>Téléchargements</b>.`, "good", 4000); emit("download", { mail, att }); }
    };

    function readDraft() {
      if (!st.compose) return;
      container.querySelectorAll("[data-mkf]").forEach(i => { if (i.dataset.mkf !== "query") st.compose[i.dataset.mkf] = i.value; });
    }
    let flashTimer = null;
    function flash(html, kind = "info", ms = 7000) {
      st.flash = { html, kind }; clearTimeout(flashTimer);
      let el = container.querySelector(".mk-flash");
      if (!el) { el = document.createElement("div"); el.setAttribute("role", "status"); container.querySelector(".mk")?.appendChild(el); }
      el.className = `mk-flash ${kind}`; el.innerHTML = html;
      if (ms) flashTimer = setTimeout(() => { st.flash = null; container.querySelector(".mk-flash")?.remove(); }, ms);
    }

    const onClick = e => {
      const link = e.target.closest(".mk-link");
      if (link) { e.preventDefault(); emit("link", { mail: byId(st.sel), url: link.dataset.url }); return; }
      const b = e.target.closest("[data-mk]");
      if (!b || !container.contains(b)) return;
      handlers[b.dataset.mk]?.(b, e);
    };
    const onDbl = e => { const f = e.target.closest('[data-mk="pickSel"]'); if (f) { st.picker.sel = Number(f.dataset.i); handlers.pickOk(); } };
    const onInput = e => {
      if (e.target.dataset.mkf === "query") { st.query = e.target.value; const l = container.querySelector(".mk-list"); if (l) l.innerHTML = listHTML(); emit("search", st.query); }
    };
    const onKey = e => { if (e.key === "Escape" && (st.picker || st.preview)) { st.picker = null; st.preview = null; render(); } };
    container.addEventListener("click", onClick);
    container.addEventListener("dblclick", onDbl);
    container.addEventListener("input", onInput);
    container.addEventListener("keydown", onKey);

    const ctl = {
      st, render, flash, startCompose, readDraft,
      get mails() { return st.mails; },
      byId,
      add(mails) {
        const fresh = mails.filter(m => !byId(m.id));
        if (!fresh.length) return;
        fresh.forEach(m => st.mails.unshift({ folder: "inbox", attachments: [], ...m }));
        // en cours de rédaction : on ne met à jour que la liste, pour ne pas effacer ce qui est tapé
        if (st.compose || st.picker || st.preview) { const l = container.querySelector(".mk-list"); if (l) l.innerHTML = listHTML(); }
        else render();
      },
      select(id) { const m = byId(id); if (!m) return; st.folder = m.folder; st.sel = id; m.unread = false; st.compose = null; render(); },
      destroy() { container.removeEventListener("click", onClick); container.removeEventListener("dblclick", onDbl); container.removeEventListener("input", onInput); container.removeEventListener("keydown", onKey); clearTimeout(flashTimer); }
    };
    render();
    return ctl;
  }

  /* ---------- Notation sur 20, avec explications ---------- */
  function grader(store) {
    store.items ||= [];
    const add = (key, ok, label, why) => {
      if (store.items.some(i => i.key === key)) return false; // seule la première tentative compte
      store.items.push({ key, ok, label, why });
      return true;
    };
    return {
      ok: (key, label, why = "") => add(key, true, label, why),
      ko: (key, label, why = "") => add(key, false, label, why),
      has: key => store.items.some(i => i.key === key),
      get points() { return store.items.filter(i => i.ok).length; },
      get max() { return store.items.length; },
      recap() {
        const score = store.items.length ? Math.round((20 * this.points) / this.max) : 20;
        const mention = score >= 18 ? "Excellent !" : score >= 14 ? "Très bien !" : score >= 10 ? "C'est en bonne voie." : "On reprendra ensemble, ce n'est pas grave.";
        return `<div class="grade-box"><div class="grade-note"><b>${score}</b><span>/20</span></div><div><strong>${mention}</strong>
          <ul class="grade-list">${store.items.map(i => `<li class="${i.ok ? "ok" : "ko"}"><span aria-hidden="true">${i.ok ? "✅" : "❌"}</span> <span>${esc(i.label)}${!i.ok && i.why ? `<small>${esc(i.why)}</small>` : ""}</span></li>`).join("")}</ul></div></div>`;
      }
    };
  }

  /* ---------- Petit QCM en ligne : on continue toujours, avec l'explication ---------- */
  function quizStep(ctx, { key, questions, title, onEnd }) {
    const L = ctx.local;
    L[key] ||= { i: 0, answered: null };
    const s = L[key];
    const q = questions[s.i];
    const G = grader(L.grade ||= {});
    if (!q) return onEnd();
    const ans = s.answered;
    ctx.html(`${title}
      <div class="mk-quiz"><div class="mk-quiz-count">Question ${s.i + 1} / ${questions.length}</div>
        <h2 data-speak>${q.q}</h2>
        ${q.visual || ""}
        <div class="choice-stack">${q.choices.map((c, i) => `<button type="button" class="secondary ${ans != null ? (i === q.ok ? "right" : i === ans ? "wrong" : "") : ""}" data-act="qa" data-i="${i}" ${ans != null ? "disabled" : ""}>${c}</button>`).join("")}</div>
        ${ans != null ? `<div class="alert ${ans === q.ok ? "good" : "bad"}" data-speak>${ans === q.ok ? "✅ Bonne réponse ! " : "❌ Pas tout à fait. "}${q.why}</div>
        <button type="button" class="primary" data-act="qn">${s.i + 1 < questions.length ? "Question suivante →" : "Continuer →"}</button>` : ""}
      </div>`);
    ctx.act("qa", el => {
      const i = Number(el.dataset.i);
      s.answered = i;
      const plain = q.q.replace(/<[^>]+>/g, "");
      (i === q.ok ? G.ok : G.ko)(`${key}_${s.i}`, plain, i === q.ok ? "" : q.why.replace(/<[^>]+>/g, ""));
      quizStep(ctx, { key, questions, title, onEnd });
    });
    ctx.act("qn", () => { s.i++; s.answered = null; quizStep(ctx, { key, questions, title, onEnd }); });
  }

  AN.mail = { client, fromMessages, grader, quizStep, isEmail, fileIcon };
})(window.AN);

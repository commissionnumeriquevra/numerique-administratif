/* =========================================================
   Kit « Explorateur de fichiers » (simulation Windows 11)
   AN.files.explorer(el, { fs, start, onEvent, picker, big, showExt, features })
   - fs : arbre construit avec AN.files.folder() / AN.files.file()
   - onEvent(type, data, ctl) : navigate · select · open · exe · rename ·
     renameRefused · newFolder · move · delete · restore · emptyTrash ·
     search · sort · showExt · pick · cancel
   - picker : { title, accept: ["pdf","jpg"], button } → fenêtre « Ouvrir »
   Rien n'est réellement écrit sur l'ordinateur : tout reste en mémoire.
   ========================================================= */
(function (AN) {
  "use strict";
  const { esc } = AN.util;

  /* ---------- types de fichiers ---------- */
  const TYPES = {
    pdf: { icon: "📕", label: "Document PDF", family: "doc" },
    docx: { icon: "📘", label: "Document Microsoft Word", family: "doc" },
    odt: { icon: "📘", label: "Texte OpenDocument", family: "doc" },
    txt: { icon: "📄", label: "Document texte", family: "doc" },
    xlsx: { icon: "📗", label: "Feuille de calcul Excel", family: "doc" },
    jpg: { icon: "🖼️", label: "Fichier JPG", family: "image" },
    jpeg: { icon: "🖼️", label: "Fichier JPEG", family: "image" },
    png: { icon: "🖼️", label: "Fichier PNG", family: "image" },
    heic: { icon: "🖼️", label: "Fichier HEIC (photo iPhone)", family: "image" },
    mp4: { icon: "🎬", label: "Fichier vidéo MP4", family: "video" },
    mp3: { icon: "🎵", label: "Fichier audio MP3", family: "audio" },
    zip: { icon: "🗜️", label: "Dossier compressé (zip)", family: "zip" },
    exe: { icon: "⚙️", label: "Application", family: "app" },
    lnk: { icon: "↗️", label: "Raccourci", family: "link" }
  };
  const extOf = n => { const m = /\.([a-z0-9]{1,5})$/i.exec(n || ""); return m ? m[1].toLowerCase() : ""; };
  const baseOf = n => { const e = extOf(n); return e ? n.slice(0, -(e.length + 1)) : n; };
  const typeOf = node => node.kind === "folder" ? { icon: "📁", label: "Dossier de fichiers", family: "folder" } : (TYPES[extOf(node.name)] || { icon: "📄", label: (extOf(node.name) ? "Fichier " + extOf(node.name).toUpperCase() : "Fichier"), family: "unknown" });
  const BAD = /[\\/:*?"<>|]/;

  let seq = 0;
  const nid = () => "n" + (++seq) + Math.random().toString(36).slice(2, 6);
  const DAY = 86400000;
  /** date relative : 0 = aujourd'hui (heure fixée pour la stabilité), n = il y a n jours */
  const ago = (n, h = 10, m = 15) => { const d = new Date(); d.setHours(h, m, 0, 0); return d.getTime() - n * DAY; };

  /** Fabrique un fichier. o : { ago, size (Ko), content (HTML de l'aperçu), tag, ... } */
  function file(name, o = {}) {
    return { id: nid(), kind: "file", name, date: o.date ?? ago(o.ago ?? 5, o.h, o.min), size: o.size ?? 120, content: o.content || "", tag: o.tag || null, ...o, children: undefined };
  }
  function folder(name, children = [], o = {}) {
    return { id: nid(), kind: "folder", name, date: o.date ?? ago(o.ago ?? 30), children, tag: o.tag || null, icon: o.icon, special: o.special };
  }
  /** Arbre standard « Ce PC » : bureau, téléchargements, documents, images (+ corbeille). */
  function pc({ bureau = [], telechargements = [], documents = [], images = [], musique, videos, corbeille = [] } = {}) {
    const root = folder("Ce PC", [
      folder("Bureau", bureau, { tag: "bureau", icon: "🖥️", special: true }),
      folder("Téléchargements", telechargements, { tag: "telechargements", icon: "⬇️", special: true }),
      folder("Documents", documents, { tag: "documents", icon: "📄", special: true }),
      folder("Images", images, { tag: "images", icon: "🖼️", special: true }),
      ...(musique ? [folder("Musique", musique, { tag: "musique", icon: "🎵", special: true })] : []),
      ...(videos ? [folder("Vidéos", videos, { tag: "videos", icon: "🎬", special: true })] : [])
    ], { tag: "pc", icon: "💻", special: true });
    root.trash = corbeille.map(f => ({ node: f, from: null }));
    return root;
  }

  /* ---------- outils sur l'arbre ---------- */
  function walk(node, fn, parent = null) { fn(node, parent); (node.children || []).forEach(c => walk(c, fn, node)); }
  function findIn(root, pred) { let r = null; walk(root, (n, p) => { if (!r && pred(n, p)) r = n; }); return r; }
  function parentOf(root, node) { let r = null; walk(root, (n, p) => { if (n === node) r = p; }); return r; }
  function pathOf(root, node) { const out = []; let cur = node; while (cur) { out.unshift(cur); cur = parentOf(root, cur); } return out; }
  const isInside = (root, node, anc) => pathOf(root, node).includes(anc);

  const fmtDate = t => { const d = new Date(t); return d.toLocaleDateString("fr-FR") + " " + d.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }); };
  const fmtSize = k => k == null ? "" : k >= 1024 ? (k / 1024).toFixed(1).replace(".", ",") + " Mo" : Math.max(1, Math.round(k)) + " Ko";
  const norm = s => String(s || "").normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();

  /* ---------- aperçu des fichiers ---------- */
  function preview(node) {
    const t = typeOf(node), e = extOf(node.name);
    if (t.family === "image") return `<div class="fx-img" style="--bg:${node.bg || "#cfe3f7"}"><span>${node.emoji || "🖼️"}</span>${node.caption ? `<small>${node.caption}</small>` : ""}</div>`;
    if (t.family === "video" || t.family === "audio") return `<div class="fx-media"><span>${t.icon}</span><div>▶ ${esc(node.name)}</div><small>${node.caption || "Lecture (simulation)"}</small></div>`;
    if (e === "xlsx") return `<div class="fx-page sheet">${node.content || "<table><tr><td>A1</td><td>B1</td></tr></table>"}</div>`;
    return `<div class="fx-page">${node.watermark === false ? "" : `<div class="fx-banner">DOCUMENT FICTIF · EXERCICE</div>`}${node.content || `<h3>${esc(baseOf(node.name))}</h3><p>Ce document ne sert qu'à l'exercice.</p>`}</div>`;
  }

  /* =========================================================
     L'EXPLORATEUR
     ========================================================= */
  function explorer(el, opts = {}) {
    const root = opts.fs || pc();
    root.trash ||= [];
    const S = {
      cur: null, sel: null, back: [], fwd: [], sort: { key: "name", dir: 1 }, showExt: !!opts.showExt,
      renaming: null, renameErr: "", menu: null, viewMenu: null, newMenu: false, sortMenu: false, clip: null,
      viewer: null, dialog: null, search: "", flash: null, trashView: false, view: opts.view || "details"
    };
    const feat = { newFolder: true, rename: true, del: true, cut: true, copy: false, search: true, sort: true, view: true, trash: true, drag: true, ...(opts.features || {}) };
    const startNode = typeof opts.start === "string" ? findIn(root, n => n.tag === opts.start) : opts.start;
    S.cur = startNode || root.children[0];
    const emit = (type, data) => { try { opts.onEvent?.(type, data, ctl); } catch (e) { console.error(e); } };
    let flashTimer = null, destroyed = false;

    /* ----- nom affiché (avec ou sans extension, comme Windows) ----- */
    const shown = n => n.kind === "folder" || S.showExt || !TYPES[extOf(n.name)] ? n.name : baseOf(n.name);

    /* ----- liste des éléments du dossier courant ----- */
    function items() {
      if (S.trashView) return root.trash.map(t => ({ ...t.node, _trash: t }));
      let list;
      if (S.search.trim()) {
        const q = norm(S.search.trim());
        list = []; walk(S.cur, (n) => { if (n !== S.cur && norm(n.name).includes(q)) list.push(n); });
      } else list = [...(S.cur.children || [])];
      const k = S.sort.key, d = S.sort.dir;
      list.sort((a, b) => {
        if (k === "name") { if ((a.kind === "folder") !== (b.kind === "folder")) return a.kind === "folder" ? -1 : 1; return d * a.name.localeCompare(b.name, "fr", { numeric: true, sensitivity: "base" }); }
        if (k === "date") return d * ((a.date || 0) - (b.date || 0));
        if (k === "size") return d * ((a.kind === "folder" ? -1 : a.size || 0) - (b.kind === "folder" ? -1 : b.size || 0));
        if (k === "type") return d * typeOf(a).label.localeCompare(typeOf(b).label, "fr");
        return 0;
      });
      return list;
    }
    const nodeById = id => {
      if (S.trashView) { const t = root.trash.find(t => t.node.id === id); return t ? t.node : null; }
      return findIn(root, n => n.id === id);
    };
    const selNode = () => S.sel ? nodeById(S.sel) : null;

    /* ----- navigation ----- */
    function go(node, { push = true, via = "open" } = {}) {
      if (!node || node.kind !== "folder") return;
      if (push && (S.cur !== node || S.trashView)) { S.back.push(S.trashView ? "__trash" : S.cur.id); S.fwd = []; }
      S.trashView = false; S.cur = node; S.sel = null; S.search = ""; S.renaming = null; S.menu = null;
      render(); emit("navigate", { folder: node, via, path: pathOf(root, node).map(n => n.name) });
    }
    function goTrash() {
      if (!S.trashView) { S.back.push(S.cur.id); S.fwd = []; }
      S.trashView = true; S.sel = null; S.search = ""; S.menu = null; render(); emit("navigate", { folder: null, trash: true, via: "side", path: ["Corbeille"] });
    }
    function histGo(from, to, via = "back") {
      const id = from.pop(); if (!id) return;
      to.push(S.trashView ? "__trash" : S.cur.id);
      if (id === "__trash") { S.trashView = true; S.sel = null; render(); emit("navigate", { trash: true, via, path: ["Corbeille"] }); return; }
      const n = findIn(root, x => x.id === id); if (n) { S.trashView = false; S.cur = n; S.sel = null; S.search = ""; render(); emit("navigate", { folder: n, via, path: pathOf(root, n).map(x => x.name) }); }
    }

    /* ----- ouvrir ----- */
    function open(node) {
      if (!node) return;
      if (S.trashView) { flash("Un élément de la Corbeille ne s'ouvre pas : il faut d'abord le <b>restaurer</b>.", "warn"); return; }
      if (node.kind === "folder") { go(node); return; }
      if (opts.picker) { pick(node); return; }
      const t = typeOf(node);
      if (t.family === "app") { S.dialog = { kind: "exe", node }; render(); emit("exe", { file: node }); return; }
      if (t.family === "link") { flash("C'est un <b>raccourci</b> : une petite flèche qui mène vers un programme ou un dossier.", "info"); return; }
      if (t.family === "zip") { S.viewer = { node, html: `<div class="fx-page"><h3>🗜️ ${esc(node.name)}</h3><p>Un dossier <b>compressé</b> : plusieurs fichiers « emballés » dans un seul, pour les envoyer plus facilement.</p>${node.content || ""}<p class="fx-tip">Pour l'utiliser : clic droit → <b>Extraire tout</b>.</p></div>` }; render(); emit("open", { file: node }); return; }
      if (t.family === "unknown") { S.dialog = { kind: "how", node }; render(); emit("open", { file: node, unknown: true }); return; }
      S.viewer = { node, html: preview(node) }; render(); emit("open", { file: node });
    }

    /* ----- renommer ----- */
    function startRename(node) {
      if (!feat.rename || !node || S.trashView) return;
      if (node.special) { flash("Ce dossier fait partie de Windows : on ne le renomme pas.", "warn"); return; }
      S.renaming = node.id; S.renameErr = ""; S.menu = null; render();
      const inp = el.querySelector(".fx-rename");
      if (inp) { inp.focus(); const v = inp.value, dot = node.kind === "file" && S.showExt ? v.lastIndexOf(".") : -1; inp.setSelectionRange(0, dot > 0 ? dot : v.length); }
    }
    function commitRename(raw, { force = false } = {}) {
      const node = nodeById(S.renaming); if (!node) { S.renaming = null; return render(); }
      let v = String(raw || "").trim();
      const old = node.name;
      if (!v) { S.renaming = null; render(); return; }
      if (BAD.test(v)) { S.renameErr = "Un nom de fichier ne peut pas contenir ces caractères : \\ / : * ? \" < > |"; render(); emit("renameRefused", { file: node, value: v, reason: "chars" }); refocus(v); return; }
      if (node.kind === "file" && !S.showExt && TYPES[extOf(old)]) v = v + "." + extOf(old); // extension cachée : Windows la garde
      if (node.kind === "file" && S.showExt && extOf(v) !== extOf(old) && !force) {
        S.dialog = { kind: "ext", node, value: v }; render(); emit("renameRefused", { file: node, value: v, reason: "ext-warning" }); return;
      }
      const par = parentOf(root, node);
      if (par && par.children.some(x => x !== node && x.name.toLowerCase() === v.toLowerCase())) { S.renameErr = `Il y a déjà un élément nommé « ${v} » dans ce dossier.`; render(); emit("renameRefused", { file: node, value: v, reason: "duplicate" }); refocus(raw); return; }
      node.name = v; S.renaming = null; S.renameErr = ""; S.sel = node.id; render();
      if (v !== old) emit("rename", { file: node, from: old, to: v });
    }
    const refocus = v => { const i = el.querySelector(".fx-rename"); if (i) { i.value = v; i.focus(); } };

    /* ----- nouveau dossier ----- */
    function newFolder() {
      if (!feat.newFolder || S.trashView || S.search) return;
      let name = "Nouveau dossier", k = 2;
      while (S.cur.children.some(c => c.name.toLowerCase() === name.toLowerCase())) name = `Nouveau dossier (${k++})`;
      const f = folder(name, [], { ago: 0 }); f.date = Date.now();
      S.cur.children.push(f); S.newMenu = false; emit("newFolder", { folder: f, parent: S.cur });
      startRename(f);
    }

    /* ----- déplacer (couper / coller, glisser) ----- */
    function move(node, dest) {
      if (!node || !dest || dest.kind !== "folder") return false;
      const from = parentOf(root, node);
      if (from === dest) return false;
      if (node.kind === "folder" && isInside(root, dest, node)) { flash("Impossible de mettre un dossier dans lui-même 🙂", "warn"); return false; }
      if (dest.children.some(c => c.name.toLowerCase() === node.name.toLowerCase())) { flash(`Il y a déjà « ${esc(node.name)} » dans ${esc(dest.name)}.`, "warn"); return false; }
      from.children = from.children.filter(c => c !== node); dest.children.push(node);
      S.sel = null; render(); emit("move", { file: node, from, to: dest }); return true;
    }
    function cut(node) { if (!feat.cut || !node || S.trashView) return; if (node.special) { flash("Ce dossier fait partie de Windows : on ne le déplace pas.", "warn"); return; } S.clip = node.id; S.clipMode = "cut"; S.menu = null; render(); flash(`✂️ « ${esc(shown(node))} » est coupé. Ouvrez le dossier d'arrivée, puis cliquez sur <b>Coller</b>.`, "info", 5000); }
    function paste(dest = S.cur) {
      const n = S.clip && findIn(root, x => x.id === S.clip); if (!n) return;
      if (S.clipMode === "copy") { copyTo(n, dest); return; }
      if (move(n, dest)) S.clip = null; render();
    }
    /* ----- copier (la clé USB : le fichier reste aussi à sa place) ----- */
    const driveOf = node => pathOf(root, node).find(x => x.drive) || null;
    function cloneNode(n) { const c = { ...n, id: nid(), children: n.children ? n.children.map(cloneNode) : undefined }; return c; }
    function copyNode(node) { if (!feat.copy || !node || S.trashView) return; if (node.special) { flash("Ce dossier fait partie de Windows : on ne le copie pas ici.", "warn"); return; } S.clip = node.id; S.clipMode = "copy"; S.menu = null; render(); flash(`📄 « ${esc(shown(node))} » est copié. Ouvrez le dossier d'arrivée (ou la clé USB), puis cliquez sur <b>Coller</b>.`, "info", 5000); }
    function copyTo(n, dest) {
      if (!dest || dest.kind !== "folder") return false;
      if (n.kind === "folder" && isInside(root, dest, n)) { flash("Impossible de copier un dossier dans lui-même 🙂", "warn"); return false; }
      const c = cloneNode(n);
      if (dest.children.some(x => x.name.toLowerCase() === c.name.toLowerCase())) {
        if (parentOf(root, n) !== dest) { flash(`Il y a déjà « ${esc(n.name)} » dans ${esc(dest.name)}.`, "warn"); return false; }
        const e = extOf(c.name); c.name = baseOf(c.name) + " - Copie" + (e ? "." + e : "");
      }
      dest.children.push(c); S.sel = c.id; render();
      flash(`📋 « ${esc(shown(c))} » est copié dans <b>${esc(dest.name)}</b>.`, "good", 3500);
      emit("copy", { file: c, src: n, to: dest, toDrive: driveOf(dest) }); return true;
    }
    function eject(drive) {
      if (!drive?.drive) return;
      if (S.copying) { flash("Attendez la fin de la copie avant d'éjecter.", "warn"); return; }
      emit("eject", { drive });
    }

    /* ----- corbeille ----- */
    function del(node) {
      if (!feat.del || !node) return;
      if (S.trashView) { S.dialog = { kind: "delForever", node }; render(); return; }
      if (node.special) { flash("Ce dossier fait partie de Windows : on ne le supprime pas.", "warn"); return; }
      const from = parentOf(root, node); from.children = from.children.filter(c => c !== node);
      root.trash.push({ node, from }); S.sel = null; S.menu = null; render();
      flash(`🗑️ « ${esc(shown(node))} » est dans la <b>Corbeille</b>. Pas de panique : on peut le récupérer.`, "info", 4500);
      emit("delete", { file: node, from });
    }
    function restore(node) {
      const t = root.trash.find(x => x.node === node); if (!t) return;
      const dest = t.from && findIn(root, n => n === t.from) ? t.from : findIn(root, n => n.tag === "documents");
      if (dest.children.some(c => c.name.toLowerCase() === node.name.toLowerCase())) node.name = baseOf(node.name) + " (restauré)" + (extOf(node.name) ? "." + extOf(node.name) : "");
      root.trash = root.trash.filter(x => x !== t); dest.children.push(node); S.sel = null; render();
      flash(`↩️ « ${esc(shown(node))} » est revenu dans <b>${esc(dest.name)}</b>.`, "good", 4500);
      emit("restore", { file: node, to: dest });
    }

    /* ----- sélecteur de fichier (mode « Ouvrir ») ----- */
    function pick(node) {
      if (!node) return;
      if (node.kind === "folder") { go(node); return; }
      const acc = opts.picker.accept;
      if (acc && !acc.includes(extOf(node.name))) { S.pickErr = `Ce type de fichier n'est pas accepté ici (${acc.map(a => "." + a).join(", ")}).`; render(); emit("pick", { file: node, refused: "type" }); return; }
      emit("pick", { file: node });
    }

    /* ----- message flash ----- */
    function flash(html, kind = "info", ms = 4000) {
      S.flash = { html, kind }; clearTimeout(flashTimer);
      const f = el.querySelector(".fx-flash"); if (f) { f.className = `fx-flash ${kind}`; f.innerHTML = html; f.hidden = false; }
      if (ms) flashTimer = setTimeout(() => { S.flash = null; const f2 = el.querySelector(".fx-flash"); if (f2) f2.hidden = true; }, ms);
    }

    /* =================== RENDU =================== */
    function sideItem(n, depth = 0) {
      const on = !S.trashView && S.cur === n;
      const kids = (n.children || []).filter(c => c.kind === "folder");
      const open = n === root || (isInside(root, S.cur, n) && !S.trashView);
      return `<li><button type="button" class="fx-side-b ${on ? "on" : ""} ${S.hint === n.id ? "fx-hint" : ""}" data-fx="side" data-id="${n.id}" style="--d:${depth}" data-drop="${n.id}">${n.icon || "📁"} <span>${esc(n.name)}</span></button>
        ${kids.length && open && depth < 4 ? `<ul>${kids.map(k => sideItem(k, depth + 1)).join("")}</ul>` : ""}</li>`;
    }
    function row(n) {
      const t = typeOf(n), sel = S.sel === n.id, cut = S.clip === n.id && S.clipMode !== "copy";
      const name = S.renaming === n.id
        ? `<input class="fx-rename" value="${esc(S.showExt || n.kind === "folder" ? n.name : shown(n))}" spellcheck="false" autocomplete="off" aria-label="Nouveau nom">${S.renameErr ? `<span class="fx-rename-err" role="alert">${esc(S.renameErr)}</span>` : ""}`
        : `<span class="fx-n">${esc(shown(n))}</span>`;
      const where = (S.search || S.trashView) ? `<span class="fx-where">${S.trashView ? esc(n._trash?.from?.name || "") : esc(pathOf(root, parentOf(root, n)).slice(1).map(x => x.name).join(" › "))}</span>` : "";
      return `<div class="fx-row ${sel ? "sel" : ""} ${cut ? "cut" : ""} ${S.hint === n.id ? "fx-hint" : ""}" role="row" tabindex="0" data-fx="row" data-id="${n.id}" ${n.kind === "folder" ? `data-drop="${n.id}"` : ""} draggable="${feat.drag && !S.trashView && S.renaming !== n.id ? "true" : "false"}" aria-selected="${sel}">
        <span class="fx-c-name"><span class="fx-ico">${n.kind === "folder" ? (n.icon || "📁") : t.icon}</span>${name}${where}</span>
        <span class="fx-c-date">${S.trashView ? "" : fmtDate(n.date)}</span><span class="fx-c-type">${esc(t.label)}</span><span class="fx-c-size">${n.kind === "folder" ? "" : fmtSize(n.size)}</span></div>`;
    }
    function tile(n) {
      const t = typeOf(n), sel = S.sel === n.id;
      return `<div class="fx-tile ${sel ? "sel" : ""} ${S.clip === n.id && S.clipMode !== "copy" ? "cut" : ""} ${S.hint === n.id ? "fx-hint" : ""}" tabindex="0" data-fx="row" data-id="${n.id}" ${n.kind === "folder" ? `data-drop="${n.id}"` : ""} draggable="${feat.drag && !S.trashView ? "true" : "false"}">
        <span class="fx-tile-ico">${n.kind === "folder" ? (n.icon || "📁") : t.family === "image" ? `<span class="fx-thumb" style="--bg:${n.bg || "#cfe3f7"}">${n.emoji || "🖼️"}</span>` : t.icon}</span>
        ${S.renaming === n.id ? `<input class="fx-rename" value="${esc(S.showExt || n.kind === "folder" ? n.name : shown(n))}" spellcheck="false" autocomplete="off" aria-label="Nouveau nom">${S.renameErr ? `<span class="fx-rename-err" role="alert">${esc(S.renameErr)}</span>` : ""}` : `<span class="fx-tile-n">${esc(shown(n))}</span>`}</div>`;
    }
    function crumbs() {
      if (S.trashView) return `<span class="fx-crumb on">🗑️ Corbeille</span>`;
      const p = pathOf(root, S.cur);
      return p.map((n, i) => `<button type="button" class="fx-crumb ${i === p.length - 1 ? "on" : ""} ${S.hintTool === "crumb" && i === 0 ? "fx-hint" : ""}" data-fx="crumb" data-id="${n.id}">${i === 0 ? "💻 " : ""}${esc(n.name)}</button>`).join(`<span class="fx-sep">›</span>`) + (S.search ? `<span class="fx-sep">›</span><span class="fx-crumb on">Résultats pour « ${esc(S.search)} »</span>` : "");
    }
    function dialogHTML() {
      const d = S.dialog; if (!d) return "";
      if (d.kind === "ext") return `<div class="fx-modal" role="alertdialog" aria-label="Renommer"><div class="fx-dlg"><div class="fx-dlg-t">⚠️ Renommer</div>
        <p>Si vous modifiez l'<b>extension</b> d'un nom de fichier, le fichier risque de devenir <b>inutilisable</b>.</p><p>Voulez-vous vraiment la modifier ?</p>
        <div class="fx-dlg-b"><button type="button" data-fx="extYes">Oui</button><button type="button" class="pri" data-fx="extNo">Non</button></div></div></div>`;
      if (d.kind === "exe") return `<div class="fx-modal" role="alertdialog"><div class="fx-dlg uac"><div class="fx-dlg-t uac">Contrôle de compte d'utilisateur</div>
        <p><b>Voulez-vous autoriser cette application à apporter des modifications à votre appareil ?</b></p>
        <div class="fx-uac-app">⚙️ <span><b>${esc(d.node.name)}</b><small>Éditeur : <b>${esc(d.node.publisher || "Inconnu")}</b></small></span></div>
        <div class="fx-dlg-b"><button type="button" data-fx="exeYes">Oui</button><button type="button" class="pri" data-fx="exeNo">Non</button></div></div></div>`;
      if (d.kind === "how") return `<div class="fx-modal" role="alertdialog"><div class="fx-dlg"><div class="fx-dlg-t">Comment voulez-vous ouvrir ce fichier ?</div>
        <p>L'ordinateur ne sait pas quel programme utiliser pour « ${esc(d.node.name)} ».</p><p class="fx-tip">💡 Souvent, c'est que l'<b>extension</b> (la fin du nom : .pdf, .jpg…) a été effacée ou abîmée.</p>
        <div class="fx-dlg-b"><button type="button" class="pri" data-fx="dlgClose">Fermer</button></div></div></div>`;
      if (d.kind === "delForever") return `<div class="fx-modal" role="alertdialog"><div class="fx-dlg"><div class="fx-dlg-t">Supprimer définitivement</div>
        <p>Voulez-vous vraiment supprimer <b>définitivement</b> « ${esc(d.node.name)} » ? On ne pourra plus le récupérer.</p>
        <div class="fx-dlg-b"><button type="button" data-fx="forever">Oui</button><button type="button" class="pri" data-fx="dlgClose">Non</button></div></div></div>`;
      if (d.kind === "empty") return `<div class="fx-modal" role="alertdialog"><div class="fx-dlg"><div class="fx-dlg-t">Vider la Corbeille</div>
        <p>Voulez-vous vraiment supprimer <b>définitivement</b> ces ${root.trash.length} élément(s) ? On ne pourra plus les récupérer.</p>
        <div class="fx-dlg-b"><button type="button" data-fx="emptyYes">Oui</button><button type="button" class="pri" data-fx="dlgClose">Non</button></div></div></div>`;
      return "";
    }
    function menuHTML() {
      const m = S.menu; if (!m) return "";
      const n = m.id ? nodeById(m.id) : null;
      const items = S.trashView
        ? (n ? [["restore", "↩️ Restaurer"], ["del", "❌ Supprimer définitivement"]] : [])
        : n ? [["open", n.kind === "folder" ? "📂 Ouvrir" : "📂 Ouvrir"], ...(n.drive ? [["eject", "⏏️ Éjecter"]] : []), ...(feat.cut && !n.special ? [["cut", "✂️ Couper"]] : []), ...(feat.copy && !n.special ? [["copy", "📄 Copier"]] : []), ...(feat.rename && !n.special ? [["rename", "✏️ Renommer"]] : []), ...(feat.del && !n.special ? [["del", "🗑️ Supprimer"]] : []), ["props", "ℹ️ Propriétés"]]
          : [...(feat.newFolder ? [["new", "📁 Nouveau dossier"]] : []), ...(S.clip ? [["paste", "📋 Coller"]] : []), ...(feat.sort ? [["sortdate", "⇅ Trier par date"]] : [])];
      if (!items.length) return "";
      return `<div class="fx-menu" style="left:${m.x}px;top:${m.y}px" role="menu">${items.map(([a, l]) => `<button type="button" role="menuitem" data-fx="m-${a}">${l}</button>`).join("")}</div>`;
    }

    function render() {
      if (destroyed) return;
      const list = items(), sel = selNode();
      const title = opts.picker ? (opts.picker.title || "Ouvrir") : (S.trashView ? "Corbeille" : S.cur.name);
      const trashBar = S.trashView ? `<button type="button" data-fx="restore" ${sel ? "" : "disabled"}>↩️ Restaurer</button><button type="button" data-fx="empty" ${root.trash.length ? "" : "disabled"}>🧹 Vider la Corbeille</button>` : "";
      el.innerHTML = `<div class="fx ${opts.big ? "big" : ""} ${opts.picker ? "picker" : ""}" role="application" aria-label="Explorateur de fichiers simulé">
        <div class="fx-title"><span>${opts.picker ? "📂" : "📁"} ${esc(title)}</span><span class="fx-win" aria-hidden="true"><i>—</i><i>▢</i><i>✕</i></span></div>
        <div class="fx-nav">
          <button type="button" data-fx="back" title="Précédent" aria-label="Précédent" class="${S.hintTool === "back" ? "fx-hint" : ""}" ${S.back.length ? "" : "disabled"}>←</button>
          <button type="button" data-fx="fwd" title="Suivant" aria-label="Suivant" ${S.fwd.length ? "" : "disabled"}>→</button>
          <button type="button" data-fx="up" title="Dossier parent" aria-label="Dossier parent" ${!S.trashView && parentOf(root, S.cur) ? "" : "disabled"}>↑</button>
          <div class="fx-path">${crumbs()}</div>
          ${feat.search ? `<label class="fx-search ${S.hintTool === "search" ? "fx-hint" : ""}"><span aria-hidden="true">🔍</span><input type="search" data-fx-in="search" value="${esc(S.search)}" placeholder="Rechercher dans ${esc(S.trashView ? "Corbeille" : S.cur.name)}" aria-label="Rechercher" ${S.trashView ? "disabled" : ""}></label>` : ""}
        </div>
        ${opts.picker ? "" : `<div class="fx-tools">
          ${S.trashView ? trashBar : `
          ${feat.newFolder ? `<div class="fx-dd"><button type="button" class="fx-new ${S.hintTool === "new" ? "fx-hint" : ""}" data-fx="newMenu">＋ Nouveau ▾</button>${S.newMenu ? `<div class="fx-pop"><button type="button" data-fx="newFolder">📁 Dossier</button></div>` : ""}</div><span class="fx-vsep"></span>` : ""}
          ${feat.cut ? `<button type="button" data-fx="cut" title="Couper" ${sel && !sel.special ? "" : "disabled"} class="${S.hintTool === "cut" ? "fx-hint" : ""}">✂️ Couper</button>${feat.copy ? `<button type="button" data-fx="copy" title="Copier" ${sel && !sel.special ? "" : "disabled"} class="${S.hintTool === "copy" ? "fx-hint" : ""}">📄 Copier</button>` : ""}<button type="button" data-fx="paste" title="Coller" ${S.clip ? "" : "disabled"} class="${S.hintTool === "paste" ? "fx-hint" : ""}">📋 Coller</button>` : ""}
          ${(() => { const d = (sel && sel.drive) ? sel : driveOf(S.cur); return d ? `<button type="button" data-fx="eject" data-id="${d.id}" class="${S.hintTool === "eject" ? "fx-hint" : ""}">⏏️ Éjecter</button>` : ""; })()}
          ${feat.rename ? `<button type="button" data-fx="rename" ${sel && !sel.special ? "" : "disabled"} class="${S.hintTool === "rename" ? "fx-hint" : ""}">✏️ Renommer</button>` : ""}
          ${feat.del ? `<button type="button" data-fx="del" ${sel && !sel.special ? "" : "disabled"} class="${S.hintTool === "del" ? "fx-hint" : ""}">🗑️ Supprimer</button>` : ""}
          <span class="fx-vsep"></span>
          ${feat.sort ? `<div class="fx-dd"><button type="button" data-fx="sortMenu" class="${S.hintTool === "sort" ? "fx-hint" : ""}">⇅ Trier ▾</button>${S.sortMenu ? `<div class="fx-pop">${[["name", "Nom"], ["date", "Date de modification"], ["type", "Type"], ["size", "Taille"]].map(([k, l]) => `<button type="button" data-fx="sortBy" data-k="${k}">${S.sort.key === k ? "●" : "○"} ${l}</button>`).join("")}<hr><button type="button" data-fx="sortDir" data-d="1">${S.sort.dir === 1 ? "●" : "○"} Croissant</button><button type="button" data-fx="sortDir" data-d="-1">${S.sort.dir === -1 ? "●" : "○"} Décroissant</button></div>` : ""}</div>` : ""}
          ${feat.view ? `<div class="fx-dd"><button type="button" data-fx="viewMenu" class="${S.hintTool === "view" ? "fx-hint" : ""}">👁️ Afficher ▾</button>${S.viewMenu ? `<div class="fx-pop"><button type="button" data-fx="viewMode" data-v="details">${S.view === "details" ? "●" : "○"} Détails</button><button type="button" data-fx="viewMode" data-v="tiles">${S.view === "tiles" ? "●" : "○"} Grandes icônes</button><hr><button type="button" data-fx="ext" class="${S.hintTool === "ext" ? "fx-hint" : ""}">${S.showExt ? "☑" : "☐"} Extensions de noms de fichiers</button></div>` : ""}</div>` : ""}`}
        </div>`}
        <div class="fx-body">
          <nav class="fx-side" aria-label="Dossiers"><ul>${sideItem(root)}</ul>
            ${feat.trash && !opts.picker ? `<button type="button" class="fx-side-b trash ${S.trashView ? "on" : ""} ${S.hint === "__trash" ? "fx-hint" : ""}" data-fx="trash">🗑️ <span>Corbeille${root.trash.length ? ` (${root.trash.length})` : ""}</span></button>` : ""}</nav>
          <div class="fx-main" data-fx="bg" ${S.trashView ? "" : `data-drop="${S.cur.id}"`}>
            ${S.view === "tiles" && !S.search && !S.trashView
              ? `<div class="fx-tiles">${list.map(tile).join("") || `<div class="fx-empty">Ce dossier est vide.</div>`}</div>`
              : `<div class="fx-list" role="grid"><div class="fx-row head" role="row">
                  ${[["name", "Nom"], ["date", S.trashView ? "" : "Modifié le"], ["type", "Type"], ["size", "Taille"]].map(([k, l]) => `<button type="button" class="fx-h" data-fx="sortBy" data-k="${k}" ${S.trashView ? "disabled" : ""}>${l}${S.sort.key === k && !S.trashView ? (S.sort.dir === 1 ? " ▲" : " ▼") : ""}</button>`).join("")}</div>
                ${list.map(row).join("") || `<div class="fx-empty">${S.search ? "Aucun élément ne correspond à votre recherche." : S.trashView ? "La Corbeille est vide." : "Ce dossier est vide."}</div>`}</div>`}
          </div>
        </div>
        <div class="fx-status">${list.length} élément(s)${sel ? ` · 1 élément sélectionné${sel.kind === "file" ? " · " + fmtSize(sel.size) : ""}` : ""}</div>
        ${opts.picker ? `<div class="fx-pickbar"><label>Nom du fichier : <input readonly value="${esc(sel && sel.kind === "file" ? sel.name : "")}" tabindex="-1"></label>
            <span class="fx-filter">${opts.picker.accept ? "Fichiers (" + opts.picker.accept.map(a => "*." + a).join(", ") + ")" : "Tous les fichiers (*.*)"}</span>
            ${S.pickErr ? `<span class="fx-pick-err" role="alert">${esc(S.pickErr)}</span>` : ""}
            <button type="button" class="pri" data-fx="pick" ${sel && sel.kind === "file" ? "" : "disabled"}>${esc(opts.picker.button || "Ouvrir")}</button><button type="button" data-fx="cancel">Annuler</button></div>` : ""}
        <div class="fx-flash ${S.flash?.kind || ""}" role="status" ${S.flash ? "" : "hidden"}>${S.flash?.html || ""}</div>
        ${S.viewer ? `<div class="fx-viewer" role="dialog" aria-label="Aperçu de ${esc(S.viewer.node.name)}"><div class="fx-viewer-bar"><span>${typeOf(S.viewer.node).icon} ${esc(S.viewer.node.name)}</span><button type="button" data-fx="closeViewer">✕ Fermer</button></div><div class="fx-viewer-body">${S.viewer.html}</div></div>` : ""}
        ${dialogHTML()}${menuHTML()}
      </div>`;
      const ri = el.querySelector(".fx-rename");
      if (ri) {
        ri.addEventListener("keydown", e => { e.stopPropagation(); if (e.key === "Enter") { e.preventDefault(); commitRename(ri.value); } else if (e.key === "Escape") { S.renaming = null; S.renameErr = ""; render(); } });
        ri.addEventListener("blur", () => setTimeout(() => { if (S.renaming && !S.dialog && el.contains(ri)) commitRename(ri.value); }, 120));
      }
      const si = el.querySelector('[data-fx-in="search"]');
      if (si) si.addEventListener("input", () => {
        S.search = si.value; S.sel = null;
        const pos = si.selectionStart; render();
        const s2 = el.querySelector('[data-fx-in="search"]'); s2.focus(); s2.setSelectionRange(pos, pos);
        clearTimeout(S.searchT); S.searchT = setTimeout(() => emit("search", { q: S.search, results: items() }), 500);
      });
    }

    /* =================== ÉVÉNEMENTS =================== */
    const closePops = () => { S.newMenu = S.sortMenu = S.viewMenu = false; S.menu = null; };
    function onClick(e) {
      const b = e.target.closest("[data-fx]");
      if (!b || !el.contains(b)) { if (S.menu || S.newMenu || S.sortMenu || S.viewMenu) { closePops(); render(); } return; }
      const a = b.dataset.fx, id = b.dataset.id;
      const pops = ["newMenu", "sortMenu", "viewMenu"];
      if (!pops.includes(a) && !a.startsWith("sort") && a !== "viewMode" && a !== "ext") { if (S.newMenu || S.sortMenu || S.viewMenu) { S.newMenu = S.sortMenu = S.viewMenu = false; } }
      if (S.menu && !a.startsWith("m-")) S.menu = null;
      switch (a) {
        case "row": {
          if (S.renaming === id) return;
          if (S.renaming) commitRename(el.querySelector(".fx-rename")?.value);
          S.sel = id; S.pickErr = "";
          el.querySelectorAll("[data-fx=row]").forEach(r => r.classList.toggle("sel", r.dataset.id === id));
          // met à jour la barre sans tout redessiner (garde le double-clic)
          const n = nodeById(id);
          el.querySelectorAll('[data-fx="cut"],[data-fx="copy"],[data-fx="rename"],[data-fx="del"],[data-fx="restore"]').forEach(x => { x.disabled = !n || !!n.special; });
          const pb = el.querySelector('[data-fx="pick"]'); if (pb) pb.disabled = !(n && n.kind === "file");
          const pn = el.querySelector(".fx-pickbar input"); if (pn) pn.value = n && n.kind === "file" ? n.name : "";
          const pe = el.querySelector(".fx-pick-err"); if (pe) pe.remove();
          const st = el.querySelector(".fx-status"); if (st && n) st.textContent = `${items().length} élément(s) · 1 élément sélectionné${n.kind === "file" ? " · " + fmtSize(n.size) : ""}`;
          emit("select", { file: n });
          return;
        }
        case "bg": if (e.target.closest(".fx-row,.fx-tile")) return; if (S.sel) { S.sel = null; render(); } return;
        case "side": go(findIn(root, n => n.id === id), { via: "side" }); return;
        case "crumb": go(findIn(root, n => n.id === id), { via: "crumb" }); return;
        case "trash": goTrash(); return;
        case "back": histGo(S.back, S.fwd); return;
        case "fwd": histGo(S.fwd, S.back, "fwd"); return;
        case "up": go(parentOf(root, S.cur), { via: "up" }); return;
        case "newMenu": S.newMenu = !S.newMenu; S.sortMenu = S.viewMenu = false; render(); return;
        case "sortMenu": S.sortMenu = !S.sortMenu; S.newMenu = S.viewMenu = false; render(); return;
        case "viewMenu": S.viewMenu = !S.viewMenu; S.newMenu = S.sortMenu = false; render(); return;
        case "newFolder": newFolder(); return;
        case "sortBy": { const k = b.dataset.k; if (S.sort.key === k && b.classList.contains("fx-h")) S.sort.dir *= -1; else { S.sort.key = k; S.sort.dir = k === "date" ? -1 : 1; } S.sortMenu = false; render(); emit("sort", { ...S.sort }); return; }
        case "sortDir": S.sort.dir = Number(b.dataset.d); S.sortMenu = false; render(); emit("sort", { ...S.sort }); return;
        case "viewMode": S.view = b.dataset.v; S.viewMenu = false; render(); return;
        case "ext": S.showExt = !S.showExt; S.viewMenu = false; render(); emit("showExt", { on: S.showExt }); return;
        case "cut": cut(selNode()); return;
        case "copy": copyNode(selNode()); return;
        case "eject": eject(findIn(root, x => x.id === b.dataset.id)); return;
        case "paste": paste(); return;
        case "rename": startRename(selNode()); return;
        case "del": del(selNode()); return;
        case "restore": restore(selNode()); return;
        case "empty": S.dialog = { kind: "empty" }; render(); return;
        case "emptyYes": { const n = root.trash.length; root.trash = []; S.dialog = null; S.sel = null; render(); emit("emptyTrash", { count: n }); return; }
        case "forever": { const n = S.dialog.node; root.trash = root.trash.filter(t => t.node !== n); S.dialog = null; S.sel = null; render(); emit("emptyTrash", { count: 1, file: n }); return; }
        case "closeViewer": { const n = S.viewer?.node; S.viewer = null; render(); emit("closeViewer", { file: n }); return; }
        case "dlgClose": S.dialog = null; render(); return;
        case "extYes": { const d = S.dialog; S.dialog = null; S.renaming = d.node.id; commitRename(d.value, { force: true }); emit("extChanged", { file: d.node }); return; }
        case "extNo": S.dialog = null; S.renaming = null; render(); emit("extKept", {}); return;
        case "exeYes": { const n = S.dialog.node; S.dialog = null; render(); emit("exeRun", { file: n }); return; }
        case "exeNo": { const n = S.dialog.node; S.dialog = null; render(); emit("exeRefused", { file: n }); return; }
        case "pick": pick(selNode()); return;
        case "cancel": emit("cancel", {}); return;
      }
      if (a.startsWith("m-")) {
        const n = S.menu?.id ? nodeById(S.menu.id) : null; S.menu = null;
        const act = a.slice(2);
        if (act === "open") open(n); else if (act === "cut") cut(n); else if (act === "copy") copyNode(n); else if (act === "eject") eject(n); else if (act === "rename") startRename(n);
        else if (act === "del") del(n); else if (act === "restore") restore(n); else if (act === "new") newFolder(); else if (act === "paste") paste();
        else if (act === "sortdate") { S.sort = { key: "date", dir: -1 }; render(); emit("sort", { ...S.sort }); }
        else if (act === "props" && n) { render(); flash(`ℹ️ <b>${esc(n.name)}</b> · ${esc(typeOf(n).label)}${n.kind === "file" ? " · " + fmtSize(n.size) : ""} · modifié le ${fmtDate(n.date)}<br>Emplacement : ${esc(pathOf(root, parentOf(root, n) || root).map(x => x.name).join(" › "))}`, "info", 7000); emit("props", { file: n }); }
        else render();
        if (act !== "props" && act !== "open") emit("menu", { action: act, file: n });
      }
    }
    function onDbl(e) {
      const r = e.target.closest("[data-fx=row]"); if (!r || !el.contains(r) || S.renaming === r.dataset.id) return;
      e.preventDefault(); S.sel = r.dataset.id; open(nodeById(r.dataset.id));
    }
    function onCtx(e) {
      if (!el.contains(e.target) || e.target.closest(".fx-viewer,.fx-modal,input")) return;
      const main = e.target.closest(".fx-main,.fx-row,.fx-tile"); if (!main) return;
      e.preventDefault();
      const r = e.target.closest("[data-fx=row]");
      const box = el.querySelector(".fx").getBoundingClientRect();
      S.sel = r ? r.dataset.id : null; S.newMenu = S.sortMenu = S.viewMenu = false;
      S.menu = { id: r?.dataset.id || null, x: Math.min(e.clientX - box.left, box.width - 210), y: Math.min(e.clientY - box.top, box.height - 200) };
      render(); emit("contextmenu", { file: r ? nodeById(r.dataset.id) : null });
    }
    function onKey(e) {
      if (!el.contains(e.target) || e.target.matches("input,textarea")) return;
      if (S.viewer && e.key === "Escape") { S.viewer = null; render(); return; }
      if (S.dialog && e.key === "Escape") { S.dialog = null; render(); return; }
      const n = selNode();
      if (e.key === "Enter" && n) { e.preventDefault(); open(n); }
      else if (e.key === "F2" && n) { e.preventDefault(); startRename(n); }
      else if (e.key === "Delete" && n) { e.preventDefault(); del(n); }
      else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "x" && n) { e.preventDefault(); cut(n); }
      else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "c" && n && feat.copy) { e.preventDefault(); copyNode(n); }
      else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "v") { e.preventDefault(); paste(); }
      else if (e.key === "Backspace") { e.preventDefault(); histGo(S.back, S.fwd); }
      else if (e.key === "ArrowDown" || e.key === "ArrowUp") {
        const ids = items().map(x => x.id); if (!ids.length) return; e.preventDefault();
        let i = ids.indexOf(S.sel); i = e.key === "ArrowDown" ? Math.min(ids.length - 1, i + 1) : Math.max(0, i - 1);
        S.sel = ids[i]; render(); el.querySelector(`[data-id="${ids[i]}"].fx-row,[data-id="${ids[i]}"].fx-tile`)?.focus();
      }
    }
    /* glisser-déposer */
    let dragId = null;
    function onDragStart(e) { const r = e.target.closest("[data-fx=row]"); if (!r) return; dragId = r.dataset.id; e.dataTransfer.effectAllowed = "move"; try { e.dataTransfer.setData("text/plain", dragId); } catch (x) {} }
    function onDragOver(e) { const t = e.target.closest("[data-drop]"); if (!t || !dragId || t.dataset.drop === dragId) return; e.preventDefault(); el.querySelectorAll(".fx-over").forEach(x => x.classList.remove("fx-over")); t.classList.add("fx-over"); }
    function onDragLeave(e) { const t = e.target.closest("[data-drop]"); if (t && !t.contains(e.relatedTarget)) t.classList.remove("fx-over"); }
    function onDrop(e) {
      const t = e.target.closest("[data-drop]"); el.querySelectorAll(".fx-over").forEach(x => x.classList.remove("fx-over"));
      if (!t || !dragId) return; e.preventDefault();
      const n = findIn(root, x => x.id === dragId), dest = findIn(root, x => x.id === t.dataset.drop); dragId = null;
      if (n && dest && n !== dest) { if (n.special) { flash("Ce dossier fait partie de Windows : on ne le déplace pas.", "warn"); return; } if (driveOf(n) !== driveOf(dest)) copyTo(n, dest); else move(n, dest); }
    }
    function onDragEnd() { dragId = null; el.querySelectorAll(".fx-over").forEach(x => x.classList.remove("fx-over")); }

    el.addEventListener("click", onClick);
    el.addEventListener("dblclick", onDbl);
    el.addEventListener("contextmenu", onCtx);
    el.addEventListener("keydown", onKey);
    el.addEventListener("dragstart", onDragStart);
    el.addEventListener("dragover", onDragOver);
    el.addEventListener("dragleave", onDragLeave);
    el.addEventListener("drop", onDrop);
    el.addEventListener("dragend", onDragEnd);

    const ctl = {
      root, state: S, render, go, goTrash, open, flash, newFolder, move, del, restore,
      find: pred => findIn(root, pred),
      byTag: tag => findIn(root, n => n.tag === tag),
      byName: name => findIn(root, n => n.name === name),
      pathOf: n => pathOf(root, n).map(x => x.name),
      parentOf: n => parentOf(root, n),
      inTrash: n => root.trash.some(t => t.node === n),
      driveOf, copyTo,
      addNode(parent, node) { (parent || root).children.push(node); render(); },
      removeNode(node) { const p = parentOf(root, node); if (!p) return; if (isInside(root, S.cur, node)) { S.cur = root; S.search = ""; } if (S.clip && findIn(node, x => x.id === S.clip)) S.clip = null; p.children = p.children.filter(c => c !== node); S.sel = null; render(); },
      /** Fait clignoter un élément ou un outil (aide débutant). hint : id de nœud, "__trash", ou outil (tool) */
      hint(id, tool) { S.hint = id || null; S.hintTool = tool || null; render(); },
      get current() { return S.trashView ? null : S.cur; },
      get selected() { return selNode(); },
      destroy() { destroyed = true; clearTimeout(flashTimer); clearTimeout(S.searchT); el.removeEventListener("click", onClick); el.removeEventListener("dblclick", onDbl); el.removeEventListener("contextmenu", onCtx); el.removeEventListener("keydown", onKey); ["dragstart", "dragover", "dragleave", "drop", "dragend"].forEach((t, i) => el.removeEventListener(t, [onDragStart, onDragOver, onDragLeave, onDrop, onDragEnd][i])); el.innerHTML = ""; }
    };
    render();
    return ctl;
  }

  AN.files = { explorer, file, folder, pc, ago, TYPES, typeOf, extOf, baseOf, fmtSize, walk, findIn, pathOf };
})(window.AN);

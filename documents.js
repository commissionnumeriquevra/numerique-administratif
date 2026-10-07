/* Missions « Documents » : télécharger, retrouver un fichier, pièce manquante. */
(function (AN) {
  "use strict";
  const { esc, safeName, makePdf, downloadBlob, MONTHS, MONTHS_FR } = AN.util;
  const R = AN.missions.register;

  const monthAgo = n => { const d = new Date(); d.setDate(1); d.setMonth(d.getMonth() - n); return d; };
  const monthKey = d => MONTHS[d.getMonth()] + "_" + d.getFullYear();
  const monthLabel = d => MONTHS_FR[d.getMonth()] + " " + d.getFullYear();

  function pdfFor(ctx, base, title, extra = []) {
    const file = `${base}_${safeName(ctx.name)}.pdf`;
    const blob = makePdf(title, [
      "Nom : " + ctx.name + " (fictif)",
      "Organisme : Service public d'exercice",
      "Date d'édition : " + new Date().toLocaleDateString("fr-FR"),
      ...extra,
      "",
      "Ce document a été créé pour un atelier numérique.",
      "Il n'a aucune valeur administrative."
    ]);
    downloadBlob(file, blob);
    return file;
  }

  /* ======================= TÉLÉCHARGER UN DOCUMENT ======================= */
  R("download_doc", {
    steps: 3, theme: "download",
    render(ctx) {
      const step = ctx.m.step || 0;
      const L = ctx.local;
      const cur = monthAgo(0), prev = monthAgo(1);
      const docs = ctx.byLevel({
        beginner: [
          { id: "attestation_droits", label: "Attestation de droits", sub: "PDF · 1 page" },
          { id: "releve_situation", label: "Relevé de situation", sub: "PDF · 2 pages" }
        ],
        intermediate: [
          { id: "attestation_droits", label: "Attestation de droits", sub: "PDF · 1 page" },
          { id: "releve_situation", label: "Relevé de situation", sub: "PDF · 2 pages" },
          { id: "attestation_paiement", label: "Attestation de paiement", sub: "PDF · 1 page" },
          { id: "courrier_info", label: "Courrier d'information", sub: "PDF · 1 page" }
        ],
        expert: [
          { id: "attestation_paiement_" + monthKey(prev), label: "Attestation de paiement — " + monthLabel(prev), sub: "PDF · éditée le 02/" + String(prev.getMonth() + 1).padStart(2, "0") },
          { id: "releve_situation", label: "Relevé de situation", sub: "PDF · 2 pages" },
          { id: "attestation_paiement_" + monthKey(cur), label: "Attestation de paiement — " + monthLabel(cur), sub: "PDF · éditée le 02/" + String(cur.getMonth() + 1).padStart(2, "0") },
          { id: "attestation_droits", label: "Attestation de droits", sub: "PDF · 1 page" }
        ]
      });
      const target = ctx.byLevel({ beginner: "attestation_droits", intermediate: "attestation_paiement", expert: "attestation_paiement_" + monthKey(cur) });
      const consigne = ctx.byLevel({
        beginner: "Téléchargez votre <b>attestation de droits</b>.",
        intermediate: "Téléchargez votre <b>attestation de paiement</b>.",
        expert: "Téléchargez l'<b>attestation de paiement la plus récente</b>."
      });

      if (step === 0) {
        ctx.html(`${ctx.header("Mission", "Télécharger une attestation", 0)}
          <div class="mission-step"><h2>Objectif</h2><p data-speak>${consigne} Le fichier sera enregistré sur cet ordinateur.</p>
          ${ctx.help("Repérez le bouton avec une flèche vers le bas ⬇ : c'est le bouton « Télécharger ».")}
          <button class="primary" type="button" data-act="start">Commencer</button></div>`);
        ctx.act("start", () => ctx.go(1));
        return;
      }
      if (step === 1) {
        ctx.html(`${ctx.header("Simulation administrative", "Mes documents", 1)}
          <p class="consigne" data-speak>${consigne}</p>
          <div class="fake-admin"><div class="training-watermark">⚠ SIMULATION PÉDAGOGIQUE — documents fictifs</div>
            <div class="fake-admin-head">Mon espace personnel › Mes documents</div>
            <div class="fake-admin-body"><div class="doc-grid">
              ${docs.map(d => `<div class="doc-row ${ctx.isBeginner() && d.id === target ? "pulse-hint" : ""}"><span class="file-icon">PDF</span><div><strong>${esc(d.label)}</strong><br><small>${esc(d.sub)}</small></div><button type="button" class="secondary" data-act="dl" data-doc="${esc(d.id)}" aria-label="Télécharger ${esc(d.label)}">⬇ Télécharger</button></div>`).join("")}
            </div><div id="dlFeedback" aria-live="polite"></div></div></div>`);
        ctx.act("dl", el => {
          const id = el.dataset.doc, d = docs.find(x => x.id === id);
          if (id !== target) {
            ctx.box.querySelector("#dlFeedback").innerHTML = `<div class="alert bad">Ce n'est pas le document demandé. Relisez la consigne : ${consigne}</div>`;
            return;
          }
          L.file = pdfFor(ctx, id, d.label, ["Situation : droits ouverts (exercice)"]);
          ctx.go(2);
        });
        return;
      }
      ctx.html(`${ctx.header("Étape 3", "Où est mon fichier ?", 2)}
        <div class="mission-step">
          <div class="fake-file"><span class="file-icon">PDF</span><div><strong>${esc(L.file || "attestation.pdf")}</strong><br><small>Téléchargement terminé</small></div></div>
          <p data-speak>Le fichier a été enregistré dans le dossier <b>Téléchargements</b> de l'ordinateur.</p>
          ${ctx.byLevel({
            beginner: `<div class="alert good">💡 En haut à droite du navigateur, cliquez sur la petite flèche ⬇ : votre fichier apparaît. Cliquez dessus pour l'ouvrir.</div>`,
            intermediate: `<div class="mouse-hint">Ouvrez le fichier depuis la liste des téléchargements du navigateur, puis revenez ici.</div>`,
            expert: `<div class="mouse-hint">Ouvrez l'Explorateur de fichiers (touches <span class="keycap">⊞ Windows</span> + <span class="keycap">E</span>), allez dans Téléchargements et ouvrez le fichier.</div>`
          })}
          <button class="primary" type="button" data-act="found">J'ai ouvert mon fichier ✓</button>
          <button class="ghost-btn" type="button" data-act="again">Le télécharger à nouveau</button>
        </div>`);
      ctx.act("found", () => ctx.complete({ key: "download", label: "J'ai téléchargé et ouvert un document", text: "Vous avez téléchargé un document et l'avez retrouvé sur l'ordinateur." }));
      ctx.act("again", () => { L.file = pdfFor(ctx, target, "Attestation", []); AN.util.toast("Fichier téléchargé à nouveau.", "good"); });
    }
  });

  /* ======================= RETROUVER UN FICHIER ======================= */
  R("find_file", {
    steps: 3, theme: "files",
    render(ctx) {
      const step = ctx.m.step || 0;
      const L = ctx.local;
      const year = new Date().getFullYear() - 1;
      const goalName = `avis_impot_${year}.pdf`;
      if (!L.fs) {
        const day = n => { const d = new Date(); d.setDate(d.getDate() - n); return d.getTime(); };
        const isB = ctx.isBeginner();
        L.fs = {
          bureau: [{ name: "Corbeille.lnk", date: day(200), type: "Raccourci", size: "1 Ko" }],
          telechargements: [
            { name: "recette_gateau.pdf", date: day(30), type: "PDF", size: "88 Ko" },
            { name: "photo_vacances.jpg", date: day(12), type: "Image", size: "2,1 Mo" },
            { name: isB ? goalName : "document (3).pdf", date: day(0), type: "PDF", size: "152 Ko", target: true },
            { name: "document (2).pdf", date: day(3), type: "PDF", size: "97 Ko", content: "Facture d'électricité (fictive)" },
            { name: `avis_impot_${year - 1}.pdf`, date: day(380), type: "PDF", size: "149 Ko", content: `Avis d'impôt ${year - 1} (fictif)` },
            { name: "installer_lecteur.exe", date: day(60), type: "Application", size: "3,4 Mo", content: "Programme d'installation" }
          ],
          documents: [{ name: "Mes démarches", folder: "demarches", type: "Dossier" }, { name: "lettre_mairie.docx", date: day(90), type: "Document Word", size: "24 Ko" }],
          demarches: [{ name: "carte_identite_scan.pdf", date: day(400), type: "PDF", size: "210 Ko" }],
          images: [{ name: "photo_identite.jpg", date: day(140), type: "Image", size: "540 Ko" }]
        };
        Object.assign(L, { cur: "bureau", sel: null, opened: false, renamed: isB, moved: false, sorted: false, viewer: null, renaming: false, moving: false, msg: "" });
      }
      const goals = ctx.byLevel({
        beginner: [["opened", "Ouvrir le dossier Téléchargements puis ouvrir l'avis d'impôt"]],
        intermediate: [["opened", "Retrouver le dernier fichier téléchargé et l'ouvrir pour vérifier que c'est l'avis d'impôt"], ["renamed", `Le renommer en ${goalName}`]],
        expert: [["opened", "Retrouver et ouvrir le dernier fichier téléchargé (l'avis d'impôt)"], ["renamed", `Le renommer en ${goalName}`], ["moved", "Le ranger dans Documents › Mes démarches"]]
      });

      if (step === 0) {
        ctx.html(`${ctx.header("Mission fichiers", "Retrouver un fichier téléchargé", 0)}
          <div class="mission-step"><h2>La situation</h2>
          <p data-speak>Vous venez de télécharger votre avis d'impôt sur un site administratif. Mais où est-il passé ? Vous allez le retrouver dans l'Explorateur de fichiers.</p>
          <ul class="goal-list">${goals.map(g => `<li>${esc(g[1])}</li>`).join("")}</ul>
          ${ctx.help("L'Explorateur de fichiers est l'icône en forme de dossier jaune 📁, en bas de l'écran sous Windows.")}
          <button class="primary" type="button" data-act="start">Ouvrir l'Explorateur de fichiers</button></div>`);
        ctx.act("start", () => ctx.go(1));
        return;
      }

      const folders = [["bureau", "🖥️", "Bureau"], ["telechargements", "⬇️", "Téléchargements"], ["documents", "📄", "Documents"], ["images", "🖼️", "Images"]];
      const pathLabel = { bureau: "Ce PC › Bureau", telechargements: "Ce PC › Téléchargements", documents: "Ce PC › Documents", demarches: "Ce PC › Documents › Mes démarches", images: "Ce PC › Images" };
      let files = [...L.fs[L.cur]];
      if (L.sorted) files.sort((a, b) => (b.date || 0) - (a.date || 0));
      const fmt = t => t ? new Date(t).toLocaleDateString("fr-FR") + " " + new Date(t).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }) : "";
      const selected = L.sel != null ? L.fs[L.cur].find(f => f.name === L.sel) : null;
      const done = goals.every(g => L[g[0]]);

      ctx.html(`${ctx.header("Explorateur de fichiers (simulation)", "Retrouver mon avis d'impôt", 1)}
        <div class="goal-box"><strong>À faire :</strong><ul class="goal-list">${goals.map(g => `<li class="${L[g[0]] ? "done" : ""}">${L[g[0]] ? "✓ " : ""}${esc(g[1])}</li>`).join("")}</ul></div>
        ${ctx.isBeginner() && L.cur !== "telechargements" ? `<div class="alert good">💡 Cliquez sur « Téléchargements » dans la colonne de gauche.</div>` : ""}
        ${ctx.isBeginner() && L.cur === "telechargements" && !L.opened ? `<div class="alert good">💡 Double-cliquez sur <b>${esc(goalName)}</b> (ou cliquez dessus puis sur « Ouvrir »).</div>` : ""}
        <div class="explorer" role="application" aria-label="Explorateur de fichiers simulé">
          <div class="explorer-title"><span>📁 Explorateur de fichiers</span><span class="win-btns">— ▢ ✕</span></div>
          <div class="explorer-toolbar">
            <button type="button" data-act="open" ${selected ? "" : "disabled"}>📂 Ouvrir</button>
            <button type="button" data-act="rename" ${selected && !selected.folder ? "" : "disabled"}>✎ Renommer</button>
            <button type="button" data-act="move" ${selected && !selected.folder ? "" : "disabled"}>➜ Déplacer vers…</button>
            <button type="button" data-act="sort" class="${L.sorted ? "on" : ""}">⇅ Trier par date</button>
          </div>
          <div class="explorer-path">${esc(pathLabel[L.cur])}</div>
          <div class="explorer-body">
            <nav class="explorer-side" aria-label="Dossiers">
              ${folders.map(([id, ic, lab]) => `<button type="button" data-act="folder" data-folder="${id}" class="${L.cur === id || (id === "documents" && L.cur === "demarches") ? "active" : ""} ${ctx.isBeginner() && id === "telechargements" && L.cur !== id ? "pulse-hint" : ""}">${ic} ${lab}</button>`).join("")}
            </nav>
            <div class="explorer-files">
              <div class="file-row head"><span>Nom</span><span>Modifié le</span><span>Type</span><span>Taille</span></div>
              ${files.length ? files.map(f => `<div class="file-row ${L.sel === f.name ? "selected" : ""}" role="button" tabindex="0" data-act="select" data-dbl="open" data-name="${esc(f.name)}" aria-label="${esc(f.name)}">
                  <span>${f.folder ? "📁" : f.type === "PDF" ? "📕" : f.type === "Image" ? "🖼️" : f.type === "Application" ? "⚙️" : "📄"} ${esc(f.name)}</span><span>${fmt(f.date)}</span><span>${esc(f.type)}</span><span>${esc(f.size || "")}</span></div>`).join("") : `<div class="empty-state">Ce dossier est vide.</div>`}
            </div>
          </div>
          ${L.renaming && selected ? `<div class="explorer-dialog"><label for="renameInput"><strong>Nouveau nom</strong></label><input id="renameInput" value="${esc(selected.name)}" autocomplete="off" spellcheck="false"><button type="button" class="primary" data-act="doRename">Valider</button><button type="button" class="secondary" data-act="cancel">Annuler</button></div>` : ""}
          ${L.moving && selected ? `<div class="explorer-dialog"><strong>Déplacer « ${esc(selected.name)} » vers :</strong><div class="move-choices">${[["bureau", "Bureau"], ["documents", "Documents"], ["demarches", "Documents › Mes démarches"], ["images", "Images"]].filter(([id]) => id !== L.cur).map(([id, lab]) => `<button type="button" class="secondary" data-act="doMove" data-to="${id}">${lab}</button>`).join("")}</div><button type="button" class="ghost-btn" data-act="cancel">Annuler</button></div>` : ""}
          ${L.viewer ? `<div class="pdf-viewer"><div class="pdf-viewer-bar">📕 ${esc(L.viewer.name)} <button type="button" data-act="closeViewer" aria-label="Fermer le document">✕ Fermer</button></div><div class="pdf-page"><div class="pdf-banner">DOCUMENT FICTIF — EXERCICE</div><h3>${esc(L.viewer.content || "Document")}</h3><p>Nom : ${esc(ctx.name)} (fictif)</p><p>Ce document ne sert qu'à l'exercice.</p></div></div>` : ""}
        </div>
        <div id="fsMsg" aria-live="polite">${L.msg}</div>
        ${done ? `<div class="mouse-finish"><strong>Parfait !</strong> Votre avis d'impôt est retrouvé${ctx.level !== "beginner" ? ", bien nommé" : ""}${ctx.level === "expert" ? " et bien rangé" : ""}.</div><button type="button" class="primary" data-act="finish">Terminer la mission →</button>` : ""}`);

      const say = (html, kind = "warn") => { L.msg = `<div class="alert ${kind}">${html}</div>`; ctx.render(); };
      const findSel = () => L.fs[L.cur].find(f => f.name === L.sel);
      ctx.act("folder", el => { L.cur = el.dataset.folder; L.sel = null; L.renaming = L.moving = false; L.msg = ""; ctx.render(); });
      // Sélection sans redessiner (sinon le double-clic serait perdu)
      ctx.act("select", el => {
        L.sel = el.dataset.name;
        ctx.box.querySelectorAll(".file-row.selected").forEach(r => r.classList.remove("selected"));
        el.classList.add("selected");
        const f = findSel();
        const tb = ctx.box.querySelector(".explorer-toolbar");
        tb.querySelector('[data-act="open"]').disabled = !f;
        tb.querySelector('[data-act="rename"]').disabled = !f || !!f.folder;
        tb.querySelector('[data-act="move"]').disabled = !f || !!f.folder;
      });
      const open = el => {
        if (el && el.dataset.name) L.sel = el.dataset.name;
        const f = findSel(); if (!f) return;
        if (f.folder) { L.cur = f.folder; L.sel = null; L.msg = ""; return ctx.render(); }
        if (f.type === "Application") return say("⚠ C'est un <b>programme</b> (.exe), pas un document. On ne l'ouvre pas sans savoir d'où il vient.", "bad");
        if (f.type !== "PDF") { L.viewer = { name: f.name, content: f.type === "Image" ? "Une image" : "Un document" }; L.msg = ""; return ctx.render(); }
        L.viewer = { name: f.name, content: f.target ? `Avis d'impôt ${year} sur les revenus ${year - 1} (fictif)` : f.content || "Document" };
        if (f.target) { L.opened = true; L.msg = `<div class="alert good">C'est bien votre avis d'impôt ${year} !</div>`; }
        else L.msg = `<div class="alert warn">Ce n'est pas le bon fichier. ${ctx.level !== "beginner" ? "Astuce : triez par date pour voir le plus récent en premier." : ""}</div>`;
        ctx.render();
      };
      ctx.act("open", () => open());
      ctx.dbl("open", el => open(el));
      ctx.act("closeViewer", () => { L.viewer = null; ctx.render(); });
      ctx.act("sort", () => { L.sorted = !L.sorted; ctx.render(); });
      ctx.act("cancel", () => { L.renaming = L.moving = false; ctx.render(); });
      ctx.act("rename", () => { L.renaming = true; L.moving = false; ctx.render(); const i = ctx.box.querySelector("#renameInput"); if (i) { i.focus(); i.setSelectionRange(0, i.value.lastIndexOf(".") > 0 ? i.value.lastIndexOf(".") : i.value.length); i.addEventListener("keydown", e => { if (e.key === "Enter") ctx._acts.doRename(); }); } });
      ctx.act("doRename", () => {
        const f = findSel(); const v = ctx.box.querySelector("#renameInput").value.trim();
        if (!v) return;
        if (!/\.pdf$/i.test(v) && /\.pdf$/i.test(f.name)) { L.renaming = false; return say("⚠ Attention : vous avez effacé l'extension <b>.pdf</b>. Sans elle, l'ordinateur ne sait plus ouvrir le fichier. Recommencez en gardant « .pdf » à la fin.", "bad"); }
        if (L.fs[L.cur].some(x => x !== f && x.name.toLowerCase() === v.toLowerCase())) { L.renaming = false; return say("Un fichier porte déjà ce nom dans ce dossier."); }
        f.name = v; L.sel = v; L.renaming = false;
        if (f.target && v.toLowerCase() === goalName) { L.renamed = true; L.msg = `<div class="alert good">Fichier renommé. Il sera bien plus facile à retrouver !</div>`; }
        else if (f.target) L.msg = `<div class="alert warn">Renommé, mais le nom attendu est <b>${esc(goalName)}</b>.</div>`;
        else L.msg = `<div class="alert warn">Vous avez renommé un autre fichier que l'avis d'impôt.</div>`;
        ctx.render();
      });
      ctx.act("move", () => { L.moving = true; L.renaming = false; ctx.render(); });
      ctx.act("doMove", el => {
        const f = findSel(); const to = el.dataset.to;
        L.fs[L.cur] = L.fs[L.cur].filter(x => x !== f);
        L.fs[to].push(f);
        L.moving = false; L.sel = null;
        if (f.target && to === "demarches") { L.moved = true; L.msg = `<div class="alert good">Rangé dans « Mes démarches ». Il ne se perdra plus parmi les téléchargements.</div>`; }
        else L.msg = `<div class="alert warn">Fichier déplacé vers ${to === "demarches" ? "Mes démarches" : to}. ${f.target ? "Ce n'est pas le dossier demandé." : ""}</div>`;
        ctx.render();
      });
      ctx.act("finish", () => ctx.complete({ key: "find_file", label: "J'ai retrouvé un fichier dans l'Explorateur", text: "Vous savez retrouver un fichier téléchargé" + (ctx.level !== "beginner" ? ", le renommer" : "") + (ctx.level === "expert" ? " et le ranger" : "") + "." }));
    }
  });

  /* ======================= PIÈCE MANQUANTE ======================= */
  R("missing_piece", {
    steps: 4, theme: "missing_piece",
    render(ctx) {
      const step = ctx.m.step || 0;
      const L = ctx.local;
      const cur = monthAgo(0), old = monthAgo(5);
      const files = ctx.byLevel({
        beginner: [["justificatif_domicile", "Justificatif de domicile"], ["avis_impot", "Avis d'impôt"]],
        intermediate: [["justificatif_domicile", "Justificatif de domicile"], ["facture_telephone", "Facture de téléphone"], ["avis_impot", "Avis d'impôt"]],
        expert: [["justificatif_domicile_" + monthKey(old), "Justificatif de domicile — " + monthLabel(old)], ["justificatif_domicile_" + monthKey(cur), "Justificatif de domicile — " + monthLabel(cur)], ["releve_bancaire", "Relevé bancaire"], ["avis_impot", "Avis d'impôt"]]
      });
      const required = ctx.byLevel({ beginner: "justificatif_domicile", intermediate: "justificatif_domicile", expert: "justificatif_domicile_" + monthKey(cur) });
      const request = ctx.byLevel({
        beginner: "Votre dossier est incomplet. Merci de nous transmettre votre justificatif de domicile (fichier « justificatif_domicile »).",
        intermediate: "Votre dossier est incomplet : il manque une pièce justifiant votre adresse. Merci de la joindre.",
        expert: "Votre dossier est incomplet. Merci de transmettre un justificatif de domicile de moins de 3 mois."
      });

      if (step === 0) {
        L.got ||= {};
        ctx.html(`${ctx.header("Mission", "Compléter un dossier", 0)}
          <div class="mission-step"><h2>1. Préparez vos documents d'exercice</h2>
            <p data-speak>Téléchargez ces documents fictifs : ils iront dans le dossier Téléchargements de l'ordinateur. Vous en aurez besoin juste après.</p>
            <div class="doc-grid">${files.map(([id, lab]) => `<div class="doc-row"><span class="file-icon">PDF</span><div><strong>${esc(lab)}</strong>${L.got[id] ? `<br><small class="ok">✓ téléchargé</small>` : ""}</div><button type="button" class="secondary" data-act="dl" data-id="${id}" data-label="${esc(lab)}">⬇ Télécharger</button></div>`).join("")}</div>
            <h2>2. Envoyez votre dossier</h2>
            ${ctx.help("Une fois les documents téléchargés, cliquez sur « Envoyer mon dossier ». Un message va arriver.")}
            <button class="primary" type="button" data-act="send" ${Object.keys(L.got).length ? "" : "disabled"}>Envoyer mon dossier</button>
          </div>`);
        ctx.act("dl", el => { pdfFor(ctx, el.dataset.id, el.dataset.label); L.got[el.dataset.id] = true; ctx.render(); });
        ctx.act("send", async () => { await ctx.autoMessage("Pièce manquante", request); ctx.go(1); });
        return;
      }
      if (step === 1) {
        const inline = ctx.isBeginner();
        ctx.html(`${ctx.header("Étape 2", "Lire le message reçu", 1)}
          ${inline ? `<div class="message-box"><strong>Service dossiers</strong><p>Bonjour ${esc(ctx.name)},</p><p data-speak>${esc(request)}</p></div>${ctx.help("Retenez bien le nom de la pièce demandée.")}`
          : `<div class="mission-step"><p data-speak>📬 Un nouveau message est arrivé dans votre messagerie. Lisez-le pour savoir ce que demande le service.</p><button type="button" class="secondary" data-act="inbox">Ouvrir ma messagerie</button></div>`}
          <button class="primary" type="button" data-act="next">J'ai lu le message →</button>`);
        ctx.act("inbox", () => AN.student.openMessages(true));
        ctx.act("next", () => ctx.go(2));
        return;
      }
      if (step === 2) {
        ctx.html(`${ctx.header("Étape 3", "Envoyer la pièce manquante", 2)}
          <div class="fake-admin"><div class="training-watermark">⚠ SIMULATION — aucun fichier n'est envoyé sur Internet</div>
          <div class="fake-admin-head">Mon dossier › Pièces justificatives</div>
          <div class="fake-admin-body">
            ${ctx.level !== "beginner" ? `<details class="reminder"><summary>Relire la demande du service</summary><p>${esc(request)}</p></details>` : ""}
            <label for="missionFileInput"><strong>Pièce à joindre</strong></label>
            <p class="tiny">Cliquez sur « Choisir un fichier », allez dans <b>Téléchargements</b> et choisissez la bonne pièce.</p>
            <input id="missionFileInput" type="file" accept=".pdf,.txt" data-change="file">
            <div id="fileCheckMsg" aria-live="polite"></div>
          </div></div>`);
        ctx.change("file", el => {
          const f = el.files?.[0], msg = ctx.box.querySelector("#fileCheckMsg"); if (!f) return;
          const n = f.name.toLowerCase();
          if (!n.includes(required)) {
            const why = ctx.level === "expert" && n.includes("justificatif_domicile")
              ? "C'est bien un justificatif de domicile… mais il date de plus de 3 mois. Regardez le mois dans le nom du fichier."
              : `« ${esc(f.name)} » n'est pas la pièce demandée. Relisez le message puis choisissez un autre fichier.`;
            msg.innerHTML = `<div class="alert bad">${why}</div>`;
            if (!L.got || !Object.keys(L.got).length) msg.innerHTML += `<button type="button" class="ghost-btn" data-act="back0">Je n'ai pas les documents : revenir à l'étape 1</button>`;
            return;
          }
          L.fileName = f.name;
          msg.innerHTML = `<div class="alert good">Bonne pièce : <b>${esc(f.name)}</b>. Cliquez pour l'envoyer.</div><button class="primary" type="button" data-act="sendPiece">Envoyer la pièce</button>`;
          msg.querySelector("button").focus();
        });
        ctx.act("back0", () => ctx.go(0));
        ctx.act("sendPiece", async () => {
          await ctx.autoMessage("Dossier complet", "Merci. Votre justificatif a bien été reçu. Votre dossier est maintenant complet.");
          ctx.complete({ key: "attach", label: "J'ai envoyé une pièce manquante", text: "Le service a reçu la pièce manquante. Votre dossier est complet (un message de confirmation vous attend dans la messagerie)." });
        });
        return;
      }
      ctx.finalScreen({ theme: "missing_piece" });
    }
  });
})(window.AN);

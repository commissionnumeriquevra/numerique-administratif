/* Missions « Bases » : souris, clavier, formulaire au clavier. (reprises de la V7) */
(function (AN) {
  "use strict";
  const { esc } = AN.util;
  const R = AN.missions.register;

  /* ======================= NAVIGATION SOURIS ======================= */
  const fakeSites = {
    impots: { name: "Impôts — simulation", url: "simulation.local/impots", brand: "impots.gouv — EXERCICE", icon: "💶", hint: "Particulier, Professionnel, Documents, Contact…",
      tabs: [
        { id: "accueil", label: "Accueil", title: "Bienvenue sur votre espace fiscal fictif", text: "Cette page d'exercice vous permet de repérer les principales rubriques.", cards: ["Déclarer mes revenus", "Consulter mes documents", "Payer en ligne"] },
        { id: "particulier", label: "Particulier", title: "Espace particulier fictif", text: "Démarches courantes pour un particulier.", cards: ["Déclaration de revenus", "Avis d'impôt", "Prélèvement à la source"] },
        { id: "professionnel", label: "Professionnel", title: "Espace professionnel fictif", text: "Services destinés aux professionnels.", cards: ["TVA", "Impôt sur les sociétés", "Messagerie professionnelle"] },
        { id: "documents", label: "Mes documents", title: "Documents fiscaux fictifs", text: "Repérez les documents disponibles.", cards: ["Avis d'impôt", "Déclaration", "Justificatif de situation"] },
        { id: "contact", label: "Contact", title: "Contacter le service fictif", text: "Choisissez un moyen de contact simulé.", cards: ["Messagerie sécurisée", "Téléphone", "Rendez-vous"] }
      ] },
    ameli: { name: "Ameli — simulation", url: "simulation.local/ameli", brand: "ameli — EXERCICE", icon: "🩺", hint: "Assuré, Professionnel de santé, Entreprise, Annuaire…",
      tabs: [
        { id: "accueil", label: "Accueil", title: "Bienvenue sur l'espace santé fictif", text: "Explorez les grandes rubriques comme sur un site administratif.", cards: ["Mes remboursements", "Mes attestations", "Ma carte Vitale"] },
        { id: "assure", label: "Assuré", title: "Espace assuré fictif", text: "Services courants destinés aux assurés.", cards: ["Remboursements", "Attestation de droits", "Carte européenne"] },
        { id: "professionnel", label: "Professionnel de santé", title: "Espace professionnel fictif", text: "Rubrique destinée aux professionnels de santé.", cards: ["Facturation", "Convention", "Téléservices"] },
        { id: "entreprise", label: "Entreprise", title: "Espace entreprise fictif", text: "Rubrique d'entraînement dédiée aux employeurs.", cards: ["Arrêts de travail", "Cotisations", "Déclarations"] },
        { id: "annuaire", label: "Annuaire santé", title: "Annuaire fictif", text: "Recherchez une catégorie de professionnel.", cards: ["Médecin", "Pharmacie", "Infirmier"] }
      ] },
    msa: { name: "MSA — simulation", url: "simulation.local/msa", brand: "MSA — EXERCICE", icon: "🌾", hint: "Particulier, Exploitant, Employeur, Contact…",
      tabs: [
        { id: "accueil", label: "Accueil", title: "Bienvenue sur le site agricole fictif", text: "Cette simulation sert uniquement à apprendre à naviguer à la souris.", cards: ["Mes services", "Mes paiements", "Mes attestations"] },
        { id: "particulier", label: "Particulier", title: "Espace particulier fictif", text: "Services sociaux et administratifs fictifs.", cards: ["Prestations", "Santé", "Retraite"] },
        { id: "exploitant", label: "Exploitant", title: "Espace exploitant fictif", text: "Rubrique d'exercice destinée aux exploitants agricoles.", cards: ["Cotisations", "Déclarations", "Aides"] },
        { id: "employeur", label: "Employeur", title: "Espace employeur fictif", text: "Rubrique d'exercice destinée aux employeurs.", cards: ["Salariés", "Déclarations sociales", "Paiements"] },
        { id: "contact", label: "Contact", title: "Contacter le service fictif", text: "Choisissez un moyen de contact simulé.", cards: ["Messagerie", "Téléphone", "Rendez-vous"] }
      ] }
  };

  R("mouse_nav", {
    steps: 3, theme: "mouse_nav",
    render(ctx) {
      const step = ctx.m.step || 0;
      const L = ctx.local;
      if (step === 1 && !L.siteId) { ctx.m.step = 0; return this.render(ctx); }
      if (step === 0) {
        ctx.html(`<div class="mouse-mission">${ctx.header("Mission souris", "Explorer des sites administratifs fictifs", 0)}
          <div class="mission-step">
            <h2>Objectif</h2>
            <p data-speak>Entraînez-vous à pointer, cliquer et changer de rubrique. Choisissez un site.</p>
            <div class="mouse-hint">${ctx.byLevel({ beginner: "Vous aurez des indications précises sur les onglets à ouvrir.", intermediate: "Vous devrez retrouver plusieurs rubriques avec moins d'aide.", expert: "Vous devrez explorer librement toutes les rubriques." })}</div>
            <div class="mouse-site-picker">
              ${Object.entries(fakeSites).map(([id, s]) => `<button type="button" class="mouse-site-card" data-act="site" data-site="${id}"><div>${s.icon}</div><strong>${esc(s.name.split(" —")[0])}</strong><span>${esc(s.hint)}</span></button>`).join("")}
            </div>
            <div class="training-watermark">⚠ SIMULATION PÉDAGOGIQUE — aucun vrai site administratif</div>
          </div></div>`);
        ctx.act("site", el => {
          const site = fakeSites[el.dataset.site];
          const all = site.tabs.filter(t => t.id !== "accueil").map(t => t.id);
          Object.assign(L, { siteId: el.dataset.site, active: "accueil", visited: ["accueil"], clicks: 0,
            targets: ctx.byLevel({ beginner: all.slice(0, 2), intermediate: all.slice(0, 3), expert: all }) });
          ctx.go(1);
        });
        return;
      }
      // step 1 : le faux site
      const site = fakeSites[L.siteId];
      const page = site.tabs.find(t => t.id === L.active) || site.tabs[0];
      const labelOf = id => site.tabs.find(t => t.id === id)?.label || id;
      const hint = ctx.byLevel({
        beginner: `Cliquez sur : ${L.targets.map(labelOf).join(" puis ")}.`,
        intermediate: `Retrouvez et ouvrez ${L.targets.length} rubriques différentes.`,
        expert: "Explorez toutes les grandes rubriques du site fictif."
      });
      const complete = L.targets.every(id => L.visited.includes(id));
      ctx.html(`<div class="mouse-mission">${ctx.header("Navigation souris", site.name, 1)}
        <div class="mouse-progress-box">
          <div><strong>Mission :</strong> <span data-speak>${esc(hint)}</span>
            <div class="mouse-target-list">${L.targets.map(id => `<span class="mouse-target ${L.visited.includes(id) ? "done" : ""}">${L.visited.includes(id) ? "✓ " : ""}${esc(ctx.isBeginner() || L.visited.includes(id) ? labelOf(id) : "Rubrique ?")}</span>`).join("")}</div>
          </div>
          <div class="click-counter">Clics : ${L.clicks}</div>
        </div>
        <div class="fake-site">
          <div class="training-watermark">⚠ SITE FICTIF — EXERCICE DE NAVIGATION — aucune donnée réelle</div>
          <div class="fake-site-top"><div class="fake-site-brand">${esc(site.brand)}</div><div class="fake-site-url">${esc(site.url)}</div></div>
          <nav class="fake-site-nav" aria-label="Navigation fictive">
            ${site.tabs.map(t => `<button type="button" class="${t.id === L.active ? "active" : ""} ${ctx.isBeginner() && L.targets.includes(t.id) && !L.visited.includes(t.id) ? "pulse-hint" : ""}" data-act="tab" data-tab="${t.id}">${esc(t.label)}</button>`).join("")}
          </nav>
          <div class="fake-site-body">
            <div class="fake-page-hero"><h2>${esc(page.title)}</h2><p>${esc(page.text)}</p></div>
            <div class="fake-page-grid">${page.cards.map(c => `<div class="fake-action-card"><h4>${esc(c)}</h4><p>Contenu fictif pour s'entraîner.</p><button class="secondary" type="button" data-act="card" data-card="${esc(c)}">Ouvrir</button></div>`).join("")}</div>
            <div id="fakeCardFeedback" aria-live="polite"></div>
          </div>
        </div>
        ${complete ? `<div class="mouse-finish"><strong>Parcours réussi !</strong><br>Vous avez ouvert toutes les rubriques demandées.</div><button class="primary" type="button" data-act="finish">Terminer cette mission →</button>` : ""}
      </div>`);
      ctx.act("tab", el => { L.clicks++; L.active = el.dataset.tab; if (!L.visited.includes(L.active)) L.visited.push(L.active); ctx.render(); });
      ctx.act("card", el => {
        L.clicks++;
        ctx.box.querySelector(".click-counter").textContent = "Clics : " + L.clicks;
        ctx.box.querySelector("#fakeCardFeedback").innerHTML = `<div class="mouse-hint"><strong>${esc(el.dataset.card)}</strong><br>Cette sous-page est fictive. Le clic a bien été pris en compte.</div>`;
      });
      ctx.act("finish", () => ctx.complete({ key: "mouse_nav", label: "J'ai exploré un site administratif à la souris", text: "Vous savez repérer les onglets principaux et changer de page." }));
    }
  });

  /* ======================= TOUCHES DU CLAVIER ======================= */
  R("keyboard_skills", {
    steps: 3, theme: "keyboard",
    render(ctx) {
      const step = ctx.m.step || 0;
      if (step === 0) {
        ctx.html(`<div class="keyboard-mission">${ctx.header("Mission clavier", "Maîtriser les touches essentielles", 0)}
          <div class="keyboard-card"><h2>Votre défi</h2>
            <p data-speak>${ctx.byLevel({ beginner: "Vous allez découvrir les touches essentielles, une par une.", intermediate: "Vous allez enchaîner plusieurs gestes clavier sans reprendre la souris.", expert: "Vous allez réaliser un parcours presque entièrement au clavier." })}</p>
            <div class="key-sequence"><span class="keycap">Tab ↹</span><span class="keycap">Maj ⇧</span><span class="keycap">Entrée ↵</span><span class="keycap">Espace</span><span class="keycap">← ↑ ↓ →</span><span class="keycap">⌫</span><span class="keycap">@</span></div>
            <div class="keyboard-note">Les textes et données de cet exercice sont fictifs.</div>
            <button class="primary" type="button" data-act="start">Commencer</button>
          </div></div>`);
        ctx.act("start", () => ctx.go(1));
        return;
      }
      ctx.html(practiceHTML(ctx));
      setupPractice(ctx);
    }
  });

  function practiceHTML(ctx) {
    const note = ctx.byLevel({
      beginner: `<div class="keyboard-note"><strong>Astuce :</strong> lisez la consigne, puis utilisez la touche indiquée. Prenez votre temps.</div>`,
      intermediate: `<div class="keyboard-note"><strong>Défi intermédiaire :</strong> après le premier clic, essayez de continuer sans souris.</div>`,
      expert: `<div class="keyboard-note"><strong>Défi expert :</strong> utilisez uniquement le clavier jusqu'à la validation.</div>`
    });
    const stepBox = (n, title, body) => `<div class="keyboard-step" id="kstep${n}"><strong>${n}. ${title}</strong><br>${body}</div>`;
    return `<div class="keyboard-mission">${ctx.header("Exercice pratique", "Parcours clavier", 1)}${note}
      <div class="keyboard-meter"><div id="keyboardMeterFill"></div></div>
      <div class="key-live">
        <span class="key-state" id="st_backspace">⌫ Retour arrière</span><span class="key-state" id="st_uppercase">⇧ Majuscule</span>
        <span class="key-state" id="st_at">@</span><span class="key-state" id="st_tab">Tab ↹</span><span class="key-state" id="st_shiftTab">Maj + Tab</span>
        <span class="key-state" id="st_arrow">Flèches</span><span class="key-state" id="st_space">Espace</span><span class="key-state" id="st_enter">Entrée ↵</span>
      </div>
      <div class="keyboard-step-list">
        ${stepBox(1, "Corriger avec Retour arrière", `Tapez <b>Bonjouur</b> (avec une faute), puis corrigez avec <span class="keycap">⌫</span> pour obtenir <b>Bonjour</b>.<div class="keyboard-practice-box"><label class="sr-only" for="kbCorrection">Zone de saisie</label><input id="kbCorrection" class="keyboard-big-input" type="text" autocomplete="off" placeholder="Tapez ici"></div>`)}
        ${stepBox(2, "Écrire une majuscule", `Tapez <b>Paris</b>, avec un P majuscule (Maj ⇧ + p).<div class="keyboard-practice-box"><label class="sr-only" for="kbUppercase">Ville</label><input id="kbUppercase" class="keyboard-big-input" type="text" autocomplete="off" placeholder="Paris"></div>`)}
        ${stepBox(3, "Écrire une adresse e-mail", `Tapez <b>exercice@exemple.fr</b>. ${ctx.isBeginner() ? "Sur un clavier français : <span class='keycap'>Alt Gr</span> + <span class='keycap'>à 0</span> donne @." : ""}<div class="keyboard-practice-box"><label class="sr-only" for="kbEmail">E-mail</label><input id="kbEmail" class="keyboard-big-input" type="text" autocomplete="off" spellcheck="false" placeholder="exercice@exemple.fr"></div>`)}
        ${stepBox(4, "Naviguer avec Tab", `Passez au champ suivant avec <span class="keycap">Tab ↹</span>.<div class="keyboard-practice-box"><input aria-label="Champ 1" class="keyboard-big-input" type="text" value="Champ 1"><input aria-label="Champ 2" class="keyboard-big-input" type="text" value="Champ 2" style="margin-top:10px"></div>`)}
        ${stepBox(5, "Revenir avec Maj + Tab", `Depuis le second champ, revenez au premier avec <span class="keycap">Maj ⇧</span> + <span class="keycap">Tab ↹</span>.<div class="keyboard-practice-box"><input aria-label="Premier" class="keyboard-big-input" type="text" value="Premier"><input aria-label="Second" class="keyboard-big-input" type="text" value="Second" style="margin-top:10px"></div>`)}
        ${stepBox(6, "Utiliser les flèches", `Placez-vous sur la liste et changez de choix avec les flèches.<div class="keyboard-practice-box"><select id="kbSelect" class="keyboard-select" aria-label="Organisme"><option value="">— Choisir —</option><option value="ameli">Ameli</option><option value="impots">Impôts</option><option value="msa">MSA</option></select></div>`)}
        ${stepBox(7, "Cocher avec Espace", `Placez-vous sur la case avec Tab puis appuyez sur <span class="keycap">Espace</span>.<div class="keyboard-practice-box"><label class="keyboard-checkbox"><input id="kbCheckbox" type="checkbox"><span>Je confirme avoir fait l'exercice.</span></label></div>`)}
        ${stepBox(8, "Valider avec Entrée", `Atteignez le bouton avec Tab et activez-le avec <span class="keycap">Entrée ↵</span>.<div class="keyboard-practice-box"><button id="kbEnterButton" class="primary" type="button">Valider au clavier</button></div>`)}
      </div>
      <div id="keyboardPracticeFeedback" aria-live="polite"></div></div>`;
  }

  function setupPractice(ctx) {
    const K = ctx.local.kb = { backspace: false, uppercase: false, at: false, tab: false, shiftTab: false, arrow: false, space: false, enter: false, tabCount: 0, mouse: 0 };
    const keys = ["backspace", "uppercase", "at", "tab", "shiftTab", "arrow", "space", "enter"];
    const $id = id => document.getElementById(id);
    const refresh = () => {
      let done = 0;
      keys.forEach(k => { $id("st_" + k)?.classList.toggle("done", !!K[k]); if (K[k]) done++; });
      $id("keyboardMeterFill").style.width = (done / keys.length) * 100 + "%";
      const rules = [
        K.backspace && $id("kbCorrection").value === "Bonjour",
        K.uppercase && $id("kbUppercase").value === "Paris",
        K.at && $id("kbEmail").value === "exercice@exemple.fr",
        K.tab, K.shiftTab,
        K.arrow && !!$id("kbSelect").value,
        K.space && $id("kbCheckbox").checked,
        K.enter
      ];
      rules.forEach((ok, i) => {
        const el = $id("kstep" + (i + 1));
        el.classList.toggle("done", !!ok);
        el.classList.toggle("current", !ok && rules.slice(0, i).every(Boolean));
      });
    };
    const onMouse = e => { if (ctx.box.contains(e.target)) K.mouse++; };
    document.addEventListener("mousedown", onMouse, true);
    ctx.onCleanup(() => document.removeEventListener("mousedown", onMouse, true));

    ctx.box.querySelectorAll("input,select,button").forEach(el => {
      el.addEventListener("keydown", e => {
        if (e.key === "Tab") { if (e.shiftKey) K.shiftTab = true; else K.tab = true; K.tabCount++; }
        if (e.key === "Backspace" && el.id === "kbCorrection") K.backspace = true;
        if (el.id === "kbUppercase" && e.key.length === 1 && /[A-ZÀÂÄÉÈÊËÎÏÔÖÙÛÜÇ]/.test(e.key) && (e.shiftKey || e.getModifierState?.("CapsLock"))) K.uppercase = true;
        if (e.key === "@") K.at = true;
        if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.key)) K.arrow = true;
        if (e.key === " " && el.id === "kbCheckbox") K.space = true;
        if (e.key === "Enter" && el.id === "kbEnterButton") { K.enter = true; e.preventDefault(); validate(); }
        refresh();
      });
    });
    ["kbCorrection", "kbUppercase", "kbEmail"].forEach(id => $id(id).addEventListener("input", () => { if (id === "kbEmail" && $id(id).value.includes("@")) K.at = true; refresh(); }));
    $id("kbSelect").addEventListener("change", refresh);
    $id("kbCheckbox").addEventListener("change", refresh);
    $id("kbEnterButton").addEventListener("click", e => {
      if (e.detail === 0) { K.enter = true; refresh(); validate(); }
      else $id("keyboardPracticeFeedback").innerHTML = `<div class="keyboard-error">Essayez d'activer ce bouton avec la touche <strong>Entrée</strong>, pas avec la souris.</div>`;
    });

    function validate() {
      const fb = $id("keyboardPracticeFeedback");
      const missing = [];
      if (!(K.backspace && $id("kbCorrection").value === "Bonjour")) missing.push("Retour arrière (Bonjour)");
      if (!(K.uppercase && $id("kbUppercase").value === "Paris")) missing.push("Majuscule (Paris)");
      if (!(K.at && $id("kbEmail").value === "exercice@exemple.fr")) missing.push("@ (adresse e-mail)");
      if (!K.tab) missing.push("Tab");
      if (ctx.level !== "beginner" && !K.shiftTab) missing.push("Maj + Tab");
      if (!(K.arrow && $id("kbSelect").value)) missing.push("Flèches");
      if (!(K.space && $id("kbCheckbox").checked)) missing.push("Espace");
      if (missing.length) { fb.innerHTML = `<div class="keyboard-error"><strong>Il reste quelques gestes à faire :</strong> ${missing.join(", ")}.</div>`; return; }
      const minTabs = ctx.byLevel({ beginner: 3, intermediate: 5, expert: 7 });
      if (K.tabCount < minTabs) { fb.innerHTML = `<div class="keyboard-error">Vous avez utilisé Tab ${K.tabCount} fois. Pour ce niveau, essayez d'atteindre au moins ${minTabs} déplacements.</div>`; return; }
      const mouseNote = ctx.level === "expert" && K.mouse > 2 ? `<br><small>Défi expert : vous avez repris la souris ${K.mouse} fois. Vous pourrez refaire la mission en restant au clavier.</small>` : "";
      fb.innerHTML = `<div class="keyboard-success"><strong>Parcours clavier réussi !</strong><br>${K.tabCount} déplacements avec Tab détectés.${mouseNote}</div><button class="primary" type="button" data-act="finish">Terminer la mission →</button>`;
      fb.querySelector("button").focus();
    }
    ctx.act("finish", () => ctx.complete({ key: "keyboard", label: "J'ai utilisé les touches essentielles du clavier", text: "Vous avez utilisé plusieurs touches sans dépendre uniquement de la souris." }));
    setTimeout(() => $id("kbCorrection")?.focus(), 120);
    refresh();
  }

  /* ======================= FORMULAIRE AU CLAVIER ======================= */
  R("fill_form", {
    steps: 3, theme: "form",
    render(ctx) {
      const step = ctx.m.step || 0;
      if (step === 0) {
        ctx.html(`${ctx.header("Mission clavier", "Remplir un formulaire avec la touche Tab", 0)}
          <div class="mission-step"><h2>Objectif</h2><p data-speak>Vous allez remplir un formulaire fictif en utilisant le clavier.</p>
            ${ctx.isBeginner() ? `<div class="tab-instruction"><span class="tab-key">Tab ↹</span><div><strong>La règle de l'exercice</strong><br>Après avoir rempli une case, appuyez sur <b>Tab</b> pour passer à la suivante.</div></div>` : ""}
            <button class="primary" type="button" data-act="start">Commencer l'exercice</button></div>`);
        ctx.act("start", () => ctx.go(1));
        return;
      }
      const field = (id, label, input) => `<div class="training-field"><label for="${id}">${label}</label>${input}</div>`;
      ctx.html(`${ctx.header("Exercice formulaire", "Mes informations fictives", 1)}
        ${ctx.byLevel({
          beginner: `<div class="tab-instruction"><span class="tab-key">Tab ↹</span><div><strong>Après chaque champ</strong><br>Appuyez sur Tab pour avancer. Essayez de ne pas reprendre la souris.</div></div>`,
          intermediate: `<div class="keyboard-only-reminder"><strong>Défi :</strong> remplissez le formulaire uniquement au clavier après avoir cliqué dans le premier champ.</div>`,
          expert: `<div class="keyboard-only-reminder"><strong>Défi expert :</strong> utilisez Tab, Maj + Tab, Espace et les flèches. Ne reprenez pas la souris.</div>`
        })}
        <div class="tab-status"><div class="tab-counter">Tabulations : <span id="tabCount">0</span></div><div class="focus-name">Champ actuel : <strong id="currentFocusName">Prénom</strong></div></div>
        <form id="tabTrainingForm" class="tab-form" onsubmit="return false;" novalidate>
          <div class="form-row">${field("tabFirstName", "Prénom fictif *", `<input id="tabFirstName" data-label="Prénom" type="text" autocomplete="off" placeholder="Marie">`)}${field("tabLastName", "Nom fictif *", `<input id="tabLastName" data-label="Nom" type="text" autocomplete="off" placeholder="Martin">`)}</div>
          ${field("tabEmail", "Adresse e-mail fictive *", `<input id="tabEmail" data-label="Adresse e-mail" type="text" autocomplete="off" spellcheck="false" placeholder="exercice@exemple.fr">`)}
          <div class="form-row">${field("tabPhone", "Téléphone fictif", `<input id="tabPhone" data-label="Téléphone" type="tel" autocomplete="off" placeholder="06 00 00 00 00">`)}${field("tabBirthDate", "Date de naissance fictive *", `<input id="tabBirthDate" data-label="Date de naissance" type="date">`)}</div>
          ${field("tabSituation", "Situation *", `<select id="tabSituation" data-label="Situation"><option value="">— Choisir —</option><option>Retraité(e)</option><option>Salarié(e)</option><option>Sans activité</option><option>Autre</option></select>`)}
          <div class="form-row">${field("tabPostal", "Code postal fictif *", `<input id="tabPostal" data-label="Code postal" inputmode="numeric" maxlength="5" placeholder="26000">`)}${field("tabCity", "Ville fictive *", `<input id="tabCity" data-label="Ville" type="text" autocomplete="off" placeholder="Valence">`)}</div>
          ${field("tabMessage", "Message fictif", `<textarea id="tabMessage" data-label="Message" rows="3" placeholder="Je souhaite transmettre mon dossier."></textarea>`)}
          <label class="checkbox-line"><input id="tabConfirm" data-label="Case de confirmation" type="checkbox"><span>Je confirme avoir relu les informations.</span></label>
          <button id="tabSubmitButton" data-label="Bouton Valider" class="primary" type="button" data-act="validate">Valider le formulaire</button>
          <div id="tabFormFeedback" aria-live="polite"></div>
        </form>`);
      let count = 0;
      const form = ctx.box.querySelector("#tabTrainingForm");
      form.querySelectorAll("input,select,textarea,button").forEach(el => {
        el.addEventListener("focus", () => { ctx.box.querySelector("#currentFocusName").textContent = el.dataset.label || el.id; });
        el.addEventListener("keydown", e => {
          if (e.key !== "Tab") return;
          count++;
          ctx.box.querySelector("#tabCount").textContent = String(count);
          el.closest(".training-field")?.classList.add("done");
        });
      });
      setTimeout(() => ctx.box.querySelector("#tabFirstName")?.focus(), 100);
      const v = id => ctx.box.querySelector("#" + id);
      ctx.act("validate", () => {
        const fb = v("tabFormFeedback");
        const missing = [];
        [["tabFirstName", "prénom"], ["tabLastName", "nom"], ["tabEmail", "adresse e-mail"], ["tabBirthDate", "date de naissance"], ["tabSituation", "situation"], ["tabPostal", "code postal"], ["tabCity", "ville"]]
          .forEach(([id, name]) => { if (!v(id).value.trim()) missing.push(name); });
        if (!v("tabConfirm").checked) missing.push("case de confirmation");
        if (missing.length) { fb.innerHTML = `<div class="alert warn"><strong>Il manque encore :</strong> ${missing.join(", ")}.</div>`; return; }
        if (v("tabEmail").value.trim() !== "exercice@exemple.fr") { fb.innerHTML = `<div class="alert warn">Pour cet exercice, utilisez l'adresse fictive <strong>exercice@exemple.fr</strong>.</div>`; return; }
        if (!/^\d{5}$/.test(v("tabPostal").value.trim())) { fb.innerHTML = `<div class="alert warn">Le code postal doit contenir 5 chiffres.</div>`; return; }
        const required = ctx.byLevel({ beginner: 5, intermediate: 7, expert: 9 });
        if (count < required) { fb.innerHTML = `<div class="alert warn"><strong>Le formulaire est rempli, mais vous avez peu utilisé la touche Tab.</strong><br>Tabulations détectées : ${count}. Pour ce niveau, essayez d'en faire au moins ${required}.<br>Revenez au premier champ et avancez avec Tab.</div>`; return; }
        fb.innerHTML = `<div class="tab-success"><strong>Bravo !</strong><br>Formulaire rempli et ${count} déplacements avec Tab détectés.</div><button class="primary" type="button" data-act="finish">Terminer l'exercice →</button>`;
        fb.querySelector("button").focus();
      });
      ctx.act("finish", () => ctx.complete({ key: "tab_form", label: "J'ai rempli un formulaire avec la touche Tab", text: "Vous avez rempli un formulaire en vous déplaçant au clavier." }));
    }
  });
})(window.AN);

/* Missions « Démarches » : rendez-vous en ligne, mot de passe oublié, mission personnalisée. */
(function (AN) {
  "use strict";
  const { esc, shuffle } = AN.util;
  const R = AN.missions.register;
  const DAYS = ["dim.", "lun.", "mar.", "mer.", "jeu.", "ven.", "sam."];
  const DAYS_LONG = ["dimanche", "lundi", "mardi", "mercredi", "jeudi", "vendredi", "samedi"];

  /* ======================= RENDEZ-VOUS EN LIGNE ======================= */
  function seeded(seed) { let s = 0; for (const c of seed) s = (s * 31 + c.charCodeAt(0)) >>> 0; return () => ((s = (s * 1103515245 + 12345) >>> 0) / 4294967296); }
  function buildCalendar(seedStr) {
    const rnd = seeded(seedStr);
    const start = new Date(); start.setHours(0, 0, 0, 0);
    start.setDate(start.getDate() + ((8 - start.getDay()) % 7 || 7)); // lundi prochain
    const SLOTS = ["09:00", "09:30", "10:30", "11:00", "14:00", "14:30", "15:30", "16:00", "16:30"];
    const weeks = [0, 1].map(w => [0, 1, 2, 3, 4].map(d => {
      const date = new Date(start); date.setDate(start.getDate() + w * 7 + d);
      const full = (w === 0 && d === 0) || (rnd() < 0.18 && !(w === 0 && (d === 1 || d === 3)));
      const slots = full ? [] : SLOTS.filter(() => rnd() > 0.45);
      if (!full && !slots.some(s => s >= "14:00")) slots.push("14:30");
      if (!full && !slots.some(s => s >= "15:00")) slots.push("16:00");
      if (!full && !slots.some(s => s < "12:00")) slots.unshift("09:30");
      return { date: date.getTime(), slots: [...new Set(slots)].sort() };
    }));
    return weeks;
  }
  R("appointment", {
    steps: 3, theme: "appointment",
    render(ctx) {
      const step = ctx.m.step || 0;
      const L = ctx.local;
      L.cal ||= buildCalendar(ctx.m.id);
      L.week ??= 0;
      const fmtDay = t => { const d = new Date(t); return `${DAYS_LONG[d.getDay()]} ${d.getDate()} ${AN.util.MONTHS_FR[d.getMonth()]}`; };
      const motifs = ["Renouvellement de carte d'identité", "Dépôt de dossier de retraite", "Demande de logement social", "Information sur les aides"];
      const firstFree = L.cal[0].find(d => d.slots.length);
      const rule = ctx.byLevel({
        beginner: { motif: motifs[0], text: `Prenez rendez-vous pour « ${motifs[0]} », le <b>premier jour disponible</b>, à l'heure de votre choix.`, check: (d, s) => d.date === firstFree.date || `Ce n'est pas le premier jour disponible. Le premier jour où des horaires sont proposés est le ${fmtDay(firstFree.date)}.` },
        intermediate: { motif: motifs[1], text: `Prenez rendez-vous pour « ${motifs[1]} », un <b>mardi ou un jeudi</b>, <b>l'après-midi</b> (à partir de 14 h).`, check: (d, s) => { const wd = new Date(d.date).getDay(); if (wd !== 2 && wd !== 4) return "Le jour choisi n'est ni un mardi ni un jeudi."; if (s < "14:00") return "Ce créneau est le matin. Il faut l'après-midi (à partir de 14 h)."; return true; } },
        expert: { motif: motifs[2], text: `Prenez rendez-vous pour « ${motifs[2]} » <b>la semaine suivante</b> (pas la première semaine affichée), <b>après 15 h</b>. Notez la référence : on vous la demandera.`, check: (d, s) => { if (!L.cal[1].some(x => x.date === d.date)) return "Ce jour est dans la première semaine. Utilisez la flèche « Semaine suivante → »."; if (s <= "15:00") return "Le créneau doit être après 15 h."; return true; } }
      });

      if (step === 0) {
        ctx.html(`${ctx.header("Mission démarche", "Prendre un rendez-vous en ligne", 0)}
          <div class="mission-step"><h2>Votre consigne</h2><p class="consigne" data-speak>${rule.text}</p>
          ${ctx.help("Les jours grisés n'ont plus de place. Cliquez sur un jour, puis sur une heure.")}
          <button class="primary" type="button" data-act="start">Ouvrir le site de rendez-vous</button></div>`);
        ctx.act("start", () => ctx.go(1));
        return;
      }
      if (step === 1) {
        const week = L.cal[L.week];
        const day = L.day != null ? week.find(d => d.date === L.day) : null;
        const ready = L.motif && L.day && L.slot;
        ctx.html(`${ctx.header("Mission démarche", "Prendre un rendez-vous", 1)}
          <details class="reminder" ${ctx.isBeginner() ? "open" : ""}><summary>Revoir la consigne</summary><p>${rule.text}</p></details>
          <div class="fake-site rdv">
            <div class="training-watermark">⚠ SITE FICTIF — EXERCICE — aucun rendez-vous réel</div>
            <div class="fake-site-top"><div class="fake-site-brand">🏛 Mairie d'Exempleville — Rendez-vous</div><div class="fake-site-url">simulation.local/rdv</div></div>
            <div class="fake-site-body">
              <h3>1. Motif du rendez-vous</h3>
              <select id="rdvMotif" data-change="motif" aria-label="Motif"><option value="">— Choisir un motif —</option>${motifs.map(m => `<option ${L.motif === m ? "selected" : ""}>${esc(m)}</option>`).join("")}</select>
              <h3>2. Choisissez un jour</h3>
              <div class="cal-nav"><button type="button" data-act="week" data-d="-1" ${L.week === 0 ? "disabled" : ""}>← Semaine précédente</button><strong>Semaine du ${fmtDay(week[0].date)}</strong><button type="button" data-act="week" data-d="1" ${L.week === 1 ? "disabled" : ""}>Semaine suivante →</button></div>
              <div class="cal-grid">${week.map(d => { const dt = new Date(d.date); return `<button type="button" class="cal-day ${d.slots.length ? "" : "full"} ${L.day === d.date ? "on" : ""}" data-act="day" data-t="${d.date}" ${d.slots.length ? "" : "disabled"} aria-label="${fmtDay(d.date)}${d.slots.length ? "" : ", complet"}"><span>${DAYS[dt.getDay()]}</span><b>${dt.getDate()}</b><small>${d.slots.length ? d.slots.length + " créneaux" : "complet"}</small></button>`; }).join("")}</div>
              ${day ? `<h3>3. Choisissez une heure — ${fmtDay(day.date)}</h3><div class="slot-grid">${day.slots.map(s => `<button type="button" class="slot ${L.slot === s ? "on" : ""}" data-act="slot" data-s="${s}">${s.replace(":", " h ")}</button>`).join("")}</div>` : ""}
              ${ready ? `<h3>4. Vos coordonnées (fictives)</h3>
                <div class="form-row"><div><label for="rdvName">Nom</label><input id="rdvName" value="${esc(L.nameVal || "")}" placeholder="Martin" autocomplete="off"></div><div><label for="rdvMail">E-mail</label><input id="rdvMail" value="${esc(L.mailVal || "")}" placeholder="exercice@exemple.fr" autocomplete="off"></div></div>
                <div class="recap">Récapitulatif : <b>${esc(L.motif)}</b> — <b>${fmtDay(L.day)}</b> à <b>${L.slot.replace(":", " h ")}</b></div>
                <button type="button" class="primary" data-act="confirm">Confirmer le rendez-vous</button>` : ""}
              <div id="rdvFb" aria-live="polite"></div>
            </div>
          </div>`);
        ctx.change("motif", el => { L.motif = el.value; ctx.render(); });
        ctx.act("week", el => { L.week = Math.max(0, Math.min(1, L.week + Number(el.dataset.d))); L.day = null; L.slot = null; ctx.render(); });
        ctx.act("day", el => { L.day = Number(el.dataset.t); L.slot = null; ctx.render(); });
        ctx.act("slot", el => { L.slot = el.dataset.s; ctx.render(); ctx.box.querySelector("#rdvName")?.focus(); });
        ctx.act("confirm", () => {
          const fb = ctx.box.querySelector("#rdvFb");
          L.nameVal = ctx.box.querySelector("#rdvName").value.trim(); L.mailVal = ctx.box.querySelector("#rdvMail").value.trim();
          if (L.motif !== rule.motif) { fb.innerHTML = `<div class="alert bad">Le motif choisi n'est pas celui de la consigne.</div>`; return; }
          const d = week.find(x => x.date === L.day);
          const ok = rule.check(d, L.slot);
          if (ok !== true) { fb.innerHTML = `<div class="alert bad">${ok}</div>`; return; }
          if (!L.nameVal) { fb.innerHTML = `<div class="alert warn">Indiquez un nom (fictif).</div>`; return; }
          if (L.mailVal !== "exercice@exemple.fr") { fb.innerHTML = `<div class="alert warn">Utilisez l'adresse fictive <b>exercice@exemple.fr</b>.</div>`; return; }
          L.ref = "RDV-" + Math.random().toString(36).slice(2, 6).toUpperCase() + "-" + String(Math.floor(Math.random() * 90) + 10);
          ctx.autoMessage("Confirmation de rendez-vous", `Votre rendez-vous « ${L.motif} » est confirmé le ${fmtDay(L.day)} à ${L.slot.replace(":", " h ")}. Référence : ${L.ref}. Pensez à apporter les pièces demandées.`);
          ctx.go(2);
        });
        return;
      }
      if (step === 2) {
        const expert = ctx.level === "expert";
        ctx.html(`${ctx.header("Mission démarche", "Rendez-vous confirmé", 2)}
          <div class="fake-site rdv"><div class="training-watermark">⚠ SITE FICTIF — EXERCICE</div><div class="fake-site-body">
            <div class="confirm-box">✅ <b>Votre rendez-vous est confirmé.</b><br>${esc(L.motif || "")}<br>${L.day ? fmtDay(L.day) : ""} à ${(L.slot || "").replace(":", " h ")}<br>${expert ? "" : `Référence : <b class="mono">${esc(L.ref || "")}</b>`}</div>
            ${expert ? `<p>La référence de votre rendez-vous vous a été envoyée dans votre messagerie.</p>` : ""}
          </div></div>
          ${expert ? `<div class="mission-step"><label for="refCheck"><strong>Au guichet, on vous demande votre référence. Laquelle est-ce ?</strong></label><p class="tiny">Allez la lire dans votre messagerie, puis revenez ici.</p><input id="refCheck" autocomplete="off" placeholder="RDV-XXXX-00"><button type="button" class="secondary" data-act="inbox">Ouvrir ma messagerie</button> <button type="button" class="primary" data-act="checkRef">Valider</button><div id="refFb" aria-live="polite"></div></div>`
          : `<button type="button" class="primary" data-act="done">Terminer →</button>`}`);
        ctx.act("inbox", () => AN.student.openMessages(true));
        ctx.act("done", () => ctx.complete({ key: "appointment", label: "J'ai pris un rendez-vous en ligne", text: "Rendez-vous pris (fictif). La confirmation est dans votre messagerie." }));
        ctx.act("checkRef", () => {
          const v = ctx.box.querySelector("#refCheck").value.trim().toUpperCase();
          const ok = L.ref ? v === L.ref : /^RDV-[A-Z0-9]{4}-\d{2}$/.test(v);
          if (!ok) { ctx.box.querySelector("#refFb").innerHTML = `<div class="alert bad">Ce n'est pas la bonne référence. Relisez le message « Confirmation de rendez-vous ».</div>`; return; }
          ctx.complete({ key: "appointment", label: "J'ai pris un rendez-vous en ligne", text: "Rendez-vous pris et référence retrouvée : vous êtes prêt pour le guichet !" });
        });
        return;
      }
      ctx.finalScreen({ theme: "appointment" });
    }
  });

  /* ======================= MOT DE PASSE OUBLIÉ ======================= */
  function pwRules(level, name) {
    const base = [
      { id: "len", label: level === "expert" ? "Au moins 14 caractères" : "Au moins 12 caractères", test: p => p.length >= (level === "expert" ? 14 : 12) }
    ];
    if (level === "beginner") base.push({ id: "digit", label: "Au moins un chiffre", test: p => /\d/.test(p) });
    else base.push(
      { id: "upper", label: "Une majuscule", test: p => /[A-ZÀ-Ý]/.test(p) },
      { id: "lower", label: "Une minuscule", test: p => /[a-zß-ÿ]/.test(p) },
      { id: "digit", label: "Un chiffre", test: p => /\d/.test(p) },
      { id: "special", label: "Un caractère spécial ( ! ? - _ * … )", test: p => /[^A-Za-zÀ-ÿ0-9]/.test(p) }
    );
    if (level === "expert") {
      const n = AN.util.safeName(name);
      base.push({ id: "common", label: "Ne contient ni votre prénom, ni 123, azerty ou motdepasse", test: p => { const l = p.toLowerCase(); return !(n.length > 2 && l.includes(n)) && !/123|azerty|motdepasse|password/.test(l); } });
    }
    return base;
  }
  R("password_reset", {
    steps: 4, theme: "password",
    render(ctx) {
      const step = ctx.m.step || 0;
      const L = ctx.local;
      const site = (inner) => `<div class="fake-site login-site"><div class="training-watermark">⚠ SITE FICTIF — n'utilisez aucun vrai mot de passe</div><div class="fake-site-top"><div class="fake-site-brand">🔐 Mon Compte Exemple</div><div class="fake-site-url">https://compte.service-exemple.fr</div></div><div class="fake-site-body">${inner}</div></div>`;
      if (step === 0) {
        ctx.html(`${ctx.header("Mission démarche", "J'ai oublié mon mot de passe", 0)}
          <p class="consigne" data-speak>Vous voulez vous connecter à votre compte, mais vous avez oublié votre mot de passe. Trouvez comment en créer un nouveau.</p>
          ${site(L.forgot ? `
            <h3>Mot de passe oublié</h3><p>Saisissez l'adresse e-mail de votre compte. Nous vous enverrons un lien.</p>
            <label for="fpMail">Adresse e-mail</label><input id="fpMail" placeholder="exercice@exemple.fr" autocomplete="off">
            <button type="button" class="primary" data-act="sendLink">Recevoir le lien</button>
            <div id="pwFb" aria-live="polite"></div>` : `
            <h3>Connexion</h3>
            <label for="lgId">Identifiant (adresse e-mail)</label><input id="lgId" autocomplete="off" value="exercice@exemple.fr">
            <label for="lgPw">Mot de passe</label><input id="lgPw" type="password" autocomplete="off">
            <button type="button" class="primary" data-act="login">Se connecter</button>
            <p><a href="#" class="${ctx.isBeginner() ? "pulse-hint" : ""}" data-act="forgot">Mot de passe oublié ?</a></p>
            <div id="pwFb" aria-live="polite"></div>`)}
          ${ctx.help("Le lien « Mot de passe oublié ? » se trouve juste sous le bouton de connexion.")}`);
        ctx.act("login", () => { ctx.box.querySelector("#pwFb").innerHTML = `<div class="alert bad">Identifiant ou mot de passe incorrect. ${ctx.isBeginner() ? "Cherchez le lien « Mot de passe oublié ? »." : ""}</div>`; });
        ctx.act("forgot", (el, e) => { e.preventDefault(); L.forgot = true; ctx.render(); ctx.box.querySelector("#fpMail")?.focus(); });
        ctx.act("sendLink", () => {
          if (ctx.box.querySelector("#fpMail").value.trim() !== "exercice@exemple.fr") { ctx.box.querySelector("#pwFb").innerHTML = `<div class="alert warn">Utilisez l'adresse de l'exercice : <b>exercice@exemple.fr</b>.</div>`; return; }
          ctx.go(1);
        });
        return;
      }
      if (step === 1) {
        const mails = ctx.byLevel({
          beginner: [["reset", "Mon Compte Exemple", "Réinitialisation de votre mot de passe", "à l'instant"], ["news", "Médiathèque", "Programme des ateliers du mois", "hier"]],
          intermediate: [["news", "Médiathèque", "Programme des ateliers du mois", "hier"], ["reset", "Mon Compte Exemple", "Réinitialisation de votre mot de passe", "à l'instant"], ["promo", "Super Promo", "-70 % sur tout le site !!!", "08:12"]],
          expert: [["phish", "Securite Compte", "Votre mot de passe expire, confirmez-le immédiatement", "à l'instant"], ["reset", "Mon Compte Exemple", "Réinitialisation de votre mot de passe", "il y a 1 min"], ["news", "Médiathèque", "Programme des ateliers du mois", "hier"]]
        });
        const body = {
          reset: `<p><b>De :</b> no-reply@service-exemple.fr</p><p>Bonjour,</p><p>Vous avez demandé à réinitialiser votre mot de passe. Ce lien est valable 30 minutes.</p><p><button type="button" class="primary" data-act="openReset">Choisir un nouveau mot de passe</button></p><p class="muted">Si vous n'êtes pas à l'origine de cette demande, ignorez ce message.</p>`,
          news: `<p>Ateliers numériques du mois : mardi 10 h, jeudi 14 h… (exercice)</p>`,
          promo: `<p>Profitez de nos offres incroyables ! (publicité fictive)</p>`,
          phish: `<p><b>De :</b> securite.compte@verif-mdp-alert.com</p><p>Cher utilisateur, votre mot de passe expire dans 1 heure. Saisissez votre mot de passe actuel pour le conserver.</p><p><button type="button" class="secondary" data-act="phish">Conserver mon mot de passe</button></p>`
        };
        ctx.html(`${ctx.header("Mission démarche", "Ma boîte e-mail", 1)}
          <p class="consigne" data-speak>Le site vous a envoyé un e-mail. Ouvrez-le et suivez le lien.</p>
          <div class="webmail"><div class="training-watermark">⚠ MESSAGERIE FICTIVE — EXERCICE</div>
            <div class="webmail-body"><div class="webmail-list">${mails.map(([id, from, subj, when]) => `<button type="button" class="webmail-item ${L.openMail === id ? "on" : ""} ${ctx.isBeginner() && id === "reset" ? "pulse-hint" : ""}" data-act="mail" data-id="${id}"><b>${esc(from)}</b><span>${esc(subj)}</span><small>${esc(when)}</small></button>`).join("")}</div>
            <div class="webmail-read">${L.openMail ? body[L.openMail] : `<p class="muted">Sélectionnez un message.</p>`}<div id="pwFb" aria-live="polite"></div></div></div></div>`);
        ctx.act("mail", el => { L.openMail = el.dataset.id; ctx.render(); });
        ctx.act("phish", () => { ctx.box.querySelector("#pwFb").innerHTML = `<div class="alert bad">Piège ! Cet e-mail vient d'une adresse inconnue et demande votre mot de passe actuel : c'est de l'hameçonnage. Le vrai lien est dans le message « Réinitialisation » que VOUS avez demandé.</div>`; });
        ctx.act("openReset", () => ctx.go(2));
        return;
      }
      if (step === 2) {
        const rules = pwRules(ctx.level, ctx.name);
        ctx.html(`${ctx.header("Mission démarche", "Choisir un nouveau mot de passe", 2)}
          <div class="alert warn" data-speak>⚠ Inventez un mot de passe <b>pour l'exercice</b>. N'utilisez pas un mot de passe que vous avez vraiment. Il n'est enregistré nulle part.</div>
          ${site(`<h3>Nouveau mot de passe</h3>
            ${ctx.level !== "intermediate" ? `<p class="tiny">${ctx.level === "beginner" ? "Astuce : une petite phrase avec un chiffre, par exemple « MonChatAimeLeSoleil7 »." : "Astuce : une phrase de passe de plusieurs mots séparés par des tirets, avec un chiffre et une majuscule."}</p>` : ""}
            <label for="pw1">Nouveau mot de passe</label>
            <div class="pw-wrap"><input id="pw1" type="password" autocomplete="new-password" data-input="pw"><button type="button" class="ghost-btn" data-act="eye" aria-label="Afficher ou masquer le mot de passe">👁 Afficher</button></div>
            <ul class="pw-rules">${rules.map(r => `<li data-rule="${r.id}">${esc(r.label)}</li>`).join("")}</ul>
            <div class="pw-meter"><div id="pwMeter"></div></div>
            <label for="pw2">Confirmez le mot de passe</label><input id="pw2" type="password" autocomplete="new-password">
            <button type="button" class="primary" data-act="save">Enregistrer</button>
            <div id="pwFb" aria-live="polite"></div>`)}`);
        const check = () => {
          const p = ctx.box.querySelector("#pw1").value;
          let ok = 0;
          rules.forEach(r => { const pass = r.test(p); if (pass) ok++; ctx.box.querySelector(`[data-rule="${r.id}"]`).classList.toggle("ok", pass); });
          const m = ctx.box.querySelector("#pwMeter");
          m.style.width = (ok / rules.length) * 100 + "%";
          m.className = ok === rules.length ? "strong" : ok >= rules.length / 2 ? "medium" : "weak";
          return ok === rules.length;
        };
        ctx.input("pw", check);
        ctx.act("eye", el => { const i = ctx.box.querySelector("#pw1"); i.type = i.type === "password" ? "text" : "password"; el.textContent = i.type === "password" ? "👁 Afficher" : "🙈 Masquer"; });
        ctx.act("save", () => {
          const fb = ctx.box.querySelector("#pwFb");
          if (!check()) { fb.innerHTML = `<div class="alert warn">Le mot de passe ne respecte pas encore toutes les règles (les règles validées passent en vert).</div>`; return; }
          if (ctx.box.querySelector("#pw2").value !== ctx.box.querySelector("#pw1").value) { fb.innerHTML = `<div class="alert bad">Les deux mots de passe ne sont pas identiques. Retapez la confirmation.</div>`; return; }
          L.pw = ctx.box.querySelector("#pw1").value; // reste en mémoire le temps de la mission, jamais enregistré
          ctx.go(3);
        });
        return;
      }
      if (step === 3) {
        if (!L.pw) return ctx.go(2);
        ctx.html(`${ctx.header("Mission démarche", "Se reconnecter", 3)}
          <p class="consigne" data-speak>Votre mot de passe est changé. Connectez-vous avec votre <b>nouveau</b> mot de passe pour vérifier que vous le connaissez.</p>
          ${site(`<div class="alert good">Mot de passe modifié avec succès.</div><h3>Connexion</h3>
            <label for="lgId2">Identifiant</label><input id="lgId2" value="exercice@exemple.fr" autocomplete="off">
            <label for="lgPw2">Mot de passe</label><input id="lgPw2" type="password" autocomplete="off">
            <button type="button" class="primary" data-act="login2">Se connecter</button><div id="pwFb" aria-live="polite"></div>`)}`);
        setTimeout(() => ctx.box.querySelector("#lgPw2")?.focus(), 80);
        ctx.act("login2", () => {
          if (ctx.box.querySelector("#lgPw2").value !== L.pw) { ctx.box.querySelector("#pwFb").innerHTML = `<div class="alert bad">Mot de passe incorrect. Attention aux majuscules et aux chiffres.</div>`; return; }
          L.pw = null;
          ctx.complete({ key: "password", label: "J'ai réinitialisé un mot de passe", text: "Vous savez utiliser « Mot de passe oublié ? » et choisir un mot de passe solide." });
        });
        return;
      }
      ctx.finalScreen({ theme: "password" });
    }
  });

  /* ======================= MISSION PERSONNALISÉE ======================= */
  R("custom", {
    steps: 2, theme: null,
    render(ctx) {
      const c = ctx.m.custom || {};
      const step = ctx.m.step || 0;
      if (step === 0) {
        ctx.html(`${ctx.header("Mission du formateur", c.title || "Mission personnalisée", 0)}
          <div class="mission-step"><h2>Consigne</h2><div class="custom-instructions" data-speak>${esc(c.instructions || "").replace(/\n/g, "<br>")}</div>
          ${c.link ? `<p><a href="${esc(c.link)}" target="_blank" rel="noopener noreferrer">Ouvrir le lien de l'exercice ↗</a></p>` : ""}
          <button type="button" class="primary" data-act="start">${c.message?.text ? "Commencer" : "J'ai terminé la consigne ✓"}</button></div>`);
        ctx.act("start", async () => {
          if (c.message?.text) { await ctx.autoMessage(c.message.subject || "Message", c.message.text); ctx.go(1); }
          else finish();
        });
        return;
      }
      ctx.html(`${ctx.header("Mission du formateur", c.title || "Mission personnalisée", 1)}
        <div class="mission-step"><p data-speak>📬 Un message vient d'arriver dans votre messagerie. Lisez-le et suivez ses indications.</p>
        <button type="button" class="secondary" data-act="inbox">Ouvrir ma messagerie</button>
        <button type="button" class="primary" data-act="done">J'ai terminé ✓</button></div>`);
      ctx.act("inbox", () => AN.student.openMessages(true));
      ctx.act("done", finish);
      function finish() { ctx.complete({ key: "custom_" + (c.templateId || ctx.m.id).slice(0, 20), label: c.title || "Mission personnalisée réussie", text: "Mission terminée. Bravo pour votre persévérance !" }); }
    }
  });
})(window.AN);

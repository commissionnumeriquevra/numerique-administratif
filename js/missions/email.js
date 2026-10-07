/* =========================================================
   Chapitre E-mail : 6 exercices progressifs (+ « E-mail suspect » existant).
   Principe pédagogique : on peut toujours continuer après une erreur,
   chaque erreur est expliquée, et chaque niveau se termine par une note /20.
   ========================================================= */
(function (AN) {
  "use strict";
  const { esc, shuffle } = AN.util;
  const R = AN.missions.register;
  const MAIL = () => AN.mail;

  /* ---------- outils communs ---------- */
  const slug = s => String(s || "").normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, ".").replace(/^\.|\.$/g, "");
  const meOf = ctx => ({ name: ctx.name, email: `${slug(ctx.name) || "moi"}@exemple.fr` });
  const MONTHS = ["janvier", "fevrier", "mars", "avril", "mai", "juin", "juillet", "aout", "septembre", "octobre", "novembre", "decembre"];
  const GREET = /\b(bonjour|bonsoir|madame|monsieur|cher|chère|salut|coucou)\b/i;
  const CLOSE = /(cordialement|bonne (journée|soirée|fin de journée)|merci|à bientôt|a bientot|bien à vous|salutations|bises|amitiés|je vous remercie)/i;
  const same = (a, b) => String(a || "").trim().toLowerCase() === String(b || "").trim().toLowerCase();
  const hasAddr = (field, addr) => String(field || "").toLowerCase().split(/[,;\s]+/).includes(addr.toLowerCase());
  const shouting = t => { const l = String(t).replace(/[^a-zA-ZÀ-ÿ]/g, ""); return l.length > 12 && l.replace(/[^A-ZÀ-Þ]/g, "").length / l.length > 0.6; };

  /** Cadre d'un niveau : en-tête, consigne, panneau (tâches / questions / retours) et boîte mail. */
  function frame(ctx, { level, title, step, consigne, help, noClient, chapter = "E-mail" }) {
    ctx.html(`${ctx.header(`Chapitre ${chapter} · Niveau ${level}`, title, step)}
      <p class="consigne" data-speak>${consigne}</p>
      ${help ? ctx.help(help) : ""}
      <div class="mk-mission ${ctx.demo ? "mk-demo" : ""}">
        <div class="mk-panel" aria-live="polite"></div>
        ${noClient ? "" : `<div class="mk-host"></div>`}
      </div>`);
    return { panel: ctx.box.querySelector(".mk-panel"), host: ctx.box.querySelector(".mk-host") };
  }

  /** Liste de tâches qui se cochent toutes seules. */
  const tasksHTML = tasks => `<ol class="mk-tasks">${tasks.map(t => `<li class="${t.done ? "done" : ""}"><span aria-hidden="true">${t.done ? "✅" : "⬜"}</span> ${t.label}</li>`).join("")}</ol>`;

  /** Questions posées dans le panneau, sans effacer la boîte mail. On continue toujours. */
  function inlineQuiz(el, { questions, G, key, onDone, title = "" }) {
    let i = 0, answered = null;
    const draw = () => {
      const q = questions[i];
      el.innerHTML = `${title}<div class="mk-quiz inline"><div class="mk-quiz-count">Question ${i + 1} / ${questions.length}</div>
        <h3 data-speak>${q.q}</h3>
        <div class="choice-stack">${q.choices.map((c, k) => `<button type="button" class="secondary ${answered != null ? (k === q.ok ? "right" : k === answered ? "wrong" : "") : ""}" data-k="${k}" ${answered != null ? "disabled" : ""}>${c}</button>`).join("")}</div>
        ${answered != null ? `<div class="alert ${answered === q.ok ? "good" : "bad"}">${answered === q.ok ? "✅ Bonne réponse ! " : "❌ Pas tout à fait. "}${q.why}</div>
          <button type="button" class="primary" data-next>${i + 1 < questions.length ? "Question suivante →" : "Continuer →"}</button>` : ""}</div>`;
      el.querySelectorAll("[data-k]").forEach(b => b.addEventListener("click", () => {
        answered = Number(b.dataset.k);
        const plain = q.label || q.q.replace(/<[^>]+>/g, "");
        (answered === q.ok ? G.ok : G.ko)(`${key}_${i}`, plain, answered === q.ok ? "" : q.why.replace(/<[^>]+>/g, ""));
        draw();
      }));
      el.querySelector("[data-next]")?.addEventListener("click", () => { i++; answered = null; if (i < questions.length) draw(); else onDone(); });
    };
    draw();
  }

  /** Messages réels du formateur, ajoutés à la boîte (et ceux qui arrivent pendant l'exercice). */
  function live(ctx, ctl) {
    clearInterval(ctx.local.liveTimer);
    if (ctx.demo) return;
    const known = new Set(ctl.mails.map(m => m.id));
    const pull = () => {
      const fresh = MAIL().fromMessages(ctx.api.state.messages || []).filter(m => !known.has(m.id));
      fresh.forEach(m => known.add(m.id));
      if (fresh.length) { ctl.add(fresh); ctl.flash(`📬 ${fresh.length > 1 ? "Nouveaux messages reçus" : "Nouveau message reçu"} !`, "info", 3000); }
    };
    ctx.local.liveTimer = setInterval(pull, 3000);
    ctx.onCleanup(() => clearInterval(ctx.local.liveTimer));
  }

  /** Fin de niveau : note /20 enregistrée + récapitulatif détaillé. */
  async function finish(ctx, G, { key, label, intro }) {
    clearInterval(ctx.local.liveTimer);
    ctx.local.client?.destroy();
    await ctx.saveGrade(G.points, G.max);
    ctx.complete({ key, label, theme: null, text: `${intro}${G.recap()}` });
  }

  /* ---------- personnages et documents de l'univers fictif ---------- */
  const P = {
    media: { name: "Médiathèque de Valbourg", email: "mediatheque@valbourg.fr" },
    mairie: { name: "Mairie de Valbourg", email: "accueil@mairie-valbourg.fr" },
    claire: { name: "Claire Dupont", email: "claire.dupont@gmail.com" },
    pharma: { name: "Pharmacie du Centre", email: "contact@pharmacie-centre-valbourg.fr" },
    marche: { name: "Lettre d'info du marché", email: "info@marche-valbourg.fr" },
    plombier: { name: "Plomberie Martin", email: "facturation@plomberie-martin.fr" },
    aides: { name: "Caisse des aides (simulation)", email: "ne-pas-repondre@aides-valbourg.fr" },
    docteur: { name: "Cabinet du Dr Martin", email: "secretariat@cabinet-drmartin.fr" },
    paul: { name: "Paul Roux", email: "paul.roux@orange.fr" }
  };
  const paper = (title, lines) => `<h4>${title}</h4>${lines.map(l => `<p>${l}</p>`).join("")}`;

  /* =========================================================
     NIVEAU 1 — Lire ses e-mails   (exercice collectif projetable)
     ========================================================= */
  function readMails(ctx) {
    return [
      { id: "r_media", from: P.media, subject: "Votre inscription à l'atelier de jeudi", date: "Aujourd'hui 09:12", unread: true,
        body: `<p>Bonjour,</p><p>Nous vous confirmons votre inscription à l'atelier <b>« Bien utiliser sa messagerie »</b>, <b>jeudi à 14 h</b>, salle Jules Verne.</p><p>Pensez à apporter <b>votre carnet et vos identifiants de messagerie</b>.</p><p>Bonne journée,<br>L'équipe de la médiathèque</p>` },
      { id: "r_claire", from: P.claire, subject: "Photos du week-end 😊", date: "Hier 18:40", unread: true,
        body: `<p>Coucou,</p><p>Voici la photo de dimanche à la plage. Tu peux l'enregistrer si tu veux !</p><p>Bisous,<br>Claire</p>`,
        attachments: [{ name: "photo_plage.jpg", size: "2,1 Mo", preview: `<div class="mk-photo" aria-label="Photo d'une plage">🏖️</div><p>photo_plage.jpg</p>` }] },
      { id: "r_mairie", from: P.mairie, subject: "Programme des animations d'octobre", date: "Lun. 10:05",
        body: `<p>Madame, Monsieur,</p><p>Vous trouverez <b>en pièce jointe</b> le programme des animations du mois.</p><p>Cordialement,<br>Service animation</p>`,
        attachments: [{ name: "programme_animations.pdf", size: "320 Ko", preview: paper("Programme des animations", ["🎭 Mardi 18 h : théâtre au centre culturel", "📚 <b>Samedi matin : bourse aux livres</b> sur la place", "🚶 Dimanche 10 h : balade découverte du patrimoine"]) }] },
      { id: "r_pharma", from: P.pharma, subject: "Votre commande est prête", date: "Lun. 08:30", unread: true,
        body: `<p>Bonjour,</p><p>Votre commande est disponible. Vous pouvez venir la récupérer aux heures d'ouverture.</p><p>Pharmacie du Centre</p>` },
      { id: "r_marche", from: P.marche, subject: "Les produits de saison sont arrivés", date: "Sam. 07:00",
        body: `<p>Retrouvez nos producteurs locaux tous les samedis matin sur la place du marché.</p>` }
    ];
  }
  R("mail_read", {
    steps: 3,
    render(ctx) {
      const step = ctx.m.step || 0, L = ctx.local;
      const G = MAIL().grader(L.grade ||= {});
      L.mails ||= [...MAIL().fromMessages(ctx.api.state.messages || []), ...readMails(ctx)];
      const mount = (host, extra = {}) => {
        L.client?.destroy();
        L.client = MAIL().client(host, { mails: L.mails, me: meOf(ctx), big: ctx.demo, features: { compose: false, reply: false, replyAll: false, forward: false, delete: false, spam: false, search: false }, ...extra });
        live(ctx, L.client);
        return L.client;
      };

      if (step === 0) {
        const unread = L.mails.filter(m => m.unread).length;
        const f = frame(ctx, { level: 1, title: "Lire ses e-mails", step: 0,
          consigne: "Voici une boîte de réception. Les messages <b>en gras</b>, avec un point bleu, sont <b>non lus</b>.",
          help: "Regardez la liste au milieu : le gras signifie « pas encore ouvert »." });
        let quizDone = false;
        const c = mount(f.host, { onEvent: (type, d) => {
          if (type !== "open") return;
          if (!quizDone) { d.mail.unread = d.wasUnread; c.st.sel = null; c.render(); c.flash("Répondez d'abord à la question au-dessus de la boîte mail 🙂", "info", 3000); return; }
          if (d.mail.id === "r_media") { G.ok("open_media", "Ouvrir un message en cliquant dessus"); ctx.go(1); }
          else c.flash(`Ce message vient de <b>${esc(d.mail.from.name)}</b>. Cherchez celui de la <b>Médiathèque de Valbourg</b>.`, "warn", 3500);
        } });
        const opts3 = shuffle([...new Set([unread, unread + 2, Math.max(1, unread - 1), unread + 1])].filter(n => n !== unread)).slice(0, 2);
        const choices = shuffle([unread, ...opts3]);
        inlineQuiz(f.panel, { G, key: "unread", questions: [{ q: "Combien de messages <b>non lus</b> avez-vous ?", choices: choices.map(String), ok: choices.indexOf(unread), why: `Il y a ${unread} messages en gras : ce sont les messages pas encore ouverts.` }],
          onDone: () => {
            quizDone = true;
            f.panel.innerHTML = tasksHTML([{ label: "Cliquez sur le message de la <b>Médiathèque de Valbourg</b> pour l'ouvrir." }]);
          } });
        return;
      }

      if (step === 1) {
        const f = frame(ctx, { level: 1, title: "Lire ses e-mails", step: 1,
          consigne: "Le message est ouvert à droite. Lisez-le, puis répondez aux questions." });
        const c = mount(f.host);
        c.select("r_media");
        inlineQuiz(f.panel, { G, key: "read", questions: [
          { q: "Qui vous a envoyé ce message ?", choices: ["La médiathèque de Valbourg", "La mairie de Valbourg", "Claire Dupont"], ok: 0, why: "L'expéditeur est écrit en haut du message, à côté de « De » : Médiathèque de Valbourg." },
          { q: "Quand a lieu l'atelier ?", choices: ["Lundi à 10 h", "Jeudi à 14 h", "Samedi à 14 h"], ok: 1, why: "Le message dit : « jeudi à 14 h, salle Jules Verne »." },
          { q: "Que faut-il apporter ?", choices: ["Une photo d'identité", "Son carnet et ses identifiants de messagerie", "Rien du tout"], ok: 1, why: "La dernière phrase demande d'apporter « votre carnet et vos identifiants de messagerie »." }
        ], onDone: () => ctx.go(2) });
        return;
      }

      if (step === 2) {
        const f = frame(ctx, { level: 1, title: "Ouvrir une pièce jointe", step: 2,
          consigne: "Le trombone 📎 signale une <b>pièce jointe</b> : un document attaché au message.",
          help: "Ouvrez le message de la mairie, puis cliquez sur le document en bas du message." });
        const tasks = [{ id: "open", label: "Ouvrez le message de la <b>Mairie de Valbourg</b> (il a un trombone 📎)." }, { id: "att", label: "Cliquez sur la pièce jointe <b>programme_animations.pdf</b>." }];
        f.panel.innerHTML = tasksHTML(tasks);
        mount(f.host, { onEvent: (type, d) => {
          if (type === "open" && d.mail.id === "r_mairie") { tasks[0].done = true; f.panel.innerHTML = tasksHTML(tasks); }
          if (type === "attOpen" && d.mail.id === "r_mairie") {
            tasks[0].done = tasks[1].done = true;
            G.ok("att_open", "Ouvrir une pièce jointe");
            f.panel.innerHTML = tasksHTML(tasks) + `<div class="mk-q-slot"></div>`;
            inlineQuiz(f.panel.querySelector(".mk-q-slot"), { G, key: "prog", questions: [
              { q: "D'après le programme, quand a lieu la <b>bourse aux livres</b> ?", choices: ["Mardi à 18 h", "Samedi matin", "Dimanche à 10 h"], ok: 1, why: "Le programme indique : « Samedi matin : bourse aux livres sur la place »." }
            ], onDone: () => finish(ctx, G, { key: "mail_read", label: "Je sais lire mes e-mails et ouvrir une pièce jointe", intro: "Vous savez repérer les messages non lus, lire un message et ouvrir une pièce jointe." }) });
          }
        } });
        return;
      }
      ctx.finalScreen({ theme: null });
    }
  });

  /* =========================================================
     NIVEAU 2 — L'adresse e-mail
     ========================================================= */
  const PARTS = [
    { id: "user", text: "marie.dupont", q: "Cliquez sur l'<b>identifiant</b> : le nom choisi par la personne.", why: "L'identifiant est la partie AVANT l'arobase : marie.dupont." },
    { id: "at", text: "@", q: "Cliquez sur l'<b>arobase</b>.", why: "L'arobase @ sépare la personne de son fournisseur. Elle se lit « chez »." },
    { id: "provider", text: "laposte", q: "Cliquez sur le <b>fournisseur</b> : la société qui gère la boîte mail.", why: "Après l'arobase vient le fournisseur : ici laposte (comme gmail, orange, free…)." },
    { id: "ext", text: ".net", q: "Cliquez sur l'<b>extension</b>, à la fin de l'adresse.", why: "L'extension est à la fin, après le point : .net (ou .fr, .com…)." }
  ];
  const ADDRS = [
    { a: "jean.martin@orange.fr", ok: true, why: "Tout y est : identifiant, @, fournisseur, point et extension." },
    { a: "marie dupont@gmail.com", ok: false, why: "Une adresse ne contient jamais d'espace. On écrit marie.dupont ou marie_dupont." },
    { a: "paul.roux.gmail.com", ok: false, why: "Il manque l'arobase @ entre le nom et le fournisseur." },
    { a: "contact@mairie-valbourg.fr", ok: true, why: "Le tiret - est autorisé. Cette adresse est correcte." },
    { a: "sophie@@free.fr", ok: false, why: "Il y a deux arobases. Une adresse n'en a qu'une seule." },
    { a: "andre.leroy@laposte", ok: false, why: "Il manque l'extension à la fin (.net, .fr…)." },
    { a: "luc_bernard62@sfr.fr", ok: true, why: "Le tiret bas _ et les chiffres sont autorisés. L'adresse est correcte." },
    { a: "élodie.petit@gmail.com", ok: false, why: "Les accents (é, è, à…) ne sont pas acceptés dans une adresse e-mail." }
  ];
  const DICTEE = {
    beginner: ["jeanne.morel@orange.fr"],
    intermediate: ["jeanne.morel@orange.fr", "contact@mairie-valbourg.fr"],
    expert: ["jeanne.morel@orange.fr", "contact@mairie-valbourg.fr", "j.martin_durand@free.fr"]
  };
  function typingHint(target, typed) {
    const t = typed.trim();
    if (!t) return "Écrivez l'adresse dans la case.";
    if (/\s/.test(t)) return "Il y a un espace dans votre adresse : une adresse n'en contient jamais.";
    if (!t.includes("@")) return "Il manque l'arobase @. Sur le clavier : maintenez <kbd>AltGr</kbd> (à droite de la barre d'espace) et appuyez sur <kbd>à 0</kbd>.";
    if ((t.match(/@/g) || []).length > 1) return "Il y a plusieurs arobases @. Une seule suffit.";
    if (t.toLowerCase() === target && t !== target) return "Presque ! Les adresses s'écrivent en minuscules : désactivez la touche <kbd>Verr. Maj</kbd>.";
    if (target.includes("-") && !t.includes("-")) return "Il manque le tiret - : c'est la touche <kbd>6</kbd>, sans Maj.";
    if (target.includes("_") && !t.includes("_")) return "Il manque le tiret bas _ : c'est la touche <kbd>8</kbd>, sans Maj.";
    if (!/\.[a-z]{2,}$/i.test(t)) return "Vérifiez la fin de l'adresse : il faut un point puis l'extension. Le point s'obtient avec <kbd>Maj</kbd> + <kbd>; .</kbd>";
    return "Comparez lettre par lettre avec le modèle : une seule lettre différente et le message n'arrive pas.";
  }
  R("mail_address", {
    steps: 3,
    render(ctx) {
      const step = ctx.m.step || 0, L = ctx.local;
      const G = MAIL().grader(L.grade ||= {});

      if (step === 0) {
        L.p ||= 0;
        const part = PARTS[L.p];
        const f = frame(ctx, { level: 2, title: "Comprendre une adresse e-mail", step: 0, noClient: true,
          consigne: "Une adresse e-mail est comme une adresse postale : chaque partie a un rôle." });
        f.panel.innerHTML = `<div class="addr-anatomy" role="group" aria-label="Adresse marie.dupont@laposte.net">${PARTS.map(x => `<button type="button" class="addr-part ${L.done?.includes(x.id) ? "found" : ""}" data-p="${x.id}">${esc(x.text)}</button>`).join("")}</div>
          <h3 data-speak>${part.q}</h3><div class="mk-fb"></div>`;
        f.panel.querySelectorAll("[data-p]").forEach(b => b.addEventListener("click", () => {
          const good = b.dataset.p === part.id;
          (good ? G.ok : G.ko)("part_" + part.id, part.q.replace(/<[^>]+>/g, ""), good ? "" : part.why);
          (L.done ||= []).push(part.id);
          f.panel.querySelector(".mk-fb").innerHTML = `<div class="alert ${good ? "good" : "bad"}">${good ? "✅ Exact ! " : "❌ Ce n'est pas cette partie. "}${part.why}</div><button type="button" class="primary" data-next>${L.p + 1 < PARTS.length ? "Suivant →" : "Continuer →"}</button>`;
          f.panel.querySelectorAll("[data-p]").forEach(x => { x.disabled = true; if (x.dataset.p === part.id) x.classList.add("found"); });
          f.panel.querySelector("[data-next]").addEventListener("click", () => { L.p++; if (L.p < PARTS.length) ctx.render(); else ctx.go(1); });
        }));
        return;
      }

      if (step === 1) {
        const list = ctx.byLevel({ beginner: ADDRS.slice(0, 5), intermediate: ADDRS.slice(0, 7), expert: ADDRS });
        L.v ||= {};
        const f = frame(ctx, { level: 2, title: "Adresse correcte ou erreur ?", step: 1, noClient: true,
          consigne: "Pour chaque adresse, dites si elle est <b>correcte</b> ou si elle contient une <b>erreur</b>.",
          help: "Cherchez : un seul @, pas d'espace, pas d'accent, un point et une extension à la fin." });
        const draw = () => {
          f.panel.innerHTML = `<div class="addr-check">${list.map((x, i) => {
            const a = L.v[i];
            return `<div class="addr-row ${a != null ? (a === x.ok ? "right" : "wrong") : ""}"><code>${esc(x.a)}</code>
              <span>${a == null ? `<button type="button" class="secondary" data-i="${i}" data-v="1">✔ Correcte</button><button type="button" class="secondary" data-i="${i}" data-v="0">✖ Erreur</button>` : `<b>${a === x.ok ? "✅" : "❌"} ${x.ok ? "Correcte" : "Erreur"}</b>`}</span>
              ${a != null ? `<small>${esc(x.why)}</small>` : ""}</div>`;
          }).join("")}</div>
          ${Object.keys(L.v).length === list.length ? `<button type="button" class="primary" data-next>Continuer →</button>` : ""}`;
          f.panel.querySelectorAll("[data-v]").forEach(b => b.addEventListener("click", () => {
            const i = Number(b.dataset.i), v = b.dataset.v === "1", x = list[i];
            L.v[i] = v;
            (v === x.ok ? G.ok : G.ko)("addr_" + i, `${x.a} : ${x.ok ? "correcte" : "erreur"}`, v === x.ok ? "" : x.why);
            draw();
          }));
          f.panel.querySelector("[data-next]")?.addEventListener("click", () => ctx.go(2));
        };
        draw();
        return;
      }

      if (step === 2) {
        const targets = ctx.byLevel(DICTEE);
        L.d ||= 0;
        const target = targets[L.d];
        const f = frame(ctx, { level: 2, title: "Écrire une adresse sans erreur", step: 2, noClient: true,
          consigne: `Recopiez cette adresse exactement (${L.d + 1} / ${targets.length}) :`,
          help: "L'arobase @ : maintenez la touche AltGr et appuyez sur la touche à (0)." });
        f.panel.innerHTML = `<div class="addr-model">${esc(target)}</div>
          <div class="keys-hint"><span><kbd>AltGr</kbd> + <kbd>à 0</kbd> = @</span><span><kbd>Maj</kbd> + <kbd>; .</kbd> = .</span><span><kbd>6</kbd> = -</span><span><kbd>8</kbd> = _</span></div>
          <label class="mk-field big"><span>Adresse</span><input id="addrInput" autocomplete="off" spellcheck="false" autocapitalize="off"></label>
          <button type="button" class="primary" id="addrCheck">Vérifier</button><div class="mk-fb" aria-live="polite"></div>`;
        const input = f.panel.querySelector("#addrInput");
        input.focus();
        const check = () => {
          const v = input.value.trim(), good = v === target;
          const fb = f.panel.querySelector(".mk-fb");
          if (good) {
            G.ok("dictee_" + L.d, `Écrire ${target}`);
            fb.innerHTML = `<div class="alert good">✅ Parfait, l'adresse est exacte !</div><button type="button" class="primary" data-next>${L.d + 1 < targets.length ? "Adresse suivante →" : "Terminer le niveau →"}</button>`;
            fb.querySelector("[data-next]").addEventListener("click", () => { L.d++; if (L.d < targets.length) ctx.render(); else finish(ctx, G, { key: "mail_address", label: "Je sais lire et écrire une adresse e-mail", intro: "Identifiant, arobase, fournisseur, extension : vous savez lire et écrire une adresse e-mail." }); });
          } else {
            G.ko("dictee_" + L.d, `Écrire ${target}`, typingHint(target, v).replace(/<[^>]+>/g, ""));
            fb.innerHTML = `<div class="alert bad">❌ ${typingHint(target, v)}</div><p class="muted">Corrigez et cliquez à nouveau sur « Vérifier ».</p>`;
          }
        };
        f.panel.querySelector("#addrCheck").addEventListener("click", check);
        input.addEventListener("keydown", e => { if (e.key === "Enter") check(); });
        return;
      }
      ctx.finalScreen({ theme: null });
    }
  });

  /* =========================================================
     NIVEAU 3 — Répondre et transférer
     ========================================================= */
  R("mail_reply", {
    steps: 3,
    render(ctx) {
      const step = ctx.m.step || 0, L = ctx.local;
      const G = MAIL().grader(L.grade ||= {});
      const me = meOf(ctx);

      if (step === 0) {
        const f = frame(ctx, { level: 3, title: "Répondre, répondre à tous ou transférer ?", step: 0, noClient: true,
          consigne: "Pour chaque situation, choisissez le bon bouton.",
          help: "Répondre = à l'expéditeur seulement. Répondre à tous = à l'expéditeur et aux personnes en copie. Transférer = envoyer le message à quelqu'un d'autre." });
        const B = ["↩️ Répondre", "↩️↩️ Répondre à tous", "↪️ Transférer"];
        const qs = [
          { q: "La médiathèque vous demande si vous serez présent(e) jeudi.", choices: B, ok: 0, why: "Seule la médiathèque a besoin de votre réponse : « Répondre »." },
          { q: "Vous avez reçu la facture du plombier. Vous voulez l'envoyer à votre fille, qui s'occupe de vos papiers.", choices: B, ok: 2, why: "Votre fille n'a pas reçu ce message : on le lui « Transfère », avec la pièce jointe." },
          { q: "Votre fils propose un repas de famille dimanche, toute la famille est en copie. Vous voulez dire à tout le monde que vous apportez le dessert.", choices: B, ok: 1, why: "Toute la famille doit lire votre réponse : « Répondre à tous »." },
          ...ctx.byLevel({ beginner: [], intermediate: [], expert: [
            { q: "Un message envoyé à 30 parents d'élèves annonce la fête de l'école. Vous voulez seulement demander à l'organisatrice si vous pouvez aider.", choices: B, ok: 0, why: "Inutile d'écrire aux 30 personnes : « Répondre » à l'organisatrice suffit." }
          ] })
        ];
        inlineQuiz(f.panel, { G, key: "which", questions: qs, onDone: () => ctx.go(1) });
        return;
      }

      if (step === 1) {
        const f = frame(ctx, { level: 3, title: "Répondre à un message", step: 1,
          consigne: "La médiathèque vous pose une question. <b>Répondez-lui</b> pour confirmer votre présence.",
          help: "Ouvrez le message, cliquez sur « ↩️ Répondre », écrivez quelques mots (Bonjour… Cordialement), puis « Envoyer »." });
        const tasks = [{ label: "Ouvrez le message de la médiathèque." }, { label: "Cliquez sur <b>↩️ Répondre</b>." }, { label: "Écrivez votre réponse : une formule de politesse au début et à la fin." }, { label: "Cliquez sur <b>📤 Envoyer</b>." }];
        const upd = () => { f.panel.innerHTML = tasksHTML(tasks) + `<div class="mk-fb"></div>`; };
        upd();
        L.client?.destroy();
        L.client = MAIL().client(f.host, { me, big: ctx.demo, features: { attach: false, search: false },
          mails: [
            { id: "q_media", from: P.media, subject: "Atelier de jeudi : serez-vous présent(e) ?", date: "Aujourd'hui 10:20", unread: true,
              body: `<p>Bonjour,</p><p>L'atelier « messagerie » a lieu jeudi à 14 h. <b>Pouvez-vous nous confirmer votre présence en répondant à ce message ?</b></p><p>Merci,<br>L'équipe de la médiathèque</p>` },
            { id: "q_marche", from: P.marche, subject: "Les produits de saison sont arrivés", date: "Sam. 07:00", body: "<p>Retrouvez nos producteurs locaux tous les samedis.</p>" }
          ],
          onEvent: (type, d, c) => {
            if (type === "open" && d.mail.id === "q_media") { tasks[0].done = true; upd(); }
            if (type === "reply" && d.id === "q_media") { tasks[0].done = tasks[1].done = true; upd(); }
            if (type === "new") c.flash("Vous écrivez un nouveau message. Pour répondre, ouvrez le message de la médiathèque et cliquez sur « ↩️ Répondre » : l'adresse et l'objet se remplissent tout seuls.", "warn", 6000);
            if (type === "send") {
              const body = d.body.split("--- Message de")[0];
              (d.mode === "reply" ? G.ok : G.ko)("mode", "Utiliser le bouton « Répondre »", "« Répondre » remplit tout seul l'adresse et l'objet : moins de risque d'erreur.");
              (same(d.to, P.media.email) ? G.ok : G.ko)("to", "Envoyer la réponse à la médiathèque", `La réponse doit partir vers ${P.media.email}.`);
              (/^RE\s*:/i.test(d.subject) ? G.ok : G.ko)("re", "Garder l'objet « RE : »", "« RE : » au début de l'objet montre que c'est une réponse.");
              (GREET.test(body) ? G.ok : G.ko)("greet", "Commencer par une formule de politesse", "Commencez par « Bonjour » ou « Madame, Monsieur ».");
              (CLOSE.test(body) ? G.ok : G.ko)("close", "Terminer par une formule de politesse", "Terminez par « Cordialement », « Bonne journée » ou « Merci ».");
              tasks.forEach(t => { t.done = true; });
              upd();
              f.panel.querySelector(".mk-fb").innerHTML = `<div class="alert good">📤 Réponse envoyée ! Vous la retrouvez dans le dossier « Envoyés ».</div><button type="button" class="primary" data-next>Étape suivante : transférer →</button>`;
              f.panel.querySelector("[data-next]").addEventListener("click", () => ctx.go(2));
            }
          } });
        return;
      }

      if (step === 2) {
        const f = frame(ctx, { level: 3, title: "Transférer un message", step: 2,
          consigne: `Transférez la facture du plombier à votre fille Claire : <b class="mono">${P.claire.email}</b>`,
          help: "Ouvrez le message, cliquez sur « ↪️ Transférer », écrivez l'adresse de Claire dans « À », puis « Envoyer »." });
        const tasks = [{ label: "Ouvrez le message de <b>Plomberie Martin</b>." }, { label: "Cliquez sur <b>↪️ Transférer</b>." }, { label: `Dans « À », écrivez l'adresse de Claire.` }, { label: "Envoyez le message (la pièce jointe part avec lui)." }];
        const upd = () => { f.panel.innerHTML = tasksHTML(tasks) + `<div class="mk-fb"></div>`; };
        upd();
        L.client?.destroy();
        L.client = MAIL().client(f.host, { me, big: ctx.demo, features: { search: false },
          files: { "Documents": [{ name: "liste_courses.txt", size: "1 Ko" }] },
          mails: [
            { id: "t_plomb", from: P.plombier, subject: "Votre facture n° 2026-118", date: "Hier 16:02", unread: true,
              body: `<p>Bonjour,</p><p>Suite à notre intervention de mardi, veuillez trouver votre facture en pièce jointe.</p><p>Cordialement,<br>Plomberie Martin</p>`,
              attachments: [{ name: "facture_plomberie.pdf", size: "180 Ko", preview: paper("Facture n° 2026-118", ["Réparation fuite sous évier", "Total : <b>145,00 €</b>"]) }] },
            { id: "t_claire", from: P.claire, subject: "Photos du week-end 😊", date: "Hier 18:40", body: "<p>Coucou, voici les photos !</p>" }
          ],
          onEvent: (type, d) => {
            if (type === "open" && d.mail.id === "t_plomb") { tasks[0].done = true; upd(); }
            if (type === "forward" && d.id === "t_plomb") { tasks[0].done = tasks[1].done = true; upd(); }
            if (type === "send") {
              (d.mode === "forward" ? G.ok : G.ko)("fw", "Utiliser le bouton « Transférer »", "« Transférer » garde le message d'origine et sa pièce jointe.");
              (hasAddr(d.to, P.claire.email) ? G.ok : G.ko)("fw_to", "Envoyer à la bonne adresse", `L'adresse de Claire est ${P.claire.email}. Une seule lettre fausse et le message se perd.`);
              (d.attachments.some(a => a.name === "facture_plomberie.pdf") ? G.ok : G.ko)("fw_att", "Garder la facture en pièce jointe", "La facture était dans le message : il ne fallait pas la retirer.");
              tasks.forEach(t => { t.done = true; }); upd();
              finish(ctx, G, { key: "mail_reply", label: "Je sais répondre et transférer un e-mail", intro: "Répondre à l'expéditeur, répondre à tous, transférer à quelqu'un d'autre : vous connaissez les trois boutons." });
            }
          } });
        return;
      }
      ctx.finalScreen({ theme: null });
    }
  });

  /* =========================================================
     NIVEAU 4 — Écrire un e-mail complet (Cc, Cci, objet, politesse)
     ========================================================= */
  R("mail_compose", {
    steps: 2,
    render(ctx) {
      const step = ctx.m.step || 0, L = ctx.local;
      const G = MAIL().grader(L.grade ||= {});
      const me = meOf(ctx);
      const expert = ctx.level === "expert";

      if (step === 0) {
        const f = frame(ctx, { level: 4, title: "Les champs d'un message", step: 0, noClient: true,
          consigne: "Avant d'écrire, quelques questions sur les champs <b>Cc</b>, <b>Cci</b> et <b>Objet</b>." });
        inlineQuiz(f.panel, { G, key: "fields", questions: [
          { q: "Que veut dire <b>Cc</b> ?", choices: ["Copie : la personne reçoit aussi le message, et tout le monde voit son adresse", "Message confidentiel", "Message à envoyer plus tard"], ok: 0, why: "Cc veut dire « copie carbone » : la personne est informée, et son adresse est visible par tous." },
          { q: "Vous écrivez à 20 voisins qui ne se connaissent pas, pour la fête du quartier. Où mettre leurs adresses ?", choices: ["Dans « À »", "Dans « Cc »", "Dans « Cci »"], ok: 2, why: "« Cci » = copie cachée : chacun reçoit le message sans voir l'adresse des autres. On protège leur vie privée." },
          { q: "Quel est le meilleur <b>objet</b> pour s'inscrire à un atelier ?", choices: ["Bonjour", "Inscription atelier de jeudi 14 h", "URGENT LISEZ VITE", "(laisser vide)"], ok: 1, why: "L'objet résume le message en quelques mots : la personne comprend avant même d'ouvrir." }
        ], onDone: () => ctx.go(1) });
        return;
      }

      if (step === 1) {
        const f = frame(ctx, { level: 4, title: "Écrire un e-mail complet", step: 1,
          consigne: `Écrivez à la médiathèque (<b class="mono">${P.media.email}</b>) pour vous <b>inscrire à l'atelier de jeudi</b>. Mettez votre fille Claire (<b class="mono">${P.claire.email}</b>) <b>en copie</b>.${expert ? ` Ajoutez votre voisin Paul (<b class="mono">${P.paul.email}</b>) en <b>copie cachée</b>.` : ""}`,
          help: "Cliquez sur « ✏️ Nouveau message ». Pour la copie, cliquez sur « + Cc / Cci »." });
        const tasks = [{ label: "Cliquez sur <b>✏️ Nouveau message</b>." }, { label: "Remplissez « À » et « Cc »." + (expert ? " Et « Cci »." : "") }, { label: "Écrivez un objet clair." }, { label: "Écrivez le message, avec politesse." }, { label: "Envoyez." }];
        const upd = () => { f.panel.innerHTML = tasksHTML(tasks) + `<div class="mk-fb"></div>`; };
        upd();
        L.client?.destroy();
        L.client = MAIL().client(f.host, { me, big: ctx.demo, features: { search: false, attach: false },
          mails: [{ id: "c_media", from: P.media, subject: "Nouveaux ateliers à la médiathèque", date: "Lun. 09:00", body: "<p>Bonjour,</p><p>De nouveaux ateliers numériques commencent. Pour vous inscrire, écrivez-nous à mediatheque@valbourg.fr.</p><p>L'équipe</p>" }],
          onEvent: (type, d) => {
            if (type === "new") { tasks[0].done = true; upd(); }
            if (type === "send") {
              const text = d.body.split("--- Message de")[0];
              (same(d.to, P.media.email) ? G.ok : G.ko)("to", "Destinataire principal : la médiathèque", `Dans « À », il fallait ${P.media.email}.`);
              if (hasAddr(d.cc, P.claire.email)) G.ok("cc", "Claire en copie (Cc)");
              else G.ko("cc", "Claire en copie (Cc)", hasAddr(d.to, P.claire.email) ? "Claire était dans « À » : elle devait être dans « Cc », car le message ne lui est pas adressé directement." : `Ajoutez ${P.claire.email} dans le champ « Cc ».`);
              if (expert) (hasAddr(d.bcc, P.paul.email) && !hasAddr(d.cc, P.paul.email) ? G.ok : G.ko)("bcc", "Paul en copie cachée (Cci)", "Paul devait être dans « Cci » : les autres ne voient pas son adresse.");
              (/(inscri|atelier|jeudi)/i.test(d.subject) ? G.ok : G.ko)("subject", "Un objet clair", d.subject.trim() ? `« ${d.subject} » ne dit pas de quoi parle le message. Exemple : « Inscription atelier jeudi ».` : "Le message n'avait pas d'objet. Exemple : « Inscription atelier jeudi ».");
              (GREET.test(text) ? G.ok : G.ko)("greet", "Formule de politesse au début", "Commencez par « Bonjour » ou « Madame, Monsieur ».");
              (CLOSE.test(text) ? G.ok : G.ko)("close", "Formule de politesse à la fin", "Terminez par « Cordialement » ou « Bonne journée ».");
              (/(inscri|participer|atelier|venir|présent)/i.test(text) ? G.ok : G.ko)("content", "Dire clairement ce que l'on veut", "Écrivez clairement votre demande : « Je souhaite m'inscrire à l'atelier de jeudi ».");
              if (shouting(text)) G.ko("caps", "Ne pas écrire tout en majuscules", "Un message en MAJUSCULES donne l'impression de crier.");
              tasks.forEach(t => { t.done = true; }); upd();
              finish(ctx, G, { key: "mail_compose", label: "Je sais écrire un e-mail complet", intro: "Destinataire, copie, objet, politesse : votre message est complet." });
            }
          } });
        return;
      }
      ctx.finalScreen({ theme: null });
    }
  });

  /* =========================================================
     NIVEAU 5 — Les pièces jointes (recevoir, télécharger, joindre)
     ========================================================= */
  function attachFiles() {
    const d = new Date(), y = d.getFullYear();
    const recent = new Date(y, d.getMonth() - 1, 1), old = new Date(y, d.getMonth() - 8, 1);
    const fname = dt => `facture_electricite_${MONTHS[dt.getMonth()]}_${dt.getFullYear()}.pdf`;
    return {
      good: fname(recent), old: fname(old),
      files: {
        "Téléchargements": [
          { name: "attestation_droits.pdf", size: "95 Ko", date: "aujourd'hui" },
          { name: fname(recent), size: "210 Ko", date: recent.toLocaleDateString("fr-FR", { month: "long", year: "numeric" }) },
          { name: "lecteur_pdf_gratuit.exe", size: "48 Mo", date: "il y a 2 mois" }
        ],
        "Documents": [
          { name: fname(old), size: "205 Ko", date: old.toLocaleDateString("fr-FR", { month: "long", year: "numeric" }) },
          { name: `avis_impot_${y - 1}.pdf`, size: "310 Ko", date: `${y - 1}` },
          { name: "liste_courses.txt", size: "1 Ko", date: "hier" }
        ],
        "Images": [{ name: "photo_plage.jpg", size: "2,1 Mo", date: "dimanche" }, { name: "scan_carte_identite.jpg", size: "1,4 Mo", date: "il y a 1 an" }]
      }
    };
  }
  R("mail_attach", {
    steps: 3,
    render(ctx) {
      const step = ctx.m.step || 0, L = ctx.local;
      const G = MAIL().grader(L.grade ||= {});
      const me = meOf(ctx);
      const FX = attachFiles();

      if (step === 0) {
        const f = frame(ctx, { level: 5, title: "Recevoir et télécharger une pièce jointe", step: 0,
          consigne: "Vous avez reçu une attestation. <b>Ouvrez-la</b>, puis <b>téléchargez-la</b> pour la garder sur l'ordinateur.",
          help: "Ouvrez le message, cliquez sur le document 📕, puis sur « ⬇️ Télécharger »." });
        const tasks = [{ label: "Ouvrez le message de la <b>Caisse des aides</b>." }, { label: "Cliquez sur la pièce jointe <b>attestation_droits.pdf</b>." }, { label: "Cliquez sur <b>⬇️ Télécharger</b>." }];
        const upd = () => { f.panel.innerHTML = tasksHTML(tasks) + `<div class="mk-q-slot"></div>`; };
        upd();
        L.client?.destroy();
        L.client = MAIL().client(f.host, { me, big: ctx.demo, features: { compose: false, reply: false, replyAll: false, forward: false, search: false },
          mails: [
            { id: "a_aides", from: P.aides, subject: "Votre attestation de droits est disponible", date: "Aujourd'hui 08:45", unread: true,
              body: "<p>Madame, Monsieur,</p><p>Vous trouverez ci-joint votre attestation de droits. Conservez-la : elle peut vous être demandée.</p><p>Ceci est un message automatique, merci de ne pas y répondre.</p>",
              attachments: [{ name: "attestation_droits.pdf", size: "95 Ko", preview: paper("Attestation de droits", ["Bénéficiaire : " + esc(ctx.name), "Droits ouverts du 01/01 au 31/12", "Document à conserver"]) }] },
            { id: "a_pharma", from: P.pharma, subject: "Votre commande est prête", date: "Lun. 08:30", body: "<p>Votre commande est disponible.</p>" }
          ],
          onEvent: (type, d) => {
            if (type === "open" && d.mail.id === "a_aides") { tasks[0].done = true; upd(); }
            if (type === "attOpen") { tasks[0].done = tasks[1].done = true; upd(); }
            if (type === "download") {
              tasks.forEach(t => { t.done = true; }); upd();
              G.ok("download", "Télécharger une pièce jointe");
              inlineQuiz(f.panel.querySelector(".mk-q-slot"), { G, key: "where", questions: [
                { q: "Où se trouve maintenant le fichier téléchargé ?", choices: ["Dans le dossier « Téléchargements »", "Sur le Bureau", "Dans la Corbeille"], ok: 0, why: "Sauf réglage contraire, tout ce que l'on télécharge arrive dans le dossier « Téléchargements »." }
              ], onDone: () => ctx.go(1) });
            }
          } });
        return;
      }

      if (step === 1) {
        const f = frame(ctx, { level: 5, title: "Envoyer une pièce jointe", step: 1,
          consigne: "La mairie vous demande un <b>justificatif de domicile de moins de 3 mois</b>. Répondez-lui en joignant le <b>bon fichier</b>.",
          help: "Ouvrez le message de la mairie, cliquez sur « ↩️ Répondre », puis sur « 📎 Joindre un fichier ». Une facture d'électricité récente est un justificatif de domicile." });
        const tasks = [{ label: "Ouvrez le message de la mairie et cliquez sur <b>↩️ Répondre</b>." }, { label: "Cliquez sur <b>📎 Joindre un fichier</b> et choisissez le bon document." }, { label: "Écrivez quelques mots, puis envoyez." }];
        const upd = () => { f.panel.innerHTML = `<div class="mouse-hint">📅 Nous sommes en ${new Date().toLocaleDateString("fr-FR", { month: "long", year: "numeric" })}.</div>` + tasksHTML(tasks) + `<div class="mk-fb"></div>`; };
        upd();
        L.client?.destroy();
        L.client = MAIL().client(f.host, { me, big: ctx.demo, files: FX.files, features: { search: false },
          mails: [{ id: "a_mairie", from: P.mairie, subject: "Demande de carte de stationnement : pièce manquante", date: "Aujourd'hui 11:02", unread: true,
            body: "<p>Madame, Monsieur,</p><p>Pour finaliser votre demande, merci de nous envoyer <b>un justificatif de domicile de moins de 3 mois</b> (facture d'électricité, de gaz, d'eau ou de téléphone), en répondant à ce message.</p><p>Cordialement,<br>Accueil de la mairie</p>" }],
          onEvent: (type, d, c) => {
            if (type === "reply") { tasks[0].done = true; upd(); }
            if (type === "attach") { tasks[0].done = tasks[1].done = true; upd();
              if (d.name.endsWith(".exe")) c.flash("⚠️ Un fichier « .exe » est un programme, pas un document. On n'envoie jamais ça comme justificatif.", "warn", 6000); }
            if (type === "send") {
              const names = d.attachments.map(a => a.name);
              if (!names.length) {
                G.ko("att", "Joindre le justificatif", "Le message est parti sans pièce jointe ! C'est l'oubli le plus fréquent : on vérifie toujours la présence du 📎 avant d'envoyer.");
                f.panel.querySelector(".mk-fb").innerHTML = `<div class="alert bad">❌ Oups, vous avez oublié la pièce jointe ! C'est l'erreur la plus fréquente. Renvoyez le message, cette fois avec le justificatif.</div>`;
                return false;
              }
              if (names.includes(FX.good)) G.ok("att", "Joindre le bon justificatif");
              else if (names.includes(FX.old)) G.ko("att", "Joindre le bon justificatif", "Cette facture a plus de 3 mois : elle serait refusée. Regardez bien la date dans le nom du fichier.");
              else G.ko("att", "Joindre le bon justificatif", `Ce document n'est pas un justificatif de domicile. Le bon fichier était ${FX.good}.`);
              (d.mode === "reply" ? G.ok : G.ko)("mode", "Répondre au message de la mairie", "En répondant, la mairie retrouve facilement votre demande.");
              if (names.length > 1) G.ko("extra", "N'envoyer que le document demandé", "Inutile d'envoyer d'autres fichiers : on joint seulement ce qui est demandé.");
              tasks.forEach(t => { t.done = true; }); upd();
              f.panel.querySelector(".mk-fb").innerHTML = `<div class="alert good">📤 Message envoyé avec sa pièce jointe.</div><button type="button" class="primary" data-next>Dernière étape →</button>`;
              f.panel.querySelector("[data-next]").addEventListener("click", () => ctx.go(2));
            }
          } });
        return;
      }

      if (step === 2) {
        const f = frame(ctx, { level: 5, title: "Les bons réflexes", step: 2, noClient: true, consigne: "Trois questions pour finir." });
        inlineQuiz(f.panel, { G, key: "reflex", questions: [
          { q: "Quelle est la différence entre <b>joindre</b> et <b>télécharger</b> ?", choices: ["Joindre = ajouter un fichier à un message que j'envoie ; télécharger = enregistrer sur mon ordinateur un fichier reçu", "C'est la même chose", "Joindre = supprimer un fichier"], ok: 0, why: "On joint pour ENVOYER, on télécharge pour GARDER un fichier reçu." },
          { q: "Un inconnu vous envoie « facture.exe ». Que faites-vous ?", choices: ["Je l'ouvre pour voir", "Je ne l'ouvre pas et je supprime le message", "Je le transfère à mes amis"], ok: 1, why: "« .exe » est un programme : il peut installer un virus. Une vraie facture est un .pdf." },
          { q: "Votre vidéo de vacances (2 Go) ne part pas. Pourquoi ?", choices: ["Internet est en panne", "Elle est trop lourde : les pièces jointes sont souvent limitées à 20 ou 25 Mo", "Il faut l'envoyer deux fois"], ok: 1, why: "Les messageries limitent la taille des pièces jointes. Pour un gros fichier, on envoie un lien de partage." }
        ], onDone: () => finish(ctx, G, { key: "mail_attach", label: "Je sais recevoir et envoyer une pièce jointe", intro: "Ouvrir, télécharger, joindre le bon document : les pièces jointes n'ont plus de secret pour vous." }) });
        return;
      }
      ctx.finalScreen({ theme: null });
    }
  });

  /* =========================================================
     NIVEAU 7 — Défi : gérer sa boîte mail comme au quotidien
     ========================================================= */
  function challengeMails() {
    return [
      { id: "d_scam1", from: { name: "Suivi Colis", email: "suivi@colis-livraison-fr.top" }, subject: "Votre colis est bloqué – frais de 1,99 € à régler", date: "Aujourd'hui 07:58", unread: true, scam: true,
        body: `<p>Cher client,</p><p>Votre colis n'a pas pu être livré. Réglez les frais de réexpédition (1,99 €) sous 24 h, sinon il sera renvoyé à l'expéditeur.</p><p><a href="#" class="mk-link" data-url="http://colis-livraison-fr.top/paiement">Payer maintenant</a></p>` },
      { id: "d_claire", from: P.claire, subject: "Repas dimanche ?", date: "Aujourd'hui 08:30", unread: true,
        body: "<p>Coucou,</p><p>Tu viens manger à la maison dimanche midi ? Dis-moi vite 😊</p><p>Claire</p>" },
      { id: "d_promo", from: { name: "MégaStore", email: "promo@megastore-offres.com" }, subject: "SOLDES -70 % : derniers jours !!!", date: "Aujourd'hui 06:00", unread: true,
        body: "<p>Profitez de nos remises exceptionnelles sur toute la maison.</p>" },
      { id: "d_mairie", from: P.mairie, subject: "Convocation : rendez-vous carte d'identité", date: "Hier 15:12", unread: true,
        body: "<p>Madame, Monsieur,</p><p>Votre rendez-vous pour le renouvellement de votre carte d'identité est fixé au <b>mardi à 9 h 30</b>. Présentez-vous avec cette convocation.</p><p>Accueil de la mairie</p>",
        attachments: [{ name: "convocation_cni.pdf", size: "120 Ko", preview: paper("Convocation", ["Rendez-vous : <b>mardi 9 h 30</b>", "Apporter : ancienne carte, photo d'identité, justificatif de domicile"]) }] },
      { id: "d_scam2", from: { name: "Centre des Finances Publiques", email: "remboursement@finances-gouv-fr.info" }, subject: "Remboursement d'impôt de 248,60 € en attente", date: "Hier 11:47", unread: true, scam: true,
        body: `<p>Bonjour,</p><p>Après calcul, vous avez droit à un remboursement de <b>248,60 €</b>. Pour le recevoir, confirmez vos coordonnées bancaires avant 48 h.</p><p><a href="#" class="mk-link" data-url="http://finances-gouv-fr.info/remboursement">Recevoir mon remboursement</a></p>` },
      { id: "d_media", from: P.media, subject: "Retour des livres empruntés", date: "Hier 09:00", body: "<p>Bonjour, vos livres sont à rendre avant samedi. Bonne lecture !</p>" },
      { id: "d_pharma", from: P.pharma, subject: "Votre commande est prête", date: "Lun. 08:30", body: "<p>Votre commande est disponible.</p>" },
      { id: "d_marche", from: P.marche, subject: "Les produits de saison sont arrivés", date: "Sam. 07:00", body: "<p>Producteurs locaux tous les samedis matin.</p>" },
      { id: "d_doc", from: P.docteur, subject: "Confirmation de votre rendez-vous", date: "Ven. 17:20",
        body: "<p>Bonjour,</p><p>Nous vous confirmons votre rendez-vous avec le Dr Martin <b>jeudi à 10 h 20</b>. En cas d'empêchement, merci de prévenir le cabinet.</p><p>Le secrétariat</p>" },
      { id: "d_club", from: { name: "Club de marche", email: "club.marche@valbourg-asso.fr" }, subject: "Sortie du mois", date: "Jeu. 12:00", body: "<p>Prochaine sortie : le lac, départ 9 h devant la mairie.</p>" }
    ];
  }
  R("mail_challenge", {
    steps: 2,
    render(ctx) {
      const step = ctx.m.step || 0, L = ctx.local;
      const G = MAIL().grader(L.grade ||= {});
      const me = meOf(ctx);
      const T = [
        { id: "scam", label: "Mettez les <b>2 messages frauduleux</b> dans les <b>🚫 Indésirables</b>." },
        { id: "promo", label: "<b>Supprimez</b> la publicité « SOLDES -70 % »." },
        { id: "claire", label: "<b>Répondez à Claire</b> : dites-lui que vous venez dimanche." },
        { id: "fw", label: `<b>Transférez</b> la convocation de la mairie à Claire (<span class="mono">${P.claire.email}</span>).` },
        { id: "doc", label: "Avec la <b>🔍 recherche</b>, retrouvez le message du <b>Dr Martin</b> : à quelle heure est votre rendez-vous ?" }
      ];

      if (step === 0) {
        const f = frame(ctx, { level: 7, title: "Le défi de la boîte mail", step: 0, noClient: true,
          consigne: "Votre boîte mail déborde ! Voici les tâches à accomplir, <b>dans l'ordre que vous voulez</b>. Prenez votre temps." });
        f.panel.innerHTML = tasksHTML(T) + `<button type="button" class="primary" data-go>Ouvrir ma boîte mail →</button>`;
        f.panel.querySelector("[data-go]").addEventListener("click", () => ctx.go(1));
        return;
      }

      if (step === 1) {
        L.done ||= {};
        const f = frame(ctx, { level: 7, title: "Le défi de la boîte mail", step: 1,
          consigne: "Accomplissez toutes les tâches de la liste.",
          help: "Pour un message frauduleux : ouvrez-le puis cliquez sur « 🚫 Indésirable ». Attention : ne cliquez sur aucun lien !" });
        const upd = () => {
          const all = T.every(t => L.done[t.id]);
          f.panel.innerHTML = tasksHTML(T.map(t => ({ ...t, done: L.done[t.id] }))) + `<div class="mk-q-slot"></div>
            <div class="final-actions">${all ? `<button type="button" class="primary" data-end>🏁 Voir ma note</button>` : `<button type="button" class="secondary" data-end>Terminer maintenant</button>`}</div>`;
          f.panel.querySelector("[data-end]").addEventListener("click", end);
        };
        const end = () => {
          T.forEach(t => { if (!L.done[t.id]) G.ko("todo_" + t.id, t.label.replace(/<[^>]+>/g, ""), "Tâche non terminée."); });
          finish(ctx, G, { key: "mail_challenge", label: "J'ai relevé le défi de la boîte mail", intro: "Trier, répondre, transférer, se protéger des arnaques, rechercher : vous gérez votre boîte mail comme un pro." });
        };
        const scamsCaught = () => L.client.mails.filter(m => m.scam && !m.live && m.folder === "spam").length;
        const checkScam = () => { if (scamsCaught() >= 2 && !L.done.scam) { L.done.scam = true; G.ok("scam", "Mettre les 2 arnaques dans les indésirables"); upd(); } };
        upd();
        L.client?.destroy();
        L.client = MAIL().client(f.host, { me, big: ctx.demo, features: { attach: false },
          mails: [...MAIL().fromMessages(ctx.api.state.messages || []), ...challengeMails()],
          onEvent: (type, d, c) => {
            const m = d?.mail || d;
            if (type === "link") {
              G.ko("link_" + (m?.id || ""), "Ne jamais cliquer sur un lien suspect", `Le lien menait vers ${d.url} : un faux site. On ne clique pas, on met le message dans les indésirables.`);
              c.flash(`⛔ Vous avez cliqué sur un lien frauduleux ! Il menait vers <b>${esc(d.url)}</b>. Dans la vraie vie, on ne clique pas : on signale le message comme indésirable.`, "bad", 7000);
            }
            if (type === "hover" && m?.scam) c.flash(`🔍 Bien vu : en survolant le lien, on voit en bas qu'il mène vers <b>${esc(d.url)}</b>, pas vers un site officiel.`, "info", 4000);
            if (type === "spam") {
              if (m.scam && m.live) { G.ok("live_" + m.id, "Repérer le piège envoyé par le formateur"); c.flash("🎯 Bien joué, vous avez aussi repéré le piège envoyé par votre formateur !", "good", 4000); }
              else if (m.scam) { c.flash("✅ Message frauduleux mis à l'écart.", "good", 2500); checkScam(); }
              else G.ko("spam_" + m.id, "Ne pas classer un vrai message en indésirable", `Le message de ${m.from.name} était un vrai message. Restaurez-le avec « ✅ Ce n'est pas un indésirable ».`);
            }
            if (type === "notspam") checkScam();
            if (type === "delete") {
              if (m.id === "d_promo") { L.done.promo = true; G.ok("promo", "Supprimer une publicité"); upd(); }
              else if (m.id === "d_mairie" || m.id === "d_doc") { G.ko("del_" + m.id, "Ne pas supprimer un message important", `Le message « ${m.subject} » était important. Allez le récupérer dans la Corbeille avec « ↩ Restaurer ».`); c.flash("⚠️ Ce message était important ! Il est dans la Corbeille : vous pouvez le restaurer.", "warn", 5000); }
              else if (m.scam) c.flash("Supprimer une arnaque, c'est bien. La mettre en « Indésirable », c'est encore mieux : les suivantes y iront toutes seules.", "info", 5000);
            }
            if (type === "send") {
              if (d.mode === "reply" && d.original === "d_claire") {
                L.done.claire = true;
                (/(oui|viens|serai|venir|ok|d'accord|avec plaisir|volontiers)/i.test(d.body.split("--- Message de")[0]) ? G.ok : G.ko)("claire", "Répondre à Claire", "Votre réponse ne disait pas clairement que vous venez dimanche.");
              } else if (d.mode === "forward" && d.original === "d_mairie") {
                L.done.fw = true;
                (hasAddr(d.to, P.claire.email) && d.attachments.length ? G.ok : G.ko)("fw", "Transférer la convocation à Claire, avec sa pièce jointe", `Il fallait l'adresse ${P.claire.email} et garder la convocation en pièce jointe.`);
              } else if (same(d.to, P.claire.email) && !L.done.claire && d.mode === "new") {
                c.flash("Le message est parti, mais pour répondre à Claire, il vaut mieux ouvrir son message et cliquer sur « ↩️ Répondre ».", "info", 5000);
              }
              upd();
            }
            if (type === "open" && m.id === "d_doc" && !L.done.doc) {
              const used = !!c.st.query;
              const slot = f.panel.querySelector(".mk-q-slot");
              inlineQuiz(slot, { G, key: "doc", questions: [
                { q: "À quelle heure est votre rendez-vous chez le Dr Martin ?", choices: ["Mardi à 9 h 30", "Jeudi à 10 h 20", "Samedi à 9 h"], ok: 1, why: "Le message du cabinet indique « jeudi à 10 h 20 ». (Mardi 9 h 30, c'est la mairie !)" }
              ], onDone: () => { L.done.doc = true; if (used) G.ok("search", "Utiliser la recherche"); else G.ko("search", "Utiliser la recherche", "Avec beaucoup de messages, la barre 🔍 Rechercher fait gagner du temps : tapez « Martin »."); upd(); } });
            }
          } });
        live(ctx, L.client);
        return;
      }
      ctx.finalScreen({ theme: null });
    }
  });

  /* =========================================================
     NIVEAU 6 — Repérer un e-mail frauduleux (méthode des 5 questions)
     Public inquiet : explications détaillées, ton rassurant,
     vrais ET faux messages pour apprendre à faire la différence.
     ========================================================= */
  const FIVE = ["🔍 Qui m'écrit vraiment ?", "🤔 Est-ce que je l'attendais ?", "⏰ Me met-on la pression ?", "🔑 Que me demande-t-on ?", "🔗 Où mène le lien ?"];
  const hostOf = u => (String(u).match(/^[a-z]+:\/\/([^/?#]+)/i) || [, u])[1];
  const realDomain = host => { const p = host.split("."); return p.slice(host.endsWith(".gouv.fr") ? -3 : -2).join("."); };
  function urlAnatomy(u) {
    const proto = (u.match(/^[a-z]+:\/\//i) || [""])[0], host = hostOf(u), rest = u.slice(proto.length + host.length);
    const dom = realDomain(host);
    let pre = host.slice(0, host.length - dom.length), www = "";
    if (pre.startsWith("www.")) { www = "www."; pre = pre.slice(4); } // « www. » est normal, pas un déguisement
    return `<span class="url-anat"><span class="dim">${esc(proto + www)}</span>${pre ? `<span class="pre" title="déguisement">${esc(pre)}</span>` : ""}<span class="dom">${esc(dom)}</span><span class="dim">${esc(rest)}</span></span>`;
  }
  const addrAnatomy = email => { const [user, dom] = String(email).split("@"); return `<span class="url-anat"><span class="dim">${esc(user)}@</span><span class="dom">${esc(dom)}</span></span>`; };

  const SENDERS = [
    { name: "Impôts", email: "ne-pas-repondre@impots.gouv.fr", ok: true, why: "Après le @ : impots.gouv.fr. La fin « .gouv.fr » est réservée aux services de l'État." },
    { name: "Assurance Maladie", email: "remboursement@ameli-securite.info", ok: false, why: "Après le @ : ameli-securite.info. Le vrai site de l'Assurance Maladie est ameli.fr : ici, on a ajouté « -securite » et la fin est .info." },
    { name: "Médiathèque de Valbourg", email: "mediatheque@valbourg.fr", ok: true, why: "C'est l'adresse habituelle de votre médiathèque, celle qui vous écrit d'habitude." },
    { name: "Impots.gouv", email: "impots.service.client@gmail.com", ok: false, why: "Une administration n'écrit jamais depuis une adresse Gmail, Hotmail, Orange ou Free. Le nom « Impots.gouv » n'est qu'un costume." },
    { name: "La Poste", email: "suivi@laposte-colis-livraison.top", ok: false, why: "Après le @ : laposte-colis-livraison.top. Le mot « laposte » est noyé dans un autre nom, qui finit par .top : ce n'est pas La Poste." },
    { name: "Banque du Valbourg", email: "service@banque-valbourg.fr.securite-client.com", ok: false, why: "Piège : ce qui compte, c'est la FIN de l'adresse : securite-client.com. Le début « banque-valbourg.fr » n'est qu'un déguisement." }
  ];
  const LINKS = [
    { u: "https://www.impots.gouv.fr/accueil", ok: true, why: "Le vrai nom, juste avant le premier « / », est impots.gouv.fr : c'est le site officiel." },
    { u: "https://impots.gouv.fr.remboursement-dossier.com/accueil", ok: false, why: "Le début « impots.gouv.fr. » est un déguisement. Le vrai nom, à la fin, est remboursement-dossier.com." },
    { u: "https://www.ameli.fr/assure", ok: true, why: "Le vrai nom est ameli.fr : c'est le site de l'Assurance Maladie." },
    { u: "http://ameli-carte-vitale.info/renouvellement", ok: false, why: "Le vrai nom est ameli-carte-vitale.info, pas ameli.fr. Les mots « ameli » et « carte vitale » servent à vous mettre en confiance." },
    { u: "https://antai-paiement-amende.com/payer", ok: false, why: "Le seul site officiel des amendes est antai.gouv.fr. Le cadenas « https » ne prouve rien." },
    { u: "https://www.antai.gouv.fr", ok: true, why: "antai.gouv.fr est bien le site officiel des amendes (.gouv.fr)." },
    { u: "https://www.impots-gouv.fr/connexion", ok: false, why: "Regardez bien : un tiret remplace le point. impots-gouv.fr n'est pas impots.gouv.fr." }
  ];
  function fraudMails(ctx) {
    const link = (url, txt) => `<p><a href="#" class="mk-link" data-url="${url}">${txt}</a></p>`;
    return [
      { id: "f_impots", from: { name: "Impots.gouv", email: "remboursement@impots-gouv-fr.info" }, subject: "Remboursement de 248,60 € en attente – dernier délai", date: "Aujourd'hui 07:41", unread: true, fraud: true,
        context: "Vous n'avez fait aucune demande de remboursement.",
        body: `<p>Cher contribuable,</p><p>Après un dernier calcul de vos impôts, vous avez droit à un remboursement de <b>248,60 €</b>.</p><p>Pour le recevoir, confirmez vos coordonnées bancaires <b>sous 48 heures</b>. Passé ce délai, le remboursement sera définitivement annulé.</p>${link("http://impots-gouv-fr.info/remboursement/carte", "Recevoir mon remboursement")}<p>Direction Générale des Finances Publiques</p>`,
        checks: [[1, "L'adresse finit par impots-gouv-fr.info : ce n'est pas « .gouv.fr ». Le nom « Impots.gouv » n'est qu'un costume."],
          [1, "Vous n'avez rien demandé. Un vrai remboursement d'impôt arrive tout seul sur votre compte bancaire, sans rien saisir."],
          [1, "« Sous 48 heures », « définitivement annulé » : on vous presse pour vous empêcher de réfléchir."],
          [1, "On vous demande vos coordonnées bancaires : les impôts ne le demandent jamais par e-mail."],
          [1, "En survolant le bouton, on lit impots-gouv-fr.info : ce n'est pas impots.gouv.fr."]] },
      { id: "r_impots", from: { name: "Impôts", email: "ne-pas-repondre@impots.gouv.fr" }, subject: "Votre avis d'impôt est disponible", date: "Hier 10:02", unread: true, fraud: false,
        context: "Comme chaque année à cette période, vous attendez votre avis d'impôt.",
        body: `<p>Bonjour ${esc(ctx.name)},</p><p>Votre avis d'impôt sur le revenu est disponible dans votre espace particulier.</p><p>Pour le consulter, connectez-vous sur impots.gouv.fr, rubrique « Documents ».</p><p>Ceci est un message automatique, merci de ne pas y répondre.</p>`,
        checks: [[0, "impots.gouv.fr : la fin « .gouv.fr » est réservée à l'État."], [0, "Vous attendiez ce document : c'est la bonne période."], [0, "Aucune urgence, aucune menace."], [0, "On ne vous demande rien : ni code, ni carte, ni paiement."], [0, "Pas de bouton : on vous invite à aller vous-même sur le site. C'est le bon réflexe."]] },
      { id: "f_colis", from: { name: "Service Livraison", email: "notification@suivi-colis-express.top" }, subject: "Votre colis n'a pas pu être livré", date: "Hier 18:20", unread: true, fraud: true,
        context: "Vous n'attendez aucun colis.",
        body: `<p>Bonjour,</p><p>Votre colis n° FR8812645 n'a pas pu être livré : l'adresse est incomplète.</p><p>Pour programmer une nouvelle livraison, réglez les frais de <b>1,99 €</b> avant demain.</p>${link("https://suivi-colis-express.top/frais-livraison", "Programmer la livraison")}`,
        checks: [[1, "suivi-colis-express.top n'est le site d'aucun transporteur connu."], [1, "Vous n'avez rien commandé : pourquoi un colis ?"], [1, "« Avant demain » : encore de l'urgence."], [1, "Un petit montant (1,99 €) pour paraître sans risque : le vrai but est de voler votre numéro de carte."], [1, "Le lien a un cadenas (https), mais le nom du site est suivi-colis-express.top : le cadenas ne prouve rien."]] },
      { id: "r_pharma", from: P.pharma, subject: "Votre commande est prête", date: "Lun. 08:30", unread: true, fraud: false,
        context: "Vous avez commandé un médicament à votre pharmacie avant-hier.",
        body: "<p>Bonjour,</p><p>Votre commande est disponible. Vous pouvez venir la récupérer aux heures d'ouverture.</p><p>Pharmacie du Centre</p>",
        checks: [[0, "C'est l'adresse de votre pharmacie."], [0, "Vous avez passé commande : vous attendiez ce message."], [0, "Aucune pression."], [0, "On ne vous demande rien."], [0, "Aucun lien."]] },
      { id: "f_banque", from: { name: "Banque du Valbourg", email: "securite@banque-valbourg-alerte.com" }, subject: "⚠ Activité inhabituelle : votre compte sera suspendu", date: "Lun. 06:12", unread: true, fraud: true,
        context: "Votre banque est la Banque du Valbourg. Ses messages viennent d'une adresse qui finit par @banque-valbourg.fr",
        body: `<p>Cher(e) client(e),</p><p>Nous avons détecté une activité inhabituelle sur votre compte. Par sécurité, il sera <b>suspendu aujourd'hui</b>.</p><p>Pour l'éviter, confirmez votre identité : identifiant, mot de passe et <b>le code que vous allez recevoir par SMS</b>.</p>${link("http://banque-valbourg-alerte.com/verification", "Confirmer mon identité")}`,
        checks: [[1, "L'adresse habituelle de votre banque finit par banque-valbourg.fr. Ici : banque-valbourg-alerte.com."], [1, "Vous n'avez rien fait d'inhabituel."], [1, "« Suspendu aujourd'hui » : la peur et l'urgence."], [1, "On demande votre mot de passe ET le code SMS. C'est exactement ce qu'une banque ne demande JAMAIS : avec ce code, l'escroc valide un paiement à votre place."], [1, "Le lien mène vers banque-valbourg-alerte.com, pas vers votre banque."]] },
      { id: "r_media", from: P.media, subject: "Rappel : vos livres sont à rendre samedi", date: "Dim. 09:00", unread: true, fraud: false,
        context: "Vous avez emprunté 3 livres il y a 3 semaines.",
        body: `<p>Bonjour ${esc(ctx.name)},</p><p>Vos 3 livres sont à rendre avant samedi. Vous pouvez aussi les prolonger à l'accueil de la médiathèque.</p><p>Bonne lecture !<br>L'équipe de la médiathèque</p>`,
        checks: [[0, "C'est l'adresse habituelle de la médiathèque."], [0, "Vous avez bien emprunté des livres."], [0, "Un simple rappel, sans menace."], [0, "On ne vous demande rien de secret."], [0, "Aucun lien."]] },
      ...ctx.byLevel({ beginner: [], intermediate: [1], expert: [1] }).map(() => (
        { id: "f_amende", from: { name: "ANTAI", email: "avis@antai-paiement-amende.com" }, subject: "Avis de contravention impayée", date: "Sam. 19:44", unread: true, fraud: true,
          context: "Vous n'avez reçu aucune amende par courrier.",
          body: `<p>Madame, Monsieur,</p><p>Sauf erreur de notre part, votre amende de <b>35 €</b> reste impayée. Sans règlement <b>sous 24 h</b>, elle sera majorée à 135 €.</p>${link("https://antai-paiement-amende.com/payer", "Payer mon amende")}`,
          checks: [[1, "Le site officiel des amendes est antai.gouv.fr. Ici : antai-paiement-amende.com."], [1, "Vous n'avez reçu aucune amende par courrier."], [1, "« Sous 24 h », « majorée » : la peur de payer plus."], [1, "On vous demande de payer par un lien."], [1, "Le lien mène vers antai-paiement-amende.com."]] }))
    ];
  }
  function investigation(m, ok) {
    return `<div class="fiche ${m.fraud ? "fraud" : "safe"}">
      <div class="fiche-head">${ok ? "✅ Bonne réponse !" : "Pas tout à fait…"} Ce message est <b>${m.fraud ? "🚩 une ARNAQUE" : "✅ NORMAL"}</b>.</div>
      <table class="fiche-table"><tbody>${m.checks.map(([flag, txt], i) => `<tr class="${flag ? "flag" : "ok"}"><th>${FIVE[i]}</th><td><span aria-hidden="true">${flag ? "🚩" : "✅"}</span> ${esc(txt)}</td></tr>`).join("")}</tbody></table>
      <div class="fiche-do">${m.fraud ? "👉 <b>Le bon geste :</b> ne pas cliquer, puis ranger ce message avec le bouton <b>🚫 Indésirable</b> (au-dessus du message)." : "👉 Vous pouvez le garder en toute tranquillité. Et même pour un vrai message, on peut toujours aller soi-même sur le site plutôt que cliquer."}</div></div>`;
  }

  R("mail_fraud", {
    steps: 4,
    render(ctx) {
      const step = ctx.m.step || 0, L = ctx.local;
      const G = MAIL().grader(L.grade ||= {});
      const me = meOf(ctx);
      const reassure = `<div class="mk-reassure">🫶 Rappel : <b>lire un message est sans danger.</b> Ici, tout est fictif : vous pouvez vous tromper sans risque.</div>`;

      if (step === 0) {
        const list = ctx.byLevel({ beginner: SENDERS.slice(0, 4), intermediate: SENDERS.slice(0, 5), expert: SENDERS });
        L.s ||= {};
        const f = frame(ctx, { level: 6, title: "Qui m'écrit vraiment ? 🔍", step: 0, noClient: true,
          consigne: "Le nom affiché peut être un <b>costume</b>. Pour chaque expéditeur, cliquez sur « 👁 Voir l'adresse », puis dites si c'est <b>fiable</b> ou <b>suspect</b>.",
          help: "Regardez ce qui est écrit APRÈS le @, et surtout la fin. « .gouv.fr » = l'État. Gmail, Hotmail… = jamais une administration." });
        const draw = () => {
          f.panel.innerHTML = reassure + `<div class="sender-grid">${list.map((x, i) => {
            const st = L.s[i] || {};
            return `<div class="sender-card ${st.answered != null ? (st.answered === x.ok ? "right" : "wrong") + (x.ok ? " is-ok" : " is-trap") : ""}">
              <div class="sender-from">De : <b>${esc(x.name)}</b></div>
              ${st.shown ? `<div class="sender-addr">${addrAnatomy(x.email)}</div>` : `<button type="button" class="secondary" data-show="${i}">👁 Voir l'adresse</button>`}
              ${st.shown && st.answered == null ? `<div class="sender-btns"><button type="button" class="secondary" data-i="${i}" data-v="1">✅ Fiable</button><button type="button" class="secondary" data-i="${i}" data-v="0">🚩 Suspect</button></div>` : ""}
              ${st.answered != null ? `<p class="sender-why"><b>${x.ok ? "✅ Fiable" : "🚩 Suspect"}.</b> ${esc(x.why)}</p>` : ""}</div>`;
          }).join("")}</div>
          ${list.every((_, i) => L.s[i]?.answered != null) ? `<button type="button" class="primary" data-next>Étape suivante : les liens →</button>` : ""}`;
          f.panel.querySelectorAll("[data-show]").forEach(b => b.addEventListener("click", () => { (L.s[b.dataset.show] ||= {}).shown = true; draw(); }));
          f.panel.querySelectorAll("[data-v]").forEach(b => b.addEventListener("click", () => {
            const i = Number(b.dataset.i), v = b.dataset.v === "1", x = list[i];
            L.s[i].answered = v;
            (v === x.ok ? G.ok : G.ko)("snd_" + i, `${x.name} <${x.email}> était ${x.ok ? "fiable" : "suspect"}`, x.why);
            draw();
          }));
          f.panel.querySelector("[data-next]")?.addEventListener("click", () => ctx.go(1));
        };
        draw();
        return;
      }

      if (step === 1) {
        const list = ctx.byLevel({ beginner: LINKS.slice(0, 5), intermediate: LINKS.slice(0, 6), expert: LINKS });
        L.l ||= {};
        const f = frame(ctx, { level: 6, title: "Où mène ce lien ? 🔗", step: 1, noClient: true,
          consigne: "Le vrai nom d'un site se trouve <b>juste avant le premier « / »</b>. C'est la <b>fin</b> de ce nom qui compte : le début peut être un déguisement. Pour chaque lien : site officiel ou piège ?",
          help: "Exemple : dans https://www.impots.gouv.fr/accueil, le vrai nom est impots.gouv.fr." });
        const draw = () => {
          f.panel.innerHTML = `<div class="url-demo">Exemple : ${urlAnatomy("https://www.impots.gouv.fr/accueil")} <small>→ en vert : le vrai nom du site</small></div>
            <div class="addr-check">${list.map((x, i) => {
              const a = L.l[i];
              return `<div class="addr-row ${a != null ? (a === x.ok ? "right" : "wrong") + (x.ok ? " is-ok" : " is-trap") : ""}">${a != null ? urlAnatomy(x.u) : `<code>${esc(x.u)}</code>`}
                <span>${a == null ? `<button type="button" class="secondary" data-i="${i}" data-v="1">✅ Officiel</button><button type="button" class="secondary" data-i="${i}" data-v="0">🚩 Piège</button>` : `<b>${a === x.ok ? "✅" : "❌"} ${x.ok ? "Officiel" : "Piège"}</b>`}</span>
                ${a != null ? `<small>${esc(x.why)}</small>` : ""}</div>`;
            }).join("")}</div>
            ${Object.keys(L.l).length === list.length ? `<button type="button" class="primary" data-next>Étape suivante : l'enquête →</button>` : ""}`;
          f.panel.querySelectorAll("[data-v]").forEach(b => b.addEventListener("click", () => {
            const i = Number(b.dataset.i), v = b.dataset.v === "1", x = list[i];
            L.l[i] = v;
            (v === x.ok ? G.ok : G.ko)("url_" + i, `${x.u} était ${x.ok ? "le site officiel" : "un piège"}`, x.why);
            draw();
          }));
          f.panel.querySelector("[data-next]")?.addEventListener("click", () => ctx.go(2));
        };
        draw();
        return;
      }

      if (step === 2) {
        L.mails ||= fraudMails(ctx);
        L.dec ||= {};
        const f = frame(ctx, { level: 6, title: "L'enquête dans la boîte mail 🕵️", step: 2,
          consigne: "Ouvrez <b>chaque message</b>, posez-vous les 5 questions, puis décidez : <b>normal</b> ou <b>arnaque</b> ? Une fiche d'enquête vous expliquera tout.",
          help: "Cliquez sur « ▾ voir l'adresse » à côté du nom. Posez la souris sur les boutons SANS cliquer pour voir où ils mènent (en bas de la boîte)." });
        const total = L.mails.length;
        const panelFor = m => {
          const done = Object.keys(L.dec).length;
          const head = `<div class="mk-progress-line">🕵️ ${done} / ${total} messages analysés</div>`;
          if (!m) {
            f.panel.innerHTML = head + `<p>👈 Cliquez sur un message de la liste pour l'ouvrir.</p>` + (done === total ? `<button type="button" class="primary" data-next>J'ai tout analysé →</button>` : "");
          } else if (L.dec[m.id] == null) {
            f.panel.innerHTML = head + `<div class="mk-context">📌 <b>Ce que vous savez :</b> ${esc(m.context)}</div>
              <div class="five-mini">${FIVE.map(q => `<span>${q}</span>`).join("")}</div>
              <h3>Ce message « ${esc(m.subject)} » est…</h3>
              <div class="sender-btns big"><button type="button" class="secondary" data-d="0">✅ Normal</button><button type="button" class="secondary" data-d="1">🚩 Une arnaque</button></div>`;
          } else {
            f.panel.innerHTML = head + investigation(m, L.dec[m.id] === m.fraud) + (done === total ? `<button type="button" class="primary" data-next>J'ai tout analysé →</button>` : `<p class="muted">Ouvrez le message suivant dans la liste.</p>`);
          }
          f.panel.querySelectorAll("[data-d]").forEach(b => b.addEventListener("click", () => {
            const v = b.dataset.d === "1";
            L.dec[m.id] = v;
            (v === m.fraud ? G.ok : G.ko)("dec_" + m.id, `« ${m.subject} » était ${m.fraud ? "une arnaque" : "un message normal"}`, m.fraud ? "C'était une arnaque : relisez sa fiche d'enquête." : "C'était un vrai message : tous les signaux étaient rassurants.");
            panelFor(m);
          }));
          f.panel.querySelector("[data-next]")?.addEventListener("click", endStep);
        };
        const endStep = () => {
          L.mails.filter(x => x.fraud).forEach(x => {
            if (L.client.byId(x.id)?.folder !== "spam") G.ko("spam_" + x.id, `Ranger « ${x.subject} » dans les Indésirables`, "Le bon geste après avoir repéré une arnaque : le bouton 🚫 Indésirable. Les suivantes iront directement au bon endroit.");
          });
          ctx.go(3);
        };
        L.client?.destroy();
        L.client = MAIL().client(f.host, { me, big: ctx.demo, hideAddr: true, mails: L.mails, features: { compose: false, reply: false, replyAll: false, forward: false, attach: false, search: false },
          onEvent: (type, d, c) => {
            const m = d?.mail || d;
            if (type === "open") panelFor(d.mail);
            if (type === "hover" && m) c.flash(`🔍 Ce lien mène vers <b>${esc(realDomain(hostOf(d.url)))}</b> (regardez en bas de la boîte).`, m.fraud ? "warn" : "info", 4000);
            if (type === "link") {
              if (m.fraud) { G.ko("click_" + m.id, "Ne pas cliquer sur le lien d'un message suspect", "Dans la vraie vie, si cela arrive : fermez la page sans rien remplir. En général, il ne s'est rien passé."); c.flash("Oups, vous avez cliqué ! Pas de panique : ici rien ne s'est passé. Dans la vraie vie, on ferme simplement la page <b>sans rien remplir</b>. La prochaine fois : on survole sans cliquer.", "warn", 8000); }
              else c.flash("Ce lien était sûr. Mais le meilleur réflexe reste de taper soi-même l'adresse du site.", "info", 5000);
            }
            if (type === "spam") {
              if (m.fraud) { G.ok("spam_" + m.id, `Ranger « ${m.subject} » dans les Indésirables`); c.flash("🚫 Bien rangé ! Les messages de cet expéditeur iront désormais dans les Indésirables.", "good", 3500); }
              else { G.ko("spam_" + m.id, "Ne pas ranger un vrai message en indésirable", `« ${m.subject} » était un vrai message. Dans le dossier Indésirables, ouvrez-le puis cliquez sur « ✅ Ce n'est pas un indésirable ».`); c.flash("Ce message était normal ! Allez le récupérer dans 🚫 Indésirables.", "warn", 5000); }
              panelFor(null);
            }
            if (type === "delete" && m.fraud) c.flash("Supprimé, c'est bien. « 🚫 Indésirable » est encore mieux : il apprend à trier tout seul.", "info", 4500);
          } });
        panelFor(null);
        return;
      }

      if (step === 3) {
        const f = frame(ctx, { level: 6, title: "Et si… ? 🆘", step: 3, noClient: true,
          consigne: "Les situations qui font peur, et quoi faire calmement. Se faire piéger n'est pas une honte : ces escrocs sont des professionnels." });
        inlineQuiz(f.panel, { G, key: "etsi", questions: [
          { q: "Vous avez cliqué sur le lien d'un faux message, mais vous n'avez <b>rien rempli</b>. Que faites-vous ?", choices: ["Je ferme la page et je supprime le message", "J'éteins l'ordinateur et je ne m'en sers plus", "Je remplis quand même, pour voir"], ok: 0, why: "En général, il ne s'est rien passé : le danger, c'est de remplir. On ferme la page, on garde son ordinateur à jour, et on continue sa journée." },
          { q: "Vous avez donné votre <b>numéro de carte bancaire</b> sur un faux site.", choices: ["J'attends de voir mon prochain relevé", "J'appelle ma banque tout de suite pour bloquer la carte", "Je réponds à l'e-mail pour annuler"], ok: 1, why: "Le numéro de la banque est au dos de la carte. Plus on bloque vite, moins l'escroc peut l'utiliser." },
          { q: "Un message dit : « On vous a filmé avec votre webcam. Payez 500 €, sinon on publie la vidéo. »", choices: ["Je paie pour être tranquille", "C'est un mensonge envoyé à des milliers de personnes : je ne réponds pas, je supprime", "Je réponds pour négocier"], ok: 1, why: "Ce chantage est envoyé au hasard, en masse : il n'y a pas de vidéo. Ne payez jamais. Si vous êtes inquiet, parlez-en à une personne de confiance ou consultez cybermalveillance.gouv.fr." },
          { q: "Vous n'êtes <b>pas sûr</b> qu'un message soit vrai. Que faites-vous ?", choices: ["Je clique pour vérifier", "Je vais moi-même sur le site officiel, ou j'appelle le numéro que je connais", "Je le transfère à tous mes contacts pour leur demander"], ok: 1, why: "Vérifier par soi-même, c'est la règle d'or. Et vous pouvez toujours demander au médiateur numérique de la médiathèque." },
          ...ctx.byLevel({ beginner: [], intermediate: [], expert: [
            { q: "Vous avez tapé votre <b>mot de passe</b> sur un faux site.", choices: ["Je le change tout de suite, sur le vrai site", "Ce n'est pas grave", "J'attends un e-mail de confirmation"], ok: 0, why: "Changez-le sur le vrai site, et partout où vous utilisiez le même mot de passe." }
          ] })
        ], onDone: () => finish(ctx, G, { key: "mail_fraud", label: "Je sais repérer un e-mail frauduleux avec les 5 questions",
          intro: "Vous avez maintenant une méthode : les 5 questions. 🫶 Dans le doute, vous avez toujours le droit de ne rien faire et de vérifier par vous-même. Imprimez votre fiche-mémo et gardez-la près de l'ordinateur." }) });
        return;
      }
      ctx.finalScreen({ theme: null });
    }
  });
  AN.missionKit = { frame, tasksHTML, inlineQuiz, finish };
})(window.AN);

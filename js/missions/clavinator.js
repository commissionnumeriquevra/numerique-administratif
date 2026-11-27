/* =========================================================
   Exercices « Clavinator » de niveau intermédiaire, en missions.
   Quatre missions, chacune notée sur /20 comme les autres niveaux :
   cv_lire (séance 5, lire avant d'agir : les pièges)
   cv_accents (séances 3 et 5, circonflexe et mots accentués)
   cv_corrections (séances 4 et 5, corriger avec Backspace, Suppr, flèches, souris)
   cv_dictees (séance 5, dictée avec accents et majuscules)
   Principe : on ne s'arrête pas après une erreur, et chaque erreur
   reçoit un petit rappel bienveillant. Rien n'est envoyé.
   ========================================================= */
(function (AN) {
  "use strict";
  const R = AN.missions.register;
  const { kindly, good } = AN.scKit;
  const grader = L => AN.mail.grader(L.grade ||= {});
  const frame = (ctx, o) => AN.missionKit.frame(ctx, o);
  const alive = ctx => ctx.box.isConnected && ctx.box.__an?.ctx === ctx;
  const finish = (ctx, G, o) => { if (alive(ctx)) return AN.missionKit.finish(ctx, G, o); };
  const nfc = s => String(s).normalize("NFC").trim();
  const noAcc = s => nfc(s).normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();

  /* Moteur commun : une série de réponses, un champ, trois essais max,
     première réponse notée. Chaque round : { prompt, ok(v), help, key, label,
     show (réponse attendue, affichée après trois essais), visual?, init? } */
  function runRounds(ctx, o) {
    const L = ctx.local, G = grader(L);
    if ((ctx.m.step || 0) > 0) return ctx.finalScreen({ theme: null });
    const f = frame(ctx, { chapter: o.chapter, level: 2, title: o.title, step: 0, noClient: true,
      consigne: o.consigne, help: o.help });
    f.panel.innerHTML = `<div class="cm-prompt-box"></div><div class="cm-dic"></div><div class="mk-fb"></div>`;
    const box = f.panel.querySelector(".cm-prompt-box"), dic = f.panel.querySelector(".cm-dic"), fb = f.panel.querySelector(".mk-fb");
    const rounds = o.rounds, n = rounds.length;
    let i = 0, tries = 0, first = null, active = false;

    const show = () => {
      const r = rounds[i];
      tries = 0; first = null; active = true; fb.innerHTML = "";
      box.innerHTML = `<div class="cm-num">Exercice ${i + 1} / ${n}</div>` +
        (r.visual ? `<div class="cv-dot" style="display:block;width:28px;height:28px;border-radius:50%;margin:0 0 10px;background:${r.visual}" aria-hidden="true"></div>` : "") +
        `<div class="cm-model">${r.prompt}</div>`;
      dic.innerHTML = `<label class="cm-lab">Votre réponse<input type="text" class="cm-in" autocomplete="off" spellcheck="false" autocapitalize="off" maxlength="${r.max || 60}"></label>
        <div class="cm-acts"><button type="button" class="primary" data-check>Vérifier</button></div>`;
      const input = dic.querySelector("input");
      input.focus();
      if (r.init) r.init(input);

      const done = msg => {
        active = false; input.disabled = true;
        dic.querySelector(".cm-acts").innerHTML = `<button type="button" class="primary" data-next>${i + 1 < n ? "Suivant →" : "Terminer →"}</button>`;
        dic.querySelector("[data-next]").addEventListener("click", () => { i++; if (i < n) show(); else end(); });
        fb.innerHTML = msg;
      };
      const check = () => {
        if (!active) return;
        const v = input.value;
        if (!v.trim() && !r.init) return;
        tries++;
        const ok = r.ok(v);
        if (first === null) {
          first = ok;
          (ok ? G.ok : G.ko)(r.key, r.label, ok ? "" : r.help);
        }
        if (ok) return done(good("✅ Bravo, c'est exact !"));
        if (tries >= 3) return done(kindly(`${r.help} La réponse attendue était : <b>${esc(r.show)}</b>. On passe à la suite.`));
        fb.innerHTML = kindly(`${r.help} Essayez encore (${3 - tries} essai${3 - tries > 1 ? "s" : ""}).`);
      };
      dic.querySelector("[data-check]").addEventListener("click", check);
      input.addEventListener("keydown", e => { if (e.key === "Enter") { e.preventDefault(); check(); } });
    };
    function end() {
      dic.innerHTML = `<div class="cm-msg">🎉 Exercices terminés.</div>`;
      finish(ctx, G, o.finish);
    }
    show();
  }
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  /* =========================================================
     SÉANCE 5 — « Lire avant d'agir : les pièges »
     ========================================================= */
  const LECTURE = [
    { prompt: "Tapez la lettre <b>z</b>. <em>Ne tapez pas la lettre p.</em>", expected: "z" },
    { prompt: "<b>Si le rond est ORANGE</b>, tapez <b>m</b>.<br><b>Si le rond est VERT</b>, tapez <b>l</b>.", expected: "m", visual: "#d97706" },
    { prompt: "Tapez la <b>première lettre</b> du mot <b>fromage</b>, puis la <b>dernière lettre</b> du mot <b>pain</b>.", expected: "fn" },
    { prompt: "<b>Si le rond est ROUGE</b>, tapez <b>a</b>.<br><b>SINON</b>, tapez <b>o</b>.", expected: "o", visual: "#166534" },
    { prompt: "<em>Ne tapez pas la lettre e.</em><br>Tapez plutôt la lettre <b>u</b>.", expected: "u" },
    { prompt: "Tapez <b>trois fois</b> la lettre <b>k</b>.", expected: "kkk" },
    { prompt: "Tapez la <b>deuxième lettre</b> du mot <b>jardin</b>.", expected: "a" },
    { prompt: "Tapez la <b>lettre du milieu</b> du mot <b>voiture</b>.", expected: "t" }
  ];

  R("cv_lire", {
    steps: 1,
    render(ctx) {
      runRounds(ctx, {
        chapter: "Clavinator · séance 5", title: "Lire avant d'agir : les pièges",
        consigne: "Lisez <b>chaque consigne en entier</b>, puis tapez exactement ce qui est demandé. Un mot « PAS », « SINON », une couleur ou un ordre peut tout changer.",
        help: "Relisez la consigne en entier, deux fois si besoin.",
        rounds: LECTURE.map((r, k) => ({
          prompt: r.prompt, visual: r.visual, show: r.expected, key: `cv_lec_${k}`,
          label: `Consigne : « ${r.prompt.replace(/<br>/g, " ").replace(/<[^>]+>/g, "")} »`,
          help: "Pas tout à fait. Relisez la consigne en entier : un piège se cache peut-être dans un mot.",
          ok: v => nfc(v) === r.expected
        })),
        finish: { key: "cv_lire", label: "Je lis chaque consigne en entier avant d'agir", intro: "Lire en entier, repérer les pièges (PAS, SINON, couleur, ordre), puis agir : c'est la règle n°1." }
      });
    }
  });

  /* =========================================================
     SÉANCES 3 ET 5 — « Accents : le circonflexe et les mots accentués »
     ========================================================= */
  const ACCENTS = [
    { t: "Tapez la lettre <b>â</b>", target: "â", help: "Appuyez sur <kbd>^</kbd> et lâchez (rien ne s'affiche, c'est normal), puis sur <kbd>a</kbd>." },
    { t: "Tapez la lettre <b>ê</b>", target: "ê", help: "Appuyez sur <kbd>^</kbd>, puis sur <kbd>e</kbd>." },
    { t: "Tapez la lettre <b>î</b>", target: "î", help: "Appuyez sur <kbd>^</kbd>, puis sur <kbd>i</kbd>." },
    { t: "Tapez la lettre <b>ô</b>", target: "ô", help: "Appuyez sur <kbd>^</kbd>, puis sur <kbd>o</kbd>." },
    { t: "Tapez la lettre <b>û</b>", target: "û", help: "Appuyez sur <kbd>^</kbd>, puis sur <kbd>u</kbd>." },
    { t: "Tapez le mot <b>chèvre</b>", target: "chèvre", help: "« è » = la touche <kbd>7</kbd>, sans Maj." },
    { t: "Tapez le mot <b>rêve</b>", target: "rêve", help: "« ê » = <kbd>^</kbd> puis <kbd>e</kbd>." },
    { t: "Tapez le mot <b>hôpital</b>", target: "hôpital", help: "« ô » = <kbd>^</kbd> puis <kbd>o</kbd>." },
    { t: "Tapez le mot <b>mûr</b>", target: "mûr", help: "« û » = <kbd>^</kbd> puis <kbd>u</kbd>." }
  ];

  R("cv_accents", {
    steps: 1,
    render(ctx) {
      runRounds(ctx, {
        chapter: "Clavinator · séances 3 et 5", title: "Le circonflexe et les mots accentués",
        consigne: "Tapez exactement la lettre ou le mot demandé, <b>avec son accent</b>. Pour le circonflexe, appuyez sur <b>^</b> d'abord, puis sur la voyelle.",
        help: "Accent circonflexe : ^ puis la voyelle. Les accents comptent : « mur » et « mûr » ne sont pas pareils.",
        rounds: ACCENTS.map((a, k) => ({
          prompt: a.t, show: a.target, key: `cv_acc_${k}`, label: `Taper « ${a.target} »`,
          help: a.help, max: 12,
          ok: v => nfc(v) === a.target
        })),
        finish: { key: "cv_accents", label: "Je tape le circonflexe et les mots accentués", intro: "Le circonflexe s'écrit en deux temps : ^ puis la voyelle. Les accents font partie du mot." }
      });
    }
  });

  /* =========================================================
     SÉANCES 4 ET 5 — « Corriger ses erreurs »
     Le champ démarre avec une faute ; le curseur est placé comme
     dans l'exercice d'origine. On corrige, on ne retape pas tout.
     ========================================================= */
  const CORR = [
    { initial: "loupz", target: "loup", at: "end", help: "Le curseur est à la fin. Appuyez sur ⌫ Effacer (Backspace) pour effacer la dernière lettre." },
    { initial: "xarbre", target: "arbre", at: "start", help: "Le curseur est au début. Appuyez sur Suppr pour effacer la lettre à droite du curseur." },
    { initial: "chevalxx", target: "cheval", at: "end", help: "Le curseur est à la fin. Appuyez deux fois sur ⌫ Effacer (Backspace)." },
    { initial: "maixson", target: "maison", at: "end", help: "Placez le curseur juste après le x (flèches ← → ou un clic), puis appuyez sur ⌫ Effacer." },
    { initial: "ztortue", target: "tortue", at: "end", help: "Cliquez entre le z et le t pour placer le curseur, puis appuyez sur ⌫ Effacer (Backspace) pour effacer le z." }
  ];

  R("cv_corrections", {
    steps: 1,
    render(ctx) {
      runRounds(ctx, {
        chapter: "Clavinator · séances 4 et 5", title: "Corriger sans tout retaper",
        consigne: "Le mot contient une faute de frappe. <b>Corrigez-le</b> sans le retaper entièrement : <b>⌫ Effacer</b> (Backspace) efface à gauche du curseur, <b>Suppr</b> efface à droite, les flèches ← → déplacent le curseur.",
        help: "⌫ Effacer et Suppr ne font pas la même chose. Regardez où est le curseur avant d'appuyer.",
        rounds: CORR.map((c, k) => ({
          prompt: `Corrigez <b>${esc(c.initial)}</b> pour obtenir <b>${esc(c.target)}</b>`,
          show: c.target, key: `cv_cor_${k}`, label: `Corriger « ${c.initial} » en « ${c.target} »`,
          help: c.help, max: 20,
          init: input => {
            input.value = c.initial;
            const pos = c.at === "start" ? 0 : c.initial.length;
            input.setSelectionRange(pos, pos);
          },
          ok: v => nfc(v) === c.target
        })),
        finish: { key: "cv_corrections", label: "Je corrige mes erreurs avec ⌫ Effacer, Suppr et les flèches", intro: "Repérer la faute, placer le curseur, effacer avec la bonne touche : corriger ne demande pas de tout retaper." }
      });
    }
  });

  /* =========================================================
     SÉANCE 5 — « La dictée »
     ========================================================= */
  const DICTEE = [
    { t: "Il fait beau", help: "Commencez par une majuscule. Trois mots séparés par des espaces." },
    { t: "Le chat noir dort", help: "Quatre mots. Une majuscule au début seulement." },
    { t: "Très bientôt", help: "« è » = la touche 7, sans Maj. « ô » = <kbd>^</kbd> puis <kbd>o</kbd>." },
    { t: "La fenêtre est ouverte", help: "« ê » = <kbd>^</kbd> puis <kbd>e</kbd>. Quatre mots." },
    { t: "L'école est finie", help: "L'apostrophe est sur la touche <kbd>4</kbd>. « é » = la touche 2, sans Maj." },
    { t: "Nous sommes prêts", help: "« ê » = <kbd>^</kbd> puis <kbd>e</kbd>. Trois mots." }
  ];

  R("cv_dictees", {
    steps: 1,
    render(ctx) {
      runRounds(ctx, {
        chapter: "Clavinator · séance 5", title: "La dictée",
        consigne: "Lisez la phrase <b>en entier</b>, puis tapez-la <b>exactement</b> comme le modèle : majuscule, accents, espaces. Pas de point à la fin.",
        help: "Une majuscule au début de la phrase, les accents comme dans le modèle, un espace entre les mots.",
        rounds: DICTEE.map((d, k) => ({
          prompt: `« ${esc(d.t)} »`, show: d.t, key: `cv_dic_${k}`, label: `Dictée « ${d.t} »`,
          help: d.help, max: 120,
          ok: v => nfc(v) === d.t
        })),
        finish: { key: "cv_dictees", label: "Je tape une phrase dictée avec majuscules et accents", intro: "Lire en entier, taper avec les majuscules et les accents, relire : la dictée est réussie." }
      });
    }
  });
})(window.AN);

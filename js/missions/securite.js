/* Missions « Sécurité » : e-mail suspect, SMS frauduleux, paiement en ligne. */
(function (AN) {
  "use strict";
  const { esc, shuffle } = AN.util;
  const R = AN.missions.register;

  /* ======================= E-MAIL SUSPECT ======================= */
  const CLUES = {
    sender: "L'adresse de l'expéditeur imite le vrai nom (un i majuscule remplace le l) et finit par .info.",
    subject: "L'objet crie à l'urgence pour vous faire agir sans réfléchir.",
    greeting: "« Cher client » : un vrai service vous appelle par votre nom.",
    urgency: "Une menace avec un délai très court est une technique de pression.",
    link: "Le lien mène vers ameli-rembourse.xyz, qui n'est pas un site officiel.",
    card: "Aucun service ne demande votre carte bancaire par e-mail pour un remboursement."
  };
  R("suspicious_mail", {
    steps: 3, theme: "security",
    render(ctx) {
      const step = ctx.m.step || 0;
      const L = ctx.local;
      L.found ||= [];
      const need = ctx.byLevel({ beginner: 0, intermediate: 3, expert: 5 });
      const clue = (id, html) => need ? `<span class="clue ${L.found.includes(id) ? "found" : ""}" role="button" tabindex="0" data-act="clue" data-clue="${id}">${html}</span>` : html;
      const mail = `
        <div class="mailbox"><div class="training-watermark">⚠ E-MAIL FICTIF — EXERCICE</div>
          <div class="mail-head">
            <div><span class="muted">De :</span> Assurance Maladie &lt;${clue("sender", "remboursement@ameIi-securite.info")}&gt;</div>
            <div><span class="muted">Objet :</span> ${clue("subject", "⚠ URGENT : remboursement en attente !!!")}</div>
          </div>
          <div class="mail-body">
            <p>${clue("greeting", "Cher client,")}</p>
            <p>Un remboursement de <b>87,40 €</b> est en attente sur votre compte. ${clue("urgency", "Sans action de votre part avant ce soir minuit, il sera définitivement annulé.")}</p>
            <p>${clue("card", "Pour le recevoir, saisissez les informations de votre carte bancaire")} en cliquant sur le bouton ci-dessous.</p>
            <p><a href="#" class="mail-link" data-act="link" data-hover="link">Recevoir mon remboursement</a></p>
            <p class="muted">Service Remboursement</p>
          </div>
          <div class="status-bar" aria-live="polite">${L.hover ? "http://ameli-rembourse.xyz/carte-bancaire" : "&nbsp;"}</div>
        </div>`;

      if (step === 0 && need) {
        ctx.html(`${ctx.header("Mission sécurité", "Enquête sur un e-mail", 0)}
          <p class="consigne" data-speak>Ce message vous paraît-il fiable ? Trouvez <b>${need} indices</b> suspects en cliquant dessus.${ctx.level === "expert" ? " Pensez à <b>survoler</b> le bouton (sans cliquer) pour voir où il mène vraiment." : ""}</p>
          <div class="clue-counter"><strong>${Math.min(L.found.length, need)} / ${need}</strong> indices trouvés</div>
          ${mail}
          <div id="clueFeedback" aria-live="polite">${L.fb || ""}</div>
          ${L.found.length >= need ? `<button type="button" class="primary" data-act="toDecision">J'ai trouvé les indices → décider</button>` : ""}`);
        const linkEl = ctx.box.querySelector(".mail-link");
        const reveal = () => {
          if (!L.hover) { L.hover = true; ctx.box.querySelector(".status-bar").textContent = "http://ameli-rembourse.xyz/carte-bancaire"; }
          if (!L.found.includes("link")) { L.found.push("link"); L.fb = `<div class="alert good">🔍 ${esc(CLUES.link)} (regardez en bas de la fenêtre)</div>`; setTimeout(() => ctx.render(), 900); }
        };
        linkEl.addEventListener("mouseenter", reveal);
        linkEl.addEventListener("focus", reveal);
        ctx.act("clue", el => {
          const id = el.dataset.clue;
          if (!L.found.includes(id)) L.found.push(id);
          L.fb = `<div class="alert good">🔍 ${esc(CLUES[id])}</div>`;
          ctx.render();
        });
        ctx.act("link", (el, e) => { e.preventDefault(); L.fb = `<div class="alert bad">Vous avez cliqué ! Dans la vraie vie, on ne clique pas. Il suffit de <b>survoler</b> le lien pour voir son adresse en bas de la fenêtre.</div>`; ctx.render(); });
        ctx.act("toDecision", () => ctx.go(1));
        return;
      }
      if (step <= 1) {
        const options = shuffle(ctx.byLevel({
          beginner: [["click", "Je clique sur le lien"], ["good", "Je ferme le message et j'ouvre moi-même le site officiel"]],
          intermediate: [["click", "Je clique sur le lien"], ["reply", "Je réponds pour demander si c'est vrai"], ["good", "Je supprime le message et je vérifie sur le site officiel"]],
          expert: [["click", "Je clique sur le lien"], ["reply", "Je réponds pour demander si c'est vrai"], ["call", "J'appelle le numéro indiqué en bas du message"], ["good", "Je supprime le message, je vérifie sur le site officiel et je le signale (signal-spam.fr)"]]
        }));
        ctx.html(`${ctx.header("Mission sécurité", "Reconnaître un message suspect", 1)}
          ${need ? "" : ctx.help("Regardez bien : urgence, demande de carte bancaire, adresse bizarre… Ce sont des signaux d'alerte.")}
          ${mail.replace('data-act="link"', 'data-act="link0"')}
          <div class="mission-step"><h2>Que faites-vous ?</h2>
            <div class="choice-stack">${options.map(([id, lab]) => `<button type="button" class="${"secondary"}" data-act="answer" data-a="${id}">${esc(lab)}</button>`).join("")}</div>
            <div id="suspiciousMsg" aria-live="polite"></div></div>`);
        const why = {
          click: "Attention : l'urgence et la demande de carte bancaire sont des signaux d'alerte. On ne clique pas.",
          reply: "Répondre confirme aux escrocs que votre adresse est active. Mieux vaut vérifier par vous-même.",
          call: "Le numéro indiqué peut appartenir aux escrocs (parfois surtaxé). Utilisez le numéro trouvé sur le site officiel."
        };
        ctx.act("link0", (el, e) => { e.preventDefault(); ctx.box.querySelector("#suspiciousMsg").innerHTML = `<div class="alert bad">${why.click}</div>`; });
        ctx.act("answer", el => {
          const a = el.dataset.a;
          if (a !== "good") { ctx.box.querySelector("#suspiciousMsg").innerHTML = `<div class="alert bad">${why[a]} Essayez une autre réponse.</div>`; el.disabled = true; return; }
          ctx.complete({ key: "security", label: "J'ai reconnu un e-mail suspect", text: "Vous avez eu le bon réflexe : ne pas cliquer, vérifier par soi-même." });
        });
        return;
      }
      ctx.finalScreen({ theme: "security" });
    }
  });

  /* ======================= SMS FRAUDULEUX ======================= */
  const SMS = {
    colis: { from: "38 015", text: "Votre colis est en attente : frais de livraison impayés (1,99 €). Réglez ici : colis-suivi-fr.top/pay", fraud: true, why: "Petit montant + lien bizarre : c'est l'arnaque au colis. Elle sert à voler votre carte bancaire." },
    medecin: { from: "Cabinet Dr Martin", text: "Rappel : RDV demain mardi à 10h20 avec le Dr Martin. En cas d'empêchement, merci de prévenir le cabinet.", fraud: false, why: "Simple rappel, sans lien, sans demande d'argent ni de code : c'est normal." },
    cpf: { from: "+33 7 56 12 98 40", text: "Vos droits formation CPF de 1 200 € expirent demain ! Activez-les vite : moncpf-droits.com", fraud: true, why: "Urgence + argent + faux site. Le vrai site est moncompteformation.gouv.fr et il n'y a pas d'urgence." },
    pharmacie: { from: "Pharmacie du Centre", text: "Bonjour, votre commande est prête. Vous pouvez venir la récupérer aux heures d'ouverture.", fraud: false, why: "Information pratique sans lien ni demande : rien d'anormal." },
    vitale: { from: "AMELI", text: "Votre carte Vitale expire. Commandez la nouvelle sous 48h pour garder vos droits : vitale-renouv.info", fraud: true, why: "La carte Vitale n'expire pas, et le lien ne mène pas vers ameli.fr." },
    proche: { from: "+33 6 44 87 21 09", text: "Coucou maman, j'ai cassé mon téléphone, c'est mon nouveau numéro. Écris-moi vite sur WhatsApp, j'ai besoin d'un service.", fraud: true, why: "Arnaque « au proche » : on vérifie toujours en appelant l'ancien numéro de la personne." },
    antai: { from: "ANTAI", text: "Avis de contravention impayé : 35 €. Majoration de 375 € sous 24h. Payez sur antai-paiement-amende.com", fraud: true, why: "Le site officiel est antai.gouv.fr. Le nom d'expéditeur « ANTAI » peut être usurpé." },
    banque: { from: "Ma Banque", text: "Code 482913 pour valider votre paiement de 59,90 € chez LIBRAIRIE DU PARC. Ne communiquez jamais ce code.", fraud: false, why: "Vous venez justement d'acheter ce livre : le montant et le commerçant correspondent. Le code ne se donne à personne." },
    impots: { from: "DGFIP", text: "La déclaration de revenus en ligne est ouverte. Rendez-vous dans votre espace sur le site impots.gouv.fr.", fraud: false, why: "Pas de lien cliquable, pas d'urgence, il vous invite à aller vous-même sur le site officiel." }
  };
  R("sms_scam", {
    steps: 3, theme: "sms",
    render(ctx) {
      const step = ctx.m.step || 0;
      const L = ctx.local;
      const ids = ctx.byLevel({ beginner: ["colis", "medecin", "cpf"], intermediate: ["vitale", "pharmacie", "proche", "colis"], expert: ["antai", "banque", "proche", "impots", "cpf"] });
      L.ans ||= {};
      if (step === 0) {
        ctx.html(`${ctx.header("Mission sécurité", "Repérer un SMS frauduleux", 0)}
          <div class="mission-step"><p data-speak>Votre téléphone a reçu plusieurs SMS. Pour chacun, dites s'il est <b>fiable</b> ou <b>suspect</b>.</p>
          ${ctx.level === "expert" ? `<div class="mouse-hint">Contexte : vous venez d'acheter un livre de 59,90 € à la Librairie du Parc.</div>` : ""}
          ${ctx.help("Méfiez-vous des liens, de l'urgence et des demandes d'argent.")}
          <button class="primary" type="button" data-act="start">Ouvrir mes SMS</button></div>`);
        ctx.act("start", () => ctx.go(1));
        return;
      }
      if (step === 1) {
        const allOk = ids.every(id => L.ans[id] === SMS[id].fraud);
        ctx.html(`${ctx.header("Mission sécurité", "Fiable ou suspect ?", 1)}
          ${ctx.level === "expert" ? `<div class="mouse-hint">Rappel : vous venez d'acheter un livre de 59,90 € à la Librairie du Parc.</div>` : ""}
          <div class="phone"><div class="phone-notch"></div><div class="phone-head">Messages <span class="training-pill">EXERCICE</span></div>
            ${ids.map(id => {
              const s = SMS[id], a = L.ans[id];
              const answered = a !== undefined, right = answered && a === s.fraud;
              return `<div class="sms ${answered ? (right ? "right" : "wrong") : ""}">
                <div class="sms-from">${esc(s.from)}</div><div class="sms-bubble">${esc(s.text)}</div>
                ${right ? `<div class="sms-verdict">${s.fraud ? "⚠️ Suspect" : "✅ Fiable"} — ${esc(s.why)}</div>`
                  : `<div class="sms-actions"><button type="button" class="secondary" data-act="ans" data-id="${id}" data-v="0">✅ Fiable</button><button type="button" class="secondary" data-act="ans" data-id="${id}" data-v="1">⚠️ Suspect</button></div>${answered ? `<div class="sms-verdict bad">Pas tout à fait… relisez bien et réessayez.${ctx.isBeginner() ? " Indice : " + esc(s.fraud ? "y a-t-il un lien ou une demande d'argent ?" : "vous demande-t-on quelque chose ?") : ""}</div>` : ""}`}
              </div>`;
            }).join("")}
          </div>
          ${allOk ? `<div class="mission-step"><h2>Dernière question</h2><p data-speak>Que faire d'un SMS frauduleux ?</p>
            <div class="choice-stack">${shuffle([["33700", "Le transférer gratuitement au 33700, puis le supprimer"], ["reply", "Répondre STOP"], ["keep", "Le garder sans rien faire"]]).map(([v, l]) => `<button type="button" class="secondary" data-act="final" data-v="${v}">${esc(l)}</button>`).join("")}</div>
            <div id="smsFinal" aria-live="polite"></div></div>` : ""}`);
        ctx.act("ans", el => { L.ans[el.dataset.id] = el.dataset.v === "1"; ctx.render(); ctx.box.querySelector(`[data-id="${el.dataset.id}"]`)?.closest(".sms")?.scrollIntoView({ block: "nearest" }); });
        ctx.act("final", el => {
          if (el.dataset.v !== "33700") { ctx.box.querySelector("#smsFinal").innerHTML = `<div class="alert bad">${el.dataset.v === "reply" ? "Répondre confirme que votre numéro est actif." : "Le signaler aide à bloquer l'arnaque pour tout le monde."} Essayez encore.</div>`; el.disabled = true; return; }
          ctx.complete({ key: "sms", label: "J'ai repéré des SMS frauduleux", text: "Vous savez distinguer un SMS fiable d'une arnaque, et le signaler au 33700." });
        });
        return;
      }
      ctx.finalScreen({ theme: "sms" });
    }
  });

  /* ======================= PAIEMENT EN LIGNE ======================= */
  const CARD = { number: "1234 5678 9012 3456", exp: "12/30", cvv: "123", holder: "M. EXERCICE" };
  R("secure_payment", {
    steps: 4, theme: "payment",
    render(ctx) {
      const step = ctx.m.step || 0;
      const L = ctx.local;
      const product = { label: "Atelier cuisine — Maison de quartier (fictif)", amount: "12,00 €", merchant: "MAISON QUARTIER EXEMPLE" };
      const goodUrl = "https://www.maisondequartier-exemple.fr/paiement";
      const badUrl = "http://maisondequartier-exemple.paiement-securise.info";
      const browser = (url, inner, lock) => `<div class="fake-browser"><div class="fake-addr">${lock ? `<span class="lock" ${lock}>🔒</span>` : `<span class="lock warn">⚠ Non sécurisé</span>`}<span class="addr-text">${esc(url)}</span></div><div class="fake-browser-body">${inner}</div></div>`;

      if (step === 0) {
        if (ctx.isBeginner()) {
          ctx.html(`${ctx.header("Mission paiement", "Payer en ligne en sécurité", 0)}
            <p class="consigne" data-speak>Vous allez payer votre inscription à un atelier cuisine (${product.amount}). Avant de payer, vérifiez que la page est sécurisée : <b>cliquez sur le cadenas</b> dans la barre d'adresse.</p>
            ${browser(goodUrl, `<div class="training-watermark">⚠ SIMULATION — aucun paiement réel</div><h3>${esc(product.label)}</h3><p>Montant : <b>${product.amount}</b></p>`, 'role="button" tabindex="0" data-act="lock" class="lock pulse-hint"')}
            <div id="payFb" aria-live="polite"></div>`);
          ctx.act("lock", () => {
            ctx.box.querySelector("#payFb").innerHTML = `<div class="alert good">Bravo ! Le cadenas 🔒 et l'adresse qui commence par <b>https://</b> indiquent une connexion chiffrée. Vérifiez aussi que le nom du site est bien celui attendu.</div><button type="button" class="primary" data-act="next">Continuer vers le paiement →</button>`;
          });
          ctx.act("next", () => ctx.go(1));
          return;
        }
        const pages = shuffle([["good", goodUrl, true], ["bad", badUrl, false]]);
        ctx.html(`${ctx.header("Mission paiement", "Payer en ligne en sécurité", 0)}
          <p class="consigne" data-speak>Vous voulez payer votre inscription à l'atelier cuisine de la Maison de quartier (${product.amount}). Deux pages de paiement s'ouvrent. <b>Laquelle est la bonne ?</b></p>
          <div class="two-cols">${pages.map(([id, url, sec]) => `<div>${browser(url, `<div class="training-watermark">⚠ SIMULATION</div><h3>Paiement</h3><p>${esc(product.label)}</p><p><b>${product.amount}</b></p>`, sec ? 'class="lock"' : "")}<button type="button" class="secondary full" data-act="pick" data-p="${id}">Je paie sur cette page</button></div>`).join("")}</div>
          <div id="payFb" aria-live="polite"></div>`);
        ctx.act("pick", el => {
          if (el.dataset.p === "bad") { ctx.box.querySelector("#payFb").innerHTML = `<div class="alert bad">Non ! Cette adresse commence par <b>http://</b> (sans s), et le vrai nom du site est suivi de « .paiement-securise.info » : c'est un autre site.</div>`; return; }
          ctx.box.querySelector("#payFb").innerHTML = `<div class="alert good">Exact : <b>https://</b>, cadenas, et le nom de domaine se termine bien par « maisondequartier-exemple.fr ».</div><button type="button" class="primary" data-act="next">Continuer →</button>`;
        });
        ctx.act("next", () => ctx.go(1));
        return;
      }
      if (step === 1) {
        ctx.html(`${ctx.header("Mission paiement", "Saisir la carte d'exercice", 1)}
          <div class="alert warn" data-speak>⚠ N'utilisez <b>jamais</b> votre vraie carte ici. Recopiez uniquement la carte d'exercice ci-dessous.</div>
          <div class="pay-layout">
            <div class="fake-card" aria-label="Carte d'exercice"><div class="fake-card-brand">CARTE D'EXERCICE</div><div class="fake-card-chip"></div><div class="fake-card-num">${CARD.number}</div><div class="fake-card-row"><span>${CARD.holder}</span><span>EXP ${CARD.exp}</span></div><div class="fake-card-back">Au dos — cryptogramme : <b>${CARD.cvv}</b></div></div>
            ${browser(goodUrl, `<div class="training-watermark">⚠ SIMULATION — aucun paiement réel</div>
              <p>${esc(product.label)} — <b>${product.amount}</b></p>
              <form class="pay-form" onsubmit="return false" autocomplete="off">
                <label for="ccNum">Numéro de carte</label><input id="ccNum" inputmode="numeric" placeholder="1234 5678 9012 3456" autocomplete="off">
                <div class="form-row"><div><label for="ccExp">Date d'expiration (MM/AA)</label><input id="ccExp" placeholder="MM/AA" autocomplete="off"></div>
                <div><label for="ccCvv">Cryptogramme (3 chiffres au dos)</label><input id="ccCvv" inputmode="numeric" maxlength="3" autocomplete="off"></div></div>
                <label for="ccName">Nom sur la carte</label><input id="ccName" autocomplete="off">
                ${ctx.level === "expert" ? `<label class="checkbox-line"><input id="ccSave" type="checkbox" checked><span>Enregistrer ma carte pour mes prochains achats</span></label>` : ""}
                <button type="button" class="primary" data-act="pay">Payer ${product.amount}</button>
              </form>`, 'class="lock"')}
          </div>
          <div id="payFb" aria-live="polite"></div>
          ${ctx.help("Le cryptogramme, ce sont les 3 chiffres au dos de la carte. Le code secret (PIN) ne se tape jamais sur Internet.")}`);
        ctx.act("pay", () => {
          const v = id => ctx.box.querySelector("#" + id).value.replace(/\s+/g, " ").trim();
          const fb = ctx.box.querySelector("#payFb");
          const num = v("ccNum").replace(/\s/g, "");
          if (num !== CARD.number.replace(/\s/g, "")) { fb.innerHTML = `<div class="alert bad">Le numéro ne correspond pas à la carte d'exercice. Recopiez-la chiffre par chiffre (et jamais votre vraie carte).</div>`; return; }
          if (v("ccExp") !== CARD.exp) { fb.innerHTML = `<div class="alert bad">Date d'expiration : recopiez « ${CARD.exp} » (mois/année).</div>`; return; }
          if (v("ccCvv") !== CARD.cvv) { fb.innerHTML = `<div class="alert bad">Le cryptogramme est le nombre à 3 chiffres écrit au dos de la carte d'exercice.</div>`; return; }
          if (!v("ccName")) { fb.innerHTML = `<div class="alert bad">Indiquez le nom écrit sur la carte.</div>`; return; }
          const save = ctx.box.querySelector("#ccSave");
          if (save && save.checked && !L.saveWarned) { L.saveWarned = true; fb.innerHTML = `<div class="alert warn">La case « Enregistrer ma carte » était cochée d'avance. Sur un ordinateur partagé, décochez-la ! (Cliquez à nouveau sur Payer pour continuer.)</div>`; return; }
          ctx.go(2);
        });
        return;
      }
      if (step === 2) {
        const mismatch = ctx.level === "expert";
        const notif = mismatch ? { amount: "489,00 €", merchant: "TOP-ELECTRO SHOP" } : { amount: product.amount, merchant: product.merchant };
        L.code ||= String(100000 + Math.floor(Math.random() * 899999));
        ctx.html(`${ctx.header("Mission paiement", "Confirmer le paiement", 2)}
          <p class="consigne" data-speak>Votre banque vous envoie un code par SMS pour confirmer le paiement. ${ctx.level === "beginner" ? "Recopiez-le." : "Lisez bien le SMS avant de recopier le code."}</p>
          <div class="pay-layout">
            <div class="phone small"><div class="phone-notch"></div><div class="phone-head">Messages</div><div class="sms"><div class="sms-from">Ma Banque</div><div class="sms-bubble">Code ${L.code} pour valider votre paiement de ${notif.amount} chez ${notif.merchant}. Ne communiquez jamais ce code.</div></div></div>
            <div class="bank-3ds"><div class="training-watermark">⚠ SIMULATION</div><h3>🏦 Ma Banque — Vérification</h3>
              <p>Paiement de <b>${product.amount}</b> chez <b>${product.merchant}</b></p>
              ${ctx.level === "intermediate" ? `<label class="checkbox-line"><input type="checkbox" id="chk3ds"><span>J'ai vérifié que le montant et le commerçant du SMS correspondent à mon achat</span></label>` : ""}
              <label for="code3ds">Code reçu par SMS</label><input id="code3ds" inputmode="numeric" maxlength="6" autocomplete="one-time-code">
              <div class="final-actions"><button type="button" class="secondary" data-act="cancel">Annuler le paiement</button><button type="button" class="primary" data-act="confirm">Valider</button></div>
              <div id="payFb" aria-live="polite"></div></div>
          </div>`);
        ctx.act("confirm", () => {
          const fb = ctx.box.querySelector("#payFb");
          if (mismatch) { fb.innerHTML = `<div class="alert bad">Stop ! Le SMS parle de <b>489,00 € chez TOP-ELECTRO SHOP</b>, pas de 12,00 € pour l'atelier. Quelqu'un essaie de faire un autre paiement : il fallait <b>annuler</b>.</div>`; return; }
          if (ctx.level === "intermediate" && !ctx.box.querySelector("#chk3ds").checked) { fb.innerHTML = `<div class="alert warn">Comparez d'abord le montant et le commerçant du SMS avec votre achat, puis cochez la case.</div>`; return; }
          if (ctx.box.querySelector("#code3ds").value.trim() !== L.code) { fb.innerHTML = `<div class="alert bad">Le code ne correspond pas. Recopiez les 6 chiffres du SMS.</div>`; return; }
          ctx.complete({ key: "payment", label: "J'ai payé en ligne en vérifiant la sécurité", text: "Paiement validé (fictif) : vous avez vérifié la page, la carte et le SMS de confirmation." });
        });
        ctx.act("cancel", () => {
          const fb = ctx.box.querySelector("#payFb");
          if (mismatch) { ctx.complete({ key: "payment", label: "J'ai bloqué un paiement frauduleux", text: "Excellent réflexe : le montant et le commerçant ne correspondaient pas, vous avez annulé. Dans la vraie vie, appelez ensuite votre banque." }); return; }
          fb.innerHTML = `<div class="alert warn">Ici, tout correspond (${product.amount}, ${product.merchant}) : vous pouvez valider en toute confiance.</div>`;
        });
        return;
      }
      ctx.finalScreen({ theme: "payment" });
    }
  });
})(window.AN);

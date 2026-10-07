/* =========================================================
   Jeux en direct du chapitre « Fichiers et dossiers » (3 séances)
   ========================================================= */
(function (AN) {
  "use strict";
  const G = AN.games.register;
  const Y = new Date().getFullYear();
  const tile = (ico, name, sub = "") => `<div class="fi-tile"><span>${ico}</span><b>${name}</b>${sub ? `<small>${sub}</small>` : ""}</div>`;

  /* =================== SÉANCE 1 =================== */
  const FD = ["📄 Un fichier", "📁 Un dossier"];
  G({ id: "fic_ou", title: "Fichier ou dossier ?", icon: "📁",
    intro: "Un élément s'affiche, comme dans l'Explorateur : est-ce un <b>fichier</b> (une feuille : une lettre, une photo…) ou un <b>dossier</b> (une chemise qui range des fichiers) ?",
    rounds: [
      ["📁", "Santé", "Dossier de fichiers", 1, "L'icône jaune 📁 et le type « Dossier de fichiers » : c'est une chemise qui contient d'autres choses."],
      ["📕", "ordonnance_dr_martin.pdf", "Document PDF · 85 Ko", 0, "Un document qu'on ouvre pour le lire : c'est un fichier. Il a une taille (85 Ko) et une extension (.pdf)."],
      ["🖼️", "anniversaire_lucas.jpg", "Fichier JPG · 2,3 Mo", 0, "Une photo, c'est un fichier : une « feuille » qu'on regarde."],
      ["📁", "Vacances 2025", "Dossier de fichiers", 1, "Un dossier, qui range sans doute plein de photos."],
      ["📘", "lettre_mairie.docx", "Document Microsoft Word · 24 Ko", 0, "Un courrier écrit avec Word : un fichier."],
      ["⬇️", "Téléchargements", "Dossier de fichiers", 1, "Un des grands dossiers de Windows : tout ce qu'on télécharge y arrive."]
    ].map(([i, n, s, ok, why]) => ({ kind: "choice", prompt: tile(i, n, s), choices: FD, ok, why, short: n, limit: 12 })) });

  const TIR = ["🖥️ Bureau", "⬇️ Téléchargements", "📄 Documents", "🖼️ Images"];
  G({ id: "fic_tiroir", title: "Dans quel grand dossier ?", icon: "🗄️",
    intro: "L'ordinateur a 4 grands « tiroirs » : <b>Bureau</b>, <b>Téléchargements</b>, <b>Documents</b>, <b>Images</b>. Où va chaque chose ?",
    rounds: [
      ["Je viens de <b>télécharger</b> mon avis d'impôt sur impots.gouv.fr. Où arrive-t-il ?", 1, "Tout ce qui vient d'Internet arrive d'abord dans <b>Téléchargements</b>. C'est le premier endroit où chercher !"],
      ["Je veux <b>ranger</b> mon ordonnance pour la garder longtemps.", 2, "Les papiers qu'on garde vont dans <b>Documents</b>, dans un dossier « Santé » par exemple."],
      ["Je range les <b>photos</b> de l'anniversaire de mon petit-fils.", 3, "Les photos vont dans <b>Images</b>."],
      ["Ce que je vois tout de suite en allumant l'ordinateur, derrière les fenêtres.", 0, "C'est le <b>Bureau</b> : pratique, mais on évite d'y entasser tous ses fichiers."],
      ["J'ai enregistré la <b>pièce jointe</b> d'un e-mail. Elle est allée…", 1, "Une pièce jointe enregistrée, c'est un téléchargement : elle arrive dans <b>Téléchargements</b>."]
    ].map(([p, ok, why]) => ({ kind: "choice", layout: "files", prompt: `<div class="lp-scene">${p}</div>`, choices: TIR, ok, why, short: p.replace(/<[^>]+>/g, "").slice(0, 50), limit: 18 })) });

  const FAM = ["📕 Un document à lire (PDF)", "🖼️ Une photo", "📘 Un document Word", "⚙️ Un programme"];
  G({ id: "fic_famille", title: "Quelle famille ?", icon: "🏷️",
    intro: "Un nom de fichier s'affiche. Regardez bien la <b>fin du nom</b> (l'extension) : de quelle famille est-il ?",
    rounds: [
      ["attestation_caf.pdf", 0, "« .pdf » : un document à lire ou à imprimer. Les administrations l'utilisent beaucoup."],
      ["plage_2025.jpg", 1, "« .jpg » : une photo."],
      ["lettre_proprietaire.docx", 2, "« .docx » : un document Word, qu'on peut modifier."],
      ["installer_jeux.exe", 3, "« .exe » : un programme. On ne l'ouvre que si on sait d'où il vient."],
      ["facture_colis.pdf.exe", 3, "Piège ! Seule la <b>dernière</b> extension compte : « .exe ». C'est un programme déguisé en facture : on ne l'ouvre pas."],
      ["IMG_2041.png", 1, "« .png » : une image aussi (souvent une capture d'écran)."]
    ].map(([n, ok, why]) => ({ kind: "choice", layout: "files", prompt: `<div class="lp-model" style="font-size:1.6em">${n}</div>`, choices: FAM, ok, why, short: n, limit: 15 })) });

  /* =================== SÉANCE 2 =================== */
  const NM = ["✅ Bon nom", "✏️ À renommer"];
  G({ id: "fic_nom", title: "Bon nom, ou à renommer ?", icon: "✏️",
    intro: "Un bon nom dit <b>ce que c'est</b>, <b>de qui</b>, et <b>la date</b>. Ce nom est-il clair, ou faut-il le renommer ?",
    rounds: [
      ["document (3).pdf", 1, "« document (3) » ne dit rien : dans un mois, impossible de savoir ce que c'est."],
      [`facture_edf_${Y}-09.pdf`, 0, "Parfait : quoi (facture), de qui (EDF), quand (septembre)."],
      ["scan0001.pdf", 1, "Le nom donné par le scanner : à renommer tout de suite."],
      [`attestation_mutuelle_${Y}.pdf`, 0, "Clair et daté : on le retrouve du premier coup."],
      ["IMG_4821.jpg", 1, "Le nom donné par le téléphone. Pour une photo importante, on renomme : « photo_mariage_paul_2024.jpg »."],
      ["Mon fichier important !!!.pdf", 1, "« important » ne dit pas ce que c'est. Et on évite les « ! »."]
    ].map(([n, ok, why]) => ({ kind: "choice", prompt: `<div class="lp-model" style="font-size:1.5em">${n}</div>`, choices: NM, ok, why, short: n, limit: 12 })) });

  G({ id: "fic_ranger", title: "Ranger, pas à pas", icon: "🗂️",
    intro: "Les étapes pour ranger l'ordonnance dans un <b>nouveau dossier « Santé »</b> sont mélangées : remettez-les dans l'ordre !",
    rounds: [{ kind: "order", limit: 70, prompt: "Ranger l'ordonnance dans un nouveau dossier « Santé » :", answer: ["Ouvrir l'Explorateur, puis « Documents »", "Cliquer sur ＋ Nouveau › Dossier", "Taper « Santé », puis Entrée", "Glisser l'ordonnance sur le dossier Santé"],
      why: "Et sans glisser ? Clic sur l'ordonnance › ✂️ Couper, on ouvre le dossier Santé › 📋 Coller." }] });

  const VF = ["✅ Vrai", "❌ Faux"];
  G({ id: "fic_corbeille", title: "La Corbeille : vrai ou faux ?", icon: "🗑️",
    intro: "Vrai ou faux ? Des idées reçues sur la suppression des fichiers…",
    rounds: [
      ["Un fichier que je supprime va d'abord dans la <b>Corbeille</b>.", 0, "Vrai : il y attend, et on peut le <b>restaurer</b> en cas d'erreur."],
      ["Un fichier dans la Corbeille est perdu pour toujours.", 1, "Faux : clic sur le fichier, puis <b>Restaurer</b>, et il revient à sa place."],
      ["« Vider la Corbeille » supprime définitivement.", 0, "Vrai : après, on ne peut plus rien récupérer. On regarde avant de vider !"],
      ["Sur une <b>clé USB</b>, un fichier supprimé va toujours dans la Corbeille.", 1, "Faux : sur une clé USB, la suppression est souvent <b>définitive</b>. Windows prévient : « Voulez-vous vraiment… ? »."],
      ["« Couper » un fichier le supprime.", 1, "Faux : couper prépare un déplacement. Le fichier ne bouge qu'au moment de « Coller »."]
    ].map(([p, ok, why]) => ({ kind: "choice", prompt: `<div class="lp-scene">${p}</div>`, choices: VF, ok, why, short: p.replace(/<[^>]+>/g, "").slice(0, 50), limit: 15 })) });

  /* =================== SÉANCE 3 =================== */
  const z = (id, html) => `<span class="z" data-z="${id}">${html}</span>`;
  const r = (ico, name, date, type, size) => `<div class="fi-sr"><span>${ico} ${name}</span><span>${date}</span><span>${type}</span><span>${size}</span></div>`;
  G({ id: "fic_piege", title: "Les pièges du dossier Téléchargements", icon: "🔎",
    intro: "Voici le dossier <b>Téléchargements</b> de Josiane, extensions affichées. Repérez les fichiers qui posent problème : un <b>danger</b>, un <b>doublon</b> ou un <b>nom qui ne veut rien dire</b>.",
    rounds: [{ kind: "spot", limit: 120, prompt: "Les extensions sont affichées. Cliquez sur les <b>4 fichiers</b> qui posent problème : danger, doublon ou nom qui ne veut rien dire.",
      why: "Un programme (.exe) déguisé ou inconnu : on ne l'ouvre pas. Un doublon (2) : on le supprime. Un nom vague : on le renomme.",
      zones: { exe: "« facture_colis.pdf.exe » : un programme déguisé en facture !", gratuit: "« Lecteur_PDF_GRATUIT.exe » : un programme d'origine inconnue", doublon: "« attestation_caf (2).pdf » : un doublon, à supprimer", vague: "« document (3).pdf » : un nom qui ne dit rien, à renommer" },
      content: `<div class="fi-spot"><div class="fi-sh">📁 Ce PC › <b>Téléchargements</b></div>
        <div class="fi-sr head"><span>Nom</span><span>Modifié le</span><span>Type</span><span>Taille</span></div>
        ${r("📕", `facture_edf_${Y}-09.pdf`, "03/10", "Document PDF", "120 Ko")}
        ${r("⚙️", z("exe", "facture_colis.pdf.exe"), "07/10", "Application", "812 Ko")}
        ${r("📕", "attestation_caf.pdf", "04/10", "Document PDF", "98 Ko")}
        ${r("📕", z("doublon", "attestation_caf (2).pdf"), "04/10", "Document PDF", "98 Ko")}
        ${r("🖼️", "photo_mairie.jpg", "28/09", "Fichier JPG", "1,8 Mo")}
        ${r("⚙️", z("gratuit", "Lecteur_PDF_GRATUIT.exe"), "08/08", "Application", "3,3 Mo")}
        ${r("📕", z("vague", "document (3).pdf"), "06/10", "Document PDF", "152 Ko")}
        ${r("📘", "lettre_caf.docx", "22/09", "Document Word", "26 Ko")}</div>` }] });

  const SEND = (p, c, ok, why, short) => ({ kind: "choice", layout: "files", prompt: `<div class="lp-scene">${p}</div>`, choices: c, ok, why, short, limit: 22 });
  G({ id: "fic_envoi", title: "Quel fichier j'envoie ?", icon: "📎",
    intro: "Un site demande une pièce justificative. Parmi les fichiers de l'ordinateur, lequel faut-il choisir ?",
    rounds: [
      SEND("📎 « Justificatif de domicile de <b>moins de 3 mois</b> » (nous sommes en octobre)", [`facture_edf_${Y}-03.pdf`, `facture_edf_${Y}-09.pdf`, "contrat_assurance.pdf"], 1, "La facture de septembre a moins de 3 mois. Celle de mars est trop vieille ; un contrat d'assurance ne prouve pas l'adresse.", "Moins de 3 mois"),
      SEND("📎 « Pièce d'identité, <b>recto</b> »", ["carte_identite_verso.jpg", "carte_vitale.jpg", "carte_identite_recto.jpg"], 2, "Le recto, c'est le côté avec la photo. La carte Vitale n'est pas une pièce d'identité.", "Recto"),
      SEND("📎 « Format <b>PDF</b> uniquement »", ["avis_impot.jpg", "avis_impot.pdf", "avis_impot.docx"], 1, "On regarde l'extension : seule « .pdf » convient.", "Format PDF"),
      SEND("📎 « Taille maximale : <b>5 Mo</b> »", ["photo_facture.jpg · 6,4 Mo", "facture.pdf · 180 Ko"], 1, "6,4 Mo, c'est plus que 5 Mo : trop lourd. 180 Ko, c'est tout petit (1 Mo = 1 000 Ko)." , "5 Mo maximum")
    ] });

  const QF = (p, c, ok, why, short) => ({ kind: "choice", layout: "files", prompt: p, choices: c, ok, why, short, limit: 25 });
  G({ id: "fic_que_faire", title: "Que faites-vous ?", icon: "🆘", noRank: true,
    intro: "Des situations de tous les jours avec les fichiers… et les bons gestes, <b>calmement</b>. Pas de classement : on en parle ensemble.",
    rounds: [
      QF("Je viens de télécharger un document, et je ne le trouve plus.", ["Je le retélécharge dix fois", "Téléchargements, trié par date : il est en haut", "J'appelle la mairie"], 1, "Tout téléchargement arrive dans <b>Téléchargements</b>. Trié par date, le plus récent est en haut.", "Téléchargement perdu"),
      QF("J'ai supprimé par erreur la photo de mon petit-fils.", ["Elle est perdue", "Je vais dans la Corbeille et je la restaure", "Je vide la Corbeille"], 1, "La Corbeille garde les fichiers supprimés : <b>Restaurer</b>, et elle revient.", "Photo supprimée"),
      QF("J'ai renommé un fichier, et maintenant il ne s'ouvre plus.", ["L'extension a sans doute été effacée : je la remets (.pdf, .jpg…)", "Je le supprime", "L'ordinateur est en panne"], 0, "Sans l'extension, Windows ne sait plus l'ouvrir. On renomme en remettant la bonne fin.", "Fichier qui ne s'ouvre plus"),
      QF("Je ne me souviens plus du tout où j'ai rangé mon scan de permis de conduire.", ["J'ouvre tous les dossiers un par un", "Dans Ce PC, je tape « permis » dans la loupe 🔍", "Je refais un scan"], 1, "La recherche trouve en quelques secondes, même un fichier rangé très loin.", "Fichier introuvable"),
      QF("Un fichier « facture.pdf.exe » est arrivé dans mes Téléchargements.", ["Je l'ouvre pour voir la facture", "C'est un programme déguisé : je ne l'ouvre pas, je le supprime", "Je l'envoie à mes amis"], 1, "« .exe » à la fin : c'est un programme, pas une facture. On ne l'ouvre pas.", "facture.pdf.exe")
    ] });
})(window.AN);

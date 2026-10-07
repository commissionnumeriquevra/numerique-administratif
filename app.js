/* =========================================================
   Démarrage de l'application
   ========================================================= */
(function (AN) {
  "use strict";
  const { $, $$, show, toast, confirmBox } = AN.util;

  function bindLanding() {
    $$("[data-open]").forEach(b => b.addEventListener("click", () => show(b.dataset.open)));
    $("#homeBtn").addEventListener("click", async () => {
      if (document.body.classList.contains("student-on")) {
        if (!(await confirmBox({ title: "Quitter votre espace ?", text: "Votre travail est enregistré. Vous pourrez revenir avec vos codes.", ok: "Quitter" }))) return;
        $("#studentLogoutBtn").click();
        return;
      }
      if (document.body.classList.contains("teacher-on")) { show("teacherDashboard"); return; }
      show("landing");
    });

    const firebaseReady = AN.FirebaseStore.isConfigured();
    $("#modeBanner").textContent = firebaseReady
      ? "Mode connecté : les ateliers sont synchronisés entre tous les ordinateurs."
      : "Mode démonstration : tout reste dans ce navigateur. Ajoutez votre configuration Firebase pour travailler sur plusieurs ordinateurs.";
    if (!firebaseReady) $("#teacherLoginForm").classList.add("hidden");

    const login = async () => {
      const msg = $("#teacherLoginMsg"); msg.className = "msg"; msg.textContent = "";
      const email = $("#teacherEmail").value.trim(), pw = $("#teacherPassword").value;
      if (!email || !pw) { msg.className = "msg bad"; msg.textContent = "Renseignez l'e-mail et le mot de passe."; return; }
      const btn = $("#teacherLoginBtn"); btn.disabled = true; btn.textContent = "Connexion…";
      try {
        const t = await AN.FirebaseStore.teacherSignIn(email, pw);
        $("#teacherPassword").value = "";
        await AN.teacher.start(AN.FirebaseStore, t);
      } catch (e) { msg.className = "msg bad"; msg.textContent = e.message; }
      finally { btn.disabled = false; btn.textContent = "Se connecter"; }
    };
    $("#teacherLoginBtn").addEventListener("click", login);
    $("#teacherPassword").addEventListener("keydown", e => { if (e.key === "Enter") login(); });
    $("#demoTeacherBtn").addEventListener("click", async () => {
      const t = await AN.DemoStore.teacherSignIn();
      AN.teacher.start(AN.DemoStore, t);
      toast("Mode démonstration : ouvrez un 2ᵉ onglet pour jouer le rôle d'un participant.", "info", 7000);
    });
  }

  async function boot() {
    AN.a11y.bind();
    bindLanding();
    AN.teacher.bind();
    AN.student.bind();
    show("landing");
    // Un participant qui recharge la page (F5) retrouve directement son espace.
    await AN.student.resume();
    window.addEventListener("error", e => console.error(e.error || e.message));
    window.addEventListener("unhandledrejection", e => console.error(e.reason));
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})(window.AN);

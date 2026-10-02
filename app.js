const firebaseConfig = window.firebaseConfig;

const $ = s => document.querySelector(s);
const $$ = s => [...document.querySelectorAll(s)];
const screens = $$(".screen");

const configured = !firebaseConfig.apiKey.startsWith("VOTRE_");
let firebase = null;
let state = {
  mode: configured ? "firebase" : "demo",
  teacherGroups: [],
  teacher: null,
  workshop: null,
  seat: null,
  student: null,
  currentMission: null,
  selectedConversation: null
};

const demo = loadDemo();

const GROUP_META_KEY="teacherGroupMetaV1";
function loadGroupMeta(){try{return JSON.parse(localStorage.getItem(GROUP_META_KEY)||"{}");}catch(e){return {};}}
function saveGroupMeta(meta){localStorage.setItem(GROUP_META_KEY,JSON.stringify(meta));}
function groupMeta(id){const all=loadGroupMeta();return all[id]||{favorite:false,archived:false,order:999};}
function patchGroupMeta(id,patch){const all=loadGroupMeta();all[id]={...(all[id]||{favorite:false,archived:false,order:999}),...patch};saveGroupMeta(all);}
function sortedTeacherGroups(groups){return [...groups].sort((a,b)=>{const ma=groupMeta(a.id),mb=groupMeta(b.id);if(ma.favorite!==mb.favorite)return ma.favorite?-1:1;if(ma.archived!==mb.archived)return ma.archived?1:-1;if((ma.order??999)!==(mb.order??999))return (ma.order??999)-(mb.order??999);return (b.createdAt||0)-(a.createdAt||0);});}


function loadDemo(){
  const saved = localStorage.getItem("atelierNumeriqueDemo");
  if(saved){
    try{return JSON.parse(saved)}catch(e){}
  }
  return {workshops:{},messages:{},missions:{},achievements:{}};
}
function saveDemo(){ localStorage.setItem("atelierNumeriqueDemo",JSON.stringify(demo)); }

async function initFirebase(){
  if(!configured){
    $("#modeBanner").textContent="Mode démonstration local : aucune donnée n’est envoyée sur Internet. Ajoutez votre configuration Firebase pour activer le multi-utilisateur.";
    return;
  }
  $("#modeBanner").textContent="Mode Firebase : l’application peut synchroniser les ateliers entre plusieurs ordinateurs.";
  const appMod = await import("https://www.gstatic.com/firebasejs/12.4.0/firebase-app.js");
  const authMod = await import("https://www.gstatic.com/firebasejs/12.4.0/firebase-auth.js");
  const fsMod = await import("https://www.gstatic.com/firebasejs/12.4.0/firebase-firestore.js");
  const fbApp = appMod.initializeApp(firebaseConfig);
  firebase = {
    auth: authMod.getAuth(fbApp),
    db: fsMod.getFirestore(fbApp),
    ...authMod, ...fsMod
  };
}

function show(id){
  screens.forEach(s=>s.classList.remove("active"));
  const el = document.getElementById(id);
  if(el) el.classList.add("active");
  $("#homeBtn").classList.toggle("hidden",id==="landing");
  window.scrollTo({top:0,behavior:"instant"});
}
function randomDigits(n){ return String(Math.floor(Math.random()*10**n)).padStart(n,"0"); }
function uid(){ return crypto.randomUUID ? crypto.randomUUID() : Date.now()+"-"+Math.random(); }
function esc(s){return String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));}
function levelName(l){return ({beginner:"Débutant",intermediate:"Intermédiaire",expert:"Expert"})[l]||l;}
function missionName(t){return ({
  download_doc:"Télécharger un document",
  fill_form:"Remplir un formulaire avec la touche Tab",
  keyboard_skills:"Maîtriser les touches essentielles du clavier",
  mouse_nav:"Explorer des sites administratifs à la souris",
  missing_piece:"Pièce manquante au dossier",
  suspicious_mail:"Reconnaître un e-mail suspect",
  full_admin:"Parcours administratif complet"
})[t]||t;}

$$("[data-open]").forEach(b=>b.addEventListener("click",()=>show(b.dataset.open)));
$("#homeBtn").addEventListener("click",()=>show("landing"));

/* -------------------- TEACHER -------------------- */
$("#demoTeacherBtn").addEventListener("click",()=>{
  state.teacher={uid:"demo-teacher",email:"demo@atelier.local"};
  show("teacherDashboard"); renderTeacher();
});

$("#teacherLoginBtn").addEventListener("click",async()=>{
  const msg=$("#teacherLoginMsg"); msg.className="msg"; msg.textContent="";
  if(!configured){msg.className="msg bad";msg.textContent="Firebase n’est pas encore configuré. Utilisez le mode démonstration.";return;}
  try{
    const cred=await firebase.signInWithEmailAndPassword(firebase.auth,$("#teacherEmail").value.trim(),$("#teacherPassword").value);
    const roleSnap=await firebase.getDoc(firebase.doc(firebase.db,"users",cred.user.uid));
    if(!roleSnap.exists()||roleSnap.data().role!=="teacher") throw new Error("Ce compte n'est pas un compte maître.");
    state.teacher={uid:cred.user.uid,email:cred.user.email};
    show("teacherDashboard"); await renderTeacher();
  }catch(e){msg.className="msg bad";msg.textContent=e.message;}
});

$("#teacherLogoutBtn").addEventListener("click",async()=>{
  if(configured&&firebase) await firebase.signOut(firebase.auth);
  state.teacher=null;state.workshop=null;show("landing");
});

$("#createWorkshopBtn").addEventListener("click",async()=>{
  const count=Number($("#seatCount").value);
  const code=randomDigits(6);
  const w={
    id:uid(), code, name:$("#workshopName").value.trim()||"Atelier",
    teacherUid:state.teacher?.uid||"demo-teacher",
    createdAt:Date.now(), seats:[]
  };
  const used=new Set();
  while(w.seats.length<count){
    let seatCode=randomDigits(4); if(used.has(seatCode))continue;used.add(seatCode);
    w.seats.push({id:uid(),seatCode,displayName:"",claimed:false,studentUid:"",level:"beginner"});
  }
  if(configured){
    const ref=firebase.doc(firebase.db,"workshops",w.id);
    await firebase.setDoc(ref,{code:w.code,name:w.name,teacherUid:w.teacherUid,createdAt:w.createdAt});
    for(const seat of w.seats){
      await firebase.setDoc(firebase.doc(firebase.db,"workshops",w.id,"seats",seat.id),seat);
    }
  }else{
    demo.workshops[w.id]=w;saveDemo();
  }
  state.workshop=w; patchGroupMeta(w.id,{order:(state.teacherGroups||[]).length,favorite:false,archived:false}); renderTeacher();
});

$("#assignMissionBtn").addEventListener("click",async()=>{
  if(!state.workshop)return;
  const seatId=$("#missionSeat").value;
  if(!seatId)return;
  const mission={
    id:uid(),workshopId:state.workshop.id,seatId,
    type:$("#missionTemplate").value,level:$("#missionLevel").value,
    status:"assigned",step:0,createdAt:Date.now()
  };
  if(configured){
    await firebase.setDoc(firebase.doc(firebase.db,"missions",mission.id),mission);
  }else{
    demo.missions[mission.id]=mission;saveDemo();
  }
  await sendAutoMessage(seatId,"Nouvelle mission","Une nouvelle mission vous a été attribuée : "+missionName(mission.type)+".");
  renderTeacher();
});

async function renderTeacher(){
  const workshops = configured
    ? await teacherWorkshopsFirebase()
    : Object.values(demo.workshops).filter(w=>w.teacherUid===(state.teacher?.uid||"demo-teacher"));

  state.teacherGroups=sortedTeacherGroups(workshops);

  if(!state.workshop && state.teacherGroups.length){
    state.workshop=state.teacherGroups.find(g=>!groupMeta(g.id).archived)||state.teacherGroups[0];
  }else if(state.workshop){
    const refreshed=state.teacherGroups.find(g=>g.id===state.workshop.id);
    if(refreshed)state.workshop=refreshed;
  }

  renderTeacherMetrics();
  renderGroupCards();
  renderGroupsManager();
  renderParticipantsDirectory();
  renderActivityFeed();

  const info=$("#workshopInfo");
  if(!state.workshop){
    if(info)info.classList.add("hidden");
    if($("#participantsGrid"))$("#participantsGrid").innerHTML='<div class="empty-state">Créez un groupe pour commencer.</div>';
    if($("#missionSeat"))$("#missionSeat").innerHTML="";
    renderTeacherConversations();
    return;
  }

  if(info){
    info.classList.remove("hidden");
    info.innerHTML=`<strong>Groupe actif : ${esc(state.workshop.name)}</strong><br><small>Code atelier : ${esc(state.workshop.code)}</small>`;
  }

  const seats=state.workshop.seats||[];
  if($("#participantsGrid")){
    $("#participantsGrid").innerHTML=seats.map((s,i)=>`
      <div class="participant">
        <div class="name">${s.claimed?esc(s.displayName):"Participant "+(i+1)}</div>
        <div class="status">${s.claimed?"Connecté":"Place disponible"} · code <span class="seat-code">${esc(s.seatCode)}</span></div>
        <div class="status">${s.level?levelName(s.level):""}</div>
      </div>`).join("");
  }
  if($("#missionSeat"))$("#missionSeat").innerHTML=seats.map((s,i)=>`<option value="${s.id}">${s.claimed?esc(s.displayName):"Participant "+(i+1)} — ${s.seatCode}</option>`).join("");
  renderTeacherConversations();
}

function renderTeacherMetrics(){
  const groups=state.teacherGroups||[];
  const activeGroups=groups.filter(g=>!groupMeta(g.id).archived);
  const participants=groups.reduce((n,g)=>n+(g.seats||[]).filter(s=>s.claimed).length,0);
  const set=(id,value)=>{const el=document.getElementById(id);if(el)el.textContent=String(value);};
  set("metricGroups",activeGroups.length);
  set("metricParticipants",participants);
  if(configured){set("metricMissions","—");set("metricMessages","—");}
  else{
    set("metricMissions",Object.values(demo.missions||{}).filter(m=>m.status!=="done").length);
    set("metricMessages",Object.values(demo.messages||{}).filter(m=>m.to==="teacher"&&!m.read).length);
  }
  set("statActiveUsers",participants);
  set("statAttention",0);
}

function groupCardHTML(g){
  const meta=groupMeta(g.id);
  const claimed=(g.seats||[]).filter(s=>s.claimed).length;
  return `<article class="geek-group-card ${meta.favorite?"favorite":""} ${meta.archived?"archived":""}">
    <div class="group-card-top"><div><div class="group-card-title">${esc(g.name)}</div><div class="group-card-meta">${claimed}/${(g.seats||[]).length} participant(s) · code ${esc(g.code)}</div></div><span>${meta.favorite?"★":meta.archived?"ARCH":"●"}</span></div>
    <div class="group-card-actions"><button class="icon-btn" onclick="window.selectTeacherGroup('${g.id}')">Ouvrir</button><button class="icon-btn" onclick="window.renameTeacherGroup('${g.id}')">Renommer</button><button class="icon-btn" onclick="window.toggleFavoriteGroup('${g.id}')">${meta.favorite?"Retirer ★":"Favori ★"}</button><button class="icon-btn" onclick="window.toggleArchiveGroup('${g.id}')">${meta.archived?"Réactiver":"Archiver"}</button></div>
  </article>`;
}

function filteredTeacherGroups(){
  let groups=state.teacherGroups||[];
  const q=(document.getElementById("teacherGlobalSearch")?.value||"").toLowerCase().trim();
  const filter=document.getElementById("groupFilterStatus")?.value||"all";
  return groups.filter(g=>{
    const meta=groupMeta(g.id);
    if(q&&!String(g.name).toLowerCase().includes(q)&&!(g.seats||[]).some(s=>String(s.displayName||"").toLowerCase().includes(q)))return false;
    if(filter==="active"&&meta.archived)return false;
    if(filter==="favorite"&&!meta.favorite)return false;
    if(filter==="archived"&&!meta.archived)return false;
    return true;
  });
}

function renderGroupCards(){
  const c=document.getElementById("groupCards");if(!c)return;
  const groups=filteredTeacherGroups();
  c.innerHTML=groups.length?groups.slice(0,6).map(groupCardHTML).join(""):'<div class="empty-state">Aucun groupe trouvé.</div>';
}

function renderGroupsManager(){
  const c=document.getElementById("groupsManager");if(!c)return;
  const groups=filteredTeacherGroups();
  c.innerHTML=groups.length?groups.map(g=>{const meta=groupMeta(g.id);return `<div class="group-manager-row"><div><div class="group-manager-name">${esc(g.name)}</div><div class="group-manager-meta">Code ${esc(g.code)} · ${(g.seats||[]).length} place(s)</div></div><div>${meta.favorite?"★ Favori":"Standard"}</div><div>${meta.archived?"Archivé":"Actif"}</div><div class="group-card-actions"><button class="icon-btn" onclick="window.moveTeacherGroup('${g.id}',-1)">↑</button><button class="icon-btn" onclick="window.moveTeacherGroup('${g.id}',1)">↓</button><button class="icon-btn" onclick="window.renameTeacherGroup('${g.id}')">✎</button></div></div>`;}).join(""):'<div class="empty-state">Aucun groupe.</div>';
}

function renderParticipantsDirectory(){
  const c=document.getElementById("participantsDirectory");if(!c)return;
  const cards=[];
  (state.teacherGroups||[]).forEach(g=>(g.seats||[]).filter(s=>s.claimed).forEach(s=>cards.push(`<article class="participant-profile-card"><h3>${esc(s.displayName||"Participant")}</h3><div class="meta">${esc(g.name)} · ${levelName(s.level||"beginner")}</div><div class="progress-track"><span style="width:35%"></span></div><div class="meta">Progression détaillée à venir avec les profils permanents.</div><button class="icon-btn" onclick="window.selectTeacherGroup('${g.id}')">Ouvrir le groupe</button></article>`)));
  c.innerHTML=cards.length?cards.join(""):'<div class="empty-state">Aucun participant connecté.</div>';
}

function renderActivityFeed(){
  const c=document.getElementById("activityFeed");if(!c)return;
  const items=(state.teacherGroups||[]).slice(0,4).map(g=>`<div class="activity-item"><strong>${esc(g.name)}</strong><br>${(g.seats||[]).filter(s=>s.claimed).length} participant(s) connecté(s)</div>`);
  c.innerHTML=items.length?items.join(""):'<div class="empty-state">Aucune activité récente.</div>';
}

window.selectTeacherGroup=async id=>{const g=(state.teacherGroups||[]).find(x=>x.id===id);if(!g)return;state.workshop=g;await renderTeacher();switchTeacherView("dashboard");};
window.renameTeacherGroup=async id=>{const g=(state.teacherGroups||[]).find(x=>x.id===id);if(!g)return;const next=prompt("Nouveau nom du groupe :",g.name);if(!next||!next.trim())return;g.name=next.trim();if(configured)await firebase.updateDoc(firebase.doc(firebase.db,"workshops",id),{name:g.name});else{demo.workshops[id].name=g.name;saveDemo();}await renderTeacher();};
window.toggleFavoriteGroup=id=>{const m=groupMeta(id);patchGroupMeta(id,{favorite:!m.favorite});state.teacherGroups=sortedTeacherGroups(state.teacherGroups||[]);renderTeacher();};
window.toggleArchiveGroup=id=>{const m=groupMeta(id);patchGroupMeta(id,{archived:!m.archived});state.teacherGroups=sortedTeacherGroups(state.teacherGroups||[]);renderTeacher();};
window.moveTeacherGroup=(id,delta)=>{const groups=state.teacherGroups||[];const idx=groups.findIndex(g=>g.id===id),next=idx+delta;if(idx<0||next<0||next>=groups.length)return;const a=groups[idx],b=groups[next],ma=groupMeta(a.id),mb=groupMeta(b.id);patchGroupMeta(a.id,{order:mb.order===999?next:mb.order});patchGroupMeta(b.id,{order:ma.order===999?idx:ma.order});state.teacherGroups=sortedTeacherGroups(groups);renderTeacher();};

function switchTeacherView(name){
  document.querySelectorAll(".teacher-view").forEach(v=>v.classList.remove("active"));
  document.querySelectorAll(".teacher-nav-btn").forEach(b=>b.classList.toggle("active",b.dataset.teacherView===name));
  const id="teacherView"+name.charAt(0).toUpperCase()+name.slice(1);
  document.getElementById(id)?.classList.add("active");
}

async function teacherWorkshopsFirebase(){
  const q=firebase.query(firebase.collection(firebase.db,"workshops"),firebase.where("teacherUid","==",state.teacher.uid));
  const snap=await firebase.getDocs(q); const out=[];
  for(const d of snap.docs){
    const seatsSnap=await firebase.getDocs(firebase.collection(firebase.db,"workshops",d.id,"seats"));
    out.push({id:d.id,...d.data(),seats:seatsSnap.docs.map(x=>({id:x.id,...x.data()}))});
  }
  return out;
}
async function refreshWorkshopSeats(){
  if(!configured||!state.workshop)return;
  const snap=await firebase.getDocs(firebase.collection(firebase.db,"workshops",state.workshop.id,"seats"));
  state.workshop.seats=snap.docs.map(d=>({id:d.id,...d.data()}));
}

/* -------------------- STUDENT JOIN -------------------- */
$("#joinStudentBtn").addEventListener("click",async()=>{
  const workshopCode=$("#joinWorkshopCode").value.trim();
  const seatCode=$("#joinSeatCode").value.trim();
  const msg=$("#studentJoinMsg");msg.className="msg";msg.textContent="";
  try{
    const found=await findSeat(workshopCode,seatCode);
    if(!found)throw new Error("Codes non reconnus. Vérifiez les chiffres.");
    state.workshop=found.workshop;state.seat=found.seat;
    if(configured){
      let user=firebase.auth.currentUser;
      if(!user)user=(await firebase.signInAnonymously(firebase.auth)).user;
      state.student={uid:user.uid};
    }else state.student={uid:"demo-"+found.seat.id};
    if(found.seat.claimed&&found.seat.displayName){
      state.student.displayName=found.seat.displayName;
      show("studentDashboard"); await renderStudent();
    }else show("studentName");
  }catch(e){msg.className="msg bad";msg.textContent=e.message;}
});

$("#saveStudentNameBtn").addEventListener("click",async()=>{
  const name=$("#studentDisplayName").value.trim().replace(/\s+/g," ").slice(0,30);
  const msg=$("#studentNameMsg");
  if(!name){msg.className="msg bad";msg.textContent="Écrivez un prénom ou un pseudo.";return;}
  state.student.displayName=name;
  state.seat.displayName=name;state.seat.claimed=true;state.seat.studentUid=state.student.uid;
  if(configured){
    await firebase.updateDoc(firebase.doc(firebase.db,"workshops",state.workshop.id,"seats",state.seat.id),{
      displayName:name,claimed:true,studentUid:state.student.uid
    });
  }else{
    const w=demo.workshops[state.workshop.id];
    const seat=w.seats.find(s=>s.id===state.seat.id);Object.assign(seat,state.seat);saveDemo();
  }
  show("studentDashboard");await renderStudent();
});

async function findSeat(workshopCode,seatCode){
  if(configured){
    const wq=firebase.query(firebase.collection(firebase.db,"workshops"),firebase.where("code","==",workshopCode),firebase.limit(1));
    const ws=await firebase.getDocs(wq);if(ws.empty)return null;
    const wd=ws.docs[0]; const ss=await firebase.getDocs(firebase.collection(firebase.db,"workshops",wd.id,"seats"));
    const seatDoc=ss.docs.find(d=>d.data().seatCode===seatCode);if(!seatDoc)return null;
    return {workshop:{id:wd.id,...wd.data()},seat:{id:seatDoc.id,...seatDoc.data()}};
  }
  const workshop=Object.values(demo.workshops).find(w=>w.code===workshopCode);
  if(!workshop)return null;
  const seat=workshop.seats.find(s=>s.seatCode===seatCode);
  return seat?{workshop,seat}:null;
}

/* -------------------- STUDENT DASHBOARD -------------------- */
$("#studentLogoutBtn").addEventListener("click",async()=>{
  state.student=null;state.seat=null;state.workshop=null;show("landing");
});
$("#backStudentDash").addEventListener("click",()=>{show("studentDashboard");renderStudent();});
$("#openMessagesBtn").addEventListener("click",()=>{show("studentMessages");renderStudentMessages();});

async function renderStudent(){
  $$("[data-student-name]").forEach(e=>e.textContent=state.student.displayName||state.seat.displayName||"Participant");
  $("#studentWorkshopLabel").textContent=state.workshop.name+" · niveau "+levelName(state.seat.level||"beginner");
  const missions=await getStudentMissions();
  $("#studentMissions").innerHTML=missions.length?missions.map(m=>`
    <div class="mission-card ${m.status!=="done"?"active":""}">
      <strong>${esc(missionName(m.type))}</strong><br>
      <span class="level-tag">${esc(levelName(m.level))}</span>
      <div class="status">${m.status==="done"?"✓ Terminée":m.status==="assigned"?"À commencer":"En cours"}</div>
      <button class="primary" onclick="window.startMission('${m.id}')">${m.status==="done"?"Revoir":"Ouvrir la mission"}</button>
    </div>`).join(""):'<p>Aucune mission pour le moment.</p>';
  const messages=await getMessagesForSeat(state.seat.id);
  const unread=messages.filter(m=>m.to==="student"&&!m.read).length;
  $("#studentUnread").textContent=unread+" nouveau(x)";
  $("#studentMessagesPreview").innerHTML=messages.slice(-3).reverse().map(m=>`<div class="message-box"><strong>${esc(m.subject||"Message")}</strong><br><small>${esc(m.text.slice(0,90))}</small></div>`).join("")||"<p>Aucun message.</p>";
  renderAchievements();
}
async function getStudentMissions(){
  if(configured){
    const q=firebase.query(firebase.collection(firebase.db,"missions"),firebase.where("workshopId","==",state.workshop.id),firebase.where("seatId","==",state.seat.id));
    const s=await firebase.getDocs(q);return s.docs.map(d=>({id:d.id,...d.data()})).sort((a,b)=>b.createdAt-a.createdAt);
  }
  return Object.values(demo.missions).filter(m=>m.workshopId===state.workshop.id&&m.seatId===state.seat.id).sort((a,b)=>b.createdAt-a.createdAt);
}
window.startMission=async id=>{
  const missions=await getStudentMissions();state.currentMission=missions.find(m=>m.id===id);
  show("missionScreen");renderMission();
};

/* -------------------- MISSIONS -------------------- */
function progress(step,total=4){return `<div class="mission-progress">${Array.from({length:total},(_,i)=>`<i class="${i<step?"done":i===step?"current":""}"></i>`).join("")}</div>`;}
function learnerHelp(text){return state.currentMission.level==="beginner"?`<div class="alert good">💡 ${text}</div>`:"";}

function renderMission(){
  const m=state.currentMission;if(!m)return;
  if(m.type==="download_doc")renderDownloadMission(m);
  else if(m.type==="fill_form")renderFillFormMission(m);
  else if(m.type==="keyboard_skills")renderKeyboardSkillsMission(m);
  else if(m.type==="mouse_nav")renderMouseNavigationMission(m);
  else if(m.type==="missing_piece")renderMissingPieceMission(m);
  else if(m.type==="suspicious_mail")renderSuspiciousMission(m);
  else renderFullMission(m);
}

function renderDownloadMission(m){
  const step=m.step||0, box=$("#missionContent");
  if(step===0){
    box.innerHTML=`<p class="eyebrow">Mission</p><h1>Télécharger une attestation</h1>${progress(0,3)}
      <div class="mission-step"><h2>Objectif</h2><p>Récupérez une attestation fictive et téléchargez-la sur cet ordinateur.</p>${learnerHelp("Commencez par cliquer sur le bouton ci-dessous.")}<button class="primary" onclick="window.missionNext()">Commencer</button></div>`;
  }else if(step===1){
    box.innerHTML=`<p class="eyebrow">Simulation administrative</p><h1>Mes documents</h1>${progress(1,3)}
      <div class="fake-admin"><div class="fake-admin-head">Mon espace personnel</div><div class="fake-admin-body"><div class="doc-grid">
      <button class="doc-button" onclick="window.chooseTrainingDoc('attestation_droits')"><strong>📄 Attestation de droits</strong><br><small>PDF</small></button>
      <button class="doc-button" onclick="window.chooseTrainingDoc('releve')"><strong>📄 Relevé de situation</strong><br><small>PDF</small></button>
      <button class="doc-button" onclick="window.chooseTrainingDoc('paiement')"><strong>📄 Attestation de paiement</strong><br><small>PDF</small></button>
      <button class="doc-button" onclick="window.chooseTrainingDoc('domicile')"><strong>📄 Justificatif d'exercice</strong><br><small>PDF</small></button>
      </div></div></div>`;
  }else{
    box.innerHTML=`<p class="eyebrow">Mission terminée</p><h1>Bravo ${esc(state.student.displayName)} 🎉</h1>${progress(3,3)}
      <div class="alert good">Vous avez téléchargé un document.</div>${quizHTML("download")}`;
  }
}
window.chooseTrainingDoc=async type=>{
  const names={attestation_droits:"attestation_droits",releve:"releve_situation",paiement:"attestation_paiement",domicile:"justificatif_domicile"};
  downloadTextPdfLike(names[type]+"_"+safeName(state.student.displayName)+".txt","DOCUMENT D'EXERCICE\n\n"+names[type]+"\nNom : "+state.student.displayName+"\n\nDocument fictif.");
  await setMissionStep(2);await addAchievement("download","J'ai téléchargé un fichier");renderMission();
};




const fakeSites = {
  impots: {
    name:"Impôts — simulation",
    url:"simulation.local/impots",
    brand:"impots.gouv — EXERCICE",
    tabs:[
      {id:"accueil",label:"Accueil",title:"Bienvenue sur votre espace fiscal fictif",text:"Cette page d'exercice vous permet de vous entraîner à repérer les principales rubriques.",cards:["Déclarer mes revenus","Consulter mes documents","Payer en ligne"]},
      {id:"particulier",label:"Particulier",title:"Espace particulier fictif",text:"Retrouvez des démarches courantes pour un particulier.",cards:["Déclaration de revenus","Avis d'impôt","Prélèvement à la source"]},
      {id:"professionnel",label:"Professionnel",title:"Espace professionnel fictif",text:"Cette rubrique regroupe des services destinés aux professionnels.",cards:["TVA","Impôt sur les sociétés","Messagerie professionnelle"]},
      {id:"documents",label:"Mes documents",title:"Documents fiscaux fictifs",text:"Exercez-vous à repérer les documents disponibles.",cards:["Avis d'impôt","Déclaration","Justificatif de situation"]},
      {id:"contact",label:"Contact",title:"Contacter le service fictif",text:"Choisissez un moyen de contact simulé.",cards:["Messagerie sécurisée","Téléphone","Rendez-vous"]}
    ]
  },

  ameli: {
    name:"Ameli — simulation",
    url:"simulation.local/ameli",
    brand:"ameli — EXERCICE",
    tabs:[
      {id:"accueil",label:"Accueil",title:"Bienvenue sur l'espace santé fictif",text:"Explorez les grandes rubriques comme sur un site administratif.",cards:["Mes remboursements","Mes attestations","Ma carte Vitale"]},
      {id:"assure",label:"Assuré",title:"Espace assuré fictif",text:"Retrouvez les services courants destinés aux assurés.",cards:["Remboursements","Attestation de droits","Carte européenne"]},
      {id:"professionnel",label:"Professionnel de santé",title:"Espace professionnel fictif",text:"Cette rubrique est destinée aux professionnels de santé.",cards:["Facturation","Convention","Téléservices"]},
      {id:"entreprise",label:"Entreprise",title:"Espace entreprise fictif",text:"Rubrique d'entraînement dédiée aux employeurs.",cards:["Arrêts de travail","Cotisations","Déclarations"]},
      {id:"annuaire",label:"Annuaire santé",title:"Annuaire fictif",text:"Exercez-vous à rechercher une catégorie de professionnel.",cards:["Médecin","Pharmacie","Infirmier"]}
    ]
  },

  msa: {
    name:"MSA — simulation",
    url:"simulation.local/msa",
    brand:"MSA — EXERCICE",
    tabs:[
      {id:"accueil",label:"Accueil",title:"Bienvenue sur la MSA fictive",text:"Cette simulation sert uniquement à apprendre à naviguer à la souris.",cards:["Mes services","Mes paiements","Mes attestations"]},
      {id:"particulier",label:"Particulier",title:"Espace particulier fictif",text:"Retrouvez des services sociaux et administratifs fictifs.",cards:["Prestations","Santé","Retraite"]},
      {id:"exploitant",label:"Exploitant",title:"Espace exploitant fictif",text:"Rubrique d'exercice destinée aux exploitants agricoles.",cards:["Cotisations","Déclarations","Aides"]},
      {id:"employeur",label:"Employeur",title:"Espace employeur fictif",text:"Rubrique d'exercice destinée aux employeurs.",cards:["Salariés","Déclarations sociales","Paiements"]},
      {id:"contact",label:"Contact",title:"Contacter la MSA fictive",text:"Choisissez un moyen de contact simulé.",cards:["Messagerie","Téléphone","Rendez-vous"]}
    ]
  }
};

let mouseNavState=null;

function renderMouseNavigationMission(m){
  const step=m.step||0;
  const box=$("#missionContent");

  if(step===0){
    const help = m.level==="beginner"
      ? "Vous aurez des indications précises sur les onglets à ouvrir."
      : m.level==="intermediate"
      ? "Vous devrez retrouver plusieurs rubriques avec moins d'aide."
      : "Vous devrez explorer librement et retrouver les rubriques demandées.";

    box.innerHTML=`<div class="mouse-mission">
      <p class="eyebrow">Mission souris</p>
      <h1>Explorer des sites administratifs fictifs</h1>
      ${progress(0,3)}
      <div class="mission-step">
        <h2>Objectif</h2>
        <p>Entraînez-vous à pointer, cliquer et changer de rubrique.</p>
        <div class="mouse-hint">${help}</div>
        <div class="mouse-site-picker">
          <button class="mouse-site-card" onclick="window.startMouseSite('impots')">
            <div>💶</div><strong>Impôts</strong><span>Particulier, Professionnel, Documents, Contact…</span>
          </button>
          <button class="mouse-site-card" onclick="window.startMouseSite('ameli')">
            <div>🩺</div><strong>Ameli</strong><span>Assuré, Professionnel de santé, Entreprise, Annuaire…</span>
          </button>
          <button class="mouse-site-card" onclick="window.startMouseSite('msa')">
            <div>🌾</div><strong>MSA</strong><span>Particulier, Exploitant, Employeur, Contact…</span>
          </button>
        </div>
        <div class="training-watermark">⚠ SIMULATION PÉDAGOGIQUE — aucun vrai site administratif</div>
      </div>
    </div>`;
    return;
  }

  if(step===1){
    renderFakeAdministrativeSite();
    return;
  }

  box.innerHTML=`<div class="mouse-mission">
    <p class="eyebrow">Mission terminée</p>
    <h1>Bravo ${esc(state.student.displayName)} 🎉</h1>
    ${progress(3,3)}
    <div class="mouse-finish">
      <strong>Vous avez exploré plusieurs rubriques avec la souris.</strong><br>
      Vous savez maintenant repérer les onglets principaux et changer de page.
    </div>
    ${quizHTML("mouse_nav")}
  </div>`;
}

window.startMouseSite=async siteId=>{
  const site=fakeSites[siteId];
  if(!site)return;

  const level=state.currentMission?.level || "beginner";
  const allTargets = site.tabs.filter(t=>t.id!=="accueil").map(t=>t.id);

  let targets;
  if(level==="beginner")targets=allTargets.slice(0,2);
  else if(level==="intermediate")targets=allTargets.slice(0,3);
  else targets=allTargets;

  mouseNavState={
    siteId,
    activeTab:"accueil",
    visited:["accueil"],
    targets,
    clicks:0,
    cardClicks:0
  };

  await setMissionStep(1);
  renderMission();
};

function renderFakeAdministrativeSite(){
  const box=$("#missionContent");
  const st=mouseNavState;
  if(!st){
    state.currentMission.step=0;
    renderMouseNavigationMission(state.currentMission);
    return;
  }

  const site=fakeSites[st.siteId];
  const page=site.tabs.find(t=>t.id===st.activeTab)||site.tabs[0];
  const level=state.currentMission.level;

  const hint = level==="beginner"
    ? `Cliquez sur : ${st.targets.map(id=>site.tabs.find(t=>t.id===id)?.label).join(" puis ")}.`
    : level==="intermediate"
    ? `Retrouvez et ouvrez ${st.targets.length} rubriques différentes.`
    : `Explorez toutes les grandes rubriques du site fictif.`;

  box.innerHTML=`<div class="mouse-mission">
    <p class="eyebrow">Navigation souris</p>
    <h1>${esc(site.name)}</h1>
    ${progress(1,3)}

    <div class="mouse-progress-box">
      <div>
        <strong>Mission :</strong> ${esc(hint)}
        <div class="mouse-target-list">
          ${st.targets.map(id=>{
            const tab=site.tabs.find(t=>t.id===id);
            return `<span class="mouse-target ${st.visited.includes(id)?"done":""}">${st.visited.includes(id)?"✓ ":""}${esc(tab?.label||id)}</span>`;
          }).join("")}
        </div>
      </div>
      <div class="click-counter">Clics : ${st.clicks}</div>
    </div>

    <div class="fake-site">
      <div class="training-watermark">⚠ SITE FICTIF — EXERCICE DE NAVIGATION — aucune donnée réelle</div>
      <div class="fake-site-top">
        <div class="fake-site-brand">${esc(site.brand)}</div>
        <div class="fake-site-url">${esc(site.url)}</div>
      </div>

      <nav class="fake-site-nav" aria-label="Navigation fictive">
        ${site.tabs.map(tab=>`
          <button type="button"
            class="${tab.id===st.activeTab?"active":""}"
            onclick="window.openFakeSiteTab('${tab.id}')">
            ${esc(tab.label)}
          </button>`).join("")}
      </nav>

      <div class="fake-site-body">
        <div class="fake-page-hero">
          <h2>${esc(page.title)}</h2>
          <p>${esc(page.text)}</p>
        </div>

        <div class="fake-page-grid">
          ${page.cards.map((card,i)=>`
            <div class="fake-action-card">
              <h4>${esc(card)}</h4>
              <p>Contenu fictif pour s'entraîner à cliquer et se repérer.</p>
              <button class="secondary" type="button" onclick="window.fakeCardClick('${page.id}',${i})">Ouvrir</button>
            </div>`).join("")}
        </div>

        <div id="fakeCardFeedback"></div>
      </div>
    </div>

    <div id="mouseMissionFeedback"></div>
  </div>`;

  checkMouseMissionCompletion();
}

window.openFakeSiteTab=tabId=>{
  if(!mouseNavState)return;

  mouseNavState.clicks++;
  mouseNavState.activeTab=tabId;
  if(!mouseNavState.visited.includes(tabId))mouseNavState.visited.push(tabId);

  renderFakeAdministrativeSite();
};

window.fakeCardClick=(pageId,index)=>{
  if(!mouseNavState)return;
  mouseNavState.clicks++;
  mouseNavState.cardClicks++;

  const site=fakeSites[mouseNavState.siteId];
  const page=site.tabs.find(t=>t.id===pageId);
  const card=page?.cards?.[index];

  const feedback=document.getElementById("fakeCardFeedback");
  if(feedback){
    feedback.innerHTML=`<div class="mouse-hint"><strong>${esc(card||"Rubrique")}</strong><br>
      Cette sous-page est fictive. Le clic a bien été pris en compte.</div>`;
  }

  const counter=document.querySelector(".click-counter");
  if(counter)counter.textContent="Clics : "+mouseNavState.clicks;
};

function checkMouseMissionCompletion(){
  if(!mouseNavState)return;

  const complete=mouseNavState.targets.every(id=>mouseNavState.visited.includes(id));
  const feedback=document.getElementById("mouseMissionFeedback");

  if(complete && feedback){
    feedback.innerHTML=`<div class="mouse-finish">
      <strong>Parcours réussi !</strong><br>
      Vous avez ouvert toutes les rubriques demandées.
    </div>
    <button class="primary" type="button" onclick="window.finishMouseNavigation()">Terminer cette mission →</button>`;
  }
}

window.finishMouseNavigation=async()=>{
  await addAchievement("mouse_nav","J'ai exploré un site administratif fictif à la souris");
  await setMissionStep(2);
  await completeMission();
  renderMission();
};


function renderKeyboardSkillsMission(m){
  const step=m.step||0;
  const box=$("#missionContent");

  if(step===0){
    const description = m.level==="beginner"
      ? "Vous allez découvrir les touches essentielles une par une."
      : m.level==="intermediate"
      ? "Vous allez enchaîner plusieurs gestes clavier sans reprendre la souris."
      : "Vous allez réaliser un parcours presque entièrement au clavier.";

    box.innerHTML=`<div class="keyboard-mission">
      <p class="eyebrow">Mission clavier</p>
      <h1>Maîtriser les touches essentielles</h1>
      ${progress(0,3)}
      <div class="keyboard-card">
        <h2>Votre défi</h2>
        <p>${description}</p>
        <div class="key-sequence">
          <span class="keycap">Tab ↹</span>
          <span class="keycap">Maj ⇧</span>
          <span class="keycap">Entrée ↵</span>
          <span class="keycap">Espace</span>
          <span class="keycap">← ↑ ↓ →</span>
          <span class="keycap">⌫</span>
          <span class="keycap">@</span>
        </div>
        <div class="keyboard-note">
          Les textes et données de cet exercice sont fictifs.
        </div>
        <button class="primary" onclick="window.startKeyboardSkills()">Commencer</button>
      </div>
    </div>`;
    return;
  }

  if(step===1){
    box.innerHTML=buildKeyboardPractice(m.level);
    setupKeyboardPractice(m.level);
    return;
  }

  box.innerHTML=`<div class="keyboard-mission">
    <p class="eyebrow">Mission terminée</p>
    <h1>Bravo ${esc(state.student.displayName)} 🎉</h1>
    ${progress(3,3)}
    <div class="keyboard-success">
      <strong>Vous avez terminé le parcours clavier.</strong><br>
      Vous avez utilisé plusieurs touches sans dépendre uniquement de la souris.
    </div>
    ${quizHTML("keyboard")}
  </div>`;
}

function buildKeyboardPractice(level){
  const beginnerHelp = level==="beginner" ? `
    <div class="keyboard-note">
      <strong>Astuce :</strong> regardez la consigne, puis utilisez la touche indiquée.
      Vous pouvez prendre votre temps.
    </div>` : "";

  const intermediateHelp = level==="intermediate" ? `
    <div class="keyboard-note">
      <strong>Défi intermédiaire :</strong> après le premier clic, essayez de continuer sans souris.
    </div>` : "";

  const expertHelp = level==="expert" ? `
    <div class="keyboard-note">
      <strong>Défi expert :</strong> après le premier champ, utilisez uniquement le clavier jusqu'à la validation.
    </div>` : "";

  return `<div class="keyboard-mission">
    <p class="eyebrow">Exercice pratique</p>
    <h1>Parcours clavier</h1>
    ${progress(1,3)}
    ${beginnerHelp}${intermediateHelp}${expertHelp}

    <div class="keyboard-meter"><div id="keyboardMeterFill"></div></div>

    <div class="key-live">
      <span class="key-state" id="stateBackspace">⌫ Retour arrière</span>
      <span class="key-state" id="stateUppercase">⇧ Majuscule</span>
      <span class="key-state" id="stateAt">@</span>
      <span class="key-state" id="stateTab">Tab ↹</span>
      <span class="key-state" id="stateShiftTab">Maj + Tab</span>
      <span class="key-state" id="stateArrow">Flèches</span>
      <span class="key-state" id="stateSpace">Espace</span>
      <span class="key-state" id="stateEnter">Entrée ↵</span>
    </div>

    <div class="keyboard-step-list">
      <div class="keyboard-step current" id="kstep1">
        <strong>1. Corriger avec Retour arrière</strong><br>
        Tapez exactement : <b>Bonjour</b>. Commencez volontairement par écrire <b>Bonjouur</b>, puis corrigez avec <span class="keycap">⌫</span>.
        <div class="keyboard-practice-box">
          <input id="kbCorrection" class="keyboard-big-input" type="text" autocomplete="off" placeholder="Tapez ici">
        </div>
      </div>

      <div class="keyboard-step" id="kstep2">
        <strong>2. Écrire une majuscule</strong><br>
        Tapez exactement : <b>Paris</b>, avec un P majuscule.
        <div class="keyboard-practice-box">
          <input id="kbUppercase" class="keyboard-big-input" type="text" autocomplete="off" placeholder="Paris">
        </div>
      </div>

      <div class="keyboard-step" id="kstep3">
        <strong>3. Écrire une adresse e-mail</strong><br>
        Tapez : <b>exercice@exemple.fr</b>.
        <div class="keyboard-practice-box">
          <input id="kbEmail" class="keyboard-big-input" type="text" autocomplete="off" spellcheck="false" placeholder="exercice@exemple.fr">
        </div>
      </div>

      <div class="keyboard-step" id="kstep4">
        <strong>4. Naviguer avec Tab</strong><br>
        Passez au champ suivant avec <span class="keycap">Tab ↹</span>.
        <div class="keyboard-practice-box">
          <input id="kbTabOne" data-label="Champ Tab 1" class="keyboard-big-input" type="text" value="Champ 1">
          <input id="kbTabTwo" data-label="Champ Tab 2" class="keyboard-big-input" type="text" value="Champ 2" style="margin-top:10px">
        </div>
      </div>

      <div class="keyboard-step" id="kstep5">
        <strong>5. Revenir avec Maj + Tab</strong><br>
        Depuis le second champ, revenez au premier avec <span class="keycap">Maj ⇧</span> + <span class="keycap">Tab ↹</span>.
        <div class="keyboard-practice-box">
          <input id="kbShiftOne" data-label="Retour 1" class="keyboard-big-input" type="text" value="Premier">
          <input id="kbShiftTwo" data-label="Retour 2" class="keyboard-big-input" type="text" value="Second" style="margin-top:10px">
        </div>
      </div>

      <div class="keyboard-step" id="kstep6">
        <strong>6. Utiliser les flèches</strong><br>
        Placez-vous sur la liste et changez de choix avec les flèches.
        <div class="keyboard-practice-box">
          <select id="kbSelect" class="keyboard-select">
            <option value="">— Choisir —</option>
            <option value="ameli">Ameli</option>
            <option value="impots">Impôts</option>
            <option value="msa">MSA</option>
          </select>
        </div>
      </div>

      <div class="keyboard-step" id="kstep7">
        <strong>7. Cocher avec Espace</strong><br>
        Placez le focus sur la case avec Tab puis appuyez sur <span class="keycap">Espace</span>.
        <div class="keyboard-practice-box">
          <label class="keyboard-checkbox">
            <input id="kbCheckbox" type="checkbox">
            <span>Je confirme avoir fait l'exercice.</span>
          </label>
        </div>
      </div>

      <div class="keyboard-step" id="kstep8">
        <strong>8. Valider avec Entrée</strong><br>
        Atteignez le bouton avec Tab et activez-le avec <span class="keycap">Entrée ↵</span>.
        <div class="keyboard-practice-box">
          <button id="kbEnterButton" class="primary" type="button">Valider au clavier</button>
        </div>
      </div>
    </div>

    <div id="keyboardPracticeFeedback"></div>
  </div>`;
}

let keyboardStats=null;

function setupKeyboardPractice(level){
  keyboardStats={
    backspace:false,
    uppercase:false,
    at:false,
    tab:false,
    shiftTab:false,
    arrow:false,
    space:false,
    enter:false,
    tabCount:0,
    mouseAfterStart:0,
    level
  };

  const keys = ["backspace","uppercase","at","tab","shiftTab","arrow","space","enter"];

  function refreshKeyboardUI(){
    const idMap={
      backspace:"stateBackspace",
      uppercase:"stateUppercase",
      at:"stateAt",
      tab:"stateTab",
      shiftTab:"stateShiftTab",
      arrow:"stateArrow",
      space:"stateSpace",
      enter:"stateEnter"
    };
    let done=0;
    keys.forEach(k=>{
      const el=document.getElementById(idMap[k]);
      if(el)el.classList.toggle("done",!!keyboardStats[k]);
      if(keyboardStats[k])done++;
    });
    const meter=document.getElementById("keyboardMeterFill");
    if(meter)meter.style.width=(done/keys.length*100)+"%";

    const stepRules=[
      keyboardStats.backspace && document.getElementById("kbCorrection")?.value==="Bonjour",
      keyboardStats.uppercase && document.getElementById("kbUppercase")?.value==="Paris",
      keyboardStats.at && document.getElementById("kbEmail")?.value==="exercice@exemple.fr",
      keyboardStats.tab,
      keyboardStats.shiftTab,
      keyboardStats.arrow && !!document.getElementById("kbSelect")?.value,
      keyboardStats.space && !!document.getElementById("kbCheckbox")?.checked,
      keyboardStats.enter
    ];
    stepRules.forEach((ok,i)=>{
      const el=document.getElementById("kstep"+(i+1));
      if(!el)return;
      el.classList.toggle("done",!!ok);
      el.classList.toggle("current",!ok && stepRules.slice(0,i).every(Boolean));
    });
  }

  document.addEventListener("mousedown",keyboardMouseTracker,true);

  const correction=document.getElementById("kbCorrection");
  correction?.addEventListener("keydown",e=>{
    if(e.key==="Backspace"){keyboardStats.backspace=true;refreshKeyboardUI();}
  });
  correction?.addEventListener("input",refreshKeyboardUI);

  const upper=document.getElementById("kbUppercase");
  upper?.addEventListener("keydown",e=>{
    if(e.key.length===1 && e.key.toUpperCase()===e.key && /[A-ZÀÂÄÉÈÊËÎÏÔÖÙÛÜÇ]/.test(e.key)){
      if(e.shiftKey || e.getModifierState?.("CapsLock")) keyboardStats.uppercase=true;
    }
    if(e.key==="Tab"){keyboardStats.tab=true;keyboardStats.tabCount++;refreshKeyboardUI();}
  });
  upper?.addEventListener("input",refreshKeyboardUI);

  const email=document.getElementById("kbEmail");
  email?.addEventListener("keydown",e=>{
    if(e.key==="@")keyboardStats.at=true;
    if(e.key==="Tab"){keyboardStats.tab=true;keyboardStats.tabCount++;}
    refreshKeyboardUI();
  });
  email?.addEventListener("input",()=>{
    if(email.value.includes("@"))keyboardStats.at=true;
    refreshKeyboardUI();
  });

  const allInputs=[...document.querySelectorAll("#missionContent input,#missionContent select,#missionContent button")];
  allInputs.forEach(el=>{
    el.addEventListener("keydown",e=>{
      if(e.key==="Tab"){
        if(e.shiftKey)keyboardStats.shiftTab=true;
        else keyboardStats.tab=true;
        keyboardStats.tabCount++;
      }
      if(["ArrowUp","ArrowDown","ArrowLeft","ArrowRight"].includes(e.key))keyboardStats.arrow=true;
      if(e.key===" " && el.id==="kbCheckbox")keyboardStats.space=true;
      if(e.key==="Enter" && el.id==="kbEnterButton"){
        keyboardStats.enter=true;
        e.preventDefault();
        validateKeyboardPractice();
      }
      refreshKeyboardUI();
    });
  });

  document.getElementById("kbSelect")?.addEventListener("change",refreshKeyboardUI);
  document.getElementById("kbCheckbox")?.addEventListener("change",refreshKeyboardUI);
  document.getElementById("kbEnterButton")?.addEventListener("click",e=>{
    // A click produced by pressing Enter has detail=0 in most browsers.
    if(e.detail===0){
      keyboardStats.enter=true;
      refreshKeyboardUI();
      validateKeyboardPractice();
    }else{
      const feedback=document.getElementById("keyboardPracticeFeedback");
      if(feedback)feedback.innerHTML=`<div class="keyboard-error">Essayez d'activer ce bouton avec la touche <strong>Entrée</strong>, pas avec la souris.</div>`;
    }
  });

  setTimeout(()=>document.getElementById("kbCorrection")?.focus(),120);
  refreshKeyboardUI();
}

function keyboardMouseTracker(e){
  if(!keyboardStats)return;
  // Count mouse use after practice starts, but don't block the learner.
  if(document.getElementById("missionContent")?.contains(e.target)){
    keyboardStats.mouseAfterStart++;
  }
}

function validateKeyboardPractice(){
  if(!keyboardStats)return;

  const feedback=document.getElementById("keyboardPracticeFeedback");
  const correction=document.getElementById("kbCorrection")?.value==="Bonjour";
  const upper=document.getElementById("kbUppercase")?.value==="Paris";
  const email=document.getElementById("kbEmail")?.value==="exercice@exemple.fr";
  const select=!!document.getElementById("kbSelect")?.value;
  const checked=!!document.getElementById("kbCheckbox")?.checked;

  const essentials=[
    correction && keyboardStats.backspace,
    upper && keyboardStats.uppercase,
    email && keyboardStats.at,
    keyboardStats.tab,
    select && keyboardStats.arrow,
    checked && keyboardStats.space,
    keyboardStats.enter
  ];

  if(keyboardStats.level!=="beginner"){
    essentials.push(keyboardStats.shiftTab);
  }

  const missing=[];
  if(!correction || !keyboardStats.backspace)missing.push("Retour arrière");
  if(!upper || !keyboardStats.uppercase)missing.push("Majuscule");
  if(!email || !keyboardStats.at)missing.push("@");
  if(!keyboardStats.tab)missing.push("Tab");
  if(keyboardStats.level!=="beginner" && !keyboardStats.shiftTab)missing.push("Maj + Tab");
  if(!select || !keyboardStats.arrow)missing.push("Flèches");
  if(!checked || !keyboardStats.space)missing.push("Espace");

  if(!essentials.every(Boolean)){
    feedback.innerHTML=`<div class="keyboard-error"><strong>Il reste quelques gestes à faire :</strong> ${missing.join(", ")}.</div>`;
    return;
  }

  const minTabs=keyboardStats.level==="beginner"?3:keyboardStats.level==="intermediate"?5:7;
  if(keyboardStats.tabCount<minTabs){
    feedback.innerHTML=`<div class="keyboard-error">Vous avez utilisé Tab ${keyboardStats.tabCount} fois. Pour ce niveau, essayez d'atteindre au moins ${minTabs} déplacements au clavier.</div>`;
    return;
  }

  const mouseNote = keyboardStats.level==="expert" && keyboardStats.mouseAfterStart>2
    ? `<br><small>Défi expert : vous avez repris la souris plusieurs fois. Vous pouvez refaire la mission plus tard en essayant de rester uniquement au clavier.</small>`
    : "";

  feedback.innerHTML=`<div class="keyboard-success"><strong>Parcours clavier réussi !</strong><br>
    ${keyboardStats.tabCount} déplacements avec Tab détectés.${mouseNote}</div>
    <button class="primary" type="button" onclick="window.finishKeyboardSkills()">Terminer la mission →</button>`;
}

window.startKeyboardSkills=async()=>{
  await setMissionStep(1);
  renderMission();
};

window.finishKeyboardSkills=async()=>{
  document.removeEventListener("mousedown",keyboardMouseTracker,true);
  await addAchievement("keyboard","J'ai utilisé les touches essentielles du clavier");
  await setMissionStep(2);
  await completeMission();
  renderMission();
};


function renderFillFormMission(m){
  const step=m.step||0;
  const box=$("#missionContent");

  if(step===0){
    box.innerHTML=`<p class="eyebrow">Mission clavier</p>
      <h1>Remplir un formulaire avec la touche Tab</h1>
      ${progress(0,3)}
      <div class="mission-step">
        <h2>Objectif</h2>
        <p>Vous allez remplir un formulaire fictif en utilisant le clavier.</p>
        ${m.level==="beginner"?`<div class="tab-instruction"><span class="tab-key">Tab ↹</span><div><strong>La règle de l'exercice</strong><br>Après avoir rempli une case, appuyez sur <b>Tab</b> pour passer à la suivante.</div></div>`:""}
        <button class="primary" onclick="window.startTabForm()">Commencer l'exercice</button>
      </div>`;
    return;
  }

  if(step===1){
    const helpBeginner = m.level==="beginner" ? `
      <div class="tab-instruction">
        <span class="tab-key">Tab ↹</span>
        <div><strong>Après chaque champ</strong><br>Appuyez sur Tab pour avancer. Essayez de ne pas reprendre la souris.</div>
      </div>` : "";

    const helpIntermediate = m.level==="intermediate" ? `
      <div class="keyboard-only-reminder"><strong>Défi :</strong> remplissez le formulaire uniquement avec le clavier après avoir cliqué dans le premier champ.</div>` : "";

    const helpExpert = m.level==="expert" ? `
      <div class="keyboard-only-reminder"><strong>Défi expert :</strong> utilisez Tab, Maj + Tab, Espace et les flèches. Ne reprenez pas la souris.</div>` : "";

    box.innerHTML=`<p class="eyebrow">Exercice formulaire</p>
      <h1>Mes informations fictives</h1>
      ${progress(1,3)}
      ${helpBeginner}${helpIntermediate}${helpExpert}

      <div class="tab-status">
        <div class="tab-counter">Tabulations réussies : <span id="tabCount">0</span></div>
        <div class="focus-name">Champ actuel : <strong id="currentFocusName">Prénom</strong></div>
      </div>

      <form id="tabTrainingForm" class="tab-form" onsubmit="return false;">
        <div class="form-row">
          <div class="training-field">
            <label for="tabFirstName">Prénom fictif *</label>
            <input id="tabFirstName" data-label="Prénom" type="text" autocomplete="off" placeholder="Marie">
          </div>
          <div class="training-field">
            <label for="tabLastName">Nom fictif *</label>
            <input id="tabLastName" data-label="Nom" type="text" autocomplete="off" placeholder="Martin">
          </div>
        </div>

        <div class="training-field">
          <label for="tabEmail">Adresse e-mail fictive *</label>
          <input id="tabEmail" data-label="Adresse e-mail" type="text" autocomplete="off" spellcheck="false" placeholder="exercice@exemple.fr">
        </div>

        <div class="form-row">
          <div class="training-field">
            <label for="tabPhone">Téléphone fictif</label>
            <input id="tabPhone" data-label="Téléphone" type="tel" autocomplete="off" placeholder="06 00 00 00 00">
          </div>
          <div class="training-field">
            <label for="tabBirthDate">Date de naissance fictive *</label>
            <input id="tabBirthDate" data-label="Date de naissance" type="date">
          </div>
        </div>

        <div class="training-field">
          <label for="tabSituation">Situation *</label>
          <select id="tabSituation" data-label="Situation">
            <option value="">— Choisir —</option>
            <option>Retraité(e)</option>
            <option>Salarié(e)</option>
            <option>Sans activité</option>
            <option>Autre</option>
          </select>
        </div>

        <div class="form-row">
          <div class="training-field">
            <label for="tabPostal">Code postal fictif *</label>
            <input id="tabPostal" data-label="Code postal" inputmode="numeric" maxlength="5" placeholder="75000">
          </div>
          <div class="training-field">
            <label for="tabCity">Ville fictive *</label>
            <input id="tabCity" data-label="Ville" type="text" autocomplete="off" placeholder="Paris">
          </div>
        </div>

        <div class="training-field">
          <label for="tabMessage">Message fictif</label>
          <textarea id="tabMessage" data-label="Message" rows="3" placeholder="Je souhaite transmettre mon dossier."></textarea>
        </div>

        <label class="checkbox-line">
          <input id="tabConfirm" data-label="Case de confirmation" type="checkbox">
          <span>Je confirme avoir relu les informations.</span>
        </label>

        <button id="tabSubmitButton" data-label="Bouton Valider" class="primary" type="button" onclick="window.validateTabForm()">Valider le formulaire</button>

        <div id="tabFormFeedback"></div>
      </form>`;
    setupTabTraining();
    return;
  }

  box.innerHTML=`<p class="eyebrow">Mission terminée</p>
    <h1>Bravo ${esc(state.student.displayName)} 🎉</h1>
    ${progress(3,3)}
    <div class="alert good">Vous avez rempli un formulaire en vous déplaçant au clavier.</div>
    ${quizHTML("form")}`;
}

window.startTabForm=async()=>{
  await setMissionStep(1);
  renderMission();
};

let tabTrainingCount=0;
let tabTrainingStarted=false;

function setupTabTraining(){
  tabTrainingCount=0;
  tabTrainingStarted=false;

  const form=document.getElementById("tabTrainingForm");
  if(!form)return;

  const focusables=[...form.querySelectorAll("input,select,textarea,button")];

  focusables.forEach((el,index)=>{
    el.addEventListener("focus",()=>{
      const name=document.getElementById("currentFocusName");
      if(name)name.textContent=el.dataset.label || el.id;
    });

    el.addEventListener("keydown",event=>{
      if(event.key==="Tab"){
        tabTrainingCount++;
        tabTrainingStarted=true;
        const counter=document.getElementById("tabCount");
        if(counter)counter.textContent=String(tabTrainingCount);

        const wrapper=el.closest(".training-field");
        if(wrapper)wrapper.classList.add("done");
      }
    });
  });

  // Le premier champ reçoit le focus automatiquement pour inciter à utiliser Tab.
  const first=document.getElementById("tabFirstName");
  if(first)setTimeout(()=>first.focus(),100);
}

window.validateTabForm=async()=>{
  const values={
    first:document.getElementById("tabFirstName").value.trim(),
    last:document.getElementById("tabLastName").value.trim(),
    email:document.getElementById("tabEmail").value.trim(),
    date:document.getElementById("tabBirthDate").value,
    situation:document.getElementById("tabSituation").value,
    postal:document.getElementById("tabPostal").value.trim(),
    city:document.getElementById("tabCity").value.trim(),
    confirm:document.getElementById("tabConfirm").checked
  };

  const missing=[];
  if(!values.first)missing.push("prénom");
  if(!values.last)missing.push("nom");
  if(!values.email)missing.push("adresse e-mail");
  if(!values.date)missing.push("date de naissance");
  if(!values.situation)missing.push("situation");
  if(!values.postal)missing.push("code postal");
  if(!values.city)missing.push("ville");
  if(!values.confirm)missing.push("case de confirmation");

  const feedback=document.getElementById("tabFormFeedback");

  if(missing.length){
    feedback.innerHTML=`<div class="alert warn"><strong>Il manque encore :</strong> ${missing.join(", ")}.</div>`;
    return;
  }

  if(values.email!=="exercice@exemple.fr"){
    feedback.innerHTML=`<div class="alert warn">Pour cet exercice, utilisez l'adresse fictive <strong>exercice@exemple.fr</strong>.</div>`;
    return;
  }

  if(values.postal.length!==5 || !/^\d{5}$/.test(values.postal)){
    feedback.innerHTML=`<div class="alert warn">Le code postal fictif doit contenir 5 chiffres.</div>`;
    return;
  }

  const requiredTabs = state.currentMission.level==="beginner" ? 5 : state.currentMission.level==="intermediate" ? 7 : 9;

  if(tabTrainingCount < requiredTabs){
    feedback.innerHTML=`<div class="alert warn"><strong>Le formulaire est rempli, mais vous avez peu utilisé la touche Tab.</strong><br>
      Tabulations détectées : ${tabTrainingCount}. Pour ce niveau, essayez d'en faire au moins ${requiredTabs}.<br>
      Revenez au premier champ et recommencez le déplacement avec Tab.</div>`;
    return;
  }

  feedback.innerHTML=`<div class="tab-success"><strong>Bravo !</strong><br>
    Formulaire rempli et ${tabTrainingCount} déplacements avec Tab détectés.</div>
    <button class="primary" type="button" onclick="window.finishTabFormMission()">Terminer l'exercice →</button>`;
};

window.finishTabFormMission=async()=>{
  await addAchievement("tab_form","J'ai rempli un formulaire avec la touche Tab");
  await setMissionStep(2);
  await completeMission();
  renderMission();
};


function renderMissingPieceMission(m){
  const step=m.step||0,box=$("#missionContent");
  if(step===0){
    box.innerHTML=`<p class="eyebrow">Mission</p><h1>Compléter un dossier</h1>${progress(0,4)}
      <div class="mission-step"><p>Votre dossier a été envoyé. Un message va vous indiquer s'il manque quelque chose.</p>${learnerHelp("Ouvrez votre messagerie après avoir commencé.")}<button class="primary" onclick="window.beginMissingPiece()">Commencer</button></div>`;
  }else if(step===1){
    box.innerHTML=`<p class="eyebrow">Étape 2</p><h1>Lire le message reçu</h1>${progress(1,4)}
      <div class="message-box"><strong>Service dossiers</strong><p>Bonjour ${esc(state.student.displayName)},</p><p>Votre dossier est incomplet. Merci de nous transmettre le fichier <b>justificatif_domicile</b>.</p></div>
      ${learnerHelp("Retenez le nom de la pièce demandée.")}<button class="primary" onclick="window.missionNext()">J'ai lu le message</button>`;
  }else if(step===2){
    box.innerHTML=`<p class="eyebrow">Étape 3</p><h1>Envoyer la pièce manquante</h1>${progress(2,4)}
      <div class="mission-step"><p>Choisissez le fichier demandé.</p>
      <input id="missionFileInput" type="file" accept=".pdf,.txt" onchange="window.checkMissingPiece(event)">
      <div id="fileCheckMsg"></div></div>`;
  }else{
    box.innerHTML=`<p class="eyebrow">Mission terminée</p><h1>Bravo ${esc(state.student.displayName)} 🎉</h1>${progress(4,4)}
      <div class="alert good">Le service a reçu la pièce manquante. Votre dossier est maintenant complet.</div>${quizHTML("missing_piece")}`;
  }
}
window.beginMissingPiece=async()=>{
  await sendAutoMessage(state.seat.id,"Pièce manquante","Votre dossier est incomplet. Merci de transmettre le justificatif_domicile.");
  await setMissionStep(1);renderMission();
};
window.checkMissingPiece=async ev=>{
  const f=ev.target.files?.[0],msg=$("#fileCheckMsg");if(!f)return;
  if(!f.name.toLowerCase().includes("justificatif_domicile")){
    msg.innerHTML='<div class="alert bad">Ce n’est pas la pièce demandée. Relisez le message puis choisissez un autre fichier.</div>';return;
  }
  msg.innerHTML='<div class="alert good">Bonne pièce ! Cliquez pour l’envoyer.</div><button class="primary" onclick="window.sendMissingPiece()">Envoyer la pièce</button>';
};
window.sendMissingPiece=async()=>{
  await sendAutoMessage(state.seat.id,"Dossier complet","Merci. Votre justificatif a bien été reçu. Votre dossier est maintenant complet.");
  await addAchievement("attach","J'ai envoyé une pièce manquante");
  await setMissionStep(3);await completeMission();renderMission();
};

function renderSuspiciousMission(m){
  const step=m.step||0,box=$("#missionContent");
  if(step===0){
    box.innerHTML=`<p class="eyebrow">Mission</p><h1>Reconnaître un message suspect</h1>${progress(0,2)}
    <div class="message-box"><strong>REMBOURSEMENT URGENT</strong><p>Votre remboursement expire aujourd'hui. Cliquez immédiatement et saisissez votre carte bancaire.</p></div>
    <div class="mission-step"><h2>Que faites-vous ?</h2>
      <button class="secondary" onclick="window.suspiciousAnswer(false)">Je clique sur le lien</button>
      <button class="primary" onclick="window.suspiciousAnswer(true)">Je ferme le message et j'ouvre moi-même le site officiel</button>
      <div id="suspiciousMsg"></div></div>`;
  }else{
    box.innerHTML=`<p class="eyebrow">Mission terminée</p><h1>Bravo ${esc(state.student.displayName)} 🎉</h1>${progress(2,2)}
    <div class="alert good">Vous avez utilisé le bon réflexe de sécurité.</div>${quizHTML("security")}`;
  }
}
window.suspiciousAnswer=async good=>{
  if(!good){$("#suspiciousMsg").innerHTML=`<div class="alert bad">Attention : l'urgence et la demande bancaire sont des signaux d'alerte. Essayez l'autre réponse.</div>`;return;}
  await addAchievement("security","J'ai reconnu un message suspect");await setMissionStep(1);await completeMission();renderMission();
};

function renderFullMission(m){
  const box=$("#missionContent"); box.innerHTML=`<p class="eyebrow">Mission complète</p><h1>Parcours administratif</h1>
  <div class="mission-step"><p>Ce parcours combine lecture d'un message, téléchargement et renvoi d'une pièce.</p><button class="primary" onclick="window.convertToMissingPiece()">Commencer</button></div>`;
}
window.convertToMissingPiece=async()=>{state.currentMission.type="missing_piece";state.currentMission.step=0;await saveMission(state.currentMission);renderMission();};

window.missionNext=async()=>{await setMissionStep((state.currentMission.step||0)+1);renderMission();};
async function setMissionStep(step){state.currentMission.step=step;state.currentMission.status="in_progress";await saveMission(state.currentMission);}
async function completeMission(){state.currentMission.status="done";await saveMission(state.currentMission);}
async function saveMission(m){
  if(configured)await firebase.setDoc(firebase.doc(firebase.db,"missions",m.id),m,{merge:true});
  else{demo.missions[m.id]=m;saveDemo();}
}
function safeName(s){return String(s).normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/[^a-z0-9]+/gi,"_").toLowerCase();}
function downloadTextPdfLike(filename,text){
  const blob=new Blob([text],{type:"text/plain;charset=utf-8"});const url=URL.createObjectURL(blob);
  const a=document.createElement("a");a.href=url;a.download=filename;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);
}

/* -------------------- QUIZ PAR THEME ET PAR NIVEAU -------------------- */
const quizBanks = {
  download: {
    beginner: [
      {id:"db1",q:"Que veut dire « Télécharger » ?",choices:["Récupérer un fichier sur l'ordinateur","Supprimer le fichier","Envoyer un mot de passe"],ok:0,explain:"Télécharger signifie récupérer une copie du fichier sur votre appareil."},
      {id:"db2",q:"Dans quel dossier Windows regarde-t-on d'abord après un téléchargement ?",choices:["Téléchargements","Corbeille","Musique"],ok:0,explain:"Le dossier Téléchargements est le premier endroit à vérifier."},
      {id:"db3",q:"Quel symbole représente souvent le téléchargement ?",choices:["Une flèche vers le bas","Une poubelle","Un cadenas"],ok:0,explain:"La flèche vers le bas est souvent utilisée pour le bouton Télécharger."},
      {id:"db4",q:"Vous venez de télécharger « attestation.pdf ». Que devez-vous chercher ?",choices:["Un fichier nommé attestation.pdf","Une application","Un mot de passe"],ok:0,explain:"Le nom du fichier permet de le reconnaître dans le dossier Téléchargements."},
      {id:"db5",q:"Que signifie l'extension « .pdf » ?",choices:["C'est un type de document","C'est un mot de passe","C'est une adresse e-mail"],ok:0,explain:"PDF est un format de document très utilisé pour les démarches."},
      {id:"db6",q:"Après avoir trouvé le bon fichier, comment l'ouvrir généralement ?",choices:["Double-cliquer dessus","Le supprimer","Éteindre l'ordinateur"],ok:0,explain:"Un double-clic ouvre généralement le document."}
    ],
    intermediate: [
      {id:"di1",q:"Vous avez téléchargé deux attestations. Comment reconnaître la plus récente ?",choices:["Regarder le nom et la date du fichier","Ouvrir la Corbeille","Changer de navigateur"],ok:0,explain:"Le nom et la date permettent de différencier les versions."},
      {id:"di2",q:"Un fichier se nomme « attestation_droits (2).pdf ». Que signifie souvent « (2) » ?",choices:["Une autre copie a déjà été téléchargée","Le fichier est dangereux","Le fichier contient deux pages"],ok:0,explain:"Le navigateur ajoute souvent un numéro lorsqu'un fichier du même nom existe déjà."},
      {id:"di3",q:"Vous ne voyez pas votre PDF dans Téléchargements. Quel bon réflexe ?",choices:["Trier les fichiers par date ou utiliser la recherche","Recommencer toute la démarche","Créer un nouveau compte"],ok:0,explain:"Le tri ou la recherche permettent de retrouver rapidement le fichier."},
      {id:"di4",q:"Pourquoi renommer « document123.pdf » en « attestation_ameli.pdf » ?",choices:["Pour le retrouver plus facilement plus tard","Pour le rendre officiel","Pour l'envoyer automatiquement"],ok:0,explain:"Un nom clair aide à organiser ses documents."},
      {id:"di5",q:"Vous voulez garder un document administratif. Où le ranger ?",choices:["Dans un dossier personnel clairement nommé","Dans la Corbeille","Uniquement dans le navigateur"],ok:0,explain:"Un dossier comme « Mes démarches » facilite le classement."},
      {id:"di6",q:"Le navigateur affiche « Ouvrir » et « Enregistrer ». Pour conserver le fichier sur le PC, quel choix est le plus clair ?",choices:["Enregistrer","Fermer","Actualiser"],ok:0,explain:"Enregistrer permet de conserver le fichier sur l'ordinateur."}
    ],
    expert: [
      {id:"de1",q:"Un PDF s'ouvre directement dans un nouvel onglet. Comment le conserver ?",choices:["Utiliser le bouton Télécharger/Enregistrer du lecteur PDF","Fermer l'onglet en pensant qu'il est enregistré","Copier seulement l'adresse web"],ok:0,explain:"L'ouverture dans le navigateur ne garantit pas que le fichier est enregistré localement."},
      {id:"de2",q:"Vous devez joindre « avis_impot_2026.pdf », mais vous avez aussi « avis_impot_2025.pdf ». Quelle vérification est essentielle ?",choices:["L'année dans le nom ou le contenu","La taille de l'icône","La couleur du dossier"],ok:0,explain:"Il faut vérifier le bon millésime."},
      {id:"de3",q:"Votre fichier est téléchargé mais introuvable. Quelle méthode est la plus efficace ?",choices:["Rechercher une partie du nom dans l'Explorateur Windows","Télécharger cinq copies","Créer un nouveau compte"],ok:0,explain:"La recherche Windows évite de multiplier les copies."},
      {id:"de4",q:"Vous avez trois fichiers presque identiques. Quelle organisation réduit le risque d'envoyer le mauvais ?",choices:["Les renommer avec type de document et date","Les laisser tous sous « document.pdf »","Les mettre dans la Corbeille"],ok:0,explain:"Des noms explicites permettent de distinguer les versions."},
      {id:"de5",q:"Un PDF administratif contient des données personnelles. Quel bon réflexe sur un ordinateur partagé ?",choices:["Le ranger dans un espace personnel puis se déconnecter","Le laisser ouvert","Le partager avec tout le groupe"],ok:0,explain:"Sur un ordinateur partagé, il faut limiter l'accès aux données personnelles."},
      {id:"de6",q:"Un fichier s'appelle « attestation.pdf.exe ». Pourquoi faut-il être prudent ?",choices:["L'extension finale .exe indique un programme","Tous les PDF sont dangereux","Le nom est trop long"],ok:0,explain:"C'est l'extension finale qui compte : .exe est un programme."}
    ]
  },

  mouse_nav: {
    beginner: [
      {id:"nb1",q:"Pour ouvrir une rubrique sur un site, que fait-on le plus souvent ?",choices:["Un clic gauche","Un clic droit partout","On ferme le navigateur"],ok:0,explain:"Un clic gauche ouvre généralement un bouton ou une rubrique."},
      {id:"nb2",q:"Un onglet devient souligné ou change de couleur après un clic. Cela signifie souvent…",choices:["Qu'il est ouvert","Que l'ordinateur est en panne","Que le fichier est supprimé"],ok:0,explain:"Les sites indiquent visuellement quelle rubrique est active."},
      {id:"nb3",q:"Vous cherchez un espace professionnel. Que faut-il faire ?",choices:["Cliquer sur la rubrique Professionnel","Cliquer sur la Corbeille","Appuyer sur Échap"],ok:0,explain:"Les grandes rubriques servent à accéder au contenu correspondant."},
      {id:"nb4",q:"Si vous cliquez sur le mauvais onglet, que faire ?",choices:["Cliquer simplement sur le bon onglet","Recommencer l'ordinateur","Créer un nouveau compte"],ok:0,explain:"Une erreur de clic se corrige facilement."},
      {id:"nb5",q:"Pourquoi prendre le temps de lire les noms des onglets ?",choices:["Pour choisir la bonne rubrique","Pour ralentir Internet","Pour changer le clavier"],ok:0,explain:"Lire les intitulés aide à naviguer sans cliquer au hasard."},
      {id:"nb6",q:"Quel geste convient pour choisir un bouton visible ?",choices:["Pointer puis cliquer une fois","Secouer la souris","Faire dix doubles-clics"],ok:0,explain:"Un simple clic suffit généralement."}
    ],
    intermediate: [
      {id:"ni1",q:"Vous êtes sur la page Particulier mais cherchez des informations pour une entreprise. Que faire ?",choices:["Cliquer sur Professionnel/Entreprise","Actualiser plusieurs fois","Fermer Windows"],ok:0,explain:"Il faut changer de rubrique selon le profil recherché."},
      {id:"ni2",q:"Une rubrique contient plusieurs cartes. Quel bon réflexe avant de cliquer ?",choices:["Lire le titre et le petit texte","Cliquer au hasard","Utiliser uniquement le clic droit"],ok:0,explain:"Lire le contenu évite les erreurs de navigation."},
      {id:"ni3",q:"Vous ne trouvez pas immédiatement une information. Quelle stratégie est raisonnable ?",choices:["Explorer les rubriques proches puis revenir","Créer un nouveau compte","Fermer toutes les fenêtres"],ok:0,explain:"La navigation par catégories permet de se repérer."},
      {id:"ni4",q:"Une barre de navigation reste visible en haut. À quoi sert-elle ?",choices:["À changer rapidement de rubrique","À supprimer les documents","À modifier Windows"],ok:0,explain:"La barre de navigation donne accès aux grandes sections du site."},
      {id:"ni5",q:"Après plusieurs clics, comment savoir où vous êtes ?",choices:["Regarder l'onglet actif et le titre de la page","Regarder l'heure","Changer la taille de la souris"],ok:0,explain:"L'onglet actif et le titre donnent le contexte courant."},
      {id:"ni6",q:"Quel comportement évite les doubles actions involontaires ?",choices:["Faire un seul clic et attendre la réaction","Cliquer très vite cinq fois","Maintenir tous les boutons"],ok:0,explain:"Un clic suffit sur la plupart des boutons web."}
    ],
    expert: [
      {id:"ne1",q:"Un site propose Particulier, Professionnel et Collectivité. Quelle logique suivre ?",choices:["Choisir selon la situation de la personne ou de l'organisme","Toujours choisir Professionnel","Cliquer sur tous les onglets"],ok:0,explain:"Le bon espace dépend du profil concerné."},
      {id:"ne2",q:"Deux rubriques semblent proches. Quel indice aide le plus ?",choices:["Le titre, la description et le contenu de la page","La couleur de la souris","La taille de l'écran"],ok:0,explain:"Il faut interpréter les libellés plutôt que cliquer au hasard."},
      {id:"ne3",q:"Vous êtes perdu dans une navigation complexe. Quel réflexe est utile ?",choices:["Revenir à l'accueil ou à une rubrique principale","Créer un nouveau navigateur","Cliquer sur tous les liens"],ok:0,explain:"Revenir à un point de repère est une bonne stratégie."},
      {id:"ne4",q:"Pourquoi éviter les doubles-clics sur les boutons web ?",choices:["Ils peuvent déclencher deux fois une action ou être inutiles","Ils effacent toujours les données","Ils ferment automatiquement la page"],ok:0,explain:"Sur le web, un simple clic est généralement attendu."},
      {id:"ne5",q:"Sur une page riche, quelle méthode réduit les erreurs ?",choices:["Repérer d'abord les grandes zones puis cliquer avec intention","Cliquer dès qu'un élément bouge","Changer constamment d'onglet"],ok:0,explain:"Une lecture rapide de la structure aide à mieux naviguer."},
      {id:"ne6",q:"Un site fictif de formation ressemble à un vrai service. Quel élément doit rappeler qu'il s'agit d'un exercice ?",choices:["Une bannière claire « Simulation pédagogique »","Un vrai mot de passe","Une vraie adresse officielle"],ok:0,explain:"Une simulation doit rester clairement identifiable comme exercice."}
    ]
  },

  keyboard: {
    beginner: [
      {id:"kb1",q:"À quoi sert la touche Retour arrière ?",choices:["Effacer le caractère placé avant le curseur","Fermer la page","Créer un nouveau dossier"],ok:0,explain:"Retour arrière efface le caractère situé juste avant le curseur."},
      {id:"kb2",q:"Quelle touche permet souvent de valider une action ?",choices:["Entrée","Verr. Maj","Impr. écran"],ok:0,explain:"Entrée permet souvent de valider ou d'activer un bouton."},
      {id:"kb3",q:"Quelle touche permet de passer au champ suivant ?",choices:["Tab","Échap","F1"],ok:0,explain:"Tab déplace le focus vers le champ ou bouton suivant."},
      {id:"kb4",q:"Comment écrire une majuscule ponctuelle ?",choices:["Maintenir Maj pendant qu'on tape la lettre","Appuyer sur Suppr","Utiliser uniquement la souris"],ok:0,explain:"La touche Maj permet d'écrire une majuscule ponctuelle."},
      {id:"kb5",q:"La barre Espace sert principalement à…",choices:["Créer un espace entre les mots","Fermer Windows","Ouvrir les téléchargements"],ok:0,explain:"Espace sépare les mots et peut aussi activer certaines cases ou boutons."},
      {id:"kb6",q:"Pour écrire une adresse e-mail, quel caractère est indispensable ?",choices:["@","€","# uniquement"],ok:0,explain:"Le caractère @ sépare le nom de la boîte e-mail et le domaine."}
    ],
    intermediate: [
      {id:"ki1",q:"Vous avez dépassé un champ avec Tab. Comment revenir au précédent ?",choices:["Maj + Tab","Ctrl + Z","Alt + F4"],ok:0,explain:"Maj + Tab revient à l'élément précédent."},
      {id:"ki2",q:"Sur une liste déroulante sélectionnée, quelles touches permettent souvent de changer d'option ?",choices:["Les flèches","Retour arrière uniquement","Verr. Num"],ok:0,explain:"Les flèches permettent de parcourir les options."},
      {id:"ki3",q:"Une case à cocher a le focus. Comment la cocher sans souris ?",choices:["Espace","F5","Ctrl + P"],ok:0,explain:"La barre Espace active généralement une case à cocher."},
      {id:"ki4",q:"Vous êtes sur un bouton avec le clavier. Comment l'activer ?",choices:["Entrée ou Espace","Maj uniquement","Flèche gauche uniquement"],ok:0,explain:"Entrée ou Espace activent généralement le bouton sélectionné."},
      {id:"ki5",q:"Pourquoi apprendre Tab et Maj+Tab ?",choices:["Pour naviguer dans un formulaire sans reprendre la souris","Pour augmenter le volume","Pour imprimer automatiquement"],ok:0,explain:"Ces touches permettent d'avancer et de reculer entre les éléments."},
      {id:"ki6",q:"Vous avez tapé « bonjouur ». Quelle touche est la plus utile pour corriger le dernier caractère ?",choices:["Retour arrière","Tab","Échap"],ok:0,explain:"Retour arrière efface le caractère précédent."}
    ],
    expert: [
      {id:"ke1",q:"Vous voulez remplir un formulaire sans souris. Quelle combinaison vous permet d'avancer et de reculer ?",choices:["Tab et Maj + Tab","Ctrl + C et Ctrl + V uniquement","F1 et F2"],ok:0,explain:"Tab avance dans l'ordre de navigation, Maj + Tab recule."},
      {id:"ke2",q:"Le focus est sur une case à cocher mais elle n'est pas cochée. Quelle touche convient ?",choices:["Espace","Retour arrière","Alt"],ok:0,explain:"Espace active ou désactive généralement une case à cocher."},
      {id:"ke3",q:"Le focus est sur un menu déroulant. Quelle méthode clavier est adaptée ?",choices:["Flèches pour choisir puis Tab pour continuer","Suppr puis Échap","Ctrl + Alt + Suppr"],ok:0,explain:"Les flèches modifient le choix, Tab passe ensuite au contrôle suivant."},
      {id:"ke4",q:"Dans une interface accessible, pourquoi le focus visible est-il important ?",choices:["Il montre quel élément recevra la prochaine action clavier","Il change la connexion Internet","Il indique la batterie"],ok:0,explain:"Le focus visible aide à savoir où l'on se trouve sans souris."},
      {id:"ke5",q:"Vous êtes sur un bouton « Envoyer » et souhaitez revenir vérifier un champ. Que faire ?",choices:["Maj + Tab autant de fois que nécessaire","Recharger la page","Fermer l'onglet"],ok:0,explain:"Maj + Tab permet de remonter dans l'ordre de navigation."},
      {id:"ke6",q:"Pourquoi privilégier parfois le clavier dans une longue saisie ?",choices:["Pour limiter les allers-retours souris/clavier et gagner en fluidité","Pour rendre le texte officiel","Pour éviter toute vérification"],ok:0,explain:"Une bonne navigation clavier rend la saisie plus fluide et confortable."}
    ]
  },

  form: {
    beginner: [
      {id:"fb1",q:"À quoi sert la touche Tab dans un formulaire ?",choices:["Passer au champ suivant","Effacer le formulaire","Fermer la page"],ok:0,explain:"Tab permet de déplacer le curseur vers le champ suivant."},
      {id:"fb2",q:"Vous venez de finir d'écrire votre prénom. Que pouvez-vous faire pour aller au champ suivant ?",choices:["Appuyer sur Tab","Éteindre l'écran","Double-cliquer partout"],ok:0,explain:"La touche Tab évite de reprendre la souris."},
      {id:"fb3",q:"Le curseur est déjà dans une case. Que devez-vous faire ?",choices:["Taper le texte demandé","Cliquer dix fois","Fermer la page"],ok:0,explain:"Quand le curseur est dans la case, vous pouvez directement écrire."},
      {id:"fb4",q:"Vous avez fait une faute dans un champ. Quel bon réflexe ?",choices:["Corriger puis continuer avec Tab","Recommencer tout l'ordinateur","Créer un nouveau compte"],ok:0,explain:"Une faute de frappe se corrige simplement."},
      {id:"fb5",q:"Dans un formulaire, une étoile * signifie souvent…",choices:["Champ obligatoire","Champ décoratif","Champ interdit"],ok:0,explain:"L'étoile indique généralement un champ obligatoire."},
      {id:"fb6",q:"Quand vous arrivez sur un bouton avec Tab, comment l'activer au clavier ?",choices:["Avec Entrée ou Espace","Avec Échap uniquement","En éteignant la souris"],ok:0,explain:"Entrée ou Espace activent généralement le bouton sélectionné."}
    ],
    intermediate: [
      {id:"fi1",q:"Vous avez fini de remplir un champ et voulez passer au suivant sans souris. Que faire ?",choices:["Appuyer sur Tab","Appuyer sur Suppr","Cliquer sur le bureau"],ok:0,explain:"Tab déplace le focus vers l'élément suivant."},
      {id:"fi2",q:"Vous avez dépassé un champ avec Tab. Comment revenir en arrière ?",choices:["Maj + Tab","Ctrl + P","Alt + F4"],ok:0,explain:"Maj + Tab permet de revenir à l'élément précédent."},
      {id:"fi3",q:"Le focus arrive sur une liste déroulante. Que pouvez-vous faire ?",choices:["Utiliser les flèches puis Tab","Fermer la page","Taper un mot de passe"],ok:0,explain:"Les flèches permettent de changer l'option sélectionnée."},
      {id:"fi4",q:"Le focus arrive sur une case à cocher. Quelle touche peut la cocher ?",choices:["Espace","F5","Ctrl"],ok:0,explain:"La barre Espace coche ou décoche généralement une case."},
      {id:"fi5",q:"Pourquoi utiliser Tab peut-il être utile ?",choices:["Pour remplir plus vite sans déplacer la souris","Pour supprimer le formulaire","Pour imprimer automatiquement"],ok:0,explain:"Tab facilite la navigation au clavier entre les champs."},
      {id:"fi6",q:"Vous arrivez sur le bouton Envoyer avec Tab. Quel réflexe avant de l'activer ?",choices:["Relire le formulaire","Appuyer immédiatement sans vérifier","Fermer l'onglet"],ok:0,explain:"Il est utile de relire les informations avant l'envoi."}
    ],
    expert: [
      {id:"fe1",q:"Vous utilisez uniquement le clavier. Comment revenir au champ précédent ?",choices:["Maj + Tab","Ctrl + Alt + Suppr","F11"],ok:0,explain:"Maj + Tab déplace le focus vers l'élément précédent."},
      {id:"fe2",q:"Sur un bouton radio, quelles touches permettent souvent de changer de choix ?",choices:["Les flèches","Retour arrière uniquement","Échap"],ok:0,explain:"Les touches fléchées permettent souvent de parcourir les options radio."},
      {id:"fe3",q:"Vous êtes sur une case à cocher sans utiliser la souris. Comment la modifier ?",choices:["Appuyer sur Espace","Appuyer sur F1","Appuyer sur Ctrl + S"],ok:0,explain:"La barre Espace active généralement une case à cocher."},
      {id:"fe4",q:"Un formulaire contient un lien entre deux champs. La touche Tab va…",choices:["Suivre l'ordre de navigation prévu par la page","Toujours ignorer les liens","Fermer le formulaire"],ok:0,explain:"Tab suit l'ordre de focus défini dans la page."},
      {id:"fe5",q:"Pourquoi l'ordre de tabulation est-il important pour l'accessibilité ?",choices:["Il permet de suivre le formulaire logiquement sans souris","Il change la couleur du site","Il augmente la vitesse Internet"],ok:0,explain:"Un ordre logique rend le formulaire utilisable au clavier."},
      {id:"fe6",q:"Vous êtes sur le bouton Envoyer et voulez vérifier un champ précédent sans souris. Que faire ?",choices:["Utiliser Maj + Tab autant de fois que nécessaire","Actualiser la page","Fermer le navigateur"],ok:0,explain:"Maj + Tab permet de remonter dans l'ordre de navigation."}
    ]
  },

  missing_piece: {
    beginner: [
      {id:"mb1",q:"Le message dit qu'il manque un justificatif de domicile. Que devez-vous envoyer ?",choices:["Le justificatif de domicile demandé","N'importe quel PDF","Votre mot de passe"],ok:0,explain:"Il faut envoyer exactement la pièce demandée."},
      {id:"mb2",q:"Que veut dire « joindre un fichier » ?",choices:["Ajouter un document à la démarche","Créer un compte","Supprimer le dossier"],ok:0,explain:"Joindre signifie ajouter un document."},
      {id:"mb3",q:"Vous avez sélectionné le mauvais fichier. Que faire ?",choices:["Choisir un autre fichier","Envoyer quand même","Abandonner"],ok:0,explain:"Une erreur de sélection se corrige simplement."},
      {id:"mb4",q:"Après avoir choisi un fichier, que devez-vous regarder ?",choices:["Le nom du fichier affiché","La couleur de la souris","L'heure"],ok:0,explain:"Le nom affiché permet de vérifier la pièce sélectionnée."},
      {id:"mb5",q:"Le service demande un PDF. Quel fichier choisissez-vous ?",choices:["Un fichier qui se termine par .pdf","Un fichier .mp3","Un raccourci"],ok:0,explain:"Le format demandé doit être respecté."},
      {id:"mb6",q:"Après avoir envoyé la bonne pièce, que peut indiquer le service ?",choices:["Dossier complet","Ordinateur bloqué","Compte supprimé"],ok:0,explain:"Une fois la pièce reçue, le dossier peut devenir complet."}
    ],
    intermediate: [
      {id:"mi1",q:"Le message demande « justificatif de domicile de moins de 3 mois ». Quelle facture choisir ?",choices:["La plus récente et conforme","La plus ancienne","N'importe laquelle"],ok:0,explain:"Il faut aussi respecter la période demandée."},
      {id:"mi2",q:"Vous avez joint le bon type de document mais le mauvais mois. Quel réflexe ?",choices:["Remplacer le fichier avant l'envoi","Envoyer puis espérer","Créer un nouveau dossier"],ok:0,explain:"Relisez les critères et remplacez la pièce."},
      {id:"mi3",q:"Le service demande un PDF et votre document est une photo JPG. Que faire ?",choices:["Fournir une vraie version PDF ou convertir correctement","Renommer seulement .jpg en .pdf","Envoyer autre chose"],ok:0,explain:"Changer seulement l'extension ne convertit pas le fichier."},
      {id:"mi4",q:"Après l'envoi d'une pièce, quel élément peut servir de preuve ?",choices:["Un message de confirmation ou un récépissé","La couleur du bouton","Le fond d'écran"],ok:0,explain:"Une confirmation permet de savoir que l'envoi a été pris en compte."},
      {id:"mi5",q:"Le fichier est trop volumineux. Quelle solution est logique ?",choices:["Réduire sa taille ou suivre les indications du site","Envoyer son mot de passe","Créer plusieurs comptes"],ok:0,explain:"Les sites imposent parfois une taille maximale."},
      {id:"mi6",q:"Le service demande deux pièces différentes. Que faire ?",choices:["Joindre chacune dans le bon emplacement","Joindre deux fois le même fichier","Ignorer la deuxième"],ok:0,explain:"Chaque emplacement doit recevoir la pièce correspondante."}
    ],
    expert: [
      {id:"me1",q:"Le dossier demande un avis d'imposition N-1. Quel réflexe ?",choices:["Vérifier précisément l'année demandée","Prendre le premier avis trouvé","Envoyer un relevé bancaire"],ok:0,explain:"Les demandes administratives utilisent souvent des références d'année précises."},
      {id:"me2",q:"Le site affiche « format non pris en charge ». Que faut-il faire ?",choices:["Vérifier les formats autorisés et fournir un fichier réellement conforme","Changer seulement l'extension","Actualiser sans lire"],ok:0,explain:"Le format réel du fichier doit être compatible."},
      {id:"me3",q:"Le service demande recto et verso dans un seul PDF. Vous avez deux images. Que faire ?",choices:["Créer un document regroupant les deux faces","Envoyer seulement le recto","Renommer une image en .pdf"],ok:0,explain:"La demande précise qu'un seul document doit contenir les deux faces."},
      {id:"me4",q:"Après l'envoi, le statut reste « pièce attendue ». Quel premier réflexe ?",choices:["Vérifier la confirmation et patienter un peu","Envoyer dix fois le fichier","Créer un nouveau compte"],ok:0,explain:"Certains statuts ne se mettent pas à jour instantanément."},
      {id:"me5",q:"Vous doutez de l'authenticité d'une demande de pièce. Que faire ?",choices:["Vérifier la demande dans l'espace officiel","Répondre avec vos codes","Cliquer sur tous les liens"],ok:0,explain:"La messagerie interne du service officiel est un bon point de vérification."},
      {id:"me6",q:"Vous devez envoyer un document contenant des données sensibles. Quel principe appliquer ?",choices:["Utiliser uniquement l'espace officiel prévu","Le publier dans un cloud public","Le transmettre au groupe"],ok:0,explain:"Les pièces administratives doivent passer par un canal approprié."}
    ]
  },

  security: {
    beginner: [
      {id:"sb1",q:"Un e-mail vous demande votre mot de passe. Que faites-vous ?",choices:["Je ne le donne pas","Je l'envoie","Je le publie"],ok:0,explain:"Un mot de passe doit rester secret."},
      {id:"sb2",q:"Un message dit « URGENT, cliquez maintenant ». Quel bon réflexe ?",choices:["Prendre le temps de vérifier","Cliquer immédiatement","Donner son code SMS"],ok:0,explain:"L'urgence peut être utilisée pour vous faire agir trop vite."},
      {id:"sb3",q:"En cas de doute sur un e-mail administratif, que faire ?",choices:["Ouvrir soi-même le site officiel","Cliquer sur le lien reçu","Répondre avec ses codes"],ok:0,explain:"Accédez directement au site officiel."},
      {id:"sb4",q:"Un code reçu par SMS est-il personnel ?",choices:["Oui","Non"],ok:0,explain:"Les codes de connexion reçus par SMS doivent rester privés."},
      {id:"sb5",q:"Le formateur peut-il vous aider sans connaître votre mot de passe ?",choices:["Oui","Non"],ok:0,explain:"On peut expliquer les gestes sans demander vos secrets."},
      {id:"sb6",q:"Quel geste est prudent avant de cliquer ?",choices:["Lire le message","Fermer les yeux","Cliquer plusieurs fois"],ok:0,explain:"Lire avant d'agir permet d'éviter de nombreux pièges."}
    ],
    intermediate: [
      {id:"si1",q:"Un e-mail reprend le logo Ameli mais l'adresse de l'expéditeur est étrange. Que faire ?",choices:["Vérifier depuis le site officiel","Faire confiance au logo","Répondre avec sa carte bancaire"],ok:0,explain:"Un logo peut être copié."},
      {id:"si2",q:"Vous recevez un lien pour un remboursement inattendu. Quel bon réflexe ?",choices:["Ouvrir directement votre espace officiel","Cliquer sur le lien","Envoyer une photo de votre carte"],ok:0,explain:"Vérifiez l'information depuis votre compte officiel."},
      {id:"si3",q:"Une page de connexion s'ouvre après un lien reçu. Que vérifier ?",choices:["L'adresse du site avant de saisir quoi que ce soit","Taper le mot de passe immédiatement","Désactiver l'antivirus"],ok:0,explain:"L'adresse du site permet de détecter de nombreuses fausses pages."},
      {id:"si4",q:"Quelqu'un au téléphone demande le code SMS que vous venez de recevoir. Que faire ?",choices:["Ne pas le communiquer","Le dicter","Le publier"],ok:0,explain:"Un code d'authentification ne doit pas être communiqué."},
      {id:"si5",q:"Un message contient des fautes et menace de fermer votre compte. Cela peut être…",choices:["Un signe de phishing","Une preuve qu'il est officiel","Une mise à jour Windows"],ok:0,explain:"Menaces, fautes et urgence sont des indices possibles."},
      {id:"si6",q:"Vous avez cliqué sur un lien douteux sans rien saisir. Quel réflexe ?",choices:["Fermer la page et ouvrir le site officiel","Continuer pour voir","Entrer de faux codes"],ok:0,explain:"Il vaut mieux repartir d'une source de confiance."}
    ],
    expert: [
      {id:"se1",q:"Une page ressemble à impots.gouv.fr mais l'adresse est « impots-gouv-securite.example ». Conclusion ?",choices:["L'adresse n'est pas le domaine officiel","Le logo suffit à prouver que c'est officiel","Le cadenas suffit"],ok:0,explain:"Un site frauduleux peut copier l'apparence."},
      {id:"se2",q:"Le cadenas HTTPS garantit-il qu'un site est légitime ?",choices:["Non, pas à lui seul","Oui, toujours","Seulement sur mobile"],ok:0,explain:"Un site frauduleux peut aussi utiliser HTTPS."},
      {id:"se3",q:"Vous recevez une demande d'authentification que vous n'avez pas déclenchée. Que faire ?",choices:["La refuser et vérifier le compte","L'accepter pour la faire disparaître","La partager"],ok:0,explain:"Une demande non initiée peut signaler une tentative de connexion."},
      {id:"se4",q:"Un message demande d'installer un logiciel pour consulter un document administratif. Quel réflexe ?",choices:["Vérifier sur le site officiel avant toute installation","Installer immédiatement","Désactiver les protections"],ok:0,explain:"Les installations inattendues sont un risque."},
      {id:"se5",q:"Pourquoi éviter le même mot de passe partout ?",choices:["Une fuite sur un service pourrait exposer les autres comptes","Parce que Windows l'interdit","Pour télécharger plus vite"],ok:0,explain:"Des mots de passe distincts limitent les conséquences d'une fuite."},
      {id:"se6",q:"Vous avez saisi votre mot de passe sur un faux site. Quelle priorité ?",choices:["Changer rapidement le mot de passe sur le vrai service","Attendre quelques semaines","Supprimer seulement l'e-mail"],ok:0,explain:"Il faut agir rapidement pour protéger le compte."}
    ]
  }
};

let activeQuiz = null;

function getQuizLevel(){
  const level=state.currentMission?.level || state.seat?.level || "beginner";
  return ["beginner","intermediate","expert"].includes(level)?level:"beginner";
}
function quizLevelLabel(level){
  return ({beginner:"Débutant",intermediate:"Intermédiaire",expert:"Expert"})[level] || "Débutant";
}
function recentQuizKey(theme,level){
  const seat=state.seat?.id || "demo";
  return "quizHistory_"+seat+"_"+theme+"_"+level;
}
function pickQuizQuestions(theme,count=3){
  const level=getQuizLevel();
  const bank=quizBanks[theme]?.[level] || [];
  if(!bank.length) return {level,questions:[]};

  let history=[];
  try{history=JSON.parse(localStorage.getItem(recentQuizKey(theme,level))||"[]");}catch(e){history=[];}

  let available=bank.filter(q=>!history.includes(q.id));
  if(available.length===0){
    history=[];
    available=[...bank];
  }

  const shuffled=[...available];
  for(let i=shuffled.length-1;i>0;i--){
    const j=Math.floor(Math.random()*(i+1));
    [shuffled[i],shuffled[j]]=[shuffled[j],shuffled[i]];
  }

  const chosen=shuffled.slice(0,Math.min(count,shuffled.length));
  localStorage.setItem(recentQuizKey(theme,level),JSON.stringify([...history,...chosen.map(q=>q.id)]));
  return {level,questions:chosen};
}
function quizHTML(theme){
  const selection=pickQuizQuestions(theme,3);
  activeQuiz={theme,level:selection.level,questions:selection.questions,index:0,score:0,answered:false};
  return `<div class="quiz" id="activeQuizBox">${renderActiveQuizQuestion()}</div>`;
}
function renderActiveQuizQuestion(){
  if(!activeQuiz || !activeQuiz.questions.length){
    return `<div class="alert warn">Toutes les questions de ce cycle ont déjà été utilisées.</div><button class="primary" onclick="window.finishMissionView()">Retour à mon espace</button>`;
  }
  const q=activeQuiz.questions[activeQuiz.index];
  return `<div class="level-tag">Quiz ${quizLevelLabel(activeQuiz.level)}</div>
    <h2>Petit quiz de confiance</h2>
    <p><strong>Question ${activeQuiz.index+1} / ${activeQuiz.questions.length}</strong></p>
    <p>${esc(q.q)}</p>
    <div id="quizChoices">${q.choices.map((c,i)=>`<button onclick="window.quizAnswerDiversified(${i},this)">${esc(c)}</button>`).join("")}</div>
    <div id="quizFeedback"></div>`;
}
window.quizAnswerDiversified=(index,btn)=>{
  if(!activeQuiz || activeQuiz.answered) return;
  const q=activeQuiz.questions[activeQuiz.index];
  activeQuiz.answered=true;
  const buttons=[...document.querySelectorAll("#quizChoices button")];
  buttons.forEach(b=>b.disabled=true);
  const correct=index===q.ok;
  if(correct){activeQuiz.score++;btn.classList.add("correct");}
  else{btn.classList.add("wrong");if(buttons[q.ok])buttons[q.ok].classList.add("correct");}

  $("#quizFeedback").innerHTML=`<div class="alert ${correct?"good":"warn"}"><strong>${correct?"Bravo !":"Pas grave."}</strong> ${esc(q.explain)}</div>
    <button class="primary" onclick="window.nextDiversifiedQuizQuestion()">${activeQuiz.index<activeQuiz.questions.length-1?"Question suivante →":"Voir mon résultat →"}</button>`;
};
window.nextDiversifiedQuizQuestion=()=>{
  if(!activeQuiz) return;
  if(activeQuiz.index<activeQuiz.questions.length-1){
    activeQuiz.index++;
    activeQuiz.answered=false;
    $("#activeQuizBox").innerHTML=renderActiveQuizQuestion();
    return;
  }
  const total=activeQuiz.questions.length,score=activeQuiz.score;
  let icon="🌱",title="Vous progressez !",text="Chaque essai vous aide à prendre confiance.";
  if(score===total){icon="🏆";title="Excellent !";text="Vous avez réussi toutes les questions de ce quiz.";}
  else if(score>=Math.ceil(total/2)){icon="🌟";title="Très bien !";text="Vous avez compris l'essentiel de ce niveau.";}

  $("#activeQuizBox").innerHTML=`<div style="text-align:center"><div style="font-size:3rem">${icon}</div><div class="level-tag">Niveau ${quizLevelLabel(activeQuiz.level)}</div><h2>${title}</h2><p>Score : <strong>${score} / ${total}</strong></p><p>${text}</p><button class="primary" onclick="window.finishMissionView()">Retour à mon espace</button></div>`;
};
window.quizAnswer=(theme,index,btn)=>{
  if(!activeQuiz || activeQuiz.theme!==theme){
    const selection=pickQuizQuestions(theme,3);
    activeQuiz={theme,level:selection.level,questions:selection.questions,index:0,score:0,answered:false};
  }
  window.quizAnswerDiversified(index,btn);
};
window.finishMissionView=()=>{show("studentDashboard");renderStudent();};

/* -------------------- ACHIEVEMENTS -------------------- */
async function addAchievement(key,label){
  if(configured){
    await firebase.setDoc(firebase.doc(firebase.db,"workshops",state.workshop.id,"seats",state.seat.id,"achievements",key),{label,done:true,updatedAt:Date.now()});
  }else{
    const k=state.workshop.id+"_"+state.seat.id;demo.achievements[k]??={};demo.achievements[k][key]={label,done:true};saveDemo();
  }
}
async function renderAchievements(){
  let items=[];
  if(configured){
    const s=await firebase.getDocs(firebase.collection(firebase.db,"workshops",state.workshop.id,"seats",state.seat.id,"achievements"));
    items=s.docs.map(d=>d.data());
  }else items=Object.values(demo.achievements[state.workshop.id+"_"+state.seat.id]||{});
  $("#studentAchievements").innerHTML=items.length?items.map(a=>`<div class="achievement done"><b>✓ ${esc(a.label)}</b><span>Réussi</span></div>`).join(""):'<div class="achievement"><b>Votre carnet est vide</b><span>Vos réussites apparaîtront ici.</span></div>';
}

/* -------------------- MESSAGING -------------------- */
async function sendAutoMessage(seatId,subject,text){
  const m={id:uid(),workshopId:state.workshop.id,seatId,from:"teacher",to:"student",subject,text,auto:true,read:false,createdAt:Date.now()};
  await saveMessage(m);
}
async function saveMessage(m){
  if(configured)await firebase.setDoc(firebase.doc(firebase.db,"messages",m.id),m);
  else{demo.messages[m.id]=m;saveDemo();}
}
async function getMessagesForSeat(seatId){
  if(configured){
    const q=firebase.query(firebase.collection(firebase.db,"messages"),firebase.where("workshopId","==",state.workshop.id),firebase.where("seatId","==",seatId));
    const s=await firebase.getDocs(q);return s.docs.map(d=>({id:d.id,...d.data()})).sort((a,b)=>a.createdAt-b.createdAt);
  }
  return Object.values(demo.messages).filter(m=>m.workshopId===state.workshop.id&&m.seatId===seatId).sort((a,b)=>a.createdAt-b.createdAt);
}
async function renderTeacherConversations(){
  if(!state.workshop)return;
  const seats=state.workshop.seats||[];
  $("#teacherConversations").innerHTML=seats.map(s=>`<button class="conversation-item" onclick="window.openTeacherThread('${s.id}')"><strong>${esc(s.displayName||"Participant "+s.seatCode)}</strong><br><small>Code ${s.seatCode}</small></button>`).join("");
}
window.openTeacherThread=async seatId=>{
  state.selectedConversation=seatId;const seat=state.workshop.seats.find(s=>s.id===seatId);
  const messages=await getMessagesForSeat(seatId);
  $("#teacherThread").innerHTML=threadHTML(messages,"teacher")+`
    <div class="thread-compose">
      <div class="quick-replies">
        <button onclick="window.quickReply('Votre dossier a bien été reçu.')">Dossier reçu</button>
        <button onclick="window.quickReply('Il manque une pièce à votre dossier. Merci de relire le message et de joindre le document demandé.')">Pièce manquante</button>
        <button onclick="window.quickReply('Merci, votre dossier est maintenant complet.')">Dossier complet</button>
        <button onclick="window.quickReply('Prenez votre temps et relisez l’étape affichée à l’écran.')">Encouragement</button>
      </div>
      <textarea id="teacherReplyText" rows="3" placeholder="Écrire une réponse..."></textarea>
      <button class="primary" onclick="window.sendTeacherReply()">Envoyer</button>
    </div>`;
};
window.quickReply=t=>{$("#teacherReplyText").value=t;};
window.sendTeacherReply=async()=>{
  const t=$("#teacherReplyText").value.trim();if(!t)return;
  await saveMessage({id:uid(),workshopId:state.workshop.id,seatId:state.selectedConversation,from:"teacher",to:"student",subject:"Réponse du maître",text:t,auto:false,read:false,createdAt:Date.now()});
  window.openTeacherThread(state.selectedConversation);
};

async function renderStudentMessages(){
  const messages=await getMessagesForSeat(state.seat.id);
  $("#studentConversationList").innerHTML='<button class="conversation-item active"><strong>Atelier</strong><br><small>Messages du maître et du simulateur</small></button>';
  $("#studentThread").innerHTML=threadHTML(messages,"student")+`
    <div class="thread-compose"><textarea id="studentReplyText" rows="3" placeholder="Écrire un message au maître..."></textarea><button class="primary" onclick="window.sendStudentReply()">Envoyer</button></div>`;
  for(const m of messages.filter(x=>x.to==="student"&&!x.read)){
    m.read=true;if(configured)await firebase.updateDoc(firebase.doc(firebase.db,"messages",m.id),{read:true});else demo.messages[m.id].read=true;
  }
  if(!configured)saveDemo();
}
window.sendStudentReply=async()=>{
  const t=$("#studentReplyText").value.trim();if(!t)return;
  await saveMessage({id:uid(),workshopId:state.workshop.id,seatId:state.seat.id,from:"student",to:"teacher",subject:"Message de "+state.student.displayName,text:t,auto:false,read:false,createdAt:Date.now()});
  renderStudentMessages();
};
function threadHTML(messages,viewer){
  if(!messages.length)return '<div class="empty-state">Aucun message.</div>';
  return messages.map(m=>`<div class="bubble ${m.from===viewer?"me":"them"} ${m.auto?"auto":""}"><strong>${esc(m.subject||"Message")}</strong><br>${esc(m.text)}</div>`).join("");
}


function setupTeacherGeekUI(){
  document.querySelectorAll(".teacher-nav-btn").forEach(btn=>btn.addEventListener("click",()=>switchTeacherView(btn.dataset.teacherView)));
  document.querySelectorAll("[data-teacher-view-jump]").forEach(btn=>btn.addEventListener("click",()=>switchTeacherView(btn.dataset.teacherViewJump)));
  document.getElementById("teacherGlobalSearch")?.addEventListener("input",()=>{renderGroupCards();renderGroupsManager();});
  document.getElementById("groupFilterStatus")?.addEventListener("change",()=>{renderGroupCards();renderGroupsManager();});
  document.getElementById("newGroupBtn")?.addEventListener("click",()=>switchTeacherView("groups"));
}
setupTeacherGeekUI();

/* -------------------- BOOT -------------------- */
(async function boot(){
  try{
    await initFirebase();
  }catch(error){
    console.error("Firebase non disponible :",error);
    state.mode="demo";
    const banner=document.querySelector("#modeBanner");
    if(banner)banner.textContent="Firebase n’a pas pu démarrer. L’application reste disponible en mode démonstration local.";
  }
  show("landing");
})();

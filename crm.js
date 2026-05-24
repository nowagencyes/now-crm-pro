const sb = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

let currentView = "dashboard";
let editingId = null;
let cache = {
  clientes: [], facturas: [], planner: [], social: [], produccion: [], accesos: []
};

const tableMap = {
  clientes: "clientes",
  facturas: "facturas",
  planner: "social_posts",
  social: "social_accounts",
  produccion: "proyectos",
  accesos: "accesos"
};

const schemas = {
  clientes: [
    ["nombre","Nombre","text"],["empresa","Empresa","text"],["email","Email","email"],["servicio","Servicio","text"],["estado","Estado","select",["Activo","Potencial","Pausado","Finalizado"]]
  ],
  facturas: [
    ["numero","Nº factura","text"],["tipo","Tipo","select",["Proforma","Factura"]],["cliente","Cliente","text"],["concepto","Concepto","text"],["base","Base €","number"],["igic","IGIC %","number"],["estado","Estado","select",["Pendiente","Pagado","Vencido","Anulada"]]
  ],
  planner: [
    ["fecha","Fecha","date"],["hora","Hora","time"],["cliente","Cliente","text"],["red","Red","select",["Instagram","Facebook","TikTok","LinkedIn","Google Business"]],["tipo","Tipo","select",["Post","Reel","Story","Carrusel","Campaña"]],["caption","Caption","textarea"],["hashtags","Hashtags","textarea"],["estado","Estado","select",["Idea","Diseño","Aprobación","Programado","Publicado"]]
  ],
  produccion: [
    ["proyecto","Proyecto","text"],["cliente","Cliente","text"],["fecha","Fecha","date"],["estado","Estado","select",["Briefing","Planificado","Grabando","Editando","Entregado","Finalizado"]],["notas","Notas","textarea"]
  ],
  accesos: [
    ["cliente","Cliente","text"],["instagram","Instagram usuario","text"],["tiktok","TikTok usuario","text"],["facebook","Facebook usuario","text"],["email","Email vinculado","email"],["notas","Notas","textarea"]
  ]
};

function euro(v){ return `${Number(v || 0).toFixed(2)}€`; }
function badge(v){
  let cls = "pending";
  if(["Activo","Pagado","Publicado","Finalizado","Entregado"].includes(v)) cls = "ok";
  if(["Vencido","Anulada","Pausado"].includes(v)) cls = "danger";
  return `<span class="badge ${cls}">${v || "-"}</span>`;
}
function actions(view,id){
  return `<button class="action" onclick="editRow('${view}','${id}')">Editar</button><button class="action delete" onclick="deleteRow('${view}','${id}')">Borrar</button>`;
}

async function checkAuth(){
  const { data } = await sb.auth.getSession();
  if(!data.session){ window.location.href = "index.html"; return; }
  loadAll();
}
async function logout(){ await sb.auth.signOut(); window.location.href = "index.html"; }

document.querySelectorAll(".menu button").forEach(btn => btn.addEventListener("click", () => showView(btn.dataset.view)));
document.getElementById("new-btn").addEventListener("click", () => {
  if(currentView === "dashboard") return showView("planner");
  if(currentView === "social") return alert("Usa los botones de conexión OAuth.");
  openModal(currentView);
});

function showView(view){
  currentView = view;
  document.querySelectorAll(".menu button").forEach(b => b.classList.toggle("active", b.dataset.view === view));
  document.querySelectorAll(".view").forEach(v => v.classList.remove("active-view"));
  document.getElementById(view).classList.add("active-view");
  const titles = {
    dashboard:"Dashboard NOW Agency", clientes:"Clientes", facturas:"Facturas / Proformas",
    planner:"Social Planner", social:"Conexiones RRSS", produccion:"Producción audiovisual", accesos:"Accesos"
  };
  document.getElementById("page-title").textContent = titles[view];
}

function openModal(view,row=null){
  editingId = row?.id || null;
  const fields = document.getElementById("fields");
  fields.innerHTML = "";
  schemas[view].forEach(([key,label,type,options]) => {
    let input;
    if(type === "select"){
      input = document.createElement("select");
      input.innerHTML = `<option value="">${label}</option>` + options.map(o => `<option value="${o}">${o}</option>`).join("");
    } else if(type === "textarea"){
      input = document.createElement("textarea");
      input.placeholder = label;
    } else {
      input = document.createElement("input");
      input.type = type;
      input.placeholder = label;
    }
    input.name = key;
    input.value = row?.[key] ?? "";
    fields.appendChild(input);
  });
  document.getElementById("modal-title").textContent = editingId ? "Editar registro" : "Nuevo registro";
  document.getElementById("modal").showModal();
}
function closeModal(){ document.getElementById("modal").close(); }

document.getElementById("record-form").addEventListener("submit", async e => {
  e.preventDefault();
  const payload = Object.fromEntries(new FormData(e.target).entries());
  ["base","igic"].forEach(k => { if(k in payload) payload[k] = Number(payload[k] || 0); });
  const tableName = tableMap[currentView];
  const result = editingId
    ? await sb.from(tableName).update(payload).eq("id", editingId)
    : await sb.from(tableName).insert(payload);
  if(result.error) return alert(result.error.message);
  closeModal();
  loadAll();
});

window.editRow = (view,id) => openModal(view, cache[view].find(x => x.id === id));
window.deleteRow = async (view,id) => {
  if(!confirm("¿Borrar registro?")) return;
  const { error } = await sb.from(tableMap[view]).delete().eq("id", id);
  if(error) return alert(error.message);
  loadAll();
};

async function loadAll(){
  for(const view of Object.keys(tableMap)){
    const { data, error } = await sb.from(tableMap[view]).select("*").order("created_at",{ascending:false});
    cache[view] = error ? [] : (data || []);
  }
  renderAll();
}

function renderAll(){
  renderClientes(); renderFacturas(); renderPlanner(); renderSocial(); renderProduccion(); renderAccesos(); renderDashboard(); renderCalendar();
}

function renderClientes(){
  document.getElementById("clientes-body").innerHTML = cache.clientes.map(r => `
    <tr><td>${r.nombre||""}</td><td>${r.empresa||""}</td><td>${r.email||""}</td><td>${r.servicio||""}</td><td>${badge(r.estado)}</td><td>${actions("clientes",r.id)}</td></tr>
  `).join("");
}
function renderFacturas(){
  document.getElementById("facturas-body").innerHTML = cache.facturas.map(r => {
    const base = Number(r.base||0), igic = base * Number(r.igic||0)/100, total = base + igic;
    return `<tr><td>${r.numero||""}</td><td>${r.tipo||""}</td><td>${r.cliente||""}</td><td>${r.concepto||""}</td><td>${euro(total)}</td><td>${badge(r.estado)}</td><td>${actions("facturas",r.id)} <button class="action" onclick="downloadInvoice('${r.id}')">PDF</button></td></tr>`;
  }).join("");
}
function renderPlanner(){
  document.getElementById("planner-body").innerHTML = cache.planner.map(r => `
    <tr><td>${r.fecha||""}</td><td>${r.hora||""}</td><td>${r.cliente||""}</td><td>${r.red||""}</td><td>${r.tipo||""}</td><td>${(r.caption||"").slice(0,50)}</td><td>${badge(r.estado)}</td><td><button class="action" onclick="publishPost('${r.id}')">Publicar</button></td><td>${actions("planner",r.id)}</td></tr>
  `).join("");
}
function renderSocial(){
  document.getElementById("social-body").innerHTML = cache.social.map(r => `
    <tr><td>${r.platform||""}</td><td>${r.account_name||""}</td><td>${badge(r.status)}</td><td>${r.created_at ? r.created_at.slice(0,10) : ""}</td><td><button class="action delete" onclick="deleteRow('social','${r.id}')">Borrar</button></td></tr>
  `).join("");
}
function renderProduccion(){
  document.getElementById("produccion-body").innerHTML = cache.produccion.map(r => `
    <tr><td>${r.proyecto||""}</td><td>${r.cliente||""}</td><td>${r.fecha||""}</td><td>${badge(r.estado)}</td><td>${r.notas||""}</td><td>${actions("produccion",r.id)}</td></tr>
  `).join("");
}
function renderAccesos(){
  document.getElementById("accesos-body").innerHTML = cache.accesos.map(r => `
    <tr><td>${r.cliente||""}</td><td>${r.instagram||""}</td><td>${r.tiktok||""}</td><td>${r.facebook||""}</td><td>${r.email||""}</td><td>${r.notas||""}</td><td>${actions("accesos",r.id)}</td></tr>
  `).join("");
}
function renderDashboard(){
  document.getElementById("m-clientes").textContent = cache.clientes.length;
  document.getElementById("m-posts").textContent = cache.planner.length;
  document.getElementById("m-proyectos").textContent = cache.produccion.length;
  const total = cache.facturas.reduce((s,r) => s + Number(r.base||0) + (Number(r.base||0)*Number(r.igic||0)/100), 0);
  document.getElementById("m-facturado").textContent = euro(total);
  document.getElementById("dash-posts").innerHTML = cache.planner.slice(0,7).map(r => `<tr><td>${r.fecha||""}</td><td>${r.cliente||""}</td><td>${r.red||""}</td><td>${r.tipo||""}</td><td>${badge(r.estado)}</td></tr>`).join("");
  document.getElementById("dash-social").innerHTML = ["Instagram/Facebook","TikTok","Google Calendar"].map(p => {
    const found = cache.social.find(s => s.platform === p);
    return `<li><strong>${p}</strong><span>${found ? "Conectado" : "Pendiente"}</span></li>`;
  }).join("");
}
function renderCalendar(){
  const grid = document.getElementById("calendar-grid");
  const days = Array.from({length: 31}, (_,i) => i+1);
  grid.innerHTML = days.map(day => {
    const posts = cache.planner.filter(p => Number((p.fecha||"").split("-")[2]) === day);
    return `<div class="day"><strong>${day}</strong>${posts.map(p => `<span class="post-pill">${p.red} · ${p.tipo}</span>`).join("")}</div>`;
  }).join("");
}

function connectMeta(){
  if(META_APP_ID.includes("PEGA_AQUI")) return alert("Primero completa META_APP_ID en config.js");
  const scope = "pages_show_list,business_management,instagram_basic,instagram_content_publish,pages_read_engagement";
  const url = `https://www.facebook.com/v20.0/dialog/oauth?client_id=${META_APP_ID}&redirect_uri=${encodeURIComponent(CRM_REDIRECT_URL)}&scope=${encodeURIComponent(scope)}&response_type=code&state=meta`;
  window.location.href = url;
}
function connectTikTok(){
  if(TIKTOK_CLIENT_KEY.includes("PEGA_AQUI")) return alert("Primero completa TIKTOK_CLIENT_KEY en config.js");
  const scope = "user.info.basic,video.publish,video.upload";
  const url = `https://www.tiktok.com/v2/auth/authorize/?client_key=${TIKTOK_CLIENT_KEY}&scope=${encodeURIComponent(scope)}&response_type=code&redirect_uri=${encodeURIComponent(CRM_REDIRECT_URL)}&state=tiktok`;
  window.location.href = url;
}
function connectGoogle(){
  if(GOOGLE_CLIENT_ID.includes("PEGA_AQUI")) return alert("Primero completa GOOGLE_CLIENT_ID en config.js");
  const scope = "https://www.googleapis.com/auth/calendar.events";
  const url = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${GOOGLE_CLIENT_ID}&redirect_uri=${encodeURIComponent(CRM_REDIRECT_URL)}&response_type=code&scope=${encodeURIComponent(scope)}&access_type=offline&prompt=consent&state=google`;
  window.location.href = url;
}
function publishPost(id){
  alert("Publicación directa preparada. Falta backend seguro para intercambiar tokens y llamar a APIs oficiales.");
}
function downloadInvoice(id){
  alert("PDF preparado para V2.1: se agregará generación automática con jsPDF.");
}

checkAuth();

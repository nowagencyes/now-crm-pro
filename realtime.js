const sb = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
const tables=['clientes','facturas','gastos','produccion','redes','planner','tareas'];
const db={clientes:[],facturas:[],gastos:[],produccion:[],redes:[],planner:[],tareas:[]};

function logout(){localStorage.removeItem('now_user');window.location.href='/index.html'}
if(!localStorage.getItem('now_user')) window.location.href='/index.html';

function showSection(id,btn){document.querySelectorAll('.section').forEach(s=>s.classList.remove('active'));document.getElementById(id).classList.add('active');document.querySelectorAll('.menu button').forEach(b=>b.classList.remove('active'));btn.classList.add('active')}
function toggleForm(id){document.getElementById(id).classList.toggle('active')}
function euro(v){return Number(v||0).toFixed(2)+'€'}
function pass(v){return v?'••••••':'-'}
async function del(table,id){await sb.from(table).delete().eq('id',id)}
async function insert(table,data){const {error}=await sb.from(table).insert(data);if(error) alert(error.message)}

async function loadAll(){for(const t of tables){const {data,error}=await sb.from(t).select('*').order('created_at',{ascending:false});db[t]=error?[]:(data||[])}render()}
function subscribe(){tables.forEach(t=>{sb.channel('rt_'+t).on('postgres_changes',{event:'*',schema:'public',table:t},()=>loadAll()).subscribe()})}

function guardarCliente(){insert('clientes',{encargado:clienteEncargado.value,telefono:clienteTelefono.value,email:clienteEmail.value,empresa:clienteEmpresa.value,direccion_empresa:clienteDireccionEmpresa.value,cif:clienteCif.value,telefono_empresa:clienteTelefonoEmpresa.value,email_empresa:clienteEmailEmpresa.value,pack:clientePack.value,estado:clienteEstado.value,notas:clienteNotas.value})}
function guardarFactura(){let base=Number(facturaBase.value||0),igic_pct=Number(facturaIgic.value||0),igic=base*igic_pct/100,total=base+igic;insert('facturas',{numero:facturaNumero.value,tipo:facturaTipo.value,cliente:facturaCliente.value,concepto:facturaConcepto.value,base,igic_pct,igic,total,estado:facturaEstado.value})}
function guardarGasto(){let base=Number(gastoBase.value||0),igic_pct=Number(gastoIgic.value||0),igic=base*igic_pct/100,total=base+igic;insert('gastos',{fecha:gastoFecha.value,proveedor:gastoProveedor.value,concepto:gastoConcepto.value,categoria:gastoCategoria.value,base,igic_pct,igic,total,metodo:gastoMetodo.value,notas:gastoNotas.value})}
function guardarProduccion(){insert('produccion',{proyecto:prodProyecto.value,cliente:prodCliente.value,fecha:prodFecha.value,estado:prodEstado.value,notas:prodNotas.value})}
function guardarRed(){insert('redes',{cliente:redCliente.value,instagram:redInstagram.value,instagram_pass:redInstagramPass.value,tiktok:redTiktok.value,tiktok_pass:redTiktokPass.value,facebook:redFacebook.value,facebook_pass:redFacebookPass.value,google:redGoogle.value,google_pass:redGooglePass.value,notas:redNotas.value})}
function guardarPlanner(){insert('planner',{proyecto:planProyecto.value,fecha:planFecha.value,hora:planHora.value,cliente:planCliente.value,red:planRed.value,tipo:planTipo.value,estado:planEstado.value,caption:planCaption.value,hashtags:planHashtags.value,archivos:planArchivos.value})}
function guardarTareaAgenda(){if(!agendaFecha.value||!agendaTitulo.value)return alert('Completa fecha y tarea');insert('tareas',{fecha:agendaFecha.value,hora:agendaHora.value,cliente:agendaCliente.value,tipo:agendaTipo.value,titulo:agendaTitulo.value,notas:agendaNotas.value})}

function render(){
const ingresos=db.facturas.reduce((a,b)=>a+Number(b.total||0),0), gastos=db.gastos.reduce((a,b)=>a+Number(b.total||0),0);
countClientes.innerText=db.clientes.length;countFacturas.innerText=euro(ingresos);countGastos.innerText=euro(gastos);countBalance.innerText=euro(ingresos-gastos);countPlanner.innerText=db.planner.length;countTareas.innerText=db.tareas.length;
finIngresos.innerText=euro(ingresos);finGastos.innerText=euro(gastos);finBalance.innerText=euro(ingresos-gastos);
clientesTabla.innerHTML=db.clientes.map(r=>`<tr><td>${r.encargado||''}<br><span class="small">${r.telefono||''}<br>${r.email||''}</span></td><td>${r.empresa||''}</td><td>${r.direccion_empresa||''}</td><td>${r.cif||''}</td><td>${r.email_empresa||''}</td><td><span class="badge">${r.pack||''}</span></td><td><span class="badge">${r.estado||''}</span></td><td><button class="danger" onclick="del('clientes','${r.id}')">Borrar</button></td></tr>`).join('');
facturasTabla.innerHTML=db.facturas.map(r=>`<tr><td>${r.numero||''}</td><td>${r.tipo||''}</td><td>${r.cliente||''}</td><td>${r.concepto||''}</td><td>${euro(r.base)}</td><td>${r.igic_pct||0}%<br>${euro(r.igic)}</td><td>${euro(r.total)}</td><td><span class="badge">${r.estado||''}</span></td><td><button class="danger" onclick="del('facturas','${r.id}')">Borrar</button></td></tr>`).join('');
gastosTabla.innerHTML=db.gastos.map(r=>`<tr><td>${r.fecha||''}</td><td>${r.proveedor||''}</td><td>${r.concepto||''}</td><td>${r.categoria||''}</td><td>${euro(r.total)}</td><td><button class="danger" onclick="del('gastos','${r.id}')">Borrar</button></td></tr>`).join('');
produccionTabla.innerHTML=db.produccion.map(r=>`<tr><td>${r.proyecto||''}</td><td>${r.cliente||''}</td><td>${r.fecha||''}</td><td>${r.estado||''}</td><td>${r.notas||''}</td><td><button class="danger" onclick="del('produccion','${r.id}')">Borrar</button></td></tr>`).join('');
redesTabla.innerHTML=db.redes.map(r=>`<tr><td>${r.cliente||''}</td><td>${r.instagram||''}<br>${pass(r.instagram_pass)}</td><td>${r.tiktok||''}<br>${pass(r.tiktok_pass)}</td><td>${r.facebook||''}<br>${pass(r.facebook_pass)}</td><td>${r.google||''}<br>${pass(r.google_pass)}</td><td><button class="danger" onclick="del('redes','${r.id}')">Borrar</button></td></tr>`).join('');
plannerTabla.innerHTML=db.planner.map(r=>`<tr><td>${r.proyecto||''}</td><td>${r.fecha||''}</td><td>${r.cliente||''}</td><td>${r.red||''}</td><td>${r.tipo||''}</td><td><span class="badge">${r.estado||''}</span></td><td><button class="danger" onclick="del('planner','${r.id}')">Borrar</button></td></tr>`).join('');
renderCalendar();
}
function setupCalendar(){const months=['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];calendarMonth.innerHTML=months.map((m,i)=>`<option value="${i}">${m}</option>`).join('');for(let y=2026;y<=2040;y++)calendarYear.innerHTML+=`<option value="${y}">${y}</option>`;const n=new Date();calendarMonth.value=n.getMonth();calendarYear.value=Math.min(Math.max(n.getFullYear(),2026),2040);agendaFecha.value=calendarYear.value+'-'+String(Number(calendarMonth.value)+1).padStart(2,'0')+'-01'}
function hoy(){const n=new Date();calendarMonth.value=n.getMonth();calendarYear.value=Math.min(Math.max(n.getFullYear(),2026),2040);renderCalendar()}
function selectDay(date){agendaFecha.value=date;selectedDateTitle.innerText='Agenda del '+date;renderCalendar();renderAgendaDay(date)}
function renderCalendar(){if(!window.calendarGrid)return;const year=Number(calendarYear.value),month=Number(calendarMonth.value),days=new Date(year,month+1,0).getDate();calendarGrid.innerHTML='';for(let d=1;d<=days;d++){const date=year+'-'+String(month+1).padStart(2,'0')+'-'+String(d).padStart(2,'0');const ev=[...db.tareas.filter(x=>x.fecha===date).map(x=>(x.hora?x.hora+' · ':'')+x.titulo),...db.planner.filter(x=>x.fecha===date).map(x=>x.red+' · '+x.tipo),...db.produccion.filter(x=>x.fecha===date).map(x=>'🎬 '+x.proyecto)];calendarGrid.innerHTML+=`<div class="day ${agendaFecha.value===date?'selected':''}" onclick="selectDay('${date}')"><strong>${d}</strong>${ev.map(e=>`<div class="event">${e}</div>`).join('')}</div>`}}
function renderAgendaDay(date){const arr=db.tareas.filter(x=>x.fecha===date);agendaLista.innerHTML=arr.length?arr.map(t=>`<div class="event">${t.hora||''} ${t.titulo||''} · ${t.cliente||''}</div>`).join(''):'<p class="small">Sin tareas para este día.</p>'}

setupCalendar();loadAll();subscribe();

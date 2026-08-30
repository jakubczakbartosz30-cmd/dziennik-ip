const KEY="dziennik-ip-data-v2";
const defaultData={
  farm:{name:"Moje Gospodarstwo",owner:"",address:"",area:""},
  fields:[
    {id:1,name:"Działka 1",area:"4,20 ha",crop:"Jabłoń",variety:"Gala",lat:52.23,lng:21.01},
    {id:2,name:"Działka 2",area:"2,80 ha",crop:"Grusza",variety:"Konferencja",lat:52.235,lng:21.018}
  ],
  treatments:[
    {id:1,date:"2026-08-20",field:"Działka 1",crop:"Jabłoń",type:"Ochrona",product:"Przykładowy środek",dose:"0,5 l/ha",note:"Wpis przykładowy"},
  ],
  observations:[
    {id:1,date:"2026-08-22",field:"Działka 1",type:"Szkodniki",note:"Monitoring wykonany",level:"Niski"}
  ],
  fertilization:[],
  documents:[],
  reports:[]
};
let data=JSON.parse(localStorage.getItem(KEY)||"null")||defaultData;
let route="dashboard";

function save(){localStorage.setItem(KEY,JSON.stringify(data))}
function esc(s){return String(s??"").replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[m]))}
function today(){return new Date().toISOString().slice(0,10)}
function openModal(html){document.querySelector("#modalContent").innerHTML=html;document.querySelector("#modal").classList.remove("hidden")}
function closeModal(){document.querySelector("#modal").classList.add("hidden")}
document.querySelector("#closeModal").onclick=closeModal;
document.querySelector("#modal").addEventListener("click",e=>{if(e.target.id==="modal")closeModal()});
document.querySelector("#profileBtn").onclick=()=>openModal(profileForm());

function layout(title,body){return `<div class="content"><div class="hero"><div class="muted">Gospodarstwo</div><h2>${esc(title)}</h2><div class="muted">${esc(data.farm.name)}${data.farm.area?` • ${esc(data.farm.area)} ha`:""}</div></div>${body}</div>`}
function dashboard(){
 const t=data.treatments.length,o=data.observations.length,f=data.fields.length;
 return layout("Panel główny",`
  <div class="grid">
   <div class="card stat">🌳<div class="muted">Działki</div><strong>${f}</strong></div>
   <div class="card stat">🧪<div class="muted">Zabiegi</div><strong>${t}</strong></div>
   <div class="card stat">🔎<div class="muted">Obserwacje</div><strong>${o}</strong></div>
   <div class="card stat">📄<div class="muted">Dokumenty</div><strong>${data.documents.length}</strong></div>
  </div>
  <div class="section-title"><h3>Szybkie akcje</h3></div>
  <div class="actions">
   <button class="btn" onclick="openTreatment()">+ Dodaj zabieg</button>
   <button class="btn secondary" onclick="openObservation()">+ Obserwacja</button>
   <button class="btn ghost" onclick="openFertilization()">+ Nawożenie</button>
  </div>
  <div class="section-title"><h3>Ostatnie wpisy</h3><button class="btn ghost" onclick="route='history';render()">Wszystkie</button></div>
  <div class="list">${recentList()}</div>`)
}
function recentList(){
 const all=[...data.treatments.map(x=>({...x,k:"Zabieg",date:x.date,desc:`${x.field} • ${x.product}`})),...data.observations.map(x=>({...x,k:"Obserwacja",date:x.date,desc:`${x.field} • ${x.type}`}))].sort((a,b)=>b.date.localeCompare(a.date)).slice(0,5);
 return all.length?all.map(x=>`<div class="list-item"><div><b>${esc(x.k)}</b><div class="muted">${esc(x.date)} • ${esc(x.desc)}</div></div><span class="pill">Wpis</span></div>`).join(""):`<div class="card empty">Brak wpisów. Dodaj pierwszy zabieg lub obserwację.</div>`
}
function farm(){
 return layout("Gospodarstwo",`
  <div class="card"><h3>Dane gospodarstwa</h3><p><b>${esc(data.farm.name)}</b></p><p class="muted">${esc(data.farm.owner||"Właściciel nieuzupełniony")}<br>${esc(data.farm.address||"Adres nieuzupełniony")}</p><button class="btn secondary" onclick="openModal(profileForm())">Edytuj dane</button></div>
  <div class="section-title"><h3>Działki i kwatery</h3><button class="btn" onclick="openField()">+ Działka</button></div>
  <div class="list">${data.fields.map(f=>`<div class="list-item"><div><b>${esc(f.name)}</b><div class="muted">${esc(f.crop)} ${f.variety?`• ${esc(f.variety)}`:""} • ${esc(f.area)}</div></div><button class="btn ghost" onclick="editField(${f.id})">Edytuj</button></div>`).join("")||`<div class="card empty">Nie ma jeszcze działek.</div>`}</div>
  <div class="section-title"><h3>Mapa działek</h3></div><div id="map"></div>`)
}
function initMap(){
 if(!window.L||!document.querySelector("#map"))return;
 const map=L.map("map").setView([52.23,21.01],11);
 L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",{attribution:"© OpenStreetMap"}).addTo(map);
 data.fields.forEach(f=>L.marker([f.lat||52.23,f.lng||21.01]).addTo(map).bindPopup(`<b>${esc(f.name)}</b><br>${esc(f.crop)} • ${esc(f.area)}`));
}
function treatments(){
 return layout("Zabiegi",`
  <div class="actions"><button class="btn" onclick="openTreatment()">+ Dodaj zabieg</button><button class="btn ghost" onclick="route='history';render()">Historia</button></div>
  <div class="section-title"><h3>Ostatnie zabiegi</h3></div>
  <div class="list">${data.treatments.slice().sort((a,b)=>b.date.localeCompare(a.date)).map(t=>`<div class="card"><div class="section-title" style="margin:0 0 8px"><b>${esc(t.date)}</b><span class="pill">${esc(t.type)}</span></div><b>${esc(t.product)}</b><div class="muted">${esc(t.field)} • ${esc(t.crop)} • ${esc(t.dose)}</div>${t.note?`<p>${esc(t.note)}</p>`:""}<button class="btn danger" onclick="deleteItem('treatments',${t.id})">Usuń</button></div>`).join("")||`<div class="card empty">Brak zabiegów.</div>`}</div>`)
}
function history(){
 return layout("Historia i monitoring",`
  <input class="search" id="historySearch" placeholder="Szukaj po działce, produkcie, typie..." oninput="filterHistory()">
  <div id="historyList">${historyItems()}</div>
  <div class="section-title"><h3>Obserwacje</h3><button class="btn" onclick="openObservation()">+ Dodaj</button></div>
  <div class="list">${data.observations.slice().sort((a,b)=>b.date.localeCompare(a.date)).map(o=>`<div class="list-item"><div><b>${esc(o.type)}</b><div class="muted">${esc(o.date)} • ${esc(o.field)} • ${esc(o.level)}</div><div>${esc(o.note)}</div></div><button class="btn danger" onclick="deleteItem('observations',${o.id})">Usuń</button></div>`).join("")||`<div class="card empty">Brak obserwacji.</div>`}</div>`)
}
function historyItems(q=""){const a=data.treatments.filter(x=>Object.values(x).join(" ").toLowerCase().includes(q.toLowerCase()));return `<div class="list">${a.map(t=>`<div class="list-item"><div><b>${esc(t.date)} — ${esc(t.product)}</b><div class="muted">${esc(t.field)} • ${esc(t.type)} • ${esc(t.dose)}</div></div><span class="pill">Zabieg</span></div>`).join("")||`<div class="card empty">Brak wyników.</div>`}</div>`}
function filterHistory(){document.querySelector("#historyList").innerHTML=historyItems(document.querySelector("#historySearch").value)}
function more(){
 return layout("Więcej",`
  <div class="list">
   <button class="list-item module-card" onclick="route='observations';render()"><span class="module-icon">🔎</span><div><b>Obserwacje</b><div class="muted">Monitoring agrofagów i zagrożeń</div></div></button>
   <button class="list-item module-card" onclick="route='fertilization';render()"><span class="module-icon">🌱</span><div><b>Nawożenie</b><div class="muted">Rejestr nawożenia i dawek</div></div></button>
   <button class="list-item module-card" onclick="route='ip';render()"><span class="module-icon">📘</span><div><b>Dziennik IP</b><div class="muted">Zasady, monitoring i decyzje</div></div></button>
   <button class="list-item module-card" onclick="route='documents';render()"><span class="module-icon">📄</span><div><b>Dokumenty</b><div class="muted">Rejestr dokumentów gospodarstwa</div></div></button>
   <button class="list-item module-card" onclick="route='reports';render()"><span class="module-icon">📊</span><div><b>Raporty</b><div class="muted">Podsumowania i wydruk</div></div></button>
  </div>`)
}
function observations(){return layout("Obserwacje",`<div class="actions"><button class="btn" onclick="openObservation()">+ Nowa obserwacja</button></div><div class="section-title"><h3>Monitoring</h3></div><div class="list">${data.observations.map(o=>`<div class="card"><b>${esc(o.type)}</b><span class="pill">${esc(o.level)}</span><div class="muted">${esc(o.date)} • ${esc(o.field)}</div><p>${esc(o.note)}</p><button class="btn danger" onclick="deleteItem('observations',${o.id})">Usuń</button></div>`).join("")||`<div class="card empty">Brak obserwacji.</div>`}</div>`)}
function fertilization(){return layout("Nawożenie",`<div class="actions"><button class="btn" onclick="openFertilization()">+ Dodaj nawożenie</button></div><div class="section-title"><h3>Rejestr nawożenia</h3></div><div class="list">${data.fertilization.map(f=>`<div class="list-item"><div><b>${esc(f.product)}</b><div class="muted">${esc(f.date)} • ${esc(f.field)} • ${esc(f.dose)}</div></div><button class="btn danger" onclick="deleteItem('fertilization',${f.id})">Usuń</button></div>`).join("")||`<div class="card empty">Brak wpisów nawożenia.</div>`}</div>`)}
function ip(){return layout("Dziennik IP",`<div class="card"><h3>Integrowana produkcja</h3><p class="muted">W tym module zapisuj monitoring, decyzje dotyczące ochrony, zabiegi, obserwacje i inne informacje potrzebne do prowadzenia dokumentacji IP.</p><div class="actions"><button class="btn" onclick="openObservation()">+ Monitoring</button><button class="btn secondary" onclick="openTreatment()">+ Zabieg</button></div></div><div class="section-title"><h3>Ostatnie wpisy</h3></div><div class="list">${recentList()}</div>`)}
function documents(){return layout("Dokumenty",`<div class="card"><h3>Rejestr dokumentów</h3><p class="muted">Dodawaj nazwy dokumentów i informacje, gdzie są przechowywane.</p><button class="btn" onclick="openDocument()">+ Dodaj dokument</button></div><div class="section-title"><h3>Dokumenty</h3></div><div class="list">${data.documents.map(d=>`<div class="list-item"><div><b>${esc(d.name)}</b><div class="muted">${esc(d.date)} • ${esc(d.note)}</div></div><button class="btn danger" onclick="deleteItem('documents',${d.id})">Usuń</button></div>`).join("")||`<div class="card empty">Brak dokumentów.</div>`}</div>`)}
function reports(){return layout("Raporty",`<div class="card"><h3>Podsumowanie sezonu</h3><p>Działki: <b>${data.fields.length}</b> • Zabiegi: <b>${data.treatments.length}</b> • Obserwacje: <b>${data.observations.length}</b> • Nawożenie: <b>${data.fertilization.length}</b></p><div class="actions"><button class="btn" onclick="printReport()">Drukuj / PDF</button><button class="btn secondary" onclick="exportData()">Eksport danych</button></div></div><div class="section-title"><h3>Raporty</h3></div><div class="list">${data.reports.map(r=>`<div class="list-item"><div><b>${esc(r.name)}</b><div class="muted">${esc(r.date)}</div></div></div>`).join("")||`<div class="card empty">Raport zostanie utworzony przy wydruku.</div>`}</div>`)}
function profileForm(){return `<h2>Dane gospodarstwa</h2><form class="form" onsubmit="saveFarm(event)"><label>Nazwa gospodarstwa<input name="name" value="${esc(data.farm.name)}" required></label><label>Właściciel<input name="owner" value="${esc(data.farm.owner)}"></label><label>Adres<input name="address" value="${esc(data.farm.address)}"></label><label>Powierzchnia [ha]<input name="area" value="${esc(data.farm.area)}"></label><button class="btn">Zapisz</button></form>`}
function saveFarm(e){e.preventDefault();const f=new FormData(e.target);data.farm=Object.fromEntries(f);save();closeModal();render()}
function openField(existing=null){const f=existing||{name:"",area:"",crop:"",variety:"",lat:52.23,lng:21.01};openModal(`<h2>${existing?"Edytuj działkę":"Nowa działka"}</h2><form class="form" onsubmit="saveField(event,${existing?existing.id:"null"})"><label>Nazwa<input name="name" value="${esc(f.name)}" required></label><div class="form-row"><label>Powierzchnia<input name="area" value="${esc(f.area)}"></label><label>Uprawa<input name="crop" value="${esc(f.crop)}"></label></div><label>Odmiana / kwatera<input name="variety" value="${esc(f.variety)}"></label><div class="form-row"><label>Szerokość<input name="lat" value="${f.lat}"></label><label>Długość<input name="lng" value="${f.lng}"></label></div><button class="btn">Zapisz działkę</button></form>`)}
function editField(id){openField(data.fields.find(x=>x.id===id))}
function saveField(e,id){e.preventDefault();const f=Object.fromEntries(new FormData(e.target));f.id=id||Date.now();f.lat=Number(f.lat)||52.23;f.lng=Number(f.lng)||21.01;if(id)data.fields=data.fields.map(x=>x.id===id?f:x);else data.fields.push(f);save();closeModal();render()}
function openTreatment(){openModal(`<h2>Dodaj zabieg</h2><form class="form" onsubmit="saveTreatment(event)"><div class="form-row"><label>Data<input type="date" name="date" value="${today()}" required></label><label>Działka<select name="field">${data.fields.map(f=>`<option>${esc(f.name)}</option>`).join("")}</select></label></div><div class="form-row"><label>Uprawa<input name="crop" placeholder="np. jabłoń"></label><label>Typ<select name="type"><option>Ochrona</option><option>Herbicyd</option><option>Fungicyd</option><option>Insektycyd</option><option>Inny</option></select></label></div><label>Środek / produkt<input name="product" required></label><label>Dawka<input name="dose" placeholder="np. 0,5 l/ha"></label><label>Uwagi<textarea name="note"></textarea></label><button class="btn">Zapisz zabieg</button></form>`)}
function saveTreatment(e){e.preventDefault();data.treatments.push({...Object.fromEntries(new FormData(e.target)),id:Date.now()});save();closeModal();render()}
function openObservation(){openModal(`<h2>Dodaj obserwację</h2><form class="form" onsubmit="saveObservation(event)"><div class="form-row"><label>Data<input type="date" name="date" value="${today()}" required></label><label>Działka<select name="field">${data.fields.map(f=>`<option>${esc(f.name)}</option>`).join("")}</select></label></div><label>Rodzaj<select name="type"><option>Szkodniki</option><option>Choroby</option><option>Chwasty</option><option>Fenologia</option><option>Inne</option></select></label><label>Poziom zagrożenia<select name="level"><option>Niski</option><option>Średni</option><option>Wysoki</option></select></label><label>Opis<textarea name="note" required></textarea></label><button class="btn">Zapisz obserwację</button></form>`)}
function saveObservation(e){e.preventDefault();data.observations.push({...Object.fromEntries(new FormData(e.target)),id:Date.now()});save();closeModal();render()}
function openFertilization(){openModal(`<h2>Dodaj nawożenie</h2><form class="form" onsubmit="saveFertilization(event)"><div class="form-row"><label>Data<input type="date" name="date" value="${today()}" required></label><label>Działka<select name="field">${data.fields.map(f=>`<option>${esc(f.name)}</option>`).join("")}</select></label></div><label>Nawóz<input name="product" required></label><label>Dawka<input name="dose" placeholder="np. 200 kg/ha" required></label><label>Uwagi<textarea name="note"></textarea></label><button class="btn">Zapisz</button></form>`)}
function saveFertilization(e){e.preventDefault();data.fertilization.push({...Object.fromEntries(new FormData(e.target)),id:Date.now()});save();closeModal();render()}
function openDocument(){openModal(`<h2>Dodaj dokument</h2><form class="form" onsubmit="saveDocument(event)"><label>Nazwa dokumentu<input name="name" required></label><label>Data<input type="date" name="date" value="${today()}"></label><label>Opis / lokalizacja<textarea name="note"></textarea></label><button class="btn">Zapisz</button></form>`)}
function saveDocument(e){e.preventDefault();data.documents.push({...Object.fromEntries(new FormData(e.target)),id:Date.now()});save();closeModal();render()}
function deleteItem(key,id){if(confirm("Usunąć ten wpis?")){data[key]=data[key].filter(x=>x.id!==id);save();render()}}
function exportData(){const blob=new Blob([JSON.stringify(data,null,2)],{type:"application/json"});const a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download="dziennik-ip-backup.json";a.click();URL.revokeObjectURL(a.href)}
function printReport(){window.print()}
function render(){const map={dashboard,farm,treatments,history,more,observations,fertilization,ip,documents,reports};document.querySelector("#screen").innerHTML=map[route]();document.querySelectorAll(".bottom-nav button").forEach(b=>b.classList.toggle("active",b.dataset.route===route));if(route==="farm")setTimeout(initMap,30)}
document.querySelectorAll(".bottom-nav button").forEach(b=>b.onclick=()=>{route=b.dataset.route;render()});
render();

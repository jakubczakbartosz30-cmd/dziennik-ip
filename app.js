const KEY="dziennik-ip-docelowy-v1";
let D=JSON.parse(localStorage.getItem(KEY)||"null")||{
 farm:{name:"Gospodarstwo Jabłoniowe",owner:"",address:""},
 fields:[
  {id:1,name:"Kwatera 01",crop:"Jabłoń",variety:"Gala",area:"2,10 ha"},
  {id:2,name:"Kwatera 02",crop:"Jabłoń",variety:"Golden",area:"1,80 ha"},
  {id:3,name:"Kwatera 03",crop:"Jabłoń",variety:"Ligol",area:"2,40 ha"},
  {id:4,name:"Kwatera 04",crop:"Jabłoń",variety:"Szampion",area:"3,20 ha"},
  {id:5,name:"Kwatera 05",crop:"Jabłoń",variety:"Gala",area:"2,10 ha"}
 ],
 treatments:[],observations:[],fertilization:[],documents:[]
};
let route="home";
const $=s=>document.querySelector(s);
const esc=x=>String(x??"").replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[m]));
const today=()=>new Date().toISOString().slice(0,10);
function save(){localStorage.setItem(KEY,JSON.stringify(D))}
function go(r){route=r;render();scrollTo(0,0)}
function closeModal(){$("#modal").classList.add("hidden")}
function modal(html){$("#sheet").innerHTML=html;$("#modal").classList.remove("hidden")}
function toast(x){let t=$("#toast");t.textContent=x;t.style.display="block";clearTimeout(window.__t);window.__t=setTimeout(()=>t.style.display="none",2200)}
function nav(){document.querySelectorAll(".nav button[data-route]").forEach(b=>b.classList.toggle("active",b.dataset.route===route))}
function render(){
 let html=route==="home"?home():route==="map"?mapPage():route==="history"?history():route==="more"?more():route==="observations"?observations():route==="fertilization"?fertilization():route==="ip"?ip():route==="documents"?documents():route==="reports"?reports():home();
 $("#screen").innerHTML=html;nav()
}
function home(){
 return `<div class="hero"><div class="muted">WITAJ</div><h2>${esc(D.farm.name)}</h2><div class="muted">Dokumentacja Integrowanej Produkcji • sezon 2026</div></div>
 <div class="grid">
  <button class="card action" onclick="go('map')"><span class="icon">🗺️</span><span class="title">Mapa kwater</span><span class="muted">${D.fields.length} kwater</span></button>
  <button class="card action" onclick="openTreatment()"><span class="icon">🧪</span><span class="title">Dodaj zabieg</span><span class="muted">Pełny formularz</span></button>
  <button class="card action" onclick="go('history')"><span class="icon">📋</span><span class="title">Historia</span><span class="muted">${D.treatments.length} zabiegów</span></button>
  <button class="card action" onclick="go('ip')"><span class="icon">🌱</span><span class="title">Dziennik IP</span><span class="muted">Dokumentacja</span></button>
 </div>
 <div class="section"><div class="card"><div class="row"><div><div class="muted">Kompletność dokumentacji IP</div><div class="big">78%</div></div><span class="pill">DOBRZE</span></div><div class="progress"><i></i></div></div></div>
 <div class="section"><div class="section-title"><h3>Ostatnie zabiegi</h3><button class="btn light" onclick="go('history')">Wszystkie</button></div>${recent()}</div>`
}
function recent(){
 if(!D.treatments.length)return `<div class="card empty">Brak zabiegów.<br><br><button class="btn" onclick="openTreatment()">+ Dodaj pierwszy zabieg</button></div>`;
 return `<div class="list">${D.treatments.slice().reverse().slice(0,5).map(t=>`<div class="item"><div class="row"><div><b>${esc(t.product)}</b><div class="muted">${esc(t.date)} • ${esc(t.field)}</div><div class="muted">${esc(t.purpose)} • ${esc(t.dose||"brak dawki")}</div></div><span class="pill">Wpisany</span></div></div>`).join("")}</div>`
}
function mapPage(){
 return `<div class="top"><div><div class="muted">GOSPODARSTWO</div><h2>Mapa kwater</h2></div><button class="btn" onclick="openField()">+ Kwatera</button></div>
 <div class="mapbox">
  ${D.fields.slice(0,5).map((f,i)=>`<button class="plot p${i+1}" onclick="fieldInfo(${f.id})">${esc(f.name)}<br>${esc(f.area)}</button>`).join("")}
 </div>
 <div class="section"><div class="section-title"><h3>Działki i kwatery</h3></div><div class="list">${D.fields.map(f=>`<div class="item"><div class="row"><div><b>${esc(f.name)}</b><div class="muted">${esc(f.crop)} • ${esc(f.variety)} • ${esc(f.area)}</div></div><button class="btn alt" onclick="editField(${f.id})">Edytuj</button></div></div>`).join("")}</div></div>`
}
function fieldInfo(id){
 const f=D.fields.find(x=>x.id===id); if(!f)return;
 modal(`<h2>${esc(f.name)}</h2><p><b>${esc(f.crop)}</b> • ${esc(f.variety)}</p><p class="muted">Powierzchnia: ${esc(f.area)}</p><div class="actions"><button class="btn" onclick="closeModal();openTreatment(${f.id})">🧪 Dodaj zabieg</button><button class="btn alt" onclick="editField(${f.id})">✏️ Edytuj</button></div>`)
}
function history(){
 return `<div class="top"><div><div class="muted">REJESTR</div><h2>Historia zabiegów</h2></div><button class="btn" onclick="openTreatment()">+ Zabieg</button></div>
 <input class="search" id="q" placeholder="Szukaj po preparacie, kwaterze, celu..." oninput="filterHistory()">
 <div id="hist">${historyItems("")}</div>`
}
function historyItems(q){
 let a=D.treatments.filter(t=>Object.values(t).join(" ").toLowerCase().includes(q.toLowerCase()));
 if(!a.length)return `<div class="card empty">Brak wyników.</div>`;
 return `<div class="list">${a.slice().reverse().map(t=>`<div class="item"><div class="row"><div><b>${esc(t.product)}</b><div class="muted">${esc(t.date)} • ${esc(t.field)} • ${esc(t.purpose)}</div><div>${esc(t.dose||"—")} ${t.water?"• "+esc(t.water):""}</div>${t.note?`<div class="muted">${esc(t.note)}</div>`:""}</div><button class="btn light" onclick="del('treatments',${t.id})">Usuń</button></div></div>`).join("")}</div>`
}
function filterHistory(){let q=$("#q");$("#hist").innerHTML=historyItems(q?q.value:"")}
function more(){
 return `<div class="hero"><h2>Moduły</h2><div class="muted">Pełna dokumentacja gospodarstwa</div></div>
 <div class="list">
 <button class="item module-card" onclick="go('observations')">🔎 <div><b>Obserwacje</b><div class="muted">Monitoring agrofagów i zagrożeń</div></div></button>
 <button class="item module-card" onclick="go('fertilization')">🌱 <div><b>Nawożenie</b><div class="muted">Rejestr nawożenia i dawek</div></div></button>
 <button class="item module-card" onclick="go('ip')">📘 <div><b>Dziennik IP</b><div class="muted">Dokumentacja i kompletność</div></div></button>
 <button class="item module-card" onclick="go('documents')">📄 <div><b>Dokumenty</b><div class="muted">Rejestr dokumentów</div></div></button>
 <button class="item module-card" onclick="go('reports')">📊 <div><b>Raporty</b><div class="muted">Podsumowanie i wydruk</div></div></button>
 </div>`
}
function observations(){
 return `<div class="top"><button class="back" onclick="go('more')">‹</button><h2>Obserwacje</h2></div><button class="btn full" onclick="openObservation()">+ Dodaj obserwację</button>
 <div class="section list">${D.observations.slice().reverse().map(o=>`<div class="item"><div class="row"><b>${esc(o.type)}</b><span class="pill">${esc(o.level)}</span></div><div class="muted">${esc(o.date)} • ${esc(o.field)}</div><p>${esc(o.note)}</p><button class="btn light" onclick="del('observations',${o.id})">Usuń</button></div>`).join("")||`<div class="card empty">Brak obserwacji.</div>`}</div>`
}
function fertilization(){
 return `<div class="top"><button class="back" onclick="go('more')">‹</button><h2>Nawożenie</h2></div><button class="btn full" onclick="openFertilization()">+ Dodaj nawożenie</button>
 <div class="section list">${D.fertilization.slice().reverse().map(x=>`<div class="item"><b>${esc(x.product)}</b><div class="muted">${esc(x.date)} • ${esc(x.field)} • ${esc(x.dose)}</div><button class="btn light" onclick="del('fertilization',${x.id})">Usuń</button></div>`).join("")||`<div class="card empty">Brak wpisów.</div>`}</div>`
}
function ip(){
 return `<div class="top"><button class="back" onclick="go('more')">‹</button><h2>Dziennik IP</h2></div>
 <div class="card"><div class="row"><div><div class="muted">Kompletność</div><div class="big">78%</div></div><span class="pill">12 / 15</span></div><div class="progress"><i></i></div></div>
 <div class="section grid"><div class="card">🧪<br><b>Zabiegi</b><br><span class="muted">${D.treatments.length}</span></div><div class="card">🔎<br><b>Monitoring</b><br><span class="muted">${D.observations.length}</span></div><div class="card">🌱<br><b>Nawożenie</b><br><span class="muted">${D.fertilization.length}</span></div><div class="card">📄<br><b>Dokumenty</b><br><span class="muted">${D.documents.length}</span></div></div>`
}
function documents(){
 return `<div class="top"><button class="back" onclick="go('more')">‹</button><h2>Dokumenty</h2></div><button class="btn full" onclick="openDocument()">+ Dodaj dokument</button>
 <div class="section list">${D.documents.map(x=>`<div class="item"><b>${esc(x.name)}</b><div class="muted">${esc(x.date)} • ${esc(x.note)}</div><button class="btn light" onclick="del('documents',${x.id})">Usuń</button></div>`).join("")||`<div class="card empty">Brak dokumentów.</div>`}</div>`
}
function reports(){
 return `<div class="top"><button class="back" onclick="go('more')">‹</button><h2>Raporty</h2></div><div class="card"><h3>Sezon 2026</h3><p>Działki: <b>${D.fields.length}</b><br>Zabiegi: <b>${D.treatments.length}</b><br>Obserwacje: <b>${D.observations.length}</b><br>Nawożenie: <b>${D.fertilization.length}</b></p><button class="btn full" onclick="window.print()">Drukuj / zapisz PDF</button></div>`
}
function openTreatment(fieldId){
 const opts=D.fields.map(f=>`<option value="${esc(f.name)}" ${fieldId===f.id?"selected":""}>${esc(f.name)} — ${esc(f.crop)} • ${esc(f.variety)} • ${esc(f.area)}</option>`).join("");
 modal(`<h2>Dodaj zabieg</h2>
 <div class="stepbar"><span class="step on"></span><span class="step on"></span><span class="step"></span></div>
 <form class="form" onsubmit="saveTreatment(event)">
 <div class="two"><div class="field"><label>Data</label><input name="date" type="date" value="${today()}" required></div><div class="field"><label>Godzina</label><input name="time" type="time"></div></div>
 <div class="field"><label>Kwatery</label><div class="checks">${D.fields.map(f=>`<button type="button" class="check ${fieldId===f.id?"on":""}" onclick="this.classList.toggle('on')">${esc(f.name)}</button>`).join("")}</div><select name="field">${opts}</select></div>
 <div class="two"><div class="field"><label>Uprawa</label><input name="crop" placeholder="np. jabłoń"></div><div class="field"><label>Typ</label><select name="type"><option>Ochrona roślin</option><option>Fungicyd</option><option>Insektycyd</option><option>Herbicyd</option><option>Nawożenie dolistne</option><option>Inny</option></select></div></div>
 <div class="field"><label>Cel zabiegu</label><select name="purpose"><option>Parch jabłoni</option><option>Mączniak</option><option>Szkodnik</option><option>Chwasty</option><option>Szara pleśń</option><option>Inny</option></select></div>
 <div class="field"><label>Środek / preparat</label><input name="product" placeholder="Nazwa preparatu" required></div>
 <div class="two"><div class="field"><label>Dawka</label><input name="dose" placeholder="np. 0,75 kg/ha"></div><div class="field"><label>Ilość wody</label><input name="water" placeholder="np. 500 l/ha"></div></div>
 <div class="two"><div class="field"><label>Temperatura</label><input name="temp" placeholder="°C"></div><div class="field"><label>Wiatr</label><input name="wind" placeholder="km/h"></div></div>
 <div class="field"><label>Operator</label><input name="operator" placeholder="Imię i nazwisko"></div>
 <div class="field"><label>Uwagi</label><textarea name="note" placeholder="Warunki, dodatkowe informacje..."></textarea></div>
 <div class="note"><b>Kontrola wpisu:</b> przed zapisaniem sprawdź kwaterę, preparat, dawkę i ilość wody.</div>
 <button class="btn full">ZAPISZ ZABIEG</button></form>`)
}
function saveTreatment(e){e.preventDefault();D.treatments.push({...Object.fromEntries(new FormData(e.target)),id:Date.now()});save();closeModal();toast("Zabieg zapisany");render()}
function openObservation(){modal(`<h2>Nowa obserwacja</h2><form class="form" onsubmit="saveObservation(event"><div class="two"><div class="field"><label>Data</label><input name="date" type="date" value="${today()}"></div><div class="field"><label>Działka</label><select name="field">${D.fields.map(f=>`<option>${esc(f.name)}</option>`).join("")}</select></div></div><div class="field"><label>Rodzaj</label><select name="type"><option>Szkodniki</option><option>Choroby</option><option>Chwasty</option><option>Fenologia</option><option>Inne</option></select></div><div class="field"><label>Poziom zagrożenia</label><select name="level"><option>Niski</option><option>Średni</option><option>Wysoki</option></select></div><div class="field"><label>Opis</label><textarea name="note" required></textarea></div><button class="btn full">ZAPISZ OBSERWACJĘ</button></form>`)}
function saveObservation(e){e.preventDefault();D.observations.push({...Object.fromEntries(new FormData(e.target)),id:Date.now()});save();closeModal();toast("Obserwacja zapisana");render()}
function openFertilization(){modal(`<h2>Dodaj nawożenie</h2><form class="form" onsubmit="saveFertilization(event)"><div class="two"><div class="field"><label>Data</label><input name="date" type="date" value="${today()}"></div><div class="field"><label>Działka</label><select name="field">${D.fields.map(f=>`<option>${esc(f.name)}</option>`).join("")}</select></div></div><div class="field"><label>Nawóz</label><input name="product" required></div><div class="field"><label>Dawka</label><input name="dose" placeholder="np. 200 kg/ha" required></div><div class="field"><label>Uwagi</label><textarea name="note"></textarea></div><button class="btn full">ZAPISZ</button></form>`)}
function saveFertilization(e){e.preventDefault();D.fertilization.push({...Object.fromEntries(new FormData(e.target)),id:Date.now()});save();closeModal();toast("Nawożenie zapisane");render()}
function openDocument(){modal(`<h2>Dodaj dokument</h2><form class="form" onsubmit="saveDocument(event)"><div class="field"><label>Nazwa dokumentu</label><input name="name" required></div><div class="field"><label>Data</label><input name="date" type="date" value="${today()}"></div><div class="field"><label>Opis / lokalizacja</label><textarea name="note"></textarea></div><button class="btn full">ZAPISZ DOKUMENT</button></form>`)}
function saveDocument(e){e.preventDefault();D.documents.push({...Object.fromEntries(new FormData(e.target)),id:Date.now()});save();closeModal();toast("Dokument zapisany");render()}
function openField(existing){
 const f=existing||{name:"",crop:"Jabłoń",variety:"",area:""};
 modal(`<h2>${existing?"Edytuj kwaterę":"Dodaj kwaterę"}</h2>
 <div class="note">Mapa jest osobnym ekranem. <b>Nie znajduje się w tym formularzu</b>, więc nic nie zasłania pól podczas wpisywania danych.</div>
 <form class="form" onsubmit="saveField(event,${existing?existing.id:0})">
 <div class="field"><label>Nazwa kwatery</label><input name="name" value="${esc(f.name)}" placeholder="np. Kwatera 06" required></div>
 <div class="two"><div class="field"><label>Uprawa</label><input name="crop" value="${esc(f.crop)}"></div><div class="field"><label>Odmiana</label><input name="variety" value="${esc(f.variety)}"></div></div>
 <div class="field"><label>Powierzchnia</label><input name="area" value="${esc(f.area)}" placeholder="np. 2,40 ha"></div>
 <div class="field"><label>Uwagi do kwatery</label><textarea name="note" placeholder="Opcjonalnie"></textarea></div>
 <div class="actions"><button type="button" class="btn light" onclick="closeModal()">Anuluj</button><button class="btn">ZAPISZ KWATERĘ</button></div>
 </form>`)
}
function editField(id){let f=D.fields.find(x=>x.id===id);if(f)openField(f)}
function saveField(e,id){e.preventDefault();let x=Object.fromEntries(new FormData(e.target));x.id=id||Date.now();if(id)D.fields=D.fields.map(f=>f.id===id?{...f,...x}:f);else D.fields.push(x);save();closeModal();toast("Kwatera zapisana");render()}
function openFarmSettings(){modal(`<h2>Dane gospodarstwa</h2><form class="form" onsubmit="saveFarm(event)"><div class="field"><label>Nazwa gospodarstwa</label><input name="name" value="${esc(D.farm.name)}" required></div><div class="field"><label>Właściciel</label><input name="owner" value="${esc(D.farm.owner)}"></div><div class="field"><label>Adres</label><input name="address" value="${esc(D.farm.address)}"></div><button class="btn full">ZAPISZ</button></form>`)}
function saveFarm(e){e.preventDefault();D.farm=Object.fromEntries(new FormData(e.target));save();closeModal();toast("Dane gospodarstwa zapisane");render()}
function del(k,id){if(confirm("Usunąć wpis?")){D[k]=D[k].filter(x=>x.id!==id);save();render()}}
render();
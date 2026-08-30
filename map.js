/* Interaktywna mapa Dziennika IP */
(function(){
  const css=document.createElement('style');
  css.textContent=`
  .real-map{height:430px;width:100%;border-radius:22px;overflow:hidden;border:1px solid #dfe7df;box-shadow:0 8px 25px rgba(20,60,35,.08);position:relative;z-index:1}
  .map-tools{display:flex;gap:10px;flex-wrap:wrap;margin:12px 0}
  .map-tool{background:#fff;border:1px solid #dce5dc;border-radius:14px;padding:10px 14px;font-weight:700;color:#173b2b;box-shadow:0 3px 10px rgba(0,0,0,.06)}
  .field-marker{background:#138a42;color:#fff;border:3px solid #fff;border-radius:50%;width:38px;height:38px;display:flex;align-items:center;justify-content:center;font-weight:800;font-size:13px;box-shadow:0 3px 12px rgba(0,0,0,.28)}
  .leaflet-popup-content-wrapper{border-radius:16px}.leaflet-popup-content{margin:14px 16px;font-family:system-ui,-apple-system,sans-serif}
  .popup-title{font-size:17px;font-weight:800;margin-bottom:5px}.popup-muted{color:#657168;font-size:13px;margin-bottom:10px}.popup-btn{border:0;background:#198b43;color:#fff;padding:9px 13px;border-radius:10px;font-weight:700}
  .map-note{margin-top:10px;padding:11px 13px;border-radius:14px;background:#f1f8f2;color:#3f5a47;font-size:13px}
  `;
  document.head.appendChild(css);

  window.mapPage=function(){
    return `<div class="top"><div><div class="muted">GOSPODARSTWO</div><h2>Mapa kwater</h2><div class="muted">Interaktywna mapa gospodarstwa</div></div><button class="btn" onclick="openField()">+ Kwatera</button></div>
    <div class="map-tools"><button class="map-tool" onclick="locateFarm()">⌖ Moja lokalizacja</button><button class="map-tool" onclick="fitFields()">▣ Pokaż wszystkie kwatery</button></div>
    <div id="farmMap" class="real-map"></div>
    <div class="map-note">Kliknij znacznik kwatery, aby zobaczyć jej dane. Mapa korzysta z OpenStreetMap.</div>
    <div class="section"><div class="section-title"><h3>Lista kwater</h3></div><div class="list">${D.fields.map(f=>`<div class="item"><div class="row"><div><b>${esc(f.name)}</b><div class="muted">${esc(f.crop)} • ${esc(f.variety)} • ${esc(f.area)}</div></div><button class="btn alt" onclick="fieldInfo(${f.id})">Otwórz</button></div></div>`).join('')}</div></div>`;
  };

  let map=null, markers=[];

  function icon(id){
    return L.divIcon({className:'',html:`<div class="field-marker">${String(id).padStart(2,'0')}</div>`,iconSize:[38,38],iconAnchor:[19,19],popupAnchor:[0,-19]});
  }

  function initMap(){
    const el=document.getElementById('farmMap');
    if(!el || typeof L==='undefined') return;
    if(map){map.remove();map=null;markers=[];}
    map=L.map(el,{zoomControl:true}).setView([52.2297,21.0122],13);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{
      maxZoom:19,attribution:'© OpenStreetMap contributors'
    }).addTo(map);

    const base=[52.2297,21.0122];
    const offsets=[[.008,-.010],[.004,-.002],[.010,.006],[-.001,.010],[-.008,-.005],[.003,.014],[-.009,.009],[-.012,-.010]];
    D.fields.forEach((f,i)=>{
      const o=offsets[i%offsets.length];
      const marker=L.marker([base[0]+o[0],base[1]+o[1]],{icon:icon(f.id)}).addTo(map);
      marker.bindPopup(`<div class="popup-title">${esc(f.name)}</div><div class="popup-muted">${esc(f.crop)} • ${esc(f.variety)} • ${esc(f.area)}</div><button class="popup-btn" onclick="fieldInfo(${f.id})">Szczegóły kwatery</button>`);
      markers.push(marker);
    });
    setTimeout(()=>map.invalidateSize(),100);
  }

  window.fitFields=function(){
    if(!map || !markers.length)return;
    map.fitBounds(L.featureGroup(markers).getBounds().pad(.18));
  };

  window.locateFarm=function(){
    if(!map || !navigator.geolocation){toast('Lokalizacja jest niedostępna');return;}
    navigator.geolocation.getCurrentPosition(p=>{
      map.setView([p.coords.latitude,p.coords.longitude],16);
      L.circleMarker([p.coords.latitude,p.coords.longitude],{radius:9}).addTo(map).bindPopup('Twoja lokalizacja').openPopup();
    },()=>toast('Nie udało się pobrać lokalizacji'));
  };

  const originalRender=window.render;
  window.render=function(){
    originalRender();
    if(route==='map') setTimeout(initMap,50);
  };
})();

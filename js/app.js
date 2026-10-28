/* =========================================================
   PIZZI · Lógica de la app
   Necesita (en este orden): i18n.js, data.js, legal.js
   ========================================================= */
"use strict";

/* ---------- Idioma ---------- */
let LANG="es";
try{const g=localStorage.getItem("pizzi-lang");if(LANGS.includes(g))LANG=g;}catch(e){}
const LI=()=>LANGS.indexOf(LANG);
const t=(k,v)=>{const a=I[k];let s=a?(a[LI()]??a[0]):k;if(v)for(const x in v)s=s.split("{"+x+"}").join(v[x]);return s;};
const desc=it=>{const a=DESC[it.n];return a?a[LI()]:(LANG==="es"?it.es:it.en)};
const nm=n=>{const a=NOM[n];return a?a[LI()]:n};
const alg=a=>{const x=ALG[a];return x?x[LI()]:a};
const cap=s=>s.charAt(0).toUpperCase()+s.slice(1);
let DIAS=DIAS_L[LANG];
function withES(fn){const p=LANG;LANG="es";DIAS=DIAS_L.es;try{return fn()}finally{LANG=p;DIAS=DIAS_L[p]}}

/* ---------- Utilidades ---------- */
const $=id=>document.getElementById(id);
const esc=s=>String(s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const eur=v=>(LANG==="en"?v.toFixed(2):v.toFixed(2).replace(".",","))+" €";
const min=h=>{const[a,b]=h.split(":").map(Number);return a*60+b};
const hhmm=m=>{m=((m%1440)+1440)%1440;return String(Math.floor(m/60)).padStart(2,"0")+":"+String(m%60).padStart(2,"0")};
const ICO={
  mas:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>',
  pin:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 21s7-6.2 7-12a7 7 0 1 0-14 0c0 5.8 7 12 7 12z"/><circle cx="12" cy="9" r="2.5"/></svg>',
  tel:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2z"/></svg>',
  ok:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>',
  bolsa:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M5 8h14l-1.2 11.1a2 2 0 0 1-2 1.9H8.2a2 2 0 0 1-2-1.9z"/><path d="M9 8V6a3 3 0 0 1 6 0v2"/></svg>'
};
const IMG="assets/img/";
function foto(it,small=true){
  return `<img src="${IMG}${it.img}${small?"-s":""}.webp" alt="${esc(cap(nm(it.n).toLowerCase()))}"${it.t==="bebida"?' class="beb"':""} loading="lazy" decoding="async">`;
}
/* Tarjeta de pizza con el estilo de la carta impresa: media pizza sobre la etiqueta rosa */
/* Precio como en la carta impresa: pizzas "6,90€", bebidas "2,5€" */
const eurCarta=(v,corto)=>{const s=corto?String(+v.toFixed(2)):v.toFixed(2);return (LANG==="en"?s:s.replace(".",","))+"€";};
function pizzaCarta(it){
  const n=nm(it.n);
  return `<div class="pz" role="button" tabindex="0" data-prod="${it.i}" data-pi="${it.i}" aria-label="${esc(n)}, ${eur(it.p)}">
    <div class="pz-img"><img src="${IMG}${it.img}-m.webp" alt="${esc(cap(n.toLowerCase()))}" loading="lazy" decoding="async" width="520" height="278"></div>
    <div class="pz-pill"><h3 class="${n.length>11?"largo":""}">${esc(n)}</h3><span class="pz-precio">${eurCarta(it.p)}</span></div>
    <p>${esc(desc(it))}</p>
    ${it.badge?`<span class="tag">${t(it.badge==="top"?"tag_top":"tag_fresh")}</span>`:""}
    <button type="button" class="mas" data-add="${it.i}" aria-label="${esc(t("quick_add",{n}))}">${ICO.mas}</button>
  </div>`;
}
/* Fila de bebida con puntos, como en la carta */
function bebidaCarta(it){
  const n=nm(it.n);
  return `<li class="bb" data-pi="${it.i}"><button type="button" class="bb-t" data-prod="${it.i}"><span class="bn">${esc(n)}</span><span class="pts" aria-hidden="true"></span><span class="bp">${eurCarta(it.p,true)}</span></button>
    <button type="button" class="mas" data-add="${it.i}" aria-label="${esc(t("quick_add",{n}))}">${ICO.mas}</button></li>`;
}
const fotoLocal=l=>IMG+(FOTO_LOCAL[l.id]||"l-mercado")+".webp";
const porNombre=n=>P.find(x=>x.n===n);

/* ---------- Hora de Madrid y horarios ---------- */
function madrid(){return Object.fromEntries(new Intl.DateTimeFormat("en-GB",{timeZone:"Europe/Madrid",year:"numeric",month:"2-digit",day:"2-digit",hour:"2-digit",minute:"2-digit",hourCycle:"h23"}).formatToParts(new Date()).map(x=>[x.type,x.value]));}
const ahora=()=>{const p=madrid();return Number(p.hour)*60+Number(p.minute)};
const hoyIdx=()=>{const p=madrid();return (new Date(Date.UTC(+p.year,+p.month-1,+p.day)).getUTCDay()+6)%7};
const turnos=(l,d)=>l.h[((d%7)+7)%7].map(([a,c])=>[min(a),min(c)]);
/* ¿Está abierto ahora? (incluye turnos que pasan de medianoche del día anterior) */
function abierto(l){const n=ahora(),d=hoyIdx();
  return turnos(l,d).some(([a,c])=>n>=a&&n<c)||turnos(l,d-1).some(([a,c])=>c>1440&&n+1440<c);}
/* Próxima apertura: {off: días desde hoy, m: minuto} */
function proxima(l){const n=ahora(),d=hoyIdx();
  for(let o=0;o<8;o++){for(const [a] of turnos(l,d+o)){if(o>0||a>n)return{off:o,m:a};}}return null;}
function cierre(l){const n=ahora(),d=hoyIdx();
  const t0=[...turnos(l,d),...turnos(l,d-1).map(([a,c])=>[a-1440,c-1440])].find(([a,c])=>n>=a&&n<c);return t0?t0[1]:null;}
const nombreDia=o=>o===0?t("today").toLowerCase():o===1?t("tomorrow").toLowerCase():t("daypre")+DIAS[(hoyIdx()+o)%7];
const fmtTurnos=ts=>ts.length?ts.map(([a,c])=>hhmm(a)+"–"+hhmm(c)).join(" "+t("and")+" "):t("closed");
function hrTexto(l){
  if(abierto(l))return t("closes_at",{h:hhmm(cierre(l))});
  const p=proxima(l);return p?(p.off===0?t("opens_today",{h:hhmm(p.m)}):t("opens_at",{d:nombreDia(p.off),h:hhmm(p.m)})):"";
}
const estado=(l,cls="")=>abierto(l)?`<span class="st ab ${cls}">${t("open_now")}</span>`:`<span class="st ce ${cls}">${t("closed_now")}</span>`;

/* Franjas de recogida cada 15 min dentro del horario */
function slots(l){
  if(!l)return [];
  const n=ahora(),d=hoyIdx(),out=[];
  const add=(off,a,c,desde)=>{for(let m=Math.max(a+15,Math.ceil(desde/15)*15);m<=c-10;m+=15)
    out.push({v:off+"|"+m,off,m,t:(off===0?t("today")+" ":off===1?t("tomorrow")+" ":cap(DIAS[(d+off)%7])+" ")+hhmm(m)});};
  if(abierto(l))out.push({v:"asap",off:0,m:n+15,t:t("asap",{h:hhmm(n+15)})});
  turnos(l,d-1).forEach(([a,c])=>{if(c>1440&&n+1440<c)add(0,n,c-1440,n+20);});
  turnos(l,d).forEach(([a,c])=>{if(c>n+25)add(0,a,c,n+20);});
  if(out.filter(x=>x.v!=="asap").length<3){const p=proxima(l);if(p&&p.off>0)turnos(l,d+p.off).forEach(([a,c])=>add(p.off,a,c,a));}
  return out;
}
/* Texto corto de la hora elegida */
function horaCorta(l,v){
  if(!l)return t("choose_time");
  const s=slots(l).find(x=>x.v===v);
  if(!s)return t("choose_time");
  if(s.v==="asap")return t("asap_s")+" · ~"+hhmm(s.m);
  return (s.off===0?t("today"):s.off===1?t("tomorrow"):cap(DIAS[(hoyIdx()+s.off)%7]))+", "+hhmm(s.m);
}

/* ---------- Estado ---------- */
const S={local:null,hora:null,carro:[],pedido:null,perfil:{}};
try{const g=JSON.parse(localStorage.getItem("pizzi-carro-v2")||"[]");if(Array.isArray(g))S.carro=g.filter(c=>c&&porNombre(c.n)&&c.q>0).map(c=>{const it=porNombre(c.n);return{k:c.k,i:it.i,n:it.n,q:c.q,u:it.p,nota:c.nota||""};});}catch(e){}
try{S.perfil=JSON.parse(localStorage.getItem("pizzi-perfil")||"{}")||{};}catch(e){S.perfil={};}
{const i=LOCALES.findIndex(l=>l.id===S.perfil.local);if(i>=0)S.local=i;}
const guardar=(k,v)=>{try{localStorage.setItem(k,JSON.stringify(v));}catch(e){}};
const guardarPerfil=()=>guardar("pizzi-perfil",S.perfil);
const localSel=()=>S.local===null?null:LOCALES[S.local];

/* Si la hora elegida ya no es válida, propone la primera disponible */
function asegurarHora(){
  const l=localSel();if(!l){S.hora=null;return;}
  const s=slots(l);if(!s.some(x=>x.v===S.hora))S.hora=s.length?s[0].v:null;
}
function elegirLocal(i){
  S.local=i;S.perfil.local=LOCALES[i].id;guardarPerfil();asegurarHora();
}

/* ---------- Carrito ---------- */
const total=()=>S.carro.reduce((a,c)=>a+c.u*c.q,0);
const nItems=()=>S.carro.reduce((a,c)=>a+c.q,0);
function sumar(i,q,nota){
  const it=P[i];nota=(nota||"").trim();
  const k=it.n+"|"+nota,ya=S.carro.find(c=>c.k===k);
  if(ya)ya.q+=q;else S.carro.push({k,i,n:it.n,q,u:it.p,nota});
}
function addCarro(i,q=1,nota=""){sumar(i,q,nota);actCarro(true);toast(t("added"));}
function cambiarQ(k,d){
  const c=S.carro.find(x=>x.k===k);if(!c)return;
  c.q+=d;if(c.q<=0)S.carro=S.carro.filter(x=>x!==c);
  actCarro();
}
function actCarro(bump){
  guardar("pizzi-carro-v2",S.carro);
  const n=nItems(),tot=eur(total());
  $("tabN").hidden=!n;$("tabN").textContent=n;
  $("carroDN").textContent=n;$("carroDT").textContent=n?tot:"";
  $("mbN").textContent=n;$("mbT").textContent=tot;
  if(bump){const b=document.querySelector(".mb-btn");b.classList.remove("bump");void b.offsetWidth;b.classList.add("bump");}
  actMiniBarra();
  pintarLateral();
  marcarEnCarro();
  if(VISTA==="pedido"&&location.hash==="#pedido"){if(!S.carro.length){location.replace("#carta");return;}pintarPedido();}
}
function actMiniBarra(){$("miniBarra").hidden=!(nItems()&&(VISTA==="inicio"||VISTA==="carta"));}
function marcarEnCarro(){
  document.querySelectorAll("#cartaCuerpo [data-pi]").forEach(el=>{
    const q=S.carro.filter(c=>c.i===+el.dataset.pi).reduce((a,c)=>a+c.q,0);
    let b=el.querySelector(".en");
    if(q){if(!b){b=document.createElement("span");b.className="en";el.appendChild(b);}b.textContent=q+"×";}
    else if(b)b.remove();
  });
}
function lineaHTML(c){
  const it=P[c.i];
  return `<div class="linea"><div class="mini">${foto(it)}</div>
    <div class="t"><b>${esc(nm(c.n))}</b>${c.nota?`<small>“${esc(c.nota)}”</small>`:""}<span class="pl">${eur(c.u*c.q)}</span></div>
    <div class="qty"><button type="button" data-q="-1" data-k="${esc(c.k)}" aria-label="${t("remove_one")}">${c.q===1?'<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M5 7h14M10 11v6M14 11v6M6 7l1 12a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-12M9 7V4h6v3"/></svg>':"−"}</button><b>${c.q}</b><button type="button" data-q="1" data-k="${esc(c.k)}" aria-label="${t("add_one")}">+</button></div></div>`;
}
document.addEventListener("click",e=>{const b=e.target.closest("[data-q]");if(b){e.preventDefault();cambiarQ(b.dataset.k,+b.dataset.q);}});

/* ---------- Toast ---------- */
let toastT;
function toast(msg){const el=$("toast");el.innerHTML=ICO.ok+"<span>"+esc(msg)+"</span>";el.classList.add("on");clearTimeout(toastT);toastT=setTimeout(()=>el.classList.remove("on"),1800);}

/* ---------- Hojas ---------- */
const velo=$("velo");let hoja=null,focoPrevio=null;
/* Bloquea el desplazamiento de la página por detrás de la hoja. Se hace en <html> (iOS 16+ lo respeta)
   para no mover la página: así la cabecera fija y la posición se mantienen al cerrar. */
const bloquearFondo=si=>{document.documentElement.classList.toggle("bloqueado",si);};
function abrirHoja(id){
  if(hoja)cerrarHoja(true);
  focoPrevio=document.activeElement;hoja=$(id);hoja.hidden=false;
  requestAnimationFrame(()=>{hoja.classList.add("on");velo.classList.add("on");});
  bloquearFondo(true);
  setTimeout(()=>{const f=hoja.querySelector(".x");if(f)f.focus({preventScroll:true});},60);
}
function cerrarHoja(inmediato){
  if(!hoja)return;const h=hoja;hoja=null;
  h.classList.remove("on");velo.classList.remove("on");bloquearFondo(false);
  if(inmediato)h.hidden=true;else setTimeout(()=>{if(!h.classList.contains("on"))h.hidden=true;},350);
  if(focoPrevio&&focoPrevio.focus)focoPrevio.focus({preventScroll:true});
}
velo.onclick=()=>cerrarHoja();
document.querySelectorAll("[data-cerrar]").forEach(b=>b.onclick=()=>cerrarHoja());
document.addEventListener("keydown",e=>{if(e.key==="Escape"){if(hoja)cerrarHoja();cerrarLang();}});

/* ---------- Hoja de producto ---------- */
let prod=null,cant=1;
function abrirProd(i){
  prod=P[i];cant=1;const it=prod,a=ALERG[it.n]||[];
  $("pCuerpo").innerHTML=`<div class="pf">${foto(it,false)}</div>
    <div class="pd">
      <div class="fila"><h2 id="pNombre">${esc(nm(it.n))}</h2><span class="precio">${eur(it.p)}</span></div>
      <p class="desc">${esc(desc(it))}</p>
      <div class="chips-i">${it.t==="pizza"?`<span>${t("size31")}</span>`:""}${a.length?`<span class="al">${t("allergens")}: ${a.map(alg).join(", ")}</span>`:""}</div>
      ${it.t==="pizza"?`<div class="grupo"><label for="pNota">${t("kitchen_notes")}</label><small>${t("optional")}</small></div><textarea id="pNota" rows="2" placeholder="${esc(t("note_ph"))}"></textarea>`:""}
    </div>`;
  actPieProd();abrirHoja("hProd");
  $("pCuerpo").scrollTop=0;
}
function actPieProd(){$("pCant").textContent=cant;$("pTot").textContent=eur(prod.p*cant);$("pMenos").disabled=cant<=1;}
$("pMenos").onclick=()=>{if(cant>1){cant--;actPieProd();}};
$("pMas").onclick=()=>{cant++;actPieProd();};
$("pAdd").onclick=()=>{const n=$("pNota");addCarro(prod.i,cant,n?n.value:"");cerrarHoja();};

/* Delegación: tarjeta abre ficha, "+" añade directo */
document.addEventListener("click",e=>{
  const m=e.target.closest("[data-add]");
  if(m){e.preventDefault();e.stopPropagation();addCarro(+m.dataset.add);m.classList.remove("pop");void m.offsetWidth;m.classList.add("pop");return;}
  const p=e.target.closest("[data-prod]");
  if(p){e.preventDefault();abrirProd(+p.dataset.prod);}
});
document.addEventListener("keydown",e=>{
  if((e.key==="Enter"||e.key===" ")&&e.target.matches("[data-prod]")){e.preventDefault();abrirProd(+e.target.dataset.prod);}
});

/* ---------- Hoja de local y hora ---------- */
let hlLocal=null,hlHora=null,hlDespues=null;
function abrirLocal(foco,despues){
  hlLocal=S.local;hlHora=S.hora;hlDespues=despues||null;
  pintarHojaLocal();abrirHoja("hLocal");
  const sc=$("hLocal").querySelector(".scroll");sc.scrollTop=0;
  if(foco==="hora"&&hlLocal!==null)setTimeout(()=>verHoras("start"),300);
}
function pintarHojaLocal(){
  const orden=ORDEN.slice();
  $("hlLocales").innerHTML=orden.map(i=>{const l=LOCALES[i];
    return `<button type="button" class="hl" role="radio" aria-checked="${i===hlLocal}" data-hl="${i}">
      <img src="${fotoLocal(l)}" alt="" loading="lazy">
      <span class="t"><b>${esc(l.n)}</b><span>${esc(l.d.split(",").slice(0,2).join(","))}</span>${estado(l,"st-in")}${DIST[i]!=null?`<span class="ext">${fmtKm(DIST[i])}</span>`:""}</span>
      <span class="rd" aria-hidden="true"></span></button>`;}).join("");
  const box=$("hlHoraBox");
  if(hlLocal===null){box.hidden=true;$("hlOk").disabled=true;return;}
  box.hidden=false;$("hlOk").disabled=false;
  const l=LOCALES[hlLocal],s=slots(l);
  if(l.pedidoUrl){$("hlHoras").innerHTML=`<p class="sin">${t("online_note",{n:esc(l.n)})}</p>`;return;}
  if(!s.some(x=>x.v===hlHora))hlHora=s.length?s[0].v:null;
  let dia=null,h="";
  s.forEach(x=>{
    const d=x.v==="asap"?-1:x.off;
    if(x.v!=="asap"&&d!==dia){dia=d;h+=`<p class="dia">${x.off===0?t("today"):x.off===1?t("tomorrow"):cap(DIAS[(hoyIdx()+x.off)%7])}</p>`;}
    h+=`<button type="button" role="radio" aria-checked="${x.v===hlHora}" data-hh="${x.v}">${x.v==="asap"?esc(t("asap_s")):hhmm(x.m)}</button>`;
  });
  $("hlHoras").innerHTML=h||`<p class="sin">${t("closed")}</p>`;
}
/* Lleva la lista de horas a la vista desplazando solo el contenido de la hoja */
function verHoras(modo){
  const sc=$("hLocal").querySelector(".scroll"),box=$("hlHoraBox");if(box.hidden)return;
  const top=box.offsetTop-12,vis=sc.scrollTop+sc.clientHeight;
  if(modo==="start"||top+80>vis)sc.scrollTo({top:modo==="start"?top:Math.min(top,box.offsetTop+box.offsetHeight-sc.clientHeight),behavior:"smooth"});
}
$("hlLocales").onclick=e=>{const b=e.target.closest("[data-hl]");if(!b)return;hlLocal=+b.dataset.hl;pintarHojaLocal();setTimeout(()=>verHoras(),50);};
$("hlHoras").onclick=e=>{const b=e.target.closest("[data-hh]");if(!b)return;hlHora=b.dataset.hh;
  $("hlHoras").querySelectorAll("[data-hh]").forEach(x=>x.setAttribute("aria-checked",x===b));};
$("hlOk").onclick=()=>{
  if(hlLocal===null)return;
  elegirLocal(hlLocal);if(slots(LOCALES[hlLocal]).some(x=>x.v===hlHora))S.hora=hlHora;
  const d=hlDespues;cerrarHoja();refrescar();
  if(d)location.hash=d;
};
document.addEventListener("click",e=>{const b=e.target.closest("[data-abrir-local]");if(b){e.preventDefault();abrirLocal(b.dataset.abrirLocal);}});
$("chipLocal").onclick=()=>abrirLocal();

/* ---------- Geolocalización ----------
   Pide la ubicación precisa (GPS), escucha unos segundos y se queda con la lectura más exacta.
   Si la precisión es mala (ubicación por IP o wifi), no elige local automáticamente y lo avisa. */
let ORDEN=LOCALES.map((_,i)=>i),DIST={},PREC=null,YO=null;
const km=(a,b,c,d)=>{const r=x=>x*Math.PI/180,h=Math.sin(r(c-a)/2)**2+Math.cos(r(a))*Math.cos(r(c))*Math.sin(r(d-b)/2)**2;return 12742*Math.asin(Math.sqrt(h))};
const fmtKm=k=>k<1?Math.max(50,Math.round(k*20)*50)+" m":(LANG==="en"?k.toFixed(1):k.toFixed(1).replace(".",","))+" km";
const PREC_OK=40,PREC_MALA=1000,ESPERA=8000;
function ubicar(fin){
  if(!navigator.geolocation){fin("none");return;}
  let mejor=null,hecho=false,wid=null,to=null;
  const acabar=motivo=>{if(hecho)return;hecho=true;clearTimeout(to);if(wid!==null)navigator.geolocation.clearWatch(wid);
    if(!mejor){fin(motivo||"err");return;}
    const {latitude:a,longitude:o,accuracy:pr}=mejor.coords;PREC=pr;YO={lat:a,lng:o};
    DIST={};LOCALES.forEach((l,i)=>DIST[i]=km(a,o,l.lat,l.lng));
    ORDEN=LOCALES.map((_,i)=>i).sort((x,y)=>DIST[x]-DIST[y]);
    fin(pr>PREC_MALA?"aprox":"ok");};
  wid=navigator.geolocation.watchPosition(p=>{if(!mejor||p.coords.accuracy<mejor.coords.accuracy)mejor=p;if(p.coords.accuracy<=PREC_OK)acabar();},
    e=>{if(e.code===1||!mejor)acabar(e.code===1?"denied":"err");},{enableHighAccuracy:true,maximumAge:0,timeout:ESPERA+2000});
  to=setTimeout(()=>acabar("err"),ESPERA);
}
/* Texto del resultado; si es fiable y no hay local elegido, elige el más cercano */
function textoUbicacion(r){
  if(r==="none")return t("near_none");
  if(r==="denied")return t("near_denied");
  if(r==="err")return t("near_err");
  const n=ORDEN[0];
  if(r==="aprox")return t("near_imprecise",{a:fmtKm(PREC/1000)});
  if(S.local===null)elegirLocal(n);
  return t("near_msg",{n:esc(LOCALES[n].n),d:fmtKm(DIST[n])});
}
function botonUbicar(b,msg,despues){
  b.disabled=true;msg.textContent=t("near_search");
  ubicar(r=>{b.disabled=false;msg.innerHTML=textoUbicacion(r);despues&&despues(r);});
}
$("btnCerca").onclick=()=>botonUbicar($("btnCerca"),$("cercaMsg"),()=>refrescar());
$("hlCerca").onclick=()=>botonUbicar($("hlCerca"),$("hlCercaMsg"),r=>{if(r==="ok")hlLocal=ORDEN[0];pintarHojaLocal();});

/* ---------- Cabecera: local + hora ---------- */
function pintarLocalSel(){
  asegurarHora();
  const l=localSel();
  $("chipLocalK").textContent=t("you_pick");
  $("chipLocalV").textContent=l?l.n+" · "+horaCorta(l,S.hora):t("choose_store");
  // Inicio
  $("homeLocal").textContent=l?"Pizzi "+l.n:t("choose_store");
  $("homeLocal").classList.toggle("vacio",!l);
  $("homeLocalE").innerHTML=l?(abierto(l)?`<span class="ab">● ${t("open_now")}</span> · ${esc(hrTexto(l))}`:esc(hrTexto(l))):"";
  $("homeLocalE").hidden=!l;
  $("homeHora").textContent=l?(l.pedidoUrl?t("order_pay_online"):horaCorta(l,S.hora)):t("first_store");
  // Carta
  $("cartaLocal").textContent=l?"Pizzi "+l.n:t("choose_store");
  $("cartaHora").textContent=l&&!l.pedidoUrl?horaCorta(l,S.hora):"";
  $("cartaHora").hidden=!l||!!l.pedidoUrl;
}

/* ---------- INICIO ---------- */
/* Repinta conservando el desplazamiento horizontal de los carruseles */
function conCarriles(fn){const ids=["topList","homeLocales"],x=ids.map(i=>$(i).scrollLeft);fn();ids.forEach((i,k)=>{$(i).scrollLeft=x[k];});}
function pintarInicio(){conCarriles(pintarInicioYa);}
function pintarInicioYa(){
  const h=ahora();$("saludo").textContent=t(h<720&&h>=360?"hi_m":h<1230&&h>=720?"hi_a":"hi_n");
  // Destacadas
  $("topList").innerHTML=TOP.map(porNombre).filter(Boolean).map(pizzaCarta).join("");
  // Repetir último pedido
  const ult=(S.perfil.ultimo||[]).filter(x=>porNombre(x.n));
  const r=$("repetir");
  if(ult.length&&!S.carro.length){
    r.hidden=false;
    r.innerHTML=`<div class="mini">${ult.slice(0,3).map(x=>foto(porNombre(x.n))).join("")}</div>
      <div class="tx"><b>${t("repeat_h")}</b><span>${ult.map(x=>x.q+"× "+esc(nm(x.n))).join(", ")}</span></div>
      <button type="button" class="btn btn-vino" id="btnRepetir">${t("repeat_btn")}</button>`;
    $("btnRepetir").onclick=()=>{ult.forEach(x=>sumar(porNombre(x.n).i,x.q,x.nota));actCarro(true);location.hash="pedido";};
  }else r.hidden=true;
  // Locales
  const nAb=LOCALES.filter(abierto).length;
  $("abiertosN").textContent=nAb?t("open_n",{n:nAb}):"";
  $("homeLocales").innerHTML=ORDEN.map(i=>tarjetaLocal(i,false)).join("");
}
function tarjetaLocal(i,completa){
  const l=LOCALES[i],d=hoyIdx();
  return `<article class="lt">
    <div class="ph"><img src="${fotoLocal(l)}" alt="${esc(t("facade"))} · ${esc(l.n)}" loading="lazy">${estado(l)}</div>
    <div class="bd">
      ${DIST[i]!=null?`<span class="dist">${t("dist",{d:fmtKm(DIST[i])})}</span>`:""}
      <h3>${esc(l.n)}</h3>
      <span class="hr">${esc(hrTexto(l))}</span>
      <span class="dir">${esc(l.d)}</span>
      ${completa?`<div class="dato">${ICO.tel}<a href="tel:${l.tel.replace(/\s/g,"")}">${esc(l.tel)}</a></div>
      <details class="semana"><summary>${t("week_sched")}</summary><ul>${DIAS.map((dn,k)=>`<li class="${k===d?"hoy":""}"><span>${cap(dn)}</span><span>${fmtTurnos(turnos(l,k))}</span></li>`).join("")}</ul></details>`:""}
      <div class="row">
        <a class="btn btn-linea" href="${l.maps}" target="_blank" rel="noopener">${t("how_get")}</a>
        ${l.pedidoUrl?`<a class="btn btn-vino" href="${l.pedidoUrl}" target="_blank" rel="noopener">${t("order_pay_online")}</a>`
          :`<button type="button" class="btn btn-vino" data-pedir="${i}">${abierto(l)?t("order_here"):t("schedule")}</button>`}
      </div>
    </div></article>`;
}
document.addEventListener("click",e=>{const b=e.target.closest("[data-pedir]");if(b){elegirLocal(+b.dataset.pedir);refrescarCab();location.hash="carta";}});

/* ---------- CARTA ---------- */
function pintarCarta(){
  $("cats").innerHTML=CATS.map(([id,k],j)=>`<a href="#cat-${id}" data-cat="${id}" class="${j===0?"on":""}">${t(k)}</a>`).join("");
  $("cartaCuerpo").innerHTML=CATS.map(([id,k,tipo])=>`
    <section class="cat-sec" id="cat-${id}" data-sec="${id}">
      <div class="cat-cab"><img src="assets/img/logo-rosa.png" alt="PIZZI" width="1231" height="673"><h2 class="deco">${tipo==="pizza"?t("cat_pizzas_31"):t(k)}</h2></div>
      ${tipo==="pizza"?`<div class="carta-pz">${P.filter(x=>x.t===tipo).map(pizzaCarta).join("")}</div>`
        :`<ul class="bebidas">${P.filter(x=>x.t===tipo).map(bebidaCarta).join("")}</ul>`}
    </section>`).join("");
  marcarEnCarro();
  pintarAvisoCarta();
}
function pintarAvisoCarta(){
  const l=localSel(),av=$("avisoCarta");
  if(l&&l.pedidoUrl){av.hidden=false;av.innerHTML=`<p>${t("online_note",{n:esc(l.n)})}</p><a class="btn btn-blanco" href="${l.pedidoUrl}" target="_blank" rel="noopener">${t("go_pay")}</a>`;}
  else if(l&&!abierto(l)){const p=proxima(l);av.hidden=false;av.innerHTML=`<p>${t("closed_sched",{n:esc(l.n),o:esc(p?(p.off===0?t("opens_today",{h:hhmm(p.m)}):t("opens_at",{d:nombreDia(p.off),h:hhmm(p.m)})):"")})}</p>`;}
  else av.hidden=true;
}
/* Pestañas de categorías: scroll suave y resaltado según la sección visible */
const altoFijo=()=>$("hdr").offsetHeight+document.querySelector(".carta-cab").offsetHeight;
function irACat(id,suave){const s=$("cat-"+id);if(s)window.scrollTo({top:s.getBoundingClientRect().top+scrollY-altoFijo()+4,behavior:suave?"smooth":"auto"});}
$("cats").addEventListener("click",e=>{const a=e.target.closest("[data-cat]");if(!a)return;e.preventDefault();irACat(a.dataset.cat,true);});
function centrarCat(a){const c=$("cats");c.scrollTo({left:a.offsetLeft-(c.clientWidth-a.offsetWidth)/2,behavior:"smooth"});}
let spyRaf=0;
window.addEventListener("scroll",()=>{if(VISTA!=="carta"||spyRaf)return;spyRaf=requestAnimationFrame(()=>{spyRaf=0;
  const lim=altoFijo()+40;let act=CATS[0][0];
  document.querySelectorAll("[data-sec]").forEach(s=>{if(s.getBoundingClientRect().top<=lim)act=s.dataset.sec;});
  document.querySelectorAll("#cats a").forEach(a=>{const on=a.dataset.cat===act;if(on!==a.classList.contains("on")){a.classList.toggle("on",on);if(on)centrarCat(a);}});
});},{passive:true});

/* Carrito lateral (escritorio) */
function pintarLateral(){
  const el=$("lateral");if(!el)return;const l=localSel();
  el.innerHTML=`<div class="lat-cab"><h2 class="deco">${t("your_order")}</h2>
    <button type="button" data-abrir-local>${ICO.pin}<span><small>${t("you_pick")}</small><b>${l?esc(l.n)+(l.pedidoUrl?"":" · "+esc(horaCorta(l,S.hora))):t("choose_store")}</b></span><i>${t("change")}</i></button></div>
    ${S.carro.length?`<div class="lat-cuerpo">${S.carro.map(lineaHTML).join("")}</div>
      <div class="lat-pie"><div class="fila-tot"><span>${t("total")}</span><b>${eur(total())}</b></div><a class="btn btn-vino full btn-tot" href="#pedido"><span>${t("go_checkout")}</span><span>${eur(total())}</span></a></div>`
    :`<div class="vacio-c">${ICO.bolsa}<b>${t("cart_empty_h")}</b><p>${t("cart_empty_p")}</p></div>`}`;
}

/* ---------- LOCALES ---------- */
function pintarLocales(){$("listaLocales").innerHTML=ORDEN.map(i=>tarjetaLocal(i,true)).join("");}

/* ---------- PEDIDO ---------- */
function pintarPedido(){
  asegurarHora();
  const l=localSel();
  $("coLineas").innerHTML=S.carro.map(lineaHTML).join("");
  // Bebidas sugeridas que aún no están en el pedido
  const beb=P.filter(x=>x.t==="bebida"&&!S.carro.some(c=>c.i===x.i));
  $("upsell").hidden=!beb.length||!S.carro.some(c=>P[c.i].t==="pizza");
  $("upsellList").innerHTML=beb.map(it=>`<button type="button" class="up" data-add="${it.i}" aria-label="${esc(t("quick_add",{n:nm(it.n)}))}">${foto(it)}<b>${esc(nm(it.n))}</b><span>${eur(it.p)}</span><span class="mas" aria-hidden="true">${ICO.mas}</span></button>`).join("");
  $("coLocal").textContent=l?"Pizzi "+l.n:t("pick_store");
  $("coLocal").classList.toggle("vacio",!l);
  $("coLocalE").textContent=l?l.d:"";$("coLocalE").hidden=!l;
  $("coHora").textContent=l?horaCorta(l,S.hora):t("first_store");
  $("coTot").textContent=eur(total());$("confTot").textContent=eur(total());
  // Local con tienda online propia
  const online=!!(l&&l.pedidoUrl);
  $("avisoOnline").hidden=!online;$("bloqueAcepto").hidden=online;$("ctaConfirmar").hidden=online;$("waNota").hidden=online;$("cajaDatos").hidden=online;
  if(online){$("irOnline").href=l.pedidoUrl;$("avisoTxt").innerHTML=t("online_note",{n:esc(l.n)});}
  $("privFirst").textContent=t("priv_first",{r:EMPRESA.razon});
}
// Datos recordados
if(S.perfil.nom)$("cNombre").value=S.perfil.nom;
if(S.perfil.tel)$("cTel").value=S.perfil.tel;
if(S.perfil.rec===false)$("cRecordar").checked=false;

function errorEn(id,msg){const e=$(id);e.textContent=msg;e.hidden=false;e.scrollIntoView({behavior:"smooth",block:"center"});}
$("confirmar").onclick=()=>{
  $("eDatos").hidden=$("eHora").hidden=true;
  const l=localSel();
  if(!l){abrirLocal(null);return;}
  asegurarHora();
  if(!S.hora){errorEn("eHora",t("err_time"));return;}
  const nom=$("cNombre").value.trim(),tel=$("cTel").value.trim();
  if(!nom||tel.replace(/\D/g,"").length<9){errorEn("eDatos",t("err_data"));(!nom?$("cNombre"):$("cTel")).focus({preventScroll:true});return;}
  if(!$("cAcepto").checked){errorEn("eDatos",t("err_accept"));return;}
  const horaES=withES(()=>{const s=slots(l).find(x=>x.v===S.hora);return s?s.t:"";});
  S.pedido={horaVal:S.hora,t0:ahora(),num:"PZ-"+Math.floor(1000+Math.random()*9000),nom,tel,local:l,horaES,items:S.carro.map(c=>({...c})),total:total()};
  // Perfil: último pedido y, si se pide, nombre y teléfono
  const rec=$("cRecordar").checked;
  S.perfil.rec=rec;S.perfil.ultimo=S.carro.map(c=>({n:c.n,q:c.q,nota:c.nota}));
  if(rec){S.perfil.nom=nom;S.perfil.tel=tel;}else{delete S.perfil.nom;delete S.perfil.tel;}
  guardarPerfil();
  pintarHecho();
  window.open(S.pedido.wa,"_blank","noopener");
  location.hash="hecho";S.carro=[];actCarro();
};

/* ---------- CONFIRMACIÓN ---------- */
function horaCortaDe(o){if(o.horaVal==="asap")return hhmm(o.t0+15);const[of,m]=o.horaVal.split("|").map(Number);return (of===0?"":nombreDia(of)+", ")+hhmm(m);}
function pintarHecho(){
  const o=S.pedido;
  $("okSub").textContent=t("ok_sub",{n:o.nom,l:o.local.n});
  $("ticket").innerHTML=`<div class="damero" aria-hidden="true"></div>
    <div class="tk-cab"><img src="assets/img/logo-vino.png" alt="PIZZI"><p>${esc(o.local.n)} · ${esc(o.local.d)}</p></div>
    <div class="tk-datos"><div><small>${t("order_no")}</small><b>${o.num}</b></div><div><small>${t("pickup")}</small><b>${esc(horaCortaDe(o))}</b></div></div>
    <div class="tk-items">${o.items.map(c=>`<div class="it"><span>${c.q}× ${esc(nm(c.n))}${c.nota?`<small>“${esc(c.nota)}”</small>`:""}</span><span>${eur(c.u*c.q)}</span></div>`).join("")}</div>
    <div class="tk-tot"><span>${t("total")}</span><span>${eur(o.total)}</span></div>
    <span class="sello">${t("pay_stamp")}</span>`;
  $("okMaps").href=o.local.maps;
  $("okTel").href="tel:"+o.local.tel.replace(/\s/g,"");
  // Comanda para WhatsApp (siempre en español, para el local)
  const lineas=o.items.map(c=>`• ${c.q}× ${c.n}${c.nota?`\n   Nota: ${c.nota}`:""}  ${eur(c.u*c.q).replace(".",",")}`).join("\n");
  const comanda=`🔔 NUEVO PEDIDO ${o.num}\n\nCliente: ${o.nom}\nWhatsApp: ${o.tel}\nRecogida: ${o.horaES}\nLocal: ${o.local.n}\n\n${lineas}\n\nTOTAL: ${eur(o.total).replace(".",",")}\nPago: en el local`;
  const num=(o.local.whatsapp||CONFIG.whatsappDemo).replace(/\D/g,"");
  o.wa="https://wa.me/"+num+"?text="+encodeURIComponent(comanda);
  $("reenviar").href=o.wa;
  // Recordatorio .ics
  const p=madrid();let d=new Date(Date.UTC(+p.year,+p.month-1,+p.day)),m;
  if(o.horaVal==="asap")m=o.t0+15;else{const q=o.horaVal.split("|").map(Number);m=q[1];d=new Date(d.getTime()+q[0]*864e5);}
  if(m>=1440){m-=1440;d=new Date(d.getTime()+864e5);}
  const f=(dd,mm)=>dd.getUTCFullYear()+String(dd.getUTCMonth()+1).padStart(2,"0")+String(dd.getUTCDate()).padStart(2,"0")+"T"+String(Math.floor(mm/60)).padStart(2,"0")+String(mm%60).padStart(2,"0")+"00";
  const ics=["BEGIN:VCALENDAR","VERSION:2.0","PRODID:-//Pizzi//Pedidos//ES","BEGIN:VEVENT","UID:"+o.num+"@pizzi","DTSTAMP:"+new Date().toISOString().replace(/[-:]/g,"").split(".")[0]+"Z",
    "DTSTART;TZID=Europe/Madrid:"+f(d,m),"DTEND;TZID=Europe/Madrid:"+f(d,Math.min(m+15,1439)),"SUMMARY:"+t("ics_s")+" "+o.num,
    "LOCATION:Pizzi "+o.local.n+" - "+o.local.d.replace(/,/g,"\\,"),"DESCRIPTION:"+t("ics_d",{t:eur(o.total)}),"BEGIN:VALARM","TRIGGER:-PT10M","ACTION:DISPLAY","DESCRIPTION:"+t("ics_a"),"END:VALARM","END:VEVENT","END:VCALENDAR"].join("\r\n");
  const a=$("ics");a.href=URL.createObjectURL(new Blob([ics],{type:"text/calendar"}));a.download="pedido-pizzi-"+o.num+".ics";
}
$("nuevo").onclick=()=>{S.pedido=null;};

/* ---------- Router ---------- */
const VISTAS=["inicio","carta","locales","pedido","hecho","legal"];
const ALIAS={"":"inicio",menu:"carta"};
let VISTA=null;
function ir(){
  let v=location.hash.replace("#","");
  // Enlace directo a una categoría (#cat-pizzas): abre la carta si no está abierta
  let cat=null;
  if(v.startsWith("cat-")){cat=v.slice(4);if(VISTA==="carta"){irACat(cat,true);return;}v="carta";}
  v=ALIAS[v]!==undefined?ALIAS[v]:v;
  let pg=null;if(PAGINAS.includes(v)){pg=v;v="legal";}
  if(!VISTAS.includes(v))v="inicio";
  if(v==="pedido"&&!S.carro.length){location.replace("#carta");return;}
  if(v==="hecho"&&!S.pedido){location.replace("#inicio");return;}
  if(hoja)cerrarHoja(true);
  const cambia=v!==VISTA||v==="legal";
  if(VISTA&&cambia)POS[VISTA]=scrollY;
  VISTA=v;
  VISTAS.forEach(x=>$("v-"+x).hidden=x!==v);
  document.querySelectorAll("[data-tab]").forEach(a=>a.classList.toggle("on",a.dataset.tab===v));
  $("volver").hidden=!["pedido","hecho","legal"].includes(v);
  $("pie").hidden=!["inicio","locales","legal"].includes(v);
  refrescarCab();
  if(v==="inicio")pintarInicio();
  if(v==="carta")pintarCarta();
  if(v==="locales")pintarLocales();
  if(v==="pedido")pintarPedido();
  if(v==="legal")pintarLegal(pg);
  actMiniBarra();
  if(cat)requestAnimationFrame(()=>irACat(cat,false));
  else if(cambia)window.scrollTo(0,RECUERDA.includes(v)?(POS[v]||0):0);
}
/* Vistas que recuerdan su posición al volver (pestañas); el resto empieza arriba */
const RECUERDA=["inicio","carta","locales"],POS={};
/* Tocar la pestaña de la vista actual vuelve arriba, como en las apps */
document.querySelectorAll("[data-tab]").forEach(a=>a.addEventListener("click",e=>{if(a.dataset.tab===VISTA){e.preventDefault();window.scrollTo({top:0,behavior:"smooth"});}}));
window.addEventListener("hashchange",ir);
$("volver").onclick=()=>{
  if(VISTA==="legal"&&history.length>1){history.back();return;}
  location.hash={pedido:"carta",hecho:"inicio",legal:"inicio"}[VISTA]||"inicio";
};
function refrescarCab(){pintarLocalSel();pintarLateral();}
function refrescar(){refrescarCab();if(VISTA==="inicio")pintarInicio();if(VISTA==="carta")pintarCarta();if(VISTA==="locales")pintarLocales();if(VISTA==="pedido")pintarPedido();if(VISTA==="hecho"&&S.pedido)pintarHecho();if(VISTA==="legal"&&PAG)pintarLegal(PAG);}

/* "Empezar pedido" sin local: primero elige local y luego va a la carta */
$("empezar").onclick=e=>{if(S.local===null){e.preventDefault();abrirLocal(null,"carta");}};

/* ---------- Idioma ---------- */
const langBtn=$("langBtn"),langList=$("langList");
function cerrarLang(){langList.hidden=true;langBtn.setAttribute("aria-expanded","false");}
langBtn.onclick=e=>{e.stopPropagation();const o=langList.hidden;langList.hidden=!o;langBtn.setAttribute("aria-expanded",String(o));};
document.addEventListener("click",e=>{if(!e.target.closest("#lang"))cerrarLang();});
function aplicarIdioma(){
  document.documentElement.lang=LANG;DIAS=DIAS_L[LANG];
  document.title=t("title");
  document.querySelectorAll("[data-i]").forEach(el=>{el.textContent=t(el.dataset.i);});
  document.querySelectorAll("[data-ih]").forEach(el=>{el.innerHTML=t(el.dataset.ih);});
  document.querySelectorAll("[data-ia]").forEach(el=>{el.setAttribute("aria-label",t(el.dataset.ia));});
  document.querySelectorAll("[data-iph]").forEach(el=>{el.placeholder=t(el.dataset.iph);});
  $("langCode").textContent=LANG.toUpperCase();
  langList.innerHTML=LANGS.map(l=>`<li><button type="button" role="option" aria-selected="${l===LANG}" data-l="${l}"><span>${LNAME[l]}</span><span>${l.toUpperCase()}</span></button></li>`).join("");
}
langList.onclick=e=>{const b=e.target.closest("[data-l]");if(!b)return;LANG=b.dataset.l;try{localStorage.setItem("pizzi-lang",LANG);}catch(x){}cerrarLang();aplicarIdioma();refrescar();actCarro();};

/* ---------- Pie ---------- */
function pintarPie(){$("pieLocales").innerHTML=LOCALES.map(l=>`<li><a href="${l.maps}" target="_blank" rel="noopener">Pizzi ${esc(l.n)}</a></li>`).join("");}

/* ---------- Teclado en móvil ----------
   Con el teclado abierto, las barras fijas (pestañas, «Confirmar pedido») subirían y taparían el campo */
const esCampo=el=>el&&el.matches&&el.matches("input[type=text],input[type=tel],textarea");
document.addEventListener("focusin",e=>{if(esCampo(e.target))document.body.classList.add("escribiendo");});
document.addEventListener("focusout",e=>{if(esCampo(e.target))setTimeout(()=>{if(!esCampo(document.activeElement))document.body.classList.remove("escribiendo");},100);});

/* ---------- Arranque ---------- */
if(CONFIG.demo)$("demo").hidden=false;
asegurarHora();
aplicarIdioma();pintarPie();ir();actCarro();
/* Cada minuto actualiza solo lo que depende de la hora (abierto/cerrado, franjas), sin repintar la carta */
let firmaHora="";
const firma=()=>LOCALES.map(l=>abierto(l)+"|"+hrTexto(l)).join()+"|"+horaCorta(localSel(),S.hora)+"|"+t(ahora()<720&&ahora()>=360?"hi_m":ahora()<1230&&ahora()>=720?"hi_a":"hi_n");
setInterval(()=>{if(hoja)return;const f=firma();if(f===firmaHora)return;firmaHora=f;refrescarCab();
  if(VISTA==="inicio")pintarInicio();else if(VISTA==="carta")pintarAvisoCarta();else if(VISTA==="locales")pintarLocales();else if(VISTA==="pedido")pintarPedido();},60000);

/* =========================================================
   PIZZI · App móvil
   En pantallas de menos de 900 px el inicio se convierte en un flujo corto, como una app:
     1. «¡Hola! Es hora de Pizzi»: pide la ubicación y muestra el local más cercano.
        «Pedir aquí»  → tienda SkyTab del local (pedidoUrl). Sin SkyTab → carta de esta web.
        «A domicilio» → pestaña de reparto. «Ver carta» → pestaña de la carta.
     2. «Pide ahora», con tres pestañas:
        Ubicaciones    → locales del más cercano al más lejano (desplegables).
        Pedidos online → Uber Eats y Glovo en zona céntrica; fuera de ella, solo Uber Eats
                         del local más cercano que lo tenga (ver CONFIG.reparto en data.js).
        Carta          → la carta para consultar.
   En el ordenador no cambia nada. Necesita app.js (usa sus datos y utilidades).
   ========================================================= */
"use strict";

const MOVIL=matchMedia("(max-width:899px)");
const TABS=["ubicaciones","domicilio","lacarta"];
const PANT_APP=["","inicio","hola",...TABS];
/* estado: null (sin buscar) · buscando · ok · aprox · denied · err · none
   abierto: local desplegado en «Ubicaciones» (null = el elegido, -1 = ninguno)
   desdeHola: se llegó a «Pide ahora» desde el inicio, así que «volver» es ir atrás en el historial */
const APP={estado:null,manual:false,abierto:null,desdeHola:false,pant:null,cartaLang:null};
const PLAT={glovo:"Glovo",uber:"Uber Eats"};

const hashApp=()=>location.hash.replace("#","");
const enApp=()=>MOVIL.matches&&PANT_APP.includes(hashApp());
const pantallaApp=()=>TABS.includes(hashApp())?hashApp():"hola";
const conPos=()=>!!YO&&(APP.estado==="ok"||APP.estado==="aprox");

/* ---------- Ubicación ---------- */
function buscar(){
  APP.estado="buscando";APP.manual=false;pintarApp();
  ubicar(r=>{APP.estado=r;if((r==="ok"||r==="aprox")&&!APP.manual){elegirLocal(ORDEN[0]);APP.abierto=null;}refrescar();pintarApp();});
}

/* ---------- Reparto ----------
   Devuelve las apps disponibles para el local elegido y la ubicación del cliente:
   { glovo:{u,i}|null, uber:{u,i}|null, centrica } */
function reparto(){
  const R=CONFIG.reparto,pos=conPos();
  const centrica=!pos||km(YO.lat,YO.lng,R.centro.lat,R.centro.lng)<=R.radioCentro;
  // Con ubicación se recorren los locales del más cercano al más lejano; sin ella, primero el elegido
  const cand=(pos?ORDEN:[S.local,...ORDEN]).filter((x,k,a)=>x!==null&&a.indexOf(x)===k);
  const elegir=p=>{
    // Solo algunos locales están en cada app: se usa el más cercano que la tenga
    for(const i of cand){
      if(pos&&DIST[i]>R.radioMax)continue;
      if(LOCALES[i][p])return{u:LOCALES[i][p],i};
    }
    // Enlace de reserva (CONFIG.reparto.uberTodos / glovoTodos) si ningún local tiene el suyo
    const i=cand.find(x=>!pos||DIST[x]<=R.radioMax);
    return R[p+"Todos"]&&i!==undefined?{u:R[p+"Todos"],i}:null;
  };
  return{glovo:centrica?elegir("glovo"):null,uber:elegir("uber"),centrica};
}

/* ---------- Pintado ---------- */
const FLECHA='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg>';
const CHEV='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9l6 6 6-6"/></svg>';
const estadoApp=l=>`<span class="am-st ${abierto(l)?"ab":"ce"}">${esc(abierto(l)?t("app_open"):t("app_closed"))}</span>`;
const distApp=i=>DIST[i]!=null?`<span class="am-dist">${esc(fmtKm(DIST[i]))}</span>`:"";
const pillPedir=(href,txt,extra="")=>`<a class="am-pill" href="${esc(href)}"${extra}><span class="am-pill-t"><b>${esc(txt)}</b></span><span class="am-flecha">${FLECHA}</span></a>`;

function pintarHola(){
  const h=ahora();
  $("amSaludo").textContent=t(h<720&&h>=360?"hi_m":h<1230&&h>=720?"hi_a":"hi_n");
  const e=APP.estado,l=localSel(),busca=e==="buscando";
  const fallo=["denied","err","none"].includes(e);
  $("amCercaT").innerHTML=busca?`<small>${esc(t("app_locating"))}</small><span class="am-pulso" aria-hidden="true"></span>`
    :!l?`<small>${esc(t("app_t_locs"))}</small><b>${esc(t("choose_store"))}</b>`
    :`<small>${esc(t(conPos()&&!APP.manual?"app_nearest":"app_yours"))}</small><b>${esc(l.n)}</b><span class="am-badges">${estadoApp(l)}${distApp(S.local)}</span>`;
  $("amMsg").textContent=fallo&&!l?t(e==="denied"?"near_denied":e==="none"?"near_none":"near_err"):e==="aprox"&&!APP.manual?t("app_approx"):"";
  // «Pedir aquí»: SkyTab del local; sin SkyTab, la carta de esta web con ese local elegido. Sin local, primero se elige.
  $("amAqui").href=!l?"#ubicaciones":l.pedidoUrl||"#carta";
}

function pintarUbicaciones(){
  $("amLocTxt").textContent=t(conPos()?"app_locs_sorted":"app_locs_pick");
  const ab=APP.abierto??S.local??ORDEN[0];
  $("amLocs").innerHTML=ORDEN.map((i,k)=>{
    const l=LOCALES[i],on=i===ab;
    return `<div class="am-loc${on?" on":""}">
      <button type="button" class="am-loc-cab" data-am-abrir="${i}" aria-expanded="${on}">
        <span class="am-loc-t"><b>${esc(l.n)}</b><span class="am-badges">${estadoApp(l)}${distApp(i)}${k===0&&conPos()?`<span class="am-mc">${esc(t("app_nearest_badge"))}</span>`:""}</span></span>
        <span class="am-chev">${CHEV}</span>
      </button>
      ${on?`<div class="am-loc-c">
        <img src="${fotoLocal(l)}" alt="" loading="lazy">
        <p class="am-loc-d">${esc(l.d)}<br>${esc(hrTexto(l))}</p>
        ${pillPedir(l.pedidoUrl||"#carta",t("order_here"),` data-am-pedir="${i}"`)}
        <div class="am-loc-acc">
          <a class="am-mini" href="${esc(l.maps)}" target="_blank" rel="noopener">${esc(t("how_get"))}</a>
          <a class="am-mini" href="tel:${esc(l.tel.replace(/\s/g,""))}">${esc(t("call_store"))}</a>
        </div>
      </div>`:""}
    </div>`;
  }).join("");
}

function pintarDomicilio(){
  const r=reparto(),ops=["glovo","uber"].filter(p=>r[p]);
  const i=ops.length?r[ops[0]].i:S.local;
  $("amRepTxt").textContent=!ops.length?t("app_deliv_none"):!r.centrica?t("app_deliv_far",{n:LOCALES[i].n}):t("app_deliv_p",{n:LOCALES[i].n});
  $("amRep").innerHTML=ops.map(p=>`<a class="am-pill am-plat" href="${esc(r[p].u)}" rel="noopener" aria-label="${esc(t("app_open_with",{p:PLAT[p]}))}">
    <span class="am-pill-t"><img src="assets/img/${p}.webp" alt="${PLAT[p]}" class="am-logo-${p}"></span>
    <span class="am-flecha">${FLECHA}</span></a>`).join("")||pillPedir("#ubicaciones",t("app_pickup_instead"));
}

/* La carta de la web, solo para consultar (sin botones de añadir ni ficha) */
const soloVer=h=>h.replace(/<button type="button" class="mas"[\s\S]*?<\/button>/g,"").replace(/ data-prod="\d+"/g,"").replace(' role="button" tabindex="0"',"")
  .replace(/<button type="button" class="bb-t">([\s\S]*?)<\/button>/g,'<span class="bb-t">$1</span>');
function pintarCartaApp(){
  $("amChips").innerHTML=CATS.map(([id,k])=>`<button type="button" data-am-cat="${id}">${esc(t(k))}</button>`).join("");
  $("amCarta").innerHTML=CATS.map(([id,k,tipo])=>`<section class="am-cat" id="amc-${id}">
    <h3 class="deco">${esc(tipo==="pizza"?t("cat_pizzas_31"):t(k))}</h3>
    ${tipo==="pizza"?`<div class="carta-pz">${P.filter(x=>x.t===tipo).map(x=>soloVer(pizzaCarta(x))).join("")}</div>`
      :`<ul class="bebidas">${P.filter(x=>x.t===tipo).map(x=>soloVer(bebidaCarta(x))).join("")}</ul>`}
  </section>`).join("");
  APP.cartaLang=LANG;
}

function pintarApp(){
  const on=enApp();
  document.documentElement.classList.toggle("modo-app",on);
  $("appM").hidden=!on;
  if(!on)return;
  const p=pantallaApp();
  $("am-hola").hidden=p!=="hola";
  $("am-pide").hidden=p==="hola";
  $("appM").classList.toggle("en-pide",p!=="hola");
  $("amVolver").hidden=p==="hola";
  $("amLangCode").textContent=LANG.toUpperCase();
  if(p==="hola"){pintarHola();return;}
  document.querySelectorAll("[data-am-tab]").forEach(a=>a.classList.toggle("on",a.dataset.amTab===p));
  TABS.forEach(x=>$("amt-"+x).hidden=x!==p);
  if(p==="ubicaciones")pintarUbicaciones();
  if(p==="domicilio")pintarDomicilio();
  if(p==="lacarta"&&APP.cartaLang!==LANG)pintarCartaApp();
}

/* ---------- Eventos ---------- */
function alEntrar(){
  const visible=!$("appM").hidden;
  pintarApp();
  if(!enApp()){APP.pant=null;return;}
  const p=pantallaApp(),grupo=x=>x==="hola"?"hola":"pide";
  if(APP.pant!==null&&grupo(APP.pant)!==grupo(p))APP.desdeHola=p!=="hola"&&APP.pant==="hola";
  // Al pasar del inicio a «Pide ahora» (o al revés) se vuelve arriba; entre pestañas no
  if(!visible||APP.pant===null||grupo(APP.pant)!==grupo(p))window.scrollTo(0,0);
  APP.pant=p;
  // La primera vez que se abre la app pide la ubicación (salta el permiso del navegador)
  if(APP.estado===null)buscar();
}
window.addEventListener("hashchange",alEntrar);
MOVIL.addEventListener("change",alEntrar);

$("appM").addEventListener("click",e=>{
  // Las pestañas sustituyen la entrada del historial: «atrás» vuelve al inicio, no a la pestaña anterior
  const tab=e.target.closest("[data-am-tab]");
  if(tab){e.preventDefault();location.replace("#"+tab.dataset.amTab);return;}
  const ab=e.target.closest("[data-am-abrir]");
  if(ab){const i=+ab.dataset.amAbrir;APP.abierto=(APP.abierto??S.local??ORDEN[0])===i?-1:i;pintarUbicaciones();return;}
  const pe=e.target.closest("[data-am-pedir]");
  if(pe){APP.manual=true;elegirLocal(+pe.dataset.amPedir);refrescar();return;}
  const c=e.target.closest("[data-am-cat]");
  if(c){const s=$("amc-"+c.dataset.amCat);window.scrollTo({top:s.getBoundingClientRect().top+scrollY-20,behavior:"smooth"});}
});
$("amVolver").onclick=()=>{if(APP.desdeHola)history.back();else location.replace("#hola");};
/* Selector de idioma: lista desplegable */
const amLangL=$("amLangL");
function cerrarLangApp(){amLangL.hidden=true;$("amLang").setAttribute("aria-expanded","false");}
$("amLang").onclick=e=>{
  e.stopPropagation();
  if(!amLangL.hidden){cerrarLangApp();return;}
  amLangL.innerHTML=LANGS.map(l=>`<li><button type="button" role="option" aria-selected="${l===LANG}" data-am-l="${l}"><span>${LNAME[l]}</span><b>${l.toUpperCase()}</b></button></li>`).join("");
  amLangL.hidden=false;$("amLang").setAttribute("aria-expanded","true");
};
amLangL.onclick=e=>{
  const b=e.target.closest("[data-am-l]");if(!b)return;
  LANG=b.dataset.amL;
  try{localStorage.setItem("pizzi-lang",LANG);}catch(x){}
  cerrarLangApp();aplicarIdioma();refrescar();actCarro();pintarApp();
};
document.addEventListener("click",e=>{if(!e.target.closest(".am-lang-w"))cerrarLangApp();});
/* Las horas (abierto / cerrado) cambian con el tiempo */
setInterval(()=>{if(enApp())pintarApp();},60000);

alEntrar();

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
   En el ordenador se ve la misma app, centrada (como Honest Greens). Necesita app.js (usa sus datos y utilidades).
   ========================================================= */
"use strict";

const TABS=["ubicaciones","domicilio","lacarta"];
const PANT_APP=["","inicio","hola",...TABS,...PANT_PEDIR];
/* estado: null (sin buscar) · buscando · ok · aprox · denied · err · none
   abierto: local desplegado en «Ubicaciones» (null = el elegido, -1 = ninguno)
   desdeHola: se llegó a «Pide ahora» desde el inicio, así que «volver» es ir atrás en el historial */
const APP={estado:null,manual:false,abierto:null,desdeHola:false,pant:null,cartaLang:null};
const PLAT={glovo:"Glovo",uber:"Uber Eats"};

const hashApp=()=>location.hash.replace("#","");
const enApp=()=>PANT_APP.includes(hashApp());
const pantallaApp=()=>TABS.includes(hashApp())||PANT_PEDIR.includes(hashApp())?hashApp():"hola";
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
const hrefPedir=l=>PEDIDOS_WEB?"#pedir":l.pedidoUrl||"#carta";
const pillPedir=(href,txt,extra="")=>`<a class="am-pill" href="${esc(href)}"${extra}><span class="am-pill-t"><b>${esc(txt)}</b></span><span class="am-flecha">${FLECHA}</span></a>`;

/* ---------- Inicio ----------
   Tipo de pedido: recoger · domicilio (Pizzi solo trabaja para llevar y a domicilio). Se recuerda en el dispositivo. */
const TIPOS=["recoger","domicilio"];
if(!TIPOS.includes(S.perfil.tipo))S.perfil.tipo="recoger";
const tipoPedido=()=>S.perfil.tipo;

function pintarHola(){
  // Saludo según la hora de Valencia: «Hola, buenos días / buenas tardes / buenas noches»
  const h=ahora();
  $("amHola").innerHTML=t("app_hola",{s:t(h<720&&h>=360?"hola_m":h<1230&&h>=720?"hola_a":"hola_n")});
  const e=APP.estado,l=localSel(),busca=e==="buscando",tipo=tipoPedido();
  const fallo=["denied","err","none"].includes(e);
  $("amCercaT").innerHTML=busca?`<b>${esc(t("app_locating"))}</b><span class="am-pulso" aria-hidden="true"></span>`
    :!l?`<b>${esc(t("choose_store"))}</b>`
    :`<b>${esc(l.n)}${DIST[S.local]!=null?` <span>· ${esc(fmtKm(DIST[S.local]))}</span>`:""}</b><small><i class="${abierto(l)?"ab":"ce"}"></i>${esc(abierto(l)?t("app_open"):t("app_closed"))} · ${esc(hrTexto(l))}</small>`;
  $("amMsg").textContent=fallo&&!l?t(e==="denied"?"near_denied":e==="none"?"near_none":"near_err"):e==="aprox"&&!APP.manual?t("app_approx"):"";
  document.querySelectorAll("[data-am-tipo]").forEach(b=>b.setAttribute("aria-checked",String(b.dataset.amTipo===tipo)));
  $("amTipoTxt").textContent=t("tipo_"+tipo+"_p");
  // Botón principal: a domicilio lleva a las apps de reparto; si no, a pedir en el local elegido
  const a=$("amAqui");
  if(tipo==="domicilio"){a.href="#domicilio";$("amAquiT").textContent=t("app_deliv_cta");}
  else{a.href=l?hrefPedir(l):"#";$("amAquiT").textContent=t("app_pide_h");}
  // Repetir el último pedido (solo con pedidos web)
  const ult=(S.perfil.ultimo||[]).filter(x=>{const it=porNombre(x.n);return it&&!it.oculto;});
  $("amRepite").hidden=!(PEDIDOS_WEB&&ult.length&&tipo!=="domicilio"&&l);
}

/* ---------- Mapa de locales ----------
   MapLibre (cdnjs) con el mapa vectorial de OpenFreeMap (gratis, sin clave), recoloreado con los
   tonos de Pizzi. Se carga solo al abrir el mapa; si no carga, siguen funcionando las tarjetas. */
const MAPA={m:null,marcas:[],yo:null,k:0};
const ESTILO_MAPA="https://tiles.openfreemap.org/styles/positron";
function cargarMapLibre(){
  if(window.maplibregl)return Promise.resolve();
  return new Promise((ok,ko)=>{
    const c=document.createElement("link");c.rel="stylesheet";c.href="https://cdnjs.cloudflare.com/ajax/libs/maplibre-gl/4.7.1/maplibre-gl.min.css";document.head.appendChild(c);
    const j=document.createElement("script");j.src="https://cdnjs.cloudflare.com/ajax/libs/maplibre-gl/4.7.1/maplibre-gl.min.js";j.onload=ok;j.onerror=ko;document.head.appendChild(j);
  });
}
/* Colores de la marca sobre el estilo claro: agua rosa, parques rosa claro, calles blancas */
function tintarMapa(m){
  const st=m.getStyle();if(!st)return;
  st.layers.forEach(ly=>{
    const id=ly.id,set=(p,v)=>{try{m.setPaintProperty(id,p,v);}catch(e){}};
    if(ly.type==="background")set("background-color","#FBF3F2");
    else if(/water/.test(id)&&ly.type==="fill")set("fill-color","#F2C9C7");
    else if(/park|landuse|landcover|grass|wood/.test(id)&&ly.type==="fill")set("fill-color","#F6E2E1");
    else if(/building/.test(id)&&ly.type==="fill")set("fill-color","#F3E7E6");
    else if(ly.type==="line"&&/road|street|highway|bridge|tunnel/.test(id))set("line-color","#FFFFFF");
    else if(ly.type==="symbol"&&/label|name|place|poi/.test(id)){set("text-color","#8A5B5E");set("text-halo-color","#FBF3F2");}
  });
}
function abrirMapa(){
  MAPA.k=Math.max(0,ORDEN.indexOf(S.local??ORDEN[0]));
  $("amMapa").hidden=false;document.documentElement.classList.add("bloqueado");
  pintarCardMapa();
  cargarMapLibre().then(iniciarMapa).catch(()=>$("amMapaM").classList.add("sin"));
}
function cerrarMapa(){$("amMapa").hidden=true;document.documentElement.classList.remove("bloqueado");}
function iniciarMapa(){
  const l0=LOCALES[ORDEN[MAPA.k]];
  if(!MAPA.m){
    MAPA.m=new maplibregl.Map({container:"amMapaM",style:ESTILO_MAPA,center:[l0.lng,l0.lat],zoom:14.6,attributionControl:{compact:true}});
    MAPA.m.on("styledata",()=>tintarMapa(MAPA.m));
    // Créditos plegados (botón «i») para que no tapen la tarjeta
    MAPA.m.once("load",()=>{const at=$("amMapaM").querySelector(".maplibregl-ctrl-attrib");if(at)at.classList.remove("maplibregl-compact-show");});
    MAPA.marcas=LOCALES.map((l,i)=>{
      const el=document.createElement("button");el.type="button";el.className="am-pin";el.setAttribute("aria-label","Pizzi "+l.n);
      el.innerHTML='<span><img src="assets/img/ic-ubicacion.webp" alt=""></span>';
      el.onclick=()=>{MAPA.k=ORDEN.indexOf(i);pintarCardMapa();};
      return new maplibregl.Marker({element:el,anchor:"bottom"}).setLngLat([l.lng,l.lat]).addTo(MAPA.m);
    });
  }else MAPA.m.resize();
  if(conPos()){
    if(!MAPA.yo){const el=document.createElement("div");el.className="am-yo";el.innerHTML="<span></span>";MAPA.yo=new maplibregl.Marker({element:el}).setLngLat([YO.lng,YO.lat]).addTo(MAPA.m);}
    else MAPA.yo.setLngLat([YO.lng,YO.lat]);
  }
  centrarMapa(false);
}
function centrarMapa(animar=true){
  if(!MAPA.m)return;
  const i=ORDEN[MAPA.k],l=LOCALES[i];
  MAPA.marcas.forEach((m,j)=>m.getElement().classList.toggle("on",j===i));
  // El centro sube un poco para que el local no quede debajo de la tarjeta
  MAPA.m.easeTo({center:[l.lng,l.lat],zoom:innerWidth<700?14.2:14.8,padding:{bottom:Math.min(320,innerHeight*.4),top:40},duration:animar?700:0});
}
function pintarCardMapa(){
  const i=ORDEN[MAPA.k],l=LOCALES[i],ab=abierto(l),d=DIST[i];
  const hoy=turnos(l,hoyIdx());
  $("amMapaCard").innerHTML=`
    <img class="am-mc-foto" src="${fotoLocal(l)}" alt="${esc(t("facade"))} · Pizzi ${esc(l.n)}">
    ${d!=null?`<span class="am-mc-d">${esc(t(d>1?"mapa_lejos_b":"mapa_cerca_b"))} · ${esc(fmtKm(d))}</span>`:""}
    <b class="deco">${esc(l.n)}</b>
    <span class="am-mc-h"><i class="${ab?"ab":"ce"}"></i>${esc(hoy.length?fmtTurnos(hoy):t("closed"))} · València</span>
    <div class="am-mc-f"><span class="am-mc-ic" aria-hidden="true"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M13 2L4 14h7l-1 8 9-12h-7z"/></svg></span>
      <div><b>${esc(t("via_h"))} · <span class="${ab?"ab":"ce"}">${esc(ab?t("via_on"):t("via_off"))}</span></b><small>${esc(t("via_p"))}</small></div></div>
    <div class="am-mc-acc">
      <a href="${esc(l.maps)}" target="_blank" rel="noopener">${esc(t("how_get"))}</a>
      <a href="tel:${esc(l.tel.replace(/\s/g,""))}">${esc(t("call_store"))}</a>
    </div>
    <button type="button" class="am-mc-ok" data-am-elegir="${i}" aria-label="${esc(t("order_here"))} · ${esc(l.n)}"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg></button>`;
  $("amMapaAnt").disabled=MAPA.k===0;$("amMapaSig").disabled=MAPA.k===ORDEN.length-1;
  centrarMapa();
}
function elegirEnMapa(i){
  APP.manual=true;APP.abierto=null;elegirLocal(i);refrescar();cerrarMapa();pintarApp();
}
$("amCerca").onclick=abrirMapa;
$("appM").addEventListener("click",e=>{const m=e.target.closest("[data-am-mapa]");if(m){e.preventDefault();abrirMapa();}});
$("amMapaX").onclick=cerrarMapa;
$("amMapaAnt").onclick=()=>{if(MAPA.k>0){MAPA.k--;pintarCardMapa();}};
$("amMapaSig").onclick=()=>{if(MAPA.k<ORDEN.length-1){MAPA.k++;pintarCardMapa();}};
$("amMapaYo").onclick=()=>{if(conPos()&&MAPA.m)MAPA.m.easeTo({center:[YO.lng,YO.lat],zoom:15});else buscar();};
$("amMapaCard").addEventListener("click",e=>{const b=e.target.closest("[data-am-elegir]");if(b)elegirEnMapa(+b.dataset.amElegir);});
document.addEventListener("keydown",e=>{if(e.key==="Escape"&&!$("amMapa").hidden)cerrarMapa();});

/* Tipo de pedido, botón principal y repetir pedido */
document.querySelectorAll("[data-am-tipo]").forEach(b=>b.onclick=()=>{S.perfil.tipo=b.dataset.amTipo;guardarPerfil();pintarHola();});
$("amAqui").addEventListener("click",e=>{
  if(tipoPedido()==="domicilio")return;
  if(S.local===null){e.preventDefault();abrirMapa();}
});
$("amRepite").onclick=()=>{
  (S.perfil.ultimo||[]).forEach(x=>{const it=porNombre(x.n);if(it&&!it.oculto)sumar(it.i,x.q,x.nota);});
  actCarro(true);location.hash="cesta";
};

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
        ${pillPedir(hrefPedir(l),t("order_here"),` data-am-pedir="${i}"`)}
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
    ${tipo==="pizza"?leyendaAlerg():""}
    ${tipo==="pizza"?`<div class="carta-pz">${P.filter(x=>x.t===tipo).map(x=>soloVer(pizzaCarta(x))).join("")}</div>`
      :`<ul class="bebidas">${P.filter(x=>x.t===tipo).map(x=>soloVer(bebidaCarta(x))).join("")}</ul>`}
  </section>`).join("");
  APP.cartaLang=LANG;
}

function pintarApp(){
  const on=enApp();
  document.documentElement.classList.toggle("modo-app",on);
  $("appM").hidden=!on;
  if(!on){pintarBarra();return;}
  const p=pantallaApp(),pedir=PANT_PEDIR.includes(p);
  $("am-hola").hidden=p!=="hola";
  $("am-pide").hidden=p==="hola"||pedir;
  PANT_PEDIR.forEach(x=>$("am-"+x).hidden=x!==p);
  $("appM").classList.toggle("en-pide",p!=="hola");
  $("amVolver").hidden=p==="hola";
  $("amLangCode").textContent=LANG.toUpperCase();
  if(p==="hola"){pintarHola();pintarBarra();return;}
  if(pedir){repintarPedir();return;}
  pintarBarra();
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
  if(!visible||APP.pant===null||grupo(APP.pant)!==grupo(p)||(APP.pant!==p&&(PANT_PEDIR.includes(p)||PANT_PEDIR.includes(APP.pant))))window.scrollTo(0,0);
  APP.pant=p;
  // La primera vez que se abre la app pide la ubicación (salta el permiso del navegador)
  if(APP.estado===null)buscar();
}
window.addEventListener("hashchange",alEntrar);

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
$("amVolver").onclick=()=>{
  const p=pantallaApp();
  if(p==="cesta"){location.replace("#pedir");return;}
  if(p==="estado"){location.replace("#hola");return;}
  if(APP.desdeHola)history.back();else location.replace("#hola");
};
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

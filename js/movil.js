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
/* La app es la versión móvil; en el ordenador se ve la web de escritorio (inicio, carta, locales, pedido) */
const MOVIL=matchMedia("(max-width:899px)");
const enApp=()=>MOVIL.matches&&PANT_APP.includes(hashApp());
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
  // Se ofrecen las dos apps y el cliente elige
  return{glovo:elegir("glovo"),uber:elegir("uber"),centrica};
}

/* ---------- Pintado ---------- */
const FLECHA='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg>';
const CHEV='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9l6 6 6-6"/></svg>';
const estadoApp=l=>`<span class="am-st ${abierto(l)?"ab":"ce"}">${esc(abierto(l)?t("app_open"):t("app_closed"))}</span>`;
const distApp=i=>DIST[i]!=null?`<span class="am-dist">${esc(fmtKm(DIST[i]))}</span>`:"";
/* Sin SkyTab todavía: se pide llamando al local */
const hrefPedir=l=>PEDIDOS_WEB?"#pedir":l.pedidoUrl||"tel:"+l.tel.replace(/\s/g,"");
const pillPedir=(href,txt,extra="")=>`<a class="am-pill" href="${esc(href)}"${extra}><span class="am-pill-t"><b>${esc(txt)}</b></span><span class="am-flecha">${FLECHA}</span></a>`;

/* ---------- Inicio ----------
   Tipo de pedido: recoger · domicilio (Pizzi solo trabaja para llevar y a domicilio). Se recuerda en el dispositivo. */
const TIPOS=["recoger","domicilio"];
if(!TIPOS.includes(S.perfil.tipo))S.perfil.tipo="recoger";
const tipoPedido=()=>S.perfil.tipo;

function pintarHola(){
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
  else{a.href=l?hrefPedir(l):"#";$("amAquiT").textContent=t(l&&!l.pedidoUrl&&!PEDIDOS_WEB?"call_order":"app_pide_h");}
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
    const id=ly.id,set=(p,v)=>{try{m.setPaintProperty(id,p,v);}catch(e){}},lay=(p,v)=>{try{m.setLayoutProperty(id,p,v);}catch(e){}};
    if(ly.type==="background")set("background-color","#F7EFE8");
    else if(/water/.test(id)&&ly.type==="fill")set("fill-color","#DCE8EE");
    else if(/park|landuse|landcover|grass|wood/.test(id)&&ly.type==="fill")set("fill-color","#E6EDDA");
    else if(/building/.test(id)&&ly.type==="fill")set("fill-color","#F0E4DB");
    else if(ly.type==="line"&&/road|street|highway|bridge|tunnel/.test(id))set("line-color","#FFFFFF");
    else if(ly.type==="symbol"&&/^label_/.test(id)){
      // Barrios y zonas en mayúsculas y más grandes, como en Honest Greens
      set("text-color","#5A2A30");set("text-halo-color","#F7EFE8");set("text-halo-width",1.8);
      lay("text-transform","uppercase");lay("text-letter-spacing",.08);lay("text-size",["interpolate",["linear"],["zoom"],11,12,15,18]);lay("text-font",["Noto Sans Bold"]);}
    else if(ly.type==="symbol"&&/name|water/.test(id)){set("text-color","#8A5B5E");set("text-halo-color","#F7EFE8");}
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
      el.innerHTML="<span></span>";
      el.onclick=()=>{MAPA.k=ORDEN.indexOf(i);pintarCardMapa();};
      return new maplibregl.Marker({element:el}).setLngLat([l.lng,l.lat]).addTo(MAPA.m);
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
  // Como en Honest Greens: se ven tu posición y el local elegido a la vez (si no está demasiado lejos)
  const pad={top:90,left:50,right:50,bottom:Math.round(innerHeight*(innerWidth<700?.5:.45))},dur=animar?700:0;
  if(conPos()&&DIST[i]<4){const b=new maplibregl.LngLatBounds([l.lng,l.lat],[l.lng,l.lat]);b.extend([YO.lng,YO.lat]);MAPA.m.fitBounds(b,{padding:pad,duration:dur,maxZoom:15.4});}
  else MAPA.m.easeTo({center:[l.lng,l.lat],zoom:14.8,padding:pad,duration:dur});
}
function pintarCardMapa(){
  const i=ORDEN[MAPA.k],l=LOCALES[i],ab=abierto(l),d=DIST[i];
  const hoy=turnos(l,hoyIdx());
  $("amMapaCard").innerHTML=`
    <img class="am-mc-foto" src="${fotoLocal(l)}" alt="${esc(t("facade"))} · Pizzi ${esc(l.n)}">
    ${d!=null?`<span class="am-mc-d">${esc(t(d>1?"mapa_lejos_b":"mapa_cerca_b"))} · ${esc(fmtKm(d))}</span>`:""}
    <b class="deco">${esc(l.n)}</b>
    <span class="am-mc-h"><i class="${ab?"ab":"ce"}"></i>${esc(hoy.length?fmtTurnos(hoy):t("closed"))} · València</span>
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
        ${pillPedir(hrefPedir(l),t(l.pedidoUrl||PEDIDOS_WEB?"order_here":"call_order"),` data-am-pedir="${i}"`)}
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
const soloVer=h=>h.replace(/<button type="button" class="mas"[\s\S]*?<\/button>/g,"")
  .replace(/<button type="button" class="bb-t"[^>]*>([\s\S]*?)<\/button>/g,'<span class="bb-t">$1</span>')
  .replace(/ data-prod="(\d+)"/g,' data-am-ver="$1"');
/* Al pulsar una pizza de la carta se abre su ficha (con pedidos web, la de pedir) */
const verFicha=e=>{const v=e.target.closest("[data-am-ver]");if(!v)return false;e.preventDefault();const i=+v.dataset.amVer;if(PEDIDOS_WEB)abrirProdApp(i);else abrirFicha(i);return true;};
$("appM").addEventListener("click",verFicha);
$("appM").addEventListener("keydown",e=>{if((e.key==="Enter"||e.key===" ")&&e.target.matches("[data-am-ver]"))verFicha(e);});
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
  $("amMenuB").hidden=p!=="hola";
  $("amLangCode").innerHTML=bandera(LANG);
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
MOVIL.addEventListener("change",()=>{alEntrar();if(!enApp())ir();});

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
  amLangL.innerHTML=LANGS.map(l=>`<li><button type="button" role="option" aria-selected="${l===LANG}" data-am-l="${l}">${bandera(l)}<span>${LNAME[l]}</span></button></li>`).join("");
  amLangL.hidden=false;$("amLang").setAttribute("aria-expanded","true");
};
amLangL.onclick=e=>{
  const b=e.target.closest("[data-am-l]");if(!b)return;
  LANG=b.dataset.amL;
  try{localStorage.setItem("pizzi-lang",LANG);}catch(x){}
  cerrarLangApp();aplicarIdioma();refrescar();actCarro();pintarApp();
};
document.addEventListener("click",e=>{if(!e.target.closest(".am-lang-w"))cerrarLangApp();});
/* ---------- Menú lateral ---------- */
const MI={
  pide:'<img src=\"assets/img/ic-porcion.webp\" alt=\"\" width=\"24\" height=\"24\">',
  carta:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M3 5.5C8 3 16 3 21 5.5L12 21z"/><circle cx="10" cy="9" r="1.2"/><circle cx="14.5" cy="10" r="1"/><circle cx="12" cy="13.5" r="1"/></svg>',
  locales:'<img src=\"assets/img/ic-ubicacion.webp\" alt=\"\" width=\"24\" height=\"24\">',
  repite:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 1 0 3-6.7"/><path d="M3 4v5h5"/></svg>',
  alerg:'<img src=\"assets/img/ic-gluten.webp\" alt=\"\" width=\"24\" height=\"24\">',
  tel:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2z"/></svg>',
  legal:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M7 3h7l5 5v13H7z"/><path d="M14 3v5h5M10 13h6M10 17h6"/></svg>'
};
function pintarMenu(){
  const l=localSel(),ult=PEDIDOS_WEB&&(S.perfil.ultimo||[]).length;
  const it=(ic,txt,attr)=>`<li><a ${attr}><span class="am-mi">${MI[ic]}</span><span>${esc(txt)}</span></a></li>`;
  $("amMenuL").innerHTML=[
    it("pide",t("app_pide_h"),'href="#hola" data-cerrar-menu'),
    it("carta",t("app_t_menu"),'href="#lacarta" data-cerrar-menu'),
    it("locales",t("app_t_locs"),'href="#ubicaciones" data-cerrar-menu'),
    ult?it("repite",t("app_repite"),'href="#" data-menu-repite'):"",
    it("alerg",t("al_sec_h"),'href="#" data-menu-alerg'),
    l?it("tel",t("call_store")+" · "+l.n,`href="tel:${l.tel.replace(/\s/g,"")}"`):"",
    it("legal",t("lg_nav"),'href="#aviso-legal" data-cerrar-menu')
  ].join("");
  $("amMenuPie").innerHTML=`<div class="am-menu-lang">${LANGS.map(x=>`<button type="button" aria-pressed="${x===LANG}" data-am-l2="${x}" aria-label="${LNAME[x]}">${bandera(x)}</button>`).join("")}</div>`+document.querySelector(".am-redes").outerHTML;
}
function abrirMenu(){pintarMenu();$("amMenu").hidden=false;$("amMenuB").setAttribute("aria-expanded","true");requestAnimationFrame(()=>$("amMenu").classList.add("on"));document.documentElement.classList.add("bloqueado");$("amMenuX").focus();}
function cerrarMenu(){$("amMenu").classList.remove("on");$("amMenuB").setAttribute("aria-expanded","false");document.documentElement.classList.remove("bloqueado");setTimeout(()=>{if(!$("amMenu").classList.contains("on"))$("amMenu").hidden=true;},250);}
$("amMenuB").onclick=abrirMenu;
$("amMenuX").onclick=cerrarMenu;
$("amMenu").addEventListener("click",e=>{
  if(e.target===$("amMenu")){cerrarMenu();return;}
  const l2=e.target.closest("[data-am-l2]");
  if(l2){LANG=l2.dataset.amL2;try{localStorage.setItem("pizzi-lang",LANG);}catch(x){}aplicarIdioma();refrescar();actCarro();pintarApp();pintarMenu();return;}
  if(e.target.closest("[data-menu-alerg]")){e.preventDefault();cerrarMenu();abrirAlerg();return;}
  if(e.target.closest("[data-menu-repite]")){e.preventDefault();cerrarMenu();$("amRepite").click();return;}
  if(e.target.closest("[data-cerrar-menu]"))cerrarMenu();
});
document.addEventListener("keydown",e=>{if(e.key==="Escape"&&!$("amMenu").hidden)cerrarMenu();});

/* Las horas (abierto / cerrado) cambian con el tiempo */
setInterval(()=>{if(enApp())pintarApp();},60000);

alEntrar();

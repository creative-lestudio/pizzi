/* =========================================================
   PIZZI · App móvil
   En pantallas de menos de 900 px el inicio se convierte en un flujo corto, como una app:
     1. «¡Hola! Es hora de Pizzi»: pide la ubicación y muestra el local más cercano.
     2. «Pedir aquí»  → tienda SkyTab del local (pedidoUrl). Sin SkyTab → carta de esta web.
        «A domicilio» → Uber Eats y Glovo en zona céntrica; fuera de ella, solo Uber Eats
                        del local más cercano que lo tenga (ver CONFIG.reparto en data.js).
   En el ordenador no cambia nada. Necesita app.js (usa sus datos y utilidades).
   ========================================================= */
"use strict";

const MOVIL=matchMedia("(max-width:899px)");
const PANT_APP=["","inicio","hola","domicilio","elegir"];
/* estado: null (sin buscar) · buscando · ok · aprox · denied · err · none */
const APP={estado:null,manual:false};
const PLAT={uber:"Uber Eats",glovo:"Glovo"};

const pantalla=()=>location.hash.replace("#","");
const enApp=()=>MOVIL.matches&&PANT_APP.includes(pantalla());

/* ---------- Ubicación ---------- */
function buscar(){
  APP.estado="buscando";APP.manual=false;pintarApp();
  ubicar(r=>{APP.estado=r;if((r==="ok"||r==="aprox")&&!APP.manual)elegirLocal(ORDEN[0]);refrescar();pintarApp();});
}

/* ---------- Reparto ----------
   Devuelve las apps disponibles para el local elegido y la ubicación del cliente:
   { uber:{u,i}|null, glovo:{u,i}|null, centrica } */
function reparto(){
  const R=CONFIG.reparto,conPos=YO&&(APP.estado==="ok"||APP.estado==="aprox");
  const centrica=!conPos||km(YO.lat,YO.lng,R.centro.lat,R.centro.lng)<=R.radioCentro;
  const cand=[S.local,...ORDEN].filter((x,k,a)=>x!==null&&a.indexOf(x)===k);
  const elegir=p=>{
    for(const i of cand){
      if(conPos&&DIST[i]>R.radioMax)continue;
      const u=LOCALES[i][p]||R[p+"Todos"];
      if(u)return{u,i};
    }
    return null;
  };
  return{uber:elegir("uber"),glovo:centrica?elegir("glovo"):null,centrica};
}

/* ---------- Pintado ---------- */
function tarjetaApp(i,titulo){
  const l=LOCALES[i];
  return `<div class="am-loc">
    <img src="assets/img/${FOTO_LOCAL[l.id]}.webp" alt="" width="160" height="160">
    <div class="am-loc-t">
      ${titulo?`<small>${esc(titulo)}</small>`:""}
      <b>Pizzi ${esc(l.n)}</b>
      <span class="am-loc-d">${esc(l.d.split(",").slice(0,2).join(","))}</span>
      <span class="am-loc-e"><i class="${abierto(l)?"ab":"ce"}"></i>${esc(abierto(l)?t("open_now"):t("closed_now"))} · ${esc(hrTexto(l))}${DIST[i]!=null?` · ${esc(t("dist",{d:fmtKm(DIST[i])}))}`:""}</span>
    </div>
  </div>`;
}
const filaLocal=i=>`<button type="button" class="am-fila${i===S.local?" on":""}" data-am-local="${i}">${tarjetaApp(i)}</button>`;

function pintarHola(){
  const h=ahora();
  $("amSaludo").textContent=t(h<720&&h>=360?"hi_m":h<1230&&h>=720?"hi_a":"hi_n");
  const e=APP.estado,l=localSel();
  $("amBuscando").hidden=e!=="buscando";
  const fallo=["denied","err","none"].includes(e);
  // Sin ubicación y sin local guardado: se elige de la lista en la propia pantalla
  const lista=fallo&&!l;
  $("amMsg").innerHTML=fallo?esc(t(e==="denied"?"near_denied":e==="none"?"near_none":"near_err")):e==="aprox"&&!APP.manual?esc(t("app_approx")):"";
  $("amLista").innerHTML=lista?ORDEN.map(filaLocal).join(""):"";
  const ver=l&&e!=="buscando";
  $("amLocal").innerHTML=ver?tarjetaApp(S.local,t((e==="ok"||e==="aprox")&&!APP.manual?"app_nearest":"app_yours")):"";
  $("amAcc").hidden=!ver;
  $("amOtro").hidden=!ver;
  if(ver){
    const a=$("amAqui");
    // Sin SkyTab se pide desde la carta de esta web, con ese local ya elegido
    a.href=l.pedidoUrl||"#carta";
  }
}
function pintarElegir(){
  $("amElegir").innerHTML=ORDEN.map(filaLocal).join("");
}
function pintarDomicilio(){
  const r=reparto(),ops=["uber","glovo"].filter(p=>r[p]);
  const i=ops.length?r[ops[0]].i:S.local;
  $("amRepTxt").textContent=!ops.length?t("app_deliv_none"):!r.centrica?t("app_deliv_far",{n:LOCALES[i].n}):t("app_deliv_p",{n:LOCALES[i].n});
  $("amRep").innerHTML=ops.map(p=>`<a class="am-plat am-${p}" href="${esc(r[p].u)}" rel="noopener">
    <img class="am-plat-m" src="assets/img/${p}.webp" alt="${PLAT[p]}" width="360" height="${p==="uber"?126:118}"><b>${esc(t("app_open_with",{p:PLAT[p]}))}</b>
    <svg class="cv" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M9 6l6 6-6 6"/></svg></a>`).join("")
    ||`<a class="btn btn-vino full" href="#hola" data-i="app_pickup_instead">${esc(t("app_pickup_instead"))}</a>`;
}

function pintarApp(){
  const on=enApp();
  document.documentElement.classList.toggle("modo-app",on);
  $("appM").hidden=!on;
  if(!on)return;
  let p=pantalla();
  if(!["domicilio","elegir"].includes(p))p="hola";
  if(p==="domicilio"&&S.local===null){location.replace("#hola");return;}
  ["hola","elegir","domicilio"].forEach(x=>$("am-"+x).hidden=x!==p);
  $("amVolver").hidden=p==="hola";
  $("amLangCode").textContent=LANG.toUpperCase();
  if(p==="hola")pintarHola();
  if(p==="elegir")pintarElegir();
  if(p==="domicilio")pintarDomicilio();
}

/* ---------- Eventos ---------- */
function alEntrar(){
  const antes=$("appM").hidden;
  pintarApp();
  if(!enApp())return;
  if(antes)$("appM").scrollTop=0;
  // La primera vez que se abre la app pide la ubicación (salta el permiso del navegador)
  if(APP.estado===null)buscar();
}
window.addEventListener("hashchange",()=>{alEntrar();$("appM").scrollTop=0;});
MOVIL.addEventListener("change",alEntrar);

$("appM").addEventListener("click",e=>{
  const f=e.target.closest("[data-am-local]");
  if(f){APP.manual=true;elegirLocal(+f.dataset.amLocal);refrescar();
    if(pantalla()==="elegir")history.length>1?history.back():location.replace("#hola");else pintarApp();}
});
$("amUbicar").onclick=()=>{location.replace("#hola");buscar();};
$("amVolver").onclick=()=>{history.length>1?history.back():location.replace("#hola");};
$("amLang").onclick=()=>{
  LANG=LANGS[(LANGS.indexOf(LANG)+1)%LANGS.length];
  try{localStorage.setItem("pizzi-lang",LANG);}catch(x){}
  aplicarIdioma();refrescar();actCarro();pintarApp();
};
/* Las horas (abierto / cerrado) cambian con el tiempo */
setInterval(()=>{if(enApp())pintarApp();},60000);

alEntrar();

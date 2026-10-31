/* =========================================================
   PIZZI · Pedir desde la app móvil (solo con PEDIDOS_WEB, ver js/conector.js)
   Tres pantallas dentro de la app (js/movil.js las muestra según la dirección):
     #pedir  → carta del local (la real de su tienda de Shift4), con categorías y ficha de producto
     #cesta  → pedido, bebidas sugeridas, hora de recogida, datos, pago y «Pagar»
     #estado → seguimiento: recibido → en el horno → listo, y vía rápida para recoger sin cola
   Usa el carrito, los productos y las franjas de app.js, así que escritorio y móvil comparten pedido.
   ========================================================= */
"use strict";

const PANT_PEDIR=PEDIDOS_WEB?["pedir","cesta","estado"]:[];
const PD={prod:null,cant:1,cargando:false};

const imgGrande=it=>imgDe(it,"");
const masIco='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>';

/* ---------- #pedir: carta ---------- */
function filaProd(it){
  const q=S.carro.filter(c=>c.i===it.i).reduce((a,c)=>a+c.q,0),n=nm(it.n);
  return `<div class="ap-prod" role="button" tabindex="0" data-ap-prod="${it.i}" aria-label="${esc(n)}, ${eur(it.p)}">
    <div class="ap-prod-t">
      <b>${esc(cap(n.toLowerCase()))}</b>
      ${desc(it)?`<p>${esc(desc(it))}</p>`:""}
      <span class="ap-precio">${eur(it.p)}${it.badge?` <i>${esc(t(it.badge==="top"?"tag_top":"tag_fresh"))}</i>`:""}</span>
    </div>
    <div class="ap-prod-f"><img src="${imgDe(it,"-s")}" alt="" loading="lazy" decoding="async">
      <button type="button" class="ap-mas${q?" con":""}" data-ap-add="${it.i}" aria-label="${esc(t("quick_add",{n}))}">${q?q:masIco}</button></div>
  </div>`;
}
function pintarPedir(){
  const l=localSel();
  if(!l){location.replace("#ubicaciones");return;}
  $("apLocal").textContent="Pizzi "+l.n;
  $("apHora").textContent=horaCorta(l,S.hora);
  $("apCats").innerHTML=CATS.map(([id,k])=>`<button type="button" data-ap-cat="${id}">${esc(t(k))}</button>`).join("");
  PD.cargando=!!TPV.refDe(l)&&cartaLista!==l.id;
  const cerrado=!slots(l).length;
  $("apAviso").hidden=!cerrado&&!PD.cargando;
  $("apAviso").textContent=PD.cargando?t("app_loading_menu"):t("app_no_slots");
  $("apCarta").innerHTML=CATS.map(([id,k,tipo])=>{
    const its=P.filter(x=>x.t===tipo&&!x.oculto);
    return its.length?`<section class="ap-sec" id="apc-${id}"><h2 class="deco">${esc(t(k))}</h2>${its.map(filaProd).join("")}</section>`:"";
  }).join("");
  pintarBarra();
}

/* Elegir hora desde la cabecera de la carta */
function pintarFranjas(el){
  const l=localSel(),ss=l?slots(l).slice(0,16):[];
  el.innerHTML=ss.length?ss.map(s=>`<button type="button" role="radio" aria-checked="${s.v===S.hora}" data-ap-hora="${esc(s.v)}">${esc(s.v==="asap"?t("asap_s"):(s.off===0?"":(s.off===1?t("tomorrow"):cap(DIAS[(hoyIdx()+s.off)%7]))+" ")+hhmm(s.m))}${s.v==="asap"?`<small>~${hhmm(s.m)}</small>`:""}</button>`).join("")
    :`<p class="ap-nada">${esc(t("app_no_slots"))}</p>`;
}

/* ---------- Ficha de producto ---------- */
function abrirProdApp(i){
  const it=P[i];if(!it)return;PD.prod=it;PD.cant=1;
  const a=ALERG[it.n]||[];
  $("apHojaC").innerHTML=`<div class="ap-hoja-f"><img src="${imgGrande(it)}" alt=""></div>
    <div class="ap-hoja-d">
      <h2 class="deco" id="apHojaT">${esc(nm(it.n))}</h2>
      <span class="ap-precio">${eur(it.p)}</span>
      ${desc(it)?`<p>${esc(desc(it))}</p>`:""}
      <div class="ap-tags">${it.t==="pizza"?`<span>${esc(t("size31"))}</span>`:""}${a.length?`<span>${esc(t("allergens"))}: ${esc(a.map(alg).join(", "))}</span>`:""}</div>
      ${it.t==="pizza"?`<label class="ap-campo"><span>${esc(t("kitchen_notes"))} <small>${esc(t("optional"))}</small></span><textarea id="apNota" rows="2" placeholder="${esc(t("note_ph"))}"></textarea></label>`:""}
    </div>`;
  actHoja();
  $("apVelo").hidden=$("apHoja").hidden=false;
  requestAnimationFrame(()=>{$("apVelo").classList.add("on");$("apHoja").classList.add("on");});
  document.documentElement.classList.add("bloqueado");
}
function cerrarProdApp(){
  $("apVelo").classList.remove("on");$("apHoja").classList.remove("on");
  document.documentElement.classList.remove("bloqueado");
  setTimeout(()=>{if(!$("apHoja").classList.contains("on"))$("apVelo").hidden=$("apHoja").hidden=true;},300);
}
function actHoja(){$("apCant").textContent=PD.cant;$("apAddT").textContent=eur(PD.prod.p*PD.cant);$("apMenos").disabled=PD.cant<=1;}

/* ---------- #cesta ---------- */
function pintarCesta(){
  const l=localSel();
  if(!S.carro.length){location.replace("#pedir");return;}
  asegurarHora();
  $("apLineas").innerHTML=S.carro.map(c=>{const it=P[c.i];return `<div class="ap-linea">
    <img src="${imgDe(it,"-s")}" alt="">
    <div class="ap-linea-t"><b>${esc(cap(nm(c.n).toLowerCase()))}</b>${c.nota?`<small>“${esc(c.nota)}”</small>`:""}<span>${eur(c.u*c.q)}</span></div>
    <div class="ap-cant ap-cant-s"><button type="button" data-q="-1" data-k="${esc(c.k)}" aria-label="${esc(t("remove_one"))}">−</button><b>${c.q}</b><button type="button" data-q="1" data-k="${esc(c.k)}" aria-label="${esc(t("add_one"))}">+</button></div>
  </div>`;}).join("")+`<div class="ap-total"><span>${esc(t("total"))}</span><b>${eur(total())}</b></div>`;
  const beb=P.filter(x=>x.t==="bebida"&&!x.oculto&&!S.carro.some(c=>c.i===x.i));
  $("apUpsellBox").hidden=!beb.length;
  $("apUpsell").innerHTML=beb.map(it=>`<button type="button" class="ap-up" data-ap-add="${it.i}"><img src="${imgDe(it,"-s")}" alt=""><b>${esc(cap(nm(it.n).toLowerCase()))}</b><span>${eur(it.p)}</span><i aria-hidden="true">${masIco}</i></button>`).join("");
  $("apCestaLocal").textContent=l?"Pizzi "+l.n:t("pick_store");
  $("apCestaDir").textContent=l?l.d:"";
  pintarFranjas($("apFranjas"));
  pintarBarra();
}

/* Barra inferior: «Ver mi pedido» en la carta y «Pagar» en la cesta */
function pintarBarra(){
  const p=pantallaApp(),n=nItems(),b=$("apBarraBtn");
  const ver=enApp()&&((p==="pedir"&&n)||p==="cesta");
  $("apBarra").hidden=!ver;
  document.documentElement.classList.toggle("con-barra",ver);
  if(!ver)return;
  b.innerHTML=p==="cesta"?`<span>${esc(t("app_pay"))}</span><b>${eur(total())}</b>`
    :`<i>${n}</i><span>${esc(t("view_order"))}</span><b>${eur(total())}</b>`;
  b.dataset.accion=p;
}

/* Pagar: valida y envía el pedido por el conector */
function errorCesta(msg,foco){const e=$("apError");e.textContent=msg;e.hidden=false;(foco||e).scrollIntoView({behavior:"smooth",block:"center"});if(foco)foco.focus({preventScroll:true});}
function pagarApp(){
  $("apError").hidden=true;
  const l=localSel();
  if(!l){location.hash="ubicaciones";return;}
  asegurarHora();
  if(!S.hora)return errorCesta(t("err_time"));
  const nom=$("apNom").value.trim(),tel=$("apTel").value.trim(),mail=$("apMail").value.trim();
  if(!nom)return errorCesta(t("err_data"),$("apNom"));
  if(tel.replace(/\D/g,"").length<9)return errorCesta(t("err_data"),$("apTel"));
  if(mail&&!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(mail))return errorCesta(t("app_err_mail"),$("apMail"));
  if(!$("apAcepto").checked)return errorCesta(t("err_accept"));
  const horaES=withES(()=>{const s=slots(l).find(x=>x.v===S.hora);return s?s.t:"";});
  S.pedido={horaVal:S.hora,t0:ahora(),num:"",nom,tel,email:mail,local:l,horaES,items:S.carro.map(c=>({...c})),total:total()};
  S.perfil.nom=nom;S.perfil.tel=tel;if(mail)S.perfil.mail=mail;
  S.perfil.ultimo=S.carro.map(c=>({n:c.n,q:c.q,nota:c.nota}));guardarPerfil();
  enviarWeb($("apBarraBtn"),()=>errorCesta(t("app_err_send")),"estado");
}

/* ---------- #estado ---------- */
function pintarEstadoApp(){
  const o=S.pedido;
  if(!o||!o.web){location.replace("#hola");return;}
  $("apNum").textContent=o.num;
  $("apNumSub").textContent="Pizzi "+o.local.n+" · "+horaCortaDe(o);
  pintarEstadoWeb($("apPasos"),o);
  $("apMaps").href=o.local.maps;
  $("apTelL").href="tel:"+o.local.tel.replace(/\s/g,"");
}

/* ---------- Eventos ---------- */
$("appM").addEventListener("click",e=>{
  if(!PEDIDOS_WEB)return;
  const add=e.target.closest("[data-ap-add]");
  if(add){e.preventDefault();e.stopPropagation();addCarro(+add.dataset.apAdd);add.classList.remove("pop");void add.offsetWidth;add.classList.add("pop");return;}
  const pr=e.target.closest("[data-ap-prod]");
  if(pr){abrirProdApp(+pr.dataset.apProd);return;}
  const h=e.target.closest("[data-ap-hora]");
  if(h){S.hora=h.dataset.apHora;$("apFranjasCab").hidden=true;refrescarCab();pintarApp();return;}
  const c=e.target.closest("[data-ap-cat]");
  if(c){const s=$("apc-"+c.dataset.apCat);if(s)window.scrollTo({top:s.getBoundingClientRect().top+scrollY-70,behavior:"smooth"});}
});
$("apHoraBtn").onclick=()=>{const f=$("apFranjasCab");f.hidden=!f.hidden;if(!f.hidden)pintarFranjas(f);};
$("apBarraBtn").onclick=()=>{if($("apBarraBtn").dataset.accion==="cesta")pagarApp();else location.hash="cesta";};
$("apHojaX").onclick=cerrarProdApp;
$("apVelo").onclick=cerrarProdApp;
$("apMenos").onclick=()=>{if(PD.cant>1){PD.cant--;actHoja();}};
$("apMas").onclick=()=>{PD.cant++;actHoja();};
$("apAdd").onclick=()=>{const n=$("apNota");addCarro(PD.prod.i,PD.cant,n?n.value:"");cerrarProdApp();};
document.addEventListener("keydown",e=>{
  if(e.key==="Escape"&&!$("apHoja").hidden)cerrarProdApp();
  if((e.key==="Enter"||e.key===" ")&&e.target.matches("[data-ap-prod]")){e.preventDefault();abrirProdApp(+e.target.dataset.apProd);}
});
/* El aviso de error se quita en cuanto se corrige algo */
["apNom","apTel","apMail","apAcepto"].forEach(id=>$(id).addEventListener("input",()=>{$("apError").hidden=true;}));
/* Datos recordados */
if(S.perfil.nom)$("apNom").value=S.perfil.nom;
if(S.perfil.tel)$("apTel").value=S.perfil.tel;
if(S.perfil.mail)$("apMail").value=S.perfil.mail;

/* El carrito, la carta del TPV y el estado del pedido repintan la pantalla abierta */
function repintarPedir(){
  if(!PEDIDOS_WEB||!enApp())return;
  const p=pantallaApp();
  if(p==="pedir")pintarPedir();else if(p==="cesta")pintarCesta();else if(p==="estado")pintarEstadoApp();
  pintarBarra();
}
document.addEventListener("pizzi:carta",()=>{PD.cargando=false;repintarPedir();});
document.addEventListener("pizzi:estado",()=>{if(enApp()&&pantallaApp()==="estado")pintarEstadoWeb($("apPasos"),S.pedido);});
document.addEventListener("pizzi:carro",repintarPedir);

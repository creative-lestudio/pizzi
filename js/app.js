/* =========================================================
   PIZZI · Lógica de la app
   Necesita (en este orden): i18n.js, data.js, legal.js
   ========================================================= */
"use strict";

/* ---------- Idioma ---------- */
let LANG="es";
/* Banderas del selector de idioma (SVG: se ven igual en todos los sistemas, también en Windows) */
const BANDERAS={
  es:'<rect width="30" height="20" fill="#AA151B"/><rect y="5" width="30" height="10" fill="#F1BF00"/>',
  en:'<rect width="30" height="20" fill="#012169"/><path d="M0 0l30 20M30 0L0 20" stroke="#fff" stroke-width="4"/><path d="M0 0l30 20M30 0L0 20" stroke="#C8102E" stroke-width="1.6"/><path d="M15 0v20M0 10h30" stroke="#fff" stroke-width="6"/><path d="M15 0v20M0 10h30" stroke="#C8102E" stroke-width="3.4"/>',
  it:'<rect width="10" height="20" fill="#009246"/><rect x="10" width="10" height="20" fill="#fff"/><rect x="20" width="10" height="20" fill="#CE2B37"/>',
  fr:'<rect width="10" height="20" fill="#0055A4"/><rect x="10" width="10" height="20" fill="#fff"/><rect x="20" width="10" height="20" fill="#EF4135"/>',
  de:'<rect width="30" height="7" fill="#000"/><rect y="6.6" width="30" height="6.8" fill="#DD0000"/><rect y="13.3" width="30" height="6.7" fill="#FFCE00"/>'
};
const bandera=l=>`<svg class="bandera" viewBox="0 0 30 20" aria-hidden="true">${BANDERAS[l]||""}</svg>`;
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
/* Imagen del producto: las de la carta vienen de assets/img; las que solo existen en Shift4, de su web */
const imgDe=(it,suf)=>!it.img?IMG+"ic-porcion.webp":/^https?:/.test(it.img)?it.img:IMG+it.img+suf+".webp";
function foto(it,small=true){
  return `<img src="${imgDe(it,small?"-s":"")}" alt="${esc(cap(nm(it.n).toLowerCase()))}"${it.t==="bebida"?' class="beb"':""} loading="lazy" decoding="async">`;
}
/* Tarjeta de pizza con el estilo de la carta impresa: media pizza sobre la etiqueta rosa */
/* Precio como en la carta impresa: pizzas "6,90€", bebidas "2,5€" */
const eurCarta=(v,corto)=>{const s=corto?String(+v.toFixed(2)):v.toFixed(2);return (LANG==="en"?s:s.replace(".",","))+"€";};
/* Iconos de alérgenos (los de la carta impresa: gluten, lácteos, pescado, frutos de cáscara).
   Los datos están en ALERG (js/legal.js); cada icono lleva su nombre para lectores de pantalla. */
const ALG_ICO={
  gluten:'<path d="M12 22V10.5"/><path d="M12 10.5c-.2-2.6 1.2-4.6 3.6-5.5.3 2.6-1.1 4.7-3.6 5.5zM12 10.5c.2-2.6-1.2-4.6-3.6-5.5-.3 2.6 1.1 4.7 3.6 5.5zM12 15.5c-.2-2.6 1.2-4.6 3.6-5.5.3 2.6-1.1 4.7-3.6 5.5zM12 15.5c.2-2.6-1.2-4.6-3.6-5.5-.3 2.6 1.1 4.7 3.6 5.5zM12 20.5c-.2-2.6 1.2-4.6 3.6-5.5.3 2.6-1.1 4.7-3.6 5.5zM12 20.5c.2-2.6-1.2-4.6-3.6-5.5-.3 2.6 1.1 4.7 3.6 5.5zM12 5.6c-1-1-1-2.6 0-3.6 1 1 1 2.6 0 3.6z"/>',
  leche:'<path d="M3.5 16.5L15 7l5.5 3.2v6.3z"/><path d="M3.5 16.5v3h17v-3"/><circle cx="9.5" cy="18" r="1" fill="currentColor" stroke="none"/><circle cx="15.5" cy="13.2" r="1.3" fill="currentColor" stroke="none"/><circle cx="12" cy="14.6" r=".8" fill="currentColor" stroke="none"/>',
  pescado:'<path d="M2.5 12c2.6-3.6 6.2-5 10-4.4 3 .5 5.2 2.2 6.5 4.4-1.3 2.2-3.5 3.9-6.5 4.4-3.8.6-7.4-.8-10-4.4z"/><path d="M19 12l2.5-3.2v6.4z"/><path d="M9.5 9.2c.8 1.8.8 3.8 0 5.6"/><circle cx="6.3" cy="11.2" r=".9" fill="currentColor" stroke="none"/>',
  "frutos de cáscara":'<path d="M12 3c3.9 2.3 6 6.2 6 10.2 0 4-2.7 7.3-6 7.3s-6-3.3-6-7.3C6 9.2 8.1 5.3 12 3z"/><path d="M12 6.5c-1.2 3.2-1.2 8.3 0 12.5"/>'
};
/* Cada icono va en una pastilla redonda rosa con el dibujo en vino, como los iconos de la app */
const algIco=a=>ALG_ICO[a]?`<span class="al-i" role="img" aria-label="${esc(alg(a))}" title="${esc(cap(alg(a)))}"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ALG_ICO[a]}</svg></span>`:"";
const algFila=it=>{const a=(ALERG[it.n]||[]).filter(x=>ALG_ICO[x]);return a.length?`<span class="al-fila">${a.map(algIco).join("")}</span>`:"";};
/* Leyenda al principio de la carta */
function leyendaAlerg(){
  return `<div class="al-ley"><b>${esc(t("al_ley"))}</b><ul>${Object.keys(ALG_ICO).map(a=>`<li>${algIco(a)}<span>${esc(cap(alg(a)))}</span></li>`).join("")}</ul><small>${esc(t("al_ley_p"))}</small><button type="button" class="al-btn" data-al-abrir>${esc(t("al_sec_h"))}</button></div>`;
}
/* Sección de alérgenos de la carta: cada producto con sus alérgenos (datos de ALERG, js/legal.js) */
function tablaAlerg(){
  const fila=it=>{const a=ALERG[it.n]||[];return `<tr><th scope="row">${esc(cap(nm(it.n).toLowerCase()))}</th><td>${a.length?`<span class="al-tl">${a.map(x=>`<span>${algIco(x)}${esc(cap(alg(x)))}</span>`).join("")}</span>`:esc(t("al_none"))}</td></tr>`;};
  return `<div class="al-sec"><h2 class="deco">${esc(t("al_sec_h"))}</h2><p>${esc(t("al_sec_p"))}</p>
    <table class="al-tabla"><thead><tr><th scope="col">${esc(t("al_prod"))}</th><th scope="col">${esc(t("al_ley"))}</th></tr></thead>
    <tbody>${P.filter(x=>!x.oculto).map(fila).join("")}</tbody></table>
    <small>${esc(t("al_ley_p"))}</small> <a href="#alergenos">${esc(t("aler_more"))}</a></div>`;
}
/* Ventana con la información de alérgenos (se abre desde el botón de la leyenda) */
function abrirAlerg(){$("alModalC").innerHTML=tablaAlerg();$("alModal").hidden=false;document.documentElement.classList.add("bloqueado");$("alModalX").focus();}
function cerrarAlerg(){$("alModal").hidden=true;document.documentElement.classList.remove("bloqueado");}
document.addEventListener("click",e=>{if(e.target.closest("[data-al-abrir]")){e.preventDefault();abrirAlerg();}else if(e.target.id==="alModal")cerrarAlerg();});
document.addEventListener("keydown",e=>{if(e.key==="Escape"&&!$("alModal").hidden)cerrarAlerg();});
/* Texto de la etiqueta del producto (top ventas, fresca, novedad) */
const tagTxt=b=>t({top:"tag_top",fresh:"tag_fresh",nuevo:"tag_new"}[b]||"tag_top");
function pizzaCarta(it){
  const n=nm(it.n);
  return `<div class="pz" role="button" tabindex="0" data-prod="${it.i}" data-pi="${it.i}" aria-label="${esc(n)}, ${eur(it.p)}">
    <div class="pz-img"><img src="${imgDe(it,"-m")}" alt="${esc(cap(n.toLowerCase()))}" loading="lazy" decoding="async" width="520" height="278"></div>
    <div class="pz-pill"><h3>${esc(n)}</h3><span class="pz-precio">${eurCarta(it.p)}</span></div>
    <p>${esc(desc(it))}</p>
    ${algFila(it)}
    ${it.badge?`<span class="tag">${tagTxt(it.badge)}</span>`:""}
    <button type="button" class="mas" data-add="${it.i}" aria-label="${esc(t("quick_add",{n}))}">${ICO.mas}</button>
  </div>`;
}
/* Bebida: foto, nombre con puntos y precio, como en la carta */
function bebidaCarta(it){
  const n=nm(it.n);
  return `<li class="bb" data-pi="${it.i}"><button type="button" class="bb-t" data-prod="${it.i}"><span class="bb-f"><img src="${imgDe(it,"-s")}" alt="" loading="lazy" decoding="async"></span><span class="bn">${esc(n)}</span><span class="pts" aria-hidden="true"></span><span class="bp">${eurCarta(it.p,true)}</span></button>
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
  // Pedidos web: las franjas de la tienda de Shift4 del local, si están cargadas
  const f=PEDIDOS_WEB&&TPV.franjasGuardadas(l);
  if(f&&f.length)return f.map(x=>({...x,t:x.v==="asap"?t("asap",{h:hhmm(x.m)}):(x.off===0?t("today")+" ":x.off===1?t("tomorrow")+" ":cap(DIAS[(hoyIdx()+x.off)%7])+" ")+hhmm(x.m)}));
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
try{const g=JSON.parse(localStorage.getItem("pizzi-carro-v2")||"[]");if(Array.isArray(g))S.carro=g.filter(c=>c&&porNombre(c.n)&&c.q>0).map(c=>{const it=porNombre(c.n);const mods=Array.isArray(c.mods)?c.mods:[];return{k:c.k,i:it.i,n:it.n,q:c.q,u:it.p+mods.reduce((a,x)=>a+(x.p||0),0),nota:c.nota||"",mods};});}catch(e){}
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
  const cambia=S.local!==i;
  S.local=i;S.perfil.local=LOCALES[i].id;guardarPerfil();asegurarHora();
  if(cambia)cargarCartaTPV(LOCALES[i]);
}

/* ---------- Carta real del TPV (solo pedidos web) ----------
   Pone a cada producto de la carta el precio y el código que tiene en la tienda de Shift4 del local,
   oculta lo que ese local no vende y añade lo que solo existe allí. Sin tienda, o si Shift4 no
   responde, se queda la carta de js/data.js. */
P.forEach(x=>{x.p0=x.p;});
const norm=s=>String(s).normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase().replace(/\bde\b/g,"").replace(/[^a-z0-9]/g,"");
let cartaTPV=null,cargaTPV=0,cartaLista=null;  // cartaLista: último local cuya carga terminó (bien o mal)
async function cargarCartaTPV(l){
  if(!PEDIDOS_WEB)return;
  const n=++cargaTPV;let c=null;
  try{c=l&&await TPV.carta(l);}catch(e){c=null;}
  if(n!==cargaTPV)return;  // mientras tanto se eligió otro local
  for(let k=P.length-1;k>=0;k--)if(P[k].extra)P.splice(k,1);
  P.forEach(x=>{x.p=x.p0;x.oculto=false;delete x.ref;});
  if(c){
    const libres=Object.values(c.items);
    P.forEach(x=>{
      const nx=norm(x.n);
      let k=libres.findIndex(y=>norm(y.nombre)===nx);
      if(k<0)k=libres.findIndex(y=>{const ny=norm(y.nombre);return nx.startsWith(ny)||ny.startsWith(nx);});
      if(k<0){x.oculto=true;return;}
      const y=libres.splice(k,1)[0];x.p=y.precio;x.ref=y.ref;x.oculto=y.agotado;
    });
    libres.filter(y=>!y.agotado).forEach(y=>{
      const cat=c.cats.find(k=>k.items.includes(y.ref)),beb=cat&&/bebida|cerveza|refresco|drink/i.test(cat.nombre);
      P.push({i:P.length,n:y.nombre.toUpperCase(),t:beb?"bebida":"pizza",es:y.desc,en:y.desc,p:y.precio,p0:y.precio,badge:"",img:y.img,ref:y.ref,extra:true});
    });
  }
  cartaTPV=c?l.id:null;cartaLista=l?l.id:null;
  S.carro=S.carro.filter(x=>P[x.i]&&P[x.i].n===x.n&&!P[x.i].oculto);
  S.carro.forEach(x=>{x.u=P[x.i].p+precioMods(x.mods);});
  if(c)try{await TPV.franjas(l);}catch(e){}
  asegurarHora();refrescar();actCarro();
  document.dispatchEvent(new Event("pizzi:carta"));
}

/* ---------- Carrito ---------- */
const total=()=>S.carro.reduce((a,c)=>a+c.u*c.q,0);
const nItems=()=>S.carro.reduce((a,c)=>a+c.q,0);
/* mods: extras elegidos en la ficha ([{ref,set,n,p}] con p en €); suben el precio por unidad */
const precioMods=m=>(m||[]).reduce((a,x)=>a+(x.p||0),0);
function sumar(i,q,nota,mods){
  const it=P[i];nota=(nota||"").trim();mods=mods||[];
  const k=it.n+"|"+nota+"|"+mods.map(x=>x.ref).sort().join(","),ya=S.carro.find(c=>c.k===k);
  if(ya)ya.q+=q;else S.carro.push({k,i,n:it.n,q,u:it.p+precioMods(mods),nota,mods});
}
function addCarro(i,q=1,nota="",mods){sumar(i,q,nota,mods);actCarro(true);toast(t("added"));}
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
  document.dispatchEvent(new Event("pizzi:carro"));
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
  $("topList").innerHTML=TOP.map(porNombre).filter(x=>x&&!x.oculto).map(pizzaCarta).join("");
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
          :`<a class="btn btn-vino" href="${telDe(l)}">${t("call_order")}</a>`}
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
      ${tipo==="pizza"?leyendaAlerg():""}
      ${tipo==="pizza"?`<div class="carta-pz">${P.filter(x=>x.t===tipo&&!x.oculto).map(pizzaCarta).join("")}</div>`
        :`<ul class="bebidas">${P.filter(x=>x.t===tipo&&!x.oculto).map(bebidaCarta).join("")}</ul>`}
    </section>`).join("");
  marcarEnCarro();
  pintarAvisoCarta();
}
/* Locales sin tienda SkyTab todavía: se pide por teléfono */
const telDe=l=>"tel:"+l.tel.replace(/\s/g,"");
function pintarAvisoCarta(){
  const l=localSel(),av=$("avisoCarta");
  if(l&&!l.pedidoUrl&&!PEDIDOS_WEB){av.hidden=false;av.innerHTML=`<p>${t("call_note",{n:esc(l.n)})}</p><a class="btn btn-blanco" href="${telDe(l)}">${t("call_order")}</a>`;}
  else if(l&&l.pedidoUrl){av.hidden=false;av.innerHTML=`<p>${t("online_note",{n:esc(l.n)})}</p><a class="btn btn-blanco" href="${l.pedidoUrl}" target="_blank" rel="noopener">${t("go_pay")}</a>`;}
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
  const beb=P.filter(x=>x.t==="bebida"&&!x.oculto&&!S.carro.some(c=>c.i===x.i));
  $("upsell").hidden=!beb.length||!S.carro.some(c=>P[c.i].t==="pizza");
  $("upsellList").innerHTML=beb.map(it=>`<button type="button" class="up" data-add="${it.i}" aria-label="${esc(t("quick_add",{n:nm(it.n)}))}">${foto(it)}<b>${esc(nm(it.n))}</b><span>${eur(it.p)}</span><span class="mas" aria-hidden="true">${ICO.mas}</span></button>`).join("");
  $("coLocal").textContent=l?"Pizzi "+l.n:t("pick_store");
  $("coLocal").classList.toggle("vacio",!l);
  $("coLocalE").textContent=l?l.d:"";$("coLocalE").hidden=!l;
  $("coHora").textContent=l?horaCorta(l,S.hora):t("first_store");
  $("coTot").textContent=eur(total());$("confTot").textContent=eur(total());
  // Local con tienda online propia
  // Sin pedidos web: con SkyTab se paga en su tienda; sin SkyTab, se pide llamando al local (ya no por WhatsApp)
  const online=!PEDIDOS_WEB&&!!l;
  $("avisoOnline").hidden=!online;$("bloqueAcepto").hidden=online;$("ctaConfirmar").hidden=online;$("waNota").hidden=online;$("cajaDatos").hidden=online;
  if(online){
    const sky=!!l.pedidoUrl,a=$("irOnline");
    a.href=sky?l.pedidoUrl:telDe(l);a.textContent=t(sky?"go_pay":"call_order");
    if(sky){a.target="_blank";}else a.removeAttribute("target");
    $("avisoTxt").innerHTML=t(sky?"online_note":"call_note",{n:esc(l.n)});
  }
  $("privFirst").textContent=t("priv_first",{r:EMPRESA.razon});
  if(PEDIDOS_WEB){$("waNota").hidden=true;$("pagoT").textContent=t("pay_web");$("pagoP").textContent=t("pay_web_p");}
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
  if(PEDIDOS_WEB){enviarWeb($("confirmar"),()=>errorEn("eDatos",t("app_err_send")));return;}
  pintarHecho();
  window.open(S.pedido.wa,"_blank","noopener");
  location.hash="hecho";S.carro=[];actCarro();
};
/* Pedido web: lo envía el conector (js/conector.js) y se pasa al seguimiento.
   Lo usan el escritorio y la app móvil. */
async function enviarWeb(boton,alFallar,destino="hecho"){
  const o=S.pedido,txt=boton.innerHTML;
  boton.disabled=true;boton.innerHTML=`<span>${esc(t("app_sending"))}</span>`;
  try{
    const s=slots(o.local).find(x=>x.v===o.horaVal)||{v:o.horaVal};
    const r=await TPV.enviar({local:o.local,items:o.items.map(c=>({ref:P[c.i]&&P[c.i].ref,n:c.n,q:c.q,u:c.u,nota:c.nota,mods:c.mods||[]})),
      alergias:o.alergias||[],comentario:o.comentario||"",
      hora:s,tipo:o.tipo||"recoger",cliente:{nom:o.nom,tel:o.tel,email:o.email},total:o.total});
    o.web=true;o.num=r.ref;o.demo=r.demo;
    pintarHecho();location.hash=destino;S.carro=[];actCarro();
  }catch(e){alFallar(e);}
  finally{boton.disabled=false;boton.innerHTML=txt;}
}

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
  document.querySelector("#v-hecho .ok-paso").hidden=!!o.web;
  $("okEstado").hidden=!o.web;
  if(o.web)pintarEstadoWeb($("okEstado"),o);
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

/* Seguimiento del pedido web: recibido → en el horno → listo para recoger */
function pintarEstadoWeb(el,o){
  const e=TPV.estado(o.num)||{paso:0},pasos=["st_0","st_1","st_2"];
  el.innerHTML=`${o.demo?`<p class="demo-sello">${esc(t("app_demo_badge"))}</p>`:""}
    <ol class="pasos-e">${pasos.map((k,n)=>`<li class="${n<e.paso?"hecho":n===e.paso?"ahora":""}"><span class="pe-p"></span><b>${esc(t(k))}</b>${n===e.paso?`<small>${esc(t(k+"p"))}</small>`:""}</li>`).join("")}</ol>`;
}
setInterval(()=>{if(S.pedido&&S.pedido.web){if(VISTA==="hecho"&&!$("okEstado").hidden)pintarEstadoWeb($("okEstado"),S.pedido);document.dispatchEvent(new Event("pizzi:estado"));}},4000);

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
  $("langCode").innerHTML=bandera(LANG);
  langList.innerHTML=LANGS.map(l=>`<li><button type="button" role="option" aria-selected="${l===LANG}" data-l="${l}">${bandera(l)}<span>${LNAME[l]}</span></button></li>`).join("");
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
if(PEDIDOS_WEB)$("demo").textContent=t("demo_web");
asegurarHora();
aplicarIdioma();pintarPie();ir();actCarro();
if(S.local!==null)cargarCartaTPV(LOCALES[S.local]);
/* Las franjas de recogida del TPV se renuevan cada minuto */
setInterval(()=>{const l=localSel();if(PEDIDOS_WEB&&l&&TPV.refDe(l))TPV.franjas(l).then(()=>{asegurarHora();refrescarCab();}).catch(()=>{});},60000);
/* Cada minuto actualiza solo lo que depende de la hora (abierto/cerrado, franjas), sin repintar la carta */
let firmaHora="";
const firma=()=>LOCALES.map(l=>abierto(l)+"|"+hrTexto(l)).join()+"|"+horaCorta(localSel(),S.hora)+"|"+t(ahora()<720&&ahora()>=360?"hi_m":ahora()<1230&&ahora()>=720?"hi_a":"hi_n");
setInterval(()=>{if(hoja)return;const f=firma();if(f===firmaHora)return;firmaHora=f;refrescarCab();
  if(VISTA==="inicio")pintarInicio();else if(VISTA==="carta")pintarAvisoCarta();else if(VISTA==="locales")pintarLocales();else if(VISTA==="pedido")pintarPedido();},60000);

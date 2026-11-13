/* =========================================================
   PIZZI · Conector con el TPV (Shift4 Dine / SkyTab)
   Es la única pieza que habla con Shift4. La web (escritorio y app móvil) solo usa TPV.*,
   así que el día que Shift4 dé acceso a su API oficial (Marketplace API) solo cambia este archivo.

   Qué hace hoy:
   - Carta y franjas: las lee de la tienda online de Shift4 de cada local (si la tiene) a través
     del puente /api/skytab (functions/api/skytab). Así los precios, los productos y las horas de
     recogida son los mismos que en el TPV. Sin tienda, o si Shift4 no responde, usa js/data.js.
   - Envío del pedido: según CONFIG.conector.envio
       "demo"   → simula el pedido y su estado (no llega a ningún local ni se cobra).
       "shift4" → pendiente de la certificación con Shift4 (ver enviarShift4 más abajo).

   Pedidos web (PEDIDOS_WEB): el nuevo flujo de pedido solo se activa en pruebas, para que nadie
   pida de verdad por un canal que aún no llega al local:
   - en cualquier dirección que no sea la publicada (localhost, vistas previas de Cloudflare…),
   - o abriendo la web con ?pedidos=web (se recuerda en este dispositivo; ?pedidos=off lo quita),
   - o poniendo CONFIG.conector.pedidosWeb = true.
   ========================================================= */
"use strict";

const PEDIDOS_WEB=(()=>{
  try{
    const q=new URLSearchParams(location.search).get("pedidos");
    if(q==="web")localStorage.setItem("pizzi-pedidos-web","1");
    if(q==="off")localStorage.removeItem("pizzi-pedidos-web");
    if(localStorage.getItem("pizzi-pedidos-web")==="1")return true;
  }catch(e){}
  return !!(CONFIG.conector&&CONFIG.conector.pedidosWeb)||!CONFIG.conector.dominios.includes(location.hostname);
})();

const TPV=(()=>{
  const API="/api/skytab";
  const cache={};          // por local: {carta, franjas, t}
  const VIGENCIA=5*60e3;   // la carta se vuelve a pedir pasados 5 min

  /* Código de la tienda online del local: lo último de su enlace online.skytab.com */
  const refDe=l=>{const m=l&&l.pedidoUrl&&l.pedidoUrl.match(/online\.skytab\.com\/([0-9a-f]{32})/);return m?m[1]:null;};

  async function pedir(ruta){
    const ctl=new AbortController(),to=setTimeout(()=>ctl.abort(),8000);
    try{const r=await fetch(API+ruta,{signal:ctl.signal});if(!r.ok)throw new Error(r.status);return await r.json();}
    finally{clearTimeout(to);}
  }

  /* ---------- Carta ----------
     Devuelve {schedule, cats:[{nombre, items:[ref]}], items:{ref:{ref,nombre,desc,precio(€),img,agotado}}} o null */
  async function carta(l){
    const ref=refDe(l);if(!ref)return null;
    const c=cache[ref]||(cache[ref]={});
    if(c.carta&&Date.now()-c.t<VIGENCIA)return c.carta;
    const tienda=(await pedir("/tienda/"+ref)).location;
    const sch=tienda.menuSchedules&&tienda.menuSchedules[0];if(!sch)return null;
    const [cats,its]=await Promise.all([pedir(`/carta/${ref}/${sch.ref}/categorias`),pedir(`/carta/${ref}/${sch.ref}/productos`)]);
    const items={};
    its.items.forEach(x=>{items[x.ref]={ref:x.ref,nombre:x.name,desc:x.description||"",precio:x.price/100,img:x.imageUrl800x800||"",agotado:x.stockStatus==="OUT_OF_STOCK"};});
    c.carta={schedule:sch.ref,orderType:(tienda.orderTypes.find(o=>o.ref==="TAKEOUT")||tienda.orderTypes[0]||{}).ref,
      cats:cats.categories.map(k=>({nombre:k.name,items:k.items.filter(r=>items[r])})),items};
    c.t=Date.now();
    return c.carta;
  }

  /* ---------- Extras de un producto ----------
     Grupos de opciones (modifierSets) de la tienda de Shift4: [{ref,nombre,min,max,obligatorio,ops:[{ref,nombre,precio(€)}]}].
     Se piden al abrir la ficha; un producto sin extras devuelve []. */
  async function extras(l,refProd){
    const ref=refDe(l);if(!ref||!refProd)return [];
    const c=cache[ref]||(cache[ref]={});c.extras=c.extras||{};
    if(c.extras[refProd])return c.extras[refProd];
    const it=(await pedir(`/producto/${ref}/${refProd}`)).item||{};
    const sets=(it.modifierSets||[]).map(s=>{
      const min=+(s.minModifiersPerSet??s.min??0)||0,max=+(s.maxModifiersPerSet??s.max??0)||0;
      return{ref:s.ref||s.id,nombre:s.name||"",min,max:s.oneOnly?1:max,obligatorio:!!s.isRequired||min>0,
        ops:(s.modifiers||s.items||[]).filter(m=>m&&(m.ref||m.id)).map(m=>({ref:m.ref||m.id,nombre:m.name||"",precio:(+m.price||0)/100}))};
    }).filter(s=>s.ops.length);
    return c.extras[refProd]=sets;
  }

  /* ---------- Franjas de recogida ----------
     Las de Shift4 vienen en hora UTC; se pasan al formato de la web: {v:"asap"|"día|minuto", off, m} */
  const enMadrid=iso=>{
    const p=Object.fromEntries(new Intl.DateTimeFormat("en-GB",{timeZone:"Europe/Madrid",year:"numeric",month:"2-digit",day:"2-digit",hour:"2-digit",minute:"2-digit",hourCycle:"h23"}).formatToParts(new Date(iso)).map(x=>[x.type,x.value]));
    return{dia:Date.UTC(+p.year,+p.month-1,+p.day),m:+p.hour*60+ +p.minute};
  };
  async function franjas(l){
    const ref=refDe(l);if(!ref)return null;
    const r=await pedir("/franjas/"+ref),hoy=enMadrid(new Date().toISOString()).dia,out=[];
    if(r.asapTimeSlot&&r.asapTimeSlot.isAvailable){const e=enMadrid(r.asapTimeSlot.expectedTime);out.push({v:"asap",off:0,m:e.m,iso:r.asapTimeSlot.expectedTime});}
    (r.futureTimeSlots||[]).filter(s=>s.isAvailable).forEach(s=>{const e=enMadrid(s.expectedTime),off=Math.round((e.dia-hoy)/864e5);out.push({v:off+"|"+e.m,off,m:e.m,iso:s.expectedTime});});
    const c=cache[ref]||(cache[ref]={});c.franjas=out;c.tf=Date.now();
    return out;
  }
  /* Franjas ya cargadas (para usarlas sin esperar); caducan a los 2 min */
  const franjasGuardadas=l=>{const c=cache[refDe(l)];return c&&c.franjas&&Date.now()-c.tf<120e3?c.franjas:null;};

  /* ---------- Envío del pedido ----------
     pedido: {local, items:[{ref,n,q,u,nota,mods}], hora:{v,iso}, alergias:[...], comentario, cliente:{nom,tel,email}, total} */
  const GUARDA="pizzi-pedidos-web";
  const leer=()=>{try{return JSON.parse(localStorage.getItem(GUARDA)||"{}")||{};}catch(e){return{};}};
  const escribir=o=>{try{localStorage.setItem(GUARDA,JSON.stringify(o));}catch(e){}};

  async function enviar(pedido){
    const modo=CONFIG.conector.envio;
    if(modo==="shift4")return enviarShift4(pedido);
    // Demo: se guarda en el dispositivo y el estado avanza solo
    await new Promise(r=>setTimeout(r,900));
    const ref="PZ-"+Math.floor(1000+Math.random()*9000),todos=leer();
    todos[ref]={creado:Date.now(),local:pedido.local.id,total:pedido.total,demo:true};
    escribir(todos);
    return{ref,demo:true};
  }

  /* Estado: 0 recibido · 1 en el horno · 2 listo para recoger
     En demo avanza a los 20 s y a los 60 s para poder enseñarlo. */
  function estado(ref){
    const p=leer()[ref];if(!p)return null;
    const s=(Date.now()-p.creado)/1000;
    return{paso:s<20?0:s<60?1:2,demo:p.demo};
  }

  /* Pedido con el formato de la tienda online de Shift4 (artículos por su código, cantidades,
     notas para cocina, carta, tipo de pedido y hora). Es lo que habrá que mandar al TPV. */
  async function formatoShift4(pedido){
    const c=await carta(pedido.local);if(!c)throw new Error("El local no tiene carta en Shift4");
    return{menuScheduleRef:c.schedule,orderTypeRef:c.orderType,
      expectedTime:pedido.hora.v==="asap"?null:pedido.hora.iso,
      items:pedido.items.map(x=>({ref:x.ref,quantity:x.q,instructions:x.nota||null,modifiers:(x.mods||[]).map(m=>({modifierSetRef:m.set,modifierRef:m.ref,quantity:1}))})),
      // Alergias y comentario van como petición especial del pedido, delante para que cocina las vea
      tips:pedido.propina?Math.round(pedido.propina*100):0,
      specialRequest:[(pedido.alergias||[]).length?"ALERGIAS: "+pedido.alergias.join(", "):"",pedido.comentario||""].filter(Boolean).join(" · ")||null,
      customer:{name:pedido.cliente.nom,phone:pedido.cliente.tel,email:pedido.cliente.email||null}};
  }
  /* Pendiente: cuando Shift4 certifique la integración (Marketplace API), aquí se llama al servidor
     de Pizzi, que cobra con Shift4 y crea el pedido pagado en el TPV del local con su token. */
  async function enviarShift4(pedido){
    await formatoShift4(pedido);
    throw new Error("La conexión directa con Shift4 está pendiente de su aprobación.");
  }

  return{refDe,carta,extras,franjas,franjasGuardadas,enviar,estado,formatoShift4};
})();

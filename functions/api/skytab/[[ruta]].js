/* =========================================================
   PIZZI · Puente de solo lectura con la tienda online de Shift4 (SkyTab / Shift4 Dine)
   Cloudflare Pages Function: responde en /api/skytab/...

   La web no puede leer directamente la carta de la tienda de Shift4 (su servidor no lo permite
   desde otros dominios), así que este puente la pide y la devuelve. Solo admite estas rutas
   de LECTURA; no crea pedidos ni toca pagos:

     /api/skytab/tienda/{local}                      → datos del local (horario, carta activa…)
     /api/skytab/carta/{local}/{carta}/categorias    → categorías de la carta
     /api/skytab/carta/{local}/{carta}/productos     → productos con precio e imagen
     /api/skytab/producto/{local}/{producto}         → un producto con sus extras (modifierSets)
     /api/skytab/franjas/{local}                     → franjas de recogida disponibles

   {local} es el código de la tienda online de cada local (lo último de su enlace online.skytab.com).
   ========================================================= */

const MARS = "https://apps-api.shift4payments.com/online-ordering/mars/api";
const OLO = "https://oloapi.shift4payments.com/api";
const REF = /^[0-9a-f]{32}$/;
const UUID = /^[0-9a-f-]{36}$/;

/* Ruta pedida → [dirección en Shift4, segundos de caché] */
function destino(p) {
  const [tipo, a, b, c] = p;
  if (tipo === "tienda" && REF.test(a) && p.length === 2) return [`${MARS}/v2/stores/${a}`, 300];
  if (tipo === "carta" && REF.test(a) && UUID.test(b) && p.length === 4) {
    if (c === "categorias") return [`${OLO}/v2/public/${a}/menu/${b}/categories`, 300];
    if (c === "productos") return [`${OLO}/v2/public/${a}/menu/${b}/items`, 300];
  }
  if (tipo === "producto" && REF.test(a) && UUID.test(b) && p.length === 3) return [`${OLO}/v2/public/${a}/menu/item/${b}`, 300];
  if (tipo === "franjas" && REF.test(a) && p.length === 2) return [`${MARS}/v3/${a}/availability/time-slots?orderType=TAKEOUT`, 0];
  return null;
}

const json = (cuerpo, estado, extra = {}) => new Response(JSON.stringify(cuerpo), {
  status: estado,
  headers: { "content-type": "application/json; charset=utf-8", "access-control-allow-origin": "*", ...extra }
});

export async function onRequestGet({ params }) {
  const p = [].concat(params.ruta || []);
  const d = destino(p);
  if (!d) return json({ error: "ruta no admitida" }, 404);
  const [url, cache] = d;
  try {
    const r = await fetch(url, { headers: { accept: "application/json" }, cf: { cacheTtl: cache, cacheEverything: cache > 0 } });
    const cuerpo = await r.text();
    return new Response(cuerpo, {
      status: r.status,
      headers: {
        "content-type": "application/json; charset=utf-8",
        "access-control-allow-origin": "*",
        "cache-control": cache ? `public, max-age=${cache}` : "no-store"
      }
    });
  } catch (e) {
    return json({ error: "Shift4 no responde" }, 502);
  }
}

export const onRequest = ({ request }) => request.method === "OPTIONS"
  ? new Response(null, { status: 204, headers: { "access-control-allow-origin": "*", "access-control-allow-methods": "GET" } })
  : json({ error: "solo lectura" }, 405);

/* Para pruebas */
export { destino };

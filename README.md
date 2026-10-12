# PIZZI · App web de pedidos para recoger

Web principal de Pizzi (Valencia) diseñada por **LE STUDIO**. Funciona como una app (al estilo de Honest Greens): pestañas abajo en el móvil, hojas que suben desde abajo, carrito siempre a mano y un flujo corto pensado para convertir.
Es una web estática: no necesita servidor ni base de datos (GitHub Pages, Cloudflare Pages…).

## Flujo

1. **Inicio**: saludo, el eslogan de la caja («Llévame a casa que estoy caliente») y una tarjeta con **Dónde** (local) y **Cuándo** (hora) + botón *Empezar pedido*. Debajo: *Repite tu último pedido*, *Las más pedidas* con botón **+** para añadir sin abrir la ficha, *Así de fácil* y los locales con su estado en tiempo real.
2. **Selector de local y hora** (hoja inferior): locales con foto, estado abierto/cerrado y franjas de 15 min. Si el local está cerrado se programa el pedido.
3. **Carta**: barra fija con el local y la hora, pestañas de categorías que siguen el scroll, tarjetas con **+** rápido. En escritorio, el pedido se ve siempre en un panel lateral.
4. **Ficha de producto**: foto grande, descripción, alérgenos, notas para cocina y cantidad.
5. **Pedido**: líneas editables, sugerencia de bebidas, recogida, datos (se pueden recordar en el dispositivo), pago en el local y botón fijo *Confirmar pedido · total*.
6. **Confirmación**: abre WhatsApp con la comanda para el local, muestra el ticket y permite *Cómo llegar*, *Llamar* y *Añadir al calendario*.

Los locales con `pedidoUrl` (Peris y Valero) envían al cliente a su tienda online para pedir y pagar.
Idiomas: español, inglés, italiano, francés y alemán. Se puede instalar en la pantalla de inicio (manifest).

## Identidad

- Colores: vino `#97031E` y rosa `#E2B0AF`, más el damero de la caja.
- Tipografías (alojadas en `fonts/`, sin llamadas a terceros): **Federant** para titulares (Art Déco, como la carta) y **Barlow Condensed / Barlow** para textos, precios y botones.

## Archivos

| Ruta | Qué contiene |
| --- | --- |
| `index.html` | Estructura de la app |
| `css/app.css` | Diseño (variables de color al principio) |
| `css/fonts.css`, `fonts/` | Tipografías |
| `js/data.js` | **CONFIG, LOCALES, carta (`P`), destacadas (`TOP`) y categorías** |
| `js/i18n.js` | Textos en 5 idiomas |
| `js/legal.js` | Datos de empresa, alérgenos y páginas legales |
| `js/app.js` | Lógica (navegación, carrito, horarios, WhatsApp) |
| `assets/img/` | Imágenes optimizadas para web (`-s` = miniatura) |
| `assets/` | Originales en alta |

## Configurar los datos reales (`js/data.js`)

- **`CONFIG`**: `demo:false` quita la cinta de demo. `whatsappDemo` es el número de prueba.
- **`LOCALES`**: dirección (`d`), teléfono (`tel`), Google Maps (`maps`), horario (`h`, de lunes a domingo; `24:00` = medianoche, `25:00` = 1:00), `whatsapp` en formato internacional sin `+` (ej. `34612345678`) y `pedidoUrl` si el local cobra online.
- **Carta `P`**: nombre, tipo, descripciones, precio, etiqueta (`top` o `fresh`) e imagen.
- Mientras un local no tenga su `whatsapp`, los pedidos llegan a `CONFIG.whatsappDemo`.
- Datos legales y tabla de alérgenos: `EMPRESA` y `ALERG` en `js/legal.js` (lo que empieza por `[` sale resaltado hasta rellenarlo).

## Probarla en local

```bash
python3 -m http.server 8000
# abre http://localhost:8000
```

## Pendiente para la versión final

- WhatsApp de pedidos de cada local.
- Datos de empresa y validación de la tabla de alérgenos.
- Envío 100 % automático (sin que el cliente pulse enviar en WhatsApp): requiere la API de WhatsApp Business o una herramienta de automatización.

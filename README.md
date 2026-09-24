[README.md](https://github.com/user-attachments/files/32615160/README.md)
# PIZZI · Web de pedidos para recoger (demo)

Propuesta de web diseñada por **Marcelo · Le Studio** para Pizzi, Valencia.
Es un único archivo (`index.html`) con todo incluido: diseño, fotos y lógica. No necesita servidor ni base de datos.

## Qué hace

1. **Inicio**: portada con la identidad de Pizzi y dos accesos, pedir o ver locales.
2. **Locales**: estado abierto/cerrado en tiempo real (hora de España), dirección, horario, enlace a Google Maps y botón *Pedir aquí* o *Programar pedido*.
3. **Carta**: pizzas y bebidas con extras, notas para cocina y cantidades. El pedido se guarda en el navegador si el cliente sale y vuelve.
4. **Datos**: local, hora de recogida (franjas de 15 min dentro del horario) y datos del cliente. Pago en el local.
5. **Confirmación**: abre WhatsApp con la comanda lista para enviar al local, muestra el resumen con el importe a pagar y permite añadir un recordatorio al calendario.

## Publicarla con GitHub Pages

1. Crea un repositorio nuevo en GitHub (por ejemplo `pizzi-web`).
2. Sube `index.html` y este `README.md` (botón **Add file → Upload files**).
3. Ve a **Settings → Pages**.
4. En **Source** elige **Deploy from a branch**, rama `main` y carpeta `/ (root)`. Guarda.
5. En uno o dos minutos la web estará en `https://TU-USUARIO.github.io/pizzi-web/`.

## Configurar los datos reales

Abre `index.html` y busca estas dos zonas dentro del `<script>`:

- **`CONFIG`**: `demo:false` quita la barra de "demo". `whatsappDemo` es el número de prueba.
- **`LOCALES`**: dirección (`d`), teléfono (`tel`), enlace de Google Maps (`maps`), horario semanal (`h`, de lunes a domingo, con uno o varios turnos por día; `24:00` es medianoche y `25:00` la 1:00) y `whatsapp` con el número del local en formato internacional sin `+` (ej. `34612345678`).
- **Modo prueba**: mientras un local no tenga su `whatsapp`, los pedidos llegan al número de `CONFIG.whatsappDemo`.

La carta y los precios están en la lista `P`, y los extras en `EXTRAS`.

## Pendiente para la versión final

- WhatsApp de pedidos de cada local.
- Fotos del resto de pizzas.
- Confirmar los extras y sus precios (solo la mozzarella vegana viene de la carta).
- Envío 100 % automático (sin que el cliente pulse enviar en WhatsApp): requiere la API de WhatsApp Business o una herramienta de automatización.

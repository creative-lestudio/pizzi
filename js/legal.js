/* PIZZI · Datos legales, alérgenos y páginas legales (aviso, privacidad, cookies, condiciones, alérgenos). */
/* ================= DATOS LEGALES (rellenar antes del lanzamiento) =================
   Todo lo que empiece por "[" se muestra resaltado en las páginas legales hasta que se sustituya. */
const EMPRESA={
  marca:"PIZZI",
  razon:"[RAZÓN SOCIAL DE PIZZI]",
  cif:"[CIF / NIF]",
  domicilio:"[DOMICILIO SOCIAL COMPLETO]",
  email:"[EMAIL DE CONTACTO]",
  tel:"+34 744 78 47 37",
  registro:"[DATOS DE INSCRIPCIÓN EN EL REGISTRO MERCANTIL: tomo, folio, hoja]",
  web:"[DOMINIO DE LA WEB]",
  actualizado:"7 de octubre de 2026",
  alergenosValidados:false   // pasar a true cuando Pizzi valide la tabla con las fichas de sus proveedores
};
const pv=x=>String(x).startsWith("[")?`<mark class="pend">${esc(x)}</mark>`:esc(x);
const PAGINAS=["aviso-legal","privacidad","cookies","condiciones","alergenos"];
const listaLocalesLegal=()=>`<ul>${LOCALES.map(l=>`<li><b>Pizzi ${esc(l.n)}</b> · ${esc(l.d)} · Tel. ${esc(l.tel)}</li>`).join("")}</ul>`;
const ALERG={
  "MARGHERITA":["gluten","leche"],
  "QUATTRO FORMAGGI":["gluten","leche"],
  "PEPPERONI":["gluten","leche"],
  "NAPOLI":["gluten","leche","pescado"],
  "TUNA":["gluten","leche","pescado"],
  "CAPRICCIOSA":["gluten","leche"],
  "PISTACHIOLA":["gluten","leche","frutos de cáscara"],
  "DI PARMA":["gluten","leche"],
  "TARTUFINA":["gluten","leche"],
  "ITALIANÍSIMA":["gluten","leche","frutos de cáscara"],
  "MONTESA":["gluten","leche"],
  "BARBACOA":["gluten","leche"],
  "REINA":["gluten","leche"],
  "COCA-COLA":[],"COCA-COLA ZERO":[],"FANTA NARANJA":[],"FANTA LIMÓN":[],
  "CERVEZA TURIA":["gluten"],"AGUA":[],"AGUA CON GAS":[]
};
const NOMES={"FANTA NARANJA":"Fanta naranja","FANTA LIMÓN":"Fanta limón","CERVEZA TURIA":"Cerveza Turia","AGUA":"Agua","AGUA CON GAS":"Agua con gas","COCA-COLA":"Coca-Cola","COCA-COLA ZERO":"Coca-Cola Zero"};
const nomLegal=n=>NOMES[n]||n.charAt(0)+n.slice(1).toLowerCase();
const DOCS={
"aviso-legal":()=>`
<h1>Aviso legal</h1>
<p class="upd">Última actualización: ${EMPRESA.actualizado}</p>
<h2>1. Datos identificativos del titular</h2>
<p>En cumplimiento del artículo 10 de la Ley 34/2002, de 11 de julio, de servicios de la sociedad de la información y de comercio electrónico (LSSI-CE), se informa de que el titular de este sitio web es:</p>
<ul>
<li><b>Denominación social:</b> ${pv(EMPRESA.razon)} (nombre comercial: ${EMPRESA.marca})</li>
<li><b>CIF/NIF:</b> ${pv(EMPRESA.cif)}</li>
<li><b>Domicilio social:</b> ${pv(EMPRESA.domicilio)}</li>
<li><b>Correo electrónico:</b> ${pv(EMPRESA.email)}</li>
<li><b>Teléfono:</b> ${pv(EMPRESA.tel)}</li>
<li><b>Datos registrales:</b> ${pv(EMPRESA.registro)}</li>
<li><b>Sitio web:</b> ${pv(EMPRESA.web)}</li>
</ul>
<h2>2. Actividad y establecimientos</h2>
<p>${EMPRESA.marca} se dedica a la elaboración y venta de pizza napolitana y bebidas para llevar, con recogida del pedido en alguno de sus establecimientos:</p>
${listaLocalesLegal()}
<h2>3. Objeto y condiciones de uso</h2>
<p>Este sitio web permite consultar la carta, los locales y sus horarios, y realizar pedidos para recoger. El acceso es gratuito. La persona usuaria se compromete a utilizar la web de forma lícita, de buena fe y conforme a este aviso legal, sin realizar actividades que puedan dañar, sobrecargar o inutilizar el sitio o impedir su normal funcionamiento.</p>
<h2>4. Propiedad intelectual e industrial</h2>
<p>La marca ${EMPRESA.marca}, el logotipo, los textos, fotografías, diseños y demás contenidos de esta web son titularidad de ${pv(EMPRESA.razon)} o se utilizan con la debida autorización, y están protegidos por la normativa de propiedad intelectual e industrial. Queda prohibida su reproducción, distribución, comunicación pública o transformación sin autorización previa y por escrito de su titular, salvo para uso personal y privado.</p>
<p>Diseño y desarrollo web: <a href="https://lestudio-crea.com" target="_blank" rel="noopener">LE STUDIO</a>.</p>
<h2>5. Responsabilidad</h2>
<p>El titular procura que la información de la web (carta, precios, horarios, direcciones) sea exacta y esté actualizada, pero no puede garantizar la ausencia total de errores ni la disponibilidad ininterrumpida del servicio, que puede verse afectado por tareas de mantenimiento o por causas ajenas. Los horarios y la disponibilidad de productos pueden variar en cada local; en caso de duda, contacta con el establecimiento.</p>
<h2>6. Enlaces a terceros</h2>
<p>La web contiene enlaces a servicios de terceros (Google Maps, WhatsApp, Instagram, TikTok y la tienda de pedidos online de Shift4 en el local que la tenga activada). Esos servicios se rigen por sus propios avisos legales y políticas de privacidad, y ${EMPRESA.marca} no se responsabiliza de su contenido ni de su funcionamiento.</p>
<h2>7. Protección de datos y cookies</h2>
<p>El tratamiento de datos personales se describe en la <a href="#privacidad">Política de privacidad</a> y el uso de almacenamiento en el dispositivo en la <a href="#cookies">Política de cookies</a>.</p>
<h2>8. Consumidores y reclamaciones</h2>
<p>Las condiciones de compra figuran en las <a href="#condiciones">Condiciones de venta</a>. Cada establecimiento dispone de hojas de reclamaciones a disposición de los consumidores. También puedes dirigir tu queja o reclamación a ${pv(EMPRESA.email)} o por teléfono al ${pv(EMPRESA.tel)}.</p>
<h2>9. Legislación aplicable y jurisdicción</h2>
<p>Este aviso legal se rige por la legislación española. Si eres consumidor, podrás acudir a los juzgados y tribunales que correspondan conforme a la normativa de consumidores; en los demás casos, las partes se someten a los juzgados y tribunales de la ciudad de Valencia, salvo que la ley establezca otro fuero imperativo.</p>`,

"privacidad":()=>`
<h1>Política de privacidad</h1>
<p class="upd">Última actualización: ${EMPRESA.actualizado}</p>
<p>En cumplimiento del Reglamento (UE) 2016/679 (RGPD) y de la Ley Orgánica 3/2018, de Protección de Datos Personales y garantía de los derechos digitales (LOPDGDD), te explicamos cómo tratamos tus datos personales cuando usas esta web y haces un pedido.</p>
<h2>1. Responsable del tratamiento</h2>
<ul>
<li><b>Responsable:</b> ${pv(EMPRESA.razon)} (${EMPRESA.marca}) · CIF/NIF ${pv(EMPRESA.cif)}</li>
<li><b>Domicilio:</b> ${pv(EMPRESA.domicilio)}</li>
<li><b>Contacto en materia de privacidad:</b> ${pv(EMPRESA.email)} · Tel. ${pv(EMPRESA.tel)}</li>
</ul>
<h2>2. Qué datos tratamos</h2>
<ul>
<li><b>Datos que nos facilitas al hacer un pedido:</b> nombre, número de teléfono (WhatsApp), local y hora de recogida, productos pedidos y notas para cocina.</li>
<li><b>Datos técnicos:</b> al visitar la web, el proveedor de alojamiento puede registrar datos técnicos mínimos de la conexión (como la dirección IP y la fecha y hora de acceso) por motivos de seguridad y funcionamiento.</li>
<li><b>Ubicación:</b> si pulsas «Encuentra tu Pizzi más cercano», tu navegador te pedirá permiso para conocer tu posición. Esa posición se utiliza únicamente en tu dispositivo para ordenar los locales por distancia; <b>no se envía a nuestros servidores ni se almacena</b>. Puedes retirar el permiso en cualquier momento desde los ajustes del navegador.</li>
<li><b>Datos de pago:</b> no recogemos ni almacenamos datos de tarjeta en esta web. Cuando el pago se realiza online (local con tienda de pedidos de Shift4), lo procesa directamente el proveedor de pagos.</li>
</ul>
<h2>3. Finalidades y base jurídica</h2>
<table>
<thead><tr><th>Finalidad</th><th>Base jurídica</th></tr></thead>
<tbody>
<tr><td>Gestionar tu pedido, prepararlo y comunicarnos contigo sobre él (por ejemplo, para confirmar la hora de recogida o avisarte de una incidencia).</td><td>Ejecución del contrato o de medidas precontractuales (art. 6.1.b RGPD).</td></tr>
<tr><td>Cumplir obligaciones fiscales, contables y de consumo.</td><td>Obligación legal (art. 6.1.c RGPD).</td></tr>
<tr><td>Atender consultas, quejas y reclamaciones y defender nuestros derechos.</td><td>Ejecución del contrato e interés legítimo (art. 6.1.b y 6.1.f RGPD).</td></tr>
<tr><td>Seguridad y correcto funcionamiento de la web.</td><td>Interés legítimo (art. 6.1.f RGPD).</td></tr>
<tr><td>Ordenar los locales según tu ubicación.</td><td>Tu consentimiento, otorgado en el navegador (art. 6.1.a RGPD).</td></tr>
</tbody></table>
<p>No elaboramos perfiles ni tomamos decisiones automatizadas con efectos jurídicos sobre ti, y no usamos tus datos para enviarte publicidad salvo que nos des tu consentimiento expreso para ello.</p>
<h2>4. Datos obligatorios</h2>
<p>Los datos marcados como necesarios en el formulario de pedido (nombre y teléfono) son imprescindibles para gestionarlo; si no los facilitas, no podremos tramitar el pedido.</p>
<h2>5. Plazo de conservación</h2>
<p>Conservaremos tus datos durante el tiempo necesario para gestionar el pedido y, después, debidamente bloqueados, durante los plazos de prescripción de las responsabilidades legales aplicables (con carácter general, hasta 6 años para la documentación mercantil y contable). Transcurridos dichos plazos, se suprimirán.</p>
<h2>6. Destinatarios y encargados del tratamiento</h2>
<p>Podemos comunicar o dar acceso a tus datos a:</p>
<ul>
<li><b>El establecimiento donde recoges el pedido</b>, que lo recibe a través de WhatsApp (servicio prestado por WhatsApp Ireland Ltd. / Meta). Al enviar el pedido, el mensaje se rige también por las condiciones y la política de privacidad de WhatsApp.</li>
<li><b>Shift4</b>, proveedor del terminal punto de venta y de la tienda de pedidos y pagos online de los locales que la tengan activada.</li>
<li><b>Proveedores de servicios</b> que nos prestan alojamiento web, desarrollo y mantenimiento técnico (como LE STUDIO), asesoría fiscal y contable, siempre con contrato de encargado del tratamiento conforme al artículo 28 del RGPD.</li>
<li><b>Administraciones públicas, jueces y tribunales</b> cuando exista una obligación legal.</li>
</ul>
<h2>7. Transferencias internacionales</h2>
<p>Algunos de los proveedores mencionados (por ejemplo WhatsApp/Meta o Shift4) pueden tratar datos fuera del Espacio Económico Europeo. En ese caso, la transferencia se ampara en una decisión de adecuación de la Comisión Europea, en cláusulas contractuales tipo u otras garantías adecuadas previstas en el RGPD.</p>
<h2>8. Tus derechos</h2>
<p>Puedes ejercer en cualquier momento los derechos de <b>acceso, rectificación, supresión, oposición, limitación del tratamiento y portabilidad</b>, así como retirar el consentimiento que hayas prestado, escribiendo a ${pv(EMPRESA.email)} e indicando el derecho que ejerces. Podemos pedirte que acredites tu identidad. Responderemos en el plazo máximo de un mes.</p>
<p>Si consideras que no hemos tratado tus datos conforme a la normativa, tienes derecho a presentar una reclamación ante la Agencia Española de Protección de Datos (<a href="https://www.aepd.es" target="_blank" rel="noopener">www.aepd.es</a>, C/ Jorge Juan, 6, 28001 Madrid).</p>
<h2>9. Menores de edad</h2>
<p>Este servicio está dirigido a personas mayores de edad. Si eres menor, pide a tu madre, padre o tutor que haga el pedido por ti. Los menores de 14 años no pueden facilitarnos datos personales sin el consentimiento de sus representantes legales.</p>
<h2>10. Seguridad</h2>
<p>Aplicamos medidas técnicas y organizativas adecuadas para proteger tus datos frente a accesos no autorizados, pérdida o alteración, entre ellas el uso de conexión cifrada (HTTPS) en la web.</p>
<h2>11. Cambios en esta política</h2>
<p>Podemos actualizar esta política para adaptarla a cambios legales o del servicio. La versión vigente es siempre la publicada en esta página, con su fecha de actualización.</p>`,

"cookies":()=>`
<h1>Política de cookies</h1>
<p class="upd">Última actualización: ${EMPRESA.actualizado}</p>
<p>Esta política se ofrece en cumplimiento del artículo 22.2 de la Ley 34/2002 (LSSI-CE) y de la normativa de protección de datos.</p>
<h2>1. Qué son las cookies y el almacenamiento local</h2>
<p>Las cookies y las tecnologías similares (como el almacenamiento local del navegador) son pequeños archivos o datos que un sitio web guarda en tu dispositivo para recordar información entre visitas.</p>
<h2>2. Qué usamos en esta web</h2>
<p>Esta web <b>no utiliza cookies de analítica, publicidad ni seguimiento, propias ni de terceros</b>. Únicamente usa el almacenamiento local de tu navegador para funciones técnicas que tú solicitas al usar la web, por lo que están exentas de consentimiento:</p>
<table>
<thead><tr><th>Nombre</th><th>Tipo</th><th>Finalidad</th><th>Duración</th></tr></thead>
<tbody>
<tr><td><code>pizzi-carro-v2</code></td><td>Propia · técnica (almacenamiento local)</td><td>Recordar los productos de tu carrito mientras haces el pedido.</td><td>Hasta que vacíes el carrito, completes el pedido o borres los datos del navegador.</td></tr>
<tr><td><code>pizzi-perfil</code></td><td>Propia · técnica (almacenamiento local)</td><td>Recordar el local elegido, tu último pedido para repetirlo y, solo si marcas «Recordar mis datos», tu nombre y teléfono para no volver a escribirlos. Se guarda únicamente en tu dispositivo.</td><td>Hasta que desmarques la opción o borres los datos del navegador.</td></tr>
<tr><td><code>pizzi-lang</code></td><td>Propia · personalización (almacenamiento local)</td><td>Recordar el idioma que has elegido.</td><td>Hasta que borres los datos del navegador.</td></tr>
</tbody></table>
<p>Las tipografías de la web están alojadas en la propia página, por lo que no se realizan conexiones a servidores de terceros al cargarla.</p>
<h2>3. Servicios de terceros enlazados</h2>
<p>Si pulsas en enlaces a Google Maps, WhatsApp, Instagram, TikTok o a la tienda de pedidos online de Shift4, saldrás de esta web y esos servicios podrán usar sus propias cookies conforme a sus políticas, sobre las que ${EMPRESA.marca} no tiene control.</p>
<h2>4. Cómo borrar o bloquear el almacenamiento</h2>
<p>Puedes eliminar o bloquear los datos almacenados desde los ajustes de tu navegador (Chrome, Firefox, Safari, Edge, etc.), en el apartado de privacidad o de datos de sitios. Si lo haces, se perderá tu carrito guardado y tu idioma preferido.</p>
<h2>5. Cambios</h2>
<p>Si en el futuro se incorporasen cookies no exentas (por ejemplo, de analítica), se te pedirá tu consentimiento previo y se actualizará esta política.</p>
<p>Más información sobre el tratamiento de tus datos en la <a href="#privacidad">Política de privacidad</a>.</p>`,

"condiciones":()=>`
<h1>Condiciones de venta</h1>
<p class="upd">Última actualización: ${EMPRESA.actualizado}</p>
<p>Estas condiciones regulan la compra a distancia de productos a través de esta web, conforme al Real Decreto Legislativo 1/2007 (Ley General para la Defensa de los Consumidores y Usuarios) y a la LSSI-CE. Al confirmar un pedido declaras haberlas leído y aceptado.</p>
<h2>1. Vendedor</h2>
<p>${pv(EMPRESA.razon)} (${EMPRESA.marca}), CIF/NIF ${pv(EMPRESA.cif)}, con domicilio en ${pv(EMPRESA.domicilio)}. Contacto: ${pv(EMPRESA.email)} · ${pv(EMPRESA.tel)}. Más datos en el <a href="#aviso-legal">Aviso legal</a>.</p>
<h2>2. Objeto</h2>
<p>Venta de pizzas y bebidas <b>para recoger en el local elegido</b>. No se ofrece servicio de entrega a domicilio. Los locales disponibles, sus direcciones y sus horarios se muestran en la web.</p>
<h2>3. Proceso de pedido</h2>
<ol>
<li>Elige el local, los productos y, si quieres, añade notas para cocina.</li>
<li>Indica el día y la hora de recogida (franjas de 15 minutos; puedes programar el pedido si el local está cerrado).</li>
<li>Introduce tu nombre y tu número de WhatsApp, acepta estas condiciones y confirma el pedido.</li>
<li>La web envía el pedido al local mediante WhatsApp. El pedido queda confirmado cuando el local lo recibe y lo acepta; si no puede atenderlo (falta de producto, cierre, saturación u otra causa), te lo comunicará lo antes posible al teléfono indicado.</li>
</ol>
<p>En los locales con tienda de pedidos online activada, el pedido y el pago se realizan en la tienda de Shift4 enlazada desde la web, con sus propias condiciones técnicas de uso.</p>
<p>Los datos del pedido se corrigen antes de confirmarlo desde el carrito. El contrato se formaliza en español.</p>
<h2>4. Precios</h2>
<p>Todos los precios están expresados en euros e incluyen el IVA. No hay gastos adicionales por la recogida. Los precios son los vigentes en el momento de hacer el pedido.</p>
<h2>5. Pago</h2>
<p>Con carácter general, el pago se realiza <b>en el local al recoger el pedido</b>, con los medios de pago que el establecimiento tenga habilitados. En los locales con pedido online, el pago se realiza en la tienda de Shift4 mediante tarjeta u otros medios que esta ofrezca; esta web no almacena datos de tarjeta.</p>
<h2>6. Recogida</h2>
<p>Debes recoger el pedido en el local elegido a la hora indicada. Los productos están pensados para consumirse recién hechos; si prevés un retraso, avisa al local por teléfono. El establecimiento podrá considerar cancelado el pedido que no se recoja pasado un tiempo razonable, sin perjuicio de los derechos que la ley te reconoce.</p>
<h2>7. Modificación y cancelación</h2>
<p>Puedes solicitar la modificación o cancelación de tu pedido llamando al local antes de que entre en preparación. Una vez elaborado, no será posible cancelarlo.</p>
<h2>8. Derecho de desistimiento</h2>
<p>De acuerdo con el artículo 103 del Real Decreto Legislativo 1/2007, <b>no existe derecho de desistimiento</b> en el suministro de bienes confeccionados conforme a las especificaciones del consumidor o claramente personalizados, ni en el de bienes que puedan deteriorarse o caducar con rapidez. Las pizzas y demás alimentos elaborados a tu pedido se encuentran en ambos supuestos.</p>
<h2>9. Conformidad del producto y reclamaciones</h2>
<p>Si el producto recibido no se corresponde con tu pedido o presenta algún defecto, díselo al personal del local en el momento de la recogida o contacta cuanto antes con nosotros; lo repondremos o te reembolsaremos el importe, sin perjuicio de tus derechos legales de conformidad. Cada establecimiento dispone de hojas de reclamaciones; también puedes reclamar en ${pv(EMPRESA.email)}.</p>
<h2>10. Alérgenos e información alimentaria</h2>
<p>Consulta la <a href="#alergenos">información sobre alérgenos</a>. Si tienes alergia o intolerancia alimentaria, avisa al personal del local antes de pedir; las notas para cocina de la web no sustituyen ese aviso.</p>
<h2>11. Protección de datos</h2>
<p>El tratamiento de tus datos se describe en la <a href="#privacidad">Política de privacidad</a>.</p>
<h2>12. Legislación aplicable y jurisdicción</h2>
<p>Estas condiciones se rigen por la ley española. Si eres consumidor, podrás acudir a los juzgados y tribunales que te correspondan conforme a la normativa de consumidores y usuarios.</p>
<h2>13. Modificaciones</h2>
<p>Se aplican las condiciones vigentes en el momento de confirmar cada pedido.</p>`,

"alergenos":()=>{
  const filas=P.map(it=>{const a=ALERG[it.n]||[];return `<tr><td>${esc(nomLegal(it.n))}</td><td>${a.length?a.map(esc).join(", "):"—"}</td></tr>`}).join("");
  return `
<h1>Información sobre alérgenos</h1>
<p class="upd">Última actualización: ${EMPRESA.actualizado}</p>
${EMPRESA.alergenosValidados?"":'<p><mark class="pend">Tabla pendiente de validar por Pizzi con las fichas técnicas de sus proveedores antes del lanzamiento.</mark></p>'}
<p>De acuerdo con el Reglamento (UE) n.º 1169/2011 y el Real Decreto 126/2015, informamos de la presencia de alérgenos en los alimentos que servimos sin envasar. Los 14 alérgenos de declaración obligatoria son: cereales que contienen gluten, crustáceos, huevos, pescado, cacahuetes, soja, leche (incluida la lactosa), frutos de cáscara, apio, mostaza, granos de sésamo, dióxido de azufre y sulfitos, altramuces y moluscos.</p>
<h2>Alérgenos por producto</h2>
<div class="tabla-sc"><table>
<thead><tr><th>Producto</th><th>Contiene</th></tr></thead>
<tbody>${filas}</tbody></table></div>
<p>La tabla se ha elaborado a partir de los ingredientes indicados en la carta. Las recetas, salsas y proveedores pueden cambiar, y en la cocina (horno, superficies, utensilios) pueden producirse contaminaciones cruzadas, por lo que <b>no podemos garantizar la ausencia total de trazas</b> de ningún alérgeno en ningún producto.</p>
<h2>Si tienes alergia o intolerancia</h2>
<p>Díselo siempre al personal del local antes de pedir y confirma con él la composición del producto. Las notas para cocina del formulario de pedido no son un canal fiable para avisar de alergias. Puedes consultar también el <a href="#condiciones">resto de condiciones de venta</a>.</p>`;
}
};
let PAG=null;
function pintarLegal(pg){PAG=pg;const f=DOCS[pg];if(!f)return;document.getElementById("legalCuerpo").innerHTML=`<p class="legal-note">${t("legal_note")}</p>`+f();}

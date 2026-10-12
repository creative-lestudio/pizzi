/* ================= PIZZI · DATOS =================
   Aquí se cambia todo lo que no es diseño: locales, horarios, carta y precios.

   CONFIG
   - demo: true muestra una cinta "demo" arriba.
   - whatsappDemo: MODO PRUEBA. Mientras un local no tenga su "whatsapp", los pedidos llegan a este número.
*/
const CONFIG={
  demo:true,
  whatsappDemo:"584241859724"
};

/* LOCALES
   whatsapp: número del local en formato internacional sin + ni espacios (ej. 34612345678).
   pedidoUrl: si el local pide y cobra en una tienda online propia, el botón de pago lleva allí.
   lat/lng: coordenadas EXACTAS de la puerta del local (con 4 decimales ≈ 10 m). Se usan para saber cuál
   es el Pizzi más cercano. Para sacarlas: Google Maps → clic derecho sobre el local → copiar las coordenadas.
   Revisadas en oct. 2026: Peris y Valero (estaba ~900 m desviado), Abastos (~500 m) y Mercado Central.
   foto: imagen de la fachada en assets/img. */
/* Horarios: h[0]=lunes ... h[6]=domingo. Cada día es una lista de turnos [abre, cierra] en "HH:MM".
   Si cierra después de medianoche usa horas >24 (ej. "25:00" = 01:00). [] = cerrado. */
const T=(a,c)=>[[a,c]];
const LOCALES=[
  {id:"mercado",lat:39.4737,lng:-0.3789,n:"Mercado Central",d:"C/ de les Carabasses, 3, Ciutat Vella, 46001 València",tel:"+34 744 78 47 37",whatsapp:"",maps:"https://maps.app.goo.gl/rAKcLgmbYJYk6TSh9",
   h:[[["12:00","15:00"],["19:00","24:00"]],[["12:00","15:00"],["19:00","24:00"]],[["12:00","15:00"],["19:00","24:00"]],[["12:00","15:00"],["19:00","24:00"]],T("12:00","24:00"),T("12:00","24:00"),T("12:00","24:00")]},
  {id:"abastos",lat:39.4664,lng:-0.3851,n:"Abastos",d:"C/ de Sant Francesc de Borja, 20, Extramurs, 46007 València",tel:"+34 673 16 14 66",whatsapp:"",maps:"https://maps.app.goo.gl/iob1fPZKLdyD8FNF9",
   h:[[],T("18:30","23:30"),T("18:30","23:30"),T("18:30","23:30"),T("18:30","24:00"),T("18:30","24:00"),T("18:30","23:30")]},
  {id:"russafa",lat:39.4631,lng:-0.3739,n:"Ruzafa",d:"C. de Ruzafa, 58, L'Eixample, 46004 València",tel:"+34 744 78 47 37",whatsapp:"",maps:"https://maps.app.goo.gl/VfqsVDEDcRsKXxyu9",
   h:[T("18:30","23:30"),T("18:30","23:30"),T("18:30","23:30"),T("18:30","23:30"),T("18:30","24:00"),T("18:30","24:00"),T("18:30","23:30")]},
  {id:"canovas",lat:39.465,lng:-0.3676,n:"Cánovas",d:"C. de Joaquín Costa, 12, L'Eixample, 46005 València",tel:"+34 604 81 24 26",whatsapp:"",maps:"https://maps.app.goo.gl/L3ei1jMcgYXmEefz7",
   h:[T("18:00","23:30"),T("18:00","23:30"),T("18:00","23:30"),T("18:00","23:30"),T("18:00","25:00"),T("18:00","25:00"),T("18:00","23:30")]},
  {id:"peris",lat:39.4624,lng:-0.3633,pedidoUrl:"https://online.skytab.com/ca7f91bfeed306f50f4147d0dd13b011",n:"Peris y Valero",d:"Av. de Peris i Valero, 189, L'Eixample, 46005 València",tel:"+34 744 78 47 37",whatsapp:"",maps:"https://maps.app.goo.gl/iMcQYmXb9bt8SR686",
   h:[T("18:30","23:30"),T("18:30","23:30"),T("18:30","23:30"),T("18:30","23:30"),T("18:30","24:00"),T("18:30","24:00"),T("18:30","23:30")]}
];
const FOTO_LOCAL={mercado:"l-mercado",abastos:"l-abastos",russafa:"l-russafa",canovas:"l-canovas",peris:"l-peris"};

/* CARTA · [nombre, tipo, descripción ES, descripción EN, precio, etiqueta, imagen]
   Precios según la carta impresa. "imagen" es el nombre del archivo en assets/img (sin -s ni .webp). */
const P=[
  ["MARGHERITA","pizza","Salsa de tomate, mozzarella fior di latte y albahaca fresca.","Tomato sauce, fior di latte mozzarella and fresh basil.",6.9,"","p-margherita"],
  ["PEPPERONI","pizza","Salsa de tomate, mozzarella y pepperoni.","Tomato sauce, mozzarella and pepperoni.",8.9,"","p-pepperoni"],
  ["NAPOLI","pizza","Salsa de tomate, mozzarella, anchoas, alcaparras y olivas negras.","Tomato sauce, mozzarella, anchovies, capers and black olives.",8.9,"","p-napoli"],
  ["QUATTRO FORMAGGI","pizza","Salsa de tomate, mozzarella, gorgonzola, queso de cabra y parmigiano.","Tomato sauce, mozzarella, gorgonzola, goat cheese and parmesan.",8.9,"","p-quattro-formaggi"],
  ["PISTACHIOLA","pizza","Pesto de pistacho, mozzarella, mortadela y crema de burrata.","Pistachio pesto, mozzarella, mortadella and burrata cream.",9.9,"top","p-pistachiola"],
  ["TARTUFINA","pizza","Salsa de trufa, mozzarella, jamón cocido, champiñones y parmigiano.","Truffle sauce, mozzarella, cooked ham, mushrooms and parmesan.",9.9,"top","p-tartufina"],
  ["TUNA","pizza","Salsa de tomate, mozzarella, atún, cebolla y olivas negras.","Tomato sauce, mozzarella, tuna, onion and black olives.",9.9,"","p-tuna"],
  ["MONTESA","pizza","Crema de trufa, mozzarella, champiñones, longaniza y crema de burrata.","Truffle cream, mozzarella, mushrooms, sausage and burrata cream.",9.9,"","p-montesa"],
  ["ITALIANÍSIMA","pizza","Salsa de tomate, mozzarella, tomate cherry, crema de burrata, rúcula y salsa pesto.","Tomato sauce, mozzarella, cherry tomatoes, burrata cream, arugula and pesto.",9.9,"fresh","p-italianisima"],
  ["DI PARMA","pizza","Salsa de tomate, mozzarella, prosciutto crudo, parmigiano y rúcula.","Tomato sauce, mozzarella, prosciutto crudo, parmesan and arugula.",9.9,"","p-di-parma"],
  ["CAPRICCIOSA","pizza","Salsa de tomate, mozzarella, jamón cocido, champiñones, alcachofas y olivas negras.","Tomato sauce, mozzarella, cooked ham, mushrooms, artichokes and black olives.",9.9,"","p-capricciosa"],
  ["AGUA","bebida","Font d’Or, botella 33 cl","Still water, 33 cl bottle",1.5,"","b-agua"],
  ["AGUA CON GAS","bebida","Agua con gas, botella 33 cl","Sparkling water, 33 cl bottle",1.5,"","b-agua"],
  ["COCA-COLA","bebida","Sabor original, lata 33 cl","Original taste, can 33 cl",2.5,"","b-coca-cola"],
  ["COCA-COLA ZERO","bebida","Zero azúcar, lata 33 cl","Zero sugar, can 33 cl",2.5,"","b-coca-cola-zero"],
  ["FANTA LIMÓN","bebida","Refresco, lata 33 cl","Soda, can 33 cl",2.5,"","b-fanta-limon"],
  ["FANTA NARANJA","bebida","Refresco, lata 33 cl","Soda, can 33 cl",2.5,"","b-fanta-naranja"],
  ["CERVEZA TURIA","bebida","Märzen tostada, lata 33 cl","Toasted märzen beer, can 33 cl",2.5,"","b-cerveza-turia"]
].map((x,i)=>({i,n:x[0],t:x[1],es:x[2],en:x[3],p:x[4],badge:x[5],img:x[6]}));

/* Las que se destacan en el inicio ("Las más pedidas") */
const TOP=["PISTACHIOLA","TARTUFINA","MARGHERITA","ITALIANÍSIMA","DI PARMA"];

/* Categorías de la carta: id, clave de texto, tipo */
const CATS=[["pizzas","cat_pizzas","pizza"],["bebidas","cat_drinks","bebida"]];

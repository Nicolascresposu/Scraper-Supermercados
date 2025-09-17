# 🛒 Meta Analyzer App

## Descripción
Aplicación web para comparar precios de productos en diferentes supermercados de Santa Cruz de la Sierra.  
El sistema permite buscar un producto (ejemplo: *arroz 5kg, leche*) y comparar los precios en varios supermercados, resaltando cuál es el más barato.  

---

## Tecnologías
- **Django (Python)**: backend y manejo de base de datos.  
- **JavaScript**: frontend y scrapers.  
- **Chart.js**: visualización de datos en el dashboard.  
- **PostgreSQL**: almacenamiento de precios y productos.  
- **Cloudflared**: túnel HTTPS para acceso remoto seguro.  

---

## Funcionalidades
- Scraper para obtener datos de supermercados (Hipermaxi, Ketal, Fidalga, Amarket).  
- Limpieza y normalización de datos (unidades, duplicados, valores faltantes).  
- Buscador de productos por nombre.  
- Identificación del supermercado con el precio más barato.  
- Dashboard con gráficos:
  - Precio promedio por supermercado.  
  - Cantidad de productos por supermercado.  
  - Distribución de precios (mínimo, promedio, máximo).  

---

## Ejemplo de scraping con Axios
El siguiente fragmento muestra cómo se consulta la API de un supermercado y se procesan los productos:

```js
// Ejemplo de funcionamiento básico:
const resp = await axios.post("https://www.fidalga.com/collections/all/products.json"); 
// Esto usa axios para obtener la respuesta de una URL

const products = resp.data?.productos; 
// Si el JSON siempre tiene "data", pero "productos" puede no estar (ej: página de error).
// En ese caso, no habría productos, pero siempre hay "datos" (no aplica en todos los casos).

if (!products || products.length === 0) {
    console.log('😇⛑️ End of category reached.');
    endOfInventory = true; // Variable no usada en este ejemplo
}

pageCounter++; // Variable no usada en este ejemplo

for (const product of products) {
    const sku = product?._id?.codigo;          // Código único (string)
    const name = product?._id?.nombreProducto; // Nombre del producto (string)
    const price = product?._id?.precio;        // Precio (float convertido automáticamente a string en JS)

    console.log(`${sku} | ${name} | ${price}`);
}

// Ejemplo de funcionamiento basico:
const resp = await axios.post("https://www.fidalga.com/collections/all/products.json") // Esto usa axios para obtener la respuesta de una url
const products = resp.data?.productos; // Si el json tiene adentro siempre un "data", y puede o no tener uno llamado "productos", porque por ejemplo, en una pagina de error no tiene productos. Pero siempre tiene "datos" (No necesariamente aplica a este caso)

if (!products || products.length === 0) { // Revisamos si estamos en el final del producto
    print('😇⛑️ End of category reached.');
    endOfInventory = true; //Variable no usada en esta parte del codigo
}
pageCounter++ //Variable no usada en esta parte del codigo
for (const product of products) { //Iteramos a traves de los productos
    const sku = product?._id?.codigo; //Sacamos el sku (Es un string)
    const name = product?._id?.nombreProducto; //Sacamos el nombre producto (Es un string)
    const price = product?._id?.precio; //Sacamos el precio (Es un float, pero js lo convierte a string solo)
}
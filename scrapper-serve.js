// Importamos librerias, estas 2 son las minimas
const axios = require('axios');
//const mysql = require('mysql2/promise');
const { Pool } = require('pg');
// pool es para conexiones a postgres

//Declaramos la funcion sleep que vamos a usar a lo largo del programa, y configuramos nuestra base de datos

//  Config de ari
// const dbConfig = {host: 'localhost', user: 'postgres', password: '1234567890', database: 'bd_extraction'};
// const pool = new Pool(dbConfig);
const dbConfig = {host: 'localhost', user: 'root', password: 'root', database: 'scraper_supermercados'};
var now = new Date()
now = now.toISOString().replace("T"," ").replace("Z","")
console.log(`Starting the operation at ${now}`)
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

//Un switch para una variable que todavia no existe.
let selection = 'amarket'
switch (selection) {
    case 'hipermaxi':
        runScraperHipermaxi();
        break;
    case 'amarket':
        runScraperAmarket();
        break;
    case 'fidalga':
        runScraperFidalga();
        break;
    case 'all':
        // runScraperHipermaxi();
        runScraperAmarket();
        runScraperFidalga();
        break;
    default:
        console.log("Error. Value of selection: "+selection)
}
async function insertToDatabase(arrayToInsert) {
    connection = await mysql.createConnection(dbConfig);
    const sql = "INSERT INTO extraccion (name, price, compareAtPrice, vendor, productType, imageLink, sku, supermarket, datetime) VALUES ?";
    // console.log(arrayToInsert)
    const [result] = await connection.query(sql, [arrayToInsert]);
    console.log(`Success! Affected ${result.affectedRows}rows`)
}
async function runScraperHipermaxi() {
    connection = await mysql.createConnection(dbConfig);
    const URL = "https://hipermaxi.com/tienda-api/api/v1/public/productos?IdMarket=67&IdLocatario=67&Cantidad=500&Pagina=" //Most complex one.
    let endOfInventory = false;
    let counter = 1;
    let allProducts = [];
    while (!endOfInventory) {
        try {
            const resp = await axios.get(URL+counter);
            let products = resp.data?.Dato;
            if (!products || products.length === 0) {
                //This means we reached the end of a category
                endOfInventory = true;
                break;
            }
            for (const product of products) {
                // Hay que extraer: nombre, vendor, tipo de producto, precio, link a imagen.
                productName = product?.Descripcion
                price = product?.PrecioVenta
                compareAtPrice = product?.PrecioOriginal
                if (compareAtPrice==0.0000 || !compareAtPrice) {
                    compareAtPrice = price
                }
                productType = "N/A" // Is ALWAYS empty on Amarket
                vendor = "N/A"
                imageLink = product?.UrlFoto
                sku = product?.IdProducto
                supermarket = "Hipermaxi"
                productArray = [productName,price,compareAtPrice,vendor,productType,imageLink,sku,supermarket,now]
                allProducts.push(productArray)
                // console.log(productArray)
                // NEEDS duplicate protection. For later.
                
            }
            console.log(`Products added in Hipermaxi:${products.length} total: ${allProducts.length}`)
            await sleep(5000 + Math.random()*500)
            counter+=1
            }
        catch (error) {
            console.error(`An error occurred: ${error}. Giving it 3 seconds before reattempting.`);
            await sleep(3000)
        }
    }
    insertToDatabase(allProducts)
}
async function runScraperAmarket() {
    const URL = "https://amarket.com.bo/collections/all/products.json?page=" // Page size is 30.
    let endOfInventory = false;
    let counter = 1; // La pagina 0 es igual a la pagina 1, asi que comenzamos en 1.
    let allProducts = [];
    while (!endOfInventory) {
        try {
            const resp = await axios.get(URL+counter);
            let products = resp.data?.products;
            if (!products || products.length === 0) {
                //This means we reached the end of a category
                endOfInventory = true;
                break;
            }
            for (const product of products) {
                // Hay que extraer: nombre, vendor, tipo de producto, precio, link a imagen.
                productName = product?.title
                price = product?.variants[0]?.price
                compareAtPrice = product?.variants[0]?.compare_at_price
                if (!compareAtPrice || compareAtPrice == 0.00) {
                    compareAtPrice = price
                }
                vendor = product?.vendor
                productType = product?.product_type // Is ALWAYS empty on Amarket
                imageLink = product?.images[0]?.src
                sku = product?.variants[0]?.sku
                supermarket = "Amarket"
                productArray = [productName,price,compareAtPrice,vendor,productType,imageLink,sku,supermarket,now]
                allProducts.push(productArray)
            }
            console.log(`Products added in Amarket:${products.length} total: ${allProducts.length}`)
            await sleep(3000 + Math.random()*500)
            counter+=1
        }
        catch (error) {
            console.error(`An error occurred: ${error}. Giving it 3 seconds before reattempting.`);
            await sleep(3000)
        }
    }
    insertToDatabase(allProducts)
}
async function runScraperFidalga() {
// Version del scrapper de ari
// const URL = "https://www.fidalga.com/collections/all/products.json?page=" // Page size is 30.
// let endOfInventory = false;
// let counter = 1; // La pagina 0 es igual a la pagina 1, asi que comenzamos en 1.
// while (!endOfInventory) {
//     const resp = await axios.get(URL+counter);
//     let products = resp.data?.products;
//     if (!products || products.length === 0) {
//         //This means we reached the end of a category
//         endOfInventory = true;
//         break;
//     }
//     for (const product of products) {
//         console.log(product?.title)
//         await sleep(20)
//     }
//     await sleep(2000)
//     counter+=1
// }
// }

// async function runScraperAmarket() {
//     const URL = "https://amarket.com.bo/collections/all/products.json?page="
//     let endOfInventory = false;
//     let counter = 1; 

//     while (!endOfInventory) {
//         const resp = await axios.get(URL + counter);
//         let products = resp.data?.products;

//         if (!products || products.length === 0) {
//             endOfInventory = true;
//             break;
//         }

//         for (const product of products) {
//             //console.log(product?.id);
//             console.log(product?.title);
//             //console.log(product?.variants[0]?.price);
//             await saveProduct(product, 'Amarket');
//             await sleep(20);
//         }
//         await sleep(200);
//         counter += 1;
//     }
// }

// // funcion para guardar productos en la base de datos
// async function saveProduct(product, supermarket) {
//     // usamos una consulta SQL con ON CONFLICT para evitar duplicados
//   const sql = `
//     INSERT INTO productos (product_id, nombre, precio, supermercado, image_link)
//     VALUES ($1, $2, $3, $4, $5)
//     ON CONFLICT (product_id) DO UPDATE
//     SET nombre = EXCLUDED.nombre,
//         precio = EXCLUDED.precio,
//         supermercado = EXCLUDED.supermercado,
//         image_link = EXCLUDED.image_link;
//   `;
//   // excluded se utiliza para referirse a los valores que se intentaron insertar
//   const values = [
//     product.id,
//     product.title,
//     product.variants?.[0]?.price || 0,
//     supermarket,
//     product.images?.[0]?.src || null
//   ];

//   try {
//     await pool.query(sql, values);
//   } catch (err) {
//     console.error("Error saving product:", err);
//   }
// Version mia
    const URL = "https://www.fidalga.com/collections/all/products.json?page=" // Page size is 30.
    let endOfInventory = false;
    let counter = 1; // La pagina 0 es igual a la pagina 1, asi que comenzamos en 1.
    let allProducts = []
    while (!endOfInventory) {
        try {
            const resp = await axios.get(URL+counter);
            let products = resp.data?.products;
            if (!products || products.length === 0) {
                //This means we reached the end of a category
                endOfInventory = true;
                break;
            }
            for (const product of products) {
                // Hay que extraer: nombre, vendor, tipo de producto, precio, link a imagen.
                productName = product?.title
                price = product?.variants[0]?.price
                compareAtPrice = product?.variants[0]?.compare_at_price
                if (!compareAtPrice || compareAtPrice == 0.00) {
                    compareAtPrice = price
                }
                vendor = product?.vendor
                productType = product?.product_type // Is ALWAYS empty on Amarket
                imageLink = product?.images[0]?.src
                sku = product?.variants[0]?.sku
                supermarket = "Fidalga"
                productArray = [productName,price,compareAtPrice,vendor,productType,imageLink,sku,supermarket,now]
                allProducts.push(productArray)
            }
            console.log(`Products added in Fidalga:${products.length} total: ${allProducts.length}`)
            await sleep(1000 + Math.random()*500)
            counter+=1
        }
        catch (error) {
            console.error(`An error occurred: ${error}. Giving it 3 seconds before reattempting.`);
            await sleep(3000)
        }
    }
    insertToDatabase(allProducts)
}

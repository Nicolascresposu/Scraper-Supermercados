// Importamos librerias, estas 2 son las minimas
const axios = require('axios');
const mysql = require('mysql2/promise');

//Declaramos la funcion sleep que vamos a usar a lo largo del programa, y configuramos nuestra base de datos
const dbConfig = {host: 'localhost', user: 'root', password: 'root', database: 'scraper_supermercados'};

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

//Un switch para una variable que todavia no existe.
let selection = 'hipermaxi'
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
        runScraperHipermaxi();
        runScraperAmarket();
        runScraperFidalga();
        break;
    default:
        console.log("Error. Value of selection: "+selection)
}
async function insertToDatabase(arrayToInsert) {
    connection = await mysql.createConnection(dbConfig);
    const sql = "INSERT INTO extraction (chain, vendor, date, name, sku, fullPrice, salePrice, discount) VALUES ?";
    const values = arrayToInsert.map(p => [p.productName, p.price, p.vendor, p.productType,p.imageLink,p.supermarket]);
    const [result] = await connection.query(sql, [values]);
    console.log(`Success! Affected ${result.affectedRows}rows`)
}
async function runScraperHipermaxi() {
    connection = await mysql.createConnection(dbConfig);
    const URL = "https://hipermaxi.com/tienda-api/api/v1/public/productos?IdMarket=67&IdLocatario=67&Cantidad=500&Pagina=" //Most complex one.
    let endOfInventory = false;
    let counter = 1;
    while (!endOfInventory) {
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
            productType = product?.product_type // Is ALWAYS empty on Amarket
            vendor = product?.vendor
            imageLink = product?.images[0]?.src
            // sku = product?.
            supermarket = "Hipermaxi"
            // await sleep(20)
            productArray = [productName,price,productType,vendor,imageLink,supermarket]
            // NEEDS duplicate protection.
        }
        await sleep(2000)
        counter+=1
    }
}
async function runScraperAmarket() {
    const URL = "https://amarket.com.bo/collections/all/products.json?page=" // Page size is 30.
    let endOfInventory = false;
    let counter = 1; // La pagina 0 es igual a la pagina 1, asi que comenzamos en 1.
    while (!endOfInventory) {
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
            productType = product?.product_type // Is ALWAYS empty on Amarket
            vendor = product?.vendor
            imageLink = product?.images[0]?.src
            supermarket = "Amarket"
            productArray = [productName,price,productType,vendor,imageLink,supermarket]
        }
        await sleep(2000)
        counter+=1
    }
}
async function runScraperFidalga() {
    const URL = "https://www.fidalga.com/collections/all/products.json?page=" // Page size is 30.
    let endOfInventory = false;
    let counter = 1; // La pagina 0 es igual a la pagina 1, asi que comenzamos en 1.
    while (!endOfInventory) {
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
            productType = product?.product_type
            vendor = product?.vendor
            imageLink = product?.images[0]?.src
            supermarket = "Fidalga"
            productArray = [productName,price,productType,vendor,imageLink,supermarket]
        }
        await sleep(2000)
        counter+=1
    }
}

// Importamos librerias, estas 2 son las minimas
const axios = require('axios');
//const mysql = require('mysql2/promise');
const { Pool } = require('pg');

const cron = require('node-cron');
// pool es para conexiones a postgres

//Declaramos la funcion sleep que vamos a usar a lo largo del programa, y configuramos nuestra base de datos
const dbConfig = {host: 'localhost', user: 'postgres', password: '1234567890', database: 'bd_extraction'};

const dbTimeBasedConfig = {host: 'localhost', user: 'postgres', password: '1234567890', database: 'extraction_timebased'};  

const pool = new Pool(dbConfig);
const poolTimeBased = new Pool(dbTimeBasedConfig);
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// La funcion principal, llamada por el cronjob
async function mainFunction() {
    // La variable que determina 
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
}

async function runScraperHipermaxi() {
const URL = "https://hipermaxi.com/tienda-api/api/v1/public/productos?IdMarket=67&IdLocatario=67&Cantidad=500&Pagina=" //Most complex one.
let endOfInventory = false;
let counter = 1;
console.log("Starting scraper for Hipermaxi...");
while (!endOfInventory) {
        const resp = await axios.get(URL + counter);
        let products = resp.data?.Dato;
        console.log(products.length)

        if (!products || products.length === 0) {
            endOfInventory = true;
            break;
        }

        for (const product of products) {
            //console.log(product?.id);
            console.log(product?.Descripcion);
            //console.log(product?.variants[0]?.price);
            await saveProduct(product, 'Hipermaxi');
            await sleep(20);
        }
        await sleep(200);
        counter += 1;
    }
}
// Scraper para Fidalga, que utiliza el API de shopify expuesto
async function runScraperFidalga() {
const URL = "https://www.fidalga.com/collections/all/products.json?page=" // Page size is 30.
let endOfInventory = false; //Variable we use 
let counter = 1; // La pagina 0 es igual a la pagina 1, asi que comenzamos en 1.
while (!endOfInventory) {
        const resp = await axios.get(URL + counter);
        let products = resp.data?.products;

        if (!products || products.length === 0) {
            endOfInventory = true;
            break;
        }

        for (const product of products) {
            //console.log(product?.id);
            console.log(product?.title);
            //console.log(product?.variants[0]?.price);
            await saveProduct(product, 'Fidalga');
            await sleep(20);
        }
        await sleep(200);
        counter += 1;
    }
}
// Scraper para Amarket, que utiliza el API de shopify expuesto
async function runScraperAmarket() {
    const URL = "https://amarket.com.bo/collections/all/products.json?page="
    let endOfInventory = false; //Variable we use 
    let counter = 1; // La pagina 0 es igual a la pagina 1, asi que comenzamos en 1.

    while (!endOfInventory) {
        const resp = await axios.get(URL + counter);
        let products = resp.data?.products;

        if (!products || products.length === 0) {
            endOfInventory = true;
            break;
        }

        for (const product of products) {
            //console.log(product?.id);
            console.log(product?.title);
            //console.log(product?.variants[0]?.price);
            await saveProduct(product, 'Amarket');
            await sleep(20);
        }
        await sleep(200);
        counter += 1;
    }
}

// funcion para guardar productos en la base de datos
async function saveProduct(product, supermarket) {
    // usamos una consulta SQL con ON CONFLICT para evitar duplicados
  const sql = `
    INSERT INTO productos (product_id, nombre, precio, supermercado, image_link)
    VALUES ($1, $2, $3, $4, $5)
    ON CONFLICT (product_id) DO UPDATE
    SET nombre = EXCLUDED.nombre,
        precio = EXCLUDED.precio,
        supermercado = EXCLUDED.supermercado,
        image_link = EXCLUDED.image_link;
  `;

  const sqlTimeBased = `
    INSERT INTO preciohistorico (product_id, precio, tiempo_registro)
    VALUES ($1, $2, NOW());
    `;
    
  const boolean = false;  

  const sqlProductData = `
    INSERT INTO product_data (product_id, nombre, supermercado)
    VALUES ($1, $2, $3)
    ON CONFLICT (product_id) DO UPDATE
    SET nombre = EXCLUDED.nombre,
        supermercado = EXCLUDED.supermercado;
  `;

  let values = [];

  // excluded se utiliza para referirse a los valores que se intentaron insertar
  if(supermarket == "Hipermaxi") { 
    values = [
      product.IdProducto || null,
      product.Descripcion || "Sin nombre",
      product.PrecioVenta || 0,
      supermarket,
      product.UrlFoto || null
    ];
  } else {
    values = [
        product.id,
        product.title,
        product.variants?.[0]?.price || 0,
        supermarket,
        product.images?.[0]?.src || null
    ];
  }

  let valuesTime = [];

  if(supermarket == "Hipermaxi") { 
    valuesTime = [
      product.IdProducto || null,
      product.PrecioVenta || 0,
    ];
  } else {
    valuesTime = [
        product.id,
        product.variants?.[0]?.price || 0,
    ];
  }

  let valuesData = [];

  if(supermarket == "Hipermaxi") { 
    valuesData = [
      product.IdProducto || null,
      product.Descripcion || "Sin nombre",
      supermarket,
    ];
  } else {
    valuesData = [
        product.id,
        product.title,
        supermarket,
    ];
  }
  

  try {
    await pool.query(sql, values);
  } catch (err) {
    console.error("Error saving product:", err);
  }

  //verifica si ese producto no está ya en product_data
  const checking = await poolTimeBased.query('SELECT product_id FROM product_data WHERE product_id = $1', [product.IdProducto || product.id]); 

  if (checking.rowCount === 0) {
    await poolTimeBased.query(sqlProductData, valuesData);    
  }

  try {
    await poolTimeBased.query(sqlTimeBased, valuesTime);
  } catch (err) {
    console.error("Error saving time-based product:", err);
  }
}   


(async () => {
cron.schedule('0 2 * * *', () => {
    console.log("Running!")
  mainFunction();
}, {
  scheduled: true,
  timezone: "America/New_York" // Example timezone, but works for us.
});
mainFunction();
console.log('Scheduler started. Waiting for the scheduled time...');
})();
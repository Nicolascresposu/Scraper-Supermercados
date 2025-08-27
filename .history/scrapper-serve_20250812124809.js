// Importamos librerias, estas 2 son las minimas
const axios = require('axios');
const mysql = require('mysql2/promise');

//Declaramos la funcion sleep que vamos a usar a lo largo del programa, y configuramos nuestra base de datos
const dbConfig = {host: 'localhost', user: 'root', password: 'root', database: 'bd_extraction'};
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
        runScraperHipermaxi();
        runScraperAmarket();
        runScraperFidalga();
        break;
    default:
        console.log("Error. Value of selection: "+selection)
}
async function runScraperHipermaxi() {
const URL = "https://hipermaxi.com/tienda-api/api/v1/public/productos?IdMarket=" //Most complex one.
let endOfInventory = false;
let counter = 0;
}
async function runScraperAmarket() {
const URL = "https://amarket.com.bo/collections/all/products.json?page=" // Page size is 30.
let endOfInventory = false;
let counter = 0;
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
        console.log(product?.title)
        await sleep(20)
    }
    await sleep(2000)
    counter+=1
}
}

async function runScraperAmarket() {
    const URL = "https://amarket.com.bo/collections/all/products.json?page="
    let endOfInventory = false;
    let counter = 1; 
    while (!endOfInventory) {
        const resp = await axios.get(URL + counter);
        let products = resp.data?.products;
        if (!products || products.length === 0) {
            endOfInventory = true;
            break;
        }
        for (const product of products) {
            console.log(product?.title);
            console.log(product?.variants?[0].price);
            await sleep(20);
        }
        await sleep(200);
        counter += 1;
    }
}
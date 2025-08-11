// Importamos librerias, estas 2 son las minimas
const axios = require('axios');
const mysql = require('mysql2/promise');

//Declaramos la funcion sleep que vamos a usar a lo largo del programa, y configuramos nuestra base de datos
const dbConfig = {host: 'localhost', user: 'root', password: 'root', database: 'bd_extraction'};
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

//Un switch para una variable que todavia no existe.
switch (selection) {
    case 'hipermaxi':
        runScraperHipermaxi();
        break;
    case 'amarket':
        runScraperAmarket();
        break;
    case 'fidalga':
        runScraperFidalga();
    case 'all':
        runScraperHipermaxi();
        runScraperAmarket();
        runScraperFidalga();
    default:
        console.log("Error. Value of selection: "+selection)
}
async function runScraperHipermaxi() {
const URL = "https://hipermaxi.com/tienda-api/api/v1/public/productos?IdMarket=" //Most complex one.
}
async function runScraperAmarket() {
const URL = "https://amarket.com.bo/collections/all/products.json?page=" // Page size is 30.
}
async function runScraperFidalga() {
const URL = "https://www.fidalga.com/collections/all/products.json?page=" // Page size is 30.
}
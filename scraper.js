const axios = require('axios');
const { Pool } = require('pg');

// Ajusta credenciales si es necesario
const dbConfig = { host: 'localhost', user: 'postgres', password: '1234567890', database: 'bd_extraction' };
const dbTimeBasedConfig = { host: 'localhost', user: 'postgres', password: '1234567890', database: 'extraction_timebased' };

const pool = new Pool(dbConfig);
const poolTimeBased = new Pool(dbTimeBasedConfig);

const sleep = (ms) => new Promise(res => setTimeout(res, ms));

async function saveProduct(product, supermarket, save = true) {
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

  const sqlProductData = `
    INSERT INTO product_data (product_id, nombre, supermercado)
    VALUES ($1, $2, $3)
    ON CONFLICT (product_id) DO UPDATE
    SET nombre = EXCLUDED.nombre,
        supermercado = EXCLUDED.supermercado;
  `;

  let values, valuesTime, valuesData;

  if (supermarket === "Hipermaxi") {
    values = [
      product.IdProducto || null,
      product.Descripcion || "Sin nombre",
      product.PrecioVenta || 0,
      supermarket,
      product.UrlFoto || null
    ];
    valuesTime = [ product.IdProducto || null, product.PrecioVenta || 0 ];
    valuesData = [ product.IdProducto || null, product.Descripcion || "Sin nombre", supermarket ];
  } else {
    values = [
      product.id,
      product.title,
      product.variants?.[0]?.price || 0,
      supermarket,
      product.images?.[0]?.src || null
    ];
    valuesTime = [ product.id, product.variants?.[0]?.price || 0 ];
    valuesData = [ product.id, product.title, supermarket ];
  }

  if (save) {
    // estado actual
    await pool.query(sql, values);
    // catálogo
    const exists = await poolTimeBased.query('SELECT product_id FROM product_data WHERE product_id = $1', [values[0]]);
    if (exists.rowCount === 0) {
      await poolTimeBased.query(sqlProductData, valuesData);
    }
    // histórico
    await poolTimeBased.query(sqlTimeBased, valuesTime);
  }
}

async function runScraperHipermaxi(save = true) {
  const URL = "https://hipermaxi.com/tienda-api/api/v1/public/productos?IdMarket=67&IdLocatario=67&Cantidad=500&Pagina=";
  let page = 1, items = [];

  while (true) {
    const resp = await axios.get(URL + page);
    const products = resp.data?.Dato;
    if (!products?.length) break;

    for (const p of products) {
      items.push({
        product_id: p.IdProducto,
        nombre: p.Descripcion,
        precio: p.PrecioVenta,
        supermercado: "Hipermaxi",
        image_link: p.UrlFoto
      });
      await saveProduct(p, "Hipermaxi", save);
      await sleep(20);
    }
    page++;
    await sleep(200);
  }
  return items;
}

async function runScraperFidalga(save = true) {
  const URL = "https://www.fidalga.com/collections/all/products.json?page=";
  let page = 1, items = [];

  while (true) {
    const resp = await axios.get(URL + page);
    const products = resp.data?.products;
    if (!products?.length) break;

    for (const p of products) {
      items.push({
        product_id: p.id,
        nombre: p.title,
        precio: p.variants?.[0]?.price,
        supermercado: "Fidalga",
        image_link: p.images?.[0]?.src
      });
      await saveProduct(p, "Fidalga", save);
      await sleep(20);
    }
    page++;
    await sleep(200);
  }
  return items;
}

async function runScraperAmarket(save = true) {
  const URL = "https://amarket.com.bo/collections/all/products.json?page=";
  let page = 1, items = [];

  while (true) {
    const resp = await axios.get(URL + page);
    const products = resp.data?.products;
    if (!products?.length) break;

    for (const p of products) {
      items.push({
        product_id: p.id,
        nombre: p.title,
        precio: p.variants?.[0]?.price,
        supermercado: "Amarket",
        image_link: p.images?.[0]?.src
      });
      await saveProduct(p, "Amarket", save);
      await sleep(20);
    }
    page++;
    await sleep(200);
  }
  return items;
}

async function runScraper(store = "all", save = true) {
  switch (store.toLowerCase()) {
    case "hipermaxi": return runScraperHipermaxi(save);
    case "fidalga":   return runScraperFidalga(save);
    case "amarket":   return runScraperAmarket(save);
    case "all":
      const h = await runScraperHipermaxi(save);
      const f = await runScraperFidalga(save);
      const a = await runScraperAmarket(save);
      return [...h, ...f, ...a];
    default:
      throw new Error(`Tienda no reconocida: ${store}`);
  }
}

module.exports = {
  runScraper,
  runScraperHipermaxi,
  runScraperFidalga,
  runScraperAmarket
};

// scraper.js
const axios = require('axios');
const { Pool } = require('pg');
const cron = require('node-cron');

// ⚠️ Pon estos datos en variables de entorno en producción
const dbConfig = { host:'localhost', user:'postgres', password:'1234567890', database:'bd_extraction' };
const dbTimeBasedConfig = { host:'localhost', user:'postgres', password:'1234567890', database:'extraction_timebased' };

const pool = new Pool(dbConfig);
const poolTimeBased = new Pool(dbTimeBasedConfig);
const sleep = (ms) => new Promise(r => setTimeout(r, ms));

// ----------------- NORMALIZACIÓN -----------------
function normalizeItem(product, supermarket) {
  if (supermarket === 'Hipermaxi') {
    return {
      product_id:  product.IdProducto || null,
      nombre:      product.Descripcion || "Sin nombre",
      precio:      product.PrecioVenta || 0,
      supermercado: supermarket,        // ← campo JSON correcto
      image_link:  product.UrlFoto || null,
    };
  }
  return {
    product_id:  product.id,
    nombre:      product.title,
    precio:      product.variants?.[0]?.price || 0,
    supermercado: supermarket,          // ← campo JSON correcto
    image_link:  product.images?.[0]?.src || null,
  };
}

// ----------------- PERSISTENCIA -----------------
async function saveProduct(product, supermarket) {
  const sql = `
    INSERT INTO productos (product_id, nombre, precio, supermercado, image_link)
    VALUES ($1,$2,$3,$4,$5)
    ON CONFLICT (product_id) DO UPDATE
      SET nombre=EXCLUDED.nombre, precio=EXCLUDED.precio,
          supermercado=EXCLUDED.supermercado, image_link=EXCLUDED.image_link;
  `;
  const sqlTimeBased = `
    INSERT INTO preciohistorico (product_id, precio, tiempo_registro)
    VALUES ($1, $2, NOW());
  `;
  const sqlProductData = `
    INSERT INTO product_data (product_id, nombre, supermercado)
    VALUES ($1,$2,$3)
    ON CONFLICT (product_id) DO UPDATE
      SET nombre=EXCLUDED.nombre, supermercado=EXCLUDED.supermercado;
  `;

  let values, valuesTime, valuesData;
  if (supermarket === "Hipermaxi") {
    values     = [product.IdProducto||null, product.Descripcion||"Sin nombre", product.PrecioVenta||0, supermarket, product.UrlFoto||null];
    valuesTime = [product.IdProducto||null, product.PrecioVenta||0];
    valuesData = [product.IdProducto||null, product.Descripcion||"Sin nombre", supermarket];
  } else {
    values     = [product.id, product.title, product.variants?.[0]?.price||0, supermarket, product.images?.[0]?.src||null];
    valuesTime = [product.id, product.variants?.[0]?.price||0];
    valuesData = [product.id, product.title, supermarket];
  }

  try { await pool.query(sql, values); } catch (e) { console.error('save productos:', e); }
  const checking = await poolTimeBased.query('SELECT product_id FROM product_data WHERE product_id=$1', [valuesData[0]]);
  if (checking.rowCount === 0) {
    try { await poolTimeBased.query(sqlProductData, valuesData); } catch (e) { console.error('save product_data:', e); }
  }
  try { await poolTimeBased.query(sqlTimeBased, valuesTime); } catch (e) { console.error('save preciohistorico:', e); }
}

// ----------------- RUNNERS (traen TODO) -----------------
async function runScraperHipermaxi({ save=false } = {}) {
  const URL = "https://hipermaxi.com/tienda-api/api/v1/public/productos?IdMarket=67&IdLocatario=67&Cantidad=500&Pagina=";
  let counter = 1;
  const out = [];
  while (true) {
    const resp = await axios.get(URL + counter);
    const products = resp.data?.Dato || [];
    if (products.length === 0) break;
    for (const product of products) {
      const item = normalizeItem(product, 'Hipermaxi');
      out.push(item);
      if (save) await saveProduct(product, 'Hipermaxi');
      await sleep(8);
    }
    counter += 1;
    await sleep(100);
  }
  return out;
}

async function runScraperFidalga({ save=false } = {}) {
  const URL = "https://www.fidalga.com/collections/all/products.json?page=";
  let counter = 1;
  const out = [];
  while (true) {
    const resp = await axios.get(URL + counter);
    const products = resp.data?.products || [];
    if (products.length === 0) break;
    for (const product of products) {
      const item = normalizeItem(product, 'Fidalga');
      out.push(item);
      if (save) await saveProduct(product, 'Fidalga');
      await sleep(8);
    }
    counter += 1;
    await sleep(100);
  }
  return out;
}

async function runScraperAmarket({ save=false } = {}) {
  const URL = "https://amarket.com.bo/collections/all/products.json?page=";
  let counter = 1;
  const out = [];
  while (true) {
    const resp = await axios.get(URL + counter);
    const products = resp.data?.products || [];
    if (products.length === 0) break;
    for (const product of products) {
      const item = normalizeItem(product, 'Amarket');
      out.push(item);
      if (save) await saveProduct(product, 'Amarket');
      await sleep(8);
    }
    counter += 1;
    await sleep(100);
  }
  return out;
}

async function runScraper(store, { save=false } = {}) {
  switch ((store||'').toLowerCase()) {
    case 'hipermaxi': return runScraperHipermaxi({ save });
    case 'amarket':   return runScraperAmarket({ save });
    case 'fidalga':   return runScraperFidalga({ save });
    case 'all': {
      const [h,a,f] = await Promise.all([
        runScraperHipermaxi({ save }), runScraperAmarket({ save }), runScraperFidalga({ save })
      ]);
      return [...h, ...a, ...f];
    }
    default: throw new Error(`Store not supported: ${store}`);
  }
}

async function mainFunction(selection='all') {
  return runScraper(selection, { save:true });
}

if (require.main === module) {
  cron.schedule('0 2 * * *', () => {
    console.log("Running scheduled job...");
    mainFunction('all').catch(console.error);
  }, { scheduled:true, timezone:"America/New_York" });

  mainFunction('all').then(()=>console.log('First run launched')).catch(console.error);
}

module.exports = { runScraper, runScraperHipermaxi, runScraperAmarket, runScraperFidalga };

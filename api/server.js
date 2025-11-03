const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const { runScraper } = require('../scraper');

const app = express();
app.use(cors());
app.use(rateLimit({ windowMs: 60_000, max: 60 }));

app.get('/health', (req,res)=>res.json({ ok:true }));


app.get('/scrape/run', async (req, res) => {
  const store = (req.query.store || 'fidalga').toLowerCase();
  const save  = (req.query.save || '0') === '1';
  try {
    const items = await runScraper(store, { save }); 
    res.json({ store, save, count: items.length, items });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: e.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Scraper API listening on http://localhost:${PORT}`));

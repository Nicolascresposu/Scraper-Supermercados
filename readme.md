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

## 📂 Project Structure
```
scrapper/
├── manage.py               # Django CLI
├── db.sqlite3              # Default SQLite database
├── scrapper/               # Project settings & config
│   ├── settings.py
│   ├── urls.py
│   ├── wsgi.py / asgi.py
│
└── scrapper_app/           # Core application
    ├── models.py           # Database models
    ├── views.py            # Application logic
    ├── admin.py            # Django admin registration
    ├── migrations/         # Schema history
    └── templates/          # HTML templates
```

---

## 🔗 Endpoints & Rutas
Definidas en `scrapper/urls.py` and `scrapper_app/views.py`.

Examples:
- `/admin/` → Django admin  
- `/buscar/` → Product search page  
- `/producto-precios/` → JSON response with price analysis  
- `/producto/<id>/` → Detail page for a product  

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


# Scrapper Serve

Un **job runner** ligero en Node.js que realiza scraping de datos (usando `axios`) y los almacena en PostgreSQL mediante `pg`, con programación de tareas gracias a `node-cron`.

> El punto de entrada es `scrapper-serve.js`. Configura un pool de conexión a PostgreSQL, ejecuta `mainFunction()` inmediatamente y además lo agenda para correr diariamente a una hora configurada.

---

## Características

- **Obtención HTTP** con `axios`
- **Conexión a PostgreSQL** con `pg` y pool de conexiones
- **Tareas programadas** con `node-cron`
- Utilidades asíncronas simples (ej. `sleep(ms)`)

---

## Estructura del proyecto

```
.
├─ frontend/scrapper   # Frontend visible (Documentado en otro segmento)
├─ scrapper-serve.js   # Script principal: pool de DB, cron y mainFunction()
└─ README.md           # Este archivo
```

---

## Requisitos

- **Node.js** ≥ 18.x  
- **PostgreSQL** ≥ 13  
- Acceso a Internet desde la máquina que corre este script (para `axios`)

---

## Instalación

```bash
# 1) Instalar dependencias
npm install axios pg node-cron

# (Opcional) Instalar exacto con lockfile
# npm ci
```

---

## Configuración

# Programador
CRON_SCHEDULE=0 2 * * *         # todos los días a las 02:00
CRON_TIMEZONE=America/La_Paz     # zona horaria (IANA)

# Selección de scraper
SCRAPER_SELECTION=hipermaxi
```

---

## Configuración de la base de datos

Crea la base y el usuario:

```sql
CREATE DATABASE bd_extraction;
CREATE USER scrapper_user WITH PASSWORD 'change-me';
GRANT ALL PRIVILEGES ON DATABASE bd_extraction TO scrapper_user;
```

> El script no incluye el DDL de las tablas.

---

## Uso

### Ejecutar una vez (en primer plano)

```bash
node scrapper-serve.js
```

El script hará lo siguiente:
1. Crear un pool de PostgreSQL.  
2. Ejecutar `mainFunction()` inmediatamente.  
3. Iniciar un cron job que ejecuta `mainFunction()` en la hora configurada.  
4. Mostrar en logs: `Scheduler started. Waiting for the scheduled time...`

> Si quieres que **solo se ejecute por cron** (sin ejecución inmediata), se puede comentar o eliminar la llamada a `mainFunction()` al final del archivo.

### Cambiar horario o zona horaria

- Modifica la expresión cron y zona horaria (en el código o variables de entorno).
- Ejemplo:
  - Cada 6 horas: `cron.schedule('0 */6 * * *', () => {=`

---

## Logs y solución de problemas

- **Problemas de conexión**: verifica `PGHOST`, `PGUSER`, `PGPASSWORD`, `PGDATABASE` y que PostgreSQL esté accesible.  
- **Cron no dispara**: confirma que el proceso sigue activo, que la zona horaria sea válida y la expresión cron correcta.  
- **Errores HTTP**: revisa conectividad a Internet y disponibilidad del servicio remoto.  
- **Tareas largas / límites de rate**: usa la utilidad `sleep(ms)` para espaciar solicitudes dentro de bucles de scraping.  

---

## Ejecutar como servicio (systemd)

Archivo de unidad:

```ini
# /etc/systemd/system/scrapper-serve.service
[Unit]
Description=Scrapper Serve (Node.js)
After=network.target

[Service]
Type=simple
WorkingDirectory=/opt/scrapper-serve
ExecStart=/usr/bin/node /opt/scrapper-serve/scrapper-serve.js
Restart=always
RestartSec=10
Environment=PGHOST=localhost
Environment=PGUSER=scrapper_user
Environment=PGPASSWORD=change-me
Environment=PGDATABASE=bd_extraction
Environment=PGPORT=5432
Environment=CRON_SCHEDULE=0 2 * * *
Environment=CRON_TIMEZONE=America/La_Paz
Environment=SCRAPER_SELECTION=hipermaxi

[Install]
WantedBy=multi-user.target
```

Activar:

```bash
sudo systemctl daemon-reload
sudo systemctl enable scrapper-serve
sudo systemctl start scrapper-serve
sudo systemctl status scrapper-serve
journalctl -u scrapper-serve -f
```

---

## Docker (opcional)

`Dockerfile` básico:

```dockerfile
FROM node:20-alpine

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production || npm install --omit=dev
COPY . .

CMD ["node", "scrapper-serve.js"]
```

Construir y ejecutar:

```bash
docker build -t scrapper-serve .
docker run --rm   -e PGHOST=host.docker.internal   -e PGUSER=scrapper_user   -e PGPASSWORD=change-me   -e PGDATABASE=bd_extraction   -e PGPORT=5432   -e CRON_SCHEDULE="0 2 * * *"   -e CRON_TIMEZONE="America/La_Paz"   -e SCRAPER_SELECTION="hipermaxi"   scrapper-serve
```

---

## Extensiones posibles

- **Multiples objetivos**: el código sugiere `selection` (ej. `'hipermaxi'`). Puedes crear funciones `runScraperHipermaxi()`, `runScraperFidalga()`, etc., y conmutar según `process.env.SCRAPER_SELECTION`.  
- **Reintentos y backoff**: envolver `axios` con lógica de reintentos.  
- **Validación de datos**: limpiar y validar antes de insertar en la base.  
- **Migraciones**: usar herramientas como `knex` o `node-pg-migrate`.

---

## Licencia

MIT (o la que prefieras).

---

## Resumen rápido (TL;DR)

```bash
npm install axios pg node-cron
export PGHOST=localhost PGUSER=postgres PGPASSWORD=change-me PGDATABASE=bd_extraction
export CRON_SCHEDULE="0 2 * * *" CRON_TIMEZONE="America/La_Paz" SCRAPER_SELECTION="hipermaxi"
node scrapper-serve.js
```

Un ejemplo del funcionamiento basico del extractor es:
```
const resp = await axios.post("https://www.fidalga.com/collections/all/products.json") // Esto usa axios para obtener la respuesta de una url
const products = resp.data?.productos; // El json tiene adentro siempre un "data", y puede o no tener uno llamado "productos", porque por ejemplo, en una pagina de error no tiene productos. Pero siempre tiene "datos"

if (!products || products.length === 0) { // Revisamos si estamos en el final del producto
    print('😇⛑️ End of category reached.');
    endOfInventory = true; //Variable no usada en esta parte del codigo
}
pageCounter++ //Variable para incrementar el contador del extractor
for (const product of products) { // Iteramos a traves de la pagina actual de  productos
    const sku = product?._id?.codigo; //Sacamos el sku (Es un string)
    const name = product?._id?.nombreProducto; //Sacamos el nombre producto (Es un string)
    const price = product?._id?.precio; //Sacamos el precio (Es un float, pero js lo convierte a string solo)
}
```
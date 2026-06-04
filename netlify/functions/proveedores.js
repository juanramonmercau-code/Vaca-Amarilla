// Cache en memoria: guarda los datos por 10 minutos
let cache = null;
let cacheTime = 0;
const CACHE_TTL = 10 * 60 * 1000; // 10 minutos en milisegundos

exports.handler = async function(event) {
  const TOKEN = process.env.AIRTABLE_TOKEN;
  const BASE  = 'appbEEfOcGn1CsvKY';
  const TABLE = 'tblkTpl5YzzvDH9Jp';

  const now = Date.now();

  // Si hay cache válido, devolvemos eso directamente sin llamar a Airtable
  if (cache && (now - cacheTime) < CACHE_TTL) {
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify(cache)
    };
  }

  // Si no hay cache o expiró, traemos todos los registros de Airtable
  try {
    let allRecords = [];
    let offset = '';

    // Airtable pagina de a 100 — seguimos hasta traer todos
    do {
      const url = new URL(`https://api.airtable.com/v0/${BASE}/${TABLE}`);
      url.searchParams.set('pageSize', '100');
      if (offset) url.searchParams.set('offset', offset);

      const res = await fetch(url.toString(), {
        headers: { 'Authorization': `Bearer ${TOKEN}` }
      });

      if (!res.ok) {
        return {
          statusCode: res.status,
          body: JSON.stringify({ error: `Airtable error: ${res.status}` })
        };
      }

      const data = await res.json();
      allRecords = allRecords.concat(data.records || []);
      offset = data.offset || '';

    } while (offset);

    // Guardamos en cache
    cache = { records: allRecords };
    cacheTime = now;

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify(cache)
    };

  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message })
    };
  }
};

exports.handler = async function(event) {
  // Solo aceptamos POST
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: JSON.stringify({ error: 'Method not allowed' }) };
  }

  // CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'Content-Type' },
      body: ''
    };
  }

  const TOKEN = process.env.AIRTABLE_TOKEN;
  const BASE  = 'appbEEfOcGn1CsvKY';
  const TABLE = 'tblzb8vSPigUIt99f'; // Tabla Compradores

  try {
    const body = JSON.parse(event.body || '{}');
    const { nombre, empresa, email, filtros } = body;

    // Armamos los campos para Airtable
    // Email es el único obligatorio para las descargas siguientes (viene de cookie)
    const fields = {};
    if (nombre)  fields['Nombre']         = nombre;
    if (empresa) fields['Empresa']        = empresa;
    if (email)   fields['Email']          = email;
    if (filtros) fields['Filtros usados'] = filtros; // string con los filtros activos

    const res = await fetch(`https://api.airtable.com/v0/${BASE}/${TABLE}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${TOKEN}`,
        'Content-Type':  'application/json'
      },
      body: JSON.stringify({ fields })
    });

    if (!res.ok) {
      const err = await res.json();
      return {
        statusCode: res.status,
        headers: { 'Access-Control-Allow-Origin': '*' },
        body: JSON.stringify({ error: err })
      };
    }

    const data = await res.json();
    return {
      statusCode: 200,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ ok: true, id: data.id })
    };

  } catch (err) {
    return {
      statusCode: 500,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ error: err.message })
    };
  }
};

exports.handler = async function(event) {
  console.log('METHOD:', event.httpMethod);

  // CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: { 
        'Access-Control-Allow-Origin': '*', 
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS'
      },
      body: ''
    };
  }

  // Solo aceptamos POST
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: JSON.stringify({ error: 'Method not allowed' }) };
  }

  const TOKEN = process.env.AIRTABLE_TOKEN;
  const BASE  = 'appbEEfOcGn1CsvKY';
  const TABLE = 'tblzb8vSPigUIt99f';

  try {
    const body = JSON.parse(event.body || '{}');
    console.log('BODY recibido:', JSON.stringify(body));

    const { nombre, empresa, email, filtros } = body;

    const fields = {};
    if (nombre)  fields['Nombre']         = nombre;
    if (empresa) fields['Empresa']        = empresa;
    if (email)   fields['Email']          = email;
    if (filtros) fields['Filtros usados'] = filtros;

    console.log('FIELDS a enviar:', JSON.stringify(fields));

    const res = await fetch(`https://api.airtable.com/v0/${BASE}/${TABLE}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${TOKEN}`,
        'Content-Type':  'application/json'
      },
      body: JSON.stringify({ fields })
    });

    const data = await res.json();
    console.log('AIRTABLE STATUS:', res.status);
    console.log('AIRTABLE RESPONSE:', JSON.stringify(data));

    if (!res.ok) {
      return {
        statusCode: res.status,
        headers: { 'Access-Control-Allow-Origin': '*' },
        body: JSON.stringify({ error: data })
      };
    }

    return {
      statusCode: 200,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ ok: true, id: data.id })
    };

  } catch (err) {
    console.log('ERROR:', err.message);
    return {
      statusCode: 500,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ error: err.message })
    };
  }
};

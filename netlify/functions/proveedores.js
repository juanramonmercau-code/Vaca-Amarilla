exports.handler = async function(event) {
  const TOKEN = process.env.AIRTABLE_TOKEN;
  const BASE  = 'appbEEfOcGn1CsvKY';
  const TABLE = 'tblkTpl5YzzvDH9Jp';

  const offset = event.queryStringParameters?.offset || '';

  const url = new URL(`https://api.airtable.com/v0/${BASE}/${TABLE}`);
  url.searchParams.set('pageSize', '100');
  if (offset) url.searchParams.set('offset', offset);

  try {
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

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify(data)
    };

  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message })
    };
  }
};

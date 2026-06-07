const { Client } = require('pg');

const client = new Client({
  connectionString: process.env.DATABASE_URL,
});

(async () => {
  try {
    await client.connect();
    console.log('CONNECTED');
    const res = await client.query('SELECT version()');
    console.log(res.rows[0]);
    await client.end();
  } catch (err) {
    console.error(err);
  }
})();

const pg = require('pg');
const config = require('../database/database.json');
const { Client } = pg;
exports.setupDatabase = async () => {
    const client = new Client({
        user: config.user,
        host: config.host,
        password: config.password,
        port: config.port
    })
    await client.connect();

    const res = await client.query(`SELECT datname from pg_catalog.pg_database WHERE datname = '${config.database}'`);

    if (res.rowCount === 0) {
        console.log(`Database ${config.database} does not exist. Creating...`);
        await client.query(`CREATE DATABASE ${config.database}`);
        console.log(`Database ${config.database} created.`);
    } else {
        console.log(`Connection to database ${config.database} successful.`);
    }

    client.query(`CREATE TABLE IF NOT EXISTS aircraft (`)

    await client.end();

}
const pg = require('pg');
const config = require('./database.json');
const { Client } = pg;

const client = new Client({
    user: config.user,
    host: config.host,
    password: config.password,
    database: config.database,
    port: config.port
})

function handleConnection() {
    client.connect();
    client.on('error', (err) => {
        console.error('Unexpected error on idle client', err);
        process.exit(-1);
    });

    client.on('end', () => {
        console.log('Client has disconnected');
    });
}

handleConnection();

module.exports = client;
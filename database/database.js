const {Sequelize, DataTypes} = require('sequelize');
const database = require('./database.json');
const {databaseExists} = require('../functions/databaseLogic')

async function createConnection() {

    const sequelize = new Sequelize(database.database, database.user, database.password, {
        host: database.host,
        port: database.port,
        dialect: 'postgres',
        logging: false
    });

    await databaseExists(sequelize, database.database)
}

createConnection();

const sequelize = new Sequelize(`postgres://${database.user}:${database.password}@${database.host}:${database.port}/${database.database}`, {
    logging: false
});

async function authenticate() {
    try {
        await sequelize.authenticate();
        console.log('Connection has been established successfully.');
    } catch (error) {
        console.error('Unable to connect to the database:', error);
    }
}

authenticate();

module.exports = sequelize;
const sequelize = require('./database/database.js');
const { fetchFromApi, convertData, insertData } = require('./functions/dataLogic');
const EventEmitter = require('events');
class MyEmitter extends EventEmitter {}

async function processData() {
    try {
        const myEmitter = new MyEmitter();
        const { fields } = await convertData();
        myEmitter.on('data', (data) => insertData(sequelize, data, fields));

        setInterval(async () => {
            const data = await fetchFromApi()
            myEmitter.emit('data', data);
        } , 5000);

    } catch (error) {
        console.error('Error processing data:', error);
    }
}

processData();
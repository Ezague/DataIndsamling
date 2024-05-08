const sequelize = require('./database/database.js');
const { fetchFromApi, convertData, insertData } = require('./functions/dataLogic');

async function processData() {
    try {
        const data = await fetchFromApi();

        const { fields } = await convertData();

        await insertData(sequelize, data, fields);
    } catch (error) {
        console.error('Error processing data:', error);
    }
}

processData();
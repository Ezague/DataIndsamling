const request = require('request');
const { DataTypes } = require('sequelize');
const config = require('../config.json');

async function convertData () {
    const fields = {};
    config.fields.forEach(field => {
        fields[field.name] = {
            type: (() => {
                switch (field.type) {
                    case 'string':
                        return DataTypes.STRING;
                    case 'number':
                        return DataTypes.FLOAT;
                    case 'boolean':
                        return DataTypes.BOOLEAN;
                    case 'array':
                        return DataTypes.JSONB;
                    default:
                        return DataTypes.STRING;
                }
            })(),
            allowNull: true,
        };
    });
    return { fields };
}

async function fetchFromApi(timeout = 5000) {
    return new Promise((resolve, reject) => {
        const timeoutId = setTimeout(() => {
            reject(new Error('Request timed out'));
        }, timeout);

        request(config.API_URL, (error, response, body) => {
            clearTimeout(timeoutId);

            if (!error && response.statusCode == 200) {
                try {
                    const data = JSON.parse(body);
                    resolve(data);
                } catch (parseError) {
                    reject(new Error('Error parsing response data'));
                }
            } else {
                reject(new Error(`Error fetching data: ${error ? error.message : response.statusCode}`));
            }
        });
    });
}

async function insertData (sequelize, data, fields) {

    const Aircraft = sequelize.define('aircraft', fields);
    await Aircraft.sync();

    const aircraftWithKeysAndTypes = data.states.map(aircraft => {
        const aircraftObject = {};
        config.fields.forEach((field, index) => {
            const value = aircraft[index];
            const type = field.type;
            switch (type) {
                case 'number':
                    aircraftObject[field.name] = Number(value);
                    break;
                case 'boolean':
                    aircraftObject[field.name] = Boolean(value);
                    break;
                case 'array':
                    aircraftObject[field.name] = Array.isArray(value) ? value : [];
                    break;
                default:
                    aircraftObject[field.name] = String(value);
                    break;
            }
        });
        return aircraftObject;
    })
    try {
        await Aircraft.bulkCreate(aircraftWithKeysAndTypes);
        console.log('Data inserted successfully.');
    } catch (error) {
        console.error('Error inserting data:', error);
    }
}

module.exports = { fetchFromApi, convertData, insertData };
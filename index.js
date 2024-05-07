const { Sequelize, DataTypes } = require('sequelize');
const config = require('./config.json');
const database = require('./database/database.json')
const request = require('request');

// Database configuration
const sequelize = new Sequelize(`postgres://${database.user}:${database.password}@${database.host}:${database.port}`, {
    logging: false // Disable logging
});

// Function to check if a database exists
async function databaseExists(databaseName) {
    const query = `SELECT datname FROM pg_catalog.pg_database WHERE lower(datname) = lower('${databaseName}')`;
    const result = await sequelize.query(query);
    return result[0].length > 0;
}

// Define the model based on config file
const fields = {};
config.fields.forEach(field => {
    fields[field.name] = {
        type: (() => {
            switch (field.type) {
                case 'string':
                    return DataTypes.STRING;
                case 'number':
                    return DataTypes.FLOAT; // You may use DataTypes.INTEGER if all numbers are integers
                case 'boolean':
                    return DataTypes.BOOLEAN;
                case 'array':
                    return DataTypes.JSONB; // Assuming you're using PostgreSQL, change to DataTypes.ARRAY(DataTypes.STRING) for other databases
                default:
                    return DataTypes.STRING;
            }
        })(),
        allowNull: true, // Change to false if a field cannot be null
    };
});

// Create or use the database
async function initializeDatabase(databaseName) {
    const exists = await databaseExists(databaseName);
    if (!exists) {
        await sequelize.query(`CREATE DATABASE ${databaseName}`);
        console.log(`Database ${databaseName} created.`);
    } else {
        console.log(`Database ${databaseName} already exists.`);
    }
}

// Initialize the database and connect to it
initializeDatabase(database.database)
    .then(() => {
        // Connect to the database
        const sequelizeWithDatabase = new Sequelize(`postgres://${database.user}:${database.password}@${database.host}:${database.port}/${database.database}`, {
            logging: false // Disable logging
        });

        sequelizeWithDatabase.authenticate()
            .then(async () => {
                console.log('Connection has been established successfully.');

                // Define the model
                const Aircraft = sequelizeWithDatabase.define('aircraft', fields);

                // Synchronize the model with the database
                await Aircraft.sync({ force: true }); // Set force: true to drop the table if it exists and create a new one

                // Fetch data from API and insert into the database
                request(config.API_URL, async (error, response, body) => {
                    if (!error && response.statusCode == 200) {
                        const data = JSON.parse(body);

                        // Assuming data is an array of arrays, each representing an aircraft
                        const aircraftWithKeysAndTypes = data.states.map(aircraft => {
                            const aircraftObject = {};
                            config.fields.forEach((field, index) => {
                                const value = aircraft[index];
                                const type = field.type;
                                // Convert the value to the specified type
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
                        });

                        // Insert data into the database
                        await Aircraft.bulkCreate(aircraftWithKeysAndTypes);
                        console.log('Data inserted successfully.');
                    } else {
                        console.error('Failed to fetch data:', error);
                    }
                });
            })
            .catch(error => {
                console.error('Failed to connect to the database:', error);
            });
    })
    .catch(error => {
        console.error('Failed to create or use the database:', error);
    });

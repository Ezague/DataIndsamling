const request = require('request');
const config = require('../config.json');
exports.getData = async () => {
    return new Promise((resolve, reject) => {
        request({
            headers: {
                'Content-Type': ['application/json', 'charset=utf-8'],
            },
            uri: `${config.API_URL}`
        }, function (error, response, body) {
            if (error || response.statusCode !== 200) {
                return reject(error);
            }
            const data = JSON.parse(body);

            const aircraftWithKeys = data.states.map(aircraft => {
                const aircraftObject = {};
                config.keys.forEach((key, index) => {
                    aircraftObject[key] = aircraft[index];
                });
                return aircraftObject;
            });

            resolve(aircraftWithKeys);
            
        });
    });
}
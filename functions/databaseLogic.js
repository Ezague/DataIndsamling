exports.databaseExists = async function (sequelize, databasename) {
    console.log('Checking if database exists...');
    var response;
    const query = `SELECT datname FROM pg_catalog.pg_database WHERE lower(datname) = lower('${databasename}')`;
    const result = await sequelize.query(query)
    if (result[0].length > 0) {
        response = console.log(`Database ${databasename} exists.`);
    } else {
        await sequelize.query(`CREATE DATABASE ${databasename}`);
        response = console.log(`Database ${databasename} created.`);
    }
    return response;
}
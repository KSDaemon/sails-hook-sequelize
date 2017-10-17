describe('Sails.js Sequelize hook test suite', () => {

    const decache = require('decache');

    let clean = () => {
        decache('./unit/create.test');
        decache('./unit/associations.test');
        decache('./unit/scope.test');
    };

    require('./bootstrap.v0.11.test');
    clean();

    require('./bootstrap.v0.12-db-schemes.test');
    clean();

    require('./bootstrap.v0.12-migrate-safe.test');
    clean();

    require('./bootstrap.v0.12-sqlite.test');
    clean();

    require('./bootstrap.v0.12-no-conn.test');
    clean();

    require('./bootstrap.v1.0.test');
    clean();
});

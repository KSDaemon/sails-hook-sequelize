describe('Sails.js Sequelize hook test suite', () => {

    const decache = require('decache');

    let clean = () => {
        decache('./unit/create.test');
        decache('./unit/associations.test');
        decache('./unit/scope.test');
    };

    require('./bootstrap.v0.11.test');
    clean();

    require('./bootstrap.v0.12-many-schemes.test');
    clean();

    require('./bootstrap.v0.12-create-db-schemes.test');
    clean();

    // this test should run after bootstrap.v0.12-create-db-schemes because it doesn't create tables
    require('./bootstrap.v0.12-migrate-safe.test');
    clean();

    require('./bootstrap.v0.12-sqlite.test');
    clean();

    require('./bootstrap.v0.12-no-conn.test');
    clean();

    require('./bootstrap.v1.0.test');
    clean();
});

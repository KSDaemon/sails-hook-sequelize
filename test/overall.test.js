describe('Sails.js Sequelize hook test suite', () => {

    const decache = require('decache');

    let clean = () => {
        decache('./unit/create.test');
        decache('./unit/associations.test');
        decache('./unit/scope.test');
    };

    require('./bootstrap.v0.11.test');
    clean();

    require('./bootstrap.v0.12.test');
    clean();

    require('./bootstrap.v1.x.test');
    clean();

    require('./bootstrap.v1.x-many-schemes.test');
    clean();

    require('./bootstrap.v1.x-create-db-schemes.test');
    clean();

    // this test should run after bootstrap.v1.x-create-db-schemes because it doesn't create tables
    require('./bootstrap.v1.x-migrate-safe.test');
    clean();

    require('./bootstrap.v1.x-sqlite.test');
    clean();

    require('./bootstrap.v1.x-no-conn.test');
    clean();

    require('./bootstrap.v1.x-sequelize-waterline.test');
    clean();

});

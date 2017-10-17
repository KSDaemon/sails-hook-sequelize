describe('Sails.js Sequelize hook test suite', function () {

    const decache = require('decache');

    let clean = function() {
        decache('./unit/create.test');
        decache('./unit/associations.test');
        decache('./unit/scope.test');
    };

    require('./bootstrap.v0.11.test');
    clean();

    require('./bootstrap.v0.12.test');
    clean();

    require('./bootstrap.v0.12-migrate-safe.test');
    clean();

    require('./bootstrap.v1.0.test');
    clean();
});

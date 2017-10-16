describe('Sails.js Sequelize hook test suite', function () {

    const decache = require('decache');

    require('./bootstrap.v0.11.test');
    decache('./unit/create.test');
    decache('./unit/associations.test');
    decache('./unit/scope.test');

    require('./bootstrap.v0.12.test');
    decache('./unit/create.test');
    decache('./unit/associations.test');
    decache('./unit/scope.test');

    require('./bootstrap.v1.0.test');
    decache('./unit/create.test');
    decache('./unit/associations.test');
    decache('./unit/scope.test');
});

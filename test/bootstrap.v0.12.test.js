var Sails = require('./fixtures/v0.12-app/app').sails;
var rc = require('rc');
var decache = require('decache');

describe('Sails.js v0.12 Sequelize hook tests', function () {

    // Var to hold a running sails app instance
    var sails;

    // Before running any tests, attempt to lift Sails
    before(function (done) {

        // Hook will timeout in 10 seconds
        this.timeout(11000);

        var config = rc('sails');
        config.hooks.sequelize = require('../index');

        // Attempt to lift sails
        Sails().lift(config, function (err, _sails) {
            if (err) { return done(err); }
            sails = _sails;
            return done(err, sails);
        });
    });

    // Test that Sails can lift with the hook in place
    it('sails does not crash', function () {
        return true;
    });

    require('./unit/ORM.test');
    decache('./unit/ORM.test');

    after(function (done) {
        sails.lower(function (err) {
            if (err) {
                return console.log('Error occurred lowering Sails app: ', err);
            }
            console.log('Sails app lowered successfully!');
            done();
        });
    });
});

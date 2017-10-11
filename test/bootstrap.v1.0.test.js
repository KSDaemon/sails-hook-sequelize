describe('Sails.js v1.0 Sequelize hook tests', function () {

    var Sails, rc, sails;

    // Before running any tests, attempt to lift Sails
    before(function (done) {

        // Hook will timeout in 10 seconds
        this.timeout(11000);

        Sails = require('./fixtures/v1.0-app/app').sails;
        rc = require('rc');

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

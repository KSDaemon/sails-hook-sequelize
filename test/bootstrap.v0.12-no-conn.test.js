describe('Sails.js v0.12 Sequelize hook tests without connections', () => {

    let Sails, rc;

    // Before running any tests, attempt to lift Sails
    before(function () {

        // Hook will timeout in 10 seconds
        this.timeout(11000);

    });

    // Test that Sails cannot lift without connections provided
    it('should fail lifting without db connections ', done => {

        Sails = require('./fixtures/v0.12-no-conn-app/app').sails;
        rc = require('rc');

        const config = rc('sails');
        config.hooks.sequelize = require('../index');

        // Attempt to lift sails
        Sails().lift(config, (err, _sails) => {
            if (err) { return done(); }
            return done(err);
        });

    });

});

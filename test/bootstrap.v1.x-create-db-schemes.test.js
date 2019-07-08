describe('Sails.js v1.x Sequelize hook tests with db schemes (psql)', () => {

    let Sails, rc, sails;

    // Before running any tests, attempt to lift Sails
    before(function (done) {

        // Hook will timeout in 10 seconds
        this.timeout(11000);

        const Sequelize = require('sequelize'),
            connInfo = require('./fixtures/v1.x-create-db-schemes-app/config/datastores').datastores.somePostgresqlServer;

        let connection = new Sequelize(connInfo.url, connInfo.options);

        // Drop schemas if exists
        connection.query('DROP SCHEMA IF EXISTS sails, sails_img CASCADE;').then(() => {
            Sails = require('./fixtures/v1.x-create-db-schemes-app/app').sails;
            rc = require('rc');

            const config = rc('sails');
            config.hooks.sequelize = require('../index');

            // Attempt to lift sails
            Sails().lift(config, (err, _sails) => {
                if (err) { return done(err); }
                sails = _sails;
                return done(err, sails);
            });
        });

    });

    // Test that Sails can lift with the hook in place
    it('sails does not crash', () => true);

    require('./unit/create.test');
    require('./unit/associations.test');
    require('./unit/scope.test');

    after(done => {
        sails.lower(err => {
            if (err) {
                return console.log('Error occurred lowering Sails app: ', err);
            }
            console.log('Sails app lowered successfully!');
            done();
        });
    });
});

var Sails = require('./fixtures/sample-app/app').sails;

describe('Sails.js Sequelize hook tests ::', function() {

  // Var to hold a running sails app instance
  var sails;

  // Before running any tests, attempt to lift Sails
  before(function(done) {

    // Hook will timeout in 10 seconds
    this.timeout(11000);

    // Attempt to lift sails
    Sails().lift({
      hooks: {
        "sequelize": require('../'),
        // Load the hook
        "orm": false,
        "pubsub": false,
        // Skip grunt (unless your hook uses it)
        "grunt": false,
      }
    },function (err, _sails) {
        if (err) return done(err);
        sails = _sails;
        return done(err, sails);
    });
  });

  // After tests are complete, lower Sails
  after(function (done) {
    return done();
  });

  // Test that Sails can lift with the hook in place
  it('sails does not crash', function() {
    return true;
  });
});

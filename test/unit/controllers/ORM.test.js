var request = require('supertest');
var should = require('should');
var fixtures = require('./../../fixtures/instances.json');

describe('User model', function() {
  it('should create user instance', function(done) {
    User.create(fixtures.user).then(function(user) {
      user.should.be.type('object');
      user.should.have.property('name', fixtures.user.name);
      user.should.have.property('id');

      fixtures.user = user;

      done();
    }).catch(function(err) {
      done(err);
    });
  });  
});

describe('Image model', function() {
  it('should create image instance', function(done) {
    Image.create(fixtures.image).then(function(image) {
      image.should.be.type('object');
      image.should.have.property('url', fixtures.image.url);
      image.should.have.property('id');

      fixtures.image = image;
      done();
    }).catch(function(err) {
      done(err);
    });
  });
});

describe('UserGroup model', function() {
  it('should create user group instance', function(done) {
    UserGroup.create(fixtures.userGroup).then(function(userGroup) {
      userGroup.should.be.type('object');
      userGroup.should.have.property('name', fixtures.userGroup.name);
      userGroup.should.have.property('id');

      fixtures.userGroup = userGroup;

      done();
    }).catch(function(err) {
      done(err);
    });
  });    
});

describe('Associations', function() {
  it('should add image to user', function(done) {
    var user = fixtures.user;
    var image = fixtures.image;

    user.addImage(image).then(function() {
      done();      
    }).catch(function(err) {
      done(err);
    });
  });

  it('User should contain image', function(done) {
    User.findOne({
      where: {
        id: fixtures.user.id
      },
      include: [
      {model: Image, as: 'images'}
      ]
    }).then(function(user) {
      user.should.have.property('images');

      var image = user.images.shift();
      image.should.be.type('object');
      image.should.have.property('url', fixtures.image.url);

      fixtures.user = user;
      done();
    }).catch(function(err) {
      done(err);
    }); 
  });

  it('Image should have owner', function(done) {
    Image.findOne({
      where: {
        id: fixtures.image.id
      },
      include: [
      {model: User}
      ]
    }).then(function(image) {
      image.should.have.property('User');
      image.User.should.be.type('object');
      image.User.should.have.property('name', fixtures.user.name);

      fixtures.image = image;

      done();
    }).catch(function(err) {
      done(err);
    });
  });

  it('shoud add user to user group', function(done) {
    var userGroup = fixtures.userGroup;
    var user = fixtures.user;

    userGroup.addUser(user).then(function(userGroup) {
      done();
    }).catch(function(err) {
      done(err);
    });
  });

  it('UserGroup should contain user', function(done) {
    UserGroup.findOne({
      where: {
        id: fixtures.userGroup.id
      },
      include: [
      {model: User, as: 'users'}
      ]
    }).then(function(userGroup) {
      userGroup.should.have.property('users');

      var user = userGroup.users.shift();
      user.should.be.type('object');
      user.id.should.equal(fixtures.user.id);

      done();
    }).catch(function(err) {
      done(err);
    });
  });
});

describe('Default scope', function() {
  it('User shoud contain images', function(done) {
    User.findOne({
      where: {
        id: fixtures.user.id
      }      
    }).then(function(user) {
      user.should.have.property('images');

      var image = user.images.shift();
      image.should.be.type('object');
      image.should.have.property('url', fixtures.image.url);

      done();
    }).catch(function(err) {
      done(err);
    }); 
  });

  it('UserGroup shoud contain users', function(done) {
    UserGroup.findOne({
      where: {
        id: fixtures.userGroup.id
      }      
    }).then(function(userGroup) {
      userGroup.should.have.property('users');

      var user = userGroup.users.shift();
      user.should.be.type('object');
      user.id.should.equal(fixtures.user.id);

      done();
    }).catch(function(err) {
      done(err);
    }); 
  });

  it('UserGroup shoud contain users images', function(done) {
    UserGroup.findOne({
      where: {
        id: fixtures.userGroup.id
      }      
    }).then(function(userGroup) {
      userGroup.should.have.property('users');

      var user = userGroup.users.shift();
      user.should.be.type('object');
      user.id.should.equal(fixtures.user.id);
      user.should.have.property('images');

      var image = user.images.shift();
      image.should.be.type('object');
      image.should.have.property('url', fixtures.image.url);

      done();
    }).catch(function(err) {
      done(err);
    }); 
  });
});
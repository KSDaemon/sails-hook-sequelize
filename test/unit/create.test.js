// var request = require('supertest');
var should = require('should');
var fixtures = require('./../fixtures/instances.json');

describe('User model', function () {
    it('should create user instance', function (done) {
        User.create(fixtures.user).then(function (user) {
            user.should.be.type('object');
            user.should.have.property('name', fixtures.user.name);
            user.should.have.property('id');

            done();
        }).catch(function (err) {
            done(err);
        });
    });
});

describe('Image model', function () {
    it('should create image instance', function (done) {
        Image.create(fixtures.image).then(function (image) {
            image.should.be.type('object');
            image.should.have.property('url', fixtures.image.url);
            image.should.have.property('id');

            done();
        }).catch(function (err) {
            done(err);
        });
    });
});

describe('Group model', function () {
    it('should create user group instance', function (done) {
        Group.create(fixtures.group).then(function (group) {
            group.should.be.type('object');
            group.should.have.property('name', fixtures.group.name);
            group.should.have.property('id');

            done();
        }).catch(function (err) {
            done(err);
        });
    });
});

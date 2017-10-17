// var request = require('supertest');
const should = require('should');
const fixtures = require('./../fixtures/instances.json');

describe('User model', () => {
    it('should create user instance', done => {
        User.create(fixtures.user).then(user => {
            user.should.be.type('object');
            user.should.have.property('name', fixtures.user.name);
            user.should.have.property('id');

            done();
        }).catch(err => {
            done(err);
        });
    });
});

describe('Image model', () => {
    it('should create image instance', done => {
        Image.create(fixtures.image).then(image => {
            image.should.be.type('object');
            image.should.have.property('url', fixtures.image.url);
            image.should.have.property('id');

            done();
        }).catch(err => {
            done(err);
        });
    });
});

describe('Group model', () => {
    it('should create user group instance', done => {
        Group.create(fixtures.group).then(group => {
            group.should.be.type('object');
            group.should.have.property('name', fixtures.group.name);
            group.should.have.property('id');

            done();
        }).catch(err => {
            done(err);
        });
    });
});

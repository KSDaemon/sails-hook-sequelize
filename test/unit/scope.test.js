// var request = require('supertest');
var should = require('should');
var fixtures = require('./../fixtures/instances.json');

describe('Default scope', function () {
    var user, image, group;

    before (function (done) {
        var imagePromise = Image.create(fixtures.image);

        var userPromise = imagePromise.then(function(image) {
            return User.create(fixtures.user).then(function(user) {
                return user.addImage(image).then(function() {
                    return User.findById(user.id);
                });
            });
        });

        var groupPromise = userPromise.then(function(user) {
            return Group.create(fixtures.group).then(function(group) {
                return group.addUser(user).then(function() {
                    return Group.findById(group.id); 
                });
            });
        });

        userPromise.then(function (object) {
            user = object;
        });

        imagePromise.then(function (object) {
            image = object;
        });

        groupPromise.then(function (object) {
            group = object;
        });

        Promise.all([userPromise, imagePromise, groupPromise]).then(function() {
            done(); 
        }).catch(function (err) {
            done(err);
        });
    });

    it('User shoud contain images', function (done) {
        User.findOne({
            where: {
                id: user.id
            }
        }).then(function (user) {
            user.should.have.property('images');

            var image = user.images.shift();
            image.should.be.type('object');
            image.should.have.property('url', image.url);

            done();
        }).catch(function (err) {
            done(err);
        });
    });

    it('Group shoud contain users', function (done) {
        Group.findOne({
            where: {
                id: group.id
            }
        }).then(function (group) {
            group.should.have.property('users');

            var user = group.users.shift();
            user.should.be.type('object');
            user.id.should.equal(user.id);

            done();
        }).catch(function (err) {
            done(err);
        });
    });

    it('Group shoud contain users images', function (done) {
        Group.findOne({
            where: {
                id: group.id
            }
        }).then(function (group) {
            group.should.have.property('users');

            var user = group.users.shift();
            user.should.be.type('object');
            user.id.should.equal(user.id);
            user.should.have.property('images');

            var image = user.images.shift();
            image.should.be.type('object');
            image.should.have.property('url', image.url);

            done();
        }).catch(function (err) {
            done(err);
        });
    });
});

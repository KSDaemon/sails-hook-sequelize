// var request = require('supertest');
var should = require('should');
var fixtures = require('./../fixtures/instances.json');

describe('Associations', function () {
    var user, image, group;

    before (function (done) {
        var userPromise = User.create(fixtures.user);
        var imagePromise = Image.create(fixtures.image);
        var groupPromise = Group.create(fixtures.group);

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

    it('should add image to user', function (done) {
        user.addImage(image).then(function () {
            done();
        }).catch(function (err) {
            done(err);
        });
    });

    it('User should contain image', function (done) {
        User.findOne({
            where: {
                id: user.id
            },
            include: [
                { model: Image, as: 'images' }
            ]
        }).then(function (object) {
            object.should.have.property('images');

            var image = object.images.shift();
            image.should.be.type('object');
            image.should.have.property('url', image.url);

            done();
        }).catch(function (err) {
            done(err);
        });
    });

    it('Image should have owner', function (done) {
        Image.findOne({
            where: {
                id: image.id
            },
            include: [
                { model: User }
            ]
        }).then(function (image) {
            image.should.have.property('User');
            image.User.should.be.type('object');
            image.User.should.have.property('name', user.name);

            done();
        }).catch(function (err) {
            done(err);
        });
    });

    it('shoud add user to user group', function (done) {
        group.addUser(user).then(function (group) {
            done();
        }).catch(function (err) {
            done(err);
        });
    });

    it('Group should contain user', function (done) {
        Group.findOne({
            where: {
                id: group.id
            },
            include: [
                { model: User, as: 'users' }
            ]
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
});

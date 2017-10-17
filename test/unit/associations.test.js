// var request = require('supertest');
const should = require('should');
const fixtures = require('./../fixtures/instances.json');

describe('Associations', () => {
    let user, image, group;

    before (done => {
        const userPromise = User.create(fixtures.user);
        const imagePromise = Image.create(fixtures.image);
        const groupPromise = Group.create(fixtures.group);

        userPromise.then(object => {
            user = object;
        });

        imagePromise.then(object => {
            image = object;
        });

        groupPromise.then(object => {
            group = object;
        });

        Promise.all([userPromise, imagePromise, groupPromise]).then(() => {
            done();
        }).catch(err => {
            done(err);
        });
    });

    it('should add image to user', done => {
        user.addImage(image).then(() => {
            done();
        }).catch(err => {
            done(err);
        });
    });

    it('User should contain image', done => {
        User.findOne({
            where: {
                id: user.id
            },
            include: [
                { model: Image, as: 'images' }
            ]
        }).then(object => {
            object.should.have.property('images');

            const image = object.images.shift();
            image.should.be.type('object');
            image.should.have.property('url', image.url);

            done();
        }).catch(err => {
            done(err);
        });
    });

    it('Image should have owner', done => {
        Image.findOne({
            where: {
                id: image.id
            },
            include: [
                { model: User }
            ]
        }).then(image => {
            image.should.have.property('User');
            image.User.should.be.type('object');
            image.User.should.have.property('name', user.name);

            done();
        }).catch(err => {
            done(err);
        });
    });

    it('shoud add user to user group', done => {
        group.addUser(user).then(group => {
            done();
        }).catch(err => {
            done(err);
        });
    });

    it('Group should contain user', done => {
        Group.findOne({
            where: {
                id: group.id
            },
            include: [
                { model: User, as: 'users' }
            ]
        }).then(group => {
            group.should.have.property('users');

            const user = group.users.shift();
            user.should.be.type('object');
            user.id.should.equal(user.id);

            done();
        }).catch(err => {
            done(err);
        });
    });
});

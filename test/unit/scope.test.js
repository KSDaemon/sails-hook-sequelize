// var request = require('supertest');
const should = require('should');
const fixtures = require('./../fixtures/instances.json');

describe('Default scope', () => {
    let user, image, group;

    before (done => {
        const imagePromise = Image.create(fixtures.image);

        const userPromise = imagePromise.then(image => User.create(fixtures.user).then(user => user.addImage(image).then(() => User.findByPk(user.id))));

        const groupPromise = userPromise.then(user => Group.create(fixtures.group).then(group => group.addUser(user).then(() => Group.findByPk(group.id))));

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

    it('User shoud contain images', done => {
        User.findOne({
            where: {
                id: user.id
            }
        }).then(user => {
            user.should.have.property('images');

            const image = user.images.shift();
            image.should.be.type('object');
            image.should.have.property('url', image.url);

            done();
        }).catch(err => {
            done(err);
        });
    });

    it('Group shoud contain users', done => {
        Group.findOne({
            where: {
                id: group.id
            }
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

    it('Group shoud contain users images', done => {
        Group.findOne({
            where: {
                id: group.id
            }
        }).then(group => {
            group.should.have.property('users');

            const user = group.users.shift();
            user.should.be.type('object');
            user.id.should.equal(user.id);
            user.should.have.property('images');

            const image = user.images.shift();
            image.should.be.type('object');
            image.should.have.property('url', image.url);

            done();
        }).catch(err => {
            done(err);
        });
    });
});

var request = require('supertest');
var should  = require('should');
var user = {};

describe('User controller', function(){
    before(function(){
        user = {
            name: 'Tester',
            age: 21
        };
    });

    it('Create a user', function(done){
        request(sails.hooks.http.app)
        .post('/user/create')
        .send(user)
        .expect(200)
        .end(function(err, response){
            if(err) {
                return done(err);
            }

            response.body.should.be.type('object').and.have.property('name', 'Tester');
            user.id = response.body.id;
            done();
        });
    });
  });

describe('Image controller', function(){
    it('Create an image', function(done){
        request(sails.hooks.http.app)
        .post('/image/create')
        .send({
            owner: user.id,
            url: 'http://google.com'
        })
        .expect(200)
        .end(function(err, response){
            if(err) {
                return done(err);
            }

            response.body.should.be.type('object').and.have.property('url', 'http://google.com');
            user.id = response.body.id;
            done();
        });
    });
  });

describe('Associations', function(){
    it('User images', function(done){
        request(sails.hooks.http.app)
        .get('/user')
        .expect(200)
        .end(function(err, response){  
            var testUser = response.body[0];
            var image = testUser.images[0];
            image.should.be.type('object');
            image.should.have.property('url', 'http://google.com');
            done();
        });
    });
  });
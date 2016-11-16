'use strict';

var _interopRequireDefault = require('babel-runtime/helpers/interop-require-default')['default'];

var _supertest = require('supertest');

var _supertest2 = _interopRequireDefault(_supertest);

var app = require('../..');

var User = require('../user/user.model');

var newQuestion;

describe('Question API:', function () {
  var user;
  before(function () {
    return User.removeAsync().then(function () {
      user = new User({
        name: 'Fake User',
        email: 'test@test.com',
        password: 'password'
      });

      return user.saveAsync();
    });
  });

  var token;
  before(function (done) {
    (0, _supertest2['default'])(app).post('/auth/local').send({
      email: 'test@test.com',
      password: 'password'
    }).expect(200).expect('Content-Type', /json/).end(function (err, res) {
      token = res.body.token;
      done();
    });
  });

  describe('GET /api/questions', function () {
    var questions;

    beforeEach(function (done) {
      (0, _supertest2['default'])(app).get('/api/questions').expect(200).expect('Content-Type', /json/).end(function (err, res) {
        if (err) {
          return done(err);
        }
        questions = res.body;
        done();
      });
    });

    it('should respond with JSON array', function () {
      questions.should.be.instanceOf(Array);
    });
  });

  describe('POST /api/questions', function () {
    beforeEach(function (done) {
      (0, _supertest2['default'])(app).post('/api/questions').set('authorization', 'Bearer ' + token).send({
        title: 'New Question',
        content: 'This is the brand new question!!!'
      }).expect(201).expect('Content-Type', /json/).end(function (err, res) {
        if (err) {
          return done(err);
        }
        newQuestion = res.body;
        console.warn("newQuestion:test1", newQuestion);
        done();
      });
    });

    it('should respond with the newly created question', function () {
      console.warn("newQuestion:test2", newQuestion);
      newQuestion.title.should.equal('New Question');
      newQuestion.content.should.equal('This is the brand new question!!!');
    });
  });

  describe('GET /api/questions/:id', function () {
    var question;

    beforeEach(function (done) {
      (0, _supertest2['default'])(app).get('/api/questions/' + newQuestion._id).expect(200).expect('Content-Type', /json/).end(function (err, res) {
        if (err) {
          return done(err);
        }
        question = res.body;
        done();
      });
    });

    afterEach(function () {
      question = {};
    });

    it('should respond with the requested question', function () {
      question.title.should.equal('New Question');
      question.content.should.equal('This is the brand new question!!!');
    });
  });

  /*
    describe('PUT /api/questions/:id', function() {
      var updatedQuestion;
  
      beforeEach(function(done) {
        request(app)
          .put('/api/questions/' + newQuestion._id)
          .set('authorization', 'Bearer ' + token)
          .send({
            title: 'Updated Question',
            content: 'This is the updated question!!!'
          })
          .expect(200)
          .expect('Content-Type', /json/)
          .end(function(err, res) {
            if (err) {
              return done(err);
            }
            updatedQuestion = res.body;
            done();
          });
      });
      afterEach(function() {
        updatedQuestion = {};
      });
  
      it('should respond with the updated question', function() {
        updatedQuestion.title.should.equal('Updated Question');
        updatedQuestion.content.should.equal('This is the updated question!!!');
      });
  
    });
  */

  describe('DELETE /api/questions/:id', function () {

    it('should respond with 204 on successful removal', function (done) {
      (0, _supertest2['default'])(app)['delete']('/api/questions/' + newQuestion._id).set('authorization', 'Bearer ' + token).expect(204).end(function (err, res) {
        if (err) {
          return done(err);
        }
        done();
      });
    });

    it('should respond with 404 when question does not exist', function (done) {
      (0, _supertest2['default'])(app)['delete']('/api/questions/' + newQuestion._id).set('authorization', 'Bearer ' + token).expect(404).end(function (err, res) {
        if (err) {
          return done(err);
        }
        done();
      });
    });
  });
});
//# sourceMappingURL=question.integration.js.map

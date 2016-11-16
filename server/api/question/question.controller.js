/**
 * Using Rails-like standard naming convention for endpoints.
 * GET     /api/questions              ->  index
 * POST    /api/questions              ->  create
 * GET     /api/questions/:id          ->  show
 * PUT     /api/questions/:id          ->  update
 * DELETE  /api/questions/:id          ->  destroy
 */

'use strict';

var _interopRequireDefault = require('babel-runtime/helpers/interop-require-default')['default'];

Object.defineProperty(exports, '__esModule', {
  value: true
});
exports.index = index;
exports.show = show;
exports.create = create;
exports.update = update;
exports.destroy = destroy;
exports.createAnswer = createAnswer;
exports.destroyAnswer = destroyAnswer;
exports.updateAnswer = updateAnswer;
exports.createComment = createComment;
exports.destroyComment = destroyComment;
exports.updateComment = updateComment;
exports.createAnswerComment = createAnswerComment;
exports.destroyAnswerComment = destroyAnswerComment;
exports.updateAnswerComment = updateAnswerComment;
exports.star = star;
exports.unstar = unstar;
exports.starAnswer = starAnswer;
exports.unstarAnswer = unstarAnswer;
exports.starComment = starComment;
exports.unstarComment = unstarComment;
exports.starAnswerComment = starAnswerComment;
exports.unstarAnswerComment = unstarAnswerComment;

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _questionModel = require('./question.model');

var _questionModel2 = _interopRequireDefault(_questionModel);

function respondWithResult(res, statusCode) {
  statusCode = statusCode || 200;
  return function (entity) {
    if (entity) {
      res.status(statusCode).json(entity);
    }
  };
}

function saveUpdates(updates) {
  return function (entity) {
    var updated = _lodash2['default'].merge(entity, updates);
    return updated.saveAsync().spread(function (updated) {
      return updated;
    });
  };
}

function removeEntity(res) {
  return function (entity) {
    if (entity) {
      return entity.removeAsync().then(function () {
        res.status(204).end();
      });
    }
  };
}

function handleEntityNotFound(res) {
  return function (entity) {
    if (!entity) {
      res.status(404).end();
      return null;
    }
    return entity;
  };
}

function handleError(res, statusCode) {
  statusCode = statusCode || 500;
  return function (err) {
    res.status(statusCode).send(err);
  };
}
function handleUnauthorized(req, res) {
  return function (entity) {
    if (!entity) {
      return null;
    }
    if (entity.user._id.toString() !== req.user._id.toString()) {
      res.send(403).end();
      return null;
    }
    return entity;
  };
}
// Gets a list of Questions

function index(req, res) {
  var query = req.query.query && JSON.parse(req.query.query);
  _questionModel2['default'].find(query).sort({ createdAt: -1 }).limit(20).execAsync().then(respondWithResult(res))['catch'](handleError(res));
}

// Gets a single Question from the DB

function show(req, res) {
  _questionModel2['default'].findByIdAsync(req.params.id).then(handleEntityNotFound(res)).then(respondWithResult(res))['catch'](handleError(res));
}

// Creates a new Question in the DB

function create(req, res) {
  req.body.user = req.user;
  _questionModel2['default'].createAsync(req.body).then(respondWithResult(res, 201))['catch'](handleError(res));
}

// Updates an existing Question in the DB

function update(req, res) {
  if (req.body._id) {
    delete req.body._id;
  }
  _questionModel2['default'].findByIdAsync(req.params.id).then(handleEntityNotFound(res)).then(handleUnauthorized(req, res)).then(saveUpdates(req.body)).then(respondWithResult(res))['catch'](handleError(res));
}

// Deletes a Question from the DB

function destroy(req, res) {
  _questionModel2['default'].findByIdAsync(req.params.id).then(handleEntityNotFound(res)).then(handleUnauthorized(req, res)).then(removeEntity(res))['catch'](handleError(res));
}

function createAnswer(req, res) {
  req.body.user = req.user;
  _questionModel2['default'].update({ _id: req.params.id }, { $push: { answers: req.body } }, function (err, num) {
    if (err) {
      return handleError(res)(err);
    }
    if (num === 0) {
      return res.send(404).end();
    }
    exports.show(req, res);
    _questionModel2['default'].updateSearchText(req.params.id);
  });
}

function destroyAnswer(req, res) {
  _questionModel2['default'].update({ _id: req.params.id }, { $pull: { answers: { _id: req.params.answerId, 'user': req.user._id } } }, function (err, num) {
    if (err) {
      return handleError(res)(err);
    }
    if (num === 0) {
      return res.send(404).end();
    }
    exports.show(req, res);
    _questionModel2['default'].updateSearchText(req.params.id);
  });
}

function updateAnswer(req, res) {
  _questionModel2['default'].update({ _id: req.params.id, 'answers._id': req.params.answerId }, { 'answers.$.content': req.body.content, 'answers.$.user': req.user.id }, function (err, num) {
    if (err) {
      return handleError(res)(err);
    }
    if (num === 0) {
      return res.send(404).end();
    }
    exports.show(req, res);
    _questionModel2['default'].updateSearchText(req.params.id);
  });
}

/* comments APIs */

function createComment(req, res) {
  req.body.user = req.user.id;
  _questionModel2['default'].update({ _id: req.params.id }, { $push: { comments: req.body } }, function (err, num) {
    if (err) {
      return handleError(res)(err);
    }
    if (num === 0) {
      return res.send(404).end();
    }
    exports.show(req, res);
    _questionModel2['default'].updateSearchText(req.params.id);
  });
}

function destroyComment(req, res) {
  _questionModel2['default'].update({ _id: req.params.id }, { $pull: { comments: { _id: req.params.commentId, 'user': req.user._id } } }, function (err, num) {
    if (err) {
      return handleError(res)(err);
    }
    if (num === 0) {
      return res.send(404).end();
    }
    exports.show(req, res);
    _questionModel2['default'].updateSearchText(req.params.id);
  });
}

function updateComment(req, res) {
  _questionModel2['default'].update({ _id: req.params.id, 'comments._id': req.params.commentId }, { 'comments.$.content': req.body.content, 'comments.$.user': req.user.id }, function (err, num) {
    if (err) {
      return handleError(res)(err);
    }
    if (num === 0) {
      return res.send(404).end();
    }
    exports.show(req, res);
    _questionModel2['default'].updateSearchText(req.params.id);
  });
}

/* answersComments APIs */

function createAnswerComment(req, res) {
  req.body.user = req.user.id;
  _questionModel2['default'].update({ _id: req.params.id, 'answers._id': req.params.answerId }, { $push: { 'answers.$.comments': req.body } }, function (err, num) {
    if (err) {
      return handleError(res)(err);
    }
    if (num === 0) {
      return res.send(404).end();
    }
    exports.show(req, res);
    _questionModel2['default'].updateSearchText(req.params.id);
  });
}

function destroyAnswerComment(req, res) {
  _questionModel2['default'].update({ _id: req.params.id, 'answers._id': req.params.answerId }, { $pull: { 'answers.$.comments': { _id: req.params.commentId, 'user': req.user._id } } }, function (err, num) {
    if (err) {
      return handleError(res)(err);
    }
    if (num === 0) {
      return res.send(404).end();
    }
    exports.show(req, res);
    _questionModel2['default'].updateSearchText(req.params.id);
  });
}

function updateAnswerComment(req, res) {
  _questionModel2['default'].find({ _id: req.params.id }).exec(function (err, questions) {
    if (err) {
      return handleError(res)(err);
    }
    if (questions.length === 0) {
      return res.send(404).end();
    }
    var question = questions[0];
    var found = false;
    for (var i = 0; i < question.answers.length; i++) {
      if (question.answers[i]._id.toString() === req.params.answerId) {
        found = true;
        var conditions = {};
        conditions._id = req.params.id;
        conditions['answers.' + i + '.comments._id'] = req.params.commentId;
        conditions['answers.' + i + '.comments.user'] = req.user._id;
        var doc = {};
        doc['answers.' + i + '.comments.$.content'] = req.body.content;
        /*jshint -W083 */
        _questionModel2['default'].update(conditions, doc, function (err, num) {
          if (err) {
            return handleError(res)(err);
          }
          if (num === 0) {
            return res.send(404).end();
          }
          exports.show(req, res);
          _questionModel2['default'].updateSearchText(req.params.id);
          return;
        });
      }
    }
    if (!found) {
      return res.send(404).end();
    }
  });
}

/* star/unstar question */

function star(req, res) {
  _questionModel2['default'].update({ _id: req.params.id }, { $push: { stars: req.user.id } }, function (err, num) {
    if (err) {
      return handleError(res)(err);
    }
    if (num === 0) {
      return res.send(404).end();
    }
    exports.show(req, res);
  });
}

function unstar(req, res) {
  _questionModel2['default'].update({ _id: req.params.id }, { $pull: { stars: req.user.id } }, function (err, num) {
    if (err) {
      return handleError(res, err);
    }
    if (num === 0) {
      return res.send(404).end();
    }
    exports.show(req, res);
  });
}

/* star/unstar answer */

function starAnswer(req, res) {
  _questionModel2['default'].update({ _id: req.params.id, 'answers._id': req.params.answerId }, { $push: { 'answers.$.stars': req.user.id } }, function (err, num) {
    if (err) {
      return handleError(res)(err);
    }
    if (num === 0) {
      return res.send(404).end();
    }
    exports.show(req, res);
  });
}

function unstarAnswer(req, res) {
  _questionModel2['default'].update({ _id: req.params.id, 'answers._id': req.params.answerId }, { $pull: { 'answers.$.stars': req.user.id } }, function (err, num) {
    if (err) {
      return handleError(res)(err);
    }
    if (num === 0) {
      return res.send(404).end();
    }
    exports.show(req, res);
  });
}

/* star/unstar question comment */

function starComment(req, res) {
  _questionModel2['default'].update({ _id: req.params.id, 'comments._id': req.params.commentId }, { $push: { 'comments.$.stars': req.user.id } }, function (err, num) {
    if (err) {
      return handleError(res)(err);
    }
    if (num === 0) {
      return res.send(404).end();
    }
    exports.show(req, res);
  });
}

function unstarComment(req, res) {
  _questionModel2['default'].update({ _id: req.params.id, 'comments._id': req.params.commentId }, { $pull: { 'comments.$.stars': req.user.id } }, function (err, num) {
    if (err) {
      return handleError(res)(err);
    }
    if (num === 0) {
      return res.send(404).end();
    }
    exports.show(req, res);
  });
}

/* star/unstar question answer comment */
var pushOrPullStarAnswerComment = function pushOrPullStarAnswerComment(op, req, res) {
  _questionModel2['default'].find({ _id: req.params.id }).exec(function (err, questions) {
    if (err) {
      return handleError(res)(err);
    }
    if (questions.length === 0) {
      return res.send(404).end();
    }
    var question = questions[0];
    var found = false;
    for (var i = 0; i < question.answers.length; i++) {
      if (question.answers[i]._id.toString() === req.params.answerId) {
        found = true;
        var conditions = {};
        conditions._id = req.params.id;
        conditions['answers.' + i + '.comments._id'] = req.params.commentId;
        var doc = {};
        doc[op] = {};
        doc[op]['answers.' + i + '.comments.$.stars'] = req.user.id;
        // Question.update({_id: req.params.id, 'answers.' + i + '.comments._id': req.params.commentId}, {op: {('answers.' + i + '.comments.$.stars'): req.user.id}}, function(err, num){
        /*jshint -W083 */
        _questionModel2['default'].update(conditions, doc, function (err, num) {
          if (err) {
            return handleError(res)(err);
          }
          if (num === 0) {
            return res.send(404).end();
          }
          exports.show(req, res);
          return;
        });
      }
    }
    if (!found) {
      return res.send(404).end();
    }
  });
};

function starAnswerComment(req, res) {
  pushOrPullStarAnswerComment('$push', req, res);
}

function unstarAnswerComment(req, res) {
  pushOrPullStarAnswerComment('$pull', req, res);
}
//# sourceMappingURL=question.controller.js.map

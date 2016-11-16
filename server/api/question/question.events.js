/**
 * Question model events
 */

'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _events = require('events');

var Question = require('./question.model');
var QuestionEvents = new _events.EventEmitter();

// Set max event listeners (0 == unlimited)
QuestionEvents.setMaxListeners(0);

// Model events
var events = {
  'save': 'save',
  'remove': 'remove'
};

// Register the event emitter to the model events
for (var e in events) {
  var event = events[e];
  Question.schema.post(e, emitEvent(event));
}

function emitEvent(event) {
  return function (doc) {
    QuestionEvents.emit(event + ':' + doc._id, doc);
    QuestionEvents.emit(event, doc);
  };
}

exports['default'] = QuestionEvents;
module.exports = exports['default'];
//# sourceMappingURL=question.events.js.map

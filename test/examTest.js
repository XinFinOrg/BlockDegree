var assert = require('chai').assert;
var expect = require('chai').expect;
var exam = require('../dist/js/exam.js');

describe('Exam', function() {
  const {variable, userGuess, quiz} = exam

  describe('is running', function() {
    it('has userGuess object', function() {
      assert.typeOf(userGuess, 'object')    })
    it('has quiz array', function() {
      assert.typeOf(quiz, 'array')
    })
  });

  describe('should receive an object literal of the guess', function() {
    it('should not have missing answer', function() {
      expect(userGuess.length).to.equal(quiz.length)
    })
  })
})

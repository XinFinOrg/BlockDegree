---
parent: Blockchain professional course for engineer
title: Testing voting functions
template: courseContent.hbs
courseIdx: 2
---
Now let's add a test to our `election.js` test file
```javascript
~/election/test/election.js
it("allows a voter to cast a vote", function() {
    return Election.deployed().then(function(instance) {
      electionInstance = instance;
      candidateId = 1;
      return electionInstance.vote(candidateId, { from: accounts[0] });
    }).then(function(receipt) {
      return electionInstance.voters(accounts[0]);
    }).then(function(voted) {
      assert(voted, "the voter was marked as voted");
      return electionInstance.candidates(candidateId);
    }).then(function(candidate) {
      var voteCount = candidate[2];
      assert.equal(voteCount, 1, "increments the candidate's vote count");
    })
  });
```

We want to test two things here:
1. Test that the function increments the vote count for the candidate.
2. Test that the voter is added to the mapping whenever they vote.

Next we can write a few test for our function's requirements. Let's write a test to ensure that our vote function throws an exception for double voting.

```javascript
~/election/test/election.js
it("throws an exception for double voting", function() {
    return Election.deployed().then(function(instance) {
      electionInstance = instance;
      candidateId = 2;
      electionInstance.vote(candidateId, { from: accounts[1] });
      return electionInstance.candidates(candidateId);
    }).then(function(candidate) {
      var voteCount = candidate[2];
      assert.equal(voteCount, 1, "accepts first vote");
      // Try to vote again
      return electionInstance.vote(candidateId, { from: accounts[1] });
    }).then(assert.fail).catch(function(error) {
      assert(error.message.indexOf('revert') >= 0, "error message must contain revert");
      return electionInstance.candidates(1);
    }).then(function(candidate1) {
      var voteCount = candidate1[2];
      assert.equal(voteCount, 1, "candidate 1 did not receive any votes");
      return electionInstance.candidates(2);
    }).then(function(candidate2) {
      var voteCount = candidate2[2];
      assert.equal(voteCount, 1, "candidate 2 did not receive any votes");
    });
  });
```

First, we'll set up a test scenario with a fresh account that hasn't voted yet. Then we'll cast a vote on their behalf. Then we'll try to vote again. We'll assert that an error has occurred here. We can inspect the error message, and ensure that no candidates received votes, just like the previous test.

Now let's run our tests
```console
shell
user:~/election$: truffle test
```

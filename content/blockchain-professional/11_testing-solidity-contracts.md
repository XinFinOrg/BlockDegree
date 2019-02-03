---
parent: Blockchain professional course for engineer
title: Testing Solidity contracts
template: courseContent.hbs
courseIdx: 2
---
Now let's write some tests. Make sure you have Ganache running first. Then, create a new file in the test folder and name the file election.js and paste the following code

```javascript
~/election/test/election.js
var Election = artifacts.require("./Election.sol");

contract("Election", function(accounts) {
  var electionInstance;

  it("initializes with two candidates", function() {
    return Election.deployed().then(function(instance) {
      return instance.candidatesCount();
    }).then(function(count) {
      assert.equal(count, 2);
    });
  });

  it("it initializes the candidates with the correct values", function() {
    return Election.deployed().then(function(instance) {
      electionInstance = instance;
      return electionInstance.candidates(1);
    }).then(function(candidate) {
      assert.equal(candidate[0], 1, "contains the correct id");
      assert.equal(candidate[1], "Candidate 1", "contains the correct name");
      assert.equal(candidate[2], 0, "contains the correct votes count");
      return electionInstance.candidates(2);
    }).then(function(candidate) {
      assert.equal(candidate[0], 2, "contains the correct id");
      assert.equal(candidate[1], "Candidate 2", "contains the correct name");
      assert.equal(candidate[2], 0, "contains the correct votes count");
    });
  });
});
```

Let me explain this code. First, we require the require the contract and assign it to a variable, like we did in the migration file. Next, we call the `contract` function, and write all our tests within the callback function. This callback function provides an `accounts` variable that represents all the accounts on our blockchain, provided by Ganache.

The first test checks that the contract was initialized with the correct number of candidates by checking the candidates count is equal to 2.

The next test inspects the values of each candidate in the election, ensuring that each candidate has the correct `id`, `name`, and `vote count`.

Let's run the test
```console
shell
user:~/election$: truffle test
```

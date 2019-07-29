---
parent: Blockchain professional course for engineer
title: Adding voting functions to smart contracts
template: courseContent.hbs
courseIdx: 2
---

Now let's add the ability to cast votes in the election. Let's define a "voters" mapping to the smart contract to keep track of the accounts that have voted in the election like this:
<div class="precode">~/election/contracts/election.sol</div>

```javascript
contract Election {
  ...
  // Store accounts that have voted
  mapping(address => bool) public voters;
  ...
}
```
<div class="precode">~/election/contracts/election.sol</div>

Now let's add a `vote` function:
```javascript
  contract Election {
    ...
    // Store accounts that have voted
    mapping(address => bool) public voters;
    ...
    function vote (uint _candidateId) public {
      // require that they haven't voted before
      require(!voters[msg.sender]);

      // require a valid candidate
      require(_candidateId > 0 && _candidateId <= candidatesCount);

      // record that voter has voted
      voters[msg.sender] = true;

      // update candidate vote Count
      candidates[_candidateId].voteCount ++;
  }
}
```

The core functionality of this function is to increase the candidate's vote count by reading the `Candidate` struct out of the `candidates` mapping and increasing the `voteCount` by 1 with the increment operator (++). Let's look at a few other things that it does:

* It accepts one argument. This is an unsigned integer with the candidate's id.
* It visibility is public because we want an external account to call it.
* It adds the account that voted to the voters mapping that we just created. This will allow us to keep track that the voter has voted in the election. We access the account that's calling this function with the global variable `msg.sender` provided by Solidity.
* It implements require statements that will stop execution if the conditions are not met. First require that the voter hasn't voted before. We do this by reading the account address with `msg.sender` from the mapping. If it's there, the account has already voted. Next, it requires that the candidate id is valid. The candidate id must be greater than zero and less than or equal to the total candidate count.


Now your complete contract code should look like this:
<div class="precode">~/election/contracts/election.sol</div>

```javascript
pragma solidity ^0.4.2;

contract Election {
    // Model a Candidate
    struct Candidate {
        uint id;
        string name;
        uint voteCount;
    }

    // Store accounts that have voted
    mapping(address => bool) public voters;
    // Read/write candidates
    mapping(uint => Candidate) public candidates;
    // Store Candidates Count
    uint public candidatesCount;

    function Election () public {
        addCandidate("Candidate 1");
        addCandidate("Candidate 2");
    }

    function addCandidate (string _name) private {
        candidatesCount ++;
        candidates[candidatesCount] = Candidate(candidatesCount, _name, 0);
    }

    function vote (uint _candidateId) public {
        // require that they haven't voted before
        require(!voters[msg.sender]);

        // require a valid candidate
        require(_candidateId > 0 && _candidateId <= candidatesCount);

        // record that voter has voted
        voters[msg.sender] = true;

        // update candidate vote Count
        candidates[_candidateId].voteCount ++;
    }
}
```

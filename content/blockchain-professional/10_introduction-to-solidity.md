---
parent: Blockchain professional course for engineer
title: Introduction to Solidity
template: courseContent.hbs
courseIdx: 2
---
Now that everything is set up properly, let's continue building out the smart contact by listing out the candidates that will run in the election. We need a way to store multiple candidates, and store multiple attributes about each candidate. We want to keep track of a candidate's id, name, and vote count. Here is how we will model the candidate:
<div class="precode">~/election/contracts/election.sol</div>

```javascript
contract Election {
    // Model a Candidate
    struct Candidate {
        uint id;
        string name;
        uint voteCount;
    }
}
```

We have modeled the candidate with a Solidity Struct. Solidity allows us to create our own structure types as we've done for our candidate here. We specified that this struct has an `id` of unsigned integer type, `name` of string type, and `voteCount` of unsigned integer type. Simply declaring this struct won't actually give us a candidate. We need to instantiate it and assign it to a variable before we can write it to storage.

The next thing we need is a place to store the candidates. We need a place to store one of the structure types that we've just created. We can do this with a Solidity mapping. A mapping in Solidity is like an associative array or a hash, that associates key-value pairs. We can create this mapping like this:
<div class="precode">~/election/contracts/election.sol</div>

```JavaScript
contract Election {
    // Model a Candidate
    struct Candidate {
        uint id;
        string name;
        uint voteCount;
    }
    // Read/write Candidates
    mapping(uint => Candidate) public candidates;  
}
```

In this case, the key to the mapping is an unsigned integer, and the value is a `Candidate` structure type that we just defined. This essentially gives us an id-based lookup for each candidate. Since this mapping is assigned to a state variable, we will write data to the blockchain anytime we assign new key-value pairs to it. Next, we set this mapping's visibility to public in order to get a getter function, just like we did with the candidate name in the smoke test.

Next, we keep track of how many candidates exist in the election with a counter cache state variable like this:
<div class="precode">~/election/contracts/election.sol</div>

```javascript
contract Election {
    // Model a Candidate
    struct Candidate {
        uint id;
        string name;
        uint voteCount;
    }

    // Read/write Candidates
    mapping(uint => Candidate) public candidates;

    // Store Candidates Count
    uint public candidatesCount;
}
```

In Solidity, there is no way to determine the size of a mapping, and no way to iterate over it, either. That's because any key in a mapping that hasn't been assigned a value yet will return a default value (an empty candidate in this case). For example, if we only had 2 candidates in this election, and we try to look up candidate #99, then the mapping will return an empty `Candidate` structure. This behavior makes it impossible to know how many candidates exist, and therefore we must use a counter cache.

Next, let's create a function to add candidates to the mapping we've created like this:
<div class="precode">~/election/contracts/election.sol</div>

```javscript
contract Election {
    function addCandidate (string _name) private {
        candidatesCount ++;
        candidates[candidatesCount] = Candidate(candidatesCount, _name, 0);
    }
}
```

We've declared the function `addCandidate` that takes one argument of string type that represents the candidate's name. Inside the function, we increment the candidate counter cache to denote that a new candidate has been added. Then we update the mapping with a new `Candidate` struct, using the current candidate count as the key. This Candidate struct is initialized with the candidate id from the current candidate count, the name from the function argument, and the initial vote count to 0. Note that this function's visibility is private because we only want to call it inside the contract.

Now we can add two candidates to our election by calling the `addCandidate` function twice inside the constructor function like this:
<div class="precode">~/election/contracts/election.sol</div>

```javascript
contract Election {
    function Election () public {
        addCandidate("Candidate 1");
        addCandidate("Candidate 2");
    }
}
```

This migration will execute when we deploy the contract to the blockchain, and populate our election with two candidates. At this point, your complete contract code should look like this:
<div class="precode">~/election/contracts/election.sol</div>

```javaScript
pragma solidity ^0.4.2;

contract Election {
    // Model a Candidate
    struct Candidate {
        uint id;
        string name;
        uint voteCount;
    }

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
}
```

Now let's migrate our contract like this:
<div class="precode">shell</div>
```console
user:~/election$ truffle migrate --reset
```

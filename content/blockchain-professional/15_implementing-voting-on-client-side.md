---
parent: Blockchain professional course for engineer
title: Implementing voting on client side
template: courseContent.hbs
courseIdx: 2
---

Let's add a form that allows accounts to vote below the table in our `index.html`

```HTML
~/election/src/index.html
<form onSubmit="App.castVote(); return false;">
  <div class="form-group">
    <label for="candidatesSelect">Select Candidate</label>
    <select class="form-control" id="candidatesSelect">
    </select>
  </div>
  <button type="submit" class="btn btn-primary">Vote</button>
  <hr />
</form>
```

Let's examine a few things about this form:

We create the form with an empty select element. We will populate the select options with the candidates provided by our smart contract in our `app.js`.

The form has an `onSubmit` handler that will call the `castVote` function. We will define this in our `app.js`.

Now let's update our `app.js` to handle both of those things. First we list all the candidates from the smart contract inside the form's select element. Then we'll hide the form on the page once the account has voted. We'll update the render function to look like this:

```javascript
~/election/src/app.js
render: function() {
  var electionInstance;
  var loader = $("#loader");
  var content = $("#content");

  loader.show();
  content.hide();

  // Load account data
  web3.eth.getCoinbase(function(err, account) {
    if (err === null) {
      App.account = account;
      $("#accountAddress").html("Your Account: " + account);
    }
  });

  // Load contract data
  App.contracts.Election.deployed().then(function(instance) {
    electionInstance = instance;
    return electionInstance.candidatesCount();
  }).then(function(candidatesCount) {
    var candidatesResults = $("#candidatesResults");
    candidatesResults.empty();

    var candidatesSelect = $('#candidatesSelect');
    candidatesSelect.empty();

    for (var i = 1; i <= candidatesCount; i++) {
      electionInstance.candidates(i).then(function(candidate) {
        var id = candidate[0];
        var name = candidate[1];
        var voteCount = candidate[2];


        // Render candidate Result
        var candidateTemplate = "<tr><th>" + id + "</th><td>" + name + "</td><td>" + voteCount + "</td></tr>"
        candidatesResults.append(candidateTemplate);

        // Render candidate ballot option
        var candidateOption = "<option value='" + id + "' >" + name + "</ option>"
        candidatesSelect.append(candidateOption);
      });
    }
    return electionInstance.voters(App.account);
  }).then(function(hasVoted) {
    // Do not allow a user to vote
    if(hasVoted) {
      $('form').hide();
    }
    loader.hide();
    content.show();
  }).catch(function(error) {
    console.warn(error);
  });
}
```

Next, we want to write a function that's called whenever the form is submitted:
```javascript
~/election/src/app.js
...
castVote: function() {
    var candidateId = $('#candidatesSelect').val();
    App.contracts.Election.deployed().then(function(instance) {
      return instance.vote(candidateId, { from: App.account });
    }).then(function(result) {
      // Wait for votes to update
      $("#content").hide();
      $("#loader").show();
    }).catch(function(err) {
      console.error(err);
    });
  }
...
```

First, we query for the `candidateId` in the form. When we call the vote function from our smart contract, we pass in this id, and we provide the current account with the function's "from" metadata. This will be an asynchronous call. When it is finished, we'll show the loader and hide the page content. Whenever the vote is recorded, we'll do the opposite, showing the content to the user again.

Now your front-end application should look like this:


Go ahead and try the voting function. Once you do, you should see a Metamask confirmation pop up like this:

Once you click submit, you've successfully casted a vote! You'll still see a loading screen. For now, you'll have to refresh the page to see the votes recorded. We'll implement the functionality update the loader automatically

The accompanying video footage for this portion of the tutorial begins at 1:48:05. You can download the code for this portion of the tutorial here. Feel free to use these as a reference point if you get stuck!
The very last step in this tutorial is to trigger an event whenever a vote is cast. This will allow us to update our client-side application when an account has voted. Fortunately, this is quite easy. Let's start by declaring an event in our contract like this:

```javascript
~/election/contracts/FILL_THS_IN.sol
contract Election {
  ...
  event votedEvent (
    uint indexed _candidateId
  );
  ...
}
```


Now we can trigger this "voted" event inside our `vote` function like this:
```javascript
~/election/contracts/FILL_THS_IN.sol
function vote (uint _candidateId) public {
  // require that they haven't voted before
  require(!voters[msg.sender]);

  // require a valid candidate
  require(_candidateId > 0 && _candidateId <= candidatesCount);

  // record that voter has voted
  voters[msg.sender] = true;

  // update candidate vote Count
  candidates[_candidateId].voteCount ++;

  // trigger voted event
  votedEvent(_candidateId);
}
```

Now that we've updated our contract, we must run our migrations
```console
shell
user:~/election$: truffle migrate --reset
```

We can also update our tests to check for this voting event like this
```javascript
~/election/test/election.js
it("allows a voter to cast a vote", function() {
  return Election.deployed().then(function(instance) {
    electionInstance = instance;
    candidateId = 1;
    return electionInstance.vote(candidateId, { from: accounts[0] });
  }).then(function(receipt) {
    assert.equal(receipt.logs.length, 1, "an event was triggered");
    assert.equal(receipt.logs[0].event, "votedEvent", "the event type is correct");
    assert.equal(receipt.logs[0].args._candidateId.toNumber(), candidateId, "the candidate id is correct");
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

This test inspects the transaction receipt returned by the `vote` function to ensure that it has logs. These logs contain the event that was triggered. We check that the event is the correct type, and that it has the correct candidate id.

Now let's update the client-side application to listen for the voted event and fire a page refresh any time that it is triggered. We can do that with a `listenForEvents` function like this:

```javascript
~/election/src/app.js
...
listenForEvents: function() {
  App.contracts.Election.deployed().then(function(instance) {
    instance.votedEvent({}, {
      fromBlock: 0,
      toBlock: 'latest'
    }).watch(function(error, event) {
      console.log("event triggered", event)
      // Reload when a new vote is recorded
      App.render();
    });
  });
}
```

This function does a few things. First, we subscribe to the voted event by calling the `votedEvent` function. We pass in some metadata that tells us to listen to all events on the blockchain. Then we "watch" this event. Inside here, we log to the console anytime a `votedEvent` is triggered. We also re-render all the content on the page. This will get rid of the loader after the vote has been recorded, and show the updated vote count on the table.

Finally, we can call this function whenever we initialize the contract:
```javascript
~/election/src/app.js
...
initContract: function() {
  $.getJSON("Election.json", function(election) {
    // Instantiate a new truffle contract from the artifact
    App.contracts.Election = TruffleContract(election);
    // Connect provider to interact with contract
    App.contracts.Election.setProvider(App.web3Provider);

    App.listenForEvents();

    return App.render();
  });
}
```

Now, you can vote on your client-side application, and watch the votes recorded in real time! Be patient, it might take a few seconds for the event to trigger. If you don't see an event, try restarting Chrome. There is a known issue with  Metamask surrounding events. Restarting Chrome always fixes it for me.

Congratulations! You have successfully built a full stack decentralized application on the Ethereum blockchain!

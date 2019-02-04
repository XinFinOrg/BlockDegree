---
parent: Blockchain professional course for engineer
title: Developing the client side interface
template: courseContent.hbs
courseIdx: 2
---
Now let's start building out the client-side application that will talk to our smart contract. We'll do this by modifying the HTML and Javascript files that came with the Truffle Pet Shop box that we installed in the previous section. We'll use this existing code to get started. Let's also take note of a few other things that came with the Truffle Pet Shop box like the Bootstrap framework that will keep us from having to write any CSS in this tutorial. We also got lite-server, which will serve our assets for development purposes.

You do not have to be a front-end expert to follow along with this part of the tutorial. I have intentionally kept the HTML and Javascript code very simple, and we will not spend much time focusing on it. I want to stay focused on developing the smart contract portion of our dApp!

Go ahead and replace all of the content of your `index.html` file with this code:

```html
~/election/src/index.html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Election Results</title>

    <!-- Bootstrap -->
    <link href="css/bootstrap.min.css" rel="stylesheet">
  </head>
  <body>
    <div class="container" style="width: 650px;">
      <div class="row">
        <div class="col-lg-12">
          <h1 class="text-center">Election Results</h1>
          <hr/>
          <br/>
          <div id="loader">
            <p class="text-center">Loading...</p>
          </div>
          <div id="content" style="display: none;">
            <table class="table">
              <thead>
                <tr>
                  <th scope="col">#</th>
                  <th scope="col">Name</th>
                  <th scope="col">Votes</th>
                </tr>
              </thead>
              <tbody id="candidatesResults">
              </tbody>
            </table>
            <hr/>
            <p id="accountAddress" class="text-center"></p>
          </div>
        </div>
      </div>
    </div>

    <!-- jQuery (necessary for Bootstrap's JavaScript plugins) -->
    <script src="https://ajax.googleapis.com/ajax/libs/jquery/1.12.4/jquery.min.js"></script>
    <!-- Include all compiled plugins (below), or include individual files as needed -->
    <script src="js/bootstrap.min.js"></script>
    <script src="js/web3.min.js"></script>
    <script src="js/truffle-contract.js"></script>
    <script src="js/app.js"></script>
  </body>
</html>
````

Next, replace all of the content of your `app.js` file with this code:
```javascript
~/election/src/app.js
App = {
  web3Provider: null,
  contracts: {},
  account: '0x0',

  init: function() {
    return App.initWeb3();
  },

  initWeb3: function() {
    if (typeof web3 !== 'undefined') {
      // If a web3 instance is already provided by Meta Mask.
      App.web3Provider = web3.currentProvider;
      web3 = new Web3(web3.currentProvider);
    } else {
      // Specify default instance if no web3 instance provided
      App.web3Provider = new Web3.providers.HttpProvider('http://localhost:7545');
      web3 = new Web3(App.web3Provider);
    }
    return App.initContract();
  },

  initContract: function() {
    $.getJSON("Election.json", function(election) {
      // Instantiate a new truffle contract from the artifact
      App.contracts.Election = TruffleContract(election);
      // Connect provider to interact with contract
      App.contracts.Election.setProvider(App.web3Provider);

      return App.render();
    });
  },

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

      for (var i = 1; i <= candidatesCount; i++) {
        electionInstance.candidates(i).then(function(candidate) {
          var id = candidate[0];
          var name = candidate[1];
          var voteCount = candidate[2];

          // Render candidate Result
          var candidateTemplate = "<tr><th>" + id + "</th><td>" + name + "</td><td>" + voteCount + "</td></tr>"
          candidatesResults.append(candidateTemplate);
        });
      }

      loader.hide();
      content.show();
    }).catch(function(error) {
      console.warn(error);
    });
  }
};

$(function() {
  $(window).load(function() {
    App.init();
  });
});
```

Let's take note of a few things that this code does:
1. __Set up web3__: web3.js is a javascript library that allows our client-side application to talk to the blockchain. We configure web3 inside the "initWeb3" function.
2. __Initialize contracts__: We fetch the deployed instance of the smart contract inside this function and assign some values that will allow us to interact with it.
3. __Render function__: The render function lays out all the content on the page with data from the smart contract. For now, we list the candidates we created inside the smart contract. We do this by looping through each candidate in the mapping, and rendering it to the table. We also fetch the current account that is connected to the blockchain inside this function and display it on the page.

Now let's view the client-side application in the browser. First, make sure that you've migrated your contracts like this:
```console
shell
user:~/election$: truffle migrate --reset
```
Next, start your development server
```console
shell
user:~/election$: npm run dev
```
This should automatically open a new browser window with your client-side application.

Notice that your application says "Loading...". That's because we're not logged in to the
blockchain yet! In order to connect to the blockchain, we need to import one of the accounts
from Ganache into Metamask.

Once you're connected with Metamask, you should see all of the contract and account data
loaded.

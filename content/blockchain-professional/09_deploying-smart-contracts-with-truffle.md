---
parent: Blockchain professional course for engineer
title: Deploying smart contracts with Truffle
template: courseContent.hbs
courseIdx: 2
---
Now let's create a project directory for our dApp

Create a folder in the desktop and name the folder election

```console
shell
user:~$ mkdir election
user:~$ cd election
```

Now that we're inside our project, we can get up and running fast with a Truffle box. We'll be using the Pet Shop box for this tutorial. From within your project directory, install the pet shop box from the command line like this

```console
shell
user:~/election$: truffle unbox pet-shop
```

Let's see what the pet shop box gave us:


* __contracts__: A directory where all smart contacts live. We already have a Migration contract that handles our migrations to the blockchain.
* __migration__: A directory where all of the migration files live. These migrations are similar to other web development frameworks that require migrations to change the state of a database. Whenever we deploy smart contracts to the blockchain, we are updating the blockchain's state, and therefore need a migration.
* __node_modules__: This is the home of all of our Node dependencies.
* __src__: This is where we'll develop our client-side application.
* __test__: This is where we'll write our tests for our smart contracts.
* __truffle.js__: This is the main configuration file for our Truffle project.

Then you need to open election folder and open contracts and save it as `election.sol`.

```javscript
~/election/contracts/election.sol
pragma solidity 0.4.24;

contract Election {
    // Read/write candidate
    string public candidate;

    // Constructor
    function Election () public {
        candidate = "Candidate 1";
    }
}
```

And paste the following code in the election.sol Let me explain this code. We start by declaring the solidity version with the pragma solidity statement. Next, we declare the smart contract with the "contract" keyword, followed by the contract name. Next, we declare a state variable that will store the value of the candidate name. State variables allow us to write data to the blockchain. We have declared that this variable will be a string, and we have set its visibility to public. Because it is public, solidity will give us a getter function for free that will allow us to access this value outside of our contract. We'll see that in action later in the console!

Then, we create a constructor function that will get called whenever we deploy the smart contract to the blockchain. This is where we'll set the value of the candidate state variable that will get stored to the blockchain upon migration. Notice that the constructor function has the same name as the smart contract. This is how Solidity knows that the function is a constructor.

Now that we've created the foundation for the smart contract, let's see if we can deploy it to the blockchain. In order to do this, we'll need to create a new file in the migrations directory. From your project root, create a new file in migration folder and name the file `2_deploy_contracts.js` and paste the code in the following file.

```javascript
~/election/migration/2_deploy_contracts.js
var Election = artifacts.require("./Election.sol");

module.exports = function(deployer) {
  deployer.deploy(Election);
};
```

First, we require the contract we've created, and assign it to a variable called "Election". Next, we add it to the manifest of deployed contracts to ensure that it gets deployed when we run the migrations. Now let's run our migrations from the command line like this:

```console
shell
user:~/election$: truffle migrate
```

Now that we have successfully migrated our smart contract to the local Ethereum blockchain, let's open the console to interact with the smart contract. You can open the truffle console from the command line
Now that we're inside the console, let's get an instance of our deployed smart contract and see if we can read the candidate's name from the contract. From the console, run this code:

```console
shell
user:~/election$: election.deployed().then(function(instance) { app = instance })
```
Here Election is the name of the variable that we created in the migration file. We retrieved a deployed instance of the contract with the deployed() function, and assigned it to an app variable inside the promise's callback function.
Now we can read the value of the candidate

```console
shell
user:~/election$: app.candidate()
```

Congratulations! You've just written your first smart contract, deployed to the blockchain, and retrieved some of its data.

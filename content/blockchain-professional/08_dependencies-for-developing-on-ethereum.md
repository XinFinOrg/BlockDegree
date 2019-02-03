---
parent: Blockchain professional course for engineer
title: Dependencies for developing on Ethereum
template: courseContent.hbs
courseIdx: 2
---
Today I'm going to show you how to build your first decentralized application, or dApp, on the Ethereum blockchain. I'll show you how to write your first Ethereum smart contract, where we'll hold an election between two candidates. We'll write tests against the smart contract, deploy it to the Ethereum blockchain, and develop a client-side application that allows accounts to cast votes

In order to build our dApp, we need a few dependencies first.

### Node Package Manager (NPM)
The first dependency we need is Node Package Manager, or NPM, which comes with Node.js. Check if you have node installed in your machine.
```console
shell
user:~/$: node -v
```

### Truffle Framework
The next dependency is the Truffle Framework, which allows us to build decentralized applications on the Ethereum blockchain. It provides a suite of tools that allow us to write smart contacts with the Solidity programming language. It also enables us to test our smart contracts and deploy them to the blockchain. It also gives us a place to develop our client-side application.
```console
shell
user:~/$: npm install -g truffle
```

### Ganache
The next dependency is Ganache, a local in-memory blockchain. You can install Ganache by downloading it from the Truffle Framework website. It will give us 10 external accounts with addresses on our local Ethereum blockchain. Each account is preloaded with 100 fake ether.


### Metamask
The next dependency is the Metamask extension for Google Chrome. In order to use the blockchain, we must connect to it (remember, I said the block chain is a network). We’ll have to install a special browser extension in order to use the Ethereum block chain. That’s where metamask comes in. We’ll be able to connect to our local Ethereum blockchain with our personal account, and interact with our smart contract.

We’re going to be using the Metamask chrome extension for this tutorial, so you’ll also need to install the google chrome browser if you don’t have it already. To install Metamask, search for the Metamask Chrome plugin in the Google Chrome web store. Once you’ve installed it, be sure that it is checked in your list of extensions. You’ll see the fox icon in the top right hand side of your Chrome browser when it’s installed. Reference the video walk through if you get stuck!

---
parent: XDC Blockchain Network
title: Smart Contracts on the XDC Network
template: courseContent.hbs
courseIdx: 6
---
- Smart contracts on the XDC Network provide a powerful tool for automating complex business processes, increasing security, and reducing the need for intermediaries. Explore how these self-executing contracts are revolutionizing supply chain management, trade finance, cross-border payments, and more.

 <img src="/img/courses/xdc/smartcontract.png" style="width:855px; height: 400px; align-content: center; margin: 25px;"/>

The XDC Network Combines the power of Public & Private blockchains with Interoperable Smart Contracts


Smart contracts on the XDC Network (formerly known as XinFin Network) are a key feature that allows for the automation of complex, trustless agreements and processes. Here's an overview of smart contracts on the XDC Network:


## Introduction to Smart Contracts


### **1. What Are Smart Contracts?**

Smart contracts are self-executing contracts with the terms of the agreement directly written into code. They automatically enforce, facilitate, or verify the negotiation or performance of a contract when predefined conditions are met. They eliminate the need for intermediaries and can be used for a wide range of applications.

### **2. How Smart Contracts Work on the XDC Network:** 

Smart contracts on the XDC Network are created and executed on the blockchain using the network's native cryptocurrency, XDC. Here's how they work:

- **Creation:** Developers write the code for the smart contract and deploy it to the XDC Network. This code can define the rules and logic of the contract, including conditions and actions.

- **Execution:** Once deployed, the smart contract is stored on the blockchain and is immutable. It sits on the network until it is triggered by specific conditions being met. These conditions are usually events or actions that are recorded on the blockchain.

- **Automation:** When the predefined conditions are met, the smart contract automatically executes the specified actions without the need for human intervention. These actions can include transferring XDC, changing data on the blockchain, or interacting with other smart contracts.

- **Trustlessness:** Smart contracts on the XDC Network are trustless, meaning that once deployed, their execution is deterministic and cannot be tampered with. Parties can trust that the contract will execute as programmed.

### **3.  Use Cases for Smart Contracts on the XDC Network:**
Smart contracts on the XDC Network can be used in various enterprise and financial applications, including:

- **Supply Chain Management:** Automate the movement of goods, trigger payments upon delivery, and manage inventory with smart contracts.

- **Trade Finance:** Streamline the issuance of letters of credit, automate escrow services, and facilitate trade settlement using self-executing smart contracts.

- **Cross-Border** Payments: Automate cross-border payments when certain conditions, such as customs clearance, are met.

- **Tokenization:** Create digital tokens representing real-world assets like real estate or stocks, which can be traded or used as collateral in financial transactions.

## Creating and Deploying Smart Contracts on XinFins

- Creating and deploying smart contracts on the XinFin blockchain involves several steps. XinFin is a blockchain platform that is designed for enterprise use cases, and it uses the XinFin XDC protocol for creating and executing smart contracts. Here's a high-level overview of the process:

1. **Set Up Development Environment:**
Before you can create and deploy smart contracts on XinFin, you need to set up your development environment. You can choose from various development tools and languages, including Solidity (similar to Ethereum) or XinFin's own language called "XDCsmartcontract."

2. **Write Smart Contract Code:**
You need to write the smart contract code using the chosen programming language. This code defines the rules and logic of your smart contract. You can use integrated development environments (IDEs) or text editors for coding.

3. **Compile the Smart Contract:**
After writing the smart contract, you need to compile it into bytecode that can be executed on the XinFin blockchain. Solidity contracts can be compiled using the Solidity compiler. XinFin's XDCsmartcontract contracts can be compiled using their specific tools.

4. **Deploy the Smart Contract:**
To deploy a smart contract on the XinFin blockchain, you'll need to interact with a XinFin node. You can either run your own node or use a service that provides node access. Typically, you would use Web3.js or a similar library to interact with the XinFin network. Your deployment script will send the compiled bytecode to the XinFin network along with any required parameters.

5. **Test the Smart Contract:**
Before deploying a smart contract on the main XinFin network, it's a good practice to test it on a testnet or a local development network. This helps ensure that the contract behaves as expected and that there are no critical bugs.

6. **Interact with the Smart Contract:**
Once deployed, your smart contract can be interacted with by other users and applications. They can invoke its functions and perform transactions based on the contract's rules.

- Certainly, let's go through a simplified example of deploying a smart contract on the XinFin Testnet using XinFin Remix and XinPay. In this example, we'll deploy a basic "HelloWorld" contract.

- Deploy smart contract on XinFin Testnet through XinFin Remix and XinPay.

***Step by step guide to deploy the smart contract on XinFin Testnet (Apothem) through XinFin Remix and XinPay.***

### Stage 1: Setup the Environment
- You can find the XinFin remix at [remix.xinfin.network ](https://remix.xinfin.network/). After this, you need to select the environment according to your contract.

 <img src="/img/courses/xdc/sc1.png" style="width:855px; height: 400px; align-content: center; margin: 25px;"/>

- After selecting the environment according to your contract you need to create a new file and name it.

- Then you just need to paste your contract in the new file which you have created and select the compiler version as per your contract.

 <img src="/img/courses/xdc/sc2.png" style="width:855px; height: 400px; align-content: center; margin: 25px;"/>

- And then compile your contract.

### Stage 2: Add XinPay in Chrome

- After compiling your contract, you need to deploy it.
You would need to download [XinPay ](https://chrome.google.com/webstore/detail/xdcpay/bocpokimicclpaiekenaeelehdjllofo)in order to further deploy your contract.

- Afterwhich, you can simply XinPay as an extension in your Google Chrome browser.

- For more details on how to get started with XinPay Crypto Asset, [click here](https://medium.com/xinfin/get-started-with-xinpay-crypto-asset-bbd817e1ed46) 

 <img src="/img/courses/xdc/sc3.png" style="width:855px; height: 400px; align-content: center; margin: 25px;"/>

- Once you accept all the terms and conditions, enter a strong password, and remember your password as every time you would need to feed in the password in order to access XinPay.

- After that, you will see a seed with which you can access your wallet. Make sure you take a proper backup of your Keystore as XinFin network is decentralized.

- Post this, you would need to select the XinFin Apothem network where you can get the test token from [XDC Faucet](https://apothem.network/#getTestXDC) .
 <img src="/img/courses/xdc/sc4.png" style="width:855px; height: 400px; align-content: center; margin: 25px;"/>


### Stage 3: Deploy the contract

- After getting the test token on XinPay, you can **deploy the token from** [XinFin Remix](https://medium.com/xinfin/xinfin-remix-develop-smart-contracts-for-the-xinfin-blockchain-b3c330727528) and submit the required transaction.

- If the user wishes to deploy a smart contract on XinFin mainnet user will just require to change the network on XinPay and follow the same steps. **Note:** ***To deploy smart-contract on XinFin Mainnet users must have real tokens.***
 <img src="/img/courses/xdc/sc5.png" style="width:855px; height: 400px; align-content: center; margin: 25px;"/>

-  Post the deployment of the contract you can check the tx hash on the XinPay. This means you have deployed your contract successfully and you can check it on XinFin Scan.


 <img src="/img/courses/xdc/sc6.png" style="width:855px; height: 400px; align-content: center; margin: 25px;"/>


### Stage 4: Interact with contract

- You can also interact with your smart contract on the XinFin remix.

 <img src="/img/courses/xdc/sc7.png" style="width:855px; height: 400px; align-content: center; margin: 25px;"/>

 
 watch the video Visual assistance 

<iframe width="560" height="315" src="https://www.youtube.com/embed/XvzxHs6_EOQ?si=VaZG2go79rOVChUb" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>


---
parent: Blockchain advanced course for engineer
title: How does bitcoin work
template: courseContent.hbs
courseIdx: 1
---
### How to use Bitcoin
In order to interact and transact with Bitcoin, you will need a bitcoin wallet. A Bitcoin wallet will enable you to receive, transfer and store Bitcoins. A Bitcoin wallet can be an app, website or a hardware wallet. A Bitcoin hardware wallet is a small device that is generally offline and store Bitcoins.

Once you install or create your Bitcoin wallet, it will generate a public Bitcoin address, public key and private key. When transacting with Bitcoin, you should never let people know your private key, as doing so will enable others to gain access to your Bitcoin wallet. Always store the private key in a safe place. In theory, you can create as many Bitcoin wallet address as you like, as long as you are able to keep a backup of all of your private keys.

After you created your wallet, you are ready to transact in Bitcoin. If you want to receive bitcoin, you will have to disclose your public bitcoin address and vice versa. This is actually similar to how we will transfer money in from a bank account to another bank account

### Technological architecture
As you can see, it is relatively easy for you or anyone to interact with Bitcoin. The technological architecture of a
Bitcoin blockchain is more complex, it comprises of:
* Distributed ledger
* Consensus algorithm
* Cryptography

In the following section, we are going to look at each of this component in detail.

#### Distributed ledger
The reason that Bitcoin could be transacted without a trusted intermediary is because of the way the blockchain technology is designed. The Bitcoin blockchain is a shared public ledger on which all the transactions of the Bitcoin network are verified, confirmed, recorded and made transparent to the public. You could actually look at the confirmed transactions through the Bitcoin blockchain explorer.

From the blockchain explorer, you can see the sender, receiver, timestamp, miner and amount of Bitcoin in any single transaction.

This transparency of the blockchain will ensure that the network is aware of the actual spendable balance in the wallet before verifying the transactions and appending them to the Bitcoin blockchain. This prevent double-spending, which is a potential system flaw that enables the same digital token to be spend in more than one transaction, and enables the peer-to-peer transactions.

#### Consensus algorithm
__Mining__

Mining is a distributed consensus system that is used to confirm pending transactions by including them
in the block chain. It enforces a chronological order in the blockchain, protects the neutrality of the
network, and allows different computers to agree on the state of the system. To be confirmed,
transactions must be packed in a block that fits very strict cryptographic rules that will be verified by the network. These rules prevent previous blocks from being modified because doing so would invalidate all the subsequent blocks. Mining also creates the equivalent of a competitive lottery that prevents any individual from easily adding new blocks consecutively to the blockchain. In this way, no group or individuals can control what is included in the block chain or replace parts of the blockchain to roll back their own spends.

#### Cryptography
Blockchain is secured with cryptographic algorithms. Cryptography is the practice of applying mathematical functions to pieces of data in order to secure it. The two cryptographic concepts used in the Bitcoin blockchain, and in any blockchain in general, are hashing and public-private key cryptography. We will look at cryptography in more details.

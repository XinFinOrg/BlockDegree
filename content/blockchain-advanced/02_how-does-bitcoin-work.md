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

#### What is Bitcoin Cash ?
Bitcoin cash is a cryptocurrency created in August 2017, arising from a fork of Bitcoin Classic. Bitcoin Cash increases the size of blocks, allowing more transactions to be processed.  

Since its launch, Bitcoin faced pressure from community members on the topic of scalability. Specifically, that the size of blocks – set at 1 megabyte (MB), or a million bytes, in 2010 – would slow down transaction processing times, thus limiting the currency’s potential, just as it was gaining in popularity. The block size limit was added to the Bitcoin code in order to prevent spam attacks on the network at a time when the value of a Bitcoins was low. By 2015, the value of Bitcoins had increased substantially and average block size had reached 600 bytes, creating a scenario in which transaction times could run into delays as more blocks reached

Bitcoin Cash differs from Bitcoin Classic in that it increases the block size from 1 MB to 8 MB. It also removes Segregated Witness (SegWit), a proposed code adjustment designed to free up block space by removing certain parts of the transaction. The goal of Bitcoin Cash is to increase the number of transactions that can be processed, and supporters hope that this change will allow Bitcoin Cash to compete with the volume of transactions that PayPal and Visa can handle by increasing the size of blocks.

#### What is Soft Fork ?
Whenever a chain needs to be updated there are two ways of doing that: a soft fork or a hard fork. Think of soft fork as an update in the software which is backwards compatible. What does that mean? Suppose you are running MS Excel 2005 in your laptop and you want to open a spreadsheet built in MS Excel 2015, you can still open it because MS Excel 2015 is backwards compatible.

BUT, having said that there is a difference. All the updates that you can enjoy in the newer version won’t be visible to you in the older version. Going back to our MS excel analogy again, suppose there is a feature which allows to put in GIFs in the spreadsheet in the 2015 version, you won’t see those GIFs in the 2005 version. So basically, you will see all text but won’t see the GIF.

#### What is Hard Fork ?
The primary difference between a soft fork and hardfork is that it is not backward compatible. Once it is utilized there is absolutely no going back whatsoever. If you do not join the upgraded version of the blockchain then you do not get access to any of the new updates or interact with users of the new system whatsoever. Think PlayStation 3 and PlayStation 4. You can’t play PS3 games on PS4 and you can’t play PS4 games on PS3.







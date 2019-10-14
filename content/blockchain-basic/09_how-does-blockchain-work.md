---
parent: Blockchain basic course for engineer
title: How does blockchain work?
template: courseContent.hbs
courseIdx: 0
---
how cryptographic techniques are implemented in the blockchain

History of Cryptography:-

Cryptography is a method of hiding information to keep its content safe and secret. To uncover the information, the reader needs to know how the information has been modified, or encrypted. The encrypted message can, if properly done, be read only by the sender and the recipient.

<img src="https://raw.githubusercontent.com/XinFinOrg/Blockchain_Tutorial-website/live/dist/img/courses/bc-basic/cryptography.png"  style="width:100%; height: 400px; align-content: center; "/>


Nearly everyone has heard of Blockchain and that it is cool. But not everybody understands how it works.

So this will guide you how blockchain technology works.

What is Blockchain?
A Blockchain is a diary that is almost impossible to forget.

### Hash function
Let us imagine that 10 people in one room decide to make a unique currency. They have to follow the flow of funds, and one person – let's call him Alice – decides to keep a list of all the actions in a diary: Another person – let’s call him Sam – decides to steal money. To hide this, he changed the entries in Alice’s diary:

  <img src="https://raw.githubusercontent.com/XinFinOrg/Blockchain_Tutorial-website/live/dist/img/courses/bc-basic/hash-function.png"  style="width:100%; height: 400px; align-content: center; "/>


Alice noticed that someone had tampered with his diary and wants to find a solution to this. He finds a progAlice called a Hash function which turns text into a set of numbers and letters, as shown in the table below.
  <img src="https://raw.githubusercontent.com/XinFinOrg/Blockchain_Tutorial-website/live/dist/img/courses/bc-basic/hash-function1.png"  style="width:100%; height: 400px; align-content: center; "/>


A hash is a set of numbers and letters, produced by hash functions. A hash function is a mathematical function that takes a variable number of characters and converts it into a set with a fixed number of characters. Even a small change in a set creates a totally new hash.

Sam decides to change entries in the diary again. At night, he got to the diary, changed the record and generated a new hash.

Alice noticed that somebody had tampered with the diary again. He decides to complicate the record of each transaction. Therefore, after each record, he inserts a hash generated from the record + last hash. Making each entry depend on the previous.

That way, if Sam tries to change the record again this time around, he will have to change the hash in all the previous entries. But Sam really wants more money, and he spends the whole night counting all the previous hashes.
####How do Merkle trees work?

A Merkle tree summarizes all the transactions in a block by producing a digital fingerprint of the entire set of transactions, thereby enabling a user to verify whether or not a transaction is included in a block.

Merkle trees are created by repeatedly hashing pairs of nodes until there is only one hash left (this hash is called the Root Hash, or the Merkle Root). They are constructed from the bottom up, from hashes of individual transactions (known as Transaction IDs).

Each leaf node is a hash of transactional data, and each non-leaf node is a hash of its previous hashes. Merkle trees are binary and therefore require an even number of leaf nodes. If the number of transactions is odd, the last hash will be duplicated once to create an even number of leaf nodes.



### Nonce
But Alice did not want to lose hope, so he decided to add a number after each record. This number is called “Nonce”. Nonce should be chosen so that the generated hash ends in two zeros.

Now, to forget the records, Sam would have to spend hours and hours choosing Nonce for each line.

More importantly, the computers itself cannot figure out the Nonce quickly
  <img src="https://raw.githubusercontent.com/XinFinOrg/Blockchain_Tutorial-website/live/dist/img/courses/bc-basic/nonce.png"  style="width:100%; height: 400px; align-content: center; "/>


### Nodes
Alice realized that there were too many records and that he couldn’t keep the diary like this forever. So after writing 5,000 transactions, he converted them to a one page spreadsheet and Mary checked that all the transactions were right.

He then spread his spreadsheet diary over 5,000 computers, which were all over the world. These computers are called nodes. and every time a transaction occurs it has to be approved by the nodes, each of whom checks its validity. A form of electric vote occurs once every node has checked a transaction, because some nodes may think the transaction is valid while others may think it is a fraud.

Each node (computers) has a copy of the digital ledger or Blockchain, therefore each node checks the validity of each transaction. If a majority of nodes say that a transaction is valid then it is written into a block. At this junction, if Sam changes one entry, all the other computers will have the original hash. They would not allow the change to occur.

### Block
A block is a one spreadsheet but the whole family of blocks is the Blockchain and every node has a copy of the Blockchain. Once a block reaches a certain number of approved transactions, then a new block is formed.

The Blockchain automatically updates itself every ten minutes. No master or central computer is needed to instruct the computers to do this.

Immediately the spreadsheet or ledger or registry is updated, it can no longer be altered. Thus, it is impossible to forge but can only add new entries to it. The registry is updated on all computers on the network at the same time.

Important points:
1. A Blockchain is a type of diary or spreadsheet containing information about transactions.

2. Each transaction generates a hash.

3. A hash is a string of numbers and letters.

4. Transactions are entered in the order in which they occurred. Order is very important.

5. The hash depends not only on the transaction but the previous transaction's hash.

6. Even a small change in a transaction creates a completely new hash.

7. The nodes check to make sure a transaction has not been changed by inspecting the hash.

8. If a transaction is approved by a majority of the nodes then it is written into a block.

9. Each block refers to the previous block and together make the Blockchain.

10. A Blockchain is effective as it is spread over many computers, each of which have a copy of the blockchain.

11. These computers are called nodes

12. The Blockchain updates itself every 10 minutes.

### Wallets, digital signatures, protocols
Bob needed to explain the new coin so he gathered the 10 people together.

Jack had confessed his sins and deeply apologized to the group. Therefore, to prove his sincerity he gave Ann and Mary their coins back.

With everything sorted, Bob explained why this could never happen again. He then decided to implement something called a digital signature to confirm every transaction. But first, he gave everyone a wallet.

### What is a wallet?
A wallet is a string of numbers and letters,such as __18c177926650e5550973303c300e136f22673b74__. This is an address that will appear in different blocks within the Blockchain as transactions take place. There will be no visible records of who did the transaction or with whom it was done, only the number of a wallet. The address of individual wallet is also a public key.

### Digital signature
You need two things in order to carry out a transaction: a wallet, which is mainly an address, and a private key. The private key is also a string of random numbers, but this private key must be kept secret unlike the address.

When someone decides to send coins to anybody, they must sign the message containing the transaction with their private key. The system of two keys is at the heart of encryption and cryptography, and its use predates the existence of Blockchain as it was first proposed in the 1970s.

Once the message is sent it is broadcast to the Blockchain network. The network of nodes then works on the message to make sure that the transaction it contains is valid. If it confirms the validity, the transaction is placed in a block and after that no information about it can be altered.

  <img src="https://raw.githubusercontent.com/XinFinOrg/Blockchain_Tutorial-website/live/dist/img/courses/bc-basic/digital-signature.png"  style="width:100%; height: 400px; align-content: center; "/>


### What are cryptographic keys?
A cryptographic key is simply a string of numbers and letters which are made by key generators also known as keygens. These keygens make use of a very advanced mathematics involving prime numbers to create these keys.

### Protocols
The Blockchain comprises of individual behaviour specifications and a large set of rules that are progAlicemed into it. Those specifications are referred to as protocols. The implementation of individual protocols basically made Blockchain what it is (a distributed, peer-to-peer and secured information database).

The Blockchain protocols make sure that the network operates the way it was progAlicemed to by its creators, although it is completely autonomous and not controlled by anyone. Listed below are few samples of protocols implemented in Blockchain:

* Input data for every hash number has to include the previous block’s hash number.

* After every 210,000 blocks are sealed-off, the reward for successfully mining a block decreases by half.

* Mining difficulty is recalculated every 2,016 blocks so that the amount of time needed to mine one block can be kept at approximately 10 minutes.

The placing of a transaction in a block is known as a successful conclusion to a proof of work challenge, and is carried out by special nodes called miners.

Proof of Work is a structure that requires some work from the service requester, which usually means the processing time by a computer. Producing a proof of work is a random process with low probability, so it involves a lot of trial and error to generate a valid proof of work. In Bitcoins, hash is what represent the proof of work.

### What is mining?
In Blockchain, miners are nodes that generate blocks by solving proof of work problems. If a miner generates a block that is accepted by an electronic consensus of nodes, then the miner is rewarded with coins. As of October 2017, Bitcoin miners get 12.5 Bitcoins per block.

This reward is not the only incentive for miners to motivate them in running their hardware. They are also rewarded with the transaction fees that Bitcoin users pay. As there is a large amount of transactions currently happening within the Bitcoin network, the transaction fees have increased very rapidly. Although the fees are voluntary on the part of the sender, miners will always prioritize transfers with higher transaction fees. Therefore, your transaction might take a very long time to be processed unless you are willing to pay a rather high fee.

__Important points__
1. If you possess digital money then you need a digital wallet.

2. A wallet is an address on the Blockchain.

3. A wallet is a public key.

4. Someone wanting to conduct a transaction must send a message with the transaction signed with their private key.

5. Before a transaction is approved it is checked by every node who vote on it in a special electronic way that is different to the elections that most countries have.

6. A transaction is placed in a block by miners who are special nodes.

7. The computers in the network holding the Blockchain are called nodes.

8. Miners place transactions in blocks in response to proof of work challenges.

9. After miners successfully 'seal off' a block of transaction, they receive a reward, which currently stands at 12.5 BTC, and they also get to keep a transaction fees Bitcoin holders pay.

10. Interaction is carried out on a Blockchain using rules built into the program of the Blockchain called protocols.

11. Cryptography is essential on Blockchains to thwart thieves who would like to hack into the Blockchain.

12. Cryptographic keys are made by key generators or keygens.

13. Keygens use very advanced mathematics involving prime numbers to create keys.

14. A block contains a timestamp, a reference to the previous block, the transactions and the computational problem that had to be solved before the block went on the Blockchain.

15. The distributed network of nodes that need to reach consensus makes fraud almost impossible within the Blockchain.

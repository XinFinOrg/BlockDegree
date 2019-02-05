---
parent: Blockchain advanced course for engineer
title: What is proof of work
template: courseContent.hbs
courseIdx: 1
---
Proof-of-Work, or PoW, is the original consensus algorithm in a Blockchain network.

In Blockchain , this algorithm is used to confirm transactions and produce new blocks to the chain. With PoW, miners compete against each other to complete transactions on the network and get rewarded.

In a network users send each other digital tokens.A decentralized ledger gathers all the transactions into blocks. However, care should be taken to confirm the transactions and arrange blocks.

This responsibility bears on special nodes called miners, and a process is called mining.

The main working principles are a complicated mathematical puzzle and a possibility to easily prove the solution.

### Mathematical puzzle in blockchain
It’s an issue that requires a lot of computational power to solve.

There are a lot of them, for instance:
* hash function, or how to find the input knowing the output.
* integer factorization, in other words, how to present a number as a multiplication of two other numbers.
* guided tour puzzle protocol. If the server suspects a DoS attack, it requires a calculation of hash functions, for some nodes in a defined order. In this case, it’s a ‘how to find a chain of hash function values’ problem.

The answer to the PoW problem or mathematical equation is called hash.

As the network is growing, it is facing more and more difficulties. The algorithms need more and more hash power to solve. So, the complexity of the task is a sensitive issue.

### Implementation of proof of work
Miners solve the puzzle, form the new block and confirm the transactions.How complex a puzzle is depends on the number of users, the current power and the network load. The hash of each block contains the hash of the previous block, which increases security and prevents any block violation.

If a miner manages to solve the puzzle, the new block is formed. The transactions are placed in this block and considered confirmed

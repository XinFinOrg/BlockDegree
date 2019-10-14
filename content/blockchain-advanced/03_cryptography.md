---
parent: Blockchain advanced course for engineer
title: Cryptography
template: courseContent.hbs
courseIdx: 1
---
### Private keys
In order to keep your wallet secure, Bitcoin wallets store a secret piece of data called a private key or seed. This private key is then used to sign transactions, providing a mathematical proof that they have come from the owner of the wallet. We call this a __cryptographic signature__.

The signature also prevents the transaction from being altered by anybody once it has been issued. All transactions are broadcast to the network and usually begin to be confirmed within 10-20 minutes, through a process called mining.

A private key is a secret piece of data that proves your right to spend bitcoins from a specific wallet through a cryptographic signature. Your private key(s) are stored in your computer if you use a software wallet; they are stored on some remote servers if you use a web wallet. Private keys must never be revealed as they allow you to spend bitcoins for their respective Bitcoin wallet.

### Cryptography as a security mechanism
To understand blockchain technology, you have to understand these two cryptographic concepts
* Hashing
* Public-private key

#### Hashing
A hashing algorithm converts a string of any size into a string of predefined size (e.g. 256 bytes). It is one-way, meaning when provided with the hash, no can deduce the original string (this is true only if the hash size is significantly big - 256 or 512 bytes). Bitcoin uses SHA256 hashing algorithm and uses for two purposes.
      <img src="https://raw.githubusercontent.com/XinFinOrg/Blockchain_Tutorial-website/live/dist/img/courses/bc-adv/hashing.png"  style="width:100%; height: 400px; align-content: center; "/>


1. Hashing the previous block and storing that hash in the current block, creating a chain of blocks and hashing the transactions and storing them in the Merkel Tree (used for ease of verification of transactions).
2. It uses SHA256 for the proof of work consensus mechanism. This requires mining of blocks, which means finding a value (nonce), such that the hash (SHA256) of the block plus the nonce will be less than a prespecified number called target. Smaller the target, more difficult it is to mine the block.

#### Public-private key cryptography
__Private key__: The private key consists of alphabetic numeric characters that gives a user access and  control over their funds to their corresponding cryptocurrency address. The private key is used to sign transactions that allow the user to spend their funds.

__Public key__: Bitcoin uses digital signatures for user authorisation. Each node generates a public-private key pair. It uses the public key as its network address and the private key to sign blocks/transactions. To check if the node/user has authorised any transaction/block, you have to verify the digital signature using the node’s public key. It is not possible to deduce the private key from the public key, hence this node-alias mechanism is secure. Bitcoin uses ECDSA encryption.
  <img src="https://raw.githubusercontent.com/XinFinOrg/Blockchain_Tutorial-website/live/dist/img/courses/bc-adv/public-private-key.png"  style="width:100%; height: 400px; align-content: center; "/>


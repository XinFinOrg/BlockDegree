---
parent: Blockchain basic course for engineer
title: What is the difference between blockchain and database?
template: courseContent.hbs
courseIdx: 0
---

<img src="/img/courses/bc-basic/blockchain-database.png"  style="width:100%; height: 400px; align-content: center; "/>
                <img src="/img/courses/bc-basic/bc-db.png"  style="width:100%; height: 400px; align-content: center; "/>

__The distinctions between a traditional (Relational or document-oriented) database and a blockchain__

1. In a traditional Database, a single authorised server or a group of authorised servers (sharing in MongoDB) store the data. The users of this data will have to assume that the organisation running the server will not change the data and the security of the server will not be affected.

In a Blockchain technology, all the data are stored publicly on a peer-to-peer network and also verified publicly.

Verifying is formed through cryptography – that is encryption and hashing. As the data is publicly stored, a Blockchain is very tough to hack.

2. In a traditional Database, there is no privacy problem. All the user data (access tokens and login credentials) are privately stored on the server.

To handle the issue of privacy, the blockchain nodes are generally unknown. The user identity is instead in alias through a public cryptographic key. To check if the node has authorised any transaction or block, the digital signature needs to be verified with the use of the node’s public key.

3. In a traditional Database, there is no need to verify data or an agreed method. In a blockchain, a proof of work or proof of agreed method is required so that only one state of the blockchain remains over the peer-to-peer network.

4. In a traditional DB, there is no need to verify data or a consensus mechanism. In a blockchain, a proof of work or proof of stake consensus mechanisms is used so that eventually a single state of the blockchain is maintained over the peer to peer network.

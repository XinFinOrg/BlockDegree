---
parent: Blockchain professional course for engineer
title: Add nodes to your private blockchain
template: courseContent.hbs
courseIdx: 2
---
### Add nodes to your network  

Blockchain is made up of multiple nodes. In order to connect your existing private blockchain node with more nodes, you will need to know the enode of the nodes you are connecting to.

#### Enodes
Through enode you can add nodes in your computer. <a href="https://github.com/ethereum/wiki/wiki/enode-url-format" target="_blank">Enode</a> is a way to identify an Ethereum node in a form of URL scheme. An enode consists of a username and hostname. A hexadecimal string node ID in the username is separated from the hostname by an @ sign. The hostname is given as an IP address, with the TCP listening port. If the TCP and UDP (discovery) ports differ, the UDP is specified as query parameter "discport".

An example of an enode will look like this.
```
enode://6f8a80d14311c39f35f516fa664deaaaa13e85b2f7493f37f6144d86991ec012937307647bd3b9a82abe2974e1407241d54947bbb39763a4cac9f77166ad92a0@10.3.58.6:30303?discport=30301
```
The example above describes a node with IP address `10.3.58.6` with a TCP listening port of `30303` and UDP discovery port of `30301`.

To check the ports used by geth and find your enode URI, run the following command
<div class="precode">geth console</div>

```console
> admin.nodeInfo
```

You will see the following information
<div class="precode">geth console</div>

```no-wrap
{
  Name: 'Geth/v0.9.14/darwin/go1.4.2',
  NodeUrl: 'enode://3414c01c19aa75a34f2dbd2f8d0898dc79d6b219ad77f8155abf1a287ce2ba60f14998a3a98c0cf14915eabfdacf914a92b27a01769de18fa2d049dbf4c17694@[::]:30303',
  NodeID: '3414c01c19aa75a34f2dbd2f8d0898dc79d6b219ad77f8155abf1a287ce2ba60f14998a3a98c0cf14915eabfdacf914a92b27a01769de18fa2d049dbf4c17694',
  IP: '::',
  DiscPort: 30303,
  TCPPort: 30303,
  Td: '2044952618444',
  ListenAddr: '[::]:30303'
}
```

Node 1, which is the node that you have started in the previous tutorial, can add node 2 through command admin.addPeer("<Enode of node 2>"). After adding node 2 as a peer in the network, both the nodes are connected adn will start mining.

In the get CLI(Command Line Interface) enter the below command to get the Node-id.

#### Connect the nodes
In the below image there is two nodes open and we can connect nodes through admin.addPeer(“enter the peer”) after adding both the peer  when you start the mining in the first block you can see the mining occurs in the second block also it happens only when you connect the nodes.

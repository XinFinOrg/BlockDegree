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
```no-wrap
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

Once you have the details of your second node, add the node as a peer to the network with `admin.addPeer`
<div class="precode">shell</div>

```no-wrap
> admin.addPeer("enode://3414c01c19aa75a34f2dbd2f8d0898dc79d6b219ad77f8155abf1a287ce2ba60f14998a3a98c0cf14915eabfdacf914a92b27a01769de18fa2d049dbf4c17694@[::]:30303")
```

To check that the peers are connected correctly, use the `peer()` function. This will return the list of connected nodes.
<div class="precode">shell</div>

```no-wrap
> admin.peers
[{
  ID: '3414c01c19aa75a34f2dbd2f8d0898dc79d6b219ad77f8155abf1a287ce2ba60f14998a3a98c0cf14915eabfdacf914a92b27a01769de18fa2d049dbf4c17694',
  Name: 'Geth/v0.9.14/linux/go1.4.2',
  Caps: 'eth/60',
  RemoteAddress: '5.9.150.40:30301',
  LocalAddress: '192.168.0.28:39219'
}]
```

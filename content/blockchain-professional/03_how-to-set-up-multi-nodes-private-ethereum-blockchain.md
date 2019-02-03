---
parent: Blockchain professional course for engineer
title: How to set up multi-node private Ethereum blockchain?
template: courseContent.hbs
courseIdx: 2
---
#### Add nodes to your network  
Through enode you can add nodes in your computer. And admin can add nodes in the computer as per the requirement.
So node1  can add  node 2  through command admin.addPeer(“the enode of second  node enter here “) so both the nodes are connected with each other and if mining starts in node 1 then in node 2 mining will start in node 2.

In the get CLI(Command Line Interface) enter the below command to get the Node-id.

#### Connect the nodes
In the below image there is two nodes open and we can connect nodes through admin.addPeer(“enter the peer”) after adding both the peer  when you start the mining in the first block you can see the mining occurs in the second block also it happens only when you connect the nodes.

---
parent: Blockchain advanced course for engineer
title: Running Bitcoin blockchain node
template: courseContent.hbs
courseIdx: 1
---
#### Download bitcoin core from the [official website](https://bitcoin.org/en/download)
 <img src="https://raw.githubusercontent.com/XinFinOrg/Blockchain_Tutorial-website/live/dist/img/courses/bc-adv/download-btc-core.png"  style="width:100%; height: 400px; align-content: center; "/>


#### Install the Bitcoin core set up
<img src="https://raw.githubusercontent.com/XinFinOrg/Blockchain_Tutorial-website/live/dist/img/courses/bc-adv/setup.png"  style="width:100%; height: 400px; align-content: center; "/>


#### Open the system environment variable and set path of bitcoin
`C:\Program Files\bitcoin\daemon`
    <img src="https://raw.githubusercontent.com/XinFinOrg/Blockchain_Tutorial-website/live/dist/img/courses/bc-adv/btc-path.png"  style="width:100%; height: 400px; align-content: center; "/>

You can set path from program files, you need to open bitcoin folder, open daemon folder and copy the path and paste it in the system environment variable.

#### Create a folder in the driver and name the folder bitcoin
  <img src="https://raw.githubusercontent.com/XinFinOrg/Blockchain_Tutorial-website/live/dist/img/courses/bc-adv/npm3.png"  style="width:100%; height: 400px; align-content: center; "/>


#### Create a new folder inside the bitcoin folder and name the folder bitcoin core
  <img src="https://raw.githubusercontent.com/XinFinOrg/Blockchain_Tutorial-website/live/dist/img/courses/bc-adv/npm4.png"  style="width:100%; height: 400px; align-content: center; "/>


#### Create a configure file in the bitcoincore folder and name the configure file bitcoin
  <img src="https://raw.githubusercontent.com/XinFinOrg/Blockchain_Tutorial-website/live/dist/img/courses/bc-adv/npm5.png"  style="width:100%; height: 400px; align-content: center; "/>

You need to save this file as bitcoin.configure.

* __Server=1__: There is only one server in the configure file, and connects your pc to bitcoin core server.
* __Daemon=1__: There is only one daemon in the configure file and work as a background process in your computer.
* __Rpc user__: you have to give rpc user name as per your requirement. And you can give this to other person to connect your node in there computer.
* __Rpc-password__: give password as your requirement.And you can give this to other person to connect your node in there computer. until the person doesn’t have your password he will not have access to connect you account.
* __Rpc allow ip__: it provides an ip address to your node so connect you node in different computer.
* __Rpc-port__: It gives port number to your node.

####open command prompt.
  <img src="https://raw.githubusercontent.com/XinFinOrg/Blockchain_Tutorial-website/live/dist/img/courses/bc-adv/npm6.png"  style="width:100%; height: 400px; align-content: center; "/>

#### open the folder from command prompt from the destination where you created  
<img src="https://raw.githubusercontent.com/XinFinOrg/Blockchain_Tutorial-website/live/dist/img/courses/bc-adv/npm7.png"  style="width:100%; height: 400px; align-content: center; "/>


#### Enter the following command
<div class="precode">shell</div>

```console
user:~/bitcoin$ bitcoind –datadir=./bitcoincore –txindex
```
  <img src="https://raw.githubusercontent.com/XinFinOrg/Blockchain_Tutorial-website/live/dist/img/courses/bc-adv/npm8.png"  style="width:100%; height: 400px; align-content: center; "/>

#### After entering the above command in the cmd you will see different folder created in the bitcoincore
  <img src="https://raw.githubusercontent.com/XinFinOrg/Blockchain_Tutorial-website/live/dist/img/courses/bc-adv/npm9.png"  style="width:100%; height: 400px; align-content: center; "/>
  ####open the second command prompt and again open folder from command prompt.
  <img src="https://raw.githubusercontent.com/XinFinOrg/Blockchain_Tutorial-website/live/dist/img/courses/bc-adv/npm10.png"  style="width:100%; height: 400px; align-content: center; "/>

#### Enter the following command
<div class="precode">shell</div>

```console
user:~/bitcoin$ bitcoin-cli –datadir=./bitcoincore getblockchaininfo
```
  <img src="https://raw.githubusercontent.com/XinFinOrg/Blockchain_Tutorial-website/live/dist/img/courses/bc-adv/npm11.png"  style="width:100%; height: 400px; align-content: center; "/>

You will see the public blockchain of bitcoin in the command prompt.

All the blocks which is created by the bitcoin are stored in the bitcoincore folder inside the blocks folder.
  <img src="https://raw.githubusercontent.com/XinFinOrg/Blockchain_Tutorial-website/live/dist/img/courses/bc-adv/npm12.png"  style="width:100%; height: 400px; align-content: center; "/>

 All the Block which is created is saved in the folder.

---
parent: Blockchain advanced course for engineer
title: Running Bitcoin blockchain node
template: courseContent.hbs
courseIdx: 1
---
#### Download bitcoin core from the [official website](https://bitcoin.org/en/download)

#### Install the Bitcoin core set up

#### Open the system environment variable and set path of bitcoin
`C:\Program Files\bitcoin\daemon`
You can set path from program files, you need to open bitcoin folder, open daemon folder and copy the path and paste it in the system environment variable.

#### Create a folder in the driver and name the folder bitcoin

#### Create a new folder inside the bitcoin folder and name the folder bitcoin core

#### Create a configure file in the bitcoincore folder and name the configure file bitcoin
You need to save this file as bitcoin.configure.

* __Server=1__: There is only one server in the configure file, and connects your pc to bitcoin core server.
* __Daemon=1__: There is only one daemon in the configure file and work as a background process in your computer.
* __Rpc user__: you have to give rpc user name as per your requirement. And you can give this to other person to connect your node in there computer.
* __Rpc-password__: give password as your requirement.And you can give this to other person to connect your node in there computer. until the person doesn’t have your password he will not have access to connect you account.
* __Rpc allow ip__: it provides an ip address to your node so connect you node in different computer.
* __Rpc-port__: It gives port number to your node.

#### Enter the following command
<div class="precode">shell</div>

```console
user:~/bitcoin$ bitcoind –datadir=./bitcoincore –txindex
```

#### After entering the above command in the cmd you will see different folder created in the bitcoincore

#### Enter the following command
<div class="precode">shell</div>

```console
user:~/bitcoin$ bitcoin-cli –datadir=./bitcoincore getblockchaininfo
```

You will see the public blockchain of bitcoin in the command prompt.

All the blocks which is created by the bitcoin are stored in the bitcoincore folder inside the blocks folder. All the Block which is created is saved in the folder.

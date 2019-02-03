---
parent: Blockchain professional course for engineer
title: How to create private Ethereum blockchain?
template: courseContent.hbs
courseIdx: 2
---
#### Download Geth
Follow the instructions from the [official Geth website](https://geth.ethereum.org/downloads/) to download geth as per your requirement and your operating system.

#### Check that geth is installed
```console
shell
user:~/$: geth
```

#### Configure your blockchain setting
```console
shell
user:~/$: mkdir blockchain
user:~/$: cd blockchain
user:~/blockchain$: touch genesis.json
```
As you can see from the example, you need to create a `genesis.json` file in your blockchain folder.

__What is a genesis file?__

The genesis block is the start of the blockchain, and `genesis.json` is the file that defines it. It is like the “settings” for your blockchain. For example, the chain configuration, level of difficulty to mine blocks, etc.

There are 4 values(config, difficulty, gasLimit, alloc) you need to specify in `genesis.json`.

__Configure your genesis file__

Explain the various gonfig here

#### Initialise the genesis file
```console
shell
user:~/blockchain$: geth -datadir=./new init genesis.json
```
This command will initialize your genesis block and automatically create new folder in the blockchain folder which contains geth and your keystore

#### Start your blockchain(node)
```console
shell
user:~/blockchain$: geth  --datadir ./new --networkid 989899 --rpc --rpcaddr 0.0.0.0 --rpcport 8545 --rpcapi
db,net,web3,admin,eth,miner,personal --rpccorsdomain
```

This command includes admin minner gives your private blockchain network id and port number and also creates one miner to mine your private blockchain.

#### Create your first account
in the below image there is two account  created in command prompt one account has balance of 185 ether after words transaction is done and 85 ether is transfer from first account to second account and then the second account has 85 ether.

```console
shell
Personal.newAccount() 3
miner.start()
miner.stop()
eth.getBalance(eth.coinbase) //Wei
web3.fromWei(eth.getBalance(eth.coinbase),”ether”)
eth.sendTransaction({from:          to:          value, :web3.toWei(85,"ether")})  // it is Transfer some ether one account to another account.
```


#### Check your transaction
As seen above the transaction is done to see the transaction properly you need to write command eth.getTransaction (“enter the transaction receipt”) after entering the command you can see the Full block with block hash,block number,gas,gas price,hash,input etc you can see in the transaction.

---
parent: Blockchain professional course for engineer
title: Create a private Ethereum blockchain
template: courseContent.hbs
courseIdx: 2
---
#### Download Geth
Follow the instructions from the <a href="https://geth.ethereum.org/downloads/" target="_blonk">official Geth website</a> to download geth as per your requirement and your operating system.

<img src="https://raw.githubusercontent.com/XinFinOrg/Blockchain_Tutorial-website/live/dist/img/courses/bc-pro/qa1.png" alt="geth-download"/>

Geth is a multipurpose order line apparatus that runs a full Ethereum hub executed in Go. It offers three interfaces: the direction line subcommands and choices, a Json-rpc server and an intelligent comfort.

#### Check that geth is installed
<div class="precode">shell</div>

```console
user:~/$: geth
```

You will see the log of a running geth instance.
<img src="https://raw.githubusercontent.com/XinFinOrg/Blockchain_Tutorial-website/live/dist/img/courses/bc-pro/qa2.png" alt="geth-console" />

#### Configure your blockchain setting
<div class="precode">shell</div>

```
user:~/$: mkdir blockchain
user:~/$: cd blockchain
user:~/blockchain$: touch genesis.json
```

__What is a genesis file?__

The genesis block is the first block of the blockchain. As there is no reference to a previous block, the properties of the genesis block is usually hardcoded into the software, as seen in `genesis.json`. In `genesis.json` you will configure the properties of the blockchain. It is like the “settings” for your blockchain. For example, the chain configuration, level of difficulty to mine blocks, etc.

There are __4 required values__ (config, difficulty, gasLimit and alloc) you need to specify in `genesis.json`.

This is an example of how a genesis file.
<div class="precode">~/blockchain/genesis.json</div>

```json
{
  "config": {
    "chainId": 989899,
    "homesteadBlock": 0,
    "eip155Block": 0,
    "eip158Block": 0
  },
  "difficulty": "200",
  "gasLimit": "2100000",
  "alloc": {
    "7df9a875a174b3bc565e6424a0050ebc1b2d1d82": { "balance": "300000" },
    "f41c74c9ae680c1aa78f42e5647a62f353b7bdde": { "balance": "400000" }
  }
}
```

#### Initialise the genesis file
<div class="precode">shell</div>

```console
user:~/blockchain$ geth -datadir=./new init genesis.json
```
This command will initialize your genesis block. You will see that a new folder is created in the blockchain folder. This new folder contains geth and your keystore.
<img src="https://raw.githubusercontent.com/XinFinOrg/Blockchain_Tutorial-website/live/dist/img/courses/bc-pro/qa5.png" alt="geth-console init" />

#### Start your blockchain(node)
<div class="precode">shell</div>

```no-wrap
user:~/blockchain$ geth  --datadir ./new --networkid 989899 --rpc --rpcaddr 0.0.0.0 --rpcport 8545 --rpcapi db,net,web3,admin,eth,miner,personal --rpccorsdomain
```

This command includes admin, miner, gives your private blockchain network id and port number and also creates one miner to mine your private blockchain.

#### Create your first account
Attach Geth to your console with the rpcport you declared in the previous command.
<div class="precode">shell</div>

```console
user:~/blockchain$ geth attach http://0.0.0.0:8545
```

Now you are ready to interact with your private Ethereum blockchain. Let's start off by creating new account and transferring some ether from one account to the other.

<div class="precode">geth console</div>

```console
> Personal.newAccount()
> miner.start()
> miner.stop()
> eth.getBalance(eth.coinbase) //Wei
> web3.fromWei(eth.getBalance(eth.coinbase),”ether”)
> eth.sendTransaction({from: <AddrA> to: <AddrB> value, :web3.toWei(85,"ether")})  // it is Transfer some ether one account to another account
```
<img src="https://raw.githubusercontent.com/XinFinOrg/Blockchain_Tutorial-website/live/dist/img/courses/bc-pro/qa8.png" alt="create eth transactions" />


#### Check your transaction
When you make a transaction, the console will print an alphanumberic string, which is the `TX receipt` for the particular transaction. With the `TX receipt`, you will be able to get the transaction details, like __blockhash__, __blocknumber__, __sender__ and __gas price__.

<div class="precode">geth console</div>

```console
> eth.getTransaction('<TX receipt>')
```
<img src="https://raw.githubusercontent.com/XinFinOrg/Blockchain_Tutorial-website/live/dist/img/courses/bc-pro/qa9.png" alt="check transaction information" />

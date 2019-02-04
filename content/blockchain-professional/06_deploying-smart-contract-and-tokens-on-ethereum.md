---
parent: Blockchain professional course for engineer
title: Deploying smart contracts and tokens on Ethereum
template: courseContent.hbs
courseIdx: 2
---
### Create Genesis File on Notepad (json Format)

```json
json
{
	"config": {
    "chainId": 989899,
    "homesteadBlock": 0,
    "eip155Block": 0,
    "eip158Block": 0
	},
	"difficulty": "200",
	"gasLimit": "99999999999999999",
	"alloc": {
	}
}
```

### Start your blockchain
```console
shell
user:/$ cd ~/blockchain
user:~/blockchain$ geth –datadir=./chaindata init genesis.json
user:~/blockchain$ geth –datadir ./chaindata --networkid 989899
```


### Attach the Geth console
Open a new command prompt and run the command below
```console
shell
user:/$ cd ~/blockchain
user:~/blockchain$ geth attach
```

Create  your own Account
```console
geth javascript console
> personal.newAccount()
> miner.start()
> miner.stop()
> eth.getBalance(eth.coinbase)
  25000000000000000000
> web3.fromWei(eth.getBalance(eth.coinbase))
  15  
```

The XDC-E smart contract is availabel on the following link .copy the smart contarct .

https://docs.google.com/document/d/1v9Oow11P7WfDBUHwesD-bercqH4jOE_8bWtobssx8ro/edit?usp=sharing

### Write Your Smart Contract on Remix Comipler

After that copy on ABI (Web3deploy) :-

Copy of the ->var Coincontract =web3.eth.contract………. etc.
Copy of the ->var coin= coinContract.new …………. Etc.


After that Submitted contract is creation

### Calling our Smart Contract

Now that our smart contract is deployed on our private Ethereum Blockchain, we can invoke our smart contract. You will require two information of the smart contracts:
1. The ABI definition
2. The contract address

Contract is deployed

With that you have deployed your smart contract to your own private Ethereum network!

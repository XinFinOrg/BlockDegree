---
parent: Blockchain professional course for engineer
title: Popular features of ICO smart contracts
template: courseContent.hbs
courseIdx: 2
---
One of the use cases of blockchain that has increased adoption is Initial Coin Offerings (ICOs). ICOs is the process whereby an individual or an organisation creates their own tokens and offers these tokens in exchange for Bitcoin or Ethereum.

In an ICO smart contracts, there are various features that we will look into. There are various logic like timeouts, spending limit, multisig and vault. When programming your ICO smart contract, you will have to take note that the increase in the logic that you implement in the smart contract also represent a higher vulnerabilities for attacks and bugs on your smart contract.

### Capped Contracts
__Min cap__ (also known as _soft cap_) is the minimum financial goal of a crowdsale. In other words, it’s the minimum amount at startup, which is deemed sufficient to carry on with a project.

__Max cap__ (also known as _hard cap_) is the maximum desired financial goal from an ICO. It’s the amount that the project needs to develop or improve their product. The team usually believes this amount will cover the successful development of the project until the moment it becomes profitable.

### Mintable Tokens
In real world, a __mint__ is an industrial facility to manufacture coins that can be used as currency.

In the world of cryptocurrency too, It is often necessary to mint new tokens during crowd sales. Consider the case when the number of tokens issued at the beginning of crowdsale have been completely consumed and you still have investors coming in for your crowd sale, you need to mint tokens now. The standard ERC20 token does not cover this functionality authority. This is powerful because you can normally decide on the number of total signatures that can sign a transaction for a given account and then decide how many should be in the subset of those signatures that have to sign before a transaction is accepted. This is also known as m-of-n, where m could be say 3, the number of signatures that are required to send before the transaction is even accepted, and _n_ could be 7, the total number of signatures that can sign if they wish. The signatures in n must be predetermined at the time of the multisig account creation, and m will always be a subset of _n_.

### Finalizable Contracts
Finalizable contract allows owners to add logic of extra work once the crowdsale is finished. It is always used once the crowdsale is finished to add some extra finalization work to the contract. It has an internal finalization function which can be overridden to add finalization logic. The overriding function should call `super.finalization()` to ensure the chain of finalization is executed entirely.

### Upgradable Contracts
Upgradable contracts are divided into two types of contracts- __Upgrade Agent__ and __Upgrade Token__.

__Upgrade Agent__ transfers tokens to a new contract. Upgrade agent itself can be the token contract or a middleman contract doing the heavy lifting.

__Upgrade Token__ contract provides a token upgrade mechanism where the users can opt-in amount of tokens to the next smart contract revision

### Refundable Contracts
In cases whereby the soft cap is not reached, you might want to set the option of returning ethereum/bitcoin to the token's buyers. To achieve this, we can make use of OpenZepplin, a framework of reusable smart contracts for Ethereum. OpenZeppelin does it by creating a refund vault, which stores the tokens while the crowdsale is in progress. When the soft cap is not met, this feature will allow the possibility of users getting a refund.

This is done using a pull mechanism, while keeping the Re-Entry problem into consideration to avoid attacks from malicious contracts/users.

### Time Vault Contracts
This contract helps establish time limits, before which a user won’t be able to withdraw his tokens. It is useful to stop vindictive investors to take their investment back before a crowdsale ends. Although mostly it is used to keep a check on owners of the crowdsale, stopping them to run away with their investors money. It was first implemented by Lunyr where the founders received 15% of issued tokens and they had their tokens locked in a time vault contract for 180 days.


### Burnable Tokens/Freezable Tokens
After a crowdsale ends, what should happen to the remaining unsold tokens? You can use them as a rewarding mechanism, incentivising your community members to act in the best interest of your network.  Alternatively, the token contract owner can choose to burn the tokens, effectively reducing the amount of circulating supply. As the market cap is determined by the volume and your circulating supply, this might eventually lead to an increase in overall value of your tokens.

Another option is to freeze part of the token supply. It is similar to keeping them untouched for a particular interval of time. This are seen in cases whereby there are multiple funding rounds involve. For instance, if you are targeting two funding rounds through token sales, you can freeze part of the tokens for the tokens. In the first round, you might sell 25% of your tokens. Upon hitting a year and achieving your project milestones, you can run a 2nd crowdfunding round with the tokens that are frozen at the token's market rate, at that point in time.

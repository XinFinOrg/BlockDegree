---
parent: Blockchain professional course for engineer
title: Popular features of ICO smart contracts
template: courseContent.hbs
courseIdx: 2
---
This essay focuses on some recent adoptions becoming popular in the blockchain community while writing smart contracts for ICOs. It skips basic recommendations like ERC20 and enlist some essential features for ICO smart contracts.

In use in many successful ICOs they should result in a higher probability to succeed. However I would advise you to only adopt features which are essential to your ICO. As more logic can be used in smart contracts to implement more security features like timeouts, spending limits, multisig, vaults etc. Although, the more logic in the smart contract the bigger the attack surface and the more likely that bugs are introduced that risk undermining the security feature.

### Capped Contracts
__Min cap__ (also known as _soft cap_) is the minimum financial goal of a crowdsale. In Layman’s terms, it’s the minimum amount at startup, which is deemed sufficient to carry on with a project.

__Max cap__ (also known as _hard cap_) is the maximum desired financial goal from an ICO. It’s the amount that the project needs to develop or improve their product. The team usually believes this amount will cover the successful development of the project until the moment it becomes profitable.

### Mintable Tokens
In real world, a __mint__ is an industrial facility to manufacture coins that can be used as currency.

In the world of cryptocurrency too, It is often necessary to mint new tokens during crowd sales. Consider the case when the number of tokens issued at the beginning of crowdsale have been completely consumed and you still have investors coming in for your crowd sale, you need to mint tokens now. The standard ERC20 token does not cover this functionality authority. This is powerful because you can normally decide on the number of total signatures that can sign a transaction for a given account and then decide how many should be in the subset of those signatures that have to sign before a transaction is accepted. This is also known as m-of-n, where m could be say 3, the number of signatures that are required to send before the transaction is even accepted, and _n_ could be 7, the total number of signatures that can sign if they wish. The signatures in n must be predetermined at the time of the multisig account creation, and m will always be a subset of _n_.

### Finalizable Contracts
Finalizable contract allows owners to add logic of extra work once the crowdsale is finished. It is always used once the crowdsale is finished to add some extra finalization work to the contract. It has an internal finalization function which can be overridden to add finalization logic. The overriding function should call super.finalization() to ensure the chain of finalization is executed entirely.

### Upgradable Contracts
Upgradable contracts are divided into two types of contracts- Upgrade Agent and Upgrade Token.

__Upgrade Agent__ transfers tokens to a new contract. Upgrade agent itself can be the token contract or a middleman contract doing the heavy lifting.

__Upgrade Token__ contract provides a token upgrade mechanism where the users can opt-in amount of tokens to the next smart contract revision

### Refundable Contracts
In case the soft cap decided at the beginning of your crowdsale is not reached, you need to refund your investor's money. Open-zeppelin does it by creating a refund vault, which stores money while the crowdsale is in progress. It refunds money if the crowdsale fails, otherwise forwards it if successful.

This is done using a pull mechanism, while keeping the Re-Entry problem into consideration to avoid attacks from malicious contracts/users.

### Time Vault Contracts
This contract helps establish time limits, before which a user won’t be able to withdraw his tokens. It is useful to stop vindictive investors to take their investment back before a crowdsale ends. Although mostly it is used to keep a check on owners of the crowdsale, stopping them to run away with their investors money. It was first implemented by Lunyr where the founders received 15% of issued tokens and they had their tokens locked in a time vault contract for 180 days.


### Burnable Tokens/Freezing Tokens
After a crowdsale ends, what should happen to the remaining unsold tokens? You can use them as a rewarding mechanism, profiting to your reliable customers or you can burn them, which can eventually lead to an increase in overall value of your tokens.

Another popular option these days is freezing them. It is similar to keeping them untouched for a particular interval of time This is useful in case you want to have multiple funding rounds.
For instance you can sell 25% of your tokens now, raising money and then a year later have a 2nd crowdfunding round at higher token rates after you're idea's success

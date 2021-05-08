---
layout: post
title: The Synchronization Power of Token Smart Contracts
author: Co-authored by Giorgia Marson, Luca Zanolini, and Christian Cachin
ghcommentid: 4
---

Scaling blockchains by reducing the concurrency across token transactions.

The increasing popularity of decentralized applications has motivated prominent efforts (like [ETH2](//ethereum.org/en/eth2/)) towards improving the scalability and performance for blockchains. In this context, [research on distributed protocols](//www.distributedprogramming.net) plays a major role: many new proposals have emerged to scale the throughput of a blockchain platform, giving rise to a plethora of different distributed ledgers today. A common objective of these proposals is to ensure that blockchain nodes execute all transactions in the same order, using the [replicated state-machine approach](//www.cs.cornell.edu/fbs/publications/smsurvey.pdf) where a broadcast protocol forms chain of transactions:

![Totally ordered transactions form a chain](/images/synchronization-linear.png){: width="70%" .center-image}

This process is often referred to as "consensus", which is equivalent to total-order broadcast. Since reaching consensus is expensive, it is important to understand where it may be avoided without losing consistency.


### Concurrent objects for synchronization

For investigating concurrency, one usually considers two distinct models: message-passing and shared memory. In the message-passing model, processes do not have any shared state and communicate with each other via messages. Processes in the shared-memory model, however, operate on the same data, which they access concurrently. Despite these differences, results in one model can be transferred to the other one. The gist of a synchronization problem in a distributed system using message passing is often more clearly expressed by the corresponding shared-memory formalization.

Shared-memory abstractions are _objects_, which provide operations to processes. The simplest such object is a _register_. It only offers operations for _reading_ and _writing_ a single value. An important object is _consensus_, which implements agreement on a value; it provides a single operation, called _propose_. All processes may concurrently invoke _propose_ and add their own proposed value as argument. Every process may do this at most once, however. Upon completion, the operation returns a _decided_ value, which is one of the proposed values.

![Concurrent consensus](/images/synchronization-consensus.png){: width="70%" .center-image}

The prominent result by [Fischer, Lynch, and Paterson](//groups.csail.mit.edu/tds/papers/Lynch/jacm85.pdf) establishes the impossibility of implementing consensus from atomic registers in a [wait-free manner](//cs.brown.edu/people/mph/Herlihy91/p124-herlihy.pdf). In other words, implementing a consensus object with only atomic registers cannot ensure that every invocation to its _propose_ operation terminates. This means that consensus requires a higher level of synchronization than atomic registers. In fact, the consensus object is _universal_, in the sense that [any shared object described by a sequential specification can be wait-free implemented](//doi.org/10.1016/C2011-0-06993-4) from consensus objects and atomic registers. Therefore, consensus can be used to reason about the synchronization power of all shared objects among a number of processes. This leads to the central concept of [consensus numbers](//cs.brown.edu/people/mph/Herlihy91/p124-herlihy.pdf) to express the synchronization power of shared objects.

Formally, the _consensus number_ associated with an object **O** is the largest number **n** such that it is possible to realize a consensus object from atomic registers and objects of type **O**, in a system of **n** processes. If there is no largest **n**, the consensus number is said to be infinite. Consensus numbers establish a hierarchy among concurrent objects and allow for _comparing_ them based on their _synchronization power_ as well as their _synchronization requirements_.


### No consensus needed!

[Guerraoui et al.](//dl.acm.org/doi/10.1145/3293611.3331589) propose a shared-memory abstraction for _asset transfer_ as implemented in [Bitcoin](//bitcoin.org/bitcoin.pdf), and they show that this requires only a minimal level of synchronization. Specifically, they prove that asset transfer has consensus number 1 in the wait-free hierarchy. Their result suggests that current implementations may be sacrificing efficiency and scalability because they synchronize transactions much more tightly than actually needed. For cryptocurrencies that support shared accounts with up to _k_ owners, Guerraoui et al. introduce a _k_-shared asset transfer (_k_-AT) object and show that it has consensus number _k_, which is as powerful as consensus among its _k_ owners. Going beyond their theoretical elegance, these results are of great practical interest because they pave the way to consensus-free implementations of cryptocurrencies.


### Our findings

Modern blockchains support a variety of distributed applications realized by _smart contracts_. These applications go far beyond cryptocurrencies and decentralized payments, as initially envisioned by Bitcoin. Smart contracts enable a blockchain to execute arbitrary programs in a fully decentralized fashion, akin to a _world computer._ Introduced by [Ethereum](//ethereum.org/), smart contracts come in many different flavors and are the key element in most _decentralized finance (DeFi)_ projects today. Smart contracts represent value using tokens. These are blockchain-based assets which can be exchanged across users of a blockchain platform. Ethereum's Request for Comment (ERC) 20 defines a blueprint for the creation of a specific type, dubbed [ERC20 token](//eips.ethereum.org/EIPS/eip-20), one of the [most widely adopted](//etherscan.io/tokens) tokens on Ethereum. The ERC20 standard provides functions for handling tokens over Ethereum, allowing users to own and exchange goods such as digital and physical assets. It formulates a common interface for fungible tokens and has become the most widely-deployed API for implementing a token functionality: More than half of the overall transactions on Ethereum are ERC20 token transfers. 

In [recent work](//arxiv.org/abs/2101.05543), which will be published at [ICDCS 2021](//icdcs2021.us), we investigate the synchronization power of smart contracts on Ethereum, and in particular that of token contracts. We present an abstraction of a token object that captures and generalizes the functionality of an ERC20 contract.

ERC20 is considerably more flexible than the transaction model in Bitcoin. The additional features of ERC20 make it possible, for example, to let account owners conditionally issue transfers to other users of their choosing. 

![Concurrent ERC20 token object](/images/synchronization-erc20.png){: width="70%" .center-image}

Likewise, the ERC20 token object is strictly more powerful than _k_-AT because account owners may approve other spenders to transfer tokens. An owner may approve new spenders flexibly, at any time, and for arbitrary amounts. This results in a _dynamicity_ that has no counterpart with _k_-AT. Because of these differences, the results established for _k_-AT cannot be lifted to ERC20 tokens. What crucially distinguishes an ERC20 object from _k_-shared asset transfer is the increased level of dynamicity, which is reflected in its synchronization requirements. Namely, the consensus number of ERC20 tokens depends on the number of approved spenders for the same account, which may change as the account owner enables more spenders.

Our research shows that synchronization among a dedicated subset of nodes participating in a blockchain is enough for building prominent applications. ERC20 require consensus only among the largest set of enabled spenders for an account; importantly, the exact synchronization requirements can be readily deduced from the current object’s state by reading the current balances and allowances. Thus, not all transactions require synchronization and many can run concurrently. This leads to a graph with parallel transactions that offers higher throughput: 

![Dynamically ordered and concurrent transactions of an ERC20 token object](/images/synchronization-dag.png){: width="70%" .center-image}

Our insights open up the possibility to deploy realistic smart contracts, such as ERC20 tokens, on more scalable and performant protocols than consensus-based blockchains. 

Link to the research paper: [http://arxiv.org/abs/2101.05543](//arxiv.org/abs/2101.05543)

---
layout: post
title: No Consensus in the Ripple Network
ghcommentid: 3
---

A technical analysis of Ripple's protocol reveals that it ensures neither safety nor liveness under the stated assumptions.

## Ripple consensus

Blockchain networks process and validate transactions without a central coordinator.  They use distributed, fault- and attack-tolerant *consensus protocols* to achieve this.  Whereas Nakamoto's protocol in Bitcoin or Ethereum lets the nodes agree by an energy-hungry and slow proof-of-work, other systems like [Tendermint](https://tendermint.com/), [Hyperledger Fabric](https://github.com/hyperledger/fabric), or [Libra](https://developers.libra.org/docs/the-libra-blockchain-paper) use the permissioned model, with a defined set of nodes that vote on transactions.  The latter follow the established algorithms for Byzantine-fault-tolerant (BFT) consensus from textbooks ([such as this one](https://www.distributedprogramming.net)) and process transactions extremely fast, but face criticism due to their permissioned nature.

The Ripple consensus protocol targets a middle ground between proof-of-work and BFT consensus by breaking up the common, global notion of a shared set of validator nodes.  It lets every node declare other nodes it subjectively trusts in a so-called *Unique Node List (UNL)*.  A validator respects only the opinions of nodes in its UNL for validating transactions.

Ripple's consensus protocol aims at [ensuring that the same transactions are processed and validated ledgers are consistent across the network](https://xrpl.org/consensus.html).  It should protect the system against attacks and failure modes, such as [malicious actors that may be attempting to control or interrupt the system at any given time](https://xrpl.org/consensus-protections.html).


## Safety and liveness

A consensus protocol in a blockchain network must satisfy *safety* and *liveness*.  Safety means that nothing "bad" ever happens: the ledger does not fork or and malicious participants cannot double-spend a token.  Liveness means that something "good" happens over and over again, so that the network continues to process transactions and makes progress.  Violating either property creates trouble for all participants in the network.

In a [consensus overview from 2017](https://doi.org/10.4230/LIPIcs.DISC.2017.1), we have already pointed out that blockchain consensus protocols must be assessed formally.  Unfortunately, many systems have been designed and were even deployed without following the scientific method of protocol design.  Ripple is no exception to this, as we discuss here.


## Ripple consensus fails badly

In our paper [Security Analysis of Ripple Consensus](https://arxiv.org/abs/2011.14816) that will be published at the [OPODIS 2020 conference](https://opodis2020.unistra.fr/) later this year, we investigate the Ripple consensus protocol.  We give a detailed description of the protocol, suitable for assessing its properties at the level of scientific protocol research.  No formal description of Ripple consensus with comparable technical depth has been available so far.

With the help of our model, we show that Ripple's protocol does *not achieve consensus* and may *violate* safety and liveness, even under extremely mild adversarial conditions. In particular, the network may fork under the standard condition on UNL overlap stated by Ripple and in the presence of only a very small fraction of malicious nodes.  The malicious nodes may simply send conflicting messages to correct nodes during a time when the network omits or delays messages among correct nodes.  The following scenario, which is taken from the [research paper](https://arxiv.org/abs/2011.14816) and explained there, illustrates the problem of forking into separate ledgers **L** and **L'** :

![Violation of safety in the Ripple network](/images/noconsensusripple-safety.png){: width="50%" .center-image}

We also demonstrate how Ripple's consensus protocol may lose liveness, even if all nodes have the same UNL and there is only one Byzantine node. If this would occur, the system has to be restarted manually.

Given these findings, we conclude that the consensus protocol of the Ripple network is brittle and fails to ensure consensus as commonly understood in computer science and among blockchain practitioners.


## No decentralization

Recall that Ripple aims at decentralizing its consensus by letting each node select the validators it subjectively trusts through the UNL. One of our failure scenarios becomes possible because some nodes use a different UNL than others.

In the default configuration operating today, however, the Ripple company supplies the [default UNL](https://vl.ripple.com/) and [recommends that all validators use it](https://xrpl.org/technical-faq.html).  We believe that all validators indeed follow this advice.  Our findings also show that there are good reasons for insisting on such a centralized structure in the Ripple network.  Namely, would nodes select the trusted validators on their own,  consensus might be violated much more easily.


## Consequences

So far, our attacks are purely theoretical and have not been demonstrated with a live network.  But decades of research in computer security have shown that hypothetical attacks that were initially thought to be of academic interest only eventually make it into practice. Defenses must be established well ahead of that time.

Our findings show that the Ripple protocol relies heavily on synchronized clocks, timely message delivery, the presence of a fault-free network, and an a-priori
agreement on common trusted nodes with the UNL signed by Ripple. If one or more of these conditions are violated, especially if attackers become active inside the network, then the system may fail badly.

If Ripple instead had adopted one of the standard BFT consensus protocols, which have been carefully described and analyzed in the scientific literature and are operating in blockchain networks today, then the network would not be exposed to such dangers.

[Link to the preprint on arxiv.org](https://arxiv.org/abs/2011.14816)

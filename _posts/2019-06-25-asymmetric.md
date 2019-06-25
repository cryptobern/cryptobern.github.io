---
layout: post
title: Asymmetric distributed trust
---

A sound model for blockchain consensus with flexible and subjective trust.


## Blockchain and consensus

The success of cryptocurrencies like Bitcoin and Ethereum relies on a
widely shared perception that these blockchains are "trustless".  Their
consensus mechanism uses proof-of-work coupled with mining rewards.  They
are decentralized in the sense that anyone interested may take part in the
decision process, and the nodes governing the blockchain have no identities.

Different protocols for consensus (or [Byzantine
agreement](https://doi.org/10.1145/357172.357176)) have been studied in
science for about [40 years](https://doi.org/10.1007/978-3-642-11294-2_9)
and traditionally rely on participant identities for voting.  Many
Byzantine-fault tolerant consensus algorithms have been adapted for
[distributing trust](https://cachin.com/cc/papers/dti.pdf) in blockchain
systems recently: [Tendermint](https://tendermint.com/), [Hyperledger
Fabric](https://doi.org/10.1145/3190508.3190538),
[LibraBFT](https://developers.libra.org/docs/crates/consensus) and many
others use consensus in this model.  They may achieve 1000s of times
[better throughput](http://vukolic.com/iNetSec_2015.pdf) than consensus
with proof-of-work.

Since the early days of "blockchain", many developers have sought to fill
the gap between these two consensus approaches and to combine the best
elements of both worlds: no voting and anonymity from proof-of-work with
speed and formal correctness from Byzantine consensus.  All too often, such
proposals simply consisted of a white paper with no substance, however.

[Marko Vukolic](http://vukolic.com/) and I have reviewed some blockchain
consensus efforts in 2017 and issued a [snake-oil
warning](https://arxiv.org/pdf/1707.01873).  We pointed out that blockchain
consensus is like cryptography: don't build your own!  Instead, rely on
established principles and formal proofs.

![Consensus](/images/consensus800.jpg){: width="75%" .center-image}

*Reaching consensus is not always that easy*
{: style="text-align: center;"}


## Ripple and Stellar - consensus?

The [Ripple consensus protocol
(RCP)](https://ripple.com/files/ripple_consensus_whitepaper.pdf) has been
developed around 2014 by [Ripple Labs](https://ripple.com) and aims at
solving the Byzantine consensus problem in a new model, where each
participant node only listens to nodes that it trusts.  It is claimed that
RCP provides consensus, but this has been refuted by multiple researchers
in the scientific literature
([here](https://doi.org/10.1007/978-3-319-22846-4_10) and
[here](https://arxiv.org/pdf/1802.07242)).

The interesting idea of Ripple is to let each participant express its own,
flexible trust choice.  Notice that traditional Byzantine consensus
protocols use only "trust by numbers" and require common trust: among the N
participating nodes, every subset of F could misbehave, towards any node.
Such algorithms [typically achieve consensus as long as F <
N/3](https://distributedprogramming.net/).  RCP no longer requires common
trust and lets each node make its own assumption about the trustworthiness
of others.

![Number of votes](/images/numberofvotes.png){: width="40%" .center-image}


[Stellar](https://stellar.org) later evolved from Ripple and introduced its
own consensus protocol,
[SCP](https://www.stellar.org/papers/stellar-consensus-protocol.pdf), based
on Federated Byzantine Quorum Systems (FBQS).  SCP makes the subjective
trust choice of each node more precise and aims to extend Byzantine
consensus.  However, existing models of Byzantine quorums and protocols
cannot be generalized to FBQS.


## Safety and liveness

According to a [fundamental result in distributed
computing](https://www.podc.org/dijkstra/2018-dijkstra-prize/), every sound
protocol must satisfy safety and liveness properties:

- Safety means that nothing "bad" will ever happen.

- Liveness means that something "good" will happen in the future.

But algorithms that achieve only one property are useless!  For example,
doing nothing is always safe.  Similarly, and algorithm that simply does
something, even if it is wrong, is always live.  (As an example, read the
recent observations about [Ethereum's CBC
casper](https://medium.com/@muneeb/peer-review-cbc-casper-30840a98c89a)).

In a [paper released 2018](https://arxiv.org/pdf/1802.07242), authors at
Ripple demonstrated that RCP could violate consensus if used as intended
with subjective trust.  (Not surprisingly, this finding is well-hidden in
the middle of their paper!)  Namely, if nodes depart from the common trust
configuration issued by Ripple Labs (through a "Unique Node List" in the
default configuration file) and instead express their own choices, then RCP
may halt and violate liveness!  "Manual intervention" would then be needed
to restart the network.

For Stellar's consensus protocol, a recent study titled ["Is Stellar As
Secure As You Think?"](https://arxiv.org/pdf/1904.13302) has found that the
subjective trust choices of the nodes made the network significantly
centralized.  The system does not provide the intended resilience against
faults and attacks.  In May 2019, the Stellar blockchain [actually
halted](https://cointelegraph.com/news/stellars-blockchain-briefly-goes-offline-confirming-the-project-lacks-decentralization)
and violated liveness because not enough trustworthy nodes existed.

As of today, it remains unclear to which extent that Ripple's and Stellar's
protocols actually provide consensus as needed by blockchains.  Each system
is clearly governed by their "mother" entity, company or foundation.  In
the mathematical sense, neither one is a consensus protocol.

No algorithms have yet filled the gap between the decentralized approach
without identities and Byzantine consensus using voting.  Finding models
for consensus with subjective trust and flexible quorums has been a widely
open question for years.


## Asymmetric distributed trust

A newly published paper that [Björn
Tackmann](https://researcher.watson.ibm.com/researcher/view.php?person=zurich-BTA)
of IBM Research and I co-authored answers this question.  It introduces a
new model for [**asymmetric distributed
trust**](https://arxiv.org/abs/1906.09314) and formalizes Byzantine quorum
systems that allow subjective trust.  Every node is free to choose which
combinations of other nodes it trusts or considers faulty.

![Asymmetric quorum system](/images/asymmetric_quorum.png){: width="66%" .center-image}

Our asymmetric quorum formulation extends the well-established quorum
systems that underlie classic Byzantine consensus.  We also introduce
several protocols with asymmetric trust that strictly generalize existing
standard algorithms, which have so far required common trust and knowledge
of all nodes.  We are currently building a full consensus protocol in this
model, which will be suitable for blockchain platforms.

By allowing open membership and abandoning a shared view of trust in the
system, asymmetric quorums bridge the gap between the two main consensus
protocol families used by blockchains.  For protocols in this model, it
will be possible to formally prove safety and liveness, as necessary for
understanding the security of a blockchain network.  The participants will
be able to clearly evaluate their voting power and to check whether given
choices of "whom trusts whom" are safe for operating the network or if they
carry the risk of failure.

[Link to arxiv.org paper](https://arxiv.org/abs/1906.09314)



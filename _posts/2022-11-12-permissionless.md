---
layout: post
title:  Quorum systems in permissionless networks
ghcommentid: 13
author: Christian Cachin
---

We introduce a new abstraction for expressing fault-tolerant consensus
protocols in open, permissionless networks.  It generalizes fail-prone
systems and Byzantine quorum systems, asymmetric distributed trust, and
gives a new characterization of the model used in the Stellar blockchain.

### Quorum systems, Byzantine faults, and permissionsless consensus

Traditional consensus protocols for distributed systems use the so-called
[_Byzantine-fault tolerance (BFT)
model_](//en.wikipedia.org/wiki/Byzantine_fault): A known set of _N_ nodes
participate in a protocol and the protocol tolerates up to _F < N/3_ of
these nodes to exhibit Byzantine faults, such as trying to get an unfair
advantage or attacking the protocol.  Many protocols of this kind can be
found in [textbooks on distributed
algorithms](http://distributedprogramming.net), and the recent [HotStuff
protocol](https://doi.org/10.1145/3293611.3331591) also works in this
model.  Every node _knows_ all others that participate.  (Proof-of-Stake
is similar, except nodes know how much total stake there is instead 
of the identity of the other participants.)  In these
algorithms and also in the corresponding practical systems, any set of
_more than (N+F)/2_ participating nodes form a _quorum_.

In contrast, the model introduced by [Bitcoin](https://bitcoin.org/) and
used by the Nakamoto consensus protocol is open: anyone can participate
without knowing of others, no contact with other nodes is needed, and more
importantly, no assumptions about other nodes are involved.  This model has
been called _permissionless_.

### Partial and subjective trust

Let us consider a middle ground between these two models: a world in which
every node knows only _a part_ of the nodes.  Moreover, each node makes its
own, subjective failure assumption about the others.

Several researchers have explored this world: [Damgård, Desmedt, Fitzi, and
Nielsen in 2007](//doi.org/10.1007/978-3-540-76900-2_22) or [Sheff, van
Renesse, and Myers in 2014](//arxiv.org/abs/1412.3136), for example.
[Cachin and Tackmann in 2019](//doi.org/10.4230/LIPIcs.OPODIS.2019.7)
introduced the _asymmetric-trust model_ to capture such assumptions in the
form of _asymmetric Byzantine quorum systems_, which generalize the
traditional notion of Byzantine quorums.

Several practical blockchain networks have also explored this world:
[Ripple](//ripple.com) developed and deployed an open consensus protocol
based on selective knowledge of other nodes and subjective trust
assumptions in 2012.  In the corresponding _XRP ledger_ protocol, every
node declares a _Unique Node List_ of nodes that it trusts.
[Stellar](//stellar.org) later followed suit with a different
permissionless model based on subjective trust.

Even though all nodes are free to make their own failure assumptions in
these models, a critical and unsolved problem exists: maintaining
consistency requires compatible assumptions, such that the quorums have
sufficient overlap.  Prior common knowledge or prior synchronization seems
necessary to achieve this, which is not desirable.

### Permissionless quorum systems

In a recent paper, we formulate [Quorum Systems for Permissionless
Networks](//arxiv.org/abs/2211.05630), a model that generalizes the theory
of fail-prone systems for permissionless protocols.  The work is
co-authored by [Luca Zanolini](//crypto.unibe.ch/lz) and [Christian
Cachin](//crypto.unibe.ch/cc/) of the University of Bern and [Giuliano
Losa](//www.losa.fr) of the [Stellar Development
Foundation](//stellar.org/foundation).

Our new model lets each node not only name groups of nodes that it knows
and state whom among them might fail, but each node may also make
assumptions about the assumptions of other nodes.  By transitivity this
means that nodes may not even know of any common nodes and nevertheless
have intersecting quorums.  This enables them, in principle, to run
protocols for consensus, such as a blockchain network.

This model generalizes _asymmetric quorum systems_ and also gives a new
characterization with standard formalism of the model used by the [Stellar
blockchain](//stellar.org/).

For more information, see our preprint [Quorum Systems in Permissionless
Networks](//arxiv.org/abs/2211.05630), which will be presented at the
[OPODIS 2022](//sites.uclouvain.be/OPODIS2022/) conference and later appear
in the proceedings.

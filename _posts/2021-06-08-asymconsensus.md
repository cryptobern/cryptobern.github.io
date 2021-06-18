---
layout: post
title: Asymmetric Asynchronous Byzantine Consensus
author: Co-authored by Christian Cachin and Luca Zanolini
ghcommentid: 8
---

We show how to realize randomized signature-free asynchronous Byzantine consensus with [asymmetric quorum systems](/asymmetric).

Consensus is arguably one of the most important notions in [distributed computing](//distributedprogramming.net) and a key mechanism in blockchains. In permissionless blockchains, the miners act as participants in consensus protocols and operate in a trustless environment. Agreement is reached despite the absence of a shared and global model of trust in the system. Flexible and subjective trust models have therefore been studied in more detail, and consensus protocols based on these models have emerged.


### Asymmetric distributed trust

Most protocols for consensus operate under the assumption that the _number_ of faulty processes is limited and every process in the system shares this view. This means that trust has traditionally been symmetric, in the sense that all processes adhere to the global assumption about the number of faulty processes. Properties of protocols are guaranteed for all correct processes, but not for the faulty ones. 

Blockchain networks, however, require trust to be more flexible because they do not assume global knowledge. Motivated by this desire, the [Ripple](//ripple.com) and the [Stellar](//stellar.org) blockchains introduced heuristic models for flexible trust. [Cachin and Tackmann](//drops.dagstuhl.de/opus/volltexte/2020/11793/) formulated asymmetric Byzantine quorum systems as a generalization of [Byzantine quorum systems](//dl.acm.org/doi/10.1007/s004460050050). 


![Asymmetric Byzantine quorum system](/images/asym-quorum.png){: width="70%" .center-image}

By abandoning a shared view of trust in the system, asymmetric quorums bridge the gap between the two main consensus protocol families used by blockchains and open up the possibility to implement consensus with asymmetric trust.

Asymmetric quorum systems expand on the notion of asymmetric trust introduced by [Damgård et al.](//link.springer.com/chapter/10.1007/978-3-540-76900-2_22) Every process in the system subjectively and individually declares who might fail in its own view. Depending on the choice that a correct process makes about who it trusts and who not, and considering the processes that are actually faulty during an execution, two different situations may arise. A correct process may either make a “wrong” trust assumption, for example, by trusting too many processes that turn out to be faulty or by tolerating too few faults; such a process is called _naïve_. Alternatively, when the correct process makes the “right” trust assumption, it is called _wise_. Protocols with asymmetric trust cannot guarantee the same properties for naïve processes as for wise ones.

### Signature-free asynchronous Byzantine consensus

[Mostéfaoui et al.](//dl.acm.org/doi/10.1145/2611462.2611468) presented at PODC 2014 a randomized, signature-free, and round-based asynchronous consensus algorithm for binary values, which achieves optimal resilience and takes O(n^2) constant-sized messages. Randomization occurs through a common coin as pioneered by [Rabin](//ieeexplore.ieee.org/document/4568104). This binary consensus algorithm has been taken up for constructing the [Honey Badger BFT](//dl.acm.org/doi/10.1145/2976749.2978399), for instance. 

### Asymmetric Byzantine consensus

We have recently developed the first [signature-free implementation of asymmetric asynchronous Byzantine consensus](//arxiv.org/abs/2005.08795).  Our protocol is randomized and takes up an algorithm by Mostéfaoui et al. with optimal communication complexity. This work will be published by [CBT 2021](https://deic-web.uab.cat/conferences/dpm/cbt2021/) in connection with [ESORICS 2021](//esorics2021.athene-center.de).

Our protocol implements strong Byzantine consensus in the asymmetric-trust model, according to this definition from the paper:

![Asymmetric strong Byzantine consensus](/images/asym-random-consensus.png){: width="70%" .center-image}

The validity property here only holds for wise processes. As we also show, the guarantees of consensus can only be given for wise processes. The existence of a so-called _guild_ is also necessary for a protocol execution with asymmetric trust to terminate.

Recall that asymmetric trust means each process selects its own quorum system and thereby defines the quorums that convince it of the validity of some statement. A guild is a set of _wise_ processes (who made the right choices) that contains at least one quorum for each member, that is, such that every member of the guild finds a quorum of processes *for itself* within the guild. 

A guild among four processes 
<span style="color:blue">P1</span>,
<span style="color:orange">P2</span>,
<span style="color:green">P3</span>, and
<span style="color:darkred">P4</span>
can be illustrated as follows. Each process has its own quorum system, Q1, ..., Q4, each containing two to three subjective quorums for a process as shown by the circled sets. In this execution, P4 is faulty.

![Guild](/images/asym-guild-drawing.png){: width="70%" .center-image}

Notice that the set circled with a dashed line is a guild because it is a quorum for all correct processes
(<span style="color:blue">P1</span>,
<span style="color:orange">P2</span>, and
<span style="color:green">P3</span>)
that are also in the guild.

To learn more, check out the [preprint](//arxiv.org/abs/2005.08795). The paper elaborates also on a little-known liveness issue in the original protocol of Mostéfaoui et al. We show there how this problem can be fixed in a simple way that retains the simplicity of the original approach from PODC 2014.


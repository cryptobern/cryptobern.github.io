---
layout: post
title: Revisiting signature-free asynchronous Byzantine consensus
author: Co-authored by Christian Cachin and Luca Zanolini
ghcommentid: 10
---

Among asynchronous, randomized, and signature-free implementations of consensus, the family protocols by Mostéfaoui et al. ([PODC 2014](https://dl.acm.org/doi/10.1145/2611462.2611468) and [JACM 2015](https://dl.acm.org/doi/10.1145/2785953)) represent a landmark result.

This work won the [best-paper award at PODC 2014](//dl.acm.org/doi/proceedings/10.1145/2611462) and has been taken later up in systems like [HoneyBadger BFT](https://dl.acm.org/doi/10.1145/2976749.2978399). The consensus protocols are relevant because they tolerate arbitrary message delays as well as timing uncertainties; they work in any asynchronous network; they do not use digital signatures; and they rely on a [common-coin](https://ieeexplore.ieee.org/document/4568104) primitive. 

However, the PODC 2014 version of this simple and appealing protocol suffers from a little-known liveness issue due to asynchrony. The JACM 2015 version avoids the problem, but is considerably more complex. In a [recent paper](https://arxiv.org/abs/2005.08795), we revisit the original protocol of PODC 2014 and present a fix for it, which does not affect any of its properties. Instead, our approach lets it regain the original simplicity.

### The liveness problem

[Mostéfaoui et al.'s](https://dl.acm.org/doi/10.1145/2611462.2611468) signature-free round-based asynchronous binary consensus algorithm was the first such protocol with optimal resilience that did not use digital signatures. It takes a quadratic number of constant-sized messages in expectation, which appears optimal. The protocol needs only authenticated channels among all processes and remains secure against a computationally unbounded adversary.  Moreover, the algorithm has been praised for its simplicity.

The protocol implements the notion of asynchronous strong Byzantine consensus, this means the protocol is randomized and the decision value must be proposed by a correct process:

![Strong Byzantine consensus](/images/random-consensus.png){: width="80%" .center-image} 

However, this protocol suffers from a subtle and little-known problem, which was by [Tholoniat and Gramoli in 2019](https://gramoli.redbellyblockchain.io/web/doc/pubs/frida19.pdf). Namely, an adversary can prevent progress among the correct processes by controlling the messages between them and by sending them values in a specific order. This means the algorithm may violate liveness. 

The corresponding journal publication by [Mostéfaoui et al.](https://dl.acm.org/doi/10.1145/2785953) touches only briefly on the issue. Then it goes on to present a modified, extended protocol, which fixes the problem. Unfortunately, this modifed protocol requires also many more communication steps and adds considerable complexity.

### Fixing the problem

[Our work](https://arxiv.org/abs/2005.08795) not only points out the problem in detail, but shows also how it can be prevented. We present a conceptual insight and two fixes to the original protocol for this. The crucial step concerns the common coin: In any full implementation, the coin is not abstract, but implemented by a protocol that _exchanges messages_ among the processes. In the problematic execution that we show in the paper, the network reorders messages between correct processes. Our first change, therefore, is to assume FIFO ordering on the reliable point-to-point links, i.e., if a correct process has sent a message m1 and subsequently sent m2, then every correct process does not receive m2 unless it has earlier received m1. This encompasses not only the votes in the consensus protocol, but also at least one message of the underlying coin protocol.

Our second change is to allow more dynamicity for receiving values during a consensus round. A set of so-called validated binary values received by a process (the set *B* in the Algorithm below) may still change while the process waits further for the output of the coin protocol. Once the set satisfies the generalized property and the coin value is available, the process can proceed.

![Randomized Byzantine consensus](/images/random-algo.png){: width="80%" .center-image}

In this way, a correct process may find a suitable *B* while concurrently running the coin protocol. We can show that liveness can no longer be violated with this modification.

Finally, our protocol may disseminate messages in parallel, to ensure termination. This “amplification” step is reminiscent of [Bracha’s reliable broadcast](https://www.sciencedirect.com/science/article/pii/089054018790054X) protocol. Hence, our protocol does not execute rounds forever, in contrast to the original formulation of Mostéfaoui et al.

With these small modifications, the PODC 2014 version of the optimal signature-free consensus protocol regains its appeal and lives up to its prominent reputation.

Link to the research paper: [https://arxiv.org/abs/2005.08795](https://arxiv.org/abs/2005.08795)

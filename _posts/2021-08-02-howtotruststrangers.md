---
layout: post
title: How to Trust Strangers
author: Co-authored by Orestis Alpos, Christian Cachin and Luca Zanolini
ghcommentid: 4
---

Composing Byzantine quorum systems for securing distributed protocols

Trust is the basis of any distributed, fault-tolerant, or secure system. We consider systems, such as blockchain networks, that consist of multiple nodes or processes, of which some may fail. A trust assumption specifies the failures that a system can tolerate and determines the conditions under which it operates correctly.  In systems subject to arbitrary malicious behavior, or _Byzantine faults_, the trust assumption is usually specified through sets of processes that may fail together.  In the simplest case, this is just the belief that only _F_ nodes among _N_ would fail, where _F < N/3_.  Equivalently, the blockchain networks of proof-of-stake cryptocurrencies assume that misbehavior of participating nodes owning strictly less than third of the stake is tolerated.  [Tendermint Core](https://github.com/tendermint/tendermint), [Diem Byzantine Fault Tolerance (DiemBFT)](https://developers.diem.com/main/docs/state-machine-replication-paper), [Algorand](https://www.algorand.com), [Cardano](https://cardano.org), and many others use this notion of trust.  The trust assumption can be generalized and may be [symmetric](//doi.org/10.1007/s004460050050) or [asymmetric](https://cryptobern.github.io/asymmetric/); the latter means that the beliefs of the nodes are subjective, and may differ between nodes.

What should be done when two groups of nodes, each one with their own beliefs, wish to be merged? This post explores how trust assumptions can be composed in symmetric-trust and asymmetric-trust models.

### Secure distributed systems rely on trust

Technically, trust is defined through a _fail-prone system_, which is a collection of subsets of processes, such that each of them contains all the processes that may at most fail together during a protocol execution. A _Byzantine quorum system (BQS)_ complements the fail-prone system; it indicates the subsets of processes that are self-sufficient in taking important steps during the protocol execution. In the simplest case, the quorums are the complement of the fail-prone sets. 

![Symmetric Byzantine quorum system](/images/trust_quorum_system.png){: width="80%" .center-image}

Over the recent years [new approaches](https://link.springer.com/chapter/10.1007/978-3-540-76900-2_22) to modelling trust have been explored. In open, decentralized or permissionless settings, like those of cryptocurrencies running over the Internet, no common trust model may be imposed (or one would have to reintroduce a centralized entity). Instead, every node in the system should be free to choose who to trust and who not to trust. The _asymmetric_ model of trust captures this and forms a natural and necessary extension of the symmetric model. Concretely, [Cachin and Tackmann](//doi.org/10.4230/LIPIcs.OPODIS.2019.7) extend Byzantine quorum systems to permit asymmetric trust by introducing _asymmetric Byzantine quorum systems (ABQS)_. They generalize (symmetric) BQS directly, in the sense that every process is allowed to specify its own fail-prone system and quorum system.

![Asymmetric Byzantine quorum system](/images/trust_asym_quorum_system.png){: width="80%" .center-image}

### Composing trust assumptions

In [recent work](https://arxiv.org/abs/2107.11331), which will be published at the [SRDS 2021](https://srds-conference.org) conference, we study how trust assumptions can be composed, when they are expressed through symmetric and asymmetric Byzantine quorum systems. We introduce methods for combining and assembling the trust models of different, possibly disjoint, systems to a common model. Our results provide a key step towards understanding the dynamic evolution of distributed systems and blockchain networks that rely on quorums for resilience.

### Composition of symmetric BQS

We explore the composition of two groups of processes, where each forms a BQS, as a means to allow them to run a protocol jointly, without requiring the members of one group to make assumptions about members of the other group. This is useful in practice because remodelling trust from scratch would be a tedious and subjective process, where nodes in one group would first have to obtain knowledge about the nodes in the other group. Hence, our notion of composition puts the two BQS next to each other, but does not consider increasing the resilience for the combined system. (We note that achieving higher resilience is a natural avenue for future exploration of the problem.) In our work, we present three composition methods of increasing suitability. The most comprehensive and practically relevant composition rule is the following, which we call _Cartesian composition_.

For two groups of processes _P1_ and _P2_, and for two Byzantine quorum systems _Q1_ on _P1_ with fail-prone system _F1_ and _Q2_ on _P2_ with fail-prone system _F2_, their composition is a BQS Q3, defined on processes _P3 = P1 ∪ P2_, with fail-prone system _F3_. It allows the processes from each group to jointly run a distributed protocol with the "strangers" in the other group, that is, without knowing or assuming anything about the members of the other group.  The _Cartesian composition_ rule defines _F3_ and _Q3_ as follows:

![Cartesian composition](/images/trust_cartesian_comp.png){: width="80%" .center-image}

Put simply, _F3_ is the pairwise union of all fail-prone sets in _F1_ with all fail-prone sets in _F2_. Special handling is, however, required when _P1_ and _P2_ contain processes in common; if a subset _C_ of those common processes is Byzantine in _Q1_, then, naturally, they are Byzantine in _Q2_ as well. The composition rule takes this into account and requires that we union only those pairs of fail-prone sets that contain the same subset of common processes (notice that this can be the empty set).

In the following diagram, we give an example for symmetric BQS composition.
Processes are shown by circles and form two BQS
_P1 = {a, b, c, d, e}_ and in _P2 = {d, e, f, g, h}_. Notice that processes _d_ and _e_ are common.
The fail-prone systems are _F1 = { {a}, {b,c}, {d}, {c,e} }_ and _F2 = { {d}, {e}, {f,g}, {h} }_, where each fail-prone set is depicted through a shaded, rectangular area.
We assume for simplicity canonical quorum systems, that is, the quorums are the complements of the fail-prone sets.
The composite BQS contains the union of all pairs of fail-prone sets that do not contain _d_ or _e_. It also contains the sets _{d}_, as a union of _{d}_ in _F1_ and _{d}_ in _F2_, and _{c,e_}, as a union of _{c, e}_ in _F1_ and _{e}_ in _F2_.

![Example of BQS composition](/images/trust_composition_symmetric.png){: width="37%" .center-image}

### Composition of asymmetric BQS

An asymmetric Byzantine quorum system (ABQS) is notoriously hard to define. As we explained, the processes are allowed to choose their fail-prone and quorum systems, or, somewhat informally, their friends and enemies.
However, the fail-prone and quorum systems have to satisfy certain intersection conditions; two processes must have sufficiently many common friends, so they can communicate through them, even if their enemies try to sabotage them.

Hence, a deterministic rule to compose two ABQS is required, one that guarantees that the intersection properties will always hold in the composed system, given that they hold in the original ones. Such a rule would allow two groups of "strangers" to work together, without requiring a process in one group to make new assumptions on the processes in the other.

In our work we also present such a composition rule. Given two ABQS, it allows the processes belonging to the two sets, whether these sets are disjoint or not, to form a new ABQS. To do so, we introduce the notion of the _tolerated system_ of an ABQS and the process of _purification_ of an ABQS. These notions are in themselves interesting contributions to the theory of ABQS.

#### The tolerated system of an ABQS
Recall that in asymmetric BQS, no common understanding of the world exists, either because there is not enough knowledge to assess the system, or because the participating processes simply do not agree with each other. On the contrary, every process expresses its own beliefs and expectations, and no global notion of "correct" belief exists. In every execution, however, there will be a ground truth, manifested by a set of actually faulty process, and not all members of the system will have correctly anticipated this ground truth. Again, since there is no global understanding of the world, this is expected to happen. 
However, the process might still be able to make progress (where progress is defined by the protocol they are running) if "enough" processes have correctly foreseen which others would fail or would make erroneous assumptions about those who would fail. These "enough many" processes can be formally defined: [they are called a _guild_](//cryptobern.github.io/asymconsensus/). Recent works on consensus with ABQS have conditioned safety and liveness properties on the existence of such a set. In the context of Byzantine consensus, [Cachin and Zanolini](//arxiv.org/abs/2005.08795) show that a guild is required to solve asynchronous consensus and that consensus properties are guaranteed in all executions with a guild.

The tolerated systems captures this resilience of an ABQS. It contains those subsets of processes (called the _tolerated sets_) that are not necessary for the existence of a guild. The tolerated system characterizes the executions in which some of the process in the ABQS will be able to operate correctly and make progress. In that sense, the tolerated system of an ABQS is the counterpart of the fail-prone system for a BQS. It is a central concept for composing two ABQS because it allows external parties, or clients, to interact with an ABQS.

![The tolerated system of an ABQS](/images/trust_tolerated_system.png){: width="80%" .center-image}

#### The purification procedure
Intuitively, the purification procedure removes fail-prone sets that 
are "useless", in the sense that they do not influence the existence of a guild.
Seen from a higher level, it is an expression of the fact that processes have 
their own beliefs, but also need to adapt to those of the others; a process might expect a set _F_ to fail during an execution and construct its fail-prone system so as to be protected against _F_. However, if the beliefs of other
processes are such that the failure of _F_ does not lead to a guild, i.e., _F_ is not tolerated, then the process can whatsoever not benefit from including _F_ in its fail-prone system.

#### The composition rule
Our composition rule between two ABQS then becomes the following.

![Cartesian composition](/images/trust_asym_composition.png){: width="80%" .center-image}

Let us illustrate the composition of two ABQS. To keep the example simple, we now consider two disjoint sets of processes _P1 = {a, b, c, d, e}_ and _P2 = {f, g, h, i, j}_. The fail-prone systems are shown in the following diagram. As before, processes are represented by circles and fail-prone sets are depicted by shaded, rectangular areas.
For example, the fail-prone system of process _a_ is _Fa = { {c}, {d}, {e} }_, for _c_ it is _Fc = { {a,  b}, {d}, {e} }_, and so on. (The horizontal order of processes in _P2_ is intentionally _f, g, j, h, i_ because that lets us show the fail-prone set _{g, j}_ as a contiguous area.)

![Example of ABQS composition](/images/trust_composition_asymmetric.png){: width="80%" .center-image}

Given those fail-prone systems, and assuming canonical quorum systems, any process can compute the tolerated systems.
For example, if {a, b} fail in the first system, then _c, d_, and _e_ are wise and have a quorum made of wise processes, thus they form a guild. Hence, _{a, b}_ is a tolerated set. Altogether we have that
_T1 = { {a,b}, {c}, {d}, {e} }_ and _T2 = { {f}, {g,j}, {h}, {i} }_.

The purification procedure does not remove any fail-prone sets in this example. Technically, this is because the _B3-condition_ holds between the fail-prone system of any party and the tolerated system, but we will not get into the details here.

Finally, having computed the tolerated systems, the processes can construct their new, composite fail-prone systems. Since the systems are disjoint, those will be the pairwise union of each fail-prone system with the tolerated system of the other ABQS. For example, process _a_ uses _Fa = { {c}, {d}, {e} }_ and _T2 = { {f}, {g,j}, {h}, {i} }_ and gets _Fa' = { {c,f}, {c,g,j}, {c,h}, {c,i}, {d,f}, {d,g,j}, {d,h}, {d,i}, {e,f}, {e,g,j}, {e,h}, {e,i} }_.

#### Composition in practice
In networks implementing consensus like this, the composition could be initiated by any process in _P1_, for example. This process sends a _composition-request_ message to all members of _P2_, which in turn decide whether to accept the request or not, and reply accordingly with a _composition-response_ message. Upon receiving the response, the processes in _P1_ also agree on whether to accept it and send an acknowledgement to _P2_. After this point, all processes can use the composite trust assumptions.


More details about our work and the complete description of our composition rules can be found in [the research paper](https://arxiv.org/abs/2107.11331).

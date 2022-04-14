---
layout: post
title: How to Trust Strangers
author: Co-authored by Orestis Alpos, Christian Cachin and Luca Zanolini
ghcommentid: 11
---

Composing Byzantine quorum systems for securing distributed protocols

Trust is the basis of any distributed, fault-tolerant, or secure system. We consider systems, such as blockchain networks, that consist of multiple nodes or processes, of which some may fail. A trust assumption specifies the failures that a system can tolerate and determines the conditions under which it operates correctly.  In systems subject to arbitrary malicious behavior, or _Byzantine faults_, the trust assumption is usually specified through sets of processes that may fail together.  In the simplest case, this is just the belief that only _F_ nodes among _N_ would fail, where _F < N/3_.  Equivalently, the blockchain networks of proof-of-stake cryptocurrencies assume that misbehavior of participating nodes owning strictly less than third of the stake is tolerated.  [Tendermint Core](https://github.com/tendermint/tendermint), [Diem Byzantine Fault Tolerance (DiemBFT)](https://developers.diem.com/main/docs/state-machine-replication-paper), [Algorand](https://www.algorand.com), [Cardano](https://cardano.org), and many others use this notion of trust.  The trust assumption can be generalized and may be [symmetric](//doi.org/10.1007/s004460050050) or [asymmetric](https://cryptobern.github.io/asymmetric/); the latter means that the beliefs of the nodes are subjective, and may differ between nodes.

What should be done when two groups of nodes, each one with their own beliefs, wish to be merged? This post explores how trust assumptions can be composed in symmetric and asymmetric trust models.

### Secure distributed systems rely on trust

Technically, trust is defined through a _fail-prone system_, which is a collection of subsets of processes, called _fail-prone sets_, such that each of them contains all the processes that may at most fail together during a protocol execution. In order to be well-defined, the fail-prone system needs to satisfy a condition, called the _Q3-condition_: no three fail-prone sets may cover the whole set of processes the BQS is defined on.
Finally, a _Byzantine quorum system (BQS)_ complements the fail-prone system; it indicates the subsets of processes that are self-sufficient in taking important steps during the protocol execution. In the simplest case, the quorums are the complement of the fail-prone sets.

<!-- ![Symmetric Byzantine quorum system](/images/strangers/trust_quorum_system.png){: width="80%" .center-image} -->

Over the recent years [new approaches](https://link.springer.com/chapter/10.1007/978-3-540-76900-2_22) to modelling trust have been explored. In open, decentralized or permissionless settings, like those of cryptocurrencies running over the Internet, no common trust model may be imposed (or one would have to reintroduce a centralized entity). Instead, every node in the system should be free to choose who to trust and who not to trust. The asymmetric model of trust captures this and forms a natural and necessary extension of the symmetric model.

Concretely, [Cachin and Tackmann](//doi.org/10.4230/LIPIcs.OPODIS.2019.7) extend Byzantine quorum systems by introducing the model of _asymmetric trust_. 
Each party is now allowed to specify their own fail-prone system, and the set of all these fail-prone systems is called an _asymmetric fail-prone system_.
As in the symmetric case, the notion of quorums exists here as well: each party defines a Byzantine quorum system, and the set of all these forms an _asymmetric Byzantine quorum systems (ABQS)_. Finally, a similar condition as in the symmetric case exists here as well. We will not go into much detail here, but it is called the _B3-condition_ and demands that, for any pair of parties, a certain combination of three of their fail-prone sets do not cover the set of all processes. Equivalently, you can think of this as follows: two processes must have sufficiently many common friends, so they can communicate through them, even if their enemies try to sabotage them.

<!-- ![Asymmetric Byzantine quorum system](/images/strangers/trust_asym_quorum_system.png){: width="80%" .center-image} -->

### Composing trust assumptions

In [recent work](https://arxiv.org/abs/2107.11331), which will be published at the [SRDS 2021](https://srds-conference.org) conference, we study how trust assumptions can be composed, when they are expressed through symmetric and asymmetric Byzantine quorum systems. We introduce methods for combining and assembling the trust models of different, possibly disjoint, systems to a common model. Our results provide a key step towards understanding the dynamic evolution of distributed systems and blockchain networks that rely on quorums for resilience.

### Composition of symmetric BQS

We first explore the composition of two groups of processes, where each forms a BQS, as a means to allow them to run a protocol jointly, without requiring the members of one group to make assumptions about members of the other group. This is useful in practice because remodeling trust from scratch would be a tedious and subjective process, where nodes in one group would first have to obtain knowledge about the nodes in the other group.
We note here that this notion of composition does not consider increasing the resilience for the combined system (which is, of course, a natural avenue for future exploration of the problem); we instead want to put the two BQS next to each other and find a deterministic composition rule that always leads to a new BQS.

Let us start with an example. In the following diagram we show two symmetric BQS. The processes (shown in circles) in the first one are
_P1 = {a, b, c, d, e}_ and in the second _P2 = {d, e, f, g, h}_. Notice that processes _d_ and _e_ are common. 
The fail-prone systems are _F1 = { {a}, {b,c}, {c,e}, {d} }_ and _F2 = { {d}, {e}, {f,g}, {h} }_, respectively.

![Two BQS with common processes](/images/strangers/sym-original-systems.png){: width="80%" .center-image}

We want to come up with a new, composite BQS, defined on _P3 = {a, b, c, d, e, f, g, h}_, where processes in some sense retain their trust assumptions, that is,
they are not required to make new assumptions on the set _P3_. So, how do we do that?

#### A first approach: Union composition
A first thought would be to define the new, composite fail-prone system as the union of the two original ones. This would give _F3 = { {a}, {b,c}, {c,e}, {d}, {f,g}, {h} }_, also shown in the following figure. Observe that in a fail-prone system we do not keep sets that are subsets of other fail-prone sets, so _{e}_, for example, does not appear in _F3_.

![Symmetric composition, union rule](/images/strangers/sym-unionrule.png){: width="37%" .center-image}

It is true that this rule works, in the sense that it always leads to a BQS (technically, this should be read as "the _Q3_-condition always holds in the composite system, given that it holds in the original ones"), and processes in one system do not have to come up with new assumptions on the processes on the other. However, the fail-prone sets (and, thus, the tolerated failures in any execution) are rather limited; namely, no combined failure of processes in _P1_ and _P2_ is tolerated. Can we do better?

#### A second approach: Cartesian composition
It turns out that we can overcome this limitation. Let us now construct the composite fail-prone system by taking the pairwise union of all fail-prone sets in the first and all fail-prone sets in the second system. Graphically, this could be shown as in the following graph, where the black lines represent set union.

![Symmetric composition, cartesian rule](/images/strangers/sym-cartesian-rule.png){: width="80%" .center-image}

Although this rule explores the right direction, there does exist a problem. Observe that _F3_, the composite fail-prone system, contains, among others,
the sets _{a, f, g}_, _{b, c, h}_, and _{c, e, d}_, also shown in the following figure.

![Symmetric composition, the problem with cartesian rule](/images/strangers/sym-cartesian-problem.png){: width="60%" .center-image}

The problem with these three fail-prone sets is that their union covers _P3_. Hence, the _Q3_-condition does not hold and we do not have a BQS! But we started from two fail-prone systems that satisfied the _Q3_-condition, so, why did this happen? The problem is with the last of these sets, _{c, e, d}_. This set appears in _F3_, but not in the original systems: its projection in _P1_, which is _{c, e, d}_, is not in _F1_; and its projection in _P2_, which is _{e, d}_, is not in _F2_. In other words, the _Q3_-condition in the original systems holds because this set is not there. We have created a new fail-prone set that was not considered in the original systems. As a side note, this rule does indeed work (i.e., leads to a system where the _Q3_-condition holds) if the original systems do not contain common processes.

#### The final composition rule: Cartesian composition with common processes
So, let us present the composition rule that we discovered and solves the aforementioned problem. We again apply the pairwise union rule, but this time special care is taken when the two sets to be "unioned" contain common processes. Specifically, we union only fail-prone sets that contain exactly the same subset of the processes in common between _P1_ and _P2_. In the following figure, this special case is marked by a dashed line. 

![Symmetric composition, the correct cartesian rule](/images/strangers/sym-cartesian2-rule.png){: width="80%" .center-image}

This results in a fail-prone system _F3_ as shown in the next figure.

![Symmetric composition, the result of the correct cartesian rule](/images/strangers/sym-cartesian2-result.png){: width="60%" .center-image}

The intuition is that, if some processes in _P1_, in our case _c_ and _e_, are Byzantine, then they are Byzantine in _P2_ as well. They are the same processes after all. Thus, we can join the set _{c, e}_ only with fail-prone sets in _P2_ that already expect _e_ to fail (in our case there happens to be only one, the fail-prone set _{e}_).


### Composition of asymmetric BQS

An asymmetric Byzantine quorum system (ABQS) is notoriously hard to define. As we explained, the processes are allowed to choose their fail-prone and quorum systems, or, somewhat informally, their friends and enemies.
However, the fail-prone and quorum systems have to satisfy certain intersection conditions; as we have seen, two processes must have sufficiently many common friends, so they can communicate through them, even if their enemies try to sabotage them.

Hence, a deterministic rule to compose two ABQS is required, one that guarantees that the intersection properties will always hold in the composed system, given that they hold in the original ones. Such a rule would allow two groups of "strangers" to work together, without requiring a process in one group to make new assumptions on the processes in the other.

Let's proceed again through an example. To keep the example simple, we now consider two disjoint sets of processes _P1 = {a, b, c, d, e}_ and _P2 = {f, g, h, i, j}_. The fail-prone systems are shown in the following diagram. As before, processes are represented by circles and fail-prone sets are depicted by shaded, rectangular areas.
For example, the fail-prone system of process _a_ is _Fa = { {c}, {d}, {e} }_, for _c_ it is _Fc = { {a,  b}, {d}, {e} }_, and so on. (The horizontal order of processes in _P2_ is intentionally _f, g, j, h, i_ because that lets us show the fail-prone set _{g, j}_ as a contiguous area.)

![Example of ABQS composition](/images/strangers/composition-asymmetric.png ){: width="100%" .center-image}

Ideally, we would like to use our result from the symmetric case, the cartesian composition rule that considers also common processes. To do so, we would have to let each process in one system do the pairwise union between its fail-prone sets and the fail-prone sets of the other system. That would indeed work, but... what are the "fail-prone sets of the other system"? In the asymmetric model, each process has its own fail-prone sets, and no common notion of trust exists. If only we could come up with a notion that "summarizes" the trust assumptions of an ABQS into a single BQS...

#### The tolerated system of an ABQS
Recall that in asymmetric BQS, no common understanding of the world exists, either because there is not enough knowledge to assess the system, or because the participating processes simply do not agree with each other. On the contrary, every process expresses its own beliefs and expectations, and no global notion of "correct" belief exists. In every execution, however, there will be a ground truth, manifested by a set of actually faulty process, and not all members of the system will have correctly anticipated this ground truth. Again, since there is no global understanding of the world, this is expected to happen. 
However, the process might still be able to make progress (where progress is defined by the protocol they are running) if "enough" processes have correctly foreseen which others would fail or would make erroneous assumptions about those who would fail. These "enough many" processes can be formally defined: [they are called a _guild_](//cryptobern.github.io/asymconsensus/). Recent works on consensus with ABQS have conditioned safety and liveness properties on the existence of such a guild. In the context of Byzantine consensus, [Cachin and Zanolini](//arxiv.org/abs/2005.08795) show that a guild is required to solve asynchronous consensus and that consensus properties are guaranteed in all executions with a guild.

The tolerated system captures this resilience of an ABQS. It contains those subsets of processes (called the _tolerated sets_) that are not necessary for the existence of a guild. The tolerated system characterizes the executions in which some of the processes in the ABQS will be able to operate correctly and make progress. In that sense, the tolerated system of an ABQS is the counterpart of the fail-prone system for a BQS. We show on our paper that the tolerated system an ABQS will always be a BQS (i.e., it will always satisfy the _Q3_-condition).
It is a central concept for composing two ABQS because it allows external parties, or clients, to interact with an ABQS.
Formally, the tolerated system is defined as follows.

![The tolerated system of an ABQS](/images/strangers/trust_tolerated_system.png){: width="80%" .center-image}

Let's try to calculate the tolerated system for the first asymmetric system in our example. In the simplest way, we have to check for every subset of _P1_ whether it is a tolerated set. We can start with the set _{a}_, and observe that, if it fails, processes _c_, _d_, and _e_ are wise and they form a guild (actually, one has to formally define a guild to prove that _{c, d, e}_ form one, but we will not be that detailed here). The same applies if _{b}_ fails, in which case the guild is again _{c, d, e}_. Actually, we can even tolerate the failure of _{a, b}_ (both processes fail in the same execution), again with _{c, d, e}_ as a guild. Moreover, if any one of _{c}, {d}, {e}_ fails, we can also show that the rest of the processes form a guild. Thus, the tolerated set is _T1 = { {a,b}, {c}, {d}, {e} }_. In the same way we can calculate the tolerated set of the second ABQS, which is _T2 = { {f}, {g,j}, {h}, {i} }_.

We can, thus, as external parties, interact with the two ABQS using their tolerated sets.

![The tolerated systems in our example](/images/strangers/asym-tolerated.png){: width="100%" .center-image}

#### Applying the cartesian rule
We are now ready to perform the composition of our two ABQS. The idea is that every process in _P1_ uses the cartesian composition (with the special handling for common processes) between its fail-prone system and _T2_, and vice versa for processes in _P2_. In the next picture we show, for example, how process _c_ would do the composition.

![The asymmetric composition rule in our example](/images/strangers/asym-rule.png){: width="100%" .center-image}

Technically, the rule is defined as follows.

![The composition rule for ABQS](/images/strangers/trust_asym_composition.png){: width="80%" .center-image}

#### The purification procedure
Finally, there is a subtle point we need to address. We have seen that the tolerated system of an ABQS will always satisfy the _Q3_-condition, and, by definition, the two ABQS will satisfy the _B3_-condition. However, it can be the case when _P1_ and _P2_ have common processes that the cartesian composition of an ABQS and a tolerated system does not satisfy the _B3_-condition. The good news, however, is that in such a case the "problematic" set, that is, the set that breaks the _B3_-condition, will not be a tolerated set (as a proof sketch, if it was a tolerated set then it would be in the tolerated system, and the tolerated system would not satisfy the _Q3_-condition). So, we can remove this "problematic" fail-prone set from the fail-prone system without sacrificing resilience, as it does not lead to a guild whatsoever.

This is formally captured by the _purification procedure_. Intuitively, it removes fail-prone sets that 
are "useless", in the sense that they do not lead to the existence of a guild.
Seen from a higher level, it is an expression of the fact that processes have 
their own beliefs, but also need to adapt to those of the others; a process might expect a set _F_ to fail during an execution and construct its fail-prone system so as to be protected against _F_. However, if the beliefs of other
processes are such that the failure of _F_ does not lead to a guild, i.e., _F_ is not tolerated, then the process can whatsoever not benefit from including _F_ in its fail-prone system.

#### Composition in practice
In networks implementing consensus like this, the composition could be initiated by any process in _P1_, for example. This process sends a _composition-request_ message to all members of _P2_, which in turn decide whether to accept the request or not, and reply accordingly with a _composition-response_ message. Upon receiving the response, the processes in _P1_ also agree on whether to accept it and send an acknowledgement to _P2_. After this point, all processes can use the composite trust assumptions.


More details about our work and the complete description of our composition rules can be found in [the research paper](https://arxiv.org/abs/2107.11331).

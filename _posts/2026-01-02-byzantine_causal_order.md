---
layout: post
title: Byzantine Reliable Broadcast with Causal Ordering
ghcommentid: 20
author: Mariarosaria Barbaraci and Christian Cachin
---

<!-- Definition or problem statement-->
For decades the problem of defining reliable broadcast with causal ordering in the presence Byzantine faults has been considered too complex. After exploring the literature for existing approaches, we have identified limitations in prior work. This leads us to finally propose the *first complete* definition of causality in the *Byzantine setting* that mirrors the existing one for crash-faults.

> **Definition — Causal-order relation with crash faults**
>
> Given two messages $$m_1$$ and $$m_2$$, we say that $$m_1$$ *causally precedes* $$m_2$$, and write $$m_1 \prec m_2$$, if either of the following conditions hold:
>
> - A process broadcasts $$m_1$$ and then broadcasts $$m_2$$.
> - A process delivers $$m_1$$ and then broadcasts $$m_2$$.
> - There is a message $$m'$$ such that $$m_1 \prec m'$$ and $$m' \prec m_2$$.
>
> If $$m_1 \not\prec m_2$$ and $$m_2 \not\prec m_1$$, we say that the two messages are *concurrent*.

## Causality in the Byzantine setting

### Current approaches

In the literature, causal ordering comes in two flavors.
The first considers *causal ordering* an additional property of *atomic broadcast* as formally defined in [*secure causal atomic broadcast*](//doi.org/10.1007/3-540-44647-8_31). Such a primitive enforces *input causality*, as introduced earlier by [Reiter and Birman](//doi.org/10.1145/177492.177745), according to which an adversary must not be able to induce delivery of a payload message $$m'$$ after observing a payload message $$m$$ that has not yet been delivered. Crucially, this approach relies on *hiding* the payload message until an order is fixed; only then is the message delivered.

The second flavor remains in the realm reliable delivery without total order and restricts the causal-order relation to just correct processes. Auvolat, Frey, Raynal, and Taïani have defined [*Byzantine causal broadcast*](//doi.org/10.1016/J.TCS.2021.06.021) in this way, which is an ordinary Byzantine reliable broadcast that additionally satisfies *causal delivery*.

Achieving causal ordering modularly on top of total ordering is a [conceptually clean and prominent method](//doi.org/10.1109/DSN.2017.64). However, it is well known that causal ordering and total ordering are orthogonal problems. Ideally, we would like to achieve causal ordering for Byzantine broadcast *without* total order.

On the other hand, when we restrict the causal-order relation to correct processes, we completely miss capturing the effect of potentially malicious behavior on the output order.

[[ TODO CC: perhaps transpose this paragraph --Yes ]]

### Front-running attack

In the crash-fault model, causal broadcast relies on every process reporting its *causal past*, i.e., the set of messages that causally precede the message being broadcast. In the Byzantine setting, however, a faulty process can **lie**, or **arbitrarily choose** its causal past.

Let's assume a network of 4 processes: $$p_1$$, $$p_2$$, $$p_3$$ and $$p_4$$, where $$p_4$$ is controlled by an adversary. Let's also assume $$p_1$$ broadcasts a message $$m$$. As soon as $$p_4$$ receives the first message from $$p_1$$ relative to $$m$$ (*low-level message of the broadcast*), it has the opportunity to frontrun $$m$$. Thus, $$p_4$$ injects a second message $$m'$$ into the network and makes some processes deliver $$m'$$ before $$m$$ by delaying messages relative to the broadcast of $$m$$.
As a result, the adversary effectively hides the causal relation between $$m$$ and $$m'$$ that would exist under a **global view of the execution**.
The attack is subtle because it makes $$m$$ and $$m'$$ appear **concurrent** from the perspective of correct processes: it does not explicitly contradict the dependency information received and reported by Byzantine participants, which in this case can be the empty set or arbitrarily chosen. 
![front running attack](/images/attack.png)

Existing protocols aiming at preserving causal ordering **fail** to detect this violation.

### Limitations

There exists two problems. The first is that dependencies are *self-reported* based on local observations, the second is the lack of a mechanism to capture causality violations from the prospective of a *global observer*. Notably, if the *low-level messages* of the broadcast give an advantage to the adversary, they should also be exposed in the broadcast abstraction itself to a global observer monitoring correct processes. Moreover, the moment in which the adversary can access the payload $$m$$, even through a low-level message, should be postponed until after a *causal order*, by definition a partial order, has been defined.

## Causal-order under Byzantine faults

### Broadcast and global events

In this work, we start from the abstraction of a broadcast channel, where we leverage the presence of a label $$\ell$$ associated with message $$m$$. The label allows us to define (1) when $$\ell$$ is first observed and (2) when the message $$m$$ associated with $$\ell$$ can safely be disclosed.
Crucially, because a correct process cannot *trust* the legitimacy of a label $$\ell$$ the first time it observes it, it needs to know when a particular message referenced by the associated label $$\ell$$ is being considered for delivery by **sufficiently many processes**.

To this end we enhance the traditional broadcast abstraction with the following *intermidiate* events exposing the actions of a correct process in a protocol execution to a global observer.

- *ch-acknowledge($$\ell$$)*: a process $$p_j \in \mathcal{P}$$ acknowledges a label $$\ell$$.
- *ch-schedule($$\ell$$)*: a correct process $$p_j \in \mathcal{P}$$ schedules a label $$\ell$$.

We say a correct process $$p_j$$ *ch-acknowledges* the presence of a label $$\ell$$ when it first observes $$\ell$$, and we say it *ch-schedules* a label $$\ell$$ when enough processes agree on the existence of such $$\ell$$, and, consequently, on the existence of the associated message $$m$$. 

Notably, we want to be able to properly define what happens in the system, even as a consequence of adversarial actions, through the perspective of **just** correct processes. For instance, when a correct process *ch-acknowledges* a label $$\ell$$, it can either be that a correct process has *ch-broadcast* a message $$m$$ associated with $$\ell$$ or that a Byzantine process has injected a message $$m$$ associated with $$\ell$$ in the network. In both cases, the *ch-acknowledge* event signals that a message associated with $$\ell$$ might exist, and therefore it can be used as an anchor for defining potential causality.

Starting from the intermediate events at single processes, we define global events.

> **Definition — Commit Event**
>
> A *commit event* for a label $$\ell$$, denoted $$\mathcal{C}(\ell)$$, is the first point in time when a correct process *ch-acknowledges* a label $$\ell$$.

A commit event signals globally that a message associated with $$\ell$$ might exist. It serves as an anchor for defining possible causal relations.

> **Definition — Quorum Schedule Event**
>
> A *quorum schedule event* for a label $$\ell$$, denoted $$\mathcal{QS}(\ell)$$, is the first point in time when more than $$\frac{n-f}{2}$$ correct processes have *ch-scheduled* a label $$\ell$$.

The quorum schedule event signals when **enough** correct processes consider a label $$\ell$$ ready for delivery. Intuitively, we would like a protocol to postpone the release of the content of a message $$m$$ until after this moment.

For the same label $$\ell$$, it trivially holds that $$ \mathcal{C}(\ell) $$ precedes $$\mathcal{QS}(\ell)$$.

Finally, for two different labels from different senders, we extract a global relation connecting the global events as follows:

> **Definition — Schedule Order**
>
> Given two labels $$\ell_i$$ and $$\ell_j$$, such that $$\ell_i \in \mathcal{L}_i$$ and $$\ell_j \in \mathcal{L}_j$$, where $$\mathcal{L}_i \ne \mathcal{L}_j$$, we define a *schedule order* relation, denoted $$\ell_i\stackrel{SO}{\to}\ell_j$$, whenever $$\mathcal{QS}(\ell_i)$$ precedes $$ \mathcal{C}(\ell_j)$$.

### Causality under Byzantine faults

We are finally ready to define a new notion of causality in the Byzantine setting that follows the structure of the traditional definition, restricts to correct processes, but it is additionally anchored to the newly introduced global events.  Notably, the relation is defined on the set of messages delivered by correct processes.

In the crash-fault model, we consider the **local** causal influence relation between the *ch-deliver* of a message $$m$$ and a *ch-broadcast* of a message $$m'$$. In the Byzantine setting, we consider the **global** causal influence relation that substitutes the *ch-deliver* with an event happening before delivery (*ch-schedule*), and the *ch-broadcast* with an event happening after the broadcast in the view of correct processes (*ch-broadcast*). This is exactly what the schedule order captures, as it relates the quorum schedule event of a label $$\ell$$ with the commit event of another label $$\ell'$$. 
 
> **Definition — Causal-order relation for Byzantine faults**
>
> Consider two labels $$\ell_1$$ and $$\ell_2$$, associated with messages $$m_1$$ and $$m_2$$, respectively, delivered by any correct process. We say $$(\ell_1, m_1)$$ **causally precedes** $$(\ell_2, m_2)$$ **in the Byzantine setting** and write $$(\ell_1, m_1) \prec_B (\ell_2, m_2)$$ whenever any of the following conditions hold:
> 1. A correct process $$p_i$$ delivers $$(\ell_1, m_1)$$ before $$(\ell_2, m_2)$$ for the same sender $$p_s$$, such that $$\ell_1, \ell_2 \in \mathcal{L}_s$$; if the sender $$p_s$$ is correct, it has broadcast $$m_1$$ before $$m_2$$.
> 2. The two labels $$\ell_1$$ and $$\ell_2$$ satisfy the schedule order, i.e., $$\ell_1\stackrel{SO}{\to}\ell_2$$; or
> 3. There exists a label $$\ell'$$ associated with message $$m'$$ such that $$(\ell_1, m_1) \prec_B (\ell', m')$$ and $$(\ell', m') \prec_B (\ell_2, m_2)$$.
>
>If $$(\ell_1, m_1) \not\prec_B (\ell_2, m_2)$$ and $$(\ell_2, m_2) \not\prec_B (\ell_1, m_1)$$, we say that the two messages are *concurrent*.

With all necessary ingredients now in place, 
we introduce a new primitive, **Byzantine Reliable Broadcast with Causal Ordering (BRB-CO)**, which provides a secure building block in the Byzantine setting. BRB-CO extends the properties of a Byzantine reliable broadcast channel with three more properties: *completeness*, *hiding*, and *Byzantine causal delivery*.

> - *Completeness*: If some correct process schedules a label $$\ell$$, then it will eventually deliver the message $$m$$ associated to $$\ell$$.
> - *Hiding*: For any label $$\ell$$ associated with a message~$$m$$ broadcast by a correct process $$p_s$$, no process other than $$p_s$$ can determine any information about~$$m$$ before the quorum schedule event $$\mathcal{QS}(\ell)$$ occurs.
> - *Byzantine Causal Delivery*: For any label $$\ell_1$$ associated with message $$m_1$$ that causally precedes $$\ell_2$$ associated with $$m_2$$, i.e., $$(\ell_1, m_1) \prec_B (\ell_2, m_2)$$, no correct process delivers $$m_2$$ with label $$\ell_2$$ unless it has already delivered $$m_1$$ with label $$\ell_1$$.

The *completeness* property ties the scheduling of a label to eventual delivery, effectively decoupling agreement on the label from retrieval of the associated message.
The *hiding* property requires any implementation to reveal the payload message after the quorum schedule event, that is, only once enough processes have reliably observed that label.
Together, the two properties, support and guarantee *Byzantine causal delivery*.

## A protocol for BRB-CO

A protocol for a secure and robust BRB-CO needs essentially three components.

- Byzantine reliable broadcast ensuring *same* delivery guarantees at all correct processes;
- A data structure capturing causal dependencies, e.g., vector clocks;
- A secure component providing *hiding*.

We discuss the importance of BRB and vector clocks in the description of the protocol, but we briefly further expand on how to achieve *hiding*. We introduce a secure component as a distributed ideal functionality that we call *verifiable encapsulation*.

### Verifiable encapsulation (VE)

A *verifiable encapsulation (VE)* functionality allows a process to *encapsulate*, or hide, the payload of a message $$m$$ with identifier $$id$$ within a set of $$n$$ processes in such a way that they can later jointly extract the payload. Let us refer with $$k$$ to the minimum number needed for the extraction. VE provides at least three properties.

- *Identifier uniqueness*: there exists at most one message $$m$$ corresponding to $$id$$.
- *Privacy*: Less than $$k$$ processes learn no information about the payload $$m$$.
- *Reconstruction*: $$k$$ processes suffice to extract a payload $$m$$.

Notably, these requirements match properties one can obtain from *threshold cryptography*. Through VE, we abstract the necessary properties to allow implementations where one can modularly choose the best suitable primitive.
In the paper, we show how to instantiate VE with *threshold cipher*, *verifiable secret sharing*, and *publicly verifiable secret sharing* and discuss the trade-offs.

### Protocol

A protocol implementing BRB-CO works as follows.

In one protocol instance, the sender first hides the payload message cryptographically using a **verifiable encapsulation (VE)** primitive, and the algorithm then proceeds in five rounds: send, echo, ready, schedule, and reconstruction. At the outset of the protocol, processes do not observe the message and agree on a label that VE has associated with the message. A second key mechanism is the use of vector clocks. Each process maintains in a local *scheduled vector* a list of how many labels per process it has already scheduled. This vector is shared with other processes every time an echo message is being sent. Then, through a *causal barrier* condition on echo/ready validation, a process accepts an echo/ready message only when the attached vector clock, tracking causal dependencies, is consistent with its local scheduled vector. In particular for ready messages, each correct process computes the component-wise maximum of vectors collected from other processes and includes the result in the ready message. We show following a quorum intersection argument that **no correct process** misses reporting a dependency in such a vector.  Consequently, the protocol ensures that labels are scheduled in a causality-respecting order. 

Once a label is scheduled, it is placed in an ordered queue; after enough processes have scheduled some label, the processes start the reconstruction round, recover the payload, and deliver it in that scheduling order.

### Discussion

The correctness of BRB-CO design depends on all its components.  A secure VE instantiation is fundamental to hide the payload of a message among the set of processes and ensure reconstruction later in the protocol even without the participation of the original sender. The *new* causal-order relation allows us to clearly capture the view of correct processes even in the presence of maliciously injected messages that reach the *schedule* phase, thus later delivered.
Vector clocks shared during the echo round and incremented during the schedule round at each process, provide a **consistent distributed data structure**, with reliable increments, tracking possible causal dependencies. The component-wise maximum calculation on a quorum of vector clocks ensures *real* causal dependencies always appear in the local view of a correct process before scheduling a label.
The causal barrier conditions prevent malicious senders from reporting *false* dependencies in such data structures and provide a wrong snapshot of the system global state. Finally, putting all together, the four all-to-all communication rounds bring the protocol to satisfy causal delivery.

## Conclusion

Causal ordering under Byzantine faults can be enforced directly at the broadcast layer, without resorting to total order. This opens the door to broadcast-based services that need *concurrency* while remaining secure against strong adversaries and dependency-manipulation attacks.

Now we ask: *"Can we exploit BRB-CO as a modular communication substrate for scalable, concurrent Byzantine systems?"*.

A complete version of the research paper is available at https://arxiv.org/abs/2609.17074.

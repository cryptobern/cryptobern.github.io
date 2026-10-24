---
layout: post
title: Byzantine Reliable Broadcast with Causal Ordering
ghcommentid: 20
author: Mariarosaria Barbaraci
---

<!-- Definition or problem statement-->
For many decades the problem of defining causal-order broadcast under Byzantine faults has been considered overly complex and was left open. In this post we first review past approaches suggested in the literature, then identify their limitations, and finally propose the first *complete* definition of causality in the *Byzantine setting*. Importantly, it mirrors the well-known definition of causal ordering for broadcast in systems subject to crash faults.

## Reliable broadcast with causal order

The reliable broadcast problem addresses a distributed system consisting of fail-prone processes that communicate with each other and disseminate messages with guarantees on consistency of messages and on the order in which messages are *delivered*, i.e., output to them. Causal-order broadcast ensures that messages are delivered reliably to all correct processes, in the sense that either all such processes obtain a message or none of them does, while respecting the causal relationships between the messages. 

> **Definition — Causal-order relation with crash faults**
>
> Given two messages $$m_1$$ and $$m_2$$, we say that $$m_1$$ *causally precedes* $$m_2$$, and write $$m_1 \prec m_2$$, if either of the following conditions hold:
>
> - A process broadcasts $$m_1$$ and then broadcasts $$m_2$$.
> - A process delivers $$m_1$$ and then broadcasts $$m_2$$.
> - There exists some message $$m'$$ such that $$m_1 \prec m'$$ and $$m' \prec m_2$$.
>
> If $$m_1 \not\prec m_2$$ and $$m_2 \not\prec m_1$$, we say that the two messages are *concurrent*.

Reliable broadcast with causal order is important and has a long history in distributed systems; it was [first introduced in classic work](//doi.org/10.1145/7351.7478) during the 1980s.


## Causality in the Byzantine setting

### Current approaches

In the literature on this problem, causal ordering comes in two flavors.
The first considers *causal ordering* as an additional property of *atomic broadcast* and was formally defined as [*secure causal atomic broadcast*](//doi.org/10.1007/3-540-44647-8_31) through a cryptographic security model. Such a primitive enforces *input causality*, earlier introduced by [Reiter and Birman](//doi.org/10.1145/177492.177745), according to which no faulty process can induce the delivery of a payload message $$m'$$ after observing a payload message $$m$$ that has not yet been delivered. An adversary controlling faulty processes might be able to exploit information gained through observing $$m$$ like this. Crucially, this approach relies on *hiding* the payload message until an order is fixed and only then delivering the payload.

This is a conceptually clean approach because it achieves causal ordering modularly on top of total ordering. However, it is well known that causal ordering and total ordering are orthogonal properties. Ideally, we would like to achieve causal ordering for Byzantine broadcast *without* total order.

The second flavor of causal broadcast addresses this simpler notion, *reliable broadcast*, where processes may deliver the payload messages in different orders. However, the existing definitions restrict the causal-order relation to just correct processes and use it to define a [*Byzantine causal broadcast*](//doi.org/10.1016/J.TCS.2021.06.021). This results in a Byzantine reliable broadcast primitive that additionally satisfies *causal delivery* only for payload messages that are broadcast by correct processes. 
Restricting the causal-order relation like this, by considering the actions of correct processes alone, will completely miss to capture the effect of potentially malicious behavior on the output order.

### Front-running attack

To implement the above definition of causal broadcast in the crash-fault model, protocols rely on every process reporting its *causal past*, i.e., the set of messages that causally precede the message that is being broadcast. 

In the Byzantine setting, however, a faulty process can **lie** or **arbitrarily choose** its causal past.
Let's assume a network of four processes: $$p_1$$, $$p_2$$, $$p_3$$, and $$p_4$$, where $$p_4$$ is controlled by an adversary. Let's also assume $$p_1$$ broadcasts a message $$m$$. As soon as $$p_4$$ receives the first message from $$p_1$$ relative to $$m$$ through *low-level messages* of the protocol, it has the opportunity to frontrun $$m$$. Thus, $$p_4$$ injects a second message $$m'$$ into the network and makes some processes deliver $$m'$$ before $$m$$ by delaying messages relative to the broadcast of $$m$$.
As a result, the adversary effectively hides the causal relation between $$m$$ and $$m'$$ that would exist under a **global view of the execution**.
The attack is subtle because it makes $$m$$ and $$m'$$ appear **concurrent** from the perspective of correct processes: it does not explicitly contradict the dependency information received and reported by Byzantine participants, which may be left empty or chosen arbitrarily. 

![front running attack](/images/causal_order_attack.png)

The first flavor of causal broadcast mentioned above additionally imposes a costly total order on the delivery of $$m$$ and $$m'$$, which is not always desired. 
Existing protocols that aim at preserving causal ordering according to the second flavor **fail** to detect this violation.

### Limitations

The failure of the second approach can be traced to two problems. The first is that dependencies are *self-reported* based on local observations, the second is the lack of any mechanism to capture causality violations from the perspective of a *global observer*. Notably, if the low-level messages used by the broadcast protocol give an advantage to the adversary, they should also be exposed in the broadcast abstraction itself to a global observer monitoring correct processes. Moreover, the very moment in which the adversary can access the payload $$m$$, even through a low-level message, should be postponed until after a *causal order*, by definition a partial order, has been defined.

## Causal-order under Byzantine faults

### Broadcast and global events

In this work, we start from the abstraction of a reliable broadcast channel in the Byzantine model. Its [technical definition](//doi.org/10.1007/978-3-642-15260-3) ensures that every payload message broadcast by a correct process is eventually delivered to all processes and, importantly, that either all correct processes deliver some message (from a Byzantine sender) or none of them does. Moreover, this definition associates a unique label $$\ell$$ with every payload message $$m$$, which we leverage here. The label allows us to define (1) when $$\ell$$ is first observed without giving away the payload $$m$$ and (2) when the message $$m$$ associated with $$\ell$$ can safely be disclosed.

Crucially, because a correct process cannot *trust* the legitimacy of a label $$\ell$$ the first time it observes it, it needs to know when a particular message referenced by the associated label $$\ell$$ is being considered for delivery by **sufficiently many processes**. To this end we enhance the traditional broadcast abstraction with the following *auxiliary* events that expose the actions of a correct process in a protocol execution to a global observer:

- *ch-acknowledge($$\ell$$)*: a process $$p_j \in \mathcal{P}$$ acknowledges a label $$\ell$$.
- *ch-schedule($$\ell$$)*: a correct process $$p_j \in \mathcal{P}$$ schedules a label $$\ell$$.

We will require that a correct process $$p_j$$ *ch-acknowledges* the presence of a label $$\ell$$ when it first observes $$\ell$$, and we will assume that $$p_j$$ *ch-schedules* a label $$\ell$$ once it is certain that enough processes agree on the existence of $$\ell$$, and, consequently, on the existence of the associated message $$m$$. 

Notably, we want to be able to properly define what happens in the system, even as a consequence of adversarial actions, from the perspective of **correct processes alone**. For instance, when a correct process *ch-acknowledges* a label $$\ell$$, it can either be that a correct process has *ch-broadcast* a message $$m$$ associated with $$\ell$$ or that a Byzantine process has injected a message $$m$$ associated with $$\ell$$ in the network. In both cases, the *ch-acknowledge* event signals that a message associated with $$\ell$$ might exist, and therefore this event can be used as an anchor for defining potential causality.

Starting from these local events at correct processes, we now define global events.

> **Definition — Commit Event**
>
> A *commit event* for a label $$\ell$$, denoted $$\mathcal{C}(\ell)$$, is the first point in time when a correct process *ch-acknowledges* a label $$\ell$$.

A commit event signals globally that a message associated with $$\ell$$ might exist. It serves as an anchor for defining the potential-causality relations.

> **Definition — Quorum Schedule Event**
>
> A *quorum schedule event* for a label $$\ell$$, denoted $$\mathcal{QS}(\ell)$$, is the first point in time when more than $$\frac{n-f}{2}$$ correct processes have *ch-scheduled* a label $$\ell$$.

The quorum schedule event signals that **enough** correct processes consider a label $$\ell$$ ready for delivery. Intuitively, we need a protocol to postpone the clear-text release of the message payload $$m$$ until after this moment.

For the same label $$\ell$$, it trivially holds that $$ \mathcal{C}(\ell) $$ precedes $$\mathcal{QS}(\ell)$$.

Finally, for two different senders $$p_i$$ and $$p_j$$, we let $$\mathcal{L}_i$$ denote the labels used by $$p_i$$ and  $$\mathcal{L}_j$$ denote the labels used by $$p_j$$. Then we extract a global relation connecting the labels from different processes and the respective global events as follows:

> **Definition — Schedule Order**
>
> Given two labels $$\ell_i$$ and $$\ell_j$$, such that $$\ell_i \in \mathcal{L}_i$$ and $$\ell_j \in \mathcal{L}_j$$, where $$i \ne j$$, we define a *schedule order* relation, denoted $$\ell_i\stackrel{SO}{\to}\ell_j$$, whenever $$\mathcal{QS}(\ell_i)$$ precedes $$ \mathcal{C}(\ell_j)$$.

### Causality under Byzantine faults

We are finally ready to define the new notion of Byzantine broadcast with causal ordering that follows the structure of the traditional definition. It rests solely on actions of correct processes, but is additionally anchored to the newly introduced global events. Notably, the relation is defined on the set of messages delivered by correct processes.

In the crash-fault model, we consider the **local** causal influence relation between the *ch-deliver* of a message $$m$$ and a *ch-broadcast* of a message $$m'$$. In the Byzantine setting, we consider the **global** causal influence relation that substitutes the *ch-deliver* transition with an event that occurs before delivery, namely the *ch-schedule* event. This relation also replaces *ch-broadcast* transition with the *ch-acknowledge* event happening after the broadcast in the view of correct processes. This is exactly what the schedule order captures, as it relates the quorum schedule event of a label $$\ell$$ with the commit event of another label $$\ell'$$. 
 
> **Definition — Causal-order relation for Byzantine faults**
>
> Consider two labels $$\ell_1$$ and $$\ell_2$$, associated with messages $$m_1$$ and $$m_2$$, respectively, delivered by any correct process. We say $$(\ell_1, m_1)$$ **causally precedes** $$(\ell_2, m_2)$$ **in the Byzantine setting** and write $$(\ell_1, m_1) \prec_B (\ell_2, m_2)$$ whenever any of the following conditions hold:
> 1. A correct process $$p_i$$ delivers $$(\ell_1, m_1)$$ before $$(\ell_2, m_2)$$ for the same sender $$p_s$$, such that $$\ell_1, \ell_2 \in \mathcal{L}_s$$; if the sender $$p_s$$ is correct, it has broadcast $$m_1$$ before $$m_2$$.
> 2. The two labels $$\ell_1$$ and $$\ell_2$$ satisfy the schedule order, i.e., $$\ell_1\stackrel{SO}{\to}\ell_2$$; or
> 3. There exists a label $$\ell'$$ associated with some message $$m'$$ such that $$(\ell_1, m_1) \prec_B (\ell', m')$$ and $$(\ell', m') \prec_B (\ell_2, m_2)$$.
>
>If $$(\ell_1, m_1) \not\prec_B (\ell_2, m_2)$$ and $$(\ell_2, m_2) \not\prec_B (\ell_1, m_1)$$, we say that the two messages are *concurrent*.

With all necessary ingredients now in place, 
we introduce a new primitive, **Byzantine Reliable Broadcast with Causal Ordering (BRB-CO)**, which provides a secure building block in the Byzantine setting. BRB-CO extends the properties of a Byzantine reliable broadcast channel through three more properties: *completeness*, *hiding*, and *Byzantine causal delivery*:

> - *Completeness*: If some correct process schedules a label $$\ell$$, then it will eventually deliver the message $$m$$ associated to $$\ell$$.
> - *Hiding*: For any label $$\ell$$ associated with a message $$m$$ broadcast by a correct process $$p_s$$, no process other than $$p_s$$ can determine any information about $$m$$ before the quorum schedule event $$\mathcal{QS}(\ell)$$ occurs.
> - *Byzantine Causal Delivery*: For any label $$\ell_1$$ associated with message $$m_1$$ that causally precedes $$\ell_2$$ associated with $$m_2$$, i.e., $$(\ell_1, m_1) \prec_B (\ell_2, m_2)$$, no correct process delivers $$m_2$$ with label $$\ell_2$$ unless it has already delivered $$m_1$$ with label $$\ell_1$$.

The *completeness* property ties the scheduling of a label to eventual delivery, effectively decoupling agreement on the label from retrieval of the associated message.
The *hiding* property requires any implementation to reveal the payload message only after the quorum schedule event, that is, only once enough processes have reliably observed that label.
Together, the two properties, support and guarantee *Byzantine causal delivery*.

## A protocol for Byzantine Reliable Broadcast with Causal Ordering (BRB-CO)

A protocol that implements secure and robust BRB-CO needs essentially three components:

- A Byzantine reliable broadcast protocol ensuring *same* delivery guarantees at all correct processes;
- A data structure capturing causal dependencies, e.g., vector clocks;
- A cryptographic component providing *hiding*.

We discuss the importance of BRB and vector clocks shortly, in the description of the protocol, after further expanding on how to achieve *hiding*. We introduce a secure component as a distributed ideal primitive that we call *verifiable encapsulation*.

### Verifiable encapsulation (VE)

A *verifiable encapsulation (VE)* primitive allows a process to *encapsulate*, or hide, the payload of a message $$m$$ with identifier $$id$$ within a set of $$n$$ processes in such a way that they can later jointly extract the payload. Let $$k$$ stand for the minimum number of processes that are needed for the extraction. VE provides at least three properties.

- *Identifier uniqueness*: For every identifier $$id$$, there exists at most one message $$m$$ corresponding to $$id$$.
- *Privacy*: Less than $$k$$ processes learn no information about the payload $$m$$.
- *Reconstruction*: $$k$$ processes suffice to extract a payload $$m$$.

Notably, these requirements match properties one can obtain from *threshold cryptography*. Through VE, we abstract the necessary properties to allow implementations where one can modularly choose the best suitable primitive.
One can show how to instantiate VE with *threshold cipher*, *verifiable secret sharing*, and *publicly verifiable secret sharing*; the three choices result in different trade-offs between efficiency and flexibility.

### Protocol

A protocol implementing BRB-CO incorporates many instances of Byzantine reliable broadcast protocols that go back to [Bracha's celebrated protocol](//doi.org/10.1016/0890-5401(87)90054-X). BRB-CO extends it to more rounds and works as follows.

In the protocol instance for broadcasting one payload, the sender first hides the payload message cryptographically using the *verifiable encapsulation* primitive; the algorithm then proceeds in five rounds: send, echo, ready, schedule, and reconstruction. At the outset of the protocol, processes do not observe the message and agree on a label that VE has associated with the message. 

A second key mechanism is the use of vector clocks. Each process maintains in a local *scheduled vector* a list of how many labels per process it has already scheduled. This vector is shared with other processes in every echo message sent out. Then, through a *causal barrier* condition for the validation of echo messages and for ready messages, a process accepts an echo or ready message only when the attached vector clock, tracking causal dependencies, is consistent with its local scheduled vector. In particular for ready messages, each correct process computes the component-wise maximum of vectors collected from other processes and includes the result in the ready message. We show following a quorum intersection argument that **no correct process** misses reporting a dependency in such a vector.  Consequently, the protocol ensures that labels are scheduled in a causality-respecting order. 

Once a label is scheduled, it is placed in an ordered queue at every process; after enough processes have scheduled some label, the processes start the reconstruction round and recover the payload. Finally, each process *ch-delivers** messages taken from its queue so that they respect the scheduling order.

### Discussion

The correctness of BRB-CO design depends on all its components.  A secure VE instantiation is fundamental to hide the payload of a message among the set of processes and to ensure reconstruction later in the protocol even without the participation of the message's sender. The causal-order relation allows us to clearly capture the view of correct processes even in the presence of maliciously injected messages that reach the *schedule* phase, thus later delivered.
Vector clocks shared during the echo round and incremented during the schedule round at each process provide a **consistent distributed data structure**, with reliable increments, tracking possible causal dependencies. The component-wise maximum calculation on a quorum of vector clocks ensures *actual* causal dependencies always appear in the local view of a correct process before scheduling a label.
The two causal barrier conditions prevent malicious senders from reporting *false* dependencies in such data structures and provide a wrong snapshot of the system global state. Finally, putting all together, the four all-to-all communication rounds bring the protocol to satisfy causal delivery.

## Conclusion

Causal ordering under Byzantine faults can be enforced directly at the broadcast layer, without resorting to total order. This opens the door to broadcast-based services that need *concurrency* while remaining secure against strong adversaries and dependency-manipulation attacks.

Finally, we ask: *Which scalable, concurrent Byzantine-tolerant blockchain networks and other systems will exploit BRB-CO as a modular communication substrate?*

For more background, details, and formal arguments, see the [research paper](//arxiv.org/abs/2609.17074) that is available on [ayrXiv.org](//arxiv.org).

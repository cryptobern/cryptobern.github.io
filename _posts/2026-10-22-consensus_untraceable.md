---
layout: post
title: "The Consensus Number of Untraceable Cryptocurrencies"
ghcommentid: 19
author: François-Xavier Wicht
---

On public blockchains such as [Bitcoin](//bitcoin.org/) and [Ethereum](//ethereum.org/), anyone can verify payments and trace how funds move between addresses. Addresses do not identify their owners directly. Therefore, in the early days of these blockchains, many people believed that payments on them were private. However, simple heuristics can link the addresses of one owner together and thereby [deanonymize a large portion of users](//doi.org/10.1007/978-3-642-39884-1_4). Moreover, information from an exchange or merchant can connect addresses to real people, and then anyone can read their financial history. Privacy-preserving cryptocurrencies such as [Monero](//www.getmonero.org/) and [Zcash](//z.cash/) allow payments to be verified while hiding their source. Unsurprisingly, this privacy comes at a cost, and this cost motivates our work. We have analyzed such protocols to better understand the trade-off between transaction privacy, storage cost, and scalability. [Our results](//doi.org/10.4230/LIPIcs.AFT.2026.5) have been published at [AFT 2026](//aftconf.github.io/).

<link rel="stylesheet" href="{{ '/images/consensus-figures.css' | relative_url }}">

In the designs we study, a sender proves ownership of one source address within a group of candidate addresses, without revealing which one is being spent. Thus the remaining addresses serve as decoys and hide the source. This group of candidates is called a **masking set** or an **anonymity set**; creating such sets is instrumental for privacy-preserving payments. More generally, we call each spendable source of funds an **account**. Such an account can be spent only once, and the transaction that spends it moves the funds into fresh accounts. For example, in Monero, an account corresponds to a [transaction output with a one-time key](//www.getmonero.org/resources/moneropedia/transaction.html). To spend it, the sender combines the output with a small number of decoy outputs taken from the Monero blockchain and proves with a so-called [ring signature](//en.wikipedia.org/wiki/Ring_signature) that it owns one of them, without revealing which. In Zcash, in contrast, an account corresponds to a [shielded note](//zips.z.cash/protocol/protocol.pdf), which the ledger records only as a commitment. To spend a note, the sender shows with a [zero-knowledge proof](//en.wikipedia.org/wiki/Zero-knowledge_proof) that it owns one of the notes created so far in the same shielded pool. Thus, the masking set is the entire pool.
Monero and Zcash use different cryptographic techniques, but both must prevent a hidden source of funds from being spent twice.

Every cryptocurrency needs a way to prevent double-spending of funds, and this determines what its ledger must retain and whether payments from different users can proceed independently. We have compared two designs and use so-called [**consensus numbers**](//en.wikipedia.org/wiki/Consensus_(computer_science)#Consensus_number) to characterize how much synchronization among the users is needed in each. Our findings show that there is a trade-off between storage and synchronization: in the design that stores less, otherwise independent payments can conflict.

## Two ways to handle a private payment

In a first design, used by Monero and Zcash, a transaction spends one account, and its decoys remain available for future transactions. The transaction publishes a **nullifier** for the account it spent. Observers cannot tell from the nullifier which account was spent. However, spending the same account again would produce the same nullifier, and the consensus protocol would therefore reject the second attempt.

The ledger must keep both, the accounts and their nullifiers, forever. If it would delete an old account, observers could infer that the account had been spent; if it deleted a nullifier, the account could be spent a second time. Thus the stored state grows with every transaction. We call this the **linear-state** design. [Earlier work on toxic decoys](/toxic_decoys/) describes a way to reclaim some of this storage.

A second design has been explored in research works such as [Quisquis](//doi.org/10.1007/978-3-030-34578-5_23), [Nopenena](//eprint.iacr.org/2024/903), and [PriFHEte](//doi.org/10.1007/978-981-95-5122-4_7), which are widely seen as promising approaches, but have not been deployed in practice yet. In this design, a transaction consumes every account in its masking set and replaces each one with a randomized version. The randomization hides which balances changed. Since old versions are no longer needed, the ledger keeps only the current accounts. We call this the **constant-state** design.

To illustrate the difference between the designs, suppose Alice issues a transaction to spend account $$a$$ using the masking set $$\{a,b,c\}$$, and Bob simultaneously spends account $$d$$ using $$\{c,d,e\}$$ in another transaction. Both transactions include account $$c$$ as a decoy. In the linear-state design, both can succeed. In the constant-state design, however, the first transaction replaces $$c$$, so the other transaction refers to an old version of $$c$$ and is rejected, although Alice and Bob spend different accounts.

Figure 1 lets you run the two transfers in either order, in each design.

{% include consensus-transfer.html %}

## What the consensus number measures

To understand consensus numbers,
suppose several concurrently running processes must choose one common value, either 0 or 1. They start a protocol, and each process proposes its own input bit. They must all choose the same value, and someone must have proposed the chosen value. This is the celebrated [**consensus problem**](//en.wikipedia.org/wiki/Consensus_(computer_science)). A protocol is **wait-free** if a process that keeps taking steps can decide even when the others pause or stop. Thus a slow or crashed process cannot hold everyone else up.

Processes can communicate through shared objects. The simplest one is a **register**: one process writes a value, and others read it. A read or write is **atomic** if it takes effect as one indivisible step. With registers, processes can publish proposals. However, if they use only registers, two processes cannot settle a race in a wait-free way, because both may read the old value before either writes a new one.

With more complex operations, processes can **pick a winner**. If a [**test-and-set**](//en.wikipedia.org/wiki/Test-and-set) primitive is available, the first process changes a shared bit from 0 to 1 and learns that it was first; a second process sees 1. For two contenders, each can publish its proposal, try test-and-set, and then choose the winner's proposal. If the processes can call [**compare-and-swap**](//en.wikipedia.org/wiki/Compare-and-swap), a process asks to replace a value only if it still equals an expected value. The first successful process can put its proposal in the shared object, and every later process can read that winner's value. Compare-and-swap is therefore more powerful than test-and-set because it works for any number of contenders.

The [consensus number](//en.wikipedia.org/wiki/Consensus_(computer_science)#Consensus_number) of an object, introduced in a [classic paper by Herlihy](//doi.org/10.1145/114005.102808), is the largest number of processes that can reach wait-free consensus using that object and atomic registers. Registers have consensus number 1; test-and-set has 2; compare-and-swap has no finite limit. Consensus numbers address a potential worst case, but how often an application needs agreement depends on the actual workload.

Determining a consensus number requires two results. A protocol shows that an object can reach agreement among a given number of processes, and a limit shows that no protocol can do so for more processes. Hence the proof of a limit must cover every possible protocol.

In the standard argument, one considers an execution of a concurrent system and examines its possible states until a winner is fixed. A state is **bivalent** if the schedule could still lead to either 0 or 1. It is **0-valent** if the processes decide 0 in every continuation, and **1-valent** if they decide 1 in every continuation. A **critical state** is bivalent, but any process's next step fixes one outcome. Figure 2 shows an example: the processes whose steps fix 0 form one *valency group*, and those whose steps fix 1 form the other.

{% include consensus-valency.html %}

Take one process from each group. If their next steps were independent, every other process would have the same view in both orders. Yet the first step would fix the decision to 0 in one order and to 1 in the other. With at least three processes, a third process could not decide correctly in both cases. Therefore, steps from opposite groups must affect some shared variables through which the other processes can learn what happened. In contrast, two steps in the same group need not have such an effect, since either step fixes the same decision.

## How privacy impacts synchronization

For asset transfers in Bitcoin and many other cryptocurrencies, the consensus number is 1 when each account has one owner, as [influential work](//doi.org/10.1007/s00446-021-00399-2) has recently shown. Payments from different accounts do not need a common order. This is why the [Sui](//sui.io/) blockchain processes them independently, and [earlier work on token smart contracts](/synchronization/) explores the connection in more detail. A cryptocurrency that avoids consensus for such payments scales better and achieves higher throughput than one that runs consensus on every transaction.

However, if a cryptocurrency also offers private payments, the way it hides accounts also affects its scalability and its need for consensus. This post studies that effect for the two designs introduced earlier. We call the linear-state design *linear untraceable asset transfer* (LUAT) and the constant-state design *constant-state untraceable asset transfer* (CUAT). Throughout, a masking set contains $$\lambda$$ accounts.

## Linear-state asset transfer (LUAT): Overlap does not cause conflict

A LUAT transaction spends one account and only *refers to* the other accounts in its masking set. Two users who spend different accounts can therefore both succeed, even if they choose the same decoys. Hence increasing the masking-set size does not introduce conflicts between them.

The consensus number of LUAT is **2**, for any masking-set size and under either privacy definition discussed below. This is one more than for ordinary asset transfer, and the extra requirement comes from the nullifiers. A LUAT transfer returns the nullifier set after adding its nullifier. Suppose two processes each publish a proposal and then spend an account they own, starting from an empty nullifier set. The first transfer to take effect sees one nullifier, and the second sees two. Thus the first process decides its own proposal, and the second adopts it.

However, two transfers that spend different accounts result in the same state in either order, so a third process cannot tell which came first. By the critical-state argument above, LUAT therefore cannot solve consensus among three processes. In contrast, if an account has $$k$$ owners, their transfers compete for the same nullifier, and the consensus number becomes $$\max(k,2)$$.

With one owner per account, LUAT is also [**starvation-free**](//en.wikipedia.org/wiki/Resource_starvation): other users cannot invalidate a valid payment and thereby block it by merely selecting its account as a decoy. The cost of the LUAT design is the growing record of accounts and nullifiers. One can implement garbage collection for exhausted, pre-declared masking sets by following the approach of [toxic decoys](//doi.org/10.56553/popets-2025-0165), which is explained in [this earlier post](/toxic_decoys/). In Section 5.3 of the [full version of our paper](//eprint.iacr.org/2026/1503), we show that this operation has consensus number 2, so it does not increase the synchronization requirement.

## Constant-state asset transfer (CUAT): Overlap implies conflict

Two CUAT transactions, on the other hand, conflict whenever their masking sets share an account. We represent this with a **conflict graph**: each transaction is a vertex, and an edge joins transactions with overlapping sets. Transactions with no edge between them can be processed independently.

Applied to CUAT, the argument above shows that at a critical state, pending transfers from opposite valency groups must overlap on the same CUAT object. Otherwise both can succeed in either order, and a third process cannot tell which decision was fixed first. Transfers within one group need no such overlap.

If every pair of transactions overlaps, only one can succeed. Thus the participants can use that winner to agree on one of their proposed values. How many participants can do this depends on the privacy guarantee, and we distinguish two forms of privacy.

### Privacy for one transaction

Under **weak untraceability**, an observer cannot identify the sender of a transaction from its proof. This is the guarantee usually stated for a single transaction, for example in [Zerocoin](//doi.org/10.1109/SP.2013.34) and [Zerocash](//doi.org/10.1109/SP.2014.36), on which Zcash builds. However, an observer who compares several transactions may still learn something about the sender. For example, every masking set could include the same *hub* account. All transactions would then conflict, and CUAT could solve consensus for any number of processes, even if each submits only one transaction.

The hub example also shows why weak untraceability is not sufficient. Someone who sees the whole history can recognize the account that appears every time as a decoy and rule it out as a sender.

### Privacy across the full history

**Strong untraceability** asks what an observer can learn from the full transaction history. If an account appears much more often than the other accounts in its masking sets, it is likely the source of some of these payments, even if each transaction looks private in isolation. Analyses of Monero's blockchain have shown that combining information across transactions can identify the true source of many payments ([Kumar et al.](//doi.org/10.1007/978-3-319-66399-9_9); [Möser et al.](//doi.org/10.1515/popets-2018-0025)), and [Egger et al.](//doi.org/10.56553/popets-2022-0085) study how to choose decoys that resist such analysis.

One can make this observation precise with an **independent-inclusion adversary**. Before seeing the history, this observer treats accounts symmetrically. It does not know which accounts are more likely to fund payments. It assumes that each account's appearance in a masking set is sampled independently, while decoys are drawn uniformly. After seeing the history, it updates its beliefs using how often each account appeared. We do not model timing and network information, and the observer does not use which accounts appear *together*.

Under these assumptions, strong untraceability holds exactly when any two accounts in the same masking set appear equally often across the history. We call this **uniform incidence**. With equal counts, the observer has no reason to favor one member of a set over another. The condition is necessary even for an observer that uses more information, and sufficient under the independent-inclusion model. When the masking sets are connected by overlaps, every account in their union appears equally often. For example, a hub account that appears in every set violates this condition.

### The consensus number under strong untraceability

Now consider a **one-round** protocol: each process chooses one masking set before submitting a transfer. By the critical-state argument, every pair of these sets must overlap. With one owner per account and uniform incidence, each account appears in at most $$\lambda$$ of the sets. Hence a chosen set can meet at most $$\lambda(\lambda-1)$$ other sets, and a one-round protocol reaches at most $$\lambda^2-\lambda+1$$ processes.

This limit is reached when $$\lambda-1$$ is a prime power: the masking sets can be chosen as lines of a [projective plane](//en.wikipedia.org/wiki/Projective_plane). For example, for $$\lambda=3$$, the seven lines of the [Fano plane](//en.wikipedia.org/wiki/Fano_plane) serve as seven masking sets of three accounts each, and seven processes can reach consensus. When $$\lambda-1$$ is not a prime power, a cyclic construction reaches $$\lfloor\lambda^2/2\rfloor$$ processes.

A protocol can reach more processes by running for more than one round. In earlier rounds, groups agree internally, and in a later round, the processes choose between the groups. Then only masking sets from opposite groups must overlap. A grid of fresh accounts meets this requirement: the transfers of one group use the rows of the grid as masking sets, the transfers of the other group use its columns, every row meets every column, and every account appears equally often. Applying this construction recursively reaches $$\lambda^2$$ processes, and we show that no protocol can reach more. Both results concern protocols in which each process submits at most one transfer to each CUAT object, although a protocol can use a new object in each round. We explain these bounds step by step in a collapsed box [below the theorem](#uc-proof).

In Figure 3, you can compare the bounds as the value of $$\lambda$$ changes. The one-round value shown there is an upper bound, reached by the projective-plane construction when $$\lambda-1$$ is a prime power. The multi-round value is exact in our CUAT model for every $$\lambda\ge2$$.

{% include consensus-bounds.html %}

> Under strong untraceability, constant-state untraceable asset transfer (CUAT) with masking sets of $$\lambda$$ accounts has consensus number exactly $$\lambda^2$$ for every $$\lambda\ge2$$, for protocols in which each process submits at most one transfer to each CUAT object.

<details class="uc-proof" id="uc-proof" markdown="1">
<summary><strong>Why the bounds hold.</strong> This part explains the proofs step by step, with two more figures. Readers less interested in the proofs can skip it.</summary>

#### One round: at most λ² − λ + 1 processes

Consider a one-round protocol, and suppose one process p proposes 0 and every other process proposes 1. Then there is a critical state where p lies on the 0 side and all others lie on the 1 side. By the critical-state argument, p's masking set must overlap with each of the other masking sets. We can repeat this argument with each process in turn because the sets were fixed in advance. Thus every pair of sets overlaps.

Let $$d$$ be the number of transfers considered in the anonymity analysis, $$v$$ the number of distinct accounts in their masking sets, and $$m$$ the number of sets containing each account. We count account appearances in two ways: $$d$$ sets each contain $$\lambda$$ accounts, while $$v$$ accounts each appear $$m$$ times. Hence $$d\lambda=vm$$. Each process needs an account it owns to fund its transfer. With one owner per account, it follows that $$d\le v$$, and hence $$m=d\lambda/v\le\lambda$$.

Pick one masking set. Each of its $$\lambda$$ accounts appears in at most $$m-1$$ *other* sets. Since every other set must intersect with the chosen set, those accounts can cover at most $$\lambda(m-1)$$ other sets. Add the chosen set itself: $$d\le1+\lambda(m-1)$$. Finally, since $$m\le\lambda$$, we obtain $$d\le1+\lambda(\lambda-1)=\lambda^2-\lambda+1$$. For example, for $$\lambda=3$$, the chosen set has three accounts, each of which can appear in at most two more sets: $$1+3\cdot2=7$$. A set that meets the chosen set in two accounts is counted twice, so the true number of sets can only be smaller.

When $$\lambda-1$$ is not a prime power, no suitable projective plane is known, so we use a cyclic construction. Number $$n=\lfloor\lambda^2/2\rfloor$$ accounts from $$0$$ to $$n-1$$ and choose one base set $$D$$ of $$\lambda$$ accounts that contains $$0$$. The masking sets are the $$n$$ shifts of $$D$$, obtained by adding the same $$t$$ to every account number modulo $$n$$. Process $$t$$ owns account $$t$$ and uses the shift by $$t$$. Each account lies in exactly $$\lambda$$ shifts, so incidence is uniform, and $$D$$ is chosen so that every two shifts overlap. This construction reaches $$\lfloor\lambda^2/2\rfloor$$ processes for every $$\lambda\ge3$$. Hence the largest one-round protocol has between $$\lfloor\lambda^2/2\rfloor$$ and $$\lambda^2-\lambda+1$$ processes.

#### Several rounds: at most λ² processes

Return to the critical state of Figure 2. Its pending processes split into a 0-valency group of size $$s_0$$ and a 1-valency group of size $$s_1$$. Every transfer on one side must overlap every transfer on the other, because otherwise a third process could not distinguish the two outcomes. Transfers *within* a group need not overlap: if two processes from the 0-valency group move, the decision is 0 in either order, so no process needs to tell which moved first. The one-round argument needed every pair of masking sets to overlap. In contrast, here only pairs from opposite groups must overlap, so that limit no longer applies. Figure 4 shows such a split into groups of three and six processes.

{% include consensus-valency-groups.html %}

Since each process submits at most one transfer to the contested object, the pending transfers at the critical state are the object's entire history, and strong untraceability requires them to have uniform incidence. Without this restriction, a process could follow its consensus transfer with extra transfers that only even out the counts, and no finite limit would hold. Say each account appears $$m$$ times in these transactions, with $$m\le\lambda$$ by the same ownership count as above. If an account appears $$i$$ times in the first group and $$j$$ times in the second, then $$i+j=m$$. It can cover $$i \cdot j$$ pairs across the groups, and all $$s_0 \cdot s_1$$ pairs need to be covered.

The first group makes $$s_0\lambda$$ account appearances, and the second makes $$s_1\lambda$$. Since each account appears $$m$$ times, the two groups use $$v=(s_0+s_1)\lambda/m$$ distinct accounts. An argument based on the Cauchy-Schwarz inequality implies that the number of cross-group pairs these accounts can cover is bounded by $$s_0s_1\lambda m/(s_0+s_1)$$. That number must be at least $$s_0 \cdot s_1$$. Dividing by $$s_0 \cdot s_1$$ and rearranging, we obtain $$s_0+s_1\le\lambda m\le\lambda^2$$.

#### Several rounds: a grid construction for λ² processes

For the lower bound, we first let two smaller groups agree internally. In the next round, every transaction in one group must conflict with every transaction in the other, and every account must appear the same number of times so that privacy is preserved. A grid of accounts meets both requirements. We take $$\lambda^2$$ new accounts and arrange them as a $$\lambda\times\lambda$$ grid. Each row and column contains $$\lambda$$ accounts, so either can serve as a masking set. Every row meets every column in exactly one account.

We split the first group into $$\lambda$$ blocks of $$u$$ processes and assign each block a row. We split the second group into $$\lambda$$ blocks of $$w$$ processes and assign each block a column. The account $$a_{ij}$$ in row $$i$$ and column $$j$$ lies in the masking sets of the $$u$$ transfers that use row $$i$$ and of the $$w$$ transfers that use column $$j$$. It therefore appears in exactly $$u+w$$ transfers, wherever it lies in the grid. The row and the column share this account, but they are the masking sets of different transfers, so no transfer is counted twice. Once a transaction from one group commits, all transactions from the other group fail because each shares an account with it. From the committed transfer in the published state, processes on the losing side can identify the winning group and adopt the value on which that group already agreed.

Figure 5 shows the grid for two groups that have already agreed internally: three processes carry value $$y_0$$ and six carry value $$y_1$$. Each row process $$P_{i,i}$$ owns the diagonal account $$a_{ii}$$ and uses its entire row as a masking set. Each column's two off-diagonal accounts belong to two distinct processes $$Q_{i,j}$$, both of which use that entire column. Thus there is **one process per row masking set and two processes per column masking set**. The figure shows the ownership assignment, the shared accounts, and how the earlier decisions of the two groups are combined.

{% include consensus-grid.html %}

We apply the grid construction recursively. The recursion starts with $$\lambda$$ processes that all use one masking set, each spending an account it owns in that set. The first transfer replaces the whole set, and the others fail and adopt its value. With a grid, a group of $$\lambda u$$ processes and a group of $$\lambda w$$ processes then form one group of $$\lambda(u+w)$$ processes, and each account of the new grid appears $$u+w$$ times. We repeat this until $$u+w=\lambda$$ and obtain $$\lambda^2$$ processes.

For example, with $$\lambda=3$$, the recursion begins with three processes competing on one masking set, each spending an account it owns. Two such groups combine through a grid to reach six processes, with one process per row and one per column. Then, with a fresh grid, groups of three and six processes combine to reach nine. Every account in this final grid appears in one row transfer and two column transfers, so incidence remains uniform. Several transfers within the winning group may succeed, but they all carry the same value from the group's earlier agreement. Processes in the other group read a committed transfer and adopt that value.

</details>

## Fairness and parallel payments

The conflicts in CUAT can also prevent a payment from completing. An adversary can repeatedly submit zero-value transactions whose masking sets overlap with the set of a victim's pending transaction. Each successful transaction invalidates the victim's attempt. Hence CUAT cannot be starvation-free under an unfair asynchronous scheduler. This confirms a concern raised in [the literature](//doi.org/10.1007/978-3-030-51280-4_23).

However, this does not mean that every CUAT payment protocol needs a global order. Transactions with disjoint masking sets can still run in parallel. The conflict graph shows which payments interfere in a particular batch. Larger masking sets give a sender more accounts to hide among, but also make overlaps more likely.

## Results at a glance

The main trade-offs between the LUAT and CUAT designs for untraceable cryptocurrencies are summarized in the following table. Recall that $$\lambda$$ denotes the size of the masking sets.

| Property | LUAT | CUAT |
| --- | --- | --- |
| Ledger state | Accounts and nullifiers grow with use | Bounded by active accounts |
| Decoys | Remain available | Consumed and replaced |
| Consensus number: weak untraceability | 2 | Unbounded |
| Consensus number: strong untraceability | 2 | λ² |
| Starvation-free with one owner per account | Yes | No under an unfair scheduler |
{: .uc-compare tabindex="0" aria-label="LUAT and CUAT comparison" }

## Conclusion

For designers of cryptocurrencies with privacy, our results show how the transaction model determines whether independent payments interfere. With one owner per account, LUAT lets different users spend despite shared decoys, but the ledger must keep a growing record of accounts and nullifiers. CUAT keeps state bounded by the active accounts, but replacing decoys creates conflicts between otherwise independent payments. A designer therefore chooses between keeping a growing history and coordinating payments whose masking sets share accounts.

For CUAT, the way senders choose masking sets determines which payments conflict. A selection rule that reduces contention must still let the accounts in a masking set appear equally often across the history; otherwise, an observer learns something about the sender. A deployment must also state how payments make progress under an unfair scheduler, where competing transfers can invalidate a payment again and again. For example, payment service providers could act as relays that order overlapping transfers.

For a more detailed exposition, see the [research paper](//eprint.iacr.org/2026/1503), which is joint work by Christian Cachin, David Lehnherr, Juan Villacis, and François-Xavier Wicht.

---

_This work was supported by the Swiss National Science Foundation (SNSF) under grant agreement Nr. 219403 (Emerging Consensus) and by the [Initiative for Cryptocurrencies and Contracts (IC3)](//www.initc3.org)._

<script src="{{ '/images/consensus-figures.js' | relative_url }}"></script>

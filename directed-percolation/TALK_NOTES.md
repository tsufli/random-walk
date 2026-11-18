# Speaking outline (30 minutes)

## 0–4 min: Can an infection survive?
Start with a single infected individual on a one-dimensional line. Every individual is infected only for one generation. Ask: if transmission is unlikely, will the disease die? What changes if we turn up transmission?

## 4–9 min: Minimal model
Sites take values 0 or 1. Each active site independently infects each of its two neighboring sites in the next time step with probability p. Show the branching V-shaped diagram. For k infected parents the success probability is 1-(1-p)^k. This is the 1+1D directed bond percolation model (the direction is time).

**Interesting mean-field contrast:** for independent parents with probability rho of being active, rho(t+1) = 1-(1-p*rho(t))^2 = 2p*rho - p^2*rho^2. The linearized growth factor at low density is 2p, giving p_c^MF=1/2. In one dimension correlations matter; the true threshold is p_c≈0.644700185.

## 9–12 min: Absorbing, irreversible, nonequilibrium
When all sites are healthy, infection cannot restart. This state is absorbing, unlike a fluctuating equilibrium phase. Dynamical transitions from activity to absorption cannot be microscopically reversed without an external source. Avoid claiming that the mere arrow of time *alone* establishes nonequilibrium: the relevant property is a non-reversible, kinetically sustained active regime. The trivial absorbing stationary measure of a finite system is not evidence that its active dynamics are equilibrium.

## 12–20 min: Live demonstration
Choose "One infected seed". At p=.55, the infection usually dies quickly; try "New randomness" to see stochastic variation. At p=.6447, some histories survive and look ragged/scale-free; others go extinct. At p=.75, activity can grow into a widening cone. Point out that a single example does not locate a critical point. Next choose "Fully infected" and compare rho(t) at three p values; supercritical runs maintain a positive density for the observable window, subcritical runs decay. Finally, run 400 outbreaks at pc and select log–log axes to estimate P_surv(t).

## 20–27 min: Order parameter and universal exponents
Define rho(t)=E[(1/L) sum_i n_i(t)] from fully occupied initial conditions. In the infinite system, rho_st~(p-pc)^beta above pc, with beta≈0.2765. At criticality, rho(t)~t^-alpha, alpha≈0.1595. From a seed, P_surv(t)~t^-delta, delta≈0.1595, and the mean number of active sites INCLUDING extinct histories scales as N(t)~t^theta, theta≈0.3137. The average conditional on survival instead scales as N(t)/P_surv(t)~t^(theta+delta). Explain that exponents and scaling functions, not the numerical threshold, are universal.

## 27–30 min: Why it matters
The same universality class arises in a wide range of models with a single absorbing state, local spreading, short-range interactions, and no additional conservation laws or symmetries. Cite the Janssen–Grassberger conjecture; emphasize that adding immunity, long-term memory, conserved fields, quenched randomness, or additional absorbing states can alter the class. Optional forward bridge to turbulence: whether a local patch of activity spreads or collapses is conceptually connected to spatiotemporal intermittency, but DP universality is *not automatic* in realistic pipe flow.

## Three useful audience questions
- Why is the threshold not p=1/2, despite an early infected site making 2p attempts on average? (Correlations, repeated attempts at the same target, inactive pockets.)
- Is every supercritical outbreak immortal? (No, only positive survival probability in infinite volume.)
- Why do we need many trials? (Averages, rare survivors and power laws cannot be inferred from one history.)
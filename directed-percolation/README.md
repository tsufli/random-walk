# Directed percolation · interactive lab

A no-build interactive website for a 30-minute seminar on **1+1-dimensional directed bond percolation** motivated by epidemic spread.

## Open locally

Open `index.html` in a browser. No Python, package manager, bundler, CDN library, or server is necessary. (The Google Fonts stylesheet is optional; system fonts are used if offline.)

## Experiments

1. **One infected seed** — space-time diagram and active site count of one stochastic history.
2. **Fully infected** — infected fraction vs time, displaying the absorbing and active phases.
3. **Many outbreaks** — independent seed experiments measuring survival probability and average infected count.

Select subcritical (`p = 0.55`), critical (`p ≈ 0.6447`), or supercritical (`p = 0.75`). Step, run, pause, reinitialize randomness, and switch to log–log axes to see the critical slope guides. A link includes the experiment mode and transmission probability for replay during talks.

## The update rule

A site is active/infected in generation `t+1` if at least one successful independent transmission arrives from either neighboring active site in generation `t`. Each directed outgoing bond transmits with probability `p`. In particular,

`Pr(active at t+1 | k active parents at t) = 1 - (1-p)^k`, for `k = 0,1,2`.

With all sites inactive, no new activity is possible: the absorbing state.

The website uses **401 lattice sites with periodic spatial boundary conditions** and **190 transitions**. In the seed experiment, an outbreak cannot wrap around the periodic boundary until time step 201, beyond this simulation window. The site uses independent Bernoulli trials for both outgoing bonds of every infected site. Sample trajectories use a repeatable pseudorandom seed; "New randomness" changes it. Ensemble outbreaks have independent seeds. All calculations happen locally.

The critical bond probability for 1+1D tilted square lattice is `pc = 0.644700185(5)` (numerical estimate). Exponents used as guide slopes: density decay `alpha ≈ 0.159464`, seed survival `delta ≈ 0.159464`, average infected count `theta ≈ 0.313686`; stationary order-parameter exponent `beta ≈ 0.276486`.

## Finite-size caveat

An individual outbreak may go extinct even above `p_c`. At finite size and `0 < p < 1`, absorption eventually occurs with probability one. The active phase and nonzero stationary order parameter are thermodynamic-limit properties. Scaling laws become clean only over appropriate time windows and after enough ensemble averaging.

## Deploy to GitHub Pages

Create a public GitHub repository, upload `index.html`, `style.css`, and `app.js` to its root, then select **Settings → Pages → Deploy from a branch → main / (root)**. Alternatively, place the files under a subdirectory in an existing GitHub Pages repository.

## References

- H. Hinrichsen, *Non-equilibrium critical phenomena and phase transitions into absorbing states*, Advances in Physics **49**, 815 (2000): https://arxiv.org/abs/cond-mat/0001070
- H. K. Janssen and U. C. Täuber, *The field theory approach to percolation processes*, Annals of Physics **315**, 147 (2005): https://doi.org/10.1016/j.aop.2004.09.011
- J. W. Essam, A. J. Guttmann, and K. De'Bell, *Analysis of extended series for bond percolation on the directed square lattice*, Physical Review B **33**, 1982 (1986): https://doi.org/10.1103/PhysRevB.33.1982

# Combine Numbers Game

In French, "Le Compte est Bon".

Given:
+ several numbers, usually 6
+ a target, usually a larger number

the player must find a sequence of operations (`+`, `-`, `*`, `/`) applied to the numbers to reach or approach the target.

Example:

For the following input:
+ Target: 335
+ Numbers; 3, 3, 4, 6, 7, 9

a solution is:
((9 * 7) + 4) * (3 + 6 / 2) = (63 + 4) * (3 + 2) = 67 * 5 = 335

## Python

Run the notebook [game.ipynb](https://nbviewer.jupyter.org/github/oscar6echo/combine-number-game/blob/master/python/game.ipynb) for all the solutions.  
They are available in [df_solutions.csv](python/output/df_solutions.csv).

## Node

Run the node script for all the solutions.  
```bash
# in file src/solver.js
# set multithread to true or false for parallel run
yarn solve
```

They are available in [solutions.csv](node/output/solutions.csv).

## Web - Vue app

Launch the Vue application to find solutions for a problem.

```bash
yarn serve
```





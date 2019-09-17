import workerpool from 'workerpool';

import { PatternSolver } from './pattern-solver';

function solvePattern(jsonA, jsonB) {
//   console.log('---start solvePattern');

  const { pattern, target, numbers } = JSON.parse(jsonA);
  const { nbMaxPerPattern, targetRange, stopAtSolution } = JSON.parse(jsonB);

//   console.log({ pattern, target, numbers });
//   console.log({ nbMaxPerPattern, targetRange, stopAtSolution });

  const pSolver = new PatternSolver({
    pattern,
    target,
    numbers
  });

  let { nbValid, results } = pSolver.run({
    nbMaxPerPattern,
    targetRange,
    stopAtSolution
  });

//   console.log(nbValid, results.length);
//   console.log('---end solvePattern');

  return JSON.stringify({ nbValid, results });
}

workerpool.worker({
  solvePattern
});

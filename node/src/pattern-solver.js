import { SequenceGenerator } from './sequence-generator';
import { SequenceEvaluator } from './sequence-evaluator';

class PatternSolver {
  constructor({ pattern, target, numbers, verbose }) {
    this.pattern = pattern;
    this.target = target;
    this.numbers = numbers;
    this.verbose = verbose;

    this.SeqGenerator = new SequenceGenerator({ numbers, verbose });
    this.SeqEvaluator = new SequenceEvaluator({ target, verbose });
  }

  hi() {
    console.log('HELLO');
  }

  run({ nbMaxPerPattern, targetRange, stopAtSolution }) {
    let nbValid = 0;
    const results = [];
    const solutions = [];

    if (!targetRange) targetRange = 10;

    let g, seq, k, p, m;

    g = this.SeqGenerator.run(this.pattern);

    m = 0;
    for (seq of g) {
      m++;
      if (nbMaxPerPattern && m >= nbMaxPerPattern) break;

      const { valid, result, sequence } = this.SeqEvaluator.run(seq);
      if (valid) {
        nbValid++;
        if (Math.abs(result - this.target) <= targetRange) {
          const d = {
            value: result,
            sequence: sequence.toString()
          };
          results.push(d);
          if (result === this.target) {
            solutions.push(d);
          }
        }
      }
      if (stopAtSolution && solutions.length == stopAtSolution) {
        break;
      }
    }

    return { nbValid, results };
  }
}

export { PatternSolver };

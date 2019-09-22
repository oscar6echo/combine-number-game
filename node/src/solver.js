import { listBinaryTree } from './combinatorics';
import { SequenceGenerator } from './sequenceGenerator';
import { SequenceEvaluator } from './sequenceEvaluator';
import { SequenceSignature } from './sequenceSignature';
import { PatternSolver } from './patternSolver';
import { createObjectCsvWriter } from 'csv-writer';
import workerpool from 'workerpool';
import fs from 'fs';

class Solver {
  constructor({ target, numbers, verbose }) {
    if (!Number.isInteger(target)) {
      throw 'target must be an int';
    }
    if (!(numbers instanceof Array)) {
      throw 'numbers must be an array';
    }
    for (let e of numbers) {
      if (!Number.isInteger(e)) {
        throw `elements of numbers must be ints: Error with ${e}`;
      }
    }

    this.target = target;
    this.numbers = numbers;
    this.verbose = verbose;

    this.patterns_postfix = Array.from(
      listBinaryTree({ n: this.numbers.length, repr: 'postfix' })
    );
    this.patterns_parenth = Array.from(
      listBinaryTree({ n: this.numbers.length, repr: 'parenth' })
    );

    this.SequenceGen = new SequenceGenerator({ numbers, verbose });
    this.SequenceEval = new SequenceEvaluator({ target, verbose });
    this.seqSign = new SequenceSignature({ verbose });

    if (this.verbose) {
      const a = this.patterns_postfix.length;
      console.log(`target = ${target}`);
      console.log(`numbers = ${numbers}`);
      console.log(`nb patterns = ${a}`);
    }
  }

  solve({
    nbMaxPerPattern = null,
    targetRange = null,
    stopAtSolution = false,
    multithread = false,
    showNbSols = 15
  }) {
    console.time('exec');

    const that = this;
    const patterns = this.patterns_postfix;
    let nbValidSeq = 0;
    const resultsClose = [];
    const solutions = [];

    if (!targetRange) targetRange = 10;

    console.log(`nb binary trees = ${patterns.length}`);

    const pool = workerpool.pool(__dirname + '/worker.js');
    const promises = [];

    let objA, objB;

    console.log(multithread ? 'parallel' : 'sequential');
    for (let [k, p] of patterns.entries()) {
      process.stdout.write(`${k} `);
      objA = {
        pattern: p,
        target: this.target,
        numbers: this.numbers,
        verbose: this.verbose
      };
      objB = {
        nbMaxPerPattern,
        targetRange,
        stopAtSolution
      };

      if (multithread) {
        promises.push(
          pool.exec('solvePattern', [
            JSON.stringify(objA),
            JSON.stringify(objB)
          ])
        );
      } else {
        const pSolver = new PatternSolver(objA);
        let { nbValid, results } = pSolver.run(objB);

        // nbValidSeq += nbValid;
        // resultsClose.push(...results);
        promises.push(Promise.resolve({ nbValid, results }));
      }
    }
    console.log('\nwaiting for promises resolution');

    Promise.all(promises)
      .then(function(arrData) {
        console.log('all promises resolved');
        // console.log('arrData.length', arrData.length);
        // let nbValid, results;
        for (let e of arrData) {
          const { nbValid, results } = multithread ? JSON.parse(e) : e;
          nbValidSeq += nbValid;
          resultsClose.push(...results);
        }

        // console.log('nbValidSeq', nbValidSeq);
        // console.log('resultsClose.length', resultsClose.length);
        // console.log('resultsClose.length', resultsClose.length);

        that.nbValidSeq = nbValidSeq;
        that.resultsClose = that.buildResults(resultsClose);
        that.solutions = that.resultsClose.filter(e => e.value === that.target);

        console.timeEnd('exec');

        that.showSummary();
        that.showSolutions(showNbSols);
        that.saveToFile('solutions');
        that.saveToFile('resultsClose');
      })
      .catch(function(err) {
        console.error('--------ERROR');
        console.error(err);
      })
      .then(function() {
        pool.terminate(); // terminate all workers when done
      });
  }

  buildResults(results) {
    const res = [];
    const setSeq = new Set();
    for (let e of results) {
      const signature = this.seqSign.run(e.sequence.split(','));
      if (!setSeq.has(signature)) {
        setSeq.add(signature);
        const f = {
          signature,
          sequence: e.sequence,
          value: e.value,
          miss: e.value - this.target,
          absMiss: Math.abs(e.value - this.target),
          length: e.sequence.split(',').filter(e => Number.isInteger(+e)).length
        };
        res.push(f);
      }
    }
    const res2 = res.sort((a, b) => {
      if (a.absMiss > b.absMiss) {
        return 1;
      } else {
        if (a.length > b.length) {
          return 1;
        } else {
          return -1;
        }
      }
    });
    return res2;
  }

  showSummary() {
    console.log('\nsummary');
    console.log(`nb valid sequence = ${this.nbValidSeq}`);
    console.log(`nb close results = ${this.resultsClose.length}`);
    console.log(`nb solutions = ${this.solutions.length}`);
  }
  showSolutions(N) {
    if (!N) N = Number.POSITIVE_INFINITY;
    console.log('\nsolutions');
    console.log(`#\tsignature\tsequence\tvalue\tlength`);
    for (let [k, s] of this.solutions.entries()) {
      if (k < N)
        console.log(
          `${k}\t${s.signature}\t${s.sequence.toString()}\t${s.value}\t${
            s.length
          }`
        );
    }
  }

  saveToFile(type) {
    const dir = 'output';
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir);
    }
    const csvWriter = createObjectCsvWriter({
      path: `./${dir}/${type}.csv`,
      header: [
        { id: 'signature', title: 'signature' },
        { id: 'sequence', title: 'sequence' },
        { id: 'value', title: 'value' },
        { id: 'length', title: 'length' }
      ]
    });

    csvWriter
      .writeRecords(
        this[type].map(e => {
          return {
            signature: e.signature,
            sequence: e.sequence.toString(),
            value: e.value,
            length: e.length
          };
        })
      )
      .then(() => console.log('CSV file saved'));
  }

  shapeSeq(strSeq) {
    return strSeq.split(',').map(e => {
      const f = parseInt(e);
      return f ? f : e;
    });
  }
}

const solver = new Solver({
//   target: 355,
//   numbers: [3, 3, 4, 6, 7, 9],
  target: 55,
  numbers: [2, 3, 4, 5, 6],
  verbose: false
});

solver.solve({
  //   nbMaxPerPattern: null,
    targetRange: 5,
  //   stopAtSolution: null,
  //   multithread: true,
  multithread: true,
  showNbSols: 25
});

// let seq, res;
// seq = solver.shapeSeq('3,4,3,9,6,7,+,*,*,+');
// console.log(seq);
// res = solver.evalSequence(seq, true);
// console.log(res);

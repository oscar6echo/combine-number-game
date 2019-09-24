import { listBinaryTree } from './combinatorics';
import { SequenceSignature } from './sequenceSignature';
import Worker from './solvePattern.worker.js';

class Solver {
  constructor({ numbers, target, targetRange, stopAtSolution, verbose }) {
    this.numbers = numbers;
    this.target = target;
    this.targetRange = targetRange;
    this.stopAtSolution = stopAtSolution;
    this.verbose = verbose;

    this.seqSign = new SequenceSignature({ verbose });
    this.patternsPostfix = Array.from(
      listBinaryTree({ n: this.numbers.length, repr: 'postfix' })
    );
    this.patternsParenth = Array.from(
      listBinaryTree({ n: this.numbers.length, repr: 'parenth' })
    );

    console.log('patternsPostfix');
    console.log(this.patternsPostfix);

    this.workers = {};
    this.results = {};
    this.nbSol = 0;
  }

  run() {
    console.log('start run');

    const that = this;
    console.log(that);
    window.that = that;

    for (let workerId of this.patternsPostfix) {
      console.log(workerId);
      const worker = new Worker();
      worker.onmessage = msg => this.handleMsg(msg);
      this.workers[workerId] = { worker, done: false, nbHit: 0 };
      const payload = {
        pattern: workerId,
        numbers: this.numbers,
        target: this.target,
        targetRange: this.targetRange
      };
      this.sendMsg(workerId, payload);
    }
    console.log('all workers stated');
  }
  alldone() {
    for (let [k, w] of Object.entries(this.workers)) {
      if (!w.done) return false;
    }
    return true;
  }

  handleMsg(msg) {
    // const that = this;
    const { workerId, payload } = msg.data;
    console.log('new result from workerId=' + workerId);
    console.log(msg.data);

    if (payload.done) {
      console.log('done workerId=' + workerId);
      this.workers[workerId].done = true;

      if (this.alldone()) {
        console.log('ALL DONE');
        console.log(this.results);
      }
      return;
    }

    this.workers[workerId].nbHit++;

    const { sequence } = payload;
    console.log(sequence);
    const signature = this.seqSign.run(sequence.map(e => String(e)));
    if (!this.results[signature]) {
      const { value } = payload;
      const nbInt = sequence.filter(e => Number.isInteger(e)).length;
      this.results[signature] = { value, sequence, nbInt };
      console.log('store new sol ' + signature);

      if (value === this.target) this.nbSol++;
      if (this.nbSol === this.stopAtSolution) {
        console.log('terminate all workers as enough solutions found');
        for (let [k, w] of Object.entries(this.workers)) w.terminate();
      }
    }
  }

  sendMsg(workerId, payload) {
    const worker = this.workers[workerId].worker;
    const msg = {
      workerId,
      payload
    };
    worker.postMessage(msg);
  }
}

export default Solver;

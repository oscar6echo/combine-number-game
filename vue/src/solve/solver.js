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
    window.tt = that;

    for (let workerId of this.patternsPostfix) {
      console.log(workerId);
      const worker = new Worker();
      worker.onmessage = msg => this.handleMsg(msg);
      this.workers[workerId] = worker;
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

  handleMsg(msg) {
    // const that = this;
    const { workerId, payload } = msg.data;
    console.log('new result from workerId=' + workerId);
    console.log(msg.data);

    if (payload.done) {
      console.log('done workerId=' + workerId);
      return;
    }

    const { sequence } = payload;
    console.log(sequence);
    const signature = this.seqSign.run(sequence);
    if (!this.results[signature]) {
      const { value } = payload;
      const pattern = payload.workerId;
      const nbInt = sequence.filter(e => Number.isInteger(e)).length;
      this.results[signature] = { value, sequence, pattern, nbInt };
      console.log('store new sol ' + signature);

      if (value === this.target) this.nbSol++;
      if (this.nbSol === this.stopAtSolution) {
        console.log('terminate all workers as enough solutions found');
        for (let w of this.workers) w.terminate();
      }
    }
  }

  sendMsg(workerId, payload) {
    const worker = this.workers[workerId];
    const msg = {
      workerId,
      payload
    };
    worker.postMessage(msg);
  }
}

export default Solver;

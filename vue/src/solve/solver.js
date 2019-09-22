import { listBinaryTree } from './combinatorics';
import { SequenceSignature } from './sequenceSignature';

const pathWorker = './workerSolvePattern';

class Solver {
  constructor({ patterns, numbers, target, targetRange, stopAtSolution }) {
    this.patterns = patterns;
    this.numbers = numbers;
    this.target = target;
    this.targetRange = targetRange;
    this.stopAtSolution = stopAtSolution;

    this.seqSign = new SequenceSignature();
    this.patternsPostfix = Array.from(
      listBinaryTree({ n: this.numbers.length, repr: 'postfix' })
    );
    this.patternsParenth = Array.from(
      listBinaryTree({ n: this.numbers.length, repr: 'parenth' })
    );

    this.workers = {};
    this.promises = [];

    this.resolves = {};
    this.rejects = {};
    this.globalMsgId = 0;

    this.results = {};
    this.nbSol = 0;
  }
  run() {
    const that = this;
    for (let workerId in this.patterns) {
      const worker = new Worker(pathWorker);
      worker.onmessage = this.handleMsg;
      this.workers[workerId] = worker;
      const payload = {
        pattern: workerId,
        numbers: this.numbers,
        target: this.target,
        targetRange: this.targetRange
      };
      const promise = this.sendMsg(worker, payload);
      this.promises.push(promise);
      promise
        .then(payload => {
          console.log('reeceive ' + payload);
          const sequence = JSON.parse(payload.sequence);
          const signature = this.seqSign.run(sequence);
          if (!that.results[signature]) {
            const { value } = payload;
            const pattern = payload.workerId;
            const nbInt = sequence.filter(e => Number.isInteger(e)).length;
            that.results[signature] = { value, sequence, pattern, nbInt };
            console.log('store new sol ' + signature);

            if (value === that.target) that.nbSol++;
            if (that.nbSol === that.stopAtSolution) {
              console.log('terminate all workers as enough solutions found');
              for (let w of that.workers) w.terminate();
            }
          }
        })
        .catch(err => console.log(err));
    }
  }

  handleMsg(msg) {
    const { msgId, workerId, payload } = msg.data;
    if (msgId && workerId && payload) {
      const resolve = this.resolves[msgId];
      if (resolve) resolve(msg.data);
    } else {
      const reject = this.rejects[msgId];
      if (reject) reject(`Error in worker ${workerId} - msgId=${msgId}`);
    }
    delete this.resolves[msgId];
    delete this.rejects[msgId];
  }

  sendMsg(workerId, payload) {
    const msgId = msgId;
    const msg = {
      msgId: msgId,
      workerId: workerId,
      payload
    };
    const worker = this.workers[workerId];
    return new Promise(function(resolve, reject) {
      this.resolves[msgId] = resolve;
      this.rejects[msgId] = reject;
      worker.postMessage(msg);
    });
  }
}

export default Solver;

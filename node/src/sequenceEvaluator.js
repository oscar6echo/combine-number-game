class SequenceEvaluator {
  constructor({ target = null, verbose = false }) {
    this.target = target;
    this.verbose = verbose;

    this._ops = {
      '+': [2, this.operatorAdd],
      '-': [2, this.operatorSub],
      '*': [2, this.operatorMul],
      '/': [2, this.operatorDiv]
    };
  }

  operatorAdd(a, b) {
    return a + b;
  }

  operatorSub(a, b) {
    return a - b;
  }

  operatorMul(a, b) {
    return a * b;
  }

  operatorDiv(a, b) {
    return a / b;
  }

  run(seq) {
    if (this.verbose) {
      console.log('---sequence', seq);
    }

    const stack = [];
    let n, op, args, res, seq2, nb_o, nb_x, i, c, q;

    for (let [k, e] of seq.entries()) {
      if (Number.isInteger(e)) {
        stack.push(e);
      } else {
        // operation
        if (this.verbose) {
          console.log('operation', e);
        }

        [n, op] = this._ops[e];
        args = [];
        for (i = 0; i < n; i++) {
          args.push(stack.pop());
        }
        args.reverse();

        // division specific
        if (e === '/' && args[1] === 0) {
          if (this.verbose) {
            console.log('early fail');
          }
          return { valid: false, result: 'div by zero', sequence: null };
        }

        // perform operation
        res = op(...args);

        // division specific
        if (e === '/') {
          if (args[0] % args[1] != 0) {
            if (this.verbose) {
              console.log('early fail');
            }
            return { valid: false, result: 'not int division', sequence: null };
          } else res = parseInt(res);
        }

        // udpate stack
        stack.push(res);

        // early hit
        if (res === this.target) {
          // keep only used numbers and ops in stack
          seq2 = seq.slice(0, k + 1);
          nb_o = seq2.filter(f => !Number.isInteger(f)).length;
          nb_x = nb_o + 1;
          c = seq2.length - 1;
          q = 0;
          while (q < nb_x) {
            if (Number.isInteger(seq2[c])) q++;
            c -= 1;
          }
          if (this.verbose) {
            console.log('early hit', stack);
          }
          return { valid: true, result: res, sequence: seq2.slice(c + 1) };
        }
      }
      if (this.verbose) {
        console.log('stack', stack);
      }
    }
    return { valid: true, result: res, sequence: seq };
  }
}

export { SequenceEvaluator };

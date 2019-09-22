class SequenceSignature {
  constructor({ verbose = false }) {
    this.verbose = verbose;

    this._ops = {
      '+': [2, '+'],
      '-': [2, '-'],
      '*': [2, '*'],
      '/': [2, '/']
    };
  }

  run(seq) {
    if (this.verbose) {
      console.log('---sequence', seq);
    }

    const stack = [];
    let res;

    for (let e of seq) {
      if (Number.isInteger(e)) {
        stack.push(e);
      } else {
        // operation
        if (this.verbose) {
          console.log('operation', e);
        }

        const [n, op] = this._ops[e];
        const args = [];
        for (let i = 0; i < n; i++) {
          args.push(stack.pop());
        }
        args.reverse();

        // perform operation
        // concatenate number1+operator+number2 as string
        // number1/2 sorted in lexicographic order
        const s1 = String(args[0]);
        const s2 = String(args[1]);
        if (op === '+' || op === '*') {
          if (s1 < s2) {
            res = s1 + op + s2;
          } else {
            res = s2 + op + s1;
          }
        } else {
          res = s1 + op + s2;
        }
        res = '(' + res + ')';

        // udpate stack
        stack.push(res);
      }
      if (this.verbose) {
        console.log('stack', stack);
      }
    }
    res = res.slice(1, -1);
    return res;
  }
}

export { SequenceSignature };

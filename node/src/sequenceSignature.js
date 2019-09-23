class SequenceSignature {
  constructor({ verbose }) {
    this.verbose = verbose;
  }

  stringifyWithoutSpecialCase(obj) {
    const { op, leafs } = obj;

    if (leafs.length === 1 && Number.isInteger(+leafs[0])) {
      // single int
      return leafs[0];
    } else if (op === '+' || op === '*') {
      // add and mult case
      const leafs2 = leafs.slice();
      leafs2.sort();
      return '(' + leafs2.join(op) + ')';
    }
    // non commutative default
    // sub and div case
    return '(' + leafs.join(op) + ')';
  }

  stringify(obj) {
    const { op, leafs } = obj;

    if (leafs.length === 1 && Number.isInteger(+leafs[0])) {
      // single int
      return leafs[0];
    } else if (op === '*') {
      // mult case
      const leafs2 = leafs.slice();
      leafs2.sort();
      return '(' + leafs2.join(op) + ')';
    } else if (op === '+') {
      // add case - incl. sub case due to special case
      const leafsMinus = leafs.filter(e => e.startsWith('-'));
      const leafsPlus = leafs.filter(e => !e.startsWith('-'));

      const leafsMinus2 = leafsMinus.slice();
      leafsMinus2.sort();
      const leafsPlus2 = leafsPlus.slice();
      leafsPlus2.sort();

      return '(' + leafsPlus2.join('+') + leafsMinus2.join('') + ')';
    }
    // non commutative default
    // div case
    // sub case - outside special case
    return '(' + leafs.join(op) + ')';
  }

  run(seq) {
    if (this.verbose) {
      console.log('---sequence', seq);
    }

    const stack = [];
    let res, leafs, temp;

    for (let e of seq) {
      if (Number.isInteger(+e)) {
        stack.push(e);
      } else {
        // operation
        if (this.verbose) {
          console.log('operation', e);
        }
        let op = e;
        const args = [];
        args.push(stack.pop());
        args.push(stack.pop());
        args.reverse();

        temp = args[0];
        const obj1 = Number.isInteger(+temp)
          ? { op: null, leafs: [temp] }
          : temp;

        temp = args[1];
        const obj2 = Number.isInteger(+temp)
          ? { op: null, leafs: [temp] }
          : temp;

        // special case: -int is like +(-int)
        if (op === '-' && obj2.op === null) {
          op = '+';
          obj2.leafs[0] = '-' + obj2.leafs[0];
        }

        // various cases
        if (op === '+' || op === '*') {
          if (op === obj1.op && op === obj2.op) {
            // flatten tree with left and right branch
            leafs = [...obj1.leafs, ...obj2.leafs];
            // leafs.sort();
          } else if (op === obj1.op) {
            // flatten tree with left branch
            leafs = [...obj1.leafs, this.stringify(obj2)];
            // leafs.sort();
          } else if (op === obj2.op) {
            // flatten tree with right branch
            leafs = [this.stringify(obj1), ...obj2.leafs];
            // leafs.sort();
          } else {
            // no flatten
            leafs = [this.stringify(obj1), this.stringify(obj2)];
          }
        } else {
          // no flatten
          leafs = [this.stringify(obj1), this.stringify(obj2)];
        }
        res = { op, leafs };

        // udpate stack
        stack.push(res);
      }
      if (this.verbose) {
        console.log('stack', stack);
      }
    }
    res = this.stringify(res).slice(1, -1);
    return res;
  }
}

export { SequenceSignature };

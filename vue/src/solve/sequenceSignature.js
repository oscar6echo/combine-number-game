class SequenceSignature {
  constructor({ verbose }) {
    this.verbose = verbose;
  }

  isCommutativeAndAssociative(op) {
    if (op === '+' || op === '*') return true;
    return false;
  }

  stringify(obj) {
    const { op, leafs } = obj;

    if (leafs.length === 1 && Number.isInteger(+leafs[0])) return leafs[0];

    if (this.isCommutativeAndAssociative(op)) {
      const leafs2 = leafs.slice();
      leafs2.sort();
      return '(' + leafs2.join(op) + ')';
    }
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
        const op = e;
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

        // various cases
        if (this.isCommutativeAndAssociative(op)) {
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

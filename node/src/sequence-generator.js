import { permute, combine, cartesian } from './combinatorics';

class SequenceGenerator {
  constructor({ numbers, verbose = false }) {
    this.numbers = numbers;
    this.ops = ['+', '-', '*', '/'];
    this.verbose = verbose;
  }
  *run(pattern) {
    const permNb = Array.from(permute(this.numbers));
    const permOp = Array.from(
      combine({
        arr: this.ops,
        size: this.numbers.length - 1,
        order: true
      })
    );
    const g = cartesian(permNb, permOp);

    if (this.verbose) {
      const a = this.numbers.length;
      const b = this.ops.length;
      console.log(`pattern = ${pattern}`);
      console.log(`nb perm ${a} numbers = ${permNb.length}`);
      console.log(`nb perm ${a - 1} ops (from ${b}}) = ${permOp.length}`);
    }

    const seq = [];
    let idx_n, idx_o, e, i;
    for (let [nbs, ops] of g) {
      idx_n = 0;
      idx_o = 0;
      for ([i, e] of Array.from(pattern).entries()) {
        if (e === 'x') {
          seq[i] = nbs[idx_n];
          idx_n++;
        } else {
          seq[i] = ops[idx_o];
          idx_o++;
        }
      }
      yield seq;
    }
  }
}

export { SequenceGenerator };

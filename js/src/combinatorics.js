const cartesian = function* cartesian(...sets) {
  function* cartesianSub(idx) {
    if (idx === sets.length) {
      yield data.slice();
      return;
    }
    for (let i = 0; i < sets[idx].length; i++) {
      data[idx] = sets[idx][i];
      yield* cartesianSub(idx + 1);
    }
  }

  const that = this;
  const data = [];
  yield* cartesianSub(0);
};

const combine = function*({ arr, size, order = false }) {
  function* combineUtil(start, idx) {
    if (idx === size) {
      yield data.slice();
      return;
    }
    for (let i = start; i < arr.length; i++) {
      data[idx] = arr[i];
      if (order) yield* combineUtil(0, idx + 1);
      else yield* combineUtil(i + 1, idx + 1);
    }
  }

  const that = this;
  const data = [];
  yield* combineUtil(0, 0);
};

const permute = function*(arr) {
  function swap(arr, i, j) {
    // beware: no check
    let temp = arr[j];
    arr[j] = arr[i];
    arr[i] = temp;
  }

  function* permuteSub(idx) {
    if (idx === size) {
      yield arr.slice();
      return;
    }

    for (let j = idx; j < size; j++) {
      swap(arr, idx, j);
      yield* permuteSub(idx + 1);
      swap(arr, idx, j);
    }
  }

  const size = arr.length;
  yield* permuteSub(0);
};

const listBinaryTree = function({ n, repr = 'postfix' }) {
  // n operands, n-1 operations
  const patterns = [];
  let left, right, l, r, i;
  if (n == 1) {
    patterns.push(['x']);
  } else {
    for (i = 1; i < n; i++) {
      left = listBinaryTree({ n: i, repr });
      right = listBinaryTree({ n: n - i, repr });
      for ([l, r] of cartesian(left, right)) {
        if (repr == 'postfix') {
          patterns.push([l + r + 'o']);
        } else if (repr == 'parenth') {
          patterns.push(['(' + l + 'o' + r + ')']);
        }
      }
    }
  }
  return patterns.map(e => e[0]);
};

export { cartesian, combine, permute, listBinaryTree };

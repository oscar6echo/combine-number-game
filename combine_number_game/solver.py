

import operator

import itertools as it

from timeit import default_timer as timer

class Solver:
    """
    """

    def __init__(self,
                 target=None,
                 numbers=None,
                 verbose=False,
                 ):
        """
        """
        self.ops = ['+', '-', '*', '/']
        self._ops = {
            '+': (2, operator.add),
            '-': (2, operator.sub),
            '*': (2, operator.mul),
            '/': (2, operator.truediv),
        }

        msg = 'target must be an int'
        assert isinstance(target, int), msg

        msg = 'numbers must be a list of int'
        assert isinstance(numbers, list), msg
        for e in numbers:
            assert isinstance(e, int), msg

        self.target = target
        self.numbers = numbers
        self.verbose = verbose

        self.patterns = [e for e in self.gen_all_binary_tree(len(self.numbers))]

    def gen_all_binary_tree(self,
                            n):
        """
        n operands, n-1 operations
        """
        if n == 1:
            yield 'x'

        for i in range(1, n):
            left = self.gen_all_binary_tree(i)
            right = self.gen_all_binary_tree(n-i)
            for l, r in it.product(left, right):
                # yield '('+l+'o'+r+')'
                yield l+r+'o'

    def gen_sequence(self, pattern):
        """
        """
        perm_nb = it.permutations(self.numbers)
        perm_op = it.product(self.ops, repeat=len(self.numbers)-1)
        g = it.product(perm_nb, perm_op)

        for nbs, ops in g:
            seq = []
            idx_n = 0
            idx_o = 0
            for e in pattern:
                if e == 'x':
                    seq.append(nbs[idx_n])
                    idx_n += 1
                else:
                    seq.append(ops[idx_o])
                    idx_o += 1
            yield seq

    def eval_sequence(self,
                      seq,
                      target=None,
                      verbose=False):
        """
        """
        if self.verbose or verbose:
            print('>>>', seq)

        stack = []
        for e in seq:
            if isinstance(e, int):
                stack.append(e)
            else:
                if self.verbose or verbose:
                    print(e)

                n, op = self._ops[e]
                args = stack[-n:]

                if e == '/' and args[1] == 0:
                    return False,  'div by zero'

                res = op(*args)

                if e == '/':
                    if args[0] % args[1] != 0:
                        return False,  'not int division'
                else:
                    res = int(res)

                stack[-n:] = [res]

                if target and res == target:
                    return True, target

            if self.verbose or verbose:
                print(stack)

        return True, stack[-1]

    def solve(self, n_max=None):
        """
        """
        t0 = timer()

        results = []
        solutions = []

        for p in self.patterns:
            g = self.gen_sequence(p)

            if n_max:
                g = it.islice(g, n_max)

            for seq in g:
                res = self.eval_sequence(seq)
                if res[0]:
                    results.append(res[1])
                    if res[1] == self.target:
                        solutions.append(seq)

                if self.verbose:
                    print('---', res)

        self.results = results
        self.solutions = solutions
        
        t1 = timer()
        self.time = t1 - t0

    def show_results(self):
        """
        """
        print(f'run time = {self.time:.2f} s')
        print(f'nb valid sequences = {len(self.results)}')
        print(f'nb solutions = {len(self.solutions)}')
        if len(self.solutions):
            for k, e in enumerate(self.solutions):
                k, print(e)

    def inspect_solution(self, n):
        """
        """
        return self.eval_sequence(self.solutions[n], verbose=True)



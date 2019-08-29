

import operator

import itertools as it



class Solver:
    """
    """

    def __init__(self,
                 target=None,
                 numbers=None,
                 ):
        """
        """
        self.ops = ['+', '-', '*', '/']
        self._ops = {
            '+': (2, operator.add),
            '-': (2, operator.sub),
            '*': (2, operator.mul),
            '/': (2, operator.truediv),
            # '%': (2, operator.mod),
        }

        msg = 'target must be an int'
        assert isinstance(target, int), msg

        msg = 'numbers must be a list of int'
        assert isinstance(numbers, list), msg
        for e in numbers:
            assert isinstance(e, int), msg

        self.target = target
        self.numbers = numbers

        self.patterns = [e for e in self.gen_all_binary_tree(len(self.numbers))]

    def gen_all_binary_tree(self, n):
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

    def eval_sequence(self, seq, target=None):
        """
        """
        stack = []

        for e in seq:
            # print(e)
            # print(type(e))
            # print(isinstance(e, int))

            if isinstance(e, int):
                # print('w1')
                stack.append(e)
                # print(stack)
            else:
                # print('w2')
                n, op = self._ops[e]
                # print(n, e)
                # stack.append(op)
                # if n > len(stack):
                #     return False,  'too few values in stack'
                args = stack[-n:]
                res = op(*args)
                if op == '/':
                    if args[0] % args[1] != 0:
                        return False,  'not int division'
                else:
                    res = int(res)
                if target and res == target:
                    return True, target
                # print(args)
                # print(stack)
                stack[-n:] = [res]
                print(stack)

        return True, stack[-1]

    def solve(self):
        """
        """
        c = 0
        results = []
        solutions = []

        for p in self.patterns:
            g = self.gen_sequence(p)
            g2 = it.islice(g, 3)

            for seq in g2:
                print('>>>', seq)
                res = self.eval_sequence(seq)
                if res[0]:
                    print('----', res)
                    c += 1
                    results.append(res[1])



        self.c = c
        self.results = results
        self.solutions = solutions


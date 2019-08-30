
import operator

import itertools as it
import pandas as pd
import seaborn as sns


from IPython.display import display

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
                
                # print(res, type(res))

                if e == '/':
                    if args[0] % args[1] != 0:
                        return False,  'not int division'
                    else:
                        res = int(res)

                # print(res, type(res))

                stack[-n:] = [res]

                if target and res == target:
                    return True, target

                if isinstance(res, float):
                    raise Exception('wrong type')

            if self.verbose or verbose:
                print(stack)

        return True, stack[-1]

    def solve(self,
              n_max_per_pattern=None,
              close=10,
              stop_at_solution=None):
        """
        """
        t0 = timer()

        nb_res = 0
        close_results = []
        solutions = []

        print(f'nb binary trees = {len(self.patterns)}')

        for k, p in enumerate(self.patterns):
            print(f'{k}', end=' ')
            g = self.gen_sequence(p)

            if n_max_per_pattern:
                g = it.islice(g, n_max_per_pattern)

            for seq in g:
                res = self.eval_sequence(seq)
                if res[0]:
                    nb_res += 1
                    if abs(res[1]-self.target) <= close:
                        d = {
                            'pattern': k,
                            'sequence': seq,
                            'value': res[1],
                        }
                        close_results.append(d)
                        if res[1] == self.target:
                            solutions.append(d)

                    if stop_at_solution and len(solutions) == stop_at_solution:
                        break

                if self.verbose:
                    print('---', res)

            if stop_at_solution and len(solutions) == stop_at_solution:
                break
        print('')

        t1 = timer()
        self.time = t1 - t0

        self.nb_res = nb_res
        self.close_results = close_results
        self.solutions = solutions

        self.df_res = pd.DataFrame(self.close_results)

    def show_results(self):
        """
        """
        print(f'run time = {self.time:.2f} s')
        print(f'nb valid sequences = {self.nb_res:,}')
        print(f'nb solutions = {len(self.solutions):,}')
        if len(self.solutions):
            for k, e in enumerate(self.solutions):
                k, print(e)

    def inspect_solution(self, n):
        """
        """
        return self.eval_sequence(self.solutions[n]['sequence'],
                                  verbose=True)

    def stats_results(self):
        """
        """
        min_ = self.df_res['value'].min()
        max_ = self.df_res['value'].max()

        dic = {k: 0 for k in range(min_, max_+1)}
        for e in self.close_results:
            v = e['value']
            dic[v] = dic[v] + 1

        dfh = pd.DataFrame(data=[[k, dic[k]] for k in dic.keys()],
                           columns=['value', 'nb hits'])
        dfh = dfh.set_index('value')

        c1, c2 = ["#9b59b6", "#3498db"]
        c1, c2 = ["red", "#3498db"]
        idx = self.target - min_
        color = [[c2 if e != idx else c1
                    for e in range(len(dfh))]]
        with sns.axes_style("darkgrid"):
            ax = dfh.plot(kind='bar',
                            width=0.85,
                            figsize=(12, 5),
                            color=color,
                            )
        # return ax

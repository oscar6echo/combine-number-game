
import os
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

        self.patterns_postfix = [e for e in self.gen_all_binary_tree(
            len(self.numbers),
            repr='postfix')]
        self.patterns_parenth = [e for e in self.gen_all_binary_tree(
            len(self.numbers),
            repr='parenth')]

        data = [[a, b] for (a, b) in zip(self.patterns_parenth,
                                         self.patterns_postfix)]
        self.df_pattern = pd.DataFrame(data, columns=['parenth', 'postfix'])

    def gen_all_binary_tree(self,
                            n,
                            repr='postfix'):
        """
        n operands, n-1 operations
        """
        if n == 1:
            yield 'x'

        for i in range(1, n):
            left = self.gen_all_binary_tree(i, repr=repr)
            right = self.gen_all_binary_tree(n-i, repr=repr)
            for l, r in it.product(left, right):
                if repr == 'postfix':
                    yield l+r+'o'
                else:
                    yield '('+l+'o'+r+')'

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

    @staticmethod
    def stringify_without_special_case(obj):
        """
        """
        if obj.get('leafs') and len(obj.get('leafs')) == 1:
            return obj.get('leafs')[0]

        op = obj['op']
        leafs = [str(e) for e in obj['leafs']]

        if (op == '+' or op == '*'):
            leafs = sorted(leafs[:])

        return '(' + op.join(leafs) + ')'

    @staticmethod
    def stringify(obj):
        """
        """
        if obj.get('leafs') and len(obj.get('leafs')) == 1:
            # single int
            return obj.get('leafs')[0]

        op = obj['op']
        leafs = [str(e) for e in obj['leafs']]

        if (op == '*'):
            # mult case
            leafs = sorted(leafs[:])
            return '(' + op.join(leafs) + ')'
        elif (op == '+'):
            # add case - incl. sub case due to special case
            leafsMinus = [e for e in leafs if e.startswith('-')]
            leafsPlus = [e for e in leafs if not e.startswith('-')]

            leafsMinus = sorted(leafsMinus[:])
            leafsPlus = sorted(leafsPlus[:])

            return '(' + '+'.join(leafsPlus) + ''.join(leafsMinus) + ')'

        # non commutative default
        # div case
        # sub case - outside special case
        return '(' + op.join(leafs) + ')'

    def get_signature_sequence(self,
                               seq,
                               verbose=False):
        """
        """
        if self.verbose or verbose:
            print('>>>', seq)

        stack = []
        for k, e in enumerate(seq):
            if isinstance(e, int):
                stack.append(e)
            else:
                # operation
                if self.verbose or verbose:
                    print(e)

                op = e
                args = stack[-2:]

                temp = args[0]
                obj1 = {'op': None, 'leafs': [temp]} if isinstance(temp, int) else temp
                temp = args[1]
                obj2 = {'op': None, 'leafs': [temp]} if isinstance(temp, int) else temp

                # special case
                if (op == '-' and obj2['op'] is None):
                    op = '+'
                    obj2['leafs'][0] = '-' + str(obj2['leafs'][0])

                # various cases
                if (op == '+' or op == '*'):
                    if op == obj1['op'] and op == obj2['op']:
                        # flatten tree with left and right branches
                        leafs = obj1['leafs']+obj2['leafs']
                    elif op == obj1['op']:
                        # flatten tree with left branch
                        leafs = obj1['leafs']+[Solver.stringify(obj2)]
                    elif op == obj2['op']:
                        # flatten tree with right branch
                        leafs = [Solver.stringify(obj1)]+obj2['leafs']
                    else:
                        # no flatten
                        leafs = [Solver.stringify(obj1)]+[Solver.stringify(obj2)]
                else:
                    # no flatten
                    leafs = [Solver.stringify(obj1)]+[Solver.stringify(obj2)]

                res = {'op': op, 'leafs': leafs}

                # udpate stack
                stack[-2:] = [res]

            if self.verbose or verbose:
                print(stack)

        res = Solver.stringify(res)[1:-1]
        return res

    def eval_sequence(self,
                      seq,
                      target=None,
                      verbose=False):
        """
        """
        if self.verbose or verbose:
            print('>>>', seq)

        stack = []
        for k, e in enumerate(seq):
            if isinstance(e, int):
                stack.append(e)
            else:
                # operation
                if self.verbose or verbose:
                    print(e)

                n, op = self._ops[e]
                args = stack[-n:]

                # division specific
                if e == '/' and args[1] == 0:
                    return False, 'div by zero', None

                # perform operation
                res = op(*args)

                # division specific
                if e == '/':
                    if args[0] % args[1] != 0:
                        return False, 'not int division', None
                    else:
                        res = int(res)

                # update stack
                stack[-n:] = [res]

                # early hit
                if target and res == target:
                    # keep only used numbers and ops in stack
                    seq2 = seq[:k+1]
                    nb_o = len([e for e in seq2 if isinstance(e, str)])
                    nb_x = nb_o + 1
                    c = len(seq2)-1
                    q = 0
                    while q < nb_x:
                        if isinstance(seq2[c], int):
                            q += 1
                        c -= 1

                    return True, res, seq2[c+1:]

            if self.verbose or verbose:
                print(stack)

        return True, stack[-1], seq

    def solve(self,
              n_max_per_pattern=None,
              target_range=5,
              stop_at_solution=None):
        """
        """
        t0 = timer()

        nb_res = 0
        results = []
        solutions = []

        print(f'nb binary trees = {len(self.patterns_postfix)}')

        for k, p in enumerate(self.patterns_postfix):
            print(f'{k}', end=' ')
            g = self.gen_sequence(p)

            if n_max_per_pattern:
                g = it.islice(g, n_max_per_pattern)

            for seq in g:
                res = self.eval_sequence(seq, target=self.target)
                if res[0]:
                    nb_res += 1
                    if abs(res[1]-self.target) <= target_range:
                        d = {
                            'pattern': k,
                            'sequence': tuple(res[2]),
                            'value': res[1],
                        }
                        results.append(d)
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
        self.results = results
        self.solutions = solutions

        df = pd.DataFrame(self.results)
        df = df.drop_duplicates(subset='sequence').reset_index(drop=True)
        df['signature'] = df['sequence'].map(lambda x: self.get_signature_sequence(x))
        df = df.drop_duplicates(subset='signature').reset_index(drop=True)
        df['miss'] = df['value'] - self.target
        df['abs_miss'] = df['miss'].abs()
        df['length'] = df['sequence'].apply(lambda x: int((len(x)+1)/2))
        df = df.drop('pattern', axis=1)
        df = df.sort_values(['length', 'abs_miss']).reset_index(drop=True)
        df = df.drop('abs_miss', axis=1)
        df = df[['signature', 'value', 'length', 'sequence', 'miss']]
        self.df_res = df

        df = self.df_res[self.df_res['value'] == self.target]
        self.df_sol = df

    def show_results(self):
        """
        """
        print(f'run time = {self.time:.2f} s')
        print(f'nb valid sequences = {self.nb_res:,}')
        print(f'nb close results = {len(self.df_res):,}')
        print(f'nb solutions = {len(self.df_sol):,}')
        if self.solutions:
            display(self.df_sol)

    def stats_results(self):
        """
        """
        min_ = self.df_res['value'].min()
        max_ = self.df_res['value'].max()

        dic = {k: 0 for k in range(min_, max_+1)}
        for e in self.df_res.to_dict(orient='records'):
            v = e['value']
            dic[v] = dic[v] + 1

        dfh = pd.DataFrame(data=[[k, dic[k]] for k in dic.keys()],
                           columns=['value', 'nb solutions'])
        dfh = dfh.set_index('value')

        c1, c2 = ["#9b59b6", "#3498db"]
        c1, c2 = ["red", "#3498db"]
        idx = self.target - min_
        color = [[c2 if e != idx else c1
                  for e in range(len(dfh))]]
        with sns.axes_style("darkgrid"):
            ax = dfh.plot(
                kind='bar',
                width=0.85,
                figsize=(12, 5),
                color=color,
            )

    def show_patterns(self):
        """
        """
        print(f'#\tparenthesis\t\tpostfix')
        print('-'*45)
        for k, r in self.df_pattern.iterrows():
            print(f'{k}\t{r.parenth}\t{r.postfix}')

    def store(self):
        """
        """
        folder = 'output'
        if not os.path.exists(folder):
            os.makedirs(folder)

        path = os.path.join(folder, 'df_patterns.csv')
        self.df_pattern.to_csv(path, index=None)
        print(f'saved patterns as {path}')

        path = os.path.join(folder, 'df_solutions.csv')
        self.df_sol.to_csv(path, index=None)
        print(f'saved solutions as {path}')

        path = os.path.join(folder, 'df_results.csv')
        self.df_res.to_csv(path, index=None)
        print(f'saved results as {path}')

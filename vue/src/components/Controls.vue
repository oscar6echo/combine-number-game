<template>
  <v-container class="grey lighten-5">
    <v-row>
      <v-col cols="6">
        <v-card class="mx-auto">
          <v-card-title>Rules</v-card-title>
          <v-card-text class="subtitle-1">
            Using only the 4 arithmetic operations add (
            <span class="font-weight-black">+</span>), subtract (
            <span class="font-weight-black">-</span>), multiply (
            <span class="font-weight-black">x</span>) and divide (
            <span class="font-weight-black">/</span>), try and combine all of
            some of the NbInt=
            <span class="font-weight-black">{{ nbInt }}</span>
            integers available to reach the Target=
            <span class="font-weight-black">{{ target }}</span>
            or get as close as possible.
          </v-card-text>
        </v-card>
      </v-col>
      <v-col cols="3">
        <v-card class="mx-auto">
          <v-row>
            <v-col cols="6">
              <v-card-text class="subtitle-1 text-right py-0 my-0"
                >Target</v-card-text
              >
            </v-col>
            <v-col cols="4">
              <integer-input
                name="target"
                myClass="py-0 my-0"
                v-model="target"
                min="0"
                max="1000"
              />
            </v-col>
          </v-row>
          <v-row>
            <v-col cols="6">
              <v-card-text class="subtitle-1 text-right py-0 my-0"
                >Target Range</v-card-text
              >
            </v-col>
            <v-col cols="3">
              <integer-input
                name="targetRange"
                myClass="py-0 my-0"
                v-model="targetRange"
                min="0"
                max="10"
              />
            </v-col>
          </v-row>
          <v-row>
            <v-col cols="6">
              <v-card-text class="subtitle-1 text-right py-0 my-0"
                >NbInt</v-card-text
              >
            </v-col>
            <v-col cols="3">
              <integer-input
                name="nbInt"
                myClass="py-0 my-0"
                v-model="nbInt"
                min="3"
                max="9"
              />
            </v-col>
          </v-row>
        </v-card>
      </v-col>
      <v-col cols="3">
        <v-card class="mx-auto">
          <v-row>
            <v-col cols="12">
              <v-card-text
                v-if="stopAtSolBool"
                class="subtitle-1 text-center py-0 my-0"
              >
                Search for
                <span class="font-weight-black">{{ stopAtSolution }}</span>
                solutions
              </v-card-text>
              <v-card-text
                v-if="!stopAtSolBool"
                class="subtitle-1 text-center py-0 my-0"
              >
                Search for
                <span class="font-weight-black">All</span>
                solutions
              </v-card-text>
            </v-col>
          </v-row>

          <v-row>
            <v-col cols="4" />
            <v-col cols="4">
              <v-switch
                hide-details
                single-line
                class="py-0 my-0"
                color="indigo"
                v-model="stopAtSolBool"
              ></v-switch>
            </v-col>
          </v-row>
          <v-row>
            <v-col cols="3" />
            <v-col cols="5">
              <integer-input
                myClass="py-0 my-0"
                v-model="stopAtSolution"
                v-bind:solo="true"
                v-bind:disabled="!stopAtSolBool"
                min="1"
                max="100"
              />
            </v-col>
          </v-row>
        </v-card>
      </v-col>
    </v-row>
    <v-row>
      <v-col cols="12">
        <v-card>
          <v-row class align="end" justify="space-around">
            <v-text-field
              v-for="(nb, idx) in numbers"
              :id="'number-' + idx"
              :key="idx"
              solo
              hide-details
              single-line
              class="px-1 mx-1 py-1 my-1 number-input"
              type="number"
              :min="Nmin"
              :max="Nmax"
              step="1"
              v-model.number="numbers[idx]"
            />
          </v-row>
          <v-row align="center" justify="center">
            <v-btn class="ma-2" tile dark color="blue-grey" @click="shuffle">
              <v-icon left>mdi-dice-multiple</v-icon>Shuffle
            </v-btn>
            <v-btn class="ma-2" tile dark color="indigo" @click="solve">
              <v-icon left>mdi-cached</v-icon>Solve
            </v-btn>
          </v-row>
        </v-card>
      </v-col>
    </v-row>

    <v-row>
      <v-col cols="12">
        <v-expansion-panels inset>
          <v-expansion-panel>
            <v-expansion-panel-header class="title"
              >Playground</v-expansion-panel-header
            >
            <v-expansion-panel-content>
              <v-card class="mx-auto" color="grey lighten-5">
                <v-text-field
                  solo
                  :rules="[rules.validChars]"
                  class="mx-auto py-2 my-1 playground"
                  label="Input expression"
                  hint="e.g. (2+3)*(10/2)-1"
                  v-model="playgroundExpr"
                ></v-text-field>
              </v-card>
            </v-expansion-panel-content>
          </v-expansion-panel>
          <v-expansion-panel>
            <v-expansion-panel-header class="title"
              >Logs</v-expansion-panel-header
            >
            <v-expansion-panel-content>TBD</v-expansion-panel-content>
          </v-expansion-panel>
          <v-expansion-panel>
            <v-expansion-panel-header class="title"
              >Solutions</v-expansion-panel-header
            >
            <v-expansion-panel-content>TBD</v-expansion-panel-content>
          </v-expansion-panel>
          <v-expansion-panel>
            <v-expansion-panel-header class="title"
              >Results</v-expansion-panel-header
            >
            <v-expansion-panel-content>TBD</v-expansion-panel-content>
          </v-expansion-panel>
        </v-expansion-panels>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import IntegerInput from './integerInput';
import Solver from '../solve/solver';

export default {
  components: {
    'integer-input': IntegerInput
  },
  data() {
    return {
      //   target: 355,
      //   nbInt: 6,
      //   numbers: [3, 3, 4, 6, 7, 9],
      target: 25,
      nbInt: 4,
      numbers: [2, 3, 4, 5],
      targetRange: 3,
      stopAtSolution: 20,
      stopAtSolBool: true,
      Nmax: 100,
      Nmin: 1,
      playgroundExpr: '',
      rules: {
        validChars: v => {
          //   console.log(
          //     v,
          //     this.filterExpr(v),
          //     this.filterExpr(v).length !== v.length
          //   );
          return (
            this.filterExpr(v).length === v.length ||
            'Only characters 0-9 +-*/ () are valid'
          );
        }
      }
    };
  },
  computed: {
    labelStopAt() {
      return `Stop after ${this.stopAtSolution} solutions`;
    }
  },
  watch: {
    nbInt: function() {
      if (this.numbers.length > this.nbInt) {
        this.numbers = this.numbers.slice(0, this.nbInt);
      } else if (this.numbers.length < this.nbInt) {
        const numbers = this.numbers.slice();
        for (let i = this.numbers.length; i < this.nbInt; i++) {
          numbers.push(0);
        }
        this.numbers = numbers.slice();
      }
    },
    numbers: {
      handler: function() {
        for (let [i, e] of this.numbers.entries()) {
          this.numbers[i] = Math.round(e);

          const that = this;
          setTimeout(() => {
            document.getElementById('number-' + i).value = that.numbers[i];
          }, 0);
        }
      },
      deep: true
    },
    playgroundExpr: function(expr) {
      console.log('----');
      console.log(expr);
      const filtered = this.filterExpr(expr);
      console.log(filtered);
      //   console.log(eval(filtered));
      const regExp = /(\([^())]+\))/g;

      const matches = filtered.match(regExp);
      console.log(matches);

      console.log('start');
      var s = filtered;

      //   var re = /\s*([^[:]+):\"([^"]+)"/g;
      var re = regExp;
      var m;
      while ((m = re.exec(s))) {
        console.log(m[1], m[2]);
        console.log(m);
      }
      console.log('end');
      //   let m;
      //   do {
      //     const m = regExp.exec(filtered);
      //     if (m) {
      //       console.log(m[1], m[2]);
      //       console.log(m);
      //     }
      //   } while (m);
    }
  },
  created: function() {
    // this.shuffle();
  },
  methods: {
    shuffle: function() {
      this.numbers = [];
      for (let i = 0; i < this.nbInt; i++) {
        this.numbers[i] = 1 + Math.floor(Math.random() * 15);
      }
    },
    filterExpr: function(expr) {
      return expr.replace(/[^0-9+-/()\\*]+/g, '');
    },
    solve: function() {
      console.log('start solve');
      if (window.Worker) {
        const solver = new Solver({
          numbers: this.numbers,
          target: this.target,
          targetRange: this.targetRange,
          stopAtSolution: this.stopAtSolution,
          verbose: false
        });
        solver.run();
      } else {
        alert('Your browser does not support Web Workers');
      }
    }
  }
};
</script>

<style scoped>
.number-input {
  max-width: 80px;
}

.playground {
  max-width: 350px;
}
</style>

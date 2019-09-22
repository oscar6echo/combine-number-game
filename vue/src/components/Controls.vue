<template>
  <v-container class="grey lighten-5">
    <v-row>
      <v-col cols="6">
        <v-card class="mx-auto">
          <v-card-title>Rules</v-card-title>
          <v-card-text class="subtitle-1">
            Using only the 4 arithmetic operations add (<span
              class="font-weight-black"
              >+</span
            >), subtract (<span class="font-weight-black">-</span>), multiply
            (<span class="font-weight-black">x</span>) and divide (<span
              class="font-weight-black"
              >/</span
            >), try and combine all of some of the NbInt=<span
              class="font-weight-black"
              >{{ nbInt }}</span
            >
            integers available to reach the Target=<span
              class="font-weight-black"
              >{{ target }}</span
            >
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
                >Search for
                <span class="font-weight-black">{{ stopAtSolution }}</span>
                solutions</v-card-text
              >
              <v-card-text
                v-if="!stopAtSolBool"
                class="subtitle-1 text-center py-0 my-0"
                >Search for
                <span class="font-weight-black">All</span>
                solutions</v-card-text
              >
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
          <v-row class="" align="end" justify="space-around">
            <v-text-field
              v-for="(nb, idx) in numbers"
              :key="idx"
              solo
              hide-details
              single-line
              class="px-1 mx-1 py-1 my-1 number-input"
              type="number"
              min="0"
              max="100"
              step="1"
              v-model="numbers[idx]"
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
      Nmin: 1
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
        for (let i = this.numbers.length; i < this.nbInt; i++) {
          this.numbers.push(0);
        }
      }
    },
    numbers: {
      handler: function(nbs) {
        for (let [i, e] of nbs.entries()) {
          let vNb = +e;
          if (!Number.isInteger(vNb)) vNb = Math.round(vNb);
          if (vNb > +this.Nmax) vNb = +this.max;
          if (vNb < +this.Nmin) vNb = +this.min;

          this.numbers[i] = vNb;
        }
      },
      deep: true
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
  max-width: 70px;
}
</style>

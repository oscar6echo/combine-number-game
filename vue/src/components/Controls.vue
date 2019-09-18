<template>
  <v-container class="grey lighten-5">
    <v-row>
      <v-col cols="6">
        <v-card class="mx-auto">
          <v-card-title>Rules</v-card-title>
          <v-card-text class="subtitle-1"
            >Using only the 4 arithmetic operations add (<span
              class="font-weight-black"
              >+</span
            >), subtract (<span class="font-weight-black">-</span>), multiply
            (<span class="font-weight-black">x</span>) and divide (<span
              class="font-weight-black"
              >/</span
            >), try and combine all of some of the
            <span class="font-weight-black">{{ nbInt }}</span> integers
            available to reach the target
            <span class="font-weight-black">{{ target }}</span> or get as close
            as possible.
          </v-card-text>
        </v-card>
      </v-col>
      <v-col cols="6">
        <v-card class="mx-auto">
          <v-row>
            <v-col cols="6">
              <v-card-text class="subtitle-1 text-right py-0 my-0"
                >Target</v-card-text
              >
            </v-col>
            <v-col cols="3">
              <v-text-field class="py-0 my-0" type="number" v-model="target" />
            </v-col>
          </v-row>
          <v-row>
            <v-col cols="6">
              <v-card-text class="subtitle-1 text-right py-0 my-0"
                >Number of Integers</v-card-text
              >
            </v-col>
            <v-col cols="3">
              <v-text-field
                class="py-0 my-0"
                type="number"
                min="3"
                max="10"
                step="1"
                v-model="nbInt"
              />
            </v-col>
          </v-row>
        </v-card>
      </v-col>
    </v-row>
    <v-row>
      <v-col cols="12">
        <v-card class="mx-auto">
          <v-row>
            <v-col cols="12"> </v-col>

            <v-text-field
              v-for="(nb, idx) in numbers"
              solo
              class="px-auto mx-auto py-0 my-0 number-input"
              type="number"
              min="0"
              max="100"
              step="1"
              v-model="numbers[idx]"
              :key="idx"
            />
          </v-row>
          <v-row>
            <div class="mx-auto">
              <v-btn class="ma-2" tile dark color="blue-grey" @click="shuffle">
                <v-icon left>mdi-dice-multiple</v-icon> Shuffle
              </v-btn>
              <v-btn class="ma-2" tile dark color="indigo" @click="solve">
                <v-icon left>mdi-cached</v-icon> Solve
              </v-btn>
            </div>
          </v-row>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
export default {
  data() {
    return {
      target: 355,
      nbInt: 6,
      numbers: []
    };
  },
  watch: {
    nbInt: function(v) {
      if (!Number.isInteger(+v)) {
        this.nbInt = Math.round(+v);
      }
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
          if (!Number.isInteger(+e)) {
            this.numbers[i] = Math.round(+e);
          }
        }
      },
      deep: true
    }
  },
  created: function() {
    this.shuffle();
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
    }
  }
};
</script>

<style scoped>
.number-input {
  max-width: 70px;
}
</style>

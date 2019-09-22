<template>
  <v-text-field
    :class="myClass"
    hide-details
    single-line
    :solo="solo"
    :disabled="disabled"
    type="number"
    :min="min"
    :max="max"
    step="1"
    v-model="localVal"
  />
</template>

<script>
export default {
  props: {
    myClass: String,
    min: String,
    max: String,
    solo: Boolean,
    disabled: Boolean,
    value: Number
  },
  data() {
    return {
      localVal: 4
    };
  },
  computed: {},
  watch: {
    value: {
      handler: function() {
        console.log('update');
        this.localVal = Math.round(this.value);
      },
      immediate: true
    },
    localVal: function(v) {
      let vNb = +v;
      if (!Number.isInteger(vNb)) vNb = Math.round(vNb);
      if (vNb > +this.max) vNb = +this.max;
      if (vNb < +this.min) vNb = +this.min;

      this.localVal = vNb;
      console.log(typeof vNb, Number.isInteger(vNb), vNb, this.localVal);
      this.$emit('input', vNb);
    }
  },
  methods: {},
  created() {}
};
</script>

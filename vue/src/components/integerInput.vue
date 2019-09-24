<template>
  <v-text-field
    :id="'number-' + name"
    :class="myClass"
    hide-details
    single-line
    :solo="solo"
    :disabled="disabled"
    type="number"
    :min="min"
    :max="max"
    step="1"
    v-model.number="localVal"
  />
</template>

<script>
export default {
  props: {
    name: String,
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
        this.localVal = Math.round(this.value);
      },
      immediate: true
    },
    localVal: function(v) {
      this.localVal = Math.round(v);
      this.$emit('input', this.localVal);

      setTimeout(() => {
        document.getElementById('number-' + this.name).value = this.localVal;
      }, 0);
    }
  },
  methods: {},
  created() {}
};
</script>

<style scoped></style>

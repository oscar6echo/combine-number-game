<template>
  <!-- App.vue -->

  <v-app>
    <v-app-bar app color="blue accent-3" dark>
      <v-spacer></v-spacer>
      <v-toolbar-title>Combine Numbers Game</v-toolbar-title>
      <v-spacer></v-spacer>
      <a
        href="https://github.com/oscar6echo/combine-number-game"
        target="_blank"
        ><v-icon>mdi-github-circle</v-icon></a
      >
    </v-app-bar>

    <v-content>
      <Controls />
    </v-content>

    <v-footer app>
      <!-- -->
    </v-footer>
  </v-app>
</template>

<script>
import Controls from './components/Controls';

export default {
  name: 'App',
  components: {
    Controls
  },
  data() {
    return {};
  }
};
</script>

<template>
    <div id="right-tracks-section">
        <svCircos />
    </div>
  </template>
  
<script>
  import svCircos from './viz/svCircos.viz.vue';

  export default {
  name: "RightTracksSection",
  components: {
    svCircos
  },
  props: {
  },
  data () {
    return {
    }
  },
  mounted () {
  },
  methods: {
  },
  computed: {
  },
  watch: {
  },
  }
</script>

<style lang="sass">
  #right-tracks-section
    flex-grow: 1

</style>
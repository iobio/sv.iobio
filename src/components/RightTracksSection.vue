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
    padding-top: 10px
    padding-bottom: 10px
    flex-grow: 1
    flex-basis: 0
    height: 100%
    box-sizing: border-box

</style>
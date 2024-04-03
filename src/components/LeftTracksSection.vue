<template>
    <div id="left-tracks-section">
        <svCircos 
          :svList="svList"
          :zoomZone="selectedArea"
          @circos-zoom-event="circosZoomFired"/>
    </div>
  </template>
  
<script>
  import svCircos from './viz/svCircos.viz.vue';

  export default {
  name: "LeftTracksSection",
  components: {
    svCircos
  },
  props: {
    svList: Array,
    selectedArea: Object
  },
  data () {
    return {
    }
  },
  mounted () {
  },
  methods: {
    circosZoomFired(zoomZone) {
      this.$emit('circos-zoom-event', zoomZone)
    }
  },
  computed: {
  },
  watch: {
  },
  }
</script>

<style lang="sass">
  #left-tracks-section
    padding-top: 10px
    padding-bottom: 10px
    flex-grow: 1
    flex-basis: 0
    height: 100%
    box-sizing: border-box
    border: 1px solid #F5F5F5
    border-radius: 5px

</style>
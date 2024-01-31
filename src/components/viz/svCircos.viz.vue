<template>
    <div id="svCircos"></div>
</template>

<script>
import svCircos from '../../d3/svCircos.js'

export default {
  name: 'svCircos',
  components: {
  },
  props: {
  },
  data () {
    return {
    }
  },
  mounted () {
    this.drawCircos()
  },
  methods: {
    drawCircos() {
      let containerTag = '#svCircos';
      let svCircosChart = new svCircos();
      svCircosChart(containerTag)
    }
  }
}
</script>

<style lang="sass">
  #svCircos
    align-items: center
    border-radius: 5px
    border: 1px solid #ccc
    box-shadow: 0 0 10px #ccc
    box-sizing: border-box
    display: flex
    flex-direction: column
    height: 94%
    justify-content: center
    margin: 4% 10px 10px 10px
    padding: 10px
    width: 100%
</style>
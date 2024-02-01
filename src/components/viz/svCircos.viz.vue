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
    background-color: none
    border-radius: 5px
    border: none
    box-sizing: border-box
    display: flex
    flex-direction: column
    height: 92%
    justify-content: center
    margin: 3% 10px 10px 10px
    padding: 10px
    width: 100%
</style>
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
      vcfData: null,
    }
  },
  mounted () {
    fetch('../vcf.json')
      .then(response => response.json())
      .then(data => {
          this.vcfData = data;

          this.drawCircos()
      });

    this.resizeObserver = new ResizeObserver(() => {
    this.drawChromSelectBar()
    });

    this.resizeObserver.observe(document.getElementById('svCircos'));
  },
  beforeDestroy() {
    this.resizeObserver.unobserve(document.getElementById('svCircos'));
  },
  methods: {
    drawCircos() {
      let containerTag = '#svCircos';
      let svCircosChart = new svCircos();
      svCircosChart(containerTag, this.vcfData)
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
    height: 100%
    justify-content: center
    width: 100%
</style>
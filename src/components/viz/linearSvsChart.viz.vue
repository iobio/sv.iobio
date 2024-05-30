<template>
    <div class="linear-svs-chart"></div>
</template>

<script>
  import linearSvChart from '../../d3/linearSvChart.js';
export default {
  name: 'LinearSvsChart',
  components: {
  },
  props: {
    svList: Array,
    selectedArea: Object,
    chromosomes: Array,
  },
  data () {
    return {
    }
  },
  mounted () {
  },
  methods: {
    draw
  }
}
</script>

<style lang="scss">

</style>
<template>
    <div class="idiogram-scale-bar-viz" ref="idiogramScaleContainer"></div>
  </template>
  
  <script>
    import idiogramScaleBar from '../../d3/idoigramScaleBar.d3.js';

  export default {
  name: 'IdiogramScaleBarViz',
  components: {
  },
  props: {
    selectedArea: Object,
    bands: Array,
    centromeres: Array,
    chromosomes: Array,
  },
  data () {
    return {
        idogramScaleBarChart: null,
        resizeObserver: null,
      }
  },
  mounted () {
    //Will not load this component without chromosomes/required items
    this.resizeObserver = new ResizeObserver( () => {
        this.drawIdogramScaleBar();
    })

    let contToObserve = this.$refs.idiogramScaleContainer;
    this.resizeObserver.observe(contToObserve)
  },
  beforeDestroy() {
    if (this.resizeObserver) {
        let contToObserve = this.$refs.idiogramScaleContainer;
        this.resizeObserver.unobserve(contToObserve)
    }
  },
  methods: {
    drawIdogramScaleBar() {
      let container = this.$refs.idiogramScaleContainer;
      if (!container || !container.clientWidth) {
        return;
      }
      container.innerHTML = '';
  
      if (!this.hasAllOptions) {
        return;
      }
  
      let options = {
        centromeres: this.centromeres,
        bands: this.bands,
        brush: true,
        selectedArea: this.selectedArea,
      };
  
      this.idogramScaleBarChart = new idiogramScaleBar(container, this.chromosomes, options);
      container.appendChild(this.idogramScaleBarChart);
    },
  },
  computed: {
    hasAllOptions() {
        return this.chromosomes && this.centromeres && this.bands;
    }, 
  },
  watch: {
    selectedArea() {
        this.drawIdogramScaleBar();
    },
    hasAllOptions() {
        this.drawIdogramScaleBar();
    }
  },
  }
  </script>
  
  <style lang="sass">
    .idiogram-scale-bar-viz
        width: 100%
        height: 40px
        padding: 0px 5px 
  </style>
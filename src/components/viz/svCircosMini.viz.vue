<template>
    <div id="sv-circos-mini-viz">

    </div>
  </template>
  
  <script>
    import svCircosMini from '../../d3/svCircosMini.js';
    import * as d3 from 'd3';

    export default {
    name: 'SvCirosMiniViz',
    components: {
    },
    emits: ['selectAreaEvent'],
    props: {
        zoomZone: Object,
        centromeres: Array,
        bands: Array,
        chromosomes: Array,
    },
    data () {
        return {
            svCircosMiniChart: null,
            resizeObserver: null,
        }
    },
    mounted () {
        //set the height to be the same as the width
        let root = document.getElementById('sv-circos-mini-viz');
        root.style.height = root.clientWidth + 'px';

        this.resizeObserver = new ResizeObserver( () => {
            //resize the height to be the same as the width
            root.style.height = root.clientWidth + 'px';

            this.drawMiniCircos();
        });

        this.resizeObserver.observe(document.getElementById('sv-circos-mini-viz'));
    },
    beforeDestroy() {
        this.resizeObserver.unobserve(document.getElementById('sv-circos-mini-viz'));
    },
    methods: {
        drawMiniCircos() {
            if (!this.hasAllOptions) {
                return;
            }

            let container = document.getElementById('sv-circos-mini-viz');
            d3.select(container).selectAll('*').remove();

            let options = {
                centromeres: this.centromeres,
                bands: this.bands,
                zoomZone: this.zoomZone,
                zoomedCallback: this.emitZoomEvent,
            };

            this.svCircosMiniChart = new svCircosMini(container, this.chromosomes, options);
            container.appendChild(this.svCircosMiniChart);
            
            let miniCircos = document.getElementById('sv-circos-mini');
            miniCircos.style.zIndex = 2;
        },
        emitZoomEvent(zoomZone) {
            this.$emit('selectAreaEvent', zoomZone);
        }
    },
    computed: {
        hasAllOptions() {
            return this.centromeres && this.bands && this.chromosomes;
        }
    },
    watch: {
        hasAllOptions: function(newVal, oldVal) {
        if (newVal) {
            this.drawMiniCircos();
        }
        }
    },
    }
  </script>
  
  <style lang="sass">
    #sv-circos-mini-viz
        width: 100%
        display: flex
        justify-content: center
        align-items: center
  </style>
<template>
    <div class="ideogram-scale-bar-wrapper">
        <div class="ideogram-scale-bar-viz" ref="ideogramScaleContainer"></div>
    </div>
</template>

<script>
import ideogramScaleBar from "../../d3/idoigramScaleBar.d3.js";

export default {
    name: "IdeogramScaleBarViz",
    components: {},
    props: {
        selectedArea: Object,
        bands: Array,
        centromeres: Array,
        chromosomes: Array,
    },
    data() {
        return {
            idogramScaleBarChart: null,
            resizeObserver: null,
        };
    },
    mounted() {
        //Will not load this component without chromosomes/required items
        this.resizeObserver = new ResizeObserver(() => {
            this.drawIdogramScaleBar();
        });

        let contToObserve = this.$refs.ideogramScaleContainer;
        this.resizeObserver.observe(contToObserve);
    },
    beforeDestroy() {
        if (this.resizeObserver) {
            let contToObserve = this.$refs.ideogramScaleContainer;
            this.resizeObserver.unobserve(contToObserve);
        }
    },
    methods: {
        drawIdogramScaleBar() {
            let container = this.$refs.ideogramScaleContainer;
            if (!container || !container.clientWidth) {
                return;
            }
            container.innerHTML = "";

            if (!this.hasAllOptions) {
                return;
            }

            let options = {
                centromeres: this.centromeres,
                selectionCallback: this.selectedAreaCallback,
                bands: this.bands,
                brush: true,
                selection: this.selectedArea,
            };

            this.idogramScaleBarChart = new ideogramScaleBar(container, this.chromosomes, options);
            container.appendChild(this.idogramScaleBarChart);
        },
        selectedAreaCallback(selectedArea) {
            this.$emit("selectAreaEvent", selectedArea);
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
        },
    },
};
</script>

<style lang="sass">
.ideogram-scale-bar-wrapper
    width: 100%
    padding: 5px
.ideogram-scale-bar-viz
    width: 100%
    height: 55px
    padding: 0px
    border: .5px solid transparent
</style>

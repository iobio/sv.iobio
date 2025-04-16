<template>
    <div class="coverage-histo-wrapper content" ref="histoContainer"></div>
</template>

<script>
export default {
    name: "CoverageHistoWrapper",
    props: {
        region: { //Must come with a rname, start, end
            type: Object,
            required: false,
        },
        bamUrl: {
            type: String,
            required: true,
        },
        genomeSize: {
            type: Number,
            required: false,
        },
    },
    data() {
        return {
            dataBrokerEl: null,
            bamview: null,
            bamviewChart: null,
            shadow: null,
        };
    },
    async mounted() {
        // await import("https://cdn.jsdelivr.net/npm/iobio-charts@0.23.0/index.js");
        await import("https://cdn.jsdelivr.net/gh/iobio/iobio-charts@main-coverage-chart-isolation/coverage/src/BamView-WebComponent.js");
        await import("https://cdn.jsdelivr.net/gh/iobio/iobio-charts@main-coverage-chart-isolation/coverage/src/BamData.js");
        await import("https://cdn.jsdelivr.net/gh/iobio/iobio-charts@main-coverage-chart-isolation/bam_controls.js");
        await import("https://cdn.jsdelivr.net/gh/iobio/iobio-charts@main-coverage-chart-isolation/common.js");
        await import("https://cdn.jsdelivr.net/gh/iobio/iobio-charts@main-coverage-chart-isolation/data_broker_component.js");
        await import("https://cdn.jsdelivr.net/gh/iobio/iobio-charts@main-coverage-chart-isolation/data_broker.js");

        const options = {
            showChartLabel: false,
            showZoomableChart: false,
            showChromosomes: false,
            showYAxis: true,
            showYAxisLine: false,
            showYAxisLabel: false,
            yAxisPosition: 'internal', // 'external' or 'internal'
            averageCovLabelPosition: 'right-internal', // 'left-external', 'right-external', 'left-internal', 'right-internal'
            margin: {
                top: 10,
                right: 10,
                bottom: 10,
                left: 10,
            }
        }

        let container = document.querySelector(".coverage-histo-wrapper");
        
        this.bamview = document.createElement("iobio-coverage-depth");
        this.bamview.setAttribute("options", JSON.stringify(options));

        this.dataBrokerEl = document.createElement("iobio-data-broker");
        this.dataBrokerEl.setAttribute("alignment-url", this.bamUrl);

        // Append the elements to the container
        container.appendChild(this.dataBrokerEl);
        container.appendChild(this.bamview);

        this.shadow = document.querySelector("iobio-coverage-depth").shadowRoot;
        if (this.shadow) {
            this.bamviewChart = this.shadow.querySelector("#bamview-chart-container");
            //take the border away
            this.bamviewChart.style.border = "none";
        }

        if (this.region) {
            // Set the region if provided
            document.dispatchEvent(new CustomEvent('global-brushed-region-change', {
                detail: this.region,
                bubbles: true,
                composed: true,
            }));
        } 
    },
    methods: {},
    computed: {},
    watch: {
        region: {
            handler(newVal, oldVal) {
                if (newVal == oldVal) {
                    return;
                }

                if (!newVal || (newVal.start == 0 && newVal.end == this.genomeSize)) {
                    // Dispatch the global event with the new region
                    document.dispatchEvent(new CustomEvent('global-brushed-region-change', {
                        detail: {
                            start: null,
                            end: null,
                        },
                        bubbles: true,
                        composed: true,
                    }));
                    this.bamview.updateBamView();
                    return;
                }
                // Dispatch the global event with the new region
                document.dispatchEvent(new CustomEvent('global-brushed-region-change', {
                    detail: newVal,
                    bubbles: true,
                    composed: true,
                }));
                this.bamview.updateBamView();
            },
            deep: true,
        },
    },
};
</script>

<style lang="sass">
.coverage-histo-wrapper
    height: 180px
    --iobio-data-color: rgba(42,101,183, 0.8)
    padding: 5px
    border: 1px solid rgb(239, 239, 239)
    background-color: #F7F7F7
    border-top: none
    border-radius: 0px 0px 5px 5px
</style>

<template>
    <div class="multi-bam-wrapper content" ref="multiBamContainer"></div>
</template>

<script>
export default {
    name: "MultiBamWrapper",
    props: {
        region: {
            //Must come with a rname, start, end
            type: Object,
            required: false,
        },
        bamTitles: {
            type: Array,
            required: true,
        },
        bamUrls: {
            type: Array,
            required: true,
        },
        baiUrls: {
            type: Array,
            required: false,
        },
        genomeSize: {
            type: Number,
            required: false,
        },
    },
    data() {
        return {
            dataBrokerEl: null,
            multiBamView: null,
            multiBamChart: null,
            shadow: null,
        };
    },
    async mounted() {
        await import("https://cdn.jsdelivr.net/npm/iobio-charts@0.23.0/index.js");

        // Local Development TODO: Remove
        // await import("http://localhost:8888/multi_series/multi_series_chart.js");
        // await import("http://localhost:8888/multi_series/multi_series_wc.js");
        // await import("http://localhost:8888/multi_series/multi_alignment_broker_wc.js");
        // await import("http://localhost:8888/multi_series/multi_alignment_broker.js");

        // Will be removed when the iobio-charts package is updated to include multi_series components
        await import(
            "https://cdn.jsdelivr.net/gh/iobio/iobio-charts@e9dea897f8a74b201b0b360f2b9e41014c3d8d02/multi_series/multi_series_chart.js"
        );
        await import(
            "https://cdn.jsdelivr.net/gh/iobio/iobio-charts@e9dea897f8a74b201b0b360f2b9e41014c3d8d02/multi_series/multi_series_wc.js"
        );
        await import(
            "https://cdn.jsdelivr.net/gh/iobio/iobio-charts@e9dea897f8a74b201b0b360f2b9e41014c3d8d02/multi_series/multi_alignment_broker_wc.js"
        );
        await import(
            "https://cdn.jsdelivr.net/gh/iobio/iobio-charts@e9dea897f8a74b201b0b360f2b9e41014c3d8d02/multi_series/multi_alignment_broker.js"
        );

        let container = document.querySelector(".multi-bam-wrapper");

        this.dataBrokerEl = document.createElement("iobio-multi-alignment-broker");
        this.multiBamView = document.createElement("iobio-multi-series");

        // Append the elements to the container
        container.appendChild(this.dataBrokerEl);
        container.appendChild(this.multiBamView);

        this.dataBrokerEl.setAttribute("id", "multi-bam-broker");
        this.multiBamView.brokerId = "multi-bam-broker";
        this.multiBamView.totalSize = this.genomeSize;

        this.multiBamView.region = JSON.stringify({
            start: this.region.start,
            end: this.region.end,
        });

        this.dataBrokerEl.alignmentTitles = this.bamTitles;
        this.dataBrokerEl.alignmentUrls = this.bamUrls;

        if (this.baiUrls) {
            this.dataBrokerEl.indexUrls = this.baiUrls;
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
                if (newVal) {
                    let newRegion = {
                        start: newVal.start,
                        end: newVal.end,
                    };

                    this.multiBamView.region = JSON.stringify(newRegion);
                }
            },
            deep: true,
        },
    },
};
</script>

<style lang="sass">
.multi-bam-wrapper
    height: 180px
    --iobio-data-color: rgba(42,101,183, 0.8)
    padding: 5px
    border: 1px solid rgb(239, 239, 239)
    background-color: #F7F7F7
    border-top: none
    border-radius: 0px 0px 5px 5px
</style>

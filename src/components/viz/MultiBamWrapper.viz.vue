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
        bamUrls: {
            type: String,
            required: true,
        },
        baiUrl: {
            type: String,
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
        await import("http://localhost:8888/multi_series/multi_series_chart.js");
        await import("http://localhost:8888/multi_series/multi_series_wc.js");
        await import("http://localhost:8888/multi_series/multi_alignment_broker_wc.js");
        await import("http://localhost:8888/multi_series/multi_alignment_broker.js");

        let container = document.querySelector(".multi-bam-wrapper");

        this.dataBrokerEl = document.createElement("iobio-multi-alignment-broker");
        this.multiBamView = document.createElement("iobio-multi-series");

        // Append the elements to the container
        container.appendChild(this.dataBrokerEl);
        container.appendChild(this.multiBamView);

        this.dataBrokerEl.alignmentUrl = this.bamUrl;

        if (this.baiUrl) {
            this.dataBrokerEl.indexUrl = this.baiUrl;
        }

        if (this.bedUrl) {
            this.dataBrokerEl.bedUrl = this.bedUrl;
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

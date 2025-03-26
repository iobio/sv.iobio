<template>
    <div class="coverage-histo-wrapper content" ref="histoContainer"></div>
</template>

<script>
export default {
    name: "CoverageHistoWrapper",
    props: {},
    data() {
        return {
            dataBrokerEl: null,
            coverageHisto: null,
            regions: [],
            bedText: "",
        };
    },
    async mounted() {
        await import("https://cdn.jsdelivr.net/npm/iobio-charts@0.22.0/index.js");

        //container is the histoContainer
        let container = document.querySelector(".coverage-histo-wrapper");

        // Create the custom elements
        this.coverageHisto = document.createElement("iobio-coverage-depth");
        this.dataBrokerEl = document.createElement("iobio-data-broker");

        // Set the dataBroker's data attribute
        this.dataBrokerEl.setAttribute("alignment-url", "https://s3.amazonaws.com/iobio/NA12878/NA12878.autsome.bam");

        // Append the elements to the container
        container.appendChild(this.dataBrokerEl);
        container.appendChild(this.coverageHisto);

        // For now we are going to pick out the elements we dont want and hide them
        let shadow = document.querySelector("iobio-coverage-depth").shadowRoot;

        if (shadow) {
            // const style = document.createElement("style");
            // style.textContent = `
            //     #bamview-controls {
            //         display: none;
            //         height: 0;
            //     }
            //     #title-container {
            //         display: none;
            //         height: 0;
            //     }
            //     #bamview-chart-container {
            //         border: none;
            //     }
            //     .chromosome-button-small.chromosome-button {
            //         display: none;
            //     }
            //     .circle-button-reset-chromosomes {
            //         display: none;
            //         height: 0;
            //     }
            //     .bar {
            //         fill: #4d4d4d;
            //         fill-opacity: 0.8;
            //     }
            // `;
            // shadow.appendChild(style);
        }
    },
    methods: {},
    computed: {},
    watch: {},
};
</script>

<style lang="sass">
.coverage-histo-wrapper
    height: 300px
</style>

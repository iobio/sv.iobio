<template>
    <div id="igv-modal">
        <button @click="$emit('close')">Close</button>
        <div id="igv-container"></div>
    </div>
</template>

<script>
import igv from "https://cdn.jsdelivr.net/npm/igv@3.2.6/dist/igv.esm.min.js";

export default {
    name: "IgvModal",
    props: {
        proband: {
            type: Object,
            required: true,
        },
        region: { 
            type: String,
            required: true,
        },
        genomeBuild: {
            type: String,
            required: false,
        },
        selectedVariant: {
            type: Object,
            required: false,
        },
    },
    data() {
        return {
            igvEl: null,
            igvBrowser: null,
        };
    },
    async mounted() {
        const options =
        {
            genome: "hg38",
            locus: this.locus,
            tracks: [
                {
                    "name": "Proband Bam",
                    "url": this.proband.bam,
                    "bed": this.proband.bed,
                    "indexURL": this.proband.bai,
                    "format": this.fileType,
                },
                {
                    "name": "Proband VCF",
                    "url": this.proband.vcf,
                    "format": "vcf",
                    "indexURL": this.proband.tbi,
                },
            ]
        };

        this.igvEl = document.getElementById('igv-container');
        this.igvBrowser = await igv.createBrowser(this.igvEl, options);
    },
    computed: {
        locus() {
            let r = this.region.split(":");
            let chr = r[0];
            let startEnd = r[1].split("-");
            let rStart = startEnd[0];
            let rEnd = startEnd[1];

            if (this.region) {
                if (this.region == "Whole Genome") {
                    return "all";
                } else if (this.selectedVariant && this.selectedVariant.size > 8000){
                    let regions = ["", ""];
                    let hStart = this.selectedVariant.start - 1000;
                    if (hStart < rStart) {
                        hStart = rStart;
                    }
                    let hEnd = this.selectedVariant.start + 1000;
                    let head = chr + ":" + hStart + "-" + hEnd;
                    regions[0] = head;

                    let tStart = this.selectedVariant.end - 1000;
                    let tEnd = this.selectedVariant.end + 1000;
                    if (tEnd > rEnd) {
                        tEnd = rEnd;
                    }
                    let tail = chr + ":" + tStart + "-" + tEnd;
                    regions[1] = tail;
                    return regions;
                }
                else {
                    return this.region;
                }
            }
            return "all";
        },
        fileType() {
            if (this.proband.bam) {
                return this.proband.bam.split('.').pop();
            }
            return "bam";
        }
    },
    watch: {
        region(newVal) {
            console.log("region changed to: ", newVal);
            if (this.igvBrowser) {
                this.igvBrowser.search(this.locus);
            }
        },
    },
};
</script>

<style lang="sass">
#igv-modal
    display: flex
    flex-direction: column
    justify-content: center
    align-items: center
    width: 100%
    height: 100%
    position: absolute
    top: 0
    left: 0
    z-index: 5
    backdrop-filter: blur(3px)
    button
        border: 1px solid #ccc
        border-radius: 5px
        padding: 5px 10px
        align-self: flex-start
        cursor: pointer
        font-size: 16px
        margin-left: 10px
        margin-bottom: 5px
        color: #333
        &:hover
            background-color: #f0f0f0
            color: #000
            border-color: #999
#igv-container
    width: 100%
    height: 95%
    padding: 10px 5px
    z-index: 9999
    background-color: white
    opacity: 0.95
    border-radius: 10px
    border: 1px solid #ccc
    *
        box-sizing: border-box
</style>
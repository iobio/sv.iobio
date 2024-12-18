<template>
    <div class="filter-data-section" :class="{hidden: !show}">
        <h3>Filter Variants</h3>
        <div id="overlap-check">
            <label for="gene-overlap">Gene Overlap Only</label>
            <input type="checkbox" name="gene-overlap" v-model="geneOverlap" />
        </div>

        <div id="denovo-check">
            <label for="denovo-only">Denovo/Unique Only</label>
            <input type="checkbox" name="denovo-only" v-model="denovoOnly" />
        </div>

        <button @click="updateFilters" :disabled="!loaded">Apply</button>
    </div>
</template>

<script>
//Emtpy base template
export default {
    name: "FilterDataSection",
    components: {},
    props: {
        show: Boolean,
        filters: Object,
        loaded: Boolean,
        probQualityStats: Object,
    },
    data() {
        return {
            geneOverlap: JSON.parse(this.filters.geneOverlap),
            denovoOnly: JSON.parse(this.filters.denovoOnly),
        };
    },
    mounted() {},
    methods: {
        updateFilters() {
            this.$emit("toggleFilterDataSection");
            this.$emit("updateFilters", {
                geneOverlap: this.geneOverlap,
                qualityCutOff: this.cutoff,
                denovoOnly: this.denovoOnly,
            });
        },
        roundedMin() {
            return Math.round(this.probQualityStats.min) || 0;
        },
        roundedMax() {
            return Math.round(this.probQualityStats.max) || "None";
        },
        roundedAvg() {
            return Math.round(this.probQualityStats.avg) || "None";
        },
        roundedMedian() {
            return Math.round(this.probQualityStats.median) || "None";
        },
        roundedSD() {
            return Math.round(this.probQualityStats.stdDev) || "None";
        },
        oneSDBelow() {
            return Math.round(this.probQualityStats.avg - this.probQualityStats.stdDev) || "None";
        },
        roundedMinMedianAvg() {
            return Math.round(Math.min(this.probQualityStats.median, this.probQualityStats.avg)) || "None";
        },
        roundedMaxMedianAvg() {
            return Math.round(Math.max(this.probQualityStats.median, this.probQualityStats.avg)) || "None";
        },
    },
    watch: {},
    computed: {},
};
</script>

<style lang="sass">
.filter-data-section
    position: absolute
    display: flex
    flex-direction: column
    top: 0
    left: 0
    padding: 10px
    width: 100%
    height: 100%
    background-color: white
    transition: height 0.5s ease-in-out, width 0.5s ease-in-out
    box-sizing: border-box
    border-right: 1px solid #EBEBEB
    z-index: 3
    &.hidden
        height: 0px
        padding: 0px
        overflow: hidden
    h3
        margin: 0px
        padding: 5px 0px 10px 0px
        color: #0D60C3
        font-size: 1.2em
        text-align: center
        text-transform: uppercase
        font-weight: 400
    #overlap-check, #denovo-check
        display: flex
        flex-direction: row
        align-items: center
        justify-content: flex-start
        padding: 10px
        width: 100%
        border-bottom: 1px solid #EBEBEB
        label
            margin-right: 10px
            color: #0D60C3
        input
            margin-right: 10px
    #overlap-check
        border-top: 1px solid #EBEBEB
    button
        margin-top: 40px
        max-width: 100px
        width: 100px
        padding: 5px
        background-color: #0D60C3
        color: white
        border: none
        border-radius: 3px
        cursor: pointer
        &:hover
            background-color: #0B4B99
            color: white
        &:disabled
            background-color: #ccc
            color: #666
            cursor: not-allowed
    #quality-info-wrapper
        display: flex
        flex-direction: column
        width: 100%
        align-items: center
        justify-content: flex-start
        border: 1px solid #0D60C3
        border-radius: 5px
        padding: 5px
        margin-top: 10px
        span
            margin-right: 10px
            color: #0D60C3
            font-weight: 400
    #quality-cutoff
        display: flex
        width: 100%
        flex-direction: row
        align-items: center
        justify-content: flex-start
        margin-top: 10px
        label
            margin-right: 10px
            color: #0D60C3
            font-weight: bold
        input[type="range"]
            margin-right: 10px
            flex-grow: 1
        span
            margin-left: 10px
            color: #0D60C3
            font-weight: bold
</style>

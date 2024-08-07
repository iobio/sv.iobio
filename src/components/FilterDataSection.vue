<template>
    <div class="filter-data-section" :class="{hidden: !show}">
        <h3>Filter By:</h3>
        <div id="overlap-check">
            <label for="gene-overlap">Gene Overlap Only</label>
            <input type="checkbox" name="gene-overlap" v-model="geneOverlap">
        </div>

        <div id="quality-info-wrapper" v-if="probQualityStats && probQualityStats.avg">
            <div class="quality-stats-row">
                <span>Mean: {{ roundedAvg() }}</span>
                <span>Median: {{ roundedMedian() }}</span>
                <span>SD: {{ roundedSD() }}</span>
            </div>

            <div id="quality-cutoff">
                <label for="quality-cutoff">Quality <br> Cutoff</label>
                <span>{{ roundedMin() }}</span>
                <input list="markers" type="range" name="quality-cutoff" :min="probQualityStats.min" :max="probQualityStats.max" step="1" v-model="cutoff">
                <span>{{ roundedMax() }}</span>
            </div>
            <datalist id="markers">
                <option :value="roundedMin()"></option>
                <option :value="oneSDBelow()"></option>
                <option :value="roundedMinMedianAvg()"></option>
                <option :value="roundedMaxMedianAvg()"></option>
            </datalist>
            <span>Remove: Quality < {{cutoff}}</span>
        </div>

        <button @click="updateFilters" :disabled="!loaded">Apply</button>
    </div>
</template>

<script>

//Emtpy base template
export default {
    name: 'FilterDataSection',
    components: {
    },
    props: {
        show: Boolean,
        filters: Object,
        loaded: Boolean,
        probQualityStats: Object
    },
    data () {
        return {
            geneOverlap: JSON.parse(this.filters.geneOverlap),
            cutoff: 0,
        }
    },
    mounted () {
    },
    methods: {
        updateFilters() {
            this.$emit('toggleFilterDataSection')
            this.$emit('updateFilters', {
                geneOverlap: this.geneOverlap,
                qualityCutOff: this.cutoff
            })
        },
        roundedMin() {
            return Math.round(this.probQualityStats.min) || 0
        },
        roundedMax() {
            return Math.round(this.probQualityStats.max) || 'None'
        },
        roundedAvg() {
            return Math.round(this.probQualityStats.avg) || 'None'
        },
        roundedMedian() {
            return Math.round(this.probQualityStats.median) || 'None'
        },
        roundedSD(){
            return Math.round(this.probQualityStats.stdDev) || 'None'
        },
        oneSDBelow() {
            return Math.round(this.probQualityStats.avg - this.probQualityStats.stdDev) || 'None'
        },
        roundedMinMedianAvg() {
            return Math.round(Math.min(this.probQualityStats.median, this.probQualityStats.avg)) || 'None';
        },
        roundedMaxMedianAvg() {
            return Math.round(Math.max(this.probQualityStats.median, this.probQualityStats.avg)) || 'None';
        }
    },
    watch: {
    },
    computed: {
    }
}
</script>

<style lang="sass">
    .filter-data-section
        position: absolute
        display: flex
        flex-direction: column
        top: 0
        left: 0
        padding: 55px 10px 10px 10px
        width: 30%
        height: 100%
        border-radius: 0px 0px 5px 0px
        background-color: rgba(255, 255, 255, 0.95)
        transition: height 0.5s ease-in-out, width 0.5s ease-in-out
        box-shadow: 0px 0px 5px 0px #2A65B7
        box-sizing: border-box
        z-index: 3
        &.hidden
            height: 0px
            width: 0px
            padding: 0px
            overflow: hidden
        h3
            margin: 0px
            padding: 5px 0px 10px 0px
            color: #0D60C3
            font-size: 1.2em
            font-weight: bold
        #overlap-check
            display: flex
            flex-direction: row
            align-items: center
            justify-content: flex-start
            margin-top: 10px
            border: 1px solid #0D60C3
            padding: 5px
            border-radius: 5px
            width: fit-content
            label
                margin-right: 10px
                color: #0D60C3
                font-weight: bold
            input
                margin-right: 10px
        button
            margin-top: 10px
            max-width: 100px
            width: 100px
            padding: 5px
            background-color: #0D60C3
            color: white
            border: none
            border-radius: 3px
            cursor: pointer
            align-self: flex-end
            &:hover
                background-color: #0D60C3
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
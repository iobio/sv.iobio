<template>
    <div class="filter-data-section" :class="{hidden: !show}">
        <h3>Show SVs With</h3>
        <div>
            <label for="gene-overlap">Gene Overlap Only</label>
            <input type="checkbox" name="gene-overlap" v-model="geneOverlap">
        </div>

        <button @click="updateFilters">Apply Filters</button>
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
        filters: Object
    },
    data () {
        return {
            geneOverlap: JSON.parse(this.filters.geneOverlap)
        }
    },
    mounted () {
    },
    methods: {
        updateFilters() {
            this.$emit('toggleFilterDataSection')
            this.$emit('updateFilters', {
                geneOverlap: this.geneOverlap
            })
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
        background-color: rgba(255, 255, 255, 0.90)
        transition: height 0.5s ease-in-out, width 0.5s ease-in-out
        box-shadow: 0px 0px 5px 0px #2A65B7
        box-sizing: border-box
        z-index: 3
        &.hidden
            height: 0px
            width: 0px
            padding: 0px
            overflow: hidden
        button
            margin-top: 10px
            max-width: 100px
            padding: 5px
            background-color: #0D60C3
            color: white
            border: none
            border-radius: 5px
            cursor: pointer
            &:hover
                background-color: #0D60C3
                color: white
</style>
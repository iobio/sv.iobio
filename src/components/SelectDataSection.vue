<template>
    <div class="select-data-section" :class="{hidden: !show}">
        <SampleDataRow v-for="(sample, index) in samplesLocal" :key="index" :sample="sample"/>
        <button class="add-btn" @click="addNewSample">+</button>
        <button class="go-btn" @click="sendSamples">GO</button>
    </div>
</template>

<script>
    import SampleDataRow from './parts/SampleDataRow.vue'
export default {
    name: 'SelectDataSection',
    components: {
        SampleDataRow
    },
    props: {
        show: Boolean,
        samples: Array,
    },
    data () {
        return {
            samplesLocal: [],
        }
    },
    mounted () {
        this.samplesLocal = JSON.parse(JSON.stringify(this.samples))
    },
    methods: {
        addNewSample () {
            this.samplesLocal.push({
                name: '',
                vcf: '',
                tbi: '',
                bam: '',
                bai: '',
                svList: [],
            })
        },
        sendSamples () {
            console.log(this.samplesLocal)
            this.$emit('update-samples', this.samplesLocal)
            this.$emit('toggle-show')
        }
    },
    watch: {
    },
    computed: {
    }
}
</script>

<style lang="sass">
    .select-data-section
        position: absolute
        display: flex
        flex-direction: column
        justify-content: flex-start
        align-items: center
        top: 0
        right: 0
        width: 50%
        height: 100%
        padding: 60px 10px 10px 10px
        border-radius: 0px 0px 0px 5px
        background-color: rgba(255, 255, 255, 0.90)
        transition: height 0.5s ease-in-out, width 0.5s ease-in-out
        box-shadow: 0px 0px 5px 0px #2A65B7
        box-sizing: border-box
        z-index: 3
        overflow-y: auto
        &.hidden
            height: 0px
            width: 0px
            overflow: hidden
            padding: 0px   
        .go-btn
            background-color: green
            color: white
            border: none
            padding: 5px 10px
            border-radius: 5px
            cursor: pointer
            align-self: flex-end
            &:hover
                background-color: darkgreen
                color: white
        .add-btn
            background-color: #2A65B7
            display: flex
            justify-content: center
            align-self: flex-start
            align-items: center
            font-size: 20px
            color: white
            border: none
            border-radius: 50%
            cursor: pointer
            &:hover
                background-color: #1A45A7
                color: white
</style>
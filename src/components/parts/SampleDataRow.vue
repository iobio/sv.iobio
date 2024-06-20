<template>
    <div class="sample-data-row" :class="{collapse: collapse}">
        <button class="collapse-row-btn" @click="toggleCollapse">
            <img v-if="collapse" src="/public/arrow-down-circle.svg" alt="open">
            <img v-else src="/public/arrow-up-circle.svg" alt="close">
        </button>
        <div class="sample-row-info-form" v-if="!collapse">
            <div class="label-input-wrapper">
                <label for="sample-id">Sample Name:</label>
                <input type="text" id="sample-id" v-model="sample.name"/>
            </div>
            <div class="label-input-wrapper link">
                <label for="vcf">VCF:</label>
                <input type="text" id="vcf" v-model="sample.vcf"/>
            </div>
            <div class="label-input-wrapper link">
                <label for="tbi">VCF tbi (opt.):</label>
                <input type="text" id="tbi" v-model="sample.tbi"/>
            </div>
            <div class="label-input-wrapper link">
                <label for="bam">BAM (opt.): </label>
                <input type="text" id="bam" v-model="sample.bam"/>
            </div>
            <div class="label-input-wrapper link">
                <label for="bai">BAI (if BAM):</label>
                <input type="text" id="bai" v-model="sample.bai"/>
            </div>
        </div>
        <div class="collapsed-alt-text" v-else>{{ sample.name }}</div>
    </div>
</template>

<script>
//Emtpy base template
export default {
    name: 'SampleDataRow',
    components: {
    },
    props: {
        sample: Object,
    },
    data () {
        return {
            collapse: false,
        }
    },
    mounted () {
    },
    methods: {
        toggleCollapse () {
            this.collapse = !this.collapse
        }
    },
    watch: {
    },
    computed: {
    }
}
</script>

<style lang="sass">
    .sample-data-row
        width: 100%
        display: flex
        border-radius: 5px
        margin: 5px 0px
        justify-content: space-between
        align-items: center
        padding: 5px 10px
        box-sizing: border-box
        border: 1px solid #2A65B7
        transition: height 0.5s ease-in-out
        &.collapse
            height: 50px
        .collapse-row-btn
            display: flex
            justify-content: center
            align-items: center
            background-color: #2A65B7
            color: white
            border: none
            border-radius: 50%
            height: 25px
            width: 25px
            padding: 0px
            cursor: pointer
            &:hover
                background-color: #1A4B97
            img
                height: 25px
                width: 25px
                transform: translate(0px, 0px)
        .sample-row-info-form
            flex-grow: 1
            display: flex
            justify-content: flex-start
            align-items: center
            flex-direction: column
            padding: 0px 10px
            height: 100%
            box-sizing: border-box
            .label-input-wrapper
                width: 100%
                display: flex
                justify-content: flex-start
                align-items: center
                margin: 5px 0px
                label
                    width: 20%
                    min-width: 100px
                    text-align: right
                    margin-right: 10px
                input
                    padding: 5px
                    border: 1px solid #2A65B7
                    border-radius: 5px
                    box-sizing: border-box
                    flex-grow: 1
        .collapsed-alt-text
            width: 100%
            text-align: center
</style>
<template>
    <div class="select-data-section" :class="{hidden: !show}"></div>
</template>

<script>
//Emtpy base template
export default {
    name: 'SelectDataSection',
    components: {
    },
    props: {
        show: Boolean,
    },
    data () {
        return {
        }
    },
    mounted () {
    },
    methods: {
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
        top: 0
        right: 0
        width: 50%
        height: 100%
        border-radius: 0px 0px 0px 5px
        background-color: rgba(255, 255, 255, 0.90)
        transition: height 0.5s ease-in-out, width 0.5s ease-in-out
        box-shadow: 0px 0px 5px 0px #2A65B7
        box-sizing: border-box
        z-index: 3
        &.hidden
            height: 0px
            width: 0px     
</style>
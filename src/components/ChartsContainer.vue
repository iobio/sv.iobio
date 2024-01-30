<template>
    <div id="charts-container">
        <svCircos />
    </div>
  </template>
  
<script>
    import svCircos from "./viz/svCircos.viz.vue"

    export default {
        name: 'ChartsContainer',
        components: {
            svCircos
        }
    }

</script>

<style lang="sass">
    #charts-container 
        align-content: center
        box-sizing: border-box
        display: flex
        flex-direction: row
        height: 100%
        justify-content: center
        width: 100%

</style>
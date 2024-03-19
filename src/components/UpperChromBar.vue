<template>
    <div id="upper-chrom-bar">
      <ChromSelectBarViz />
    </div>
</template>
  
<script>
  import ChromSelectBarViz from './viz/chromSelectBar.viz.vue';

  export default {
  name: "UpperChromBar",
  components: {
    ChromSelectBarViz
  },
  props: {
  },
  data () {
    return {
    }
  },
  mounted () {
  },
  methods: {
  },
  computed: {
  },
  watch: {
  },
  }
</script>
  
<style lang="sass">
  #upper-chrom-bar
    width: 100%
    height: 60px
    background-color: white
    border-bottom: 1px solid #e0e0e0
    box-shadow: 0 2px 4px 0 rgba(0,0,0,0.1)

</style>
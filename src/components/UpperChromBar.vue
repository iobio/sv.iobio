<template>
    <div id="upper-chrom-bar">
      <ChromSelectBarViz 
        :svList="svList"/>
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
    svList: Array
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
    padding-top: 5px
    padding-bottom: 5px
    width: 100%
    height: 55px
    background-color: white
    border-bottom: 1px solid #e0e0e0
    box-shadow: inset 0 2px 4px 0 rgba(0,0,0,0.1)
</style>
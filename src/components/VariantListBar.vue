<template>
    <div id="variant-list-bar">
      <div v-if="svList && svList.length > 0" id="variant-list-bar-header">
        <div>Rank</div>
        <div>Chr</div>
        <div>Loc.</div>
        <div>Type</div>
      </div>
      <VariantListItem 
        v-for="(variant, index ) in svList" 
        :key="index" 
        :variant="variant"
        @variant-clicked="variantClicked"/>
    </div>
  </template>
  
  <script>
  import VariantListItem from './parts/VariantListItem.vue'

  export default {
  name: "VariantListBar",
  components: {
    VariantListItem
  },
  props: {
    svList: Array
  },
  data () {
    return {
      open: true
    }
  },
  mounted () {

  },
  methods: {
    variantClicked(variant) {
      this.$emit('variant-clicked', variant)
    }
  },
  computed: {
  },
  watch: {
  },
  }
  </script>
  
  <style lang="sass">
    .collapsed
      #variant-list-bar
        width: 0px
        min-width: 0px
        overflow: hidden
    #variant-list-bar
      display: flex
      flex-direction: column
      align-items: flex-start
      justify-content: flex-start
      padding-bottom: 10px
      width: 250px
      min-width: 250px
      height: 100%
      box-sizing: border-box
      border: 1px solid #F5F5F5
      border-radius: 5px
      overflow-y: auto
      position: relative
      transition: width 0.5s, min-width 0.5s, overflow 0.5s
      #variant-list-bar-header
        display: grid
        grid-template-columns: 1fr 1fr 1.5fr 1fr
        font-size: .8em
        width: 100%
        height: 50px
        margin: 0px
        padding-top: 5px
        padding-bottom: 5px
        box-sizing: border-box
        border-radius: 5px 5px 0px 0px
        position: sticky
        top: 0
        background-color: #C1D1EA
        color: #2A65B7
        border: 1px solid #2A65B7
        font-weight: bold
        box-shadow: 0px 2px 5px 0px rgba(0,0,0,0.1)
        div
          text-align: center
  </style>
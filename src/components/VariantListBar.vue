<template>
    <div id="variant-list-bar">
      <div v-if="svList && svList.length > 0" id="variant-list-bar-header">
        <div>Chr</div>
        <div>Loc.</div>
        <div>Size</div>
        <div>Type</div>
      </div>
      <VariantListItem 
        v-for="(variant, index ) in svListSection" 
        :key="index" 
        :variant="variant"
        :patientPhenotypes="patientPhenotypes"
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
    svList: Array,
    patientPhenotypes: Array,
  },
  data () {
    return {
      open: true,
      scrollSelection: [0, 40]
    }
  },
  mounted () {
    //we want to listen for scroll events on the variant list bar... if we are at the bottom, we want to load more variants
    let variantListBar = document.getElementById('variant-list-bar');
    variantListBar.addEventListener('scroll', this.handleScroll);
  },
  methods: {
    async variantClicked(variant, flag) {
      this.$emit('variant-clicked', variant, flag)
    },
    handleScroll(event) {
      let variantListBar = event.target;
      if (variantListBar.scrollTop + variantListBar.clientHeight >= variantListBar.scrollHeight && this.scrollSelection[1] < this.svList.length) {
        this.scrollSelection[0] = this.scrollSelection[0] + 1;
        this.scrollSelection[1] = this.scrollSelection[1] + 1;
        //increment the scroll just a little so that we can keep the scroll bar at the bottom and it seems natural
        variantListBar.scrollTop = variantListBar.scrollTop - 1;
      }
      //if we are at the top also load more variants in the opposite direction
      if (variantListBar.scrollTop === 0 && this.scrollSelection[0] > 0) {
        this.scrollSelection[0] = this.scrollSelection[0] - 1;
        this.scrollSelection[1] = this.scrollSelection[1] - 1;
        
        variantListBar.scrollTop = 1;
      }
    }
  },
  computed: {
    svListSection() {
      return this.svList.slice(this.scrollSelection[0], this.scrollSelection[1])
    }
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
    #variant-list-bar
      display: flex
      flex-direction: column
      align-items: flex-start
      justify-content: flex-start
      padding-bottom: 10px
      width: 100%
      min-width: 250px
      height: 100%
      box-sizing: border-box
      border: 1px solid #F5F5F5
      border-radius: 5px
      overflow-y: auto
      position: relative
      transition: width 0.4s, min-width 0.4s
      #variant-list-bar-header
        display: grid
        grid-template-columns: 1fr 1.5fr 1fr 1fr
        font-size: .8em
        width: 100%
        height: 50px
        margin: 0px
        padding-top: 5px
        padding-bottom: 5px
        box-sizing: border-box
        position: sticky
        top: 0
        background-color: white
        color: #2A65B7
        border-bottom: 1px solid #2A65B7
        font-weight: bold
        box-shadow: 0px 2px 5px 0px rgba(0,0,0,0.1)
        z-index: 1
        div
          text-align: center
  </style>
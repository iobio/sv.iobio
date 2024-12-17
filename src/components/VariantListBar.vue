<template>
  <div id="variant-sudo-scroll-wrapper">
    <div id="variant-list-bar">

      <div v-if="svList && svList.length > 0" id="variant-list-bar-header" :class="{hasGoi: geneCandidates && geneCandidates.length > 0}">
        <div class="span-rows">Chr</div>
        <div class="span-rows">Gene:HPO</div>
        <div class="span-rows" v-if="geneCandidates && geneCandidates.length > 0">GoI</div>
        <div class="span-rows">Genes <br> Total</div>
        <div class="span-rows">Zygosity</div>
        <div class="span-rows">Type</div>
        <div class="span-rows">Size</div>
      </div>
      <VariantListItem 
        v-for="(variant, index ) in svListSelection" 
        :key="`${variant.chromosome}-${variant.start}-${variant.end}`" 
        :variant="variant"
        :openedSvSet="openedSvSet"
        :geneCandidates="geneCandidates"
        :patientPhenotypes="patientPhenotypes"
        :comparisonsLists="comparisonsLists"
        :chromosomeAccumulatedMap="chromosomeAccumulatedMap"
        :placeInList="index"
        :overlapProp="overlapProp"
        :filters="filters"
        :focusedVariant="focusedVariant"
        @variant-clicked="variantClicked"/>
    </div>   
      <div id="variant-list-bar-sudo-scroll">
        <div id="variant-list-bar-sudo-scroll-thumb"></div>
      </div> 
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
    geneCandidates: Array,
    comparisonsLists: Array,
    chromosomeAccumulatedMap: Object,
    focusedVariant: Object,
    loading: {
      type: Boolean,
      default: false
    },
    sorted: {
      type: Boolean,
      default: false
    },
    overlapProp: Number,
    filters: Object
  },
  data () {
    return {
      open: true,
      scrollSelection: [0, 40],
      openedSvSet: {}
    }
  },
  mounted () {
    //we want to listen for scroll events on the variant list bar... if we are at the bottom, we want to load more variants
    let variantListBar = document.getElementById('variant-list-bar');

    variantListBar.addEventListener('scroll', this.handleScroll);

    //the initial thumb size will be the size of the scrollSelection[1] / svList.length * 100
    let thumb = document.getElementById('variant-list-bar-sudo-scroll-thumb');
    let height = (this.scrollSelection[1] / (this.svList.length - 1)* 100);
    if (height > 100) {
      height = 99.5;
    }
    thumb.style.height = height + '%'

    let sudoScrollBar = document.getElementById('variant-list-bar-sudo-scroll');
    sudoScrollBar.addEventListener('mousedown', (event) => {
      event.preventDefault();
      document.addEventListener('mousemove', onMouseMove);
      document.addEventListener('mouseup', onMouseUp);
    })

    let onMouseMove = (event) => {
      event.preventDefault();
      //get the mouse y position
      let mouseY = event.clientY;
      //what percent of the sudo scroll bar is the mouse at
      let percent = (mouseY - sudoScrollBar.getBoundingClientRect().top) / sudoScrollBar.clientHeight;
      let scrollSelection = [Math.floor(percent * this.svList.length), Math.floor(percent * this.svList.length) + 40]

      //if the scroll selection is less than 0, set it to 0
      if (scrollSelection[0] < 0) {
        scrollSelection[0] = 0;
        scrollSelection[1] = 40;
      }
      //if the scroll selection is greater than the svList length, set it to the svList length
      if (scrollSelection[1] > this.svList.length) {
        let zero = this.svList.length - 40;
        if (zero < 0) {
          zero = 0;
        }

        scrollSelection[0] = zero;
        scrollSelection[1] = this.svList.length;
      }
      this.handleScrollDrag(scrollSelection)
    }
    let onMouseUp = function(event) {
      event.preventDefault();
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    }
  },
  methods: {
    async variantClicked(variant, flag) {

      //add to openedSvSet
      let key = `${variant.chromosome}-${variant.start}-${variant.end}`
      if (key in this.openedSvSet) {
        delete this.openedSvSet[key]
      } else {
        this.openedSvSet[key] = true;
      }

      this.$emit('variant-clicked', variant, flag)
    },
    handleScroll(event) {
      let variantListBar = event.target;
      if (variantListBar.scrollTop + variantListBar.clientHeight >= (variantListBar.scrollHeight - 1) && this.scrollSelection[1] < this.svList.length) {
        this.scrollSelection[0] = this.scrollSelection[0] + 1;
        this.scrollSelection[1] = this.scrollSelection[1] + 1;
        //increment the scroll just a little so that we can keep the scroll bar at the bottom and it seems natural
        variantListBar.scrollTop = variantListBar.scrollTop - 1;

        //the thumb top position will be the scrollSelection[0] / svList.length * 100
        let thumb = document.getElementById('variant-list-bar-sudo-scroll-thumb');
        thumb.style.top = (this.scrollSelection[0] / this.svList.length * 100) + '%';
      }
      //if we are at the top also load more variants in the opposite direction
      if (variantListBar.scrollTop === 0 && this.scrollSelection[0] > 0) {
        this.scrollSelection[0] = this.scrollSelection[0] - 1;
        this.scrollSelection[1] = this.scrollSelection[1] - 1;
        
        variantListBar.scrollTop = variantListBar.scrollTop + 1;

        //the thumb top position will be the scrollSelection[0] / svList.length * 100
        let thumb = document.getElementById('variant-list-bar-sudo-scroll-thumb');
        let top = (this.scrollSelection[0] / this.svList.length * 100);
        if (top > 100) {
          top = 100;
        }
        thumb.style.top = top + '%';
      }
    },
    handleScrollDrag(scrollSelection) {
      this.scrollSelection = scrollSelection;
      let thumb = document.getElementById('variant-list-bar-sudo-scroll-thumb');
      let top = (this.scrollSelection[0] / this.svList.length * 100);
      if (top > 100) {
        top = 100;
      }
      thumb.style.top = top + '%';
    }
  },
  computed: {
    svListSelection() {
      return this.svList.slice(this.scrollSelection[0], this.scrollSelection[1])
    }
  },
  watch: {
    svList(newVal, oldVal) {
      if (newVal !== oldVal) {
        let thumb = document.getElementById('variant-list-bar-sudo-scroll-thumb');
        let height = (this.scrollSelection[1] / this.svList.length * 100);
        if (height > 100) {
          height = 99.5;
        } 
        thumb.style.height = height + '%'
      }
    },
  },
  }
  </script>
  
  <style lang="sass">
    #variant-sudo-scroll-wrapper
      flex-grow: 1
      overflow: hidden
      padding-right: 10px
      position: relative
      box-sizing: border-box
    .collapsed
      #variant-list-bar
        width: 0px
        min-width: 0px
      #variant-list-bar-sudo-scroll
        display: none
    #variant-list-bar
      display: flex
      flex-direction: column
      align-items: flex-start
      justify-content: flex-start
      padding-bottom: 10px
      width: 100%
      min-width: 350px
      height: 100%
      box-sizing: border-box
      overflow-y: auto
      position: relative
      transition: width 0.4s, min-width 0.4s
      #variant-list-bar-header
        display: grid
        grid-template-columns: minmax(0, .1fr) minmax(0, .25fr) minmax(0, .2fr) minmax(0, .25fr) minmax(0, .15fr) minmax(0, .15fr)
        grid-template-rows: 1fr 1fr
        font-size: .8em
        font-weight: 200
        width: 100%
        height: 90px
        margin: 0px
        padding: 5px
        box-sizing: border-box
        position: sticky
        text-transform: uppercase
        top: 0
        background-color: white
        color: #474747
        border-bottom: 1px solid #E0E0E0
        box-shadow: 0px 2px 5px 0px rgba(0,0,0,0.1)
        z-index: 1
        &.hasGoi
            grid-template-columns: minmax(0, .1fr) minmax(0, .25fr) minmax(0, .15fr) minmax(0, .15fr) minmax(0, .3fr) minmax(0, .15fr) minmax(0, .15fr)
        .span-rows
            grid-row: 1/3
            overflow-wrap: break-word
            max-width: 100%
            text-overflow: ellipsis
        .upper
            grid-column: 2/4
            grid-row: 1
            max-width: 100%
            text-overflow: ellipsis
        .lower
            max-width: 100%
            grid-column: 2/4
            grid-row: 2
            justify-content: space-evenly
            text-transform: none
            overflow-wrap: break-word
            font-weight: 200
            text-overflow: ellipsis
            .col
                display: flex
                flex-direction: column
                justify-content: space-evenly
                overflow-wrap: break-word
                align-items: center
                b
                    padding: 0px 2px
        div
          text-align: center
          display: flex
          justify-content: center
          align-items: center
    //Webkit scrollbar
    #variant-list-bar::-webkit-scrollbar
      display: none
    //Firefox scrollbar
    #variant-list-bar
      scrollbar-width: none
    //old IE
    #variant-list-bar
      -ms-overflow-style: none
    #variant-list-bar-sudo-scroll
      position: absolute
      top: 0
      right: 0
      width: 10px
      height: 100%
      box-sizing: border-box
      background-color: #F5F5F5
      z-index: 2
      #variant-list-bar-sudo-scroll-thumb
        width: 95%
        height: 50px
        position: relative
        background-color: #CCCCCC
        border-radius: 10px
        box-sizing: border-box
        cursor: pointer
        &:hover
          background-color: #B8B8B8
  </style>
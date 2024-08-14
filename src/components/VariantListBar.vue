<template>
  <div id="variant-sudo-scroll-wrapper">
    <div id="variant-list-bar">
      <div v-if="svList && svList.length > 0" id="variant-list-bar-header">
        <div @click="showSortOptions = !showSortOptions" class="sort-btn">
          <div class="sort-options-popup" :class="{hidden: !showSortOptions}">
            <span @click="emitSortVariants($event, 'goi')">Genes of Interest Overlapped</span>
            <span @click="emitSortVariants($event, 'genesOverlapped')">Genes Overlapped</span>
            <span @click="emitSortVariants($event, 'percentOverlapped')">Max Percentage Phens Overlapped</span>
          </div>
          <svg class="sort-svg" v-if="!loading" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
            <title>sort</title>
            <path d="M18 21L14 17H17V7H14L18 3L22 7H19V17H22M2 19V17H12V19M2 13V11H9V13M2 7V5H6V7H2Z" />
          </svg>

          <svg class="loading-svg" v-if="loading" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
            <title>loading</title>
            <path d="M12,4V2A10,10 0 0,0 2,12H4A8,8 0 0,1 12,4Z" />
          </svg>
        </div>
        <div>Variant <br> Overlaps</div>
        <div>Chr</div>
        <div>Location</div>
        <div>Size</div>
        <div>Type</div>
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
    loading: {
      type: Boolean,
      default: false
    },
    sorted: {
      type: Boolean,
      default: false
    }
  },
  data () {
    return {
      open: true,
      scrollSelection: [0, 40],
      openedSvSet: {}, 
      showSortOptions: false
    }
  },
  mounted () {
    //we want to listen for scroll events on the variant list bar... if we are at the bottom, we want to load more variants
    let variantListBar = document.getElementById('variant-list-bar');

    variantListBar.addEventListener('scroll', this.handleScroll);

    //the initial thumb size will be the size of the scrollSelection[1] / svList.length * 100
    let thumb = document.getElementById('variant-list-bar-sudo-scroll-thumb');
    thumb.style.height = (this.scrollSelection[1] / this.svList.length * 100) + '%'

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
        scrollSelection[0] = this.svList.length - 40;
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
        thumb.style.top = (this.scrollSelection[0] / this.svList.length * 100) + '%';
      }
    },
    handleScrollDrag(scrollSelection) {
      this.scrollSelection = scrollSelection;
      let thumb = document.getElementById('variant-list-bar-sudo-scroll-thumb');
      thumb.style.top = (this.scrollSelection[0] / this.svList.length * 100) + '%';
    },
    emitSortVariants(event, sortCategory) {
      if (this.loading === true) {
        return
      }
      //stop the propagation of the event
      event.stopPropagation();
      this.showSortOptions = false;
      this.$emit('sort-variants', sortCategory)
    }
  },
  computed: {
    svListSelection() {
      return this.svList.slice(this.scrollSelection[0], this.scrollSelection[1])
    }
  },
  watch: {
    svList(newVal, oldVal) {
      if (oldVal.length === 0 && newVal !== oldVal) {
        let thumb = document.getElementById('variant-list-bar-sudo-scroll-thumb');
        thumb.style.height = (this.scrollSelection[1] / this.svList.length * 100) + '%'
      }
    },
  },
  }
  </script>
  
  <style lang="sass">
    #variant-sudo-scroll-wrapper
      height: 100%
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
      min-width: 250px
      height: 100%
      box-sizing: border-box
      overflow-y: auto
      position: relative
      transition: width 0.4s, min-width 0.4s
      #variant-list-bar-header
        display: grid
        grid-template-columns: .025fr .21fr .15fr .25fr .25fr .15fr
        font-size: .8em
        width: 100%
        height: 50px
        margin: 0px
        padding: 5px
        box-sizing: border-box
        position: sticky
        top: 0
        background-color: white
        color: #2A65B7
        border-bottom: 1px solid #2A65B7
        border-top: 1px solid #2A65B7
        font-weight: bold
        box-shadow: 0px 2px 5px 0px rgba(0,0,0,0.1)
        z-index: 1
        div
          text-align: center
          display: flex
          justify-content: center
          align-items: center
        .sort-btn
          cursor: pointer
          overflow: visible
          border: 2px solid transparent
          border-radius: 50%
          transition: all 0.25s
          position: relative
          &.sorted
            cursor: not-allowed
            &:hover
              border: 2px solid transparent
          svg
            width: 20px
            height: 20px
            fill: #2A65B7
            pointer-events: none
            &.sorted
              filter: grayscale(100%)
            &.loading-svg
              animation: spin 1s linear infinite
            @keyframes spin
              0%
                transform: rotate(0deg)
              100%
                transform: rotate(360deg)
          &:hover
            border: 2px solid #2A65B7
            border-radius: 5px
          .sort-options-popup
            position: absolute
            top: 109%
            left: 0px
            width: 250px
            height: 90px
            padding: 5px
            font-weight: normal
            background-color: white
            border: 1px solid #ADC2DF
            border-radius: 5px
            display: flex
            flex-direction: column
            justify-content: space-around
            align-items: flex-start
            transition: height 0.25s, opacity 0.15s
            opacity: .95
            &.hidden
              opacity: 0
              pointer-events: none
              height: 0px
              border: 0px
            span
              cursor: pointer
              padding: 5px
              width: 100%
              border-radius: 5px 5px 0px 0px
              text-align: left
              border-bottom: 1px solid #ADC2DF
              &:hover
                background-color: #F5F5F5
              &:last-of-type
                border-radius: 0px 0px 5px 5px
                border-bottom: none
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
      background-color: #F5F5F5
      z-index: 2
      #variant-list-bar-sudo-scroll-thumb
        width: 100%
        height: 50px
        position: relative
        background-color: #2A65B7
        border-radius: 3px
        box-sizing: border-box
        cursor: pointer
        &:hover
          background-color: #1A4A9C
  </style>
<template>
  <div id="variant-sudo-scroll-wrapper">
    <div id="variant-list-bar">
      <div v-if="svList && svList.length > 0" id="variant-list-bar-header">
        <div></div>
        <div>Variant <br> Overlaps</div>
        <div>Chrom.</div>
        <div>Location</div>
        <div>Size</div>
        <div>Type</div>
      </div>
      <VariantListItem 
        v-for="(variant, index ) in svListSelection" 
        :key="`${variant.chromosome}-${variant.start}-${variant.end}`" 
        :variant="variant"
        :openedSvSet="openedSvSet"
        :patientPhenotypes="patientPhenotypes"
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
    }
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
      border: 1px solid #F5F5F5
      border-radius: 5px
      overflow-y: auto
      position: relative
      transition: width 0.4s, min-width 0.4s
      #variant-list-bar-header
        display: grid
        grid-template-columns: .05fr .195fr .15fr .25fr .25fr .15fr
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
        font-weight: bold
        box-shadow: 0px 2px 5px 0px rgba(0,0,0,0.1)
        z-index: 1
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
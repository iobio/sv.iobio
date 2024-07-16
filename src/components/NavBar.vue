<template>
    <div id="nav-bar">
      <button @click="this.$emit('toggleFilterDataSection')" :class="{highlight: filterDataOpen}">Filter Variants</button>
      <!-- file input -->
      <div class="nav-bar-item-wrapper">
        <label class="nav-bar-item-sub" for="phenotypes">Patient Phenotypes</label>
        <textarea class="nav-bar-item-sub" name="phenotypes" v-model="phenotypesOfInterestText"></textarea>
        <button class="nav-bar-item-sub" @click="sendPOI">save</button>
      </div>

      <div class="nav-bar-item-wrapper">
        <label class="nav-bar-item-sub" for="genesOfInterest">Genes of Interest</label>
        <textarea class="nav-bar-item-sub" name="genesOfInterest" v-model="genesOfInterestText"></textarea>
        <button class="nav-bar-item-sub" @click="sendGOI">save</button>
      </div>

      <button @click="this.$emit('toggleSelectDataSection')" :class="{highlight: selectDataOpen}">Select Data</button>
      <button id="disclaimer-btn" @click="toggleDisclaimer"><img src="/dots-vertical.svg" alt=""></button>

      <div id="disclaimer-overlay" v-if="showDisclaimer">
        <div id="disclaimer-text">
          <p>
            The University of Utah makes no claims that iobio applications, including sv.iobio 
            are approved for clinical use. All users of iobio applications including sv.iobio understand 
            and accept that any information gained by using these applications, whether the information 
            comes from visualization, processing, internal or external databases, or analysis, may not in 
            any way be used for clinical purposes. The University of Utah makes no representation that 
            iobio or simpheny.iobio is either safe or effective for any intended use for which research may currently 
            be performed.
            <br>
            <br>
            Iobio, or any iobio applications ARE TO BE USED FOR RESEARCH PURPOSES ONLY. USE FOR CLINICAL PURPOSES 
            IS EXPRESSLY FORBIDDEN. Approval of iobio applications for clinical use has neither been applied for, nor 
            received, in any country, including the United States of America.
          </p>
          <button @click="toggleDisclaimer">Close</button>
        </div>
      </div>
    </div>
  </template>
  
  <script>
  export default {
  name: 'NavBar',
  components: {
  },
  props: {
    selectDataOpen: Boolean,
    filterDataOpen: Boolean,
  },
  data () {
    return {
      genesOfInterestText: '',
      phenotypesOfInterestText: '',
      showDisclaimer: false
    }
  },
  mounted () {
  },
  methods: {
    toggleDisclaimer() {
      this.showDisclaimer = !this.showDisclaimer;
    },
    sendGOI() {
      //send out genes of interest to the app (allow split on ';', ',', or ' ')
      //trim any whitespace
      this.genesOfInterestText = this.genesOfInterestText.trim();
      let genesOfInterest = this.genesOfInterestText.split(/[;, ]+/);
      //if genesOfInterest is empty, send an empty array
      if (genesOfInterest.length === 1 && genesOfInterest[0] === '') {
        genesOfInterest = [];
      }
      this.$emit('updateGenesOfInterest', genesOfInterest)
    },
    sendPOI() {
      //send out phenotypes of interest to the app (allow split on ';', ',', or ' ')
      //trim any whitespace
      this.phenotypesOfInterestText = this.phenotypesOfInterestText.trim();
      let phenotypesOfInterest = this.phenotypesOfInterestText.split(/[;, ]+/);
      //if phenotypesOfInterest is empty, send an empty array
      if (phenotypesOfInterest.length === 1 && phenotypesOfInterest[0] === '') {
        phenotypesOfInterest = [];
      }
      this.$emit('updatePhenotypesOfInterest', phenotypesOfInterest)
    }
  },
  computed: {
  },
  watch: {
  },
  }
  </script>
  
  <style lang="sass">
    #nav-bar
      display: flex
      flex-direction: row
      align-items: center
      justify-content: space-around
      padding: 10px 10px
      width: 100%
      box-sizing: border-box
      background-color: #0D60C3
      color: white
      z-index: 4
      #disclaimer-overlay
        position: absolute
        top: 0px
        left: 0px
        width: 100vw
        height: 100vh
        background-color: rgba(0, 0, 0, 0.5)
        display: flex
        justify-content: center
        align-items: center
        #disclaimer-text
          background-color: white
          padding: 20px
          border-radius: 5px
          max-width: 800px
          p
            margin: 0px
            color: black
          button
            margin-top: 10px
            padding: 5px 10px
            border: 1px solid #0B4B99
            border-radius: 3px
            background-color: #0B4B99
            color: white
            cursor: pointer
            transition: all 0.15s ease
            &:hover
              filter: brightness(120%)
              border: 1px solid white
      button
        border: 1px solid #0B4B99 
        border-radius: 3px
        background-color: #0B4B99
        color: white
        cursor: pointer
        transition: all 0.15s ease
        height: 100%
        &#disclaimer-btn
          display: flex
          justify-content: center
          align-items: center
          padding: 0px
          height: 100%
          background-color: transparent
          border: none
          width: auto
          margin-left: 5px
          border-radius: 50%
          transition: background-color 0.25s ease-in
          &:hover
            background-color: #0B4B99
          img
            height: 100%
            width: auto
            display: block
            transform: translate(0px, 0px)
        &:hover
          filter: brightness(120%)
          border: 1px solid white
        &.highlight
          background-color: #0D60C3
          border: 2px solid white
          box-shadow: 0px 0px 5px 0px white
    .alt-section-text.nav
      color: white
      position: relative
      left: 10px
    .nav-bar-item-wrapper
      display: flex
      flex-direction: row
      align-items: center
      height: 100%
      flex-grow: 1
      margin-right: 20px
    .nav-bar-item-sub
      margin: 0px 5px 0px 5px
    textarea.nav-bar-item-sub
      flex-grow: 1
      border: none
      border-radius: 3px
      resize: none
    button.nav-bar-item-sub
      height: 100%
  </style>
<template>
    <div id="nav-bar">
      <div id="loading-container" disabled v-if="!loaded">
        <p>Associations Loaded {{ progressPercent }}%</p>
        <div class="progress-bar"></div>
      </div>
      <!-- file input -->
      <div class="nav-bar-item-wrapper">
        <label class="nav-bar-item-sub" for="phenotypes">Phenotypes <br> <span>(HPO)</span></label>
        <textarea class="nav-bar-item-sub" name="phenotypes" v-model="phenotypesOfInterestText"></textarea>
        <div class="column-container">
          <button class="nav-bar-item-sub save" @click="sendPOI">save</button>
          <button class="nav-bar-item-sub clear" v-if="phenotypesOfInterestText.length > 0" @click="clearPOI">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
              <title>backspace-outline</title>
              <path d="M19,15.59L17.59,17L14,13.41L10.41,17L9,15.59L12.59,12L9,8.41L10.41,7L14,10.59L17.59,7L19,8.41L15.41,12L19,15.59M22,3A2,2 0 0,1 24,5V19A2,2 0 0,1 22,21H7C6.31,21 5.77,20.64 5.41,20.11L0,12L5.41,3.88C5.77,3.35 6.31,3 7,3H22M22,5H7L2.28,12L7,19H22V5Z" />
            </svg>
          </button>
        </div>
      </div>

      <div class="nav-bar-item-wrapper">
        <label class="nav-bar-item-sub" for="genesOfInterest">Genes of Interest <br> <span>(GOI)</span></label>
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
    loaded: Boolean,
    progressPercent: Number,
    goiFromParent: Array,
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
      this.genesOfInterestText = this.genesOfInterestText.toUpperCase();
      let genesOfInterest = this.genesOfInterestText.split(/[;, ]+/);
      //ensure there are no empty strings
      genesOfInterest = genesOfInterest.filter(gene => gene !== '');

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
      //ensure there are no empty strings
      phenotypesOfInterest = phenotypesOfInterest.filter(phenotype => phenotype !== '');
      //if phenotypesOfInterest is empty, send an empty array
      if (phenotypesOfInterest.length === 1 && phenotypesOfInterest[0] === '') {
        phenotypesOfInterest = [];
      }
      this.$emit('updatePhenotypesOfInterest', phenotypesOfInterest)
    },
    clearPOI() {
      this.phenotypesOfInterestText = '';
      this.sendPOI();
    }
  },
  computed: {
  },
  watch: {
    progressPercent() {
      let progressBar = document.querySelector('.progress-bar');
      if (progressBar) {
        progressBar.style.width = this.progressPercent + '%';
      }
    },
    goiFromParent() {
      let goiText = this.goiFromParent.join('; ');
      let localText = this.genesOfInterestText;

      if (goiText !== localText) {
        this.genesOfInterestText = goiText;
      }
    }
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
      background-color: #0D60C3
      color: white
      z-index: 5
      .column-container
        display: flex
        flex-direction: column
        align-items: flex-start
        justify-content: space-between
        height: 100%
        .nav-bar-item-sub.save
          margin-bottom: 1px
          width: 100%
          display: flex
          justify-content: center
          align-items: center
        .nav-bar-item-sub.clear
          margin-top: 1px
          display: flex
          border: 1px solid #CC0000
          background-color: #FFADAD
          justify-content: center
          align-items: center
          svg
            height: 15px
            width: auto
            display: block
            fill: #CC0000
      #loading-container
        display: flex
        flex-direction: column
        align-items: center
        justify-content: space-between
        height: 100%
        padding: 5px 10px
        p
          margin: 0px
          font-size: .9em
          border-bottom: 1px solid white
          font-style: italic
          padding: 0px 2px
        .progress-bar
          width: 1%
          height: 5px
          background-color: #CCE0D7
          align-self: flex-start
          border-radius: 3px
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
          padding: 40px
          border-radius: 5px
          max-width: 800px
          display: flex
          flex-direction: column
          align-items: center
          p
            margin: 0px
            color: black
            line-height: 1.5
          button
            align-self: flex-end
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
      text-align: end
      span
        font-weight: 200
        font-size: 1em
        font-style: italic
        font-family: 'Courier New', Courier, monospace
    textarea.nav-bar-item-sub
      flex-grow: 1
      border: none
      border-radius: 3px
      resize: none
      text-align: start
    button.nav-bar-item-sub
      height: 100%
  </style>
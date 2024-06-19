<template>
    <div id="nav-bar">
      <button @click="this.$emit('toggleFilterDataSection')">Filter Variants</button>
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

      <button @click="this.$emit('toggleSelectDataSection')">Select Data</button>

    </div>
  </template>
  
  <script>
  export default {
  name: 'NavBar',
  components: {
  },
  props: {
  },
  data () {
    return {
      genesOfInterestText: '',
      phenotypesOfInterestText: '',
    }
  },
  mounted () {
  },
  methods: {
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
      button
        border: 1px solid #0B4B99 
        border-radius: 3px
        background-color: #0B4B99
        color: white
        cursor: pointer
        transition: all 0.15s ease
        height: 100%
        &:hover
          filter: brightness(120%)
          border: 1px solid white
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
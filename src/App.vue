<template>
  <div id="main-container">
    <div id="upper-bar-container">
      <NavBar />
      <UpperChromBar
        :svList="svList"/>
    </div>

    <div id="lower-block-container">
      <VariantListBar 
        :svList="svList"/>
      <div id="lower-sections-container">
        <LeftTracksSection 
          :svList="svList"/>
        <RightSection />
      </div>
    </div>

  </div>
</template>

<script>
  import UpperChromBar from './components/UpperChromBar.vue'
  import LeftTracksSection from './components/LeftTracksSection.vue';
  import RightSection from './components/RightSection.vue';
  import VariantListBar from './components/VariantListBar.vue';
  import NavBar from './components/NavBar.vue';
  import Sv from './models/Sv.js'

  export default {
    name: 'app',
    components: {
      UpperChromBar,
      LeftTracksSection,
      RightSection,
      VariantListBar,
      NavBar
    },
    data() {
      return {
        svList: [],
      }
    },
    mounted() {
      fetch('http://localhost:3000/vcfJson')
        .then(response => response.json())
        .then(data => {
          for (let i = 0; i < data.length; i++) {
            this.svList.push(new Sv(data[i]))
          }
          console.log(this.svList)
        });
    },
    methods: {
    },
  }

</script>

<style lang="sass">
  #logo-div 
    position: absolute
    right: 5px
    top: 0px
  
  #main-container 
    box-sizing: border-box
    display: flex
    flex-direction: column
    height: 100vh
    width: 100%
  
  #lower-block-container 
    display: flex
    flex-direction: row
    flex-grow: 1
    justify-content: center
    width: 100%
    overflow: hidden

  #upper-bar-container
    display: flex
    flex-direction: column
    height: fit-content
    width: 100%
  
  #lower-sections-container
    display: flex
    flex-direction: row
    height: 100%
    justify-content: center
    flex-grow: 1

  img 
    height: 30px
    margin-right: 0px
    padding-right: 0px
    transform: translate(3px, 5px)
    width: 30px

</style>
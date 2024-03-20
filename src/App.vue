<template>
  <div id="main-container">
    <UpperChromBar />
    <div id="lower-block-container">
      <VariantListBar />
      <div id="lower-sections-container">
        <LeftTracksSection />
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

  export default {
    name: 'app',
    components: {
      UpperChromBar,
      LeftTracksSection,
      RightSection,
      VariantListBar
    }
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
    height: 100%
    width: 100%
  
  #lower-block-container 
    display: flex
    flex-direction: row
    height: 100%
    justify-content: center
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
  
  span 
    color: #1F68C1
    font-size: 25px
    font-weight: bold
    margin-left: 0px
    padding-left: 0px
    #bio-span 
      color: #A63D40

</style>./components/LeftTracksSection.vue
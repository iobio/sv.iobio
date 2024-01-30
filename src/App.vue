<template>
  <div id="main-container">
    <div id="logo-div">
      <img src="/sv.svg" alt="logo">
      <span>.iobio</span>
    </div>

    <ChartsContainer />

  </div>
</template>

<script>
  import ChartsContainer from './components/ChartsContainer.vue'

  export default {
    name: 'app',
    components: {
      ChartsContainer
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
    height: 100%
    padding-top: 40px
    width: 100%
  
  img 
    height: 30px
    margin-right: 0px
    padding-right: 0px
    transform: translate(3px, 5px)
    width: 30px
  
  span 
    color: #4188b8
    font-size: 25px
    font-weight: bold
    margin-left: 0px
    padding-left: 0px

</style>
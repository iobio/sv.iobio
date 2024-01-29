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

<style lang="css">
  #logo-div {
    position: absolute;
    top: 0px;
    right: 5px;
  }

  #main-container {
    width: 100%;
    height: 100%;
    padding-top: 40px;
    box-sizing: border-box;
  }

  img {
    width: 30px;
    height: 30px;
    margin-right: 0px;
    padding-right: 0px;
    transform: translate(3px, 5px);
  }
  span {
    font-size: 25px;
    font-weight: bold;
    color: #4188b8;
    margin-left: 0px;
    padding-left: 0px;
  }

</style>
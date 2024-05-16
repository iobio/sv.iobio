<template>
    <div id="nav-bar">
      <!-- file input -->
      <div class="nav-bar-item-wrapper">
        <label class="nav-bar-item-sub" for="phenotypes">Patient Phenotypes</label>
        <textarea class="nav-bar-item-sub" type="textarea" name="phenotypes"></textarea>
        <button class="nav-bar-item-sub">save</button>
      </div>

      <div class="nav-bar-item-wrapper">
        <label class="nav-bar-item-sub" for="genesOfInterest">Genes of Interest</label>
        <textarea class="nav-bar-item-sub" type="textarea" name="genesOfInterest"></textarea>
        <button class="nav-bar-item-sub">save</button>
      </div>

      <button>Select Data</button>

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
    }
  },
  mounted () {
  },
  methods: {
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
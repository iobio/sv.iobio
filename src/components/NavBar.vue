<template>
    <div id="nav-bar">
        <div class="alt-section-text nav">SV.iobio</div>
        <!-- file input -->
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
      justify-content: space-between
      padding: 5px 10px
      width: 100%
      box-sizing: border-box
      background-color: #1D2F5E
      color: white
    .alt-section-text.nav
      color: white
  </style>
<template>
    <div id="right-section">
      <div class="alt-section-text">Explore Section</div>
    </div>
  </template>
  
<script>
  export default {
  name: "RightSection",
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
  #right-section
    display: flex
    flex-direction: column
    align-items: center
    justify-content: center
    padding-top: 10px
    padding-bottom: 10px
    flex-grow: .75
    flex-basis: .75
    height: 100%
    box-sizing: border-box
    border: 1px solid #F5F5F5
    border-radius: 5px
  .alt-section-text
    font-size: 25px
    font-weight: bold
    color: #1F68C1
</style>
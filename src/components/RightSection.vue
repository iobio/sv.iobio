<template>
    <div id="right-section">
      <div class="alt-section-text explore">Explore Section</div>
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
  #right-section-container
    &.collapsed
      #right-section
        width: 0px
        overflow: hidden
  #voi-container
    display: flex
    flex-direction: column
    align-items: flex-start
    justify-content: flex-start
    width: 100%
    height: 100%
    box-sizing: border-box
    overflow-y: auto
    overflow-x: hidden
    div
      margin-top: 5px
      margin-bottom: 5px
      width: 100%
      height: fit-content
      box-sizing: border-box
    .gene-container
      width: 100%
      display: flex
      flex-direction: column
      align-items: flex-start
      justify-content: flex-start
      height: fit-content
      box-sizing: border-box
      border-bottom: 1px solid #F5F5F5
      padding: 5px
      div
        margin-top: 5px
        margin-bottom: 5px
        width: 100%
        height: fit-content
        box-sizing: border-box
  
.alt-section-text.explore
  font-size: 25px
  font-weight: bold
  color: #1F68C1
  width: 100%
  text-align: center

.red
  color: red
  font-weight: bold
  border: 1px solid red
</style>
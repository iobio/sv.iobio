<template>
    <div id="variant-list-bar">
      <div v-if="!svList || svList.lenght == 0" class="alt-section-text">Variant List</div>
        <div v-for="(sv, index) in svList" :key="index" class="variant-list-item">
          <div class="variant-list-item-text">Rank: {{ sv.rank }} // {{sv.chromosome}}:{{sv.start}}-{{sv.end}}</div>
        </div>
    </div>
  </template>
  
  <script>
  export default {
  name: "VariantListBar",
  components: {
  },
  props: {
    svList: Array
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
    #variant-list-bar
      display: flex
      flex-direction: column
      align-items: flex-start
      justify-content: flex-start
      padding-top: 10px
      padding-bottom: 10px
      width: 250px
      height: 100%
      box-sizing: border-box
      border: 1px solid #F5F5F5
      border-radius: 5px
      overflow-y: auto
  </style>
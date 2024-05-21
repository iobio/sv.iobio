<template>
    <div id="right-section">
      <div v-if="!variantOfInterest" class="alt-section-text explore">Explore Section</div>
      <div id="voi-container" v-else>

        <div>Chromosome: {{ variantOfInterest.chromosome }}</div>
        <div>Start: {{ variantOfInterest.start }}</div>
        <div>End: {{ variantOfInterest.end }}</div>
        <div>Type: {{ variantOfInterest.type }}</div>

        <div class="gene-container" v-for="(gene, index) in variantOfInterest.info.Exomiser">
          <div>Gene Symbol: {{ gene.geneSymbol }}</div>
          <div>Gene Rank: {{ gene.geneRank}}</div>
          <div>Gene ID: {{ gene.geneId }}</div>
          <div v-if="gene.omim !== '' && gene.omim != ' '">Omim: {{ gene.omim }}</div>
          <div v-if="gene.disease !== '' && gene.disease != ' '">Disease: {{ gene.disease}}</div>
        </div>
      </div>
    </div>
  </template>
  
<script>
  export default {
  name: "RightSection",
  components: {
  },
  props: {
    variantOfInterest: Object,
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
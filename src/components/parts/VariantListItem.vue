<template>
    <div id="variant-list-item">
        <div class="preview" :class="{opened: showMore}" @click="showMore = !showMore">
            <div class="rank-text">{{ variant.rank }}</div>
            <div>{{ variant.chromosome }}</div>
            <div class="location-text">st: {{ variant.start }} end: {{ variant.end }}</div>
            <div class="type-text">{{ variant.type }}</div>
        </div>
        <div v-if="showMore" class="more-info">
            <div><span>Effect:</span> <span>{{ variant.effect.toLowerCase() }}</span></div>
            <div><span>Max AF:</span> <span>{{ variant.info.Max_AF }}</span></div>
            <div><span>Gene:</span> <span>{{ variant.gene.geneSymbol }}</span></div>
            <div><span>Ex. Combined:</span> <span>{{ roundScore(variant.exomiserCombScore) }}</span></div>
            <div><span>Ex. Priority:</span> <span>{{ roundScore(variant.exomiserPriorityScore) }}</span></div>
        </div>
    </div>
  </template>
  
  <script>
  export default {
  name: 'VariantListItem',
  components: {
  },
  props: {
    variant: Object
  },
  data () {
    return {
        showMore: false
    }
  },
  mounted () {
  },
  methods: {
    roundScore(score) {
        //turn score to number
        score = parseFloat(score)
        return Math.round(score * 1000) / 1000
    }
  },
  computed: {
  },
  watch: {
  },
  }
  </script>
  
  <style lang="sass">
    #variant-list-item
        width: 100%
        .preview
            display: grid
            grid-template-columns: 1fr 1fr 1.5fr 1fr
            padding: 5px
            width: 100%
            box-sizing: border-box
            border-bottom: 1px solid #F5F5F5
            &.opened
                box-shadow: 0px 2px 5px 0px rgba(0,0,0,0.1)
            .rank-text
                color: #2A65B7
                font-weight: bold
            .location-text
                font-size: 0.7em
            .type-text
                border: 1px solid black
                border-radius: 5px
            div
                display: flex
                align-items: center
                justify-content: center
            &:hover
                background-color: #F5F5F5
                cursor: pointer
        .more-info
            display: flex
            flex-direction: column
            align-items: flex-start
            justify-content: flex-start
            padding: 5px
            width: 100%
            box-sizing: border-box
            border-bottom: 1px solid #F5F5F5
            div
                width: 100%
                display: flex
                justify-content: space-between
                span
                    font-size: 0.8em
                    margin-right: 5px
        
  </style>
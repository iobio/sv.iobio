<template>
    <div id="variant-list-item">
        <div class="preview" :class="{opened: showMore}" @click="showMore = !showMore">
            <div>{{ variant.rank }}</div>
            <div>{{ variant.chromosome }}</div>
            <div class="location-text">st: {{ variant.start }} end: {{ variant.end }}</div>
            <div class="type-text">{{ variant.type }}</div>
        </div>
        <div v-if="showMore" class="more-info">
            <div>Effect: {{ variant.effect.toLowerCase() }}</div>
            <div>Max AF: {{ variant.info.Max_AF }}</div>
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
                font-size: 0.9em
                white-space: nowrap
                text-overflow: ellipsis
                width: 100%
        
  </style>
<template>
    <div id="variant-list-item">
        <div class="preview" :class="{opened: showMore}" @click="variantClicked">
            <div>{{ variant.chromosome }}</div>
            <div class="location-text">st: {{ variant.start }} end: {{ variant.end }}</div>
            <div class="size-text">{{ (variant.end + 1) - variant.start }} bp</div>
            <div class="type-text" :class="{red: variant.type === 'DEL'}">{{ variant.type }}</div>
        </div>
        <div v-if="showMore && overlappedGenes" class="more-info">
            <div class="gene-row" v-for="gene in overlappedGenes">
                <span class="gene-symbol-span">{{ gene.gene_symbol }}</span>
                <div class="gene-information-section">
                    <p class="column" v-if="gene.phenotypes && Object.keys(gene.phenotypes).length > 0">
                        <span v-for="phenotype in gene.phenotypes">{{ phenotype.term_id }}</span>
                    </p>
                    <p class="column" v-if="gene.diseases && Object.keys(gene.diseases).length > 0">
                        <span v-for="disease in gene.diseases">{{ disease.disease_id }}</span>
                    </p>
                </div>
            </div>
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
        showMore: false,
        overlappedGenes: null
    }
  },
  mounted () {
  },
  methods: {
    roundScore(score) {
        //turn score to number
        score = parseFloat(score)
        return Math.round(score * 1000) / 1000
    }, 
    variantClicked() {
        this.getOverlappedGenes()
        this.showMore = !this.showMore
        if (this.showMore) {
            this.$emit('variant-clicked', this.variant, 'show')
        } else {
            this.$emit('variant-clicked', this.variant, 'hide')
        }
    },
    getOverlappedGenes() {
        fetch(`http://localhost:3000/genes/region?build=hg38&source=refseq&startChr=${'chr'+this.variant.chromosome}&startPos=${this.variant.start}&endChr=${'chr'+this.variant.chromosome}&endPos=${this.variant.end}`)
        .then(response => response.json())
        .then(data => {
            let overlappedGenes = data;
            let promises = [];

            Object.values(overlappedGenes).forEach(gene => {
                let phenPromise = fetch(`http://localhost:3000/genePhenotypes?gene=${gene.gene_symbol}`)
                    .then(response => response.json())
                    .then(data => {
                        gene.phenotypes = data;
                    });

                promises.push(phenPromise);

                let genePromise = fetch(`http://localhost:3000/geneDiseases?gene=${gene.gene_symbol}`)
                    .then(response => response.json())
                    .then(data => {
                        gene.diseases = data;
                    })
                promises.push(genePromise);
            })

            Promise.all(promises)
            .then(() => {
                this.overlappedGenes = overlappedGenes;
            })

        });    
    }
  },
  computed: {
  },
  watch: {
  },
  }
  </script>
  
  <style lang="sass">
    .collapsed
        #variant-list-bar
            #variant-list-item
                white-space: nowrap
    #variant-list-item
        width: 100%
        .preview
            display: grid
            grid-template-columns: 1fr 1.5fr 1fr 1fr
            grid-template-rows: 1fr
            padding: 5px
            width: 100%
            box-sizing: border-box
            border-bottom: 1px solid #F5F5F5
            &.opened
                box-shadow: 0px 2px 5px 0px rgba(0,0,0,0.1)
                background-color: #DEE9F7
                border-bottom: 1px solid #DEE9F7
            .rank-text
                color: #2A65B7
                font-weight: bold
            .location-text
                font-size: 0.7em
            .size-text
                font-size: 0.8em
            .type-text
                border: 1px solid black
                border-radius: 5px
                font-size: 0.8em
                &.red
                    color: red
                    font-weight: bold
                    border: 1px solid red
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
                .gene-span
                    padding: 2px
                    border-radius: 5px
                    font-size: 0.8em
                    border: 1px solid #2A65B7
                    background-color: #C1D1EA
                    color: #2A65B7
                    &:hover
                        background-color: #2A65B7
                        color: white
                        cursor: pointer
                .other-genes-container
                    display: flex
                    flex-wrap: wrap
                    span
                        margin-right: 3px
                        margin-top: 3px
                        padding: 2px
                        border-radius: 5px
                        font-size: 0.8em
                        border: 1px solid #2A65B7
                        background-color: #C1D1EA
                        color: #2A65B7
                        &:hover
                            background-color: #2A65B7
                            color: white
                            cursor: pointer
        .gene-row
            max-height: 200px
            display: flex
            flex-direction: column
            .gene-symbol-span
                width: 100%
                text-align: center
                border-bottom: 1px solid #C1D1EA
                border-top: 1px solid #C1D1EA
            .gene-information-section
                display: flex
                flex-grow: 1
                flex-direction: row
                overflow-x: hidden
                overflow-y: hidden
                .column
                    margin: 0px
                    padding: 5px 3px 5px 3px
                    box-sizing: border-box
                    display: flex
                    flex-direction: column
                    overflow-y: auto
                    overflow-x: hidden
                    &:first-of-type
                        flex-grow: 1
  </style>
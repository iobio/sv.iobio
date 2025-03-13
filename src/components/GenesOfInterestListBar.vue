<template>
    <div id="genes-of-interest-list-bar">
        <!-- Search Bar to Add Phenotypes -->
        <div id="goi-search-bar">
            <div id="goi-search-box">
                <input type="text" placeholder="Add/Search Genes" v-model="searchQuery" @input="searchGenes" />
                <div v-if="searchResults.length" class="search-results">
                    <ul>
                        <li v-for="result in searchResults" :key="result.gene_name" @click="selectGene(result.gene_name)">
                            {{ result.gene_name }}
                        </li>
                    </ul>
                </div>
            </div>

            <!-- Actions to Add Phenotypes -->
            <TippedButton buttonText="+" tipText="Add Gene(s) To List" position="bottom" />
            <TippedButton
                buttonText="Add Multiple"
                tipText="Add Multiple Genes"
                position="bottom"
                @click="showMultiGeneInput = !showMultiGeneInput" />

            <MultiGeneInput v-if="showMultiGeneInput" />
        </div>
        <!-- A list section to list all the added ones -->
        <div
            :class="{ focused: zoomedGeneName && zoomedGeneName == gene }"
            v-for="gene in genesOfInterest"
            class="genes-of-interest-list-bar-gene"
            @click="emitZoomToGene(gene)">
            <span class="close-btn">
                <svg @click="removeGeneFromList($event, gene)" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                    <title>delete gene</title>
                    <path
                        d="M12,20C7.59,20 4,16.41 4,12C4,7.59 7.59,4 12,4C16.41,4 20,7.59 20,12C20,16.41 16.41,20 12,20M12,2C6.47,2 2,6.47 2,12C2,17.53 6.47,22 12,22C17.53,22 22,17.53 22,12C22,6.47 17.53,2 12,2M14.59,8L12,10.59L9.41,8L8,9.41L10.59,12L8,14.59L9.41,16L12,13.41L14.59,16L16,14.59L13.41,12L16,9.41L14.59,8Z" />
                </svg>
            </span>
            <span>{{ gene }}</span>
        </div>
    </div>
</template>

<script>
import { searchForGene } from "../dataHelpers/dataHelpers.js";
import TippedButton from "./parts/TippedButton.vue";
import MultiGeneInput from "./parts/MultiGeneInput.vue";

export default {
    name: "GenesOfInterestListBar",
    components: {
        TippedButton,
        MultiGeneInput,
    },
    props: {
        genesOfInterest: {
            type: Array,
            required: true,
        },
        zoomedGeneName: {
            type: String,
            required: false,
        },
    },
    data() {
        return {
            searchQuery: "",
            searchResults: [],
            showMultiGeneInput: false,
        };
    },
    mounted() {},
    methods: {
        removeGeneFromList(event, gene) {
            event.stopPropagation();
            this.$emit("remove-gene-from-goi", gene);
        },
        emitZoomToGene(gene) {
            this.$emit("zoom-to-gene", gene);
        },
        async searchGenes() {
            if (this.searchQuery.trim() !== "") {
                let results = await searchForGene(this.searchQuery);
                this.searchResults = results.genes;
                console.log(this.searchResults);
            } else {
                this.searchResults = [];
            }
        },
        selectGene(gene) {
            if (gene == "") return;

            this.searchQuery = gene;
            this.searchResults = [];
        },
    },
    computed: {},
    watch: {},
};
</script>

<style lang="sass">
#genes-of-interest-list-bar
    display: flex
    flex-direction: column
    justify-content: flex-start
    height: 100%
    overflow-y: auto
    border-right: 1px solid #f0f0f0
    #goi-search-bar
        display: flex
        justify-content: space-between
        align-items: center
        gap: 5px
        padding: 1rem
        #goi-search-box
            position: relative
            flex: 1
            .search-results
                position: absolute
                top: 40px
                left: 0
                background: white
                border: 1px solid #e0e0e0
                border-radius: 5px
                max-height: 200px
                overflow-y: auto
                ul
                    list-style: none
                    margin: 0
                    padding: 0
                    li
                        padding: 5px 10px
                        &:hover
                            background-color: #f0f0f0
            input
                padding: 5px 10px
                border: 1px solid #e0e0e0
                border-radius: 5px
                width: 100%
    .genes-of-interest-list-bar-gene
        background-color: #f0f0f0
        border-radius: 5px
        padding: 5px
        margin: 5px
        width: fit-content
        display: flex
        align-items: center
        &.focused
            background-color: #707070
            color: white
            span > svg
                fill: white
                &:hover
                    fill: #f00
            &:hover
                color: black
        span
            cursor: pointer
        .close-btn
            cursor: pointer
            margin-right: 5px
            display: flex
            align-items: center
        svg
            width: 20px
            height: 20px
            fill: gray
            &:hover
                fill: #f00
        &:hover
            background-color: #e0e0e0
</style>

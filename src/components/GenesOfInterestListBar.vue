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
            <TippedButton buttonText="+" tipText="Add Gene(s) To List" position="bottom" @click="addGeneToList" />
            <TippedButton
                buttonText="Add Multiple"
                tipText="Add Multiple Genes"
                position="bottom"
                @click="showMultiGeneInput = !showMultiGeneInput" />

            <MultiGeneInput v-if="showMultiGeneInput" @add-genes="addGenesToList" @close="closeMultiGeneInput" />
        </div>
        <!-- A list section to list all the added ones -->
        <div
            :class="{ focused: zoomedGeneName && zoomedGeneName == gene }"
            v-for="gene in genesOfInterest"
            class="genes-of-interest-list-bar-gene"
            @click="emitZoomToGene(gene)">
            <TippedButton
                buttonText="X"
                tipText="Remove Gene"
                position="right"
                shape="circle"
                @click="removeGeneFromList($event, gene)" />
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
        addGeneToList() {
            let gene = this.searchQuery.trim();
            if (gene == "") return;
            this.$emit("add-gene-to-goi", gene);
            this.searchQuery = "";
        },
        addGenesToList(genes) {
            //this adds multiple genes to the list using the multi so we also want to close that
            this.showMultiGeneInput = false;
            this.$emit("add-genes-to-goi", genes);
        },
        closeMultiGeneInput() {
            this.showMultiGeneInput = false;
        },
        emitZoomToGene(gene) {
            this.$emit("zoom-to-gene", gene);
        },
        async searchGenes() {
            if (this.searchQuery.trim() !== "") {
                let results = await searchForGene(this.searchQuery);
                this.searchResults = results.genes;
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
        padding: 5px 10px
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

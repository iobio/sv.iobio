<template>
    <div id="phenotypes-list-bar">
        <div id="phenotypes-search-bar">
            <div id="phenotypes-search-box">
                <input type="text" placeholder="Add/Search Phenotypes" v-model="searchQuery" @input="searchPhenotypes" />
                <div v-if="searchResults.length" class="search-results">
                    <ul>
                        <li v-for="result in searchResults" :key="result.id" @click="selectPhenotype(result)">
                            {{ result.name }}
                        </li>
                    </ul>
                </div>
            </div>

            <TippedButton buttonText="+" tipText="Add Phenotype(s) To List" position="bottom" />
            <TippedButton
                buttonText="Add Multiple"
                tipText="Add Multiple Phenotypes"
                position="bottom"
                @click="showMultiPhenInput = !showMultiPhenInput" />
            <MultiPhenInput v-if="showMultiPhenInput" />
        </div>
    </div>
</template>

<script>
import { searchForPhenotype } from "../dataHelpers/dataHelpers.js";
import TippedButton from "./parts/TippedButton.vue";
import MultiPhenInput from "./parts/MultiPhenInput.vue";

export default {
    name: "PhenotypesListBar",
    components: {
        TippedButton,
        MultiPhenInput,
    },
    data() {
        return {
            searchQuery: "",
            searchResults: [],
            showMultiPhenInput: false,
        };
    },
    methods: {
        async searchPhenotypes() {
            if (this.searchQuery.trim() !== "") {
                this.searchResults = await searchForPhenotype(this.searchQuery);
            } else {
                this.searchResults = [];
            }
        },
        selectPhenotype(phenotype) {
            if (phenotype == "") return;

            this.searchQuery = phenotype.name;
            this.searchResults = [];
        },
    },
};
</script>

<style lang="sass">
#phenotypes-list-bar
    display: flex
    flex-direction: column
    justify-content: flex-start
    height: 100%
    overflow-y: auto
    border-right: 1px solid #f0f0f0
    #phenotypes-search-bar
        display: flex
        justify-content: space-between
        align-items: center
        gap: 5px
        padding: 1rem
        #phenotypes-search-box
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
</style>

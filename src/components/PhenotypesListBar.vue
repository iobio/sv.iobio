<template>
    <div id="phenotypes-list-bar">
        <!-- Search Bar to Add Phenotypes -->
        <div id="phenotypes-search-box">
            <input type="text" placeholder="Add/Search Phenotypes" v-model="searchQuery" @input="searchPhenotypes" />
            <div v-if="searchResults.length" class="search-results">
                <ul>
                    <li v-for="result in searchResults" :key="result.id" @click="selectPhenotype(result.id)">{{ result.id }}</li>
                </ul>
            </div>
        </div>
        <!-- Actions to Add Phenotypes -->
        <div id="add-phenotype-btn">
            <button>+</button>
        </div>
        <!-- A list section to list all the added ones -->
    </div>
</template>

<script>
import { searchForPhenotype } from "../dataHelpers/dataHelpers.js";

export default {
    name: "PhenotypesListBar",
    data() {
        return {
            searchQuery: "",
            searchResults: [],
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

            this.searchQuery = phenotype;
            this.searchResults = [];
        },
    },
};
</script>

<style lang="sass">
#phenotypes-list-bar
    display: flex
    justify-content: space-between
    height: 100%
    gap: 5px
    padding: 1rem
    border-right: 1px solid #f0f0f0
    #phenotypes-search-box
        flex: 1
        position: relative
        input
            padding: 5px 10px
            border: 1px solid #e0e0e0
            border-radius: 5px
            width: 100%
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
    #add-phenotype-btn
        button
            padding: 5px 10px
            border: 1px solid #e0e0e0
            border-radius: 5px
            background-color: #f0f0f0
            color: #333
            cursor: pointer
            transition: all 0.3s
            &:hover
                background-color: #e0e0e0
                color: #000
</style>

<template>
    <div id="phenotypes-list-bar">
        <div id="phenotypes-search-bar">
            <div id="phenotypes-search-box">
                <input
                    type="text"
                    placeholder="Add/Search Phenotypes"
                    v-model="searchedPhenotype.query"
                    @input="searchPhenotypes" />
                <div v-if="searchResults.length" class="search-results">
                    <ul>
                        <li v-for="result in searchResults" :key="result.id" @click="selectPhenotype(result)">
                            {{ result.name }} ({{ result.term_id }})
                        </li>
                    </ul>
                </div>
            </div>

            <TippedButton
                buttonText="+"
                tipText="Add Phenotype(s) To List"
                position="bottom"
                @click="addPhenotype(searchedPhenotype.term_id)" />
            <TippedButton
                buttonText="Add Multiple"
                tipText="Add Multiple Phenotypes"
                position="bottom"
                @click="showMultiPhenInput = !showMultiPhenInput" />
            <MultiPhenInput
                v-if="showMultiPhenInput"
                @close="showMultiPhenInput = false"
                @add-phenotypes="addMultiplePhenotypes" />
        </div>
        <div class="phenotype-row" v-for="phenotype in phenotypesLocal">
            <TippedButton
                :buttonSymbol="closeSvg"
                tipText="Remove Phenotype"
                position="right"
                shape="circle"
                @click="removePhenotype(phenotype.term_id)" />
            <div>{{ phenotype.name }}</div>
            <div>({{ phenotype.term_id }})</div>
        </div>
    </div>
</template>

<script>
import { searchForPhenotype, searchForHPO } from "../dataHelpers/dataHelpers.js";
import TippedButton from "./parts/TippedButton.vue";
import MultiPhenInput from "./parts/MultiPhenInput.vue";

export default {
    name: "PhenotypesListBar",
    components: {
        TippedButton,
        MultiPhenInput,
    },
    props: {
        phenotypes: Array,
    },
    data() {
        return {
            searchedPhenotype: { term_id: "", query: "" },
            searchResults: [],
            showMultiPhenInput: false,
            phenotypesLocal: {},
            closeSvg:
                '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><title>close-circle-outline</title><path d="M12,20C7.59,20 4,16.41 4,12C4,7.59 7.59,4 12,4C16.41,4 20,7.59 20,12C20,16.41 16.41,20 12,20M12,2C6.47,2 2,6.47 2,12C2,17.53 6.47,22 12,22C17.53,22 22,17.53 22,12C22,6.47 17.53,2 12,2M14.59,8L12,10.59L9.41,8L8,9.41L10.59,12L8,14.59L9.41,16L12,13.41L14.59,16L16,14.59L13.41,12L16,9.41L14.59,8Z" /></svg>',
        };
    },
    async mounted() {
        await this.setLocalPhenotypes();
    },
    methods: {
        async searchPhenotypes() {
            if (this.searchedPhenotype.query.trim() !== "") {
                this.searchResults = await searchForPhenotype(this.searchedPhenotype.query);
            } else {
                this.searchResults = [];
            }
        },
        selectPhenotype(phenotype) {
            if (phenotype == "") return;

            this.searchedPhenotype.query = phenotype.name;
            this.searchedPhenotype.term_id = phenotype.term_id;
            this.searchResults = [];
        },
        addPhenotype(term_id) {
            if (term_id == "") return;

            this.$emit("add-phenotype", term_id);
            this.searchedPhenotype = { term_id: "", query: "" };
        },
        removePhenotype(term_id) {
            this.$emit("remove-phenotype", term_id);
        },
        addMultiplePhenotypes(term_ids) {
            this.showMultiPhenInput = false;
            this.$emit("add-phenotypes", term_ids);
        },
        async setLocalPhenotypes() {
            let oldKeys = Object.keys(this.phenotypesLocal);
            let newLocalPhenotypes = {};
            for (let term_id of this.phenotypes) {
                if (!oldKeys.includes(term_id)) {
                    newLocalPhenotypes[term_id] = { term_id: term_id };
                    let result = await searchForHPO(term_id);
                    newLocalPhenotypes[term_id].name = result[0].name;
                } else {
                    newLocalPhenotypes[term_id] = this.phenotypesLocal[term_id];
                }
            }
            this.phenotypesLocal = newLocalPhenotypes;
        },
    },
    watch: {
        async phenotypes() {
            await this.setLocalPhenotypes();
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
    width: 100%
    overflow-y: auto
    border-right: 1px solid #f0f0f0
    .phenotype-row
        display: flex
        justify-content: space-between
        padding: 5px 10px
        border: 1px solid #e0e0e0
        border-radius: 5px
        margin: 1px 2px
        font-size: 0.95em
        :nth-child(2)
            text-transform: capitalize
            text-align: center
            text-overflow: ellipsis
            height: 100%
        svg
            width: 25px
            height: 25px
            &:hover
                fill: #f00
    #phenotypes-search-bar
        display: flex
        justify-content: space-between
        align-items: center
        gap: 5px
        padding: 5px 10px
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
                    cursor: pointer
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

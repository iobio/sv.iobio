<template>
    <div class="multi-gene-input">
        <textarea id="input-genes" name="genes" rows="5" @input="checkGenes" v-model="genesText"></textarea>
        <div class="btns-container">
            <button @click="this.$emit('close')">Cancel</button>
            <button :disabled="!allValidGenes" @click="addGenes">Add</button>
        </div>
        <div class="error-msg">
            <span v-show="!allValidGenes && genesNotFound.length > 0">
                Invalid gene(s) - remove or edit:
                <span class="unfound" v-for="gene in genesNotFound"> {{ gene + ", " }} </span>
            </span>
        </div>
    </div>
</template>

<script>
import { searchForGene } from "../../dataHelpers/dataHelpers.js";

export default {
    name: "MultiGeneInput",
    data() {
        return {
            genesText: "",
            genesNotFound: [],
            searchResults: [],
        };
    },
    methods: {
        async searchGenes(gene) {
            if (gene.trim() !== "") {
                let results = await searchForGene(gene);
                this.searchResults = results.genes;
            } else {
                this.searchResults = [];
            }
        },
        async checkGenes() {
            let unfound = [];
            for (let gene of this.genesList) {
                let result = await searchForGene(gene);
                if (result.genes.length == 0) {
                    unfound.push(gene);
                    continue;
                } else {
                    //We have results.gene check for an exact (case insensitive) match
                    let found = result.genes.find((g) => g.gene_name.toLowerCase() == gene.toLowerCase());
                    if (!found) {
                        unfound.push(gene);
                    }
                }
            }
            this.genesNotFound = unfound;
        },
        addGenes() {
            //The add button triggers this function, before you can press the add button
            //allValidGenes must be true, so we can safely assume that all genes are valid
            //genes are always uppercase so we can safely convert them to uppercase
            let uppercaseGenes = this.genesList.map((gene) => gene.toUpperCase());
            this.$emit("add-genes", uppercaseGenes);
            this.genesText = "";
        },
    },
    computed: {
        genesList() {
            let result = this.genesText
                .split(/,|;/)
                .map((gene) => gene.trim())
                .filter((gene) => gene !== "");
            return result;
        },
        allValidGenes() {
            //if there is nothing in the genesText, return false
            if (this.genesText.trim() == "") return false;

            if (this.genesNotFound.length == 0) return true;

            return false;
        },
    },
    mounted() {
        // Add your mounted lifecycle hook here
    },
    watch: {},
};
</script>

<style lang="sass">
.multi-gene-input
    position: absolute
    top: 100px
    left: 0
    width: 99%
    background-color: #f0f0f0
    border-radius: 5px
    gap: 5px
    display: flex
    flex-direction: column
    padding: 10px 10px 5px 10px
    box-shadow: 0px 0px 5px 0px rgba(0, 0, 0, 0.3)
    z-index: 2
    textarea
        padding: 5px 10px
        border: 1px solid #e0e0e0
        border-radius: 5px
        resize: none
        height: 100px
    .btns-container
        display: flex
        justify-content: flex-end
        gap: 5px
        button
            padding: 5px 10px
            border: 1px solid #e0e0e0
            border-radius: 5px
            background-color: #f0f0f0
            color: #333
            cursor: pointer
            &:hover
                background-color: #e0e0e0
        button:disabled
            background-color: #e0e0e0
            color: #999
            cursor: not-allowed
    .error-msg
        height: 20px
        display: flex
        align-items: center
        background-color: #f0f0f0
        font-size: 12px
        .unfound
            color: red
</style>

<template>
    <div class="multi-phen-input">
        <div class="input-type-choice">
            <label>
                <input type="radio" value="names" v-model="inputType" />
                Terms
            </label>
            <label>
                <input type="radio" value="hpoIds" v-model="inputType" />
                HPO IDs
            </label>
        </div>
        <textarea id="input-phenotypes" name="phenotypes" rows="5" @input="checkPhenotypes" v-model="phenotypesText"></textarea>
        <div class="btns-container">
            <button @click="this.$emit('close')">Cancel</button>
            <button :disabled="!allValidPhenotypes" @click="addPhenotypes">Add</button>
        </div>
        <div class="error-msg">
            <span v-show="!allValidPhenotypes && phenotypesNotFound.length > 0">
                Invalid phenotype(s) - remove or edit:
                <span class="unfound" v-for="phenotype in phenotypesNotFound">
                    {{ phenotype + ", " }}
                </span>
            </span>
        </div>
    </div>
</template>

<script>
import { searchForPhenotype, searchForHPO } from "../../dataHelpers/dataHelpers.js";

export default {
    name: "MultiPhenInput",
    data() {
        return {
            phenotypesText: "",
            inputType: "hpoIds",
            phenotypesNotFound: [],
            searchResults: [],
        };
    },
    methods: {
        async searchPhenotypes(phenotype) {
            if (phenotype.trim() !== "") {
                if (this.inputType == "hpoIds") {
                    let term_id = phenotype.toUpperCase();
                    let results = await searchForHPO(term_id);
                    this.searchResults = results;
                } else {
                    let results = await searchForPhenotype(phenotype);
                    this.searchResults = results;
                }
            } else {
                this.searchResults = [];
            }
        },
        async checkPhenotypes() {
            let unfound = [];
            for (let phenotype of this.phenotypesList) {
                let result;
                if (this.inputType == "hpoIds") {
                    let term_id = phenotype.toUpperCase();
                    result = await searchForHPO(term_id);

                    if (!result || result.length == 0) {
                        unfound.push(phenotype);
                        continue;
                    } else {
                        //We have results.phenotype check for an exact (case insensitive) match
                        let found = result.find((p) => p.term_id.toLowerCase() == phenotype.toLowerCase());
                        if (!found) {
                            unfound.push(phenotype);
                        }
                    }
                } else {
                    result = await searchForPhenotype(phenotype);
                    if (!result || result.length == 0) {
                        unfound.push(phenotype);
                        continue;
                    } else {
                        //We have results.phenotype check for an exact (case insensitive) match
                        let found = result.find((p) => p.name.toLowerCase() == phenotype.toLowerCase());
                        if (!found) {
                            unfound.push(phenotype);
                        }
                    }
                }
            }
            this.phenotypesNotFound = unfound;
        },
        addPhenotypes() {
            this.$emit("add-phenotypes", this.phenotypesList);
            this.phenotypesText = "";
        },
    },
    computed: {
        phenotypesList() {
            console.log(this.phenotypesText);
            let text = this.phenotypesText
                .split(/,|;/)
                .map((phenotype) => phenotype.trim())
                .filter((phenotype) => phenotype);
            console.log(text);
            return text;
        },
        allValidPhenotypes() {
            if (this.phenotypesText.trim() == "") return false;

            if (this.phenotypesNotFound.length == 0) return true;

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
.multi-phen-input
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
    .input-type-choice
        display: flex
        gap: 10px
        label
            display: flex
            align-items: center
            font-size: 14px
            font-weight: 200
            input
                margin-right: 5px
</style>

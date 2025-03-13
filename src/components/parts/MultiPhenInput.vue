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
        <textarea id="input-phenotypes" name="phenotypes" rows="5"></textarea>
        <div class="btns-container">
            <button>Cancel</button>
            <button>Add</button>
        </div>
        <div class="error-msg">
            <span v-show="!allValidPhenotypes">
                Invalid phenotype(s) - remove or edit:
                <span class="unfound" v-for="phenotype in phenotypesNotFound">
                    {{ phenotype }}
                </span>
            </span>
        </div>
    </div>
</template>

<script>
export default {
    name: "MultiPhenInput",
    data() {
        return {
            phenotypesText: "",
            inputType: "names",
        };
    },
    methods: {
        // Add your component methods here
    },
    computed: {
        phenotypesList() {
            return this.phenotypesText
                .split(/[,;]/)
                .map((phenotype) => phenotype.trim())
                .filter((phenotype) => phenotype);
        },
        allValidPhenotypes() {
            return false;
        },
        phenotypesNotFound() {
            return [];
        },
    },
    mounted() {
        // Add your mounted lifecycle hook here
    },
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

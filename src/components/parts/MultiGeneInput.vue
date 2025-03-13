<template>
    <div class="multi-gene-input">
        <textarea id="input-genes" name="genes" rows="5"></textarea>
        <div class="btns-container">
            <button>Cancel</button>
            <button>Add</button>
        </div>
        <div class="error-msg">
            <span v-show="!allValidGenes">
                Invalid gene(s) - remove or edit:
                <span class="unfound" v-for="gene in genesNotFound">
                    {{ gene }}
                </span>
            </span>
        </div>
    </div>
</template>

<script>
export default {
    name: "MultiGeneInput",
    data() {
        return {
            genesText: "",
        };
    },
    methods: {
        // Add your component methods here
    },
    computed: {
        genesList() {
            return this.genesText
                .split(/[,;]/)
                .map((gene) => gene.trim())
                .filter((gene) => gene);
        },
        allValidGenes() {
            return false;
        },
        genesNotFound() {
            return [];
        },
    },
    mounted() {
        // Add your mounted lifecycle hook here
    },
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
</style>

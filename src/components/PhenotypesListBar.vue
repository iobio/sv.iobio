<template>
    <div id="phenotypes-list-bar">
        <!-- Search Bar to Add Phenotypes -->
        <div id="phenotypes-search-box">
            <input type="text" placeholder="Add/Search Phenotypes" />
        </div>
        <!-- Actions to Add Phenotypes -->
        <div id="add-phenotype-btn">
            <button>+</button>
        </div>
        <!-- A list section to list all the added ones -->
    </div>
</template>

<script>
export default {
    name: "PhenotypesListBar",
    data() {
        return {
            foundPhenotypes: {},
        };
    },
    mounted() {},
    methods: {},
    computed: {},
};
</script>

<style lang="sass">
#phenotypes-list-bar
    display: flex
    justify-content: space-between
    align-items: center
    gap: 5px
    padding: 1rem
    #phenotypes-search-box
        flex: 1
        input
            padding: 5px 10px
            border: 1px solid #e0e0e0
            border-radius: 5px
            width: 100%
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

<template>
    <div id="nav-bar">
        <div id="loading-container" disabled v-if="!loaded">
            <p>Associations Loaded {{ progressPercent }}%</p>
            <div class="progress-bar"></div>
        </div>

        <button @click="this.$emit('toggleSelectDataSection')" :class="{ highlight: selectDataOpen }">Select Data</button>
        <span id="build-span">
            <b>Build</b>
            <br />
            {{ formattedHgBuild }}
        </span>
        <button id="disclaimer-btn" @click="toggleDisclaimer"><img src="/dots-vertical.svg" alt="" /></button>

        <div id="disclaimer-overlay" v-if="showDisclaimer">
            <div id="disclaimer-text">
                <p>
                    The University of Utah makes no claims that iobio applications, including sv.iobio are approved for clinical
                    use. All users of iobio applications including sv.iobio understand and accept that any information gained by
                    using these applications, whether the information comes from visualization, processing, internal or external
                    databases, or analysis, may not in any way be used for clinical purposes. The University of Utah makes no
                    representation that iobio or simpheny.iobio is either safe or effective for any intended use for which
                    research may currently be performed.
                    <br />
                    <br />
                    Iobio, or any iobio applications ARE TO BE USED FOR RESEARCH PURPOSES ONLY. USE FOR CLINICAL PURPOSES IS
                    EXPRESSLY FORBIDDEN. Approval of iobio applications for clinical use has neither been applied for, nor
                    received, in any country, including the United States of America.
                </p>
                <button @click="toggleDisclaimer">Close</button>
            </div>
        </div>
    </div>
</template>

<script>
export default {
    name: "NavBar",
    components: {},
    props: {
        selectDataOpen: Boolean,
        filterDataOpen: Boolean,
        loaded: Boolean,
        hgBuild: String,
        progressPercent: Number,
    },
    data() {
        return {
            showDisclaimer: false,
        };
    },
    mounted() {},
    methods: {
        toggleDisclaimer() {
            this.showDisclaimer = !this.showDisclaimer;
        },
    },
    computed: {
        formattedHgBuild() {
            if (this.hgBuild === "GRCh37" || this.hgBuild === "GRCh38") {
                return this.hgBuild;
            }

            if (this.hgBuild === "hg19") {
                return "GRCh37";
            } else if (this.hgBuild === "hg38") {
                return "GRCh38";
            } else {
                return "Unknown";
            }
        },
    },
    watch: {
        progressPercent() {
            let progressBar = document.querySelector(".progress-bar");
            if (progressBar) {
                progressBar.style.width = this.progressPercent + "%";
            }
        },
    },
};
</script>

<style lang="sass">
#nav-bar
    display: flex
    flex-direction: row
    align-items: center
    justify-content: space-around
    padding: 10px 10px
    width: 100%
    background-color: #0D60C3
    color: white
    z-index: 5
    .column-container
        display: flex
        flex-direction: column
        align-items: flex-start
        justify-content: space-between
        height: 100%
    .nav-bar-item-sub.save
        margin-bottom: 1px
        width: 100%
        display: flex
        justify-content: center
        align-items: center
    .nav-bar-item-sub.clear
        margin-top: 1px
        display: flex
        border: 1px solid #CC0000
        background-color: #FFADAD
        justify-content: center
        align-items: center
        svg
            height: 15px
            width: auto
            display: block
            fill: #CC0000
    #loading-container
        display: flex
        flex-direction: column
        align-items: center
        justify-content: space-between
        height: 100%
        padding: 5px 10px
        p
            margin: 0px
            font-size: .9em
            border-bottom: 1px solid white
            font-style: italic
            padding: 0px 2px
        .progress-bar
            width: 1%
            height: 5px
            background-color: #CCE0D7
            align-self: flex-start
            border-radius: 3px
    #disclaimer-overlay
        position: absolute
        top: 0px
        left: 0px
        width: 100vw
        height: 100vh
        background-color: rgba(0, 0, 0, 0.5)
        display: flex
        justify-content: center
        align-items: center
        #disclaimer-text
            background-color: white
            padding: 40px
            border-radius: 5px
            max-width: 800px
            display: flex
            flex-direction: column
            align-items: center
        p
            margin: 0px
            color: black
            line-height: 1.5
        button
            align-self: flex-end
            margin-top: 10px
            padding: 5px 10px
            border: 1px solid #0B4B99
            border-radius: 3px
            background-color: #0B4B99
            color: white
            cursor: pointer
            transition: all 0.15s ease
            &:hover
                filter: brightness(120%)
    button
        border: 1px solid #0B4B99
        border-radius: 3px
        background-color: #0B4B99
        color: white
        cursor: pointer
        transition: all 0.15s ease
        height: 100%
        &#disclaimer-btn
            display: flex
            justify-content: center
            align-items: center
            padding: 0px
            height: 100%
            background-color: transparent
            border: none
            width: auto
            margin-left: 5px
            border-radius: 50%
            transition: background-color 0.25s ease-in
            &:hover
                background-color: #0B4B99
        img
            height: 100%
            width: auto
            display: block
            transform: translate(0px, 0px)
        &:hover
            filter: brightness(120%)
            border: 1px solid white
        &.highlight
            background-color: #0D60C3
            border: 2px solid white
            box-shadow: 0px 0px 5px 0px white
.alt-section-text.nav
    color: white
    position: relative
    left: 10px
.nav-bar-item-wrapper
    display: flex
    flex-direction: row
    align-items: center
    height: 100%
    flex-grow: 1
    margin-right: 20px
.nav-bar-item-sub
    margin: 0px 5px 0px 5px
    text-align: end
    span
        font-weight: 200
        font-size: 1em
        font-style: italic
        font-family: 'Courier New', Courier, monospace
textarea.nav-bar-item-sub
    flex-grow: 1
    border: none
    border-radius: 3px
    resize: none
    text-align: start
button.nav-bar-item-sub
    height: 100%
#build-span
    font-weight: 200
    font-style: italic
    margin-left: 20px
    text-align: center
</style>

<template>
    <div id="nav-bar">
        <div class="container">
            <button id="disclaimer-btn" @click="toggleDisclaimer"><img src="/dots-vertical.svg" alt="" /></button>
            <button @click="this.$emit('toggleSelectDataSection')" :class="{ highlight: selectDataOpen }">Select Data</button>
            <span id="build-span">
                <b>Build</b>
                <br />
                {{ formattedHgBuild }}
            </span>
        </div>

        <div class="ghost"></div>

        <div id="disclaimer-overlay" v-if="showDisclaimer">
            <div id="disclaimer-text">
                <h1>License</h1>
                <p>
                    Terms of service Academic Use:
                    <br />
                    <i>sv.iobio is free for academic use</i>
                    <br />
                    <br />
                    Commercial Use Commercial use of gene.iobio is licensed through Frameshift Genomics. Please contact Frameshift
                    at admin@frameshift.io to discuss any commercial use of this tool.
                </p>
                <h1>Disclaimer</h1>
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

        <div class="container">
            <button @click="saveMosaicAnalysis('post')" v-if="launchedFromMosaic">
                <span>Save New Analysis</span>
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke-width="1.5"
                    stroke="currentColor"
                    class="">
                    <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        d="M12 16.5V9.75m0 0 3 3m-3-3-3 3M6.75 19.5a4.5 4.5 0 0 1-1.41-8.775 5.25 5.25 0 0 1 10.233-2.33 3 3 0 0 1 3.758 3.848A3.752 3.752 0 0 1 18 19.5H6.75Z" />
                </svg>
            </button>
            <!-- <button @click="saveMosaicAnalysis('put')" v-if="launchedFromMosaic">
                <span>Update Analysis</span>
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke-width="1.5"
                    stroke="currentColor"
                    class="">
                    <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        d="M12 16.5V9.75m0 0 3 3m-3-3-3 3M6.75 19.5a4.5 4.5 0 0 1-1.41-8.775 5.25 5.25 0 0 1 10.233-2.33 3 3 0 0 1 3.758 3.848A3.752 3.752 0 0 1 18 19.5H6.75Z" />
                </svg>
            </button> -->
            <button @click="loadJsonAnalysis" v-if="!launchedFromMosaic">
                <span>Load</span>
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke-width="1.5"
                    stroke="currentColor"
                    class="size-6">
                    <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5" />
                </svg>
            </button>
            <button @click="saveJsonAnalysis" v-if="!launchedFromMosaic">
                <span>Save</span>
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke-width="1.5"
                    stroke="currentColor"
                    class="">
                    <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
                </svg>
            </button>
            <h1 id="title">SV.iobio</h1>
        </div>
    </div>
</template>

<script>
export default {
    name: "NavBar",
    components: {},
    props: {
        launchedFromMosaic: Boolean,
        selectDataOpen: Boolean,
        filterDataOpen: Boolean,
        hgBuild: String,
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
        saveJsonAnalysis() {
            this.$emit("saveJsonAnalysis");
        },
        loadJsonAnalysis() {
            this.$emit("loadJsonAnalysis");
        },
        saveMosaicAnalysis(method) {
            this.$emit("saveMosaicAnalysis", method);
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
    watch: {},
};
</script>

<style lang="sass">
#title
    font-size: 1.2em
    font-weight: 600
    margin: 0px
    padding: 0px
    color: white
    text-align: center
    text-transform: uppercase
    letter-spacing: 2px
    align-self: center
#nav-bar
    display: flex
    flex-direction: row
    align-items: center
    justify-content: space-between
    padding: 3px 10px
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
            h1
                margin: 0px
                padding: 10px 0px
                font-size: 1.1em
                color: black
                font-weight: 600
            i
                font-style: italic
                color: #555
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
    .container
        display: flex
        flex-direction: row
        align-items: center
        justify-content: flex-end
        gap: 10px
        height: 100%
        button
            display: flex
            flex-direction: row
            align-items: center
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
            svg
                height: 20px
                width: auto
                margin-left: 5px
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

<template>
    <div class="sample-data-row" :class="{ collapse: collapse }">
        <div v-if="!isProband" class="close-btn">
            <img src="/close-circle-outline.svg" alt="" @click="this.$emit('close-row')" />
        </div>
        <button class="collapse-row-btn" @click="toggleCollapse">
            <img v-if="collapse" src="/arrow-down-circle.svg" alt="open" />
            <img v-else src="/arrow-up-circle.svg" alt="close" />
        </button>
        <div class="sample-row-info-form" v-if="!collapse">
            <div class="label-input-wrapper link">
                <label for="file-format">Format:</label>
                <select class="vcf-type-select" name="file-format" id="format" v-model="fileFormat">
                    <option value="single">Single Sample</option>
                    <option value="joint">Joint Called</option>
                </select>

                <label for="vcf">VCF:</label>
                <input
                    type="text"
                    class="vcf"
                    @input="this.$emit('update-sample', this.sampleLocal)"
                    v-model="sampleLocal.vcf"
                    placeholder="Paste a link or select a local file..." />
                <button @click="openFileSelect($event)">Select Local</button>
                <button v-if="fileFormat == 'joint'" @click="getSampleNames">Get Samples</button>
            </div>

            <div class="label-input-wrapper">
                <label for="sample-id">Sample Name:</label>
                <input
                    type="text"
                    id="sample-id"
                    v-model="sampleLocal.name"
                    @input="this.$emit('update-sample', this.sampleLocal)" />

                <div class="row" v-if="(sampleOptions && fileFormat == 'joint') || sampleLocal.id">
                    <label for="sample-id">Sample Id:</label>
                    <select
                        class="sample-select"
                        name="sample-id"
                        id="sample-id"
                        @change="this.$emit('update-sample', this.sampleLocal)"
                        v-model="sampleLocal.id">
                        <option v-for="option in sampleOptions" :value="option">{{ option }}</option>
                        <option v-if="!sampleOptions" :value="sampleLocal.id">{{ sampleLocal.id }}</option>
                    </select>

                    <button v-if="sampleOptions && sampleOptions.length > 1" @click="sendAdditionalSamples" class="special-btn">
                        Add Other Samples
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                            <title>add remaining samples</title>
                            <path
                                d="M19 17V19H7V17S7 13 13 13 19 17 19 17M16 8A3 3 0 1 0 13 11A3 3 0 0 0 16 8M19.2 13.06A5.6 5.6 0 0 1 21 17V19H24V17S24 13.55 19.2 13.06M18 5A2.91 2.91 0 0 0 17.11 5.14A5 5 0 0 1 17.11 10.86A2.91 2.91 0 0 0 18 11A3 3 0 0 0 18 5M8 10H5V7H3V10H0V12H3V15H5V12H8Z" />
                        </svg>
                    </button>
                </div>
            </div>
        </div>
        <div class="collapsed-alt-text" v-else>{{ sampleLocal.name }}</div>
    </div>
</template>

<script>
import * as dataHelper from "../../dataHelpers/dataHelpers.js";

export default {
    name: "SampleDataRow",
    components: {},
    props: {
        sample: Object,
        wagateActive: Boolean,
        isProband: {
            type: Boolean,
            default: false,
        },
    },
    data() {
        return {
            collapse: false,
            fileFormat: "joint",
            sampleOptions: null,
            sampleLocal: JSON.parse(JSON.stringify(this.sample)),
        };
    },
    mounted() {},
    methods: {
        toggleCollapse() {
            this.collapse = !this.collapse;
        },
        async openFileSelect(event) {
            //Start waygate
            if (!this.waygateActive) {
                this.$emit("open-waygate");
            }

            //Get files here
            const files = await new Promise((resolve, reject) => {
                const fileInput = document.createElement("input");
                fileInput.type = "file";
                fileInput.hidden = true;
                fileInput.multiple = false;
                document.body.appendChild(fileInput);

                fileInput.addEventListener("change", (event) => {
                    resolve(event.target.files);
                    document.body.removeChild(fileInput);
                });

                fileInput.click();
            });

            //get the file type from the input field's class
            let fileType = event.target.previousElementSibling.classList[0];
            //give the files to the parent
            this.$emit("update-sample-files", files, this.sampleLocal.name, fileType);
        },
        async getSampleNames() {
            let headers = [];
            try {
                headers = await dataHelper.getVCFSamplesFromURL(this.sampleLocal.vcf);
                this.sampleOptions = headers;
            } catch (error) {
                this.$emit("emit-toast", {
                    message: "Error fetching sample names",
                    type: "error",
                });
            }
        },
        sendAdditionalSamples() {
            if (!this.sampleOptions) {
                return;
            }

            let otherSamples = this.sampleOptions.filter((sample) => sample !== this.sampleLocal.id);
            let samples = [];

            for (let sample of otherSamples) {
                let url = this.sampleLocal.vcf;
                let s = {
                    id: sample,
                    vcf: url,
                };
                samples.push(s);
            }
            this.$emit("add-other-samples", samples);
        },
    },
    watch: {
        sample: {
            handler: function (val, oldVal) {
                let copy = JSON.parse(JSON.stringify(val));
                let localCopy = JSON.parse(JSON.stringify(this.sampleLocal));

                if (JSON.stringify(copy) !== JSON.stringify(localCopy)) {
                    this.sampleLocal = copy;
                }
            },
            deep: true,
        },
        sampleOptions: {
            handler: function (val, oldVal) {
                if (!oldVal || oldVal.length === 0) {
                    this.sampleLocal.id = val[0];
                }
            },
        },
    },
    computed: {},
};
</script>

<style lang="sass">
.sample-data-row
    width: 100%
    max-width: 1000px
    position: relative
    display: flex
    border-radius: 5px
    margin: 10px 0px
    justify-content: space-between
    align-items: center
    padding: 10px 10px
    box-sizing: border-box
    border: 1px solid #2A65B7
    transition: height 0.5s ease-in-out
    background-color: white
    &.collapse
        height: 50px
    .collapse-row-btn
        display: flex
        justify-content: center
        align-items: center
        background-color: #2A65B7
        color: white
        border: none
        border-radius: 50%
        height: 25px
        width: 25px
        padding: 0px
        cursor: pointer
        &:hover
            background-color: #1A4B97
        img
            height: 25px
            width: 25px
            transform: translate(0px, 0px)
    .sample-row-info-form
        flex-grow: 1
        display: flex
        justify-content: flex-start
        align-items: center
        flex-direction: column
        padding: 0px 10px
        height: 100%
        box-sizing: border-box
        .label-input-wrapper
            width: 100%
            display: flex
            justify-content: flex-start
            align-items: center
            margin: 5px 0px
            label
                width: fit-content
                text-align: right
                margin-right: 10px
                margin-left: 10px
            input
                padding: 5px
                border: none
                border-radius: 5px 5px 0px 0px
                border-bottom: 1px solid transparent
                box-sizing: border-box
                flex-grow: 1
                background-color: #F8F8F8
                //standard-modern
                &::placeholder
                    font-style: italic
                // firefox
                &:-moz-placeholder
                    font-style: italic
                // safari
                &::-webkit-input-placeholder
                    font-style: italic
                // edge
                &:-ms-input-placeholder
                    font-style: italic
                &:focus
                    outline: none
                    border-bottom: 1px solid #1A4B97
            select
                padding: 5px
                border: none
                border-radius: 5px
                box-sizing: border-box
                background-color: #EBEBEB
                font-weight: 200
                font-size: 14px
                //standard-modern
                &::placeholder
                    font-style: italic
                // firefox
                &:-moz-placeholder
                    font-style: italic
                // safari
                &::-webkit-input-placeholder
                    font-style: italic
                // edge
                &:-ms-input-placeholder
                    font-style: italic
                &.type
                    font-weight: bold
                    text-align: center
            button
                background-color: #EBEBEB
                color: #474747
                border: none
                display: flex
                justify-content: center
                align-items: center
                border-radius: 5px
                padding: 5px 10px
                cursor: pointer
                margin-left: 10px
                text-transform: uppercase
                &:hover
                    background-color: #D9D9D9
                svg
                    height: 20px
                    width: 20px
                    margin-left: 5px
                    fill: white
            .special-btn
                background-color: #8BB0E5
                color: black
                border: 1px solid #2A65B7
                text-transform: none
                font-weight: 600
                svg
                    fill: black
                &:hover
                    background-color: #6B90D5
    .collapsed-alt-text
        width: 100%
        text-align: center
    .close-btn
        position: absolute
        top: -10px
        left: -10px
        padding: 0px
        width: 25px
        height: 25px
        cursor: pointer
        background-color: white
        border-radius: 50%
        display: flex
        justify-content: center
        align-items: center
        img
            height: 25px
            width: 25px
            border-radius: 50%
            transform: translate(0px, 0px)
            transition: box-shadow 0.25s ease-in-out, background-color 0.25s ease-in-out
            &:hover
                background-color: #F0F0F0
                box-shadow: 0px 0px 5px 0px #2A65B7

    .row
        display: flex
        justify-content: flex-start
        align-items: center
        .label-input-wrapper
            margin: 0px
            label
                margin: 0px
            select
                margin: 0px
            button
                margin: 0px
</style>

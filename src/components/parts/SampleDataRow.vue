<template>
    <div class="sample-data-row" :class="{collapse: collapse}">
        <div v-if="!isProband" class="close-btn"><img src="/close-circle-outline.svg" alt="" @click="this.$emit('close-row')"></div>
        <button class="collapse-row-btn" @click="toggleCollapse">
            <img v-if="collapse" src="/arrow-down-circle.svg" alt="open">
            <img v-else src="/arrow-up-circle.svg" alt="close">
        </button>
        <div class="sample-row-info-form" v-if="!collapse">
            <div class="label-input-wrapper link">
                <label for="file-format">File Format:</label>
                <select name="file-format" id="format" v-model="fileFormat">
                    <option value="single">single sample</option>
                    <option value="joint">joint call</option>
                </select>
                
                <label for="vcf">VCF:</label>
                <input type="text" class="vcf-link" v-model="sample.vcf" placeholder="Paste a link or select a local file..."/>
                <button @click="openFileSelect($event)">Choose Local</button>
                <button v-if="fileFormat == 'joint'">Fetch Samples</button>

                <select v-if="sampleOptions" name="samples" id="">
                    <option v-for="option in sampleOptions" :value="option">{{ option }}</option>
                </select>
            </div>

            <div class="label-input-wrapper">
                <label for="sample-id">Sample Name:</label>
                <input type="text" id="sample-id" v-model="sample.name"/>

                <div v-if="sampleOptions">
                    <button>create</button>
                </div>
            </div>

            <!-- <div class="label-input-wrapper link">
                <label for="bam">BAM (opt.): </label>
                <input type="text" id="bam" v-model="sample.bam" placeholder="Paste a link or select a local file..."/>
                <button @click="openFileSelect($event)">Choose Local</button>
            </div>
            <div class="label-input-wrapper link">
                <label for="bai">BAI (if BAM):</label>
                <input type="text" id="bai" v-model="sample.bai" placeholder="Paste a link or select a local file..."/>
                <button @click="openFileSelect($event)">Choose Local</button>
            </div> -->
        </div>
        <div class="collapsed-alt-text" v-else>{{ sample.name }}</div>
    </div>
</template>

<script>

export default {
    name: 'SampleDataRow',
    components: {
    },
    props: {
        sample: Object,
        wagateActive: Boolean,
        isProband: {
            type: Boolean,
            default: false
        },
    },
    data () {
        return {
            collapse: false,
            fileFormat: 'single',
            sampleOptions: null,
        }
    },
    mounted () {
    },
    methods: {
        toggleCollapse () {
            this.collapse = !this.collapse
        },
        async openFileSelect (event) {
            //Start waygate
            if (!this.waygateActive) {
                this.$emit('open-waygate')
            }

            //Get files here
            const files = await new Promise((resolve, reject) => {
                const fileInput = document.createElement('input');
                fileInput.type = 'file';
                fileInput.hidden = true;
                fileInput.multiple = false;
                document.body.appendChild(fileInput);

                fileInput.addEventListener('change', (event) => {
                    resolve(event.target.files);
                    document.body.removeChild(fileInput);
                });

                fileInput.click();
            });

            //get the file type from the input field's id
            let fileType = event.target.previousElementSibling.id;
            //give the files to the parent
            this.$emit('update-sample-files', files, this.sample.name, fileType)
        }
    },
    watch: {
        sample: {
            handler: function (val) {
                this.$emit('update-sample', val)
            },
            deep: true
        }
    },
    computed: {
    }
}
</script>

<style lang="sass">
    .sample-data-row
        width: 100%
        max-width: 1000px
        position: relative
        display: flex
        border-radius: 5px
        margin: 5px 0px
        justify-content: space-between
        align-items: center
        padding: 5px 10px
        box-sizing: border-box
        border: 1px solid #2A65B7
        transition: height 0.5s ease-in-out
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
                    border: 1px solid #2A65B7
                    border-radius: 5px
                    box-sizing: border-box
                    flex-grow: 1
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
                select
                    padding: 5px
                    border: 1px solid #2A65B7
                    border-radius: 5px
                    box-sizing: border-box
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
                button
                    background-color: #2A65B7
                    color: white
                    border: none
                    border-radius: 5px
                    padding: 5px 10px
                    cursor: pointer
                    margin-left: 10px
                    &:hover
                        background-color: #1A4B97
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
</style>
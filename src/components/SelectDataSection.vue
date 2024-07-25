<template>
    <div class="select-data-section" :class="{hidden: !show}">
        <fieldset>
            <legend>VCF Input Format</legend>
            <input type="radio" id="joint" name="vcfs-format" value="joint" v-model="samplesFormat">
            <label for="multiple">Joint-Called VCF</label>
            <input type="radio" id="individual" name="vcfs-format" value="individual" v-model="samplesFormat">
            <label for="individual">Seperate VCFs</label>
        </fieldset>

        <div id="individual-samples-container" v-if="samplesFormat == 'individual'">
            <SampleDataRow 
                v-if="samplesLocal.proband" 
                :sample="samplesLocal.proband" 
                :isProband="true"
                @open-waygate="startWaygate"
                @update-sample-files="addFileToWaygate"/>

            <SampleDataRow 
                v-for="(sample, index) in samplesLocal.comparrisons" 
                :key="index" 
                :sample="sample"
                @close-row="removeRow(index)"
                @open-waygate="startWaygate"
                @update-sample-files="addFileToWaygate"/>            
        </div>

        <div id="joint-samples-container" v-if="samplesFormat == 'joint'">
            <div class="label-input-wrapper">
                <label for="vcf">VCF:</label>
                <input type="text" id="vcf" placeholder="Paste a link or select a local file..."/>
                <button @click="openFileSelect">Choose Local</button>
            </div>
            
            <button>Fetch Samples</button>
        </div>

        <button class="add-btn" @click="addNewSample" v-if="samplesFormat == 'individual'">+</button>
        <button class="go-btn" @click="sendSamples" v-if="samplesFormat == 'individual'">GO</button>
    </div>
</template>

<script>
    import SampleDataRow from './parts/SampleDataRow.vue'
    import waygateJs from 'waygate-js';

export default {
    name: 'SelectDataSection',
    components: {
        SampleDataRow
    },
    props: {
        show: Boolean,
        samples: Object,
    },
    data () {
        return {
            samplesLocal: {},
            //waygate items
            waygateActive: false,
            waygateDirTree: null,
            waygateTunnelDomain: null,
            samplesFormat: 'individual',
            jointVcfHeaders: [],
            jointVcfUrl: '',
        }
    },
    mounted () {
        this.samplesLocal = JSON.parse(JSON.stringify(this.samples))
    },
    methods: {
        addNewSample () {
            this.samplesLocal.comparrisons.push({
                name: '',
                vcf: '',
                tbi: '',
                bam: '',
                bai: '',
                svList: [],
            })
        },
        sendSamples () {
            this.$emit('update-samples', JSON.parse(JSON.stringify(this.samplesLocal)))
            this.$emit('toggle-show')
        },
        removeRow (index) {
            this.samplesLocal.comparrisons.splice(index, 1)
        },
        async startWaygate () {
            //if waygate is already active, don't start it again
            if (this.waygateActive) return

            this.waygateActive = true
            this.dirTree = waygateJs.openDirectory();

            const listener = await waygateJs.listen({
                serverDomain: 'waygate.iobio.io',
                tunnelType: 'websocket',
            })

            this.waygateTunnelDomain = listener.getDomain();

            if (!this.waygateTunnelDomain) {
                this.$emit('emit-toast', {
                    message: 'Error starting waygate',
                    type: 'error'
                })
                return
            }
            
            //serve the directory tree
            waygateJs.serve(listener, waygateJs.directoryTreeHandler(this.dirTree));
        },
        addFileToWaygate (files, sampleName, fileType) {
            //use the dirTree to add files
            this.dirTree.addFiles(files)

            //Really there should only be one file for each sample's specific file type
            const file = files[0]
            //Construct the uri
            let uri = `https://${this.waygateTunnelDomain}/${file.name}`;
            //Add the uri to the appropriate sample
            if (sampleName === this.samplesLocal.proband.name) {
               this.samplesLocal.proband[fileType] = uri
            } else {
                //find the sample with this name in comparrisons
                let sample = this.samplesLocal.comparrisons.find(sample => sample.name === sampleName)
                sample[fileType] = uri
            }
        },
        async openFileSelect (event) {
            //Start waygate
            if (!this.waygateActive) {
                this.startWaygate()
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
        }
    },
    watch: {
    },
    computed: {
    }
}
</script>

<style lang="sass">
    .select-data-section
        position: absolute
        display: flex
        flex-direction: column
        justify-content: flex-start
        align-items: center
        top: 0
        right: 0
        width: 100%
        height: 100%
        padding: 60px 10px 10px 10px
        border-radius: 0px 0px 0px 5px
        background-color: rgba(255, 255, 255, 0.90)
        transition: height 0.5s ease-in-out, width 0.5s ease-in-out
        box-shadow: 0px 0px 5px 0px #2A65B7
        box-sizing: border-box
        z-index: 3
        overflow-y: auto
        &.hidden
            height: 0px
            width: 0px
            overflow: hidden
            padding: 0px
        fieldset
            border: 1px solid #2A65B7
            border-radius: 5px
            padding: 10px
            margin: 10px
            legend
                color: #2A65B7
                font-size: 20px
                font-weight: bold
            label
                margin-right: 10px   
        #individual-samples-container, #joint-samples-container
            width: 100%
            display: flex
            flex-direction: column
            align-items: center
        #joint-samples-container
            padding: 10px
            .label-input-wrapper
                display: flex
                justify-content: center
                align-items: center
                width: 100%
                margin: 5px
                label
                    margin-right: 10px
                input
                    margin: 5px
                    padding: 5px
                    border-radius: 5px
                    border: 1px solid #2A65B7
                    width: 20%
                    min-width: 100px
                    &:focus
                        outline: none
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
        .go-btn
            background-color: green
            color: white
            border: none
            padding: 5px 10px
            border-radius: 5px
            cursor: pointer
            &:hover
                background-color: darkgreen
                color: white
        .add-btn
            background-color: #2A65B7
            display: flex
            justify-content: center
            margin: 5px
            align-items: center
            font-size: 20px
            color: white
            border: none
            border-radius: 50%
            cursor: pointer
            &:hover
                background-color: #1A45A7
                color: white
</style>
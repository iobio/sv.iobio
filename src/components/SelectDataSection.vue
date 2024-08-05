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
                v-for="(sample, index) in samplesLocal.comparisons" 
                :key="index" 
                :sample="sample"
                @close-row="removeRow(index)"
                @open-waygate="startWaygate"
                @update-sample-files="addFileToWaygate"/>            
        </div>

        <div id="joint-samples-container" v-if="samplesFormat == 'joint'">
            <div class="label-input-wrapper">
                <label for="vcf">VCF:</label>
                <input type="text" id="vcf" placeholder="Paste a link or select a local file..." v-model="jointVcfUrl"/>
                <button @click="openFileSelect">Choose Local</button>
                <button @click="getSampleNames" id="fetch-samples-btn">Fetch Samples</button>
            </div>

            <div id="samples-section" v-if="jointVcfHeaders.length > 0">
                <fieldset>
                    <legend>Proband Sample</legend>
                    <div class="label-input-wrapper">
                        <label for="proband">Proband Sample Id</label>
                        <select id="proband" v-model="samplesLocal.proband.id">
                            <option v-for="header in jointVcfHeaders" :key="header">{{header}}</option>
                        </select>
                    </div>
                    <div class="label-input-wrapper">
                        <label for="proband-name">Sample Name</label>
                        <input type="text" id="proband-name" v-model="samplesLocal.proband.name"/>
                    </div>
                </fieldset>

                <div class="label-input-wrapper" v-if="jointVcfHeaders.filter(id => id !== samplesLocal.proband.id).length > 0">
                    <label for="comparison-samples">Select Comparison Samples</label>
                    <select name="comparison-samples" id="comparisons" multiple v-model="selectedComparisonSamples">
                        <option v-for="header in jointVcfHeaders.filter(id => id !== samplesLocal.proband.id)" :key="header">{{header}}</option>
                    </select>
                </div>
                <div v-else><strong>Only one sample detected in:</strong> {{ jointVcfUrl }}</div>

                <div class="sample-fieldset-wrapper" v-for="(sample, index) in selectedComparisonSamples" :key="index">
                    <fieldset>
                        <legend>ID: {{sample}}</legend>
                        <div class="label-input-wrapper">
                            <label for="comparison-name">Sample Name</label>
                            <input type="text" id="comparison-name" v-model="samplesLocal.comparisons[index].name"/>
                        </div>
                    </fieldset>
                </div>

                <SampleDataRow 
                    v-for="(sample, index) in samplesLocal.comparisons.filter(sample => !jointVcfHeaders.includes(sample.id))" 
                    :key="index" 
                    :sample="sample"
                    @close-row="removeRow(index)"
                    @open-waygate="startWaygate"
                    @update-sample-files="addFileToWaygate"/>
            </div>
        </div>

        <button class="add-btn" @click="addNewSample" v-if="samplesFormat == 'individual'">+</button>
        <button class="add-additional-btn" @click="addNewSample" v-if="samplesFormat == 'joint' && (jointVcfHeaders && samplesLocal.proband.id)">Add Additional VCF</button>
        <button class="go-btn" @click="sendSamples" v-if="samplesFormat == 'individual' || (jointVcfHeaders && samplesLocal.proband.id)">GO</button>
    </div>
</template>

<script>
    import SampleDataRow from './parts/SampleDataRow.vue'
    import * as dataHelper from '../dataHelpers/dataHelpers.js'
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
            //Multiple samples items
            samplesFormat: 'individual',
            jointVcfHeaders: [],
            jointVcfUrl: '',
            selectedComparisonSamples: []
        }
    },
    mounted () {
        this.samplesLocal = JSON.parse(JSON.stringify(this.samples))
    },
    methods: {
        addNewSample() {
            this.samplesLocal.comparisons.push({
                name: '',
                id: '',
                vcf: '',
                tbi: '',
                bam: '',
                bai: '',
                svList: [],
            })
        },
        sendSamples () {
            if (this.samplesFormat === 'individual') {
                this.$emit('update-samples', JSON.parse(JSON.stringify(this.samplesLocal)), false)
            } else {
                this.$emit('update-samples', JSON.parse(JSON.stringify(this.samplesLocal)), true)
            }
            this.$emit('toggle-show')
        },
        removeRow (index) {
            if (this.samplesFormat === 'individual') {
                this.samplesLocal.comparisons.splice(index, 1)
            } else {
                let freeComparisons = this.samplesLocal.comparisons.filter(sample => !this.jointVcfHeaders.includes(sample.id))
                freeComparisons.splice(index, 1)
                this.samplesLocal.comparisons = this.samplesLocal.comparisons.filter(sample => this.jointVcfHeaders.includes(sample.id)).concat(freeComparisons)
            }
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
                //find the sample with this name in comparisons
                let sample = this.samplesLocal.comparisons.find(sample => sample.name === sampleName)
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

            //add the file to waygate
            this.dirTree.addFiles(files)
            let uri = `https://${this.waygateTunnelDomain}/${files[0].name}`;
            this.jointVcfUrl = uri
        },
        async getSampleNames() {
            let headers = [];
            try {
                headers = await dataHelper.getVCFSamplesFromURL(this.jointVcfUrl)
                this.jointVcfHeaders = headers
            } catch (error) {
                this.$emit('emit-toast', {
                    message: 'Error fetching sample names',
                    type: 'error'
                })
            }
            
            if (headers.length === 0) {
                this.$emit('emit-toast', {
                    message: 'No samples found in VCF',
                    type: 'error'
                })
            } else {
                this.samplesLocal.proband = {
                    id: headers[0],
                    name: headers[0],
                    vcf: this.jointVcfUrl
                }
            }
        }
    },
    watch: {
        selectedComparisonSamples (newVal) {
            let currentComparisons = this.samplesLocal.comparisons.filter(sample => this.jointVcfHeaders.includes(sample.id));

            currentComparisons = newVal.map(sample => {
                return {
                    name: sample,
                    vcf: this.jointVcfUrl,
                    id: sample,
                    tbi: '',
                    bam: '',
                    bai: '',
                    svList: []
                }
            })

            this.samplesLocal.comparisons = currentComparisons.concat(this.samplesLocal.comparisons.filter(sample => !this.jointVcfHeaders.includes(sample.id)))
        },
        samplesFormat (newVal, oldVal) {
            if (newVal !== oldVal) {
                this.jointVcfHeaders = []
                this.jointVcfUrl = ''
                this.selectedComparisonSamples = []
            }
        },
        samples: {
            handler: function (val) {
                this.samplesLocal = JSON.parse(JSON.stringify(val))
                //Update selected comparison samples as needed
                if (this.samplesFormat === 'joint') {
                    this.selectedComparisonSamples = this.selectedComparisonSamples.filter(sample => this.samplesLocal.comparisons.map(sample => sample.id).includes(sample));
                }
            },
            deep: true
        }
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
            width: 100%
            max-width: 1000px
            #samples-section
                width: 100%
                display: flex
                flex-direction: column
                align-items: center
                fieldset
                    width: 100%
                    legend
                        color: #2A65B7
                        font-size: 20px
                        font-weight: bold
                        background-color: white
                .sample-fieldset-wrapper
                    width: 100%
                    display: flex
                    flex-direction: column
                    align-items: center
                    fieldset
                        width: 100%
                        legend
                            color: #2A65B7
                            font-size: 20px
                            font-weight: bold
                            background-color: white
            div.label-input-wrapper
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
                    flex: 1
                    &:focus
                        outline: none
                button
                    background-color: #2A65B7
                    color: white
                    border: none
                    border-radius: 5px
                    padding: 5px 10px
                    margin: 10px
                    cursor: pointer
                    margin-left: 10px
                    &:hover
                        background-color: #1A4B97
            select
                margin: 5px
                padding: 5px
                border-radius: 5px
                border: 1px solid #2A65B7
                width: 20%
                min-width: 100px
                flex: 1
                &:focus
                    outline: none
            #fetch-samples-btn
                background-color: #2A65B7
                color: white
                border: none
                border-radius: 5px
                padding: 5px 10px
                cursor: pointer
                margin: 10px
                align-self: flex-end
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
        .add-additional-btn
            background-color: #2A65B7
            color: white
            border: none
            padding: 5px 10px
            border-radius: 5px
            cursor: pointer
            margin: 10px
            &:hover
                background-color: #1A4B97
</style>
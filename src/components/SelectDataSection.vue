<template>
    <div class="select-data-section" :class="{hidden: !show}">
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

        <button class="add-btn" @click="addNewSample">+</button>
        <button class="go-btn" @click="sendSamples">GO</button>
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
            this.waygateActive = true
            this.dirTree = waygateJs.openDirectory();

            const listener = await waygateJs.listen({
                serverDomain: 'waygate.iobio.io',
                tunnelType: 'websocket',
            })

            this.waygateTunnelDomain = listener.getDomain();
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
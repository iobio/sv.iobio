<template>
    <div id="main-container">
        <div id="upper-bar-container">
            <NavBar
                :selectDataOpen="selectDataSectionOpen"
                :filterDataOpen="filterDataSectionOpen"
                :hgBuild="hgBuild"
                :loaded="loadedInitiallyComplete"
                :progressPercent="progressPercent"
                @toggleSelectDataSection="onToggleSelectDataSection()"
                @toggleFilterDataSection="onToggleFilterDataSection()" />
        </div>

        <ToastsSection
            v-if="toasts.length > 0"
            :toasts="toasts"
            @remove-toast="removeToast"
            @remove-all-toasts="removeAllToasts" />

        <SelectDataSection
            :show="selectDataSectionOpen"
            :samples="samples"
            @send-demo-info="updateGenesAndPhensWithDemo"
            @update-samples="updateSamples"
            @toggle-show="selectDataSectionOpen = false"
            @emit-toast="addToast" />

        <div id="lower-block-container">
            <div
                id="var-list-bar-button-container"
                :class="{
                    normal: listViewMode == 'normal',
                    condensed: listViewMode == 'condensed',
                    expanded: listViewMode == 'expanded',
                }">
                <FilterDataSection
                    :show="filterDataSectionOpen"
                    :filters="filters"
                    :loaded="loadedInitiallyComplete"
                    @toggleFilterDataSection="filterDataSectionOpen = false"
                    @updateFilters="updateDataFilters" />

                <div class="button-container">
                    <div v-if="selectedTab == 'svList'" class="filter-button" @click="onToggleFilterDataSection()">
                        <svg v-if="loadedInitiallyComplete" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                            <title>Filter SVs</title>
                            <path
                                d="M12 18.88A1 1 0 0 1 11.71 19.71A1 1 0 0 1 10.3 19.71L6.3 15.71A1 1 0 0 1 6 14.87V9.75L1.21 3.62A1 1 0 0 1 1.38 2.22A1 1 0 0 1 2 2H16A1 1 0 0 1 16.62 2.22A1 1 0 0 1 16.79 3.62L12 9.75V18.88M4 4L8 9.06V14.58L10 16.58V9.05L14 4M13 16L18 21L23 16Z" />
                        </svg>

                        <svg
                            class="loading-svg"
                            v-if="!loadedInitiallyComplete"
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24">
                            <title>loading</title>
                            <path d="M12,4V2A10,10 0 0,0 2,12H4A8,8 0 0,1 12,4Z" />
                        </svg>
                    </div>
                    <div class="tab-select-wrapper">
                        <nav
                            class="tab-select"
                            :class="{
                                collapsed: !variantListBarOpen,
                                condensed: listViewMode == 'condensed',
                                expanded: listViewMode == 'expanded',
                            }">
                            <div class="tab" :class="{ selected: selectedTab == 'svList' }" @click="selectedTab = 'svList'">
                                SVs <span class="tip">{{ svListVariantBar.length }}</span>
                            </div>

                            <div
                                class="tab"
                                :class="{ selected: selectedTab == 'phenotypes' }"
                                @click="selectedTab = 'phenotypes'">
                                Phenotypes <span class="tip">{{ phenotypesOfInterest.length }}</span>
                            </div>

                            <div class="tab" :class="{ selected: selectedTab == 'goi' }" @click="selectedTab = 'goi'">
                                Genes <span class="tip">{{ genesOfInterest.length }}</span>
                            </div>
                        </nav>
                    </div>
                </div>

                <div id="var-list-bar-toggle-btn">
                    <button :class="{ active: listViewMode == 'condensed' }" @click="listViewMode = 'condensed'">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                            <title>consensed-view</title>
                            <path
                                d="M12 16C13.1 16 14 16.9 14 18S13.1 20 12 20 10 19.1 10 18 10.9 16 12 16M12 10C13.1 10 14 10.9 14 12S13.1 14 12 14 10 13.1 10 12 10.9 10 12 10M12 4C13.1 4 14 4.9 14 6S13.1 8 12 8 10 7.1 10 6 10.9 4 12 4M6 16C7.1 16 8 16.9 8 18S7.1 20 6 20 4 19.1 4 18 4.9 16 6 16M6 10C7.1 10 8 10.9 8 12S7.1 14 6 14 4 13.1 4 12 4.9 10 6 10M6 4C7.1 4 8 4.9 8 6S7.1 8 6 8 4 7.1 4 6 4.9 4 6 4M18 16C19.1 16 20 16.9 20 18S19.1 20 18 20 16 19.1 16 18 16.9 16 18 16M18 10C19.1 10 20 10.9 20 12S19.1 14 18 14 16 13.1 16 12 16.9 10 18 10M18 4C19.1 4 20 4.9 20 6S19.1 8 18 8 16 7.1 16 6 16.9 4 18 4Z" />
                        </svg>
                    </button>
                    <button :class="{ active: listViewMode == 'normal' }" @click="listViewMode = 'normal'">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                            <title>normal-view</title>
                            <path
                                d="M17 22V20H20V17H22V20.5C22 20.9 21.8 21.2 21.5 21.5C21.2 21.8 20.8 22 20.5 22H17M7 22H3.5C3.1 22 2.8 21.8 2.5 21.5C2.2 21.2 2 20.8 2 20.5V17H4V20H7V22M17 2H20.5C20.9 2 21.2 2.2 21.5 2.5C21.8 2.8 22 3.1 22 3.5V7H20V4H17V2M7 2V4H4V7H2V3.5C2 3.1 2.2 2.8 2.5 2.5S3.1 2 3.5 2H7M19 11H5V13H19V11Z" />
                        </svg>
                    </button>
                    <button :class="{ active: listViewMode == 'expanded' }" @click="listViewMode = 'expanded'">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                            <title>expanded-view</title>
                            <path d="M9,11H15V8L19,12L15,16V13H9V16L5,12L9,8V11M2,20V4H4V20H2M20,20V4H22V20H20Z" />
                        </svg>
                    </button>
                </div>

                <VariantListBar
                    v-if="selectedTab == 'svList'"
                    :svList="svListVariantBar"
                    :filteredOutVar="variantsFilteredOut"
                    :hiddenVar="variantsHiddenByUser"
                    :patientPhenotypes="phenotypesOfInterest"
                    :geneCandidates="genesOfInterest"
                    :loading="!loadedInitiallyComplete"
                    :comparisons="samples.comparisons"
                    :chromosomeAccumulatedMap="chromosomeAccumulatedMap"
                    :overlapProp="overlapProp"
                    :displayMode="listViewMode"
                    :filters="filters"
                    :focusedVariant="focusedVariant"
                    :open="variantListBarOpen"
                    @updateSvAtIndex="updateSvList"
                    @variant-clicked="updateFocusedVariant"
                    @sort-variants="sortSvList"
                    @favorite-variant="favoriteVariant"
                    @hide-variant="hideVariant"
                    @unhide-variant="unhideVariant"
                    @filter-to-favorites="filterToFavorites" />

                <PhenotypesListBar
                    v-if="selectedTab == 'phenotypes'"
                    :phenotypes="phenotypesOfInterest"
                    @remove-phenotype="removePhenotype"
                    @add-phenotype="addPhenotype"
                    @add-phenotypes="addPhenotypes" />

                <GenesOfInterestListBar
                    v-if="selectedTab == 'goi'"
                    :genesOfInterest="genesOfInterest"
                    :zoomedGeneName="focusedGeneName"
                    @remove-gene-from-goi="removeGeneFromGeneList"
                    @add-gene-to-goi="addGeneToGOI"
                    @add-genes-to-goi="addGenesToGOI"
                    @zoom-to-gene="zoomToGene" />
            </div>

            <ChartsSection
                :samples="samples"
                :svList="svListChart"
                :hgBuild="hgBuild"
                :selectedArea="selectedArea"
                :focusedVariant="focusedVariant"
                :genesOfInterest="genesOfInterest"
                :patientPhenotypes="phenotypesOfInterest"
                :phenRelatedGenes="overlappedPhenGenes"
                :batchNum="batchNum"
                :focusedGeneName="focusedGeneName"
                :genomeEnd="genomeEnd"
                :genomeStart="genomeStart"
                :doseGenes="doseGenes"
                :doseRegions="doseRegions"
                @updateComparisons="updateComparisons"
                @update-list-view="updateListViewMode"
                @zoomEvent="zoomFired"
                @updateFocusedVariant="updateFocusedVariant"
                @update-comparison-lists="setComparisonSamples"
                @set-chromosome-accumulated-map="setChromosomeMap" />
        </div>
    </div>
</template>

<script>
import * as dataHelper from "./dataHelpers/dataHelpers.js";
import * as common from "./dataHelpers/commonFunctions.js";
import ChartsSection from "./components/ChartsSection.vue";
import VariantListBar from "./components/VariantListBar.vue";
import GenesOfInterestListBar from "./components/GenesOfInterestListBar.vue";
import PhenotypesListBar from "./components/PhenotypesListBar.vue";
import NavBar from "./components/NavBar.vue";
import Sv from "./models/Sv.js";
import SelectDataSection from "./components/SelectDataSection.vue";
import FilterDataSection from "./components/FilterDataSection.vue";
import ToastsSection from "./components/ToastsSection.vue";
import MosaicSession from "./models/MosaicSession.js";

export default {
    name: "app",
    components: {
        ChartsSection,
        VariantListBar,
        GenesOfInterestListBar,
        NavBar,
        SelectDataSection,
        FilterDataSection,
        ToastsSection,
        PhenotypesListBar,
    },
    data() {
        return {
            genomeStart: 0,
            genomeEnd: 0,
            overlapProp: 0.8,
            hgBuild: "hg38", //default to hg38
            selectedTab: "svList",
            svListData: [],
            svListChart: [],
            svListVariantBar: [],
            comparisonsLists: [],
            showSortOptions: false,
            chromosomeAccumulatedMap: {},
            loadedInitiallyComplete: false,
            progressPercent: 0,
            focusedVariant: null,
            focusedGeneName: null,
            selectedArea: null,
            variantListBarOpen: false,
            genesOfInterest: [],
            phenotypesOfInterest: [],
            candidatePhenGenes: [],
            overlappedPhenGenes: [],
            batchNum: 0,
            interestStopIndex: 0, //Used to keep track of how many SVs have been moved to the front
            selectDataSectionOpen: false,
            filterDataSectionOpen: false,
            filters: {
                geneOverlap: false,
                denovoOnly: false,
            },
            samples: {
                proband: {
                    name: "Proband",
                    id: null,
                    vcf: "",
                    tbi: "",
                    bam: "",
                    bai: "",
                    alignmentType: "bam",
                    bed: "",
                    svList: [],
                },
                comparisons: [],
            },
            toasts: [],
            variantsSorted: false,
            variantsFilteredOut: [],
            variantsHiddenByUser: [],
            //Mosaic Session Items
            mosaicSession: null,
            mosaicUrlParams: null,
            mosaidProjectId: null,
            mosaicExperimentId: null,
            validFromMosaic: true,
            doseGenes: {},
            doseRegions: {},
            //Sorts
            sortedBy: {
                totalGenes: false,
                hpoOverlapped: false,
                goi: false,
                chr: false,
                type: false,
            },
            listViewMode: "normal",
        };
    },
    async mounted() {
        await this.initMosaicSession();

        //There are a little over 1000 genes and 518 regions
        let [doseGenes, doseRegions] = await Promise.all([dataHelper.getSensitiveGenes(), dataHelper.getSensitiveRegions()]);

        this.doseGenes = doseGenes.sensitiveGenes || {};
        this.doseRegions = doseRegions.sensitiveRegions || {};
    },
    created() {
        this.mosaicUrlParams = new URLSearchParams(window.location.search);
        if (this.mosaicUrlParams.get("access_token")) {
            localStorage.setItem("mosaic-iobio-tkn", this.mosaicUrlParams.get("access_token"));
        } else {
            localStorage.setItem("mosaic-iobio-tkn", "");
        }
    },
    methods: {
        updateListViewMode(mode) {
            this.listViewMode = mode;
        },
        updateGenesAndPhensWithDemo(demoInfo) {
            this.updateGenesOfInterest(demoInfo.genes);
            this.updatePhenotypesOfInterest(demoInfo.phenotypes);
        },
        onToggleFilterDataSection() {
            this.filterDataSectionOpen = !this.filterDataSectionOpen;
            this.selectDataSectionOpen = false;
        },
        onToggleSelectDataSection() {
            this.selectDataSectionOpen = !this.selectDataSectionOpen;
            this.filterDataSectionOpen = false;
        },
        updateHgBuild(hgBuild) {
            if (hgBuild == "hg38" || hgBuild == "hg19") {
                this.hgBuild = hgBuild;
            } else if (hgBuild == "GRCh37" || hgBuild == "GRCh38") {
                this.hgBuild = hgBuild == "GRCh37" ? "hg19" : "hg38";
            } else {
                this.toasts.push({ message: `Invalid build: ${hgBuild}`, type: "error" });
            }
        },
        async initMosaicSession() {
            if (localStorage.getItem("mosaic-iobio-tkn") && localStorage.getItem("mosaic-iobio-tkn").length > 0) {
                this.mosaicProjectId = Number(this.mosaicUrlParams.get("project_id"));
                let tokenType = this.mosaicUrlParams.get("token_type");
                let source = this.mosaicUrlParams.get("source");
                source = decodeURIComponent(source);

                let clientAppNumber = this.mosaicUrlParams.get("client_application_id");
                this.mosaicExperimentId = this.mosaicUrlParams.get("experiment_id");

                //Create a new MosaicSession object
                this.mosaicSession = new MosaicSession(clientAppNumber);
                let sessionSamples = {
                    proband: {
                        name: "Proband",
                        id: null,
                        vcf: "",
                        tbi: "",
                        bam: "",
                        bai: "",
                        alignmentType: "bam",
                        bed: "",
                        svList: [],
                    },
                    comparisons: [],
                };

                try {
                    await this.mosaicSession.promiseInit(source, this.mosaicProjectId, tokenType);
                } catch (error) {
                    this.validFromMosaic = false;
                    this.selectDataSectionOpen = true;
                    this.toasts.push({ message: `Error initializing Mosaic Session: ${error}`, type: "error" });
                    return;
                }

                let projectAttributes = await this.mosaicSession.promiseGetProjectSettings(this.mosaicProjectId);
                this.updateHgBuild(projectAttributes.reference);

                //Go through the samples and get just names and ids
                let samples = await this.mosaicSession.promiseGetProjectSamples(this.mosaicProjectId);
                samples = samples.map((sample) => {
                    return {
                        name: sample.name,
                        id: sample.id,
                        relation: "",
                    };
                });

                let experiment = await this.mosaicSession.promiseGetExperiment(this.mosaicProjectId, this.mosaicExperimentId);
                let vcfFiles = experiment.files.filter((file) => file.type == "vcf");
                let tbiFiles = experiment.files.filter((file) => file.type == "tbi");

                let probandFound = false;
                for (let sample of samples) {
                    let attributes = await this.mosaicSession.promiseGetSampleAttributes(this.mosaicProjectId, sample.id);
                    let relationships = attributes.find((attr) => attr.name == "Relation").values;
                    sample.relation = relationships[0].value;

                    let vcfFile = vcfFiles.find((file) => file.sample_id == sample.id);
                    let tbiFile = tbiFiles.find((file) => file.sample_id == sample.id);
                    let sampleVcfName = vcfFile.vcf_sample_name;

                    let mosaicVcfUrl = await this.mosaicSession.promiseGetSignedUrlForFile(this.mosaicProjectId, vcfFile.id);
                    let mosaicTbiUrl = await this.mosaicSession.promiseGetSignedUrlForFile(this.mosaicProjectId, tbiFile.id);
                    let filesRes = await this.mosaicSession.promiseGetFiles(this.mosaicProjectId, sample.id);
                    let alignmentFile = filesRes.data.filter((file) => file.type == "bam" || file.type == "cram");
                    let isProband = relationships.find((rel) => rel.value == "Proband");

                    if (isProband) {
                        //if there are multiple alignment files, we want the cram (I believe that is the most downstream)
                        if (alignmentFile && alignmentFile.length >= 1) {
                            if (alignmentFile.length > 1) {
                                alignmentFile = alignmentFile.filter((file) => file.type == "cram")[0];
                            } else {
                                alignmentFile = alignmentFile[0];
                            }

                            let indexFile;
                            if (alignmentFile.type == "bam") {
                                indexFile = filesRes.data.filter((file) => file.type == "bai")[0];
                                sessionSamples.proband.alignmentType = "bam";
                            } else {
                                indexFile = filesRes.data.filter((file) => file.type == "crai")[0];
                                sessionSamples.proband.alignmentType = "cram";
                            }

                            let alignmentUrl = "";
                            let indexUrl = "";

                            alignmentUrl = await this.mosaicSession.promiseGetSignedUrlForFile(
                                this.mosaicProjectId,
                                alignmentFile.id,
                            );
                            sessionSamples.proband.bam = alignmentUrl.url;
                            indexUrl = await this.mosaicSession.promiseGetSignedUrlForFile(this.mosaicProjectId, indexFile.id);
                            sessionSamples.proband.bai = indexUrl.url;
                        }

                        let bedUrl = "";
                        let bedFile = filesRes.data.filter((file) => file.type == "bam-bed")[0];

                        if (bedFile) {
                            bedUrl = await this.mosaicSession.promiseGetSignedUrlForFile(this.mosaicProjectId, bedFile.id);
                            sessionSamples.proband.bed = bedUrl.url;
                        }

                        let terms = await this.mosaicSession.promiseGetSampleHpoTerms(this.mosaicProjectId, sample.id);
                        this.phenotypesOfInterest = terms.map((term) => term.hpo_id);

                        sessionSamples.proband.vcf = mosaicVcfUrl.url;
                        sessionSamples.proband.id = sampleVcfName;
                        sessionSamples.proband.relation = sample.relation.toLowerCase();
                        sessionSamples.proband.tbi = mosaicTbiUrl.url;

                        probandFound = true;
                    } else {
                        let relation = sample.relation.toLowerCase();

                        if (relation == "brother" || relation == "sister") {
                            relation = "sibling";
                        } else if (relation == "mother" || relation == "father") {
                            //relation stays the same
                        } else if (relation == "son" || relation == "daughter") {
                            relation = "child";
                        } else {
                            relation = "other-comp";
                        }

                        let newComparison = {
                            name: sample.relation,
                            id: sampleVcfName,
                            vcf: mosaicVcfUrl.url,
                            tbi: mosaicTbiUrl.url,
                            bam: "",
                            bai: "",
                            alignmentType: "bam",
                            bed: "",
                            svList: [],
                            relation: relation,
                        };

                        if (alignmentFile && alignmentFile.length >= 1) {
                            if (alignmentFile.length > 1) {
                                alignmentFile = alignmentFile.filter((file) => file.type == "cram")[0];
                            } else {
                                alignmentFile = alignmentFile[0];
                            }

                            let indexFile;
                            if (alignmentFile.type == "bam") {
                                indexFile = filesRes.data.filter((file) => file.type == "bai")[0];
                                newComparison.alignmentType = "bam";
                            } else {
                                indexFile = filesRes.data.filter((file) => file.type == "crai")[0];
                                newComparison.alignmentType = "cram";
                            }

                            let alignmentUrl = "";
                            let indexUrl = "";

                            alignmentUrl = await this.mosaicSession.promiseGetSignedUrlForFile(
                                this.mosaicProjectId,
                                alignmentFile.id,
                            );
                            newComparison.bam = alignmentUrl.url;
                            indexUrl = await this.mosaicSession.promiseGetSignedUrlForFile(this.mosaicProjectId, indexFile.id);
                            newComparison.bai = indexUrl.url;
                        }

                        let bedUrl = "";
                        let bedFile = filesRes.data.filter((file) => file.type == "bam-bed")[0];

                        if (bedFile) {
                            bedUrl = await this.mosaicSession.promiseGetSignedUrlForFile(this.mosaicProjectId, bedFile.id);
                            newComparison.bed = bedUrl.url;
                        }

                        sessionSamples.comparisons.push(newComparison);
                    }
                }

                if (probandFound) {
                    this.validFromMosaic = true;
                    this.selectDataSectionOpen = false;
                    //Call update samples to load the data and close the select data section
                    this.updateSamples(sessionSamples);
                } else {
                    //set not launched from mosaic not valid something went wrong
                    this.validFromMosaic = false;
                    this.selectDataSectionOpen = true;

                    //reset samples
                    this.samples.proband = {
                        name: "Proband",
                        id: null,
                        vcf: "",
                        tbi: "",
                        bam: "",
                        bai: "",
                        alignmentType: "bam",
                        bed: "",
                        svList: [],
                        relation: "proband",
                    };
                    this.samples.comparisons = [];
                }
            } else {
                //set not launched from mosaic not valid something went wrong
                this.validFromMosaic = false;
                this.selectDataSectionOpen = true;

                //reset samples
                this.samples.proband = {
                    name: "Proband",
                    id: null,
                    vcf: "",
                    tbi: "",
                    bam: "",
                    bai: "",
                    alignmentType: "bam",
                    bed: "",
                    svList: [],
                    relation: "proband",
                };
                this.samples.comparisons = [];
            }
        },
        returnDenovo(svList, comps, chromMap) {
            let joinedCompList = [];
            let denovoList = [];
            let nonDenovo = [];
            for (let list of comps) {
                joinedCompList.push(...list);
            }

            for (let sv of svList) {
                let overlapSize = 0;
                let olprop = 0;
                let svChrStart = chromMap.get(sv.chromosome).start;
                let svStart = sv.start + svChrStart;
                let svEnd = sv.end + svChrStart;
                let svSize = svEnd - svStart;

                let isNonDenovo = false;

                for (let variant of joinedCompList) {
                    let chr2Start = chromMap.get(variant.chromosome).start;
                    let v2Start = variant.start + chr2Start;
                    let v2End = variant.end + chr2Start;

                    if (svStart < v2End && svEnd > v2Start) {
                        overlapSize = Math.min(svEnd, v2End) - Math.max(svStart, v2Start);
                        olprop = (overlapSize / svSize).toFixed(2);
                        //if there is something that overlaps more than or equal to the overlapProp not denovo
                        if (olprop >= this.overlapProp) {
                            nonDenovo.push(sv);
                            isNonDenovo = true;
                            break;
                        }
                    }
                }
                if (!isNonDenovo) {
                    denovoList.push(sv);
                }
            }

            return { denovoList: denovoList, nonDenovo: nonDenovo };
        },
        setChromosomeMap(chromosomeMap) {
            this.chromosomeAccumulatedMap = chromosomeMap;
            this.genomeEnd = chromosomeMap.get("Y").end;
        },
        setComparisonSamples(comparisons) {
            this.comparisonsLists = comparisons;
            for (let i = 0; i < comparisons.length; i++) {
                this.samples.comparisons[i].svList = comparisons[i];
            }
        },
        removeGeneFromGeneList(gene) {
            let newGenes = this.genesOfInterest.filter((g) => g !== gene);
            this.updateGenesOfInterest(newGenes);
        },
        addGeneToGOI(gene) {
            let newGenes = [...this.genesOfInterest, gene];
            this.updateGenesOfInterest(newGenes);
        },
        addGenesToGOI(genes) {
            let newGenes = [...this.genesOfInterest, ...genes];
            this.updateGenesOfInterest(newGenes);
        },
        async loadData() {
            if (this.samples.proband.vcf == "") {
                //open the select data section too
                this.selectDataSectionOpen = true;
                return;
            }
            this.progressPercent = 0;
            this.interestStopIndex = 0;
            this.loadedInitiallyComplete = false;

            let url = this.samples.proband.vcf;
            let svList;

            try {
                if (!this.samples.proband.id || this.samples.proband.id == "") {
                    svList = await dataHelper.getSVsFromVCF(url, this.hgBuild);
                } else {
                    svList = await dataHelper.getSVsFromVCF(url, this.hgBuild, this.samples.proband.id);
                }

                if (svList.length == 0) {
                    this.toasts.push({ message: `No svs found in vcf ${url}`, type: "warning" });
                    return;
                }
            } catch (error) {
                svList = [];

                this.toasts.push({ message: `Error loading proband svs: ${error}`, type: "error" });
                return;
            }

            //We use a separate list for the variant bar so we can sort it differently
            this.svListVariantBar = svList.map((sv) => {
                let newSv = new Sv(sv);
                newSv.setSvCode(common.generateSvCode(newSv));
                return newSv;
            });
            this.svListData = svList;
            this.variantListBarOpen = true;

            //Shallow copy the svListVariantBar to the svListChart so we can sort it differently
            //It is confusing to see the svs move around in the chart in most situations
            this.svListChart = [...this.svListVariantBar];

            //Copying the bar list so we can sort it in batches and get information about the overlapped genes
            let svListCopy = [...this.svListVariantBar];

            //the batch size we will send SVs in to get their associations
            let batchSize = 200;
            for (let i = 0; i < svListCopy.length; i += batchSize) {
                this.batchNum++;
                let batchSvs = svListCopy.slice(i, i + batchSize);

                let newSvs;

                try {
                    newSvs = await this.getSVAssociations(batchSvs);

                    if (newSvs.length == 0) {
                        this.toasts.push({ message: "No SVs found in proband VCF", type: "error" });
                        return;
                    }
                } catch (error) {
                    newSvs = [];
                    this.toasts.push({ message: `Error getting SV associations: ${error}`, type: "error" });
                    return;
                }

                //new svs is an array of Sv objects
                for (let [index, newSv] of newSvs.entries()) {
                    let originalIndex = i + index; // Calculate the original index
                    // Update the current index with the new SV

                    //If we have both phenotypes of interest and overlappedGenes we can see how many phenotypes are accounted for
                    if (
                        this.phenotypesOfInterest &&
                        this.phenotypesOfInterest.length > 0 &&
                        newSv.overlappedGenes &&
                        Object.values(newSv.overlappedGenes).length > 0
                    ) {
                        let num = this.numPhensAccountedFor(this.phenotypesOfInterest, newSv.overlappedGenes);

                        //----------------SORTING------------------------------------//
                        if (num > 0) {
                            if (originalIndex > this.interestStopIndex) {
                                let temp = this.svListVariantBar[this.interestStopIndex];
                                this.svListVariantBar[this.interestStopIndex] = newSv;
                                this.svListVariantBar[originalIndex] = temp;

                                this.interestStopIndex++;
                            } else if (originalIndex == this.interestStopIndex) {
                                this.interestStopIndex++;
                            }
                        } else {
                            this.svListVariantBar[originalIndex] = newSv;
                        }
                    } else {
                        //if there are no overlappedGenes send to the bottom
                        this.svListVariantBar[originalIndex] = newSv;
                        this.variantsFilteredOut.push(newSv);
                    }
                }
                this.progressPercent = Math.round(((i + batchSize) / svListCopy.length) * 100);
            }
            this.loadedInitiallyComplete = true;

            //We want to sort the variants by the number of phenotypes they have in common with the patient
            this.sortSvList("hpoOverlapped");

            // Any variants in the variantsFilteredOut list should be removed from the svListVariantBar the key of the variant is the svCode
            let filteredSvs = this.svListVariantBar.filter((sv) => !this.variantsFilteredOut.some((v) => v.svCode == sv.svCode));
            this.svListVariantBar = filteredSvs;
            this.svListChart = filteredSvs;
            //We just want to make sure we trigger this incase we got phenotypes while we were loading or before
            await this.updatePhenotypesOfInterest(this.phenotypesOfInterest);
        },
        updateFocusedVariant(variant, flag) {
            //grab the variant from the svListVariantBar
            variant = this.svListVariantBar.find((sv) => sv.svCode == variant.svCode);

            if (this.focusedVariant === variant) {
                this.focusedVariant = null;
            } else if (this.focusedVariant !== variant && flag == "hide") {
                //dont change focused variant
            } else {
                this.focusedVariant = variant;
            }
        },
        favoriteVariant(variant) {
            variant = this.svListVariantBar.find((sv) => sv.svCode == variant.svCode);
            if (variant && variant.favorite == false) {
                variant.favorite = true;
            } else if (variant) {
                variant.favorite = false;
            }
        },
        filterToFavorites() {
            const nonFavorites = this.svListVariantBar.filter((sv) => !sv.favorite);
            const favorites = this.svListVariantBar.filter((sv) => sv.favorite);

            this.variantsHiddenByUser.push(...nonFavorites);
            this.svListVariantBar = favorites;
            this.svListChart = favorites;
        },
        hideVariant(variant) {
            variant = this.svListVariantBar.find((sv) => sv.svCode == variant.svCode);
            if (variant) {
                this.variantsHiddenByUser.push(variant);
                let newSvs = this.svListVariantBar.filter((sv) => sv.svCode !== variant.svCode);
                this.svListVariantBar = newSvs;
                this.svListChart = newSvs;
            }
        },
        unhideVariant(variant) {
            //The variant could be in variantsFilteredOut or variantsHiddenByUser so we need to check both
            if (this.variantsFilteredOut.some((sv) => sv.svCode == variant.svCode)) {
                this.variantsFilteredOut = this.variantsFilteredOut.filter((sv) => sv.svCode !== variant.svCode);
            } else if (this.variantsHiddenByUser.some((sv) => sv.svCode == variant.svCode)) {
                this.variantsHiddenByUser = this.variantsHiddenByUser.filter((sv) => sv.svCode !== variant.svCode);
            }
            // Add the variant back to the top of the svListVariantBar
            this.svListVariantBar.unshift(variant);
        },
        updateDataFilters(filters) {
            //Filters, essentially shouldn't need to make additional calls to the server
            if (filters.geneOverlap !== this.filters.geneOverlap || filters.denovoOnly !== this.filters.denovoOnly) {
                this.filters = filters;
            } else {
                return;
            }

            let allSVs = this.svListVariantBar.concat(this.variantsFilteredOut);
            let newSVs = [];
            let newFilteredOut = [];
            let filterApplied = false;

            if (filters.geneOverlap) {
                newSVs = allSVs.filter((sv) => Object.values(sv.overlappedGenes).length > 0);
                newFilteredOut = allSVs.filter((sv) => Object.values(sv.overlappedGenes).length == 0);
                filterApplied = true;
            }

            if (filters.denovoOnly) {
                if (
                    !this.comparisonsLists.length > 0 ||
                    !this.chromosomeAccumulatedMap ||
                    !this.chromosomeAccumulatedMap.size > 0
                ) {
                    if (!this.comparisonsLists > 0) {
                        this.addToast({ message: "No comparrisons.", type: "error" });
                    } else {
                        this.addToast({ message: "No chromosome map defined.", type: "error" });
                    }
                } else {
                    if (newSVs.length == 0) {
                        newSVs = allSVs;
                    }

                    let denovoComps = this.samples.comparisons.filter((comp) => comp.relation !== "alt-caller");
                    let denovoCompsLists = denovoComps.map((comp) => comp.svList);

                    let { denovoList, nonDenovo } = this.returnDenovo(newSVs, denovoCompsLists, this.chromosomeAccumulatedMap);
                    newSVs = denovoList;
                    newFilteredOut.push(...nonDenovo);
                    filterApplied = true;
                }
            }

            if (!filterApplied) {
                newSVs = allSVs;
                newFilteredOut = [];
            }

            this.svListVariantBar = newSVs;
            this.svListChart = newSVs;
            this.variantsFilteredOut = newFilteredOut;
        },
        async updateSamples(samples) {
            this.samples.proband = samples.proband;
            this.loadData();

            this.samples.comparisons = samples.comparisons;
        },
        async getSVAssociations(variantBatch, build = "hg38", source = "refseq") {
            let svs;
            try {
                svs = await dataHelper.getSVBatchInfo(variantBatch, build, source);

                if (svs.length == 0) {
                    this.toasts.push({ message: `No SV associations for the variant batch`, type: "error" });
                    return;
                }
            } catch (error) {
                svs = [];
                this.toasts.push({ message: `Error getting SV associations: ${error}`, type: "error" });
                return;
            }

            let updatedSvs = [];

            for (let sv of svs) {
                //turn the sv into a Sv object we will have our overlappedgenes
                let updatedVariant = new Sv(sv);

                //Checks for overlap with genes of interest in the overlappedGenes(sv)
                if (this.genesOfInterest && this.genesOfInterest.length > 0) {
                    let geneSet = new Set(Object.keys(updatedVariant.overlappedGenes));
                    let genesInCommon = this.genesOfInterest.filter((geneSymbol) => geneSet.has(geneSymbol));
                    updatedVariant.genesInCommon = genesInCommon;
                } else {
                    updatedVariant.genesInCommon = [];
                }

                if (this.candidatePhenGenes && this.candidatePhenGenes.length > 0) {
                    //essentially if the gene didnt have phenotypes when we checked earlier we want a chance to update it and the overlappedPhenGenes
                    let geneSet = new Set(Object.keys(updatedVariant.overlappedGenes));
                    let genesInCommon = this.candidatePhenGenes.filter((geneSymbol) => geneSet.has(geneSymbol));
                    updatedVariant.overlappedPhenGenes = genesInCommon;
                    this.overlappedPhenGenes.push(...genesInCommon);
                    this.overlappedPhenGenes = [...new Set(this.overlappedPhenGenes)];
                } else {
                    //if we dont have candidatePhenGenes then we dont need to update overlappedPhenGenes
                    updatedVariant.overlappedPhenGenes = [];
                }

                updatedSvs.push(updatedVariant);
            }
            updatedSvs;
            return updatedSvs;
        },
        zoomFired(zoomZone, isGene = false) {
            if (this.selectedArea == zoomZone) {
                return;
            }
            this.selectedArea = zoomZone;
            if (!isGene) {
                this.focusedGeneName = null;
            }
        },
        updateGenesOfInterest(newGOI) {
            /**
             * Updates the genes of interest
             *
             * Genes of interest are used to determine which SVs are displayed first so
             * if this list changes we need to update the SVs.
             */

            if (newGOI.length == this.genesOfInterest.length && newGOI.every((v, i) => v === this.genesOfInterest[i])) {
                return;
            }

            this.genesOfInterest = newGOI;

            //Iterate over the svListChart and update the genesInCommon given the new genesOfInterest
            this.svListVariantBar.forEach((sv, index) => {
                //If an sv has a list of overlapped genes to look at then check them against the genesOfInterest
                if (sv?.overlappedGenes && Object.keys(sv.overlappedGenes).length > 0) {
                    let geneSet = new Set(Object.keys(sv.overlappedGenes));
                    let genesInCommon = this.genesOfInterest.filter((geneSymbol) => geneSet.has(geneSymbol));
                    sv.genesInCommon = genesInCommon;
                } else if (!sv.overlappedGenes) {
                    sv.genesInCommon = [];
                }
            });
        },
        removePhenotype(phenotype) {
            let newPhenotypes = this.phenotypesOfInterest.filter((phen) => phen !== phenotype);
            this.updatePhenotypesOfInterest(newPhenotypes);
        },
        addPhenotype(phenotype) {
            let newPhenotypes = [...this.phenotypesOfInterest, phenotype];
            this.updatePhenotypesOfInterest(newPhenotypes);
        },
        addPhenotypes(phenotypes) {
            let newPhenotypes = [...this.phenotypesOfInterest, ...phenotypes];
            this.updatePhenotypesOfInterest(newPhenotypes);
        },
        async updatePhenotypesOfInterest(newPOI) {
            this.variantsSorted = false;
            this.phenotypesOfInterest = newPOI;

            //If we have some phenotypes of interest we want to get any associated genes
            let hpoIds = newPOI.join(",");
            let data;
            try {
                data = await dataHelper.getGenesForPhenotypes(hpoIds);
            } catch (error) {
                data = {};
                this.toasts.push({ message: `Error getting genes for phenotypes: ${error}`, type: "error" });
                return;
            }

            this.candidatePhenGenes = Object.keys(data);

            let overlappedLocal = [];

            //We will iterate over the svListChart and update the overlappedPhenGenes for each SV
            this.svListVariantBar.forEach((sv, index) => {
                //If an sv already has overlappedGenes calculated we can check them against the candidatePhenGenes to get the phenGenes that have some overlap with the sv
                if (sv?.overlappedGenes && Object.keys(sv.overlappedGenes).length > 0) {
                    let geneSet = new Set(Object.keys(sv.overlappedGenes));
                    let candidateGenesOverlapped = this.candidatePhenGenes.filter((geneSymbol) => geneSet.has(geneSymbol));
                    sv.overlappedPhenGenes = candidateGenesOverlapped;
                    overlappedLocal.push(...candidateGenesOverlapped);

                    //if we do have overlapped genes and now we have phentypes of interest we can check the accounted for
                    if (this.phenotypesOfInterest && this.phenotypesOfInterest.length > 0) {
                        let num = this.numPhensAccountedFor(this.phenotypesOfInterest, sv.overlappedGenes);

                        //----------------SORTING------------------------------------//
                        /**
                         * If the number is greater than zero and the index is greater than the interestStopIndex we can move to top and increment the interestStopIndex
                         * If the number is greater than zero and the index is the same as the interestStopIndex we just increment the interestStopIndex
                         */
                        if (num > 0) {
                            if (index > this.interestStopIndex) {
                                let temp = this.svListVariantBar[this.interestStopIndex];
                                this.svListVariantBar[this.interestStopIndex] = sv;
                                this.svListVariantBar[index] = temp;

                                this.interestStopIndex++;
                            } else if (index == this.interestStopIndex) {
                                this.interestStopIndex++;
                            }
                        }
                    }
                } else if (!sv.overlappedGenes || Object.keys(sv.overlappedGenes).length == 0) {
                    sv.overlappedPhenGenes = [];
                }
            });

            //update our list of overlappedPhenGenes
            this.overlappedPhenGenes = [...new Set(overlappedLocal)];
            //the value of the batchNum is not important but we need to update it to trigger a re-render so either this finishes or every 200 SVs
            this.batchNum = 0;
        },
        numPhensAccountedFor(patientPhenotypes, overlappedGenes) {
            //if there are patient phenotypes we can see how many of the overlapped phenotypes are accounted for
            if (
                patientPhenotypes &&
                patientPhenotypes.length > 0 &&
                overlappedGenes &&
                Object.values(overlappedGenes).length > 0
            ) {
                let inCommonOverlappedPhens = [];
                for (let gene of Object.values(overlappedGenes)) {
                    inCommonOverlappedPhens.push(
                        ...Object.keys(gene.phenotypes).filter((phenotype) => patientPhenotypes.includes(phenotype)),
                    );
                }
                inCommonOverlappedPhens = new Set(inCommonOverlappedPhens);
                return inCommonOverlappedPhens.size;
            } else {
                return 0;
            }
        },
        maxSingPhenotypesOverlapped(phenotypesOfInterest, variant) {
            if (phenotypesOfInterest.length > 0 && variant.overlappedGenes && Object.values(variant.overlappedGenes).length > 0) {
                let maxPercent = 0;
                for (let gene of Object.values(variant.overlappedGenes)) {
                    let inCommonPhens = Object.keys(gene.phenotypes).filter((phenotype) =>
                        phenotypesOfInterest.includes(phenotype),
                    );
                    let percent = (inCommonPhens.length / phenotypesOfInterest.length) * 100;
                    if (percent > maxPercent) {
                        maxPercent = percent;
                    }
                }
                return maxPercent;
            } else {
                return 0;
            }
        },
        numOfGOIOverlapped(genesOfInterest, variant) {
            if (genesOfInterest && genesOfInterest.length > 0) {
                //how many of the overlapped genes are in the geneCandidates
                let goiOL = 0;
                for (let gene of Object.values(variant.overlappedGenes)) {
                    if (genesOfInterest.includes(gene.gene_symbol)) {
                        goiOL += 1;
                    }
                }
                return goiOL;
            } else {
                return 0;
            }
        },
        updateSvList(index, sv) {
            this.svListVariantBar[index] = sv;
        },
        removeToast(index) {
            this.toasts.splice(index, 1);
        },
        removeAllToasts() {
            this.toasts = [];
        },
        addToast(toast) {
            this.toasts.push(toast);
        },
        updateComparisons(comparisons) {
            this.samples.comparisons = comparisons;
        },
        sortSvList(sortCategory) {
            if (sortCategory == "totalGenes") {
                this.svListVariantBar.sort((a, b) => {
                    return Object.keys(b.overlappedGenes).length - Object.keys(a.overlappedGenes).length;
                });
                this.variantsSorted = true;
            } else if (sortCategory == "hpoOverlapped") {
                if (!this.phenotypesOfInterest || this.phenotypesOfInterest.length == 0) {
                    this.toasts.push({
                        message: "No patient phenotypes to sort by, sorting by number of genes overlapped.",
                        type: "info",
                    });

                    this.svListVariantBar.sort((a, b) => {
                        return Object.keys(b.overlappedGenes).length - Object.keys(a.overlappedGenes).length;
                    });
                    this.variantsSorted = true;
                } else {
                    this.svListVariantBar.sort((a, b) => {
                        return (
                            this.maxSingPhenotypesOverlapped(this.phenotypesOfInterest, b) -
                            this.maxSingPhenotypesOverlapped(this.phenotypesOfInterest, a)
                        );
                    });
                    this.variantsSorted = true;
                }
            } else if (sortCategory == "goi") {
                if (!this.genesOfInterest || this.genesOfInterest.length == 0) {
                    this.toasts.push({
                        message: "No genes of interest to sort by, sorting by number of genes overlapped.",
                        type: "info",
                    });

                    this.svListVariantBar.sort((a, b) => {
                        return Object.keys(b.overlappedGenes).length - Object.keys(a.overlappedGenes).length;
                    });
                    this.variantsSorted = true;
                } else {
                    this.svListVariantBar.sort((a, b) => {
                        return (
                            this.numOfGOIOverlapped(this.genesOfInterest, b) - this.numOfGOIOverlapped(this.genesOfInterest, a)
                        );
                    });
                }
            } else if (sortCategory == "chr") {
                //the chromosome of each sv is a number so we can sort by that
                this.svListVariantBar.sort((a, b) => {
                    return a.chromosome - b.chromosome;
                });
            } else if (sortCategory == "type") {
                let order = ["DEL", "DUP", "INS", "CNV", "INV", "BND", "OTHER"];

                this.svListVariantBar.sort((a, b) => {
                    let aType = a.type.toUpperCase();
                    let bType = b.type.toUpperCase();
                    let aIndex = order.indexOf(aType);
                    let bIndex = order.indexOf(bType);
                    if (aIndex == -1) {
                        aIndex = order.length;
                    }
                    if (bIndex == -1) {
                        bIndex = order.length;
                    }
                    return aIndex - bIndex;
                });
            } else if (sortCategory == "zygosity") {
                let order = ["HOM", "HET", "HEM", "HEP", "UNKNOWN"];

                this.svListVariantBar.sort((a, b) => {
                    let aZyg = common.formatGenotype(a.genotype).toUpperCase();
                    let bZyg = common.formatGenotype(b.genotype).toUpperCase();
                    let aIndex = order.indexOf(aZyg);
                    let bIndex = order.indexOf(bZyg);
                    if (aIndex == -1) {
                        aIndex = order.length;
                    }
                    if (bIndex == -1) {
                        bIndex = order.length;
                    }
                    return aIndex - bIndex;
                });
            } else if (sortCategory == "size") {
                this.svListVariantBar.sort((a, b) => {
                    return b.size - a.size;
                });
            }
        },
        zoomToGene(gene) {
            this.focusedGeneName = gene;
        },
        resetFilters() {
            let filters = {
                geneOverlap: false,
                denovoOnly: false,
            };
            this.updateDataFilters(filters);
        },
    },
    watch: {
        samples: {
            handler(newVal, oldVal) {
                if (newVal.proband.vcf !== oldVal.proband.vcf) {
                    this.loadData();
                    this.resetFilters();
                }
            },
            deep: true,
        },
        "samples.comparisons": {
            handler(newVal, oldVal) {
                if (!newVal || newVal.length == 0 || !oldVal || oldVal.length == 0) {
                    return;
                }
                //If any of the comparisons change we want to reset the filters
                for (let i = 0; i < newVal.length; i++) {
                    if (newVal[i].vcf !== oldVal[i].vcf) {
                        this.resetFilters();
                        break;
                    } else if (newVal[i].relation !== oldVal[i].relation) {
                        this.resetFilters();
                        break;
                    }
                }
            },
            deep: true,
        },
        variantListBarOpen: {
            handler(newVal, oldVal) {
                if (newVal == false) {
                    this.filterDataSectionOpen = false;
                }
            },
        },
    },
};
</script>

<style lang="sass">
#logo-div
    position: absolute
    right: 5px
    top: 0px

#main-container
    box-sizing: border-box
    display: flex
    flex-direction: column
    height: 100vh
    width: 100%

#upper-bar-container
    display: flex
    flex-direction: column
    height: fit-content
    width: 100%

#lower-block-container
    display: flex
    flex-direction: row
    flex: 1 1 auto
    width: 100%
    box-sizing: border-box
    overflow: hidden

img
    height: 30px
    margin-right: 0px
    padding-right: 0px
    transform: translate(3px, 5px)
    width: 30px

#var-list-bar-button-container
    position: relative
    height: 100%
    display: flex
    flex-direction: column
    padding: 5px 0px 0px 0px
    margin: 0px
    transition: width 0.4s
    .button-container
        display: flex
        flex-direction: row
        align-items: center
        justify-content: center
        width: 100%
        margin-bottom: 5px
    .tab-select-wrapper
        flex-grow: 1
        display: flex
        justify-content: center
    .filter-button
        display: flex
        flex-direction: row
        align-items: center
        justify-content: center
        padding: 3px 5px
        margin: 0px 2px
        border: 1px solid transparent
        border-radius: 5px
        text-transform: uppercase
        background-color: #EBEBEB
        color: #474747
        height: 100%
        transition: background-color 0.2s, border 0.2s
        z-index: 3
        &:hover
            cursor: pointer
            background-color: #C1D1EA
            border: 1px solid #2A65B7
        svg
            fill: #2A65B7
            height: 20px
            width: 20px
            transform: translate(0px, 0px)
        .loading-svg
            animation: spin 1s linear infinite
        @keyframes spin
            0%
                transform: rotate(0deg)
            100%
                transform: rotate(360deg)
    .sort-btn
        cursor: pointer
        overflow: visible
        position: relative
        display: flex
        justify-content: center
        align-items: center
        border-radius: 50%
        border: 1px solid #EBEBEB
        transition: all 0.25s
        padding: 2px
        margin-left: 3px
        height: 30px
        width: 30px
        box-shadow: 0px 2px 5px 0px rgba(0,0,0,0.2)
        &.sorted
            cursor: not-allowed
        svg
            width: 20px
            height: 20px
            fill: #2A65B7
            pointer-events: none
            &.sorted
                filter: grayscale(100%)
            &.loading-svg
                animation: spin 1s linear infinite
            &:hover
                border-radius: 5px
        .sort-options-popup
            position: absolute
            top: 109%
            left: 0px
            width: 250px
            height: 100px
            padding: 5px
            font-weight: normal
            background-color: white
            border: 1px solid #ADC2DF
            border-radius: 5px
            display: flex
            flex-direction: column
            justify-content: space-around
            align-items: flex-start
            transition: height 0.25s, opacity 0.15s
            opacity: .95
            z-index: 2
            &.hidden
                opacity: 0
                pointer-events: none
                height: 0px
                border: 0px
        span
            cursor: pointer
            padding: 5px
            width: 100%
            border-radius: 5px 5px 0px 0px
            text-align: left
            border-bottom: 1px solid #ADC2DF
            &:hover
                background-color: #F5F5F5
            &:last-of-type
                border-radius: 0px 0px 5px 5px
                border-bottom: none
    .tab-select
        display: flex
        justify-content: flex-end
        align-content: flex-end
        color: #474747
        border-radius: 5px
        width: fit-content
        border: 1px solid #EBEBEB
        overflow: hidden
        &.collapsed
            border-bottom: 0px
            width: 0px
            min-width: 0px
            overflow: hidden
        &.condensed
            font-size: .8em
            .tab
                padding: 3px
                .tip
                    font-size: 10px
                    top: -2px
        &.expanded
            font-size: 1em
    .tab
        padding: 5px 10px
        margin: 0px
        border-right: .5px solid #EBEBEB
        text-transform: uppercase
        font-weight: 200
        position: relative
        &:last-of-type
            border-right: .5px solid transparent
        .tip
            font-size: 12px
            font-weight: 200
            color: #474747
            position: relative
            top: -7px
            left: 3px
            border: .5px solid #474747
            border-radius: 5px
            padding: 0px 2px
        &.selected
            background-color: #EBEBEB
        &:hover
            cursor: pointer
            background-color: #E0E0E0
    &.collapsed
        width: 0px
        min-width: 0px
        .filter-button
            display: none
        .sort-btn
            display: none
    &.normal
        width: 40%
        min-width: 40%
    &.condensed
        width: 250px
        min-width: 250px
    &.expanded
        width: 50%
        min-width: 50%
#var-list-bar-toggle-btn
    position: absolute
    top: 5px
    right: -100px
    z-index: 2
    margin: 0px
    border-radius: 5px
    opacity: 0.8
    display: flex
    justify-content: center
    align-items: center
    border: 1px solid #E0E0E0
    button
        border: none
        background-color: transparent
        padding: 3px 5px
        margin: 0px
        display: flex
        height: 100%
        justify-content: center
        align-items: center
        svg
            height: 20px
            width: 20px
            fill: #474747
        &:hover
            cursor: pointer
            background-color: #E0E0E0
        &.active
            background-color: #EBEBEB
            &:hover
                background-color: #E0E0E0
</style>

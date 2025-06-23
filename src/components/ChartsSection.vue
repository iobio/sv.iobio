<template>
    <div id="left-tracks-section">
        <div id="circos-mini-wrapper" v-if="globalView === 'circos'">
            <SvCirosMiniViz
                :zoomZone="selectedArea"
                :centromeres="centromeres"
                :bands="bands"
                :chromosomes="chromosomes"
                @selectAreaEvent="selectAreaEventFired" />
        </div>

        <div class="upper-track-selectors-bar">
            <div id="radios-tools-container">
                <fieldset class="location-indicator">
                    <legend>Location</legend>
                    <p class="entry">{{ zoomedStamp }}</p>
                </fieldset>

                <!-- <div id="global-chart-style-selection">
                    <select name="chart-view-selection" id="chart-view-select" v-model="globalView">
                        <option value="circos">Circos</option>
                        <option value="linear">Linear</option>
                    </select>
                </div> -->

                <fieldset class="fieldset-buttons-container" v-if="globalView == 'linear'">
                    <legend>ruler line</legend>
                    <button @click="toggleLineTool" class="line-tool-btn">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                            <title>activate/deactivate ruler line</title>
                            <path
                                d="M11,2V4.07C7.38,4.53 4.53,7.38 4.07,11H2V13H4.07C4.53,16.62 7.38,19.47 11,19.93V22H13V19.93C16.62,19.47 19.47,16.62 19.93,13H22V11H19.93C19.47,7.38 16.62,4.53 13,4.07V2M11,6.08V8H13V6.09C15.5,6.5 17.5,8.5 17.92,11H16V13H17.91C17.5,15.5 15.5,17.5 13,17.92V16H11V17.91C8.5,17.5 6.5,15.5 6.08,13H8V11H6.09C6.5,8.5 8.5,6.5 11,6.08M12,11A1,1 0 0,0 11,12A1,1 0 0,0 12,13A1,1 0 0,0 13,12A1,1 0 0,0 12,11Z" />
                        </svg>
                    </button>
                </fieldset>

                <fieldset class="fieldset-buttons-container">
                    <legend>Zoom +/- <span class="zoom-level-label" v-html="bpFormatted(zoomFactor)"></span></legend>
                    <button
                        class="zoom-tool-btn"
                        @click="zoom('in')"
                        :disabled="isGlobalView || selectedArea.size <= 50"
                        :class="{ disabled: isGlobalView || selectedArea.size <= 50 }">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                            <title>zoom in</title>
                            <path
                                d="M15.5,14L20.5,19L19,20.5L14,15.5V14.71L13.73,14.43C12.59,15.41 11.11,16 9.5,16A6.5,6.5 0 0,1 3,9.5A6.5,6.5 0 0,1 9.5,3A6.5,6.5 0 0,1 16,9.5C16,11.11 15.41,12.59 14.43,13.73L14.71,14H15.5M9.5,14C12,14 14,12 14,9.5C14,7 12,5 9.5,5C7,5 5,7 5,9.5C5,12 7,14 9.5,14M12,10H10V12H9V10H7V9H9V7H10V9H12V10Z" />
                        </svg>
                    </button>
                    <button
                        class="zoom-tool-btn"
                        @click="zoom('out')"
                        :disabled="isGlobalView"
                        :class="{ disabled: isGlobalView }">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                            <title>zoom out</title>
                            <path
                                d="M15.5,14H14.71L14.43,13.73C15.41,12.59 16,11.11 16,9.5A6.5,6.5 0 0,0 9.5,3A6.5,6.5 0 0,0 3,9.5A6.5,6.5 0 0,0 9.5,16C11.11,16 12.59,15.41 13.73,14.43L14,14.71V15.5L19,20.5L20.5,19L15.5,14M9.5,14C7,14 5,12 5,9.5C5,7 7,5 9.5,5C12,5 14,7 14,9.5C14,12 12,14 9.5,14M7,9H12V10H7V9Z" />
                        </svg>
                    </button>

                    <input type="range" min="1" step="1000" max="20000000" v-model="zoomFactor" class="slider" id="zoom-slider" />
                </fieldset>
            </div>

            <!-- <div id="buttons-container"> -->
            <!-- <fieldset class="fieldset-buttons-container">
                    <legend>Focused SV</legend>
                    <button
                        id="focus-chart-btn"
                        @click="focusOnVariant"
                        :disabled="!showButton || !focusedVariant"
                        :class="{ disabled: !showButton || !focusedVariant }">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                            <title>zoom to focused sv</title>
                            <path d="M12,20L7,22L12,11L17,22L12,20M8,2H16V5H22V7H16V10H8V7H2V5H8V2M10,4V8H14V4H10Z" />
                        </svg>
                    </button>
                </fieldset> -->

            <!-- <fieldset class="fieldset-buttons-container">
                    <legend>Previous Z</legend>
                    <button
                        id="prev-zoom-btn"
                        :class="{ disabled: zoomHistory.length <= 1 }"
                        @click="focusOnPrevious"
                        :disabled="zoomHistory.length <= 1">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                            <title>previous-zoom</title>
                            <path
                                d="M12.5,8C9.85,8 7.45,9 5.6,10.6L2,7V16H11L7.38,12.38C8.77,11.22 10.54,10.5 12.5,10.5C16.04,10.5 19.05,12.81 20.1,16L22.47,15.22C21.08,11.03 17.15,8 12.5,8Z" />
                        </svg>
                    </button>
                </fieldset> -->
            <!-- </div> -->
            <div id="chrom-select-bar-div" v-if="globalView === 'linear'">
                <ChromSelectBarViz
                    v-if="chromSelectBarDataReady"
                    :selectedArea="selectedArea"
                    :centromeres="centromeres"
                    :bands="bands"
                    :chromosomes="chromosomes"
                    @selectAreaEvent="selectAreaEventFired" />
            </div>
        </div>

        <div class="wrapper-95">
            <IgvModal
                v-if="showIgvModal && samples.proband && focusedVariant"
                @close="showIgvModal = false"
                :region="zoomedStamp"
                :proband="samples.proband"
                :comparisons="samples.comparisons"
                :selectedVariant="focusedVariant"
                :genome-build="hgBuild"></IgvModal>
            <!-- <svCircos
                v-if="globalView === 'circos' && circosDataReady"
                :svList="svList"
                :focusedVariant="focusedVariant"
                :probandName="samples.proband.name"
                :zoomZone="selectedArea"
                :genesOfInterest="genesOfInterest"
                :phenRelatedGenes="phenRelatedGenes"
                :batchNum="batchNum"
                :samples="samplesLists"
                :samplesTitles="samplesTitles"
                :centromeres="centromeres"
                :bands="bands"
                :chromosomes="chromosomes"
                :genes="genes"
                @deleteTrack="removeTrack"
                @selectAreaEvent="selectAreaEventFired" /> -->

            <div
                id="linear-section-container"
                v-if="globalView === 'linear'"
                @dragover.prevent="handleDragOver"
                @drop="handleDrop">
                <div id="linear-marker-line" v-if="tools.line"></div>
                <IdeogramScaleBarViz
                    :selectedArea="selectedArea"
                    :bands="bands"
                    :centromeres="centromeres"
                    :chromosomes="chromosomes"
                    @selectAreaEvent="selectAreaEventFired" />

                <LinearRegionsChartViz
                    v-if="doseRegions"
                    :regionsList="doseRegions"
                    :selectedArea="selectedArea"
                    :chromosomes="chromosomes" />

                <component :is="geneChartData.component" v-bind="geneChartData.props" @selectAreaEvent="selectAreaEventFired" />

                <LinearSvChartViz
                    v-if="svList && svList.length > 0"
                    class="proband-chart"
                    :svList="svList"
                    :focusedVariant="focusedVariant"
                    :name="samples.proband.name"
                    :chromosomes="chromosomes"
                    :centromeres="centromeres"
                    :bands="bands"
                    :selectedArea="selectedArea"
                    :isProband="true"
                    @selectAreaEvent="selectAreaEventFired"
                    @focusedVariantEvent="focusedVariantEventFired" />

                <div v-if="samples.proband.bam" :class="{ 'collapseable-chart': true, collapsed: !showProbandCoverage }">
                    <button :disabled="zoomedSize < 32000" @click="showProbandCoverage = !showProbandCoverage">
                        <span v-if="!showProbandCoverage">show</span><span v-if="showProbandCoverage">hide</span> coverage
                    </button>
                    <button :disabled="!focusedVariant || !focusedVariantInView" @click="showIgvModal = true">
                        <span>Show IGV</span>
                    </button>
                    <MultiBamWrapper
                        v-if="showProbandCoverage"
                        :bamTitles="[samples.proband.name, ...samples.comparisons.map((sample) => sample.name)]"
                        :bamUrls="[samples.proband.bam, ...samples.comparisons.map((sample) => sample.bam)]"
                        :baiUrls="[samples.proband.bai, ...samples.comparisons.map((sample) => sample.bai)]"
                        :region="selectedArea || { start: 0, end: genomeEnd }"
                        :genomeSize="genomeEnd"></MultiBamWrapper>
                </div>

                <component
                    v-for="(chartData, index) in chartsData"
                    :key="index"
                    :is="chartData.component"
                    v-bind="chartData.props"
                    @dragstart="handleDragStart(index, $event)"
                    @selectAreaEvent="selectAreaEventFired"
                    @removeTrack="removeTrack(index)"
                    class="draggable-chart" />

                <LowerModal
                    v-if="focusedVariant"
                    :hidden="hideLowerModal"
                    :type="lowerModalType"
                    :variant="focusedVariant"
                    :patientPhenotypes="patientPhenotypes"
                    :geneCandidates="genesOfInterest"
                    :chromosomeAccumulatedMap="chromosomeAccumulatedMap"
                    :doseGenes="doseGenes"
                    @close="closeLowerModal"
                    @open="showLowerModal" />
            </div>
        </div>
    </div>
</template>

<script>
import svCircos from "./viz/svCircos.viz.vue";
import * as dataHelper from "../dataHelpers/dataHelpers.js";
import Sv from "../models/Sv.js";
import ChromSelectBarViz from "./viz/chromSelectBar.viz.vue";
import LinearSvChartViz from "./viz/linearSvChart.viz.vue";
import LinearGeneChartViz from "./viz/linearGeneChart.viz.vue";
import LinearRegionsChartViz from "./viz/clinGenChart.viz.vue";
import IdeogramScaleBarViz from "./viz/ideogramScaleBar.viz.vue";
import SvCirosMiniViz from "./viz/svCircosMini.viz.vue";
import LowerModal from "./LowerModal.vue";
import TippedButton from "./parts/TippedButton.vue";
import CoverageHistoWrapper from "./viz/CoverageHistoWrapper.vue";
import MultiBamWrapper from "./viz/MultiBamWrapper.viz.vue";
import IgvModal from "./viz/IgvModal.vue";
import { bpFormatted } from "../dataHelpers/commonFunctions.js";

export default {
    name: "ChartsSection",
    components: {
        svCircos,
        ChromSelectBarViz,
        LinearSvChartViz,
        LinearGeneChartViz,
        LinearRegionsChartViz,
        IdeogramScaleBarViz,
        SvCirosMiniViz,
        LowerModal,
        TippedButton,
        CoverageHistoWrapper,
        MultiBamWrapper,
        IgvModal,
    },
    props: {
        svList: Array,
        hgBuild: String,
        selectedArea: Object,
        focusedVariant: Object,
        genesOfInterest: Array,
        phenRelatedGenes: Array,
        patientPhenotypes: Array,
        focusedGeneName: String,
        batchNum: Number,
        samples: Object,
        genomeStart: Number,
        genomeEnd: Number,
        doseGenes: Object,
        doseRegions: Object,
    },
    data() {
        return {
            showButton: false,
            globalView: "linear",
            centromeres: null,
            bands: null,
            chromosomes: null,
            chromosomeAccumulatedMap: null,
            genes: null,
            zoomHistory: [],
            geneChartData: {},
            chartsData: [],
            samplesTitles: [],
            samplesLists: [],
            tools: {
                line: false,
            },
            hideLowerModal: true,
            lowerModalType: "",
            zoomFactor: 3000000,
            showProbandCoverage: false,
            showIgvModal: false,
        };
    },
    async mounted() {
        await this.getBaseData(this.hgBuild);
        await this.fetchSamples();
    },
    methods: {
        bpFormatted: bpFormatted,
        closeLowerModal() {
            this.hideLowerModal = true;
        },
        showLowerModal() {
            this.hideLowerModal = false;
        },
        toggleLineTool() {
            this.tools.line = !this.tools.line;
        },
        async getBaseData(build, source = "refseq") {
            try {
                let data = await dataHelper.getChromosomes(build);
                this.chromosomes = data;

                //create a map of the chromosomes to accumulate the length of each chromosome
                this.chromosomeAccumulatedMap = this.createCromosomeAccumulatedMap(this.chromosomes);
            } catch (error) {
                console.error("Error fetching chromosomes:", error);
            }

            try {
                let data = await dataHelper.getCentromeres(build);
                this.centromeres = data;
            } catch (error) {
                console.error("Error fetching centromeres:", error);
            }

            try {
                let data = await dataHelper.getBands(build);
                this.bands = data;
            } catch (error) {
                console.error("Error fetching bands:", error);
            }

            try {
                let data = await dataHelper.getGenes(build, source);
                this.genes = data;

                this.geneChartData = {
                    component: "LinearGeneChartViz",
                    props: {
                        genesList: this.genes,
                        name: "Genes",
                        selectedArea: this.selectedArea,
                        chromosomes: this.chromosomes,
                        centromeres: this.centromeres,
                        bands: this.bands,
                        phenRelatedGenes: this.phenRelatedGenes,
                        genesOfInterest: this.genesOfInterest,
                        batchNum: this.batchNum,
                        build: this.hgBuild,
                    },
                };
            } catch (error) {
                console.error("Error fetching genes:", error);
            }
        },
        async fetchSamples() {
            let locComparisons = this.samples.comparisons;
            let locChartsData = [];
            let locSamplesLists = new Array(this.samples.comparisons.length);
            let locSamplesTitles = new Array(this.samples.comparisons.length);

            for (let i = 0; i < locComparisons.length; i++) {
                let sample = locComparisons[i];

                let newSample = {
                    component: "LinearSvChartViz",
                    props: {
                        svList: [],
                        name: sample.name,
                        selectedArea: this.selectedArea,
                        chromosomes: this.chromosomes,
                        centromeres: this.centromeres,
                        bands: this.bands,
                        isProband: false,
                    },
                };

                locChartsData.push(newSample);

                try {
                    let data;
                    let svData;

                    if (!sample.id || sample.id === "") {
                        data = await dataHelper.getSVsFromVCF(sample.vcf, this.hgBuild);
                        svData = data.map((item) => new Sv(item));
                    } else {
                        data = await dataHelper.getSVsFromVCF(sample.vcf, this.hgBuild, sample.id);
                        svData = data.map((item) => new Sv(item));
                    }

                    locChartsData[i].props.svList = svData;
                    locSamplesLists[i] = svData;
                    locSamplesTitles[i] = sample.name;
                } catch (error) {
                    console.error(`Error fetching data for sample ${sample.name}:`, error);
                }
            }

            this.chartsData = locChartsData;
            this.samplesLists = locSamplesLists;
            this.$emit("update-comparison-lists", locSamplesLists); //We can use just the list for the update because the order is the same and they are both lists
            this.samplesTitles = locSamplesTitles;
        },
        createCromosomeAccumulatedMap(chromosomeList) {
            //iterate over the chromosomes and create the arcs
            let accumulatedBP = 0;
            let chromosomeAccumulatedMap = new Map();

            for (let chromosome of chromosomeList) {
                let chromStart = accumulatedBP;

                accumulatedBP += chromosome.length;

                let chromEnd = accumulatedBP;
                chromosomeAccumulatedMap.set(chromosome.chr, {
                    start: chromStart,
                    end: chromEnd,
                });
            }

            this.$emit("set-chromosome-accumulated-map", chromosomeAccumulatedMap);
            return chromosomeAccumulatedMap;
        },
        zoom(direction) {
            //Zoom can be in or out
            let zoomedSection = this.selectedArea;
            let currentSize = zoomedSection.end - zoomedSection.start;
            let center = zoomedSection.start + currentSize / 2;

            let zoomFactor = this.zoomFactor;
            let newSize = currentSize;

            if (direction === "in") {
                newSize = currentSize - zoomFactor * 2;
            } else if (direction === "out") {
                newSize = currentSize + zoomFactor * 2;
            }

            let newStart = center - newSize / 2;
            let newEnd = center + newSize / 2;

            if (newStart < 0) {
                newStart = 0;
            }

            if (newEnd >= this.genomeEnd) {
                newEnd = this.genomeEnd;
            }

            //if the new size would be smaller than 50bp we set it to 50bp
            if (newSize < 50) {
                newSize = 50;
                newStart = center - newSize / 2;
                newEnd = center + newSize / 2;
            }

            zoomedSection = {
                start: newStart,
                end: newEnd,
                size: newSize,
            };

            this.$emit("zoomEvent", zoomedSection);
        },
        findZoomFromFocus() {
            let focusedVariant = this.focusedVariant;

            let chrom = focusedVariant.chromosome;
            let chromStart = this.chromosomeAccumulatedMap.get(chrom).start;
            let chromEnd = this.chromosomeAccumulatedMap.get(chrom).end;
            let varStartAbs = parseInt(focusedVariant.start) + chromStart;
            let varEndAbs = parseInt(focusedVariant.end) + chromStart;
            let varSize = varEndAbs - varStartAbs;

            if (varSize < 50) {
                varSize = 50;
            }

            let halfSize = varSize / 2;

            let focusedStart = varStartAbs - halfSize;
            let focusedEnd = varEndAbs + halfSize;
            let focusedSize = focusedEnd - focusedStart;

            if (focusedStart < 0) {
                focusedStart = 0;
            } else if (focusedStart < chromStart) {
                focusedStart = chromStart;
            }

            if (focusedEnd >= this.genomeEnd) {
                focusedEnd = this.genomeEnd;
            } else if (focusedEnd > chromEnd) {
                focusedEnd = chromEnd;
            }

            let zoomedSection = {
                start: focusedStart,
                end: focusedEnd,
                size: focusedSize,
            };
            return zoomedSection;
        },
        findZoomFromFocusedGene() {
            if (!this.focusedGeneName) {
                return null;
            } else if (!this.genes) {
                return null;
            }

            let gene = this.genes[this.focusedGeneName];

            if (!gene) {
                return null;
            }

            let chrom = gene.chr.replace("chr", "");
            let chromStart = this.chromosomeAccumulatedMap.get(chrom).start;
            let geneStartAbs = gene.start + chromStart;
            let geneEndAbs = gene.end + chromStart;
            let geneSize = geneEndAbs - geneStartAbs;

            let focusedStart = geneStartAbs - geneSize;
            let focusedEnd = geneEndAbs + geneSize;

            if (focusedStart < 0) {
                focusedStart = 0;
            }

            if (focusedEnd >= this.genomeEnd) {
                focusedEnd = this.genomeEnd;
            }

            let zoomedSection = {
                start: focusedStart,
                end: focusedEnd,
                size: geneSize,
            };

            this.$emit("zoomEvent", zoomedSection, true);
            return zoomedSection;
        },
        selectAreaEventFired(zoomZone) {
            //if the zoomZone is not the whole genome we push it to the zoomHistory
            if (zoomZone && zoomZone.start !== 0 && !(zoomZone.end >= this.genomeEnd)) {
                //BUG: this may not catch the case that we are at the end or beginning but not selecting the whole? check
                this.zoomHistory.push(zoomZone);
            } else {
                this.zoomHistory = [];
                if (this.focusedVariant) {
                    this.showButton = true;
                }
            }
            this.$emit("zoomEvent", zoomZone);
        },
        focusedVariantEventFired(focusedVariant) {
            this.$emit("updateFocusedVariant", focusedVariant);
        },
        focusOnVariant() {
            this.showButton = false;
            //We can get the focusedVariant and calculate the appropriate selectedArea for it
            let zoomZone = this.findZoomFromFocus();
            //Then we just emit that and trickle down the selectedArea to the other components
            this.$emit("zoomEvent", zoomZone);
        },
        focusOnPrevious() {
            //We want to go to the -2 but only pop the last element
            this.zoomHistory.pop();
            let zoomZone = this.zoomHistory.slice(-1)[0];
            this.$emit("zoomEvent", zoomZone);
        },
        handleDragStart(index, event) {
            this.draggedIndex = index;
            event.dataTransfer.setData("text", index);
        },
        handleDragOver(event) {
            event.preventDefault();
        },
        handleDrop(event) {
            event.preventDefault();
            let obj = event.target;
            obj.style.cursor = "grab";
            //Subtract one because the first element is the proband chart in this case
            const targetIndex = Array.from(event.currentTarget.children).indexOf(event.target.closest(".draggable-chart"));
            if (targetIndex !== -1 && targetIndex !== this.draggedIndex) {
                this.reorderCharts(this.draggedIndex, targetIndex);
                this.draggedIndex = null;
            }
            //When dragged and dropped get all the .draggable-chart elements and set them not draggable again
            const draggableCharts = document.querySelectorAll(".draggable-chart");
            draggableCharts.forEach((chart) => {
                chart.setAttribute("draggable", false);
            });
        },
        reorderCharts(fromIndex, toIndex) {
            const chartToMove = this.chartsData.splice(fromIndex, 1)[0];
            this.chartsData.splice(toIndex, 0, chartToMove);
        },
        trackCursor() {
            let cursorTrackingZone = document.getElementById("linear-section-container");
            cursorTrackingZone.addEventListener("mousemove", this.moveMarkerLine);
        },
        untrackCursor() {
            let cursorTrackingZone = document.getElementById("linear-section-container");
            cursorTrackingZone.removeEventListener("mousemove", this.moveMarkerLine);
        },
        moveMarkerLine(event) {
            let line = document.getElementById("linear-marker-line");
            if (line) {
                let x = this.trackMouseX(event);
                line.style.left = x + "px";
            }
        },
        trackMouseX(event) {
            let container = document.getElementById("linear-section-container");
            let containerRect = container.getBoundingClientRect();
            let containerX = containerRect.x + 2;
            let x = event.clientX - containerX;
            if (x < 0) {
                return 0;
            } else if (x > containerRect.width) {
                return containerRect.width;
            } else {
                return x;
            }
        },
        removeTrack(trackIndex) {
            let localSampleComparisons = this.samples.comparisons;
            localSampleComparisons.splice(trackIndex, 1);
            this.$emit("updateComparisons", localSampleComparisons);
        },
    },
    computed: {
        isGlobalView() {
            if (this.selectedArea) {
                return this.selectedArea.start === 0 && this.selectedArea.end >= this.genomeEnd;
            } else {
                return true;
            }
        },
        circosDataReady() {
            let ready = this.chromosomes && this.centromeres && this.bands && this.genes && this.svList;

            return ready;
        },
        chromSelectBarDataReady() {
            return this.chromosomes && this.centromeres && this.bands;
        },
        zoomedStamp() {
            if (this.isGlobalView) {
                return "Whole Genome";
            } else if (!this.chromosomeAccumulatedMap || !this.selectedArea) {
                return "Whole Genome";
            } else {
                let startChromosome;
                let relativeStart;
                this.chromosomeAccumulatedMap.forEach((value, key) => {
                    if (this.selectedArea.start >= value.start && this.selectedArea.start <= value.end) {
                        startChromosome = key;
                        relativeStart = this.selectedArea.start - value.start;

                        if (relativeStart <= 0) {
                            relativeStart = 1;
                        }
                    }
                });
                let endChromosome;
                let relativeEnd;
                this.chromosomeAccumulatedMap.forEach((value, key) => {
                    //Subtract one because igv is 1 based and we are 0 based
                    if (this.selectedArea.end - 1 >= value.start && this.selectedArea.end - 1 <= value.end) {
                        endChromosome = key;
                        relativeEnd = this.selectedArea.end - value.start;
                    }
                });

                if (startChromosome === endChromosome) {
                    return `chr${startChromosome}:${relativeStart}-${relativeEnd}`;
                } else {
                    return `chr${startChromosome}:${relativeStart}-chr${endChromosome}:${relativeEnd}`;
                }
            }
        },
        zoomedSize() {
            if (!this.selectedArea) {
                return this.genomeEnd - this.genomeStart;
            }
            let size = this.selectedArea.end - this.selectedArea.start;
            return size;
        },
        focusedVariantInView() {
            /**
             * To show IGV we want to 1) have a focused variant and 2) we need that variant to be in the view window
             * This computed property is a boolean for that second criteria.
             *
             * There arent SVs called typically from one chromosome into another it isn't biologically plausible so
             * we can save some checks in the case that we have multiple chromosomes
             *
             * Using other computed property so that we dont have to re parse which chromosome we are in
             */

            if (!this.focusedVariant) {
                return false;
            }

            let stamps = this.zoomedStamp.split(":");
            if (!stamps) {
                //We are probably at the whole genome
                return false;
            }

            if (stamps.length == 2) {
                let chr = stamps[0].replace("chr", "");
                let startEnd = stamps[1].split("-");

                return (
                    chr == this.focusedVariant.chromosome &&
                    this.focusedVariant.start > startEnd[0] &&
                    this.focusedVariant.end < startEnd[1]
                );
            } else if (stamps.length > 2) {
                let chr1 = stamps[0].replace("chr", "");
                let chr2 = stamps[1].split("-")[1].replace("chr", "");
                let start = stamps[1].split("-")[0];
                let end = stamps[2];

                if (chr1 == this.focusedVariant.chromosome) {
                    //Head chromosome
                    return this.focusedVariant.start > start;
                } else if (chr2 == this.focusedVariant.chromosome) {
                    //Tail chromosome
                    return this.focusedVariant.end < end;
                } else if (chr1 < this.focusedVariant.chromosome && this.focusedVariant.chromosome < chr2) {
                    //In this case our range is multiple chromosomes but our variant is somewhere in there
                    return true;
                }
            }
            return false;
        },
    },
    watch: {
        focusedGeneName(newVal, oldVal) {
            this.hideLowerModal = false;
            this.lowerModalType = "gene";
            if (newVal && newVal !== oldVal && this.genes) {
                this.findZoomFromFocusedGene();
            }
        },
        batchNum() {
            const genesChart = this.chartsData.find((chart) => chart.props.name === "Genes");
            if (genesChart) {
                genesChart.props.batchNum = this.batchNum;
            }
        },
        focusedVariant(newVal, oldVal) {
            this.showProbandCoverage = false;

            if (this.focusedVariant) {
                this.hideLowerModal = false;
                this.lowerModalType = "variant";
                this.focusOnVariant();
            } else if (!this.focusedVariant) {
                this.$emit("zoomEvent", null);
                this.showButton = false;
            }
        },
        selectedArea: {
            handler(newVal, oldVal) {
                if (newVal && newVal !== oldVal) {
                    this.geneChartData.props.selectedArea = this.selectedArea;
                    this.chartsData.forEach((chart) => {
                        chart.props.selectedArea = this.selectedArea;
                    });
                } else if (!newVal) {
                    this.geneChartData.props.selectedArea = null;
                    this.chartsData.forEach((chart) => {
                        chart.props.selectedArea = null;
                    });
                }
            },
            deep: true,
        },
        genesOfInterest: {
            handler() {
                const genesChart = this.geneChartData;
                if (genesChart) {
                    genesChart.props.genesOfInterest = this.genesOfInterest;
                }
            },
            deep: true,
        },
        phenRelatedGenes: {
            handler() {
                const genesChart = this.geneChartData;
                if (genesChart) {
                    genesChart.props.phenRelatedGenes = this.phenRelatedGenes;
                }
            },
            deep: true,
        },
        "samples.comparisons": {
            async handler(newVal, oldVal) {
                if (newVal.length !== oldVal.length) {
                    await this.fetchSamples();
                } else if (oldVal.length === 0) {
                    await this.fetchSamples();
                } else {
                    for (let i = 0; i < newVal.length; i++) {
                        if (newVal[i].name !== oldVal[i].name) {
                            await this.fetchSamples();
                            break;
                        }

                        if (newVal[i].vcf !== oldVal[i].vcf) {
                            await this.fetchSamples();
                            break;
                        }

                        if (newVal[i].id !== oldVal[i].id) {
                            await this.fetchSamples();
                            break;
                        }

                        if (newVal[i].svList.length !== oldVal[i].svList.length) {
                            await this.fetchSamples();
                            break;
                        }
                    }
                }
            },
        },
        tools: {
            handler() {
                if (this.tools.line) {
                    this.trackCursor();
                } else {
                    this.untrackCursor();
                }
            },
            deep: true,
        },
        hgBuild(newVal, oldVal) {
            if (newVal !== oldVal) {
                this.getBaseData(newVal);
            }
        },
    },
};
</script>

<style lang="sass">
.slider
    -webkit-appearance: none
    width: 70px
    height: 5px
    border-radius: 5px
    background: #d3d3d3
    outline: none
    opacity: 0.7
    -webkit-transition: .2s
    transition: opacity .2s
    &:hover
        opacity: 1
    &::-webkit-slider-thumb
        -webkit-appearance: none
        appearance: none
        width: 10px
        height: 10px
        border-radius: 50%
        background: #2A65B7
        cursor: pointer
    &::-moz-range-thumb
        width: 10px
        height: 10px
        border-radius: 50%
        background: #2A65B7
        cursor: pointer
.zoom-level-label
    color: #2A65B7
.fieldset-buttons-container
    display: flex
    flex-direction: row
    align-items: center
    justify-content: center
    padding: 2px 5px
    border: 1px solid #E0E0E0
    border-radius: 5px
    margin-left: 10px
    legend
        margin: 0px
        padding: 0px
        font-size: 0.6em
        text-transform: uppercase
        text-align: center
        font-style: italic
        color: #474747
    button
        display: flex
        flex-direction: row
        align-items: center
        justify-content: center
        padding: 3px
        margin: 0px 2px
        border: 1px solid transparent
        border-radius: 5px
        text-transform: uppercase
        color: #474747
        height: 100%
        transition: background-color 0.2s, border 0.2s
        &.disabled
            cursor: not-allowed
            color: #B0B0B0
            background-color: inherit
            svg
                fill: #B0B0B0
            &:hover
                background-color: inherit
                border: 1px solid transparent
                cursor: not-allowed
        &:hover
            cursor: pointer
            background-color: #C1D1EA
            border: 1px solid #2A65B7
        svg
            width: 18px
            height: 18px
            fill: #2A65B7
            border-radius: 50%
#radios-tools-container
    display: flex
    justify-content: flex-start
    align-items: flex-end
    height: 100%
    .location-indicator
        display: flex
        flex-direction: row
        align-items: center
        padding: 5px
        border: none
        border-bottom: 1px solid #E0E0E0
        margin-left: 10px
    legend
        margin: 0px
        padding: 0px
        font-size: 0.6em
        text-transform: uppercase
        font-style: italic
        color: #474747
    p.entry
        margin: 0px
        padding: 0px
        font-size: 0.8em
        border-radius: 5px
#left-tracks-section
    box-sizing: border-box
    display: flex
    flex-direction: column
    flex-grow: 1
    height: 100%
    overflow: hidden
    padding: 5px 10px
    position: relative
    transition: all 0.5s
    #circos-mini-wrapper
        position: absolute
        right: 5px
        top: 5px
        width: 22%
    .upper-track-selectors-bar
        align-items: center
        box-sizing: border-box
        display: flex
        width: 100%
    .wrapper-95
        position: relative
        box-sizing: border-box
        display: flex
        flex-direction: column
        flex-grow: 1
        overflow: hidden
        padding: 2px
        width: 100%
    #linear-section-container
        box-sizing: border-box
        flex: 1 1 auto
        overflow-y: auto
        padding-left: 10px
        padding-right: 10px
        position: relative
        #linear-marker-line
            position: absolute
            top: 0px
            left: 0px
            width: 1px
            height: 100%
            background-color: red
            z-index: 2
        .proband-chart
            position: sticky
            top: 2px
            z-index: 1
#buttons-container
    height: 100%
    display: flex
#chrom-select-bar-div
    height: 30px
    display: flex
    align-items: center
    justify-content: center
    flex-grow: 1
    box-sizing: content-box
#global-chart-style-selection
    width: fit-content
    color: #2A65B7
    background-color: #EBEBEB
    border: 1px solid transparent
    border-radius: 5px
    margin-left: 10px
    padding: 5px
    height: 100%
    display: flex
    align-items: center
    transition: background-color 0.2s, border 0.2s
    &:hover
        cursor: pointer
        background-color: #C1D1EA
        border: 1px solid #2A65B7
select
    border: none
    font-weight: bold
    color: #2A65B7
    font-size: 1em
    text-transform: uppercase
    background-color: inherit
    &:hover
        cursor: pointer
    &:focus
        outline: none
.collapseable-chart
    padding: 0px
    margin: 0px
    border: 0px
    overflow: visible
    position: relative
    &.collapsed
        height: 0px
    button:nth-of-type(1)
        position: absolute
        top: -10px
        right: 75px
        cursor: pointer
        z-index: 3
        border-radius: 10px
        border: none
        color: #2A65B7
        border: 1px solid transparent
        transition: background-color 0.2s, border 0.2s
        &:hover
            background-color: #C1D1EA
            border: 1px solid #2A65B7
        &:disabled
            cursor: not-allowed
            color: #B0B0B0
            background-color: #EBEBEB
            border: 1px solid #B0B0B0
            &:hover
                border: 1px solid #B0B0B0
                background-color: #EBEBEB
                cursor: not-allowed
    button:nth-of-type(2)
        position: absolute
        top: -10px
        right: 0px
        cursor: pointer
        z-index: 3
        border-radius: 10px
        border: none
        color: #2A65B7
        border: 1px solid transparent
        transition: background-color 0.2s, border 0.2s
        &:hover
            background-color: #C1D1EA
            border: 1px solid #2A65B7
        &:disabled
            cursor: not-allowed
            color: #B0B0B0
            background-color: #EBEBEB
            border: 1px solid #B0B0B0
            &:hover
                border: 1px solid #B0B0B0
                background-color: #EBEBEB
                cursor: not-allowed
</style>

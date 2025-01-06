// const BACKEND_URL_BASE = "http://localhost:7477"; //Development
const BACKEND_URL_BASE = "https://mosaic-staging.chpc.utah.edu/sv.iobio/backend"; //Production

//GET CROMOSOMES
export async function getChromosomes(build = "hg38") {
    try {
        const response = await fetch(`${BACKEND_URL_BASE}/chromosomes?build=${build}`);
        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Error Getting Cromosomes:", error);
    }
}

//GET CENTROMERES
export async function getCentromeres(build = "hg38") {
    try {
        const response = await fetch(`${BACKEND_URL_BASE}/centromeres?build=${build}`);
        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Error Getting Centromeres:", error);
    }
}

//GET BANDS
export async function getBands(build = "hg38") {
    try {
        const response = await fetch(`${BACKEND_URL_BASE}/bands?build=${build}`);
        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Error Getting Bands", error);
    }
}

//GET GENES
export async function getGenes(build = "hg38", source = "refseq") {
    try {
        const response = await fetch(`${BACKEND_URL_BASE}/genes?build=${build}&source=${source}`);
        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Error Getting Genes:", error);
    }
}

//GET SVS FROM VCF
export async function getSVsFromVCF(vcfFile, build = "hg38", sampleName = null) {
    try {
        if (!sampleName) {
            const response = await fetch(`${BACKEND_URL_BASE}/dataFromVcf?vcfPath=${vcfFile}?build=${build}`);
            const data = await response.json();
            return data;
        } else {
            const response = await fetch(
                `${BACKEND_URL_BASE}/dataFromVcf?vcfPath=${vcfFile}&sampleName=${sampleName}?build=${build}`
            );
            const data = await response.json();
            return data;
        }
    } catch (error) {
        console.error("Error Getting VCF Data:", error);
    }
}

//GET VCF SAMPLES FROM URL
export async function getVCFSamplesFromURL(url) {
    try {
        const response = await fetch(`${BACKEND_URL_BASE}/vcfSamples?vcfPath=${url}`);
        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Error Getting VCF Samples:", error);
    }
}

//GET QUALITY FROM VCF
export async function getQualityFromVCF(vcfFile, sampleName = null) {
    try {
        if (!sampleName) {
            const response = await fetch(`${BACKEND_URL_BASE}/vcfQuality?vcfPath=${vcfFile}`);
            const data = await response.json();
            return data;
        } else {
            const response = await fetch(`${BACKEND_URL_BASE}/vcfQuality?vcfPath=${vcfFile}&sampleName=${sampleName}`);
            const data = await response.json();
            return data;
        }
    } catch (error) {
        console.error("Error Getting VCF Quality:", error);
    }
}

//GET SV BATCH INFO
export async function getSVBatchInfo(svBatch, build = "hg38", source = "refseq") {
    const svBatchJson = JSON.stringify({ variants: svBatch });
    try {
        const response = await fetch(`${BACKEND_URL_BASE}/sv/info/batch?source=${source}&build=${build}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: svBatchJson,
        });
        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Error Getting SV Batch Info:", error);
    }
}

//GET GENES FOR PHENOTYPES
export async function getGenesForPhenotypes(phenotypes) {
    try {
        const response = await fetch(`${BACKEND_URL_BASE}/phenotypeGenes?phenotypes=${phenotypes}`);
        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Error Getting Genes for Phenotypes:", error);
    }
}

//GET TRANSCRIPTS FOR GENE LIST
export async function getTranscriptsForGenes(geneList, build = "hg38", source = "gencode") {
    const geneListString = geneList.join(",");
    try {
        const response = await fetch(`${BACKEND_URL_BASE}/transcripts?genes=${geneList}&build=${build}&source=${source}`);
        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Error Getting Transcripts for Gene List:", error);
    }
}

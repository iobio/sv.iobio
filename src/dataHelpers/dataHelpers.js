const BACKEND_URL_BASE = "http://localhost:7477"; //Development
// const BACKEND_URL_BASE = "https://mosaic-staging.chpc.utah.edu/sv.iobio/backend"; //Production

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

//GET SENSITIVE GENES
export async function getSensitiveGenes(build = "hg38") {
    try {
        const response = await fetch(`${BACKEND_URL_BASE}/doseSensitiveGenes?build=${build}`);
        const data = await response.json();
        return data;
    } catch (e) {
        console.error("Error getting dose sensitive genes");
    }
}

//GET SENSITIVE REGIONS
export async function getSensitiveRegions(build = "hg38") {
    try {
        const response = await fetch(`${BACKEND_URL_BASE}/doseSensitiveRegions?build=${build}`);
        const data = await response.json();
        return data;
    } catch (e) {
        console.error("Error getting dose sensitive regions");
    }
}

//GET SVS FROM VCF
export async function getSVsFromVCF(vcfFile, build = "hg38", sampleName = null) {
    try {
        if (!sampleName) {
            const response = await fetch(`${BACKEND_URL_BASE}/dataFromVcf?vcfPath=${vcfFile}&build=${build}`);
            const data = await response.json();
            return data;
        } else {
            const response = await fetch(
                `${BACKEND_URL_BASE}/dataFromVcf?vcfPath=${vcfFile}&sampleName=${sampleName}&build=${build}`,
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

//GET THE OVERLAPPING SVS FROM POPULATION
export async function getPopulationSvs(sv, build = "hg38") {
    const chr = sv.chromosome;
    const start = sv.start;
    const end = sv.end;
    const svlen = sv.size;

    try {
        const response = await fetch(
            `${BACKEND_URL_BASE}/sv/pop_overlaps?svlen=${svlen}&chr=chr${chr}&start=${start}&end=${end}&build=${build}`,
        );
        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Error Getting Population SVs:", error);
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

//LOOK FOR THE GENE
export async function searchForGene(geneQuery) {
    try {
        const response = await fetch(`https://backend.iobio.io/geneinfo/lookup/${geneQuery}?searchAlias=last`);
        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Error Searching for Gene:", error);
    }
}

//LOOK FOR THE PHENOTYPE by NAME
export async function searchForPhenotype(phenotypeQuery) {
    try {
        const response = await fetch(`${BACKEND_URL_BASE}/phenotype/lookup?phenotype=${phenotypeQuery}`);
        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Error Searching for Phenotype:", error);
    }
}

//LOOK FOR THE PHENOTYPE by hpo_id
export async function searchForHPO(hpo_id) {
    try {
        const response = await fetch(`${BACKEND_URL_BASE}/phenotype/lookup?hpo_id=${hpo_id}`);
        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Error Searching for HPO Id:", error);
    }
}

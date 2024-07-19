
// const BACKEND_URL_BASE = 'http://localhost:7477'; //Development
const BACKEND_URL_BASE = 'http://mosaic-staging.chpc.utah.edu/sv.iobio/backend'; //Production

//GET CROMOSOMES
export async function getChromosomes(build='hg38') {
    try {
        const response = await fetch(`${BACKEND_URL_BASE}/chromosomes?build=${build}`);
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error Getting Cromosomes:', error);
    }
}

//GET CENTROMERES
export async function getCentromeres(build='hg38') {
    try {
        const response = await fetch(`${BACKEND_URL_BASE}/centromeres?build=${build}`);
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error Getting Centromeres:', error);
    }
}

//GET BANDS
export async function getBands(build='hg38') {
    try {
        const response = await fetch(`${BACKEND_URL_BASE}/bands?build=${build}`);
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error Getting Bands', error);
    }
}

//GET GENES
export async function getGenes(build='hg38', source='refseq') {
    try {
        const response = await fetch(`${BACKEND_URL_BASE}/genes?build=${build}&source=${source}`);
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error Getting Genes:', error);
    }
}

//GET SVS FROM VCF
export async function getSVsFromVCF(vcfFile) {
    try {
        const response = await fetch(`${BACKEND_URL_BASE}/dataFromVcf?vcfPath=${vcfFile}`);
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error Getting VCF Data:', error);
    }
}

//GET SV BATCH INFO
export async function getSVBatchInfo(svBatch, build='hg38', source='refseq') {
    const svBatchJson = JSON.stringify({variants: svBatch});
    try {
        const response = await fetch(`${BACKEND_URL_BASE}/sv/info/batch?source=${source}&build=${build}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: svBatchJson
        });
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error Getting SV Batch Info:', error);
    }

}

//GET GENES FOR PHENOTYPES
export async function getGenesForPhenotypes(phenotypes) {
    try {
        const response = await fetch(`${BACKEND_URL_BASE}/phenotypeGenes?phenotypes=${phenotypes}`);
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error Getting Genes for Phenotypes:', error);
    }

}
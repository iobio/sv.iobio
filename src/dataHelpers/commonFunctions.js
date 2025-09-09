//Location for common data transformation functions

export function bpFormatted(valuebp) {
    //Returns a formatted string for base pairs (bp) values
    if (valuebp > 1000000) {
        return `${(valuebp / 1000000).toFixed(2)}<span class="bp-sc">Mb</span>`;
    } else if (valuebp > 1000) {
        return `${(valuebp / 1000).toFixed(2)}<span class="bp-sc">kb</span>`;
    }
    return `${valuebp}<span class="bp-sc">bp</span>`;
}

export function bpFormattedSansHtml(valuebp) {
    if (valuebp > 1000000) {
        return `${(valuebp / 1000000).toFixed(2)}Mb`;
    } else if (valuebp > 1000) {
        return `${(valuebp / 1000).toFixed(2)}kb`;
    }
    return `${valuebp}bp`;
}

export function formatGenotype(genotype, full = false) {
    //Returns a formatted string for genotype values
    let numcode = genotype.slice(0, 3);
    if (full) {
        if (numcode === "0/0") {
            return "Homozygous";
        }
        if (numcode === "0/1") {
            return "Heterozygous";
        }
        if (numcode === "1/1") {
            return "Homozygous";
        }
        if (numcode === "./1") {
            return "Heterozygous";
        }
        if (numcode === "./.") {
            return "Unknown";
        }
        return numcode;
    } else {
        if (numcode === "0/0") {
            return "Hom";
        } else if (numcode === "0/1") {
            return "Het";
        } else if (numcode === "1/1") {
            return "Hom";
        } else if (numcode === "./1") {
            return "Het";
        } else if (numcode === "./.") {
            return "UnKnown";
        } else {
            return numcode;
        }
    }
}

export function convertClinGenScores(score) {
    if (score == 0) {
        return "No Evidence";
    } else if (score == 1) {
        return "Little Evidence";
    } else if (score == 3) {
        return "Sufficient Evidence";
    } else if (score == 30) {
        return "Autosomal Recessive";
    } else if (score == 40) {
        return "Dose Sens. Unlikely";
    }
}

export function svgForZygosity(genotype) {
    let gt = genotype.slice(0, 3);
    if (gt === "1/1") {
        return `
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                <title>HOM</title>
                <path d="M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2Z" />
            </svg>
        `;
    } else if (gt === "0/1" || gt === "./1" || gt === "1/0" || gt === "1/.") {
        return `
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                <title>HET</title>
                <path d="M12 2A10 10 0 0 0 2 12A10 10 0 0 0 12 22A10 10 0 0 0 22 12A10 10 0 0 0 12 2M12 4A8 8 0 0 1 20 12A8 8 0 0 1 12 20V4Z" />
            </svg>
        `;
    } else if (gt === "0/0" || gt === "./.") {
        return `
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                <title>REF</title>
                <path d="M12,20A8,8 0 0,1 4,12A8,8 0 0,1 12,4A8,8 0 0,1 20,12A8,8 0 0,1 12,20M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2Z" />
            </svg>
        `;
    }
}

export function formatType(type) {
    type = type.toUpperCase();

    if (type === "DEL") {
        return "Deletion";
    } else if (type === "INS") {
        return "Insertion";
    } else if (type === "DUP") {
        return "Duplication";
    } else if (type === "INV") {
        return "Inversion";
    } else if (type === "CNV") {
        return "Copy Number Variation";
    }
    return type;
}

export function generateSvCode(sv) {
    //We are going to do Chr#-SizeInFormat-Type-Start-End
    let code = `Chr${sv.chromosome}-${bpFormattedSansHtml(sv.size)}-${sv.type.toUpperCase()}-${sv.start}-${sv.end}`;
    return code;
}

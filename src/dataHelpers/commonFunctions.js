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

export function formatGenotype(genotype, full=false) {
    //Returns a formatted string for genotype values
    let numcode = genotype.slice(0, 3);
    if (full) {
        if (numcode === '0/0') {
            return 'Homozygous Reference'
        }
        if (numcode === '0/1') {
            return 'Heterozygous'
        }
        if (numcode === '1/1') {
            return 'Homozygous Alternate'
        }
        if (numcode === './1') {
            return 'Unknown Alternate'
        }
        if (numcode === './.') {
            return 'Unknown'
        }
        return numcode
    } else {
        if (numcode === '0/0') {
            return 'Hom Ref'
        } else if (numcode === '0/1') {
            return 'Het'
        } else if (numcode === '1/1') {
            return 'Hom Alt'
        } else if (numcode === './1') {
            return 'UnKnown Alt'
        } else if (numcode === './.') {
            return 'UnKnown'
        } else {
            return numcode
        } 
    }

}

export function formatType(type) {
    type = type.toUpperCase()

    if (type === 'DEL') {
        return 'Deletion'
    } else if (type === 'INS') {
        return 'Insertion'
    } else if (type === 'DUP') {
        return 'Duplication'
    } else if (type === 'INV') {
        return 'Inversion'
    } else if (type === 'CNV') {
        return 'Copy Number Variation'
    }
    return type
}

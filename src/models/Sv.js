/**
 * This class is for our variant model
 */

class Sv {
    constructor(input) {
        if (typeof input === "object" && input !== null) {
            this.chromosome = input.contigName || input.chromosome;
            this.start = input.start;
            this.end = input.end;
            //The svlen is negative when the variant is a deletion which really doesn't make sense for our use case so we will just take the absolute value
            //If for some reason we don't have an svlen then we will just take the absolute value of the difference between the start and end
            this.size = Math.abs(parseInt(input.size)) || Math.abs(parseInt(input.end) - parseInt(input.start));
            //If we couldn't find the svtype and it is falsey then we will just set it to 'unknown'
            this.type = input.type || "unknown";
            this.genotype = input.genotype;
            this.dupHChr = input.dupHChr || null;
            this.dupHFlank = input.dupHFlank || null;
            this.dupHBinGC = input.dupHBinGC || null;
            this.gcFraction = input.gcFraction || null;
            this.svafotateMaxAf = input.svafotateMaxAf || null;
            this.ref = input.ref || ".";
            this.alt = input.alt || ".";
            this.quality = input.quality;
            this.svCode = input.svCode || "";
            this.bands = input.bands || [];

            //if we get vcfInfo then parse otherwise don't
            if (input.vcfInfo != "" && input.vcfInfo != undefined) {
                this.info = this.parseInfo(input.vcfInfo);
            } else if (input.info) {
                this.info = input.info;
            } else {
                this.info = {};
            }

            this.overlappedGenes = input.overlappedGenes || {};
        } else {
            //This wont run (at least not now)
        }
    }

    parseInfo(info) {
        const infoArray = info.split(";");
        const infoObj = {};
        infoArray.forEach((item) => {
            const [key, value] = item.split("=");
            infoObj[key] = value;
        });
        return infoObj;
    }

    setSvCode(code) {
        this.svCode = code;
    }

    getSvCode() {
        return this.svCode;
    }
}

export default Sv;

/**
 * This class is for our variant model
 */

class Sv {
    constructor(input) {
        if (typeof input === 'object' && input !== null) {
            this.chromosome = input.contigName || input.chromosome;
            this.start = input.start;
            this.end = input.end;
            this.assembly = input.genomeAssembly || input.assembly;
            this.type = input.type;
            this.effect = input.variantEffect || input.effect;

            //if we get vcfInfo then parse otherwise don't
            if (input.vcfInfo != '' && input.vcfInfo != undefined) {
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
        const infoArray = info.split(';');
        const infoObj = {};
        infoArray.forEach(item => {
            const [key, value] = item.split('=');
            infoObj[key] = value;
        });
        return infoObj;
    }
}

export default Sv;
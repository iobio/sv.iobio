/**
 * This class is for our variant model
 */

class Sv {
    constructor(input) {
        if (typeof input === 'object' && input !== null) {
            this.chromosome = input.contigName;
            this.start = input.start;
            this.end = input.end;
            this.assembly = input.genomeAssembly;
            this.type = input.type;
            this.effect = input.variantEffect;

            //if we get vcfInfo then parse otherwise don't
            if (input.vcfInfo != '') {
                this.info = this.parseInfo(input.vcfInfo);
            } else {
                this.info = []
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
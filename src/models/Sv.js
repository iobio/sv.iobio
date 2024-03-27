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
            this.info = this.parseInfo(input.vcfInfo);
            this.rank = input.rank;
            this.gene = input.gene;
            this.exomiserCombScore = input.exomiserCombScore;
            this.exomiserPval = input.exomiserPval;
            this.exomiserPriorityScore = input.exomiserPriorityScore;

            let array = this.parseExomiser(this.info.Exomiser);
            this.info.Exomiser = array;
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

    parseExomiser(exomiserInfo) {
        let array = exomiserInfo.split(',');
        //take the curly braces off of each element
        array = array.map(item => item.slice(1, -1));
        array = array.map(item => item.split('|'));

        return array;
    }
}

export default Sv;
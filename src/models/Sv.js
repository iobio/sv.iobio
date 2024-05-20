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

            this.rank = input.rank;
            this.gene = input.gene;
            this.exomiserCombScore = input.exomiserCombScore;
            this.exomiserPval = input.exomiserPval;
            this.exomiserPriorityScore = input.exomiserPriorityScore;

            if (this.info.Exomiser) {
                let array = this.parseExomiser(this.info.Exomiser);
                this.info.Exomiser = array;
            } else {
                this.info.Exomiser = []
            }

            this.otherGenes = input.otherGenes;
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
        //take the curly braces off of each element
        let array = exomiserInfo.split(',{');
        array = array.map(geneListItem => geneListItem.split('|'));

        //parse the array into an object
        array = array.map(geneListItem => {
            geneListItem = geneListItem.map(item => item.replace(/[{}'"\\\/]/g, '').replace(/_/g, ' '))
            return {
                geneRank: geneListItem[0],
                geneSymbol: geneListItem[2],
                geneId: geneListItem[3],
                significance: geneListItem[14],
                omim: geneListItem[16],
                disease: geneListItem[17],
            };
        });

        return array;
    }
}

export default Sv;
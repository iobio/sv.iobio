import * as d3 from 'd3';

export default function linearGeneChart(parentElement, refChromosomes, data, options=null) {
    let width = parentElement.clientWidth - 10;
    let height = parentElement.clientHeight;
    let chromosomes = refChromosomes;
    let genes = data;
    let selectionCallback = null;
    let brush = false;
    let selection = null;
    let genesOfInterest = null;
    let phenRelatedGenes = null;  
    let centromeres = null;
    let bands = null; 

    //zoom variables
    let zoomedSelection = null;
    
    if (options) {
        if (options.selectionCallback) {
            selectionCallback = options.selectionCallback;
        }
        if (options.brush) {
            brush = options.brush;
        }
        if (options.selection && options.selection !== null) {
            //we want to automatically brush to the selection
            selection = options.selection;
            //Ensure that the selection.start is less than the selection.end
            if (selection.start > selection.end) {
                let temp = selection.start;
                selection.start = selection.end;
                selection.end = temp;
            }
        }
        if (options.genesOfInterest && options.genesOfInterest.length > 0) {
            genesOfInterest = options.genesOfInterest;
            genesOfInterest = genesOfInterest.map(gene => genes[gene])
            genesOfInterest.filter(gene => gene !== undefined);
          }
        if (options.phenRelatedGenes && options.phenRelatedGenes.length > 0) {
            phenRelatedGenes = options.phenRelatedGenes;
            phenRelatedGenes = phenRelatedGenes.map(gene => genes[gene])
            phenRelatedGenes.filter(gene => gene !== undefined);
        }

        if (options.centromeres) {
            centromeres = options.centromeres;

            //Convert the centromeres remove the chr from the chr field use that as the key
            let newCentromeres = {};
            for (let centromere of centromeres) {
                let newKey = centromere.chr.replace('chr', '');
                newCentromeres[newKey] = centromere;
            }
            centromeres = newCentromeres;
        }
        if (options.bands) {
            bands = options.bands;

            let newBands = [];
            for (let band of bands) {
                let newChr = band.chr.replace('chr', '');

                //if the chr has a _ cut everything after it
                if (newChr.includes('_')) {
                    newChr = newChr.split('_')[0];
                }

                //if the new chr has a _ then skip it or if it's M or Un, or if the name doesnt have a . in it then skip it
                if (newChr == 'M' || newChr == 'Un') {
                    continue;
                }

                //if they are gneg they are going to be white so skip them ie they are not gpos
                if (!band.gieStain.includes('gpos')) {
                    continue;
                }

                band.chr = newChr;
                newBands.push(band);
            }
            bands = newBands;
        }
    }

    const svg = d3.create('svg')
        .attr('viewBox', [0, 0, width, height])
        .attr('class', 'linear-gene-chart-d3')
        .attr('width', width)
        .attr('height', height);

    let { chromosomeMap, genomeSize } = _genChromosomeAccumulatedMap(chromosomes);

    let originZoom = {
        start: 0,
        end: genomeSize,
        size: genomeSize
    }

    if (selection) {
        if (selection.end - selection.start >= genomeSize) {
            zoomedSelection = originZoom;
            selection = null;
        } else {
            zoomedSelection = {
                start: selection.start,
                end: selection.end,
                size: selection.end - selection.start
            }
            selection = null; //setting selection to null so that we can keep zooming if we like
        }
    } else {
        zoomedSelection = originZoom;
    }

    //if the selection is the origin zoom then we want to set the selection to null
    if (selection && selection.start == 0 && selection.end == genomeSize) {
        selection = null;
    }

    let x = d3.scaleLinear()
        .domain([zoomedSelection.start, zoomedSelection.end])
        .range([0, width]);

    _renderGenes([zoomedSelection.start, zoomedSelection.end])

    //============================ INTERNAL FUNCTIONS ============================//
    function _genChromosomeAccumulatedMap(chromosomeList){
        let accumulatedBP = 0;

        let chromosomeAccumulatedMap = new Map();

        for (let chromosome of chromosomeList) {
            let chromStart = accumulatedBP;

            accumulatedBP += chromosome.length;

            let chromEnd = accumulatedBP;
            chromosomeAccumulatedMap.set(chromosome.chr, {start: chromStart, end: chromEnd});
        }

        let genomeSize = accumulatedBP;
        let chromosomeMap = chromosomeAccumulatedMap;

        return {chromosomeMap, genomeSize};
    }

    function _renderGenes(range) {
        //grab all the gene-group groups and remove them before rendering the new ones
        svg.selectAll('.gene-group').remove();
        svg.selectAll('.gene-group-phenrelated').remove();
        svg.selectAll('.gene-group-geneofinterest').remove();

        let isWholeGenome = range[0] == 0 && range[1] == genomeSize;
        let isLessThanOneChr = range[1] - range[0] <= chromosomeMap.get('1').end;

        //if we are rendering the whole genome and don't have any GOI or phenRelatedGenes, return early
        if (isWholeGenome && (!phenRelatedGenes || phenRelatedGenes.length == 0) && (!genesOfInterest || genesOfInterest.length == 0)) {
            svg.append('text')
                .attr('x', width/2 - 80)
                .attr('y', height/2)
                .text('Select an area to view genes')
                .attr('font-size', '15px')
                .attr('fill', '#2A65B7')
                .attr('font-style', 'italic');
            return;
        } 

        let localGenes = JSON.parse(JSON.stringify(genes));

        let tracMap = {
            1: false,
        };

        let genesMap = {};
        for (let gene of Object.values(localGenes)) {
            
            let geneType = _determineGeneType(gene, genesOfInterest, phenRelatedGenes);

            //if we are rendering the whole genome and the gene is a normal gene then we skip it
            if (isWholeGenome && geneType == 'normal') {
                continue;
            }

            let chr = gene.chr.replace('chr', '');
            
            let start = gene.start;
            let end = gene.end;

            let chromosome = chromosomeMap.get(chr);
            if (!chromosome) {
                continue;
            }

            let absoluteStart = chromosome.start + start;
            let absoluteEnd = chromosome.start + end;

            let startUpdated = absoluteStart;
            let endUpdated = absoluteEnd;

            let startX = null;
            let endX = null;

            //check and see if the gene is in the zoomed selection
            let newStartEnd = _getStartEndForRange(absoluteStart, absoluteEnd, range);

            if (!newStartEnd) {
                continue;
            } else {
                startUpdated = newStartEnd.start;
                endUpdated = newStartEnd.end;

                startX = x(startUpdated);
                endX = x(endUpdated);
            }

            //add the gene to the map if it doesn't exist
            if (!genesMap[`${absoluteStart}-${absoluteEnd}`]) {
                genesMap[`${absoluteStart}-${absoluteEnd}`] = [gene];

                let idMap = {
                    'start': start,
                    'end': end,
                    'chr': chr
                };

                let xMap = {
                    'startX': startX,
                    'endX': endX
                };

                let geneGroup = _createGene(xMap, idMap, gene, range, geneType, isLessThanOneChr);

                let label = geneGroup.select('.gene-label');
                let mTextWidth = 0;

                if (label.node()) {
                    let measureSvg = d3.create('svg');
                    parentElement.appendChild(measureSvg.node());

                    let measureText = measureSvg.node().appendChild(label.node().cloneNode(true));
                    mTextWidth = measureText.getBBox().width;
                    measureSvg.remove();
                }

                let currentTrac = 1; 
                let length = Object.keys(tracMap).length + 1;
                let trackRange = Array.from({ length }, (_, i) => i + 1);

                for (let x of trackRange) {
                    if (!tracMap[x]) {
                        tracMap[x] = endX;
                        currentTrac = x;
                        break;
                    }

                    if ((startX - mTextWidth) > tracMap[x] + 2) {
                        tracMap[x] = endX;
                        currentTrac = x;
                        break;
                    } else if ((startX - mTextWidth) < tracMap[x] + 2) {
                        continue;
                    }
                }

                let translateY = (currentTrac - 1) * 9;

                if (translateY >= height) {
                    height += 9;
                    svg.attr('viewBox', [0, 0, width, height])
                        .attr('height', height);
                }

                geneGroup.attr('transform', `translate(${startX + 30}, ${translateY + 25})`);

                svg.append(() => geneGroup.node()); //append the gene group to the svg
            } else {
                //dont render the gene if it already exists
                genesMap[`${absoluteStart}-${absoluteEnd}`].push(gene);
            }
        }
    }

    //render brush later so it's on top
    if (brush) {
        let brush = d3.brushX()
            .extent([[0, 0], [width, 25]])
            .on('brush', function (event) {
                let brushArea = d3.select(this);
                let selection = brushArea.select('.selection')
                // Customize the brush rectangle during brushing
                selection
                    .attr('fill', 'rgba(0, 100, 255, 0.3)')
                    .attr('stroke', '#4C709B')
                    .attr('stroke-width', 1)
                    .attr('height', height)
                    .attr('rx', 2);
            })
            .on('end', brushed);

        svg.append('g')
            .attr('class', 'brush-area')
            .call(brush)
            .raise();
    }

    function brushed(event) {
        let brushSelection = event.selection;
        //if the selection is null then the user has clicked off the brush so don't do anything
        if (!brushSelection || brushSelection[0] == brushSelection[1]) {
            //ensure we return back the whole genome
            selectionCallback({start: 0, end: genomeSize});
            return;
        }

        //selection will be in the pixel space so need to convert it to the base pair space
        let start = x.invert(brushSelection[0]);
        let end = x.invert(brushSelection[1]);

        //send the rounded start and end to the callback to the nearest whole number
        start = Math.round(start);
        end = Math.round(end);

        if (selection && (start == selection.start && end == selection.end)) {
            return;
        }

        if (selectionCallback) {
            selectionCallback({start, end});
        }
    }

    function _getStartEndForRange(start, end, range) {
        let st = start;
        let en = end;

        if ((start < range[0] && end <= range[0]) || (start >= range[1] && end > range[1])) {
            return null;
        } 

        if (start < range[0]) {
            st = range[0];
        }

        if (end > range[1]) {
            en = range[1];
        }

        return {start: st, end: en};
    }

    function _determineGeneType(gene, genesOfInterest, phenRelatedGenes) {
        let type = 'normal';
        if (genesOfInterest && genesOfInterest.length > 0) {
            for (let geneOfInterest of genesOfInterest) {
                if (gene.gene_symbol == geneOfInterest.gene_symbol) {
                    type = 'geneOfInterest';
                    return type;
                }
            }
        }
        
        if (phenRelatedGenes && phenRelatedGenes.length > 0) {
            for (let phenRelatedGene of phenRelatedGenes) {
                if (gene.gene_symbol == phenRelatedGene.gene_symbol) {
                    type = 'phenRelatedGene';
                    return type;
                }
            }
        }

        return type;
    }

    function _createGene(xMap, idMap, gene, range, geneType, isLessThanOneChr) {
        let chr = idMap.chr;
        let start = idMap.start;
        let end = idMap.end;

        let startX = xMap.startX;
        let endX = xMap.endX;
        let geneGroup;

        let isWholeGenome = range[0] == 0 && range[1] == genomeSize;

        if (geneType == 'geneOfInterest') {
            //Genes of interest
            geneGroup = svg.append('g')
                .attr('class', 'gene-group-geneofinterest')
                .data([gene])
                .attr('id', `poi-${chr}-${start}-${end}-group`);

            geneGroup.append('rect')
                .attr('x', 0)
                .attr('class', 'gene-rect')
                .attr('width', function() {
                    if (endX - startX < 1) {
                        return 1;
                    }
                    return endX - startX;
                })
                .attr('height', 4)
                .attr('fill', 'red')
                .attr('rx', function() {
                    if (endX - startX < 3) {
                        return 0;
                    }
                    return 1; 
                });

            let measureSvg = d3.create('svg');
            parentElement.appendChild(measureSvg.node());
            
            let measureText = measureSvg.append('text')
                .attr('x', 0)
                .attr('y', 5)
                .text(gene.gene_symbol)
                .attr('font-size', `${10}` + "px");
            
            let mTextWidth = measureText.node().getBBox().width;
            measureSvg.remove();

            //add the labels
            let text = geneGroup.append('text')
                .attr('class', 'gene-label')
                .attr('x', 0)
                .attr('y', 5)
                .text(gene.gene_symbol)
                .attr('font-size', "10px")
                .attr('fill', 'red');

            text.attr('transform', `translate(-${mTextWidth}, 0)`);

            return geneGroup;
        } else if (geneType == 'phenRelatedGene') {
            //Phen related genes
            geneGroup = svg.append('g')
                .attr('class', 'gene-group-phenrelated')
                .data([gene])
                .attr('id', `poi-${chr}-${start}-${end}-group`);

            geneGroup.append('rect')
                .attr('x', 0)
                .attr('class', 'gene-rect')
                .attr('width', function() {
                    if (endX - startX < 1) {
                        return 1;
                    }
                    return endX - startX;
                })
                .attr('height', 4)
                .attr('fill', 'blue')
                attr('rx', function() {
                    if (endX - startX < 3) {
                        return 0;
                    }
                    return 1; 
                });

            //we dont show labels for these at the global level
            if (!isWholeGenome) {
                let measureSvg = d3.create('svg');
                parentElement.appendChild(measureSvg.node());
                
                let measureText = measureSvg.append('text')
                    .attr('x', 0)
                    .attr('y', 5)
                    .text(gene.gene_symbol)
                    .attr('font-size', `${10}` + "px");
                
                let mTextWidth = measureText.node().getBBox().width;
                measureSvg.remove();

                //add the labels
                let text = geneGroup.append('text')
                    .attr('class', 'gene-label')
                    .attr('x', 0)
                    .attr('y', 5)
                    .text(gene.gene_symbol)
                    .attr('font-size', "10px")
                    .attr('fill', 'blue')
                    .attr('rx', 1);

                text.attr('transform', `translate(-${mTextWidth}, 0)`);
            }

            return geneGroup;
        } else {
            //All normal genes
            geneGroup = svg.append('g')
                .attr('class', 'gene-group')
                .data([gene])
                .attr('id', `poi-${chr}-${start}-${end}-group`)
                .on('click', function(event, d) {
                    console.log('clicked on gene', d);
                });

            geneGroup.append('rect')
                .attr('x', 0)
                .attr('class', 'gene-rect')
                .attr('width', function() {
                    if (endX - startX < 1) {
                        return 1;
                    }
                    return endX - startX;
                })
                .attr('height', 4)
                .attr('fill', 'black')
                .attr('rx', function() {
                    if (endX - startX < 3) {
                        return 0;
                    }
                    return 1; 
                });

            if (isLessThanOneChr) {
                //the font needs to be scaled based on the size of the zoomed section inversely proportional to the size of the zoomed section
                let zoomedSize = range[1] - range[0];
                // Ensure zoomedSize is at least 1 to avoid taking the logarithm of 0 or a negative number.
                if (zoomedSize < 1) zoomedSize = 1;

                let bpGenomeSize = originZoom.size;
                let normalized_window = Math.log(zoomedSize) / Math.log(bpGenomeSize);

                let baseFontSize = 20;
                let scaledFontSize = baseFontSize * (1 - normalized_window);
                let minFontSize = 8;
                scaledFontSize = Math.max(scaledFontSize, minFontSize);

                let measureSvg = d3.create('svg');
                parentElement.appendChild(measureSvg.node());
                
                let measureText = measureSvg.append('text')
                    .attr('x', 0)
                    .attr('y', 4)
                    .text(gene.gene_symbol)
                    .attr('font-size', `${scaledFontSize}` + "px");
                
                let mTextWidth = measureText.node().getBBox().width;
                measureSvg.remove();

                //add the labels
                let text = geneGroup.append('text')
                    .attr('class', 'gene-label')
                    .attr('x', 0)
                    .attr('y', 4)
                    .text(gene.gene_symbol)
                    .attr('font-size', `${scaledFontSize}` + "px")
                    .attr('fill', 'black');

                text.attr('transform', `translate(-${mTextWidth + 1}, 0)`);
            }  
            return geneGroup;
        }
    }

    return svg.node();
}
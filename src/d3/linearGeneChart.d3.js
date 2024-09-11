import * as d3 from 'd3';

export default function linearGeneChart(parentElement, refChromosomes, data, options=null) {
    let width = parentElement.clientWidth;
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

    const margin = {top: 5, right: 10, bottom: 5, left: 10};

    const svg = d3.create('svg')
        .attr('viewBox', [0, 0, width, height])
        .attr('class', 'linear-gene-chart-d3')
        .attr('width', width, height);

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
        .range([margin.left, width - margin.right]);

    _renderGenes([zoomedSelection.start, zoomedSelection.end])

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
        //grab all the point-group groups and remove them before rendering the new ones
        svg.selectAll('.point-group').remove();

        //========== WHOLE GENOME LEVEL ==========//
        if (range[0] == 0 && range[1] == genomeSize) {
            if (phenRelatedGenes && phenRelatedGenes.length > 0) {
                _renderPhenRelatedGenes(phenRelatedGenes, chromosomeMap, range, svg, genesOfInterest);
            }
            //If there are genes of interest then we want to render them
            if (genesOfInterest && genesOfInterest.length > 0) {
                _renderGenesOfInterest(genesOfInterest, chromosomeMap, range, svg);
            }

            //if there are no genes of interest or phen related genes then we want to just put a text that says "Zoom in to see genes"
            if ((!phenRelatedGenes || phenRelatedGenes.length == 0) && (!genesOfInterest || genesOfInterest.length == 0)) {
                svg.append('text')
                    .attr('x', width/2 - 80)
                    .attr('y', height/2)
                    .text('Select an area to view genes')
                    .attr('font-size', '15px')
                    .attr('fill', '#2A65B7')
                    .attr('font-style', 'italic');
            }
            return;
        } 

        //========== ZOOMED LEVEL ==========//
        let localGenes = JSON.parse(JSON.stringify(genes));
        //Remove the phen related genes and genes of interest from the localGenes
        if (genesOfInterest && genesOfInterest.length > 0) {
            for (let gene of genesOfInterest) {
                delete localGenes[gene.gene_symbol];
            }
        }
        if (phenRelatedGenes && phenRelatedGenes.length > 0) {
            for (let gene of phenRelatedGenes) {
                delete localGenes[gene.gene_symbol];
            }
        }

        let tracMap = {
            2: false,
        };

        let genesMap = {};
        //iterate over the genes
        for (let gene of Object.values(localGenes)) {
            //get the chromosome and position
            let chr = gene.chr.replace('chr', '');
            
            let start = gene.start;
            let end = gene.end;

            //get the corresponding chromosome from the accumulated map
            let chromosome = chromosomeMap.get(chr);
            if (!chromosome) {
                continue;
            }
            let absoluteStart = chromosome.start + start;
            let absoluteEnd = chromosome.start + end;

            let startUpdated = absoluteStart;
            let endUpdated = absoluteEnd;

            let startX = null; //no sense in setting these yet
            let endX = null;

            //check and see if the gene is in the zoomed selection
            let newStartEnd = _getStartEndForRange(absoluteStart, absoluteEnd, range);

            if (!newStartEnd) {
                //if we get nothing back we dont render this gene at all
                continue;
            } else {
                //we will either get back the truncated start/ends or the original start/ends depending on if the gene is in the range
                startUpdated = newStartEnd.start;
                endUpdated = newStartEnd.end;

                startX = x(startUpdated);
                endX = x(endUpdated);
            }

            //add the gene to the map with the absolute start and end as the key "absoluteStart-absoluteEnd"
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

                let geneGroup = _createNormalGene(xMap, idMap, gene, range);

                let currentTrac = 1; 
                let length = Object.keys(tracMap).length + 1;
                let trackRange = Array.from({ length }, (_, i) => i + 1);

                for (let x of trackRange) {
                    if (tracMap[x] != false && (startX > tracMap[x])) {
                        tracMap[x] = endX;
                        currentTrac = x;
                        break;
                    } else if (tracMap[x] != false && (startX < tracMap[x])) {
                        continue;
                    }

                    if (tracMap[x] == false) {
                        tracMap[x] = endX;
                        currentTrac = x;
                        break;
                    }
                }

                let translateY = (currentTrac - 1) * 8;

                if (translateY >= height) {
                    height += 8;
                    svg.attr('viewBox', [0, 0, width, height])
                        .attr('width', width, height);
                }

                geneGroup.attr('transform', `translate(${startX - margin.left}, ${translateY + 30})`);

                svg.append(() => geneGroup.node()); //append the gene group to the svg
            } else {
                //dont render the gene if it already exists
                genesMap[`${absoluteStart}-${absoluteEnd}`].push(gene);
            }
        }
    
        //========== AFTER NORMAL GENES WHEN ZOOMED RENDER OTHERS ==========//
        if (phenRelatedGenes && phenRelatedGenes.length > 0) {
            _renderPhenRelatedGenes(phenRelatedGenes, chromosomeMap, range, svg, genesOfInterest);
        }
        if (genesOfInterest && genesOfInterest.length > 0) {
            _renderGenesOfInterest(genesOfInterest, chromosomeMap, range, svg);
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

    function _renderPhenRelatedGenes(genes, chromosomeMap, range, svg, genesOfInterest=null) {
        //Remove all the point-group-phenrelated groups before rendering the new ones
        svg.selectAll('.point-group-phenrelated').remove();
        
        let tracMap = {
            1: false,
        };

        let genesMap = {};

        //iterate over the genes
        for (let gene of Object.values(genes)) {
            //get the chromosome and position
            let chr = gene.chr.replace('chr', '');
            
            let start = gene.start;
            let end = gene.end;

            //get the corresponding chromosome from the accumulated map
            let chromosome = chromosomeMap.get(chr);
            if (!chromosome) {
                continue;
            }
            let absoluteStart = chromosome.start + start;
            let absoluteEnd = chromosome.start + end;

            let startUpdated = absoluteStart;
            let endUpdated = absoluteEnd;

            let startX = null; //no sense in setting these yet
            let endX = null;

            //check and see if the point of interest is in the zoomed selection
            let newStartEnd = _getStartEndForRange(absoluteStart, absoluteEnd, range);
            
            if (!newStartEnd) {
                //if we get nothing back we dont render this point of interest at all
                continue;
            } else {
                //we will either get back the truncated start/ends or the original start/ends depending on if the point of interest is in the range
                startUpdated = newStartEnd.start;
                endUpdated = newStartEnd.end;

                startX = x(startUpdated);
                endX = x(endUpdated);
            }

            //add the point of interest to the map with the absolute start and end as the key "absoluteStart-absoluteEnd"
            if (!genesMap[`${absoluteStart}-${absoluteEnd}`]) {
                genesMap[`${absoluteStart}-${absoluteEnd}`] = [gene];

                //create a new group for this point of interest
                let pointGroup = svg.append('g')
                    .attr('transform', `translate(${startX - margin.left}, 30)`)
                    .attr('class', 'point-group-phenrelated')
                    .attr('id', `poi-${chr}-${start}-${end}-group`);

                let currentTrac = 0;

                let length = Object.keys(tracMap).length + 1;
                let trackRange = Array.from({ length }, (_, i) => i + 1);
                for (let x of trackRange) {
                    if (tracMap[x] && (startX > tracMap[x])) {
                        tracMap[x] = endX;
                        currentTrac = x;
                        break;
                    } else if (tracMap[x] && (startX < tracMap[x])) {
                        continue;
                    }

                    if (!tracMap[x]) {
                        tracMap[x] = endX;
                        currentTrac = x;
                        break;
                    }
                }

                let translateY = (currentTrac - 1) * 8;
                //If the translate Y is > height we need to increase the height by (8px)
                if (translateY > height) {
                    height += 8;
                    svg.attr('viewBox', [0, 0, width, height])
                        .attr('width', width, height);
                }

                pointGroup.append('rect')
                    .attr('x', 0 + margin.left)
                    .attr('width', function() {
                        //if the block is too small to see make it 2 pixels wide
                        if (endX - startX < 1) {
                            return 1;
                        }
                        return endX - startX;
                    })
                    .attr('transform', `translate(0, ${translateY})`)
                    .attr('height', 2)
                    .attr('fill', 'blue')
                    .attr('fill-opacity', 0.75);
                
                //we dont show labels for these at the global level
                if (range[0] !== 0 && range[1] !== genomeSize) {
                    //add a rectangle that is the width of the text
                    let textWidth = (gene.gene_symbol.length * 5) + 1;

                    let rect = pointGroup.append('rect')
                        .attr('x', 0 + margin.left)
                        .attr('width', textWidth)
                        .attr('height', 8)
                        .attr('fill', 'white')
                        .attr('fill-opacity', 0.85);

                    //add the labels
                    let text = pointGroup.append('text')
                        .attr('x', 0 + margin.left)
                        .attr('y', 4)
                        .text(gene.gene_symbol)
                        .attr('font-size', "8px")
                        .attr('fill', 'blue');

                    text.attr('transform', `translate(-${textWidth}, ${translateY})`);
                    rect.attr('transform', `translate(-${textWidth}, ${translateY - 4})`);
                }


            } else {
                //dont render the point of interest if it already exists
                genesMap[`${absoluteStart}-${absoluteEnd}`].push(gene);
            }
        }
    }

    function _renderGenesOfInterest(genes, chromosomeMap, range, svg) {
        //Remove all the point-group-geneofinterest groups before rendering the new ones
        svg.selectAll('.point-group-geneofinterest').remove();

        let tracMap = {
            1: false,
        };

        let genesMap = {};

        //iterate over the genes
        for (let gene of Object.values(genes)) {
            if (!gene || !gene.chr || !gene.start || !gene.end) {
                continue;
            }

            //get the chromosome and position
            let chr = gene.chr.replace('chr', '');
            
            let start = gene.start;
            let end = gene.end;

            //get the corresponding chromosome from the accumulated map
            let chromosome = chromosomeMap.get(chr);
            if (!chromosome) {
                continue;
            }
            let absoluteStart = chromosome.start + start;
            let absoluteEnd = chromosome.start + end;

            let startUpdated = absoluteStart;
            let endUpdated = absoluteEnd;

            let startX = null; //no sense in setting these yet
            let endX = null;

            //check and see if the point of interest is in the zoomed selection
            let newStartEnd = _getStartEndForRange(absoluteStart, absoluteEnd, range);

            if (!newStartEnd) {
                //if we get nothing back we dont render this point of interest at all
                continue;
            } else {
                //we will either get back the truncated start/ends or the original start/ends depending on if the point of interest is in the range
                startUpdated = newStartEnd.start;
                endUpdated = newStartEnd.end;

                startX = x(startUpdated);
                endX = x(endUpdated);
            }

            //add the point of interest to the map with the absolute start and end as the key "absoluteStart-absoluteEnd"
            if (!genesMap[`${absoluteStart}-${absoluteEnd}`]) {
                genesMap[`${absoluteStart}-${absoluteEnd}`] = [gene];

                //create a new group for this point of interest
                let pointGroup = svg.append('g')
                    .attr('transform', `translate(${startX - margin.left}, 30)`)
                    .attr('class', 'point-group-geneofinterest')
                    .attr('id', `poi-${chr}-${start}-${end}-group`);

                let currentTrac = 0;

                let length = Object.keys(tracMap).length + 1;
                let trackRange = Array.from({ length }, (_, i) => i + 1);

                for (let x of trackRange) {
                    if (tracMap[x] && (startX > tracMap[x])) {
                        tracMap[x] = endX;
                        currentTrac = x;
                        break;
                    } else if (tracMap[x] && (startX < tracMap[x])) {
                        continue;
                    }

                    if (!tracMap[x]) {
                        tracMap[x] = endX;
                        currentTrac = x;
                        break;
                    }
                }

                let translateY = (currentTrac - 1) * 8;

                //TODO: This is never happening. Need to figure out why
                if ((translateY + 10) >= height) {
                    height += 9;
                    svg.attr('viewBox', [0, 0, width, height])
                        .attr('width', width, height);
                }

                pointGroup.append('rect')
                    .attr('x', 0 + margin.left)
                    .attr('width', function() {
                        //if the block is too small to see make it 2 pixels wide
                        if (endX - startX < 1) {
                            return 1;
                        }
                        return endX - startX;
                    })
                    .attr('transform', `translate(0, ${translateY})`)
                    .attr('height', 2)
                    .attr('fill', 'red');
                
                let textWidth = (gene.gene_symbol.length * 5) + 1;

                //add the labels
                let text = pointGroup.append('text')
                    .attr('x', 0 + margin.left)
                    .attr('y', 4)
                    .text(gene.gene_symbol)
                    .attr('font-size', "8px")
                    .attr('fill', 'red')
                    .attr('transform', `translate(-${textWidth}, ${translateY})`);

            } else {
                //dont render the point of interest if it already exists
                genesMap[`${absoluteStart}-${absoluteEnd}`].push(gene);
            }
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

    function _createNormalGene(xMap, idMap, gene, range) {
        let chr = idMap.chr;
        let start = idMap.start;
        let end = idMap.end;

        let startX = xMap.startX;
        let endX = xMap.endX;

        //create a new group for this gene
        let geneGroup = svg.append('g')
            // .attr('transform', `translate(${startX - margin.left}, 30)`)
            .attr('class', 'point-group')
            .attr('id', `poi-${chr}-${start}-${end}-group`);

        geneGroup.append('rect')
            .attr('x', 0 + margin.left)
            .attr('class', 'gene-rect')
            .attr('width', function() {
                //if the block is too small to see make it 2 pixels wide
                if (endX - startX < 1) {
                    return 1;
                }
                return endX - startX;
            })
            .attr('height', 2)
            .attr('fill', 'black');

        if (range[1] - range[0] < chromosomeMap.get('1').end) {
            //the font needs to be scaled based on the size of the zoomed section inversely proportional to the size of the zoomed section
            let zoomedSize = range[1] - range[0];
            // Ensure zoomedSize is at least 1 to avoid taking the logarithm of 0 or a negative number.
            if (zoomedSize < 1) zoomedSize = 1;

            let bpGenomeSize = originZoom.size;
            let normalized_window = Math.log(zoomedSize) / Math.log(bpGenomeSize);

            let baseFontSize = 20;
            let scaledFontSize = baseFontSize * (1 - normalized_window);

            let measureSvg = d3.create('svg');
            parentElement.appendChild(measureSvg.node());
            
            let measureText = measureSvg.append('text')
                .attr('x', 0 + margin.left)
                .attr('y', 2)
                .text(gene.gene_symbol)
                .attr('font-size', `${scaledFontSize}` + "px");
            
            let mTextWidth = measureText.node().getBBox().width;
            measureSvg.remove();

            //add the labels
            let text = geneGroup.append('text')
                .attr('x', 0 + margin.left)
                .attr('y', 2)
                .text(gene.gene_symbol)
                .attr('font-size', `${scaledFontSize}` + "px")
                .attr('fill', 'black');

            text.attr('transform', `translate(-${mTextWidth + 1}, 0)`);
        }

        return geneGroup;
    }
    
    return svg.node();
}
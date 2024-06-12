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
    }

    const margin = {top: 5, right: 10, bottom: 5, left: 10};

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
        .range([margin.left, width - margin.right]);

    let xAxis = g => g
        .attr('transform', `translate(0, ${height - margin.bottom - 20})`)
        .call(d3.axisBottom(x)
            .ticks(width / 80)
            .tickSizeOuter(0)
            .tickFormat(d => `${d / 1000000}Mb`));

    svg.append('g')
        .call(xAxis);

    _renderChromosomes([zoomedSelection.start, zoomedSelection.end]); //function that renders the actual chromosome sections of the chart
    _renderGenes([zoomedSelection.start, zoomedSelection.end])

    function _genChromosomeAccumulatedMap(chromosomeList){
        /**
         * This function takes a list of chromosomes and generates a map of the chromosomes with their absolute start and end positions
         *
         * returns Object {chromosomeMap, genomeSize}
         */

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

    function _renderChromosomes(range) {

        for (let [chr, chromosome] of chromosomeMap) {
            //Chromosome start and end
            let chromosomeStart = chromosome.start;
            let chromStartUpdated = chromosomeStart;
            let chromosomeEnd = chromosome.end;
            let chromEndUpdated = chromosomeEnd;

            //check and see if the chromosome is in the zoomed selection
            let newStartEnd = _getStartEndForRange(chromosomeStart, chromosomeEnd, range);

            if (!newStartEnd) {
                //if we get nothing back we dont render this chromosome at all
                continue;
            } else {
                //we will either get back the truncated start/ends or the original start/ends depending on if the chromosome is in the range
                chromStartUpdated = newStartEnd.start;
                chromEndUpdated = newStartEnd.end;
            }

            //create a new group for this chromosome
            let chromosomeGroup = svg.append('g')
                .attr('transform', `translate(${x(chromStartUpdated)}, 0)`)
                .attr('class', 'chromosome-group')
                .attr('id', `chr-${chr}-group`);

            let chromosomeColor = d3.interpolate('#1F68C1', '#A63D40')(chromosomeEnd / genomeSize);
                
            //add the chromosome bar
            chromosomeGroup.append('rect')
                .attr('x', 0)
                .attr('width', x(chromEndUpdated) - x(chromStartUpdated))
                .attr('height', '20px')
                .attr('fill', 'white')
                .attr('stroke', chromosomeColor)
                .attr('stroke-opacity', 0.3)
                .attr('rx', '3px');

            //add the labels
            chromosomeGroup.append('text')
                .attr('x', (x(chromEndUpdated) - x(chromStartUpdated) - 6)/2)
                //if the label is two characters long, move it over a bit so it's centered
                .attr('transform', function() {
                    if (chr.length == 2) {
                        return `translate(${-4}, 0)`;
                    }
                })
                .attr('y', margin.top + 10)
                .text(chr)
                .attr('font-size', "14px")
                .attr('fill', chromosomeColor);
        };
    }

    function _renderGenes(range) {
        let localGenes = {...genes};
        //TODO: I think I can borrow a more dynamic way of rendering this from my side project
        let tracMap = {
            1: false,
            2: false,
            3: false,
            4: false,
            5: false,
            6: false,
        };

        let genesMap = {};
        //if the range is the whole genome then we dont need to render the genes
        if (range[0] == 0 && range[1] == genomeSize) {
            if (phenRelatedGenes && phenRelatedGenes.length > 0) {
                _renderPhenRelatedGenes(phenRelatedGenes, chromosomeMap, range, svg);
            }
            //If there are genes of interest then we want to render them
            if (genesOfInterest && genesOfInterest.length > 0) {
                _renderGenesOfInterest(genesOfInterest, chromosomeMap, range, svg);
            }
            return;
        }

        //otherwise we still render the genes of interest and phen related genes but we also remove that gene from our typical genes
        if (phenRelatedGenes && phenRelatedGenes.length > 0) {
            _renderPhenRelatedGenes(phenRelatedGenes, chromosomeMap, range, svg);
            for (let gene of phenRelatedGenes) {
                delete localGenes[gene.gene_symbol];
            }
        }
        if (genesOfInterest && genesOfInterest.length > 0) {
            _renderGenesOfInterest(genesOfInterest, chromosomeMap, range, svg);
            for (let gene of genesOfInterest) {
                delete localGenes[gene.gene_symbol];
            }
        }

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
                    .attr('class', 'point-group')
                    .attr('id', `poi-${chr}-${start}-${end}-group`);

                let currentTrac = 0;

                for (let x of Object.keys(tracMap)) {
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
                    .attr('height', 3)
                    .attr('fill', 'black');

                if (range[1] - range[0] < chromosomeMap.get('1').end) {
                    //text width
                    let textWidth = gene.gene_symbol.length * 6;

                    //add a white background for the text
                    pointGroup.append('rect')
                        .attr('x', 0 + margin.left - 3)
                        .attr('y', 0)
                        .attr('width', `${textWidth}px`)
                        .attr('transform', `translate(0, ${translateY})`)
                        .attr('height', 8)
                        .attr('fill', 'white')
                        .attr('fill-opacity', 0.75);
                    //add the labels
                    pointGroup.append('text')
                        .attr('x', 0 + margin.left)
                        .attr('y', 4)
                        .text(gene.gene_symbol)
                        .attr('font-size', "8px")
                        .attr('fill', 'black')
                        .attr('transform', `translate(0, ${translateY})`);
                }

            } else {
                //dont render the point of interest if it already exists
                genesMap[`${absoluteStart}-${absoluteEnd}`].push(gene);
            }
        }
    }

    //render brush later so it's on top
    if (brush) {
        //if there is a selection then we want to brush to that selection
        if (selection) {
            let start = selection.start;
            let end = selection.end;

            //selection will be in the base pair space so need to convert it to the pixel space
            let startPixel = x(start);
            let endPixel = x(end);
            
            let brush = d3.brushX()
                .extent([[0, 0], [width, height]])
                .on('end', brushed);

            //this is the acutal brushable area
            svg.append('g')
                .attr('class', 'brush-area')
                .call(brush)
                .raise();
            
            //set the brush to the selection but dont fire the callback
            svg.select('.brush-area').call(brush.move, [startPixel, endPixel]);

            //get the selection and setits styles
            let brushRec = svg.select('.brush-area').select('.selection');
            brushRec.attr('fill', 'grey')
                .attr('fill-opacity', 0.2)
                .attr('stroke', 'white');
        } else {
            let brush = d3.brushX()
                .extent([[0, 0], [width, height]])
                .on('end', brushed);

            svg.append('g')
                .attr('class', 'brush-area')
                .call(brush)
                .raise();
        }
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

    function _renderPhenRelatedGenes(genes, chromosomeMap, range, svg) {
        //TODO: I think I can borrow a more dynamic way of rendering this from my side project
        let tracMap = {
            1: false,
            2: false,
            3: false,
            4: false,
            5: false,
            6: false,
            7: false,
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
                    .attr('class', 'point-group')
                    .attr('id', `poi-${chr}-${start}-${end}-group`);

                let currentTrac = 0;

                for (let x of Object.keys(tracMap)) {
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
                    .attr('height', 3)
                    .attr('fill', 'blue');
                
                //we dont show labels for these at the global level
                
                if (range[0] !== 0 && range[1] !== genomeSize) {
                    //text width
                    let textWidth = gene.gene_symbol.length * 6;
                    //add a white background for the text
                    pointGroup.append('rect')
                        .attr('x', margin.left - 3)
                        .attr('y', 0)
                        .attr('width', `${textWidth}px`)
                        .attr('transform', `translate(0, ${translateY})`)
                        .attr('height', 8)
                        .attr('fill', 'white')
                        .attr('fill-opacity', 0.75);
                    //add the labels
                    pointGroup.append('text')
                        .attr('x', 0 + margin.left)
                        .attr('y', 4)
                        .text(gene.gene_symbol)
                        .attr('font-size', "8px")
                        .attr('fill', 'blue')
                        .attr('transform', `translate(0, ${translateY})`);
                }


            } else {
                //dont render the point of interest if it already exists
                genesMap[`${absoluteStart}-${absoluteEnd}`].push(gene);
            }
        }
    }

    function _renderGenesOfInterest(genes, chromosomeMap, range, svg) {
        //TODO: I think I can borrow a more dynamic way of rendering this from my side project
        let tracMap = {
            1: false,
            2: false,
            3: false,
            4: false,
            5: false,
            6: false,
            7: false,
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
                    .attr('class', 'point-group')
                    .attr('id', `poi-${chr}-${start}-${end}-group`);

                let currentTrac = 0;

                for (let x of Object.keys(tracMap)) {
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
                    .attr('height', 3)
                    .attr('fill', 'red');
                
                //Text width
                let textWidth = gene.gene_symbol.length * 6;
                //add a white background for the text
                pointGroup.append('rect')
                    .attr('x', 0 + margin.left)
                    .attr('y', 0)
                    .attr('width', `${textWidth}px`)
                    .attr('transform', `translate(0, ${translateY})`)
                    .attr('height', 8)
                    .attr('fill', 'white')
                    .attr('fill-opacity', 0.75);
                //add the labels
                pointGroup.append('text')
                    .attr('x', 0)
                    .attr('y', 4)
                    .text(gene.gene_symbol)
                    .attr('font-size', "8px")
                    .attr('fill', 'red')
                    .attr('transform', `translate(0, ${translateY})`);

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
    
    return svg.node();
}
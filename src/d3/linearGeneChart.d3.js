import * as d3 from 'd3';
import * as beHelper from '../dataHelpers/dataHelpers.js';

export default function linearGeneChart(parentElement, refChromosomes, data, options=null) {
    let width = parentElement.clientWidth;
    const parHeight = parentElement.clientHeight;

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
    let hideNormalGenes = true;

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

    //if there are not genes of interest or phen related genes then we want to show all the genes
    if (!genesOfInterest && !phenRelatedGenes) {
        hideNormalGenes = false;
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

    //Put a message at the top of the chart 'Click and drag to select a region'
    svg.append('text')
        .attr('x', '60px')
        .attr('y', 10)
        .attr('text-anchor', 'start')
        .attr('font-size', '13px')
        .attr('font-weight', '100')
        .attr('font-style', 'italic')
        .text('Click and drag to select a region')
        .attr('fill', 'gray');

    const margin = {top: 5, right: 10, bottom: 5, left: 10};

    let x = d3.scaleLinear()
        .domain([zoomedSelection.start, zoomedSelection.end])
        .range([margin.left, width - margin.right]);

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
        d3.select('.show-hide-toggle').remove();
        d3.select('.global-gene-tip').remove();
        
        height = parHeight;
        svg.attr('viewBox', [0, 0, width, height])
            .attr('height', height + 3);

        let isWholeGenome = range[0] == 0 && range[1] == genomeSize;
        let isLessThanOneChr = range[1] - range[0] <= chromosomeMap.get('1').end;
        let hasPhenGenes = phenRelatedGenes && phenRelatedGenes.length > 0;
        let hasGOIGenes = genesOfInterest && genesOfInterest.length > 0;

        //if we are rendering the whole genome and don't have any GOI or phenRelatedGenes, return early
        if (isWholeGenome && (!hasPhenGenes) && (!hasGOIGenes)) {
            svg.append('text')
                .attr('x', width/2 - 100)
                .attr('y', height/2)
                .text('Select an area to view genes')
                .attr('font-size', '15px')
                .attr('fill', '#2A65B7')
                .attr('font-style', 'italic');
            return;
            
            //If we are whole genome but we have one of the two then we just want to note that only genes of interest or phenotype related genes are being shown
        } else if (isWholeGenome) {
            d3.select('.linear-gene-chart-wrapper')
                .append('div')
                .attr('class', 'global-gene-tip')
                .attr('position', 'absolute')
                .text(function() {
                    if (genesOfInterest && genesOfInterest.length > 0 && (!hasPhenGenes)) {
                        return `Showing only GOI`;
                    } else if (phenRelatedGenes && phenRelatedGenes.length > 0 && (!hasGOIGenes)) {
                        return `Showing only phenotype related genes`;
                    } else {
                        return `Showing GOI and phenotype related genes`;
                    }
                
                });
        }

        let localGenes = JSON.parse(JSON.stringify(genes));

        let tracMap = {
            1: false,
        };

        let genesMap = {};
        let normalGenesCount = 0;
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

                //if the gene type is normal then we want to increment the normal genes count to use later
                if (geneType == 'normal') {
                    normalGenesCount += 1;
                }

                if (hideNormalGenes && geneType == 'normal') {
                    continue;
                }
            }

            //add the gene to the map if it doesn't exist
            if (!genesMap[`${absoluteStart}-${absoluteEnd}`]) {
                genesMap[`${absoluteStart}-${absoluteEnd}`] = [gene];

                let idMap = {
                    'start': start,
                    'end': end,
                    'chr': chr
                };

                //convert the new start and end to relative to chromosome
                startUpdated = startUpdated - chromosome.start;
                endUpdated = endUpdated - chromosome.start;

                let xMap = {
                    'startX': startX,
                    'endX': endX,
                    'startUpdated': startUpdated,
                    'endUpdated': endUpdated
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

                let translateY = (currentTrac - 1) * 18;

                if (translateY >= height) {
                    height += 18;
                    svg.attr('viewBox', [0, 0, width, height + 50])
                        .attr('height', height + 50);
                }

                geneGroup.attr('transform', `translate(${startX}, ${translateY + 25})`);

                svg.append(() => geneGroup.node()); //append the gene group to the svg
            } else {
                //dont render the gene if it already exists
                genesMap[`${absoluteStart}-${absoluteEnd}`].push(gene);
            }
        }

        //if genes map is empty and we aren't the full genome then we want to display a message that says 'No genes in this region'
        if (Object.keys(genesMap).length == 0 && !isWholeGenome && normalGenesCount == 0) {
            svg.append('text')
                .attr('x', width/2 - 80)
                .attr('y', height/2)
                .text('No genes in this region')
                .attr('font-size', '16px')
                .attr('fill', '#A3A3A3')
                .attr('font-style', 'italic')
                .attr('font-weight', '100');
        } else if (normalGenesCount > 0 && !isWholeGenome && (hasGOIGenes || hasPhenGenes)) {
            d3.select('.linear-gene-chart-wrapper') 
                .append('div')
                .attr('class', 'show-hide-toggle')
                .attr('position', 'absolute')
                .text(function() {
                    if (hideNormalGenes == true) {
                        return `Show ${normalGenesCount} other genes`;
                    } else {
                        return `Hide ${normalGenesCount} other genes`;
                    }
                })
                .on('click', function(event) {
                    if (hideNormalGenes) {
                        hideNormalGenes = false;
                        _renderGenes([zoomedSelection.start, zoomedSelection.end]);
                    } else {
                        hideNormalGenes = true;
                        _renderGenes([zoomedSelection.start, zoomedSelection.end]);
                    }
                });
        }
    }

    //render brush later so it's on top
    if (brush) {
        let brush = d3.brushX()
            .extent([[5, 0], [width, 20]])
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

        let bs0 = brushSelection[0];
        let bs1 = brushSelection[1];

        //selection will be in the pixel space so need to convert it to the base pair space
        let start = x.invert(bs0);
        let end = x.invert(bs1);

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
        let startUpdated = xMap.startUpdated;
        let endUpdated = xMap.endUpdated;
        let geneGroup;

        let isWholeGenome = range[0] == 0 && range[1] == genomeSize;

        if (geneType == 'geneOfInterest') {
            //Genes of interest
            geneGroup = svg.append('g')
                .attr('class', 'gene-group-geneofinterest')
                .data([gene])
                .attr('id', `poi-${chr}-${start}-${end}-group`)
                .style('cursor', 'pointer')
                .on('click', function(event, d) {
                    console.log('clicked on gene', d);
                });

            geneGroup.append('rect')
                .attr('x', 0)
                .attr('y', -7)
                .attr('class', 'gene-rect')
                .attr('width', function() {
                    if (endX - startX < 1) {
                        return 1;
                    }
                    return endX - startX;
                })
                .attr('height', 14)
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

            let options = {
                geneType: geneType,
                range: range,
                xMap: xMap,
            }

            if (isLessThanOneChr == true) {
                //Don't render the transcript diagram if the window is more than one chromosome
                _createGeneDiagram(gene, geneGroup, options);
            }
            
            return geneGroup;
        } else if (geneType == 'phenRelatedGene') {
            //Phen related genes
            geneGroup = svg.append('g')
                .attr('class', 'gene-group-phenrelated')
                .data([gene])
                .attr('id', `poi-${chr}-${start}-${end}-group`)
                .style('cursor', 'pointer')
                .on('click', function(event, d) {
                    console.log('clicked on gene', d);
                });

            geneGroup.append('rect')
                .attr('x', 0)
                .attr('y', -7)
                .attr('class', 'gene-rect')
                .attr('width', function() {
                    if (endX - startX < 1) {
                        return 1;
                    }
                    return endX - startX;
                })
                .attr('height', 14)
                .attr('fill', 'blue')
                .attr('rx', function() {
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

            let options = {
                geneType: geneType,
                range: range,
                xMap: xMap,
            }

            if (isLessThanOneChr == true) {
                //Don't render the transcript diagram if the window is more than one chromosome
                _createGeneDiagram(gene, geneGroup, options);
            }

            return geneGroup;
        } else {
            //All normal genes
            geneGroup = svg.append('g')
                .attr('class', 'gene-group')
                .data([gene])
                .attr('id', `poi-${chr}-${start}-${end}-group`)
                .style('cursor', 'pointer')
                .on('click', function(event, d) {
                    console.log('clicked on gene', d);
                    _createGeneDiagram(gene, geneGroup);
                });

            geneGroup.append('rect')
                .attr('x', 0)
                .attr('y', -7)
                .attr('class', 'gene-rect')
                .attr('width', function() {
                    if (endX - startX < 1) {
                        return 1;
                    }
                    return endX - startX;
                })
                .attr('height', 14)
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
                let minFontSize = 9;
                scaledFontSize = Math.max(scaledFontSize, minFontSize);

                let measureSvg = d3.create('svg');
                parentElement.appendChild(measureSvg.node());
                
                let measureText = measureSvg.append('text')
                    .attr('x', 0)
                    .attr('y', (scaledFontSize / 2))
                    .text(gene.gene_symbol)
                    .attr('font-size', `${scaledFontSize}` + "px");
                
                let mTextWidth = measureText.node().getBBox().width;
                measureSvg.remove();

                //add the labels
                let text = geneGroup.append('text')
                    .attr('class', 'gene-label')
                    .attr('x', 0)
                    .attr('y', (scaledFontSize / 2))
                    .text(gene.gene_symbol)
                    .attr('font-size', `${scaledFontSize}` + "px")
                    .attr('fill', 'black');

                //if the text is going to go off the screen then don't move it to the left
                //Shift down by 1/2 the track height
                if (startX - mTextWidth < 0) {
                    text.attr('transform', `translate( 0, 7)`);
                } else {
                    text.attr('transform', `translate(-${mTextWidth + 1}, 0)`);
                }
            }  

            let options = {
                range: range,
                xMap: xMap,
            }

            if (isLessThanOneChr == true) {
                //Don't render the transcript diagram if the window is more than one chromosome
                _createGeneDiagram(gene, geneGroup, options);
            }

            return geneGroup;
        }
    }

    function _createGeneDiagram(gene, geneGroup, options=null) {
        let geneType = null;
        let xMap = null;
        let range = null;
        let startUpdated = null;
        let endUpdated = null;

        if (options) {
            if (options.geneType) {
                geneType = options.geneType;
            }
            if (options.range) {
                range = options.range;
            }
            if (options.xMap) {
                xMap = options.xMap;
                startUpdated = xMap.startUpdated;
                endUpdated = xMap.endUpdated;
            }
        }

        //if the gene has been truncated we need the new start and end b

        //get the mane transcript using the beHelper it is async though
        beHelper.getTranscriptsForGenes([gene.gene_name])
        .then(data => {
            let strand = data[gene.gene_name].strand;
            let transcript_type = data[gene.gene_name].transcript_type;
            let geneRectangle = geneGroup.select('.gene-rect');
            let rectX = 0;
            let rectY = 7;
            let geneHeight = geneRectangle.attr('height');
            let geneWidth = geneRectangle.attr('width');

            //we will need a new x scale for the transcript based on the gene width
            let x = d3.scaleLinear()
                .domain([startUpdated, endUpdated])
                .range([0, geneWidth]);
            
            let transcript_id = data[gene.gene_name].transcript_id;

            //The transcript is the group that will hold the transcript diagram and it will be put in the same position as the gene rectangle
            const transcript = geneGroup.append('g')
                .data([data[gene.gene_name]])
                .attr('class', 'transcript')
                .attr("id", 'transcript_' +  transcript_id.split(".").join("_"))
                .attr('transform', `translate(${rectX}, ${rectY})`);

            //The line that will be the reference line
            transcript.selectAll(".reference").remove();
            transcript.append('line')
                .attr('class', 'reference')
                .attr('x1', 0)
                .attr('x2', geneWidth)
                .attr('y1', -geneHeight/2)
                .attr('y2', -geneHeight/2)
                .attr('stroke', function() {
                    if (geneType == 'geneOfInterest') {
                        return 'red';
                    } else if (geneType == 'phenRelatedGene') {
                        return 'blue';
                    } else {
                        return 'black';
                    }
                })
                .style("pointer-events", "none");

            //The arrow that will show the strand direction
            //TODO: make this actually work
            transcript.selectAll(".arrow").remove();
            transcript.selectAll('.arrow')
                .append('path')
                .attr('class', 'arrow')
                .attr('d', d3.symbol().type(d3.symbolTriangle).size(10))
                .attr('transform', function() {
                    if(strand == '+') return 'translate(' + geneWidth + ',' + geneHeight/2 + ') rotate(0)';
                    else return 'translate(0,' + geneHeight/2 + ') rotate(180)';
                });

            function filterFeature(feature, transcript_type) {
                if ( transcript_type == 'protein_coding'
                    || transcript_type == 'mRNA'
                    || transcript_type == 'transcript'
                    || transcript_type == 'primary_transcript') {
                    return feature.feature_type.toLowerCase() == 'utr' || feature.feature_type.toLowerCase() == 'cds';
                } else {
                    return feature.feature_type.toLowerCase() == 'exon';
                }
            }

            function featureClass(d,i) {
                return d.feature_type.toLowerCase();
            }

            function featureGlyph(d,i) {
            };        
        
            transcript.selectAll('.transcript rect.utr, .transcript rect.cds, .transcript rect.exon')
                .data(function(d) {
                    return d['features'].filter( function(d) {
                        return filterFeature(d, transcript_type);
                        }, function(d) {
                            return d.feature_type + "-" + d.seq_id + "-" + d.start + "-" + d.end;
                });
            }).enter().append('rect')
                .attr('class', function(d,i) {
                    return featureClass(d,i);
                })
                .attr("modelName", function(d) { return d.seq_id; })
                .attr('rx', .5)
                .attr('ry', .5)
                .attr('fill', function(d) {
                    if (geneType == 'geneOfInterest') {
                        return 'red';
                    } else if (geneType == 'phenRelatedGene') {
                        return 'blue';
                    } else {
                        return 'black';
                    }
                })
                .attr('stroke', function(d) {
                    if (geneType == 'geneOfInterest') {
                        return 'red';
                    }
                    else if (geneType == 'phenRelatedGene') {
                        return 'blue';
                    }
                    else {
                        return 'black';
                    }
                })
                .attr('stroke-width', 0.5)
                .attr('fill-opacity', 0.5)
                .attr('x', function(d) { return Math.round(x(d.start))})
                .attr('width', function(d) { return Math.max(0.5, Math.round(x(d.end) - x(d.start)))})
                .attr('y', function(d) {
                    if(d.feature_type.toLowerCase() =='utr') return -(geneHeight/2 + geneHeight/4);
                    else if(d.feature_type.toLowerCase() =='cds') return -(geneHeight/2 + geneHeight/3);
                    else return -geneHeight;
                })
                .attr('height', function(d) {
                    if(d.feature_type.toLowerCase() =='utr') return geneHeight/2;
                    else if(d.feature_type.toLowerCase() =='cds') return geneHeight/1.5;
                    else return geneHeight; 
                })
        
                .attr("pointer-events", "all")
                .style("cursor", "pointer");
        
            // Add any feature glyphs
            transcript.selectAll(".feature_glyph").remove();
            transcript.selectAll('.transcript rect.utr, .transcript rect.cds, .transcript rect.exon').data(function(d) {
                return d['features'].filter( function(d) {
                return filterFeature(d, transcript_type);
                }, function(d) {
                return d.feature_type + "-" + d.seq_id + "-" + d.start + "-" + d.end;
                });
            })
            .each(function(d,i) {
                var me = this;
                var featureX = Math.round(x(d.start));
                featureGlyph.call(me, d, i, featureX);
            });
        
        
            // Update class
            transcript.selectAll('.transcript rect.utr, .transcript rect.cds, .transcript rect.exon').data(function(d) {
                return d['features'].filter( function(d) {
                return filterFeature(d, transcript_type);
                }, function(d) {
                return d.feature_type + "-" + d.seq_id + "-" + d.start + "-" + d.end;
                });
            })
            .attr('class', function(d,i) {
                    return featureClass(d,i);
            });

            // Remove the gene rectangle
            geneGroup.select('.gene-rect').remove();
        })
        .catch(error => {
            //if we cant get the transcript that is okay we will have a gene rectangle
        });
    }

    return svg.node();
}
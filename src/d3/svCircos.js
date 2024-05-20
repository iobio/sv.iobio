import * as d3 from 'd3';

export default function svCircos(parentTag, refChromosomes, data=null, options=null) {

    //Reference Variables (chromosomes)
    let chromosomes = refChromosomes;
    let centromeres = null;
    let bands = null;
    let genes = null;
    let genesOfInterest = null;
    let parent1Data = null;
    let parent2Data = null;
    let altCallerData = null;

    //Zoom Variables
    let zoomedCallback = null;
    let zoomZone = null;
    let zoomedSection = null;

    let { chromosomeAccumulatedMap, bpGenomeSize } = _genChromosomeAccumulatedMap(chromosomes);
    
    let originZoom = {
        start: 0,
        end: bpGenomeSize,
        size: bpGenomeSize
    };
    //if there are options try to get the centromere data from the options
    if (options) {
        if (options.centromeres) {
            centromeres = options.centromeres;

            //add the centromeres to the chromosomes
            for (let centromere of centromeres) {
                let chrom = centromere.chr.replace('chr', '');
                let start = centromere.start;
                let end = centromere.end;
                let bp = end - start;
                let chromIndex = chromosomes.findIndex(x => x.chr === chrom);

                if (chromIndex !== -1) { // Ensure the chromosome was found
                    chromosomes[chromIndex].centromere = {start: start, end: end, bp: bp};
                }
            }
        }
        if (options.bands){
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
        if (options.zoomCallback) {
            zoomedCallback = options.zoomCallback;
        }
        if (options.zoomZone) {
            zoomZone = options.zoomZone;

            let zoomStart = zoomZone.start;
            let zoomEnd = zoomZone.end;
            let zoomSize = zoomEnd - zoomStart;

            zoomedSection = {
                start: zoomStart,
                end: zoomEnd,
                size: zoomSize
            };
        } else {
            zoomedSection = originZoom;
        }

        //the focused variant will take precedence over the zoom zone so we will do this after the zoom zone
        if (options.focusedVariant) {
            let focusedVariant = options.focusedVariant;

            let chrom = focusedVariant.chromosome;
            let chromStart = chromosomeAccumulatedMap.get(chrom).start;
            let varStartAbs = focusedVariant.start + chromStart;
            let varEndAbs = focusedVariant.end + chromStart;
            let varSize = varEndAbs - varStartAbs;
            let halfSize = varSize / 2;

            let focusedStart = varStartAbs - halfSize;
            let focusedEnd = varEndAbs + halfSize;
            let focusedSize = focusedEnd - focusedStart;

            zoomedSection = {
                start: focusedStart,
                end: focusedEnd,
                size: focusedSize
            };

            //call the zoomed callback
            zoomedCallback(zoomedSection);
        }

        //if there are genes in the options then set the genes
        if (options.genes) {
            genes = options.genes;

            //we only want to make a list of genes of interest if there are genes on the chart to begin with
            if (options.genesOfInterest && options.genesOfInterest.length > 0) {
                //lookup each gene name from genes and add it to a list
                genesOfInterest = options.genesOfInterest;
            }
        }

        //if we have a parent1
        if (options.parent1Data) {
            parent1Data = options.parent1Data
        }
        //if we have a parent2
        if (options.parent2Data) {
            parent2Data = options.parent2Data
        }
        //if we have an altCaller
        if (options.altCallerData) {
            altCallerData = options.altCallerData
        }



    }

    _setBaseStyles();
    let svData = data;

    const container = d3.select(parentTag);

    // width and height of the container will be the width and height of the svg
    let width = container.node().clientWidth;
    let height = container.node().clientHeight;

    const svg = d3.create('svg')
        .attr('viewBox', [0, 0, width, height])
        .attr('class', 'svCircos-d3')
        .attr('width', width)
        .attr('height', height);

    const maxRadius = (Math.min(width, height) / 2) - 45;

    const center = {
        x: width / 2,
        y: height / 2
    };
    
    let startAngleRad = 5 * Math.PI / 180;
    let endAngleRad = 355 * Math.PI / 180;

    //track lables will go in the missing 10 degrees they will be inserted at the appropriate radius starting at 357 degrees
    let trackLabelStart = 355 * Math.PI / 180;
    let trackLabelEnd = 5 * Math.PI / 180;
    
    // Change the range to radians (0 to 2π)
    let angleScale = d3.scaleLinear()
        .domain([zoomedSection.start, zoomedSection.end])
        .range([startAngleRad, endAngleRad]);

    //process centromeres to put them into the correct chromosomes and format
    centromeres.forEach(centromere => {
        let chrom = centromere.chr;
        let start = centromere.start;
        let end = centromere.end;
        let bp = end - start;
        let chromIndex = chromosomes.findIndex(x => x.name === chrom);

        if (chromIndex !== -1) { // Ensure the chromosome was found
            chromosomes[chromIndex].centromere = {start: start, end: end, bp: bp};
        }
    });

    //make a group for the circle and the dna.svg
    let zoomOutButtonGroup = svg.append('g')
        .attr('cursor', 'pointer')
        .on('click', function (event, d) {
            //we will reset the zoomed section to the origin zoom eventually
            zoomedSection = originZoom;
            //call the zoomed callback
            zoomedCallback(zoomedSection);

            //reset the charts angle scale
            angleScale = d3.scaleLinear()
                .domain([zoomedSection.start, zoomedSection.end])
                .range([startAngleRad, endAngleRad]);

            //get selected-chromosome and remove it if
            let selected = d3.select('.selected-chromosome');
            if (selected) {
                selected.classed('selected-chromosome', false);
            }

            //clear all the tracks and render the new tracks
            _renderProbTrack([zoomedSection.start, zoomedSection.end], svData);

            if (parent1Data) {
                _renderPar1Track([zoomedSection.start, zoomedSection.end], parent1Data);
            }

            if (parent2Data) {
                _renderPar2Track([zoomedSection.start, zoomedSection.end], parent2Data);
            }

            if (altCallerData) {
                _renderAltCallsTrack([zoomedSection.start, zoomedSection.end], altCallerData);
            } 

            //clear all the chromosomes and render the new chromosomes
            svg.selectAll('.chromosome').remove();
            //clear all the chromosome labels
            svg.selectAll('.chromosome-label').remove();
            _renderChromosomes([zoomedSection.start, zoomedSection.end], chromosomes);

            _renderGenesTrack(genes, chromosomeAccumulatedMap, angleScale, maxRadius, svg, [zoomedSection.start, zoomedSection.end]);

            //also reset the image to the dna.svg
            zoomOutButtonGroup.select('image')
                .attr('xlink:href', '/dna.svg')
                .attr('x', width - (width - 70) - 10)
                .attr('y', height - (height - 70) - 10)
                .attr('width', 20)
                .attr('height', 20);
        });

    //Upper left side of the circle will be that button
    zoomOutButtonGroup.append('circle')
        .attr('cx', width - (width - 70))
        .attr('cy', height - (height - 70))
        .attr('r', 15)
        .attr('fill', '#1F68C1');
    
    if (zoomedSection.size !== bpGenomeSize) {
        //get our centerSymbolGroup and change the symbol to our magnify-out.svg
        zoomOutButtonGroup.append('image')
        .attr('xlink:href', '/magnify-out.svg')
        .attr('x', width - (width - 70) - 10)
        .attr('y', height - (height - 70) - 10)
        .attr('width', 20)
        .attr('height', 20);
    } else {
        //on top of this circle we will render the dna.svg that we have /dna.svg
        zoomOutButtonGroup.append('image')
            .attr('xlink:href', '/dna.svg')
            .attr('x', width - (width - 70) -10)
            .attr('y', height - (height - 70) -10)
            .attr('width', 20)
            .attr('height', 20);
    }

    //iterate over the chromosomes and create the arcs
    let startColor = '#1F68C1'
    let endColor = '#A63D40'

    //TODO: If we were able to specify options on the track such as minRadius, maxRadius, color, background (on/off), label etc we could make this more dynamic and have one function
    _renderChromosomes([zoomedSection.start, zoomedSection.end], chromosomes);
    _renderProbTrack([zoomedSection.start, zoomedSection.end], svData);
    if (parent1Data) {
        _renderPar1Track([zoomedSection.start, zoomedSection.end], parent1Data);
    }

    if (parent2Data) {
        _renderPar2Track([zoomedSection.start, zoomedSection.end], parent2Data);
    }
    if (altCallerData) {
        _renderAltCallsTrack([zoomedSection.start, zoomedSection.end], altCallerData);
    }  
    if (genes) {
        _renderGenesTrack(genes, chromosomeAccumulatedMap, angleScale, maxRadius, svg, [zoomedSection.start, zoomedSection.end]);
    }

    //add the label "chromosome" starting at the trackLabelStart
    let chromosomeLabelAngle = (trackLabelStart - ((360 * Math.PI/180) - trackLabelEnd)) - (Math.PI / 2); // -90 degrees to rotate the text because the text is horizontal and the arc is vertical
    let chromosomeLabelRadius = maxRadius * 1;

    let chromosomeLabelX = (center.x) + ((chromosomeLabelRadius) * Math.cos(chromosomeLabelAngle));
    let chromosomeLabelY = (center.y) + ((chromosomeLabelRadius) * Math.sin(chromosomeLabelAngle));

    svg.append('text')
        .attr('x', chromosomeLabelX)
        .attr('y', chromosomeLabelY)
        .attr('fill', 'black')
        .attr('text-anchor', 'middle')
        .attr('font-weight', 'bold')
        .attr('alignment-baseline', 'middle')
        .text('Chrom')
        .attr('font-size', '9px')
        .raise();

    //same for the genes at their respective radius
    let geneLabelAngle = (trackLabelStart - ((360 * Math.PI/180) - trackLabelEnd)) - (Math.PI / 2); // -90 degrees to rotate the text because the text is horizontal and the arc is vertical
    let geneLabelRadius = maxRadius * .92;

    let geneLabelX = (center.x) + ((geneLabelRadius) * Math.cos(geneLabelAngle));
    let geneLabelY = (center.y) + ((geneLabelRadius) * Math.sin(geneLabelAngle));

    svg.append('text')
        .attr('x', geneLabelX)
        .attr('y', geneLabelY)
        .attr('fill', 'black')
        .attr('text-anchor', 'middle')
        .attr('font-weight', 'bold')
        .attr('alignment-baseline', 'middle')
        .text('Genes')
        .attr('font-size', '9px')
        .raise();

    //same for the proband at .84
    let probandLabelAngle = (trackLabelStart - ((360 * Math.PI/180) - trackLabelEnd)) - (Math.PI / 2); // -90 degrees to rotate the text because the text is horizontal and the arc is vertical
    let probandLabelRadius = maxRadius * .84;

    let probandLabelX = (center.x) + ((probandLabelRadius) * Math.cos(probandLabelAngle));
    let probandLabelY = (center.y) + ((probandLabelRadius) * Math.sin(probandLabelAngle));

    svg.append('text')
        .attr('x', probandLabelX)
        .attr('y', probandLabelY)
        .attr('fill', 'black')
        .attr('text-anchor', 'middle')
        .attr('font-weight', 'bold')
        .attr('alignment-baseline', 'middle')
        .text('ProbVar')
        .attr('font-size', '9px')
        .raise();

    //same for the other at .76
    let otherLabelAngle = (trackLabelStart - ((360 * Math.PI/180) - trackLabelEnd)) - (Math.PI / 2); // -90 degrees to rotate the text because the text is horizontal and the arc is vertical
    let otherLabelRadius = maxRadius * .76;

    let otherLabelX = (center.x) + ((otherLabelRadius) * Math.cos(otherLabelAngle));
    let otherLabelY = (center.y) + ((otherLabelRadius) * Math.sin(otherLabelAngle));

    svg.append('text')
        .attr('x', otherLabelX)
        .attr('y', otherLabelY)
        .attr('fill', 'black')
        .attr('text-anchor', 'middle')
        .attr('font-weight', 'bold')
        .attr('alignment-baseline', 'middle')
        .text('Par1Var')
        .attr('font-size', '9px')
        .raise();

    //same for other2 at .68
    let other2LabelAngle = (trackLabelStart - ((360 * Math.PI/180) - trackLabelEnd)) - (Math.PI / 2); // -90 degrees to rotate the text because the text is horizontal and the arc is vertical
    let other2LabelRadius = maxRadius * .68;

    let other2LabelX = (center.x) + ((other2LabelRadius) * Math.cos(other2LabelAngle));
    let other2LabelY = (center.y) + ((other2LabelRadius) * Math.sin(other2LabelAngle));

    svg.append('text')
        .attr('x', other2LabelX)
        .attr('y', other2LabelY)
        .attr('fill', 'black')
        .attr('text-anchor', 'middle')
        .attr('font-weight', 'bold')
        .attr('alignment-baseline', 'middle')
        .text('Par2Var')
        .attr('font-size', '9px')
        .raise();

    if (altCallerData) {
        //same for altCaller at .60
        let altCallerLabelAngle = (trackLabelStart - ((360 * Math.PI/180) - trackLabelEnd)) - (Math.PI / 2); // -90 degrees to rotate the text because the text is horizontal and the arc is vertical
        let altCallerLabelRadius = maxRadius * .60;

        let altCallerLabelX = (center.x) + ((altCallerLabelRadius) * Math.cos(altCallerLabelAngle));
        let altCallerLabelY = (center.y) + ((altCallerLabelRadius) * Math.sin(altCallerLabelAngle));

        svg.append('text')
            .attr('x', altCallerLabelX)
            .attr('y', altCallerLabelY)
            .attr('fill', 'black')
            .attr('text-anchor', 'middle')
            .attr('font-weight', 'bold')
            .attr('alignment-baseline', 'middle')
            .text('AltCaller')
            .attr('font-size', '9px')
            .raise();
    }

//HELPER FUNCTIONS
    function _setBaseStyles() {
        //anything with a .selected-chromosome will be green
        let style = document.createElement('style');
        style.innerHTML = '.selected-chromosome {fill: green;}';
        document.getElementsByTagName('head')[0].appendChild(style);
    }

    function _genChromosomeAccumulatedMap(chromosomeList){
        //iterate over the chromosomes and create the arcs
        let accumulatedBP = 0;

        let chromosomeAccumulatedMap = new Map();

        for (let chromosome of chromosomeList) {
            let chromStart = accumulatedBP;

            accumulatedBP += chromosome.length;

            let chromEnd = accumulatedBP;
            chromosomeAccumulatedMap.set(chromosome.chr, {start: chromStart, end: chromEnd});
        }

        let bpGenomeSize = accumulatedBP;

        return {chromosomeAccumulatedMap, bpGenomeSize};
    }

    function _renderChromosomes(range, chromosomeList) {
        //grab chromosomes, centromeres, and chromosome-labels and remove them
        svg.selectAll('.chromosome').remove();
        svg.selectAll('.centromere').remove();
        svg.selectAll('.chromosome-label').remove();
        svg.selectAll('.chromosome-background').remove();
        svg.selectAll('.chromosome-band').remove();

        for (let chromosome of chromosomeList) {
            let chromosomeName = chromosome.chr;
            let chrom = chromosomeAccumulatedMap.get(chromosomeName)

            let chromStart = chrom.start;
            let chromStartUpdated = chrom.start;//these are for updates if the chromosome is not in the range we keep the originals for context
            let chromEnd = chrom.end;
            let chromEndUpdated = chrom.end;

            //Centromere start and end
            let centromere = chromosome.centromere;
            let centAbStart = chromStart + centromere.start;
            let centAbEnd = chromStart + centromere.end;

            //Use getStartEndForRange to get the start and end of the chromosome if it is in range at all
            let newStartEnd = _getStartEndForRange(chromStart, chromEnd, range); //needs to be the absolute start/end of the item (chromosome, variant, etc) to compare to the range

            if (!newStartEnd) {
                //dont render this chromosome at all
                continue;
            } else {
                chromStartUpdated = newStartEnd.start;
                chromEndUpdated = newStartEnd.end;
            }

            let startAngle = angleScale(chromStartUpdated)
            let endAngle = angleScale(chromEndUpdated);

            //Calulate the color based on the start color and end color and the percentage of the genome that the chromosome represents
            let percentage = chromEnd / bpGenomeSize;
            let color = d3.interpolate(startColor, endColor)(percentage);

            //Make sure the centromere is in the range
            let newCentStartEnd = _getStartEndForRange(centAbStart, centAbEnd, range);
            let centromereStartAngle = 0;
            let centromereEndAngle = 0;
            let centromereCenterAngle = 0;

            if (!newCentStartEnd) {
                //dont render this centromere at all
                centromere = null;
            } else {
                centromereStartAngle = angleScale(newCentStartEnd.start);
                centromereCenterAngle = angleScale((newCentStartEnd.start + newCentStartEnd.end) / 2);
                centromereEndAngle = angleScale(newCentStartEnd.end);
            }

            //create a group for each chromosome and the label
            const g = svg.append('g');

            let arcDrag = d3.drag()
                .on('start', function (event, d) {
                    //if we are directly over a chromosome-label then we dont want to drag we want to allow the event to go to the chromosome-label
                    //We need this because the brushable area is on top so it will take precedence
                    if (event.sourceEvent.target.classList.contains('chromosome-label')) {
                        return;
                    }

                    //get the angle of the event based on the center
                    let x = event.x - center.x;
                    let y = event.y - center.y;
                    let startAngle = Math.atan2(y, x) + Math.PI/2;

                    //append an arc with the same inner and outer radius as the chromosome section starting at the angle of the event call it arc brush
                    let arcBrush = d3.arc()
                        .innerRadius(maxRadius * 0.96)
                        .outerRadius(maxRadius * 1.085)
                        .startAngle(startAngle)
                        .endAngle(startAngle)
                        .padAngle(0)
                        .cornerRadius(0);
                    //selecte the brush group and append the arc brush
                    let brushGroup = d3.select('.brush-group');

                    brushGroup.append('path')
                        .datum({startAngle: startAngle, endAngle: endAngle})
                        .attr('d', arcBrush)
                        .attr('transform', `translate(${width / 2}, ${height / 2})`)
                        .attr('fill', 'grey')
                        .attr('fill-opacity', 0.7)
                        .attr('stroke', 'white')
                        .attr('stroke-width', 1)
                        .attr('class', 'arc-brush')
                        .raise();
                })
                .on('drag', function (event, d) {
                    //grab the arc-brush and update the end angle based on the event
                    let arcBrush = svg.select('.arc-brush');
                    let x = event.x - center.x;
                    let y = event.y - center.y;
                    let newAngle = Math.atan2(y, x) + Math.PI/2;

                    // Redefine the arc with the updated endAngle
                    arcBrush.attr('d', d3.arc()
                        .innerRadius(maxRadius * 0.96)
                        .outerRadius(maxRadius * 1.085)
                        .startAngle(arcBrush.datum().startAngle)
                        .endAngle(newAngle)
                        .padAngle(0)
                        .cornerRadius(0));
                })
                .on('end', function (event, d) {
                    //get the start and end of the brush arc so that we can zoom in on that section
                    let arcBrush = svg.select('.arc-brush');

                    if (!arcBrush || arcBrush.empty()) {
                        return //This ends up getting called when we click to zoom on a chromosome so just make sure it isnt empty
                    }

                    let startAngle = arcBrush.datum().startAngle;

                    //get the angle of the event based on the center
                    let x = event.x - center.x;
                    let y = event.y - center.y;
                    let endAngle = Math.atan2(y, x) + Math.PI/2;

                    //atan2 has some odd behavior that returns the angle in negative radians in the 4th quadrent if this is the case we need to convert them
                    if (endAngle < 0) {
                        endAngle += 2 * Math.PI;
                    }
                    if (startAngle < 0) {
                        startAngle += 2 * Math.PI;
                    }

                    //if the start and end angles are the same then we dont want to zoom in at all just remove the brush
                    if (startAngle === endAngle) {
                        d3.select('.arc-brush').remove();
                        return;
                    }

                    //get the start and end of the brush arc in bp
                    let startBP = angleScale.invert(startAngle);
                    startBP = Math.round(startBP);
                    let endBP = angleScale.invert(endAngle);
                    endBP = Math.round(endBP);

                    if (endBP < startBP) {
                        //swap them because we assume the user brushed the opposite way
                        let temp = startBP
                        startBP = endBP
                        endBP = temp
                    }

                    zoomedSection = {
                        start: startBP,
                        end: endBP,
                        size: endBP - startBP
                    };

                    //Send the zoomed section outside of the chart
                    zoomedCallback(zoomedSection);

                    //reset the charts angle scale
                    angleScale = d3.scaleLinear()
                        .domain([zoomedSection.start, zoomedSection.end])
                        .range([startAngleRad, endAngleRad]);

                    //clear all the chromosomes and render the new chromosomes
                    svg.selectAll('.chromosome').remove();
                    //clear all the chromosome labels
                    svg.selectAll('.chromosome-label').remove();
                    _renderChromosomes([zoomedSection.start, zoomedSection.end], chromosomeList);

                    //clear all the tracks and render the new tracks
                    svg.selectAll('line').remove();
                    _renderProbTrack([zoomedSection.start, zoomedSection.end], svData);
                    if (parent1Data) {
                        _renderPar1Track([zoomedSection.start, zoomedSection.end], parent1Data);
                    }
        
                    if (parent2Data) {
                        _renderPar2Track([zoomedSection.start, zoomedSection.end], parent2Data);
                    }
                    if (altCallerData) {
                        _renderAltCallsTrack([zoomedSection.start, zoomedSection.end], altCallerData);
                    } 

                    _renderGenesTrack(genes, chromosomeAccumulatedMap, angleScale, maxRadius, svg, [zoomedSection.start, zoomedSection.end]);

                    //get our centerSymbolGroup and change the symbol to our magnify-out.svg
                    zoomOutButtonGroup.select('image')
                        .attr('xlink:href', '/magnify-out.svg')
                        .attr('x', width - (width - 70) - 10)
                        .attr('y', height - (height - 70) - 10)
                        .attr('width', 20)
                        .attr('height', 20);

                    //remove the brush
                    d3.select('.arc-brush').remove();
                });

            g.call(arcDrag);

            //create a group for both parts of the chromosomes
            const chromosomeGroup = g.append('g')
                .attr('class', 'chromosome')
                .on('mouseover', function (event, d) {
                    //Had done a grow but it is somewhat odd so removed it for now
                    //make the cursor crosshair like it is brushable
                    d3.select(this).style('cursor', 'crosshair');
                })
                .on('mouseout', function (event, d) {
                    //make the cursor the default
                    d3.select(this).style('cursor', 'default');
                });

            //P and Q arms of the chromosome
            if (centromere) {
                const arcP = d3.arc()
                    .innerRadius(maxRadius * 0.96)
                    .outerRadius(maxRadius)
                    .startAngle(startAngle)
                    .endAngle(centromereCenterAngle)
                    .padAngle(0)
                    .padRadius(2)
                    .cornerRadius(function(d, i) {
                        return 9;
                    });

                const arcQ = d3.arc()
                    .innerRadius(maxRadius * 0.96)
                    .outerRadius(maxRadius)
                    .startAngle(centromereCenterAngle)
                    .endAngle(endAngle)
                    .padAngle(0)
                    .padRadius(2)
                    .cornerRadius(function(d, i) {
                        return 9;
                    });

                chromosomeGroup.append('path')
                    .datum({startAngle: startAngle, endAngle: centromereEndAngle})
                    .attr('d', arcP)
                    .attr('transform', `translate(${width / 2}, ${height / 2})`)
                    .attr('fill', 'white')
                    .attr('stroke', color)
                    .attr('stroke-width', 1)
                    .attr('class', 'chromosome-p');
                
                chromosomeGroup.append('path')
                    .datum({startAngle: centromereEndAngle, endAngle: endAngle})
                    .attr('d', arcQ)
                    .attr('transform', `translate(${width / 2}, ${height / 2})`)
                    .attr('fill', 'white')
                    .attr('stroke', color)
                    .attr('stroke-width', 1)
                    .attr('class', 'chromosome-q');
                
                //create an arc for the centromere itself
                const centromereArc = d3.arc()
                    .innerRadius(function(d, i) {
                        //if we are zoomed all the way out then make the centromere a little smaller
                        if (zoomedSection.size === bpGenomeSize) {
                            return maxRadius * 0.969;
                        }
                        return maxRadius * 0.96;
                    })
                    .outerRadius(function(d, i) {
                        if (zoomedSection.size === bpGenomeSize) {
                            return maxRadius * 0.99;
                        }
                        return maxRadius;
                    })
                    .startAngle(centromereStartAngle)
                    .endAngle(centromereEndAngle)
                    .padAngle(0)
                    .cornerRadius(0);

                chromosomeGroup.append('path')
                    .datum({startAngle: centromereStartAngle, endAngle: centromereEndAngle})
                    .attr('d', centromereArc)
                    .attr('transform', `translate(${width / 2}, ${height / 2})`)
                    .attr('fill', color)
                    .attr('stroke', color)
                    .attr('opacity', 0.5)
                    .attr('stroke-width', 1)
                    .attr('class', 'centromere');
            } else {
                //if there is no centromere it means that the range includes something smaller than a chromosome and that range does not have a centromere in it
                //We render only the section
                const subSectionArc = d3.arc()
                    .innerRadius(maxRadius * 0.96)
                    .outerRadius(maxRadius)
                    .startAngle(startAngle)
                    .endAngle(endAngle)
                    .padAngle(0)
                    .padRadius(2)
                    .cornerRadius(function(d, i) {
                        return 9;
                    });

                chromosomeGroup.append('path')
                    .datum({startAngle: startAngle, endAngle: endAngle})
                    .attr('d', subSectionArc)
                    .attr('transform', `translate(${width / 2}, ${height / 2})`)
                    .attr('fill', 'white')
                    .attr('stroke', color)
                    .attr('stroke-width', 1)
                    .attr('class', 'chromosome-p');
            }

            if (bands){
                //if the band isn't in the chromosome we are looking at then skip it
                let bandsInChrom = bands.filter(x => x.chr === chromosomeName);

                let bandIterator = 0;
                for (let band of bandsInChrom) {
                    //Get the band absolute start and end positions
                    let bandAbsStart = chromStart + band.start;
                    let bandAbsEnd = chromStart + band.end;

                    //check now if the band is in the range
                    let newBandStartEnd = _getStartEndForRange(bandAbsStart, bandAbsEnd, range);

                    if (!newBandStartEnd) {
                        //dont render this band at all
                        continue;
                    } else {
                        bandAbsStart = newBandStartEnd.start;
                        bandAbsEnd = newBandStartEnd.end;
                    }

                    let bandStartAngle = angleScale(bandAbsStart);
                    let bandEndAngle = angleScale(bandAbsEnd);

                    //opacity will be set by the gieStain numbers which are after gpos in the gieStain field
                    let gieStainOpacity = band.gieStain.replace('gpos', '')/100;

                    let bandArc = d3.arc()
                        .innerRadius(maxRadius * 0.965)
                        .outerRadius(maxRadius * 0.995)
                        .startAngle(bandStartAngle)
                        .endAngle(bandEndAngle)
                        .padAngle(0)
                        .cornerRadius(0);

                    chromosomeGroup.append('path')
                        .datum({startAngle: bandStartAngle, endAngle: bandEndAngle})
                        .attr('d', bandArc)
                        .attr('transform', `translate(${width / 2}, ${height / 2})`)
                        .attr('fill', color)
                        .attr('class', 'chromosome-band')
                        .attr('opacity', gieStainOpacity);

                    if (zoomedSection.size <= chromosomeAccumulatedMap.get('1').end) {
                        //The bands have a label that gives position commonly in the format of p12.3 or q12.3
                        let bandLabel = band.name;
                        //the band label will be placed in the middle of the band based on the band's position
                        let bandLabelAngle = ((bandStartAngle + bandEndAngle) / 2) - Math.PI / 2; // -90 degrees to rotate the text because the text is horizontal and the arc is vertical
                        let bandLabelRadius = maxRadius *1.04;
                        let bandLabelX = (center.x) + ((bandLabelRadius) * Math.cos(bandLabelAngle));
                        let bandLabelY = (center.y) + ((bandLabelRadius) * Math.sin(bandLabelAngle));
                        
                        let labelFontSize = 9;

                        //label for the band
                        let label = g.append('text')
                            .attr('x', bandLabelX)
                            .attr('y', bandLabelY)
                            .attr('class', 'chromosome-label')
                            .attr('fill', color)
                            .attr('font-weight', 'bold')
                            .attr('text-anchor', 'middle')
                            .attr('alignment-baseline', 'middle')
                            .text(bandLabel)
                            .attr('font-size', `${labelFontSize}px`)
                            .style('pointer-events', 'none');
                    }
                }
            }

            //create an arc from the start to the end of the chromosome
            let lineArc = d3.arc()
                .innerRadius(maxRadius * 1.08)
                .outerRadius(maxRadius * .98)
                .startAngle(startAngle)
                .endAngle(endAngle)
                .padAngle(0)
                .cornerRadius(0);
            
            chromosomeGroup.append('path')
                .datum({startAngle: startAngle, endAngle: endAngle})
                .attr('d', lineArc)
                .attr('transform', `translate(${width / 2}, ${height / 2})`)
                .attr('fill', color)
                .attr('fill-opacity', 0.1)
                .attr('stroke', color)
                .attr('stroke-width', 1)
                .attr('class', 'chromosome-background')
                .lower();

            let textStartAngle = angleScale(chromStartUpdated) - Math.PI / 2; //text is horizontal so we need to rotate it 90 degrees
            let isSmallerSection = Math.min(width, height) <= 700;

            const textAngle = textStartAngle; 
            const textRadius = maxRadius * 1.07;
            const textX = (center.x) + ((textRadius) * Math.cos(textAngle));
            const textY = (center.y) + ((textRadius) * Math.sin(textAngle));

            //put a small white circle behind the text to make it more readable
            g.append('circle')
                .attr('cx', textX)
                .attr('cy', textY)
                .attr('r', 10)
                .attr('transform', `translate(0, -1)`)
                .attr('fill', 'white')
                .attr('class', 'chromosome-label')
                .attr('fill-opacity', 1)
                .style('cursor', 'pointer')
                .on('click', function (event, d) {
                    let start = chromStart;
                    let end = chromEnd;
                    let chromSize = end - start;

                    zoomedSection = {
                        start: start,
                        end: end,
                        size: chromSize
                    };

                    //Send the zoomed section outside of the chart
                    zoomedCallback(zoomedSection);

                    //reset the charts angle scale
                    angleScale = d3.scaleLinear()
                        .domain([zoomedSection.start, zoomedSection.end])
                        .range([startAngleRad, endAngleRad]);

                    //clear all the chromosomes and render the new chromosomes
                    svg.selectAll('.chromosome').remove();
                    //clear all the chromosome labels
                    svg.selectAll('.chromosome-label').remove();
                    _renderChromosomes([zoomedSection.start, zoomedSection.end], chromosomeList);

                    //get the event target and set class list to selected-chromosome
                    let target = event.target;
                    target.classList.add('selected-chromosome');

                    //clear all the tracks and render the new tracks
                    svg.selectAll('line').remove();
                    _renderProbTrack([zoomedSection.start, zoomedSection.end], svData);
                    if (parent1Data) {
                        _renderPar1Track([zoomedSection.start, zoomedSection.end], parent1Data);
                    }
        
                    if (parent2Data) {
                        _renderPar2Track([zoomedSection.start, zoomedSection.end], parent2Data);
                    }
                    if (altCallerData) {
                        _renderAltCallsTrack([zoomedSection.start, zoomedSection.end], altCallerData);
                    } 

                    _renderGenesTrack(genes, chromosomeAccumulatedMap, angleScale, maxRadius, svg, [zoomedSection.start, zoomedSection.end]);

                    //get our centerSymbolGroup and change the symbol to our magnify-out.svg
                    zoomOutButtonGroup.select('image')
                        .attr('xlink:href', '/magnify-out.svg')
                        .attr('x', width - (width - 70) - 10)
                        .attr('y', height - (height - 70) - 10)
                        .attr('width', 20)
                        .attr('height', 20);
                })
                .on('mouseover', function (event, d) {
                    d3.select(this).attr('stroke', color);

                    let backgroundChrom = d3.select(this.parentNode).select('.chromosome-background');
                    backgroundChrom.attr('fill-opacity', 0.3);
                })
                .on('mouseout', function (event, d) {
                    d3.select(this).attr('stroke', 'white');

                    let backgroundChrom = d3.select(this.parentNode).select('.chromosome-background');
                    backgroundChrom.attr('fill-opacity', 0.1);
                });

            //take chr off the chromosome name
            let chrName = chromosome.chr.replace('chr', '');
            
            g.append('text')
                .attr('x', textX)
                .attr('y', textY)
                .attr('class', 'chromosome-label')
                .attr('fill', color)
                .attr('text-anchor', 'middle')
                .attr('font-weight', 'bold')
                .style('pointer-events', 'none')
                .attr('alignment-baseline', 'middle')
                .text(chrName)
                .attr('font-size', function(d) {
                    if (isSmallerSection) {
                        return "12px";
                    } else {
                        return "15px";
                    }
                });
        }
        //append a new group for the brush to be added to
        let brushGroup = svg.append('g')
            .attr('class', 'brush-group');
    }

    function _renderProbTrack(range, data, options=null) {
        //if there are already arcs remove them before redrawing
        svg.selectAll('.prob-variant-arc').remove();
        svg.selectAll('#prob-track-background').remove();

        //before beginning put a background on the track so that we can differentiate it from the other tracks more easily
        let trackBackground = d3.arc()
            .innerRadius(maxRadius * 0.79)
            .outerRadius(maxRadius * 0.86)
            .startAngle(0)
            .endAngle(360)
            .padAngle(0)
            .cornerRadius(2);

        svg.append('path')
            .datum({startAngle: startAngleRad, endAngle: endAngleRad})
            .attr('d', trackBackground)
            .attr('transform', `translate(${width / 2}, ${height / 2})`)
            .attr('fill', '#FAFAFA')
            .attr('id', 'prob-track-background')
            .on('mouseover', function (event, d) {
                d3.select(this).attr('fill', '#F0F0F0');
            })
            .on('mouseout', function (event, d) {
                d3.select(this).attr('fill', '#FAFAFA');
            });

        let tracMap = {
            1: false,
            2: false,
            3: false,
            4: false,
            5: false,
        };

        let varPosMap = {};

        for (let variant of data) {
            let accStart = chromosomeAccumulatedMap.get(variant['chromosome']).start + parseInt(variant['start']);
            let accEnd = chromosomeAccumulatedMap.get(variant['chromosome']).start + parseInt(variant['end']);

            let varStartAngle = angleScale(accStart);
            let varEndAngle = angleScale(accEnd);

            //the minimum arc needs to be 1 pixel
            if (varEndAngle - varStartAngle < 0.01) {
                varEndAngle += 0.01;
            }

            let currentTrac = 0;
            let radiusOffset = 0;

            //if the variant is not in the range then truncate or skip it appropriately
            let newStartEnd = _getStartEndForRange(accStart, accEnd, range);

            if (!newStartEnd) {
                //dont render this variant at all
                continue;
            } else {
                accStart = newStartEnd.start;
                accEnd = newStartEnd.end;
                varStartAngle = angleScale(accStart);
                varEndAngle = angleScale(accEnd);
            }

            //is the variant in the varPosMap
            if (!varPosMap[`${accStart}-${accEnd}`]) {
                varPosMap[`${accStart}-${accEnd}`] = [variant];

                for (let x of Object.keys(tracMap)) {
                    if (tracMap[x] === false || (accStart > tracMap[x])) {
                        tracMap[x] = accEnd;
                        currentTrac = x;
                        break;
                    } 
                }
                
                radiusOffset = (currentTrac - 1) * 4;
                let radius = (maxRadius * 0.85) - radiusOffset;

                //if the arc is super small... just make it a bit bigger so that we can see it
                if (varEndAngle - varStartAngle < 0.005) {
                    varEndAngle += 0.005;
                }

                //use var start and end angel to create an arc
                let arc = d3.arc()
                    .innerRadius(radius - 2)
                    .outerRadius(radius)
                    .startAngle(varStartAngle)
                    .endAngle(varEndAngle)
                    .padAngle(0)
                    .cornerRadius(0);

                svg.append('path')
                    .datum({startAngle: varStartAngle, endAngle: varEndAngle})
                    .attr('d', arc)
                    .attr('transform', `translate(${width / 2}, ${height / 2})`)
                    .attr('fill', function(d) {
                        if (variant.type === 'DEL') {
                            return 'red';
                        } else {
                            return '#1F68C1';
                        }
                    })
                    .attr('class', 'prob-variant-arc')
                    .on('mouseover', function (event, d) {
                        console.log('variant: ', variant);
                        d3.select(this)
                            .style('fill', '#DA44B4')
                            .style('cursor', 'pointer');

                        //append a tooltip that is absolutely positioned to the mouse position
                        let tooltip = d3.select('body').append('div')
                            .attr('class', 'tooltip-hover-variant')
                            .style('position', 'absolute')
                            .style('background-color', 'white')
                            .style('border', '1px solid black')
                            .style('padding', '5px')
                            .style('border-radius', '5px')
                            .style('pointer-events', 'none')
                            .style('overflow-y', 'auto')
                            .style('max-height', '200px')
                            .style('max-width', '100px');

                        //put it in the right position
                        let x = event.clientX;
                        let y = event.clientY;

                        tooltip.style('left', `${x + 10}px`)
                            .style('top', `${y + 10}px`);

                        //append the data to the tooltip
                        tooltip.append('p')
                            .text(`#${variant.rank} | Chr:${variant.chromosome} | st:${variant.start} en:${variant.end} | ${variant.type}`);

                    })
                    .on('mouseout', function (event, d) {
                        d3.select(this)
                            .style('fill', function(d) {
                                if (variant.type === 'DEL') {
                                    return 'red';
                                } else {
                                    return '#1F68C1';
                                }
                            })
                            .style('cursor', 'default');
                        
                        //remove the tooltip
                        d3.select('.tooltip-hover-variant').remove();
                    });

            } else {
                varPosMap[`${accStart}-${accEnd}`].push(variant);
                //dont render the same variant twice
                continue;
            }
        }
    }

    function _renderGenesOfInterest(genes, chromosomeAccumulatedMap, angleScale, maxRadius, svg, range) {
        //if there are already arcs remove them before redrawing
        svg.selectAll('.gene-of-interest-arc').remove();

        let tracMap = {
            1: false,
            2: false,
            3: false,
            4: false,
            5: false,
        };

        let genePosMap = {};

        for (let gene of Object.values(genes)) {
            let geneChr = gene['chr'].replace('chr', '');
            //if the gene is not in a chromosome in the map then skip it
            if (!chromosomeAccumulatedMap.has(geneChr)) {
                continue;
            }

            let accStart = chromosomeAccumulatedMap.get(geneChr).start + gene['start'];
            let accEnd = chromosomeAccumulatedMap.get(geneChr).start + gene['end'];

            let newStartEnd = _getStartEndForRange(accStart, accEnd, range);

            if (!newStartEnd) {
                //dont render this gene at all
                continue;
            }

            accStart = newStartEnd.start;
            accEnd = newStartEnd.end;

            let geneStartAngle = angleScale(accStart);
            let geneEndAngle = angleScale(accEnd);

            //the minimum arc needs to be 1 pixel
            if (geneEndAngle - geneStartAngle < 0.01) {
                geneEndAngle += 0.01;
            }

            let currentTrac = 0;
            let radiusOffset = 0;

            //is the gene in the genePosMap
            if (!genePosMap[`${accStart}-${accEnd}`]) {
                genePosMap[`${accStart}-${accEnd}`] = [gene];

                for (let x of Object.keys(tracMap)) {
                    if (tracMap[x] === false || (accStart > tracMap[x])) {
                        tracMap[x] = accEnd;
                        currentTrac = x;
                        break;
                    } 
                }
                
                radiusOffset = (currentTrac - 1) * 4;
                let radius = (maxRadius * 0.93) - radiusOffset;

                //use gene start and end angel to create an arc
                let arc = d3.arc()
                    .innerRadius(radius - 2)
                    .outerRadius(radius)
                    .startAngle(geneStartAngle)
                    .endAngle(geneEndAngle)
                    .padAngle(0)
                    .cornerRadius(0);

                svg.append('path')
                    .datum({startAngle: geneStartAngle, endAngle: geneEndAngle})
                    .attr('d', arc)
                    .attr('transform', `translate(${width / 2}, ${height / 2})`)
                    .attr('fill', 'red')
                    .attr('class', 'gene-of-interest-arc')
                    .on('mouseover', function (event, d) {
                        console.log('gene: ', gene);
                        d3.select(this)
                            .style('fill', '#DA44B4')
                            .style('cursor', 'pointer');

                        //append a tooltip that is absolutely positioned to the mouse position
                        let tooltip = d3.select('body').append('div')
                            .attr('class', 'tooltip-hover-gene')
                            .style('position', 'absolute')
                            .style('background-color', 'white')
                            .style('border', '1px solid black')
                            .style('padding', '5px')
                            .style('border-radius', '5px')
                            .style('pointer-events', 'none')
                            .style('overflow-y', 'auto')
                            .style('max-height', '200px')
                            .style('max-width', '100px');

                        //put it in the right position
                        let x = event.clientX;
                        let y = event.clientY;

                        tooltip.style('left', `${x + 10}px`)
                            .style('top', `${y + 10}px`);

                        //append the data to the tooltip
                        tooltip.append('p')
                            .text(`gene: ${gene.gene_symbol} | source: ${gene.annotation_source} | strand: ${gene.strand}`);

                    }
                )
                .on('mouseout', function (event, d) {
                    d3.select(this)
                        .style('fill', 'red')
                        .style('cursor', 'default');
                    
                    //remove the tooltip
                    d3.select('.tooltip-hover-gene').remove();
                });
            } else {
                genePosMap[`${accStart}-${accEnd}`].push(gene);
                //dont render the same gene twice
                continue;
            }

            //add a text that can only be seen if we are zoomed in enough it needs to be scaled and in the middle of the gene
            let geneLabel = gene.gene_symbol;
            let geneLabelAngle = ((geneStartAngle + geneEndAngle) / 2) - Math.PI / 2; // -90 degrees to rotate the text because the text is horizontal and the arc is vertical
            let geneLabelRadius = (maxRadius * 0.909) - radiusOffset;
            let geneLabelX = (center.x) + ((geneLabelRadius) * Math.cos(geneLabelAngle));
            let geneLabelY = (center.y) + ((geneLabelRadius) * Math.sin(geneLabelAngle));
            let fontSize = 8;
            //label for the gene
            let label = svg.append('text')
                .attr('x', geneLabelX)
                .attr('y', geneLabelY)
                .attr('class', 'gene-label')
                .attr('fill', 'red')
                .attr('font-weight', 'bold')
                .attr('text-anchor', 'middle')
                .attr('alignment-baseline', 'middle')
                .text(geneLabel)
                .attr('font-size', `${fontSize}px`)
                .on('mouseover', function (event, d) {
                    //make the cursor a pointer
                    d3.select(this).style('cursor', 'pointer');

                    //append a tooltip that is absolutely positioned to the mouse position
                    let tooltip = d3.select('body').append('div')
                        .attr('class', 'tooltip-hover-gene')
                        .style('position', 'absolute')
                        .style('background-color', 'white')
                        .style('border', '1px solid black')
                        .style('padding', '5px')
                        .style('border-radius', '5px')
                        .style('pointer-events', 'none')
                        .style('overflow-y', 'auto')
                        .style('max-height', '200px')
                        .style('max-width', '100px');

                    //put it in the right position
                    let x = event.clientX;
                    let y = event.clientY;

                    tooltip.style('left', `${x + 10}px`)
                        .style('top', `${y + 10}px`);

                    //append the data to the tooltip
                    tooltip.append('p')
                        .text(`gene: ${gene.gene_symbol} | source: ${gene.annotation_source} | strand: ${gene.strand}`);
                }
            )
            .on('mouseout', function (event, d) {           
                //make the cursor the default
                d3.select(this).style('cursor', 'default');

                //remove the tooltip
                d3.select('.tooltip-hover-gene').remove();
            }
            );
        }
    }

    function _renderGenesTrack(genes, chromosomeAccumulatedMap, angleScale, maxRadius, svg, range) {
        let localGenes = {...genes}
        //if there are already arcs remove them before redrawing
        svg.selectAll('.gene-arc').remove();

        //if the range is larger than the largest chromosome (290,000,000 bases) only render genes of interest
        let size = range[1] - range[0]

        if (size > 290000000 && genesOfInterest) {
            _renderGenesOfInterest(genesOfInterest, chromosomeAccumulatedMap, angleScale, maxRadius, svg, range);
            return
        } else if (size > 290000000) {
            return
        }

        let tracMap = {
            1: false,
            2: false,
            3: false,
            4: false,
            5: false,
        };

        let genePosMap = {};

        if (genesOfInterest) {
            for (let gene of genesOfInterest){
                delete localGenes[gene.gene_symbol]
            }
        }

        for (let gene of Object.values(localGenes)) {
            let geneChr = gene['chr'].replace('chr', '');
            //if the gene is not in a chromosome in the map then skip it
            if (!chromosomeAccumulatedMap.has(geneChr)) {
                continue;
            }

            let accStart = chromosomeAccumulatedMap.get(geneChr).start + gene['start'];
            let accEnd = chromosomeAccumulatedMap.get(geneChr).start + gene['end'];

            let newStartEnd = _getStartEndForRange(accStart, accEnd, range);

            if (!newStartEnd) {
                //dont render this gene at all
                continue;
            }

            accStart = newStartEnd.start;
            accEnd = newStartEnd.end;

            let geneStartAngle = angleScale(accStart);
            let geneEndAngle = angleScale(accEnd);

            //the minimum arc needs to be 1 pixel
            if (geneEndAngle - geneStartAngle < 0.01) {
                geneEndAngle += 0.01;
            }

            let currentTrac = 0;
            let radiusOffset = 0;

            //is the gene in the genePosMap
            if (!genePosMap[`${accStart}-${accEnd}`]) {
                genePosMap[`${accStart}-${accEnd}`] = [gene];

                for (let x of Object.keys(tracMap)) {
                    if (tracMap[x] === false || (accStart > tracMap[x])) {
                        tracMap[x] = accEnd;
                        currentTrac = x;
                        break;
                    } 
                }
                
                radiusOffset = (currentTrac - 1) * 4;
                let radius = (maxRadius * 0.93) - radiusOffset;

                //use gene start and end angel to create an arc
                let arc = d3.arc()
                    .innerRadius(radius - 1)
                    .outerRadius(radius)
                    .startAngle(geneStartAngle)
                    .endAngle(geneEndAngle)
                    .padAngle(0)
                    .cornerRadius(0);

                svg.append('path')
                    .datum({startAngle: geneStartAngle, endAngle: geneEndAngle})
                    .attr('d', arc)
                    .attr('transform', `translate(${width / 2}, ${height / 2})`)
                    .attr('fill', 'black')
                    .attr('class', 'gene-arc')
                    .on('mouseover', function (event, d) {
                        console.log('gene: ', gene);
                        d3.select(this)
                            .style('fill', '#DA44B4')
                            .style('cursor', 'pointer');

                        //append a tooltip that is absolutely positioned to the mouse position
                        let tooltip = d3.select('body').append('div')
                            .attr('class', 'tooltip-hover-gene')
                            .style('position', 'absolute')
                            .style('background-color', 'white')
                            .style('border', '1px solid black')
                            .style('padding', '5px')
                            .style('border-radius', '5px')
                            .style('pointer-events', 'none')
                            .style('overflow-y', 'auto')
                            .style('max-height', '200px')
                            .style('max-width', '100px');

                        //put it in the right position
                        let x = event.clientX;
                        let y = event.clientY;

                        tooltip.style('left', `${x + 10}px`)
                            .style('top', `${y + 10}px`);

                        //append the data to the tooltip
                        tooltip.append('p')
                            .text(`gene: ${gene.gene_symbol} | source: ${gene.annotation_source} | strand: ${gene.strand}`);

                    }
                )
                .on('mouseout', function (event, d) {
                    d3.select(this)
                        .style('fill', 'black')
                        .style('cursor', 'default');
                    
                    //remove the tooltip
                    d3.select('.tooltip-hover-gene').remove();
                });
            } else {
                genePosMap[`${accStart}-${accEnd}`].push(gene);
                //dont render the same gene twice
                continue;
            }

            //add a text that can only be seen if we are zoomed in enough it needs to be scaled and in the middle of the gene
            let geneLabel = gene.gene_symbol;
            let geneLabelAngle = ((geneStartAngle + geneEndAngle) / 2) - Math.PI / 2; // -90 degrees to rotate the text because the text is horizontal and the arc is vertical
            let geneLabelRadius = (maxRadius * 0.909) - radiusOffset;
            let geneLabelX = (center.x) + ((geneLabelRadius) * Math.cos(geneLabelAngle));
            let geneLabelY = (center.y) + ((geneLabelRadius) * Math.sin(geneLabelAngle));
            
            //the font needs to be scaled based on the size of the zoomed section inversely proportional to the size of the zoomed section
            let zoomedSize = range[1] - range[0];
            let baseFontSize = 20;

            // Ensure zoomedSize is at least 1 to avoid taking the logarithm of 0 or a negative number.
            if (zoomedSize < 1) {
                zoomedSize = 1;
            }

            // Normalize zoomedSize logarithmically
            let normalized_window = Math.log(zoomedSize) / Math.log(bpGenomeSize);

            // Calculate the scaled font size
            let scaledFontSize = baseFontSize * (1 - normalized_window);

            //label for the gene
            let label = svg.append('text')
                .attr('x', geneLabelX)
                .attr('y', geneLabelY)
                .attr('class', 'gene-label')
                .attr('fill', 'black')
                .attr('font-weight', 'bold')
                .attr('text-anchor', 'middle')
                .attr('alignment-baseline', 'middle')
                .text(geneLabel)
                .attr('font-size', `${scaledFontSize}px`)
                .on('mouseover', function (event, d) {
                    //make the cursor a pointer
                    d3.select(this).style('cursor', 'pointer');

                    //append a tooltip that is absolutely positioned to the mouse position
                    let tooltip = d3.select('body').append('div')
                        .attr('class', 'tooltip-hover-gene')
                        .style('position', 'absolute')
                        .style('background-color', 'white')
                        .style('border', '1px solid black')
                        .style('padding', '5px')
                        .style('border-radius', '5px')
                        .style('pointer-events', 'none')
                        .style('overflow-y', 'auto')
                        .style('max-height', '200px')
                        .style('max-width', '100px');

                    //put it in the right position
                    let x = event.clientX;
                    let y = event.clientY;

                    tooltip.style('left', `${x + 10}px`)
                        .style('top', `${y + 10}px`);

                    //append the data to the tooltip
                    tooltip.append('p')
                        .text(`gene: ${gene.gene_symbol} | source: ${gene.annotation_source} | strand: ${gene.strand}`);
                }
            )
            .on('mouseout', function (event, d) {           
                //make the cursor the default
                d3.select(this).style('cursor', 'default');

                //remove the tooltip
                d3.select('.tooltip-hover-gene').remove();
            }
            );
        }
        //render last because I want them on top
        _renderGenesOfInterest(genesOfInterest, chromosomeAccumulatedMap, angleScale, maxRadius, svg, range)
    }

    function _renderPar1Track(range, data) {
        //remove the variant arcs if they exist
        svg.selectAll('.par1-variant-arc').remove();

        //for now our radius is 0.76 to 0.78 render our bottom background part in white
        let par1Background = d3.arc()
            .innerRadius(maxRadius * 0.69)
            .outerRadius(maxRadius * 0.79)
            .startAngle(0)
            .endAngle(360)
            .padAngle(0)
            .cornerRadius(2);

        svg.append('path')
            .datum({startAngle: startAngleRad, endAngle: endAngleRad})
            .attr('d', par1Background)
            .attr('transform', `translate(${width / 2}, ${height / 2})`)
            .attr('fill', 'white')
            .attr('id', 'par1-track-background')
            .on('mouseover', function (event, d) {
                d3.select(this).attr('fill', '#F0F0F0');
            })
            .on('mouseout', function (event, d) {
                d3.select(this).attr('fill', 'white');
            });

        let tracMap = {
            1: false,
            2: false,
            3: false,
            4: false,
            5: false,
        };

        let varPosMap = {};

        for (let variant of data) {
            let accStart = chromosomeAccumulatedMap.get(variant['chromosome']).start + parseInt(variant['start']);
            let accEnd = chromosomeAccumulatedMap.get(variant['chromosome']).start + parseInt(variant['end']);

            let varStartAngle = angleScale(accStart);
            let varEndAngle = angleScale(accEnd);

            //the minimum arc needs to be 1 pixel
            if (varEndAngle - varStartAngle < 0.01) {
                varEndAngle += 0.01;
            }

            let currentTrac = 0;
            let radiusOffset = 0;

            //if the variant is not in the range then truncate or skip it appropriately
            let newStartEnd = _getStartEndForRange(accStart, accEnd, range);

            if (!newStartEnd) {
                //dont render this variant at all
                continue;
            } else {
                accStart = newStartEnd.start;
                accEnd = newStartEnd.end;
                varStartAngle = angleScale(accStart);
                varEndAngle = angleScale(accEnd);
            }

            //is the variant in the varPosMap
            if (!varPosMap[`${accStart}-${accEnd}`]) {
                varPosMap[`${accStart}-${accEnd}`] = [variant];

                for (let x of Object.keys(tracMap)) {
                    if (tracMap[x] === false || (accStart > tracMap[x])) {
                        tracMap[x] = accEnd;
                        currentTrac = x;
                        break;
                    } 
                }
                
                radiusOffset = (currentTrac - 1) * 4;
                let radius = (maxRadius * 0.78) - radiusOffset;

                //if the arc is super small... just make it a bit bigger so that we can see it
                if (varEndAngle - varStartAngle < 0.005) {
                    varEndAngle += 0.005;
                }

                //use var start and end angel to create an arc
                let arc = d3.arc()
                    .innerRadius(radius - 2)
                    .outerRadius(radius)
                    .startAngle(varStartAngle)
                    .endAngle(varEndAngle)
                    .padAngle(0)
                    .cornerRadius(0);

                svg.append('path')
                    .datum({startAngle: varStartAngle, endAngle: varEndAngle})
                    .attr('d', arc)
                    .attr('transform', `translate(${width / 2}, ${height / 2})`)
                    .attr('fill', function(d) {
                        if (variant.type === 'DEL') {
                            return 'red';
                        } else {
                            return '#1F68C1';
                        }
                    })
                    .attr('class', 'par1-variant-arc')
                    .on('mouseover', function (event, d) {
                        console.log('variant: ', variant);
                        d3.select(this)
                            .style('fill', '#DA44B4')
                            .style('cursor', 'pointer');

                        //append a tooltip that is absolutely positioned to the mouse position
                        let tooltip = d3.select('body').append('div')
                            .attr('class', 'tooltip-hover-variant')
                            .style('position', 'absolute')
                            .style('background-color', 'white')
                            .style('border', '1px solid black')
                            .style('padding', '5px')
                            .style('border-radius', '5px')
                            .style('pointer-events', 'none')
                            .style('overflow-y', 'auto')
                            .style('max-height', '200px')
                            .style('max-width', '100px');

                        //put it in the right position
                        let x = event.clientX;
                        let y = event.clientY;

                        tooltip.style('left', `${x + 10}px`)
                            .style('top', `${y + 10}px`);

                        //append the data to the tooltip
                        tooltip.append('p')
                            .text(`#${variant.rank} | Chr:${variant.chromosome} | st:${variant.start} en:${variant.end} | ${variant.type}`);

                    })
                    .on('mouseout', function (event, d) {
                        d3.select(this)
                            .style('fill', function(d) {
                                if (variant.type === 'DEL') {
                                    return 'red';
                                } else {
                                    return '#1F68C1';
                                }
                            })
                            .style('cursor', 'default');
                        
                        //remove the tooltip
                        d3.select('.tooltip-hover-variant').remove();
                    });

            } else {
                varPosMap[`${accStart}-${accEnd}`].push(variant);
                //dont render the same variant twice
                continue;
            }
        }
    }

    function _renderPar2Track(range, data=null) {
        //remove the background track if it exists
        svg.selectAll('#par2-track-background').remove();
        //remove the variant arcs if they exist
        svg.selectAll('.par2-variant-arc').remove();

        //for now our radius is 0.85 to 0.87 render our bottom background part
        let par2Background = d3.arc()
            .innerRadius(maxRadius * 0.72)
            .outerRadius(maxRadius * 0.64)
            .startAngle(0)
            .endAngle(360)
            .padAngle(0)
            .cornerRadius(2);

        svg.append('path')
            .datum({startAngle: startAngleRad, endAngle: endAngleRad})
            .attr('d', par2Background)
            .attr('transform', `translate(${width / 2}, ${height / 2})`)
            .attr('fill', '#FAFAFA')
            .attr('id', 'par2-track-background')
            .on('mouseover', function (event, d) {
                d3.select(this).attr('fill', '#F0F0F0');
            })
            .on('mouseout', function (event, d) {
                d3.select(this).attr('fill', '#FAFAFA');
            });

        let tracMap = {
            1: false,
            2: false,
            3: false,
            4: false,
            5: false,
        };

        let varPosMap = {};

        for (let variant of data) {
            let accStart = chromosomeAccumulatedMap.get(variant['chromosome']).start + parseInt(variant['start']);
            let accEnd = chromosomeAccumulatedMap.get(variant['chromosome']).start + parseInt(variant['end']);

            let varStartAngle = angleScale(accStart);
            let varEndAngle = angleScale(accEnd);

            //the minimum arc needs to be 1 pixel
            if (varEndAngle - varStartAngle < 0.01) {
                varEndAngle += 0.01;
            }

            let currentTrac = 0;
            let radiusOffset = 0;

            //if the variant is not in the range then truncate or skip it appropriately
            let newStartEnd = _getStartEndForRange(accStart, accEnd, range);

            if (!newStartEnd) {
                //dont render this variant at all
                continue;
            } else {
                accStart = newStartEnd.start;
                accEnd = newStartEnd.end;
                varStartAngle = angleScale(accStart);
                varEndAngle = angleScale(accEnd);
            }

            //is the variant in the varPosMap
            if (!varPosMap[`${accStart}-${accEnd}`]) {
                varPosMap[`${accStart}-${accEnd}`] = [variant];

                for (let x of Object.keys(tracMap)) {
                    if (tracMap[x] === false || (accStart > tracMap[x])) {
                        tracMap[x] = accEnd;
                        currentTrac = x;
                        break;
                    } 
                }
                
                radiusOffset = (currentTrac - 1) * 4;
                let radius = (maxRadius * 0.71) - radiusOffset;

                //if the arc is super small... just make it a bit bigger so that we can see it
                if (varEndAngle - varStartAngle < 0.005) {
                    varEndAngle += 0.005;
                }

                //use var start and end angel to create an arc
                let arc = d3.arc()
                    .innerRadius(radius - 2)
                    .outerRadius(radius)
                    .startAngle(varStartAngle)
                    .endAngle(varEndAngle)
                    .padAngle(0)
                    .cornerRadius(0);

                svg.append('path')
                    .datum({startAngle: varStartAngle, endAngle: varEndAngle})
                    .attr('d', arc)
                    .attr('transform', `translate(${width / 2}, ${height / 2})`)
                    .attr('fill', function(d) {
                        if (variant.type === 'DEL') {
                            return 'red';
                        } else {
                            return '#1F68C1';
                        }
                    })
                    .attr('class', 'par2-variant-arc')
                    .on('mouseover', function (event, d) {
                        console.log('variant: ', variant);
                        d3.select(this)
                            .style('fill', '#DA44B4')
                            .style('cursor', 'pointer');

                        //append a tooltip that is absolutely positioned to the mouse position
                        let tooltip = d3.select('body').append('div')
                            .attr('class', 'tooltip-hover-variant')
                            .style('position', 'absolute')
                            .style('background-color', 'white')
                            .style('border', '1px solid black')
                            .style('padding', '5px')
                            .style('border-radius', '5px')
                            .style('pointer-events', 'none')
                            .style('overflow-y', 'auto')
                            .style('max-height', '200px')
                            .style('max-width', '100px');

                        //put it in the right position
                        let x = event.clientX;
                        let y = event.clientY;

                        tooltip.style('left', `${x + 10}px`)
                            .style('top', `${y + 10}px`);

                        //append the data to the tooltip
                        tooltip.append('p')
                            .text(`#${variant.rank} | Chr:${variant.chromosome} | st:${variant.start} en:${variant.end} | ${variant.type}`);

                    })
                    .on('mouseout', function (event, d) {
                        d3.select(this)
                            .style('fill', function(d) {
                                if (variant.type === 'DEL') {
                                    return 'red';
                                } else {
                                    return '#1F68C1';
                                }
                            })
                            .style('cursor', 'default');
                        
                        //remove the tooltip
                        d3.select('.tooltip-hover-variant').remove();
                    });

            } else {
                varPosMap[`${accStart}-${accEnd}`].push(variant);
                //dont render the same variant twice
                continue;
            }
        }
    }

    function _renderAltCallsTrack(range, data) {
        //remove the variant arcs if they exist
        svg.selectAll('.altCalls-variant-arc').remove();

        //for now our radius is from .60 to .52
        let altCallsBackground = d3.arc()
            .innerRadius(maxRadius * 0.56)
            .outerRadius(maxRadius * 0.64)
            .startAngle(0)
            .endAngle(360)
            .padAngle(0)
            .cornerRadius(2);

        svg.append('path')
            .datum({startAngle: startAngleRad, endAngle: endAngleRad})
            .attr('d', altCallsBackground)
            .attr('transform', `translate(${width / 2}, ${height / 2})`)
            .attr('fill', 'white')
            .attr('id', 'altCalls-track-background')
            .on('mouseover', function (event, d) {
                d3.select(this).attr('fill', '#F0F0F0');
            }
        )
        .on('mouseout', function (event, d) {
            d3.select(this).attr('fill', 'white');
        });

        let tracMap = {
            1: false,
            2: false,
            3: false,
            4: false,
            5: false,
        };

        let varPosMap = {};

        for (let variant of data) {

            let accStart = chromosomeAccumulatedMap.get(variant['chromosome']).start + variant['start'];
            let accEnd = chromosomeAccumulatedMap.get(variant['chromosome']).start + variant['end'];

            let varStartAngle = angleScale(accStart);
            let varEndAngle = angleScale(accEnd);

            //the minimum arc needs to be 1 pixel
            if (varEndAngle - varStartAngle < 0.01) {
                varEndAngle += 0.01;
            }

            let currentTrac = 0;
            let radiusOffset = 0;

            //if the variant is not in the range then truncate or skip it appropriately
            let newStartEnd = _getStartEndForRange(accStart, accEnd, range);

            if (!newStartEnd) {
                //dont render this variant at all
                continue;
            } else {
                accStart = newStartEnd.start;
                accEnd = newStartEnd.end;
                varStartAngle = angleScale(accStart);
                varEndAngle = angleScale(accEnd);
            }

            //is the variant in the varPosMap
            if (!varPosMap[`${accStart}-${accEnd}`]) {
                varPosMap[`${accStart}-${accEnd}`] = [variant];

                for (let x of Object.keys(tracMap)) {
                    if (tracMap[x] === false || (accStart > tracMap[x])) {
                        tracMap[x] = accEnd;
                        currentTrac = x;
                        break;
                    } 
                }
                
                radiusOffset = (currentTrac - 1) * 4;
                let radius = (maxRadius * 0.63) - radiusOffset;

                //if the arc is super small... just make it a bit bigger so that we can see it
                if (varEndAngle - varStartAngle < 0.005) {
                    varEndAngle += 0.005;
                }

                //use var start and end angel to create an arc
                let arc = d3.arc()
                    .innerRadius(radius - 2)
                    .outerRadius(radius)
                    .startAngle(varStartAngle)
                    .endAngle(varEndAngle)
                    .padAngle(0)
                    .cornerRadius(0);

                svg.append('path')
                    .datum({startAngle: varStartAngle, endAngle: varEndAngle})
                    .attr('d', arc)
                    .attr('transform', `translate(${width / 2}, ${height / 2})`)
                    .attr('fill', function(d) {
                        if (variant.type === 'DEL') {
                            return 'red';
                        } else {
                            return '#1F68C1';
                        }
                    })
                    .attr('class', 'altCalls-variant-arc')
                    .on('mouseover', function (event, d) {
                        console.log('variant: ', variant);
                        d3.select(this)
                            .style('fill', '#DA44B4')
                            .style('cursor', 'pointer');

                        //append a tooltip that is absolutely positioned to the mouse position
                        let tooltip = d3.select('body').append('div')
                            .attr('class', 'tooltip-hover-variant')
                            .style('position', 'absolute')
                            .style('background-color', 'white')
                            .style('border', '1px solid black')
                            .style('padding', '5px')
                            .style('border-radius', '5px')
                            .style('pointer-events', 'none')
                            .style('overflow-y', 'auto')
                            .style('max-height', '200px')
                            .style('max-width', '100px');

                        //put it in the right position
                        let x = event.clientX;
                        let y = event.clientY;

                        tooltip.style('left', `${x + 10}px`)
                            .style('top', `${y + 10}px`);

                        //append the data to the tooltip
                        tooltip.append('p')
                            .text(`#${variant.rank} | Chr:${variant.chromosome} | st:${variant.start} en:${variant.end} | ${variant.type}`);

                    })
                    .on('mouseout', function (event, d) {
                        d3.select(this)
                            .style('fill', function(d) {
                                if (variant.type === 'DEL') {
                                    return 'red';
                                } else {
                                    return '#1F68C1';
                                }
                            })
                            .style('cursor', 'default');
                        
                        //remove the tooltip
                        d3.select('.tooltip-hover-variant').remove();
                    });

            } else {
                varPosMap[`${accStart}-${accEnd}`].push(variant);
                //dont render the same variant twice
                continue;
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
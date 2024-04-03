import * as d3 from 'd3';
import { h } from 'vue';

export default function svCircos(parentTag, refChromosomes, data=null, options=null) {

    //Reference Variables (chromosomes)
    let chromosomes = refChromosomes;
    let centromeres = null;
    let bands = null;

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
    
    let startAngleRad = 3 * Math.PI / 180;
    let endAngleRad = 357 * Math.PI / 180;
    // Change the range to radians (0 to 2π)
    let angleScale = d3.scaleLinear()
        .domain([zoomedSection.start, zoomedSection.end])
        .range([startAngleRad, endAngleRad]);

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
    let centerSymbolGroup = svg.append('g')
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
            svg.selectAll('.variant-arc').remove();
            _renderTracks([zoomedSection.start, zoomedSection.end], svData);

            //clear all the chromosomes and render the new chromosomes
            svg.selectAll('.chromosome').remove();
            //clear all the chromosome labels
            svg.selectAll('.chromosome-label').remove();
            _renderChromosomes([zoomedSection.start, zoomedSection.end], chromosomes);

            //also reset the image to the dna.svg
            centerSymbolGroup.select('image')
                .attr('xlink:href', '/dna.svg')
                .attr('x', width - (width - 70) - 10)
                .attr('y', height - (height - 70) - 10)
                .attr('width', 20)
                .attr('height', 20);
        });

    //Upper left side of the circle will be that button
    centerSymbolGroup.append('circle')
        .attr('cx', width - (width - 70))
        .attr('cy', height - (height - 70))
        .attr('r', 15)
        .attr('fill', '#1F68C1');
    
    //on top of this circle we will render the dna.svg that we have /dna.svg
    centerSymbolGroup.append('image')
        .attr('xlink:href', '/dna.svg')
        .attr('x', width - (width - 70) -10)
        .attr('y', height - (height - 70) -10)
        .attr('width', 20)
        .attr('height', 20);
    
    //iterate over the chromosomes and create the arcs
    let startColor = '#1F68C1'
    let endColor = '#A63D40'

    _renderChromosomes([zoomedSection.start, zoomedSection.end], chromosomes);
    _renderTracks([zoomedSection.start, zoomedSection.end], svData);

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

            //create a group for both parts of the chromosomes
            const chromosomeGroup = g.append('g')
                .attr('class', 'chromosome')
                .on('mouseover', function (event, d) {
                    //Had done a grow but it is somewhat odd so removed it for now
                    //make the cursor a pointer
                    d3.select(this).style('cursor', 'pointer');
                    //grab the background and increase the opacity
                    d3.select(this).selectAll('.chromosome-background').attr('fill-opacity', 0.3);
                })
                .on('mouseout', function (event, d) {
                    //make the cursor the default
                    d3.select(this).style('cursor', 'default');
                    //grab the background and decrease the opacity
                    d3.select(this).selectAll('.chromosome-background').attr('fill-opacity', 0.1);
                })
                .on('click', function (event, d) {
                    //We will identify the chromosome that was clicked
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
                    _renderTracks([zoomedSection.start, zoomedSection.end], svData);

                    //get our centerSymbolGroup and change the symbol to our magnify-out.svg
                    centerSymbolGroup.select('image')
                        .attr('xlink:href', '/magnify-out.svg')
                        .attr('x', width - (width - 70) - 10)
                        .attr('y', height - (height - 70) - 10)
                        .attr('width', 20)
                        .attr('height', 20);
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
                console.log('No centromere for chromosome: ', chromosomeName);
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
                        let bandLabelAngle = (bandStartAngle + bandEndAngle) / 2 - Math.PI / 2; // -90 degrees to rotate the text because the text is horizontal and the arc is vertical
                        let bandLabelRadius = maxRadius *1.04;
                        let bandLabelX = (center.x) + ((bandLabelRadius) * Math.cos(bandLabelAngle));
                        let bandLabelY = (center.y) + ((bandLabelRadius) * Math.sin(bandLabelAngle));

                        let labelFontSize = 9;

                        //label for the band
                        g.append('text')
                            .attr('x', bandLabelX)
                            .attr('y', bandLabelY)
                            .attr('class', 'chromosome-label')
                            .attr('fill', color)
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

            // Calculate the middle angle of the arc in radians based on the whole genome size and scale
            let textAngleScale = d3.scaleLinear()
                .domain([0, bpGenomeSize])
                .range([startAngleRad, endAngleRad]);

            let textStartAngle = textAngleScale(chromStart);
            let textEndAngle = textAngleScale(chromEnd);
            
            let isSmallerSection = Math.min(width, height) <= 700;

            const textAngle = (textStartAngle + textEndAngle) / 2 - Math.PI / 2; // -90 degrees to rotate the text because the text is horizontal and the arc is vertical
            const textRadius = maxRadius * 1.09;
            const textX = (center.x) + ((textRadius) * Math.cos(textAngle));
            const textY = (center.y) + ((textRadius) * Math.sin(textAngle));

            //put a small white rectangle behind the text to make it more readable
            g.append('rect')
                .attr('x', textX - 10)
                .attr('y', textY - 11)
                .attr('width', 20)
                .attr('height', 20)
                .attr('fill', 'white')
                .attr('stroke', color)
                .attr('class', 'chromosome-label')
                .style('pointer-events', 'none')
                .attr('fill-opacity', 0.8)
                .attr('rx', 2);

            //take chr off the chromosome name
            let chrName = chromosome.chr.replace('chr', '');
            
            g.append('text')
                .attr('x', textX)
                .attr('y', textY)
                .attr('class', 'chromosome-label')
                .attr('fill', color)
                .attr('text-anchor', 'middle')
                .attr('font-weight', 'bold')
                .attr('alignment-baseline', 'middle')
                .text(chrName)
                .attr('font-size', function(d) {
                    if (isSmallerSection) {
                        return "12px";
                    } else {
                        return "15px";
                    }
                })
                .style('pointer-events', 'none');

            //if we are in a smaller section then we need to adjust the posi
        }
    }

    function _renderTracks(range, data, tracks=null) {
        //if there are already arcs remove them before redrawing
        svg.selectAll('.variant-arc').remove();

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
                let radius = (maxRadius * 0.93) - radiusOffset;

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
                            return '#A63D40';
                        } else if (variant.type === 'DUP') {
                            return '#1F68C1';
                        } else {
                            return '#F4D03F';
                        }
                    })
                    .attr('class', 'variant-arc')
                    .on('mouseover', function (event, d) {
                        console.log('variant: ', variant);
                        d3.select(this)
                            .style('fill', 'red')
                            .style('cursor', 'pointer');
            
                    })
                    .on('mouseout', function (event, d) {
                        d3.select(this)
                            .style('fill', function(d) {
                                if (variant.type === 'DEL') {
                                    return '#A63D40';
                                } else if (variant.type === 'DUP') {
                                    return '#1F68C1';
                                } else {
                                    return '#F4D03F';
                                }
                            })
                            .style('cursor', 'default');
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
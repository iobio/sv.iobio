/*
This component is a linear chart that displays the chromosomes in a given genome.

Component takes the following:
- A parent element (to get the width and height from)
    - Consider just passing the width and height as arguments
- A reference chromosomes object
- brush: Allow brush (optional: default false) - if true the user will be able to select a region of the genome

- An 'options' object with any of the following properties:
    - centromeres: A centromere object (optional) if there are no centromeres chromosomes will not have the additional centromere band component
    - bands: A banding object (optional)
    - pointsOfInterest: A list of points of interest (optional) - these are points that will be displayed on the chart for quick reference
    - maximumSelection: A maximum selection size (in base pairs) (optional) - used to limit the size of the selection to a reasonable size for the user to work with if not present will default to 1000000 base pairs
    - selectionCallback: A callback function that will be called when the user selects a region of the genome (optional) - the function will be passed the start and end base pair positions of the selection

Functions:
- User can select a region by brushing over the chart
- User can click on a point of interest to center the brush on that point
*/

import * as d3 from 'd3';

export default function chromSelectBar(parentElementTag, refChromosomes, options=null) {
    let parentElement = d3.select(parentElementTag);

    let width = parentElement.node().clientWidth;
    let height = parentElement.node().clientHeight;
    let chromosomes = refChromosomes;
    let bands = null;
    let centromeres = null;
    let pointsOfInterest = null;
    let maximumSelection = 1000000;
    let selectionCallback = null;
    let brush = false;
    let selection = null;

    //zoom variables
    let zoomedSelection = null;

    if (options) {
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
        if (options.pointsOfInterest) {
            pointsOfInterest = options.pointsOfInterest;
        }
        if (options.maximumSelection) {
            maximumSelection = options.maximumSelection;
        }
        if (options.selectionCallback) {
            selectionCallback = options.selectionCallback;
        }
        if (options.brush) {
            brush = options.brush;
        }
        if (options.selection && options.selection !== null) {
            //we want to automatically brush to the selection
            selection = options.selection;
            //ensure that the selection.start is less than the selection.end if not then swap them
            if (selection.start > selection.end) {
                let temp = selection.start;
                selection.start = selection.end;
                selection.end = temp;
            }
        }
    }

    const margin = {top: 5, right: 10, bottom: 5, left: 10};

    const svg = d3.create('svg')
        .attr('viewBox', [0, 0, width, height])
        .attr('class', 'chrom-select-bar-d3')
        .attr('width', width)
        .attr('height', height);

    let { chromosomeMap, genomeSize } = _genChromosomeAccumulatedMap(chromosomes);

    let originZoom = {
        start: 0,
        end: genomeSize,
        size: genomeSize
    }

    zoomedSelection = originZoom;

    //if the selection is the origin zoom then we want to set the selection to null
    if (selection && selection.start == 0 && selection.end == genomeSize) {
        selection = null;
    }

    let x = d3.scaleLinear()
    .domain([zoomedSelection.start, zoomedSelection.end])
    .range([margin.left, width - margin.right]);

    _renderChromosomes([zoomedSelection.start, zoomedSelection.end]); //function that renders the actual chromosome sections of the chart

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

            //Centromeres setup
            let centromere = false;
            let centromereStart = null;
            let centromereEnd = null;
            let centromereCenter = null;

            //set absolute centromere start, end, and center based on the chromosome start and end (original)
            if (centromeres) { 
                centromere = true;
                centromereStart = chromosomeStart + centromeres[chr].start;
                centromereEnd = chromosomeStart + centromeres[chr].end;
                centromereCenter = (centromereEnd - centromereStart) / 2;

                if (chromosomeStart != chromStartUpdated || chromosomeEnd != chromEndUpdated) {
                    let newCentStartEnd = _getStartEndForRange(centromereStart, centromereEnd, range);

                    if (!newCentStartEnd) {
                        //this centrome is not in the range so we will not render it
                        centromere = false;
                    } else {
                        centromereStart = newCentStartEnd.start;
                        centromereEnd = newCentStartEnd.end;
                        centromereCenter = (centromereEnd - centromereStart) / 2;
                    }
                }
            }

            //create a new group for this chromosome
            let chromosomeGroup = svg.append('g')
                .attr('transform', `translate(${x(chromStartUpdated)}, 0)`)
                .attr('class', 'chromosome-group')
                .attr('id', `chr-${chr}-group`);

            let chromosomeColor = d3.interpolate('#1F68C1', '#A63D40')(chromosomeEnd / genomeSize);
                
            //add the chromosome bar
            chromosomeGroup.append('rect')
                .attr('x', 1)
                .attr('width', x(chromEndUpdated) - x(chromStartUpdated))
                .attr('height', height - margin.bottom - margin.top + 5)
                .attr('fill', chromosomeColor)
                .attr('stroke', 'white')
                .attr('fill-opacity', 0.3);

            let idioHeight = height - margin.bottom - margin.top - 8;
            let idioPosOffset = 16;

            if (!centromere) {
                //add another rectangle slightly smaller and under the last one to start to make the idiograms
                chromosomeGroup.append('rect')
                    //class will be idiogram
                    .attr('class', 'upper-idiogram')
                    .attr('x', 1)
                    .attr('width', x(chromEndUpdated) - x(chromStartUpdated))
                    .attr('height', idioHeight)
                    .attr('transform', `translate(0, ${idioPosOffset})` )
                    .attr('fill', 'white')
                    .attr('stroke', chromosomeColor)
                    //make the corners rounded
                    .attr('rx', 3);
            } else {
                chromosomeGroup.append('rect')
                    //class will be idiogram
                    .attr('class', 'upper-idiogram-parm')
                    .attr('x', 1)
                    .attr('width', function(){
                        //then return here the width which will be the scaled value from the start of the centromere to the end of the centromere
                        return x(centromereStart + centromereCenter) - x(chromStartUpdated) - 1;
                    })
                    .attr('height', idioHeight)
                    .attr('transform', `translate(0, ${idioPosOffset})` )
                    .attr('fill', 'white')
                    .attr('stroke', chromosomeColor)
                    //make the corners rounded
                    .attr('rx', 3);
                
                //now to make the q arm
                chromosomeGroup.append('rect')
                    //class will be idi
                    .attr('class', 'lower-idiogram-qarm')
                    .attr('x', function(){
                        //then return here the width which will be the scaled value from the start of the centromere to the end of the centromere
                        return x(centromereStart + centromereCenter) - x(chromStartUpdated);
                    })
                    .attr('width', function(){
                        //then return here the width which will be the scaled value from the start of the centromere to the end of the centromere
                        return x(chromEndUpdated) - x(centromereEnd - centromereCenter);
                    })
                    .attr('height', idioHeight)
                    .attr('transform', `translate(0, ${idioPosOffset})` )
                    .attr('fill', 'white')
                    .attr('stroke', chromosomeColor)
                    //make the corners rounded
                    .attr('rx', 3);   
            }
            
            //if there are bands filter for the bands that are in this chromosome
            if (bands) {
                let chrBands = bands.filter(band => band.chr == chr);

                for (let band of chrBands) {
                    //get the band start and end in the absolute base pair space for calculations
                    let bandStartAbs = chromosomeStart + band.start;
                    let bandEndAbs = chromosomeStart + band.end;

                    //check and see if the band is in the zoomed selection
                    let newBandStartEnd = _getStartEndForRange(bandStartAbs, bandEndAbs, range);

                    if (!newBandStartEnd) {
                        //if we get nothing back we dont render this band at all
                        continue;
                    } else {
                        //we will either get back the truncated start/ends or the original start/ends depending on if the band is in the range
                        bandStartAbs = newBandStartEnd.start;
                        bandEndAbs = newBandStartEnd.end;
                    }

                    let bandStartX = x(bandStartAbs) - x(chromStartUpdated);
                    let bandEndX = x(bandEndAbs) - x(chromStartUpdated);

                    let bandHeight = height - margin.bottom - margin.top - 10;

                    //get the intensity based on the gieStain number after gpos
                    let intensity = band.gieStain.replace('gpos', '')/100;

                    //create my band rectangle
                    chromosomeGroup.append('rect')
                        .attr('x', function(){
                            return bandStartX;
                        })
                        .attr('width', function(){
                            return bandEndX - bandStartX;
                        })
                        .attr('height', bandHeight)
                        .attr('transform', `translate(0, 17)`)
                        .attr('fill', chromosomeColor)
                        .attr('fill-opacity', intensity)
                        .raise();
                }
            }

            //add the labels
            chromosomeGroup.append('text')
                .attr('x', (x(chromEndUpdated) - x(chromStartUpdated) - 6)/2)
                //if the label is two characters long, move it over a bit so it's centered
                .attr('transform', function() {
                    if (chr.length == 2) {
                        return `translate(${-4}, 0)`;
                    }
                })
                .attr('y', height - margin.bottom - margin.top - 3)
                .text(chr)
                .attr('font-size', "14px")
                .attr('fill', chromosomeColor);
        };
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
            brushRec.attr('fill', 'red')
                .attr('fill-opacity', 0.2)
                .attr('stroke', 'red');
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
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
        }
    }

    const margin = {top: 20, right: 10, bottom: 20, left: 10};

    const svg = d3.create('svg')
        .attr('viewBox', [0, 0, width, height])
        .attr('class', 'chrom-select-bar-d3')
        .attr('width', width)
        .attr('height', height);

    let { chromosomeMap, genomeSize } = _genChromosomeAccumulatedMap(chromosomes);

    let x = d3.scaleLinear()
        .domain([0, genomeSize])
        .range([margin.left, width - margin.right]);

    if (selection) {
        if (selection.end - selection.start >= genomeSize) {
            selection = null;
        }
    }

    let xAxis = g => g
        .attr('transform', `translate(0, ${height - margin.bottom})`)
        .call(d3.axisBottom(x)
            .ticks(width / 80)
            .tickSizeOuter(0)
            .tickFormat(d => `${d / 1000000}Mb`));

    svg.append('g')
        .call(xAxis);

    _renderChromosomes(); //function that renders the actual chromosome sections of the chart

    //if there are points of interest render them
    if (pointsOfInterest) {
        _renderPointsOfInterest();
    }

    function _renderPointsOfInterest() {
        let tracMap = {
            1: false,
            2: false,
            3: false,
            4: false,
            5: false,
            6: false,
        };

        let poiMap = {};

        //iterate over the points of interest and render them
        for (let sv of pointsOfInterest) {
            //get the chromosome and position
            let chr = sv.chromosome;
            let start = sv.start;
            let end = sv.end;

            //get the corresponding chromosome from the accumulated map
            let chromosome = chromosomeMap.get(chr);
            let absoluteStart = chromosome.start + start;
            let absoluteEnd = chromosome.start + end;

            let pointColor = d3.interpolate('#1F68C1', '#A63D40')(absoluteEnd / genomeSize);

            //add the point of interest to the map with the absolute start and end as the key "absoluteStart-absoluteEnd"
            if (!poiMap[`${absoluteStart}-${absoluteEnd}`]) {
                poiMap[`${absoluteStart}-${absoluteEnd}`] = [sv];

                //create a new group for this point of interest
                let pointGroup = svg.append('g')
                    .attr('transform', `translate(${x(absoluteStart)}, 25)`)
                    .attr('class', 'point-group')
                    .attr('id', `poi-${chr}-${start}-${end}-group`);

                let currentTrac = 0;
            
                for (let x of Object.keys(tracMap)) {
                    if (tracMap[x] != false && (absoluteStart > tracMap[x])) {
                        tracMap[x] = absoluteEnd;
                        currentTrac = x;
                        break;
                    } else if (tracMap[x] != false && (absoluteStart < tracMap[x])) {
                        continue;
                    }

                    if (tracMap[x] == false) {
                        tracMap[x] = absoluteEnd;
                        currentTrac = x;
                        break;
                    }
                }
                
                let translateY = (currentTrac - 1) * 2;

                pointGroup.append('rect')
                    .attr('x', x(0) - margin.left)
                    .attr('width', function() {
                        //if the block is too small to see make it 2 pixels wide
                        if (x(end) - x(start) < 2) {
                            return 2;
                        }
                        return x(end) - x(start);
                    })
                    .attr('transform', `translate(0, ${translateY})`)
                    .attr('height', 1)
                    .attr('fill', pointColor);

            } else {
                //dont render the point of interest if it already exists
                poiMap[`${absoluteStart}-${absoluteEnd}`].push(sv);
            }
    

        }
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

        let genomeSize = accumulatedBP;
        let chromosomeMap = chromosomeAccumulatedMap;

        return {chromosomeMap, genomeSize};
    }

    function _renderChromosomes() {
        //render the chromosomes
        chromosomeMap.forEach((chromosome, chr) => {
            //create a new group for this chromosome
            let chromosomeGroup = svg.append('g')
                .attr('transform', `translate(${x(chromosome.start)}, 0)`)
                .attr('class', 'chromosome-group')
                .attr('id', `chr-${chr}-group`);

            let chromosomeColor = d3.interpolate('#1F68C1', '#A63D40')(chromosome.end / genomeSize);
                
            //add the chromosome bar
            chromosomeGroup.append('rect')
                .attr('x', 1)
                .attr('width', x(chromosome.end) - x(chromosome.start))
                .attr('height', height - margin.bottom - margin.top + 5)
                .attr('fill', chromosomeColor)
                .attr('stroke', 'white')
                .attr('fill-opacity', 0.3);

            let idioHeight = height - margin.bottom - margin.top - 8;
            let idioPosOffset = 16;

            if (!centromeres) {
                //add another rectangle slightly smaller and under the last one to start to make the idiograms
                chromosomeGroup.append('rect')
                    //class will be idiogram
                    .attr('class', 'upper-idiogram')
                    .attr('x', 1)
                    .attr('width', x(chromosome.end) - x(chromosome.start))
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
                        //start will be the absolute start of the centromere which is currently based on the chromosome start
                        //will need to add chr to the label to get the correct start
                        let centromereStart = chromosome.start + centromeres[chr].start;
                        let centromereEnd = chromosome.start + centromeres[chr].end;
                        //get the center of the centromere
                        let centromereCenter = (centromereEnd - centromereStart) / 2;
                        //then return here the width which will be the scaled value from the start of the centromere to the end of the centromere
                        return x(centromereStart + centromereCenter) - x(chromosome.start) - 1;
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
                    .attr('x', function(d){
                        //start will be the absolute start of the centromere which is currently based on the chromosome start
                        //will need to add chr to the label to get the correct start
                        let centromereStart = chromosome.start + centromeres[chr].start;
                        let centromereEnd = chromosome.start + centromeres[chr].end;
                        //get the center of the centromere
                        let centromereCenter = (centromereEnd - centromereStart) / 2;
                        //then return here the width which will be the scaled value from the start of the centromere to the end of the centromere
                        return x(centromereStart + centromereCenter) - x(chromosome.start);
                    })
                    .attr('width', function(d){
                        //start will be the absolute start of the centromere which is currently based on the chromosome start
                        //will need to add chr to the label to get the correct start
                        let centromereStart = chromosome.start + centromeres[chr].start;
                        let centromereEnd = chromosome.start + centromeres[chr].end;
                        //get the center of the centromere
                        let centromereCenter = (centromereEnd - centromereStart) / 2;
                        //then return here the width which will be the scaled value from the start of the centromere to the end of the centromere
                        return x(chromosome.end) - x(centromereEnd - centromereCenter);
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
                    let bandWidth = x(band.end) - x(band.start);
                    let bandHeight = height - margin.bottom - margin.top - 10;

                    //get the intensity based on the gieStain number after gpos
                    let intensity = band.gieStain.replace('gpos', '')/100;

                    //create my band rectangle
                    chromosomeGroup.append('rect')
                        .attr('x', x(band.start) - margin.left)
                        .attr('width', bandWidth)
                        .attr('height', bandHeight)
                        .attr('transform', `translate(0, 17)`)
                        .attr('fill', chromosomeColor)
                        .attr('fill-opacity', intensity)
                        .raise();
                }
            }

            //add the labels
            chromosomeGroup.append('text')
                .attr('x', (x(chromosome.end) - x(chromosome.start) - 6)/2)
                //if the label is two characters long, move it over a bit so it's centered
                .attr('transform', function() {
                    if (chr.length == 2) {
                        return `translate(${-4}, 0)`;
                    }
                })
                .attr('y', height - margin.bottom - margin.top - 2)
                .text(chr)
                .attr('font-size', "14px")
                .attr('fill', chromosomeColor);
        });
    }

    //render brush later so it's on top
    if (brush) {
        //if there is a selection then we want to brush to that selection
        if (selection) {
            console.log(selection);
            let start = selection.start;
            let end = selection.end;

            //selection will be in the base pair space so need to convert it to the pixel space
            let startPixel = x(start);
            let endPixel = x(end);
            
            let brush = d3.brushX()
                .extent([[margin.left, margin.bottom - height], [width - margin.right, height]])
                .on('end', brushed);

            svg.append('g')
                .attr('height', height - margin.bottom - margin.top)
                .attr('class', 'brush-area')
                .call(brush)
                .raise();
            
            //set the brush to the selection but dont fire the callback
            svg.select('.brush-area').call(brush.move, [startPixel, endPixel]);
        } else {
            console.log('no selection');
            let brush = d3.brushX()
                .extent([[margin.left, margin.bottom - height], [width - margin.right, height]])
                .on('end', brushed);

            svg.append('g')
                .attr('height', height - margin.bottom - margin.top)
                .attr('class', 'brush-area')
                .call(brush)
                .raise();
        }
    }

    function brushed(event) {
        let brushSelection = event.selection;
        //selection will be in the pixel space so need to convert it to the base pair space
        let start = x.invert(brushSelection[0]);
        let end = x.invert(brushSelection[1]);

        //send the rounded start and end to the callback to the nearest whole number
        start = Math.round(start);
        end = Math.round(end);

        if (start == selection.start && end == selection.end) {
            console.log('selection is the same as the previous selection');
            return;
        }

        //if the selection is null then the user has clicked off the brush so don't do anything
        if (!brushSelection || start == end) {
            //ensure we return back the whole genome
            selectionCallback({start: 0, end: genomeSize});
            return;
        }

        if (selectionCallback) {
            selectionCallback({start, end});
        }
    }
    
    return svg.node();
}
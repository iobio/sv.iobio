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
                //if the new chr has a _ then skip it or if it's M or Un, or if the name doesnt have a . in it then skip it
                if (newChr == 'M' || newChr == 'Un' || newChr.includes('_')) {
                    continue;
                }
                if (band.name.includes('.')){
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

    let xAxis = g => g
        .attr('transform', `translate(0, ${height - margin.bottom})`)
        .call(d3.axisBottom(x)
            .ticks(width / 80)
            .tickSizeOuter(0)
            .tickFormat(d => `${d / 1000000}Mb`));

    svg.append('g')
        .call(xAxis);

    _renderChromosomes(); //function that renders the actual chromosome sections of the chart

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
        let chromosomeBars = svg.append('g')
            .selectAll('g')
            .data(chromosomes)
            .join('g')
            .attr('transform', d => `translate(${x(chromosomeMap.get(d.chr).start)}, 0)`);

        chromosomeBars.append('rect')
            .attr('x', 1)
            .attr('width', d => x(chromosomeMap.get(d.chr).end) - x(chromosomeMap.get(d.chr).start) - 1)
            .attr('height', height - margin.bottom - margin.top)
            .attr('fill', function(d) {
                //iterate over the chromosomes and create the arcs
                let startColor = '#1F68C1'
                let endColor = '#A63D40'

                let percentage = chromosomeMap.get(d.chr).end / genomeSize;
                let color = d3.interpolate(startColor, endColor)(percentage);
                return color;
            })
            .attr('fill-opacity', 0.3);
        
        if (!centromeres) {
            //add another rectangle slightly smaller and under the last one to start to make the idiograms
            chromosomeBars.append('rect')
                //class will be idiogram
                .attr('class', 'upper-idiogram')
                .attr('x', 1)
                .attr('width', d => x(chromosomeMap.get(d.chr).end) - x(chromosomeMap.get(d.chr).start) - 1)
                .attr('height', height - margin.bottom - margin.top - 10)
                .attr('transform', `translate(0, 18)` )
                .attr('fill', 'white')
                .attr('stroke', function(d) {
                    //iterate over the chromosomes and create the arcs
                    let startColor = '#1F68C1'
                    let endColor = '#A63D40'

                    let percentage = chromosomeMap.get(d.chr).end / genomeSize;
                    let color = d3.interpolate(startColor, endColor)(percentage);
                    return color;
                })
                //make the corners rounded
                .attr('rx', 3);
        } else {
            chromosomeBars.append('rect')
                //class will be idiogram
                .attr('class', 'upper-idiogram-parm')
                .attr('x', 1)
                .attr('width', function(d){
                    //start will be the absolute start of the centromere which is currently based on the chromosome start
                    //will need to add chr to the label to get the correct start
                    let centromereStart = chromosomeMap.get(d.chr).start + centromeres[d.chr].start;
                    let centromereEnd = chromosomeMap.get(d.chr).start + centromeres[d.chr].end;
                    //get the center of the centromere
                    let centromereCenter = (centromereEnd - centromereStart) / 2;
                    //then return here the width which will be the scaled value from the start of the centromere to the end of the centromere
                    return x(centromereStart + centromereCenter) - x(chromosomeMap.get(d.chr).start) - 1;
                })
                .attr('height', height - margin.bottom - margin.top - 9)
                .attr('transform', `translate(0, 17)` )
                .attr('fill', 'white')
                .attr('stroke', function(d) {
                    //iterate over the chromosomes and create the arcs
                    let startColor = '#1F68C1'
                    let endColor = '#A63D40'

                    let percentage = chromosomeMap.get(d.chr).end / genomeSize;
                    let color = d3.interpolate(startColor, endColor)(percentage);
                    return color;
                })
                //make the corners rounded
                .attr('rx', 3);
            
            //now to make the q arm
            chromosomeBars.append('rect')
                //class will be idi
                .attr('class', 'lower-idiogram-qarm')
                .attr('x', function(d){
                    //start will be the absolute start of the centromere which is currently based on the chromosome start
                    //will need to add chr to the label to get the correct start
                    let centromereStart = chromosomeMap.get(d.chr).start + centromeres[d.chr].start;
                    let centromereEnd = chromosomeMap.get(d.chr).start + centromeres[d.chr].end;
                    //get the center of the centromere
                    let centromereCenter = (centromereEnd - centromereStart) / 2;
                    //then return here the width which will be the scaled value from the start of the centromere to the end of the centromere
                    return x(centromereStart + centromereCenter) - x(chromosomeMap.get(d.chr).start);
                })
                .attr('width', function(d){
                    //start will be the absolute start of the centromere which is currently based on the chromosome start
                    //will need to add chr to the label to get the correct start
                    let centromereStart = chromosomeMap.get(d.chr).start + centromeres[d.chr].start;
                    let centromereEnd = chromosomeMap.get(d.chr).start + centromeres[d.chr].end;
                    //get the center of the centromere
                    let centromereCenter = (centromereEnd - centromereStart) / 2;
                    //then return here the width which will be the scaled value from the start of the centromere to the end of the centromere
                    return x(chromosomeMap.get(d.chr).end) - x(centromereEnd - centromereCenter);
                })
                .attr('height', height - margin.bottom - margin.top - 9)
                .attr('transform', `translate(0, 17)` )
                .attr('fill', 'white')
                .attr('stroke', function(d) {
                    //iterate over the chromosomes and create the arcs
                    let startColor = '#1F68C1'
                    let endColor = '#A63D40'

                    let percentage = chromosomeMap.get(d.chr).end / genomeSize;
                    let color = d3.interpolate(startColor, endColor)(percentage);
                    return color;
                })
                //make the corners rounded
                .attr('rx', 3);   
        }

        //if there are bands render them as well follow the color scheme of the idiograms
        if (bands) {
            for (let band of bands) {
                let bandStart = chromosomeMap.get(band.chr).start + band.start;
                let bandEnd = chromosomeMap.get(band.chr).start + band.end;
                let bandWidth = x(bandEnd) - x(bandStart);
                let bandHeight = height - margin.bottom - margin.top - 11;

                //only if gieStain starts with gpos will it be rendered
                if (band.gieStain.startsWith('gpos')) {
                    //if the band is outside of the total genome size then skip it console.log it
                    if (bandStart > genomeSize || bandEnd > genomeSize) {
                        console.log('band start is greater than genome size');
                        console.log(band);
                        continue;
                    }

                    //get the intensity based on the gieStain number after gpos
                    let intensity = band.gieStain.replace('gpos', '')/100;
                    chromosomeBars.append('rect')
                        .attr('x', x(bandStart) - x(chromosomeMap.get(band.chr).start))
                        .attr('width', bandWidth)
                        .attr('height', bandHeight)
                        .attr('transform', `translate(0, 18)`)
                        .attr('fill', function(d) {
                            //iterate over the chromosomes and create the arcs
                            let startColor = '#1F68C1'
                            let endColor = '#A63D40'

                            let percentage = chromosomeMap.get(d.chr).end / genomeSize;
                            let color = d3.interpolate(startColor, endColor)(percentage);
                            return color;
                        })
                        .attr('fill-opacity', intensity);

                }
            }
        }

        //add the labels
        chromosomeBars.append('text')
            .attr('x', d => (x(chromosomeMap.get(d.chr).end) - x(chromosomeMap.get(d.chr).start) - 6)/2)
            //if the label is two characters long, move it over a bit so it's centered
            .attr('transform', function(d) {
                if (d.chr.length == 2) {
                    return `translate(${-4}, 0)`;
                }
            })
            .attr('y', height - margin.bottom - margin.top - 3)
            .text(d => d.chr)
            .attr('font-size', "15px")
            .attr('fill', function(d) {
                let startColor = '#1F68C1'
                let endColor = '#A63D40'

                let percentage = chromosomeMap.get(d.chr).end / genomeSize;
                let color = d3.interpolate(startColor, endColor)(percentage);
                return color;
        });
    }
    
    return svg.node();
}
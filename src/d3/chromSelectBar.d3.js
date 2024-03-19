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

export default function chromSelectBar(parentElementTag, refChromosomes, brush=false, options=null) {
    let parentElement = d3.select(parentElementTag);

    let width = parentElement.node().clientWidth;
    let height = parentElement.node().clientHeight;
    let chromosomes = refChromosomes;
    let bands = null;
    let centromeres = null;
    let pointsOfInterest = null;
    let maximumSelection = 1000000;
    let selectionCallback = null;

    if (options) {
        if (options.centromeres) {
            centromeres = options.centromeres;
        }
        if (options.bands) {
            bands = options.bands;
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
            .tickFormat(d => `${d / 1000}kb`));

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

            //add the labels
            chromosomeBars.append('text')
                .attr('x', d => (x(chromosomeMap.get(d.chr).end) - x(chromosomeMap.get(d.chr).start) - 6)/2)
                //if the label is two characters long, move it over a bit so it's centered
                .attr('transform', function(d) {
                    if (d.chr.length == 2) {
                        return `translate(${-4}, 0)`;
                    }
                })
                .attr('y', height - margin.bottom - margin.top -5)
                .text(d => d.chr)
                .attr('font-size', '15px')
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
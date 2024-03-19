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

    //We will need to loop over the chromosomes (which are not optional) and we will need to get the cumulative length of the chromosomes and the maximum length of the whole genome
    //Create also a cumulativeMap that will store the cumulative length of the chromosomes starts and ends for easy access similar to the circos plot

    
    return svg.node();
}
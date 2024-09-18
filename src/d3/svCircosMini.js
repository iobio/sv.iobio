import * as d3 from 'd3';

export default function svCircosMini(parentTag, refChromosomes, options=null) {

    //Reference Variables (chromosomes)
    let chromosomes = refChromosomes;
    let centromeres = null;

    //Zoom Variables
    let zoomedCallback = null;
    let zoomedSection = null;
    let zoomZone = null;

    let { chromosomeAccumulatedMap, bpGenomeSize } = _genChromosomeAccumulatedMap(chromosomes);
    
    let originZoom = {
        start: 0,
        end: bpGenomeSize,
        size: bpGenomeSize
    };
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
        if (options.zoomedCallback) {
            zoomedCallback = options.zoomedCallback;
        }

        if (options.zoomZone) {
            zoomZone = options.zoomZone;
        }

        zoomedSection = originZoom;
    }

    _setBaseStyles();

    const container = d3.select(parentTag);

    // width and height of the container will be the width and height of the svg if it exists otherwise it will be 0
    let width = 1;
    let height = 1;

    if (container.node()) {
        width = container.node().clientWidth;
        height = container.node().clientHeight;
    }

    const svg = d3.create('svg')
        .attr('viewBox', [0, 0, width, height])
        .attr('id', 'sv-circos-mini')
        .attr('width', width)
        .attr('height', height);

    const maxRadius = (Math.min(width, height) / 2) - (Math.min(width, height) / 16);

    const center = {
        x: width / 2,
        y: height / 2
    };
    
    let startAngleRad = 1 * Math.PI / 180;
    let endAngleRad = 359 * Math.PI / 180;
    
    // Change the range to radians (0 to 2π)
    let angleScale = d3.scaleLinear()
        .domain([originZoom.start, originZoom.end])
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

    //iterate over the chromosomes and create the arcs
    let startColor = '#1F68C1'
    let endColor = '#A63D40'

    //TODO: If we were able to specify options on the track such as minRadius, maxRadius, color, background (on/off), label etc we could make this more dynamic and have one function
    _renderChromosomes([originZoom.start, originZoom.end], chromosomes);

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

        let alternate = false;

        for (let chromosome of chromosomeList) {
            let chromosomeName = chromosome.chr;
            let chrom = chromosomeAccumulatedMap.get(chromosomeName)

            let chromStart = chrom.start;
            let chromEnd = chrom.end;

            //Centromere start and end
            let centromere = chromosome.centromere;
            let centAbStart = chromStart + centromere.start;
            let centAbEnd = chromStart + centromere.end

            let startAngle = angleScale(chromStart)
            let endAngle = angleScale(chromEnd);

            //Calulate the color based on the start color and end color and the percentage of the genome that the chromosome represents
            let percentage = chromEnd / bpGenomeSize;
            let color = d3.interpolate(startColor, endColor)(percentage);

            let centromereStartAngle = angleScale(centAbStart);
            let centromereCenterAngle = angleScale((centAbStart + centAbEnd) / 2);
            let centromereEndAngle = angleScale(centAbEnd);

            //create a group for each chromosome and the label
            const g = svg.append('g');

            let arcDrag = d3.drag()
                .on('start', function (event, d) {
                    //if there is aready a brush then remove it
                    d3.select('.arc-brush-mini').remove();
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
                    let brushGroup = d3.select('.brush-group-mini');

                    brushGroup.append('path')
                        .datum({startAngle: startAngle, endAngle: endAngle})
                        .attr('d', arcBrush)
                        .attr('transform', `translate(${width / 2}, ${height / 2})`)
                        .attr('fill', 'grey')
                        .attr('fill-opacity', 0.4)
                        .attr('stroke', 'red')
                        .attr('stroke-width', 1)
                        .attr('class', 'arc-brush-mini')
                        .raise();
                })
                .on('drag', function (event, d) {
                    //grab the arc-brush and update the end angle based on the event
                    let arcBrush = svg.select('.arc-brush-mini');
                    let x = event.x - center.x;
                    let y = event.y - center.y;
                    let newAngle = Math.atan2(y, x) + Math.PI/2;

                    // Redefine the arc with the updated endAngle
                    arcBrush.attr('d', d3.arc()
                        .innerRadius(maxRadius * 0.9)
                        .outerRadius(maxRadius * 1)
                        .startAngle(arcBrush.datum().startAngle)
                        .endAngle(newAngle)
                        .padAngle(0)
                        .cornerRadius(2));
                })
                .on('end', function (event, d) {
                    //get the start and end of the brush arc so that we can zoom in on that section
                    let arcBrush = svg.select('.arc-brush-mini');

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
                        d3.select('.arc-brush-mini').remove();
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

            const arcP = d3.arc()
                .innerRadius(maxRadius * 0.9)
                .outerRadius(maxRadius)
                .startAngle(startAngle)
                .endAngle(centromereCenterAngle)
                .padAngle(0)
                .padRadius(2)
                .cornerRadius(function(d, i) {
                    return 4;
                });

            const arcQ = d3.arc()
                .innerRadius(maxRadius * 0.9)
                .outerRadius(maxRadius)
                .startAngle(centromereCenterAngle)
                .endAngle(endAngle)
                .padAngle(0)
                .padRadius(2)
                .cornerRadius(function(d, i) {
                    return 4;
                });

            chromosomeGroup.append('path')
                .datum({startAngle: startAngle, endAngle: centromereEndAngle})
                .attr('d', arcP)
                .attr('transform', `translate(${width / 2}, ${height / 2})`)
                .attr('fill', 'white')
                .attr('stroke', color)
                .attr('stroke-width', .5)
                .attr('class', 'chromosome-p');
            
            chromosomeGroup.append('path')
                .datum({startAngle: centromereEndAngle, endAngle: endAngle})
                .attr('d', arcQ)
                .attr('transform', `translate(${width / 2}, ${height / 2})`)
                .attr('fill', 'white')
                .attr('stroke', color)
                .attr('stroke-width', .5)
                .attr('class', 'chromosome-q');

            let arcInner;
            let arcOuter;
            if (alternate) {
                arcInner = maxRadius * .76;
                arcOuter = maxRadius * 1.05;
            } else {
                arcInner = maxRadius * .85;
                arcOuter = maxRadius * 1.11;
            }

            //create an arc from the start to the end of the chromosome
            let lineArc = d3.arc()
                .innerRadius(arcInner)
                .outerRadius(arcOuter)
                .startAngle(startAngle)
                .endAngle(endAngle)
                .padAngle(0)
                .cornerRadius(2);
            
            chromosomeGroup.append('path')
                .datum({startAngle: startAngle, endAngle: endAngle})
                .attr('d', lineArc)
                .attr('transform', `translate(${width / 2}, ${height / 2})`)
                .attr('fill', color)
                .attr('fill-opacity', 0.1)
                .attr('stroke', color)
                .attr('stroke-width', .25)
                .attr('class', 'chromosome-background')
                .lower();

            let middle = (startAngle + endAngle) / 2;
            let textStartAngle = middle - Math.PI / 2; //text is horizontal so we need to rotate it 90 degrees
            let isSmallerSection = Math.min(width, height) <= 700;

            const textAngle = textStartAngle; 

            let textRadius;
            if (alternate) {
                textRadius = maxRadius * .82;
                alternate = false;
            } else {
                textRadius = maxRadius * 1.05;
                alternate = true;
            }
            
            const textX = (center.x) + ((textRadius) * Math.cos(textAngle));
            const textY = (center.y) + ((textRadius) * Math.sin(textAngle));

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

                //put a small white circle behind the text to make it more readable
                g.append('circle')
                    .attr('cx', textX)
                    .attr('cy', textY)
                    .attr('r', 8)
                    .attr('transform', `translate(0, -1)`)
                    .attr('fill', 'transparent')
                    .attr('class', 'chromosome-label')
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
                    })
                    .on('mouseover', function (event, d) {
                        let backgroundChrom = d3.select(this.parentNode).select('.chromosome-background');
                        backgroundChrom.attr('fill-opacity', 0.5);
                    })
                    .on('mouseout', function (event, d) {
                        let backgroundChrom = d3.select(this.parentNode).select('.chromosome-background');
                        backgroundChrom.attr('fill-opacity', 0.1);
                    });
        }
        //append a new group for the brush to be added to
        svg.append('g')
            .attr('class', 'brush-group-mini');

        //if there is a zoom zone then add an arc to show the zoom zone
        if (zoomZone) {
            let startAngle = angleScale(zoomZone.start);
            let endAngle = angleScale(zoomZone.end);

            let arc = d3.arc()
                .innerRadius(maxRadius * 0.9)
                .outerRadius(maxRadius * 1)
                .startAngle(startAngle)
                .endAngle(endAngle)
                .padAngle(0)
                .cornerRadius(2);

            svg.select('.brush-group-mini').append('path')
                .datum({startAngle: startAngle, endAngle: endAngle})
                .attr('d', arc)
                .attr('transform', `translate(${width / 2}, ${height / 2})`)
                .attr('fill', 'grey')
                .attr('fill-opacity', 0.4)
                .attr('stroke', 'red')
                .attr('stroke-width', 1)
                .attr('class', 'arc-brush-mini')
                .raise();
        } else {
            //put one with the origin zoom
            let startAngle = angleScale(originZoom.start);
            let endAngle = angleScale(originZoom.end);

            let arc = d3.arc()
                .innerRadius(maxRadius * 0.9)
                .outerRadius(maxRadius * 1)
                .startAngle(startAngle)
                .endAngle(endAngle)
                .padAngle(0)
                .cornerRadius(2);

            svg.select('.brush-group-mini').append('path')
                .datum({startAngle: startAngle, endAngle: endAngle})
                .attr('d', arc)
                .attr('transform', `translate(${width / 2}, ${height / 2})`)
                .attr('fill', 'grey')
                .attr('fill-opacity', 0.4)
                .attr('stroke', 'red')
                .attr('stroke-width', 1)
                .attr('class', 'arc-brush-mini')
                .raise();
        }
    }

    function updateZoomZone(zoomZone) {
        //if there is no zoomZone start or end set them to the start and end of the genome
        if (!zoomZone) {
            zoomZone = {};
        }

        if (!zoomZone.start) {
            zoomZone.start = originZoom.start;
        }

        if (!zoomZone.end) {
            zoomZone.end = originZoom.end;
        }

        // Create the arc generator outside the functions
        const arcGenerator = d3.arc()
            .innerRadius(maxRadius * 0.9)
            .outerRadius(maxRadius * 1)
            .padAngle(0)
            .cornerRadius(2);

        // Select the existing arc-brush-mini
        let arcBrush = d3.select('.arc-brush-mini');
        if (!arcBrush.empty()) {
            let d = arcBrush.datum();
            let newStartAngle = angleScale(zoomZone.start);
            let newEndAngle = angleScale(zoomZone.end);

            arcBrush.datum({ ...d, newStartAngle, newEndAngle })
                .transition()
                .duration(500)
                .attrTween('d', function(d) {
                    let interpolateStart = d3.interpolate(d.startAngle, d.newStartAngle);
                    let interpolateEnd = d3.interpolate(d.endAngle, d.newEndAngle);
                    return function(t) {
                        let currentStartAngle = interpolateStart(t);
                        let currentEndAngle = interpolateEnd(t);
                        return arcGenerator({
                            startAngle: currentStartAngle,
                            endAngle: currentEndAngle
                        });
                    };
                })
                .on('end', function() {
                    // Update the datum with the new angles after the transition
                    arcBrush.datum({
                        startAngle: newStartAngle,
                        endAngle: newEndAngle
                    });
                });
        } else {
            // Create a new arc-brush-mini
            let startAngle = angleScale(zoomZone.start);
            let endAngle = angleScale(zoomZone.end);

            let arcData = { startAngle, endAngle };

            d3.select('.brush-group-mini').append('path')
                .datum(arcData)
                .attr('d', arcGenerator)
                .attr('transform', `translate(${width / 2}, ${height / 2})`)
                .attr('fill', 'grey')
                .attr('fill-opacity', 0.4)
                .attr('stroke', 'red')
                .attr('stroke-width', 1)
                .attr('class', 'arc-brush-mini')
                .raise();
        }
    }

    return {svg: svg.node(), updateZoomZone: updateZoomZone};
}


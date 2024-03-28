import * as d3 from 'd3';

export default function svCircos(parentTag, refChromosomes, data=null, options=null) {
    let chromosomes = refChromosomes;
    let centromeres = null;
    let bands = null;

    let { chromosomeAccumulatedMap, bpGenomeSize } = _genChromosomeAccumulatedMap(chromosomes);

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
    }

    setBaseStyles();
    let svData = data;

    const container = d3.select(parentTag);

    //Setting the genome origin start, end, and size
    let originZoom = {
        start: 0,
        end: bpGenomeSize,
        size: bpGenomeSize
    };

    //Zoomed section will have a start, end, and size (we will start with clicking a chromosome and getting the start end and size of that later maybe brush)
    let zoomedSection = originZoom;

    // width and height of the container will be the width and height of the svg
    let width = container.node().clientWidth;
    let height = container.node().clientHeight;

    const svg = d3.create('svg')
        .attr('viewBox', [0, 0, width, height])
        .attr('class', 'svCircos-d3')
        .attr('width', width)
        .attr('height', height);

    const maxRadius = (Math.min(width, height) / 2) - 30;
    const maxDiameter = maxRadius * 2;

    const maxCircumference = maxDiameter * Math.PI;

    const center = {
        x: width / 2,
        y: height / 2
    };
    
    // Change the range to radians (0 to 2π)
    let angleScale = d3.scaleLinear()
        .domain([zoomedSection.start, zoomedSection.end])
        .range([0, 2 * Math.PI]);

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

            //reset the charts angle scale
            angleScale = d3.scaleLinear()
                .domain([zoomedSection.start, zoomedSection.end])
                .range([0, 2 * Math.PI]);

            //get selected-chromosome and remove it if
            let selected = d3.select('.selected-chromosome');
            if (selected) {
                selected.classed('selected-chromosome', false);
            }

            //clear all the tracks and render the new tracks
            svg.selectAll('line').remove();
            renderTracks([zoomedSection.start, zoomedSection.end], svData);

            //clear all the chromosomes and render the new chromosomes
            svg.selectAll('.chromosome').remove();
            //clear all the chromosome labels
            svg.selectAll('.chromosome-label').remove();
            _renderChromosomes([zoomedSection.start, zoomedSection.end], chromosomes);

            //also reset the image to the dna.svg
            centerSymbolGroup.select('image')
                .attr('xlink:href', '/dna.svg')
                .attr('x', center.x - 10)
                .attr('y', center.y - 10)
                .attr('width', 20)
                .attr('height', 20);
        });

    //in the center of the chart we will have a circle that is 10px diameter
    centerSymbolGroup.append('circle')
        .attr('cx', center.x)
        .attr('cy', center.y)
        .attr('r', 15)
        .attr('fill', '#1F68C1');
    
    //on top of this circle we will render the dna.svg that we have /dna.svg
    centerSymbolGroup.append('image')
        .attr('xlink:href', '/dna.svg')
        .attr('x', center.x - 10)
        .attr('y', center.y - 10)
        .attr('width', 20)
        .attr('height', 20);
    
    //iterate over the chromosomes and create the arcs
    let startColor = '#1F68C1'
    let endColor = '#A63D40'

    _renderChromosomes([zoomedSection.start, zoomedSection.end], chromosomes);

    if (svData === null) {
        //fetch it here
        fetch('../vcf.json')
        .then(response => response.json())
        .then(data => {
            svData = data;
            renderTracks([zoomedSection.start, zoomedSection.end], svData)
        });
    } else {
        //use the data we have from the app
        renderTracks([zoomedSection.start, zoomedSection.end], svData);
    }

//HELPER FUNCTIONS
    function setBaseStyles() {
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
            let chromEnd = chrom.end;

            let startAngle = angleScale(chromStart)
            let endAngle = angleScale(chromEnd);

            let centromere = chromosome.centromere;
            let centromereStartAngle = angleScale(chromStart + centromere.start);
            let centromereCenterAngle = angleScale(chromStart + (centromere.start + centromere.end) / 2);
            let centromereEndAngle = angleScale(chromStart + centromere.end);

            if (chromEnd > range[1] || chromStart < range[0]) {
                //dont render this chromosome at all
                continue;
            }

            //Calulate the color based on the start color and end color and the percentage of the genome that the chromosome represents
            let percentage = chromEnd / bpGenomeSize;
            let color = d3.interpolate(startColor, endColor)(percentage);

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

                    //reset the charts angle scale
                    angleScale = d3.scaleLinear()
                        .domain([zoomedSection.start, zoomedSection.end])
                        .range([0, 2 * Math.PI]);

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
                    renderTracks([zoomedSection.start, zoomedSection.end], svData);

                    //get our centerSymbolGroup and change the symbol to our magnify-out.svg
                    centerSymbolGroup.select('image')
                        .attr('xlink:href', '/magnify-out.svg')
                        .attr('x', center.x - 10)
                        .attr('y', center.y - 10)
                        .attr('width', 20)
                        .attr('height', 20);
                });

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
            
            if (bands){
                //filter the bands to only include the bands that are in the range
                let filteredBands = bands.filter(band => {
                    return band.chr === chromosome.chr.replace('chr', '');
                });

                for (let band of filteredBands) {
                    let bandStartAngle = angleScale(chromStart + band.start);
                    let bandEndAngle = angleScale(chromStart + band.end);

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
                }
            }
            
            //create an arc from the start to the end of the chromosome
            let lineArc = d3.arc()
                .innerRadius(maxRadius * 1.05)
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
                .range([0, 2 * Math.PI]);

            let textStartAngle = textAngleScale(chromStart);
            let textEndAngle = textAngleScale(chromEnd);
            
            let isSmallerSection = Math.min(width, height) <= 700;
            let textRadiusOffset = 10; //there is an offset to get the text more in the middle and if the section is smaller then we need to adjust the offset a little

            if (isSmallerSection){
                textRadiusOffset = 7;
            }

            const textAngle = (textStartAngle + textEndAngle) / 2 - Math.PI / 2; // -90 degrees to rotate the text because the text is horizontal and the arc is vertical
            const textRadius = maxRadius + textRadiusOffset;
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

    function renderTracks(range, data, tracks=null) {
        for (let variant of data) {
            //each variant is going to have a POS and a #CHROM property, we have the accumulated start and end for each chromosome
            //POS is the position of the variant in the chromosome so we can use that to get an angle for the variant
            let accPos = chromosomeAccumulatedMap.get(variant['chromosome']).start + variant['start'];

            if (accPos < range[0] || accPos > range[1]) {
                continue;
            }

            let angle = angleScale(accPos) - Math.PI / 2; // -90 deg in radians because the circle starts at 3 o'clock
            let radius = maxRadius * 0.84;

            // Calculate the central point of the line
            let centerX = center.x + (radius * Math.cos(angle));
            let centerY = center.y + (radius * Math.sin(angle));

            //take the info from the variant and look for 'AF=' get the number after that but before the ';' and use the inverse of that as the line len
            let info = variant.info;
            let af = info.Max_AF;

            let lineLength = 1
            if (af && !isNaN(af)) {
                //Some of my test files have an AF that is two numbers I'm not certain why those wont get this variable they'll have 1
                lineLength = 1 + (1 - af) *10;
            }

            let x1 = centerX;
            let y1 = centerY;
            let x2 = centerX + (lineLength * Math.cos(angle));
            let y2 = centerY + (lineLength * Math.sin(angle));

            // Append the line to the SVG
            svg.append('line')
                .attr('x1', function(d) {
                    
                    return x1
                })
                .attr('y1', function(d) {
                    
                    return y1
                })
                .attr('x2', function(d) {
                    
                    return x2
                })
                .attr('y2', function(d) {

                    return y2
                })
                .attr('stroke', function (d) {
                    let color = 'blue';
                    if (variant.type === 'DEL') {
                        color = "red";
                    }
                    if (variant.type === 'DUP') {
                        color = "green";
                    }
                    return color;
                })
                .attr('opacity', function (d) {
                    let opacity = 1;
                    if (af) {
                        opacity = 1 - af;
                    }
                    return opacity;
                })
                .attr('stroke-width', function(d) {
                    //if the range is less than 1000000 then make the stroke width 4 otherwise make it 1
                    if (range[1] - range[0] <= 248000000) {
                        return 3;
                    }

                    return 1;
                
                }) // Set the stroke width to make the line visible
                .on('mouseover', function (event, d) {
                    //increase the lenth of the line on mouseover so increase x and y 2 by 5
                    let longer_x2 = centerX + (lineLength + 10) * Math.cos(angle);
                    let longer_y2 = centerY + (lineLength + 10) * Math.sin(angle);
                    d3.select(this)
                        .transition()
                        .duration(20)
                        .attr('x2', longer_x2)
                        .attr('y2', longer_y2);
                    console.log(variant);
                })
                .on('mouseout', function (event, d) {
                    d3.select(this)
                        .transition()
                        .duration(20)
                        .attr('x2', x2)
                        .attr('y2', y2);
                });
        }
    }
    return svg.node();
}
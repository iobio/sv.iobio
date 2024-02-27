import * as d3 from 'd3';

export default function svCircos() {
    //Create a list of human chromosomes to be used as default
    const chromosomeList = [
        {name: 'chr1', bp: 248000000}, {name: 'chr2', bp: 242000000}, {name: 'chr3', bp: 199000000},
        {name: 'chr4', bp: 192000000}, {name: 'chr5', bp: 181000000}, {name: 'chr6', bp: 171000000},
        {name: 'chr7', bp: 159000000}, {name: 'chr8', bp: 146000000}, {name: 'chr9', bp: 141000000},
        {name: 'chr10', bp: 136000000}, {name: 'chr11', bp: 135000000}, {name: 'chr12', bp: 134000000},
        {name: 'chr13', bp: 115000000}, {name: 'chr14', bp: 107000000}, {name: 'chr15', bp: 102000000},
        {name: 'chr16', bp: 90300000}, {name: 'chr17', bp: 81100000}, {name: 'chr18', bp: 78000000},
        {name: 'chr19', bp: 59100000}, {name: 'chr20', bp: 63000000}, {name: 'chr21', bp: 48100000},
        {name: 'chr22', bp: 51300000}, {name: 'chrX', bp: 155000000}, {name: 'chrY', bp: 59373566}
    ];

    const bpGenomeSize = 3095693981; //hg38

    function chart(parentTag, data=null) {
        setBaseStyles();
        let vcfData = data;

        const container = d3.select(parentTag);

        //Setting the genome origin start, end, and size
        let originZoom = {
            start: 0,
            end: bpGenomeSize,
            size: bpGenomeSize
        };

        //Zoomed section will have a start, end, and size (we will start with clicking a chromosome and getting the start end and size of that later maybe brush)
        let zoomedSection = originZoom;

        let paddingLeft = parseInt(container.style('padding-left'), 10);
        let paddingRight = parseInt(container.style('padding-right'), 10);
        let paddingTop = parseInt(container.style('padding-top'), 10);
        let paddingBottom = parseInt(container.style('padding-bottom'), 10);

        // width and height of the container will be the width and height of the svg
        let width = container.node().clientWidth;
        //take the padding into account
        width -= paddingLeft;
        width -= paddingRight;

        let height = container.node().clientHeight;
        //take the padding into account
        height -= paddingTop;
        height -= paddingBottom;

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
        const angleScale = d3.scaleLinear()
            .domain([0, bpGenomeSize])
            .range([0, 2 * Math.PI]);

        //make a group for the circle and the dna.svg
        let centerSymbolGroup = svg.append('g')
            .attr('cursor', 'pointer')
            .on('click', function (event, d) {
                //we will reset the zoomed section to the origin zoom eventually
                zoomedSection = originZoom;

                //get selected-chromosome and remove it if
                let selected = d3.select('.selected-chromosome');
                if (selected) {
                    selected.classed('selected-chromosome', false);
                }

                //clear all the tracks and render the new tracks
                svg.selectAll('line').remove();
                renderTracks([zoomedSection.start, zoomedSection.end], vcfData);

                //clear all the chromosomes and render the new chromosomes
                svg.selectAll('.chromosome').remove();
                renderChromosomes([zoomedSection.start, zoomedSection.end], chromosomeList);

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

        let chromosomeAccumulatedMap = _genChromosomeAccumulatedMap(chromosomeList)

        renderChromosomes([zoomedSection.start, zoomedSection.end], chromosomeList);

        if (vcfData === null) {
            //fetch it here
            fetch('../vcf.json')
            .then(response => response.json())
            .then(data => {
                vcfData = data;
                renderTracks([zoomedSection.start, zoomedSection.end], vcfData)
            });
        } else {
            //use the data we have from the app
            renderTracks([zoomedSection.start, zoomedSection.end], vcfData);
        }

        container.node().appendChild(svg.node());

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

                accumulatedBP += chromosome.bp;

                let chromEnd = accumulatedBP;
                chromosomeAccumulatedMap.set(chromosome.name.replace('chr', ''), {start: chromStart, end: chromEnd});
            }

            return chromosomeAccumulatedMap
        }

        function renderChromosomes(range, chromosomeList) {
            for (let chromosome of chromosomeList) {
                let chromosomeName = chromosome.name.replace('chr', '');
                let chrom = chromosomeAccumulatedMap.get(chromosomeName)
    
                let chromStart = chrom.start;
                let chromEnd = chrom.end;
    
                let startAngle = angleScale(chromStart)
                let endAngle = angleScale(chromEnd);

                if (chromEnd > range[1] || chromStart < range[0]) {
                    //dont render this chromosome at all
                    continue;
                }
    
                //Calulate the color based on the start color and end color and the percentage of the genome that the chromosome represents
                let percentage = chromEnd / bpGenomeSize;
                let color = d3.interpolate(startColor, endColor)(percentage);
    
                //create a group for each chromosome and the label
                const g = svg.append('g');
    
                const arc = d3.arc()
                    .innerRadius(maxRadius * 0.90)
                    .outerRadius(maxRadius)
                    .startAngle(startAngle)
                    .endAngle(endAngle)
                    .padAngle(0)
                    .cornerRadius(3);
    
                g.append('path')
                    .datum({startAngle: startAngle, endAngle: endAngle})
                    .attr('d', arc)
                    .attr('transform', `translate(${width / 2}, ${height / 2})`)
                    .attr('fill', color)
                    .attr('stroke', 'white')
                    .attr('stroke-width', 1)
                    .attr('class', 'chromosome')
                    .on('mouseover', function (event, d) {
                        //Had done a grow but it is somewhat odd so removed it for now
                        //make the cursor a pointer
                        d3.select(this).style('cursor', 'pointer');
                        //slightly increase the opacity
                        d3.select(this).attr('opacity', 0.7);
                    })
                    .on('mouseout', function (event, d) {
                        //make the cursor the default
                        d3.select(this).style('cursor', 'default');
                        //reset the opacity
                        d3.select(this).attr('opacity', 1);
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

                        //clear all the chromosomes and render the new chromosomes
                        svg.selectAll('.chromosome').remove();
                        renderChromosomes([zoomedSection.start, zoomedSection.end], chromosomeList);

                        //get the event target and set class list to selected-chromosome
                        let target = event.target;
                        target.classList.add('selected-chromosome');
    
                        //clear all the tracks and render the new tracks
                        svg.selectAll('line').remove();
                        renderTracks([zoomedSection.start, zoomedSection.end], vcfData);

    
                        console.log(zoomedSection)
    
                        //get our centerSymbolGroup and change the symbol to our magnify-out.svg
                        centerSymbolGroup.select('image')
                            .attr('xlink:href', '/magnify-out.svg')
                            .attr('x', center.x - 10)
                            .attr('y', center.y - 10)
                            .attr('width', 20)
                            .attr('height', 20);
                    });
    
                // Calculate the middle angle of the arc in radians
                const textAngle = (startAngle + endAngle) / 2 - Math.PI / 2; // -90 degrees to rotate the text because the text is horizontal and the arc is vertical
                const textRadius = maxRadius * 0.95;
                const textX = (center.x) + ((textRadius) * Math.cos(textAngle));
                const textY = (center.y) + ((textRadius) * Math.sin(textAngle));
    
                //take chr off the chromosome name
                let chrName = chromosome.name.replace('chr', '');
                g.append('text')
                    .attr('x', textX)
                    .attr('y', textY)
                    .attr('fill', 'white')
                    .attr('text-anchor', 'middle')
                    .attr('alignment-baseline', 'middle')
                    .text(chrName)
                    .style('pointer-events', 'none');
            }
        }

        function renderTracks(range, data, tracks=null) {
            for (let variant of data) {
                //each variant is going to have a POS and a #CHROM property, we have the accumulated start and end for each chromosome
                //POS is the position of the variant in the chromosome so we can use that to get an angle for the variant
                let accPos = chromosomeAccumulatedMap.get(variant['#CHROM']).start + variant['POS'];

                if (accPos < range[0] || accPos > range[1]) {
                    continue;
                }

                let angle = angleScale(accPos) - Math.PI / 2; // -90 deg in radians because the circle starts at 3 o'clock
                let radius = maxRadius * 0.84;

                // Calculate the central point of the line
                let centerX = center.x + (radius * Math.cos(angle));
                let centerY = center.y + (radius * Math.sin(angle));

                //take the info from the variant and look for 'AF=' get the number after that but before the ';' and use the inverse of that as the line len
                let info = variant.INFO;
                let afIndex = info.indexOf('AF=') + 3;
                let af = info.slice(afIndex, info.indexOf(';', afIndex));

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
                        let info = variant.INFO;
                        let svTypeKey = 'SVTYPE=';
                        let svTypeIndex = info.indexOf(svTypeKey) + svTypeKey.length;
                        let svTypeEndIndex = info.indexOf(';', svTypeIndex);
                        if (svTypeEndIndex === -1) { // SVTYPE might be the last entry in the string
                            svTypeEndIndex = info.length;
                        }
                        let svType = info.slice(svTypeIndex, svTypeEndIndex);
                    
                        if (svType.slice(0, 4) === 'DEL') {
                            color = "red";
                        }
                        if (svType.slice(0, 4) === 'DUP') {
                            color = "green";
                        }
                        return color;
                    })
                    .attr('opacity', function (d) {
                        let opacity = 1;
                        //take the info from the variant and look for 'AF=' get the number after that but before the ';' and use the inverse of that as the opacity
                        let info = variant.INFO;
                        let afIndex = info.indexOf('AF=') + 3;
                        let af = info.slice(afIndex, info.indexOf(';', afIndex));
                        if (af) {
                            opacity = 1 - af;
                        }
                        return opacity;
                    })
                    .attr('stroke-width', 1) // Set the stroke width to make the line visible
                    .on('mouseover', function (event, d) {
                        //increase the lenth of the line on mouseover so increase x and y 2 by 5
                        let longer_x2 = centerX + (lineLength + 10) * Math.cos(angle);
                        let longer_y2 = centerY + (lineLength + 10) * Math.sin(angle);
                        d3.select(this)
                            .transition()
                            .duration(20)
                            .attr('x2', longer_x2)
                            .attr('y2', longer_y2)
                            .attr('stroke-width', 1); // Increase the stroke width on mouseover
                        console.log(variant);
                    })
                    .on('mouseout', function (event, d) {
                        d3.select(this)
                            .transition()
                            .duration(20)
                            .attr('stroke-width', 1)
                            .attr('x2', x2)
                            .attr('y2', y2); // Reset the stroke width on mouseout
                    });
            }
        }
    }
    return chart;
}
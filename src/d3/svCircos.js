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

    function chart(parentTag) {
        const container = d3.select(parentTag);
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

        //iterate over the chromosomes and create the arcs
        let startbp = 0;
        let startAngle = angleScale(startbp);
        let accumulatedBP = 0;
        let endAngle = angleScale(accumulatedBP);
        let startColor = '#1F68C1'
        let endColor = '#A63D40'

        let chromosomeAccumulatedMap = new Map();

        for (let chromosome of chromosomeList) {
            let chromStart = accumulatedBP;

            accumulatedBP += chromosome.bp;

            let chromEnd = accumulatedBP;
            chromosomeAccumulatedMap.set(chromosome.name.replace('chr', ''), {start: chromStart, end: chromEnd});

            endAngle = angleScale(accumulatedBP);

            //Calulate the color based on the start color and end color and the percentage of the genome that the chromosome represents
            let percentage = accumulatedBP / bpGenomeSize;
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
                .on('mouseover', function (event, d) {
                    //do an animation that makes the arc inner radius bigger for a short time then go back to normal
                    d3.select(this)
                        .transition()
                        .duration(200)
                        .attr('d', d3.arc()
                            .innerRadius(maxRadius * 0.85)
                            .outerRadius(maxRadius)
                            .startAngle(d.startAngle)
                            .endAngle(d.endAngle)
                            .padAngle(0)
                            .cornerRadius(3)
                        )
                        .transition()
                        .duration(400)
                        .attr('d', d3.arc()
                            .innerRadius(maxRadius * 0.90)
                            .outerRadius(maxRadius)
                            .startAngle(d.startAngle)
                            .endAngle(d.endAngle)
                            .padAngle(0)
                            .cornerRadius(3)
                        );
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

            startAngle = endAngle;
        }

        let vcfData;

        fetch('../vcf.json')
            .then(response => response.json())
            .then(data => {
                vcfData = data;
                for (let variant of vcfData) {
                    //each variant is going to have a POS and a #CHROM property, we have the accumulated start and end for each chromosome
                    //POS is the position of the variant in the chromosome so we can use that to get an angle for the variant
                    let accPos = chromosomeAccumulatedMap.get(variant['#CHROM']).start + variant['POS'];
                    let angle = angleScale(accPos);
                    let radius = maxRadius * 0.80;
                    let x = center.x + (radius * Math.cos(angle));
                    let y = center.y + (radius * Math.sin(angle));
                    svg.append('circle')
                        .attr('cx', x)
                        .attr('cy', y)
                        .attr('r', 1)
                        .attr('fill', 'black');

                }
                console.log(vcfData);
            });
        
        
        container.node().appendChild(svg.node());
    }
    return chart;
}
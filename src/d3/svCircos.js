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
        
        // Change the range to radians (0 to 2π)
        const angleScale = d3.scaleLinear()
            .domain([0, bpGenomeSize])
            .range([0, 2 * Math.PI]);

        //iterate over the chromosomes and create the arcs
        let startbp = 1;
        let startAngle = angleScale(startbp);
        let accumulatedBP = 0;

        for (let chromosome of chromosomeList) {
            accumulatedBP += chromosome.bp;
            const endAngle = angleScale(accumulatedBP);

            const arc = d3.arc()
                .innerRadius(maxRadius * 0.95)
                .outerRadius(maxRadius)
                .startAngle(startAngle)
                .endAngle(endAngle)
                .padAngle(0.003)
                .cornerRadius(3);

            svg.append('path')
                .attr('d', arc)
                .attr('transform', `translate(${width / 2}, ${height / 2})`)
                .attr('fill', 'none')
                .attr('stroke', 'black')
                .attr('stroke-width', 1);

            // Calculate the middle angle of the arc in radians
            const textAngle = (startAngle + endAngle) / 2;
            const textRadius = maxRadius + 15;
            const textX = (width / 2) + (textRadius * Math.cos(textAngle));
            const textY = (height / 2) + (textRadius * Math.sin(textAngle));

            //take chr off the chromosome name
            let chrName = chromosome.name.replace('chr', '');
            svg.append('text')
                .attr('x', textX)
                .attr('y', textY)
                .attr('text-anchor', 'middle')
                .attr('alignment-baseline', 'middle')
                .text(chrName);

            startAngle = endAngle;
        }


    

        container.node().appendChild(svg.node());
    }
    return chart;
}
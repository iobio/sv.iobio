import * as d3 from "d3";

export default function chromSelectBar(parentElementTag, refChromosomes, options = null) {
    let parentElement = d3.select(parentElementTag);

    let width = parentElement.node().clientWidth - 5;
    let height = parentElement.node().clientHeight;
    let chromosomes = refChromosomes;
    let bands = null;
    let centromeres = null;
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
                let newKey = centromere.chr.replace("chr", "");
                newCentromeres[newKey] = centromere;
            }
            centromeres = newCentromeres;
        }
        if (options.bands) {
            bands = options.bands;

            let newBands = [];
            for (let band of bands) {
                let newChr = band.chr.replace("chr", "");

                //if the chr has a _ cut everything after it
                if (newChr.includes("_")) {
                    newChr = newChr.split("_")[0];
                }

                //if the new chr has a _ then skip it or if it's M or Un, or if the name doesnt have a . in it then skip it
                if (newChr == "M" || newChr == "Un") {
                    continue;
                }

                //if they are gneg they are going to be white so skip them ie they are not gpos
                if (!band.gieStain.includes("gpos")) {
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

    const margin = { top: 1, right: 10, bottom: 1, left: 10 };

    const svg = d3
        .create("svg")
        .attr("viewBox", [0, 0, width, height])
        .attr("class", "chrom-select-bar-d3")
        .attr("width", width)
        .attr("height", height);

    let { chromosomeMap, genomeSize } = _genChromosomeAccumulatedMap(chromosomes);

    let originZoom = {
        start: 0,
        end: genomeSize,
        size: genomeSize,
    };

    zoomedSelection = originZoom;

    //if the selection is the origin zoom then we want to set the selection to null
    if (selection && selection.start == 0 && selection.end == genomeSize) {
        selection = null;
    }

    let x = d3
        .scaleLinear()
        .domain([zoomedSelection.start, zoomedSelection.end])
        .range([margin.left, width - margin.right]);

    _renderChromosomes([zoomedSelection.start, zoomedSelection.end]); //function that renders the actual chromosome sections of the chart

    function _genChromosomeAccumulatedMap(chromosomeList) {
        let accumulatedBP = 0;

        let chromosomeAccumulatedMap = new Map();

        for (let chromosome of chromosomeList) {
            let chromStart = accumulatedBP;

            accumulatedBP += chromosome.length;

            let chromEnd = accumulatedBP;
            chromosomeAccumulatedMap.set(chromosome.chr, { start: chromStart, end: chromEnd });
        }

        let genomeSize = accumulatedBP;
        let chromosomeMap = chromosomeAccumulatedMap;

        return { chromosomeMap, genomeSize };
    }

    function _renderChromosomes(range) {
        let chromosomeGroups = [];
        for (let [chr, chromosome] of chromosomeMap) {
            //Chromosome start and end
            let chromosomeStart = chromosome.start;
            let chromosomeEnd = chromosome.end;

            // let centromereStart = chromosomeStart + centromeres[chr].start;
            // let centromereEnd = chromosomeStart + centromeres[chr].end;
            // let centromereCenter = (centromereEnd - centromereStart) / 2;

            //create a new group for this chromosome
            let chromosomeGroup = svg
                .append("g")
                .attr("transform", `translate(${x(chromosomeStart)}, 0)`)
                .attr("class", "chromosome-group")
                .attr("id", `select-chr-${chr}-group`);

            let chromosomeColor = d3.interpolate("#1F68C1", "#A63D40")(chromosomeEnd / genomeSize);

            //add the chromosome bar
            chromosomeGroup
                .append("rect")
                .attr("x", 1)
                .attr("y", 0)
                .attr("width", x(chromosomeEnd) - x(chromosomeStart))
                .attr("height", height - margin.bottom - margin.top)
                .attr("fill", chromosomeColor)
                .attr("stroke", "white")
                .attr("stroke-width", 1)
                .attr("fill-opacity", 0.3)
                .attr("rx", 3);

            // let idioHeight = height - margin.bottom - margin.top - 6;
            // let idioPosOffset = 3;

            // chromosomeGroup
            //     .append("rect")
            //     //class will be ideogram
            //     .attr("class", "upper-ideogram-parm")
            //     .attr("x", 1)
            //     .attr("y", 0)
            //     .attr("width", function () {
            //         //then return here the width which will be the scaled value from the start of the centromere to the end of the centromere
            //         return x(centromereStart + centromereCenter) - x(chromosomeStart) - 1;
            //     })
            //     .attr("height", idioHeight)
            //     .attr("transform", `translate(0, ${idioPosOffset})`)
            //     .attr("fill", "white")
            //     .attr("fill-opacity", 0.8)
            //     .attr("stroke", chromosomeColor)
            //     .attr("stroke-opacity", ".3")
            //     //make the corners rounded
            //     .attr("rx", 4);

            // //now to make the q arm
            // chromosomeGroup
            //     .append("rect")
            //     //class will be idi
            //     .attr("class", "lower-ideogram-qarm")
            //     .attr("x", function () {
            //         //then return here the width which will be the scaled value from the start of the centromere to the end of the centromere
            //         return x(centromereStart + centromereCenter) - x(chromosomeStart);
            //     })
            //     .attr("y", 0)
            //     .attr("width", function () {
            //         //then return here the width which will be the scaled value from the start of the centromere to the end of the centromere
            //         return x(chromosomeEnd) - x(centromereEnd - centromereCenter);
            //     })
            //     .attr("height", idioHeight)
            //     .attr("transform", `translate(0, ${idioPosOffset})`)
            //     .attr("fill", "white")
            //     .attr("fill-opacity", 0.8)
            //     .attr("stroke", chromosomeColor)
            //     .attr("stroke-opacity", 0.3)
            //     //make the corners rounded
            //     .attr("rx", 4);

            chromosomeGroup
                .attr("cursor", "pointer")
                .on("mouseover", function () {
                    d3.select(this).select("rect").attr("fill-opacity", 0.5);
                })
                .on("mouseout", function () {
                    d3.select(this).select("rect").attr("fill-opacity", 0.3);
                })
                .on("click", function () {
                    //if the selectionCallback is set then call it with the chromosome start and end
                    if (selectionCallback) {
                        selectionCallback({
                            start: chromosomeStart,
                            end: chromosomeEnd,
                            chr: chr,
                        });
                    }
                });

            chromosomeGroups.push(chromosomeGroup);
        }
        for (let [chr, chromosome] of chromosomeMap) {
            let chromosomeStart = chromosome.start;
            let chromosomeEnd = chromosome.end;
            let chromosomeColor = d3.interpolate("#1F68C1", "#A63D40")(chromosomeEnd / genomeSize);

            //add the labels
            let labels = svg
                .append("g")
                .attr("transform", `translate(${x(chromosomeStart)}, 0)`)
                .attr("class", "chromosome-group")
                .attr("id", `select-chr-${chr}-group`);

            labels
                .append("text")
                .attr("x", x(chromosomeEnd + chromosomeStart) / 2 - x(chromosomeStart)) //center the label in the middle of the chromosome
                .attr("y", () => {
                    if (chr % 2 == 0) {
                        return height - margin.bottom - margin.top - 3; // For two-letter chromosomes, position it lower
                    }
                    return height - margin.bottom - margin.top - 15; // For single-letter chromosomes, position it higher
                })
                .text(chr)
                .attr("transform", function () {
                    if (chr.length == 2) {
                        return `translate(-2, 0)`; // This works better than anchoring to the center for two-letter chromosomes for whatever reason
                    }
                    return `translate(0, 0)`;
                })
                .attr("font-size", "14px")
                .attr("font-weight", "bold")
                .attr("text-anchor", "start")
                .attr("pointer-events", "none")
                .attr("class", "select-chromosome-label")
                .attr("fill", chromosomeColor)
                .raise();
        }
    }

    if (selection) {
        let start = selection.start;
        let end = selection.end;

        //selection will be in the base pair space so need to convert it to the pixel space
        let startPixel = x(start);
        let endPixel = x(end);

        // Just create a box with no fill over the selection area
        svg.append("rect")
            .attr("class", "selection-rectangle")
            .attr("x", startPixel)
            .attr("y", 1)
            .attr("width", endPixel - startPixel)
            .attr("height", height - margin.bottom - margin.top - 1)
            .attr("fill", "gray")
            .attr("fill-opacity", 0.4)
            .attr("stroke", "red")
            .attr("stroke-width", 1.5)
            .attr("pointer-events", "none")
            .attr("rx", 3);
    }

    return svg.node();
}

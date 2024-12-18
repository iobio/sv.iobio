import * as d3 from "d3";

export default function chromSelectBar(parentElementTag, refChromosomes, options = null) {
    let parentElement = d3.select(parentElementTag);

    let width = parentElement.node().clientWidth - 5;
    let height = parentElement.node().clientHeight - 5;
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

    const margin = { top: 5, right: 10, bottom: 5, left: 10 };

    const svg = d3
        .create("svg")
        .attr("viewBox", [0, 0, width, height + 5])
        .attr("class", "chrom-select-bar-d3")
        .attr("width", width)
        .attr("height", height + 5);

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
        for (let [chr, chromosome] of chromosomeMap) {
            //Chromosome start and end
            let chromosomeStart = chromosome.start;
            let chromosomeEnd = chromosome.end;

            let centromereStart = chromosomeStart + centromeres[chr].start;
            let centromereEnd = chromosomeStart + centromeres[chr].end;
            let centromereCenter = (centromereEnd - centromereStart) / 2;

            //create a new group for this chromosome
            let chromosomeGroup = svg
                .append("g")
                .attr("transform", `translate(${x(chromosomeStart)}, 5)`)
                .attr("class", "chromosome-group")
                .attr("id", `chr-${chr}-group`);

            let chromosomeColor = d3.interpolate("#1F68C1", "#A63D40")(chromosomeEnd / genomeSize);

            //add the chromosome bar
            chromosomeGroup
                .append("rect")
                .attr("x", 1)
                .attr("y", 5)
                .attr("width", x(chromosomeEnd) - x(chromosomeStart))
                .attr("height", height - margin.bottom - margin.top + 5)
                .attr("fill", chromosomeColor)
                .attr("stroke", "white")
                .attr("fill-opacity", 0.3)
                .attr("rx", 3);

            let idioHeight = height - margin.bottom - margin.top - 2;
            let idioPosOffset = 3;

            chromosomeGroup
                .append("rect")
                //class will be idiogram
                .attr("class", "upper-idiogram-parm")
                .attr("x", 1)
                .attr("y", 5)
                .attr("width", function () {
                    //then return here the width which will be the scaled value from the start of the centromere to the end of the centromere
                    return x(centromereStart + centromereCenter) - x(chromosomeStart) - 1;
                })
                .attr("height", idioHeight)
                .attr("transform", `translate(0, ${idioPosOffset})`)
                .attr("fill", "white")
                .attr("fill-opacity", 0.8)
                .attr("stroke", chromosomeColor)
                .attr("stroke-opacity", ".3")
                //make the corners rounded
                .attr("rx", 4);

            //now to make the q arm
            chromosomeGroup
                .append("rect")
                //class will be idi
                .attr("class", "lower-idiogram-qarm")
                .attr("x", function () {
                    //then return here the width which will be the scaled value from the start of the centromere to the end of the centromere
                    return x(centromereStart + centromereCenter) - x(chromosomeStart);
                })
                .attr("y", 5)
                .attr("width", function () {
                    //then return here the width which will be the scaled value from the start of the centromere to the end of the centromere
                    return x(chromosomeEnd) - x(centromereEnd - centromereCenter);
                })
                .attr("height", idioHeight)
                .attr("transform", `translate(0, ${idioPosOffset})`)
                .attr("fill", "white")
                .attr("fill-opacity", 0.8)
                .attr("stroke", chromosomeColor)
                .attr("stroke-opacity", 0.3)
                //make the corners rounded
                .attr("rx", 4);

            //add the labels
            chromosomeGroup
                .append("text")
                .attr("x", x(centromereStart - centromereCenter) - x(chromosomeStart) + 5)
                //if the label is two characters long, move it over a bit so it's centered
                .attr("transform", function () {
                    if (chr.length == 2) {
                        return `translate(${-4}, 0)`;
                    }
                })
                .attr("y", height - margin.bottom - margin.top + 3)
                .text(chr)
                .attr("font-size", "14px")
                .attr("font-weight", "bold")
                .attr("fill", chromosomeColor);

            //Add the zoom to button in the upper left corner
            let btngroup = chromosomeGroup.append("g").attr("class", "zoom-to-button").attr("transform", `translate(0, -6)`);

            btngroup
                .append("svg")
                .attr("xmlns", "http://www.w3.org/2000/svg")
                .attr("viewBox", "0 0 24 24")
                .attr("width", 15)
                .attr("height", 15)
                .append("path")
                .attr(
                    "d",
                    "M12,20C7.59,20 4,16.41 4,12C4,7.59 7.59,4 12,4C16.41,4 20,7.59 20,12C20,16.41 16.41,20 12,20M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M13,7H11V11H7V13H11V17H13V13H17V11H13V7Z"
                )
                .attr("title", "Zoom to chromosome")
                .attr("fill", chromosomeColor)
                .attr("stroke", chromosomeColor)
                .attr("stroke-width", 0.25)
                .attr("stroke-linecap", "round")
                .attr("stroke-linejoin", "round")
                .attr("stroke-miterlimit", 10);

            btngroup
                .append("rect")
                .attr("width", 15)
                .attr("height", 15)
                .attr("fill", "transparent")
                .attr("cursor", "pointer")
                .raise();

            let zoombtn = chromosomeGroup.select(".zoom-to-button");
            zoombtn.on("click", function () {
                let path = d3.select(this).select("path");
                path.attr("fill", "#174C8C").attr("stroke", "#174C8C").attr("transform", "scale(1.1)");

                //set a timeout to call this next function
                setTimeout(() => {
                    let zoomedSelection = chromosomeMap.get(chr);
                    if (zoomedSelection) {
                        if (selectionCallback) {
                            selectionCallback({ start: zoomedSelection.start, end: zoomedSelection.end });
                        }
                    }
                }, 10);
            });
        }
    }

    //render brush later so it's on top
    if (brush) {
        //if there is a selection then we want to brush to that selection
        if (selection) {
            let start = selection.start;
            let end = selection.end;

            //selection will be in the base pair space so need to convert it to the pixel space
            let startPixel = x(start);
            let endPixel = x(end);

            let brush = d3
                .brushX()
                .extent([
                    [0, 7],
                    [width, height - 1],
                ])
                .on("brush", function (event) {
                    let brushArea = d3.select(this);
                    let selection = brushArea.select(".selection");
                    // Customize the brush rectangle during brushing
                    selection.attr("fill", "rgba(0, 100, 255, 0.3)").attr("stroke", "blue").attr("stroke-width", 1);
                })
                .on("end", brushed);

            //this is the acutal brushable area
            svg.append("g").attr("class", "brush-area").call(brush).attr("transform", `translate(0, 5)`).raise();

            //set the brush to the selection but dont fire the callback
            svg.select(".brush-area").call(brush.move, [startPixel, endPixel]);

            //get the selection and set its styles
            let brushRec = svg.select(".brush-area").select(".selection");
            brushRec.attr("fill", "gray").attr("fill-opacity", 0.4).attr("stroke", "red").attr("stroke-width", 1.5).attr("rx", 3);
        } else {
            let brush = d3
                .brushX()
                .extent([
                    [0, 7],
                    [width, height - 1],
                ])
                .on("brush", function (event) {
                    let brushArea = d3.select(this);
                    let selection = brushArea.select(".selection");
                    // Customize the brush rectangle during brushing
                    selection
                        .attr("fill", "gray")
                        .attr("fill-opacity", 0.4)
                        .attr("stroke", "#4C709B")
                        .attr("stroke-width", 1.5)
                        .attr("rx", 3);
                })
                .on("end", brushed);

            svg.append("g").attr("class", "brush-area").call(brush).attr("transform", `translate(0, 5)`).raise();
        }
    }

    function brushed(event) {
        let brushSelection = event.selection;
        //if the selection is null then the user has clicked off the brush so don't do anything
        if (!brushSelection || brushSelection[0] == brushSelection[1]) {
            //ensure we return back the whole genome
            selectionCallback({ start: 0, end: genomeSize });
            return;
        }

        //selection will be in the pixel space so need to convert it to the base pair space
        let start = x.invert(brushSelection[0]);
        let end = x.invert(brushSelection[1]);

        //send the rounded start and end to the callback to the nearest whole number
        start = Math.round(start);
        end = Math.round(end);

        if (selection && start == selection.start && end == selection.end) {
            return;
        }

        if (selectionCallback) {
            selectionCallback({ start, end });
        }
    }

    function _getStartEndForRange(start, end, range) {
        let st = start;
        let en = end;

        if ((start < range[0] && end <= range[0]) || (start >= range[1] && end > range[1])) {
            return null;
        }

        if (start < range[0]) {
            st = range[0];
        }

        if (end > range[1]) {
            en = range[1];
        }

        return { start: st, end: en };
    }

    return svg.node();
}

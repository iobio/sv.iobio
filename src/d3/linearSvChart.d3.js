import * as d3 from "d3";

export default function linearSvChart(parentElement, refChromosomes, data = null, options = null) {
    let width = parentElement.clientWidth;
    let height = parentElement.clientHeight;
    let chromosomes = refChromosomes;
    let svs = data;
    let selectionCallback = null;
    let focusedVariantCallback = null;
    let brush = false;
    let selection = null;
    let centromeres = null;
    let bands = null;
    let focusedVariant = null;

    //zoom variables
    let zoomedSelection = null;

    d3.select(".tooltip-hover-variant").remove();

    if (options) {
        if (options.selectionCallback) {
            selectionCallback = options.selectionCallback;
        }
        if (options.focusedVariantCallback) {
            focusedVariantCallback = options.focusedVariantCallback;
        }
        if (options.brush) {
            brush = options.brush;
        }
        if (options.selection && options.selection !== null) {
            //we want to automatically brush to the selection
            selection = options.selection;
            //Ensure that selection.start is less than selection.end
            if (selection.start > selection.end) {
                let temp = selection.start;
                selection.start = selection.end;
                selection.end = temp;
            }
        }

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

        if (options.focusedVariant) {
            focusedVariant = options.focusedVariant;
        }
    }

    const margin = { top: 5, right: 10, bottom: 5, left: 10 };

    const svg = d3
        .create("svg")
        .attr("viewBox", [0, 0, width, height])
        .attr("class", "linear-sv-chart-d3")
        .attr("width", width)
        .attr("height", height);

    let { chromosomeMap, genomeSize } = _genChromosomeAccumulatedMap(chromosomes);

    let originZoom = {
        start: 0,
        end: genomeSize,
        size: genomeSize,
    };

    if (selection) {
        if (selection.end - selection.start >= genomeSize) {
            zoomedSelection = originZoom;
            selection = null;
        } else {
            zoomedSelection = {
                start: selection.start,
                end: selection.end,
                size: selection.end - selection.start,
            };
            selection = null; //setting selection to null so that we can keep zooming if we like
        }
    } else {
        zoomedSelection = originZoom;
    }

    //if the selection is the origin zoom then we want to set the selection to null
    if (selection && selection.start == 0 && selection.end == genomeSize) {
        selection = null;
    }

    //Put a message at the top of the chart 'Click and drag to select a region'
    svg.append("text")
        .attr("x", "60px")
        .attr("y", 13)
        .attr("text-anchor", "start")
        .attr("font-size", "13px")
        .attr("font-weight", "100")
        .attr("font-style", "italic")
        .text("Click and drag to select a region")
        .attr("fill", "#A3A3A3");

    let x = d3
        .scaleLinear()
        .domain([zoomedSelection.start, zoomedSelection.end])
        .range([margin.left, width - margin.right]);

    _renderSVs([zoomedSelection.start, zoomedSelection.end]);

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

    function _renderSVs(range) {
        let tracMap = {
            1: false,
            2: false,
            3: false,
            4: false,
            5: false,
            6: false,
        };

        let svMap = {};

        //iterate over the svs
        for (let sv of svs) {
            //get the chromosome and position
            let chr = sv.chromosome;
            let start = sv.start;
            let end = sv.end;

            let isFocused = false;
            if (focusedVariant) {
                if (focusedVariant.chromosome == chr && focusedVariant.start == start && focusedVariant.end == end) {
                    isFocused = true;
                }
            }

            //get the corresponding chromosome from the accumulated map
            let chromosome = chromosomeMap.get(chr);
            let absoluteStart = chromosome.start + start;
            let absoluteEnd = chromosome.start + end;

            let startUpdated = absoluteStart;
            let endUpdated = absoluteEnd;

            let startX = null; //no sense in setting these yet
            let endX = null;

            //check and see if the point of interest is in the zoomed selection
            let newStartEnd = _getStartEndForRange(absoluteStart, absoluteEnd, range);

            if (!newStartEnd) {
                //if we get nothing back we dont render this point of interest at all
                continue;
            } else {
                //we will either get back the truncated start/ends or the original start/ends depending on if the point of interest is in the range
                startUpdated = newStartEnd.start;
                endUpdated = newStartEnd.end;

                startX = x(startUpdated);
                endX = x(endUpdated);
            }

            //add the point of interest to the map with the absolute start and end as the key "absoluteStart-absoluteEnd"
            if (!svMap[`${absoluteStart}-${absoluteEnd}`]) {
                svMap[`${absoluteStart}-${absoluteEnd}`] = [sv];

                //create a new group for this point of interest
                let pointGroup = svg
                    .append("g")
                    .attr("transform", `translate(${startX}, 30)`)
                    .attr("class", "point-group")
                    .attr("id", `poi-${chr}-${start}-${end}-group`);

                let currentTrac = 0;

                for (let x of Object.keys(tracMap)) {
                    if (tracMap[x] != false && startX > tracMap[x]) {
                        tracMap[x] = endX;
                        currentTrac = x;
                        break;
                    } else if (tracMap[x] != false && startX < tracMap[x]) {
                        continue;
                    }

                    if (tracMap[x] == false) {
                        tracMap[x] = endX;
                        currentTrac = x;
                        break;
                    }
                }

                let translateY = (currentTrac - 1) * 8;

                pointGroup
                    .append("rect")
                    .attr("x", 0)
                    .attr("width", function () {
                        //if the block is too small to see make it 2 pixels wide
                        if (endX - startX < 1) {
                            return 1;
                        }
                        return endX - startX;
                    })
                    .attr("transform", `translate(0, ${translateY})`)
                    .attr("height", 5)
                    .attr("rx", function () {
                        if (endX - startX < 3) {
                            return 0;
                        } else {
                            return 2;
                        }
                    })
                    .attr("fill", function () {
                        //should be red if it's a deletion
                        if (sv.type == "DEL") {
                            return "#CC0000";
                        } else {
                            return "#4C709B";
                        }
                    })
                    .on("mouseover", function (event, d) {
                        //if there is already a tooltip remove it
                        d3.select(".tooltip-hover-variant").remove();

                        d3.select(this).style("fill", "gray").style("cursor", "pointer");

                        //append a tooltip that is absolutely positioned to the mouse position
                        let tooltip = d3.select("body").append("div").attr("class", "tooltip-hover-variant");

                        //append the data to the tooltip
                        let bpFormatted = function (valuebp) {
                            if (valuebp > 1000000) {
                                return `${(valuebp / 1000000).toFixed(2)}Mb`;
                            } else if (valuebp > 1000) {
                                return `${(valuebp / 1000).toFixed(2)}Kb`;
                            }
                            return `${valuebp}Bp`;
                        };

                        //append the data to the tooltip
                        tooltip.append("p").html(`
                                ${sv.chromosome}:${bpFormatted(sv.start)}<br>
                                size:${bpFormatted(sv.end - sv.start)}<br>
                                quality:${sv.quality} (${sv.type})<br>
                                GT:${sv.genotype.slice(0, 3)}`);

                        //put it in the right position
                        let x = event.clientX;
                        let y = event.clientY;

                        //The minimum width of the tooltip is 200px so if the x is less than 200px from the right side of the screen then we need to move it to the left
                        if (window.innerWidth - x < 200) {
                            x = x - 200;
                        } else {
                            x = x + 10;
                        }

                        //we want to know the calculated height of the tooltip as well so that we can ensure it doesnt go off the screen at the bottom
                        let tooltipHeight = tooltip.node().getBoundingClientRect().height;

                        //if the tooltip is going to go off the bottom of the screen then we need to move it up
                        if (window.innerHeight - y < tooltipHeight) {
                            y = y - tooltipHeight;
                        } else {
                            y = y + 10;
                        }

                        tooltip.style("left", `${x + 10}px`).style("top", `${y + 10}px`);
                    })
                    .on("mouseout", function (event, d) {
                        d3.select(".tooltip-hover-variant").remove();
                        d3.select(this).style("fill", function () {
                            if (sv.type == "DEL") {
                                return "#CC0000";
                            } else {
                                return "#4C709B";
                            }
                        });
                    })
                    .on("click", function (event, d) {
                        if (focusedVariantCallback) {
                            d3.select(".tooltip-hover-variant").remove();
                            focusedVariantCallback(sv);
                        }
                    });

                //if the point of interest is the focused variant then we want to put a border around it
                if (isFocused) {
                    pointGroup
                        .append("rect")
                        .attr("x", -2)
                        .attr("width", function () {
                            //if the block is too small to see make it 2 pixels wide
                            if (endX - startX < 1) {
                                return 3;
                            }
                            return endX - startX + 4;
                        })
                        .attr("transform", function () {
                            if (endX - startX < 1) {
                                return `translate(1, ${translateY - 2})`;
                            } else {
                                return `translate(0, ${translateY - 2})`;
                            }
                        })
                        .attr("height", 9)
                        .attr("rx", function () {
                            if (endX - startX < 3) {
                                return 0;
                            } else {
                                return 2;
                            }
                        })
                        .attr("fill", "none")
                        .attr("stroke", "#FFB60A")
                        .attr("stroke-width", 2)
                        .attr("class", "focused-variant-border");
                }
            } else {
                //dont render the point of interest if it already exists
                svMap[`${absoluteStart}-${absoluteEnd}`].push(sv);
            }
        }

        //If svMap is empty then we want to put a message in the middle of the chart that says 'No SVs in this region'
        if (Object.keys(svMap).length == 0) {
            svg.append("text")
                .attr("x", width / 2)
                .attr("y", height / 2)
                .attr("text-anchor", "middle")
                .attr("font-size", "16px")
                .attr("font-weight", "100")
                .attr("font-style", "italic")
                .text("No SVs in this region")
                .attr("fill", "#A3A3A3");
        }
    }

    //render brush later so it's on top
    if (brush) {
        let brush = d3
            .brushX()
            .extent([
                [0, 0],
                [width, 20],
            ])
            .on("brush", function (event) {
                let brushArea = d3.select(this);
                let selection = brushArea.select(".selection");
                // Customize the brush rectangle during brushing
                selection
                    .attr("fill", "rgba(0, 100, 255, 0.3)")
                    .attr("stroke", "#4C709B")
                    .attr("stroke-width", 1)
                    .attr("height", height)
                    .attr("rx", 2);
            })
            .on("end", brushed);

        svg.append("g").attr("class", `brush-area`).call(brush).raise();
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

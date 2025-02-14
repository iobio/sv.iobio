import * as d3 from "d3";

export default function clinGenChart(parentElementTag, clinGenRegions, refChromosomes, options) {
    let parentElement = d3.select(parentElementTag);

    let width = parentElement.node().clientWidth;
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

                band.chr = newChr;
                newBands.push(band);
            }
            bands = newBands;
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

    let x = d3
        .scaleLinear()
        .domain([zoomedSelection.start, zoomedSelection.end])
        .range([margin.left, width - margin.right]);

    let xAxis = (g) =>
        g
            .attr("transform", `translate(0, ${height - margin.bottom - 15})`)
            .call(
                d3
                    .axisBottom(x)
                    .ticks(width / 80)
                    .tickSizeOuter(0)
                    .tickFormat(function (d) {
                        //At the whole genome level we can just show the base pair number
                        if (zoomedSelection.size == genomeSize) {
                            return `${d / 1000000}Mb`;
                        } else {
                            for (let [chr, chromosome] of chromosomeMap) {
                                if (d >= chromosome.start && d <= chromosome.end) {
                                    let sizeInMb = parseFloat(((d - chromosome.start) / 1000000).toFixed(5));

                                    if (sizeInMb < 1) {
                                        return `${parseFloat(((d - chromosome.start) / 1000).toFixed(4))}K`;
                                    }

                                    let num = parseFloat(((d - chromosome.start) / 1000000).toFixed(4));
                                    return `${num}M`;
                                }
                            }
                        }
                    }),
            )
            //tics need to be rotated slightly so they don't overlap
            .selectAll("text")
            .attr("transform", "rotate(0) translate(6, 0)")
            .attr("fill", "#474747");

    svg.append("g").call(xAxis);

    svg.selectAll(".domain").remove();
    svg.selectAll(".tick line").attr("stroke", "#858585").attr("transform", "translate(1, 2)");

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
            let chromStartUpdated = chromosomeStart;
            let chromosomeEnd = chromosome.end;
            let chromEndUpdated = chromosomeEnd;

            //check and see if the chromosome is in the zoomed selection
            let newStartEnd = _getStartEndForRange(chromosomeStart, chromosomeEnd, range);

            if (!newStartEnd) {
                //if we get nothing back we dont render this chromosome at all
                continue;
            } else {
                //we will either get back the truncated start/ends or the original start/ends depending on if the chromosome is in the range
                chromStartUpdated = newStartEnd.start;
                chromEndUpdated = newStartEnd.end;
            }

            //Centromeres setup
            let centromere = false;
            let centromereStart = null;
            let centromereEnd = null;
            let centromereCenter = null;

            //set absolute centromere start, end, and center based on the chromosome start and end (original)
            if (centromeres) {
                centromere = true;
                centromereStart = chromosomeStart + centromeres[chr].start;
                centromereEnd = chromosomeStart + centromeres[chr].end;
                centromereCenter = (centromereEnd - centromereStart) / 2;

                if (chromosomeStart != chromStartUpdated || chromosomeEnd != chromEndUpdated) {
                    let newCentStartEnd = _getStartEndForRange(centromereStart, centromereEnd, range);

                    if (!newCentStartEnd) {
                        //this centrome is not in the range so we will not render it
                        centromere = false;
                    } else {
                        centromereStart = newCentStartEnd.start;
                        centromereEnd = newCentStartEnd.end;
                        centromereCenter = (centromereEnd - centromereStart) / 2;
                    }
                }
            }

            //create a new group for this chromosome
            let chromosomeGroup = svg
                .append("g")
                .attr("transform", `translate(${x(chromStartUpdated)}, 0)`)
                .attr("class", "chromosome-group")
                .attr("id", `chr-${chr}-group`);

            let chromosomeColor = d3.interpolate("#1F68C1", "#A63D40")(chromosomeEnd / genomeSize);

            let idioHeight = 12;
            let idioPosOffset = 16;

            if (!centromere) {
                //add another rectangle slightly smaller and under the last one to start to make the ideograms
                chromosomeGroup
                    .append("rect")
                    //class will be ideogram
                    .attr("class", "upper-ideogram")
                    .attr("x", 0)
                    .attr("y", 0)
                    .attr("width", x(chromEndUpdated) - x(chromStartUpdated))
                    .attr("height", idioHeight)
                    .attr("transform", `translate(0, ${idioPosOffset})`)
                    .attr("fill", "white")
                    .attr("stroke", chromosomeColor)
                    //make the corners rounded
                    .attr("rx", 3);
            } else {
                chromosomeGroup
                    .append("rect")
                    //class will be ideogram
                    .attr("class", "upper-ideogram-parm")
                    .attr("x", 0)
                    .attr("y", 0)
                    .attr("width", function () {
                        //then return here the width which will be the scaled value from the start of the centromere to the end of the centromere
                        return x(centromereStart + centromereCenter) - x(chromStartUpdated) - 1;
                    })
                    .attr("height", idioHeight)
                    .attr("transform", `translate(0, ${idioPosOffset})`)
                    .attr("fill", "white")
                    .attr("stroke", chromosomeColor)
                    //make the corners rounded
                    .attr("rx", 3);

                //now to make the q arm
                chromosomeGroup
                    .append("rect")
                    //class will be idi
                    .attr("class", "lower-ideogram-qarm")
                    .attr("x", function () {
                        //then return here the width which will be the scaled value from the start of the centromere to the end of the centromere
                        return x(centromereStart + centromereCenter) - x(chromStartUpdated);
                    })
                    .attr("y", 0)
                    .attr("width", function () {
                        //then return here the width which will be the scaled value from the start of the centromere to the end of the centromere
                        return x(chromEndUpdated) - x(centromereEnd - centromereCenter);
                    })
                    .attr("height", idioHeight)
                    .attr("transform", `translate(0, ${idioPosOffset})`)
                    .attr("fill", "white")
                    .attr("stroke", chromosomeColor)
                    //make the corners rounded
                    .attr("rx", 3);
            }

            //if there are bands filter for the bands that are in this chromosome
            if (bands) {
                let chrBands = bands.filter((band) => band.chr == chr);

                for (let band of chrBands) {
                    //get the band start and end in the absolute base pair space for calculations
                    let bandStartAbs = chromosomeStart + band.start;
                    let bandEndAbs = chromosomeStart + band.end;

                    //check and see if the band is in the zoomed selection
                    let newBandStartEnd = _getStartEndForRange(bandStartAbs, bandEndAbs, range);

                    if (!newBandStartEnd) {
                        //if we get nothing back we dont render this band at all
                        continue;
                    } else {
                        //we will either get back the truncated start/ends or the original start/ends depending on if the band is in the range
                        bandStartAbs = newBandStartEnd.start;
                        bandEndAbs = newBandStartEnd.end;
                    }

                    let bandStartX = x(bandStartAbs) - x(chromStartUpdated);
                    let bandEndX = x(bandEndAbs) - x(chromStartUpdated);

                    let bandHeight = 10;

                    //get the intensity based on the gieStain number after gpos
                    if (band.gieStain.includes("gpos")) {
                        let intensity = band.gieStain.replace("gpos", "") / 100;

                        //create my band rectangle
                        chromosomeGroup
                            .append("rect")
                            .attr("x", function () {
                                return bandStartX;
                            })
                            .attr("y", 8)
                            .attr("width", function () {
                                return bandEndX - bandStartX;
                            })
                            .attr("height", bandHeight)
                            .attr("transform", `translate(0, 9)`)
                            .attr("fill", chromosomeColor)
                            .attr("fill-opacity", intensity)
                            .raise();
                    }

                    //Render a text label for the band but try to pick breakpoints that make sense
                    //Will render alternating labels based on the size of our area, if we are in a smaller area we will render more labels
                    let rangeLen = range[1] - range[0];
                    let chromosome16Length = chromosomeMap.get("16").end - chromosomeMap.get("16").start;
                    let chromosome1Length = chromosomeMap.get("1").end - chromosomeMap.get("1").start;

                    if (rangeLen <= chromosome16Length) {
                        //add the band label in the middle of the band
                        let x = bandStartX + (bandEndX - bandStartX) / 2;
                        chromosomeGroup
                            .append("text")
                            .attr("x", x)
                            .attr("y", 12)
                            .text(band.name)
                            .attr("font-size", "10px")
                            .attr("fill", chromosomeColor)
                            .attr("text-anchor", "middle");
                    } else if (rangeLen <= chromosome1Length && band.gieStain.includes("gpos")) {
                        //add the band label in the middle of the band
                        let x = bandStartX + (bandEndX - bandStartX) / 2;
                        chromosomeGroup
                            .append("text")
                            .attr("x", x)
                            .attr("y", 12)
                            .text(band.name)
                            .attr("font-size", "10px")
                            .attr("fill", chromosomeColor)
                            .attr("text-anchor", "middle");
                    }
                }
            }

            let rangeLen = range[1] - range[0];
            let chromosome1Length = chromosomeMap.get("1").end - chromosomeMap.get("1").start;

            if (rangeLen <= chromosome1Length) {
                chromosomeGroup
                    .append("circle")
                    .attr("cx", 2)
                    .attr("cy", 11)
                    .attr("r", 10)
                    .attr("fill", "white")
                    .attr("stroke", chromosomeColor)
                    .attr("stroke-width", 1);
                //if we are in a smaller space this is the one we want to render
                chromosomeGroup
                    .append("text")
                    .attr("x", function () {
                        if (chr.length == 2) {
                            return -7;
                        }
                        return -3;
                    })
                    .attr("y", 17)
                    .text(chr)
                    .attr("font-size", "18px")
                    .attr("font-weight", "bold")
                    .attr("fill", chromosomeColor);
            } else {
                //The global level label
                chromosomeGroup
                    .append("text")
                    .attr("x", x(centromereStart - centromereCenter) - x(chromStartUpdated) + 5)
                    //if the label is two characters long, move it over a bit so it's centered
                    .attr("transform", function () {
                        if (chr.length == 2) {
                            return `translate(${-4}, 0)`;
                        }
                    })
                    .attr("y", height - margin.bottom - margin.top - 20)
                    .text(chr)
                    .attr("font-size", "14px")
                    .attr("fill", chromosomeColor);
            }
        }
    }

    //render brush later so it's on top
    if (brush) {
        let brush = d3
            .brushX()
            .extent([
                [0, 0],
                [width, height],
            ])
            .on("brush", function (event) {
                let brushArea = d3.select(this);
                let selection = brushArea.select(".selection");
                // Customize the brush rectangle during brushing
                selection
                    .attr("fill", "rgba(0, 100, 255, 0.3)") // Change fill color
                    .attr("stroke", "#4C709B") // Change stroke color
                    .attr("stroke-width", 1)
                    .attr("rx", 1); // Change stroke width
            })
            .on("end", brushed);

        svg.append("g").attr("class", "brush-area").call(brush).raise();
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

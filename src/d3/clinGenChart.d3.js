import * as d3 from "d3";

export default function clinGenChart(parentElement, refChromosomes, clinGenRegions, options) {
    let width = parentElement.clientWidth;
    let height = parentElement.clientHeight;
    let chromosomes = refChromosomes;
    let regions = clinGenRegions;
    let selection = null;
    let zoomedSelection = null;

    if (options) {
        if (options.selection && options.selection !== null) {
            //we want to automatically brush to the selection
            selection = options.selection;
            //Ensure that the selection.start is less than the selection.end
            if (selection.start > selection.end) {
                let temp = selection.start;
                selection.start = selection.end;
                selection.end = temp;
            }
        }
    }

    const svg = d3
        .create("svg")
        .attr("viewBox", [0, 0, width, height])
        .attr("class", "linear-gene-chart-d3")
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

    const margin = { top: 3, right: 10, bottom: 3, left: 10 };

    let x = d3
        .scaleLinear()
        .domain([zoomedSelection.start, zoomedSelection.end])
        .range([margin.left, width - margin.right]);

    _renderRegions([zoomedSelection.start, zoomedSelection.end]);

    //============================ INTERNAL FUNCTIONS ============================//
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

    function _renderRegions(range) {
        //grab all the region-group groups and remove them before rendering the new ones
        svg.selectAll(".region-group").remove();
        d3.select(".show-hide-toggle").remove();
        d3.select(".region-tooltip").remove();
        svg.attr("viewBox", [0, 0, width, height]).attr("height", height + 3);

        let regionsLocal = JSON.parse(JSON.stringify(regions));

        let tracMap = {
            1: false,
        };

        let regionsMap = {};
        for (let region of Object.values(regionsLocal)) {
            //TODO: Maybe we can know the "type" of a region and color it differently or something

            let chr;
            let start;
            let end;
            try {
                chr = region.location.split(":")[0].replace("chr", "");
                start = parseInt(region.location.split(":")[1].split("-")[0]);
                end = parseInt(region.location.split(":")[1].split("-")[1]);
            } catch (e) {
                continue;
            }

            let chromosome = chromosomeMap.get(chr);
            if (!chromosome) {
                continue;
            }

            let absoluteStart = chromosome.start + start;
            let absoluteEnd = chromosome.start + end;

            let startUpdated = absoluteStart;
            let endUpdated = absoluteEnd;

            let startX = null;
            let endX = null;

            //check and see if the gene is in the zoomed selection
            let newStartEnd = _getStartEndForRange(absoluteStart, absoluteEnd, range);

            if (!newStartEnd) {
                continue;
            } else {
                startUpdated = newStartEnd.start;
                endUpdated = newStartEnd.end;

                startX = x(startUpdated);
                endX = x(endUpdated);
            }

            //add the gene to the map if it doesn't exist
            if (!regionsMap[`${absoluteStart}-${absoluteEnd}`]) {
                regionsMap[`${absoluteStart}-${absoluteEnd}`] = [region];

                let idMap = {
                    start: start,
                    end: end,
                    chr: chr,
                };

                //convert the new start and end to relative to chromosome
                startUpdated = startUpdated - chromosome.start;
                endUpdated = endUpdated - chromosome.start;

                let xMap = {
                    startX: startX,
                    endX: endX,
                    startUpdated: startUpdated,
                    endUpdated: endUpdated,
                };

                let regionGroup = _createRegion(xMap, idMap, region, range);

                let label = regionGroup.select(".region-label");
                let mTextWidth = 0;

                if (label.node()) {
                    let measureSvg = d3.create("svg");
                    parentElement.appendChild(measureSvg.node());

                    let measureText = measureSvg.node().appendChild(label.node().cloneNode(true));
                    mTextWidth = measureText.getBBox().width;
                    measureSvg.remove();
                }

                let currentTrac = 1;
                let length = Object.keys(tracMap).length + 1;
                let trackRange = Array.from({ length }, (_, i) => i + 1);

                for (let x of trackRange) {
                    if (!tracMap[x]) {
                        tracMap[x] = endX;
                        currentTrac = x;
                        break;
                    }

                    if (startX - mTextWidth > tracMap[x] + 2) {
                        tracMap[x] = endX;
                        currentTrac = x;
                        break;
                    } else if (startX - mTextWidth < tracMap[x] + 2) {
                        continue;
                    }
                }

                let translateY = (currentTrac - 1) * 0;

                if (translateY >= height) {
                    svg.attr("viewBox", [0, 0, width, height + 5]).attr("height", height + 5);
                }

                regionGroup.attr("transform", `translate(${startX}, ${translateY + 14})`);

                svg.append(() => regionGroup.node()); //append the gene group to the svg
            } else {
                //dont render the gene if it already exists
                regionsMap[`${absoluteStart}-${absoluteEnd}`].push(region);
            }
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

    function _createRegion(xMap, idMap, region, range) {
        let chr = idMap.chr;
        let start = idMap.start;
        let end = idMap.end;

        let startX = xMap.startX;
        let endX = xMap.endX;
        let regionGroup;

        regionGroup = svg.append("g").attr("class", "region-group").data([region]).attr("id", `poi-${chr}-${start}-${end}-group`);

        regionGroup
            .append("rect")
            .attr("x", 0)
            .attr("y", -7)
            .attr("class", "gene-rect")
            .attr("width", function () {
                if (endX - startX < 1) {
                    return 1;
                }
                return endX - startX;
            })
            .attr("height", 5)
            .attr("fill", "black")
            .attr("fill-opacity", 0.3)
            .attr("stroke", "black")
            .attr("stroke-width", 0.5)
            .attr("rx", function () {
                if (endX - startX < 3) {
                    return 0;
                }
                return 1;
            })
            .on("mouseover", function (event, d) {
                let regionTooltip = d3.select("body").append("div").attr("class", "region-tooltip").style("opacity", 0);

                regionTooltip.transition().duration(200).style("opacity", 0.9);

                let tooltipHtml = `<div class="region-tooltip-header">
                    <div class="region-tooltip-item"><span class="label">ID</span><span class="value">${
                        region.iscaId
                    }</span></div>
                    <div class="region-tooltip-item"><span class="label">Name</span><span class="value">${
                        region.iscaName
                    }</span></div>
                    <div class="region-tooltip-item"><span class="label">Haploinsufficiency</span><span class="value">${
                        region.haploinsufficiency.description
                    }</span></div>
                    <div class="region-tooltip-item"><span class="label">Haplo Disease</span><span class="value">${
                        region.haploinsufficiency.diseaseAssociation || "n/a"
                    }</span></div>
                    <div class="region-tooltip-item"><span class="label">Triplosensitivity</span><span class="value">${
                        region.triplosensitivity.description
                    }</span></div>
                    <div class="region-tooltip-item"><span class="label">Triplo Disease</span><span class="value">${
                        region.triplosensitivity.diseaseAssociation || "n/a"
                    }</span></div>
                </div>`;

                regionTooltip
                    .html(tooltipHtml)
                    .style("left", event.pageX + 5 + "px")
                    .style("top", event.pageY - 10 + "px");
            })
            .on("mouseout", function (d) {
                d3.select(".region-tooltip").remove();
            });

        return regionGroup;
    }

    return svg.node();
}

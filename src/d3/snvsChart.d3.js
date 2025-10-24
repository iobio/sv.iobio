import * as d3 from "d3";

export default function snvsChart(parentElement, refChromosomes, snvsList, options) {
    let width = parentElement.clientWidth;
    let height = parentElement.clientHeight;
    let chromosomes = refChromosomes;
    let snvs = snvsList;
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
        .attr("class", "linear-snvs-chart-d3")
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

    _renderSnvs([zoomedSelection.start, zoomedSelection.end]);

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

    function _renderSnvs(range) {
        //grab all the snv-group groups and remove them before rendering the new ones
        svg.selectAll(".snv-group").remove();
        d3.select(".show-hide-toggle").remove();
        d3.select(".snv-tooltip").remove();
        svg.attr("viewBox", [0, 0, width, height]).attr("height", height + 3);

        let snvsLocal = JSON.parse(JSON.stringify(snvs));

        let tracMap = {
            1: false,
        };

        let snvsMap = {};
        for (let snv of Object.values(snvsLocal)) {
            //TODO: Maybe we can know the "type" of a snv and color it differently or something

            // If the snv variant type is CNV or SV, skip it
            if (snv.var_type === "CNV" || snv.var_type === "SV") {
                continue;
            }

            let chr;
            let start;
            let end;
            try {
                chr = snv.chr;
                start = parseInt(snv.r_start);
                end = parseInt(snv.r_end);
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
            if (!snvsMap[`${absoluteStart}-${absoluteEnd}`]) {
                snvsMap[`${absoluteStart}-${absoluteEnd}`] = [snv];

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

                let snvGroup = _createRegion(xMap, idMap, snv, range);

                let label = snvGroup.select(".snv-label");
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

                snvGroup.attr("transform", `translate(${startX}, ${translateY + 14})`);

                svg.append(() => snvGroup.node()); //append the gene group to the svg
            } else {
                //dont render the gene if it already exists
                snvsMap[`${absoluteStart}-${absoluteEnd}`].push(snv);
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

    function _createRegion(xMap, idMap, snv, range) {
        let chr = idMap.chr;
        let start = idMap.start;
        let end = idMap.end;

        let startX = xMap.startX;
        let endX = xMap.endX;
        let snvGroup;

        snvGroup = svg.append("g").attr("class", "snv-group").data([snv]).attr("id", `poi-${chr}-${start}-${end}-group`);

        snvGroup
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
                let snvTooltip = d3.select("body").append("div").attr("class", "snv-tooltip").style("opacity", 0);

                snvTooltip.transition().duration(200).style("opacity", 0.9);

                let tooltipHtml = `<div class="snv-tooltip-header">
                    <div class="snv-tooltip-title">SNV</div>
                </div>
                <div class="snv-tooltip-body">
                    <div class="snv-tooltip-row"><span class="snv-tooltip-label">Chr:</span> ${d.chr}</div>
                    <div class="snv-tooltip-row"><span class="snv-tooltip-label">Start:</span> ${d.r_start}</div>
                    <div class="snv-tooltip-row"><span class="snv-tooltip-label">End:</span> ${d.r_end}</div>
                    <div class="snv-tooltip-row"><span class="snv-tooltip-label">Ref:</span> ${d.ref}</div>
                    <div class="snv-tooltip-row"><span class="snv-tooltip-label">Alt:</span> ${d.alt}</div>
                    <div class="snv-tooltip-row"><span class="snv-tooltip-label">Var Type:</span> ${d.var_type}</div>
                    <div class="snv-tooltip-row"><span class="snv-tooltip-label">Gene:</span> ${d['gene_name@default']}</div>
                </div>`;

                let x = event.clientX;
                let y = event.clientY;

                if (window.innerWidth - x < 300) {
                    x = x - 300;
                } else {
                    x = x + 10;
                }

                //There shouldn't be a case to handle for the bottom of the screen because the tooltip will always be near the top of the app
                snvTooltip
                    .html(tooltipHtml)
                    .style("left", x + 5 + "px")
                    .style("top", y - 10 + "px");
            })
            .on("mouseout", function (d) {
                d3.select(".snv-tooltip").remove();
            });

        return snvGroup;
    }

    return svg.node();
}

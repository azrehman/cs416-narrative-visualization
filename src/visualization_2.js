// import * as d3 from 'https://cdn.jsdelivr.net/npm/d3@7/+esm';

const dateParser = d3.timeParse('%Y-%m-%d');
// load data
const data = d3
    .csv('../data/indexProcessed.csv', (d) => {
        return {
            index: d.Index,
            date: dateParser(d.Date),
            close: +d.CloseUSD,
        };
    })
    .then((data) => {
        // create array for each index
        // const marketsData = d3.nest().key(d => d.index).entries(data); // every index
        const marketsData = {
            NYSE: data.filter(({ index }) => index == 'NYA'), // New York Stock Exchange
            NASDAQ: data.filter(({ index }) => index == 'IXIC'), // NASDAQ
            HKSE: data.filter(({ index }) => index == 'HSI'), // Hong Kong Stock Exchange
            TSE: data.filter(({ index }) => index == 'N225'), // Tokyo Stock Exchange
            EUR: data.filter(({ index }) => index == 'N100'), // Euronext
            NSEI: data.filter(({ index }) => index == 'NSEI'), // National Stock Exchange of India
        };
        // TODO
        // let plotSvg = plot(marketsData['NYSE']);
        d3.select('body').append(() => plot(marketsData['NYSE']));
        console.log('byee');
        // d3.select('body').append(() => plot(marketsData['NASDAQ']));
        // d3.select('body').append(() => plot(marketsData['EUR']));
    })
    .catch((error) => {
        console.log(error);
    });

// Declare the chart dimensions and margins.
const width = 900;
const height = 600;

const focusChartMargin = { top: 20, right: 20, bottom: 170, left: 60 };
const contextChartMargin = { top: 360, right: 20, bottom: 90, left: 60 };

const chartWidth = width - focusChartMargin.left - focusChartMargin.right;

const focusChartHeight =
    height - focusChartMargin.top - focusChartMargin.bottom;
const contextChartHeight =
    height - contextChartMargin.top - contextChartMargin.bottom;

function plot(marketData) {
    // x position scale
    const xFocus = d3.scaleUtc(
        d3.extent(marketData, (d) => d.date),
        [0, chartWidth]
    );
    const xContext = d3.scaleUtc(
        d3.extent(marketData, (d) => d.date),
        [0, chartWidth]
    );
    // y position scale
    const yFocus = d3.scaleLinear(
        [0, d3.max(marketData, (d) => d.close)],
        [focusChartHeight, 0]
    );
    const yContext = d3.scaleLinear(
        [0, d3.max(marketData, (d) => d.close)],
        [contextChartHeight, 0]
    );

    const xAxisFocus = d3
        .axisBottom(xFocus)
        .ticks(width / 80)
        .tickSizeOuter(0)
        .tickFormat(d3.timeFormat('%B %d, %Y'));

    const xAxisContext = d3
        .axisBottom(xContext)
        .ticks(chartWidth / 80)
        .tickSizeOuter(0)
        .tickFormat(d3.timeFormat('%B %d, %Y'));

    const yAxisFocus = d3
        .axisLeft(yFocus)
        // .tickFormat()
        .ticks(focusChartHeight / 40);

    // build brush
    const brush = d3
        .brushX()
        .extent([
            [0, -10],
            [chartWidth, contextChartHeight],
        ])
        .on('brush end', brushed);

    // create svg
    const svg = d3
        .create('svg')
        .attr('viewBox', [0, 0, width, height])
        .attr(
            'width',
            chartWidth + focusChartMargin.left + focusChartMargin.right
        )
        .attr(
            'height',
            focusChartHeight + focusChartMargin.top + focusChartMargin.bottom
        )
        // .attr(
        //     'style',
        //     'max-width: 100%; height: auto; height: intrinsic; font: 10px sans-serif;'
        // )
        // .style('-webkit-tap-highlight-color', 'transparent')
        .append('g')
        .attr(
            'transform',
            'translate(' +
                focusChartMargin.left +
                ',' +
                focusChartMargin.top +
                ')'
        )
        .attr('overflow', 'visible');

    // build zoom for the focus chart
    // as specified in "filter" - zooming in/out can be done by pinching on the trackpad while mouse is over focus chart
    // zooming in can also be done by double clicking while mouse is over focus chart
    const zoom = d3
        .zoom()
        .scaleExtent([1, Infinity])
        .translateExtent([
            [0, 0],
            [chartWidth, focusChartHeight],
        ])
        .extent([
            [0, 0],
            [chartWidth, focusChartHeight],
        ])
        .on('zoom', zoomed)
        .filter(
            () =>
                d3.event.ctrlKey ||
                d3.event.type === 'dblclick' ||
                d3.event.type === 'mousedown'
        );

    // create a line for focus chart
    const lineFocus = d3
        .line()
        .x((d) => xFocus(d.date))
        .y((d) => yFocus(d.close));

    // create line for context chart
    const lineContext = d3
        .line()
        .x((d) => xContext(d.date))
        .y((d) => yContext(d.close));

    // const clip = svg
    //     .append('defs')
    //     .append('svg:clipPath')
    //     .attr('id', 'clip')
    //     .append('svg:rect')
    //     .attr('width', chartWidth)
    //     .attr('height', focusChartHeight)
    //     .attr('x', 0)
    //     .attr('y', 0);

    const focusChartLines = svg
        .append('g')
        .attr('class', 'focus')
        .attr(
            'transform',
            'translate(' +
                focusChartMargin.left +
                ',' +
                focusChartMargin.top +
                ')'
        )
        .attr('clip-path', 'url(#clip)');

    // create focus chart
    const focus = svg
        .append('g')
        .attr('class', 'focus')
        .attr(
            'transform',
            'translate(' +
                focusChartMargin.left +
                ',' +
                focusChartMargin.top +
                ')'
        );

    // create context chart
    const context = svg
        .append('g')
        .attr('class', 'context')
        .attr(
            'transform',
            'translate(' +
                contextChartMargin.left +
                ',' +
                (contextChartMargin.top + 50) +
                ')'
        );

    // add axis to focus chart
    focus
        .append('g')
        .attr('class', 'x-axis')
        .attr('transform', 'translate(0,' + focusChartHeight + ')')
        .call(xAxisFocus);
    focus.append('g').attr('class', 'y-axis').call(yAxisFocus);

    // get list of bucket names
    var bucketNames = [];
    for (let key of Object.keys(data)) {
        bucketNames.push(key);
    }

    // match colors to bucket name
    var colors = d3
        .scaleOrdinal()
        .domain(bucketNames)
        .range(['#3498db', '#3cab4b', '#e74c3c', '#73169e', '#2ecc71']);

    // go through data and create/append lines to both charts
    for (let key of Object.keys(data)) {
        let bucket = data[key];
        focusChartLines
            .append('path')
            .datum(bucket)
            .attr('class', 'line')
            .attr('fill', 'none')
            .attr('stroke', (d) => colors(key))
            .attr('stroke-width', 1.5)
            .attr('d', lineFocus);
        context
            .append('path')
            .datum(bucket)
            .attr('class', 'line')
            .attr('fill', 'none')
            .attr('stroke', (d) => colors(key))
            .attr('stroke-width', 1.5)
            .attr('d', lineContext);
    }

    // add x axis to context chart (y axis is not needed)
    context
        .append('g')
        .attr('class', 'x-axis')
        .attr('transform', 'translate(0,' + contextChartHeight + ')')
        .call(xAxisContext);

    // add bush to context chart
    var contextBrush = context.append('g').attr('class', 'brush').call(brush);

    // style brush resize handle
    var brushHandlePath = (d) => {
        var e = +(d.type === 'e'),
            x = e ? 1 : -1,
            y = contextChartHeight + 10;
        return (
            'M' +
            0.5 * x +
            ',' +
            y +
            'A6,6 0 0 ' +
            e +
            ' ' +
            6.5 * x +
            ',' +
            (y + 6) +
            'V' +
            (2 * y - 6) +
            'A6,6 0 0 ' +
            e +
            ' ' +
            0.5 * x +
            ',' +
            2 * y +
            'Z' +
            'M' +
            2.5 * x +
            ',' +
            (y + 8) +
            'V' +
            (2 * y - 8) +
            'M' +
            4.5 * x +
            ',' +
            (y + 8) +
            'V' +
            (2 * y - 8)
        );
    };
    console.log('yo');
    var brushHandle = contextBrush
        .selectAll('.handle--custom')
        .data([{ type: 'w' }, { type: 'e' }])
        .enter()
        .append('path')
        .attr('class', 'handle--custom')
        .attr('stroke', '#000')
        .attr('cursor', 'ew-resize')
        .attr('d', brushHandlePath);

    // overlay the zoom area rectangle on top of the focus chart
    var rectOverlay = svg
        .append('rect')
        .attr('cursor', 'move')
        .attr('fill', 'none')
        .attr('pointer-events', 'all')
        .attr('class', 'zoom')
        .attr('width', chartWidth)
        .attr('height', focusChartHeight)
        .attr(
            'transform',
            'translate(' +
                focusChartMargin.left +
                ',' +
                focusChartMargin.top +
                ')'
        )
        .call(zoom)
        .on('mousemove', focusMouseMove)
        .on('mouseover', focusMouseOver)
        .on('mouseout', focusMouseOut);

    var mouseLine = focus
        .append('path') // create vertical line to follow mouse
        .attr('class', 'mouse-line')
        .attr('stroke', '#303030')
        .attr('stroke-width', 2)
        .attr('opacity', '0');

    var tooltip = focus
        .append('g')
        .attr('class', 'tooltip-wrapper')
        .attr('display', 'none');

    var tooltipBackground = tooltip.append('rect').attr('fill', '#e8e8e8');

    var tooltipText = tooltip.append('text');

    contextBrush.call(brush.move, [0, chartWidth / 2]);

    // focus chart x label
    focus
        .append('text')
        .attr(
            'transform',
            'translate(' +
                chartWidth / 2 +
                ' ,' +
                (focusChartHeight + focusChartMargin.top + 25) +
                ')'
        )
        .style('text-anchor', 'middle')
        .style('font-size', '18px')
        .text('Time (UTC)');

    // focus chart y label
    focus
        .append('text')
        .attr('text-anchor', 'middle')
        .attr(
            'transform',
            'translate(' +
                (-focusChartMargin.left + 20) +
                ',' +
                focusChartHeight / 2 +
                ')rotate(-90)'
        )
        .style('font-size', '18px')
        .text('Conversion Rate');

    function brushed() {
        if (d3.event.sourceEvent && d3.event.sourceEvent.type === 'zoom')
            return; // ignore brush-by-zoom
        tooltip.attr('display', 'none');
        focus.selectAll('.tooltip-line-circles').remove();
        mouseLine.attr('opacity', '0');
        var s = d3.event.selection || xContext.range();
        xFocus.domain(s.map(xContext.invert, xContext));
        focusChartLines.selectAll('.line').attr('d', lineFocus);
        focus.select('.x-axis').call(xAxisFocus);
        svg.select('.zoom').call(
            zoom.transform,
            d3.zoomIdentity
                .scale(chartWidth / (s[1] - s[0]))
                .translate(-s[0], 0)
        );
        brushHandle
            .attr('display', null)
            .attr(
                'transform',
                (d, i) => 'translate(' + [s[i], -contextChartHeight - 20] + ')'
            );
    }

    function zoomed() {
        if (d3.event.sourceEvent && d3.event.sourceEvent.type === 'brush')
            return; // ignore zoom-by-brush
        tooltip.attr('display', 'none');
        focus.selectAll('.tooltip-line-circles').remove();
        mouseLine.attr('opacity', '0');
        var t = d3.event.transform;
        xFocus.domain(t.rescaleX(xContext).domain());
        focusChartLines.selectAll('.line').attr('d', lineFocus);
        focus.select('.x-axis').call(xAxisFocus);
        var brushSelection = xFocus.range().map(t.invertX, t);
        context.select('.brush').call(brush.move, brushSelection);
        brushHandle
            .attr('display', null)
            .attr(
                'transform',
                (d, i) =>
                    'translate(' +
                    [brushSelection[i], -contextChartHeight - 20] +
                    ')'
            );
    }

    function focusMouseMove() {
        tooltip.attr('display', null);
        var mouse = d3.mouse(this);
        var dateOnMouse = xFocus.invert(mouse[0]);
        var nearestDateIndex = d3.bisect(
            availableDates,
            dateOnMouse.toString()
        );
        // get the dates on either of the mouse cord
        var d0 = new Date(availableDates[nearestDateIndex - 1]);
        var d1 = new Date(availableDates[nearestDateIndex]);
        var closestDate;
        if (d0 < xFocus.domain()[0]) {
            closestDate = d1;
        } else if (d1 > xFocus.domain()[1]) {
            closestDate = d0;
        } else {
            // decide which date is closest to the mouse
            closestDate = dateOnMouse - d0 > d1 - dateOnMouse ? d1 : d0;
        }

        var nearestDateYValues = groupValuesByX[closestDate];
        var nearestDateXCord = xFocus(new Date(closestDate));

        mouseLine
            .attr('d', `M ${nearestDateXCord} 0 V ${focusChartHeight}`)
            .attr('opacity', '1');

        tooltipText.selectAll('.tooltip-text-line').remove();
        focus.selectAll('.tooltip-line-circles').remove();
        console.log(xFocus.domain());
        var formatTime = d3.timeFormat('%H:%M');
        tooltipText
            .append('tspan')
            .attr('class', 'tooltip-text-line')
            .attr('x', '5')
            .attr('y', '5')
            .attr('dy', '13px')
            .attr('font-weight', 'bold')
            .text(`${formatTime(closestDate)}`);

        for (let key of Object.keys(nearestDateYValues)) {
            focus
                .append('circle')
                .attr('class', 'tooltip-line-circles')
                .attr('r', 5)
                .attr('fill', colors(key))
                .attr('cx', nearestDateXCord)
                .attr('cy', yFocus(nearestDateYValues[key]));

            tooltipText
                .append('tspan')
                .attr('class', 'tooltip-text-line')
                .attr('x', '5')
                .attr('dy', `14px`)
                .attr('fill', colors(key))
                .text(`${key}: ${nearestDateYValues[key].toFixed(2)}`);
        }

        var tooltipWidth = tooltipText.node().getBBox().width;
        var tooltipHeight = tooltipText.node().getBBox().height;
        var rectOverlayWidth = rectOverlay.node().getBBox().width;
        tooltipBackground
            .attr('width', tooltipWidth + 10)
            .attr('height', tooltipHeight + 10);
        if (nearestDateXCord + tooltipWidth >= rectOverlayWidth) {
            tooltip.attr(
                'transform',
                'translate(' +
                    (nearestDateXCord - tooltipWidth - 20) +
                    ',' +
                    mouse[1] +
                    ')'
            );
        } else {
            tooltip.attr(
                'transform',
                'translate(' + (nearestDateXCord + 10) + ',' + mouse[1] + ')'
            );
        }
    }

    function focusMouseOver() {
        mouseLine.attr('opacity', '1');
        tooltip.attr('display', null);
    }

    function focusMouseOut() {
        mouseLine.attr('opacity', '0');
        tooltip.attr('display', 'none');
        focus.selectAll('.tooltip-line-circles').remove();
    }
    console.log('bye');

    return svg.node();
}

// TODO
// tell story about covid bad for markets
// each stock exchange at a time
// in the end let user plot chosen stock exchange for a given time period?
// tooltip exact day and price hover - click to open day on yahoo finance?
// annotation peak and valley of market

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
        const nextButton = d3
            .select('body')
            .append('div')
            .attr('class', 'nextButton');
        d3.select(id).html = '';
        d3.select('body').append(() => plot(marketsData['NASDAQ']));
        // d3.select('body').append(() => plot(marketsData['EUR']));
    })
    .catch((error) => {
        console.log(error);
    });

console.log('bye');

// Declare the chart dimensions and margins.
const width = 900;
const height = 600;
const margin = { top: 20, right: 30, bottom: 30, left: 40 };

function plot(marketData) {
    // marketData.sort((a, b) => a.date - b.date);

    // x position scale
    const x = d3
        .scaleUtc()
        .domain(d3.extent(marketData, (d) => d.date))
        .range([margin.left, width - margin.right]);

    // y position scale
    const y = d3
        .scaleLinear()
        .domain([0, d3.max(marketData, (d) => d.close)])
        .nice()
        .range([height - margin.bottom, margin.top]);

    // create svg
    const svg = d3
        .create('svg')
        .attr('viewBox', [0, 0, width, height])
        .attr('width', width)
        .attr('height', height)
        .style('display', 'block')
        .attr(
            'style',
            'max-width: 100%; height: auto; height: intrinsic; font: 10px sans-serif;'
        )
        .style('-webkit-tap-highlight-color', 'transparent')
        .style('overflow', 'visible')
        .on('mousemove', mousemoved)
        .on('mouseleave', mouseleft);
    // .on('touchstart', (event) => event.preventDefault());

    const xAxis = (g, x) =>
        g
            .attr('transform', `translate(0,${height - margin.bottom})`)
            .call(
                d3
                    .axisBottom(x)
                    .ticks(width / 80)
                    .tickSizeOuter(0)
            )
            .call((g) =>
                g
                    .append('text')
                    .attr('x', margin.left)
                    .attr('y', 15)
                    .attr('fill', 'currentColor')
                    .attr('text-anchor', 'start')
                    .text('Date')
            );
    // add x axis
    const gx = svg.append('g').call(xAxis, x);

    const yAxis = (g, y) =>
        g
            .attr('transform', `translate(${margin.left},0)`)
            .call(d3.axisLeft(y).ticks(height / 40))
            .call((g) => g.select('.domain').remove())
            .call((g) =>
                g
                    .selectAll('.tick line')
                    .clone()
                    .attr('x2', width - margin.left - margin.right)
                    .attr('stroke-opacity', 0.1)
            )
            .call((g) =>
                g
                    .append('text')
                    .attr('x', -margin.left)
                    .attr('y', 10)
                    .attr('fill', 'currentColor')
                    .attr('text-anchor', 'start')
                    .text('↑ Daily Close ($)')
            );
    // add y axis
    const gy = svg.append('g').call(yAxis, y);

    // line generator
    const line = d3
        .line()
        .x((d) => x(d.date))
        .y((d) => y(d.close));

    // const area = (x, y) =>
    //     d3
    //         .area()
    //         .defined((d) => !isNaN(d.close))
    //         .x((d) => x(d.date))
    //         .y0(y(0))
    //         .y1((d) => y(d.close));

    // add line to path
    // const path = svg
    //     .append('path')
    //     .attr('fill', 'none')
    //     .attr('stroke', 'steelblue')
    //     .attr('stroke-width', 1.5)
    //     .attr('d', line(marketData));

    // create tooltip
    // const tooltip = svg.append('g');

    function formatValue(value) {
        return value.toLocaleString('en', {
            style: 'currency',
            currency: 'USD',
        });
    }
    function formatDate(date) {
        return date.toLocaleString('en', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            timeZone: 'UTC',
        });
    }

    // add a circle element
    const circle = svg
        .append('circle')
        .attr('r', 0)
        .attr('fill', '#ad1639')
        .style('stroke', 'white')
        .attr('opacity', 0.8)
        .style('pointer-events', 'none');

    // create tooltip div
    const tooltip = d3.select('body').append('div').attr('class', 'tooltip');

    function mousemoved(event) {
        const [xCoord] = d3.pointer(event, this);
        const bisectDate = d3.bisector((d) => d.date).left;
        const x0 = x.invert(xCoord);
        const i = bisectDate(marketData, x0, 1);
        const d0 = marketData[i - 1];
        const d1 = marketData[i];
        const d = x0 - d0.date > d1.date - x0 ? d1 : d0;
        const xPos = x(d.date);
        const yPos = y(d.close);

        circle.attr('cx', xPos).attr('cy', yPos);

        // Add transition for the circle radius

        circle.transition().duration(50).attr('r', 5);

        // add in  our tooltip
        tooltip
            .style('display', 'block')
            .style('left', `${xPos + 40}px`)
            .style('top', `${yPos + 50}px`)
            .html(
                `<strong>Close:</strong> ${
                    d.close !== undefined ? formatValue(d.close) : 'N/A'
                }<br><strong>Date:</strong> ${formatDate(d.date)}`
            );
    }

    function mouseleft() {
        circle.transition().duration(50).attr('r', 0);

        tooltip.style('display', 'none');
    }

    const clip = svg
        .append('defs')
        .append('clipPath')
        .attr('id', 'clip')
        .append('rect')
        .attr('width', width)
        .attr('height', height)
        .attr('x', 0)
        .attr('y', 0);

    const brush = d3
        .brushX()
        .extent([
            [margin.left, 0.5],
            [width - margin.right, height - margin.bottom + 0.5],
        ])
        // .on('brush', brushed)
        .on('end', updateChart);

    const area = svg.append('g').attr('clip-path', 'url(#clip)');

    const areaGenerator = d3
        .area()
        .x((d) => x(d.date))
        .y0(y(0))
        .y1((d) => y(d.close));

    // Add the area
    area.append('path')
        .datum(marketData)
        .attr('class', 'myArea') // I add the class myArea to be able to modify it later on.
        .attr('fill', '#69b3a2')
        .attr('fill-opacity', 0.5)
        .attr('stroke', 'black')
        .attr('stroke-width', 1)
        .attr('d', areaGenerator);

    area.append('g').attr('class', 'brush').call(brush);

    // A function that set idleTimeOut to null
    let idleTimeout;
    function idled() {
        idleTimeout = null;
    }

    // A function that update the chart for given boundaries
    function updateChart(event) {
        // What are the selected boundaries?
        let extent = event.selection;

        // If no selection, back to initial coordinate. Otherwise, update X axis domain
        if (!extent) {
            if (!idleTimeout) return (idleTimeout = setTimeout(idled, 350)); // This allows to wait a little bit
            x.domain([4, 8]);
        } else {
            x.domain([x.invert(extent[0]), x.invert(extent[1])]);
            area.select('.brush').call(brush.move, null); // This remove the grey brush area as soon as the selection has been done
        }

        // Update axis and area position
        gx.transition().duration(1000).call(d3.axisBottom(x));
        area.select('.myArea')
            .transition()
            .duration(1000)
            .attr('d', areaGenerator);
    }

    // If user double click, reinitialize the chart
    svg.on('dblclick', function () {
        x.domain(d3.extent(marketData, (d) => d.date));
        gx.transition().call(d3.axisBottom(x));
        area.select('.myArea').transition().attr('d', areaGenerator);
    });

    svg.append('g').call(xAxis, x, height);

    return svg.node();
}

// TODO
// tell story about covid bad for markets
// each stock exchange at a time
// in the end let user plot chosen stock exchange for a given time period?
// tooltip exact day and price hover - click to open day on yahoo finance?
// annotation peak and valley of market

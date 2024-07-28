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
        // d3.select('body').append(() => plot(marketsData['NASDAQ']));
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
    console.log('hello world');

    // x position scale
    const x = d3.scaleUtc(
        d3.extent(marketData, (d) => d.date),
        [margin.left, width - margin.right]
    );
    // y position scale
    const y = d3.scaleLinear(
        [0, d3.max(marketData, (d) => d.close)],
        [height - margin.bottom, margin.top]
    );

    // line generator
    const line = d3
        .line()
        .x((d) => x(d.date))
        .y((d) => y(d.close));

    // create svg
    const svg = d3
        .create('svg')
        .attr('viewBox', [0, 0, width, height])
        .attr('width', width)
        .attr('height', height)
        .attr(
            'style',
            'max-width: 100%; height: auto; height: intrinsic; font: 10px sans-serif;'
        )
        .style('-webkit-tap-highlight-color', 'transparent')
        .style('overflow', 'visible');
    // .on('mouseover', pointermoved)
    // .on('pointerleave', pointerleft)
    // .on('touchstart', (event) => event.preventDefault());

    // add x axis
    svg.append('g')
        .attr('transform', `translate(0,${height - margin.bottom})`)
        .call(
            d3
                .axisBottom(x)
                .ticks(width / 80)
                .tickSizeOuter(0)
        );

    // add y axis
    svg.append('g')
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

    // add line to path
    svg.append('path')
        .attr('fill', 'none')
        .attr('stroke', 'steelblue')
        .attr('stroke-width', 1.5)
        .attr('d', line(marketData));

    // create tooltip
    const tooltip = svg.append('g');

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

    // Add the event listeners that show or hide the tooltip.

    return svg.node();
}

// TODO
// tell story about covid bad for markets
// each stock exchange at a time
// in the end let user plot chosen stock exchange for a given time period?
// tooltip exact day and price hover - click to open day on yahoo finance?
// annotation peak and valley of market

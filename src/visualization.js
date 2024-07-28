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

        d3.select('#Page1').on('click', () => {
            d3.selectAll('svg').remove();
            d3.select('body').append(() =>
                plot(marketsData['NYSE'], 'New York Stock Exchange (1966-2021)')
            );
        });

        d3.select('#Page2').on('click', () => {
            d3.selectAll('svg').remove();

            d3.select('body').append(() =>
                plot(marketsData['TSE'], 'Tokyo Stock Exchange (1966-2021)')
            );
        });
        d3.select('#Page3').on('click', () => {
            d3.selectAll('svg').remove();

            d3.select('body').append(() =>
                plot(
                    marketsData['HKSE'],
                    'Hong Kong Stock Exchange (1987-2021)'
                )
            );
        });
        d3.select('#Page4').on('click', () => {
            d3.selectAll('svg').remove();

            d3.select('body').append(() =>
                plot(
                    marketsData['EUR'],
                    'Euronext European Stock Exchange(2000-2021)'
                )
            );
        });
    })
    .catch((error) => {
        console.log(error);
    });

// Declare the chart dimensions and margins.
const width = 900;
const height = 600;
const margin = { top: 20, right: 30, bottom: 30, left: 40 };

function plot(marketData, title = '') {
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
        .attr('viewBox', [
            0,
            0,
            width + margin.right + margin.left,
            height + margin.top + margin.bottom,
        ])
        .attr('width', width + margin.right + margin.left)
        .attr('height', height + margin.top + margin.bottom)
        .attr('class', 'lineChart')
        .style('display', 'block')
        // .attr(
        //     'style',
        //     'max-width: 100%; height: auto; height: intrinsic; font: 10px sans-serif;'
        // )
        // .style('-webkit-tap-highlight-color', 'transparent')
        .style('overflow', 'visible')
        .on('mousemove', mousemoved)
        .on('mouseleave', mouseleft);
    // .on('touchstart', (event) => event.preventDefault());

    svg.append('text')
        .attr('x', width / 2)
        .attr('y', 0 - margin.top / 2)
        .attr('text-anchor', 'middle')
        .style('font-size', '16px')
        .style('text-decoration', 'underline')
        .text(title);

    const xAxis = (g, x) =>
        g
            .attr('transform', `translate(0,${height - margin.bottom})`)
            .call(
                d3
                    .axisBottom(x)
                    .ticks(width / 200)
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

    const annotations = [
        {
            note: {
                title: 'Black Tuesday 1987',
                lineType: 'none',
                align: 'middle',
                wrap: 150, //custom text wrapping
            },
            subject: {
                height: height - margin.top - margin.bottom,
                width: x(new Date('12/1/1987')) - x(new Date('10/20/1987')),
            },
            type: d3.annotationCalloutRect,
            y: margin.top,
            disable: ['connector'], // doesn't draw the connector
            //can pass "subject" "note" and "connector" as valid options
            dx: (x(new Date('12/1/1987')) - x(new Date('10/20/1987'))) / 2,
            data: { x: '10/20/1987' },
        },
        {
            note: {
                title: '2007–2008 Financial Crisis',
                lineType: 'none',
                align: 'middle',
                wrap: 150, //custom text wrapping
            },
            subject: {
                height: height - margin.top - margin.bottom,
                width: x(new Date('4/1/2009')) - x(new Date('12/1/2007')),
            },
            type: d3.annotationCalloutRect,
            y: margin.top,
            disable: ['connector'], // doesn't draw the connector
            //can pass "subject" "note" and "connector" as valid options
            dx: (x(new Date('4/1/2009')) - x(new Date('12/1/2007'))) / 2,
            data: { x: '12/1/2007' },
        },

        {
            note: {
                title: 'DotCom + 9/11',
                lineType: 'none',
                align: 'middle',
                wrap: 150, //custom text wrapping
            },
            subject: {
                height: height - margin.top - margin.bottom,
                width: x(new Date('01/01/2001')) - x(new Date('01/01/2003')),
            },
            type: d3.annotationCalloutRect,
            y: margin.top,
            disable: ['connector'], // doesn't draw the connector
            //can pass "subject" "note" and "connector" as valid options
            dx: (x(new Date('01/01/2001')) - x(new Date('01/01/2003'))) / 2,
            data: { x: '01/01/2003' },
        },

        {
            note: {
                title: 'Covid-19',
                lineType: 'none',
                align: 'middle',
                wrap: 150, //custom text wrapping
            },
            subject: {
                height: height - margin.top - margin.bottom,
                width: x(new Date('03/01/2019')) - x(new Date('07/01/2021')),
            },
            type: d3.annotationCalloutRect,
            y: margin.top,
            disable: ['connector'], // doesn't draw the connector
            //can pass "subject" "note" and "connector" as valid options
            dx: (x(new Date('03/01/2019')) - x(new Date('07/01/2021'))) / 2,
            data: { x: '07/01/2021' },
        },
    ];

    const type = d3.annotationCustomType(d3.annotationBadge, {
        subject: { radius: 10 },
    });

    const makeAnnotations = d3
        .annotation()
        .type(type)
        .accessors({
            x: function (d) {
                return x(new Date(d.x));
            },
            y: function (d) {
                return y(d.y);
            },
        })
        .annotations(annotations);

    svg.append('g').attr('class', 'annotation-group').call(makeAnnotations);

    // line generator
    const line = d3
        .line()
        .x((d) => x(d.date))
        .y((d) => y(d.close));

    // create tooltip
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

    // circle pointer for tooltip
    const tooltipPointer = svg
        .append('circle')
        .attr('r', 0)
        .attr('fill', '#ad1639')
        .style('stroke', 'white')
        .attr('opacity', 0.8)
        .style('pointer-events', 'none');

    // create tooltip div
    // const tooltip = d3.select('body').append('div').attr('class', 'tooltip');
    const tooltip = d3.select('#tooltip');

    svg.append('rect');

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

        tooltipPointer.attr('cx', xPos).attr('cy', yPos).raise();

        tooltipPointer.transition().duration(50).attr('r', 5);

        // add in  our tooltip
        tooltip
            .attr('class', 'tooltip')
            .style('display', 'block')
            .style('left', `${xPos + 25}px`)
            .style('top', `${yPos + 35}px`)
            .attr('position', 'fixed')
            .html(
                `<strong>Close:</strong> ${
                    d.close !== undefined ? formatValue(d.close) : 'N/A'
                }<br><strong>Date:</strong> ${formatDate(d.date)}`
            );
        // tooltip.select('.close').text('test');
    }

    function mouseleft() {
        tooltipPointer.transition().duration(50).attr('r', 0);
        tooltip.style('display', 'none');
    }

    // area for zoom
    const clip = svg
        .append('defs')
        .append('clipPath')
        .attr('id', 'clip')
        .append('rect')
        .attr('width', width)
        .attr('height', height)
        .attr('x', 0)
        .attr('y', 0);

    // select brush for zoom in
    const brush = d3
        .brushX()
        .extent([
            [margin.left, 0.5],
            [width - margin.right, height - margin.bottom + 0.5],
        ])
        .on('end', updateChart);

    const plot = svg.append('g').attr('clip-path', 'url(#clip)');

    // Add the line
    plot.append('path')
        .datum(marketData)
        .attr('class', 'myPlot') // I add the class myPlot to be able to modify it later on.
        .attr('fill', 'none')
        .attr('stroke', 'steelblue')
        .attr('stroke-width', 1.5)
        .attr('d', line);

    plot.append('g').attr('class', 'brush').call(brush);

    // A function that set idleTimeOut to null
    let idleTimeout;
    const idled = () => {
        idleTimeout = null;
    };

    // A function that update the chart for given boundaries
    function updateChart(event) {
        // What are the selected boundaries?
        let extent = event.selection;

        // If no selection, back to initial coordinate. Otherwise, update X axis domain
        if (!extent) {
            if (!idleTimeout) return (idleTimeout = setTimeout(idled, 350)); // This allows to wait a little bit
            // x.domain([4, 8]);
            x.domain(d3.extent(marketData, (d) => d.date));
        } else {
            const sameDay = (d1, d2) => {
                return (
                    d1.getFullYear() === d2.getFullYear() &&
                    d1.getMonth() === d2.getMonth() &&
                    d1.getDate() === d2.getDate()
                );
            };
            if (sameDay(x.invert(extent[0]), x.invert(extent[1]))) {
                x.domain(d3.extent(marketData, (d) => d.date));
            } else {
                x.domain([x.invert(extent[0]), x.invert(extent[1])]);
            }
            plot.select('.brush').call(brush.move, null); // This remove the grey brush area as soon as the selection has been done
        }

        // Update axis and line position
        gx.transition()
            .duration(1500)
            .call(
                d3
                    .axisBottom(x)
                    .ticks(width / 200)
                    .tickSizeOuter(0)
            );
        plot.select('.myPlot').transition().duration(1500).attr('d', line);
    }

    // If user double click, reinitialize the chart
    svg.on('dblclick', function () {
        x.domain(d3.extent(marketData, (d) => d.date));
        gx.transition().call(
            d3
                .axisBottom(x)
                .ticks(width / 200)
                .tickSizeOuter(0)
        );

        plot.select('.myPlot').transition().attr('d', line);
    });

    return svg.node();
}

// TODO
// tell story about covid bad for markets
// each stock exchange at a time
// in the end let user plot chosen stock exchange for a given time period?
// tooltip exact day and price hover - click to open day on yahoo finance?
// annotation peak and valley of market

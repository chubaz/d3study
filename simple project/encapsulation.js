
// The bar function is called and assigned to a variable which essentially allows for modification of its attributes through the
// accessor functions. It also unifies all the steps required to build the chart (Scales, Axes, SVG, Drawing of Axes and Bars).
// These are called in succession within the function that is exported when the bar function is called.
// How do you modify the context and when do you call the function to execute the build of the chart?

function bar() {
    // Attributes
    
    let data;
    let svg;
    let margin = {
        top: 20,
        bottom: 40,
        left: 40,
        right:20
    };
    let width = 600;
    let height = 400;
    
    let xScale;
    let yScale;
    let xAxis;
    let yAxis;
    let chartWidth;
    let chartHeight;

    const dispatcher = d3.dispatch('customMouseOver');

    // Extractors

    const getFrequency = ({frequency}) => frequency;
    const getLetter = ({letter}) => letter;

    function exports(_selection) {
        _selection.each(function(_data) {
            data = _data;
            chartHeight = height - margin.bottom - margin.top;
            chartWidth = width - margin.left - margin.right;

            // Main sequence
            buildScales();
            buildAxes();
            buildSVG(this);
            drawAxes();
            drawBars();
        });
    }

    // Building Blocks

    function buildSVG(container) {
        if (!svg) {
            svg = d3.select(container)
                .append('svg')
                .classed('bar-chart', true)
                .append('g')
                .attr('width', width)
                .attr('height', height)
            buildContainerGroups();
        }
        
        d3.select('.bar-chart')
            .attr('width', width)
            .attr('height', height)
        svg.attr('width', width)            // we only build the container once to avoid doing so repeatedly on updates of the chart.
            .attr('height', height)
    }
    
    function buildContainerGroups() {
        let container = svg
            .append('g')
            .classed('container-group', true)
            .attr(
                'transform',
                `translate(${margin.left},${margin.top})`  // This introduces the margin convention at the svg object, meaning we do not have to care of margins anymore
            );
        container
            .append('g')
            .classed('chart-group', true);
        container
            .append('g')
            .classed('x-axis-group axis', true);
        container
            .append('g')
            .classed('y-axis-group axis', true);
    
    }
    
    function buildScales() {
        xScale = d3.scaleBand()
            .rangeRound([0, chartWidth])
            .padding([0.25])
            .domain(data.map(getLetter));
        yScale = d3.scaleLinear()
            .rangeRound([chartHeight, 0])
            .domain([0, d3.max(data, getFrequency)]);
    }
    
    function buildAxes() {
        xAxis = d3.axisBottom(xScale);
        yAxis = d3.axisLeft(yScale)
            .ticks(10, '%');
    }
    
    function drawAxes() {
        svg.select('.x-axis-group.axis')
            .attr('transform', `translate(0,${chartHeight})`)
            .call(xAxis)
        svg.select('.y-axis-group.axis')
            .call(yAxis)
                .append('text')
                .attr('transform', 'rotate(-90)')
                .attr('y', 6)
                .attr('dy', '0.71em')
                .attr('text-anchor', 'end')
                .text('Frequency');
    }
    
    function drawBars() {
        let bars = svg.select('.chart-group').selectAll('.bar')
            .data(data);
        console.log(bars)
        bars.enter()
            .append('rect')
            .classed('bar', true)
            .attr('x', ({letter}) => xScale(letter))
            .attr('y', ({frequency}) => yScale(frequency))
            .attr('width', xScale.bandwidth())
            .attr('height', ({frequency}) => chartHeight - yScale(frequency))
            .on('mouseover', function(d) {
               dispatcher.call('customMouseOver', this, d);
            });
        bars.exit()
            .style('opacity', 0)
            .remove();
    }

    // API

    exports.height = function(_x) {
        if(!arguments.length) {
            return height;
        }
        height = _x;
        return this; // this returns the export function
    };

    exports.margin = function(_x) {
        if(!arguments.length) {
            return margin;
        }
        margin = {...margin, ..._x}
        return this;
    };

    exports.width = function(_x) {
        if(!arguments.length) {
            return width;
        }
        width = _x;

        return this;
    };

    // This code applies the arguments to the dispatcher and returns the module to allow the method chaining
    exports.on = function() {
        let value = dispatcher.on.apply(dispatcher, arguments);
        return value === dispatcher ? exports : value;
    };

    return exports;
}






export default bar;


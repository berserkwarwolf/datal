var charts = charts || {
    models: {},
    views: {}
};


charts.views.D3LineChart = charts.views.LineChart.extend({

    initialize: function(){
        this.constructor.__super__.initialize.apply(this, arguments);

        // Set the dimensions of the canvas / graph
        this.margin = {top: 30, right: 20, bottom: 30, left: 50};
        this.width = 600 - this.margin.left - this.margin.right;
        this.height = 270 - this.margin.top - this.margin.bottom;

        // Adds the svg canvas
        this.svg = d3.select(this.el).append("svg")
            .attr("width", this.width + this.margin.left + this.margin.right)
            .attr("height", this.height + this.margin.top + this.margin.bottom)
            .append("g")
            .attr("transform", "translate(" + this.margin.left + "," + this.margin.top + ")");

        return this;
    },

    updateAxes: function () {
        // Define the axes
        var xAxis = d3.svg.axis().scale(this.xScale)
            .orient("bottom").ticks(5);

        var yAxis = d3.svg.axis().scale(this.yScale)
            .orient("left").ticks(5);

        // Add the X Axis
        this.svg.append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(0," + this.height + ")")
            .call(xAxis);

        // Add the Y Axis
        this.svg.append("g")
            .attr("class", "y axis")
            .call(yAxis);

        return this;
    },

    render: function () {
        var data = this.model.data.get('rows');

        // Set the ranges
        this.xScale = d3.scale.linear().range([0, this.width]);
        this.yScale = d3.scale.linear().range([this.height, 0]);

        // Define the line
        this.line = d3.svg.line()
            .x(function(d) { return this.xScale(d.date); })
            .y(function(d) { return this.yScale(d.sales); });

        // Get the data
        data.forEach(function (d) {
            d.date = +d[0];
            d.sales = +d[1];
        })

        // Scale the range of the data
        this.xScale.domain(d3.extent(data, function(d) { return d.date; }));
        this.yScale.domain(d3.extent(data, function(d) { return d.sales; }));

        // Add the valueline path.
        this.svg.append("path")
            .attr("class", "line")
            .attr("d", this.line(data));

        this.updateAxes();

        return this;
    }
});

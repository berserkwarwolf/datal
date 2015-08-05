var charts = charts || {
    models: {},
    views: {}
};


charts.views.Chart = Backbone.View.extend({
    initialize: function(){
        if (this.model.get('type') === null) {
            console.error('Chart models must define a type property');
        }
    }
});


charts.views.LineChart = charts.views.Chart.extend({
    initialize: function(){
        if (this.model.get('type') !== 'line') {
            console.error('A DataLine model must be suplied');
        }
    }
});


charts.views.GoogleLineChart = charts.views.LineChart.extend({
    initialize: function (options) {
        this.constructor.__super__.initialize.apply(this, arguments);
    },

    formatData: function (data) {
        var dataTable = new google.visualization.DataTable();
        _.each(data.fields, function (field) {
            dataTable.addColumn(field[0], field[1]);
        });
        dataTable.addRows(data.rows);
        return dataTable;
    },

    render: function () {
        var dataTable = this.formatData(this.model.data.toJSON());

        var options = this.model.get('options');

        var chart = new google.visualization.LineChart(this.el);

        chart.draw(dataTable, options);

        return this;
    }
});


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


charts.views.C3LineChart = charts.views.LineChart.extend({
    initialize: function (options) {
        this.constructor.__super__.initialize.apply(this, arguments);
    },
    formatData: function (data) {
        var result = [];

        result.push(_.map(data.fields, function (field) {return field[1];}));
        var dataArray = result.concat(data.rows);

        return dataArray;
    },
    render: function () {
        var rows = this.formatData(this.model.data.toJSON()),
            options = this.model.get('options'),
            fieldnames = rows[0];

        this.chart = c3.generate({
            bindto: this.el,
            data: {
                x: fieldnames[0] || 'x',
                rows: rows
            },
            axis: {
              y: {
                label: {
                  text: fieldnames[1],
                  position: 'outer-middle'
                }
              },
              x: {
                label: {
                  text: fieldnames[0],
                  position: 'outer-center'
                }
              }
            },
            legend: {
                position: options.legend.position || 'right'
            }
        });
    }
});


charts.views.NVD3LineChart = charts.views.LineChart.extend({

    initialize: function (options) {
        this.constructor.__super__.initialize.apply(this, arguments);
    },

    formatData: function() {
      var rows = this.model.data.get('rows');

      var result = _.map(rows, function (row) {
          return {x: row[0], y: row[1]};
      });
      console.log(result);
      return [
        {
          values: result,
          key: 'My chart',
          color: '#ff7f0e'
        }
      ];
    },

    render: function () {
        var self = this;
        nv.addGraph(function() {
          var chart = nv.models.lineChart()
            .useInteractiveGuideline(true)
            ;

          chart.xAxis
            .axisLabel('Year')
            .tickFormat(d3.format(',r'))
            ;

          chart.yAxis
            .axisLabel('Voltage (v)')
            .tickFormat(d3.format('.02f'))
            ;

          d3.select('.js-nvd3-chart svg')
            .datum(self.formatData())
            .transition().duration(500)
            .call(chart)
            ;

          nv.utils.windowResize(chart.update);

          return chart;
        });
    }
})


charts.views.PlottableLineChart = charts.views.LineChart.extend({

    initialize: function (options) {
        var self = this;
        this.constructor.__super__.initialize.apply(this, arguments);

        d3.select(window).on('resize', function  () {
            self.chart.redraw();
        });
    },

    render: function () {
        var rows = this.model.data.get('rows');

        var xScale = new Plottable.Scale.Linear();
        var yScale = new Plottable.Scale.Linear();

        var xAxis = new Plottable.Axis.Numeric(xScale, "bottom");
        var yAxis = new Plottable.Axis.Numeric(yScale, "left");


        var plot = new Plottable.Plot.Line(xScale, yScale);
        plot.addDataset(rows);
        plot.animate(true);
        var lines = new Plottable.Component.Gridlines(xScale, yScale);
        lines.below(plot);

        function getXDataValue(d) {
            return d[0];
        }
        plot.project("x", getXDataValue, xScale);
        function getYDataValue(d) {
            return d[1];
        }
        plot.project("y", getYDataValue, yScale);

        this.chart = new Plottable.Component.Table([
            [yAxis, lines.below(plot)],
            [null,  xAxis]
            ]);

        this.chart.renderTo('.js-plottable-chart');
        var panZoom   = new Plottable.Interaction.PanZoom(xScale, yScale);

        this.chart.registerInteraction(panZoom);
    }
});
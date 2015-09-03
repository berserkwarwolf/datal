var charts = charts || {
    models: {},
    views: {}
};


charts.views.PlottableLineChart = charts.views.LineChart.extend({

    initialize: function () {
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
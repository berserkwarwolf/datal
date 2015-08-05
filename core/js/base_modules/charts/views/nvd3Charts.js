var charts = charts || {
    models: {},
    views: {}
};


charts.views.NVD3LineChart = charts.views.LineChart.extend({

    initialize: function (options) {
        this.constructor.__super__.initialize.apply(this, arguments);
    },

    formatData: function() {
      var rows = this.model.data.get('rows');

      var result = _.map(rows, function (row) {
          return {x: row[0], y: row[1]};
      });

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

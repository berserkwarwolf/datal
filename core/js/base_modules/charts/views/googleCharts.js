var charts = charts || {
    models: {},
    views: {}
};


charts.views.GoogleLineChart = charts.views.LineChart.extend({
    initialize: function (options) {
        this.constructor.__super__.initialize.apply(this, arguments);
    },

    formatData: function (data) {
        console.log('raw data', data);
        var dataTable = new google.visualization.DataTable();
        _.each(data.fields, function (field) {
            dataTable.addColumn(field[0], field[1]);
        });
        dataTable.addRows(data.rows);
        return dataTable;
    },

    render: function () {
        console.log('model data', this.model.data);
        var dataTable = this.formatData(this.model.data.toJSON());

        var options = this.model.get('options');

        this.chart = new google.visualization.LineChart(this.el);

        this.chart.draw(dataTable, options);

        return this;
    }
});


charts.views.GoogleBarChart = charts.views.BarChart.extend({
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

        this.chart = new google.visualization.ColumnChart(this.el);

        this.chart.draw(dataTable, options);

        return this;
    }

})
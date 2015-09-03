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

charts.views.GoogleAreaChart = charts.views.AreaChart.extend({
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

        options.isStacked = true;

        this.chart = new google.visualization.AreaChart(this.el);

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

        options.isStacked = false;

        this.chart = new google.visualization.BarChart(this.el);

        this.chart.draw(dataTable, options);

        return this;
    }

});

charts.views.GoogleColumnChart = charts.views.ColumnChart.extend({
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
        console.log("dataTable:", dataTable);

        var options = this.model.get('options');

        options.isStacked = false;

        this.chart = new google.visualization.ColumnChart(this.el);

        this.chart.draw(dataTable, options);

        return this;
    }

});

charts.views.GooglePieChart = charts.views.PieChart.extend({
    initialize: function (options) {
        this.constructor.__super__.initialize.apply(this, arguments);
    },

    formatData: function (data) {
        var dataTable = new google.visualization.DataTable();

        // view parse data

          dataTable.addColumn('string', 'Demo Data');
          dataTable.addColumn('number', 'Demo');
          dataTable.addRows([
            ['Demo1', 33],
            ['Demo2', 26],
            ['Demo3', 22]
          ]);

       /* _.each(data.fields, function (field,i) {
            dataTable.addColumn((i==0)?'string':field[0], field[1]);
        });

        console.log(data.rows);
        dataTable.addRows(data.rows);*/

        return dataTable;
    },

    render: function () {
        var dataTable = this.formatData(this.model.data.toJSON());

        var options = this.model.get('options');

        this.chart = new google.visualization.PieChart(this.el);

        this.chart.draw(dataTable, options);

        return this;
    }

});

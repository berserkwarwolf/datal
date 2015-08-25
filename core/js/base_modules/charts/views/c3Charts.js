var charts = charts || {
    models: {},
    views: {}
};


charts.views.C3LineChart = charts.views.LineChart.extend({
    initialize: function (options) {
        this.constructor.__super__.initialize.apply(this, arguments);
    },

    valid: function(){
        if(this.model.data.toJSON().fields.length && this.model.data.toJSON().rows.length){
            return true;
        } else {
            console.error('La data no sirve para un linechart de C3');
        }
        return false;
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
                position: 'right'
            }
        });
    }
});

charts.views.C3AreaChart = charts.views.LineChart.extend({
    initialize: function (options) {
        this.constructor.__super__.initialize.apply(this, arguments);
    },

    valid: function(){
        if(this.model.data.toJSON().fields.length && this.model.data.toJSON().rows.length){
            return true;
        } else {
            console.error('La data no sirve para un areachart de C3');
        }
        return false;
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

        var types = {};

        _.each(fieldnames,function(e){
            types[e] = 'area'
        });

        this.chart = c3.generate({
            bindto: this.el,
            data: {
                x: fieldnames[0] || 'x',
                rows: rows,
                types: types,
                groups: [fieldnames]
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
                position: 'right'
            }
        });
    }
});

charts.views.C3BarChart = charts.views.BarChart.extend({
    initialize: function (options) {
        this.constructor.__super__.initialize.apply(this, arguments);
    },

    valid: function(){
        if(this.model.data.toJSON().fields.length && this.model.data.toJSON().rows.length){
            return true;
        } else {
            console.error('La data no sirve para un linechart de C3');
        }
        return false;
    },

    formatData: function (dataModel) {
        var data = dataModel.get('rows'),
            fieldnames = [_.map(dataModel.get('fields'), function (field) {
                return field[1];
            })];
        return fieldnames.concat(data);
    },

    render: function () {
        var rows = this.formatData(this.model.data);

        this.chart = c3.generate({
            bindto: this.el,
            data: {
                type: 'bar',
                x: rows[0][0],
                rows: rows,
            },
            axis: {
                rotated: true,
                x: {
                    type: 'category'
                }
            },
            bar: {
                width: {
                    ratio: 0.5 // this makes bar width 50% of length between ticks
                }
            }
        });
    }
});

charts.views.C3ColumnChart = charts.views.BarChart.extend({
    initialize: function (options) {
        this.constructor.__super__.initialize.apply(this, arguments);
    },

    valid: function(){
        if(this.model.data.toJSON().fields.length && this.model.data.toJSON().rows.length){
            return true;
        } else {
            console.error('La data no sirve para un linechart de C3');
        }
        return false;
    },

    formatData: function (dataModel) {
        var data = dataModel.get('rows'),
            fieldnames = [_.map(dataModel.get('fields'), function (field) {
                return field[1];
            })];
        return fieldnames.concat(data);
    },

    render: function () {
        var rows = this.formatData(this.model.data);

        this.chart = c3.generate({
            bindto: this.el,
            data: {
                type: 'bar',
                x: rows[0][0],
                rows: rows,
            },
            axis: {
                x: {
                    type: 'category'
                }
            },
            bar: {
                width: {
                    ratio: 0.5 // this makes bar width 50% of length between ticks
                }
            }
        });
    }
});

charts.views.C3PieChart = charts.views.PieChart.extend({
    initialize: function (options) {
        this.constructor.__super__.initialize.apply(this, arguments);
    },

    valid: function(){
        if(this.model.data.toJSON().fields.length && this.model.data.toJSON().rows.length){
            return true;
        } else {
            console.error('La data no sirve para un piechart de C3');
        }
        return false;
    },

    formatData: function (dataModel) {
        var data = dataModel.get('rows'),
            fieldnames = [_.map(dataModel.get('fields'), function (field) {
                return field[1];
            })];
        return fieldnames.concat(data);
    },

    render: function () {
        var rows = this.formatData(this.model.data);

        this.chart = c3.generate({
            bindto: this.el,
            data: {
                type: 'pie',
                rows: rows,
            }
        });
    }
});

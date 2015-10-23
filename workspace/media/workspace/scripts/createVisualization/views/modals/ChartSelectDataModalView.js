var ChartSelectDataModalView = ModalView.extend({
	events: {
        'click button.btn-done':'onClickDone',
		'click button.btn-cancel':'onClickCancel'
	},

	initialize: function(options){
		this.collection = new DataTableSelectedCollection();
        this.dataStreamModel = options.dataStreamModel;

        this.rangeDataModel = new DataTableSelectionModel({id: 1, name: 'range_data', notEmpty: true});
        this.rangeLabelsModel = new DataTableSelectionModel({id: 2, name: 'range_labels', notEmpty: true});
        this.rangeHeadersModel = new DataTableSelectionModel({id: 3, name: 'range_headers', notEmpty: true});


        this.selectedCellRangeView = new SelectedCellRangeView({
            el: this.$('.selected-ranges-view'),
            collection: this.collection,
        });

        this.on('open', this.onOpen, this);
        this.listenTo(this.dataStreamModel, 'change', this.onLoadDataStream, this);


        this.listenTo(this.collection, 'add change remove reset', this.validate, this);
        this.listenTo(this.selectedCellRangeView, 'focus-input', function (name) {
            this._cacheFocusedInput = name;
        });
        return this;
    },

    onOpen: function () {
        this.selectedCellRangeView.focus();
        this._cached_lat = this.model.get('range_lat');
        this._cached_lon = this.model.get('range_lon');
        this._cached_data = this.model.get('range_data');
        this._cached_trace = this.model.get('range_trace');
        this.rangeLatModel.set('excelRange', this._cached_lat);
        this.rangeLonModel.set('excelRange', this._cached_lon);
        this.rangeInfoModel.set('excelRange', this._cached_data);
        this.rangeTraceModel.set('excelRange', this._cached_trace);
        this.setHeights();
        this.setAxisTitles();
    },

    onClickDone: function (e) {
        this.model.set({
            range_data: this.rangeDataModel.get('excelRange'),
            range_headers: this.rangeHeadersModel.get('excelRange'),
            range_labels: this.rangeLabelsModel.get('excelRange')
        });
        this.close();
    },

    onClickCancel: function (e) {
        this.rangeDataModel.set('excelRange', this._cached_range_data);
        this.rangeLabelsModel.set('excelRange', this._cached_range_labels);
        this.rangeHeadersModel.set('excelRange', this._cached_range_headers);
        this.onClickDone();
        this.close();
    },

    onLoadDataStream: function (model) {
        this.dataTableView = new DataTableView({
            el: this.$('.data-table-view'),
            collection: this.collection,
            datastream: model.toJSON()
        });
        this.dataTableView.render();
        this.listenTo(this.dataTableView, 'afterSelection', function (selection) {
            this.addSelection(this._cacheFocusedInput);
        }, this);
        this.listenTo(this.dataTableView, 'afterSelectionEnd', function () {
            this.addSelection(this._cacheFocusedInput);
        }, this);
        this.dataTableView.table.render();
    },

    addSelection: function (name) {
        var selection = this.dataTableView.getSelection(),
            model;

        if (name === 'range_data') {
            this.collection.remove(1);
            model = this.rangeDataModel;
        } else if (name === 'range_labels') {
            this.collection.remove(2);
            model = this.rangeLabelsModel;
        } else if (name === 'range_headers') {
            this.collection.remove(3);
            model = this.rangeHeadersModel;
        }
        model.set(selection);

        if (model.isValid()) {
            this.collection.add(model);
        } else {
            // alert(model.validationError)
        }
    },

    validate: function () {
        var hasData = this.rangeDataModel.get('excelRange') !== '',
            hasLabels = this.rangeLabelsModel.get('excelRange') !== '',
            hasHeaders = this.rangeHeadersModel.get('excelRange') !== '',
            validData = this.rangeDataModel.isValid(),
            validLabels = this.rangeLabelsModel.isValid(),
            validHeaders = this.rangeHeadersModel.isValid();

        if (hasData && hasLabels && validHeaders && validData && validLabels && validHeaders) {
            this.enableDoneBtn(false);
        } else {
            this.enableDoneBtn(true);
        }
    },

    enableDoneBtn: function (enable) {
        if (enable) {
            this.$('button.btn-done').attr('disabled', 'disabled');
        } else {
            this.$('button.btn-done').removeAttr('disabled');
        }
    },

    setHeights: function(t){
        var self = this;

        var sidebar =  this.$el.find('.sidebar'),
            table =  this.$el.find('.table-view');

        $(window).resize(function(){

            windowHeight = $(window).height();
            
            var sidebarHeight =
              windowHeight
            - parseFloat(  self.$el.find('.context-menu').height() )
            - parseFloat( sidebar.parent().css('padding-top').split('px')[0] )
            - 30 // As margin bottom
            ;

            sidebar.css('height', sidebarHeight+'px');
            table.css('height', sidebarHeight+'px');

        }).resize();
    },

    setAxisTitles: function(){
        var invertedAxis = (_.isUndefined(this.model.get('invertedAxis')))?'false':this.model.get('invertedAxis');
        var invertedAxisClass = 'invertedAxis-' + invertedAxis;
        this.$('.invertedAxisLabel').hide();
        this.$('.'+invertedAxisClass).show();
    }
});
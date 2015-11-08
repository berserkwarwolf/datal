var ModalView = Backbone.View.extend({
	events: {
        'click button.btn-done':'onClickDone',
		'click button.btn-cancel':'onClickCancel'
	},

	initialize: function(options){
        // models
        this.collection = new DataTableSelectedCollection();
        this.dataStreamModel = options.dataStreamModel;

        this.rangeLatModel = new DataTableSelectionModel({id: 1, name: 'range_lat', notEmpty: true});
        this.rangeLonModel = new DataTableSelectionModel({id: 2, name: 'range_lon', notEmpty: true});
        this.rangeInfoModel = new DataTableSelectionModel({id: 3, name: 'range_data', notEmpty: true});
        this.rangeTraceModel = new DataTableSelectionModel({id: 4, name: 'range_trace', notEmpty: true});

        this.rangeDataModel = new DataTableSelectionModel({id: 1, name: 'range_data', notEmpty: true});
        this.rangeLabelsModel = new DataTableSelectionModel({id: 2, name: 'range_labels', notEmpty: true});
        this.rangeHeadersModel = new DataTableSelectionModel({id: 3, name: 'range_headers', notEmpty: true});

        // subviews
        this.selectedCellRangeView = new SelectedCellRangeView({
            el: this.$('.selected-ranges-view'),
            collection: this.collection
        });

        // events
        this.on('open', this.onOpen, this);
        this.listenTo(this.dataStreamModel, 'change', this.onLoadDataStream, this);
        this.listenTo(this.model, 'change:type', this.onChangeType, this);
        this.listenTo(this.model, 'change:geoType', this.onChangeType, this);
        this.listenTo(this.collection, 'change remove reset', this.validate, this);
        this.listenTo(this.selectedCellRangeView, 'focus-input', function (name) {
            this._cacheFocusedInput = name;
        });

        // initialization
        this.onChangeType();
        return this;
    },

    onOpen: function () {
        this.selectedCellRangeView.render();

        this.rangeLatModel.set('excelRange', this.model.get('range_lat'));
        this.rangeLonModel.set('excelRange', this.model.get('range_lon'));
        this.rangeInfoModel.set('excelRange', this.model.get('range_data'));
        this.rangeTraceModel.set('excelRange', this.model.get('range_trace'));
        this.rangeDataModel.set('excelRange', this.model.get('range_data'));
        this.rangeLabelsModel.set('excelRange', this.model.get('range_labels'));
        this.rangeHeadersModel.set('excelRange', this.model.get('range_headers'));

        this.collection.setCache();
        this.setHeights();
        this.setAxisTitles();
    },

    onChangeType: function () {
        var type = this.model.get('type'),
            geoType = this.model.get('geoType');
        if (type === 'mapchart') {
            if (geoType === 'points') {
                this.collection.reset([this.rangeLatModel, this.rangeLonModel, this.rangeInfoModel]);
            } else if (geoType === 'traces') {
                this.collection.reset([this.rangeTraceModel, this.rangeInfoModel]);
            }
        } else {
            this.collection.reset([this.rangeDataModel, this.rangeLabelsModel, this.rangeHeadersModel]);
        }
    },

    onClickDone: function (e) {
        var result = this.collection.reduce(function (memo, m) {
            memo[m.get('name')] = m.get('excelRange');
            return memo;
        }, {});
        this.model.set(result);
        this.close();
    },

    onClickCancel: function (e) {
        this.collection.revert();
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
        this.listenTo(this.dataTableView, 'afterSelection', function (range) {
            this.addSelection(this._cacheFocusedInput);
        }, this);
        this.listenTo(this.dataTableView, 'afterSelectionEnd', function () {
            this.addSelection(this._cacheFocusedInput);
        }, this);
    },

    addSelection: function (name) {
        var selection = this.dataTableView.getSelection(),
            model = this.collection.find(function (model) {
            return model.get('name') === name;
        });
        model.set(selection);
        this.validate();
    },

    validate: function () {
        var type = this.model.get('type'),
            geoType = this.model.get('geoType');

        if (type === 'mapchart') {
            if (geoType === 'points') {
                this.validateLatLon();
            } else if (geoType === 'traces') {
                this.validateTrace();
            }
        } else {
            this.validateData();
        }
    },

    validateLatLon: function () {
        var hasLat = this.rangeLatModel.hasRange(),
            hasLon = this.rangeLonModel.hasRange(),
            hasInfo = this.rangeInfoModel.hasRange(),
            validLat = this.rangeLatModel.isValid(),
            validLon = this.rangeLonModel.isValid(),
            validInfo = this.rangeInfoModel.isValid();

        if (hasLat && hasLon && hasInfo && validLat && validLon && validInfo) {
            this.enable();
        } else {
            this.disable();
        }
    },

    validateTrace: function () {
        var hasTrace = this.rangeTraceModel.hasRange(),
            hasInfo = this.rangeInfoModel.hasRange(),
            validTrace = this.rangeTraceModel.isValid(),
            validInfo = this.rangeInfoModel.isValid();

        if (hasTrace && hasInfo && validTrace && validInfo) {
            this.enable();
        } else {
            this.disable();
        }
    },

    validateData: function () {
        var hasData = this.rangeDataModel.hasRange(),
            hasLabels = this.rangeLabelsModel.hasRange(),
            hasHeaders = this.rangeHeadersModel.hasRange(),
            validData = this.rangeDataModel.isValid(),
            validLabels = this.rangeLabelsModel.isValid(),
            validHeaders = this.rangeHeadersModel.isValid();

        if (hasData && hasLabels && hasHeaders && validData && validLabels && validHeaders) {
            this.enable();
        } else {
            this.disable();
        }
    },

    enable: function () {
        this.$('button.btn-done').removeAttr('disabled');
    },

    disable: function () {
        this.$('button.btn-done').attr('disabled', 'disabled');
    },

    setHeights: function(t){
        var self = this;

        var sidebar = this.$el.find('.sidebar'),
            table = this.$el.find('.table-view');

        $(window).resize(function(){

            windowHeight = $(window).height();
            
            var sidebarHeight =
              windowHeight
            - parseFloat( self.$el.find('.context-menu').height() )
            - parseFloat( sidebar.parent().css('padding-top').split('px')[0] )
            - 50 // As margin bottom
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
    },

    open: function(){
        $('body').css('overflow', 'hidden');
        $('.process-manager-modal').addClass('hidden');
        this.$el.removeClass('hidden');
        this.trigger('open');
    },

    close: function(){
        $('body').css('overflow', 'auto');
        this.$el.addClass('hidden');
        this.trigger('close');
    }

});
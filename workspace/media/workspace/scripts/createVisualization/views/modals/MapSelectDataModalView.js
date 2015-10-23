var MapSelectDataModalView = ModalView.extend({
	events: {
        'click button.btn-done':'onClickDone',
		'click button.btn-cancel':'onClickCancel'
	},

	initialize: function(options){
        this.collection = new DataTableSelectedCollection();
        this.dataStreamModel = options.dataStreamModel;

        this.rangeLatModel = new DataTableSelectionModel({id: 1, name: 'range_lat', notEmpty: true});
        this.rangeLonModel = new DataTableSelectionModel({id: 2, name: 'range_lon', notEmpty: true});
        this.rangeInfoModel = new DataTableSelectionModel({id: 3, name: 'range_data'});
        this.rangeTraceModel = new DataTableSelectionModel({id: 4, name: 'range_trace', notEmpty: true});

        this.selectedCellRangeView = new SelectedCellRangeView({
            el: this.$('.selected-ranges-view'),
            collection: this.collection
        });

        this.on('open', this.onOpen, this);
        this.on('close', this.onClose, this);

        this.listenTo(this.dataStreamModel, 'change', this.onLoadDataStream, this);
        this.listenTo(this.model, 'change:type', this.onChangeType, this);
        this.listenTo(this.model, 'change:geotype', this.onChangeType, this);
        this.listenTo(this.collection, 'change remove reset', this.validate, this);
        this.listenTo(this.selectedCellRangeView, 'focus-input', function (name) {
            this._cacheFocusedInput = name;
        });
        return this;
    },

    onOpen: function () {
        this.selectedCellRangeView.render();
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

    onChangeType: function (model, value) {
        var type = model.get('type'),
            geotype = model.get('geotype');
        if (type === 'mapchart') {
            if (geotype === 'points') {
                this.collection.reset([this.rangeLatModel, this.rangeLonModel, this.rangeInfoModel]);
            } else if (geotype === 'traces') {
                this.collection.reset([this.rangeTraceModel, this.rangeInfoModel]);
            }
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
        this.rangeLatModel.set('excelRange', this._cached_lat);
        this.rangeLonModel.set('excelRange', this._cached_lon);
        this.rangeInfoModel.set('excelRange', this._cached_data);
        this.rangeTraceModel.set('excelRange', this._cached_trace);
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
            model;

        if (name === 'range_lat') {
            model = this.rangeLatModel;
        } else if (name === 'range_lon') {
            model = this.rangeLonModel;
        } else if (name === 'range_data') {
            model = this.rangeInfoModel;
        } else if (name === 'range_trace') {
            model = this.rangeTraceModel;
        }
        model.set(selection);

        this.validate();
    },

    validate: function () {
        var type = this.model.get('type'),
            geotype = this.model.get('geotype');

        if (type === 'mapchart') {
            if (geotype === 'points') {
                this.validateLatLon();
            } else if (geotype === 'traces') {
                this.validateTrace();
            }
        } else if (type === 'trace') {
        }
    },

    validateLatLon: function () {
        var hasLat = this.rangeLatModel.get('excelRange') !== '',
            hasLon = this.rangeLonModel.get('excelRange') !== '',
            validLat = this.rangeLatModel.isValid(),
            validLon = this.rangeLonModel.isValid(),
            validInfo = this.rangeInfoModel.isValid();

        if (hasLat && hasLon && validLat && validLon && validInfo) {
            this.$('button.btn-done').removeAttr('disabled'); 
        } else {
            this.$('button.btn-done').attr('disabled', 'disabled');
        }
    },

    validateTrace: function () {
        var hasTrace = this.rangeTraceModel.get('excelRange') !== '',
            validTrace = this.rangeTraceModel.isValid(),
            validInfo = this.rangeInfoModel.isValid();

        if (hasTrace && validTrace && validInfo) {
            this.$('button.btn-done').removeAttr('disabled'); 
        } else {
            this.$('button.btn-done').attr('disabled', 'disabled');
        }
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
    }
});
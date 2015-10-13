var MapSelectDataModalView = ModalView.extend({
	events: {
        'click button.btn-done':'onClickDone',
		'click button.btn-cancel':'onClickCancel'
	},

	initialize: function(options){
		var self = this;

        //init table
        this.collection = new DataTableSelectedCollection();

        this.rangeLatModel = new DataTableSelectionModel({id: 1, name: 'range_lat'});
        this.rangeLonModel = new DataTableSelectionModel({id: 2, name: 'range_lon'});
        this.rangeInfoModel = new DataTableSelectionModel({id: 3, name: 'range_data'});

        this.dataStreamModel = options.dataStreamModel;

        this.selectedCellRangeView = new SelectedCellRangeView({
            el: this.$('.selected-ranges-view'),
            models: [
                this.rangeLatModel,
                this.rangeLonModel,
                this.rangeInfoModel
            ]
        });

        this.listenTo(this.selectedCellRangeView, 'focus-input', function (name) {
            this._cacheFocusedInput = name;
        });

        this.listenTo(this.dataStreamModel, 'change', this.onLoadDataStream, this);

        this.on('open', function () {
            this.selectedCellRangeView.focus();
            this._cached_lat = this.model.get('range_lat');
            this._cached_lon = this.model.get('range_lon');
            this._cached_data = this.model.get('range_data');
            this.rangeLatModel.set('excelRange', this._cached_lat);
            this.rangeLonModel.set('excelRange', this._cached_lon);
            this.rangeInfoModel.set('excelRange', this._cached_data);
            this.collection.add([
                this.rangeLatModel,
                this.rangeLonModel,
                this.rangeInfoModel
                ]);
            this.setHeights();
            this.setAxisTitles();
        }, this);

        this.listenTo(this.collection, 'add change remove reset', this.validate, this);

        return this;
    },

    onClickDone: function (e) {
        this.model.set({
            range_lat: this.rangeLatModel.get('excelRange'),
            range_lon: this.rangeLonModel.get('excelRange'),
            range_data: this.rangeInfoModel.get('excelRange')
        });
        this.close();
    },


    onClickCancel: function (e) {
        this.rangeLatModel.set('excelRange', this._cached_lat);
        this.rangeLonModel.set('excelRange', this._cached_lon);
        this.rangeInfoModel.set('excelRange', this._cached_data);
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
            this.collection.remove(1);
            model = this.rangeLatModel;
        } else if (name === 'range_lon') {
            this.collection.remove(2);
            model = this.rangeLonModel;
        } else if (name === 'range_data') {
            this.collection.remove(3);
            model = this.rangeInfoModel;
        }
        model.set(selection);

        if (model.isValid()) {
            this.collection.add(model);
        } else {
            // alert(model.validationError)
        }
    },

    validate: function () {
        if (this.collection.length < 3) {
            this.$('button.btn-done').attr('disabled', 'disabled');
        } else {
            this.$('button.btn-done').removeAttr('disabled');
        }
    },

    setHeights: function(t){
        var self = this;

        var sidebar = $('.modal').find('.sidebar'),
            table = $('.modal').find('.table-view');

        $(window).resize(function(){

            windowHeight = $(window).height();
            
            var sidebarHeight =
              windowHeight
            - parseFloat( $('.modal').find('.context-menu').height() )
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
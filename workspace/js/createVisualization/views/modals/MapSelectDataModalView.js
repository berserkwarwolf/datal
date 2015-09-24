var MapSelectDataModalView = ModalView.extend({
	events: {
        'click button.btn-done':'onClickDone',
		'click button.btn-cancel':'onClickCancel'
	},

	initialize: function(){
		var self = this;

        //init table
        this.collection = new DataTableSelectedCollection();

        this.rangeLatModel = new DataTableSelectionModel({id: 1});
        this.rangeLonModel = new DataTableSelectionModel({id: 2});
        this.rangeInfoModel = new DataTableSelectionModel({id: 3});

        this.selectedCellRangeView = new SelectedCellRangeView({
            el: this.$('.selected-ranges-view'),
            rangeLatModel: this.rangeLatModel,
            rangeLonModel: this.rangeLonModel,
            rangeInfoModel: this.rangeInfoModel
        });

        this.listenTo(this.selectedCellRangeView, 'focus-input', function (name) {
            this._cacheFocusedInput = name;
        });

        this.listenTo(this.selectedCellRangeView, 'edit-input', function (name, val) {
            console.log('edit-input', name, val);
            // this.dataTableView.selectRange(val);
        });

        var dataUrl = ['/dataviews/invoke?datastream_revision_id=', 
            this.model.get('datastream_revision_id'),
            '&limit=50&page=0'].join('');

        // TODO: this is fetching data from the invoke endpoint which will be deprecated. Change the
        // request when it fails.
        $.getJSON(dataUrl).then(function (payload) {
            self.createDataTableView(payload);
        });

        this.on('open', function () {
            this.selectedCellRangeView.focus();
        }, this);

        this.listenTo(this.collection, 'add change remove reset', this.validate, this);

        return this;
    },

    onClickDone: function (e) {
        var selection = this.collection.getSelectionChartStyle();
        console.log('result of the selection to be posted to the API', selection);
        this.model.set(selection);
        this.close();
    },

    onClickCancel: function (e) {
        this.collection.reset();
        this.selectedCellRangeView.clear();
        this.close(); //Close modal
    },

    createDataTableView: function (payload) {
        this.dataTableView = new DataTableView({
            el: this.$('.data-table-view'),
            collection: this.collection,
            invoke: payload
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
        var selection = this.dataTableView.getSelection(name);

        if (_.isString(name)) {
          // When name is defined, the selection mode only allows setting selection to certain models
          // with fixed id (so that the color is stable)
          names = {'range_lat': 1, 'range_lon': 2, 'range_data': 3};
          model = new DataTableSelectionModel(_.extend(selection, {
            id: names[name],
            name: name
          }));
        } else {
          // when no name is provided, the selection is a multiselection collection.
          // model = new DataTableSelectionModel(_.extend(selection, {
          //   id: newId,
          // }));
        }

        if (model.isValid()) {
            this.collection.remove(model.get('id'));
            this.collection.add(model);
        } else {
            alert(model.validationError)
        }
    },

    validate: function () {
        if (this.collection.length < 3) {
            this.$('button.btn-done').attr('disabled', 'disabled');
        } else {
            this.$('button.btn-done').removeAttr('disabled');
        }
    }

});
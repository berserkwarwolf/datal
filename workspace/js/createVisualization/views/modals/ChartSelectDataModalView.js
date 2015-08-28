var ChartSelectDataModalView = ModalView.extend({
	events: {
		'click button.btn-close':'onCloseClicked',
		'click button.btn-add-serie': 'addSelection'
	},

	initialize: function(){
		var self = this;

		//init table
		this.collection = new DataTableSelectedCollection();

        this.selectedCellRangeView = new SelectedCellRangeView({
            el: this.$('.selected-ranges-view'),
            collection: this.collection
        });

        this.listenTo(this.selectedCellRangeView, 'focus-input', function (name) {
            this._cacheFocusedInput = name;
        });

        var dataUrl = ['/dataviews/invoke?datastream_revision_id=', 
            this.model.get('datastream_revision_id'),
            '&limit=50&page=0'].join('');

        // TODO: this is fetching data from the invoke endpoint which will be deprecated. Change the
        // request when it fails.
        $.getJSON(dataUrl).then(function (payload) {
            self.createDataTableView(payload);
        });

        return this;
    },

    render: function () {
        
    },

    onCloseClicked: function (e) {
        this.close(); //Close modal
        var selectedRows = this.collection.getRows();
        var selectedFields = this.collection.getFields();
        this.model.data.set('fields', selectedFields);
        this.model.data.set('rows', selectedRows);
        this.model.set('selection', this.collection.getSelectionExcelStyle());
    },

    createDataTableView: function (payload) {
        this.dataTableView = new DataTableView({
            el: this.$('.data-table-view'),
            collection: this.collection,
            invoke: payload
        });
        this.dataTableView.render();
        this.listenTo(this.dataTableView, 'afterSelection', function (range) {
            this.selectedCellRangeView.select(range);

        }, this);
        this.listenTo(this.dataTableView, 'afterSelectionEnd', function () {
            this.addSelection(this._cacheFocusedInput);
        }, this);
        this.dataTableView.table.render();
    },

    addSelection: function (name) {
        var selection = this.dataTableView.getSelection(name);

        console.log(selection);

        if (_.isString(name)) {
          // When name is defined, the selection mode only allows setting selection to certain models
          // with fixed id (so that the color is stable)
          names = {'range_data': 1, 'range_labels': 2, 'range_headers': 3};
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
            console.log(this.collection);
        } else {
            alert(model.validationError)
        }
    }

});
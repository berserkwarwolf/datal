var ManageDataviewsView = Backbone.View.extend({

    el: ".main-section",

    filters: null,
    activeFiltersView: null,
    inactiveFiltersView: null,
    listResources: null,
    listResourcesView: null,
    grid: null,
    paginator: null,
    sourceUrl: null,
    tagUrl: null,

    events: {
        "click #id_itemsPerPage": "onItemsPerPageChanged",
        "click #id_applyBulkActions": "runBulkAction",
        "change #id_bulkActions": "enableApplyBulkActionsButton",
        "click #grid input[type=checkbox]": "onInputCheckboxSelected",
        "click #id_addNewButton": "onAddNewButtonClicked",
        "click .actions .edit a": "onEditButtonClicked"
    },

    initialize: function(options) {

        this.sourceUrl = this.options.sourceUrl;
        this.tagUrl = this.options.tagUrl;

        // Init Filters
        this.initFilters(options.filters);

        // Init List
        this.initList();

        // Listen To
        this.listenTo(this.listResources, 'request', this.showLoading);
        this.listenTo(this.listResources, 'sync', this.hideLoading);
        this.listenTo(this.listResources, 'error', this.hideLoading);

        // Render
        this.render();

    },

    render: function(){
        this.$el.find("#grid").html(this.grid.render().$el);
        this.$el.find("#paginator").html(this.paginator.render().$el);
        this.$el.find(".backgrid-paginator").addClass("pager center");
    },

    showLoading: function(){
        this.$el.find('.manager > .loading').show();
    },

    hideLoading: function(){
        this.$el.find('.manager > .loading').hide();

        /* This is for first load */
        this.$el.find("#filters-container").show();
        this.$el.find("#grid").show();
        if (this.listResources.state.totalPages !== 1) {
            this.$el.find("#id_pagination").show();
        }
    },

    onItemsPerPageChanged: function() {
        this.listResources.setPageSize( parseInt( $('#id_itemsPerPage').val() ) );
    },

    resetBulkActions: function(){
        this.$el.find('.bulk-actions').hide();
        this.$el.find("#id_bulkActions").val('');
        this.$el.find('#id_applyBulkActions').prop('disabled', true);
    },

    runBulkAction: function() {
        var action = $("#id_bulkActions").val();

        switch (action){
            case "delete":
                var selectedModels = this.grid.getSelectedModels();
                if(selectedModels.length > 0){
                    var deleteItemView = new DeleteItemView({
                        itemCollection: this.listResources,
                        models: selectedModels,
                        //type: "datastreams",
                        type: "visualizations",
                        parentView: this,
                        bulkActions: true
                    });
                }
            break;

            case "edit":
                var selectedModels = this.grid.getSelectedModels();
                if(selectedModels.length > 0){
                    // TODO: Bulk Edit
                }
            break;
        }

    },

    enableApplyBulkActionsButton: function(event){
        var value = $(event.currentTarget).val(),
            element = this.$el.find('#id_applyBulkActions');

        // If the user does not select a bulk action, we disable the apply button.
        if( value == '' ){
            element.prop('disabled', true);
        }else{
            element.prop('disabled', false);
        }
    },

    onInputCheckboxSelected: function(){
        var selectedModels = this.grid.getSelectedModels(),
            bulkActions = this.$el.find('.bulk-actions');

        if(selectedModels.length>0){
            bulkActions.show();
        }else{
            bulkActions.hide();
        }
    },

    onAddNewButtonClicked: function() {
        var manageDatasetsOverlayView = new ManageDatasetsOverlayView({
            dataViewCreationStepsUrl: this.options.dataViewCreationStepsUrl,
        });
    },

    onEditButtonClicked: function(event){
        var datastreamEditItemModel = new DatastreamEditItemModel({
            sourceUrl: this.sourceUrl,
            tagUrl: this.tagUrl,
            id: $(event.currentTarget).data("id"),
            url: $(event.currentTarget).data("url")
        });

        var self = this;

        datastreamEditItemModel.fetch({
            success:function(){
                var datastreamEditItemView = new DatastreamEditItemView({
                    model: datastreamEditItemModel,
                    parentView: self
                });
            }
        });
    },

    initFilters: function(filters){

        // Init the collection with django view list of datasets.
        this.filters = new FiltersCollection();

        this.filtersCollection = new Backbone.Collection(filters);

        this.filtersView = new FiltersView({
            el: this.$('.filters-view'),
            collection: this.filtersCollection
        });

        this.listenTo(this.filtersView, 'change', function (queryDict) {
            this.listResources.queryParams.filters = JSON.stringify(queryDict);
            this.listResources.fetch({reset: true});
        });

        this.listenTo(this.filtersView, 'clear', function () {
            this.listResources.queryParams.filters = null;
            this.listResources.fetch({reset: true});
        });

        // Active Filters View
        this.activeFiltersView = new ActiveFiltersView({
            collection: this.filters,
        });

        // Inactive Filters View
        this.inactiveFiltersView = new InactiveFiltersView({
            collection: this.filters
        });

        // Init Backbone PageableCollection
        this.listResources = new ListResources({
            filters: this.filters
        });

    },

    initList: function(){

        var self = this;

        // Columns for BackGrid
        var columns = [
        /*
        {
            name: "",
            cell: "select-row",
            headerCell: "select-all"
        }, 
        */
        {
            name: "title",
            label: gettext('APP-GRID-CELL-TITLE'),
            cell: Backgrid.StringCell.extend({
                render: function() {
                    var titleCellView = new TitleCellView({
                        model: this.model,
                        itemCollection: self.listResources,
                        parentView: self
                    });
                    this.$el.html(titleCellView.render().el);
                    return this;
                }
            }),
            sortable: true,
            editable: false
        },{
            name: "dataset_title",
            label: gettext('APP-GRID-CELL-DATASET-NAME'),
            // cell: "text",
            cell: Backgrid.StringCell.extend({
                render: function() {
                    var datasetCellView = new DatasetCellView({
                        model: this.model
                    });
                    this.$el.html(datasetCellView.render().el);
                    return this;
                }
            }),
            sortable: true,
            editable: false
        }, {
            name: "author",
            label: gettext('APP-GRID-CELL-AUTHOR'),
            cell: "text",
            sortable: true,
            editable: false
        }, {
            name: "status_nice",
            label:  gettext('APP-GRID-CELL-STATUS'),
            cell: "text",
            sortable: false,
            editable: false
        }];

        // Init Grid
        this.grid = new Backgrid.Grid({
            collection: this.listResources,
            columns: columns,
            emptyText: gettext('APP-NO-RESOURCES-ALERT-TEXT'),
        });

        // Init Pagination
        this.paginator = new Backgrid.Extension.Paginator({
            collection: this.listResources,
            goBackFirstOnSort: false // Default is true
        });

        // Fetch List Resources
        this.listResources.fetch({
            reset: true
        });

        // ListResources View
        this.listResourcesView = new ListResourcesView({
            resourceCollection: this.listResources,
            filterCollection: this.filters,
            grid: this.grid,
            paginator: paginator
        });

    }

});
// The collectio of filters.
var FiltersCollection = Backbone.Collection.extend({
    model: FilterItemModel
});

var ManageVisualizationView = Backbone.View.extend({
    el: ".main-section", //"#dataview_list",
    filters: null,
    activeFiltersView: null,
    inactiveFiltersView: null,
    listResources: null,
    listResourcesView: null,
    grid: null,

    events: {
        "click #id_itemsPerPage": "onItemsPerPageChanged",
        "click #appl_bulk": "runBulkAction",
        "click #grid input[type=checkbox]": "onInputCheckboxSelected",
        "click #new_visualization": "newVisualization"

    },

    initialize: function() {

        // Init the collection with django view list of dataview.
        var that = this;
        this.filters = new FiltersCollection();
        this.listResources = new ListResources({
            filters: this.filters
        });
        var titleCellView = null;
        this.grid = new Backgrid.Grid({
            emptyText: gettext('APP-NO-RESOURCES-ALERT-TEXT'),
            columns: [{
                name: "",
                cell: "select-row",
                headerCell: "select-all"
            }, {
                name: "title",
                label: gettext('APP-GRID-CELL-TITLE'),
                cell: Backgrid.StringCell.extend({
                    render: function() {
                        titleCellView = new TitleCellGridView({
                            model: this.model,
                            itemCollection: that.listResources
                        });
                        this.$el.append(titleCellView.render().el);
                        return this;

                    }

                }),
                sortable: true,
                editable: false
            },{
                name: "dataset_title",
                label: gettext('APP-GRID-CELL-DATASET-NAME'),
                cell: "text", // See the TextCell extension
                sortable: true,
                editable: false
            }, {
                name: "author",
                label: gettext('APP-GRID-CELL-AUTHOR'),
                cell: "text", // See the TextCell extension
                sortable: true,
                editable: false
            }, {
                name: "status_nice",
                label:  gettext('APP-GRID-CELL-STATUS'),
                cell: "text", // See the TextCell extension
                sortable: false,
                editable: false
            }],

            collection: this.listResources
        });
        $("#grid").append(that.grid.render().$el);
        var paginator = new Backgrid.Extension.Paginator({
            collection: this.listResources
        });
        this.listResources.fetch({
            reset: true
        });
        $("#paginator").append(paginator.render().$el);
        $('.backgrid-paginator ul').addClass("pager center")
        this.listResourcesView = new ListResourcesView({
            resourceCollection: this.listResources,
            filterCollection: this.filters,
            grid: this.grid,
            paginator: paginator
        });

        this.activeFiltersView = new ActiveFiltersView({
            collection: this.filters,
            resourceCollection: this.listResources
        });
        this.inactiveFiltersView = new InactiveFiltersView({
            collection: this.filters,
            resourceCollection: this.listResources
        });

        // Listen To
        this.listenTo(this.listResources, 'request', this.showLoading);
        this.listenTo(this.listResources, 'sync', this.hideLoading);
        this.listenTo(this.listResources, 'error', this.hideLoading);
    },
    showLoading: function () {
        this.grid.$el.empty().append('<div class="loading"></div>');
        this.$el.find("#id_pagination").hide();
    },

    hideLoading: function () {
        this.grid.$el.empty();
        this.$el.find("#grid").html(this.grid.render().$el);
        this.$el.find("#id_pagination").show();
    },
    onItemsPerPageChanged: function() {
        this.listResources.setPageSize(parseInt($('#id_itemsPerPage').val()))
/*
        this.listResources.fetch({
            reset: true,

        });
*/

    },
    runBulkAction: function() {
        var id = $("#bulk_slct option:selected").text();

        switch (id){
            case "Delete":
                var selectedModels = this.grid.getSelectedModels();
                if(selectedModels.length>0){
                    var deleteItemView = new DeleteItemView({
                        itemCollection: this.listResources,
                        models: selectedModels,
                        type: "datastreams"
                    });
                }

              break;
        }

    },

    onInputCheckboxSelected: function(){
        var selectedModels = this.grid.getSelectedModels(),
            element = this.$el.find('.bulk-actions');
        if(selectedModels.length>0){
            element.show();
        }else{
            element.hide();
        }
    },

    newVisualization: function() {
     var manageDataviewsOverlayView = new ManageDataviewsOverlayView({visualizationCreationStepsUrl:this.options.visualizationCreationStepsUrl});
    },


});
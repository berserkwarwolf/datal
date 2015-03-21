var ManageDataviewsOverlayView = Backbone.View.extend({
    el: "#id_addVisualization",
    listDataviews: null,
    visualizationCreationStepsUrl:'',
    events: {

    },

    initialize: function(options) {
        this.visualizationCreationStepsUrl = this.options.visualizationCreationStepsUrl
        // Init the collection with django view list of dataviews.
        var that = this;
        this.listDataviews = new ListDataviews({});
        var ClickableRow = Backgrid.Row.extend({
            events: {
                "click" : "rowClicked"
            },
            rowClicked: function () {
                window.location = that.visualizationCreationStepsUrl+'?datastream_revision_id=' + this.model.get('id');
            }
        });
        this.grid = new Backgrid.Grid({
            row: ClickableRow,
            columns: [ {
                name: "title",
                label: gettext('APP-GRID-CELL-TITLE'),
                cell: "string",
                sortable: true,
                editable: false
            },{
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
            }],

            collection: this.listDataviews
        });
        $("#dataview_grid").append(that.grid.render().$el);

        var paginator = new Backgrid.Extension.Paginator({
            collection: this.grid.collection,
            windowSize: 5
        });

        this.listDataviews.fetch({
            reset: true
        });

        $("#dataview_paginator").append(paginator.render().$el);
        $('.backgrid-paginator ul').addClass("pager center")
        this.listDataviewView = new ListDataviewView({
            dataviewCollection: this.listDataviews,
            grid: this.grid,
            paginator: this.paginator
        });

        var clientSideFilter = new Backgrid.Extension.ServerSideFilter({
            collection: this.listDataviews,
            placeholder: "Search in the browser",
            fields: ['title'],
            wait: 150
          });
        $("#id_filter_dataViews").prepend(clientSideFilter.render().el);

        $('#id_addVisualization').data('overlay').load();

    },

});
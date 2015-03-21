var TitleCellGridView = Backbone.View.extend({
    template: null,
    deleteListResources:null,
    events: {
        "click .delete": "deleteVisualization",
    },

    initialize: function(options) {
        this.options = options;
        this.template = _.template($("#grid-titlecell-template").html());
    },

    render: function() {
        $(this.el).html(this.template(this.model.toJSON()));
        return this;
    },
    deleteVisualization: function() {
        that = this;
        this.deleteListResources = new Array();
        this.deleteListResources.push(this.options.model);
        var deleteItemView = new DeleteItemView({
            itemCollection: that.options.itemCollection,
            models: this.deleteListResources,
            type: "visualizations"
        });
    },
});
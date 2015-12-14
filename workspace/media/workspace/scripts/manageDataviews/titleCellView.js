var TitleCellView = Backbone.View.extend({
    template: null,
    deleteListResources: null,
    parentView: null,
    events: {
        "click .delete": "deleteDataset",
    },

    initialize: function(options) {
        this.itemCollection = options.itemCollection;
        this.parentView = options.parentView;
        this.template = _.template($("#grid-titlecell-template").html());
    },

    render: function() {
        $(this.el).html(this.template(this.model.toJSON()));
        return this;
    },
    deleteDataset: function() {
        self = this;
        this.deleteListResources = new Array();
        this.deleteListResources.push(this.model);
        var deleteItemView = new DeleteItemView({
            itemCollection: self.itemCollection,
            models: this.deleteListResources,
            type: "visualizations",
            parentView: this.parentView
        });
    },
});
var TitleCellView = Backbone.View.extend({
    template: null,
    deleteListResources: null,
    parentView: null,
    events: {
        "click .delete": "deleteDataset",
    },

    initialize: function(options) {
        this.options = options;
        this.parentView = this.options.parentView;

        // Make visible on template a variable with the valid impl_type choices for creating a Data View
        this.model.set('datastreamImplValidChoices', this.parentView.datastreamImplValidChoices);
        
        this.template = _.template($("#grid-titlecell-template").html());
    },

    render: function() {
        $(this.el).html(this.template(this.model.toJSON()));
        return this;
    },

    deleteDataset: function() {
        self = this;
        this.deleteListResources = new Array();
        this.deleteListResources.push(this.options.model);
        var deleteItemView = new DeleteItemView({
            itemCollection: self.options.itemCollection,
            models: this.deleteListResources,
            type: "datastreams",
            parentView: this.parentView
        });
    },
});
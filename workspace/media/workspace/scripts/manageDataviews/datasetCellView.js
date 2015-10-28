var DatasetCellView = Backbone.View.extend({
    template: null,

    initialize: function(options) {
        this.template = _.template($("#grid-datasetcell-template").html());
    },

    render: function() {
        $(this.el).html(this.template(this.model.toJSON()));
        return this;
    },
});
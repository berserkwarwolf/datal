var VisualizationCellView = Backbone.View.extend({
    template: null,

    initialize: function() {
        this.template = _.template($("#grid-visualizationcell-template").html());
    },

    render: function() {
        $(this.el).html(this.template(this.model.toJSON()));
        return this;
    },
});
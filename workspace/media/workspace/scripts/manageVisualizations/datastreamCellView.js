var DatastreamCellView = Backbone.View.extend({
    template: null,

    initialize: function() {
        this.template = _.template($("#grid-datastreamcell-template").html());
    },

    render: function() {
        $(this.el).html(this.template(this.model.toJSON()));
        return this;
    },
});
var SelectionView = Backbone.View.extend({
    initialize: function () {
        this.template = _.template( $('#selection_template').html() );
        this.listenTo(this.collection, 'change', this.render, this);
    },

    render: function () {
        this.$el.html(this.template({
            collection: this.collection.toJSON()
        }));
    }
})
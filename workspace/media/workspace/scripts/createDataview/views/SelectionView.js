var SelectionView = Backbone.View.extend({
    events: {
        'click button.btn-clear': 'onClickClear'
    },

    initialize: function () {
        this.template = _.template( $('#selection_template').html() );
        this.listenTo(this.collection, 'add change remove reset', this.render, this);
    },

    render: function () {
        this.$el.html(this.template({
            collection: this.collection.toJSON()
        }));
    },

    onClickClear: function () {
        this.collection.reset();
    }
})
var PatternView = Backbone.View.extend({
    events: {
        'change select[name=pattern]': 'onChange'
    },

    initialize: function (options) {
        this.template = _.template( $('#pattern_template').html() );
    },

    render: function () {
        this.$el.html(this.template());
    },

    onChange: function (e) {
        var value = $(e.currentTarget).val();
        this.trigger('change', value);
    }
})
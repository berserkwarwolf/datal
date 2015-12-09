var ParamsView = Backbone.View.extend({
    initialize: function () {
        this.template = _.template( $('#params_template').html() );
    },

    render: function () {
        console.log(this.model.get('args'));
        this.$el.html(this.template({
            args: this.model.get('args')
        }));
    }
});
var StepBarView = Backbone.View.extend({
    events: {
        'click .btn-continue': 'onClickContinue',
        'click .btn-cancel': 'onClickCancel'
    },

    initialize: function () {
        this.template = _.template( $('#step_bar_template').html() );
        this.listenTo(this.model, 'change:step', this.render, this);
    },

    render: function () {
        var step = this.model.get('step');
        this.$el.html(this.template({
            step: step
        }));
        return this;
    },

    onClickContinue: function () {
        this.model.set('step', this.model.get('step') + 1);
    },

    onClickCancel: function () {
        this.model.set('step', this.model.get('step') - 1);
    }
})
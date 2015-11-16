var StepBar = Backbone.View.extend({
    events: {
        'click .btn-continue': 'onClickContinue',
        'click .btn-cancel': 'onClickCancel'
    },

    initialize: function () {
        this.listenTo(this.model, 'change:step', this.render, this);
    },

    render: function () {
        var step = this.model.get('step');
        console.log('step is:', '.step .step-' + step)
        this.$('.step.step-' + step).removeClass('hidden');
        return this;
    },

    onClickContinue: function () {
        this.model.set('step', this.model.get('step') + 1);
    },

    onClickCancel: function () {
        this.model.set('step', this.model.get('step') - 1);
    }
})
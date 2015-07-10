var MainView = Backbone.View.extend({

    initialize: function () {
        this.startStepView = new StartStepView({
        	el: this.$('.start-step-view'),
        	model: this.model
        });
        this.dataStepView = new DataStepView({
        	el: this.$('.data-step-view')
        });
        this.typeStepView = new TypeStepView({
        	el: this.$('.type-step-view')
        });

        this.steps = {
        	1: this.startStepView,
        	2: this.dataStepView,
        	3: this.typeStepView
        };

        this.listenTo(this.startStepView, 'step', this.onNext, this);
        this.listenTo(this.dataStepView, 'step', this.onNext, this);
        this.listenTo(this.typeStepView, 'step', this.onNext, this);

        this.listenTo(this.model, 'change:step', function  (model, step) {
        	console.log('step changed', step);
        	_.each(this.steps, function (view, step) {
        		view.hide();
        	});
        	this.steps[step].show();
        	if (step === 2) {
        		this.dataStepView.$el.removeClass('hidden');
        	}
        });
    },

    onNext: function (step) {
        this.model.set('step', this.model.get('step') + step);
    }
});
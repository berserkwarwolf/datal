var MainView = Backbone.View.extend({
    initialize: function () {
        this.model = new Backbone.Model({
            step: 0
        });
        this.stepBarView = new StepBar({
            el: '.context-menu-view',
            model: this.model
        });

        this.dataviewModel = new Backbone.Model();

        this.listenTo(this.model, 'change:step', this.render, this);
    },

    render: function () {
        var self = this;

        this.stepBarView.render();
        if (this.currentView) {
            this.currentView.$el.empty();
            delete this.currentView;
        };
        this.currentView = new ChooseTableView({
            el: this.$('.choose-table-step'),
            model: this.dataviewModel
        });
        this.currentView.fetch().then(function () {
            self.currentView.render();
        });
    }
});
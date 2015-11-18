var MainView = Backbone.View.extend({
    initialize: function (options) {
        var self = this;
        this.model = new Backbone.Model({
            step: 0
        });
        this.stepBarView = new StepBar({
            el: '.context-menu-view',
            model: this.model
        });

        this.datasetModel = new DatasetModel({
            dataset_revision_id: options.dataset_revision_id
        });
        this.datasetModel.fetch();

        this.dataviewModel = new DataviewModel();

        this.listenToOnce(this.datasetModel, 'change:tables', function () {
            this.render();
            this.listenTo(this.model, 'change:step', this.render, this);
        }, this);

    },

    render: function () {
        var self = this,
            step = this.model.get('step');

        if (this.currentView) {
            this.currentView.$el.empty();
            delete this.currentView;
        }
        if (step === 0) {
            this.currentView = new ChooseTableView({
                el: this.$('.choose-table-view'),
                datasetModel: this.datasetModel
            });
        } else if (step === 1) {
            this.currentView = new SelectDataView({
                el: this.$('.select-data-view'),
                datasetModel: this.datasetModel
            });
        } else if (step === 2) {
            this.currentView = new MetadataView({
                el: this.$('.metadata-view'),
                model: this.dataviewModel
            });
        } else if (step === 3) {
            this.dataviewModel.save().then(function (response) {
                console.log(response);
            }).fail(function (response) {
                this.model.set('step', 2);
            });
        };

        this.stepBarView.render();
        this.currentView.render();
    }
});
var MainView = Backbone.View.extend({

    initialize: function (options) {

        this.stateModel = new StateModel({
            step: 0
        });

        this.stepBarView = new StepBarView({
            el: '.context-menu-view',
            model: this.stateModel
        });

        this.datasetModel = new DatasetModel({
            dataset_revision_id: options.dataset_revision_id
        });
        this.datasetModel.fetch();

        this.dataviewModel = new DataviewModel({
            dataset_revision_id: options.dataset_revision_id
        });

        this.listenToOnce(this.datasetModel, 'change:tables', function () {
            this.render();
            this.listenTo(this.stateModel, 'change:step', this.render, this);
        }, this);
        this.listenTo(this.stepBarView, 'save', this.onClickSave, this);
        this.listenTo(this.stepBarView, 'next', this.onClickNext, this);
        this.listenTo(this.stepBarView, 'prev', this.onClickPrev, this);

    },

    render: function () {
        var self = this,
            step = this.stateModel.get('step');

        if (this.currentView) {
            this.currentView.remove();
            delete this.currentView;
        }
        if (step === 0) {
            this.currentView = new SelectDataView({
                datasetModel: this.datasetModel,
                collection: this.dataviewModel.selection,
                model: this.dataviewModel
            });
        } else if (step === 1) {
            this.currentView = new MetadataView({
                model: this.dataviewModel
            });
            this.listenTo(this.currentView, 'valid', this.enable, this);
        } else if (step === 2) {
            this.currentView = new PreviewView({
                model: this.dataviewModel
            });
        }
        this.$('.current-step').append(this.currentView.$el);

        this.currentView.render();
        this.stepBarView.render();
    },

    onClickNext: function () {
        if (this.currentView.isValid()) {
            this.stateModel.next();
        }
    },

    onClickPrev: function () {
        this.stateModel.prev();
    },

    onClickSave: function () {
        this.dataviewModel.save().then(function (response) {
            console.log(response);
        }).fail(function (response) {
            this.stateModel.set('step', 2);
        });        
    }
});
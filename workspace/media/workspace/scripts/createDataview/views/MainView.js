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

        this.dataviewModel = new DataviewModel();

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
                datasetModel: this.datasetModel,
                collection: this.dataviewModel.selection
            });
        } else if (step === 2) {
            this.currentView = new MetadataView({
                el: this.$('.metadata-view'),
                model: this.dataviewModel
            });
            this.listenTo(this.currentView, 'valid', this.enable, this);
        } else if (step === 3) {
            this.currentView = new PreviewView({
                el: this.$('.preview-view'),
                model: this.dataviewModel
            });
        };

        this.stepBarView.render();
        this.currentView.render();
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
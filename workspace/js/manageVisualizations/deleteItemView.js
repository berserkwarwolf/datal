var DeleteItemView = Backbone.View.extend({
    el: '#id_deleteVisualization',

    events: {
        "click #del_resource": "deleteVisualization",
        "click #del_revision": "deleteRevision"
    },

    initialize: function(options) {
        $('#id_deleteVisualization').data('overlay').load();
    },

    deleteVisualization: function() {
        that = this;
        _.each(this.options.models, function(model) {
            resource = model.get('title')

            model.remove({
               success: function() {
                    $.gritter.add({
                        title: gettext('APP-OVERLAY-DELETE-VISUALIZATION-CONFIRM-TITLE'),
                        text: resource + ": "+gettext('APP-DELETE-VISUALIZATION-ACTION-TEXT'),
                        image: '/media_core/images/common/im_defaultAvatar_90x90.jpg',
                        sticky: false,
                        time: 3500
                    });
                    that.undelegateEvents();
                    $('#id_deleteVisualization').data('overlay').close();
                    that.options.itemCollection.fetch({
                        reset: true
                    });
                },

                error: function() {
                    $.gritter.add({
                        title: gettext('APP-OVERLAY-DELETE-DATASET-CONFIRM-TITLE'),
                        text: resource + ": "+ gettext('APP-DELETE-DATASET-ACTION-ERROR-TEXT'),
                        image: '/media_core/images/common/im_defaultAvatar_90x90.jpg',
                        sticky: true,
                        time: 2500
                    });
                    that.undelegateEvents();
                    $('#id_deleteVisualization').data('overlay').close();
                }
            });

        });
    },

    deleteRevision: function() {
        that = this;
        _.each(this.options.models, function(model) {
            resource = model.get('title')
            model.remove_revision({

                success: function() {
                    $.gritter.add({
                        title: gettext('APP-OVERLAY-DELETE-DATASET-CONFIRM-TITLE'),
                        text: resource + ": "+gettext('APP-DELETE-DATASET-ACTION-TEXT'),
                        image: '/media_core/images/common/im_defaultAvatar_90x90.jpg',
                        sticky: false,
                        time: 3500
                    });
                    that.undelegateEvents();
                    $('#id_deleteVisualization').data('overlay').close();
                    that.options.itemCollection.fetch({
                        reset: true
                    });
                },

                error: function() {
                    $.gritter.add({
                        title: gettext('APP-OVERLAY-DELETE-DATASET-CONFIRM-TITLE'),
                        text: resource + ": "+ gettext('APP-DELETE-DATASET-ACTION-ERROR-TEXT'),
                        image: '/media_core/images/common/im_defaultAvatar_90x90.jpg',
                        sticky: true,
                        time: 2500
                    });
                    that.undelegateEvents();
                    $('#id_deleteVisualization').data('overlay').close();
                }
            });

        });

    },

    closeOverlay: function() {
        $('#id_deleteVisualization').data('overlay').close();
    }
});
var ResourceItemModel = Backbone.Model.extend({

    defaults: function() {
        return {
            title: "",
            id: "",
            dataset_url: "",
            created_at: "",
            category: "",
            author: "",
            status_nice: "",
            dataset_title: "",
            end_point: "",
            datastream_id: "",
            url: ""
        };
    },

    remove: function (options) {
        var opts = _.extend({url: 'remove/' + this.id}, options || {});

        return Backbone.Model.prototype.destroy.call(this, opts);
    },

    remove_revision: function (options) {
        var opts = _.extend({url: 'remove/revision/' + this.id}, options || {});

        return Backbone.Model.prototype.destroy.call(this, opts);
    },
    
});

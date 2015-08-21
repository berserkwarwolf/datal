var ResourceItemModel = Backbone.Model.extend({

    defaults: function() {
        return {
            id: "",
            title: "",
            description: "",
            status: "",
            user_id: "",
            user: "",
            category_id: "",
            category: "",
            visualization_id: "",
            last_revision_id: "",
            guid: "",
            created_at: "",
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

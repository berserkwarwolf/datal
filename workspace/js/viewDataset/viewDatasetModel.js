var ViewDatasetModel = Backbone.Model.extend({

	defaults: {
		reviewURL: "/",
        id: "",
        dataset_id: "",
        title: ""
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
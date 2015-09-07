var affectedResourcesModel = dataset.extend({
  remove: function (options) {
      var opts = _.extend({url: 'remove/' + this.id}, options || {});

      return Backbone.Model.prototype.destroy.call(this, opts);
  },

  remove_revision: function (options) {
      var opts = _.extend({url: 'remove/revision/' + this.id}, options || {});

      return Backbone.Model.prototype.destroy.call(this, opts);
  },


  // TODO para DANI: Ver que queda de estos metodos
  unpublish: function (options) {
      var opts = _.extend({url: 'unpublish/' + this.id}, options || {});

      return Backbone.Model.prototype.destroy.call(this, opts);
  },

  unpublish_revision: function (options) {
      var opts = _.extend({url: 'unpublish/revision/' + this.id}, options || {});

      return Backbone.Model.prototype.destroy.call(this, opts);
  },

});

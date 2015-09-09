var DatasetModel = dataset.extend({
  remove: function (options) {
      var opts = _.extend({url: 'remove/' + this.id}, options || {});

      return Backbone.Model.prototype.destroy.call(this, opts);
  },

  remove_revision: function (options) {
      var opts = _.extend({url: 'remove/revision/' + this.id}, options || {});

      return Backbone.Model.prototype.destroy.call(this, opts);
  },

  unpublish: function (options) {
      $.post('unpublish/' + this.id, {})
          .done(function(data){
               console.log(data);
          })
          .fail(function(data) {
              console.log(data);
          });;
  },

  unpublish_revision: function (options) {
      $.post('unpublish/revision/' + this.id, {})
          .done(function(data){
               console.log(data);
          })
          .fail(function(data) {
              console.log(data);
          });
  },

});

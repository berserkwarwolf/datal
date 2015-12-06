var EditSourceView = Backbone.Epoxy.View.extend({
  events: {
    'click a.btn-add': 'onAdd'
  },

  bindings: {
    "input.source-name": "value:source__name, events:['keyup']",
    "input.source-url": "value:source__url, events:['keyup']"
  },

  initialize: function (options) {
    this.template = _.template( $('#edit_source_template').html() );
  },

  render: function () {
    this.$el.html(this.template());
  },

  onAdd: function (e) {
    this.collection.add(this.model);
  }
})
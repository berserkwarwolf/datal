var FiltersView = Backbone.View.extend({

    events: {
        'click a.remove': 'onClickRemove',
        'click a.filter-add': 'onClickAdd',
    },

    initialize: function(options){
        this.template = _.template($('#filters-template').html());

        this.render();
    },

    render: function () {
        var active = _.filter(this.collection.models, function (item) {
            return item.get('active');
        }).map(function (model) {
            return _.extend(model.toJSON(), {cid: model.cid});
        });

        var category = _.filter(this.collection.models, function (model) {
            return model.get('type') === 'category' && !model.get('active');
        }).map(function (model) {
            return _.extend(model.toJSON(), {cid: model.cid});
        });

        var type = _.filter(this.collection.models, function (model) {
            return model.get('type') === 'type' && !model.get('active');
        }).map(function (model) {
            return _.extend(model.toJSON(), {cid: model.cid});
        });

        var author = _.filter(this.collection.models, function (model) {
            return model.get('type') === 'author' && !model.get('active');
        }).map(function (model) {
            return _.extend(model.toJSON(), {cid: model.cid});
        });

        var status = _.filter(this.collection.models, function (model) {
            return model.get('type') === 'status' && !model.get('active');
        }).map(function (model) {
            return _.extend(model.toJSON(), {cid: model.cid});
        });

        this.$el.html(this.template({
            active: active,
            category: category,
            type: type,
            author: author,
            status: status
        }));
    },

    onClickAdd: function (e) {
        var $target = $(e.currentTarget),
          cid = $target.data('cid');

        var model = this.collection.get(cid);
        model.set('active', true);
        this.render();
    },

    onClickRemove: function  (e) {
        var $target = $(e.currentTarget),
          cid = $target.data('cid');

        var model = this.collection.get(cid);
        model.set('active', false);
        this.render();
    }

});

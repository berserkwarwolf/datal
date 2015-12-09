var TagsView = Backbone.View.extend({
    initialize: function () {
        var self = this;
        this.template = _.template( $('#tags_template').html() );

        this.$('.input-tags').autocomplete({
            source: '/rest/tags.json',
            minLength: 3,
            select: function (e, ui) {
                e.preventDefault();
                // self.model.set('name', ui.item.value);
                // if(self.model.isValid(true)){
                //     self.collection.add(self.model.toJSON());
                //     $(e.target).val('');
                // }
            }
        });
    },

    render: function () {
        this.$el.html(this.template({
            tags: this.collection.toJSON()
        }));
    }

});
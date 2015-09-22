var affectedResourcesView = Backbone.View.extend({
    tagName: "li",

    initialize: function() {
        _.bindAll(this, 'render');
        this.model.bind('change', this.render);
    },

    render: function() {
        var type = this.model.get('type'),
            title = '';
        if( type == 'dataview' ){
            title = 'datastreami18n__title';
        }else if( type == 'visualization' ){
            title = 'visualizationi18n__title';
        }
        this.$el.html(this.model.get(title));
        this.$el.prepend('<span class=icon-' + type + '></span>');
        return this;
    }
});
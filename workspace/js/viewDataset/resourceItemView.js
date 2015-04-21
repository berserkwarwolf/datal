var ListResourcesView = Backbone.View.extend({

    el: $("#dataset_table_list"),

    initialize: function(options){
        
        // Initialize the model and the filters call for listening.
        this.model = options.resourceCollection;
        this.filters_col = options.filterCollection;
        this.rows_views = [];

        // Listen changes in the active filters collection.
        this.listenTo(this.filters_col, 'add', this.sendQuery);
        this.listenTo(this.filters_col, 'remove', this.sendQuery);
        this.listenTo(this.model, 'reset', this.cleanAll);

        this.render();
    },

    cleanAll: function(){
        _(this.rows_views).each(function(view){
            view.remove();
        }, this);
        this.rows_views = [];
    },

    generateQuery: function(){
        var queryDict = {};
        _(this.filters_col.models).each(function(item){
            if (queryDict[item.get('filter_class')] != undefined){
                queryDict[item.get('filter_class')].push(item.get('filter_name'));
            }
            else{
                queryDict[item.get('filter_class')] = [item.get('filter_name')];
            }
        });
        return queryDict;
    },

    sendQuery: function(){
        var filters = JSON.stringify(this.generateQuery());
        this.model.url='filter?filters='+filters;
        this.model.fetch({
            reset: true
        });
    },

});
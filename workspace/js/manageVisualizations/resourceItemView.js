
var ListResourcesView = Backbone.View.extend({
    el: $("#visualization_table_list"),

    initialize: function(input){
        // Initialize the model and the filters call for listening.
        this.model = input.resourceCollection;
        this.filters_col = input.filterCollection;
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
        var filtersJSON = JSON.stringify(this.generateQuery());
        var that = this;
        this.model.fetch({
            reset: true, 
            beforeSend: function(xhr, settings){
                
                // Prevent override of global beforeSend
                $.ajaxSettings.beforeSend(xhr, settings);

                that.getUrlFilter(filtersJSON);
            }
        });
    },
    // Add filters to the url
    getUrlFilter:function(filters){
        this.model.url='filter?filters='+filters;
    }

});
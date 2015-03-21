
var ListDataviewView = Backbone.View.extend({
    el: $("#dataview_list"),

    initialize: function(input){
        // Initialize the model and the filters call for listening.
        this.model = input.dataviewCollection;
        this.rows_views = [];
        this.render();
    }
});
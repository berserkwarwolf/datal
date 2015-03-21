var ActiveFiltersView = Backbone.View.extend({
    el: "#activeFilters",

    events: {
        "click .remove": "onRemoveFilterButtonClicked"
    },

    initialize:  function(){
        this.template = _.template($("#active-filters-template").html());
        this.listenTo(this.collection, 'add', this.addFilterItem);
        this.listenTo(this.collection, 'remove', this.removeFilterItem);
    },

    addFilterItem: function(model){

        $("#active-filters-list").append(this.template({filter_name: model.get('filter_name'), filter_id: model.id}));

        // Toggle Container
        this.toggleContainer();
    },

    removeFilterItem: function(model){
        // Remove the HTML containing li.
        $("#active-filters-list #" + model.id).parent('li').remove();

        // Toggle Container
        this.toggleContainer();
    },

    onRemoveFilterButtonClicked: function(ev){
        // Remove model from the collection.
        var clicked = $(ev.target);
        var modelid = clicked[0].id;
        this.collection.remove(modelid);
    },

    toggleContainer: function(){
        if( this.collection.length > 0 ){
            this.$el.show();
        }else{
            this.$el.hide();
        }
    }

});

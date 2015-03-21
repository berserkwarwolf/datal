var InactiveFiltersView = Backbone.View.extend({
    el: "#filters-container",

    events: {
        "click .filter_link": "onFilterClicked"
    },

    initialize:  function(){
        // I listen the deletes in the collection.
        this.listenTo(this.collection, 'remove', this.displayFilterItem);
        this.currentId = 0;
    },

    onFilterClicked: function(ev){
        // Hides the HTML for the inactive filter, and add a new active model to the collection.
        var clicked = $(ev.target);
        var currId = this.generateid();
        var pClass = clicked.closest('div').prop('id');
        var newActiveFilter = new FilterItemModel({filter_name: clicked.text(), id: currId, filter_class: pClass});
        this.collection.add(newActiveFilter);
        clicked[0].setAttribute('id', currId);
        clicked.hide();

        // Toogle container if all filters of that section are hidden
        this.toogleContainer( clicked.parents('ul') );
    },

    displayFilterItem: function(model){
        // This function is called when an active element change the status to inactive
        // and it must to be re-drawed.
        $(".filters #" + model.id).show();

        // Toogle container if all filters of that section are hidden
        this.toogleContainer( $(".filters #" + model.id).parents('ul') );
    },

    generateid: function(){
        // Generates a incremental id.
        var curr = this.currentId;
        this.currentId ++;
        return curr;
    },

    toogleContainer: function(element){

        var hasVisibleItems = false;

        for( var i=0;i<element.find('li').length;i++ ){
            if( element.find('li').eq(i).find('a').css('display') != 'none' ){
               hasVisibleItems = true;
            }
        }

        if(!hasVisibleItems){
            element.parents('.filters').hide();
        }else{
            element.parents('.filters').show();
        }

    }

});
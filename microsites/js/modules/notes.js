var NotesAnonymous = Backbone.Model.extend({
    defaults: {
        $ViewMoreButton: null
    }

    , initialize: function(){
        var att = this.attributes; 
        att.$ViewMoreButton.toggle(_.bind(this.viewMore ,this), _.bind(this.viewLess ,this))
    }

    , viewMore: function () {
        $('.notesContainer').css({'max-height': 'none', 'overflow': 'visible'});
        this.attributes.$ViewMoreButton.addClass('expanded');
    }

    , viewLess: function () {
        $('.notesContainer').css({'max-height': '64px', 'overflow': 'hidden'});
        this.attributes.$ViewMoreButton.removeClass('expanded');
    }
});
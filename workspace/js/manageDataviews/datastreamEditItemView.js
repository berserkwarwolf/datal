var DatastreamEditItemView = Backbone.Epoxy.View.extend({
    el:"#id_editDataview",
    sourceList: null,
    tagList: null,
    parentView: null,
    events: {
        "click #id_edit_cancel": "onEditDataviewCancel",
        "click #id_edit_save": "onEditDataviewSave",
    },

    initialize: function(options) {
        var self = this;
        this.options = options;
        this.parentView = this.options.parentView;
        this.initSourceList();
        this.initTagList();
        this.initNotes();

        // Init Overlay
        this.$el.overlay({
            top: 'center',
            left: 'center',
            mask: {
                color: '#000',
                loadSpeed: 200,
                opacity: 0.5,
                zIndex: 99999
            }
        });

        // Render
        this.render();    

        console.log(this.model.toJSON());

    },

    render: function(){
        this.$el.data('overlay').load();
        return this;
    },

    initSourceList: function(){
        var sourceModel = new SourceModel();

        var source = [];
        var sources = this.model.get('sources');

        for (i = 0; i < sources.length; i++) { 
            source.push( { name: source.name, source_url: source.url_source } );
        }

        this.sourceList = new Sources(sources);
        new SourcesView({collection: this.sourceList, parentView:this, model: sourceModel, parentModel: this.model});

        console.log(source);
        console.log(sources.length);
     },

    initTagList: function(){
        var tagModel = new TagModel();
        this.tagList = new Tags(this.model.get('tags'));
        new TagsView({collection: this.tagList, parentView:this, model: tagModel, parentModel: this.model});
    },

    initNotes: function(){
        new nicEditor({
            buttonList : ['bold','italic','underline','ul', 'ol', 'link', 'hr'], 
            iconsPath: '/js_core/plugins/nicEdit/nicEditorIcons-2014.gif'
        }).panelInstance('id_notes');
    },

    onEditDataviewCancel: function(){
        this.closeOverlay();
    },

    onEditDataviewSave: function(){

        var self = this,
            data = this.model.toJSON();

        // NOT WORKING. Need to be done with data and select what is sent to server.
        $.ajax({ 
            url: '/dataviews/edit/'+ this.model.get('datastream_revision_id'), 
            type:'POST', 
            data: data, 
            dataType: 'json',
            success: function(){

                // Old way - Not good. Instead let's try a fetch and reset the grid.
                // window.location.replace("/dataviews/");

                // Reload Grid
                self.parentView.listResources.fetch({
                    reset: true
                });

                // Gritter OK
                // Here

                // Close Overlay
                self.closeOverlay();

            },
            error: function(){
                // Gritter Error
                // Here
            }
        });       

    },

    closeOverlay: function(){
        this.$el.data('overlay').close();
    },

});
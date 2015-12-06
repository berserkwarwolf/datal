var MetadataView = Backbone.Epoxy.View.extend({
    events:  {
        'click a.add-source': 'onAddSource'
    },

    bindings: {
        "input.title":          "value:title, events:['keyup']",
        "input.description":    "value:description, events:['keyup']",
        "select.category":      "value:datastream_category, events:['change']"
    },

    initialize: function () {
        this.template = _.template( $('#metadata_view_template').html() );
    },

    render: function () {
        var self = this;
        this.$el.html(this.template());
        this.applyBindings();

        Backbone.Validation.bind(this, {
            attributes: function(view) {
                return ['title', 'description'];
            },
            valid: function (view, attr, selector) {
                self.setIndividualError(view.$('[name=' + attr + ']'), attr, '');
            },
            invalid: function (view, attr, error, selector) {
                self.setIndividualError(view.$('[name=' + attr + ']'), attr, error);
            },
        });
        this.sourcesView = new SourcesView({
            el: this.$('.sources-view'),
            collection: this.model.sources
        });
        this.sourcesView.render();
        this.initNotes();
    },

    initNotes: function(){

        this.notesInstance = new nicEditor({
            buttonList : ['bold','italic','underline','ul', 'ol', 'link', 'hr'], 
            iconsPath: '/js_core/plugins/nicEdit/nicEditorIcons-2014.gif'
        }).panelInstance('id_notes_2');

        if(this.model.get('notes')){
            this.notesInstance.instanceById('id_notes_2').setContent(this.model.get('notes'));
        }

    },

    onAddSource: function (e) {
        this.editSourceView = new EditSourceView({
            model: new SourceModel(),
            collection: this.model.sources
        });
        this.editSourceView.render();
        this.$('.edit-source-view').html(this.editSourceView.$el);
    },

    setIndividualError: function(element, name, error){
        var textarea = $('.textarea');

        // If not valid
        if( error != ''){

            if(name == 'notes'){
                textarea.addClass('has-error');
                textarea.next('p.has-error').remove();
                textarea.after('<p class="has-error">'+error+'</p>');           
            }else{
                element.addClass('has-error');
                element.next('p.has-error').remove();
                element.after('<p class="has-error">'+error+'</p>');
            }

        // If valid
        }else{
            element.removeClass('has-error');
            element.next('p.has-error').remove();

            textarea.removeClass('has-error');
            textarea.next('p.has-error').remove();          
        }

    },

    isValid: function () {
        var valid = this.model.isValid(true);
        return valid;
    }
})
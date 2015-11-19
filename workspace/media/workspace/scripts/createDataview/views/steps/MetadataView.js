var MetadataView = Backbone.Epoxy.View.extend({
    events:  {
        'click button.btn-save': 'validate'
    },

    bindings: {
        "input.title":          "value:title, events:['keyup']",
        "input.description":    "value:description, events:['keyup']",
        "select.category":      "value:datastream_category, events:['change']"
    },

    initialize: function () {
        var self = this;
        Backbone.Validation.bind(this, {
            attributes: function(view) {
                console.log(view, 'attributes')
                return ['title', 'description'];
            },
            valid: function (view, attr, selector) {
                self.setIndividualError(view.$('[name=' + attr + ']'), attr, '');
            },
            invalid: function (view, attr, error, selector) {
                self.setIndividualError(view.$('[name=' + attr + ']'), attr, error);
            },
        });
        // TODO: fix the notes editor
        // this.initNotes();
    },

    render: function () {
        this.$el.removeClass('hidden');
    },

    initNotes: function(){
        
        this.notesInstance = new nicEditor({
            buttonList : ['bold','italic','underline','ul', 'ol', 'link', 'hr'], 
            iconsPath: '/js_core/plugins/nicEdit/nicEditorIcons-2014.gif'
        }).panelInstance('id_notes_g');

        if(this.model.get('notes')){
            this.notesInstance.instanceById('id_notes_g').setContent(this.model.get('notes'));
        }

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

    validate: function () {
        var valid = this.model.isValid(true);
        console.info('MetadataView: validate', valid);
    }
})
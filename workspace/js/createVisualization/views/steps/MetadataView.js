var MetadataView = StepViewSPA.extend({

	initialize: function(){
		this.$el.find('.validate-msg').hide();
		this.addEvents({
			'click .step-2-view a.backButton': 'onPreviousButtonClicked',
			'click .step-2-view a.nextButton': 'onNextButtonClicked'
		});
		this.initNotes();
	},

	bindings: {
		"input.title": 			"value:meta_title,		events:['keyup']",
		"input.description": 	"value:meta_description,events:['keyup']",
		"select.category": 		"value:meta_category,	events:['change']",
		//"textarea.notes": 		"value:meta_notes,		events:['keyup']"
	},

	onPreviousButtonClicked: function(e){
		this.previous();
	},

	onNextButtonClicked: function(){
//		this.notesInstance.instanceById('id_notes').saveContent()
		this.$el.find('input').removeClass('has-error');
		this.$el.find('.validate-msg').hide();
		//hago set aquí porque Epoxy no se banca nicedit
		var notes = '';
		if($('.nicEdit-main').length > 0
				&& $('.nicEdit-main').html() != '<br>' // When notes initialice empty, nicEdit initialice with <br>, so we check if that is the case
		){
				notes = $.trim( this.notesInstance.instanceById('id_notes').getContent() );
		}

		this.model.set('meta_notes',notes);

		var validation = this.model.validateMetadata();
		if( validation.valid ){
			this.next();
		}else{
			var that = this;
			_.each(validation.fields,function(invalid,field){
				if(invalid){
					that.$el.find('input.'+field).addClass('has-error');
					that.$el.find('input.'+field).siblings('.validate-msg').show();
				}
			});
		};
	},

	initNotes: function(){
        this.notesInstance = new nicEditor({
            buttonList : ['bold','italic','underline','ul', 'ol', 'link', 'hr'], 
            iconsPath: '/js_core/plugins/nicEdit/nicEditorIcons-2014.gif'
        }).panelInstance('id_notes');

        this.notesInstance.addEvent('add', function() {
			alert( this.notesInstance.getContent() );
		});

    },


});
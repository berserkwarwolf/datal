var MetadataView = StepViewSPA.extend({

	initialize: function(){
		this.addEvents({
			'click a.backButton': 'onPreviousButtonClicked',
			'click a.nextButton': 'onNextButtonClicked'
		});
		this.initNotes();
	},

	bindings: {
		"input.title": 			"value:meta_title,		events:['keyup']",
		"input.description": 	"value:meta_description,events:['keyup']",
		"select.category": 		"value:meta_category,	events:['change']",
		//"textarea.notes": 		"value:meta_notes,		events:['keyup']"
	},

	onPreviousButtonClicked: function(){
		console.log(this.model.getMeta());
		this.previous();
	},

	onNextButtonClicked: function(){
//		this.notesInstance.instanceById('id_notes').saveContent()

		//hago set aquí porque Epoxy no se banca nicedit
		this.model.set('meta_notes',this.notesInstance.instanceById('id_notes').getContent());
		if(this.model.isMetadataValid() ){
			this.next();
		}else{
			console.error('error de validate!');
		};
		console.log(this.model.getMeta());
	},

	initNotes: function(){
        this.notesInstance = new nicEditor({
            buttonList : ['bold','italic','underline','ul', 'ol', 'link', 'hr'], 
            iconsPath: '/js_core/plugins/nicEdit/nicEditorIcons-2014.gif'
        }).panelInstance('id_notes');

        this.notesInstance.addEvent('add', function() {
        	console.log('hola');
			alert( this.notesInstance.getContent() );
		});

    },


});
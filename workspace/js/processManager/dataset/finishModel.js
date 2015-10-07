var FinishModel = StepModel.extend({
	
	defaults:{
		title: null,
		description: null,
		category: null,
		status: null,
		sources: [],
		tags: [],
		notes: null,
		data: {},
		mbox: "",
		license_url: "",
		spatial: "",
		frequency: ""
	},

	initialize: function(){
			
	},
						
	validation: {
		title: [
			{
				required: true,
				msg: gettext('VALIDATE-REQUIREDFIELD-TEXT')
			},{
				maxLength: 80,
				msg: gettext('VALIDATE-MAXLENGTH-TEXT-1') + ' 80 ' + gettext('VALIDATE-MAXLENGTH-TEXT-2')
			}
		],
		description: [
			{
				required: true,
				msg: gettext('VALIDATE-REQUIREDFIELD-TEXT')
			},{
				maxLength: 140,
				msg: gettext('VALIDATE-MAXLENGTH-TEXT-1') + ' 140 ' + gettext('VALIDATE-MAXLENGTH-TEXT-2')
			},{
				fn: function(value, attr, computedState){
					if( $.trim(computedState.title) === $.trim(value) ) {
						return gettext('APP-TITSUBDES-NOTEQUALS');
					}
				}
			}
		],
		mbox: [
			{
				required: false
			},{
				pattern: 'email',
				msg: gettext('VALIDATE-EMAILNOTVALID-TEXT')
			}
		],
		license_url: function(value, attr, computedState){
			if(value === 'other' && $.trim(computedState.license_url_other) === '' ) {
				return gettext('VALIDATE-REQUIREDFIELD-TEXT');
			}
		},
		frequency: function(value, attr, computedState){
			if(value === 'other' && $.trim(computedState.frequency_other) === '' ) {
				return gettext('VALIDATE-REQUIREDFIELD-TEXT');
			}
		}
	},

	// notes use NicEditor, so can't be validated as always (?)
	validate_notes: function(){
			max_length = $("#notes_reference").data('max_length');
			return (this.get('data').notes.length < max_length)
	},

	setData: function(){

		// Set Data from Output
		this.setDataFromOutput();

		// Get Data, tags and sources
		var data = this.get('data'),
			tags = this.get('tags'),
			sources = this.get('sources');

		// Set Data
		data.title = $.trim( this.get('title') );
		data.description = $.trim( this.get('description') );
		data.category = $('#id_category option:selected').val();
		data.status = $('#id_status option:selected').val();
		data.mbox = $.trim( this.get('mbox') );
		data.spatial = $.trim( this.get('spatial') );
		data.license_url = $.trim( this.get('license_url') );
		data.frequency = $.trim( this.get('frequency') );
		
		// Prepare Sources for Data
		data['sources-TOTAL_FORMS'] = sources.length;
		data['sources-INITIAL_FORMS'] = '0';
		data['sources-MAX_NUM_FORMS'] = '';
		for( var i=0;i<sources.length;i++ ){
			for( var paramName in sources[i] ){
				data['sources-'+i+'-'+paramName] = sources[i][paramName]
			}
		}

		// Prepare tags for Data
		data['tags-TOTAL_FORMS'] = tags.length;
		data['tags-INITIAL_FORMS'] = '0';
		data['tags-MAX_NUM_FORMS'] = '';
		for( var i=0;i<tags.length;i++ ){
			for( var paramName in tags[i] ){
				data['tags-'+i+'-'+paramName] = tags[i][paramName]
			}
		}

		// Notes
		if($('.nicEdit-main').length > 0
				&& $('.nicEdit-main').html() != '<br>' // When notes initialice empty, nicEdit initialice with <br>, so we check if that is the case
		){
				data.notes = $('.nicEdit-main').html();
		}
		else{
				data.notes = $.trim( this.get('notes') );
				console.log(this.get('notes'))
		}

		// Set Data
		this.set('data',data);

	}

});

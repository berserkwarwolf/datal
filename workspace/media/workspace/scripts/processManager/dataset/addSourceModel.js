var AddSourceModel = Backbone.Model.extend({

	defaults: {
		name: "",
		url: ""
	},

	validation: {
		name: [
			{
				required: true,
				msg: gettext('VALIDATE-REQUIREDFIELD-TEXT')
			},{
				maxLength: 40,
				msg: gettext('VALIDATE-MAXLENGTH-TEXT-1') + ' 40 ' + gettext('VALIDATE-MAXLENGTH-TEXT-2')
			},{
				fn: 'validateSourceName'
			}
		],
		url: [
			{
				required: true,
				msg: gettext('VALIDATE-REQUIREDFIELD-TEXT')
			},{
				pattern: /^(?:(ht|f|sf)tp(s?)\:\/\/)/,
				msg: gettext('VALIDATE-PROTOCOLNOTALLOWED-TEXT')
			},{
				pattern: 'url',
				msg: gettext('VALIDATE-URLNOTVALID-TEXT')
			},{
				fn: 'validateSourceUrl'
			}
		]
	},

	validateSourceName: function(value, attr, computedState) {
		var url = '/source_manager/validate_source_name/',
			data = {},
			msg = false;
		data[attr] = value;
		$.ajax({
			url: url,
			type: 'POST',
			data: data,
			dataType: 'json',
			async: false,
			success: function(response){
				if( response.name != false){
					msg = gettext( 'VALIDATE-SOURCENAMEALREADYEXIST-TEXT' );	
				}
			}
		});
		return msg;
	},

	validateSourceUrl: function(value, attr, computedState) {
		var url = '/source_manager/validate_source_url/',
			data = {},
			msg = false;
		data[attr] = value;
		$.ajax({
			url: url,
			type: 'POST',
			data: data,
			dataType: 'json',
			//async: false,
			success: function(response){
				console.log(response);
				if( response.name != false){
					msg =  gettext( 'VALIDATE-SOURCEALREADYEXIST-TEXT1' ) + response.name + gettext( 'VALIDATE-SOURCEALREADYEXIST-TEXT2' );	
				}
			}
		});
		return msg;
	}

});

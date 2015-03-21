var AddSourceModel = Backbone.Model.extend({
	
	defaults: {
		name: "",
		url_source: ""
	},

	validation: {
		name:
		{
			required: true,
			msg: gettext('VALIDATE-REQUIREDFIELD-TEXT')
		},
		url_source: [
			{
				required: true,
				msg: gettext('VALIDATE-REQUIREDFIELD-TEXT')
			},{
				pattern: 'url',
				msg: gettext('VALIDATE-URLNOTVALID-TEXT')
			}
		]
	}

});


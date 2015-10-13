var CollectWebserviceParamModel = Backbone.Model.extend({
	
	defaults: {
		name: "",
		default_value: "",
		editable: false
	},

	validation: {
		name:
		{
			required: true,
			msg: gettext('VALIDATE-REQUIREDFIELD-TEXT')
		},
		default_value:
		{
			required: true,
			msg: gettext('VALIDATE-REQUIREDFIELD-TEXT')
		}
	}

});
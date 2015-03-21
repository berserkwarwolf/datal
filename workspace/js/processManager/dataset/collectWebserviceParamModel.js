var CollectWebserviceParamModel = Backbone.Model.extend({
	
	defaults: {
		param_name: "",
		default_value: "",
		enable_editable: ""
	},

	validation: {
		param_name:
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
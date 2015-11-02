var CollectWebserviceParamModel = Backbone.Model.extend({
	
	defaults: {
		name: "",
		default_value: "",
		editable: false
	},

	validation: {
		name: [
            {
                required: true,
                msg: gettext('VALIDATE-REQUIREDFIELD-TEXT')
            },{
                maxLength: 30,
                msg: gettext('VALIDATE-MAXLENGTH-TEXT-1') + ' 30 ' + gettext('VALIDATE-MAXLENGTH-TEXT-2')
            }
        ],
		default_value: [
            {
                required: true,
                msg: gettext('VALIDATE-REQUIREDFIELD-TEXT')
            },{
                maxLength: 100,
                msg: gettext('VALIDATE-MAXLENGTH-TEXT-1') + ' 100 ' + gettext('VALIDATE-MAXLENGTH-TEXT-2')
            }
        ]
	}

});
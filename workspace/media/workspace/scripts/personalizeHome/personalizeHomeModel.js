var personalizeModel = Backbone.Model.extend({

	defaults: {
		themeID: null
		
	}, 
	initialize: function(attr){
		if (!_.isUndefined(attr)){
			var jsonContent = attr.jsonContent
			if (!_.isUndefined(jsonContent.theme)){
				this.set('themeID', jsonContent.theme)
			}
			
			if (!_.isUndefined(jsonContent.config)){
				this.set('config', jsonContent.config)
			}
		
		}

	}

});
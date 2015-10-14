var theme1Model = Backbone.Epoxy.Model.extend({
	defaults: {
		mainTitle:'',
		mainSection:'',
		resourcesTable:true,
	},

	initialize: function(attr){		
		if (!_.isUndefined(attr)){
			var themeConfig = attr.config
			if (!_.isUndefined(themeConfig.mainTitle)){
				this.set('mainTitle', themeConfig.mainTitle)
			}
			
			if (!_.isUndefined(themeConfig.mainSection)){
				this.set('mainSection', themeConfig.mainSection )
			}

			if (!_.isUndefined(themeConfig.resourcesTable)){
				this.set('resourcesTable', themeConfig.resourcesTable)
			}
		
		}
		
	},

	toJSON: function() {
		return _.omit(this.attributes, 'config');
	},
});
var theme1Model = Backbone.Epoxy.Model.extend({
	defaults: {
		mainTitle:'',
		mainSection:'',
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
		
		}
		
	},

	toJSON: function() {
		return _.omit(this.attributes, 'config');
	},
});
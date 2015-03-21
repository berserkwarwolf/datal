var theme3Model = Backbone.Epoxy.Model.extend({
	
	defaults: {
		mainTitle:'',
		mainSection:'',		
		imageUrlCarrousel:false,
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
				if (!_.isUndefined(themeConfig.imageUrlCarrousel)){
					this.set('imageUrlCarrousel', themeConfig.imageUrlCarrousel )
				}
			}
			else{
				this.clear().set(this.defaults);
				this.set('imageUrlCarrousel',[]);
			}
	},
	
	toJSON: function() {
		return _.omit(this.attributes, 'config');
	}
});
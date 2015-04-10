var theme0Model = Backbone.Epoxy.Model.extend({
	defaults: {
		mainTitle:'',
		mainSection:'',
		sideBarSection:'',
		sliderSection:[],
		leftBottomSection:'',
		rightBottomSection:'',
		resourcesTable:true,
	},
	 
	initialize: function(attr){			
		if (!_.isUndefined(attr)){
			
				
			if (!_.isUndefined(attr)){
				var themeConfig = attr.config
				if (!_.isUndefined(themeConfig.mainTitle)){
					this.set('mainTitle', themeConfig.mainTitle)
				}
				
				if (!_.isUndefined(themeConfig.mainSection)){
					this.set('mainSection', themeConfig.mainSection )
				}
				
				if (!_.isUndefined(themeConfig.sideBarSection)){
					this.set('sideBarSection', themeConfig.sideBarSection )
				}
				
				if (!_.isUndefined(themeConfig.sliderSection)){
					this.set('sliderSection', themeConfig.sliderSection )
				}
				
				if (!_.isUndefined(themeConfig.leftBottomSection)){
					this.set('leftBottomSection', themeConfig.leftBottomSection)
				}
				
				if (!_.isUndefined(themeConfig.rightBottomSection)){
					this.set('rightBottomSection', themeConfig.rightBottomSection)
				}

				if (!_.isUndefined(themeConfig.resourcesTable)){
					this.set('resourcesTable', themeConfig.resourcesTable)
				}
				
			}
		}
	},
	
	toJSON: function() {
		return _.omit(this.attributes, 'config');
	} 
});

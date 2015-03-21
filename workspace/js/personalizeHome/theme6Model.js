var theme6Model = Backbone.Model.extend({
    defaults: {
        imageSliderSection:false,
        searchboxHintText:'',
        buttonsPerRow:'4',
        buttonsPerRowWidth:'25',
        buttonSection:false,
        leftBottomSectionImageUrl:'',
        leftBottomSectionTitle:'',
        leftBottomSectionLink:'',
        middleBottomSectionImageUrl:'',
        middleBottomSectionTitle:'',
        middleBottomSectionLink:'',
        rightBottomSectionImageUrl:'',
        rightBottomSectionTitle:'',
        rightBottomSectionLink:'',
    },
    initialize: function(attr){ 
        if (!_.isUndefined(attr)){
            var themeConfig = attr.config
            if (!_.isUndefined(themeConfig.searchboxHintText)){
                this.set('searchboxHintText', themeConfig.searchboxHintText)
            }
            if (!_.isUndefined(themeConfig.imageSliderSection)){
                this.set('imageSliderSection', themeConfig.imageSliderSection )
            }
            if (!_.isUndefined(themeConfig.buttonsPerRow)){
                this.set('buttonsPerRow', themeConfig.buttonsPerRow)
            }
            if (!_.isUndefined(themeConfig.buttonSection)){
                this.set('buttonSection', themeConfig.buttonSection )
            }
            if (!_.isUndefined(themeConfig.leftBottomSectionImageUrl)){
                this.set('leftBottomSectionImageUrl', themeConfig.leftBottomSectionImageUrl)
            }
            if (!_.isUndefined(themeConfig.leftBottomSectionTitle)){
                this.set('leftBottomSectionTitle', themeConfig.leftBottomSectionTitle)
            }
            if (!_.isUndefined(themeConfig.leftBottomSectionLink)){
                this.set('leftBottomSectionLink', themeConfig.leftBottomSectionLink)
            }
            if (!_.isUndefined(themeConfig.middleBottomSectionImageUrl)){
                this.set('middleBottomSectionImageUrl', themeConfig.middleBottomSectionImageUrl)
            }
            if (!_.isUndefined(themeConfig.middleBottomSectionTitle)){
                this.set('middleBottomSectionTitle', themeConfig.middleBottomSectionTitle)
            }
            if (!_.isUndefined(themeConfig.middleBottomSectionLink)){
                this.set('middleBottomSectionLink', themeConfig.middleBottomSectionLink)
            }
            if (!_.isUndefined(themeConfig.rightBottomSectionImageUrl)){
                this.set('rightBottomSectionImageUrl', themeConfig.rightBottomSectionImageUrl)
            }
            if (!_.isUndefined(themeConfig.rightBottomSectionTitle)){
                this.set('rightBottomSectionTitle', themeConfig.rightBottomSectionTitle)
            }                           
            if (!_.isUndefined(themeConfig.rightBottomSectionLink)){
                this.set('rightBottomSectionLink', themeConfig.rightBottomSectionLink)
            }
        }
        else{
            this.clear().set(this.defaults);
            this.set('buttonSection',[]);
            this.set('imageSliderSection',[]);
        }
    },

    toJSON: function() {
        return _.omit(this.attributes, 'config');
    }
});
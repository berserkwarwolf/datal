var theme5Model = Backbone.Model.extend({
    defaults: {
        breadcrumbSection:'',
        welcomeImageUrl:'',
        welcomeFirstTitle:'',
        welcomeSecondTitle:'',
        welcomePopupTitle:'',
        welcomePopupText:'',
        welcomePopupFooter:'',
        featuredImageUrl:'',
        featuredTitle:'',
        featuredLink:'',
        buttonSection:[],
        buttonsPerRow:'5',
        buttonsPerRowWidth:'20',
        leftBottomSectionImageUrl:'',
        leftBottomSectionTitle:'',
        leftBottomSectionLink:'',
        middleBottomSectionImageUrl:'',
        middleBottomSectionTitle:'',
        middleBottomSectionLink:'',
        rightBottomSectionImageUrl:'',
        rightBottomSectionTitle:'',
        rightBottomSectionLink:'',
        links:[],

    },
    initialize: function(attr){ 
        if (!_.isUndefined(attr)){
                var themeConfig = attr.config
                if (!_.isUndefined(themeConfig.breadcrumbSection)){
                    this.set('breadcrumbSection', themeConfig.breadcrumbSection)
                }
                if (!_.isUndefined(themeConfig.welcomeImageUrl)){
                    this.set('welcomeImageUrl', themeConfig.welcomeImageUrl)
                }
                if (!_.isUndefined(themeConfig.welcomeFirstTitle)){
                    this.set('welcomeFirstTitle', themeConfig.welcomeFirstTitle)
                }
                if (!_.isUndefined(themeConfig.welcomeSecondTitle)){
                    this.set('welcomeSecondTitle', themeConfig.welcomeSecondTitle)
                }
                if (!_.isUndefined(themeConfig.welcomePopupTitle)){
                    this.set('welcomePopupTitle', themeConfig.welcomePopupTitle)
                }
                 if (!_.isUndefined(themeConfig.welcomePopupText)){
                    this.set('welcomePopupText', themeConfig.welcomePopupText)
                }
                 if (!_.isUndefined(themeConfig.welcomePopupFooter)){
                    this.set('welcomePopupFooter', themeConfig.welcomePopupFooter)
                }
                if (!_.isUndefined(themeConfig.featuredImageUrl)){
                    this.set('featuredImageUrl', themeConfig.featuredImageUrl)
                }
                if (!_.isUndefined(themeConfig.featuredTitle)){
                    this.set('featuredTitle', themeConfig.featuredTitle)
                }
                if (!_.isUndefined(themeConfig.featuredLink)){
                    this.set('featuredLink', themeConfig.featuredLink)
                }
                if (!_.isUndefined(themeConfig.buttonSection)){
                    this.set('buttonSection', themeConfig.buttonSection)
                }
                if (!_.isUndefined(themeConfig.buttonsPerRow)){
                    this.set('buttonsPerRow', themeConfig.buttonsPerRow)
                }
                if (!_.isUndefined(themeConfig.buttonsPerRowWidth)){
                    this.set('buttonsPerRowWidth', themeConfig.buttonsPerRowWidth)
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
                if (!_.isUndefined(themeConfig.links)){
                    this.set('links', themeConfig.links)
                }           
        }

    },

    toJSON: function() {
        return _.omit(this.attributes, 'config');
    }
});
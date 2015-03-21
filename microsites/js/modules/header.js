var HeaderSearchForm = Backbone.Model.extend({
    defaults: {
        defaultSearchText: gettext( "APP-SEARCHFORDATA-TEXT" )
        , dataStreamSuggestionUri: '/portal/DataServicesFinder/actionSuggest'
        , $Form: null
        , $FormInput: null
    }
    , initialize: function(pAttributes){
        this.attributes.$Form      = $('#id_header_searchForm');
        this.attributes.$FormInput = this.attributes.$Form.find('#id_header_search');
        this.attributes.$Form.find('#id_header_searchButton').click(_.bind(this.onSearchButtonClicked, this));
        this.attributes.$Form.submit(_.bind(this.onSubmit, this));

        this.attributes.$FormInput.click(_.bind(function(){
            if (this.attributes.$FormInput.val() == this.attributes.defaultSearchText) {
                this.attributes.$FormInput.val('');
            }
        }, this)).blur(_.bind(function(){
            if (this.attributes.$FormInput.val() == '') {
                this.attributes.$FormInput.val(this.attributes.defaultSearchText);
            }
        }, this)).trigger('blur');

        this.attributes.$FormInput.autocomplete({
            source: this.attributes.dataStreamSuggestionUri
            , minLength: 2
        });
    }
    , onSearchButtonClicked: function(){
        this.attributes.$Form.trigger('submit');
    }
    , onSubmit: function (event){
        var lSearch = $.trim(this.attributes.$FormInput.val());
        if (lSearch == '' || lSearch == this.attributes.defaultSearchText) {
            this.attributes.$FormInput.focus().trigger('click');
            return event.preventDefault();
        }
        return true;
    }
});

var HeaderMenu = Backbone.Model.extend({
    defaults: {
        activeTab: ''
        , $ActiveTab: null
        , $Menu: null
    }
    , initialize: function(pAttributes){
        this.attributes.$Menu = $('#id_main_navbar');
        this.attributes.$Menu.find('.tab .pullDownMenu').click(_.bind(this.onClick, this));
        //$('body').click(_.bind(this.closeSubMenu, this));
        this.attributes.$Menu.find('.subMenu dd:first-child').css('border',0);
        this.initActiveTab();
    }
    , onClick: function(pEvent){
        $(pEvent.currentTarget).parent().find('.subMenu').show();
        return false;
    }
    , closeSubMenu: function(pEvent){
        pEvent.stopPropagation();
        this.attributes.$Menu.find('.subMenu').hide();
    }
    , reset: function(){
        this.attributes.$Menu.find('.active').removeClass('active');
    }
    , initActiveTab: function (){
        this.reset();
        this.attributes.activeTab = $('meta[name=main-option]').attr('content');
        if (this.attributes.activeTab != 'none') {
            this.attributes.$ActiveTab = $('#' + this.attributes.activeTab);
            this.attributes.$ActiveTab.addClass('active');
        }
    }
});

var AuthManager = Backbone.Model.extend({
    defaults: {
        id: null
        , nick: null
        , roles: []
        , privileges: []
        , isAuthenticated: false
    }
    , initialize: function(pAttributes){
    }
    , hasRole: function (pRole){
        return (this.attributes.roles.indexOf(pRole) > -1);
    }
    , hasPrivilege: function (pPrivilege){
        return (this.attributes.privileges.indexOf(pPrivilege) > -1);
    }
    , isAuthenticated: function (){
        return this.attributes.isAuthenticated;
    }
    , isAnonymous: function (){
        return !this.isAuthenticated();
    }
    , getNick: function() {
        return this.attributes.nick;
    }
});

function createCookie(name,value,days) {
    if (days) {
        var date = new Date();
        date.setTime(date.getTime()+(days*24*60*60*1000));
        var expires = "; expires="+date.toGMTString();
    }
    else var expires = "";
    document.cookie = name+"="+value+expires+"; path=/";
}

function readCookie(name) {
    var nameEQ = name + "=";
    var ca = document.cookie.split(';');
    for(var i=0;i < ca.length;i++) {
        var c = ca[i];
        while (c.charAt(0)==' ') c = c.substring(1,c.length);
        if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length,c.length);
    }
    return null;
}

function eraseCookie(name) {
	createCookie(name,"",-1);
}
var AuthManager = Backbone.Model.extend({
    defaults: {
        id: null
        , nick: null
        , roles: []
        , privileges: []
        , account_level : null
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
    , isPublisher: function() {
        return this.hasRole('ao-publisher');
    }
    , isAdmin: function() {
        return this.hasRole('ao-account-admin');
    }
    , isEditor: function() {
        return (this.hasRole('ao-enhancer'));
    }

});
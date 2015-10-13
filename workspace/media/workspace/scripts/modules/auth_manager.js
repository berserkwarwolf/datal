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
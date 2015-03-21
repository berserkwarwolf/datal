ajaxManager = {

    _ajaxRequests : '',

    init : function(){
        this._ajaxRequests = new Array();
    },

    register : function( id, pRequest ){
        this._ajaxRequests[ "p" +id.toString() ] =  pRequest;
    },

    kill : function( id ){
        try{
            if( this._ajaxRequests[id.toString()].readyState != 4 )
                this._ajaxRequests[id.toString()].abort();
        }
        catch( err ){
        }
    },

    killAll : function(){
        var _self = this;
        for(var i in this._ajaxRequests) {
            _self.kill( i );
        }
        this.clear();
    },

    clear : function(){
        this._ajaxRequests = new Array();
    }
};
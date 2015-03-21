var EndPoint = Backbone.Model.extend({
    /**
    *  This object should include also the logic to handle the form of parameters
    *  at the data streams details
    *  and it should be extended to work with the form at the dashboards
    */
    defaults: {
        parameters: {}
    }
    , initialize: function(pAttributes){
        if ( typeof this.attributes.parameters == 'string' ) {
            this.extractParametersFromString(this.attributes.parameters);
        }
    }
    , extractParametersFromString: function(pEndPoint) {
        this.attributes.parameters = {};
        pEndPoint = decodeURIComponent(pEndPoint).replace('?', '&');
        var lParameters = pEndPoint.split('&');
        for (var lIndex = 1; lIndex < lParameters.length; lIndex++) {
            lValues = lParameters[lIndex].split('=');            
      
            this.attributes.parameters[lValues[0]] = lValues[1];            	
        }
    }
    , getUrlChunk: function() {
        return '?' + $.param(this.attributes.parameters);
    }
    , toString: function() {
        return '&' + $.param(this.attributes.parameters);
    }
    , setParameter: function(pParameter, pArgument) {
        this.attributes.parameters[pParameter] = pArgument;
    }
});
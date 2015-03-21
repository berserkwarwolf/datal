window.fOverlayDefaultsOptions = { top: 'center'
                                , left: 'center'
                                , mask: {
                                    color: '#000'
                                    , loadSpeed: 200
                                    , opacity: 0.5
                                    , zIndex: 99999
                                 }
                                 , closeOnClick: false
                                 , closeOnEsc: true
                                 , load: false
                              };

$(document).ready(function(){
    if(!Array.indexOf){
        Array.prototype.indexOf = function(obj){
            for(var i=0; i<this.length; i++){
                if(this[i]==obj){
                    return i;
                }
            }
            return -1;
        }
    }

    var lHeaderSearchForm = new HeaderSearchForm();
    var lHeaderMenu = new HeaderMenu();
});

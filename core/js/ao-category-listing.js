/*
 * jQuery UI Widget Categories @VERSION
 * Created by : Datal
 * 
 * Depends:
 *	jquery.ui.core.js
 *	jquery.ui.widget.js
 * 
 */
(function($, undefined){
    $.widget("ui.widgetCategories", {
        options: {
			apiUrl : '',
			apiKey : '',
			widgetTitle : '',
			metaData : '',
			searchTerm : '',
			page : '',
            limit : ''
        },
        _create: function(){
            var self = this,
                options = self.options;
			
			self.json = '';
            self._getResources();
        },
        _getResources : function(){
			var self = this;
			var lUrl  = self.options.apiUrl + '/resources/explore';
			var lData = "&auth_key=" + self.options.apiKey;
			if(self.options.searchTerms != ""){
                lData += "&q=" + self.options.searchTerms;
            }
            if(self.options.metaData != ""){
                lData += "&meta=" + self.options.metaData;
            }
            if(self.options.page != ""){
                lData += "&page=" + self.options.page;
            }
            if(self.options.limit != ""){
                lData += "&limit=" + self.options.limit;
            }
			
			self.element.html('<div class="ao-loading">Cargando...</div>');
			
		    $.ajax({ url: lUrl
			            , data:lData
			            , dataType: 'jsonp'
						, context : self
			            , success: function(pResponse){
							this.json = pResponse;
							this._parseResources();
						},
						error : function(pResponse){
							this.element.html('<span class="ao-error">An error has ocurred trying to load your widget! Please refresh page</span');
						}
		            });
		},
		_parseResources : function(pJson){
			var self = this;
			var lJson = self.json;
			var lHtml = '';
			
			lHtml += '<div class="ao-categories"><div class="ao-categories-content">';
			lHtml += '';
			
			for (var i =0; i< lJson.length ; i++){
				var lCategories = lJson[i];
				var lTile = lCategories.name;
				var lCategory = lCategories.results;
				lHtml += '<div class="ao-categories-column"><div class="ao-categories-title">'+lTile+'</div>';
				for (var j = 0; j < lCategory.length; j++) {
				    var lValue = lCategory[j];
					lHtml += '<div class="ao-categories-item">';
	                lHtml += '<a href="'+lValue.link+'" title="'+lValue.title+' - '+ lValue.subtitle + '" class="ao-categories-item-link"><strong>'+lValue.title+'</strong> <span class="ao-sep"> - </span>'+ lValue.subtitle + '</a><div class="ao-categories-item-description">'+lValue.description+'</div>';
	                lHtml += '</div>';
				}
				lHtml += '</div>';
			};
			
			lHtml += '</div></div>';
			
			this.element.html(lHtml);
		},
        destroy: function(){
            var self = this;
            //jQuery.widget.prototype.destroy.apply(self, arguments);
        }
    });
    jQuery.extend(jQuery.ui, {
        version: "@VERSION"
    });
}(jQuery));
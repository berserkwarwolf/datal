/*
 * jQuery UI TaggingSource @VERSION
 * Created by : mmenafra
 * 
 * Depends:
 *	jquery.ui.core.js
 *	jquery.ui.widget.js
 *  jquery.ui.autocomplete.js
 * 
 */
(function($, undefined){
    $.widget("ui.taggingSources", {
        options: {
            source : '',
            minLength : 0,
            sourceContainer : null,
           	sources: [],
           	prefixId : 'id_source_'
        },
        _create: function(){
            var self = this,
                options = self.options;
			
			self.$SourceName 	= $('#id_source_name');
			self.$SourceUrl 	= $('#id_source_url');
			
            if(typeof options.sourceContainer === "string"){
                self.sourceContainer = jQuery(options.sourceContainer);
            }else if (options.sourceContainer == null) {
                self.sourceContainer = jQuery('<div id="id_source_container" class="tagsContent"></div>'); 
                self.element.after(self.sourceContainer);
            } else {
                self.sourceContainer = options.sourceContainer;
            }

            jQuery.each(options.sources, function(pIndex, pValue){
                self._createSource(pValue.name, pValue.url);
            });
			
            //dependency with autocomplete widget
            self.element.autocomplete({
                source: options.source,
                minLength: options.minLength,
                select: function(pEvent, ui){
                    if (self.options.disabled) {
                        return;
                    }
                    self._onSourceSelected(pEvent, ui);
                    return false;
                }
            });
            self.sourceContainer.bind('click', function(pEvent){
                if (self.options.disabled) {
                    return;
                }
                self._onRemoveSource(pEvent);
            });
			
			$('#id_addSource').bind('click', function(pEvent){
                if (self.options.disabled) {
                    return;
                }
                self._onAddNewSource(pEvent);
            });
        },
		_onAddNewSource : function(pEvent){
			var self = this;
            self._trigger('sourceSelected', pEvent);
			
			var l$Name = self.$SourceName;
			var lUrl = self.$SourceUrl.val();
			
			//if(self.$SourceForm.valid()){
				self._addSource(l$Name, lUrl);
	            self._trigger('sourceAdded', pEvent);
			//}
            
            return;
		},
        _onSourceSelected: function(pEvent, ui){
            var self = this;
            self._trigger('sourceSelected', pEvent, ui);
			
            var key = jQuery.ui.keyCode;
            var $Source = jQuery(pEvent.target);
            $Source.val(ui.item.value);
			
            if (pEvent.keyCode == key.ENTER) {
                self._addSource($Source, '');
                self._trigger('sourceAdded', pEvent);
                $Source.val('');
            }
            if (pEvent.button == 0) {
                self._addSource($Source, '');
                self._trigger('sourceAdded', pEvent);
                $Source.val('');
            }
            return;
        },
        _addSource: function(pNewSource, pUrl){
            var $NewSource = jQuery(pNewSource);
            this._createSource($NewSource.val(), pUrl);
            $NewSource.val('');
			this.$SourceUrl.val('');
        },
        _createSource: function(pSource, pUrl){
            var name = jQuery.trim(pSource.replace(/[^a-zA-Z0-9 áéíóúAÉÍÓÚÑñ]/g, " "));
            if (name.length > 0) {
                var id = this.options.prefixId + name.replace(/\s+/g, "").toLowerCase();
                var $SourcesContainer = this.sourceContainer;
                if ($SourcesContainer.find('#' + id).length == 0) {
                    var html = '<span id="' + id + '" class="tag">';
                    html += '<span class="tagInner clearfix">';
                    html += '<span class="tagTxt" id="' + id + '_name" data="'+pUrl+'">' + name + '</span>';
                    html += '<a href="javascript:;" rel="#' +id + '" title="Remove Source"><span class="DN">Remove Source</span></a>';
                    html += '</span>';
                    html += '</span>';
                    $SourcesContainer.append(html);
                    return true;
                }
            }
            return false;
        },
        _onRemoveSource: function(pEvent){
            var self = this;
            var target = jQuery(pEvent.target);
            if (target.is('span')) {
                target = target.parent();
            }
            if (target.is('a')) {
                jQuery(target.attr('rel')).remove();
                self._trigger('sourceRemoved', pEvent);
            }
            return;
        },
        destroy: function(){
            var self = this;
            //jQuery.widget.prototype.destroy.apply(self, arguments);
            self.element.autocomplete('destroy');
            self.sourceContainer.remove();
        }
    });
    jQuery.extend(jQuery.ui, {
        version: "@VERSION"
    });
}(jQuery));
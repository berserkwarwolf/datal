/*
 * jQuery UI Tagging @VERSION
 * Created by : mmenafra
 * 
 * Depends:
 *	jquery.ui.core.js
 *	jquery.ui.widget.js
 *  jquery.ui.autocomplete.js
 * 
 */
(function($, undefined){
    $.widget("ui.tagging", {
        options: {
            source : '',
            minLength : 0,
            tagContainer : null,
           	tags: [],
           	prefixId : 'id_tag_'
        },
        _create: function(){
            var self = this,
                options = self.options;
            if(typeof options.tagContainer === "string"){
                self.tagContainer = jQuery(options.tagContainer);
            }else if (options.tagContainer == null) {
                self.tagContainer = jQuery('<div id="id_tag_container" class="tagsContent"></div>'); 
                self.element.after(self.tagContainer);
            } else {
                self.tagContainer = options.tagContainer;
            }

            jQuery.each(options.tags, function(pIndex, pValue){
                self._createTag(pValue);
            });

            //dependency with autocomplete widget
            self.element.autocomplete({
                source: options.source,
                minLength: options.minLength,
                select: function(pEvent, ui){
                    if (self.options.disabled) {
                        return;
                    }
                    self._onTagSelected(pEvent, ui);
                    return false;
                }
            });
            self.element.bind('keypress', function(pEvent){
                if (self.options.disabled) {
                    return;
                }
                self._onTagKeyPressed(pEvent);
            });
            self.tagContainer.bind('click', function(pEvent){
                if (self.options.disabled) {
                    return;
                }
                self._onRemoveTag(pEvent);
            });
        },
        _onTagKeyPressed: function(pEvent){
            var self = this;
            var key = jQuery.ui.keyCode;
            if (pEvent.keyCode == key.ENTER || pEvent.charCode == 44) {
                self._addTag(pEvent.currentTarget);
                self._trigger('tagAdded', pEvent);
				self.element.autocomplete( "close" );
                pEvent.preventDefault();
            }
        },
        _onTagSelected: function(pEvent, ui){
            var self = this;
            self._trigger('tagSelected', pEvent, ui);
            var key = jQuery.ui.keyCode;
            var $tag = jQuery(pEvent.target);
            $tag.val(ui.item.value);
            if (pEvent.keyCode == key.ENTER) {
                self._addTag($tag);
                self._trigger('tagAdded', pEvent);
                $tag.val('');
            }
            if (pEvent.button == 0) {
                self._addTag($tag);
                self._trigger('tagAdded', pEvent);
                $tag.val('');
            }
            return;
        },

        _addTag: function(pNewTag){
            var $NewTag = jQuery(pNewTag);
            this._createTag($NewTag.val());
            $NewTag.val('');
        },

        _createTag: function(pTag){
            var name = jQuery.trim(pTag.replace(/[^a-zA-Z0-9 áéíóúAÉÍÓÚÑñ]/g, " "));
            if (name.length > 0) {
                var id = this.options.prefixId + name.replace(/\s+/g, "").toLowerCase();
                var $TagsContainer = this.tagContainer;
                if ($TagsContainer.find('#' + id).length == 0) {
                    var html = '<span id="' + id + '" class="tag">';
                    html += '<span class="tagInner clearfix">';
                    html += '<span class="tagTxt" id="' + id + '_name">' + name + '</span>';
                    html += '<a href="javascript:;" rel="#' +id + '" title="Remove Tag"><span class="DN">Remove Tag</span></a>';
                    html += '</span>';
                    html += '</span>';
                    $TagsContainer.append(html);
                    return true;
                }
            }
            return false;
        },

        _onRemoveTag: function(pEvent){
            var self = this;
            var target = jQuery(pEvent.target);
            if (target.is('span')) {
                target = target.parent();
            }
            if (target.is('a')) {
                jQuery(target.attr('rel')).remove();
                self._trigger('tagRemoved', pEvent);
            }
            return;
        },
        destroy: function(){
            var self = this;
            //jQuery.widget.prototype.destroy.apply(self, arguments);
            self.element.autocomplete('destroy');
            self.element.unbind('keypress');
            self.tagContainer.remove();
        }
    });
    jQuery.extend(jQuery.ui, {
        version: "@VERSION"
    });
}(jQuery));
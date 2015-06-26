var TagSuggestor = Backbone.Model.extend({
    defaults : {
		$Container 		: null,
		text		 	: '',
		tagCloud		: ''
    },
    initialize: function(){
		this.getText();
		this.getTagCloud();
		
		this.attributes.$Container.find('#id_recommendedTags').click(_.bind(this.onTagClick, this));
		//bind to Tagging plugin to hook remove tag method
		$('#id_tag_container').click(_.bind(this.onRemoveClick, this));
    },
	getText : function(){
		this.attributes.text = $.trim(step0.attributes.$DataSourceContainer.text().replace(/<.*?>/g, ''));
	},
	getTagCloud : function(){
		var lUrl 	= '/dataviews/action_get_tag_cloud';
        var lData 	= 'text=' + $.URLEncode(this.attributes.text) + '&csrfmiddlewaretoken=' + csrfmiddlewaretoken;
        
		$.ajax({
            url : lUrl,
            data : lData,
			type : 'POST',
			dataType: 'json',
            success : _.bind(this.onSuccessLoadingTags , this),
			error: _.bind(function(){
				this.attributes.$Container.find('#id_recommendedTags').html('Sorry no tags available!');
			}, this),
            cache : false
        });
	},
	onSuccessLoadingTags : function(pResponse){
		this.loadTagCloud(pResponse);
	},
	loadTagCloud : function(pJson){
		var lHtml = '';
		if(pJson.status == 'ok'){
			var lKeywords 	= pJson.keywords;
			var lLength		= lKeywords.length;
			if (lLength > 0) {
				for (var i = 0; i < lLength; i++) {
					var lName 	= lKeywords[i].name;
					var lNameId = jQuery.trim(lName.replace(/\W/g, " ").replace(/\s+/g, "")).toLowerCase();
					lHtml += '<li><a id="id_tag_' + lNameId + '" href="javascript:;" title="tag-name">' + lName + '</a></li>';
				};
			}else{
				lHtml += 'Sorry no tags available!';
			}
		}else{
			lHtml += 'Sorry no tags available!';
		}
		
		this.attributes.$Container.find('#id_recommendedTags').html(lHtml);
	},
	onTagClick : function(pEvent){
		var $lTarget = $(pEvent.target);
		if($lTarget.is('a')){
			$lTarget.parent().addClass('selected');
			this.addTag($lTarget.text());
		}
	},
	addTag : function(pTag){
		var lName = jQuery.trim(pTag.replace(/\W/g, " "));
        if (lName.length > 0) {
            var lId = 'id_tag_' + lName.replace(/\s+/g, "").toLowerCase();
            var $lTagsContainer = $('#id_tag_container');
            if ($lTagsContainer.find('#' + lId).length == 0) {
                var html = '<span id="' + lId + '" class="tag">';
                html += '<span class="tagInner clearfix">';
                html += '<span class="tagTxt" id="' + lId + '_name">' + lName + '</span>';
                html += '<a href="javascript:;" rel="#' +lId + '" title="' + gettext( "APP-REMOVETAG-TEXT" ) + '"><span class="DN">' + gettext( "APP-REMOVETAG-TEXT" ) + '/span></a>';
                html += '</span>';
                html += '</span>';
                $lTagsContainer.append(html);
            }
        }
	}, 
	onRemoveClick : function(pEvent){
		var $lTarget = $(pEvent.target);
		
		if ($lTarget.is('span')) {
            $lTarget = $lTarget.parent();
        }
        if ($lTarget.is('a')) {
			this.removeTag($lTarget);
        }
	},
	removeTag : function(pTag){
		var lId = pTag.attr('rel');
		$('#id_recommendedTags').find(lId).parent().removeClass('selected');
	}
});
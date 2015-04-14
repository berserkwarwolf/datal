var theme1View = Backbone.Epoxy.View.extend({
	el: '#id_themeForm',

	template: null,

	events:{
	},

	initialize: function(){
		this.options.currentView.helpAndTips('show');
		this.template = _.template( $("#id_theme1Template").html() );
		this.render();
	},

	render: function(){
		this.$el.html(this.template(this.model.attributes));
		return this;
	},
	

	save: function(event){
		var btn_id = $(event.currentTarget).attr("id")
		var ob={};
		if (btn_id === 'id_save') {
			this.options.currentModel.attributes.config = this.model.toJSON();
			this.options.currentModel.attributes.themeID = '1';
			ob['config'] = this.options.currentModel.attributes.config;
			ob['theme'] = this.options.currentModel.attributes.themeID;
			ob['type'] = 'save';
		} else {
			ob['config'] = this.model.toJSON();
			ob['theme'] = '1';
			ob['type'] = 'preview';
		}
	    $.ajax({
			type: 'POST',
			
			data: {
				'jsonString': saferStringify(ob)
			}, 
			dataType: 'json',
			beforeSend: function(){
				$("#ajax_loading_overlay").show();
			},
			success: function(response) {
				$("#ajax_loading_overlay").hide();
				if(btn_id==="id_save"){
					$.gritter.add({
						title : gettext('ADMIN-HOME-SECTION-SUCCESS-TITLE'),
						text : gettext('ADMIN-HOME-SECTION-SUCCESS-TEXT'),
						image : '/static/workspace/images/common/ic_validationOk32.png',
						sticky : false,
						time : 3500
					});
				}
				else{
					event.preventDefault();
					var preview_home = response['preview_home']						
					window.open( preview_home,'','width=1024,height=500,resizable=yes,scrollbars=yes');
				}
			},
			error: function(response) {
				$("#ajax_loading_overlay").hide();
				//response = JSON.parse(response.responseText);
				//jQuery.TwitterMessage({type: 'error', message: response.messages.join('. ')});
				$.gritter.add({
					title : gettext('ADMIN-HOME-SECTION-ERROR-TITLE'),
					text : gettext('ADMIN-HOME-SECTION-ERROR-TEXT'),
					image : '/static/workspace/images/common/ic_validationError32.png',
					sticky : true,
					time : ''
				});
			},
			url: '/personalizeHome/save/'
		});
	}
	

});
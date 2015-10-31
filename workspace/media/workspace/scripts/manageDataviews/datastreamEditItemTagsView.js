var TagsView = Backbone.View.extend({

	el: '#tagForm',

	parentView: null,

	template: null,

	parentModel: null,

	events: {
		'keyup input#id_tag_name': 'onAddTagKey'
	},

	initialize: function(){
  	this.template = _.template( $("#id_AddTagTemplate").html() );
		this.parentView = this.options.parentView;
		this.parentModel = this.options.parentModel;
		this.listenTo(this.collection, 'add', this.addTag);
		this.listenTo(this.collection, 'remove', this.removeTag);

		// Bind model validation to view
		Backbone.Validation.bind(this);

		this.render();
	},

  render: function() {
  	this.collection.forEach(this.addTag, this);
    this.$el.find('#addTag').html( this.template() );
  	this.initAutocomplete();

    // Bind custom model validation callbacks
    var self = this;
		Backbone.Validation.bind(this, {
			valid: function (view, attr, selector) {
				self.setIndividualError(view.$('[name=' + attr + ']'), attr, '');
			},
			invalid: function (view, attr, error, selector) {
				self.setIndividualError(view.$('[name=' + attr + ']'), attr, error);
			}
		});

    return this;
  },  

  addTag: function(model){

  	// Add new active tag to DOM
    var theView = new TagView({ model: model });
    this.$el.find('.tagsContent').append( theView.render().el );

    // Clear Add tag form
    this.clearTagForm();

  },

	removeTag: function(model){
	},

	setIndividualError: function(element, name, error){
		// If not valid
		if( error != ''){
			element.addClass('has-error');
			element.next('p.has-error').remove();
			element.after('<p class="has-error">'+error+'</p>');

		// If valid
		}else{
			element.removeClass('has-error');
			element.next('p.has-error').remove();
		}
	},

	clearTagForm:function(){
		$('#id_tag_name').val("");
	},

	onAddTagKey: function(e) {
		var code = e.keyCode;
		var tag = $('#id_tag_name').val();
		if((tag != '') && (code == 188 || code == 13)) { 
			if(code == 188){
				var tagNeat = tag.substring(0, tag.length-1);
				this.model.set('name', tagNeat);
			}else{
				this.model.set('name', tag);
			}
			if(this.model.isValid(true)){
				this.collection.add(this.model.toJSON());
				$('#id_tag_name').removeClass('has-error');
				$('#tag_error_f').hide();
			}
			else {
			    //tag name is too large (40 chars max)
			    $('#id_tag_name').addClass('has-error');
			    var msg = this.model.validation.name.msg;
			    $('#tag_error_f').html(msg);
			    $('#tag_error_f').show();
			    
			    /* cant see it
			    self = this;
			    $.gritter.add({
        			title: gettext('INVALID-TAG'),
        			text: msg,
        			image: '/static/workspace/images/common/ic_validationError32.png',
        			sticky: true,
        			time: ''
        		});
        		*/
			    }
		}
	},

	initAutocomplete : function(){
    var self = this;
    $('#id_tag_name').autocomplete({
      source: self.parentModel.get('tagUrl'),
      minLength: 3,
      select: function (e, ui) {
      	e.preventDefault();
      	self.model.set('name', ui.item.value);
      	if(self.model.isValid(true)){
					self.collection.add(self.model.toJSON());
					$(e.target).val('');
				}
	    }
    });
	}

});
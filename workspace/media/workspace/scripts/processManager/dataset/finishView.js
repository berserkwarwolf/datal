var FinishView = StepView.extend({

	name: null,
	template: null,
	sources: null,
	tags: null,

	initialize: function(){

		this.template = _.template( $("#id_finishTemplate").html() );
		this.name = this.model.get('name');

		// Overriding el and $el
		this.el = '.step[data-step='+this.name+']',
		this.$el = $(this.el);

		// Right way to extend events without overriding the parent ones
		var eventsObject = {}
		eventsObject['click .step[data-step='+this.name+'] .navigation .backButton'] = 'onPreviousButtonClicked';
		eventsObject['click .step[data-step='+this.name+'] .navigation .saveButton'] = 'onSaveButtonClicked';
		eventsObject['change #id_license_url, #id_frequency'] = 'onSelectChange';
		this.addEvents(eventsObject);

		// Bind model validation to view
		Backbone.Validation.bind(this);	

		console

		this.render();

	},

	render: function(){

		var self = this;

		this.$el.find('.formContent').html( this.template( this.model.toJSON() ) );	

		// Init Source Collection
		this.initSourceList();

		// Init Tag Collection
		this.initTagList();

		this.initNotes();

		// Bind custom model validation callbacks
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

	initNotes: function(){
		new nicEditor({
			buttonList : ['bold','italic','underline','ul', 'ol', 'link', 'hr'],
			iconsPath: '/js_core/plugins/nicEdit/nicEditorIcons-2014.gif'
		}).panelInstance('id_notes');
	},

	onSelectChange: function(event){

		var element = event.currentTarget,
			value = $(element).val(),
			otherElement = $(element).attr('data-other'),
			otherRow = this.$el.find(otherElement);

		if(value == 'other'){
			otherRow.show();
		}else{
			otherRow.hide();
		}

	},

	onPreviousButtonClicked: function(){
		this.previous();
	},

	onSaveButtonClicked: function(){	
	
		if(this.model.isValid(true)){

			// Set sources and tags
			this.model.set('sources', this.sources.toJSON());
			this.model.set('tags', this.tags.toJSON());
				
			// Set model data attribute
			this.model.setData();	
			if (!this.model.validate_notes()){
								max_length = $("#notes_reference").data('max_length');
								msg = gettext('VALIDATE-MAXLENGTH-TEXT-1') + max_length + gettext('VALIDATE-MAXLENGTH-TEXT-2');
					this.setIndividualError(null, 'notes', msg);
					return false;
						}
				

			// Get Output and Data
			var output = this.model.get('output'),
				data = this.model.get('data');

			// If output.files has a file, then upload and send data
			if( !_.isUndefined( output.inputFileId ) && output.files.length > 0 ){

				var self = this;

				// Set options
				$(output.inputFileId).fileupload('option', {
					url: this.model.get('saveUrl'),
					formData: data
				});

				// Send files and data
				$.when(
					$(output.inputFileId).fileupload('send', {
						files: output.files
					})
				).then(function(response){
					var response = jQuery.parseJSON(response);
					var output = self.model.get('output');
					output.revision_id = response.dataset_revision_id;
					self.model.set('output',output);
					
					self.next();
				});

			// else, normal save
			}else{
				$.ajax({
					url: this.model.get('saveUrl'),
					type:'POST',
					data: data,
					dataType: 'json',
					beforeSend: _.bind(this.onSaveBeforeSend, this),
					success: _.bind(this.onSaveSuccess, this),
					error: _.bind(this.onSaveError, this)
				});
			}

		}

	},

	onSaveBeforeSend: function(xhr, settings){

		// Prevent override of global beforeSend
		$.ajaxSettings.beforeSend(xhr, settings);

		$("#ajax_loading_overlay").show();

	},

	onSaveSuccess: function(response){
		var output = this.model.get('output');
		output.revision_id = response.dataset_revision_id;
		this.model.set('output',output);

		this.next();
	},

	onSaveError: function(response){
		// Hide Loadings
		$("#ajax_loading_overlay").hide();
		datalEvents.trigger('datal:application-error', response);
	},

	setIndividualError: function(element, name, error){
		
		var textarea = $('.textarea');

		// If not valid
		if( error != ''){

			if(name == 'notes'){
				textarea.addClass('has-error');
				textarea.next('p.has-error').remove();
				textarea.after('<p class="has-error">'+error+'</p>');			
			}else{
				element.addClass('has-error');
				element.next('p.has-error').remove();
				element.after('<p class="has-error">'+error+'</p>');
			}

		// If valid
		}else{
			element.removeClass('has-error');
			element.next('p.has-error').remove();

			textarea.removeClass('has-error');
			textarea.next('p.has-error').remove();			
		}

	},

	initSourceList: function(){
/*
		$('#id_sources').select2({
			width: "100%",
			tags: true,
			allowClear: true, // Permite borrar todos
			//placeholder: "Enter to search...",
			ajax: {
				url: this.model.get('sourceUrl'),
				dataType: 'json',
				delay: 250,
				data: function (params) {
					return {
						term: params.term
					};
				},
				processResults: function (data, page) {
					// parse the results into the format expected by Select2.
					
					var data_array = [];

					for(var i=0;i<data.length;i++){
						var obj = {
							id: i,
							text: data[i]
						}
						data_array.push(obj);
					}

					return {
						results: data_array
					};
				},
				cache: true
			},
			minimumInputLength: 3,
			minimumResultsForSearch: 10,
			*/
			//language: Configuration.language,
			//escapeMarkup: function (markup) { return markup; },
			/*
			formatNoMatches: function(term) {
				// customize the no matches output
				return "<input class='form-control' id='newTerm' value='"+term+"'><a href='#' id='addNew' class='btn btn-default'>Create</a>"
			},
			*/


			/*
			formatResult: function(term) {
				return "<input class='form-control' id='newTerm' value='"+term+"'><a href='#' id='addNew' class='btn btn-default'>RESULT</a>"
			},
			*/


			
			//tokenSeparators: [','],


			//tags: true,
			//tags: this.model.get('sources'), // => tagging support, allow use add new entry
			//tokenSeparators: [" "], // => to separate entries
			/*
			formatSelection: instance.function (item) {
				if (item.id === item.text) {
					return "<div style='height: 16px;'>" + item.text + "</div>";
				}
				return "<img style='width: 16px; height: 16px;' src='images/" + item.logo + "'> " + item.text + " </img>";
			}, // => "on select" : useful to handle "unidentified" entry (should return new tag)
			*/
			//formatResult: instance.formatItem, // => "after select" : useful to handle "unidentified" entry (should return new tag)
			/*
			createSearchChoice: function (text) { // => find suitable tag
				var tag = utils.findBy(tags, "text", text);
				if (tag === undefined) {
					tag = {id: text, text: text};
				}
				return tag;
			},
			*/
			//createSearchChoicePosition: "bottom",
			//openOnEnter: false,
			//escapeMarkup: function (markup) { return markup; }
		//});
	





/*

	$('#id_sources').select2({
		width:'100%',
		ajax: {
			url: "https://api.github.com/search/repositories",
			dataType: 'json',
			delay: 250,
			data: function (params) {
				return {
					q: params.term, // search term
					page: params.page
				};
			},
			processResults: function (data, params) {

				console.log(data);
				console.log(params);	


				// parse the results into the format expected by Select2
				// since we are using custom formatting functions we do not need to
				// alter the remote JSON data, except to indicate that infinite
				// scrolling can be used
				params.page = params.page || 1;

				return {
					results: data.items,
					pagination: {
						more: (params.page * 30) < data.total_count
					}
				};
			},
			cache: true
		},
		escapeMarkup: function (markup) { return markup; },
		minimumInputLength: 1,
		templateResult: function (repo) {
			if (repo.loading) return repo.text;

			var markup = '<div class="clearfix">' +
			'<div class="col-sm-1">' +
			'<img src="' + repo.owner.avatar_url + '" style="max-width: 100%" />' +
			'</div>' +
			'<div clas="col-sm-10">' +
			'<div class="clearfix">' +
			'<div class="col-sm-6">' + repo.full_name + '</div>' +
			'<div class="col-sm-3"><i class="fa fa-code-fork"></i> ' + repo.forks_count + '</div>' +
			'<div class="col-sm-2"><i class="fa fa-star"></i> ' + repo.stargazers_count + '</div>' +
			'</div>';

			if (repo.description) {
				markup += '<div>' + repo.description + '</div>';
			}

			markup += '</div></div>';

			return markup;
		},
		templateSelection: function (repo) {
			return repo.full_name || repo.text;
		}
	});
*/


$('#id_sources').select2({
		width:'100%',
		ajax: {
			url: this.model.get('sourceUrl'),
			dataType: 'json',
			delay: 250,
			data: function (params) {
				return {
					term: params.term, // search term
					page: params.page
				};
			},
			processResults: function (data, params) {

				// parse the results into the format expected by Select2.
					
				/*
				var data_array = [];

				for(var i=0;i<data.length;i++){
					var obj = {
						id: i,
						text: data[i]
					}
					data_array.push(obj);
				}*/

				// parse the results into the format expected by Select2
				// since we are using custom formatting functions we do not need to
				// alter the remote JSON data, except to indicate that infinite
				// scrolling can be used
				params.page = params.page || 1;

				return {
					//results: data_array,
					results: data.items,
					pagination: {
						more: (params.page * 30) < data.total_count
					}
				};
			},
			cache: true
		},
		escapeMarkup: function (markup) { return markup; },
		minimumInputLength: 1,
		templateResult: function (item) {

			console.log(item);

			if (item.loading) return item.text;

			return '<div>' + item.name + '</div>';
		},
		templateSelection: function (item) {
			console.log('item');
			console.log(item);
			return item.name;
		},
		language: {
			noResults: function() {
				return "No sources found. <a id='id_addNewSourceButton'>Add new source</a>.";
			}
		},
	});






		$('#id_tags').select2({
			width: "100%",
			tags: true,			
		});





		var sourceModel = new SourceModel();
		this.sources = new Sources(this.model.get('sources'));
		new SourcesView({collection: this.sources, parentView:this, model: sourceModel, parentModel: this.model});
	},

	initTagList: function(){
		var tagModel = new TagModel();
		this.tags = new Tags(this.model.get('tags'));
		new TagsView({collection: this.tags, parentView:this, model: tagModel, parentModel: this.model});
	}

});









/*



var $states = $(".js-source-states");
var statesOptions = $states.html();
$states.remove();

$(".js-states").append(statesOptions);

$("[data-fill-from]").each(function () {
	var $this = $(this);

	var codeContainer = $this.data("fill-from");
	var $container = $(codeContainer);

	var code = $.trim($container.html());

	$this.text(code);
	$this.addClass("prettyprint linenums");
});

prettyPrint();

$.fn.select2.amd.require(
		["select2/core", "select2/utils", "select2/compat/matcher"],
		function (Select2, Utils, oldMatcher) {
	var $basicSingle = $(".js-example-basic-single");
	var $basicMultiple = $(".js-example-basic-multiple");
	var $limitMultiple = $(".js-example-basic-multiple-limit");

	var $dataArray = $(".js-example-data-array");
	var $dataArraySelected = $(".js-example-data-array-selected");

	var data = [{ id: 0, text: 'enhancement' }, { id: 1, text: 'bug' }, { id: 2, text: 'duplicate' }, { id: 3, text: 'invalid' }, { id: 4, text: 'wontfix' }];

	var $ajax = $(".js-example-data-ajax");

	var $disabledResults = $(".js-example-disabled-results");

	var $tags = $(".js-example-tags");

	var $matcherStart = $('.js-example-matcher-start');

	var $diacritics = $(".js-example-diacritics");
	var $language = $(".js-example-language");

	$basicSingle.select2();
	$basicMultiple.select2();
	$limitMultiple.select2({
		maximumSelectionLength: 2
	});

	function formatState (state) {
		if (!state.id) {
			return state.text;
		}
		var $state = $(
			'<span>' +
				'<img src="vendor/images/flags/' +
					state.element.value.toLowerCase() +
				'.png" class="img-flag" /> ' +
				state.text +
			'</span>'
		);
		return $state;
	};

	$(".js-example-templating").select2({
		templateResult: formatState,
		templateSelection: formatState
	});

	$dataArray.select2({
		data: data
	});

	$dataArraySelected.select2({
		data: data
	});

	function formatRepo (repo) {
		if (repo.loading) return repo.text;

		var markup = '<div class="clearfix">' +
		'<div class="col-sm-1">' +
		'<img src="' + repo.owner.avatar_url + '" style="max-width: 100%" />' +
		'</div>' +
		'<div clas="col-sm-10">' +
		'<div class="clearfix">' +
		'<div class="col-sm-6">' + repo.full_name + '</div>' +
		'<div class="col-sm-3"><i class="fa fa-code-fork"></i> ' + repo.forks_count + '</div>' +
		'<div class="col-sm-2"><i class="fa fa-star"></i> ' + repo.stargazers_count + '</div>' +
		'</div>';

		if (repo.description) {
			markup += '<div>' + repo.description + '</div>';
		}

		markup += '</div></div>';

		return markup;
	}

	function formatRepoSelection (repo) {
		return repo.full_name || repo.text;
	}

	$ajax.select2({
		ajax: {
			url: "https://api.github.com/search/repositories",
			dataType: 'json',
			delay: 250,
			data: function (params) {
				return {
					q: params.term, // search term
					page: params.page
				};
			},
			processResults: function (data, params) {
				// parse the results into the format expected by Select2
				// since we are using custom formatting functions we do not need to
				// alter the remote JSON data, except to indicate that infinite
				// scrolling can be used
				params.page = params.page || 1;

				return {
					results: data.items,
					pagination: {
						more: (params.page * 30) < data.total_count
					}
				};
			},
			cache: true
		},
		escapeMarkup: function (markup) { return markup; },
		minimumInputLength: 1,
		templateResult: formatRepo,
		templateSelection: formatRepoSelection
	});

	$(".js-example-disabled").select2();
	$(".js-example-disabled-multi").select2();

	$(".js-example-responsive").select2();

	$disabledResults.select2();

	$(".js-example-programmatic").select2();
	$(".js-example-programmatic-multi").select2();

	$eventSelect.select2();

	$tags.select2({
		tags: ['red', 'blue', 'green']
	});

	$(".js-example-tokenizer").select2({
		tags: true,
		tokenSeparators: [',', ' ']
	});

	function matchStart (term, text) {
		if (text.toUpperCase().indexOf(term.toUpperCase()) == 0) {
			return true;
		}

		return false;
	}

	$matcherStart.select2({
		matcher: oldMatcher(matchStart)
	});

	$(".js-example-basic-hide-search").select2({
		minimumResultsForSearch: Infinity
	});

	$diacritics.select2();

	$language.select2({
		language: "es"
	});

	$(".js-example-theme-single").select2({
		theme: "classic"
	});

	$(".js-example-theme-multiple").select2({
		theme: "classic"
	});

	$(".js-example-rtl").select2();
});

*/
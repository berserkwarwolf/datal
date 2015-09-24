var SelectedCellRangeView = Backbone.View.extend({
	skipFocusFlag: 0,

	events: {
		'focusin input[@type="text"]': 'onFocusInput',
		'focusout input[@type="text"]': 'onFocusOutInput',
		'keyup input[@type="text"]': 'onKeyupInput'
	},

	initialize: function (options) {
		this.rangeDataModel = options.rangeDataModel;
        this.rangeLabelsModel = options.rangeLabelsModel;
        this.rangeHeadersModel = options.rangeHeadersModel;

        // check because same instance being used in map modal
        if (this.rangeDataModel) {
        	this.listenTo(this.rangeDataModel, 'change:excelRange', this.onChangeData);
        	this.listenTo(this.rangeLabelsModel, 'change:excelRange', this.onChangeLabels);
        	this.listenTo(this.rangeHeadersModel, 'change:excelRange', this.onChangeHeaders);
        };
	},

	clear: function () {
		this.$('input[type="text"]').val('');
	},

	focusNext: function () {
		if (this.skipFocusFlag >= 2) return;
		if (this.selectedInput.attr('name') === 'range_data') {
			this.$('input[name="range_labels"]').focus();
		} else if (this.selectedInput.attr('name') === 'range_labels') {
			this.$('input[name="range_headers"]').focus();
		}
		this.skipFocusFlag += 1;
	},

	focus: function  () {
		this.$('input[type="text"]').first().focus();
	},

	onFocusInput: function (event) {
		var $target = $(event.currentTarget),
			name = $target.attr('name');
		this.$('input[type="text"]').removeClass('active');
		$target.addClass('active');
		this.selectedInput = $target;
		this.trigger('focus-input', name);
	},

	onFocusOutInput: function (event) {
		var $target = $(event.currentTarget),
			name = $target.attr('name');
		this.trigger('focusout', name);
	},

	onKeyupInput: function (event) {
		var $target = $(event.currentTarget),
			name = $target.attr('name');
			value = $target.val();
		if (name === 'range_data') {
			this.rangeDataModel.set('excelRange', value, {validate: true});
		} else if (name === 'range_labels'){
			this.rangeLabelsModel.set('excelRange', value, {validate: true});
		} else if (name === 'range_headers'){
			this.rangeHeadersModel.set('excelRange', value, {validate: true});
		}
		this.showValidations();
	},

	onChangeData: function (model, value) {
		this.$('input[name="range_data"]').val(value);
		this.showValidations();
	},

	onChangeLabels: function (model, value) {
		this.$('input[name="range_labels"]').val(value);
		this.showValidations();
	},

	onChangeHeaders: function (model, value) {
		this.$('input[name="range_headers"]').val(value);
		this.showValidations();
	},

	showValidations: function () {
		this.$('input[name="range_data"]').toggleClass('has-error', !!this.rangeDataModel.validationError);
		this.$('input[name="range_labels"]').toggleClass('has-error', !!this.rangeLabelsModel.validationError);
		this.$('input[name="range_headers"]').toggleClass('has-error', !!this.rangeHeadersModel.validationError);	
	}
})
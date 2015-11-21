var OptionsView = Backbone.View.extend({

    events: {
        'change input[type=radio]': 'onRadioChanged',
        'keyup input#nullValuePreset':  'onInputChanged',
        'change input[type=checkbox]':  'onCheckboxChanged',
    },

    initialize: function () {
        var nullValueAction = this.model.get('nullValueAction');

        this.$('input:radio[value=' + nullValueAction + ']').prop('checked', true);

        this.render();
    },

    render: function () {
        var nullValueAction = this.model.get('nullValueAction');
        if (nullValueAction === 'given') {
            this.$('#nullValuePreset').show().val(this.model.get('nullValuePreset'));
        } else {
            this.$('#nullValuePreset').hide();
        }
    },

    onRadioChanged: function(e){
        var input = $(e.currentTarget),
            value = input.val();

        this.model.set('nullValueAction', value);

        if (value === 'given') {
            this.$('#nullValuePreset').show();
        } else {
            this.model.unset('nullValuePreset');
            this.$('#nullValuePreset').hide()
                .siblings('p.validation-invalid-value').addClass('hidden');
        }
    },

    onCheckboxChanged: function(e){
        var input = $(e.target);
        this.model.set(input.attr('name'), input.prop('checked') );
    },

    onInputChanged: function(e){
        var input = $(e.currentTarget),
            value = input.val();

        var valid = this.model.set(input.data('ref'), input.val(), {validate: true});

        if (this.model.validationError === 'invalid-value') {
            input.siblings('p.validation-invalid-value').removeClass('hidden');
        } else {
            input.siblings('p.validation-invalid-value').addClass('hidden');
        }
        input.toggleClass('has-error', !valid);
    },

    show: function () {
        this.$el.removeClass('hidden');
    },

    hide: function () {
        this.$el.addClass('hidden');
    }
});

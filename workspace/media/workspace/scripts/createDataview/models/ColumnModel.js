var ColumnModel = Backbone.Model.extend({
    idAttribute: "column",

    defaults: {
        column: undefined,
        type: 'TEXT',

        inputPattern: undefined,
        inputCustomPattern: undefined,

        separatorType: 'symbol',
        thousandSeparator: undefined,
        decimalSeparator: undefined,
        inputLocale: undefined,

        outputPattern: undefined,
        outputCustomPattern: undefined,
        inputCustomPattern: undefined,
        numberDisplayLocale: undefined,
        dateDisplayLocale: undefined,
    },

    validation: {
        column: [
            {
                required: true,
                msg: gettext('VALIDATE-REQUIREDFIELD-TEXT')
            }
        ],
        inputPattern: [
            {
                required: true,
                msg: gettext('VALIDATE-REQUIREDFIELD-TEXT')
            }
        ],

        outputPattern: [
            {
                required: true,
                msg: gettext('VALIDATE-REQUIREDFIELD-TEXT')
            }
        ],

        inputCustomPattern: function(value, attr) {
            if (this.get('inputPattern') === 'custom') {
                if(_.isUndefined(value) || value === '') {
                    return gettext('VALIDATE-REQUIREDFIELD-TEXT');
                }
            } 
        },

        outputCustomPattern: function(value, attr) {
            if (this.get('outputPattern') === 'custom') {
                if(_.isUndefined(value) || value === '') {
                    return gettext('VALIDATE-REQUIREDFIELD-TEXT');
                }
            } 
        },

        thousandSeparator: function(value, attr) {
            if (this.get('separatorType') === 'symbol') {
                if(_.isUndefined(value) || value === '') {
                    return gettext('VALIDATE-REQUIREDFIELD-TEXT');
                }
            } 
        },

        decimalSeparator: function(value, attr) {
            if (this.get('separatorType') === 'symbol') {
                if(_.isUndefined(value) || value === '') {
                    return gettext('VALIDATE-REQUIREDFIELD-TEXT');
                }
            } 
        },

        inputLocale: function(value, attr) {
            if (this.get('separatorType') === 'locale') {
                if(_.isUndefined(value) || value === '') {
                    return gettext('VALIDATE-REQUIREDFIELD-TEXT');
                }
            } 
        },

        numberDisplayLocale: function(value, attr) {
            if (this.get('type') === 'NUMBER') {
                if(_.isUndefined(value) || value === '') {
                    return gettext('VALIDATE-REQUIREDFIELD-TEXT');
                }
            } 
        },

        dateDisplayLocale: function(value, attr) {
            if (this.get('type') === 'DATE') {
                if(_.isUndefined(value) || value === '') {
                    return gettext('VALIDATE-REQUIREDFIELD-TEXT');
                }
            } 
        }
    },

});
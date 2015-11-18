var DataviewModel = Backbone.Model.extend({
    idAttribute: 'dataview_revision_id',
    
    defaults:{
        title: null,
        description: null,
        category: undefined,
        sources: [],
        tags: [],
        notes: null,
    },

    url: function () {
        return ['/rest/dataview/',
            this.get('dataview_revision_id'),
            '/tables.json?&limit=100&_=1447703003254'].join('');
    },

    validation: {
        title: [
            {
                required: true,
                msg: gettext('VALIDATE-REQUIREDFIELD-TEXT')
            },{
                maxLength: 80,
                msg: gettext('VALIDATE-MAXLENGTH-TEXT-1') + ' 80 ' + gettext('VALIDATE-MAXLENGTH-TEXT-2')
            }
        ],
        description: [
            {
                required: true,
                msg: gettext('VALIDATE-REQUIREDFIELD-TEXT')
            },{
                maxLength: 140,
                msg: gettext('VALIDATE-MAXLENGTH-TEXT-1') + ' 140 ' + gettext('VALIDATE-MAXLENGTH-TEXT-2')
            },{
                fn: function(value, attr, computedState){
                    if( $.trim(computedState.title) === $.trim(value) ) {
                        return gettext('APP-TITSUBDES-NOTEQUALS');
                    }
                }
            }
        ],
    },

    save: function () {
        console.log(this.toJSON());
        return $.ajax({
                type: "POST",
                url: 'http://httpbin.org/post',
                data: this.toJSON(),
                dataType: 'json'
            });
    }

})
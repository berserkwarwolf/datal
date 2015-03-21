var DatastreamEditItemModel = Backbone.Epoxy.Model.extend({
    urlRoot:'/dataviews/edit',

    defaults: function() {
        return {
            title: "",
            description:"",
            category:"",
            status:"",
            datastream_revision_id: "",
            allCategories:{},
            allStatus:{},
            sources:[],
            tags:[],
            notes:""
        };
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
        category: {
            required: true,
            msg: gettext('VALIDATE-REQUIREDFIELD-TEXT')
        },
        status: {
            required: false,
            msg: gettext('VALIDATE-REQUIREDFIELD-TEXT')
        }
    }

});

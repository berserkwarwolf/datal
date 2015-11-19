var DataviewModel = Backbone.Model.extend({
    idAttribute: 'dataview_revision_id',
    
    defaults:{
        title: undefined,
        description: undefined,
        category: undefined,
        sources: [],
        tags: [],
        notes: undefined,

        // TODO: remove this hardcoded params and use the model's data
        end_point: 'file://1/7461/5029f04a-9afd-494f-83c5-30f78e0d9e73',
        impl_type: 10,
        impl_details: '',
        datasource: '<dataSource><DataStructure><Field id="table0"><type></type><format><languaje></languaje><country></country><style></style></format><Table><Field id="column0"><alias></alias><type></type><format><languaje></languaje><country></country><style></style></format></Field><Field id="column1"><alias></alias><type></type><format><languaje></languaje><country></country><style></style></format></Field><Field id="column2"><alias></alias><type></type><format><languaje></languaje><country></country><style></style></format></Field></Table></Field></DataStructure></dataSource>',
        select_statement: '<selectStatement><Select><Column>*</Column></Select><From><Table>table0</Table></From><Where/></selectStatement>',
        rdf_template: '',
        bucket_name: 'datal',
        user_id: 1647,
        limit: 50
    },

    initialize: function () {
        this.data = new Backbone.Model();
    },

    url: '/rest/datastreams/sample.json',

    fetch: function (options) {
        var self = this,
            params = this.pick([
                'end_point',
                'impl_type',
                'impl_details',
                'datasource',
                'select_statement',
                'rdf_template',
                'bucket_name',
                'user_id',
                'limit',
            ]);

        return $.ajax({
                type: "POST",
                url: this.url,
                data: params,
                dataType: 'json'
            }).then(function (response) {
                self.parse(response);
                return response;
            });
    },

    parse: function (response) {

        var columns = _.first(response.fArray, response.fCols);

        var rows = _.map(_.range(0, response.fRows), function (i) {
          var row = response.fArray.slice(i*response.fCols, (i+1)*response.fCols);
          return _.pluck(row, 'fStr');
        });

        this.data.set('columns', columns);
        this.data.set('rows', rows);
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
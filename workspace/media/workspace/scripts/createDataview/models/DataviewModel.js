var DataviewModel = Backbone.Model.extend({

    template: _.template("<selectStatement><Select><% _.each(columns, function (number) { %><Column>column<%= number %></Column><% }); %></Select><From><Table>table<%= tableId %></Table></From><Where><% _.each(rows, function (number) { %><Filter><Operand1>rownum</Operand1><LogicalOperator>00</LogicalOperator><Operand2><%= number %></Operand2></Filter><% }); %></Where></selectStatement>"),

    idAttribute: 'dataview_revision_id',

    defaults:{
        title: undefined,
        description: undefined,
        category: 41,
        notes: '',

        'tags-TOTAL_FORMS': 0,
        'tags-INITIAL_FORMS': 0,
        'parameters-TOTAL_FORMS': 0,
        'parameters-INITIAL_FORMS': 0,
        'sources-TOTAL_FORMS': 0,
        'sources-INITIAL_FORMS': 0,

        dataset_revision_id: undefined,
        csrfmiddlewaretoken: '24c4CtkSSEasa0R1l7QnP9DXLDQi7J6C',

        tableId: 0,
        status: 0,

        // TODO: remove this hardcoded params and use the model's data
        end_point: 'file://1/7461/7f70200b-71dc-42bd-b0d3-e424bd5849a0',
        impl_type: 10,
        impl_details: '',
        data_source: '<dataSource><DataStructure><Field id="table0"><type></type><format><languaje></languaje><country></country><style></style></format><Table><Field id="column0"><alias></alias><type></type><format><languaje></languaje><country></country><style></style></format></Field><Field id="column1"><alias></alias><type></type><format><languaje></languaje><country></country><style></style></format></Field><Field id="column2"><alias></alias><type></type><format><languaje></languaje><country></country><style></style></format></Field></Table></Field></DataStructure></dataSource>',
        rdf_template: '',
        bucket_name: '',
        user_id: 1647,
        limit: 50
    },

    initialize: function () {
        this.data = new Backbone.Model();
        this.tags = new Backbone.Collection();
        this.parameters = new Backbone.Collection();
        this.sources = new Backbone.Collection();
        this.selection = new DataTableSelectedCollection();
    },

    url: '/rest/datastreams/sample.json',

    fetch: function (options) {
        var self = this,
            params = this.pick([
                'end_point',
                'impl_type',
                'impl_details',
                'rdf_template',
                'bucket_name',
                'user_id',
                'limit',
            ]);

        params.datasource = this.get('data_source');
        params.select_statement = this.getSelectStatement();

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
        var self = this,
            params = this.pick([
                'dataset_revision_id',

                'data_source',
                'rdf_template',

                'title',
                'description',
                'category',
                'notes',
                'status',

                'tags-TOTAL_FORMS',
                'tags-INITIAL_FORMS',
                'parameters-TOTAL_FORMS',
                'parameters-INITIAL_FORMS',
                'sources-TOTAL_FORMS',
                'sources-INITIAL_FORMS',
            ]);

        params.select_statement = this.getSelectStatement();

        return $.ajax({
                type: 'POST',
                url: '/dataviews/create',
                data: params,
                dataType: 'json'
            });
    },

    getSelectStatement: function () {
        var tableId = this.get('tableId'),
            // columns = this.selection.filter(function (model) {
            //     return model.get('mode') === 'col';
            // }),
            columns = [0,2],
            rows = [0,1,2];

        return this.template({
            tableId: tableId,
            columns: columns,
            rows: rows
        });
    },


})
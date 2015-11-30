var select_statement_template = ['<selectStatement>',
    '<Select>',
    '<% _.each(columns, function (number) { %>',
        '<Column>column<%= number %></Column>',
    '<% }); %>',
    '</Select>',
    '<From>',
        '<Table>table<%= tableId %></Table>',
    '</From>',
    '<Where>',
        '<% _.each(rows, function (number) { %>',
        '<Filter>',
            '<Operand1>rownum</Operand1>',
            '<LogicalOperator>00</LogicalOperator>',
            '<Operand2><%= number %></Operand2>',
        '</Filter>',
        '<% }); %>',
        '<% _.each(filters, function (filter, index) { %>',
        '<Filter>',
            '<Operand1>column<%= filter.column %></Operand1>',
            '<LogicalOperator><%= filter.operator %></LogicalOperator>',
            '<% if (filter.value) {%>',
                '<Operand2><%= filter.value %></Operand2>',
            '<% } else {%>',
                '<Operand2>parameter<%= index %></Operand2>',
            '<% } %>',
        '</Filter>',
        '<% }); %>',
    '</Where>',
'</selectStatement>',
].join('');

var data_source_template = ['<dataSource>',
    '<DataStructure>',
        '<Field id="table<%= tableId %>">',
            '<Headers>',
                '<% _.each(headers, function (row) { %>',
                    '<Row>row<%= row %></Row>',
                '<% }); %>',
            '</Headers>',
            '<type/>',
            '<format>',
                '<languaje/>',
                '<country/>',
                '<style/>',
            '</format>',
            '<Table>',
                '<% _.each(columns, function (number) { %>',
                '<Field id="column<%= number %>">',
                    '<alias/>',
                    '<type/>',
                    '<format>',
                        '<languaje/>',
                        '<country/>',
                        '<style/>',
                    '</format>',
                '</Field>',
                '<% }); %>',
            '</Table>',
        '</Field>',
    '</DataStructure>',
'</dataSource>'].join('');

var DataviewModel = Backbone.Model.extend({

    select_statement_template: _.template(select_statement_template),
    data_source_template: _.template(data_source_template),

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

        tableId: 0,
        status: 0,

        // TODO: remove this hardcoded params and use the model's data
        end_point: 'file://1/7461/08c6faa4-689f-489b-a31c-94753ea52486',
        impl_type: 4,
        impl_details: '',
        rdf_template: '',
        bucket_name: '',
        user_id: 1647,
        limit: 50
    },

    initialize: function () {
        this.data = new Backbone.Model();
        this.selection = new DataTableSelectedCollection();

        this.filters = new FiltersCollection();

        this.tags = new Backbone.Collection();
        this.sources = new Backbone.Collection();
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

        // NOTE: here the datasource param does not contain an underscore, like it does in save
        params.datasource = this.getDataSource();
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
        params.data_source = this.getDataSource();

        return $.ajax({
                type: 'POST',
                url: '/dataviews/create',
                data: params,
                dataType: 'json'
            });
    },

    getSelectStatement: function () {
        var tableId = this.get('tableId'),
            columnModels = this.selection.getItemsByMode('col'),
            columns = _.map(columnModels, function (model) {
                return model.getRange().from.col;
            }),
            rowModels = this.selection.getItemsByMode('row'),
            rows = _.map(rowModels, function (model) {
                return model.getRange().from.row;
            });


        return this.select_statement_template({
            tableId: tableId,
            columns: columns,
            rows: rows,
            filters: this.filters.toJSON()
        });
    },

    getDataSource: function () {
        var tableId = this.get('tableId'),
            columns = _.range(0, this.get('totalCols')),
            headerModels = this.selection.getItemsByMode('header'),
            headers = _.map(headerModels, function (model) {
                return model.getRange().from.row;
            });

        return this.data_source_template({
            tableId: tableId,
            headers: headers,
            columns: columns
        });
    },


})
var select_statement_template = ['<selectStatement>',
    '<Select>',
        '<% if (isFullTable) { %>',
            '<Column>*</Column>',
        '<% } else { %>',
            '<% _.each(columns, function (number) { %>',
                '<Column>column<%= number %></Column>',
            '<% }); %>',
        '<% } %>',
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
            '<% if (filter.type === \'fixed\') {%>',
                '<Operand2><%= filter.default %></Operand2>',
            '<% } else {%>',
                '<Operand2>parameter<%= filter.position %></Operand2>',
            '<% } %>',
        '</Filter>',
        '<% }); %>',
    '</Where>',
'</selectStatement>',
].join('');

var data_source_template = ['<dataSource>',
    '<% if (args.length > 0) {%>',
    '<EndPointMappings>',
        '<% _.each(args, function (arg) { %>',
            '<Mapping>',
                '<key><%= arg.mappedName%></key>',
                '<value>parameter<%= arg.position%></value>',
            '</Mapping>',
        '<% }); %>',
    '</EndPointMappings>',
    '<% } %>',
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
                '<% _.each(columns, function (column) { %>',
                '<Field id="column<%= column.column %>">',
                    '<alias/>',
                    '<type><%= column.type %></type>',
                    '<format>',
                        '<Symbols>',
                            '<decimals><%= column.thousandSeparator %></decimals>',
                            '<thousands><%= column.decimalSeparator %></thousands>',
                        '</Symbols>',
                        '<languaje><%= column.inputLocale %></languaje>',
                        '<country></country>',
                        '<style/>',
                        '<pattern><%= column.inputPattern %></pattern>',
                    '</format>',
                    '<DisplayFormat>',
                        '<pattern><%= column.outputPattern %></pattern>',
                        '<locale><%= column.numberDisplayLocale %></locale>',
                    '</DisplayFormat>',
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

        dataset_revision_id: undefined,

        tableId: 0,
        status: 0,

        // TODO: remove this hardcoded params and use the model's data
        rdf_template: '',
        bucket_name: '',
        user_id: 1647,
        limit: 50
    },

    initialize: function () {
        this.data = new Backbone.Model();
        this.selection = new DataTableSelectedCollection();

        this.filters = new FiltersCollection();
        this.formats = new ColumnsCollection();
    },

    url: '/rest/datastreams/sample.json',

    attachDataset: function (attributes) {
        this.dataset = new DatasetModel(attributes);
        this.on('change:tableId', this.onChangeTableId, this);

        // Trigger initially to get the default table rows and cols
        this.listenTo(this.dataset, 'change:tables', function () {
            this.onChangeTableId(this.dataset, 0);
        }, this);

        // Dataview sources and Tags are initially cloned from those in the dataset.
        this.sources = this.dataset.sources.clone();
        this.tags = this.dataset.tags.clone();
    },

    fetch: function (options) {
        var self = this,
            params = this.dataset.pick([
                'end_point',
                'impl_type',
                'impl_details',
                'rdf_template',
                'bucket_name',
                'limit',
            ]);

        var filters = this.filters.toSampleFilters();
        _.extend(params, filters);

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
                'rdf_template',

                'title',
                'description',
                'category',
                'notes',
                'status',
            ]);

        var filterParameters = this.filters.toFormSet();
        
        var datasetArguments = this.dataset.getArgsAsParams(filterParameters.length);
        dataviewParameters = filterParameters.concat(datasetArguments);

        var parametersParams = this.toFormSet(dataviewParameters, 'parameters');

        var tags = this.tags.map(function (model) {
            return {name: model.get('tag__name')};
        });

        var sources = this.sources.map(function (model) {
            return {
                name: model.get('source__name'),
                url: model.get('source__url')
            };
        });

        var tagsParams = this.toFormSet(tags, 'tags');
        var sourcesParams = this.toFormSet(sources, 'sources');

        _.extend(params, parametersParams);
        _.extend(params, tagsParams);
        _.extend(params, sourcesParams);

        params.dataset_revision_id = this.dataset.get('dataset_revision_id');
        params.select_statement = this.getSelectStatement();
        params.data_source = this.getDataSource();

        return $.ajax({
                type: 'POST',
                url: '/dataviews/create',
                data: params,
                dataType: 'json'
            });
    },

    onChangeTableId: function (model, value) {
        var rows = this.dataset.get('tables')[value];
        this.set('totalCols', rows[0].length);
        this.set('totalRows', rows.length);
    },

    toFormSet: function (list, prefix) {
        var result = {},
            total = list.length;

        _.each(list, function (item, index) {
            _.each(item, function (value, key) {
                result[prefix + '-' + index + '-' + key] = value;
            });
        });
        result[prefix + '-TOTAL_FORMS'] = total;
        result[prefix + '-INITIAL_FORMS'] = 0;
        return result;
    },

    getSelectStatement: function () {
        var tableId = this.get('tableId'),
            isFullTable = this.selection.hasItemsByMode('table'),
            columnModels = this.selection.getItemsByMode('col'),
            columns = _.map(columnModels, function (model) {
                return model.getRange().from.col;
            }),
            rowModels = this.selection.getItemsByMode('row'),
            rows = _.map(rowModels, function (model) {
                return model.getRange().from.row;
            });

        return this.select_statement_template({
            isFullTable: isFullTable,
            tableId: tableId,
            columns: columns,
            rows: rows,
            filters: this.filters.toJSON()
        });
    },

    getColumns: function () {
        var self = this;
        var formats = this.formats.clone();
        var availableColumns = _.range(0, this.get('totalCols'));

        _(availableColumns).each(function (columnId) {
            if (_.isUndefined(formats.get(columnId))) {
                formats.add({column: String(columnId)});
            }
        });
        return formats.toJSON();
    },

    getDataSource: function () {
        var tableId = this.get('tableId'),
            filterCount = this.filters.length,
            columns = this.getColumns(),
            headerModels = this.selection.getItemsByMode('header'),
            headers = _.map(headerModels, function (model) {
                return model.getRange().from.row;
            }),
            argsList = this.dataset.args.toJSON(),
            args;

        args = _.filter(argsList, function (arg) {
            return arg.editable;
        }).map(function (arg, index) {
            arg.position = filterCount + index;
            return arg;
        });

        return this.data_source_template({
            args: args,
            tableId: tableId,
            headers: headers,
            columns: columns
        });
    }
})
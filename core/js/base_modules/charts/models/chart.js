var charts = charts || {
    models: {},
    views: {}
};

charts.models.Chart = Backbone.Model.extend({
    urlRoot: '/api/charts/',
    defaults: {
        lib: 'google',

        showLegend: true,
        invertData: undefined,
        invertedAxis: undefined,
        chartTemplate: undefined,
        nullValueAction: 'exclude',
        nullValuePreset: undefined,

        //flag que indica si alguna vez abrió el modal de datos, es para validación
        select_data: false,

        //validation
        message: '',

        //metadata
        title: undefined,
        description: undefined,
        notes: undefined,
        datastream_category: undefined,
        datastream_sources: undefined,
        datastream_tags: undefined,

        //data selection
        range_headers: undefined,
        range_data: undefined,
        range_labels: undefined,

        // Map defaults
        joinIntersectedClusters: false,
        heatMap: undefined,
        onHeatMap: false,
        needToReloadData: false, //special case where I zoom on a heatMap
        mapType : 'ROADMAP',
        styles: {},
        options: {
            zoom: 2,
            center: {
                lat: 0,
                long: 0
            },
            bounds: [85,180,-85,-180]
        }

    },
    initialize: function (options) {
        //Se inicializa acá para prevenir error en embed
        if(window.gettext){
            this.set('message',gettext("APP-CUSTOMIZE-VISUALIZATION-SELECT-DATA-TEXT"));
        }

        this.data = new charts.models.ChartData({
            id: this.get('id'),
            type: this.get('type')
        });

        this.bindEvents();
    },

    bindEvents: function () {
        //Se actualizan los filtros de los datos cuando se cambian las options
        this.on('change', this.bindDataModel, this);
        this.listenTo(this.data, 'data_updated', this.handleDataUpdate);
    },

    parse: function (res) {
        var data = {
            datastream_revision_id: res.datastream_revision_id,
            datastream_tags:  res.datastream_tags,
            datastream_sources: res.datastream_sources,
            datastream_category: res.datastream_category
        };

        _.extend(data, _.pick(res, [
            'revision_id',
            'lib',
            'type',
            'chartTemplate',
            'nullValueAction',
            'nullValuePreset'
            ]));

        //edit
        if(res.revision_id){
            data = _.extend(data,{
                select_data:true,
                notes: _.unescape(res.notes),
                title: res.title,
                description: res.description,

                //config
                showLegend: res.showLegend,

                invertData: (res.invertData=='checked'),
                invertedAxis: (res.invertedAxis=='checked'),

                //data
                range_data: this.parseColumnFormat(res.data),
                range_headers: this.parseColumnFormat(res.chart.headerSelection),
                range_labels: this.parseColumnFormat(res.chart.labelSelection),

                range_lat: this.parseColumnFormat(res.chart.latitudSelection),
                range_lon: this.parseColumnFormat(res.chart.longitudSelection)

            });
            if (res.type === 'mapchart') {
                data = _.extend(data,{
                    range_lat: this.parseColumnFormat(res.chart.latitudSelection),
                    range_lon: this.parseColumnFormat(res.chart.longitudSelection),
                    range_trace: this.parseColumnFormat(res.chart.traceSelection),
                    mapType: res.chart.mapType? res.chart.mapType.toUpperCase(): undefined,
                    geoType: res.chart.geoType,
                    options:{
                        zoom: res.chart.zoom,
                        bounds: res.chart.bounds? res.chart.bounds.split(';'): undefined,
                        center: {lat: 0, long: 0}
                    }
                });
            };
        }
        this.set(data);
    },

    bindDataModel: function () {
        var self = this,
            filters = {};

        if (this.get('type') === 'mapchart' || this.get('type') === 'trace') {
            filters = this.getMapPreviewFilters();
        } else {
            filters = this.getChartPreviewFilters();
        }

        this.data.set('filters', filters);
    },

    getChartPreviewFilters: function () {

        if(!this.isValid()){
            console.error('error en valid');
        }

        var filters = {
            revision_id: this.get('datastream_revision_id'),
            data: this.serializeServerExcelRange(this.get('range_data')),
            headers: this.serializeServerExcelRange(this.get('range_headers')),
            labels: this.serializeServerExcelRange(this.get('range_labels')),
            nullValueAction: this.get('nullValueAction'),
            nullValuePreset:  this.get('nullValuePreset') || '',
            type: this.get('type')
        };

        if(this.get('invertData')===true){
            filters['invertData'] = true;
        }

        if(this.get('invertedAxis')===true){
            filters['invertedAxis'] = true;
        }
        return filters;
    },

    getMapPreviewFilters: function () {
        var id = this.get('id');

        var filters = {
                revision_id: id,
                zoom: this.get('options').zoom,
                bounds: (this.get('options').bounds)? this.get('options').bounds.join(';'): undefined,
                type: 'mapchart'
        };

        if(_.isUndefined(id)){
            filters = _.extend(filters,{
                revision_id: this.get('datastream_revision_id'),
                nullValueAction: this.get('nullValueAction'),
                data: this.serializeServerExcelRange(this.get('range_data')),
                lat: this.serializeServerExcelRange(this.get('range_lat')),
                lon: this.serializeServerExcelRange(this.get('range_lon')),
                traces: this.serializeServerExcelRange(this.get('range_trace'))
            });
        }

        if (this.has('nullValuePreset')) {
            filters.nullValuePreset = this.get('nullValuePreset');
        }
        return filters;
    },

    /**
     * Handler para manejar las actualizaciones a los datos
     * @return {[type]} [description]
     */
    handleDataUpdate: function () {
        this.trigger('data_updated');
    },

    /**
     * Fetch data for the chart
     * @return {promise}
     */
    fetchData: function () {
        return this.data.fetch();
    },

    serializeServerExcelRange: function(selection){
        if (_.isUndefined(selection)) return '';
        var range = selection.split(":");
        var left = range[0];
        var right = range[1];

        // Columna completa o celda
        if(left == right){
            var index = left.search(/\d/g);

            // Columna completa
            if(index == -1){
                selection = 'Column:' + left;
            }
        }
        else{
            // TO-DO: Validar que no sea un rango de columnas completas
        }

        return selection;
    },

    parseColumnFormat: function (serverExcelRange) {
        var col;
        if (_.isUndefined(serverExcelRange)) {
            return serverExcelRange;
        };
        if (serverExcelRange.indexOf('Column:') !== -1) {
            col = serverExcelRange.replace('Column:', '');
            serverExcelRange = [col, ':', col].join('');
        }
        return serverExcelRange;
    },

    valid: function(){
        console.log('Validation from charts.models.Chart');
        var valid = true;

        //Si alguna vez intentó seleccionar algo de data
        if(this.get('select_data')){

            if (this.get('type') === 'mapchart') {

                // example validation
                // valid = (this.data.get('clusters').length >0);
                valid = true;
                console.log('valid',valid);

            } else {

                //General validation
                var lFields = this.data.get('fields').length;

                var check = _.reduce(this.data.get('rows'), 
                    function(memo, ar){
                     return (ar.length==lFields)?memo:memo + 1; 
                    }, 0);

                if (check!=0){
                    this.set("message",gettext("APP-CUSTOMIZE-VISUALIZATION-VALIDATE-HEADLINES")); //reemplazar por locale
                    valid = false;
                }

                if(valid){
                    //TODO specific validation for chart type
                    switch(this.get('type')){
                        case 'piechart':
                            console.log('is pie chart');
                            //validar que no haya números negativos en la primer serie que se usa para el pie
                        break;
                    }
                }

            }



        }

        return valid;
    },

    validateMetadata: function(){
        var validation = {
            valid: (  !_.isEmpty(this.get('title')) &&  !_.isEmpty(this.get('description'))  ),
            fields:{
                'title':  _.isEmpty(this.get('title')),
                'description':  _.isEmpty(this.get('description'))
            }
        }
        return validation
    },

    getSettings: function(){
        var settings = {
            title: this.get('title'),
            description: this.get('description'),
            notes: this.get('notes'),

            type: this.get('type'),
            lib: this.get('lib'),
            showLegend: this.get('showLegend'),
            chartTemplate: 'basicchart', // Muchachos, mando una para probar pero no se el criterio y es viernes por la noche. Las opciones son basicchart, piechart, mapchart, geochart
            nullValueAction: this.get('nullValueAction'),
            nullValuePreset: this.get('nullValuePreset'),
            invertData: this.get('invertData'),
            invertedAxis: this.get('invertedAxis'),

            //data selection
            headerSelection: this.serializeServerExcelRange(this.get('range_headers')),
            data: this.serializeServerExcelRange(this.get('range_data')),
            labelSelection: this.serializeServerExcelRange(this.get('range_labels'))

        };

        if (this.get('type') === 'mapchart') {
            settings = _.extend( settings, {
                latitudSelection: this.serializeServerExcelRange(this.get('range_lat')),
                longitudSelection: this.serializeServerExcelRange(this.get('range_lon')),
                traceSelection: this.serializeServerExcelRange(this.get('range_trace')),
                mapType: this.get('mapType').toLowerCase(),
                geoType: this.get('geoType'),
                zoom: this.get('options').zoom,
                bounds: this.get('options').bounds.join(';')
            });
        };

        settings = _.extend( settings,this.getChartAttributes() );

        return settings;
    },

    getChartAttributes: function(){
        var attr = {};
        var that = this;
        _.each(this.get('attributes'),function(e){
            attr[e] = that.get(e);
        });
        return attr;
    },

    validate: function (attrs, options) {
        var nullValuePreset = attrs.nullValuePreset;

        if (!_.isUndefined(attrs.nullValueAction) && attrs.nullValueAction === 'given') {

            if (!_.isUndefined(nullValuePreset) && isNaN(nullValuePreset)) {
                return 'Invalid value';
            }

        }
    },

    save: function (attrs, options) {
        var data = this.getSettings();

        return $.ajax({
            type:'POST',
            data: data,
            dataType: 'json'
        }).then(function (response) {
            if(response.status=='ok'){
                console.log(response);
                return response;
            } else {
                console.error(response);
            }
        });
    },

    remove: function (options) {
        var opts = _.extend({url: 'remove/' + this.id}, options || {});

        return Backbone.Model.prototype.destroy.call(this, opts);
    },

    remove_revision: function (options) {
        var opts = _.extend({url: 'remove/revision/' + this.id}, options || {});

        return Backbone.Model.prototype.destroy.call(this, opts);
    }
});

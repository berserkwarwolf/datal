var charts = charts || {
    models: {},
    views: {}
};

charts.models.Chart = Backbone.Model.extend({
    urlRoot: '/api/charts/',
    defaults: {
        type: 'linechart',
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
        meta_title: undefined,
        meta_description: undefined,
        meta_notes: undefined,
        meta_category: undefined,
        meta_sources: undefined,
        meta_tags: undefined,

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
        mapOptions: {
            zoom: 5,
            center: {
                lat: 0,
                long: 0
            },
            bounds: []
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
        this.on('change:mapOptions', this.updateFetchFilters);
        this.on('change:type', this.onChangeType);
        this.listenTo(this.data, 'data_updated', this.handleDataUpdate);
    },

    parse: function (res) {
        var data = {
            datastream_revision_id: res.datastream_revision_id,
            meta_tags:  res.datastream_tags,
            meta_sources: res.datastream_sources,
            meta_category: res.datastream_category
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
                meta_notes: _.unescape(res.notes),
                meta_title: res.title,
                meta_description: res.description,

                //config
                showLegend: true,

                invertData: (res.invertData=='checked'),
                invertedAxis: (res.invertedAxis=='checked'),

                //data
                range_data: this.parseColumnFormat(res.data),
                range_headers: this.parseColumnFormat(res.headerSelection),
                range_labels: this.parseColumnFormat(res.labelSelection),

                range_lat: this.parseColumnFormat(res.latitudSelection),
                range_lon: this.parseColumnFormat(res.longitudSelection)

            });
            if (res.type === 'mapchart') {
                data = _.extend(data,{
                    range_lat: this.parseColumnFormat(res.latitudSelection),
                    range_lon: this.parseColumnFormat(res.longitudSelection),
                    mapType: res.mapType? res.mapType.toUpperCase(): undefined,
                    mapOptions:{
                        zoom: res.zoom,
                        bounds: res.bounds? res.bounds.split(';'): undefined,
                        center: {lat: 0, long: 0}
                    }
                });
            };
        }
        this.set(data);
    },

    fetchPreviewData: function () {
        var self = this,
            filters = {};

        if (this.get('type') === 'mapchart') {
            filters = this.getMapPreviewFilters();
        } else {
            filters = this.getChartPreviewFilters();
        }

        this.data.set('filters', filters);
        return this.data.fetch().then(function () {
            self.trigger("newDataReceived");
        });
    },

    getChartPreviewFilters: function () {
        var self = this;

        if(!this.isValid()){
            console.error('error en valid');
        }

        var params = {
            revision_id: self.get('datastream_revision_id'),
            data: this.serializeServerExcelRange(this.get('range_data')),
            headers: this.serializeServerExcelRange(this.get('range_headers')),
            labels: this.serializeServerExcelRange(this.get('range_labels')),
            nullValueAction: self.get('nullValueAction'),
            nullValuePreset:  self.get('nullValuePreset'),
            type: self.get('type')
        };

        if(self.get('invertData')===true){
            params['invertData'] = true;
        }

        if(self.get('invertedAxis')===true){
            params['invertedAxis'] = true;
        }
        return params;
    },

    getMapPreviewFilters: function () {
        var self = this,
            params = {
                nullValueAction: this.get('nullValueAction'),
                data: this.serializeServerExcelRange(this.get('range_data')),
                lat: this.serializeServerExcelRange(this.get('range_lat')),
                lon: this.serializeServerExcelRange(this.get('range_lon')),
                revision_id: this.get('datastream_revision_id')
            };

        if (this.has('nullValuePreset')) {
            params.nullValuePreset = this.get('nullValuePreset');
        }
        return params;
    },

    onChangeType: function (model, type) {
        this.data.set('type', type);
    },

    /**
     * Default fetch filter updater
     */
    updateFetchFilters: function () {
        var filters = this.data.get('filters');

        if(this.get('type') == 'mapchart'){
            _.extend(filters, {
                zoom: this.get('mapOptions').zoom,
                bounds: (this.get('mapOptions').bounds)?this.get('mapOptions').bounds.join(';'):undefined
            });
        }

        this.data.set('filters', filters).fetch();
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

    getFormData: function(){
        var formData = this.getMeta();
        _.extend(formData, this.getSettings());
        return formData;
    },

    getMeta: function(){
        var metadata = {
            title: this.get('meta_title'),
            description: this.get('meta_description'),
            notes: this.get('meta_notes'),
        };

        return metadata;
    },

    serializeServerExcelRange: function(selection){
        if (_.isUndefined(selection)) return;
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

            if (this.get('isMap')) {

                valid = (this.data.get('clusters').length >0);
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
            valid: (  !_.isEmpty(this.get('meta_title')) &&  !_.isEmpty(this.get('meta_description'))  ),
            fields:{
                'title':  _.isEmpty(this.get('meta_title')),
                'description':  _.isEmpty(this.get('meta_description'))
            }
        }
        return validation
    },

    getSettings: function(){
        var settings = {
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
                mapType: this.get('mapType').toLowerCase(),
                zoom: this.get('mapOptions').zoom,
                bounds: this.get('mapOptions').bounds.join(';')
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

    save: function (attrs, options) {
        var data = this.getFormData();

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
    }
});

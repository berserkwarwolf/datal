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
        stylesDefault: {
            "marker": {
                icon : "https://maps.gstatic.com/mapfiles/ms2/micons/red-pushpin.png"
            },
            "lineStyle": {
                "strokeColor": "#00FFaa",
                "strokeOpacity": 1.0,
                "strokeWeight": 2,
                "fillColor": '#FF0000',
                "fillOpacity": 0.01
            },
            "polyStyle": {
                "strokeColor": "#FF0000",
                "strokeOpacity": 1.0,
                "strokeWeight": 3,
                "fillColor": '#FF0000',
                "fillOpacity": 0.35
            },
        },
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

        if(this.get('isEdit')){
            this.fetchPreviewData();
        }

        this.bindEvents();
    },

    bindEvents: function () {
        //Se actualizan los filtros de los datos cuando se cambian las options
        this.on('change:mapOptions', this.updateFetchFilters);
        this.on('change:type', this.onChangeType);
        this.listenTo(this.data, 'data_updated', this.handleDataUpdate);
        this.listenTo(this.data, 'fetch:start', function () {
            this.trigger('fetch:data:start');
        }, this);
        this.listenTo(this.data, 'fetch:end', function () {
            this.trigger('fetch:data:end', 'fetch:data:start');
        }, this);
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
        if (this.get('type') === 'mapchart') {
            return this.fetchMapPreviewData();
        } else {
            return this.fetchChartPreviewData();
        }
    },

    fetchChartPreviewData: function () {
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

        this.data.set('filters', params);
        return this.data.fetch().then(function () {
            self.trigger("newDataReceived");
        });
    },

    fetchMapPreviewData: function () {
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

        this.data.set('filters', params);
        return this.data.fetch().then(function () {
            self.trigger("newDataReceived");
        });
    },

    parseMapResponse: function (response) {
        this.data.set(response);
        this.trigger("newDataReceived");
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
        if(this.get('type') == 'mapchart'){
            this.set('styles', this.parseKmlStyles(this.data.get('styles')));
        }

        this.trigger('data_updated');
    },

    /**
     * Fetch data for the chart
     * @return {promise}
     */
    fetchData: function () {
        return this.data.fetch();
    },

    render: function(){
        return true;
    },

    getFormData: function(){
        var formData = this.getMeta();
        formData = _.extend( formData,this.getSettings() );
        return formData; 
    },

    getMeta: function(){
        var metadata = {
            title: this.get('meta_title'),
            description: this.get('meta_description'),
            notes: this.get('meta_notes'),
            
/*            category: this.get('meta_category'),
            source: this.get('meta_sources'),
            tags: this.get('meta_tags')*/
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
    },

    /**
     * MAP SPECIFIC METHODS
     */

    /**
     * Convierte estilos de tipo kml al necesario para usar en los mapas
     * @param  {object} styles
     * @return {object}
     */
    parseKmlStyles: function (styles) {
        styles = styles || [];
        var parsedStyles = this.get('stylesDefault');

        if(styles.length && styles[0].styles){
            //Obtiene el primer estilo encontrado en la data
            styles = styles[0].styles;
            if(styles.lineStyle){
                parsedStyles.lineStyle = this.kmlStyleToLine(styles.lineStyle);
            }
            if(styles.polyStyle){
                parsedStyles.polyStyle = this.kmlStyleToPolygon(parsedStyles.lineStyle, styles.polyStyle);
            }
        }

        return parsedStyles;
    },

    /**
     * Prser para los estilos desde un kml a lineas de google maps
     * @param  {object} lineStyle
     * @return {object
     */
    kmlStyleToLine: function(lineStyle) {
        var defaultStyle = this.get('stylesDefault').lineStyle;
        return {
            "strokeColor": this.getStyleFromKml(lineStyle, 'color', 'color', defaultStyle.strokeColor),
            "strokeOpacity": this.getStyleFromKml(lineStyle, 'color', 'opacity', defaultStyle.strokeOpacity),
            "strokeWeight": this.getStyleFromKml(lineStyle, 'width', 'width', defaultStyle.strokeWeight)
        };
    },

    /**
     * Parser para los estilos de un kml a polygons de google maps
     * @param  {object} lineStyle
     * @param  {object} polyStyle
     * @return {object}
     */
    kmlStyleToPolygon: function (lineStyle, polyStyle) {
        var defaultStyle = this.get('stylesDefault').polyStyle;
        var opacity = this.getStyleFromKml(polyStyle, 'fill', 'opacity', defaultStyle.strokeWeight);
        return {
            "strokeColor": lineStyle.strokeColor,
            "strokeOpacity": lineStyle.strokeOpacity,
            "strokeWeight": lineStyle.strokeWeight,
            "fillColor": this.getStyleFromKml(polyStyle, 'fill', 'color', defaultStyle.strokeWeight),
            "fillOpacity": this.getStyleFromKml(polyStyle, 'fill', 'opacity', defaultStyle.strokeWeight)
        };
    },

    /**
     * Obtiene un estilo de un objeto de estilos Kml para ser usado en google maps
     * @param  {object} kmlStyles
     * @param  {string} attribute
     * @param  {string} type
     * @param  {string} defaultStyle
     * @return {string}
     */
    getStyleFromKml: function (kmlStyles, attribute, type, defaultStyle) {
        var style = kmlStyles[attribute] || null;
        if(style == null) return defaultStyle;

        //Convierte el color de formato ARGB a RGB
        if(type == 'color')
            return '#' + style.substring(2);
        //La opacidad se extrae del color y convierte de hexadecimal a entero
        if(type == 'opacity')
            return parseInt(style.substring(0, 2), 16) / 256;

        return style;
    }

});

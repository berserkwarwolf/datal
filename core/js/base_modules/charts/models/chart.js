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
        invertedAxis: null,
        chartTemplate: '¿?',
        nullValueAction: '',
        nullValuePreset: '',
        traspose: false,

        //metadata
        meta_title: null,
        meta_description: null,
        meta_category: null,
        meta_notes: null,
        meta_source: null,
        meta_tags: null,

        //data selection
        range_headline:null,
        range_data:null,
        range_label:null,

        // Map defaults
        joinIntersectedClusters: false,
        heatMap: null,
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
        options: {
            zoom: 5,
            center: {
                lat: 0, 
                long: 0
            },
            bounds: []
        }

    },
    initialize: function () {
        this.data = new charts.models.ChartData({
            urlRoot: this.get('resourceUrl'),
            idAttribute: this.get('resourceIdAttribute'),
            id: this.get('resourceID'),
            type: this.get('type')
        });
        this.bindEvents();
    },

    bindEvents: function () {
        //Se actualizan los filtros de los datos cuando se cambian las options
        this.on('change:options', this.updateFetchFilters);
        this.on('change:type', this.onChangeType);
        this.listenTo(this.data, 'data_updated', this.handleDataUpdate);
    },

    onChangeType: function (model, type) {
        console.log('type has changed to:', type);
        if (type === 'map') {

        };
    },

    /**
     * Default fetch filter updater
     */
    updateFetchFilters: function () {
        this.data.set('fetchFilters', this.get('options'));
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
            category: this.get('meta_category'),
            source: this.get('meta_source'),
            tags: this.get('meta_tags')
        };

        return metadata;
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
            invertedAxis: this.get('invertedAxis'),
            chartTemplate: '¿?',
            nullValueAction: this.get('nullValueAction'),
            nullValuePreset: this.get('nullValuePreset'),
            traspose: this.get('traspose'),

            //data selection
            range_headline: this.get('range_headline'),
            range_data: this.get('range_data'),
            range_label: this.get('range_label')
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

    /**
     * MAP SPECIFIC METHODS
     */

    /**
     * Prepare fetch filter from the options
     */
    updateFetchFilters: function () {
        var filters = {
            zoom: this.get('options').zoom,
            bounds: this.get('options').bounds.join(';')
        };
        this.data.set('fetchFilters', filters);
    },

    /**
     * Handler para manejar las actualizaciones a los datos
     * @return {[type]} [description]
     */
    handleDataUpdate: function () {
        this.set('styles', this.parseKmlStyles(this.data.get('styles')));
        this.trigger('data_updated');
    },

    /**
     * Convierte estilos de tipo kml al necesario para usar en los mapas
     * @param  {object} styles
     * @return {object}
     */
    parseKmlStyles: function (styles) {
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
    },

});

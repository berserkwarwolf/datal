var charts = charts || {
    models: {},
    views: {}
};

charts.models.MapChart = charts.models.Chart.extend({
    type: 'map',
    urlRoot: '/api/charts/',
    defaults: _.extend({},charts.models.Chart.prototype.defaults, {
        type: 'map',
        joinIntersectedClusters: false,
        heatMap: null,
        onHeatMap: false,
        needToReloadData: false, //special case where I zoom on a heatMap
        mapType : 'roadmap',
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
    }),

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
        charts.models.Chart.prototype.handleDataUpdate.apply(this, arguments);
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

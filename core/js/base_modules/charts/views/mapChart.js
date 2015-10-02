var charts = charts || {
    models: {},
    views: {}
};

charts.views.MapChart = charts.views.Chart.extend({
    mapInstance: null,
    mapMarkers: [],
    mapClusters: [],
    mapTraces: [],
    latestDataUpdate: null,
    latestDataRender: null,
    styles: {},
    initialize: function(){
        this.bindEvents();
        this.createGoogleMapInstance();
    },

    render: function () {
        //Se chequea que la se haya actualizado la data antes de hacer nuevamente el render
        if(this.latestDataUpdate != this.latestDataRender){
            if(this.model.data.get('points') && this.model.data.get('points').length){
                this.createMapPoints();
            }
            if(this.model.data.get('clusters') && this.model.data.get('clusters').length){
                this.createMapClusters();
            }
            this.latestDataRender = this.latestDataUpdate;
        }
        return this;
    },

    handleDataUpdated: function () {
        this.latestDataUpdate = Date.now();
        this.clearMapOverlays();
        this.render();
    },

    bindEvents: function () {
        this.model.on('change', this.render, this);
        this.listenTo(this.model, 'change:mapType', this.onChangeMapType, this);
        this.model.on('data_updated', this.handleDataUpdated, this);
    },

    onChangeMapType: function (model, type) {
        if (this.mapInstance) {
            this.mapInstance.setMapTypeId(google.maps.MapTypeId[type]);
        }
    },

    /**
     * Add event handlers to the map events
     */
    bindMapEvents: function () {
        this.mapInstance.addListener('idle', this.handleBoundChanges.bind(this));
    },

    /**
     * Creates a new map google map instance
     */
    createGoogleMapInstance: function () {
        this.mapInstance = new google.maps.Map(this.el, {
            zoom: this.model.get('options').zoom,
            center: new google.maps.LatLng(this.model.get('options').center.lat,
                this.model.get('options').center.long),
            mapTypeId: google.maps.MapTypeId[this.model.get('mapType')]
        });
        this.infoWindow = new google.maps.InfoWindow();
        this.bindMapEvents();
    },

    /**
     * Remueve los elementos del mapa y elimina cualquier evento asociado a estos
     */
    clearMapOverlays: function () {
        //Markers
        this.mapMarkers = this.clearOverlay(this.mapMarkers);
        //Clusters
        this.mapClusters = this.clearOverlay(this.mapClusters);
        //Traces
        this.mapTraces = this.clearOverlay(this.mapTraces);
    },

    /**
     * Elimina una coleccion especifica de elementos sobre el mapa
     * @param  {array} overlayCollection
     */
    clearOverlay: function (overlayCollection) {
        _.each(overlayCollection, function (overlayElement, index) {
            overlayElement.setMap(null);
            //Elimina los eventos asociados al elemento
            if(overlayElement.events){
                _.each(overlayElement.events, function (event) {
                    google.maps.event.removeListener(event);
                });
            }
        }, this);
        return [];
    },

    /**
     * Crea puntos en el mapa, pueden ser de tipo traces o markers
     */
    createMapPoints: function () {
        var self = this,
            styles = this.model.get('styles');
        _.each(this.model.data.get('points'), function (point, index) {
            if(point.trace){
                this.createMapTrace(point, index, styles);
            } else {
                this.createMapMarker(point, index, styles);
            }
        }, this);
    },

    /**
     * Crea un trace de puntos dentro del mapa
     * @param  {object} point   Objeto con el trace de los puntos en el mapa
     * @param  {int} index      Indice del trace en el arreglo local de traces
     * @param  {object} styles  Estilos para dibujar el trace
     */
    createMapTrace: function (point, index, styles) {
        var paths = _.map(point.trace, function (tracePoint, index) {
            return {lat: parseFloat(tracePoint.lat), lng: parseFloat(tracePoint.long)};
        });

        var isPolygon = (paths[0].lat == paths[paths.length-1].lat && paths[0].lng == paths[paths.length-1].lng);

        if(isPolygon){
            this.mapTraces.push(this.createMapPolygon(paths, styles.polyStyle));
        } else {
            this.mapTraces.push(this.createMapPolyline(paths, styles.lineStyle))
        }
        this.mapTraces[index].setMap(this.mapInstance);
    },

    createMapPolygon: function (paths, styles) {
        return new google.maps.Polygon({
            paths: paths,
            strokeColor: styles.strokeColor,
            strokeOpacity: styles.strokeOpacity,
            strokeWeight: styles.strokeWeight,
            fillColor: styles.fillColor,
            fillOpacity: styles.fillOpacity
        });
    },

    createMapPolyline: function (paths, styles) {
        return new google.maps.Polyline({
            paths: paths,
            strokeColor: styles.strokeColor,
            strokeOpacity: styles.strokeOpacity,
            strokeWeight: styles.strokeWeight
        });
    },

    /**
     * Crea un marker dentro del mapa
     * @param  {object} point   Objeto con las coordenadas del punto en el mapa
     * @param  {int}    index   Indice del punto en el arreglo local de markers
     * @param  {object} styles  Estilos para dibujar el marker
     */
    createMapMarker: function (point, index, styles) {
        var self = this,
            markerIcon = this.model.get('stylesDefault').marker.icon;

        //Obtiene el estilo del marcador
        if(styles && styles.iconStyle){
            markerIcon = styles.iconStyle.href;
        }

        this.mapMarkers[index] = new google.maps.Marker({
            position: new google.maps.LatLng(point.lat, point.long),
            map: this.mapInstance,
            icon: markerIcon
        });

        if(point.info){
            var clickHandler = google.maps.event.addListener(this.mapMarkers[index], 'click', (function (marker, info) {
                return function() {
                    self.infoWindow.setContent("<div class='junarinfowindow'>" + String(info) + "</div>");
                    self.infoWindow.open(self.mapInstance, marker);
                }
            })(self.mapMarkers[index], point.info));
            this.mapMarkers[index].events = {click: clickHandler};
        }
    },

    /**
     * Crea clusters de puntos
     */
    createMapClusters: function () {
        var self = this;
        _.each(this.model.data.get('clusters'), this.createMapCluster, this);
    },

    /**
     * Crea un cluster de puntos 
     * @param  {object} cluster
     * @param  {int} index
     */
    createMapCluster: function (cluster, index) {
        cluster.noWrap = true;
        cluster.counter = parseInt(cluster.info);

        this.mapClusters[index] = new multimarker(cluster, cluster.info, this.mapInstance, this.model.get('options').joinIntersectedClusters);
    },

    /**
     * Get the boundaries of the current map
     */
    handleBoundChanges: function(){

        if(this.mapInstance){

            var center = this.mapInstance.getCenter(),
                bounds = this.mapInstance.getBounds(),
                zoom = this.mapInstance.getZoom();

            this.model.set('options', {
                center: {
                    lat: center.lat(),
                    long: center.lng(),
                },
                zoom: zoom,
                bounds: [
                    bounds.getNorthEast().lat(), 
                    bounds.getNorthEast().lng(), 
                    bounds.getSouthWest().lat(), 
                    bounds.getSouthWest().lng()
                ]
            });

        }

    }
});
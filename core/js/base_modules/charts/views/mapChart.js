var charts = charts || {
    models: {},
    views: {}
};

charts.views.MapChart = charts.views.Chart.extend({
    mapInstance: null,
    mapMarkers: [],
    styles: {},
    initialize: function(){
        if (this.model.get('type') !== 'map') {
            console.error('A Map model must be suplied');
        }
        this.bindEvents();
        this.createCoogleMapInstance();
    },

    render: function () {
        console.log("render");
        //Check if there is any points on the model data to be rendered and that the current
        //points haven't been rendered
        if(this.model.data.get('points') && this.model.data.get('points').length && !this.mapMarkers.length){
            this.createMapMarkers();
        }
        return this;
    },

    clearAndRender: function () {
        this.clearMapMarkers();
        console.log("data points:", this.model.data.get('points'));
        this.render();
    },

    bindEvents: function () {
        this.model.on('change', this.render, this);
        this.model.on('data_updated', this.clearAndRender, this);
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
    createCoogleMapInstance: function () {
        console.log("create map:");
        this.mapInstance = new google.maps.Map(this.el, {
            zoom: this.model.get('options').zoom,
            center: new google.maps.LatLng(this.model.get('options').center.lat, this.model.get('options').center.long)
        });
        this.infoWindow = new google.maps.InfoWindow();
        this.bindMapEvents();
    },

    /**
     * Clear and remove listeners for all the markers from the current instance of the map
     */
    clearMapMarkers: function () {
        _.each(this.mapMarkers, function (marker, index) {
            marker.setMap(null);
            google.maps.event.removeListener(marker.events.click);
        }, this);
        this.mapMarkers = [];
    },

    /**
     * Create the markers with the data on the model
     */
    createMapMarkers: function () {
        var self = this;
        console.log("create map markers:");
        _.each(this.model.data.get('points'), this.createMapMarker, this);
    },

    /**
     * Create a single marker with the given point
     * @param  {object} point   Point with the position of the marker in the form of lat and long and optionally
     *                          some info text that can be displayed on an inofobox
     * @param  {int}    index   Position of the marker on the mapMarkers array
     */
    createMapMarker: function (point, index) {
        var self = this;
        this.mapMarkers[index] = new google.maps.Marker({
            position: new google.maps.LatLng(point.lat, point.long),
            map: this.mapInstance
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
     * Get the boundaries of the current map
     * @param  {HTMLelement} div Container of the map
     */
    handleBoundChanges: function(div){
        var center = this.mapInstance.getCenter(),
            bounds = this.mapInstance.getBounds(),
            zoom = this.mapInstance.getZoom();

        console.log("set bounds, center and zoom:");
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
});
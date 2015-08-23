var charts = charts || {
    models: {},
    views: {}
};

charts.views.MapChart = charts.views.Chart.extend({
    mapInstance: null,
    mapMarkers: [],
    initialize: function(){
        if (this.model.get('type') !== 'map') {
            console.error('A Map model must be suplied');
        }
    },

    render: function () {
        //Check if the map instance already exists
        if(this.mapInstance === null){
            this.createCoogleMapInstance();
        }
        //Check if there is any points on the model data to be rendered
        if(this.model.data.get('points')){
            this.createMapMarkers();
        }
        return this;
    },

    createCoogleMapInstance: function () {
        this.mapInstance = new google.maps.Map(this.el, {
            zoom: this.model.get('options').zoom,
            center: new google.maps.LatLng(this.model.get('options').center.lat, this.model.get('options').center.long)
        });
        this.infoWindow = new google.maps.InfoWindow();
    },

    createMapMarkers: function () {
        var self = this;
        _.each(this.model.data.get('points'), this.createMapMarker, this);
    },

    createMapMarker: function (point, index) {
        var self = this;
        this.mapMarkers[index] = new google.maps.Marker({
            position: new google.maps.LatLng(point.lat, point.long),
            map: this.mapInstance
        });

        google.maps.event.addListener(this.mapMarkers[index], 'click', (function (marker, info) {
            return function() {
                self.infoWindow.setContent("<div class='junarinfowindow'>" + String(info) + "</div>");
                self.infoWindow.open(self.mapInstance, marker);
            }
        })(self.mapMarkers[index], point.info));
    }
});
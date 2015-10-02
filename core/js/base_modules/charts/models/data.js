var charts = charts || {
    models: {},
    views: {}
};

charts.models.ChartData = Backbone.Model.extend({
    type: 'line',
    idAttribute: 'visualization_revision_id',
    urlRoot: '/rest/charts/',
    defaults: {
        filters: {},
        type: 'line',
        fields: [
            // [fieldtype, fieldname]
        ],
        rows: [
            // [value, value, value, ...]
        ],
        //Map data
        points: [
            // "lat": "00.000000",
            // "long": "-00.000000",
            // "info": "<strong>Point text information</strong>"
        ],
        clusters: [
            // "lat": "00.000000",
            // "long": "-00.000000",
            // "info": "<strong>Point text information</strong>"
        ]
    },

    initialize: function () {
        this.on('change:filters', this.handleFetchFiltersChange, this);
    },

    /**
     * Se actualiza la data mediante el metodo fetch cada vez que se escucha un cambio en los filtros
     */
    handleFetchFiltersChange: function () {
        return this.fetch();
    },

    /**
     * Se sobreescribe función fetch para detener cualquier request que esté pendiente
     * @return {[type]} [description]
     */
    fetch: function () {
        var self = this;

        if(this.fetchXhr && this.fetchXhr.readyState > 0 && this.fetchXhr.readyState < 4){
            this.fetchXhr.abort();
        }
        this.fetchXhr = Backbone.Model.prototype.fetch.apply(this, arguments);
        this.fetchXhr.always(function () {
            self.trigger('data_updated');
        });
        return this.fetchXhr;
    },

    /**
     * Se arma la url para el fetch utilizando los attributos pasados al modelo y los filtros existentes
     */
    url: function () {
        var filters = this.get('filters'),
            id = this.get('id'), // ID existe cuando la visualizacion está siendo editada
            url,
            endpoint = 'charts/';

        if (this.get('type') === 'mapchart') {
            endpoint = 'maps/';
        }

        if (_.isUndefined(id)) {
            url = '/rest/' + endpoint + 'sample.json' + '?' + $.param(filters);
        } else {
            url = '/rest/' + endpoint + id + '/data.json' + '?' + $.param(filters);
        }

        return url;
    }
});

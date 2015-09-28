var DataStreamModel = Backbone.Model.extend({
    idAttribute: 'datastream_revision_id',
    url: function () {
        return ['/rest/datastreams/',
            this.get('datastream_revision_id'),
            '/data.json?limit=50&page=0'].join('');
    }
})
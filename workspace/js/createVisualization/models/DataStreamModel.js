var DataStreamModel = Backbone.Model.extend({
    idAttribute: 'datastream_revision_id',
    url: function () {
        return ['/dataviews/invoke?datastream_revision_id=', 
            this.get('datastream_revision_id'),
            '&limit=50&page=0'].join('');
    }
})
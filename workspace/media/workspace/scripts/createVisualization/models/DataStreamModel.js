var DataStreamModel = Backbone.Model.extend({
    idAttribute: 'datastream_revision_id',
    url: function () {
        var params = {
            limit: 50,
            page: 0
        };

        _.each(this.get('parameters'), function (param, idx) {
            params['pArgument' + idx] = param['default'];
        });

        return ['/rest/datastreams/',
                this.get('datastream_revision_id'),
                '/data.json?',
                $.param(params)
            ].join('');
    }
})
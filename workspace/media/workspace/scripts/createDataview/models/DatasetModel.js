var DatasetModel = Backbone.Model.extend({
    idAttribute: 'dataset_revision_id',

    url: function () {
        return ['/rest/datasets/',
            this.get('dataset_revision_id'),
            '/tables.json?&limit=100&_=1447703003254'].join('');
    },

    parse: function (response) {
        return {
                tables: response
            };
    },

    getTables: function () {
        return _.range(0, this.get('tables').length);
    }
})
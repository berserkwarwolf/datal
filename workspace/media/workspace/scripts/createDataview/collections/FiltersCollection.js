var FiltersCollection = Backbone.Collection.extend({
    updateIds: function () {
        this.each(function (model, index) {
            model.set('id', index);
        });
    },

    toSampleFilters: function () {
        var result = {};
        this.updateIds();

        var parameterFilters = this.models.filter(function (model) {
            return model.get('type') === 'parameter';
        });
        _.each(parameterFilters, function (model) {
            result['pArgument' + model.get('id')] = model.get('value');
            result['pParameter' +  model.get('id')] = model.get('name');
        });

        return result;
    }
});
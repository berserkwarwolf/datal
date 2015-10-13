var AffectedResourcesCollection = Backbone.Collection.extend({
    model: affectedResourcesModel,
    url: '/visualizations/related_resources'
});
var AffectedResourcesCollection = Backbone.Collection.extend({
    model: affectedResourcesModel,
    url: '/dataviews/related_resources'
});
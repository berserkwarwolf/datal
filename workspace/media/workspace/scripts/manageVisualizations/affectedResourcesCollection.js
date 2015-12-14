var AffectedResourcesCollection = Backbone.Collection.extend({
    model: affectedResourcesModel,
    url: '/visualizations/retrieve_childs'
});
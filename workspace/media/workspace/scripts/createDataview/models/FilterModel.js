var FilterModel = Backbone.Epoxy.Model.extend({
    idAttribute: "column",

    defaults: {
        column: undefined,
        operator: undefined,
        type: undefined
    },

});
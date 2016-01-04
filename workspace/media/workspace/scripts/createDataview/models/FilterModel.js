var FilterModel = Backbone.Epoxy.Model.extend({
    idAttribute: "column",

    defaults: {
        column: undefined,
        operator: undefined,
        type: undefined,
        name: undefined,
        description: undefined,
        'default': undefined
    },

    reset: function () {
        var keep = this.pick(['column', 'excelCol']);
        this.set(this.defaults).set(keep);
    }
});
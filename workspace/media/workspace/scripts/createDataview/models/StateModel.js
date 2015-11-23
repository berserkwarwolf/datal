var StateModel = Backbone.Model.extend({
    last: 4,

    next: function () {
       this.set('step', this.get('step') + 1);
    },

    prev: function () {
       this.set('step', this.get('step') - 1);
    } 
});
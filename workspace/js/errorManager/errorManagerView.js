(function ($, Backbone, global, undefined) {
    var ErrorManagerView = Backbone.View.extend({
        template: null,
        initialize: function () {
            this.model.on("change", this.render.bind(this));

            //Manjeador de eventos global de datal
            datalEvents.on('data:application-error', this.onApplicationError.bind(this));
        },
        onApplicationError: function (error) {
            //Se pasan los mensajes de error al modelo
            this.model.set(error);
        },
        prepareText: function () {
            return this.template(this.model.toJSON());
        },
        render: function () {
            this.template = _.template($("#errorManagerView_template").html());
            this.addGritterNotification();
        },
        addGritterNotification: function () {
            $.gritter.add({
                title: this.model.get('error'),
                text: this.prepareText(),
                sticky: true
            });
        }
    });

    global.errorManagerView = new ErrorManagerView({ model: global.errorManagerModel });
})(jQuery, Backbone, window);
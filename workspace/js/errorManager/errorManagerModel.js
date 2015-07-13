(function ($, Backbone, global, undefined) {

    var ErrorManagerModel = Backbone.Model.extend({
        defaults: {
            "error": "",
            "description": "",
            "status": "",
            "type": "",
            "actions": []
        }
    });

    global.errorManagerModel = new ErrorManagerModel();
})(jQuery, Backbone, window);
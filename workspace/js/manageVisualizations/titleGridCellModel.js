var TitleGridCellModel = Backbone.Model.extend({
    defaults: function() {
        return {
            title: "",
            dataset_id:"",
            id: "",
            created_at: "",
            status_nice: ""
        };
    }
});
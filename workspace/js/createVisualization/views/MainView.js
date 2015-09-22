var MainView = Backbone.View.extend({

    steps: {},
    currentFlow: 'charts',
    index: 0,

    events: {
        'click .section-title .buttons-bar a[data-step]': 'onNavigationButtonClicked',
    },

    initialize: function (options) {

        this.model = new charts.models.Chart();

        this.model.parseResponse(options.chart_model);

        if (options.chart_model.revision_id) {
            this.model.set('isEdit', true);
            this.model.fetchPreviewData();
        };

        //Buttons views
        this.buttonsView = new ButtonsView({
            // TODO: this should be a child element of the main view
            el: this.$('.section-title .buttons_view_container')
        });
        this.buttonsView.setSteps(this.steps[this.currentFlow]);
        this.buttonsView.render();
        this.listenTo(this.buttonsView, 'goTo', this.onGoTo, this);

        //Create & register main step: zero
        var startView = new StartView({
          name: gettext('APP-START-TEXT'),
          model: this.model,
          el: this.$('.step-0-view')
        }).init();
        
        this.register( startView );

        //Create charts steps
        var chartView = new ChartView({
          name: gettext('APP-CHART-TEXT'), 
          model: this.model,
          el: this.$('.step-1-view')
        }).init();

        var metadataView = new MetadataView({
          name: gettext('APP-VIZ-METADATA-TEXT'), 
          model: this.model,
          el: this.$('.step-2-view')
        }).init();

        var finishView = new FinishView({
          name: gettext('APP-VIZ-FINISH-TEXT'),
          model: this.model,
          el: this.$('.step-3-view')
        }).init();

        //Register charts views
        this.register( chartView, 'charts' );
        this.register( metadataView, 'charts' );
        this.register( finishView, 'charts' );

        //Create maps steps
        var mapView = new MapView({
          name: gettext('APP-MAP-TEXT'), 
          model: this.model,
          el: this.$('.step-1-view-map')
        }).init();

       /* var mapMetadataView = new MapMetadataView({
          name: gettext('APP-VIZ-METADATA-TEXT'), 
          model: this.model,
          el: this.$('.step-2-view-map')
        }).init();*/

        var mapFinishView = new MapFinishView({
          name: gettext('APP-VIZ-FINISH-TEXT'),
          model: this.model,
          el: this.$('.step-3-view-map')
        }).init();

        //Register maps views
        this.register( mapView, 'maps'  );
        this.register( metadataView, 'maps'  );
        this.register( mapFinishView, 'maps'  );

        this.start();

    },

    render: function(){
        this.buttonsView.setSteps(this.steps);
        this.buttonsView.render();
        return this;
    },

    register: function(view, flow){
        if(!view.initializedEvents){
            view.initializedEvents = true;
            this.listenTo(view,'next',this.next);
            this.listenTo(view,'previous',this.previous);
            this.listenTo(view,'openModal',this.openModal);
            this.listenTo(view,'goTo',this.goTo);
            this.listenTo(view,'setFlow',this.setFlow);
        }

        if(flow){
            this.steps[flow].push(view);
        } else {
            //is start view
            this.steps.charts = [view];
            this.steps.maps = [view];
        }

        this.render();
    },

    setFlow: function(flow){
        this.currentFlow = flow;
        if(flow){
            this.buttonsView.setSteps(this.steps[this.currentFlow]);
        } else {
            this.index = 0;
            this.buttonsView.setSteps(null);
        }
        this.buttonsView.render();
    },

    previous: function(){

        // Previous
        if(this.index > 0){
            this.steps[this.currentFlow][this.index].finish();
            this.index--;
            if( this.index == 0 ){
                this.hideNavigation();
            }else{
                this.showNavigation();
            }
            this.selectNavigationTab(this.index);
            this.steps[this.currentFlow][this.index].start();
    
        // Go to first "Static" Step
        }else{
            window.location = this.model.get('startUrl');
        }

    },

    next: function(){

        // Next
        if( this.index < (this.steps[this.currentFlow].length-1) ){

            //this.model.set('output',output);
            this.steps[this.currentFlow][this.index].finish();
            this.index++;
            if( this.index == 0 ){
                this.hideNavigation();
            }else{
                this.showNavigation();
            }
            this.selectNavigationTab(this.index);
            this.steps[this.currentFlow][this.index].start();

        // Save
        }else if( this.index == (this.steps[this.currentFlow].length-1) ){

            /*var newRevisionId = output.revision_id;

            if( !_.isUndefined(newRevisionId) ){
                var newURL = this.model.get('finishUrl') + newRevisionId;
                this.model.set('finishUrl',  newURL);   
            };*/

            this.finish();
        }

    },

    goTo: function(index){
        this.finish();
        this.index = index;
        this.start();
    },

    start: function(){
        this.$el.find('.process_manager_step').hide();

        //edit
        if(this.model.get('isEdit')){
            this.model.set('isMap', false);
            this.currentFlow = 'charts';
            this.index++;
            this.steps[this.currentFlow][this.index].start();
        }
        
        this.steps[this.currentFlow][this.index].start();
        
    },

    finish: function(){
        this.steps[this.currentFlow][this.index].finish();
        //window.location = this.model.get('finishUrl');
    },

    onGoTo: function(index){

        if(index != this.index){
            this.goTo(index);
            this.selectNavigationTab(index);
        }
        
    },

    // TODO: this should be handled by the ButtonsView
    selectNavigationTab: function(index){
        $('.section-title .buttons-bar').attr( 'data-step', ( parseFloat(index)-1 ) );
    },

    showNavigation: function(){
        $('#buttons_view_container').show();
        $('#start-title').hide();
    },

    hideNavigation: function(){
        $('#buttons_view_container').hide();
        $('#start-title').show();
    }


});
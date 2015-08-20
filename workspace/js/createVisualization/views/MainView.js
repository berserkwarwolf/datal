var MainView = Backbone.View.extend({

    steps: [],
    modals: {},
    index: 0,

    events: {
        'click .section-title .buttons-bar a[data-step]': 'onNavigationButtonClicked',
    },

    initialize: function () {

        this.model = new charts.models.Chart();

        this.buttonsView = new ButtonsView({
            // TODO: this should be a child element of the main view
            el: $('#buttons_view_container')
        });
        this.buttonsView.setSteps(this.steps);
        this.buttonsView.render();
        this.listenTo(this.buttonsView, 'goTo', this.onGoTo, this);

        //Create steps
        var startView = new StartView({
          name: gettext('APP-START-TEXT'),
          model: this.model,
          el: this.$('.step-0-view')
        }).init();

        var chartView = new ChartView({
          name: gettext('APP-CUSTOMIZE-TEXT'), 
          model: this.model,
          el: this.$('.step-1-view')
        }).init();

        var metadataView = new ChartView({
          name: gettext('APP-METADATA-TEXT'), 
          model: this.model,
          el: this.$('.step-2-view')
        }).init();

        var finishView = new FinishView({
          name: gettext('APP-FINISH-TEXT'),
          model: this.model,
          el: this.$('.step-3-view')
        }).init();

        //Register views
        this.register( startView );
        this.register( chartView );
        this.register( metadataView );
        this.register( finishView );

        //Create modals
        var selectDataModal = new ChartSelectDataModalView({
          id: 'chartSelectDataModal',
          el: '#chartSelectDataModal',
          model: this.model
        }).render();

        var selectLabelModal = new ChartSelectLabelModalView({
          id: 'chartSelectLabelModal',
          el: '#chartSelectLabelModal',
          model: this.model
        });

        //Register modals
        this.registerModal( selectDataModal );
        this.registerModal( selectLabelModal );

        //Start
        this.start();

    },

    render: function(){
        this.buttonsView.setSteps(this.steps);
        this.buttonsView.render();
        return this;
    },


    register: function(view){
        this.steps.push(view);
        this.listenTo(view,'next',this.next);
        this.listenTo(view,'previous',this.previous);
        this.listenTo(view,'openModal',this.openModal);
        this.render();
    },

    registerModal: function(view){
        this.modals[view.id] = view;
        this.listenTo(view,'openModal',this.openModal);
    },

    previous: function(output){

        // Previous
        if(this.index > 0){
            this.steps[this.index].finish();
            this.index--;
            this.selectNavigationTab(this.index);
            this.steps[this.index].start( this.model.get('output') );

        // Go to first "Static" Step
        }else{
            window.location = this.model.get('startUrl');
        }

    },

    next: function(output){

        // Next
        if( this.index < (this.steps.length-1) ){
            this.model.set('output',output);
            this.steps[this.index].finish();
            this.index++;
            this.selectNavigationTab(this.index);
            this.steps[this.index].start( this.model.get('output') );

        // Save
        }else if( this.index == (this.steps.length-1) ){

            var newRevisionId = output.revision_id;

            if( !_.isUndefined(newRevisionId) ){
                var newURL = this.model.get('finishUrl') + newRevisionId;
                this.model.set('finishUrl',  newURL);   
            };

            this.finish();
        }

    },

    openModal: function(id){
        if(this.modals[id]){
            this.modals[id].open();
        } else {
            console.error('Modal no registrado');
        }
    },

    goTo: function(index){
        this.finish();
        this.index = index;
        this.start();
    },

    start: function(){
        this.$el.find('.process_manager_step').hide();
        this.steps[0].start();
    },

    finish: function(){
        window.location = this.model.get('finishUrl');
    },

    onGoTo: function(index){

        if(index != this.index){
            this.goTo(index);
            this.selectNavigationTab(index);
        }
        
    },

    // TODO: this should be handled by the ButtonsView
    selectNavigationTab: function(index){
        $('.section-title .buttons-bar').attr( 'data-step', ( parseFloat(index)+1 ) );
    }


});
var MapView = StepViewSPA.extend({
    
    initialize: function(){

        // Right way to extend events without overriding the parent ones
        this.addEvents({
            'click a.backButton':           'onPreviousButtonClicked',
            'click a.nextButton':           'onNextButtonClicked',
            'click button.selectData':      'onSelectDataClicked',
            'click .mapTypeId':             'onClickMapTypeId',
            'click button.btn-zoom':        'onClickZoom'
        });

        this.chartsFactory = new charts.ChartsFactory();

        this.modalView = new MapSelectDataModalView({
          el: '#MapSelectDataModal',
          model: this.model,
          dataStreamModel: this.dataStreamModel
        });
        this.listenTo(this.modalView, 'close', this.fetchPreviewData, this);
        // Event binding
        this.listenTo(this.model, 'change:type', this.onChartChanged, this);
    }, 

    onCloseModal: function () {
        this.fetchPreviewData();
    },

    fetchPreviewData: function(){
        $("#ajax_loading_overlay").show();
        this.model.fetchMapPreviewData()
        .then(function () {
            $("#ajax_loading_overlay").hide();
        })
        .error(function(response){
            $("#ajax_loading_overlay").hide();
        });;
    },

    onSelectDataClicked: function(){
        this.modalView.open();
    },

    onInputChanged: function(e){
        var input = $(e.target);
        this.model.set(input.data('ref'),input.val());
    },

    onClickMapTypeId: function(e){
        e.preventDefault();
        var type = $(e.currentTarget).data('type');
        this.$('.mapTypeId').removeClass('active');
        this.$('[data-type="' + type + '"].mapTypeId').addClass('active');
        this.model.set('mapType',type);
    },

    onChartChanged: function(){
        if(this.model.get('isMap')){
            console.log('you selected type: ', this.model.get('type') );
            this.setupChart();
            this.renderChart();
        }
    },

    onClickZoom: function (event) {
        var $target = $(event.currentTarget),
            increment = $target.data('zoom'),
            currentZoom = this.chartInstance.mapInstance.getZoom();
        event.preventDefault();
        this.chartInstance.mapInstance.setZoom(currentZoom + increment);
    },

    setupChart: function(){
        var chartSettings = this.chartsFactory.create(this.model.get('type'), this.model.get('lib'));

        if(chartSettings){

            //Set list of custom attributes for my model
            this.model.set('attributes', chartSettings.attributes);

            this.ChartViewClass = chartSettings.Class;

        } else {
            delete this.ChartViewClass;
            console.log('There are not class for this');
        }
    },

    renderChart: function () {
        if (this.ChartViewClass) {

            this.chartInstance = new this.ChartViewClass({
                el: this.$('#mapContainer'),
                model: this.model,
            });
            
            this.chartInstance.render();
            this.chartInstance.mapInstance.setOptions({
                disableDefaultUI: true,
                disableDoubleClickZoom: true,
                scrollwheel: false
            });

        }   
    },

    onPreviousButtonClicked: function(){
        this.goTo(0);
    },

    onNextButtonClicked: function(){        
        this.next();
    },

    start: function(){
        this.constructor.__super__.start.apply(this);

        this.model.set({
            lib: 'google',
            type: 'mapchart'
        });
    }


});
var MapView = StepViewSPA.extend({
    
    bindings: {
        "p.message": "text:message"
    },

    initialize: function(options){

        this.stateModel = options.stateModel;

        // Right way to extend events without overriding the parent ones
        this.addEvents({
            'click a.backButton':           'onPreviousButtonClicked',
            'click a.nextButton':           'onNextButtonClicked',
            'click button.selectData':      'onSelectDataClicked',
            'click .mapTypeId':             'onClickMapTypeId',
            'click button.btn-zoom':        'onClickZoom',
            'click div.mapContent':         'onMapContentClicked'
        });

        this.vizContent = this.$el.find('.visualizationContainer');
        this.mapContent = this.$el.find('.mapContent');
        this.selectDataBtn = this.$el.find('.visualizationContainer button.selectData');
        this.nextBtn = this.$el.find('a.nextButton');
        this.message = this.$el.find('p.message');

        this.chartsFactory = new charts.ChartsFactory();

        this.modalView = new MapSelectDataModalView({
          el: '#MapSelectDataModal',
          model: this.model,
          dataStreamModel: options.dataStreamModel
        });
        this.modalView.on('open', function () {
            this.model.set('select_data',true);
            if(this.dataTableView){
                this.dataTableView.render();
            }
        });

                //edit
        if(this.stateModel.get('isEdit')){
            
            this.changeMapType(this.model.get('mapType'));

            var that = this;

            $("#ajax_loading_overlay").show();

        }

        // Event binding
        this.listenTo(this.modalView, 'close', this.fetchPreviewData, this);
        this.listenTo(this.model, 'data_updated',this.onChartChanged,this);

        this.listenTo(this.model.data, 'fetch:start', this.onFetchStart, this);
        this.listenTo(this.model.data, 'fetch:end', this.onFetchEnd, this);

        this.nextBtn.addClass('disabled');
        
        this.setupChart();

    }, 

    fetchPreviewData: function(){
        $("#ajax_loading_overlay").show();

        this.model.fetchPreviewData().always(function(){
            $("#ajax_loading_overlay").hide();
        });;
    },

    onFetchStart: function () {
        console.info('MapChart: fetch data started');
        this.$('.visualizationContainer .loading').removeClass('hidden');
    },

    onFetchEnd: function () {
        console.info('MapChart: fetch data ended');
        this.$('.visualizationContainer .loading').addClass('hidden');
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
        this.changeMapType(type);
        this.model.set('mapType',type);
    },

    changeMapType: function(type){
        this.$('.mapTypeId').removeClass('active');
        this.$('[data-type="' + type + '"].mapTypeId').addClass('active');
    },

    onChartChanged: function(){
        if(this.stateModel.get('isMap') && this.model.get('select_data') ){
             if(this.selectDataBtn.hasClass('icon-add')){
                this.selectDataBtn.removeClass('icon-add').addClass('icon-edit');       
                this.vizContent.addClass('dataSelected');
            }

            console.log('you selected type: ', this.model.get('type'), ' mapType:', this.model.get('mapType') );
            this.setupChart();
            this.renderChart();
        }
    },

    onMapContentClicked: function(){
        if(!this.chartInstance || !this.chartInstance.mapInstance){
            this.modalView.open();
        }
    },

    onClickZoom: function (event) {
        event.preventDefault();
        var $target = $(event.currentTarget),
            increment = $target.data('zoom'),
            currentZoom = this.chartInstance.mapInstance.getZoom();
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
            console.log('There is not class for this');
        }
    },

    renderChart: function () {
        if (this.ChartViewClass) {

            this.destroyChartInstance();

            this.chartInstance = new this.ChartViewClass({
                el: this.$('#mapContainer'),
                model: this.model,
                mapOptions: {
                    disableDefaultUI: true,
                    disableDoubleClickZoom: true,
                    scrollwheel: false
                }
            });

            //Validate data
            var validation = this.model.valid(); //valida datos por tipo de gráfico

            if(validation===true){
                if(this.model.get('select_data')){ //si alguna vez abrió el modal de datos
                    this.nextBtn.removeClass('disabled');
                    this.message.hide();
                    this.chartInstance.render();
                } else {
                    this.nextBtn.addClass('disabled');
                    this.vizContent.removeClass('dataSelected');
                }
            }   else {
                this.message.show();
                this.destroyChartInstance();
                this.nextBtn.addClass('disabled');
                this.vizContent.removeClass('dataSelected');
            }

        }
    },

    destroyChartInstance: function(){
        if(this.chartInstance){
            this.chartInstance = this.chartInstance.destroy();
        }
    },

    onPreviousButtonClicked: function(){
        this.previous();
    },

    onNextButtonClicked: function(){
        this.next();
    },

    start: function(){
        this.constructor.__super__.start.apply(this);

        this.model.set({
            lib: 'google'
        });

        if(this.model.data.get('clusters').length){
            this.onChartChanged();
        }

    },

    finish: function(){
        this.constructor.__super__.finish.apply(this);

        this.destroyChartInstance();
    },


});
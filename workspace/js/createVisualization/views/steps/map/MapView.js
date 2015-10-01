var MapView = StepViewSPA.extend({
    
    bindings: {
        "p.message": "text:message"
    },

    initialize: function(options){

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

        this.listenTo(this.modalView, 'close', this.fetchPreviewData, this);
        // Event binding
        this.listenTo(this.model, 'change:mapType', this.onChartChanged, this);

        this.nextBtn.addClass('disabled');
        
        this.setupChart();

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
        if(this.model.get('isMap') && this.model.get('select_data') ){
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

            this.chartInstance = new this.ChartViewClass({
                el: this.$('#mapContainer'),
                model: this.model,
            });

            //Validate data
            var validation = this.model.valid(); //valida datos por tipo de gráfico

            if(validation===true){
                if(this.model.get('select_data')){ //si alguna vez abrió el modal de datos
                    this.nextBtn.removeClass('disabled');
                    this.message.hide();
                    this.chartInstance.render();
                    this.chartInstance.mapInstance.setOptions({
                        disableDefaultUI: true,
                        disableDoubleClickZoom: true,
                        scrollwheel: false
                    });
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
            lib: 'google',
            type: 'mapchart'
        });
    },

    finish: function(){
        this.constructor.__super__.finish.apply(this);

        this.destroyChartInstance();
    },


});
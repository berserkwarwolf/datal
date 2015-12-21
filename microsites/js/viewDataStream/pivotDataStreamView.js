var pivotDataStreamView = Backbone.View.extend({

  el: '#id_pivotDataStream',

  events:{

    'click #id_pivotTableButton': 'onPivotTableButtonClicked',
    'click #id_pivotChartsButton': 'onPivotChartsButtonClicked',
    'click #id_pivotFullScreenButton': 'onPivotFullScreenButtonClicked',
    'click #id_pivotFieldsButton': 'onPivotFieldsButtonClicked',
    'click #id_pivotChartsBarButton, #id_pivotChartsLineButton, #id_pivotChartsScatterButton, #id_pivotChartsPieButton, #id_pivotChartsBarStackButton, #id_pivotChartsBarLineButton': 'onPivotChartTypesButtonClicked'

  },

  initialize: function() {

    dataStream = this.options.dataStream;

    // Embed pivot component
    flexmonster.embedPivotComponent(dataStream.get('pivotTablePath'),
      'id_pivotObject',
      '100%',
      '100%',
      {
        configUrl: dataStream.getPivotTableConfig(),
        licenseKey: dataStream.get('pivotTableLicense'),
        jsFieldsListOpenHandler: "$('#id_pivotFieldsButton').addClass('active')",
        jsFieldsListCloseHandler: "$('#id_pivotFieldsButton').removeClass('active')"
      }
    );
		  	
  	this.render();

  },

  render: function() {
	  return this;
  },

  show: function(){	
	  this.$el.show();
  },

  hide: function(){
	  this.$el.hide();
  },	

  onPivotTableButtonClicked: function(event){

    // Close Tooltip
    $('#id_pivotChartsTooltip').fadeOut(375);

    // Toggle Table Tab
    $('#id_pivotChartsButton').removeClass('active');

    // Select Active tab
    $('#id_pivotTableButton').addClass('active');

    // Show Pivot Table
    flexmonster.showGrid();

  },

  onPivotChartsButtonClicked: function(){

    if( $('#id_pivotTableButton').hasClass('active') ){
      $('#id_pivotChartsButton').toggleClass('active');
    }
    else{
      $('#id_pivotChartsButton').addClass('active');
    }
    $('#id_pivotChartsTooltip').fadeToggle(375);

  },

  onPivotChartTypesButtonClicked: function(event){

    // Close Tooltip
    $('#id_pivotChartsTooltip').fadeOut(375);

    // Toggle Table Tab
    $('#id_pivotTableButton').removeClass('active');

    // Select Active tab
    $('#id_pivotChartsButton').addClass('active');

    // Show Pivot Chart
    var type = event.currentTarget.rel;
    flexmonster.showCharts(type);

  },

  isNativeFullScreen: function(){
    return (document.fullscreenEnabled) || (document.mozFullScreen) || (document.webkitIsFullScreen);
  },

  onPivotFullScreenButtonClicked: function(){

    // Close Tooltip
    $('#id_pivotChartsTooltip').fadeOut(375);

    // Check native Full Screen
    if (!this.isNativeFullScreen()) {

      var element = document.getElementById('id_pivotDataStream');

      if (element.requestFullscreen) {
        element.requestFullscreen();
        return;
      } else if (element.webkitRequestFullScreen) {
        var ua = navigator.userAgent;
        if ((ua.indexOf("Safari") > -1) && (ua.indexOf("Chrome") == -1)) {
          element.webkitRequestFullScreen();
        } else {
          element.webkitRequestFullScreen(Element.ALLOW_KEYBOARD_INPUT);
        }
        return;
      } else if (element.mozRequestFullScreen) {
        element.mozRequestFullScreen();
        return;
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
        return;
      } else if (document.cancelFullscreen) {
        document.cancelFullscreen();
        return;
      } else if (document.mozCancelFullScreen) {
        document.mozCancelFullScreen();
        return;
      } else if (document.webkitExitFullScreen) {
        document.webkitExitFullScreen();
        return;
      } else if (document.webkitCancelFullScreen) {
        document.webkitCancelFullScreen();
        return;
      }
    }

    // Toogle Full Screen
    flexmonster.fullScreen();

  },

  onPivotFieldsButtonClicked: function(event){

    var button = event.currentTarget;

    if( $('#'+button.id).hasClass('active') ){
      flexmonster.closeFieldsList();
    }else{
      flexmonster.openFieldsList();
    }

    $('#'+button.id).toggleClass('active');

  }

});
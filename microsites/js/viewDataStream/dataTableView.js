var dataTableView = Backbone.View.extend({

	el: '#id_wrapper',	 
	
	template: null,
	
	events:{
		'click #id_refreshButton, #id_retryButton': 'onRefreshButtonClicked',
		'click a[id^="id_changeParam"]': 'onChangeParamButtonClicked',
		'click #id_pivotComponentButton': 'onPivotComponentButtonClicked'
	},

	$parameters: null,
	
	pivot: null,
	
	initialize: function() {

		$parameters = this.$el.find('a[id^="id_changeParam"]');
		this.template = _.template( $("#id_dataTableTemplate").html() );
		
		this.listenTo(this.model, "change:result", this.render);
	  
	  //When page, rows or dataStream's arguments change then invoke
	  var i=0;
		while(i < $parameters.size()){
			var name = 'parameter' + i;
			this.listenTo(this.options.dataStream, "change:"+name, this.invoke);
			i++;
		} 
	  
	  this.invoke();
	},
	
	render: function() {

		var dataStream = this.options.dataStream.attributes;

		// Set Template
		this.$el.find('#id_datastreamResult > div').html(this.template(this.model.attributes));

		// Set Max Width for Title
		this.setTitleMaxWidth();

		// If Array, Init Flexigrid
		if(this.model.attributes.result.fType == 'ARRAY'){

			// Trigger init on flexigrid to listenTo on plugins
			this.trigger('flexigrid-init', this.model.attributes.result);

			// Init flexigrid
			this.initFlexigrid(this.model.attributes.result);

		}else{
			this.setTableHeight();
		}

    return this;

	},

	setTitleMaxWidth: function(){

		$(document).ready(function(){

			$(window).resize(function(){

				var paramsWidth = 0;

				if( $parameters.length > 0 ){
					paramsWidth = 
						parseFloat( $('.dataTable header h1 .parameters').width() )
			    	- parseFloat( $('.dataTable header h1 .parameters').css('padding-left').split('px')[0] )
			    	+ 20;// Fix to perfection
				}

				var maxWidth = 
					parseFloat( $('.dataTable header h1').width() )
			    - paramsWidth;
			    
			  $('.dataTable header h1 strong').css('max-width',maxWidth+'px');

	  	}).resize();

		});

	},
	
	onChangeParamButtonClicked: function(event){

		var button = event.currentTarget;

		// If not disabled
		if( !$(button).parents('.parameters').hasClass('isDisabled') ){
			new changeDataStreamParametersView({model: new changeDataStreamParameters(), dataStream: this.options.dataStream});
		}
		
	},

	onRefreshButtonClicked: function(event){

		var button = event.currentTarget;

		// If not disabled
		if( !$(button).hasClass('isDisabled') ){
			this.options.dataStream.set('filter', '');
			this.invoke();
		}

	},

	updateParametersButtonsValues: function(){

		var dataStream = this.options.dataStream;

		var i=0;
		while(i < $parameters.size()){
			var name = 'parameter' + i;
			if(dataStream.hasChanged(name)){
				$parameters.eq(i).html(dataStream.get(name).value);
			}
			i++;
		}

	},
	
	invoke: function(){

		var dataStream = this.options.dataStream.attributes;

	  var data = "&limit=" + this.model.get("rows") + "&page=" + this.model.get("page");

	  // Add DataStream pArguments
	  var params = [],
			n = 0;

		while( dataStream['parameter' + n ] != undefined ){
			params.push('&pArgument' + n + '=' + dataStream['parameter'+n].value);
			n++;					
		}

		if(params.length > 0){
			data += params.join('');
		}
	    
	  var ajax = $.ajax({ 
			url: '/rest/datastreams/' + dataStream.id + '/data.json', 
		  type:'GET', 
		  data: data, 
		  dataType: 'json', 
		  beforeSend: _.bind(this.onInvokeBeforeSend, this),
		  success: _.bind(this.onInvokeSuccess, this), 
		  error: _.bind(this.onInvokeError, this)
	  });

	},

	onInvokeBeforeSend: function(){
    this.updateParametersButtonsValues();
    this.setLoading();
	},
	
	onInvokeSuccess: function(response){
		this.setLastUpdate(response);
		this.model.set('result', response);
	},
	
	onInvokeError: function(){

	},

	setHeights: function(theContainer, theHeight){

		if(typeof theHeight == 'undefined'){
			theHeight = 0;
		} 

		var heightContainer = String(theContainer),
  		tabsHeight = parseFloat( $('.tabs').height() ),
			otherHeight = theHeight,
			minHeight = tabsHeight - otherHeight;

	  $(heightContainer).css('min-height', minHeight+ 'px');

		$(window).resize(function(){

			var height = 
				parseFloat( $(window).height() )
				- parseFloat( otherHeight	)
		    - parseFloat( $('.brandingHeader').height() )
		    - parseFloat( $('.content').css('padding-top').split('px')[0] )
		    - parseFloat( $('.content').css('padding-bottom').split('px')[0] )
		    - parseFloat( $('.miniFooterJunar').height() );
		    
		  $(heightContainer).height(height);

  	}).resize();

	},

	setLoading: function(){

		// Loading Template
		this.$el.find('#id_datastreamResult').html('<div class="result"><div class="loading">'+ gettext( 'APP-LOADING-TEXT' ) + '</div></div>');

		// Set Loading Height
		var self = this;

		$(document).ready(function(){
			
			var otherHeights = 
				parseFloat( $('.dataTable header').height() )
				+ parseFloat( $('.dataTable header').css('padding-top').split('px')[0] ) 
				+ parseFloat( $('.dataTable header').css('padding-bottom').split('px')[0] )
				+ parseFloat( $('.dataTable header').css('border-bottom-width').split('px')[0] )
				+ 2;// Fix to perfection;

			self.setHeights('#id_datastreamResult .loading', otherHeights);

	  });

	},

	setTableHeight:function(){

		// Set Flexigrid Height
		var self = this;

	  $(document).ready(function(){

	  	var otherHeights = 
	  		parseFloat( $('.dataTable header').height() )
	    	+ parseFloat( $('.dataTable header').css('padding-top').split('px')[0] )
	    	+ parseFloat( $('.dataTable header').css('padding-bottom').split('px')[0] )
	    	+ parseFloat( $('.dataTable header').css('border-bottom-width').split('px')[0] )
				+ 2;// Fix to perfection;

		  self.setHeights( '#id_datastreamResult .result table', otherHeights );

		});	

	},

	initFlexigrid: function(result){

		var dataStream = this.options.dataStream.attributes,
			tableWidth = $('#id_datastreamResult > div').width(),
	    cellWidth = 100,
	    colModel = [],
	    searchArray = [],
	    self = this;

	  // Set cells width 
	  if( tableWidth / result.fCols > cellWidth ){
	  	if( !$.client.os == "Mac"){
	  		var scrollbar = 27; // 27 is the size of the scrollbar in windows XP, test with other browsers and OS
	  		tableWidth = tableWidth - scrollbar;
	  	} 	
	    cellWidth = tableWidth / result.fCols;
	  }

	  // Create Flexigrid colModel
		if(result.headerCells.length > 0){
			for (var j = 0; j < result.fCols; j++) {
				var col = {};
				col.display = result.headerCells[j];
				col.name = 'column'+j;
				col.width = cellWidth;
				col.sortable = true;
				col.align = 'center';
				colModel.push(col);
			}
		}else{
			var charCode 	= 65;
			for (var j = 0; j < result.fCols; j++) {
				var col = {};
				col.display = String.fromCharCode(charCode + j);
				col.name = 'column'+j;
				col.width = cellWidth;
				col.sortable = true;
				col.align = 'center';
				colModel.push(col);
			}
		}

		// Create Flexigrid search Items
		if(result.headerCells.length > 0){
			for (var j = 0; j < result.fCols; j++) {
				var col = {};
				if( j == 0 ){
					col.isdefault = true;
				}
				col.display = result.headerCells[j];
				col.name = 'column'+j;
				searchArray.push(col);
			}
		}else{
			var charCode 	= 65;
			for (var j = 0; j < result.fCols; j++) {
				var col = {};
				if( j == 0 ){
					col.isdefault = true;
				}
				col.display = String.fromCharCode(charCode + j);
				col.name = 'column'+j;
				searchArray.push(col);
			}
		}

		// Init Flexigrid
		$('.dataTable .data .result').flexigrid({
			url: '/rest/datastreams/' + dataStream.id + '/data.grid',
			dataType: 'json',
			colModel: colModel,
			searchitems : searchArray,
			autoload: false,
			sortname: "",
			sortorder: "asc",
			width: 'auto',
			height: 'auto',
			minheight: 400,
			usepager: true,
			useRp: true,
			rp: self.model.get('rows'),
			page: self.model.get('page') + 1,
			singleSelect: true,
			resizable: true,
			total: result.fLength,
			pages: Math.ceil( result.fLength / 50), //In the future, 50 should come from a Configuration
			method: 'GET',
			blockOpacity: 1,
			errormsg: gettext('VIEWDS-FLEXIGRID-ERRORMSG'),
			pagestat: gettext('VIEWDS-FLEXIGRID-PAGESTAT-1') + ' {from} ' 
					+ gettext('VIEWDS-FLEXIGRID-PAGESTAT-2') + ' {to} ' 
					+ gettext('VIEWDS-FLEXIGRID-PAGESTAT-3') + ' {total} ' + gettext('VIEWDS-FLEXIGRID-PAGESTAT-4'),
			pagetext: gettext('VIEWDS-FLEXIGRID-PAGETEXT'),
			outof: gettext('VIEWDS-FLEXIGRID-OUTOF'),
			findtext: gettext('VIEWDS-FLEXIGRID-FINDTEXT'),
			procmsg: gettext('VIEWDS-FLEXIGRID-PROCMSG'),
			nomsg: gettext('VIEWDS-FLEXIGRID-NOMSG'),
			onBeforeSend: function(settings){

				self.trigger('flexigrid-beforeSend', result);
				
				self.setFilterParams(settings);
				settings.url = settings.url.replace(/(page=).*?(&)/, '$1' + (this.newp - 1).toString() + '$2')
				return true;

			},
			onSubmit: function(settings){

				self.trigger('flexigrid-submit', result);
			
				var params = [];

				// Add DataStream ID
				params.push({
					name: 'datastream_id',
					value: self.dataStream.attributes.id
				});

				// Add the rest of the params
				$.merge( params, self.setPOSTParams() );

				// Set Flex options
				$('.dataTable .data .result').flexOptions({
					params: params
				});	

				return true;

			},
			onSuccess: function(flexigridResponse, result){
				self.trigger('flexigrid-success', result);
			},
			onError: function(result){
				self.trigger('flexigrid-error', result);
			}
		});
	
		// Set Flexigrid Height
		self.setTableHeight();

	},

	setPOSTParams: function(){	

		var params = [],	
			n = 0;

		// Add DataStream pArguments
		while(!_.isUndefined(this.dataStream.attributes['parameter'+n])){
			params.push({
				name: 'pArgument'+n,
				value: this.dataStream.attributes['parameter'+n].value
			});
			n++;					
		}

		return params;

	},

	setFilterParams: function(settings){

		// var hash = settings.url.split('?')[1],
		// 	split = hash.split('&'),
		// 	obj = {};

		// for(var i = 0; i < split.length; i++){
		// 	var kv = split[i].split('=');
		// 	obj[kv[0]] = kv[1];
		// }

		// var url = '';

		// if( obj.query != "" ){

		// 	url = 'pFilter0='+encodeURIComponent(obj.qtype)+'[contains]'+encodeURIComponent(obj.query);

		// 	if( $parameters.length > 0 ){
		// 		url = '&' + url;
		// 	}else{
		// 		url = '?' + url;
		// 	}

		// }

		// this.options.dataStream.set('filter', url);

		var url = '';

		// Just flexigrid filter
		if( !_.isUndefined( settings ) ){
			var hash = settings.url.split('&'),
			obj = {};

			for(var i = 0; i < hash.length; i++){
				var kv = hash[i].split('=');
				obj[kv[0]] = kv[1];
			}

			if( obj.query != "" ){
				url = 'filter0='+encodeURIComponent(obj.qtype)+'[contains]'+encodeURIComponent(obj.query);
			}

		}

		if( url != ''){
			if( $parameters.length > 0 ){
				url = '&' + url;
			}else{
				url = '?' + url;
			}
		}

		this.dataStream.set('filter', url);

	},

	setLastUpdate: function(response){

		// Check if it has already been executed
		if( !$('#id_lastUpdate').hasClass('updated') ){

	    if(response.fTimestamp && response.fTimestamp != 0) {

	  		var dataStream = this.options.dataStream.attributes,

	  			// Last Update
	      	lastUpdate = new Date(response.fTimestamp).toISOString(),
	      	lastUpdateNumber = parseFloat( lastUpdate.split('T')[0].split('-').join('') + lastUpdate.split('T')[1].split('Z')[0].split('.')[0].split(':').join('') ),

	      	// Created At
	      	createdAt = new Date(dataStream.createdAt).toISOString(),
	      	createdAtNumber = parseFloat( createdAt.split('T')[0].split('-').join('') + createdAt.split('T')[1].split('Z')[0].split('.')[0].split(':').join('') );

	      // If lastUpdate > createAt set new date in sidebarInfo
	    	if( lastUpdateNumber > createdAtNumber ){

	    		lastUpdate = new Date(response.fTimestamp);

	        var day = lastUpdate.getDate() < 10 ? '0' + lastUpdate.getDate() : lastUpdate.getDate();
	        var month = lastUpdate.getMonth() + 1;
	        switch (month){
						case 1:
						  month = gettext('DATE-MONTH-1');
						  break;
						case 2:
						  month = gettext('DATE-MONTH-2');
						  break;
						case 3:
						  month = gettext('DATE-MONTH-3');
						  break;
						case 4:
						  month = gettext('DATE-MONTH-4');
						  break;
						case 5:
						  month = gettext('DATE-MONTH-5');
						  break;
						case 6:
						  month = gettext('DATE-MONTH-6');
						  break;
						case 7:
						  month = gettext('DATE-MONTH-7');
						  break;
						case 8:
						  month = gettext('DATE-MONTH-8');
						  break;
						case 9:
						  month = gettext('DATE-MONTH-9');
						  break;
						case 10:
						  month = gettext('DATE-MONTH-10');
						  break;
						case 11:
						  month = gettext('DATE-MONTH-11');
						  break;
						case 12:
						  month = gettext('DATE-MONTH-12');
						  break;
					}
	        var year = lastUpdate.getFullYear();
	        var hours = lastUpdate.getHours();
	        var minutes = lastUpdate.getMinutes();
	        var meridiem = 'AM';
	        if (hours > 12) {
	            hours = hours - 12;
	            hours = hours < 10 ? '0' + hours : hours;
	            meridiem = 'PM';
	        }
	        var lastUpdateStr = month + ' ' + day + ', ' + year + ', ' + hours + ':' + minutes + ' ' + meridiem;

	        $('#id_lastUpdate').html(lastUpdateStr).addClass('updated');

	    	}

	    }

    }
    
	},

  onPivotComponentButtonClicked: function(event){
	  
		var dataStream = this.options.dataStream;

  	// If Pivot Component exists in model
    if( dataStream.attributes.pivotTableLicense ){ 

    	// If it is not created, init Pivot Component
	    if( this.pivot == null ){
	    	this.pivot = new pivotDataStreamView({model: new pivotDataStream(), dataStream: dataStream});
	    }

	    // Toggle Pivot Component
	    this.togglePivotComponent(event);

	  }

  },
  
	togglePivotComponent: function(event){
		var button = event.currentTarget;

    if( $(button).hasClass('active') ){

    	this.pivot.hide();
		  $('#id_datastreamResult').show();
		  $('.dataTable').removeClass('pivotEnabled');
		  $('#id_refreshButton, .dataTable header h1 span').removeClass('isDisabled');
		  $(button).removeClass('active');

    }else{

    	this.pivot.show();
      $('#id_datastreamResult').hide();
      $('.dataTable').addClass('pivotEnabled');
      $('#id_refreshButton, .dataTable header h1 span').addClass('isDisabled');
      $(button).addClass('active');

      // Set Pivot Component Height
      var self = this;

      $(document).ready(function(){

        var otherHeights = 
          parseFloat( $('.dataTable header').height() ) 
          + parseFloat( $('.dataTable header').css('padding-top').split('px')[0] )
          + parseFloat( $('.dataTable header').css('padding-bottom').split('px')[0] ) 
          + parseFloat( $('.dataTable header').css('border-bottom-width').split('px')[0] )
          + 2;// Fix to perfection;

        self.setHeights( '#'+self.pivot.$el.attr('id'), otherHeights );

      });

    } 
	}

});
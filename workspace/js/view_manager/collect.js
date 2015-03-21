var Collect = Backbone.Model.extend({
	defaults : {
		step : null,
		implType : '',
		$EndPoint : null,
		$WebForm : null,
		$StartButton : null,
		webservice_args : ''
	},
	initialize : function(){

	},
	onStartWebserviceCollect : function(args){
		this.attributes.webservice_args = args;
		this.loadDataSource();
	},
	onStartWebCollect : function(pEndpoint){
		//this.checkMimeType();
		this.loadDataSource();
	},
	checkMimeType : function(){
		var lUrl  = '/streams/check_source_url';
		var lData = "url="+ $.URLEncode(CreationManager.attributes.endPoint);
        
	    $.ajax({ url: lUrl,
		            data:lData,
		            dataType: 'json',
		            success: _.bind(this.onCheckSourceUrlSuccess, this),
					error: function(pResponse){
					}
	            });
	},
	onCheckSourceUrlSuccess : function(pResponse){
		this.attributes.step.attributes.endPoint = pResponse.url;
		this.setImplementationTypeByMimeType(pResponse.mimetype);
		
		this.loadDataSource();
	},
	setImplementationTypeByMimeType : function(pMimeType){
		var lImplType = '';
		pMimeType = pMimeType.split(";")[0];
		switch(pMimeType) {
			case "application/vnd.ms-xpsdocument":
				lImplType = "06";
				break;
			case "application/vnd.ms-excel":
				lImplType = "04";
				break;
			case "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet":
				lImplType = "04";
				break;
			case "application/vnd.oasis.opendocument.text":
				lImplType = "07";
				break;
			case "application/vnd.oasis.opendocument.text-web":
				lImplType = "07";
				break;
			case "application/vnd.oasis.opendocument.spreadsheet":
				lImplType = "09";
				break;
			case "application/msword":
				lImplType = "06";
				break;
			case "text/html":
				lImplType = "00";
				break;
			case "text/csv":
				lImplType = "10";
				break;
			case "text/x-comma-separated-values":
				lImplType = "10";
				break;
			case "text/plain":
				lImplType = "10";
				break;
			case "application/octet-stream" :
				lImplType = "10";
				break;
			case "application/pdf" :
				lImplType = "05";
				break;
			case "application/vnd.google-earth.kml+xml" :
				lImplType = "11";
				break;
			default:
				lImplType = '00';
				break;
		}

		this.attributes.implType = lImplType;
	},
	loadDataSource: function(){
		var lUrl  = '/datasets/action_load'
		var lData = "dataset_revision_id=" + $('#id_datastream-dataset_revision_id').val()
				+ '&limit=100'
				+ this.attributes.webservice_args;

	    $.ajax({ url: lUrl
	            , type:'GET'
	            , data:lData
	            , dataType: 'html'
	            , success: _.bind(this.onSuccessDataSourceLoaded, this)
	            , error: _.bind(this.onErrorDataSourceLoaded, this)
				, cache: false
	            }
	    );
	},
	onSuccessDataSourceLoaded: function(pData){
		var att = this.attributes;
		
		CreationManager.attributes.dataSource = pData;
		att.step.newInit();
	},
	onErrorDataSourceLoaded : function(jqXHR, textStatus, errorThrown){
		var att = this.attributes;
		console.log(att);
		if (jqXHR.status != "") {
			jQuery.TwitterMessage({type: 'error',message: gettext( "COLLECT-LOADURL-ERROR" ) });
			CreationManager.attributes.dataSource = "";
			att.step.newInit();
		}
	},
	reset : function(){
		
	}
});
var EmbedCodeOverlay = Backbone.Model.extend({
    defaults: {
        $OverlayContainer : null,
    },
    initialize : function(){
        $('#id_embedCode').overlay({
                                    top: 'center'
                                  , left: 'center'
                                    , mask: {
                                          color: '#000'
                                        , loadSpeed: 200
                                        , opacity: 0.5
                                        , zIndex: 99999
                                    }
                                    , load:false
                              });
        
        $('#id_embedHeadersRows', $('#id_embed_datastream_container')).change(_.bind(this.onChangeDisplaySize, this));
        $('#id_embedWidth', $('#id_embed_datastream_container')).change(_.bind(this.onChangeDisplaySize, this));
        $('#id_embedHeight', $('#id_embed_datastream_container')).change(_.bind(this.onChangeDisplaySize, this));
        $('#id_embedWidth', $('#id_embed_chart_container')).change(_.bind(this.onChangeDisplaySize, this));
        $('#id_embedHeight', $('#id_embed_chart_container')).change(_.bind(this.onChangeDisplaySize, this));
    },
    onChangeDisplaySize : function(){
        $(this.get("$OverlayContainer")).trigger('embed:overlay:update');
    }
});

var EmbedCode = Backbone.Model.extend({
    defaults: {
		$OverlayContainer : null,
		codeTemplate : '',
		$TextArea : null,
		defaultWidth : 400,
		defaultHeight : 175,
        $data : null
	},
	initialize : function(){
		this.initTemplateCode();
	},
	getContainer : function(){

	},
	getData : function(){

	},
	onChangeDisplaySize : function(event){
		this.updateTemplateCode();
	},
	updateTemplateCode : function(){
		var embedCode = this.get("codeTemplate")(this.getData());
		this.get("$TextArea").val(embedCode).focus(function(){ $(this).select(); });
	},
	beforeDisplay : function(){
		this.get("$WidthInput").val(this.get("defaultWidth"));
		this.get("$HeightInput").val(this.get("defaultHeight"));
        this.updateTemplateCode();
	},
	display :  function(){
		this.beforeDisplay();
		this.get("$OverlayContainer").data('overlay').load();
	},
	close : function(){
		this.get("$OverlayContainer").data('overlay').close();
	}
});

var EmbedCodeDatastream = EmbedCode.extend({
    defaults: {
        $DatastreamContainer : null,
        $HeadersRowsInput : null,
        $ColumnsInput : null
    },
    initialize : function(){
        EmbedCode.prototype.initialize.call(this);
        _.defaults(this.attributes, EmbedCode.prototype.defaults);
        this.initOverlay();
    },
    initOverlay : function(){
        this.set({"$TextArea": $('#id_embedDatastreamTextarea', this.get("$DatastreamContainer"))});
        this.set({"$WidthInput" : $('#id_embedWidth', this.get("$DatastreamContainer"))});
        this.set({"$HeightInput" : $('#id_embedHeight', this.get("$DatastreamContainer"))});
        this.set({"$HeadersRowsInput" : $('#id_embedHeadersRows', this.get("$DatastreamContainer"))});
        
        this.get("$WidthInput").val(this.get("defaultWidth"));
        this.get("$HeightInput").val(this.get("defaultHeight"));   

        $(this.get("$OverlayContainer")).bind('embed:overlay:update', _.bind(this.onChangeDisplaySize, this));
    },
    initTemplateCode : function(){
        _.templateSettings = {
            interpolate : /\{\{(.+?)\}\}/g
        };

        var template = '<iframe title="{{title}}" width="{{width}}" height="{{height}}" src="{{url}}" frameborder="0" style="border:1px solid #E2E0E0;padding:0;margin:0;"></iframe>'
                + '<p style="padding:3px 0 15px 0;margin:0;font:11px arial, helvetica, sans-serif;color:#999;">' + gettext( "APP-POWEREDBY-TEXT" ) + ' <a href="' + Configuration.embedPoweredBy[0] + '" title="' + Configuration.embedPoweredBy[1] +'" style="color:#0862A2;">' + Configuration.embedPoweredBy[1] + '</a></p>';
        this.set({'codeTemplate' : _.template(template) });
    },
    getContainer : function(){
        this.attributes.$DatastreamContainer = target.parents('[id*=id_dashboard_dataservice_container_]');
    },
    getData : function(){
        var att = this.attributes;
        var lTitle       = att.$data.data('dataservice_title');
        var lEmbedUrl    = att.$data.data('dataservice_embed_url');
        var lHeight      = this.get("$HeightInput").val();
        var lWidth       = this.get("$WidthInput").val();
        var lHeadersRows = this.get("$HeadersRowsInput").val();
        var lFixedColumn = this.get("$ColumnsInput").val();

        lEmbedUrl        = lEmbedUrl.replace(/header_row=\d*/, 'header_row=' + lHeadersRows);
        lEmbedUrl        = lEmbedUrl.replace(/fixed_column=\d*/, 'fixed_column=' + lFixedColumn);

        return {
            title: lTitle 
            , width: lWidth
            , height: lHeight
            , url: lEmbedUrl
        };
    },
    display :  function(){
        $('#id_embed_datastream_container').css('display', '')
        EmbedCode.prototype.display.call(this);
    }
});

var EmbedCodeCharts = EmbedCode.extend({
    defaults: {
		$ChartContainer : null
	},
	initialize : function(){
		EmbedCode.prototype.initialize.call(this);
		_.defaults(this.attributes, EmbedCode.prototype.defaults);
        this.initOverlay();
	},
    initOverlay : function(){
        this.set({"$TextArea": $('#id_embedTextarea', this.get("$ChartContainer"))});
        this.set({"$WidthInput" : $('#id_embedWidth', this.get("$ChartContainer"))});
        this.set({"$HeightInput" : $('#id_embedHeight', this.get("$ChartContainer"))});
        
        this.get("$WidthInput").val(this.get("defaultWidth"));
        this.get("$HeightInput").val(this.get("defaultHeight"));   

        $(this.get("$OverlayContainer")).bind('embed:overlay:update', _.bind(this.onChangeDisplaySize, this));
    },
	initTemplateCode : function(){
		_.templateSettings = {
            interpolate : /\{\{(.+?)\}\}/g
        };

		var template = '<iframe title="{{title}}" width="{{width}}" height="{{height}}" src="{{url}}" frameborder="0" style="border:1px solid #E2E0E0;padding:0;margin:0;"></iframe>'
                + '<p style="padding:3px 0 15px 0;margin:0;font:11px arial, helvetica, sans-serif;color:#999;">' + gettext( "APP-POWEREDBY-TEXT" ) + ' <a href="' + Configuration.embedPoweredBy[0] + '" title="' + Configuration.embedPoweredBy[1] + '" style="color:#0862A2;">' + Configuration.embedPoweredBy[1] + '</a></p>';
        this.set({'codeTemplate' : _.template(template) });
	},
	getContainer : function(target){
		this.attributes.$ChartContainer = target.parents('[id*=id_dashboard_dataservice_container_]');
	},
	getData : function(){
		var att 		 = this.attributes;
		var lSovId       = att.$data.data('sov_id');
        var lTitle       = att.$data.data('dataservice_title');
        var lEmbedUrl    = att.$data.data('dataservice_embed_url');
		var lEndPoint    = att.$data.data('dataservice_end_point');
        var lWidth       = (att.$WidthInput.val() != "") ? att.$WidthInput.val() : att.defaultWidth;
        var lHeight      = (att.$HeightInput.val() != "") ? att.$HeightInput.val(): att.defaultHeight;
		var lBaseUri	 = att.$ChartContainer.data('base_uri');
		var lChartHeight = 0;

		if(lHeight - 60 < 0 ){
			lChartHeight = lHeight;
		}else{
			lChartHeight = lHeight - 60;
		}
		
		lEmbedUrl        = lEmbedUrl.replace(/width=\d*/, 'width=' + lWidth)
		lEmbedUrl        = lEmbedUrl.replace(/height=\d*/, 'height=' + lChartHeight)

        //lEmbedUrl = lBaseUri + "/portal/Charts/actionEmbed?sov_id=" + lSovId + lEndPoint + "&width=" + lWidth+ "&height=" + lChartHeight;
		
		return {
            title: lTitle 
            , width: lWidth
            , height: lHeight
            , url: lEmbedUrl
        };
	},
    display :  function(){
        $('#id_embed_chart_container').css('display', '')
        EmbedCode.prototype.display.call(this);
    },
    onMenuOptionClick : function(event){
        this.getContainer($(event.target));
        this.display();
    }
});

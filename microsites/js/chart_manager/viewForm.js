var fUserNick;
var fDataServiceId;
var $fDashboards;
var $fDataService;
var $fDataServiceContainer;
var $fBottomActions;
var $fToolBar;

$(document).ready(function(){

    $fDataServiceContainer              = $("#id_dataStreamContainer");
    $fBottomActions                     = $(".bottomActions");
    $fToolBar                           = $("[id*=id_dataservice_toolbar_]");
    fDataServiceId                      = $fDataServiceContainer.data('dataservice_id');
    fUserNick                           = $fDataServiceContainer.data('user_nick');
    $fDataService                       = $fDataServiceContainer.find('#id_datastreamResult');
    $fEditDataServiceCommentsContainer  = $("#id_edit_dataservice_comments_container");

    ajaxManager.init();
    initDataServicePanel();

    $('#id_dataserviceTagsViewAllButton').tooltip({events: {def:'click, mouseleave', tooltip:'mouseenter'}
                                                    , position: "bottom center"
                                                    , offset: [10, -70]
                                                    , relative: "true",
                                                    onShow : function(){
                                                        var lOffset = $('#id_dataserviceTagsViewAllButton').offset()
                                                        var lTop = lOffset.top + 13;
                                                        var lLeft = lOffset.left - 143;

                                                        $('.ao-tag-tooltip').css({'top' : lTop, 'left' : lLeft, 'position' : 'absolute'})
                                                    }
                                                    , onBeforeShow : function(){
                                                        var a = $('.ao-tag-tooltip').detach();
                                                        $('body').append(a);
                                                    },
                                                    onBeforeHide : function(){
                                                        var a = $('.ao-tag-tooltip').detach();
                                                        $('.tagsPagination').append(a);
                                                    }
                                                });
    
    window.embedCodeOverlay = new EmbedCodeOverlay({'$OverlayContainer' : $('#id_embedCode')});
    
   	window.embedChartCode = new EmbedCodeCharts({'$OverlayContainer' : $('#id_embedCode'), '$ChartContainer' : $('#id_embed_chart_container'), '$data' : $('#id_dataStreamContainer')});
   	$('#id_addEmbedDataServiceButton_').click(_.bind(embedChartCode.display, embedChartCode));

    
   //init stat chart
    window.statChart = new VisualizationStats({'$Container' : $('#id_statChart'), 'id' : $("#id_dataStreamContainer").data('sov_id')});
});

function initDataServicePanel(){

    var lActionsMenu = new ActionsMenu();

    //TODO change permalink
    var lUrl        = $fDataServiceContainer.data("permalink");
    var lName       = $fDataServiceContainer.data('dataservice_title');

    if ($('.sharingDisabled').size() == 0) {
        var lInputShareBox = new InputShareBox({
            '$Container': $('.shareBox .share_url_input')
            , 'shortUrl': lUrl
            , 'longUrl': lUrl
        });

        var lTwitterShareBox = new TwitterShareBox({
            '$Container': $('.shareBox li.twitter iframe')
            , 'shortUrl': lUrl
            , 'longUrl': lUrl
            , 'title': lName
        });

        var lFacebookShareBox = new FacebookShareBox({
            '$Container': $('.shareBox li.facebook iframe')
            , 'shortUrl': lUrl
            , 'longUrl': lUrl
        });

        var lGooglePlusShareBox = new GooglePlusShareBox({
            '$Container': $('.shareBox li.google div')
            , 'shortUrl': lUrl
            , 'longUrl': lUrl
        });

        var lLinkedinShareBox = new LinkedinShareBox({
            '$Container': $('.shareBox li.linkedin iframe')
            , 'shortUrl': lUrl
            , 'longUrl': lUrl
        });

        lShareBoxes = new ShareBoxes();
        lShareBoxes.add(lInputShareBox);
        lShareBoxes.add(lTwitterShareBox);
        lShareBoxes.add(lFacebookShareBox);
        lShareBoxes.add(lGooglePlusShareBox);
        lShareBoxes.add(lLinkedinShareBox);

        if (typeof(BitlyClient) != 'undefined') {
            BitlyClient.shorten(lUrl, 'onSuccessUrlShortened');
        }

    }

    var lId         = $fDataServiceContainer.data("dataservice_id");
    startWaitMessage($fDataService);
    var lEndPoint   = $fDataServiceContainer.data("dataservice_end_point");

    $fToolBar.show();
    $fBottomActions.show();
}

function startWaitMessage(pHTMLElement){
    var lHtml = '<table class="Loading">';

    var lId = 1;
    lHtml = lHtml + '<tr><td><a href="javascript:;" onclick="ajaxManager.kill(\'p'+ lId.toString()+'\');" title="' + gettext( "DS-STOP-TITLE" ) + '"><span>' + gettext( "DS-STOP-TEXT" ) + '</span></a></td></tr>';

    pHTMLElement.html(lHtml);
}

function onSuccessUrlShortened(pData){
    var lResult;
    for (var r in pData.results) {
        lResult = pData.results[r];
        lResult['longUrl'] = r;
      break;
    }

    var lShortUrl = lResult['shortUrl'];
    var lLongUrl = lResult['longUrl'];
    if (lShortUrl) {
        $fDataServiceContainer.data("short_url", lShortUrl);
        lShareBoxes.redisplay(lShortUrl, lLongUrl);
    }
}

var VisualizationStats = Backbone.Model.extend({
    defaults: {
        $Container : null,
        data : '',
        id : ''
    },
    initialize: function(){
        this.getStatistics();
    },
    getStatistics : function(){
        var lUrl  = '/visualizations/get_last_30_days_visualization/'+ this.attributes.id;
        
        //TODO add loading gif
        
        $.ajax({ url: lUrl,
                    dataType: 'json',
                    context : this,
                    success: this.parseData,
                    error: function(pResponse){
                        // do nothing if error, dont show chart
                    }
                });
    },
    parseData : function(pResponse){
        var _this  = this;
        var att     = _this.attributes;
        var data    = {};
        data.rows   = [];
        data.cols   = [];
        var lData;

        //setting headers for line chart
        for (var i = 0; i <= 1; i++) {
            var lCol = {};
            lCol.id = i + '_' + '';
            lCol.label = '';
            if(i == 1){
                var lHeader = '';
                lCol.id = i + '_' + lHeader;
                lCol.label = lHeader;
            }
            if (i == 0) {
                lCol.type = 'string';
            }
            else {
                lCol.type = 'number';
            }
            data.cols.push(lCol);
        }
        for (var i = 1; i < pResponse.chart.length; i++) {
            lData = { c: [] };
            var lHeader;
            //var lDate = pResponse[i].date.split("-");
            lHeader = { v: '' };
            lData.c.push(lHeader);
            var stat = pResponse.chart[i][1];
            var lValue = { v: stat };
            lData.c.push(lValue);
            data.rows.push(lData);
        }
        
        att.data = new google.visualization.DataTable(data);
        this.render();
    },
    render : function(){
        var att = this.attributes;
        var lProps = {
            title: '',
            width: 270, height: 100 ,
            hAxis: {title: ''},
            vAxis: {title: '', format:'#'},
            legend : 'none'
           };
           
        var chart = new google.visualization.LineChart(att.$Container[0]);
        chart.draw(this.attributes.data, lProps);
    }
});
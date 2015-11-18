var Step = Backbone.Model.extend({

    defaults : {
        stepStarted : false,
        reset : false,
        $Container : null,
        $NextButton : null,
        $PreviousButton : null,
    },
    initialize : function(){
        this.resizeContainer();
    },
    init : function(){
    },
    start : function(){
        this.attributes.$Container.show();
        this.attributes.stepStarted = true;
    },
    stop : function(){
        this.attributes.$Container.hide();
    },
    onPrevStepButtonClicked : function(){
        CreationManager.goToPrevStep();
    },
    onNextStepButtonClicked : function(){
        CreationManager.goToNextStep();
    },
    restart : function(){
        this.reset();
        this.start();
    },
    reset : function(){
        this.attributes.stepStarted = false;
    },
    // Calculate height of .bigLoader to make it cover all the layout and resizable
    resizeContainer: function(){
        $(window).resize(function(){
            var windowHeight;
            if( $(window).height() < 600){
                // Set window height minimum value to 600
                windowHeight = 600;
            }else{
                windowHeight = $(window).height();
            }
            var sectionContentHeight =
                windowHeight
                - $('.header').height()
                - parseInt($('.header').css('border-top-width').split('px')[0])
                - parseInt($('.header').css('border-bottom-width').split('px')[0])
                - $('.main-section .section-title').height()
                - $('.footer').height()
                - 3; // 3 rounds up the number, don't know why.
            $('.main-section .section-content .bigLoader').css('height', sectionContentHeight+'px');
        }).resize();
    },
});

var Step0 = Step.extend({
    defaults : {
        $DataSourceContainer     : null,
        $SelectedTable             : null,
        selectedTable             : 0,
        $SelectableTables         : null,
        webCollect                : null,
    },
    initialize : function(){
        Step.prototype.initialize.call(this);
        _.defaults(this.attributes, Step.prototype.defaults);
    },
    init : function(){
        var att = this.attributes;
        att.reset = true;
        att.$Container                = $('#id_step0_container');
        att.$NextButton             = $('#id_step0NextButton', att.$Container).click(_.bind(this.onNextStepButtonClicked, this));

        if (CreationManager.attributes.typeCollect == "0") {
            att.$DataSourceContainer     = $('#id_dataSource_div', att.$Container);
            $('#id_dataSource_container', att.$Container).hide();
        }else{
            att.$DataSourceContainer     = $('#id_dataSource_container', att.$Container).contents();
        }

        $('#id_goToStep0Button').click(function(){
            window.location.replace('/dataviews/');
        });
        $('#id_step0CancelButton').click(function(){
            window.location.replace('/dataviews/');
        });

        if(att.webCollect == null){
            att.webCollect     = new Collect({'step' : this});
        }

        if(CreationManager.attributes.typeCollect != "2"){
            att.webCollect.onStartWebCollect(CreationManager.attributes.endPoint);
        }else{
            $('#id_next_args, #id_next_args_top').click(_.bind(this.loadWebserviceData, this));
            $('#id_cancel_top').click(function(){
                window.location.replace('/dataviews/');
            });
            $('#id_steps_navbar').removeClass('stepsNavbar1').addClass('stepsNavbar0');
            $('#id_loading').hide();
            $('#id_tables_container').hide();
            this.loadWebserviceArgs();
            $('#id_webservice_args').show();
        }
    },
    loadWebserviceArgs : function(){
        var xml = $('#id_impl_details').val();
        var inputs = '';
        var isEditable = false;
        var $args = $($.parseXML(xml)).find('args > *');
        $args.each(function(index){
            var name = this.nodeName;
            var element = $(this);

            console.log(element.attr('editable'));

            console.log(typeof element.attr('editable'));


            var html = '<div class="webservice_args row clearfix"><label for="param'+index+'">'+name+'</label><div class="formErrorMessageContainer"><input value="'+element.text()+'" ';
            if(typeof element.attr('editable') != undefined && element.attr('editable') != "False"){
                console.log('log true')
                isEditable = true;
                html +=' data-edit="true" ';
            }else{
                console.log('log true')
                html +=' data-edit="false" readonly="readonly" ';
            }
            html += ' id="param'+index+'" type="text"/></div></div>';
            inputs += html

        });

        $('#id_parameters_container').append(inputs);

        if(!isEditable){
            $('#id_webservice_args').hide();
            this.loadWebserviceData();
        }
    },
    loadWebserviceData : function(){
        $('#id_steps_navbar').removeClass('stepsNavbar0').addClass('stepsNavbar1');
        $('#id_loading').show();
        var queryString = {};
        $('.webservice_args').each(function(i){
            var name = $(this).find('label').text();
            var value = $(this).find('input').val();
            var edit = $(this).find('input').attr('data-edit');
            if(edit == "true"){
                queryString[name] = value;
            }
        });

        $('#id_webservice_args').hide();
        this.attributes.webCollect.onStartWebserviceCollect(queryString);

        var inputs = '';
        var editable = false;
        $('.webservice_args').each(function(i){
            var name = $(this).find('label').text();
            var value = $(this).find('input').val();
            var isEditable = $(this).find('input').attr('data-edit');
            if(isEditable == "true"){
                editable = true;
                inputs += '<div class="paramBorder webservice_args_editable"><div class="row clearfix paramOriginalName"><label>'+gettext( "WEBSERVICE-ORIGINALARG-TEXT" )+':</label><p class="originalArg">'+name+'</p></div><div class="row clearfix"><label for="paramName'+i+'">'+gettext( "APP-NAME-TEXT" )+':</label><div class="formErrorMessageContainer"><input type="text" value="'+name+'" id="paramName'+i+'"/></div></div><div class="row clearfix"><label for="paramValue'+i+'">'+gettext( "APP-VALUE-TEXT" )+':</label><div class="formErrorMessageContainer"><input type="text" data-edit="true" value="'+value+'" id="paramValue'+i+'"/></div></div></div>';
            }else{
                inputs += '<div class="paramBorder webservice_args_noneditable"><div class="row clearfix paramOriginalName"><label>'+gettext( "WEBSERVICE-ORIGINALARG-TEXT" )+':</label><p class="originalArg">'+name+'</p></div><div class="row clearfix"><label for="paramName'+i+'">'+gettext( "APP-NAME-TEXT" )+':</label><div class="formErrorMessageContainer"><input type="text" value="'+name+'" id="paramName'+i+'" disabled="disabled"/></div></div><div class="row clearfix"><label for="paramValue'+i+'">'+gettext( "APP-VALUE-TEXT" )+':</label><div class="formErrorMessageContainer"><input type="text" data-edit="true" value="'+value+'" id="paramValue'+i+'" disabled="disabled"/></div></div></div>';
            }
        });

        $('#id_args_container').append(inputs);
        if(editable){
            $('#id_webservice_container').show();
        }
    },
    start : function(){
        Step.prototype.start.call(this);
        //window.location.hash = "step=0";
        isStep1 = false;
    },
    newInit : function(){
        $('#id_loading').hide();
        this.initDataSource();
        $('#id_title_tables_container').show();
        $('#id_webservice_args').hide();
        if(this.attributes.$SelectableTables.size() != 0 ){
            $('#id_noTables_container').hide();
            $('#id_noDataHeader').hide();
            $('#id_dataHeader').show();
            $('#id_step0PrevButton').css('margin-top',0);
            $('#id_step0NextButton').show();
            $('#id_step0CancelButton').show();
            $('#id_tables_container').show();

            this.setHeader();

            if(CreationManager.attributes.is_update_selection){
                this.loadDatastreamData();
            }
        }
        else{
            $('body').addClass('collapsedHeader');
            $('#id_tables_container').hide();
            $('#id_noTables_container').show();
            $('#id_dataHeader').hide();
            $('#id_step0PrevButton').css('margin-top','5px');
            $('#id_step0NextButton').hide();
            $('#id_step0CancelButton').hide();
            $('#id_noDataHeader').show();

            $('body').removeClass('fixedBar');
            $('.header').removeClass('fixedBar');
            $('.sectionTitleContainer').removeClass('fixedBar');
            $('.collapsedBar').removeClass('fixedBar');
            $('.main-section').find('.context-menu').hide();
        }
    },
    loadDatastreamData : function(){
        this.loadInfo();
        this.loadFilters();
        this.loadFunctions();
        this.loadAliases();
        this.loadHeaders();
        this.loadSelection();
    },
    loadInfo : function(){
        this.initSources();
        this.initTags();
    },
    initSources : function(){
        var initialSources = [];
        $('#id_source_container [id*=-name]').each(_.bind(function(pIndex, pElement){
            var source = {};
            source.name = $.trim($(pElement).val().replace(/\W/g, ' '));
            source.url = $.trim($('#id_sources-'+pIndex+'-url').val());
            $(pElement).remove();
            $('#id_sources-'+pIndex+'-url').remove();

            initialSources.push(source);
        }, this));

        $('#id_sourceNameSuggest').taggingSources({
            source: '/rest/sources.json'
            , sourceContainer : "#id_source_container"
            , minLength: 3
            , sources: initialSources
        });
    },
    initTags : function(){
        var initialTtags = [];
        $('#id_tags_container .tagsContent').find('[id*=id_tags]').each(_.bind(function(pIndex, pElement){
            var lTag = $.trim($(pElement).val().replace(/\W/g, ' '));
            $(pElement).remove();
            initialTtags.push(lTag);
        }, this));

        $('#id_operation-tag').tagging({
            source: '/rest/tags.json'
            , minLength: 3
            , tags: initialTtags
        });
    },
    loadSelection : function(){
        var $SelectionXml = $($.parseXML( CreationManager.attributes.selectStatementXML ));
        var table = $SelectionXml.find('Table').text();

        this.attributes.$SelectableTables.each(function(index){
            if($(this).attr('tableid') == table){
                $(this).trigger('click');
            }
        });

        CreationManager.attributes.$SelectedTable = this.attributes.$SelectedTable;
        step1.start();
        $('#id_enableAdvanceModeLink').trigger('click');

        var $Cols = $SelectionXml.find('Column');
        var $Rows = $SelectionXml.find('Filter');

        //all table selected
        if($Cols.size() == 1 && $Cols.eq(0).text() == '*' && $Rows.size() == 0){
            $('.ao-table-button').trigger('click')
        }

        //columns selected
        if($Cols.size() > 0 && $Cols.eq(0).text() != '*' && $Cols.eq(0).text().indexOf('column') != -1 && $Rows.size() == 0){
            $Cols.each(function(index){
                $('#'+$(this).text()).trigger('click');
            });
        }

        //rows selected
        if($Cols.size() == 1 && $Cols.eq(0).text() == '*' && $Rows.size() > 0){
            $Rows.find('Operand2').each(function(index){
                $('#'+$(this).text()).trigger('click');
            });
        }

        //intersecion selected
        if($Cols.size() > 0 && $Cols.eq(0).text() != '*' && $Cols.eq(0).text().indexOf('column') != -1 && $Rows.size() > 0){
            $Cols.each(function(index){
                $('#'+$(this).text()).trigger('click');
            });
            $Rows.find('Operand2').each(function(index){
                $('#'+$(this).text()).trigger('click');
            });
        }

        //cells selected
        if($Cols.size() > 1 && $Cols.eq(0).text() != '*'  && $Cols.eq(0).text().indexOf('cell') != -1 && $Rows.size() == 0){
            $Cols.each(function(index){
                $('#'+$(this).text()).trigger('click');
            });
        }
    },
    loadFilters : function(){

    },
    loadFunctions : function(){

    },
    loadAliases : function(){

    },
    loadHeaders : function(){

    },
    iframeOnLoad: function(){
        var currentfr = $('#id_dataSource_container');
        step0.resizeContainer();

        if(currentfr.height() <= 600){
            setTimeout("step0.iframeOnLoad()", 1000);
        }
    },
    resizeContainer: function(){
        $('#id_dataSource_container').contents().find('html').css('overflow','hidden');
        $('#id_dataSource_container').contents().find('body').css('overflow','hidden');

        var lIframeHeight = $('#id_dataSource_container').contents().find('html').height();

        $('#id_dataSource_container').contents().find('html').css('height', 'auto');
        $('#id_dataSource_container').contents().find('body').css('height', 'auto');

        if (lIframeHeight == 0) {
            if ($('#id_dataSource_container').contents().find('body > *:first-child').css('position') == "fixed" || $('#id_dataSource_container').contents().find('body > *:first-child').css('position') == "absolute") {
                $('#id_dataSource_container').contents().find('body > *:first-child').css('position', 'static');
                lIframeHeight = $('#id_dataSource_container').contents().find('html').height();
                if (lIframeHeight > 600) {
                    $('#id_tables_container').find('iframe').height(lIframeHeight);
                }else{
                    $('#id_tables_container').find('iframe').height(600);
                    $('#id_dataSource_container').contents().find('html').css('overflow', 'auto');
                    $('#id_dataSource_container').contents().find('body').css('overflow', 'auto');
                }
            }
        }else if(lIframeHeight > 600){
            $('#id_tables_container').find('iframe').height(lIframeHeight);
        }
        else {
            $('#id_tables_container').find('iframe').height(600);
            $('#id_dataSource_container').contents().find('html').css('overflow', 'auto');
            $('#id_dataSource_container').contents().find('body').css('overflow', 'auto');
        }

    },
    setHeader : function(){
        $('body').addClass('collapsedHeader');
        $('body').addClass('fixedBar');
        $('.header').addClass('fixedBar');
        $('.sectionTitleContainer').addClass('fixedBar');
        $('.collapsedBar').addClass('fixedBar');
        $('#uvTab').hide();
        //$('body').addClass('collapsedHeader');
    },
    initDataSource: function(){
        var att         = this.attributes;
        var lDataSource = CreationManager.attributes.dataSource;

        if (CreationManager.attributes.typeCollect == "0") {
            var lDocument     = att.$DataSourceContainer;
            lDocument.html(lDataSource);
        }else{
            var lDocument     = att.$DataSourceContainer[0];
            lDocument.open();
            lDocument.writeln(lDataSource);
            lDocument.close();

            att.$DataSourceContainer.contents().find('body').addClass('file')
        }

        att.$DataSourceContainer.find('a').click(function(e) {
                                                        e.preventDefault();
                                                        //do other stuff when a click happens
                                                    });

        att.$DataSourceContainer.find('input').each(function(){
            $(this).attr('disabled', 'disabled');
        });

        this.initSelectableTables();
    },
     initSelectableTables: function(){
        var att = this.attributes;
        att.$SelectableTables = att.$DataSourceContainer.find('table.ao-table-selectable, div.ao-div-selectable').click(_.bind(this.onTableSelected, this));

        att.$SelectableTables.filter(':hidden').each(function(i){
            var $lTable = $(this);
            $lTable.show().parents(':hidden').show();
        });

        att.$DataSourceContainer.find('body').css('visibility', '');

        att.$SelectableTables.each(function(i){
            var $lTable = $(this);
            if($lTable.width() == 0){
                $lTable.width("100%");
            }
            if($lTable.hasClass('ao-table-selectable')){
                $lTable.wrap('<div class="ao-border clearfix" style="float:left;clear:both;"></div>');
            }else{
                $lTable.wrap('<div class="ao-div-border" clearfix" style="float:left;clear:both;"></div>');
            }

        });

        att.selectedTable = 0;
    },
    onNextStepButtonClicked: function(){
        if(this.attributes.$SelectedTable != null){
            CreationManager.attributes.$SelectedTable = this.attributes.$SelectedTable;
            CreationManager.goToNextStep();
            $('html, body').animate({scrollTop:0}, 'slow');
        }
        else{
            jQuery.TwitterMessage( { type: 'warning', message : gettext( "OVREPAIR-TABLE-NOSELECTED" ) } );
        }
    },
    onTableSelected: function(pEvent){
        pEvent.stopPropagation();
        var att = this.attributes;
        var $lTable = $(pEvent.currentTarget);
        if ($lTable.hasClass('ao-table-selectable')) {
            CreationManager.attributes.tableType = 'table';
            $lTable.toggleClass('ao-table-selected');
            if ($lTable.hasClass('ao-table-selected')) {
                if (att.selectedTable > 0) {
                    $lTable.removeClass('ao-table-selected');
                    jQuery.TwitterMessage({type: 'warning', message: gettext( "COLLECT-TWOTABLES-ERROR" ) });
                }else{
                    $lTable.find('td,th').addClass('ao-table-selected');
                    att.$SelectedTable = $lTable;
                    att.selectedTable++;
                }
            }
            else {
                $lTable.find('td, th').removeClass('ao-table-selected');
                att.$SelectedTable = null;
                att.selectedTable--;
            }
        }

        if ($lTable.hasClass('ao-div-selectable')) {
            CreationManager.attributes.tableType = 'div';
            $lTable.toggleClass('ao-table-selected');
            if ($lTable.hasClass('ao-table-selected')) {
                if (att.selectedTable > 0) {
                    $lTable.removeClass('ao-table-selected');
                    jQuery.TwitterMessage({type: 'warning', message: gettext( "COLLECT-TWOTABLES-ERROR" ) });
                }else{
                    $lTable.find('div').addClass('ao-table-selected');
                    att.$SelectedTable = $lTable;
                    att.selectedTable++;
                }
            }
            else {
                $lTable.find('div').removeClass('ao-table-selected');
                att.$SelectedTable = null;
                att.selectedTable--;
            }
        }
    },
    reset: function(){
        Step.prototype.reset.call(this);
        var att = this.attributes;

        /*if(att.$SelectedTable != null){
            att.$SelectedTable.find('td, th').removeClass('ao-table-selected');
            att.$SelectedTable = null;
        }*/
        $('body').removeClass('collapsedHeader');
        $('body').removeClass('fixedBar');
        $('.header').removeClass('fixedBar');
        $('.sectionTitleContainer').removeClass('fixedBar');
        $('.collapsedBar').removeClass('fixedBar');
        $('.navigationControl').show();
        $('#uvTab').show();
    }
});

var Step1 = Step.extend({
    defaults : {
        $SelectedTableContainer : null
    },
    initialize : function(){
        Step.prototype.initialize.call(this);
        _.defaults(this.attributes, Step.prototype.defaults);
    },
    init : function(){
        var att = this.attributes;
        att.$Container                    = $('#id_step1_container');
        att.$NextButton                    = $('#id_step1NextButton', att.$Container).click(_.bind(this.onNextStepButtonClicked, this));
        att.$PreviousButton                = $('#id_step1PrevButton', att.$Container).click(_.bind(this.onPrevStepButtonClicked, this));
        att.$SelectedTableContainer        = $('#id_selectedTable_container', att.$Container);

        $('#id_goToStep1Button').click(function(){
            CreationManager.goToStep(0);
        });
        $('#id_step1CancelButton').click(function(){
            window.location.replace('/dataviews/');
        });

        $('#id_selection_tips').overlay({top: 'center'
                    , close: '#id_continueBtn1'
                    , left: 'center'
                    , mask: {
                            color: '#000'
                            , loadSpeed: 200
                            , opacity: 0.5
                            , zIndex: 99999
                    }
                    , closeOnClick: false
                    , closeOnEsc: false
                    , onClose : function(){
                        step1.onNextStepButtonClicked();
                    }
                });

        $('#id_empty_selection_tip').overlay({top: 'center'
                    , close: '#id_continueBtn2'
                    , left: 'center'
                    , mask: {
                            color: '#000'
                            , loadSpeed: 200
                            , opacity: 0.5
                            , zIndex: 99999
                    }
                    , closeOnClick: false
                    , closeOnEsc: false
                });


        window.sideBar = new SideBar({'$Container' : $('#id_sideBarContainer')});
    },
    start : function(){
        //window.location.hash = "step=1";

        isStep1 = true;

        if(!this.attributes.stepStarted){
            window.DataTableObj = new DataTableCreation({'$Table' : CreationManager.attributes.$SelectedTable , 'selectionClass' : ''});
            this.attributes.$SelectedTableContainer.append( DataTableObj.attributes.$Table ).show();
        }

        if(CreationManager.attributes.implType == "11"){
            window.DataTableObj.attributes.disableCellSelection = true;
            window.DataTableObj.attributes.disableColumnSelection = true;
            window.DataTableObj.attributes.$Table.customSelectable( "option", "disable", true);
        }

        Step.prototype.start.call(this);

        this.setHeader();
        this.setScrollBar();
        $('#id_collectSummaryPanel .toolbar li').hide()
    },
    setHeader : function(){
        $('body').addClass('collapsedHeader');
        $('body').addClass('fixedBar');
        $('.header').addClass('fixedBar');
        $('.sectionTitleContainer').addClass('fixedBar');
        $('.collapsedBar').addClass('fixedBar');
        $('#uvTab').show();
    },
    setScrollBar : function(){
        // var wHeight = $(window).height();
        // var fHeight = $('.footer').height();
        // //var rHeight = $('.ao-filter-row').height();
        // var pHeight = $('body.collapsedHeader.fixedBar').css('padding-top');
        // pHeight = pHeight.split('px');
        // pHeight = pHeight[0];
        // $('.dataTableInner, .step2 .expandedContainer .columns .CR').height(wHeight - pHeight - fHeight);
    },
    onNextStepButtonClicked: function(){
        if(DataTableObj.attributes.selectedCells == 0 && DataTableObj.attributes.selectedColumns == 0
            && DataTableObj.attributes.selectedRows == 0 && DataTableObj.attributes.$Table.hasClass('ao-table-selected') == false ){
                $('.ao-table-button').trigger('click')
        }
        $('div.ao-filter-tooltip').fadeOut('fast');

        if(DataTableObj.checkEmptySelection()){
            $('#id_empty_selection_tip').data('overlay').load();
        }
        else if(!this.selectionTips()){
            $('#id_selection_tips').data('overlay').load();
        }
        else{
            DataTableObj.checkSquareSelection();
            if(CreationManager.attributes.tableType == 'table'){
                this.generateTableKeys();
            }else if(CreationManager.attributes.tableType == 'div'){
                this.generateDivKeys();
            }
            window.xml = new XMLManager();
            var dataTable = DataTableObj.attributes;
            window.DsPublisher = new DataServicesPublisher({'xmlManager' : xml,
                '$Table' : dataTable.$Table,
                'selectedCells' : dataTable.selectedCells ,
                'selectedColumns' : dataTable.selectedColumns,
                'selectedRows' : dataTable.selectedRows,
                'tableKeys' : CreationManager.attributes.tableKeys ,
                'tableHeaders' : CreationManager.attributes.headers,
                'tableAliases' : CreationManager.attributes.aliases,
                'tableTotals' :CreationManager.attributes.totalsCols,
                'tableMavg' : CreationManager.attributes.mavgCols,
                'tableSum' : CreationManager.attributes.sumCols,
                'tableAvg' : CreationManager.attributes.avgCols,
                'mavgPeriod' : CreationManager.attributes.mavgPeriod
            });

            CreationManager.attributes.dataSourceXML             = xml.serializeNode(DsPublisher.createDataSourceXML());
            CreationManager.attributes.parametersQueryString     = this.serializeParameters();
            CreationManager.attributes.parametersPreview        = this.serializeParametersPreview();
            CreationManager.attributes.selectStatementXML         = xml.serializeNode(DsPublisher.createSelectStatementXML());

            CreationManager.goToNextStep();
        }

        $('html, body').animate({scrollTop:0}, 'slow');
    },
    serializeParameters : function(){
        var lData       = '';
        var lPosition   = 0;

        if(DataTableObj.attributes.selectedCells == 0 && DataTableObj.attributes.selectedRows == 0){

            $('th[id*=id_filter_]', DataTableObj.attributes.$Table).each(function(i){
                var $lFilter    = $(this);
                var $lTooltip   = $($lFilter.find('a[id*=id_addFilterButton_]').attr('rel'));

                var lName  = $lTooltip.find('input[id*=id_parameter-name_]').val();
                if(lName != ""){

                    var lToken = "=" + lName + "&";
                    if(lData.indexOf(lToken) < 0){
                        var lDescription = $lTooltip.find('input[id*=id_parameter-description_]').val();
                        var lDefault = $lTooltip.find('input[id*=id_parameterValue]').val();

                        lData = lData + 'parameters-' + lPosition + '-name=' + lName;
                        lData = lData + '&parameters-' + lPosition + '-position=' + lPosition;
                        lData = lData + '&parameters-' + lPosition + '-description=' + lDescription;
                        lData = lData + '&parameters-' + lPosition + '-default=' + lDefault;
                        lData = lData + '&';

                        var $lParameters = $lTooltip.find('input[id*=id_parameter-name_]');
                        for(var j = 0; j < $lParameters.length; j++){
                            var $lParameter     = $lParameters.eq(j);
                            var $lParent        = $lParameter.parents('div.ao-filter-tooltip');

                            $lParent.find('input[id*=id_parameter-position_]').val(lPosition);
                        }

                        lPosition++;
                    }
                }
            });
        }

        lData = lData + 'parameters-TOTAL_FORMS=' + lPosition
                        + '&parameters-INITIAL_FORMS=0';

       return lData;
    },
    serializeParametersPreview : function(){
        var lData       = '';
        var lPosition   = 0;

        if(DataTableObj.attributes.selectedCells == 0 && DataTableObj.attributes.selectedRows == 0){

            $('th[id*=id_filter_]', DataTableObj.attributes.$Table).each(function(i){

                var $lFilter    = $(this);
                var $lTooltip   = $($lFilter.find('a[id*=id_addFilterButton_]').attr('rel'));

                var lName  = $lTooltip.find('input[id*=id_parameter-name_]').val();
                var lValue = $lTooltip.find('input[id*=id_parameterValue_]').val();

                if(lName != "" && lValue != ""){
                    lData = lData + '&pArgument'+lPosition+'='+ lValue +'&pParameter'+lPosition+'=' + lName;
                    lPosition++;
                }
            });
        }

        return lData;
    },
    selectionTips : function(){
        var $lTable             = DataTableObj.attributes.$Table;
        var totalTD             = $lTable.find('td').not('.ao-no-select').length;
        var selectedCells         = $lTable.find('td.ao-cell-selected').not('.ao-no-select').length;
        var selectedRows         = $lTable.find('td.ao-row-selected').not('.ao-no-select').length;
        var selectedColumns     = $lTable.find('td.ao-column-selected').not('.ao-no-select').length;
        var selectedInterseccion = $lTable.find('.ao-row-selected.ao-column-selected').not('.ao-no-select').length;

        if(((totalTD == selectedCells || totalTD == selectedRows || totalTD == selectedColumns ) && selectedInterseccion == 0) || (totalTD == selectedInterseccion)){
            $lTable.find('td').addClass('ao-table-selected');
            $lTable.find('td, th').removeClass('ao-cell-selected ao-row-selected ao-column-selected');
            $lTable.find('tr').removeClass('ao-row-selected');
            $lTable.addClass('ao-table-selected')
            $lTable.find('.ao-table-button').addClass('ao-table-selected');
            $lTable.find('td').addClass('ao-table-selected');

            DataTableObj.attributes.selectedColumns     = 0;
            DataTableObj.attributes.selectedCells         = 0;
            DataTableObj.attributes.selectedRows         = 0;

            return false;
        }

        return true;
    },
    generateDivKeys : function(){
        var keys = [];
        var value = {};
        var $Table = step0.attributes.$SelectedTable;
        var lId = $Table.attr('id');
        var lClasses = $Table.attr('class').split(' ');

        if(lId != ""){
            value.cellId = 'id';
            value.text = lId;
            keys.push(value);
        }else if(lClasses.length > 0){
            for (var i = 0; i < lClasses.length; i++){
                var lClass = lClasses[i];
                if($('.'+lClass).size() == 1){
                    value.cellId = 'class';
                    value.text = lClass;
                    keys.push(value);
                    break;
                }
            };
        }

        CreationManager.attributes.tableKeys = keys;
    },
    generateTableKeys : function(){
        var keys             = [];
        var $Tables         = step0.attributes.$DataSourceContainer.find('table').not(step0.attributes.$SelectedTable);
        var $HeaderCells     = step0.attributes.$SelectedTable.find('th').not(step0.attributes.$SelectedTable.find('table'));
        var $RealHeaders = [];

        var lCurRow = -1;
        for (var i = 0; i < $HeaderCells.size(); i++) {
            var lRowIndex = $HeaderCells.eq(i).parent()[0].rowIndex;
            if(i == 0){
                lCurRow = lRowIndex;
            }
            if(lCurRow > 10){
                break;
            }
            if(lCurRow == lRowIndex){
                $RealHeaders.push($HeaderCells.eq(i));
            }
        }

        if($Tables.size() == 0){
            if ($RealHeaders.length > 0){
                var value = {};
                value.text = $.trim($RealHeaders[0].text());
                value.cellId = DataTableObj.attributes.$Table.find('.ao-th:contains("'+ value.text +'")').eq(0).attr('keyId');
                if(typeof value.cellId !== "undefined"){
                    if(value.text != ""){
                        keys.push(value);
                    }
                }
            }
        }

        if($Tables.size() > 0){
            for (var i = 0; i < $RealHeaders.length; i++) {
                var value = {};
                value.text = $.trim($RealHeaders[i].text());
                value.cellId = DataTableObj.attributes.$Table.find('.ao-th:contains("'+ value.text +'")').eq(0).attr('keyId');
                if (this.isKeyUnique($RealHeaders[i], $Tables)) {
                    if(typeof value.cellId !== "undefined"){
                        if (value.text != "") {
                            keys.push(value);
                        }
                    }
                    break;
                }
                else {
                    if(typeof value.cellId !== "undefined"){
                        if (value.text != "") {
                            keys.push(value);
                        }
                    }
                }
            }
        }

        if(keys.length == $RealHeaders.length){
            keys = [];
        }

        CreationManager.attributes.tableKeys = keys;
    },
    isKeyUnique : function(pKey, pTables){
        var curKeyValue     = $.trim(pKey.text()).toLowerCase();
        var curCellIndex     = pKey[0].cellIndex;
        var $CurrentRow     = this.getParentRow(pKey);
        var curRowIndex     = ($CurrentRow.is('tr')) ? $CurrentRow[0].rowIndex : -1;
        for (var i = 0; i < pTables.size(); i++){
            $HeaderCells = pTables.eq(i).find('th');
            if($HeaderCells.size() > 0){
                for (var j = 0; j < $HeaderCells.size(); j++) {
                    var keyValue     = $.trim($HeaderCells.eq(j).text()).toLowerCase();
                    var cellIndex     = $HeaderCells[j].cellIndex;
                    var $ParentRow     = this.getParentRow($HeaderCells.eq(j));
                    var rowIndex     = ($ParentRow.is('tr')) ? $ParentRow[0].rowIndex : -1;

                    if(cellIndex == curCellIndex && rowIndex == curRowIndex && keyValue == curKeyValue){
                        return false;
                    }
                }
            }
        };

        return true;
    },
    getParentRow : function(pCell){
        while(!pCell.is('tr') && !pCell.is('table')){
            pCell = pCell.parent();
        }
        if(pCell.is('tr')){
            return pCell;
        }else{
            return null;
        }
    },
    reset: function(){
        Step.prototype.reset.call(this);
        if(typeof DataTableObj !== "undefined" ){
            DataTableObj.reset();
            this.attributes.$SelectedTableContainer.hide().empty();
            sideBar.reset();
        }
    }
});

var Step2 = Step.extend({
    defaults : {
        $Form                 : null,
        $Title                 : null,
        $Description         : null,
        $Category             : null,
        $Tags                 : null,
        $NextBtnBottom        : null,
        $Status              : null,
        $Notes              :null,
        formQueryString     : ''
    },
    initialize : function(){
        Step.prototype.initialize.call(this);
        _.defaults(this.attributes, Step.prototype.defaults);
    },
    init : function(){
        var att = this.attributes;
        att.$Container            = $('#id_step2_container');
        att.$NextButton         = $('#id_step2NextButton', att.$Container).click(_.bind(this.onNextStepButtonClicked, this));
        att.$NextBtnBottom        = $('#id_step2NextButtonBottom', att.$Container).click(_.bind(this.onNextStepButtonClicked, this));
        att.$PreviousButton     = $('#id_step2PrevButton', att.$Container).click(_.bind(this.onPrevStepButtonClicked, this));

        att.$Form                = $('#id_dataStreamForm', att.$Container);
        att.$Title                = $('#id_title', att.$Container);
        att.$Category            = $('#id_category', att.$Container);
        att.$Description        = $('#id_description', att.$Container);
        att.$Tags                = $('#id_tags_containerCreation', att.$Container);
        att.$Status                = $('#id_status', att.$Container);
        att.$Notes               = $('#id_notes', att.$Container);

        this.initNotes();

        //att.$Category.find("option").eq(0).html( gettext( "APP-SELECT-TEXT" ) );

        $('#id_goToStep2Button').click(function(){
            CreationManager.goToStep(1);
        });
        $('#id_step2CancelButton').click(function(){
            window.location.replace('/dataviews/');
        });

        jQuery.validator.addMethod("equalFields", function(value, element){
            var lTitle = $.trim($('#id_title').val());
            var lDesc = $.trim($('#id_description').val());
            if( ( lTitle != '' && lDesc != '' ) && ( lTitle == lDesc ) ) {
                return lTitle != value && lDesc != value;
            }

            return true;
        }, gettext( "APP-TITSUBDES-NOTEQUALS" ) );

        this.attributes.$Form.validate({
            rules: {
              'title':  {'required'  : true
                                , 'maxlength' : 80
                                , 'regex'     : /.*[a-zA-Z0-9]+.*$/
                                ,'equalFields' : true
                               }
              , 'description': {'required':true,'maxlength': 140,'equalFields' : true}
              , 'status': {'required': true}
            }
            , messages: {
              'title': {regex: gettext( "DS-VALIDINPUT-TEXT" ), required: gettext ("VALIDATE-REQUIREDFIELD-TEXT")},
              'description': {required: gettext ("VALIDATE-REQUIREDFIELD-TEXT"), maxlength: gettext('VALIDATE-MAXLENGTH-TEXT-1') + ' 140 ' + gettext('VALIDATE-MAXLENGTH-TEXT-2')},
              'status': gettext ("VALIDATE-REQUIREDFIELD-TEXT")
            }
        });

        $('#id_displayAddSources').click(function(){
            $('#id_addMoreSources').slideToggle('fast');
            $('#id_source_url').val('');
        })
    },
    start : function(){
        Step.prototype.start.call(this);

        isStep1 = false;

        //window.location.hash = "step2";

        this.attributes.$Title.focus();

        if (CreationManager.attributes.is_update_selection == false) {
            var initialTags = [];
            var initialSources = suggestedSources;

            $('#id_operation-tag', this.attributes.$Container).tagging({
                source: '/rest/tags.json',
                minLength: 3,
                tags: initialTags
            });

            $('#id_sourceNameSuggest', this.attributes.$Container).taggingSources({
                source: '/rest/sources.json',
                sourceContainer: "#id_source_container",
                minLength: 3,
                sources: initialSources
            });

            CreationManager.attributes.is_update_selection = false;
        }

        if (CreationManager.attributes.typeCollect == "0") {
            $('.recomendedTags').hide();
        }

        this.setHeader();
    },
    setHeader : function(){
        $('body').addClass('collapsedHeader');
        $('body').removeClass('fixedBar');
        $('.header').removeClass('fixedBar');
        $('.sectionTitleContainer').removeClass('fixedBar');
        $('.collapsedBar').removeClass('fixedBar');
    },
    generateQueryStrings : function(){
        CreationManager.attributes.serviceQueryString         = this.serializeDatastreamForm();
        CreationManager.attributes.tagsQueryString             = this.serializeTagForm();
        CreationManager.attributes.metaData                     = this.serializeMetaData();
        CreationManager.attributes.parametersPreview        = step1.serializeParametersPreview();
        CreationManager.attributes.sourceQueryString        = this.serializeSourceForm();
    },
    initNotes: function(){
        new nicEditor({
            buttonList : ['bold','italic','underline','ul', 'ol', 'link', 'hr'],
            iconsPath: '/js_core/plugins/nicEdit/nicEditorIcons-2014.gif'
        }).panelInstance('id_notes');
    },
    serializeDatastreamForm : function(){
        
        var notes = "";
        if(
            $('.nicEdit-main').length > 0 &&
            // When notes initialice empty, nicEdit initialice with <br>, so we check if that is the case
            $('.nicEdit-main').html() != '<br>'
        ){
            notes = $('.nicEdit-main').html();
        }else{
            notes = $.trim( this.attributes.$Notes.val() );
        }

        return $.param({
            'csrfmiddlewaretoken' : csrfmiddlewaretoken,
            'dataset_revision_id' : $('#id_datastream-dataset_revision_id').val(),
            'title': this.attributes.$Title.val(),
            'description': this.attributes.$Description.val(),
            'category': this.attributes.$Category.val(),
            'select_statement': CreationManager.attributes.selectStatementXML,
            'rdf_template': CreationManager.attributes.rdfTemplate,
            'data_source': CreationManager.attributes.dataSourceXML,
            'end_point': CreationManager.attributes.endPoint,
            'status': this.attributes.$Status.val(),
            'notes': notes,
        });
    },
    serializeTagForm :  function(){
        var $lTags = $('#id_tag_container [id$=_name]', this.attributes.$Container);
        var lData = '';
        $lTags.each(function(i){
            var $lTag = $(this);
            lData = lData + 'tags-' + i + '-name=' + $.trim($lTag.text());
               lData = lData + '&';
        });

        lData = lData + 'tags-TOTAL_FORMS=' + $lTags.length;
        lData = lData + '&tags-INITIAL_FORMS=0';

        return lData;
    },
    serializeMetaData : function(){
        var lFields = $('[name*=cust-]', this.attributes.$Container);
        var lData = {};

        for (var i = 0; i < lFields.size(); i++){
            var lField = lFields.eq(i);
            lData[lField.attr('name')] = $.trim(lField.val());
        };

        return $.param(lData);
    },
    serializeSourceForm :  function(){
        var $lSources = $('#id_source_container .tag', this.attributes.$Container);
        var lData = '';

        $lSources.each(function(i){
            var $lSource = $(this).find('.tagTxt');
            lData = lData + 'sources-' + i + '-name=' + $.trim($lSource.text());
               lData = lData + '&';
            lData = lData + 'sources-' + i + '-url=' + $.URLEncode($lSource.attr('data'));
            lData = lData + '&';
        });

        lData = lData + 'sources-TOTAL_FORMS=' + $lSources.length;
        lData = lData + '&sources-INITIAL_FORMS=0';

        return lData;
    },
    onNextStepButtonClicked: function(){
        if(this.attributes.$Form.valid()){
            // set all tags as default if none selected
            if( $('#id_tag_container span').size() == 0 ){
                $('#id_recommendedTags a').trigger('click')
            }
            DataTableObj.reCalculateFilters();
            if(CreationManager.attributes.typeCollect == "2"){
                CreationManager.attributes.parametersQueryString = this.generateArgsToParams();
                this.generateMappingXML();
            }
            this.generateQueryStrings();
            CreationManager.goToNextStep();
            $('html, body').animate({scrollTop:0}, 'slow');
        }
        return false;
    },
    generateArgsToParams : function(){
        var lData       = '';
        var lPosition   = 0;

        if(DataTableObj.attributes.selectedCells == 0 && DataTableObj.attributes.selectedRows == 0){

            $('th[id*=id_filter_]', DataTableObj.attributes.$Table).each(function(i){
                var $lFilter    = $(this);
                var $lTooltip   = $($lFilter.find('a[id*=id_addFilterButton_]').attr('rel'));

                var lName  = $lTooltip.find('input[id*=id_parameter-name_]').val();
                if(lName != ""){

                    var lToken = "=" + lName + "&";
                    if(lData.indexOf(lToken) < 0){
                        var lDescription = $lTooltip.find('input[id*=id_parameter-description_]').val();
                        var lDefault = $lTooltip.find('input[id*=id_parameterValue_]').val();
                        lData = lData + 'parameters-' + lPosition + '-name=' + lName;
                        lData = lData + '&parameters-' + lPosition + '-position=' + lPosition;
                        lData = lData + '&parameters-' + lPosition + '-description=' + lDescription;
                        lData = lData + '&parameters-' + lPosition + '-default=' + lDefault;
                        lData = lData + '&';

                        var $lParameters = $lTooltip.find('input[id*=id_parameter-name_]');
                        for(var j = 0; j < $lParameters.length; j++){
                            var $lParameter     = $lParameters.eq(j);
                            var $lParent        = $lParameter.parents('div.ao-filter-tooltip');

                            $lParent.find('input[id*=id_parameter-position_]').val(lPosition);
                        }

                        lPosition++;
                    }
                }
            });
        }

        $('.webservice_args_editable').each(function(i){
            var elements = $(this).find('input');
            var name = elements.eq(0).val();
            var value = elements.eq(1).val();
            var lDescription = '';
            lData = lData + 'parameters-' + lPosition + '-name=' + name;
            lData = lData + '&parameters-' + lPosition + '-position=' + lPosition;
            lData = lData + '&parameters-' + lPosition + '-description=' + lDescription;
            lData = lData + '&parameters-' + lPosition + '-default=' + value;
            lData = lData + '&';
            lPosition++;
        });

        lData = lData + 'parameters-TOTAL_FORMS=' + lPosition
                        + '&parameters-INITIAL_FORMS=0';

       return lData;
    },
    generateMappingXML : function(){
        var xml = new XMLManager();
        var nameSpace      = '';
        var dataSource     = xml.createXMLDocument('EndPointMappings', nameSpace, null);

        var initialIndex = 0;
        if(DataTableObj.attributes.parameters.length > 0){
            initialIndex = DataTableObj.attributes.parameters.length;
        }

        $('.webservice_args_editable').each(function(i){
            var argsElement   = xml.createElementNS(nameSpace, 'Mapping', dataSource);

            var elements = $(this).find('input');
            var name = elements.eq(0).val();
            var value = elements.eq(1).val();

            var argElement1   = xml.createElementNS(nameSpace, 'key', dataSource);
            var argText1      = dataSource.createTextNode(name);

            argElement1.appendChild(argText1);

            var argElement2   = xml.createElementNS(nameSpace, 'value', dataSource);
            var argText2      = dataSource.createTextNode('parameter'+initialIndex);

            argElement2.appendChild(argText2);

            argsElement.appendChild(argElement1);
            argsElement.appendChild(argElement2);

            dataSource.documentElement.appendChild(argsElement);

            initialIndex++;
        });
        if($('.webservice_args_editable').size() != 0){
            CreationManager.attributes.dataSourceXML = CreationManager.attributes.dataSourceXML.substr(0, 12) + xml.serializeNode(dataSource) + CreationManager.attributes.dataSourceXML.substr(12, CreationManager.attributes.dataSourceXML.length);
        }
    },
    reset: function(){
        Step.prototype.reset.call(this);

        if (CreationManager.attributes.suggestionOn == false) {
            this.attributes.$Form[0].reset();
            this.attributes.$Tags.html('');
        }
    }
});

var Step3 = Step.extend({
	defaults : {
		$SaveButton 		: null,
		$SaveBtnBottom 		: null,
		$PrevButton 		: null,
		$Params				: null,
		previewAjaxCall		: '',
		url : ''
	},
	initialize : function(){
		Step.prototype.initialize.call(this);
		_.defaults(this.attributes, Step.prototype.defaults);
	},
	init : function(){
		var att = this.attributes;
		att.$Container			= $('#id_step3_container');
	    att.$PreviousButton 	= $('#id_step3PrevButton', att.$Container).click(_.bind(this.onPrevStepButtonClicked, this));
		
		$('#id_goToStep3Button').click(function(){
			CreationManager.goToStep(2);
		});
		$('#id_step3CancelButton').click(function(){
			window.location.replace('/dataviews/');
		});
		
		$('#id_step4_save', att.$Container).click(_.bind(this.save, this));
		// $('#id_step4_save_draft', att.$Container).click(_.bind(this.saveDraft, this));
		// $('#id_step4_review', att.$Container).click(_.bind(this.saveReview, this));
		// $('#id_step4_approve', att.$Container).click(_.bind(this.saveApproved, this));
		// $('#id_step4_publish', att.$Container).click(_.bind(this.savePublished, this));
	},
	start : function(){
		Step.prototype.start.call(this);

		isStep1 = false;
		
		this.requestDataStreamPreview();
		this.loadTags();
		this.setHeader();
	},
	setHeader : function(){
		$('body').addClass('collapsedHeader');
		$('body').removeClass('fixedBar');
		$('.header').removeClass('fixedBar');
		$('.sectionTitleContainer').removeClass('fixedBar');
		$('.collapsedBar').removeClass('fixedBar');
	},
	loadingMessage : function(){
		var lHtml = '<table class="Loading">';
			lHtml += "<tr><td>&nbsp;</td></tr></table>";

	    $('.dataStreamContainer').html(lHtml);
	},
	loadTags : function(){
		var $lTags 		= $('#id_tag_container').clone();
		$lTags.find('a').remove();
		var contents 	= "";

		if( $lTags.find('.tag').size() > 0 ){
			contents = '<div class="title">' + gettext( "CREATE-STEP4-TAGTITLE" ) + '</div>';
			contents += $lTags.html();
		}

		$('#id_tags').html(contents);
	},
	requestDataStreamPreview : function(){
		var lUrl 	= '/rest/datastreams/sample.json';
	    var lData 	= 'end_point=' + $.URLEncode(CreationManager.attributes.endPoint)
	    			+ '&impl_type=' + CreationManager.attributes.implType
	    			+ '&impl_details=' + CreationManager.attributes.implDetails
				+ '&datasource=' + CreationManager.attributes.dataSourceXML
	    			+ '&select_statement=' + CreationManager.attributes.selectStatementXML
	    			+ '&rdf_template=' + CreationManager.attributes.rdfTemplate
	    			+ '&bucket_name=' + CreationManager.attributes.bucketName
					+ '&user_id=' + authManager.id
					+ '&limit=50';

		lData += CreationManager.attributes.parametersPreview;

		this.loadingMessage();
		this.loadTags();

	    this.attributes.previewAjaxCall = $.ajax({ url: lUrl
									            , type:'POST'
									            , data: lData
									            , cache: false
									            , dataType: 'json'
									            , success: _.bind(this.onSuccessRenderDataStream, this )
									            , error: _.bind(this.onErrorDataStreamPreview, this)
									            }
									    );

	},
	onSuccessRenderDataStream : function(pResponse){
		var lHtml = '<div class="dataStreamBox clearfix"><h2 title="'+step2.attributes.$Description.val()+'" class="clearfix">' +
							'<span class="txt">' +
								'<span class="titleDS"><strong></strong>';
		
		var lSeparator = ', ';
		var params =  ' (';
		for (var i = 0; i < DataTableObj.attributes.parameters.length; i++) {
			var lValue = DataTableObj.attributes.parameters[i].split('&')[1];
			params += '<label for="pArgument'+i+'" onclick="step3.onArgumentClicked(this);">' + lValue + '</label>';
			params += '<input type="text" style="display:none" onblur="step3.onArgumentChange(this);" size="10" id="pArgument'+i+'" value="' + lValue + '" />';
			if(i + 1 == DataTableObj.attributes.parameters.length){

                lSeparator = '';
            }
            params += lSeparator;
        }

        if (DataTableObj.attributes.parameters.length > 0) {
            lHtml = lHtml + params + ')';
        }
        var category = step2.attributes.$Category.val();
        lHtml += '</span>';
        lHtml +=    '<span class="infoDS">' +
                            '<span class="categoryDS">'+step2.attributes.$Category.find('option[value='+category+']').text()+'</span> <span class="sep">|</span> <span class="authorDS">' + gettext( "APP-BY-TEXT" ) + ' <strong>'+authManager.attributes.name+'</strong></span> <span class="dateDS"> 0' + gettext( "APP-MINUTESAGO-TEXT" ) + '</span>' +
                    '</span>' +
                '</span>' +
            '</h2>';

        if( pResponse != null ){
            if(pResponse.fType!='ARRAY'){
                var lValue = '';
                if(pResponse.fType == 'TEXT'){
                        var str = String(pResponse.fStr);
                                str = str.replace(/(<([^>]+)>)/ig," ");
                    lValue = '<table class="Texto"><tr><td>' + str + '</td></tr></table>';
                } else if(pResponse.fType == 'NUMBER'){
                    var displayFormat = pResponse.fDisplayFormat;
                    if (displayFormat != undefined) {
                        var number = $.formatNumber(pResponse.fNum, {format:displayFormat.fPattern, locale:displayFormat.fLocale});
                    } else {
                        var number = pResponse.fNum;
                    }
                    lValue = '<table class="Numero"><tr><td>' + String(number) + '</td></tr></table>';
                } else if(pResponse.fType == 'LINK'){
                    lValue = '<table class="Texto"><tr><td><a target="_blank" href="' + pResponse.fUri + '" rel="nofollow" title="' + pResponse.fStr + '">' + pResponse.fStr + '</a></td></tr></table>';
                } else if(pResponse.fType == 'ERROR'){
                    var lText = lValue;
                    lValue = '<table class="Nulo"><tr><td> ' + gettext( "APP-NODATAFOUD-TEXT" ) + '. <span>' + gettext( "APP-ENTERNEWVALUE-TEXT" ) + ' ' + lText + ' ' + gettext( "APP-AND-TEXT" ) + ' <a id="id_retryDataServiceButton" href="javascript:;" onclick="step3.requestDataStreamPreview();" title="' + gettext( "APP-TRYAGAIN-TITLE" ) + '">' + gettext( "APP-TRYAGAIN-TEXT" ) + '</a>.</span></td></tr></table>';
                }
                lHtml  = lHtml + '<div class="dataStreamResult clearfix"><div class="Mensaje">' + lValue +'</div></div>';
            } else {
                i = 0;
                lHtml  = lHtml + '<div class="dataStreamResult clearfix"><div class="Mensaje"><table class="Tabla" >';
                for(var lRow=1;lRow<=pResponse.fRows;lRow++){
                    lHtml  = lHtml + '<tr>';
                    for(var lColumns=1;lColumns <= pResponse.fCols;lColumns++){
                        var lCell = pResponse.fArray[i];
                        var lValue = '';
                        if(lCell.fType == 'TEXT'){
                            if(lCell.fStr.length == 1){
                                lValue = lCell.fStr.replace('-','&nbsp;');
                            }else{
                                lValue = String(lCell.fStr);
                                lValue = lValue.replace(/(<([^>]+)>)/ig," ");
                        if(lValue.length >= 80){
                                    lValue = lValue.substring(0,77) + '...';
                                }
                            }
            } else if(lCell.fType == 'NUMBER'){
                var displayFormat = lCell.fDisplayFormat;
                if (displayFormat != undefined) {
                    var number = $.formatNumber(lCell.fNum, {format:displayFormat.fPattern, locale:displayFormat.fLocale});
                    lValue = String(number);
                } else {
                    lValue = String(lCell.fNum);
                }
            } else if(lCell.fType == 'LINK'){
                lValue = '<a target="_blank" href="' + lCell.fUri + '" rel="nofollow" title="' + lCell.fStr + '">' + lCell.fStr + '</a>';
            }
            if (typeof lCell.fHeader !== "undefined" && lCell.fHeader == true) {
                            lHtml  = lHtml + '<th><div>' + lValue + '</div></th>';
                        }else{
                            lHtml  = lHtml + '<td><div>' + lValue + '</div></td>';
                        }
                        i++;
                    }
                    lHtml  = lHtml +'</tr>';
                }
                lHtml  = lHtml +'</table></div></div>';
            }
        }
        lHtml = lHtml + '</div>';
        this.attributes.$Container.find('.dataStreamContainer').html( lHtml );
        $('.titleDS strong').text(step2.attributes.$Title.val());

        $('.DashboardIframe').find('input[id*=pArgument]').bind( 'keydown',
            function( event ){
                if( event.keyCode == 13 ){
                    this.onArgumentChange( event.currentTarget);
                }
        }).bind('blur',
            function( event ){
                this.onArgumentChange( event.currentTarget);
        });
    },
    onArgumentClicked : function(pLabel){
        var $lLabel = $(pLabel);
        var $lValue = $('input[id=' + $lLabel.attr('for') + ']');
        var lText   = $lLabel.text();

        $lValue.val(lText)
        $lLabel.hide();
        $lValue.show().focus();
    },
    onArgumentChange : function(pValue){
        var $lLabel = $(pValue).siblings('label[for=' + pValue.id + ']');

        var lValue  = $(pValue).val();
        if (lValue != "") {
            $lLabel.text(lValue);
        }else{
            $(pValue).val("Enter a Value");
        }
        $(pValue).hide();
        $lLabel.show();

        var lData = '';
        for (var i = 0; i < DataTableObj.attributes.parameters.length; i++) {
            var lValue = $('input[id*=pArgument]').eq(i).val();
            var lName = DataTableObj.attributes.parameters[i].split('&')[0];
            if(lData == ''){
                lData +='&pArgument'+i+'='+ lValue +'&pParameter'+i+'=' + lName;
            }
            else{
                lData +='&pArgument'+i+'='+ lValue +'&pParameter'+i+'=' + lName;
            }
            DataTableObj.attributes.parameters[i] = lName + "&" + lValue;
        }

        CreationManager.attributes.parametersPreview = lData;
        this.requestDataStreamPreview();
    },
    onErrorDataStreamPreview : function(pResponse){
        var lHtml = '<div class="dataStreamBox clearfix"> <h2 title="'+step2.attributes.$Description.val()+'" class="clearfix">' +
                            '<span class="txt">' +
                                '<span class="titleDS"><strong>'+step2.attributes.$Title.val()+'</strong>  <br/> ';

        var lSeparator = ', ';
        var params =  ' (';
        for (var i = 0; i < DataTableObj.attributes.parameters.length; i++) {
            var lValue = DataTableObj.attributes.parameters[i].split('&')[1];
            params += '<label for="pArgument'+i+'" onclick="step3.onArgumentClicked(this);">' + lValue + '</label>';
            params += '<input type="text" style="display:none" onblur="step3.onArgumentChange(this);" size="10" id="pArgument'+i+'" value="' + lValue + '" />';
            if(i + 1 == DataTableObj.attributes.parameters.length){
                lSeparator = '';
            }
            params += lSeparator;
        }
        if (DataTableObj.attributes.parameters.length > 0) {
            lHtml = lHtml + params + ')';
        }

        var category = step2.attributes.$Category.val();
            lHtml +=   '</span>';
            lHtml +=        '<span class="infoDS">' +
                                        '<span class="categoryDS">'+step2.attributes.$Category.find('option[value='+category+']').text()+'</span> <span class="sep">|</span> <span class="authorDS">' + gettext( "APP-BY-TEXT" ) + ' <strong>'+authManager.attributes.name+'</strong></span> <span class="dateDS">0 ' + gettext( "APP-MINUTESAGO-TEXT" ) + '</span>' +
                                    '</span>' +
                                '</span>' +
                            '</h2>';

        lHtml        += '<div class="dataStreamResult clearfix"><div class="Mensaje">';
        lHtml        += '<table class="Nulo">';
        lHtml        += '<tr>';
        lHtml        += '<td> ' + gettext( "APP-OOPS-TEXT" ) + ' <span>' + gettext( "DS-CANTLOADDATA-TEXT" ) + '.</span><span>' + gettext( "APP-PLEASE-TEXT" ) + ' <a id="id_retryDataServiceButton" href="javascript:;" onclick="step3.requestDataStreamPreview();" title="' + gettext( "APP-TRYAGAIN-TITLE" ) + '">' + gettext( "APP-TRYAGAIN-TEXT" ) + '</a>.</span></td>';
        lHtml        += '</tr>';
        lHtml        += '</table>';
        lHtml        += '</div></div></div>';

        step3.attributes.$Container.find('.dataStreamContainer').html( lHtml );

        $('.DashboardIframe').find('input[id*=pArgument]').bind( 'keydown',
            function( event ){
            if( event.keyCode == 13 ){
                this.onArgumentChange( event.currentTarget, 0);
            }
        }).bind('blur',
            function( event ){
                this.onArgumentChange( event.currentTarget,  0);
        });
    },
    save : function(){
        // this.attributes.url = '/dataviews/edit_datastream_selection';
        this.attributes.url = '/dataviews/create';
        this.onSaveButtonClicked();
    },
    // saveDraft : function(){
    //     this.attributes.url = '/dataviews/save_datastream_as_draft';
    //     this.onSaveButtonClicked();
    // },
    // saveReview : function(){
    //     this.attributes.url = '/dataviews/save_datastream_as_review';
    //     this.onSaveButtonClicked();
    // },
    // saveApproved : function(){
    //     this.attributes.url = '/dataviews/save_datastream_as_approved';
    //     this.onSaveButtonClicked();
    // },
    // savePublished : function(){
    //     this.attributes.url = '/dataviews/save_datastream_as_published';
    //     this.onSaveButtonClicked();
    // },
    onSaveButtonClicked: function(){
        var lUrl     = this.attributes.url;
        var lData      = CreationManager.attributes.serviceQueryString
                         + '&' + CreationManager.attributes.tagsQueryString
                         + '&' + CreationManager.attributes.parametersQueryString
                         + '&' + CreationManager.attributes.metaData
                         + '&' + CreationManager.attributes.sourceQueryString;

        if(CreationManager.attributes.is_update_selection){
            lData += '&datastream-datastream_revision_id=' + $('#id_datastream-datastream_revision_id').val();
        }

        this.attributes.$Params = $('#id_step3_container .dataStreamBox input');

        try{
            if( this.attributes.previewAjaxCall.readyState != 4 )
                this.attributes.previewAjaxCall.abort();
        }
        catch( err ){
        }

        $.ajax({ url: lUrl
                    , type:'POST'
                    , data: lData
                    , dataType: 'json'
                    , success: _.bind(this.onSaveSuccess, this)
                    , error: _.bind(this.onSaveError, this)
                });
    },
    onSaveSuccess : function(pResponse){
        if(pResponse.status == 'ok'){
            //window.location.replace('/dataviews/view?datastream_revision_id='+pResponse.datastream_revision_id);
            window.location.replace('/dataviews/'+pResponse.datastream_revision_id);
        }else{
            datalEvents.trigger('datal:application-error', pResponse);
        }
    },
    onSaveError : function(pResponse){
        datalEvents.trigger('datal:application-error', pResponse);
    },
    onPrevStepButtonClicked: function(){
         try{
            if( this.attributes.previewAjaxCall.readyState != 4 )
                this.attributes.previewAjaxCall.abort();
        }
        catch( err ){
        }

        CreationManager.goToPrevStep();
    }
});

// Resize on step 2
var isStep1 = false;
$(function(){
    $(window).resize(function() {
        if(isStep1 == true){
            step1.setScrollBar();
        }
    });
});
var SideBar = Backbone.Model.extend({
	defaults : {
		$Container : null,
		selectionStarted : false,
		advanceModeEnabled : false,
		lockSelection :false
	},
	initialize : function(){
		var att = this.attributes;
		att.$Container.find('.boxTitle').click(_.bind(this.collapseExpandPanel , this));
		att.$Container.find('#id_enableAdvanceModeLink').click(_.bind(this.enableAdvancedMode , this));
		att.$Container.find('#id_clearSelectionTop').click(_.bind(this.clearSelection, this));
		
		window.collectSummary = new CollectSummary({'$Container' : $('#id_collectSummaryPanel')});
	},
	collapseExpandPanel : function(pEvent){
		var $lTarget = $(pEvent.target);
		if($lTarget.is('h4')){
			$lTarget.toggleClass("collapsed");
			$lTarget = $lTarget.parent().siblings('.boxInner');
		}else{
			$lTarget.toggleClass("collapsed");
			$lTarget = $lTarget.siblings('.boxInner');
		}
		$lTarget.slideToggle("fast");
	},
	selectionStarted : function(){
		if (!this.attributes.selectionStarted) {
			$('#id_helpAndTipsPanel').slideToggle("fast");
			$('#id_helpAndTipsPanel').parent().find('.boxTitle h4').toggleClass("collapsed");
			$('.actionsBox .boxTitle').eq(1).show();
			$('#id_enableAdvanceModeBox').show();
			this.attributes.selectionStarted = true;
		}
				
		if(this.attributes.advanceModeEnabled){
			advanceOptions.setEnabledFeatures();
		}
		$('#id_collectSummaryPanel p').eq(0).hide();
		$('#id_selectionOptions').fadeIn("fast");
	},
	enableAdvancedMode : function(){
		this.attributes.advanceModeEnabled = true;
		
		$('#id_enableAdvanceModeBox').hide();
		$('#id_advanceMenuBox').slideToggle("fast");
		
		$('#id_collectSummaryPanel p').eq(0).hide();
		
		window.advanceOptions = new AdvanceOptions({'$Container' : $('#id_advancePanel')});
		advanceOptions.setEnabledFeatures();
	},
	clearSelection : function(){
		if(this.attributes.advanceModeEnabled){
			if(this.attributes.lockSelection){
				if(confirm( gettext( "APP-CHANGESELECTION-WARNING" ) )){
					this.resetLockSelection();
				}
			}else{
				advanceOptions.attributes.$Container.find('li').addClass('disabled-item');
				DataTableObj.clearSelection();
			}
		}else{
			DataTableObj.clearSelection();
		}
		$('#id_collectSummaryPanel p ').show();
		$('#id_selectionOptions').hide();
		$('#id_addFunctionsBox').hide();
	},
	resetLockSelection : function(){
		advanceOptions.attributes.$Container.find('li').addClass('disabled-item');
		advanceOptions.reset();
		DataTableObj.clearSelection();
		this.attributes.lockSelection = false;
		this.attributes.selectionStarted = false;
		this.attributes.advanceModeEnabled = false;
		$('#id_collectSummaryPanel p ').show();
		$('#id_selectionOptions').hide();
		$('#id_addFunctionsBox').hide();
	},
	reset : function(){
		var att = this.attributes;
		
		collectSummary.reset();
		if(att.advanceModeEnabled){
			advanceOptions.reset();
		}
		att.selectionStarted = false;
		att.advanceModeEnabled = false;
		att.lockSelection = false;
		
		$('#id_helpAndTipsPanel').slideDown();
		$('#id_helpAndTipsPanel').parent().find('.boxTitle').addClass("collapsed");
		$('#id_collectSummaryPanel p').eq(0).show();
	}
});

var CollectSummary = Backbone.Model.extend({
	defaults : {
		$Container : null
	},
	initialize : function(){
		
	},
	addSummaryObject : function(pOptions){
		//add new item
		//bind remove and edit functions
	},
	addHeaderItem : function(){
	
	},
	addFilterItem : function(){
	
	},
	addFunctionItem : function(){
	
	},
	addTotalItem : function(){
	
	},
	addAliasItem : function(){
	
	},
	removeSummaryObject : function(pOptions){
		//remove item from list
	},
	reset : function(){
		//remove all items
		
		$('#id_selectionOptions').hide();
	}
});

var AdvanceOptions = Backbone.Model.extend({
	defaults : {
		$Container : null
	},
	initialize : function(){
		var att = this.attributes;
		
		window.headerOption = new HeaderOption({'$Container' : $('#id_addHeadersBox')});
		window.filterOption = new FilterOption({'$Container' : $('#id_addFiltersBox')});
		window.aliasesOption = new AliasesOption({'$Container' : $('#id_addAliasesBox')});
		window.totalsOption = new TotalsOption({'$Container' : $('#id_addTotalsBox')});
		window.functionsOption = new FunctionsOption({'$Container' : $('#id_addFunctionsBox')});
		
		att.$Container.find('#id_headerMenuItem').click(_.bind(headerOption.displayPanel , headerOption));
		att.$Container.find('#id_filterMenuItem').click(_.bind(filterOption.displayPanel , filterOption));
		att.$Container.find('#id_aliasesMenuItem').click(_.bind(aliasesOption.displayPanel , aliasesOption));
		att.$Container.find('#id_functionMenuItem').click(_.bind(functionsOption.displayPanel , functionsOption));
		att.$Container.find('#id_totalesMenuItem').click(_.bind(totalsOption.displayPanel , totalsOption));
	},
	setEnabledFeatures : function(){
		var lColumns 	= DataTableObj.attributes.selectedColumns;
		var lRows 		= DataTableObj.attributes.selectedRows;
		var lCells 		= DataTableObj.attributes.selectedCells;
		
		var $lOptions = this.attributes.$Container.find('li');
		if(lColumns == 0 && lRows == 0 && lCells == 0 && !DataTableObj.attributes.$Table.hasClass('ao-table-selected')){
			$lOptions.addClass('disabled-item');
		}
		if(lColumns == 0 && lRows == 0 && lCells > 0){
			$lOptions.addClass('disabled-item');
			$('#id_aliasesMenuItem').parent().removeClass('disabled-item');
		}
		if(lColumns == 0 && lRows == 1 && lCells == 0){
			$lOptions.addClass('disabled-item');
			$('#id_headerMenuItem').parent().removeClass('disabled-item');
			$('#id_functionMenuItem').parent().removeClass('disabled-item');
		}
		if(lColumns == 0 && lRows > 1 && lCells == 0){
			$lOptions.removeClass('disabled-item');
			$('#id_filterMenuItem').parent().addClass('disabled-item');
		}
		if(lColumns > 0 && lRows == 0 && lCells == 0){
			$lOptions.removeClass('disabled-item');
		}
		if(lColumns > 0 && lRows > 0 && lCells == 0){
			$lOptions.addClass('disabled-item');
			$('#id_headerMenuItem').parent().removeClass('disabled-item');
			$('#id_aliasesMenuItem').parent().removeClass('disabled-item');
		}
		if(DataTableObj.attributes.$Table.hasClass('ao-table-selected')){
			$lOptions.removeClass('disabled-item');
		}
	},
	reset : function(){
		var att = this.attributes;
		headerOption.reset();
		filterOption.reset();
		aliasesOption.reset();
		totalsOption.reset();
		functionsOption.reset();
		
		att.$Container.find('#id_advanceMenuBox').hide();
		att.$Container.find('#id_enableAdvanceModeBox').slideToggle("fast");
		$('#id_enableAdvanceModeBox').hide();
		$('.actionsBox .boxTitle').eq(1).hide();
		
		att.$Container.find('#id_headerMenuItem').unbind('click');
		att.$Container.find('#id_filterMenuItem').unbind('click');
		att.$Container.find('#id_aliasesMenuItem').unbind('click');
		att.$Container.find('#id_functionMenuItem').unbind('click');
		att.$Container.find('#id_totalesMenuItem').unbind('click');
	}
});

var HeaderOption = Backbone.Model.extend({
	defaults : {
		$Container : null,
		headerRows : [],
		$Table : null
	},
	initialize : function(){
		this.attributes.$Table = DataTableObj.attributes.$Table;
		this.attributes.$Container.find('#id_doneHeaders').click(_.bind(this.onDoneSelection, this));
		this.attributes.$Container.find('#id_clearHeaders').click(_.bind(this.onClearSelection, this));
		$('#id_editHeaders').click(_.bind(this.displayPanel,this));
		$('#id_removeHeader').click(_.bind(this.onClearSelection,this));
		
		//this.automaticHeaderDetection();
	},
	automaticHeaderDetection : function(){
		var $lHeaders = this.attributes.$Table.find(".ao-th");
		var lLength = $lHeaders.size();
		var lSelectedRows = [];
		var lSelectedRowIndexes = []; 
		
		var lPreviousRowIndex = 0;
		for (var i = 0; i < lLength; i++){
			var lTr = $lHeaders.eq(i).parent('tr')[0];
			var lRowIndex = lTr.rowIndex;
			if(lPreviousRowIndex != lRowIndex){
				lPreviousRowIndex = lRowIndex;
				lSelectedRows.push(lTr);
				lSelectedRowIndexes.push(lRowIndex);
			}
		};
		
		if(lSelectedRows.length > 0){
			this.attributes.headerRows = lSelectedRowIndexes;
			CreationManager.attributes.headers = lSelectedRowIndexes;
			$(lSelectedRows).trigger('click');
			$('#id_warningHeaders').show();
		}
	},
	displayPanel : function(){
		this.attributes.$Container.slideToggle("fast");
		$('#id_advanceMenuBox').hide();
		
		this.attributes.$Table.addClass("ao-headers-mode ao-advanced-mode");
		
		DataTableObj.attributes.disableColumnSelection = true;
		DataTableObj.attributes.isOverlap = true;
		DataTableObj.attributes.selectionClass = 'ao-headers-row-selected';
		
		this.attributes.$Table.customSelectable( "option", "selectionClass", "ao-headers-row-selected" );
		this.attributes.$Table.customSelectable( "option", "disable", true);
		$('.navigationControl').hide();
		
		$('#id_selectionOptions a').hide();
	},
	onDoneSelection : function(){
		this.attributes.$Table.removeClass("ao-headers-mode ao-advanced-mode");
		
		this.attributes.$Container.hide();
		$('#id_advanceMenuBox').slideToggle("fast");
		
		DataTableObj.attributes.disableColumnSelection = false;
		
		DataTableObj.attributes.disableColumnSelection = false;
		DataTableObj.attributes.isOverlap = false;
		DataTableObj.attributes.selectionClass = '';
		
		this.attributes.$Table.customSelectable( "option", "selectionClass", "ao-cell-selected" );
		this.attributes.$Table.customSelectable( "option", "disable", false);
		
		$('#id_selectionOptions a').show();
		$('.navigationControl').show();
		
		this.generateHeaders();
		this.collectSummaryNotification();
	},
	onClearSelection : function(){
		var att = this.attributes;
		att.$Table.find(".ao-headers-row-selected").removeClass('ao-headers-row-selected');
		att.headerRows = [];
		$('#id_headersNotification').hide();
		$('#id_warningHeaders').hide();
		CreationManager.attributes.headers = [];
	},
	generateHeaders : function(){
		var $lHeaders = this.attributes.$Table.find("tr.ao-headers-row-selected");
		var lLength = $lHeaders.size();
		var lSelectedRows = []; 

		for (var i = 0; i < lLength; i++){
			var $lTr = $lHeaders.eq(i);
			var lRowIndex = $lTr[0].rowIndex - 2;
			lSelectedRows.push(lRowIndex);
		};
		
		this.attributes.headerRows = lSelectedRows;
		CreationManager.attributes.headers = lSelectedRows;
	},
	collectSummaryNotification : function(){
		if(this.attributes.$Table.find(".ao-headers-row-selected").size() == 0){
			$('#id_headersNotification').hide();
		}else{
			$('#id_headersNotification').show();
			sideBar.attributes.lockSelection = true;
		} 
		//collectSummary.addSummaryObject(json);
	},
	reset : function(){
		var att = this.attributes;
		att.$Table.find(".ao-headers-row-selected").removeClass('ao-headers-row-selected');
		att.headerRows = [];
		CreationManager.attributes.headers = [];
		att.$Container.find('#id_doneHeaders').unbind('click');
		att.$Container.find('#id_cancelHeaders').unbind('click');
		$('#id_headersNotification').hide();
		$('#id_warningHeaders').hide();
		
		$('#id_editHeaders').unbind('click');
		$('#id_removeHeader').unbind('click');
	}
});

var AliasesOption = Backbone.Model.extend({
	defaults : {
		$Container : null,
		$Table : null
	},
	initialize : function(){
		this.attributes.$Table = DataTableObj.attributes.$Table;
		this.attributes.$Container.find('#id_doneAliases').click(_.bind(this.onDoneSelection, this));
		this.attributes.$Container.find('#id_clearAliases').click(_.bind(this.onClearSelection, this));
		
		$('#id_editAliases').click(_.bind(this.displayPanel,this));
		$('#id_removeAliases').click(_.bind(this.onClearSelection,this));
		
		var lInputs = this.attributes.$Table.find('[id*=id_aliasesInput_]');
		lInputs.click(function(){
			var _this = $(this);
            if (_this.val() == gettext( "APP-SETALIAS-TEXT" ) ) {
                _this.val('');
				_this.removeClass('shadowText');
            }
        }).blur(function(){
			var _this = $(this);
            if (_this.val() == '') {
                _this.val( gettext( "APP-SETALIAS-TEXT" ) );
				_this.addClass('shadowText');
            }
        }).trigger('blur');
		
		//maybe only set active where columns are selected
	},
	displayPanel : function(){
		this.attributes.$Container.slideToggle("fast");
		$('#id_advanceMenuBox').hide();
		
		DataTableObj.attributes.disableSelection = true;
		this.attributes.$Table.addClass("ao-aliases-mode ao-advanced-mode");
		this.attributes.$Table.find('[id*=id_aliasesInput_]').show();
		
		this.attributes.$Table.customSelectable( "option", "disable", true);
		$('.navigationControl').hide();
		
		$('#id_selectionOptions a').hide();
	},
	onDoneSelection : function(){
		this.attributes.$Table.removeClass("ao-aliases-mode ao-advanced-mode");
		
		this.attributes.$Container.hide();
		$('#id_advanceMenuBox').slideToggle("fast");
		
		DataTableObj.attributes.disableSelection = false;
		this.attributes.$Table.find('[id*=id_aliasesInput_]').hide();
		this.attributes.$Table.customSelectable( "option", "disable", false);
		
		$('#id_selectionOptions a').show();
		$('.navigationControl').show();
		
		this.generateAliases();
		this.collectSummaryNotification();
	},
	onClearSelection : function(){
		var att = this.attributes;
		att.$Table.find('[id*=id_aliasesInput_]').val( gettext( "APP-SETALIAS-TEXT" ) );
		att.$Table.find('[id*=id_aliasesInput_]').addClass("shadowText");
		$('#id_aliasesNotification').hide();
	},
	generateAliases : function(){
		var lAliases = [];
		$.each(this.attributes.$Table.find('[id*=id_aliasesInput_]'), function(){
			var lValue = $(this).val();
			if(lValue != gettext( "APP-SETALIAS-TEXT" ) ){
				lAliases.push($(this).val());
			}else{
				lAliases.push("");
			}
		});
		
		CreationManager.attributes.aliases = lAliases;
	},
	collectSummaryNotification : function(){
		var lHasAliases = false;
		$.each(this.attributes.$Table.find('[id*=id_aliasesInput_]'),function(){
			if($(this).val() != gettext( "APP-SETALIAS-TEXT" ) ){
				lHasAliases = true;
			}
		} );
		if(lHasAliases){
			$('#id_aliasesNotification').show();
			sideBar.attributes.lockSelection = true;
		}else{
			$('#id_aliasesNotification').hide();
		}
		//collectSummary.addSummaryObject(json);
	},
	reset : function(){
		var att = this.attributes;
		att.$Table.find('[id*=id_aliasesInput_]').hide();
		att.$Table.find('[id*=id_aliasesInput_]').val( gettext( "APP-SETALIAS-TEXT" ) );
		att.$Table.find('[id*=id_aliasesInput_]').addClass("shadowText");
		att.$Container.find('#id_doneAliases').unbind('click');
		att.$Container.find('#id_cancelAliases').unbind('click');
		$('#id_aliasesNotification').hide();
		
		$('#id_editAliases').unbind('click');
		$('#id_removeAliases').unbind('click');
		
		CreationManager.attributes.aliases = [];
	}
});

var FilterOption = Backbone.Model.extend({
	defaults : {
		$Container : null,
		$Table : null
	},
	initialize : function(){
		this.attributes.$Table = DataTableObj.attributes.$Table;
		this.attributes.$Container.find('#id_doneFilters').click(_.bind(this.onDoneSelection, this));
		this.attributes.$Container.find('#id_clearFilters').click(_.bind(this.onClearSelection, this));
	},
	displayPanel : function(){
		this.attributes.$Container.slideToggle("fast");
		$('#id_advanceMenuBox').hide();
		
		DataTableObj.attributes.disableSelection = true;	
		
		this.attributes.$Table.find('[id*=id_addFilterButton_]').show();
		this.attributes.$Table.addClass("ao-filter-mode ao-advanced-mode");
		
		this.attributes.$Table.customSelectable( "option", "disable", true);
		
		$('#id_selectionOptions a').hide();
		$('.navigationControl').hide();
	},
	editFilter : function(){
		this.attributes.$Container.show();
		$('#id_advanceMenuBox').hide();
		
		DataTableObj.attributes.disableSelection = true;	
		
		this.attributes.$Table.find('[id*=id_addFilterButton_]').show();
		this.attributes.$Table.addClass("ao-filter-mode ao-advanced-mode");
		
		this.attributes.$Table.customSelectable( "option", "disable", true);
		
		$('#id_selectionOptions a').hide();
		$('.navigationControl').hide();
	},
	onDoneSelection : function(){
		this.attributes.$Table.removeClass("ao-filter-mode ao-advanced-mode");
		
		this.attributes.$Container.hide();
		$('#id_advanceMenuBox').slideToggle("fast");
		
		DataTableObj.attributes.disableSelection = false;
		
		this.attributes.$Table.customSelectable( "option", "disable", false);
		
		this.attributes.$Table.find('[id*=id_addFilterButton_]').hide();
		$('#id_selectionOptions a').show();
		$('.navigationControl').show();
		
		//remove collect summary logic from dataTable and maybe xml logic also
		this.collectSummaryNotification();
	},
	onClearSelection : function(){
		DataTableObj.resetFilters();
	},
	collectSummaryNotification : function(){
		if($('#id_filterToolBar dd').size() != 0){
			sideBar.attributes.lockSelection = true;
		}
		//collectSummary.addSummaryObject(json);
	},
	reset : function(){
		var att = this.attributes;
		att.$Table.find('[id*=id_addFilterButton_]').hide();
		DataTableObj.resetFilters();
		
		att.$Container.find('#id_doneFilters').unbind('click');
		att.$Container.find('#id_cancelFilters').unbind('click');
	}
});

var TotalsOption = Backbone.Model.extend({
	defaults : {
		$Container : null,
		$Table : null,
		totalsCols : []
	},
	initialize : function(){
		this.attributes.$Table = DataTableObj.attributes.$Table;
		this.attributes.$Container.find('#id_doneTotals').click(_.bind(this.onDoneSelection, this));
		this.attributes.$Container.find('#id_clearTotals').click(_.bind(this.onClearSelection, this));
		$('#id_editTotals').click(_.bind(this.displayPanel,this));
		$('#id_removeTotals').click(_.bind(this.onClearSelection,this));
	},
	generateTotals : function(){
		var $lTotals = this.attributes.$Table.find("th.ao-totals-column-selected");
		var lLength = $lTotals.size();
		var lSelectedCols = []; 

		for (var i = 0; i < lLength; i++){
			var $lTh = $lTotals.eq(i);
			var lColIndex = $lTh[0].cellIndex - 1;
			lSelectedCols.push(lColIndex);
		};
		
		this.attributes.totalsCols = lSelectedCols;
		CreationManager.attributes.totalsCols = lSelectedCols;
	},
	displayPanel : function(){
		this.attributes.$Container.slideToggle("fast");
		$('#id_advanceMenuBox').hide();
		
		$('.ao-no-select').show()
		
		DataTableObj.attributes.disableRowSelection = true;	
		DataTableObj.attributes.isOverlap = true;
		DataTableObj.attributes.selectionClass = 'ao-totals-column-selected';
		
		this.attributes.$Table.addClass("ao-totals-mode ao-advanced-mode");
		this.attributes.$Table.customSelectable( "option", "disable", true);
		
		$('#id_selectionOptions a').hide();
		$('.navigationControl').hide();
	},
	editTotals : function(){
		this.attributes.$Container.show();
		$('#id_advanceMenuBox').hide();
		
		$('.ao-no-select').show()
		
		DataTableObj.attributes.disableRowSelection = true;	
		DataTableObj.attributes.isOverlap = true;
		DataTableObj.attributes.selectionClass = 'ao-totals-column-selected';
		
		this.attributes.$Table.addClass("ao-totals-mode ao-advanced-mode");
		this.attributes.$Table.customSelectable( "option", "disable", true);
		
		$('#id_selectionOptions a').hide();
		$('.navigationControl').hide();
	},
	onDoneSelection : function(){
		this.attributes.$Table.removeClass("ao-totals-mode ao-advanced-mode");
		
		this.attributes.$Container.hide();
		$('#id_advanceMenuBox').slideToggle("fast");
		
		DataTableObj.attributes.disableRowSelection = false;
		DataTableObj.attributes.isOverlap = false;
		DataTableObj.attributes.selectionClass = '';
		this.attributes.$Table.customSelectable( "option", "disable", false);
		
		$('#id_selectionOptions a').show();
		$('.navigationControl').show();
		$('.ao-no-select').hide()
		
		this.generateTotals();
		this.collectSummaryNotification();
	},
	onClearSelection : function(){
		var att = this.attributes;
		att.$Table.find(".ao-totals-column-selected").removeClass('ao-totals-column-selected');
		//reset any pertinent values
		att.totalCols = [];
		CreationManager.attributes.totalCols = [];
	},
	collectSummaryNotification : function(){
		if(this.attributes.$Table.find(".ao-totals-column-selected").size() == 0){
			$('#id_totalsNotification').hide();
		}else{
			$('#id_totalsNotification').show();
			sideBar.attributes.lockSelection = true;
		} 
		//collectSummary.addSummaryObject(json);
	},
	reset : function(){
		var att = this.attributes;
		att.totalCols = [];
		CreationManager.attributes.totalCols = [];
		
		$('#id_totalsNotification').hide();
		
		att.$Container.find('#id_doneTotals').unbind('click');
		att.$Container.find('#id_clearTotals').unbind('click');
	}
});

var FunctionsOption = Backbone.Model.extend({
	defaults : {
		$Container : null
	},
	initialize : function(){
		this.attributes.$Container.find('#id_backFunctionBox').click(_.bind(this.backPanelClick, this));
		this.attributes.$Container.find('#id_mavgSubPanel').click(_.bind(this.displayMavgPanel, this));
		this.attributes.$Container.find('#id_avgSubPanel').click(_.bind(this.displayAvgPanel, this));
		this.attributes.$Container.find('#id_sumSubPanel').click(_.bind(this.displaySumPanel, this));
		
		window.movingAverageOption = new MovingAverageOption({'$Container' : $('#id_mavgBox')});
		window.averageOption = new AverageOption({'$Container' : $('#id_avgBox')});
		window.summatoryOption = new SummatoryOption({'$Container' : $('#id_sumBox')});
	},
	displayPanel : function(){
		$('.ao-no-select').show();
		this.attributes.$Container.slideToggle("fast");
		$('#id_advanceMenuBox').hide();
		DataTableObj.attributes.disableSelection = true;
		DataTableObj.attributes.$Table.customSelectable( "option", "disable", true);
		
		//add class to disable Datatable
	},
	backPanelClick : function(){
		$('.ao-no-select').hide()
		$('#id_addFunctionsBox').hide();
		$('#id_advanceMenuBox').slideToggle("fast");
		$('.ao-no-select').hide();
		DataTableObj.attributes.disableSelection = false;
		DataTableObj.attributes.$Table.customSelectable( "option", "disable", false);
	},
	displayMavgPanel : function(){
		//this.attributes.$Container.hide();
		//$('#id_mavgBox').slideToggle("fast");
		movingAverageOption.displayPanel();
		$('.ao-no-select').hide();
	},
	displayAvgPanel : function(){
		//this.attributes.$Container.hide();
		//$('#id_avgBox').slideToggle("fast");
		averageOption.displayPanel();
		$('.ao-no-select').hide();
	},
	displaySumPanel : function(){
		//this.attributes.$Container.hide();
		//$('#id_sumBox').slideToggle("fast");
		summatoryOption.displayPanel();
		$('.ao-no-select').hide();
	},
	reset : function(){
		var att = this.attributes;
		
		att.$Container.find('#id_backFunctionBox').unbind('click');
		att.$Container.find('#id_mavgSubPanel').unbind('click');
		att.$Container.find('#id_avgSubPanel').unbind('click');
		att.$Container.find('#id_sumSubPanel').unbind('click');
		
		movingAverageOption.reset();
		averageOption.reset();
		summatoryOption.reset();
		
		$('.ao-no-select').hide();
		DataTableObj.attributes.disableSelection = false;

		// El plugin 'customSelectable' asociado a $table parece no estar inicializado al momento 
		// de llamarse el siguiente método. Meto este try/catch para salir del problema por ahora.
		try {
			DataTableObj.attributes.$Table.customSelectable( "option", "disable", false);
		}
		catch (err) {
			console.error(err);
		}
		
		$('#id_functionsNotification').hide();
	}
});

var MovingAverageOption = Backbone.Model.extend({
	defaults : {
		$Container : null,
		$Table : null,
		mavgCols : [],
		mavgPeriod : 0
	},
	initialize : function(){
		this.attributes.$Table = DataTableObj.attributes.$Table;
		this.attributes.$Container.find('#id_doneMavg').click(_.bind(this.onDoneSelection, this));
		this.attributes.$Container.find('#id_clearMavg').click(_.bind(this.onClearSelection, this));
		$('#id_editMavg').click(_.bind(this.displayPanel,this));
		$('#id_removeMavg').click(_.bind(this.onClearSelection,this));
	},
	generateMavg : function(){
		var $lTotals = this.attributes.$Table.find("th.ao-moving-average-column-selected");
		var lLength = $lTotals.size();
		var lSelectedCols = []; 
		for (var i = 0; i < lLength; i++){
			var $lTh = $lTotals.eq(i);
			var lColIndex = $lTh[0].cellIndex - 1;
			lSelectedCols.push(lColIndex);
		};
		
		this.attributes.mavgCols = lSelectedCols;
		CreationManager.attributes.mavgCols = lSelectedCols;
		CreationManager.attributes.mavgPeriod = $('#id_mavgPeriod', this.attributes.$Container).val();
	},
	displayPanel : function(){
		this.attributes.$Container.slideToggle("fast");
		$('#id_addFunctionsBox').hide();
		
		DataTableObj.attributes.disableSelection = false;
		DataTableObj.attributes.disableRowSelection = true;	
		DataTableObj.attributes.isOverlap = true;
		DataTableObj.attributes.selectionClass = 'ao-moving-average-column-selected';
		
		this.attributes.$Table.addClass("ao-moving-average-mode ao-advanced-mode");
		
		this.attributes.$Table.customSelectable( "option", "disable", true);
		
		$('#id_selectionOptions a').hide();
		$('.navigationControl').hide();
	},
	editMovingAverge : function(){
		this.attributes.$Container.show();
		$('#id_addFunctionsBox').hide();
		
		DataTableObj.attributes.disableSelection = false;
		DataTableObj.attributes.disableRowSelection = true;	
		DataTableObj.attributes.isOverlap = true;
		DataTableObj.attributes.selectionClass = 'ao-moving-average-column-selected';
		
		this.attributes.$Table.addClass("ao-moving-average-mode ao-advanced-mode");
		
		this.attributes.$Table.customSelectable( "option", "disable", true);
		
		$('#id_selectionOptions a').hide();
		$('.navigationControl').hide();
	},
	onDoneSelection : function(){
		this.attributes.$Table.removeClass("ao-moving-average-mode ao-advanced-mode");
		
		this.attributes.$Container.hide();
		$('#id_addFunctionsBox').slideToggle("fast");
		
		DataTableObj.attributes.disableRowSelection = false;
		DataTableObj.attributes.isOverlap = false;
		DataTableObj.attributes.selectionClass = '';
		
		this.attributes.$Table.customSelectable( "option", "disable", false);
		
		$('#id_selectionOptions a').show();
		$('.navigationControl').show();
		
		this.generateMavg();
		this.collectSummaryNotification();
	},
	onClearSelection : function(){
		var att = this.attributes;
		att.$Table.find(".ao-moving-average-column-selected").removeClass('ao-moving-average-column-selected');
		$('#id_mavgNotification').hide();
		
		//reset any pertinent values
		att.mavgCols = [];
		CreationManager.attributes.mavgCols = [];
		CreationManager.attributes.mavgPeriod = 0;
	},
	collectSummaryNotification : function(){
		if(this.attributes.$Table.find(".ao-moving-average-column-selected").size() == 0){
			$('#id_mavgNotification').hide();
		}else{
			$('#id_mavgNotification').show();
			$('#id_functionsNotification').show();
			sideBar.attributes.lockSelection = true;
		} 
		//collectSummary.addSummaryObject(json);
	},
	reset : function(){
		var att = this.attributes;
		att.mavgCols = [];
		CreationManager.attributes.mavgCols = [];
		CreationManager.attributes.mavgPeriod = 0;
		
		$('#id_mavgNotification').hide();
		$('#id_mavgBox').hide();
		
		att.$Container.find('#id_doneMavg').unbind('click');
		att.$Container.find('#id_clearMavg').unbind('click');
	}
});

var AverageOption = Backbone.Model.extend({
	defaults : {
		$Container : null,
		$Table :  null,
		avgCols : []
	},
	initialize : function(){
		this.attributes.$Table = DataTableObj.attributes.$Table;
		this.attributes.$Container.find('#id_doneAvg').click(_.bind(this.onDoneSelection, this));
		this.attributes.$Container.find('#id_clearAvg').click(_.bind(this.onClearSelection, this));
		$('#id_editAvg').click(_.bind(this.displayPanel,this));
		$('#id_removeAvg').click(_.bind(this.onClearSelection,this));
	},
	generateAvg : function(){
		var $lTotals = this.attributes.$Table.find("th.ao-average-column-selected");
		var lLength = $lTotals.size();
		var lSelectedCols = []; 
		for (var i = 0; i < lLength; i++){
			var $lTh = $lTotals.eq(i);
			var lColIndex = $lTh[0].cellIndex - 1;
			lSelectedCols.push(lColIndex);
		};
		
		this.attributes.avgCols = lSelectedCols;
		CreationManager.attributes.avgCols = lSelectedCols;
	},
	displayPanel : function(){
		this.attributes.$Container.slideToggle("fast");
		$('#id_addFunctionsBox').hide();
		
		DataTableObj.attributes.disableSelection = false;
		DataTableObj.attributes.disableRowSelection = true;	
		DataTableObj.attributes.isOverlap = true;
		DataTableObj.attributes.selectionClass = 'ao-average-column-selected';
		
		this.attributes.$Table.addClass("ao-average-mode ao-advanced-mode");
		
		this.attributes.$Table.customSelectable( "option", "disable", true);
		
		$('#id_selectionOptions a').hide();
		$('.navigationControl').hide();
	},
	editAverage : function(){
		this.attributes.$Container.show();
		$('#id_addFunctionsBox').hide();
		
		DataTableObj.attributes.disableSelection = false;
		DataTableObj.attributes.disableRowSelection = true;	
		DataTableObj.attributes.isOverlap = true;
		DataTableObj.attributes.selectionClass = 'ao-average-column-selected';
		
		this.attributes.$Table.addClass("ao-average-mode ao-advanced-mode");
		
		this.attributes.$Table.customSelectable( "option", "disable", true);
		
		$('#id_selectionOptions a').hide();
		$('.navigationControl').hide();
	},
	onDoneSelection : function(){
		this.attributes.$Table.removeClass("ao-average-mode ao-advanced-mode");
		
		this.attributes.$Container.hide();
		$('#id_addFunctionsBox').slideToggle("fast");
		
		DataTableObj.attributes.disableRowSelection = false;	
		DataTableObj.attributes.isOverlap = false;
		DataTableObj.attributes.selectionClass = '';
		
		this.attributes.$Table.customSelectable( "option", "disable", false);
		
		$('#id_selectionOptions a').show();
		$('.navigationControl').show();
		
		this.generateAvg();
		this.collectSummaryNotification();
	},
	onClearSelection : function(){
		var att = this.attributes;
		att.$Table.find(".ao-average-column-selected").removeClass('ao-average-column-selected');
		$('#id_avgNotification').hide();
		
		//reset any pertinent values
		att.avgCols = [];
		CreationManager.attributes.avgCols = [];
	},
	collectSummaryNotification : function(){
		if(this.attributes.$Table.find(".ao-average-column-selected").size() == 0){
			$('#id_avgNotification').hide();
		}else{
			$('#id_avgNotification').show();
			$('#id_functionsNotification').show();
			sideBar.attributes.lockSelection = true;
		} 
		//collectSummary.addSummaryObject(json);
	},
	reset : function(){
		var att = this.attributes;
		att.avgCols = [];
		CreationManager.attributes.avgCols = [];
		
		$('#id_avgNotification').hide();
		
		att.$Container.find('#id_doneAvg').unbind('click');
		att.$Container.find('#id_clearAvg').unbind('click');
	}
});

var SummatoryOption = Backbone.Model.extend({
	defaults : {
		$Container : null,
		$Table :  null,
		sumCols : []
	},
	initialize : function(){
		this.attributes.$Table = DataTableObj.attributes.$Table;
		this.attributes.$Container.find('#id_doneSum').click(_.bind(this.onDoneSelection, this));
		this.attributes.$Container.find('#id_clearSum').click(_.bind(this.onClearSelection, this));
		$('#id_editSum').click(_.bind(this.displayPanel,this));
		$('#id_removeSum').click(_.bind(this.onClearSelection,this));
	},
	generateSum : function(){
		var $lTotals = this.attributes.$Table.find("th.ao-summatory-column-selected");
		var lLength = $lTotals.size();
		var lSelectedCols = []; 
		for (var i = 0; i < lLength; i++){
			var $lTh = $lTotals.eq(i);
			var lColIndex = $lTh[0].cellIndex - 1;
			lSelectedCols.push(lColIndex);
		};
		
		this.attributes.sumCols = lSelectedCols;
		CreationManager.attributes.sumCols = lSelectedCols;
	},
	displayPanel : function(){
		this.attributes.$Container.slideToggle("fast");
		$('#id_addFunctionsBox').hide();
		
		DataTableObj.attributes.disableSelection = false;
		DataTableObj.attributes.disableRowSelection = true;	
		DataTableObj.attributes.isOverlap = true;
		DataTableObj.attributes.selectionClass = 'ao-summatory-column-selected';
		
		this.attributes.$Table.addClass("ao-summatory-mode ao-advanced-mode");
		
		this.attributes.$Table.customSelectable( "option", "disable", true);
		
		$('#id_selectionOptions a').hide();
		$('.navigationControl').hide();
	},
	editSummatory : function(){
		this.attributes.$Container.show();
		$('#id_addFunctionsBox').hide();
		
		DataTableObj.attributes.disableSelection = false;
		DataTableObj.attributes.disableRowSelection = true;	
		DataTableObj.attributes.isOverlap = true;
		DataTableObj.attributes.selectionClass = 'ao-summatory-column-selected';
		
		this.attributes.$Table.addClass("ao-summatory-mode ao-advanced-mode");
		
		this.attributes.$Table.customSelectable( "option", "disable", true);
		
		$('#id_selectionOptions a').hide();
		$('.navigationControl').hide();
	},
	onDoneSelection : function(){
		this.attributes.$Table.removeClass("ao-summatory-mode ao-advanced-mode");
		
		this.attributes.$Container.hide();
		$('#id_addFunctionsBox').slideToggle("fast");
		
		DataTableObj.attributes.disableRowSelection = false;	
		DataTableObj.attributes.isOverlap = false;
		DataTableObj.attributes.selectionClass = '';
		
		this.attributes.$Table.customSelectable( "option", "disable", false);
		
		$('#id_selectionOptions a').show();
		$('.navigationControl').show();
		
		this.generateSum();
		this.collectSummaryNotification();
	},
	onClearSelection : function(){
		var att = this.attributes;
		att.$Table.find(".ao-summatory-column-selected").removeClass('ao-summatory-column-selected');
		$('#id_sumNotification').hide();
		
		//reset any pertinent values
		att.sumCols = [];
		CreationManager.attributes.sumCols = [];
	},
	collectSummaryNotification : function(){
		if(this.attributes.$Table.find(".ao-summatory-column-selected").size() == 0){
			$('#id_sumNotification').hide();
		}else{
			$('#id_sumNotification').show();
			$('#id_functionsNotification').show();
			sideBar.attributes.lockSelection = true;
		} 
		//collectSummary.addSummaryObject(json);
	},
	reset : function(){
		var att = this.attributes;
		att.sumCols = [];
		CreationManager.attributes.sumCols = [];
		
		$('#id_sumNotification').hide();
		
		att.$Container.find('#id_doneSum').unbind('click');
		att.$Container.find('#id_clearSum').unbind('click');
	}
});
var DataTable = Backbone.Model.extend({
	defaults : {
		$Table 					: null,
		$SelectedTableColumns 	: null,
	    selectedColumns 		: 0,
		selectedCells			: 0,
		selectedRows 			: 0,
		overlapSelectedColumns 	: 0,
		overlapSelectedCells	: 0,
		overlapSelectedRows 	: 0,
		disableSelection		: false,
		disableRowSelection		: false,
		disableColumnSelection	: false,
		disableTableSelection 	: false,
		disableCellSelection 	: false,
		isOverlap				: false,
		selectionClass 			: ''
	},
	initialize : function(){
		if(this.attributes.$Table.is('div')){
			this.initDataTableDivs();
		} else if(this.attributes.$Table.is('table')){
			this.initDataTable();
		}
	},
	initDataTable : function(){
		var $lSelectedTable = this.attributes.$Table;

        var lACharCode 	= 65;
        var lRows 		= '';
        var lRowNum 	= 0;
        var lColNum 	= 0;
		var lColNumFinal= 0;
        var lCellNum 	= 0;
		var lKeyId 		= 0;
        var lRowSpans 	= [];
		
		var $lRows = $lSelectedTable.find('tr');
		var rowMax = $lRows.length;
		
		for(var i = 0; i < rowMax; i++){
			var $lRow = $lRows.eq(i);
			if($lRow.hasClass('ao-row-selectable')){
				var lCells 		= '';
	            var lColNum 	= 0;
				var lEmptyCols	= 0;
				
				var $lColumns 	= $lRow.find('> td, > th');
				var lMaxCols 	= $lColumns.length;
				
				for(var j = 0; j < lMaxCols; j++){
	                var $lCell = $lColumns.eq(j);
	                var lRowSpan;
	                try {
	                    lRowSpan = lRowSpans[lColNum];
	                }
	                catch (lException) {
	                    lRowSpan = 0;
	                }

	                if (lRowSpan > 1) {
	                    lCells = lCells + '<td><div>&nbsp;</div></td>';

	                    lRowSpans[lColNum] = lRowSpan - 1;
	                    lColNum++;
	                };
					
					var lThClass 	= "";
					if($lCell.is('th')){
						lThClass = 'ao-th';
					}
					
					var lValue = $.trim($lCell.text());
	                if(lValue.length >= 40){
	                    lValue = lValue.substring(0,30) + '...';
	                    lCells = lCells + '<td id="cell' + lCellNum + '" keyId="cell'+ lKeyId +'" title="' + $.trim($lCell.text()) +'" class="'+ lThClass +'"><div>' + lValue + '</div></td>';
	                }
					else if(lValue.length == 0){
						lCells = lCells + '<td id="cell' + lCellNum + '" keyId="cell'+ lKeyId +'" class="'+ lThClass +'"><div>&nbsp;</div></td>';
					}
					else{
						lCells = lCells + '<td id="cell' + lCellNum + '" keyId="cell'+ lKeyId +'" class="'+ lThClass +'"><div>' + lValue + '</div></td>';				
					}
					
					lKeyId++;
					
	                lRowSpan 			= $lCell.attr('rowspan');
	                lRowSpans[lColNum] 	= lRowSpan;
					
					if($.trim($lCell.text())  == ""){
						lEmptyCols++;				
					}
					lColNum++;

	                var lColSpan = $lCell.attr('colspan');
	                while (lColSpan > 1) {
						lCellNum++;
						lEmptyCols++;
	                    lCells = lCells + '<td id="cell' + lCellNum + '"><div>&nbsp;</div></td>';

	                    lRowSpans[lColNum] = lRowSpan;
	                    lColNum++;
	                    lColSpan--;
	                }
					
					if(lColNumFinal < lColNum){
						lColNumFinal = lColNum;
					}
					
	                lCellNum++;
	            }

				if(lColNum != lEmptyCols){
					lRows = lRows + '<tr id="row' + lRowNum + '">' + '<th class="ao-row-button" title="' + gettext( "APP-SELECTROW-TEXT" ) + '">' + (lRowNum + 1) + '</th>' + lCells + '</tr>';
	            	lRowNum++;
				}else{
					lCellNum = lCellNum - lColNum;
				}
			}else{
				var $lColumns 	= $lRow.find('th,td');
				var lMaxCols 	= $lColumns.length;
				
				for (var j = 0; j < lMaxCols; j++) {
					lKeyId++;
				}
			}
        }
		
        var lColumns = '<tr><th class="ao-table-button" title="' + gettext( "APP-SELECTTABLE-TEXT" ) + '">&lt;&gt;</th>';
        for (var i = 0; i < lColNumFinal; i++) {
            lColumns = lColumns + '<th id="column' + i + '" class="ao-column-button" title="' + gettext( "APP-SELECTCOLUMN-TEXT" ) + '">' + String.fromCharCode(lACharCode + i) + '</th>';
        }
        lColumns = lColumns + '</tr>';

        var lTable = '<table id="' + $lSelectedTable.attr('tableId') + '">' + lColumns + lRows + '</table>';

        this.attributes.$Table = $(lTable);
        this.attributes.$SelectedTableColumns = this.attributes.$Table.find("td[id^='column']");
	},
	initDataTableDivs : function(){
		var $lSelectedTable = this.attributes.$Table;

        var lACharCode 	= 65;
        var lRows 		= '';
        var lRowNum 	= 0;
        var lColNum 	= 0;
		var lColNumFinal= 0
        var lCellNum 	= 0;
        var lRowSpans 	= [];
		
		var $lRows = $lSelectedTable.find('.ao-row-selectable');
		var rowMax = $lRows.length;

		for(var i = 0; i < rowMax; i++){
			var $lRow 		= $lRows.eq(i);
            var lCells 		= '';
            var lColNum 	= 0;
			var lEmptyCols	= 0
			
			var $lColumns 	= $lRow.find('.ao-cell-selectable');
			var lMaxCols 	= $lColumns.length;
			
			for(var j = 0; j < lMaxCols; j++){
                var $lCell = $lColumns.eq(j);
				var lValue = $.trim($lCell.text());
				
                if(lValue.length >= 40){
                    lValue = lValue.substring(0,30) + '...';
                    lCells = lCells + '<td id="cell' + lCellNum + '" title="' + $.trim($lCell.text()) +'" ><div>' + lValue + '</div></td>';
                }
				else if(lValue.length == 0){
					lCells = lCells + '<td id="cell' + lCellNum + '"><div>&nbsp;</div></td>';
				}
				else{
					lCells = lCells + '<td id="cell' + lCellNum + '"><div>' + lValue + '</div></td>';				
				}
				
				if($.trim($lCell.text())  == ""){
					lEmptyCols++;				
				}
				lColNum++;

				if(lColNumFinal < lColNum){
					lColNumFinal = lColNum;
				}
                lCellNum++;
            }

			if(lColNum != lEmptyCols){
				lRows = lRows + '<tr id="row' + lRowNum + '">' + '<th class="ao-row-button" title="' + gettext( "APP-SELECTROW-TEXT" ) + '">' + (lRowNum + 1) + '</th>' + lCells + '</tr>';
            	lRowNum++;
			}else{
				lCellNum = lCellNum - lColNum;
			}
        }
		
        var lColumns = '<tr><th class="ao-table-button" title="' + gettext( "APP-SELECTTABLE-TEXT" ) + '">&lt;&gt;</th>';
        for (var i = 0; i < lColNumFinal; i++) {
            lColumns = lColumns + '<th id="column' + i + '" class="ao-column-button" title="' + gettext( "APP-SELECTCOLUMN-TEXT" ) + '">' + String.fromCharCode(lACharCode + i) + '</th>';
        }
        lColumns = lColumns + '</tr>';

        var lTable = '<table id="' + $lSelectedTable.attr('divid') + '">' + lColumns + lRows + '</table>';

        this.attributes.$Table = $(lTable);
        this.attributes.$SelectedTableColumns = this.attributes.$Table.find("td[id^='column']");
	},
	onSelectCellButtonClicked: function(pEvent){
		var att = this.attributes;
		
		if(att.disableSelection == true){
			return false;
		}

        var $lTarget = $(pEvent.target);
        var $lCell;
		
		if($lTarget.is('a')){
			$lCell = $lTarget.parent();
		}
		else{
			$lCell = $lTarget;
		}
		
        if ($lCell.is('th')) {
			if ($lCell.hasClass('ao-column-button')) {
				if(att.disableColumnSelection == false){
					this.selectColumnHandler($lCell, pEvent);
					this.notifySelection();
				}
				return;
			}
			
			if ($lCell.hasClass('ao-row-button')) {
				if(att.disableRowSelection == false){
					this.selectRowHandler($lCell, pEvent);
					this.notifySelection();
				}
				return;
			}
			
			if ($lCell.hasClass('ao-table-button')) {
				if(att.disableTableSelection == false){
					this.selectTableHandler($lCell, pEvent);
					this.notifySelection();
				}
				return;
			}
		}
		
		if($lCell.is('div')){
			if(att.disableCellSelection == false){
				this.selectCellHandler($lCell, pEvent);
				this.notifySelection();
			}
			else{
				this.disableSelecion();
			}
		}
    },
	notifySelection : function(){
		//method to be overriden
	},
	selectCellHandler : function(pCell, pEvent){
		if(!this.attributes.isOverlap){
			this.cellEvent(pCell);
		}else{
			this.overlapCellEvent(pCell);
		}
	},
	cellEvent : function(pCell){
		var att = this.attributes;
		if( att.selectedRows > 0 || att.selectedColumns > 0) {
			jQuery.TwitterMessage( { type: 'warning', message : gettext( "APP-SELECTROWSANDCELLS-ERROR" ) } );
            return false;
        }
        if (att.$Table.hasClass('ao-table-selected')) {
			att.$Table.find('.ao-table-button').removeClass('ao-table-selected');
			att.$Table.removeClass('ao-table-selected').find('td.ao-table-selected').removeClass('ao-table-selected');
		}

		if (pCell.parent().hasClass('ao-cell-selected')) {
			pCell.parent().removeClass('ao-cell-selected');
			att.selectedCells--;
		}
		else {
			pCell.parent().addClass('ao-cell-selected');
			att.selectedCells++;
		}
	},
	overlapCellEvent : function(pCell){
		var att = this.attributes;
		var lClass = att.selectionClass;
		
		if( att.overlapSelectedRows > 0 || att.overlapSelectedColumns > 0) {
			jQuery.TwitterMessage( { type: 'warning', message : gettext( "APP-SELECTROWSANDCELLS-ERROR" ) } );
            return false;
        }
        if (att.$Table.hasClass(lClass)) {
			att.$Table.find('.ao-table-button').removeClass(lClass);
			att.$Table.removeClass(lClass).find('td.'+lClass).removeClass(lClass);
		}

		if (pCell.parent().hasClass(lClass)) {
			pCell.parent().removeClass(lClass);
			att.overlapSelectedCells--;
		}
		else {
			pCell.parent().addClass();
			att.overlapSelectedCells++;
		}
	},
	selectColumnHandler : function(pCell, pEvent){
		if(!this.attributes.isOverlap){
			this.columnEvent(pCell);
		}else{
			this.overlapColumnEvent(pCell);
		}
	},
    columnEvent : function(pCell){
    	var att = this.attributes;
        if (att.selectedCells > 0) {
			jQuery.TwitterMessage( { type: 'warning', message : gettext( "APP-SELECTROWSANDCELLS-ERROR" ) } );
			return false;
        }

		if (att.$Table.hasClass('ao-table-selected')) {
			att.$Table.removeClass('ao-table-selected').find('td, th, .ao-table-selected').removeClass('ao-table-selected');
		}
		
        var $lColumn 	= pCell;
        var lIndex 		= $lColumn[0].cellIndex -1;
        var $lRows		= att.$Table.find('tr');
		var lRowLength  = $lRows.size();
		
        $lColumn.toggleClass('ao-column-selected');

        if ($lColumn.hasClass('ao-column-selected')) {
			for(i = 0; i < lRowLength; i++){
				var $lCell = $('td', $lRows.eq(i)).eq(lIndex);
                $lCell.addClass('ao-column-selected');
			}
            att.selectedColumns++
        }
        else {
			for (i = 0; i < lRowLength; i++) {
                var $lCell = $('td', $lRows.eq(i)).eq(lIndex);
				$lCell.removeClass('ao-column-selected');
			}
			att.selectedColumns--
        }
    },
	overlapColumnEvent : function(pCell){
		var att = this.attributes;
		var lClass = att.selectionClass;
		
        if (att.overlapSelectedCells > 0) {
			jQuery.TwitterMessage( { type: 'warning', message : gettext( "APP-SELECTROWSANDCELLS-ERROR" ) } );
			return false;
        }

		if (att.$Table.hasClass(lClass)) {
			att.$Table.removeClass(lClass).find('td, th, .'+lClass).removeClass(lClass);
		}
		
        var $lColumn 	= pCell;
        var lIndex 		= $lColumn[0].cellIndex -1;
		var $lRows		= att.$Table.find('tr');
		var lRowLength  = $lRows.size();
        var lCorrectSelection = false;
		
		for (i = 0; i < lRowLength; i++) {
			var $lCell = $('td', $lRows.eq(i)).eq(lIndex);
            if($lCell.hasClass('ao-row-selected') || $lCell.hasClass('ao-cell-selected') || $lCell.hasClass('ao-column-selected') || $lCell.hasClass('ao-table-selected')){
				lCorrectSelection = true;
			}
		}
		
		if (lCorrectSelection) {
			$lColumn.toggleClass(lClass);
			if ($lColumn.hasClass(lClass)) {
				for (i = 0; i < lRowLength; i++) {
					var $lCell = $('td', $lRows.eq(i)).eq(lIndex);
					$lCell.addClass(lClass);
				}
				att.overlapSelectedColumns++
			}
			else {
				for (i = 0; i < lRowLength; i++) {
					var $lCell = $('td', $lRows.eq(i)).eq(lIndex);
					$lCell.removeClass(lClass);
				}
				att.overlapSelectedColumns--
			}
		}
	},
	selectRowHandler : function(pCell, pEvent){
		if(!this.attributes.isOverlap){
			this.rowEvent(pCell);
		}else{
			this.overlapRowEvent(pCell);
		}
	},
    rowEvent : function(pCell){
		var att 	= this.attributes;
        var $lCell 	= pCell;
        var $lRow 	= $lCell.parents("tr:first");

        if (att.selectedCells > 0) {
			jQuery.TwitterMessage( { type: 'warning', message : gettext( "APP-SELECTROWSANDCELLS-ERROR" ) } );
            return;
        }
		
		if (att.$Table.hasClass('ao-table-selected')) {
			att.$Table.removeClass('ao-table-selected').find('td, th, .ao-table-selected').removeClass('ao-table-selected');
		}

        $lRow.toggleClass('ao-row-selected');
        $lCell.toggleClass('ao-row-selected');
		
		var $lRowCells = $('td', $lRow);
		var lCellLength = $lRowCells.size();
		
        if ($lRow.hasClass('ao-row-selected')) {
			for(i = 0; i < lCellLength; i++){
				var $lCell = $lRowCells.eq(i);
                $lCell.addClass('ao-row-selected');
			}
			att.selectedRows++
        }
        else {
			for (i = 0; i < lCellLength; i++) {
				var $lCell 		= $lRowCells.eq(i);
                var lIndex 		= $lCell[0].cellIndex;
                var $lColumn 	= this.attributes.$SelectedTableColumns.eq(lIndex);

                if ($lColumn.hasClass('ao-column-selected')) {
                    $lCell.addClass('ao-column-selected');
                }

                $lCell.removeClass('ao-row-selected');
			}
			att.selectedRows--
        }
    },
	overlapRowEvent : function(pCell){
		var att 	= this.attributes;
        var $lCell 	= pCell;
        var $lRow 	= $lCell.parents("tr:first");
		var lClass 	= att.selectionClass;

        if (att.overlapSelectedCells > 0) {
			jQuery.TwitterMessage( { type: 'warning', message : gettext( "APP-SELECTROWSANDCELLS-ERROR" ) } );
            return;
        }
		
		if (att.$Table.hasClass(lClass)) {
			att.$Table.removeClass(lClass).find('td, th, .'+lClass).removeClass(lClass);
		}
		
		var $lRowCells = $('td', $lRow);
		var lCellLength = $lRowCells.size();
		var lCorrectSelection = false;
		
		for (i = 0; i < lCellLength; i++) {
			var $lCell = $lRowCells.eq(i);
            if($lCell.hasClass('ao-row-selected') || $lCell.hasClass('ao-cell-selected') || $lCell.hasClass('ao-column-selected') || $lCell.hasClass('ao-table-selected')){
				lCorrectSelection = true;
			}
		}
		
		if (lCorrectSelection) {
			$lRow.toggleClass(lClass);
			$lCell.toggleClass(lClass);
			
			if ($lRow.hasClass(lClass)) {
				for (i = 0; i < lCellLength; i++) {
					var $lCell = $lRowCells.eq(i);
					$lCell.addClass(lClass);
				}
				att.overlapSelectedRows++
			}
			else {
				for (i = 0; i < lCellLength; i++) {
					var $lCell = $lRowCells.eq(i);
					var lIndex = $lCell[0].cellIndex;
					var $lColumn = this.attributes.$SelectedTableColumns.eq(lIndex);
					
					if ($lColumn.hasClass(lClass)) {
						$lCell.addClass(lClass);
					}
					
					$lCell.removeClass(lClass);
				}
				att.overlapSelectedRows--
			}
		}
	},
	selectTableHandler : function(pCell, pEvent){
		if(!this.attributes.isOverlap){
			this.tableEvent(pCell);
		}else{
			this.overlapTableEvent(pCell);
		}
	},
    tableEvent: function(pCell){
		var att = this.attributes;
		this.resetDataTable();
		
        if (att.$Table.hasClass('ao-table-selected')) {
			pCell.removeClass('ao-table-selected');
            att.$Table.removeClass('ao-table-selected').find('td.ao-table-selected').removeClass('ao-table-selected');
        }
        else {
			pCell.addClass('ao-table-selected');
            att.$Table.addClass('ao-table-selected').find('td').addClass('ao-table-selected');
			att.$Table.find('td,th, .ao-column-selected').removeClass('ao-column-selected');
			att.$Table.find('td,th, .ao-row-selected').removeClass('ao-row-selected');
			att.$Table.find('td,th, .ao-cell-selected').removeClass('ao-cell-selected');
        }
    },
	overlapTableEvent: function(pCell){
		//corregir despues y ver lo del reset de los campos overlap
		var att = this.attributes;
		var lClass 	= att.selectionClass;
		
        if (att.$Table.hasClass(lClass)) {
			pCell.removeClass(lClass);
            att.$Table.removeClass(lClass).find('.'+lClass).removeClass(lClass);
        }
        else {
			pCell.addClass(lClass);
            att.$Table.addClass(lClass).find('td').addClass(lClass);
			att.$Table.find('td,th, .'+lClass).removeClass(lClass);
        }
	},
	enableSelection : function(pClass){
		var att = this.attributes;
		att.$Table.customSelectable( "option", "selectionClass", pClass );
		att.$Table.customSelectable( "option", "disable", false);
		att.selectionClass = pClass;
		att.disableSelection = false;
	},
	disableSelecion : function(){
		var att = this.attributes;
		att.$Table.customSelectable( "option", "selectionClass", "" );
		att.$Table.customSelectable( "option", "disable", true);
		att.$Table.selectionClass = "";
		att.$Table.disableSelection = true;
	},
	reset : function(){
		this.resetDataTable();
	},
	resetDataTable : function(){
		this.attributes.selectedCells 	= 0;
		this.attributes.selectedColumns = 0;
		this.attributes.selectedRows 	= 0;
	}
});

var DataTableCreation = DataTable.extend({
	defaults : {
		parameters : [],
		fixedValues : []
	},
	initialize : function(){
		DataTable.prototype.initialize.call(this);
		
		_.defaults(this.attributes, DataTable.prototype.defaults);		
		
		this.initFilters();
		this.initComputeCells();
		this.initAliases();
		this.attributes.$Table.click(_.bind(this.onSelectCellButtonClicked, this));
		this.attributes.$Table.customSelectable({'selectionClass' : 'ao-cell-selected', 'disable' : false, 'dataTable' : this});
	},
	initFilters : function(){
		//fix to eliminate duplicate tooltips when going back and forth between steps
		$('[id*=id_filterTooltip_]').remove();
		
		var att 		= this.attributes;
		var lColNum 	= att.$Table.find('.ao-column-button').size();
		var lfilters 	= '<tr id="id_filters_' + att.$Table.attr('id') + '" class="ao-filter-row"><th class="ao-empty-cell"></th>';

		for (var i = 0; i < lColNum; i++) {
            lfilters = lfilters + '<th id="id_filter_column'+i+'_' + att.$Table.attr('id') + '" class="ao-column-filter-button" title="Add Filter"><a href="javascript:;" id="id_addFilterButton_column'+i+'_' + att.$Table.attr('id') + '" rel="#id_filterTooltip_column'+i+'_' + att.$Table.attr('id') + '">' + gettext( "APP-FILTER-TEXT" ) + '</a></th>';
        }
        lfilters = lfilters + '</tr>';
		
		att.$Table.prepend(lfilters);
		
		this.initFilter(att.$Table);

		$('[id*=id_typeOfFilter_]').change( _.bind(this.onSelectFilter, this) );
	    $('a[id*=id_setFilterTooltipButton_]').click( _.bind(this.onFilterTooltipClosed, this) );
		$('a[id*=id_cancelFilterTooltipButton_]').click( _.bind(this.onFilterTooltipClose, this) );
		$('a[id*=id_closeToolTip_]').click( _.bind(this.onTooltipClose, this) );

		$('#id_filterToolBar').click(_.bind(this.onFilterToolbarClicked, this));
		
		att.$Table.find('[id*=id_addFilterButton]').css('display','none');
	},
	initFilter : function(pTable){
		
		var $lTable = pTable;
	    var $lCols  = $lTable.find("th[id^='column']");
	    var lTableId= $lTable.attr('id');

	    for(var i = 0; i < $lCols.length; i++){
			var lColId = $lCols[i].id;
			var lLastFilterClass = '';
			if(i == $lCols.length -1){
				lLastFilterClass = "lastFilter";
			}
	        var lHtmlTooltip = '<div class="ao-filter-tooltip ao-positionable '+lLastFilterClass+'" id="id_filterTooltip_' + lColId + '_' + lTableId + '" data="'+i+'">'+
	        						'<div class="ao-inner">'+
	       								'<div class="ao-punta"></div>'+
	        							'<h2>' + gettext( "APP-ADDFILTER-TEXT" ) + '</h2>'+
										'<a href="javascript:;" id="id_closeToolTip_' + lColId + '_' + lTableId + '" class="close" rel="#id_filter_' + lColId + '_' + lTableId + '" title="' + gettext( "APP-CLOSE-TEXT" ) + '">' + gettext( "APP-CLOSE-TEXT" ) + '</a>'+
	       								'<div class="ao-wrapper">'+
        									'<h3>' + gettext( "APP-SELECTFILTER-TEXT" ) + ':</h3>'+
        									'<table>'+
        										'<tr>'+
        											'<td>'+
        												'<label for="id_operator_' + lColId + '_' + lTableId + '">' + gettext( "APP-VALUES-TEXT" ) + '</label>'+
        											'</td>'+
        											'<td>'+
        												'<select id="id_operator_' + lColId + '_' + lTableId + '" class="ao-field">'+
        													'<option value="00" selected="selected">' + gettext( "APP-AREEQUALTO-TEXT" ) + '</option>'+
        													'<option value="01">' + gettext( "APP-AREGREATERTHAN-TEXT" ) + '</option>'+
        													'<option value="02">' + gettext( "APP-ARESMALLERTHAN-TEXT" ) + '</option>'+
        													'<option value="03">' + gettext( "APP-ARENOTEQUALTO-TEXT" ) + '</option>'+
        													'<option value="04">' + gettext( "APP-CONTAINS-TEXT" ) + '</option>'+
        												'</select>'+
        											'</td>'+
													'<td>'+
														'<label for="id_typeOfFilter_' + lColId + '_' + lTableId + '" class="second">' + gettext( "APP-A-TEXT" ) + '</label>'+
													'</td>'+
													'<td>'+
														'<select id="id_typeOfFilter_' + lColId + '_' + lTableId + '" class="ao-field second">'+
        													'<option value="none" selected="selected">' + gettext( "APP-SELECT-TEXT" ) + '</option>'+
        													'<option value="filter">' + gettext( "APP-PARAMETER-TEXT" ) + '</option>'+
        													'<option value="fixedvalue">' + gettext( "APP-FIXEDVALUE-TEXT" ) + '</option>'+
        												'</select>'+
													'</td>'+
        										'</tr>'+
        									'</table>'+
											'<div id="id_filterContainer_' + lColId + '_' + lTableId + '" class="parameterBox DN">'+
	        									'<form id="id_filterFrm_'+lColId+'_'+lTableId+'">'+
													'<h3>' + gettext( "APP-ENTERA-TEXT" ) + gettext( "APP-PARAMETER-TEXT" ) + ':</h3>'+
													'<table>'+
							      						'<tr>'+
							      							'<td>'+
							      								'<label for="id_parameter-name_' + lColId + '_' + lTableId + '">' + gettext( "APP-NAME-TEXT" ) + ':</label>'+
							      							'</td>'+
							      							'<td>'+
																'<div class="formErrorMessageContainer">'+
							      									'<input id="id_parameter-name_' + lColId + '_' + lTableId + '" type="text" value="" name="parameter-name_' + lColId + '_' + lTableId + '" size="33" maxlength="30" class="ao-field"/>'+
							      								'</div>'+
															'</td>'+
							      						'</tr>'+
							      						'<tr>'+
							      							'<td>'+
							      								'<label for="id_parameter-description_' + lColId + '_' + lTableId + '">' + gettext( "APP-DESCRIPTION-TEXT" ) + ':</label>'+
							      							'</td>'+
							      							'<td>'+
																'<div class="formErrorMessageContainer">'+
							      									'<input id="id_parameter-description_' + lColId + '_' + lTableId + '" type="text" value="" name="parameter-description_' + lColId + '_' + lTableId + '" size="33" maxlength="100" class="ao-field"/>'+
							      								'</div>'+
															'</td>'+
							      						'</tr>'+
														'<tr>'+
							      							'<td>'+
							      								'<label for="id_parameterValue_' + lColId + '_' + lTableId + '">' + gettext( "APP-DEFAULTVALUE-TEXT" ) + ':</label>'+
							      							'</td>'+
							      							'<td>'+
																'<div class="formErrorMessageContainer">'+
							      									'<input id="id_parameterValue_' + lColId + '_' + lTableId + '" type="text" value="" name="parameterValue_' + lColId + '_' + lTableId + '" size="33" maxlength="100" class="ao-field"/>'+
							      								'</div>'+
															'</td>'+
							      						'</tr>'+
							      					'</table>'+
							      					'<input id="id_parameter-position_' + lColId + '_' + lTableId + '" type="hidden" value="-1"/>'+
												'</form>'+
											'</div>'+
											'<div id="id_fixedContainer' + lColId + '_' + lTableId + '" class="fixedValueBox DN">'+
	        									'<form id="id_fixedValueForm_'+lColId+'_'+lTableId+'">'+
													'<h3>' + gettext( "APP-ENTERA-TEXT" ) + gettext( "APP-FIXEDVALUE-TEXT" ) + ':</h3>'+
													'<table>'+
							      						'<tr>'+
							      							'<td>'+
							      								'<label for="id_fixedValue_' + lColId + '_' + lTableId + '">' + gettext( "APP-VALUE-TEXT" ) + ':</label>'+
							      							'</td>'+
							      							'<td>'+
																'<div class="formErrorMessageContainer">'+
							      									'<input id="id_fixedValue_' + lColId + '_' + lTableId + '" type="text" value="" name="fixed-value_' + lColId + '_' + lTableId + '" size="33" maxlength="100" class="ao-field"/>'+
							      								'</div>'+
															'</td>'+
							      						'</tr>'+
							      					'</table>'+
												'</form>'+
											'</div>'+
						      		'</div>'+
											'<div id="id_buttons_' + lColId + '_' + lTableId + '" class="clearfix buttons DN">'+
												'<a href="javascript:;" id="id_setFilterTooltipButton_' + lColId + '_' + lTableId + '" class="button green small FL" rel="#id_filter_' + lColId + '_' + lTableId + '" title="' + gettext( "APP-SET-TEXT" ) + '">' + gettext( "APP-SET-TEXT" ) + '</a>'+
												'<a href="javascript:;" id="id_cancelFilterTooltipButton_' + lColId + '_' + lTableId + '" class="button alpha small FL" rel="#id_filter_' + lColId + '_' + lTableId + '" title="' + gettext( "APP-CLEARFILTER-TEXT" ) + '">' + gettext( "APP-CLEARFILTER-TEXT" ) + '</a>'+
											'</div>'+
						      		'</div>'+
						      	'</div>';

	        $('body').append(lHtmlTooltip);
			
			var lOptions = new Object();
			lOptions['rules'] = new Object();
			lOptions['messages'] = new Object();
			lOptions['rules']['parameter-name_' + lColId + '_' + lTableId] = {'required': true, 'maxlength': 40, 'regex': /^[a-zA-ZñÑ\s\W]/};
			lOptions['rules']['parameter-description_' + lColId + '_' + lTableId] = {'required':true, 'maxlength': 40, 'regex': /^[a-zA-ZñÑ\s\W]/};
			lOptions['rules']['parameterValue_' + lColId + '_' + lTableId] = {'required':true, 'maxlength': 40, 'regex': /^[a-zA-ZñÑ\s\W]/};
			
			lOptions['messages']['parameter-name_' + lColId + '_' + lTableId] = {'regex': gettext( "VALIDATE-REGEX" )};
			lOptions['messages']['parameter-description_' + lColId + '_' + lTableId] = {'regex': gettext( "VALIDATE-REGEX" )};
			lOptions['messages']['parameterValue_' + lColId + '_' + lTableId] = {'regex': gettext( "VALIDATE-REGEX" ) };

			$('#id_filterFrm_'+lColId+'_'+lTableId).validate(lOptions);
			
			var lOptions2 = new Object();
			lOptions2['rules'] = new Object();
			lOptions2['messages'] = new Object();
			lOptions2['rules']['fixed-value_' + lColId + '_' + lTableId] = {'required': true, 'maxlength': 40, 'regex': /^[a-zA-Z0-9 ]+$/};
			lOptions2['messages']['fixed-value_' + lColId + '_' + lTableId] = {'regex': gettext( "VALIDATE-REGEX" ) };
			
			$('#id_fixedValueForm_'+lColId+'_'+lTableId).validate(lOptions2);
	    };
	},
	onSelectFilter : function(pEvent){
		var $lTarget 	= $(pEvent.target);
		var $lToolTip 	= $lTarget.parents('div.ao-filter-tooltip');
		
		if($lTarget.val() == "filter"){
			$lToolTip.find('[id*=id_filterContainer_]').show();
			$lToolTip.find('[id*=id_fixedContainer]').hide();
			$lToolTip.find('[id*=id_buttons_]').show();
			this.resetFixedValueFilter($lToolTip);
		}
		if($lTarget.val() == "fixedvalue"){
			$lToolTip.find('[id*=id_filterContainer_]').hide();
			$lToolTip.find('[id*=id_fixedContainer]').show();
			$lToolTip.find('[id*=id_buttons_]').show();
			this.resetParamterFilter($lToolTip);
		}
		if($lTarget.val() == "none"){
			$lToolTip.find('[id*=id_filterContainer_]').hide();
			$lToolTip.find('[id*=id_fixedContainer]').hide();
			$lToolTip.find('[id*=id_buttons_]').hide();
			this.resetParamterFilter($lToolTip);
			this.resetFixedValueFilter($lToolTip);
		}
	},
	onFilterToolbarClicked : function(pEvent){
		var $lTarget = $(pEvent.target);
		if($lTarget.is('a')){
			var lIndex = $lTarget.attr('data');
			filterOption.editFilter();
			$('[id*=id_filterTooltip_column]').fadeOut('fast');
			$('[id*=id_filterTooltip_column' + lIndex + '_]').fadeIn('fast');
		}
		if($lTarget.is('span')){
			var lIndex = $lTarget.parent().attr('data');
			filterOption.editFilter();
			$('[id*=id_filterTooltip_column]').fadeOut('fast');
			$('[id*=id_filterTooltip_column' + lIndex + '_]').fadeIn('fast');
		}
		
		return false;
	},
	initAliases : function(){
		var att 		= this.attributes;
		var lColumns 	= att.$Table.find('.ao-column-filter-button');
		var lColNum 	= lColumns.size();
		
		for (var i = 0; i < lColNum; i++) {
            var lAliases = '<input id="id_aliasesInput_'+i+'_'+att.$Table.attr('id')+'" type="input" data="'+i+'" class="aliasField shadowText" value="' + gettext( "APP-SETALIAS-TEXT" ) + '"/>';
			lColumns.eq(i).append(lAliases);
        }
		
		att.$Table.find('[id*=id_aliasesInput_]').css('display','none');
	},
	initComputeCells : function(){
		var att 		= this.attributes;
		var $lRows		= att.$Table.find('tr');
		
		for (var j = 0; j < $lRows.size(); j++) {
			var l$Row = $lRows.eq(j);
			var lCell  = '';
			if(j == 0){
				lCell = '<th title="" class="ao-no-select DN"></th>';
			}
			if(j == 1){
				lCell = '<th id="id_col_compute" title="Compute Field" class="ao-column-button ao-no-select ao-compute-cell DN">Fx()</th>';
			}
			if(j > 1){
				lCell = '<td id="id_column_'+j+'_' + att.$Table.attr('id') + '" class="ao-compute-cell ao-no-select DN"><div>&nbsp;</div></td>';
			}
			l$Row.append(lCell);
		}
		
		var lColNum 	= att.$Table.find('.ao-column-button').size();
		var lComputeRow = '<tr id="id_compute_' + att.$Table.attr('id') + '" class="ao-compute-row ao-no-select DN"><th title="Compute Field" class="ao-row-button ao-no-select DN">' + gettext( "APP-TOTALS-TEXT" ) + '</th>';

		for (var i = 0; i < lColNum; i++) {
            if(i == lColNum - 1){
				lComputeRow += '<td id="id_lastCell_'+i+'_' + att.$Table.attr('id') + '" class="ao-compute-cell ao-no-select ao-intersection-compute-cell DN" title=""><div>&nbsp;</div></td>';			
			}else{
				lComputeRow += '<td id="id_compute_row_'+i+'_' + att.$Table.attr('id') + '" class="ao-compute-cell ao-no-select DN" title=""><div>&nbsp;</div></td>';
			}
        }
        lComputeRow += '</tr>';
		
		att.$Table.append(lComputeRow);
	},
	notifySelection : function(){
		sideBar.selectionStarted();
	},
	selectCellHandler : function(pCell, pEvent){
		if(!pCell.parent().hasClass('ao-no-select')){
			if(!this.attributes.isOverlap){
				if (sideBar.attributes.lockSelection) {
					if (confirm( gettext( "APP-CHANGESELECTION-WARNING" ) )) {
						sideBar.resetLockSelection();
						this.cellEvent(pCell);
					}
				}else{
					this.cellEvent(pCell);
				}
			}else{
				this.overlapCellEvent(pCell);
			}	
		}
	},
	onSelectCellButtonClicked : function(pEvent){
		$('div.ao-filter-tooltip').fadeOut('fast');
		
		DataTable.prototype.onSelectCellButtonClicked.call(this, pEvent);
					
		var $lTarget = $(pEvent.target);
        var $lCell;
		
		if($lTarget.is('a')){
			$lCell = $lTarget.parent();
		}
		else{
			$lCell = $lTarget;
		}
		
		if ($lCell.is('th')) {
			if ($lCell.hasClass('ao-column-filter-button')) {
				if ($lTarget.is('a')) {
		 			this.onFilterTooltipShowed($lTarget);
		 		}
		 	}
		}
	},
	selectColumnHandler : function(pCell, pEvent){
		if(!this.attributes.isOverlap){
			if(pEvent.shiftKey){
				//this.selectMultipleColumns(pCell);
			}else{
				if (!pCell.hasClass('ao-no-select')) {
					if (sideBar.attributes.lockSelection) {
						if (confirm( gettext( "APP-CHANGESELECTION-WARNING" ) )) {
							sideBar.resetLockSelection();
							this.columnEvent(pCell);
						}
					}else{
						this.columnEvent(pCell);
					}
				}				
			}
		}else{
			if (!pCell.hasClass('ao-no-select')) {
				this.overlapColumnEvent(pCell);
			}	
		}
	},
	selectRowHandler : function(pCell, pEvent){
		if(!this.attributes.isOverlap){
			if (!pCell.parent().hasClass('ao-no-select')) {
				if (sideBar.attributes.lockSelection) {
					if (confirm( gettext( "APP-CHANGESELECTION-WARNING" ) )) {
						sideBar.resetLockSelection();
						if (pEvent.shiftKey) {
							this.selectMultipleRows(pCell);
						}
						else {
							this.rowEvent(pCell);
						}
					}
				}else{
					if (pEvent.shiftKey) {
						this.selectMultipleRows(pCell);
					}
					else {
						this.rowEvent(pCell);
					}
				}
			}
		}else{
			this.overlapRowEvent(pCell);
		}
	},
	selectMultipleRows : function(pCell){
		var $lRows = this.attributes.$Table.find('tr');
		var lFirstSelectedRow = this.attributes.$Table.find('tr.ao-row-selected')[0].rowIndex;
		var lLastSelectedRow = pCell.parent()[0].rowIndex;
		for (var i = lFirstSelectedRow; i <= lLastSelectedRow; i++) {
			$lRows.eq(i).addClass('ao-row-selected');
			$lRows.eq(i).find('th,td').addClass('ao-row-selected');
		}
		this.attributes.selectedRows = this.attributes.$Table.find('th.ao-row-selected').size();
	},
	selectMultipleColumns : function(pCell){
		//implement later
	},
	selectTableHandler : function(pCell, pEvent){
		if(!this.attributes.isOverlap){
			if (sideBar.attributes.lockSelection) {
				if (confirm( gettext( "APP-CHANGESELECTION-WARNING" ) )) {
					sideBar.attributes.lockSelection = false;
					sideBar.clearSelection();
					this.tableEvent(pCell);
				}
			}else{
				this.tableEvent(pCell);
			}
		}else{
			this.overlapTableEvent(pCell);
		}
	},
	onFilterTooltipShowed : function(pCell){
		$('div.ao-filter-tooltip').fadeOut('fast');
		
	    var $lButton    = $(pCell);
	    var $lFilter    = $lButton.parents('th[id*=id_filter_]');
	    var $lTable     = $lFilter.parents('table:first');
	    var lIndex      = $lFilter.get(0).cellIndex;
	
	    var $lTooltip   = $($lButton.attr('rel'));
	    var lOffset     = $lButton.offset();
	
	    $lTooltip.fadeIn('fast');

		$lTooltip.css({
	                    top: lOffset.top + -23,
	                    left: lOffset.left + -417
	                });

	    $('tr.ao-row-selectable', $lTable).each(function(i){
	        var $lCell = $('td', this).eq(lIndex);
	        $lCell.addClass('ao-column-filtered');
	    });
	},
	onFilterTooltipClosed : function(pEvent){
	    var $lTrigger   = $(pEvent.target);
	    var $lFilter    = $($lTrigger.attr('rel'));
	    var $lTooltip   = $lTrigger.parents('div.ao-filter-tooltip');
		var lFilterType = $lTooltip.find('[id*=id_typeOfFilter_]').val();
		//check this value
		var $lTable     = $lFilter.parents('table:first');

		if(lFilterType == "filter"){
			var lName           = $lTooltip.find('input[id*=id_parameter-name_]').val().toLowerCase().replace(new RegExp("/\W/g"), "");
	    	var lDescription    = $lTooltip.find('input[id*=id_parameter-description_]').val();
			var lValue			= $lTooltip.find('input[id*=id_parameterValue_]').val();
	    	var lParameter      = lName + "&" + lValue;
			var lEmptyForm		= lName + lDescription + lValue;
			
			if ($lTooltip.find('[id*=id_filterFrm_]').valid() == true) {
			
				this.attributes.parameters.unshift(lParameter);
				var _self = this;
				var lParameters = jQuery.grep(this.attributes.parameters, function(pParameter, pIndex){
					if (pIndex > 0) {
						var lParameter0 	= _self.attributes.parameters[0].split(",");
						var lName0 			= lParameter0[0];
						var lDescription0 	= lParameter0[1];
						
						var lParameter 		= pParameter.split(",");
						var lName 			= lParameter[0];
						var lDescription 	= lParameter[1];
						
						if (lName0 == lName) {
							if (lDescription0 != lDescription) {
								if (lDescription0.length > 0) {
									var lNewParameter = lName0 + ", " + lDescription0;
									_self.attributes.parameters[pIndex] = lNewParameter;
									var $lNames = $('input[id*=id_parameter-name]').filter('[value=' + lName0 + ']');
									
									for (var i = 0; i < $lNames.length; i++) {
										var $lName 		= $lNames.eq(i);
										var $lTooltip 	= $lName.parents('div.ao-filter-tooltip');
										
										$lTooltip.find('input[id*=id_parameter-description_]').val(lDescription0);
									}
								}
							}
							
							return true;
						}
					}
					
					return false;
				});
				
				if (lParameters.length == 0) {
					if (lName.length > 0) {
						this.attributes.parameters.push(lParameter);
					}
				}
				
				this.attributes.parameters.splice(0, 1);
				
				var lIndex = $lFilter.get(0).cellIndex;
				$('tr.ao-row-selectable', $lTable).each(function(i){
					var $lCell = $('td', this).eq(lIndex);
					$lCell.removeClass('ao-column-filtered');
				});
				
				//display column filter bar
				$('#id_filterToolBar').show();
				
				lIndex--;
				if($('#id_columnFilter_' + lIndex).size() == 0){
					var columnLetter = this.attributes.$Table.find('.ao-column-button').eq(lIndex).text();
					$('#id_filterToolBar dl').append('<dd id="id_columnFilter_'+lIndex+'" class="clearfix"><span class="Icon ic_Arrow FL">Column '+columnLetter+'</span><a data="'+lIndex+'" href="javascript:;" class="editButton" title="' + gettext( "APP-EDIT-TEXT" ) + '"><span class="sep">|</span><span class="editText">' + gettext( "APP-EDIT-TEXT" ) + '</span></a></dd>');
				}
				
				//close Tooltip
				$lTooltip.fadeOut('fast');
			}
		}
		else if(lFilterType == "fixedvalue"){
			if ($lTooltip.find('[id*=id_fixedValueForm_]').valid() == true) {
				var lValue = $lTooltip.find('input[id*=id_fixedValue_]').val();
				
				this.attributes.fixedValues.push(lValue);
				
				//display column filter bar
				$('#id_filterToolBar').show();
				
				var lIndex = $lFilter.get(0).cellIndex;
				
				lIndex--;
				if($('#id_columnFilter_' + lIndex).size() == 0){
					$lTooltip.find('input[id*=id_parameter-position_]').val('0');
					var columnLetter = this.attributes.$Table.find('.ao-column-button').eq(lIndex).text();
					$('#id_filterToolBar dl').append('<dd id="id_columnFilter_'+lIndex+'" class="clearfix"><span class="Icon ic_Arrow FL">Column '+columnLetter+'</span><a data="'+lIndex+'" href="javascript:;" class="editButton" title="' + gettext( "APP-EDIT-TEXT" ) + '"><span class="sep">|</span><span class="editText">' + gettext( "APP-EDIT-TEXT" ) + '</span></a></dd>');
				}
				
				//close Tooltip
				$lTooltip.fadeOut('fast');
			}
		} else if(lFilterType == "none"){
			this.resetParamterFilter($lTooltip);
			this.resetFixedValueFilter($lTooltip);
			$lToolTip.find('[id*=id_filterContainer_]').hide();
			$lToolTip.find('[id*=id_fixedContainer]').hide();
			$lToolTip.find('[id*=id_buttons_]').hide();
			
			//close Tooltip
		$lTooltip.fadeOut('fast');
		}
	},
	onFilterTooltipClose : function(pEvent){
		var $lTrigger   = $(pEvent.target);
	    var $lFilter    = $($lTrigger.attr('rel'));
		var $lTooltip   = $lTrigger.parents('div.ao-filter-tooltip');
		
		$lTooltip.fadeOut('fast');
		
		this.resetParamterFilter($lTooltip);
		this.resetFixedValueFilter($lTooltip);	
		
		var lCcolIndex = $lTooltip.attr('data');
		$('#id_columnFilter_' + lCcolIndex).remove();
		
		if($('#id_filterToolBar dd').size()== 0){
			$('#id_filterToolBar').hide();
		}		
	},
	onTooltipClose : function(pEvent){
		var $lTrigger   = $(pEvent.target);
	    var $lFilter    = $($lTrigger.attr('rel'));
		var $lTooltip   = $lTrigger.parents('div.ao-filter-tooltip');
		
		//check if closing for empty forms
		
		$lTooltip.fadeOut('fast');
	},
	clearSelection : function(){
		var l$Cells = this.attributes.$Table.find('tr, th, td');
		l$Cells.removeClass('ao-column-selected');
		l$Cells.removeClass('ao-row-selected');
		l$Cells.removeClass('ao-table-selected');
		//fix to deselect all invalid cells if any
		this.attributes.$Table.removeClass('ao-table-selected').find('td.ao-table-selected').removeClass('ao-table-selected');
		l$Cells.removeClass('ao-cell-selected');
			
		this.reset();
	},
	checkEmptySelection : function(){
		var l$Cells = this.attributes.$Table.find('td.ao-table-selected, td.ao-row-selected, td.ao-column-selected, td.ao-cell-selected');
		var l$IntersectCells = this.attributes.$Table.find('.ao-row-selected.ao-column-selected');
		var lRetValue = true;
		
		if(l$IntersectCells.size() == 0){
			for (var i = 0; i < l$Cells.size(); i++){
				var lValue = $.trim(l$Cells.eq(i).text());
				if(lValue.length > 0){
					lRetValue = lRetValue && false;
				}
			}
		}else{
			for (var i = 0; i < l$IntersectCells.size(); i++){
				var lValue = $.trim(l$IntersectCells.eq(i).text());
				if(lValue.length > 0){
					lRetValue = lRetValue && false;
				}
			}
		}
		
		return lRetValue;
	},
	checkSquareSelection : function(){
		var $lCells = this.attributes.$Table.find('td.ao-cell-selected');
		var lCols = [];
		var lRows = [];
		var lColValues = [];
		var lRowValues = [];
		var lResultCols = true;
		var lResultRows = true;
		var lRetValue = false;
		
		for (var i = 0; i < $lCells.size(); i++){
			lCols.push($lCells.eq(i)[0].cellIndex);
			lRows.push($lCells.eq(i).parent()[0].rowIndex);
		}
		
		var lFinalOcurrances = 0;
		for (var i = 0; i < lCols.length; i++){
			var lOcurrences = 0;
			var lValue = lCols[i];
			if(jQuery.inArray(lValue, lColValues) == -1){
				lColValues.push(lValue);
			}
			for (var j = 0; j < lCols.length; j++){
				if(lValue == lCols[j]){
					lOcurrences++;
				}
			}
			if(lFinalOcurrances == 0){
				lFinalOcurrances = lOcurrences;
			}
			else{
				if(lFinalOcurrances != lOcurrences){
					lResultCols = false;
				}
			}
		}
		
		lFinalOcurrances = 0;
		for (var i = 0; i < lRows.length; i++){
			var lOcurrences = 0;
			var lValue = lRows[i];
			if(jQuery.inArray(lValue, lRowValues) == -1){
				lRowValues.push(lValue);
			}
			for (var j = 0; j < lRows.length; j++){
				if(lValue == lRows[j]){
					lOcurrences++;
				}
			}
			if(lFinalOcurrances == 0){
				lFinalOcurrances = lOcurrences;
			}
			else{
				if(lFinalOcurrances != lOcurrences){
					lResultRows = false;
				}
			}
		}
		if (lRowValues.length == 1 && lColValues.length == 1 ) {
			return;		
		}
		if (lRowValues.length == 0 && lColValues.length == 0 ) {
			return;	
		}
		if(lResultCols == false || lResultRows == false){
			return;
		}
		if(lRowValues.length != lColValues.length && (lRowValues.length != 1 && lColValues.length != 1)){
			if(lResultCols && lResultRows){
				this.setIntersections(lColValues, lRowValues);
			}
		}
		if(lRowValues.length == lColValues.length && (lRowValues.length != 1 && lColValues.length != 1)){
			if(lResultCols && lResultRows){
				this.setIntersections(lColValues, lRowValues);
			}
		}
		else{
			if(lRowValues.length == 1){
				if(lResultCols){
					return;
				}
			}	
			
			if(lColValues.length == 1){
				if(lResultRows){
					this.setIntersections(lColValues, lRowValues);
				}
			}		
		}	
	},
	setIntersections : function(pCols, pRows){
		var lCols = [];
		var lRows = [];
		var $lRows = this.attributes.$Table.find('tr');
		
		this.clearSelection();
				
		for (var i = 0; i < pCols.length; i++) {
			$lRows.eq(1).find('th').eq(pCols[i]).addClass('ao-column-selected');
		}
		
		for (var i = 0; i < pRows.length; i++) {
			$lRows.eq(pRows[i]).addClass('ao-row-selected');
			$lRows.eq(pRows[i]).find('th,td').addClass('ao-row-selected');
		}

		for (var i = 0; i < $lRows.size(); i++) {
			var lcols = $lRows.eq(i).find('th,td');
			for (var j = 0; j < pCols.length; j++) {
				var col = lcols.eq(pCols[j]);
				if(!col.hasClass('ao-column-filter-button')){
					col.addClass('ao-column-selected');				
				}
			}
		}
		
		this.attributes.selectedColumns 	= pCols.length;
		this.attributes.selectedRows 		= pRows.length;
	},
	updateSelectedCells : function(){
		var att = this.attributes;
		var $lCells = att.$Table.find('tr,th, td');
		
		$lCells.removeClass('ao-column-selected');
		$lCells.removeClass('ao-row-selected');
		$lCells.removeClass('ao-table-selected');
		
		//fix to deselect all invalid cells if any
		att.$Table.removeClass('ao-table-selected').find('td.ao-table-selected').removeClass('ao-table-selected');
		
		$lCells = att.$Table.find('td.ao-cell-selected');
		att.selectedColumns 	= 0;
		att.selectedRows 		= 0;
		att.selectedCells 		= $lCells.size();
	},
	reset : function(){
		DataTable.prototype.reset.call(this);
		this.resetFilters();
	},
	reCalculateFilters : function(){
		var att = this.attributes;
		
		if (att.$Table != null) {
			var lIndex = 0;
			att.parameters = [];
			
			//recalculate params
			var $ParamFilters = $('[id*=id_filterTooltip_] [id*=id_filterFrm_]');
			var lParamFilterLength = $ParamFilters.size();
			for(i = 0 ; i < lParamFilterLength; i++){
				var lName 	= $ParamFilters.eq(i).find('[id*=id_parameter-name]').val();
				var lValue 	= $ParamFilters.eq(i).find('[id*=id_parameterValue]').val();
				if(lName != "" && lValue != ""){
					att.parameters[lIndex] = lName + "&" + lValue;
					lIndex++;
				}
			}
			
			//recalulate fixed values
			att.fixedValues = []
			
			//recalculate params
			var $FixedFilters = $('[id*=id_filterTooltip_] [id*=id_fixedContainer]');
			var lFixedFilterLength = $ParamFilters.size();
			for(i = 0 ; i < lFixedFilterLength; i++){
				var lValue = $FixedFilters.eq(i).find('[id*=id_fixedValue_]').val();
				if(lValue != ""){
					att.fixedValues.push(lValue);
				}
			}
		}
	},
	resetFilters : function(){
		if (this.attributes.$Table != null) {
		
			this.attributes.parameters = []
			$('[id*=id_filterTooltip_] form').each(function(i, element){
				element.reset();
			});
			$('#id_filterToolBar dd').remove();
			$('#id_filterToolBar').hide();
			$('div.ao-filter-tooltip').fadeOut('fast');
			$('#id_filterToolBar').unbind('click');
		}
	},
	resetParamterFilter : function(pToolTip){
		var lForm = pToolTip.find('[id*=id_filterFrm_]');
		lForm[0].reset();
		lForm.validate().resetForm();
	},
	resetFixedValueFilter : function(pToolTip){
		var lForm = pToolTip.find('[id*=id_fixedValueForm_]')
		lForm[0].reset();
		lForm.validate().resetForm();
	}
});

var DataTableCharts = DataTable.extend({
	defaults : {
		jsonResponse 	: '',
		noTable			: false,
		totalCols 		: 0,
		totalRows		: 0,
		cm : ''
	},
	initialize : function(){
		_.defaults(this.attributes, DataTable.prototype.defaults);
		
		this.initDataTableJson(this.attributes.jsonResponse);
		if (this.attributes.cm !== "") chartManager = this.attributes.cm;
		//TODO some times (?) chartManager is == ""
		this.attributes.$Table.customSelectable({'chartManager' : chartManager});
	},
	initDataTableJson : function(pResponse){
		var att = this.attributes;
		var lACharCode 	= 65;
        var lRows 		= '';
        var lRowNum 	= 0;
        var lColNum 	= 0;
		var lColNumFinal= 0;
        var lCellNum 	= 0;
        var lRowSpans 	= [];
		var lValue 		= '';

		if (pResponse.fType != 'ARRAY') {
			att.noTable = true;
		}
		else {
			i = 0;
			att.totalRows = (pResponse.fLength > 0)? pResponse.fLength: pResponse.fRows;
	        for (var lRow = 1; lRow <= pResponse.fRows; lRow++) {
				var lCells 	= '';
            	lColNum 	= 0;
	            for (var lColumns = 1; lColumns <= pResponse.fCols; lColumns++) {
	                var lCell = pResponse.fArray[i];
	                var lValue = '';
	                if (lCell.fType == 'TEXT') {
	                    if (lCell.fStr.length == 1) {
	                        lValue = lCell.fStr.replace('-', '&nbsp;');
	                    }
	                    else {
	                        lValue = String(lCell.fStr);
                        	lValue = lValue.replace(/(<([^>]+)>)/ig," ");
	                    }
						if(lCell.fStr.length == 0){
							lValue = '&nbsp';
						}
	                }
	                if (lCell.fType == 'NUMBER') {
	                    lValue = String(lCell.fNum);
	                }
	                if (lCell.fType == 'MISSING') {
	                    lValue = '-';
	                }
	                if(lCell.fType == 'LINK'){
                        lValue = '<a target="_blank" href="' + lCell.fUri + '" rel="nofollow" title="' + lCell.fStr + '">' + lCell.fStr + '</a>';
                    }
	                					
					lCells = lCells + '<td id="cell' + lCellNum + '"><div>' + lValue + '</div></td>';
					
					lColNum++
					
					if(lColNumFinal < lColNum){
						lColNumFinal = lColNum;
					}
					
	                lCellNum++;
					i++;
	            }

				lRows = lRows + '<tr id="row' + lRowNum + '">' + '<th class="ao-row-button" title="">' + (lRowNum + 1) + '</th>' + lCells + '</tr>';
            	lRowNum++;
	        }
		}
		
		att.totalCols = lColNumFinal;
		var lColumns = '<tr><th class="ao-table-button" title=""></th>';
        for (var i = 0; i < lColNumFinal; i++) {
            lColumns = lColumns + '<th id="column' + i + '" class="ao-column-button" title="">' + String.fromCharCode(lACharCode + i) + '</th>';
        }
        lColumns = lColumns + '</tr>';

        var lTable = '<table id="id_chartTable">' + lColumns + lRows + '</table>';

		att.$Table = $(lTable);
		att.$Table.click(_.bind(this.onSelectCellButtonClicked, this));
        att.$SelectedTableColumns = att.$Table.find("th[id^='column']");
	},
	onSelectCellButtonClicked: function(pEvent){
		var att = this.attributes;
		var $lTarget = $(pEvent.target);
        var $lCell;
		
		if($lTarget.is('a')){
			$lCell = $lTarget.parent();
		}
		else{
			$lCell = $lTarget;
		}
		
		if ($lCell.parent().hasClass(att.selectionClass)) {
			$lCell.parent().removeClass(att.selectionClass );
        }
		else {
			$lCell.parent().addClass(att.selectionClass );
		}
		if ($lCell.is('th')) {
			if ($lCell.hasClass('ao-column-button')) {
				if(att.disableColumnSelection == false){
					this.selectColumnHandler($lCell, pEvent);
					//this.notifySelection();
				}
				return;
			}
		}
		if (!$lCell.is('th')) {
			if (chartManager.attributes.$DataTable.checkNumericCells('ao-data') && att.selectionClass == "ao-data") {
				chartManager.noDataSelectionWarning(true);
			}
			else {
				chartManager.noDataSelectionWarning(false);
			}
			chartManager.attributes.$DataTable.attributes.$Table.find('th').removeClass('ao-column-selected');
			chartManager.attributes.$DataTable.attributes.$Table.find('th').removeClass(att.selectionClass);
			$("#id_multipleSeriesData").trigger('selection:finish');
		}
	},
	selectColumnHandler : function(pCell, pEvent){
		if(pEvent.shiftKey){
			//this.selectMultipleColumns(pCell);
		}else{
			if (!pCell.hasClass('ao-no-select')) {
				this.columnEvent(pCell);
			}				
		}
	},
	columnEvent : function(pCell){
    	var att = this.attributes;
		
        var $lColumn 	= pCell;
        var lIndex 		= $lColumn[0].cellIndex -1;
        var $lRows		= att.$Table.find('tr');
		var lRowLength  = $lRows.size();
		
        $lColumn.toggleClass('ao-column-selected');
        $lColumn.toggleClass(att.selectionClass);

        if ($lColumn.hasClass('ao-column-selected')) {
			for(i = 0; i < lRowLength; i++){
				var $lCell = $('td', $lRows.eq(i)).eq(lIndex);
                $lCell.addClass(att.selectionClass);
			}
            att.selectedColumns++
        }
        else {
			for (i = 0; i < lRowLength; i++) {
                var $lCell = $('td', $lRows.eq(i)).eq(lIndex);
				$lCell.removeClass(att.selectionClass);
			}
			att.selectedColumns--
        }
    },
	rowEvent : function(pCell){
		return;
	},
	tableEvent : function(pCell){
		return;
	},
	resetSelection : function(pClass){
		this.attributes.$Table.find('td.'+pClass).removeClass(pClass);
	},
	setExcelSelection : function(pSelection, pSelectionType){
		if(pSelection == "" || typeof pSelection === "undefined"){
			return;
		}
		
		var lMultipleSelections = pSelection.split(',');
		
		for (var i = 0; i < lMultipleSelections.length; i++) {
			var att = this.attributes;
			var lselection = $.trim(lMultipleSelections[i]).split(" ");
			var $columns = att.$Table.find('.ao-column-button');

			if(lselection[0] !="Column"){
				var lFirstColumn = 0;
				var lLastColumn = 0;
				var lFirstRow = 0;
				var lLastRow = 0;
				
				if (lselection.length == 2) {
					lFirstColumn = att.$Table.find('tr .ao-column-button:contains("' + lselection[0] + '")')[0].cellIndex;
					lFirstRow = parseInt(lselection[1]);
					lFirstColumn--;
					att.$Table.find('tr').eq(lFirstRow).find('td').eq(lFirstColumn).addClass(pSelectionType);
				}
				else {
					lFirstColumn = att.$Table.find('tr .ao-column-button:contains("' + lselection[0] + '")')[0].cellIndex;
					lLastColumn = att.$Table.find('tr .ao-column-button:contains("' + lselection[3] + '")')[0].cellIndex;
					lFirstRow = parseInt(lselection[1]);
					lLastRow = parseInt(lselection[4]) + 1;
					
					if (lFirstRow == lLastRow) {
						lLastRow++;
					}
					
					if (lFirstColumn == 1) {
						att.$Table.find('tr').slice(lFirstRow, lLastRow).find('td').addClass(pSelectionType);
					}
					else {
						lFirstColumn = lFirstColumn - 2;
						att.$Table.find('tr').slice(lFirstRow, lLastRow).find('td:gt(' + lFirstColumn + ')').addClass(pSelectionType);
					}
					
					if (lLastColumn == lFirstColumn) {
						att.$Table.find('tr').slice(lFirstRow, lLastRow).find('td:gt(0)').removeClass(pSelectionType);
					}
					if (lLastColumn > 1) {
						lLastColumn--
						att.$Table.find('tr').slice(lFirstRow, lLastRow).find('td:gt(' + lLastColumn + ')').removeClass(pSelectionType);
					}
				}
			}else{
				var colIndex = att.$Table.find('tr .ao-column-button:contains("'+lselection[2]+'")')[0].cellIndex + 1;
				att.$Table.find('tr .ao-column-button:contains("'+lselection[2]+'")').eq(0).addClass('ao-column-selected');
				att.$Table.find('td:nth-child('+ colIndex +')').addClass(pSelectionType);
				att.$Table.find('tr .ao-column-button:contains("'+lselection[2]+'")').addClass(pSelectionType);
			}
		}
	},
	calculateSelectedColumns : function(pSelectionType){
		var $lCells 		= $('td.' + pSelectionType).parent('tr').eq(0).find('.'+pSelectionType);
		var lCellSize 		= $lCells.size();
		var lResultCols		= [];
		var lPrevCol 		= $lCells[0].cellIndex;
		var lCurrentSet		= [];
		
		lCurrentSet.push(lPrevCol);
		
		for (var i = 0; i < lCellSize; i++) {
			var lCurrentCol = $lCells[i].cellIndex;
			
			//if col diff is 0 still iterating on same row
			if (lCurrentCol - lPrevCol == 0) {
				//continue iterrating
			}
			//if col diff is 1 iterating next row
			if(lCurrentCol - lPrevCol == 1){
				//new adjacent col
				lCurrentSet.push(lCurrentCol);
				lPrevCol = lCurrentCol;				
			}
			//if col diff is larger than 1 iterating a different row with X rows between
			if(lCurrentCol- lPrevCol > 1){
				//to much distance close seleccion start a new one
				lResultCols.push(lCurrentSet);
				lCurrentSet = [];
				lCurrentSet.push(lCurrentCol);
				lPrevCol = lCurrentCol;
			}
			//if cell is the last one in array
			if(i == (lCellSize - 1)){
				lResultCols.push(lCurrentSet);
			}
		}
		
		return lResultCols;
	},
	generateExcelSelection : function(pSelectionType){
		var lSelectionText 	= '';
		var $lCells 		= $('.' + pSelectionType);
		var lCellSize 		= $lCells.size();

		if(lCellSize > 0){
			if($('.ao-column-selected').size() > 0){
				$('th.'+this.attributes.selectionClass).each(function(index){
					lSelectionText += "Column : "+ $(this).text() + ', ';
				});
			}else{
				var lColumnSets		= this.calculateSelectedColumns(pSelectionType);
				
				var lConsecutive = true;
				//check if all columns are consecutive numbers
				if(lColumnSets.length > 1){
					lConsecutive = false;
				}
			
				for (var j = 0; j < lColumnSets.length; j++){
					var lCellsToProcess = [];
					for (var x = 0; x < lCellSize; x++) {
					    if (jQuery.inArray($lCells[x].cellIndex, lColumnSets[j]) != -1) {
	                        lCellsToProcess.push($lCells[x]);
	                    }
					}
					
					var lRow 			= lCellsToProcess[0].parentNode.rowIndex;
					var lStartCol 		= lCellsToProcess[0].cellIndex;
					var $lStart 		= $(lCellsToProcess[0]);
					var $lFinish 		= null;
					var lIsStartCell    = true;
					
					for (var i = 0; i < lCellsToProcess.length; i++){
						var lCurrentrow = lCellsToProcess[i].parentNode.rowIndex;
						$lFinish = $(lCellsToProcess[i]);
						//if row diff is 0 still iterating on same row
						if (lCurrentrow - lRow == 0) {
	                        //continue iterrating
						}
						//if row diff is 1 iterating next row
						if (lCurrentrow - lRow == 1) {
							//new adjacent row update variables
							lRow = lCurrentrow;
							//$lFinish = $lCells.eq(i - 1);
							$lFinish = $(lCellsToProcess[i]);
						}
						//if row diff is larger than 1 iterating a different row with X rows between
						if (lCurrentrow - lRow > 1) {
							//to much distance close seleccion start a new one
							//call method to generate string
							$lFinish = $(lCellsToProcess[i-1]);
							lSelectionText += this.generateExcelSelectionText($lStart, $lFinish) + ', ';
							//reset variables
							$lStart = $(lCellsToProcess[i]);
							$lFinish = null;
							lRow = lCurrentrow;
						}
					};
					//if cell is the last one in array
					if($lFinish == null){
						$lFinish = $lStart;
					}
	                lSelectionText += this.generateExcelSelectionText($lStart, $lFinish) + ', ';
				}
			}
		}else{
		    return '<span class="shadowText">' + gettext( "APP-SELECTRANGE-TEXT" ) + '</span>';
		}
		
		return lSelectionText.substring(0, lSelectionText.length -2 );
	},
	generateExcelSelectionText : function(pStartCell, pLastCell){
		var lStart 	= $('.ao-column-button').eq( pStartCell[0].cellIndex - 1 ).text() + ' ' + pStartCell[0].parentNode.rowIndex;
		var lFinish = $('.ao-column-button').eq( pLastCell[0].cellIndex - 1 ).text() + ' ' + pLastCell[0].parentNode.rowIndex;
		
		if(lStart != lFinish){
			return lStart + ' : ' + lFinish;
		}else{
			return lStart;		
		}
	},
	checkNumericCells : function(pSelectionType){
		var $lCells = $('.'+pSelectionType);
		var lCellLength = $lCells.size();
		var lRetValue = false;
		
		for(i = 0; i < lCellLength; i++){
			var lData = parseNumber($.trim($lCells.eq(i).text()));
			var lValue;
			if(isNaN(lData)){
				lRetValue = true;
			}
		}
		
		return lRetValue;
	}
});

var renderChartsDataTable = DataTableCharts.extend({
	defaults : {
	},
	initialize : function(){
		_.defaults(this.attributes, DataTable.prototype.defaults);
		this.initDataTableJson(this.attributes.jsonResponse);
	},
	onSelectCellButtonClicked: function(pEvent){
		return;
	},
	columnEvent: function(pCell){
		return;
	},
	rowEvent : function(pCell){
		return;
	},
	tableEvent : function(pCell){
		return;
	}
});

function parseNumber(pNumber) {
    THOUSANDS_SEPARATOR_WITH_COMMAS = /^(\+|\-)?([0-9]{1,3}(,[0-9]{3})*(\.[0-9]+)?|\.[0-9]+)$/
    THOUSANDS_SEPARATOR_WITH_POINTS = /^(\+|\-)?([0-9]{1,3}(\.[0-9]{3})*(,[0-9]+)?|,[0-9]+)$/

    if (/[0-9]/.test(pNumber)) {
        lNumber = pNumber.replace(/[^0-9,.\+\-]/g, '');
        if (THOUSANDS_SEPARATOR_WITH_COMMAS.test(lNumber)) {
            lNumber = lNumber.replace(/,/g, '');
        } else if (THOUSANDS_SEPARATOR_WITH_POINTS.test(lNumber)) {
            lNumber = lNumber.replace(/\./g, '');
            lNumber = lNumber.replace(/,/g, '.');
        }
        lNumber = parseFloat(lNumber);
        if (!isNaN(lNumber)) {
            return lNumber;
        }
    }
    return Number.NaN;
}
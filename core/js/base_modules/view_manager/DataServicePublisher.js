var DataServicesPublisher = Backbone.Model.extend({
    defaults : {
		xmlManager			: null, 
        selectedCells 		: 0,
		selectedColumns 	: 0,
		selectedRows 		: 0,
		$Table				: null,
		tableKeys			: [],
		tableHeaders		: [],
		tableAliases		: [],
		tableTotals			: [],
		tableMavg			: [],
		mavgPeriod			: 0,
		tableAvg			: [],
		tableSum			: [],
		totalComputes		: 0,
		computeColumns		: [],
		hasComputes			: false
    },
    initialize : function(){
		var att = this.attributes;
		var lTotalComputes = 0;
		if(att.tableMavg.length > 0){
			lTotalComputes++;
		}
		if(att.tableAvg.length > 0){
			lTotalComputes++;
		}
		if(att.tableSum.length > 0){
			lTotalComputes++;
		}
		this.attributes.totalComputes = lTotalComputes;
		this.attributes.hasComputes = (lTotalComputes > 0) ? true : false; 
    },
    createDataSourceXML : function(){
        var lNameSpace      = '';
        var lDataSource     = this.attributes.xmlManager.createXMLDocument('dataSource', lNameSpace, null);
        var lDataStructure  = this.createDataStructureElement(lDataSource, lNameSpace);

        lDataStructure.appendChild(this.createFieldElement(lDataSource, lNameSpace, this.attributes.$Table[0], true, true, false, 0, false));

        lDataSource.documentElement.appendChild(lDataStructure);

        return lDataSource;
    },
    createDataStructureElement : function(pDataSource, pNameSpace) {
        var lDataStructure = this.attributes.xmlManager.createElementNS(pNameSpace, 'DataStructure', pDataSource);

        return lDataStructure;
    },
    createFieldElement : function(pDataSource, pNameSpace, pElement, pKeys, pHeaders, pAliases, pCol, pComputes) {
        var lField = this.attributes.xmlManager.createElementNS(pNameSpace, 'Field', pDataSource);

        this.attributes.xmlManager.setAttributeNodeNS (lField, 'id', pElement.id, pNameSpace);
		
		//generates table keys
		if(pKeys){
			var lKeyElement = this.attributes.xmlManager.createElementNS(pNameSpace, 'Key', pDataSource);
			for (var i = 0; i < this.attributes.tableKeys.length ; i++){
				var lKeyText 		= pDataSource.createTextNode('');
		        lKeyElement.appendChild(lKeyText);
		        lField.appendChild(lKeyElement);
				
				var lComponentElement 	= this.attributes.xmlManager.createElementNS(pNameSpace, 'component', pDataSource);
				var lComponentText 		= pDataSource.createTextNode('');
		        lComponentElement.appendChild(lComponentText);
				
				var lIdElement 	= this.attributes.xmlManager.createElementNS(pNameSpace, 'id', pDataSource);
				var lIdText 		= pDataSource.createTextNode(this.attributes.tableKeys[i].cellId);
		        lIdElement.appendChild(lIdText);
		        lComponentElement.appendChild(lIdElement);
				
				var lValueElement 	= this.attributes.xmlManager.createElementNS(pNameSpace, 'value', pDataSource);
				var lValueText 		= pDataSource.createTextNode(this.attributes.tableKeys[i].text);
		        lValueElement.appendChild(lValueText);
		        lComponentElement.appendChild(lValueElement);
				
				lKeyElement.appendChild(lComponentElement);
			};
		}
		if(pHeaders){
			var lKeyElement = this.attributes.xmlManager.createElementNS(pNameSpace, 'Headers', pDataSource);
			for (var i = 0; i < this.attributes.tableHeaders.length ; i++){
				var lKeyText 		= pDataSource.createTextNode('');
		        lKeyElement.appendChild(lKeyText);
		        lField.appendChild(lKeyElement);
				
				var lIdElement 	= this.attributes.xmlManager.createElementNS(pNameSpace, 'Row', pDataSource);
				var lIdText 		= pDataSource.createTextNode('row'+this.attributes.tableHeaders[i]);
		        lIdElement.appendChild(lIdText);
		        lKeyElement.appendChild(lIdElement);
			};
		}
		
		if(pAliases){
	        var lAliasElement   = this.attributes.xmlManager.createElementNS(pNameSpace, 'alias', pDataSource);
			var lValue = this.attributes.tableAliases[pCol];
			if(typeof lValue === "undefined"){
				lValue = "";
			}
	        var lAliasText      = pDataSource.createTextNode(lValue);
	        lAliasElement.appendChild(lAliasText);
	        lField.appendChild(lAliasElement);
		}

        var lTypeElement   = this.attributes.xmlManager.createElementNS(pNameSpace, 'type', pDataSource);
		var lTypeText;
		if(pComputes){
			lTypeText      = pDataSource.createTextNode('NUMBER');
		}else{
			lTypeText      = pDataSource.createTextNode('');
		}
        lTypeElement.appendChild(lTypeText);
        lField.appendChild(lTypeElement);

        var lFormatElement   = this.attributes.xmlManager.createElementNS(pNameSpace, 'format', pDataSource);

        var lLanguajeElement = this.attributes.xmlManager.createElementNS(pNameSpace, 'languaje', pDataSource);
        var lLanguajeText    = pDataSource.createTextNode('');
        lLanguajeElement.appendChild(lLanguajeText);

        var lCountryElement  = this.attributes.xmlManager.createElementNS(pNameSpace, 'country', pDataSource);
        var lCountryText     = pDataSource.createTextNode('');
        lCountryElement.appendChild(lCountryText);

        var lStyleElement     = this.attributes.xmlManager.createElementNS(pNameSpace, 'style', pDataSource);
        var lStyleText        = pDataSource.createTextNode('');
        lStyleElement.appendChild(lStyleText);

        lFormatElement.appendChild(lLanguajeElement);
        lFormatElement.appendChild(lCountryElement);
        lFormatElement.appendChild(lStyleElement);

        lField.appendChild(lFormatElement);

        if (pElement.nodeName == 'TABLE'){
            var lTable  = this.attributes.xmlManager.createElementNS(pNameSpace, 'Table', pDataSource);
			var $lCols = $("th[id^='column']", pElement);
			var lColSize = $lCols.size();
			
			if(this.attributes.hasComputes){
				lColSize = lColSize + this.attributes.totalComputes;
			}
			var lIndex = lColSize - this.attributes.totalComputes;
			for(i = 0; i < lColSize; i++){
				if(i >= lIndex){
					var lFakeTh = $('<th id="column'+i+'"></th>');
					this.attributes.computeColumns.push('column'+i);
					lTable.appendChild(this.createFieldElement(pDataSource, pNameSpace, lFakeTh[0], false, false, true, i, true));
				}else{
					lTable.appendChild(this.createFieldElement(pDataSource, pNameSpace, $lCols[i], false, false, true, i, false));
				}
			}
            lField.appendChild(lTable);
        }

        return lField;
    },
    createSelectStatementXML : function(){
        var lNameSpace          = '';
        var lSelectStatement    = this.attributes.xmlManager.createXMLDocument('selectStatement', lNameSpace, null);

        var lSelect             = this.createSelectClause(lSelectStatement, lNameSpace);
        var lFrom               = this.createFromClause(lSelectStatement, lNameSpace);
        var lWhere              = this.createWhereClause(lSelectStatement, lNameSpace);

        lSelectStatement.documentElement.appendChild(lSelect);
        lSelectStatement.documentElement.appendChild(lFrom);
        lSelectStatement.documentElement.appendChild(lWhere);

        return lSelectStatement;
    },
    createSelectClause : function(pSelectStatement, pNameSpace){
        var lSelect = this.attributes.xmlManager.createElementNS(pNameSpace, 'Select', pSelectStatement);
        var _this = this;
        
        if(this.attributes.selectedColumns > 0){
            var $lCols  = this.attributes.$Table.find("th[id^='column']");
            $lCols.each(function(i){
                if($(this).hasClass('ao-column-selected')){
                   lSelect.appendChild(_this.createColumnElement(pSelectStatement, pNameSpace, this));
                }
            });
        }
        else if(this.attributes.selectedCells > 0){
             this.attributes.$Table.find('td[id*=cell]').each(function(i){
                if($(this).hasClass('ao-cell-selected')){
                   lSelect.appendChild(_this.createColumnElement(pSelectStatement, pNameSpace, this));
                }
            });
        }
        else{
			if (this.attributes.hasComputes) {
				var $lCols  = this.attributes.$Table.find("th[id^='column']");
	            $lCols.each(function(i){
	                   lSelect.appendChild(_this.createColumnElement(pSelectStatement, pNameSpace, this));
	            });
			}else{
				lSelect.appendChild(_this.createColumnElement(pSelectStatement, pNameSpace, null));
			}
        }
		
		if(this.attributes.hasComputes){
			if(this.attributes.tableMavg.length > 0){
				lSelect.appendChild(this.createFunctionElement(pSelectStatement, pNameSpace, 'MAVG', this.attributes.tableMavg, this.attributes.mavgPeriod));
			}
			if(this.attributes.tableAvg.length > 0){
				lSelect.appendChild(this.createFunctionElement(pSelectStatement, pNameSpace, 'AVG', this.attributes.tableAvg, null));
			}
			if(this.attributes.tableSum.length > 0){
				lSelect.appendChild(this.createFunctionElement(pSelectStatement, pNameSpace, 'SUM', this.attributes.tableSum, null));
			}
		}
		
        return lSelect;
    },
	createFunctionElement : function(pSelectStatement, pNameSpace, pOperationName, pCols, pValue){
        var lFunction   = this.attributes.xmlManager.createElementNS(pNameSpace, 'Function', pSelectStatement);
        var lOperation;
		var lId         = this.attributes.computeColumns[0];
		this.attributes.computeColumns.splice (0,1);
		
		this.attributes.xmlManager.setAttributeNodeNS (lFunction, 'id', lId, pNameSpace);
		switch(pOperationName) {
			case 'MAVG':
				lOperation = this.attributes.xmlManager.createElementNS(pNameSpace, 'Operation', pSelectStatement);
				this.attributes.xmlManager.setAttributeNodeNS (lOperation, 'name', 'MAVG', pNameSpace);
				var lPeriod = this.attributes.xmlManager.createElementNS(pNameSpace, 'periods', pSelectStatement);
				lPeriod.appendChild(pSelectStatement.createTextNode(this.attributes.mavgPeriod));
				lOperation.appendChild(lPeriod);
				var lOperands = this.attributes.xmlManager.createElementNS(pNameSpace, 'Operands', pSelectStatement);

				for(i = 0; i < this.attributes.tableMavg.length; i++){
					var lColumn = this.attributes.xmlManager.createElementNS(pNameSpace, 'Column', pSelectStatement);
					lColumn.appendChild(pSelectStatement.createTextNode('column'+this.attributes.tableMavg[i]));
		        	lOperands.appendChild(lColumn);
				}
				lOperation.appendChild(lOperands);
				break;
			case 'AVG':
				lOperation = this.attributes.xmlManager.createElementNS(pNameSpace, 'Operation', pSelectStatement);
			 	this.attributes.xmlManager.setAttributeNodeNS (lOperation, 'name', 'AVG', pNameSpace);

				var lOperands = this.attributes.xmlManager.createElementNS(pNameSpace, 'Operands', pSelectStatement);
				for(x = 0; x < this.attributes.tableAvg.length; x++){
					var lColumn = this.attributes.xmlManager.createElementNS(pNameSpace, 'Column', pSelectStatement);
					lColumn.appendChild(pSelectStatement.createTextNode('column'+this.attributes.tableAvg[x]));
		        	lOperands.appendChild(lColumn);
				}
				lOperation.appendChild(lOperands);
				break;
			case 'SUM':
				lOperation = this.attributes.xmlManager.createElementNS(pNameSpace, 'Operation', pSelectStatement);
			 	this.attributes.xmlManager.setAttributeNodeNS (lOperation, 'name', 'SUM', pNameSpace);

				var lOperands = this.attributes.xmlManager.createElementNS(pNameSpace, 'Operands', pSelectStatement);
				for(y = 0; y < this.attributes.tableSum.length; y++){
					var lColumn = this.attributes.xmlManager.createElementNS(pNameSpace, 'Column', pSelectStatement);
					lColumn.appendChild(pSelectStatement.createTextNode('column'+this.attributes.tableSum[y]));
		        	lOperands.appendChild(lColumn);
				}
				lOperation.appendChild(lOperands);
				break;
		}
		
		lFunction.appendChild(lOperation);
		
        return lFunction;
    },
    createColumnElement : function(pSelectStatement, pNameSpace, pElement){
        var lColumn     = this.attributes.xmlManager.createElementNS(pNameSpace, 'Column', pSelectStatement);
        var lID         = "*";

        if(pElement != null){
            lID = pElement.id;
        }

        lColumn.appendChild(pSelectStatement.createTextNode(lID));

        return lColumn;
    },
    createFromClause : function(pSelectStatement, pNameSpace){
        var lFrom  = this.attributes.xmlManager.createElementNS(pNameSpace, 'From', pSelectStatement);
        var _this = this;
        this.attributes.$Table.each(function(i){
            lFrom.appendChild(_this.createTableElement(pSelectStatement, pNameSpace, this));
        });

        return lFrom;
    },
    createTableElement : function(pSelectStatement, pNameSpace, pElement){
        var lTable      = this.attributes.xmlManager.createElementNS(pNameSpace, 'Table', pSelectStatement);
        var lTableText  = pSelectStatement.createTextNode(pElement.id);

        lTable.appendChild(lTableText);

        return lTable;
    },
    createWhereClause : function(pSelectStatement, pNameSpace) {
        var lWhere = this.attributes.xmlManager.createElementNS(pNameSpace, 'Where', pSelectStatement);

        if(this.attributes.selectedCells == 0 && this.attributes.selectedRows == 0){
			// build Parameter XML
            var $lOperands2 = this.attributes.$Table.find("th[id^='column']");

            for(var i = 0;i < $lOperands2.length; i++){

                var lOperand2   = $lOperands2.eq(i).attr('id');
                var $lFilter    = this.attributes.$Table.find('th[id*=id_filter_' + lOperand2 + ']');
                var $lTooltip   = $($lFilter.find('a[id*=id_addFilterButton_]').attr('rel'));
                var $lPosition  = $lTooltip.find('input[id*=id_parameter-position_]');

                var lPosition   = $lPosition.val();

                if(lPosition > -1 && $lTooltip.find('[id*=id_parameterValue_]').val() != ""){

                    var lOperand1 = "parameter" + lPosition;
                    var lOperator = $lTooltip.find('select[id*=id_operator_]').val();

                    lWhere.appendChild(this.createFilterElement(pSelectStatement
                                                            , pNameSpace
                                                            , lOperand2
                                                            , lOperator
                                                            , lOperand1));
                }
            }
			
			//build fixed value filters
			var $lOperands = this.attributes.$Table.find("th[id^='column']");

            for(var i = 0;i < $lOperands.length; i++){

                var lOperand2   = $lOperands.eq(i).attr('id');
                var $lFilter    = this.attributes.$Table.find('th[id*=id_filter_' + lOperand2 + ']');
                var $lTooltip   = $($lFilter.find('a[id*=id_addFilterButton_]').attr('rel'));
                var $lPosition  = $lTooltip.find('input[id*=id_parameter-position_]');

                var lPosition   = $lPosition.val();

                if(lPosition > -1 && $lTooltip.find('[id*=id_fixedValue_]').val() != ""){

                    var lOperand1 = $lTooltip.find('[id*=id_fixedValue_]').val();
                    var lOperator = $lTooltip.find('select[id*=id_operator_]').val();

                    lWhere.appendChild(this.createFilterElement(pSelectStatement
                                                            , pNameSpace
                                                            , lOperand2
                                                            , lOperator
                                                            , lOperand1));
                }
            }
			

        }
        else if(this.attributes.selectedRows > 0){
            var _this = this;
            this.attributes.$Table.find('tr.ao-row-selected').each(function(i){
                var lOperand1           = 'rownum';
                var lLogicalOperator    = '00';
                var lOperand2           = this.id.slice(3);

                lWhere.appendChild(_this.createFilterElement(pSelectStatement
                                                        , pNameSpace
                                                        , lOperand1
                                                        , lLogicalOperator
                                                        , lOperand2));
            });
        }

        return lWhere;
    },
    createFilterElement : function(pSelectStatement, pNameSpace, pOperand1, pLogicalOperator, pOperand2){
        var lText           = "";
        var lFilter         = this.attributes.xmlManager.createElementNS(pNameSpace, 'Filter', pSelectStatement);

        var lOperand1       = this.attributes.xmlManager.createElementNS(pNameSpace, 'Operand1', pSelectStatement);
        lText               = pSelectStatement.createTextNode(pOperand1);
        lOperand1.appendChild(lText);

        var lLogicalOperator= this.attributes.xmlManager.createElementNS(pNameSpace, 'LogicalOperator', pSelectStatement);
        lText               = pSelectStatement.createTextNode(pLogicalOperator);
        lLogicalOperator.appendChild(lText);

        var lOperand2       = this.attributes.xmlManager.createElementNS(pNameSpace, 'Operand2', pSelectStatement);
        lText               = pSelectStatement.createTextNode(pOperand2);
        lOperand2.appendChild(lText);

        lFilter.appendChild(lOperand1);
        lFilter.appendChild(lLogicalOperator);
        lFilter.appendChild(lOperand2);

        return lFilter;
    }
});
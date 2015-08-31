var dataStream = Backbone.Model.extend({
    defaults: {
        'id': 0,
        'title': "",
        'description': "",
        'guid': "",
        'tags': [],
        'type': "",
        'source': "",
    },

    setArguments: function(arguments){

        var pairs = _.pairs(arguments);
        for(var i=0; i < pairs.length; i++){
            var argument = pairs[i];
            var name = argument[0];
            if(this.has(name)){
                var param = this.get(name);

                this.set(name, {"name": param.name, "value": argument[1]});
            }
        }

    },

    getPivotTableConfig: function(){
        return this.get('pivotTableConfig') + this.getQuery();
    },

    getPivotTableDataSource: function(){
        return this.get('pivotTableDataSource') + this.getQuery();
    },

    getQuery: function(){
        // Add DataStream pArguments to data
        var url         = '';
        var sep         = '?';
        var index         = 0;
        var parameter     = this.get('parameter' + index);
        while(!_.isUndefined(parameter)){
            url = url + sep + 'pArgument' + index + '=' + parameter.value;
            sep = '&';

            index++;
            parameter = this.get('parameter' + index);
        }

        return url;
    }

});

/** previously called chartDetail */
var visualization = Backbone.Model.extend({
    defaults: {
        id: 0,
        title: "",
        description: "",
        guid: "",
        dataStreamJson : '', //THE REAL DATASET FOR THIS VIZ '{{result|escapejs}}',
        datastreamrevision_id: '',
        chartJson : '',
        //$DataTableObject : null,
        chartObject : null, //mapChart or another junarChart object
        url : '',
        totalPages : 0,
        currentPage : 0,
        embedUrl: "" ,
        joinIntersectedClusters: true,

    },

});

/** new version for junarCharts */
var junarChart2 = Backbone.Model.extend({
    defaults: {
        manager: null, // the Backbone view who call me
        viz: null, // "visualization" object related to manager
        result: "",//the visualization.dataStreamJson parsed to JSON
        charType: "",
        size: [0,0],

        //from old junarCharts,
        title         : '',
        showLegend     : false,
        headerSelection:'',
        dataSelection : '',
        labelSelection : '',
        data        : null,
        invertedData: false,
        invertedAxis: false,
        correlativeData : false,
        multipleSeries : false,
        seriesData : [],
        nullValueAction : 'exclude',
        nullValuePreset : '',
        properties    : '',
        chartTemplate : '',
        styles: null,
        stylesDefault: null
    },
    loadStyle : function(styleName, orSufix){
        if (this.attributes.styles == undefined) return false; // there are no styles
        for (var i = 0; i < this.attributes.styles.length; i++){
            var esEste = false;
            if (this.attributes.styles[i].id == styleName ||  styleName == "#"+this.attributes.styles[i].id) esEste = true;
            if (orSufix && (this.attributes.styles[i].id == styleName + orSufix ||  styleName + orSufix == "#"+this.attributes.styles[i].id)) esEste = true;
            if (esEste)
                {

                var theStyle = this.attributes.styles[i].styles

                //the colours on KML standar are eight digits, AABBGGRR
                //Alpha - Blue - Green - Red
                if (typeof(theStyle.lineStyle) !== "undefined")
                    {
                    if (typeof(theStyle.lineStyle.color) !== "undefined" && theStyle.lineStyle.color.length == 8)
                        {
                        var col = theStyle.lineStyle.color;
                        theStyle.lineStyle.color = "#" + col.substring(6,8)+ col.substring(4,6)+ col.substring(2,4);
                        theStyle.lineStyle.alpha = col.substring(0,2);
                        }
                    }
                if (typeof(theStyle.polyStyle) !== "undefined")
                    {
                    if (typeof(theStyle.polyStyle.color) !== "undefined" && theStyle.polyStyle.color.length == 8)
                        {
                        var col = theStyle.polyStyle.color;
                        theStyle.polyStyle.color = "#" + col.substring(6,8)+ col.substring(4,6)+ col.substring(2,4);
                        theStyle.polyStyle.alpha = col.substring(0,2);
                        }
                    }
                return theStyle;
                }
            }
        return false;//doesn't exist

    },
    toCells: function(){
        var response = this.attributes.result;
        if (response.fType != 'ARRAY') {return false;} // just arrays ones
        var result = {};
        var colNames = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
        var rowNum=0;
        var i = 0;
        totalRows = response.fRows;
        for (var lRow = 1; lRow <= totalRows; lRow++) {
            var lCells     = '';
            rowNum++;
            for (var lColumns = 0; lColumns < response.fCols; lColumns++) {

                var lCell = response.fArray[i];
                var lValue = '';
                cellType = "string";
                if (lCell.fType == 'TEXT') {
                    if(lCell.fStr.length == 0)      {lValue = '&nbsp';}
                    if (lCell.fStr.length == 1)  {lValue = lCell.fStr.replace('-', '&nbsp;');}
                    else                           {lValue = lCell.fStr;}
                }
                if (lCell.fType == 'NUMBER') {cellType = "number";lValue = String(lCell.fNum);}
                if (lCell.fType == 'DATE') {cellType = "number";lValue = String(lCell.fNum);}
                if (lCell.fType == 'MISSING') {lValue = '-';}
                if(lCell.fType == 'LINK')
                    {
                    lValue = '<a target="_blank" href="' + lCell.fUri + '" rel="nofollow" title="' + lCell.fStr + '">' + lCell.fStr + '</a>';
                    lValue = lCell.fStr;
                    }

                thisColName = colNames[lColumns];
                if (result[thisColName] === undefined) result[thisColName] = {};
                result[thisColName][lRow] = lValue;
                i++;
            }

        }
        //send aditional data
        result.rows = totalRows;
        result.cols = response.fCols;
        return result;
    },
    /*
     * "data":"C 2 : G 13",
     * "chart":{"xTitle":"Mes","yTitle":"Cantidad","scale":0,
     *             "labelSelection":"A 2 : A 13","headerSelection":"C 1 : G 1"}}';
     */
    /**
     * take data and filter
     */
    toGoogle2: function(){
        var cell = this.toCells();
        var result = {cols:[], rows:[]}; //to return later
        var colNames = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

        //if no-label then use headers
        if (this.attributes.headerSelection && "" === this.attributes.labelSelection)
            {
            this.attributes.labelSelection = this.attributes.headerSelection;
            //this.attributes.headerSelection = "";
            }

        if (this.attributes.labelSelection)
            {
            var labelSelection = this.attributes.labelSelection.split(",");
            var labSel = this.findCellRange(labelSelection[0]);
            }

        var useData = false; // in "SERIES" the dataset (attr.data) is different
        if (this.attributes.data && typeof(this.attributes.data) !== "object")
            {
            useData = true;
            var dataSelection = this.attributes.data.split(",");
            var dataSel = this.findCellRange(dataSelection[0]);
            }



        //detect if rows or columns
        //sometimes without label
        var isRows = false;
        if (undefined !== labSel.rStart[0] && labSel.rStart[0] == labSel.rEnd[0]) isRows = true;
        if (useData && dataSel.rStart[0] == dataSel.rEnd[0]) isRows = true;

        // if headerSelection use it
        if (this.attributes.headerSelection)
            {
            result.cols.push({id: "data_00", label: "labels", type: "string"});
            var hss = this.attributes.headerSelection.split(",");

            if (isRows)
                {
                for (h=0; h< hss.length; h++){
                    var headSel = this.findCellRange(hss[h]);

                    range = this.findRange(colNames, headSel.rStart[0], headSel.rEnd[0]);
                    for (var j = range[0]; j <= range[1]; j++ ){
                        for (var k = parseInt(headSel.rStart[1]); k <= parseInt(headSel.rEnd[1]); k++ ){ //colEnd must be parseInt(headSel.rEnd[1])
                            var sType="number";
                            //if (k == parseInt(headSel.rStart[1])) sType="string";//TODO first is String, others are numbers (?)
                            result.cols.push({id: "data_" + j +"_"+ k, label: cell[colNames[j]][k], type: sType});

                            }
                        }
                    }
                }
            else
                {
                for (h=0; h< hss.length; h++){
                    var headSel = this.findCellRange(hss[h]);

                    range = this.findRange(colNames, headSel.rStart[0], headSel.rEnd[0]);
                    for (var k = parseInt(headSel.rStart[1]); k <= parseInt(headSel.rEnd[1]); k++ ){ //colEnd must be parseInt(headSel.rEnd[1])
                        var sType="number";
                        //if (k == parseInt(headSel.rStart[1])) sType="string";//TODO first is String, others are numbers (?)
                        result.cols.push({id: "data_" + range[0] +"_"+ k, label: cell[colNames[range[0]]][k], type: sType});

                        }
                    }
                }
            }
        else
            {
            result.cols.push({id: "data_00", label: "labels", type: "string"});
            result.cols.push({id: "data_01", label: "values", type: "number"});
            }
        /*
        if (undefined === this.attributes.labelSelection || this.attributes.labelSelection == "")
            {
            this.attributes.properties.hAxis.textPosition = "none";
            }
        */

        //son muy distintos los que tienen multiples series de los normales
        if (this.attributes.seriesData !== undefined)
            {
            tRow = [];
            for (var w=0; w < this.attributes.seriesData.length; w++){

                var sd = this.attributes.seriesData[w];
                if (sd === undefined) continue;
                var selc = sd.selection.split(',');//selections (cells)

                for (var x = 0; x < selc.length; x++){
                    var partes = selc[x].trim().split(" ");
                    //just first time add label
                    if (tRow[x] === undefined) tRow[x] = [[{v: "LABEL " + x}]];//TODO get the real labels
                    //add each value
                    var valor = cell[partes[0]][partes[1]];
                    tRow[x].push({v: valor});
                    }
                }

            for (var x = 0; x < tRow.length; x++){
                //sometimes limits are wrong and I add invalid rows
                //for example http://bahiablanca.opendata.junar.com/visualizations/5399/programa-de-gestion-de-residuos-solidos/
                var haveData = false;
                for (var t = 1; t < tRow[x].length; t++)
                    {
                    if (tRow[x][t].v !== undefined) haveData = true;
                    }
                if (haveData) result.rows.push({c:tRow[x]});
                }

            //TODO remove this duplicated lines from here
            var rdata = new google.visualization.DataTable(result);
            var predetFormat = new google.visualization.NumberFormat({pattern: '#,###,###.##',});
            //massive format
            for (var c = 1; c < result.cols.length; c++ ){
                predetFormat.format(rdata, c); // Apply formatter
            }

            var res = {result: result, data: rdata};
            return res;
            }


        if (isRows) // vertical way
            {

            for (s = 0; s < labelSelection.length; s++){
                labSel = this.findCellRange(labelSelection[s]);
                colStart = parseInt(labSel.rStart[1]);

                //sometimes labels are defined before real data starts (including headers)
                if (undefined !== headSel)
                    {
                    if (undefined !== headSel.rEnd)
                        {
                        var lastheaderRow = parseInt(headSel.rEnd[1])
                        if (colStart <= lastheaderRow)
                            colStart = lastheaderRow + 1;
                        }
                    }
                    //sometimes the range is bigger than real results (??) TODO
                colEnd = parseInt(labSel.rEnd[1]);
                //if (cell.cols < (colEnd - colStart)) colEnd = colStart + cell.cols -1;

                for (var j = colStart; j <= colEnd; j++){
                    {
                    var tRow = [];
                    var colN = labSel.rStart[0];
                    tRow.push({v: cell[colN][j]});

                    for (t = 0; t < dataSelection.length; t++){
                        var roll = (t) % labelSelection.length;
                        if (s == t || roll == 0)
                            {
                            dataSel = this.findCellRange(dataSelection[t]);
                            range = this.findRange(colNames, dataSel.rStart[0], dataSel.rEnd[0]);

                            for (var i=range[0]; i <= range[1]; i++)
                                if (cell[colNames[i]] != undefined)
                                    {

                                    valu = this.parseNumber(cell[colNames[i]][j], true);
                                    if (!isNaN(valu))
                                        tRow.push({v: valu});
                                    }
                                else
                                    tRow.push({v: 1});
                                }
                            }
                        }
                    result.rows.push({c:tRow});
                    }
                }
            }
        else
            {
            //horizontal table
            range = this.findRange(colNames, dataSel.rStart[0], dataSel.rEnd[0]);

            rowLabelStart = parseInt(labSel.rStart[1]);
            rowStart = parseInt(dataSel.rStart[1]);
            if (isNaN(rowLabelStart)) rowLabelStart = rowStart;
            rowEnd = parseInt(dataSel.rEnd[1]);

            for (var i=range[0]; i <= range[1]; i++)
                {
                var tRow = [];
                tRow.push({v: cell[colNames[i]][rowLabelStart]});
                for (var j = rowStart; j <= rowEnd; j++){
                    if (cell[colNames[i]] != undefined)
                        {
                        valu = this.parseNumber(cell[colNames[i]][j], true);
                        if (valu == Number.NaN) tRow["invalid"] = true; // maybe is like a header
                        tRow.push({v: valu});
                        }
                    else
                        tRow.push({v: 1});
                    }
                if (! tRow["invalid"]) result.rows.push({c:tRow});
                }
            }

        var rdata = new google.visualization.DataTable(result);

        var predetFormat = new google.visualization.NumberFormat(
                {
                    pattern: '#,###,###.##',
                    /*
                    groupingSymbol: ',',
                    decimalSymbol: '.',
                    fractionDigits: 2,
                    negativeColor: '#FF00000',
                    negativeParens: false,
                    prefix: '', // '$'
                    suffix: '', //'%'
                    */
                }
                );
        //massive format
        for (var c = 1; c < result.cols.length; c++ ){
            predetFormat.format(rdata, c); // Apply formatter
        }

        var res = {result: result, data: rdata};
        return res;
    },
    //transofrm a number with thousand separator in another without it
    // FAILs: for exampla 4.198 returs 4.198, not 4198
    parseNumber: function(pNumber, retNAN) {
        THOUSANDS_SEPARATOR_WITH_COMMAS = /^(\+|\-)?([0-9]{1,3}(,[0-9]{3})*(\.[0-9]+)?|\.[0-9]+)$/
        THOUSANDS_SEPARATOR_WITH_POINTS = /^(\+|\-)?([0-9]{1,3}(\.[0-9]{3})*(,[0-9]+)?|,[0-9]+)$/

        if (/[0-9]/.test(pNumber)) {
            lNumber = pNumber.replace(/[^0-9,.\+\-]/g, '');
            if (THOUSANDS_SEPARATOR_WITH_POINTS.test(lNumber)) {
                lNumber = lNumber.replace(/\./g, '');
                //lNumber = lNumber.replace(/,/g, '.');//AQUI NO! rompe lo que sigue, va antes de parsear
            }
            if (THOUSANDS_SEPARATOR_WITH_COMMAS.test(lNumber)) {
                lNumber = lNumber.replace(/,/g, '');
            }
            lNumber = lNumber.replace(/,/g, '.');
            lNumber = parseFloat(lNumber);
            if (!isNaN(lNumber)) {
                return lNumber;
            }
        }
        retNAN = retNAN || false;
        if (retNAN) return Number.NaN;
        else return pNumber;
    },
    /**
     * detect cell components from range like "A 1: B 9" or "Column : D"
     */
    findCellRange:function(range){
        var result = {rStart:[], rEnd:[]};
        if (undefined === range || range == "") return result;
        var headSel = range.split(":");
        headStart = headSel[0].trim();

        if (headStart == "Column")
            {
            headEnd = headSel[1].trim();
            result.rStart[0] = headEnd;
            result.rStart[1] = 1;
            result.rEnd[0] = headEnd;
            result.rEnd[1] = this.attributes.result.fRows;

            }
        else
            {
            var partes = headStart.split(" ");
            result.rStart[0] = partes[0].trim();
            if (partes.length == 1) partes[1] = partes[0];
            result.rStart[1] = partes[1].trim();

            //maybe it's just one cell
            if (headSel.length == 1) headSel[1] = headSel[0];
            headEnd = headSel[1].trim();
            partes = headEnd.split(" ");
            result.rEnd[0] = partes[0].trim();
            if (partes.length == 1) partes[1] = partes[0];
            result.rEnd[1] = partes[1].trim();
            }
        return result;
    },
    /**
     * Find range of letters
     */
    findRange: function(arr, tFrom, tTo){
        rFrom = 0;
        rTo = 0;
        for (var i=0; i < 1000; i++){
            if (arr[i] == tFrom) rFrom = i;
            if (arr[i] == tTo) rTo = i;
        }
        return [rFrom, rTo];
    },
    toGoogle: function (){
        var response = this.attributes.result;
        if (response.fType != 'ARRAY') {return false;} // just arrays ones

        /**
         * this is my original response:att.dataSelection = pJsonChart.data;
         * /**
         * {"fType":"ARRAY"
         *         ,"fArray":[
         *              {"fStr":"Brochure","fType":"TEXT","fHeader":true}
         *             ,{"fStr":"Brochure Subsection","fType":"TEXT","fHeader":true}
         *             ,{"fStr":"Course ID","fType":"TEXT","fHeader":true}
         *
         *             ,{"fStr":"Teens","fType":"TEXT"}
         *             ,{"fStr":"Aquatics","fType":"TEXT"}
         *             ,{"fStr":"71209","fType":"TEXT"}
         *
         *             ,{"fStr":"Teens2","fType":"TEXT"}
         *             ,{"fStr":"Aquatics2","fType":"TEXT"}
         *             ,{"fStr":"71202","fType":"TEXT"}
         *
                    ,"fRows":2,"fCols":3,"fTimestamp":1382733856757,"fLength":75}
         *
         * this is a Google dataTable to transform to
         *     {
               cols: [  {id: 'task',  label: 'Task',          type: 'string'},
                        {id: 'hours', label: 'Hours per Day', type: 'number'}],
               rows: [{c:[{v: 'Work'}, {v: 11}]},
                      {c:[{v: 'Eat'}, {v: 2}]},
                      {c:[{v: 'Commute'}, {v: 2}]},
                      {c:[{v: 'Watch TV'}, {v:2}]},
                      {c:[{v: 'Sleep'}, {v:7, f:'7.000'}]}
                     ]
               } */

        var result = {cols:[], rows:[]}; //to return later
        var rowNum=0;
        var i = 0;
        totalRows = (response.fLength > 0)? response.fLength: response.fRows;
        for (var lRow = 1; lRow <= response.fRows; lRow++) {
            var lCells     = '';
            thisRow = [];
            rowNum++;
            for (var lColumns = 1; lColumns <= response.fCols; lColumns++) {
                var lCell = response.fArray[i];
                var lValue = '';
                cellType = "string";
                if (lCell.fType == 'TEXT') {
                    if(lCell.fStr.length == 0)      {lValue = '&nbsp';}
                    if (lCell.fStr.length == 1)  {lValue = lCell.fStr.replace('-', '&nbsp;');}
                    else                           {lValue = lCell.fStr;}
                }
                if (lCell.fType == 'NUMBER') {cellType = "number";lValue = String(lCell.fNum);}
                if (lCell.fType == 'MISSING') {lValue = '-';}
                if(lCell.fType == 'LINK'){lValue = '<a target="_blank" href="' + lCell.fUri + '" rel="nofollow" title="' + lCell.fStr + '">' + lCell.fStr + '</a>';}

                if (lCell.fHeader)
                    {
                    //
                    //TODO why we always need a "number"?
                    if (lColumns == 1) result.cols.push({id: lColumns+"_", label: lValue, type: cellType});
                    else result.cols.push({id: lColumns+"_", label: lValue, type: "number"});
                    }
                else
                    {
                    if (lColumns > 1) lValue = parseFloat(lValue)
                    thisRow.push({v: lValue});
                    }
                //lCells = lCells + '<td id="cell' + lCellNum + '"><div>' + lValue + '</div></td>';
                i++;
            }

            if (rowNum > 1) result.rows.push({c:thisRow});
        }

        //sometimes there's no columns as "fHeaders" but I need it.
        if (result.cols.length === 0)
            {
            if (response.fCols > 0)
                {
                for (var fc=1; fc <= response.fCols; fc++)
                    {
                    if (fc == 1) result.cols.push({id: fc+"_", label: "Field "+fc, type: "string"});
                    else result.cols.push({id: fc+"_", label: "Field "+fc, type: "number"});
                    }
                }
            }

        return result;
    },
});

/**
 * For BarChart, ColumnChart, LineChart, AreaChart
 */
var genericGoogleChart = junarChart2.extend({
    defaults : {
        xTitle : '',
        yTitle : '',
        scale : 0
    },
    initialize : function(pJsonChart){
        var att = this.attributes;
        if(att.multipleSeries){
            att.seriesData = [];
            var lSeries = att.data;
            for(var i = 0; i < lSeries.length; i++){
                var lValue = {};
                lValue.series = lSeries[i].series;
                lValue.selection = lSeries[i].selection;
                att.seriesData.push(lValue);
            }
        }else{
            att.dataSelection = att.data;
        }
    },
});

var GeoChart = junarChart2.extend({
    defaults : {
        region : 'world',
        latitudSelection : '',
        longitudSelection : '',
        regionSelection: '',
    },
});

var PieChart = junarChart2.extend({
    defaults : {is3D : true,},
});


var mapChart2 = junarChart2.extend({
    defaults: {
        mapType : 'roadmap',
        zoom_level : null,
        map_center : [0,0],
        map_bounds : null,
        markers: [],
        clusters: [],
        totalMarkers: 0,
        markerClusterer : null,
        heatMap: null,
        map: null,
        onHeatMap: false,
        needToReloadData: false, //special case where I zoom on a heatMap
        stylesDefault: {"marker" :
                            {
                            icon : "https://maps.gstatic.com/mapfiles/ms2/micons/red-pushpin.png"
                            },
                        "polyLine" :
                            {
                            "strokeColor": "#00FFaa",
                            "strokeOpacity": 1.0,
                            "strokeWeight": 2,
                            "fillColor": '#FF0000',
                            "fillOpacity": 0.01
                            },
                        "polyGon" :
                            {
                            "strokeColor": "#FF0000",
                            "strokeOpacity": 1.0,
                            "strokeWeight": 3,
                            "fillColor": '#FF0000',
                            "fillOpacity": 0.35
                            },
                        "map" : [{
                            "featureType":"road","elementType":"labels","stylers":[{"visibility":"on"},{"lightness":20}]},{"featureType":"administrative.land_parcel","elementType":"all","stylers":[{"visibility":"off"}]},{"featureType":"landscape.man_made","elementType":"all","stylers":[{"visibility":"off"}]},{"featureType":"transit","elementType":"all","stylers":[{"visibility":"off"}]},{"featureType":"road.local","elementType":"labels","stylers":[{"visibility":"on"}]},{"featureType":"road.local","elementType":"geometry","stylers":[{"visibility":"simplified"}]},{"featureType":"road.highway","elementType":"labels","stylers":[{"visibility":"on"}]},{"featureType":"poi","elementType":"labels","stylers":[{"visibility":"on"}]},{"featureType":"road.arterial","elementType":"labels","stylers":[{"visibility":"on"}]},{"featureType":"water","elementType":"all","stylers":[{"hue":"#a1cdfc"},{"saturation":30},{"lightness":49}]},{"featureType":"road.highway","elementType":"geometry","stylers":[{"hue":"#f49935"}]},{"featureType":"road.arterial","elementType":"geometry","stylers":[{"hue":"#fad959"}]}]
                        }
        },
        kmlStyleToLine: function(defaultStyle, lineStyle)
            {
            if (_.isUndefined(lineStyle)) return defaultStyle;
            var returnStyle = defaultStyle;
            if (!_.isUndefined(lineStyle)){
                returnStyle.strokeColor = lineStyle.color;
                var opa = (lineStyle.alpha) ? parseInt(lineStyle.alpha, 16) / 256 : 1;//1 is predef
                returnStyle.strokeOpacity = opa;
                returnStyle.strokeWeight = lineStyle.width;
                }
            return returnStyle;
            },
        kmlStyleToPolygon: function(defaultStyle, lineStyle, polyStyle)
            {
            if (_.isUndefined(lineStyle)) return defaultStyle;
            if (_.isUndefined(polyStyle)) return defaultStyle;
            var returnStyle = defaultStyle;
            var lineOpacity = 1;
            var fillOpacity = 0.4;
            if (!_.isUndefined(lineStyle)){
                returnStyle.strokeColor = lineStyle.color;
                returnStyle.strokeWeight = lineStyle.width || 1;
                if (lineStyle.alpha) lineOpacity = parseInt(lineStyle.alpha, 16) / 256;
                }
            if (!_.isUndefined(polyStyle)){
                returnStyle.fillColor = polyStyle.color;
                if (polyStyle.alpha) fillOpacity = parseInt(polyStyle.alpha, 16) / 256;
                }
            returnStyle.strokeOpacity = (polyStyle.outLine) ? lineOpacity : 0;
            returnStyle.fillOpacity = (polyStyle.fill) ? fillOpacity : 0;
            return returnStyle;
            },
        getBoundsByCenterAndZoom: function(div){
            var d = $(div);
            var zf = Math.pow(2, this.attributes.zoom_level) * 2;
            var dw = d.width()  / zf;
            var dh = d.height() / zf;

            this.attributes.map_bounds = [];
            this.attributes.map_bounds[0] = this.attributes.map_center[0] + dh; //NE lat
            this.attributes.map_bounds[1] = this.attributes.map_center[1] + dw; //NE lng
            this.attributes.map_bounds[2] = this.attributes.map_center[0] - dh; //SW lat
            this.attributes.map_bounds[3] = this.attributes.map_center[1] - dw; //SW lng
        }

});

var dataset = Backbone.Model.extend({

    defaults: {

    },

});
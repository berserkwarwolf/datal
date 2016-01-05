var embedChart = Backbone.Model.extend({
    defaults: {
        'title': "",
        'width': "400",
        'height': "175",
        'url': "",
        'headerRows': "0",
        'fixedColumns': "0"
    },
    initialize: function(){
        
    },
    validate: function(attributes, options){
        var errors  = {};       
        var isValid = this.validateHeight(attributes.height, errors) 
                    && this.validateWidth(attributes.width, errors);
                
        if(!isValid){
            return errors;
        }
    },
    validateHeight: function(height, errors){
        var errorList = [];
        
        if(isNaN(height)){
            errorList.push("Height should be a number");
        }
        errors.height = errorList;
        
        if(_.isEmpty(errorList)){
            return true;
        }
        return false;
    },
    validateWidth: function(width, errors){
        var errorList = [];
        
        if(isNaN(width)){
            errorList.push("Width should be a number");
        }
        errors.width = errorList;
        
        if(_.isEmpty(errorList)){
            return true;
        }
        return false;
    },  
    setHeaders: function(headers) {
        var headerRows  = $.trim(headers);
        var url         =  this.get('url').replace(/header_row=\d*/, 'header_row=' + headerRows);
        
        this.set({'headerRows': headerRows, 'url': url}, {validate: true});     
    },
    setColumns: function(columns) {
        var fixedColumns= $.trim(columns);
        var url         =  this.get('url').replace(/fixed_column=\d*/, 'fixed_column=' + fixedColumn);
        
        this.set({'fixedColumns': fixedColumns, 'url': url}, {validate: true});     
    },
});
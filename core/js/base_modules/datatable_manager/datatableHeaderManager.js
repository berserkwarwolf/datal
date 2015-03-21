var DatatableHeaderManager = Backbone.Model.extend({

    defaults: {
        "column.number": 4,
        "column.ascending": false
    },
    
    initialize: function(container, selector, clickable_columns) {
        $(this.get("container")).bind("header:sort:get", _.bind(this.getSort, this))
        
        $('tr', this.get("selector")).click( _.bind(this.headerHandler, this));
        $('tr th input', this.get("selector")).click(_.bind(this.checkboxHandler, this));
    },
    
    getSort: function(event) {
        $(this.get("container")).trigger("datatable:set:sort", [this.get("column.number"), this.get("column.ascending")]);
    },
    
    checkboxHandler: function(event) {
        event.stopPropagation();
        var checkbox_value = $('tr th input', this.get("selector"))[0].checked;
        $('tr th input', this.get("selector")).attr('checked', checkbox_value);
        $(this.get("container")).trigger('datatable:set_checkboxes_state', [checkbox_value]);
    },
    
    headerHandler: function(event) {
        var $Target = $(event.target);
        if (event.target.nodeName == "TH") {
            var $Ths = $('tr th', this.get("selector"));
            var $element = $Ths.eq(0)[0];
            if ($element[0] == event.target) {
            	if($element.find('input')){
            		this.checkboxHandler(event);
            	}
            }
            else {
                var found = false;
                for (var i=0; ((i < this.get("clickable_columns").length) && (!found)); i++ ) {
                    column_number = this.get("clickable_columns")[i];
                    if ($Ths.eq(column_number)[0] == event.target) {      
                        if (this.get("column.number") == column_number) {
                            this.set({"column.ascending": !this.get("column.ascending")});
                        }
                        else {
                            this.set({"column.number": column_number});
                            this.set({"column.ascending": true});
                        }
                        $(this.get("container")).trigger("datatable:refresh:sort");
                        found = true;
                    }
                }
            }
        }          
    }
});
    
var googleSpreadsheetDataStreamView = Backbone.View.extend({

  el: '#id_googleSpreadsheetsDatastreamContainer',
    
  events:{

    'click #id_googleSpreadsheetDataStreamInput': 'onInputClicked'

  },
    
  initialize: function() { 
        
    this.listenTo(this.model, "change", this.render);
    
    this.$el.overlay({
      top: 'center',
      left: 'center',
      mask: {
        color: '#000', 
        loadSpeed: 200, 
        opacity: 0.5, 
        zIndex: 99999
      }
    });
    
    this.$el.data('overlay').load();
    
    this.render();    

  },
  
  render: function() { 

    return this;

  }, 

  onInputClicked: function(event) {

    var input = event.currentTarget;
    $(input).select();

  }

});
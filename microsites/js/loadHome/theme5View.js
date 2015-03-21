var Theme5View = Backbone.View.extend({

  el: '#theme5',

  events:{
    'click .welcomeSection': 'openWelcomePopup'
  },

  initialize: function(options){       
    this.render();
  },

  render: function(){
    return this;
  },

  openWelcomePopup: function(){
    if( this.$el.find('.welcomeSection').hasClass('hasPopup') ){

      var thePopup = $('#id_welcomePopup');

      thePopup.overlay({
        top: 'center',
        left: 'center',
        mask: {
          color: '#000', 
          loadSpeed: 200, 
          opacity: 0.5, 
          zIndex: 99999
        }
      });
      
      thePopup.data('overlay').load();

    }
	}

});
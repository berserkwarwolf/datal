$(document).ready(function(){
	$('input[placeholder]').each(function(index){
		var self = $('input[placeholder]').eq(index);
		self.val( self.attr('placeholder') );
	});
});
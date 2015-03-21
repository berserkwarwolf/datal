$(document).ready(function() {

    var my_container = '#analytics_container';

    window.listenerManager = new ListenerManager({container: my_container, selector: my_container, analytics: junar_ga});
		window.eventsManager = new EventsManager({container: my_container, selector: my_container, analytics: junar_ga});


});
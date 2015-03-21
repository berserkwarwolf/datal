$(document).ready(function(){

	window.CreationManager = new CreationProcessManager();
	window.step0 = new Step0();
	window.step1 = new Step1();
	window.step2 = new Step2();
	window.step3 = new Step3();
	
	CreationManager.register(step0);
	CreationManager.register(step1);
	CreationManager.register(step2);
	CreationManager.register(step3);
	CreationManager.init();
	
    $('#id_steps_navbar li a').hover(function(){
        onMouseOverStepsNav('addClass', this);
    }, function(){
        onMouseOverStepsNav('removeClass', this);
    });

    function onMouseOverStepsNav(action, element){
        var stepPosition = $(element).parent().attr('class');
        stepPosition = stepPosition.split('buttonStep');
        var stepPositionBefore = stepPosition[1] - 1;
        if (stepPositionBefore >= 0) {
            if (action == 'addClass') {
                $('.buttonStep' + stepPositionBefore).addClass('buttonStepHover' + stepPositionBefore);
            }
            else
                if (action == 'removeClass') {
                    $('.buttonStep' + stepPositionBefore).removeClass('buttonStepHover' + stepPositionBefore);
                }
        }
    }
});
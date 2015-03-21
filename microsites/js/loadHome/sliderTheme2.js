function initSlider(){
    $fDataServicesContainer.carouFredSel({
        circular: true,
        infinite: false,
        width: 936,
        height: 229,
        items: {
            minimum: 2,
            visible: 2,
            width: 480,
            height: 229
        },
        scroll: {
            items: 2,
            duration: 1000,
            pauseOnHover: true,
            onEnd: 
                function(){
                    $fDataServicesContainer.trigger("destroy");
                    $('.caroufredsel_wrapper').css('border', 0);
                    initSlider();
                    restartCharts();
                }
        },
        auto: {
            pauseDuration: 5000,
            delay: 5000,
            duration: 800,
            easing: "easeOutExpo"
        }
    });
}
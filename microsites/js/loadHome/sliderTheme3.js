$(document).ready(function(){
    initFeaturedSlider();
});

function initFeaturedSlider(){
    if($('.featuredSlider').length != 0){
        $(".sliderHome").carouFredSel({
            circular: true, 
            infinite: true,
            align: false,
            width: 940,
            height: 300,
            items: {
                visible: 1,
                width: 940,
                height: 300
            },
            scroll: {
                easing: "easeOutExpo",
                duration: 1000,
                pauseOnHover: true
            },
            auto: {
                delay: 1500, 
                pauseDuration: 3500
            },
            prev : {
                button : ".featuredSlider .izq", 
                key : "left"
                },
            next : {
                button : ".featuredSlider .der",
                key : "right"
            }
        });
        $('.shadowSlider').show();
    }
}
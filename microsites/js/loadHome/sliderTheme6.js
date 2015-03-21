$(document).ready(function(){
    initFeaturedSlider();
});

function initFeaturedSlider(){
    if($('.featuredSlider').length != 0){
        $(".sliderHome").carouFredSel({
            circular: true, 
            infinite: true,
            align: false,
            width: 960,
            height: 320,
            items: {
                visible: 1,
                width: 960,
                height: 320
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
    }
}
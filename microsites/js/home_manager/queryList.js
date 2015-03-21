$('.itemsPerPage').hide();
$(document).ready(function(){

    $('.itemsPerPage').hide();

    var lHeaderSearchForm = new HeaderSearchForm();
    var lHeaderMenu = new HeaderMenu();

    initFeaturedSlider();
    
    var my_datatable_container = '#my_datatable';
    var my_datatable_selector = '#my_datatable';

    window.datatableHomeManager = new DatatableHomeManager({container: my_datatable_container, selector: my_datatable_selector, url: '/home/action_update_list'});
    window.datatableHomeFilterManager = new DatatableHomeFilterManager({container: my_datatable_container, selector: '#home_filter' });
    window.datatableSearchManager = new DatatableSearchManager({container: my_datatable_container, selector: '#dataset_search' });
    window.datatablePaginationManager = new DatatablePaginationManager({container: my_datatable_container, selector: '#home_pagination' });
    window.datatableHeaderManager = new DatatableHomeHeaderManager({container: my_datatable_container, selector: '#resources_header', clickable_columns: ['0', '1']});  

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


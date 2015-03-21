$(document).ready(function(){
    initDataServices();
});

function initDataServices(){
    $fDataServicesContainers = $("div[id*=id_dataservice_container_], div[id*=id_dashboard_container_]");

    $fDataServicesContainers.each(function(i){
        $lDataServiceContainer = $(this);

        $lDataServiceContainer.find('#id_dataserviceTagsViewAllButton, #id_dashboardTagsViewAllButton').tooltip({events: {def:'click, mouseleave'}
                                                                                //, effect: 'slide'
                                                                                , position: "bottom center"
                                                                                , offset: [10, -70]
                                                                                , relative: "true"});

        // fixing width for long tags
        var lTagsDivWidth = $lDataServiceContainer.find('#id_dataservice_tags_container').width();
        if (lTagsDivWidth == 400){
            $lDataServiceContainer.find('#id_dataservice_tags_container div').css('width', '10000px');
        }
    });
}

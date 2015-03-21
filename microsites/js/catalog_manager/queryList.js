$(document).ready(function(){
        $("[id*=id_dataservice_container_]").each(function(i){
        $lDataServiceContainer = $(this);
        $lDataServiceContainer.find('div[id*=id_tooltipDataServiceButton_]').mouseleave(function(){$(this).fadeOut('fast')});
    });

    $("[id*=id_dataservice_container_] .name").tooltip({onBeforeShow: onBeforeDataServiceTooltipShowed
                                                         , effect: 'fade'
                                                         , position: "bottom center"
                                                         , offset: [0, 0]
                                                         , relative: true
                                                         });
});


function onBeforeDataServiceTooltipShowed(pEvent, pPosition){
    var $lDataService       = this.getTrigger().parent();
    var $lTooltip           = this.getTrigger().next();

    var lDescription       = jQuery.data( $lDataService[0], "dataservice_description");

    var lHtml = '<div class="In">';
    lHtml +=     '<div class="Punta"></div>';
    lHtml +=     '<h3>' + gettext( "APP-DESCRIPTION-TEXT" ) + ':</h3>';
    lHtml +=     '<p>' + lDescription + '</p>';
    lHtml +=     '</div>';

    $lTooltip.html(lHtml);
}
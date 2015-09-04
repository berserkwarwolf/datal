jQuery.validator.addMethod("notEqualTo", function(value, element, params){
    var lValue = jQuery.trim(value);
    var lResult = true;
    jQuery(params).each(function(){
        if ( lResult && jQuery.trim(jQuery(this).val()) == lValue) {
            lResult = false;
        }
    });
    return lResult;
}, "The elements cannot be equal");

jQuery.validator.addMethod("regex", function(value, element, params) {
    var lRe = new RegExp(params);
    return this.optional(element) || lRe.test(value);
}, "Please check your input.");

jQuery.validator.addMethod("uri", function(value, element, params) {
    value = jQuery.trim(value);
    return this.optional(element) || /^((https?|ftp):\/\/)?(((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:)*@)?(((\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5]))|((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.?)(:\d*)?)(\/((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)+(\/(([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)*)*)?)?(\?((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|\^|\[|\]|\%|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|[\uE000-\uF8FF]|\/|\?)*)?(\#((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|\/|\?)*)?$/i.test(value);
}, gettext('VALIDATE-URLNOTVALID-TEXT'));

jQuery.validator.setDefaults({ 
    errorElement: 'div'
    , errorClass: 'errorFormValidation'
    , errorPlacement: function(pError, pElement) {
        if(pElement.parent().hasClass('formErrorMessageContainer')) {
            elementWidth = pElement.width() + parseInt(pElement.css('padding-right').replace('px', ''));
            labelCssLeft = elementWidth - 20;
            pError.css('left', labelCssLeft + 'px');
        } else if (pElement.parent().hasClass('formErrorMessageContainerLeft')) {
            pElement.parent().addClass('clearfix').css('float', 'left');
            labelCssLeft = pElement.width() + parseInt(pElement.css('padding-right').replace('px', ''))
                                              + parseInt(pElement.css('padding-left').replace('px', ''));
            pError.css('text-align', 'center').css('left', 'auto').css('right', labelCssLeft + 'px');
        }
        pError.insertAfter(pElement);
    }
});
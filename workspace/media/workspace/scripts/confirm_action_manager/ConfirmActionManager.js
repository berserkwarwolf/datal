var ConfirmActionManager = Backbone.Model.extend({
    initialize: function(container, selector, datatable_container) {
        $(this.get("container")).bind("confirm:load", _.bind(this.preloadWidget, this));
        $(this.get("selector")).overlay({top: 'center', left: 'center', mask: {color: '#000', loadSpeed: 200, opacity: 0.5, zIndex: 99999}, closeOnClick: false, closeOnEsc: true, load: false});
        $('.buttons', this.get("selector")).click(_.bind(this.onClickHandler, this));
    },
    preloadWidget: function(event, action_type, resource_type, message) {
        $("#dialog_question", this.get("selector")).text(message);
        var buttons = '';

        if ((action_type == 'delete') && ($.inArray('workspace.can_delete_' + resource_type, authManager.get("privileges")))) {
            if($.inArray('ao-free-user', authManager.get("roles")) != -1){
                buttons = '<button class="delete_resource button small"><span class="delete_resource">' + gettext('APP-TEXT-DELETE_RESOURCE') + '</span></button> <button class="cancel_modal button small">' + gettext('APP-TEXT-CANCEL_MODAL') + '</button>';
            }else{
                buttons = '<button class="delete_resource button small"><span class="delete_resource">' + gettext('APP-TEXT-DELETE_RESOURCE') + '</span></button> <button class="delete_revision button small"><span>' + gettext('APP-TEXT-DELETE_REVISION') + '</span></button> <button class="cancel_modal button small">' + gettext('APP-TEXT-CANCEL_MODAL') + '</button>';
            }
        }
        else if ((action_type == 'delete') && (! $.inArray('workspace.can_delete_' + resource_type, authManager.get("privileges"))))  {
            buttons = '<button class="delete_revision button small"><span class="delete_revision">' + gettext('APP-TEXT-DELETE_REVISION') + '</span></button> <button class="cancel_modal button small">' + gettext('APP-TEXT-CANCEL_MODAL') + '</button>';
        }
        else if (action_type == 'unpublish') {
            var buttons = '<button class="unpublish button small"><span class="unpublish">'+ gettext('APP-TEXT-UNPUBLISH') + '</span></button> <button class="cancel_modal button small">'+ gettext('APP-TEXT-CANCEL_MODAL') + '</button>';
        }

        $(".buttons", this.get("selector")).html(buttons);
        $(this.get("selector")).data("overlay").load();
    },
    onClickHandler: function(event) {
        var $Target = $(event.target);
        if ($Target.hasClass('delete_resource') || $Target.parent().hasClass('delete_resource')) {
            $(this.get('datatable_container')).trigger('datatable:confirm:delete_resource');
            $(this.get("selector")).data('overlay').close();
        }
        else if ($Target.hasClass('delete_revision') || $Target.parent().hasClass('delete_revision')) {
            $(this.get('datatable_container')).trigger('datatable:confirm:delete_revision');
            $(this.get("selector")).data('overlay').close();
        }
        else if ($Target.hasClass('unpublish') || $Target.parent().hasClass('unpublish')) {
            $(this.get('datatable_container')).trigger('datatable:confirm:unpublish');
            $(this.get("selector")).data('overlay').close();
        }
        else if ($Target.hasClass('cancel_modal') || $Target.parent().hasClass('cancel_modal')) {
            $(this.get("selector")).data('overlay').close();
        }
    }
});
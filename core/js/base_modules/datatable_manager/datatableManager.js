var DatatableManager = Backbone.Model.extend({
    initialize: function(container, selector, url, delete_revision_url, delete_url, submit_url, publish_url, unpublish_url) {
        $(this.get("container")).bind('datatable:set:search', _.bind(this.setSearch, this));
        $(this.get("container")).bind('datatable:set:categories', _.bind(this.setCategories, this));
        $(this.get("container")).bind('datatable:set:status', _.bind(this.setStatus, this));
        $(this.get("container")).bind('datatable:set:whom', _.bind(this.setWhom, this));
        $(this.get("container")).bind('datatable:set:page', _.bind(this.setPage, this));
        $(this.get("container")).bind('datatable:set:sort', _.bind(this.setSort, this));
        $(this.get("container")).bind('datatable:set:items_per_page', _.bind(this.setItemsPerPage, this));
        $(this.get("container")).bind('datatable:refresh:search', _.bind(this.refreshTableSearch, this));
        $(this.get("container")).bind('datatable:refresh:filter', _.bind(this.refreshTableFilter, this));
        $(this.get("container")).bind('datatable:refresh:pagination', _.bind(this.refreshTablePagination, this));
        $(this.get("container")).bind('datatable:refresh:sort', _.bind(this.refreshTableSort, this));
        $(this.get("container")).bind("datatable:refresh:items_per_page", _.bind(this.refreshTableItemsPerPage, this));
        $(this.get("container")).bind("datatable:refresh:create_dataset", _.bind(this.refreshTableCreateDataset, this));
        $(this.get("container")).bind('datatable:refresh:tab_manager', _.bind(this.refreshTabManager, this));
        $(this.get("container")).bind("datatable:set_checkboxes_state", _.bind(this.setCheckboxesState, this));

        $('#massive', this.get("selector")).click(_.bind(this.onClickMassive, this));
        $('table', this.get("selector")).click(_.bind(this.onClickRowButton, this));
    },
    confirmUnpublish: function() {
        var self = this;
        data = {csrfmiddlewaretoken: csrfmiddlewaretoken, revision_id: this.get("unpublish_ids")};
        $.ajax({url: this.get("unpublish_url"), type: 'POST', data: data, success: function(msg) {
            if (msg.messages != undefined) {
                for (var i = 0; i < msg.messages.length; i++) {
                    var status = msg.status == "ok" ? 'success' : 'error';
                    jQuery.TwitterMessage({type: status, message: msg.messages[i]});
                }
            }
            self.refreshWithoutPagination();
        }});
    },
    confirmDeleteResource: function() {
        var self = this;
        var data = {csrfmiddlewaretoken: csrfmiddlewaretoken, revision_id: this.get("delete_resource_ids")};
        $.ajax({url: this.get("delete_url"), type: 'POST', data: data, success: function(msg) {
            if (msg.messages != undefined) {
                for (var i = 0; i < msg.messages.length; i++) {
                    var status = msg.status == "ok" ? 'success' : 'error';
                    jQuery.TwitterMessage({type: status, message: msg.messages[i]});
                }
            }
            self.refreshWithPagination();
        }});
    },
    confirmDeleteRevision: function() {
        var self = this;
        var data = {csrfmiddlewaretoken: csrfmiddlewaretoken, revision_id: this.get("delete_revision_ids")};
        $.ajax({url: this.get("delete_revision_url"), type: 'POST', data: data, success: function(msg) {
            if (msg.messages != undefined) {
                for (var i = 0; i < msg.messages.length; i++) {
                    var status = msg.status == "ok" ? 'success' : 'error';
                    jQuery.TwitterMessage({type: status, message: msg.messages[i]});
                }
            }
            self.refreshWithPagination();
        }});
    },
    onClickMassive: function(event) {
        var $Target = $(event.target);
        var is_empty = true;

        $('tr td input:checked', this.get("selector")).each(function(i, e) {
            is_empty = false;
        });
        if (!is_empty) {
            if ($Target.hasClass('mass_delete')) {
                var temp_resource_delete = '';
                var temp_revision_delete = '';
                $('tr td input:checked', this.get("selector")).each(function(i, e){
                    temp_resource_delete += $(e).parent().parent().data("resource_id") + ',';
                    temp_revision_delete += $(e).parent().parent().data("revision_id") + ',';
                });
                if (temp_resource_delete != '' && temp_revision_delete != '') {
                    temp_resource_delete = temp_resource_delete.substring(0, temp_resource_delete.length - 1);
                    temp_revision_delete = temp_revision_delete.substring(0, temp_revision_delete.length - 1);
                    this.set({
                        'delete_resource_ids': temp_resource_delete
                    });
                    this.set({
                        'delete_revision_ids': temp_revision_delete
                    });
                    this.triggerModalDelete(gettext("APP-TEXT-CONFIRM_DELETE_PLURAL"));
                }
            }
            else
                if ($Target.hasClass('mass_submit')) {
                    var temp_submit = '';
                    $('tr td input:checked', this.get("selector")).each(function(i, e){
                        temp_submit += $(e).parent().parent().data("revision_id") + ',';
                    });
                    if (temp_submit != '') {
                        temp_submit = temp_submit.substring(0, temp_submit.length - 1);
                        this.submitRevisions(temp_submit);
                    }
                }
                else
                    if ($Target.hasClass('mass_publish')) {
                        var temp_submit = '';
                        $('tr td input:checked', this.get("selector")).each(function(i, e){
                            temp_submit += $(e).parent().parent().data("revision_id") + ',';
                        });
                        if (temp_submit != '') {
                            temp_submit = temp_submit.substring(0, temp_submit.length - 1);
                            this.publishRevisions(temp_submit);
                        }
                    }
                    else
                        if ($Target.hasClass('mass_unpublish')) {
                            var temp_submit = '';
                            $('tr td input:checked', this.get("selector")).each(function(i, e){
                                temp_submit += $(e).parent().parent().data("revision_id") + ',';
                            });
                            if (temp_submit != '') {
                                temp_submit = temp_submit.substring(0, temp_submit.length - 1);
                                this.set({
                                    'unpublish_ids': temp_submit
                                });
                                this.triggerModalUnpublish(gettext("APP-TEXT-CONFIRM_UNPUBLISH_PLURAL"));
                            }
                        }
        }else{
            alert(gettext("APP-TEXT-NOCHECKBOXSELECTED"))
        }
    },
    triggerModalDelete: function(message, type) {
        $(this.get("modal_container")).trigger('confirm:load', ['delete', type, message]);
    },
    triggerModalUnpublish: function(message, type) {
        $(this.get("modal_container")).trigger('confirm:load', ['unpublish', type, message]);
    },
    onClickRowButton: function(event) {

    },
    deleteRevisions: function(ids) {
        var self = this;
        if (confirm('Are you sure you want to delete this/these revisions?')) {
            data = {csrfmiddlewaretoken: csrfmiddlewaretoken, revision_id: ids};

            $.ajax({url: this.get("delete_revision_url"), type: 'POST', data: data, success: function(msg) {
                if (msg.messages != undefined) {
                    for (var i = 0; i < msg.messages.length; i++) {
                        jQuery.TwitterMessage({type: 'error', message: msg.messages[i]});
                    }
                }
                if (msg.status == 'ok') {
                    self.refreshWithPagination();
                }
            }}
            );
        }
    },
    submitRevisions: function(ids) {
        data = {csrfmiddlewaretoken: csrfmiddlewaretoken, revision_id: ids};
        var self = this;
        $.ajax({url: this.get("submit_url"), type: 'POST', data: data, success: function(msg) {
            if (msg.messages != undefined) {
                for (var i = 0; i < msg.messages.length; i++) {
                    var status = msg.status == "ok" ? 'success' : 'error';
                    jQuery.TwitterMessage({type: status, message: msg.messages[i]});
                }
            }
            self.refreshWithoutPagination();
        }}
        );
    },

    approveRevisions : function(ids){
        data = {csrfmiddlewaretoken: csrfmiddlewaretoken, revision_id: ids};
        var self = this;
        $.ajax({url: this.get("approve_url"), type: 'POST', data: data, success: function(msg) {
            if (msg.messages != undefined) {
                for (var i = 0; i < msg.messages.length; i++) {
                    var status = msg.status == "ok" ? 'success' : 'error';
                    jQuery.TwitterMessage({type: status, message: msg.messages[i]});
                }
            }
            self.refreshWithoutPagination();
        }}
        );
    },
    publishRevisions: function(ids) {
        data = {csrfmiddlewaretoken: csrfmiddlewaretoken, revision_id: ids};
        var self = this;
        $.ajax({url: this.get("publish_url"), type: 'POST', data: data, success: function(msg) {
            if (msg.messages != undefined) {
                for (var i = 0; i < msg.messages.length; i++) {
                    var status = msg.status == "ok" ? 'success' : 'error';
                    jQuery.TwitterMessage({type: status, message: msg.messages[i]});
                }
            }
            self.refreshWithoutPagination();
        }}
        );
    },
    unpublishRevisions: function(ids) {
        var self = this;
        if (confirm('Are you sure you want to unpublish this/these revisions?')) {
            data = {csrfmiddlewaretoken: csrfmiddlewaretoken, revision_id: ids};
            $.ajax({url: this.get("unpublish_url"), type: 'POST', data: data, success: function(msg) {
                if (msg.messages != undefined) {
                    for (var i = 0; i < msg.messages.length; i++) {
                        var status = msg.status == "ok" ? 'success' : 'error';
                        jQuery.TwitterMessage({type: status, message: msg.messages[i]});
                    }
                }

                self.refreshWithoutPagination();
            }}
            );
        }
    },
    rejectRevisions : function(ids){
        data = {csrfmiddlewaretoken: csrfmiddlewaretoken, revision_id: ids};
        var self = this;
        $.ajax({url: this.get("reject_url"), type: 'POST', data: data, success: function(msg) {
            if (msg.messages != undefined) {
                for (var i = 0; i < msg.messages.length; i++) {
                    var status = msg.status == "ok" ? 'success' : 'error';
                    jQuery.TwitterMessage({type: status, message: msg.messages[i]});
                }
            }
            self.refreshWithoutPagination();
        }}
        );
    },
    setSort: function(event, number, ascending) {
        this.set({"column.number": number, "column.ascending": ascending});
    },
    setPage: function(event, page) {
        this.set({page: page});
    },
    setWhom: function(event, whom) {
        this.set({whom: whom});
    },
    setCheckboxesState: function(event, state) {
        $('tbody tr td input', this.get("selector")).attr('checked', state);
    },
    setItemsPerPage: function(event, items_per_page) {
        this.set({items_per_page: items_per_page});
    },
    setStatus: function(event, status) {
        this.set({status_filters: status});
    },
    setSearch: function(event, search) {
        this.set({search: search});
    },
    setCategories: function(event, categories) {
        this.set({category_filters: categories});
    },
    getFormParameters: function(data) {
        $(this.get("container")).trigger("filter:get:categories");
        $(this.get("container")).trigger("filter:get:status");
        $(this.get("container")).trigger("filter:get:owner");
        $(this.get("container")).trigger("search:get");
        $(this.get("container")).trigger("pagination:get:page");
        $(this.get("container")).trigger("pagination:get:items_per_page");
        $(this.get("container")).trigger("header:sort:get");

        if (this.get("category_filters") != '') {
            data.category_filters = this.get("category_filters");
        }
        if (this.get("status_filters") != '') {
            data.status_filters = this.get("status_filters");
        }
        if (this.get("whom") == true) {
            data.all = true;
        }
        if (this.get("whom") == false) {
            data.mine = true;
        }
        if (this.get("search") != '') {
            data.search = this.get("search");
        }

        data.page = this.get("page");
        data.items_per_page = this.get("items_per_page");
        data.order = this.get("column.number");
        if (this.get("column.ascending") == true) {
            data.order_type = 'ascending';
        }
        else {
            data.order_type = 'descending';
        }
        return data;
    },
    getRowTemplate: function(msg) {

    },
    drawRow: function(msg) {
        $('table tbody', this.get("selector")).append(this.getRowTemplate(msg));
    },
    drawTable: function(msg) {
        $('table tbody', this.get("selector")).empty();
        var self = this;
        $.each(msg.revisions, function(i, e) {
            self.drawRow(e);
        });
        if (msg.revisions.length == 0) {
            $('table tbody', this.get("selector")).append('<tr><td class="noneMsg" colspan="20">' + gettext('APP-NO_RECORDS_FOUND-TEXT') + '</td></tr>');
        }
        $(this.get("container")).trigger("datatable:tablesorter");
    },
    refreshWithPagination: function(event) {
        $(this.get("container")).trigger("pagination:set:page", ['']);

        var msg = this.getServerData();
        this.drawTable(msg);
        var empty = false
        if (msg.revisions.length == 0) {
            empty = true;
        }
        $(this.get("container")).trigger("pagination:draw", [msg.number_of_pages, empty]);
    },
    refreshWithoutPagination: function(event) {
        var msg = this.getServerData();
        this.drawTable(msg);
    },
    refreshTableSearch: function(event) {
        this.refreshWithPagination();
    },
    refreshTablePagination: function(event) {
        this.refreshWithoutPagination();
    },
    refreshTableItemsPerPage: function(event) {
        this.refreshWithPagination();
    },
    refreshTabManager: function(event) {
        this.refreshWithoutPagination();
        this.set({"refresh": false});
    },
    refreshTableSort: function(event) {
        this.refreshWithPagination();
    },
    refreshTableCreateDataset: function() {
        this.refreshWithPagination();
    },
    refreshTableEditDataset: function() {
        this.refreshWithPagination();
    },
    refreshTableFilter: function(event) {
         this.refreshWithPagination();
    },
    getServerData: function() {
        //generate the form data
        var self = this;
        data = {csrfmiddlewaretoken: csrfmiddlewaretoken};
        var data = this.getFormParameters(data);
        var return_data = {};
        $.ajax({url: this.get("url"), type: 'POST', async:false, data: data, success: function(msg) {
            return_data = msg;
        }}
        );
        return return_data;
    }
});

var CreateDatastreamSidebarManager = DatasetCreateSidebarManager.extend({
    initialize: function(container, selector) {
        $('ul', this.get("selector")).click(_.bind(this.clickHandler, this));
        $(this.get("container")).trigger('create_dataset:url:hide');
        $(this.get("container")).trigger('create_dataset:file:hide');
        $(this.get("container")).trigger('create_dataset:webservice:hide');
    },
    clickHandler: function(event) {
        var $Target = $(event.target);
        if ($Target.hasClass('create_dataset_file')) {
            this.myComputerTab($Target);
           $('#create_dataset_sidebar li').removeClass('tab-selected');
            $Target.parents('li').addClass('tab-selected');
        }
        else if ($Target.hasClass('create_dataset_url')) {
            this.URLTab($Target);
            $('#create_dataset_sidebar li').removeClass('tab-selected');
            $Target.parents('li').addClass('tab-selected');
        }
        else if ($Target.hasClass('create_lib_url')) {
            this.libraryTab($Target);
            $('#create_dataset_sidebar li').removeClass('tab-selected');
            $Target.parents('li').addClass('tab-selected');
        }
        else if ($Target.hasClass('create_dataset_webservice')) {
            this.webserviceTab($Target);
            $('#create_dataset_sidebar li').removeClass('tab-selected');
            $Target.parents('li').addClass('tab-selected');
        }
    },
    myComputerTab: function($Target) {
        $(this.get("container")).trigger('create_dataset:file:clear');
        $(this.get("container")).trigger('create_dataset:file:show');
        $(this.get("container")).trigger('create_dataset:url:hide');
        $(this.get("container")).trigger('create_dataset:lib:hide');
        $(this.get("container")).trigger('create_dataset:webservice:clear');
        $(this.get("container")).trigger('create_dataset:webservice:hide');
    },
    URLTab: function($Target) {
        $(this.get("container")).trigger('create_dataset:url:clear');
        $(this.get("container")).trigger('create_dataset:url:show');
        $(this.get("container")).trigger('create_dataset:file:hide');
        $(this.get("container")).trigger('create_dataset:lib:hide');
        $(this.get("container")).trigger('create_dataset:webservice:clear');
        $(this.get("container")).trigger('create_dataset:webservice:hide');
    },
    libraryTab: function($Target) {
        $(this.get("container")).trigger('create_dataset:lib:clear');
        $(this.get("container")).trigger('create_dataset:lib:show');
        $(this.get("container")).trigger('create_dataset:file:hide');
        $(this.get("container")).trigger('create_dataset:url:hide');
        $(this.get("container")).trigger('create_dataset:webservice:clear');
        $(this.get("container")).trigger('create_dataset:webservice:hide');
    },
    webserviceTab: function($Target) {
        $(this.get("container")).trigger('create_dataset:url:clear');
        $(this.get("container")).trigger('create_dataset:url:hide');
        $(this.get("container")).trigger('create_dataset:file:clear');
        $(this.get("container")).trigger('create_dataset:file:hide');
        $(this.get("container")).trigger('create_dataset:lib:hide');
        $(this.get("container")).trigger('create_dataset:webservice:clear');
        $(this.get("container")).trigger('create_dataset:webservice:show');
    }
});

var CreateDatastreamFileManager = CreateDatastreamManager.extend({
    initialize: function(container, selector, save_draft_url, save_review_url) {
        $(this.get("container")).bind('create_dataset:file:clear', _.bind(this.clearForm, this));
        $(this.get("container")).bind('create_dataset:file:show', _.bind(this.showForm, this));
        $(this.get("container")).bind('create_dataset:file:hide', _.bind(this.hideForm, this));

        $('.buttons', this.get("selector")).click(_.bind(this.buttonsClickHandler, this));

        $('#create_dataset_file_form').fileupload({
            done: _.bind(this.onFileUploadComplete, this),
            add: _.bind(this.onFileSelected, this),
            fail: _.bind(this.onErrorFileUpload, this),
            maxNumberOfFiles: 1,
            forceIframeTransport: true,
            replaceFileInput: false,
            singleFileUploads: true,
            acceptFileTypes: '/(\.|\/)(doc|docx|docm|dotx|dotm|xls|xlsx|xlsm|xltx|xltm|xlsb|xlam|xll|odt|ods|csv|txt|pdf|html|htm|kml)$/i'
        });

        $('#create_dataset_file_form', this.get("selector")).validate({
              rules: {
                'title': {'required': true, 'maxlength': 80},
                'label': {'required': true, 'number': true },
                'description': { 'required': true, 'maxlength': 140},
                'Filedata': {'required': true, 'accept': 'doc|docx|docm|dotx|dotm|xls|xlsx|xlsm|xltx|xltm|xlsb|xlam|xll|odt|ods|csv|txt|pdf|html|htm|kml|zip|tar|gz|jpg|jpeg|png|gif'},
              }
        });
    },
    onFileSelected: function(event, data) {
        this.set({files:data.files});
    },
    onErrorFileUpload: function(event, data) {
        try {
            response = JSON.parse(data.jqXHR.responseText);
            jQuery.TwitterMessage({type: 'error', message: response.messages.join('. ')});
        } catch (err) {
            jQuery.TwitterMessage( { type: 'error', message : gettext("ERROR-LOADING-DATASET") } );
        }
    },
    onFileUploadComplete: function(event, data) {
        var response = JSON.parse( $( 'pre', data.result ).text() );
        window.location.replace('/streams/action_insert?dataset_revision_id=' + response.dataset_revision_id);
        $('#id_create_datastream_overlay').data('overlay').close();
    },
    saveAs: function(url) {
        if ($('#create_dataset_file_form').valid()) {
            var data = this.getFormParameters({});

            $("#create_dataset_file_form", this.get("selector")).fileupload('option', {url: url, formData: data});
            $("#create_dataset_file_form", this.get("selector")).data('fileupload').send({files: this.get("files")});
        }
    },
    getFormParameters: function(data) {
        data.title = $('#id_title', this.get("selector")).val();
        data.description = $('#id_description', this.get("selector")).val();
        data.label = $('#id_label', this.get("selector")).val();
        return data;
    }
});

var CreateDatastreamURLManager = CreateDatastreamManager.extend({
    initialize: function(container, selector) {
        $(this.get("container")).bind('create_dataset:url:clear', _.bind(this.clearForm, this));
        $(this.get("container")).bind('create_dataset:url:show', _.bind(this.showForm, this));
        $(this.get("container")).bind('create_dataset:url:hide', _.bind(this.hideForm, this));

        $('.buttons', this.get("selector")).click(_.bind(this.buttonsClickHandler, this));

        $('#create_dataset_url_form', this.get("selector")).validate({
              rules: {
                'title': {'required': true, 'maxlength': 80},
                'label': {'required': true, 'number': true },
                'description': { 'required': true, 'maxlength': 140},
                'url': {'required': true, 'maxlength': 2048, 'uri': true},
              }
        });
    },
    getFormParameters: function(data) {
        data.title = $('#id_title', this.get("selector")).val();
        data.description = $('#id_description', this.get("selector")).val().replace(/(\r\n|\n|\r)/gm," ");;
        data.label = $('#id_label', this.get("selector")).val();

        var HTTP_PROTOCOL   = "http://";
        var HTTPS_PROTOCOL  = "https://";
        var url             = $.trim($('#id_url', this.get("selector")).val());

        if(url.substr(0,7) != HTTP_PROTOCOL
           && url.substr(0,8) != HTTPS_PROTOCOL) {
            url = HTTP_PROTOCOL + url;
        }

        data.url = url;

        return data;
    },
    saveAs: function(url) {
        this.attributes.save_url = url;
        if ($('#create_dataset_url_form').valid()) {
            $("#create_dataset_url_form #id_loader", this.get("selector")).show();
            var data = {csrfmiddlewaretoken: csrfmiddlewaretoken};
            this.attributes.data = this.getFormParameters(data);
            this.checkMimeType();
        }
    },
    checkMimeType : function(){
        var url  = '/datasets/check_source_url';
        var data = "url="+ $.URLEncode(this.attributes.data.url);

        $.ajax({ url: url,
                    data:data,
                    dataType: 'json',
                    success: _.bind(this.onCheckSourceUrlSuccess, this),
                    error: function(pResponse){
                    }
                });
    },
    onCheckSourceUrlSuccess : function(pResponse){
        this.attributes.data.url = pResponse.url;
        this.setImplementationTypeByMimeType(pResponse.mimetype);
        var self = this;
        $.ajax({url: this.attributes.save_url, type:'POST', data: this.attributes.data, success: function(msg) {
            window.location.replace('/streams/action_insert?dataset_revision_id=' + msg.dataset_revision_id)
            $('#id_create_datastream_overlay').data('overlay').close();
        },
        error: function(response) {
            response = JSON.parse(response.responseText);
            jQuery.TwitterMessage({type: 'error', message: response.messages.join('. ')});
        }});
    },
    setImplementationTypeByMimeType : function(mimeType){
        var implType = '';
        mimeType = mimeType.split(";")[0];
        switch(mimeType) {
            case "application/vnd.ms-xpsdocument":
                implType = 6;
                break;
            case "application/vnd.ms-excel":
                implType = 4;
                break;
            case "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet":
                implType = 4;
                break;
            case "application/vnd.oasis.opendocument.text":
                implType = 7;
                break;
            case "application/vnd.oasis.opendocument.text-web":
                implType = 7;
                break;
            case "application/vnd.oasis.opendocument.spreadsheet":
                implType = 9;
                break;
            case "application/msword":
                implType = 6;
                break;
            case "text/html":
                implType = 0;
                break;
            case "text/csv":
                implType = 10;
                break;
            case "text/xml":
                implType = this.checkExtension();
                break;
            case "text/x-comma-separated-values":
                implType = 10;
                break;
            case "text/plain":
                implType = 10;
                break;
            case "application/octet-stream" :
                implType = this.checkExtension();
                break;
            case "application/pdf" :
                implType = 5;
                break;
            case "application/vnd.google-earth.kml+xml" :
                implType = 11;
                break;
            case "application/xml":
                implType = 3;
                break;
            default:
                implType = 0;
                implType;
        }

        this.attributes.data.impl_type = implType;
    },
    checkExtension : function(){
        var filename    = this.attributes.data.url.split('/');
        filename        = filename[filename.length - 1];
        var extension   = filename.split('.')[1];

        var implType = '';
        switch(extension) {
            case "doc":
                implType = "06";
                break;
            case "docx":
                implType = "06";
                break;
            case "docm":
                implType = "06";
                break;
            case "dotx":
                implType = "06";
                break;
            case "dotm":
                implType = "06";
                break;
            case "xlsx":
                implType = "04";
                break;
            case "xlsm":
                implType = "04";
                break;
            case "xls":
                implType = "04";
                break;
            case "xltx":
                implType = "04";
                break;
            case "xltm":
                implType = "04";
                break;
            case "xlsb":
                implType = "04";
                break;
            case "xlam":
                implType = "04";
                break;
            case "xll":
                implType = "04";
                break;
            case "odt":
                implType = "07";
                break;
            case "ods":
                implType = "09";
                break;
            case "html":
                implType = "00";
                break;
            case "csv":
                implType = "10";
                break;
            case "txt":
                implType = "10";
                break;
            case "kml":
                implType = "11";
                break;
            case "pdf" :
                implType = "05";
                break;
            case "xml" :
                implType = "03";
        }

        return implType;
    }
});

var DatasetCreateWebserviceManager = CreateDatastreamManager.extend({
    initialize: function(container, selector) {
        $(this.get("container")).bind('create_dataset:webservice:clear', _.bind(this.clearForm, this));
        $(this.get("container")).bind('create_dataset:webservice:show', _.bind(this.showForm, this));
        $(this.get("container")).bind('create_dataset:webservice:hide', _.bind(this.hideForm, this));

        $('#id_next', this.get("selector")).click(_.bind(this.buttonsClickHandler, this));
        $('#create_dataset_webservice_form', this.get("selector")).validate({
              rules: {
                'title': {'required': true, 'maxlength': 80},
                'label': {'required': true, 'number': true },
                'description': { 'required': true, 'maxlength': 140},
                'end_point': {'required': true, 'maxlength': 2048, 'uri': true},
                'path_to_headers': { 'required': false, 'maxlength': 256 },
                'path_to_data': { 'required': false, 'maxlength': 256 },
                'token': { 'required': false, 'maxlength': 256 },
                'algorithm': { 'required': false, 'maxlength': 256 },
                'method_name': { 'required': false, 'maxlength': 256 },
                'namespace': { 'required': false, 'maxlength': 256 }
              }
        });

        var selector = this.get("selector");
        $('#id_impl_type', this.get("selector")).change(function(event){
            var currentValue = parseInt($(this).val());
            if(currentValue == 1){
                $('#id_webservice_tips', selector).removeClass('DN');
                $('#id_json_tips', selector).addClass('DN');
                $('.rest', selector).each(function(){
                    $(this).removeClass('clearfix').addClass('DN');
                })
                $('.soap', selector).each(function(){
                    $(this).removeClass('DN').addClass('clearfix');
                });
            } else if(currentValue == 14) {
                $('#id_webservice_tips', selector).addClass('DN');
                $('#id_json_tips', selector).removeClass('DN');
                $('.soap', selector).each(function(){
                    $(this).removeClass('clearfix').addClass('DN');
                })
                $('.rest', selector).each(function(){
                    $(this).removeClass('DN').addClass('clearfix');
                });
            }
        });

        $('#id_parameters_form', this.get("selector")).validate({
              rules: {
                'param_name': {'required': true, 'maxlength': 80},
                'param_value': { 'required': true, 'maxlength': 80}
              }
        });

        $('#id_add_parameter', this.get("selector")).click(_.bind(this.addParameter, this));
        $('#id_parameters_list', this.get("selector")).click(_.bind(this.removeParameter, this));
        $('#id_impl_type', this.get("selector")).trigger('change');
    },
    clearForm: function() {
        $('input', this.get("selector")).val('');
        $('textarea', this.get("selector")).val('');
        $("select", this.get("selector"))[0].selectedIndex = 0;
        $('#id_editable').attr('checked', false);
        $('#id_parameters_list *').remove();

    },
    getFormParameters: function(data) {
        data.title = $('#id_title', this.get("selector")).val();
        data.description = $('#id_description', this.get("selector")).val().replace(/(\r\n|\n|\r)/gm," ");;
        data.label = $('#id_label', this.get("selector")).val();

        var HTTP_PROTOCOL   = "http://";
        var HTTPS_PROTOCOL  = "https://";
        var url             = $.trim($('#id_end_point', this.get("selector")).val());

        if(url.substr(0,7) != HTTP_PROTOCOL
           && url.substr(0,8) != HTTPS_PROTOCOL) {
            url = HTTP_PROTOCOL + url;
        }

        data.end_point = url;

        var xml = new XMLManager();
        var nameSpace      = '';
        var dataSource     = xml.createXMLDocument('wsOperation', nameSpace, null);

        data.impl_type = $.trim($('#id_impl_type', this.get("selector")).val());
        if(parseInt(data.impl_type) == 1){
            data.method_name = $.trim($('#id_method_name', this.get("selector")).val());
            data.namespace = $.trim($('#id_namespace', this.get("selector")).val());

            var methodnameElement   = xml.createElementNS(nameSpace, 'methodName', dataSource);
            var methodnameText      = dataSource.createTextNode(data.method_name);
            methodnameElement.appendChild(methodnameText);

            var targetElement   = xml.createElementNS(nameSpace, 'targetNamespace', dataSource);
            var targetText      = dataSource.createTextNode(data.namespace);
            targetElement.appendChild(targetText);

            dataSource.documentElement.appendChild(methodnameElement);
            dataSource.documentElement.appendChild(targetElement);
        }
        else{
            data.path_to_data = $.trim($('#id_path_to_data', this.get("selector")).val());
            data.path_to_headers = $.trim($('#id_path_to_headers', this.get("selector")).val());
            data.token = $.trim($('#id_token', this.get("selector")).val());
            data.algorithm = $.trim($('#id_algorithm', this.get("selector")).val());
            data.signature = $.trim($('#id_signature', this.get("selector")).val());


            var pathToHeadersElement = xml.createElementNS(nameSpace, 'pathToHeaders', dataSource);
            var pathToHeadersText    = dataSource.createTextNode(data.path_to_headers);
            pathToHeadersElement.appendChild(pathToHeadersText);
            dataSource.documentElement.appendChild(pathToHeadersElement);

            var pathToDataElement = xml.createElementNS(nameSpace, 'pathToData', dataSource);
            var pathToDataText    = dataSource.createTextNode(data.path_to_data);
            pathToDataElement.appendChild(pathToDataText);
            dataSource.documentElement.appendChild(pathToDataElement);

            var uriSignaturesElement = xml.createElementNS(nameSpace, 'uriSignatures', dataSource);

            var signatureElement = xml.createElementNS(nameSpace, data.signature, dataSource);
            var tokenElement   = xml.createElementNS(nameSpace, 'token', dataSource);
            var tokenText      = dataSource.createTextNode(data.token);
            tokenElement.appendChild(tokenText);
            signatureElement.appendChild(tokenElement);

            var algorithmElement   = xml.createElementNS(nameSpace, 'algorithm', dataSource);
            var algorithmText      = dataSource.createTextNode(data.algorithm);
            algorithmElement.appendChild(algorithmText);
            signatureElement.appendChild(algorithmElement);
            uriSignaturesElement.appendChild(signatureElement);

            dataSource.documentElement.appendChild(uriSignaturesElement);
        }

        var argsElement   = xml.createElementNS(nameSpace, 'args', dataSource);

        $('#id_parameters_list .args', this.get("selector")).each(function(i){
            var element = $(this);
            var name = element.find('.tagTxt').text();
            var value = element.attr('data-value');
            var editable = element.attr('data-edit');

            var argElement   = xml.createElementNS(nameSpace, name, dataSource);
            var argText      = dataSource.createTextNode(value);
            if(editable == "true"){
                xml.setAttributeNodeNS (argElement, 'editable', editable, nameSpace);
            }

            argElement.appendChild(argText);
            argsElement.appendChild(argElement);
        });

        dataSource.documentElement.appendChild(argsElement);

        data.impl_details = xml.serializeNode(dataSource);

        return data;
    },
    saveAs: function(url) {
        this.attributes.save_url = url;
        if ($('#create_dataset_webservice_form', this.get("selector")).valid()) {
            var data = {csrfmiddlewaretoken: csrfmiddlewaretoken};
            this.attributes.data = this.getFormParameters(data);

            var self = this;
            $.ajax({url: this.attributes.save_url, type:'POST', data: this.attributes.data, success: function(msg) {
                $(self.get("container")).trigger('create_dataset:webservice:clear');
                $(self.get("container")).trigger('datatable:refresh:create_dataset');
                $("#ajax_loading_overlay").hide();
                $('#id_create_dataset_form_overlay').data('overlay').close();
                if(self.attributes.is_enhance){
                    window.location.replace('/streams/action_insert?dataset_revision_id=' + msg.dataset_revision_id, '_blank')
                    self.attributes.is_enhance = false;
                }else{
                    jQuery.TwitterMessage( { type: 'success', message : msg.messages.join('. ') } );
                }
            },
        error: function(response) {
            response = JSON.parse(response.responseText);
            jQuery.TwitterMessage({type: 'error', message: response.messages.join('. ')});
        }});
        }
    },
    saveAndEnhance : function(url){
        this.attributes.save_url = url;
        this.attributes.is_enhance = true;
        if ($('#create_dataset_webservice_form', this.get("selector")).valid()) {
            var data = {csrfmiddlewaretoken: csrfmiddlewaretoken};
            this.attributes.data = this.getFormParameters(data);
            var self = this;
            $.ajax({url: this.attributes.save_url, type:'POST', data: this.attributes.data, success: function(msg) {
                $(self.get("container")).trigger('create_dataset:webservice :clear');
                $(self.get("container")).trigger('datatable:refresh:create_dataset');
                $("#ajax_loading_overlay").hide();
                $('#id_create_dataset_form_overlay').data('overlay').close();
                if(self.attributes.is_enhance){
                    window.location.replace('/streams/action_insert?dataset_revision_id=' + msg.dataset_revision_id, '_blank')
                    self.attributes.is_enhance = false;
                }else{
                    jQuery.TwitterMessage( { type: 'success', message : msg.messages.join('. ') } );
                }
            }});
        }
    },
    addParameter : function(){
        if ($('#id_parameters_form', this.get("selector")).valid()) {
            var name = $.trim($('#id_param_name', this.get("selector")).val());
            var value = $.trim($('#id_param_value', this.get("selector")).val());
            var id = 'id_'+ name;
            var editable = $('#id_editable', this.get("selector")).attr('checked') == 'checked' ? true : false ;
            var param = '<span class="tag argument args" id="'+id+'" data-value="'+value+'" data-edit="'+editable+'"><span class="tagInner clearfix"><span class="tagTxt">'+ name +'</span><a href="javascript:;" rel="#'+id+'" ><span class="DN">Remove Parameter</span></a></span></span>';
            $('#id_parameters_list', this.get("selector")).append(param);

            $('#id_param_name', this.get("selector")).val('');
            $('#id_param_value', this.get("selector")).val('');
            $('#id_editable', this.get("selector")).val('false');
        }
    },
    removeParameter : function(event){
        var target = $(event.target);
        if (target.is('span')) {
            target = target.parent();
        }
        if (target.is('a')) {
            $(target.attr('rel')).remove();
        }
        return;
    }
});

var CreateDatastreamSelectDataset = CreateDatastreamManager.extend({
    initialize: function(container, selector){
        $('.itemsPerPage', this.get("selector")).hide();

        $(this.get("container")).bind('create_dataset:lib:show', _.bind(this.showForm, this));
        $(this.get("container")).bind('create_dataset:lib:hide', _.bind(this.hideForm, this));
    }
});

var OverlayDatatableDatasetManager = DatatableManager.extend({
    initialize: function(container, selector, url, delete_revision_url, delete_url, submit_url, modal_container) {
        $(this.get("container")).bind('datatable:set:search', _.bind(this.setSearch, this));
        $(this.get("container")).bind('datatable:set:categories', _.bind(this.setCategories, this));
        $(this.get("container")).bind('datatable:set:status', _.bind(this.setStatus, this));
        $(this.get("container")).bind('datatable:set:source_choice', _.bind(this.setSourceChoice, this));

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
        $(this.get("container")).bind("datatable:refresh:edit_dataset", _.bind(this.refreshTableEditDataset, this));

        $(this.get("container")).bind("datatable:set_checkboxes_state", _.bind(this.setCheckboxesState, this));

        $(this.get("container")).bind("datatable:confirm:unpublish", _.bind(this.confirmUnpublish, this));
        $(this.get("container")).bind("datatable:confirm:delete_revision", _.bind(this.confirmDeleteRevision, this));
        $(this.get("container")).bind("datatable:confirm:delete_resource", _.bind(this.confirmDeleteResource, this));

        $('table', this.get("selector")).click(_.bind(this.onClickRowButton, this));
    },
    onClickRowButton: function(event) {
        event.preventDefault();
        var $Target = $(event.target);

        if($Target.hasClass('enhance')) {
            window.location.replace('/streams/action_insert?dataset_revision_id=' + $Target.parents('tr').data('id'))
        }
    },
    setSourceChoice: function(event, type) {
        this.set({source_choice_filters: type});
    },
    getRowTemplate: function(msg) {
        var templ = "<tr id='id_dataset_<%= revision.id %>'>\
            <td></td>\
            <td class='viewInfo'><strong><%= revision.title %></strong> <span class='sep'> | </span>  <%= revision.category %></td>\
            <td> <%= revision.end_point %> </td>\
            <td> <%= revision.author %> </td>\
            <td> <%= revision.type_nice %> </td>";
            if($.inArray('ao-free-user', authManager.get("roles")) == -1){
                templ += "<td> <%= revision.status_nice %> </td>";

            }
        templ += "<td class='itemActions'>";
        if (msg.status != '2' && $.inArray('workspace.can_create_datastream', authManager.get("privileges")) != -1) {
            templ += "<button class='enhance button small'>" + gettext('APP-NEXT-TEXT') + "</button> ";
        }
        templ +="</td>\
            </tr>";
        return _.template(templ, {revision: msg});
    },
    drawRow: function(msg) {
        $('table tbody', this.get("selector")).append(this.getRowTemplate(msg));
        $('#id_dataset_' + msg.id).data("id", msg.id);
        $('#id_dataset_' + msg.id).data("description", msg.description);
        $('#id_dataset_' + msg.id).data("category", msg.category);
        $('#id_dataset_' + msg.id).data("category_id", msg.category_id);
        $('#id_dataset_' + msg.id).data("end_point", msg.end_point);
        $('#id_dataset_' + msg.id).data("title", msg.title);
        $('#id_dataset_' + msg.id).data("collect_type", msg.collect_type);
        $('#id_dataset_' + msg.id).data("size", msg.size);
    },
    getFormParameters: function(data) {
        $(this.get("container")).trigger("filter:get:categories");
        $(this.get("container")).trigger("filter:get:status");
        $(this.get("container")).trigger("filter:get:source_choice");
        $(this.get("container")).trigger("filter:get:owner");
        $(this.get("container")).trigger("search:get");
        $(this.get("container")).trigger("pagination:get:page");
        $(this.get("container")).trigger("pagination:get:items_per_page");
        $(this.get("container")).trigger("header:sort:get");

        if (this.get("category_filters") != '') {
            data.category_filters = this.get("category_filters");
        }

        data.status_filters = '0,1,3,4,6';

        if (this.get("whom") == true) {
            data.all = true;
        }
        if (this.get("whom") == false) {
            data.mine = true;
        }
        if (this.get("search") != '') {
            data.search = this.get("search");
        }

        if (this.get("source_choice_filters") != '') {
            data.source_choice_filters = this.get("source_choice_filters");
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
    }
});

var OverlayDatatableDatasetHeaderManager = DatatableHeaderManager.extend({
    defaults: {
        "column.number": 1,
        "column.ascending": false
    },
    checkboxHandler : function(){

    }
});

var DatatablePaginationManager = Backbone.Model.extend({
    initialize: function(container, selector) {
        $(this.get("container")).bind('pagination:draw', _.bind(this.drawPagination, this));        
        $(this.get("container")).bind('pagination:get:page', _.bind(this.sendPage, this));    
        $(this.get("container")).bind('pagination:get:items_per_page', _.bind(this.sendItemsPerPage, this));
        $(this.get("container")).bind('pagination:set:page', _.bind(this.setPage, this));
        
        $('.pagination-pages', this.get("selector")).click(_.bind(this.onPage, this));
        $('#pagination-previous', this.get("selector")).click(_.bind(this.onPrevious, this));
        $('#pagination-next', this.get("selector")).click(_.bind(this.onNext, this));
        $('#items_per_page_datatable', this.get("selector")).change(_.bind(this.itemsPerPage, this));
            
        this.set({page: $('.current-page', this.get("selector")).text()});
        this.updateItemsPerPage();
    },
    sendPage: function() {
        $(this.get("container")).trigger('datatable:set:page', [this.get("page")]);
    },
    setPage: function(event, page) {
        this.set({page: page});
    },
    sendItemsPerPage: function() {
        $(this.get("container")).trigger('datatable:set:items_per_page', [this.get("items_per_page")]);
    },
    itemsPerPage: function() {
        this.updateItemsPerPage();
        this.sendItemsPerPage();
        $(this.get("container")).trigger("datatable:refresh:items_per_page");
    },
    updateItemsPerPage: function() {
        this.set({items_per_page: $("select#items_per_page_datatable option:selected", this.get("selector")).val()});
    },
    getButtonTemplate: function(i) {
        var templ = '';
        if (i == 1) {
            templ = '<a href="javascript:;" class="number act" title="<%= page_number.i %>"><%= page_number.i %></a>';
        }
        else {
            templ = '<a href="javascript:;" class="number" title="<%= page_number.i %>"><%= page_number.i %></a>';
        }
        return _.template(templ, {variable: 'page_number'})({
            'i': i
        });
    },
    drawButton: function(i) {
        $('.pagination-pages', this.get("selector")).append(this.getButtonTemplate(i));
    },
    drawPagination: function(event, pages, empty) {
        $('.pagination-pages', this.get("selector")).empty();
        if (pages > 10) {
            pages = 10;
        }
        if (!empty) {
            for(var i=1; i<=pages; i++) {
                this.drawButton(i);
            }
        }
        $('#pagination-previous', this.get("selector")).hide();
        if (pages == 1) {
            $('#pagination-next', this.get("selector")).hide();
        }
        else {
            $('#pagination-next', this.get("selector")).show().css('display','inline-block');            
        }
    },
    onPage: function(event) {
        event.preventDefault();
        var $Target = $(event.target);
        if ($Target.hasClass('number')) {
            $('.act', this.get("selector")).removeClass('act');
            $Target.addClass('act');
            this.set({page: $Target.text()});       
            $(this.get("container")).trigger('datatable:refresh:pagination');     

            if (this.get("page") == '1') {
                $('#pagination-previous', this.get("selector")).hide();
            }
            else {
                if ($('#pagination-previous:hidden', this.get("selector")) != []) {
                    $('#pagination-previous', this.get("selector")).show().css('display','inline-block');
                }
            }
            if ($(this.get("selector") +'.pagination .number:last').text()) {
                $('#pagination-next', this.get("selector")).hide();
            }
            else {
                if ($('#pagination-next:hidden') != []) {
                    $('#pagination-next', this.get("selector")).show().css('display','inline-block');
                }
            }
        }
    },
    onPrevious: function(event) {     
        $('.act', this.get("selector")).removeClass('act').prev().addClass('act');
        this.set({page: parseInt(this.get('page')) - 1});
        $(this.get("container")).trigger('datatable:refresh:pagination');
        if (this.get("page") == '1') {
            $('#pagination-previous', this.get("selector")).hide();
        }
        if ($('#pagination-next:hidden', this.get("selector")) != []) {
            $('#pagination-next', this.get("selector")).show().css('display','inline-block');
        }
    },
    onNext: function(event) {     
        var $current_page = $('.act', this.get("selector")).removeClass('act').next().addClass('act');
        this.set({page: parseInt(this.get('page')) + 1});
        $(this.get("container")).trigger('datatable:refresh:pagination');
        if (this.get("page") == parseInt($('.pagination-pages .number:last', this.get("selector")).text())) {
            $('#pagination-next', this.get("selector")).hide();
        }
        if ($('#pagination-previous:hidden', this.get("selector")) != []) {
            $('#pagination-previous', this.get("selector")).show().css('display','inline-block');
        }
    }
});
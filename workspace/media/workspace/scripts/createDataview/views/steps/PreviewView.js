var PreviewView = Backbone.View.extend({

    initialize: function () {
        this.template = _.template( $('#preview_dataview_template').html() );
        this.model.fetch();
        this.listenTo(this.model.data, 'change:rows', this.render, this);
    },

    render: function () {
        var container = this.$('.table-container').get(0),
            rows = this.model.data.get('rows'),
            rowsRaw = this.model.data.get('rowsRaw');

        this.$el.html(this.template({
          rowsRaw: rowsRaw
        }));


        if (!_.isUndefined(rows)) {
            this.table = new Handsontable(container, {
              disableVisualSelection: true,
              rowHeaders: true,
              colHeaders: true,
              readOnly: true,
              readOnlyCellClassName: 'htDimmed-datal', // the regular class paints text cells grey
              allowInsertRow: false,
              allowInsertColumn: false,
              disableVisualSelection: ['current'],
              colWidths: 80,
              manualColumnResize: true,
              manualRowResize: true,
              rowHeaders: true,
              colHeaders: true,
              contextMenu: false,
              data: rows,
            });
        }
    },

    formatCell: function (cell) {
        var value;

        if (cell.fType === 'TEXT') {:
              value = (cell.fStr.length !== 1)? cell.fStr: cell.fStr.replace('-', '&nbsp;');
              value = value.replace(/(<([^>]+)>)/ig," "); // remove html tags from string
        } else if (cell.fType === 'DATE') {
            var format = cell.fDisplayFormat;
            var timestamp = cell.fNum;
            if (! _.isUndefined(format)) {
                // sometimes are seconds, sometimes miliseconds
                if (timestamp < 100000000000) {
                    timestamp = timestamp * 1000;
                }
                var locale = format.fLocale;
                //One must use "" for "en"
                if (undefined === locale || locale === "en" || locale.indexOf("en_")) {
                    locale = "";
                }
                if (locale.indexOf("es_")) {
                    locale = "es";
                }
                var datepickerLocale = $.datepicker.regional[locale];

                value = $.datepicker.formatDate(format.fPattern, new Date(timestamp), {
                    dayNamesShort: dpLocale.dayNamesShort,
                    dayNames: dpLocale.dayNames,
                    monthNamesShort: dpLocale.monthNamesShort,
                    monthNames: dpLocale.monthNames
                });
            } else {
                value = String(timestamp);
            }
        } else if (cell.fType === 'NUMBER') {
            var format = cell.fDisplayFormat,
            number = ( _.isUndefined(format) ) ? cell.fNum : $.formatNumber( cell.fNum, {format:format.fPattern, locale:format.fLocale} );
            value = String(number);
        } else if (cell.fType === 'LINK') {
            value = '<a target="_blank" href="' + cell.fUri + '" rel="nofollow" title="' + cell.fStr + '">' + cell.fStr + '</a>';
        }

        return value;
    }
});
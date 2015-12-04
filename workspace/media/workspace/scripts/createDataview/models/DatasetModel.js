var DatasetModel = Backbone.Model.extend({
    idAttribute: 'dataset_revision_id',

    url: function () {
        var args = this.get('args');
        var wargs = {};

        _.filter(args, function (arg) {
            return arg.editable;
        }).map(function (arg) {
            wargs[arg.name] = arg.value;
        });
        return ['/rest/datasets/',
                this.get('dataset_revision_id'),
                '/tables.json?',
                $.param({
                    limit: 100,
                    wargs: JSON.stringify(wargs)
                })
            ].join('');
    },

    initialize: function (attributes) {
        this.parseImplDetails(attributes.impl_details);
        this.sources = new Backbone.Collection(attributes.sources || []);
    },

    parse: function (response) {
        return {
                tables: response
            };
    },

    parseImplDetails: function (impl_details) {
        var $xml = $($.parseXML(impl_details)),
            $args = $xml.find('args > *');

        var args = _.map($args, function (arg) {
            var $node = $(arg);
            return {
                    name: arg.nodeName,
                    value: $node.text(),
                    editable: ($node.attr('editable') === 'True')
                };
        });

        this.set('args', args);
    },

    getTables: function () {
        return _.range(0, this.get('tables').length);
    },

    getArgsAsParams: function (offset) {
        var args = this.get('args'),
            offset = offset || 0;

        return _.filter(args, function (arg) {
                return arg.editable;
            }).map(function (arg, index) {
                return {
                    position: offset + index,
                    name: arg.name,
                    description: '',
                    'default': arg.value
                };
            });
    }
})
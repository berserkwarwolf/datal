# -*- coding: utf-8 -*-
import logging
from core.choices import SourceImplementationChoices

logger = logging.getLogger(__name__)


class DatasetImplBuilderWrapper:

    def __init__(self, **fields):
        if int(fields['impl_type']) == SourceImplementationChoices.REST:
            self.builder = RESTImplBuilder(**fields)
        elif int(fields['impl_type']) == SourceImplementationChoices.SOAP:
            self.builder = SOAPImplBuilder(**fields)
        else:
            self.builder = DefaultImplBuilder(**fields)

    def build(self):

        return self.builder is None and '' or self.builder.build()


class DefaultImplBuilder(object):
    required_fields = []

    def __init__(self, changed_fields=None, **fields):
        self.changed_fields = changed_fields
        self.fields = fields

    def build(self):
        return ''

    def has_changed(self, changed_fields):
        return set(changed_fields).isdisjoint(set(self.required_fields))


class RESTImplBuilder(DefaultImplBuilder):

    def __init__(self, **fields):
        super(self.__class__, self).__init__(**fields)

        self.required_fields += ['path_to_headers', 'path_to_data', 'token', 'algorithm', 'username', 'password', 'useCache', 'parameters', 'signature']


    def build(self):
        """ build for SourceImplementationChoices = 14 (REST)
        Sometimes impl_details is defined on JS. On API call it's necesary to build it
        """
        path_to_headers = self.fields.get('path_to_headers')
        path_to_data = self.fields.get('path_to_data')
        token = self.fields.get('token')
        algorithm = self.fields.get('algorithm')
        username = self.fields.get('username')
        password = self.fields.get('password')
        useCache = self.fields.get('useCache')
        parameters = self.fields.get('parameters')
        signature = self.fields.get('signature')

        impl_details = '<wsOperation useCache="%s"><pathToHeaders>%s</pathToHeaders><pathToData>%s</pathToData>' % (useCache, path_to_headers, path_to_data)

        # uriSignatures
        if token != "" or algorithm != "":
            impl_details += '<uriSignatures>'
            impl_details += '<%s>' % signature
            impl_details += '<token>%s</token>' % token
            impl_details += '<algorithm>%s</algorithm>' % algorithm
            impl_details += '</%s>' % signature
            impl_details += '</uriSignatures>'
        else:
            impl_details += '<uriSignatures/>'

        if parameters and len(parameters) > 0:
            impl_details += '<fields>'
            for argue in parameters:
                impl_details += '<%s editable="%s">%s</%s>' % (argue['param_name'], argue['editable'], argue['default_value'], argue['param_name'])
            impl_details += '</fields>'
        else:
            impl_details += "<fields/>"

        # user and pass
        if username != "" or password != "":
            impl_details += '<authentication><userName>%s</userName><password>%s</password></authentication>' % (username, password)
        else:
            impl_details += '<authentication/>'

        impl_details += '</wsOperation>'

        return impl_details


class SOAPImplBuilder(DefaultImplBuilder):

    def __init__(self, **fields):
        super(self.__class__, self).__init__(**fields)

        self.required_fields += ['method_name', 'namespace', 'useCache', 'parameters']

    def build(self):
        """ build for SourceImplementationChoices = 1 (SOAP) """

        method_name = self.fields.get('method_name')
        namespace = self.fields.get('namespace')
        useCache = self.fields.get('useCache')
        parameters = self.fields.get('parameters')

        impl_details = '<wsOperation useCache="%s">' % useCache
        impl_details += '<methodName>%s</methodName>' % method_name
        impl_details += '<targetNamespace>%s</targetNamespace>' % namespace

        if parameters and len(parameters) > 0:
            impl_details += '<fields>'
            for argue in parameters:
                impl_details += '<%s editable="%s">%s</%s>' % (argue['param_name'], argue['editable'], argue['default_value'], argue['param_name'])
            impl_details += '</fields>'
        else:
            impl_details += "<fields/>"

        impl_details += '</wsOperation>'
        return impl_details

        """ SOAP impl_details example
            <wsOperation>
                <methodName>IndicadoresResumenAnual</methodName>
                <targetNamespace>http://www.bahiablanca.gov.ar/wsMBB</targetNamespace>
                <fields>
                    <Key>xxxxxxxxxxxxxxxxxxxd</Key>
                    <IDPrograma editable="true">1</IDPrograma>
                    <IDIndicadores editable="true">1</IDIndicadores>
                    <AnioDesde editable="true">2012</AnioDesde>
                    <AnioHasta editable="true">2012</AnioHasta>
                </fields>
            </wsOperation>"""

class WebPageImplBuilder(DefaultImplBuilder):

    def __init__(self, **fields):
        super(self.__class__, self).__init__(**fields)

    def build(self):
        """ SourceImplementationChoices=0 (HTML) (#TODO since 2012 we don't use impl_details for websites (?) #TODO"""
        """ probably defined at JS, someting like this:"""
        """
        ret = "<webPage><javascript>false</javascript><xpathStructure><xpath><elementType>table</elementType>"
        ret +="<expr>//DIV[@class='itemListContent']</expr></xpath><xpath><elementType>row</elementType>"
        ret +="<expr>.//DIV[@class='li first row clearfix'] | .//DIV[@class='li even row clearfix'] | .//DIV[@class='li odd row clearfix']</expr>"
        ret +="</xpath><xpath><elementType>cell</elementType><expr>.//DIV[@class='second-column-container table-cell']</expr>"
        ret +="</xpath></xpathStructure></webPage>"
        """
        return ''
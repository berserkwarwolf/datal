# -*- coding: utf-8 -*-


class DatastreamBuilder:
    """ buid data_source and select_statement for datastreams
    Because fields needed (dataset_revision_id & table_id) for buit are not present on datastream data this class
    will be used outside datastream class """

    args={}

    def __init__(self, **kwargs):
        self.args = kwargs

    def build_select_statement(self):
        return '<selectStatement><Select><Column>*</Column></Select><From><Table>%s</Table></From><Where/></selectStatement>' % self.args.get('table_id', 'table0')


    def build_data_source(self):
        dataset_revision_id=self.args.get('dataset_revision_id')
        table_id=self.args.get('table_id', 'table0')

        import urllib
        from bs4 import BeautifulSoup
        from core.helpers import get_domain_with_protocol

        params = urllib.urlencode({'pId': dataset_revision_id, 'pLimit': 50})

        url = get_domain_with_protocol('engine') + '/AgileOfficeServer/DataSourceLoaderServlet?' + params
        response_body = urllib.urlopen(url).read()

        soup = BeautifulSoup(response_body)
        table = soup.find(attrs={'tableid': table_id})
        try:
            number_of_columns = len(table.findAll('tr')[0].findAll())
        except:
            import logging
            logger = logging.getLogger(__name__)
            logger.error("get_impl_details ERROR --> %s" % response_body)
            raise

        impl_details_xml = '<dataSource><DataStructure><Field id="%s"><type></type><format><languaje></languaje><country></country><style></style></format><Table>' % table_id
        for i in range(number_of_columns):
            impl_details_xml = impl_details_xml + '<Field id="column%d"><alias></alias><type></type><format><languaje></languaje><country></country><style></style></format></Field>' % i
        impl_details_xml = impl_details_xml + '</Table></Field></DataStructure></dataSource>'
        return impl_details_xml


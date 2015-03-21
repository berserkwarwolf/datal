import requests
from django.conf import settings
from junar.api.exceptions import BigDataInsertError, BigDataInvalidQuery, BigDataDeleteError

class Bigdata:
    lastError = ""
    def insert(self, body, namespace='', context='', mimetype="text/turtle", create_if_not_exists = False):
        """
        put and RDF file (body) in the bigData server
        context-uri defines the QUAD and represents a junar dataset (by domain+GUID)
        firs delete if exists [TODO]
        """

        r = self.delete_context(namespace=namespace, context=context)
        if not r:
            raise BigDataDeleteError(namespace, context, self.lastError)

        url = "%s:%s%s/namespace/%s/sparql?context-uri=%s" % (settings.BIGDATA_HOSTS[0], settings.BIGDATA_PORT, settings.BIGDATA_API_ENDPOINT, namespace, context)
        headers = {'Content-Type': mimetype}
        r = requests.post(url, headers=headers, data=body.encode("utf-8"))
        bigdata_response = r.text
        if r.status_code == requests.codes.OK:
            self.lastError = ""
            return bigdata_response
        else:
            # try to detect some common errors
            if bigdata_response.find("java.lang.RuntimeException: Not found: namespace" ) >= 0:
                if create_if_not_exists:
                    try:
                        res = self.create_namespace(namespace, context)
                        if res: # try it again on the created namespace
                            self.insert(body, namespace, context, mimetype, create_if_not_exists=False)
                    except Exception, e:
                        raise BigDataInsertError(namespace, context, "Creating namespace failed: %s" % str(e) )
                else:
                    raise BigDataInsertError(namespace, context, "Namespace doesn't exists'" )

            self.lastError = "Failed insert"
            return bigdata_response # the error detail

    # JP-17/04/2014 Try to call arguments just simply select, from and where
    # in views.py I know the context and de namespace from the account and GUID but here I need these parameters
    def query(self, pselect, pfrom, pwhere, namespace, context="", output="json", limit=0, xhtml=False, analytic=True, explain=False):
        """ do a sparql query to the bigdata servers"""

        url = "%s:%s%s/namespace/%s/sparql?" % (settings.BIGDATA_HOSTS[0], settings.BIGDATA_PORT, settings.BIGDATA_API_ENDPOINT, namespace)

        """
        if context != "":
            # url = url + "?context-uri=%s&" % context
            url = url + "?named-graph-uri=%s&" % context
        else:
            url = url + "?"
        """

        query = pselect + " " + pfrom

        if context:
            fn = " FROM <%s> " % context
            query = query + fn

        query = query + " " + pwhere
        if limit > 0:
            query = query + " LIMIT " + str(limit)

        # check if the query is secure
        if self.check_secure(query) == False:
            raise BigDataInvalidQuery("Just SELECT allowed")

        url = url + "query=" + query # IF I PUT THIS on params DOESN'T WORK (?) TODO
        params = {namespace: namespace, xhtml: xhtml, analytic: analytic, explain: explain}
        if not output:
            output = "json"
        if output == "debug" or output == "xml":
            content_requested = "application/sparql-results+xml"
        if output == "json":
            content_requested = "application/sparql-results+json"
        if output == "table":
            content_requested = "application/x-binary-rdf-results-table"
        if output == "csv":
            content_requested = "text/csv"
        if output == "tsv":
            content_requested = "text/tab-separated-values"
        headers_post = {"Accept": content_requested} # , "Content-Type": "?"}
        r = requests.post(url, data=params, headers=headers_post) # for POST use "data"

        import cgi
        if r.status_code == requests.codes.OK:
            if output == "debug": #our internal data
                ret = r"QUERY RDF OK URL:[%s] NS:[%s] CTX:[%s] <hr>%s<hr> [%s]<hr>T1 <pre>[%s]</pre><hr>T2 [%s]" % (url, namespace, context, query, r.headers, cgi.escape(r.text), r.text)
            else:
                ret = r.text

            self.lastError = ""
            return ret
        else:
            self.lastError = "Error query URL:[%s] NS:[%s]<hr>%s<hr> [%s] sparql query <hr>%s<hr>%s<hr>%s" % (url, namespace, query, r.status_code, url, r.headers, r.text.replace('\n','<br />'))
            return False

    def delete_context(self, namespace, context):
        """delete a junar dataset. Identified by the context (client domain + GUID)"""
        url = "%s:%s%s/namespace/%s/sparql" % (settings.BIGDATA_HOSTS[0], settings.BIGDATA_PORT, settings.BIGDATA_API_ENDPOINT, namespace)
        r = requests.delete(url, params={'c': "<" + context + ">"})
        if r.status_code == requests.codes.OK:
            self.lastError = "OK Deleted context [%s][%s] (%s)" % (namespace, context, r.text)
            return True
        elif r.text.find("Not found: namespace=%s" % namespace) > -1:
            self.lastError = "Not exists Namespace [%s] (?) (%s)" % (namespace, r.text)
            return True
        else:
            # try to detect some common errors
            error_text_raise = "ERROR DELETING Context [%s, %s] AT %s. -- %s" % (context, namespace, url, r.text)
            self.lastError = error_text_raise
            return False

    def delete_namespace(self, namespace):
        """delete a namespace"""
        url = "%s:%s%s/namespace/%s" % (settings.BIGDATA_HOSTS[0], settings.BIGDATA_PORT, settings.BIGDATA_API_ENDPOINT, namespace)

        r = requests.delete(url)
        if r.status_code == requests.codes.OK:
            self.lastError = "OK Deleted Namespace [%s] (%s)" % (namespace, r.text)
            return True
        elif r.text.find("Not found: namespace=%s" % namespace) > -1:
            self.lastError = "Namespace not exists [%s] (%s)" % (namespace, r.text)
            return True
        elif r.text == "":
            self.lastError = "Maybe now it's empty (?) [%s] (%s)" % (namespace, r.text)
            return True

        else:
            # try to detect some common errors
            error_text_raise = "ERROR DELETING Namespace [%s] AT %s. -- %s" % (namespace, url, r.text)
            self.lastError = error_text_raise
            return False

    def create_namespace(self, namespace, for_quads=False):
        """
        Creates a new namespace
        More at: http://wiki.bigdata.com/wiki/index.php/NanoSparqlServer#CREATE_DATA_SET
        """
        # DEFINE THE RIGHT PROPERTIES FOR THIS NAMESPACE BASED ON SOMETIHING (quads or not quads, that the question)
        # You'll need a POST to BIGDATA/namespace with a XML configuration file
        xml_cfg = """<?xml version="1.0" encoding="UTF-8" standalone="no"?>
        <!DOCTYPE properties SYSTEM "http://java.sun.com/dtd/properties.dtd">
            <properties>
                <entry key="com.bigdata.rdf.sail.namespace">%s</entry>

                <!-- PROPERTIES FOR QUADs-->
                <!-- Specify any KB specific properties here to override defaults for the BigdataSail -->
                <!-- AbstractTripleStore, or indices in the namespace of the new KB instance. -->
                <!-- <entry key="com.bigdata.rdf.store.AbstractTripleStore.quads">true</entry> -->

                <!-- PROPERTIES FOR Triples + Inference + Truth Maintenance -->
                <!-- Specify any KB specific properties here to override defaults for the BigdataSail -->
                <!-- AbstractTripleStore, or indices in the namespace of the new KB instance. -->
                <entry key="com.bigdata.rdf.store.AbstractTripleStore.quads">false</entry>
                <entry key="com.bigdata.rdf.store.AbstractTripleStore.axiomsClass">com.bigdata.rdf.axioms.OwlAxioms</entry>
                <entry key="com.bigdata.rdf.sail.truthMaintenance">true</entry>

            </properties>
        """ % namespace

        xml_cfg_quads = """<?xml version="1.0" encoding="UTF-8" standalone="no"?>
            <!DOCTYPE properties SYSTEM "http://java.sun.com/dtd/properties.dtd">
            <properties>
            <entry key="com.bigdata.rdf.sail.namespace">%s</entry>
            <!-- -->
            <!-- Specify any KB specific properties here to override defaults for the BigdataSail -->
            <!-- AbstractTripleStore, or indices in the namespace of the new KB instance. -->
            <!-- -->
            <entry key="com.bigdata.rdf.store.AbstractTripleStore.quads">true</entry>
            </properties>""" % namespace

        url = "%s:%s%s/namespace" % (settings.BIGDATA_HOSTS[0], settings.BIGDATA_PORT, settings.BIGDATA_API_ENDPOINT)
        headers = {'Content-Type': 'application/xml'}
        if for_quads:
            r = requests.post(url, headers=headers, data=xml_cfg_quads.encode("utf-8"))
        else:
            r = requests.post(url, headers=headers, data=xml_cfg.encode("utf-8"))

        if r.status_code == requests.codes.OK:
            self.lastError = "Created Namespace %s (%s)" % (namespace, r.text)
            return True
        elif r.text.find("EXISTS: %s" % namespace) > -1:
            self.lastError = "Namespace %s already exists (%s)" % (namespace, r.text)
            return True
        else:
            # try to detect some common errors
            error_text_raise = "ERROR CREATING NAMESPACE [%s] AT %s. -- %s" % (namespace, url, r.text)
            self.lastError = error_text_raise
            raise BigDataInsertError(error_text_raise)


    def check_secure(self, query):
        """check if the query is secure. Just allow 'selects' """
        bad_expressions = ["CONSTRUCT", "DESCRIBE", "INSERT", "DELETE", "UPDATE"]
        for expr in bad_expressions:
            if query.find(expr) > -1:
                return False
        return True

    def list_namespaces(self):
        """list all existent NAMESPACEs"""


    def list_contexts(self, namespace):
        """list al CONTEXTs on this namespace"""

    def check_namespace(self, namespace):
        """ test if exists """
        r = self.query("select * {?s ?p ?o} LIMIT 1", namespace)
        if r:
            self.lastError = r
            r = True
        return r

    def check_context(self, namespace, context):
        """ test if exists. I buid the context by is GUID """
        r = self.query("select * FROM NAMED <%s> {?s ?p ?o} LIMIT 1" % context, namespace)
        if r:
            self.lastError = r
        else:
            r = self.lastError;
        return r

    def namespace_propierties(self):
        """ get propierties """
        # /bigdata/namespace/NS/properties returns an XML



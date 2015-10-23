from django.template import Context, Template
import json
import datetime

class DataStreamOutputBigDataTemplate(Template):

    def __init__(self, template):
        # add my filters
        template = "%s\n%s\n" % ("{% load mint_tags %}", template)
        super(DataStreamOutputBigDataTemplate, self).__init__(template)

    def render(self, contents, request):

        rows = []
        result = json.loads(contents)
        if result['fType']=='ARRAY':
            array = result['fArray']
            index = 0
            for row_number in range(0, result['fRows']):
                row  = {}
                header = False
                for column_number in range(0, result['fCols']):
                    # take the string value, date or number and just send that
                    dat = array[index]
                    if dat["fType"] == "TEXT":
                        val = dat["fStr"]
                    if dat["fType"] == "NUMBER":
                        val = dat["fNum"]
                    if dat["fType"] == "DATE":
                        try:
                            #return a datetime object
                            val = datetime.datetime.utcfromtimestamp(dat["fNum"] / 1000)
                        except Exception,e:
                            # val = str(dat["fNum"]) + " ERR " + str(e)
                            raise

                    header = dat.get("fHeader", False)

                    row['column%s' % column_number] = val
                    # row['data%s' % column_number] = dat # add extra data in case we need it.
                    index = index + 1

                if not header: # Remove or check if header
                    rows.append(row)


        # define extra values required
        owner = request.owner
        publisher = request.publisher
        author = request.author
        # JP-17/04/2014 We must define default values for owner, publisher and author that make sense (why /junar.com/cities instead of just simply junar.com/tim os something more generic?)
        # or raise a new Exception called TemplateMissingArgumentsError.
        # retrieve key values using request.GET[key]
        # Pass the KeyError exception as an argument to the constructor.

        try:
            res = super(DataStreamOutputBigDataTemplate, self).render(Context({"rows": rows, "owner": owner, "publisher": publisher, "author" : author}))
        except Exception, e:
            self.render_errors = str(e)
            res = False

        return res

class MintTemplateResponse(Template):

    def __init__(self, template="{% include 'mint_response.html' %}"):
        super(MintTemplateResponse, self).__init__(template)

    def render(self, rdf, template, errors, result, fail_type):
        return super(MintTemplateResponse, self).render(Context({"rdf": rdf, "template": template, "errors": errors, "result": result, "fail_type": fail_type}))


class DefaultCoreError(Template):

    def __init__(self, template="core_errors/core_error.html"):
        tmpl = "{%% include '%s' %%}" % template
        super(DefaultCoreError, self).__init__(tmpl)

    def render(self, title, description, request, extras={}):
        context = {"error_title": title, "error_description": description, "extras": json.dumps(extras), "auth_manager": request.auth_manager}
        ctx = Context(context)
        return super(DefaultCoreError, self).render(ctx)

class DefaultAnswer(Template):
    """ 
    respuesta predeterminada con status (bool) + messages (list)
    puede usar campos extras
    """
    
    def __init__(self, template="defaul_answer.json"):
        tmpl = "{%% include '%s' %%}" % template
        super(DefaultAnswer, self).__init__(tmpl)

    def render(self, status=True, messages=[], extras=[]):
        data = {"status": status, "messages": messages, "extras": extras}
        context = {"data": data}
        ctx = Context(context)
        return super(DefaultAnswer, self).render(ctx)
    
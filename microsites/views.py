from django.core.urlresolvers import reverse
from django.http import HttpResponseRedirect, Http404, HttpResponse
from django.http import Http404
from django.template import TemplateDoesNotExist
from django.views.generic import TemplateView

from core.models import *
from core.daos.datastreams import DataStreamDBDAO
from core.choices import StatusChoices
from core.http import get_domain_by_request
from core.shortcuts import render_to_response

import re
import json
import logging


def custom_pages(request, page):
    try:
        preferences = request.account.get_preferences()
        url = preferences['account_url']
        cv = CustomView.as_view(template_name="custom/{0}/{1}.html".format(url, page), extra_content=locals())
        return cv(request)
    except TemplateDoesNotExist:
        raise Http404()


def action_css(request, id):
    http_referer = request.META.get('HTTP_REFERER')
    key = get_key(http_referer)
    try:
        css = Preference.objects.get_value_by_account_id_and_key(id, '%s.css' % key)
    except Preference.DoesNotExist:
        css = ''
    return HttpResponse(css, content_type='text/css')


def action_js(request, id):
    http_referer = request.META.get('HTTP_REFERER')
    key = get_key(http_referer)
    try:
        javascript = Preference.objects.get_value_by_account_id_and_key(id, '%s.javascript' % key)
    except Preference.DoesNotExist:
        javascript = ''
    return HttpResponse(javascript, content_type='text/javascript')


def get_key(http_referer):

    if not http_referer:
        raise Http404

    if re.search('^.*dashboards/\d+/[A-Za-z0-9\-]+/.*$' , http_referer):
        key = 'db.detail'
    elif re.search('^.*datastreams/\d+/[A-Za-z0-9\-]+/.*$' , http_referer):
        key = 'ds.detail'
    elif re.search('^.*/datastreams/embed/[A-Z0-9\-]+.*$' , http_referer):
        key = 'ds.embed'
    elif re.search('^.*/search/.*$' , http_referer):
        key = 'search'
    elif re.search('^.*/visualizations/embed/[A-Z0-9\-]+.*$' , http_referer):
        key = 'chart.embed'
    elif re.search('^.*visualizations/\d+/[A-Za-z0-9\-]+/.*$' , http_referer):
        key = 'chart.detail'
    elif re.search('^.*/home' , http_referer):
        key = 'home'
    elif re.search('^.*/developers' , http_referer):
        key = 'developers'
    else:
        raise Http404

    return key + '.full'


def action_new_css(request, id):
    try:
        account = request.account
        preferences = account.get_preferences()
        keys = ['account.title.color', 'account.button.bg.color'
                , 'account.button.border.color', 'account.button.font.color'
                , 'account.mouseover.bg.color', 'account.mouseover.border.color'
                , 'account.mouseover.title.color', 'account.mouseover.text.color']
        keys_copy = list(keys)
        preferences.load(keys)

        for key in keys_copy:
            if preferences[key.replace('.', '_')]:
                return render_to_response('css_branding/branding.css', locals(), mimetype = 'text/css')

        # Joaco!, remove when the branding migration ...
        default_chart_css = '.chartBox .chartTitle a:hover{background:#ccc !important;} .chartBox .chartTitle a:hover{border-color:#999 !important;} .chartBox .chartTitle a:hover{color:#fff !important;}'
        return HttpResponse(default_chart_css, content_type='text/css')
    except AttributeError:
        return HttpResponse('', content_type='text/css')


def action_is_live(request):
    callback = request.GET.get('callback')
    response = '%s(true)' % callback
    return HttpResponse(response, content_type='text/javascript')


def action_catalog_xml(request):
    logger = logging.getLogger(__name__)

    account_id = request.account.id
    language = request.auth_manager.language
    preferences = request.preferences

    domain = get_domain_by_request(request)
    api_domain = preferences['account_api_domain']
    transparency_domain = preferences['account_api_transparency']
    developers_link = 'http://' + domain + reverse('developer_manager.action_query')
    datastreams_revision_ids = DataStreamRevision.objects.values_list('id').filter(
        datastream__user__account_id=account_id, status=StatusChoices.PUBLISHED
    )
    resources = []
    for datastream_revision_id, in datastreams_revision_ids:
        try:
            ds = DataStreamDBDAO().get(language, datastream_revision_id=datastream_revision_id)
        except:
            logger.error('catalog ERROR %s %s' % (datastream_revision_id, language))
            continue

        ds.link = 'http://{}{}'.format(domain, ds.permalink())
        ds.export_csv_link = 'http://{}{}'.format(
            domain,
            reverse('datastream_manager.action_csv', kwargs={'id': ds.datastream_id, 'slug': ds.slug})
        )
        ds.export_html_link = 'http://{}{}'.format(
            domain,
            reverse('datastream_manager.action_html', kwargs={'id': ds.datastream_id, 'slug': ds.slug})
        )
        ds.api_link = 'http://' + api_domain + '/dataviews/invoke/' + ds.guid + '?auth_key=your_authkey'

        ds.visualizations = []
        visualization_revision_ids = VisualizationRevision.objects.values_list('id').filter(
            visualization__datastream_id=ds.datastream_id,
            status=StatusChoices.PUBLISHED
        )
        for visualization_revision_id, in visualization_revision_ids:
            try:
                vz = VZ(visualization_revision_id, language)
            except:
                logger.error('catalog VIZ ERROR %s %s' % (visualization_revision_id, language))
                continue
            vz.link = 'http://' + domain + vz.permalink()
            ds.visualizations.append(vz)
        resources.append(ds)

    return render_to_response('catalog.xml', locals(), mimetype='application/xml')


class CustomView(TemplateView):

    extra_content = {}

    def get_context_data(self, **kwargs):
        context = super(DispView, self).get_context_data(**kwargs)
        context.update(self.extra_content)
        return context

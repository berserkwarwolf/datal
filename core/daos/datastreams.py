# -*- coding: utf-8 -*-
import operator
import time
import logging
import json

from django.db.models import Q, F, Count
from django.db import IntegrityError
from django.core.serializers.json import DjangoJSONEncoder
from django.db import connection


from datetime import datetime, timedelta, date

from core.utils import slugify
from core.cache import Cache
from core.daos.resource import AbstractDataStreamDBDAO
from core import settings
from core.exceptions import SearchIndexNotFoundException, DataStreamNotFoundException
from core.choices import STATUS_CHOICES
from core.models import DatastreamI18n, DataStream, DataStreamRevision, Category, VisualizationRevision, DataStreamHits
from core.lib.searchify import SearchifyIndex
from core.lib.elastic import ElasticsearchIndex


class DataStreamDBDAO(AbstractDataStreamDBDAO):
    """ class for manage access to datastreams' database tables """
    def __init__(self):
        pass

    def create(self, datastream=None, user=None, **fields):
        """create a new datastream if needed and a datastream_revision"""

        if datastream is None:
            # Create a new datastream (TITLE is for automatic GUID creation)
            datastream = DataStream.objects.create(user=user, title=fields['title'])

        if isinstance(fields['category'], int):
            fields['category'] = Category.objects.get(id=fields['category'])

        datastream_revision = DataStreamRevision.objects.create(
            datastream=datastream,
            user=user,
            dataset=fields['dataset'],
            status=fields['status'],
            category=fields['category'],
            data_source=fields['data_source'],
            select_statement=fields['select_statement']
        )

        DatastreamI18n.objects.create(
            datastream_revision=datastream_revision,
            language=fields['language'],
            title=fields['title'].strip().replace('\n', ' '),
            description=fields['description'].strip().replace('\n', ' '),
            notes=fields['notes'].strip()
        )

        datastream_revision.add_tags(fields['tags'])
        datastream_revision.add_sources(fields['sources'])
        datastream_revision.add_parameters(fields['parameters'])

        return datastream, datastream_revision

    def update(self, datastream_revision, changed_fields, **fields):
        fields['title'] = fields['title'].strip().replace('\n', ' ')
        fields['description'] = fields['description'].strip().replace('\n', ' ')
        fields['notes'] = fields['notes'].strip()

        datastream_revision.update(changed_fields, **fields)

        DatastreamI18n.objects.get(datastream_revision=datastream_revision, language=fields['language']).update(
            changed_fields,
            **fields
        )

        if 'tags' in fields:
            datastream_revision.add_tags(fields['tags'])
        if 'sources' in fields:
            datastream_revision.add_sources(fields['sources'])

        return datastream_revision

    def get(self, language, datastream_id=None, datastream_revision_id=None, guid=None, published=True):
        """ Get full data """
        fld_revision_to_get = 'datastream__last_published_revision' if published else 'datastream__last_revision'

        if guid:
            datastream_revision = DataStreamRevision.objects.select_related().get(
                datastream__guid=guid,
                pk=F(fld_revision_to_get),
                category__categoryi18n__language=language,
                datastreami18n__language=language
            )
        elif not datastream_id:
            datastream_revision = DataStreamRevision.objects.select_related().get(
                pk=datastream_revision_id,
                category__categoryi18n__language=language,
                datastreami18n__language=language
            )
        else:
            datastream_revision = DataStreamRevision.objects.select_related().get(
                pk=F(fld_revision_to_get),
                category__categoryi18n__language=language,
                datastreami18n__language=language
            )

        tags = datastream_revision.tagdatastream_set.all().values('tag__name', 'tag__status', 'tag__id')
        sources = datastream_revision.sourcedatastream_set.all().values('source__name', 'source__url', 'source__id')
        #parameters = datastream_revision.datastreamparameter_set.all().values('name', 'value') # TODO: Reveer
        parameters = []

        # Get category name
        category = datastream_revision.category.categoryi18n_set.get(language=language)
        datastreami18n = DatastreamI18n.objects.get(datastream_revision=datastream_revision, language=language)
        dataset_revision = datastream_revision.dataset.last_revision

        # Muestro el link del micrositio solo si esta publicada la revision
        public_url = ''
        if datastream_revision.datastream.last_published_revision:
            domain = datastream_revision.user.account.get_preference('account.domain')
            if not domain.startswith('http'):
                domain = 'http://' + domain
            public_url = '{}/dataviews/{}/{}'.format(domain, datastream_revision.datastream.id, slugify(datastreami18n.title))

        datastream = dict(
            datastream_id=datastream_revision.datastream.id,
            datastream_revision_id=datastream_revision.id,
            dataset_id=datastream_revision.dataset.id,
            user_id=datastream_revision.user.id,
            author=datastream_revision.user.nick,
            account_id=datastream_revision.user.account.id,
            category_id=datastream_revision.category.id,
            category_name=category.name,
            end_point=dataset_revision.end_point,
            filename=dataset_revision.filename,
            collect_type=dataset_revision.impl_type,
            impl_type=dataset_revision.impl_type,
            status=datastream_revision.status,
            modified_at=datastream_revision.modified_at,
            meta_text=datastream_revision.meta_text,
            guid=datastream_revision.datastream.guid,
            created_at=datastream_revision.dataset.created_at,
            last_revision_id=datastream_revision.dataset.last_revision_id,
            last_published_date=datastream_revision.datastream.last_published_revision_date,
            title=datastreami18n.title,
            description=datastreami18n.description,
            notes=datastreami18n.notes,
            tags=tags,
            sources=sources,
            parameters=parameters,
            public_url=public_url,
            slug= slugify(datastreami18n.title),
        )

        return datastream

    def query(self, account_id=None, language=None, page=0, itemsxpage=settings.PAGINATION_RESULTS_PER_PAGE,
          sort_by='-id', filters_dict=None, filter_name=None, exclude=None):
        """ Consulta y filtra los datastreams por diversos campos """

        query = DataStreamRevision.objects.filter(
            id=F('datastream__last_revision'),
            datastream__user__account=account_id,
            datastreami18n__language=language,
            category__categoryi18n__language=language
        )

        if exclude:
            query.exclude(**exclude)

        if filter_name:
            query = query.filter(datastreami18n__title__icontains=filter_name)

        if filters_dict:
            predicates = []
            for filter_class, filter_value in filters_dict.iteritems():
                if filter_value:
                    predicates.append((filter_class + '__in', filter_value))
            q_list = [Q(x) for x in predicates]
            if predicates:
                query = query.filter(reduce(operator.and_, q_list))

        total_resources = query.count()
        query = query.values(
            'datastream__user__nick',
            'status',
            'id',
            'datastream__guid',
            'category__id',
            'datastream__id',
            'category__categoryi18n__name',
            'datastreami18n__title',
            'datastreami18n__description',
            'created_at',
            'datastream__user__id',
            'datastream__last_revision_id',
            'dataset__last_revision__dataseti18n__title',
            'dataset__last_revision__impl_type',
            'dataset__last_revision__id'
        )

        query = query.order_by(sort_by)

        # Limit the size.
        nfrom = page * itemsxpage
        nto = nfrom + itemsxpage
        query = query[nfrom:nto]

        return query, total_resources

    def query_filters(self, account_id=None, language=None):
        """
        Reads available filters from a resource array. Returns an array with objects and their
        i18n names when available.
        """
        query = DataStreamRevision.objects.filter(
                                                id=F('datastream__last_revision'),
                                                dataset__user__account=account_id,
                                                datastreami18n__language=language,
                                                category__categoryi18n__language=language)

        query = query.values('datastream__user__nick', 'status',
                             'category__categoryi18n__name')

        filters = set([])

        for res in query:
            status = res.get('status')

            filters.add(('status', status,
                unicode(STATUS_CHOICES[status])
                ))
            if 'category__categoryi18n__name' in res:
                filters.add(('category', res.get('category__categoryi18n__name'),
                    res.get('category__categoryi18n__name')))
            if res.get('datastream__user__nick'):
                filters.add(('author', res.get('datastream__user__nick'),
                    res.get('datastream__user__nick')))

        return [{'type':k, 'value':v, 'title':title} for k,v,title in filters]

    def query_childs(self, datastream_id, language):
        """ Devuelve la jerarquia completa para medir el impacto """

        related = dict()
        related['visualizations'] = VisualizationRevision.objects.select_related().filter(
            visualization__datastream__id=datastream_id,
            visualizationi18n__language=language
        ).values('status', 'id', 'visualizationi18n__title', 'visualizationi18n__description',
                 'visualization__user__nick', 'created_at', 'visualization__last_revision')
        return related


class DatastreamSearchDAOFactory():
    """ select Search engine"""

    def __init__(self):
        pass

    def create(self, datastream_revision):
        if settings.USE_SEARCHINDEX == 'searchify':
            self.search_dao = DatastreamSearchifyDAO(datastream_revision)
        elif settings.USE_SEARCHINDEX == 'elasticsearch':
            self.search_dao = DatastreamElasticsearchDAO(datastream_revision)
        elif settings.USE_SEARCHINDEX == 'test':
            self.search_dao = DatastreamSearchDAO(datastream_revision)
        else:
            raise SearchIndexNotFoundException()

        return self.search_dao

        
class DatastreamSearchDAO():
    """ class for manage access to datastream index"""

    TYPE="ds"
    def __init__(self, datastream_revision):
        self.datastream_revision=datastream_revision
        self.search_index = SearchifyIndex()

    def _get_type(self):
        return self.TYPE
    def _get_id(self):
        """ Get Tags """
        return "%s::%s" %(self.TYPE.upper(),self.datastream_revision.datastream.guid)

    def _get_tags(self):
        """ Get Tags """
        return self.datastream_revision.tagdatastream_set.all().values_list('tag__name', flat=True)

    def _get_category(self):
        """ Get category name """
        return self.datastream_revision.category.categoryi18n_set.all()[0]

    def _get_i18n(self):
        """ Get category name """
        return DatastreamI18n.objects.get(datastream_revision=self.datastream_revision)
        
    def _build_document(self):

        tags = self._get_tags()

        category = self._get_category()
        datastreami18n = self._get_i18n()

        text = [datastreami18n.title, datastreami18n.description, self.datastream_revision.user.nick, self.datastream_revision.datastream.guid]
        text.extend(tags) # datastream has a table for tags but seems unused. I define get_tags funcion for dataset.
        text = ' '.join(text)

        document = {
                'docid' : self._get_id(),
                'fields' :
                    {'type' : self.TYPE,
                     'datastream_id': self.datastream_revision.datastream.id,
                     'datastream__revision_id': self.datastream_revision.id,
                     'title': datastreami18n.title,
                     'text': text,
                     'description': datastreami18n.description,
                     'owner_nick' :self.datastream_revision.user.nick,
                     'tags' : ','.join(tags),
                     'account_id' : self.datastream_revision.user.account.id,
                     'parameters': "",
                     'timestamp': int(time.mktime(self.datastream_revision.created_at.timetuple())),
                     'hits': 0,
                     'end_point': self.datastream_revision.dataset.last_published_revision.end_point,
                    },
                'categories': {'id': unicode(category.category_id), 'name': category.name}
                }

        return document


class DatastreamSearchifyDAO(DatastreamSearchDAO):
    """ class for manage access to datastreams searchify documents """
    def __init__(self, datastream_revision):
        self.datastream_revision=datastream_revision
        self.search_index = SearchifyIndex()
        
    def add(self):
        self.search_index.indexit(self._build_document())
        
    def remove(self, datastream_revision):
        self.search_index.delete_documents([self._get_id()])


class DatastreamElasticsearchDAO(DatastreamSearchDAO):
    """ class for manage access to datastreams elasticsearch documents """

    def __init__(self, datastream_revision):
        self.datastream_revision=datastream_revision
        self.search_index = ElasticsearchIndex()
        
    def add(self):
        output=self.search_index.indexit(self._build_document())

        return (self.datastream_revision.id, self.datastream_revision.datastream.id, output)
        
    def remove(self):
        return self.search_index.delete_documents([{"type": self._get_type(), "docid": self._get_id()}])


class DatastreamHitsDAO():
    """class for manage access to Hits in DB and index"""

    doc_type = "ds"
    from_cache = False

    # cache ttl, 1 hora
    TTL=3600 

    def __init__(self, datastream):
        self.datastream = datastream
        #self.datastream_revision = datastream.last_published_revision
        self.search_index = ElasticsearchIndex()
        self.logger=logging.getLogger(__name__)
        self.cache=Cache()

    def add(self,  channel_type):
        """agrega un hit al datastream. """

        # TODO: Fix temporal por el paso de DT a DAO.
        # Es problema es que por momentos el datastream viene de un queryset y otras veces de un DAO y son objetos
        # distintos
        try:
            datastream_id = self.datastream.datastream_id
        except:
            datastream_id = self.datastream['datastream_id']

        try:
            guid = self.datastream.guid
        except:
            guid = self.datastream['guid']

        try:
            hit=DataStreamHits.objects.create(datastream_id=datastream_id, channel_type=channel_type)
        except IntegrityError:
            # esta correcto esta excepcion?
            raise DataStreamNotFoundException()

        self.logger.info("DatastreamHitsDAO hit! (guid: %s)" % ( guid))

        # armo el documento para actualizar el index.
        doc={'docid':"DS::%s" % guid,
                "type": "ds",
                "script": "ctx._source.fields.hits+=1"}

        return self.search_index.update(doc)

    def count(self):
        return DataStreamHits.objects.filter(datastream_id=self.datastream['datastream_id']).count()

    def _get_cache(self, cache_key):

        cache=self.cache.get(cache_key)

        return cache

    def _set_cache(self, cache_key, value):

        return self.cache.set(cache_key, value, self.TTL)

    def count_by_days(self, day=30, channel_type=None):
        """trae un dict con los hits totales de los ultimos day y los hits particulares de los días desde day hasta today"""

        # no sé si es necesario esto
        if day < 1:
            return {}

        cache_key="%s_hits_%s_%s" % ( self.doc_type, self.datastream.guid, day)

        if channel_type:
            cache_key+="_channel_type_%s" % channel_type

        hits = self._get_cache(cache_key)

        # me cachendié! no esta en la cache
        if not hits :
            # tenemos la fecha de inicio
            start_date=datetime.today()-timedelta(days=day)

            # tomamos solo la parte date
            truncate_date = connection.ops.date_trunc_sql('day', 'created_at')

            qs=DataStreamHits.objects.filter(datastream=self.datastream,created_at__gte=start_date)

            if channel_type:
                qs=qs.filter(channel_type=channel_type)

            hits=qs.extra(select={'_date': truncate_date, "fecha": 'DATE(created_at)'}).values("fecha").order_by("created_at").annotate(hits=Count("created_at"))

            control=[ date.today()-timedelta(days=x) for x in range(day-1,0,-1)]
            control.append(date.today())
            
            for i in hits:
                try:
                    control.remove(i['fecha'])
                except ValueError:
                    pass

            hits=list(hits)
                
            for i in control:
                hits.append({"fecha": i, "hits": 0})

            hits = sorted(hits, key=lambda k: k['fecha']) 

            # transformamos las fechas en isoformat
            hits=map(self._date_isoformat, hits)

            # lo dejamos, amablemente, en la cache!
            self._set_cache(cache_key, json.dumps(hits, cls=DjangoJSONEncoder))

            self.from_cache=False
        else:
            hits=json.loads(hits)
            self.from_cache = True

        return hits

    def _date_isoformat(self, row):
        row['fecha']=row['fecha'].isoformat()
        return row

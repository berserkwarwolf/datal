from junar.core.models import * #Preference, Setting
from django.http import HttpResponse
from django.db import transaction
# from junar.core.models import Application
from junar.api.decorators import public_keys_forbidden

import logging, json

@public_keys_forbidden
@transaction.commit_on_success
def action_create_transparency_categories(request):
    """ create multiple categories (for transparency) by setting definition """
    logger = logging.getLogger(__name__)

    account_id = request.account_id
    account = Account.objects.get(pk=account_id)
    preferences = account.get_preferences()

    # check if already created
    try:
        created_categories = preferences['account.transparency.createdcategories']
    except:
        created_categories = ""

    if created_categories != "" and created_categories != "0":
        response = {'status': 'Failed', 'messages': "Categories already created"}
        return HttpResponse(json.dumps(response), content_type='application/json')
    else:
        # check if "force" is set
        force_creation = request.GET.get("force", "0")
        if force_creation == "0":
            # no create
            response = {'status': 'Failed', 'messages': "Transparency category country is not defined"}
            return HttpResponse(json.dumps(response), content_type='application/json')

    # check if country exists for transparency categories
    try:
        tc = Setting.objects.values('value').get(key='TRANSPARENCY_CATEGORIES')
        if tc:
            transp_categories = json.loads(tc['value'])
        else:
            logger.error("Sistem problem: UNDEFINED Setting.TRANSPARENCY_CATEGORIES")
    except Exception, e:
        logger.error("Can't read Setting.TRANSPARENCY_CATEGORIES: " + str(e))
        response = {'status': 'Failed', 'messages': "Can't read Setting.TRANSPARENCY_CATEGORIES"}
        return HttpResponse(json.dumps(response), content_type='application/json')

    # check if account has categories defined
    try:
        transparency_country = preferences['account.transparency.country']
    except:
        transparency_country = False

    if not transparency_country:
        #readit and create it
        transparency_country = request.GET.get("country", "CL")
    try:
        country_transp_categories = transp_categories[transparency_country]
    except:
        response = {'status': 'Failed', 'messages': "Country not exists"}
        return HttpResponse(json.dumps(response), content_type='application/json')

    preference, created = Preference.objects.get_or_create(account_id=account_id, key='account.transparency.country')
    preference.value = transparency_country
    preference.save()

    categories_ids = []
    language = preferences['account.language']

    for cat in country_transp_categories:
        category = Category.objects.create(account_id = account_id)
        categories_ids.append(str(category.id)) # STR is because we can't JOIN numbers later (?)
        CategoryI18n.objects.create(category = category
                                   , name = cat
                                   , description = ""
                                   , language = language)


    # list the transparency categories for further reference
    str_categories_ids = " ".join(categories_ids)
    account.set_preference("account.transparency.categories", str_categories_ids)

    # mark account as created for non-duplicate transparency categories
    preference, created = Preference.objects.get_or_create(account_id=account_id, key='account.transparency.createdcategories')
    preference.value = "1"
    preference.save()

    str_categories = " ".join(country_transp_categories)
    response = {'status': 'OK', 'messages': "Created %s " % str_categories}
    return HttpResponse(json.dumps(response), content_type='application/json')

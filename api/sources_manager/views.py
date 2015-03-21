from django.conf import settings
from junar.core.models import *
from junar.api.http import JSONHttpResponse
from junar.api.exceptions import is_method_get_or_405, Http400
from junar.api.sources_manager import forms, utils
from junar.api.decorators import public_access_forbidden
from junar.core.lib.datastore import *

@public_access_forbidden
def checkfileUploaded(request):
    is_method_get_or_405(request)

    hasKey        = False
    aws_key_form    = forms.AWSKeyForm(request.GET)

    if aws_key_form.is_valid() :
        key   = aws_key_form.cleaned_data['key']        
        bucket= active_datastore.get_bucket(request.bucket_name)
        
        try:
            key = bucket.get_key(key)
            if key:
                hasKey = True
        except:
            pass
    else:
        raise Http400

    return JSONHttpResponse('{"hasKey":%s}' % str(hasKey).lower())
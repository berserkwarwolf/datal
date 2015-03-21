import urllib2
from junar.core.choices import *
from junar.core.helpers import get_domain_with_protocol

def get_impl_type(mimetype, end_point):
    mimetype = mimetype.split(';')[0]
    impl_types = {
      "application/vnd.ms-xpsdocument": SourceImplementationChoices.DOC
    , "application/vnd.ms-excel": SourceImplementationChoices.XLS
    , "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": SourceImplementationChoices.XLS
    , "application/vnd.oasis.opendocument.text": SourceImplementationChoices.ODT
    , "application/vnd.oasis.opendocument.text-web": SourceImplementationChoices.ODT
    , "application/vnd.oasis.opendocument.spreadsheet": SourceImplementationChoices.ODS
    , "application/msword": SourceImplementationChoices.DOC
    , "text/html": SourceImplementationChoices.HTML
    , "text/csv": SourceImplementationChoices.TXT
    , "text/x-comma-separated-values": SourceImplementationChoices.HTML
    , "text/plain": SourceImplementationChoices.HTML
    , "application/pdf": SourceImplementationChoices.PDF
    , "application/vnd.google-earth.kml+xml": SourceImplementationChoices.KML
    , "image/jpeg": SourceImplementationChoices.IMAGE
    , "image/png": SourceImplementationChoices.IMAGE
    , "image/gif": SourceImplementationChoices.IMAGE
    , "application/zip": SourceImplementationChoices.ZIP
    , "application/x-gzip": SourceImplementationChoices.ZIP
    , "application/x-tar": SourceImplementationChoices.ZIP
    }

    try:
        return impl_types[mimetype]
    except KeyError:
        try:
            extension = end_point.split('/')[-1].split('.')[-1]
            extensions = {
             'doc': SourceImplementationChoices.DOC,
             'docx': SourceImplementationChoices.DOC,
             'docm': SourceImplementationChoices.DOC,
             'dotx': SourceImplementationChoices.DOC,
             'dotm': SourceImplementationChoices.DOC,
             'xlsx': SourceImplementationChoices.XLS,
             'xlsm': SourceImplementationChoices.XLS,
             'xls': SourceImplementationChoices.XLS,
             'xltx': SourceImplementationChoices.XLS,
             'xltm': SourceImplementationChoices.XLS,
             'xlsb': SourceImplementationChoices.XLS,
             'xlam': SourceImplementationChoices.XLS,
             'xll': SourceImplementationChoices.XLS,
             'odt': SourceImplementationChoices.ODT,
             'ods': SourceImplementationChoices.ODS,
             'html': SourceImplementationChoices.HTML,
             'csv': SourceImplementationChoices.CSV,
             'txt': SourceImplementationChoices.CSV,
             'kml': SourceImplementationChoices.KML,
             'xml': SourceImplementationChoices.XML,
             'kmz': SourceImplementationChoices.KMZ,
             'zip': SourceImplementationChoices.ZIP,
             'tar': SourceImplementationChoices.ZIP,
             'gz': SourceImplementationChoices.ZIP,
             'jpg': SourceImplementationChoices.IMAGE,
             'jpeg': SourceImplementationChoices.IMAGE,
             'gif': SourceImplementationChoices.IMAGE,
             'png': SourceImplementationChoices.IMAGE

            }
            return extensions[extension]
        except KeyError:
            return SourceImplementationChoices.HTML
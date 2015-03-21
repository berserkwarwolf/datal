from django.conf.urls  import patterns, url

urlpatterns = patterns('',   
    url(r'^save', 'junar.workspace.personalizeHome.views.save', name='personalizeHome.save'),
    url(r'^suggest', 'junar.workspace.personalizeHome.views.suggest', name='personalizeHome.suggest'),
    url(r'^upload', 'junar.workspace.personalizeHome.views.upload', name='personalizeHome.upload'),
    url(r'^deleteFiles', 'junar.workspace.personalizeHome.views.deleteFiles', name='personalizeHome.deleteFiles'),
   
)

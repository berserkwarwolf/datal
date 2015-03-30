application:
  path: /home/vagrant/app

  settings:
    # Base Django Settings
    secret_key: '1'
    root_urlconf: 'workspace.urls'

    pagination_results_per_page: 10

virtualenv:
  path: /home/vagrant/env
  requirements: /home/vagrant/app/requirements.txt

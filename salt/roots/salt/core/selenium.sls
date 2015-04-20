include:
  - core.nodejs

fontconfig:
  pkg.installed

phantomjs_install:
  gem.installed:
    - name: phantomjs

selenium_install:
  pip.installed:
    - require:
      - pkg: python-pip
    - names:
      - selenium

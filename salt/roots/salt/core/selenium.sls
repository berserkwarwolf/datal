include:
  - core.nodejs

fontconfig:
  pkg.installed

selenium_install:
  pip.installed:
    - require:
      - pkg: python-pip
    - names:
      - selenium

# Usamos navegador headless para los tests
testing_tools_install:
  pkg.installed:
    - names:
      - xvfb
      - firefox

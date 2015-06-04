maven:
  pkg:
    - installed
git:
  pkg:
    - installed
python-git:
  pkg:
    - installed

Clone Indextank-engine Github:
  git.latest:
    - name:  https://github.com/linkedin/indextank-engine.git
    - target: /usr/share/indextank-engine/

indextank:
   cmd.run:
    - name: |
        mvn compile package assembly:single
    - cwd: /usr/share/indextank-engine/
    - require:
      - git: Clone Indextank-engine Github
    - watch:
      - git: Clone Indextank-engine Github

indextank_initd:
   file.managed:
     - source: salt://core/indextank/indextank-engine.sh
     - name: /etc/init.d/indextank-engine.sh
     - mode: 755
     - user: root
     - group: root
   cmd.run:
    - cwd: /usr/share/indextank-engine
    - name: /etc/init.d/indextank-engine.sh

maven:
  pkg:
    - installed
git:
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


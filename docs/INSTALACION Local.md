
Instalacion de Datal en equipo (Debian - Ubuntu)
================================================

1. Instalar git y curl
2. Crear un usuario llamado vagrant
3. su vagrant
4. cd ~
5. git clone https://github.com/datal-org/datal.git app
6. cd /home/vagrant/app
7. git submodule init
8. git submodule update
9. curl -L https://bootstrap.saltstack.com | bash /dev/stdin
10. Reemplazar el /etc/salt/minion con

    file_client: local
    
    file_roots:
      base:
        - /home/vagrant/app/salt/roots/salt
        - /home/vagrant/app/salt/roots/formulas/nginx-formula
    
    
    
    pillar_roots:
      base:
        - /home/vagrant/app/salt/roots/pillar

11. Reiniciar el servicio salt-minion
12. Ejecutar el provision: salt-call state.highstate

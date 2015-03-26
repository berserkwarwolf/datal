
Datal
=====
Plataforma de publicación de Datos Abiertos de código abierto.


Requirements
------------

Vangrant: https://www.vagrantup.com/

VirtualBox: https://www.virtualbox.org/


Quick start
-----------

1. git sobmodule init
2. git submodule update
3. Get a copy of War file and save it into salt/roots/salt/war/ with the name AgileOfficeServer.war
4. Add to your local /etc/hosts the line: 
    
    127.0.0.1 microsite admin api workspace microsites

5. Start the machine with the command: 

        vagrant up --provision

6. Access to the web in your local 8080 port. Example: http://workspace:8080


VM access
---------


In order to access by SSH to the virtual machine you may run

    vagrant ssh


In order to access to MySQL you may access to the port 8306 and for websites 8080



Logs
----

    vagrant ssh
    tail -f /var/log/uwsgi/uwsgi-workspace.log (or other logs)
    

Workarounds
-----------

If the website is not up:

    vagrant ssh
    sudo supervisorctl restart all

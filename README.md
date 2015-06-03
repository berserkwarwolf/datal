
Datal
=====
Plataforma de publicación de Datos Abiertos de código abierto.


Herramientas
------------

Vangrant: https://www.vagrantup.com/

VirtualBox: https://www.virtualbox.org/


Instalacion
-----------

1. git submodule init
2. git submodule update
3. Crear un archivo en salt/roots/pillar/local.sls con el formato igual a salt/roots/pillar/local_demo.sls completando los datos necesarios.
4. Agregar los siguientes hosts a nuestro archivo de hosts: 
    
    127.0.0.1 microsite admin api workspace microsites

5. Iniciar la virtual con el comando:

        vagrant up --provision

6. Acceder a la web en tu navegador local, puerto 8080. Ejemplo: http://workspace:8080


Usuarios y claves para workspace
--------------------------------

Administrador: administrador/administrador

Editor:

Publicador: publicador/publicador


Acceso a la virtual
-------------------


Para acceder a la virtual via SSH

    vagrant ssh


Logs
----

    vagrant ssh
    tail -f /var/log/uwsgi/uwsgi-workspace.log (or other logs)
    tail -f /tmp/datal.log
    

Problemas
---------

Reiniciar los servicios Web:

    vagrant ssh
    sudo supervisorctl restart all








Personalización de aspectos gráficos
---------

Para ajustar los estilos gráficos del espacio de trabajo es necesario editar el archivo '_variables.scss'. Dentro de este 
archivo SASS se encuentran las variables necesarias para personalizar la identidad visual de Datal. 

Ejemplo:

    $brand-color: blue;				/* Brand primary color */


SASS: http://sass-lang.com/

Documentación SASS: http://sass-lang.com/documentation/file.SASS_REFERENCE.html

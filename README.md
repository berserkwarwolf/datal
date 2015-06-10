
Datal
=====
Plataforma de publicación de Datos Abiertos de código abierto.


Herramientas
------------

Vangrant: https://www.vagrantup.com/

VirtualBox: https://www.virtualbox.org/


Instalacion
-----------

Luego de haber clonado el repositorio, dentro del mismo ejecutar:

1. git submodule init
2. git submodule update
3. Agregar los siguientes hosts a nuestro archivo de hosts apuntando a localhost. Ejemplo suponiendo que el IP local es 127.0.0.1

    127.0.0.1 admin.dev api.dev datastore.dev microsite.dev  workspace.dev

4. Iniciar la virtual con el comando:

    vagrant up --provision

5. Iniciar el servicio Web:

    vagrant ssh
    
    sudo supervisorctl start uwsgi

6. Acceder a la web en tu navegador local, puerto 8080. Ejemplo: http://workspace.dev:8080


Actualizacion
-------------

1. git pull origin master
2. vagrant provision (si la virtual esta corriendo) o vagrant up --provision (si la virtual esta apagada)


Usuarios y claves para workspace
--------------------------------

Administrador: administrador/administrador

Editor: editor/editor

Publicador: publicador/publicador


Acceso a la virtual
-------------------


Para acceder a la virtual via SSH

  vagrant ssh


Logs
----
  UWSGI: /var/log/uwsgi/uwsgi-workspace.log
  
  DJANGO: /tmp/datal.log
    
  MOTOR (TOMCAT): /var/log/tomcat7/catalina.out
  
  CORREOS: /tmp/datal-emails/
  
  NGINX: /var/log/nginx/


Personalización de aspectos gráficos
---------

Para ajustar los estilos gráficos del espacio de trabajo es necesario editar el archivo '_variables.scss'. Dentro de este 
archivo SASS se encuentran las variables necesarias para personalizar la identidad visual de Datal. 

Ejemplo:

    $brand-color: blue;				/* Brand primary color */


SASS: http://sass-lang.com/

Documentación SASS: http://sass-lang.com/documentation/file.SASS_REFERENCE.html

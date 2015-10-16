# Entorno de desarrollo

Entre a la máquina virtual y detenga uWSGI usando 
```
$ sudo supervisorctl stop uwsgi
```
luego inicie el servidor de desarrollo de django para la aplicación que desea modificar usando, por ejemplo, para workspace:
```
$ python manage.py runserver_plus 0.0.0.0:3015 --settings=workspace.settings
```

El puerto 3015 está vinculado al 8015 de la maquina host. 
Abra en un navegador la url `http://workspace.dev:8015/`. 

De la misma forma, para las demás aplicaciones django, existen puertos vinculados (vea `/Vagrantfile` para mas información).

## Acerca de la automatización del servidor

Para hacer correr la plataforma datal en nuestro equipo usamos [Vagrant](https://www.vagrantup.com/).  
Esta herramienta permite crear maquinas virtuales completas via [Virtualbox](https://www.virtualbox.org/).  
  
Para admnistrar el contenido y configuración de estas máquinas virtuales y que carguen 
todo lo que requiere Datal para funcionar usamos [Salt](http://saltstack.com/).  
  
Esto permite tratar a la infraestructuera como código. Es decir, para cambiar el servidor solo se 
requiere hacer cambios en este directorio y luego desplegar.  
  

La API de DATAL debe seguir en la medida de lo posible las guias de 
diseño del Gobierno de Chile, expuestas en 
[https://github.com/e-gob/api-standards](https://github.com/e-gob/api-standards). 

En resumen, se estructurarán las URLs de la API siguiendo el patrón REST, asignando 
URLs a recursos, utilizando los verbos GET, POST, PUT, PATCH, DELETE para las correspondientes 
acciones y la extension del formato en que se recibiran los resultados, por ejemplo:

GET /api/v2/datasets/12345.json

para solicitar un dataset identificado por el ID 12345 en formato JSON.

# Recursos

## Vistas 

### Métodos

Busca un listado de vistas.

```
GET /api/v2/datastreams
```

Trae la información asociada a una vista

```
GET /api/v2/datastreams/:guid
``` 

Trae la información asociada completa (incluye los valores de la vista) a una vista

```
GET /api/v2/datastreams/:guid?full=true
``` 

### Atributos

Si se piden los datos asociados a una vista se devuelve

```
{
  "id": "INDIC-DIARI", 
  "title": "Indicadores Diarios", 
  "description": "Datos obtenidos en l\u00ednea del Banco Central de Chile.", 
  "user": "cne", 
  "tags": [], 
  "created_at": "2015-07-28 11:20:24", 
  "source": "https://docs.google.com/spreadsheets/d/1wiUQlRiIPMbTWFDVn3Ug8Rp15yHuXwsCU3ZGz39xJhg/pub?gid=0&single=true&output=csv", 
  "link": "http://datos.energiaabierta.cne.cl/datastreams/94287/indicadores-diarios/", 
  "category_id": 41111, 
  "category_name": "Internacional"
}
```

- **id**: Id de la vista.
- **title**: Titulo de la vista.
- **description**: Descripción de la vista.
- **user**: Usuario propietario de la vista.
- **tags**: Tags correspondientes a la vista.
- **created_at**: Fecha de creacón.
- **source**: Fuente de los datos de la vista.
- **link**: Link a la vista en el sitio de datos.
- **category_id**: Id de la categoría de la vista.
- **category_name**: Nombre de la categoría de la vista.

Si se piden los datos completos se agrega la propiedad result con los valores de la vista

```
{
  "id": "INDIC-DIARI", 
  "title": "Indicadores Diarios", 
  "description": "Datos obtenidos en l\u00ednea del Banco Central de Chile.", 
  "user": "cne", 
  "tags": [], 
  "created_at": 
  "2015-07-28 11:20:24", 
  "source": "https://docs.google.com/spreadsheets/d/1wiUQlRiIPMbTWFDVn3Ug8Rp15yHuXwsCU3ZGz39xJhg/pub?gid=0&single=true&output=csv", 
  "link": "http://datos.energiaabierta.cne.cl/datastreams/94287/indicadores-diarios/", 
  "category_id": 41111, 
  "category_name": "Internacional",
  "result": {
    "fType":"ARRAY",
    "fArray": [
      {
        "fStr":"Indicador",
        "fType":"TEXT",
        "fHeader":true
      },{
        "fStr":"Valor",
        "fType":"TEXT",
        "fHeader":true
      },{
        "fStr":"UF",
        "fType":"TEXT"
      },{
        "fNum":25152.06,
        "fType":"NUMBER",
        "fDisplayFormat": {"fPattern":"#,###.##", "fLocale":"es"}
      },{
        "fStr":"UTM (Agosto)",
        "fType":"TEXT"
      },{
        "fNum":44067.0,
        "fType":"NUMBER",
        "fDisplayFormat":{"fPattern":"#,###.##","fLocale":"es"}
      },{
        "fStr":"Dólar Observado",
        "fType":"TEXT"
      },{
        "fNum":689.36,
        "fType":"NUMBER",
        "fDisplayFormat":{"fPattern":"#,###.##","fLocale":"es"}
      },{
        "fStr":"Dólar Observado19-08-2015",
        "fType":"TEXT"
      },{
        "fNum":697.25,
        "fType":"NUMBER",
        "fDisplayFormat":{"fPattern":"#,###.##","fLocale":"es"}
      }
    ],
    "fRows":4,
    "fCols":2,
    "fTimestamp":1439937039829,
    "fLength":0
  }, 
}





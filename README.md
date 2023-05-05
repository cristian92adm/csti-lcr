
## Deploy the sample application

Inicialice el aplicativo con los comandos
```bash
sam build
sam local start-api
```

La CLI de SAM también puede emular la API de su aplicación. Use `sam local start-api` para ejecutar la API localmente en el puerto 3000.

```bash
sam-app02$ sam local start-api
```

## Requirements

Instalacion de dependencias dentro de la carpeta src

```bash
sam-app02$ cd src
sam-app02$ npm i
```
``
Inicializar Redis en un contenedor Docker, modifique la cadena de conexion en  en src/database/config.ts

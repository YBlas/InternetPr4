# InternetPr4
## Guía de inicio
### Instalar dependencias
Todas las dependencias necesarias para el proyecto se encuentrán especificadas en el archivo package.json para instalarlas en su proyecto solo necesitará tener instalado npm y ejecutar el comando:

***npm install***

### Uso de base de datos
El programa funcionará con la base de datos actual pero al haber aislado la función de conexión a mongo solo habrá que sustituir el url y colecciones por las propias.

### Ejecución del programa

***npm run dev***

El puerto predefinido es el 6969, por lo que para utilizar la consola de Apollo tendrá que introducir en su navegador el url:

***http://localhost:6969/graphql***

### ID de elementos
Todos los id's de los objetos del programa son extraidos de los autogenerados por la base de datos mongo db, por lo que se tratan de datos ObjectId de mongo y no un string ordinario, hay que tenerlo en cuenta para su necesaria conversion en algunos casos como el de introducirlos como parámetros string.

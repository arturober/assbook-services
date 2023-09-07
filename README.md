<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="200" alt="Nest Logo" /></a>
</p>

[circleci-image]: https://img.shields.io/circleci/build/github/nestjs/nest/master?token=abc123def456
[circleci-url]: https://circleci.com/gh/nestjs/nest

  <p align="center">A progressive <a href="http://nodejs.org" target="_blank">Node.js</a> framework for building efficient and scalable server-side applications.</p>
    <p align="center">
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/v/@nestjs/core.svg" alt="NPM Version" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/l/@nestjs/core.svg" alt="Package License" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/dm/@nestjs/common.svg" alt="NPM Downloads" /></a>
<a href="https://circleci.com/gh/nestjs/nest" target="_blank"><img src="https://img.shields.io/circleci/build/github/nestjs/nest/master" alt="CircleCI" /></a>
<a href="https://coveralls.io/github/nestjs/nest?branch=master" target="_blank"><img src="https://coveralls.io/repos/github/nestjs/nest/badge.svg?branch=master#9" alt="Coverage" /></a>
<a href="https://discord.gg/G7Qnnhy" target="_blank"><img src="https://img.shields.io/badge/discord-online-brightgreen.svg" alt="Discord"/></a>
<a href="https://opencollective.com/nest#backer" target="_blank"><img src="https://opencollective.com/nest/backers/badge.svg" alt="Backers on Open Collective" /></a>
<a href="https://opencollective.com/nest#sponsor" target="_blank"><img src="https://opencollective.com/nest/sponsors/badge.svg" alt="Sponsors on Open Collective" /></a>
  <a href="https://paypal.me/kamilmysliwiec" target="_blank"><img src="https://img.shields.io/badge/Donate-PayPal-ff3f59.svg"/></a>
    <a href="https://opencollective.com/nest#sponsor"  target="_blank"><img src="https://img.shields.io/badge/Support%20us-Open%20Collective-41B883.svg" alt="Support us"></a>
  <a href="https://twitter.com/nestframework" target="_blank"><img src="https://img.shields.io/twitter/follow/nestframework.svg?style=social&label=Follow"></a>
</p>
  <!--[![Backers on Open Collective](https://opencollective.com/nest/backers/badge.svg)](https://opencollective.com/nest#backer)
  [![Sponsors on Open Collective](https://opencollective.com/nest/sponsors/badge.svg)](https://opencollective.com/nest#sponsor)-->

# Servicios web applicación AssBook

Servicios web para los proyectos de la asignatura de entorno cliente. 

### Instalación de los servicios

Importar la base de datos (directorio SQL). Configurar el archivo **src/mikro-orm.config.ts** con el servidor (host), usuario, password, y nombre de la base de datos. Ejemplo:

```typescript 
export default {
  entities: [User, Post, LikePost, Comment],
  type: 'mariadb', // one of `mongo` | `mysql` | `mariadb` | `postgresql` | `sqlite`
  dbName: process.env.DB_DATABASE || 'assbook',
  user: process.env.DB_USERNAME || 'root',
  password: process.env.DB_PASSWORD || '',
  host: process.env.DB_SERVER_HOST || 'localhost',
  port: parseInt(process.env.DB_SERVER_PORT, 10) || 3306,
  debug: true,
} as ConnectionOptions;
```

A continuación, instalamos los paquetes necesarios con NPM:

```bash
$ npm install
```

Edita el archivo **src/google-id.ts** para poner ahí tu id de Google o no funcionará el login con dicho proveedor.

### Configurando notificaciones Push

Descarga el archivo de cuenta de servicio (Configuración de proyecto -> cuentas de servicio) dentro de la carpeta firebase y renombralo a **serviceAccountKey.json**. Tiene que ser el mismo proyecto que uses en la aplicación cliente donde habrás descargado el archivo *google-services.json*. Los servicios están configurados para mandar una notificación push cuando alguien comente en un post, al creador del mismo.

### Probando los servicios

Ejecutamos los servicios web con el siguiente script:

```bash
# development
$ npm run start
```

En el directorio Postman (raíz del proyecto) hay una colección de Postman para importar y probar.

## Servicios web - Colecciones

Normalmente, todos los servicios devuelven un resultado en formato JSON. Cuando no se pueda realizar una operación, devolverán un código de error HTTP junto a un objeto JSON con la descripción del mismo.

Todas las colecciones, excepto **/auth** *(/auth/validate sí lo requiere)*, requieren un token de autenticación para poder utilizar los servicios web, devolviendo un código 401 (Not Authorized) en caso de no incluirlo. Este debe enviarse en la cabecera Authorization con el prefijo Bearer:

```
Authorization: Bearer auth_token
```

### Colección /auth

* **POST /auth/login**

El servicio comprueba si un usuario y contraseña son correctos, devolviendo un token de autenticación (JWT) si todo va bien. Opcionalmente se puede enviar la posición del usuario para que la actualice.

Ejemplo de **petición**:

```json
{
    "email": "prueba@email.es",
    "password": "1234"
}
```
Si el login es correcto, la **respuesta** será algo como esto:

```json
{
    "expiresIn": 31536000,
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MiwiaWF0IjoxNTc4MTYyNDA2LCJleHAiOjE2MDk2OTg0MDZ9.HQZ-PO-usLc9WT-0cUpuDPnVRFl_u71njNoQNj_TIx8"
}
```

En caso de error en el login (usuario y contraseña no válidos), se devolverá el código de error 401:

```json
{
    "status": 401,
    "error": "Email or password incorrect"
}
```

* **POST /auth/google**

Este servicio recibe el campo **id_token** que devuelve la identificación mediante Google en el cliente. Lo valida y comprueba el correo en la base de datos. Si el correo existe funciona como un login normal, y si no existe registra al usuario (a partir de los datos obtenidos de Google) en la base de datos. Devuelve un token de autenticación válido para el servidor (como el login).

Ejemplo de envío (lat y lng son opcionales):

```json
{
    "token": "id_token de Google",
}
```

Ejemplo de respuesta:

```json
{
    "accessToken": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJleHAiOjE0ODU5MDA1MzgsImlkIjoiMSIsIm5hbWUiOiJQcnVlYmEiLCJlbWFpbCI6InBydWViYUBjb3JyZW8uZXMifQ.vf7hwA3gceCDvOCa9RoWxR9cJ5mARnbAs6Nv9VBlPdc"
}
```

https://developers.google.com/identity/sign-in/web/backend-auth

* **POST /auth/facebook**

Este servicio recibe el campo **accessToken** que devuelve la identificación mediante Facebook en el cliente. Lo valida y comprueba el correo en la base de datos. Si el correo existe funciona como un login normal, y si no existe registra al usuario (a partir de los datos obtenidos de Facebook) en la base de datos. Devuelve un token de autenticación válido para el servidor (como el login).

Ejemplo de envío (lat y lng son opcionales):

```json
{
    "token": "accessToken de Facebook",
}
```

Ejemplo de respuesta:

```json
{
    "accessToken": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJleHAiOjE0ODU5MDA1MzgsImlkIjoiMSIsIm5hbWUiOiJQcnVlYmEiLCJlbWFpbCI6InBydWViYUBjb3JyZW8uZXMifQ.vf7hwA3gceCDvOCa9RoWxR9cJ5mARnbAs6Nv9VBlPdc"
}

https://lorenstewart.me/2017/03/12/using-node-js-to-interact-with-facebooks-graph-api/

* **POST /auth/register**

Este servicio recibe los datos de un usuario y lo registra en la base de datos.

Ejemplo de **petición** (_lat_ y _lng_ son opcionales):

```json
{
    "name": "Prueba",
    "email": "prueba@correo.es",
    "password": "1234",
    "avatar": "Imagen codificada en base64"
}
```

* **GET /auth/validate**

Este servicio simplemente comprueba que el token de autenticación que se envía en la cabecera Authorization es correcto (y se ha enviado), devolviendo una respuesta como esta si está todo correcto:

```json
{
    "ok": true
}
```

O un código 401 (Not Authorized) si no es válido.


### Colección /restaurants

Todos los servicios de esta colección requieren del token de autenticación.

* **GET /posts**

Devuelve todos los posts. Además de los datos del post almacenado, el total de likes (*totalLikes*), el voto si el usuario actual le ha dado a like o dislike (*vote*), y si el post pertenece al usuario (*mine*).

```json
{
    "posts": [
        {
            "id": 23,
            "title": "Complete post",
            "description": "This is the description\nwith more than one line",
            "date": "2019-11-19T18:47:03.607Z",
            "image": "http://localhost:3000/img\\posts\\1574189223289.jpg",
            "mood": 2,
            "place": null,
            "lat": null,
            "lng": null,
            "totalLikes": 2,
            "creator": {
                "id": 3,
                "name": "Test User 3",
                "email": "test3@test.com",
                "avatar": "http://localhost:3000/img\\users\\1574290767381.jpg",
                "oneSignalId": null,
                "followersCount": 0,
                "followingCount": 0
            },
            "vote": {
                "likes": true
            },
            "mine": false
        },
        ...
    ]
}
```

* **GET /posts/mine**

Igual que el servicio **/posts** pero sólo devuelve los restaurantes cuyo creador es el usuario actual.

* **GET /posts/user/:id**

Igual que el servicio **/posts** pero sólo devuelve los restaurantes del usuario cuya id recibe por parametro.

* **GET /posts/:id**

Devuelve la información del post cuya id recibe por parámetro en la url. En caso de no existir, devolverá un código de error 404.

También devolverá información sobre el usuario creador del mismo.

Ejemplo de llamada a **/posts/23**.

```json
{
    "post": {
        "id": 23,
        "title": "Complete post",
        "description": "This is the description\nwith more than one line",
        "date": "2019-11-19T18:47:03.607Z",
        "image": "http://localhost:3000/img\\posts\\1574189223289.jpg",
        "mood": 2,
        "place": null,
        "lat": null,
        "lng": null,
        "totalLikes": 2,
        "creator": {
            "id": 3,
            "name": "Test User 3",
            "email": "test3@test.com",
            "avatar": "http://localhost:3000/img\\users\\1574290767381.jpg",
            "oneSignalId": null,
            "followersCount": 0,
            "followingCount": 0
        },
        "vote": {
            "likes": true
        },
        "mine": false
    }
}
```

* **POST /posts**

Crea un nuevo post en la base de datos (debe recibir al menos algún campo). Ejemplo de post con imagen y con localización:

```json
{
	"title": "Complete post",
	"description": "This is the description\nwith more than one line",
	"image": "Imagen en Base64",
	"mood": 2
}
```

```json
{
	"title": "Birthday party",
	"description": "At my house",
	"place": "Vertedero Municipal",
	"lat": 43.2386,
	"lng": -2.9687,
	"mood": 2
}
```

El servicio devolverá, si todo ha ido bien y se ha insertado el post, el objeto recién insertado en la base de datos, con su id y la url de la imagen guardada en el servidor:

```json
{
    "post": {
        "title": "Complete post",
        "description": "This is the description\nwith more than one line",
        "image": "http://localhost:3000/img/posts/1578165006148.jpg",
        "mood": 2,
        "creator": {
            "id": 2,
            "name": "Test User 2",
            "email": "test2@test.com",
            "avatar": "http://localhost:3000/img/users/1571756211995.jpg",
            "oneSignalId": null,
            "followersCount": 2,
            "followingCount": 0
        },
        "place": null,
        "lat": null,
        "lng": null,
        "id": 47,
        "date": "2020-01-04T19:10:06.306Z",
        "totalLikes": 0
    }
}
```

Normalmente, cuando los datos enviados sean insuficientes o no estén en el formato correcto, el servidor devolverá un error 400 (Bad request).

* **PUT /posts/:id**

Similar al servicio anterior (añadir restaurante), pero además se envía en la url la id del restaurante que se va a modificar. Se debe enviar toda la información otra vez, dejando los campos que no han cambiado con su valor original. Se debe prestar atención a si queremos enviar una imagen, no enviar los campos lat y lng aunque estuvieran en el post original.

Devuelve, si todo sale bien, el restaurante con la información modificada.

* **DELETE /posts/:id**

Este servicio borra un post de la base de datos y devuelve la id del post eliminado, o un error 404 si el post a borrar no existe.

Ejemplo de respuesta a la llamada **/posts/34**

```json
{
    "id": 34
}
```

* **POST /posts/:id/likes**

Permite votar un post con un like (true) o dislike (false). Este es el json a enviar:

```json
{
	"likes": true
}
```

El servicio responderá con el total de likes para actualizarlo en el post correspondiente:

```json
{
    "totalLikes": 1
}
```

* **DELETE /posts/:id/likes**

Borra el voto que se le hubiera dado a un post. Al igual que el servicio anterior, devolverá el total de likes resultante.

* **GET /posts/:id/comments**

Devuelve un objeto que contiene un array con todos los comentarios que han realizado los usuarios sobre un post.

```json
{
    "comments": [
        {
            "id": 9,
            "text": "This is a comment",
            "date": "2019-11-20T19:46:01.199Z",
            "user": {
                "id": 3,
                "name": "Test User 3",
                "email": "test3@test.com",
                "avatar": "http://localhost:3000/img\\users\\1574290767381.jpg",
                "oneSignalId": null,
                "followersCount": 0,
                "followingCount": 0
            }
        },
        ...
    ]
}
```

* **POST /posts/:id/comments**

Inserta un nuevo comentario en un post. Devolverá un 404 si el restaurante no existe, o un 400 si falta información o el formato no es correcto.

Ejemplo de comentario:

```json
{
  "text": "This is a comment"
}
```

La respuesta será la información del comentario insertado en la base de datos:

```json
{
    "comment": {
        "id": 24,
        "text": "This is a comment",
        "date": "2020-01-05T19:14:43.797Z",
        "user": {
            "id": 2,
            "name": "Test User 2",
            "email": "test2@test.com",
            "avatar": "http://localhost:3000/img/users/1571756211995.jpg",
            "oneSignalId": null,
            "followersCount": 2,
            "followingCount": 0
        }
    }
}
```

### Colección /users

Todos los servicios de esta colección requieren del token de autenticación.

* **GET /users/me**

Devuelve la información del perfil del usuario autenticado. El booleano **me** indica si la información es del usuario autenticado o de otro.

```json
{
    "user": {
        "id": 27,
        "name": "Tom",
        "email": "tom2@email.com",
        "avatar": "img\\users\\1541009537495.jpg",
        "lat": "37.8235530",
        "lng": "-1.2654570",
        "me": true
    }
}
```

* **GET /users/:id**

Igual que **/users/me** pero devuelve la información del usuario cuya id recibe en la url. Devuelve un error 404 si el usuario no existe.

Ejemplo de llamada a **/users/22**:

```json
{
    "user": {
        "id": 22,
        "name": "John Wayne",
        "email": "email2@email.com",
        "avatar": "img/users/1539948671405.jpg",
        "lat": "41.3254320",
        "lng": "-1.2345500",
        "me": false
    }
}
```

* **PUT /users/me**

Modifica la información del nombre y correo del usuario autenticado.

Ejemplo de petición:

```json
{
  "name": "John",
  "email": "email@email.com"
}
```

Responde simplemente con una confirmación si todo ha ido bien (O error 400 si los datos de entrada son insuficientes o erróneos):

```json
{
    "ok": true
}
```

* **PUT /users/me/avatar**

Modifica el avatar del usuario autenticado. Ejemplo de petición:

```json
{
    "avatar": "Imagen en base 64"
}
```

Responde con la url de la nueva imagen almacenada en el servidor:

```json
{
    "avatar": "img/users/1545565439800.jpg"
}
```

* **PUT /users/me/password**

Actualiza la contraseña del usuario autenticado:

```json
{
  "password": "1234"
}
```

Responde simplemente con una confirmación si todo ha ido bien:

```json
{
    "ok": true
}
```

<!-- * **GET /users/me/followers**

Devuelve los usuarios que te siguen:

```json
{
    "followers": [
        {
            "id": 1,
            "name": "John",
            "email": "email@email.com",
            "avatar": "http://localhost:3000/img/users/1571767279934.jpg",
            "oneSignalId": null,
            "followersCount": 0,
            "followingCount": 1
        },
        ...
    ],
    "count": 3
}
```

* **GET /users/me/following**

Devuelve los usuarios a los que sigues:

```json
{
    "following": [
        {
            "id": 2,
            "name": "Test User 2",
            "email": "test2@test.com",
            "avatar": "http://localhost:3000/img/users/1571756211995.jpg",
            "oneSignalId": null,
            "followersCount": 3,
            "followingCount": 1
        }
    ],
    "count": 1
}
```

* **POST /users/follow**

Este servicio es para empezar a seguir a un usuario. Se ha de enviar la id de dicho usuario:

```json
{
	"id": 2
}
```

El servidor responderá con la misma id si todo ha ido bien

* **DELETE /users/follow/:id**

Deja de seguir a un usuario. El servidor devuelve la id del usuario que has dejado de seguir. -->


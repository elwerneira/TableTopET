# TableTopET

Aplicación web desarrollada con Angular 22 para presentar y administrar un
catálogo de juegos de mesa y productos TCG.

## Funcionalidades principales

- Navegación interna mediante Angular Router.
- Catálogo organizado por categorías.
- Registro, inicio de sesión y recuperación de contraseña.
- Perfil de usuario con formulario reactivo.
- Roles de cliente y administrador.
- Carrito e historial de compras almacenados localmente.
- Administración de usuarios, productos y stock.
- Validación de edad mínima y coincidencia de contraseñas.
- Explorador de cartas conectado a Pokémon TCG API.
- Documentación técnica generada con Compodoc.
- Pruebas unitarias con Jasmine y Karma.

## Requisitos

- Node.js compatible con Angular 22.
- npm.
- Google Chrome para ejecutar Karma con ChromeHeadless.

## Instalación

Desde la carpeta que contiene este archivo:

```bash
npm install
```

## Servidor de desarrollo

```bash
npm start
```

La aplicación estará disponible en:

```text
http://localhost:4200
```

## Inventario REST local

El inventario de productos se encuentra en `db.json` y se expone mediante
json-server. El Panel ADM consume este inventario para realizar operaciones
GET, POST, PUT y DELETE; las paginas de categorias muestran los productos
activos segun su categoria.

Para ejecutar el proyecto localmente con el CRUD REST, abre dos terminales en
la raiz del proyecto:

```bash
npx json-server@0.17.4 --watch db.json --port 3000
```

```bash
npm start
```

Endpoints y accesos locales:

- Aplicacion Angular: `http://localhost:4200`.
- Inventario REST: `http://localhost:3000/productos`.
- Panel de productos: inicia sesion como administrador y navega a `Panel ADM > Productos`.

La cuenta administradora de demostracion es `admin` con clave `Admin123`.

## Ejecucion con Docker

El proyecto incluye dos servicios en `compose.yml`:

- `angular-app`: compila Angular y publica la aplicacion mediante Nginx.
- `json-server-api`: expone `db.json` como API REST en el puerto 3000.

Con Docker Desktop iniciado, ejecuta:

```bash
docker compose -f compose.yml up --build
```

Luego abre:

- Aplicacion: `http://localhost:8080`.
- API REST: `http://localhost:3000/productos`.

Para detener los servicios:

```bash
docker compose -f compose.yml down
```

En Docker Lab o un entorno Cloud se deben publicar los puertos `8080` y `3000`
para que la aplicacion y su inventario REST queden disponibles.

## Pokémon TCG API

El explorador utiliza el endpoint público:

```text
https://api.pokemontcg.io/v2/cards
```

La consulta se realiza mediante `PokemonTcgApiService`. Para esta etapa se usa
el acceso público sin incluir claves privadas en el código del frontend.

Campos consumidos desde la API:

- `name`: nombre de la carta.
- `images.small` y `images.large`: imagen de vista previa y enlace a imagen ampliada.
- `supertype`, `subtypes`, `hp`, `types` y `rarity`: datos descriptivos de la carta.
- `set.name` y `set.releaseDate`: información de la expansión.

Estos datos se visualizan en el componente `Tcg`, específicamente en el popup
“Consultar cartas” de la página `src/app/pages/tcg/tcg.html`.

## Pruebas unitarias

Para ejecutar las pruebas una sola vez:

```bash
npm test -- --watch=false
```

Las pruebas utilizan Jasmine, Karma y ChromeHeadless.

## Compilación

```bash
npm run build
```

Los archivos generados se almacenan en `dist/TableTopET`.

## Documentación técnica

```bash
npm run docs
```

Para servir la documentación localmente:

```bash
npm run docs:serve
```

Compodoc quedará disponible normalmente en:

```text
http://localhost:8080
```

La carpeta `documentation/` se genera automáticamente. No debe editarse
manualmente; después de modificar código o comentarios JSDoc se debe ejecutar
nuevamente `npm run docs`.

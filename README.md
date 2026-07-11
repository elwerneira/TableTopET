# TableTopET

Aplicación web desarrollada con Angular 22 para presentar y administrar un
catálogo de juegos de mesa y productos Pokémon TCG.

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

Para generar la documentación en español:

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

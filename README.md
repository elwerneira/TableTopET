# TableTopET

Aplicación web desarrollada con Angular 22 para administrar un catálogo de
juegos de mesa, cuentas de usuario, carritos y compras.

## Servidor de desarrollo

Para iniciar el proyecto localmente:

```bash
npm start
```

La aplicación estará disponible en `http://localhost:4200/`.

## Compilación

Para compilar la aplicación:

```bash
npm run build
```

## Pruebas unitarias

Las pruebas utilizan Jasmine, Karma y ChromeHeadless:

```bash
npm test -- --watch=false
```

## Documentación técnica

Para generar la documentación en español con Compodoc:

```bash
npm run docs
```

Para servirla localmente en `http://localhost:8080/`:

```bash
npm run docs:serve
```

La carpeta `documentation/` es generada automáticamente y no debe editarse
manualmente. Después de cambiar comentarios JSDoc se debe ejecutar nuevamente
`npm run docs`.

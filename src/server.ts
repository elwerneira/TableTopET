import {
  AngularNodeAppEngine,
  createNodeRequestHandler,
  isMainModule,
  writeResponseToNodeResponse,
} from '@angular/ssr/node';
import express from 'express';
import { join } from 'node:path';

const browserDistFolder = join(import.meta.dirname, '../browser');

const app = express();
const angularApp = new AngularNodeAppEngine();

/**
 * En esta sección se pueden definir endpoints de una API REST con Express.
 * Se debe descomentar y completar cada endpoint según las necesidades del proyecto.
 *
 * Ejemplo:
 * ```ts
 * app.get('/api/{*splat}', (req, res) => {
 *   // Procesar la solicitud de la API
 * });
 * ```
 */

/**
 * Publica los archivos estáticos generados en la carpeta `/browser`.
 */
app.use(
  express.static(browserDistFolder, {
    maxAge: '1y',
    index: false,
    redirect: false,
  }),
);

/**
 * Procesa las demás solicitudes mediante el renderizado de la aplicación Angular.
 */
app.use((req, res, next) => {
  angularApp
    .handle(req)
    .then((response) =>
      response ? writeResponseToNodeResponse(response, res) : next(),
    )
    .catch(next);
});

/**
 * Inicia el servidor cuando este módulo es el punto de entrada principal o se ejecuta mediante PM2.
 *
 * Utiliza el puerto definido en la variable de entorno `PORT` o el puerto 4000
 * cuando la variable no está configurada.
 */
if (isMainModule(import.meta.url) || process.env['pm_id']) {
  const port = process.env['PORT'] || 4000;
  app.listen(port, (error) => {
    if (error) {
      throw error;
    }

    console.log(`Servidor Node Express disponible en http://localhost:${port}`);
  });
}

/**
 * Controlador de solicitudes utilizado por Angular CLI durante el desarrollo,
 * la compilación o una ejecución mediante Firebase Cloud Functions.
 */
export const reqHandler = createNodeRequestHandler(app);

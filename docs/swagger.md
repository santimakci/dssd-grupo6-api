## Documentación Swagger

Swagger se puede ver en la url de abajo solo cuando ENVIORMENT es development

- URL: `http://localhost:3000/api-docs`

Requisitos para que esté disponible:

- La variable de entorno `ENVIRONMENT` debe estar configurada en `DEVELOPMENT`.

Características importantes de la API:

- Prefijo global: todas las rutas están bajo `/api`.
- Versionado: las rutas usan versionado por URI, con versión por defecto `v1`.
  - Ejemplo: `POST /api/v1/auth/admin/login`

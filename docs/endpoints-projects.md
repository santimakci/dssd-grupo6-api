## Endpoints de Proyectos

Base URL (desarrollo): `http://localhost:3000/api/v1`

### POST `/projects`

- **Descripción**: Inicia en Bonita el proceso "Proceso de creación de proyecto" y setea variables del caso con los campos enviados en el body.
- **Headers**:
  - `Content-Type: application/json`
  - `Authorization: Bearer <JWT>` (si se requiere autenticación global; actualmente este endpoint no tiene guard específico)
- **Body** (JSON): libre según variables del proceso. Ejemplo:

```json
{
  "ongName": "Proyecto A",
  "budget": 15000,
  "active": true
}
```

- Las claves y valores del body se transforman a tipos de Bonita automáticamente:

  - `string` → `java.lang.String`
  - `number` → `java.lang.Double`
  - `boolean` → `java.lang.Boolean`
  - `date` → `java.util.Date`
  - `array` → `java.util.List`
  - `object` → `java.util.Map`

- **Respuesta 200** (JSON):

```json
{
  "message": "Bonita process initiated"
}
```

- **Errores (400)**:

  - `Bonita process not found`
  - `Error setting process variables: <detalle>`
  - `Unknown error occurred` (o mensaje propagado desde Bonita)

- **cURL**:

```bash
curl -sS -X POST \
  "http://localhost:3000/api/v1/projects" \
  -H "Content-Type: application/json" \
  -d '{
    "ongName": "Proyecto A",
    "budget": 15000,
    "active": true
  }'
```

---

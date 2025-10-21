# Endpoints de Tasks (Tareas)

Base URL (desarrollo): `http://localhost:3000/api/v1`

---

## GET `/tasks`

- **Descripción**: Obtiene una lista paginada de tareas desde Bonita BPM. Este endpoint se conecta automáticamente a Bonita utilizando las credenciales del administrador configuradas en las variables de entorno y retorna las tareas disponibles con información de proyectos y ONGs asociadas.

- **Autenticación**: Requiere Bearer Token (JWT)

- **Headers**:

  ```
  Authorization: Bearer <token-jwt>
  Content-Type: application/json
  ```

- **Query Parameters** (todos opcionales):
  | Parámetro | Tipo | Default | Descripción |
  |-----------|------|---------|-------------|
  | `page` | number | 0 | Número de página (empieza en 0) |
  | `limit` | number | 10 | Cantidad de resultados por página |
  | `search` | string | null | Término de búsqueda (actualmente no implementado en el backend) |

---

### Ejemplo de Request

#### Usando cURL

```bash
# Listar tareas (primera página, 10 elementos)
curl -X GET \
  "http://localhost:3000/api/v1/tasks" \
  -H "Authorization: Bearer <tu-token-jwt>"
```

```bash
# Listar tareas con paginación personalizada
curl -X GET \
  "http://localhost:3000/api/v1/tasks?page=1&limit=20" \
  -H "Authorization: Bearer <tu-token-jwt>"
```

```bash
# Listar con parámetro de búsqueda
curl -X GET \
  "http://localhost:3000/api/v1/tasks?page=0&limit=10&search=desarrollo" \
  -H "Authorization: Bearer <tu-token-jwt>"
```

#### Usando JavaScript (fetch)

```javascript
const token = 'tu-token-jwt';

// Request simple
fetch('http://localhost:3000/api/v1/tasks', {
  method: 'GET',
  headers: {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  },
})
  .then((response) => response.json())
  .then((data) => console.log(data))
  .catch((error) => console.error('Error:', error));
```

```javascript
// Request con paginación
const page = 1;
const limit = 20;

fetch(`http://localhost:3000/api/v1/tasks?page=${page}&limit=${limit}`, {
  method: 'GET',
  headers: {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  },
})
  .then((response) => response.json())
  .then((data) => {
    console.log(`Total de tareas: ${data.total}`);
    console.log(`Página actual: ${data.page}`);
    console.log(`Tareas:`, data.data);
  })
  .catch((error) => console.error('Error:', error));
```

#### Usando Axios

```javascript
import axios from 'axios';

const token = 'tu-token-jwt';

// Request con axios
axios
  .get('http://localhost:3000/api/v1/tasks', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    params: {
      page: 0,
      limit: 10,
      search: 'desarrollo',
    },
  })
  .then((response) => {
    console.log('Tareas:', response.data);
  })
  .catch((error) => {
    console.error('Error:', error.response?.data || error.message);
  });
```

#### Usando Python (requests)

```python
import requests

token = 'tu-token-jwt'
headers = {
    'Authorization': f'Bearer {token}',
    'Content-Type': 'application/json'
}

# Request simple
response = requests.get(
    'http://localhost:3000/api/v1/tasks',
    headers=headers
)

if response.status_code == 200:
    data = response.json()
    print(f"Total de tareas: {data['total']}")
    for task in data['data']:
        print(f"- {task['name']} (Proyecto: {task['projectName']})")
else:
    print(f"Error: {response.status_code}")
    print(response.text)
```

```python
# Request con paginación
params = {
    'page': 1,
    'limit': 20,
    'search': 'desarrollo'
}

response = requests.get(
    'http://localhost:3000/api/v1/tasks',
    headers=headers,
    params=params
)

data = response.json()
```

---

### Respuesta Exitosa (200 OK)

```json
{
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "createdAt": "2025-10-15T10:30:00.000Z",
      "updatedAt": "2025-10-20T14:22:00.000Z",
      "deletedAt": null,
      "createdById": null,
      "updatedById": null,
      "deletedById": null,
      "isActive": true,
      "name": "Desarrollo de módulo de autenticación",
      "description": "Implementar sistema de login y registro con JWT",
      "projectName": "Sistema de Gestión Escolar",
      "ongName": "ONG Educación Para Todos",
      "isTaken": false,
      "startDate": "2025-10-15T00:00:00.000Z",
      "endDate": "2025-11-15T00:00:00.000Z"
    },
    {
      "id": "660e8400-e29b-41d4-a716-446655440001",
      "createdAt": "2025-10-16T08:15:00.000Z",
      "updatedAt": "2025-10-16T08:15:00.000Z",
      "deletedAt": null,
      "createdById": null,
      "updatedById": null,
      "deletedById": null,
      "isActive": true,
      "name": "Diseño de base de datos",
      "description": "Modelar y crear esquema de base de datos PostgreSQL",
      "projectName": "Sistema de Inventario",
      "ongName": "Fundación Ayuda Comunitaria",
      "isTaken": true,
      "startDate": "2025-10-16T00:00:00.000Z",
      "endDate": "2025-10-30T00:00:00.000Z"
    }
  ],
  "total": 45,
  "page": 0,
  "limit": 10
}
```

### Estructura de la Respuesta

| Campo   | Tipo   | Descripción                        |
| ------- | ------ | ---------------------------------- |
| `data`  | Array  | Lista de tareas                    |
| `total` | number | Número total de tareas disponibles |
| `page`  | number | Página actual (empieza en 0)       |
| `limit` | number | Cantidad de resultados por página  |

### Estructura de cada Task (Tarea)

| Campo         | Tipo              | Descripción                                      |
| ------------- | ----------------- | ------------------------------------------------ |
| `id`          | string (UUID)     | Identificador único de la tarea                  |
| `createdAt`   | string (ISO 8601) | Fecha y hora de creación                         |
| `updatedAt`   | string (ISO 8601) | Fecha y hora de última actualización             |
| `deletedAt`   | string\|null      | Fecha de eliminación (null si no está eliminada) |
| `createdById` | string\|null      | ID del usuario que creó la tarea                 |
| `updatedById` | string\|null      | ID del usuario que actualizó la tarea            |
| `deletedById` | string\|null      | ID del usuario que eliminó la tarea              |
| `isActive`    | boolean           | Indica si la tarea está activa                   |
| `name`        | string            | Nombre de la tarea                               |
| `description` | string            | Descripción detallada de la tarea                |
| `projectName` | string            | Nombre del proyecto al que pertenece             |
| `ongName`     | string            | Nombre de la ONG asociada al proyecto            |
| `isTaken`     | boolean           | Indica si la tarea ya fue tomada por alguien     |
| `startDate`   | string (ISO 8601) | Fecha de inicio de la tarea                      |
| `endDate`     | string (ISO 8601) | Fecha de finalización de la tarea                |

---

### Errores Posibles

#### 401 Unauthorized

```json
{
  "statusCode": 401,
  "message": "Unauthorized"
}
```

**Causa**: No se proporcionó un token JWT válido o el token expiró.

**Solución**: Asegúrate de incluir el header `Authorization: Bearer <token>` con un token válido obtenido del endpoint de login.

---

#### 500 Internal Server Error

```json
{
  "statusCode": 500,
  "message": "Internal server error"
}
```

**Causas posibles**:

- Bonita BPM no está disponible
- Error de conexión con Bonita
- Credenciales de administrador incorrectas en `.env`

**Solución**:

1. Verificar que Bonita esté ejecutándose
2. Revisar las variables de entorno `ADMIN_CLOUD_EMAIL` y `ADMIN_CLOUD_PASSWORD`
3. Verificar la conectividad con `BONITA_API_URL`

---

## Notas Importantes

### Autenticación

- Este endpoint **requiere autenticación** mediante Bearer Token (JWT)
- Primero debes autenticarte usando el endpoint `/auth/admin/login` o `/auth/login`
- El token debe incluirse en el header `Authorization` de cada request

### Credenciales de Bonita

El endpoint utiliza automáticamente las credenciales configuradas en las variables de entorno:

```env
ADMIN_CLOUD_EMAIL=admin@example.com
ADMIN_CLOUD_PASSWORD=tu-contraseña-segura
```

### Paginación

- La paginación empieza en `page=0` (primera página)
- Por defecto devuelve 10 resultados por página
- Usa `limit` para controlar cuántos resultados obtienes por página
- El campo `total` te indica el total de tareas disponibles

### Integración con Bonita

- Este endpoint se conecta directamente a Bonita BPM
- Utiliza la extensión REST de Bonita: `/API/extension/projects`
- Requiere que Bonita esté configurado y ejecutándose

---

## Flujo Completo de Ejemplo

```bash
# 1. Primero, obtener el token JWT
TOKEN=$(curl -sS -X POST \
  "http://localhost:3000/api/v1/auth/admin/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@ejemplo.com","password":"tu-contraseña"}' \
  | jq -r '.token')

# 2. Luego, listar las tareas
curl -X GET \
  "http://localhost:3000/api/v1/tasks?page=0&limit=10" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  | jq '.'
```

### Con Python

```python
import requests

# 1. Login
login_response = requests.post(
    'http://localhost:3000/api/v1/auth/admin/login',
    json={
        'email': 'admin@ejemplo.com',
        'password': 'tu-contraseña'
    }
)
token = login_response.json()['token']

# 2. Obtener tareas
headers = {
    'Authorization': f'Bearer {token}',
    'Content-Type': 'application/json'
}

tasks_response = requests.get(
    'http://localhost:3000/api/v1/tasks',
    headers=headers,
    params={'page': 0, 'limit': 10}
)

tasks_data = tasks_response.json()
print(f"Total de tareas: {tasks_data['total']}")

for task in tasks_data['data']:
    status = "Tomada" if task['isTaken'] else "Disponible"
    print(f"\nTarea: {task['name']}")
    print(f"Proyecto: {task['projectName']}")
    print(f"ONG: {task['ongName']}")
    print(f"Estado: {status}")
    print(f"Fecha inicio: {task['startDate']}")
    print(f"Fecha fin: {task['endDate']}")
```

---

## Swagger UI

También puedes probar este endpoint interactivamente usando Swagger UI:

```
http://localhost:3000/api/docs
```

1. Haz clic en el endpoint `/tasks`
2. Haz clic en "Try it out"
3. Ingresa el token JWT en el campo de autenticación (🔒 Authorize)
4. Configura los parámetros de paginación
5. Haz clic en "Execute"

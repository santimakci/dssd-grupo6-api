## Endpoints de Autenticación

Base URL (desarrollo): `http://localhost:3000`

### POST `/auth/admin/login`

- **Descripción**: Autentica un usuario administrador y devuelve un JWT más los datos básicos del usuario.
- **Headers**:
  - `Content-Type: application/json`
- **Body** (JSON):
  ```json
  {
    "email": "admin@ejemplo.com",
    "password": "tu-contraseña"
  }
  ```
- **Respuesta 200** (JSON):
  ```json
  {
    "token": "<JWT>",
    "user": {
      "email": "admin@ejemplo.com",
      "firstName": "Admin",
      "id": "<uuid>",
      "lastName": "User",
      "roles": ["ADMIN"]
    }
  }
  ```
- **Errores (400)**:

  - `User not found`
  - `Invalid password or user`
  - `User is not admin`

- **cURL**:
  ```bash
  curl -sS -X POST \
    "http://localhost:3000/auth/admin/login" \
    -H "Content-Type: application/json" \
    -d '{"email":"admin@ejemplo.com","password":"tu-contraseña"}'
  ```

---

### POST `/auth/bonita/login`

- **Descripción**: Inicia sesión contra Bonita BPM y devuelve las cookies de sesión (`Set-Cookie`) que expone Bonita. Úsalas en llamadas posteriores a la API de Bonita.
- **Headers**:
  - `Content-Type: application/json`
- **Body** (JSON):

  ```json
  {
    "email": "usuario@ejemplo.com",
    "password": "tu-contraseña"
  }
  ```

  Nota: Actualmente el backend utiliza las credenciales configuradas por variables de entorno (`BONITA_API_USERNAME`/`BONITA_API_PASSWORD`) e ignora las del body.

- **Respuesta 200** (JSON):

  ```json
  [
    "JSESSIONID=<valor>; Path=/bonita; HttpOnly",
    "X-Bonita-API-Token=<valor>; Path=/bonita; HttpOnly"
  ]
  ```

  Puede variar según la versión/configuración de Bonita. En caso de error, el servidor registra el detalle y la respuesta puede ser `null`.

- **cURL**:
  ```bash
  curl -sS -X POST \
    "http://localhost:3000/auth/bonita/login" \
    -H "Content-Type: application/json" \
    -d '{"email":"usuario@ejemplo.com","password":"tu-contraseña"}'
  ```

---

### Notas y variables de entorno

- Para JWT (login admin):
  - `JWT_SECRET` (obligatoria)
  - `JWT_EXPIRES_IN` (opcional)
- Para Bonita:
  - `BONITA_API_URL` (por ejemplo: `http://localhost:8080/bonita`)
  - `BONITA_API_USERNAME`
  - `BONITA_API_PASSWORD`

Asegúrate de definirlas en el archivo `.env` del proyecto antes de levantar el servicio.

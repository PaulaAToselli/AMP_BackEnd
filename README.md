# AMPARAR API

Backend del **Registro Único de Casos** — AMPARAR SRL.

Unifica datos de pacientes, autorizaciones, prestadores y servicios actualmente dispersos entre Intersoftic, Shama, WhatsApp y Google Sheets.

---

## Stack

| | |
|---|---|
| Runtime | Node.js |
| Framework | NestJS 11 |
| ORM | TypeORM |
| Base de datos | PostgreSQL 16 |
| Auth | JWT (access token 15m + refresh token 7d) |
| Documentación | Swagger / OpenAPI 3.0 |

---

## Requisitos

- Node.js >= 20
- PostgreSQL 16
- npm

---

## Setup local

### 1. Instalar dependencias

```bash
npm install
```

### 2. Variables de entorno

Copiar `.env` y completar los valores:

```bash
cp .env .env.local
```

```env
PORT=3000
NODE_ENV=development

DB_HOST=localhost
DB_PORT=5432
DB_NAME=amparar
DB_USER=postgres
DB_PASS=postgres

JWT_SECRET=change_me_in_production
JWT_EXPIRES_IN=15m
JWT_REFRESH_SECRET=change_me_refresh_in_production
JWT_REFRESH_EXPIRES_IN=7d

INTERSOFTIC_API_URL=https://api.intersoftic.com
INTERSOFTIC_API_KEY=

SYNC_CRON_INTERVAL=0 * * * *
```

### 3. Base de datos con Docker

```bash
docker run -d \
  --name amparar-postgres \
  -e POSTGRES_DB=amparar \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=postgres \
  -p 5432:5432 \
  postgres:16-alpine
```

### 4. Levantar en modo desarrollo

```bash
npm run start:dev
```

El servidor queda en `http://localhost:3000`.

En modo `development`, TypeORM sincroniza el schema automáticamente (`synchronize: true`). **No usar en producción.**

---

## Documentación interactiva

Con la app corriendo, abrir:

```
http://localhost:3000/docs
```

Para autenticar desde Swagger:
1. Hacer `POST /auth/login` con email y password
2. Copiar el `accessToken` de la respuesta
3. Click en **Authorize** (arriba a la derecha) y pegarlo

---

## Scripts

```bash
npm run start:dev      # desarrollo con hot-reload
npm run start:prod     # producción (requiere build previo)
npm run build          # compilar a dist/
npm run test           # tests unitarios
npm run test:cov       # cobertura
npm run lint           # lint
```

---

## Módulos

| Módulo | Ruta base | Descripción |
|---|---|---|
| auth | `/auth` | Login, refresh token, logout |
| users | `/users` | CRUD de usuarios internos (solo ADMIN) |
| patients | `/patients` | Pacientes — fuente primaria: Intersoftic |
| authorizations | `/authorizations` | Autorizaciones de Obra Social |
| providers | `/providers` | Prestadores (enfermeros, kinesiólogos, etc.) |
| services | `/services` | Servicios / Turnos + marcación de coordinador |
| sync | `/sync` | CronJobs y trigger manual de sincronización con Intersoftic |
| dashboard | `/dashboard` | KPIs de operación |

---

## Roles

| Rol | Acceso |
|---|---|
| `ADMIN` | Todo, incluyendo gestión de usuarios y sync |
| `COORDINACION` | Lectura/escritura en servicios y prestadores, marcación manual |
| `USER` | Lectura/escritura en pacientes y autorizaciones |

Todas las rutas requieren JWT salvo `POST /auth/login` y `POST /auth/refresh`.

---

## Autenticación

```
POST /auth/login      { email, password }  →  { accessToken, refreshToken }
POST /auth/refresh    { refreshToken }     →  { accessToken, refreshToken }
POST /auth/logout                          →  204
```

Los tokens se envían en el header:

```
Authorization: Bearer <accessToken>
```

El refresh token se guarda hasheado en la columna `refresh_token_hash` de la tabla `users`. Al hacer logout se invalida seteándolo a `null`.

---

## Sincronización con Intersoftic

Los CronJobs corren cada hora (configurable con `SYNC_CRON_INTERVAL`) y hacen upsert por `intersofticId` en las tablas de pacientes, prestadores, autorizaciones y servicios.

- Registros sin `intersofticId` (creados manualmente) no son tocados por el sync.
- Las autorizaciones vencidas solo generan alerta en logs — no dan de baja servicios automáticamente.
- Para disparar una sincronización manual: `POST /sync/trigger/:entity` (requiere rol ADMIN).
- El historial de ejecuciones está en `GET /sync/logs`.

**Estado actual:** el cliente de Intersoftic (`IntersofticClient`) es un stub. Los métodos retornan arrays vacíos hasta que se documenten los endpoints reales de la API externa.

---

## Estructura del proyecto

```
src/
├── auth/                  # JWT, estrategia Passport, login/refresh/logout
├── users/                 # CRUD usuarios internos
├── patients/              # CRUD pacientes + filtros
├── authorizations/        # CRUD autorizaciones + alertas de vencimiento
├── providers/             # CRUD prestadores + filtros por especialidad/zona
├── services/              # CRUD servicios + endpoint de marcación (/checkin)
├── sync/                  # CronJobs + IntersofticClient stub + SyncLog
├── dashboard/             # KPIs agregados (read-only)
├── common/
│   ├── decorators/        # @Public(), @Roles()
│   ├── guards/            # JwtAuthGuard, RolesGuard
│   ├── filters/           # HttpExceptionFilter, AllExceptionsFilter
│   ├── interceptors/      # ResponseInterceptor ({ data, meta? })
│   └── dto/               # PaginationDto
└── config/
    └── env.validation.ts  # Validación de variables de entorno con Joi
```

---

## Convenciones

- Respuestas envueltas en `{ data }` via `ResponseInterceptor` global
- Paginación: `?page=1&limit=20` → `{ data: { items, total, page, limit } }`
- Errores: `{ statusCode, message, path, timestamp }` — sin stack en producción
- Columnas DB en `snake_case`, propiedades TypeScript en `camelCase`
- Todos los DTOs con `class-validator`

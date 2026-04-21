# CLAUDE.md — AMPARAR Backend

> Guía de contexto para Claude. Leer completo antes de tocar cualquier archivo.

---

## Contexto del proyecto

**Cliente:** AMPARAR SRL — empresa de atención médica domiciliaria.

**Sistema:** Backend API para el "Registro Único de Casos". Unifica datos hoy dispersos entre Intersoftic (sistema externo), Shama, WhatsApp y Google Sheets.

**Stack:**
- Runtime: Node.js
- Framework: NestJS (iniciado con CLI oficial)
- ORM: TypeORM
- Base de datos: PostgreSQL
- Auth: JWT (access token + refresh token)
- Sincronización externa: CronJobs que consumen la API de Intersoftic

---

## Dominio del negocio

AMPARAR coordina prestaciones médicas domiciliarias. El flujo central es:

1. Un **Paciente** tiene una **Autorización de Obra Social** que habilita prestaciones.
2. A cada prestación se le asigna un **Prestador** (enfermero, kinesiólogo, etc.).
3. Cada visita genera un **Servicio/Turno** que debe ser marcado en app para poder facturar.
4. Si el Prestador no marca, el **Coordinador** (rol COORDINACION) lo hace manualmente.

---

## Modelo de datos

### Entidad: `Patient` (Paciente)

Fuente primaria: Intersoftic. Sincronizada vía CronJob.

| Campo | Tipo | Notas |
|---|---|---|
| `id` | uuid | PK, generado localmente |
| `intersofticId` | string | ID en Intersoftic, único, index |
| `firstName` | string | Separado del apellido (campo nuevo v2) |
| `lastName` | string | Campo nuevo v2 |
| `dni` | string | Único, no puede ser null |
| `affiliateNumber` | string | Requerido para facturación |
| `birthDate` | date | |
| `address` | string | |
| `locality` | string | Campo nuevo v2 — clave para asignación geográfica |
| `geoLocation` | string | Coordenadas provistas por Intersoftic |
| `obraSocial` | string | Determina aranceles y ciclo de facturación |
| `cieDiagnosis` | string | Código CIE-10 |
| `complexity` | enum | `JUDICIAL \| 24HS \| PALIATIVO \| ESTANDAR` — campo nuevo v2 |
| `familyContact` | string \| null | Tel/texto. Crítico para emergencias |
| `treatingDoctor` | string \| null | A confirmar si se usa |
| `intakeChannel` | enum | `INTERSOFTIC \| SHAMA \| WHATSAPP \| SHEETS \| PORTAL_OS` |
| `observations` | text \| null | |
| `isActive` | boolean | default true |
| `createdAt` | timestamp | |
| `updatedAt` | timestamp | |

### Entidad: `Authorization` (Autorización OS)

Fuente primaria: Intersoftic.

| Campo | Tipo | Notas |
|---|---|---|
| `id` | uuid | PK |
| `intersofticId` | string | Único |
| `patientId` | uuid | FK → Patient |
| `authorizationNumber` | string | Identificador único de OS |
| `obraSocial` | string | Puede diferir del OS del paciente (ej: PAMI/Estado) |
| `osDelegacion` | string | Campo nuevo v2 — distintas reglas por delegación |
| `startDate` | date | |
| `expirationDate` | date | CRÍTICO: si vence, no es facturable |
| `autoCancel` | boolean | Si al vencer se cancela el servicio automáticamente |
| `monthlyLimit` | number \| null | Tope mensual de prestaciones |
| `paymentCondition` | string \| null | A confirmar con Administración |
| `pdfUrl` | string \| null | **Por ahora ignorado** — campo reservado para futura integración con S3. El endpoint acepta el campo pero no procesa el archivo. |
| `observations` | text \| null | |
| `createdAt` | timestamp | |
| `updatedAt` | timestamp | |

### Entidad: `Provider` (Prestador)

Fuente primaria: Intersoftic (sync vía CronJob), pero también se pueden crear y editar manualmente desde el sistema. El sync hace upsert por `intersofticId` — los creados manualmente (sin `intersofticId`) no son tocados por el cron.

| Campo | Tipo | Notas |
|---|---|---|
| `id` | uuid | PK |
| `intersofticId` | string | Único |
| `fullName` | string | Apellido y nombre |
| `phone` | string | Principal canal de contacto |
| `specialty` | enum | `ENFERMERIA \| KINESIOLOGIA \| CUIDADOR \| ACOMPANANTE_TERAPEUTICO \| OTRO` |
| `coverageZone` | string | Zona/radio de cobertura |
| `distanceToPatient` | number \| null | km, calculado por Intersoftic |
| `availability` | string \| null | "Muy volátil" según Gama — informativo |
| `isActive` | boolean | Solo activos aparecen en búsquedas |
| `currentWorkload` | number \| null | N° de casos activos |
| `complianceRate` | number \| null | % cumplimiento, calculado por Intersoftic |
| `hadPriorRelationship` | boolean \| null | Si ya fue asignado a este paciente antes |
| `agreedFee` | number \| null | Honorario — validar con Administración |
| `osValue` | number \| null | Lo que paga la OS |
| `profitability` | number \| null | % rentabilidad calculado |
| `createdAt` | timestamp | |
| `updatedAt` | timestamp | |

### Entidad: `Service` (Servicio / Turno)

Core operativo del sistema. Mezcla de Intersoftic + datos propios.

| Campo | Tipo | Notas |
|---|---|---|
| `id` | uuid | PK |
| `intersofticId` | string \| null | Null si fue creado manualmente en el sistema |
| `prestationNumber` | string | N° generado por Intersoftic |
| `patientId` | uuid | FK → Patient |
| `providerId` | uuid | FK → Provider |
| `authorizationId` | uuid \| null | FK → Authorization |
| `serviceDate` | date | |
| `prestationType` | enum | `GENERADAS \| PAMIID \| ID_ADULTO \| ID_PEDIATRICO \| ANULADAS \| EN_SEGUIMIENTO` |
| `assignedSpecialty` | string | Ej: "Enfermería 14 visitas semanales" |
| `shift` | string | Ej: "2 x día de lunes a domingo" |
| `status` | enum | `PENDIENTE \| CUMPLIDO \| NO_CUMPLIDO \| EN_GESTION \| RESUELTO \| CRITICO` |
| `terminationReason` | enum \| null | `ALTA \| CAMBIO_EMPRESA \| CAMBIO_MODULO \| FINALIZADO_OS \| OBITO \| OTROS` |
| `billable` | boolean | Se activa cuando el prestador marca en app |
| `appCheckedIn` | boolean | Si el prestador marcó en la app |
| `checkinTime` | timestamp \| null | |
| `checkoutTime` | timestamp \| null | |
| `coordinatorCheckedIn` | boolean | Si el coordinador marcó manualmente |
| `intakeChannel` | enum | `INTERSOFTIC \| SHAMA \| WHATSAPP \| SHEETS \| PORTAL_OS` |
| `requestOrigin` | enum | `ADMISION \| VENTAS \| OS \| RENOVACION` |
| `nonComplianceReason` | text \| null | |
| `coordinatorAction` | text \| null | Acción tomada por coordinador |
| `geoLocation` | string \| null | Coordenadas GPS del prestador al marcar |
| `evidencePhoto` | boolean | Si hay foto adjunta |
| `checkinLatencyHours` | number \| null | KPI: tiempo entre servicio y marcación |
| `createdAt` | timestamp | |
| `updatedAt` | timestamp | |

### Entidad: `User` (Usuario del sistema)

Solo para el equipo interno — NO prestadores.

| Campo | Tipo | Notas |
|---|---|---|
| `id` | uuid | PK |
| `email` | string | Único |
| `passwordHash` | string | bcrypt |
| `firstName` | string | |
| `lastName` | string | |
| `role` | enum | `ADMIN \| COORDINACION \| USER` |
| `isActive` | boolean | |
| `createdAt` | timestamp | |
| `updatedAt` | timestamp | |

---

## Roles y permisos

| Rol | Descripción | Acceso |
|---|---|---|
| `ADMIN` | Administración total | Todo — incluyendo gestión de usuarios |
| `COORDINACION` | Gama y equipo de coordinación | Lectura/escritura en Servicios, Prestadores. Puede marcar manualmente |
| `USER` | Admisión (Jordi, Juli) y Ventas | Lectura/escritura en Pacientes y Autorizaciones |

Implementar con `@Roles()` decorator + `RolesGuard`.

---

## Módulos NestJS

```
src/
├── auth/                  # JWT login, refresh token, guards, decorators
├── users/                 # CRUD usuarios (solo ADMIN)
├── patients/              # CRUD + búsqueda + listado
├── authorizations/        # CRUD + alertas de vencimiento
├── providers/             # CRUD + búsqueda por zona/especialidad
├── services/              # CRUD + marcación + incumplimientos
├── sync/                  # CronJobs que consumen Intersoftic API
├── dashboard/             # KPIs agregados (read-only)
└── common/                # Guards, decorators, pipes, filtros de error
```

---

## Auth — Flujo JWT

- `POST /auth/login` → recibe `{ email, password }` → retorna `{ accessToken, refreshToken }`
- Access token: duración corta (15 min)
- Refresh token: duración larga (7 días), guardado en DB con hash
- `POST /auth/refresh` → renueva access token
- `POST /auth/logout` → invalida refresh token
- Usar `@nestjs/jwt` + `passport-jwt`
- Guard global `JwtAuthGuard` en `AppModule`, con `@Public()` decorator para rutas abiertas

---

## Sincronización con Intersoftic (CronJob)

- Usar `@nestjs/schedule`
- Un CronJob por entidad: `SyncPatientsJob`, `SyncProvidersJob`, `SyncAuthorizationsJob`, `SyncServicesJob`
- Lógica: upsert por `intersofticId` (crear si no existe, actualizar si cambió)
- Registrar cada ejecución en tabla `SyncLog` con: entidad, timestamp, registros procesados, errores
- Los servicios creados manualmente en el sistema (sin `intersofticId`) no deben ser sobreescritos
- Los prestadores creados manualmente (sin `intersofticId`) tampoco deben ser tocados por el sync
- Cuando una Autorización vence (con o sin `autoCancel`): **solo genera alerta**, no da de baja automáticamente — comportamiento a expandir en fases futuras
- Frecuencia inicial: cada 1 hora (configurable por env)

---

## Endpoints principales (referencia)

```
# Auth
POST   /auth/login
POST   /auth/refresh
POST   /auth/logout

# Users (ADMIN only)
GET    /users
POST   /users
PATCH  /users/:id
DELETE /users/:id

# Patients
GET    /patients              # listado + filtros (OS, complejidad, localidad)
GET    /patients/:id
POST   /patients              # creación manual (Admisión)
PATCH  /patients/:id

# Authorizations
GET    /authorizations        # filtros: paciente, OS, vencidas, por vencer
GET    /authorizations/:id
POST   /authorizations
PATCH  /authorizations/:id

# Providers
GET    /providers             # filtros: especialidad, zona, activos
GET    /providers/:id
POST   /providers             # creación manual
PATCH  /providers/:id

# Services
GET    /services              # filtros: fecha, estado, prestador, paciente
GET    /services/:id
POST   /services              # creación manual (Coordinación)
PATCH  /services/:id
PATCH  /services/:id/checkin  # marcación por coordinador

# Dashboard
GET    /dashboard/kpis        # KPIs: pacientes activos, críticos sin cobertura, etc.

# Sync (ADMIN only o interno)
POST   /sync/trigger/:entity  # disparo manual de sync
GET    /sync/logs             # historial de sincronizaciones
```

---

## Convenciones de código

- **DTOs**: siempre con `class-validator` (`@IsString()`, `@IsEnum()`, etc.)
- **Respuestas**: usar `ResponseInterceptor` global que wrappea en `{ data, meta? }`
- **Errores**: `HttpExceptionFilter` global, nunca exponer stack en producción
- **Naming**: camelCase en TypeScript/JS, snake_case en columnas DB (`@Column({ name: 'first_name' })`)
- **Migrations**: usar TypeORM migrations, **nunca** `synchronize: true` en producción
- **Env vars**: todo sensible va en `.env`, validado con `@nestjs/config` + Joi schema
- **Paginación**: query params `?page=1&limit=20`, respuesta con `{ data, total, page, limit }`

---

## Variables de entorno requeridas

```env
# App
PORT=3000
NODE_ENV=development

# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=amparar
DB_USER=
DB_PASS=

# JWT
JWT_SECRET=
JWT_EXPIRES_IN=15m
JWT_REFRESH_SECRET=
JWT_REFRESH_EXPIRES_IN=7d

# Intersoftic API
INTERSOFTIC_API_URL=
INTERSOFTIC_API_KEY=

# Sync
SYNC_CRON_INTERVAL=0 * * * *
```

---

## Estado actual del proyecto

- [ ] Proyecto NestJS iniciado con CLI
- [ ] Módulo `auth` con JWT
- [ ] Módulo `users`
- [ ] Módulo `patients`
- [ ] Módulo `authorizations`
- [ ] Módulo `providers`
- [ ] Módulo `services`
- [ ] Módulo `sync` con CronJobs
- [ ] Módulo `dashboard`
- [ ] Migrations iniciales
- [ ] Tests unitarios en auth

---

## Lo que NO hace este backend (por ahora)

- No maneja la app del prestador (marcación GPS, fotos) — eso es un sistema separado
- No gestiona facturación — solo marca si un servicio es facturable
- No envía notificaciones push (queda para una segunda fase)
- No sube archivos PDF — el campo `pdfUrl` en Authorization está reservado, integración con S3 es trabajo futuro
- No da de baja automática servicios al vencer una autorización — por ahora solo alerta

# Wedding Marketplace

Plataforma web para organizar bodas sin contratar una organizadora: catálogo de salones, catering y servicios, con reservas y pagos online. El negocio cobra una comisión por reserva, menor al costo de una wedding planner tradicional.

## Decisiones de arquitectura

### ¿Por qué frontend y backend separados?

- **Orden**: dominios claros. El backend es testeable de forma aislada y el frontend queda desacoplado.
- **Escala futura**: el mismo backend puede servir a una app móvil sin cambios.
- **Experiencia del equipo**: la lógica de negocio (reservas, disponibilidad, pagos) se escribe en Python, lenguaje que el equipo domina, reduciendo bugs en el core del negocio.

Nota honesta: la separación NO da seguridad "gratis" por sí sola. La seguridad real viene de autenticación bien hecha, validación de inputs, permisos por rol y secrets fuera del repo. La separación incluso agrega superficie a cuidar (CORS, tokens entre servicios), pero los beneficios de orden y escala lo justifican.

### ¿Por qué Next.js para el frontend (y no React puro)?

- **SEO crítico**: el negocio vive de búsquedas tipo "salón de fiestas en X zona". Next.js renderiza en servidor (SSR), por lo que Google indexa todo el catálogo. Una SPA de React puro indexa mal.
- **UI moderna rápida**: React + Tailwind + ecosistema de componentes. Para bodas, la estética vende.
- El SSR llama a la API de FastAPI desde el servidor de Next, así el SEO no se pierde por tener el backend separado.

### ¿Por qué FastAPI para el backend (y no C# / Django)?

- **Python ya dominado por el equipo** con patrones y tooling frescos; C# implicaría arrancar un ecosistema de cero (ambos son técnicamente sólidos).
- **OpenAPI automático**: FastAPI genera la spec de la API sola, lo que permite generar tipos TypeScript para el frontend y evitar duplicación de contratos.
- **Async nativo**: bueno para I/O intensivo (DB, pagos, notificaciones).
- Django quedó descartado: su fuerte (templates + admin) no aplica si el frontend es Next.js.

### Stack

| Capa | Tecnología | Motivo |
|------|-----------|--------|
| Frontend | Next.js 15 (App Router, TypeScript, Tailwind) | SSR/SEO, velocidad de desarrollo |
| Backend | FastAPI (Python 3.12) | OpenAPI, async, dominio del equipo |
| Base de datos | PostgreSQL | Transacciones robustas para reservas/pagos |
| Auth | JWT emitido por el backend | Estándar, sirve para web y móvil |
| Pagos | Mercado Pago (planificado) | Mercado argentino |

## Estructura del repositorio

```
wedding-marketplace/
├── frontend/   # Next.js 15 — catálogo, checkout, panel proveedores (UI)
├── backend/    # FastAPI — lógica de negocio, DB, auth, pagos
└── README.md   # Este archivo: decisiones + historial
```

### Estructura del backend

```
backend/
├── app/
│   ├── api/           # Routers (capa HTTP, thin)
│   ├── core/          # Config, seguridad, constantes
│   ├── models/        # Modelos de DB
│   ├── schemas/       # Schemas Pydantic (request/response)
│   ├── services/      # Lógica de negocio
│   ├── repositories/  # Acceso a datos
│   ├── db/            # Conexión y base
│   └── main.py        # Entry point
├── migrations/        # SQL de migraciones
└── tests/
```

Principios aplicados: KISS, YAGNI, SOLID, separación de capas (routes → services → repositories), guard clauses, sin valores hardcodeados (todo en config), nombres de variables en inglés.

## Modelo de datos (MVP)

- `users` — clientes y proveedores (rol)
- `providers` — perfil de proveedor (salón, catering, foto, música)
- `venues` — salones: capacidad, ciudad, dirección, precio, seña, fotos
- `services` — catering y otros servicios contratables
- `bookings` — reservas (estado: pending, deposit_paid, confirmed, cancelled)
- `payments` — pagos/señas y comisión de la plataforma (`platform_fee`)

Decisión (KISS): no hay tabla `availability` separada. La disponibilidad de un salón en una fecha se deriva de las reservas activas: un índice único parcial en `bookings(venue_id, event_date)` para estados `deposit_paid`/`confirmed` garantiza a nivel base de datos que no haya doble reserva.

Migraciones: SQL plano en `backend/migrations/`, se aplican con `psql -d DATABASE_URL -f migrations/001_initial_schema.sql`.

## Alcance del MVP

1. Catálogo + reserva de salones por fecha (con seña)
2. Catering y servicios contratables
3. Pagos online (Mercado Pago)
4. Panel de proveedores (cargar oferta, gestionar reservas)

## Cómo correr (desarrollo)

### Backend
```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env   # completar valores
psql -d wedding_marketplace -f migrations/001_initial_schema.sql
uvicorn app.main:create_app --factory --reload
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

## Historial de desarrollo

### 2026-06-10 — Inicio del proyecto
- Análisis de stack: Next.js fullstack vs Python vs C#. Decisión final: front/back separados (Next.js + FastAPI). Razones arriba.
- Scaffold del frontend con `create-next-app` (TypeScript, Tailwind, App Router, src dir).
- Backend FastAPI en capas: `api` (routers thin) → `services` (lógica de negocio) → `repositories` (acceso a datos). Inyección de dependencias vía `Depends` de FastAPI (`app/api/dependencies.py`).
- Config con `pydantic-settings` (`app/core/config.py`): todo valor configurable sale de `.env`, nada hardcodeado.
- App factory (`create_app` en `app/main.py`, se corre con `--factory`): sin estado a nivel de módulo.
- Modelos SQLAlchemy 2.0 async (`app/models/entities.py`) + migración SQL inicial (`migrations/001_initial_schema.sql`).
- Primer endpoint funcional: catálogo de salones — `GET /api/venues` (filtros: city, min_capacity, paginación) y `GET /api/venues/{id}`. Más `GET /api/health`.
- Verificado: la app construye y registra las rutas correctamente.

**Cómo funciona el flujo de un request** (ejemplo `GET /api/venues?city=Rosario`):
1. `app/api/venues.py` recibe el request y valida query params (FastAPI/Pydantic).
2. `dependencies.py` arma la cadena: sesión de DB → `VenueRepository` → `VenueService`.
3. `VenueService.list_venues` orquesta: pide datos al repository y los convierte a schemas de respuesta.
4. `VenueRepository` ejecuta el SQL (via SQLAlchemy) y devuelve entidades.
5. La respuesta sale tipada como `VenueListResponse` (visible en `/docs`, OpenAPI automático).

### 2026-06-10 — Auth (JWT) + Reservas
- **Auth**: `POST /api/auth/register` (roles: client/provider), `POST /api/auth/login` (devuelve JWT), `GET /api/auth/me` (requiere token).
  - Passwords con bcrypt (`app/core/security.py`). Nunca se guarda el password plano.
  - JWT firmado HS256, expiración configurable (`JWT_EXPIRATION_MINUTES`, default 24h). El secret se valida al arranque: mínimo 32 caracteres o la app no levanta.
  - Endpoints protegidos usan `CurrentUser` (dependencia en `app/api/dependencies.py`): valida el token Bearer, carga el usuario de DB, 401 si es inválido/expirado.
- **Reservas**:
  - `POST /api/bookings` — reserva un salón (`venue_id`) O un servicio (`service_id`) para una fecha. Valida: fecha futura, target existe, salón libre ese día (doble chequeo: validación en service + índice único parcial en DB como red de seguridad ante race conditions).
  - `GET /api/bookings` — mis reservas. `GET /api/bookings/{id}` — detalle (solo el dueño). `POST /api/bookings/{id}/cancel` — cancelar (solo el dueño, no re-cancelable).
  - Precio: se toma del salón/servicio al momento de reservar (snapshot en `total_price`).
  - Estados: `pending` → `deposit_paid` → `confirmed` / `cancelled`. Solo `deposit_paid` y `confirmed` bloquean la fecha del salón (un `pending` sin seña no reserva nada).
- **Disponibilidad**: `GET /api/venues/{id}/availability?date_from&date_to` — fechas ocupadas del salón (default: próximos 365 días). Público, lo usa el calendario del frontend.
- Verificado: app construye con 10 rutas, hashing y JWT con smoke test OK.

### 2026-06-11 — Panel de proveedores
- **Perfil de provider**: el registro con `role=provider` exige `business_name` y `category` (validator en `RegisterRequest`) y crea la fila en `providers` en el mismo flujo. `GET /api/providers/me` devuelve el perfil.
- **CRUD de venues**: `POST/PUT/DELETE /api/venues` — requiere rol provider con perfil (dependencia `CurrentProvider` en `dependencies.py`), solo sobre salones propios (403 si no es dueño). Update parcial (`exclude_unset`). Delete devuelve 409 si el salón tiene reservas (FK → `IntegrityError`).
- **CRUD de services**: router nuevo `/api/services` — `GET` lista pública (filtro `category`, paginación) y detalle; `POST/PUT/DELETE` con el mismo esquema de permisos que venues. Lógica en `ServiceCatalogService` (nombre elegido para no chocar con la entidad `Service`).
- **Reservas del proveedor**: `GET /api/providers/me/bookings` — reservas recibidas en sus salones/servicios (outer join por `provider_id`). `POST /api/providers/me/bookings/{id}/confirm|reject` — solo el proveedor dueño del salón/servicio; transición válida solo desde `pending`/`deposit_paid` (constante `PROVIDER_ACTIONABLE_BOOKING_STATUSES`), 409 si ya está confirmada/cancelada. Reject reutiliza el estado `cancelled` (KISS: no se agregó estado nuevo).
- Verificado: app construye con 23 rutas API registradas (smoke test).

### 2026-06-11 — Pagos (Mercado Pago)
- **Checkout de seña**: `POST /api/payments/checkout` (body: `booking_id`) — solo el dueño del booking y solo en estado `pending`. Monto: `deposit_amount` actual del salón (o precio total si es un servicio). Crea registro en `payments` (con `platform_fee = monto × PLATFORM_FEE_PCT`, default 10%), crea la preferencia en MP (`external_reference` = id del payment) y devuelve `init_point` (URL de pago).
- **Webhook**: `POST /api/payments/webhook` — acepta query params (`type`/`topic`, `data.id`) o body JSON. No confía en el payload: consulta el pago a la API de MP con el access token (verificación server-side). Aprobado → payment `approved` + booking `deposit_paid`. Idempotente (payment ya aprobado se ignora); estados desconocidos o bookings ya avanzados se ignoran. Siempre responde 200 para cortar reintentos de MP.
- **Integración**: cliente httpx async propio en `app/integrations/mercadopago_client.py` (sin SDK oficial: es sync y solo se usan 2 endpoints). Errores de MP → 502; sin `MP_ACCESS_TOKEN` configurado → 503 (la app levanta igual sin credenciales).
- Decisión: el checkout es un endpoint separado (no se crea la preferencia al crear el booking) — la creación de reservas no depende de un servicio externo y el pago es reintentable.
- Config nueva en `.env`: `MP_ACCESS_TOKEN`, `MP_CURRENCY_ID`, `PLATFORM_FEE_PCT`, `BACKEND_BASE_URL` (notification_url), `FRONTEND_BASE_URL` (back_urls).
- Verificado: 25 rutas API + test de lógica con stubs (fee, transición de estados, idempotencia, notificaciones no-payment ignoradas).

### 2026-06-12 — Suite de tests (pytest + httpx)
- 37 tests de API en `backend/tests/`: auth (registro duplicado 409, login inválido 401, token expirado/ausente 401, provider sin business_name 422), reservas (snapshot de precio, fecha pasada 422, doble reserva 409 solo tras confirmar, permisos de dueño 403, cancelación no repetible, disponibilidad solo con estados bloqueantes), panel proveedores (CRUD venues/services con ownership 403, delete con reservas 409, confirm/reject con transiciones válidas), pagos (503 sin credenciales, fee 10% persistido, checkout solo dueño/pending, webhook approved → `deposit_paid`, idempotencia post-approved, rejected no toca el booking).
- **Decisión: tests contra Postgres real** (`wedding_marketplace_test`), no SQLite in-memory: los modelos usan `JSONB` y la migración define el índice único parcial anti doble-reserva — SQLite no reproduce ese comportamiento. El `conftest` aplica la migración y trunca las tablas por test.
- Mercado Pago stubbeado con `monkeypatch` sobre `MercadoPagoClient` (fixtures `mp_stub` / `mp_unconfigured`), sin llamadas de red.
- Correr: `cd backend && PGUSER=dba .venv/bin/python -m pytest` (variables `PGUSER/PGPASSWORD/PGHOST/PGPORT/TEST_DB_NAME` configurables; deps de dev en `requirements-dev.txt`).

### 2026-06-12 — Frontend fase 1 (catálogo + auth + reservas)
- Stack real del scaffold: **Next.js 16** (App Router, Turbopack) — convenciones nuevas: `params`/`searchParams`/`cookies()` async, mutaciones con Server Actions.
- **Base** (`src/lib/`): `config.ts` (API base URL via `API_BASE_URL`, ver `.env.example`), `types.ts` (espejo de schemas del backend), `api.ts` (`apiFetch` tipado + `ApiError` con status y detail), `session.ts` (JWT en cookie httpOnly `access_token`, `getCurrentUser` contra `/api/auth/me`).
- **Catálogo** `/venues`: SSR consumiendo `GET /api/venues`, filtros city/capacidad mínima (form GET) y paginación. Detalle `/venues/[id]`: precio/seña, fechas ocupadas (`/availability`) y form de reserva.
- **Auth**: `/register` y `/login` con Server Actions (`useActionState` para errores inline). El token JWT nunca llega al JS del cliente: cookie httpOnly seteada server-side. Logout borra la cookie. Registro UI solo rol client (registro provider irá con el panel).
- **Reservas**: form en el detalle (redirect a `/login` sin sesión), `/bookings` lista propias con estado y cancelación (action con `bind`).
- Decisión (KISS): todo el data fetching es server-side (Server Components + Actions); no hay fetch desde el cliente ni estado global. Disponibilidad como lista de fechas ocupadas; calendario visual queda para después.
- Verificado: `npm run build` y lint verdes; smoke e2e con backend real (catálogo SSR muestra venue seedeado, detalle con seña/disponibilidad, vistas autenticadas via cookie, `/bookings` sin sesión → 307 a `/login`).

### 2026-06-12 — Frontend: panel de proveedor
- **Backend**: endpoints nuevos `GET /api/providers/me/venues` y `GET /api/providers/me/services` (listar solo lo propio; el catálogo público no filtra por proveedor). +2 tests (39 total).
- **Registro con rol**: selector cliente/proveedor en `/register`; si es proveedor pide nombre del negocio y rubro (mismos campos que exige el backend).
- **Panel** (`/panel`, solo proveedores): perfil + reservas recibidas con confirmar/rechazar. Subpáginas `/panel/venues` y `/panel/services`: listado propio con crear/editar/eliminar (forms compartidos para alta y edición, error inline en eliminar — ej. 409 con reservas).
- Guard DRY: `fetchAsProvider` (`src/lib/provider.ts`) — sin token → `/login`, sin rol/perfil provider (403) → `/venues`. Labels compartidos en `src/lib/labels.ts` (estados y rubros).
- Link "Panel" en el nav solo para usuarios provider.
- Verificado: build + lint verdes; smoke con backend real y seed (panel 200 como proveedor, 307 a /login sin sesión, 307 a /venues como cliente, edición inexistente 404).

### 2026-06-12 — Infra: monorepo git + DB local + seed
- **Git monorepo**: se eliminó `frontend/.git` (solo tenía el commit auto-generado de create-next-app) y se inicializó git en la raíz, branch `main`. Se limpió un scaffold duplicado de create-next-app que había quedado en la raíz (src/, public/, configs default sin tocar). Remote: repo privado en GitHub (`Proyect_wedding_marketplace`). Flujo acordado: primer push a `main`; de acá en adelante todo cambio sale de ramas.
- **DB local**: base `wedding_marketplace` creada y migración `001_initial_schema.sql` aplicada. `backend/.env` configurado (JWT secret aleatorio).
- **Seed**: `backend/seed.py` (idempotente: si hay usuarios no hace nada). Crea 1 cliente + 3 proveedores (salones, catering, música), 3 salones y 3 servicios. Password de todos configurable vía `SEED_PASSWORD` (default `Password123!`). Correr: `cd backend && .venv/bin/python seed.py`.
- Verificado: API levantada contra la DB local responde catálogo seedeado y login de usuario seed OK.

### 2026-06-12 — Frontend: checkout de seña (MP)
- Botón "Pagar seña" en `/bookings` (solo reservas `pending`): Server Action `payDepositAction` llama `POST /api/payments/checkout` con el token de la cookie y redirige al `init_point` de Mercado Pago. Errores del backend (503 sin credenciales, 409 estado inválido) se muestran inline bajo el botón (`useActionState`).
- Páginas de retorno `/checkout/success|pending|failure` (matchean las `back_urls` que arma el backend): ruta dinámica única `/checkout/[result]` con dict de contenidos, 404 para valores desconocidos.
- Verificado: build + lint verdes; smoke con backend real (reserva pending muestra botón Pagar seña + Cancelar, páginas de retorno 200, valor inválido 404). Pendiente: prueba end-to-end con credenciales reales de MP (sandbox).

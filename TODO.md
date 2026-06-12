# TODO — Wedding Marketplace

> Última sesión: 2026-06-12. Backend completo con 37 tests verdes. Frontend fase 1 + checkout listos (build/lint verdes, smoke e2e OK).
> **Próximo paso sugerido**: panel de proveedor (UI) o infra (git monorepo + DB local + seed).

## Pendiente inmediato (backend)

### 1. Tests ✅ (37 tests, `PGUSER=dba .venv/bin/python -m pytest` contra `wedding_marketplace_test`)
- [x] pytest + httpx para tests de API
- [x] Prioridad: lógica de reservas (doble reserva, fechas pasadas, permisos de dueño)
- [x] Tests de auth (registro duplicado, login inválido, token expirado)
- [x] Tests del panel de proveedores (CRUD con ownership, confirm/reject)
- [x] Tests de pagos (checkout solo dueño/pending, webhook idempotente, fee)

### 2. Infra / housekeeping
- [x] Git monorepo: `frontend/.git` borrado, repo en raíz, pusheado a `github.com/Mafort558/Proyect_wedding_marketplace` (privado, SSH alias `github-mafort558`). Flujo acordado: primer push a `main`, de ahora en más trabajo en ramas
- [x] DB Postgres local `wedding_marketplace` creada + migración aplicada
- [x] Probar la API end-to-end con DB real (registro → login → crear venue → reservar) — hecho vía smoke del frontend contra `wedding_marketplace_test`
- [x] Datos de prueba (seed): `backend/seed.py` idempotente (4 users pass `Password123!`, 3 providers, 3 venues, 3 services)
- [ ] Probar checkout MP end-to-end con credenciales sandbox

## Frontend (en curso — 2026-06-12)
- [x] Páginas de catálogo de salones (SSR, consumiendo `GET /api/venues`, filtros + paginación)
- [x] Detalle de salón + fechas ocupadas (lista simple, calendario visual pendiente)
- [x] Flujo de registro/login (cookie httpOnly, server actions) — solo rol client por ahora
- [x] Mis reservas: listado + crear desde detalle + cancelar
- [x] Checkout de reserva con seña (MP) — botón pagar seña → init_point + páginas /checkout/success|pending|failure (falta probar con credenciales MP reales)
- [x] Panel de proveedor (UI) — registro con rol provider, `/panel` (reservas recibidas confirmar/rechazar), CRUD salones y servicios
- [ ] Calendario visual de disponibilidad (hoy: lista de fechas ocupadas)

## Más adelante (post-MVP)
- [ ] Paquetes/opciones propias de cada salón (ej: salón con catering incluido) — combos por proveedor
- [ ] Reserva de servicios desde el catálogo público (backend ya soporta `service_id` en bookings; falta UI)
- [ ] Subida de fotos (S3 o similar — hoy `photos` es lista de URLs; demo usa picsum.photos)
- [ ] Búsqueda avanzada / filtros (precio, categoría, zona)
- [ ] Notificaciones email (confirmación reserva)
- [ ] Reviews/calificaciones de proveedores
- [ ] Deploy (backend + frontend + DB managed)

## Estado actual (ya hecho)
- Backend FastAPI en capas (api → services → repositories), app factory, config via `.env`
- Modelos + migración SQL: users, providers, venues, services, bookings, payments
- Auth JWT completa (register/login/me, bcrypt, roles)
- Reservas: crear/listar/detalle/cancelar + anti doble-reserva (service + índice único DB)
- Disponibilidad por salón
- Panel de proveedores: perfil creado en registro (business_name + category obligatorios si rol provider), CRUD venues/services (solo dueño, delete 409 si hay reservas), catálogo público de services (filtro category + paginación), `GET /api/providers/me`, `GET /api/providers/me/bookings`, confirmar/rechazar reservas (solo desde pending/deposit_paid)
- Pagos Mercado Pago: `POST /api/payments/checkout` (seña: deposit_amount de venue o precio total de service, solo dueño + booking pending, platform_fee % en config), webhook `POST /api/payments/webhook` (verificación server-side contra API de MP, idempotente, approved → booking deposit_paid). Cliente httpx async en `app/integrations/`, 503 sin credenciales, 502 si MP falla
- Tests backend: 37 (auth, reservas, panel proveedores, pagos) contra Postgres real
- Frontend Next.js 16 (App Router): catálogo SSR con filtros/paginación, detalle con disponibilidad y reserva, registro/login con cookie httpOnly (solo rol client), mis reservas (cancelar + pagar seña → MP init_point), páginas de retorno de checkout. Todo el fetching server-side.
- Ver README.md para arquitectura, decisiones e historial por fecha

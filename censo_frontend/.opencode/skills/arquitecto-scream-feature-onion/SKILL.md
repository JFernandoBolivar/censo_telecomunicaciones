---
name: arquitecto-scream-feature-onion
description: Arquitecto SCREAM + Feature-Based + Onion para proyectos con módulos y features. Crea estructuras de carpetas, valida dependencias y sugiere mejoras de modularización.
---

# Arquitecto SCREAM-Feature-Onion

Skill para trabajar con la arquitectura del proyecto basada en Scream + Feature-Based + Onion.

---

## Arquitectura del proyecto

### Patrón 1: Módulo simple

```
modules/[modulo]/
├── application/
│   ├── dtos/
│   │   └── [nombre]-dto.ts
│   └── use-cases/
│       ├── list-[nombres].ts
│       ├── create-[nombre].ts
│       ├── update-[nombre].ts
│       └── (otros según necesidad)
├── domain/
│   ├── entities/
│   │   ├── [nombre]-entity.ts
│   │   └── (VOs opcionales en entities o value-objects/)
│   └── ports/
│       └── repo-[nombre].ts
├── infrastructure/
│   ├── actions/
│   │   └── [nombres]-actions.ts
│   ├── http/
│   │   └── [nombres]-api.ts
│   ├── mappers/
│   │   └── mapper-[nombre].ts
│   └── repositories/
│       └── repo-[nombre]-api.ts
└── ui/
    ├── schema/
    │   └── schema-[nombre].ts
    ├── [nombre]-form.tsx
    ├── [nombre]-edit-form.tsx
    └── [nombres]-page.tsx
```

**Ejemplos:** `apoyo/`, `comedor/`, `servicios/`, `usuarios/`, `dashboard/`, `auth/`

### Patrón 2: Sub-módulo

```
modules/[modulo]/
└── [submodulo]/
    ├── application/
    ├── domain/
    ├── infrastructure/
    └── ui/
```

**Ejemplo:** `transporte/{vehiculos, choferes, rutas, origenes, viajes}/`

Cada sub-módulo replica la misma estructura interna del módulo simple.

### Capas y dependencias (Onion)

La flecha significa "depende de" → **siempre apunta hacia adentro**:

```
ui → infrastructure → application → domain
```

- **domain/** — Sin dependencias externas. Solo tipos/interfaces y factories.
- **application/** — Depende solo de `domain/` (ports, entities).
- **infrastructure/** — Implementa los ports de `domain/`. Depende de `domain/` y `application/`.
- **ui/** — Capa más externa. Depende de `application/` (DTOs, use-cases) y componentes de `shared/`.

### Shared

- `modules/[modulo]/shared/` (opcional) — Código compartido entre features del mismo módulo.
- `shared/` (raíz del proyecto) — Código compartido entre módulos diferentes.

```
shared/
├── commons/
│   └── api.ts                    → API.url (env)
├── hooks/
│   ├── index.ts
│   └── use-mobile.ts
├── index.ts                      → Re-export de todo
├── infrastructure/
│   ├── actions/
│   │   ├── direcciones-actions.ts  → Server actions organizacionales
│   │   └── empleados-actions.ts    → validateCedulaAction
│   └── http/
│       ├── blob-utils.ts           → createDownloadUrl, revokeDownloadUrl
│       ├── direcciones-api.ts      → API calls direcciones
│       ├── errors.ts               → SessionExpiredError
│       ├── fetcher-api.ts          → apiClient (core HTTP)
│       └── query-params.ts         → queryParams()
├── types/
│   ├── api-respose.ts
│   ├── index.ts
│   ├── layout-props.ts
│   └── types-apis.ts
└── ui/
    ├── components/                 → 60+ componentes shadcn/ui
    ├── layout/
    │   ├── breadcrumb.tsx
    │   ├── header-layout.tsx
    │   ├── index.ts
    │   ├── page-layout.tsx
    │   └── session-wrapper.tsx
    └── index.ts
```

**Regla:** si 2+ módulos usan el mismo tipo/schema/componente, migrar a `shared/` raíz.

---

## Mapa de ordenamiento de archivos

### Orden de creación por capa (Onion)

De adentro hacia afuera. Cada archivo solo depende de los que están antes.

| #   | Capa                           | Archivo                  | Depende de                                                     |
| --- | ------------------------------ | ------------------------ | -------------------------------------------------------------- |
| 1   | `domain/value-objects/`        | `[nombre]-vo.ts`         | — (tipos base)                                                 |
| 2   | `domain/entities/`             | `[nombre]-entity.ts`     | VOs (#1)                                                       |
| 3   | `domain/ports/`                | `repo-[nombre].ts`       | entities (#2)                                                  |
| 4   | `application/dtos/`            | `[nombre]-dto.ts`        | entities (#2)                                                  |
| 5   | `application/use-cases/`       | `list-[nombres].ts`      | ports (#3), dtos (#4)                                          |
| 6   | `application/use-cases/`       | `create-[nombre].ts`     | ports (#3), dtos (#4)                                          |
| 7   | `application/use-cases/`       | `update-[nombre].ts`     | ports (#3), dtos (#4)                                          |
| 8   | `infrastructure/mappers/`      | `mapper-[nombre].ts`     | entities (#2)                                                  |
| 9   | `infrastructure/http/`         | `[nombres]-api.ts`       | mappers (#8), `apiClient` (shared)                             |
| 10  | `infrastructure/repositories/` | `repo-[nombre]-api.ts`   | ports (#3), http (#9)                                          |
| 11  | `infrastructure/actions/`      | `[nombres]-actions.ts`   | repos (#10), use-cases (#5-7), `handleSessionExpired` (shared) |
| 12  | `ui/schema/`                   | `schema-[nombre].ts`     | — (solo zod)                                                   |
| 13  | `ui/`                          | `[nombre]-form.tsx`      | schema (#12), actions (#11)                                    |
| 14  | `ui/`                          | `[nombre]-edit-form.tsx` | schema (#12), actions (#11)                                    |
| 15  | `ui/`                          | `[nombres]-page.tsx`     | actions (#11), form (#13)                                      |
| 16  | `app/`                         | `(app)/[ruta]/page.tsx`  | page (#15)                                                     |

### Mapa visual del flujo de datos

**Escritura (crear/actualizar):**

```
form submit
  ↓
[Nombre]Form.tsx                         "use client"
  → startTransition(async () => {
      const r = await create[Nombre]Action(data)
    })
    ↓
[nombres]-actions.ts                     "use server"
  → await create[Nombre](repo, data)
    ↓
create-[nombre].ts                       use case
  → return repo.create(data)
    ↓
repo-[nombre]-api.ts                     repository impl
  → return post[Nombre](dto)
    ↓
[nombres]-api.ts                         http functions
  → return apiClient.post("path/", dto)
    ↓
fetcher-api.ts                           shared apiClient
  → fetch(API.url + path, { headers: { Authorization: Bearer <dj_access> }, body })
    ↓
Backend Django REST
```

**Lectura (listar):**

```
page mount
  ↓
[Nombres]Page.tsx                        "use client"
  → useSWR("key", fetch[Nombres]Action)
    ↓
[nombres]-actions.ts                     "use server"
  → return await list[Nombres](repo)
    ↓
list-[nombres].ts                        use case
  → const entities = await repo.getAll()
  → return entities.map(e => ({ id: e.id, ... }))
    ↓
repo-[nombre]-api.ts                     repository impl
  → return get[Nombres]()
    ↓
[nombres]-api.ts                         http functions
  → const data = await apiClient.get("path/")
  → return data.map(mapper[Nombre])
    ↓
fetcher-api.ts                           shared apiClient
  → fetch(API.url + path, { headers: { Authorization: Bearer <dj_access> } })
    ↓
Backend Django REST
```

### Estructura completa del proyecto

```
raíz/
├── auth.config.ts                       NextAuthConfig (provider Credentials)
├── auth.ts                              NextAuth() (JWT, callbacks)
├── proxy.ts                             Middleware (protección de rutas)
├── next.config.ts                       Configuración Next.js (images, serverActions)
├── components.json                      Configuración shadcn/ui
├── tsconfig.json                        Path aliases @/*, @modules/*, @shared/*
├── .env                                 Variables de entorno (desarrollo)
├── .env.example                         Template de variables
│
├── types/                               Tipos compartidos
│   ├── next-auth.d.ts                   Augment Session/User/JWT
│   ├── api-respose.ts                   ApiResponse<T>
│   ├── layout-props.ts                  LayoutPropsInterface
│   └── types-apis.ts                    ResponseDjango<T>
│
├── lib/
│   └── utils.ts                         cn() utility
│
├── shared/                              Código compartido entre módulos
│   ├── index.ts                         Barrel export
│   ├── commons/
│   │   └── api.ts                       API.url = process.env.DJANGO_API_SERVER
│   ├── hooks/
│   │   ├── index.ts
│   │   └── use-mobile.ts
│   ├── types/
│   │   ├── index.ts
│   │   ├── api-respose.ts
│   │   ├── layout-props.ts
│   │   └── types-apis.ts
│   ├── infrastructure/
│   │   ├── http/
│   │   │   ├── errors.ts                SessionExpiredError, handleSessionExpired
│   │   │   ├── query-params.ts          queryParams()
│   │   │   ├── fetcher-api.ts           apiClient (core HTTP)
│   │   │   ├── blob-utils.ts            createDownloadUrl, revokeDownloadUrl
│   │   │   └── direcciones-api.ts       getDependencias, etc.
│   │   └── actions/
│   │       ├── direcciones-actions.ts   fetchDependenciasAction, etc.
│   │       └── empleados-actions.ts     validateCedulaAction
│   └── ui/
│       ├── index.ts                     Barrel export
│       ├── components/                  60+ componentes shadcn/ui
│       │   ├── index.ts                 Barrel de todos los componentes
│       │   ├── field.tsx                Field, FieldLabel, FieldError, FieldDescription, etc.
│       │   ├── input.tsx                Input base
│       │   ├── select.tsx               Select base
│       │   ├── textarea.tsx             Textarea base
│       │   ├── button.tsx               Button base
│       │   ├── card.tsx                 Card, CardHeader, CardContent, etc.
│       │   ├── label.tsx                Label base
│       │   ├── popover.tsx              Popover, PopoverTrigger, PopoverContent
│       │   ├── calendar.tsx             Calendar (react-day-picker)
│       │   ├── dialog.tsx               Dialog, AlertDialog
│       │   ├── alert-dialog.tsx         AlertDialog full
│       │   ├── separator.tsx            Separator
│       │   ├── skeleton.tsx             Skeleton loading
│       │   ├── badge.tsx                Badge
│       │   ├── input-form.tsx           InputForm wrapper
│       │   ├── select-form.tsx          SelectForm wrapper
│       │   ├── date-form.tsx            DateForm wrapper
│       │   ├── file-form.tsx            FileForm wrapper
│       │   ├── textarea-form.tsx        TextareaForm wrapper
│       │   ├── combobox.tsx             Combobox (search + select)
│       │   ├── direccion-admin-selects.tsx  4 selects en cascada
│       │   ├── cedula-search.tsx        Búsqueda por cédula
│       │   ├── reporte-boton.tsx        Botón "Reporte"
│       │   ├── reporte-filtros-dialog.tsx Dialog de filtros para PDF
│       │   ├── app-sidebar.tsx          Sidebar de navegación
│       │   ├── user-avatar.tsx          Avatar del usuario
│       │   ├── logout-button.tsx        Botón de cerrar sesión
│       │   ├── empty.tsx                Estado vacío
│       │   ├── spinner.tsx              Spinner loading
│       │   ├── toast-provider.tsx       Sonner toast provider
│       │   └── ... (resto de shadcn/ui)
│       └── layout/
│           ├── index.ts                 Barrel export
│           ├── page-layout.tsx          PageLayout (title, subTitle, children)
│           ├── header-layout.tsx        HeaderLayout (left, title, right)
│           ├── breadcrumb.tsx           Breadcrumb automático por ruta
│           └── session-wrapper.tsx      SessionProvider wrapper
│
├── modules/                             Módulos del dominio
│   ├── auth/                            Autenticación
│   │   ├── infrastructure/actions/
│   │   │   └── auth-actions.ts          loginAction, logoutAction, changePasswordAction
│   │   └── ui/
│   │       ├── schema/
│   │       │   └── schema-login.ts      signInSchema
│   │       └── login-form.tsx           LoginForm
│   │
│   ├── apoyo/                           Personal de apoyo
│   │   ├── application/dtos/apoyo-dto.ts
│   │   ├── application/use-cases/
│   │   │   ├── list-apoyo.ts
│   │   │   ├── create-apoyo.ts
│   │   │   └── update-apoyo.ts
│   │   ├── domain/entities/apoyo-entity.ts
│   │   ├── domain/entities/origen-apoyo-entity.ts
│   │   ├── domain/ports/repo-apoyo.ts
│   │   ├── infrastructure/actions/apoyo-actions.ts
│   │   ├── infrastructure/http/apoyo-api.ts
│   │   ├── infrastructure/mappers/mapper-apoyo.ts
│   │   ├── infrastructure/repositories/repo-apoyo-api.ts
│   │   └── ui/
│   │       ├── schema/schema-apoyo.ts
│   │       └── apoyo-page.tsx
│   │
│   ├── comedor/                         Comedor
│   │   ├── application/dtos/comedor-dto.ts
│   │   ├── application/use-cases/
│   │   │   ├── create-menu.ts
│   │   │   ├── list-menus.ts
│   │   │   ├── update-menu.ts
│   │   │   ├── list-asistencia.ts
│   │   │   ├── registrar-asistencia.ts
│   │   │   └── obtener-metricas.ts
│   │   ├── domain/entities/menu-entity.ts
│   │   ├── domain/entities/asistencia-entity.ts
│   │   ├── domain/ports/repo-menu.ts
│   │   ├── domain/ports/repo-asistencia.ts
│   │   ├── infrastructure/actions/comedor-actions.ts
│   │   ├── infrastructure/http/comedor-api.ts
│   │   ├── infrastructure/mappers/mapper-menu.ts
│   │   ├── infrastructure/repositories/repo-comedor-api.ts
│   │   └── ui/
│   │       ├── schema/schema-menu.ts
│   │       ├── schema/schema-asistencia.ts
│   │       ├── comedor-page.tsx
│   │       ├── menu-edit-form.tsx
│   │       └── asistencia-page.tsx
│   │
│   ├── servicios/                       Servicios
│   │   ├── application/dtos/servicio-dto.ts
│   │   ├── application/use-cases/
│   │   │   ├── list-servicios.ts
│   │   │   ├── create-servicio.ts
│   │   │   └── asignar-servicio.ts
│   │   ├── domain/entities/servicio-entity.ts
│   │   ├── domain/entities/asignacion-entity.ts
│   │   ├── domain/ports/repo-servicio.ts
│   │   ├── infrastructure/actions/servicios-actions.ts
│   │   ├── infrastructure/actions/asignar-actions.ts
│   │   ├── infrastructure/http/servicios-api.ts
│   │   ├── infrastructure/mappers/mapper-servicio.ts
│   │   ├── infrastructure/repositories/repo-servicios-api.ts
│   │   └── ui/
│   │       ├── schema/schema-servicio.ts
│   │       ├── schema/schema-asignar.ts
│   │       ├── servicios-page.tsx
│   │       ├── servicio-form.tsx
│   │       ├── servicio-detalle-page.tsx
│   │       └── asignar-form.tsx
│   │
│   ├── usuarios/                        Usuarios
│   │   ├── application/dtos/usuario-dto.ts
│   │   ├── application/use-cases/
│   │   │   ├── list-usuarios.ts
│   │   │   ├── create-usuario.ts
│   │   │   ├── update-usuario.ts
│   │   │   └── list-permisos.ts
│   │   ├── domain/entities/usuario-entity.ts
│   │   ├── domain/ports/repo-usuario.ts
│   │   ├── infrastructure/actions/usuarios-actions.ts
│   │   ├── infrastructure/actions/permisos-actions.ts
│   │   ├── infrastructure/http/usuarios-api.ts
│   │   ├── infrastructure/mappers/mapper-usuario.ts
│   │   ├── infrastructure/repositories/repo-usuarios-api.ts
│   │   └── ui/
│   │       ├── schema/schema-usuario.ts
│   │       ├── schema/schema-usuario-edit.ts
│   │       ├── usuarios-page.tsx
│   │       ├── usuario-form.tsx
│   │       ├── usuario-edit-form.tsx
│   │       └── permisos-page.tsx
│   │
│   ├── dashboard/                       Dashboard
│   │   ├── application/dtos/dashboard-dto.ts
│   │   ├── application/use-cases/chart-dashboard.ts
│   │   ├── domain/entities/service-entity.ts
│   │   ├── domain/ports/repo-dashboard.ts
│   │   ├── domain/value-objects/services.ts
│   │   ├── infrastructure/http/api-client.ts
│   │   ├── infrastructure/mappers/mapper-services.ts
│   │   ├── infrastructure/repositories/repo-dashboard-api.ts
│   │   └── ui/dashboard-page.tsx
│   │
│   └── transporte/                      Transporte (sub-módulos)
│       ├── choferes/
│       │   ├── application/dtos/chofer-dto.ts
│       │   ├── application/use-cases/list-choferes.ts
│       │   ├── domain/entities/chofer-entity.ts
│       │   ├── domain/ports/repo-chofer.ts
│       │   ├── infrastructure/actions/choferes-actions.ts
│       │   ├── infrastructure/http/choferes-api.ts
│       │   ├── infrastructure/mappers/mapper-chofer.ts
│       │   ├── infrastructure/repositories/repo-chofer-api.ts
│       │   └── ui/
│       │       ├── schema/schema-chofer.ts
│       │       ├── choferes-page.tsx
│       │       └── chofer-edit-form.tsx
│       ├── vehiculos/
│       │   ├── application/dtos/vehiculo-dto.ts
│       │   ├── application/use-cases/list-vehiculos.ts
│       │   ├── application/use-cases/create-vehiculo.ts
│       │   ├── application/use-cases/update-vehiculo.ts
│       │   ├── domain/entities/vehiculo-entity.ts
│       │   ├── domain/ports/repo-vehiculo.ts
│       │   ├── infrastructure/actions/vehiculos-actions.ts
│       │   ├── infrastructure/http/vehiculos-api.ts
│       │   ├── infrastructure/mappers/mapper-vehiculo.ts
│       │   ├── infrastructure/repositories/repo-vehiculo-api.ts
│       │   └── ui/
│       │       ├── schema/schema-vehiculo.ts
│       │       ├── vehiculos-page.tsx
│       │       ├── vehiculo-form.tsx
│       │       └── vehiculo-edit-form.tsx
│       ├── rutas/
│       │   ├── ...
│       ├── origenes/
│       │   ├── ...
│       └── viajes/
│           ├── ...
│
├── app/                                 Next.js App Router
│   ├── layout.tsx                        RootLayout (Inter + Outfit, globals.css, ToastProvider)
│   ├── globals.css                       Estilos globales + tailwind
│   ├── favicon.ico
│   │
│   ├── (auth)/                           Rutas públicas (sin sidebar)
│   │   ├── layout.tsx                    AuthLayout (fondo bg.png, centrado)
│   │   ├── login/page.tsx               → LoginForm
│   │   └── signout/page.tsx             Cierra sesión
│   │
│   ├── (app)/                            Rutas protegidas (con sidebar)
│   │   ├── layout.tsx                    AppLayout (auth → SessionWrapper → SidebarProvider)
│   │   ├── loading.tsx                   Loading animado
│   │   ├── error.tsx                     Error boundary (403 → dialog)
│   │   ├── page.tsx                      Dashboard → DashboardPage
│   │   ├── apoyo/page.tsx               → ApoyoPage
│   │   ├── apoyo/[id]/editar/page.tsx   → ApoyoEditForm
│   │   ├── comedor/page.tsx             → ComedorPage
│   │   ├── comedor/asistencia/page.tsx  → AsistenciaPage
│   │   ├── comedor/[id]/editar/page.tsx → MenuEditForm
│   │   ├── servicios/page.tsx           → ServiciosPage
│   │   ├── servicios/crear/page.tsx     → ServicioForm
│   │   ├── servicios/asignar/page.tsx   → AsignarForm
│   │   ├── servicios/[id]/page.tsx      → ServicioDetallePage
│   │   ├── vehiculos/page.tsx           → VehiculosPage
│   │   ├── vehiculos/[id]/editar/page.tsx → VehiculoEditForm
│   │   ├── choferes/page.tsx            → ChoferesPage
│   │   ├── choferes/[id]/editar/page.tsx → ChoferEditForm
│   │   ├── rutas/page.tsx               → RutasPage
│   │   ├── rutas/[id]/editar/page.tsx   → RutaEditForm
│   │   ├── origenes/page.tsx            → OrigenesPage
│   │   ├── origenes/[id]/editar/page.tsx → OrigenEditForm
│   │   ├── viajes/page.tsx              Redirige a /viajes/panel
│   │   ├── viajes/panel/page.tsx        Panel de control
│   │   ├── viajes/asignaciones/page.tsx Asignaciones
│   │   ├── viajes/historial/page.tsx    Historial
│   │   ├── empleados/page.tsx           → UsuariosPage
│   │   ├── empleados/crear/page.tsx     → UsuarioForm
│   │   ├── empleados/[id]/editar/page.tsx → UsuarioEditForm
│   │   ├── permisos/page.tsx            → PermisosPage
│   │   └── admin/page.tsx               → AdminPage
│   │
│   └── api/
│       ├── auth/[...nextauth]/route.ts  NextAuth API handlers
│               └── reportes/pdf/route.ts        Proxy PDF (fetch directo a Django)
```

---

## Naming conventions

| Elemento        | Archivo (kebab-case)     | Exports                                                                                                         |
| --------------- | ------------------------ | --------------------------------------------------------------------------------------------------------------- |
| Entity          | `[nombre]-entity.ts`     | `interface [Nombre]Entity`, `function create[Nombre]Entity()`                                                   |
| Value Object    | `[nombre]-vo.ts`         | `type [Nombre]VO`, `function crear[Nombre]VO()`                                                                 |
| Repository port | `repo-[nombre].ts`       | `interface Repo[Nombre]`                                                                                        |
| DTO             | `[nombre]-dto.ts`        | `interface [Nombre]ItemDTO`, `Create[Nombre]DTO`, `Update[Nombre]DTO`                                           |
| Use case        | `[accion]-[nombre].ts`   | `function [accion][Nombre]()`                                                                                   |
| API client      | `[nombres]-api.ts`       | `function get[Nombres]()`, `post[Nombre]()`, `patch[Nombre]()`, `delete[Nombre]()`                              |
| Mapper          | `mapper-[nombre].ts`     | `function mapper[Nombre]()`                                                                                     |
| Repository impl | `repo-[nombre]-api.ts`   | `const repo[Nombre]Api: Repo[Nombre]`                                                                           |
| Server action   | `[nombres]-actions.ts`   | `function fetch[Nombres]Action()`, `create[Nombre]Action()`, `update[Nombre]Action()`, `delete[Nombre]Action()` |
| Zod schema      | `schema-[nombre].ts`     | `const [nombre]FormSchema`, `type [Nombre]FormType`                                                             |
| Form component  | `[nombre]-form.tsx`      | `export default function [Nombre]Form()`                                                                        |
| Edit form       | `[nombre]-edit-form.tsx` | `export default function [Nombre]EditForm()`                                                                    |
| Page component  | `[nombres]-page.tsx`     | `export default function [Nombres]Page()`                                                                       |

> **Nota sobre variaciones:** Las convenciones pueden variar entre módulos. Algunos usan nombres como `Repo[Nombre]` vs `IRepo[Nombre]`, o funciones factory vs funciones sueltas. El estándar documentado aquí es la recomendación. Al trabajar en un módulo existente, **seguir el patrón que ya usa ese módulo**.

### TypeScript

- **Sin `any`** — Usar `unknown` con type guard si es necesario.
- **Tipos explícitos** en parámetros y retornos.
- **`readonly`** en propiedades de entidades.
- **Sin clases** — Solo tipos (`type`/`interface`) + funciones puras + object literals para repositorios.
- **Interfaces para ports** del dominio. Object literals para implementaciones concretas.

### Zod

- Schemas en `ui/schema/schema-[nombre].ts`.
- Usar con `react-hook-form` + `@hookform/resolvers/zod`.
- El schema define el tipo del formulario via `z.infer<>`.
- Los schemas NO se comparten con server actions (cada capa valida por separado).

### Alias de importación

```
@/shared/ui/components/        → Componentes UI compartidos
@/shared/infrastructure/http/  → apiClient, queryParams, errors
@/shared/infrastructure/actions/ → Server actions compartidas
@/shared/                      → Todo el barrel de shared
@/modules/                     → Acceso a módulos
@/lib/utils                    → Utilidades (cn)
@/auth                         → NextAuth instance
```

---

## Auth

### Estructura del módulo auth

```
modules/auth/
├── infrastructure/actions/
│   └── auth-actions.ts   → loginAction, logoutAction, changePasswordAction
└── ui/
    ├── schema/
    │   └── schema-login.ts   → signInSchema (z.object)
    └── login-form.tsx         → LoginForm component
```

### Archivos raíz

```
auth.config.ts   → NextAuthConfig con provider Credentials
auth.ts          → NextAuth() con JWT strategy, callbacks jwt/session
types/next-auth.d.ts → Augment Session/User/JWT
proxy.ts         → Middleware: redirecciona a /login si no auth
```

### Flujo de login

```
LoginForm (cliente)
  → loginAction(cedula, password)      Server Action "use server"
    → signIn("credentials", {...})     next-auth
      → authorize() en auth.config.ts
        → fetch(DJANGO_API_SERVER + "users/auth/")
        → Si ok: guarda dj_access + dj_refresh en cookies (httpOnly)
        → Retorna user con id, name, cedula, permisos, djAccess, djRefresh
      → jwt callback: token ← user
      → session callback: session.user ← token
  → toast.success + router.push("/")
```

### Cookies

| Cookie                    | Propósito            | httpOnly | maxAge  |
| ------------------------- | -------------------- | -------- | ------- |
| `dj_access`               | Token JWT Django     | sí       | 15 min  |
| `dj_refresh`              | Refresh token Django | sí       | 8 horas |
| `next-auth.session-token` | Sesión next-auth     | sí       | 8 horas |

### Layout de rutas

```
app/
├── layout.tsx                        → RootLayout (fonts, ToastProvider)
├── (auth)/
│   ├── layout.tsx                    → AuthLayout (fondo, centrado)
│   ├── login/page.tsx               → LoginForm
│   └── signout/page.tsx             → Cierra sesión
└── (app)/
    ├── layout.tsx                    → AppLayout (auth() session check,
    │                                    SessionWrapper, Sidebar, Header,
    │                                    Breadcrumb)
    ├── loading.tsx                   → Loading spinner animado
    ├── error.tsx                     → Error boundary (403 → diálogo)
    └── [ruta]/page.tsx              → Páginas del módulo
```

---

## Distribución UI (app/ → modules/\*/ui/)

Las páginas en `app/` son **thin wrappers**. La lógica de UI y negocio está en `modules/*/ui/`.

### Patrón A: Thin wrapper (mayoría de casos)

```tsx
// app/(app)/vehiculos/page.tsx
import VehiculosPage from "@/modules/transporte/vehiculos/ui/vehiculos-page";
export default function Page() {
  return <VehiculosPage />;
}
```

### Patrón B: Server component con datos

```tsx
// app/(app)/servicios/page.tsx
import { listServicios } from "@/modules/servicios/application/use-cases/list-servicios";
import { repoServiciosApi } from "@/modules/servicios/infrastructure/repositories/repo-servicios-api";

export default async function Page() {
  const servicios = await listServicios(repoServiciosApi);
  return <ServiciosPage servicios={servicios} />;
}
```

### Patrón C: Edit page con fetch + layout

```tsx
// app/(app)/apoyo/[id]/editar/page.tsx
import PageLayout from "@/shared/ui/layout/page-layout";
import ApoyoEditForm from "@/modules/apoyo/ui/apoyo-edit-form";

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const data = await obtenerData(repo, Number(id));
  if (!data)
    return (
      <PageLayout title="Error">
        <p>No encontrado</p>
      </PageLayout>
    );
  return (
    <PageLayout title="Editar">
      <ApoyoEditForm data={data} />
    </PageLayout>
  );
}
```

### Layouts compartidos

| Archivo                 | Rol                                                                                            |
| ----------------------- | ---------------------------------------------------------------------------------------------- |
| `app/layout.tsx`        | `Inter` + `Outfit` fonts, `globals.css`, `<ToastProvider />`                                   |
| `app/(app)/layout.tsx`  | `auth()` → `SessionWrapper` → `SidebarProvider` → `AppSidebar` + `HeaderLayout` + `Breadcrumb` |
| `app/(app)/loading.tsx` | Animación de carga con cuadrados rotando                                                       |
| `app/(app)/error.tsx`   | Error boundary: 403 → "Acceso Denegado" dialog, otros → mensaje genérico                       |
| `app/(auth)/layout.tsx` | Fondo fullscreen con `bg.png`, centrado vertical/horizontal                                    |

---

## Form building

### Flujo completo

```
1. Zod schema               ui/schema/schema-[nombre].ts
2. Form component           ui/[nombre]-form.tsx  ("use client")
     useForm<T>({ resolver: zodResolver(schema), defaultValues })
     useTransition() → startTransition
3. Server action            infrastructure/actions/[nombres]-actions.ts  ("use server")
4. Use case                  application/use-cases/[accion].ts
5. Repository port           domain/ports/repo-[nombre].ts
6. Repository impl           infrastructure/repositories/repo-[nombre]-api.ts
7. HTTP functions            infrastructure/http/[nombres]-api.ts
8. apiClient                 shared/infrastructure/http/fetcher-api.ts
```

### Ejemplos completos por tipo

#### 1. Create form — InputForm + SelectForm básico

```typescript
// modules/[modulo]/ui/schema/schema-[nombre].ts
import { z } from "zod";

export const [nombre]FormSchema = z.object({
  nombre: z.string().min(2, "Mínimo 2 caracteres"),
  descripcion: z.string().min(4, "Mínimo 4 caracteres"),
  tipo: z.string().min(1, "Seleccione un tipo"),
});

export type [Nombre]FormType = z.infer<typeof [nombre]FormSchema>;
```

```typescript
// modules/[modulo]/ui/[nombre]-form.tsx
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import InputForm from "@/shared/ui/components/input-form";
import SelectForm from "@/shared/ui/components/select-form";
import { Button } from "@/shared/ui/components/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/components/card";
import { Plus, Spinner, FileText, Tag } from "@phosphor-icons/react";
import { [Nombre]FormType, [nombre]FormSchema } from "./schema/schema-[nombre]";
import { create[Nombre]Action } from "../infrastructure/actions/[nombres]-actions";

export default function [Nombre]Form({ onSuccess }: { onSuccess?: () => void }) {
  const [isPending, startTransition] = useTransition();

  const form = useForm<[Nombre]FormType>({
    resolver: zodResolver([nombre]FormSchema),
    defaultValues: { nombre: "", descripcion: "", tipo: "" },
  });

  const onSubmit = (data: [Nombre]FormType) => {
    startTransition(async () => {
      const r = await create[Nombre]Action(data);
      if (r.error) { toast.error(r.error); return; }
      toast.success(r.success);
      form.reset();
      onSuccess?.();
    });
  };

  const tipoOptions = [
    { value: "tipo1", label: "Tipo 1" },
    { value: "tipo2", label: "Tipo 2" },
    { value: "tipo3", label: "Tipo 3" },
  ];

  return (
    <Card>
      <CardHeader><CardTitle>Nuevo [Nombre]</CardTitle></CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <InputForm<[Nombre]FormType>
            form={form}
            name="nombre"
            title="Nombre"
            type="text"
            placeholder="Ej. nombre del [nombre]"
            subTitle="Nombre descriptivo"
            icon={Tag}
          />
          <InputForm<[Nombre]FormType>
            form={form}
            name="descripcion"
            title="Descripción"
            type="text"
            placeholder="Ej. descripción detallada"
            subTitle="Breve descripción"
            icon={FileText}
          />
          <SelectForm<[Nombre]FormType, { value: string; label: string }>
            form={form}
            name="tipo"
            title="Tipo"
            type="select"
            placeholder="Seleccione un tipo"
            subTitle="Categoría del [nombre]"
            options={tipoOptions}
            valueKey="value"
            labelKey="label"
          />
          <Button type="submit" size="lg" disabled={isPending} className="w-full">
            {isPending ? <Spinner className="size-4 animate-spin" /> : <Plus className="size-4" />}
            {isPending ? "Creando..." : "Crear [Nombre]"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
```

#### 2. Edit form — defaultValues desde DTO

```typescript
// modules/[modulo]/ui/[nombre]-edit-form.tsx
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import InputForm from "@/shared/ui/components/input-form";
import SelectForm from "@/shared/ui/components/select-form";
import { Button } from "@/shared/ui/components/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/components/card";
import { Plus, Spinner, FloppyDisk, User, Tag } from "@phosphor-icons/react";
import { [Nombre]FormType, [nombre]FormSchema } from "./schema/schema-[nombre]";
import { update[Nombre]Action } from "../infrastructure/actions/[nombres]-actions";
import type { [Nombre]ItemDTO } from "../application/dtos/[nombre]-dto";

interface [Nombre]EditFormProps {
  item: [Nombre]ItemDTO;
  tipoOptions: { value: string; label: string }[];
}

export default function [Nombre]EditForm({ item, tipoOptions }: [Nombre]EditFormProps) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const form = useForm<[Nombre]FormType>({
    resolver: zodResolver([nombre]FormSchema),
    defaultValues: {
      nombre: item.nombre,
      descripcion: item.descripcion,
      tipo: item.tipo,
    },
  });

  const onSubmit = (data: [Nombre]FormType) => {
    startTransition(async () => {
      const r = await update[Nombre]Action(item.id, data);
      if (r.error) { toast.error(r.error); return; }
      toast.success(r.success);
      router.back();
    });
  };

  return (
    <Card>
      <CardHeader><CardTitle>Editar [Nombre]</CardTitle></CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <InputForm<[Nombre]FormType>
            form={form} name="nombre" title="Nombre" type="text" icon={Tag}
          />
          <InputForm<[Nombre]FormType>
            form={form} name="descripcion" title="Descripción" type="text" icon={User}
          />
          <SelectForm<[Nombre]FormType, { value: string; label: string }>
            form={form} name="tipo" title="Tipo" type="select"
            options={tipoOptions} valueKey="value" labelKey="label"
          />
          <Button type="submit" size="lg" disabled={isPending} className="w-full">
            {isPending ? <Spinner className="size-4 animate-spin" /> : <FloppyDisk className="size-4" />}
            {isPending ? "Guardando..." : "Guardar Cambios"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
```

#### 3. Form con FileForm — subida de archivos multipart

```typescript
// modules/[modulo]/ui/schema/schema-[nombre].ts
import { z } from "zod";

export const [nombre]FormSchema = z.object({
  descripcion: z.string().min(4, "Mínimo 4 caracteres"),
  tipo: z.enum(["Opción 1", "Opción 2", "Opción 3"]),
  archivo: z.instanceof(File).optional(),
});

export type [Nombre]FormType = z.infer<typeof [nombre]FormSchema>;
```

```typescript
// modules/[modulo]/ui/[nombre]-form.tsx
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTransition } from "react";
import { toast } from "sonner";
import InputForm from "@/shared/ui/components/input-form";
import SelectForm from "@/shared/ui/components/select-form";
import FileForm from "@/shared/ui/components/file-form";
import { Button } from "@/shared/ui/components/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/components/card";
import { Plus, Spinner, FileText, Image, ForkKnife } from "@phosphor-icons/react";
import { [Nombre]FormType, [nombre]FormSchema } from "./schema/schema-[nombre]";
import { create[Nombre]Action } from "../infrastructure/actions/[nombres]-actions";

export default function [Nombre]Form({ onSuccess }: { onSuccess?: () => void }) {
  const [isPending, startTransition] = useTransition();
  const form = useForm<[Nombre]FormType>({
    resolver: zodResolver([nombre]FormSchema),
    defaultValues: { descripcion: "", tipo: "Opción 1" },
  });

  const onSubmit = (data: [Nombre]FormType) => {
    startTransition(async () => {
      const r = await create[Nombre]Action({
        descripcion: data.descripcion,
        tipo: data.tipo,
        archivo: data.archivo ?? null,
      });
      if (r.error) { toast.error(r.error); return; }
      toast.success(r.success);
      form.reset();
      onSuccess?.();
    });
  };

  const opciones = [
    { value: "Opción 1", label: "Opción 1" },
    { value: "Opción 2", label: "Opción 2" },
    { value: "Opción 3", label: "Opción 3" },
  ];

  return (
    <Card>
      <CardHeader><CardTitle>Nuevo [Nombre]</CardTitle></CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <SelectForm<[Nombre]FormType, { value: string; label: string }>
            form={form} name="tipo" title="Tipo" type="select"
            placeholder="Seleccione" options={opciones}
            valueKey="value" labelKey="label" icon={ForkKnife}
          />
          <InputForm<[Nombre]FormType>
            form={form} name="descripcion" title="Descripción" type="text"
            placeholder="Ej. descripción" icon={FileText}
          />
          <FileForm<[Nombre]FormType>
            form={form} name="archivo" title="Archivo"
            accept="image/*" subTitle="Sube una imagen (opcional)" icon={Image}
          />
          <Button type="submit" size="lg" disabled={isPending} className="w-full">
            {isPending ? <Spinner className="size-4 animate-spin" /> : <Plus className="size-4" />}
            {isPending ? "Creando..." : "Crear [Nombre]"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
```

#### 4. Form con cascading selects — options desde SWR

```typescript
// modules/[modulo]/ui/[nombre]-form.tsx
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTransition } from "react";
import { toast } from "sonner";
import useSWR from "swr";
import InputForm from "@/shared/ui/components/input-form";
import SelectForm from "@/shared/ui/components/select-form";
import { Button } from "@/shared/ui/components/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/components/card";
import { Plus, Spinner, User, Flag, MapPin } from "@phosphor-icons/react";
import { [Nombre]FormType, [nombre]FormSchema } from "./schema/schema-[nombre]";
import { create[Nombre]Action } from "../infrastructure/actions/[nombres]-actions";
import { fetch[Recurso1]Action, fetch[Recurso2]Action } from "../infrastructure/actions/[nombres]-actions";

export default function [Nombre]Form({ onSuccess }: { onSuccess?: () => void }) {
  const [isPending, startTransition] = useTransition();
  const { data: items1 } = useSWR("[recurso1]-opts", fetch[Recurso1]Action);
  const { data: items2 } = useSWR("[recurso2]-opts", fetch[Recurso2]Action);

  const form = useForm<[Nombre]FormType>({
    resolver: zodResolver([nombre]FormSchema),
    defaultValues: { campo_texto: "", id_recurso1: "", id_recurso2: "" },
  });

  const opciones1 = (items1 ?? []).map((i: { id: number; nombre: string }) => ({ value: String(i.id), label: i.nombre }));
  const opciones2 = (items2 ?? []).map((i: { id: number; nombre: string }) => ({ value: String(i.id), label: i.nombre }));

  const onSubmit = (d: [Nombre]FormType) => {
    startTransition(async () => {
      const r = await create[Nombre]Action({
        campo_texto: d.campo_texto,
        id_recurso1: Number(d.id_recurso1),
        id_recurso2: Number(d.id_recurso2),
      });
      if (r.error) { toast.error(r.error); return; }
      toast.success(r.success);
      form.reset();
      onSuccess?.();
    });
  };

  return (
    <Card>
      <CardHeader><CardTitle>Nuevo [Nombre]</CardTitle></CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <InputForm<[Nombre]FormType>
            form={form} name="campo_texto" title="Campo Texto" type="text" icon={User}
          />
          <SelectForm<[Nombre]FormType, { value: string; label: string }>
            form={form} name="id_recurso1" title="[Recurso 1]" type="select"
            placeholder="Seleccione" options={opciones1}
            valueKey="value" labelKey="label" icon={Flag}
          />
          <SelectForm<[Nombre]FormType, { value: string; label: string }>
            form={form} name="id_recurso2" title="[Recurso 2]" type="select"
            placeholder="Seleccione" options={opciones2}
            valueKey="value" labelKey="label" icon={MapPin}
          />
          <Button type="submit" size="lg" disabled={isPending} className="w-full">
            {isPending ? <Spinner className="size-4 animate-spin" /> : <Plus className="size-4" />}
            {isPending ? "Creando..." : "Crear [Nombre]"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
```

#### 5. Form con CedulaSearch — búsqueda de empleados

```typescript
// modules/[modulo]/ui/schema/schema-[nombre].ts
import { z } from "zod";

export const [nombre]FormSchema = z.object({
  id_[recurso]: z.number().min(1, "Debe buscar un [recurso]"),
  id_opcion: z.string().min(1, "Seleccione una opción"),
});

export type [Nombre]FormType = z.infer<typeof [nombre]FormSchema>;
```

```typescript
// modules/[modulo]/ui/[nombre]-form.tsx
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import SelectForm from "@/shared/ui/components/select-form";
import CedulaSearch from "@/shared/ui/components/cedula-search";
import { Button } from "@/shared/ui/components/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/components/card";
import { Spinner, Link } from "@phosphor-icons/react";
import { [Nombre]FormType, [nombre]FormSchema } from "./schema/schema-[nombre]";
import { create[Nombre]Action } from "../infrastructure/actions/[nombres]-actions";

interface [Nombre]FormProps {
  opciones: { value: string; label: string }[];
}

export default function [Nombre]Form({ opciones }: [Nombre]FormProps) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const form = useForm<[Nombre]FormType>({
    resolver: zodResolver([nombre]FormSchema),
    defaultValues: { id_[recurso]: 0, id_opcion: "" },
  });

  const onSubmit = (data: [Nombre]FormType) => {
    startTransition(async () => {
      const r = await create[Nombre]Action(data);
      if (r.error) { toast.error(r.error); return; }
      toast.success(r.success);
      router.push("/[ruta]");
    });
  };

  return (
    <Card>
      <CardHeader><CardTitle>Asignar [Nombre]</CardTitle></CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <CedulaSearch
            onFound={(data) => {
              if (data.id) form.setValue("id_[recurso]", data.id);
            }}
            required
          />
          <SelectForm<[Nombre]FormType, { value: string; label: string }>
            form={form} name="id_opcion" title="Opción" type="select"
            placeholder="Seleccione" options={opciones}
            valueKey="value" labelKey="label" icon={Link}
          />
          <Button type="submit" size="lg" disabled={isPending} className="w-full">
            {isPending ? <Spinner className="size-4 animate-spin" /> : <Plus className="size-4" />}
            {isPending ? "Asignando..." : "Asignar"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
```

#### 6. Login form — 2 campos + manejo de errores

```typescript
// modules/auth/ui/schema/schema-login.ts
import { z } from "zod";

export const signInSchema = z.object({
  usuario: z.string().min(1, "El usuario es requerido"),
  password: z.string().min(1, "La contraseña es requerida"),
});

export type loginType = z.infer<typeof signInSchema>;
```

```typescript
// modules/auth/ui/login-form.tsx
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import InputForm from "@/shared/ui/components/input-form";
import { Button } from "@/shared/ui/components/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/shared/ui/components/card";
import { User, Key, SignIn, Spinner } from "@phosphor-icons/react";
import { loginType, signInSchema } from "./schema/schema-login";
import { loginAction } from "../infrastructure/actions/auth-actions";

export function LoginForm() {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const form = useForm<loginType>({
    resolver: zodResolver(signInSchema),
    defaultValues: { usuario: "", password: "" },
  });

  const onSubmit = (data: loginType) => {
    startTransition(async () => {
      const result = await loginAction(data);
      if (result.error) { toast.error(result.error); return; }
      toast.success("Bienvenido al sistema");
      router.push("/");
    });
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="items-center pb-4 text-center">
        <CardTitle>Iniciar Sesión</CardTitle>
        <CardDescription>Ingrese sus credenciales</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-5">
          <InputForm<loginType>
            form={form} name="usuario" title="Usuario" type="text"
            placeholder="Ej. 12345678" subTitle="Ingrese su identificación" icon={User}
          />
          <InputForm<loginType>
            form={form} name="password" title="Contraseña" type="password"
            placeholder="••••••••" subTitle="Ingrese su contraseña" icon={Key}
          />
          <Button type="submit" size="lg" disabled={isPending} className="mt-2 w-full">
            {isPending ? <Spinner className="size-4 animate-spin" /> : <SignIn className="size-4" />}
            {isPending ? "Ingresando..." : "Ingresar al Sistema"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
```

#### 7. Form con DateForm + DireccionAdminSelects — filtros

```typescript
// modules/[modulo]/ui/schema/schema-[nombre].ts
import { z } from "zod";

export const [nombre]FormSchema = z.object({
  fecha_inicio: z.string().optional(),
  fecha_fin: z.string().optional(),
  tipo: z.string().optional(),
});

export type [Nombre]FormType = z.infer<typeof [nombre]FormSchema>;
```

```typescript
// modules/[modulo]/ui/[nombre]-form.tsx
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import InputForm from "@/shared/ui/components/input-form";
import SelectForm from "@/shared/ui/components/select-form";
import DateForm from "@/shared/ui/components/date-form";
import DireccionAdminSelects from "@/shared/ui/components/direccion-admin-selects";
import { User } from "@phosphor-icons/react";
import { [Nombre]FormType, [nombre]FormSchema } from "./schema/schema-[nombre]";

export function [Nombre]FilterForm() {
  const form = useForm<[Nombre]FormType>({
    resolver: zodResolver([nombre]FormSchema),
    defaultValues: { fecha_inicio: "", fecha_fin: "", tipo: "", niveles: "", oficina: "", division: "", coordinacion: "" },
  });

  const tipoOptions = [
    { value: "opt1", label: "Opción 1" },
    { value: "opt2", label: "Opción 2" },
  ];

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-4">
        <DateForm<[Nombre]FormType> form={form} name="fecha_inicio" title="Fecha Inicio" placeholder="Seleccione" />
        <DateForm<[Nombre]FormType> form={form} name="fecha_fin" title="Fecha Fin" placeholder="Seleccione" />
      </div>
      <SelectForm<[Nombre]FormType, { value: string; label: string }>
        form={form} name="tipo" title="Tipo" type="select"
        placeholder="Todos" options={tipoOptions} valueKey="value" labelKey="label"
      />
      <InputForm<[Nombre]FormType>
        form={form} name="cedula" title="Cédula" type="text" placeholder="Filtrar por cédula" icon={User}
      />
      <DireccionAdminSelects<[Nombre]FormType>
        form={form} nivelesName="niveles" oficinaName="oficina"
        divisionName="division" coordinacionName="coordinacion"
      />
    </div>
  );
}
```

### Reglas del patrón

- Los forms usan `useTransition` para estados de carga (no useState + useEffect).
- `toast.success`/`toast.error` de `sonner` para feedback.
- `form.reset()` después de crear exitosamente.
- `mutate()` de SWR para refrescar listas después de una operación.
- Los valores de selects vienen como `string` aunque el backend espere `number` — convertir en la server action.
- Schemas con `z.enum()` para selects con opciones fijas, `z.instanceof(File)` para uploads.

---

## Fetching

### Shared: apiClient

```typescript
// shared/infrastructure/http/fetcher-api.ts
export const apiClient = {
  get<T>(path): Promise<T>
  post<T>(path, body?): Promise<T>
  patch<T>(path, body?): Promise<T>
  put<T>(path, body?): Promise<T>
  delete<T>(path): Promise<T>
  postForm<T>(path, formData): Promise<T>       // multipart
  patchForm<T>(path, formData): Promise<T>      // multipart
  getBlob(path): Promise<Blob>                  // binario
};
```

Características internas:

- Lee `dj_access` de cookies (httpOnly) y lo inyecta como `Authorization: Bearer`
- En 401: intenta refresh con `dj_refresh`, si falla lanza `SessionExpiredError`
- En 403: lanza `new Error("No Tienes Permiso Para Ejecutar Esta Acción")`
- Si body es `FormData` → elimina `Content-Type` (lo setea el browser)
- `cache: "no-store"` en todas las requests

### Errores

```typescript
// shared/infrastructure/http/errors.ts
export class SessionExpiredError extends Error {
  name = "SessionExpiredError";
}
export function handleSessionExpired(error: unknown): void {
  if (error instanceof SessionExpiredError) redirect("/signout");
}
```

Toda server action debe capturar `SessionExpiredError`:

```typescript
export async function fetchXAction(): Promise<XDTO[]> {
  try {
    return await listX(repoX);
  } catch (error) {
    handleSessionExpired(error);
    throw error;
  }
}

export async function createXAction(values: XFormType) {
  try {
    await createX(repoX, values);
    return { success: "Creado exitosamente" };
  } catch (error) {
    handleSessionExpired(error);
    return { error: error instanceof Error ? error.message : "Error al crear" };
  }
}
```

### Server Actions + SWR (consumo en UI)

```typescript
// En página componente "use client":
const { data: items, isLoading, mutate } = useSWR("key-unica", fetchXAction);

// Después de crear/actualizar/eliminar:
mutate(); // refresca la lista automáticamente
```

### Patrón HTTP por módulo

Cada módulo define en `infrastructure/http/` funciones que envuelven `apiClient`:

```typescript
// modules/[modulo]/infrastructure/http/[nombres]-api.ts
import { apiClient } from "@/shared/infrastructure/http/fetcher-api";
import { Entity } from "../../domain/entities/[nombre]-entity";
import { mapper } from "../mappers/mapper-[nombre]";

export async function getEntities(): Promise<Entity[]> {
  const data = await apiClient.get<Entity[]>("api-path/");
  return data.map(mapper);
}
export async function postEntity(dto: object): Promise<Entity> {
  const data = await apiClient.post<Entity>("api-path/", dto);
  return mapper(data);
}
export async function patchEntity(id: number, dto: object): Promise<Entity> {
  const data = await apiClient.patch<Entity>(`api-path/${id}/`, dto);
  return mapper(data);
}
export async function deleteEntity(id: number): Promise<void> {
  await apiClient.delete(`api-path/${id}/`);
}
```

### Excepciones — no usan apiClient

| Ubicación                                  | Alternativa                           | Motivo                                                                 |
| ------------------------------------------ | ------------------------------------- | ---------------------------------------------------------------------- |
| `auth.config.ts`                           | `fetch()` directo + `cookies().set()` | Necesita setear `dj_access`/`dj_refresh` antes de que exista apiClient |
| `auth-actions.ts` → `changePasswordAction` | `fetch()` directo                     | Llama endpoint distinto de Django                                      |
| `app/api/reportes/pdf/route.ts`            | `fetch()` directo con cookie          | Proxy que streamnea PDF binario descargable                            |

---

## Query params / Search

### Utility

```typescript
// shared/infrastructure/http/query-params.ts
export function queryParams(
  params: Record<string, string | number | boolean | undefined | null>,
): string {
  // Filtra null/undefined/"" → "?clave=valor&clave2=valor2"
}
```

### Patrón: Búsqueda por cédula

```
CedulaSearch (componente cliente)
  → validateCedulaAction(cedula)     server action
    → queryParams({ cedula })         construye ?cedula=123
      → apiClient.get("employees/?" + qs)  filtra en backend
```

```typescript
// shared/ui/components/cedula-search.tsx  ("use client")
const handleValidate = () => {
  startTransition(async () => {
    const r = await validateCedulaAction(cedula);
    if (r.found) onFound({ id: r.id, nombres: r.nombres, ... });
  });
};

// shared/infrastructure/actions/empleados-actions.ts  ("use server")
export async function validateCedulaAction(cedula: string) {
  if (!cedula || cedula.length < 6) return { found: false };
  try {
    const qs = queryParams({ cedula });
    const data = await apiClient.get<EmployeeResponse>(`employees/${qs}`);
    return { found: true, nombres, apellidos, cedulaIdentidad, id };
  } catch {
    return { found: false };
  }
}
```

### Patrón: Filtro opcional

```typescript
// modules/comedor/infrastructure/http/comedor-api.ts
export async function getMenus(onlyActive?: boolean) {
  const qs = queryParams(onlyActive != null ? { only_active: onlyActive } : {});
  const data = await apiClient.get<MenuEntity[]>(`comedor/menus/${qs}`);
  return data.map(mapperMenu);
}
```

### Patrón: Filtros múltiples para reportes

```typescript
const params = { servicio, cedula, fecha_inicio, fecha_fin, niveles, oficina, ... };
const qs = queryParams(params);
const res = await fetch(`/api/reportes/pdf/${qs}`);
const blob = await res.blob();
const url = createDownloadUrl(blob);  // descarga del PDF
```

### Reglas del patrón

1. `queryParams()` se llama desde Server Action o Server Component, nunca directo desde el cliente (excepto proxy de reportes que va a `app/api/`)
2. Los componentes cliente reciben datos ya filtrados
3. `queryParams` omite automáticamente `null`, `undefined`, `""`
4. `CedulaSearch` es el componente compartido para búsqueda de empleados, acepta callback `onFound`

---

## Shared UI components — ejemplos de código

### Patrón: Form field wrapper

Todos los form fields siguen el mismo patrón: `Controller` de react-hook-form + sistema `Field` de shadcn.

```
Field(data-invalid)
├── FieldLabel
├── [Input | Select | Textarea | etc.]
├── FieldDescription (subTitle)
└── FieldError (errores validación)
```

### InputForm

```typescript
// shared/ui/components/input-form.tsx
import { Controller, FieldValues, Path, UseFormReturn } from "react-hook-form";
import { Field, FieldDescription, FieldError, FieldLabel } from "./field";
import { Input } from "./input";
import { ElementType } from "react";

interface InputForm<T extends FieldValues> {
  form: UseFormReturn<T>;
  title: string;
  placeholder?: string;
  subTitle?: string;
  name: Path<T>;
  type: string;
  className?: string;
  icon?: ElementType;
}

export default function InputForm<T extends FieldValues>(useForm: InputForm<T>) {
  return (
    <Controller
      name={useForm.name}
      control={useForm.form.control}
      render={({ field, fieldState }) => (
        <Field data-invalid={fieldState.invalid}>
          <FieldLabel htmlFor={field.name}>{useForm.title}</FieldLabel>
          <div className="relative flex items-center">
            {useForm.icon && (
              <useForm.icon
                className="absolute left-3 h-5 w-5 text-muted-foreground pointer-events-none"
                aria-hidden="true"
              />
            )}
            <Input
              {...field}
              id={field.name}
              type={useForm.type}
              aria-invalid={fieldState.invalid}
              placeholder={useForm.placeholder ?? ""}
              autoComplete="off"
              className={`${useForm.icon ? "pl-10" : ""} w-full`}
            />
          </div>
          <FieldDescription>{useForm.subTitle}</FieldDescription>
          {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
        </Field>
      )}
    />
  );
}
```

### SelectForm

```typescript
// shared/ui/components/select-form.tsx
import { Controller, FieldValues, Path, UseFormReturn } from "react-hook-form";
import { Field, FieldDescription, FieldError, FieldLabel } from "./field";
import { ElementType } from "react";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "./select";

interface SelectForm<T extends FieldValues, D> {
  form: UseFormReturn<T>;
  title: string;
  placeholder?: string;
  subTitle?: string;
  name: Path<T>;
  type: string;
  options: D[];
  valueKey: keyof D;
  labelKey: keyof D;
  className?: string;
  icon?: ElementType;
}

export default function SelectForm<T extends FieldValues, D>(useForm: SelectForm<T, D>) {
  return (
    <Controller
      name={useForm.name}
      control={useForm.form.control}
      render={({ field, fieldState }) => {
        const selectedLabel = field.value
          ? String(useForm.options.find((o) => String(o[useForm.valueKey]) === field.value)?.[useForm.labelKey] ?? "")
          : "";

        return (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel htmlFor={field.name}>{useForm.title}</FieldLabel>
            <div className="relative flex items-center">
              {useForm.icon && (
                <useForm.icon className="absolute left-3 h-5 w-5 text-muted-foreground pointer-events-none" />
              )}
              <Select name={useForm.name} value={field.value} onValueChange={field.onChange}>
                <SelectTrigger id={field.name} aria-invalid={fieldState.invalid}
                  className={`${useForm.icon ? "pl-10" : ""} w-full text-foreground`}>
                  <SelectValue placeholder={useForm.placeholder ?? ""}>{selectedLabel}</SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {useForm.options.map((item, index) => (
                      <SelectItem key={index} value={String(item[useForm.valueKey])}>
                        {String(item[useForm.labelKey])}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
            <FieldDescription>{useForm.subTitle}</FieldDescription>
            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
          </Field>
        );
      }}
    />
  );
}
```

### DateForm

```typescript
// shared/ui/components/date-form.tsx
"use client";
import { Controller, type FieldValues, type Path, type UseFormReturn } from "react-hook-form";
import { format, parse } from "date-fns";
import { es } from "date-fns/locale";
import { Calendar as CalendarIcon } from "@phosphor-icons/react";
import type { ElementType } from "react";
import { Button } from "./button";
import { Calendar } from "./calendar";
import { Field, FieldDescription, FieldError, FieldLabel } from "./field";
import { Popover, PopoverContent, PopoverTrigger } from "./popover";
import { cn } from "@/lib/utils";

interface DateFormProps<T extends FieldValues> {
  form: UseFormReturn<T>;
  name: Path<T>;
  title: string;
  placeholder?: string;
  subTitle?: string;
  className?: string;
  icon?: ElementType;
}

const DATE_FORMAT = "yyyy-MM-dd";
const DISPLAY_FORMAT = "dd/MM/yyyy";

function parseDate(value: string): Date | undefined {
  const parsed = parse(value, DATE_FORMAT, new Date());
  return isNaN(parsed.getTime()) ? undefined : parsed;
}

export default function DateForm<T extends FieldValues>({ form, name, title, placeholder = "Seleccione una fecha",
  subTitle, className, icon: Icon }: DateFormProps<T>) {
  return (
    <Controller
      name={name}
      control={form.control}
      render={({ field, fieldState }) => {
        const selectedDate = field.value ? parseDate(field.value) : undefined;
        return (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel htmlFor={field.name}>{title}</FieldLabel>
            <Popover>
              <PopoverTrigger id={field.name} aria-invalid={fieldState.invalid} data-slot="popover-trigger"
                render={
                  <Button variant="outline"
                    className={cn("w-full justify-start text-left font-normal", !field.value && "text-muted-foreground", Icon && "pl-10", className)}>
                    {Icon && <Icon className="absolute left-3 h-5 w-5 text-muted-foreground pointer-events-none" />}
                    <CalendarIcon className="size-4 text-muted-foreground" />
                    {field.value ? format(parseDate(field.value)!, DISPLAY_FORMAT, { locale: es }) : <span>{placeholder}</span>}
                  </Button>
                } />
              <PopoverContent className="w-auto p-0">
                <Calendar mode="single" selected={selectedDate}
                  onSelect={(date: Date | undefined) => field.onChange(date ? format(date, DATE_FORMAT) : "")}
                  locale={es} />
              </PopoverContent>
            </Popover>
            <FieldDescription>{subTitle}</FieldDescription>
            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
          </Field>
        );
      }}
    />
  );
}
```

### FileForm

```typescript
// shared/ui/components/file-form.tsx
import { Controller, FieldValues, Path, UseFormReturn } from "react-hook-form";
import { Field, FieldDescription, FieldError, FieldLabel } from "./field";
import { Input } from "./input";
import { ElementType } from "react";

interface FileForm<T extends FieldValues> {
  form: UseFormReturn<T>;
  title: string;
  subTitle?: string;
  name: Path<T>;
  accept?: string;
  className?: string;
  icon?: ElementType;
}

export default function FileForm<T extends FieldValues>(props: FileForm<T>) {
  return (
    <Controller
      name={props.name}
      control={props.form.control}
      render={({ field, fieldState }) => (
        <Field data-invalid={fieldState.invalid}>
          <FieldLabel>{props.title}</FieldLabel>
          <div className="relative flex items-center">
            {props.icon && (
              <props.icon className="absolute left-3 h-5 w-5 text-muted-foreground pointer-events-none" />
            )}
            <Input type="file" accept={props.accept}
              onChange={(e) => field.onChange(e.target.files?.[0] ?? null)}
              className={`${props.icon ? "pl-10" : ""} w-full`}
              ref={field.ref} name={field.name} onBlur={field.onBlur} />
          </div>
          {props.subTitle && <FieldDescription>{props.subTitle}</FieldDescription>}
          {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
        </Field>
      )}
    />
  );
}
```

### TextareaForm

```typescript
// shared/ui/components/textarea-form.tsx
import { Controller, FieldValues, Path, UseFormReturn } from "react-hook-form";
import { Field, FieldDescription, FieldError, FieldLabel } from "./field";
import { Textarea } from "./textarea";

interface TextareaFormProps<T extends FieldValues> {
  form: UseFormReturn<T>;
  title: string;
  placeholder?: string;
  subTitle?: string;
  name: Path<T>;
  className?: string;
}

export default function TextareaForm<T extends FieldValues>(props: TextareaFormProps<T>) {
  return (
    <Controller
      name={props.name}
      control={props.form.control}
      render={({ field, fieldState }) => (
        <Field data-invalid={fieldState.invalid}>
          <FieldLabel htmlFor={field.name}>{props.title}</FieldLabel>
          <Textarea {...field} id={field.name} aria-invalid={fieldState.invalid}
            placeholder={props.placeholder ?? ""} className="min-h-24" />
          <FieldDescription>{props.subTitle}</FieldDescription>
          {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
        </Field>
      )}
    />
  );
}
```

---

### Componentes complejos

### DireccionAdminSelects — 4 selects en cascada

```typescript
// shared/ui/components/direccion-admin-selects.tsx
"use client";
import useSWR from "swr";
import { useEffect } from "react";
import { type FieldValues, type Path, type UseFormReturn } from "react-hook-form";
import SelectForm from "./select-form";
import { fetchDependenciasAction, fetchDireccionesGeneralesAction,
  fetchDireccionesLineaAction, fetchCoordinacionesAction } from "@/shared/infrastructure/actions/direcciones-actions";
import { Building, GitBranch, StackSimple } from "@phosphor-icons/react";

interface DireccionAdminSelectsProps<T extends FieldValues> {
  form: UseFormReturn<T>;
  nivelesName: Path<T>;
  oficinaName: Path<T>;
  divisionName: Path<T>;
  coordinacionName: Path<T>;
}

export default function DireccionAdminSelects<T extends FieldValues>({
  form, nivelesName, oficinaName, divisionName, coordinacionName,
}: DireccionAdminSelectsProps<T>) {
  const { data: dependencias } = useSWR("dependencias", fetchDependenciasAction);
  const { data: direccionesGenerales } = useSWR("direcciones-generales", fetchDireccionesGeneralesAction);
  const { data: direccionesLinea } = useSWR("direcciones-linea", fetchDireccionesLineaAction);
  const { data: coordinaciones } = useSWR("coordinaciones", fetchCoordinacionesAction);

  const selectedNiveles = form.watch(nivelesName);
  const selectedOficina = form.watch(oficinaName);
  const selectedDivision = form.watch(divisionName);

  const opcionesNiveles = (dependencias ?? []).map((d) => ({ value: String(d.id), label: d.dependencia }));
  const opcionesOficinas = (direccionesGenerales ?? [])
    .filter((dg) => String(dg.dependencia_id) === selectedNiveles)
    .map((dg) => ({ value: String(dg.id), label: dg.direccion_general }));
  const opcionesDivisiones = (direccionesLinea ?? [])
    .filter((dl) => String(dl.direccion_general_id) === selectedOficina)
    .map((dl) => ({ value: String(dl.id), label: dl.direccion_linea }));
  const opcionesCoordinaciones = (coordinaciones ?? [])
    .filter((c) => String(c.direccion_linea_id) === selectedDivision)
    .map((c) => ({ value: String(c.id), label: c.coordinacion }));

  // Reseteo en cascada
  useEffect(() => { form.resetField(oficinaName); form.resetField(divisionName); form.resetField(coordinacionName); }, [selectedNiveles]);
  useEffect(() => { form.resetField(divisionName); form.resetField(coordinacionName); }, [selectedOficina]);
  useEffect(() => { form.resetField(coordinacionName); }, [selectedDivision]);

  return (
    <div className="grid grid-cols-2 gap-4">
      <SelectForm<T, { value: string; label: string }> form={form} name={nivelesName} title="Nivel"
        type="select" placeholder="Seleccione un nivel" options={opcionesNiveles}
        valueKey="value" labelKey="label" icon={StackSimple} />
      <SelectForm<T, { value: string; label: string }> form={form} name={oficinaName} title="Oficina / Gerencia"
        type="select" placeholder={selectedNiveles ? "Seleccione una oficina" : "Primero seleccione un nivel"}
        options={opcionesOficinas} valueKey="value" labelKey="label" icon={Building} />
      <SelectForm<T, { value: string; label: string }> form={form} name={divisionName} title="División"
        type="select" placeholder={selectedOficina ? "Seleccione una división" : "Primero seleccione una oficina"}
        options={opcionesDivisiones} valueKey="value" labelKey="label" icon={GitBranch} />
      <SelectForm<T, { value: string; label: string }> form={form} name={coordinacionName} title="Coordinación"
        type="select" placeholder={selectedDivision ? "Seleccione una coordinación" : "Primero seleccione una división"}
        options={opcionesCoordinaciones} valueKey="value" labelKey="label" icon={Building} />
    </div>
  );
}
```

### CedulaSearch — búsqueda de empleados por cédula

```typescript
// shared/ui/components/cedula-search.tsx
"use client";
import { useState, useTransition } from "react";
import { CheckCircle, XCircle, MagnifyingGlass, Spinner } from "@phosphor-icons/react";
import { validateCedulaAction } from "@/shared/infrastructure/actions/empleados-actions";

interface CedulaSearchProps {
  onFound?: (data: { id?: number; cedula: string; nombres: string; apellidos: string }) => void;
  placeholder?: string;
  label?: string;
  required?: boolean;
}

export default function CedulaSearch({ onFound, placeholder = "Ej. 12345678", label = "Cédula", required = false }: CedulaSearchProps) {
  const [cedula, setCedula] = useState("");
  const [result, setResult] = useState<{ found: boolean; nombres?: string; apellidos?: string; id?: number } | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleValidate = () => {
    if (!cedula || cedula.length < 6) return;
    startTransition(async () => {
      const r = await validateCedulaAction(cedula);
      setResult(r);
      if (r.found && onFound) onFound({ id: r.id, cedula: r.cedulaIdentidad, nombres: r.nombres ?? "", apellidos: r.apellidos ?? "" });
    });
  };

  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-medium text-foreground">{label}</label>
      <div className="flex gap-2">
        <input type="text" value={cedula} onChange={(e) => { setCedula(e.target.value); setResult(null); }}
          placeholder={placeholder}
          className="flex-1 rounded-lg border border-input bg-transparent px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-ring/20 outline-none transition-all"
          required={required} />
        <button type="button" onClick={handleValidate} disabled={isPending || cedula.length < 6}
          className="px-3 py-2 rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-1.5">
          {isPending ? <Spinner className="size-4 animate-spin" /> : <MagnifyingGlass className="size-4" />}
          Validar
        </button>
      </div>
      {result && (
        <div className={`flex items-center gap-2 text-sm px-3 py-2 rounded-lg ${result.found ? "bg-success/10 text-success border border-success/20" : "bg-destructive/10 text-destructive border border-destructive/20"}`}>
          {result.found ? (
            <><CheckCircle className="size-4" /><span>{result.nombres} {result.apellidos}</span></>
          ) : (
            <><XCircle className="size-4" /><span>Cédula no encontrada en talento humano</span></>
          )}
        </div>
      )}
    </div>
  );
}
```

---

### Layout components

### PageLayout

```typescript
// shared/ui/layout/page-layout.tsx
import type { LayoutPropsInterface } from "@/shared/types/layout-props";

export default function PageLayout(props: LayoutPropsInterface) {
  return (
    <div className="px-6 py-4 flex flex-col gap-6">
      {props.title && (
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">{props.title}</h1>
          {props.subTitle && <p className="text-sm text-muted-foreground mt-0.5">{props.subTitle}</p>}
        </div>
      )}
      <main>{props.children}</main>
    </div>
  );
}
```

### HeaderLayout

```typescript
// shared/ui/layout/header-layout.tsx
interface HeaderLayoutProps {
  children?: React.ReactNode;     // left (sidebar trigger)
  title?: string;
  subTitle?: string;
  right?: React.ReactNode;        // right (user avatar, logout)
}

export default function HeaderLayout({ children, title, subTitle, right }: HeaderLayoutProps) {
  return (
    <header className="sticky top-0 z-10 flex h-14 items-center justify-between border-b border-border bg-background/80 backdrop-blur-sm px-4">
      <div className="flex items-center gap-2">{children}</div>
      <div className="flex items-center gap-1">
        {title && <span className="text-sm font-medium text-foreground">{title}</span>}
      </div>
      <div className="flex items-center gap-2">{right}</div>
    </header>
  );
}
```

### ReporteFiltrosDialog + ReporteBoton

```typescript
// shared/ui/components/reporte-filtros-dialog.tsx
// Dialog con filtros: fechas, cédula, tipo_comida/tipo_transporte, DireccionAdminSelects
// → queryParams(params) → fetch("/api/reportes/pdf/?" + qs)
// → createDownloadUrl(blob) → descarga automática

// shared/ui/components/reporte-boton.tsx
// Botón "Reporte" que abre el ReporteFiltrosDialog
// Recibe: servicioId, servicioTipo ("comedor" | "transporte")
```

---

## Permisos / Control de acceso

Los permisos vienen de la sesión de next-auth en `session.user.permisos` como `{ id, code, name }[] | null`.

### Leer permisos

**En Server Component (layouts):**

```typescript
import { auth } from "@/auth";

const session = await auth();
const userPermisos = session?.user?.permisos ?? [];
```

**En Client Component (vía useSession):**

```typescript
"use client";
import { useSession } from "next-auth/react";

function Componente() {
  const { data: session } = useSession();
  const userPermisos = session?.user?.permisos ?? [];
}
```

### Render condicional

Mostrar/ocultar elementos según permisos:

```typescript
{userPermisos.some(p => p.code === "manage_vehiculos") && (
  <Link href="/vehiculos/crear">Nuevo Vehículo</Link>
)}
```

### Mostrar permisos de un usuario (ejemplo real)

```typescript
// modules/usuarios/ui/usuarios-page.tsx
{u.permisos?.length ? (
  <div className="flex gap-1 flex-wrap">
    {u.permisos.map((p) => (
      <span key={p.id} className="text-xs px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground">
        {p.name}
      </span>
    ))}
  </div>
) : (
  <span className="text-xs text-muted-foreground">Sin permisos</span>
)}
```

### Asignar permisos a un usuario (toggle buttons)

```typescript
"use client";
import useSWR from "swr";
import { loadPermisosAction } from "../infrastructure/actions/permisos-actions";

const { data: permisosData } = useSWR("permisos-catalog", loadPermisosAction);
const catalogo = permisosData ?? [];

// En el form:
const togglePermiso = (code: string) => {
  const current = form.getValues("permisos") ?? [];
  const updated = current.includes(code)
    ? current.filter((c: string) => c !== code)
    : [...current, code];
  form.setValue("permisos", updated);
};

// En el JSX:
{catalogo.map((p) => {
  const selected = (form.watch("permisos") ?? []).includes(p.code);
  return (
    <button key={p.id} type="button" onClick={() => togglePermiso(p.code)}
      className={`px-3 py-1.5 rounded-lg text-sm ${selected ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
      {p.name}
    </button>
  );
})}
```

---

## RevalidatePath

Usar `revalidatePath` cuando una Server Action modifica datos y la página que los muestra es un **Server Component** (no usa `"use client"` + SWR).

```typescript
"use server";

import { revalidatePath } from "next/cache";
import { repo[Nombre]Api } from "../repositories/repo-[nombre]-api";
import { update[Nombre] } from "../../application/use-cases/update-[nombre]";
import { handleSessionExpired } from "@/shared/infrastructure/http/errors";

export async function toggle[Nombre]Action(id: number, activo: boolean) {
  try {
    await update[Nombre](repo[Nombre]Api, id, { activo });
    revalidatePath("/[ruta]");                          // refresca server components
    return { success: activo ? "Activado" : "Desactivado" };
  } catch (error) {
    handleSessionExpired(error);
    return { error: "Error al cambiar estado" };
  }
}
```

**Regla:** `revalidatePath` refresca la caché de Server Components. Si la página es `"use client"` con SWR, usar `mutate()` en su lugar.

---

## Tema oscuro/claro

El proyecto usa `next-themes` + variables CSS. El `Toaster` de sonner lo integra automáticamente:

```typescript
// shared/ui/components/sonner.tsx
"use client";
import { useTheme } from "next-themes";
import { Toaster as Sonner, type ToasterProps } from "sonner";

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme();
  return <Sonner theme={theme as ToasterProps["theme"]} ... />;
};
```

Los componentes shadcn/ui ya tienen variantes `dark:` en sus estilos. El tema se controla con la clase `.dark` en `<html>`.

### ThemeToggle (ejemplo)

```typescript
"use client";
import { useTheme } from "next-themes";
import { Sun, Moon } from "@phosphor-icons/react";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  return (
    <button onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent">
      {theme === "dark" ? <Sun className="size-4" /> : <Moon className="size-4" />}
    </button>
  );
}
```

---

## Reportes PDF

Flujo completo para generar y descargar PDFs desde Django:

```
ReporteBoton (cliente)
  → abre ReporteFiltrosDialog
    → form con filtros (fechas, cédula, tipo, selects organizacionales)
    → queryParams(params)
    → fetch("/api/reportes/pdf/?" + qs)
      → API Route (app/api/reportes/pdf/route.ts)
        → lee dj_access de cookie
        → fetch(DJANGO_API_SERVER + "reportes/pdf/?..." + query)   proxy a Django
        → retorna Blob
    → createDownloadUrl(blob)     descarga el PDF
    → revokeDownloadUrl(url)      limpia al cerrar
```

### API Route — proxy PDF

```typescript
// app/api/reportes/pdf/route.ts
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const { cookies } = await import("next/headers");
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("dj_access")?.value;

  if (!accessToken) {
    return NextResponse.json({ detail: "No autenticado" }, { status: 401 });
  }

  const searchParams = request.nextUrl.searchParams.toString();
  const djangoUrl = `${process.env.DJANGO_API_SERVER}reportes/pdf/?${searchParams}`;

  const res = await fetch(djangoUrl, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!res.ok) {
    return NextResponse.json(
      { detail: `Error del servidor: ${res.status}` },
      { status: res.status },
    );
  }

  return new NextResponse(res.body, {
    headers: {
      "Content-Type": res.headers.get("Content-Type") ?? "application/pdf",
      "Content-Disposition":
        res.headers.get("Content-Disposition") ??
        "attachment; filename=reporte.pdf",
    },
  });
}
```

### Cliente — filtros + descarga

```typescript
// shared/ui/components/reporte-filtros-dialog.tsx (resumen)
const params: Record<string, string | number | boolean | undefined | null> = {
  servicio: servicioId,
  cedula: data.cedula,
  fecha_inicio: data.fecha_inicio,
  fecha_fin: data.fecha_fin,
  niveles: data.niveles,
  oficina: data.oficina,
  // ...
};
const qs = queryParams(params);

setIsPending(true);
try {
  const res = await fetch(`/api/reportes/pdf/${qs}`);
  const blob = await res.blob();
  const url = createDownloadUrl(blob);
  setDownloadUrl(url); // se descarga automáticamente via <a ref>
} catch (error) {
  toast.error("Error al generar el reporte");
} finally {
  setIsPending(false);
}
```

### Blob utils

```typescript
// shared/infrastructure/http/blob-utils.ts
export function createDownloadUrl(blob: Blob): string {
  return URL.createObjectURL(blob);
}

export function revokeDownloadUrl(url: string): void {
  URL.revokeObjectURL(url);
}
```

---

## Loading States

El proyecto usa 5 patrones distintos para estados de carga.

### a. useTransition — Botón con Spinner (forms)

```typescript
"use client";
import { useTransition } from "react";
import { Spinner, Plus } from "@phosphor-icons/react";
import { Button } from "@/shared/ui/components/button";

export default function [Nombre]Form() {
  const [isPending, startTransition] = useTransition();

  const onSubmit = (data: [Nombre]FormType) => {
    startTransition(async () => {
      const r = await create[Nombre]Action(data);
      if (r.error) { toast.error(r.error); return; }
      toast.success(r.success);
      form.reset();
    });
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      <Button type="submit" disabled={isPending}>
        {isPending ? <Spinner className="size-4 animate-spin" /> : <Plus className="size-4" />}
        {isPending ? "Creando..." : "Crear"}
      </Button>
    </form>
  );
}
```

### b. SWR isLoading — Spinner central (listas)

```typescript
const { data: items, isLoading, mutate } = useSWR("[nombres]", fetch[Nombres]Action);

{isLoading ? (
  <div className="flex justify-center py-6">
    <Spinner className="size-6 animate-spin text-muted-foreground" />
  </div>
) : !items?.length ? (
  <p className="text-center text-muted-foreground py-6">No hay [nombres] registrados.</p>
) : (
  items.map((item) => (
    <Card key={item.id}>...</Card>
  ))
)}
```

### c. Skeleton — placeholder de carga

```typescript
// shared/ui/components/skeleton.tsx
export function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div data-slot="skeleton"
      className={cn("animate-pulse rounded-md bg-muted", className)}
      {...props} />
  );
}

// Uso:
<div className="space-y-3">
  <Skeleton className="h-4 w-[250px]" />
  <Skeleton className="h-4 w-[200px]" />
  <Skeleton className="h-4 w-[150px]" />
</div>
```

### d. Loading page — app router

```typescript
// app/(app)/loading.tsx
"use client";
export default function Loading() {
  // Animación personalizada visible al navegar entre rutas
  return (
    <div className="flex h-full min-h-[60vh] flex-col items-center justify-center gap-8">
      <div className="relative size-28">
        {/* Cuadrados rotando con animación */}
      </div>
      <p className="text-sm font-medium text-muted-foreground">Cargando</p>
    </div>
  );
}
```

### e. EmptyState — sin datos

```typescript
// shared/ui/components/empty.tsx
import { Tray } from "@phosphor-icons/react";
import { Button } from "./button";

interface EmptyStateProps {
  title?: string;
  description?: string;
  action?: { label: string; onClick: () => void };
}

export function EmptyState({ title = "Sin datos", description = "No hay información disponible.", action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-12 text-center">
      <div className="flex size-12 items-center justify-center rounded-full bg-muted">
        <Tray className="size-6 text-muted-foreground" />
      </div>
      <p className="text-sm font-medium text-foreground">{title}</p>
      <p className="text-xs text-muted-foreground max-w-[280px]">{description}</p>
      {action && <Button variant="outline" size="sm" onClick={action.onClick}>{action.label}</Button>}
    </div>
  );
}

// Uso:
import { EmptyState } from "@/shared/ui/components/empty";
{!items?.length && <EmptyState title="Sin vehículos" description="No hay vehículos registrados." />}
```

---

## Server Components vs Client Components

### Reglas

| Si necesitas...                                                                     | Marca                            |
| ----------------------------------------------------------------------------------- | -------------------------------- |
| Hooks (`useState`, `useEffect`, `useTransition`, `useForm`, `useSWR`, `useSession`) | `"use client"`                   |
| Eventos (`onClick`, `onChange`, `onSubmit`)                                         | `"use client"`                   |
| Solo renderizar props + JSX                                                         | **Sin** `"use client"`           |
| `async` + `await` para fetch de datos                                               | **Sin** `"use client"`           |
| `auth()` de next-auth                                                               | **Sin** `"use client"`           |
| Componentes shadcn/ui interactivos                                                  | Ya tienen `"use client"` interno |

### Patrón del proyecto

```typescript
// ✅ Server Component — app/(app)/servicios/page.tsx
// No lleva "use client", es thin wrapper o async data fetcher
export default async function Page() {
  const servicios = await listServicios(repoServiciosApi);
  return <ServiciosPage servicios={servicios} />;
}

// ✅ Client Component — modules/servicios/ui/servicios-page.tsx
// Lleva "use client" porque usa hooks o eventos
"use client";
export default function ServiciosPage({ servicios }: { servicios: ServicioItemDTO[] }) {
  // usa useState, useTransition, etc.
}

// ✅ Excepción: páginas con useSWR
"use client";
export default function VehiculosPage() {
  const { data } = useSWR("vehiculos", fetchVehiculosAction);
  // ...
}

// ✅ Excepción: páginas con form submit
"use client";
export default function LoginForm() {
  const form = useForm<loginType>(...);
  // ...
}
```

### Árbol de decisión

```
¿El componente usa hooks, eventos, estado local o interactividad?
├── Sí → "use client"
└── No → ¿Necesita ser asíncrono (async/await)?
    ├── Sí → Server Component (sin "use client")
    └── No → Server Component (sin "use client")
```

**Nota:** Las páginas en `modules/*/ui/` suelen ser `"use client"`. Las páginas en `app/` suelen ser Server Components. Los componentes de `shared/ui/components/` ya manejan su propia directiva internamente.

## .env

### Variables

| Variable                     | Server-only | Dónde se usa                                                                                                                                       |
| ---------------------------- | ----------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| `DJANGO_API_SERVER`          | ✅          | `shared/commons/api.ts` → base URL de todos los `apiClient` calls. También directo en `auth.config.ts`, `auth-actions.ts`, `reportes/pdf/route.ts` |
| `NEXTAUTH_URL`               | ✅          | next-auth para callbacks                                                                                                                           |
| `AUTH_SECRET`                | ✅          | next-auth para firmar JWT                                                                                                                          |
| `DJANGO_API_URL`             | ✅          | Legacy, no se usa                                                                                                                                  |
| `NEXT_PUBLIC_DJANGO_API_URL` | ❌          | Legacy, no se usa en ningún cliente                                                                                                                |

### Reglas

1. **No se necesita `NEXT_PUBLIC_`** — El `apiClient` corre solo en Server Actions y Server Components. Nunca se expone la URL al cliente.
2. **`DJANGO_API_SERVER` es la única URL que importa** — Definida en `shared/commons/api.ts`, el resto de módulos ni tocan `process.env` directo.
3. **Excepciones** — `auth.config.ts`, `auth-actions.ts` y `reportes/pdf/route.ts` leen `process.env.DJANGO_API_SERVER` directo porque operan fuera del `apiClient`.
4. **Docker** — `next.dockerfile` NO copia `.env`. Las variables se pasan en tiempo de ejecución.
5. **`.env` está en git** — Contiene defaults de desarrollo. `.env.example` es el template. Para producción se sobreescribe con env vars del deployment.

---

## Plantillas de archivos base

### Entity — `domain/entities/[nombre]-entity.ts`

```typescript
export interface [Nombre]Entity {
  readonly id: number;
  [campo]: string;
}

export function create[Nombre]Entity(entity: [Nombre]Entity): [Nombre]Entity {
  if (!entity.[campo]) throw new Error("[Nombre]: [campo] requerido");
  return entity;
}
```

### Value Object — `domain/value-objects/[nombre]-vo.ts`

```typescript
export type [Nombre]VO = {
  readonly value: string;
};

export function crear[Nombre]VO(valor: string): [Nombre]VO {
  if (!valor || valor.trim().length === 0) {
    throw new Error("[Nombre]VO inválido: valor requerido");
  }
  return { value: valor.trim() };
}
```

### Repository port — `domain/ports/repo-[nombre].ts`

```typescript
import type { [Nombre]Entity } from "../entities/[nombre]-entity";

export interface Repo[Nombre] {
  getAll(): Promise<[Nombre]Entity[]>;
  getById(id: number): Promise<[Nombre]Entity>;
  create(params: object): Promise<[Nombre]Entity>;
  update(id: number, params: object): Promise<[Nombre]Entity>;
  remove(id: number): Promise<void>;
}
```

### DTO — `application/dtos/[nombre]-dto.ts`

```typescript
export interface [Nombre]ItemDTO {
  id: number;
  [campo]: string;
}

export interface Create[Nombre]DTO {
  [campo]: string;
}

export interface Update[Nombre]DTO {
  [campo]?: string;
}
```

### Use case — `application/use-cases/[accion]-[nombre].ts`

```typescript
import type { Repo[Nombre] } from "../../domain/ports/repo-[nombre]";
import type { [Nombre]ItemDTO } from "../dtos/[nombre]-dto";

export async function list[Nombres](repo: Repo[Nombre]): Promise<[Nombre]ItemDTO[]> {
  const entities = await repo.getAll();
  return entities.map((e) => ({
    id: e.id,
    [campo]: e.[campo],
  }));
}

export async function create[Nombre](repo: Repo[Nombre], dto: Create[Nombre]DTO): Promise<[Nombre]ItemDTO> {
  const entity = await repo.create(dto);
  return { id: entity.id, [campo]: entity.[campo] };
}
```

### Mapper — `infrastructure/mappers/mapper-[nombre].ts`

```typescript
import { create[Nombre]Entity, [Nombre]Entity } from "../../domain/entities/[nombre]-entity";

export function mapper[Nombre](values: [Nombre]Entity): [Nombre]Entity {
  return create[Nombre]Entity({
    id: values.id,
    [campo]: values.[campo] ?? "",
  });
}
```

### HTTP API — `infrastructure/http/[nombres]-api.ts`

```typescript
import { apiClient } from "@/shared/infrastructure/http/fetcher-api";
import { [Nombre]Entity } from "../../domain/entities/[nombre]-entity";
import { mapper[Nombre] } from "../mappers/mapper-[nombre]";

export async function get[Nombres](): Promise<[Nombre]Entity[]> {
  const data = await apiClient.get<[Nombre]Entity[]>("api-path/");
  return data.map(mapper[Nombre]);
}

export async function post[Nombre](dto: object): Promise<[Nombre]Entity> {
  const data = await apiClient.post<[Nombre]Entity>("api-path/", dto);
  return mapper[Nombre](data);
}

export async function patch[Nombre](id: number, dto: object): Promise<[Nombre]Entity> {
  const data = await apiClient.patch<[Nombre]Entity>(`api-path/${id}/`, dto);
  return mapper[Nombre](data);
}

export async function delete[Nombre](id: number): Promise<void> {
  await apiClient.delete(`api-path/${id}/`);
}
```

### Repository impl — `infrastructure/repositories/repo-[nombre]-api.ts`

```typescript
import type { Repo[Nombre] } from "../../domain/ports/repo-[nombre]";
import { get[Nombres], post[Nombre], patch[Nombre], delete[Nombre] } from "../http/[nombres]-api";

export const repo[Nombre]Api: Repo[Nombre] = {
  getAll: get[Nombres],
  getById: async (id) => { const items = await get[Nombres](); return items.find(i => i.id === id)!; },
  create: post[Nombre],
  update: patch[Nombre],
  remove: delete[Nombre],
};
```

### Server Action — `infrastructure/actions/[nombres]-actions.ts`

```typescript
"use server";

import { repo[Nombre]Api } from "../repositories/repo-[nombre]-api";
import { list[Nombres] } from "../../application/use-cases/list-[nombres]";
import { create[Nombre] } from "../../application/use-cases/create-[nombre]";
import type { [Nombre]ItemDTO } from "../../application/dtos/[nombre]-dto";
import { handleSessionExpired } from "@/shared/infrastructure/http/errors";

export async function fetch[Nombres]Action(): Promise<[Nombre]ItemDTO[]> {
  try {
    return await list[Nombres](repo[Nombre]Api);
  } catch (error) {
    handleSessionExpired(error);
    throw error;
  }
}

export async function create[Nombre]Action(values: {
  [campo]: string;
}) {
  try {
    await create[Nombre](repo[Nombre]Api, values);
    return { success: "[Nombre] creado exitosamente" };
  } catch (error) {
    handleSessionExpired(error);
    return { error: error instanceof Error ? error.message : "Error al crear [nombre]" };
  }
}

export async function delete[Nombre]Action(id: number) {
  try {
    await repo[Nombre]Api.remove(id);
    return { success: "[Nombre] eliminado" };
  } catch (error) {
    handleSessionExpired(error);
    return { error: error instanceof Error ? error.message : "Error al eliminar" };
  }
}
```

### Zod Schema — `ui/schema/schema-[nombre].ts`

```typescript
import { z } from "zod";

export const [nombre]FormSchema = z.object({
  [campo]: z.string().min(1, "El campo es requerido"),
});

export type [Nombre]FormType = z.infer<typeof [nombre]FormSchema>;
```

### Form component — `ui/[nombre]-form.tsx`

```typescript
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTransition } from "react";
import { toast } from "sonner";
import InputForm from "@/shared/ui/components/input-form";
import SelectForm from "@/shared/ui/components/select-form";
import { Button } from "@/shared/ui/components/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/components/card";
import { Plus, Spinner } from "@phosphor-icons/react";
import { [Nombre]FormType, [nombre]FormSchema } from "./schema/schema-[nombre]";
import { create[Nombre]Action } from "../infrastructure/actions/[nombres]-actions";

interface [Nombre]FormProps {
  onSuccess?: () => void;
}

export default function [Nombre]Form({ onSuccess }: [Nombre]FormProps) {
  const [isPending, startTransition] = useTransition();
  const form = useForm<[Nombre]FormType>({
    resolver: zodResolver([nombre]FormSchema),
    defaultValues: { [campo]: "" },
  });

  const onSubmit = (data: [Nombre]FormType) => {
    startTransition(async () => {
      const r = await create[Nombre]Action(data);
      if (r.error) { toast.error(r.error); return; }
      toast.success(r.success);
      form.reset();
      onSuccess?.();
    });
  };

  return (
    <Card>
      <CardHeader><CardTitle>Nuevo [Nombre]</CardTitle></CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <InputForm form={form} name="[campo]" title="[Campo]" type="text" />
          <Button type="submit" disabled={isPending}>
            {isPending ? <Spinner /> : <Plus />}
            {isPending ? "Creando..." : "Crear [Nombre]"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
```

### Page component — `ui/[nombres]-page.tsx`

```typescript
"use client";

import useSWR from "swr";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import PageLayout from "@/shared/ui/layout/page-layout";
import { Button } from "@/shared/ui/components/button";
import { Card, CardContent } from "@/shared/ui/components/card";
import { Spinner, Pencil, Trash } from "@phosphor-icons/react";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/shared/ui/components/alert-dialog";
import { fetch[Nombres]Action, delete[Nombre]Action } from "../infrastructure/actions/[nombres]-actions";
import [Nombre]Form from "./[nombre]-form";

export default function [Nombres]Page() {
  const { data: items, isLoading, mutate } = useSWR("[nombres]", fetch[Nombres]Action);
  const [isPending, startTransition] = useTransition();
  const [deleteTarget, setDeleteTarget] = useState<number | null>(null);

  const handleDeleteConfirm = () => {
    if (!deleteTarget) return;
    startTransition(async () => {
      const r = await delete[Nombre]Action(deleteTarget);
      if (r.error) { toast.error(r.error); setDeleteTarget(null); return; }
      toast.success(r.success);
      setDeleteTarget(null);
      mutate();
    });
  };

  return (
    <PageLayout title="[Nombres]" subTitle="Gestión de [nombres]">
      <[Nombre]Form onSuccess={() => mutate()} />

      {isLoading ? (
        <div className="flex justify-center py-6"><Spinner className="size-6 animate-spin" /></div>
      ) : !items?.length ? (
        <p className="text-center text-muted-foreground py-6">No hay [nombres] registrados.</p>
      ) : (
        <div className="grid gap-3 mt-6">
          {(items ?? []).map((item) => (
            <Card key={item.id}>
              <CardContent className="flex items-center justify-between">
                <span className="text-foreground font-medium">{item.[campo]}</span>
                <button onClick={() => setDeleteTarget(item.id)} className="cursor-pointer p-2 text-muted-foreground hover:text-destructive">
                  <Trash className="size-4" />
                </button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <AlertDialog open={deleteTarget !== null} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar?</AlertDialogTitle>
            <AlertDialogDescription>Esta acción no se puede deshacer.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm} disabled={isPending} variant="destructive">Eliminar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </PageLayout>
  );
}
```

---

## Reglas de validación Onion

| Regla   | Violación                                                                               | Mensaje                                                                                                                                     |
| ------- | --------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| **R1**  | `domain/` importa de `application/`, `infrastructure/`, `ui/` o externo                 | ❌ **R1**: Domain no puede importar de capas externas. Solo puede importar de otros archivos dentro de `domain/`.                           |
| **R2**  | `application/` importa de `infrastructure/` o `ui/`                                     | ❌ **R2**: Application no puede importar de infrastructure ni ui. Solo puede importar de `domain/`.                                         |
| **R3**  | `ui/` importa de `infrastructure/`                                                      | ❌ **R3**: UI no puede importar de infrastructure. Los datos deben llegar por props (DTOs) o Server Actions.                                |
| **R4**  | Un caso de uso instancia un repositorio con `new` o importa una implementación concreta | ❌ **R4**: Los casos de uso deben recibir el repositorio por parámetro (inyección de dependencias), no instanciarlo directamente.           |
| **R5**  | Un componente UI recibe una entidad del dominio en lugar de un DTO                      | ❌ **R5**: UI debe recibir DTOs, no entidades de dominio. Las entidades contienen lógica de dominio que no debe exponerse.                  |
| **R6**  | Imports relativos con más de 2 `../`                                                    | ⚠️ **R6**: Considera usar alias de importación (`@/modules/...`) en lugar de rutas relativas largas.                                        |
| **R7**  | Una Server Action no captura `SessionExpiredError` ni llama `handleSessionExpired()`    | ❌ **R7**: Toda Server Action debe capturar errores y llamar `handleSessionExpired(error)` para redireccionar al login si la sesión expiró. |
| **R8**  | Un componente UI con llamada asíncrona no usa `useTransition`                           | ❌ **R8**: Toda operación asíncrona en UI (submit, delete) debe usar `useTransition` + `startTransition` para manejar loading state.        |
| **R9**  | Archivo de feature no sigue kebab-case                                                  | ❌ **R9**: Los archivos deben usar kebab-case (`vehiculo-entity.ts`, `schema-vehiculo.ts`), no PascalCase ni camelCase.                     |
| **R10** | `app/` page contiene lógica de UI o de negocio en lugar de delegar al módulo            | ⚠️ **R10**: Las páginas en `app/` deben ser thin wrappers. La lógica de UI y negocio debe estar en `modules/*/ui/`.                         |

---

## Comandos

### 1. Crear una feature

```
@skill crea la feature de [nombre] en el módulo [modulo]
```

**Flujo:**

1. Verificar si `modules/[modulo]/` existe. Si no, preguntar si crearlo.
2. Preguntar: _"¿Es un sub-módulo o módulo independiente?"_
3. Crear estructura completa de carpetas según el patrón elegido.
4. Generar archivos base desde las plantillas (entity, port, DTO, use-cases, API, mapper, repo, actions, schema, form, page).
5. Preguntar: _"¿Quieres agregar campos adicionales a la entidad?"_
6. Preguntar: _"¿Usa SelectForm (necesita options de otro módulo) o FileForm (subida de archivos)?"_
7. Preguntar: _"¿Necesita búsqueda por cédula (CedulaSearch)?"_

### 2. Validar una feature

```
@skill valida [feature] en [modulo]
```

Lee todos los archivos de la feature y aplica las reglas de validación Onion (R1-R10). Reporta violaciones con mensajes y sugerencias.

### 3. Sugerir mejoras

```
@skill sugiere mejoras en [modulo]
```

Escanea todas las features del módulo, detecta VOs, tipos, componentes o schemas duplicados. Si encuentra duplicación entre 2+ features, sugiere migrar a `modules/[modulo]/shared/` o `shared/` raíz.

---

## Instrucciones adicionales

1. **Siempre confirmar** antes de sobrescribir archivos existentes.
2. Si el usuario no especifica el módulo, preguntar: _"¿En qué módulo deseas crear la feature? (ej: transporte, apoyo, comedor, servicios, usuarios)"_
3. Al crear una feature, preguntar por campos adicionales después de generar la estructura base.
4. Si durante la validación se detecta que un VO/tipo se repite en 2+ features del mismo módulo, sugerir migrar a `modules/[modulo]/shared/`.
5. Si se repite en 2+ módulos diferentes, sugerir migrar a `shared/` raíz.
6. Revisar que las Server Actions sigan el patrón try/catch con `handleSessionExpired()`.
7. Revisar que los forms usen `useTransition` para loading states.
8. Verificar que los archivos sigan kebab-case.

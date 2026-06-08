# CasaCuenta

CasaCuenta es una aplicación web para la gestión de gastos personales y familiares. Permite registrar, organizar, monitorear y exportar gastos, incorporando autenticación de usuarios, roles familiares, administración global, control de categorías y reglas de seguridad mediante Supabase Row Level Security.

El proyecto fue desarrollado como un MVP funcional orientado a resolver una necesidad doméstica real: centralizar el control de gastos individuales y familiares en una plataforma web simple, segura y accesible.

## Demo

Aplicación desplegada en Vercel:

https://casa-cuenta.vercel.app

## Tecnologías utilizadas

* React
* Vite
* Supabase Auth
* Supabase PostgreSQL
* Supabase Row Level Security
* Supabase RPC Functions
* CSS modular
* Vercel

## Funcionalidades principales

### Autenticación y cuenta de usuario

* Registro de usuarios.
* Inicio de sesión.
* Recuperación de contraseña por correo.
* Cambio de contraseña desde enlace de recuperación.
* Cambio de correo desde la sección Mi cuenta.
* Cambio de contraseña desde la sección Mi cuenta.
* Validación de cuentas activas e inactivas.

### Gestión de gastos

* Registro de gastos personales.
* Edición de gastos propios.
* Eliminación de gastos propios.
* Filtros por fecha, categoría, método de pago y descripción.
* Separación entre gastos propios, familiares y globales.
* Visualización de indicadores rápidos en el dashboard.

### Gestión familiar

* Crear una familia.
* Unirse a una familia mediante código de invitación.
* Visualizar miembros de la familia.
* Consultar roles familiares.
* Ver fecha de unión o creación.
* Consultar total gastado por miembro.
* Salir de una familia.
* Disolver familia como administrador familiar.

### Roles y permisos

El sistema separa los permisos en dos niveles: rol global y rol familiar.

#### Rol global

* `admin`: administrador general del sistema.
* `user`: usuario normal del sistema.

#### Rol familiar

* `user`: usuario sin familia.
* `member`: miembro de una familia.
* `family_admin`: administrador de una familia.

Esta separación permite que un administrador global también pueda pertenecer a una familia sin perder sus permisos administrativos dentro del sistema.

### Categorías

* Categorías globales para usuarios sin familia.
* Categorías familiares para usuarios con familia.
* Administración de categorías globales por parte del administrador general.
* Administración de categorías familiares por parte del administrador familiar.
* Uso de categorías activas por parte de los miembros.

### Panel de administración

Disponible únicamente para usuarios con `system_role = admin`.

Incluye:

* Cantidad total de usuarios.
* Cantidad total de familias.
* Cuentas activas e inactivas.
* Cantidad total de gastos.
* Total gastado global.
* Listado de usuarios.
* Listado de familias.
* Filtros por estado y rol.
* Activación y desactivación de cuentas.

### Analítica y resumen

El dashboard incluye indicadores y visualizaciones como:

* Total gastado en el mes.
* Total gastado en el día.
* Cantidad de gastos registrados.
* Categoría con mayor gasto.
* Promedio diario del mes.
* Método de pago más utilizado.
* Usuario con mayor gasto.
* Comparación con el mes anterior.
* Gasto por categoría.
* Gasto por mes.
* Gasto por método de pago.
* Gasto por usuario.

### Exportaciones

La aplicación permite exportar información en formato CSV:

* Mis gastos.
* Gastos familiares, disponible para `family_admin`.
* Gastos globales, disponible para `admin`.

## Arquitectura general

CasaCuenta utiliza una arquitectura frontend conectada directamente con Supabase como Backend as a Service.

El frontend fue desarrollado con React y Vite. Supabase se utiliza para autenticación, base de datos PostgreSQL, políticas de seguridad RLS y funciones RPC para operaciones sensibles.

```txt
Usuario
  ↓
Frontend React + Vite
  ↓
Supabase Auth
  ↓
Supabase PostgreSQL + RLS + RPC
  ↓
Vercel Deployment
```

## Estructura del proyecto

```txt
src/
  components/
    auth/
      AuthLayout.jsx
    layout/
      AppNavigation.jsx
      DashboardHeader.jsx
      DashboardSection.jsx
      LoadingScreen.jsx
    CategoryManager.jsx
    CreateFamily.jsx
    ExpenseForm.jsx
    ExpenseTable.jsx
    FamilyPanel.jsx
    Filters.jsx
    JoinFamily.jsx
    MyAccount.jsx
    SummaryCards.jsx

  pages/
    Dashboard.jsx
    ForgotPassword.jsx
    Login.jsx
    Register.jsx
    ResetPassword.jsx

  sections/
    AccountSection.jsx
    AdminSection.jsx
    AnalyticsSection.jsx
    CategoriesSection.jsx
    ExpensesSection.jsx
    ExportsSection.jsx
    FamilyExpensesSection.jsx
    FamilySection.jsx
    GlobalExpensesSection.jsx
    OverviewSection.jsx

  services/
    supabaseClient.js

  styles/
    account.css
    admin.css
    analytics.css
    auth.css
    categories.css
    dashboard.css
    expenses.css
    exports.css
    family.css
    layout.css
    monitor.css

  utils/
    logger.js

  App.jsx
  App.css
  index.css
  main.jsx
```

## Modelo de base de datos

El sistema utiliza las siguientes tablas principales en Supabase.

### `profiles`

Guarda la información de los usuarios dentro del sistema.

Campos principales:

* `id`
* `email`
* `full_name`
* `system_role`
* `role`
* `family_id`
* `is_active`
* `created_at`
* `joined_family_at`

### `families`

Guarda la información de las familias creadas.

Campos principales:

* `id`
* `name`
* `invite_code`
* `created_by`
* `is_active`
* `created_at`
* `deleted_at`

### `categories`

Guarda categorías globales y familiares.

Campos principales:

* `id`
* `family_id`
* `name`
* `is_active`
* `created_by`
* `created_at`
* `updated_at`

### `expenses`

Guarda los gastos registrados por los usuarios.

Campos principales:

* `id`
* `family_id`
* `user_id`
* `category_id`
* `expense_date`
* `amount`
* `description`
* `payment_method`
* `created_at`

## Seguridad

CasaCuenta implementa Row Level Security en Supabase para proteger el acceso a los datos.

Reglas generales aplicadas:

* Cada usuario puede crear, editar y eliminar únicamente sus propios gastos.
* El administrador familiar puede monitorear los gastos de su familia, pero no editar gastos ajenos.
* El administrador global puede monitorear información general del sistema, pero no editar gastos ajenos.
* Las acciones sensibles se realizan mediante funciones RPC.
* La gestión de categorías se controla mediante funciones RPC.
* La activación y desactivación de cuentas se realiza mediante funciones RPC.
* Las operaciones familiares, como crear, unirse, abandonar o disolver una familia, se gestionan mediante funciones RPC.

Esta estructura evita depender únicamente de validaciones en el frontend y permite reforzar la protección de datos desde la base de datos.

## Variables de entorno

Crear un archivo `.env` tomando como base `.env_example`:

```env
VITE_SUPABASE_URL=tu_url_de_supabase
VITE_SUPABASE_ANON_KEY=tu_anon_key_de_supabase
```

No se deben subir archivos `.env` reales al repositorio.

## Instalación y ejecución local

Clonar el repositorio:

```bash
git clone <url-del-repositorio>
cd casa-cuenta-app
```

Instalar dependencias:

```bash
npm install
```

Crear el archivo de variables de entorno:

```bash
cp .env_example .env
```

Configurar las variables de entorno con los datos del proyecto Supabase.

Ejecutar en modo desarrollo:

```bash
npm run dev
```

## Scripts disponibles

Ejecutar entorno de desarrollo:

```bash
npm run dev
```

Generar build de producción:

```bash
npm run build
```

Previsualizar build de producción:

```bash
npm run preview
```

Ejecutar revisión de código con ESLint:

```bash
npm run lint
```

## Configuración en Supabase

Para que el proyecto funcione correctamente, se debe configurar:

* Supabase Auth.
* Email provider de Supabase.
* Redirect URL para recuperación de contraseña.
* Tablas principales.
* Funciones RPC.
* Políticas RLS.
* Variables de entorno en desarrollo y producción.

Redirect URLs recomendadas:

```txt
http://localhost:5173/reset-password
https://tu-dominio/reset-password
```

## Despliegue

El proyecto puede desplegarse en Vercel.

Pasos generales:

1. Subir el proyecto a GitHub.
2. Importar el repositorio en Vercel.
3. Agregar las variables de entorno:

   * `VITE_SUPABASE_URL`
   * `VITE_SUPABASE_ANON_KEY`
4. Configurar en Supabase la URL de producción para recuperación de contraseña.
5. Ejecutar el despliegue.

## Estado del proyecto

El proyecto se encuentra en versión MVP funcional.

Incluye:

* Autenticación completa.
* Gestión de gastos propios.
* Gestión familiar.
* Monitoreo familiar.
* Monitoreo global.
* Panel de administración.
* Gráficas básicas.
* Exportaciones CSV.
* Políticas RLS.
* Diseño responsive.

## Próximas mejoras

* Exportación en formato Excel.
* Filtros avanzados en exportaciones.
* Transferencia de administración familiar.
* Regeneración de código de invitación.
* Presupuestos mensuales.
* Alertas de gastos.
* Mejoras visuales en gráficas.
* Historial de auditoría para acciones administrativas.

## Autor

Desarrollado por Axel Pariona como proyecto MVP de gestión de gastos personales y familiares.

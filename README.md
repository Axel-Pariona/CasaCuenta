# CasaCuenta

CasaCuenta es una aplicación web para registrar, organizar, monitorear y exportar gastos personales y familiares. El sistema permite que un usuario gestione sus propios gastos, cree o se una a una familia, revise gastos familiares según su rol y, en el caso del administrador global, monitoree la información general del sistema.

## Tecnologías utilizadas

- React
- Vite
- Supabase Auth
- Supabase Database
- Supabase Row Level Security
- CSS modular por secciones

## Funcionalidades principales

### Autenticación

- Registro de usuarios.
- Inicio de sesión.
- Recuperación de contraseña por correo.
- Cambio de contraseña desde enlace de recuperación.
- Cambio de correo desde Mi cuenta.
- Cambio de contraseña desde Mi cuenta.
- Validación de cuentas activas e inactivas.

### Gestión de gastos

- Registro de gastos propios.
- Edición de gastos propios.
- Eliminación de gastos propios.
- Filtros por fecha, categoría, método de pago y descripción.
- Separación entre gastos propios, gastos familiares y gastos globales.

### Familias

- Crear familia.
- Unirse a una familia mediante código de invitación.
- Ver nombre de la familia.
- Ver código de invitación.
- Ver miembros de la familia.
- Ver rol de cada miembro.
- Ver fecha de unión o creación.
- Ver total gastado por miembro.
- Salir de una familia.
- Disolver familia como administrador familiar.

### Roles

El sistema separa los permisos en dos niveles.

#### Rol global

- `admin`: administrador general del sistema.
- `user`: usuario normal del sistema.

#### Rol familiar

- `user`: usuario sin familia.
- `member`: miembro de una familia.
- `family_admin`: administrador de una familia.

Esta separación permite que un administrador global también pueda pertenecer a una familia sin perder sus permisos administrativos.

### Categorías

- Categorías globales para usuarios sin familia.
- Categorías familiares para usuarios con familia.
- El administrador global administra categorías globales.
- El administrador familiar administra categorías de su familia.
- Los miembros solo utilizan categorías activas.

### Panel de administración

Disponible solo para usuarios con `system_role = admin`.

Incluye:

- Cantidad total de usuarios.
- Cantidad total de familias.
- Cuentas activas e inactivas.
- Cantidad total de gastos.
- Total gastado global.
- Listado de usuarios.
- Listado de familias.
- Filtros por estado y rol.
- Activación y desactivación de cuentas.

### Gráficas

Incluye visualizaciones básicas con CSS:

- Gasto por categoría.
- Gasto por mes.
- Gasto por método de pago.
- Gasto por usuario.

### Resumen

El dashboard muestra indicadores rápidos como:

- Total del mes.
- Total de hoy.
- Cantidad de gastos.
- Categoría con más gasto.
- Promedio diario del mes.
- Método de pago más usado.
- Usuario con mayor gasto.
- Comparación con el mes anterior.

### Exportaciones

La aplicación permite exportar datos en formato CSV:

- Mis gastos.
- Gastos familiares, para `family_admin`.
- Gastos globales, para `admin`.

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

## Base de datos principal

El sistema utiliza las siguientes tablas principales en Supabase.

### `profiles`

Guarda la información del usuario dentro del sistema.

Campos principales:

- `id`
- `email`
- `full_name`
- `system_role`
- `role`
- `family_id`
- `is_active`
- `created_at`
- `joined_family_at`

### `families`

Guarda las familias creadas.

Campos principales:

- `id`
- `name`
- `invite_code`
- `created_by`
- `is_active`
- `created_at`
- `deleted_at`

### `categories`

Guarda categorías globales y familiares.

Campos principales:

- `id`
- `family_id`
- `name`
- `is_active`
- `created_by`
- `created_at`
- `updated_at`

### `expenses`

Guarda los gastos registrados.

Campos principales:

- `id`
- `family_id`
- `user_id`
- `category_id`
- `expense_date`
- `amount`
- `description`
- `payment_method`
- `created_at`

## Seguridad

El proyecto utiliza Row Level Security en Supabase.

Reglas generales:

- Cada usuario puede crear, editar y eliminar solo sus propios gastos.
- El administrador familiar puede monitorear gastos de su familia, pero no editar gastos ajenos.
- El administrador global puede monitorear gastos globales, pero no editar gastos ajenos.
- Las acciones sensibles se realizan mediante funciones RPC.
- La gestión de categorías se realiza mediante RPC.
- La activación y desactivación de cuentas se realiza mediante RPC.
- Las familias se crean, unen, abandonan o disuelven mediante RPC.

## Variables de entorno

Crear un archivo `.env` tomando como base `.env_example`:

```env
VITE_SUPABASE_URL=tu_url_de_supabase
VITE_SUPABASE_ANON_KEY=tu_anon_key_de_supabase
```

## Instalación

Clonar el repositorio:

```bash
git clone <url-del-repositorio>
cd casa-cuenta-app
```

Instalar dependencias:

```bash
npm install
```

Crear el archivo `.env`:

```bash
cp .env_example .env
```

Configurar las variables de entorno con los datos del proyecto Supabase.

Ejecutar en desarrollo:

```bash
npm run dev
```

## Scripts disponibles

```bash
npm run dev
```

Ejecuta el proyecto en modo desarrollo.

```bash
npm run build
```

Genera la versión de producción.

```bash
npm run preview
```

Permite previsualizar la versión generada.

```bash
npm run lint
```

Ejecuta la revisión de código con ESLint.

## Configuración en Supabase

Para que el proyecto funcione correctamente, se debe configurar:

- Supabase Auth.
- Email provider de Supabase.
- Redirect URL para recuperación de contraseña.
- Tablas principales.
- Funciones RPC.
- Políticas RLS finales.
- Variables de entorno en local y producción.

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
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
4. Configurar en Supabase la URL de producción para recuperación de contraseña.
5. Ejecutar despliegue.

## Estado del proyecto

El proyecto se encuentra en versión MVP.

Incluye:

- Autenticación completa.
- Gestión de gastos propios.
- Gestión familiar.
- Monitoreo familiar.
- Monitoreo global.
- Panel admin.
- Gráficas.
- Exportaciones CSV.
- RLS final.
- Diseño responsive.

## Próximas mejoras

Posibles mejoras futuras:

- Exportación en formato Excel.
- Filtros avanzados en exportaciones.
- Transferir administración familiar.
- Regenerar código de invitación.
- Presupuestos mensuales.
- Alertas de gastos.
- Mejoras visuales en gráficas.
- Historial de auditoría para acciones administrativas.

## Autor

Desarrollado por Axel Pariona como proyecto MVP de gestión de gastos personales y familiares.

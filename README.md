# Pistech Notes - Gestión de Anotaciones y Cobros

Una aplicación web moderna para la gestión de anotaciones, proyectos, cobros de clientes y pagos a socios, construida con React, TypeScript y Material-UI, integrada con un backend NestJS.

## 🚀 Características

### 🔐 Autenticación
- Login con JWT
- Rutas protegidas
- Gestión de tokens automática
- Validación automática de tokens
- Logout automático en errores 401/403

### 📝 Gestión de Notas
- Crear, editar y eliminar notas
- Búsqueda por título, contenido y etiquetas
- Sistema de etiquetas para organización
- Interfaz intuitiva con tabla paginada
- Filtros avanzados y búsqueda en tiempo real
- Soft delete (eliminación lógica)

### 🏢 Gestión de Proyectos
- Crear y gestionar proyectos
- Estados: Activo, Completado, En Pausa, Cancelado, Pendiente
- Descripción detallada de cada proyecto
- Filtrado y búsqueda avanzada
- Paginación
- Soft delete y restauración
- Formato de moneda automático en campos de monto

### 💰 Cobros de Clientes
- Registro de cobros con múltiples monedas (ARS, USD, EUR)
- Métodos de pago: Efectivo, Transferencia, Tarjeta, Cheque, Otro
- Asociación con proyectos específicos
- Formato de moneda automático con símbolos
- Filtros por rango de fechas y montos
- Paginación
- Soft delete
- Interfaz con tarjetas responsivas

### 👥 Pagos a Socios
- Gestión de pagos a colaboradores/partners
- Mismas funcionalidades que cobros de clientes
- Seguimiento de pagos por socio
- Filtros avanzados
- Tabla paginada con vista detallada
- Formato de moneda automático
- Soft delete

### 👥 Gestión de Socios
- CRUD completo de socios
- Roles: Propietario, Colaborador
- Roles Pistech: Developer, Designer, Manager, RRHH, Contador, Marketing, Ventas, Otro
- Tabla con paginación
- Filtros por nombre, nickname, teléfono y roles
- Soft delete y restauración

### 📊 Dashboard
- Vista general de métricas importantes
- Resumen de notas, proyectos, cobros y pagos
- Desglose por moneda
- Actividad reciente
- Carga de datos desde API

### 📋 Registro de Actividad (Logs)
- Vista completa de logs del sistema
- Filtros por acción, tipo de entidad, fecha
- Detalles completos de cada cambio
- Paginación
- Vista detallada de cambios (oldData vs newData)
- Filtros avanzados por IP, User Agent, etc.

### 🌙 Modo Oscuro
- Toggle entre modo claro y oscuro
- Persistencia de preferencia
- Interfaz adaptativa
- Temas dinámicos

## 🛠️ Tecnologías Utilizadas

- **React 19** - Biblioteca de interfaz de usuario
- **TypeScript** - Tipado estático
- **Material-UI (MUI) 7** - Componentes de UI
- **React Router** - Navegación entre páginas
- **Zustand** - Gestión de estado
- **date-fns** - Manipulación de fechas
- **Vite** - Herramienta de construcción
- **pnpm** - Gestor de paquetes
- **NestJS Backend** - API REST con MongoDB

## 📦 Instalación

1. **Clonar el repositorio**
   ```bash
   git clone <repository-url>
   cd pistech-notes
   ```

2. **Instalar dependencias**
   ```bash
   pnpm install
   ```

3. **Configurar variables de entorno**
   ```bash
   # Crear archivo .env
   echo "VITE_API_URL=http://localhost:3000" > .env
   ```

4. **Ejecutar en modo desarrollo**
   ```bash
   pnpm dev
   ```

5. **Abrir en el navegador**
   ```
   http://localhost:5173
   ```

**Nota**: Asegúrate de que el backend NestJS esté ejecutándose en `http://localhost:3000`

## 🏗️ Estructura del Proyecto

```
src/
├── components/          # Componentes reutilizables
│   └── Layout.tsx      # Layout principal con navegación
├── contexts/           # Contextos de React
│   └── ThemeContext.tsx # Gestión del tema (modo oscuro)
├── pages/              # Páginas de la aplicación
│   ├── Dashboard.tsx   # Página principal
│   ├── Notes.tsx       # Gestión de notas
│   ├── Projects.tsx    # Gestión de proyectos
│   ├── ClientCharges.tsx    # Cobros de clientes
│   ├── PartnerPayments.tsx  # Pagos a socios
│   ├── Partners.tsx    # Gestión de socios
│   ├── Logs.tsx        # Registro de actividad
│   └── Login.tsx       # Página de login
├── services/           # Servicios de datos
│   └── apiService.ts   # Servicio de API para backend
├── stores/             # Stores de Zustand
│   ├── authStore.ts    # Store de autenticación
│   ├── clientChargeStore.ts # Store de cobros de clientes
│   ├── partnerPaymentStore.ts # Store de pagos a socios
│   ├── projectStore.ts # Store de proyectos
│   ├── partnerStore.ts # Store de socios
│   └── index.ts        # Exportaciones de stores
├── types/              # Definiciones de TypeScript
│   └── index.ts        # Interfaces y tipos
├── utils/              # Utilidades
│   ├── formatters.ts   # Funciones de formateo
│   └── helpers.ts      # Funciones auxiliares
└── App.tsx            # Componente principal
```

## 🎨 Características de Diseño

- **Responsive**: Funciona perfectamente en desktop y móvil
- **Material Design**: Interfaz moderna y consistente
- **Navegación intuitiva**: Menú lateral con navegación clara
- **Búsqueda en tiempo real**: Filtrado instantáneo en todas las secciones
- **Formularios optimizados**: Validación y UX mejorada
- **Formato de moneda**: Campos de monto con formato automático
- **Loading states**: Indicadores de carga en todas las operaciones
- **Error handling**: Manejo robusto de errores con alertas

## 💾 Almacenamiento de Datos

La aplicación utiliza **API REST** con backend NestJS:
- **Autenticación**: JWT tokens con persistencia en localStorage
- **Datos**: MongoDB con Mongoose
- **Soft Delete**: Eliminación lógica en todas las entidades
- **Paginación**: Soporte completo para listas grandes
- **Filtros**: Filtros avanzados en todas las entidades

## 🔧 Scripts Disponibles

```bash
# Desarrollo
pnpm dev

# Construcción para producción
pnpm build

# Vista previa de la construcción
pnpm preview

# Linting
pnpm lint
```

## 🚀 Despliegue

Para desplegar la aplicación:

1. **Construir para producción**
   ```bash
   pnpm build
   ```

2. **Los archivos generados estarán en `dist/`**

3. **Servir los archivos estáticos desde cualquier servidor web**

4. **Configurar la variable de entorno `VITE_API_URL` para apuntar al backend**

## 📱 Características Móviles

- **Navegación adaptativa**: Menú hamburguesa en móvil
- **Tablas responsivas**: Se adaptan al tamaño de pantalla
- **Formularios optimizados**: Campos táctiles amigables
- **FAB (Floating Action Button)**: Acceso rápido a crear elementos
- **Diálogos responsivos**: Modales que se adaptan a móvil

## 🔄 Integración con Backend

### Endpoints Principales

#### Autenticación
- `POST /auth/login` - Login de usuario
- `POST /auth/register` - Registro de usuario
- `GET /auth/validate` - Validación de token

#### Notas
- `GET /notes` - Obtener todas las notas
- `POST /notes` - Crear nota
- `PATCH /notes/:id` - Actualizar nota
- `DELETE /notes/:id` - Eliminar nota (soft delete)

#### Proyectos
- `GET /projects` - Obtener todos los proyectos
- `POST /projects` - Crear proyecto
- `PATCH /projects/:id` - Actualizar proyecto
- `DELETE /projects/:id` - Eliminar proyecto (soft delete)

#### Cobros de Clientes
- `GET /client-charges` - Obtener todos los cobros
- `POST /client-charges` - Crear cobro
- `PATCH /client-charges/:id` - Actualizar cobro
- `DELETE /client-charges/:id` - Eliminar cobro (soft delete)

#### Pagos a Socios
- `GET /partner-payments` - Obtener todos los pagos
- `POST /partner-payments` - Crear pago
- `PATCH /partner-payments/:id` - Actualizar pago
- `DELETE /partner-payments/:id` - Eliminar pago (soft delete)

#### Socios
- `GET /partners` - Obtener todos los socios
- `POST /partners` - Crear socio
- `PATCH /partners/:id` - Actualizar socio
- `DELETE /partners/:id` - Eliminar socio (soft delete)

#### Logs
- `GET /logs` - Obtener logs del sistema
- `GET /logs/:id` - Obtener log específico

### Características de la API

- **Paginación**: Todos los endpoints soportan paginación
- **Filtros**: Filtros avanzados por múltiples campos
- **Soft Delete**: Eliminación lógica con posibilidad de restauración
- **Validación**: Validación robusta de datos
- **Logging**: Registro automático de todas las operaciones

## 🎯 Funcionalidades Implementadas

### ✅ Completadas
- [x] Autenticación JWT completa
- [x] Gestión de notas con CRUD
- [x] Gestión de proyectos con estados
- [x] Cobros de clientes con múltiples monedas
- [x] Pagos a socios con gestión de partners
- [x] Gestión de socios con roles
- [x] Dashboard con métricas
- [x] Sistema de logs completo
- [x] Modo oscuro
- [x] Formato de moneda automático
- [x] Paginación en todas las listas
- [x] Filtros avanzados
- [x] Soft delete en todas las entidades
- [x] Manejo de errores robusto
- [x] Loading states
- [x] Responsive design

### 🚧 En Desarrollo
- [ ] Exportación de datos a Excel/PDF
- [ ] Gráficos y reportes avanzados
- [ ] Notificaciones push
- [ ] Backup automático
- [ ] Filtros por fecha más avanzados

## 🤝 Contribución

1. Fork el proyecto
2. Crear una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abrir un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo [LICENSE](LICENSE) para detalles.

---

Desarrollado con ❤️ para Pistech

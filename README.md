# Gruas Tre-Mart SPA

Este proyecto es una aplicación web desarrollada con **React** y **Vite** que proporciona un sistema profesional de gestión de servicios de grúas para vehículos terrestres. La aplicación permite a los usuarios registrarse, iniciar sesión y realizar solicitudes de grúas, mientras que los operadores y administradores pueden gestionar y visualizar las actividades relacionadas.

## Características

- **Autenticación**: Registro, inicio de sesión y cierre de sesión utilizando Supabase como backend de autenticación.
- **Gestión de roles**: Los usuarios tienen roles como `ADMIN`, `OPERATOR` o `CLIENT`, que determinan las funcionalidades disponibles.
- **Solicitudes de grúas**: Los clientes pueden realizar solicitudes de grúas proporcionando información detallada y ubicaciones.
- **Geolocalización**: Uso de mapas interactivos con Leaflet para seleccionar ubicaciones actuales y destinos.
- **Tablas de actividades**: Visualización de actividades recientes con paginación para operadores y administradores.
- **Diseño responsivo**: Interfaz de usuario diseñada con TailwindCSS para adaptarse a diferentes dispositivos.

## Estructura del Proyecto

El proyecto está organizado de la siguiente manera:

```
src/
├── components/        # Componentes reutilizables
│   ├── access/        # Componentes relacionados con autenticación
│   ├── common/        # Componentes comunes como NavBar y Spinner
│   ├── customer/      # Componentes específicos para clientes
├── config/            # Configuración de Supabase
├── hooks/             # Hooks personalizados
├── pages/             # Páginas principales de la aplicación
├── sections/          # Secciones como Header, Footer y Hero
├── styles/            # Archivos de estilos globales
├── App.jsx            # Componente principal de la aplicación
├── main.jsx           # Punto de entrada de la aplicación
```

## Tecnologías Utilizadas

- **Frontend**:
  - [React](https://reactjs.org/) para la construcción de la interfaz de usuario.
  - [React Router](https://reactrouter.com/) para la navegación entre páginas.
  - [TailwindCSS](https://tailwindcss.com/) para estilos rápidos y responsivos.
  - [Leaflet](https://leafletjs.com/) para mapas interactivos.

- **Backend**:
  - [Supabase](https://supabase.com/) para autenticación y gestión de usuarios.
  - API REST para la gestión de datos de solicitudes y roles.

- **Herramientas de Desarrollo**:
  - [Vite](https://vitejs.dev/) para un entorno de desarrollo rápido.
  - [ESLint](https://eslint.org/) para mantener la calidad del código.
  - [PostCSS](https://postcss.org/) para procesamiento de estilos.

## Instalación y Configuración

1. **Clonar el repositorio**:
   ```bash
   git clone <URL_DEL_REPOSITORIO>
   cd gruastremart-spa
   ```

2. **Instalar dependencias**:
   ```bash
   npm install
   ```

3. **Configurar variables de entorno**: Crear un archivo `.env` en la raíz del proyecto con las siguientes variables:
   ```env
   VITE_SUPABASE_URL=<tu_supabase_url>
   VITE_SUPABASE_ANON_KEY=<tu_supabase_anon_key>
   VITE_API_DOMAIN_URL=<tu_api_domain_url>
   ```

4. **Iniciar el servidor de desarrollo**:
   ```bash
   npm run dev
   ```

5. **Construir para producción**:

### Scripts Disponibles

- `npm run dev`: Inicia el servidor de desarrollo.
- `npm run build`: Construye la aplicación para producción.
- `npm run preview`: Previsualiza la aplicación construida.
- `npm run lint`: Ejecuta ESLint para verificar la calidad del código.

## Funcionalidades Clave

### Autenticación

- Implementada con Supabase.
- Hooks personalizados como `useAuth` y `useProvideAuth` para manejar el estado de autenticación.

### Gestión de Roles

- Los roles (`ADMIN`, `OPERATOR`, `CLIENT`) determinan las vistas y funcionalidades disponibles.
- El hook `useGetRole` obtiene el rol del usuario autenticado.

### Geolocalización

- Uso de Leaflet para mostrar mapas interactivos.
- Los usuarios pueden seleccionar su ubicación actual y un destino.

### Tablas de Actividades

- Páginas como `OperatorActivity` e `InternalActivity` muestran actividades recientes con paginación.

## Licencia

Este proyecto está bajo la licencia MIT. Consulta el archivo LICENSE para más detalles.

¡Gracias por usar Gruas Tre-Mart SPA! 🚗🚨

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

## Integración con Capacitor y Android

A partir de la versión móvil, la aplicación puede ejecutarse como app nativa en Android usando [Capacitor](https://capacitorjs.com/).

### Instalación y configuración de Capacitor

1. **Instalar Capacitor y la plataforma Android:**
   ```bash
   npm install @capacitor/core @capacitor/cli
   npx cap init
   npx cap add android
   ```

2. **Construir la app web y copiar al proyecto nativo:**
   ```bash
   npm run build
   npx cap copy android
   ```

3. **Abrir el proyecto en Android Studio:**
   ```bash
   npx cap open android
   ```

### Ajustes importantes para Android

- **SDK y Gradle:**
  - Usar `compileSdk` y `targetSdkVersion` en 34, y `minSdkVersion` en 23 (ajustar en `android/app/build.gradle`).
  - Forzar versiones de dependencias como `androidx.core:core` y `core-ktx` a 1.13.1, y librerías de Kotlin a 1.8.22 para evitar conflictos.
  - Configurar el JDK a la versión 17 en variables de entorno y en Android Studio.

- **Permisos:**
  - Revisar y aceptar los permisos de ubicación en el dispositivo.
  - Si la app falla al instalar, habilitar la depuración USB en el dispositivo Android.

- **Variables de entorno:**
  - La URL de la API que utiliza la app se define en el archivo `.env` mediante la variable `VITE_API_DOMAIN_URL`.
  - Para desarrollo local en dispositivo físico, usa la IP local de tu máquina (por ejemplo, `http://192.168.1.100:3000`).
  - Si quieres conectarte a un entorno de pruebas, staging o producción, solo debes cambiar el valor de `VITE_API_DOMAIN_URL` en el `.env` por la URL correspondiente.
  - Tras modificar `.env`, reconstruye la app y vuelve a copiar los archivos con `npx cap copy android` para que los cambios tengan efecto en la app móvil.

### Ejecución y pruebas en dispositivo

- Conectar el dispositivo Android por USB y habilitar la depuración.
- Desde Android Studio, seleccionar el dispositivo y ejecutar la app.
- Si hay errores de permisos o instalación, revisar los logs y los pasos anteriores.

### Solución de problemas comunes

- **Errores de dependencias o SDK:**
  - Revisar y forzar versiones compatibles en los archivos `build.gradle`.
  - Limpiar y reconstruir el proyecto tras cada ajuste importante.

- **Problemas de red:**
  - Usar la IP local en la configuración de la API.
  - Verificar que el dispositivo y la máquina estén en la misma red WiFi.

- **Permisos de ubicación:**
  - Asegurarse de aceptar los permisos al abrir la app.
  - Revisar la configuración de permisos en el sistema Android si la ubicación no funciona.

### Recomendaciones

- Mantener el código web y móvil sincronizado usando los comandos de build y copy de Capacitor.
- Probar la app en diferentes dispositivos y versiones de Android para asegurar compatibilidad.
- Consultar la [documentación oficial de Capacitor](https://capacitorjs.com/docs) para detalles avanzados.

## Licencia

Este proyecto está bajo la licencia MIT. Consulta el archivo LICENSE para más detalles.

¡Gracias por usar Gruas Tre-Mart SPA! 🚗🚨

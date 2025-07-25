# Gruas Tre-Mart SPA

Este proyecto es una aplicación web desarrollada con **React** y **Vite** que proporciona un sistema profesional de gestión de servicios de grúas para vehículos terrestres. La aplicación permite a los usuarios registrarse, iniciar sesión y realizar solicitudes de grúas, mientras que los operadores y administradores pueden gestionar y visualizar las actividades relacionadas.

## Características

- **Autenticación**: Registro, inicio de sesión y cierre de sesión utilizando Supabase como backend de autenticación.
- **Gestión de roles**: Los usuarios tienen roles que determinan las funcionalidades disponibles.
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

## Arquitectura y Tecnologías

### Arquitectura

La aplicación sigue una arquitectura moderna basada en componentes con las siguientes características:

- **Arquitectura de Componentes**: Organización modular con componentes reutilizables y específicos por dominio.
- **Gestión de Estado**: Uso de React Hooks para manejar el estado de la aplicación sin necesidad de librerías externas.
- **Patrón de Servicios**: Separación clara entre la lógica de negocio y la interfaz de usuario mediante servicios.
- **Enrutamiento**: Sistema de rutas basado en React Router para la navegación entre páginas.
- **Autenticación**: Implementación de un sistema de autenticación basado en tokens con Supabase.
- **Geolocalización**: Integración de mapas y servicios de ubicación en tiempo real.

### Tecnologías Utilizadas

- **Frontend**:
  - [React 19](https://reactjs.org/) para la construcción de la interfaz de usuario.
  - [React Router 7](https://reactrouter.com/) para la navegación entre páginas.
  - [TailwindCSS](https://tailwindcss.com/) para estilos rápidos y responsivos.
  - [Leaflet](https://leafletjs.com/) para mapas interactivos.
  - [Lucide React](https://lucide.dev/) para iconos modernos y personalizables.
  - [HeroIcons](https://heroicons.com/) como biblioteca complementaria de iconos.

- **Backend**:
  - [Supabase](https://supabase.com/) para autenticación y gestión de usuarios.
  - API REST para la gestión de datos de solicitudes, operadores y ubicaciones.

- **Aplicación Móvil**:
  - [Capacitor](https://capacitorjs.com/) para convertir la aplicación web en una aplicación móvil nativa.
  - Configuración específica para Android con soporte para geolocalización.

- **Herramientas de Desarrollo**:
  - [Vite 6](https://vitejs.dev/) para un entorno de desarrollo rápido y eficiente.
  - [ESLint 9](https://eslint.org/) para mantener la calidad del código.
  - [PostCSS](https://postcss.org/) para procesamiento avanzado de estilos.
  - [SWC](https://swc.rs/) como compilador rápido para React a través de @vitejs/plugin-react-swc.

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

- Los roles determinan las vistas y funcionalidades disponibles.
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

3. **Abrir el proyecto en Android Studio (opcional, se puede hacer todo por consola):**
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

## 📦 Cómo firmar e instalar el APK de release (paso a paso)

0. **Crea tu keystore (Solo la primera vez )**

Si aún no tienes una keystore para firmar tus APKs, genera una con el siguiente comando:

```bash
keytool -genkey -v -keystore gruas-key.keystore -alias my-key-alias -keyalg RSA -keysize 2048 -validity 10000
```

- **-keystore gruas-key.keystore**: nombre del archivo que se creará (puedes poner la ruta completa si quieres).
- **-alias my-key-alias**: alias de la clave (debe coincidir con el que uses en apksigner).
- **-keyalg RSA -keysize 2048**: tipo y tamaño de clave recomendados.
- **-validity 10000**: años de validez (puedes cambiarlo).

El comando te pedirá una contraseña y algunos datos (nombre, organización, etc.).

Guarda bien el archivo y la contraseña, los necesitarás para firmar futuras versiones del APK.

1. **Compila el APK de release**

   Ejecuta desde la raíz del proyecto:
   ```bash
   cd android
   ./gradlew assembleRelease
   ```
   El APK sin firmar se generará en:
   `android/app/build/outputs/apk/release/app-release-unsigned.apk`

2. **Alinea el APK con zipalign**

   ```bash
   <ruta-a-build-tools>/zipalign -v 4 \
     android/app/build/outputs/apk/release/app-release-unsigned.apk \
     android/app/build/outputs/apk/release/app-release-aligned.apk
   ```
   > Cambia `<ruta-a-build-tools>` por la ruta real de tu Android SDK, por ejemplo en windows sería: `C:/Users/tu_usuario/AppData/Local/Android/Sdk/build-tools/34.0.0`

3. **Firma el APK alineado con apksigner**

   ```bash
   <ruta-a-build-tools>/apksigner sign \
     --ks /ruta/a/tu/keystore.jks \
     --ks-key-alias tu-alias \
     --out android/app/build/outputs/apk/release/app-release-signed.apk \
     android/app/build/outputs/apk/release/app-release-aligned.apk
   ```
   > Cambia `/ruta/a/tu/keystore.jks` y `tu-alias` por los datos de tu keystore.

4. **Verifica la firma del APK**

   ```bash
   <ruta-a-build-tools>/apksigner verify android/app/build/outputs/apk/release/app-release-signed.apk
   ```
   Debe mostrar: `Verified` o `Verification successful`.

5. **Desinstala versiones anteriores de la app en el dispositivo**

   ```bash
   adb uninstall com.gruastremart.app
   ```

6. **Copia el APK firmado al dispositivo y ábrelo para instalar**
   - Usa el explorador de archivos o:
   ```bash
   adb install -r android/app/build/outputs/apk/release/app-release-signed.apk
   ```

---

**Notas:**
- No modifiques el APK después de firmarlo.
- Si tienes problemas de instalación, revisa la versión mínima de Android y la arquitectura.
- Si ves errores de firma, repite el proceso asegurando el orden: zipalign → apksigner.
- Para mas informacion consulta el fichero [README_APK_GENERATION.md](README_APK_GENERATION.md).

## Licencia

Este proyecto está bajo la licencia MIT. Consulta el archivo LICENSE para más detalles.

¡Gracias por usar Gruas Tre-Mart SPA! 🚗🚨

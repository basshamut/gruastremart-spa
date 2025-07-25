# Cómo crear el archivo KeyStore

Para firmar el APK necesitas un archivo KeyStore. Si no tienes uno, puedes crearlo ejecutando el siguiente comando en tu terminal:

```bash
keytool -genkeypair -v \
  -keystore gruas-key.keystore \
  -alias gruastremart-key-alias \
  -keyalg RSA \
  -keysize 2048 \
  -validity 10000
```

- **-keystore**: nombre del archivo keystore a crear (puedes cambiarlo si lo deseas)
- **-alias**: alias de la clave dentro del keystore (debe coincidir con el usado en los scripts)
- **-keyalg**: algoritmo de la clave (RSA recomendado)
- **-keysize**: tamaño de la clave (2048 recomendado)
- **-validity**: días de validez de la clave (10000 es más de 27 años)

El comando te pedirá que introduzcas una contraseña para el keystore y otra para la clave.

# Generación del APK para Android

Este documento explica cómo generar un APK firmado para la aplicación Android de Gruas Tre-Mart.

## Requisitos previos

- Node.js y npm instalados
- Android Studio instalado
- JDK 17 configurado
- Variables de entorno ANDROID_HOME y JAVA_HOME configuradas correctamente

## Proceso de generación del APK

### Opción 1: Usando el script automatizado

Hemos creado scripts que automatizan todo el proceso de compilación y firma del APK:

#### Para Windows (CMD):

1. Ejecuta el archivo `build-signed-apk.bat` en Windows CMD
2. Introduce las contraseñas cuando se soliciten (o configúralas como variables de entorno)

#### Para Git Bash, Linux o macOS:

1. Ejecuta el archivo `build-signed-apk.sh`:
   ```bash
   chmod +x build-signed-apk.sh  # Solo la primera vez para hacerlo ejecutable
   ./build-signed-apk.sh
   ```
2. Introduce las contraseñas cuando se soliciten (o configúralas como variables de entorno)

#### Ambos scripts realizarán los siguientes pasos:
- Compilar la aplicación web con `npm run build`
- Copiar los archivos a la plataforma Android con `npx cap copy android`
- Compilar el APK de release con Gradle

El APK firmado se generará en: `android/app/build/outputs/apk/release/app-release.apk`

### Opción 2: Proceso manual

Si prefieres realizar el proceso manualmente, sigue estos pasos:

1. **Configura las variables de entorno para la firma**

   ```bash
   set KEYSTORE_PASSWORD=tu_contraseña_del_keystore
   set KEY_ALIAS=my-key-alias
   set KEY_PASSWORD=tu_contraseña_de_la_clave
   ```

2. **Compila la aplicación web**

   ```bash
   npm run build
   ```

3. **Copia los archivos a la plataforma Android**

   ```bash
   npx cap copy android
   ```

4. **Compila el APK de release**

   ```bash
   cd android
   .\gradlew assembleRelease
   ```

5. **Verifica el APK generado**

   El APK firmado se encontrará en: `android/app/build/outputs/apk/release/app-release.apk`

## Solución de problemas

### Error de firma

Si encuentras errores relacionados con la firma del APK, verifica:

- Que el archivo `gruas-key.keystore` existe en la raíz del proyecto
- Que las contraseñas y el alias son correctos
- Que el archivo `build.gradle` tiene la configuración de firma correcta

### Error de compilación

Si hay errores durante la compilación:

- Verifica que tienes JDK 17 instalado y configurado
- Asegúrate de que las variables de entorno ANDROID_HOME y JAVA_HOME están correctamente configuradas
- Revisa los logs de Gradle para identificar el problema específico

## Instalación en dispositivo

Para instalar el APK en un dispositivo Android:

1. Transfiere el archivo APK al dispositivo
2. En el dispositivo, navega hasta el archivo y tócalo para iniciar la instalación
3. Acepta los permisos necesarios

Alternativamente, puedes usar ADB para instalar el APK:

```bash
adb install -r android/app/build/outputs/apk/release/app-release.apk
```

## Notas importantes

- El keystore (`gruas-key.keystore`) debe mantenerse seguro y no debe compartirse
- Las contraseñas no deben incluirse en el control de versiones
- Para futuras actualizaciones de la app, debes usar el mismo keystore para firmar
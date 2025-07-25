@echo off
set ANDROID_HOME=C:\Users\Usuario\AppData\Local\Android\Sdk
echo ===== Iniciando proceso de compilacion y firma del APK =====

if "%KEY_ALIAS%"=="" (
    set /p KEY_ALIAS=Introduce el alias de la clave (por defecto: my-key-alias): 
    if "%KEY_ALIAS%"=="" set KEY_ALIAS=my-key-alias
)

echo ===== Compilando la aplicación web =====
call npm run build

echo ===== Copiando archivos a la plataforma Android =====
call npx cap copy android

echo ===== Compilando APK de release =====
cd android
call .\gradlew assembleRelease

REM ===== Firmando el APK =====
REM Ajusta la ruta a zipalign si es necesario (usualmente en el Android SDK build-tools)
set ZIPALIGN_PATH=%ANDROID_HOME%\build-tools\34.0.0\zipalign.exe
if not exist "%ZIPALIGN_PATH%" set ZIPALIGN_PATH=zipalign

%ZIPALIGN_PATH% -v 4 app\build\outputs\apk\release\app-release-unsigned.apk app\build\outputs\apk\release\app-release-aligned.apk

REM ===== Firma el APK alineado =====
REM Ajusta la ruta a apksigner.bat si es necesario
set APKSIGNER_PATH=%ANDROID_HOME%\build-tools\34.0.0\apksigner.bat

bash %APKSIGNER_PATH% sign --ks ..\gruas-key.keystore --ks-key-alias %KEY_ALIAS% --out app\build\outputs\apk\release\app-release-signed.apk app\build\outputs\apk\release\app-release-aligned.apk

cd ..

echo ===== Proceso completado =====
pause
#!/bin/bash
ANDROID_HOME="/c/Users/jesfa/AppData/Local/Android/Sdk"

echo "===== <> Iniciando proceso de compilacion y firma del APK <> ====="

echo "===== Compilando la aplicación web ====="
npm run build

echo "===== Copiando archivos a la plataforma Android ====="
npx cap copy android

echo "===== Compilando APK de release ====="
cd android
./gradlew assembleRelease

# ===== Firmando el APK =====
# Ajusta la ruta a zipalign si es necesario (usualmente en el Android SDK build-tools)
echo "===== Aplicando zipalign al APK ====="
ZIPALIGN_PATH="$ANDROID_HOME/build-tools/34.0.0/zipalign"
if [ ! -f "$ZIPALIGN_PATH" ]; then
  ZIPALIGN_PATH="zipalign"
fi
$ZIPALIGN_PATH -v 4 app/build/outputs/apk/release/app-release-unsigned.apk app/build/outputs/apk/release/app-release-aligned.apk

# ===== Firma el APK alineado =====
# Ajusta la ruta a apksigner.sh si es necesario
echo "===== Aplicando apksigner al APK alineado ====="
APKSIGNER_PATH="$ANDROID_HOME/build-tools/34.0.0/./apksigner.sh"
#bash $APKSIGNER_PATH sign --ks ../gruas-key.keystore --ks-key-alias "$KEY_ALIAS" --out app/build/outputs/apk/release/app-release-signed.apk app/build/outputs/apk/release/app-release-aligned.apk
bash $APKSIGNER_PATH sign --ks ../gruas-key.keystore --ks-key-alias gruastremart-key-alias --out app/build/outputs/apk/release/app-release-signed.apk app/build/outputs/apk/release/app-release-aligned.apk

cd ..
echo "===== Proceso completado ====="
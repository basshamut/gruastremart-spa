# Configuración de Assets para Capacitor

## Estructura de carpetas para iconos

Coloca tus iconos en la carpeta `resources/` con los siguientes nombres:

### Para Android:
- `icon.png` - Icono principal (debe ser cuadrado, mínimo 1024x1024px)
- `icon-foreground.png` - Parte delantera del icono adaptativo (opcional)
- `icon-background.png` - Fondo del icono adaptativo (opcional)

### Para generar todos los tamaños automáticamente:
```bash
npx @capacitor/assets generate
```

## Tamaños de iconos Android que se generarán automáticamente:

- mipmap-hdpi: 72x72px
- mipmap-mdpi: 48x48px  
- mipmap-xhdpi: 96x96px
- mipmap-xxhdpi: 144x144px
- mipmap-xxxhdpi: 192x192px

## Notas importantes:
1. El icono debe ser PNG
2. Fondo transparente para mejores resultados
3. Diseño simple y claro
4. Tamaño mínimo recomendado: 1024x1024px

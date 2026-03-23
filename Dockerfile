# Etapa 1: Construcción
FROM node:22.12-slim AS build
WORKDIR /app

# Copiamos archivos de dependencias primero para aprovechar la caché de Docker
COPY package*.json ./
RUN npm install

# Copiamos el resto del código y construimos
COPY . .
RUN npm run build

# Etapa 2: Servidor de producción (ligero)
FROM nginx:alpine
# Copiamos los archivos estáticos generados por Vite (carpeta dist)
COPY --from=build /app/dist /usr/share/nginx/html

# Copiamos una configuración básica de Nginx para React (opcional pero recomendado)
# Si no tienes un nginx.conf personalizado, Nginx usará el por defecto
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
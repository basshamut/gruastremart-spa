# Etapa 1: Construcción
FROM node:22.12-slim AS build
WORKDIR /app

RUN corepack enable && corepack prepare pnpm@latest --activate

COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

COPY . .
RUN pnpm run build

# Etapa 2: Servidor de producción
FROM nginx:alpine

# --- MAGIA AQUÍ ---
# Creamos el archivo de configuración de Nginx directamente desde el Dockerfile
RUN echo 'server { \
    listen 80; \
    location / { \
        root /usr/share/nginx/html; \
        index index.html; \
        try_files $uri $uri/ /index.html; \
    } \
}' > /etc/nginx/conf.d/default.conf
# ------------------

# Copiamos los archivos generados por Vite
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]

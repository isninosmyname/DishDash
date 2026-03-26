# Etapa 1: build
FROM node:18-alpine AS builder
WORKDIR /app
COPY . .
RUN npm install
RUN npm run build

# Etapa 2: servir con nginx
FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html

# Opcional: configuración custom de nginx
# COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
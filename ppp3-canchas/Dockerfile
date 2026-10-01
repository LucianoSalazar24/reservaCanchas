# ---- build ----
FROM node:20-alpine AS build
WORKDIR /app
# URL del gateway embebida en el bundle (build-time). El navegador corre en el
# host, por eso por defecto apunta al puerto publicado del gateway.
ARG VITE_API_URL=http://localhost:3000
ENV VITE_API_URL=$VITE_API_URL
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# ---- runtime (nginx sirve los estáticos) ----
FROM nginx:1.27-alpine AS runtime
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]

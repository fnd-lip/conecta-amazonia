FROM node:24 AS builder
WORKDIR /app

# Argumento para a URL da API
ARG VITE_API_URL=http://localhost:3001

COPY package*.json ./
RUN npm install

COPY . .
# Build com a variável de ambiente
RUN VITE_API_URL=${VITE_API_URL} npm run build

#Nginx
FROM nginx:stable
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]


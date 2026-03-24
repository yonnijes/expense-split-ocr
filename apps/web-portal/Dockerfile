FROM node:22-alpine

WORKDIR /app

# Instalar dependencias (incluye dev)
COPY package*.json ./
RUN npm install --legacy-peer-deps

# Copiar todo el repo
COPY . .

# Exponer puerto de Next/Nx
EXPOSE 4200

# Comando de desarrollo
CMD ["npx", "nx", "serve", "web-portal", "--host=0.0.0.0"]
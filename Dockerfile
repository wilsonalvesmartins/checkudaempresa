# Estágio 1: Build do Frontend (React)
FROM node:18-alpine AS builder

WORKDIR /app
# Copia configurações de dependências
COPY package*.json ./
# Instala as dependências (React, Vite, Express, etc)
RUN npm install

# Copia todo o código fonte (App.jsx, tailwind, etc)
COPY . .
# Gera a pasta /dist otimizada para produção
RUN npm run build

# Estágio 2: Setup de Produção (Backend Express)
FROM node:18-alpine

WORKDIR /app
# Copia dependências novamente apenas para rodar (production)
COPY package*.json ./
# Instala o sqlite3 (que exige compilação nativa leve)
RUN apk add --no-cache python3 make g++ && npm install --production

# Copia o server.js
COPY server.js ./
# Copia o build do Frontend do estágio anterior
COPY --from=builder /app/dist ./dist

# Cria a pasta data onde o banco SQLite ficará (e o Coolify vai montar o volume)
RUN mkdir -p /app/data

# Expõe a porta que o Express vai usar
EXPOSE 3000

# Inicia o backend
CMD ["npm", "start"]

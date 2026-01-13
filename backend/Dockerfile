FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./

RUN npm ci

COPY prisma ./prisma

RUN npx prisma generate

COPY tsconfig.json ./

COPY src ./src

RUN npm run build

FROM node:20-alpine AS production

WORKDIR /app

COPY package*.json ./

RUN npm ci --omit=dev

# Instalar tsx para executar o seed
RUN npm install -g tsx

COPY prisma ./prisma

RUN npx prisma generate

COPY --from=builder /app/build ./build

# Copiar script de inicialização e corrigir line endings
COPY start.sh ./
RUN sed -i 's/\r$//' start.sh && chmod +x start.sh

# Criar diretório para uploads
RUN mkdir uploads

EXPOSE 3001

CMD ["./start.sh"]
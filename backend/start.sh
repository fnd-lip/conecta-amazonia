#!/bin/sh

echo "Iniciando aplicação..."

# Executar migrações
echo "Aplicando migrações..."
npx prisma migrate deploy

# Executar seeds
echo "Executando seeds..."
npm run seeds

# Iniciar aplicação
echo "Iniciando servidor..."
npm start
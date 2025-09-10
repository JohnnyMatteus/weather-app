#!/bin/bash

echo "🧪 TESTANDO FRONTEND COMPLETO"
echo "================================"

echo "1. Testando HTML principal..."
curl -s http://localhost:3000/ | grep -q "App do Tempo" && echo "✅ Título em português" || echo "❌ Título não encontrado"

echo "2. Testando manifest..."
curl -s http://localhost:3000/manifest.webmanifest | grep -q "App do Tempo" && echo "✅ Manifest em português" || echo "❌ Manifest não encontrado"

echo "3. Testando favicon..."
curl -I http://localhost:3000/favicon.svg 2>/dev/null | grep -q "200 OK" && echo "✅ Favicon funcionando" || echo "❌ Favicon não encontrado"

echo "4. Testando vite.svg..."
curl -I http://localhost:3000/vite.svg 2>/dev/null | grep -q "200 OK" && echo "✅ vite.svg funcionando" || echo "❌ vite.svg não encontrado"

echo "5. Testando API de registro..."
RESPONSE=$(curl -s -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name": "Teste Frontend", "email": "teste'$(date +%s)'@test.com", "password": "123456"}')

echo "$RESPONSE" | grep -q "success.*true" && echo "✅ API de registro funcionando" || echo "❌ API de registro falhou"

echo "6. Testando headers de cache..."
curl -I http://localhost:3000/ 2>/dev/null | grep -q "no-cache" && echo "✅ Headers no-cache configurados" || echo "❌ Headers de cache não configurados"

echo ""
echo "🎯 TESTE COMPLETO FINALIZADO!"
echo "================================"

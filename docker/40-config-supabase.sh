#!/bin/sh
# Executado pelo entrypoint oficial do nginx antes de o servidor subir.
# Se SUPABASE_URL e SUPABASE_ANON_KEY forem passadas no "docker run -e",
# o config.js é reescrito com elas; senão, fica o que veio na imagem.
set -e

ARQUIVO=/usr/share/nginx/html/config.js

if [ -n "$SUPABASE_URL" ] && [ -n "$SUPABASE_ANON_KEY" ]; then
  cat > "$ARQUIVO" <<EOF2
// Gerado na subida do container a partir das variáveis de ambiente
const SUPABASE_URL = "$SUPABASE_URL";
const SUPABASE_ANON_KEY = "$SUPABASE_ANON_KEY";
EOF2
  echo "config.js gerado com SUPABASE_URL=$SUPABASE_URL"
else
  echo "SUPABASE_URL/SUPABASE_ANON_KEY não informadas: usando o config.js da imagem"
fi

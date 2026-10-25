# Imagem base: nginx em Linux Alpine (~20 MB) servindo arquivos estáticos
FROM nginx:alpine

# Só a pasta da aplicação vai para o servidor (testes e docs ficam de fora)
COPY app/ /usr/share/nginx/html/

# Script que roda na subida do container e gera o config.js
# a partir das variáveis de ambiente (ver docker/40-config-supabase.sh)
COPY docker/40-config-supabase.sh /docker-entrypoint.d/40-config-supabase.sh
RUN chmod +x /docker-entrypoint.d/40-config-supabase.sh

EXPOSE 80

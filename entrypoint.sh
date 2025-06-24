#!/bin/sh
# If both cert and key exist at their mount locations, enable HTTPS config
if [ -f /etc/ssl/certs/ssl.crt ] && [ -f /etc/ssl/private/ssl.key ]; then
  echo "✅ SSL certs found, enabling HTTPS"
  cp /etc/nginx/conf.d/default-ssl.conf /etc/nginx/conf.d/default.conf
else
  echo "⚠️  No SSL certs found, falling back to HTTP only"
  cp /etc/nginx/conf.d/default-http.conf /etc/nginx/conf.d/default.conf
fi

# Launch nginx
exec "$@"

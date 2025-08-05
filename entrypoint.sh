#!/bin/sh
set -e

# Detect whether both cert and key actually exist
if [ -f /etc/ssl/certs/ssl.crt ] && [ -f /etc/ssl/private/ssl.key ]; then
  echo "✅ SSL certs found, enabling HTTPS"
  cp /etc/nginx/conf.d/default-ssl.conf /etc/nginx/conf.d/default.conf
else
  echo "⚠️ No SSL certs found, falling back to HTTP only"
  cp /etc/nginx/conf.d/default-http.conf /etc/nginx/conf.d/default.conf
fi

# Remove everything else in conf.d so nginx only sees default.conf
rm -f /etc/nginx/conf.d/default-http.conf \
      /etc/nginx/conf.d/default-ssl.conf

# Launch nginx
exec "$@"

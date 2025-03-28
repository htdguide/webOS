#!/bin/sh
set -e

if [ -n "$SSL_PRIVATE_KEY" ] && [ -n "$SSL_CERT_CHAIN" ]; then
  # Use printf to correctly handle multiline keys
  printf "%s" "$SSL_PRIVATE_KEY" > /etc/ssl/private/ssl.key
  printf "%s" "$SSL_CERT_CHAIN" > /etc/ssl/certs/ssl.crt
else
  echo "No SSL certificates provided. Disabling SSL and using HTTP only."
  sed -iE '/^[[:space:]]*listen[[:space:]]+443[[:space:]]+ssl;/d' /etc/nginx/conf.d/default.conf
  sed -iE '/^[[:space:]]*ssl_certificate[[:space:]]+/d' /etc/nginx/conf.d/default.conf
  sed -iE '/^[[:space:]]*ssl_certificate_key[[:space:]]+/d' /etc/nginx/conf.d/default.conf
fi

exec nginx -g "daemon off;"

#!/bin/sh
set -e

if [ -n "$SSL_PRIVATE_KEY" ] && [ -n "$SSL_CERT_CHAIN" ]; then
  # Use printf to correctly handle multiline keys
  printf "%s" "$SSL_PRIVATE_KEY" > /etc/ssl/private/ssl.key
  printf "%s" "$SSL_CERT_CHAIN" > /etc/ssl/certs/ssl.crt
else
  echo "No SSL certificates provided. Disabling SSL and using HTTP only."
  # Remove any line containing "443 ssl;" to disable SSL listening
  sed -i '/443 ssl;/d' /etc/nginx/conf.d/default.conf
  # Remove any lines that contain SSL certificate directives
  sed -i '/ssl_certificate/d' /etc/nginx/conf.d/default.conf
  sed -i '/ssl_certificate_key/d' /etc/nginx/conf.d/default.conf
fi

exec nginx -g "daemon off;"

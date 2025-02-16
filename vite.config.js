import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import fs from 'fs';

// https://vitejs.dev/config/
export default defineConfig(() => {
  // Load environment variables from process.env
  const key = process.env.SSL_PRIVATE_KEY;
  const cert = process.env.SSL_CERT_CHAIN;

  // Create temporary files for key and cert if they exist
  const keyFile = key ? './ssl-key.pem' : '';
  const certFile = cert ? './ssl-cert.pem' : '';

  if (key && cert) {
    fs.writeFileSync(keyFile, key);
    fs.writeFileSync(certFile, cert);
  }

  return {
    server: {
      https: key && cert ? { key: fs.readFileSync(keyFile), cert: fs.readFileSync(certFile) } : false
    },
    plugins: [react()]
  };
});

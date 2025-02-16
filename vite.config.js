import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import fs from 'fs';

// Load SSL certificates from environment variables
const sslKeyPath = process.env.SSL_PRIVATE_KEY;
const sslCertPath = process.env.SSL_CERT_CHAIN;

// Check if certificates exist
let httpsConfig = false;
if (sslKeyPath && sslCertPath && fs.existsSync(sslKeyPath) && fs.existsSync(sslCertPath)) {
  httpsConfig = {
    key: fs.readFileSync(sslKeyPath),
    cert: fs.readFileSync(sslCertPath),
  };
}

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 443,
    https: httpsConfig,
  },
});

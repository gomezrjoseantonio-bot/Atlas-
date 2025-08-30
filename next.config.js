/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  trailingSlash: true,
  images: {
    unoptimized: true
  },
  webpack: (config, { isServer }) => {
    // Enhanced webpack configuration for better Tesseract.js support
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
        crypto: false,
        stream: false,
        util: false,
      };
      
      // Ensure proper handling of workers and WebAssembly
      config.output.webassemblyModuleFilename = 'static/wasm/[modulehash].wasm';
      config.experiments = {
        ...config.experiments,
        asyncWebAssembly: true,
      };
    }
    
    return config;
  },
  // Allow loading workers and WASM files
  assetPrefix: process.env.NODE_ENV === 'production' ? '' : '',
  async headers() {
    return [
      {
        source: '/ocr/(.*)',
        headers: [
          {
            key: 'Cross-Origin-Embedder-Policy',
            value: 'credentialless'
          },
          {
            key: 'Cross-Origin-Opener-Policy',
            value: 'same-origin'
          }
        ]
      }
    ];
  }
}

module.exports = nextConfig
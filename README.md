# MC Map Generator Service

A standalone microservice that generates high-quality Minecraft biome maps from seeds using Puppeteer automation.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation
```bash
npm install
```

### Development
```bash
npm run dev
```

### Production
```bash
npm start
```

## 📡 API Endpoints

### Generate Map
```http
POST /api/generate
Content-Type: application/json

{
  "seed": "12345",
  "dimension": "overworld"
}
```

### Check Status
```http
GET /api/status/{jobId}
```

### Health Check
```http
GET /api/health
```

## 🏗 Project Structure

```
mc-map-generator/
├── src/
│   ├── server.js          # Express API server
│   ├── screenshot.js       # Puppeteer map generation
│   ├── storage.js          # Image storage utilities
│   └── utils.js            # Helper functions
├── generated-maps/         # Ephemeral image storage
├── package.json
├── railway.json           # Railway deployment config
└── .env.example           # Environment variables template
```

## 🔧 Environment Variables

Copy `.env.example` to `.env` and configure:

```bash
PORT=3000
NODE_ENV=production
MAX_CONCURRENT_JOBS=3
```

## 🚀 Deployment

### Railway
1. Connect your GitHub repository to Railway
2. Railway will automatically detect the `railway.json` configuration
3. Set environment variables in Railway dashboard
4. Deploy!

## 📝 Features

- ✅ Generate maps from any valid seed
- ✅ Support all three dimensions (overworld, nether, end)
- ✅ High-quality 1000x1000 images
- ✅ Concurrent job handling (3 simultaneous)
- ✅ Railway deployment ready
- ✅ Ephemeral storage (MVP)

## 🎯 MVP Status

This is the MVP version with:
- 8k world size only
- Ephemeral storage (files lost on deployment)
- Basic functionality
- Railway deployment ready

## 🔮 Future Enhancements

- 16k world size support
- Persistent storage (AWS S3)
- File cleanup processes
- Advanced monitoring
- Caching strategies

## 📊 Monitoring

- Health check: `/api/health`
- Service stats: `/api/stats`
- Job cleanup: `/api/cleanup`

## 🐛 Troubleshooting

1. **Server won't start**: Check Node.js version (18+ required)
2. **Map generation fails**: Check Puppeteer installation
3. **Memory issues**: Reduce `MAX_CONCURRENT_JOBS`
4. **Deployment issues**: Check Railway logs and environment variables

## 📄 License

MIT

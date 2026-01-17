# Closeness Decoder

Secure file sharing with presigned URLs.

## Structure

| Folder | Tech | Deploy |
|--------|------|--------|
| `backend/` | Spring Boot + Maven | Koyeb |
| `frontend/` | React + TypeScript | Vercel |
| `worker/` | TypeScript (Cloudflare) | Cloudflare |

## Quick Start

```bash
# Backend
cd backend && ./mvnw spring-boot:run

# Frontend
cd frontend && npm run dev

# Worker
cd worker && npm run dev
```

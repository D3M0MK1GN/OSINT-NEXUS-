# INTELCRIM - Sistema de Inteligencia Criminal

## Overview
A criminal intelligence system (Sistema de Inteligencia Criminal) built with a full-stack TypeScript architecture. It provides case management, traceability analysis, database management, reports, and alerts for criminal investigations.

## Project Architecture
- **Frontend**: React 18 + Vite + TypeScript + Tailwind CSS + shadcn/ui components
- **Backend**: Express 5 (TypeScript) serving both API and frontend
- **Database**: PostgreSQL with Drizzle ORM
- **Routing**: wouter (client-side), Express (server-side API)
- **State Management**: TanStack React Query

## Project Structure
```
client/          - React frontend
  src/
    components/  - UI components (shadcn/ui based)
    pages/       - Page components
    hooks/       - Custom React hooks
    lib/         - Utility functions
server/          - Express backend
  index.ts       - Server entry point (port 5000)
  routes.ts      - API routes
  storage.ts     - Data storage layer
  db.ts          - Database connection
  vite.ts        - Vite dev server middleware
  static.ts      - Static file serving (production)
shared/          - Shared code (frontend + backend)
  schema.ts      - Drizzle database schema
  routes.ts      - Shared route definitions
script/
  build.ts       - Production build script
```

## Key Configuration
- Server runs on port 5000 (0.0.0.0)
- Database: PostgreSQL via DATABASE_URL env var
- Dev: `npm run dev` (tsx + Vite HMR)
- Build: `npm run build` (esbuild + Vite)
- Production: `npm run start` (Node.js)
- Schema push: `npm run db:push`

## Database Schema
- **personas_casos**: Case/person records with investigation details
- **persona_telefonos**: Phone numbers linked to persons
- **registros_comunicacion**: Communication records (CDR data)
